export const Redirecting = () => (
  <div className='flex flex-col items-center justify-center min-h-50 w-full animate-in fade-in duration-500'>
    <div className='bg-surface-nav/40 border border-surface-border rounded-xl px-8 py-6 shadow-xl backdrop-blur-sm'>
      <div className='flex items-center gap-4'>
        <div className='w-5 h-5 rounded-full border-2 border-slate-700 border-t-brand animate-spin' />
        <div className='flex flex-col'>
          <h3 className='text-sm font-bold text-white uppercase tracking-widest'>Redirecting</h3>
          <p className='text-[10px] text-slate-500 font-medium italic mt-0.5'>Please wait...</p>
        </div>
      </div>
    </div>
  </div>
);
