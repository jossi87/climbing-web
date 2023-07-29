import React, { useState, useEffect, ComponentProps, useCallback } from "react";
import GpxParser from "gpxparser";
import Dropzone from "react-dropzone";
import { Helmet } from "react-helmet";
import ImageUpload from "./common/image-upload/image-upload";
import { Loading } from "./common/widgets/widgets";
import {
  Checkbox,
  Form,
  Button,
  Input,
  TextArea,
  Segment,
  Accordion,
  Icon,
  Message,
} from "semantic-ui-react";
import { useMeta } from "./common/meta";
import {
  getSectorEdit,
  postSector,
  getSector,
  getArea,
  useAccessToken,
} from "../api";
import Leaflet from "./common/leaflet/leaflet";
import { useNavigate, useParams } from "react-router-dom";
import { VisibilitySelectorField } from "./common/VisibilitySelector";

const useIds = (): { areaId: number; sectorId: number } => {
  const { sectorId, areaId } = useParams();
  return { sectorId: +sectorId, areaId: +areaId };
};

const SectorEdit = () => {
  const accessToken = useAccessToken();
  const { areaId, sectorId } = useIds();
  const [leafletMode, setLeafletMode] = useState("PARKING");
  const [data, setData] = useState<any>(null);
  const [showProblemOrder, setShowProblemOrder] = useState(false);
  const [sectorMarkers, setSectorMarkers] = useState<any>(null);
  const [area, setArea] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const meta = useMeta();
  useEffect(() => {
    if (accessToken) {
      getSectorEdit(accessToken, areaId, sectorId)
        .then((data) => setData(data))
        .then(() => {
          getArea(accessToken, areaId).then((data) => setArea(data[0]));
        })
        .catch((e) => {
          setError(String(e));
        });
    }
  }, [accessToken, areaId, sectorId]);

  function onNameChanged(e, { value }) {
    setData((prevState) => ({ ...prevState, name: value }));
  }

  function onLockedChanged({ lockedAdmin, lockedSuperadmin }) {
    setData((prevState) => ({
      ...prevState,
      lockedAdmin,
      lockedSuperadmin,
    }));
  }

  function onCommentChanged(e, { value }) {
    setData((prevState) => ({ ...prevState, comment: value }));
  }

  function onAccessInfoChanged(e, { value }) {
    setData((prevState) => ({ ...prevState, accessInfo: value }));
  }

  function onAccessClosedChanged(e, { value }) {
    setData((prevState) => ({ ...prevState, accessClosed: value }));
  }

  const onNewMediaChanged = useCallback((newMedia) => {
    setData((prevState) => ({ ...prevState, newMedia }));
  }, []);

  function save(event) {
    event.preventDefault();
    const trash = data.trash ? true : false;
    if (!trash || confirm("Are you sure you want to move sector to trash?")) {
      setSaving(true);
      postSector(
        accessToken,
        data.areaId,
        data.id,
        data.trash,
        data.lockedAdmin,
        data.lockedSuperadmin,
        data.name,
        data.comment,
        data.accessInfo,
        data.accessClosed,
        data.lat,
        data.lng,
        data.polygonCoords,
        data.polyline,
        data.newMedia,
        data.problemOrder,
      )
        .then(async (res) => {
          navigate(res.destination);
        })
        .catch((error) => {
          console.warn(error);
        });
    }
  }

  function onMapMouseClick(event) {
    if (leafletMode == "PARKING") {
      setData((prevState) => ({
        ...prevState,
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        latStr: event.latlng.lat,
        lngStr: event.latlng.lng,
      }));
    } else if (leafletMode == "POLYGON") {
      const coords = event.latlng.lat + "," + event.latlng.lng;
      let { polygonCoords } = data;
      if (polygonCoords) {
        polygonCoords = polygonCoords + ";" + coords;
      } else {
        polygonCoords = coords;
      }
      setData((prevState) => ({ ...prevState, polygonCoords }));
    } else if (leafletMode == "POLYLINE") {
      const coords = event.latlng.lat + "," + event.latlng.lng;
      let { polyline } = data;
      if (polyline) {
        polyline = polyline + ";" + coords;
      } else {
        polyline = coords;
      }
      setData((prevState) => ({ ...prevState, polyline }));
    }
  }

  function clearDrawing() {
    if (leafletMode == "PARKING") {
      setData((prevState) => ({ ...prevState, lat: 0, lng: 0 }));
    } else if (leafletMode == "POLYGON") {
      setData((prevState) => ({ ...prevState, polygonCoords: null }));
    } else if (leafletMode == "POLYLINE") {
      setData((prevState) => ({ ...prevState, polyline: null }));
    }
  }

  function onLatChanged(e, { value }) {
    let latStr = value.replace(",", ".");
    let lat = parseFloat(latStr);
    if (isNaN(lat)) {
      lat = 0;
      latStr = "";
    }
    setData((prevState) => ({ ...prevState, lat, latStr }));
  }

  function onLngChanged(e, { value }) {
    let lngStr = value.replace(",", ".");
    let lng = parseFloat(lngStr);
    if (isNaN(lng)) {
      lng = 0;
      lngStr = "";
    }
    setData((prevState) => ({ ...prevState, lng, lngStr }));
  }

  if (error) {
    return (
      <Message
        size="huge"
        style={{ backgroundColor: "#FFF" }}
        icon="meh"
        header="404"
        content={
          "Cannot find the specified sector because it does not exist or you do not have sufficient permissions."
        }
      />
    );
  }

  if (!data) {
    return <Loading />;
  }

  const outlines: ComponentProps<typeof Leaflet>["outlines"] = [];
  const polylines: ComponentProps<typeof Leaflet>["polylines"] = [];
  if (area) {
    area.sectors.forEach((sector) => {
      if (sector.id != data.id) {
        if (sector.polygonCoords) {
          const sectorPolygon = sector.polygonCoords
            .split(";")
            .filter((i) => i)
            .map((c) => {
              const latLng = c.split(",");
              return [parseFloat(latLng[0]), parseFloat(latLng[1])];
            });
          outlines.push({
            polygon: sectorPolygon,
            background: true,
            label: sector.name,
          });
        }
        if (sector.polyline) {
          const sectorPolyline = sector.polyline
            .split(";")
            .filter((i) => i)
            .map((e) => e.split(",").map(Number));
          polylines.push({ polyline: sectorPolyline, background: true });
        }
      }
    });
  }
  let polygonError = false;
  const polygon =
    data.polygonCoords &&
    data.polygonCoords
      .split(";")
      .filter((i) => i)
      .map((c) => {
        const latLng = c.split(",");
        if (latLng?.length === 2) {
          const lat = parseFloat(latLng[0]);
          const lng = parseFloat(latLng[1]);
          if (lat > 0 && lng > 0) {
            return [lat, lng];
          } else {
            polygonError = true;
          }
        } else {
          polygonError = true;
        }
      })
      .filter((e) => e?.length === 2 && e[0] > 0 && e[1] > 0);
  if (polygon) {
    outlines.push({ polygon, background: false });
  }
  const polyline =
    data.polyline &&
    data.polyline
      .split(";")
      .filter((i) => i)
      .map((e) => e.split(",").map(Number))
      .filter((e) => e?.length === 2 && e[0] > 0 && e[1] > 0);
  if (polyline) {
    polylines.push({ polyline, background: false });
  }
  const defaultCenter =
    data.lat && parseFloat(data.lat) > 0
      ? { lat: parseFloat(data.lat), lng: parseFloat(data.lng) }
      : meta.defaultCenter;
  const defaultZoom =
    data.lat && parseFloat(data.lat) > 0 ? 14 : meta.defaultZoom;

  const markers: ComponentProps<typeof Leaflet>["markers"] = [];
  if (data.lat != 0 && data.lng != 0) {
    markers.push({ lat: data.lat, lng: data.lng, isParking: true });
  }
  if (sectorMarkers) {
    markers.push(...sectorMarkers);
  }

  const orderForm = data.problemOrder?.length > 1 && (
    <>
      {data.problemOrder.map((p, i) => {
        const problemOrder = data.problemOrder;
        const clr =
          problemOrder[i].origNr && problemOrder[i].origNr != problemOrder[i].nr
            ? "orange"
            : "grey";
        return (
          <Input
            key={p.id}
            size="small"
            fluid
            icon="hashtag"
            iconPosition="left"
            placeholder="Number"
            value={p.nr}
            label={{ basic: true, content: p.name, color: clr }}
            labelPosition="right"
            onChange={(e, { value }) => {
              if (problemOrder[i].origNr === undefined) {
                problemOrder[i].origNr = problemOrder[i].nr;
              }
              problemOrder[i].nr = parseInt(value) || "";
              setData((prevState) => ({ ...prevState, problemOrder }));
            }}
          />
        );
      })}
    </>
  );

  return (
    <>
      <Helmet>
        <title>Edit {data.name}</title>
      </Helmet>
      <Message
        size="tiny"
        content={
          <>
            <Icon name="info" />
            Contact{" "}
            <a href="mailto:jostein.oygarden@gmail.com">Jostein Øygarden</a> if
            you want to move or split sector.
          </>
        }
      />
      <Form>
        <Segment>
          <Form.Group widths="equal">
            <Form.Field
              label="Sector name"
              control={Input}
              placeholder="Enter name"
              value={data.name}
              onChange={onNameChanged}
              error={data.name ? false : "Sector name required"}
            />
            <VisibilitySelectorField
              label="Visibility"
              selection
              value={data}
              onChange={onLockedChanged}
            />
            <Form.Field>
              <label>Move to trash</label>
              <Checkbox
                disabled={!data.id || data.id <= 0}
                toggle
                checked={data.trash}
                onChange={() =>
                  setData((prevState) => ({
                    ...prevState,
                    trash: !data.trash,
                  }))
                }
              />
            </Form.Field>
          </Form.Group>
          <Form.Field
            label="Description"
            control={TextArea}
            placeholder="Enter description"
            style={{ minHeight: 100 }}
            value={data.comment}
            onChange={onCommentChanged}
          />
          <Form.Field>
            <Input
              label="Sector closed:"
              placeholder="Enter closed-reason..."
              value={data.accessClosed}
              onChange={onAccessClosedChanged}
              icon="attention"
            />
          </Form.Field>
          <Form.Field>
            <Input
              label="Sector restrictions:"
              placeholder="Enter specific restrictions..."
              value={data.accessInfo}
              onChange={onAccessInfoChanged}
            />
          </Form.Field>
        </Segment>

        <Segment>
          <Form.Field>
            <label>Upload image(s)</label>
            <ImageUpload
              onMediaChanged={onNewMediaChanged}
              isMultiPitch={false}
              includeVideoEmbedder={false}
            />
          </Form.Field>
        </Segment>

        <Segment>
          <Form.Group widths="equal">
            <Form.Field>
              <Button.Group size="tiny" compact>
                <Button
                  positive={leafletMode == "PARKING"}
                  onClick={() => setLeafletMode("PARKING")}
                >
                  Parking
                </Button>
                <Button
                  positive={leafletMode == "POLYGON"}
                  onClick={() => setLeafletMode("POLYGON")}
                >
                  Outline
                </Button>
                <Button
                  positive={leafletMode == "POLYLINE"}
                  onClick={() => setLeafletMode("POLYLINE")}
                >
                  Approach
                </Button>
                <Button color="orange" onClick={clearDrawing}>
                  Reset selected
                </Button>
              </Button.Group>
            </Form.Field>
            <Form.Field>
              <Button
                size="tiny"
                compact
                positive={sectorMarkers != null}
                onClick={() => {
                  if (sectorMarkers == null) {
                    if (sectorId) {
                      getSector(accessToken, sectorId).then((data) =>
                        setSectorMarkers(
                          data.problems
                            .filter((p) => p.lat > 0 && p.lng > 0)
                            .map((p) => ({
                              lat: p.lat,
                              lng: p.lng,
                              label: p.name,
                            })),
                        ),
                      );
                    }
                  } else {
                    setSectorMarkers(null);
                  }
                }}
              >
                Include all markers in sector
              </Button>
            </Form.Field>
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Field>
              <Leaflet
                autoZoom={true}
                markers={markers}
                outlines={outlines}
                polylines={polylines}
                defaultCenter={defaultCenter}
                defaultZoom={defaultZoom}
                onMouseClick={onMapMouseClick}
                onMouseMove={null}
                height={"300px"}
                showSatelliteImage={meta.isBouldering}
                clusterMarkers={false}
                rocks={null}
                flyToId={null}
              />
            </Form.Field>
          </Form.Group>
          <Form.Group widths="equal">
            {leafletMode === "PARKING" && (
              <>
                <Form.Field>
                  <label>Latitude</label>
                  <Input
                    placeholder="Latitude"
                    value={data.latStr || ""}
                    onChange={onLatChanged}
                  />
                </Form.Field>
                <Form.Field>
                  <label>Longitude</label>
                  <Input
                    placeholder="Longitude"
                    value={data.lngStr || ""}
                    onChange={onLngChanged}
                  />
                </Form.Field>
              </>
            )}
            {leafletMode === "POLYGON" && (
              <Form.Field
                label="Outline"
                control={Input}
                placeholder="Outline"
                value={data.polygonCoords || ""}
                onChange={(e, { value }) =>
                  setData((prevState) => ({
                    ...prevState,
                    polygonCoords: value,
                  }))
                }
                error={polygonError && "Invalid outline"}
              />
            )}
            {leafletMode === "POLYLINE" && (
              <Form.Field>
                <label>Approach</label>
                <Input
                  placeholder="Approach"
                  value={data.polyline || ""}
                  onChange={(e, { value }) =>
                    setData((prevState) => ({
                      ...prevState,
                      polyline: value,
                    }))
                  }
                />
                <Dropzone
                  multiple={false}
                  accept={{ "application/gpx+xml": [".gpx"] }}
                  onDrop={(files: any) => {
                    if (files?.length !== 0) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const gpx = new GpxParser();
                        gpx.parse(e.target?.result as string);
                        console.log(gpx);
                        const polyline = gpx.tracks[0]?.points
                          ?.map((e) => e.lat + "," + e.lon)
                          .join(";");
                        setData((prevState) => ({ ...prevState, polyline }));
                      };
                      reader.readAsText(files[0]);
                    }
                  }}
                >
                  {({ getRootProps }) => (
                    <div {...getRootProps()}>
                      <Button size="mini" basic fluid>
                        Upload GPX-file
                      </Button>
                    </div>
                  )}
                </Dropzone>
              </Form.Field>
            )}
          </Form.Group>
        </Segment>

        {orderForm && (
          <Segment>
            <Accordion>
              <Accordion.Title
                active={showProblemOrder}
                onClick={() => setShowProblemOrder(!showProblemOrder)}
              >
                <Icon name="dropdown" />
                Change order of problems in sector
              </Accordion.Title>
              <Accordion.Content
                active={showProblemOrder}
                content={orderForm}
              />
            </Accordion>
          </Segment>
        )}

        <Button.Group>
          <Button
            negative
            onClick={() => {
              if (sectorId) {
                navigate(`/sector/${sectorId}`);
              } else {
                navigate(`/area/${areaId}`);
              }
            }}
          >
            Cancel
          </Button>
          <Button.Or />
          <Button
            positive
            loading={saving}
            onClick={save}
            disabled={!data.name || polygonError}
          >
            Save sector
          </Button>
        </Button.Group>
      </Form>
    </>
  );
};

export default SectorEdit;
