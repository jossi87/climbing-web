import React, { useState, useEffect } from 'react';
import { postComment } from './../../../api';
import { Button, Modal, Form, TextArea } from 'semantic-ui-react';
import ImageUpload from '../image-upload/image-upload';

const CommentModal = ({ open, showHse, accessToken, closeWithoutReload, closeWithReload, id, idProblem, initMessage, initDanger, initResolved }) => {
  const [comment, setComment] = useState(null);
  const [danger, setDanger] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [media, setMedia] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setComment(initMessage)
    setDanger(initDanger);
    setResolved(initResolved);
  }, [initMessage, initDanger, initResolved]);

  return (
    <Modal open={open} onClose={closeWithoutReload}>
      <Modal.Header>Add comment</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Form>
            <Form.Field>
              <label>Comment</label>
              <TextArea placeholder='Comment' style={{ minHeight: 100 }} value={comment? comment : ""} onChange={(e, data) => { setComment(data.value); }} />
            </Form.Field>
            <Form.Field
              label="Attach image(s)"
              control={ImageUpload}
              onMediaChanged={(media) => setMedia(media)}
              isMultiPitch={false}
              includeVideoEmbedder={false} />
            {showHse &&
              <Form.Field>
                <Button.Group size="mini" compact>
                  <Button onClick={() => { setDanger(false); setResolved(false); }} active={danger && resolved}>Default comment</Button>
                  <Button.Or />
                  <Button onClick={() => { setDanger(true); setResolved(false); }} negative={danger && !resolved} active={danger && !resolved}>Flag as dangerous</Button>
                  <Button.Or />
                  <Button onClick={() => { setDanger(false); setResolved(true); }} positive={!danger && resolved} active={!danger && resolved}>Flag as safe</Button>
                </Button.Group>
              </Form.Field>
            }
          </Form>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button.Group compact size="tiny">
          <Button onClick={closeWithoutReload}>
            Cancel
          </Button>
          <Button.Or />
          <Button
            positive
            loading={saving}
            icon='checkmark'
            labelPosition='right'
            content="Save"
            onClick={() => {
              if (comment) {
                setSaving(true);
                postComment(accessToken, id, idProblem, comment, danger, resolved, false, media)
                .then((response) => {
                  setComment(null);
                  setDanger(false);
                  setResolved(false);
                  closeWithReload();
                })
                .catch((error) => {
                  console.warn(error);
                  alert(error.toString());
                });
              }
            }}
          />
        </Button.Group>
      </Modal.Actions>
    </Modal>
  );
}

export default CommentModal;
