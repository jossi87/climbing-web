import React, { useEffect, useState } from "react";
import { Segment, Header, Checkbox,
  Button,
  Icon,
  FormButton,
  FormField,
  FormInput,
  FormGroup,
  Form } from "semantic-ui-react";
import { useProfile } from "../../../api";

const ProfileSettings = () => {
  const { setProfile, setRegion, data } = useProfile();
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [emailVisibleToAll, setEmailVisibleToAll] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    setIsSaving(false);
    if (data) {
      setFirstname(data.firstname);
      setLastname(data.lastname);
      setEmailVisibleToAll(data.emailVisibleToAll)
    }
  }, [data]);

  if (!data?.userRegions?.length) {
    return <Segment>No data</Segment>;
  }

  const saveEnabled = firstname && lastname && (data?.firstname !== firstname || data?.lastname !== lastname || ((data.emails?.length > 0) != emailVisibleToAll));

  return (
    <>
      <Segment>
        <Form>
          <FormGroup widths='equal' >
              <FormInput required fluid label='First name' name="firstname" placeholder='First name' value={firstname || ""} error={!firstname} onChange={((e, {value}) => setFirstname(value))} />
              <FormInput required fluid label='Last name' name="lastname" placeholder='Last name' value={lastname || ""} error={!lastname} onChange={((e, {value}) => setLastname(value))}   />
          </FormGroup>
          <FormField>
            <Checkbox
              label="Allow others to contact me by email"
              checked={emailVisibleToAll}
              onChange={(_, { checked }) => {
                setEmailVisibleToAll(checked);
              }}
            />
          </FormField>
          <FormButton primary disabled={!saveEnabled} loading={isSaving} onClick={() => {
            setIsSaving(true);
            setProfile({firstname, lastname, emailVisibleToAll});
          }}><Icon name="save"/>Save</FormButton>
        </Form>
      </Segment>
      <Segment>
        <Header as="h4">Specify the different regions you want to show:</Header>
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
    </>
  );
};

export default ProfileSettings;
