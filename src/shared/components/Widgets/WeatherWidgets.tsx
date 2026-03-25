import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CloudRain, Loader2 } from 'lucide-react';
import { type TWeatherSymbolKey, weatherSymbolKeys } from '../../../yr';
import { Badge } from './ClimbingWidgets';

type WeatherIconProps = {
  symbol: TWeatherSymbolKey | 'loading' | undefined;
};

export const WeatherIcon = ({ symbol }: WeatherIconProps) => {
  if (symbol === 'loading') {
    return <Loader2 size={14} className='animate-spin text-slate-500' />;
  }

  if (symbol && symbol in weatherSymbolKeys) {
    return (
      <img
        alt={symbol}
        src={`/svg/yr/${weatherSymbolKeys[symbol]}.svg`}
        className='h-5 w-5 opacity-90'
        loading='lazy'
      />
    );
  }

  return <CloudRain size={14} className='text-slate-500' />;
};

type YrData = {
  properties: {
    timeseries: {
      data: {
        next_1_hours?: { summary: { symbol_code: TWeatherSymbolKey } };
        next_6_hours?: { summary: { symbol_code: TWeatherSymbolKey } };
        next_12_hours?: { summary: { symbol_code: TWeatherSymbolKey } };
      };
    }[];
  };
};

export const YrLink = ({ lat, lng }: { lat: number; lng: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['yr/weather', lat, lng],
    enabled: !!lat && !!lng,
    queryFn: () =>
      fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`).then((res) =>
        res.json(),
      ),
    select: (d: YrData) => d.properties?.timeseries?.[0]?.data,
  });

  const next1Hours = data?.next_1_hours?.summary?.symbol_code;
  const next6Hours = data?.next_6_hours?.summary?.symbol_code;
  const next12Hours = data?.next_12_hours?.summary?.symbol_code;

  return (
    <div className='relative inline-block' onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <a href={`https://www.yr.no/en/forecast/daily-table/${lat},${lng}`} target='_blank' rel='noreferrer'>
        <Badge className='hover:bg-surface-border transition-colors'>
          <WeatherIcon symbol={isLoading ? 'loading' : next1Hours} />
          Yr.no
        </Badge>
      </a>
      {isOpen && !isLoading && next1Hours && next6Hours && next12Hours && (
        <div className='bg-surface-card border-surface-border absolute bottom-full left-0 z-50 mb-2 min-w-45 rounded-md border p-3 shadow-2xl'>
          <div className='mb-2 grid grid-cols-3 gap-2'>
            {[
              { sym: next1Hours, label: '1 hr' },
              { sym: next6Hours, label: '6 hr' },
              { sym: next12Hours, label: '12 hr' },
            ].map((item, i) => (
              <div key={i} className='text-center'>
                <img
                  src={`/svg/yr/${weatherSymbolKeys[item.sym as TWeatherSymbolKey]}.svg`}
                  className='mx-auto h-10 w-10'
                  alt=''
                />
                <span className='text-[10px] font-bold text-slate-500 uppercase'>{item.label}</span>
              </div>
            ))}
          </div>
          <p className='border-surface-border border-t pt-2 text-center text-[9px] tracking-widest text-slate-600 uppercase'>
            yr.no
          </p>
        </div>
      )}
    </div>
  );
};
