import { ReleaseSignals } from '../models';

export function evaluateBaseline(signals: ReleaseSignals): 'CONTINUE' | 'ROLLBACK' {
  // Simple single-metric baseline rule
  const ERROR_THRESHOLD = 2.5; // 2.5% absolute increase
  
  if (signals.error_rate !== null && signals.baseline_error_rate !== null) {
    if (signals.error_rate - signals.baseline_error_rate >= ERROR_THRESHOLD) {
      return 'ROLLBACK';
    }
  }
  
  return 'CONTINUE';
}

export function evaluateMultiMetricBaseline(signals: ReleaseSignals): 'CONTINUE' | 'ROLLBACK' {
  // Static multi-metric rule (thresholds without business impact or safety overrides)
  const ERROR_THRESHOLD = 2.0;
  const LATENCY_PCT_THRESHOLD = 0.50; // 50% increase

  if (signals.error_rate !== null && signals.baseline_error_rate !== null) {
    if (signals.error_rate - signals.baseline_error_rate >= ERROR_THRESHOLD) {
      return 'ROLLBACK';
    }
  }

  if (signals.latency_ms !== null && signals.latency_baseline_ms !== null && signals.latency_baseline_ms > 0) {
    if ((signals.latency_ms - signals.latency_baseline_ms) / signals.latency_baseline_ms >= LATENCY_PCT_THRESHOLD) {
      return 'ROLLBACK';
    }
  }

  return 'CONTINUE';
}
