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
    <div className='bg-surface-card/45 overflow-hidden rounded-xl'>
      {accordionRows.map((d, i) => {
        const isActive = activeIndex === i;
        const hasData = (d.length ?? 0) > 0;

        return (
          <div key={d.label}>
            <button
              type='button'
              onClick={() => toggleAccordion(i)}
              className={cn(
                'flex w-full items-center justify-between px-2 py-1.5 text-left transition-colors sm:px-2.5 sm:py-2',
                isActive ? 'bg-surface-nav/28' : 'hover:bg-surface-nav/16',
              )}
            >
              <span className='text-xs font-medium tracking-normal text-slate-300'>{d.label}</span>
              <ChevronDown
                size={14}
                className={cn(
                  'text-slate-600 transition-transform duration-200',
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
              <div className='px-2.5 pt-1 pb-2 sm:px-3 sm:pb-2.5'>
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
