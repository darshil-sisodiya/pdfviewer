import { useEffect, useRef, useState } from 'react'
import { GlobalWorkerOptions, getDocument, PDFDocumentProxy } from 'pdfjs-dist'
// PDF.js simple page viewer with text layer
import { EventBus, PDFPageView } from 'pdfjs-dist/web/pdf_viewer.mjs'
import 'pdfjs-dist/web/pdf_viewer.css'
import SelectionActions from './SelectionActions'
import { analyzeSelection } from '../lib/api'

// Use a module worker for pdf.js (v4) with Vite
GlobalWorkerOptions.workerPort = new Worker(
  new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url),
  { type: 'module' }
)

type Props = { fileUrl: string | null, documentId: string | null }

export default function PdfViewer({ fileUrl, documentId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [selection, setSelection] = useState<{ text: string, x: number, y: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    async function renderAllPages() {
      if (!fileUrl || !containerRef.current) return
      const container = containerRef.current
      // Reset container
      container.innerHTML = ''

      let src: any = fileUrl
      try {
        if (fileUrl.startsWith('blob:')) {
          const res = await fetch(fileUrl)
          const buf = await res.arrayBuffer()
          src = { data: buf }
        } else {
          src = { url: fileUrl }
        }
      } catch (e) {
        console.error('Failed to fetch PDF data', e)
        src = { url: fileUrl }
      }

      const doc = await getDocument(src).promise
      if (cancelled) return
      setPdf(doc)

      const eventBus = new EventBus()
      const scale = 1.25

      for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
        if (cancelled) break
        const page = await doc.getPage(pageNum)
        const viewport = page.getViewport({ scale })

        const pageView = new PDFPageView({
          container,
          id: pageNum,
          scale,
          defaultViewport: viewport,
          eventBus,
          textLayerMode: 1,
        })
        // @ts-ignore
        pageView.setPdfPage(page)
        await pageView.draw()
      }
    }
    renderAllPages()
    return () => { cancelled = true; if (pdf) pdf.destroy() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function onMouseUp(ev: MouseEvent) {
      const sel = window.getSelection()
      const text = (sel?.toString() || '').trim()
      if (text) {
        const rect = sel!.getRangeAt(0).getBoundingClientRect()
        const host = el.getBoundingClientRect()
        setSelection({ text, x: rect.left - host.left, y: rect.top - host.top - 36 })
      } else {
        setSelection(null)
      }
    }
    el.addEventListener('mouseup', onMouseUp)
    return () => el.removeEventListener('mouseup', onMouseUp)
  }, [])

  async function handleExplain() {
    if (!selection?.text || !documentId) return
    const prompt = `Explain the following selection from the document in simple terms, and include key points:\n\n${selection.text}`
    const res = await analyzeSelection(documentId, prompt)
    alert(res.answer)
    setSelection(null)
  }

  return (
    <div style={{ position: 'relative', overflow: 'auto' }}>
      <div ref={containerRef} className="pdfViewer" style={{ margin: '0 auto', position: 'relative' }} />
      {selection && (
        <SelectionActions
          x={selection.x}
          y={selection.y}
          onExplain={handleExplain}
          onClose={() => setSelection(null)}
        />
      )}
    </div>
  )
}