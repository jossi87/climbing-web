import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getMediaFileUrl, getMediaFileUrlSrcSet, mediaIdentityId, mediaIdentityVersionStamp } from '../../../api';
import { SvgRoute } from '../SvgViewer/SvgRoute';
import { Descent, Rappel } from '../../../utils/svg-utils';
import { isPathVisible, scalePath, scalePoint, type MediaRegion } from '../../../utils/svg-scaler';
import type { components } from '../../../@types/buldreinfo/swagger';

/**
 * Full-size image viewer.
 *
 * Shows the image at its original resolution with native scroll to pan.
 * If the media has SVG topo lines, they are rendered on top at full resolution.
 * Click X or the background to go back to the normal modal view.
 */
type Props = {
  m: components['schemas']['Media'];
  onExitZoom: () => void;
};

export const ZoomableImage = ({ m, onExitZoom }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hide body/html scrollbar while zoom overlay is active
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

  // Scroll to center when content loads and is larger than viewport
  useEffect(() => {
    if (!loaded) return;
    const el = scrollRef.current;
    if (!el) return;
    const scrollW = el.scrollWidth;
    const scrollH = el.scrollHeight;
    const clientW = el.clientWidth;
    const clientH = el.clientHeight;
    if (scrollW > clientW || scrollH > clientH) {
      el.scrollTo({
        left: Math.max(0, (scrollW - clientW) / 2),
        top: Math.max(0, (scrollH - clientH) / 2),
        behavior: 'instant',
      });
    }
  }, [loaded]);

  // ── image src (high-res) ──────────────────────────────────────────────
  const midId = mediaIdentityId(m.identity);
  const stamp = mediaIdentityVersionStamp(m.identity);
  const targetWidth = Math.max(m.width ?? 0, 2560);
  const src = getMediaFileUrl(midId, stamp, false, { targetWidth });
  const srcSet = getMediaFileUrlSrcSet(midId, stamp, Math.max(m.width ?? 0, targetWidth));

  // ── SVG topo processing (mirrors SvgViewer logic) ─────────────────────
  const svgs = useMemo(() => (m.svgs ?? []) as components['schemas']['Svg'][], [m.svgs]);
  const hasMediaSvgs = (m.mediaSvgs?.length ?? 0) > 0;
  const hasSvgs = svgs.length > 0 || hasMediaSvgs;

  const processed = useMemo(() => {
    if (!hasSvgs) return null;

    const imgW = m.width ?? 0;
    const imgH = m.height ?? 0;
    const mediaRegion: MediaRegion | null = null;
    const processedSvgs: components['schemas']['Svg'][] = [...svgs];

    const regionForScaleAll: MediaRegion = mediaRegion ?? { x: 0, y: 0, width: imgW, height: imgH };
    const scale = Math.max(imgW / 1920, imgH / 1440);

    return { imgW, imgH, mediaRegion, svgs: processedSvgs, regionForScaleAll, scale };
  }, [m, svgs, hasSvgs]);

  // ── Render SVG topo overlay ───────────────────────────────────────────
  const svgOverlay = useMemo(() => {
    if (!processed) return null;
    const { imgW, imgH, mediaRegion, svgs: processedSvgs, regionForScaleAll, scale } = processed;

    const mediaSvgs = ((m.mediaSvgs ?? []) as components['schemas']['MediaSvgElement'][])
      .filter((svg) => !svg.path || (mediaRegion ? isPathVisible(svg.path ?? '', regionForScaleAll) : true))
      .map((svg, idx) => {
        const keyPrefix = `${midId}-zoom-${idx}`;
        switch (svg.t) {
          case 'PATH':
            return (
              <Descent
                key={`${keyPrefix}-descent`}
                path={scalePath(svg.path ?? '', regionForScaleAll)}
                scale={scale}
                thumb={false}
              />
            );
          case 'RAPPEL_BOLTED':
          case 'RAPPEL_NOT_BOLTED': {
            const { x, y } = scalePoint(svg.rappelX ?? 0, svg.rappelY ?? 0, regionForScaleAll);
            return (
              <Rappel
                key={`${keyPrefix}-rappel`}
                x={x}
                y={y}
                bolted={svg.t === 'RAPPEL_BOLTED'}
                scale={scale}
                thumb={false}
                backgroundColor='black'
                color='white'
              />
            );
          }
          default:
            return null;
        }
      });

    const routes = [...processedSvgs]
      .sort((a, b) => {
        if ((a.pitch ?? 0) !== (b.pitch ?? 0)) return (a.pitch ?? 0) - (b.pitch ?? 0);
        return (b.nr ?? 0) - (a.nr ?? 0);
      })
      .map((svg) => (
        <SvgRoute
          key={`${midId}-${svg.problemId}-${svg.pitch}-zoom`}
          thumbnail={false}
          showText={false}
          scale={scale}
          mobile={false}
          mediaId={midId}
          mediaHeight={imgH}
          mediaWidth={imgW}
          svg={svg}
          optProblemId={0}
          problemIdHovered={0}
          pitch={0}
        />
      ));

    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        overflow='visible'
        className='pointer-events-none block select-none'
        style={{ width: 'min(1920px, 150vw)', height: 'auto' }}
        viewBox={`0 0 ${imgW} ${imgH}`}
        preserveAspectRatio='xMidYMid meet'
      >
        <image
          xlinkHref={getMediaFileUrl(midId, stamp, false, {
            mediaRegion: mediaRegion ?? undefined,
          })}
          width='100%'
          height='100%'
        />
        {mediaSvgs}
        {routes && <g>{routes}</g>}
      </svg>
    );
  }, [processed, m.mediaSvgs, midId, stamp]);

  return (
    <div className='fixed inset-0 z-[300] flex items-start justify-center bg-black/95' onClick={onExitZoom}>
      {/* Close button */}
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation();
          onExitZoom();
        }}
        className='absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-[#f8fafc] shadow-lg ring-1 ring-white/20 transition-all hover:bg-red-700 active:scale-95'
        aria-label='Exit zoom'
      >
        <X size={20} strokeWidth={2} />
      </button>

      {/* Loading indicator */}
      {!loaded && (
        <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center'>
          <Loader2 className='animate-spin text-[#f8fafc]/60' size={40} strokeWidth={1.5} />
        </div>
      )}

      {/* Full-size content with native scroll; centered when smaller than viewport */}
      <div ref={scrollRef} className='flex h-full w-full flex-col overflow-auto' onClick={(e) => e.stopPropagation()}>
        {hasSvgs && svgOverlay ? (
          <>
            {/* Hidden img to preload the high-res image and signal when loaded */}
            <img
              src={src}
              alt=''
              draggable={false}
              className='pointer-events-none absolute opacity-0'
              onLoad={() => setLoaded(true)}
            />
            <div
              style={{
                width: 'min(1920px, 150vw)',
                height: 'auto',
                marginTop: 'auto',
                marginBottom: 'auto',
                marginLeft: 'auto',
                marginRight: 'auto',
                opacity: loaded ? 1 : 0,
                transition: 'opacity 0.2s',
              }}
            >
              {svgOverlay}
            </div>
          </>
        ) : (
          <img
            src={src}
            srcSet={srcSet}
            sizes={`${Math.max(m.width ?? 2560, 2560)}px`}
            alt=''
            draggable={false}
            className='block select-none'
            style={{
              width: m.width ? `${m.width}px` : 'auto',
              height: 'auto',
              maxWidth: 'none',
              maxHeight: 'none',
              marginTop: 'auto',
              marginBottom: 'auto',
              marginLeft: 'auto',
              marginRight: 'auto',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>
    </div>
  );
};
