import { createPathComponent } from '@react-leaflet/core';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster';

// Extend Leaflet types to include markerClusterGroup from the plugin
declare module 'leaflet' {
  function markerClusterGroup(options?: Record<string, unknown>): L.FeatureGroup;
}

const MarkerClusterGroup = createPathComponent(({ children: _c, ...props }, ctx) => {
  const clusterProps: Record<string, unknown> = {
    maxClusterRadius: 19,
    spiderfyOnMaxZoom: true,
    disableClusteringAtZoom: 19,
  };
  const clusterEvents: Record<string, unknown> = {};

  // Splitting props and events to different objects
  Object.entries(props).forEach(([propName, prop]) =>
    propName.startsWith('on') ? (clusterEvents[propName] = prop) : (clusterProps[propName] = prop),
  );

  // Creating markerClusterGroup Leaflet element
  // MarkerClusterGroup is added to L namespace by the leaflet.markercluster plugin
  const markerClusterGroup = L.markerClusterGroup(clusterProps);

  // Initializing event listeners
  Object.entries(clusterEvents).forEach(([eventAsProp, callback]) => {
    const clusterEvent = `cluster${eventAsProp.substring(2).toLowerCase()}`;
    markerClusterGroup.on(clusterEvent, callback as L.LeafletEventHandlerFn);
  });

  return {
    instance: markerClusterGroup,
    context: { ...ctx, layerContainer: markerClusterGroup },
  };
});

export default MarkerClusterGroup;
