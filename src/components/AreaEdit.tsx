import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import ImageUpload from "./common/image-upload/image-upload";
import Leaflet from "./common/leaflet/leaflet";
import {
  Form,
  Button,
  Checkbox,
  Input,
  TextArea,
  Segment,
  Icon,
  Message,
  Accordion,
} from "semantic-ui-react";
import { useMeta } from "./common/meta";
import { getAreaEdit, postArea, useAccessToken } from "../api";
import { Loading } from "./common/widgets/widgets";
import { useNavigate, useParams } from "react-router-dom";
import { VisibilitySelectorField } from "./common/VisibilitySelector";

const AreaEdit = () => {
  const accessToken = useAccessToken();
  const meta = useMeta();
  const [data, setData] = useState<any>(null);
  const [showSectorOrder, setShowSectorOrder] = useState(false);
  const [saving, setSaving] = useState(false);
  const { areaId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      getAreaEdit(accessToken, parseInt(areaId)).then((data) => {
        setData(data);
      });
    }
  }, [accessToken, areaId]);

  function onNameChanged(e, { value }) {
    setData((prevState) => ({ ...prevState, name: value }));
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

  function onNewMediaChanged(newMedia) {
    setData((prevState) => ({ ...prevState, newMedia }));
  }

  function save(event) {
    event.preventDefault();
    const trash = data.trash ? true : false;
    if (!trash || confirm("Are you sure you want to move area to trash?")) {
      setSaving(true);
      postArea(
        accessToken,
        data.id,
        data.trash,
        data.lockedAdmin,
        data.lockedSuperadmin,
        data.forDevelopers,
        data.accessInfo,
        data.accessClosed,
        data.noDogsAllowed,
        data.name,
        data.comment,
        data.lat,
        data.lng,
        data.newMedia,
        data.sectorOrder,
      )
        .then(async (res) => {
          return navigate(res.destination);
        })
        .catch((error) => {
          console.warn(error);
        });
    }
  }

  function onMapClick(event) {
    setData((prevState) => ({
      ...prevState,
      lat: event.latlng.lat,
      lng: event.latlng.lng,
      latStr: event.latlng.lat,
      lngStr: event.latlng.lng,
    }));
  }

  if (!data) {
    return <Loading />;
  }

  const defaultCenter =
    data.lat && data.lng && parseFloat(data.lat) > 0
      ? { lat: parseFloat(data.lat), lng: parseFloat(data.lng) }
      : meta.defaultCenter;
  const defaultZoom: number =
    data.lat && parseFloat(data.lat) > 0 ? 8 : meta.defaultZoom;

  const orderForm = data.sectorOrder?.length > 1 && (
    <>
      {data.sectorOrder.map((s, i) => {
        const sectorOrder = data.sectorOrder;
        const clr =
          sectorOrder[i].origSorting &&
          sectorOrder[i].origSorting != sectorOrder[i].sorting
            ? "orange"
            : "gray";
        return (
          <Input
            key={s.id}
            size="small"
            fluid
            icon="hashtag"
            iconPosition="left"
            placeholder="Number"
            value={s.sorting}
            label={{ basic: true, content: s.name, color: clr }}
            labelPosition="right"
            onChange={(e, { value }) => {
              if (sectorOrder[i].origSorting === undefined) {
                sectorOrder[i].origSorting = sectorOrder[i].sorting;
              }
              sectorOrder[i].sorting = parseInt(value) || "";
              setData((prevState) => ({ ...prevState, sectorOrder }));
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
            you want to split area.
          </>
        }
      />
      <Form>
        <Segment>
          <Form.Group widths="equal">
            <Form.Field
              label="Area name"
              control={Input}
              placeholder="Enter name"
              value={data.name}
              onChange={onNameChanged}
              error={data.name ? false : "Area name required"}
            />
            <VisibilitySelectorField
              label="Visibility"
              selection
              value={data}
              onChange={onLockedChanged}
            />
            <Form.Field>
              <label>For developers</label>
              <Checkbox
                toggle
                checked={data.forDevelopers}
                onChange={() =>
                  setData((prevState) => ({
                    ...prevState,
                    forDevelopers: !data.forDevelopers,
                  }))
                }
              />
            </Form.Field>
            <Form.Field>
              <label>No dogs allowed</label>
              <Checkbox
                toggle
                checked={data.noDogsAllowed}
                onChange={() =>
                  setData((prevState) => ({
                    ...prevState,
                    noDogsAllowed: !data.noDogsAllowed,
                  }))
                }
              />
            </Form.Field>
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
          <Form.Field>
            <label>
              Description (supports remarkable formatting, more info{" "}
              <a
                href="https://jonschlinkert.github.io/remarkable/demo/"
                rel="noreferrer noopener"
                target="_blank"
              >
                here
              </a>
              )
            </label>
            <TextArea
              placeholder="Enter description"
              style={{ minHeight: 100 }}
              value={data.comment}
              onChange={onCommentChanged}
            />
          </Form.Field>
          <Form.Field>
            <Input
              label="Area closed:"
              placeholder="Enter closed-reason..."
              value={data.accessClosed}
              onChange={onAccessClosedChanged}
              icon="attention"
            />
          </Form.Field>
          <Form.Field>
            <Input
              label="Area restrictions:"
              placeholder="Enter specific restrictions..."
              value={data.accessInfo}
              onChange={onAccessInfoChanged}
            />
          </Form.Field>
        </Segment>

        <Segment>
          <Form.Field
            label="Upload image(s)"
            control={ImageUpload}
            onMediaChanged={onNewMediaChanged}
            isMultiPitch={false}
            includeVideoEmbedder={false}
          />
        </Segment>

        <Segment>
          <Form.Field>
            <label>Click to mark area center on map</label>
            <Leaflet
              autoZoom={true}
              markers={
                data.lat != 0 &&
                data.lng != 0 && [{ lat: data.lat, lng: data.lng }]
              }
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              onMouseClick={onMapClick}
              onMouseMove={null}
              polylines={null}
              outlines={null}
              height={"300px"}
              showSateliteImage={false}
              clusterMarkers={false}
              rocks={null}
              flyToId={null}
            />
          </Form.Field>
          <Form.Group widths="equal">
            <Form.Field>
              <label>Latitude</label>
              <Input
                placeholder="Latitude"
                value={data.latStr}
                onChange={onLatChanged}
              />
            </Form.Field>
            <Form.Field>
              <label>Longitude</label>
              <Input
                placeholder="Longitude"
                value={data.lngStr}
                onChange={onLngChanged}
              />
            </Form.Field>
          </Form.Group>
        </Segment>

        {orderForm && (
          <Segment>
            <Accordion>
              <Accordion.Title
                active={showSectorOrder}
                onClick={() => setShowSectorOrder(!showSectorOrder)}
              >
                <Icon name="dropdown" />
                Change order of sectors in area
              </Accordion.Title>
              <Accordion.Content active={showSectorOrder} content={orderForm} />
            </Accordion>
          </Segment>
        )}

        <Button.Group>
          <Button
            negative
            onClick={() => {
              if (areaId && areaId != "-1") {
                navigate(`/area/${areaId}`);
              } else {
                navigate(`/areas`);
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
            Save area
          </Button>
        </Button.Group>
      </Form>
    </>
  );
};

export default AreaEdit;
