import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { VideoSegment } from '../types'
import VideoPlayer from './VideoPlayer'
import { ChevronDown } from 'lucide-react'
import { fetchSummary, fetchTimestamps, type SummaryResponse, type TimestampItem } from '../services/api'
import { loadVideoDataWithMetadata } from '../data/mockData'

interface VideoPlayerPageProps {
  video: VideoSegment
  onBack: () => void
  startTime?: number
}

function VideoPlayerPage({ video, onBack, startTime }: VideoPlayerPageProps) {
  const navigate = useNavigate()
  const [currentSegment, setCurrentSegment] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [expandedAgendaItems, setExpandedAgendaItems] = useState<Set<number>>(new Set())
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null)
  const [timestampData, setTimestampData] = useState<TimestampItem[]>([])
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false)
  const [timestampLoading, setTimestampLoading] = useState<boolean>(false)
  const [timestampError, setTimestampError] = useState<string | null>(null)
  const [recommendedVideos, setRecommendedVideos] = useState<VideoSegment[]>([])
  const [recommendedLoading, setRecommendedLoading] = useState<boolean>(true)
  const [tagsExpanded, setTagsExpanded] = useState<boolean>(false)

  useEffect(() => {
    const loadData = async () => {
      // Load summary data
      setSummaryLoading(true)
      try {
        const summaryResponse = await fetchSummary(video.clipId || video.id, video.viewId || '10')
        setSummaryData(summaryResponse)
      } catch (error) {
        console.error('Error loading summary:', error)
      } finally {
        setSummaryLoading(false)
      }

      // Load timestamp data
      setTimestampLoading(true)
      setTimestampError(null)
      try {
        const timestampResponse = await fetchTimestamps(video.clipId || video.id, video.viewId || '10')
        setTimestampData(timestampResponse)
      } catch (error) {
        setTimestampError('Failed to load timestamp data')
        console.error('Error loading timestamps:', error)
      } finally {
        setTimestampLoading(false)
      }
    }

    loadData()
  }, [video.id, video.clipId, video.viewId])

  // Load recommended videos based on current video's tags
  useEffect(() => {
    const loadRecommendedVideos = async () => {
      setRecommendedLoading(true)
      
      try {
        // Load the actual video data with metadata
        const videoData = await loadVideoDataWithMetadata()
        
        // Filter videos that share tags with current video
        const related = videoData
          .filter(v => v.id !== video.id) // Exclude current video
          .filter(v => 
            // Find videos that share at least one tag
            v.tags.some(tag => video.tags.includes(tag))
          )
          .slice(0, 3) // Limit to 3 recommendations
        
        // If we don't have enough related videos, add others
        if (related.length < 3) {
          const remaining = videoData
            .filter(v => v.id !== video.id)
            .filter(v => !related.includes(v))
            .slice(0, 3 - related.length)
          
          related.push(...remaining)
        }
        
        setRecommendedVideos(related)
      } catch (error) {
        console.error('Error loading recommended videos:', error)
        setRecommendedVideos([])
      } finally {
        setRecommendedLoading(false)
      }
    }

    loadRecommendedVideos()
  }, [video.id, video.tags])

  // Create agenda items from timestamp data with fallback to hardcoded data
  const agendaItems = timestampLoading 
    ? [
        { 
          id: 1, 
          title: "Loading agenda items...", 
          time: "--:--", 
          startSeconds: 0,
          summary: "Loading agenda item details..."
        }
      ]
    : timestampData.length > 0 
      ? timestampData.map((item, index) => ({
          id: index + 1,
          title: item.agenda_name,
          time: item.time_formatted,
          startSeconds: item.time_seconds,
          summary: summaryData?.agenda_summary?.[index]?.agenda_summary || "Loading agenda summary..."
        }))
      : [
    { 
      id: 1, 
      title: "Call to Order", 
      time: "0:00", 
      startSeconds: 0,
      summary: "Meeting is officially called to order. Roll call of board members and confirmation of quorum. Review of meeting protocols and agenda overview."
    },
    { 
      id: 2, 
      title: "Public Comment", 
      time: "2:15", 
      startSeconds: 135,
      summary: "Open forum for public input on agenda items. Citizens present concerns about housing development timeline and community impact. Three speakers address affordability concerns."
    },
    { 
      id: 3, 
      title: "Budget Review", 
      time: "8:30", 
      startSeconds: 510,
      summary: "Quarterly financial report and budget allocation review. Discussion of funding sources for housing initiatives and projected costs for infrastructure improvements."
    },
    { 
      id: 4, 
      title: "Housing Development Requirements", 
      time: "14:23", 
      startSeconds: 863,
      summary: "Main agenda item covering new affordable housing requirements. Includes developer testimony, community advocate presentations, and board discussion leading to final vote on 18% affordable housing requirement."
    },
    { 
      id: 5, 
      title: "Transportation Infrastructure", 
      time: "42:10", 
      startSeconds: 2530,
      summary: "Discussion of transportation improvements needed to support new housing developments. Review of traffic impact studies and proposed transit solutions."
    },
    { 
      id: 6, 
      title: "Public Safety Update", 
      time: "58:45", 
      startSeconds: 3525,
      summary: "Police department briefing on community safety measures related to increased residential density. Discussion of emergency services capacity and response times."
    }
  ]

  const getCurrentAgendaStatus = (itemIndex: number): string => {
    const currentItem = agendaItems[itemIndex]
    const nextItem = agendaItems[itemIndex + 1]
    
    if (currentTime < currentItem.startSeconds) {
      return 'upcoming'
    } else if (nextItem && currentTime >= nextItem.startSeconds) {
      return 'completed'
    } else {
      return 'current'
    }
  }

  const getAgendaProgress = (itemIndex: number): number => {
    const currentItem = agendaItems[itemIndex]
    const nextItem = agendaItems[itemIndex + 1]
    
    if (getCurrentAgendaStatus(itemIndex) !== 'current') {
      return 0
    }
    
    if (!nextItem) {
      return 0 // Last item, no progress calculation
    }
    
    const itemDuration = nextItem.startSeconds - currentItem.startSeconds
    const elapsed = currentTime - currentItem.startSeconds
    return Math.min(100, Math.max(0, (elapsed / itemDuration) * 100))
  }

  const toggleAgendaItem = (itemId: number) => {
    const newExpanded = new Set(expandedAgendaItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedAgendaItems(newExpanded)
  }

  const handleRecommendedVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`)
  }

  const videoSegments = [
    {
      time: "14:23-16:30",
      title: "Opening Statements",
      summary: "Supervisor Johnson introduces the housing requirements proposal, outlining the need for increased affordable housing in SOMA."
    },
    {
      time: "16:30-25:45", 
      title: "Developer Testimony",
      summary: "Representatives from local development companies express concerns about cost increases and construction delays."
    },
    {
      time: "25:45-35:20",
      title: "Community Advocates",
      summary: "Housing advocates and community members speak about displacement concerns and the need for affordable options."
    },
    {
      time: "35:20-42:10",
      title: "Board Discussion & Vote",
      summary: "Board members debate the proposal, discuss amendments, and cast final votes. Motion passes 7-4 with 18% requirement."
    }
  ]

  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':')
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1])
    } else if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
    }
    return 0
  }

  // const handleSegmentClick = (timeRange: string, index: number) => {
  //   const startTime = timeRange.split('-')[0]
  //   const seconds = parseTimeToSeconds(startTime)
  //   setCurrentSegment(index)
  //   // The VideoPlayer component will handle the actual seeking via onSeek callback
  //   return seconds
  // }

  const handleAgendaClick = (timeStr: string) => {
    const seconds = parseTimeToSeconds(timeStr)
    return seconds
  }

  return (
    <div className="video-player-page-modern">
      {/* Modern Header */}
      <div className="modern-header">
        <div className="header-content">
          <button className="modern-back-btn" onClick={onBack}>
            SFGovTV++
          </button>
          <div className="header-details">
            <h1 className="modern-title">{video.title}</h1>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="modern-content-grid">
        {/* Video Section */}
        <div className="video-section">
          <div className="video-wrapper-connected">
            <div className="video-container-modern">
              <VideoPlayer 
                src={video.videoUrl || `/videos/${video.id}.mp4`}
                startTime={startTime}
                onTimeUpdate={(currentTime, duration) => {
                  setCurrentTime(currentTime)
                  
                  // Update current segment based on time
                  const activeSegment = videoSegments.findIndex((segment, index) => {
                    const [startTime] = segment.time.split('-')
                    const startSeconds = parseTimeToSeconds(startTime)
                    const nextSegment = videoSegments[index + 1]
                    const endSeconds = nextSegment ? parseTimeToSeconds(nextSegment.time.split('-')[0]) : duration
                    
                    return currentTime >= startSeconds && currentTime < endSeconds
                  })
                  
                  if (activeSegment !== -1 && activeSegment !== currentSegment) {
                    setCurrentSegment(activeSegment)
                  }
                }}
                onSeek={(time) => {
                  setCurrentTime(time)
                }}
              />
            </div>

            {/* Video Info Card - Connected to video */}
            <div className="video-info-card-connected">
              {/* Video Stats - Now inside the info card */}
              <div className="video-stats-inline">
                <div className="view-count">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span className="view-count-text">{video.views || 'Loading...'}</span>
                  <span className="stats-separator">•</span>
                  <span className="video-date">{video.date}, 2025</span>
                </div>
              </div>

              {/* Meeting Summary Section */}
              {summaryData?.meeting_summary && (
                <div className="meeting-summary-section-inline">
                  <h3>Meeting Summary</h3>
                  {summaryLoading && <span className="summary-loading-text">Loading...</span>}
                  <p>{summaryData.meeting_summary}</p>
                </div>
              )}
              
              <div className="speakers-section">
                <h3>Speakers</h3>
                <p>{video.speakers.join(', ')} + 3 others</p>
              </div>

              {/* Tags Section */}
              {summaryData?.tags && summaryData.tags.length > 0 && (
                <div className="tags-section">
                  <div 
                    className="tags-header"
                    onClick={() => setTagsExpanded(!tagsExpanded)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <h3>Tags</h3>
                    {summaryData.tags.length > 3 && (
                      <ChevronDown 
                        size={16} 
                        className={`chevron ${tagsExpanded ? 'expanded' : ''}`}
                      />
                    )}
                  </div>
                  <div className="video-tags">
                    {(tagsExpanded ? summaryData.tags : summaryData.tags.slice(0, 3)).map((tag, index) => (
                      <span key={index} className="video-tag">
                        {tag}
                      </span>
                    ))}
                    {!tagsExpanded && summaryData.tags.length > 3 && (
                      <span className="video-tag" style={{ opacity: 0.7, fontStyle: 'italic' }}>
                        +{summaryData.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="actions-section">
                <button className="modern-action-btn primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
                  Save
                </button>
                <button className="modern-action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16,6 12,2 8,6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                  Share
                </button>
                <button className="modern-action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  Transcript
                </button>
                <button className="modern-action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h18v18H3zM12 8v8m-4-4h8"/>
                  </svg>
                  Notes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="right-sidebar-column">
          {/* Agenda */}
          <div className="sidebar-container">
            <div className="agenda-sidebar-modern">
            <div className="agenda-header-modern">
              <h2>Meeting Agenda</h2>
              <div className="agenda-progress-indicator">
                <span>{agendaItems.filter((_, i) => getCurrentAgendaStatus(i) === 'completed').length} / {agendaItems.length} completed</span>
              </div>
              {timestampLoading && <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Loading timestamps...</div>}
              {timestampError && <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{timestampError}</div>}
            </div>
            
            <div className="agenda-timeline">
              {agendaItems.map((item, index) => {
                const status = getCurrentAgendaStatus(index)
                const progress = getAgendaProgress(index)
                const isExpanded = expandedAgendaItems.has(item.id)
                return (
                  <div 
                    key={item.id} 
                    className={`timeline-item ${status}`}
                  >
                    <div className="timeline-marker">
                      <div className={`marker-dot ${status}`}>
                        {status === 'completed' && <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                        {status === 'current' && <div className="pulse-dot"></div>}
                      </div>
                      {index < agendaItems.length - 1 && <div className="timeline-line"></div>}
                    </div>
                    
                    <div className="timeline-content">
                      <div 
                        className="timeline-header"
                        onClick={() => {
                          const seconds = handleAgendaClick(item.time)
                          const videoElement = document.querySelector('video') as HTMLVideoElement
                          if (videoElement) {
                            videoElement.currentTime = seconds
                          }
                        }}
                      >
                        <div className="timeline-time">{item.time}</div>
                        <h4 className="timeline-title">{item.title}</h4>
                        <button 
                          className="expand-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleAgendaItem(item.id)
                          }}
                        >
                          <ChevronDown 
                            size={16} 
                            className={`chevron ${isExpanded ? 'expanded' : ''}`}
                          />
                        </button>
                      </div>
                      
                      {status === 'current' && progress > 0 && (
                        <div className="progress-bar-modern">
                          <div 
                            className="progress-fill-modern"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                      
                      {isExpanded && (
                        <div className="timeline-summary">
                          <p>{item.summary}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            </div>
          </div>

          {/* Recommended Videos Section */}
          <div className="recommended-videos-section">
            <div className="recommended-header">
              <h3>Recommended Videos</h3>
              <p>Based on similar topics</p>
            </div>
            
            <div className="recommended-videos-list">
              {recommendedLoading ? (
                <div className="recommended-loading">
                  <div className="recommended-item-skeleton">
                    <div className="skeleton-thumbnail"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-title">Loading recommendations...</div>
                      <div className="skeleton-meta">Finding related videos...</div>
                    </div>
                  </div>
                  <div className="recommended-item-skeleton">
                    <div className="skeleton-thumbnail"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-title">Loading recommendations...</div>
                      <div className="skeleton-meta">Finding related videos...</div>
                    </div>
                  </div>
                </div>
              ) : (
                recommendedVideos.map((recommendedVideo) => (
                  <div 
                    key={recommendedVideo.id}
                    className="recommended-video-item"
                    onClick={() => handleRecommendedVideoClick(recommendedVideo.id)}
                  >
                    <div className="recommended-thumbnail">
                      <img 
                        src={`/thumbnails/${recommendedVideo.id}.jpg`}
                        alt={`Thumbnail for ${recommendedVideo.title}`}
                        className="recommended-thumb-image"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling;
                          if (placeholder) placeholder.setAttribute('style', 'display: flex');
                        }}
                      />
                      <div className="recommended-thumb-placeholder" style={{ display: 'none' }}>
                        <svg className="play-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                      <span className="recommended-duration">{recommendedVideo.duration}</span>
                    </div>
                    
                    <div className="recommended-content">
                      <h4 className="recommended-title">{recommendedVideo.title}</h4>
                      <div className="recommended-meta">
                        <span className="recommended-date">{recommendedVideo.date}</span>
                        <span className="meta-separator">•</span>
                        <span className="recommended-views">{recommendedVideo.views || '847 views'}</span>
                      </div>
                      <div className="recommended-tags">
                        {recommendedVideo.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="recommended-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default VideoPlayerPage