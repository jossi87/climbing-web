import React from "react";
import { Link } from "react-router-dom";
import Leaflet from "../../common/leaflet/leaflet";
import { Loading, LockSymbol } from "../../common/widgets/widgets";
import { List, Segment } from "semantic-ui-react";
import { useProfileTodo } from "../../../api";

type ProfileTodoProps = {
  userId: number;
  defaultCenter: { lat: number; lng: number };
  defaultZoom: number;
};

const ProfileTodo = ({
  userId,
  defaultCenter,
  defaultZoom,
}: ProfileTodoProps) => {
  const { data } = useProfileTodo(userId);

  if (!data) {
    return <Loading />;
  }

  const markers: NonNullable<React.ComponentProps<typeof Leaflet>["markers"]> =
    [];
  data.areas.forEach((a) => {
    a.sectors.forEach((s) => {
      s.problems.forEach((p) => {
        if (p.coordinate) {
          markers.push({
            lat: p.coordinate.latitude,
            lng: p.coordinate.longitude,
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
          showSatelliteImage={false}
          clusterMarkers={true}
          flyToId={null}
        />
        <List celled>
          {data.areas.map((area) => (
            <List.Item key={area.id}>
              <List.Header>
                <Link to={`/area/${area.id}`}>{area.name}</Link>
                <LockSymbol
                  lockedAdmin={area.lockedAdmin}
                  lockedSuperadmin={area.lockedSuperadmin}
                />
              </List.Header>
              {area.sectors.map((sector) => (
                <List.List key={sector.id}>
                  <List.Header>
                    <Link to={`/sector/${sector.id}`}>{sector.name}</Link>
                    <LockSymbol
                      lockedAdmin={sector.lockedAdmin}
                      lockedSuperadmin={sector.lockedSuperadmin}
                    />
                  </List.Header>
                  <List.List>
                    {sector.problems.map((problem) => (
                      <List.Item key={problem.id}>
                        <List.Header>
                          {`#${problem.nr} `}
                          <Link to={`/problem/${problem.id}`}>
                            {problem.name}
                          </Link>{" "}
                          {problem.grade}
                          {problem.partners && problem.partners.length > 0 && (
                            <small>
                              <i style={{ color: "gray" }}>
                                {problem.partners.map((u, i) => (
                                  <React.Fragment key={u.id}>
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
