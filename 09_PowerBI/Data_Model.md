# Power BI Data Model

## Tables and grain

Load `data/project_config.json` as a one-row ProjectConfig table (Power Query: JSON record → table; expand key fields). Load every CSV as a separate table. Facts: `Costs` (one period/category), `Tasks` (one work package with baseline value and status), `Stories` (one story), `Burndown` (one sprint/day), `ResourceAllocations` (one sprint/resource), `ProjectStatusSnapshots` (one reporting date), `Risks`, `Issues`, and `Quality` (one observation date). Dimensions: `Date`, `Team` (from team.csv), `Sprints`, `Epics`, `Stakeholders`, and `BudgetCategories` (from config).

## Relationships

- Date[Date] 1 → * Tasks[baselineStart] (inactive), Tasks[baselineEnd] (inactive), Costs[periodStart] (active), Quality[observationDate] (active), Milestones[baselineDate] (inactive), Milestones[forecastDate] (inactive). Use explicit USERELATIONSHIP for alternate task dates.
- Team[name] 1 → * Tasks[owner], Risks[owner], Issues[owner].
- Team[resourceId] 1 → * ResourceAllocations[resourceId].
- Sprints[sprintId] 1 → * Stories[sprintId], Burndown[sprintId], Tasks[sprintId].
- Stories[storyId] 1 → * Tasks[storyId] for the linked work packages (blank storyId remains unassigned).
- Sprints[sprintId] 1 → * ResourceAllocations[sprintId].
- Epics[epicId] 1 → * Stories[epicId].
- BudgetCategories[category] 1 → * Costs[category].
- Keep stakeholder and RACI relationships separate unless a normalized role dimension is added.
- Filter direction is single from dimensions to facts. Avoid bidirectional relationships and many-to-many joins.

Create a contiguous date dimension from project start to end and mark it as the date table. Create Costs[periodStart] from `period` as first of month. Currency fields are whole INR; format as `₹ #,##0;[Red](₹ #,##0)` and percentages as `0.0%`. Use a disconnected configuration table only where measures explicitly read the one-row config values.

## Refresh

After config changes run `python scripts/generate_data.py`; refresh the folder or replace the source CSV/JSON files. Re-run validation before refresh. No gateway or cloud refresh is included.
