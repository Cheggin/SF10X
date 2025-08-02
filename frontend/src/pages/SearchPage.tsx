import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchHeader from '../components/SearchHeader'
import ResultsContainer from '../components/ResultsContainer'
import type { VideoSegment } from '../types'

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleVideoSelect = (video: VideoSegment) => {
    navigate(`/video/${video.id}`)
  }

  return (
    <>
      <SearchHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ResultsContainer 
        searchQuery={searchQuery}
        onVideoSelect={handleVideoSelect}
      />
    </>
  )
}

export default SearchPage