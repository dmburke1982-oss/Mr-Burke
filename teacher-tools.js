(function () {
  const STORAGE_KEY = 'cteHubNameCaller_v1';
  let memoryState = null;

  function readState() {
    const fallback = { rosters: {} };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return memoryState || fallback;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return memoryState || fallback;
      parsed.rosters = parsed.rosters || {};
      return parsed;
    } catch (err) {
      return memoryState || fallback;
    }
  }

  function writeState(state) {
    const clean = state && typeof state === 'object' ? state : { rosters: {} };
    clean.rosters = clean.rosters || {};
    memoryState = clean;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch (err) {
      // localStorage can fail in some locked-down school environments.
    }
  }

  function ensureRoster(state, rosterId) {
    state.rosters = state.rosters || {};
    if (!state.rosters[rosterId]) {
      state.rosters[rosterId] = {
        names: [],
        remaining: [],
        lastDrawn: '',
        history: []
      };
    }
    state.rosters[rosterId].names = Array.isArray(state.rosters[rosterId].names) ? state.rosters[rosterId].names : [];
    state.rosters[rosterId].remaining = Array.isArray(state.rosters[rosterId].remaining) ? state.rosters[rosterId].remaining : [];
    state.rosters[rosterId].history = Array.isArray(state.rosters[rosterId].history) ? state.rosters[rosterId].history : [];
    state.rosters[rosterId].lastDrawn = state.rosters[rosterId].lastDrawn || '';
    return state.rosters[rosterId];
  }

  function uniqueNames(names) {
    const seen = new Set();
    const out = [];
    names.forEach((name) => {
      const normalizedKey = name.toLowerCase();
      if (!normalizedKey || seen.has(normalizedKey)) return;
      seen.add(normalizedKey);
      out.push(name);
    });
    return out;
  }

  function normalizeNames(raw) {
    return uniqueNames(
      String(raw || '')
        .split(/[\n,;]+/)
        .map((part) => part.trim())
        .filter(Boolean)
    );
  }

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function nextCycle(names, avoidName) {
    if (!names.length) return [];
    let candidate = shuffle(names);
    if (names.length > 1 && avoidName && candidate[0] === avoidName) {
      let tries = 0;
      while (tries < 8 && candidate[0] === avoidName) {
        candidate = shuffle(names);
        tries += 1;
      }
      if (candidate[0] === avoidName) {
        const swapIndex = candidate.findIndex((name) => name !== avoidName);
        if (swapIndex > 0) {
          [candidate[0], candidate[swapIndex]] = [candidate[swapIndex], candidate[0]];
        }
      }
    }
    return candidate;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function timestampLabel() {
    try {
      return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (err) {
      return '';
    }
  }

  function getTheme(themeName) {
    const themes = {
      amber: {
        button: 'bg-amber-600 hover:bg-amber-500 text-white',
        border: 'border-amber-500/30',
        subtle: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        accent: 'text-amber-400',
        hoverText: 'hover:text-amber-200',
        activeTab: 'bg-amber-600 text-white shadow',
        panel: 'bg-zinc-900 border-zinc-800 text-zinc-100',
        muted: 'text-zinc-400',
        mutedBg: 'bg-zinc-800',
        textarea: 'bg-zinc-950 border-zinc-800 text-zinc-200',
        card: 'bg-zinc-900 border-zinc-800',
        secondaryButton: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
      },
      indigo: {
        button: 'bg-indigo-600 hover:bg-indigo-500 text-white',
        border: 'border-indigo-500/30',
        subtle: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
        accent: 'text-indigo-300',
        hoverText: 'hover:text-indigo-100',
        activeTab: 'bg-indigo-600 text-white shadow',
        panel: 'bg-slate-900 border-slate-800 text-slate-100',
        muted: 'text-slate-400',
        mutedBg: 'bg-slate-800',
        textarea: 'bg-slate-950 border-slate-800 text-slate-200',
        card: 'bg-slate-900 border-slate-800',
        secondaryButton: 'bg-slate-800 hover:bg-slate-700 text-slate-100'
      },
      slate: {
        button: 'bg-white hover:bg-slate-100 text-slate-900',
        border: 'border-slate-700',
        subtle: 'bg-slate-800 text-slate-300 border border-slate-700',
        accent: 'text-white',
        hoverText: 'hover:text-white',
        activeTab: 'bg-white text-slate-900 shadow',
        panel: 'bg-slate-900 border-slate-800 text-slate-100',
        muted: 'text-slate-400',
        mutedBg: 'bg-slate-800',
        textarea: 'bg-slate-950 border-slate-800 text-slate-200',
        card: 'bg-slate-900 border-slate-800',
        secondaryButton: 'bg-slate-800 hover:bg-slate-700 text-slate-100'
      },
      paper: {
        button: 'bg-slate-900 hover:bg-slate-700 text-white',
        border: 'border-stone-200',
        subtle: 'bg-stone-100 text-stone-600 border border-stone-200',
        accent: 'text-slate-900',
        hoverText: 'hover:text-slate-900',
        activeTab: 'bg-slate-900 text-white shadow',
        panel: 'bg-white border-stone-200 text-slate-900',
        muted: 'text-stone-500',
        mutedBg: 'bg-stone-100',
        textarea: 'bg-stone-50 border-stone-200 text-slate-900',
        card: 'bg-white border-stone-200',
        secondaryButton: 'bg-stone-100 hover:bg-stone-200 text-slate-900'
      }
    };
    return themes[themeName] || themes.slate;
  }

  function mountInstance(options) {
    const mount = document.getElementById(options.mountId);
    if (!mount) return;

    const rosterOptions = Array.isArray(options.rosterOptions) && options.rosterOptions.length
      ? options.rosterOptions
      : [{ id: options.defaultRoster || 'default', label: 'Roster' }];

    const theme = getTheme(options.theme || 'slate');
    let activeRoster = options.defaultRoster || rosterOptions[0].id;
    let isOpen = !options.compact;
    let statusMessage = '';

    function loadRoster(rosterId) {
      const state = readState();
      return ensureRoster(state, rosterId);
    }

    function saveRosterNames(rosterId, raw) {
      const state = readState();
      const roster = ensureRoster(state, rosterId);
      const names = normalizeNames(raw);
      roster.names = names;
      roster.remaining = nextCycle(names, roster.lastDrawn);
      roster.history = [];
      if (!names.includes(roster.lastDrawn)) roster.lastDrawn = '';
      writeState(state);
      statusMessage = names.length
        ? `Saved ${names.length} name${names.length === 1 ? '' : 's'} to ${labelFor(rosterId)}.`
        : `Cleared the ${labelFor(rosterId)} roster.`;
    }

    function drawName(rosterId) {
      const state = readState();
      const roster = ensureRoster(state, rosterId);

      if (!roster.names.length) {
        statusMessage = `Add names to ${labelFor(rosterId)} before drawing.`;
        writeState(state);
        return;
      }

      if (!roster.remaining.length) {
        roster.remaining = nextCycle(roster.names, roster.lastDrawn);
      }

      const picked = roster.remaining.shift();
      roster.lastDrawn = picked;
      roster.history.unshift({ name: picked, at: timestampLabel() });
      roster.history = roster.history.slice(0, 6);
      writeState(state);
      statusMessage = `Called ${picked}.`;
    }

    function resetCycle(rosterId) {
      const state = readState();
      const roster = ensureRoster(state, rosterId);
      roster.remaining = nextCycle(roster.names, roster.lastDrawn);
      writeState(state);
      statusMessage = roster.names.length
        ? `Reset the ${labelFor(rosterId)} cycle.`
        : `Nothing to reset yet.`;
    }

    function shuffleRemaining(rosterId) {
      const state = readState();
      const roster = ensureRoster(state, rosterId);
      roster.remaining = shuffle(roster.remaining);
      writeState(state);
      statusMessage = roster.remaining.length
        ? `Shuffled the remaining names for ${labelFor(rosterId)}.`
        : `No remaining names to shuffle.`;
    }

    function labelFor(rosterId) {
      const found = rosterOptions.find((option) => option.id === rosterId);
      return found ? found.label : rosterId;
    }

    function textareaValue(rosterId) {
      return loadRoster(rosterId).names.join('\n');
    }

    function renderTabs() {
      return rosterOptions.map((option) => `
        <button
          type="button"
          data-tab="${escapeHtml(option.id)}"
          class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${option.id === activeRoster ? theme.activeTab : `${theme.muted} ${theme.hoverText} ${theme.mutedBg}`}"
        >
          ${escapeHtml(option.label)}
        </button>
      `).join('');
    }

    function renderStats(roster) {
      return `
        <div class="flex flex-wrap gap-2">
          <span class="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${theme.subtle}">Total ${roster.names.length}</span>
          <span class="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${theme.subtle}">Remaining ${roster.remaining.length}</span>
        </div>
      `;
    }

    function renderHistory(roster) {
      if (!roster.history.length) {
        return `<p class="text-xs ${theme.muted}">No calls yet this session.</p>`;
      }
      return `
        <div class="flex flex-wrap gap-2">
          ${roster.history.map((entry) => `
            <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold ${theme.mutedBg} ${theme.muted}">
              ${escapeHtml(entry.name)}${entry.at ? ` · ${escapeHtml(entry.at)}` : ''}
            </span>
          `).join('')}
        </div>
      `;
    }

    function compactMarkup(roster) {
      return `
        <div class="relative">
          <button
            type="button"
            id="${options.mountId}_toggle"
            class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${theme.button}"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 12h6"/><path d="M12 9v6"/><circle cx="12" cy="12" r="9"/></svg>
            Name Caller
          </button>
          <div id="${options.mountId}_overlay" class="${isOpen ? '' : 'hidden'} fixed inset-0 bg-black/60 z-40"></div>
          <div id="${options.mountId}_panel" class="${isOpen ? '' : 'hidden'} fixed right-4 top-20 z-50 w-[min(92vw,24rem)] rounded-[1.5rem] border ${theme.panel} shadow-2xl p-4 space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-[10px] font-black uppercase tracking-[0.3em] ${theme.muted}">Teacher Tool</p>
                <h3 class="text-lg font-black ${theme.accent}">Random Name Caller</h3>
              </div>
              <button type="button" id="${options.mountId}_close" class="text-sm ${theme.muted} ${theme.hoverText}">✕</button>
            </div>
            <div class="flex gap-1 flex-wrap">${renderTabs()}</div>
            ${renderStats(roster)}
            <div class="rounded-[1.5rem] border ${theme.border} bg-black/10 px-4 py-5 text-center">
              <p class="text-xs font-bold uppercase tracking-[0.25em] ${theme.muted} mb-2">Current Pick</p>
              <div class="text-2xl font-black ${theme.accent} min-h-[2.5rem] flex items-center justify-center">${escapeHtml(roster.lastDrawn || 'Ready')}</div>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <button type="button" data-action="draw" class="col-span-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest ${theme.button}">Call Random Name</button>
              <button type="button" data-action="shuffle" class="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${theme.secondaryButton}">Shuffle</button>
              <button type="button" data-action="reset" class="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${theme.secondaryButton}">Reset</button>
              <button type="button" data-action="clear" class="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${theme.secondaryButton}">Clear</button>
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-[0.25em] ${theme.muted} mb-2">Roster</label>
              <textarea id="${options.mountId}_textarea" rows="8" class="w-full rounded-2xl border ${theme.textarea} p-3 text-sm leading-6 outline-none" placeholder="One name per line or use commas">${escapeHtml(textareaValue(activeRoster))}</textarea>
              <div class="mt-2 flex items-center justify-between gap-2">
                <p class="text-[11px] ${theme.muted}">No-repeat cycle until the roster is exhausted.</p>
                <button type="button" data-action="save" class="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${theme.button}">Save Roster</button>
              </div>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.25em] ${theme.muted} mb-2">Recent Calls</p>
              ${renderHistory(roster)}
            </div>
            <p class="text-[11px] ${theme.muted} min-h-[1rem]">${escapeHtml(statusMessage)}</p>
          </div>
        </div>
      `;
    }

    function fullMarkup(roster) {
      return `
        <div class="border ${theme.panel} rounded-[2rem] p-8 md:p-10 space-y-6 shadow-2xl">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <span class="text-[10px] font-black uppercase tracking-[0.4em] ${theme.muted}">Teacher Tool</span>
              <h3 class="text-3xl font-black ${theme.accent} mt-2">Random Name Caller</h3>
              <p class="text-sm ${theme.muted} mt-2 max-w-2xl">Save rosters in the browser, draw without repeats, shuffle the remaining pool, and reset the cycle whenever you need a fresh round.</p>
            </div>
            <div class="flex gap-1 flex-wrap">${renderTabs()}</div>
          </div>

          <div class="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <div class="rounded-[2rem] border ${theme.border} bg-black/10 p-6 space-y-5">
              <div class="flex items-center justify-between gap-4 flex-wrap">
                ${renderStats(roster)}
                <p class="text-[11px] ${theme.muted}">Stored on this device only.</p>
              </div>
              <div class="rounded-[2rem] ${theme.card} border ${theme.border} px-6 py-10 text-center">
                <p class="text-[10px] font-black uppercase tracking-[0.35em] ${theme.muted} mb-3">Current Pick</p>
                <div class="text-4xl md:text-5xl font-black ${theme.accent} min-h-[4rem] flex items-center justify-center">${escapeHtml(roster.lastDrawn || 'Ready')}</div>
              </div>
              <div class="grid sm:grid-cols-3 gap-3">
                <button type="button" data-action="draw" class="sm:col-span-3 px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest ${theme.button}">Call Random Name</button>
                <button type="button" data-action="shuffle" class="px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${theme.secondaryButton}">Shuffle Remaining</button>
                <button type="button" data-action="reset" class="px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${theme.secondaryButton}">Reset Cycle</button>
                <button type="button" data-action="clear" class="px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${theme.secondaryButton}">Clear Draw</button>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-[0.25em] ${theme.muted} mb-2">Recent Calls</p>
                ${renderHistory(roster)}
              </div>
              <p class="text-sm ${theme.muted} min-h-[1.25rem]">${escapeHtml(statusMessage)}</p>
            </div>

            <div class="rounded-[2rem] border ${theme.border} ${theme.card} p-6 space-y-4">
              <div>
                <label class="block text-[10px] font-black uppercase tracking-[0.35em] ${theme.muted} mb-2">Edit Roster</label>
                <textarea id="${options.mountId}_textarea" rows="16" class="w-full rounded-[1.5rem] border ${theme.textarea} p-4 text-sm leading-6 outline-none" placeholder="One name per line or use commas">${escapeHtml(textareaValue(activeRoster))}</textarea>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-[11px] ${theme.muted}">One student per line works best. Commas and semicolons also work.</p>
                <button type="button" data-action="save" class="px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${theme.button}">Save Roster</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function bindEvents() {
      mount.querySelectorAll('[data-tab]').forEach((button) => {
        button.addEventListener('click', () => {
          activeRoster = button.getAttribute('data-tab') || activeRoster;
          statusMessage = '';
          render();
        });
      });

      mount.querySelectorAll('[data-action]').forEach((button) => {
        const action = button.getAttribute('data-action');
        button.addEventListener('click', () => {
          if (action === 'draw') drawName(activeRoster);
          if (action === 'shuffle') shuffleRemaining(activeRoster);
          if (action === 'reset') resetCycle(activeRoster);
          if (action === 'clear') {
            const state = readState();
            const roster = ensureRoster(state, activeRoster);
            roster.lastDrawn = '';
            writeState(state);
            statusMessage = `Cleared the current display for ${labelFor(activeRoster)}.`;
          }
          if (action === 'save') {
            const textarea = mount.querySelector(`#${options.mountId}_textarea`);
            saveRosterNames(activeRoster, textarea ? textarea.value : '');
          }
          render();
        });
      });

      const toggle = mount.querySelector(`#${options.mountId}_toggle`);
      if (toggle) {
        toggle.addEventListener('click', () => {
          isOpen = true;
          render();
        });
      }

      const close = mount.querySelector(`#${options.mountId}_close`);
      if (close) {
        close.addEventListener('click', () => {
          isOpen = false;
          render();
        });
      }

      const overlay = mount.querySelector(`#${options.mountId}_overlay`);
      if (overlay) {
        overlay.addEventListener('click', () => {
          isOpen = false;
          render();
        });
      }
    }

    function render() {
      const roster = loadRoster(activeRoster);
      mount.innerHTML = options.compact ? compactMarkup(roster) : fullMarkup(roster);
      bindEvents();
    }

    render();
  }

  window.initNameCaller = mountInstance;
})();
