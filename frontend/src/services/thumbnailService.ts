// Service to generate and cache video thumbnails at specific timestamps
export class ThumbnailService {
  private static instance: ThumbnailService
  private thumbnailCache: Map<string, string> = new Map()
  private loadingPromises: Map<string, Promise<string>> = new Map()

  private constructor() {}

  static getInstance(): ThumbnailService {
    if (!ThumbnailService.instance) {
      ThumbnailService.instance = new ThumbnailService()
    }
    return ThumbnailService.instance
  }

  /**
   * Get or generate a thumbnail for a video at a specific timestamp
   * @param videoId - The video ID
   * @param videoUrl - The video URL
   * @param timestamp - The timestamp in seconds
   * @returns Promise<string> - The thumbnail data URL
   */
  async getThumbnail(videoId: string, videoUrl: string, timestamp?: number): Promise<string> {
    // Create a unique cache key
    const cacheKey = `${videoId}_${timestamp || 0}`
    
    // Check if thumbnail is already cached
    if (this.thumbnailCache.has(cacheKey)) {
      return this.thumbnailCache.get(cacheKey)!
    }

    // Check if this thumbnail is already being loaded
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!
    }

    // Create a loading promise
    const loadingPromise = this.generateThumbnail(videoUrl, timestamp)
      .then(thumbnailUrl => {
        this.thumbnailCache.set(cacheKey, thumbnailUrl)
        this.loadingPromises.delete(cacheKey)
        return thumbnailUrl
      })
      .catch(error => {
        console.error(`Failed to generate thumbnail for ${videoId} at ${timestamp}s:`, error)
        this.loadingPromises.delete(cacheKey)
        // Return fallback thumbnail path
        return `/thumbnails/${videoId}.jpg`
      })

    this.loadingPromises.set(cacheKey, loadingPromise)
    return loadingPromise
  }

  /**
   * Generate a thumbnail from a video at a specific timestamp
   */
  private generateThumbnail(videoUrl: string, timestamp?: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      // Only set crossOrigin for external URLs
      if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
        video.crossOrigin = 'anonymous'
      }
      video.preload = 'metadata'
      
      const cleanup = () => {
        video.remove()
        canvas.remove()
      }

      video.onloadedmetadata = () => {
        // Set video dimensions
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Seek to the specified timestamp
        if (timestamp && timestamp > 0) {
          video.currentTime = timestamp
        }
      }

      video.onseeked = () => {
        // Draw the current frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert to data URL
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8)
        cleanup()
        resolve(thumbnailUrl)
      }

      video.onerror = (error) => {
        cleanup()
        reject(error)
      }

      // Set the video source
      video.src = videoUrl
    })
  }

  /**
   * Clear the thumbnail cache
   */
  clearCache() {
    this.thumbnailCache.clear()
  }

  /**
   * Get the current cache size
   */
  getCacheSize(): number {
    return this.thumbnailCache.size
  }
}

// Export singleton instance
export const thumbnailService = ThumbnailService.getInstance()