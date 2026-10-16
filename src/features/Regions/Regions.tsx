import { useEffect, useState, type ComponentProps } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CircleMarker, useMap } from 'react-leaflet';
import { latLngBounds } from 'leaflet';
import { Globe, Loader2, PenLine, RotateCcw, Save, Trash2, X } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useMeta } from '../../shared/components/Meta/context';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { Card, SectionHeader } from '../../shared/ui';
import { DISCIPLINE_TYPES, isDisciplineType } from '../../utils/discipline';
import { postRegionOutline, useAccessToken } from '../../api';
import { captureSentryException } from '../../utils/sentry';
import type { components } from '../../@types/buldreinfo/swagger';

type Coordinates = components['schemas']['Coordinates'];

/**
 * Fits the map to the region that is being edited. `coordinates` is a snapshot captured when edit mode
 * is entered (not the live draft), so adding/removing points never moves the viewport under the user.
 */
const ZoomToOutline = ({ coordinates, enabled }: { coordinates: Coordinates[]; enabled: boolean }) => {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;
    const bounds = latLngBounds([]);
    coordinates.forEach((c) => bounds.extend([c.latitude ?? 0, c.longitude ?? 0]));
    if (bounds.isValid()) {
      map.fitBounds(bounds);
    }
  }, [coordinates, enabled, map]);

  return null;
};

const Regions = () => {
  const { t } = useTranslation();
  const meta = useMeta();
  const accessToken = useAccessToken();
  const { type } = useParams();
  /** Superadmin-only outline editor; only the active region of this deployment is editable. */
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Coordinates[]>([]);
  const [focusOutline, setFocusOutline] = useState<Coordinates[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!meta || !meta.regions || meta.regions.length === 0) return <Loading />;

  const selectedType = DISCIPLINE_TYPES.find((disciplineType) => disciplineType === type) ?? 'bouldering';

  const regionsInSelectedType = meta.regions.filter((region) => isDisciplineType(region, selectedType));
  const activeRegion = regionsInSelectedType.find((region) => region.active);
  const canEditOutline = meta.isSuperAdmin && !!activeRegion;

  // While editing, the active region renders the live draft (editable; no link/tooltip) and every other
  // region is drawn as a dimmed background polygon so the surrounding context stays visible.
  const outlines = regionsInSelectedType.map((region) =>
    editing && activeRegion && region.id === activeRegion.id
      ? { outline: draft }
      : { url: region.url, label: region.name, outline: region.outline, background: editing },
  );

  const startEditing = () => {
    const outline = activeRegion?.outline ?? [];
    setDraft([...outline]);
    setFocusOutline([...outline]);
    setError(null);
    setEditing(true);
  };

  const stopEditing = () => {
    setEditing(false);
    setDraft([]);
    setFocusOutline([]);
    setError(null);
  };

  const onMapClick: ComponentProps<typeof Leaflet>['onMouseClick'] = (event) => {
    setDraft((prev) => [...prev, { latitude: event.latlng.lat, longitude: event.latlng.lng }]);
  };

  const saveOutline = () => {
    setSaving(true);
    setError(null);
    postRegionOutline(accessToken, draft)
      .then(() => stopEditing())
      .catch((err) => {
        console.warn(err);
        captureSentryException(err);
        setError(t('regions.saveOutlineError'));
      })
      .finally(() => setSaving(false));
  };

  const overlayIconButton =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-surface-nav text-slate-300 transition-colors hover:bg-surface-raised-hover hover:text-slate-100 disabled:pointer-events-none disabled:opacity-40';

  const regionCount = regionsInSelectedType.length;
  const description = t(
    selectedType === 'bouldering'
      ? 'regions.summaryBouldering'
      : selectedType === 'climbing'
        ? 'regions.summaryRockClimbing'
        : 'regions.summaryIceClimbing',
    { count: regionCount },
  );

  return (
    <div className='w-full min-w-0'>
      <title>{t('meta.pageTitle', { page: t('regions.title'), site: meta.title })}</title>
      <meta name='description' content={description} />

      <Card flush className='min-w-0 border-0'>
        <div className='p-4 pb-3 sm:p-5 sm:pb-4'>
          <SectionHeader title={t('regions.title')} icon={Globe} subheader={description} />

          <div className='flex items-center gap-2'>
            <div className='flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-1'>
              {DISCIPLINE_TYPES.map((id) => (
                <Link
                  key={id}
                  to={`/regions/${id}`}
                  className={cn(
                    'inline-flex h-8 shrink-0 items-center justify-center rounded-full px-3 text-[12px] leading-none font-medium transition-colors sm:text-[13px]',
                    selectedType === id
                      ? designContract.surfaces.segmentActiveBrandBorder
                      : designContract.surfaces.segmentIdleRaised,
                  )}
                >
                  {id === 'bouldering'
                    ? t('regions.typeBouldering')
                    : id === 'climbing'
                      ? t('regions.typeRockClimbing')
                      : t('regions.typeIceClimbing')}
                </Link>
              ))}
            </div>
            {!editing && canEditOutline && activeRegion && (
              <button
                type='button'
                onClick={startEditing}
                title={t('regions.editOutline', { name: activeRegion.name })}
                aria-label={t('regions.editOutline', { name: activeRegion.name })}
                className={cn(
                  designContract.controls.pageHeaderIconButton,
                  designContract.controls.pageHeaderIconButtonEdit,
                )}
              >
                <PenLine className={designContract.controls.pageHeaderIconGlyph} />
              </button>
            )}
          </div>

          {editing && activeRegion && (
            <p className={cn('mt-3 text-slate-400', designContract.typography.detailBody)}>
              <Trans
                i18nKey='regions.editingOutline'
                values={{ name: activeRegion.name, points: t('counts.points', { count: draft.length }) }}
                components={{ name: <span className='font-semibold text-slate-200' /> }}
              />
            </p>
          )}
          {error && <p className='mt-2 text-[12px] font-medium text-red-400'>{error}</p>}
        </div>
        <div className='relative h-[68vh] overflow-hidden sm:h-[74vh] lg:h-[80vh]'>
          <Leaflet
            autoZoom={!editing}
            height='100%'
            outlines={outlines}
            defaultCenter={meta.defaultCenter}
            defaultZoom={meta.defaultZoom}
            onMouseClick={editing ? onMapClick : undefined}
            mapOverlay={
              editing ? (
                <div className='flex items-center gap-1.5'>
                  <button
                    type='button'
                    onClick={() => setDraft((prev) => prev.slice(0, -1))}
                    disabled={draft.length === 0}
                    title={t('regions.undoLastPoint')}
                    aria-label={t('regions.undoLastPoint')}
                    className={overlayIconButton}
                  >
                    <RotateCcw size={15} />
                  </button>
                  <button
                    type='button'
                    onClick={() => setDraft([])}
                    disabled={draft.length === 0}
                    title={t('regions.clearAllPoints')}
                    aria-label={t('regions.clearAllPoints')}
                    className={overlayIconButton}
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    type='button'
                    onClick={saveOutline}
                    disabled={saving}
                    className={designContract.controls.savePrimary}
                  >
                    {saving ? <Loader2 className='animate-spin' size={15} /> : <Save size={15} />}
                    {t('common.save')}
                  </button>
                  <button
                    type='button'
                    onClick={stopEditing}
                    disabled={saving}
                    className='border-surface-border bg-surface-nav hover:bg-surface-raised-hover inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-[12px] font-semibold text-slate-300 transition-colors hover:text-slate-100 disabled:pointer-events-none disabled:opacity-45 sm:text-[13px]'
                  >
                    <X size={15} />
                    {t('common.cancel')}
                  </button>
                </div>
              ) : undefined
            }
          >
            <ZoomToOutline coordinates={focusOutline} enabled={editing} />
            {editing &&
              draft.map((c, i) => (
                <CircleMarker
                  key={`${c.latitude},${c.longitude},${i}`}
                  center={[c.latitude ?? 0, c.longitude ?? 0]}
                  radius={5}
                  color='#f97316'
                />
              ))}
          </Leaflet>
        </div>
      </Card>
    </div>
  );
};

export default Regions;
