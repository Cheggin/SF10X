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
  const navigate = useNavigate()

  const handleVideoSelect = (videoId: string) => {
    navigate(`/video/${videoId}`)
  }

  const handleSearch = () => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      if (!searchQuery.trim()) {
        // If no search query, show all meetings
        setDisplayedResults(mockVideoData)
      } else {
        // Filter meetings based on search query
        const filtered = mockVideoData.filter(video => 
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        setDisplayedResults(filtered)
      }
      setIsLoading(false)
    }, 500)
  }

  // Also filter when search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      // If search is cleared, show all meetings immediately
      setDisplayedResults(mockVideoData)
    }
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

  return (
    <div className="modern-search-page">
      <div className="modern-search-container">
        <SearchCard 
          title="San Francisco Council Search"
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
        />
        
        <div className="search-content-grid">
          <div className="search-results-section">
            <MeetingResultsCard 
              results={meetingResults}
              onResultClick={handleVideoSelect}
              isLoading={isLoading}
              hasSearched={true}
              searchQuery={searchQuery}
            />
          </div>
          
          <div className="featured-section">
            <FeaturedDiscussionsCard 
              discussions={featuredDiscussions}
              onDiscussionClick={handleVideoSelect}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchPage