import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { calculateRiskScore } from '@/lib/engine/risk';
import { evaluateRecommendation } from '@/lib/engine/recommendation';
import { evaluateBaseline, evaluateMultiMetricBaseline } from '@/lib/engine/baseline';
import { Organization, UserRole } from '@/lib/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const { searchParams } = new URL(request.url);
  const org = searchParams.get('organization') as Organization | null;
  const role = searchParams.get('role') as UserRole | null;

  // Verify tenancy
  const release = store.getRelease(id, {
    organization: org || undefined,
    role: role || undefined
  });

  if (!release) {
    // If release exists in general store but blocked by tenancy
    const rawRelease = store.getRelease(id);
    if (rawRelease && role === 'External Partner' && rawRelease.organization_name !== 'External Partner Gamma') {
      return NextResponse.json({ 
        error: 'Forbidden: Partner account is strictly restricted to External Partner Gamma releases.' 
      }, { status: 403 });
    }

    return NextResponse.json({ error: 'Release not found' }, { status: 404 });
  }

  const risk = calculateRiskScore(release);
  const recommendation = evaluateRecommendation(release);
  const simpleBaseline = evaluateBaseline(release);
  const multiBaseline = evaluateMultiMetricBaseline(release);
  const decision = store.getDecision(release.release_id);

  return NextResponse.json({
    release,
    risk,
    recommendation,
    baselines: {
      simpleErrorBaseline: simpleBaseline,
      multiMetricBaseline: multiBaseline
    },
    decision
  });
}
