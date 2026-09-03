import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, getMemories, sendChatMessage, saveMemory } from './api'
import type { ChatMessage, Memory, MemoryKey } from './types'
import './App.css'

const MEMORY_KEYS: { value: MemoryKey; label: string }[] = [
  { value: 'PRODUCTION_REGION', label: 'Production region' },
  { value: 'DEFAULT_SERVICE', label: 'Default service' },
]

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationId, setConversationId] = useState<string>()
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [chatError, setChatError] = useState<string>()

  const [memories, setMemories] = useState<Memory[]>([])
  const [memoryKey, setMemoryKey] = useState<MemoryKey>('PRODUCTION_REGION')
  const [memoryValue, setMemoryValue] = useState('')
  const [isLoadingMemories, setIsLoadingMemories] = useState(true)
  const [isSavingMemory, setIsSavingMemory] = useState(false)
  const [memoryError, setMemoryError] = useState<string>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadMemories = useCallback(async () => {
    setIsLoadingMemories(true)
    setMemoryError(undefined)

    try {
      setMemories(await getMemories())
    } catch (error) {
      setMemoryError(toErrorMessage(error))
    } finally {
      setIsLoadingMemories(false)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    getMemories()
      .then((result) => {
        if (isCurrent) setMemories(result)
      })
      .catch((error: unknown) => {
        if (isCurrent) setMemoryError(toErrorMessage(error))
      })
      .finally(() => {
        if (isCurrent) setIsLoadingMemories(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  async function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedMessage = message.trim()
    if (!trimmedMessage || isSending) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedMessage,
    }

    setMessages((current) => [...current, userMessage])
    setMessage('')
    setChatError(undefined)
    setIsSending(true)

    try {
      const response = await sendChatMessage({
        conversationId,
        message: trimmedMessage,
      })

      setConversationId(response.conversationId)
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.answer,
          confidence: response.confidence,
        },
      ])
    } catch (error) {
      setChatError(toErrorMessage(error))
    } finally {
      setIsSending(false)
    }
  }

  async function handleMemorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedValue = memoryValue.trim()
    if (!trimmedValue || isSavingMemory) return

    setIsSavingMemory(true)
    setMemoryError(undefined)

    try {
      await saveMemory({ key: memoryKey, value: trimmedValue })
      setMemoryValue('')
      await loadMemories()
    } catch (error) {
      setMemoryError(toErrorMessage(error))
    } finally {
      setIsSavingMemory(false)
    }
  }

  function startNewConversation() {
    setConversationId(undefined)
    setMessages([])
    setChatError(undefined)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">A</span>
          <div>
            <p className="eyebrow">Deployment intelligence</p>
            <h1>AI Assistant</h1>
          </div>
        </div>
        <div className="connection-status">
          <span className="status-dot" aria-hidden="true" />
          Backend configured
        </div>
      </header>

      <div className="workspace">
        <section className="chat-panel" aria-labelledby="chat-heading">
          <div className="panel-heading chat-heading">
            <div>
              <p className="eyebrow">Investigation workspace</p>
              <h2 id="chat-heading">Deployment chat</h2>
            </div>
            <button className="secondary-button" type="button" onClick={startNewConversation}>
              New conversation
            </button>
          </div>

          <div className="conversation-meta">
            <span>Conversation</span>
            <code>{conversationId ?? 'Starts with your first message'}</code>
          </div>

          <div className="message-list" aria-live="polite">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon" aria-hidden="true">⌁</div>
                <h3>What should we investigate?</h3>
                <p>Ask about a failed deployment, service status, or recent logs.</p>
                <div className="suggestions">
                  {[
                    'Why did payments-service fail?',
                    'Check the status of orders-service',
                    'Show deployment logs for payments-service',
                  ].map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => setMessage(suggestion)}>
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((chatMessage) => (
              <article className={`message ${chatMessage.role}`} key={chatMessage.id}>
                <div className="message-label">
                  <span>{chatMessage.role === 'user' ? 'You' : 'Assistant'}</span>
                  {chatMessage.confidence && (
                    <span className={`confidence ${chatMessage.confidence.toLowerCase()}`}>
                      {chatMessage.confidence.toLowerCase()} confidence
                    </span>
                  )}
                </div>
                <p>{chatMessage.content}</p>
              </article>
            ))}

            {isSending && (
              <div className="thinking" role="status">
                <span /><span /><span /> Investigating deployment context
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {chatError && <div className="error-banner" role="alert">{chatError}</div>}

          <form className="composer" onSubmit={handleChatSubmit}>
            <label htmlFor="chat-message">Message</label>
            <textarea
              id="chat-message"
              maxLength={4000}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              placeholder="Describe the deployment issue…"
              rows={3}
              value={message}
            />
            <div className="composer-footer">
              <span>{message.length} / 4000 · Shift + Enter for a new line</span>
              <button className="primary-button" disabled={!message.trim() || isSending} type="submit">
                {isSending ? 'Investigating…' : 'Send message'}
              </button>
            </div>
          </form>
        </section>

        <aside className="memory-panel" aria-labelledby="memory-heading">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Persistent context</p>
              <h2 id="memory-heading">Memory</h2>
            </div>
            <button className="icon-button" type="button" onClick={() => void loadMemories()} aria-label="Refresh memories">
              ↻
            </button>
          </div>
          <p className="panel-description">
            Saved facts are included in every investigation.
          </p>

          <div className="memory-list">
            {isLoadingMemories && <p className="muted">Loading memories…</p>}
            {!isLoadingMemories && memories.length === 0 && (
              <p className="muted">No persistent memory saved yet.</p>
            )}
            {memories.map((memory) => (
              <article className="memory-card" key={memory.id}>
                <span>{formatMemoryKey(memory.key)}</span>
                <strong>{memory.value}</strong>
                <time dateTime={memory.updatedAt}>
                  Updated {formatDate(memory.updatedAt)}
                </time>
              </article>
            ))}
          </div>

          <form className="memory-form" onSubmit={handleMemorySubmit}>
            <h3>Save a fact</h3>
            <label htmlFor="memory-key">Memory type</label>
            <select id="memory-key" value={memoryKey} onChange={(event) => setMemoryKey(event.target.value as MemoryKey)}>
              {MEMORY_KEYS.map((key) => <option key={key.value} value={key.value}>{key.label}</option>)}
            </select>
            <label htmlFor="memory-value">Value</label>
            <input
              id="memory-value"
              onChange={(event) => setMemoryValue(event.target.value)}
              placeholder={memoryKey === 'PRODUCTION_REGION' ? 'e.g. eu-central-1' : 'e.g. payments-service'}
              value={memoryValue}
            />
            <button className="primary-button full-width" disabled={!memoryValue.trim() || isSavingMemory} type="submit">
              {isSavingMemory ? 'Saving…' : 'Save memory'}
            </button>
          </form>

          {memoryError && <div className="error-banner" role="alert">{memoryError}</div>}
        </aside>
      </div>
    </main>
  )
}

function toErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message
  return 'Unable to reach the assistant API. Check that the backend is running.'
}

function formatMemoryKey(key: string) {
  return key.toLowerCase().split('_').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ')
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default App
