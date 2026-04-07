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

const COLLAPSED_MAX_H = 'max-h-[8.75rem]';

/**
 * Collapsible long markdown (Area overview description pattern).
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

    const measure = () => {
      if (expanded) return;
      setOverflowsWhenCollapsed(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [trimmed, expanded]);

  if (!trimmed) return null;

  const showToggle = expanded || overflowsWhenCollapsed;

  return (
    <div className={cn('min-w-0 space-y-2', className)}>
      <div
        ref={bodyRef}
        className={cn(
          'text-[13px] leading-relaxed text-slate-300 sm:text-sm [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
          contentClassName,
          !expanded && COLLAPSED_MAX_H,
          !expanded && 'overflow-hidden',
        )}
      >
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
