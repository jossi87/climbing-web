import { Link as LinkIcon } from 'lucide-react';
import { Badge } from './ClimbingWidgets';
import type { components } from '../../../@types/buldreinfo/swagger';

type ExternalLinkItem = components['schemas']['ExternalLink'];

export function ExternalLinkLabels({ externalLinks = [] }: { externalLinks?: ExternalLinkItem[] }) {
  if (!externalLinks || externalLinks.length === 0) return null;
  return (
    <div className='flex flex-wrap gap-2'>
      {externalLinks.map((l) => (
        <a key={l.id} href={l.url ?? '#'} target='_blank' rel='noreferrer'>
          <Badge icon={LinkIcon} className='hover:bg-surface-border transition-colors'>
            {l.title}
            {l.url?.includes('page=') && (
              <span className='ml-1 text-slate-600 lowercase'>Page {l.url.split('page=')[1]}</span>
            )}
          </Badge>
        </a>
      ))}
    </div>
  );
}
