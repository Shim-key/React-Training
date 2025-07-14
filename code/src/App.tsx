import './App.css'
import Header from './components/Header'
import { S3VideoDownloader } from './components/s3-video-downloader'

function App() {
  return (
    <>
      <Header />
      <S3VideoDownloader />
    </>
  )
}

export default App