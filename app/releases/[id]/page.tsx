'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, AlertCircle, CheckCircle, ShieldAlert, FileText, Info, Activity } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/components/AppContext';

export default function ReleaseAnalysis() {
  const params = useParams();
  const router = useRouter();
  const { role } = useAppContext();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/releases/${params.id}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [params.id]);

  const handleDecision = async (decision: string) => {
    if (decision === 'CONTINUE' && data.recommendation.recommendation === 'ROLLBACK RECOMMENDED' && !overrideReason) {
      alert('You must provide an override reason to continue despite a rollback recommendation.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/releases/${params.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          userRole: role,
          overrideReason: decision === 'CONTINUE' && data.recommendation.recommendation === 'ROLLBACK RECOMMENDED' ? overrideReason : undefined,
          overrideNotes
        })
      });
      
      if (res.ok) {
        router.push('/releases');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit decision');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading analysis...</div>;
  if (!data || data.error) return <div className="p-8">Release not found.</div>;

  const { release, recommendation, decision } = data;
  
  const canApprove = role === 'Release Manager' || role === 'Engineer';
  const isAuditor = role === 'Compliance Auditor';
  const isExternal = role === 'External Partner';

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/releases" className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-800">
              <ArrowLeft size={20} />
            </Link>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Production Release Analysis</h2>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold shadow-sm text-slate-600 flex items-center gap-1">
              <CheckCircle size={14} className="text-emerald-500" /> {release.service_name}
            </span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold shadow-sm text-slate-600">
              {release.version}
            </span>
          </div>
        </div>

        {decision && (
          <div className="mb-6 bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center gap-4 text-white shadow-sm">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-full shrink-0">
              <Info size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Decision Logged: {decision.decision}</h3>
              <p className="text-slate-300 text-xs mt-0.5">
                Logged on {format(new Date(decision.timestamp), 'MMM d, yyyy HH:mm')} by a {decision.user_role}.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 grid-rows-none lg:grid-rows-[repeat(6,_110px)] gap-4 lg:h-[700px]">
          {/* Recommendation Block */}
          <div className={`col-span-12 lg:col-span-4 row-span-3 rounded-2xl border shadow-sm p-6 flex flex-col relative overflow-hidden ${
            recommendation.recommendation === 'ROLLBACK RECOMMENDED' ? 'bg-red-50 border-red-200' :
            recommendation.recommendation === 'HUMAN REVIEW REQUIRED' ? 'bg-amber-50 border-amber-200' :
            'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="flex justify-between items-start mb-auto">
              <div>
                <div className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${
                  recommendation.recommendation === 'ROLLBACK RECOMMENDED' ? 'text-red-500' :
                  recommendation.recommendation === 'HUMAN REVIEW REQUIRED' ? 'text-amber-500' :
                  'text-emerald-600'
                }`}>
                  Adviser Recommendation
                </div>
                <h3 className={`text-2xl font-black leading-tight ${
                  recommendation.recommendation === 'ROLLBACK RECOMMENDED' ? 'text-red-700' :
                  recommendation.recommendation === 'HUMAN REVIEW REQUIRED' ? 'text-amber-700' :
                  'text-emerald-800'
                }`}>
                  {recommendation.recommendation}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 ${
                recommendation.recommendation === 'ROLLBACK RECOMMENDED' ? 'bg-red-100 text-red-600 border-red-200' :
                recommendation.recommendation === 'HUMAN REVIEW REQUIRED' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                'bg-emerald-100 text-emerald-600 border-emerald-200'
              }`}>
                {recommendation.risk_score}
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Confidence Level</div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-slate-800 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                <span>Low</span>
                <span>High (92%)</span>
              </div>
            </div>
          </div>

          {/* Business Impact Block */}
          <div className="col-span-12 lg:col-span-5 row-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Business Context
            </h3>
            
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-xs font-medium text-slate-500 uppercase">Impacted Users</div>
                <div className="text-3xl font-black text-slate-800 mt-1">{release.affected_customers?.toLocaleString() || 0}</div>
                <div className="text-xs text-red-500 font-medium mt-1">Tier 1 Severity</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-xs font-medium text-slate-500 uppercase">Criticality</div>
                <div className="text-xl font-bold text-slate-800 mt-1 capitalize">{release.business_criticality}</div>
                <div className="text-xs text-slate-500 mt-1">{release.environment} Env</div>
              </div>
            </div>
          </div>

          {/* Technical Signals Block */}
          <div className="col-span-12 lg:col-span-3 row-span-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg p-6 text-white flex flex-col">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-6">
              <Activity size={16} className="text-indigo-400" /> Telemetry Signals
            </h3>
            
            <div className="space-y-6 flex-1">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-medium uppercase">
                  <span>Error Rate</span>
                  <span className={release.error_rate > (release.baseline_error_rate || 0) * 1.5 ? 'text-red-400' : 'text-emerald-400'}>
                    {release.error_rate !== null ? `${release.error_rate.toFixed(2)}%` : 'Missing'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full">
                  <div className={`h-full rounded-full ${release.error_rate > (release.baseline_error_rate || 0) * 1.5 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: release.error_rate !== null ? `${Math.min(100, release.error_rate * 20)}%` : '0%' }}></div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Baseline: {release.baseline_error_rate !== null ? `${release.baseline_error_rate.toFixed(2)}%` : 'N/A'}</div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-medium uppercase">
                  <span>Latency</span>
                  <span className={release.latency_ms > (release.latency_baseline_ms || 0) * 1.5 ? 'text-red-400' : 'text-emerald-400'}>
                    {release.latency_ms ? `${release.latency_ms}ms` : 'Missing'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full">
                  <div className={`h-full rounded-full ${release.latency_ms > (release.latency_baseline_ms || 0) * 1.5 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: release.latency_ms ? `${Math.min(100, (release.latency_ms / (release.latency_baseline_ms * 2)) * 100)}%` : '0%' }}></div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Baseline: {release.latency_baseline_ms ? `${release.latency_baseline_ms}ms` : 'N/A'}</div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-medium uppercase">
                  <span>Traffic (TPM)</span>
                  <span className="text-blue-400">{release.transactions_per_minute !== null ? release.transactions_per_minute : 'Missing'}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Baseline: {release.baseline_transactions_per_minute !== null ? release.baseline_transactions_per_minute : 'N/A'}</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-start gap-2">
              <ShieldAlert size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-400 leading-tight">Signals evaluated against 30-day historical baseline.</p>
            </div>
          </div>

          {/* Reason Block */}
          <div className="col-span-12 lg:col-span-5 row-span-2 bg-indigo-50 rounded-2xl border border-indigo-100 p-6 flex flex-col justify-center">
            <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-3">Analysis Reasoning</h3>
            <p className="text-slate-700 text-sm leading-relaxed font-medium">
              {recommendation.reason}
            </p>
            {recommendation.triggered_rules.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {recommendation.triggered_rules.map((rule: any, i: number) => (
                  <span key={i} className="px-2 py-1 bg-white border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded shadow-sm">
                    {rule.rule_name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Execution Block */}
          <div className="col-span-12 lg:col-span-9 row-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Execution Controls</h3>
            {!canApprove ? (
              <div className="bg-slate-50 p-4 border rounded-xl text-sm text-slate-600 text-center font-medium">
                Your role ({role}) does not have execution permissions.
              </div>
            ) : decision ? (
               <div className="bg-slate-50 p-4 border rounded-xl text-sm text-slate-600 text-center font-medium">
                Decision already submitted.
              </div>
            ) : (
              <div className="flex gap-4">
                <button 
                  onClick={() => handleDecision('ROLLBACK')}
                  disabled={isSubmitting || !release.rollback_available}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <AlertCircle size={18} /> Execute Rollback
                </button>
                <div className="flex-1 flex flex-col gap-2">
                  {recommendation.recommendation === 'ROLLBACK RECOMMENDED' && (
                    <select 
                      className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none focus:border-blue-500"
                      value={overrideReason}
                      onChange={e => setOverrideReason(e.target.value)}
                    >
                      <option value="">Select Override Reason...</option>
                      <option value="False positive">False positive</option>
                      <option value="Business decision">Business decision</option>
                    </select>
                  )}
                  <button 
                    onClick={() => handleDecision('CONTINUE')}
                    disabled={isSubmitting || (recommendation.recommendation === 'ROLLBACK RECOMMENDED' && !overrideReason)}
                    className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    Force Continue
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Missing / Conflicting Signals (Small block) */}
          <div className="col-span-12 lg:col-span-3 row-span-2 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm p-5 overflow-y-auto">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Evidence Details</h3>
             
             {recommendation.supporting_evidence.length > 0 && (
                <div className="mb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Supporting</div>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc pl-3">
                    {recommendation.supporting_evidence.map((ev: string, i: number) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
             )}

             {recommendation.conflicting_evidence.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-amber-500 uppercase mb-1">Conflicting</div>
                  <ul className="text-xs text-amber-900 bg-amber-50 p-2 rounded border border-amber-100 space-y-1 list-disc pl-4">
                    {recommendation.conflicting_evidence.map((ev: string, i: number) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, current, baseline, missing }: { label: string, current: string, baseline: string, missing: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100">
      <span className="font-medium text-slate-700">{label}</span>
      <div className="text-right">
        {missing ? (
          <span className="text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded text-sm border border-red-100">Missing</span>
        ) : (
          <>
            <div className="font-semibold text-slate-900">{current}</div>
            <div className="text-xs text-slate-500">Baseline: {baseline}</div>
          </>
        )}
      </div>
    </div>
  );
}
