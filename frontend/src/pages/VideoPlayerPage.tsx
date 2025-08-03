import { useParams, useNavigate, useLocation } from 'react-router-dom'
import VideoPlayerPage from '../components/VideoPlayerPage'
import { getVideoById, loadVideoDataWithMetadata } from '../data/mockData'
import { useState, useEffect } from 'react'
import type { VideoSegment } from '../types'

function VideoPlayerPageRoute() {
  const { videoId } = useParams<{ videoId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const startTime = location.state?.startTime
  const [video, setVideo] = useState<VideoSegment | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadVideo = async () => {
      if (!videoId) {
        setIsLoading(false)
        return
      }

      try {
        // Load video data with real metadata
        const videoDataWithMetadata = await loadVideoDataWithMetadata()
        const foundVideo = videoDataWithMetadata.find(v => v.id === videoId)
        setVideo(foundVideo)
      } catch (error) {
        console.error('Error loading video data:', error)
        // Fallback to basic video data
        const fallbackVideo = getVideoById(videoId)
        setVideo(fallbackVideo)
      } finally {
        setIsLoading(false)
      }
    }

    loadVideo()
  }, [videoId])

  if (isLoading) {
    return (
      <div className="video-player-page">
        <div className="player-header">
          <h1>Loading video...</h1>
        </div>
      </div>
    )
  }

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