import { useState, useCallback, ComponentProps, FormEvent } from 'react';
import ImageUpload from '../common/image-upload/image-upload';
import Leaflet from '../common/leaflet/leaflet';
import {
  Form,
  Button,
  Checkbox,
  Dropdown,
  Input,
  TextArea,
  Segment,
  Icon,
  Message,
  Accordion,
} from 'semantic-ui-react';
import { useMeta } from '../common/meta/context';
import { Loading } from '../common/widgets/widgets';
import { useNavigate, useParams } from 'react-router-dom';
import { VisibilitySelectorField } from '../common/VisibilitySelector';
import { captureException } from '@sentry/react';
import { useAreaEdit } from './useAreaEdit';
import { hours } from '../../utils/hours';
import ExternalLink from '../common/external-links/external-links';

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
    setNumber,
    setExternalLinks,
  } = useAreaEdit({ areaId: +(areaId ?? 0) });
  const [showSectorOrder, setShowSectorOrder] = useState(false);

  const save: ComponentProps<typeof Form>['onSubmit'] = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!data.name) {
        return;
      }

      if (!data.trash || confirm('Are you sure you want to move area to trash?')) {
        performSave(data)
          .then(async (res) => {
            navigate(res.destination ?? '/areas');
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

  const safeSectors = data.sectors ?? [];
  const safeSectorOrder = data.sectorOrder ?? [];

  const defaultCenter = data.coordinates
    ? { lat: +(data.coordinates.latitude ?? 0), lng: +(data.coordinates.longitude ?? 0) }
    : meta.defaultCenter;
  const defaultZoom: number = data.coordinates ? 8 : meta.defaultZoom;

  return (
    <>
      <title>{`Edit ${data.name} | ${meta?.title}`}</title>
      <Message
        size='tiny'
        content={
          <>
            <Icon name='info' />
            Contact <a href='mailto:jostein.oygarden@gmail.com'>Jostein Øygarden</a> if you want to
            split area.
          </>
        }
      />
      <Form action={`/area/${areaId}`} onSubmit={save}>
        <Segment>
          <Form.Group widths='equal'>
            <Form.Field
              label='Area name'
              control={Input}
              placeholder='Enter name'
              value={data.name ?? ''}
              onChange={setString('name')}
              error={data.name ? false : 'Area name required'}
            />
            <VisibilitySelectorField
              label='Visibility'
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
                onChange={setBoolean('forDevelopers')}
              />
            </Form.Field>
            <Form.Field>
              <label>No dogs allowed</label>
              <Checkbox
                toggle
                checked={data.noDogsAllowed}
                onChange={setBoolean('noDogsAllowed')}
              />
            </Form.Field>
            <Form.Field>
              <label>Move to trash</label>
              <Checkbox
                disabled={!data.id || data.id <= 0}
                toggle
                checked={data.trash}
                onChange={setBoolean('trash')}
              />
            </Form.Field>
          </Form.Group>
          {meta.isClimbing && (
            <Form.Group widths='equal'>
              <Form.Field
                label='Sun from hour'
                control={Dropdown}
                selection
                value={data.sunFromHour}
                onChange={setNumber('sunFromHour')}
                options={hours}
                error={
                  (!data.sunFromHour && !data.sunToHour) || (data.sunFromHour && data.sunToHour)
                    ? false
                    : 'Sun from and to hour must both be empty or set'
                }
              />
              <Form.Field
                label='Sun to hour'
                control={Dropdown}
                selection
                value={data.sunToHour}
                onChange={setNumber('sunToHour')}
                options={hours}
                error={
                  (!data.sunFromHour && !data.sunToHour) || (data.sunFromHour && data.sunToHour)
                    ? false
                    : 'Sun from and to hour must both be empty or set'
                }
              />
            </Form.Group>
          )}
          <Form.Field>
            <label>
              Description (supports&nbsp;
              <a
                href='https://jonschlinkert.github.io/remarkable/demo/'
                target='_blank'
                rel='noopener noreferrer'
              >
                markdown
              </a>
              &nbsp;formatting)
            </label>
            <TextArea
              placeholder='Enter description'
              style={{ minHeight: 100 }}
              value={data.comment ?? ''}
              onChange={setString('comment')}
            />
          </Form.Field>
          <Form.Field>
            <Input
              label='Area closed:'
              placeholder='Enter closed-reason...'
              value={data.accessClosed ?? ''}
              onChange={setString('accessClosed')}
              icon='attention'
            />
          </Form.Field>
          <Form.Field>
            <Input
              label='Area restrictions:'
              placeholder='Enter specific restrictions...'
              value={data.accessInfo ?? ''}
              onChange={setString('accessInfo')}
            />
          </Form.Field>
        </Segment>

        <ExternalLink
          externalLinks={data.externalLinks?.filter((l) => !l.inherited) || []}
          onExternalLinksUpdated={setExternalLinks}
        />

        <Segment>
          <Form.Field>
            <label>Upload image(s)</label>
            <ImageUpload onMediaChanged={setNewMedia} isMultiPitch={false} />
          </Form.Field>
        </Segment>

        <Segment>
          <Form.Field>
            <label>Click to mark area center on map</label>
            <Leaflet
              autoZoom={true}
              markers={
                data.coordinates
                  ? [
                      {
                        coordinates: {
                          latitude: data.coordinates.latitude ?? 0,
                          longitude: data.coordinates.longitude ?? 0,
                        },
                      },
                    ]
                  : []
              }
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              onMouseClick={setLatLng}
              onMouseMove={null}
              outlines={safeSectors
                .filter((s) => (s.outline ?? []).length > 0)
                .map((s) => ({ background: true, outline: s.outline ?? [] }))}
              slopes={null}
              height={'300px'}
              showSatelliteImage={false}
              clusterMarkers={false}
              rocks={undefined}
              flyToId={null}
            />
          </Form.Field>
          <Form.Group widths='equal'>
            <Form.Field>
              <label>Latitude</label>
              <Input
                placeholder='Latitude'
                value={data.coordinates?.latitude || ''}
                onChange={setCoord('latitude')}
              />
            </Form.Field>
            <Form.Field>
              <label>Longitude</label>
              <Input
                placeholder='Longitude'
                value={data.coordinates?.longitude || ''}
                onChange={setCoord('longitude')}
              />
            </Form.Field>
          </Form.Group>
        </Segment>

        {(safeSectorOrder.length ?? 0) > 1 && (
          <Segment>
            <Accordion>
              <Accordion.Title
                active={showSectorOrder}
                onClick={() => setShowSectorOrder(!showSectorOrder)}
              >
                <Icon name='dropdown' />
                Change order of sectors in area
              </Accordion.Title>
              <Accordion.Content active={showSectorOrder}>
                <em>(Presented from low to high)</em>
                {safeSectorOrder.map((s) => {
                  return (
                    <Input
                      key={s.id}
                      size='small'
                      fluid
                      icon='hashtag'
                      iconPosition='left'
                      placeholder='Number'
                      value={s.sorting}
                      label={{ basic: true, content: s.name }}
                      labelPosition='right'
                      onChange={s.id != null ? setSectorSort(s.id) : undefined}
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
            type='button'
          >
            Cancel
          </Button>
          <Button.Or />
          <Button
            positive
            loading={isSaving}
            disabled={Boolean(
              !data.name ||
              (data.sunFromHour && !data.sunToHour) ||
              (!data.sunFromHour && data.sunToHour),
            )}
            type='submit'
          >
            Save area
          </Button>
        </Button.Group>
      </Form>
    </>
  );
};

export default AreaEdit;
