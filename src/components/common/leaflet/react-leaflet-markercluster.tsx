import { createPathComponent } from '@react-leaflet/core';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';

require('leaflet.markercluster');

const MarkerClusterGroup = createPathComponent((
  { children: _c, ...props },
  ctx
) => {
  const clusterProps = {maxClusterRadius: 18, spiderfyOnMaxZoom: true};
  const clusterEvents = {};

  // Splitting props and events to different objects
  Object.entries(props).forEach(
    ([propName, prop]) => propName.startsWith('on')
      ? clusterEvents[propName] = prop
      : clusterProps[propName] = prop
  );

  // Creating markerClusterGroup Leaflet element
  //@ts-ignore
  const markerClusterGroup = new L.markerClusterGroup(clusterProps);

  // Initializing event listeners
  Object.entries(clusterEvents).forEach(
    ([eventAsProp, callback]) => {
      const clusterEvent = `cluster${eventAsProp.substring(2).toLowerCase()}`;
      markerClusterGroup.on(clusterEvent, callback);
    },
  );

  return { instance: markerClusterGroup, context: { ...ctx, layerContainer: markerClusterGroup } };
});

export default MarkerClusterGroup;