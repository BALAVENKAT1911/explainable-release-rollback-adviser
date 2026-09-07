'use client';

export default function DocsPage() {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Technical Documentation</h1>
          <p className="text-slate-500 text-sm mt-1">Explainable Release Rollback Adviser - Milestone 1</p>
        </header>

        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Architecture</h2>
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            This prototype is built using a modern <strong>React + Next.js (TypeScript)</strong> stack. 
            While a Python/FastAPI backend was initially preferred, the constraints of the AI Studio environment 
            (single port 3000 requirement, integrated deployment) make Next.js API Routes the superior choice for delivering a functional, secure, and robust end-to-end web application without compromising architectural separation.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            <strong className="text-slate-800">Frontend:</strong> React components with Tailwind CSS, utilizing a Context Provider for role-based access simulation.
            <br/>
            <strong className="text-slate-800">Backend:</strong> Next.js Serverless API routes (<code>/api/releases</code>, <code>/api/audit</code>) encapsulate the core logic.
            <br/>
            <strong className="text-slate-800">Engines:</strong> The Risk Scoring, Recommendation, and Baseline engines are separated into independent TypeScript modules in <code>/lib/engine</code>.
            <br/>
            <strong className="text-slate-800">Data:</strong> An in-memory store initialized with 1000 synthetic records simulating a real production database.
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Risk Calculation Engine</h2>
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            The risk score (0-100) is calculated deterministically using a transparent rule set:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm font-medium">
            <li><strong className="text-slate-800">Latency (max 20 pts):</strong> Based on percentage degradation from baseline.</li>
            <li><strong className="text-slate-800">Error Rate (max 30 pts):</strong> Based on absolute percentage increase.</li>
            <li><strong className="text-slate-800">Transactions (max 15 pts):</strong> Based on drop in volume compared to baseline.</li>
            <li><strong className="text-slate-800">Customer Impact (max 25 pts):</strong> Based on a composite impact score and affected customers.</li>
            <li><strong className="text-slate-800">Business Criticality (max 10 pts):</strong> Acts as a weight multiplier for critical services.</li>
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Recommendation Logic</h2>
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            Recommendations are not purely score-based. The engine evaluates evidence and edge cases to produce explainable outcomes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm font-medium">
            <li><strong className="text-slate-800">ROLLBACK RECOMMENDED:</strong> High score (&ge;70) with clear technical and business impact. Requires human override reason to bypass.</li>
            <li><strong className="text-slate-800">HUMAN REVIEW REQUIRED:</strong> Medium score, or triggered by edge cases (Missing Data, Contradictory Signals, Rollback Unavailable).</li>
            <li><strong className="text-slate-800">CONTINUE:</strong> Low risk, no significant deviations.</li>
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Security & Misuse Resistance</h2>
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            The prototype enforces several critical safety mechanisms:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm font-medium">
            <li><strong className="text-slate-800">Never Auto-Rollback:</strong> The system is advisory only. Action buttons simulate human execution.</li>
            <li><strong className="text-slate-800">Audit Trail:</strong> Every decision, especially overrides, creates an immutable log entry.</li>
            <li><strong className="text-slate-800">Role-Based Access:</strong> Viewers cannot make decisions. External partners are sandboxed to their organization. Auditors can view logs.</li>
            <li><strong className="text-slate-800">Missing Data Handling:</strong> Missing telemetry is not treated as &quot;zero risk&quot;. It triggers a confidence downgrade and escalates for human review.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
