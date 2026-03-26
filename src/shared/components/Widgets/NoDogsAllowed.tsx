export function NoDogsAllowed() {
  return (
    <div className='bg-brand/5 border-brand/10 flex items-center gap-4 rounded-md border p-4 text-left'>
      <img src='/svg/no-animals.svg' alt='' className='h-9 w-9 opacity-80' />
      <div>
        <h5 className='text-brand text-xs font-bold tracking-widest uppercase'>No dogs allowed</h5>
        <p className='text-xs text-slate-500'>Landowner request.</p>
      </div>
    </div>
  );
}
