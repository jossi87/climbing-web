import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useScrollLock } from '../../utils/scroll-lock';
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
  showSvg: boolean;
  onToggleSvg: () => void;
  onExitZoom: () => void;
};

export const ZoomableImage = ({ m, showSvg, onToggleSvg, onExitZoom }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /** Hide body/html scrollbar while zoom overlay is active (ref-counted, safe with parent MediaModal) */
  useScrollLock();

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

  const { mediaRegion, regionForScaleAll, scale } = processed ?? {};

  // ── Media SVG elements (descent paths, rappel anchors drawn on the image) ──
  const mediaSvgs = useMemo(() => {
    if (!regionForScaleAll || !scale) return [];
    return ((m.mediaSvgs ?? []) as components['schemas']['MediaSvgElement'][])
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
  }, [m.mediaSvgs, mediaRegion, regionForScaleAll, scale, midId]);

  // ── Route SVG elements ────────────────────────────────────────────────
  const routes = useMemo(() => {
    if (!processed || processed.svgs.length === 0) return null;
    return [...processed.svgs]
      .sort((a, b) => {
        if ((a.pitch ?? 0) !== (b.pitch ?? 0)) return (a.pitch ?? 0) - (b.pitch ?? 0);
        return (b.nr ?? 0) - (a.nr ?? 0);
      })
      .map((svg) => (
        <SvgRoute
          key={`${midId}-${svg.problemId}-${svg.pitch}-zoom`}
          thumbnail={false}
          showText={false}
          scale={processed.scale}
          mobile={false}
          mediaId={midId}
          mediaHeight={processed.imgH}
          mediaWidth={processed.imgW}
          svg={svg}
          optProblemId={0}
          problemIdHovered={0}
          pitch={0}
        />
      ));
  }, [processed, midId]);

  // ── Render SVG topo overlay ───────────────────────────────────────────
  const svgOverlay = useMemo(() => {
    if (!processed) return null;
    const { imgW, imgH, mediaRegion: mr } = processed;

    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        overflow='visible'
        className='pointer-events-none block select-none'
        style={{ width: '100%', height: 'auto' }}
        viewBox={`0 0 ${imgW} ${imgH}`}
        preserveAspectRatio='xMidYMid meet'
      >
        <image
          xlinkHref={getMediaFileUrl(midId, stamp, false, {
            mediaRegion: mr ?? undefined,
          })}
          width='100%'
          height='100%'
        />
        {showSvg && routes && <g>{routes}</g>}
        {showSvg && mediaSvgs.length > 0 && <g>{mediaSvgs}</g>}
      </svg>
    );
  }, [processed, midId, stamp, routes, mediaSvgs, showSvg]);

  return (
    <div className='fixed inset-0 z-[300] flex items-start justify-center bg-black/95' onClick={onExitZoom}>
      {/* Top-right toolbar */}
      <div className='absolute top-4 right-4 z-10 flex items-center gap-2'>
        {hasSvgs && (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onToggleSvg();
            }}
            title={showSvg ? 'Hide SVG elements' : 'Show SVG elements'}
            aria-label={showSvg ? 'Hide SVG elements' : 'Show SVG elements'}
            className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-[#f8fafc] shadow-lg ring-1 ring-white/20 transition-all hover:bg-slate-700 active:scale-95'
          >
            {showSvg ? <Eye size={18} strokeWidth={2} /> : <EyeOff size={18} strokeWidth={2} />}
          </button>
        )}
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onExitZoom();
          }}
          className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-[#f8fafc] shadow-lg ring-1 ring-white/20 transition-all hover:bg-red-700 active:scale-95'
          aria-label='Exit zoom'
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Loading indicator */}
      {!loaded && (
        <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center'>
          <Loader2 className='animate-spin text-[#f8fafc]/60' size={40} strokeWidth={1.5} />
        </div>
      )}

      {/* Full-size content with native scroll; centered when smaller than viewport */}
      <div ref={scrollRef} className='flex h-full w-full flex-col overflow-auto' onClick={(e) => e.stopPropagation()}>
        {hasSvgs && svgOverlay ? (
          <div
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
          >
            {/* Hidden img to preload the high-res image and signal when loaded */}
            <img
              src={src}
              alt=''
              draggable={false}
              className='pointer-events-none absolute opacity-0'
              onLoad={() => setLoaded(true)}
            />
            {svgOverlay}
          </div>
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
