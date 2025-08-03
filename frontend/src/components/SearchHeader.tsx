import { useState } from 'react'

interface SearchHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

function SearchHeader({ searchQuery, onSearchChange }: SearchHeaderProps) {
  const [dateFilter, setDateFilter] = useState('Jan 2024')
  const [districtFilter, setDistrictFilter] = useState('All Districts')
  const [topicFilter, setTopicFilter] = useState('All Topics')

  return (
    <header className="search-header">
      <div className="header-hero">
        <div className="hero-content">
          <h1>San Francisco Council Search</h1>
          <p className="hero-subtitle">
            Access official city council meeting archives, transcripts, and key discussions
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
              placeholder="Search meetings, topics, speakers, or agenda items..."
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
          <div className="filter-group">
            <label className="filter-label">Date Range</label>
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by date"
            >
              <option>Jan 2024</option>
              <option>Dec 2023</option>
              <option>Nov 2023</option>
              <option>Last 6 months</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">District</label>
            <select 
              value={districtFilter} 
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by district"
            >
              <option>All Districts</option>
              <option>District 1</option>
              <option>District 2</option>
              <option>District 3</option>
              <option>SOMA</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Topic</label>
            <select 
              value={topicFilter} 
              onChange={(e) => setTopicFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by topic"
            >
              <option>All Topics</option>
              <option>Housing</option>
              <option>Transportation</option>
              <option>Budget</option>
              <option>Public Safety</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  )
}

export default SearchHeader