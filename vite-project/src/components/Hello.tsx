import { useState, useEffect } from 'react'
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'

const Hello = () => {
  const [password, setPassword] = useState('')
  const [files, setFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFiles = async () => {
      if (!password) {
        setFiles([])
        setLoading(false)
        return
      }

      try {
        const client = new S3Client({
          region: import.meta.env.VITE_AWS_REGION,
          credentials: {
            accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
            secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
          }
        })

        const command = new ListObjectsV2Command({
          Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
          Prefix: `${password}/` // パスワードをプレフィックスとして使用
        })

        const response = await client.send(command)
        const fileNames = response.Contents?.map(file => file.Key || '')
          .filter(key => key !== `${password}/`) || [] // フォルダ自体は除外
        setFiles(fileNames)
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [password]) // パスワードが変更されたときに再取得

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
      
      if (!response.Body) {
        throw new Error('ファイルの内容が空です')
      }

      // レスポンスをBlobに変換
      const blob = await response.Body.transformToBlob()
      
      // ダウンロードリンクを作成
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // ファイル名からパスワードフォルダを除去
      a.download = fileName.replace(`${password}/`, '')
      document.body.appendChild(a)
      a.click()
      
      // クリーンアップ
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('ダウンロードエラー:', err)
      alert('ファイルのダウンロードに失敗しました')
    }
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワードを入力"
          className="p-2 border rounded"
        />
      </div>

      {password ? (
        <>
          {loading ? (
            <div>読み込み中...</div>
          ) : error ? (
            <div>エラー: {error}</div>
          ) : (
            <>
            <p className="text-[60px]">List</p>
            <ul>
              {files.map((fileName, index) => (
                <li key={index}>
                  <button className="p-2 m-2" onClick={() => handleDownload(fileName)}>
                    {fileName.replace(`${password}/`, '')}
                  </button>
                </li>
              ))}
            </ul>
            </>
          )}
        </>
      ) : (
        <p>パスワードを入力してください</p>
      )}
    </div>
  )
}

export default Hello