import React, { useState } from "react";
import { getAvatarUrl } from "../../../api/utils";
import { Icon, Image, Modal } from "semantic-ui-react";

type Props = {
  userId: number;
  avatarCrc32: number;
  floated?: "left" | "right";
  size?:
    | "mini"
    | "tiny"
    | "small"
    | "medium"
    | "large"
    | "big"
    | "huge"
    | "massive";
};

function Avatar({ userId, avatarCrc32, floated, size }: Props) {
  const [open, setOpen] = useState(false);

  const commonImageProps = {
    floated,
    size,
  };

  if (avatarCrc32 === 0) {
    return (
      <Image {...commonImageProps}>
        <Icon name="user" style={{ width: "100%", height: "100%" }} />
      </Image>
    );
  }

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      basic
      open={open}
      trigger={
        <Image src={getAvatarUrl(userId, avatarCrc32)} {...commonImageProps} />
      }
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Image src={getAvatarUrl(userId, avatarCrc32, true)} />
      </div>
    </Modal>
  );
}

export default Avatar;
