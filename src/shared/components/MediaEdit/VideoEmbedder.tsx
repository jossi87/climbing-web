import { useState, useCallback } from 'react';
import { Film, Plus, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

type Props = {
  addMedia: (info: {
    embedVideoUrl: string | undefined;
    embedThumbnailUrl: string | undefined;
    embedMilliseconds: number;
  }) => void;
  stack?: boolean;
};

const VideoEmbedder = ({ addMedia, stack }: Props) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      // Try to extract video ID from YouTube/Vimeo URLs
      let embedVideoUrl = url.trim();
      let embedThumbnailUrl: string | undefined;
      const embedMilliseconds = 0;

      // YouTube
      const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) {
        const videoId = ytMatch[1];
        embedVideoUrl = `https://www.youtube.com/embed/${videoId}`;
        embedThumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }

      // Vimeo
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        const videoId = vimeoMatch[1];
        embedVideoUrl = `https://player.vimeo.com/video/${videoId}`;
        try {
          const res = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`);
          const data = await res.json();
          if (data?.[0]?.thumbnail_large) {
            embedThumbnailUrl = data[0].thumbnail_large;
          }
        } catch {
          // Ignore thumbnail fetch errors
        }
      }

      addMedia({ embedVideoUrl, embedThumbnailUrl, embedMilliseconds });
      setUrl('');
    } finally {
      setLoading(false);
    }
  }, [url, addMedia]);

  return (
    <div
      className={cn(
        'border-surface-border bg-surface-raised flex flex-col gap-2 rounded-xl border p-3 sm:p-4',
        stack ? '' : '',
      )}
    >
      <div className='flex items-center gap-2'>
        <Film size={16} className='shrink-0 text-slate-400' aria-hidden />
        <input
          type='text'
          placeholder='YouTube / Vimeo URL…'
          className={cn(
            designContract.typography.body,
            'bg-surface-nav border-surface-border/80 focus:border-brand h-9 min-w-0 flex-1 rounded-lg border px-3 py-0 leading-none transition-[color,background-color,border-color] outline-none placeholder:text-slate-500/85 focus:ring-0 focus:outline-none focus-visible:ring-0',
          )}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void handleAdd();
            }
          }}
        />
        <button
          type='button'
          onClick={() => void handleAdd()}
          disabled={!url.trim() || loading}
          className={cn(
            designContract.typography.uiCompact,
            'bg-surface-raised hover:bg-surface-raised-hover border-surface-border inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border px-3 font-semibold tracking-wide text-slate-300 transition-colors hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          {loading ? <Loader2 size={14} className='animate-spin' /> : <Plus size={14} />}
          Add
        </button>
      </div>
    </div>
  );
};

export default VideoEmbedder;
