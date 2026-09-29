export type Organization = 'Org Alpha' | 'Org Beta' | 'External Partner Gamma';
export type UserRole = 'Viewer' | 'Engineer' | 'Release Manager' | 'Compliance Auditor' | 'External Partner';

export type ReleasePhase = 'canary_5' | 'canary_25' | 'full_rollout' | 'baking' | 'completed' | 'rolled_back' | 'escalated';

export type ChangeType = 'feature' | 'bugfix' | 'hotfix' | 'config' | 'infrastructure';
export type BusinessCriticality = 'low' | 'medium' | 'critical';
export type IncidentSeverity = 'none' | 'sev3' | 'sev2' | 'sev1';
export type RecommendationStatus = 'CONTINUE' | 'ROLLBACK RECOMMENDED' | 'HUMAN REVIEW REQUIRED';
export type DecisionAction = 'CONTINUE' | 'ROLLBACK' | 'ESCALATED';

export type RollbackStrategy = 
  | 'automated_blue_green' 
  | 'canary_traffic_drain' 
  | 'schema_inverse_migration' 
  | 'feature_flag_killswitch' 
  | 'manual_pipeline_redeploy';

export interface RollbackReadiness {
  available: boolean;
  strategy: RollbackStrategy;
  estimated_mtt_rollback_min: number;
  last_tested_timestamp: string;
  automated_script_validated: boolean;
  blockers?: string[];
}

export interface TelemetryPoint {
  timestamp: string;
  latency_ms: number | null;
  error_rate: number | null;
  transactions_per_minute: number | null;
  customer_complaints: number;
}

export interface ReleaseSignals {
  // Metadata
  release_id: string;
  organization_name: Organization;
  service_name: string;
  version: string;
  environment: string;
  deployment_time: string;
  change_type: ChangeType;
  engineer_or_team: string;
  phase: ReleasePhase;
  bake_duration_minutes: number;

  // Rollback readiness
  rollback_readiness: RollbackReadiness;
  rollback_available: boolean; // Backwards compatible shortcut

  // Service signals
  latency_ms: number | null;
  latency_baseline_ms: number | null;
  latency_p99_ms: number | null;
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
  business_criticality: BusinessCriticality;
  customer_complaint_rate: number | null;

  // Operational signals
  incident_severity: IncidentSeverity;
  monitoring_status: 'healthy' | 'degraded' | 'outage';

  // Time-series telemetry history for visualization
  time_series?: {
    baseline: TelemetryPoint[];
    post_deployment: TelemetryPoint[];
  };

  // Failure scenario tag if applicable
  edge_case_id?: 'missing_telemetry' | 'contradictory_signals' | 'rollback_unavailable' | 'traffic_surge_drift' | 'silent_corruption';

  // Ground-truth label for experiments
  actual_safe_action: 'CONTINUE' | 'ROLLBACK';
}

export interface RuleEvidence {
  rule_id: string;
  rule_name: string;
  category: 'technical' | 'business' | 'operational' | 'safety';
  description: string;
  condition_checked: string;
  triggered: boolean;
  points_contributed: number;
  severity: 'info' | 'warning' | 'critical';
  evidence_values: Record<string, string | number | boolean | null>;
}

export interface FactorAttribution {
  factor: string;
  category: 'technical' | 'business' | 'operational';
  points: number;
  max_points: number;
  percentage: number;
  explanation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CounterfactualScenario {
  parameter: string;
  current_value: string;
  target_threshold: string;
  delta_required: string;
  resulting_recommendation: RecommendationStatus;
  resulting_risk_score: number;
  feasibility: 'immediate' | 'requires_fix' | 'monitoring_wait';
}

export interface RecommendationResult {
  recommendation: RecommendationStatus;
  risk_score: number;
  confidence: 'High' | 'Medium' | 'Low';
  confidence_score: number; // 0-100 percentage
  triggered_rules: RuleEvidence[];
  all_rules: RuleEvidence[];
  factor_attributions: FactorAttribution[];
  counterfactuals: CounterfactualScenario[];
  supporting_evidence: string[];
  conflicting_evidence: string[];
  missing_data: string[];
  executive_summary: string;
  reason: string;
}

export interface AuditRecord {
  audit_id: string;
  sequence_number: number;
  previous_hash: string;
  audit_hash: string;
  release_id: string;
  organization: Organization;
  user_role: UserRole;
  actor_name: string;
  recommendation: RecommendationStatus;
  risk_score: number;
  decision: DecisionAction;
  override_reason?: string;
  override_notes?: string;
  timestamp: string;
  compliance_tags: string[]; // e.g. ['SOC2-CC8.1', 'FFIEC-D&A-5', 'ISO27001-A12.1.2']
  dual_approver?: string;
  evidence_snapshot: string; // JSON string of RecommendationResult
}

export interface DecisionState {
  has_decision: boolean;
  decision?: DecisionAction;
  timestamp?: string;
  user_role?: UserRole;
  actor_name?: string;
  override_reason?: string;
  override_notes?: string;
  requires_dual_approval?: boolean;
  secondary_approved?: boolean;
  secondary_approver?: string;
  secondary_timestamp?: string;
}
