import { useState } from 'react';
import { Youtube, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';

type Info = {
  embedVideoUrl: string | undefined;
  embedThumbnailUrl: string | undefined;
  embedMilliseconds: number;
};

type Props = {
  addMedia: (_: Info) => void;
};

const INIT: Info = {
  embedVideoUrl: undefined,
  embedThumbnailUrl: undefined,
  embedMilliseconds: 0,
};

const VideoEmbedder = ({ addMedia }: Props) => {
  const [{ embedVideoUrl, embedThumbnailUrl, embedMilliseconds }, setInfo] = useState<Info>(INIT);

  const enabled = !!(embedVideoUrl && embedThumbnailUrl);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let videoUrl = e.target.value;
    let thumbnailUrl: string | undefined = undefined;
    let ms = 0;

    const regExp =
      /(http:|https:|)\/\/(player.|www.|m.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|shorts\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(&\S+)?/;
    const match = videoUrl.match(regExp);

    if (match) {
      const type = match[3];
      const id = match[6];
      if (type && id) {
        try {
          const urlObj = new URL(videoUrl.startsWith('http') ? videoUrl : `https://${videoUrl}`);
          let start = urlObj.searchParams.get('t') || urlObj.searchParams.get('start');

          if (!start && videoUrl.includes('vimeo') && videoUrl.includes('#t=')) {
            const ix = videoUrl.lastIndexOf('#t=');
            start = videoUrl.substring(ix + 3);
          }

          if (start) {
            start = start.toUpperCase();
            let total = 0;
            if (/^\d+$/.test(start)) {
              total = parseInt(start);
            } else {
              const hours = start.match(/(\d+)H/);
              const minutes = start.match(/(\d+)M/);
              const seconds = start.match(/(\d+)S/);
              if (hours) total += parseInt(hours[1]) * 3600;
              if (minutes) total += parseInt(minutes[1]) * 60;
              if (seconds) total += parseInt(seconds[1]);
            }
            if (total > 0) {
              ms = total * 1000;
            }
          }

          if (type === 'youtu.be' || type === 'youtube.com') {
            videoUrl = 'https://www.youtube.com/embed/' + id;
            thumbnailUrl = 'https://img.youtube.com/vi/' + id + '/0.jpg';
          } else if (type === 'vimeo.com') {
            videoUrl = 'https://player.vimeo.com/video/' + id;
            fetch('https://vimeo.com/api/v2/video/' + id + '.json')
              .then((data) => data.json())
              .then((json) =>
                setInfo((old) => ({
                  ...old,
                  embedThumbnailUrl: json[0].thumbnail_large,
                })),
              );
          }
        } catch (_e) {
          console.warn('Invalid URL format');
        }
      }

      setInfo({
        embedVideoUrl: videoUrl,
        embedThumbnailUrl: thumbnailUrl,
        embedMilliseconds: ms,
      });
    }
  };

  const handleAdd = () => {
    if (enabled) {
      addMedia({ embedVideoUrl, embedThumbnailUrl, embedMilliseconds });
      setInfo(INIT);
    }
  };

  return (
    <div className='flex w-full items-center gap-2'>
      <div className='relative flex-1 group'>
        <div className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand transition-colors'>
          <Youtube size={18} />
        </div>
        <input
          type='text'
          placeholder='YouTube/Vimeo URL (supports "t"-parameter)'
          className='w-full bg-surface-nav border border-surface-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand transition-all'
          onChange={handleChange}
          value={embedVideoUrl || ''}
        />
      </div>
      <button
        onClick={handleAdd}
        disabled={!enabled}
        className={cn(
          'flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg',
          enabled
            ? 'bg-brand text-white hover:bg-brand/90 shadow-brand/20'
            : 'bg-surface-nav text-slate-500 border border-surface-border cursor-not-allowed opacity-50 shadow-none',
        )}
      >
        <Plus size={16} />
        Add
      </button>
    </div>
  );
};

export default VideoEmbedder;
