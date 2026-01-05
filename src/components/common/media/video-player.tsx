import { useRef, useState, useEffect, FC } from 'react';
import ReactPlayer from 'react-player';
import { components } from '../../../@types/buldreinfo/swagger';
import { getBuldreinfoMediaUrlSupported } from '../../../api';

type Props = {
  media: components['schemas']['Media'];
  autoPlay?: boolean;
  style?: React.CSSProperties;
};

const VideoPlayer: FC<Props> = ({ media, autoPlay = true, style }) => {
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<HTMLVideoElement>(null);
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
      seconds > 0 &&
      playerRef.current
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
      onClick={(e) => e.stopPropagation()}
    />
  );
};

export default VideoPlayer;
