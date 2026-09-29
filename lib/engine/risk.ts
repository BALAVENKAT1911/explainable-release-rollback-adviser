import { ReleaseSignals } from '../models';

export interface RiskScoreResult {
  score: number;
  components: {
    latency: number;
    error_rate: number;
    transaction: number;
    customer_impact: number;
    business_criticality: number;
  };
  details: {
    latency_pct_change: number | null;
    error_rate_abs_diff: number | null;
    tpm_pct_drop: number | null;
    customer_impact_score: number | null;
    criticality_multiplier: number;
  };
}

export function calculateRiskScore(signals: ReleaseSignals): RiskScoreResult {
  const components = {
    latency: 0,
    error_rate: 0,
    transaction: 0,
    customer_impact: 0,
    business_criticality: 0
  };

  let latency_pct_change: number | null = null;
  let error_rate_abs_diff: number | null = null;
  let tpm_pct_drop: number | null = null;

  // 1. Latency deterioration (Max 20 points)
  if (signals.latency_ms !== null && signals.latency_baseline_ms !== null && signals.latency_baseline_ms > 0) {
    latency_pct_change = (signals.latency_ms - signals.latency_baseline_ms) / signals.latency_baseline_ms;
    if (latency_pct_change > 0.50) { 
      components.latency = 20; 
    } else if (latency_pct_change >= 0.25) { 
      components.latency = 15; 
    } else if (latency_pct_change >= 0.10) { 
      components.latency = 10; 
    } else if (latency_pct_change > 0) { 
      components.latency = 5; 
    }
  }

  // 2. Error-rate deterioration (Max 30 points)
  if (signals.error_rate !== null && signals.baseline_error_rate !== null) {
    error_rate_abs_diff = signals.error_rate - signals.baseline_error_rate;
    if (error_rate_abs_diff > 3.0) { 
      components.error_rate = 30; 
    } else if (error_rate_abs_diff >= 1.5) { 
      components.error_rate = 20; 
    } else if (error_rate_abs_diff >= 0.5) { 
      components.error_rate = 12; 
    } else if (error_rate_abs_diff > 0.1) { 
      components.error_rate = 5; 
    }
  }

  // 3. Transaction degradation (Max 15 points)
  if (
    signals.transactions_per_minute !== null && 
    signals.baseline_transactions_per_minute !== null && 
    signals.baseline_transactions_per_minute > 0
  ) {
    tpm_pct_drop = (signals.baseline_transactions_per_minute - signals.transactions_per_minute) / signals.baseline_transactions_per_minute;
    if (tpm_pct_drop > 0.20) { 
      components.transaction = 15; 
    } else if (tpm_pct_drop >= 0.10) { 
      components.transaction = 10; 
    } else if (tpm_pct_drop >= 0.03) { 
      components.transaction = 5; 
    } else if (tpm_pct_drop > 0) { 
      components.transaction = 2; 
    }
  }

  // Transaction failure rate supplement
  if (signals.transaction_failure_rate !== null && signals.transaction_failure_rate > 5.0) {
    components.transaction = Math.min(15, components.transaction + 8);
  }

  // 4. Customer impact (Max 25 points)
  if (signals.customer_impact_score !== null) {
    if (signals.customer_impact_score >= 60) { 
      components.customer_impact = 25; 
    } else if (signals.customer_impact_score >= 35) { 
      components.customer_impact = 18; 
    } else if (signals.customer_impact_score >= 15) { 
      components.customer_impact = 10; 
    } else if (signals.customer_impact_score > 0) { 
      components.customer_impact = 5; 
    }
  } else if (signals.affected_customers !== null && signals.affected_customers > 1000) {
    components.customer_impact = 20;
  }

  // 5. Business criticality multiplier/weight (Max 10 points)
  let criticality_multiplier = 0;
  if (signals.business_criticality === 'critical') { 
    components.business_criticality = 10; 
    criticality_multiplier = 1.0;
  } else if (signals.business_criticality === 'medium') { 
    components.business_criticality = 5; 
    criticality_multiplier = 0.5;
  } else { 
    components.business_criticality = 0; 
    criticality_multiplier = 0;
  }

  // Sum components
  let score = Object.values(components).reduce((sum, val) => sum + val, 0);

  // Cap at 100
  score = Math.min(100, Math.max(0, score));

  return {
    score,
    components,
    details: {
      latency_pct_change,
      error_rate_abs_diff,
      tpm_pct_drop,
      customer_impact_score: signals.customer_impact_score,
      criticality_multiplier
    }
  };
}
