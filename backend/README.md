ChargebackGuard BackendOverview
The backend of ChargebackGuard will handle the server-side logic and data management for the merchant dispute portal.
It will support dispute management, evidence handling, response deadlines, reminders, and automatic escalation.
Core Responsibilities
Manage merchant and user data
Manage chargeback disputes
Track dispute status and deadlines
Handle evidence records
Support reminder and escalation workflows
Enforce authorization and access control
Manage communication with the database
Technology Stack
Next.js
PostgreSQL
Prisma
Planned Structurebackend/
├── controllers/
├── routes/
├── services/
├── middleware/
├── utils/
├── prisma/
└── README.md
Core EntitiesUser
Stores merchant and administrator information and roles.
Dispute
Stores chargeback information, transaction details, status, merchant ownership, and the 7-day response deadline.
Evidence
Stores information about evidence submitted against a dispute and its immutable status after submission.
Dispute WorkflowDispute Created
      ↓
Action Required
      ↓
Evidence Submitted
      ↓
Under Review
      ↓
Resolved
If the merchant does not respond within 7 days:
Action Required
      ↓
7-Day Deadline
      ↓
Escalated
Current Status
Sprint 1 — Backend planning and initial project documentation.