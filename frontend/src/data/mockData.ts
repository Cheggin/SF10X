import type { VideoSegment } from '../types'

export const mockVideoData: VideoSegment[] = [
  {
    id: 'housing-discussion',
    title: 'Board of Supervisors Meeting',
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

export const getPopularVideos = (): VideoSegment[] => {
  // Return a selection of popular/featured videos
  return [
    {
      id: 'housing-vote-highlights',
      title: 'Key Moments: Housing Vote',
      date: 'Jan 15',
      duration: '8 min',
      speakers: ['Supervisor Johnson', 'Supervisor Chen'],
      summary: 'Heated debate over 18% affordable housing requirement. See the decisive moments that led to the 7-4 vote.',
      tags: ['housing', 'highlights', 'vote']
    },
    {
      id: 'public-transit-funding',
      title: 'Transit Funding Approved',
      date: 'Jan 10', 
      duration: '12 min',
      speakers: ['Supervisor Martinez'],
      summary: '$15M funding approved for Muni improvements. Includes new electric buses and Market Street upgrades.',
      tags: ['transportation', 'funding', 'muni']
    },
    {
      id: 'small-business-testimony',
      title: 'Business Owners Speak Out',
      date: 'Jan 8',
      duration: '15 min',
      speakers: ['Public Comments'],
      summary: 'Emotional testimony from SOMA business owners about construction impacts. Committee promises swift action.',
      tags: ['business', 'testimony', 'relief']
    },
    {
      id: 'budget-breakdown',
      title: 'Budget Overview',
      date: 'Jan 5',
      duration: '6 min',
      speakers: ['City Controller'],
      summary: 'Quick breakdown of this quarter\'s budget priorities: housing, transportation, and public safety.',
      tags: ['budget', 'overview', 'priorities']
    }
  ]
}