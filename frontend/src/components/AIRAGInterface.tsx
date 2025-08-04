import React, { useState, useRef, useEffect } from 'react'
import { Send, X, Sparkles, FileText, Clock } from 'lucide-react'

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

interface AIRAGInterfaceProps {
  onClose: () => void
}

const AIRAGInterface: React.FC<AIRAGInterfaceProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant for San Francisco Board of Supervisors meetings. Ask me anything about past meetings, decisions, or discussions.',
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
      const response = await fetch('http://192.168.7.235:8000/generate', {
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
        text: data.response || 'Based on the Board of Supervisors meeting records, here\'s what I found...',
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

  return (
    <div className="ai-rag-overlay">
      <div className="ai-rag-container">
        {/* Header */}
        <div className="ai-rag-header">
          <div className="ai-header-left">
            <Sparkles size={24} className="ai-icon" />
            <h2>AI Assistant</h2>
          </div>
          <button onClick={onClose} className="ai-close-btn">
            <X size={24} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="ai-messages-area">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`ai-message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                
                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="message-sources">
                    <div className="sources-header">
                      <FileText size={16} />
                      <span>Sources</span>
                    </div>
                    {message.sources.map((source) => (
                      <div key={source.id} className="source-card">
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
            <div className="ai-message">
              <div className="message-content">
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

        {/* Input Area */}
        <div className="ai-input-area">
          <div className="ai-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
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
  )
}

export default AIRAGInterface