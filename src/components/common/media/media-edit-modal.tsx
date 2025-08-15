import React, { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Checkbox,
  Dropdown,
} from "semantic-ui-react";
import { components } from "../../../@types/buldreinfo/swagger";

type Media = components["schemas"]["Media"];

type Props = {
  save: (
    id: NonNullable<Media["id"]>,
    metadataDescription: NonNullable<
      NonNullable<Media["mediaMetadata"]>["description"]
    >,
    pitch: NonNullable<Media["pitch"]>,
    trivia: NonNullable<Media["trivia"]>,
  ) => void;
  onCloseWithoutReload: () => void;
  m: Media;
  numPitches: number;
};

const MediaEditModal = ({
  save,
  onCloseWithoutReload,
  m,
  numPitches,
}: Props) => {
  const [description, setDescription] = useState(m.mediaMetadata.description);
  const [pitch, setPitch] = useState(m.pitch);
  const [trivia, setTrivia] = useState(m.trivia);
  const [saving, setSaving] = useState(false);

  return (
    <Modal open={true} onClose={onCloseWithoutReload}>
      <Modal.Header>Edit media</Modal.Header>
      <Modal.Content scrolling>
        <Modal.Description>
          <Form>
            <Form.Field>
              <label>Description:</label>
              <Input
                icon="comment"
                iconPosition="left"
                fluid
                placeholder="Description"
                value={description}
                onChange={(e, { value }) => setDescription(value)}
              />
            </Form.Field>
            {numPitches > 0 && (
              <Form.Field disabled={trivia}>
                <label>Pitch (route has {numPitches} pitches):</label>
                <Dropdown
                  clearable
                  fluid
                  placeholder="Not connected to a pitch"
                  options={Array.from(
                    { length: numPitches },
                    (_, i) => i + 1,
                  ).map((x) => ({ key: x, text: `Pitch ${x}`, value: x }))}
                  selection
                  value={pitch}
                  onChange={(e, { _, value }) => setPitch(+value)}
                />
              </Form.Field>
            )}
            <Form.Field>
              <label>Trivia-image?</label>
              <Checkbox
                toggle
                checked={trivia}
                onChange={() => {
                  setTrivia((prevTrivia) => !prevTrivia);
                  setPitch(0);
                }}
              />
            </Form.Field>
          </Form>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button.Group compact size="tiny">
          <Button onClick={onCloseWithoutReload}>Cancel</Button>
          <Button.Or />
          <Button
            positive
            loading={saving}
            icon="checkmark"
            labelPosition="right"
            content="Save"
            onClick={() => {
              setSaving(true);
              m.mediaMetadata.description = description;
              m.pitch = pitch;
              m.trivia = trivia;
              save(m.id, description, pitch, trivia);
            }}
          />
        </Button.Group>
      </Modal.Actions>
    </Modal>
  );
};

export default MediaEditModal;
