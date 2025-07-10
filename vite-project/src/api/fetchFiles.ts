import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { pwd } = req.query;

  if (!pwd || typeof pwd !== 'string') {
    return res.status(400).json({ error: 'Invalid folder name' });
  }

  const client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  });

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Prefix: `${pwd}/`
    });
    const response = await client.send(command);

    const files = response.Contents?.filter(obj => obj.Key && obj.Key !== `${pwd}/`) || [];

    const videoFiles = await Promise.all(
      files.map(async obj => {
        const key = obj.Key!;
        const getObjectCommand = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
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

    res.status(200).json(videoFiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'S3 fetch failed' });
  }
}