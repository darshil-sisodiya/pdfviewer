import { useState } from 'react'
import { chatWithDoc } from '../lib/api'

type Props = { documentId: string | null }

export default function ChatPanel({ documentId }: Props) {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
  const [loading, setLoading] = useState(false)

  // Check if document is still uploading (has local_ prefix)
  const isUploading = documentId?.startsWith('local_') ?? false
  const canChat = documentId && !isUploading

  async function send() {
    if (!canChat || !query.trim()) return
    const userQuery = query.trim()
    setMessages(m => [...m, { role: 'user', content: userQuery }])
    setLoading(true)
    setQuery('')
    try {
      const res = await chatWithDoc(documentId, userQuery)
      setMessages(m => [...m, { role: 'assistant', content: res.answer }])
    } catch (err) {
      console.error('Chat error', err)
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, there was an error processing your request. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div style={{ borderLeft: '1px solid #eee', padding: 12, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px' }}>Chat</h3>
      {!documentId && (
        <p style={{ color: '#666', fontSize: 14 }}>Open a PDF to start chatting about it.</p>
      )}
      {isUploading && (
        <p style={{ color: '#6366f1', fontSize: 14 }}>Uploading document... Chat will be available shortly.</p>
      )}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div 
            key={i} 
            style={{ 
              background: m.role === 'user' ? '#f3f4f6' : '#eef2ff', 
              padding: '10px 12px', 
              borderRadius: 8,
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '90%',
              whiteSpace: 'pre-wrap'
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{ color: '#6366f1', fontSize: 14, padding: 8 }}>Thinking...</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder={canChat ? "Ask about this PDF..." : "Upload a PDF first..."}
          disabled={!canChat}
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} 
        />
        <button 
          onClick={send} 
          disabled={!canChat || loading || !query.trim()}
          style={{ 
            padding: '10px 16px', 
            borderRadius: 8, 
            background: canChat && query.trim() ? '#4f46e5' : '#e5e7eb',
            color: canChat && query.trim() ? '#fff' : '#9ca3af',
            border: 'none',
            fontWeight: 500
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}