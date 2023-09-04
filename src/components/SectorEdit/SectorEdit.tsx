import React, { useState, useEffect, ComponentProps, useCallback } from "react";
import { Helmet } from "react-helmet";
import ImageUpload from "../common/image-upload/image-upload";
import { Loading } from "../common/widgets/widgets";
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
import { useMeta } from "../common/meta";
import {
  getElevation,
  getSectorEdit,
  postSector,
  getSector,
  getArea,
  useAccessToken,
} from "../../api";
import Leaflet from "../common/leaflet/leaflet";
import { useNavigate, useParams } from "react-router-dom";
import { VisibilitySelectorField } from "../common/VisibilitySelector";
import { parsePolyline } from "../../utils/polyline";
import { components } from "../../@types/buldreinfo/swagger";
import { ProblemOrder } from "./ProblemOrder";
import { PolylineEditor } from "./PolylineEditor";
import { ZoomLogic } from "./ZoomLogic";
import { PolylineMarkers } from "./PolylineMarkers";

const useIds = (): { areaId: number; sectorId: number } => {
  const { sectorId, areaId } = useParams();
  return { sectorId: +sectorId, areaId: +areaId };
};

export const SectorEdit = () => {
  const accessToken = useAccessToken();
  const { areaId, sectorId } = useIds();
  const [leafletMode, setLeafletMode] = useState("PARKING");
  const [data, setData] = useState<components["schemas"]["Sector"]>(null);
  const [currPolygonPointFetched, setCurrPolygonPointFetched] = useState(0);
  const [currPolygonPoint, setCurrPolygonPoint] = useState(null);
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
        .then((data) => {
          setData(data);
        })
        .then(() => {
          getArea(accessToken, areaId).then((data) => setArea(data[0]));
        })
        .catch((e) => {
          setError(String(e));
        });
    }
  }, [accessToken, areaId, sectorId]);

  function onNameChanged(_, { value }) {
    setData((prevState) => ({ ...prevState, name: value }));
  }

  function onLockedChanged({ lockedAdmin, lockedSuperadmin }) {
    setData((prevState) => ({
      ...prevState,
      lockedAdmin,
      lockedSuperadmin,
    }));
  }

  function onCommentChanged(_, { value }) {
    setData((prevState) => ({ ...prevState, comment: value }));
  }

  function onAccessInfoChanged(_, { value }) {
    setData((prevState) => ({ ...prevState, accessInfo: value }));
  }

  function onAccessClosedChanged(_, { value }) {
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
        data.parking,
        data.outline,
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
        parking: {
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        },
      }));
    } else if (leafletMode == "POLYGON") {
      let { outline } = data;
      if (outline?.length > 0) {
        outline.push({
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        });
      } else {
        outline = [{ latitude: event.latlng.lat, longitude: event.latlng.lng }];
      }
      setData((prevState) => ({ ...prevState, outline }));
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

  function onMouseMove(event) {
    if (leafletMode == "POLYGON") {
      const ms = Math.floor(Date.now());
      if (ms > currPolygonPointFetched + 200) {
        setCurrPolygonPointFetched(ms);
        getElevation(accessToken, event.latlng.lat, event.latlng.lng).then(
          (res) => {
            setCurrPolygonPoint(
              " - " +
                event.latlng.lat.toFixed(10) +
                "," +
                event.latlng.lng.toFixed(10) +
                " (" +
                res +
                "m)",
            );
          },
        );
      }
    }
  }

  function clearDrawing() {
    if (leafletMode == "PARKING") {
      setData((prevState) => ({ ...prevState, parking: null }));
    } else if (leafletMode == "POLYGON") {
      setData((prevState) => ({ ...prevState, outline: null }));
    } else if (leafletMode == "POLYLINE") {
      setData((prevState) => ({ ...prevState, polyline: null }));
    }
  }

  function onLatChanged(_, { value }) {
    let lat = parseFloat(value.replace(",", "."));
    if (isNaN(lat)) {
      lat = 0;
    }
    let parking = data.parking || {latitude: 0, longitude: 0};
    parking.latitude = lat;
    setData((prevState) => ({ ...prevState, parking }));
  }

  function onLngChanged(_, { value }) {
    let lng = parseFloat(value.replace(",", "."));
    if (isNaN(lng)) {
      lng = 0;
    }
    let parking = data.parking || {latitude: 0, longitude: 0};
    parking.longitude = lng;
    setData((prevState) => ({ ...prevState, parking }));
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

  if (!data || !area) {
    return <Loading />;
  }

  const outlines: ComponentProps<typeof Leaflet>["outlines"] = [];
  const polylines: ComponentProps<typeof Leaflet>["polylines"] = [];
  if (area) {
    area.sectors.forEach((sector) => {
      if (sector.id != data.id) {
        if (sector.outline?.length > 0) {
          outlines.push({
            outline: sector.outline,
            background: true,
            label: sector.name,
          });
        }
        if (sector.polyline) {
          const sectorPolyline = parsePolyline(sector.polyline);
          if (sectorPolyline?.length > 0) {
            polylines.push({ polyline: sectorPolyline, background: true });
          }
        }
      }
    });
  }

  if (data.outline?.length > 0) {
    outlines.push({ outline: data.outline, background: false });
  }
  const polyline = parsePolyline(data.polyline);
  if (polyline?.length > 0) {
    polylines.push({ polyline, background: false });
  }

  let defaultCenter;
  let defaultZoom;
  if (data.parking) {
    defaultCenter = { lat: data.parking.latitude, lng: data.parking.longitude };
    defaultZoom = 14;
  } else if (area.coordinate) {
    defaultCenter = { lat: area.coordinate.latitude, lng: area.coordinate.longitude };
    defaultZoom = 14;
  } else {
    defaultCenter = meta.defaultCenter;
    defaultZoom = meta.defaultZoom;
  }

  const markers: ComponentProps<typeof Leaflet>["markers"] = [];
  if (data.parking) {
    markers.push({
      lat: data.parking.latitude,
      lng: data.parking.longitude,
      isParking: true,
    });
  }
  if (sectorMarkers) {
    markers.push(...sectorMarkers);
  }

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
              value={{
                lockedAdmin: !!data.lockedAdmin,
                lockedSuperadmin: !!data.lockedSuperadmin,
              }}
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
                            .filter((p) => p.coordinate)
                            .map((p) => ({
                              lat: p.coordinate.latitude,
                              lng: p.coordinate.longitude,
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
                markers={markers}
                outlines={outlines}
                polylines={polylines}
                defaultCenter={defaultCenter}
                defaultZoom={defaultZoom}
                onMouseClick={onMapMouseClick}
                onMouseMove={onMouseMove}
                height={"300px"}
                showSatelliteImage={meta.isBouldering}
                clusterMarkers={false}
                rocks={null}
                flyToId={null}
              >
                <ZoomLogic area={area} sector={data} />
                {leafletMode === "POLYGON" && (
                  <PolylineMarkers
                    polyline={(data.outline || [])
                      .map((c) => c.latitude + "," + c.longitude)
                      .join(";")}
                  />
                )}
                {leafletMode === "POLYLINE" && (
                  <PolylineMarkers polyline={data.polyline} />
                )}
              </Leaflet>
            </Form.Field>
          </Form.Group>
          <Form.Group widths="equal">
            {leafletMode === "PARKING" && (
              <>
                <Form.Field>
                  <label>Latitude</label>
                  <Input
                    placeholder="Latitude"
                    value={data.parking?.latitude ?? ""}
                    onChange={onLatChanged}
                  />
                </Form.Field>
                <Form.Field>
                  <label>Longitude</label>
                  <Input
                    placeholder="Longitude"
                    value={data.parking?.longitude ?? ""}
                    onChange={onLngChanged}
                  />
                </Form.Field>
              </>
            )}
            {leafletMode === "POLYGON" && (
              <Form.Field>
                <label>Outline {currPolygonPoint}</label>
                <PolylineEditor
                  polyline={(data.outline || [])
                    .map((c) => c.latitude + "," + c.longitude)
                    .join(";")}
                  onChange={(polygonCoords) => {
                    const outline = parsePolyline(polygonCoords).map((x) => ({
                      latitude: x[0],
                      longitude: x[1],
                    }));
                    setData((prevState) => ({ ...prevState, outline }));
                  }}
                />
              </Form.Field>
            )}
            {leafletMode === "POLYLINE" && (
              <Form.Field>
                <label>Approach</label>
                <PolylineEditor
                  polyline={data.polyline}
                  onChange={(polyline) =>
                    setData((prevState) => ({ ...prevState, polyline }))
                  }
                  upload
                />
              </Form.Field>
            )}
          </Form.Group>
        </Segment>

        {data.problemOrder?.length > 1 && (
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
                content={
                  <ProblemOrder
                    problemOrder={data.problemOrder}
                    onChange={(problemOrder) =>
                      setData((prevValue) => ({ ...prevValue, problemOrder }))
                    }
                  />
                }
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
            disabled={!data.name}
          >
            Save sector
          </Button>
        </Button.Group>
      </Form>
    </>
  );
};

export default SectorEdit;
