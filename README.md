# Explainable Release Rollback Adviser

A functional prototype of an advisory system designed for regulated enterprises. This application quantifies production release risks based on technical and business signals, providing transparent, explainable recommendations on whether to continue, escalate for human review, or rollback a deployment.

## Key Features

- **Explainable Recommendations:** Outputs clear recommendations (CONTINUE, HUMAN REVIEW REQUIRED, ROLLBACK RECOMMENDED) backed by transparent rule triggers and supporting evidence.
- **Rule-Based Risk Engine:** Deterministic scoring (0-100) based on latency degradation, error rates, transaction volume drops, customer impact, and business criticality.
- **Human-in-the-Loop Safeguards:** Strictly an advisory system. Requires manual confirmation for rollbacks and mandatory reasoning for overriding critical warnings.
- **Role-Based Access Control:** Simulates organizational roles (Viewer, Engineer, Release Manager, Compliance Auditor, External Partner) with distinct permissions and visibility boundaries.
- **Audit Logging:** Immutable decision history tracking every human action and override for compliance auditing.
- **Synthetic Data Generation:** Generates a realistic dataset of 1000+ releases, including specialized edge cases (missing telemetry, contradictory signals).
- **Experimentation Engine:** Compares the explainable adviser's accuracy and false-positive rates against a baseline threshold model.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Bento Grid UI pattern)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Data Persistence:** In-memory Singleton Store (simulating a production database for the prototype)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
.
├── app/
│   ├── audit/           # Decision audit history page
│   ├── docs/            # Technical documentation
│   ├── experiments/     # Performance comparison dashboard
│   ├── failure-cases/   # Demonstrations of system resilience
│   ├── releases/        # Release list and individual analysis pages
│   └── page.tsx         # Main overview dashboard
├── components/
│   ├── AppContext.tsx   # Global state for role and organization simulation
│   └── Navigation.tsx   # Top navigation bar
├── lib/
│   ├── data/            # Synthetic data generator and in-memory store
│   ├── engine/          # Core logic: risk scoring, baseline, and recommendations
│   └── models.ts        # TypeScript interfaces and types
└── README.md
```

## Security & Misuse Resistance

- Missing telemetry degrades confidence rather than defaulting to zero risk.
- The system prevents auto-rollbacks entirely.
- External partners are sandboxed to view only their organization's data.
- Conflicting signals (e.g., high technical degradation but zero business impact) automatically trigger human escalation rather than blind automated assumptions.

## UI Design

The application utilizes a dense, data-rich "Bento Grid" aesthetic suitable for complex enterprise monitoring, maximizing information density while maintaining clear visual hierarchy for critical alerts.
