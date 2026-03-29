import { useState } from 'react';
import { Markdown } from '../Markdown/Markdown';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

/** Rough line estimate for plain text / markdown (no DOM measurement). */
function contentLikelyExceedsLines(content: string, maxLines: number, charsPerLine = 76): boolean {
  const lines = content.trim().split(/\r?\n/);
  let total = 0;
  for (const line of lines) {
    total += Math.max(1, Math.ceil(line.length / charsPerLine));
  }
  return total > maxLines;
}

type Props = {
  /** Markdown source */
  content: string;
  /** Root wrapper (spacing). */
  className?: string;
  /** Markdown body only; does not affect the Show more / Show less control. */
  contentClassName?: string;
};

/**
 * Collapsible long markdown (Area overview description pattern).
 */
export const ExpandableMarkdown = ({ content, className, contentClassName }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const trimmed = content.trim();
  if (!trimmed) return null;

  const needsToggle = contentLikelyExceedsLines(trimmed, 6);

  return (
    <div className={cn('min-w-0 space-y-2', className)}>
      <div
        className={cn(
          'text-[13px] leading-relaxed text-slate-300 sm:text-sm [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
          contentClassName,
          !expanded && needsToggle && 'max-h-[8.75rem] overflow-hidden',
        )}
      >
        <Markdown content={content} />
      </div>
      {needsToggle && (
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
