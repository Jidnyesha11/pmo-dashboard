# Excel Workbook Build Guide

The project provides clean CSV sources rather than a fabricated workbook. Create a workbook named `AI_Support_PMO.xlsx` and import each matching CSV as a separate sheet with **Data → From Text/CSV**. Select UTF-8 encoding. Promote headers, type dates as Date, amounts/hours/points as whole numbers, and IDs/statuses as text. Format each imported range as an Excel Table and use these names: `Tasks`, `Team`, `ResourceAllocations`, `Stories`, `Sprints`, `Risks`, `Issues`, `Milestones`, `Costs`, `BudgetCategories`, `Quality`, and `ProjectStatusSnapshots`.

Keep the generated raw sheets unchanged. Add a `KPI Calculations` sheet with these structured-reference formulas (update table names if Excel changes them):

| Measure                      | Formula                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------- |
| Budget baseline              | `=SUM(BudgetCategories[budgetBaselineINR])`                                      |
| Actual cost                  | `=SUM(Costs[actualCostINR])`                                                     |
| Budget variance              | `=SUM(BudgetCategories[budgetBaselineINR])-SUM(Costs[actualCostINR])`            |
| Budget utilization           | `=IFERROR(SUM(Costs[actualCostINR])/SUM(BudgetCategories[budgetBaselineINR]),0)` |
| Remaining budget             | `=SUM(BudgetCategories[budgetBaselineINR])-SUM(Costs[actualCostINR])`            |
| Planned resource utilization | `=IFERROR(SUM(Team[allocatedHoursPerWeek])/SUM(Team[availableHoursPerWeek]),0)`  |
| Resource row utilization     | `=IFERROR([@allocatedHoursPerWeek]/[@availableHoursPerWeek],0)`                  |
| Task forecast slip days      | `=[@forecastEnd]-[@baselineEnd]`                                                 |
| Completed story points       | `=SUMIFS(Stories[storyPoints],Stories[status],"Done")`                           |
| Open risks                   | `=COUNTIFS(Risks[status],"<>Closed")`                                            |

Format budget measures as INR using the configured reporting currency; utilization as percentage. Apply conditional formatting to negative budget variance, utilization above 100%, overdue tasks, and critical risk scores. Save a copy of the source CSVs alongside the workbook so refresh remains reproducible. Formulas are for review, not accounting use; actuals and contingency treatment follow `Financial_Assumptions.md`.
