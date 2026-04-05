import { PawPrint, Ban } from 'lucide-react';

export function NoDogsAllowed() {
  return (
    <div className='border-surface-border bg-surface-raised flex items-center gap-4 rounded-md border p-4 text-left'>
      <span className='border-surface-border bg-surface-card ring-surface-border/30 relative inline-flex h-9 w-9 items-center justify-center rounded-full border text-slate-200 shadow-sm ring-1'>
        <PawPrint size={17} />
        <Ban size={14} className='absolute -right-1 -bottom-1 text-red-300/90' />
      </span>
      <div>
        <h5 className='text-xs font-bold tracking-widest text-slate-100 uppercase'>No dogs allowed</h5>
        <p className='text-xs text-slate-500'>Landowner request.</p>
      </div>
    </div>
  );
}
