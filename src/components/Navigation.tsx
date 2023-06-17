import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Container, Dropdown, Image, Menu, Icon } from "semantic-ui-react";
import { Link, useLocation } from "react-router-dom";
import SearchBox from "./common/search-box/search-box";
import { getBaseUrl, getMeta } from "../api";

const Navigation = () => {
  const {
    isLoading,
    isAuthenticated,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsUserAdmin] = useState(false);
  const [isBouldering, setIsBouldering] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const update = async () => {
      const accessToken = isAuthenticated
        ? await getAccessTokenSilently()
        : null;
      getMeta(accessToken).then((data) => {
        setIsAdmin(data.metadata.isAdmin);
        setIsUserAdmin(data.metadata.isSuperAdmin);
        setIsBouldering(data.metadata.gradeSystem === "BOULDER");
      });
    };
    update();
  }, [isAuthenticated]);

  return (
    <Menu attached="top" inverted compact borderless>
      <Container>
        <Menu.Item header as={Link} to="/">
          <Image size="mini" src="/png/buldreinfo.png" />
        </Menu.Item>
        <Menu.Item as={SearchBox} style={{ maxWidth: "35vw" }} />
        <Dropdown item simple icon="ellipsis vertical">
          <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/browse">
              <Icon name="list" />
              Browse areas
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/toc">
              <Icon name="database" />
              Table of Contents
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/cg">
              <Icon name="area graph" />
              Content Graph
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to="/filter">
              <Icon name="find" />
              Filter
            </Dropdown.Item>
            {!isBouldering && (
              <Dropdown.Item as={Link} to="/dangerous">
                <Icon name="warning sign" />
                Marked as dangerous
              </Dropdown.Item>
            )}
            <Dropdown.Divider />
            <Dropdown.Item as={Link} to="/webcam-map">
              <Icon name="camera" />
              Webcam Map
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/about">
              <Icon name="info" />
              About
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        {!isLoading &&
          (isAuthenticated ? (
            <Dropdown item simple icon="user">
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/user">
                  <Icon name="user" />
                  Profile
                </Dropdown.Item>
                {(isAdmin || isSuperAdmin) && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to="/trash">
                      <Icon name="trash" />
                      Trash
                    </Dropdown.Item>
                    {isSuperAdmin && (
                      <Dropdown.Item as={Link} to="/permissions">
                        <Icon name="users" />
                        Permissions
                      </Dropdown.Item>
                    )}
                    <Dropdown.Item
                      as={Link}
                      to="/pdf/20230525_administrator_doc.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon name="help" />
                      Help
                    </Dropdown.Item>
                  </>
                )}
                <Dropdown.Divider />
                <Dropdown.Item
                  as="a"
                  onClick={() =>
                    logout({ logoutParams: { returnTo: getBaseUrl() } })
                  }
                >
                  <Icon name="sign out" />
                  Sign out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Menu.Item
              as="a"
              onClick={() =>
                loginWithRedirect({ appState: { returnTo: location.pathname } })
              }
              icon="sign in"
            />
          ))}
      </Container>
    </Menu>
  );
};

export default Navigation;
