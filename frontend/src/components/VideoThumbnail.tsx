import React, { useState, useEffect } from 'react'
import { thumbnailService } from '../services/thumbnailService'

interface VideoThumbnailProps {
  videoId: string
  videoUrl?: string
  timestamp?: number
  alt: string
  className?: string
  fallbackSrc?: string
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  videoId,
  videoUrl,
  timestamp,
  alt,
  className = '',
  fallbackSrc
}) => {
  const [thumbnailSrc, setThumbnailSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadThumbnail = async () => {
      // If we have a timestamp and video URL, generate thumbnail
      if (timestamp !== undefined && videoUrl) {
        try {
          setIsLoading(true)
          const thumbnail = await thumbnailService.getThumbnail(videoId, videoUrl, timestamp)
          if (isMounted) {
            setThumbnailSrc(thumbnail)
            setIsLoading(false)
          }
        } catch (error) {
          console.error('Failed to load thumbnail:', error)
          if (isMounted) {
            setHasError(true)
            setIsLoading(false)
            // Use fallback
            setThumbnailSrc(fallbackSrc || `/thumbnails/${videoId}.jpg`)
          }
        }
      } else {
        // No timestamp, use default thumbnail
        setThumbnailSrc(fallbackSrc || `/thumbnails/${videoId}.jpg`)
        setIsLoading(false)
      }
    }

    loadThumbnail()

    return () => {
      isMounted = false
    }
  }, [videoId, videoUrl, timestamp, fallbackSrc])

  if (isLoading) {
    return (
      <div className={`thumbnail-loading ${className}`}>
        <div className="thumbnail-spinner"></div>
        <span className="loading-text">Loading thumbnail...</span>
      </div>
    )
  }

  return (
    <img 
      src={thumbnailSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        // If generated thumbnail fails, fall back to default
        if (!hasError && fallbackSrc) {
          setHasError(true)
          target.src = fallbackSrc
        }
      }}
    />
  )
}

export default VideoThumbnail