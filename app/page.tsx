'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAppContext } from '@/components/AppContext';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const { organization } = useAppContext();

  useEffect(() => {
    fetch('/api/experiments')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Overview Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-500 text-sm tracking-wide uppercase">Total Analyzed</h3>
              <Activity className="text-indigo-500" size={20} />
            </div>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-black text-slate-800 tracking-tight">{stats.total}</p>
              <p className="text-xs font-semibold text-slate-400 mb-1">Releases</p>
            </div>
          </div>
          
          <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-500 text-sm tracking-wide uppercase">Human Review Req</h3>
              <AlertTriangle className="text-amber-500" size={20} />
            </div>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-black text-slate-800 tracking-tight">{stats.adviser.requiresReview}</p>
              <p className="text-xs font-semibold text-slate-400 mb-1">Escalated</p>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-500 text-sm tracking-wide uppercase">Baseline Accuracy</h3>
              <CheckCircle className="text-slate-400" size={20} />
            </div>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-black text-slate-800 tracking-tight">{stats.baseline.accuracy.toFixed(1)}%</p>
              <p className="text-xs font-semibold text-slate-400 mb-1">Simple Threshold</p>
            </div>
          </div>

          <div className="bg-indigo-900 border border-indigo-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between h-32 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-indigo-300 text-sm tracking-wide uppercase">Adviser Accuracy</h3>
              <ShieldAlert className="text-indigo-400" size={20} />
            </div>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-black tracking-tight">{stats.adviser.accuracy.toFixed(1)}%</p>
              <p className="text-xs font-semibold text-indigo-400 mb-1">Automated</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-semibold text-sm tracking-wider uppercase text-slate-500">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/releases" className="flex flex-col p-6 rounded-xl bg-slate-50 hover:bg-indigo-50 border hover:border-indigo-200 transition-colors group">
              <h3 className="font-bold text-slate-800 group-hover:text-indigo-700 text-lg mb-2 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600"><Activity size={16}/></span> Analyze Releases
              </h3>
              <p className="text-slate-600 text-sm font-medium">View recent deployments and their calculated risk scores.</p>
            </Link>
            
            <Link href="/failure-cases" className="flex flex-col p-6 rounded-xl bg-slate-50 hover:bg-amber-50 border hover:border-amber-200 transition-colors group">
              <h3 className="font-bold text-slate-800 group-hover:text-amber-700 text-lg mb-2 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-600"><AlertTriangle size={16}/></span> Edge Cases
              </h3>
              <p className="text-slate-600 text-sm font-medium">Test the engine against missing data and contradictory signals.</p>
            </Link>

            <Link href="/experiments" className="flex flex-col p-6 rounded-xl bg-slate-50 hover:bg-emerald-50 border hover:border-emerald-200 transition-colors group">
              <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 text-lg mb-2 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600"><CheckCircle size={16}/></span> Experiment Results
              </h3>
              <p className="text-slate-600 text-sm font-medium">Compare Adviser performance vs Baseline simple rules.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
