import React, { useRef, useState, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Settings, 
  Maximize, 
  Minimize
} from 'lucide-react'

interface VideoPlayerProps {
  src: string
  startTime?: number
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onSeek?: (time: number) => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, startTime, onTimeUpdate, onSeek }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  // const playbackSpeeds = [0.5, 1, 1.25, 1.5, 2]

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      console.log('=== VIDEO DEBUG INFO ===')
      console.log('Video duration:', video.duration)
      console.log('Video readyState:', video.readyState)
      console.log('Video videoWidth:', video.videoWidth)
      console.log('Video videoHeight:', video.videoHeight)
      console.log('Video src:', video.src)
      
      // Check seekable ranges
      if (video.seekable && video.seekable.length > 0) {
        console.log('Seekable range:', video.seekable.start(0), 'to', video.seekable.end(0))
      }
      
      // Check if the video has audio tracks
      if ('webkitAudioDecodedByteCount' in video) {
        console.log('Audio decoded bytes:', (video as HTMLVideoElement & { webkitAudioDecodedByteCount: number }).webkitAudioDecodedByteCount)
      }
      if ('webkitVideoDecodedByteCount' in video) {
        console.log('Video decoded bytes:', (video as HTMLVideoElement & { webkitVideoDecodedByteCount: number }).webkitVideoDecodedByteCount)
      }
      
      // Check codec info if available
      try {
        const canPlayMP4 = video.canPlayType('video/mp4')
        console.log('Can play MP4:', canPlayMP4)
        const canPlayMP4Codecs = video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
        console.log('Can play MP4 with codecs:', canPlayMP4Codecs)
      } catch {
        console.log('Cannot check MP4 support')
      }
      
      console.log('=== SYNC ISSUE SUGGESTIONS ===')
      console.log('1. Try re-encoding your video with: ffmpeg -i input.mp4 -c:v libx264 -c:a aac -strict experimental output.mp4')
      console.log('2. Ensure constant frame rate and proper keyframe interval')
      console.log('3. Check if the issue happens in different browsers')
    }

    const handleTimeUpdate = () => {
      const time = video.currentTime
      setCurrentTime(time)
      onTimeUpdate?.(time, video.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    const handleWaiting = () => {
      console.log('Video waiting/buffering at:', video.currentTime)
    }

    const handleSeeked = () => {
      console.log('Video seeked to:', video.currentTime)
    }

    const handleStalled = () => {
      console.log('Video stalled at:', video.currentTime)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('seeked', handleSeeked)
    video.addEventListener('stalled', handleStalled)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('seeked', handleSeeked)
      video.removeEventListener('stalled', handleStalled)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [onTimeUpdate])

  // Seek to startTime when video is ready
  useEffect(() => {
    const video = videoRef.current
    if (!video || !startTime) return

    const handleCanPlay = () => {
      if (video.readyState >= 3) { // HAVE_FUTURE_DATA
        console.log(`Seeking to start time: ${startTime} seconds`)
        video.currentTime = startTime
        setCurrentTime(startTime)
        // Remove the event listener after seeking
        video.removeEventListener('canplay', handleCanPlay)
      }
    }

    // If video is already ready, seek immediately
    if (video.readyState >= 3) {
      video.currentTime = startTime
      setCurrentTime(startTime)
    } else {
      // Otherwise wait for the video to be ready
      video.addEventListener('canplay', handleCanPlay)
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [startTime])


  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = parseFloat(e.target.value)
    jumpToTime(newTime)
  }

  const jumpToTime = (targetTime: number) => {
    const video = videoRef.current
    if (!video) return

    // Simple, direct approach
    video.currentTime = targetTime
    setCurrentTime(targetTime)
    onSeek?.(targetTime)
    console.log(`Jumped to: ${targetTime}`)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = parseFloat(e.target.value)
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume || 0.5
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const changePlaybackSpeed = (speed: number) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = speed
    setPlaybackRate(speed)
  }

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speed = parseFloat(e.target.value)
    changePlaybackSpeed(speed)
  }

  const toggleFullscreen = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (!document.fullscreenElement) {
        await video.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  const skipTime = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    const newTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
    jumpToTime(newTime)
  }

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div 
      className={`video-player-container ${isFullscreen ? 'fullscreen' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="video-element"
        onClick={togglePlay}
        preload="auto"
        playsInline
        controls={false}
        muted={false}
        autoPlay={false}
        onLoadStart={() => console.log('Video load started')}
        onCanPlay={() => console.log('Video can play')}
        onError={(e) => console.error('Video error:', e)}
        onLoadedData={() => console.log('Video data loaded')}
      />
      
      <div className={`video-controls ${showControls ? 'visible' : ''}`}>
        {/* Progress Bar */}
        <div className="progress-bar-container">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="progress-bar"
          />
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
        </div>

        {/* Controls Bar */}
        <div className="controls-bar">
          <div className="left-controls">
            <button onClick={togglePlay} className="control-btn play-btn">
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button onClick={() => skipTime(-10)} className="control-btn">
              <RotateCcw size={20} />
            </button>
            
            <button onClick={() => skipTime(10)} className="control-btn">
              <RotateCw size={20} />
            </button>

            <div className="volume-control">
              <button onClick={toggleMute} className="control-btn volume-btn">
                {isMuted || volume === 0 ? (
                  <VolumeX size={20} />
                ) : volume < 0.5 ? (
                  <Volume1 size={20} />
                ) : (
                  <Volume2 size={20} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>

            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>


          <div className="right-controls">
            <div className="speed-control">
              <span className="speed-label">{playbackRate}x</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.25"
                value={playbackRate}
                onChange={handleSpeedChange}
                className="speed-slider"
              />
            </div>
            
            <button className="control-btn cc-btn">
              <span className="cc-text">CC</span>
            </button>

            <button className="control-btn">
              <Settings size={20} />
            </button>

            <button onClick={toggleFullscreen} className="control-btn">
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer