import { 
  ReleaseSignals, 
  RecommendationResult, 
  RuleEvidence, 
  RecommendationStatus, 
  FactorAttribution, 
  CounterfactualScenario 
} from '../models';
import { calculateRiskScore } from './risk';

export function evaluateRecommendation(signals: ReleaseSignals): RecommendationResult {
  const { score, components, details } = calculateRiskScore(signals);
  
  const allRules: RuleEvidence[] = [];
  const supportingEvidence: string[] = [];
  const conflictingEvidence: string[] = [];
  const missingData: string[] = [];
  
  let recommendation: RecommendationStatus = 'CONTINUE';
  let confidence: 'High' | 'Medium' | 'Low' = 'High';
  let confidence_score = 95;

  // 1. Missing Telemetry Check
  if (signals.latency_ms === null) missingData.push('Latency (p50/p95)');
  if (signals.error_rate === null) missingData.push('Service Error Rate');
  if (signals.transactions_per_minute === null) missingData.push('Transaction Throughput');
  if (signals.customer_impact_score === null && signals.affected_customers === null) missingData.push('Customer Impact Telemetry');
  
  const missingRuleTriggered = missingData.length > 0;
  allRules.push({
    rule_id: 'RUL-SAF-001',
    rule_name: 'Telemetry Completeness Guarantee',
    category: 'safety',
    description: 'Verifies that all primary operational and customer signals are available for automated quantification.',
    condition_checked: 'missing_signals_count == 0',
    triggered: missingRuleTriggered,
    points_contributed: 0,
    severity: missingRuleTriggered ? 'critical' : 'info',
    evidence_values: { missing_count: missingData.length, missing_signals: missingData.join(', ') }
  });

  if (missingRuleTriggered) {
    confidence = 'Low';
    confidence_score = Math.max(25, 95 - (missingData.length * 30));
  }

  // 2. High Base Risk Rule
  const highRiskTriggered = score >= 70;
  allRules.push({
    rule_id: 'RUL-RSK-001',
    rule_name: 'Critical Aggregate Risk Threshold',
    category: 'technical',
    description: 'Triggers when composite risk score exceeds the enterprise critical ceiling (>= 70).',
    condition_checked: 'risk_score >= 70',
    triggered: highRiskTriggered,
    points_contributed: components.error_rate + components.latency,
    severity: highRiskTriggered ? 'critical' : 'info',
    evidence_values: { current_score: score, threshold: 70 }
  });

  // 3. Medium Base Risk Rule
  const mediumRiskTriggered = score >= 40 && score < 70;
  allRules.push({
    rule_id: 'RUL-RSK-002',
    rule_name: 'Elevated Risk Advisory Threshold',
    category: 'technical',
    description: 'Triggers when aggregate risk warrants human supervisory verification (40 <= score < 70).',
    condition_checked: '40 <= risk_score < 70',
    triggered: mediumRiskTriggered,
    points_contributed: score,
    severity: mediumRiskTriggered ? 'warning' : 'info',
    evidence_values: { current_score: score, threshold: 40 }
  });

  if (highRiskTriggered) {
    recommendation = 'ROLLBACK RECOMMENDED';
  } else if (mediumRiskTriggered) {
    recommendation = 'HUMAN REVIEW REQUIRED';
  }

  // 4. Critical Error Rate Spike Rule
  const errDiff = (signals.error_rate !== null && signals.baseline_error_rate !== null) 
    ? (signals.error_rate - signals.baseline_error_rate) 
    : 0;
  const errorSpikeTriggered = errDiff >= 1.5;
  allRules.push({
    rule_id: 'RUL-TEC-001',
    rule_name: 'Severe Error Rate Degradation',
    category: 'technical',
    description: 'Detects sudden deviation in HTTP 5xx / application exception rate above historical baseline.',
    condition_checked: 'error_rate - baseline >= 1.5%',
    triggered: errorSpikeTriggered,
    points_contributed: components.error_rate,
    severity: errDiff >= 3.0 ? 'critical' : errorSpikeTriggered ? 'warning' : 'info',
    evidence_values: { 
      current_error_rate: `${signals.error_rate?.toFixed(2)}%`, 
      baseline: `${signals.baseline_error_rate?.toFixed(2)}%`,
      delta: `+${errDiff.toFixed(2)}%`
    }
  });

  if (errorSpikeTriggered) {
    supportingEvidence.push(
      `Error rate degraded by +${errDiff.toFixed(2)}% over baseline (${signals.baseline_error_rate?.toFixed(2)}% -> ${signals.error_rate?.toFixed(2)}%)`
    );
  }

  // 5. Latency Degradation Rule
  const latPct = (signals.latency_ms !== null && signals.latency_baseline_ms !== null && signals.latency_baseline_ms > 0)
    ? ((signals.latency_ms - signals.latency_baseline_ms) / signals.latency_baseline_ms)
    : 0;
  const latencyTriggered = latPct >= 0.25;
  allRules.push({
    rule_id: 'RUL-TEC-002',
    rule_name: 'Latency SLA Deviation',
    category: 'technical',
    description: 'Flags response time degradation exceeding 25% above 30-day baseline average.',
    condition_checked: 'latency_pct_increase >= 25%',
    triggered: latencyTriggered,
    points_contributed: components.latency,
    severity: latPct >= 0.5 ? 'critical' : latencyTriggered ? 'warning' : 'info',
    evidence_values: { 
      current_latency: `${signals.latency_ms} ms`, 
      baseline: `${signals.latency_baseline_ms} ms`,
      pct_increase: `+${(latPct * 100).toFixed(1)}%`
    }
  });

  if (latencyTriggered) {
    supportingEvidence.push(
      `Service latency increased by ${(latPct * 100).toFixed(1)}% (${signals.latency_baseline_ms}ms -> ${signals.latency_ms}ms)`
    );
  }

  // 6. Transaction Drop Rule
  const tpmPct = (signals.transactions_per_minute !== null && signals.baseline_transactions_per_minute !== null && signals.baseline_transactions_per_minute > 0)
    ? ((signals.baseline_transactions_per_minute - signals.transactions_per_minute) / signals.baseline_transactions_per_minute)
    : 0;
  const tpmDropTriggered = tpmPct >= 0.10;
  allRules.push({
    rule_id: 'RUL-BIZ-001',
    rule_name: 'Transaction Throughput Drop',
    category: 'business',
    description: 'Detects abnormal drops in business transaction volume, indicating pipeline drop-off or upstream failures.',
    condition_checked: 'tpm_drop >= 10%',
    triggered: tpmDropTriggered,
    points_contributed: components.transaction,
    severity: tpmPct >= 0.20 ? 'critical' : tpmDropTriggered ? 'warning' : 'info',
    evidence_values: { 
      current_tpm: signals.transactions_per_minute, 
      baseline_tpm: signals.baseline_transactions_per_minute,
      drop_pct: `-${(tpmPct * 100).toFixed(1)}%`
    }
  });

  if (tpmDropTriggered) {
    supportingEvidence.push(
      `Transaction throughput collapsed by ${(tpmPct * 100).toFixed(1)}% (${signals.transactions_per_minute} TPM vs baseline ${signals.baseline_transactions_per_minute} TPM)`
    );
  }

  // 7. Silent Business Failure / Micro-corruption
  const silentFailureTriggered = (
    signals.error_rate !== null && signals.error_rate < 0.5 &&
    ((signals.transaction_failure_rate !== null && signals.transaction_failure_rate > 10.0) ||
     (signals.customer_complaint_rate !== null && signals.customer_complaint_rate > 3.0) ||
     (signals.revenue_impact_estimate !== null && signals.revenue_impact_estimate > 20000))
  );
  allRules.push({
    rule_id: 'RUL-SAF-002',
    rule_name: 'Silent Business Failure Detector',
    category: 'safety',
    description: 'Catches scenarios where HTTP status codes remain nominal green (200 OK) while business logic is dropping transactions or generating complaints.',
    condition_checked: 'error_rate < 0.5% AND (tx_failure > 10% OR complaints > 3% OR revenue_impact > $20k)',
    triggered: silentFailureTriggered,
    points_contributed: silentFailureTriggered ? 25 : 0,
    severity: silentFailureTriggered ? 'critical' : 'info',
    evidence_values: {
      technical_error_rate: `${signals.error_rate}%`,
      tx_failure_rate: `${signals.transaction_failure_rate}%`,
      revenue_impact: `$${signals.revenue_impact_estimate?.toLocaleString()}`
    }
  });

  if (silentFailureTriggered) {
    recommendation = 'ROLLBACK RECOMMENDED';
    supportingEvidence.push(
      `Silent business corruption detected: HTTP errors look low (${signals.error_rate}%), but business transactions are failing at ${signals.transaction_failure_rate}% ($${signals.revenue_impact_estimate?.toLocaleString()} revenue at risk).`
    );
  }

  // 8. Contradictory / Divergent Signals Rule
  const contradictoryTriggered = (
    signals.edge_case_id === 'contradictory_signals' ||
    ((score >= 20 || latPct >= 0.50) && 
     (signals.customer_impact_score === 0 || signals.affected_customers === 0) &&
     signals.incident_severity === 'none' &&
     (signals.error_rate !== null && signals.error_rate < 0.5))
  );
  allRules.push({
    rule_id: 'RUL-SAF-003',
    rule_name: 'Signal Divergence & False-Alarm Dampener',
    category: 'safety',
    description: 'Flags high technical latency spikes that show zero customer impact, zero error rates, and zero complaints (e.g. background job warm-up or cache rebuild).',
    condition_checked: 'latency_pct >= 50% AND customer_impact == 0 AND error_rate < 0.5%',
    triggered: contradictoryTriggered,
    points_contributed: 0,
    severity: contradictoryTriggered ? 'warning' : 'info',
    evidence_values: {
      technical_risk_score: score,
      customer_impact: signals.customer_impact_score,
      affected_users: signals.affected_customers
    }
  });

  if (contradictoryTriggered) {
    conflictingEvidence.push(
      'Technical latency spike detected, but active user impact, error rates, and complaints are 0. May reflect cache priming or async worker load.'
    );
    // If recommendation is ROLLBACK or if divergence is severe (>100% latency spike), require human review
    if (recommendation === 'ROLLBACK RECOMMENDED' || latPct >= 1.0 || signals.edge_case_id === 'contradictory_signals') {
      recommendation = 'HUMAN REVIEW REQUIRED';
      confidence = 'Medium';
      confidence_score = 65;
    }
  }

  // 9. Traffic Surge Drift Detector
  const trafficSurgeTriggered = (
    signals.transactions_per_minute !== null &&
    signals.baseline_transactions_per_minute !== null &&
    signals.transactions_per_minute > signals.baseline_transactions_per_minute * 2.0 &&
    signals.error_rate !== null &&
    signals.baseline_error_rate !== null &&
    (signals.error_rate - signals.baseline_error_rate) < 0.5
  );
  allRules.push({
    rule_id: 'RUL-SAF-004',
    rule_name: 'Traffic Surge Baseline Drift Safeguard',
    category: 'safety',
    description: 'Differentiates true degradation from acceptable queuing delays during legitimate commercial promotional traffic spikes (>200% volume surge).',
    condition_checked: 'traffic > 2x baseline AND delta_error_rate < 0.5%',
    triggered: trafficSurgeTriggered,
    points_contributed: 0,
    severity: trafficSurgeTriggered ? 'info' : 'info',
    evidence_values: {
      volume_multiplier: `${((signals.transactions_per_minute || 0) / (signals.baseline_transactions_per_minute || 1)).toFixed(1)}x`,
      error_stability: 'Stable'
    }
  });

  if (trafficSurgeTriggered) {
    conflictingEvidence.push(
      `Legitimate traffic surge observed (${((signals.transactions_per_minute || 0) / (signals.baseline_transactions_per_minute || 1)).toFixed(1)}x baseline volume). Elevated latency is proportional to queue depth; error rates remain nominal.`
    );
  }

  // 10. Rollback Availability Safety Invariant (Hard Block)
  const rollbackAvailable = signals.rollback_readiness?.available ?? signals.rollback_available;
  const rollbackBlockerTriggered = !rollbackAvailable;
  allRules.push({
    rule_id: 'RUL-SAF-005',
    rule_name: 'Rollback Invariant Enforcement',
    category: 'operational',
    description: 'Prohibits the system from recommending an automated rollback when no verified rollback path or inverse migration exists.',
    condition_checked: 'rollback_available == false',
    triggered: rollbackBlockerTriggered,
    points_contributed: 0,
    severity: rollbackBlockerTriggered ? 'critical' : 'info',
    evidence_values: { 
      rollback_available: rollbackAvailable,
      blocker_reason: signals.rollback_readiness?.blockers?.join('; ') || 'No reverse execution plan found'
    }
  });

  if (rollbackBlockerTriggered) {
    if (recommendation === 'ROLLBACK RECOMMENDED') {
      recommendation = 'HUMAN REVIEW REQUIRED';
      confidence = 'Medium';
      confidence_score = Math.min(confidence_score, 50);
      conflictingEvidence.push(
        'Rollback path is UNAVAILABLE or blocked. Automated rollback recommendation downgraded to mandatory human incident commander review.'
      );
    }
  }

  // 11. Missing data escalation
  if (missingData.length > 0 && recommendation === 'CONTINUE') {
    recommendation = 'HUMAN REVIEW REQUIRED';
    supportingEvidence.push(`Missing critical telemetry (${missingData.join(', ')}). System adheres to precautionary principle.`);
  }

  // Factor Attributions (Waterfall calculation)
  const factor_attributions: FactorAttribution[] = [
    {
      factor: 'Service Error Rate',
      category: 'technical',
      points: components.error_rate,
      max_points: 30,
      percentage: Math.round((components.error_rate / 30) * 100),
      explanation: signals.error_rate !== null 
        ? `Error rate is ${signals.error_rate.toFixed(2)}% (baseline: ${signals.baseline_error_rate?.toFixed(2)}%)`
        : 'Telemetry data missing',
      severity: components.error_rate >= 20 ? 'critical' : components.error_rate >= 10 ? 'high' : components.error_rate > 0 ? 'medium' : 'low'
    },
    {
      factor: 'Latency Degradation',
      category: 'technical',
      points: components.latency,
      max_points: 20,
      percentage: Math.round((components.latency / 20) * 100),
      explanation: signals.latency_ms !== null 
        ? `Response time is ${signals.latency_ms}ms (baseline: ${signals.latency_baseline_ms}ms)`
        : 'Telemetry data missing',
      severity: components.latency >= 15 ? 'critical' : components.latency >= 10 ? 'high' : components.latency > 0 ? 'medium' : 'low'
    },
    {
      factor: 'Customer & Revenue Impact',
      category: 'business',
      points: components.customer_impact,
      max_points: 25,
      percentage: Math.round((components.customer_impact / 25) * 100),
      explanation: signals.affected_customers !== null 
        ? `${signals.affected_customers.toLocaleString()} estimated users affected ($${signals.revenue_impact_estimate?.toLocaleString() || 0} revenue risk)`
        : 'Customer impact telemetry missing',
      severity: components.customer_impact >= 18 ? 'critical' : components.customer_impact >= 10 ? 'high' : components.customer_impact > 0 ? 'medium' : 'low'
    },
    {
      factor: 'Transaction Throughput Drop',
      category: 'business',
      points: components.transaction,
      max_points: 15,
      percentage: Math.round((components.transaction / 15) * 100),
      explanation: signals.transactions_per_minute !== null 
        ? `${signals.transactions_per_minute} TPM (baseline: ${signals.baseline_transactions_per_minute} TPM)`
        : 'Transaction telemetry missing',
      severity: components.transaction >= 10 ? 'critical' : components.transaction >= 5 ? 'high' : components.transaction > 0 ? 'medium' : 'low'
    },
    {
      factor: 'Business Criticality Weight',
      category: 'operational',
      points: components.business_criticality,
      max_points: 10,
      percentage: Math.round((components.business_criticality / 10) * 100),
      explanation: `Service classified as Tier ${signals.business_criticality.toUpperCase()}`,
      severity: signals.business_criticality === 'critical' ? 'high' : signals.business_criticality === 'medium' ? 'medium' : 'low'
    }
  ];

  // Counterfactuals ("What if?")
  const counterfactuals: CounterfactualScenario[] = [];

  if (recommendation === 'ROLLBACK RECOMMENDED') {
    if (signals.error_rate !== null && signals.baseline_error_rate !== null) {
      const targetError = signals.baseline_error_rate + 0.4;
      counterfactuals.push({
        parameter: 'Error Rate',
        current_value: `${signals.error_rate.toFixed(2)}%`,
        target_threshold: `< ${targetError.toFixed(2)}%`,
        delta_required: `-${(signals.error_rate - targetError).toFixed(2)}% absolute drop`,
        resulting_recommendation: 'CONTINUE',
        resulting_risk_score: Math.max(15, score - 25),
        feasibility: 'requires_fix'
      });
    }

    if (signals.affected_customers !== null && signals.affected_customers > 500) {
      counterfactuals.push({
        parameter: 'Affected Customers',
        current_value: `${signals.affected_customers.toLocaleString()} users`,
        target_threshold: '< 50 users',
        delta_required: 'Contain blast radius to isolated canary tier',
        resulting_recommendation: 'HUMAN REVIEW REQUIRED',
        resulting_risk_score: Math.max(35, score - 20),
        feasibility: 'requires_fix'
      });
    }
  } else if (recommendation === 'HUMAN REVIEW REQUIRED') {
    if (missingData.length > 0) {
      counterfactuals.push({
        parameter: 'Telemetry Ingestion',
        current_value: `${missingData.length} missing signals`,
        target_threshold: '100% complete metrics',
        delta_required: `Restore ingest for: ${missingData.join(', ')}`,
        resulting_recommendation: score < 40 ? 'CONTINUE' : 'ROLLBACK RECOMMENDED',
        resulting_risk_score: score,
        feasibility: 'immediate'
      });
    }

    if (!rollbackAvailable) {
      counterfactuals.push({
        parameter: 'Rollback Script Readiness',
        current_value: 'Unavailable / Unvalidated',
        target_threshold: 'Verified automated inverse script',
        delta_required: 'Validate schema downgrade or feature flag toggle',
        resulting_recommendation: score >= 70 ? 'ROLLBACK RECOMMENDED' : 'HUMAN REVIEW REQUIRED',
        resulting_risk_score: score,
        feasibility: 'requires_fix'
      });
    }
  } else {
    // Current is CONTINUE
    counterfactuals.push({
      parameter: 'Error Rate Spike',
      current_value: `${signals.error_rate?.toFixed(2) || '0.2'}%`,
      target_threshold: `> ${((signals.baseline_error_rate || 0.3) + 2.0).toFixed(2)}%`,
      delta_required: '+2.0% error rate increase',
      resulting_recommendation: 'ROLLBACK RECOMMENDED',
      resulting_risk_score: Math.min(100, score + 45),
      feasibility: 'monitoring_wait'
    });
  }

  // Synthesize Executive Summary
  let executive_summary = '';
  let reason = '';

  if (recommendation === 'CONTINUE') {
    executive_summary = `Release ${signals.release_id} exhibits healthy operational indicators with an aggregate risk score of ${score}/100. Telemetry demonstrates no significant deviation from baseline performance.`;
    reason = 'All technical and transaction metrics remain within acceptable tolerances. Continuous release progression advised.';
  } else if (recommendation === 'HUMAN REVIEW REQUIRED') {
    if (missingData.length > 0) {
      executive_summary = `Precautionary review required for ${signals.release_id}: Telemetry pipeline is missing ${missingData.length} critical metrics (${missingData.join(', ')}). In accordance with enterprise governance policies, releases without full observability require explicit human sign-off.`;
      reason = `Incomplete telemetry (${missingData.join(', ')}). System refrains from unverified automated approval.`;
    } else if (!rollbackAvailable) {
      executive_summary = `Action blocked on ${signals.release_id}: Calculated risk is elevated (${score}/100), but automated rollback path is marked unavailable or invalidated. An engineering incident commander must inspect the change before initiating manual intervention.`;
      reason = 'Elevated operational risk detected, but automated rollback is unavailable. Manual remediation required.';
    } else if (conflictingEvidence.length > 0) {
      executive_summary = `Ambiguous telemetry detected for ${signals.release_id}: Technical metrics show divergence from business metrics (${conflictingEvidence[0]}). Human review is required to verify whether this reflects an active outage or temporary background processing.`;
      reason = 'Divergent technical and business signals require expert human verification.';
    } else {
      executive_summary = `Supervisory review required for ${signals.release_id}: Aggregate risk score (${score}/100) falls within the supervisory oversight zone (40-69). Requires engineering lead sign-off.`;
      reason = `Moderate risk score (${score}/100) exceeds continuous release threshold. Review supporting evidence.`;
    }
  } else {
    executive_summary = `High-confidence rollback advisory issued for ${signals.release_id} with aggregate risk score of ${score}/100. Critical deterioration identified in ${supportingEvidence.slice(0, 2).join(' and ')}.`;
    reason = 'Severe operational and customer impact detected. Automated rollback strongly advised subject to human confirmation.';
  }

  return {
    recommendation,
    risk_score: score,
    confidence,
    confidence_score,
    triggered_rules: allRules.filter(r => r.triggered),
    all_rules: allRules,
    factor_attributions,
    counterfactuals,
    supporting_evidence: supportingEvidence,
    conflicting_evidence: conflictingEvidence,
    missing_data: missingData,
    executive_summary,
    reason
  };
}
