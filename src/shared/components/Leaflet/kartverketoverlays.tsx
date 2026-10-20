import { useEffect, useState } from 'react';
import { useMap, WMSTileLayer } from 'react-leaflet';
import { latLngBounds, type Map as LeafletMap } from 'leaflet';
import { isOsmUrl, useActiveBaseMap } from './use-active-base-map';
import type { Metadata } from '../Meta/context';

/**
 * Kartverket's WMS overlays drawn on top of every base layer: place names and the road network.
 *
 * The old `openwms.statkart.no` host is decommissioned (its DNS record is gone), so every overlay
 * tile failed with `ERR_NAME_NOT_RESOLVED`. The same services are now served by Geonorge.
 *
 * Place names are split into one layer per map scale, so we request the whole set in one GetMap:
 * each layer only draws at the scales it covers. `stedsnavn*` takes over at the deepest zooms,
 * where the `N*Stedsnavn` layers stop.
 */
const WMS_OVERLAYS = [
  {
    key: 'stedsnavn',
    url: 'https://wms.geonorge.no/skwms1/wms.topo',
    layers:
      'N5000Tettstedsnavn,N2000Stedsnavn,N1000Stedsnavn,N500Stedsnavn,N250Stedsnavn,N100Stedsnavn,N50Stedsnavn,' +
      'stedsnavn5punkt,stedsnavn5linje,stedsnavn1punkt,stedsnavn1linje',
  },
  { key: 'vegnett', url: 'https://wms.geonorge.no/skwms1/wms.vegnett2', layers: 'vegnett2' },
] as const;

/**
 * Both services only hold Norwegian data. Every GetMap outside this box comes back as a fully
 * transparent tile, so asking for one is pointless network traffic and console noise — exactly
 * what happened when panning away from Norway used to end at a blank map. Padded a little so the
 * overlays do not blink on/off at the edge of the coverage.
 */
const COVERAGE_BOUNDS = latLngBounds([56.5, 3.5], [75.5, 32.5]);

/** At world zoom a single WMS tile spans a continent; nothing useful is drawn there. */
const MIN_OVERLAY_ZOOM = 5;

/**
 * Above the regional base layers (`zIndex 1`) and the OSM underlay (`0`). The stacking has to be
 * explicit: Leaflet re-appends a base layer container when the layer control swaps it, which would
 * otherwise put it in front of the overlays they share a pane with.
 */
const OVERLAY_Z_INDEX = 2;

const hasCoverage = (map: LeafletMap) =>
  map.getZoom() >= MIN_OVERLAY_ZOOM && COVERAGE_BOUNDS.intersects(map.getBounds());

type Props = {
  maps: Metadata['maps'];
};

export default function KartverketOverlays({ maps }: Props) {
  const map = useMap();
  const activeMap = useActiveBaseMap(maps);
  const [covered, setCovered] = useState(() => hasCoverage(map));

  /**
   * `moveend` also fires after a zoom, so it covers panning as well as the initial `fitBounds`
   * done by the map's children. `resize` catches a fullscreen toggle, which changes the bounds
   * without moving the center.
   */
  useEffect(() => {
    const update = () => setCovered(hasCoverage(map));
    update();
    map.on('moveend', update);
    map.on('resize', update);
    return () => {
      map.off('moveend', update);
      map.off('resize', update);
    };
  }, [map]);

  /** The OSM base map already has the names and roads these overlays would duplicate. */
  if (!covered || isOsmUrl(activeMap?.url)) {
    return null;
  }

  return (
    <>
      {WMS_OVERLAYS.map((overlay) => (
        <WMSTileLayer
          key={overlay.key}
          url={overlay.url}
          params={{ transparent: true, format: 'image/png', layers: overlay.layers, version: '1.3.0' }}
          zIndex={OVERLAY_Z_INDEX}
        />
      ))}
    </>
  );
}
