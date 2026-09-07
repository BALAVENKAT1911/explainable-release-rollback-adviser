'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ExperimentPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/experiments')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <div className="p-8">Loading experiment results...</div>;

  const accuracyData = [
    {
      name: 'Accuracy',
      Baseline: stats.baseline.accuracy,
      Adviser: stats.adviser.accuracy,
    }
  ];
  
  const errorData = [
    {
      name: 'False Rollbacks',
      Baseline: stats.baseline.falseRollbacks,
      Adviser: stats.adviser.falseRollbacks,
    },
    {
      name: 'False Continues',
      Baseline: stats.baseline.falseContinues,
      Adviser: stats.adviser.falseContinues,
    }
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Experiment Results</h1>
          <p className="text-slate-500 text-sm mt-1">
            Comparing the Explainable Adviser against a baseline threshold method over {stats.total} simulated releases.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-slate-800">Decision Accuracy</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis domain={[0, 100]} stroke="#64748b" unit="%" />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Legend />
                <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Adviser" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            * Adviser accuracy excludes cases where it correctly identified that human review was necessary instead of guessing.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-slate-800">Error Comparison</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Legend />
                <Bar dataKey="Baseline" fill="#f87171" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Adviser" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Safety Escapement</h2>
        <p className="text-slate-700 mb-2">
          The Adviser system opted for <strong>HUMAN REVIEW REQUIRED</strong> on <strong>{stats.adviser.requiresReview}</strong> releases ({stats.adviser.reviewRate.toFixed(1)}%).
        </p>
        <p className="text-sm text-slate-600">
          Unlike the baseline which is forced to guess, the Adviser identifies edge cases (missing data, contradictory signals, missing rollback paths) and safely escalates them.
        </p>
      </div>
    </div>
  </div>
  );
}
