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

  const inputClasses =
    'w-full bg-surface-nav border border-surface-border rounded-lg py-1.5 px-9 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand transition-colors';
  const selectClasses =
    'w-full appearance-none bg-surface-nav border border-surface-border rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-brand transition-colors cursor-pointer';

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
              className='border-surface-border/50 grid grid-cols-1 items-start gap-3 border-b pb-3 last:border-0 last:pb-0 sm:grid-cols-12'
            >
              <div className='relative sm:col-span-2'>
                <Hash className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-500' size={14} />
                <input
                  type='number'
                  placeholder='Nr'
                  className={inputClasses}
                  value={s.nr ?? ''}
                  onChange={(e) => updateSection(index, 'nr', parseInt(e.target.value, 10))}
                />
              </div>

              <div className='relative sm:col-span-3'>
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

              <div className='relative sm:col-span-7'>
                <Info className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-500' size={14} />
                <input
                  type='text'
                  placeholder='Description'
                  className={inputClasses}
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
