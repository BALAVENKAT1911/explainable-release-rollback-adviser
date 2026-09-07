import { NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { evaluateRecommendation } from '@/lib/engine/recommendation';
import { evaluateBaseline } from '@/lib/engine/baseline';

export async function GET() {
  const releases = store.getReleases();
  
  let baselineCorrect = 0;
  let adviserCorrect = 0;
  
  let baselineFalseRollbacks = 0;
  let baselineFalseContinues = 0;
  
  let adviserFalseRollbacks = 0;
  let adviserFalseContinues = 0;
  
  let adviserRequiresReview = 0;

  for (const r of releases) {
    const baseline = evaluateBaseline(r);
    const adviser = evaluateRecommendation(r);
    
    // Evaluate Baseline
    if (baseline === r.actual_safe_action) {
      baselineCorrect++;
    } else {
      if (baseline === 'ROLLBACK' && r.actual_safe_action === 'CONTINUE') {
        baselineFalseRollbacks++;
      } else if (baseline === 'CONTINUE' && r.actual_safe_action === 'ROLLBACK') {
        baselineFalseContinues++;
      }
    }
    
    // Evaluate Adviser
    // If adviser recommends HUMAN REVIEW REQUIRED, it's considered neither correct nor incorrect initially
    // but we can measure how often it escalates instead of being wrong.
    if (adviser.recommendation === 'HUMAN REVIEW REQUIRED') {
      adviserRequiresReview++;
    } else {
      // Direct decision
      const mappedDecision = adviser.recommendation === 'ROLLBACK RECOMMENDED' ? 'ROLLBACK' : 'CONTINUE';
      if (mappedDecision === r.actual_safe_action) {
        adviserCorrect++;
      } else {
        if (mappedDecision === 'ROLLBACK' && r.actual_safe_action === 'CONTINUE') {
          adviserFalseRollbacks++;
        } else if (mappedDecision === 'CONTINUE' && r.actual_safe_action === 'ROLLBACK') {
          adviserFalseContinues++;
        }
      }
    }
  }
  
  const total = releases.length;

  return NextResponse.json({
    total,
    baseline: {
      accuracy: (baselineCorrect / total) * 100,
      falseRollbacks: baselineFalseRollbacks,
      falseContinues: baselineFalseContinues
    },
    adviser: {
      accuracy: (adviserCorrect / (total - adviserRequiresReview)) * 100, // Accuracy on automated decisions
      falseRollbacks: adviserFalseRollbacks,
      falseContinues: adviserFalseContinues,
      requiresReview: adviserRequiresReview,
      reviewRate: (adviserRequiresReview / total) * 100
    }
  });
}
