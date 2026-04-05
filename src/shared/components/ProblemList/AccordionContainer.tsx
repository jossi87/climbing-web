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
    <div className='divide-surface-border/40 border-surface-border/50 divide-y overflow-hidden rounded-lg border'>
      {accordionRows.map((d, i) => {
        const isActive = activeIndex === i;
        const hasData = (d.length ?? 0) > 0;

        return (
          <div key={d.label}>
            <button
              type='button'
              onClick={() => toggleAccordion(i)}
              className={cn(
                'flex w-full items-center justify-between px-2.5 py-2 text-left transition-colors sm:px-3 sm:py-2.5',
                isActive ? 'bg-surface-raised' : 'hover:bg-surface-raised-hover',
              )}
            >
              <span className='text-[11px] font-medium tracking-tight text-slate-400 sm:text-[12px]'>{d.label}</span>
              <ChevronDown
                size={14}
                strokeWidth={2}
                className={cn(
                  'shrink-0 text-slate-400 transition-transform duration-200',
                  isActive && 'rotate-180 text-slate-400',
                )}
              />
            </button>
            <div
              className={cn(
                'overflow-hidden transition-all duration-200 ease-in-out',
                isActive ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0',
              )}
            >
              <div className='px-2.5 pb-2.5 pl-3 sm:px-3 sm:pb-3'>
                {hasData ? d.content : <i className='text-[11px] text-slate-400 sm:text-[12px]'>No data</i>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccordionContainer;
