import { VideoFile } from "./interface";

export const fetchFiles = async (
  pwd: string,
  setVideos: (videos: VideoFile[]) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch(`/api/list-files?pwd=${encodeURIComponent(pwd)}`);
    if (!response.ok) throw new Error('APIリクエストに失敗しました');
    const videoFiles: VideoFile[] = await response.json();
    setVideos(videoFiles);
  } catch (err) {
    setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    setVideos([]);
  } finally {
    setIsLoading(false);
  }
};