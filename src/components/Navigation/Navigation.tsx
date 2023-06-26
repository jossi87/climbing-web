import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Container, Dropdown, Image, Menu, Icon } from "semantic-ui-react";
import { Link } from "react-router-dom";
import SearchBox from "../common/search-box/search-box";
import { useMeta } from "../common/meta";
import "./Navigation.css";

export const Navigation = () => {
  const { isAdmin, isSuperAdmin, isAuthenticated, isBouldering } = useMeta();

  const { isLoading, loginWithRedirect, logout } = useAuth0();

  return (
    <Menu attached="top" inverted compact borderless>
      <Container className="nav-container">
        <div
          style={{ display: "flex", flexDirection: "row", flex: 1 }}
          className="row-1"
        >
          <Menu.Item header as={Link} to="/">
            <Image size="mini" src="/png/buldreinfo.png" />
          </Menu.Item>
          <Menu.Item as={SearchBox} style={{ flex: 1 }} />
        </div>
        <Menu.Item as={Link} to="/browse">
          <Icon name="list" />
          <span>Areas</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/toc">
          <Icon name="database" />
          <span>{isBouldering ? "Problems" : "Routes"}</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/filter">
          <Icon name="find" />
          <span>Filter</span>
        </Menu.Item>
        {!isBouldering && (
          <Menu.Item as={Link} to="/dangerous">
            <Icon name="warning sign" />
            <span>Dangerous</span>
          </Menu.Item>
        )}
        <Menu.Item as={Link} to="/graph" className="collapse-1">
          <Icon name="chart bar" />
          <span>Graph</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/webcams" className="collapse-1">
          <Icon name="camera" />
          <span>Webcams</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/about" className="collapse-1">
          <Icon name="info" />
          <span>About</span>
        </Menu.Item>
        {!isLoading &&
          (isAuthenticated ? (
            <Dropdown
              item
              simple
              labeled
              trigger={
                <>
                  <Icon name="user" />
                  <span>Account</span>
                </>
              }
              icon={null}
              className="collapse-1"
            >
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
                      <>
                        <Dropdown.Item as={Link} to="/permissions">
                          <Icon name="users" />
                          Permissions
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/swagger">
                          <Icon name="code" />
                          Swagger
                        </Dropdown.Item>
                      </>
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
                    logout({ logoutParams: { returnTo: window.origin } })
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
              className="collapse-1"
            >
              <Icon name="user outline" />
              <span>Sign in</span>
            </Menu.Item>
          ))}
      </Container>
    </Menu>
  );
};
