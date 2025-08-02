import type { VideoSegment } from '../types'

interface VideoDetailProps {
  video: VideoSegment
  onBack: () => void
  onWatchVideo: () => void
}

function VideoDetail({ video, onBack, onWatchVideo }: VideoDetailProps) {
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
    <div className="video-detail">
      <header className="detail-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>{video.title}</h1>
      </header>

      <div className="detail-content">
        <div className="video-preview">
          <div className="video-thumbnail">
            <div className="thumbnail-placeholder">
              VIDEO PREVIEW
            </div>
            <button 
              className="watch-video-btn"
              onClick={onWatchVideo}
            >
              ▶️ Watch Video
            </button>
          </div>
        </div>

        <div className="video-info">
          <div className="info-row">
            <span>📅 {video.date}, 2024 • Regular Board Meeting</span>
          </div>
          <div className="info-row">
            <span>👥 {video.speakers.join(', ')} + 3 others</span>
          </div>
          <div className="info-row">
            <span>🕐 Duration: {video.duration}</span>
          </div>
        </div>

        <section className="summary-section">
          <h2>SUMMARY</h2>
          <div className="summary-content">
            <p>{video.summary}</p>
            
            {video.title === 'Housing Discussion' && (
              <ul>
                <li>• 20% affordable housing proposed (from 15%)</li>
                <li>• Developer concerns about costs and delays</li>
                <li>• Community advocates for anti-displacement</li>
                <li>• Final vote: 18% requirement approved 7-4</li>
              </ul>
            )}
          </div>
        </section>

        <section className="segments-preview">
          <h2>VIDEO SEGMENTS</h2>
          <div className="segments-list">
            {videoSegments.map((segment, index) => (
              <div key={index} className="segment-item">
                <div className="segment-header">
                  <span className="segment-time">{segment.time}</span>
                  <h3 className="segment-title">{segment.title}</h3>
                </div>
                <p className="segment-summary">{segment.summary}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="action-buttons">
          <button className="action-button">💾 Save</button>
          <button className="action-button">📤 Share</button>
          <button className="action-button">📄 Transcript</button>
          <button 
            className="action-button primary"
            onClick={onWatchVideo}
          >
            ▶️ Watch Video
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoDetail