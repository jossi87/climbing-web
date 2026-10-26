import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { useTapActivation } from '../../hooks/useTapActivation';
import { VideoPlayOverlayDisc } from './VideoThumbnailPlayOverlay';

/**
 * What the video stage is doing. Every state except `buffering` is something a user must be able to tell apart at a
 * glance — "nothing is happening yet" and "I paused it by accident" used to look identical.
 *
 * - `idle`: nothing has been asked of the player yet. The poster is the stage and its play disc is what starts the
 *   stream, so this is the one phase whose tap must reach a `play()` call *inside* the gesture.
 * - `loading`: playback was requested, no frame yet — the network is the bottleneck.
 * - `blocked`: the element has data but sits paused, so the browser refused the autoplay and waits for a gesture.
 * - `paused`: a frame is on screen and playback is paused (by the user, or after seeking / a chapter jump).
 * - `buffering`: playing, but the next fragment has not arrived — the last frame stays on screen.
 * - `error`: fatal failure; the stream will not continue without a reload.
 */
export type VideoOverlayPhase = 'idle' | 'loading' | 'blocked' | 'paused' | 'buffering' | 'error';

type Props = {
  /** `null` leaves the stage untouched — the healthy, playing case. */
  phase: VideoOverlayPhase | null;
  /** Start (or restart) playback. Never pauses, whatever the element's own control believes. */
  onEnsurePlayback: () => void;
  /** Rebuild the stream after a fatal failure — hls.js has stopped and offers no resume of its own. */
  onRetry: () => void;
};

/**
 * Disc behind every overlay glyph. Literal slate plus hex ink instead of the theme-reactive tokens, for the same
 * reason the modal's toolbar buttons use them: the stage is charcoal in **both** themes. `index.css` keeps slate ink
 * light inside `.media-modal-dark-chrome`, which this overlay always sits in.
 */
const discShell =
  'flex shrink-0 items-center justify-center rounded-full bg-slate-900/85 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/20 backdrop-blur-sm';

/** The error panel's reload button. */
const retryButtonClass = cn(
  designContract.controls.brandSolid,
  'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-transform active:scale-95',
);

/**
 * Stage overlay for a video that is not simply playing: not asked for yet, still loading, waiting for a gesture,
 * paused, stalled, or dead. Rendered on top of the `<video>`, which is what makes a tap mean one thing per phase
 * instead of reaching a native control whose state (play or pause) the user cannot see.
 */
export function VideoPlaybackOverlay({ phase, onEnsurePlayback, onRetry }: Props) {
  const { t } = useTranslation();
  // Called before the early return below so the hook order stays stable for a stage with no overlay.
  // The disc answers `pointerup` as well as `click` (`useTapActivation`): a click the carousel suppressor or the
  // browser withholds would otherwise leave it dead however correct `onEnsurePlayback` is. This is a real `<button>`,
  // so a click with no press behind it (keyboard, assistive tech) counts as a tap too.
  const tap = useTapActivation({ onTap: onEnsurePlayback, activateOnClick: true });
  if (phase === null) return null;

  if (phase === 'idle') {
    // The poster is doing the talking, so this has to look exactly like the disc the poster carried before there was
    // a player to hang it on: no scrim, no wording, nothing over the picture but the button. It spans the whole stage
    // because a movie starts on a tap anywhere on it — and that tap has to be the one that leads to `play()`.
    return (
      <button
        type='button'
        {...tap}
        aria-label={t('media.play')}
        className='absolute inset-0 z-20 flex cursor-pointer items-center justify-center'
      >
        <VideoPlayOverlayDisc size='modal' />
      </button>
    );
  }

  if (phase === 'buffering') {
    // Deliberately no scrim and no hit target: the last frame must stay visible — that is what separates a stall
    // from a start-up — and taps keep reaching the native controls, so a stall can never swallow a pause or a scrub.
    return (
      <div className='pointer-events-none absolute inset-0 z-20 flex items-center justify-center'>
        <div className={cn(discShell, 'h-12 w-12')}>
          <Loader2 size={22} strokeWidth={2.5} className='animate-spin text-[#e2e8f0]' aria-hidden />
        </div>
        <span role='status' aria-live='polite' className='sr-only'>
          {t('media.buffering')}
        </span>
      </div>
    );
  }

  if (phase === 'blocked' || phase === 'paused') {
    return (
      // A frame is already on screen here, so the scrim only takes the edge off it rather than hiding it — and it
      // stays click-through apart from the disc, keeping the native control bar (seek, chapters) reachable.
      <div className='pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/25'>
        <button
          type='button'
          {...tap}
          aria-label={t('media.play')}
          /* The padded hit area is what makes the disc a comfortable touch target; the disc itself keeps the poster's
             size, so the stage looks unchanged when the player takes over the thumbnail. */
          className='pointer-events-auto cursor-pointer rounded-full p-2 transition-transform active:scale-95'
        >
          <VideoPlayOverlayDisc size='modal' />
        </button>
        {/*
          Only for `blocked`: a play button over a frame that never moves is indistinguishable from a slow load, so
          the reason — the browser refused to autoplay — has to be spelled out. Once playback has started, the disc
          plus the element's own control bar already say "paused".
        */}
        {phase === 'blocked' && <p className='text-[13px] font-semibold text-slate-100'>{t('media.tapToPlay')}</p>}
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className='absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/75 px-6 text-center backdrop-blur-sm'>
        <div className={cn(discShell, 'h-14 w-14')}>
          <AlertTriangle size={22} strokeWidth={2.25} className='text-[#fca5a5]' aria-hidden />
        </div>
        <div className='flex flex-col gap-1'>
          <p role='status' className='text-[15px] font-semibold text-slate-100'>
            {t('media.videoUnavailable')}
          </p>
          <p className='max-w-[19rem] text-[13px] leading-snug text-slate-300'>
            {t('media.videoUnavailableDescription')}
          </p>
        </div>
        <button
          type='button'
          onClick={(event) => {
            event.stopPropagation();
            onRetry();
          }}
          className={retryButtonClass}
        >
          <RefreshCw size={14} strokeWidth={2.25} aria-hidden />
          {t('common.tryAgain')}
        </button>
      </div>
    );
  }

  // `loading` — the state the stage used to be silent about. The spinner is the whole message: it says the player is
  // working, and the poster dimmed underneath says what is coming. No wording and no reload button — a long wait
  // explains itself, and the browser's own reload is the fallback the user already has. The status span is for screen
  // readers only, so the state is still announced without being drawn on the stage.
  return (
    <div
      className='absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/45 backdrop-blur-[2px]'
      onClick={(event) => {
        event.stopPropagation();
        // A tap here may only ever *start* playback. The element's own control flips to "pause" the moment `play()`
        // is called, even though no frame has arrived yet, and tapping that control is exactly how a start-up tap
        // used to end up pausing the movie the user was trying to begin.
        onEnsurePlayback();
      }}
    >
      <div className={cn(discShell, 'h-16 w-16')}>
        <Loader2 size={26} strokeWidth={2.5} className='animate-spin text-[#e2e8f0]' aria-hidden />
      </div>
      <span role='status' aria-live='polite' className='sr-only'>
        {t('media.loadingVideo')}
      </span>
    </div>
  );
}
