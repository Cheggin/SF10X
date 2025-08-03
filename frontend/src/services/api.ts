export interface AgendaItem {
  agenda_name: string
  agenda_summary: string
}

export interface SummaryResponse {
  meeting_summary: string
  agenda_summary: AgendaItem[]
}

export interface TimestampItem {
  time_seconds: number
  time_formatted: string
  agenda_name: string
}

const API_BASE_URL = 'http://0.0.0.0:8000'

export const fetchSummary = async (clipId: string, viewId: string): Promise<SummaryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/summary?clip_id=${clipId}&view_id=${viewId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching summary:', error)
    throw error
  }
}

export const fetchTimestamps = async (clipId: string, viewId: string): Promise<TimestampItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/timestamps?clip_id=${clipId}&view_id=${viewId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching timestamps:', error)
    throw error
  }
}