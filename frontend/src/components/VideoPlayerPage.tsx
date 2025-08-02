import type { VideoSegment } from '../types'

interface VideoPlayerPageProps {
  video: VideoSegment
  onBack: () => void
}

function VideoPlayerPage({ video, onBack }: VideoPlayerPageProps) {
  const agendaItems = [
    { id: 1, title: "Call to Order", time: "0:00", status: "completed" },
    { id: 2, title: "Public Comment", time: "2:15", status: "completed" },
    { id: 3, title: "Budget Review", time: "8:30", status: "completed" },
    { id: 4, title: "Housing Development Requirements", time: "14:23", status: "current" },
    { id: 5, title: "Transportation Infrastructure", time: "42:10", status: "upcoming" },
    { id: 6, title: "Public Safety Update", time: "58:45", status: "upcoming" }
  ]

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
            <div className="video-placeholder-full">
              VIDEO PLAYER
            </div>
            <div className="video-controls-full">
              <button>▶️</button>
              <button>⏸️</button>
              <button>⏮️</button>
              <button>⏭️</button>
              <div className="progress-bar-full">
                <div className="progress-full">──────●────────</div>
                <span className="time-full">14:23 / 1:02:15</span>
              </div>
              <button>🔊</button>
              <button>⚙️</button>
              <button>⛶</button>
            </div>
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
              {agendaItems.map(item => (
                <div 
                  key={item.id} 
                  className={`agenda-item-player ${item.status}`}
                >
                  <span className="agenda-time-player">{item.time}</span>
                  <span className="agenda-title-player">{item.title}</span>
                  <span className={`agenda-status-player ${item.status}`}>
                    {item.status === 'completed' && '✓'}
                    {item.status === 'current' && '▶'}
                    {item.status === 'upcoming' && '○'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="segments-section-player">
            <h2>VIDEO SEGMENTS</h2>
            <div className="segments-list-player">
              {videoSegments.map((segment, index) => (
                <div key={index} className="segment-item-player">
                  <div className="segment-header-player">
                    <span className="segment-time-player">{segment.time}</span>
                    <h3 className="segment-title-player">{segment.title}</h3>
                  </div>
                  <p className="segment-summary-player">{segment.summary}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayerPage