import { useState } from 'react'
import PdfViewer from './components/PdfViewer'
import ChatPanel from './components/ChatPanel'
import Sidebar from './components/Sidebar'

export default function App() {
  const [currentDocId, setCurrentDocId] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 360px', height: '100vh' }}>
      <Sidebar onOpen={(id, url) => { setCurrentDocId(id); setFileUrl(url) }} />
      <PdfViewer fileUrl={fileUrl} documentId={currentDocId} />
      <ChatPanel documentId={currentDocId} />
    </div>
  )
}