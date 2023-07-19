import React from "react";
import { Link } from "react-router-dom";
import { Loading, LockSymbol } from "../widgets/widgets";
import { Header, Icon, List } from "semantic-ui-react";
import { useTodo } from "../../../api";

const Todo = ({ idArea, idSector }: { idArea: number; idSector: number }) => {
  const { data } = useTodo({ idArea, idSector });

  if (!data) {
    return <Loading />;
  }

  if (data.sectors.length === 0) {
    return <>Empty list.</>;
  }

  return (
    <>
      <Header as="h4">
        <Icon name="bookmark" />
        <Header.Content>
          Todo
          <Header.Subheader>
            Find other users with projects in the same area.
          </Header.Subheader>
        </Header.Content>
      </Header>
      <List>
        <List.Item>
          {data.sectors.map((sector) => (
            <List.List key={sector.id}>
              {idArea > 0 && (
                <List.Header>
                  <Link to={`/sector/${sector.id}`}>{sector.name}</Link>
                  <LockSymbol
                    lockedAdmin={sector.lockedAdmin}
                    lockedSuperadmin={sector.lockedSuperadmin}
                  />
                </List.Header>
              )}
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
                                {i === 0 ? " User(s): " : ", "}
                                <Link to={`/user/${u.id}/todo`}>{u.name}</Link>
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
      </List>
    </>
  );
};

export default Todo;
