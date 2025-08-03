import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchCard from '../components/homepage/SearchCard'
import FeaturedDiscussionsCard from '../components/homepage/FeaturedDiscussionsCard'
import MeetingResultsCard from '../components/homepage/MeetingResultsCard'
import { mockVideoData, getPopularVideos } from '../data/mockData'
import type { VideoSegment } from '../types'

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [displayedResults, setDisplayedResults] = useState<VideoSegment[]>(mockVideoData)
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()

  const handleVideoSelect = (videoId: string) => {
    navigate(`/video/${videoId}`)
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    setShowResults(true)
    
    // Simulate API call
    setTimeout(() => {
      // Filter meetings based on search query
      const filtered = mockVideoData.filter(video => 
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
    setDisplayedResults(mockVideoData)
  }

  // Transform popular videos for FeaturedDiscussionsCard
  const featuredDiscussions = getPopularVideos().map(video => ({
    id: video.id,
    title: video.title,
    duration: video.duration,
    date: video.date,
    tags: video.tags,
    views: '1.2k views' // Mock view count
  }))

  // Transform displayed results for MeetingResultsCard
  const meetingResults = displayedResults.map(video => ({
    id: video.id,
    title: video.title,
    date: video.date,
    duration: video.duration,
    speakers: video.speakers,
    summary: video.summary,
    tags: video.tags,
    views: '847 views' // Mock view count
  }))

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
                      <span className="result-views">{result.views}</span>
                    </div>
                    <p className="result-summary-search">{result.summary}</p>
                    <div className="result-tags-search">
                      {result.tags.map((tag, index) => (
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
            </div>
          </form>
        </div>

        {/* Featured Discussions Section */}
        <div className="featured-discussions-section">
          <h2 className="section-title">Featured Discussions</h2>
          <div className="featured-discussions-grid">
            {featuredDiscussions.map((discussion) => (
              <div 
                key={discussion.id}
                className="featured-discussion-card"
                onClick={() => handleVideoSelect(discussion.id)}
              >
                <div className="featured-thumbnail">
                  <img 
                    src={`/thumbnails/${discussion.id}.jpg`}
                    alt={`Thumbnail for ${discussion.title}`}
                    className="thumbnail-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder = target.nextElementSibling;
                      if (placeholder) placeholder.setAttribute('style', 'display: flex');
                    }}
                  />
                  <div className="thumbnail-placeholder" style={{ display: 'none' }}>
                    <svg className="play-icon w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                  <span className="duration-badge">{discussion.duration}</span>
                </div>
                <div className="featured-content">
                  <h3 className="featured-title">{discussion.title}</h3>
                  <div className="featured-meta">
                    <span className="featured-date">{discussion.date}</span>
                    <span className="meta-separator">•</span>
                    <span className="featured-views">{discussion.views}</span>
                  </div>
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