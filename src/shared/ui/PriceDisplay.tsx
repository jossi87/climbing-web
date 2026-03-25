export const PriceDisplay = ({ currency, amount, label }: { currency: string; amount: string; label: string }) => (
  <div className='flex items-center gap-4 text-slate-400'>
    <div className='text-brand bg-brand/10 border-brand/20 rounded border px-2 py-0.5 text-[10px] font-black'>
      {currency}
    </div>
    <p className='text-xs'>
      {label} <span className='font-bold text-slate-200'>{amount}</span>
    </p>
  </div>
);
