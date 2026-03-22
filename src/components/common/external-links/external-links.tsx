import { useCallback, useMemo, type ChangeEvent } from 'react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { Link, Type, ChevronDown } from 'lucide-react';

type ExternalLink = components['schemas']['ExternalLink'];
type ExternalLinksArray = ExternalLink[];

type Props = {
  externalLinks: ExternalLinksArray;
  onExternalLinksUpdated: (externalLinks: ExternalLinksArray) => void;
};

const ExternalLinks = ({ externalLinks, onExternalLinksUpdated }: Props) => {
  const links = useMemo(() => externalLinks || [], [externalLinks]);

  const handleLinkChange = (
    index: number,
    field: keyof ExternalLink,
    value: string | undefined,
  ) => {
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
    'w-full bg-surface-nav border border-surface-border rounded-lg py-1.5 px-9 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand transition-colors';
  const labelClasses =
    'text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block';

  return (
    <div className='bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm space-y-4'>
      <div className='flex items-center gap-2'>
        <label className={labelClasses}>External Links</label>
        <div className='relative inline-block mb-1'>
          <select
            value={links.length}
            onChange={onNumberOfExternalLinksChange}
            className='appearance-none bg-transparent pr-6 text-[10px] font-black text-brand uppercase tracking-widest focus:outline-none cursor-pointer'
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
            className='absolute right-0 top-1/2 -translate-y-1/2 text-brand pointer-events-none'
          />
        </div>
      </div>

      {links.length > 0 && (
        <div className='space-y-3'>
          {links.map((l, index) => (
            <div
              key={index}
              className='grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-surface-border/50 last:border-0 last:pb-0'
            >
              <div className='relative'>
                <Link
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500'
                  size={14}
                />
                <input
                  type='text'
                  placeholder='URL'
                  className={inputClasses}
                  value={l.url || ''}
                  onChange={(e) =>
                    handleLinkChange(
                      index,
                      'url',
                      e.target.value === '' ? undefined : e.target.value,
                    )
                  }
                />
              </div>
              <div className='relative'>
                <Type
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500'
                  size={14}
                />
                <input
                  type='text'
                  placeholder='Title'
                  className={inputClasses}
                  value={l.title || ''}
                  onChange={(e) =>
                    handleLinkChange(
                      index,
                      'title',
                      e.target.value === '' ? undefined : e.target.value,
                    )
                  }
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
