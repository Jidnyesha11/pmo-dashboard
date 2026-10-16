# Power BI Setup Guide

1. Generate and validate the source files with `python scripts/generate_data.py` and `python scripts/validate_data.py`.
2. In Power BI Desktop choose **Get Data → Text/CSV**, import all files from `data/`; import `project_config.json` via **Get Data → JSON** and expand the record.
3. Rename imported queries to the table names in `Data_Model.md`. Set IDs and statuses to Text, date columns to Date, numeric costs to Whole Number, and ratios to Decimal Number.
4. Add `periodStart` in Costs from `period` (first day of month). Add a Date table: `Date = CALENDAR(MIN(Costs[periodStart]), MAX(Costs[periodStart]))`; add Year, Month Number, Month Label, and Year-Month; mark as date table.
5. Create the single-direction relationships documented in `Data_Model.md`. Resolve ambiguous task date relationships by leaving alternative dates inactive.
6. Add measures from `DAX_Measures.md`. Set INR and percentage formats. Use conditional formatting: red for negative Budget Variance, amber for forecast slips, and red for risk score ≥16.
7. Build pages from `Dashboard_Page_Specification.md`. Add project date, workstream, sprint, owner, and risk category slicers where appropriate. Add a task ID drill-through page with task dates, dependencies, owner and completion.
8. Refresh by regenerating CSVs and choosing **Refresh**. Validate the input data before distributing a report.

The supplied materials do not include a `.pbix`; the model, measures, source files, and page design are provided for reproducible assembly in Power BI Desktop.
