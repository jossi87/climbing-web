import { Link as LinkIcon } from 'lucide-react';
import { Badge } from './ClimbingWidgets';
import type { components } from '../../../@types/buldreinfo/swagger';

type ExternalLinkItem = components['schemas']['ExternalLink'];

export function ExternalLinkLabels({ externalLinks = [] }: { externalLinks?: ExternalLinkItem[] }) {
  if (!externalLinks || externalLinks.length === 0) return null;
  return (
    <>
      {externalLinks.map((l) => (
        <a key={l.id} href={l.url ?? '#'} target='_blank' rel='noreferrer'>
          <Badge icon={LinkIcon} className='hover:bg-white/[0.08] hover:text-slate-300 hover:ring-white/[0.1]'>
            {l.title}
            {l.url?.includes('page=') && <span className='ml-1 text-slate-500'>p.{l.url.split('page=')[1]}</span>}
          </Badge>
        </a>
      ))}
    </>
  );
}
