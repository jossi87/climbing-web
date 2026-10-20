import { TileLayer } from 'react-leaflet';
import { isOsmUrl, useActiveBaseMap } from './use-active-base-map';
import type { Metadata } from '../Meta/context';

/**
 * OpenStreetMap tiles drawn **beneath** the region's own base maps.
 *
 * The Norwegian base maps (Kartverket topo) only have tiles inside Norway. Panning outside the
 * country therefore leaves transparent tiles — and a tile server that is down leaves failed
 * tiles — which used to render as a blank map. Keeping a world-wide OSM layer underneath makes
 * those areas fall back to OpenStreetMap automatically, without the user having to switch layers.
 */
const OSM_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';
/** OSM's highest native zoom; deeper map zooms upscale the level-19 tiles instead of requesting missing ones. */
const OSM_MAX_NATIVE_ZOOM = 19;
/** Below the default `tilePane` z-index (1) used by the region's base layers. */
const FALLBACK_Z_INDEX = 0;

type Props = {
  maps: Metadata['maps'];
};

export default function OsmFallback({ maps }: Props) {
  const activeMap = useActiveBaseMap(maps);

  /** A region that already offers OSM needs no underlay — it would only fetch every tile twice. */
  if (isOsmUrl(activeMap?.url)) {
    return null;
  }

  return (
    <TileLayer
      attribution={OSM_ATTRIBUTION}
      maxNativeZoom={OSM_MAX_NATIVE_ZOOM}
      maxZoom={Math.max(OSM_MAX_NATIVE_ZOOM, activeMap?.maxZoom ?? 0)}
      url={OSM_URL}
      zIndex={FALLBACK_Z_INDEX}
    />
  );
}
