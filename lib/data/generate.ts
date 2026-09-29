import { 
  ReleaseSignals, 
  Organization, 
  ReleasePhase, 
  ChangeType, 
  BusinessCriticality, 
  IncidentSeverity, 
  RollbackStrategy,
  TelemetryPoint 
} from '../models';

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateTimeSeries(
  baseLatency: number,
  currLatency: number,
  baseError: number,
  currError: number,
  baseTpm: number,
  currTpm: number,
  complaintRate: number
): { baseline: TelemetryPoint[]; post_deployment: TelemetryPoint[] } {
  const baseline: TelemetryPoint[] = [];
  const post_deployment: TelemetryPoint[] = [];
  const now = Date.now();

  // 6 baseline intervals (pre-deployment, -60m to 0m)
  for (let i = 6; i >= 1; i--) {
    const time = new Date(now - (i * 10 * 60 * 1000) - (30 * 60 * 1000)).toISOString();
    const noise = randomFloat(0.95, 1.05);
    baseline.push({
      timestamp: time,
      latency_ms: Math.round(baseLatency * noise),
      error_rate: randomFloat(Math.max(0, baseError * 0.9), baseError * 1.1),
      transactions_per_minute: Math.round(baseTpm * noise),
      customer_complaints: 0
    });
  }

  // 6 post-deployment intervals (0m to +30m)
  for (let i = 1; i <= 6; i++) {
    const time = new Date(now - ((6 - i) * 5 * 60 * 1000)).toISOString();
    // Progressively ramp towards current values
    const progress = i / 6;
    const lat = Math.round(baseLatency + (currLatency - baseLatency) * progress * randomFloat(0.95, 1.05));
    const err = randomFloat(
      Math.max(0, baseError + (currError - baseError) * progress * 0.9),
      Math.max(0, baseError + (currError - baseError) * progress * 1.1)
    );
    const tpm = Math.round(baseTpm + (currTpm - baseTpm) * progress * randomFloat(0.97, 1.03));
    const complaints = Math.round(complaintRate * progress * randomFloat(1, 5));

    post_deployment.push({
      timestamp: time,
      latency_ms: lat,
      error_rate: err,
      transactions_per_minute: tpm,
      customer_complaints: complaints
    });
  }

  return { baseline, post_deployment };
}

// Edge Case 1: Silent Business Failure / Micro-corruption
function generateSilentCorruptionEdgeCase(id: number): ReleaseSignals {
  const baseLat = 110;
  const baseErr = 0.08;
  const baseTpm = 4500;
  const currTpm = 4450;
  return {
    release_id: `REL-${id.toString().padStart(4, '0')}`,
    organization_name: 'Org Alpha',
    service_name: 'PaymentGateway',
    version: 'v4.8.1',
    environment: 'production',
    deployment_time: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    change_type: 'feature',
    engineer_or_team: 'Core Payments Team',
    phase: 'canary_25',
    bake_duration_minutes: 42,
    rollback_readiness: {
      available: true,
      strategy: 'automated_blue_green',
      estimated_mtt_rollback_min: 3,
      last_tested_timestamp: new Date(Date.now() - 3600000).toISOString(),
      automated_script_validated: true
    },
    rollback_available: true,
    latency_ms: 115,
    latency_baseline_ms: baseLat,
    latency_p99_ms: 190,
    error_rate: 0.12, // Appears completely green on HTTP 200 metrics
    baseline_error_rate: baseErr,
    availability: 99.98,
    cpu_usage: 42,
    memory_usage: 55,
    transactions_per_minute: currTpm,
    baseline_transactions_per_minute: baseTpm,
    transaction_success_rate: 81.5, // 18.5% silent drop!
    transaction_failure_rate: 18.5,
    affected_customers: 3400,
    customer_impact_score: 78,
    revenue_impact_estimate: 42000,
    business_criticality: 'critical',
    customer_complaint_rate: 4.8,
    incident_severity: 'sev1',
    monitoring_status: 'degraded',
    time_series: generateTimeSeries(baseLat, 115, baseErr, 0.12, baseTpm, currTpm, 4.8),
    edge_case_id: 'silent_corruption',
    actual_safe_action: 'ROLLBACK'
  };
}

// Edge Case 2: Metric Drift during Traffic Surge (Black Friday / Campaign)
function generateTrafficSurgeEdgeCase(id: number): ReleaseSignals {
  const baseLat = 85;
  const currLat = 105; // 23% latency rise due to legitimate queueing
  const baseErr = 0.05;
  const baseTpm = 2000;
  const currTpm = 6800; // 3.4x volume surge
  return {
    release_id: `REL-${id.toString().padStart(4, '0')}`,
    organization_name: 'Org Beta',
    service_name: 'TradingEngine',
    version: 'v3.2.0',
    environment: 'production',
    deployment_time: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    change_type: 'feature',
    engineer_or_team: 'High-Frequency Ops',
    phase: 'full_rollout',
    bake_duration_minutes: 55,
    rollback_readiness: {
      available: true,
      strategy: 'automated_blue_green',
      estimated_mtt_rollback_min: 2,
      last_tested_timestamp: new Date(Date.now() - 7200000).toISOString(),
      automated_script_validated: true
    },
    rollback_available: true,
    latency_ms: currLat,
    latency_baseline_ms: baseLat,
    latency_p99_ms: 160,
    error_rate: 0.07, // Error rate did NOT degrade
    baseline_error_rate: baseErr,
    availability: 99.99,
    cpu_usage: 74,
    memory_usage: 68,
    transactions_per_minute: currTpm,
    baseline_transactions_per_minute: baseTpm,
    transaction_success_rate: 99.93,
    transaction_failure_rate: 0.07,
    affected_customers: 0,
    customer_impact_score: 0,
    revenue_impact_estimate: 0,
    business_criticality: 'critical',
    customer_complaint_rate: 0,
    incident_severity: 'none',
    monitoring_status: 'healthy',
    time_series: generateTimeSeries(baseLat, currLat, baseErr, 0.07, baseTpm, currTpm, 0),
    edge_case_id: 'traffic_surge_drift',
    actual_safe_action: 'CONTINUE'
  };
}

// Edge Case 3: Missing Telemetry / Metric Blackout
function generateMissingTelemetryEdgeCase(id: number): ReleaseSignals {
  return {
    release_id: `REL-${id.toString().padStart(4, '0')}`,
    organization_name: 'Org Alpha',
    service_name: 'UserProfileService',
    version: 'v2.9.4',
    environment: 'production',
    deployment_time: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    change_type: 'bugfix',
    engineer_or_team: 'Identity Platform',
    phase: 'canary_5',
    bake_duration_minutes: 28,
    rollback_readiness: {
      available: true,
      strategy: 'canary_traffic_drain',
      estimated_mtt_rollback_min: 1,
      last_tested_timestamp: new Date(Date.now() - 14400000).toISOString(),
      automated_script_validated: true
    },
    rollback_available: true,
    latency_ms: null, // Telemetry agent crashed
    latency_baseline_ms: 95,
    latency_p99_ms: null,
    error_rate: 0.4,
    baseline_error_rate: 0.35,
    availability: 99.9,
    cpu_usage: 35,
    memory_usage: 48,
    transactions_per_minute: null, // Missing
    baseline_transactions_per_minute: 1800,
    transaction_success_rate: null,
    transaction_failure_rate: null,
    affected_customers: null,
    customer_impact_score: null,
    revenue_impact_estimate: null,
    business_criticality: 'critical',
    customer_complaint_rate: 0,
    incident_severity: 'none',
    monitoring_status: 'outage',
    edge_case_id: 'missing_telemetry',
    actual_safe_action: 'CONTINUE'
  };
}

// Edge Case 4: Contradictory / Divergent Signals
function generateContradictorySignalsEdgeCase(id: number): ReleaseSignals {
  const baseLat = 120;
  const currLat = 980; // Huge latency spike
  const baseErr = 0.08;
  const baseTpm = 3200;
  return {
    release_id: `REL-${id.toString().padStart(4, '0')}`,
    organization_name: 'Org Beta',
    service_name: 'RiskAnalytics',
    version: 'v1.8.0',
    environment: 'production',
    deployment_time: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    change_type: 'feature',
    engineer_or_team: 'Analytics Core',
    phase: 'baking',
    bake_duration_minutes: 35,
    rollback_readiness: {
      available: true,
      strategy: 'automated_blue_green',
      estimated_mtt_rollback_min: 4,
      last_tested_timestamp: new Date(Date.now() - 86400000).toISOString(),
      automated_script_validated: true
    },
    rollback_available: true,
    latency_ms: currLat,
    latency_baseline_ms: baseLat,
    latency_p99_ms: 1850,
    error_rate: 0.08, // Perfectly nominal
    baseline_error_rate: baseErr,
    availability: 100,
    cpu_usage: 62,
    memory_usage: 58,
    transactions_per_minute: baseTpm,
    baseline_transactions_per_minute: baseTpm,
    transaction_success_rate: 99.92,
    transaction_failure_rate: 0.08,
    affected_customers: 0, // No user complaints or failed transactions
    customer_impact_score: 0,
    revenue_impact_estimate: 0,
    business_criticality: 'medium',
    customer_complaint_rate: 0,
    incident_severity: 'none',
    monitoring_status: 'healthy',
    time_series: generateTimeSeries(baseLat, currLat, baseErr, 0.08, baseTpm, baseTpm, 0),
    edge_case_id: 'contradictory_signals',
    actual_safe_action: 'CONTINUE'
  };
}

// Edge Case 5: Rollback Unavailable / Irreversible Schema Migration
function generateRollbackUnavailableEdgeCase(id: number): ReleaseSignals {
  const baseLat = 140;
  const currLat = 480;
  const baseErr = 0.4;
  const currErr = 6.8;
  const baseTpm = 1100;
  const currTpm = 820;
  return {
    release_id: `REL-${id.toString().padStart(4, '0')}`,
    organization_name: 'Org Alpha',
    service_name: 'AccountLedger',
    version: 'v6.0.0',
    environment: 'production',
    deployment_time: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    change_type: 'infrastructure',
    engineer_or_team: 'Database Operations',
    phase: 'full_rollout',
    bake_duration_minutes: 18,
    rollback_readiness: {
      available: false, // Rollback blocked
      strategy: 'schema_inverse_migration',
      estimated_mtt_rollback_min: 120,
      last_tested_timestamp: 'N/A',
      automated_script_validated: false,
      blockers: [
        'Destructive column migration executed without backward-compatible view',
        'Data loss risk on automatic inverse replay',
        'Manual database administrative recovery required'
      ]
    },
    rollback_available: false,
    latency_ms: currLat,
    latency_baseline_ms: baseLat,
    latency_p99_ms: 920,
    error_rate: currErr,
    baseline_error_rate: baseErr,
    availability: 93.2,
    cpu_usage: 88,
    memory_usage: 92,
    transactions_per_minute: currTpm,
    baseline_transactions_per_minute: baseTpm,
    transaction_success_rate: 93.2,
    transaction_failure_rate: 6.8,
    affected_customers: 8400,
    customer_impact_score: 88,
    revenue_impact_estimate: 75000,
    business_criticality: 'critical',
    customer_complaint_rate: 3.8,
    incident_severity: 'sev1',
    monitoring_status: 'degraded',
    time_series: generateTimeSeries(baseLat, currLat, baseErr, currErr, baseTpm, currTpm, 3.8),
    edge_case_id: 'rollback_unavailable',
    actual_safe_action: 'ROLLBACK'
  };
}

export function generateSyntheticData(count: number = 1000): ReleaseSignals[] {
  const data: ReleaseSignals[] = [];
  
  const orgServices: Record<Organization, string[]> = {
    'Org Alpha': ['PaymentGateway', 'AuthService', 'AccountLedger', 'UserProfileService', 'CoreCheckout'],
    'Org Beta': ['TradingEngine', 'PortfolioService', 'RiskAnalytics', 'SettlementService', 'MarketFeedGateway'],
    'External Partner Gamma': ['NotificationGateway', 'PartnerMerchantAPI', 'WebhookDispatcher']
  };

  const changeTypes: ChangeType[] = ['feature', 'bugfix', 'hotfix', 'config', 'infrastructure'];
  const criticality: BusinessCriticality[] = ['low', 'medium', 'critical'];
  const phases: ReleasePhase[] = ['canary_5', 'canary_25', 'full_rollout', 'baking', 'completed'];
  const rollbackStrategies: RollbackStrategy[] = [
    'automated_blue_green', 
    'canary_traffic_drain', 
    'schema_inverse_migration', 
    'feature_flag_killswitch', 
    'manual_pipeline_redeploy'
  ];

  // We reserve 5 slots for edge cases
  const regularCount = count - 5;

  for (let i = 1; i <= regularCount; i++) {
    // Org distribution: 45% Alpha, 40% Beta, 15% External Partner Gamma
    let org: Organization = 'Org Alpha';
    const orgRand = Math.random();
    if (orgRand > 0.85) {
      org = 'External Partner Gamma';
    } else if (orgRand > 0.45) {
      org = 'Org Beta';
    }

    const service = randomChoice(orgServices[org]);
    const isRisky = Math.random() < 0.22; // ~22% risky
    const isDegraded = isRisky && Math.random() < 0.6;
    
    const baseline_latency = randomInt(40, 280);
    const latency = isRisky 
      ? Math.round(baseline_latency * randomFloat(1.25, 3.2)) 
      : Math.round(baseline_latency * randomFloat(0.92, 1.08));
    
    const baseline_error = randomFloat(0.05, 0.6);
    const error_rate = isRisky 
      ? randomFloat(baseline_error + 1.2, baseline_error + 8.5) 
      : randomFloat(Math.max(0.01, baseline_error * 0.8), baseline_error * 1.15);
    
    const baseline_tpm = org === 'External Partner Gamma' ? randomInt(400, 3000) : randomInt(1500, 12000);
    const tpm = isRisky && isDegraded 
      ? Math.round(baseline_tpm * randomFloat(0.4, 0.85)) 
      : Math.round(baseline_tpm * randomFloat(0.95, 1.05));
    
    const businessCrit = org === 'External Partner Gamma' 
      ? (Math.random() < 0.3 ? 'medium' : 'low') 
      : randomChoice(criticality);
      
    const impactScore = isRisky ? randomInt(25, 95) : randomInt(0, 8);
    const affected = isRisky ? randomInt(150, 45000) : randomInt(0, 10);
    const complaintRate = isRisky ? randomFloat(0.5, 4.2) : 0;
    const revImpact = isRisky ? randomInt(2000, 60000) : 0;
    
    const rollbackAvail = Math.random() > 0.04;
    const chosenStrategy = randomChoice(rollbackStrategies);
    const phase = randomChoice(phases);

    const timeSeries = generateTimeSeries(
      baseline_latency, 
      latency, 
      baseline_error, 
      error_rate, 
      baseline_tpm, 
      tpm, 
      complaintRate
    );

    data.push({
      release_id: `REL-${i.toString().padStart(4, '0')}`,
      organization_name: org,
      service_name: service,
      version: `v${randomInt(1, 8)}.${randomInt(0, 12)}.${randomInt(0, 15)}`,
      environment: 'production',
      deployment_time: new Date(Date.now() - randomInt(5, 43200) * 60 * 1000).toISOString(),
      change_type: randomChoice(changeTypes),
      engineer_or_team: `${org.replace('External ', '')} Platform Team`,
      phase,
      bake_duration_minutes: randomInt(10, 180),
      rollback_readiness: {
        available: rollbackAvail,
        strategy: chosenStrategy,
        estimated_mtt_rollback_min: randomInt(2, 15),
        last_tested_timestamp: new Date(Date.now() - randomInt(1, 30) * 86400000).toISOString(),
        automated_script_validated: rollbackAvail,
        blockers: rollbackAvail ? undefined : ['Pre-flight health check timed out on rollback candidate']
      },
      rollback_available: rollbackAvail,
      latency_ms: latency,
      latency_baseline_ms: baseline_latency,
      latency_p99_ms: Math.round(latency * randomFloat(1.4, 2.1)),
      error_rate,
      baseline_error_rate: baseline_error,
      availability: isRisky ? randomFloat(94.5, 99.2) : randomFloat(99.92, 100),
      cpu_usage: randomInt(25, isRisky ? 95 : 65),
      memory_usage: randomInt(35, isRisky ? 90 : 70),
      transactions_per_minute: tpm,
      baseline_transactions_per_minute: baseline_tpm,
      transaction_success_rate: Math.max(0, 100 - error_rate),
      transaction_failure_rate: error_rate,
      affected_customers: affected,
      customer_impact_score: impactScore,
      revenue_impact_estimate: revImpact,
      business_criticality: businessCrit,
      customer_complaint_rate: complaintRate,
      incident_severity: isRisky ? (impactScore > 65 ? 'sev1' : impactScore > 35 ? 'sev2' : 'sev3') : 'none',
      monitoring_status: isRisky ? 'degraded' : 'healthy',
      time_series: timeSeries,
      actual_safe_action: (isRisky && (impactScore >= 30 || error_rate > 2.5)) ? 'ROLLBACK' : 'CONTINUE'
    });
  }

  // Inject 5 explicit edge cases at fixed, memorable IDs
  data.push(generateSilentCorruptionEdgeCase(count - 4));
  data.push(generateTrafficSurgeEdgeCase(count - 3));
  data.push(generateMissingTelemetryEdgeCase(count - 2));
  data.push(generateContradictorySignalsEdgeCase(count - 1));
  data.push(generateRollbackUnavailableEdgeCase(count));

  // Sort by deployment time descending
  data.sort((a, b) => new Date(b.deployment_time).getTime() - new Date(a.deployment_time).getTime());

  return data;
}
