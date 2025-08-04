import { Routes, Route } from 'react-router-dom'
import './App.css'
import SearchPage from './pages/SearchPage'
import VideoPlayerPage from './pages/VideoPlayerPage'
import AIChatPage from './pages/AIChatPage'
import ArchivePage from './pages/ArchivePage'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/video/:videoId" element={<VideoPlayerPage />} />
        <Route path="/ai" element={<AIChatPage />} />
        <Route path="/archive" element={<ArchivePage />} />
      </Routes>
    </div>
  )
}

export default App