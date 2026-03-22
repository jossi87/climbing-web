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
    (problemOrder ?? []).reduce(
      (acc, { id, nr }) => ({ ...acc, [id ?? TYPE_IMPOSSIBILITY]: nr }),
      {},
    ),
  ).current;

  return (
    <div className='space-y-3'>
      {problemOrder?.map(({ id, name, nr }) => {
        const isModified = nr !== originalOrder[id ?? TYPE_IMPOSSIBILITY];

        return (
          <div key={id} className='flex items-center group'>
            <div className='relative flex-1'>
              <Hash
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 transition-colors',
                  isModified ? 'text-orange-500' : 'text-slate-600',
                )}
                size={14}
              />
              <input
                type='number'
                step={1}
                defaultValue={nr}
                placeholder='Number'
                className={cn(
                  'w-full bg-surface-nav border rounded-l-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none transition-colors',
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
                'border border-l-0 rounded-r-lg px-4 py-2 text-xs font-bold min-w-35 transition-colors bg-surface-nav/50',
                isModified
                  ? 'border-orange-500/50 text-orange-500'
                  : 'border-surface-border text-slate-400',
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
