export const PriceDisplay = ({
  currency,
  amount,
  label,
}: {
  currency: string;
  amount: string;
  label: string;
}) => (
  <div className='flex items-center gap-4 text-slate-400'>
    <div className='text-[10px] font-black text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20'>
      {currency}
    </div>
    <p className='text-xs'>
      {label} <span className='text-slate-200 font-bold'>{amount}</span>
    </p>
  </div>
);
