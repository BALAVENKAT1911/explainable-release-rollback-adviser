'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, Organization } from '@/lib/models';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  organization: Organization;
  setOrganization: (org: Organization) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('Release Manager');
  const [organization, setOrganization] = useState<Organization>('Org Alpha');

  return (
    <AppContext.Provider value={{ role, setRole, organization, setOrganization }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
