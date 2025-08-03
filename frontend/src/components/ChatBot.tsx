import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatBotProps {
  sessionId?: string
}

const ChatBot: React.FC<ChatBotProps> = ({ sessionId = 'default' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your SF Board meeting assistant. Ask me anything about the meetings, agenda items, or decisions made.',
      sender: 'bot',
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
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: ChatMessage = {
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
          session_id: sessionId,
          user_query: inputText
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Sorry, I couldn\'t process that request.',
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        sender: 'bot',
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
    <>
      {/* Chat Bubble */}
      <div className="chatbot-container">
        <button
          className={`chat-bubble ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open chat assistant"
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>

        {/* Chat Window */}
        {isOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <div className="chat-header-info">
                <Bot size={20} />
                <div>
                  <h3>SF Meeting Assistant</h3>
                  <span className="status-indicator">Online</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="close-chat-btn"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                >
                  <div className="message-avatar">
                    {message.sender === 'user' ? (
                      <User size={16} />
                    ) : (
                      <Bot size={16} />
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{message.text}</div>
                    <div className="message-time">{formatTime(message.timestamp)}</div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="message bot-message">
                  <div className="message-avatar">
                    <Bot size={16} />
                  </div>
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

            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about SF Board meetings..."
                  className="chat-input"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="send-button"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="chat-footer">
                Powered by SF10X AI
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .chatbot-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .chat-bubble {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #2563eb;
          border: none;
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
        }

        .chat-bubble:hover {
          transform: scale(1.05);
          background: #1d4ed8;
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
        }

        .chat-bubble.open {
          background: #dc2626;
        }

        .chat-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-header {
          background: #2563eb;
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .status-indicator {
          font-size: 12px;
          opacity: 0.8;
        }

        .close-chat-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .close-chat-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          display: flex;
          gap: 8px;
          max-width: 85%;
        }

        .user-message {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .bot-message {
          align-self: flex-start;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-message .message-avatar {
          background: #2563eb;
          color: white;
        }

        .bot-message .message-avatar {
          background: #f1f3f4;
          color: #5f6368;
        }

        .message-content {
          display: flex;
          flex-direction: column;
        }

        .message-text {
          background: #f1f3f4;
          padding: 8px 12px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
        }

        .user-message .message-text {
          background: #2563eb;
          color: white;
        }

        .message-time {
          font-size: 11px;
          color: #9aa0a6;
          margin-top: 4px;
          text-align: right;
        }

        .user-message .message-time {
          text-align: left;
        }

        .typing-indicator {
          background: #f1f3f4;
          padding: 8px 12px;
          border-radius: 18px;
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          background: #9aa0a6;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        .chat-input-container {
          border-top: 1px solid #e8eaed;
          padding: 12px;
        }

        .chat-input-wrapper {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .chat-input {
          flex: 1;
          border: 1px solid #e8eaed;
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 14px;
          outline: none;
          resize: none;
          min-height: 20px;
          max-height: 100px;
          background: white;
          color: #374151;
        }

        .chat-input:focus {
          border-color: #2563eb;
        }

        .send-button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #2563eb;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .send-button:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .send-button:disabled {
          background: #e8eaed;
          color: #9aa0a6;
          cursor: not-allowed;
        }

        .chat-footer {
          text-align: center;
          font-size: 11px;
          color: #9aa0a6;
          margin-top: 8px;
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .chat-window {
            width: calc(100vw - 40px);
            height: calc(100vh - 120px);
            bottom: 80px;
            right: 20px;
          }
        }
      `}</style>
    </>
  )
}

export default ChatBot