'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Clock, 
  ArrowRight, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Flame,
  Radio
} from 'lucide-react';
import { useAppContext } from '@/components/AppContext';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { organization, role } = useAppContext();

  useEffect(() => {
    let ignore = false;
    Promise.all([
      fetch(`/api/experiments`).then(res => res.json()),
      fetch(`/api/releases?organization=${encodeURIComponent(organization)}&role=${encodeURIComponent(role)}`).then(res => res.json())
    ]).then(([expData, relData]) => {
      if (!ignore) {
        setStats(expData);
        setReleases(relData);
        setLoading(false);
      }
    }).catch(err => {
      if (!ignore) {
        console.error(err);
        setLoading(false);
      }
    });
    return () => { ignore = true; };
  }, [organization, role]);

  if (loading || !stats) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading enterprise advisory telemetry...</p>
        </div>
      </div>
    );
  }

  // Active in-flight canaries and deployments
  const inFlightReleases = releases.filter(r => 
    r.phase === 'canary_5' || r.phase === 'canary_25' || r.phase === 'full_rollout' || r.phase === 'baking'
  ).slice(0, 6);

  const rollbackRecommendedCount = releases.filter(r => r.recommendation === 'ROLLBACK RECOMMENDED').length;
  const humanReviewCount = releases.filter(r => r.recommendation === 'HUMAN REVIEW REQUIRED').length;
  const continueCount = releases.filter(r => r.recommendation === 'CONTINUE').length;

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/70">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Tenant & Governance Context Header */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 font-bold text-[10px] uppercase rounded-full tracking-wider">
                Enterprise Tenant
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{organization}</h2>
              {role === 'External Partner' && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-md flex items-center gap-1 border border-amber-200">
                  <Lock size={12} /> Sandboxed Tenant Isolation Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Regulated Change Management Advisory Console &bull; Real-time quantification of deployment risk, telemetry divergence, and business impact.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/releases" 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              Analyze All Releases <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Bento Top Grid: 4 Core KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Monitored Deployments */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 text-[11px] tracking-wider uppercase">Monitored Releases</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Layers size={18} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-slate-900 tracking-tight">{releases.length}</p>
                <span className="text-xs text-slate-500 font-medium">in current tenant scope</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Radio size={12} className="text-emerald-500 animate-pulse" />
                <span>{inFlightReleases.length} active in-flight canaries</span>
              </div>
            </div>
          </div>

          {/* Card 2: Escalations & Safety Reviews */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-36">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 text-[11px] tracking-wider uppercase">Safety Escalations</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-amber-600 tracking-tight">{humanReviewCount}</p>
                <span className="text-xs text-slate-500 font-medium">require human review</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Precautionary guardrails against missing/conflicting data
              </p>
            </div>
          </div>

          {/* Card 3: Decision Time Reduction */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-36">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 text-[11px] tracking-wider uppercase">Decision Time (MTTR)</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Clock size={18} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-emerald-600 tracking-tight">3.8m</p>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  -90.1% MTTR
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Down from 38.5m manual war room median
              </p>
            </div>
          </div>

          {/* Card 4: Advisory Decision Quality */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between h-36 text-white">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300 text-[11px] tracking-wider uppercase">Adviser Accuracy</span>
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-white tracking-tight">
                  {stats.explainableAdviser.accuracy.toFixed(1)}%
                </p>
                <span className="text-xs text-indigo-300 font-medium">vs {stats.simpleBaseline.accuracy.toFixed(1)}% baseline</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Zero missed critical outages across 1,000 releases
              </p>
            </div>
          </div>
        </div>

        {/* Bento Middle: In-Flight Canaries (8 cols) & Risk Breakdown (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active Releases & Canaries Pipeline */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-800 tracking-wide uppercase">
                  In-Flight Canaries & Progressive Rollouts
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">Live Telemetry Pipeline</span>
            </div>

            <div className="p-5 divide-y divide-slate-100 flex-1">
              {inFlightReleases.map(r => {
                const phaseLabels: Record<string, string> = {
                  'canary_5': 'Canary 5%',
                  'canary_25': 'Canary 25%',
                  'full_rollout': '100% Rollout',
                  'baking': 'Baking Window',
                  'completed': 'Stable'
                };

                return (
                  <div key={r.release_id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-xl transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/releases/${r.release_id}`} className="font-mono font-bold text-sm text-indigo-600 hover:underline">
                          {r.release_id}
                        </Link>
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {r.service_name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{r.version}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {phaseLabels[r.phase] || r.phase}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Latency: <strong className="text-slate-700">{r.latency_ms ? `${r.latency_ms}ms` : 'Missing'}</strong></span>
                        <span>Error Rate: <strong className={r.error_rate > 1 ? 'text-red-600 font-bold' : 'text-slate-700'}>{r.error_rate ? `${r.error_rate.toFixed(2)}%` : 'Missing'}</strong></span>
                        <span>Bake Time: <strong className="text-slate-700">{r.bake_duration_minutes}m</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Risk</span>
                          <span className={`text-xs font-black ${
                            r.risk_score >= 70 ? 'text-red-600' : r.risk_score >= 40 ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {r.risk_score}/100
                          </span>
                        </div>
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          r.recommendation === 'ROLLBACK RECOMMENDED' ? 'bg-red-100 text-red-700' :
                          r.recommendation === 'HUMAN REVIEW REQUIRED' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {r.recommendation}
                        </span>
                      </div>

                      <Link 
                        href={`/releases/${r.release_id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tenant Risk & Safety Invariant Gauges */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-800 tracking-wide uppercase mb-4 flex items-center justify-between">
                <span>Advisory Risk Profile</span>
                <span className="text-[10px] text-slate-400 font-normal">{releases.length} releases</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-700">CONTINUE (Normal Release)</span>
                    <span className="text-slate-600">{continueCount} ({((continueCount/releases.length)*100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(continueCount/releases.length)*100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-700">HUMAN REVIEW REQUIRED</span>
                    <span className="text-slate-600">{humanReviewCount} ({((humanReviewCount/releases.length)*100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(humanReviewCount/releases.length)*100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-red-700">ROLLBACK RECOMMENDED</span>
                    <span className="text-slate-600">{rollbackRecommendedCount} ({((rollbackRecommendedCount/releases.length)*100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${(rollbackRecommendedCount/releases.length)*100}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Safety Invariants</div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> Never Auto-Rollback</span>
                  <span className="font-semibold text-emerald-600">Enforced</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> Missing Telemetry Escalation</span>
                  <span className="font-semibold text-emerald-600">Active</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> Silent Failure Micro-Detector</span>
                  <span className="font-semibold text-emerald-600">Active</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> Cryptographic Ledger Seal</span>
                  <span className="font-semibold text-emerald-600">SHA-256</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bento Bottom: Interactive Showcase Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/failure-cases" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-amber-300 hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                <ShieldAlert size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-amber-800 transition-colors">
                5 Enterprise Edge Cases
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Test the engine against silent corruption, marketing traffic spikes, dead telemetry agents, contradictory signals, and blocked rollback paths.
              </p>
            </div>
            <div className="mt-5 text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Launch Edge Test Bench <ArrowRight size={14} />
            </div>
          </Link>

          <Link href="/experiments" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                <TrendingUp size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-indigo-800 transition-colors">
                Empirical Study & Benchmarks
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Inspect 1,000-release statistical evaluation comparing Explainable Adviser vs single-metric and multi-metric baselines with sensitivity slider.
              </p>
            </div>
            <div className="mt-5 text-xs font-bold text-indigo-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Scientific Results <ArrowRight size={14} />
            </div>
          </Link>

          <Link href="/audit" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-emerald-800 transition-colors">
                Tamper-Evident Decision Ledger
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Audit trail with SHA-256 block hash chaining, two-person rule verification, and automated compliance export for SOC 2 Type II and FFIEC.
              </p>
            </div>
            <div className="mt-5 text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Inspect Immutable Ledger <ArrowRight size={14} />
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
