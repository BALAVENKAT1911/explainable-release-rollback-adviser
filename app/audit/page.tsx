'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAppContext } from '@/components/AppContext';
import { ShieldCheck, Lock } from 'lucide-react';

export default function AuditPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const { role } = useAppContext();

  useEffect(() => {
    fetch('/api/audit')
      .then(res => res.json())
      .then(data => setAudits(data));
  }, []);

  const isAuditor = role === 'Compliance Auditor';

  if (!isAuditor) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="p-6 bg-slate-100 rounded-full mb-6">
          <Lock size={48} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Access Restricted</h1>
        <p className="text-slate-600 max-w-md">
          The decision audit history is restricted to the Compliance Auditor role. 
          Use the role switcher in the sidebar to change your role.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shadow-sm">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Decision Audit History</h1>
            <p className="text-slate-500 text-sm mt-1">Immutable log of all human decisions and overrides.</p>
          </div>
        </header>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b text-xs uppercase font-semibold text-slate-500 tracking-wider">
              <th className="p-4">Timestamp</th>
              <th className="p-4">Release ID</th>
              <th className="p-4">User Role</th>
              <th className="p-4">Recommendation</th>
              <th className="p-4">Decision</th>
              <th className="p-4">Override Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {audits.map(a => (
              <tr key={a.audit_id} className="hover:bg-slate-50">
                <td className="p-4 text-slate-600">{format(new Date(a.timestamp), 'MMM d, HH:mm:ss')}</td>
                <td className="p-4 font-medium text-slate-900">{a.release_id}</td>
                <td className="p-4 text-slate-700">{a.user_role}</td>
                <td className="p-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${a.recommendation === 'ROLLBACK RECOMMENDED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                    {a.recommendation}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-bold ${a.decision === 'ROLLBACK' ? 'text-red-600' : 'text-slate-700'}`}>
                    {a.decision}
                  </span>
                </td>
                <td className="p-4 text-slate-600 italic">
                  {a.override_reason || '-'}
                </td>
              </tr>
            ))}
            {audits.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No decisions have been made yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
}
