import { PawPrint, Ban } from 'lucide-react';

export function NoDogsAllowed() {
  return (
    <div className='bg-brand/5 border-brand/10 flex items-center gap-4 rounded-md border p-4 text-left'>
      <span className='bg-brand/8 text-brand/80 relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12'>
        <PawPrint size={17} />
        <Ban size={14} className='absolute -right-1 -bottom-1 text-red-300/90' />
      </span>
      <div>
        <h5 className='text-brand text-xs font-bold tracking-widest uppercase'>No dogs allowed</h5>
        <p className='text-xs text-slate-500'>Landowner request.</p>
      </div>
    </div>
  );
}
