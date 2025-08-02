import type { VideoSegment } from '../types'

interface VideoCardProps {
  video: VideoSegment
  onSelect: (video: VideoSegment) => void
}

function VideoCard({ video, onSelect }: VideoCardProps) {
  return (
    <div className="video-card" onClick={() => onSelect(video)}>
      <div className="video-card-header">
        <span className="play-button">▶️</span>
        <div className="video-meta">
          <span className="video-date">{video.date}</span>
          <span className="video-duration">• {video.duration}</span>
          <span className="video-speakers">• {video.speakers.join(', ')}</span>
        </div>
      </div>
      
      <h3 className="video-title">{video.title}</h3>
      
      <p className="video-summary">{video.summary}</p>
      
      <div className="video-tags">
        {video.tags.map((tag, index) => (
          <span key={index} className="tag">
            🏷️ {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export default VideoCard