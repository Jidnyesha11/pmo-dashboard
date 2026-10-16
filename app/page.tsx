"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Command,
  Download,
  FileBarChart,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Menu,
  Search,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import raw from "../data/project_data.json";

type Task = (typeof raw.tasks)[number];
type PageKey =
  | "Overview"
  | "Timeline"
  | "Risks & Issues"
  | "Financials"
  | "Resources"
  | "Agile Delivery"
  | "AI Quality";
const pages: { name: PageKey; icon: typeof LayoutDashboard }[] = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Timeline", icon: CalendarDays },
  { name: "Risks & Issues", icon: ShieldAlert },
  { name: "Financials", icon: CircleDollarSign },
  { name: "Resources", icon: Users },
  { name: "Agile Delivery", icon: ListChecks },
  { name: "AI Quality", icon: Bot },
];
const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: raw.config.currency,
    maximumFractionDigits: 0,
  }).format(value);
const pct = (a: number, b: number) =>
  b ? `${Math.round((a / b) * 100)}%` : "—";
const statusColor = (s: string) =>
  s === "Complete" || s === "Done"
    ? "green"
    : s === "At Risk" || s === "Critical" || s === "High"
      ? "red"
      : s === "In Progress"
        ? "blue"
        : "gray";

function Metric({
  label,
  value,
  sub,
  icon: Icon,
  tone = "blue",
  trend,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Activity;
  tone?: string;
  trend?: string;
}) {
  return (
    <article className="metric">
      <div className="metric-top">
        <span>{label}</span>
        <span className={`metric-icon ${tone}`}>
          <Icon size={16} />
        </span>
      </div>
      <strong>{value}</strong>
      <div className="metric-foot">
        <span>{sub}</span>
        {trend && (
          <span className="trend">
            <ArrowUpRight size={13} />
            {trend}
          </span>
        )}
      </div>
    </article>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Badge({ children }: { children: string }) {
  return <span className={`badge ${statusColor(children)}`}>{children}</span>;
}

export default function Dashboard() {
  const [active, setActive] = useState<PageKey>("Overview");
  const [query, setQuery] = useState("");
  const [stream, setStream] = useState("All workstreams");
  const [sortAsc, setSortAsc] = useState(true);
  const [ownerFilter, setOwnerFilter] = useState("All owners");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const {
    config,
    tasks,
    team,
    risks,
    issues,
    milestones,
    stories,
    sprints,
    costs,
    quality,
    decisions,
    burndown,
    resourceAllocations,
  } = raw;
  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "Complete").length;
  const projectProgress = Math.round(
    tasks.reduce((s, t) => s + t.completionPct, 0) / totalTasks,
  );
  const spendActual = costs.reduce((s, c) => s + c.actualCostINR, 0);
  const spendPlanned = costs.reduce((s, c) => s + c.plannedCostINR, 0);
  const plannedToDate = costs
    .filter((c) => c.period <= config.reportingDate.slice(0, 7))
    .reduce((s, c) => s + c.plannedCostINR, 0);
  const variance = config.budgetBaseline - spendActual;
  const forecastAtCompletion =
    spendActual + Math.max(0, spendPlanned - spendActual);
  const estimatedCostToComplete = Math.max(
    0,
    forecastAtCompletion - spendActual,
  );
  const elapsedCostMonths = new Set(
    costs.filter((c) => c.actualCostINR > 0).map((c) => c.period),
  ).size;
  const monthlyBurnRate = elapsedCostMonths
    ? spendActual / elapsedCostMonths
    : 0;
  const contingencyUsed = costs
    .filter((c) => c.category === "Contingency")
    .reduce((s, c) => s + c.actualCostINR, 0);
  const remainingContingency =
    config.budgetCategories["Contingency"] - contingencyUsed;
  const overdue = tasks.filter(
    (t) => t.forecastEnd < config.reportingDate && t.completionPct < 100,
  ).length;
  const openRisks = risks.filter((r) => r.status !== "Closed").length;
  const criticalRisks = risks.filter((r) => r.severity === "Critical").length;
  const currentSprint =
    sprints.find(
      (s) =>
        s.startDate <= config.reportingDate &&
        s.endDate >= config.reportingDate,
    ) ?? sprints[5];
  const plannedTasksToDate = tasks.filter(
    (t) => t.baselineEnd <= config.reportingDate,
  );
  const completedTasksToDate = plannedTasksToDate.filter(
    (t) => t.completionPct === 100,
  ).length;
  const selectedSprintIds = new Set(
    sprints.filter((s) => s.selected).map((s) => s.sprintId),
  );
  const selectedStories = stories.filter((s) =>
    selectedSprintIds.has(s.sprintId),
  );
  const selectedPlannedPoints = selectedStories.reduce(
    (n, s) => n + s.storyPoints,
    0,
  );
  const selectedCompletedPoints = selectedStories
    .filter((s) => s.status === "Done")
    .reduce((n, s) => n + s.storyPoints, 0);
  const selectedSprintCompletion = pct(
    selectedCompletedPoints,
    selectedPlannedPoints,
  );
  const reportingLabel = new Date(
    `${config.reportingDate}T12:00:00`,
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const workstreams = [
    "All workstreams",
    ...Array.from(new Set(tasks.map((t) => t.workstream))),
  ];
  const filteredTasks = useMemo(
    () =>
      tasks
        .filter(
          (t) =>
            (stream === "All workstreams" || t.workstream === stream) &&
            (ownerFilter === "All owners" || t.owner === ownerFilter) &&
            (priorityFilter === "All priorities" ||
              t.priority === priorityFilter) &&
            (statusFilter === "All statuses" || t.status === statusFilter) &&
            (!fromDate || t.baselineEnd >= fromDate) &&
            (!toDate || t.baselineStart <= toDate) &&
            `${t.taskName} ${t.owner} ${t.status}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sortAsc
            ? a.baselineStart.localeCompare(b.baselineStart)
            : b.baselineStart.localeCompare(a.baselineStart),
        ),
    [
      tasks,
      stream,
      query,
      sortAsc,
      ownerFilter,
      priorityFilter,
      statusFilter,
      fromDate,
      toDate,
    ],
  );
  const monthly = monthsFromCosts(costs);
  const sprintStats = sprints.slice(0, config.selectedSprintWindow).map((s) => {
    const storiesIn = stories.filter((x) => x.sprintId === s.sprintId);
    return {
      sprint: s.name.replace("Sprint ", "S"),
      planned: storiesIn.reduce((n, x) => n + x.storyPoints, 0),
      completed: storiesIn
        .filter((x) => x.status === "Done")
        .reduce((n, x) => n + x.storyPoints, 0),
    };
  });
  const categories = Object.entries(config.budgetCategories)
    .map(([name, value]) => ({ name, value }))
    .filter((x) => x.name !== "Contingency");
  const utilization = Math.round(
    (team.reduce((n, r) => n + r.allocatedHoursPerWeek, 0) /
      team.reduce((n, r) => n + r.availableHoursPerWeek, 0)) *
      100,
  );
  const overAllocated = team.filter(
    (r) => r.allocatedHoursPerWeek > r.availableHoursPerWeek,
  ).length;
  const qualityLatest = quality[quality.length - 1];
  const pageTitle = active === "Overview" ? "Executive overview" : active;
  const scheduleHealth = plannedTasksToDate.length
    ? Math.round((completedTasksToDate / plannedTasksToDate.length) * 100)
    : 100;
  const costHealth =
    spendActual <= plannedToDate
      ? 100
      : Math.max(
          0,
          Math.round(
            100 -
              ((spendActual - plannedToDate) / Math.max(1, plannedToDate)) *
                100,
          ),
        );
  const health = [
    { name: "Schedule", value: scheduleHealth },
    { name: "Cost", value: costHealth },
    { name: "Scope", value: projectProgress },
    {
      name: "Quality",
      value: Math.round(
        (qualityLatest.groundedCount / qualityLatest.answeredCount) * 100,
      ),
    },
    {
      name: "Resources",
      value: Math.max(0, 100 - Math.round((overAllocated / team.length) * 100)),
    },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Command size={18} />
          </div>
          <div>
            <b>Northstar</b>
            <small>PROJECT OFFICE</small>
          </div>
          <button className="close-menu" onClick={() => setMobileMenu(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="workspace">
          <span className="workspace-dot" /> AI Support Platform{" "}
          <ChevronDown size={14} />
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav>
          {pages.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${active === name ? "active" : ""}`}
              onClick={() => {
                setActive(name);
                setMobileMenu(false);
              }}
            >
              <Icon size={17} />
              <span>{name}</span>
              {name === "Risks & Issues" && <i>{openRisks}</i>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-project">
            <div className="tiny-heading">PROJECT HEALTH</div>
            <div className="health-mini">
              <span className="health-circle">{projectProgress}</span>
              <div>
                <b>Needs attention</b>
                <small>2 signals outside target</small>
              </div>
            </div>
            <div className="mini-progress">
              <span style={{ width: `${projectProgress}%` }} />
            </div>
            <small>{projectProgress}% lifecycle progress</small>
          </div>
          <div className="profile">
            <div className="avatar">PM</div>
            <div>
              <b>Portfolio PM</b>
              <small>Project manager</small>
            </div>
            <ChevronDown size={15} />
          </div>
        </div>
      </aside>
      {mobileMenu && (
        <button
          className="scrim"
          onClick={() => setMobileMenu(false)}
          aria-label="Close navigation"
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-toggle" onClick={() => setMobileMenu(true)}>
            <Menu size={20} />
          </button>
          <div className="crumb">
            Projects <span>/</span> <b>AI Support Platform</b>
          </div>
          <div className="top-actions">
            <span className="report-date">
              <CalendarDays size={14} /> Reporting date <b>{reportingLabel}</b>
            </span>
            <div className="avatar top-avatar">PM</div>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">PROJECT DELIVERY · FY26</div>
              <h1>{pageTitle}</h1>
              <p>
                AI Customer Support Automation Platform{" "}
                <span className="dot-sep">·</span> Weekly delivery review{" "}
                <span className="sim-tag">SIMULATED DATA</span>
              </p>
            </div>
            <button
              className="button secondary"
              onClick={() => downloadSnapshot(raw)}
            >
              <Download size={15} /> Export snapshot
            </button>
          </div>
          {active === "Overview" && (
            <>
              <div className="summary-banner">
                <div className="summary-icon">
                  <Activity size={19} />
                </div>
                <div>
                  <b>Executive summary</b>
                  <p>
                    Delivery is {projectProgress}% complete across the six-month
                    baseline. Actual spend is {money(spendActual)},{" "}
                    {money(Math.abs(plannedToDate - spendActual))}{" "}
                    {spendActual <= plannedToDate ? "below" : "above"} the
                    period plan through {config.reportingDate.slice(0, 7)}.
                    Retrieval quality, QA capacity and CRM integration need
                    active follow-through before the MVP gate.
                  </p>
                </div>
                <span className="banner-date">
                  {reportingLabel.toUpperCase()}
                </span>
              </div>
              <div className="metric-grid">
                <Metric
                  label="Overall status"
                  value={
                    criticalRisks > 0 || overdue > 0 ? "At risk" : "On track"
                  }
                  sub={`${criticalRisks} critical risks · ${overdue} overdue tasks`}
                  icon={Activity}
                  tone={criticalRisks > 0 || overdue > 0 ? "amber" : "green"}
                />
                <Metric
                  label="Project completion"
                  value={`${projectProgress}%`}
                  sub={`${completed} of ${totalTasks} tasks complete`}
                  icon={Check}
                />
                <Metric
                  label="Schedule vs plan"
                  value={`${completedTasksToDate}/${plannedTasksToDate.length}`}
                  sub="Completed / baseline due by report date"
                  icon={CalendarDays}
                  tone="blue"
                />
                <Metric
                  label="Approved budget"
                  value={money(config.budgetBaseline)}
                  sub="Including held contingency"
                  icon={CircleDollarSign}
                  tone="violet"
                />
                <Metric
                  label="Actual expenditure"
                  value={money(spendActual)}
                  sub="Through reporting date"
                  icon={BriefcaseBusiness}
                />
                <Metric
                  label="Budget variance"
                  value={money(variance)}
                  sub="Positive means under budget"
                  icon={variance >= 0 ? ArrowDownRight : ArrowUpRight}
                  tone={variance >= 0 ? "green" : "red"}
                />
                <Metric
                  label="Budget utilization"
                  value={pct(spendActual, config.budgetBaseline)}
                  sub={`${money(config.budgetBaseline - spendActual)} remaining`}
                  icon={Gauge}
                  tone="violet"
                />
                <Metric
                  label="Current sprint"
                  value={currentSprint.name}
                  sub={currentSprint.goal}
                  icon={ListChecks}
                  tone="green"
                />
                <Metric
                  label="Sprint completion"
                  value={selectedSprintCompletion}
                  sub="Completed points / planned points in window"
                  icon={Check}
                />
                <Metric
                  label="Open risks"
                  value={`${openRisks}`}
                  sub="Future uncertain events"
                  icon={ShieldAlert}
                  tone="red"
                />
                <Metric
                  label="Critical risks"
                  value={`${criticalRisks}`}
                  sub="Score 16–25"
                  icon={AlertTriangle}
                  tone="amber"
                />
                <Metric
                  label="Overdue tasks"
                  value={`${overdue}`}
                  sub="Forecast end before reporting date"
                  icon={Clock3}
                  tone="amber"
                />
                <Metric
                  label="Upcoming milestones"
                  value={`${milestones.filter((m) => m.status !== "Complete" && m.baselineDate >= config.reportingDate).length}`}
                  sub="Remaining baseline checkpoints"
                  icon={CalendarDays}
                  tone="blue"
                />
              </div>
              <div className="chart-grid">
                <Panel
                  title="Delivery progress"
                  subtitle="Task completion by workstream"
                  action={
                    <span className="legend-note">
                      <i className="dot blue-dot" /> Completion
                    </span>
                  }
                >
                  <WorkstreamChart tasks={tasks} />
                </Panel>
                <Panel
                  title="Planned vs. actual spend"
                  subtitle="Monthly cumulative spend · INR"
                >
                  <SpendingChart data={monthly} />
                </Panel>
              </div>
              <div className="chart-grid lower">
                <Panel
                  title="Milestone status"
                  subtitle="Baseline and forecast checkpoints"
                >
                  <MilestoneList milestones={milestones} />
                </Panel>
                <Panel
                  title="Sprint completion trend"
                  subtitle="Completed story points vs. planned"
                >
                  <SprintChart data={sprintStats} />
                </Panel>
                <Panel
                  title="Project health"
                  subtitle="PMO assessment by control area"
                >
                  <HealthChart data={health} />
                </Panel>
              </div>
              <div className="chart-grid">
                <Panel
                  title="Items requiring attention"
                  subtitle="Open decisions, blockers and delivery signals"
                  action={
                    <button
                      className="text-button"
                      onClick={() => setActive("Risks & Issues")}
                    >
                      View register <ArrowUpRight size={13} />
                    </button>
                  }
                >
                  <AttentionList risks={risks} issues={issues} />
                </Panel>
                <Panel title="Recent decisions" subtitle="Governance record">
                  <div className="decision-list">
                    {decisions.map((d) => (
                      <div className="decision-row" key={d.decisionId}>
                        <span className="decision-mark">
                          <Check size={13} />
                        </span>
                        <div>
                          <b>{d.decision}</b>
                          <small>
                            {d.date} <span>·</span> {d.status}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
              <div className="disclaimer">
                <i /> Simulated portfolio data for demonstration only. No
                customer, employee, financial, or production outcomes are
                represented.
              </div>
            </>
          )}
          {active === "Timeline" && (
            <>
              <div className="metric-grid compact">
                <Metric
                  label="Current phase"
                  value="Build & integrate"
                  sub="Phase 3 of 6 · 6-month lifecycle"
                  icon={Activity}
                />
                <Metric
                  label="Baseline window"
                  value={`${config.startDate} — ${config.endDate}`}
                  sub={`${Math.ceil((new Date(config.endDate).getTime() - new Date(config.startDate).getTime()) / 86400000)} days · ${sprints.length} sprint periods`}
                  icon={CalendarDays}
                  tone="violet"
                />
                <Metric
                  label="Upcoming milestones"
                  value={`${milestones.filter((m) => m.status !== "Complete").length}`}
                  sub="Next: retrieval MVP"
                  icon={Check}
                  tone="green"
                />
                <Metric
                  label="Late / at-risk"
                  value={`${overdue + tasks.filter((t) => t.status === "At Risk").length}`}
                  sub="Overdue plus at-risk task records"
                  icon={AlertTriangle}
                  tone="amber"
                />
              </div>
              <Panel
                title="Work breakdown and schedule"
                subtitle="Baseline dates with forecast; select a task for its delivery detail"
                action={
                  <div className="filter-row">
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value)}
                    >
                      {workstreams.map((w) => (
                        <option key={w}>{w}</option>
                      ))}
                    </select>
                    <select
                      value={ownerFilter}
                      onChange={(e) => setOwnerFilter(e.target.value)}
                    >
                      <option>All owners</option>
                      {team.map((r) => (
                        <option key={r.resourceId}>{r.name}</option>
                      ))}
                    </select>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                      <option>All priorities</option>
                      {["Critical", "High", "Medium", "Low"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option>All statuses</option>
                      {Array.from(new Set(tasks.map((t) => t.status))).map(
                        (x) => (
                          <option key={x}>{x}</option>
                        ),
                      )}
                    </select>
                    <input
                      aria-label="Filter baseline start"
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                    <input
                      aria-label="Filter baseline end"
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                    <input
                      placeholder="Search task or owner"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                }
              >
                <TaskTable
                  tasks={filteredTasks}
                  sortAsc={sortAsc}
                  setSortAsc={setSortAsc}
                  onSelect={setSelectedTask}
                />
              </Panel>
              <Panel
                title="Gantt timeline"
                subtitle="Blue shows baseline; amber marks forecast extensions"
              >
                <GanttTimeline tasks={filteredTasks} config={config} />
              </Panel>
              <div className="timeline-grid">
                <Panel title="Milestone plan" subtitle="Baseline vs forecast">
                  <MilestoneList milestones={milestones} />
                </Panel>
                <Panel title="Delivery notes" subtitle="Schedule assumptions">
                  <ul className="note-list">
                    <li>
                      Baseline runs {config.startDate} through {config.endDate}.
                    </li>
                    <li>
                      Dependencies use start-to-start or finish-to-start logic
                      as shown in the dependency register.
                    </li>
                    <li>
                      Critical chain passes through approved knowledge sources →
                      RAG evaluation → integrated testing → UAT → release.
                    </li>
                    <li>
                      The dashboard sprint window is configured separately from
                      the full lifecycle schedule.
                    </li>
                  </ul>
                </Panel>
              </div>
            </>
          )}
          {active === "Risks & Issues" && (
            <>
              <div className="metric-grid compact">
                <Metric
                  label="Open risks"
                  value={`${openRisks}`}
                  sub={`${risks.length} identified in register`}
                  icon={ShieldAlert}
                  tone="red"
                />
                <Metric
                  label="Critical risks"
                  value={`${criticalRisks}`}
                  sub={`Score ${config.riskThresholds.highMax + 1}–25`}
                  icon={AlertTriangle}
                  tone="amber"
                />
                <Metric
                  label="Open issues"
                  value={`${issues.filter((i) => i.status !== "Closed").length}`}
                  sub="Occurred and under resolution"
                  icon={Activity}
                />
                <Metric
                  label="Mitigation in progress"
                  value={`${risks.filter((r) => r.status === "In Progress").length}`}
                  sub="Risk response tracking"
                  icon={Check}
                  tone="green"
                />
              </div>
              <div className="chart-grid">
                <Panel
                  title="Risk probability × impact"
                  subtitle="Score = probability (1–5) × impact (1–5)"
                >
                  <RiskMatrix
                    risks={risks}
                    thresholds={config.riskThresholds}
                  />
                </Panel>
                <Panel
                  title="Risk severity mix"
                  subtitle="Severity bands follow documented score thresholds"
                >
                  <RiskBars risks={risks} />
                  <div className="severity-key">
                    <span>
                      <i className="sev low" />
                      Low 1–{config.riskThresholds.lowMax}
                    </span>
                    <span>
                      <i className="sev med" />
                      Medium {config.riskThresholds.lowMax + 1}–
                      {config.riskThresholds.mediumMax}
                    </span>
                    <span>
                      <i className="sev high" />
                      High {config.riskThresholds.mediumMax + 1}–
                      {config.riskThresholds.highMax}
                    </span>
                    <span>
                      <i className="sev critical" />
                      Critical {config.riskThresholds.highMax + 1}–25
                    </span>
                  </div>
                </Panel>
              </div>
              <div className="chart-grid">
                <Panel
                  title="Risks by category"
                  subtitle="Open and closed items grouped by risk domain"
                >
                  <RiskCategoryChart risks={risks} />
                </Panel>
                <Panel
                  title="Open vs. closed risks"
                  subtitle="Status distribution from the risk register"
                >
                  <RiskStatusChart risks={risks} />
                </Panel>
              </div>
              <Panel
                title="Risk register"
                subtitle="Future uncertain events with owner, review date, mitigation and trigger"
              >
                <RiskTable risks={risks} />
              </Panel>
              <Panel
                title="Issue log"
                subtitle="Issues are events that have occurred and require resolution"
              >
                <IssueTable issues={issues} />
              </Panel>
            </>
          )}
          {active === "Financials" && (
            <>
              <div className="metric-grid compact">
                <Metric
                  label="Approved baseline"
                  value={money(config.budgetBaseline)}
                  sub="Allocation includes held contingency"
                  icon={CircleDollarSign}
                  tone="violet"
                />
                <Metric
                  label="Actual expenditure"
                  value={money(spendActual)}
                  sub="Through configured reporting period"
                  icon={BriefcaseBusiness}
                />
                <Metric
                  label="Budget variance"
                  value={money(variance)}
                  sub="Positive means under budget"
                  icon={variance >= 0 ? ArrowDownRight : ArrowUpRight}
                  tone={variance >= 0 ? "green" : "red"}
                />
                <Metric
                  label="Forecast at completion"
                  value={money(forecastAtCompletion)}
                  sub={`${money(estimatedCostToComplete)} estimated cost to complete`}
                  icon={FileBarChart}
                  tone="blue"
                />
              </div>
              <Panel
                title="Monthly expenditure"
                subtitle="Planned and actual amounts by period · INR"
              >
                <SpendingChart data={monthly} monthlyMode />
              </Panel>
              <div className="chart-grid">
                <Panel
                  title="Baseline by cost category"
                  subtitle="Contingency held separately from delivery cost"
                >
                  <CategoryChart categories={categories} />
                </Panel>
                <Panel
                  title="Forecast and contingency"
                  subtitle="Calculated from shared financial records"
                >
                  <ul className="note-list">
                    <li>
                      Actual through the configured reporting date:{" "}
                      {money(spendActual)}. Remaining approved budget:{" "}
                      {money(variance)}.
                    </li>
                    <li>
                      Estimated cost to complete:{" "}
                      {money(estimatedCostToComplete)}; forecast at completion:{" "}
                      {money(forecastAtCompletion)}.
                    </li>
                    <li>
                      Average monthly burn rate across {elapsedCostMonths}{" "}
                      months with actuals: {money(monthlyBurnRate)}.
                    </li>
                    <li>
                      Remaining contingency: {money(remainingContingency)}. It
                      is excluded from forecast unless formally released.
                    </li>
                    <li>
                      Budget variance = budget baseline − actual cost; positive
                      means under budget, negative means over budget.
                    </li>
                  </ul>
                </Panel>
              </div>
            </>
          )}
          {active === "Resources" && (
            <>
              <div className="metric-grid compact">
                <Metric
                  label="Team capacity"
                  value={`${team.reduce((n, r) => n + r.availableHoursPerWeek, 0)} h/wk`}
                  sub={`${team.length}-person simulated roster`}
                  icon={Users}
                />
                <Metric
                  label="Planned allocation"
                  value={`${team.reduce((n, r) => n + r.allocatedHoursPerWeek, 0)} h/wk`}
                  sub={`Utilization ${utilization}%`}
                  icon={Gauge}
                  tone="violet"
                />
                <Metric
                  label="Over-allocated"
                  value={`${overAllocated}`}
                  sub="QA plan exceeds 100%"
                  icon={AlertTriangle}
                  tone="amber"
                />
                <Metric
                  label="Corrective action"
                  value="Shift-left QA"
                  sub="Start test design one sprint earlier"
                  icon={Check}
                  tone="green"
                />
              </div>
              <Panel
                title="Team roster & capacity"
                subtitle="Planned allocation and actual hours are separate; not an employee performance measure"
              >
                <ResourceTable team={team} />
              </Panel>
              <div className="chart-grid">
                <Panel
                  title="Capacity vs. planned allocation"
                  subtitle="Hours per week"
                >
                  <ResourceChart team={team} />
                </Panel>
                <Panel
                  title="Workload by sprint"
                  subtitle="Available, planned, and actual hours across the selected window"
                >
                  <SprintWorkloadChart rows={resourceAllocations} />
                </Panel>
                <Panel
                  title="Reallocation recommendation"
                  subtitle="Explainable response to temporary QA demand"
                >
                  <div className="recommendation">
                    <div className="recommend-icon">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <b>Protect the QA exit gate</b>
                      <p>
                        Two QA roles reach or exceed the 40-hour weekly capacity
                        (42h and 40h). Plan a 6-hour peak-week test-design
                        transfer to engineering during Sprint 7, then obtain
                        sponsor approval for temporary test support only if the
                        regression forecast still exceeds available hours.
                      </p>
                      <small>
                        Trigger: forecast demand &gt; available capacity ·
                        Owner: Project Manager · Review: weekly
                      </small>
                    </div>
                  </div>
                </Panel>
              </div>
            </>
          )}
          {active === "Agile Delivery" && (
            <>
              <div className="metric-grid compact">
                <Metric
                  label="Sprint window"
                  value={`${sprints.filter((s) => s.selected).length} of ${sprints.length}`}
                  sub="Selected view · full lifecycle"
                  icon={ListChecks}
                />
                <Metric
                  label="Backlog"
                  value={`${stories.length} stories`}
                  sub={`${stories.reduce((n, s) => n + s.storyPoints, 0)} story points`}
                  icon={BriefcaseBusiness}
                  tone="violet"
                />
                <Metric
                  label="Completed points"
                  value={`${stories.filter((s) => s.status === "Done").reduce((n, s) => n + s.storyPoints, 0)} SP`}
                  sub="Only completed points count as velocity"
                  icon={Check}
                  tone="green"
                />
                <Metric
                  label="Carryover / defects"
                  value={`${issues.filter((i) => i.status !== "Closed").length} issues`}
                  sub="See issue log for current carryover"
                  icon={AlertTriangle}
                  tone="amber"
                />
              </div>
              <Panel
                title="Sprint velocity"
                subtitle="Planned versus completed story points; hours are not combined with points"
              >
                <SprintChart data={sprintStats} />
              </Panel>
              <Panel
                title="Sprint burndown"
                subtitle="Synthetic remaining-point observations in the configured sprint window"
              >
                <BurndownChart rows={burndown} />
              </Panel>
              <Panel
                title="Epic and story backlog"
                subtitle="Epic → Story hierarchy · acceptance criteria are in source CSV"
              >
                <StoryTable stories={stories} epics={raw.epics} />
              </Panel>
              <div className="chart-grid">
                <Panel
                  title="Selected sprint plan"
                  subtitle="Configured demonstration window"
                >
                  <div className="sprint-cards">
                    {sprints
                      .filter((s) => s.selected)
                      .map((s, i) => (
                        <div className="sprint-card" key={s.sprintId}>
                          <div>
                            <b>{s.name}</b>
                            <Badge>
                              {i < 3
                                ? "Complete"
                                : i === 3
                                  ? "In Progress"
                                  : "Planned"}
                            </Badge>
                          </div>
                          <p>{s.goal}</p>
                          <small>
                            {s.startDate} — {s.endDate}
                          </small>
                          <div className="mini-progress">
                            <span
                              style={{
                                width: `${[100, 100, 74, 48, 10, 0][i] ?? 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </Panel>
                <Panel
                  title="Retrospective actions"
                  subtitle="Demo actions from delivery reviews"
                >
                  <ul className="note-list">
                    <li>
                      Split RAG evaluation and implementation stories to improve
                      forecast accuracy.
                    </li>
                    <li>
                      Shift QA test design left and protect capacity ahead of
                      UAT.
                    </li>
                    <li>
                      Confirm CRM API contract before Sprint 8 integration work
                      starts.
                    </li>
                  </ul>
                </Panel>
              </div>
            </>
          )}
          {active === "AI Quality" && (
            <>
              <div className="quality-note">
                <Bot size={18} />
                <div>
                  <b>Simulated evaluation results</b>
                  <span>
                    These are deterministic portfolio-demo observations, not
                    production benchmarks or claims about a deployed model.
                    Sample based on 200 synthetic test prompts per observation
                    period.
                  </span>
                </div>
              </div>
              <div className="metric-grid">
                <Metric
                  label="Response accuracy"
                  value={pct(
                    qualityLatest.accurateAnswerCount,
                    qualityLatest.answeredCount,
                  )}
                  sub={`${qualityLatest.accurateAnswerCount} correct / ${qualityLatest.answeredCount} answered`}
                  icon={Check}
                  tone="green"
                />
                <Metric
                  label="Grounded answer rate"
                  value={pct(
                    qualityLatest.groundedCount,
                    qualityLatest.answeredCount,
                  )}
                  sub={`${qualityLatest.groundedCount} grounded / ${qualityLatest.answeredCount} answered`}
                  icon={Check}
                  tone="blue"
                />
                <Metric
                  label="Hallucination / unsupported rate"
                  value={pct(
                    qualityLatest.unsupportedCount,
                    qualityLatest.answeredCount,
                  )}
                  sub="Unsupported claims / answered prompts"
                  icon={AlertTriangle}
                  tone="amber"
                />
                <Metric
                  label="Human escalation rate"
                  value={pct(
                    qualityLatest.humanEscalations,
                    qualityLatest.sampleSize,
                  )}
                  sub="Escalations / all evaluation prompts"
                  icon={Users}
                />
                <Metric
                  label="Automated resolution rate"
                  value={pct(
                    qualityLatest.automatedResolutions,
                    qualityLatest.sampleSize,
                  )}
                  sub="Automated resolutions / all prompts"
                  icon={Bot}
                  tone="violet"
                />
                <Metric
                  label="Average response latency"
                  value={`${qualityLatest.avgLatencySeconds.toFixed(2)}s`}
                  sub="Mean synthetic response time"
                  icon={Clock3}
                />
                <Metric
                  label="Retrieval relevance"
                  value={pct(
                    qualityLatest.retrievalRelevantCount,
                    qualityLatest.sampleSize,
                  )}
                  sub="Relevant retrievals / all prompts"
                  icon={Search}
                  tone="blue"
                />
                <Metric
                  label="UAT pass rate"
                  value={pct(
                    qualityLatest.uatPassed,
                    qualityLatest.uatExecuted,
                  )}
                  sub={`${qualityLatest.uatPassed} passed / ${qualityLatest.uatExecuted} executed`}
                  icon={Check}
                  tone="green"
                />
                <Metric
                  label="Reopened ticket rate"
                  value={pct(
                    qualityLatest.reopenedTickets,
                    qualityLatest.resolvedTickets,
                  )}
                  sub="Reopened / resolved synthetic tickets"
                  icon={Activity}
                  tone="amber"
                />
              </div>
              <Panel
                title="Evaluation trend"
                subtitle="Monthly simulated quality observations"
              >
                <QualityChart quality={quality} />
              </Panel>
              <Panel
                title="Definitions and evaluation method"
                subtitle="Denominators are explicit"
              >
                <div className="definition-grid">
                  <Definition
                    title="Response accuracy"
                    formula="Human-reviewed correct answers ÷ answered prompts"
                  />
                  <Definition
                    title="Grounded answer rate"
                    formula="Grounded answers ÷ answered prompts"
                  />
                  <Definition
                    title="Unsupported answer rate"
                    formula="Unsupported answers ÷ answered prompts"
                  />
                  <Definition
                    title="Human escalation rate"
                    formula="Human escalations ÷ all evaluation prompts"
                  />
                  <Definition
                    title="Automated resolution rate"
                    formula="Automated resolutions ÷ all evaluation prompts"
                  />
                  <Definition
                    title="Retrieval relevance"
                    formula="Relevant retrievals ÷ all evaluation prompts"
                  />
                  <Definition
                    title="UAT pass rate"
                    formula="Passed UAT cases ÷ executed UAT cases"
                  />
                  <Definition
                    title="Defect density"
                    formula={`${qualityLatest.defectCount} defects ÷ ${qualityLatest.uatExecuted} executed UAT cases × 100`}
                  />
                  <Definition
                    title="Reopened ticket rate"
                    formula="Reopened tickets ÷ resolved synthetic tickets"
                  />
                </div>
              </Panel>
            </>
          )}
        </div>
      </main>
      {selectedTask && (
        <div className="modal-backdrop" onClick={() => setSelectedTask(null)}>
          <div className="task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <small>
                  {selectedTask.taskId} · {selectedTask.workstream}
                </small>
                <h2>{selectedTask.taskName}</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedTask(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-grid">
              <div>
                <small>Owner</small>
                <b>{selectedTask.owner}</b>
              </div>
              <div>
                <small>Status</small>
                <Badge>{selectedTask.status}</Badge>
              </div>
              <div>
                <small>Priority</small>
                <b>{selectedTask.priority}</b>
              </div>
              <div>
                <small>Completion</small>
                <b>{selectedTask.completionPct}%</b>
              </div>
              <div>
                <small>Baseline</small>
                <b>
                  {selectedTask.baselineStart} → {selectedTask.baselineEnd}
                </b>
              </div>
              <div>
                <small>Forecast finish</small>
                <b>{selectedTask.forecastEnd}</b>
              </div>
              <div>
                <small>Dependency</small>
                <b>{selectedTask.dependencyIds || "None"}</b>
              </div>
              <div>
                <small>Sprint</small>
                <b>{selectedTask.sprintId}</b>
              </div>
              <div>
                <small>Linked story</small>
                <b>{selectedTask.storyId || "Not linked"}</b>
              </div>
            </div>
            <div className="modal-progress">
              <div>
                <span>Progress</span>
                <b>{selectedTask.completionPct}%</b>
              </div>
              <div className="mini-progress">
                <span style={{ width: `${selectedTask.completionPct}%` }} />
              </div>
            </div>
            <p className="muted">
              Schedule dates and progress are simulated planning records.
              Predecessor relationship types are in the dependency register.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function monthsFromCosts(costs: typeof raw.costs) {
  const map: Record<
    string,
    { period: string; planned: number; actual: number }
  > = {};
  for (const row of costs) {
    const v =
      map[row.period] ??
      (map[row.period] = {
        period: row.period.slice(5),
        planned: 0,
        actual: 0,
      });
    v.planned += row.plannedCostINR;
    v.actual += row.actualCostINR;
  }
  let cp = 0,
    ca = 0;
  return Object.values(map).map((m) => {
    cp += m.planned;
    ca += m.actual;
    return { ...m, plannedCum: cp, actualCum: ca };
  });
}
function WorkstreamChart({ tasks }: { tasks: typeof raw.tasks }) {
  const data = Array.from(new Set(tasks.map((t) => t.workstream))).map((w) => {
    const a = tasks.filter((t) => t.workstream === w);
    return {
      name: w.length > 21 ? w.slice(0, 19) + "…" : w,
      progress: Math.round(
        a.reduce((n, t) => n + t.completionPct, 0) / a.length,
      ),
      count: a.length,
    };
  });
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 4, right: 14, top: 5, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#edf0f4"
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#8490a2" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={138}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#637083" }}
          />
          <Tooltip formatter={(v) => [`${v}%`, "Average completion"]} />
          <Bar
            dataKey="progress"
            fill="#4667e8"
            radius={[0, 5, 5, 0]}
            barSize={13}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
function SpendingChart({
  data,
  monthlyMode = false,
}: {
  data: ReturnType<typeof monthsFromCosts>;
  monthlyMode?: boolean;
}) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart
          data={data}
          margin={{ left: 4, right: 10, top: 5, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#edf0f4"
          />
          <XAxis
            dataKey="period"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#8490a2" }}
          />
          <YAxis
            tickFormatter={(v) => `₹${Math.round(v / 100000)}L`}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#8490a2" }}
          />
          <Tooltip formatter={(v) => [money(Number(v)), "INR"]} />
          {monthlyMode ? (
            <>
              <Bar
                dataKey="planned"
                name="Planned"
                fill="#dce4ff"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="actual"
                name="Actual"
                fill="#4667e8"
                radius={[4, 4, 0, 0]}
              />
            </>
          ) : (
            <>
              <Area
                dataKey="plannedCum"
                name="Planned cumulative"
                stroke="#a9b7f7"
                fill="#edf0ff"
                strokeWidth={2}
              />
              <Line
                dataKey="actualCum"
                name="Actual cumulative"
                stroke="#4667e8"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
function SprintChart({
  data,
}: {
  data: { sprint: string; planned: number; completed: number }[];
}) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ left: 0, right: 8, top: 6, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#edf0f4"
          />
          <XAxis dataKey="sprint" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar
            dataKey="planned"
            name="Planned SP"
            fill="#e1e7f0"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="completed"
            name="Completed SP"
            fill="#4667e8"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
function BurndownChart({ rows }: { rows: typeof raw.burndown }) {
  const selectedSprints = Array.from(new Set(rows.map((r) => r.sprintId)));
  const [sprint, setSprint] = useState(selectedSprints[0] ?? "");
  const sprintRows = rows.filter((r) => r.sprintId === sprint);
  const plannedPoints = sprintRows[0]?.plannedPoints ?? 0;
  const data = sprintRows.map((r) => ({
    ...r,
    ideal: Math.max(
      0,
      plannedPoints * (1 - r.day / Math.max(1, sprintRows.length - 1)),
    ),
  }));
  return (
    <>
      <div className="filter-row burndown-filter">
        <select
          aria-label="Select sprint burndown"
          value={sprint}
          onChange={(e) => setSprint(e.target.value)}
        >
          {selectedSprints.map((id) => (
            <option key={id}>{id}</option>
          ))}
        </select>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height={230}>
          <ComposedChart
            data={data}
            margin={{ left: 0, right: 10, top: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#edf0f4"
            />
            <XAxis
              dataKey="day"
              tickFormatter={(v) => `D${v + 1}`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Line
              dataKey="ideal"
              name="Ideal remaining"
              stroke="#b9c4d5"
              strokeDasharray="5 4"
              dot={false}
            />
            <Line
              dataKey="remainingPoints"
              name="Observed remaining"
              stroke="#4667e8"
              strokeWidth={3}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
function MilestoneList({ milestones }: { milestones: typeof raw.milestones }) {
  return (
    <div className="milestone-list">
      {milestones.map((m) => (
        <div className="milestone-row" key={m.milestoneId}>
          <div className={`mile-dot ${statusColor(m.status)}`} />
          <div className="mile-content">
            <b>{m.name}</b>
            <small>
              Baseline {m.baselineDate} <span>·</span> Forecast {m.forecastDate}
            </small>
          </div>
          <Badge>{m.status}</Badge>
        </div>
      ))}
    </div>
  );
}
function HealthChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="health-list">
      {data.map((h) => (
        <div className="health-row" key={h.name}>
          <span>{h.name}</span>
          <div className="mini-progress">
            <span
              className={h.value < 70 ? "warn-fill" : ""}
              style={{ width: `${h.value}%` }}
            />
          </div>
          <b>{h.value}</b>
        </div>
      ))}
    </div>
  );
}
function AttentionList({
  risks,
  issues,
}: {
  risks: typeof raw.risks;
  issues: typeof raw.issues;
}) {
  const items = [
    ...risks
      .filter((r) => r.severity === "Critical" || r.status === "In Progress")
      .slice(0, 3)
      .map((r) => ({
        id: r.riskId,
        title: r.description,
        owner: r.owner,
        level: r.severity,
      })),
    ...issues
      .filter((i) => i.status !== "Closed")
      .slice(0, 2)
      .map((i) => ({
        id: i.issueId,
        title: i.description,
        owner: i.owner,
        level: i.priority,
      })),
  ];
  return (
    <div className="attention-list">
      {items.map((i) => (
        <div className="attention-row" key={i.id}>
          <span className="alert-bullet">
            <AlertTriangle size={14} />
          </span>
          <div>
            <b>{i.title}</b>
            <small>
              {i.id} · Owner {i.owner}
            </small>
          </div>
          <Badge>{i.level}</Badge>
        </div>
      ))}
    </div>
  );
}
function TaskTable({
  tasks,
  sortAsc,
  setSortAsc,
  onSelect,
}: {
  tasks: typeof raw.tasks;
  sortAsc: boolean;
  setSortAsc: (v: boolean) => void;
  onSelect: (t: Task) => void;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Task</th>
            <th>Workstream</th>
            <th>Owner</th>
            <th onClick={() => setSortAsc(!sortAsc)} className="sortable">
              Baseline dates <ChevronDown size={12} />
            </th>
            <th>Forecast end</th>
            <th>Dependency</th>
            <th>Progress</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr
              key={t.taskId}
              onClick={() => onSelect(t)}
              className="click-row"
            >
              <td className="id-cell">{t.taskId}</td>
              <td className="task-cell">{t.taskName}</td>
              <td>{t.workstream}</td>
              <td>{t.owner}</td>
              <td>
                {t.baselineStart.slice(5)} → {t.baselineEnd.slice(5)}
              </td>
              <td>{t.forecastEnd}</td>
              <td>{t.dependencyIds || "—"}</td>
              <td>
                <div className="table-progress">
                  <span>{t.completionPct}%</span>
                  <div className="mini-progress">
                    <span style={{ width: `${t.completionPct}%` }} />
                  </div>
                </div>
              </td>
              <td>
                <Badge>{t.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tasks.length === 0 && (
        <div className="empty-state">No tasks match these filters.</div>
      )}
    </div>
  );
}
function GanttTimeline({
  tasks,
  config,
}: {
  tasks: typeof raw.tasks;
  config: typeof raw.config;
}) {
  const start = new Date(`${config.startDate}T00:00:00`);
  const end = new Date(`${config.endDate}T00:00:00`);
  const span = Math.max(1, end.getTime() - start.getTime() + 86400000);
  const months = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end) {
    months.push({
      label: cursor.toLocaleDateString("en-IN", { month: "short" }),
      left: ((cursor.getTime() - start.getTime()) / span) * 100,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  const pos = (day: string) =>
    Math.max(
      0,
      Math.min(
        100,
        ((new Date(`${day}T00:00:00`).getTime() - start.getTime()) / span) *
          100,
      ),
    );
  return (
    <div className="gantt-scroll">
      <div className="gantt-inner">
        <div className="gantt-axis">
          <div className="gantt-label">Work package / owner</div>
          <div className="gantt-track-axis">
            {months.map((m) => (
              <span key={m.label + m.left} style={{ left: `${m.left}%` }}>
                {m.label}
              </span>
            ))}
          </div>
        </div>
        {tasks.map((t) => {
          const left = pos(t.baselineStart);
          const baseRight = pos(t.baselineEnd);
          const forecastRight = pos(t.forecastEnd);
          return (
            <div className="gantt-row" key={t.taskId}>
              <div className="gantt-label">
                <b>{t.taskName}</b>
                <small>
                  {t.owner} · {t.taskId}
                </small>
              </div>
              <div className="gantt-track">
                <span
                  className={`gantt-baseline ${statusColor(t.status)}`}
                  style={{
                    left: `${left}%`,
                    width: `${Math.max(0.6, baseRight - left)}%`,
                  }}
                />
                <span
                  className={`gantt-forecast ${forecastRight > baseRight ? "delayed" : ""}`}
                  style={{
                    left: `${baseRight}%`,
                    width: `${Math.max(0.2, forecastRight - baseRight)}%`,
                  }}
                />
                <span
                  className="gantt-progress"
                  style={{
                    left: `${left}%`,
                    width: `${Math.max(0.5, ((baseRight - left) * t.completionPct) / 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <div className="empty-state">
            No work packages match these filters.
          </div>
        )}
      </div>
    </div>
  );
}
function RiskMatrix({
  risks,
  thresholds,
}: {
  risks: typeof raw.risks;
  thresholds: typeof raw.config.riskThresholds;
}) {
  return (
    <div className="matrix-wrap">
      <div className="matrix-y">Impact</div>
      <div className="risk-matrix">
        {Array.from({ length: 25 }, (_, idx) => {
          const impact = 5 - Math.floor(idx / 5),
            probability = (idx % 5) + 1,
            score = impact * probability;
          const count = risks.filter(
            (r) => r.impact === impact && r.probability === probability,
          ).length;
          const color =
            score > thresholds.highMax
              ? "critical-cell"
              : score > thresholds.mediumMax
                ? "high-cell"
                : score > thresholds.lowMax
                  ? "medium-cell"
                  : "low-cell";
          return (
            <div
              className={`matrix-cell ${color}`}
              key={idx}
              title={`Probability ${probability}, impact ${impact}: ${count} risk(s)`}
            >
              {count || ""}
            </div>
          );
        })}
        <div className="matrix-x">
          Probability → &nbsp; 1 &nbsp; 2 &nbsp; 3 &nbsp; 4 &nbsp; 5
        </div>
      </div>
    </div>
  );
}
function RiskBars({ risks }: { risks: typeof raw.risks }) {
  const d = ["Critical", "High", "Medium", "Low"].map((name) => ({
    name,
    count: risks.filter((r) => r.severity === name).length,
  }));
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={228}>
        <BarChart
          data={d}
          layout="vertical"
          margin={{ left: 0, right: 20, top: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#edf0f4"
          />
          <XAxis
            type="number"
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={70}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip />
          <Bar dataKey="count" radius={[0, 5, 5, 0]}>
            {d.map((e, i) => (
              <Cell
                key={i}
                fill={["#d94f4f", "#ed9b58", "#e8c958", "#5bbd9a"][i]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
function RiskCategoryChart({ risks }: { risks: typeof raw.risks }) {
  const d = Array.from(new Set(risks.map((r) => r.category))).map(
    (category) => ({
      category,
      count: risks.filter((r) => r.category === category).length,
    }),
  );
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={245}>
        <BarChart
          data={d}
          layout="vertical"
          margin={{ left: 0, right: 18, top: 5, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#edf0f4"
          />
          <XAxis
            type="number"
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={122}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9 }}
          />
          <Tooltip />
          <Bar
            dataKey="count"
            name="Risks"
            fill="#687fe3"
            radius={[0, 5, 5, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
function RiskStatusChart({ risks }: { risks: typeof raw.risks }) {
  const d = ["Open", "In Progress", "Closed"].map((name) => ({
    name,
    value: risks.filter((r) => r.status === name).length,
  }));
  const colors = ["#d96e60", "#e7b45d", "#55ae91"];
  return (
    <div className="category-chart">
      <ResponsiveContainer width="42%" height={240}>
        <PieChart>
          <Pie
            data={d}
            dataKey="value"
            nameKey="name"
            innerRadius={53}
            outerRadius={82}
            paddingAngle={3}
          >
            {d.map((x, i) => (
              <Cell key={x.name} fill={colors[i]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="category-legend">
        {d.map((x, i) => (
          <div key={x.name}>
            <i style={{ background: colors[i] }} />
            <span>{x.name}</span>
            <b>{x.value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
function RiskTable({ risks }: { risks: typeof raw.risks }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Risk ID</th>
            <th>Description / response</th>
            <th>Category</th>
            <th>P × I</th>
            <th>Score</th>
            <th>Severity</th>
            <th>Residual</th>
            <th>Owner</th>
            <th>Review</th>
            <th>Mitigation due</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {risks.map((r) => (
            <tr key={r.riskId}>
              <td className="id-cell">{r.riskId}</td>
              <td className="task-cell">
                {r.description}
                <small className="subline">
                  {r.responseStrategy}: {r.mitigation}
                  <br />
                  Trigger: {r.trigger}
                </small>
              </td>
              <td>{r.category}</td>
              <td>
                {r.probability} × {r.impact}
              </td>
              <td>
                <b>{r.score}</b>
              </td>
              <td>
                <Badge>{r.severity}</Badge>
              </td>
              <td>{r.residualRisk}</td>
              <td>{r.owner}</td>
              <td>{r.reviewDate}</td>
              <td>{r.dueDate}</td>
              <td>
                <Badge>{r.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function IssueTable({ issues }: { issues: typeof raw.issues }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Issue ID</th>
            <th>Description</th>
            <th>Category</th>
            <th>Severity</th>
            <th>Priority</th>
            <th>Owner</th>
            <th>Due</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((i) => (
            <tr key={i.issueId}>
              <td className="id-cell">{i.issueId}</td>
              <td className="task-cell">
                {i.description}
                <small className="subline">Plan: {i.resolutionPlan}</small>
              </td>
              <td>{i.category}</td>
              <td>
                <Badge>{i.severity}</Badge>
              </td>
              <td>{i.priority}</td>
              <td>{i.owner}</td>
              <td>{i.dueDate}</td>
              <td>
                <Badge>{i.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function CategoryChart({
  categories,
}: {
  categories: { name: string; value: number }[];
}) {
  const colors = ["#4667e8", "#8565d7", "#46a7a0", "#f1a65b", "#78a5d8"];
  return (
    <div className="category-chart">
      <ResponsiveContainer width="48%" height={240}>
        <PieChart>
          <Pie
            data={categories}
            dataKey="value"
            nameKey="name"
            innerRadius={59}
            outerRadius={88}
            paddingAngle={3}
          >
            {categories.map((c, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => money(Number(v))} />
        </PieChart>
      </ResponsiveContainer>
      <div className="category-legend">
        {categories.map((c, i) => (
          <div key={c.name}>
            <i style={{ background: colors[i % colors.length] }} />
            <span>{c.name}</span>
            <b>{money(c.value)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
function ResourceTable({ team }: { team: typeof raw.team }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Resource</th>
            <th>Role</th>
            <th>Workstream</th>
            <th>Available h/wk</th>
            <th>Planned h/wk</th>
            <th>Planned util.</th>
            <th>Actual last week</th>
            <th>Actual util.</th>
            <th>Signal</th>
          </tr>
        </thead>
        <tbody>
          {team.map((r) => (
            <tr key={r.resourceId}>
              <td>
                <b>{r.name}</b>
              </td>
              <td>{r.role}</td>
              <td>{r.workstream}</td>
              <td>{r.availableHoursPerWeek}</td>
              <td>{r.allocatedHoursPerWeek}</td>
              <td>
                <div className="table-progress">
                  <span>
                    {pct(r.allocatedHoursPerWeek, r.availableHoursPerWeek)}
                  </span>
                  <div className="mini-progress">
                    <span
                      className={
                        r.allocatedHoursPerWeek > r.availableHoursPerWeek
                          ? "over-fill"
                          : ""
                      }
                      style={{
                        width: `${Math.min(100, (r.allocatedHoursPerWeek / r.availableHoursPerWeek) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </td>
              <td>{r.actualHoursLastWeek} h</td>
              <td>{pct(r.actualHoursLastWeek, r.availableHoursPerWeek)}</td>
              <td>
                {r.allocatedHoursPerWeek > r.availableHoursPerWeek ? (
                  <Badge>Overallocated</Badge>
                ) : (
                  <Badge>Within capacity</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function ResourceChart({ team }: { team: typeof raw.team }) {
  const d = team.map((r) => ({
    name: r.role.replace(" Developer", " Dev").replace(" Engineer", " Eng"),
    capacity: r.availableHoursPerWeek,
    allocated: r.allocatedHoursPerWeek,
    short: r.name.split(" ")[0],
  }));
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={270}>
        <BarChart data={d} margin={{ left: -16, right: 8, top: 5, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#edf0f4"
          />
          <XAxis
            dataKey="short"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
          />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar
            dataKey="capacity"
            name="Available h"
            fill="#e1e7f0"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="allocated"
            name="Planned h"
            fill="#4667e8"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
function SprintWorkloadChart({
  rows,
}: {
  rows: typeof raw.resourceAllocations;
}) {
  const d = Array.from(new Set(rows.map((r) => r.sprintId))).map((id) => {
    const sprintRows = rows.filter((r) => r.sprintId === id);
    return {
      sprint: id.replace("SPRINT-", "S"),
      available: sprintRows.reduce((n, r) => n + r.availableHours, 0),
      allocated: sprintRows.reduce((n, r) => n + r.allocatedHours, 0),
      actual: sprintRows.reduce((n, r) => n + r.actualHours, 0),
    };
  });
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={270}>
        <ComposedChart
          data={d}
          margin={{ left: 0, right: 8, top: 5, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#edf0f4"
          />
          <XAxis dataKey="sprint" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar
            dataKey="available"
            name="Available h"
            fill="#e1e7f0"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="allocated"
            name="Planned h"
            fill="#4667e8"
            radius={[4, 4, 0, 0]}
          />
          <Line
            dataKey="actual"
            name="Actual h"
            stroke="#46a78b"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
function StoryTable({
  stories,
  epics,
}: {
  stories: typeof raw.stories;
  epics: typeof raw.epics;
}) {
  const epicMap = Object.fromEntries(epics.map((e) => [e.epicId, e.name]));
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Story</th>
            <th>Epic</th>
            <th>Priority</th>
            <th>Points</th>
            <th>Sprint</th>
            <th>Status</th>
            <th>Acceptance criteria</th>
          </tr>
        </thead>
        <tbody>
          {stories.map((s) => (
            <tr key={s.storyId}>
              <td className="task-cell">
                <span className="id-cell">{s.storyId}</span>
                <br />
                {s.story}
              </td>
              <td>{epicMap[s.epicId]}</td>
              <td>{s.priority}</td>
              <td>
                <b>{s.storyPoints} SP</b>
              </td>
              <td>{s.sprintId.replace("SPRINT-", "S")}</td>
              <td>
                <Badge>{s.status}</Badge>
              </td>
              <td>{s.acceptanceCriteria}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function QualityChart({ quality }: { quality: typeof raw.quality }) {
  const d = quality.map((q) => ({
    month: q.observationDate.slice(5, 7),
    grounded: (q.groundedCount / q.answeredCount) * 100,
    escalation: (q.humanEscalations / q.sampleSize) * 100,
    latency: q.avgLatencySeconds,
  }));
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={270}>
        <ComposedChart
          data={d}
          margin={{ left: 0, right: 8, top: 5, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#edf0f4"
          />
          <XAxis dataKey="month" axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="left"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            unit="s"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip />
          <Line
            yAxisId="left"
            dataKey="grounded"
            name="Grounded rate"
            stroke="#4667e8"
            strokeWidth={3}
          />
          <Line
            yAxisId="left"
            dataKey="escalation"
            name="Human escalation"
            stroke="#56ae92"
            strokeWidth={2}
          />
          <Bar
            yAxisId="right"
            dataKey="latency"
            name="Avg latency"
            fill="#e4a75a"
            radius={[4, 4, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
function Definition({ title, formula }: { title: string; formula: string }) {
  return (
    <div className="definition">
      <b>{title}</b>
      <span>{formula}</span>
    </div>
  );
}
function downloadSnapshot(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pmo-dashboard-snapshot.json";
  a.click();
  URL.revokeObjectURL(url);
}
