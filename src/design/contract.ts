export const designContract = {
  typography: {
    /** Page / card titles */
    title: 'type-h1',
    /** Section titles, sector names in panels */
    subtitle: 'type-h2',
    /**
     * Primary copy & list rows (Area/Sector problem lines, Todo, Activity feed, Top table).
     * Global: `type-body` → text-sm, sm:text-base.
     */
    body: 'type-body',
    /**
     * Secondary line: #, grades, timestamps, table de-emphasis. `type-small` → text-sm.
     */
    meta: 'type-small',
    label: 'type-label',
    /** Extra-dense captions (badges, time-ago inline); prefer `meta` for new UI */
    micro: 'type-micro',
    /**
     * Toolbar chips, filter pills, compact controls (matches tab strip ~11–12px).
     */
    uiCompact: 'text-[11px] font-semibold leading-none tracking-normal sm:text-[12px]',
    /** Dropdown / menu rows */
    menuItem: 'text-[11px] font-medium leading-snug sm:text-[12px]',
    /** Inline links in list/table content (Top, Todo, etc.) */
    listLink: 'text-slate-200 transition-colors hover:text-slate-100',
    listLinkMuted: 'text-slate-400 transition-colors hover:text-slate-200',
    listEmphasis: 'font-semibold text-slate-100',
    /** Grade tokens (no brackets): mono + muted */
    grade: 'type-small font-mono tabular-nums text-slate-400',
  },
  layout: {
    pageSection: 'w-full pb-0',
    frontpageGrid: 'grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:gap-8',
    asideStack: 'w-full space-y-4 self-start sm:space-y-6 lg:sticky lg:top-20',
    toolbar: 'mb-4 flex flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-0',
    toolbarActions: 'flex w-full flex-wrap items-center justify-center gap-1.5 sm:w-auto sm:justify-end',
    pageShell: 'max-w-container mx-auto space-y-6 px-4 py-6 text-left',
    pageHeaderRow:
      'border-surface-border flex flex-col justify-between gap-4 border-b pb-4 lg:flex-row lg:items-center',
    breadcrumb:
      'flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase',
  },
  surfaces: {
    panel: 'bg-surface-card border-surface-border border',
    elevated: 'shadow-xl',
    divider: 'divide-y divide-white/7',
    gridDivider: 'bg-surface-border/60 gap-px',
    card: 'bg-surface-card border-surface-border rounded-2xl border shadow-sm',
    subtle: 'bg-surface-nav border-surface-border border',
    /**
     * Inline stat/meta chips — same language as Area sector pills & Sector type rows.
     * Use `inlineChipInteractive` for links/buttons (hover border).
     */
    inlineChip:
      'bg-surface-nav border-surface-border inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-slate-300',
    inlineChipInteractive:
      'bg-surface-nav border-surface-border inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-slate-300 transition-colors hover:border-white/15',
  },
  controls: {
    chipButton: 'btn-glass',
    chipButtonActive: 'btn-glass-active',
    listRow: 'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5',
    /** Full-width tab row (Profile, Area, etc.): underline indicates active — no filled “pill” background */
    tabBarRow: 'border-surface-border/50 flex w-full min-w-0 flex-wrap border-b',
    tabBarButton:
      '-mb-px flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 border-b-2 px-1 py-2.5 text-[11px] leading-none font-semibold transition-colors sm:flex-row sm:gap-1.5 sm:px-3 sm:text-[12px]',
    tabBarButtonActive: 'border-slate-200/80 text-slate-100',
    tabBarButtonInactive: 'border-transparent text-slate-500 hover:text-slate-300',
    tabButton:
      'flex items-center gap-2 border-b-2 px-6 py-3 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors',
    navPill:
      'flex flex-col items-center gap-2 rounded-lg px-5 py-3 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors sm:flex-row',
    /** Show more / Show less under ExpandableMarkdown (Area overview) */
    expandableToggle: 'text-[12px] font-medium text-slate-400 transition-colors hover:text-slate-200 sm:text-[13px]',
  },
  activityColors: {
    filter: {
      fa: 'text-sky-300/85',
      ticks: 'text-emerald-300/85',
      media: 'text-fuchsia-300/90',
      comments: 'text-red-300/85',
    },
    status: {
      fa: 'text-sky-300/80',
      ticks: 'text-emerald-300/80',
      media: 'text-fuchsia-300/90',
      comments: 'text-red-300/85',
    },
  },
} as const;
