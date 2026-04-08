import { useCallback, useState, type ChangeEvent } from 'react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { useMeta } from '../Meta';
import { Hash, Info, ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';

type ProblemSections = components['schemas']['ProblemSection'][];

type Props = {
  sections: ProblemSections;
  onSectionsUpdated: (sections: ProblemSections) => void;
};

const ProblemSection = ({ sections: initSections, onSectionsUpdated }: Props) => {
  const { grades } = useMeta();
  const [sections, setSections] = useState(initSections);

  const onNumberOfSectionsChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (value === undefined) return;

      const num = parseInt(value, 10);
      const currentLen = sections?.length || 1;

      if (!confirm(`Are you sure you want to change number of pitches from ${currentLen} to ${num}?`)) {
        return;
      }

      let newSections: ProblemSections = [];
      if (num > 1) {
        newSections = sections ? [...sections] : [];
        while (num > newSections.length) {
          newSections.push({
            id: newSections.length * -1,
            nr: newSections.length + 1,
            grade: 'n/a',
            description: undefined,
          });
        }
        while (num < newSections.length) {
          newSections.pop();
        }
      }

      onSectionsUpdated(newSections);
      setSections(newSections);
    },
    [onSectionsUpdated, sections],
  );

  const updateSection = (
    index: number,
    field: keyof components['schemas']['ProblemSection'],
    value: string | number | undefined,
  ) => {
    const newSections = [...(sections || [])];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
    onSectionsUpdated(newSections);
  };

  const fieldBase =
    'w-full bg-surface-nav border border-surface-border rounded-lg py-1.5 text-xs text-white transition-colors focus:border-brand-border focus:outline-none focus:ring-0 focus-visible:ring-0';
  /** Nr: max two digits — tight column, icon on the left. */
  const nrInputClasses = cn(fieldBase, 'pl-7 pr-2 text-center tabular-nums sm:text-left');
  /** Comment / info — most width; icon + comfortable padding. */
  const commentInputClasses = cn(fieldBase, 'px-9');
  const selectClasses = cn(fieldBase, 'cursor-pointer appearance-none px-3 pr-8');

  return (
    <div className='space-y-4'>
      <div className='relative w-32'>
        <select
          className={cn(selectClasses, 'pr-8')}
          value={Math.max(sections?.length ?? 0, 1)}
          onChange={onNumberOfSectionsChange}
        >
          {Array.from({ length: 30 }, (_, i) => (
            <option key={i + 1} value={i + 1} className='bg-surface-card'>
              {i + 1} {i === 0 ? 'Pitch' : 'Pitches'}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500'
        />
      </div>

      {sections && sections.length > 1 && (
        <div className='space-y-3'>
          {sections.map((s, index) => (
            <div
              key={index}
              className='border-surface-border/50 grid grid-cols-1 gap-y-3 border-b pb-3 last:border-0 last:pb-0 sm:grid-cols-12 sm:items-start sm:gap-x-3 sm:gap-y-0'
            >
              {/*
                Mobile: pitch # + grade on one row; description full width below.
                sm+: 1 + 2 + 9 cols — nr fits ≤99, grade stays compact, comment uses the rest.
              */}
              <div className='grid min-w-0 grid-cols-[minmax(0,3.5rem)_minmax(0,11rem)] gap-2 sm:contents'>
                <div className='relative min-w-0 sm:col-span-1'>
                  <Hash className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-500' size={14} />
                  <input
                    type='number'
                    min={1}
                    max={99}
                    placeholder='Nr'
                    className={nrInputClasses}
                    value={s.nr ?? ''}
                    onChange={(e) => updateSection(index, 'nr', parseInt(e.target.value, 10))}
                  />
                </div>

                <div className='relative min-w-0 sm:col-span-2 sm:max-w-[10rem] sm:justify-self-start'>
                  <select
                    className={selectClasses}
                    value={s.grade ?? 'n/a'}
                    onChange={(e) => updateSection(index, 'grade', e.target.value)}
                  >
                    {grades.map((g, i) => (
                      <option key={i} value={g.grade} className='bg-surface-card'>
                        {g.grade}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500'
                  />
                </div>
              </div>

              <div className='relative min-w-0 sm:col-span-9'>
                <Info className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-500' size={14} />
                <input
                  type='text'
                  placeholder='Description'
                  className={commentInputClasses}
                  value={s.description || ''}
                  onChange={(e) => updateSection(index, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProblemSection;
