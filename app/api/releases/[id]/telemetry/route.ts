import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { UserRole } from '@/lib/models';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const release = store.getRelease(id);

  if (!release) {
    return NextResponse.json({ error: 'Release not found' }, { status: 404 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ 
      error: 'Malformed JSON payload: Request body must be valid JSON.' 
    }, { status: 400 });
  }

  const { latency_ms, error_rate, transactions_per_minute, userRole } = body;

  // Authorization check for updating telemetry
  if (userRole === 'Viewer' || userRole === 'External Partner') {
    return NextResponse.json({ 
      error: `Permission Denied: Role ${userRole} is not authorized to submit telemetry updates.` 
    }, { status: 403 });
  }

  // Misuse Case 5: Negative Latency Validation
  if (latency_ms !== undefined && latency_ms !== null) {
    if (typeof latency_ms !== 'number' || isNaN(latency_ms)) {
      return NextResponse.json({ 
        error: 'Validation Error: latency_ms must be a valid numeric value.' 
      }, { status: 422 });
    }
    if (latency_ms < 0) {
      return NextResponse.json({ 
        error: `Validation Error: Negative latency value (${latency_ms} ms) is physically invalid.` 
      }, { status: 422 });
    }
  }

  // Misuse Case 4: Invalid Metric / NaN / Out-of-bounds error rate
  if (error_rate !== undefined && error_rate !== null) {
    if (typeof error_rate !== 'number' || isNaN(error_rate)) {
      return NextResponse.json({ 
        error: 'Validation Error: error_rate must be a valid numeric value.' 
      }, { status: 422 });
    }
    if (error_rate < 0 || error_rate > 100) {
      return NextResponse.json({ 
        error: `Validation Error: Error rate must be between 0.0% and 100.0% (received ${error_rate}%).` 
      }, { status: 422 });
    }
  }

  if (transactions_per_minute !== undefined && transactions_per_minute !== null) {
    if (typeof transactions_per_minute !== 'number' || isNaN(transactions_per_minute) || transactions_per_minute < 0) {
      return NextResponse.json({ 
        error: 'Validation Error: transactions_per_minute must be a non-negative numeric value.' 
      }, { status: 422 });
    }
  }

  // Apply updates safely
  if (latency_ms !== undefined) release.latency_ms = latency_ms;
  if (error_rate !== undefined) release.error_rate = error_rate;
  if (transactions_per_minute !== undefined) release.transactions_per_minute = transactions_per_minute;

  return NextResponse.json({
    success: true,
    message: `Telemetry successfully updated for release ${id}`,
    updated_signals: {
      latency_ms: release.latency_ms,
      error_rate: release.error_rate,
      transactions_per_minute: release.transactions_per_minute
    }
  });
}
