import { Link as LinkIcon } from 'lucide-react';
import { Badge } from './ClimbingWidgets';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import type { components } from '../../../@types/buldreinfo/swagger';

type ExternalLinkItem = components['schemas']['ExternalLink'];

export function ExternalLinkLabels({
  externalLinks = [],
  variant = 'badge',
}: {
  externalLinks?: ExternalLinkItem[];
  variant?: 'badge' | 'inline';
}) {
  if (!externalLinks || externalLinks.length === 0) return null;
  if (variant === 'inline') {
    return (
      <div className='contents'>
        {externalLinks.flatMap((l, i) => {
          const link = (
            <a
              key={l.id}
              href={l.url ?? '#'}
              target='_blank'
              rel='noreferrer'
              className={cn(
                designContract.typography.menuItem,
                'inline-flex max-w-full items-center gap-1 [overflow-wrap:anywhere] text-slate-400 underline decoration-transparent underline-offset-2 transition-colors hover:text-slate-200 hover:decoration-white/20',
              )}
            >
              <LinkIcon size={11} strokeWidth={2} className='shrink-0 text-slate-100' />
              <span className='min-w-0 font-medium'>
                {l.title}
                {l.url?.includes('page=') && (
                  <span className='text-slate-500 tabular-nums'> p.{l.url.split('page=')[1]}</span>
                )}
              </span>
            </a>
          );
          if (i === 0) return [link];
          return [
            <span key={`sep-${l.id}`} className='text-slate-600 select-none' aria-hidden>
              {' · '}
            </span>,
            link,
          ];
        })}
      </div>
    );
  }
  return (
    <>
      {externalLinks.map((l) => (
        <a key={l.id} href={l.url ?? '#'} target='_blank' rel='noreferrer'>
          <Badge icon={LinkIcon} className={designContract.surfaces.badgeLinkHover}>
            {l.title}
            {l.url?.includes('page=') && <span className='ml-1 text-slate-500'>p.{l.url.split('page=')[1]}</span>}
          </Badge>
        </a>
      ))}
    </>
  );
}
