import type { VideoSegment } from '../types'
import VideoCard from './VideoCard'
import { mockVideoData } from '../data/mockData'

interface ResultsContainerProps {
  searchQuery: string
  onVideoSelect: (video: VideoSegment) => void
}

function ResultsContainer({ searchQuery, onVideoSelect }: ResultsContainerProps) {
  const filteredVideos = mockVideoData.filter(video => 
    searchQuery === '' || 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <main className="results-container">
      <div className="results-header">
        <h2>Meeting Results</h2>
        {searchQuery && (
          <p className="results-subtitle">
            {filteredVideos.length} meeting{filteredVideos.length !== 1 ? 's' : ''} found for "{searchQuery}"
          </p>
        )}
        {!searchQuery && (
          <p className="results-subtitle">
            Recent San Francisco Board of Supervisors meetings
          </p>
        )}
      </div>
      
      <div className="results-list">
        {filteredVideos.map(video => (
          <VideoCard 
            key={video.id} 
            video={video} 
            onSelect={onVideoSelect}
          />
        ))}
        
        {filteredVideos.length === 0 && (
          <div className="no-results">
            <p>No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>

      {filteredVideos.length > 0 && (
        <button className="show-more-button">Show More</button>
      )}
    </main>
  )
}

export default ResultsContainer