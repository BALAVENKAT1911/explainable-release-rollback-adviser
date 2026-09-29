import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { UserRole } from '@/lib/models';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const body = await request.json().catch(() => ({}));
  const { userRole = 'Engineer' } = body as { userRole?: UserRole };

  if (userRole === 'Viewer' || userRole === 'External Partner' || userRole === 'Compliance Auditor') {
    return NextResponse.json({ 
      error: `Role ${userRole} is not authorized to advance release canary phases.` 
    }, { status: 403 });
  }

  const updated = store.advanceReleasePhase(id);
  if (!updated) {
    return NextResponse.json({ error: 'Release not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    new_phase: updated.phase,
    bake_duration_minutes: updated.bake_duration_minutes,
    message: `Release ${id} advanced to phase: ${updated.phase}`
  });
}
