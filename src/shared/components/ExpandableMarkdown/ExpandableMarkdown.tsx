import { useState, useLayoutEffect, useRef } from 'react';
import { Markdown } from '../Markdown/Markdown';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

type Props = {
  /** Markdown source */
  content: string;
  /** Root wrapper (spacing). */
  className?: string;
  /** Markdown body only; does not affect the Show more / Show less control. */
  contentClassName?: string;
};

/** Minimum number of *additional* lines that must be hidden before the toggle appears.
 *  `0` means the toggle appears as soon as any content is clipped (i.e. the text is cropped with `…`),
 *  which is what users expect when they see a truncated description. */
const MIN_HIDDEN_LINES = 0;

/**
 * Collapsible long markdown (problem / area / sector descriptions, trivia, aid notes).
 * Body uses `designContract.typography.body` (`type-body` in `index.css`). Optional `contentClassName`
 * overrides ink (e.g. muted `text-slate-400` for aid subcopy).
 * The toggle only appears when collapsed content is actually clipped (measured in the DOM).
 */
export const ExpandableMarkdown = ({ content, className, contentClassName }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [overflowsWhenCollapsed, setOverflowsWhenCollapsed] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const trimmed = content.trim();

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!trimmed || !el) return;

    let cancelled = false;
    let lastWidth = el.clientWidth;

    const measure = () => {
      if (cancelled || expanded) return;
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 24;
      // `line-clamp-12` sets `overflow: hidden`, which makes `scrollHeight` report the *clamped* height
      // rather than the full content height — that would make the toggle never appear. Temporarily remove
      // the clamp (synchronously, before paint) to read the true content height, then restore it.
      const clampedHeight = el.clientHeight;
      const hadClamp = el.classList.contains('line-clamp-12');
      if (hadClamp) el.classList.remove('line-clamp-12');
      const naturalHeight = el.scrollHeight;
      if (hadClamp) el.classList.add('line-clamp-12');
      setOverflowsWhenCollapsed(naturalHeight > clampedHeight + lineHeight * MIN_HIDDEN_LINES);
    };

    measure();

    // Re-measure when the container width changes (text re-wraps). We only react to width changes so the
    // temporary clamp removal inside `measure()` doesn't cause a ResizeObserver feedback loop.
    const ro = new ResizeObserver(() => {
      const width = el.clientWidth;
      if (width !== lastWidth) {
        lastWidth = width;
        measure();
      }
    });
    ro.observe(el);

    // Some content (e.g. a late-loading image or font in the markdown) can change the content height
    // *after* the initial measurement without a width change. Re-measure once the page and its resources
    // have finished loading, plus a short timeout as a fallback.
    const onLoad = () => measure();
    window.addEventListener('load', onLoad);
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => measure()).catch(() => {});
    }
    const timeout = window.setTimeout(measure, 300);

    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener('load', onLoad);
      window.clearTimeout(timeout);
    };
  }, [trimmed, expanded]);

  if (!trimmed) return null;

  const showToggle = expanded || overflowsWhenCollapsed;

  const bodyClasses = cn(
    designContract.typography.body,
    'text-pretty [overflow-wrap:anywhere]',
    '[&_p+p]:mt-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
    'hover:[&_a]:text-brand light:[&_a]:decoration-slate-400/40 [&_a]:text-inherit [&_a]:underline [&_a]:decoration-white/15 [&_a]:underline-offset-2 [&_a]:transition-colors',
    contentClassName,
  );

  return (
    <div className={cn('min-w-0 space-y-2', className)}>
      <div ref={bodyRef} className={cn(bodyClasses, !expanded && 'line-clamp-12')}>
        <Markdown content={content} />
      </div>
      {showToggle && (
        <button
          type='button'
          onClick={() => setExpanded((x) => !x)}
          className={cn(
            designContract.controls.expandableToggle,
            'inline-flex min-w-[7.25rem] justify-center tabular-nums',
          )}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};
