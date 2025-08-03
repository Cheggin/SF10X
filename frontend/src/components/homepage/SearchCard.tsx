import { memo } from 'react'

interface SearchCardProps {
  title: string
  searchQuery: string
  onSearchChange: (query: string) => void
  onSearch: () => void
}

const SearchCard = memo(({ title, searchQuery, onSearchChange, onSearch }: SearchCardProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <div className="search-card">
      <div className="search-card-content">
        <h1 className="search-card-title">{title}</h1>
        <p className="search-card-subtitle">
          Access official Board of Supervisors meeting archives, transcripts, and key discussions
        </p>
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-container">
            <div className="search-input-wrapper">
              <svg 
                className="search-icon" 
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
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})

SearchCard.displayName = 'SearchCard'

export default SearchCard