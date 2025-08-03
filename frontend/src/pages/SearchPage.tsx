import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchHeader from '../components/SearchHeader'
import ResultsContainer from '../components/ResultsContainer'
import PopularClips from '../components/PopularClips'
import type { VideoSegment } from '../types'

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const navigate = useNavigate()

  const handleVideoSelect = (video: VideoSegment) => {
    navigate(`/video/${video.id}`)
  }

  return (
    <div className="search-page-container">
      <div className="home-page-grid">
        <div className="left-column">
          <SearchHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            selectedTopic={selectedTopic}
            onTopicChange={setSelectedTopic}
          />
          
          <ResultsContainer 
            searchQuery={searchQuery}
            startDate={startDate}
            endDate={endDate}
            selectedTopic={selectedTopic}
            onVideoSelect={handleVideoSelect}
          />
        </div>
        
        <div className="right-column">
          <PopularClips onVideoSelect={handleVideoSelect} />
        </div>
      </div>
    </div>
  )
}

export default SearchPage