export interface VideoFile {
  name: string;
  url: string;
  size?: string;
  lastModified?: string;
}

export interface ThumbnailProps {
  videoUrl: string;
  onThumbnailsGenerated: (thumbnails: string[]) => void;
}