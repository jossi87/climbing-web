import { Upload, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

export type UploadTask = {
  label: string;
  /** 0–100, or undefined while still in the "preparing" phase */
  progress?: number;
  state: 'pending' | 'uploading' | 'processing' | 'done' | 'error';
  error?: string;
};

type Props = {
  tasks: UploadTask[];
  onClose?: () => void;
};

const stateIcon = (state: UploadTask['state']) => {
  switch (state) {
    case 'pending':
      return <Upload size={16} className='text-slate-400' />;
    case 'uploading':
    case 'processing':
      return <Loader2 size={16} className='text-brand animate-spin' />;
    case 'done':
      return <CheckCircle2 size={16} className='text-emerald-400' />;
    case 'error':
      return <XCircle size={16} className='text-red-400' />;
  }
};

const stateLabel = (state: UploadTask['state']) => {
  switch (state) {
    case 'pending':
      return 'Waiting…';
    case 'uploading':
      return 'Uploading…';
    case 'processing':
      return 'Processing…';
    case 'done':
      return 'Done';
    case 'error':
      return 'Failed';
  }
};

export const UploadProgressDialog = ({ tasks }: Props) => {
  const allDone = tasks.every((t) => t.state === 'done' || t.state === 'error');
  const hasError = tasks.some((t) => t.state === 'error');

  return (
    <div className='fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm'>
      <div className='bg-surface-card border-surface-border mx-4 w-full max-w-md rounded-2xl border p-5 shadow-2xl sm:p-6'>
        {/* Header */}
        <div className='mb-4 flex items-center gap-2.5'>
          <div className={cn('rounded-full p-2', hasError ? 'bg-red-950' : allDone ? 'bg-emerald-950' : 'bg-brand/20')}>
            {hasError ? (
              <XCircle size={20} className='text-red-400' />
            ) : allDone ? (
              <CheckCircle2 size={20} className='text-emerald-400' />
            ) : (
              <Upload size={20} className='text-brand' />
            )}
          </div>
          <div>
            <h3 className='text-sm font-semibold text-slate-100'>
              {hasError ? 'Upload failed' : allDone ? 'Upload complete' : 'Uploading media…'}
            </h3>
            <p className='text-xs text-slate-500'>
              {tasks.filter((t) => t.state === 'done').length}/{tasks.length} completed
            </p>
          </div>
        </div>

        {/* Task list */}
        <div className='space-y-2.5'>
          {tasks.map((task, i) => (
            <div key={i} className='bg-surface-raised border-surface-border/60 rounded-lg border p-3'>
              <div className='mb-1.5 flex items-center justify-between gap-2'>
                <div className='flex min-w-0 items-center gap-2'>
                  {stateIcon(task.state)}
                  <span className='truncate text-[13px] font-medium text-slate-200'>{task.label}</span>
                </div>
                <span className='shrink-0 text-[11px] text-slate-500'>{stateLabel(task.state)}</span>
              </div>
              {/* Progress bar */}
              {(task.state === 'uploading' || task.state === 'processing') && (
                <div className='h-1.5 w-full overflow-hidden rounded-full bg-slate-700'>
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      task.state === 'uploading' ? 'bg-brand' : 'bg-amber-400',
                    )}
                    style={{ width: `${task.progress ?? 0}%` }}
                  />
                </div>
              )}
              {task.state === 'uploading' && task.progress != null && (
                <p className='mt-1 text-right text-[10px] text-slate-500'>{task.progress}%</p>
              )}
              {task.state === 'error' && task.error && <p className='mt-1 text-[11px] text-red-400'>{task.error}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
