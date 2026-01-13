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

const SIZE_MAP: Record<string, number> = {
  mini: 35,
  tiny: 80,
  small: 150,
  medium: 300,
  large: 450,
  big: 600,
  huge: 800,
  massive: 960,
};

function Avatar({ userId, name, avatarCrc32, floated, size = 'mini' }: Props) {
  const [open, setOpen] = useState(false);
  const pixelSize = SIZE_MAP[size] || 35;

  const commonImageProps = {
    floated,
    size,
    width: pixelSize,
    height: pixelSize,
  };

  const uid = userId ?? 0;
  const crc = avatarCrc32 ?? 0;
  const alt = name ?? '';

  if (crc === 0) {
    return (
      <Image {...commonImageProps} as='div' style={{ display: 'inline-block' }}>
        <Icon
          name='user'
          style={{
            width: '100%',
            height: '100%',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
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
        <Image
          src={getAvatarUrl(uid, crc)}
          alt={alt}
          {...commonImageProps}
          style={{ objectFit: 'cover' }}
        />
      }
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Image src={getAvatarUrl(uid, crc, true)} alt={alt} />
      </div>
    </Modal>
  );
}

export default Avatar;
