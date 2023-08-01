import React, { useState, useCallback, ComponentProps } from "react";
import { Helmet } from "react-helmet";
import ImageUpload from "../common/image-upload/image-upload";
import Leaflet from "../common/leaflet/leaflet";
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
import { useMeta } from "../common/meta";
import { Loading } from "../common/widgets/widgets";
import { useNavigate, useParams } from "react-router-dom";
import { VisibilitySelectorField } from "../common/VisibilitySelector";
import { captureException } from "@sentry/react";
import { useAreaEdit } from "./useAreaEdit";
import { parsePolyline } from "../../utils/polyline";

export const AreaEdit = () => {
  const meta = useMeta();
  const navigate = useNavigate();
  const { areaId } = useParams();
  const {
    isSaving,
    area: data,
    save: performSave,
    setBoolean,
    setCoord,
    setLatLng,
    setNewMedia,
    setSectorSort,
    setString,
    setVisibility,
  } = useAreaEdit({ areaId: +(areaId ?? 0) });
  const [showSectorOrder, setShowSectorOrder] = useState(false);

  const save = useCallback<ComponentProps<typeof Form>["onSubmit"]>(
    (event) => {
      event.preventDefault();
      if (
        !data.trash ||
        confirm("Are you sure you want to move area to trash?")
      ) {
        performSave(data)
          .then(async (res) => {
            navigate(res.destination ?? "/areas");
          })
          .catch((error) => {
            captureException(error);
          });
      }
    },
    [data, navigate, performSave],
  );

  if (!data) {
    return <Loading />;
  }

  const defaultCenter =
    data.lat && data.lng && +data.lat > 0
      ? { lat: +data.lat, lng: +data.lng }
      : meta.defaultCenter;
  const defaultZoom: number = data.lat && +data.lat > 0 ? 8 : meta.defaultZoom;

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
      <Form action={`/area/${areaId}`} onSubmit={save}>
        <Segment>
          <Form.Group widths="equal">
            <Form.Field
              label="Area name"
              control={Input}
              placeholder="Enter name"
              value={data.name ?? ""}
              onChange={setString("name")}
              error={data.name ? false : "Area name required"}
            />
            <VisibilitySelectorField
              label="Visibility"
              selection
              value={{
                lockedAdmin: !!data.lockedAdmin,
                lockedSuperadmin: !!data.lockedSuperadmin,
              }}
              onChange={setVisibility}
            />
            <Form.Field>
              <label>For developers</label>
              <Checkbox
                toggle
                checked={data.forDevelopers}
                onChange={setBoolean("forDevelopers")}
              />
            </Form.Field>
            <Form.Field>
              <label>No dogs allowed</label>
              <Checkbox
                toggle
                checked={data.noDogsAllowed}
                onChange={setBoolean("noDogsAllowed")}
              />
            </Form.Field>
            <Form.Field>
              <label>Move to trash</label>
              <Checkbox
                disabled={!data.id || data.id <= 0}
                toggle
                checked={data.trash}
                onChange={setBoolean("trash")}
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
              value={data.comment ?? ""}
              onChange={setString("comment")}
            />
          </Form.Field>
          <Form.Field>
            <Input
              label="Area closed:"
              placeholder="Enter closed-reason..."
              value={data.accessClosed ?? ""}
              onChange={setString("accessClosed")}
              icon="attention"
            />
          </Form.Field>
          <Form.Field>
            <Input
              label="Area restrictions:"
              placeholder="Enter specific restrictions..."
              value={data.accessInfo ?? ""}
              onChange={setString("accessInfo")}
            />
          </Form.Field>
        </Segment>

        <Segment>
          <Form.Field>
            <label>Upload image(s)</label>
            <ImageUpload
              onMediaChanged={setNewMedia}
              isMultiPitch={false}
              includeVideoEmbedder={false}
            />
          </Form.Field>
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
              onMouseClick={setLatLng}
              onMouseMove={null}
              outlines={(data.sectors || [])
                .filter(({ polygonCoords }) => !!polygonCoords)
                .map(({ polygonCoords }) => ({
                  background: true,
                  polygon: parsePolyline(polygonCoords),
                }))}
              polylines={[]}
              height={"300px"}
              showSatelliteImage={false}
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
                value={data.lat || ""}
                onChange={setCoord("lat")}
              />
            </Form.Field>
            <Form.Field>
              <label>Longitude</label>
              <Input
                placeholder="Longitude"
                value={data.lng || ""}
                onChange={setCoord("lng")}
              />
            </Form.Field>
          </Form.Group>
        </Segment>

        {(data?.sectorOrder?.length ?? 0) > 1 && (
          <Segment>
            <Accordion>
              <Accordion.Title
                active={showSectorOrder}
                onClick={() => setShowSectorOrder(!showSectorOrder)}
              >
                <Icon name="dropdown" />
                Change order of sectors in area
              </Accordion.Title>
              <Accordion.Content active={showSectorOrder}>
                <em>(Presented from low to high)</em>
                {data.sectorOrder.map((s) => {
                  return (
                    <Input
                      key={s.id}
                      size="small"
                      fluid
                      icon="hashtag"
                      iconPosition="left"
                      placeholder="Number"
                      value={s.sorting}
                      label={{ basic: true, content: s.name }}
                      labelPosition="right"
                      onChange={setSectorSort(s.id)}
                    />
                  );
                })}
              </Accordion.Content>
            </Accordion>
          </Segment>
        )}

        <Button.Group>
          <Button
            negative
            onClick={() => {
              if (+(areaId ?? -1) > 0) {
                navigate(`/area/${areaId}`);
              } else {
                navigate(`/areas`);
              }
            }}
            type="button"
          >
            Cancel
          </Button>
          <Button.Or />
          <Button
            positive
            loading={isSaving}
            disabled={!data.name}
            type="submit"
          >
            Save area
          </Button>
        </Button.Group>
      </Form>
    </>
  );
};

export default AreaEdit;
