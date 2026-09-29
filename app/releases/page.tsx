'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAppContext } from '@/components/AppContext';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Lock, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ReleasesPage() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { organization, role } = useAppContext();
  
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('ALL');
  const [recFilter, setRecFilter] = useState('ALL');
  const [criticalityFilter, setCriticalityFilter] = useState('ALL');

  useEffect(() => {
    let ignore = false;
    fetch(`/api/releases?organization=${encodeURIComponent(organization)}&role=${encodeURIComponent(role)}`)
      .then(res => res.json())
      .then(data => {
        if (!ignore) {
          setReleases(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!ignore) {
          console.error(err);
          setLoading(false);
        }
      });
    return () => { ignore = true; };
  }, [organization, role]);

  const filteredReleases = releases.filter(r => {
    if (phaseFilter !== 'ALL' && r.phase !== phaseFilter) return false;
    if (recFilter !== 'ALL' && r.recommendation !== recFilter) return false;
    if (criticalityFilter !== 'ALL' && r.business_criticality !== criticalityFilter) return false;
    
    if (search) {
      const q = search.toLowerCase();
      const matchId = r.release_id.toLowerCase().includes(q);
      const matchService = r.service_name.toLowerCase().includes(q);
      const matchVersion = r.version.toLowerCase().includes(q);
      if (!matchId && !matchService && !matchVersion) return false;
    }
    return true;
  });

  const isPartner = role === 'External Partner';

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/70">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Title and Search/Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                Production Release Catalog
              </span>
              {isPartner && (
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Lock size={10} /> Partner Gamma Scoped
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Production Release Analysis</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Continuous deployment monitoring &bull; Telemetry evidence &bull; Deterministic rollback recommendations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input 
                type="text" 
                placeholder="Search release ID, service..." 
                className="pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-white shadow-sm font-medium"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1 mr-1">
              <Filter size={12} /> Filters:
            </span>

            {/* Phase Filter */}
            <select 
              value={phaseFilter} 
              onChange={e => setPhaseFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Lifecycle Phases</option>
              <option value="canary_5">Canary (5%)</option>
              <option value="canary_25">Canary (25%)</option>
              <option value="full_rollout">100% Rollout</option>
              <option value="baking">Baking Window</option>
              <option value="completed">Completed / Stable</option>
            </select>

            {/* Recommendation Filter */}
            <select 
              value={recFilter} 
              onChange={e => setRecFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Advisories</option>
              <option value="CONTINUE">CONTINUE (Normal)</option>
              <option value="HUMAN REVIEW REQUIRED">HUMAN REVIEW REQUIRED</option>
              <option value="ROLLBACK RECOMMENDED">ROLLBACK RECOMMENDED</option>
            </select>

            {/* Criticality Filter */}
            <select 
              value={criticalityFilter} 
              onChange={e => setCriticalityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Criticality Tiers</option>
              <option value="critical">Tier 1: Critical</option>
              <option value="medium">Tier 2: Medium</option>
              <option value="low">Tier 3: Low</option>
            </select>

            {(phaseFilter !== 'ALL' || recFilter !== 'ALL' || criticalityFilter !== 'ALL' || search) && (
              <button 
                onClick={() => { setPhaseFilter('ALL'); setRecFilter('ALL'); setCriticalityFilter('ALL'); setSearch(''); }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 ml-2 underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredReleases.length}</strong> of {releases.length} releases
          </div>
        </div>

        {/* Releases Table in Bento Container */}
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="p-4">Release ID / Service</th>
                  <th className="p-4">Phase & Bake Time</th>
                  <th className="p-4">Key Signals (vs Baseline)</th>
                  <th className="p-4">Risk Score</th>
                  <th className="p-4">Adviser Recommendation</th>
                  <th className="p-4">Rollback Readiness</th>
                  <th className="p-4">Decision State</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredReleases.map(r => {
                  const phaseDisplay: Record<string, { label: string; color: string }> = {
                    'canary_5': { label: 'Canary 5%', color: 'bg-purple-100 text-purple-700 border-purple-200' },
                    'canary_25': { label: 'Canary 25%', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                    'full_rollout': { label: '100% Rollout', color: 'bg-amber-100 text-amber-800 border-amber-200' },
                    'baking': { label: 'Baking', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                    'completed': { label: 'Stable', color: 'bg-slate-100 text-slate-700 border-slate-200' },
                    'rolled_back': { label: 'Rolled Back', color: 'bg-red-100 text-red-800 border-red-200' },
                    'escalated': { label: 'Escalated', color: 'bg-orange-100 text-orange-800 border-orange-200' }
                  };

                  const currentPhase = phaseDisplay[r.phase] || { label: r.phase, color: 'bg-slate-100 text-slate-700' };

                  return (
                    <tr key={r.release_id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="p-4">
                        <Link href={`/releases/${r.release_id}`} className="font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline block">
                          {r.release_id}
                        </Link>
                        <div className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                          <span>{r.service_name}</span>
                          <span className="text-[10px] font-normal text-slate-400 font-mono">({r.version})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {format(new Date(r.deployment_time), 'MMM d, HH:mm')} &bull; Tier {r.business_criticality.toUpperCase()}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md border ${currentPhase.color}`}>
                          {currentPhase.label}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-1 font-medium">
                          Bake: {r.bake_duration_minutes}m
                        </div>
                      </td>

                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-slate-400 w-12 font-medium">Latency:</span>
                          <span className={r.latency_ms > (r.latency_baseline_ms * 1.25) ? 'text-red-600 font-bold' : 'text-slate-700 font-semibold'}>
                            {r.latency_ms ? `${r.latency_ms}ms` : 'Missing'}
                          </span>
                          <span className="text-slate-400 text-[10px]">({r.latency_baseline_ms ? `${r.latency_baseline_ms}ms` : 'N/A'})</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-slate-400 w-12 font-medium">Errors:</span>
                          <span className={r.error_rate > 1.0 ? 'text-red-600 font-bold' : 'text-slate-700 font-semibold'}>
                            {r.error_rate !== null ? `${r.error_rate.toFixed(2)}%` : 'Missing'}
                          </span>
                          <span className="text-slate-400 text-[10px]">({r.baseline_error_rate !== null ? `${r.baseline_error_rate.toFixed(2)}%` : 'N/A'})</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full ${
                                r.risk_score >= 70 ? 'bg-red-500' : r.risk_score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, r.risk_score)}%` }}
                            ></div>
                          </div>
                          <span className={`font-mono font-black text-xs ${
                            r.risk_score >= 70 ? 'text-red-600' : r.risk_score >= 40 ? 'text-amber-600' : 'text-emerald-700'
                          }`}>
                            {r.risk_score}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          Confidence: {r.confidence} ({r.confidence_score}%)
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border ${
                          r.recommendation === 'ROLLBACK RECOMMENDED' ? 'bg-red-50 text-red-700 border-red-200' :
                          r.recommendation === 'HUMAN REVIEW REQUIRED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {r.recommendation === 'ROLLBACK RECOMMENDED' ? <AlertTriangle size={12} /> :
                           r.recommendation === 'HUMAN REVIEW REQUIRED' ? <ShieldAlert size={12} /> :
                           <CheckCircle size={12} />}
                          {r.recommendation}
                        </span>
                      </td>

                      <td className="p-4">
                        {r.rollback_available ? (
                          <div>
                            <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                              <CheckCircle size={12} className="text-emerald-500" /> Verified
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize block">
                              {r.rollback_strategy?.replace(/_/g, ' ') || 'Blue/Green'}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-red-600 font-bold text-[11px] flex items-center gap-1">
                              <AlertTriangle size={12} className="text-red-500" /> Unavailable
                            </span>
                            <span className="text-[10px] text-red-500 block">Schema Block</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        {r.has_decision ? (
                          <div>
                            <span className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px] font-bold">
                              {r.decision_status}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">by {r.decision_by}</span>
                            {r.requires_dual_approval && !r.secondary_approved && (
                              <span className="text-[9px] text-amber-600 font-bold block mt-0.5">
                                Pending 2nd Sign-off
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            Action Pending
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <Link 
                          href={`/releases/${r.release_id}`}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                        >
                          Evidence <ArrowRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {filteredReleases.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-500">
                      <p className="font-semibold text-sm">No releases match current filter criteria.</p>
                      <p className="text-xs mt-1">Try resetting filters or adjusting search terms.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
