import { NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { runComprehensiveExperiment } from '@/lib/engine/experiment';

export async function GET() {
  const releases = store.getReleases();
  const results = runComprehensiveExperiment(releases);
  return NextResponse.json(results);
}
