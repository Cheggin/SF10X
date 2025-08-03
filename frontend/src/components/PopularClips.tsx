import { getPopularVideos } from '../data/mockData'
import type { VideoSegment } from '../types'

interface PopularClipsProps {
  onVideoSelect: (video: VideoSegment) => void
}

function PopularClips({ onVideoSelect }: PopularClipsProps) {
  const popularVideos = getPopularVideos()

  return (
    <section className="popular-clips">
      <div className="popular-clips-container">
        <h2 className="popular-clips-title">Featured Discussions</h2>
        <p className="popular-clips-subtitle">Explore the most important moments and decisions from recent San Francisco council meetings</p>
        
        <div className="popular-clips-grid">
          {popularVideos.map((video) => (
            <div 
              key={video.id}
              className="popular-clip-card"
              onClick={() => onVideoSelect(video)}
            >
              <div className="popular-clip-thumbnail">
                <div className="thumbnail-placeholder">
                  <span className="play-icon">▶</span>
                </div>
                <div className="clip-duration">{video.duration}</div>
              </div>
              
              <div className="popular-clip-content">
                <h3 className="popular-clip-title">{video.title}</h3>
                <p className="popular-clip-date">{video.date}, 2024</p>
                <p className="popular-clip-summary">{video.summary}</p>
                
                <div className="popular-clip-tags">
                  {video.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="popular-clip-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularClips