/**
 * Rail kicker: “Latest activity”, breadcrumb crumbs (matches `SectionLabel`).
 * Form field captions use `typography.label` (`type-label`, 11px).
 *
 * Brand contrast: avoid pairing `text-brand` with `bg-brand/*` tints (weak contrast, worse in light mode).
 * Prefer solid on-states `bg-brand text-slate-950 ring-1 ring-black/20`, tinted callouts
 * `border-brand/35 bg-brand/15 text-slate-100`, and reserve `text-brand` for neutral surfaces.
 */
export const SECTION_EYEBROW = 'text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase';

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
    /** Same type rhythm as `SectionLabel` / breadcrumbs — use for explicit overlines in TSX. */
    sectionEyebrow: SECTION_EYEBROW,
  },
  layout: {
    pageSection: 'w-full pb-0',
    /** Home: fluid column only below `md` (phones); tablet / iPad / desktop share 12-col sidebar layout. */
    /** `items-start`: avoid default stretch making the short column track the tall one’s height (reduces perceived aside “jump” when the feed loads). */
    frontpageGrid: 'grid grid-cols-1 items-start gap-4 md:grid-cols-12 md:gap-8',
    asideStack: 'w-full space-y-4 self-start md:space-y-6 md:sticky md:top-20',
    toolbar: 'mb-4 flex flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-0',
    /** Activity on frontpage: same `md` switch as stats/sidebar (no `sm` density step on home). */
    activityToolbarFrontpage: 'mb-4 flex flex-col items-center justify-between gap-3 px-4 md:flex-row md:px-0',
    activityToolbarActionsFrontpage:
      'flex w-full flex-nowrap items-center justify-center gap-0.5 sm:gap-1.5 md:w-auto md:justify-end',
    /** Activity filters: one row; compact chips; labels always visible (tight gap on narrow screens). */
    toolbarActions: 'flex w-full flex-nowrap items-center justify-center gap-0.5 sm:gap-1.5 sm:w-auto sm:justify-end',
    pageShell: 'max-w-container mx-auto space-y-6 px-4 py-6 text-left',
    pageHeaderRow:
      'border-surface-border flex flex-col justify-between gap-4 border-b pb-4 lg:flex-row lg:items-center',
    breadcrumb: `flex flex-wrap items-center gap-2 ${SECTION_EYEBROW}`,
    /**
     * Profile captured/media + area/sector/problem Media when `compactTiles` is set:
     * 3 columns on small screens, stepping up to 6 on `lg` (matches profile gallery).
     */
    mediaTileGridCompact: 'grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 md:gap-2.5 lg:grid-cols-6',
    /**
     * Trivia / secondary galleries: one extra column vs `mediaTileGridCompact` at each step so tiles read as less prominent.
     */
    mediaTileGridTrivia: 'grid grid-cols-4 gap-1.5 sm:grid-cols-5 sm:gap-2 md:grid-cols-6 md:gap-2.5 lg:grid-cols-7',
    /**
     * Area overview sector cards: wider tiles on phone (2 cols), up to 6 on large screens.
     */
    areaSectorCardGrid:
      'grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-4 md:gap-3 lg:grid-cols-6 lg:gap-2.5',
  },
  surfaces: {
    panel: 'bg-surface-card border-surface-border border',
    elevated: 'shadow-xl',
    divider: 'divide-y divide-white/7',
    gridDivider: 'bg-surface-border/60 gap-px',
    card: 'bg-surface-card border-surface-border rounded-2xl border shadow-sm',
    subtle: 'bg-surface-nav border-surface-border border',
    /**
     * Inset cells (frontpage stats tiles, activity rows): opaque fill on a `surface-card` shell — same pattern everywhere.
     * See `--color-surface-raised*` in `index.css`.
     */
    raised: 'bg-surface-raised',
    raisedHover: 'hover:bg-surface-raised-hover',
    /** Selected / “on” compact controls (filter grade, active chip) — opaque, no `bg-white/xx`. */
    controlActive: 'border-white/15 bg-surface-raised-hover text-slate-100',
    /**
     * Inline stat/meta chips — same language as Area sector pills & Sector type rows.
     * Use `inlineChipInteractive` for links/buttons (hover border).
     */
    inlineChip:
      'inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md border border-white/12 bg-surface-raised px-2.5 py-1 text-xs text-slate-200',
    inlineChipInteractive:
      'inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md border border-white/12 bg-surface-raised px-2.5 py-1 text-xs text-slate-200 transition-colors hover:border-white/22 hover:bg-surface-raised-hover',
    /**
     * Hover affordance for {@link Badge} used inside links (weather, webcams, external URLs).
     * Static info chips omit this — only interactive targets get the brand ring.
     */
    badgeLinkHover:
      'cursor-pointer transition-colors duration-150 hover:bg-surface-raised-hover hover:text-slate-100 hover:ring-1 hover:ring-brand/35',
    /**
     * Ring chip for downloads, map links, and other meta actions — matches {@link DownloadButton}.
     */
    metaChipInteractive:
      'inline-flex max-w-full cursor-pointer items-center gap-1 rounded-md bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-slate-300 ring-1 ring-white/10 transition-colors duration-150 hover:bg-surface-raised-hover hover:text-slate-100 hover:ring-brand/35 sm:text-[12px]',
  },
  controls: {
    chipButton: 'btn-glass',
    chipButtonActive: 'btn-glass-active',
    listRow:
      'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-raised-hover',
    /**
     * Round icon buttons in the page header breadcrumb row (Problem, Area, Sector).
     * One size token everywhere; glyph scales slightly from `sm` up.
     */
    pageHeaderIconButton:
      'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors sm:h-8 sm:w-8',
    /** Add (+) — create entity; blue to distinguish from amber edit actions. */
    pageHeaderIconButtonAdd: 'border-sky-400/45 bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 hover:text-sky-200',
    pageHeaderIconGlyph: 'pointer-events-none h-3 w-3 sm:h-[14px] sm:w-[14px]',
    /** Full-width tab row (Profile, Area, etc.): active state via short bar — no full-width rules above/below */
    tabBarRow: 'flex w-full min-w-0 flex-wrap',
    /**
     * Card tab strip chrome: bottom rule + horizontal inset. Use on every page tab row (with {@link tabBarRow})
     * so primary strips match secondary (e.g. Area overview tabs vs Sectors/Routes).
     */
    tabBarStrip: 'border-surface-border/40 border-b px-4 pt-2.5 pb-0 sm:px-5',
    /** Content-sized tab pairs (e.g. Sectors | Routes): extra air between tabs */
    tabBarStripGapInline: 'gap-x-6 gap-y-1 sm:gap-x-10',
    tabBarButton:
      'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 border-b-2 border-transparent px-1 py-2.5 text-[11px] leading-none font-semibold transition-colors sm:flex-row sm:gap-1.5 sm:px-3 sm:py-3 sm:text-[12px]',
    /** Capped-width bar reads better on 2-tab rows than a full-cell underline */
    tabBarButtonActive:
      'text-slate-100 after:pointer-events-none after:absolute after:bottom-0 after:left-1/2 after:h-[3px] after:w-[min(5.75rem,calc(100%-0.75rem))] after:max-w-[11rem] after:-translate-x-1/2 after:rounded-full after:bg-brand',
    tabBarButtonInactive: 'text-slate-400 hover:text-slate-200',
    tabButton:
      'flex items-center gap-2 border-b-2 px-6 py-3 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors',
    navPill:
      'flex flex-col items-center gap-2 rounded-lg px-5 py-3 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors sm:flex-row',
    /** Show more / Show less under ExpandableMarkdown (Area overview) */
    expandableToggle: 'text-[12px] font-medium text-slate-400 transition-colors hover:text-slate-200 sm:text-[13px]',
    /** Save / submit — always green (avoid brand yellow on primary actions) */
    savePrimary:
      'inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/45 bg-emerald-600 px-4 py-2 text-[11px] font-semibold text-slate-100 shadow-sm transition-colors hover:border-emerald-400/55 hover:bg-emerald-500 disabled:pointer-events-none disabled:opacity-45 sm:text-[12px]',
    /** Modal footers — matches type-label weight with green fill */
    savePrimaryModal:
      'inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/45 bg-emerald-600 px-6 py-2.5 text-[10px] font-bold tracking-widest text-slate-100 uppercase transition-colors hover:border-emerald-400/55 hover:bg-emerald-500 disabled:pointer-events-none disabled:opacity-45',
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
