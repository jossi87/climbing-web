import {
  useState,
  useEffect,
  useCallback,
  type ChangeEvent,
  type ComponentProps,
  type FormEvent,
  type UIEvent,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { parseCoordInput, sanitizeCoordInput, useCoordinateText } from '../../shared/hooks/useCoordinateText';
import { UsersSelector } from '../../shared/ui/UserSelector';
import RockSelector from '../../shared/components/RockSelector/RockSelector';
import ProblemSection from '../../shared/components/ProblemSection/ProblemSection';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { useGrades, useMeta } from '../../shared/components/Meta/context';
import {
  convertFromDateToString,
  convertFromStringToDate,
  postProblem,
  spaPathFromRedirectResponse,
  useAccessToken,
  useSector,
  useProblem,
} from '../../api';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { VisibilitySelectorField } from '../../shared/ui/VisibilitySelector';
import { useQueryClient } from '@tanstack/react-query';
import type { components } from '../../@types/buldreinfo/swagger';
import { captureSentryException, captureSentryMessage } from '../../utils/sentry';
import ExternalLink from '../../shared/ui/ExternalLinks';
import { Calendar, Save, ChevronDown, AlertTriangle, Edit, Loader2, MapPinOff, MapPin, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { twInk } from '../../design/twInk';
import { Card, FormSwitch, MarkdownFieldLabel, NotFoundCard, SectionHeader } from '../../shared/ui';
import { ensureDatePickerStyles } from '../../utils/ensureDatePickerStyles';
import { formatRouteTypeLabel } from '../../utils/routeTradGear';

type Problem = components['schemas']['Problem'];

const useIds = (): { sectorId: number; problemId: number } => {
  const { t } = useTranslation();
  const { sectorId, problemId } = useParams();
  if (!sectorId) throw new Error(t('place.missingSectorId'));
  if (!problemId) throw new Error(t('place.missingProblemId'));
  return { sectorId: +sectorId, problemId: +problemId };
};

function ProblemEditLoaderNotFound() {
  const meta = useMeta();
  const { t } = useTranslation();
  return (
    <>
      <title>{t('meta.pageTitle', { page: t('meta.notFound'), site: meta?.title ?? '' })}</title>
      <NotFoundCard className='mt-4 sm:mt-6' title='404' description={t('place.notFoundProblemDescription')} />
    </>
  );
}

export const ProblemEditLoader = () => {
  const { sectorId, problemId } = useIds();
  const { data: sector } = useSector(sectorId);
  const { data: problem, status: problemStatus, error } = useProblem(problemId, true);

  if (error) {
    return <ProblemEditLoaderNotFound />;
  }

  if (!sector) return <Loading />;
  if (problemStatus === 'pending' && problemId < 0) return <Loading />;

  const prob =
    problem ??
    ({
      id: -1,
      areaId: sector.areaId ?? 0,
      sectorId,
      broken: undefined,
      lockedAdmin: !!sector.lockedAdmin,
      lockedSuperadmin: !!sector.lockedSuperadmin,
      name: '',
      comment: '',
      rock: undefined,
      /*
       * Empty (not `'n/a'`) so the grade `<select>` defaults to its placeholder option ("Select grade…")
       * and the form's required-grade validation catches the omission. Forcing the user to pick a real
       * grade up-front beats having `'n/a'` survive into search / sorts / topo lists later.
       */
      originalGrade: '',
      fa: [],
      faDate: convertFromDateToString(new Date()),
      nr: 0,
      coordinates: undefined,
      trivia: '',
      startingAltitude: '',
      aspect: '',
      lengthMeter: undefined,
      descent: '',
    } satisfies Problem);

  return <ProblemEdit key={prob.id} problem={prob} sector={sector} />;
};

type Props = {
  problem: Problem;
  sector: components['schemas']['Sector'];
};

type SectorProblem = NonNullable<components['schemas']['Sector']['problems']>[number];
const isPlottableProblem = (
  problem: SectorProblem,
): problem is Required<Pick<SectorProblem, 'coordinates' | 'name'>> => {
  return problem.coordinates != null && problem.name !== undefined;
};

const ProblemEdit = ({ problem, sector }: Props) => {
  const { t } = useTranslation();
  useEffect(() => {
    void ensureDatePickerStyles();
  }, []);

  const client = useQueryClient();
  const accessToken = useAccessToken();
  const { sectorId, problemId } = useIds();
  const [data, setData] = useState<Problem>(problem);
  const [showSectorMarkers, setShowSectorMarkers] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const meta = useMeta();
  /** Grades of the area this sector belongs to — a problem's grade must come from that system. */
  const { easyToHard: grades } = useGrades(sector.gradeSystemId);

  const onFaDateChanged = useCallback((newFaDate: Date | undefined) => {
    if (!newFaDate) {
      setData((prev) => ({ ...prev, faDate: undefined }));
      return;
    }
    const year = newFaDate.getFullYear();
    const isValid = !isNaN(newFaDate.getTime()) && year > 1000;
    if (isValid) {
      const dateString = convertFromDateToString(newFaDate);
      setData((prevState) => {
        if (prevState.faDate === dateString) return prevState;
        return { ...prevState, faDate: dateString };
      });
    }
  }, []);

  const save = useCallback(
    async (event: UIEvent | FormEvent, data: Problem): Promise<string | false> => {
      event.preventDefault();
      const trash = !!data.trash;
      if (trash) {
        if (!confirm(t('problemEdit.confirmTrash'))) {
          captureSentryMessage('Decided to not delete problem', { problemId, sectorId });
          return false;
        }
      }
      setSaving(true);

      if (data.trash) {
        client.removeQueries({
          queryKey: [`/problems`, { id: data.id }],
        });
      }

      try {
        const res = await postProblem(
          accessToken,
          sectorId,
          problemId,
          data.broken ?? '',
          !!data.trash,
          !!data.lockedAdmin,
          !!data.lockedSuperadmin,
          data.name ?? '',
          data.rock ?? '',
          data.comment ?? '',
          data.originalGrade ?? '',
          data.fa,
          data.faDate ?? '',
          data.nr ?? 0,
          data.t?.id ? meta.types.find((t) => t.id === data.t?.id) || meta.types[0] : meta.types[0],
          data.coordinates ?? ({} as components['schemas']['Coordinates']),
          data.sections,
          [],
          data.faAid,
          data.trivia ?? '',
          data.externalLinks ?? [],
          data.startingAltitude ?? '',
          data.aspect ?? '',
          data.lengthMeter ?? 0,
          data.descent ?? '',
        );
        const path = spaPathFromRedirectResponse(res);
        if (path === null) {
          return false;
        }
        void client.invalidateQueries({
          predicate: (q) => {
            const key = q.queryKey;
            if (!Array.isArray(key) || key.length < 2) return false;
            const tag = key[0];
            const params = key[1] as { id?: number } | undefined;
            if (tag === '/sectors' && params?.id === sectorId) return true;
            if (tag === '/problems' && problemId > 0 && params?.id === problemId) return true;
            return false;
          },
        });
        return path ?? (problemId > 0 ? `/problem/${problemId}` : `/sector/${sectorId}`);
      } catch (error) {
        console.warn(error);
        captureSentryException(error);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [accessToken, client, meta.types, problemId, sectorId, t],
  );

  let defaultCenter: { lat: number; lng: number };
  let defaultZoom: number;
  if (data.coordinates?.latitude && data.coordinates?.longitude) {
    defaultCenter = { lat: data.coordinates.latitude, lng: data.coordinates.longitude };
    defaultZoom = 15;
  } else if (sector.parking?.latitude && sector.parking?.longitude) {
    defaultCenter = { lat: sector.parking.latitude, lng: sector.parking.longitude };
    defaultZoom = 15;
  } else {
    defaultCenter = meta.defaultCenter;
    defaultZoom = meta.defaultZoom;
  }

  /** Siblings first (blue label pins), then this problem last so the red “current” pin stacks on top at identical coords. */
  const markers: NonNullable<ComponentProps<typeof Leaflet>['markers']> = [];
  if (showSectorMarkers && sector.problems?.length) {
    markers.push(
      ...sector.problems
        .filter((p) => p.id !== problemId)
        .filter(isPlottableProblem)
        .map((p) => ({ coordinates: p.coordinates, label: p.name ?? '' })),
    );
  }
  if (data.coordinates) markers.push({ coordinates: data.coordinates });

  const sectorRocks =
    sector.problems
      ?.map((p) => p.rock)
      .filter((v): v is string => !!v)
      .filter((v, i, s) => s.indexOf(v) === i)
      .sort() ?? [];

  /*
   * Raw text-state for the lat / lng inputs (number → string round-trip would otherwise strip mid-typing
   * decimals — see {@link useCoordinateText} for the full rationale). The parsed numbers still live in
   * `data.coordinates`, so save / map preview / "Remove position" all work unchanged.
   */
  const lat = useCoordinateText(data.coordinates?.latitude);
  const lng = useCoordinateText(data.coordinates?.longitude);

  const setCoordField = (field: 'latitude' | 'longitude') => (e: ChangeEvent<HTMLInputElement>) => {
    /*
     * Sanitize first, then route the **same** string into both the displayed text state and the parsed write
     * to `data`. Sanitizing once at the boundary avoids a class of mismatch bugs where the visible text and
     * the persisted number disagree (e.g. typing `"x60"` would otherwise render as `"60"` after the
     * sanitizer but parse the raw `"x60"` to `NaN`, which the resync effect would then resync back to `""`).
     */
    const sanitized = sanitizeCoordInput(e.target.value);
    (field === 'latitude' ? lat.setText : lng.setText)(sanitized);
    setData((prev) => {
      const v = parseCoordInput(sanitized);
      const nextLat = field === 'latitude' ? v : prev.coordinates?.latitude;
      const nextLng = field === 'longitude' ? v : prev.coordinates?.longitude;
      if (nextLat == null && nextLng == null) {
        return { ...prev, coordinates: undefined };
      }
      return {
        ...prev,
        coordinates: { ...prev.coordinates, latitude: nextLat, longitude: nextLng },
      };
    });
  };

  const hasProblemCoords =
    data.coordinates != null && (data.coordinates.latitude != null || data.coordinates.longitude != null);

  /*
   * **Required-field validation** for the form. Centralised here so the `<select>` red-border / inline message
   * and the two save buttons (`Save` / `Save & add new`) all read from the same flags — drifting any of these
   * would let one entrypoint accept input the others reject.
   *
   * - **Name** is mandatory everywhere (single text input, blank check).
   * - **Grade** is mandatory but **`'n/a'` is a legal grade** (some problems / routes legitimately have no
   *   numeric grade — projects, ungraded variations, ice grades not in the table, etc.). It's just no longer
   *   the implicit *default*: `originalGrade` was historically initialised to `'n/a'` so people kept saving
   *   problems without thinking about the grade. We now default to `''` (placeholder option) and force the
   *   user to make an explicit pick — but `'n/a'` is still selectable in the dropdown and counts as a valid
   *   pick for the save check. Only blank counts as "missing".
   * - **Type** is mandatory **only on climbing route forms with more than one type**. Bouldering doesn't render
   *   the field; sectors with a single type auto-fall back to that one in {@link postProblem}, so requiring a
   *   manual pick there would be busywork. The `meta.types.length > 1` check mirrors that logic.
   */
  const gradeMissing = !data.originalGrade;
  const typeMissing = meta.types.length > 1 && !data.t?.id;
  const faDateWithoutGradeOrUsers = data.originalGrade === 'n/a' && !!data.faDate && (!data.fa || data.fa.length === 0);
  const canSave = !!data.name && !gradeMissing && !typeMissing && !faDateWithoutGradeOrUsers && !saving;

  const inputClasses =
    'problem-edit-field w-full bg-surface-nav border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white transition-colors focus:border-brand-border focus:outline-none focus:ring-0 focus-visible:ring-0';
  const labelClasses = 'ml-1 mb-1 block text-[12px] font-medium text-slate-400 sm:text-[13px]';

  /*
   * **Add vs Edit mode** — the route is `/problem/edit/:sectorId/:problemId`. **New** problems use
   * `problemId === 0` in the URL (see sector page link to `/problem/edit/${sectorId}/0`). The
   * loader then synthesises a placeholder with `internalProblem.id === -1` because `useProblem`
   * is `enabled` only for `id > 0`. We must key off the **URL param** (`problemId <= 0`), not
   * `problemId < 0` — otherwise Add mode never trips and the header stays "Edit …".
   *
   * Subtitle ("contact Jostein to move to another sector") is **hidden** in Add mode — the
   * problem doesn't exist yet, so there's nothing to move.
   */
  const isNew = problemId <= 0;
  const noun = t(meta.isBouldering ? 'problemEdit.nounProblem' : 'problemEdit.nounRoute');
  const headerTitle = isNew ? t('problemEdit.addNoun', { noun }) : t('problemEdit.editNoun', { noun });

  /** When `nr` is 0 the backend auto-assigns `maxNr + 1`. Show the actual next number instead of 0. */
  const maxNr = Math.max(0, ...(sector.problems ?? []).map((p) => p.nr ?? 0));
  const displayNr = isNew && data.nr === 0 ? maxNr + 1 : data.nr;

  return (
    <div className='w-full min-w-0 pb-20 text-left'>
      <title>
        {t('meta.pageTitle', {
          page: isNew ? t('problemEdit.addNoun', { noun }) : t('common.editNamed', { name: data.name ?? '' }),
          site: meta?.title ?? '',
        })}
      </title>

      <form
        id='problem-edit-form'
        className='mt-6 space-y-6'
        onSubmit={(e) => {
          e.preventDefault();
          void save(e, data).then((dest) => dest && navigate(dest));
        }}
      >
        {/* ── Basic info ── */}
        <Card>
          <SectionHeader
            title={headerTitle}
            icon={isNew ? Plus : Edit}
            description={
              isNew ? undefined : (
                <>
                  <Trans
                    i18nKey='problemEdit.contact'
                    values={{ noun }}
                    components={{
                      link: (
                        <a
                          href='mailto:jostein.oygarden@gmail.com'
                          className='hover:text-brand font-semibold text-slate-200'
                        />
                      ),
                    }}
                  />
                </>
              )
            }
          />
          <div className='space-y-4 p-3 sm:p-5'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <div className='space-y-2'>
                <label className={labelClasses}>{t('problemEdit.name')}</label>
                <input
                  className={cn(inputClasses, !data.name ? 'border-red-500/50' : '')}
                  value={data.name}
                  onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                />
                {!data.name && (
                  <p className='ml-1 text-[11px] font-bold text-red-500'>{t('problemEdit.nameRequired')}</p>
                )}
              </div>

              <VisibilitySelectorField
                value={{ lockedAdmin: !!data.lockedAdmin, lockedSuperadmin: !!data.lockedSuperadmin }}
                onChange={({ lockedAdmin, lockedSuperadmin }) =>
                  setData((prev) => ({ ...prev, lockedAdmin, lockedSuperadmin }))
                }
              />

              <div className='space-y-2'>
                <label className={labelClasses}>{t('problemEdit.number')}</label>
                <input
                  type='number'
                  className={inputClasses}
                  value={displayNr}
                  onChange={(e) => setData((prev) => ({ ...prev, nr: +e.target.value }))}
                />
              </div>

              <div className='space-y-2'>
                <label className={labelClasses}>{t('common.moveToTrash')}</label>
                <FormSwitch
                  checked={!!data.trash}
                  onChange={() => setData((prev) => ({ ...prev, trash: !prev.trash }))}
                  disabled={!data.id || data.id <= 0}
                  variant='danger'
                  aria-label={t('common.moveToTrash')}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <div className='space-y-2'>
                <label className={labelClasses}>{t('problemEdit.grade')}</label>
                <div className='relative'>
                  <select
                    className={cn(
                      inputClasses,
                      'cursor-pointer appearance-none pr-9',
                      gradeMissing && 'border-red-500/50',
                    )}
                    value={data.originalGrade ?? ''}
                    onChange={(e) => setData((prev) => ({ ...prev, originalGrade: e.target.value }))}
                  >
                    <option value='' disabled>
                      {t('problemEdit.selectGrade')}
                    </option>
                    {grades.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500'
                  />
                </div>
                {gradeMissing && (
                  <p className='ml-1 text-[11px] font-bold text-red-500'>{t('problemEdit.gradeRequired')}</p>
                )}
              </div>

              <div className='space-y-2'>
                <label className={labelClasses}>{t('problemEdit.faUsers')}</label>
                <UsersSelector
                  placeholder={t('problemEdit.selectFaUsers')}
                  users={data.fa ?? []}
                  onUsersUpdated={(users) =>
                    setData((prev) => ({
                      ...prev,
                      fa: users.map((u) => ({
                        id: typeof u.value === 'string' ? -1 : u.value,
                        name: u.label,
                      })),
                    }))
                  }
                />
              </div>

              <div className='space-y-2'>
                <label className={labelClasses}>{t('problemEdit.faDate')}</label>
                <div className='relative'>
                  <DatePicker
                    wrapperClassName='w-full'
                    className={cn(inputClasses, 'pr-3 pl-10', faDateWithoutGradeOrUsers && 'border-red-500/50')}
                    dateFormat='dd-MM-yyyy'
                    selected={data.faDate ? convertFromStringToDate(data.faDate) : undefined}
                    onChange={(date: Date | null) => onFaDateChanged(date ?? undefined)}
                  />
                  <Calendar
                    size={16}
                    className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-500'
                  />
                </div>
                {faDateWithoutGradeOrUsers && (
                  <p className='ml-1 text-[11px] font-bold text-red-500'>{t('problemEdit.faHint')}</p>
                )}
              </div>

              {!meta.isBouldering && (
                <div className='space-y-2'>
                  <label className={labelClasses}>{t('problemEdit.routeLength')}</label>
                  <input
                    type='number'
                    className={inputClasses}
                    value={data.lengthMeter ?? ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        lengthMeter: e.target.value === '' ? undefined : +e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </div>

            {meta.isBouldering && (
              <div className='space-y-2'>
                <label className={labelClasses}>{t('problemEdit.rock')}</label>
                <RockSelector
                  rock={data.rock ?? null}
                  onRockUpdated={(rock) => setData((prev) => ({ ...prev, rock: rock ?? undefined }))}
                  rocks={sectorRocks}
                  placeholder={t('problemEdit.searchRock')}
                />
              </div>
            )}

            {meta.isClimbing && (
              <>
                <div className='space-y-2'>
                  <label className={labelClasses}>{t('problemEdit.type')}</label>
                  <div className='relative'>
                    <select
                      className={cn(
                        inputClasses,
                        'cursor-pointer appearance-none pr-9',
                        typeMissing && 'border-red-500/50',
                      )}
                      value={data.t?.id ?? ''}
                      onChange={(e) => setData((p) => ({ ...p, t: { ...p.t, id: +e.target.value } }))}
                    >
                      {meta.types.length > 1 && (
                        <option value='' disabled>
                          {t('problemEdit.selectType')}
                        </option>
                      )}
                      {meta.types.map((t, i) => (
                        <option key={i} value={t.id}>
                          {formatRouteTypeLabel(t.type, t.subType)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500'
                    />
                  </div>
                  {typeMissing && (
                    <p className='ml-1 text-[11px] font-bold text-red-500'>{t('problemEdit.typeRequired')}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <label className={labelClasses}>{t('problemEdit.firstAid')}</label>
                  <div className='flex gap-1.5 sm:gap-2'>
                    <button
                      type='button'
                      onClick={() =>
                        setData((p) => ({
                          ...p,
                          faAid: {
                            ...(p.id != null && p.id > 0 ? { problemId: p.id } : {}),
                            date: '',
                            description: '',
                            users: [],
                          },
                        }))
                      }
                      className={cn(
                        designContract.typography.uiCompact,
                        'inline-flex min-h-7 items-center justify-center rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors sm:min-h-9 sm:px-4 sm:py-1.5 sm:text-[12px]',
                        data.faAid
                          ? 'border-brand/60 bg-brand/18 text-brand hover:bg-brand/28 light:border-brand/50 light:bg-brand/12 light:text-[#9a7d32] light:hover:bg-brand/20 border'
                          : cn(
                              'border-surface-border bg-surface-raised hover:bg-surface-raised-hover border text-slate-400 hover:text-slate-300',
                              'light:border-slate-300 light:bg-slate-100 light:text-[rgb(71_85_105)] light:hover:bg-slate-200',
                              twInk.lightHoverSlate800,
                            ),
                      )}
                    >
                      {t('common.yes')}
                    </button>
                    <button
                      type='button'
                      onClick={() => setData((p) => ({ ...p, faAid: undefined }))}
                      className={cn(
                        designContract.typography.uiCompact,
                        'inline-flex min-h-7 items-center justify-center rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors sm:min-h-9 sm:px-4 sm:py-1.5 sm:text-[12px]',
                        !data.faAid
                          ? 'border-brand/60 bg-brand/18 text-brand hover:bg-brand/28 light:border-brand/50 light:bg-brand/12 light:text-[#9a7d32] light:hover:bg-brand/20 border'
                          : cn(
                              'border-surface-border bg-surface-raised hover:bg-surface-raised-hover border text-slate-400 hover:text-slate-300',
                              'light:border-slate-300 light:bg-slate-100 light:text-[rgb(71_85_105)] light:hover:bg-slate-200',
                              twInk.lightHoverSlate800,
                            ),
                      )}
                    >
                      {t('common.no')}
                    </button>
                  </div>
                </div>

                {data.faAid && (
                  <div className='space-y-4'>
                    <p className='type-micro text-slate-500'>{t('problemEdit.firstAidHint')}</p>
                    <div className='space-y-2'>
                      <label className={labelClasses}>{t('problemEdit.firstAidClimbers')}</label>
                      <UsersSelector
                        placeholder={t('problemEdit.searchClimbers')}
                        users={data.faAid.users ?? []}
                        onUsersUpdated={(users) =>
                          setData((prev) =>
                            prev.faAid
                              ? {
                                  ...prev,
                                  faAid: {
                                    ...prev.faAid,
                                    users: users.map((u) => ({
                                      id: typeof u.value === 'string' ? -1 : u.value,
                                      name: u.label,
                                    })),
                                  },
                                }
                              : prev,
                          )
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className={labelClasses}>{t('problemEdit.firstAidDate')}</label>
                      <div className='relative'>
                        <DatePicker
                          wrapperClassName='w-full'
                          className={cn(inputClasses, 'pr-3 pl-10')}
                          dateFormat='dd-MM-yyyy'
                          selected={
                            data.faAid.date ? (convertFromStringToDate(data.faAid.date) ?? undefined) : undefined
                          }
                          onChange={(date: Date | null) => {
                            setData((prev) => {
                              if (!prev.faAid) return prev;
                              const dateString = date ? (convertFromDateToString(date) ?? '') : '';
                              return { ...prev, faAid: { ...prev.faAid, date: dateString } };
                            });
                          }}
                        />
                        <Calendar
                          size={16}
                          className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-500'
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <MarkdownFieldLabel className={labelClasses}>{t('problemEdit.firstAidNotes')}</MarkdownFieldLabel>
                      <textarea
                        className={cn(inputClasses, 'min-h-20 resize-none')}
                        value={data.faAid.description ?? ''}
                        placeholder={t('problemEdit.firstAidNotesPlaceholder')}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.faAid ? { ...prev, faAid: { ...prev.faAid, description: e.target.value } } : prev,
                          )
                        }
                      />
                    </div>
                  </div>
                )}

                <div className='space-y-2'>
                  <label className={labelClasses}>{t('problemEdit.pitches')}</label>
                  <ProblemSection
                    sections={data.sections ?? []}
                    gradeSystemId={sector.gradeSystemId}
                    onSectionsUpdated={(sections) => setData((p) => ({ ...p, sections }))}
                  />
                </div>
              </>
            )}

            {meta.isIce && (
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <div className='space-y-2'>
                  <label className={labelClasses}>{t('problemEdit.altitude')}</label>
                  <input
                    type='number'
                    className={inputClasses}
                    value={data.startingAltitude ?? ''}
                    onChange={(e) => setData((prev) => ({ ...prev, startingAltitude: e.target.value }))}
                  />
                </div>
                <div className='space-y-2'>
                  <label className={labelClasses}>{t('problemEdit.aspect')}</label>
                  <input
                    className={inputClasses}
                    value={data.aspect ?? ''}
                    onChange={(e) => setData((prev) => ({ ...prev, aspect: e.target.value }))}
                  />
                </div>
                <div className='space-y-2'>
                  <label className={labelClasses}>{t('common.descent')}</label>
                  <input
                    className={inputClasses}
                    value={data.descent ?? ''}
                    onChange={(e) => setData((prev) => ({ ...prev, descent: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className='space-y-2'>
              <MarkdownFieldLabel className={labelClasses}>{t('common.description')}</MarkdownFieldLabel>
              <textarea
                className={cn(inputClasses, 'min-h-30 resize-none')}
                value={data.comment}
                onChange={(e) => setData((prev) => ({ ...prev, comment: e.target.value }))}
              />
            </div>

            <div className='space-y-2'>
              <MarkdownFieldLabel className={labelClasses}>{t('problemEdit.trivia')}</MarkdownFieldLabel>
              <textarea
                className={cn(inputClasses, 'min-h-20 resize-none')}
                value={data.trivia}
                onChange={(e) => setData((prev) => ({ ...prev, trivia: e.target.value }))}
              />
            </div>

            <div className='relative'>
              <input
                className={cn(inputClasses, 'border-red-500/25 pl-10 focus:border-red-400/45')}
                value={data.broken}
                placeholder={t('problemEdit.brokenPlaceholder')}
                onChange={(e) => setData((prev) => ({ ...prev, broken: e.target.value }))}
              />
              <AlertTriangle
                className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-red-400/90'
                size={14}
              />
              <span className='bg-surface-card absolute -top-2 left-10 px-1 text-[11px] font-black tracking-tighter text-red-300/90 uppercase'>
                {t(meta.isBouldering ? 'problemEdit.brokenProblem' : 'problemEdit.brokenRoute')}
              </span>
            </div>

            <div>
              <ExternalLink
                externalLinks={data.externalLinks?.filter((l) => !l.inherited) || []}
                onExternalLinksUpdated={(links) => setData((p) => ({ ...p, externalLinks: links }))}
                hideLabel
                mobileFlat
              />
            </div>
          </div>
        </Card>

        {/* ── Map ── */}
        <Card>
          <SectionHeader title={t('place.map')} icon={MapPin} />
          <div className='relative z-0 h-[35vh] min-h-[220px] w-full overflow-hidden sm:h-[50vh]'>
            <Leaflet
              autoZoom={true}
              markers={markers}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              onMouseClick={(e) =>
                setData((p) => ({
                  ...p,
                  coordinates: {
                    ...p.coordinates,
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng,
                  },
                }))
              }
              height='100%'
              clusterMarkers={false}
            />
          </div>
          <div className='flex items-center gap-2 px-0 py-2 sm:gap-3 sm:px-0'>
            <FormSwitch
              checked={showSectorMarkers}
              onChange={() => setShowSectorMarkers(!showSectorMarkers)}
              variant='brand'
              aria-label={t('problemEdit.includeSiblingsAria')}
            />
            <span className='text-[12px] font-medium text-slate-300 sm:text-[13px]'>
              {t('problemEdit.includeSiblings')}
            </span>
            <div className='ml-auto'>
              <button
                type='button'
                onClick={() => setData((p) => ({ ...p, coordinates: undefined }))}
                disabled={!hasProblemCoords}
                title={hasProblemCoords ? t('problemEdit.removePositionTitle') : undefined}
                className={cn(
                  designContract.typography.uiCompact,
                  'inline-flex shrink-0 items-center gap-1 rounded-md border border-dashed border-orange-500/45 px-2 py-1 font-semibold tracking-wide text-orange-400 transition-colors',
                  'dark:hover:bg-surface-hover hover:border-orange-400/75 dark:hover:text-orange-300',
                  'light:border-orange-600/40 light:text-orange-700',
                  'light:hover:bg-orange-500/14 light:hover:border-orange-600/60 light:hover:text-orange-950',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                )}
              >
                <MapPinOff size={13} strokeWidth={2} aria-hidden />
                {t('problemEdit.removePosition')}
              </button>
            </div>
          </div>
          <div className='grid grid-cols-1 gap-4 px-0 pb-3 sm:grid-cols-2 sm:px-0 sm:pb-5'>
            <div className='space-y-1'>
              <label className={labelClasses}>{t('common.latitude')}</label>
              <input
                className={inputClasses}
                inputMode='decimal'
                placeholder='e.g. 59.123'
                value={lat.text}
                onChange={setCoordField('latitude')}
              />
            </div>
            <div className='space-y-1'>
              <label className={labelClasses}>{t('common.longitude')}</label>
              <input
                className={inputClasses}
                inputMode='decimal'
                placeholder='e.g. 10.456'
                value={lng.text}
                onChange={setCoordField('longitude')}
              />
            </div>
          </div>
        </Card>

        {/* ── Save / Cancel ── */}
        <div className='flex items-center justify-end gap-3'>
          <button
            type='button'
            onClick={() =>
              problemId && problemId > 0 ? navigate(`/problem/${problemId}`) : navigate(`/sector/${sectorId}`)
            }
            className='form-footer-cancel'
          >
            {t('common.cancel')}
          </button>
          {isNew && (
            <button
              type='button'
              onClick={(e) => save(e, data).then((dest) => dest && navigate(0))}
              disabled={!canSave}
              className='form-footer-secondary disabled:opacity-50'
            >
              {t('problemEdit.saveAndAddNew')}
            </button>
          )}
          <button
            type='submit'
            form='problem-edit-form'
            disabled={!canSave}
            className='type-label flex items-center gap-2 rounded-lg bg-emerald-400 px-8 py-2.5 text-slate-950 shadow-lg shadow-emerald-900/30 transition-all hover:bg-emerald-300 disabled:opacity-50'
          >
            {saving ? <Loader2 className='animate-spin' size={16} /> : <Save size={16} />}
            {t('problemEdit.saveNoun', { noun })}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProblemEditLoader;
