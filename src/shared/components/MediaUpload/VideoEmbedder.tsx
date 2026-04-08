import { useState } from 'react';
import { Video, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

type EmbedInfo = {
  embedVideoUrl: string | undefined;
  embedThumbnailUrl: string | undefined;
  embedMilliseconds: number;
};

type State = EmbedInfo & {
  rawUrl: string;
};

type Props = {
  addMedia: (_: EmbedInfo) => void;
};

const INIT: State = {
  rawUrl: '',
  embedVideoUrl: undefined,
  embedThumbnailUrl: undefined,
  embedMilliseconds: 0,
};

const URL_RE =
  /(http:|https:|)\/\/(player.|www.|m.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|shorts\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(&\S+)?/;

const VideoEmbedder = ({ addMedia }: Props) => {
  const [{ rawUrl, embedVideoUrl, embedThumbnailUrl, embedMilliseconds }, setInfo] = useState<State>(INIT);

  const canAdd = !!(embedVideoUrl && embedThumbnailUrl);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const t = raw.trim();
    /** Regex requires `//` — prepend `https://` so `youtu.be/…` and `www.youtube.com/…` parse while typing. */
    const normalizedForParse = t.length === 0 ? '' : /^https?:\/\//i.test(t) ? t : `https://${t}`;
    const match = normalizedForParse.match(URL_RE);

    if (!match) {
      setInfo({ ...INIT, rawUrl: raw });
      return;
    }

    const type = match[3];
    const id = match[6];
    if (!type || !id) {
      setInfo({ ...INIT, rawUrl: raw });
      return;
    }

    let videoUrl = normalizedForParse;
    let thumbnailUrl: string | undefined;
    let ms = 0;

    try {
      const urlObj = new URL(normalizedForParse);
      let start = urlObj.searchParams.get('t') || urlObj.searchParams.get('start');

      if (!start && normalizedForParse.includes('vimeo') && normalizedForParse.includes('#t=')) {
        const ix = normalizedForParse.lastIndexOf('#t=');
        start = normalizedForParse.substring(ix + 3);
      }

      if (start) {
        const up = start.toUpperCase();
        let total = 0;
        if (/^\d+$/.test(up)) {
          total = parseInt(up, 10);
        } else {
          const hours = up.match(/(\d+)H/);
          const minutes = up.match(/(\d+)M/);
          const seconds = up.match(/(\d+)S/);
          if (hours) total += parseInt(hours[1], 10) * 3600;
          if (minutes) total += parseInt(minutes[1], 10) * 60;
          if (seconds) total += parseInt(seconds[1], 10);
        }
        if (total > 0) ms = total * 1000;
      }

      if (type === 'youtu.be' || type === 'youtube.com') {
        videoUrl = `https://www.youtube.com/embed/${id}`;
        thumbnailUrl = `https://img.youtube.com/vi/${id}/0.jpg`;
      } else if (type === 'vimeo.com') {
        videoUrl = `https://player.vimeo.com/video/${id}`;
        thumbnailUrl = undefined;
        fetch(`https://vimeo.com/api/v2/video/${id}.json`)
          .then((data) => data.json())
          .then((json) =>
            setInfo((old) => ({
              ...old,
              embedThumbnailUrl: old.rawUrl === raw ? json[0]?.thumbnail_large : old.embedThumbnailUrl,
            })),
          )
          .catch(() => {});
      }
    } catch (_e) {
      console.warn('Invalid URL format');
      setInfo({ ...INIT, rawUrl: raw });
      return;
    }

    setInfo({
      rawUrl: raw,
      embedVideoUrl: videoUrl,
      embedThumbnailUrl: thumbnailUrl,
      embedMilliseconds: ms,
    });
  };

  const handleAdd = () => {
    if (canAdd) {
      addMedia({ embedVideoUrl, embedThumbnailUrl, embedMilliseconds });
      setInfo(INIT);
    }
  };

  return (
    <div className='flex w-full min-w-0 flex-row items-center gap-2'>
      <div className='group relative min-w-0 flex-1'>
        <div className='group-focus-within:text-brand pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-500 transition-colors sm:left-3'>
          <Video size={16} className='sm:h-[18px] sm:w-[18px]' />
        </div>
        <input
          type='text'
          placeholder='YouTube or Vimeo URL'
          className='bg-surface-nav border-surface-border type-body focus:border-brand-border min-h-9 w-full min-w-0 rounded-lg border py-2 pr-3 pl-9 text-[13px] transition-[border-color] focus:ring-0 focus:outline-none focus-visible:ring-0 sm:min-h-0 sm:rounded-xl sm:py-2.5 sm:pr-4 sm:pl-10 sm:text-base'
          onChange={handleChange}
          value={rawUrl}
        />
      </div>
      <button
        type='button'
        onClick={handleAdd}
        disabled={!canAdd}
        aria-label='Add embedded video'
        className={cn(
          'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-auto sm:w-auto sm:gap-2 sm:rounded-xl sm:px-6 sm:py-2.5',
          canAdd
            ? cn(designContract.controls.brandSolid, 'shadow-md shadow-black/20')
            : 'type-label bg-surface-nav border-surface-border cursor-not-allowed border text-slate-500',
        )}
      >
        <Plus size={16} className='shrink-0' />
        <span className={cn(designContract.typography.label, 'max-sm:sr-only')}>Add</span>
      </button>
    </div>
  );
};

export default VideoEmbedder;
