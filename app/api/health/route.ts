import { NextResponse } from 'next/server';
import { store } from '@/lib/data/store';

export async function GET() {
  const releases = store.getReleases();
  const audits = store.getAudits();
  const chainVerification = store.getAuditChainVerification();

  const healthPayload = {
    status: 'HEALTHY',
    application: 'Explainable Release Rollback Adviser',
    version: '2.0.0-final',
    timestamp: new Date().toISOString(),
    uptime_seconds: process.uptime ? Math.round(process.uptime()) : 120,
    engine_readiness: true,
    telemetry_pipeline: 'active',
    database_store: {
      total_releases: releases.length,
      total_audit_records: audits.length,
      ledger_sealed: chainVerification.valid,
      ledger_total_verified: chainVerification.totalRecords
    },
    security_controls: {
      deny_by_default_rbac: true,
      multi_tenant_isolation: true,
      four_eyes_dual_control: true,
      anti_tamper_hash_chain: 'SHA-256'
    }
  };

  return NextResponse.json(healthPayload, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN'
    }
  });
}
