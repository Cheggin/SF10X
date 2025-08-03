import { getPopularVideos } from '../data/mockData'
import type { VideoSegment } from '../types'

interface PopularClipsProps {
  onVideoSelect: (video: VideoSegment) => void
}

function PopularClips({ onVideoSelect }: PopularClipsProps) {
  const popularVideos = getPopularVideos()

  return (
    <section className="popular-clips-sidebar">
      <div className="popular-clips-header">
        <h2 className="popular-clips-title-sidebar">Featured Discussions</h2>
        <p className="popular-clips-subtitle-sidebar">Recent highlights from Board meetings</p>
      </div>
      
      <div className="popular-clips-list">
        {popularVideos.map((video) => (
          <div 
            key={video.id}
            className="popular-clip-card-sidebar"
            onClick={() => onVideoSelect(video)}
          >
            <div className="clip-header-sidebar">
              <div className="clip-meta-sidebar">
                <span className="clip-date-sidebar">{video.date}</span>
                <span className="clip-duration-sidebar">{video.duration}</span>
              </div>
              <button className="clip-play-btn-sidebar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              </button>
            </div>
            
            <div className="clip-content-sidebar">
              <h3 className="clip-title-sidebar">{video.title}</h3>
              <p className="clip-summary-sidebar">{video.summary}</p>
              
              <div className="clip-tags-sidebar">
                {video.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="clip-tag-sidebar">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default PopularClips