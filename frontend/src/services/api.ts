export interface AgendaItem {
  agenda_name: string
  agenda_summary: string
}

export interface SummaryResponse {
  meeting_summary: string
  agenda_summary: AgendaItem[]
  tags?: string[]
}

export interface TimestampItem {
  time_seconds: number
  time_formatted: string
  agenda_name: string
}

const API_BASE_URL = 'http://0.0.0.0:8000'

// In-memory cache for API responses
const summaryCache = new Map<string, SummaryResponse>()
const timestampCache = new Map<string, TimestampItem[]>()

// Retry utility function
const retryFetch = async (url: string, options: RequestInit = {}, maxRetries: number = 3, delay: number = 1000): Promise<Response> => {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) {
        return response
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    } catch (error) {
      lastError = error as Error
      console.warn(`Attempt ${attempt}/${maxRetries} failed for ${url}:`, error)
      
      if (attempt < maxRetries) {
        // Exponential backoff: wait longer between retries
        const waitTime = delay * Math.pow(2, attempt - 1)
        console.log(`Retrying in ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed')
}

export const fetchSummary = async (clipId: string, viewId: string): Promise<SummaryResponse> => {
  const cacheKey = `${clipId}_${viewId}`
  
  // Check cache first
  if (summaryCache.has(cacheKey)) {
    console.log(`Using cached summary for ${cacheKey}`)
    return summaryCache.get(cacheKey)!
  }
  
  try {
    const response = await retryFetch(`${API_BASE_URL}/summary?clip_id=${clipId}&view_id=${viewId}`)
    const data = await response.json()
    
    // Cache the successful response
    summaryCache.set(cacheKey, data)
    console.log(`Cached summary for ${cacheKey}`)
    
    return data
  } catch (error) {
    console.error('Error fetching summary after retries:', error)
    throw error
  }
}

export const fetchTimestamps = async (clipId: string, viewId: string): Promise<TimestampItem[]> => {
  const cacheKey = `${clipId}_${viewId}`
  
  // Check cache first
  if (timestampCache.has(cacheKey)) {
    console.log(`Using cached timestamps for ${cacheKey}`)
    return timestampCache.get(cacheKey)!
  }
  
  try {
    const response = await retryFetch(`${API_BASE_URL}/timestamps?clip_id=${clipId}&view_id=${viewId}`)
    const data = await response.json()
    
    // Cache the successful response
    timestampCache.set(cacheKey, data)
    console.log(`Cached timestamps for ${cacheKey}`)
    
    return data
  } catch (error) {
    console.error('Error fetching timestamps after retries:', error)
    throw error
  }
}

// Optional: Export functions to manage cache (for debugging/clearing if needed)
export const clearCache = () => {
  summaryCache.clear()
  timestampCache.clear()
  console.log('API cache cleared')
}

export const getCacheStats = () => {
  return {
    summaryCount: summaryCache.size,
    timestampCount: timestampCache.size,
    summaryKeys: Array.from(summaryCache.keys()),
    timestampKeys: Array.from(timestampCache.keys())
  }
}