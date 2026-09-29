/**
 * Comprehensive Automated Test Suite
 * Executes Unit, Integration, Tenancy, Engine, Audit, and Security Tests.
 * Run with: bun tests/run_tests.ts
 */

import { store } from '../lib/data/store';
import { calculateRiskScore } from '../lib/engine/risk';
import { evaluateRecommendation } from '../lib/engine/recommendation';
import { evaluateBaseline, evaluateMultiMetricBaseline } from '../lib/engine/baseline';
import { verifyAuditChain, createAuditRecord, GENESIS_HASH } from '../lib/data/auditLedger';
import { runMisuseTests } from './misuse_test_runner';

export interface TestExecution {
  suite: string;
  name: string;
  purpose: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export async function runAllTests(): Promise<{ results: TestExecution[]; passed: number; failed: number }> {
  const results: TestExecution[] = [];

  // ==========================================
  // SUITE 1: Decision & Risk Engine Unit Tests
  // ==========================================
  {
    const healthyRelease = store.getReleases().find(r => r.actual_safe_action === 'CONTINUE' && r.error_rate !== null && r.error_rate < 0.2)!;
    const { score, components } = calculateRiskScore(healthyRelease);
    const passed = score < 30 && components.error_rate === 0;
    results.push({
      suite: 'Decision Engine',
      name: 'Healthy Release Risk Scoring',
      purpose: 'Verify nominal telemetry produces low risk (<30)',
      expected: 'Risk score < 30',
      actual: `Score: ${score}`,
      passed
    });
  }

  {
    const criticalRelease = store.getRelease('REL-1000')!;
    const { score, components } = calculateRiskScore(criticalRelease);
    const passed = score >= 70 && components.customer_impact >= 20;
    results.push({
      suite: 'Decision Engine',
      name: 'High Customer Impact Scoring',
      purpose: 'Verify high customer impact score heavily contributes to risk',
      expected: 'Score >= 70 with customer_impact contribution',
      actual: `Score: ${score}, Customer Impact: ${components.customer_impact}`,
      passed
    });
  }

  // ==========================================
  // SUITE 2: Explainability & Rule Matrix Tests
  // ==========================================
  {
    const release = store.getRelease('REL-0996')!;
    const rec = evaluateRecommendation(release);
    const hasSilentRule = rec.triggered_rules.some(r => r.rule_id === 'RUL-SAF-002');
    const hasAttribution = rec.factor_attributions.length === 5;
    const hasCounterfactuals = rec.counterfactuals.length > 0;
    const passed = rec.recommendation === 'ROLLBACK RECOMMENDED' && hasSilentRule && hasAttribution && hasCounterfactuals;

    results.push({
      suite: 'Explainability Engine',
      name: 'Silent Corruption Rule & Factor Attribution',
      purpose: 'Verify RUL-SAF-002 triggers and full waterfall + counterfactuals generated',
      expected: 'RUL-SAF-002 triggered with 5 factor attributions & counterfactuals',
      actual: `Rule found: ${hasSilentRule}, Factors: ${rec.factor_attributions.length}, Counterfactuals: ${rec.counterfactuals.length}`,
      passed
    });
  }

  // ==========================================
  // SUITE 3: Baseline Comparison Tests
  // ==========================================
  {
    const release = store.getRelease('REL-0997')!; // Traffic surge: high latency, nominal errors
    const simple = evaluateBaseline(release);
    const multi = evaluateMultiMetricBaseline(release);
    const adviser = evaluateRecommendation(release);

    // Simple baseline only checks error rate -> CONTINUE
    // Multi baseline flags latency +50% -> might flag ROLLBACK
    // Adviser detects commercial traffic surge -> CONTINUE
    const passed = adviser.recommendation === 'CONTINUE';
    results.push({
      suite: 'Baselines Comparison',
      name: 'Traffic Surge Baseline Discrimination',
      purpose: 'Verify explainable adviser does not falsely alert on volume surges',
      expected: 'Adviser: CONTINUE',
      actual: `Simple: ${simple}, Multi: ${multi}, Adviser: ${adviser.recommendation}`,
      passed
    });
  }

  // ==========================================
  // SUITE 4: Tenancy Isolation Tests
  // ==========================================
  {
    const partnerReleases = store.getReleases({ role: 'External Partner', organization: 'External Partner Gamma' });
    const allGamma = partnerReleases.every(r => r.organization_name === 'External Partner Gamma');
    const hasReleases = partnerReleases.length > 0;
    const passed = allGamma && hasReleases;

    results.push({
      suite: 'Tenant Isolation',
      name: 'External Partner Strict Sandboxing',
      purpose: 'Verify partner queries return ONLY External Partner Gamma releases',
      expected: '100% of returned releases belong to External Partner Gamma',
      actual: `Returned ${partnerReleases.length} releases, all Gamma: ${allGamma}`,
      passed
    });
  }

  {
    // Auditor sees all orgs
    const auditorReleases = store.getReleases({ role: 'Compliance Auditor' });
    const orgs = new Set(auditorReleases.map(r => r.organization_name));
    const passed = orgs.has('Org Alpha') && orgs.has('Org Beta') && orgs.has('External Partner Gamma');

    results.push({
      suite: 'Tenant Isolation',
      name: 'Compliance Auditor Cross-Org Visibility',
      purpose: 'Verify auditor role has cross-tenant observability',
      expected: 'Releases from all 3 organizations visible',
      actual: `Observed orgs: ${Array.from(orgs).join(', ')}`,
      passed
    });
  }

  // ==========================================
  // SUITE 5: Cryptographic Ledger Verification
  // ==========================================
  {
    const verification = store.getAuditChainVerification();
    const passed = verification.valid === true && verification.totalRecords > 0;

    results.push({
      suite: 'Audit Ledger',
      name: 'SHA-256 Hash Chain Integrity Verification',
      purpose: 'Verify ledger records form unbroken parent-block hash chain',
      expected: 'Chain Valid with zero link breaks',
      actual: `Valid: ${verification.valid}, Total Records: ${verification.totalRecords}`,
      passed
    });
  }

  // ==========================================
  // SUITE 6: Edge Cases Validation (5 Modes)
  // ==========================================
  {
    const c1 = evaluateRecommendation(store.getRelease('REL-0996')!); // Silent corruption
    const c2 = evaluateRecommendation(store.getRelease('REL-0997')!); // Traffic surge
    const c3 = evaluateRecommendation(store.getRelease('REL-0998')!); // Missing telemetry
    const c4 = evaluateRecommendation(store.getRelease('REL-0999')!); // Contradictory signals
    const c5 = evaluateRecommendation(store.getRelease('REL-1000')!); // Rollback unavailable

    const p1 = c1.recommendation === 'ROLLBACK RECOMMENDED';
    const p2 = c2.recommendation === 'CONTINUE';
    const p3 = c3.recommendation === 'HUMAN REVIEW REQUIRED' && c3.confidence === 'Low';
    const p4 = c4.recommendation === 'HUMAN REVIEW REQUIRED';
    const p5 = c5.recommendation === 'HUMAN REVIEW REQUIRED'; // Rollback blocked

    const allPassed = p1 && p2 && p3 && p4 && p5;

    results.push({
      suite: 'Edge Cases (5 Modes)',
      name: 'All 5 Resilience Scenarios Verification',
      purpose: 'Verify correct invariant handling for all 5 enterprise edge modes',
      expected: 'C1: ROLLBACK, C2: CONTINUE, C3: REVIEW (Low), C4: REVIEW, C5: REVIEW',
      actual: `C1:${c1.recommendation}, C2:${c2.recommendation}, C3:${c3.recommendation}, C4:${c4.recommendation}, C5:${c5.recommendation}`,
      passed: allPassed
    });
  }

  // ==========================================
  // SUITE 7: Misuse Resistance Suite (10 Cases)
  // ==========================================
  const misuseResults = await runMisuseTests();
  for (const m of misuseResults) {
    results.push({
      suite: 'Security Misuse',
      name: `[${m.case_id}] ${m.test_name}`,
      purpose: m.threat_category,
      expected: m.expected,
      actual: m.actual,
      passed: m.passed
    });
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  return { results, passed, failed };
}

// Standalone execution
if ((import.meta as { main?: boolean }).main || process.argv[1]?.endsWith('run_tests.ts')) {
  console.log('============================================================');
  console.log('Explainable Release Rollback Adviser: Automated Test Suite');
  console.log('============================================================\n');

  runAllTests().then(({ results, passed, failed }) => {
    let currentSuite = '';
    for (const r of results) {
      if (r.suite !== currentSuite) {
        currentSuite = r.suite;
        console.log(`\n--- ${currentSuite} ---`);
      }
      const mark = r.passed ? '✓ PASS' : '✗ FAIL';
      console.log(`[${mark}] ${r.name}`);
      if (!r.passed) {
        console.log(`       Expected: ${r.expected}`);
        console.log(`       Actual:   ${r.actual}`);
      }
    }

    console.log('\n============================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED | ${results.length} TOTAL`);
    console.log('============================================================');
    if (failed > 0) process.exit(1);
  });
}
