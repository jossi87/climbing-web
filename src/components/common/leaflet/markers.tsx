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
import { captureException } from "@sentry/react";

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
  // TODO: Sometimes we just set this to "true" just to be truthy. This isn't
  //       great and will cause a bug at some point.
  //       I wonder if a better design would be to have an explicit "type" field
  //       instead of inspecting properties.
  rock?: boolean | string | number | null;
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
  flyToId: number | undefined | null;
  showElevation?: boolean;
};

const isCoordinateMarker = (
  m: MarkerDef,
): m is MarkerDef & Required<Pick<MarkerDef, "coordinates">> => {
  return !!(m.coordinates.latitude && m.coordinates.longitude);
};

const isParkingMarker = (m: MarkerDef): m is ParkingMarker =>
  isCoordinateMarker(m) && (m as ParkingMarker).isParking;

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
    Record<
      number,
      { getLatLng: () => LatLngExpression; openPopup: () => void } | null
    >
  >({});
  useEffect(() => {
    if (map && flyToId && markerRefs.current[flyToId]) {
      const marker = markerRefs.current[flyToId];
      if (marker) {
        map.flyTo(marker.getLatLng(), 13, { animate: false });
        marker.openPopup();
      } else {
        captureException("Missing marker ref", {
          extra: { flyToId, refs: Object.keys(markerRefs.current ?? {}) },
        });
      }
    }
  }, [flyToId, map]);

  if (!markers) {
    return null;
  }
  return markers.map((m) => {
    let label = m.label;
    if (showElevation && m.coordinates.elevation) {
      const elevation = Math.round(m.coordinates.elevation);
      label = label ? label + " (" + elevation + "m)" : elevation + "m";
    }
    if (isParkingMarker(m)) {
      return (
        <Marker
          icon={parkingIcon}
          position={[m.coordinates.latitude ?? 0, m.coordinates.longitude ?? 0]}
          key={[
            "parking",
            m.coordinates.latitude,
            m.coordinates.longitude,
            m.url,
          ].join("/")}
          eventHandlers={{
            click: () => {
              if (addEventHandlers) {
                if (m.url) {
                  navigate(m.url);
                } else {
                  captureException("Missing marker URL", {
                    extra: { marker: m },
                  });
                }
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
          position={[m.coordinates.latitude ?? 0, m.coordinates.longitude ?? 0]}
          key={["camera", m.coordinates.latitude, m.coordinates.longitude].join(
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
          position={[m.coordinates.latitude ?? 0, m.coordinates.longitude ?? 0]}
          key={["html", m.coordinates.latitude, m.coordinates.longitude].join(
            "/",
          )}
          ref={(ref) => (markerRefs.current[m.id] = ref)}
        >
          <Tooltip
            opacity={opacity}
            permanent
            className="buldreinfo-tooltip-compact"
          >
            {label}
          </Tooltip>
          <Popup closeButton={false}>{m.html}</Popup>
        </Marker>
      );
    }

    if (isLabelMarker(m)) {
      return (
        <Marker
          icon={markerBlueIcon}
          position={[m.coordinates.latitude ?? 0, m.coordinates.longitude ?? 0]}
          key={[
            "label",
            m.label,
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
          draggable={false}
        >
          <Tooltip
            opacity={opacity}
            permanent
            className="buldreinfo-tooltip-compact"
          >
            {label}
          </Tooltip>
        </Marker>
      );
    }

    return (
      <Marker
        icon={markerRedIcon}
        position={[m.coordinates.latitude ?? 0, m.coordinates.longitude ?? 0]}
        key={["red", m.coordinates.latitude, m.coordinates.longitude].join("/")}
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
