import { useRef, useCallback } from 'react';

interface MultiVideoPlayerProps {
  videoUrls: string[];
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  controls?: boolean;
}

export const MultiVideoPlayer = ({
  videoUrls,
  className,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  controls = false,
}: MultiVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const indexRef = useRef(0);

  const handleEnded = useCallback(() => {
    if (videoUrls.length <= 1) {
      // Single video: restart it (loop behavior)
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
      return;
    }

    // Multiple videos: advance to next
    const nextIndex = (indexRef.current + 1) % videoUrls.length;
    indexRef.current = nextIndex;
    if (videoRef.current) {
      videoRef.current.src = videoUrls[nextIndex];
      videoRef.current.play();
    }
  }, [videoUrls]);

  if (videoUrls.length === 0) return null;

  return (
    <video
      ref={videoRef}
      src={videoUrls[0]}
      className={className}
      autoPlay={autoPlay}
      muted={muted}
      playsInline={playsInline}
      controls={controls}
      onEnded={handleEnded}
    />
  );
};
