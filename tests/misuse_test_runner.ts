/**
 * Automated Misuse & Adversarial Security Test Suite
 * Evaluates Case 1 through Case 10 as specified in enterprise compliance requirements.
 */

import { store } from '../lib/data/store';
import { evaluateRecommendation } from '../lib/engine/recommendation';
import { verifyAuditChain } from '../lib/data/auditLedger';

export interface MisuseTestResult {
  case_id: string;
  test_name: string;
  threat_category: string;
  expected: string;
  actual: string;
  passed: boolean;
  notes: string;
}

export async function runMisuseTests(baseUrl: string = 'http://localhost:3000'): Promise<MisuseTestResult[]> {
  const results: MisuseTestResult[] = [];
  const testReleaseId = 'REL-0001';

  // Helper fetch with timeout
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    } catch (err: any) {
      return { status: 0, error: err.message, data: {} };
    }
  };

  // Case 1: Viewer attempts rollback approval
  {
    const res = await apiCall(`/api/releases/${testReleaseId}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'ROLLBACK', userRole: 'Viewer' })
    });
    const passed = res.status === 403;
    results.push({
      case_id: 'CASE-01',
      test_name: 'Viewer Attempts Rollback Approval',
      threat_category: 'Privilege Escalation',
      expected: 'HTTP 403 Forbidden (Deny-by-default)',
      actual: `HTTP ${res.status}: ${res.data?.error || 'N/A'}`,
      passed,
      notes: passed ? 'Viewer blocked from initiating high-impact production change.' : 'Failed to enforce role restriction.'
    });
  }

  // Case 2: External partner accesses another organization's release
  {
    // REL-0001 is Org Alpha or Org Beta; request with role 'External Partner'
    const alphaRelease = store.getReleases().find(r => r.organization_name === 'Org Alpha');
    const targetId = alphaRelease ? alphaRelease.release_id : 'REL-0001';
    const res = await apiCall(`/api/releases/${targetId}?role=External%20Partner&organization=External%20Partner%20Gamma`);
    const passed = res.status === 403 || res.status === 404;
    results.push({
      case_id: 'CASE-02',
      test_name: 'External Partner Cross-Tenant Release Access',
      threat_category: 'Tenant Isolation Breach',
      expected: 'HTTP 403 Forbidden (Strict Tenancy Boundary)',
      actual: `HTTP ${res.status}: ${res.data?.error || 'N/A'}`,
      passed,
      notes: passed ? 'External partner was prevented from accessing core banking release.' : 'Cross-tenant leak detected.'
    });
  }

  // Case 3: User attempts override without reason
  {
    // Find a release where evaluateRecommendation evaluates to ROLLBACK RECOMMENDED
    const rollbackRelease = store.getReleases().find(r => {
      const rec = evaluateRecommendation(r);
      return rec.recommendation === 'ROLLBACK RECOMMENDED' && !store.getDecision(r.release_id);
    }) || store.getRelease('REL-0996') || store.getReleases()[0];

    const res = await apiCall(`/api/releases/${rollbackRelease.release_id}/decision`, {
      method: 'POST',
      body: JSON.stringify({
        decision: 'CONTINUE',
        userRole: 'Release Manager',
        overrideReason: '', // Empty reason
        overrideNotes: ''
      })
    });
    const passed = res.status === 422;
    results.push({
      case_id: 'CASE-03',
      test_name: 'Override Attempt Without Reason',
      threat_category: 'Governance Bypass',
      expected: 'HTTP 422 Unprocessable Entity (Mandatory Rationale Required)',
      actual: `HTTP ${res.status}: ${res.data?.error || 'N/A'}`,
      passed,
      notes: passed ? 'Override rejected. Structured reason and justification required.' : 'Bypass allowed without justification.'
    });
  }

  // Case 4: Invalid metric submitted (NaN or malformed)
  {
    const res = await apiCall(`/api/releases/${testReleaseId}/telemetry`, {
      method: 'POST',
      body: JSON.stringify({
        error_rate: 150.0, // Invalid error rate > 100%
        userRole: 'Engineer'
      })
    });
    const passed = res.status === 422;
    results.push({
      case_id: 'CASE-04',
      test_name: 'Invalid Metric Submission (Out of bounds)',
      threat_category: 'Input Validation / Metric Falsification',
      expected: 'HTTP 422 Unprocessable Entity',
      actual: `HTTP ${res.status}: ${res.data?.error || 'N/A'}`,
      passed,
      notes: passed ? 'Impossible error rate (150%) rejected by validation guard.' : 'Invalid metric accepted.'
    });
  }

  // Case 5: Negative latency submitted
  {
    const res = await apiCall(`/api/releases/${testReleaseId}/telemetry`, {
      method: 'POST',
      body: JSON.stringify({
        latency_ms: -120, // Negative latency
        userRole: 'Engineer'
      })
    });
    const passed = res.status === 422;
    results.push({
      case_id: 'CASE-05',
      test_name: 'Negative Latency Submission',
      threat_category: 'Input Manipulation',
      expected: 'HTTP 422 Unprocessable Entity (Negative Latency Prohibited)',
      actual: `HTTP ${res.status}: ${res.data?.error || 'N/A'}`,
      passed,
      notes: passed ? 'Physically impossible negative latency rejected.' : 'Negative latency accepted.'
    });
  }

  // Case 6: Repeated approval request
  {
    // First decision
    const normalRelease = store.getReleases().find(r => r.actual_safe_action === 'CONTINUE' && !store.getDecision(r.release_id)) || store.getReleases()[10];
    await apiCall(`/api/releases/${normalRelease.release_id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'CONTINUE', userRole: 'Release Manager' })
    });
    // Second duplicate decision
    const dupRes = await apiCall(`/api/releases/${normalRelease.release_id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'CONTINUE', userRole: 'Release Manager' })
    });
    const passed = dupRes.status === 409 || dupRes.status === 400;
    results.push({
      case_id: 'CASE-06',
      test_name: 'Repeated Approval Request (Idempotency / Anti-Replay)',
      threat_category: 'Replay / Inconsistent State Mutation',
      expected: 'HTTP 409 Conflict (Decision Already Finalized)',
      actual: `HTTP ${dupRes.status}: ${dupRes.data?.error || 'N/A'}`,
      passed,
      notes: passed ? 'Subsequent duplicate submission rejected safely.' : 'Duplicate decision allowed mutation.'
    });
  }

  // Case 7: Missing telemetry
  {
    const missingRelease = store.getRelease('REL-0998');
    const rec = missingRelease ? evaluateRecommendation(missingRelease) : null;
    const passed = rec !== null && rec.recommendation === 'HUMAN REVIEW REQUIRED' && rec.confidence === 'Low';
    results.push({
      case_id: 'CASE-07',
      test_name: 'Missing Telemetry Blackout',
      threat_category: 'Observability Blackout Failure',
      expected: 'Confidence Reduced to Low, Recommendation = HUMAN REVIEW REQUIRED',
      actual: `Recommendation: ${rec?.recommendation}, Confidence: ${rec?.confidence}`,
      passed,
      notes: passed ? 'Precautionary invariant enforced. Never assumes safety in absence of data.' : 'Failed to downgrade confidence.'
    });
  }

  // Case 8: Rollback unavailable
  {
    const blockedRelease = store.getRelease('REL-1000');
    const rec = blockedRelease ? evaluateRecommendation(blockedRelease) : null;
    const passed = rec !== null && rec.recommendation !== 'ROLLBACK RECOMMENDED' && rec.conflicting_evidence.length > 0;
    results.push({
      case_id: 'CASE-08',
      test_name: 'Rollback Unavailable (Safety Invariant RUL-SAF-005)',
      threat_category: 'Unsafe Automated Action on Broken Reversal Script',
      expected: 'No Automatic Rollback Advisory; Escalated to War Room',
      actual: `Recommendation: ${rec?.recommendation}`,
      passed,
      notes: passed ? 'Rollback invariant blocked recommendation when rollback path is invalid.' : 'System advised rollback on unvalidated path.'
    });
  }

  // Case 9: Unauthorized audit access
  {
    // External partner attempting to query global audit logs
    const res = await apiCall(`/api/audit?role=External%20Partner&organization=External%20Partner%20Gamma`);
    // Partner must only receive partner audits
    const nonPartnerAudits = (res.data?.audits || []).filter((a: any) => a.organization !== 'External Partner Gamma');
    const passed = nonPartnerAudits.length === 0;
    results.push({
      case_id: 'CASE-09',
      test_name: 'Unauthorized Cross-Tenant Audit Log Access',
      threat_category: 'Audit Log Information Disclosure',
      expected: 'Audits Scoped to Partner Organization Only (Zero Cross-Org Leakage)',
      actual: `Cross-tenant records leaked: ${nonPartnerAudits.length}`,
      passed,
      notes: passed ? 'Audit records filtered strictly by tenant boundary.' : 'Cross-tenant audit leakage.'
    });
  }

  // Case 10: Tampered request / Hash verification check
  {
    const chainCheck = store.getAuditChainVerification();
    const passed = chainCheck.valid === true;
    results.push({
      case_id: 'CASE-10',
      test_name: 'Cryptographic Hash Chain Integrity Verification',
      threat_category: 'Audit Log Tampering / Forgery',
      expected: 'SHA-256 Block Chain Fully Verified with Zero Link Breaks',
      actual: `Valid: ${chainCheck.valid}, Records: ${chainCheck.totalRecords}`,
      passed,
      notes: passed ? 'All historical records verified against parent block hashes.' : 'Hash chain integrity failure.'
    });
  }

  return results;
}

// Standalone execution
if ((import.meta as { main?: boolean }).main || process.argv[1]?.endsWith('misuse_test_runner.ts')) {
  console.log('Running Misuse & Adversarial Security Test Suite (10 Cases)...\n');
  runMisuseTests().then(results => {
    let allPassed = true;
    for (const r of results) {
      const statusIcon = r.passed ? '✓ PASSED' : '✗ FAILED';
      console.log(`[${r.case_id}] ${r.test_name}: ${statusIcon}`);
      console.log(`  Expected: ${r.expected}`);
      console.log(`  Actual:   ${r.actual}`);
      console.log(`  Notes:    ${r.notes}\n`);
      if (!r.passed) allPassed = false;
    }
    console.log(`Summary: ${results.filter(r => r.passed).length}/${results.length} Misuse Tests Passed.`);
    if (!allPassed) process.exit(1);
  });
}
