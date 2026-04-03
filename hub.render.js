(function () {
  const C = window.CURRICULUM || {};
  const courseEntries = Object.entries(C.courses || {});
  const weeks = Object.entries(C.weeks || {})
    .map(([week, value]) => ({ week: Number(week), ...value }))
    .sort((a, b) => a.week - b.week);

  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
  const LONG_DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const PERIOD_META = {
    "1": { short: "WW", course: "woodworking" },
    "6": { short: "GD", course: "graphicDesign" },
    "7": { short: "GD", course: "graphicDesign" },
    "8": { short: "GD", course: "graphicDesign" }
  };
  const PERIOD_ORDER = ["", "1", "6", "7", "8"];

  const byId = (id) => document.getElementById(id);
  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function toIso(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function fromIso(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  }

  function monthName(date) {
    return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }

  function shortMonthDay(date) {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function weekdayDay(date) {
    return `${LONG_DAY_LABELS[date.getDay()]} ${date.getDate()}`;
  }

  function getWeekStart(date) {
    const start = new Date(date);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return start;
  }

  function getWeekdays(date) {
    const monday = getWeekStart(date);
    return [0, 1, 2, 3, 4].map((offset) => {
      const value = new Date(monday);
      value.setDate(monday.getDate() + offset);
      return value;
    });
  }

  function getMonthMatrix(viewDate) {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    const end = new Date(last);
    end.setDate(last.getDate() + (6 - last.getDay()));

    const days = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }

  function buildPlannerLink({ course, week, date } = {}) {
    const params = new URLSearchParams();
    if (course) params.set("course", course);
    if (week) params.set("week", String(week));
    if (date) params.set("date", date);
    const query = params.toString();
    return `${C.planner?.href || "planner.html"}${query ? `?${query}` : ""}`;
  }

  function buildPrintableLink({ course, week, date } = {}) {
    const params = new URLSearchParams();
    if (course) params.set("course", course);
    if (week) params.set("week", String(week));
    if (date) params.set("date", date);
    const query = params.toString();
    const href = C.planner?.printableHref || "teaching-planner.html";
    return `${href}${query ? `?${query}` : ""}`;
  }

  function linkAttrs(item) {
    return item && item.external ? ' target="_blank" rel="noopener noreferrer"' : "";
  }

  const dateEntries = weeks
    .flatMap((week) =>
      Object.entries(week.days || {}).map(([isoDate, dayMeta]) => ({
        isoDate,
        week: week.week,
        focus: week.focus || "",
        label: dayMeta.label || "",
        special: Boolean(dayMeta.special),
        note: dayMeta.note || "",
        lessons: Object.fromEntries(
          courseEntries.map(([courseKey]) => [courseKey, C.lessons?.[courseKey]?.[isoDate] || null])
        )
      }))
    )
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  const dateMap = new Map(dateEntries.map((entry) => [entry.isoDate, entry]));

  function todayIso() {
    return toIso(new Date());
  }

  function initialSelectedDate() {
    const hash = String(window.location.hash || "").replace("#", "").trim();
    if (dateMap.has(hash)) return hash;
    if (dateMap.has(todayIso())) return todayIso();
    return dateEntries[0]?.isoDate || "";
  }

  const state = {
    viewDate: dateEntries[0] ? fromIso(dateEntries[0].isoDate) : new Date(),
    selectedDate: initialSelectedDate(),
    selectedLessonId: null,
    level: "week",
    period: ""
  };

  if (state.selectedDate) {
    const selected = fromIso(state.selectedDate);
    state.viewDate = new Date(selected.getFullYear(), selected.getMonth(), 1);
  }

  function syncHash() {
    if (!state.selectedDate) return;
    const hash = `#${state.selectedDate}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }

  function lessonType(period, courseKey) {
    if (courseKey === "woodworking") return "project";
    if (period === "6") return "assignment";
    if (period === "7") return "project";
    return "quiz";
  }

  function lessonItemsFor(event) {
    if (event.course === "woodworking") {
      return [
        `Demo · ${event.title}`,
        "Build",
        event.locked ? "Locked" : "Check",
        "Exit"
      ];
    }

    return [
      "Warm-up",
      event.type === "quiz" ? "Practice Quiz" : event.title,
      event.type === "project" ? "Layout" : "Apply",
      "Submit"
    ];
  }

  function eventsForDate(isoDate, applyFilter = true) {
    const entry = dateMap.get(isoDate);
    if (!entry || entry.special) return [];

    const events = Object.entries(PERIOD_META).map(([period, meta]) => {
      const course = C.courses?.[meta.course];
      const lesson = entry.lessons?.[meta.course] || null;
      const title = lesson?.title || entry.focus || course?.name || "Open Plan";
      const type = lessonType(period, meta.course);
      const event = {
        id: `${isoDate}-${period}`,
        date: isoDate,
        period,
        course: meta.course,
        week: entry.week,
        type,
        title,
        locked: Boolean(lesson?.locked),
        printable: buildPrintableLink({ course: meta.course, week: entry.week, date: isoDate }),
        planner: buildPlannerLink({ course: meta.course, week: entry.week, date: isoDate }),
        slides: course?.resources?.slidesPage || "#",
        workbook: course?.resources?.workbookPage || "#",
        video: meta.course === "woodworking" ? "video-ww.html" : "video-gd.html",
        gmetrix: course?.resources?.gmetrix || "",
        drive: course?.resources?.driveFolder || ""
      };
      event.items = lessonItemsFor(event);
      return event;
    });

    if (!applyFilter || !state.period) return events;
    return events.filter((event) => event.period === state.period);
  }

  function getSelectedLesson() {
    if (!state.selectedLessonId) return null;
    const selected = eventsForDate(state.selectedDate, false).find((event) => event.id === state.selectedLessonId) || null;
    if (!selected) return null;
    if (state.period && selected.period !== state.period) return null;
    return selected;
  }

  function firstSelectableDateForMonth() {
    const year = state.viewDate.getFullYear();
    const month = state.viewDate.getMonth();
    const inMonth = dateEntries.filter((entry) => {
      const date = fromIso(entry.isoDate);
      return date.getFullYear() === year && date.getMonth() === month;
    });

    if (!inMonth.length) return "";

    const today = todayIso();
    const todayMatch = inMonth.find((entry) => entry.isoDate === today);
    if (todayMatch) return todayMatch.isoDate;

    return inMonth[0].isoDate;
  }

  function ensureSelectedDate() {
    if (!state.selectedDate || !dateMap.has(state.selectedDate)) {
      state.selectedDate = firstSelectableDateForMonth();
      state.selectedLessonId = null;
      return;
    }

    const selected = fromIso(state.selectedDate);
    if (
      selected.getFullYear() !== state.viewDate.getFullYear() ||
      selected.getMonth() !== state.viewDate.getMonth()
    ) {
      state.selectedDate = firstSelectableDateForMonth();
      state.selectedLessonId = null;
    }
  }

  function previewLinesForDate(isoDate) {
    const all = eventsForDate(isoDate, false);
    if (!all.length) return [];

    if (state.period) {
      return all
        .filter((event) => event.period === state.period)
        .slice(0, 2)
        .map((event) => `P${event.period} ${event.title}`);
    }

    const lines = [];
    const ww = all.find((event) => event.period === "1");
    const gd = all.find((event) => event.period === "6");
    if (ww) lines.push(`P1 ${ww.title}`);
    if (gd) lines.push(`P6 ${gd.title}`);
    return lines.slice(0, 2);
  }

  function visibleTypesForDate(isoDate) {
    const events = eventsForDate(isoDate);
    return [...new Set(events.map((event) => event.type))].slice(0, 3);
  }

  function renderRail() {
    const railPeriods = byId("rail-periods");
    const railActions = byId("rail-actions");
    const mobileNav = byId("mobile-nav");
    if (!railPeriods || !railActions || !mobileNav) return;

    railPeriods.innerHTML = PERIOD_ORDER.map((period) => {
      const label = period || "*";
      const active = period === state.period ? " is-active" : "";
      const aria = period ? `Period ${period}` : "All";
      return `<button class="rail-btn period-btn${active}" data-period="${period}" aria-label="${aria}">${escapeHtml(label)}</button>`;
    }).join("");

    railActions.innerHTML = `
      <a class="rail-btn" href="${escapeHtml(buildPlannerLink({ date: state.selectedDate }))}" aria-label="Planner">P</a>
      <a class="rail-btn" href="#teacherTools" aria-label="Random caller">R</a>
    `;

    mobileNav.innerHTML = PERIOD_ORDER.map((period) => {
      const label = period || "*";
      const active = period === state.period ? " is-active" : "";
      return `<button class="mobile-btn mobile-period${active}" data-period="${period}">${escapeHtml(label)}</button>`;
    }).join("");

    document.querySelectorAll(".period-btn, .mobile-period").forEach((button) => {
      button.addEventListener("click", () => {
        state.period = button.getAttribute("data-period") || "";
        state.selectedLessonId = null;
        state.level = "week";
        ensureSelectedDate();
        syncHash();
        renderAll();
      });
    });
  }

  function renderTopbar() {
    const mount = byId("topbar");
    if (!mount) return;

    mount.innerHTML = `
      <div class="topbar-left">
        <button class="icon-btn" id="prev-month" aria-label="Previous month">&larr;</button>
      </div>
      <div class="month-title" aria-live="polite">
        <span id="month-label">${escapeHtml(monthName(state.viewDate))}</span>
        <span class="month-status">${escapeHtml(C.meta?.statusText || "")}</span>
      </div>
      <div class="topbar-right">
        <button class="icon-btn" id="jump-today">Today</button>
        <button class="icon-btn" id="next-month" aria-label="Next month">&rarr;</button>
      </div>
    `;

    byId("prev-month")?.addEventListener("click", () => {
      state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() - 1, 1);
      state.selectedLessonId = null;
      state.level = "week";
      ensureSelectedDate();
      syncHash();
      renderAll();
    });

    byId("next-month")?.addEventListener("click", () => {
      state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() + 1, 1);
      state.selectedLessonId = null;
      state.level = "week";
      ensureSelectedDate();
      syncHash();
      renderAll();
    });

    byId("jump-today")?.addEventListener("click", () => {
      if (!dateMap.has(todayIso())) return;
      const today = fromIso(todayIso());
      state.viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
      state.selectedDate = todayIso();
      state.selectedLessonId = null;
      state.level = "week";
      syncHash();
      renderAll();
    });
  }

  function renderWeekdayHead() {
    const mount = byId("weekday-head");
    if (!mount) return;
    mount.innerHTML = DAY_LABELS.map((day) => `<div>${escapeHtml(day)}</div>`).join("");
  }

  function renderCalendar() {
    const mount = byId("calendar-grid");
    if (!mount) return;

    ensureSelectedDate();
    const month = state.viewDate.getMonth();
    const matrix = getMonthMatrix(state.viewDate);

    mount.innerHTML = matrix
      .map((date) => {
        const isoDate = toIso(date);
        const outside = date.getMonth() !== month;
        const entry = dateMap.get(isoDate) || null;
        const preview = previewLinesForDate(isoDate);
        const types = visibleTypesForDate(isoDate);
        const holiday = entry?.special ? (entry.note || "No school") : "";
        const classes = [
          "calendar-cell",
          outside ? "is-outside" : "",
          isoDate === state.selectedDate ? "is-selected" : "",
          isoDate === todayIso() ? "is-today" : "",
          holiday ? "is-holiday" : ""
        ].filter(Boolean).join(" ");

        return `
          <button class="${classes}" data-iso="${isoDate}" aria-label="${escapeHtml(date.toDateString())}">
            <div class="day-top">
              <span class="day-num">${date.getDate()}</span>
              ${holiday ? `<span class="day-note">${escapeHtml(holiday)}</span>` : ""}
            </div>
            <div class="day-preview">
              ${preview.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}
            </div>
            <div class="dot-row">
              ${types.map((type) => `<span class="dot ${escapeHtml(type)}"></span>`).join("")}
            </div>
          </button>
        `;
      })
      .join("");

    mount.querySelectorAll("[data-iso]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedDate = button.getAttribute("data-iso") || "";
        state.selectedLessonId = null;
        state.level = "week";
        syncHash();
        renderAll();
      });
    });
  }

  function renderCrumbs() {
    const mount = byId("crumbs");
    if (!mount) return;

    const selectedDate = state.selectedDate ? fromIso(state.selectedDate) : null;
    const lesson = getSelectedLesson();
    const items = [
      { key: "month", text: monthName(state.viewDate), current: state.level === "month" }
    ];

    if (selectedDate) {
      items.push({
        key: "week",
        text: shortMonthDay(getWeekStart(selectedDate)),
        current: state.level === "week"
      });

      if (state.level === "day" || state.level === "lesson") {
        items.push({
          key: "day",
          text: weekdayDay(selectedDate),
          current: state.level === "day"
        });
      }
    }

    if (lesson) {
      items.push({
        key: "lesson",
        text: `P${lesson.period} ${lesson.title}`,
        current: true
      });
    }

    mount.innerHTML = items
      .map((item, index) => {
        const separator = index > 0 ? `<span class="crumb">/</span>` : "";
        return `${separator}<button class="crumb${item.current ? " is-current" : ""}" data-crumb="${item.key}">${escapeHtml(item.text)}</button>`;
      })
      .join("");

    mount.querySelectorAll("[data-crumb]").forEach((button) => {
      button.addEventListener("click", () => {
        const crumb = button.getAttribute("data-crumb");
        if (crumb === "month") {
          state.level = "month";
          state.selectedLessonId = null;
        } else if (crumb === "week") {
          state.level = "week";
          state.selectedLessonId = null;
        } else if (crumb === "day") {
          state.level = "day";
          state.selectedLessonId = null;
        }
        renderDetail();
      });
    });
  }

  function renderWeekView() {
    const selected = state.selectedDate ? fromIso(state.selectedDate) : state.viewDate;
    const days = getWeekdays(selected);

    return `
      <div class="week-list">
        ${days.map((date) => {
          const isoDate = toIso(date);
          const entry = dateMap.get(isoDate);
          const lessons = eventsForDate(isoDate);
          const firstLine = previewLinesForDate(isoDate).join(" · ");
          const summary = entry?.special ? (entry.note || "No school") : (firstLine || entry?.focus || "—");
          return `
            <button class="week-row${isoDate === state.selectedDate ? " is-selected" : ""}" data-week-date="${isoDate}">
              <div class="row-line">
                <div class="row-title">${escapeHtml(weekdayDay(date))}</div>
                <div class="row-sub">${entry ? escapeHtml(`W${entry.week}`) : "—"}</div>
              </div>
              <div class="row-sub">${escapeHtml(summary)}</div>
              <div class="badge-row">
                ${lessons.slice(0, 3).map((lesson) => `<span class="chip"><span class="dot ${escapeHtml(lesson.type)}"></span>P${escapeHtml(lesson.period)}</span>`).join("")}
              </div>
            </button>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderDayView() {
    const entry = dateMap.get(state.selectedDate);
    if (!entry) {
      return `<div class="detail-empty">No date selected</div>`;
    }

    if (entry.special) {
      return `<div class="detail-empty">${escapeHtml(entry.note || "No school")}</div>`;
    }

    const lessons = eventsForDate(state.selectedDate);
    if (!lessons.length) {
      return `<div class="detail-empty">${escapeHtml(weekdayDay(fromIso(state.selectedDate)))}</div>`;
    }

    return `
      <div class="day-list">
        ${lessons.map((lesson) => `
          <button class="lesson-row" data-lesson-id="${escapeHtml(lesson.id)}">
            <div class="row-line">
              <div class="row-title">${escapeHtml(`P${lesson.period} ${lesson.title}`)}</div>
              <div class="row-sub">${escapeHtml(PERIOD_META[lesson.period].short)}</div>
            </div>
            <div class="row-sub">${escapeHtml(lesson.items.slice(0, 2).join(" · "))}</div>
            <div class="badge-row">
              <span class="chip"><span class="dot ${escapeHtml(lesson.type)}"></span>${escapeHtml(lesson.type)}</span>
              <span class="chip">W${escapeHtml(String(lesson.week))}</span>
            </div>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderLessonView() {
    const lesson = getSelectedLesson();
    if (!lesson) {
      state.level = "day";
      return renderDayView();
    }

    const extraLinks = [
      { label: "Plan", href: lesson.planner },
      { label: "Print", href: lesson.printable },
      { label: "Slides", href: lesson.slides },
      { label: "WB", href: lesson.workbook },
      { label: "Video", href: lesson.video }
    ];

    if (lesson.drive) {
      extraLinks.push({ label: "Drive", href: lesson.drive, external: true });
    }
    if (lesson.gmetrix) {
      extraLinks.push({ label: "GMetrix", href: lesson.gmetrix, external: true });
    }

    return `
      <div class="lesson-card">
        <div class="lesson-top">
          <div class="lesson-title">${escapeHtml(`P${lesson.period} ${lesson.title}`)}</div>
          <div class="lesson-meta">
            <span>${escapeHtml(weekdayDay(fromIso(lesson.date)))}</span>
            <span>·</span>
            <span>${escapeHtml(PERIOD_META[lesson.period].short)}</span>
            <span>·</span>
            <span>${escapeHtml(`W${lesson.week}`)}</span>
          </div>
        </div>

        <div class="lesson-items">
          ${lesson.items.map((item) => `<div class="lesson-item">${escapeHtml(item)}</div>`).join("")}
        </div>
      </div>

      <div class="dock">
        ${extraLinks.map((link) => `<a class="tool-link" href="${escapeHtml(link.href)}"${link.external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(link.label)}</a>`).join("")}
      </div>
    `;
  }

  function buildGlobalDock() {
    const mount = byId("dock");
    if (!mount) return;

    const lesson = getSelectedLesson();
    if (lesson) {
      mount.innerHTML = "";
      return;
    }

    const current = eventsForDate(state.selectedDate)[0];
    const links = [];

    if (current) {
      links.push(`<a class="tool-link" href="${escapeHtml(current.planner)}">Plan</a>`);
      links.push(`<a class="tool-link" href="${escapeHtml(current.printable)}">Print</a>`);
    } else {
      links.push(`<a class="tool-link" href="${escapeHtml(C.planner?.href || "planner.html")}">Plan</a>`);
      links.push(`<a class="tool-link" href="${escapeHtml(C.planner?.printableHref || "teaching-planner.html")}">Print</a>`);
    }

    links.push(`<a class="tool-link" href="ww-slides.html">WW</a>`);
    links.push(`<a class="tool-link" href="gd-slides.html">GD</a>`);
    links.push(`<a class="tool-link" href="ww-workbook.html">WW WB</a>`);
    links.push(`<a class="tool-link" href="gd-workbook.html">GD WB</a>`);
    links.push(`<a class="tool-link" href="video-ww.html">WW Vid</a>`);
    links.push(`<a class="tool-link" href="video-gd.html">GD Vid</a>`);

    if (C.courses?.graphicDesign?.resources?.gmetrix) {
      links.push(`<a class="tool-link" href="${escapeHtml(C.courses.graphicDesign.resources.gmetrix)}" target="_blank" rel="noopener noreferrer">GMetrix</a>`);
    }

    mount.innerHTML = links.join("");
  }

  function renderDetail() {
    renderCrumbs();

    const body = byId("detail-body");
    const backButton = byId("detail-back");
    if (!body || !backButton) return;

    if (state.level === "month") {
      body.innerHTML = `<div class="detail-empty">${escapeHtml(monthName(state.viewDate))}</div>`;
    } else if (state.level === "week") {
      body.innerHTML = renderWeekView();
      body.querySelectorAll("[data-week-date]").forEach((button) => {
        button.addEventListener("click", () => {
          state.selectedDate = button.getAttribute("data-week-date") || state.selectedDate;
          state.level = "day";
          state.selectedLessonId = null;
          syncHash();
          renderAll();
        });
      });
    } else if (state.level === "day") {
      body.innerHTML = renderDayView();
      body.querySelectorAll("[data-lesson-id]").forEach((button) => {
        button.addEventListener("click", () => {
          state.selectedLessonId = button.getAttribute("data-lesson-id") || "";
          state.level = "lesson";
          renderAll();
        });
      });
    } else {
      body.innerHTML = renderLessonView();
    }

    buildGlobalDock();

    backButton.disabled = state.level === "month";
    backButton.style.visibility = state.level === "month" ? "hidden" : "visible";
    backButton.onclick = () => {
      if (state.level === "lesson") {
        state.level = "day";
        state.selectedLessonId = null;
      } else if (state.level === "day") {
        state.level = "week";
      } else if (state.level === "week") {
        state.level = "month";
      }
      renderDetail();
    };
  }

  function renderStartup() {
    const mount = byId("startup");
    if (!mount) return;
    const notes = [];
    (C.startup?.cards || []).forEach((card) => {
      if (card.title) notes.push(card.title);
    });
    if (C.startup?.resetNote) notes.push("Clear browser storage to reset");

    mount.innerHTML = `
      <div class="mini-surface">
        <div class="mini-grid">
          ${notes.map((note) => `<span class="mini-link">${escapeHtml(note)}</span>`).join("")}
        </div>
      </div>
    `;
  }

  function renderQuickActions() {
    const mount = byId("quickActions");
    if (!mount) return;
    const items = C.quickActions?.items || [];
    mount.innerHTML = `
      <div class="mini-surface">
        <div class="mini-grid">
          ${items.map((item) => `<a class="mini-link" href="${escapeHtml(item.href || "#")}"${linkAttrs(item)}>${escapeHtml(item.title || "")}</a>`).join("")}
        </div>
      </div>
    `;
  }

  function renderCourses() {
    const mount = byId("courses");
    if (!mount) return;
    const selectedEntry = dateMap.get(state.selectedDate);

    mount.innerHTML = `
      <div class="mini-surface">
        <div class="course-grid">
          ${courseEntries.map(([courseKey, course]) => {
            const lesson = selectedEntry?.lessons?.[courseKey];
            const line = selectedEntry?.special
              ? (selectedEntry.note || "No school")
              : (lesson?.title || selectedEntry?.focus || course.sub || "");
            return `
              <div class="course-row">
                <div class="course-copy">
                  <div class="course-title">${escapeHtml(course.name)}</div>
                  <div class="course-note">${escapeHtml(line)} · ${escapeHtml(course.sub || "")}</div>
                </div>
                <div class="course-links">
                  <a class="mini-link" href="${escapeHtml(course.resources?.slidesPage || "#")}">Slides</a>
                  <a class="mini-link" href="${escapeHtml(course.resources?.workbookPage || "#")}">WB</a>
                  <a class="mini-link" href="${escapeHtml(buildPlannerLink({ course: courseKey, week: selectedEntry?.week, date: selectedEntry?.isoDate }))}">Plan</a>
                  ${course.resources?.driveFolder ? `<a class="mini-link" href="${escapeHtml(course.resources.driveFolder)}" target="_blank" rel="noopener noreferrer">Drive</a>` : ""}
                  ${course.resources?.gmetrix ? `<a class="mini-link" href="${escapeHtml(course.resources.gmetrix)}" target="_blank" rel="noopener noreferrer">GMetrix</a>` : ""}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function renderPlanner() {
    const mount = byId("planner");
    if (!mount) return;
    const selectedEntry = dateMap.get(state.selectedDate);
    const plannerHref = buildPlannerLink({ week: selectedEntry?.week, date: selectedEntry?.isoDate });
    const printableHref = buildPrintableLink({ week: selectedEntry?.week, date: selectedEntry?.isoDate });

    mount.innerHTML = `
      <div class="mini-surface">
        <div class="mini-row">
          <div>
            <p class="mini-title">${escapeHtml(C.planner?.title || "Master Lesson Planner")}</p>
            <div class="mini-note">${escapeHtml(selectedEntry ? `${selectedEntry.focus} · ${weekdayDay(fromIso(selectedEntry.isoDate))}` : (C.planner?.blurb || ""))}</div>
          </div>
          <div class="course-links">
            <a class="mini-link" href="${escapeHtml(plannerHref)}">${escapeHtml(C.planner?.cta || "Open Planner")}</a>
            <a class="mini-link" href="${escapeHtml(printableHref)}">${escapeHtml(C.planner?.printableCta || "Printable")}</a>
          </div>
        </div>
      </div>
    `;
  }

  function renderWeeks() {
    const mount = byId("weeks");
    if (!mount) return;
    const selectedEntry = dateMap.get(state.selectedDate);
    const checkpoint = (C.quickActions?.items || []).find((item) => item.href === "planner.html#checkpointTracker");

    mount.innerHTML = `
      <div class="mini-surface">
        <div class="mini-row">
          <div class="mini-note">${escapeHtml(selectedEntry ? `W${selectedEntry.week} · ${selectedEntry.focus}` : "")}</div>
          <div class="course-links">
            ${checkpoint ? `<a class="mini-link" href="${escapeHtml(checkpoint.href)}">Tracker</a>` : ""}
          </div>
        </div>
      </div>
    `;
  }

  function renderFooter() {
    const mount = byId("footer");
    if (!mount) return;
    mount.innerHTML = `<div class="hub-footer">${escapeHtml(C.footer || "")}</div>`;
  }

  function renderAll() {
    renderRail();
    renderTopbar();
    renderWeekdayHead();
    renderCalendar();
    renderDetail();
    renderStartup();
    renderQuickActions();
    renderCourses();
    renderPlanner();
    renderWeeks();
    renderFooter();
  }

  window.addEventListener("hashchange", () => {
    const hash = String(window.location.hash || "").replace("#", "").trim();
    if (dateMap.has(hash)) {
      state.selectedDate = hash;
      const selected = fromIso(hash);
      state.viewDate = new Date(selected.getFullYear(), selected.getMonth(), 1);
      state.selectedLessonId = null;
      state.level = "week";
      renderAll();
    }
  });

  syncHash();
  renderAll();
})();
