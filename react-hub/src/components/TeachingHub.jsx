import React, { useState, useMemo, useCallback } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Hammer,
  Palette,
  CalendarDays,
  ClipboardList,
  Wrench,
  Globe,
  Bot,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  Users,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Layers,
  FileText,
  Video,
  Star,
  TrendingUp,
  Zap,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────── */

const todaySchedule = [
  {
    id: "p1",
    period: "Period 1",
    time: "7:55 – 8:43 AM",
    course: "Woodworking",
    courseShort: "WW",
    theme: "amber",
    unit: "Basic Box Project — Weeks 12–18",
    task: "Sketch project plan, review dimensions, complete cut-list approval before production.",
    status: "upcoming",
    students: 20,
    icon: Hammer,
    links: [
      { label: "Slides", href: "/ww-slides.html" },
      { label: "Workbook", href: "/ww-workbook.html" },
      { label: "Planner", href: "/planner.html?course=woodworking" },
    ],
  },
  {
    id: "p6",
    period: "Period 6",
    time: "1:05 – 1:53 PM",
    course: "Graphic Design",
    courseShort: "GD",
    theme: "indigo",
    unit: "Campaign & ACE Certification — Weeks 12–18",
    task: "Brand identity intro — discuss visual consistency, open GMetrix for baseline assessment.",
    status: "upcoming",
    students: 26,
    icon: Palette,
    links: [
      { label: "Slides", href: "/gd-slides.html" },
      { label: "Workbook", href: "/gd-workbook.html" },
      { label: "GMetrix", href: "https://www.gmetrix.net/", external: true },
    ],
  },
  {
    id: "p7",
    period: "Period 7",
    time: "1:57 – 2:45 PM",
    course: "Graphic Design",
    courseShort: "GD",
    theme: "indigo",
    unit: "Campaign & ACE Certification — Weeks 12–18",
    task: "Album Cover Studio — independent production time. Monitor pacing and progress.",
    status: "upcoming",
    students: 26,
    icon: Palette,
    links: [
      { label: "Slides", href: "/gd-slides.html" },
      { label: "Workbook", href: "/gd-workbook.html" },
    ],
  },
  {
    id: "p8",
    period: "Period 8",
    time: "2:49 – 3:37 PM",
    course: "Graphic Design",
    courseShort: "GD",
    theme: "indigo",
    unit: "Campaign & ACE Certification — Weeks 12–18",
    task: "Merch Production — extend brand to a second asset. Exit ticket: screenshot of draft.",
    status: "upcoming",
    students: 26,
    icon: Palette,
    links: [
      { label: "Slides", href: "/gd-slides.html" },
      { label: "Workbook", href: "/gd-workbook.html" },
    ],
  },
];

const tools = [
  {
    id: "planner",
    label: "Lesson Planner",
    description: "Full schedule with checkpoint tracker, edit panel, and print export.",
    icon: ClipboardList,
    href: "/planner.html",
    badge: "Live",
    badgeTone: "emerald",
    category: "Planning",
  },
  {
    id: "printable",
    label: "Printable Planner",
    description: "Browser-save planner with prefill, seat map, and clean print view.",
    icon: FileText,
    href: "/teaching-planner.html",
    badge: "Print",
    badgeTone: "slate",
    category: "Planning",
  },
  {
    id: "portal",
    label: "AI Prompt Hub",
    description: "Copy-ready Gemini & Genspark prompt shortcuts for teaching tasks.",
    icon: Bot,
    href: "/hub/",
    badge: "New",
    badgeTone: "indigo",
    category: "AI Tools",
  },
  {
    id: "companion",
    label: "Course Companion",
    description: "Navigate Woodworking and Graphic Design slides and workbooks.",
    icon: BookOpen,
    href: "/index.html",
    badge: "Hub",
    badgeTone: "amber",
    category: "Content",
  },
  {
    id: "ww-video",
    label: "WW Video Tool",
    description: "Woodworking video player with suggested pacing cues and teacher notes.",
    icon: Video,
    href: "/video-ww.html",
    badge: "WW",
    badgeTone: "amber",
    category: "Content",
  },
  {
    id: "gd-video",
    label: "GD Video Tool",
    description: "Graphic Design video player with ACE certification prep alignment.",
    icon: Video,
    href: "/video-gd.html",
    badge: "GD",
    badgeTone: "indigo",
    category: "Content",
  },
  {
    id: "gmetrix",
    label: "GMetrix Portal",
    description: "Live GMetrix login for ACE certification practice and assessment.",
    icon: Globe,
    href: "https://www.gmetrix.net/",
    external: true,
    badge: "Login",
    badgeTone: "indigo",
    category: "Certification",
  },
  {
    id: "checkpoints",
    label: "Checkpoint Tracker",
    description: "Track milestone completion for both courses across Weeks 12–18.",
    icon: CheckCircle2,
    href: "/planner.html#checkpointTracker",
    badge: "Track",
    badgeTone: "emerald",
    category: "Planning",
  },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "schedule", label: "Today's Schedule", icon: CalendarDays },
  { id: "tools", label: "Curriculum Tools", icon: Layers },
  { id: "ai-hub", label: "AI Prompt Hub", icon: Bot },
];

const courseNav = [
  {
    id: "woodworking",
    label: "Woodworking",
    short: "WW",
    theme: "amber",
    icon: Hammer,
    students: 20,
    period: "Period 1",
    slidesHref: "/ww-slides.html",
    workbookHref: "/ww-workbook.html",
  },
  {
    id: "graphic-design",
    label: "Graphic Design",
    short: "GD",
    theme: "indigo",
    icon: Palette,
    students: 26,
    period: "P6 / P7 / P8",
    slidesHref: "/gd-slides.html",
    workbookHref: "/gd-workbook.html",
  },
];

const studentSections = [
  { id: "ww-slides", label: "WW Slides", icon: Layers, href: "/ww-slides.html" },
  { id: "gd-slides", label: "GD Slides", icon: Layers, href: "/gd-slides.html" },
  { id: "ww-workbook", label: "WW Workbook", icon: BookOpen, href: "/ww-workbook.html" },
  { id: "gd-workbook", label: "GD Workbook", icon: BookOpen, href: "/gd-workbook.html" },
];

/* ─────────────────────────────────────────────────────────────
   THEME HELPERS
───────────────────────────────────────────────────────────── */

const themeMap = {
  amber: {
    badge: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
    icon: "bg-amber-500/15 text-amber-300",
    dot: "bg-amber-400",
    ring: "ring-amber-500/30",
    border: "border-amber-500/20",
    accent: "text-amber-300",
    pill: "bg-amber-500/10 text-amber-300",
    hover: "hover:border-amber-500/40",
    active: "border-amber-500/50 bg-amber-500/10",
  },
  indigo: {
    badge: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25",
    icon: "bg-indigo-500/15 text-indigo-300",
    dot: "bg-indigo-400",
    ring: "ring-indigo-500/30",
    border: "border-indigo-500/20",
    accent: "text-indigo-300",
    pill: "bg-indigo-500/10 text-indigo-300",
    hover: "hover:border-indigo-500/40",
    active: "border-indigo-500/50 bg-indigo-500/10",
  },
  emerald: {
    badge: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
    icon: "bg-emerald-500/15 text-emerald-300",
    dot: "bg-emerald-400",
    ring: "ring-emerald-500/30",
    border: "border-emerald-500/20",
    accent: "text-emerald-300",
    pill: "bg-emerald-500/10 text-emerald-300",
    hover: "hover:border-emerald-500/40",
    active: "border-emerald-500/50 bg-emerald-500/10",
  },
  slate: {
    badge: "bg-slate-700 text-slate-300 border border-slate-600",
    icon: "bg-slate-800 text-slate-300",
    dot: "bg-slate-400",
    ring: "ring-slate-500/30",
    border: "border-slate-700",
    accent: "text-slate-300",
    pill: "bg-slate-800 text-slate-300",
    hover: "hover:border-slate-600",
    active: "border-slate-600 bg-slate-800",
  },
};

function Badge({ tone = "slate", children }) {
  const t = themeMap[tone] || themeMap.slate;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${t.badge}`}>
      {children}
    </span>
  );
}

function StatusIcon({ status }) {
  if (status === "done") return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === "active") return <Zap className="w-4 h-4 text-amber-400" />;
  if (status === "warning") return <AlertCircle className="w-4 h-4 text-red-400" />;
  return <Circle className="w-4 h-4 text-slate-500" />;
}

/* ─────────────────────────────────────────────────────────────
   SCHEDULE CARD
───────────────────────────────────────────────────────────── */

function ScheduleCard({ item, isExpanded, onToggle }) {
  const t = themeMap[item.theme] || themeMap.slate;
  const Icon = item.icon;

  return (
    <div
      className={`rounded-2xl border bg-slate-900 transition-all duration-200 overflow-hidden ${t.border} ${t.hover}`}
    >
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        {/* Course icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 ${t.icon}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-400">{item.period}</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-500">{item.time}</span>
            <Badge tone={item.theme}>{item.courseShort}</Badge>
          </div>
          <div className="font-bold text-slate-100 text-sm leading-snug truncate pr-2">
            {item.course}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
            {item.task}
          </div>
        </div>

        {/* Expand indicator */}
        <ChevronRight
          className={`flex-shrink-0 w-4 h-4 text-slate-500 transition-transform duration-200 mt-1 ${isExpanded ? "rotate-90" : ""}`}
        />
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-800 pt-3 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5" />
            <span>{item.students} students</span>
            <span className="text-slate-600">·</span>
            <Clock className="w-3.5 h-3.5" />
            <span>48 min period</span>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Unit</div>
            <p className="text-xs text-slate-300 leading-relaxed">{item.unit}</p>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Today's Task</div>
            <p className="text-xs text-slate-300 leading-relaxed">{item.task}</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {item.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : "_self"}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${t.border} ${t.hover} text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-800`}
              >
                {link.label}
                {link.external && <ExternalLink className="w-3 h-3 opacity-60" />}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOOL CARD
───────────────────────────────────────────────────────────── */

function ToolCard({ tool }) {
  const t = themeMap[tool.badgeTone] || themeMap.slate;
  const Icon = tool.icon;

  return (
    <a
      href={tool.href}
      target={tool.external ? "_blank" : "_self"}
      rel={tool.external ? "noopener noreferrer" : undefined}
      className="group flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5">
          <Badge tone={tool.badgeTone}>{tool.badge}</Badge>
          {tool.external && (
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-400 transition-colors" />
          )}
        </div>
      </div>
      <div>
        <div className="font-bold text-slate-100 text-sm mb-1 group-hover:text-white transition-colors">
          {tool.label}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{tool.description}</p>
      </div>
    </a>
  );
}

/* ─────────────────────────────────────────────────────────────
   WELCOME BANNER
───────────────────────────────────────────────────────────── */

function WelcomeBanner({ currentCourse }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mb-2">
            CTE Master Hub — Spring 2026
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight leading-tight">
            Good morning, Mr. Burke
          </h2>
          <p className="text-sm text-slate-400 mt-1.5">
            {today} · Weeks 12–18 · 48-min periods · Carl Sandburg HS
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="amber">WW · 20 students</Badge>
          <Badge tone="indigo">GD · 26 students</Badge>
        </div>
      </div>

      {/* Quick stat row */}
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Periods Today", value: "4", icon: Clock, tone: "slate" },
          { label: "Total Students", value: "98", icon: Users, tone: "slate" },
          { label: "Active Units", value: "2", icon: BookOpen, tone: "amber" },
          { label: "Weeks Left", value: "7", icon: CalendarDays, tone: "indigo" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl bg-slate-800/50 border border-slate-700/50 px-3 py-2.5 flex items-center gap-2.5"
            >
              <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <div className="text-lg font-black text-slate-100 leading-none">{stat.value}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────────── */

function Sidebar({ activeTab, onTabChange, currentCourse, onCourseChange, isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full lg:h-auto z-40 lg:z-auto
          w-64 lg:w-56 xl:w-60
          bg-slate-950 border-r border-slate-800
          flex flex-col
          sidebar-transition
          ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Main navigation"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-500">CTE Master Hub</div>
            <div className="text-sm font-black text-slate-100">Mr. Burke</div>
          </div>
          <button
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
          {/* Main menu */}
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 px-2 mb-1.5">
              Main Menu
            </div>
            <ul className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => { onTabChange(item.id); onClose(); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150
                        ${isActive
                          ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                        }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Active Courses */}
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 px-2 mb-1.5">
              Active Courses
            </div>
            <ul className="space-y-0.5">
              {courseNav.map((course) => {
                const Icon = course.icon;
                const t = themeMap[course.theme];
                const isActive = currentCourse === course.id;
                return (
                  <li key={course.id}>
                    <button
                      onClick={() => onCourseChange(course.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150
                        ${isActive ? `${t.active} ${t.accent}` : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="text-xs font-bold leading-none">{course.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-normal">{course.period}</div>
                      </div>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${t.pill}`}>
                        {course.short}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Student-Facing */}
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 px-2 mb-1.5">
              Student-Facing
            </div>
            <ul className="space-y-0.5">
              {studentSections.map((section) => {
                const Icon = section.icon;
                return (
                  <li key={section.id}>
                    <a
                      href={section.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all duration-150"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {section.label}
                      <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="px-2 py-3 border-t border-slate-800 space-y-0.5">
          <a
            href="/planner.html"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            <ClipboardList className="w-4 h-4" />
            Planner
          </a>
          <a
            href="/index.html"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            <Globe className="w-4 h-4" />
            CTE Hub
          </a>
        </div>
      </aside>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOP HEADER
───────────────────────────────────────────────────────────── */

function TopHeader({ onMenuToggle, activeTab, currentCourse }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasNotif] = useState(true);

  const tabLabel = navItems.find((n) => n.id === activeTab)?.label || "Dashboard";

  return (
    <header className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="flex items-center gap-3 px-4 h-14">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          onClick={onMenuToggle}
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-bold text-slate-100 hidden sm:inline">{tabLabel}</span>
          {currentCourse && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
              <span className="text-slate-400 hidden sm:inline capitalize">
                {currentCourse.replace("-", " ")}
              </span>
            </>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-52 bg-slate-800/70 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:bg-slate-800 transition-all"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {hasNotif && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400" />
          )}
        </button>

        {/* User avatar */}
        <button
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black text-white transition-opacity hover:opacity-90"
          aria-label="User menu"
        >
          MB
        </button>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────
   SYSTEM STATUS NOTE
───────────────────────────────────────────────────────────── */

function SystemStatus() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-sm font-bold text-slate-200">System Status</span>
            <Badge tone="emerald">All Clear</Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Static package fully operational — no build step required. Curriculum data, hub render,
            and planner are live. Video assets require local files. GMetrix and Google Drive links
            require internet.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { label: "index.html", ok: true },
              { label: "planner.html", ok: true },
              { label: "teaching-planner.html", ok: true },
              { label: "AI Hub", ok: true },
              { label: "WW Video", ok: false, note: "local file" },
              { label: "GD Video", ok: false, note: "local file" },
            ].map((item) => (
              <span
                key={item.label}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border
                  ${item.ok
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
              >
                <span className={`w-1 h-1 rounded-full ${item.ok ? "bg-emerald-400" : "bg-slate-500"}`} />
                {item.label}
                {item.note && <span className="opacity-60">({item.note})</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DASHBOARD VIEW
───────────────────────────────────────────────────────────── */

function DashboardView({ currentCourse, onCourseChange }) {
  const [expandedCard, setExpandedCard] = useState(null);

  const toolCategories = useMemo(() => {
    const cats = {};
    tools.forEach((t) => {
      if (!cats[t.category]) cats[t.category] = [];
      cats[t.category].push(t);
    });
    return cats;
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <WelcomeBanner currentCourse={currentCourse} />

      {/* Today's schedule */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">
            Today's Schedule
          </h3>
          <span className="text-[10px] text-slate-600">
            {todaySchedule.length} periods
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {todaySchedule.map((item) => (
            <ScheduleCard
              key={item.id}
              item={item}
              isExpanded={expandedCard === item.id}
              onToggle={() => setExpandedCard(expandedCard === item.id ? null : item.id)}
            />
          ))}
        </div>
      </section>

      {/* Curriculum bundle grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">
            Curriculum Tools
          </h3>
          <span className="text-[10px] text-slate-600">{tools.length} tools</span>
        </div>
        {Object.entries(toolCategories).map(([category, categoryTools]) => (
          <div key={category} className="mb-5">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-2 px-0.5">
              {category}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* System status */}
      <SystemStatus />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCHEDULE VIEW (full)
───────────────────────────────────────────────────────────── */

function ScheduleView() {
  const [expandedCard, setExpandedCard] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">
          Today's Schedule
        </h3>
        <Badge tone="indigo">Spring 2026 — Wks 12–18</Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {todaySchedule.map((item) => (
          <ScheduleCard
            key={item.id}
            item={item}
            isExpanded={expandedCard === item.id}
            onToggle={() => setExpandedCard(expandedCard === item.id ? null : item.id)}
          />
        ))}
      </div>

      {/* Course detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {courseNav.map((course) => {
          const t = themeMap[course.theme];
          const Icon = course.icon;
          return (
            <div
              key={course.id}
              className={`rounded-2xl border ${t.border} bg-slate-900 p-4 space-y-3`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.icon}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className={`font-bold text-sm ${t.accent}`}>{course.label}</div>
                  <div className="text-xs text-slate-500">{course.period} · {course.students} students</div>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={course.slidesHref}
                  className={`flex-1 text-center px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${t.border} ${t.hover} text-slate-200 hover:text-white bg-slate-800/50`}
                >
                  Slides
                </a>
                <a
                  href={course.workbookHref}
                  className={`flex-1 text-center px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${t.border} ${t.hover} text-slate-200 hover:text-white bg-slate-800/50`}
                >
                  Workbook
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOOLS VIEW (full)
───────────────────────────────────────────────────────────── */

function ToolsView() {
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(tools.map((t) => t.category)))];

  const filtered = filter === "All" ? tools : tools.filter((t) => t.category === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mr-2">
          Curriculum Tools
        </h3>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              filter === cat
                ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/25"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
      <SystemStatus />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   AI HUB EMBED VIEW
───────────────────────────────────────────────────────────── */

function AIHubView() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 flex flex-col md:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-indigo-300" />
        </div>
        <div>
          <h3 className="font-black text-slate-100 text-base">AI Prompt Hub</h3>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">
            Copy-ready prompts for Gemini and Genspark — lesson planning, safe updates,
            file-aware workflows, daily teaching flows, and design generation.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="/react-hub/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest transition-colors"
            >
              Open AI Hub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { label: "Gemini Prompts", count: "9 prompts", icon: Star, tone: "amber" },
          { label: "Genspark Prompts", count: "2 prompts", icon: Zap, tone: "indigo" },
          { label: "Quick Copy Phrases", count: "7 shortcuts", icon: TrendingUp, tone: "emerald" },
          { label: "Saved Data", count: "Browser local", icon: Settings, tone: "slate" },
        ].map((item) => {
          const Icon = item.icon;
          const t = themeMap[item.tone];
          return (
            <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.icon}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-200">{item.label}</div>
                <div className="text-xs text-slate-500">{item.count}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN TEACHING HUB COMPONENT
───────────────────────────────────────────────────────────── */

export default function TeachingHub() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState("woodworking");

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  }, []);

  const handleCourseChange = useCallback((course) => {
    setCurrentCourse(course);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "schedule":
        return <ScheduleView />;
      case "tools":
        return <ToolsView />;
      case "ai-hub":
        return <AIHubView />;
      default:
        return <DashboardView currentCourse={currentCourse} onCourseChange={handleCourseChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentCourse={currentCourse}
        onCourseChange={handleCourseChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <TopHeader
          onMenuToggle={() => setSidebarOpen(true)}
          activeTab={activeTab}
          currentCourse={currentCourse}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
