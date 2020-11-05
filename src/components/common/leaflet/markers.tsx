import React from "react";
import { Marker, Tooltip, Popup } from "react-leaflet";
import { markerIcon, parkingIcon, weatherIcon } from './icons';

export default function Markers({ history, opacity, markers, addEventHandlers }) {
  if (!markers) {
    return null;
  }
  return (
    markers.map((m, i) => {
      if (m.isParking) {
        return (
          <Marker
            icon={parkingIcon}
            position={[m.lat, m.lng]}
            key={i}
            eventHandlers={{
              click: () => {
                if (addEventHandlers) {
                  history.push(m.url)
                }
              }
            }}
          >
            {m.label && (
              <Tooltip opacity={opacity} permanent className='buldreinfo-tooltip-compact'>
                {m.label}
              </Tooltip>
            )}
          </Marker>
        )
      } else if (m.isCamera) {
        return (
          <Marker icon={weatherIcon} position={[m.lat, m.lng]} key={i}>
            <Popup>
              <b>{m.name}</b> (<i>{m.lastUpdated}</i>)
              <a rel='noopener' target='_blank' href={m.urlStillImage}><img style={{maxWidth: '225px'}} src={m.urlStillImage}/></a><br/>
              <i>Click on image to open in new tab</i><br/><br/>
              <a rel='noopener' target='_blank' href={m.urlYr}>yr.no weather forecast</a>
            </Popup>
          </Marker>
        );
      } else {
        return (
          <Marker
            icon={markerIcon}
            position={[m.lat, m.lng]}
            key={i}
            eventHandlers={{
              click: () => {
                if (addEventHandlers) {
                  history.push(m.url)
                }
              }
            }}
            draggable={false} >
            {m.label && (
              <Tooltip opacity={opacity} permanent className='buldreinfo-tooltip-compact'>
                {m.label}
              </Tooltip>
            )}
          </Marker>
        )
      }
    })
  );
}