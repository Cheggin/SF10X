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
      text: 'Hello! I\'m your AI assistant for San Francisco city council meetings. Ask me anything about past meetings, decisions, or discussions.',
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
      const response = await fetch('http://0.0.0.0:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: 'ai-rag-mode',
          user_query: inputText
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Mock sources for demonstration - in real implementation, these would come from the API
      const mockSources: Source[] = [
        {
          id: '1',
          title: 'Board of Supervisors Meeting',
          date: 'Jan 15, 2024',
          snippet: 'Discussion on affordable housing requirements in SOMA district...',
          videoId: '50121_10'
        },
        {
          id: '2',
          title: 'Transit Budget Discussion',
          date: 'Jan 10, 2024',
          snippet: 'Muni funding changes and Market St bike lanes were discussed...',
          videoId: '50188_10'
        }
      ]
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Based on the city council meeting records, here\'s what I found...',
        sender: 'ai',
        timestamp: new Date(),
        sources: mockSources
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
                onKeyPress={handleKeyPress}
                placeholder="Ask about city council meetings..."
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