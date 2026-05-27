import { useEffect, useRef } from 'react';
import 'pannellum/build/pannellum.css';
import 'pannellum/build/pannellum.js';
import { getMediaFileUrl, mediaIdentityId, mediaIdentityVersionStamp } from '../../../api';
import type { components } from '../../../@types/buldreinfo/swagger';

type Props = {
  m: components['schemas']['Media'];
};

export const PannellumViewer = ({ m }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PannellumViewerInstance | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mid = mediaIdentityId(m.identity);
    const stamp = mediaIdentityVersionStamp(m.identity);
    const imageUrl = getMediaFileUrl(mid, stamp, false, { original: true });

    viewerRef.current = window.pannellum.viewer(container, {
      type: 'equirectangular',
      panorama: imageUrl,
      autoLoad: true,
      autoRotate: -2,
      autoRotateInactivityDelay: 3000,
      compass: true,
      showZoomCtrl: true,
      keyboardZoom: true,
      mouseZoom: true,
      draggable: true,
      showFullscreenCtrl: true,
      showControls: true,
    });

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [m.identity]);

  return (
    <div ref={containerRef} data-modal-media-root className='h-full w-full' onClick={(e) => e.stopPropagation()} />
  );
};
