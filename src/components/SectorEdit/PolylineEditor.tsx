import { useState, useCallback } from 'react';
import { colorLatLng, parsePolyline } from '../../utils/polyline';
import { type DropzoneOptions, useDropzone } from 'react-dropzone';
import type { components } from '../../@types/buldreinfo/swagger';
import { calculateDistanceBetweenCoordinates, parsers } from '../common/leaflet/geo-utils';
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
    <div className='bg-surface-card border border-surface-border rounded-xl overflow-hidden shadow-sm'>
      <div className='flex border-b border-surface-border bg-surface-nav/20'>
        <button
          type='button'
          onClick={() => setActiveTab('POINTS')}
          className={navItemClasses('POINTS')}
        >
          <List size={14} /> Points
        </button>
        <button
          type='button'
          onClick={() => setActiveTab('DATA')}
          className={navItemClasses('DATA')}
        >
          <Database size={14} /> Raw Data
        </button>
        {upload && (
          <button
            type='button'
            onClick={() => setActiveTab('UPLOAD')}
            className={navItemClasses('UPLOAD')}
          >
            <FileCode size={14} /> GPX/TCX
          </button>
        )}
      </div>

      <div className='p-4 min-h-30'>
        {activeTab === 'POINTS' && (
          <div className='flex flex-wrap gap-2'>
            {coordinates?.length > 0 ? (
              coordinates.map((c, i) => {
                const [bg, fg] = colorLatLng(c);
                return (
                  <span
                    key={`${c.latitude}-${c.longitude}-${i}`}
                    className='inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-bold border'
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
                      className='hover:opacity-70 transition-opacity'
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })
            ) : (
              <p className='text-xs text-slate-500 italic'>
                No points defined yet. Click on the map to add points.
              </p>
            )}
          </div>
        )}

        {activeTab === 'DATA' && (
          <div className='space-y-2'>
            <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
              Coordinate String
            </label>
            <input
              type='text'
              className='w-full bg-surface-nav border border-surface-border rounded-lg py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand transition-colors'
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
              'border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer',
              isDragActive
                ? 'border-brand bg-brand/5'
                : 'border-surface-border hover:border-slate-500 bg-surface-nav/20',
            )}
          >
            <input {...getInputProps()} />
            <div className='flex flex-col items-center gap-3'>
              <div className='p-3 bg-brand/10 rounded-full text-brand'>
                <Upload size={24} />
              </div>
              <div className='space-y-1'>
                <p className='text-xs font-bold text-slate-200'>
                  Drag-and-drop a <code className='text-brand'>.gpx</code> or{' '}
                  <code className='text-brand'>.tcx</code> file
                </p>
                <p className='text-[10px] text-slate-500 max-w-xs mx-auto'>
                  Import paths from GPS watches, Strava, or Fitbit to generate the approach path
                  automatically.
                </p>
              </div>
              <button
                type='button'
                className='mt-2 px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all'
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
