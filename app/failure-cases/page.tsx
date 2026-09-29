'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldAlert, 
  AlertTriangle, 
  Database, 
  Radio, 
  Zap, 
  FileWarning, 
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export default function FailureCases() {
  const cases = [
    {
      id: 'REL-0996',
      title: 'Case 1: Silent Business Corruption / Micro-Failure',
      icon: AlertCircle,
      badge: 'Safety Invariant RUL-SAF-002',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
      description: 'HTTP status codes remain nominal green (99.98% HTTP 200 OK), but application logic is silently dropping order confirmations. Transaction failure rate is 18.5% with $42,000 revenue at risk.',
      challenge: 'Traditional devops monitors relying solely on HTTP 5xx errors assume this release is perfectly healthy.',
      expected: 'ROLLBACK RECOMMENDED (Confidence: High)',
      whyItMatters: 'Combines technical HTTP metrics with business throughput and revenue impact to prevent silent business catastrophe.'
    },
    {
      id: 'REL-0997',
      title: 'Case 2: Traffic Surge & Metric Drift (Black Friday)',
      icon: Zap,
      badge: 'Safety Invariant RUL-SAF-004',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Marketing campaign sends 3.4x normal transaction volume. Natural queue depth causes a 23% latency increase, but error rates remain flat at 0.07% and customer complaints are zero.',
      challenge: 'Static threshold models trigger false-alarm rollbacks, interrupting valid revenue surges.',
      expected: 'CONTINUE (Traffic Surge Drift Detector active)',
      whyItMatters: 'Prevents costly false-positive rollbacks during high-volume revenue generation windows.'
    },
    {
      id: 'REL-0998',
      title: 'Case 3: Telemetry Blackout / Agent Crash',
      icon: Radio,
      badge: 'Safety Invariant RUL-SAF-001',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Telemetry collection daemon crashes on host. Latency and transaction throughput arrive as null values.',
      challenge: 'Unsafe naive systems treat missing data as zero deviation and blindly approve releases.',
      expected: 'HUMAN REVIEW REQUIRED (Confidence: Low - 35%)',
      whyItMatters: 'Enforces the precautionary principle: never assume absence of evidence equals evidence of safety.'
    },
    {
      id: 'REL-0999',
      title: 'Case 4: Contradictory & Divergent Signals',
      icon: HelpCircle,
      badge: 'Safety Invariant RUL-SAF-003',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'P99 latency spikes by 850% due to background cache priming, but error rate is nominal (0.08%), customer complaints are 0, and transaction success is 99.92%.',
      challenge: 'Blind automated rollback destroys valuable cache warm-up and triggers unnecessary incident alerts.',
      expected: 'HUMAN REVIEW REQUIRED (Confidence: Medium)',
      whyItMatters: 'Dampens false alarms and prompts engineer verification before taking destructive action.'
    },
    {
      id: 'REL-1000',
      title: 'Case 5: Rollback Blocked (Irreversible Schema Migration)',
      icon: Database,
      badge: 'Safety Invariant RUL-SAF-005',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      description: 'Database schema migration dropped a critical table column without backward compatibility. Error rate spiked to 6.8%, but rollback script is flagged UNAVAILABLE.',
      challenge: 'Autonomous rollback would cause data loss or pipeline panic if executed without a valid reverse script.',
      expected: 'HUMAN REVIEW REQUIRED (Rollback Blocked - War Room Mandatory)',
      whyItMatters: 'Hard safety invariant: the advisory never recommends rollback when execution path is invalid.'
    }
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/70">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                Resilience & Misuse Resistance
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise Edge & Failure Test Bench</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Demonstrating how the Explainable Adviser behaves under telemetry failure, contradictory data, and operational constraints.
            </p>
          </div>

          <div className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
            Total Validated Edge Scenarios: <strong className="text-slate-900">5 Modes</strong>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => {
            const Icon = c.icon;
            return (
              <div 
                key={c.id} 
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-slate-100 text-slate-800 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Icon size={22} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${c.badgeColor}`}>
                      {c.badge}
                    </span>
                  </div>

                  <span className="font-mono text-xs font-bold text-indigo-600 mb-1 block">{c.id}</span>
                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed font-medium">
                    {c.description}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] mb-3 text-slate-600">
                    <strong className="text-slate-700 block mb-0.5">Failure Challenge:</strong>
                    {c.challenge}
                  </div>

                  <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] mb-4">
                    <strong className="text-indigo-900 block mb-0.5 uppercase tracking-wider text-[10px]">
                      Expected System Behavior
                    </strong>
                    <span className="font-bold text-indigo-700">{c.expected}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 mb-4 italic">
                    {c.whyItMatters}
                  </p>
                  <Link 
                    href={`/releases/${c.id}`}
                    className="inline-flex items-center justify-center w-full gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    <span>Launch & Inspect Scenario</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
