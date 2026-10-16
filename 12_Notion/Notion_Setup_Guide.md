# Notion Workspace Setup Guide

Create a home page titled **AI Support Platform PMO** with links to Tasks, Risks, Decisions, Stakeholders, Meetings, Milestones, and Weekly Status databases. Import the matching CSVs from `data/` as full-page databases. Add relations: Tasks ↔ Milestones (optional), Tasks ↔ Team via owner, Risks ↔ Team via owner, Meetings ↔ Decisions, Stories ↔ Epics and Sprints. Add rollups for milestone task completion and open risks by owner. Use formula fields for risk score (`Probability * Impact`) and variance (`Budget Baseline - Actual Cost`) after properties are typed as numbers.

Create views: timeline grouped by workstream; board by status; risk matrix grouped by severity; decisions by date; milestones calendar; weekly status filtered to the current reporting period. Use templates in the adjacent files for recurring weekly reports and meeting notes. Notion is not connected or populated automatically by this project.
