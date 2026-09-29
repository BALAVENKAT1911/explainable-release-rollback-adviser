'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileBarChart, 
  History, 
  Beaker, 
  HelpCircle, 
  ShieldAlert, 
  ShieldCheck,
  Building2,
  UserCheck,
  Lock,
  Play
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { UserRole, Organization } from '@/lib/models';

export function Navigation() {
  const pathname = usePathname();
  const { role, setRole, organization, setOrganization } = useAppContext();

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/releases', label: 'Release Analysis', icon: FileBarChart },
    { href: '/audit', label: 'Decision Ledger', icon: History, badge: 'Verified' },
    { href: '/demo', label: 'Demo Suite', icon: Play, badge: 'Live' },
    { href: '/experiments', label: 'Experiments', icon: Beaker },
    { href: '/failure-cases', label: 'Failure Modes (5)', icon: ShieldAlert },
    { href: '/docs', label: 'Compliance Docs', icon: HelpCircle },
  ];

  // If partner is selected, restrict org to partner
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'External Partner') {
      setOrganization('External Partner Gamma');
    }
  };

  const isPartner = role === 'External Partner';
  const isAuditor = role === 'Compliance Auditor';
  const isManager = role === 'Release Manager';

  return (
    <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 border-b border-slate-700 shadow-md">
      <div className="flex items-center gap-5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-indigo-600 group-hover:bg-indigo-500 transition-colors rounded-lg flex items-center justify-center font-black text-xs tracking-wider text-white shadow-inner">
            ERRA
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-100 flex items-center gap-2">
              Explainable Release Rollback Adviser
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/30">
                v2.0 (70% Milestone)
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden md:block">Advisory Decision Support for Regulated Enterprises</p>
          </div>
        </Link>
        
        <nav className="hidden xl:flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
          {links.map(link => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-all ${
                  active 
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Icon size={14} className={active ? 'text-white' : 'text-slate-400'} />
                {link.label}
                {link.badge && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono border border-emerald-400/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Ledger Verified Indicator */}
        <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-700/40 rounded-lg text-emerald-300 text-[11px] font-medium">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>SHA-256 Ledger Sealed</span>
        </div>

        {/* Role Selector with Permission Status */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 shadow-inner">
          <UserCheck size={14} className={isManager ? 'text-indigo-400' : isAuditor ? 'text-emerald-400' : 'text-slate-400'} />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">Simulated Role</span>
            <select 
              className="text-xs font-semibold bg-transparent text-slate-100 outline-none cursor-pointer pr-1"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
            >
              <option value="Viewer" className="bg-slate-800 text-slate-200">Viewer (Read-Only)</option>
              <option value="Engineer" className="bg-slate-800 text-slate-200">Engineer (Diagnostics & Escalation)</option>
              <option value="Release Manager" className="bg-slate-800 text-slate-200">Release Manager (Full Sign-off)</option>
              <option value="Compliance Auditor" className="bg-slate-800 text-slate-200">Compliance Auditor (All-Org Audit)</option>
              <option value="External Partner" className="bg-slate-800 text-slate-200">External Partner (Gamma Sandboxed)</option>
            </select>
          </div>
        </div>

        {/* Organization Switcher with Tenancy Boundary */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 shadow-inner">
          <Building2 size={14} className={isPartner ? 'text-amber-400' : 'text-blue-400'} />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">Tenant Boundary</span>
            {isPartner ? (
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <Lock size={10} /> Partner Gamma
              </span>
            ) : (
              <select 
                className="text-xs font-semibold bg-transparent text-slate-100 outline-none cursor-pointer pr-1"
                value={organization}
                onChange={(e) => setOrganization(e.target.value as Organization)}
              >
                <option value="Org Alpha" className="bg-slate-800 text-slate-200">Org Alpha (Retail Banking)</option>
                <option value="Org Beta" className="bg-slate-800 text-slate-200">Org Beta (Treasury & Wealth)</option>
                <option value="External Partner Gamma" className="bg-slate-800 text-slate-200">External Partner Gamma</option>
              </select>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
