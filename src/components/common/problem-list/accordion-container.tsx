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
    <div className='border border-surface-border rounded-xl overflow-hidden bg-surface-card shadow-sm'>
      {accordionRows.map((d, i) => {
        const isActive = activeIndex === i;
        const hasData = (d.length ?? 0) > 0;

        return (
          <div key={d.label} className={cn('border-b border-surface-border last:border-b-0')}>
            <button
              type='button'
              onClick={() => toggleAccordion(i)}
              className={cn(
                'w-full flex items-center justify-between p-4 text-left transition-colors',
                isActive ? 'bg-surface-nav/40' : 'hover:bg-surface-nav/20',
              )}
            >
              <span className='text-sm font-black uppercase tracking-widest text-slate-200'>
                {d.label}
              </span>
              <ChevronDown
                size={18}
                className={cn(
                  'text-slate-500 transition-transform duration-200',
                  isActive && 'rotate-180 text-brand',
                )}
              />
            </button>
            <div
              className={cn(
                'overflow-hidden transition-all duration-200 ease-in-out',
                isActive ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0',
              )}
            >
              <div className='p-4 bg-surface-nav/10 border-t border-surface-border/30'>
                {hasData ? d.content : <i className='text-slate-500 text-sm'>No data</i>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccordionContainer;
