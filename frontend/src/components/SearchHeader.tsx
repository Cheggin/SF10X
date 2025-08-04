interface SearchHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  selectedTopic: string
  onTopicChange: (topic: string) => void
}

function SearchHeader({ 
  searchQuery, 
  onSearchChange, 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange, 
  selectedTopic, 
  onTopicChange 
}: SearchHeaderProps) {

  return (
    <header className="search-header">
      <div className="header-hero">
        <div className="hero-content">
          <h1>San Francisco Board of Supervisors Search</h1>
          <p className="hero-subtitle">
            Access official Board of Supervisors meeting archives, transcripts, and key discussions
          </p>
        </div>
      </div>
      
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-group">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search meeting topics, descriptions, or agenda items..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="search-button">
            <span>Search</span>
          </button>
        </div>

        <div className="filters">
          <div className="filter-group date-range-group">
            <label className="filter-label">Date Range</label>
            <div className="date-range-inputs">
              <div className="date-input-wrapper">
                <label className="date-input-label">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="date-input"
                  aria-label="Start date"
                />
              </div>
              <div className="date-input-wrapper">
                <label className="date-input-label">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="date-input"
                  aria-label="End date"
                />
              </div>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Topic</label>
            <select 
              value={selectedTopic} 
              onChange={(e) => onTopicChange(e.target.value)}
              className="filter-select"
              aria-label="Filter by topic"
            >
              <option value="">All Topics</option>
              <option value="Housing">Housing</option>
              <option value="Transportation">Transportation</option>
              <option value="Budget">Budget</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Planning">Planning</option>
              <option value="Environment">Environment</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  )
}

export default SearchHeader