import { useState, useCallback, useRef } from 'react';
import { Film, Plus, Loader2, Image, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { postMediaInstagramScrape } from '../../../api';
import type { components } from '../../../@types/buldreinfo/swagger';

type InstagramMedia = components['schemas']['InstagramMedia'];

type Props = {
  addMedia: (info: {
    embedVideoUrl: string | undefined;
    embedThumbnailUrl: string | undefined;
    embedMilliseconds: number;
    /** Instagram-specific: the selected CDN URL to pass as header on save */
    instagramSelectedCdnUrl?: string;
    /** Instagram-specific: whether the selected media is a video */
    instagramSelectedIsVideo?: boolean;
    /** Instagram-specific: the media index for carousel posts */
    instagramSelectedMediaIndex?: number;
  }) => void;
  stack?: boolean;
  /** Access token for authenticated API calls (needed for Instagram scraping) */
  getAccessToken?: () => Promise<string>;
};

/**
 * Extract a YouTube video ID from various URL formats using the URL API.
 * Handles:
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://www.youtube.com/watch?feature=shared&v=VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - https://www.youtube.com/v/VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 *   - https://m.youtube.com/watch?v=VIDEO_ID
 */
function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host === 'youtu.be') {
      return u.pathname.slice(1).split('/')[0] || null;
    }
    if (host === 'www.youtube.com' || host === 'm.youtube.com' || host === 'youtube.com') {
      // Path patterns: /embed/ID, /v/ID, /shorts/ID
      const pathMatch = u.pathname.match(/^\/(?:embed|v|shorts)\/([a-zA-Z0-9_-]{11})/);
      if (pathMatch) return pathMatch[1];
      // Query param v=
      const v = u.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
    }
  } catch {
    // Invalid URL
  }
  return null;
}

/**
 * Check if a URL is an Instagram URL.
 */
function isInstagramUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return host === 'www.instagram.com' || host === 'instagram.com';
  } catch {
    return false;
  }
}

/**
 * Strip query params and hash from an Instagram URL, returning the clean base URL
 * (e.g. "https://www.instagram.com/p/DZHgtpKiPdn/").
 */
function stripInstagramUrlParams(url: string): string {
  try {
    const u = new URL(url);
    u.search = '';
    u.hash = '';
    return u.toString();
  } catch {
    return url;
  }
}

const MediaEmbedder = ({ addMedia, stack, getAccessToken }: Props) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [instagramItems, setInstagramItems] = useState<InstagramMedia[] | null>(null);
  const [instagramError, setInstagramError] = useState<string | null>(null);
  /** Track which carousel items have been added (by mediaIndex) so they can be visually dimmed */
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  /** Persist the base Instagram URL across multiple selections (ref, not state, so it survives setUrl('')) */
  const instagramBaseUrlRef = useRef<string>('');

  const handleAdd = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setInstagramError(null);
    setInstagramItems(null);

    try {
      // Instagram URL handling (available to all authenticated users)
      if (isInstagramUrl(url) && getAccessToken) {
        const token = await getAccessToken();
        const results = await postMediaInstagramScrape(token, url.trim());
        if (results.length === 0) {
          setInstagramError('No Instagram media found at this URL.');
          return;
        }
        if (results.length === 1) {
          // Single result — add directly, no selection step needed
          const item = results[0];
          if (item.cdnUrl) {
            // embedVideoUrl should be the original Instagram link (with index for carousel posts),
            // not the CDN URL. The CDN URL is passed via instagramSelectedCdnUrl so the server
            // can download the media.
            // Strip any existing query params/hash from the URL first, then append ?img_index=N
            // (1-based, matching Instagram's convention).
            const baseUrl = stripInstagramUrlParams(url.trim());
            const mediaIndex = item.mediaIndex ?? 0;
            const embedUrl = baseUrl + '?img_index=' + (mediaIndex + 1);
            addMedia({
              embedVideoUrl: embedUrl,
              embedThumbnailUrl: item.cdnUrl,
              embedMilliseconds: 0,
              instagramSelectedCdnUrl: item.cdnUrl,
              instagramSelectedIsVideo: item.isVideo ?? false,
              instagramSelectedMediaIndex: mediaIndex,
            });
            setUrl('');
          }
          return;
        }
        // Multiple results — show list for user to choose from
        // Store the cleaned base URL so it persists across multiple selections
        instagramBaseUrlRef.current = stripInstagramUrlParams(url.trim());
        setInstagramItems(results);
        return;
      }

      // Try to extract video ID from YouTube/Vimeo URLs
      let embedVideoUrl = url.trim();
      let embedThumbnailUrl: string | undefined;
      const embedMilliseconds = 0;

      // YouTube
      const videoId = extractYoutubeId(url);
      if (videoId) {
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
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to process URL';
      setInstagramError(msg);
    } finally {
      setLoading(false);
    }
  }, [url, addMedia, getAccessToken]);

  const handleSelectInstagram = useCallback(
    (item: InstagramMedia) => {
      if (!item.cdnUrl) return;
      const mediaIndex = item.mediaIndex ?? 0;
      // Mark this item as selected so it gets visually dimmed
      setSelectedIndices((prev) => new Set(prev).add(mediaIndex));
      // embedVideoUrl should be the original Instagram link (with index for carousel posts),
      // not the CDN URL. The CDN URL is passed via instagramSelectedCdnUrl so the server
      // can download the media. The thumbnail uses the CDN URL for preview.
      // Use the stored base URL from the ref (survives setUrl('') across multiple selections).
      const baseUrl = instagramBaseUrlRef.current;
      const embedUrl = baseUrl + '?img_index=' + (mediaIndex + 1);
      addMedia({
        embedVideoUrl: embedUrl,
        embedThumbnailUrl: item.cdnUrl,
        embedMilliseconds: 0,
        instagramSelectedCdnUrl: item.cdnUrl,
        instagramSelectedIsVideo: item.isVideo ?? false,
        instagramSelectedMediaIndex: mediaIndex,
      });
      // Don't clear the list — user may want to add more items from the carousel
      setUrl('');
    },
    [addMedia],
  );

  const handleCancelInstagram = useCallback(() => {
    setInstagramItems(null);
    setInstagramError(null);
  }, []);

  const placeholder = 'YouTube / Vimeo / Instagram URL…';

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
          placeholder={placeholder}
          className={cn(
            designContract.typography.body,
            'bg-surface-nav border-surface-border/80 focus:border-brand h-9 min-w-0 flex-1 rounded-lg border px-3 py-0 leading-none transition-[color,background-color,border-color] outline-none placeholder:text-slate-500/85 focus:ring-0 focus:outline-none focus-visible:ring-0',
          )}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setInstagramError(null);
            setInstagramItems(null);
            setSelectedIndices(new Set());
          }}
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

      {/* Instagram items list — user selects which post(s) to add */}
      {instagramItems && instagramItems.length > 0 && (
        <div className='mt-2 space-y-2'>
          <div className='flex items-center gap-2 text-xs font-medium text-slate-400'>
            <Image size={14} />
            Select Instagram post(s) to add
          </div>
          <div className='flex flex-wrap gap-3'>
            {instagramItems.map((item, idx) => {
              const mediaIndex = item.mediaIndex ?? 0;
              const isSelected = selectedIndices.has(mediaIndex);
              return (
                <div
                  key={idx}
                  className={cn('flex flex-col items-center gap-2 transition-opacity', isSelected && 'opacity-40')}
                >
                  {item.cdnUrl &&
                    (item.isVideo ? (
                      <video
                        src={item.cdnUrl}
                        className='h-24 w-24 rounded-lg object-cover'
                        controls
                        crossOrigin='anonymous'
                        {...({ referrerPolicy: 'no-referrer' } as React.HTMLAttributes<HTMLVideoElement>)}
                      />
                    ) : (
                      <img
                        src={item.cdnUrl}
                        alt={`Instagram post ${idx + 1}`}
                        className='h-24 w-24 rounded-lg object-cover'
                        referrerPolicy='no-referrer'
                      />
                    ))}
                  <button
                    type='button'
                    onClick={() => handleSelectInstagram(item)}
                    disabled={isSelected}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                      isSelected
                        ? 'bg-surface-raised cursor-not-allowed text-slate-500'
                        : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300',
                    )}
                  >
                    {isSelected ? <Check size={12} /> : <Plus size={12} />}
                    {isSelected ? 'Added' : 'Add'}
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type='button'
            onClick={handleCancelInstagram}
            className='inline-flex items-center gap-1 rounded-lg border border-white/12 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700'
          >
            Cancel
          </button>
        </div>
      )}

      {/* Instagram error */}
      {instagramError && <p className='mt-1 text-xs text-red-400'>{instagramError}</p>}
    </div>
  );
};

export default MediaEmbedder;
