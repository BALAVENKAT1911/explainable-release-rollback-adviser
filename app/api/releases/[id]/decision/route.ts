import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { AuditRecord } from '@/lib/models';
import { evaluateRecommendation } from '@/lib/engine/recommendation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const release = store.getRelease(id);

  if (!release) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const existingDecision = store.getDecision(id);
  if (existingDecision) {
    return NextResponse.json({ error: 'Decision already made for this release' }, { status: 400 });
  }

  const body = await request.json();
  const { decision, userRole, overrideReason, overrideNotes } = body;

  const recommendation = evaluateRecommendation(release);

  const auditId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const audit: AuditRecord = {
    audit_id: auditId,
    release_id: release.release_id,
    organization: release.organization_name,
    user_role: userRole,
    recommendation: recommendation.recommendation,
    risk_score: recommendation.risk_score,
    decision,
    override_reason: overrideReason,
    override_notes: overrideNotes,
    timestamp,
    evidence_snapshot: JSON.stringify(recommendation)
  };

  store.addAudit(audit);
  store.setDecision(id, {
    has_decision: true,
    decision,
    timestamp,
    user_role: userRole
  });

  return NextResponse.json({ success: true, audit_id: auditId });
}
