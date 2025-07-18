import React, { useState, useEffect, useRef } from 'react';
import { FileVideo, Search, Grid, List } from 'lucide-react';
import { VideoFile } from './interface';
import { VideoCard } from './VideoCard';
import { fetchFiles } from './fetchFiles';

export const S3VideoDownloader: React.FC = () => {
  const [password, setPassword] = useState('');
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (password && password.length === 16) {
      fetchFiles(password, setVideos, setError);
    } else {
      setVideos([]);
    }
    // eslint-disable-next-line
  }, [password]);

  // 検索
  const filteredVideos = videos.filter(video =>
    video.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // S3から動画をダウンロード
  const handleDownload = async (video: VideoFile) => {
    try {
      setDownloadProgress(0);
      setElapsedTime(0);
      setEstimatedTime(null);
      startTimeRef.current = Date.now();

      // 経過時間タイマー開始
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);

      const response = await fetch(video.url);
      if (!response.ok) throw new Error('ファイルの取得に失敗しました');
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      const reader = response.body?.getReader();
      let received = 0;
      const chunks = [];
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
          if (total) {
            const progress = Math.round((received / total) * 100);
            setDownloadProgress(progress);

            // 残り時間推定
            const now = Date.now();
            const elapsed = (now - startTimeRef.current) / 1000; // 秒
            if (progress > 0) {
              const estimatedTotal = elapsed / (progress / 100);
              const remaining = estimatedTotal - elapsed;
              setEstimatedTime(Math.max(0, Math.round(remaining)));
            }
          }
        }
      }
      const blob = new Blob(chunks);
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
      setDownloadProgress(null);
      setEstimatedTime(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setElapsedTime(0);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pt-16">
      {/* モーダル */}
      {downloadProgress !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg w-80 text-center">
            <h3 className="text-lg font-bold mb-4 text-purple-700">ダウンロード中...</h3>
            <div className="w-full bg-purple-100 rounded-full h-4 mb-4">
              <div
                className="bg-purple-500 h-4 rounded-full transition-all"
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
            <span className="text-purple-700">{downloadProgress}%</span>
            <div className="mt-4 text-purple-700 text-sm">
              経過時間: {elapsedTime}s<br />
              残り時間(推定): {estimatedTime !== null ? `${estimatedTime}s` : '--'}
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl w-full mx-auto sm:px-4 px-2 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="sm:text-3xl text-2xl font-bold text-white mb-2">
                Mickory's Library
              </h1>
              <p className="text-white/70 text-sm sm:text-base">
                パスワードを入力してダウンロード
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {/* パスワード入力欄 */}
              <input
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-4 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm w-full sm:w-auto"
              />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="動画を検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm w-full sm:w-auto"
                  disabled={!password}
                />
              </div>
              
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg self-center">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors bg-purple-500 ${
                    viewMode === 'grid' 
                      ? 'text-white' 
                      : 'hover:text-white hover:bg-white/10'
                  }`}
                  disabled={!password}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors bg-purple-500 ${
                    viewMode === 'list' 
                      ? 'text-white' 
                      : 'hover:text-white hover:bg-white/10'
                  }`}
                  disabled={!password}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl w-full mx-auto sm:px-4 px-2 py-8">
        {!password ? (
          <div className="text-center py-12">
            <FileVideo className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white/80 mb-2">
              パスワードを入力してください
            </h3>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <FileVideo className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white/80 mb-2">
              エラー: {error}
            </h3>
          </div>
        ) : filteredVideos.length === 0 ? (
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
            </div>

            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredVideos.map((video, index) => (
                <VideoCard
                  key={index}
                  video={{
                    ...video,
                    // S3の動画URLはダウンロード時に取得するため空文字
                    url: video.url
                  }}
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