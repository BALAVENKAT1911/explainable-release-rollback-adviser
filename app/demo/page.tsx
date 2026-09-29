'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Lock, 
  Radio, 
  RotateCcw, 
  ArrowRight, 
  Zap, 
  Building2, 
  UserCheck, 
  FileCheck,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAppContext } from '@/components/AppContext';

export default function DemoPage() {
  const router = useRouter();
  const { setRole, setOrganization } = useAppContext();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [testOutput, setTestOutput] = useState<string>('');
  const [runningTest, setRunningTest] = useState<boolean>(false);

  // 8 Predefined Scenarios
  const scenarios = [
    {
      id: 'DEMO-1',
      title: 'Healthy Release Baseline',
      releaseId: 'REL-0010',
      role: 'Release Manager',
      org: 'Org Alpha',
      badge: 'Normal Progression',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Latency, errors, and throughput remain within baseline SLA tolerances. System advises CONTINUE.',
      targetUrl: '/releases/REL-0010'
    },
    {
      id: 'DEMO-2',
      title: 'High Error & High Latency Spike',
      releaseId: 'REL-0003',
      role: 'Release Manager',
      org: 'Org Alpha',
      badge: 'Critical Outage',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      description: 'Error rate spikes +5.4% above baseline with heavy queue delays. System advises ROLLBACK RECOMMENDED.',
      targetUrl: '/releases/REL-0003'
    },
    {
      id: 'DEMO-3',
      title: 'High Customer Blast Radius',
      releaseId: 'REL-0996',
      role: 'Release Manager',
      org: 'Org Alpha',
      badge: 'Business Critical',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      description: 'Silent business corruption: HTTP 200 green status but 18.5% failed orders ($42,000 revenue at risk).',
      targetUrl: '/releases/REL-0996'
    },
    {
      id: 'DEMO-4',
      title: 'Telemetry Blackout (Precautionary Invariant)',
      releaseId: 'REL-0998',
      role: 'Engineer',
      org: 'Org Alpha',
      badge: 'Missing Telemetry',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Agent crash creates missing metrics. Precautionary principle downgrades confidence to Low and escalates.',
      targetUrl: '/releases/REL-0998'
    },
    {
      id: 'DEMO-5',
      title: 'Conflicting Signals (False Alarm Dampener)',
      releaseId: 'REL-0999',
      role: 'Engineer',
      org: 'Org Beta',
      badge: 'Signal Divergence',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'P99 latency jumps 850% due to background indexing, but customer impact is 0. False alarm dampener activates.',
      targetUrl: '/releases/REL-0999'
    },
    {
      id: 'DEMO-6',
      title: 'Rollback Blocked (Irreversible Migration)',
      releaseId: 'REL-1000',
      role: 'Release Manager',
      org: 'Org Alpha',
      badge: 'Rollback Invariant',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      description: 'High error rate but reverse migration script is missing. Automated rollback advice is strictly blocked.',
      targetUrl: '/releases/REL-1000'
    },
    {
      id: 'DEMO-7',
      title: 'External Partner Scoped Sandboxing',
      releaseId: 'REL-0001',
      role: 'External Partner',
      org: 'External Partner Gamma',
      badge: 'Tenant Isolation',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      description: 'Simulates External Partner Gamma trying to query Org Alpha releases. System returns 403 Forbidden.',
      targetUrl: '/releases/REL-0001'
    },
    {
      id: 'DEMO-8',
      title: 'Unauthorized Approval Protection',
      releaseId: 'REL-0002',
      role: 'Viewer',
      org: 'Org Alpha',
      badge: 'RBAC Enforcement',
      badgeColor: 'bg-slate-200 text-slate-800 border-slate-300',
      description: 'Viewer role attempts to authorize a production rollback. Server-side validation rejects with 403.',
      targetUrl: '/releases/REL-0002'
    }
  ];

  const launchScenario = (s: any) => {
    setRole(s.role as any);
    setOrganization(s.org as any);
    router.push(s.targetUrl);
  };

  const runMisuseLive = async (testNum: number) => {
    setRunningTest(true);
    setTestOutput('Dispatching adversarial security request to backend API...');

    try {
      if (testNum === 1) {
        // Viewer attempts rollback
        const res = await fetch('/api/releases/REL-0001/decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision: 'ROLLBACK', userRole: 'Viewer' })
        });
        const data = await res.json();
        setTestOutput(`[HTTP ${res.status}] ${res.status === 403 ? 'SUCCESSFULLY DENIED' : 'FAILED'}\nResponse: ${JSON.stringify(data, null, 2)}`);
      } else if (testNum === 2) {
        // Cross-tenant breach attempt
        const res = await fetch('/api/releases/REL-0001?role=External%20Partner&organization=External%20Partner%20Gamma');
        const data = await res.json();
        setTestOutput(`[HTTP ${res.status}] ${res.status === 403 ? 'CROSS-TENANT ACCESS BLOCKED' : 'FAILED'}\nResponse: ${JSON.stringify(data, null, 2)}`);
      } else if (testNum === 3) {
        // Negative latency
        const res = await fetch('/api/releases/REL-0001/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latency_ms: -50, userRole: 'Engineer' })
        });
        const data = await res.json();
        setTestOutput(`[HTTP ${res.status}] ${res.status === 422 ? 'PHYSICALLY IMPOSSIBLE METRIC REJECTED' : 'FAILED'}\nResponse: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (e: any) {
      setTestOutput(`Network Error: ${e.message}`);
    } finally {
      setRunningTest(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/70">
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        
        {/* Top Header */}
        <header className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                Interactive Demonstration &amp; Evaluation Suite
              </span>
              <span className="text-[10px] font-semibold text-slate-500">Milestone 100% Evaluation Ready</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Demonstration Console</h1>
            <p className="text-slate-500 text-xs mt-1">
              Test end-to-end advisory workflows, evaluate edge scenarios, and verify security invariants with one click.
            </p>
          </div>

          <Link 
            href="/experiments"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Activity size={14} /> View Empirical Benchmarks
          </Link>
        </header>

        {/* Section 1: Three-Step Canonical Walkthrough (Step 23) */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600" />
                Canonical 3-Step Evaluation Walkthrough
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Proves detection, explainability, human authorization, override governance, and security isolation.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className={`px-2 py-0.5 rounded ${activeStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Step 1</span>
              <span className={`px-2 py-0.5 rounded ${activeStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Step 2</span>
              <span className={`px-2 py-0.5 rounded ${activeStep === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Step 3</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Step 1 Card */}
            <div className={`p-4 rounded-xl border transition-all ${activeStep === 1 ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-indigo-700">Scenario 1</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Rollback Advisory</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Critical Degradation &amp; Approval</h3>
              <p className="text-xs text-slate-600 mb-4 font-medium">
                Payment Gateway suffers +5.4% error spike. System quantifies risk (85/100), outputs evidence waterfall, and requires human confirmation.
              </p>
              <button
                onClick={() => {
                  setActiveStep(1);
                  setRole('Release Manager');
                  setOrganization('Org Alpha');
                  router.push('/releases/REL-0003');
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span>Launch Scenario 1</span> <ArrowRight size={13} />
              </button>
            </div>

            {/* Step 2 Card */}
            <div className={`p-4 rounded-xl border transition-all ${activeStep === 2 ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-amber-700">Scenario 2</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">Override Governance</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Force Continue with Rationale</h3>
              <p className="text-xs text-slate-600 mb-4 font-medium">
                Release Manager attempts &quot;Force Continue&quot;. System mandates approved override category + min 15-char rationale, sealing audit hash.
              </p>
              <button
                onClick={() => {
                  setActiveStep(2);
                  setRole('Release Manager');
                  setOrganization('Org Alpha');
                  router.push('/releases/REL-0996');
                }}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span>Launch Scenario 2</span> <ArrowRight size={13} />
              </button>
            </div>

            {/* Step 3 Card */}
            <div className={`p-4 rounded-xl border transition-all ${activeStep === 3 ? 'bg-slate-100 border-slate-300 ring-1 ring-slate-300' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-700">Scenario 3</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-800 rounded-full">Security Boundary</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Partner Isolation &amp; Denial</h3>
              <p className="text-xs text-slate-600 mb-4 font-medium">
                Simulates External Partner Gamma attempting to access core retail banking releases. System intercepts and returns HTTP 403 Forbidden.
              </p>
              <button
                onClick={() => {
                  setActiveStep(3);
                  setRole('External Partner');
                  setOrganization('External Partner Gamma');
                  router.push('/releases/REL-0001');
                }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span>Launch Scenario 3</span> <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: 8 Predefined One-Click Scenarios */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Layers size={16} className="text-indigo-600" />
              Eight Predefined Evaluation Scenarios
            </h2>
            <span className="text-xs text-slate-500 font-medium">One-click context configuration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {scenarios.map((s) => (
              <div 
                key={s.id} 
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-bold text-slate-400">{s.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badgeColor}`}>
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                    {s.title}
                  </h3>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed font-medium">
                    {s.description}
                  </p>

                  <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3 space-y-0.5">
                    <div>Target: <strong className="text-indigo-600 font-mono">{s.releaseId}</strong></div>
                    <div>Simulated Role: <strong className="text-slate-800">{s.role}</strong></div>
                    <div>Tenant: <strong className="text-slate-800">{s.org}</strong></div>
                  </div>
                </div>

                <button
                  onClick={() => launchScenario(s)}
                  className="w-full py-2 bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Play size={12} />
                  <span>Launch Scenario</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Live Misuse API Execution Console */}
        <section className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Lock size={16} className="text-indigo-400" />
                Live Adversarial &amp; Misuse API Interceptor
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Execute live adversarial payloads against the server backend and inspect HTTP response codes.
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
              Active Security Guardrails
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => runMisuseLive(1)}
              disabled={runningTest}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-100">Test 1: Privilege Escalation</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Viewer calls POST /decision</div>
            </button>

            <button
              onClick={() => runMisuseLive(2)}
              disabled={runningTest}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-100">Test 2: Cross-Tenant Query</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Partner queries Org Alpha</div>
            </button>

            <button
              onClick={() => runMisuseLive(3)}
              disabled={runningTest}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-100">Test 3: Negative Metric (-50ms)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Invalid metric submission</div>
            </button>
          </div>

          {testOutput && (
            <div className="p-3.5 bg-black/40 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 whitespace-pre-wrap">
              {testOutput}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
