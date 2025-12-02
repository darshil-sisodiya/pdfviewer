import { useState } from 'react'
import { chatWithDoc } from '../lib/api'

type Props = { documentId: string | null }

export default function ChatPanel({ documentId }: Props) {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!documentId || !query.trim()) return
    setMessages(m => [...m, { role: 'user', content: query }])
    setLoading(true)
    try {
      const res = await chatWithDoc(documentId, query)
      setMessages(m => [...m, { role: 'assistant', content: res.answer }])
    } finally {
      setLoading(false)
      setQuery('')
    }
  }

  return (
    <div style={{ borderLeft: '1px solid #eee', padding: 12, overflow: 'auto' }}>
      <h3>Chat</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask about this PDF..." style={{ flex: 1 }} />
        <button onClick={send} disabled={!documentId || loading}>Send</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ background: m.role === 'user' ? '#f5f5f5' : '#eef7ff', padding: 8, borderRadius: 6 }}>
            {m.content}
          </div>
        ))}
      </div>
    </div>
  )
}