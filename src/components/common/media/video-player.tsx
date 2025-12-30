import React, { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { components } from '../../../@types/buldreinfo/swagger';
import { getBuldreinfoMediaUrlSupported } from '../../../api';

type Props = {
  media: components['schemas']['Media'];
  autoPlay?: boolean;
};

const style = {
  width: '100%',
  height: '100%',
  maxHeight: '100%',
  maxWidth: '100%',
};

const VideoPlayer: React.FC<Props> = ({ media, autoPlay = true }) => {
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<any>(null);
  const hasSetTimestampRef = useRef<number | null>(null);

  const handleReady = () => {
    setIsReady(true);
  };

  const handleStart = () => {
    const seconds = Number(media.t ?? 0);
    if (
      hasSetTimestampRef.current !== (media.id ?? 0) &&
      !Number.isNaN(seconds) &&
      Number.isFinite(seconds) &&
      seconds > 0
    ) {
      hasSetTimestampRef.current = media.id ?? 0;
      playerRef.current.currentTime = seconds;
    }
  };

  useEffect(() => {
    return () => {
      hasSetTimestampRef.current = null;
    };
  }, []);

  return (
    <ReactPlayer
      key={media.id ?? 0}
      ref={playerRef}
      style={style}
      src={getBuldreinfoMediaUrlSupported(media.id ?? 0)}
      controls
      playing={autoPlay && isReady}
      playsInline
      preload='metadata'
      onReady={handleReady}
      onStart={handleStart}
    />
  );
};

export default VideoPlayer;
