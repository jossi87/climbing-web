import React, { useState } from "react";
import { useMeta } from "../../common/meta";
import { postComment, useAccessToken } from "./../../../api";
import {
  Button,
  Modal,
  Form,
  TextArea,
  Message,
  Icon,
} from "semantic-ui-react";
import ImageUpload from "../image-upload/image-upload";

const CommentModal = ({
  comment,
  onClose,
  showHse,
  id,
  idProblem,
}: {
  onClose: () => void;
  showHse: boolean;
  id: number;
  idProblem: number;
  comment?: {
    message: string;
    danger: boolean;
    resolved: boolean;
  };
}) => {
  const meta = useMeta();
  const accessToken = useAccessToken();
  const [message, setMessage] = useState(comment?.message ?? "");
  const [danger, setDanger] = useState(comment?.danger);
  const [resolved, setResolved] = useState(comment?.resolved);
  const [media, setMedia] = useState([]);
  const [saving, setSaving] = useState(false);

  return (
    <Modal open={true} onClose={onClose}>
      <Modal.Header>Add comment</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Form>
            <Form.Field>
              <label>Comment</label>
              <TextArea
                placeholder="Comment"
                style={{ minHeight: 100 }}
                defaultValue={message}
                onChange={(_, data) => {
                  setMessage(String(data.value));
                }}
              />
            </Form.Field>
            <Form.Field>
              <label>Attach image(s)</label>
              <ImageUpload onMediaChanged={setMedia} isMultiPitch={false} />
            </Form.Field>
            {showHse && (
              <Form.Field>
                <Button.Group size="mini" compact>
                  <Button
                    onClick={() => {
                      setDanger(false);
                      setResolved(false);
                    }}
                    active={danger && resolved}
                  >
                    Default comment
                  </Button>
                  <Button.Or />
                  <Button
                    onClick={() => {
                      setDanger(true);
                      setResolved(false);
                    }}
                    negative={danger && !resolved}
                    active={danger && !resolved}
                  >
                    Flag as dangerous
                  </Button>
                  <Button.Or />
                  <Button
                    onClick={() => {
                      setDanger(false);
                      setResolved(true);
                    }}
                    positive={!danger && resolved}
                    active={!danger && resolved}
                  >
                    Flag as safe
                  </Button>
                </Button.Group>
              </Form.Field>
            )}
          </Form>
          {danger && meta.isClimbing && (
            <Message error size="small">
              <Icon name="warning" />A loose hanger should not be flagged as
              dangerous. All climbers should carry a 17mm spanner (wrench), and
              if you don%apos;t have it just tight the nut by hand. Be specific,
              is the bolt spinning freely in the rock? Are there loose
              rocks/flakes that you were not able to safely remove by hand? What
              kind of tools are needed?
            </Message>
          )}
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button.Group compact size="tiny">
          <Button onClick={onClose}>Cancel</Button>
          <Button.Or />
          <Button
            positive
            loading={saving}
            icon="checkmark"
            labelPosition="right"
            content="Save"
            disabled={!message.trim()}
            onClick={() => {
              setSaving(true);
              postComment(
                accessToken,
                id,
                idProblem,
                message,
                danger,
                resolved,
                false,
                media,
              )
                .then(() => {
                  onClose();
                })
                .catch((error) => {
                  console.warn(error);
                  alert(error.toString());
                });
            }}
          />
        </Button.Group>
      </Modal.Actions>
    </Modal>
  );
};

export default CommentModal;
