const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function uploadDocument(file: File): Promise<{ document_id: string }> {
  const fd = new FormData()
  fd.append('file', file)
  const r = await fetch(`${BASE}/documents`, { method: 'POST', body: fd })
  if (!r.ok) throw new Error('Upload failed')
  return r.json()
}

export async function chatWithDoc(documentId: string, query: string): Promise<{ answer: string }> {
  const r = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId, query })
  })
  if (!r.ok) throw new Error('Chat failed')
  return r.json()
}

export async function analyzeSelection(documentId: string, prompt: string): Promise<{ answer: string }> {
  // Use the same /chat endpoint; backend can expand later for selection context
  return chatWithDoc(documentId, prompt)
}