import { useParams, useNavigate } from 'react-router-dom'
import VideoDetail from '../components/VideoDetail'
import { getVideoById } from '../data/mockData'

function VideoDetailPage() {
  const { videoId } = useParams<{ videoId: string }>()
  const navigate = useNavigate()
  
  const video = videoId ? getVideoById(videoId) : undefined

  if (!video) {
    return (
      <div className="video-detail">
        <div className="detail-content">
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

  const handleWatchVideo = () => {
    navigate(`/video/${videoId}/watch`)
  }

  return (
    <VideoDetail 
      video={video}
      onBack={handleBack}
      onWatchVideo={handleWatchVideo}
    />
  )
}

export default VideoDetailPage