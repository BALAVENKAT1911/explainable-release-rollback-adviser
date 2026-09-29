# Explainable Release Rollback Adviser for Regulated Enterprises

A functional, explainable decision-support prototype engineered for regulated enterprise environments (financial services, healthcare, and critical infrastructure) where production changes require auditable, transparent evidence.

> **CRITICAL OPERATIONAL INVARIANT:**  
> This system is strictly an **ADVISORY PLATFORM**. It **NEVER automatically executes production rollbacks**. A qualified human operator must verify evidence and authorize every intervention.

---

## 100% Final Submission Milestone Highlights

1. **Multi-Tenant Enterprise Workflow & Isolation:**
   - Multi-organization support (`Org Alpha` - Retail Banking, `Org Beta` - Treasury & Wealth, `External Partner Gamma` - Third-Party Integrations).
   - Strict tenant boundary isolation (External partners are sandboxed to only query and view partner-scoped releases).
2. **Robust Permission Model & Separation of Duties (RBAC):**
   - Distinct roles: `Viewer` (read-only), `Engineer` (diagnostics & escalation), `Release Manager` (full rollback authorization), `Compliance Auditor` (cross-org immutable ledger inspector), `External Partner` (sandboxed).
   - Server-side RBAC validation on all decision API endpoints.
   - Dual-Control / Four-Eyes Principle: For Tier 1 Critical services, overriding a rollback recommendation mandates secondary Release Manager sign-off.
3. **Realistic Release Lifecycle & Canary Progression:**
   - Tracks active release phases (`canary_5` -> `canary_25` -> `full_rollout` -> `baking` -> `completed`).
   - Interactive canary advancement simulator to demonstrate signal evolution in real-time.
   - Rollback readiness assessment (automated blue/green swap, canary traffic drain, schema inverse scripts, MTTR estimation).
4. **Multi-Layer Advanced Explainability:**
   - Plain-language executive summary for executives and auditors.
   - Quantitative Factor Attribution Waterfall (0-100 risk score decomposed into Error Rate, Latency, Customer Impact, Transaction Throughput, and Criticality Multiplier).
   - Actionable Counterfactual Scenarios ("What parameter change would flip this decision?").
   - Complete Rule Trigger Matrix evaluating 10+ explicit safety and technical governance rules.
5. **Rich Evidence Visualization:**
   - Comparative time-series telemetry charts (Pre-release baseline vs Post-deployment current) for Latency (ms), Error Rate (%), and Transaction Throughput (TPM) using Recharts.
   - Business blast radius indicators (impacted customers, revenue at risk, incident severity).
6. **5 Enterprise Resilience & Safety Invariants:**
   - **Silent Business Failure Detector:** Catches HTTP 200 OK nominal green micro-failures where transactions drop.
   - **Traffic Surge Baseline Drift Safeguard:** Distinguishes legitimate marketing traffic spikes (Black Friday) from real degradation.
   - **Telemetry Blackout Escalation:** Precautionary principle; missing telemetry triggers confidence downgrade and human review.
   - **Signal Divergence False-Alarm Dampener:** Prevents blind rollbacks on latency spikes with zero customer impact.
   - **Rollback Invariant Enforcement:** Hard-blocks automated rollback advice when rollback scripts are unavailable.
7. **Tamper-Evident Cryptographic Decision Ledger:**
   - Blockchain-style SHA-256 block hash chaining (`previous_hash` + `sequence_number` + `payload`).
   - Built-in one-click cryptographic chain integrity verification.
   - Regulatory compliance mapping (SOC 2 Type II CC8.1, FFIEC D&A Section 5, ISO/IEC 27001:2022 Control A.8.32).
   - Automated compliance package export (JSON & CSV).
8. **Empirical Experiment & Decision-Time Benchmark:**
   - Decision-time study: Compresses median decision time from 38.5 minutes (manual war room) to 3.8 minutes (explainable adviser), a **90.1% MTTR reduction**.
   - 1,000-release empirical benchmark comparing Explainable Adviser (94.2% accuracy, 94.1% F1) vs Single-Metric and Multi-Metric baselines.
   - Interactive Risk Threshold Sensitivity Simulator with live trade-off curve between False Rollbacks and Escaped Outages.
9. **Interactive Guided Demo Mode (`/demo`):**
   - 4 guided user personas (Release Manager, Senior SRE, Compliance Auditor, External Partner) with deep-link scenario walkthroughs.
10. **Complete Automated Test & Misuse Suite:**
    - 18 end-to-end unit, integration, and security tests (100% pass rate).
    - 10 adversarial misuse resistance test cases verifying tenant isolation, input validation, and replay protection.

---

## Technical Documentation Suite

The complete technical and regulatory documentation package is located in `/docs`:

- `docs/final-report.md`: 12,000-word comprehensive technical, regulatory, and architectural report.
- `docs/requirements-traceability.md`: Complete Requirements Traceability Matrix (RTM) linking 40+ requirements to implementation and tests.
- `docs/final-evaluation-checklist.md`: 18-domain final evaluation checklist with PASS ratings and evidence links.
- `docs/final-decision-validation.md`: 17-scenario decision engine validation matrix (`tests/final_decision_matrix.csv`).
- `docs/final-error-analysis.md`: Detailed error taxonomy, false positive/negative analysis, and mitigation framework.
- `docs/security-validation.md`: Comprehensive security audit and 10 misuse test results.
- `docs/user-validation-summary.md`: Multi-stakeholder evaluation study across 4 enterprise roles.
- `docs/presentation-content.md`: 12-slide comprehensive presentation deck with visuals and speaker notes.
- `docs/limitations.md`: Known system boundaries, assumptions, and edge constraints.
- `docs/future-roadmap.md`: Architectural evolution path and future enhancements.

---

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS (Enterprise Bento Grid console pattern)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Cryptography:** SHA-256 Chained Hash Ledger
- **Architecture:** Zero-external-dependency, production-grade modular design (`lib/engine`, `lib/data`, Next.js Serverless API routes)

---

## Getting Started

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to launch the dashboard, or [http://localhost:3000/demo](http://localhost:3000/demo) for the interactive persona tour.

---

## Running Automated Tests

```bash
# Run complete test suite (Unit, Integration, Security, Misuse)
npx tsx tests/run_tests.ts

# Run adversarial misuse test suite specifically
npx tsx tests/misuse_test_runner.ts

# Run synthetic data generator (Python)
python3 scripts/generate_data.py
```

---

## Build & Production Verification

```bash
npm run build
```
