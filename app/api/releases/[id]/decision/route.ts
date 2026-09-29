import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { evaluateRecommendation } from '@/lib/engine/recommendation';
import { UserRole, DecisionAction } from '@/lib/models';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const release = store.getRelease(id);

  if (!release) {
    return NextResponse.json({ error: 'Release not found' }, { status: 404 });
  }

  const body = await request.json();
  const { 
    decision, 
    userRole, 
    actorName = 'Operator',
    overrideReason, 
    overrideNotes,
    secondaryApprover
  } = body as {
    decision: DecisionAction;
    userRole: UserRole;
    actorName?: string;
    overrideReason?: string;
    overrideNotes?: string;
    secondaryApprover?: string;
  };

  // 1. Role-Based Permission Check
  if (userRole === 'Viewer') {
    return NextResponse.json({ 
      error: 'Permission Denied: Viewer role is strictly read-only and cannot execute or override release decisions.' 
    }, { status: 403 });
  }

  if (userRole === 'External Partner') {
    return NextResponse.json({ 
      error: 'Permission Denied: External Partner role cannot execute production rollback or continuation decisions.' 
    }, { status: 403 });
  }

  if (userRole === 'Compliance Auditor') {
    return NextResponse.json({ 
      error: 'Permission Denied: Compliance Auditors have audit-only authority to maintain separation of duties.' 
    }, { status: 403 });
  }

  // Only Engineer and Release Manager can make decisions
  if (userRole !== 'Release Manager' && userRole !== 'Engineer') {
    return NextResponse.json({ 
      error: 'Unauthorized: Decision authority requires Release Manager or Engineer credential.' 
    }, { status: 403 });
  }

  const existingDecision = store.getDecision(id);
  
  // Handle secondary dual approval if already partially decided
  if (existingDecision?.has_decision && existingDecision.requires_dual_approval && !existingDecision.secondary_approved) {
    if (existingDecision.actor_name === actorName) {
      return NextResponse.json({ 
        error: 'Separation of Duties Violation: Secondary approver must be a distinct individual from the primary submitter.' 
      }, { status: 400 });
    }

    if (userRole !== 'Release Manager') {
      return NextResponse.json({ 
        error: 'Secondary confirmation on critical override requires Release Manager authorization.' 
      }, { status: 403 });
    }

    // Complete secondary approval
    store.setDecision(id, {
      ...existingDecision,
      secondary_approved: true,
      secondary_approver: actorName,
      secondary_timestamp: new Date().toISOString()
    });

    store.addAudit({
      release_id: release.release_id,
      organization: release.organization_name,
      user_role: userRole,
      actor_name: actorName,
      recommendation: 'ROLLBACK RECOMMENDED',
      risk_score: 85,
      decision: existingDecision.decision || 'CONTINUE',
      override_reason: existingDecision.override_reason,
      override_notes: `[DUAL APPROVAL CONFIRMED] Secondary sign-off completed by ${actorName} (${userRole}).`,
      timestamp: new Date().toISOString(),
      compliance_tags: ['SOC2-CC8.1-DUAL', 'FFIEC-FOUR-EYES', 'ISO27001-A12.1.2'],
      dual_approver: actorName,
      evidence_snapshot: JSON.stringify({ secondary_confirmation: true, primary: existingDecision.actor_name })
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Dual-approval completed successfully. Release action authorized.' 
    });
  }

  if (existingDecision?.has_decision) {
    return NextResponse.json({ 
      error: 'Conflict: Decision already finalized and locked in immutable audit ledger.' 
    }, { status: 409 });
  }

  const recommendation = evaluateRecommendation(release);

  // 2. Mandatory Override Justification Check
  if (recommendation.recommendation === 'ROLLBACK RECOMMENDED' && decision === 'CONTINUE') {
    if (!overrideReason || overrideReason.trim() === '') {
      return NextResponse.json({ 
        error: 'Compliance Violation: Forcing CONTINUE against a ROLLBACK RECOMMENDED advisory requires selecting an approved Override Reason.' 
      }, { status: 422 });
    }

    if (!overrideNotes || overrideNotes.trim().length < 15) {
      return NextResponse.json({ 
        error: 'Compliance Violation: Detailed technical rationale (minimum 15 characters) is required to override critical rollback advice.' 
      }, { status: 422 });
    }
  }

  // 3. Two-Person Rule (Dual Approval) for Critical Releases
  const isCriticalRelease = release.business_criticality === 'critical' || release.incident_severity === 'sev1';
  const requiresDualApproval = isCriticalRelease && recommendation.recommendation === 'ROLLBACK RECOMMENDED' && decision === 'CONTINUE';

  const timestamp = new Date().toISOString();

  // Create audit entry in cryptographic ledger
  const audit = store.addAudit({
    release_id: release.release_id,
    organization: release.organization_name,
    user_role: userRole,
    actor_name: actorName,
    recommendation: recommendation.recommendation,
    risk_score: recommendation.risk_score,
    decision,
    override_reason: overrideReason,
    override_notes: overrideNotes,
    timestamp,
    compliance_tags: [
      'SOC2-CC8.1',
      requiresDualApproval ? 'FFIEC-FOUR-EYES-PENDING' : 'FFIEC-D&A',
      'ISO27001-A12.1.2'
    ],
    dual_approver: secondaryApprover,
    evidence_snapshot: JSON.stringify({
      recommendation: recommendation.recommendation,
      risk_score: recommendation.risk_score,
      confidence: recommendation.confidence,
      confidence_score: recommendation.confidence_score,
      triggered_rules: recommendation.triggered_rules.map(r => r.rule_id),
      supporting_evidence: recommendation.supporting_evidence
    })
  });

  store.setDecision(id, {
    has_decision: true,
    decision,
    timestamp,
    user_role: userRole,
    actor_name: actorName,
    override_reason: overrideReason,
    override_notes: overrideNotes,
    requires_dual_approval: requiresDualApproval,
    secondary_approved: false
  });

  return NextResponse.json({ 
    success: true, 
    audit_id: audit.audit_id,
    audit_hash: audit.audit_hash,
    requires_dual_approval: requiresDualApproval,
    message: requiresDualApproval 
      ? 'Primary override logged. Requires secondary Release Manager sign-off before full production activation.'
      : 'Release decision successfully recorded in tamper-evident audit ledger.'
  });
}
