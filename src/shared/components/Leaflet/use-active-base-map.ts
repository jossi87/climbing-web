import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import type { LayersControlEvent } from 'leaflet';
import type { Metadata } from '../Meta/context';

/** A base map that already carries every name and road a Kartverket overlay would add. */
export const isOsmUrl = (url: string | undefined) => !!url && /(^|\.)openstreetmap\.org\//i.test(url);

/**
 * The base layer the `LayersControl` currently shows.
 *
 * Picking a base layer swaps it on the Leaflet map directly, so `baselayerchange` is the only place
 * that tells us what is actually visible — the `checked` prop only sets the initial value.
 */
export function useActiveBaseMap(maps: Metadata['maps']) {
  const map = useMap();
  const defaultMap = maps.find((m) => m.isDefault) ?? maps[0];
  const [activeName, setActiveName] = useState(defaultMap?.name);

  useEffect(() => {
    const handleBaseLayerChange = (event: LayersControlEvent) => setActiveName(event.name);
    map.on('baselayerchange', handleBaseLayerChange);
    return () => {
      map.off('baselayerchange', handleBaseLayerChange);
    };
  }, [map]);

  return maps.find((m) => m.name === activeName) ?? defaultMap;
}
