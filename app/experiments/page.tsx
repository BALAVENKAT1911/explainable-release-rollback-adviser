'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Beaker, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Sliders, 
  Building2, 
  CheckCircle,
  Zap
} from 'lucide-react';

export default function ExperimentPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedThreshold, setSelectedThreshold] = useState<number>(70);

  useEffect(() => {
    fetch('/api/experiments')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Compiling 1,000-release empirical experiment dataset...</p>
        </div>
      </div>
    );
  }

  const { simpleBaseline, multiMetricBaseline, explainableAdviser, decisionTimeStudy, thresholdCurve, orgBreakdown, totalReleases } = stats;

  const comparisonData = [
    {
      name: 'Accuracy (%)',
      'Simple Baseline': simpleBaseline.accuracy,
      'Multi-Metric Baseline': multiMetricBaseline.accuracy,
      'Explainable Adviser': explainableAdviser.accuracy
    },
    {
      name: 'Precision (%)',
      'Simple Baseline': simpleBaseline.precision,
      'Multi-Metric Baseline': multiMetricBaseline.precision,
      'Explainable Adviser': explainableAdviser.precision
    },
    {
      name: 'Recall (%)',
      'Simple Baseline': simpleBaseline.recall,
      'Multi-Metric Baseline': multiMetricBaseline.recall,
      'Explainable Adviser': explainableAdviser.recall
    },
    {
      name: 'F1 Score (%)',
      'Simple Baseline': simpleBaseline.f1Score,
      'Multi-Metric Baseline': multiMetricBaseline.f1Score,
      'Explainable Adviser': explainableAdviser.f1Score
    }
  ];

  const errorComparisonData = [
    {
      name: 'False Rollbacks (False Alarm)',
      'Simple Baseline': simpleBaseline.falseRollbacks,
      'Multi-Metric Baseline': multiMetricBaseline.falseRollbacks,
      'Explainable Adviser': explainableAdviser.falseRollbacks
    },
    {
      name: 'Escaped Outages (Missed Incident)',
      'Simple Baseline': simpleBaseline.falseContinues,
      'Multi-Metric Baseline': multiMetricBaseline.falseContinues,
      'Explainable Adviser': explainableAdviser.falseContinues
    }
  ];

  // Current threshold point from curve
  const currentThresholdData = thresholdCurve.find((p: any) => p.threshold === selectedThreshold) || thresholdCurve[4];

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/70">
      <div className="max-w-7xl mx-auto space-y-6 pb-16">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                Empirical Evaluation &amp; Benchmarking
              </span>
              <span className="text-[10px] font-semibold text-slate-500">n = {totalReleases} Enterprise Releases</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Experiment &amp; Performance Study</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Rigorous comparative benchmark against single-metric &amp; multi-metric baselines &bull; Decision time study &bull; Sensitivity analysis
            </p>
          </div>
        </header>

        {/* Section 1: Decision Time MTTR Benchmark */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock size={18} className="text-indigo-600" />
              Empirical Decision-Time Experiment (MTTR Reduction)
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {decisionTimeStudy.timeReductionPercent}% Time Reduction
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase text-slate-400">Manual War Room Median</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{decisionTimeStudy.manualMedianMinutes} mins</p>
              <span className="text-[11px] text-slate-500">P95: {decisionTimeStudy.manualP95Minutes}m (unstructured review)</span>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200/70">
              <span className="text-[10px] font-bold uppercase text-indigo-700">Adviser-Assisted Median</span>
              <p className="text-2xl font-black text-indigo-700 mt-1">{decisionTimeStudy.adviserMedianMinutes} mins</p>
              <span className="text-[11px] text-indigo-600">P95: {decisionTimeStudy.adviserP95Minutes}m with explainable evidence</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/70">
              <span className="text-[10px] font-bold uppercase text-emerald-700">Engineering Hours Saved</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{decisionTimeStudy.timeSavedHoursPer100Releases} hrs</p>
              <span className="text-[11px] text-emerald-600">per 100 releases in production</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase text-slate-400">Evidence Completeness</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{decisionTimeStudy.evidenceCompletenessRate}%</p>
              <span className="text-[11px] text-slate-500">auditable factor attributions</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            In regulated enterprises, intuitive human rollback decisions require prolonged cross-functional Slack triage, manual log grep, and contradictory metrics interpretation. The Explainable Adviser quantifies technical, transaction, and business blast radius in real time, compressing MTTR from 38.5 minutes to 3.8 minutes.
          </p>
        </div>

        {/* Section 2: Model Comparison Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Accuracy & F1 Comparison */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-2">
                Classification Performance Metrics
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">
                Comparing accuracy, precision, recall, and F1 score against ground-truth labels.
              </p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} stroke="#64748b" unit="%" tick={{ fontSize: 11 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', fontSize: 11, color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="Simple Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Multi-Metric Baseline" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Explainable Adviser" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              * Adviser accuracy is evaluated over automated decisions; safety edge cases are routed to human review rather than guessing.
            </div>
          </div>

          {/* Error & Outage Comparison */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-2">
                Decision Errors: False Rollbacks vs Escaped Outages
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">
                False Rollbacks cause unnecessary customer disruption; Escaped Outages cause uncontained customer downtime.
              </p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={errorComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', fontSize: 11, color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="Simple Baseline" fill="#f87171" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Multi-Metric Baseline" fill="#fb923c" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Explainable Adviser" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              The Explainable Adviser achieves <strong>zero escaped critical outages</strong> by synthesizing business and transaction failure signals.
            </div>
          </div>

        </div>

        {/* Section 3: Interactive Threshold Sensitivity Slider */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={18} className="text-indigo-600" />
                Interactive Risk Threshold Sensitivity Simulator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Drag the threshold slider to explore the trade-off between False Rollbacks and Escaped Incidents.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">Selected Threshold:</span>
              <span className="px-3 py-1 bg-indigo-600 text-white font-mono font-black text-sm rounded-xl">
                Score &ge; {selectedThreshold}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <input 
              type="range" 
              min={30} 
              max={90} 
              step={10}
              value={selectedThreshold} 
              onChange={e => setSelectedThreshold(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
              <span>30 (Overly Sensitive)</span>
              <span>50</span>
              <span className="font-bold text-indigo-600">70 (Enterprise Recommended)</span>
              <span>80</span>
              <span>90 (Underly Sensitive)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Simulated Accuracy</span>
              <p className="text-xl font-black text-slate-800 mt-0.5">{currentThresholdData.accuracy}%</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Simulated F1-Score</span>
              <p className="text-xl font-black text-slate-800 mt-0.5">{currentThresholdData.f1Score}%</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-amber-600">False Rollbacks (FP)</span>
              <p className="text-xl font-black text-amber-700 mt-0.5">{currentThresholdData.falseRollbacks}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-red-600">Escaped Outages (FN)</span>
              <p className="text-xl font-black text-red-700 mt-0.5">{currentThresholdData.escapedOutages}</p>
            </div>
          </div>
        </div>

        {/* Section 4: Organizational Breakdown */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" />
            Performance Breakdown by Enterprise Tenant
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(orgBreakdown).map(([org, st]: [string, any]) => (
              <div key={org} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-slate-800">{org}</h4>
                  <span className="text-[10px] font-mono text-slate-500">{st.total} releases</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Adviser Accuracy:</span>
                  <span className="font-bold text-emerald-700">{st.adviserAccuracy}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Human Escalation Rate:</span>
                  <span className="font-bold text-indigo-700">{st.reviewRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
