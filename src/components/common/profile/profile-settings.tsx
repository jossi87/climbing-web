import React from "react";
import { Segment, Header, Checkbox, Form } from "semantic-ui-react";
import { useProfile } from "../../../api";

const ProfileSettings = () => {
  const { setRegion, data } = useProfile();

  if (!data?.userRegions?.length) {
    return <Segment>No data</Segment>;
  }

  return (
    <Segment>
      <Header as="h4">Specify the different regions you want to show</Header>
      <Form>
        {data?.userRegions.map((region) => {
          const label = region.role
            ? `${region.name} (${region.role})`
            : region.name;
          return (
            <Form.Field key={region.id}>
              <Checkbox
                label={label}
                checked={region.enabled}
                disabled={region.readOnly}
                onChange={(_, { checked }) => {
                  setRegion({ region, del: !checked });
                }}
              />
            </Form.Field>
          );
        })}
      </Form>
    </Segment>
  );
};

export default ProfileSettings;
