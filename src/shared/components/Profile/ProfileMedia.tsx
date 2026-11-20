import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Images, LayoutGrid, Rotate3d, Video } from 'lucide-react';
import { Loading } from '../../ui/StatusWidgets';
import { useProfileMedia } from '../../../api';
import Media from '../Media/Media';
import { useMeta } from '../Meta';
import { MetaContext } from '../Meta/context';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import {
  activityFilterChipBase,
  activityFilterChipOff,
  activityFilterChipOn,
} from '../../../design/activityFilterChips';

type MediaItem = components['schemas']['Media'];

type Props = {
  userId: number;
  captured: boolean;
};

/**
 * The profile galleries mix stills, videos and 360° panoramas, so a small type filter sits above the grid.
 * `is360` is checked first: a panorama is a still here (360° videos are not supported), and the tile badge says
 * “360°” — the filter has to agree with what the tile shows.
 */
type MediaKind = 'photo' | 'video' | 'pano';
type MediaKindFilter = 'all' | MediaKind;

const mediaKind = (m: MediaItem): MediaKind => (m.is360 ? 'pano' : m.isMovie ? 'video' : 'photo');

const KIND_OPTIONS = [
  { kind: 'all', icon: LayoutGrid, labelKey: 'profile.mediaFilter.all' },
  { kind: 'photo', icon: Images, labelKey: 'profile.mediaFilter.photo' },
  { kind: 'video', icon: Video, labelKey: 'profile.mediaFilter.video' },
  { kind: 'pano', icon: Rotate3d, labelKey: 'profile.mediaFilter.pano' },
] as const;

const ProfileMedia = ({ userId, captured }: Props) => {
  const { t } = useTranslation();
  const { data, isLoading } = useProfileMedia({ userId, captured });
  const meta = useMeta();
  const [kind, setKind] = useState<MediaKindFilter>('all');

  const counts = useMemo(() => {
    const byKind: Record<MediaKind, number> = { photo: 0, video: 0, pano: 0 };
    for (const m of data ?? []) byKind[mediaKind(m)] += 1;
    return byKind;
  }, [data]);

  /** Only types the gallery actually contains are offered (plus `All`); a single-type gallery gets no filter row. */
  const kinds = useMemo(() => KIND_OPTIONS.filter((o) => o.kind === 'all' || counts[o.kind] > 0), [counts]);

  /** Fall back to `All` if the selected type disappears, so the grid never sits empty because of the filter. */
  const activeKind: MediaKindFilter = kind !== 'all' && counts[kind] === 0 ? 'all' : kind;

  const filtered = useMemo(
    () => (activeKind === 'all' ? (data ?? []) : (data ?? []).filter((m) => mediaKind(m) === activeKind)),
    [data, activeKind],
  );

  if (isLoading) {
    return <Loading inline />;
  }

  if (!data || data.length === 0) {
    return <div className='py-10 text-center text-slate-500'>{t('problemList.empty')}</div>;
  }

  return (
    <>
      {kinds.length > 2 && (
        <div
          role='group'
          aria-label={t('profile.mediaFilter.label')}
          className='mb-1.5 flex flex-wrap items-center justify-end gap-1 sm:mb-2 sm:gap-1.5'
        >
          {kinds.map(({ kind: option, icon: Icon, labelKey }) => {
            const isActive = activeKind === option;
            const label = t(labelKey);
            const ink = isActive ? 'light:text-slate-950 text-slate-100' : 'light:text-slate-600 text-slate-500';
            return (
              <button
                key={option}
                type='button'
                aria-pressed={isActive}
                title={label}
                onClick={() => setKind(option)}
                className={cn(
                  activityFilterChipBase,
                  isActive ? activityFilterChipOn : activityFilterChipOff,
                  'h-6 gap-1 px-2 sm:h-7 sm:gap-1.5 sm:px-2.5',
                )}
              >
                <Icon size={12} strokeWidth={2} className={cn('shrink-0', ink)} aria-hidden />
                <span className={cn(designContract.typography.uiCompact, ink)}>{label}</span>
              </button>
            );
          })}
        </div>
      )}
      <MetaContext.Provider value={meta}>
        <Media
          pitches={null}
          media={filtered}
          orderableMedia={null}
          carouselMedia={filtered}
          optProblemId={null}
          showLocation={true}
          compactTiles
        />
      </MetaContext.Provider>
    </>
  );
};

export default ProfileMedia;
