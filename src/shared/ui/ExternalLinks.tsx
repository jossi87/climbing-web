import { useCallback, useMemo, type ChangeEvent } from 'react';
import type { components } from '../../@types/buldreinfo/swagger';
import { Link, Type, ChevronDown } from 'lucide-react';
import { designContract } from '../../design/contract';
import { cn } from '../../lib/utils';

type ExternalLink = components['schemas']['ExternalLink'];
type ExternalLinksArray = ExternalLink[];

type Props = {
  externalLinks: ExternalLinksArray;
  onExternalLinksUpdated: (externalLinks: ExternalLinksArray) => void;
  hideLabel?: boolean;
  mobileFlat?: boolean;
};

const ExternalLinks = ({ externalLinks, onExternalLinksUpdated, hideLabel = false, mobileFlat = false }: Props) => {
  const links = useMemo(() => externalLinks || [], [externalLinks]);

  const handleLinkChange = (index: number, field: keyof ExternalLink, value: string | undefined) => {
    const updatedLinks = links.map((link, i) => {
      if (i === index) {
        return { ...link, [field]: value };
      }
      return link;
    });

    onExternalLinksUpdated(updatedLinks);
  };

  const onNumberOfExternalLinksChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const num = parseInt(e.target.value, 10);
      let newExternalLinks: ExternalLinksArray = [...links];

      if (num > newExternalLinks.length) {
        while (num > newExternalLinks.length) {
          newExternalLinks.push({
            url: undefined,
            title: undefined,
          });
        }
      } else if (num < newExternalLinks.length) {
        newExternalLinks = newExternalLinks.slice(0, num);
      }

      onExternalLinksUpdated(newExternalLinks);
    },
    [onExternalLinksUpdated, links],
  );

  const inputClasses =
    'w-full bg-surface-nav border border-surface-border rounded-lg px-9 py-1.5 text-xs text-white transition-colors focus:border-brand-border focus:outline-none focus:ring-0 focus-visible:ring-0';
  const labelClasses = 'ml-1 mb-1 block';

  return (
    <div
      className={cn(
        'bg-surface-card border-surface-border space-y-4 rounded-xl border p-4 shadow-sm',
        mobileFlat && 'rounded-none border-0 p-0 shadow-none sm:rounded-xl sm:p-4 sm:shadow-sm',
      )}
    >
      <div className='flex items-center gap-2'>
        {!hideLabel && <label className={`${labelClasses} ${designContract.typography.label}`}>External Links</label>}
        <div className='relative mb-1 inline-block'>
          <select
            value={links.length}
            onChange={onNumberOfExternalLinksChange}
            className='type-label border-surface-border bg-surface-nav focus:border-brand-border cursor-pointer appearance-none rounded-lg border py-1 pr-7 pl-2.5 text-slate-200 transition-colors focus:ring-0 focus:outline-none focus-visible:ring-0'
          >
            <option value={0} className='bg-surface-card'>
              No external links
            </option>
            <option value={1} className='bg-surface-card'>
              1 external link
            </option>
            <option value={2} className='bg-surface-card'>
              2 external links
            </option>
            <option value={3} className='bg-surface-card'>
              3 external links
            </option>
            <option value={4} className='bg-surface-card'>
              4 external links
            </option>
            <option value={5} className='bg-surface-card'>
              5 external links
            </option>
          </select>
          <ChevronDown
            size={12}
            className='pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-slate-500'
          />
        </div>
      </div>

      {links.length > 0 && (
        <div className='space-y-3'>
          {links.map((l, index) => (
            <div
              key={index}
              className='border-surface-border/50 grid grid-cols-1 gap-3 border-b pb-3 last:border-0 last:pb-0 sm:grid-cols-2'
            >
              <div className='relative'>
                <Link className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-500' size={14} />
                <input
                  type='text'
                  placeholder='URL'
                  className={inputClasses}
                  value={l.url || ''}
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value === '' ? undefined : e.target.value)}
                />
              </div>
              <div className='relative'>
                <Type className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-500' size={14} />
                <input
                  type='text'
                  placeholder='Title'
                  className={inputClasses}
                  value={l.title || ''}
                  onChange={(e) => handleLinkChange(index, 'title', e.target.value === '' ? undefined : e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExternalLinks;
