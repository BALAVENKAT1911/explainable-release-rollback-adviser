export type Organization = 'Org Alpha' | 'Org Beta' | 'External Partner Gamma';
export type UserRole = 'Viewer' | 'Engineer' | 'Release Manager' | 'Compliance Auditor' | 'External Partner';

export interface ReleaseSignals {
  // Metadata
  release_id: string;
  organization_name: Organization;
  service_name: string;
  version: string;
  environment: string;
  deployment_time: string;
  change_type: 'feature' | 'bugfix' | 'hotfix' | 'config' | 'infrastructure';
  engineer_or_team: string;

  // Service signals
  latency_ms: number | null;
  latency_baseline_ms: number | null;
  error_rate: number | null;
  baseline_error_rate: number | null;
  availability: number | null;
  cpu_usage: number | null;
  memory_usage: number | null;

  // Transaction signals
  transactions_per_minute: number | null;
  baseline_transactions_per_minute: number | null;
  transaction_success_rate: number | null;
  transaction_failure_rate: number | null;

  // Business/customer signals
  affected_customers: number | null;
  customer_impact_score: number | null; // 0-100
  revenue_impact_estimate: number | null;
  business_criticality: 'low' | 'medium' | 'critical';
  customer_complaint_rate: number | null;

  // Operational signals
  incident_severity: 'none' | 'sev3' | 'sev2' | 'sev1';
  rollback_available: boolean;
  monitoring_status: 'healthy' | 'degraded' | 'outage';

  // Ground-truth label for experiments
  actual_safe_action: 'CONTINUE' | 'ROLLBACK';
}

export type RecommendationStatus = 'CONTINUE' | 'ROLLBACK RECOMMENDED' | 'HUMAN REVIEW REQUIRED';

export interface RuleEvidence {
  rule_name: string;
  description: string;
  triggered: boolean;
  evidence_values: Record<string, string | number | boolean | null>;
}

export interface RecommendationResult {
  recommendation: RecommendationStatus;
  risk_score: number;
  confidence: 'High' | 'Medium' | 'Low';
  triggered_rules: RuleEvidence[];
  supporting_evidence: string[];
  conflicting_evidence: string[];
  missing_data: string[];
  reason: string;
}

export interface AuditRecord {
  audit_id: string;
  release_id: string;
  organization: Organization;
  user_role: UserRole;
  recommendation: RecommendationStatus;
  risk_score: number;
  decision: 'CONTINUE' | 'ROLLBACK' | 'ESCALATED';
  override_reason?: string;
  override_notes?: string;
  timestamp: string;
  evidence_snapshot: string; // JSON string of RecommendationResult
}

export interface DecisionState {
  has_decision: boolean;
  decision?: 'CONTINUE' | 'ROLLBACK' | 'ESCALATED';
  timestamp?: string;
  user_role?: UserRole;
}
