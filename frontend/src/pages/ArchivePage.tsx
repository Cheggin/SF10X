import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadVideoDataWithMetadata } from '../data/mockData'
import type { VideoSegment } from '../types'

function ArchivePage() {
  const [videos, setVideos] = useState<VideoSegment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'views'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const navigate = useNavigate()

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const videoData = await loadVideoDataWithMetadata()
        setVideos(videoData)
      } catch (error) {
        console.error('Error loading video archive:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVideos()
  }, [])

  const handleVideoSelect = (videoId: string) => {
    navigate(`/video/${videoId}`)
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  const sortVideos = (videos: VideoSegment[]) => {
    return [...videos].sort((a, b) => {
      let compareValue = 0
      
      switch (sortBy) {
        case 'date':
          // Parse date for comparison (assuming format like "Jun 3")
          const dateA = new Date(`${a.date}, 2025`)
          const dateB = new Date(`${b.date}, 2025`)
          compareValue = dateA.getTime() - dateB.getTime()
          break
        case 'title':
          compareValue = a.title.localeCompare(b.title)
          break
        case 'views':
          // Extract numeric value from views (e.g., "2.3k views" -> 2300)
          const getViewsNumber = (views: string = '0') => {
            const match = views.match(/(\d+\.?\d*)(k?)/i)
            if (!match) return 0
            const num = parseFloat(match[1])
            return match[2].toLowerCase() === 'k' ? num * 1000 : num
          }
          compareValue = getViewsNumber(a.views) - getViewsNumber(b.views)
          break
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue
    })
  }

  const sortedVideos = sortVideos(videos)

  if (isLoading) {
    return (
      <div className="archive-page">
        <div className="archive-header">
          <h1>Loading archive...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="archive-page">
      {/* Archive Header */}
      <div className="archive-header">
        <div className="archive-header-content">
          <button className="archive-back-btn" onClick={handleBackToHome}>
            SFGovTV++
          </button>
          <div className="archive-title-section">
            <h1 className="archive-title">Meeting Archive</h1>
            <p className="archive-subtitle">Complete collection of Board of Supervisors meetings</p>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="archive-controls">
        <div className="archive-controls-content">
          <div className="sort-controls">
            <label htmlFor="sort-by">Sort by:</label>
            <select 
              id="sort-by"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'views')}
              className="sort-select"
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="views">Views</option>
            </select>
            
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-order-btn"
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          
          <div className="archive-stats">
            <span className="video-count">{videos.length} meetings</span>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="archive-content">
        <div className="archive-video-grid">
          {sortedVideos.map((video) => (
            <div 
              key={video.id}
              className="archive-video-card"
              onClick={() => handleVideoSelect(video.id)}
            >
              <div className="archive-video-thumbnail">
                <img 
                  src={`/thumbnails/${video.id}.jpg`}
                  alt={`Thumbnail for ${video.title}`}
                  className="archive-thumbnail-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling;
                    if (placeholder) placeholder.setAttribute('style', 'display: flex');
                  }}
                />
                <div className="archive-thumbnail-placeholder" style={{ display: 'none' }}>
                  <svg className="play-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
                <span className="archive-duration-badge">{video.duration}</span>
              </div>
              
              <div className="archive-video-content">
                <h3 className="archive-video-title">{video.title}</h3>
                <div className="archive-video-meta">
                  <span className="archive-video-date">{video.date}, 2025</span>
                  <span className="meta-separator">•</span>
                  <span className="archive-video-views">{video.views || '0 views'}</span>
                </div>
                <p className="archive-video-summary">{video.summary}</p>
                <div className="archive-video-tags">
                  {video.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="archive-tag">
                      {tag}
                    </span>
                  ))}
                  {video.tags.length > 3 && (
                    <span className="archive-tag-more">+{video.tags.length - 3}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ArchivePage