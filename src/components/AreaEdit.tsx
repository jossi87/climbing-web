import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import ImageUpload from "./common/image-upload/image-upload";
import Leaflet from "./common/leaflet/leaflet";
import {
  Form,
  Button,
  Checkbox,
  Input,
  Dropdown,
  TextArea,
  Segment,
  Icon,
  Message,
  Accordion,
} from "semantic-ui-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useMeta } from "./common/meta";
import { getAreaEdit, postArea } from "../api";
import { Loading, InsufficientPrivileges } from "./common/widgets/widgets";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const AreaEdit = () => {
  const {
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const meta = useMeta();
  const [data, setData] = useState<any>(null);
  const [showSectorOrder, setShowSectorOrder] = useState(false);
  const [saving, setSaving] = useState(false);
  const { areaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!isLoading && areaId && isAuthenticated) {
      getAccessTokenSilently().then((accessToken) => {
        getAreaEdit(accessToken, parseInt(areaId)).then((data) => {
          setData({ ...data, accessToken });
        });
      });
    }
  }, [isAuthenticated, isLoading, areaId]);

  function onNameChanged(e, { value }) {
    setData((prevState) => ({ ...prevState, name: value }));
  }

  function onLockedChanged(e, { value }) {
    setData((prevState) => ({
      ...prevState,
      lockedAdmin: value == 1,
      lockedSuperadmin: value == 2,
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
        data.accessToken,
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
        data.sectorOrder
      )
        .then((res) => {
          navigate(res.destination);
        })
        .catch((error) => {
          console.warn(error);
        });
    }
  }

  function onMarkerClick(event) {
    setData((prevState) => ({
      ...prevState,
      lat: event.latlng.lat,
      lng: event.latlng.lng,
    }));
  }

  if (isLoading || (isAuthenticated && !data)) {
    return <Loading />;
  } else if (!isAuthenticated) {
    loginWithRedirect({ appState: { returnTo: location.pathname } });
  } else if (!meta.isAdmin) {
    return <InsufficientPrivileges />;
  } else {
    const defaultCenter =
      data.lat && data.lng && parseFloat(data.lat) > 0
        ? { lat: parseFloat(data.lat), lng: parseFloat(data.lng) }
        : meta.defaultCenter;
    const defaultZoom: number =
      data.lat && parseFloat(data.lat) > 0 ? 8 : meta.defaultZoom;
    const lockedOptions = [
      { key: 0, value: 0, text: "Visible for everyone" },
      { key: 1, value: 1, text: "Only visible for administrators" },
    ];
    if (meta.isSuperAdmin) {
      lockedOptions.push({
        key: 2,
        value: 2,
        text: "Only visible for super administrators",
      });
    }
    let lockedValue = 0;
    if (data.lockedSuperadmin) {
      lockedValue = 2;
    } else if (data.lockedAdmin) {
      lockedValue = 1;
    }

    const orderForm = data.sectorOrder?.length > 1 && (
      <>
        {data.sectorOrder.map((p, i) => {
          const sectorOrder = data.sectorOrder;
          const clr =
            sectorOrder[i].origSorting &&
            sectorOrder[i].origSorting != sectorOrder[i].sorting
              ? "orange"
              : "gray";
          return (
            <Input
              key={p.sorting}
              size="small"
              fluid
              icon="hashtag"
              iconPosition="left"
              placeholder="Number"
              value={p.sorting}
              label={{ basic: true, content: p.name, color: clr }}
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
          <title>Edit {data.name} | {meta.title}</title>
        </Helmet>
        <Message
          size="tiny"
          content={
            <>
              <Icon name="info" />
              Contact{" "}
              <a href="mailto:jostein.oygarden@gmail.com">
                Jostein Øygarden
              </a>{" "}
              if you want to split area.
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
              <Form.Field
                label="Visibility"
                control={Dropdown}
                selection
                value={lockedValue}
                onChange={onLockedChanged}
                options={lockedOptions}
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
                onMouseClick={onMarkerClick}
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
                <Accordion.Content
                  active={showSectorOrder}
                  content={orderForm}
                />
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
  }
};

export default AreaEdit;
