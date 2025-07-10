import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { VideoFile } from '../components/interface';

// S3から動画リスト取得
export const fetchFiles = async (
  pwd: string,
  setVideos: (videos: VideoFile[]) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  setIsLoading(true);
  setError(null);
  try {
    const client = new S3Client({
      region: import.meta.env.VITE_AWS_REGION,
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
      }
    });
    const command = new ListObjectsV2Command({
      Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
      Prefix: `${pwd}/`
    });
    const response = await client.send(command);
    const files = response.Contents?.filter(obj => obj.Key && obj.Key !== `${pwd}/`) || [];

    // 署名付きURLを生成
    const videoFiles: VideoFile[] = await Promise.all(
      files.map(async obj => {
        const key = obj.Key!;
        const getObjectCommand = new GetObjectCommand({
          Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
          Key: key
        });
        const url = await getSignedUrl(client, getObjectCommand, { expiresIn: 3600 });
        return {
          name: key.replace(`${pwd}/`, ''),
          url,
          size: obj.Size ? `${(obj.Size / (1024 * 1024)).toFixed(1)} MB` : undefined,
          lastModified: obj.LastModified?.toISOString().slice(0, 10)
        };
      })
    );
    setVideos(videoFiles);
  } catch (err) {
    setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    setVideos([]);
  } finally {
    setIsLoading(false);
  }
};