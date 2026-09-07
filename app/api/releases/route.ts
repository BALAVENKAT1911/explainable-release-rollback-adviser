import { NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { calculateRiskScore } from '@/lib/engine/risk';
import { evaluateRecommendation } from '@/lib/engine/recommendation';

export async function GET() {
  const releases = store.getReleases();
  
  const formatted = releases.map(r => {
    const { recommendation, risk_score } = evaluateRecommendation(r);
    const decision = store.getDecision(r.release_id);
    return {
      ...r,
      risk_score,
      recommendation,
      has_decision: !!decision,
      decision_status: decision?.decision
    };
  });

  return NextResponse.json(formatted);
}
