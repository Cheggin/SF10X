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
      <div className="header-title">
        <h1>SF COUNCIL SEARCH</h1>
        <span className="header-icon">🏛️</span>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search meetings, topics, speakers..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        <button className="search-button">🔍</button>
      </div>

      <div className="filters">
        <select 
          value={dateFilter} 
          onChange={(e) => setDateFilter(e.target.value)}
          className="filter-select"
        >
          <option>📅 Jan 2024</option>
          <option>📅 Dec 2023</option>
          <option>📅 Nov 2023</option>
          <option>📅 Last 6 months</option>
        </select>

        <select 
          value={districtFilter} 
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="filter-select"
        >
          <option>📍 All Districts</option>
          <option>📍 District 1</option>
          <option>📍 District 2</option>
          <option>📍 District 3</option>
          <option>📍 SOMA</option>
        </select>

        <select 
          value={topicFilter} 
          onChange={(e) => setTopicFilter(e.target.value)}
          className="filter-select"
        >
          <option>🏷️ All Topics</option>
          <option>🏷️ Housing</option>
          <option>🏷️ Transportation</option>
          <option>🏷️ Budget</option>
          <option>🏷️ Public Safety</option>
        </select>
      </div>
    </header>
  )
}

export default SearchHeader