import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { Organization, UserRole } from '@/lib/models';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const org = searchParams.get('organization') as Organization | null;
  const role = searchParams.get('role') as UserRole | null;

  const audits = store.getAudits({
    organization: org || undefined,
    role: role || undefined
  });

  const chainVerification = store.getAuditChainVerification();

  return NextResponse.json({
    audits,
    chainVerification,
    metadata: {
      generated_at: new Date().toISOString(),
      compliance_standard: 'SOC2-CC8.1 / FFIEC Architecture, Infrastructure & Operations',
      hash_algorithm: 'SHA-256 Chained Block Integrity'
    }
  });
}
