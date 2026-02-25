import { useState } from 'react';
import { getImageUrl } from '../../../api/utils';
import { Icon, Image, Modal } from 'semantic-ui-react';

type Props = {
  userId?: number;
  name?: string;
  mediaId?: number;
  mediaVersionStamp?: number;
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

function Avatar({ userId, name, mediaId, mediaVersionStamp, floated, size = 'mini' }: Props) {
  const [open, setOpen] = useState(false);
  const pixelSize = SIZE_MAP[size] || 35;

  const commonImageProps = {
    floated,
    size,
    width: pixelSize,
    height: pixelSize,
  };

  const uid = userId ?? 0;
  const mid = mediaId ?? 0;
  const alt = name ?? '';

  if (mid === 0) {
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
          src={getImageUrl(mid, mediaVersionStamp ?? 0, { targetWidth: 50 })}
          alt={alt}
          {...commonImageProps}
          style={{ objectFit: 'cover' }}
        />
      }
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Image src={getImageUrl(mid, mediaVersionStamp ?? 0, { targetWidth: 50 })} alt={alt} />
      </div>
    </Modal>
  );
}

export default Avatar;
