import React, { useRef, useEffect } from "react";
import { Marker, Tooltip, Popup, useMap } from "react-leaflet";
import {
  markerBlueIcon,
  markerRedIcon,
  parkingIcon,
  weatherIcon,
  rockIcon,
} from "./icons";
import { useNavigate } from "react-router";
import { LatLngExpression } from "leaflet";

type ParkingMarker = {
  lat: number;
  lng: number;
  label?: string;
  isParking: true;
  url?: string;
};

type CameraMarker = {
  lat: number;
  lng: number;
  label: string;
  isCamera: true;
  name: string;
  lastUpdated: string;
  urlStillImage: string;
  urlYr?: string;
  urlOther?: string;
};

type HtmlMarker = {
  id: number;
  lat: number;
  lng: number;
  label: string;
  html: React.ReactNode;
  rock?: boolean;
};

type LabelMarker = {
  lat: number;
  lng: number;
  label: string;
  url: string;
};

type GenericMarker = {
  lat: number;
  lng: number;
  label?: string;
  url?: string;
};

export type MarkerDef =
  | CameraMarker
  | GenericMarker
  | HtmlMarker
  | LabelMarker
  | ParkingMarker;

type Props = {
  markers: MarkerDef[];
  opacity: number;
  addEventHandlers: boolean;
  flyToId: number | null;
};

const isParkingMarker = (m: MarkerDef): m is ParkingMarker =>
  (m as ParkingMarker).isParking;

const isCameraMarker = (m: MarkerDef): m is CameraMarker =>
  (m as CameraMarker).isCamera;

const isHtmlMarker = (m: MarkerDef): m is HtmlMarker =>
  !!(m as HtmlMarker).html;

const isLabelMarker = (m: MarkerDef): m is LabelMarker =>
  !!(m as LabelMarker).label;

export default function Markers({
  opacity,
  markers,
  addEventHandlers,
  flyToId,
}: Props) {
  const navigate = useNavigate();
  const map = useMap();
  const markerRefs = useRef<
    Record<number, { getLatLng: () => LatLngExpression; openPopup: () => void }>
  >({});
  useEffect(() => {
    if (map && flyToId && markerRefs.current[flyToId]) {
      const marker = markerRefs.current[flyToId];
      map.flyTo(marker.getLatLng(), 13, { animate: false });
      marker.openPopup();
    }
  }, [flyToId, map]);

  if (!markers) {
    return null;
  }
  return markers.map((m) => {
    if (isParkingMarker(m)) {
      return (
        <Marker
          icon={parkingIcon}
          position={[m.lat, m.lng]}
          key={["parking", m.lat, m.lng].join("/")}
          eventHandlers={{
            click: () => {
              if (addEventHandlers) {
                navigate(m.url);
              }
            },
          }}
        >
          {m.label && (
            <Tooltip
              opacity={opacity}
              permanent
              className="buldreinfo-tooltip-compact"
            >
              {m.label}
            </Tooltip>
          )}
        </Marker>
      );
    }
    if (isCameraMarker(m)) {
      return (
        <Marker
          icon={weatherIcon}
          position={[m.lat, m.lng]}
          key={["camera", m.lat, m.lng].join("/")}
        >
          <Popup closeButton={false}>
            <b>{m.name}</b>
            {m.lastUpdated && (
              <>
                {" "}
                (<i>{m.lastUpdated}</i>)
              </>
            )}
            <a rel="noreferrer noopener" target="_blank" href={m.urlStillImage}>
              <img style={{ maxWidth: "180px" }} src={m.urlStillImage} />
            </a>
            <br />
            <i>Click on image to open in new tab</i>
            <br />
            <br />
            {m.urlYr && (
              <a rel="noreferrer noopener" target="_blank" href={m.urlYr}>
                yr.no weather forecast
              </a>
            )}
            {m.urlOther && (
              <a rel="noreferrer noopener" target="_blank" href={m.urlOther}>
                {m.urlOther}
              </a>
            )}
          </Popup>
        </Marker>
      );
    }
    if (isHtmlMarker(m)) {
      return (
        <Marker
          icon={m.rock ? rockIcon : markerBlueIcon}
          position={[m.lat, m.lng]}
          key={["html", m.lat, m.lng].join("/")}
          ref={(ref) => (markerRefs.current[m.id] = ref)}
        >
          <Tooltip
            opacity={opacity}
            permanent
            className="buldreinfo-tooltip-compact"
          >
            {m.label}
          </Tooltip>
          <Popup closeButton={false}>{m.html}</Popup>
        </Marker>
      );
    }
    if (isLabelMarker(m)) {
      return (
        <Marker
          icon={markerBlueIcon}
          position={[m.lat, m.lng]}
          key={["label", m.lat, m.lng].join("/")}
          eventHandlers={{
            click: () => {
              if (addEventHandlers) {
                navigate(m.url);
              }
            },
          }}
          draggable={false}
        >
          <Tooltip
            opacity={opacity}
            permanent
            className="buldreinfo-tooltip-compact"
          >
            {m.label}
          </Tooltip>
        </Marker>
      );
    }

    return (
      <Marker
        icon={markerRedIcon}
        position={[m.lat, m.lng]}
        key={["red", m.lat, m.lng].join("/")}
        eventHandlers={{
          click: () => {
            if (addEventHandlers && m.url) {
              navigate(m.url);
            }
          },
        }}
        draggable={false}
      />
    );
  });
}
