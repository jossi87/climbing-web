import React, { useRef, useState, useEffect } from 'react';
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
  const playerRef = useRef<any>(null);
  useEffect(() => {
    if (!autoPlay) return;
    const tryPlay = async () => {
      try {
        const internal = playerRef.current?.getInternalPlayer?.() ?? playerRef.current;
        if (internal && typeof internal.play === 'function') {
          // play may return a promise on some browsers
          await internal.play();
        }
      } catch (e) {
        // ignore play errors (autoplay policies)
      }
    };
    tryPlay();
  }, [autoPlay, media.id]);

  return (
    <ReactPlayer
      key={media.id ?? 0}
      ref={playerRef}
      style={style}
      src={getBuldreinfoMediaUrlSupported(media.id ?? 0)}
      controls
      onProgress={() => {
        const seconds = Number(media.t ?? 0);
        if (!hasSetVideoTimestamp && !Number.isNaN(seconds) && Number.isFinite(seconds)) {
          setHasSetVideoTimestamp(true);
          try {
            if (typeof playerRef.current?.seekTo === 'function') {
              playerRef.current.seekTo(seconds, 'seconds');
            } else {
              const internal = playerRef.current?.getInternalPlayer?.() ?? playerRef.current;
              if (internal) {
                internal.currentTime = seconds;
              }
            }
          } catch (e) {
            // ignore seek errors
          }
        }
      }}
    />
  );
};

export default VideoPlayer;
