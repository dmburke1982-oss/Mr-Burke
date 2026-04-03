window.CURRICULUM = {
  meta: {
    title: "CTE Master Hub",
    subtitle: "Mr. Burke - Carl Sandburg HS - Spring 2026",
    statusText: "Weeks 12-18 - 48m periods - 90 days",
    heroKicker: "Spring 2026 - CTE",
    heroTitleTop: "Curriculum",
    heroTitleAccent: "Command Center",
    heroBlurb:
      "Slides, workbooks, planner, videos, and certification tools - all in one place for both courses."
  },

  startup: {
    kicker: "Start Here",
    title: "Run the classroom folder from the hub",
    blurb:
      "Open index.html first, then move through slides, workbooks, planners, and video pages from the hub so the local routes and planner deep links stay aligned.",
    cards: [
      {
        title: "Open index.html",
        body:
          "Start from the hub when this folder lives on a desktop, shared drive, or USB copy. No install step, local server, or sign-in is required.",
        chips: ["Local file", "No build step"]
      },
      {
        title: "What works offline",
        body:
          "Slides, workbooks, planner pages, checkpoint tracking, printable planner, and the random name caller all run locally and save in this browser.",
        chips: ["Browser save", "Single device"]
      },
      {
        title: "What still needs internet",
        body:
          "Google Slides, Google Drive, GMetrix, and support links stay online-only. Those external resources are the only parts that should degrade offline.",
        chips: ["External links", "Online only"]
      },
      {
        title: "Video files bundled",
        body:
          "Local video files are stored in the media/ folder. Open the Video Library pages for chapter markers and pacing notes. Choose Local Video still works as a fallback.",
        chips: ["media/basic-box.mp4", "media/ace-practice-test-2026.mkv"]
      }
    ],
    resetNote:
      "Use the built-in Reset or Clear buttons inside each tool, or clear this site's browser storage on this device to wipe local data completely."
  },

  quickActions: {
    kicker: "Teacher Quick Actions",
    title: "Launch the next tool fast",
    blurb:
      "Jump straight into the video pages, the GMetrix login, or the checkpoint tracker without digging through the hub.",
    caption: "Spring 2026 pacing tools",
    items: [
      {
        title: "WW Video Library",
        body: "4 local woodworking videos with chapter markers and pacing notes.",
        href: "video-ww-library.html",
        icon: "video",
        theme: "amber",
        badge: "WW"
      },
      {
        title: "GD Video Library",
        body: "ACE practice test video and 63-min Photoshop audio course.",
        href: "video-gd-library.html",
        icon: "video",
        theme: "indigo",
        badge: "GD"
      },
      {
        title: "GMetrix",
        body: "Launch the GMetrix student panel for setup, review, and weak-area practice.",
        href: "https://www.gmetrix.net/",
        icon: "gmetrix",
        theme: "indigo",
        badge: "LOGIN",
        external: true
      },
      {
        title: "Checkpoint Tracker",
        body: "Open the lightweight teacher tracker for Weeks 12, 13, and 16 in both courses.",
        href: "planner.html#checkpointTracker",
        icon: "checkpoint",
        theme: "emerald",
        badge: "TRACK"
      }
    ]
  },

  planner: {
    kicker: "Curriculum Tool",
    title: "Master Lesson Planner",
    blurb:
      "7-week grid planner for both courses. Hub links now deep-link into planner.html with course, week, and date parameters.",
    href: "planner.html",
    printableHref: "teaching-planner.html",
    printableCta: "Open Printable Planner",
    printableNote: "18-page printable companion with browser save, theme toggles, and live-planner prefills.",
    chips: ["Both Courses", "Deep Links", "Checkpoint Tracker", "Auto-Save", "Printable Companion"],
    cta: "Open Planner"
  },

  courses: {
    woodworking: {
      name: "Woodworking",
      shortLabel: "WW",
      theme: "amber",
      badge: "Wks 12-18",
      sub: "Basic Box Construction - 20 Students",
      copy: {
        slides: "Classroom presentation mode. Daily focus, activity flow, and learning intention for every class.",
        workbook: "Daily checklist, reflection prompts, sketch pads, and print-ready support pages for each class day."
      },
      unit: {
        eq: "Why is planning important before cutting wood?",
        goal: "Functional sliding-lid box with documented design choices",
        skills: ["Rabbet joints", "Staggered workflow", "Safe finishing"]
      },
      resources: {
        slidesPage: "ww-slides.html",
        workbookPage: "ww-workbook.html",
        liveSlides:
          "https://docs.google.com/presentation/d/1Z5U6hAvx5DhIybZsP1ynGD3DIgxOJpNibaldrZSwPV4/edit?usp=sharing",
        driveFolder:
          "https://drive.google.com/drive/folders/1S78Np5VHzCZnFuzAN5ex8lBRLyqsZC26?usp=sharing"
      },
      counts: {
        slideDays: 30,
        workbookPages: 27
      },
      featureCard: {
        mode: "link",
        title: "WW Video Library",
        body: "4 locally-bundled videos: Basic Box build, tape measure basics, tricks, and precision marking.",
        href: "video-ww-library.html",
        icon: "video",
        theme: "amber",
        chips: ["4 Local Videos", "Chapter Markers", "No Internet"],
        secondaryHref: "planner.html#checkpointTracker",
        secondaryLabel: "Checkpoint Tracker"
      }
    },

    graphicDesign: {
      name: "Graphic Design",
      shortLabel: "GD",
      theme: "indigo",
      badge: "Wks 12-18",
      sub: "Campaign Branding and ACE Certification - 26 Students",
      copy: {
        slides: "Classroom presentation mode. Daily focus, activities, and learning intention aligned to GMetrix workflow.",
        workbook: "ACE practice Q&A, daily objectives, and reflection areas. Print-ready for student use."
      },
      unit: {
        eq: "How do designers maintain consistency across a campaign?",
        goal: "Cohesive album cover portfolio plus GMetrix certification readiness",
        skills: ["Non-destructive editing", "Layer Masks", "ACE Photoshop"]
      },
      resources: {
        slidesPage: "gd-slides.html",
        workbookPage: "gd-workbook.html",
        liveSlides:
          "https://docs.google.com/presentation/d/1Z5U6hAvx5DhIybZsP1ynGD3DIgxOJpNibaldrZSwPV4/edit?usp=sharing",
        driveFolder:
          "https://drive.google.com/drive/folders/1S78Np5VHzCZnFuzAN5ex8lBRLyqsZC26?usp=sharing",
        gmetrix: "https://www.gmetrix.net/"
      },
      counts: {
        slideDays: 31,
        workbookPages: 30
      },
      featureCard: {
        mode: "info",
        title: "Certification Tools",
        bullets: [
          {
            label: "GMetrix",
            text: "Launch the practice platform directly from the hub."
          },
          {
            label: "Checkpoints",
            text: "Track Week 12, 13, and 16 readiness from the planner."
          }
        ],
        links: [
          {
            label: "GD Video Library",
            href: "video-gd-library.html",
            icon: "video",
            theme: "indigo"
          },
          {
            label: "Open GMetrix",
            href: "https://www.gmetrix.net/",
            icon: "gmetrix",
            theme: "indigo",
            external: true
          },
          {
            label: "Open Checkpoint Tracker",
            href: "planner.html#checkpointTracker",
            icon: "checkpoint",
            theme: "emerald"
          }
        ]
      }
    }
  },

  weeks: {
    12: {
      focus: "Plan and Prep Stock",
      days: {
        "2026-04-01": { label: "Wed 4/1" },
        "2026-04-02": { label: "Thu 4/2" },
        "2026-04-03": { label: "Fri 4/3", special: true, note: "No school" },
        "2026-04-06": { label: "Mon 4/6" },
        "2026-04-07": { label: "Tue 4/7" }
      }
    },
    13: {
      focus: "Joinery and Setup",
      days: {
        "2026-04-08": { label: "Wed 4/8" },
        "2026-04-09": { label: "Thu 4/9" },
        "2026-04-10": { label: "Fri 4/10" },
        "2026-04-13": { label: "Mon 4/13" },
        "2026-04-14": { label: "Tue 4/14" }
      }
    },
    14: {
      focus: "Surface Prep",
      days: {
        "2026-04-15": { label: "Wed 4/15" },
        "2026-04-16": { label: "Thu 4/16" },
        "2026-04-17": { label: "Fri 4/17" },
        "2026-04-20": { label: "Mon 4/20" },
        "2026-04-21": { label: "Tue 4/21" }
      }
    },
    15: {
      focus: "Finishing and Practice",
      days: {
        "2026-04-22": { label: "Wed 4/22" },
        "2026-04-23": { label: "Thu 4/23" },
        "2026-04-24": { label: "Fri 4/24", special: true, note: "Institute day" },
        "2026-04-27": { label: "Mon 4/27" },
        "2026-04-28": { label: "Tue 4/28" }
      }
    },
    16: {
      focus: "Evaluation and Packaging",
      days: {
        "2026-04-29": { label: "Wed 4/29" },
        "2026-04-30": { label: "Thu 4/30" },
        "2026-05-01": { label: "Fri 5/1" },
        "2026-05-04": { label: "Mon 5/4" },
        "2026-05-05": { label: "Tue 5/5" }
      }
    },
    17: {
      focus: "Presentations and Exams",
      days: {
        "2026-05-06": { label: "Wed 5/6" },
        "2026-05-07": { label: "Thu 5/7" },
        "2026-05-08": { label: "Fri 5/8" },
        "2026-05-11": { label: "Mon 5/11" }
      }
    },
    18: {
      focus: "Wrap-Up",
      days: {
        "2026-05-12": { label: "Tue 5/12" },
        "2026-05-13": { label: "Wed 5/13" },
        "2026-05-14": { label: "Thu 5/14" }
      }
    }
  },

  lessons: {
    woodworking: {
      "2026-04-01": { title: "Project intro", locked: true },
      "2026-04-02": { title: "Sketches and cut list", locked: true }
    },
    graphicDesign: {
      "2026-04-01": { title: "Campaign brief", locked: true },
      "2026-04-02": { title: "Moodboards and style direction", locked: true }
    }
  },

  footer: "Carl Sandburg High School - Mr. Burke - CTE - Spring 2026"
};
