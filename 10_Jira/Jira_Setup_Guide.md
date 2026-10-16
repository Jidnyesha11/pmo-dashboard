# Jira Scrum Setup Guide

1. Create a Scrum software project named **AI Support Platform** with project key `AISP`; use the project template workflow To Do → In Progress → In Review → Done, with Blocked as a flagged condition.
2. Add issue types Epic, Story, Task, Bug, and Sub-task. Create the seven epics in `data/epics.csv` (or `Epic_Story_Mapping.csv`).
3. Configure fields for Story Points, Acceptance Criteria, Business Value, Sprint, Workstream, Priority, Owner, Baseline Start/End, and simulated-data note. Use Jira's built-in Epic Link/Parent field and Sprint field.
4. Import `Jira_Import_Data.csv` through **Settings → System → External System Import → CSV** (menu names vary by Jira edition). Map `Issue ID` to external reference text; map summary, issue type, epic name/link, description, priority, story points, sprint and acceptance criteria. Import epics first if the importer cannot resolve parent links in one pass.
5. Confirm each story links to a valid epic, then create the 13 two-week sprint periods from `data/sprints.csv`. Assign stories using `sprintId`; leave the later sprints unstarted.
6. Add task dependency links from `data/dependencies.csv` using blocks/is blocked by. Review project baseline dates before creating Jira due dates.
7. Start a sprint only after backlog refinement. Record actual carryover rather than rewriting completed scope. At review capture demo feedback; at retrospective record action, owner and due date.
8. Build board quick filters for workstream and owner, plus a dashboard for velocity, cumulative flow, overdue tasks, and open blockers.

Import instructions are manual and edition-dependent. This repository does not connect to a Jira instance or claim a live project exists.
