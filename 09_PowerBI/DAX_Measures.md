# Copy-ready DAX measures

Import the supplied CSVs and apply the table/column names shown. Configure `ProjectConfig` from `project_config.json`, expanded to a single row. `Tasks[plannedValueINR]` and `Tasks[earnedValueINR]` are generated as of the configurable reporting date. All measures are examples over simulated data.

```DAX
Budget Baseline = MAX(ProjectConfig[budgetBaseline])
Actual Cost = SUM(Costs[actualCostINR])
Budget Variance = [Budget Baseline] - [Actual Cost]
Budget Utilization % = DIVIDE([Actual Cost], [Budget Baseline], 0)
Remaining Budget = [Budget Baseline] - [Actual Cost]
Planned Value = SUM(Tasks[plannedValueINR])
Earned Value = SUM(Tasks[earnedValueINR])
Schedule Performance Index = DIVIDE([Earned Value], [Planned Value])
Cost Performance Index = DIVIDE([Earned Value], [Actual Cost])
Schedule Variance = [Earned Value] - [Planned Value]
Cost Variance = [Earned Value] - [Actual Cost]
Average Sprint Velocity = AVERAGEX(VALUES(Sprints[sprintId]), CALCULATE(SUM(Stories[storyPoints]), Stories[status] = "Done"))
Sprint Completion % = DIVIDE(CALCULATE(SUM(Stories[storyPoints]), Stories[status] = "Done"), SUM(Stories[storyPoints]), 0)
Milestone Completion % = DIVIDE(CALCULATE(COUNTROWS(Milestones), Milestones[status] = "Complete"), COUNTROWS(Milestones), 0)
Open Risk Count = CALCULATE(COUNTROWS(Risks), Risks[status] <> "Closed")
Critical Risk Count = CALCULATE(COUNTROWS(Risks), Risks[severity] = "Critical", Risks[status] <> "Closed")
Overdue Task Count = CALCULATE(COUNTROWS(Tasks), Tasks[forecastEnd] < MAX(ProjectConfig[reportingDate]), Tasks[completionPct] < 100)
Resource Utilization % = DIVIDE(SUM(Team[allocatedHoursPerWeek]), SUM(Team[availableHoursPerWeek]), 0)
UAT Pass Rate = DIVIDE(SUM(Quality[uatPassed]), SUM(Quality[uatExecuted]), 0)
AI Response Accuracy = DIVIDE(SUM(Quality[accurateAnswerCount]), SUM(Quality[answeredCount]), 0)
AI Grounded Answer Rate = DIVIDE(SUM(Quality[groundedCount]), SUM(Quality[answeredCount]), 0)
AI Hallucination Rate = DIVIDE(SUM(Quality[unsupportedCount]), SUM(Quality[answeredCount]), 0)
Human Escalation Rate = DIVIDE(SUM(Quality[humanEscalations]), SUM(Quality[sampleSize]), 0)
Automated Resolution Rate = DIVIDE(SUM(Quality[automatedResolutions]), SUM(Quality[sampleSize]), 0)
```

The PV/EV fields are fixed snapshots at reportingDate, so use them for the configured snapshot unless a time-phased earned-value fact is added. CPI/SPI are undefined when their denominator is zero; `DIVIDE` returns blank. CPI/SPI above 1 indicates favorable cost/schedule performance; below 1 indicates unfavorable. CV/SV positive indicate favorable earned value relative to actual/planned. `Budget Variance` is a separate approved-baseline comparison (positive means under budget). Avoid labeling it CV.
