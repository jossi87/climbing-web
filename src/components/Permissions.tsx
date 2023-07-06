import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Loading, LockSymbol } from "./common/widgets/widgets";
import { getPermissions, postPermissions } from "../api";
import {
  Header,
  Icon,
  Segment,
  Image,
  Dropdown,
  Card,
  Input,
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

type PermissionsData = {
  userId: number;
  name: string;
  picture?: string;
  lastLogin?: string;
  adminRead: boolean;
  adminWrite: boolean;
  superadminRead: boolean;
  superadminWrite: boolean;
  readOnly: boolean;
  write?: number;
};

const Permissions = () => {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [accessToken, setAccessToken] = useState<any>(null);
  const [data, setData] = useState<PermissionsData[]>([]);
  const [query, setQuery] = useState<string>("");

  const filteredData = query
    ? data.filter((item) => {
        return item.name.toLowerCase().includes(query.toLowerCase());
      })
    : data;

  useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently().then((accessToken) => {
        setLoading(true);
        getPermissions(accessToken).then((data) => {
          setData(data);
          setAccessToken(accessToken);
          setLoading(false);
        });
      });
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  if (loading) {
    return <Loading />;
  }
  const subHeader = query
    ? `${filteredData.length}/${data.length} users`
    : `${data.length} users`;
  return (
    <>
      <Helmet>
        <title>Permissions</title>
      </Helmet>
      <Segment>
        <Header as="h2">
          <Icon name="users" />
          <Header.Content>
            Permissions
            <Header.Subheader>{subHeader}</Header.Subheader>
          </Header.Content>
        </Header>
        <Input
          icon="search"
          placeholder="Search..."
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
      </Segment>
      {filteredData.length == 0 ? (
        <Segment>No data</Segment>
      ) : (
        <Card.Group doubling stackable itemsPerRow={4}>
          {filteredData.map((u, key) => {
            let color: any = "white";
            if (u.write == 2) {
              color = "black";
            } else if (u.write == 1) {
              color = "red";
            } else if (u.write == 0) {
              color = "green";
            } else {
              color = "yellow";
            }
            let value = 0;
            if (u.superadminWrite) {
              value = 3;
            } else if (u.adminWrite) {
              value = 2;
            } else if (u.adminRead) {
              value = 1;
            }
            return (
              <Card color={color} key={key} raised>
                <Card.Content>
                  <Image
                    floated="right"
                    size="mini"
                    src={u.picture ? u.picture : "/png/image.png"}
                  />
                  <Card.Header as={Link} to={`/user/${u.userId}`}>
                    {u.name}{" "}
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
                      options={[
                        {
                          key: 0,
                          value: 0,
                          icon: "user",
                          text: "Default user",
                        },
                        {
                          key: 1,
                          value: 1,
                          icon: "user plus",
                          text: "Read hidden data",
                        },
                        {
                          key: 2,
                          value: 2,
                          icon: "lock",
                          text: "Admin (read+write hidden data)",
                        },
                        {
                          key: 3,
                          value: 3,
                          icon: "user secret",
                          text: "Admin + manage users",
                        },
                      ]}
                      onChange={(e, d) => {
                        const adminRead = d.value === 1 || d.value === 2;
                        const adminWrite = d.value === 2;
                        const superadminRead = d.value === 3;
                        const superadminWrite = d.value === 3;
                        postPermissions(
                          accessToken,
                          u.userId,
                          adminRead,
                          adminWrite,
                          superadminRead,
                          superadminWrite,
                        )
                          .then(() => {
                            window.scrollTo(0, 0);
                            window.location.reload();
                          })
                          .catch((error) => {
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
