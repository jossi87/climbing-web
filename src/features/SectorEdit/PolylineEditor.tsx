import { useState, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { colorLatLng, parsePolyline } from '../../utils/polyline';
import { type DropzoneOptions, useDropzone } from 'react-dropzone';
import type { components } from '../../@types/buldreinfo/swagger';
import { calculateDistanceBetweenCoordinates, parsers } from '../../shared/components/Leaflet/geo-utils';
import { captureSentryMessage } from '../../utils/sentry';
import { X, Upload, FileCode, Database, List } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type Props = {
  coordinates: components['schemas']['Coordinates'][];
  parking: components['schemas']['Coordinates'];
  onChange: (polyline: components['schemas']['Coordinates'][]) => void;
  upload?: boolean;
  /** 'approach' = path from parking to sector (start near parking), 'descent' = path from sector to parking (start far from parking) */
  slopeType?: 'approach' | 'descent';
};

type TabType = 'POINTS' | 'DATA' | 'UPLOAD';

export const PolylineEditor = ({ coordinates, parking, onChange, upload, slopeType }: Props) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('POINTS');

  const onDrop = useCallback(
    (files: (File & { path: string })[]) => {
      if (files?.length === 0) return;

      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const match = file.name.toLowerCase().match(/\.([a-z]+)$/);
        if (!match) {
          captureSentryMessage('Could not extract file extension');
          return;
        }
        const extension = match[1];

        const parser = parsers[extension];
        if (!parser) {
          captureSentryMessage('No defined parser for file', { extension });
          return;
        }

        const coords = parser(e.target?.result as string);
        if (!coords || coords.length === 0) {
          captureSentryMessage('Could not parse file or empty coordinates', { extension });
          return;
        }

        if (coords.length >= 2 && parking) {
          const distFirst = calculateDistanceBetweenCoordinates(
            parking.latitude ?? 0,
            parking.longitude ?? 0,
            coords[0].latitude ?? 0,
            coords[0].longitude ?? 0,
          );
          const distLast = calculateDistanceBetweenCoordinates(
            parking.latitude ?? 0,
            parking.longitude ?? 0,
            coords[coords.length - 1].latitude ?? 0,
            coords[coords.length - 1].longitude ?? 0,
          );
          if (slopeType === 'descent') {
            // Descent: path goes from sector → parking, so first point should be far from parking, last point near parking
            if (distFirst < distLast) coords.reverse();
          } else {
            // Approach (default): path goes from parking → sector, so first point should be near parking
            if (distLast < distFirst) coords.reverse();
          }
        }
        onChange(coords);
      };
      reader.readAsText(file);
    },
    [onChange, parking, slopeType],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      'application/gpx+xml': ['.gpx'],
      'application/tcx+xml': ['.tcx'],
    },
    onDrop: onDrop as DropzoneOptions['onDrop'],
  });

  const navItemClasses = (id: TabType) =>
    cn(
      'flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all border-b-2',
      activeTab === id
        ? 'border-brand-border bg-surface-hover text-slate-50'
        : 'border-transparent text-slate-500 hover:bg-surface-raised-hover hover:text-slate-300',
    );

  return (
    <div className='bg-surface-card border-surface-border overflow-hidden rounded-xl border shadow-sm'>
      <div className='border-surface-border bg-surface-raised flex border-b'>
        <button type='button' onClick={() => setActiveTab('POINTS')} className={navItemClasses('POINTS')}>
          <List size={14} /> {t('mapEditor.points')}
        </button>
        <button type='button' onClick={() => setActiveTab('DATA')} className={navItemClasses('DATA')}>
          <Database size={14} /> {t('mapEditor.rawData')}
        </button>
        {upload && (
          <button type='button' onClick={() => setActiveTab('UPLOAD')} className={navItemClasses('UPLOAD')}>
            <FileCode size={14} /> {t('mapEditor.gpxTcx')}
          </button>
        )}
      </div>

      <div className='min-h-30 p-4'>
        {activeTab === 'POINTS' && (
          <div className='flex flex-wrap gap-2'>
            {coordinates?.length > 0 ? (
              coordinates.map((c, i) => {
                const [bg, fg] = colorLatLng(c);
                return (
                  <span
                    key={`${c.latitude}-${c.longitude}-${i}`}
                    className='inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[11px] font-bold'
                    style={{ backgroundColor: bg, borderColor: bg, color: fg }}
                  >
                    {t('mapEditor.pointNumber', { number: i })}
                    <button
                      type='button'
                      onClick={() => {
                        const newCoords = [...coordinates];
                        newCoords.splice(i, 1);
                        onChange(newCoords);
                      }}
                      className='transition-opacity hover:opacity-70'
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })
            ) : (
              <p className='text-xs text-slate-500 italic'>{t('mapEditor.noPoints')}</p>
            )}
          </div>
        )}

        {activeTab === 'DATA' && (
          <div className='space-y-2'>
            <label className={cn('ml-1', designContract.typography.label, 'text-slate-500')}>
              {t('mapEditor.coordinateString')}
            </label>
            <input
              type='text'
              className='type-small border-surface-border bg-surface-nav focus:border-brand-border w-full rounded-lg border px-3 py-2 transition-colors focus:outline-none'
              placeholder='lat,lng;lat,lng...'
              value={coordinates?.map((c) => `${c.latitude},${c.longitude}`).join(';') || ''}
              onChange={(e) => onChange(parsePolyline(e.target.value))}
            />
          </div>
        )}

        {activeTab === 'UPLOAD' && upload && (
          <div
            {...getRootProps()}
            className={cn(
              'cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all',
              isDragActive
                ? 'border-brand-border bg-surface-raised'
                : 'border-surface-border bg-surface-raised hover:border-slate-500',
            )}
          >
            <input {...getInputProps()} />
            <div className='flex flex-col items-center gap-3'>
              <div className='border-surface-border bg-surface-raised ring-surface-border/40 rounded-full border p-3 text-slate-100 ring-1'>
                <Upload size={24} />
              </div>
              <div className='space-y-1'>
                <p className='text-xs font-bold text-slate-200'>
                  <Trans
                    i18nKey='mapEditor.dropFile'
                    components={{ gpx: <code className='text-brand' />, tcx: <code className='text-brand' /> }}
                  />
                </p>
                <p className={cn('mx-auto max-w-xs text-slate-500', designContract.typography.micro)}>
                  {t('mapEditor.importHint')}
                </p>
              </div>
              <button type='button' className='type-label btn-brand-solid mt-2 rounded-lg px-4 py-2 transition-all'>
                {t('mapEditor.selectFile')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
