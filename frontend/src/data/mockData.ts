import type { VideoSegment } from '../types'

export const mockVideoData: VideoSegment[] = [
  {
    id: '50121_10',
    title: 'Board of Supervisors Meeting',
    date: 'Jan 15',
    duration: '23 min',
    speakers: ['Supervisor Johnson'],
    summary: 'New affordable housing rules for SOMA. Passed 7-4 with 18% requirement.',
    tags: ['housing', 'development', 'affordable'],
    videoUrl: '/videos/50121_10.mp4',
    clipId: '50121',
    viewId: '10'
  },
  {
    id: '50188_10',
    title: 'Transit Budget Discussion',
    date: 'Jan 10',
    duration: '18 min',
    speakers: ['Supervisor Martinez'],
    summary: 'Muni funding changes and Market St bike lanes. $15M approved for infrastructure upgrades.',
    tags: ['transportation', 'budget', 'infrastructure'],
    videoUrl: '/videos/50188_10.mp4',
    clipId: '50188',
    viewId: '10'
  },
  {
    id: '50291_10',
    title: 'Small Business Relief',
    date: 'Jan 8',
    duration: '15 min',
    speakers: ['Public Comments'],
    summary: 'Citizens request construction impact relief. Committee formed to review proposals.',
    tags: ['business', 'relief', 'public-comment'],
    videoUrl: '/videos/50291_10.mp4',
    clipId: '50291',
    viewId: '10'
  },
  {
    id: '50412_10',
    title: 'Public Safety Budget',
    date: 'Jan 5',
    duration: '22 min',
    speakers: ['Chief of Police'],
    summary: 'Discussion on police department budget allocation and community safety initiatives.',
    tags: ['public-safety', 'budget', 'police'],
    videoUrl: '/videos/50412_10.mp4',
    clipId: '50412',
    viewId: '10'
  },
  {
    id: '50523_10',
    title: 'Environmental Policy',
    date: 'Dec 28',
    duration: '19 min',
    speakers: ['Environmental Committee'],
    summary: 'New environmental policies and climate action initiatives for the city.',
    tags: ['environment', 'climate', 'policy'],
    videoUrl: '/videos/50523_10.mp4',
    clipId: '50523',
    viewId: '10'
  }
]

export const getVideoById = (id: string): VideoSegment | undefined => {
  return mockVideoData.find(video => video.id === id)
}

export const getPopularVideos = (): VideoSegment[] => {
  // Return the first 4 videos as featured/popular
  return mockVideoData.slice(0, 4)
}