import type { VideoSegment } from '../types'
import { loadAllVideoMetadata } from '../services/videoMetadata'

// Base video data with summaries and tags
const baseVideoData: Omit<VideoSegment, 'duration' | 'date'>[] = [
  {
    id: '50121_10',
    title: 'Board of Supervisors Meeting | ID # 50121',
    speakers: ['Connie Chan', 'Matt Dorsey', 'Joel Engardio', 'Jackie Fielder', 'Bilal Mahmood'],
    summary: 'Discussion reveals significant gap between SF\'s 2030 renewable energy targets and current progress, with officials acknowledging major challenges ahead.',
    tags: ['downtown revitalization', 'economic recovery', 'solar permits', 'soda tax', 'public comment'],
    videoUrl: '/videos/50121_10.mp4',
    clipId: '50121',
    viewId: '10',
    views: '2.3k views',
    startTime: 6295  // 1:44:55
  },
  {
    id: '50188_10',
    title: 'Board of Supervisors Meeting | ID # 50188',
    speakers: ['Rafael Mandelman', 'Myrna Melgar', 'Danny Sauter', 'Stephen Sherrill', 'Shamann Walton'],
    summary: 'Fire department gets appropriated nearly 8 million dollars for 2024-2025 year.',
    tags: ['RV homelessness', 'immigration enforcement', 'shelter system', 'capital investment', 'mayoral address'],
    videoUrl: '/videos/50188_10.mp4',
    clipId: '50188',
    viewId: '10',
    views: '1.8k views',
    startTime: 1409  // 23:29
  },
  {
    id: '50291_10',
    title: 'Board of Supervisors Meeting | ID # 50291',
    speakers: ['Chyanne Chen', 'Connie Chan', 'Matt Dorsey', 'Joel Engardio'],
    summary: 'Public requests for a class-action lawsuit to be filed against state-sponsored terrorism of San Francisco, criticizing slow decision-making.',
    tags: ['shelter program', 'LGBTQ+ commendations', 'hate crime fund', 'all-electric construction', 'facial recognition'],
    videoUrl: '/videos/50291_10.mp4',
    clipId: '50291',
    viewId: '10',
    views: '947 views',
    startTime: 5085  // 1:24:45
  },
  {
    id: '50412_10',
    title: 'Board of Supervisors Meeting | ID # 50412',
    speakers: ['Jackie Fielder', 'Bilal Mahmood', 'Rafael Mandelman', 'Myrna Melgar'],
    summary: 'Discussion on police department budget allocation and community safety initiatives.',
    tags: ['city budget', 'Our City Our Home', 'procurement reform', 'Harvey Rose tribute', 'disability rights'],
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
    tags: ['Real Time Investigation Center', 'One City Shelter Act', 'Mission Street housing', 'algorithmic rent-setting', 'surveillance technology'],
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

// Get the original mock data for Most Watched section (without API updates)
export const getMostWatchedVideos = (): VideoSegment[] => {
  // Hardcode the specific videos and their data for Most Watched
  const mostWatchedData: VideoSegment[] = [
    {
      id: '50121_10',
      title: 'Board of Supervisors Meeting | ID # 50121',
      speakers: ['Connie Chan', 'Matt Dorsey', 'Joel Engardio', 'Jackie Fielder', 'Bilal Mahmood'],
      summary: 'Discussion reveals significant gap between SF\'s 2030 renewable energy targets and current progress, with officials acknowledging major challenges ahead.',
      tags: ['environment', 'renewable energy', 'climate'],
      videoUrl: '/videos/50121_10.mp4',
      clipId: '50121',
      viewId: '10',
      views: '2.3k views',
      startTime: 6295,  // 1:44:55
      duration: '2:15:00',
      date: 'Jun 3'
    },
    {
      id: '50188_10',
      title: 'Board of Supervisors Meeting | ID # 50188',
      speakers: ['Rafael Mandelman', 'Myrna Melgar', 'Danny Sauter', 'Stephen Sherrill', 'Shamann Walton'],
      summary: 'Fire department gets appropriated nearly 8 million dollars for 2024-2025 year.',
      tags: ['fire department', 'budget', 'public safety'],
      videoUrl: '/videos/50188_10.mp4',
      clipId: '50188',
      viewId: '10',
      views: '1.8k views',
      startTime: 1409,  // 23:29
      duration: '1:45:00',
      date: 'Jun 10'
    },
    {
      id: '50291_10',
      title: 'Board of Supervisors Meeting | ID # 50291',
      speakers: ['Chyanne Chen', 'Connie Chan', 'Matt Dorsey', 'Joel Engardio'],
      summary: 'Public requests for a class-action lawsuit to be filed against state-sponsored terrorism of San Francisco, criticizing slow decision-making.',
      tags: ['public-comment', 'legal', 'governance'],
      videoUrl: '/videos/50291_10.mp4',
      clipId: '50291',
      viewId: '10',
      views: '947 views',
      startTime: 5085,  // 1:24:45
      duration: '2:30:00',
      date: 'Jun 24'
    }
  ]
  
  return mostWatchedData
}