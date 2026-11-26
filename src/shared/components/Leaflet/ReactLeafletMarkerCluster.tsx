import { createPathComponent } from '@react-leaflet/core';
import type { FeatureGroup, LeafletEventHandlerFn } from 'leaflet';
import { MarkerClusterGroup as LeafletMarkerClusterGroup, type MarkerClusterGroupOptions } from 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const MarkerClusterGroup = createPathComponent(({ children: _c, ...props }, ctx) => {
  const clusterProps: Record<string, unknown> = {
    maxClusterRadius: 19,
    spiderfyOnMaxZoom: true,
    disableClusteringAtZoom: 19,
  };
  const clusterEvents: Record<string, LeafletEventHandlerFn> = {};

  // Splitting props and events to different objects
  Object.entries(props).forEach(([propName, prop]) => {
    if (propName.startsWith('on') && typeof prop === 'function') {
      clusterEvents[`cluster${propName.substring(2).toLowerCase()}`] = prop as LeafletEventHandlerFn;
    } else {
      clusterProps[propName] = prop;
    }
  });

  // leaflet.markercluster v2 is an ES module that exports the group as a class. It no longer adds
  // L.MarkerClusterGroup / L.markerClusterGroup to the Leaflet namespace (only the global build does).
  // Its bundled types target Leaflet 2.0, so with @types/leaflet@1.9 the inherited FeatureGroup members
  // are not visible: widen to the FeatureGroup it is at runtime.
  const markerClusterGroup = new LeafletMarkerClusterGroup(
    clusterProps as MarkerClusterGroupOptions,
  ) as unknown as FeatureGroup;

  // Initializing event listeners
  Object.entries(clusterEvents).forEach(([clusterEvent, callback]) => {
    markerClusterGroup.on(clusterEvent, callback);
  });

  return {
    instance: markerClusterGroup,
    context: { ...ctx, layerContainer: markerClusterGroup },
  };
});

export default MarkerClusterGroup;
