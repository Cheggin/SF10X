import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchHeader from '../components/SearchHeader'
import ResultsContainer from '../components/ResultsContainer'
import PopularClips from '../components/PopularClips'
import type { VideoSegment } from '../types'

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleVideoSelect = (video: VideoSegment) => {
    navigate(`/video/${video.id}`)
  }

  return (
    <>
      <div className="search-page-container">
        <SearchHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <ResultsContainer 
          searchQuery={searchQuery}
          onVideoSelect={handleVideoSelect}
        />
      </div>
      
      {/* Show popular clips when no search query - outside container */}
      {!searchQuery && (
        <PopularClips onVideoSelect={handleVideoSelect} />
      )}
    </>
  )
}

export default SearchPage