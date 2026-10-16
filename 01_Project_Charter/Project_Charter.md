# Project Charter — AI Customer Support Automation Platform

## Business problem and opportunity

Northstar Retail's support operation handles a large repeat-question workload while customers need dependable responses and agent help for complex cases. A governed assistant can retrieve approved internal content, present source references, create/track tickets, and escalate uncertain questions. This simulation demonstrates the delivery controls required to build that capability safely.

## Business case and proposed benefits

Proposed targets (not achieved results): reduce repetitive agent workload by 25% within 90 days of launch; reduce median first response time by 30%; achieve at least 90% grounded answers and no more than 5% unsupported answers on the agreed evaluation set; keep human escalation available and target 15–35% while prioritizing safety; reach at least 95% UAT pass rate with zero open critical defects; reduce cost per resolved repetitive request by 15% after a measured baseline is established.

## Objectives and success criteria

Deliver approved-source RAG, citations, escalation, ticket workflow, admin controls and monitoring by 2026-07-03; stay within ₹2,500,000 approved funding; complete security/privacy reviews; obtain business UAT sign-off; train at least 90% of the pilot agent cohort; establish a post-launch 30/60/90-day quality and operational-cost review. Targets are proposed and require baseline validation.

## Scope and exclusions

In scope: discovery, UX, access control, document ingestion, retrieval and guardrails, customer chat, ticketing, admin analytics, integration, QA/security, UAT, rollout/training, hypercare. Excluded: autonomous high-impact customer decisions, unapproved data sources, replacing the support CRM, unsupported languages, and production commitments without operational approvals.

## Deliverables

Approved charter/requirements; architecture and access model; approved source corpus and ingestion; evaluated RAG and fallback; customer chat with citations; ticket queue and assignment; admin/quality dashboard; integrated tested product; UAT evidence; deployment/training runbook; monitoring and closure report.

## Assumptions, constraints and baseline

Six-month baseline 2026-01-05–2026-07-03, 14-day Scrum sprints, 10-person team, ₹2,500,000 budget, INR, weekly delivery review and monthly steering. All example data is synthetic. Initial dashboard view covers 6 sprints; full lifecycle contains 13 periods. Security and source-owner approval are release dependencies.

## Governance and authority

Executive Sponsor approves charter, budget, material scope changes and go/no-go. Product Manager owns product acceptance and backlog. Project Manager owns integrated plan, forecast, RAID, cadence and escalation. Engineering, AI and QA leads own technical evidence. Data Governance and Security approve content/access gates. Steering committee meets monthly; delivery review weekly; Scrum events every sprint.

## Roles

See team.csv, stakeholders.csv and raci.csv. Every major deliverable has a single accountable role in the RACI source. Project Manager is the simulated Portfolio Project Manager.

## Key risks

Unsupported answers; unauthorized retrieval; weak retrieval; integration delay; capacity peak in QA; source approval delay; cost overrun; adoption; UAT failure; provider availability. See the separate risk register and issue log.

## Change control

Log each request with rationale, scope/value, schedule, cost, quality, security/privacy and resource impact. Product Manager sizes and prioritizes; Project Manager prepares integrated impact; Security/Data Governance review relevant controls. Sponsor/steering approves changes affecting baseline, budget, release scope or risk appetite. Update baseline, backlog, decision log and stakeholder communication after approval.

## Acceptance and closure

Acceptance requires approved-source traceability, documented escalation, zero unresolved critical security/quality defects, agreed UAT exit, operational support and rollback readiness, training completion, and sponsor sign-off. Close with final financial reconciliation, residual-risk ownership, lessons learned, and 30/60/90-day outcome measurement plan.
