import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, FileText, Clock } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  sources?: Source[]
}

interface Source {
  id: string
  title: string
  date: string
  snippet: string
  videoId?: string
}

const AIChatPage: React.FC = () => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant for San Francisco board of supervisors meetings. Ask me anything about past meetings, decisions, or discussions.',
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      console.log('Sending request to API:', {
        url: 'http://192.168.14.116:8000/generate',
        method: 'POST',
        body: {
          session_id: 'test-123',
          user_query: inputText
        }
      })

      const response = await fetch('http://192.168.7.235:8000/generate', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: 'test-123',
          user_query: inputText
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      // Try different possible response fields
      let responseText = data.response || data.message || data.result || data.answer || data.text
      
      // If data is a string, use it directly
      if (typeof data === 'string') {
        responseText = data
      }
      
      // Log what we're actually getting
      console.log('Extracted response text:', responseText)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText || `I received your message but got an unexpected response format. Raw response: ${JSON.stringify(data)}`,
        sender: 'ai',
        timestamp: new Date(),
        sources: [] // Sources can be added from the API response if available
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      let errorText = 'An error occurred while processing your request.'
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorText = 'Unable to connect to the server. Please check if the API is running at http://192.168.14.116:8000'
        } else if (error.message.includes('405')) {
          errorText = 'The /generate endpoint is not available. The backend code for this endpoint appears to be commented out. Please uncomment the @app.post("/generate") endpoint in app/main.py'
        } else {
          errorText = `Error: ${error.message}`
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleSourceClick = (videoId?: string) => {
    if (videoId) {
      navigate(`/video/${videoId}`)
    }
  }

  return (
    <div className="ai-chat-page">
      {/* Header */}
      <div className="ai-chat-header">
        <div className="ai-header-content">
          <button className="ai-back-btn" onClick={() => navigate('/')}>
            SFGovTV++
          </button>
          <div className="ai-header-center">
            <h1>AI Assistant</h1>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="ai-chat-container">
        <div className="ai-messages-wrapper">
          <div className="ai-messages-content">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`ai-chat-message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-bubble">
                  <div className="message-text">{message.text}</div>
                  
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="message-sources">
                      <div className="sources-header">
                        <FileText size={16} />
                        <span>Sources</span>
                      </div>
                      {message.sources.map((source) => (
                        <div 
                          key={source.id} 
                          className="source-card"
                          onClick={() => handleSourceClick(source.videoId)}
                        >
                          <div className="source-title">{source.title}</div>
                          <div className="source-meta">
                            <Clock size={12} />
                            <span>{source.date}</span>
                          </div>
                          <div className="source-snippet">{source.snippet}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="message-time">{formatTime(message.timestamp)}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="ai-chat-message ai-message">
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="ai-input-section">
          <div className="ai-input-container">
            <div className="ai-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Board of Supervisors meetings..."
                className="ai-input"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
                className="ai-send-button"
              >
                <Send size={20} />
              </button>
            </div>
            <div className="ai-input-hint">
              Press Enter to send • Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIChatPage