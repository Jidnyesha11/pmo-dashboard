# AI Project Management & PMO Dashboard

An end-to-end portfolio simulation of planning and governing an AI customer-support automation delivery. It combines a responsive Next.js dashboard, deterministic relational datasets, CSV import sources, project controls, and implementation guides for Power BI, Jira, ClickUp, and Notion.

> **Simulation notice:** Northstar Retail, project records, people, hours, costs, quality results, and decisions are fictional and generated for portfolio demonstration. The AI quality numbers are synthetic evaluation examples, not production results or model benchmarks.

## Case study

**Problem.** Support teams handle repetitive questions while customers need trustworthy answers and a clear path to a human agent. A PMO needs a way to govern the product delivery, approved knowledge, security, costs, capacity, risks, and evidence of quality together.

**Approach.** Plan a six-month Scrum delivery with 13 two-week sprints, a configurable six-sprint dashboard window, 35 WBS tasks, 21 stories, cross-functional gates, and monthly cost periods. Keep project assumptions centralized in `data/project_config.json`; a deterministic generator creates JSON and CSV source tables from the same assumptions. The application derives KPIs from those shared records.

**Governance decisions.** Use approved documents only; require citations and a human fallback; make source traceability an acceptance gate; add accessibility to MVP exit criteria. Track future uncertain events in the risk register and occurred events in a separate issue log. Forecast costs exclude unspent contingency.

**Lessons represented.** Retrieval quality and source approval are upstream release dependencies; QA demand peaks before UAT; integration contracts should be confirmed before integration sprint work; delivery progress and AI quality need explicit denominators and evidence.

## Features

- Executive, timeline, risk/issue, financial, resource, agile, and AI quality views.
- KPI cards and chart summaries derived from shared data; INR formatting.
- Workstream/search filters, schedule sorting, task detail drill-down, and JSON snapshot export.
- Mobile responsive navigation and layouts; simulated data notice on the dashboard.
- Deterministic datasets, a data validator, Power BI DAX, and CSV-based tool imports.

## Architecture and data flow

```text
data/project_config.json + scripts/generate_data.py
             ├── data/project_data.json ── Next.js dashboard calculations and views
             └── data/*.csv ── Excel / Power BI / Jira / ClickUp source imports
```

The app uses Next.js App Router, TypeScript, Recharts, and Lucide icons. No API key, paid service, or external integration is required for local use. `project_data.json` is the app's normalized read model; CSV tables are available for analysis and imports. Re-run the generator after changing the config.

## Run locally

Requirements: Node.js 20+ and Python 3.10+.

```bash
npm install
npm run data:generate
npm run data:validate
npm run dev
```

Open the local URL printed by Next.js. Production commands: `npm run build` and `npm start`. `npm run lint` runs the strict TypeScript compiler check.

## Data sources

| Source                                                    | Purpose                                                                             |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `project_config.json`                                     | Dates, budget, reporting currency, sprint length/window, assumptions and thresholds |
| `tasks.csv`, `dependencies.csv`, `milestones.csv`         | WBS, schedule, dependency and milestone facts                                       |
| `team.csv`, `raci.csv`, `stakeholders.csv`                | Roster, capacity, accountability and engagement                                     |
| `epics.csv`, `stories.csv`, `sprints.csv`, `burndown.csv` | Agile planning and sprint observation sources                                       |
| `risks.csv`, `issues.csv`, `decisions.csv`                | Governance registers and decisions                                                  |
| `costs.csv`                                               | Planned and actual costs by month and category                                      |
| `quality.csv`                                             | Synthetic evaluation observations with numerator and denominator columns            |

The CSVs are Excel-compatible sources. No fake `.xlsx` or `.pbix` is included. Use Excel's **Data → From Text/CSV** or Power BI's **Get Data → Text/CSV**. Follow [Excel_Workbook_Build_Guide.md](07_Finance/Excel_Workbook_Build_Guide.md) to create formula-driven workbook sheets.

## KPI definitions

The application uses average task completion percentage for overall lifecycle progress; budget utilization is cumulative actual divided by approved baseline; budget variance is baseline minus actual, with positive meaning under budget. Planned utilization is allocated hours divided by available hours. Story velocity sums points on stories marked Done. AI percentage denominators are displayed on the quality page and in `KPI_Dictionary.md`.

## Tool guides

- Power BI: `09_PowerBI/Power_BI_Setup_Guide.md`, `Data_Model.md`, `DAX_Measures.md`, and `Dashboard_Page_Specification.md`.
- Jira: `10_Jira/Jira_Setup_Guide.md`, `Jira_Import_Data.csv`, and `Sprint_Setup.md`.
- ClickUp: `11_ClickUp/ClickUp_Setup_Guide.md` and `ClickUp_Task_Import.csv`.
- Notion: `12_Notion/Notion_Setup_Guide.md` and workspace/template content.

## Validation and limitations

`npm run data:validate` checks IDs, task dependencies and order, story links, risk scoring, roster size, cost reconciliation, date ranges, and dataset minimums. `npm run lint` checks TypeScript. Build using `npm run build`. Values are deterministic and intentionally illustrative. The data model is a static local read model; there is no live Jira, CRM, ticket, cloud, or model-provider connection. The app provides basic drill-down and filtering but not an authenticated multi-user PMIS or editable data-entry workflow.

## Portfolio next steps

1. Replace the fictional baseline with an anonymized case and document evidence sources.
2. Add automated browser accessibility checks and screenshot captures for desktop/mobile.
3. Add a small API and database only if the portfolio needs editable multi-user planning.
4. Validate each proposed AI measure with a versioned evaluation protocol before claiming a measured outcome.

See `SIMULATED_DATA_NOTICE.md` and `CHANGELOG.md` for full interpretation and revision notes.
