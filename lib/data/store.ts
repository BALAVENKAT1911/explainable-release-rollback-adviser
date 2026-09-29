import { 
  ReleaseSignals, 
  AuditRecord, 
  DecisionState, 
  Organization, 
  UserRole, 
  ReleasePhase, 
  DecisionAction 
} from '../models';
import { generateSyntheticData } from './generate';
import { createAuditRecord, verifyAuditChain, GENESIS_HASH } from './auditLedger';

class DataStore {
  private releases: ReleaseSignals[] = [];
  private audits: AuditRecord[] = [];
  private decisions: Record<string, DecisionState> = {};
  private sequenceCounter = 0;
  private lastAuditHash = GENESIS_HASH;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.initialized) {
      this.releases = generateSyntheticData(1000);
      this.initialized = true;

      // Seed an initial verified audit entry to demonstrate pre-existing compliance trail
      const firstRelease = this.releases[5];
      if (firstRelease) {
        this.addAudit({
          release_id: firstRelease.release_id,
          organization: firstRelease.organization_name,
          user_role: 'Release Manager',
          actor_name: 'Lead Deployer',
          recommendation: 'CONTINUE',
          risk_score: 15,
          decision: 'CONTINUE',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          compliance_tags: ['SOC2-CC8.1', 'ISO27001-A12.1.2'],
          evidence_snapshot: JSON.stringify({ note: 'Automated verification check passed on canary release.' })
        });
      }
    }
  }

  getReleases(filter?: { organization?: Organization; role?: UserRole; search?: string }): ReleaseSignals[] {
    let list = this.releases;

    if (filter?.role === 'External Partner') {
      // External partner strictly isolated to External Partner Gamma
      list = list.filter(r => r.organization_name === 'External Partner Gamma');
    } else if (filter?.organization && filter?.role !== 'Compliance Auditor') {
      // Compliance auditor can see all orgs; other roles filter to their active org
      list = list.filter(r => r.organization_name === filter.organization);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(r => 
        r.release_id.toLowerCase().includes(q) ||
        r.service_name.toLowerCase().includes(q) ||
        r.version.toLowerCase().includes(q)
      );
    }

    return list;
  }

  getRelease(id: string, userContext?: { organization?: Organization; role?: UserRole }): ReleaseSignals | undefined {
    const release = this.releases.find(r => r.release_id === id);
    if (!release) return undefined;

    // Tenancy isolation check: External Partner cannot access other org releases
    if (userContext?.role === 'External Partner' && release.organization_name !== 'External Partner Gamma') {
      return undefined; // Handled as access denied
    }

    return release;
  }

  getAudits(userContext?: { organization?: Organization; role?: UserRole }): AuditRecord[] {
    if (userContext?.role === 'External Partner') {
      return this.audits.filter(a => a.organization === 'External Partner Gamma');
    }
    return this.audits;
  }

  getAuditChainVerification() {
    return verifyAuditChain(this.audits);
  }

  addAudit(params: {
    release_id: string;
    organization: Organization;
    user_role: UserRole;
    actor_name: string;
    recommendation: any;
    risk_score: number;
    decision: DecisionAction;
    override_reason?: string;
    override_notes?: string;
    timestamp: string;
    compliance_tags?: string[];
    dual_approver?: string;
    evidence_snapshot: string;
  }): AuditRecord {
    this.sequenceCounter++;
    
    const record = createAuditRecord({
      sequence_number: this.sequenceCounter,
      previous_hash: this.lastAuditHash,
      release_id: params.release_id,
      organization: params.organization,
      user_role: params.user_role,
      actor_name: params.actor_name,
      recommendation: params.recommendation,
      risk_score: params.risk_score,
      decision: params.decision,
      override_reason: params.override_reason,
      override_notes: params.override_notes,
      timestamp: params.timestamp,
      compliance_tags: params.compliance_tags || ['SOC2-CC8.1', 'FFIEC-D&A', 'ISO27001-A12.1.2'],
      dual_approver: params.dual_approver,
      evidence_snapshot: params.evidence_snapshot
    });

    this.lastAuditHash = record.audit_hash;
    this.audits.unshift(record); // newest first for display
    return record;
  }

  getDecision(releaseId: string): DecisionState | undefined {
    return this.decisions[releaseId];
  }

  setDecision(releaseId: string, decision: DecisionState) {
    this.decisions[releaseId] = decision;
  }

  advanceReleasePhase(releaseId: string): ReleaseSignals | undefined {
    const release = this.releases.find(r => r.release_id === releaseId);
    if (!release) return undefined;

    const phaseFlow: Record<ReleasePhase, ReleasePhase> = {
      'canary_5': 'canary_25',
      'canary_25': 'full_rollout',
      'full_rollout': 'baking',
      'baking': 'completed',
      'completed': 'completed',
      'rolled_back': 'rolled_back',
      'escalated': 'escalated'
    };

    const nextPhase = phaseFlow[release.phase] || release.phase;
    release.phase = nextPhase;
    release.bake_duration_minutes += 15;

    // If advanced safely, telemetry continues to stabilize
    if (release.phase === 'completed') {
      release.monitoring_status = 'healthy';
    }

    return release;
  }

  reset() {
    this.initialized = false;
    this.audits = [];
    this.decisions = {};
    this.sequenceCounter = 0;
    this.lastAuditHash = GENESIS_HASH;
    this.initialize();
  }
}

// Global Singleton
export const store = new DataStore();
