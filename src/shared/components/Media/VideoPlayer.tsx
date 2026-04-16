import { useRef, useState, useEffect, type FC, type MouseEvent } from 'react';
import ReactPlayer from 'react-player';
import type { components } from '../../../@types/buldreinfo/swagger';
import { getMediaFileUrl, mediaIdentityId, mediaIdentityVersionStamp } from '../../../api';

type Props = {
  media: components['schemas']['Media'];
  autoPlay?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const VideoPlayer: FC<Props> = ({ media, autoPlay = true, className, style }) => {
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasSetTimestampRef = useRef<number | null>(null);

  const handleReady = () => {
    setIsReady(true);
  };

  const handleStart = () => {
    const seconds = Number(media.t ?? 0);

    if (
      hasSetTimestampRef.current !== mediaIdentityId(media.identity) &&
      !Number.isNaN(seconds) &&
      Number.isFinite(seconds) &&
      seconds > 0 &&
      videoRef.current
    ) {
      hasSetTimestampRef.current = mediaIdentityId(media.identity);
      videoRef.current.currentTime = seconds;
    }
  };

  useEffect(() => {
    return () => {
      hasSetTimestampRef.current = null;
    };
  }, []);

  return (
    <ReactPlayer
      key={mediaIdentityId(media.identity)}
      ref={videoRef}
      className={className}
      style={style}
      src={getMediaFileUrl(mediaIdentityId(media.identity), mediaIdentityVersionStamp(media.identity), true)}
      controls
      width='100%'
      height='100%'
      playing={autoPlay && isReady}
      playsInline
      onReady={handleReady}
      onStart={handleStart}
      onClick={(e: MouseEvent) => e.stopPropagation()}
    />
  );
};

export default VideoPlayer;
