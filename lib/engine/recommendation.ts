import { ReleaseSignals, RecommendationResult, RuleEvidence, RecommendationStatus } from '../models';
import { calculateRiskScore } from './risk';

export function evaluateRecommendation(signals: ReleaseSignals): RecommendationResult {
  const { score, components } = calculateRiskScore(signals);
  
  const triggeredRules: RuleEvidence[] = [];
  const supportingEvidence: string[] = [];
  const conflictingEvidence: string[] = [];
  const missingData: string[] = [];
  
  let recommendation: RecommendationStatus = 'CONTINUE';
  let confidence: 'High' | 'Medium' | 'Low' = 'High';

  // Check for missing telemetry
  if (signals.latency_ms === null) missingData.push('Latency');
  if (signals.error_rate === null) missingData.push('Error Rate');
  if (signals.transactions_per_minute === null) missingData.push('Transaction Rate');
  if (signals.customer_impact_score === null) missingData.push('Customer Impact Score');
  
  if (missingData.length > 0) {
    confidence = 'Low';
    triggeredRules.push({
      rule_name: 'Missing Telemetry Data',
      description: 'Critical signals required for a confident decision are missing.',
      triggered: true,
      evidence_values: { missing: missingData.join(', ') }
    });
  }

  // Base Risk Rules
  if (score >= 70) {
    recommendation = 'ROLLBACK RECOMMENDED';
    triggeredRules.push({
      rule_name: 'High Base Risk',
      description: 'The overall risk score exceeded the critical threshold (70).',
      triggered: true,
      evidence_values: { score }
    });
  } else if (score >= 40) {
    recommendation = 'HUMAN REVIEW REQUIRED';
    triggeredRules.push({
      rule_name: 'Medium Base Risk',
      description: 'The overall risk score requires human oversight (>= 40).',
      triggered: true,
      evidence_values: { score }
    });
  }

  // Evidence Rules
  const errDiff = signals.error_rate !== null && signals.baseline_error_rate !== null ? (signals.error_rate - signals.baseline_error_rate) : 0;
  const latDiff = signals.latency_ms !== null && signals.latency_baseline_ms !== null ? ((signals.latency_ms - signals.latency_baseline_ms) / signals.latency_baseline_ms) : 0;
  
  // High Error Rate Deterioration
  if (errDiff > 3.0) {
    triggeredRules.push({
      rule_name: 'Critical Error Rate Spike',
      description: 'Error rate increased significantly above baseline.',
      triggered: true,
      evidence_values: { current: signals.error_rate, baseline: signals.baseline_error_rate }
    });
    supportingEvidence.push(`Error rate increased from ${signals.baseline_error_rate}% to ${signals.error_rate}%`);
  }

  // High Latency
  if (latDiff > 0.25) {
    triggeredRules.push({
      rule_name: 'High Latency Deterioration',
      description: 'Latency increased significantly above baseline.',
      triggered: true,
      evidence_values: { current: signals.latency_ms, baseline: signals.latency_baseline_ms }
    });
    supportingEvidence.push(`Latency increased from ${signals.latency_baseline_ms} ms to ${signals.latency_ms} ms`);
  }

  // Customer Impact
  if (signals.customer_impact_score !== null && signals.customer_impact_score > 50) {
    triggeredRules.push({
      rule_name: 'High Customer Impact',
      description: 'Significant customer impact detected.',
      triggered: true,
      evidence_values: { impact_score: signals.customer_impact_score, affected_customers: signals.affected_customers }
    });
    supportingEvidence.push(`Approximately ${signals.affected_customers} customers are affected`);
    
    if (signals.business_criticality === 'critical' && recommendation !== 'ROLLBACK RECOMMENDED') {
      recommendation = 'HUMAN REVIEW REQUIRED';
      triggeredRules.push({
        rule_name: 'Critical Service Impact',
        description: 'Customer impact on a business critical service requires review.',
        triggered: true,
        evidence_values: { business_criticality: 'critical' }
      });
      supportingEvidence.push('Service is classified as business-critical');
    }
  }

  // Contradictory signals rule (e.g., high technical degradation but no customer impact)
  if (score > 50 && (signals.customer_impact_score === 0 || signals.affected_customers === 0)) {
    conflictingEvidence.push('Technical metrics are degraded, but customer impact is currently 0.');
    if (recommendation === 'ROLLBACK RECOMMENDED') {
       recommendation = 'HUMAN REVIEW REQUIRED'; // Downgrade due to lack of business impact
       confidence = 'Medium';
       triggeredRules.push({
         rule_name: 'Contradictory Signals',
         description: 'High technical risk but zero customer impact requires human review.',
         triggered: true,
         evidence_values: { score, impact: signals.customer_impact_score }
       });
    }
  }

  // Rollback Availability (Hard Override)
  if (!signals.rollback_available) {
    if (recommendation === 'ROLLBACK RECOMMENDED') {
      recommendation = 'HUMAN REVIEW REQUIRED';
      triggeredRules.push({
        rule_name: 'Rollback Unavailable',
        description: 'Automatic rollback path is unavailable.',
        triggered: true,
        evidence_values: { rollback_available: false }
      });
      conflictingEvidence.push('Cannot execute rollback because rollback path is unavailable.');
    }
  }

  // If data is missing, we must review
  if (missingData.length > 0 && recommendation === 'CONTINUE') {
     recommendation = 'HUMAN REVIEW REQUIRED';
  }

  // Compile final reason
  let reason = '';
  if (recommendation === 'CONTINUE') {
    reason = 'Risk is within acceptable parameters. No significant degradation detected.';
  } else if (recommendation === 'HUMAN REVIEW REQUIRED') {
    if (missingData.length > 0) reason = 'Insufficient evidence - human review required.';
    else if (!signals.rollback_available) reason = 'HUMAN REVIEW REQUIRED — rollback path unavailable.';
    else if (conflictingEvidence.length > 0) reason = 'Conflicting signals detected. Human review required.';
    else reason = 'Medium risk detected requiring human oversight.';
  } else {
    reason = 'Significant technical and/or business degradation detected. Rollback strongly advised.';
  }

  return {
    recommendation,
    risk_score: score,
    confidence,
    triggered_rules: triggeredRules,
    supporting_evidence: supportingEvidence,
    conflicting_evidence: conflictingEvidence,
    missing_data: missingData,
    reason
  };
}
