import { memo } from 'react'

interface DiscussionItem {
  id: string
  title: string
  duration: string
  date: string
  tags: string[]
  views?: string
}

interface FeaturedDiscussionsCardProps {
  discussions: DiscussionItem[]
  onDiscussionClick: (id: string) => void
}

const FeaturedDiscussionsCard = memo(({ discussions, onDiscussionClick }: FeaturedDiscussionsCardProps) => {
  return (
    <div className="featured-discussions-card">
      <div className="featured-discussions-header">
        <h2 className="featured-discussions-title">Featured Discussions</h2>
        <p className="featured-discussions-subtitle">
          Key moments from recent board meetings
        </p>
      </div>
      
      <div className="discussions-list">
        {discussions.map((discussion) => (
          <div 
            key={discussion.id}
            className="discussion-item"
            onClick={() => onDiscussionClick(discussion.id)}
          >
            <div className="discussion-thumbnail">
              <div className="thumbnail-placeholder">
                <svg className="play-icon w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
              <span className="duration-badge">{discussion.duration}</span>
            </div>
            
            <div className="discussion-content">
              <h3 className="discussion-title">{discussion.title}</h3>
              <div className="discussion-meta">
                <span className="discussion-date">{discussion.date}</span>
                {discussion.views && (
                  <>
                    <span className="meta-separator">•</span>
                    <span className="discussion-views">{discussion.views}</span>
                  </>
                )}
              </div>
              <div className="discussion-tags">
                {discussion.tags.map((tag, index) => (
                  <span key={index} className="tag tag-secondary tag-sm">
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

FeaturedDiscussionsCard.displayName = 'FeaturedDiscussionsCard'

export default FeaturedDiscussionsCard