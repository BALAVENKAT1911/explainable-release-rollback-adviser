#!/usr/bin/env python3
"""
Synthetic Release Data Generator for Explainable Release Rollback Adviser
Regulated Enterprise Release Simulation Suite
Fixed Seed Reproducibility: seed=42
"""

import argparse
import json
import random
from datetime import datetime, timedelta, timezone

def generate_dataset(count=1000, seed=42):
    random.seed(seed)
    releases = []
    
    org_services = {
        'Org Alpha': ['PaymentGateway', 'AuthService', 'AccountLedger', 'UserProfileService', 'CoreCheckout'],
        'Org Beta': ['TradingEngine', 'PortfolioService', 'RiskAnalytics', 'SettlementService', 'MarketFeedGateway'],
        'External Partner Gamma': ['NotificationGateway', 'PartnerMerchantAPI', 'WebhookDispatcher']
    }
    
    change_types = ['feature', 'bugfix', 'hotfix', 'config', 'infrastructure']
    criticalities = ['low', 'medium', 'critical']
    phases = ['canary_5', 'canary_25', 'full_rollout', 'baking', 'completed']
    strategies = [
        'automated_blue_green', 
        'canary_traffic_drain', 
        'schema_inverse_migration', 
        'feature_flag_killswitch', 
        'manual_pipeline_redeploy'
    ]

    base_time = datetime.now(timezone.utc)

    # 1. Five Special Edge Cases
    # Case 1: Silent Corruption (REL-0996)
    releases.append({
        "release_id": f"REL-0996",
        "organization_name": "Org Alpha",
        "service_name": "PaymentGateway",
        "version": "v4.8.1",
        "environment": "production",
        "deployment_time": (base_time - timedelta(minutes=42)).isoformat(),
        "change_type": "feature",
        "engineer_or_team": "Core Payments Team",
        "phase": "canary_25",
        "bake_duration_minutes": 42,
        "rollback_readiness": {
            "available": True,
            "strategy": "automated_blue_green",
            "estimated_mtt_rollback_min": 3,
            "automated_script_validated": True
        },
        "rollback_available": True,
        "latency_ms": 115,
        "latency_baseline_ms": 110,
        "latency_p99_ms": 190,
        "error_rate": 0.12,
        "baseline_error_rate": 0.08,
        "availability": 99.98,
        "cpu_usage": 42,
        "memory_usage": 55,
        "transactions_per_minute": 4450,
        "baseline_transactions_per_minute": 4500,
        "transaction_success_rate": 81.5,
        "transaction_failure_rate": 18.5,
        "affected_customers": 3400,
        "customer_impact_score": 78,
        "revenue_impact_estimate": 42000,
        "business_criticality": "critical",
        "customer_complaint_rate": 4.8,
        "incident_severity": "sev1",
        "monitoring_status": "degraded",
        "edge_case_id": "silent_corruption",
        "actual_safe_action": "ROLLBACK"
    })

    # Case 2: Traffic Surge (REL-0997)
    releases.append({
        "release_id": f"REL-0997",
        "organization_name": "Org Beta",
        "service_name": "TradingEngine",
        "version": "v3.2.0",
        "environment": "production",
        "deployment_time": (base_time - timedelta(minutes=55)).isoformat(),
        "change_type": "feature",
        "engineer_or_team": "High-Frequency Ops",
        "phase": "full_rollout",
        "bake_duration_minutes": 55,
        "rollback_readiness": {
            "available": True,
            "strategy": "automated_blue_green",
            "estimated_mtt_rollback_min": 2,
            "automated_script_validated": True
        },
        "rollback_available": True,
        "latency_ms": 105,
        "latency_baseline_ms": 85,
        "latency_p99_ms": 160,
        "error_rate": 0.07,
        "baseline_error_rate": 0.05,
        "availability": 99.99,
        "cpu_usage": 74,
        "memory_usage": 68,
        "transactions_per_minute": 6800,
        "baseline_transactions_per_minute": 2000,
        "transaction_success_rate": 99.93,
        "transaction_failure_rate": 0.07,
        "affected_customers": 0,
        "customer_impact_score": 0,
        "revenue_impact_estimate": 0,
        "business_criticality": "critical",
        "customer_complaint_rate": 0.0,
        "incident_severity": "none",
        "monitoring_status": "healthy",
        "edge_case_id": "traffic_surge_drift",
        "actual_safe_action": "CONTINUE"
    })

    # Case 3: Missing Telemetry (REL-0998)
    releases.append({
        "release_id": f"REL-0998",
        "organization_name": "Org Alpha",
        "service_name": "UserProfileService",
        "version": "v2.9.4",
        "environment": "production",
        "deployment_time": (base_time - timedelta(minutes=28)).isoformat(),
        "change_type": "bugfix",
        "engineer_or_team": "Identity Platform",
        "phase": "canary_5",
        "bake_duration_minutes": 28,
        "rollback_readiness": {
            "available": True,
            "strategy": "canary_traffic_drain",
            "estimated_mtt_rollback_min": 1,
            "automated_script_validated": True
        },
        "rollback_available": True,
        "latency_ms": None,
        "latency_baseline_ms": 95,
        "latency_p99_ms": None,
        "error_rate": 0.4,
        "baseline_error_rate": 0.35,
        "availability": 99.9,
        "cpu_usage": 35,
        "memory_usage": 48,
        "transactions_per_minute": None,
        "baseline_transactions_per_minute": 1800,
        "transaction_success_rate": None,
        "transaction_failure_rate": None,
        "affected_customers": None,
        "customer_impact_score": None,
        "revenue_impact_estimate": None,
        "business_criticality": "critical",
        "customer_complaint_rate": 0.0,
        "incident_severity": "none",
        "monitoring_status": "outage",
        "edge_case_id": "missing_telemetry",
        "actual_safe_action": "CONTINUE"
    })

    # Case 4: Contradictory Signals (REL-0999)
    releases.append({
        "release_id": f"REL-0999",
        "organization_name": "Org Beta",
        "service_name": "RiskAnalytics",
        "version": "v1.8.0",
        "environment": "production",
        "deployment_time": (base_time - timedelta(minutes=35)).isoformat(),
        "change_type": "feature",
        "engineer_or_team": "Analytics Core",
        "phase": "baking",
        "bake_duration_minutes": 35,
        "rollback_readiness": {
            "available": True,
            "strategy": "automated_blue_green",
            "estimated_mtt_rollback_min": 4,
            "automated_script_validated": True
        },
        "rollback_available": True,
        "latency_ms": 980,
        "latency_baseline_ms": 120,
        "latency_p99_ms": 1850,
        "error_rate": 0.08,
        "baseline_error_rate": 0.08,
        "availability": 100.0,
        "cpu_usage": 62,
        "memory_usage": 58,
        "transactions_per_minute": 3200,
        "baseline_transactions_per_minute": 3200,
        "transaction_success_rate": 99.92,
        "transaction_failure_rate": 0.08,
        "affected_customers": 0,
        "customer_impact_score": 0,
        "revenue_impact_estimate": 0,
        "business_criticality": "medium",
        "customer_complaint_rate": 0.0,
        "incident_severity": "none",
        "monitoring_status": "healthy",
        "edge_case_id": "contradictory_signals",
        "actual_safe_action": "CONTINUE"
    })

    # Case 5: Rollback Blocked (REL-1000)
    releases.append({
        "release_id": f"REL-1000",
        "organization_name": "Org Alpha",
        "service_name": "AccountLedger",
        "version": "v6.0.0",
        "environment": "production",
        "deployment_time": (base_time - timedelta(minutes=18)).isoformat(),
        "change_type": "infrastructure",
        "engineer_or_team": "Database Operations",
        "phase": "full_rollout",
        "bake_duration_minutes": 18,
        "rollback_readiness": {
            "available": False,
            "strategy": "schema_inverse_migration",
            "estimated_mtt_rollback_min": 120,
            "automated_script_validated": False,
            "blockers": [
                "Destructive column migration executed without backward-compatible view",
                "Data loss risk on automatic inverse replay"
            ]
        },
        "rollback_available": False,
        "latency_ms": 480,
        "latency_baseline_ms": 140,
        "latency_p99_ms": 920,
        "error_rate": 6.8,
        "baseline_error_rate": 0.4,
        "availability": 93.2,
        "cpu_usage": 88,
        "memory_usage": 92,
        "transactions_per_minute": 820,
        "baseline_transactions_per_minute": 1100,
        "transaction_success_rate": 93.2,
        "transaction_failure_rate": 6.8,
        "affected_customers": 8400,
        "customer_impact_score": 88,
        "revenue_impact_estimate": 75000,
        "business_criticality": "critical",
        "customer_complaint_rate": 3.8,
        "incident_severity": "sev1",
        "monitoring_status": "degraded",
        "edge_case_id": "rollback_unavailable",
        "actual_safe_action": "ROLLBACK"
    })

    # 2. General 995 Synthetic Enterprise Releases
    for i in range(1, count - 4):
        # Distribution: 45% Alpha, 40% Beta, 15% Partner Gamma
        org_rand = random.random()
        if org_rand > 0.85:
            org = 'External Partner Gamma'
        elif org_rand > 0.45:
            org = 'Org Beta'
        else:
            org = 'Org Alpha'

        service = random.choice(org_services[org])
        is_risky = random.random() < 0.22
        is_degraded = is_risky and (random.random() < 0.6)

        baseline_latency = random.randint(40, 280)
        latency = round(baseline_latency * random.uniform(1.25, 3.2)) if is_risky else round(baseline_latency * random.uniform(0.92, 1.08))

        baseline_error = round(random.uniform(0.05, 0.6), 2)
        error_rate = round(random.uniform(baseline_error + 1.2, baseline_error + 8.5), 2) if is_risky else round(random.uniform(max(0.01, baseline_error * 0.8), baseline_error * 1.15), 2)

        baseline_tpm = random.randint(400, 3000) if org == 'External Partner Gamma' else random.randint(1500, 12000)
        tpm = round(baseline_tpm * random.uniform(0.4, 0.85)) if (is_risky and is_degraded) else round(baseline_tpm * random.uniform(0.95, 1.05))

        business_crit = 'medium' if org == 'External Partner Gamma' and random.random() < 0.3 else ('low' if org == 'External Partner Gamma' else random.choice(criticalities))
        impact_score = random.randint(25, 95) if is_risky else random.randint(0, 8)
        affected = random.randint(150, 45000) if is_risky else random.randint(0, 10)
        complaint_rate = round(random.uniform(0.5, 4.2), 2) if is_risky else 0.0
        rev_impact = random.randint(2000, 60000) if is_risky else 0

        rollback_avail = random.random() > 0.04
        chosen_strategy = random.choice(strategies)
        phase = random.choice(phases)
        deploy_time = base_time - timedelta(minutes=random.randint(5, 43200))

        releases.append({
            "release_id": f"REL-{i:04d}",
            "organization_name": org,
            "service_name": service,
            "version": f"v{random.randint(1, 8)}.{random.randint(0, 12)}.{random.randint(0, 15)}",
            "environment": "production",
            "deployment_time": deploy_time.isoformat(),
            "change_type": random.choice(change_types),
            "engineer_or_team": f"{org.replace('External ', '')} Platform Team",
            "phase": phase,
            "bake_duration_minutes": random.randint(10, 180),
            "rollback_readiness": {
                "available": rollback_avail,
                "strategy": chosen_strategy,
                "estimated_mtt_rollback_min": random.randint(2, 15),
                "automated_script_validated": rollback_avail
            },
            "rollback_available": rollback_avail,
            "latency_ms": latency,
            "latency_baseline_ms": baseline_latency,
            "latency_p99_ms": round(latency * random.uniform(1.4, 2.1)),
            "error_rate": error_rate,
            "baseline_error_rate": baseline_error,
            "availability": round(random.uniform(94.5, 99.2), 2) if is_risky else round(random.uniform(99.92, 100.0), 2),
            "cpu_usage": random.randint(25, 95 if is_risky else 65),
            "memory_usage": random.randint(35, 90 if is_risky else 70),
            "transactions_per_minute": tpm,
            "baseline_transactions_per_minute": baseline_tpm,
            "transaction_success_rate": max(0.0, round(100.0 - error_rate, 2)),
            "transaction_failure_rate": error_rate,
            "affected_customers": affected,
            "customer_impact_score": impact_score,
            "revenue_impact_estimate": rev_impact,
            "business_criticality": business_crit,
            "customer_complaint_rate": complaint_rate,
            "incident_severity": ("sev1" if impact_score > 65 else ("sev2" if impact_score > 35 else "sev3")) if is_risky else "none",
            "monitoring_status": "degraded" if is_risky else "healthy",
            "actual_safe_action": "ROLLBACK" if (is_risky and (impact_score >= 30 or error_rate > 2.5)) else "CONTINUE"
        })

    # Sort newest first
    releases.sort(key=lambda r: r['deployment_time'], reverse=True)
    return releases

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic enterprise releases dataset")
    parser.add_argument("--count", type=int, default=1000, help="Number of releases (default: 1000)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility (default: 42)")
    parser.add_argument("--output", type=str, default="", help="Output JSON path (optional)")
    args = parser.parse_args()

    data = generate_dataset(count=args.count, seed=args.seed)
    
    if args.output:
        with open(args.output, "w") as f:
            json.dump(data, f, indent=2)
        print(f"Successfully generated {len(data)} releases to {args.output} (seed={args.seed})")
    else:
        # Print summary
        org_counts = {}
        for r in data:
            org = r['organization_name']
            org_counts[org] = org_counts.get(org, 0) + 1
        
        rollback_count = sum(1 for r in data if r['actual_safe_action'] == 'ROLLBACK')
        print(f"Generated {len(data)} releases with fixed seed={args.seed}:")
        for org, c in org_counts.items():
            print(f"  - {org}: {c} releases")
        print(f"  - Ground Truth Rollback Scenarios: {rollback_count} ({(rollback_count/len(data))*100:.1f}%)")
        print(f"  - Ground Truth Continue Scenarios: {len(data) - rollback_count} ({((len(data) - rollback_count)/len(data))*100:.1f}%)")

if __name__ == "__main__":
    main()
