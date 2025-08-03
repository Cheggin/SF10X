import { useParams, useNavigate, useLocation } from 'react-router-dom'
import VideoPlayerPage from '../components/VideoPlayerPage'
import { getVideoById } from '../data/mockData'

function VideoPlayerPageRoute() {
  const { videoId } = useParams<{ videoId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const startTime = location.state?.startTime
  
  const video = videoId ? getVideoById(videoId) : undefined

  if (!video) {
    return (
      <div className="video-player-page">
        <div className="player-header">
          <h1>Video not found</h1>
          <button onClick={() => navigate('/')}>
            ← Back to Search
          </button>
        </div>
      </div>
    )
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <VideoPlayerPage 
      video={video}
      onBack={handleBack}
      startTime={startTime}
    />
  )
}

export default VideoPlayerPageRoute