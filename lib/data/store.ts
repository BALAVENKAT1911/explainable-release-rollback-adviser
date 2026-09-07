import { ReleaseSignals, AuditRecord, DecisionState } from '../models';
import { generateSyntheticData } from './generate';

class DataStore {
  private releases: ReleaseSignals[] = [];
  private audits: AuditRecord[] = [];
  private decisions: Record<string, DecisionState> = {};
  
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.initialized) {
      this.releases = generateSyntheticData(1000);
      this.initialized = true;
    }
  }

  getReleases(): ReleaseSignals[] {
    return this.releases;
  }

  getRelease(id: string): ReleaseSignals | undefined {
    return this.releases.find(r => r.release_id === id);
  }

  getAudits(): AuditRecord[] {
    return this.audits;
  }

  addAudit(audit: AuditRecord) {
    this.audits.unshift(audit);
  }
  
  getDecision(releaseId: string): DecisionState | undefined {
    return this.decisions[releaseId];
  }

  setDecision(releaseId: string, decision: DecisionState) {
    this.decisions[releaseId] = decision;
  }

  reset() {
    this.initialized = false;
    this.audits = [];
    this.decisions = {};
    this.initialize();
  }
}

// Singleton instance
export const store = new DataStore();
