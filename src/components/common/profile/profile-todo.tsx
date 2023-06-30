import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Leaflet from "../../common/leaflet/leaflet";
import { Loading, LockSymbol } from "../../common/widgets/widgets";
import { List, Segment } from "semantic-ui-react";
import { getProfileTodo } from "../../../api";

type ProfileTodoProps = {
  accessToken: string;
  userId: number;
  defaultCenter: { lat: number; lng: number };
  defaultZoom: number;
};

const ProfileTodo = ({
  accessToken,
  userId,
  defaultCenter,
  defaultZoom,
}: ProfileTodoProps) => {
  const [data, setData] =
    useState<Awaited<ReturnType<typeof getProfileTodo>>>();

  useEffect(() => {
    if (data) {
      setData(undefined);
    }
    getProfileTodo(accessToken, userId).then((data) => setData(data));
  }, [userId]);

  if (!data) {
    return <Loading />;
  }
  const markers: NonNullable<React.ComponentProps<typeof Leaflet>["markers"]> =
    [];
  data.areas.forEach((a) => {
    a.sectors.forEach((s) => {
      s.problems.forEach((p) => {
        if (p.lat != 0 && p.lng != 0) {
          markers.push({
            lat: p.lat,
            lng: p.lng,
            label: p.name,
            url: "/problem/" + p.id,
          });
        }
      });
    });
  });
  if (data.areas.length === 0) {
    return <Segment>Empty list.</Segment>;
  }
  return (
    <Segment>
      <>
        <Leaflet
          key={"todo=" + userId}
          autoZoom={true}
          height="40vh"
          markers={markers}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          polylines={null}
          outlines={null}
          onMouseClick={null}
          onMouseMove={null}
          showSateliteImage={false}
          clusterMarkers={true}
          rocks={null}
          flyToId={null}
        />
        <List celled>
          {data.areas.map((area, i) => (
            <List.Item key={i}>
              <List.Header>
                <a href={area.url} rel="noreferrer noopener" target="_blank">
                  {area.name}
                </a>
                <LockSymbol
                  lockedAdmin={area.lockedAdmin}
                  lockedSuperadmin={area.lockedSuperadmin}
                />
              </List.Header>
              {area.sectors.map((sector, i) => (
                <List.List key={i}>
                  <List.Header>
                    <a
                      href={sector.url}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      {sector.name}
                    </a>
                    <LockSymbol
                      lockedAdmin={sector.lockedAdmin}
                      lockedSuperadmin={sector.lockedSuperadmin}
                    />
                  </List.Header>
                  <List.List>
                    {sector.problems.map((problem, i) => (
                      <List.Item key={i}>
                        <List.Header>
                          {`#${problem.nr} `}
                          <a
                            href={problem.url}
                            rel="noreferrer noopener"
                            target="_blank"
                          >
                            {problem.name}
                          </a>{" "}
                          {problem.grade}
                          {problem.partners && problem.partners.length > 0 && (
                            <small>
                              <i style={{ color: "gray" }}>
                                {problem.partners.map((u, i) => (
                                  <React.Fragment key={i}>
                                    {i === 0 ? " Other users: " : ", "}
                                    <Link to={`/user/${u.id}/todo`}>
                                      {u.name}
                                    </Link>
                                  </React.Fragment>
                                ))}
                              </i>
                            </small>
                          )}
                          <LockSymbol
                            lockedAdmin={problem.lockedAdmin}
                            lockedSuperadmin={problem.lockedSuperadmin}
                          />
                        </List.Header>
                      </List.Item>
                    ))}
                  </List.List>
                </List.List>
              ))}
            </List.Item>
          ))}
        </List>
      </>
    </Segment>
  );
};

export default ProfileTodo;
