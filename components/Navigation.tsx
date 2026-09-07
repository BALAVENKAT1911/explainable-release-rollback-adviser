'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileBarChart, History, Beaker, HelpCircle, ShieldAlert } from 'lucide-react';
import { useAppContext } from './AppContext';
import { UserRole, Organization } from '@/lib/models';

export function Navigation() {
  const pathname = usePathname();
  const { role, setRole, organization, setOrganization } = useAppContext();

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/releases', label: 'Release Analysis', icon: FileBarChart },
    { href: '/audit', label: 'Decision History', icon: History },
    { href: '/experiments', label: 'Experiment', icon: Beaker },
    { href: '/failure-cases', label: 'Failure Cases', icon: ShieldAlert },
    { href: '/docs', label: 'Documentation', icon: HelpCircle },
  ];

  return (
    <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 border-b border-slate-700">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-xs">ERRA</div>
          <h1 className="text-lg font-semibold tracking-tight hidden md:block">Explainable Release Rollback Adviser <span className="text-slate-400 font-normal text-sm ml-2">v1.0.35-beta</span></h1>
        </div>
        
        <nav className="hidden lg:flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg">
          {links.map(link => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors ${active ? 'bg-indigo-500 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                <Icon size={14} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-1 text-xs">
          <select 
            className="px-2 py-1 bg-transparent text-slate-200 outline-none hover:bg-slate-700 rounded cursor-pointer"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="Viewer" className="bg-slate-800">Viewer</option>
            <option value="Engineer" className="bg-slate-800">Engineer</option>
            <option value="Release Manager" className="bg-slate-800">Manager</option>
            <option value="Compliance Auditor" className="bg-slate-800">Auditor</option>
            <option value="External Partner" className="bg-slate-800">Partner</option>
          </select>
        </div>
        <div className="h-8 w-px bg-slate-700"></div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase text-slate-400 tracking-wider font-bold">Org Environment</span>
          <select 
            className="text-sm bg-transparent outline-none cursor-pointer text-white text-right"
            value={organization}
            onChange={(e) => setOrganization(e.target.value as Organization)}
          >
            <option value="Org Alpha" className="bg-slate-800">Org Alpha</option>
            <option value="Org Beta" className="bg-slate-800">Org Beta</option>
            <option value="External Partner Gamma" className="bg-slate-800">External Partner Gamma</option>
          </select>
        </div>
      </div>
    </header>
  );
}
