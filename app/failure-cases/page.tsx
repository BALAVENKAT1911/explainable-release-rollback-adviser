'use client';

import Link from 'next/link';
import { ArrowRight, ShieldAlert, AlertCircle, RefreshCw } from 'lucide-react';

export default function FailureCases() {
  const cases = [
    {
      title: 'Case 1: Missing Telemetry',
      description: 'Latency data is missing for a release. The system should not blindly recommend CONTINUE, but escalate for human review.',
      expected: 'HUMAN REVIEW REQUIRED',
      releaseId: 'REL-0998' // Hardcoded based on generation logic
    },
    {
      title: 'Case 2: Contradictory Signals',
      description: 'Latency is extremely high, but error rate is low and customer impact is zero. Blindly rolling back might be wrong.',
      expected: 'HUMAN REVIEW REQUIRED (Medium Confidence)',
      releaseId: 'REL-0999'
    },
    {
      title: 'Case 3: Rollback Unavailable',
      description: 'A database migration went wrong. The risk is high, but the rollback script is missing.',
      expected: 'HUMAN REVIEW REQUIRED (Rollback unavailable)',
      releaseId: 'REL-1000'
    }
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Edge & Failure Cases</h1>
          <p className="text-slate-500 text-sm mt-1">Demonstrating system resilience against incomplete or contradictory data.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors group h-full">
              <div>
                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl inline-block mb-4 shadow-sm group-hover:bg-amber-200 transition-colors">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{c.title}</h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed font-medium">{c.description}</p>
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-xs mb-6">
                  <strong className="text-slate-500 block mb-1 uppercase tracking-wider">Expected Behavior</strong>
                  <span className="text-slate-800 font-semibold">{c.expected}</span>
                </div>
              </div>
              <Link 
                href={`/releases/${c.releaseId}`}
                className="inline-flex items-center justify-center w-full gap-2 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 py-3 rounded-xl transition-colors"
              >
                Inspect Scenario <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
