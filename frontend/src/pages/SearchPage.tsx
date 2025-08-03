import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockVideoData, getPopularVideos, loadVideoDataWithMetadata, getMostWatchedVideos } from '../data/mockData'
import { fetchSummary } from '../services/api'
import type { VideoSegment } from '../types'
import VideoThumbnail from '../components/VideoThumbnail'

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [displayedResults, setDisplayedResults] = useState<VideoSegment[]>(mockVideoData)
  const [videoData, setVideoData] = useState<VideoSegment[]>(mockVideoData)
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [summariesLoaded, setSummariesLoaded] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const navigate = useNavigate()

  const handleVideoSelect = (videoId: string, startTime?: number) => {
    navigate(`/video/${videoId}`, { state: { startTime } })
  }

  const handleAIModeClick = () => {
    navigate('/ai')
  }

  const handleArchiveClick = () => {
    navigate('/archive')
  }

  // Load real video metadata and summaries from API
  useEffect(() => {
    const loadVideoDataAndSummaries = async () => {
      if (summariesLoaded) return
      
      try {
        // First load video data with real metadata
        const videoDataWithMetadata = await loadVideoDataWithMetadata()
        
        // Then load summaries and tags from API
        const updatedVideoData = await Promise.all(
          videoDataWithMetadata.map(async (video) => {
            try {
              const summaryResponse = await fetchSummary(video.clipId || video.id, video.viewId || '10')
              return {
                ...video,
                summary: summaryResponse.meeting_summary || video.summary,
                // Add API tags to existing tags (avoid duplicates)
                tags: summaryResponse.tags 
                  ? [...new Set([...video.tags, ...summaryResponse.tags])]
                  : video.tags
              }
            } catch (error) {
              console.error(`Failed to load summary for video ${video.id}:`, error)
              return video // Keep original data if fetch fails
            }
          })
        )
        
        setVideoData(updatedVideoData)
        setDisplayedResults(updatedVideoData)
        setSummariesLoaded(true)
      } catch (error) {
        console.error('Error loading video data and summaries:', error)
        // Fallback to original mock data
        setVideoData(mockVideoData)
        setDisplayedResults(mockVideoData)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadVideoDataAndSummaries()
  }, [])

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    setShowResults(true)
    
    // Simulate API call
    setTimeout(() => {
      // Filter meetings based on search query using videoData with real summaries
      const filtered = videoData.filter(video => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setDisplayedResults(filtered)
      setIsLoading(false)
    }, 500)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleReturnHome = () => {
    setShowResults(false)
    setSearchQuery('')
    setDisplayedResults(videoData)
  }

  // Use mock data directly for Most Watched section (no API calls)
  const featuredDiscussions = getMostWatchedVideos()


  // Show different layouts based on whether we're showing search results
  if (showResults) {
    return (
      <div className="search-results-page">
        {/* Search Results Header */}
        <div className="search-results-header">
          <div className="header-container">
            <button className="logo-button" onClick={handleReturnHome}>
              <span className="logo-text">SFGovTV++</span>
            </button>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="search-form-header">
              <div className="search-input-group-header">
                <svg 
                  className="search-icon-header" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="search-input-header"
                  placeholder="Search meetings..."
                />
                <button type="submit" className="search-button-header">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Search Results Content */}
        <div className="search-results-container">
          <div className="results-info">
            <p className="results-count">
              {displayedResults.length} results found for "{searchQuery}"
            </p>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Searching meetings...</p>
            </div>
          ) : displayedResults.length === 0 ? (
            <div className="no-results">
              <h3>No results found</h3>
              <p>Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className="results-list">
              {displayedResults.map((result) => (
                <div 
                  key={result.id}
                  className="search-result-item"
                  onClick={() => handleVideoSelect(result.id)}
                >
                  <div className="result-left">
                    <div className="result-thumbnail-small">
                      <img 
                        src={`/thumbnails/${result.id}.jpg`}
                        alt={`Thumbnail for ${result.title}`}
                        className="thumbnail-image"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling;
                          if (placeholder) placeholder.setAttribute('style', 'display: flex');
                        }}
                      />
                      <div className="thumbnail-placeholder" style={{ display: 'none' }}>
                        <svg className="play-icon w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                      <span className="duration-badge-small">{result.duration}</span>
                    </div>
                  </div>
                  
                  <div className="result-content-full">
                    <h3 className="result-title-search">{result.title}</h3>
                    <div className="result-meta-search">
                      <span className="result-date">{result.date}</span>
                      <span className="meta-separator">•</span>
                      <span className="result-speakers">
                        {result.speakers.slice(0, 2).join(', ')}
                        {result.speakers.length > 2 && ` +${result.speakers.length - 2}`}
                      </span>
                      <span className="meta-separator">•</span>
                      <span className="result-views">{result.views || '847 views'}</span>
                    </div>
                    <p className="result-summary-search">{result.summary}</p>
                    <div className="result-tags-search">
                      {result.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag tag-default tag-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Home page layout
  return (
    <div className="google-style-homepage">
      <div className="homepage-container">
        {/* Google-style centered header section */}
        <div className="centered-header">
          <h1 className="main-title">SFGovTV++</h1>
          <p className="main-subtitle">Search San Francisco city council meeting archives</p>
          
          {/* Search bar */}
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="search-form-centered">
            <div className="search-input-group-centered">
              <svg 
                className="search-icon-centered" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search meeting topics, descriptions, or agenda items..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="search-input-centered"
              />
              <button type="submit" className="search-button-centered">
                Search
              </button>
              <button 
                type="button" 
                className="ai-mode-button"
                onClick={handleAIModeClick}
                title="AI Mode"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                </svg>
                <span className="ai-mode-text">AI</span>
              </button>
            </div>
          </form>

          {/* Action buttons */}
          <div className="homepage-actions">
            <button 
              className="homepage-action-btn"
              onClick={handleArchiveClick}
              title="View all meetings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v4H3zM3 7h18v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
                <path d="M8 11h8M8 15h5"/>
              </svg>
              <span>Browse Archive</span>
            </button>
          </div>
        </div>

        {/* Most Watched Section */}
        <div className="featured-discussions-section">
          <h2 className="section-title">Most Watched</h2>
          <div className="featured-discussions-grid">
            {featuredDiscussions.map((discussion) => (
              <div 
                key={discussion.id}
                className="featured-discussion-card"
                onClick={() => handleVideoSelect(discussion.id, discussion.startTime)}
              >
                <div className="featured-thumbnail">
                  <VideoThumbnail
                    videoId={discussion.id}
                    videoUrl={discussion.videoUrl}
                    timestamp={discussion.startTime}
                    alt={`Thumbnail for ${discussion.title}`}
                    className="thumbnail-image"
                    fallbackSrc={`/thumbnails/${discussion.id}.jpg`}
                  />
                  <span className="duration-badge">{discussion.duration}</span>
                </div>
                <div className="featured-content">
                  <h3 className="featured-title">{discussion.title}</h3>
                  <div className="featured-meta">
                    <span className="featured-date">{discussion.date}</span>
                    <span className="meta-separator">•</span>
                    <span className="featured-views">{discussion.views}</span>
                  </div>
                  {discussion.summary && (
                    <p className="featured-summary">{discussion.summary}</p>
                  )}
                  <div className="featured-tags">
                    {discussion.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="tag tag-secondary tag-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default SearchPage