import { useRef, useState } from 'react'
import { uploadDocument } from '../lib/api'

type Props = { onOpen: (docId: string, url: string) => void }

export default function Sidebar({ onOpen }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [docs, setDocs] = useState<{ id: string, name: string, url?: string }[]>([])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const res = await uploadDocument(file)
    const url = URL.createObjectURL(file)
    const doc = { id: res.document_id, name: file.name, url }
    setDocs(d => [doc, ...d])
    onOpen(doc.id, url)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div style={{ borderRight: '1px solid #eee', padding: 12 }}>
      <h3>Documents</h3>
      <input ref={inputRef} type="file" accept="application/pdf" onChange={handleFile} />
      <ul>
        {docs.map(d => (
          <li key={d.id}>
            <button onClick={() => onOpen(d.id, d.url || '')}>{d.name}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}