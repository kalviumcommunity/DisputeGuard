ChargebackGuard FrontendOverview
The ChargebackGuard frontend will provide the merchant-facing interface for managing chargeback disputes.
The application will allow merchants to view their disputes, track response deadlines, submit evidence, monitor dispute status, and identify cases requiring immediate attention.
Core Features
Merchant dashboard
Dispute listing
Dispute details
7-day response deadline tracking
Evidence submission interface
Dispute status tracking
Reminder notifications
Escalation status
Merchant account interface
Technology Stack
Next.js
TypeScript
Tailwind CSS
Planned Structurefrontend/
├── app/
│   ├── dashboard/
│   ├── disputes/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── dashboard/
│   ├── disputes/
│   ├── layout/
│   └── ui/
│
├── public/
└── README.md
Main ScreensDashboard
Provides an overview of active, pending, and escalated disputes.
Disputes
Displays the merchant's chargeback disputes and their current status.
Dispute Details
Displays transaction information, chargeback details, response deadline, and submitted evidence.
Evidence Submission
Provides the interface for merchants to upload and submit evidence against a dispute.
Development Guidelines
Use reusable components where possible.
Keep interactive functionality inside appropriate Client Components.
Keep server-side data handling separate from client-side UI.
Follow the team's Git branching and pull request workflow.
Current Status
Sprint 1 — Frontend planning and initial project documentation.