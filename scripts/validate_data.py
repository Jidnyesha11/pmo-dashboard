import csv
import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
d = json.loads((DATA / "project_data.json").read_text(encoding="utf-8"))
cfg = d["config"]
errors = []
def check(ok, message):
    if not ok: errors.append(message)

check(sum(cfg["budgetCategories"].values()) == cfg["budgetBaseline"] == 2_500_000, "Budget categories must sum to ₹25,00,000.")
task_ids = {x["taskId"] for x in d["tasks"]}
dep_rows = list(csv.DictReader((DATA / "dependencies.csv").open(encoding="utf-8-sig")))
dep_types = {(x["predecessorTaskId"], x["successorTaskId"]): x["type"] for x in dep_rows}
team_names = {x["name"] for x in d["team"]}
sprint_ids = {x["sprintId"] for x in d["sprints"]}
epic_ids = {x["epicId"] for x in d["epics"]}
check(len(task_ids) == len(d["tasks"]), "Task IDs must be unique.")
for t in d["tasks"]:
    check(t["owner"] in team_names, f"Unknown task owner: {t['taskId']} -> {t['owner']}")
    check(not t.get("storyId") or t["storyId"] in {x["storyId"] for x in d["stories"]}, f"Unknown linked story on {t['taskId']}")
    check(date.fromisoformat(t["baselineStart"]) <= date.fromisoformat(t["baselineEnd"]), f"Invalid task dates: {t['taskId']}")
    for dep in filter(None, t["dependencyIds"].split(";")):
        check(dep in task_ids, f"Unknown dependency: {t['taskId']} -> {dep}")
        if dep in task_ids:
            pred = next(x for x in d["tasks"] if x["taskId"] == dep)
            link_type = dep_types.get((dep, t["taskId"]))
            check(link_type in {"Finish-to-Start", "Start-to-Start"}, f"Missing/invalid dependency type: {dep} -> {t['taskId']}")
            if link_type == "Finish-to-Start":
                check(date.fromisoformat(pred["baselineEnd"]) < date.fromisoformat(t["baselineStart"]), f"Finish-to-start ordering violated: {dep} -> {t['taskId']}")
            elif link_type == "Start-to-Start":
                check(date.fromisoformat(pred["baselineStart"]) <= date.fromisoformat(t["baselineStart"]), f"Start-to-start ordering violated: {dep} -> {t['taskId']}")
    check(date.fromisoformat(cfg["startDate"]) <= date.fromisoformat(t["baselineStart"]) <= date.fromisoformat(t["baselineEnd"]) <= date.fromisoformat(cfg["endDate"]), f"Task falls outside project baseline: {t['taskId']}")
# Acyclic dependency graph.
graph = {task_id: [] for task_id in task_ids}
for dep in dep_rows:
    if dep["predecessorTaskId"] in graph and dep["successorTaskId"] in graph:
        graph[dep["predecessorTaskId"]].append(dep["successorTaskId"])
visiting, visited = set(), set()
def visit(node):
    if node in visiting: return False
    if node in visited: return True
    visiting.add(node)
    ok = all(visit(child) for child in graph[node])
    visiting.remove(node); visited.add(node)
    return ok
check(all(visit(node) for node in graph), "Task dependency graph contains a cycle.")
for s in d["stories"]:
    check(s["epicId"] in epic_ids, f"Unknown epic on {s['storyId']}")
    check(s["sprintId"] in sprint_ids, f"Unknown sprint on {s['storyId']}")
    for dep in filter(None, s["dependencyIds"].split(";")):
        check(dep in {x["storyId"] for x in d["stories"]}, f"Unknown story dependency: {s['storyId']} -> {dep}")
check(len({r["riskId"] for r in d["risks"]}) == len(d["risks"]), "Risk IDs must be unique.")
check(len({i["issueId"] for i in d["issues"]}) == len(d["issues"]), "Issue IDs must be unique.")
check(len({x["stakeholderId"] for x in csv.DictReader((DATA / "stakeholders.csv").open(encoding="utf-8-sig"))}) == 9, "Stakeholder IDs must be unique and all nine stakeholders present.")
for row in csv.DictReader((DATA / "raci.csv").open(encoding="utf-8-sig")):
    check(bool(row["Accountable"]) and ";" not in row["Accountable"], f"RACI deliverable must have exactly one accountable role: {row['deliverable']}")
for r in d["risks"]:
    score = r["probability"] * r["impact"]
    thresholds = cfg["riskThresholds"]
    severity = "Critical" if score > thresholds["highMax"] else "High" if score > thresholds["mediumMax"] else "Medium" if score > thresholds["lowMax"] else "Low"
    check(r["score"] == score and r["severity"] == severity, f"Risk score/severity mismatch: {r['riskId']}")
    check(date.fromisoformat(r["reviewDate"]) <= date.fromisoformat(r["dueDate"]), f"Risk review is after mitigation due date: {r['riskId']}")
check(len(d["team"]) == cfg["teamSize"] == 10, "Roster must contain the configured 10 team members.")
check(all(r["allocatedHoursPerWeek"] >= 0 and r["availableHoursPerWeek"] > 0 for r in d["team"]), "Invalid resource allocation.")
check(sum(x["actualCostINR"] for x in d["costs"]) <= cfg["budgetBaseline"], "Actual cost exceeds approved budget.")
delivery_baseline = cfg["budgetBaseline"] - cfg["budgetCategories"].get("Contingency", 0)
check(abs(sum(x["plannedCostINR"] for x in d["costs"]) - delivery_baseline) <= len(d["costs"]), "Monthly planned costs do not reconcile to the non-contingency delivery baseline.")
check(all(x["actualCostINR"] <= cfg["budgetBaseline"] for x in d["costs"]), "Single cost row exceeds total approved budget.")
check(all(x["answeredCount"] <= x["sampleSize"] and x["groundedCount"] <= x["answeredCount"] and x["accurateAnswerCount"] <= x["answeredCount"] for x in d["quality"]), "Quality denominator consistency failed.")
check(all(x["uatPassed"] <= x["uatExecuted"] for x in d["quality"]), "UAT numerator cannot exceed denominator.")
check(date.fromisoformat(cfg["startDate"]) < date.fromisoformat(cfg["endDate"]), "Project start must precede end.")
check(len(d["tasks"]) >= 25 and len(d["stories"]) >= 20 and len(d["risks"]) >= 10 and len(d["issues"]) >= 8, "Minimum demo dataset coverage is missing.")
check(all(x["resourceId"] in {r["resourceId"] for r in d["team"]} and x["sprintId"] in sprint_ids for x in d["resourceAllocations"]), "Sprint resource allocation points to an unknown resource or sprint.")
check(all(x["category"] in cfg["budgetCategories"] for x in d["costs"]), "Cost record has an unknown budget category.")
check(bool(d["statusSnapshots"]) and d["statusSnapshots"][-1]["snapshotDate"] == cfg["reportingDate"], "Status snapshot series must end at the configured reporting date.")

if errors:
    print("DATA VALIDATION FAILED")
    for error in errors: print(f"- {error}")
    raise SystemExit(1)
print(f"DATA VALIDATION PASSED: {len(d['tasks'])} tasks, {len(d['stories'])} stories, {len(d['risks'])} risks, {len(d['issues'])} issues.")
