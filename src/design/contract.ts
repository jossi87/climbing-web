import { twInk } from './twInk';

/**
 * Rail kicker: “Latest activity”, breadcrumb crumbs (matches `SectionLabel`).
 * Form field captions use `typography.label` (`type-label`, 11px).
 *
 * Brand (`--color-brand` in `index.css`): primary **text, links, tab ink**. On dark panels prefer `brand-border`
 * (`index.css`) — gold mixed into `surface-border`, less “mustard frame”.
 * Light theme: `hover:text-brand` remaps to `--color-brand-hover` (rich gold-brown) in `index.css` `@layer utilities`;
 * `/80` `/90` variants mix with `--color-brand` so icons don’t wash out. Main-content `group-hover:text-slate-*` is
 * remapped there too; dark scrim links use `.photo-overlay-link`.
 *
 * A11y baseline: global `input`/`textarea` placeholders and `:focus-visible` live in `index.css`. On `surface-card`
 * (`surface-card`), prefer **`slate-400`+** for readable secondary copy; reserve **`slate-500`** for non-essential hints.
 */
export const SECTION_EYEBROW = 'text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase';

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
    uiCompact: 'text-[12px] font-medium leading-none tracking-normal sm:text-[13px]',
    /** Dropdown / menu rows */
    menuItem: 'text-[12px] font-medium leading-snug sm:text-[13px]',
    /** Inline links in list/table content (Top, Todo, etc.) */
    listLink: 'text-slate-300 transition-colors hover:text-brand',
    listLinkMuted: 'text-slate-400 transition-colors hover:text-brand',
    /** Inline emphasis in tables/lists — prefer medium weight so rows don’t all feel “bold UI”. */
    listEmphasis: 'font-medium text-slate-300',
    /**
     * Dense dark feeds: **problem** ({@link feed.routeTitle}) + **grade/type** ({@link feed.gradeHighlight}) vs glue
     * ({@link feed.action} / {@link feed.locationLink}). Weights tuned so one baseline reads like a sentence.
     */
    feed: {
      /** Default line color on dark panels — bright enough for small body text (WCAG-friendly vs `surface-card`). */
      sentence: 'text-slate-400 antialiased align-baseline',
      /** Glue words (“ticked”, “in”), trailing type — one quiet meta layer with {@link feed.locationLink}. */
      action: 'text-slate-400 antialiased align-baseline',
      emphasis: 'font-normal text-slate-300 antialiased align-baseline transition-colors hover:text-brand',
      /**
       * Problem / route name — `font-medium` on dark panels; light pages remap `text-slate-50` to ink, so we step up
       * weight + near-black so the name still reads as the headline vs `feed.sentence` / `feed.action` (Activity feed).
       */
      routeTitle:
        'font-medium text-slate-50 antialiased align-baseline transition-colors hover:text-brand light:font-semibold light:text-slate-950',
      /** Area + sector links — same color as glue ({@link feed.action}); brand on hover so they still read as links. */
      locationLink: 'font-normal text-slate-400 antialiased align-baseline transition-colors hover:text-brand',
      /** Middle dot — strong enough to read as a boundary; `font-semibold` thickens the interpunct. */
      metaSep: 'text-slate-300 font-semibold antialiased align-baseline',
      /** Grade + subtype beside the name — slightly softer ink in light so the route title stays primary. */
      gradeHighlight:
        'font-normal tracking-tight text-slate-50 antialiased align-baseline light:font-medium light:text-slate-800',
      lead: 'font-medium text-slate-300 antialiased align-baseline',
    },
    /** Grade tokens (no brackets): mono + muted */
    grade: 'type-small font-mono tabular-nums text-slate-400',
    /** Same type rhythm as `SectionLabel` / breadcrumbs — use for explicit overlines in TSX. */
    sectionEyebrow: SECTION_EYEBROW,
    /**
     * Primary dense list copy (Area/Sector route rows, Profile ascents, Ticks, TOC) — same step as Activity feed lines.
     */
    listBody:
      'm-0 text-[12px] font-normal leading-snug tracking-normal md:text-[13px] md:leading-snug text-pretty [overflow-wrap:anywhere]',
    /**
     * Paragraph blocks under titles (access restrictions, section intros) — one step above {@link listBody}.
     */
    detailBody: 'text-[13px] leading-relaxed sm:text-[14px]',
    /**
     * Breadcrumb / in-card tertiary links (Area, Sector, Problem). Light hover uses {@link twInk.lightHoverSlate900}.
     */
    breadcrumbLink: `inline min-w-0 text-slate-400 transition-colors hover:text-slate-200 ${twInk.lightHoverSlate900}`,
    /** Same as {@link breadcrumbLink} with `tracking-tight` (Problem page crumb row). */
    breadcrumbLinkTight: `inline min-w-0 tracking-tight text-slate-400 transition-colors hover:text-slate-200 ${twInk.lightHoverSlate900}`,
  },
  layout: {
    pageSection: 'w-full pb-0',
    /** Home: fluid column only below `md` (phones); tablet / iPad / desktop share 12-col sidebar layout. */
    /** `md:items-stretch`: left column matches feed height so `asideStack` sticky works (see Frontpage aside `md:h-full`). */
    frontpageGrid: 'grid grid-cols-1 items-start gap-6 md:grid-cols-12 md:items-stretch md:gap-8',
    asideStack: 'w-full space-y-5 md:space-y-6 md:sticky md:top-20',
    toolbar: 'mb-4 flex flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-0',
    /**
     * Activity toolbar: below `md`, negate `main` horizontal padding so filter chips align with the activity
     * `.app-card` feed (same breakout as the list — avoids double inset vs full-bleed card on phones).
     */
    activityToolbarFrontpage:
      'flex max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] flex-col items-center justify-between gap-3 px-4 md:mx-0 md:w-full md:flex-row md:px-0',
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
    /**
     * App shell: sticky header (glass) + page footer share the same hairline token so chrome matches.
     * Softer than `border-surface-border` at full opacity so it doesn’t fight backdrop blur.
     *
     * Header fill/blur: `Header.tsx` layers + unlayered `index.css` (`.app-shell-header-*`), not a Tailwind token here.
     */
    shellHairline: 'border-surface-border/40',
    /** Inner divider inside the footer (above legal row) — same family, lighter. */
    shellHairlineInner: 'border-surface-border/25',
    panel: 'bg-surface-card border-surface-border border',
    elevated: 'shadow-xl',
    divider: 'divide-y divide-white/7',
    gridDivider: 'bg-surface-border/60 gap-px',
    card: 'bg-surface-card border-surface-border rounded-2xl border shadow-sm',
    subtle: 'bg-surface-nav border-surface-border border',
    /**
     * Compact controls & trays (search field, chips, dropdown rows): use `raised` fills so they read as inputs — not
     * as the card panel itself. See `--color-surface-raised*` in `index.css`.
     */
    raised: 'bg-surface-raised',
    raisedHover: 'hover:bg-surface-raised-hover',
    /**
     * Rows **inside** `Card` / `.app-card`: no row hover fill — inline links carry hover; avoids competing affordances.
     */
    panelRow: 'bg-transparent',
    /** Stat grid cells on the frontpage (same panel as {@link panelRow}, plus border affordance). */
    panelStatCell:
      'border border-transparent bg-transparent transition-[background-color,border-color] duration-200 hover:border-brand-border hover:bg-surface-raised',
    /** Selected / “on” compact controls (filter grade, active chip) — opaque, no `bg-white/xx`. */
    controlActive: 'border-white/15 bg-surface-raised-hover text-slate-300',
    /**
     * Icon wells (PageHeader, Section, HeaderButtons, callouts) — always opaque neutrals.
     * Avoid `bg-brand/15` etc.; they read muddy/brown when composited on dark surfaces.
     */
    iconWell: 'rounded-lg border border-surface-border bg-surface-raised p-2.5 text-slate-200 shadow-sm',
    iconWellCompact:
      'rounded-lg border border-surface-border bg-surface-raised p-2 text-slate-200 shadow-sm ring-1 ring-surface-border/30',
    /**
     * Legacy **light** pill (near-white) — avoid on dark panels; use {@link segmentActiveBrandBorder} instead.
     */
    segmentSelected: 'bg-slate-200 text-slate-900 shadow-sm',
    /**
     * **Selected** segment / radio-style control — crisp **1px `border-brand`** + solid `surface-nav` (no ring/shadow:
     * those read muddy on charcoal and get clipped by `overflow-x-auto` toolbars).
     */
    segmentActiveBrandBorder: 'border border-brand bg-surface-nav font-semibold text-slate-50',
    /**
     * **Unselected** chip inside one continuous segment strip (dataset / sun filters on Areas) — transparent
     * border keeps width stable next to {@link segmentActiveBrandBorder}.
     */
    segmentInactiveInGroup: 'border border-transparent text-slate-400 hover:text-slate-200',
    /**
     * **Unselected** chip on card/raised toolbars (Regions type row, Sector edit map modes) — bordered idle state.
     */
    segmentIdleRaised:
      'border border-surface-border bg-surface-raised text-slate-300 transition-colors hover:bg-surface-raised-hover hover:text-slate-200',
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
     * Static info chips omit this — only interactive targets get the brand accent ring.
     */
    badgeLinkHover:
      'cursor-pointer transition-colors duration-150 hover:bg-surface-raised-hover hover:text-slate-200 hover:ring-1 hover:ring-brand-border/45',
    /**
     * Ring chip for downloads, map links, and other meta actions — matches {@link DownloadButton}.
     */
    metaChipInteractive:
      'inline-flex max-w-full cursor-pointer items-center gap-1 rounded-md bg-surface-raised px-2 py-0.5 text-[12px] font-medium text-slate-300 ring-1 ring-white/10 transition-colors duration-150 hover:bg-surface-raised-hover hover:text-slate-200 hover:ring-brand-border/45 sm:text-[13px]',
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
    /** Add (+) — create entity; sky accent so it reads separately from gold **edit** actions. */
    pageHeaderIconButtonAdd:
      'border-sky-400/45 bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 hover:text-sky-200 light:border-2 light:border-sky-700 light:bg-sky-100 light:text-sky-950 light:shadow-sm light:hover:border-sky-800 light:hover:bg-sky-200 light:hover:text-sky-950',
    /** Edit (pencil) — amber vs sky add; `light:*` matches `html[data-theme]` (see `index.css`). */
    pageHeaderIconButtonEdit:
      'border-amber-300/45 bg-amber-400/18 text-amber-100 hover:bg-amber-400/28 light:border-2 light:border-amber-700 light:bg-amber-100 light:text-amber-950 light:shadow-sm light:hover:border-amber-800 light:hover:bg-amber-200 light:hover:text-amber-950',
    pageHeaderIconGlyph: 'pointer-events-none h-3.5 w-3.5 sm:h-4 sm:w-4',
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
      'group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-t-lg border-b-2 border-transparent px-1 py-2.5 text-[12px] leading-tight font-medium transition-[color,background-color] sm:flex-row sm:gap-1.5 sm:px-3 sm:py-3 sm:text-[13px]',
    /** Capped-width bar reads better on 2-tab rows than a full-cell underline; active ink is brighter than idle. */
    tabBarButtonActive:
      'text-slate-50 after:pointer-events-none after:absolute after:bottom-0 after:left-1/2 after:h-[3px] after:w-[min(5.75rem,calc(100%-0.75rem))] after:max-w-[11rem] after:-translate-x-1/2 after:rounded-full after:bg-brand hover:bg-surface-raised-hover/35 light:text-slate-950 light:hover:bg-slate-200/65',
    tabBarButtonInactive:
      'text-slate-300 hover:bg-surface-raised-hover/50 hover:text-slate-100 light:text-slate-600 light:hover:bg-slate-200/80 light:hover:text-slate-900',
    /** Tab caption — `text-inherit` so label + icon share {@link tabBarButtonActive} / {@link tabBarButtonInactive} hover ink. */
    tabBarLabel: 'block min-w-0 truncate text-[12px] font-medium leading-tight text-inherit sm:text-[13px]',
    /** Inline-width tab pair (e.g. Sectors | Routes) — semibold; counts keep their own muted classes. */
    tabBarLabelInline: 'text-[12px] font-semibold leading-tight text-inherit whitespace-nowrap sm:text-[13px]',
    tabButton:
      'flex items-center gap-2 border-b-2 px-6 py-3 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors',
    navPill:
      'flex flex-col items-center gap-2 rounded-lg px-5 py-3 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors sm:flex-row',
    /** Show more / Show less under ExpandableMarkdown (Area overview) */
    expandableToggle: 'text-[13px] font-medium text-slate-400 transition-colors hover:text-slate-200 sm:text-[14px]',
    /**
     * Solid gold CTA (embed video Add, toolbars, etc.). Dark ink on `--color-brand` — never `type-on-accent` + `bg-brand`.
     */
    brandSolid: 'btn-brand-solid',
    /** Save / submit — always green (avoid brand yellow on primary actions) */
    savePrimary:
      'type-on-accent inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/45 bg-emerald-600 px-4 py-2 text-[12px] font-semibold shadow-sm transition-colors hover:border-emerald-400/55 hover:bg-emerald-500 disabled:pointer-events-none disabled:opacity-45 sm:text-[13px]',
    /** Modal footers — matches type-label weight with green fill */
    savePrimaryModal:
      'type-on-accent inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/45 bg-emerald-600 px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors hover:border-emerald-400/55 hover:bg-emerald-500 disabled:pointer-events-none disabled:opacity-45',
  },
  /**
   * Ascent / problem row / topo number colors (global): **green** ticked, **blue** todo, **red** dangerous.
   * Maps to `--color-status-*` in `index.css` (`text-status-ticked`, etc.).
   */
  ascentStatus: {
    ticked: 'text-status-ticked',
    todo: 'text-status-todo',
    dangerous: 'text-status-danger',
    rowBorderTicked: 'border-status-ticked/40',
    rowBorderTodo: 'border-status-todo/40',
    rowBorderDanger: 'border-status-danger/45',
    todoButtonOn:
      'border-status-todo/50 bg-status-todo/22 text-status-todo hover:bg-status-todo/32 light:border-2 light:border-sky-800 light:bg-sky-100 light:text-sky-950 light:shadow-sm light:hover:bg-sky-200 light:hover:text-sky-950',
    tickButtonOn:
      'border-status-ticked/45 bg-status-ticked/20 text-status-ticked hover:bg-status-ticked/28 light:border-2 light:border-emerald-800 light:bg-emerald-50 light:text-emerald-950 light:shadow-sm light:hover:bg-emerald-100 light:hover:text-emerald-950',
  },
  activityColors: {
    filter: {
      fa: 'text-brand/85',
      ticks: 'text-status-ticked/85',
      media: 'text-fuchsia-300/90',
      comments: 'text-red-300/85',
    },
    status: {
      fa: 'text-brand/80',
      ticks: 'text-status-ticked/80',
      media: 'text-fuchsia-300/90',
      comments: 'text-red-300/85',
    },
  },
} as const;
