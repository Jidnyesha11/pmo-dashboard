from __future__ import annotations

import csv
import json
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
START = date(2026, 1, 5)
END = date(2026, 7, 3)
CONFIG = {
    "projectId": "PRJ-AI-001", "projectName": "AI Customer Support Automation Platform",
    "company": "Northstar Retail (fictional)", "projectManager": "Portfolio Project Manager (simulation)",
    "startDate": START.isoformat(), "endDate": END.isoformat(), "reportingDate": "2026-04-17",
    "budgetBaseline": 2500000, "currency": "INR", "currencySymbol": "₹", "sprintDurationDays": 14,
    "selectedSprintWindow": 6, "teamSize": 10, "methodology": "Agile Scrum",
    "reportingCadence": {"deliveryReview": "Weekly", "steeringCommittee": "Monthly"},
    "budgetCategories": {"Development": 1000000, "AI and cloud": 400000, "Design": 200000,
                         "Testing": 200000, "Infrastructure": 300000, "Contingency": 400000},
    "riskThresholds": {"lowMax": 4, "mediumMax": 9, "highMax": 15},
    "assumptions": ["Six-month delivery baseline; two-week sprints.", "All names, costs, customer measures and outcomes are simulated.",
                    "Initial view shows six sprints; the complete lifecycle spans six months.",
                    "Reporting currency is Indian Rupees (INR)."],
}
existing_config = DATA / "project_config.json"
if existing_config.exists():
    CONFIG.update(json.loads(existing_config.read_text(encoding="utf-8")))
START = date.fromisoformat(CONFIG["startDate"])
END = date.fromisoformat(CONFIG["endDate"])

team = [
    ("RES-001", "Aarav Mehta", "Project Manager", "Governance", 40, 40, 33, 1800),
    ("RES-002", "Ananya Rao", "Product Manager", "Product", 40, 36, 30, 1600),
    ("RES-003", "Kabir Shah", "Backend Developer", "Engineering", 40, 40, 38, 1400),
    ("RES-004", "Mira Nair", "Backend Developer", "Engineering", 40, 36, 34, 1400),
    ("RES-005", "Ishaan Patel", "Frontend Developer", "Engineering", 40, 36, 32, 1350),
    ("RES-006", "Diya Iyer", "Frontend Developer", "Engineering", 40, 36, 35, 1350),
    ("RES-007", "Neel Kapoor", "AI Engineer", "AI and Data", 40, 40, 38, 1700),
    ("RES-008", "Tara Joshi", "UI/UX Designer", "Design", 40, 28, 25, 1300),
    ("RES-009", "Rohan Das", "QA Engineer", "Quality", 40, 42, 37, 1200),
    ("RES-010", "Sana Khan", "QA Engineer", "Quality", 40, 40, 36, 1200),
]
epics = [
    ("EPIC-001", "Authentication and access control"), ("EPIC-002", "Customer support chat"),
    ("EPIC-003", "Knowledge base"), ("EPIC-004", "AI / RAG pipeline"),
    ("EPIC-005", "Ticket management"), ("EPIC-006", "Admin dashboard"), ("EPIC-007", "Analytics and monitoring"),
]
sprints = []
SPRINT_DAYS = int(CONFIG["sprintDurationDays"])
SPRINT_COUNT = (END - START).days // SPRINT_DAYS + 1
for i in range(1, SPRINT_COUNT + 1):
    s = START + timedelta(days=(i-1)*SPRINT_DAYS)
    e = min(s + timedelta(days=SPRINT_DAYS-1), END)
    sprints.append({"sprintId": f"SPRINT-{i:02}", "name": f"Sprint {i:02}", "startDate": s.isoformat(),
                    "endDate": e.isoformat(), "goal": ["Foundation and discovery", "Secure knowledge retrieval", "Customer chat MVP",
                    "Ticket workflows", "Admin and analytics", "Hardening and UAT", "Release readiness"][min((i-1)//2,6)],
                    "selected": i <= int(CONFIG["selectedSprintWindow"])})

tasks_raw = [
 ("Initiation & governance","Charter and governance baseline","Aarav Mehta",1,5,"High","Complete","",100),
 ("Initiation & governance","Stakeholder discovery and kickoff","Ananya Rao",1,8,"High","Complete","TASK-001",100),
 ("Discovery & requirements","Customer support workflow discovery","Ananya Rao",6,15,"High","Complete","TASK-002",100),
 ("Discovery & requirements","Product requirements and acceptance baseline","Ananya Rao",10,22,"High","Complete","TASK-003",100),
 ("UX/UI design","Conversation journey and wireframes","Tara Joshi",12,26,"High","Complete","TASK-003",100),
 ("UX/UI design","Admin console interaction design","Tara Joshi",20,34,"Medium","In Progress","TASK-005",75),
 ("Backend & APIs","Service architecture and API contracts","Kabir Shah",10,24,"High","Complete","TASK-003",100),
 ("Authentication & access","Role model and authorization design","Kabir Shah",20,31,"High","In Progress","TASK-007",85),
 ("Authentication & access","Identity integration and audit events","Mira Nair",28,48,"High","In Progress","TASK-008",60),
 ("Knowledge ingestion","Document inventory and access policy","Neel Kapoor",16,28,"High","Complete","TASK-003",100),
 ("Knowledge ingestion","Ingestion and parsing pipeline","Neel Kapoor",27,52,"High","In Progress","TASK-010",65),
 ("Knowledge ingestion","Metadata, versioning and index refresh","Mira Nair",42,62,"Medium","In Progress","TASK-011",35),
 ("Retrieval & RAG","Retrieval baseline and evaluation set","Neel Kapoor",26,40,"High","Complete","TASK-010",100),
 ("Retrieval & RAG","Grounded answer orchestration and citations","Neel Kapoor",39,69,"Critical","In Progress","TASK-013",45),
 ("AI guardrails","Escalation policy and safety guardrails","Ananya Rao",39,60,"Critical","In Progress","TASK-013",40),
 ("Customer chat frontend","Chat interface and source references","Ishaan Patel",34,58,"High","In Progress","TASK-005",68),
 ("Customer chat frontend","Accessibility and responsive states","Diya Iyer",48,67,"Medium","Not Started","TASK-016",0),
 ("Ticket management","Ticket creation and assignment API","Mira Nair",45,69,"High","In Progress","TASK-009",42),
 ("Ticket management","Agent queue and status transitions","Ishaan Patel",56,77,"High","Not Started","TASK-018",0),
 ("Admin dashboard","Quality metrics and configuration screens","Diya Iyer",59,85,"Medium","Not Started","TASK-006",0),
 ("Analytics & monitoring","Event model and operational telemetry","Kabir Shah",52,72,"Medium","In Progress","TASK-014",20),
 ("Integration","CRM sandbox and service integration","Mira Nair",65,88,"High","Not Started","TASK-018",0),
 ("QA & security","Test strategy and automation framework","Rohan Das",26,39,"High","Complete","TASK-004",100),
 ("QA & security","Security, privacy and access testing","Sana Khan",62,92,"Critical","Not Started","TASK-009",0),
 ("QA & security","Functional, regression and load testing","Rohan Das",70,101,"High","Not Started","TASK-019",0),
 ("AI evaluation","Offline quality evaluation and tuning","Neel Kapoor",62,91,"High","Not Started","TASK-014",0),
 ("UAT","UAT scripts, sessions and sign-off","Ananya Rao",91,108,"High","Not Started","TASK-024",0),
 ("Deployment & training","Release checklist and agent training","Aarav Mehta",105,119,"High","Not Started","TASK-027",0),
 ("Deployment & training","Production rollout and go/no-go","Aarav Mehta",120,126,"Critical","Not Started","TASK-028",0),
 ("Monitoring & closure","Hypercare, KPI review and closure","Aarav Mehta",127,180,"Medium","Not Started","TASK-029",0),
 ("Governance","Change control and monthly steering","Aarav Mehta",1,180,"Medium","In Progress","TASK-001",55),
 ("Knowledge ingestion","Approved source-owner sign-off","Ananya Rao",20,43,"High","At Risk","TASK-010",70),
 ("Integration","CRM API contract confirmation","Kabir Shah",32,55,"High","At Risk","TASK-007",65),
 ("QA & security","Test data privacy review","Sana Khan",44,61,"Critical","In Progress","TASK-023",50),
 ("Analytics & monitoring","Operational dashboard instrumentation","Diya Iyer",80,102,"Medium","Not Started","TASK-021",0),
]
tasks=[]
workstream_order=list(dict.fromkeys(row[0] for row in tasks_raw))
workstream_ids={name:index+1 for index,name in enumerate(workstream_order)}
workstream_counts={name:0 for name in workstream_order}
for n,(stream,name,owner,sd,ed,priority,status,dep,pct) in enumerate(tasks_raw,1):
    st=START+timedelta(days=sd-1); en=START+timedelta(days=ed-1)
    workstream_counts[stream]+=1
    forecast=en + timedelta(days=(7 if status=="At Risk" else 3 if status=="In Progress" and pct<50 else 0))
    tasks.append({"taskId":f"TASK-{n:03}","wbsId":f"{workstream_ids[stream]}.{workstream_counts[stream]:02}","taskName":name,"workstream":stream,
      "owner":owner,"priority":priority,"status":status,"baselineStart":st.isoformat(),"baselineEnd":en.isoformat(),
      "forecastStart":st.isoformat(),"forecastEnd":forecast.isoformat(),"durationDays":ed-sd+1,"dependencyIds":dep,
      "completionPct":pct,"sprintId":sprints[min((sd-1)//SPRINT_DAYS,len(sprints)-1)]["sprintId"],"milestone":False})
delivery_baseline = CONFIG["budgetBaseline"] - CONFIG["budgetCategories"]["Contingency"]
total_duration = sum(t["durationDays"] for t in tasks)
for t in tasks:
    value = round(delivery_baseline * t["durationDays"] / total_duration)
    planned_elapsed = max(0, min(t["durationDays"], (date.fromisoformat(CONFIG["reportingDate"]) - date.fromisoformat(t["baselineStart"])).days + 1))
    t["budgetedValueINR"] = value
    t["plannedValueINR"] = round(value * planned_elapsed / t["durationDays"])
    t["earnedValueINR"] = round(value * t["completionPct"] / 100)

stories=[]
story_titles=["As an administrator, I can define role-based access","As an agent, I can sign in securely","As a customer, I can ask a support question","As a customer, I can see cited source references","As a customer, I can request a human agent","As a support lead, I can review approved documents","As an administrator, I can refresh the knowledge index","As a customer, I receive an answer grounded in approved content","As an evaluator, I can score answer relevance","As a support agent, I can view an escalated conversation","As a support agent, I can create a ticket from a chat","As a support lead, I can assign a ticket","As an agent, I can update ticket status","As an administrator, I can review AI quality metrics","As an administrator, I can configure escalation thresholds","As a PMO analyst, I can view delivery health","As an administrator, I can monitor latency and failures","As a customer, I can use the chat on mobile","As a QA analyst, I can export evaluation results","As a support lead, I can view reopen rates","As an administrator, I can audit access events"]
for i,title in enumerate(story_titles,1):
    epic=epics[(i-1)%7][0]; sprint=sprints[min((i-1)//2,12)]["sprintId"]
    points=[3,5,8,5,3,8,5,8,5,3,8,5,3,5,3,5,8,5,3,3,5][i-1]
    status="Done" if i<=8 else "In Progress" if i<=13 else "To Do"
    story_deps={2:"STORY-001",4:"STORY-003",5:"STORY-003",7:"STORY-006",8:"STORY-006",9:"STORY-008",11:"STORY-010",12:"STORY-011",13:"STORY-012",14:"STORY-009",15:"STORY-005",16:"STORY-014",17:"STORY-014",18:"STORY-003",19:"STORY-009",20:"STORY-013",21:"STORY-014"}
    stories.append({"storyId":f"STORY-{i:03}","epicId":epic,"story":title,"businessValue":"Reduce repeat handling and give agents traceable, actionable context.",
      "acceptanceCriteria":f"Given the approved role and scenario, when the user completes the flow, then the result is recorded and auditable (AC-{i:02}).",
      "priority":"High" if i<=10 else "Medium","storyPoints":points,"dependencyIds":story_deps.get(i,""),"sprintId":sprint,"status":status})
stream_epic={"Authentication & access":"EPIC-001","Customer chat frontend":"EPIC-002","Knowledge ingestion":"EPIC-003","Retrieval & RAG":"EPIC-004","AI evaluation":"EPIC-004","Ticket management":"EPIC-005","Admin dashboard":"EPIC-006","Analytics & monitoring":"EPIC-007"}
for task in tasks:
    epic_id=stream_epic.get(task["workstream"])
    candidates=[story for story in stories if story["epicId"]==epic_id] if epic_id else []
    task["storyId"]=candidates[(int(task["taskId"][-3:])-1)%len(candidates)]["storyId"] if candidates else ""

risks_data=[
 ("AI responses may include unsupported claims","AI quality",4,5,"Mitigate","Require citations, confidence threshold and human fallback","Neel Kapoor","2026-05-15","Open","Unsupported answer rate > 5%","Disable affected intent and route to agent",15),
 ("Unauthorized document exposure through retrieval","Privacy & security",3,5,"Mitigate","ACL-aware retrieval tests and source-level permissions","Sana Khan","2026-05-08","Open","Any cross-role retrieval hit","Disable index and investigate access trail",10),
 ("Uncontrolled requirements expand delivery scope","Scope",4,4,"Mitigate","Change requests scored by impact and steering approval","Ananya Rao","2026-04-30","Open","Unestimated work > 10% sprint capacity","Defer lower-value backlog items",12),
 ("Forecast delivery cost exceeds approved baseline","Financial",3,4,"Mitigate","Monthly forecast, burn review and contingency gate","Aarav Mehta","2026-05-29","Open","EAC > ₹25 lakh","Reforecast and seek steering decision",8),
 ("Cloud or model provider outage interrupts service","External dependency",3,4,"Mitigate","Timeouts, retries, provider status runbook","Kabir Shah","2026-06-05","Open","Availability below 99.5%","Degrade safely and route to agents",8),
 ("Retrieval quality is insufficient for key intents","AI quality",4,4,"Mitigate","Build representative test set and tune chunking","Neel Kapoor","2026-05-22","In Progress","Grounded answer rate < 85%","Limit automated intents",9),
 ("CRM integration contract arrives late","Integration",4,4,"Mitigate","Confirm sandbox contract and use adapter boundary","Mira Nair","2026-05-01","Open","No contract by Sprint 8","Use controlled CSV handoff for UAT",10),
 ("Temporary QA capacity is insufficient near UAT","Resources",4,3,"Mitigate","Shift test design earlier and request approved support","Rohan Das","2026-06-12","Open","Planned utilization > 100%","Reprioritize regression suite",9),
 ("Support agents do not adopt the workflow","Adoption",3,3,"Enhance","Co-design, training and feedback sessions","Ananya Rao","2026-06-26","Open","Training completion < 90%","Extend coached pilot",6),
 ("UAT identifies critical defects near release","Quality",3,5,"Mitigate","Entry criteria, risk-based testing and exit gates","Sana Khan","2026-06-19","Open","Critical open defect at UAT exit","Delay release; retain rollback option",12),
 ("Document owners do not approve source corpus","Data readiness",3,4,"Mitigate","Named approvers and staged content sign-off","Ananya Rao","2026-05-08","In Progress","Approval under 80% by Sprint 7","Launch with approved subset",7),
 ("Latency exceeds support-channel tolerance","Performance",2,4,"Mitigate","Measure p95 latency and tune retrieval budget","Kabir Shah","2026-06-12","Open","p95 > 3 seconds","Reduce context and queue nonurgent work",6),
]
risks=[]
for i,(desc,cat,p,impact,response,mit,owner,due,status,trigger,cont,residual) in enumerate(risks_data,1):
    score=p*impact; thresholds=CONFIG["riskThresholds"]; severity="Critical" if score>thresholds["highMax"] else "High" if score>thresholds["mediumMax"] else "Medium" if score>thresholds["lowMax"] else "Low"
    due_date=(START+timedelta(days=(date.fromisoformat(due)-date(2026,1,5)).days)).isoformat()
    risks.append({"riskId":f"RISK-{i:03}","description":desc,"category":cat,"probability":p,"impact":impact,"score":score,"severity":severity,
      "responseStrategy":response,"mitigation":mit,"owner":owner,"dueDate":due_date,"reviewDate":(date.fromisoformat(due_date)-timedelta(days=7)).isoformat(),"status":status,"trigger":trigger,"contingency":cont,"residualRisk":residual})
issues=[
 ("CRM sandbox credentials arrived three business days late","Integration","High","High","Mira Nair","2026-04-24","In Progress","Use mock adapter until access restored"),
 ("Two approved document sets have inconsistent metadata","Data readiness","Medium","High","Neel Kapoor","2026-04-24","Open","Normalize metadata and confirm source owner"),
 ("Mobile chat layout clips long citation labels","UX","Medium","Medium","Diya Iyer","2026-04-28","Open","Add wrapping and regression coverage"),
 ("Sprint 5 retrieval tuning story carried over","Delivery","Medium","High","Neel Kapoor","2026-04-24","In Progress","Split evaluation and implementation work"),
 ("Audit event schema missing actor context","Security","High","High","Kabir Shah","2026-04-30","Open","Add actor and role fields before integration test"),
 ("QA test environment refresh is intermittent","Environment","Medium","Medium","Rohan Das","2026-04-27","Open","Pin a stable test data snapshot"),
 ("Ticket priority mapping differs from support policy","Product","Low","Medium","Ananya Rao","2026-04-29","In Progress","Review mapping with support lead"),
 ("Steering requested cost forecast sensitivity view","Governance","Low","Low","Aarav Mehta","2026-04-30","Open","Add base and risk-adjusted EAC in next pack"),
 ("Citation drawer keyboard focus order fails review","Accessibility","Medium","Medium","Ishaan Patel","2026-05-04","Open","Repair focus order and include keyboard test"),
]
issues=[{"issueId":f"ISSUE-{i:03}","description":d,"category":c,"severity":s,"priority":p,"owner":o,"dueDate":(START+timedelta(days=(date.fromisoformat(due)-date(2026,1,5)).days)).isoformat(),"status":st,"resolutionPlan":plan} for i,(d,c,s,p,o,due,st,plan) in enumerate(issues,1)]

milestones=[
 ("MILESTONE-001","Charter approved",1,10,"Complete"),("MILESTONE-002","Requirements baseline approved",24,30,"Complete"),
 ("MILESTONE-003","Architecture and security review",36,42,"Complete"),("MILESTONE-004","Knowledge retrieval MVP",72,78,"At Risk"),
 ("MILESTONE-005","Customer chat and ticket MVP",98,105,"Not Started"),("MILESTONE-006","Integrated system test exit",130,137,"Not Started"),
 ("MILESTONE-007","UAT sign-off",154,160,"Not Started"),("MILESTONE-008","Production go-live",174,180,"Not Started"),
]
milestones=[{"milestoneId":i,"name":n,"baselineDate":(START+timedelta(days=d-1)).isoformat(),"forecastDate":(START+timedelta(days=f-1)).isoformat(),"status":s,"owner":"Aarav Mehta"} for i,n,d,f,s in milestones]

DATA.mkdir(exist_ok=True)
def csvout(name, rows):
    if not rows: return
    with (DATA/name).open("w",newline="",encoding="utf-8-sig") as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
for name,rows in [("tasks.csv",tasks),("team.csv",[dict(resourceId=r[0],name=r[1],role=r[2],workstream=r[3],availableHoursPerWeek=r[4],allocatedHoursPerWeek=r[5],actualHoursLastWeek=r[6],hourlyCostINR=r[7]) for r in team]),
 ("epics.csv",[dict(epicId=i,name=n) for i,n in epics]),("sprints.csv",sprints),("stories.csv",stories),("risks.csv",risks),("issues.csv",issues),("milestones.csv",milestones)]: csvout(name,rows)
deps=[]
for t in tasks:
    for dep in filter(None,t["dependencyIds"].split(";")):
        pred = next(x for x in tasks if x["taskId"] == dep)
        link = "Finish-to-Start" if pred["baselineEnd"] < t["baselineStart"] else "Start-to-Start"
        deps.append({"predecessorTaskId":dep,"successorTaskId":t["taskId"],"type":link})
csvout("dependencies.csv",deps)
csvout("stakeholders.csv",[
 {"stakeholderId":f"STK-{i:03}","name":n,"role":role,"power":power,"interest":interest,"engagementStrategy":strategy,"channel":channel,"cadence":cadence}
 for i,(n,role,power,interest,strategy,channel,cadence) in enumerate([
 ("Executive Sponsor","Sponsor","High","High","Manage closely","Steering committee","Monthly"),("Portfolio Project Manager","Project Manager","High","High","Manage closely","Delivery review","Weekly"),
 ("Product Manager","Product owner","High","High","Co-create","Backlog and sprint review","Twice weekly"),("Support Operations Lead","Business lead","High","High","Involve in decisions","Workshop and demo","Biweekly"),
 ("Security Lead","Control owner","High","Medium","Review gates","Security review","Monthly / gates"),("Customer Experience Lead","Business stakeholder","Medium","High","Keep engaged","User research","Monthly"),
 ("Engineering Lead","Delivery lead","High","High","Daily collaboration","Team sync","Daily"),("Finance Partner","Financial control","Medium","Medium","Provide cost visibility","Cost report","Monthly"),
 ("Data Governance Lead","Data owner","High","Medium","Approve corpus","Review and sign-off","At gates")],1)])
csvout("raci.csv",[{"deliverable":d,"Accountable":a,"Responsible":r,"Consulted":c,"Informed":i} for d,a,r,c,i in [
 ("Charter and baseline","Executive Sponsor","Project Manager","Product Manager; Finance Partner","Delivery team"),("Product backlog","Product Manager","Product Manager","Support Operations; Engineering","Sponsor"),
 ("Architecture and APIs","Engineering Lead","Backend Developers","Security Lead; AI Engineer","Product Manager"),("Knowledge corpus approval","Data Governance Lead","Product Manager","Security Lead; AI Engineer","Sponsor"),
 ("AI evaluation and guardrails","Product Manager","AI Engineer","Security Lead; Support Operations","Sponsor"),("Quality and UAT","Support Operations Lead","QA Engineers","Product Manager; Engineering","Sponsor"),
 ("Budget and forecast","Executive Sponsor","Project Manager","Finance Partner","Delivery team"),("Production release","Executive Sponsor","Project Manager","Engineering; Security; Support Operations","Stakeholders")]])

# Finance profile reconciles to ₹21 lakh forecast and ₹25 lakh approved budget.
month_cursor=START.replace(day=1)
months=[]
while month_cursor <= END:
    months.append(month_cursor.strftime("%Y-%m"))
    month_cursor=(month_cursor.replace(day=28)+timedelta(days=4)).replace(day=1)
default_plan=[210000,280000,340000,390000,300000,300000,280000]
delivery_baseline=CONFIG["budgetBaseline"]-CONFIG["budgetCategories"]["Contingency"]
scale=delivery_baseline/2_100_000
planned=[round(default_plan[i]*scale) if i<len(default_plan) else 0 for i in range(len(months))]
if planned: planned[-1] += delivery_baseline-sum(planned)
default_actual=[200000,275000,330000,405000]
report_month=CONFIG["reportingDate"][:7]
actual=[round(default_actual[i]*scale) if i<len(default_actual) and m<=report_month else 0 for i,m in enumerate(months)]
cost_rows=[]
for j,m in enumerate(months):
    for cat,base in CONFIG["budgetCategories"].items():
        if cat=="Contingency": p=0; a=0
        else:
            weights={name:amount/delivery_baseline for name,amount in CONFIG["budgetCategories"].items() if name!="Contingency"}
            p=round(planned[j]*weights[cat]); a=round(actual[j]*weights[cat])
        cost_rows.append({"period":m,"category":cat,"plannedCostINR":p,"actualCostINR":a,"commitmentINR":0})
csvout("costs.csv",cost_rows)
burndown_rows=[]
for sprint in sprints[:int(CONFIG["selectedSprintWindow"])]:
    planned_points=sum(st["storyPoints"] for st in stories if st["sprintId"]==sprint["sprintId"])
    for day in range(SPRINT_DAYS):
        ideal=max(0,planned_points-round(planned_points*day/max(1,SPRINT_DAYS-1)))
        carryover=2 if sprint["sprintId"]=="SPRINT-05" and 7<=day<=10 else 0
        burndown_rows.append({"sprintId":sprint["sprintId"],"day":day,"date":(date.fromisoformat(sprint["startDate"])+timedelta(days=day)).isoformat(),"plannedPoints":planned_points,"remainingPoints":min(planned_points,ideal+carryover)})
csvout("burndown.csv",burndown_rows)
quality_rows=[
 {"observationDate":min((date.fromisoformat(m+"-01").replace(day=28)+timedelta(days=4)).replace(day=1)-timedelta(days=1),date.fromisoformat(CONFIG["reportingDate"])).isoformat(),"sampleSize":200,"answeredCount":190+i*2,"accurateAnswerCount":172+i*5,"groundedCount":168+i*3,"unsupportedCount":12-i,
  "humanEscalations":50-i*3,"automatedResolutions":112+i*4,"avgLatencySeconds":2.8-i*.12,"retrievalRelevantCount":164+i*4,"uatPassed":18+i*3,"uatExecuted":24+i*3,"defectCount":9-i,"reopenedTickets":8-i,"resolvedTickets":120+i*10}
 for i,m in enumerate([m for m in months if m<=report_month])]
csvout("quality.csv",quality_rows)
csvout("decisions.csv",[
 {"decisionId":"DEC-001","date":"2026-01-14","decision":"Use approved document sources only for initial release","owner":"Executive Sponsor","status":"Approved","rationale":"Reduce privacy and content risk"},
 {"decisionId":"DEC-002","date":"2026-02-02","decision":"Keep human escalation available for every supported intent","owner":"Product Manager","status":"Approved","rationale":"Safe fallback and service continuity"},
 {"decisionId":"DEC-003","date":"2026-03-16","decision":"Use citation traceability as a release acceptance gate","owner":"Support Operations Lead","status":"Approved","rationale":"Enable agent verification"},
 {"decisionId":"CR-001","date":"2026-04-08","decision":"Add accessibility review to MVP exit criteria","owner":"Executive Sponsor","status":"Approved","rationale":"Reduce adoption and compliance risk"}])
change_requests=[{"changeRequestId":"CR-001","date":"2026-04-08","title":"Add accessibility review to MVP exit criteria","requestor":"Support Operations Lead","impact":"QA effort and release acceptance gate","status":"Approved","approver":"Executive Sponsor"}]
csvout("change_requests.csv",change_requests)
budget_categories=[{"category":name,"budgetBaselineINR":amount,"contingencyFlag":name=="Contingency"} for name,amount in CONFIG["budgetCategories"].items()]
csvout("budget_categories.csv",budget_categories)
resource_allocations=[]
for sprint_index,sprint in enumerate(sprints):
    for resource_index,r in enumerate(team):
        available=r[4]*2
        allocated=r[5]*2
        factor=.90+((resource_index+sprint_index)%5)*.025
        actual_hours=round(min(available,allocated*factor)) if sprint_index<int(CONFIG["selectedSprintWindow"]) else 0
        resource_allocations.append({"sprintId":sprint["sprintId"],"resourceId":r[0],"availableHours":available,"allocatedHours":allocated,"actualHours":actual_hours,"plannedUtilizationPct":round(allocated/available*100,1)})
csvout("resource_allocations.csv",resource_allocations)
report_date=date.fromisoformat(CONFIG["reportingDate"])
snapshot_dates=[]
cursor=START
while cursor<=report_date:
    snapshot_dates.append(cursor)
    cursor+=timedelta(days=7)
snapshot_dates.append(report_date) if not snapshot_dates or snapshot_dates[-1]!=report_date else None
progress_now=round(sum(t["completionPct"] for t in tasks)/len(tasks))
actual_now=sum(c["actualCostINR"] for c in cost_rows)
open_risk_count=sum(r["status"]!="Closed" for r in risks)
open_issue_count=sum(i["status"]!="Closed" for i in issues)
status_snapshots=[]
for snap in snapshot_dates:
    ratio=max(0,min(1,(snap-START).days/max(1,(report_date-START).days)))
    status_snapshots.append({"snapshotDate":snap.isoformat(),"projectCompletionPct":round(progress_now*ratio),"cumulativeActualCostINR":round(actual_now*ratio),"openRisks":open_risk_count,"openIssues":open_issue_count,"projectStatus":"At Risk" if open_risk_count and ratio>.4 else "In Progress"})
csvout("status_snapshots.csv",status_snapshots)

(DATA/"project_config.json").write_text(json.dumps(CONFIG,indent=2),encoding="utf-8")
model={"config":CONFIG,"tasks":tasks,"team":[dict(resourceId=r[0],name=r[1],role=r[2],workstream=r[3],availableHoursPerWeek=r[4],allocatedHoursPerWeek=r[5],actualHoursLastWeek=r[6],hourlyCostINR=r[7]) for r in team],
 "epics":[dict(epicId=i,name=n) for i,n in epics],"sprints":sprints,"stories":stories,"risks":risks,"issues":issues,"milestones":milestones,
 "costs":cost_rows,"quality":quality_rows,"burndown":burndown_rows,"resourceAllocations":resource_allocations,"statusSnapshots":status_snapshots,"budgetCategories":budget_categories,"changeRequests":change_requests,"decisions":[{"decisionId":"DEC-001","date":"2026-01-14","decision":"Use approved document sources only for initial release","status":"Approved"},{"decisionId":"DEC-002","date":"2026-02-02","decision":"Keep human escalation available for every supported intent","status":"Approved"},{"decisionId":"DEC-003","date":"2026-03-16","decision":"Use citation traceability as a release acceptance gate","status":"Approved"}]}
(DATA/"project_data.json").write_text(json.dumps(model,indent=2),encoding="utf-8")

print(f"Generated {len(tasks)} tasks, {len(stories)} stories, {len(risks)} risks and {len(sprints)} sprints.")

# Workbook-compatible artifacts and detailed project documentation.
import shutil
def copy_csv(src, folder, dst=None):
    target = ROOT / folder; target.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(DATA / src, target / (dst or src))
def write_doc(folder, filename, body):
    target = ROOT / folder; target.mkdir(parents=True, exist_ok=True)
    (target / filename).write_text(body.strip() + "\n", encoding="utf-8")

fmt_money=lambda amount: f"{CONFIG['currencySymbol']}{amount:,}"
budget_breakdown="; ".join(f"{name} {fmt_money(amount)}" for name,amount in CONFIG["budgetCategories"].items())
delivery_budget=CONFIG["budgetBaseline"]-CONFIG["budgetCategories"].get("Contingency",0)
charter = f"""# Project Charter — AI Customer Support Automation Platform

## Business problem and opportunity
Northstar Retail's support operation handles a large repeat-question workload while customers need dependable responses and agent help for complex cases. A governed assistant can retrieve approved internal content, present source references, create/track tickets, and escalate uncertain questions. This simulation demonstrates the delivery controls required to build that capability safely.

## Business case and proposed benefits
Proposed targets (not achieved results): reduce repetitive agent workload by 25% within 90 days of launch; reduce median first response time by 30%; achieve at least 90% grounded answers and no more than 5% unsupported answers on the agreed evaluation set; keep human escalation available and target 15–35% while prioritizing safety; reach at least 95% UAT pass rate with zero open critical defects; reduce cost per resolved repetitive request by 15% after a measured baseline is established.

## Objectives and success criteria
Deliver approved-source RAG, citations, escalation, ticket workflow, admin controls and monitoring by {END.isoformat()}; stay within {fmt_money(CONFIG['budgetBaseline'])} approved funding; complete security/privacy reviews; obtain business UAT sign-off; train at least 90% of the pilot agent cohort; establish a post-launch 30/60/90-day quality and operational-cost review. Targets are proposed and require baseline validation.

## Scope and exclusions
In scope: discovery, UX, access control, document ingestion, retrieval and guardrails, customer chat, ticketing, admin analytics, integration, QA/security, UAT, rollout/training, hypercare. Excluded: autonomous high-impact customer decisions, unapproved data sources, replacing the support CRM, unsupported languages, and production commitments without operational approvals.

## Deliverables
Approved charter/requirements; architecture and access model; approved source corpus and ingestion; evaluated RAG and fallback; customer chat with citations; ticket queue and assignment; admin/quality dashboard; integrated tested product; UAT evidence; deployment/training runbook; monitoring and closure report.

## Assumptions, constraints and baseline
Six-month baseline {START.isoformat()}–{END.isoformat()}, {SPRINT_DAYS}-day Scrum sprints, 10-person team, {fmt_money(CONFIG['budgetBaseline'])} budget, {CONFIG['currency']}, weekly delivery review and monthly steering. All example data is synthetic. Initial dashboard view covers {CONFIG['selectedSprintWindow']} sprints; full lifecycle contains {len(sprints)} periods. Security and source-owner approval are release dependencies.

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
"""
write_doc("01_Project_Charter", "Project_Charter.md", charter)
write_doc("01_Project_Charter", "Business_Case.md", f"""
# Business Case

## Opportunity
Frequently repeated questions consume agent time, while inconsistent answers and document-search friction can increase response delay. A retrieval-grounded assistant with visible source references and a human handoff creates an opportunity to improve customer access while preserving agent control.

## Options considered
1. Keep current manual handling: lowest change cost, no repeat-work reduction.
2. FAQ-only static widget: fast, but weak at finding changing internal policies and does not unify ticket handling.
3. Approved-corpus RAG plus ticketing and human fallback: recommended simulation option; requires source governance, quality evidence, privacy controls and operational support.

## Proposed measurable targets
Targets for a future measured pilot: 25% reduction in repetitive workload; 30% reduction in median first response; ≥90% grounded answer rate; ≤5% unsupported answer rate; ≥95% UAT pass rate; 15% lower cost per repetitive resolved request. Establish measurement baseline, cohort, time window and confidence before claiming benefit. These are not achieved outcomes.

## Funding and decision
{fmt_money(CONFIG['budgetBaseline'])} baseline including {fmt_money(CONFIG['budgetCategories'].get('Contingency',0))} controlled contingency. Delivery-category allocation {fmt_money(delivery_budget)}. Release contingency only with sponsor-approved change or risk response. Expected benefit case is conditional on pilot evidence and safe quality thresholds.
""")
write_doc("01_Project_Charter", "Project_Objectives.md", """
# Project Objectives

| Objective | Proposed measure | Evidence / gate |
|---|---|---|
| Reduce repetitive agent effort | 25% reduction vs measured pre-pilot baseline by day 90 | Ticket/contact tagging and time study |
| Improve response speed | 30% reduction in median first response | Same channel/cohort comparison |
| Ground AI answers | ≥90% on approved evaluation set | Versioned prompt set, citations, review rubric |
| Limit unsupported content | ≤5% unsupported answer rate | Human-reviewed evaluation sample |
| Maintain human fallback | Human escalation always available; target 15–35% initial | Workflow tests and operational sample |
| Deliver safely | ≥95% UAT pass, zero critical open defects at release | Signed UAT and defect register |
| Operate within baseline | ≤{fmt_money(CONFIG['budgetBaseline'])} approved cost | Finance reconciliation; contingency controlled |

All are proposed targets for a hypothetical pilot, not actual measured results.
""")

for src,folder,dst in [("tasks.csv","02_Project_Planning","WBS.csv"),("tasks.csv","02_Project_Planning","Gantt_Chart.csv"),("tasks.csv","02_Project_Planning","Project_Timeline.csv"),("milestones.csv","02_Project_Planning",None),("dependencies.csv","02_Project_Planning","Dependency_Register.csv"),
 ("stories.csv","03_Product_Management","Product_Backlog.csv"),("sprints.csv","04_Agile","Sprint_Plan.csv"),("stories.csv","04_Agile","Sprint_Backlog.csv"),("burndown.csv","04_Agile",None),
 ("risks.csv","05_Risk_Management","Risk_Register.csv"),("issues.csv","05_Risk_Management","Issue_Log.csv"),("stakeholders.csv","06_Stakeholders","Stakeholder_Matrix.csv"),("raci.csv","06_Stakeholders",None),
 ("costs.csv","07_Finance","Budget_Tracker.csv"),("costs.csv","07_Finance","Cost_Analysis.csv"),("costs.csv","07_Finance","Budget_Variance.csv"),
 ("team.csv","08_Resources","Resource_Plan.csv"),("team.csv","08_Resources","Team_Utilization.csv"),("resource_allocations.csv","08_Resources",None),
 ("status_snapshots.csv","02_Project_Planning","Project_Status_Snapshots.csv"),("change_requests.csv","06_Stakeholders",None),("budget_categories.csv","07_Finance",None)]: copy_csv(src,folder,dst)
write_doc("02_Project_Planning","Schedule_Baseline.md",f"""
# Schedule Baseline

Baseline: {START.isoformat()} through {END.isoformat()} (180 calendar days inclusive). Thirteen two-week sprint periods are defined; the final period is clipped to the baseline end date. Work packages use finish-to-start dependencies; the validation script checks every predecessor exists and ends before its successor begins. The delivery critical chain is source approval and ingestion → retrieval/evaluation → integrated testing → UAT → go-live. Parallel UX, access and ticket work has separate dependencies. Forecast dates carry explicit risk-related shifts; baseline dates remain unchanged. Sprint-window length is configured independently of project duration.
""")
write_doc("03_Product_Management","Product_Requirements.md", """
# Product Requirements

## Personas and outcomes
Customers need accurate, traceable answers and a simple way to request an agent. Agents need context, source links and ticket continuity. Support leads need queue control and quality visibility. Administrators need access policies, corpus refresh, auditability and service metrics.

## Functional requirements
1. Answer supported common questions only using approved documents; show source title and reference.
2. Escalate low-confidence, unsupported or complex requests to a human with conversation context.
3. Create, assign, prioritize and transition tickets with audit events.
4. Enforce role-based access to content and administration.
5. Ingest, parse, version and refresh approved documents with owner and access metadata.
6. Provide admin quality, latency, escalation, resolution, defect and retrieval indicators with denominators.
7. Provide operational monitoring and failure fallback.

## Non-functional and control requirements
Privacy by design; access checks at retrieval; encryption and secrets managed outside source; p95 latency target ≤3 seconds for supported prompt flows; responsive accessible interface; traceable evaluation set; logs with actor context; recovery and rollback runbook. Targets require security and operational approval.

## MVP boundaries
Initial supported intents and approved source corpus only. No autonomous account changes, payments, unsupported-language claims, or production system replacement. See scope/change control and acceptance criteria.
""")
write_doc("03_Product_Management","User_Stories.md", """
# User Stories

The canonical 21-story backlog is `Product_Backlog.csv` and `data/stories.csv`. IDs use STORY-### and link to an EPIC-### and SPRINT-##. Each row includes value, priority, story points, dependency IDs, status and acceptance criteria. Story points measure relative effort only; they are not hours. Refine each story with the product owner before sprint commitment.
""")
write_doc("03_Product_Management","Acceptance_Criteria.md", """
# Acceptance Criteria

- Access: permitted roles can complete approved flows; unauthorized role/source combinations are denied and audited.
- Knowledge: only approved, versioned sources enter the index; citation opens the matching source passage; stale/failed refresh is visible.
- Answer: evaluation records answerability, evidence match, citation correctness and safety; unsupported confidence triggers human handoff.
- Chat: keyboard/mobile access, loading/error/empty states, source display, and human escalation preserve context.
- Ticketing: ticket has stable ID, assignment, priority, status history and linked conversation reference.
- Admin: quality values show numerator, denominator, date window and evaluation version.
- Release: UAT sign-off; no open critical security or functional defect; rollback, monitoring, agent training and support ownership ready.
""")
write_doc("03_Product_Management","Scope_and_Change_Control.md", """
# Scope and Change Control

In-scope deliverables and exclusions are in the charter. Log requests as CR-###; capture business value, alternatives, scope, security/privacy, schedule, budget, capacity, quality and adoption impact. Product Manager prioritizes; PM integrates the forecast; control owners review; sponsor/steering approves baseline changes. Unapproved requests remain outside committed scope. Update WBS, backlog, budget, risks, decisions, RACI and communication after approval.
""")
write_doc("04_Agile","Sprint_Review.md", """
# Sprint Review — Template and Simulation Notes

Review the sprint goal, accepted stories, unfinished work, demo evidence, quality defects, stakeholder feedback, risks and changed backlog priority. Record date, participants, story IDs, accepted/rejected outcome, decision, owner and follow-up. Simulated delivery includes incomplete work and carryover; do not treat all sprint plans as perfect. Story point velocity counts Done stories only.
""")
write_doc("04_Agile","Sprint_Retrospective.md", """
# Sprint Retrospective — Actions

| Observation | Action | Owner | Due / review |
|---|---|---|---|
| RAG tuning was too broad to forecast | Split evaluation and implementation stories | AI Engineer | Next refinement |
| QA design started late | Shift test design one sprint earlier | QA Lead | Sprint 7 |
| CRM contract uncertainty blocked integration confidence | Confirm sandbox schema before Sprint 8 | Engineering Lead | Weekly review |
| Evidence was scattered | Keep evaluation version, sample and denominator with each result | Product Manager | Before UAT |

Review action completion at the next retrospective. These examples are simulated.
""")
write_doc("04_Agile","Definition_of_Ready.md", """
# Definition of Ready

A story has a clear user/value statement, acceptance criteria, priority, epic and owner; is small enough to complete within one sprint; identifies dependencies and design/data/security needs; has testable examples and story points agreed by the team; and has no unresolved assumption that prevents starting. Readiness does not guarantee commitment.
""")
write_doc("04_Agile","Definition_of_Done.md", """
# Definition of Done

Code reviewed and merged; automated checks pass; acceptance criteria demonstrated; security/privacy/access implications reviewed; telemetry and audit behavior included where relevant; QA evidence linked; docs/runbook updated; no known critical defect; product owner accepts the outcome. AI stories additionally record evaluation version, sample, numerator/denominator, citation review and fallback behavior. UAT or release approval is a separate gate where required.
""")
write_doc("05_Risk_Management","Risk_Scoring_Methodology.md", """
# Risk Scoring Methodology

Probability and impact are integers 1–5. Score = Probability × Impact. Low 1–4, Medium 5–9, High 10–15, Critical 16–25. Review weekly; record cause/event/effect, trigger, response, mitigation, contingency, owner, due date, status and residual score. Risk is a future uncertain event; an issue is an event already occurred. Escalate critical score, trigger breach, overdue mitigation or risk beyond tolerance to the sponsor. The score ranks attention; it is not a calibrated probability estimate.
""")
write_doc("05_Risk_Management","Mitigation_Plan.md", """
# Mitigation Plan

Review the 12 risk records weekly. Immediate focus: (1) restrict retrieval to approved sources and test role boundaries; (2) gate automation on citation and unsupported-answer evidence; (3) confirm CRM contract and retain adapter/mock path; (4) shift QA design earlier and monitor capacity; (5) obtain source-owner approvals before expanding corpus; (6) keep outage degradation and human fallback testable. Owners update triggers, actions and residual score before each delivery review. Contingency use requires sponsor decision.
""")
write_doc("06_Stakeholders","Communication_Plan.md", """
# Communication Plan

| Audience | Content | Channel | Cadence | Owner |
|---|---|---|---|---|
| Sponsor / steering | RAG, forecast, decisions, critical risk, gate readiness | Steering pack | Monthly | PM |
| Delivery team | Sprint goal, dependencies, blockers | Scrum events | Daily / sprint |
| Product and support | Backlog, demos, adoption feedback | Refinement / review | Twice weekly / sprint |
| Security and data owners | Access, approved sources, evidence | Control review | At gates and monthly |
| Finance | Actuals, forecast, variance, contingency | Cost report | Monthly | PM |
""")
write_doc("06_Stakeholders","Meeting_Cadence.md", """
# Meeting Cadence

- Daily team sync: progress, next work, blockers; 15 minutes.
- Backlog refinement: story readiness, value, dependencies; twice weekly as needed.
- Sprint planning: goal, capacity, selected stories; every 14 days.
- Sprint review and retrospective: demonstrate accepted increment and agree actions; each sprint end.
- Weekly delivery review: integrated schedule/cost/scope/quality/resources, RAID and decisions.
- Monthly steering committee: forecast, change requests, material risks and stage-gate authority.
- Security/data reviews: at architecture, corpus approval, integrated testing and release gates.
""")
write_doc("06_Stakeholders","Decision_Log.md", """
# Decision Log

Canonical records are in `data/decisions.csv`. DEC-001 approved sources only for initial release; DEC-002 requires human escalation for supported intents; DEC-003 establishes citations as a release acceptance gate; CR-001 adds accessibility review to MVP exit criteria. Record decision authority, rationale, impacts, date and affected baseline. Decisions shown are simulated.
""")
write_doc("07_Finance","Financial_Assumptions.md", f"""
# Financial Assumptions

Budget baseline {fmt_money(CONFIG['budgetBaseline'])}: {budget_breakdown}. Delivery baseline excluding contingency: {fmt_money(delivery_budget)}. Contingency is held separately and is not automatically consumed or a saving. Monthly actuals through reporting period reconcile to {fmt_money(sum(c['actualCostINR'] for c in cost_rows))}; planned delivery through all periods totals {fmt_money(sum(c['plannedCostINR'] for c in cost_rows))}. Budget variance = baseline − actual; positive is under budget. Commitments are zero in this simulation. Forecast at completion is an estimate, not actual expenditure. All amounts are simulated {CONFIG['currency']}.
""")
write_doc("08_Resources","Capacity_Plan.md", """
# Capacity Plan

Ten simulated roles provide 400 available hours/week. Team allocations are captured in team.csv. Planned utilization = allocated ÷ available × 100. Two QA records reach or exceed full weekly capacity (42h and 40h); schedule test design earlier, transfer a planned six hours of test preparation to engineering in Sprint 7 where skills allow, and request temporary support only if the forecast still exceeds capacity with sponsor approval. Recheck weekly by sprint, include leave and operational support in availability, and do not interpret simulated hours as individual performance.
""")

# External tool import-ready derivatives.
with (ROOT/"10_Jira"/"Jira_Import_Data.csv").open("w",newline="",encoding="utf-8-sig") as f:
    fields=["Issue Type","Issue ID","Summary","Epic Name","Epic Link","Description","Priority","Story Points","Sprint","Acceptance Criteria","Status"]
    w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
    for eid,ename in epics:w.writerow({"Issue Type":"Epic","Issue ID":eid,"Summary":ename,"Epic Name":ename,"Status":"To Do"})
    for s in stories:w.writerow({"Issue Type":"Story","Issue ID":s["storyId"],"Summary":s["story"],"Epic Link":s["epicId"],"Description":s["businessValue"],"Priority":s["priority"],"Story Points":s["storyPoints"],"Sprint":s["sprintId"],"Acceptance Criteria":s["acceptanceCriteria"],"Status":s["status"]})
with (ROOT/"10_Jira"/"Epic_Story_Mapping.csv").open("w",newline="",encoding="utf-8-sig") as f:
    w=csv.DictWriter(f,fieldnames=["epicId","epicName","storyId","storyName"]);w.writeheader()
    for s in stories:w.writerow({"epicId":s["epicId"],"epicName":next(name for eid,name in epics if eid==s["epicId"]),"storyId":s["storyId"],"storyName":s["story"]})
with (ROOT/"11_ClickUp"/"ClickUp_Task_Import.csv").open("w",newline="",encoding="utf-8-sig") as f:
    fields=["Task ID","Task Name","Description","Workstream","Assignee","Priority","Status","Start Date","Due Date","Forecast End","Dependency IDs","Sprint","Completion","Duration Days"]
    w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
    for t in tasks:w.writerow({"Task ID":t["taskId"],"Task Name":t["taskName"],"Description":t["wbsId"],"Workstream":t["workstream"],"Assignee":t["owner"],"Priority":t["priority"],"Status":t["status"],"Start Date":t["baselineStart"],"Due Date":t["baselineEnd"],"Forecast End":t["forecastEnd"],"Dependency IDs":t["dependencyIds"],"Sprint":t["sprintId"],"Completion":t["completionPct"],"Duration Days":t["durationDays"]})
