import { useState } from 'react';
import { getAvatarUrl } from '../../../api/utils';
import { Icon, Image, Modal } from 'semantic-ui-react';

type Props = {
  userId?: number;
  name?: string;
  avatarCrc32?: number;
  floated?: 'left' | 'right';
  size?: 'mini' | 'tiny' | 'small' | 'medium' | 'large' | 'big' | 'huge' | 'massive';
};

function Avatar({ userId, name, avatarCrc32, floated, size }: Props) {
  const [open, setOpen] = useState(false);

  const commonImageProps = {
    floated,
    size,
  };

  const uid = userId ?? 0;
  const crc = avatarCrc32 ?? 0;
  const alt = name ?? '';

  if (crc === 0) {
    return (
      <Image {...commonImageProps}>
        <Icon name='user' style={{ width: '100%', height: '100%' }} />
      </Image>
    );
  }

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      basic
      open={open}
      trigger={<Image src={getAvatarUrl(uid, crc)} alt={alt} {...commonImageProps} />}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Image src={getAvatarUrl(uid, crc, true)} alt={alt} />
      </div>
    </Modal>
  );
}

export default Avatar;
