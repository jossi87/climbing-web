import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { components } from '../../../@types/buldreinfo/swagger';
import { getBuldreinfoMediaUrlSupported } from '../../../api';

type Props = {
  media: components['schemas']['Media'];
  autoPlay?: boolean;
};

const style = {
  width: '100vw',
  height: '80vh',
  maxHeight: '100vh',
  maxWidth: '100vw',
};

const VideoPlayer: React.FC<Props> = ({ media, autoPlay = true }) => {
  const [hasSetVideoTimestamp, setHasSetVideoTimestamp] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const playerRef = useRef<HTMLVideoElement | null>(null);

  return (
    <ReactPlayer
      key={media.id ?? 0}
      ref={playerRef as any}
      style={style}
      src={getBuldreinfoMediaUrlSupported(media.id ?? 0)}
      controls
      playing={isPlaying}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onProgress={() => {
        const seconds = Number(media.t ?? 0);
        if (
          !hasSetVideoTimestamp &&
          !Number.isNaN(seconds) &&
          Number.isFinite(seconds) &&
          playerRef.current &&
          seconds < (playerRef.current as any).duration
        ) {
          setHasSetVideoTimestamp(true);
          try {
            (playerRef.current as any).currentTime = seconds;
          } catch (e) {
            // ignore seek errors
          }
        }
      }}
    />
  );
};

export default VideoPlayer;
