import React, { useState } from 'react';
import { postComment } from './../../../api';
import { Button, Modal, Form, TextArea } from 'semantic-ui-react';

const CommentModal = ({ open, showHse, accessToken, idProblem, onClose }) => {
  const [comment, setComment] = useState(null);
  const [danger, setDanger] = useState(false);
  const [resolved, setResolved] = useState(false);

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>Add comment</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Form>
            <Form.Field>
              <label>Comment</label>
              <TextArea placeholder='Comment' style={{ minHeight: 100 }} value={comment? comment : ""} onChange={(e, data) => { setComment(data.value); }} />
            </Form.Field>
            {showHse &&
              <Button.Group size="mini" compact>
                <Button onClick={() => { setDanger(false); setResolved(false); }} active={danger && resolved}>Default comment</Button>
                <Button.Or />
                <Button onClick={() => { setDanger(true); setResolved(false); }} negative={danger && !resolved} active={danger && !resolved}>Flag as dangerous</Button>
                <Button.Or />
                <Button onClick={() => { setDanger(false); setResolved(true); }} positive={!danger && resolved} active={!danger && resolved}>Flag as safe</Button>
              </Button.Group>
            }
          </Form>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button.Group compact size="tiny">
          <Button color='black' onClick={onClose}>
            Cancel
          </Button>
          <Button.Or />
          <Button
            positive
            icon='checkmark'
            labelPosition='right'
            content="Save"
            onClick={() => {
              if (comment) {
                postComment(accessToken, -1, idProblem, comment, danger, resolved)
                .then((response) => {
                  setComment(null);
                  setDanger(false);
                  setResolved(false);
                  onClose();
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
