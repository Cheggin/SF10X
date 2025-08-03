import { memo } from 'react'

interface MeetingResult {
  id: string
  title: string
  date: string
  duration: string
  speakers: string[]
  summary: string
  tags: string[]
  views?: string
}

interface MeetingResultsCardProps {
  results: MeetingResult[]
  onResultClick: (id: string) => void
  isLoading?: boolean
  hasSearched?: boolean
  searchQuery?: string
}

const MeetingResultsCard = memo(({ 
  results, 
  onResultClick, 
  isLoading = false,
  hasSearched = false,
  searchQuery = ''
}: MeetingResultsCardProps) => {
  if (isLoading) {
    return (
      <div className="meeting-results-card">
        <div className="results-loading">
          <div className="loading-spinner"></div>
          <p>Searching meetings...</p>
        </div>
      </div>
    )
  }

  if (!hasSearched) {
    return (
      <div className="meeting-results-card">
        <div className="results-empty">
          <p>Enter a search term to find relevant meeting discussions</p>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="meeting-results-card">
        <div className="results-empty">
          <p>No results found. Try different keywords or adjust your filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="meeting-results-card">
      <div className="results-header">
        <h2 className="results-title">
          {searchQuery.trim() ? 'Search Results' : 'Recent Meetings'}
        </h2>
        <p className="results-count">
          {searchQuery.trim() 
            ? `${results.length} meetings found` 
            : `${results.length} meetings available`
          }
        </p>
      </div>
      
      <div className="results-list">
        {results.map((result) => (
          <div 
            key={result.id}
            className="result-item"
            onClick={() => onResultClick(result.id)}
          >
            <div className="result-thumbnail">
              <div className="thumbnail-placeholder">
                <svg className="play-icon w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
              <span className="duration-badge">{result.duration}</span>
            </div>
            
            <div className="result-content">
              <h3 className="result-title">{result.title}</h3>
              <div className="result-meta">
                <span className="result-date">{result.date}</span>
                <span className="meta-separator">•</span>
                <span className="result-speakers">
                  {result.speakers.slice(0, 2).join(', ')}
                  {result.speakers.length > 2 && ` +${result.speakers.length - 2} others`}
                </span>
                {result.views && (
                  <>
                    <span className="meta-separator">•</span>
                    <span className="result-views">{result.views}</span>
                  </>
                )}
              </div>
              <p className="result-summary">{result.summary}</p>
              <div className="result-tags">
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
    </div>
  )
})

MeetingResultsCard.displayName = 'MeetingResultsCard'

export default MeetingResultsCard