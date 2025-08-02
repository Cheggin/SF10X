import type { VideoSegment } from '../types'

export const mockVideoData: VideoSegment[] = [
  {
    id: 'housing-discussion',
    title: 'Housing Discussion',
    date: 'Jan 15',
    duration: '23 min',
    speakers: ['Supervisor Johnson'],
    summary: 'New affordable housing rules for SOMA. Passed 7-4 with 18% requirement.',
    tags: ['housing', 'development', 'affordable']
  },
  {
    id: 'transit-budget',
    title: 'Transit Budget',
    date: 'Jan 10',
    duration: '3.2 hrs',
    speakers: ['Supervisor Martinez'],
    summary: 'Muni funding changes and Market St bike lanes. $15M approved for infrastructure upgrades.',
    tags: ['transportation', 'budget', 'infrastructure']
  },
  {
    id: 'small-business-relief',
    title: 'Small Business Relief',
    date: 'Jan 8',
    duration: '27 min',
    speakers: ['Public Comments'],
    summary: 'Citizens request construction impact relief. Committee formed to review proposals.',
    tags: ['business', 'relief', 'public-comment']
  }
]

export const getVideoById = (id: string): VideoSegment | undefined => {
  return mockVideoData.find(video => video.id === id)
}