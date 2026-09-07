'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAppContext } from '@/components/AppContext';
import { Search } from 'lucide-react';

export default function ReleasesPage() {
  const [releases, setReleases] = useState<any[]>([]);
  const { organization, role } = useAppContext();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/releases')
      .then(res => res.json())
      .then(data => setReleases(data));
  }, []);

  const filteredReleases = releases.filter(r => {
    // External partners can only see their own org
    if (role === 'External Partner' && r.organization_name !== organization) {
      return false;
    }
    // Organization filter simulation (except for Auditors who see all)
    if (role !== 'Compliance Auditor' && role !== 'External Partner' && r.organization_name !== organization) {
      return false;
    }
    
    if (search && !r.release_id.toLowerCase().includes(search.toLowerCase()) && !r.service_name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Release Analysis</h1>
            <p className="text-slate-500 text-sm mt-1">Monitor production deployments and quantify risk.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search releases..." 
              className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-white shadow-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b text-xs uppercase font-semibold text-slate-500 tracking-wider">
              <th className="p-4">Release ID</th>
              <th className="p-4">Service</th>
              <th className="p-4">Deployed</th>
              <th className="p-4">Risk Score</th>
              <th className="p-4">Recommendation</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredReleases.map(r => (
              <tr key={r.release_id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-blue-600">
                  <Link href={`/releases/${r.release_id}`}>{r.release_id}</Link>
                </td>
                <td className="p-4">
                  <div className="font-medium text-slate-800">{r.service_name}</div>
                  <div className="text-xs text-slate-500">{r.version}</div>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {format(new Date(r.deployment_time), 'MMM d, HH:mm')}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full ${r.risk_score >= 70 ? 'bg-red-500' : r.risk_score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, r.risk_score)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{r.risk_score}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    r.recommendation === 'ROLLBACK RECOMMENDED' ? 'bg-red-100 text-red-700 border border-red-200' :
                    r.recommendation === 'HUMAN REVIEW REQUIRED' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {r.recommendation}
                  </span>
                </td>
                <td className="p-4">
                  {r.has_decision ? (
                    <span className="text-xs font-medium text-slate-500">Decided: {r.decision_status}</span>
                  ) : (
                    <span className="text-xs font-medium text-blue-500">Pending</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredReleases.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No releases found matching criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
}
