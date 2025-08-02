import { useState } from 'react'
import type { VideoSegment } from '../types'
import VideoPlayer from './VideoPlayer'
import { ChevronDown } from 'lucide-react'

interface VideoPlayerPageProps {
  video: VideoSegment
  onBack: () => void
}

function VideoPlayerPage({ video, onBack }: VideoPlayerPageProps) {
  const [currentSegment, setCurrentSegment] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [expandedAgendaItems, setExpandedAgendaItems] = useState<Set<number>>(new Set())

  const agendaItems = [
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

  const handleSegmentClick = (timeRange: string, index: number) => {
    const startTime = timeRange.split('-')[0]
    const seconds = parseTimeToSeconds(startTime)
    setCurrentSegment(index)
    // The VideoPlayer component will handle the actual seeking via onSeek callback
    return seconds
  }

  const handleAgendaClick = (timeStr: string) => {
    const seconds = parseTimeToSeconds(timeStr)
    return seconds
  }

  return (
    <div className="video-player-page">
      <header className="player-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Results
        </button>
        <h1>{video.title}</h1>
        <div className="meeting-info">
          📅 {video.date}, 2024 • Regular Board Meeting
        </div>
      </header>

      <div className="player-content">
        {/* Left Column - Video Player */}
        <div className="video-main">
          <div className="video-player-full">
            <VideoPlayer 
              src="/video.mp4"
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

          <div className="video-metadata">
            <div className="speakers-info">
              <strong>Speakers:</strong> {video.speakers.join(', ')} + 3 others
            </div>
            <div className="video-actions">
              <button className="action-btn">💾 Save</button>
              <button className="action-btn">📤 Share</button>
              <button className="action-btn">📄 Transcript</button>
              <button className="action-btn">📝 Notes</button>
            </div>
          </div>
        </div>

        {/* Right Column - Agenda & Segments */}
        <div className="player-sidebar">
          <section className="agenda-section-player">
            <h2>MEETING AGENDA</h2>
            <div className="agenda-list-player">
              {agendaItems.map((item, index) => {
                const status = getCurrentAgendaStatus(index)
                const progress = getAgendaProgress(index)
                const isExpanded = expandedAgendaItems.has(item.id)
                return (
                  <div 
                    key={item.id} 
                    className={`agenda-item-player ${status}`}
                  >
                    <div 
                      className="agenda-item-content"
                      onClick={() => {
                        const seconds = handleAgendaClick(item.time)
                        // Trigger seek on video player
                        const videoElement = document.querySelector('video') as HTMLVideoElement
                        if (videoElement) {
                          videoElement.currentTime = seconds
                        }
                      }}
                    >
                      <span className="agenda-time-player">{item.time}</span>
                      <span className="agenda-title-player">{item.title}</span>
                      <div className="agenda-controls">
                        <span className={`agenda-status-player ${status}`}>
                          {status === 'completed' && '✓'}
                          {status === 'current' && '▶'}
                          {status === 'upcoming' && '○'}
                        </span>
                        <button 
                          className="agenda-dropdown-btn"
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
                    </div>
                    {status === 'current' && progress > 0 && (
                      <div className="agenda-progress-bar">
                        <div 
                          className="agenda-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                    {isExpanded && (
                      <div className="agenda-summary">
                        <p>{item.summary}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayerPage