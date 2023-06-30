import React from "react";
import { Segment, Icon, Label, Header } from "semantic-ui-react";
import { postUserRegion } from "../../../api";
import { useQueryClient } from "@tanstack/react-query";

const ProfileSettings = ({ accessToken, userRegions }) => {
  const client = useQueryClient();
  if (!accessToken || !userRegions || userRegions.length === 0) {
    return <Segment>No data</Segment>;
  }
  return (
    <Segment>
      <Header as="h4">Specify the different regions you want to show</Header>
      {userRegions.map((ur) => {
        if (ur.enabled && ur.readOnly) {
          return (
            <Label color="blue" key={ur.id} active={false} size="mini">
              {ur.name}
              <Label.Detail>{ur.role ? ur.role : "Current site"}</Label.Detail>
            </Label>
          );
        } else if (ur.enabled && !ur.readOnly) {
          return (
            <Label
              color="blue"
              key={ur.id}
              active={true}
              size="mini"
              as="a"
              onClick={() => {
                postUserRegion(accessToken, ur.id, true)
                  .then(async () => {
                    await client.invalidateQueries({ predicate: () => true });
                  })
                  .catch((error) => {
                    console.warn(error);
                    alert(error.toString());
                  });
              }}
            >
              {ur.name}
              <Icon name="delete" />
            </Label>
          );
        } else {
          return (
            <Label
              key={ur.id}
              active={true}
              size="mini"
              as="a"
              onClick={() => {
                postUserRegion(accessToken, ur.id, false)
                  .then(async () => {
                    await client.invalidateQueries({ predicate: () => true });
                  })
                  .catch((error) => {
                    console.warn(error);
                    alert(error.toString());
                  });
              }}
            >
              <Icon name="add" />
              {ur.name}
            </Label>
          );
        }
      })}
    </Segment>
  );
};

export default ProfileSettings;
