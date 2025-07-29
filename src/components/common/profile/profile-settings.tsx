import React, { useEffect, useState, useCallback } from "react";
import {
  Segment,
  Header,
  Checkbox,
  Icon,
  FormButton,
  FormField,
  FormInput,
  FormGroup,
  Form,
  Image,
} from "semantic-ui-react";
import { useProfile } from "../../../api";
import { DropzoneOptions, useDropzone } from "react-dropzone";

const ProfileSettings = () => {
  const { setProfile, setRegion, data } = useProfile();
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [emailVisibleToAll, setEmailVisibleToAll] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const onDrop = useCallback<DropzoneOptions["onDrop"]>((acceptedFiles) => {
    setAvatar(
      acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))[0],
    );
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
  });

  useEffect(() => {
    setIsSaving(false);
    if (data) {
      setFirstname(data.firstname);
      setLastname(data.lastname);
      setEmailVisibleToAll(data.emailVisibleToAll);
      setAvatar(null);
    }
  }, [data]);

  if (!data?.userRegions?.length) {
    return <Segment>No data</Segment>;
  }

  const saveEnabled =
    firstname &&
    lastname &&
    (data?.firstname !== firstname ||
      data?.lastname !== lastname ||
      data.emails?.length > 0 != emailVisibleToAll ||
      avatar);

  return (
    <>
      <Segment>
        <Form>
          <FormGroup widths="equal">
            <FormInput
              required
              fluid
              label="First name"
              name="firstname"
              placeholder="First name"
              value={firstname || ""}
              error={!firstname}
              onChange={(e, { value }) => setFirstname(value)}
            />
            <FormInput
              required
              fluid
              label="Last name"
              name="lastname"
              placeholder="Last name"
              value={lastname || ""}
              error={!lastname}
              onChange={(e, { value }) => setLastname(value)}
            />
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
          <FormField>
            <label>Avatar:</label>
            {avatar ? (
              <>
                <Image size="medium" src={avatar.preview}></Image>
                <FormButton size="mini" onClick={() => setAvatar(null)}>
                  <Icon name="cancel" />
                  Remove image
                </FormButton>
              </>
            ) : (
              <div
                {...getRootProps()}
                style={{
                  padding: "15px",
                  borderWidth: "1px",
                  borderColor: "#666",
                  borderStyle: "dashed",
                  borderRadius: "5px",
                  backgroundColor: "white",
                }}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop image here...</p>
                ) : (
                  <p>Drop image here, or click to select file to upload.</p>
                )}
              </div>
            )}
          </FormField>
          <FormButton
            primary
            disabled={!saveEnabled}
            loading={isSaving}
            onClick={() => {
              setIsSaving(true);
              setProfile({
                firstname,
                lastname,
                emailVisibleToAll,
                avatarFile: avatar?.file,
              });
            }}
          >
            <Icon name="save" />
            Save
          </FormButton>
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
