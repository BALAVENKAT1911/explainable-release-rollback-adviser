'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  ShieldAlert, 
  FileText, 
  Info, 
  Activity,
  AlertTriangle,
  RotateCcw,
  FastForward,
  Lock,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Cpu,
  Layers,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useAppContext } from '@/components/AppContext';

export default function ReleaseAnalysis() {
  const params = useParams();
  const router = useRouter();
  const { role, organization } = useAppContext();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'latency' | 'error' | 'tpm'>('latency');
  
  // Decision Form State
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  // Lifecycle Advancement State
  const [advancingPhase, setAdvancingPhase] = useState(false);

  const fetchReleaseData = useCallback(() => {
    fetch(`/api/releases/${params.id}?organization=${encodeURIComponent(organization)}&role=${encodeURIComponent(role)}`)
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to load release');
        }
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setData({ error: e.message });
        setLoading(false);
      });
  }, [params.id, organization, role]);

  useEffect(() => {
    fetchReleaseData();
  }, [fetchReleaseData]);

  const handleDecision = async (decision: 'CONTINUE' | 'ROLLBACK' | 'ESCALATED') => {
    setActionSuccessMsg('');
    setActionErrorMsg('');

    if (decision === 'CONTINUE' && data.recommendation.recommendation === 'ROLLBACK RECOMMENDED') {
      if (!overrideReason) {
        setActionErrorMsg('Mandatory: Select an approved Override Reason category before continuing.');
        return;
      }
      if (!overrideNotes || overrideNotes.trim().length < 15) {
        setActionErrorMsg('Mandatory: Provide a detailed technical justification (minimum 15 characters).');
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/releases/${params.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          userRole: role,
          actorName: role === 'Release Manager' ? 'Sarah Chen (Lead RM)' : 'Alex Mercer (Staff SRE)',
          overrideReason: decision === 'CONTINUE' && data.recommendation.recommendation === 'ROLLBACK RECOMMENDED' ? overrideReason : undefined,
          overrideNotes: decision === 'CONTINUE' && data.recommendation.recommendation === 'ROLLBACK RECOMMENDED' ? overrideNotes : undefined
        })
      });
      
      const resJson = await res.json();
      if (res.ok) {
        setActionSuccessMsg(resJson.message || 'Decision successfully recorded.');
        fetchReleaseData();
      } else {
        setActionErrorMsg(resJson.error || 'Failed to submit decision.');
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || 'Submission error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSecondaryApproval = async () => {
    setIsSubmitting(true);
    setActionSuccessMsg('');
    setActionErrorMsg('');

    try {
      const res = await fetch(`/api/releases/${params.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: data.decision.decision,
          userRole: role,
          actorName: 'Marcus Vance (VP Release Operations)'
        })
      });

      const resJson = await res.json();
      if (res.ok) {
        setActionSuccessMsg(resJson.message);
        fetchReleaseData();
      } else {
        setActionErrorMsg(resJson.error);
      }
    } catch (e: any) {
      setActionErrorMsg(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvancePhase = async () => {
    setAdvancingPhase(true);
    try {
      const res = await fetch(`/api/releases/${params.id}/lifecycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRole: role })
      });
      if (res.ok) {
        fetchReleaseData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to advance phase');
      }
    } finally {
      setAdvancingPhase(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Evaluating telemetry signals & safety rules...</p>
        </div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="flex-1 p-8 max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Access Restricted / Release Not Found</h2>
        <p className="text-slate-600 text-sm mb-6">{data?.error || 'The requested release could not be retrieved.'}</p>
        <Link href="/releases" className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl">
          Return to Release Catalog
        </Link>
      </div>
    );
  }

  const { release, risk, recommendation, baselines, decision } = data;
  
  const canDecide = role === 'Release Manager' || role === 'Engineer';
  const isAuditor = role === 'Compliance Auditor';
  const isExternal = role === 'External Partner';
  const isViewer = role === 'Viewer';

  // Format chart data combining baseline and post_deployment
  const timeSeries = release.time_series;
  const chartData = timeSeries ? [
    ...timeSeries.baseline.map((p: any, idx: number) => ({
      name: `-T${(6 - idx) * 10}m`,
      baselineLatency: p.latency_ms,
      currentLatency: null,
      baselineError: p.error_rate,
      currentError: null,
      baselineTpm: p.transactions_per_minute,
      currentTpm: null
    })),
    ...timeSeries.post_deployment.map((p: any, idx: number) => ({
      name: `+T${(idx + 1) * 5}m`,
      baselineLatency: release.latency_baseline_ms,
      currentLatency: p.latency_ms,
      baselineError: release.baseline_error_rate,
      currentError: p.error_rate,
      baselineTpm: release.baseline_transactions_per_minute,
      currentTpm: p.transactions_per_minute
    }))
  ] : [];

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/70">
      <div className="max-w-7xl mx-auto space-y-5 pb-16">
        
        {/* Top Header & Breadcrumb Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Link 
              href="/releases" 
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-900 border border-slate-200"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-lg text-slate-900">{release.release_id}</span>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                  {release.service_name}
                </span>
                <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border">
                  {release.version}
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 uppercase">
                  {release.organization_name}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3">
                <span>Deployed: {format(new Date(release.deployment_time), 'MMM d, yyyy HH:mm:ss')}</span>
                <span>&bull;</span>
                <span>Type: <strong className="text-slate-600 capitalize">{release.change_type}</strong></span>
                <span>&bull;</span>
                <span>Team: <strong className="text-slate-600">{release.engineer_or_team}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            {/* Lifecycle Phase Progression Badge */}
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Phase:</span>
              <span className="font-bold text-slate-800 capitalize">{release.phase.replace('_', ' ')}</span>
              <span className="text-[11px] text-slate-500">({release.bake_duration_minutes}m bake)</span>
            </div>

            {/* Advance Phase Button (for demonstration of lifecycle) */}
            {canDecide && release.phase !== 'completed' && (
              <button
                onClick={handleAdvancePhase}
                disabled={advancingPhase}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
              >
                <FastForward size={14} />
                <span>{advancingPhase ? 'Advancing...' : 'Advance Phase'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Existing Decision State Banner */}
        {decision && (
          <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between gap-4 ${
            decision.requires_dual_approval && !decision.secondary_approved
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${
                decision.requires_dual_approval && !decision.secondary_approved
                  ? 'bg-amber-200 text-amber-800'
                  : 'bg-indigo-500/20 text-indigo-300'
              }`}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  Recorded Decision: {decision.decision}
                  {decision.requires_dual_approval && !decision.secondary_approved && (
                    <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-900 text-xs font-bold rounded-full">
                      Awaiting Secondary Sign-off (Four-Eyes Principle)
                    </span>
                  )}
                </h4>
                <p className="text-xs opacity-80 mt-0.5">
                  Logged on {format(new Date(decision.timestamp), 'MMM d, yyyy HH:mm:ss')} by {decision.actor_name || decision.user_role}.
                  {decision.override_reason && (
                    <span className="ml-2 italic underline">Override Reason: &quot;{decision.override_reason}&quot;</span>
                  )}
                </p>
                {decision.override_notes && (
                  <p className="text-xs opacity-75 mt-1 font-mono bg-black/10 p-1.5 rounded">
                    Rationale: {decision.override_notes}
                  </p>
                )}
              </div>
            </div>

            {/* Secondary Dual Sign-off Button if required */}
            {decision.requires_dual_approval && !decision.secondary_approved && role === 'Release Manager' && (
              <button
                onClick={handleSecondaryApproval}
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0"
              >
                Sign Secondary Authorization
              </button>
            )}
          </div>
        )}

        {/* Feedback Message Alert */}
        {actionSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
        {actionErrorMsg && (
          <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{actionErrorMsg}</span>
          </div>
        )}

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Card 1: Recommendation & Executive Summary (4 cols) */}
          <div className={`lg:col-span-4 rounded-2xl border shadow-sm p-6 flex flex-col justify-between relative overflow-hidden ${
            recommendation.recommendation === 'ROLLBACK RECOMMENDED' ? 'bg-red-50/90 border-red-200' :
            recommendation.recommendation === 'HUMAN REVIEW REQUIRED' ? 'bg-amber-50/90 border-amber-200' :
            'bg-emerald-50/90 border-emerald-200'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  recommendation.recommendation === 'ROLLBACK RECOMMENDED' ? 'bg-red-100 text-red-700 border-red-200' :
                  recommendation.recommendation === 'HUMAN REVIEW REQUIRED' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  Advisory Verdict
                </span>

                <div className="flex items-center gap-2">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black border shadow-sm ${
                    recommendation.recommendation === 'ROLLBACK RECOMMENDED' ? 'bg-red-600 text-white border-red-700' :
                    recommendation.recommendation === 'HUMAN REVIEW REQUIRED' ? 'bg-amber-500 text-white border-amber-600' :
                    'bg-emerald-600 text-white border-emerald-700'
                  }`}>
                    <span className="text-lg leading-none">{recommendation.risk_score}</span>
                    <span className="text-[9px] font-normal uppercase opacity-80 leading-tight">Risk</span>
                  </div>
                </div>
              </div>

              <h3 className={`text-2xl font-black leading-tight tracking-tight mb-2 ${
                recommendation.recommendation === 'ROLLBACK RECOMMENDED' ? 'text-red-900' :
                recommendation.recommendation === 'HUMAN REVIEW REQUIRED' ? 'text-amber-900' :
                'text-emerald-950'
              }`}>
                {recommendation.recommendation}
              </h3>

              <p className="text-xs text-slate-700 leading-relaxed font-medium mt-3">
                {recommendation.executive_summary}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60">
              <div className="flex justify-between items-center text-xs font-semibold mb-1 text-slate-600">
                <span>Advisory Confidence</span>
                <span className="font-bold text-slate-800">{recommendation.confidence} ({recommendation.confidence_score}%)</span>
              </div>
              <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    recommendation.confidence === 'High' ? 'bg-indigo-600' : 
                    recommendation.confidence === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${recommendation.confidence_score}%` }}
                ></div>
              </div>
              {recommendation.missing_data.length > 0 && (
                <div className="mt-2 text-[10px] text-amber-800 font-semibold bg-amber-100/70 p-1.5 rounded-lg border border-amber-200">
                  Confidence downgraded due to missing telemetry: {recommendation.missing_data.join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Factor Attribution Waterfall (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={15} className="text-indigo-600" />
                  Factor Attribution (Risk Breakdown)
                </h4>
                <span className="text-[10px] font-semibold text-slate-400">Additive Scoring (0-100)</span>
              </div>

              <div className="space-y-3">
                {recommendation.factor_attributions.map((fa: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">{fa.factor}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          fa.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          fa.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          fa.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          +{fa.points} / {fa.max_points} pts
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          fa.severity === 'critical' ? 'bg-red-500' :
                          fa.severity === 'high' ? 'bg-orange-500' :
                          fa.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${(fa.points / fa.max_points) * 100}%` }}
                      ></div>
                    </div>

                    <p className="text-[10px] text-slate-500 font-medium">
                      {fa.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 text-[10px] text-slate-400 font-medium">
              Deterministic scoring ensures zero black-box bias. Every point corresponds to an auditable rule.
            </div>
          </div>

          {/* Card 3: Business Context & Blast Radius (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <ShieldAlert size={15} className="text-blue-600" />
                Business Blast Radius
              </h4>

              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Impacted Customers</span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    {release.affected_customers !== null ? release.affected_customers.toLocaleString() : 'N/A (Missing)'}
                  </p>
                  <span className="text-[10px] text-slate-500">Active accounts affected</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Revenue Impact Est.</span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    {release.revenue_impact_estimate !== null ? `$${release.revenue_impact_estimate.toLocaleString()}` : '$0'}
                  </p>
                  <span className="text-[10px] text-slate-500">Unsettled transaction exposure</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Criticality</span>
                      <p className="text-sm font-bold text-slate-800 capitalize mt-0.5">
                        Tier {release.business_criticality.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Severity</span>
                      <p className="text-sm font-bold text-red-600 uppercase mt-0.5">
                        {release.incident_severity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-slate-500 font-medium">
              Env: <strong className="text-slate-700">{release.environment}</strong> &bull; Complaints: <strong className="text-slate-700">{release.customer_complaint_rate}%</strong>
            </div>
          </div>

          {/* Card 4: Comparative Telemetry Charts (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg p-6 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-indigo-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Comparative Telemetry Trends
                  </h4>
                </div>

                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-[11px]">
                  <button 
                    onClick={() => setActiveChart('latency')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      activeChart === 'latency' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Latency
                  </button>
                  <button 
                    onClick={() => setActiveChart('error')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      activeChart === 'error' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Errors
                  </button>
                  <button 
                    onClick={() => setActiveChart('tpm')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      activeChart === 'tpm' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Volume
                  </button>
                </div>
              </div>

              <div className="h-60 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', fontSize: 11, color: '#f8fafc' }}
                    />
                    {activeChart === 'latency' && (
                      <>
                        <Area type="monotone" dataKey="baselineLatency" name="Historical Baseline (ms)" stroke="#94a3b8" fillOpacity={1} fill="url(#colorBaseline)" />
                        <Area type="monotone" dataKey="currentLatency" name="Post-Release Latency (ms)" stroke="#f43f5e" fillOpacity={1} fill="url(#colorCurrent)" />
                      </>
                    )}
                    {activeChart === 'error' && (
                      <>
                        <Area type="monotone" dataKey="baselineError" name="Historical Baseline (%)" stroke="#94a3b8" fillOpacity={1} fill="url(#colorBaseline)" />
                        <Area type="monotone" dataKey="currentError" name="Post-Release Error Rate (%)" stroke="#ef4444" fillOpacity={1} fill="url(#colorCurrent)" />
                      </>
                    )}
                    {activeChart === 'tpm' && (
                      <>
                        <Area type="monotone" dataKey="baselineTpm" name="Historical Baseline (TPM)" stroke="#94a3b8" fillOpacity={1} fill="url(#colorBaseline)" />
                        <Area type="monotone" dataKey="currentTpm" name="Post-Release Volume (TPM)" stroke="#38bdf8" fillOpacity={1} fill="url(#colorBaseline)" />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                <span>Pre-release baseline (60 min window)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Post-deployment active telemetry</span>
              </div>
            </div>
          </div>

          {/* Card 5: Counterfactual "What-If" Analysis (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingDown size={15} className="text-purple-600" />
                  Counterfactual Analysis (&quot;What If?&quot;)
                </h4>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Decision Boundary Sensitivity
                </span>
              </div>

              <p className="text-xs text-slate-600 mb-4 font-medium">
                Hypothetical condition adjustments that would systematically alter the advisory outcome:
              </p>

              <div className="space-y-3">
                {recommendation.counterfactuals.map((cf: any, i: number) => (
                  <div key={i} className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{cf.parameter}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                        Result: {cf.resulting_recommendation}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div>Current: <strong className="text-slate-800">{cf.current_value}</strong></div>
                      <div>Target Threshold: <strong className="text-purple-800">{cf.target_threshold}</strong></div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-purple-100">
                      <span>Requirement: <strong>{cf.delta_required}</strong></span>
                      <span>Risk Impact: <strong>Score {cf.resulting_risk_score}/100</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 text-[10px] text-slate-400 font-medium">
              Counterfactual analysis demonstrates exact conditions needed for stabilization or escalation.
            </div>
          </div>

          {/* Card 6: Rule Evaluation Matrix (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <FileText size={15} className="text-indigo-600" />
              Safety & Governance Rule Trigger Matrix
            </h4>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="pb-2">Rule ID / Name</th>
                  <th className="pb-2">Condition Tested</th>
                  <th className="pb-2">Severity</th>
                  <th className="pb-2 text-right">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recommendation.all_rules.map((rule: any) => (
                  <tr key={rule.rule_id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 pr-2">
                      <div className="font-bold text-slate-800">{rule.rule_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rule.rule_id} &bull; {rule.category}</div>
                    </td>
                    <td className="py-2.5 pr-2 font-mono text-[11px] text-slate-600">
                      {rule.condition_checked}
                    </td>
                    <td className="py-2.5 pr-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                        rule.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        rule.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      {rule.triggered ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-[10px] rounded-full border border-red-200">
                          Triggered
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200">
                          Passed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card 7: Rollback Readiness & Pre-flight Checks (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw size={15} className="text-amber-600" />
                  Rollback Readiness & Pre-flight
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  release.rollback_available 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {release.rollback_available ? 'Path Validated' : 'Rollback Blocked'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Rollback Execution Strategy</div>
                  <div className="text-sm font-bold text-slate-800 capitalize mt-0.5">
                    {release.rollback_readiness?.strategy?.replace(/_/g, ' ') || 'Automated Blue/Green Swap'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Estimated Time to Recover (MTTR): <strong className="text-slate-700">{release.rollback_readiness?.estimated_mtt_rollback_min || 3} minutes</strong>
                  </div>
                </div>

                {!release.rollback_available && release.rollback_readiness?.blockers && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <span className="text-[11px] font-bold text-red-800 block mb-1">
                      Rollback Safety Invariant Triggered:
                    </span>
                    <ul className="text-[11px] text-red-700 list-disc pl-4 space-y-1">
                      {release.rollback_readiness.blockers.map((b: string, idx: number) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Automated Script Validated:</span>
                    <strong className={release.rollback_readiness?.automated_script_validated ? 'text-emerald-600' : 'text-red-600'}>
                      {release.rollback_readiness?.automated_script_validated ? 'Yes' : 'No'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Invariant Check:</span>
                    <span className="text-slate-500 font-mono">30 mins ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500">
              Enterprise policy requires rollback automation pre-flight check before initiating release candidate.
            </div>
          </div>

          {/* Card 8: Human Advisory & Execution Console (12 cols) */}
          <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={18} className="text-indigo-600" />
                  Human Decision & Evidence Execution Console
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Advisory Safeguard: System NEVER executes autonomous production changes. Human verification required.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Role</span>
                <p className="text-xs font-bold text-slate-800">{role}</p>
              </div>
            </div>

            {/* Permission Check Messages */}
            {!canDecide ? (
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-center">
                <Lock size={24} className="mx-auto text-slate-400 mb-2" />
                <h5 className="font-bold text-sm text-slate-800">Action Restricted to Authorized Operators</h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Your current simulated role ({role}) has observation and inspection rights only. 
                  Switch to <strong>Engineer</strong> or <strong>Release Manager</strong> in the top header to exercise decision authority.
                </p>
              </div>
            ) : decision?.has_decision && (!decision.requires_dual_approval || decision.secondary_approved) ? (
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl text-center">
                <CheckCircle size={24} className="mx-auto text-emerald-600 mb-2" />
                <h5 className="font-bold text-sm text-emerald-900">Decision Finalized & Sealed in Ledger</h5>
                <p className="text-xs text-emerald-700 max-w-md mx-auto mt-1">
                  This release was marked as <strong>{decision.decision}</strong> by {decision.user_role}. 
                  The decision is sealed in the cryptographic audit history and cannot be mutated.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mandatory Override Section if continuing despite ROLLBACK RECOMMENDED */}
                {recommendation.recommendation === 'ROLLBACK RECOMMENDED' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle size={16} className="text-amber-600" />
                      Mandatory Override Compliance Safeguard
                    </div>
                    <p className="text-xs text-amber-800">
                      The adviser strongly recommends rolling back this release. If you choose to <strong>Force Continue</strong>, enterprise governance policies mandate structured rationale capture:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
                          Override Reason Category *
                        </label>
                        <select 
                          value={overrideReason}
                          onChange={e => setOverrideReason(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                        >
                          <option value="">Select an approved category...</option>
                          <option value="False Positive Telemetry Artifact">False Positive Telemetry Artifact</option>
                          <option value="Business Decision with Executive Waiver">Business Decision with Executive Waiver</option>
                          <option value="Transient Downstream Upstream Outage">Transient Downstream Upstream Outage</option>
                          <option value="Canary Traffic Blast Radius Verified Isolated">Canary Traffic Blast Radius Verified Isolated</option>
                          <option value="Hotfix Follow-up Immediately Scheduled">Hotfix Follow-up Immediately Scheduled</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
                          Technical Justification (min 15 characters) *
                        </label>
                        <textarea 
                          rows={2}
                          placeholder="Explain root cause, telemetry validation, and mitigation rationale..."
                          value={overrideNotes}
                          onChange={e => setOverrideNotes(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-indigo-500 resize-none font-medium"
                        />
                        <div className="text-right text-[10px] text-slate-400">
                          {overrideNotes.length} / 15 chars minimum
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <button
                    onClick={() => handleDecision('ROLLBACK')}
                    disabled={isSubmitting || !release.rollback_available}
                    className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                  >
                    <AlertCircle size={16} />
                    <span>Authorize Rollback</span>
                  </button>

                  <button
                    onClick={() => handleDecision('ESCALATED')}
                    disabled={isSubmitting}
                    className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                  >
                    <ShieldAlert size={16} />
                    <span>Escalate to War Room</span>
                  </button>

                  <button
                    onClick={() => handleDecision('CONTINUE')}
                    disabled={isSubmitting}
                    className={`py-3 px-4 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs border ${
                      recommendation.recommendation === 'ROLLBACK RECOMMENDED'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                    } disabled:opacity-50`}
                  >
                    <CheckCircle size={16} />
                    <span>{recommendation.recommendation === 'ROLLBACK RECOMMENDED' ? 'Force Continue Release' : 'Approve Release Progression'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
