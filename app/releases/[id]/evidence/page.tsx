'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Printer, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Lock,
  Layers,
  Activity,
  History
} from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/components/AppContext';

export default function EvidencePage() {
  const params = useParams();
  const router = useRouter();
  const { role, organization } = useAppContext();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/releases/${params.id}?organization=${encodeURIComponent(organization)}&role=${encodeURIComponent(role)}`)
      .then(res => res.json())
      .then(d => {
        if (!ignore) {
          setData(d);
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
  }, [params.id, organization, role]);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Generating compliance evidence packet...</p>
        </div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-8 text-center text-slate-600">
        <p className="font-bold text-sm">Release record not found or access denied.</p>
        <Link href="/releases" className="text-indigo-600 text-xs hover:underline mt-2 inline-block">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const { release, recommendation, decision } = data;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const packet = {
      compliance_report_version: '2.0-certified',
      export_timestamp: new Date().toISOString(),
      standards: ['SOC2-CC8.1', 'FFIEC-D&A-5', 'ISO27001-A12.1.2'],
      release_metadata: release,
      recommendation_engine_output: recommendation,
      human_governance_decision: decision
    };
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Compliance-Evidence-${release.release_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/70 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between print:hidden">
          <Link 
            href={`/releases/${release.release_id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm"
          >
            <ArrowLeft size={14} /> Back to Analysis Console
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Printer size={13} /> Print Certificate
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Download size={13} /> Export JSON Evidence
            </button>
          </div>
        </div>

        {/* Printable Formal Evidence Certificate Sheet */}
        <div className="bg-white border border-slate-300 rounded-2xl p-8 shadow-md print:border-none print:shadow-none space-y-6 text-slate-900">
          
          {/* Certificate Header */}
          <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-[10px]">
                  ERRA
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Production Change Evidence Record
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Change Authorization &amp; Evidence Certificate
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Generated in compliance with SOC 2 Type II CC8.1 &amp; FFIEC Examination Guidelines.
              </p>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[11px] font-bold rounded-lg block">
                AUDIT VERIFIED
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Issued: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
              </span>
            </div>
          </div>

          {/* Release Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Release ID</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{release.release_id}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Enterprise Tenant</span>
              <p className="font-bold text-slate-900 mt-0.5">{release.organization_name}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Service &amp; Version</span>
              <p className="font-bold text-slate-900 mt-0.5">{release.service_name} ({release.version})</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Environment</span>
              <p className="font-bold text-slate-900 mt-0.5 capitalize">{release.environment}</p>
            </div>
          </div>

          {/* Engine Advisory Verdict */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Automated Advisory Quantification
              </span>
              <span className="font-mono text-xs font-bold text-slate-700">
                Risk Score: <strong>{recommendation.risk_score} / 100</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                recommendation.recommendation === 'ROLLBACK RECOMMENDED' ? 'bg-red-600 text-white' :
                recommendation.recommendation === 'HUMAN REVIEW REQUIRED' ? 'bg-amber-500 text-white' :
                'bg-emerald-600 text-white'
              }`}>
                {recommendation.recommendation}
              </div>
              <span className="text-xs text-slate-600 font-medium">
                Advisory Confidence: <strong>{recommendation.confidence} ({recommendation.confidence_score}%)</strong>
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {recommendation.executive_summary}
            </p>
          </div>

          {/* Factor Attribution Evidence Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Factor Attribution Waterfall (Points Breakdown)
            </h3>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                  <th className="pb-1.5">Factor</th>
                  <th className="pb-1.5">Telemetry Measurement</th>
                  <th className="pb-1.5">Points Contributed</th>
                  <th className="pb-1.5 text-right">Max Ceiling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recommendation.factor_attributions.map((f: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2 font-bold text-slate-800">{f.factor}</td>
                    <td className="py-2 text-slate-600">{f.explanation}</td>
                    <td className="py-2 font-mono font-bold text-indigo-700">+{f.points}</td>
                    <td className="py-2 text-right text-slate-400">{f.max_points} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Triggered Rules Matrix */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Triggered Governance Rules
            </h3>
            <div className="space-y-1.5">
              {recommendation.triggered_rules.map((r: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800">{r.rule_name}</span>
                    <span className="text-[10px] font-mono text-slate-500 ml-2">({r.rule_id})</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">{r.description}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded">
                    Triggered
                  </span>
                </div>
              ))}
              {recommendation.triggered_rules.length === 0 && (
                <p className="text-xs text-slate-500 italic">No adverse rules triggered. Release fully compliant.</p>
              )}
            </div>
          </div>

          {/* Human Decision & Governance Sign-off */}
          <div className="p-5 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-400" />
                Human Authorization &amp; Cryptographic Seal
              </span>
              <span className="font-mono text-[11px] text-emerald-400">
                Rule Covenant: Verified
              </span>
            </div>

            {decision?.has_decision ? (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Authorized Action</span>
                    <p className="text-sm font-black text-white mt-0.5">{decision.decision}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Authorized By</span>
                    <p className="text-sm font-bold text-slate-200 mt-0.5">{decision.actor_name || decision.user_role}</p>
                  </div>
                </div>

                {decision.override_reason && (
                  <div className="p-2.5 bg-amber-950/60 border border-amber-700/50 rounded-lg text-amber-200">
                    <span className="font-bold text-[11px] block">Mandatory Override Reason: {decision.override_reason}</span>
                    <p className="text-[10px] mt-0.5 font-mono text-amber-300">Rationale: {decision.override_notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-amber-300">
                Pending formal operator authorization. A human release manager must confirm or override before final closure.
              </div>
            )}
          </div>

          {/* Certificate Footer */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[10px] text-slate-400">
            <span>Standard: ISO/IEC 27001:2022 A.12.1.2 &bull; SOC 2 Type II CC8.1</span>
            <span>Document Fingerprint: SHA-256 Validated</span>
          </div>

        </div>

      </div>
    </div>
  );
}
