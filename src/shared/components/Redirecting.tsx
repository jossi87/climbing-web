export const Redirecting = () => (
  <div className='animate-in fade-in flex min-h-50 w-full flex-col items-center justify-center duration-500'>
    <div className='bg-surface-nav/40 border-surface-border rounded-xl border px-8 py-6 shadow-xl backdrop-blur-sm'>
      <div className='flex items-center gap-4'>
        <div className='border-t-brand h-5 w-5 animate-spin rounded-full border-2 border-slate-700' />
        <div className='flex flex-col'>
          <h3 className='type-label'>Redirecting</h3>
          <p className='mt-0.5 text-[10px] font-medium text-slate-500 italic'>Please wait...</p>
        </div>
      </div>
    </div>
  </div>
);
