# Comprehensive Automated Test Results

**System:** Explainable Release Rollback Adviser for Regulated Enterprises  
**Test Runner:** `tests/run_tests.ts` (Executed via Bun / TypeScript runtime)  
**Execution Timestamp:** September 2026  
**Final Result:** 18 / 18 Tests Passed (100.0% Success Rate, 0 Failures)  

---

## 1. Test Execution Summary

| Test Suite | Total Tests | Passed | Failed | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Decision & Risk Engine** | 2 | 2 | 0 | **PASSED** |
| **Explainability Engine** | 1 | 1 | 0 | **PASSED** |
| **Baselines Comparison** | 1 | 1 | 0 | **PASSED** |
| **Tenancy Isolation** | 2 | 2 | 0 | **PASSED** |
| **Cryptographic Audit Ledger** | 1 | 1 | 0 | **PASSED** |
| **Edge Cases (5 Failure Modes)** | 1 | 1 | 0 | **PASSED** |
| **Security & Misuse Resistance** | 10 | 10 | 0 | **PASSED** |
| **TOTAL** | **18** | **18** | **0** | **100% PASSED** |

---

## 2. Granular Test Case Matrix

| Suite | Test Name | Purpose | Expected Behavior | Actual Behavior | Result |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Decision Engine** | Healthy Release Risk Scoring | Verify nominal telemetry produces low risk (<30) | Risk score < 30 | Score: 0/100, error_rate: 0 pts | **PASS** |
| **Decision Engine** | High Customer Impact Scoring | Verify high customer impact contributes heavily to risk | Score >= 70 with customer impact | Score: 88, customer_impact: 25 pts | **PASS** |
| **Explainability** | Silent Corruption & Factor Attribution | Verify Rule RUL-SAF-002 triggers with 5 factor attributions & counterfactuals | RUL-SAF-002 triggered, 5 factors, counterfactuals | Rule Triggered: true, Factors: 5, Counterfactuals: 2 | **PASS** |
| **Baselines** | Traffic Surge Baseline Discrimination | Verify adviser does not falsely rollback during commercial promotional surges | Adviser advises CONTINUE | Simple: CONTINUE, Multi: ROLLBACK, Adviser: CONTINUE | **PASS** |
| **Tenancy Isolation** | External Partner Strict Sandboxing | Verify partner queries return ONLY External Partner Gamma releases | 100% of returned releases belong to Gamma | Returned 142 releases, all Gamma: true | **PASS** |
| **Tenancy Isolation** | Compliance Auditor Cross-Org Visibility | Verify auditor role has cross-tenant observability across all 3 orgs | Releases from all 3 orgs visible | Observed: Org Alpha, Org Beta, External Partner Gamma | **PASS** |
| **Audit Ledger** | SHA-256 Hash Chain Integrity | Verify audit ledger records form unbroken parent-block hash chain | Valid chain with zero link breaks | Valid: true, Records: 1 | **PASS** |
| **Edge Cases** | All 5 Resilience Scenarios | Verify all 5 enterprise edge modes adhere to safety invariants | C1: ROLLBACK, C2: CONTINUE, C3: REVIEW, C4: REVIEW, C5: REVIEW | C1: ROLLBACK, C2: CONTINUE, C3: REVIEW (Low), C4: REVIEW, C5: REVIEW | **PASS** |
| **Security Misuse** | [CASE-01] Viewer Attempts Rollback Approval | Verify deny-by-default on unauthorized role | HTTP 403 Forbidden | HTTP 403: Permission Denied: Viewer role is strictly read-only | **PASS** |
| **Security Misuse** | [CASE-02] Partner Cross-Tenant Access | Verify partner cannot access core banking releases | HTTP 403 Forbidden | HTTP 403: Forbidden: Partner account is strictly restricted to Gamma | **PASS** |
| **Security Misuse** | [CASE-03] Override Without Reason | Verify forced continue on critical alert requires approved reason | HTTP 422 Unprocessable Entity | HTTP 422: Compliance Violation: Mandatory Override Reason required | **PASS** |
| **Security Misuse** | [CASE-04] Invalid Metric (>100% error rate) | Verify input validation rejects out-of-bounds telemetry | HTTP 422 Unprocessable Entity | HTTP 422: Validation Error: Error rate must be between 0.0% and 100.0% | **PASS** |
| **Security Misuse** | [CASE-05] Negative Latency Submission | Verify input validation rejects negative latency | HTTP 422 Unprocessable Entity | HTTP 422: Validation Error: Negative latency value (-120 ms) is physically invalid | **PASS** |
| **Security Misuse** | [CASE-06] Repeated Approval (Idempotency) | Verify duplicate decision mutation is blocked | HTTP 409 Conflict | HTTP 409: Conflict: Decision already finalized and locked in audit ledger | **PASS** |
| **Security Misuse** | [CASE-07] Missing Telemetry Blackout | Verify precautionary principle on telemetry blackout | Confidence: Low, Recommendation: REVIEW | Confidence: Low (35%), Recommendation: HUMAN REVIEW REQUIRED | **PASS** |
| **Security Misuse** | [CASE-08] Rollback Unavailable Invariant | Verify automated rollback advice blocked when script invalid | Rollback advice blocked; war room review | Conflicting evidence logged; Recommendation: HUMAN REVIEW REQUIRED | **PASS** |
| **Security Misuse** | [CASE-09] Cross-Tenant Audit Log Leakage | Verify audit logs filtered strictly by tenant identifier | Zero cross-tenant records returned | Cross-tenant records leaked: 0 | **PASS** |
| **Security Misuse** | [CASE-10] Hash Chain Cryptographic Check | Verify tamper-evident verification detects zero breaks | SHA-256 block chain fully verified | Chain Valid: true, Records: 1 verified | **PASS** |

---

## 3. How to Re-Run Tests Locally

```bash
# Run complete test suite (all 18 unit, integration, and security tests)
bun tests/run_tests.ts

# Run misuse test suite independently
bun tests/misuse_test_runner.ts
```
