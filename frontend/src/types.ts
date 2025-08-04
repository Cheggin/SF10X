export interface VideoSegment {
  id: string
  title: string
  date: string
  duration: string
  speakers: string[]
  summary: string
  tags: string[]
  thumbnailUrl?: string
  videoUrl?: string
  clipId?: string
  viewId?: string
  views?: string
  startTime?: number  // Start time in seconds for featured/most watched videos
}