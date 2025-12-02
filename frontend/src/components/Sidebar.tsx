import { useRef, useState } from 'react'
import { uploadDocument } from '../lib/api'

type Props = { onOpen: (docId: string, url: string) => void }

export default function Sidebar({ onOpen }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [docs, setDocs] = useState<{ id: string, name: string, url?: string, uploading?: boolean }[]>([])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Always show the local preview immediately
    const url = URL.createObjectURL(file)
    const tempId = `local_${Date.now()}`
    setDocs(d => [{ id: tempId, name: file.name, url, uploading: true }, ...d])
    // Show PDF immediately but with temp ID (AI features won't work until upload completes)
    onOpen(tempId, url)

    // Upload in background; replace temp entry with server id when done
    try {
      const res = await uploadDocument(file)
      const newId = res.document_id
      setDocs(d => [{ id: newId, name: file.name, url, uploading: false }, ...d.filter(x => x.id !== tempId)])
      // Update parent with real document ID so AI features work
      onOpen(newId, url)
    } catch (err) {
      console.error('Upload failed', err)
      // Mark as failed but keep local preview
      setDocs(d => d.map(x => x.id === tempId ? { ...x, uploading: false } : x))
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div style={{ borderRight: '1px solid #eee', padding: 12 }}>
      <h3>Documents</h3>
      <input ref={inputRef} type="file" accept="application/pdf" onChange={handleFile} />
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0' }}>
        {docs.map(d => (
          <li key={d.id} style={{ marginBottom: 8 }}>
            <button 
              disabled={!d.url} 
              onClick={() => d.url && onOpen(d.id, d.url)}
              style={{ 
                width: '100%', 
                textAlign: 'left', 
                padding: '8px 12px', 
                background: '#f3f4f6', 
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                cursor: d.url ? 'pointer' : 'default'
              }}
            >
              {d.name}
              {d.uploading && <span style={{ marginLeft: 8, color: '#6366f1', fontSize: 12 }}>Uploading...</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}