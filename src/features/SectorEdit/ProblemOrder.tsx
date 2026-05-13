import { useRef } from 'react';
import type { components } from '../../@types/buldreinfo/swagger';
import { Hash } from 'lucide-react';
import { cn } from '../../lib/utils';

type Props = Pick<components['schemas']['Sector'], 'problemOrder'> & {
  onChange: (order: NonNullable<components['schemas']['Sector']['problemOrder']>) => void;
};

const TYPE_IMPOSSIBILITY = 0;

export const ProblemOrder = ({ problemOrder, onChange }: Props) => {
  const originalOrder = useRef<Record<number, number>>(
    (problemOrder ?? []).reduce((acc, { id, nr }) => ({ ...acc, [id ?? TYPE_IMPOSSIBILITY]: nr }), {}),
  ).current;

  return (
    <div className='space-y-1.5'>
      {problemOrder?.map(({ id, name, nr }) => {
        const isModified = nr !== originalOrder[id ?? TYPE_IMPOSSIBILITY];

        return (
          <div key={id} className='group flex items-center'>
            <div className='relative flex-1'>
              <Hash
                className={cn(
                  'absolute top-1/2 left-2.5 -translate-y-1/2 transition-colors',
                  isModified ? 'text-orange-500' : 'text-slate-500',
                )}
                size={12}
              />
              <input
                type='number'
                step={1}
                defaultValue={nr}
                placeholder='Number'
                className={cn(
                  'bg-surface-nav w-full rounded-l-lg border py-1.5 pr-2.5 pl-8 text-[13px] transition-colors focus:outline-none',
                  isModified
                    ? 'border-orange-500/50 focus:border-orange-500'
                    : 'border-surface-border focus:border-brand',
                )}
                onChange={(e) => {
                  const num = +e.target.value;
                  onChange(
                    problemOrder.map((problem) => {
                      if (problem.id === id) {
                        return {
                          ...problem,
                          nr: num,
                        };
                      }
                      return problem;
                    }),
                  );
                }}
              />
            </div>
            <div
              className={cn(
                'bg-surface-raised min-w-28 rounded-r-lg border border-l-0 px-3 py-1.5 text-[12px] font-bold transition-colors',
                isModified ? 'border-orange-500/50 text-orange-500' : 'border-surface-border text-slate-400',
              )}
            >
              {name}
            </div>
          </div>
        );
      }) ?? []}
    </div>
  );
};
