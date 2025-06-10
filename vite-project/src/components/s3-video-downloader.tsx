import React, { useState, useRef, useEffect } from 'react';
import { Download, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, FileVideo, Search, Grid, List } from 'lucide-react';

interface VideoFile {
  name: string;
  url: string;
  size?: string;
  lastModified?: string;
}

interface ThumbnailProps {
  videoUrl: string;
  onThumbnailsGenerated: (thumbnails: string[]) => void;
}

const ThumbnailGenerator: React.FC<ThumbnailProps> = ({ videoUrl, onThumbnailsGenerated }) => {
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
        const intervals = [0.1, 0.3, 0.5, 0.7, 0.9]; // 10%, 30%, 50%, 70%, 90%
        
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

const VideoCard: React.FC<{
  video: VideoFile;
  onDownload: (video: VideoFile) => void;
  viewMode: 'grid' | 'list';
}> = ({ video, onDownload, viewMode }) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [currentThumbnail, setCurrentThumbnail] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleThumbnailsGenerated = (newThumbnails: string[]) => {
    setThumbnails(newThumbnails);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && thumbnails.length > 1) {
      interval = setInterval(() => {
        setCurrentThumbnail((prev) => (prev + 1) % thumbnails.length);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isHovered, thumbnails.length]);

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

const S3VideoDownloader: React.FC = () => {
  const [videos, setVideos] = useState<VideoFile[]>([
    {
      name: "sample_video_1.mp4",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      size: "158 MB",
      lastModified: "2024-01-15"
    },
    {
      name: "sample_video_2.mp4", 
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      size: "245 MB",
      lastModified: "2024-01-10"
    },
    {
      name: "sample_video_3.mp4",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      size: "112 MB", 
      lastModified: "2024-01-08"
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);

  const filteredVideos = videos.filter(video =>
    video.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (video: VideoFile) => {
    try {
      setIsLoading(true);
      const response = await fetch(video.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = video.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('ダウンロードに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                S3 Video Library
              </h1>
              <p className="text-white/70">
                動画ファイルをプレビューしてダウンロード
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="動画を検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <FileVideo className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white/80 mb-2">
              動画が見つかりませんでした
            </h3>
            <p className="text-white/60">
              検索条件を変更して再度お試しください
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {filteredVideos.length} 件の動画
              </h2>
              {isLoading && (
                <div className="flex items-center gap-2 text-white/60">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>ダウンロード中...</span>
                </div>
              )}
            </div>

            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredVideos.map((video, index) => (
                <VideoCard
                  key={index}
                  video={video}
                  onDownload={handleDownload}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default S3VideoDownloader;