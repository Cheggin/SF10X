import type { VideoSegment } from '../types'

interface VideoCardProps {
  video: VideoSegment
  onSelect: (video: VideoSegment) => void
}

function VideoCard({ video, onSelect }: VideoCardProps) {
  return (
    <div className="video-card-modern" onClick={() => onSelect(video)}>
      <div className="video-card-content">
        <div className="video-card-header">
          <div className="video-meta-primary">
            <div className="meeting-date">
              <svg className="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span className="date-text">{video.date}, 2024</span>
            </div>
            <div className="meeting-duration">
              <svg className="clock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <span className="duration-text">{video.duration}</span>
            </div>
          </div>
          <div className="play-button-container">
            <button className="play-button-modern">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="video-main-content">
          <h3 className="video-title-modern">Board of Supervisors</h3>
          
          <p className="video-summary-modern">{video.summary}</p>
        </div>

        <div className="video-card-footer">
          <div className="video-tags-modern">
            {video.tags.slice(0, 4).map((tag, index) => (
              <span key={index} className="tag-modern">
                {tag}
              </span>
            ))}
            {video.tags.length > 4 && (
              <span className="tag-more">+{video.tags.length - 4} more</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoCard