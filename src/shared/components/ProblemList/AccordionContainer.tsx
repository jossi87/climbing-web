import { type ReactNode, useCallback, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';

type Props = {
  accordionRows: {
    label: string;
    length?: number;
    content: ReactNode | string;
  }[];
};

const AccordionContainer = ({ accordionRows }: Props) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const toggleAccordion = useCallback((index: number) => {
    setActiveIndex((prev) => (prev === index ? -1 : index));
  }, []);

  return (
    <div className='border-surface-border bg-surface-card overflow-hidden rounded-xl border shadow-sm'>
      {accordionRows.map((d, i) => {
        const isActive = activeIndex === i;
        const hasData = (d.length ?? 0) > 0;

        return (
          <div key={d.label} className={cn('border-surface-border border-b last:border-b-0')}>
            <button
              type='button'
              onClick={() => toggleAccordion(i)}
              className={cn(
                'flex w-full items-center justify-between p-4 text-left transition-colors',
                isActive ? 'bg-surface-nav/40' : 'hover:bg-surface-nav/20',
              )}
            >
              <span className='text-sm font-black tracking-widest text-slate-200 uppercase'>{d.label}</span>
              <ChevronDown
                size={18}
                className={cn('text-slate-500 transition-transform duration-200', isActive && 'text-brand rotate-180')}
              />
            </button>
            <div
              className={cn(
                'overflow-hidden transition-all duration-200 ease-in-out',
                isActive ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0',
              )}
            >
              <div className='bg-surface-nav/10 border-surface-border/30 border-t p-4'>
                {hasData ? d.content : <i className='text-sm text-slate-500'>No data</i>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccordionContainer;
