import React, { useState } from 'react';
import { Loading, LockSymbol } from './common/widgets/widgets';
import { usePermissions } from '../api';
import Avatar from './common/avatar/avatar';
import { useMeta } from './common/meta';
import { Header, Icon, Segment, Dropdown, Card, Input } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { Mutable } from '../@types/buldreinfo';

const COLORS = [
  'yellow', // default user
  'green', // admin read
  'red', // admin write
  'black', // superadmin write
] as const;

const OPTIONS = [
  {
    key: 0,
    value: 0,
    icon: 'user',
    text: 'Default user',
  },
  {
    key: 1,
    value: 1,
    icon: 'user plus',
    text: 'Read hidden data',
  },
  {
    key: 2,
    value: 2,
    icon: 'lock',
    text: 'Admin (read+write hidden data)',
  },
  {
    key: 3,
    value: 3,
    icon: 'user secret',
    text: 'Admin + manage users',
  },
] as const;

const Permissions = () => {
  const meta = useMeta();
  const [query, setQuery] = useState<string>('');
  const { data = [], isLoading: loading, update: postPermissions } = usePermissions();

  const filteredData = data.filter(
    (item) => !query || item.name.toLowerCase().includes(query.toLowerCase()),
  );

  if (loading) {
    return <Loading />;
  }

  const subHeader = query ? `${filteredData.length}/${data.length} users` : `${data.length} users`;
  return (
    <>
      <title>{`Permissins | ${meta?.title}`}</title>
      <Segment>
        <Header as='h2'>
          <Icon name='users' />
          <Header.Content>
            Permissions
            <Header.Subheader>{subHeader}</Header.Subheader>
          </Header.Content>
        </Header>
        <Input
          icon='search'
          placeholder='Search...'
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
      </Segment>
      {filteredData.length == 0 ? (
        <Segment>No data</Segment>
      ) : (
        <Card.Group doubling stackable itemsPerRow={4}>
          {filteredData.map((u) => {
            const value = (() => {
              if (u.superadminWrite) {
                return 3;
              } else if (u.adminWrite) {
                return 2;
              } else if (u.adminRead) {
                return 1;
              } else {
                return 0;
              }
            })();
            const color = COLORS[value];
            return (
              <Card color={color} key={u.userId} raised>
                <Card.Content>
                  <Avatar
                    userId={u.userId}
                    name={u.name}
                    avatarCrc32={u.avatarCrc32}
                    floated='right'
                    size='mini'
                  />
                  <Card.Header as={Link} to={`/user/${u.userId}`}>
                    {u.name}{' '}
                    <LockSymbol
                      lockedAdmin={u.adminRead || u.adminWrite}
                      lockedSuperadmin={u.superadminRead || u.superadminWrite}
                    />
                  </Card.Header>
                  <Card.Meta>Last seen {u.lastLogin}</Card.Meta>
                  <Card.Description>
                    <Dropdown
                      value={value}
                      disabled={u.readOnly}
                      options={OPTIONS as Mutable<typeof OPTIONS>}
                      onChange={(_, d) => {
                        const adminRead = d.value === 1 || d.value === 2;
                        const adminWrite = d.value === 2;
                        const superadminRead = d.value === 3;
                        const superadminWrite = d.value === 3;
                        postPermissions(
                          u.userId,
                          adminRead,
                          adminWrite,
                          superadminRead,
                          superadminWrite,
                        ).catch((error) => {
                          reportError(error);
                          console.warn(error);
                          alert(error.toString());
                        });
                      }}
                    />
                  </Card.Description>
                </Card.Content>
              </Card>
            );
          })}
        </Card.Group>
      )}
    </>
  );
};

export default Permissions;
