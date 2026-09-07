import { ReleaseSignals, Organization } from '../models';

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// Generate edge cases
function generateMissingTelemetryEdgeCase(id: number): ReleaseSignals {
  return {
    release_id: `REL-${id.toString().padStart(4, '0')}`,
    organization_name: 'Org Alpha',
    service_name: 'PaymentGateway',
    version: 'v1.4.2',
    environment: 'production',
    deployment_time: new Date().toISOString(),
    change_type: 'feature',
    engineer_or_team: 'Team A',
    latency_ms: null,
    latency_baseline_ms: 120,
    error_rate: 0.5,
    baseline_error_rate: 0.4,
    availability: 99.9,
    cpu_usage: 45,
    memory_usage: 60,
    transactions_per_minute: 1200,
    baseline_transactions_per_minute: 1250,
    transaction_success_rate: 99.5,
    transaction_failure_rate: 0.5,
    affected_customers: 0,
    customer_impact_score: 0,
    revenue_impact_estimate: 0,
    business_criticality: 'critical',
    customer_complaint_rate: 0,
    incident_severity: 'none',
    rollback_available: true,
    monitoring_status: 'degraded',
    actual_safe_action: 'CONTINUE'
  };
}

function generateContradictorySignalsEdgeCase(id: number): ReleaseSignals {
  return {
    release_id: `REL-${id.toString().padStart(4, '0')}`,
    organization_name: 'Org Beta',
    service_name: 'SearchService',
    version: 'v2.1.0',
    environment: 'production',
    deployment_time: new Date().toISOString(),
    change_type: 'feature',
    engineer_or_team: 'Team B',
    latency_ms: 1500, // Very high
    latency_baseline_ms: 150,
    error_rate: 0.1, // Very low
    baseline_error_rate: 0.1,
    availability: 100,
    cpu_usage: 30,
    memory_usage: 40,
    transactions_per_minute: 5000,
    baseline_transactions_per_minute: 5000,
    transaction_success_rate: 99.9,
    transaction_failure_rate: 0.1,
    affected_customers: 0, // No impact
    customer_impact_score: 0,
    revenue_impact_estimate: 0,
    business_criticality: 'medium',
    customer_complaint_rate: 0,
    incident_severity: 'none',
    rollback_available: true,
    monitoring_status: 'healthy',
    actual_safe_action: 'CONTINUE'
  };
}

function generateRollbackUnavailableEdgeCase(id: number): ReleaseSignals {
  return {
    release_id: `REL-${id.toString().padStart(4, '0')}`,
    organization_name: 'Org Alpha',
    service_name: 'DatabaseMigration',
    version: 'v5.0.0',
    environment: 'production',
    deployment_time: new Date().toISOString(),
    change_type: 'infrastructure',
    engineer_or_team: 'DBA Team',
    latency_ms: 500,
    latency_baseline_ms: 200,
    error_rate: 6.0, // High error rate
    baseline_error_rate: 0.5,
    availability: 95.0,
    cpu_usage: 80,
    memory_usage: 85,
    transactions_per_minute: 800,
    baseline_transactions_per_minute: 1000,
    transaction_success_rate: 94.0,
    transaction_failure_rate: 6.0,
    affected_customers: 5000,
    customer_impact_score: 80,
    revenue_impact_estimate: 10000,
    business_criticality: 'critical',
    customer_complaint_rate: 2.5,
    incident_severity: 'sev2',
    rollback_available: false, // Rollback unavailable
    monitoring_status: 'healthy',
    actual_safe_action: 'ROLLBACK' // Even if unavailable, ground truth action is it *should* have been rolled back
  };
}

export function generateSyntheticData(count: number = 1000): ReleaseSignals[] {
  const data: ReleaseSignals[] = [];
  
  const orgs: Organization[] = ['Org Alpha', 'Org Beta', 'External Partner Gamma'];
  const services = ['AuthService', 'PaymentGateway', 'SearchService', 'RecommendationEngine', 'UserProfileService', 'NotificationService'];
  const changeTypes: ('feature' | 'bugfix' | 'hotfix' | 'config' | 'infrastructure')[] = ['feature', 'bugfix', 'hotfix', 'config', 'infrastructure'];
  const criticality: ('low' | 'medium' | 'critical')[] = ['low', 'medium', 'critical'];

  for (let i = 1; i <= count - 3; i++) {
    const isRisky = Math.random() < 0.2; // 20% risky releases
    const org = randomChoice(orgs);
    const service = org === 'External Partner Gamma' ? 'NotificationService' : randomChoice(services); // Partner only has one service
    const isDegraded = isRisky && Math.random() < 0.5;
    
    const baseline_latency = randomInt(50, 300);
    const latency = isRisky ? baseline_latency * randomFloat(1.2, 3.0) : baseline_latency * randomFloat(0.9, 1.1);
    
    const baseline_error = randomFloat(0.1, 1.0);
    const error_rate = isRisky ? baseline_error + randomFloat(2.0, 10.0) : baseline_error * randomFloat(0.8, 1.2);
    
    const baseline_tpm = randomInt(500, 10000);
    const tpm = isRisky && isDegraded ? baseline_tpm * randomFloat(0.5, 0.9) : baseline_tpm * randomFloat(0.9, 1.1);
    
    const businessCrit = randomChoice(criticality);
    const impact = isRisky ? randomInt(10, 100) : randomInt(0, 5);
    const affected = isRisky ? randomInt(100, 50000) : 0;
    
    data.push({
      release_id: `REL-${i.toString().padStart(4, '0')}`,
      organization_name: org,
      service_name: service,
      version: `v${randomInt(1, 10)}.${randomInt(0, 9)}.${randomInt(0, 9)}`,
      environment: 'production',
      deployment_time: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000 - randomInt(0, 24) * 60 * 60 * 1000).toISOString(),
      change_type: randomChoice(changeTypes),
      engineer_or_team: `Team ${randomChoice(['A', 'B', 'C', 'D'])}`,
      
      latency_ms: Math.floor(latency),
      latency_baseline_ms: baseline_latency,
      error_rate: error_rate,
      baseline_error_rate: baseline_error,
      availability: isRisky ? randomFloat(95, 99.5) : randomFloat(99.9, 100),
      cpu_usage: randomInt(20, 90),
      memory_usage: randomInt(30, 85),
      
      transactions_per_minute: Math.floor(tpm),
      baseline_transactions_per_minute: baseline_tpm,
      transaction_success_rate: 100 - error_rate,
      transaction_failure_rate: error_rate,
      
      affected_customers: affected,
      customer_impact_score: impact,
      revenue_impact_estimate: isRisky ? randomInt(1000, 50000) : 0,
      business_criticality: businessCrit,
      customer_complaint_rate: isRisky ? randomFloat(1, 5) : randomFloat(0, 0.1),
      
      incident_severity: isRisky ? (impact > 50 ? 'sev1' : 'sev2') : 'none',
      rollback_available: Math.random() > 0.05, // 95% have rollback
      monitoring_status: isRisky ? 'degraded' : 'healthy',
      
      actual_safe_action: (isRisky && impact > 20) ? 'ROLLBACK' : 'CONTINUE'
    });
  }

  // Add edge cases
  data.push(generateMissingTelemetryEdgeCase(count - 2));
  data.push(generateContradictorySignalsEdgeCase(count - 1));
  data.push(generateRollbackUnavailableEdgeCase(count));

  // Sort by deployment time descending
  data.sort((a, b) => new Date(b.deployment_time).getTime() - new Date(a.deployment_time).getTime());

  return data;
}
