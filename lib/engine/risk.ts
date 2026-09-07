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
}

export function calculateRiskScore(signals: ReleaseSignals): RiskScoreResult {
  let score = 0;
  const components = {
    latency: 0,
    error_rate: 0,
    transaction: 0,
    customer_impact: 0,
    business_criticality: 0
  };

  // 1. Latency deterioration (Max 20 points)
  if (signals.latency_ms !== null && signals.latency_baseline_ms !== null) {
    const latDiff = (signals.latency_ms - signals.latency_baseline_ms) / signals.latency_baseline_ms;
    if (latDiff > 0.25) { components.latency = 20; }
    else if (latDiff >= 0.10) { components.latency = 10; }
    else if (latDiff > 0) { components.latency = 5; }
  }

  // 2. Error-rate deterioration (Max 30 points)
  if (signals.error_rate !== null && signals.baseline_error_rate !== null) {
    const errDiff = signals.error_rate - signals.baseline_error_rate;
    if (errDiff > 3.0) { components.error_rate = 30; }
    else if (errDiff >= 1.0) { components.error_rate = 15; }
    else if (errDiff > 0.2) { components.error_rate = 5; }
  }

  // 3. Transaction degradation (Max 15 points)
  if (signals.transactions_per_minute !== null && signals.baseline_transactions_per_minute !== null && signals.baseline_transactions_per_minute > 0) {
    const tpmDiff = (signals.baseline_transactions_per_minute - signals.transactions_per_minute) / signals.baseline_transactions_per_minute;
    if (tpmDiff > 0.10) { components.transaction = 15; }
    else if (tpmDiff >= 0.02) { components.transaction = 8; }
    else if (tpmDiff > 0) { components.transaction = 2; }
  }

  // 4. Customer impact (Max 25 points)
  if (signals.customer_impact_score !== null) {
    if (signals.customer_impact_score > 50) { components.customer_impact = 25; }
    else if (signals.customer_impact_score >= 20) { components.customer_impact = 12; }
    else if (signals.customer_impact_score > 0) { components.customer_impact = 5; }
  }

  // 5. Business criticality multiplier/weight (Max 10 points)
  if (signals.business_criticality === 'critical') { components.business_criticality = 10; }
  else if (signals.business_criticality === 'medium') { components.business_criticality = 5; }
  else { components.business_criticality = 0; }

  // Sum components
  score = Object.values(components).reduce((sum, val) => sum + val, 0);

  // Cap at 100
  score = Math.min(100, Math.max(0, score));

  return { score, components };
}
