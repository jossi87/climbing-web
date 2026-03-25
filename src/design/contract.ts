export const designContract = {
  typography: {
    title: 'type-h1',
    subtitle: 'type-h2',
    body: 'type-body',
    meta: 'type-small',
    label: 'type-label',
  },
  layout: {
    pageSection: 'w-full pb-4 sm:pb-6',
    frontpageGrid: 'grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:gap-8',
    asideStack: 'space-y-4 self-start sm:space-y-6 lg:sticky lg:top-20',
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
  },
  controls: {
    chipButton: 'btn-glass',
    chipButtonActive: 'btn-glass-active',
    listRow: 'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5',
    tabButton:
      'flex items-center gap-2 border-b-2 px-6 py-3 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors',
    navPill:
      'flex flex-col items-center gap-2 rounded-lg px-5 py-3 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors sm:flex-row',
  },
} as const;
