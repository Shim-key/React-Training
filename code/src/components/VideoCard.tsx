import { useEffect, useState } from "react";
import { VideoFile } from "./interface";
import { Download, FileVideo } from "lucide-react";
import { ThumbnailGenerator } from "./ThumbnailGenerator";


export const VideoCard: React.FC<{
  video: VideoFile;
  onDownload: (video: VideoFile) => void;
  viewMode: 'grid' | 'list';
}> = ({ video, onDownload, viewMode }) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [currentThumbnail, setCurrentThumbnail] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // サムネイル自動切り替え
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isHovered && thumbnails.length > 1) {
      interval = setInterval(() => {
        setCurrentThumbnail((prev) => (prev + 1) % thumbnails.length);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isHovered, thumbnails.length]);

  const handleThumbnailsGenerated = (newThumbnails: string[]) => {
    setThumbnails(newThumbnails);
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
        <div className="flex items-center gap-4">
          <div 
            className="relative w-24 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex-shrink-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setCurrentThumbnail(0);
            }}
          >
            {thumbnails.length > 0 ? (
              <img
                src={thumbnails[currentThumbnail]}
                alt={`${video.name} thumbnail`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileVideo className="w-6 h-6 text-white/60" />
              </div>
            )}
            {thumbnails.length > 1 && isHovered && (
              <div className="absolute bottom-1 right-1 flex gap-0.5">
                {thumbnails.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1 h-1 rounded-full ${
                      index === currentThumbnail ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm truncate">{video.name}</h3>
            <div className="flex items-center gap-4 mt-1 text-xs text-white/60">
              {video.size && <span>{video.size}</span>}
              {video.lastModified && <span>{video.lastModified}</span>}
            </div>
          </div>
          
          <button
            onClick={() => onDownload(video)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
        
        <ThumbnailGenerator
          videoUrl={video.url}
          onThumbnailsGenerated={handleThumbnailsGenerated}
        />
      </div>
    );
  }

  return (
    <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02]">
      <div 
        className="relative aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setCurrentThumbnail(0);
        }}
      >
        {thumbnails.length > 0 ? (
          <img
            src={thumbnails[currentThumbnail]}
            alt={`${video.name} thumbnail`}
            className="w-full h-full object-cover transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileVideo className="w-12 h-12 text-white/60" />
          </div>
        )}
        
        {thumbnails.length > 1 && isHovered && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
            {thumbnails.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentThumbnail ? 'bg-white scale-110' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button
            onClick={() => onDownload(video)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
          >
            <Download className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-medium text-sm mb-2 line-clamp-2 leading-tight">
          {video.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-white/60">
          <div className="flex flex-col gap-1">
            {video.size && <span>{video.size}</span>}
            {video.lastModified && <span>{video.lastModified}</span>}
          </div>
        </div>
      </div>
      
      <ThumbnailGenerator
        videoUrl={video.url}
        onThumbnailsGenerated={handleThumbnailsGenerated}
      />
    </div>
  );
};
