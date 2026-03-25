import { useState, useCallback } from 'react';
import { colorLatLng, parsePolyline } from '../../utils/polyline';
import { type DropzoneOptions, useDropzone } from 'react-dropzone';
import type { components } from '../../@types/buldreinfo/swagger';
import { calculateDistanceBetweenCoordinates, parsers } from '../../shared/components/Leaflet/geo-utils';
import { captureMessage } from '@sentry/react';
import { X, Upload, FileCode, Database, List } from 'lucide-react';
import { cn } from '../../lib/utils';

type Props = {
  coordinates: components['schemas']['Coordinates'][];
  parking: components['schemas']['Coordinates'];
  onChange: (polyline: components['schemas']['Coordinates'][]) => void;
  upload?: boolean;
};

type TabType = 'POINTS' | 'DATA' | 'UPLOAD';

export const PolylineEditor = ({ coordinates, parking, onChange, upload }: Props) => {
  const [activeTab, setActiveTab] = useState<TabType>('POINTS');

  const onDrop = useCallback(
    (files: (File & { path: string })[]) => {
      if (files?.length === 0) return;

      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const match = file.name.toLowerCase().match(/\.([a-z]+)$/);
        if (!match) {
          captureMessage('Could not extract file extension');
          return;
        }
        const extension = match[1];

        const parser = parsers[extension];
        if (!parser) {
          captureMessage('No defined parser for file', { extra: { extension } });
          return;
        }

        const coords = parser(e.target?.result as string);
        if (!coords || coords.length === 0) {
          captureMessage('Could not parse file or empty coordinates', { extra: { extension } });
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
          if (distLast < distFirst) coords.reverse();
        }
        onChange(coords);
      };
      reader.readAsText(file);
    },
    [onChange, parking],
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
        ? 'border-brand text-brand bg-brand/5'
        : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5',
    );

  return (
    <div className='bg-surface-card border-surface-border overflow-hidden rounded-xl border shadow-sm'>
      <div className='border-surface-border bg-surface-nav/20 flex border-b'>
        <button type='button' onClick={() => setActiveTab('POINTS')} className={navItemClasses('POINTS')}>
          <List size={14} /> Points
        </button>
        <button type='button' onClick={() => setActiveTab('DATA')} className={navItemClasses('DATA')}>
          <Database size={14} /> Raw Data
        </button>
        {upload && (
          <button type='button' onClick={() => setActiveTab('UPLOAD')} className={navItemClasses('UPLOAD')}>
            <FileCode size={14} /> GPX/TCX
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
                    className='inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[10px] font-bold'
                    style={{ backgroundColor: bg, borderColor: bg, color: fg }}
                  >
                    Point #{i}
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
              <p className='text-xs text-slate-500 italic'>No points defined yet. Click on the map to add points.</p>
            )}
          </div>
        )}

        {activeTab === 'DATA' && (
          <div className='space-y-2'>
            <label className='ml-1 text-[10px] font-black tracking-widest text-slate-500 uppercase'>
              Coordinate String
            </label>
            <input
              type='text'
              className='bg-surface-nav border-surface-border focus:border-brand type-small w-full rounded-lg border px-3 py-2 transition-colors placeholder:text-slate-600 focus:outline-none'
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
                ? 'border-brand bg-brand/5'
                : 'border-surface-border bg-surface-nav/20 hover:border-slate-500',
            )}
          >
            <input {...getInputProps()} />
            <div className='flex flex-col items-center gap-3'>
              <div className='bg-brand/10 text-brand rounded-full p-3'>
                <Upload size={24} />
              </div>
              <div className='space-y-1'>
                <p className='text-xs font-bold text-slate-200'>
                  Drag-and-drop a <code className='text-brand'>.gpx</code> or <code className='text-brand'>.tcx</code>{' '}
                  file
                </p>
                <p className='mx-auto max-w-xs text-[10px] text-slate-500'>
                  Import paths from GPS watches, Strava, or Fitbit to generate the approach path automatically.
                </p>
              </div>
              <button
                type='button'
                className='bg-brand hover:bg-brand/90 type-label mt-2 rounded-lg px-4 py-2 transition-all'
              >
                Select File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
