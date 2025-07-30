import React, { useState } from "react";
import { getAvatarUrl } from "../../../api/utils";
import { Image, Modal } from "semantic-ui-react";

type Props = {
  userId: number;
  picture: string;
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

function Avatar({ userId, picture, floated, size }: Props) {
  const [open, setOpen] = useState(false);

  const commonImageProps = {
    floated,
    size,
  };

  if (!picture) {
    return <Image src="/png/image.png" {...commonImageProps} />;
  }

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      basic
      open={open}
      trigger={
        <Image src={getAvatarUrl(userId, picture)} {...commonImageProps} />
      }
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Image src={getAvatarUrl(userId, picture, true)} />
      </div>
    </Modal>
  );
}

export default Avatar;
