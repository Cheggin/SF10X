import type { VideoSegment } from '../types'
import { loadAllVideoMetadata } from '../services/videoMetadata'

// Base video data with summaries and tags
const baseVideoData: Omit<VideoSegment, 'duration' | 'date'>[] = [
  {
    id: '50121_10',
    title: 'Board of Supervisors Meeting | ID # 50121',
    speakers: ['Connie Chan', 'Matt Dorsey', 'Joel Engardio', 'Jackie Fielder', 'Bilal Mahmood'],
    summary: 'New affordable housing rules for SOMA. Passed 7-4 with 18% requirement.',
    tags: ['housing', 'development', 'affordable'],
    videoUrl: '/videos/50121_10.mp4',
    clipId: '50121',
    viewId: '10',
    views: '2.3k views'
  },
  {
    id: '50188_10',
    title: 'Board of Supervisors Meeting | ID # 50188',
    speakers: ['Rafael Mandelman', 'Myrna Melgar', 'Danny Sauter', 'Stephen Sherrill', 'Shamann Walton'],
    summary: 'Muni funding changes and Market St bike lanes. $15M approved for infrastructure upgrades.',
    tags: ['transportation', 'budget', 'infrastructure'],
    videoUrl: '/videos/50188_10.mp4',
    clipId: '50188',
    viewId: '10',
    views: '1.8k views'
  },
  {
    id: '50291_10',
    title: 'Board of Supervisors Meeting | ID # 50291',
    speakers: ['Chyanne Chen', 'Connie Chan', 'Matt Dorsey', 'Joel Engardio'],
    summary: 'Citizens request construction impact relief. Committee formed to review proposals.',
    tags: ['business', 'relief', 'public-comment'],
    videoUrl: '/videos/50291_10.mp4',
    clipId: '50291',
    viewId: '10',
    views: '947 views'
  },
  {
    id: '50412_10',
    title: 'Board of Supervisors Meeting | ID # 50412',
    speakers: ['Jackie Fielder', 'Bilal Mahmood', 'Rafael Mandelman', 'Myrna Melgar'],
    summary: 'Discussion on police department budget allocation and community safety initiatives.',
    tags: ['public-safety', 'budget', 'police'],
    videoUrl: '/videos/50412_10.mp4',
    clipId: '50412',
    viewId: '10',
    views: '3.1k views'
  },
  {
    id: '50523_10',
    title: 'Board of Supervisors Meeting | ID # 50523',
    speakers: ['Danny Sauter', 'Stephen Sherrill', 'Shamann Walton', 'Chyanne Chen'],
    summary: 'New environmental policies and climate action initiatives for the city.',
    tags: ['environment', 'climate', 'policy'],
    videoUrl: '/videos/50523_10.mp4',
    clipId: '50523',
    viewId: '10',
    views: '1.4k views'
  }
]

// Cache for loaded video data with metadata
let mockVideoData: VideoSegment[] = []
let metadataLoaded = false

// Load video data with real metadata
export const loadVideoDataWithMetadata = async (): Promise<VideoSegment[]> => {
  if (metadataLoaded && mockVideoData.length > 0) {
    return mockVideoData
  }

  try {
    const videoIds = baseVideoData.map(video => video.id)
    const metadataMap = await loadAllVideoMetadata(videoIds)
    
    mockVideoData = baseVideoData.map(baseVideo => {
      const metadata = metadataMap.get(baseVideo.id)
      return {
        ...baseVideo,
        duration: metadata?.duration || '15:00',
        date: metadata?.createdDate || 'Jan 1'
      }
    })
    
    metadataLoaded = true
    return mockVideoData
  } catch (error) {
    console.error('Failed to load video metadata:', error)
    // Fallback to base data with mock values
    mockVideoData = baseVideoData.map(baseVideo => ({
      ...baseVideo,
      duration: 'Loading...',
      date: 'Loading...'
    }))
    return mockVideoData
  }
}

// Initialize with mock data for immediate use
mockVideoData = baseVideoData.map(baseVideo => ({
  ...baseVideo,
  duration: 'Loading...',
  date: 'Loading...'
}))

export { mockVideoData }

export const getVideoById = (id: string): VideoSegment | undefined => {
  return mockVideoData.find(video => video.id === id)
}

export const getPopularVideos = (): VideoSegment[] => {
  // Return the first 3 videos as featured/popular
  return mockVideoData.slice(0, 3)
}