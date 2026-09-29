import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { evaluateRecommendation } from '@/lib/engine/recommendation';
import { Organization, UserRole } from '@/lib/models';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const org = searchParams.get('organization') as Organization | null;
  const role = searchParams.get('role') as UserRole | null;
  const search = searchParams.get('search') || undefined;

  const releases = store.getReleases({
    organization: org || undefined,
    role: role || undefined,
    search
  });
  
  const formatted = releases.map(r => {
    const rec = evaluateRecommendation(r);
    const decision = store.getDecision(r.release_id);
    return {
      release_id: r.release_id,
      organization_name: r.organization_name,
      service_name: r.service_name,
      version: r.version,
      environment: r.environment,
      deployment_time: r.deployment_time,
      change_type: r.change_type,
      phase: r.phase,
      bake_duration_minutes: r.bake_duration_minutes,
      business_criticality: r.business_criticality,
      incident_severity: r.incident_severity,
      monitoring_status: r.monitoring_status,
      latency_ms: r.latency_ms,
      latency_baseline_ms: r.latency_baseline_ms,
      error_rate: r.error_rate,
      baseline_error_rate: r.baseline_error_rate,
      transactions_per_minute: r.transactions_per_minute,
      affected_customers: r.affected_customers,
      customer_impact_score: r.customer_impact_score,
      rollback_available: r.rollback_readiness?.available ?? r.rollback_available,
      rollback_strategy: r.rollback_readiness?.strategy,
      risk_score: rec.risk_score,
      recommendation: rec.recommendation,
      confidence: rec.confidence,
      confidence_score: rec.confidence_score,
      triggered_rules_count: rec.triggered_rules.length,
      edge_case_id: r.edge_case_id,
      has_decision: !!decision,
      decision_status: decision?.decision,
      decision_by: decision?.user_role,
      requires_dual_approval: decision?.requires_dual_approval,
      secondary_approved: decision?.secondary_approved
    };
  });

  return NextResponse.json(formatted);
}
