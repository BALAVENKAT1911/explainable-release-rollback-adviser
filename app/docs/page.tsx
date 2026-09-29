'use client';

import { 
  ShieldCheck, 
  FileText, 
  Layers, 
  Key, 
  Clock, 
  Sliders, 
  Database,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/70">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
              Engineering &amp; Compliance Specification
            </span>
            <span className="text-[10px] font-semibold text-slate-500">v2.0 (70% Milestone)</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Technical Documentation</h1>
          <p className="text-slate-500 text-xs mt-1">
            Explainable Release Rollback Adviser for Regulated Enterprises &bull; Evidence-based change governance
          </p>
        </header>

        {/* Section 1: Advisory Principle & Scope */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-600" />
            1. Fundamental Invariant: Pure Advisory Paradigm
          </h2>
          <p className="text-slate-600 text-xs leading-relaxed font-medium">
            In regulated banking, healthcare, and capital markets environments, automated autonomous rollbacks pose severe operational hazards, such as inadvertent double-settlement, out-of-order ledger replays, and schema de-synchronization. Therefore, this system operates under a strict, non-negotiable invariant:
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold space-y-1">
            <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-amber-800">
              <AlertTriangle size={14} className="text-amber-600" />
              Core Safety Covenant
            </p>
            <p>
              The system is an <strong>advisory decision support platform</strong>. It NEVER automatically triggers production rollbacks without explicit human confirmation. Every high-impact intervention requires human verification, role-based authorization, and an auditable justification trail.
            </p>
          </div>
        </section>

        {/* Section 2: Architecture & Tenancy */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Layers size={18} className="text-indigo-600" />
            2. System Architecture &amp; Multi-Tenant Isolation
          </h2>
          <p className="text-slate-600 text-xs leading-relaxed font-medium">
            The platform is built on an enterprise Next.js and TypeScript architecture featuring strict tenant boundary separation and role-based access control (RBAC):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 border rounded-xl space-y-1">
              <span className="font-bold text-slate-800 block">Organizational Tenancy:</span>
              <p className="text-slate-600 font-medium">
                Supports multiple enterprise partitions (<strong>Org Alpha</strong> for Retail Banking, <strong>Org Beta</strong> for Treasury &amp; Wealth, and <strong>External Partner Gamma</strong> for third-party integrations). External partners are strictly sandboxed to their own service scope.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border rounded-xl space-y-1">
              <span className="font-bold text-slate-800 block">Separation of Duties (RBAC):</span>
              <p className="text-slate-600 font-medium">
                Enforces distinct operational boundaries between <strong>Viewers</strong> (read-only), <strong>Engineers</strong> (diagnostics &amp; escalation), <strong>Release Managers</strong> (rollback authorization), and <strong>Compliance Auditors</strong> (independent verification).
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Risk Formulation & Factor Attribution */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sliders size={18} className="text-indigo-600" />
            3. Quantitative Risk Formulation &amp; Waterfall Attribution
          </h2>
          <p className="text-slate-600 text-xs leading-relaxed font-medium">
            Release risk is quantified on a deterministic scale (0 to 100). The model guarantees transparent factor attribution with zero opaque weights:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs font-medium">
            <li>
              <strong className="text-slate-800">Service Error Rate (Max 30 pts):</strong> Absolute percentage deviation above baseline HTTP 5xx / application exception rates.
            </li>
            <li>
              <strong className="text-slate-800">Latency Degradation (Max 20 pts):</strong> Percentage increase over the 30-day historical baseline response time.
            </li>
            <li>
              <strong className="text-slate-800">Customer &amp; Revenue Blast Radius (Max 25 pts):</strong> Composite evaluation of active affected user accounts and monetary revenue at risk.
            </li>
            <li>
              <strong className="text-slate-800">Transaction Throughput Drop (Max 15 pts):</strong> Sudden drops in transactions-per-minute (TPM) indicating silent pipeline drop-offs.
            </li>
            <li>
              <strong className="text-slate-800">Business Criticality Multiplier (Max 10 pts):</strong> Additional weight applied according to service tier (Tier 1 Critical vs Tier 2 Medium).
            </li>
          </ul>
        </section>

        {/* Section 4: Counterfactual Explainability */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            4. Counterfactual Explainability Framework
          </h2>
          <p className="text-slate-600 text-xs leading-relaxed font-medium">
            Unlike legacy black-box machine learning systems that merely output an alert, this adviser generates <strong>actionable counterfactual statements</strong>. For example:
          </p>
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl font-mono text-[11px] text-indigo-900 space-y-1">
            <p>&bull; &quot;If Error Rate drops from 3.2% to &lt; 0.7%, composite risk score drops from 78 to 35, altering advisory from ROLLBACK RECOMMENDED to CONTINUE.&quot;</p>
            <p>&bull; &quot;If Telemetry collection is restored for Latency and TPM, confidence score increases from 35% (Low) to 95% (High).&quot;</p>
          </div>
        </section>

        {/* Section 5: Five Resilience Failure Modes */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-indigo-600" />
            5. Five Validated Safety Failure Modes
          </h2>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 border rounded-xl">
              <strong className="text-slate-800">1. Silent Business Corruption:</strong> Catches micro-failures where HTTP codes return 200 OK while transaction success drops.
            </div>
            <div className="p-3 bg-slate-50 border rounded-xl">
              <strong className="text-slate-800">2. Traffic Surge Baseline Drift:</strong> Distinguishes acceptable queueing delays during legitimate marketing spikes from actual outages.
            </div>
            <div className="p-3 bg-slate-50 border rounded-xl">
              <strong className="text-slate-800">3. Telemetry Blackout / Precautionary Principle:</strong> Refuses to assume safety when monitoring agents crash; mandates human review.
            </div>
            <div className="p-3 bg-slate-50 border rounded-xl">
              <strong className="text-slate-800">4. Signal Divergence Dampener:</strong> Prevents premature rollback when technical latency spikes show zero customer impact.
            </div>
            <div className="p-3 bg-slate-50 border rounded-xl">
              <strong className="text-slate-800">5. Rollback Invariant Enforcement:</strong> Blocks automated rollback recommendation when destructive schema changes make automated rollback impossible.
            </div>
          </div>
        </section>

        {/* Section 6: Cryptographic Audit Ledger & Regulatory Mapping */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Key size={18} className="text-indigo-600" />
            6. Cryptographic Audit Ledger &amp; Regulatory Compliance Mapping
          </h2>
          <p className="text-slate-600 text-xs leading-relaxed font-medium">
            Every human decision, override reason, and telemetry evidence snapshot is sealed in an immutable hash chain:
          </p>
          <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px]">
            audit_hash = SHA-256(previous_hash + seq_num + release_id + decision + actor + snapshot)
          </div>
          
          <table className="w-full text-left border-collapse text-xs mt-3">
            <thead>
              <tr className="border-b text-slate-400 text-[10px] uppercase font-bold">
                <th className="pb-2">Standard / Framework</th>
                <th className="pb-2">Regulatory Requirement</th>
                <th className="pb-2">Adviser Implementation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
              <tr>
                <td className="py-2.5 font-bold">SOC 2 Type II (CC8.1)</td>
                <td className="py-2.5">Authorized change management &amp; evidence retention</td>
                <td className="py-2.5">Immutable cryptographic audit trail &amp; mandatory override rationale</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold">FFIEC D&amp;A Section 5</td>
                <td className="py-2.5">Rollback verification &amp; separation of duties</td>
                <td className="py-2.5">Two-person rule (Four-Eyes Principle) on critical service overrides</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold">ISO/IEC 27001:2022 A.12.1.2</td>
                <td className="py-2.5">Production change control &amp; impact analysis</td>
                <td className="py-2.5">Automated factor attribution &amp; pre-flight rollback check</td>
              </tr>
            </tbody>
          </table>
        </section>

      </div>
    </div>
  );
}
