import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { calculateRiskScore } from '@/lib/engine/risk';
import { evaluateRecommendation } from '@/lib/engine/recommendation';
import { evaluateBaseline } from '@/lib/engine/baseline';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const release = store.getRelease(id);

  if (!release) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const risk = calculateRiskScore(release);
  const recommendation = evaluateRecommendation(release);
  const baseline = evaluateBaseline(release);
  const decision = store.getDecision(release.release_id);

  return NextResponse.json({
    release,
    risk,
    recommendation,
    baseline,
    decision
  });
}
