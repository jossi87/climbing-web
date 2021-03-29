import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Header, Segment, Form, Dropdown, Button, Checkbox, Icon, List, Image } from 'semantic-ui-react';
import { getMeta, getImageUrl, postFilter } from '../api';
import { useAuth0 } from '../utils/react-auth0-spa';
import { Stars, LockSymbol } from './common/widgets/widgets';
import { useLocalStorage } from '../utils/use-local-storage';

const Filter = () => {
  const { loading, accessToken } = useAuth0();
  let history = useHistory();
  const [meta, setMeta] = useState(null);
  const [grades, setGrades] = useLocalStorage("filter_grades", null);
  const [types, setTypes] = useLocalStorage("filter_types", null);
  const [result, setResult] = useLocalStorage("filter_result", null);
  const [refreshing, setRefreshing] = useState(false);
  const [hideTicked, setHideTicked] = useLocalStorage("filter_ticked", false);
  const [onlyWithMedia, setOnlyWithMedia] = useLocalStorage("filter_only_with_media", false);
  const [onlyAdmin, setOnlyAdmin] = useLocalStorage("filter_only_admin", false);
  const [onlySuperAdmin, setOnlySuperAdmin] = useLocalStorage("filter_only_sa", false);
  const [orderByStars, setOrderByStars] = useLocalStorage("filter_order_by_stars", false);
  useEffect(() => {
    if (!loading) {
      getMeta(accessToken).then((meta) => setMeta(meta));
    }
  }, [loading, accessToken]);
  
  if (!meta) {
    return <LoadingAndRestoreScroll />;
  }
  const gradeOptions = meta.metadata.grades.map(g => ({key: g.id, value: g.id, text: g.grade}));
  const typeOptions = meta.metadata.types.sort((a, b) => a.subType.localeCompare(b.subType)).map(t => ({key: t.id, value: t.id, text: t.subType}));
  var res = result && result.filter(p => ( (!hideTicked || !p.ticked) && (!onlyWithMedia || p.randomMediaId>0) && (!onlyAdmin || p.lockedAdmin) && (!onlySuperAdmin || p.lockedSuperadmin) ))
  return (
    <>
      <Segment>
        <Header>Filter</Header>
        <Form>
          <Form.Field>
            <Dropdown placeholder="Select grade(s)" fluid multiple selection options={gradeOptions} value={grades? grades : []} onChange={(e, { value }) => {
              setGrades(value);
              setResult(null);
            }} />
          </Form.Field>
          {typeOptions.length>1 &&
            <Form.Field>
              <Dropdown placeholder="Select type(s)" fluid multiple selection options={typeOptions} value={types? types : []} onChange={(e, { value }) => {
              setTypes(value);
              setResult(null);
            }} />
            </Form.Field>
          }
          <Form.Field>
            <Checkbox label="Hide ticked" checked={hideTicked} disabled={!meta.metadata.isAuthenticated} onChange={() => setHideTicked(!hideTicked)} />
          </Form.Field>
          <Form.Field>
            <Checkbox label="Only with images/videos" checked={onlyWithMedia} onChange={() => setOnlyWithMedia(!onlyWithMedia)} />
          </Form.Field>
          {meta.metadata.isAdmin &&
            <Form.Field>
              <Checkbox label="Only admin" checked={onlyAdmin} onChange={() => {
                setOnlyAdmin(!onlyAdmin);
                setOnlySuperAdmin(false);
              }} />
            </Form.Field>
          }
          {meta.metadata.isSuperAdmin &&
            <Form.Field>
              <Checkbox label="Only superadmin" checked={onlySuperAdmin} onChange={() => {
                setOnlyAdmin(false);
                setOnlySuperAdmin(!onlySuperAdmin);
              }} />
            </Form.Field>
          }
          <Button icon labelPosition='left' disabled={!grades || grades.length==0 || (typeOptions.length>1 && (!types || types.length==0))} loading={refreshing} onClick={() => {
            setRefreshing(true);
            const myTypes = typeOptions.length===1? [typeOptions[0].value] : types;
            postFilter(accessToken, grades, myTypes).then((res) => {
              setResult(res);
              setRefreshing(false);
            });
          }} >
            <Icon name='filter' />
            Filter
          </Button>
        </Form>
      </Segment>
      {res && (
        <Segment>
          <div style={{paddingBottom: '10px'}}>
            <div style={{float: 'right'}}>
              <Button icon labelPosition="left" size="mini" onClick={() => {
                const myOrderByStars = !orderByStars;
                result.sort((a, b) => {
                  if (myOrderByStars && a.stars != b.stars) {
                    return b.stars-a.stars;
                  }
                  return a.problemName.localeCompare(b.problemName);
                });
                setResult(result);
                setOrderByStars(myOrderByStars);
              }}>
                <Icon name="filter"/>
                {!orderByStars? "Order by stars" : "Order by name"}
              </Button>
            </div>
            <Header as="h3">{res.length} {meta.metadata.gradeSystem==='BOULDER'? "Problems" : "Routes"}</Header>
          </div>
          <Leaflet
            autoZoom={true}
            height='40vh'
            markers={res.filter(p => p.latitude!=0 && p.longitude!=0).map(p => ({lat: p.latitude, lng: p.longitude, label: p.problemName, url: '/problem/' + p.problemId}))}
            defaultCenter={meta.metadata.defaultCenter}
            defaultZoom={meta.metadata.defaultZoom}
            history={history}
            polylines={null}
            outlines={null}
            onClick={null}
            clusterMarkers={true}
            />
          <List selection verticalAlign='middle'>
            {res.map((p, i) => (
              <List.Item key={i} as={Link} to={`/problem/${p.problemId}`}>
                <Image avatar src={p.randomMediaId>0? getImageUrl(p.randomMediaId, 28) : '/png/image.png'} />
                <List.Content>
                  <List.Header>
                    {p.problemName} {p.grade} <LockSymbol lockedAdmin={p.problemLockedAdmin} lockedSuperadmin={p.problemLockedSuperadmin} /> <Stars numStars={p.stars} />
                  </List.Header>
                  <List.Description>
                    {p.areaName} <LockSymbol lockedAdmin={p.areaLockedAdmin} lockedSuperadmin={p.areaLockedSuperadmin} /> / {p.sectorName} <LockSymbol lockedAdmin={p.sectorLockedAdmin} lockedSuperadmin={p.sectorLockedSuperadmin} />
                  </List.Description>
                </List.Content>
              </List.Item>
            ))}
          </List>
        </Segment>
      )}
    </>
  )
}

export default Filter;
