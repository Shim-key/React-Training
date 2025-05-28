import { useState, useEffect } from 'react'
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'

const Hello = () => {
  const [files, setFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

    useEffect(() => {
    const fetchFiles = async () => {
      try {
        const client = new S3Client({
          region: import.meta.env.VITE_AWS_REGION,
          credentials: {
            accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
            secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
          }
        })

        const command = new ListObjectsV2Command({
          Bucket: import.meta.env.VITE_AWS_BUCKET_NAME
        })

        const response = await client.send(command)
        const fileNames = response.Contents?.map(file => file.Key || '') || []
        setFiles(fileNames)
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [])

    const handleDownload = async (fileName: string) => {
    try {
      const client = new S3Client({
        region: import.meta.env.VITE_AWS_REGION,
        credentials: {
          accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
        }
      })

      const command = new GetObjectCommand({
        Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
        Key: fileName
      })

      const response = await client.send(command)
      
      if (response.Body) {
        // ストリームをBlobに変換
        const blob = await response.Body.transformToByteArray()
        const url = window.URL.createObjectURL(new Blob([blob]))
        
        // ダウンロードリンクを作成
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        
        // クリーンアップ
        link.remove()
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ダウンロード中にエラーが発生しました')
    }
  }

  if (loading) return <div>読み込み中...</div>
  if (error) return <div>エラー: {error}</div>

  return (
    <div>
      <p className="text-[60px]">S3のファイル一覧</p>
      <ul>
        {files.map((fileName, index) => (
          <li key={index}>
            <button className="p-2 m-2" onClick={() => handleDownload(fileName)}>
              {fileName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Hello