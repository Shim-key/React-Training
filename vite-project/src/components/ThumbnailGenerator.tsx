import { useEffect, useRef } from "react";
import { ThumbnailProps } from "./interface";

export const ThumbnailGenerator: React.FC<ThumbnailProps> = ({ videoUrl, onThumbnailsGenerated }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateThumbnails = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const thumbnails: string[] = [];
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        const intervals = [0.1, 0.3, 0.5, 0.7, 0.9];
        let currentIndex = 0;

        const captureFrame = () => {
          if (currentIndex >= intervals.length) {
            onThumbnailsGenerated(thumbnails);
            return;
          }
          video.currentTime = duration * intervals[currentIndex];
        };

        video.onseeked = () => {
          canvas.width = 160;
          canvas.height = 90;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          thumbnails.push(canvas.toDataURL('image/jpeg', 0.7));
          currentIndex++;
          if (currentIndex < intervals.length) {
            video.currentTime = duration * intervals[currentIndex];
          } else {
            onThumbnailsGenerated(thumbnails);
          }
        };
        captureFrame();
      };
    };

    generateThumbnails();
  }, [videoUrl, onThumbnailsGenerated]);

  return (
    <div className="hidden">
      <video ref={videoRef} src={videoUrl} crossOrigin="anonymous" />
      <canvas ref={canvasRef} />
    </div>
  );
};