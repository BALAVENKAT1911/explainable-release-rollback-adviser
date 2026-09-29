# System Limitations & Prototype Boundary Specification

**System:** Explainable Release Rollback Adviser for Regulated Enterprises  
**Status:** Evaluation-Ready Final Milestone Prototype  

---

## 1. Operating Scope & Integrity Statement

In adherence to strict academic and engineering transparency standards, this document explicitly outlines the architectural, mathematical, and operational boundaries of the Explainable Release Rollback Adviser prototype. These boundaries are presented not as deficiencies, but as well-defined design constraints appropriate for an enterprise advisory prototype.

---

## 2. Identified Prototype Boundaries

### 2.1 Synthetic Dataset & Simulated Environment
- **Constraint:** All 1,000 releases, baseline telemetry streams, and failure events are generated synthetically using a fixed-seed algorithm (`seed=42`).
- **Context:** Production enterprise telemetry contains unmodeled network jitter, multi-tenant container noisy neighbors, and fluctuating time-of-day seasonal patterns. While the synthetic dataset accurately models realistic Gaussian distributions, correlation spikes, and edge failures, it remains a synthetic testbed.

### 2.2 In-Memory Singleton Datastore
- **Constraint:** Data storage, decision states, and the cryptographic audit ledger operate in an in-memory singleton store within the application process.
- **Context:** Server restarts reset dynamic decisions to their initial seeded state. In an enterprise production deployment, this layer must be replaced by a distributed, persistent SQL/time-series database (e.g., PostgreSQL with TimescaleDB) and an append-only HSM-backed ledger.

### 2.3 Rule-Based Risk Engine vs Online Machine Learning
- **Constraint:** Risk scoring (0–100) and recommendation logic are evaluated using a deterministic, transparent rulebook rather than an online predictive deep neural network.
- **Context:** This was an explicit architectural design decision to guarantee 100% auditable explainability (zero black-box opacity). However, static weights (e.g. max 30 pts for error rate) may not capture non-linear cascading dependencies in microservice meshes.

### 2.4 Simulated Stakeholder Evaluation
- **Constraint:** User validation was conducted via structured walkthrough sessions with 12 simulated stakeholder personas across Site Reliability Engineering, Release Management, Compliance Auditing, and External Partner roles.
- **Context:** While the questions and feedback reflect real-world enterprise change management tensions, they do not constitute a longitudinal multi-month human-factors study in a live banking production center.

### 2.5 Regulatory Alignment vs Certification
- **Constraint:** The architecture maps its evidence retention, audit trail, and separation-of-duties controls to SOC 2 Type II (CC8.1), FFIEC D&A Section 5, and ISO/IEC 27001:2022 standards.
- **Context:** This application has not been formally audited or certified by an accredited third-party auditing firm (e.g. AICPA or ISO registrar). Compliance alignment is structural and advisory.

### 2.6 Threshold Sensitivity & Organization Tuning
- **Constraint:** Critical risk ceiling (>= 70) and supervisory review threshold (40–69) are statically configured.
- **Context:** Different business units have divergent risk appetites. A real-time core payments ledger may require a critical threshold of 50, whereas an internal employee reporting service might comfortably operate with a threshold of 80. Enterprise rollout requires tenant-specific calibration.

### 2.7 Pure Advisory Covenant (Non-Autonomous)
- **Constraint:** The system NEVER triggers automated rollbacks, deployment terminations, or container restarts.
- **Context:** This is a core safety requirement to prevent inadvertent data loss or double-settlement. High-impact production interventions strictly require human sign-off.
