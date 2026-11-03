import { useState, type ChangeEvent, type ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, FileSpreadsheet, Loader2, Save, Upload } from 'lucide-react';
import { useMeta } from '../../shared/components/Meta/context';
import { postTicksImport } from '../../api';
import { getUserFriendlyHttpErrorMessage, isHttpError } from '../../api/httpError';
import { Card, DownloadButton, SectionHeader } from '../../shared/ui';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import type { components } from '../../@types/buldreinfo/swagger';

type TickImportResult = components['schemas']['TickImportResult'];
type TickImportRow = components['schemas']['TickImportRow'];
type ImportStatus = NonNullable<TickImportRow['status']>;

/** Row outcomes and their catalog labels — the backend decides the status, the page only names it. */
const STATUS_LABEL = {
  OK: 'ticksImport.statusOk',
  SAVED: 'ticksImport.statusSaved',
  DUPLICATE: 'ticksImport.statusDuplicate',
  DUPLICATE_IN_FILE: 'ticksImport.statusDuplicateInFile',
  NOT_FOUND: 'ticksImport.statusNotFound',
  AMBIGUOUS: 'ticksImport.statusAmbiguous',
  INVALID: 'ticksImport.statusInvalid',
} as const;

/** Green = saved (or will be), red = needs the user's attention, grey = already ticked, so nothing happens. */
const STATUS_TONE: Record<ImportStatus, string> = {
  OK: 'border-emerald-500/45 bg-emerald-500/12 text-emerald-300',
  SAVED: 'border-emerald-500/45 bg-emerald-500/12 text-emerald-300',
  DUPLICATE: 'border-surface-border bg-surface-raised text-slate-400',
  DUPLICATE_IN_FILE: 'border-surface-border bg-surface-raised text-slate-400',
  NOT_FOUND: 'border-red-500/45 bg-red-500/12 text-red-300',
  AMBIGUOUS: 'border-red-500/45 bg-red-500/12 text-red-300',
  INVALID: 'border-red-500/45 bg-red-500/12 text-red-300',
};

const TH_CLASS = 'px-3 py-2 text-[11px] font-semibold tracking-wide whitespace-nowrap text-slate-400 uppercase';
const TD_CLASS = 'px-3 py-2 align-top text-[13px] leading-snug';
const CHIP_CLASS =
  'inline-flex items-center whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase';

/** Compact caption under a step title — one size for every explanation on the page. */
const STEP_BODY_CLASS = 'text-[12px] leading-snug text-slate-400 sm:text-[13px]';
const STEP_BADGE_CLASS =
  'border-surface-border bg-surface-raised mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold text-slate-400 tabular-nums';
const STEP_TITLE_CLASS = cn(designContract.typography.label, 'text-slate-200');

/**
 * One numbered step in the import flow. The hairline **between** steps comes from the parent's `divide-y`, so a step
 * owns only its own padding — a step that grows (an error message, a result table) pushes the next hairline down
 * without the siblings having to know about it.
 */
const Step = ({ step, title, children }: { step: number; title: string; children: ReactNode }) => (
  <section className='flex items-start gap-3 px-4 py-5 sm:gap-4 sm:px-6 sm:py-6'>
    <span aria-hidden className={STEP_BADGE_CLASS}>
      {step}
    </span>
    <div className='min-w-0 flex-1'>
      <h4 className={STEP_TITLE_CLASS}>{title}</h4>
      <div className='mt-3 space-y-3'>{children}</div>
    </div>
  </section>
);

const Stat = ({ label, value, tone }: { label: string; value: number; tone: string }) => (
  <div className={cn('bg-surface-nav border-surface-border rounded-lg border px-3 py-2.5', tone)}>
    <div className='text-[20px] leading-none font-semibold tabular-nums'>{value}</div>
    <div className='mt-1.5 text-[11px] leading-tight text-slate-400'>{label}</div>
  </div>
);

const ResultTable = ({ result }: { result: TickImportResult }) => {
  const { t } = useTranslation();
  return (
    <div className='bg-surface-nav border-surface-border overflow-x-auto rounded-lg border'>
      <table className='w-full min-w-[46rem] border-collapse text-left'>
        <caption className='sr-only'>{t('ticksImport.tableCaption')}</caption>
        <thead>
          <tr className='border-surface-border/60 border-b'>
            <th scope='col' className={cn(TH_CLASS, 'w-12')}>
              {t('ticksImport.columnRow')}
            </th>
            <th scope='col' className={TH_CLASS}>
              {t('ticksImport.columnProblem')}
            </th>
            <th scope='col' className={TH_CLASS}>
              {t('ticksImport.columnDate')}
            </th>
            <th scope='col' className={TH_CLASS}>
              {t('ticksImport.columnStars')}
            </th>
            <th scope='col' className={TH_CLASS}>
              {t('ticksImport.columnStatus')}
            </th>
            <th scope='col' className={TH_CLASS}>
              {t('ticksImport.columnMessage')}
            </th>
          </tr>
        </thead>
        <tbody>
          {(result.rows ?? []).map((row, index) => {
            const status = row.status ?? 'INVALID';
            const where = [row.area, row.sector].filter(Boolean).join(' · ');
            return (
              <tr key={row.row ?? index} className='border-surface-border/40 border-b last:border-0'>
                <td className={cn(TD_CLASS, 'text-slate-500 tabular-nums')}>{row.row}</td>
                <td className={TD_CLASS}>
                  <div className='font-medium text-slate-200'>{row.name}</div>
                  {where ? <div className='text-slate-500'>{where}</div> : null}
                </td>
                <td className={cn(TD_CLASS, 'whitespace-nowrap tabular-nums')}>{row.date}</td>
                <td className={cn(TD_CLASS, 'tabular-nums')}>{row.stars ?? ''}</td>
                <td className={TD_CLASS}>
                  <span className={cn(CHIP_CLASS, STATUS_TONE[status])}>{t(STATUS_LABEL[status])}</span>
                </td>
                <td className={cn(TD_CLASS, 'text-slate-400')}>{row.message}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const TicksImport = () => {
  const { t } = useTranslation();
  const meta = useMeta();
  const { getAccessTokenSilently } = useAuth0();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<TickImportResult | null>(null);
  const [committed, setCommitted] = useState<TickImportResult | null>(null);
  const [busy, setBusy] = useState<'preview' | 'commit' | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Preview and commit share one response shape; the newest one is what the table shows. */
  const result = committed ?? preview;
  const numReady = result?.numSaved ?? 0;

  const run = async (target: File, dryRun: boolean) => {
    setBusy(dryRun ? 'preview' : 'commit');
    setError(null);
    try {
      // Auth0 answers `undefined` when it cannot mint a token; the API layer expects `string | null`.
      const accessToken = (await getAccessTokenSilently()) ?? null;
      const imported = await postTicksImport(accessToken, target, dryRun);
      if (dryRun) {
        setPreview(imported);
        setCommitted(null);
      } else {
        setCommitted(imported);
      }
    } catch (err) {
      // Validation errors (wrong file type, unreadable workbook, …) arrive as 400 with the reason in the body.
      if (isHttpError(err)) {
        setError(err.details ?? getUserFriendlyHttpErrorMessage(err));
      } else {
        console.warn('Tick import failed:', err);
        setError(t('ticksImport.error'));
      }
    } finally {
      setBusy(null);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    // Clear the input so picking the same file again still fires a change event.
    e.target.value = '';
    if (!selected) return;
    setFile(selected);
    setPreview(null);
    setCommitted(null);
    void run(selected, true);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setCommitted(null);
    setError(null);
  };

  return (
    <div className='space-y-6'>
      <title>{t('meta.pageTitle', { page: t('ticksImport.title'), site: meta.title })}</title>
      <meta name='description' content={t('ticksImport.metaDescription')} />

      <Card flush className='min-w-0 border-0'>
        {/* Title with a two-sentence intro, then one hairline-separated block per step: template → upload → review. */}
        <div className='border-surface-border/40 border-b px-4 py-4 sm:px-6 sm:py-5'>
          <SectionHeader
            title={t('ticksImport.title')}
            icon={FileSpreadsheet}
            description={t('ticksImport.description')}
            className='mb-0'
          />
        </div>

        <div className='divide-surface-border/40 divide-y'>
          <Step step={1} title={t('ticksImport.stepTemplate')}>
            <DownloadButton href='/users/ticks/template'>{t('ticksImport.downloadTemplate')}</DownloadButton>
          </Step>

          <Step step={2} title={t('ticksImport.stepUpload')}>
            <label
              className={cn(
                'border-surface-border bg-surface-nav hover:border-brand-border/70 hover:bg-surface-raised flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-center transition-colors',
                'focus-within:ring-brand-border/70 focus-within:ring-2 focus-within:outline-none',
                busy !== null && 'pointer-events-none opacity-60',
              )}
            >
              {busy === 'preview' ? (
                <Loader2 size={18} strokeWidth={2} className='text-brand shrink-0 animate-spin' />
              ) : (
                <Upload size={18} strokeWidth={2} className='shrink-0 text-slate-400' />
              )}
              <span className='text-[13px] font-semibold text-slate-200'>
                {file ? t('ticksImport.changeFile') : t('ticksImport.chooseFile')}
              </span>
              {file ? <span className={cn(STEP_BODY_CLASS, 'max-w-full break-all')}>{file.name}</span> : null}
              <input
                type='file'
                accept='.xlsx,.xlsm'
                className='sr-only'
                disabled={busy !== null}
                onChange={onFileChange}
              />
            </label>

            {error ? (
              <div
                role='alert'
                className='flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] leading-snug break-words text-red-400'
              >
                <AlertCircle className='mt-0.5 shrink-0' size={14} />
                <span>{error}</span>
              </div>
            ) : null}
          </Step>

          {result ? (
            <Step step={3} title={t('ticksImport.stepReview')}>
              <div className='grid max-w-md grid-cols-3 gap-2'>
                <Stat
                  label={committed ? t('ticksImport.saved') : t('ticksImport.readyToImport')}
                  value={numReady}
                  tone={numReady > 0 ? 'text-emerald-300' : 'text-slate-300'}
                />
                <Stat label={t('ticksImport.skipped')} value={result.numSkipped ?? 0} tone='text-slate-300' />
                <Stat
                  label={t('ticksImport.failed')}
                  value={result.numFailed ?? 0}
                  tone={result.numFailed ? 'text-red-300' : 'text-slate-300'}
                />
              </div>

              <p className={STEP_BODY_CLASS}>{committed ? t('ticksImport.committed') : t('ticksImport.previewHint')}</p>

              <ResultTable result={result} />

              <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
                {preview && !committed ? (
                  <button
                    type='button'
                    onClick={() => {
                      if (file) void run(file, false);
                    }}
                    disabled={!file || busy !== null || numReady === 0}
                    className={cn(designContract.controls.savePrimary, 'shadow-lg disabled:shadow-none')}
                  >
                    {busy === 'commit' ? <Loader2 className='animate-spin' size={16} /> : <Save size={16} />}
                    {busy === 'commit' ? t('ticksImport.saving') : t('ticksImport.confirm', { numSaved: numReady })}
                  </button>
                ) : null}

                <button
                  type='button'
                  onClick={reset}
                  disabled={busy !== null}
                  className={cn(designContract.surfaces.metaChipInteractive, 'px-3 py-1.5')}
                >
                  {t('ticksImport.importAnother')}
                </button>
              </div>
            </Step>
          ) : null}
        </div>
      </Card>
    </div>
  );
};

export default TicksImport;
