import { ReleaseSignals } from '../models';

export function evaluateBaseline(signals: ReleaseSignals): 'CONTINUE' | 'ROLLBACK' {
  // A simple baseline decision logic for comparison
  // E.g., if error rate > fixed threshold, then rollback, else continue
  
  const ERROR_THRESHOLD = 3.0; // 3% absolute increase
  
  if (signals.error_rate !== null && signals.baseline_error_rate !== null) {
    if (signals.error_rate - signals.baseline_error_rate > ERROR_THRESHOLD) {
      return 'ROLLBACK';
    }
  }
  
  return 'CONTINUE';
}
