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
import { components } from "../../../@types/buldreinfo/swagger";

type ParkingMarker = {
  coordinates: components["schemas"]["Coordinates"];
  label?: string;
  isParking: true;
  url?: string;
};

type CameraMarker = {
  coordinates: components["schemas"]["Coordinates"];
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
  coordinates: components["schemas"]["Coordinates"];
  label: string;
  html: React.ReactNode;
  rock?: string;
};

type LabelMarker = {
  coordinates: components["schemas"]["Coordinates"];
  label: string;
  url: string;
};

type GenericMarker = {
  coordinates: components["schemas"]["Coordinates"];
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
  showElevation?: boolean;
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
  showElevation,
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
      let label = m.label;
      if (showElevation && m.coordinates.elevation > 0) {
        const elevation = Math.round(m.coordinates.elevation);
        label = label ? label + " (" + elevation + "m)" : elevation + "m";
      }
      return (
        <Marker
          icon={parkingIcon}
          position={[m.coordinates.latitude, m.coordinates.longitude]}
          key={[
            "parking",
            m.coordinates.latitude,
            m.coordinates.longitude,
          ].join("/")}
          eventHandlers={{
            click: () => {
              if (addEventHandlers) {
                navigate(m.url);
              }
            },
          }}
        >
          {label && (
            <Tooltip
              opacity={opacity}
              permanent
              className="buldreinfo-tooltip-compact"
            >
              {label}
            </Tooltip>
          )}
        </Marker>
      );
    }
    if (isCameraMarker(m)) {
      return (
        <Marker
          icon={weatherIcon}
          position={[m.coordinates.latitude, m.coordinates.latitude]}
          key={["camera", m.coordinates.latitude, m.coordinates.latitude].join(
            "/",
          )}
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
          position={[m.coordinates.latitude, m.coordinates.latitude]}
          key={["html", m.coordinates.latitude, m.coordinates.latitude].join(
            "/",
          )}
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
          position={[m.coordinates.latitude, m.coordinates.latitude]}
          key={[
            "label",
            m.url,
            m.coordinates.latitude,
            m.coordinates.latitude,
          ].join("/")}
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
        position={[m.coordinates.latitude, m.coordinates.latitude]}
        key={["red", m.coordinates.latitude, m.coordinates.latitude].join("/")}
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
