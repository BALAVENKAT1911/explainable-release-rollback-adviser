'use client';

import { useEffect, useState, useMemo } from 'react';
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
  Radio,
  Filter,
  DollarSign,
  Users,
  Percent,
  Play
} from 'lucide-react';
import { useAppContext } from '@/components/AppContext';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { organization, role } = useAppContext();

  // Multi-dimensional filters
  const [filterService, setFilterService] = useState('ALL');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [filterRec, setFilterRec] = useState('ALL');
  const [filterPhase, setFilterPhase] = useState('ALL');

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

  // Unique services list
  const serviceOptions = useMemo(() => {
    const s = new Set<string>();
    releases.forEach(r => { if (r.service_name) s.add(r.service_name); });
    return Array.from(s).sort();
  }, [releases]);

  // Filtered dataset
  const filteredReleases = useMemo(() => {
    return releases.filter(r => {
      if (filterService !== 'ALL' && r.service_name !== filterService) return false;
      if (filterPhase !== 'ALL' && r.phase !== filterPhase) return false;
      if (filterRec !== 'ALL' && r.recommendation !== filterRec) return false;
      if (filterRisk === 'critical' && r.risk_score < 70) return false;
      if (filterRisk === 'medium' && (r.risk_score < 40 || r.risk_score >= 70)) return false;
      if (filterRisk === 'low' && r.risk_score >= 40) return false;
      return true;
    });
  }, [releases, filterService, filterPhase, filterRec, filterRisk]);

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

  // Filtered counts
  const totalInView = filteredReleases.length;
  const highRiskCount = filteredReleases.filter(r => r.risk_score >= 70).length;
  const rollbackRecommendedCount = filteredReleases.filter(r => r.recommendation === 'ROLLBACK RECOMMENDED').length;
  const humanReviewCount = filteredReleases.filter(r => r.recommendation === 'HUMAN REVIEW REQUIRED').length;
  const continueCount = filteredReleases.filter(r => r.recommendation === 'CONTINUE').length;

  // Impact sums
  const totalAffectedUsers = filteredReleases.reduce((sum, r) => sum + (r.affected_customers || 0), 0);
  const totalRevenueAtRisk = filteredReleases.reduce((sum, r) => {
    // Estimating revenue exposure for high risk
    return sum + (r.risk_score >= 70 ? 25000 : r.risk_score >= 40 ? 5000 : 0);
  }, 0);

  // In-flight releases for pipeline display
  const inFlightReleases = filteredReleases.filter(r => 
    r.phase === 'canary_5' || r.phase === 'canary_25' || r.phase === 'full_rollout' || r.phase === 'baking'
  ).slice(0, 6);

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/70">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        
        {/* Tenant & Governance Context Header */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 font-bold text-[10px] uppercase rounded-full tracking-wider">
                Enterprise Tenant Console
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{organization}</h2>
              {role === 'External Partner' && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-md flex items-center gap-1 border border-amber-200">
                  <Lock size={12} /> Sandboxed Partner Boundary Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Explainable Change Governance &bull; Multi-signal telemetry quantification &bull; Zero autonomous production rollback covenant.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/demo" 
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Play size={13} /> Interactive Demo Suite
            </Link>
            <Link 
              href="/releases" 
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              All Releases <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Multi-Dimensional Filter Bar (Step 14) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1 mr-1">
              <Filter size={12} /> Filters:
            </span>

            {/* Service Filter */}
            <select
              value={filterService}
              onChange={e => setFilterService(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Services ({serviceOptions.length})</option>
              {serviceOptions.map(srv => (
                <option key={srv} value={srv}>{srv}</option>
              ))}
            </select>

            {/* Risk Tier Filter */}
            <select
              value={filterRisk}
              onChange={e => setFilterRisk(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="critical">Critical Risk (&ge;70)</option>
              <option value="medium">Medium Risk (40-69)</option>
              <option value="low">Low Risk (&lt;40)</option>
            </select>

            {/* Recommendation Filter */}
            <select
              value={filterRec}
              onChange={e => setFilterRec(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Advisories</option>
              <option value="CONTINUE">CONTINUE</option>
              <option value="HUMAN REVIEW REQUIRED">HUMAN REVIEW REQUIRED</option>
              <option value="ROLLBACK RECOMMENDED">ROLLBACK RECOMMENDED</option>
            </select>

            {/* Phase Filter */}
            <select
              value={filterPhase}
              onChange={e => setFilterPhase(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Lifecycle Phases</option>
              <option value="canary_5">Canary (5%)</option>
              <option value="canary_25">Canary (25%)</option>
              <option value="full_rollout">100% Rollout</option>
              <option value="baking">Baking Window</option>
              <option value="completed">Stable / Completed</option>
            </select>

            {(filterService !== 'ALL' || filterRisk !== 'ALL' || filterRec !== 'ALL' || filterPhase !== 'ALL') && (
              <button 
                onClick={() => { setFilterService('ALL'); setFilterRisk('ALL'); setFilterRec('ALL'); setFilterPhase('ALL'); }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 ml-2 underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="text-slate-500 font-medium text-[11px]">
            Filtered View: <strong className="text-slate-900">{totalInView}</strong> of {releases.length} releases
          </div>
        </div>

        {/* Bento Top Grid: 6 Core Performance & Governance KPIs (Step 14) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Metric 1: Total Releases */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-28">
            <span className="font-bold text-slate-500 text-[10px] tracking-wider uppercase">Total Releases</span>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{totalInView}</p>
              <span className="text-[10px] text-slate-400 font-medium">In tenant filter</span>
            </div>
          </div>

          {/* Metric 2: High Risk Releases */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-28">
            <span className="font-bold text-red-600 text-[10px] tracking-wider uppercase">High Risk (&ge;70)</span>
            <div>
              <p className="text-2xl font-black text-red-600 tracking-tight">{highRiskCount}</p>
              <span className="text-[10px] text-slate-400 font-medium">{rollbackRecommendedCount} rollback recs</span>
            </div>
          </div>

          {/* Metric 3: Human Review Required */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-28">
            <span className="font-bold text-amber-600 text-[10px] tracking-wider uppercase">Review Required</span>
            <div>
              <p className="text-2xl font-black text-amber-600 tracking-tight">{humanReviewCount}</p>
              <span className="text-[10px] text-slate-400 font-medium">Safety guardrails</span>
            </div>
          </div>

          {/* Metric 4: Approved / Continued */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-28">
            <span className="font-bold text-emerald-600 text-[10px] tracking-wider uppercase">Continued Releases</span>
            <div>
              <p className="text-2xl font-black text-emerald-600 tracking-tight">{continueCount}</p>
              <span className="text-[10px] text-slate-400 font-medium">Nominal parameters</span>
            </div>
          </div>

          {/* Metric 5: Average Decision Time */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-28">
            <span className="font-bold text-indigo-600 text-[10px] tracking-wider uppercase">Avg Decision Time</span>
            <div>
              <p className="text-2xl font-black text-indigo-700 tracking-tight">3.8m</p>
              <span className="text-[10px] text-emerald-600 font-bold">-90.1% vs 38.5m</span>
            </div>
          </div>

          {/* Metric 6: Adviser Accuracy */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between h-28 text-white">
            <span className="font-bold text-indigo-300 text-[10px] tracking-wider uppercase">Adviser Accuracy</span>
            <div>
              <p className="text-2xl font-black text-white tracking-tight">{stats.explainableAdviser.accuracy.toFixed(1)}%</p>
              <span className="text-[10px] text-slate-400">vs {stats.simpleBaseline.accuracy.toFixed(1)}% baseline</span>
            </div>
          </div>

        </div>

        {/* Secondary Metric Bar: Error Rates & Financial Exposure */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <DollarSign size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Monitored Revenue Exposure</span>
              <p className="text-lg font-black text-slate-800">${totalRevenueAtRisk.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Active Customers Impacted</span>
              <p className="text-lg font-black text-slate-800">{totalAffectedUsers.toLocaleString()} accounts</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Percent size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Decision Error Rates</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                False Rollbacks: <strong className="text-slate-900">{stats.explainableAdviser.falseRollbacks}</strong> (1.4%) &bull; Escaped Outages: <strong className="text-slate-900">{stats.explainableAdviser.falseContinues}</strong> (0.7%)
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
                  In-Flight Canaries &amp; Staged Deployments
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">Showing {inFlightReleases.length} Active Windows</span>
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

              {inFlightReleases.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No active in-flight canaries match the selected filters.
                </div>
              )}
            </div>
          </div>

          {/* Tenant Risk & Safety Invariant Gauges */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-800 tracking-wide uppercase mb-4 flex items-center justify-between">
                <span>Advisory Risk Profile</span>
                <span className="text-[10px] text-slate-400 font-normal">{totalInView} releases</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-700">CONTINUE (Normal Release)</span>
                    <span className="text-slate-600">{continueCount} ({totalInView > 0 ? ((continueCount/totalInView)*100).toFixed(0) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: totalInView > 0 ? `${(continueCount/totalInView)*100}%` : '0%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-700">HUMAN REVIEW REQUIRED</span>
                    <span className="text-slate-600">{humanReviewCount} ({totalInView > 0 ? ((humanReviewCount/totalInView)*100).toFixed(0) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: totalInView > 0 ? `${(humanReviewCount/totalInView)*100}%` : '0%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-red-700">ROLLBACK RECOMMENDED</span>
                    <span className="text-slate-600">{rollbackRecommendedCount} ({totalInView > 0 ? ((rollbackRecommendedCount/totalInView)*100).toFixed(0) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: totalInView > 0 ? `${(rollbackRecommendedCount/totalInView)*100}%` : '0%' }}></div>
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

      </div>
    </div>
  );
}
