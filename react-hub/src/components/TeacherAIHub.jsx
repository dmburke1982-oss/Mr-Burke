import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEYS = {
  selectedId: "teacher-ai-hub:selected-id",
  formValues: "teacher-ai-hub:form-values"
};

const prompts = [
  {
    id: "gemini-mini-app",
    title: "Build a Mini App",
    tool: "Gemini",
    category: "Build",
    note: "Create a one-file teacher tool.",
    text: `Create a standalone mini web app as an editable code artifact/canvas in this chat.

Requirements:
- Build the actual runnable app, not an explanation
- Use a single self-contained file
- If HTML: put all HTML, CSS, and JavaScript in one .html file
- If React: put all components and logic in one .jsx file
- Keep it clean, editable, and easy to revise
- Give me an editable code view and live preview if supported

App details:
- Objective: {{objective}}
- Data: {{data}}
- Layout: {{layout}}
- Interactivity: {{interactivity}}

Do not summarize first.
Generate the app.`,
    fields: [
      { key: "objective", label: "Objective", value: "A simple teacher-facing AI hub for class tools and prompt shortcuts." },
      { key: "data", label: "Data", value: "Gemini prompt blocks, Genspark prompt templates, and copy-ready teacher shortcuts." },
      { key: "layout", label: "Layout", value: "Simple dashboard with big buttons, a short prompt list, and one main prompt panel." },
      { key: "interactivity", label: "Interactivity", value: "Choose a prompt, edit a few fields, and copy the final prompt." }
    ]
  },
  {
    id: "gemini-safe-update",
    title: "Safely Update Existing Tool",
    tool: "Gemini",
    category: "Update",
    note: "Update without redesigning.",
    text: `I need you to update my existing system safely.

Important:
- Do not rebuild it from scratch
- Do not redesign it
- Do not remove current features
- Do not make it less useful
- Preserve the current layout, logic, formatting, and structure unless I explicitly approve a change

Your job is to make the smallest safe changes necessary.

Before making changes:
1. Review the current system
2. Tell me what you will preserve
3. Tell me what you will update
4. Ask questions if anything is unclear
5. Then make the minimal safe update`,
    fields: []
  },
  {
    id: "gemini-active-files",
    title: "Use Uploaded Files First",
    tool: "Gemini",
    category: "Files",
    note: "Force file-aware work before edits.",
    text: `Use all files uploaded in this chat as active source material.

Requirements:
- Read and use every uploaded file you can access
- List the files you can currently access by filename
- Briefly describe what each file appears to be
- Tell me if any file is unreadable or limited
- Use those files together with the chat history in future responses
- Do not ask me to re-upload files unless access has actually failed

Before making important updates, tell me which uploaded files you are relying on.
Then wait for my next instruction.`,
    fields: []
  },
  {
    id: "gemini-planner-update",
    title: "Update Lesson Planner",
    tool: "Gemini",
    category: "Planning",
    note: "Shift or align planner safely.",
    text: `I need you to safely update my lesson planner.

Important:
- Do not rebuild it
- Do not remove features
- Do not damage current usefulness
- Preserve class separation
- Preserve working lock/unlock logic unless I approve a change

Update requirements:
- Align the planner to the attached district calendar
- Use instructional days only
- Skip holidays, no-school days, and weekends
- Keep the current day if possible
- Do not auto-shift completed days unless I explicitly choose to
- Allow unlocked lessons to shift forward while leapfrogging locked days and no-school days
- Locked lessons must never be moved or overwritten

Before applying changes:
1. summarize your understanding
2. tell me exactly what you will change
3. ask if anything is unclear
4. then make the minimal safe update`,
    fields: []
  },
  {
    id: "gemini-daily-teaching-workflow",
    title: "Daily Teaching Workflow",
    tool: "Gemini",
    category: "Planning",
    note: "Plan one class period with the daily workflow built in.",
    text: `Create a teacher-ready daily lesson using this fixed daily teaching workflow.

Apply these constraints:
- Plan one class period only
- Preserve provided standards or objectives; do not invent broader goals
- Align every activity to the lesson objective
- Default to 45-50 minutes unless told otherwise
- Prefer clarity and teachability over novelty

Build the lesson in this order:
1. Write the daily learning objective
   - Use "Students will be able to..."
   - Keep it measurable within one class period
   - Make it specific enough to assess at the end of class
2. Define success criteria
   - Provide 2-3 observable indicators of success
   - Keep wording student-friendly and concrete
   - Tie each criterion directly to the objective
3. Plan the warm-up
   - Allocate about 5 minutes
   - Activate prior knowledge or preview the core skill
   - Make it quick to start independently
4. Plan the mini-lesson
   - Allocate about 10 minutes
   - Model, explain, or demonstrate the key skill
   - Keep instruction focused on what students must do later on their own
5. Plan guided practice
   - Allocate about 10 minutes
   - Have students practice with teacher support
   - Include one or more checks for understanding
6. Plan independent work
   - Allocate about 15-20 minutes
   - Have students apply the skill independently
   - Note what the teacher monitors, prompts, or confers on
7. Plan the exit ticket
   - Allocate about 5 minutes
   - Use one short task that directly measures the objective
   - Make the evidence collectable or clearly observable
8. List materials and prep
   - Include only what is required for today
   - Separate teacher prep from student materials when useful
9. Add teacher notes when needed
   - Note timing adjustments
   - Note likely misconceptions or classroom management issues
   - Note any safety or setup reminders

Use this class:
{{course}}

Use this lesson focus:
{{lessonFocus}}

Use this required objective or standard:
{{objective}}

Use these materials or constraints:
{{materials}}

Output format:
- Use headings and flat bullets
- Keep language teacher-facing
- Make the final output ready to teach without rewriting
- Omit meta commentary`,
    fields: [
      { key: "course", label: "Course", value: "Woodworking" },
      { key: "lessonFocus", label: "Lesson Focus", value: "Basic Box Construction — sketch, plan, and approve a cut list." },
      { key: "objective", label: "Objective / Standard", value: "Students will be able to create and label a complete project plan before beginning production." },
      { key: "materials", label: "Materials / Constraints", value: "Project template, pencils, rulers, sample box, and a 48-minute class period." }
    ]
  },
  {
    id: "gemini-teaching-workflow",
    title: "Teaching Workflow Plan",
    tool: "Gemini",
    category: "Planning",
    note: "Use the full teaching workflow for planning or revision.",
    text: `Use this teaching workflow to plan, revise, or reflect on instruction.

Use this workflow for instructional planning:
- Start with outcomes, not activities
- Optimize for understanding, not coverage
- Assume diverse learners and plan supports explicitly
- Prefer clarity unless creativity directly improves clarity or access

Work in this order:
1. Define the learning objective
   - Use "Students will be able to..."
   - Keep the objective measurable and specific
   - Match the scope to the requested lesson, unit, or assessment
2. Define success criteria
   - Provide 2-4 observable indicators of success
   - Use actions students can demonstrate, explain, create, or solve
   - Keep criteria aligned to the objective
3. Identify prior knowledge and likely gaps
   - State what students should already know
   - Call out likely misconceptions, missing vocabulary, or prerequisite gaps
   - Use this section to shape supports and pacing
4. Build the instructional sequence
   - Plan a hook or engagement move
   - Plan direct instruction, modeling, or explanation
   - Plan guided practice with teacher support
   - Plan independent practice or application
   - Plan one or more checks for understanding during the sequence
5. Specify differentiation
   - Add supports for students who need more scaffolding
   - Add extensions for students who are ready for more complexity
   - Add language, accessibility, or modality supports when relevant
6. Specify assessment
   - State how formative assessment happens during instruction
   - State how summative assessment happens when applicable
   - Keep assessment evidence aligned to the objective and success criteria
7. List materials and prep
   - List resources, handouts, tools, or texts required
   - Note any teacher setup or preparation steps
8. Reflect after teaching
   - Record what worked
   - Record what did not work
   - Record what to change the next time

Use this scope:
{{scope}}

Use this topic or unit:
{{topic}}

Use this target objective:
{{objective}}

Use these known learner needs or constraints:
{{learnerNeeds}}

Format the output with headings and flat bullets. Keep it teacher-ready and specific.`,
    fields: [
      { key: "scope", label: "Scope", value: "Single lesson with post-teaching reflection notes" },
      { key: "topic", label: "Topic / Unit", value: "Photoshop campaign branding workflow" },
      { key: "objective", label: "Objective", value: "Students will be able to explain and apply a consistent visual branding system across one campaign asset." },
      { key: "learnerNeeds", label: "Learner Needs / Constraints", value: "Mixed pacing, some students need vocabulary support, and class meets for 48 minutes." }
    ]
  },
  {
    id: "gemini-class-template-pdf",
    title: "Fill Class Template PDF",
    tool: "Gemini",
    category: "Template",
    note: "Use Class_Template.pdf as the source template before writing.",
    text: `Use the uploaded file named Class_Template.pdf as active source material.

Requirements:
- Read Class_Template.pdf first
- Preserve its section order, headings, and classroom structure as closely as possible
- Use the template as the organizing format for the final output
- If any part of the PDF is unreadable, say exactly what is limited before continuing
- Do not redesign the template into a different format unless I explicitly ask

Instructional workflow requirements:
- Start with the lesson objective
- Add success criteria
- Include prior knowledge or likely gaps when relevant
- Build a teacher-ready sequence
- Add differentiation, assessment, materials, and teacher notes if the template has space for them
- Keep the result ready to use in class

Use this class:
{{course}}

Use this lesson or unit:
{{lessonFocus}}

Use this objective:
{{objective}}

Use this additional context:
{{notes}}

Before finalizing, briefly confirm that you used Class_Template.pdf as the source template.`,
    fields: [
      { key: "course", label: "Course", value: "Woodworking" },
      { key: "lessonFocus", label: "Lesson / Unit", value: "Basic Box Construction — plan, measure, and prepare for cuts." },
      { key: "objective", label: "Objective", value: "Students will be able to produce a complete project sketch with labeled dimensions and an approved process plan." },
      { key: "notes", label: "Additional Context", value: "Keep it teacher-ready, concise, and aligned to one class period unless the template clearly supports more." }
    ]
  },
  {
    id: "gemini-template-skill-output",
    title: "Template Skill Output",
    tool: "Gemini",
    category: "Structure",
    note: "Force Goal / Inputs / Process / Output structure.",
    text: `Produce the response using this exact structure and no skipped sections.

Follow this sequence:
1. Identify the goal of the task
2. Gather required inputs
3. Apply the standard output structure
4. Check for completeness and clarity
5. Deliver the final output without extra explanation unless requested

Use this output shape:

Goal
- State what the deliverable must accomplish

Inputs
- List required information
- List assumptions only when they affect the result

Process
- Show the execution steps in order
- Show key decisions when they materially affect the output

Output
- Present the final result ready to use

Keep the style tight:
- Prefer headings over long prose
- Prefer bullets over paragraphs
- Do not skip sections
- Do not add filler

Use this task:
{{goal}}

Use these required inputs:
{{inputs}}

Use this preferred deliverable:
{{deliverable}}`,
    fields: [
      { key: "goal", label: "Goal", value: "Turn a loose teaching request into a clean ready-to-use deliverable." },
      { key: "inputs", label: "Inputs", value: "Course, objective, constraints, materials, dates, and any required files." },
      { key: "deliverable", label: "Deliverable", value: "A structured classroom-ready lesson, worksheet, or planning output." }
    ]
  },
  {
    id: "gemini-cte-hub-generate-code",
    title: "Generate CTE Hub Code",
    tool: "Gemini",
    category: "Design",
    note: "Write actual HTML/CSS for the chosen CTE Master Hub design.",
    text: `Write the actual code for my CTE Master Hub website based on the design direction below.

Requirements:
- Generate real HTML/CSS code, not just advice
- Use my existing Tailwind setup
- Keep the code clean and production-ready
- Preserve working functionality unless I explicitly ask to remove something
- Use a light theme if requested
- Avoid filler explanation before the code unless a short implementation note is necessary

Project details:
- Preferred design: {{preferredDesign}}
- Main focus area: {{mainFocus}}
- Navigation structure: {{navigation}}
- Existing period structure: {{periods}}
- Extra constraints: {{constraints}}

If the request implies a full rebuild, generate a complete new index.html.
If it implies a partial upgrade, preserve the current system and update only the needed parts.`,
    fields: [
      { key: "preferredDesign", label: "Preferred Design", value: "High-fidelity light dashboard with a compact calendar and a cleaner teacher-facing layout." },
      { key: "mainFocus", label: "Main Focus", value: "Monthly calendar as the main focal point with quick access to teaching tools." },
      { key: "navigation", label: "Navigation Structure", value: "Drill-down flow from month to week to day to lesson." },
      { key: "periods", label: "Periods", value: "P1, P6, P7, and P8" },
      { key: "constraints", label: "Extra Constraints", value: "Zero unnecessary labels, keep it compact, and preserve Tailwind-based implementation." }
    ]
  },
  {
    id: "gemini-cte-hub-css-update",
    title: "CTE Hub CSS Update",
    tool: "Gemini",
    category: "Design",
    note: "Generate targeted CSS and markup updates for the existing index.html.",
    text: `I want targeted CSS and markup updates for my existing CTE Master Hub, not a full rebuild.

Important:
- Do not rewrite the entire site unless absolutely necessary
- Preserve current functionality and existing Tailwind structure
- Focus on compact visual cleanup and practical update snippets
- Keep the output implementation-ready

Apply this visual direction:
- Light theme
- Warm white background
- Muted gray text
- Soft dividers
- Indigo accent for "today"
- Blue, coral, and sage utility dots
- Remove glow-heavy effects
- Tighten spacing
- Remove unnecessary UI labels where possible

Use this target file:
{{targetFile}}

Use this preferred changeset:
{{changeSet}}

Use this implementation style:
{{implementationStyle}}

Return:
1. the key CSS changes
2. any matching HTML/Tailwind class updates
3. short notes on where each change should be applied`,
    fields: [
      { key: "targetFile", label: "Target File", value: "index.html" },
      { key: "changeSet", label: "Preferred Changes", value: "Light theme, tighter spacing, no glow effects, and fewer labels." },
      { key: "implementationStyle", label: "Implementation Style", value: "Minimal safe updates to the current file rather than a redesign." }
    ]
  },
  {
    id: "gemini-cte-hub-drilldown",
    title: "Build Drill-Down Navigation",
    tool: "Gemini",
    category: "Navigation",
    note: "Generate the month → week → day → lesson navigation pattern.",
    text: `Show me how to implement drill-down navigation in my CTE Master Hub.

Goal:
- Build a clear navigation pattern from month to week to day to lesson
- Keep it practical for a teacher-facing dashboard
- Preserve current site usefulness
- Make the implementation understandable and directly buildable

Requirements:
- Explain the data structure needed
- Explain the state or routing logic needed
- Show the JavaScript or React pattern clearly
- Keep the UI compact and easy to scan
- Fit the pattern into an existing Tailwind-based site

Use this current site context:
{{siteContext}}

Use this preferred entry point:
{{entryPoint}}

Use this lesson structure:
{{lessonStructure}}

Return:
1. the navigation model
2. the component/state pattern
3. the key implementation steps
4. code when useful`,
    fields: [
      { key: "siteContext", label: "Site Context", value: "Teacher-facing CTE Master Hub with calendar views, prompt tools, and planner links." },
      { key: "entryPoint", label: "Entry Point", value: "Month view first" },
      { key: "lessonStructure", label: "Lesson Structure", value: "Month → Week → Day → Lesson detail" }
    ]
  },
  {
    id: "genspark-student-sheet",
    title: "Make Student Planning Sheet",
    tool: "Genspark",
    category: "Worksheet",
    note: "Create a printable student worksheet.",
    text: `Create a clean student planning sheet for high school students.

Goal:
- Make a one-page printable planning sheet students can fill out before production begins.
- Keep the layout teacher-friendly, simple, and easy to print.
- Match the look of a traditional classroom worksheet.

Style:
- Black-and-white friendly
- Bold section headers
- Clear boxes for writing and sketching
- High school CTE classroom tone
- Large sketch area with labels

Structure:
- Title at top
- Name / Period / Date line
- Section 1: Sketch area with directions to draw and label the project
- Section 2: Dimensions / measurements table
- Section 3: Materials / tools list
- Section 4: Process steps or plan
- Section 5: Teacher approval / checkpoint box

Use this title:
{{worksheetTitle}}

Use this subtitle or note:
{{worksheetNote}}

Target class:
{{targetClass}}

Keep it printable and ready for students to use.`,
    fields: [
      { key: "worksheetTitle", label: "Worksheet Title", value: "WWMM Basic Box — Day 1 Planning Sheet" },
      { key: "worksheetNote", label: "Subtitle / Note", value: "Plan before you cut." },
      { key: "targetClass", label: "Target Class", value: "Graphic Design or Woodworking" }
    ]
  },
  {
    id: "genspark-slide-deck",
    title: "Make Worksheet Slide Deck",
    tool: "Genspark",
    category: "Slides",
    note: "Create a teacher demo deck.",
    text: `Create a slide deck that teaches students how to complete the attached worksheet well.

Goal:
- Make a teacher presentation I can use to walk students through each section.
- Show strong examples of what a good response looks like.
- Anticipate common misunderstandings and weak answers.
- Keep the slides classroom-ready and easy to present.

Audience:
- High school students in {{course}}

Slide requirements:
- Opening slide with the purpose of the worksheet
- One slide for each section of the worksheet
- For each section include:
  - what students are being asked to do
  - what a strong answer includes
  - common mistakes or misunderstandings
  - teacher tips or reminders
- End with a final checklist slide

Tone:
- Direct
- Student-friendly
- Visual and easy to scan

Special note:
- I want ideas for how students should answer the questions, not just a reading of the worksheet.
- Build it so I can present and explain expectations clearly.`,
    fields: [{ key: "course", label: "Course", value: "Graphic Design" }]
  }
];

const starterPrompts = [
  {
    label: "Keep same design",
    text: `This is an update task, not a redesign task.

Preserve the current aesthetic exactly or as closely as possible:
- same layout
- same color palette
- same typography style
- same spacing
- same card shapes
- same hierarchy
- same visual tone

Do not:
- modernize it
- improve the aesthetic
- simplify it visually
- introduce a new style
- make it look like a different product

Update only the dates, information, and required logic.`
  },
  {
    label: "Do the task now",
    text: `Do not explain.
Do the task now in the requested format.
Ask only if something is truly unclear.`
  },
  {
    label: "Separate console",
    text: `I do not want you to update or extend the system architecture interface.

I want a new, separate, standalone console.

Important:
- Do not build this inside the existing architecture UI
- Do not make it a control panel
- Do not make it a developer dashboard
- Do not merge it with the system view

This must be a separate classroom-facing console/interface.

Preserve the existing visual identity, but create it as its own standalone artifact/file.`
  },
  {
    label: "Use class template PDF",
    text: `Use the uploaded file named Class_Template.pdf as active source material.

Preserve its section order and headings as closely as possible.
Do not redesign the template into a new format.
If any part of the PDF is unreadable, say what is limited before continuing.`
  },
  {
    label: "Follow teaching workflow",
    text: `Use a strict instructional workflow.

Start with the objective.
Then success criteria.
Then prior knowledge and likely gaps.
Then instructional sequence.
Then differentiation.
Then assessment.
Then materials and prep.
Then reflection if relevant.

Use headings and flat bullets.`
  },
  {
    label: "Zero UI labels",
    text: `Remove unnecessary UI labels and micro-headings where they do not add meaning.

Keep the interface clean and obvious from structure alone.
Preserve usability, but avoid extra label noise.`
  },
  {
    label: "Light theme CTE hub",
    text: `Use a minimal light theme.

Direction:
- warm white background
- muted gray text
- soft borders
- indigo accent for today
- subtle blue, coral, and sage utility accents
- compact spacing
- no glow-heavy effects`
  }
];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function buildInitialFormValues() {
  const initial = {};
  prompts.forEach((prompt) => {
    prompt.fields.forEach((field) => {
      initial[`${prompt.id}:${field.key}`] = field.value || "";
    });
  });
  return initial;
}

function mergeStoredFormValues(storedValues) {
  const initial = buildInitialFormValues();

  if (!storedValues || typeof storedValues !== "object" || Array.isArray(storedValues)) {
    return initial;
  }

  const allowedKeys = new Set(Object.keys(initial));

  Object.entries(storedValues).forEach(([key, value]) => {
    if (allowedKeys.has(key) && typeof value === "string") {
      initial[key] = value;
    }
  });

  return initial;
}

function getInitialSelectedId() {
  const fallback = prompts[0]?.id || "";

  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.selectedId);
    const validIds = new Set(prompts.map((prompt) => prompt.id));
    return stored && validIds.has(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

function getInitialFormValues() {
  const fallback = buildInitialFormValues();

  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.formValues);
    return stored ? mergeStoredFormValues(JSON.parse(stored)) : fallback;
  } catch {
    return fallback;
  }
}

function applyTemplate(text, fields, formValues, promptId) {
  let output = text;
  fields.forEach((field) => {
    const value = formValues[`${promptId}:${field.key}`] ?? "";
    output = output.replaceAll(`{{${field.key}}}`, value);
  });
  return output;
}

function runSelfTests() {
  const tests = [];

  const initial = buildInitialFormValues();
  tests.push({
    name: "buildInitialFormValues returns expected seeded value",
    pass: initial["gemini-mini-app:objective"] === "A simple teacher-facing AI hub for class tools and prompt shortcuts."
  });

  const rendered = applyTemplate(
    "Hello {{name}} from {{place}}",
    [{ key: "name" }, { key: "place" }],
    {
      "demo:name": "Mr. Burke",
      "demo:place": "class"
    },
    "demo"
  );
  tests.push({
    name: "applyTemplate replaces multiple placeholders",
    pass: rendered === "Hello Mr. Burke from class"
  });

  const untouched = applyTemplate("No placeholders here", [], {}, "demo");
  tests.push({
    name: "applyTemplate leaves plain text unchanged",
    pass: untouched === "No placeholders here"
  });

  const merged = mergeStoredFormValues({
    "gemini-mini-app:objective": "Saved value",
    "not-a-real-key": "Ignore this"
  });
  tests.push({
    name: "mergeStoredFormValues keeps valid keys only",
    pass:
      merged["gemini-mini-app:objective"] === "Saved value" &&
      merged["gemini-mini-app:data"] === "Gemini prompt blocks, Genspark prompt templates, and copy-ready teacher shortcuts." &&
      merged["not-a-real-key"] === undefined
  });

  return tests;
}

function StatusPill({ children, tone = "slate" }) {
  const tones = {
    amber: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
    indigo: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
    slate: "bg-slate-800 text-slate-300 border border-slate-700",
    emerald: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

export default function TeacherAIHub() {
  const [selectedId, setSelectedId] = useState(() => getInitialSelectedId());
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState("");
  const [dataMessage, setDataMessage] = useState("");
  const [formValues, setFormValues] = useState(() => getInitialFormValues());

  const filteredPrompts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return prompts;
    return prompts.filter((item) => {
      const haystack = [item.title, item.tool, item.category, item.note, item.text].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [search]);

  const selected =
    filteredPrompts.find((item) => item.id === selectedId) ||
    prompts.find((item) => item.id === selectedId) ||
    prompts[0];

  const output = useMemo(() => {
    if (!selected) return "";
    return applyTemplate(selected.text, selected.fields, formValues, selected.id);
  }, [selected, formValues]);

  const selfTests = useMemo(() => runSelfTests(), []);
  const passedCount = selfTests.filter((test) => test.pass).length;

  useEffect(() => {
    if (!canUseStorage()) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEYS.selectedId, selectedId);
    } catch {}
  }, [selectedId]);

  useEffect(() => {
    if (!canUseStorage()) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEYS.formValues, JSON.stringify(formValues));
    } catch {}
  }, [formValues]);

  function showDataMessage(message) {
    setDataMessage(message);
    window.setTimeout(() => setDataMessage(""), 1800);
  }

  function updateField(promptId, key, value) {
    setFormValues((prev) => ({ ...prev, [`${promptId}:${key}`]: value }));
  }

  function resetSavedData() {
    const nextSelectedId = prompts[0]?.id || "";
    const nextFormValues = buildInitialFormValues();

    if (canUseStorage()) {
      try {
        window.localStorage.removeItem(STORAGE_KEYS.selectedId);
        window.localStorage.removeItem(STORAGE_KEYS.formValues);
      } catch {}
    }

    setSelectedId(nextSelectedId);
    setFormValues(nextFormValues);
    showDataMessage("Saved data reset");
  }

  function exportSavedData() {
    const payload = {
      version: 1,
      selectedId,
      formValues,
      exportedAt: new Date().toISOString()
    };

    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "teacher-ai-hub-prompts.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showDataMessage("Exported JSON");
    } catch {
      showDataMessage("Export failed");
    }
  }

  async function importSavedData(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const validIds = new Set(prompts.map((prompt) => prompt.id));
      const nextSelectedId = typeof parsed?.selectedId === "string" && validIds.has(parsed.selectedId) ? parsed.selectedId : prompts[0]?.id || "";
      const nextFormValues = mergeStoredFormValues(parsed?.formValues);

      setSelectedId(nextSelectedId);
      setFormValues(nextFormValues);
      showDataMessage("Imported JSON");
    } catch {
      showDataMessage("Import failed");
    }
  }

  async function copyToClipboard(text, key) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1200);
    } catch {
      setCopied(`${key}-error`);
      setTimeout(() => setCopied(""), 1200);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-20 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Teacher AI Hub</div>
            <h1 className="text-2xl font-black tracking-tight">Prompt Shortcuts</h1>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full md:w-64 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        <aside className="space-y-6">
          <section className="rounded-[1.75rem] border border-slate-800 bg-slate-900 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mb-3">Main Tools</div>
            <div className="space-y-2">
              {filteredPrompts.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left rounded-2xl border px-4 py-3 transition ${
                    selected?.id === item.id ? "border-indigo-500/50 bg-indigo-500/10" : "border-slate-800 bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-white leading-tight">{item.title}</span>
                    <StatusPill tone={item.tool === "Gemini" ? "amber" : "indigo"}>{item.tool}</StatusPill>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{item.note}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-800 bg-slate-900 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mb-3">Quick Copy</div>
            <div className="space-y-2">
              {starterPrompts.map((item) => (
                <button
                  key={item.label}
                  onClick={() => copyToClipboard(item.text, item.label)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-left text-sm font-bold hover:border-slate-700"
                >
                  {copied === item.label ? "Copied" : item.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-800 bg-slate-900 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mb-3">Saved Data</div>
            <div className="space-y-2">
              <button
                onClick={resetSavedData}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-left text-sm font-bold hover:border-slate-700"
              >
                Reset saved data
              </button>
              <button
                onClick={exportSavedData}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-left text-sm font-bold hover:border-slate-700"
              >
                Export prompts JSON
              </button>
              <label className="block w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-left text-sm font-bold hover:border-slate-700 cursor-pointer">
                Import prompts JSON
                <input type="file" accept="application/json,.json" onChange={importSavedData} className="hidden" />
              </label>
            </div>
            <div className="mt-3 text-xs text-slate-400 min-h-[1rem]">{dataMessage || "Selected prompt and edited fields are stored in this browser."}</div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-800 bg-slate-900 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mb-3">Checks</div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-200">Self-tests</span>
              <StatusPill tone={passedCount === selfTests.length ? "emerald" : "amber"}>
                {passedCount}/{selfTests.length} pass
              </StatusPill>
            </div>
            <div className="space-y-2">
              {selfTests.map((test) => (
                <div
                  key={test.name}
                  className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm flex items-start justify-between gap-3"
                >
                  <span className="text-slate-300">{test.name}</span>
                  <span className={test.pass ? "text-emerald-300 font-bold" : "text-red-300 font-bold"}>
                    {test.pass ? "PASS" : "FAIL"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <main className="space-y-6">
          <section className="rounded-[1.75rem] border border-slate-800 bg-slate-900 p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <StatusPill tone={selected.tool === "Gemini" ? "amber" : "indigo"}>{selected.tool}</StatusPill>
                  <StatusPill>{selected.category}</StatusPill>
                </div>
                <h2 className="text-2xl font-black tracking-tight">{selected.title}</h2>
                <p className="text-sm text-slate-400 mt-1">{selected.note}</p>
              </div>
              <button
                onClick={() => copyToClipboard(output, `${selected.id}-final`)}
                className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-xs font-black uppercase tracking-widest"
              >
                {copied === `${selected.id}-final` ? "Copied" : "Copy Prompt"}
              </button>
            </div>
          </section>

          {selected.fields.length > 0 && (
            <section className="rounded-[1.75rem] border border-slate-800 bg-slate-900 p-5 md:p-6">
              <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 mb-3">Edit Fields</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selected.fields.map((field) => {
                  const value = formValues[`${selected.id}:${field.key}`] ?? "";
                  const longField =
                    value.length > 80 ||
                    field.label.toLowerCase().includes("data") ||
                    field.label.toLowerCase().includes("note");

                  return (
                    <label key={field.key} className="block">
                      <div className="text-xs font-bold text-slate-300 mb-2">{field.label}</div>
                      {longField ? (
                        <textarea
                          rows={4}
                          value={value}
                          onChange={(e) => updateField(selected.id, field.key, e.target.value)}
                          className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />
                      ) : (
                        <input
                          value={value}
                          onChange={(e) => updateField(selected.id, field.key, e.target.value)}
                          className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          <section className="rounded-[1.75rem] border border-slate-800 bg-slate-900 p-5 md:p-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Final Prompt</div>
              <button
                onClick={() => copyToClipboard(output, `${selected.id}-bottom`)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:border-slate-600"
              >
                {copied === `${selected.id}-bottom` ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              rows={22}
              className="w-full rounded-[1.5rem] border border-slate-800 bg-slate-950 px-4 py-4 text-sm leading-6 text-slate-200 outline-none"
            />
          </section>
        </main>
      </div>
    </div>
  );
}
