import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { components } from '../../../@types/buldreinfo/swagger';
import { useGrades } from '../Meta';
import { Hash, ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';

type ProblemSections = components['schemas']['ProblemSection'][];

type Props = {
  sections: ProblemSections;
  /** Grade system of the area — pitch grades must come from the same system as the problem grade. */
  gradeSystemId?: number;
  onSectionsUpdated: (sections: ProblemSections) => void;
};

const ProblemSection = ({ sections: initSections, gradeSystemId, onSectionsUpdated }: Props) => {
  const { t } = useTranslation();
  const { easyToHard: grades } = useGrades(gradeSystemId);
  const [sections, setSections] = useState(initSections);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  const autoGrow = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  const onNumberOfSectionsChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (value === undefined) return;

      const num = parseInt(value, 10);
      const currentLen = sections?.length || 1;

      if (!confirm(t('problemSection.confirmPitchCount', { from: currentLen, to: num }))) {
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
    [onSectionsUpdated, sections, t],
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
  /** Description — full width, auto-grows vertically to fit content. */
  const commentInputClasses = cn(fieldBase, 'px-3 py-1.5 resize-none overflow-hidden');
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
              {t('problemSection.pitchCount', { count: i + 1 })}
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
              className='grid grid-cols-1 gap-y-3 sm:grid-cols-[4.5rem_9rem_1fr] sm:items-start sm:gap-x-3 sm:gap-y-0'
            >
              {/*
                Mobile: pitch # + grade on one row; description full width below.
                sm+: fixed-width nr + fixed-width grade + remaining space for description.
              */}
              <div className='grid min-w-0 grid-cols-[minmax(0,3.5rem)_minmax(0,11rem)] gap-2 sm:contents'>
                <div className='relative min-w-0'>
                  <Hash className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-500' size={14} />
                  <input
                    type='number'
                    min={1}
                    max={99}
                    placeholder={t('problemSection.nr')}
                    className={nrInputClasses}
                    value={s.nr ?? ''}
                    readOnly
                  />
                </div>

                <div className='relative min-w-0'>
                  <select
                    className={selectClasses}
                    value={s.grade ?? 'n/a'}
                    onChange={(e) => updateSection(index, 'grade', e.target.value)}
                  >
                    {grades.map((g) => (
                      <option key={g} value={g} className='bg-surface-card'>
                        {g}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500'
                  />
                </div>
              </div>

              <div className='relative min-w-0'>
                <textarea
                  placeholder={t('problemSection.descriptionPlaceholder')}
                  className={commentInputClasses}
                  rows={1}
                  value={s.description || ''}
                  ref={(el) => {
                    textareaRefs.current[index] = el;
                    autoGrow(el);
                  }}
                  onChange={(e) => {
                    updateSection(index, 'description', e.target.value);
                    autoGrow(e.target);
                  }}
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
