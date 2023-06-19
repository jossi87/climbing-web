import React, { useState } from "react";
import { Button, Modal, Form, Input, Checkbox } from "semantic-ui-react";

const MediaEditModal = ({ save, onCloseWithoutReload, m, numPitches }) => {
  const [media, setMedia] = useState(m);
  const [saving, setSaving] = useState(false);

  return (
    <Modal open={true} onClose={onCloseWithoutReload}>
      <Modal.Header>Edit media</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Form>
            <Form.Field>
              <label>Description:</label>
              <Input
                size="mini"
                icon="comment"
                iconPosition="left"
                fluid
                placeholder="Description"
                value={media.mediaMetadata.description}
                onChange={(e, { value }) => {
                  const newMedia = media;
                  newMedia.mediaMetadata.description = value;
                  setMedia({ ...newMedia });
                }}
              />
            </Form.Field>
            {numPitches > 0 && (
              <Form.Field disabled={media.trivia}>
                <label>Pitch (route has {numPitches} pitches):</label>
                <Input
                  size="mini"
                  icon="hashtag"
                  iconPosition="left"
                  fluid
                  placeholder="Pitch"
                  value={media.pitch}
                  onChange={(e, { value }) => {
                    const newMedia = media;
                    newMedia.pitch = parseInt(value);
                    setMedia({ ...newMedia });
                  }}
                />
              </Form.Field>
            )}
            <Form.Field>
              <label>Trivia-image?</label>
              <Checkbox
                toggle
                checked={media.trivia}
                onChange={() =>
                  setMedia((prevState) => ({
                    ...prevState,
                    trivia: !media.trivia,
                    pitch: 0,
                  }))
                }
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
              save(
                media.id,
                media.mediaMetadata.description,
                media.pitch,
                media.trivia
              );
            }}
          />
        </Button.Group>
      </Modal.Actions>
    </Modal>
  );
};

export default MediaEditModal;
