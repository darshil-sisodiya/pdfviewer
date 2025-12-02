import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import SelectionActions from './SelectionActions'
import { analyzeSelection } from '../lib/api'

// Set up the worker - use the matching version from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

type Props = { fileUrl: string | null, documentId: string | null }

export default function PdfViewer({ fileUrl, documentId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [selection, setSelection] = useState<{ text: string, x: number, y: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fallback, setFallback] = useState<boolean>(false)

  useEffect(() => {
    let cancelled = false
    async function renderAllPages() {
      if (!fileUrl || !containerRef.current) return
      const container = containerRef.current
      // Reset container
      container.innerHTML = ''
      setError(null)
      setLoading(true)
      setFallback(false)

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

      let doc: PDFDocumentProxy
      try {
        const loadingTask = pdfjsLib.getDocument(src)
        doc = await loadingTask.promise
      } catch (e: any) {
        console.error('PDF load error', e)
        // Switch to native embed fallback if PDF.js cannot load
        setFallback(true)
        setError('Failed to open with PDF.js; using browser viewer.')
        setLoading(false)
        return
      }
      if (cancelled) return
      setPdf(doc)
      const scale = 1.5

      for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
        if (cancelled) break
        const page = await doc.getPage(pageNum)
        const viewport = page.getViewport({ scale })

        // Create page container
        const pageContainer = document.createElement('div')
        pageContainer.className = 'pdf-page'
        pageContainer.style.position = 'relative'
        pageContainer.style.margin = '16px auto'
        pageContainer.style.width = `${viewport.width}px`
        pageContainer.style.height = `${viewport.height}px`
        pageContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
        pageContainer.style.background = '#fff'

        // Create canvas for rendering
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.style.display = 'block'
        pageContainer.appendChild(canvas)

        // Create text layer for selection
        const textDiv = document.createElement('div')
        textDiv.className = 'textLayer'
        textDiv.style.position = 'absolute'
        textDiv.style.left = '0'
        textDiv.style.top = '0'
        textDiv.style.right = '0'
        textDiv.style.bottom = '0'
        textDiv.style.overflow = 'hidden'
        textDiv.style.lineHeight = '1.0'
        pageContainer.appendChild(textDiv)

        container.appendChild(pageContainer)

        try {
          // Render canvas
          await page.render({ canvasContext: ctx, viewport }).promise

          // Render text layer for selection using renderTextLayer
          const textContent = await page.getTextContent()
          
          // Check if TextLayer class exists (pdfjs-dist 4.x)
          if (pdfjsLib.TextLayer) {
            const textLayer = new pdfjsLib.TextLayer({
              textContentSource: textContent,
              container: textDiv,
              viewport: viewport,
            })
            await textLayer.render()
          } else if ((pdfjsLib as any).renderTextLayer) {
            // Fallback for older versions
            await (pdfjsLib as any).renderTextLayer({
              textContent: textContent,
              container: textDiv,
              viewport: viewport,
              textDivs: []
            }).promise
          }
        } catch (e: any) {
          console.error('Page render error', e)
          // Don't break on text layer errors, just skip text selection for this page
        }
      }
      setLoading(false)
    }
    renderAllPages()
    return () => { cancelled = true; if (pdf) pdf.destroy() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl])

  // Handle text selection
  useEffect(() => {
    function handleMouseUp(ev: MouseEvent) {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      
      // Small delay to ensure selection is complete
      setTimeout(() => {
        const sel = window.getSelection()
        const text = (sel?.toString() || '').trim()
        
        if (text && text.length > 0 && sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          const wrapperRect = wrapper.getBoundingClientRect()
          
          // Position popup relative to the wrapper (scrollable container)
          const x = rect.left - wrapperRect.left + wrapper.scrollLeft + (rect.width / 2) - 80
          const y = rect.top - wrapperRect.top + wrapper.scrollTop - 50
          
          console.log('Selection detected:', text.substring(0, 50), 'at', x, y)
          setSelection({ text, x: Math.max(10, x), y: Math.max(10, y) })
        }
      }, 10)
    }
    
    function handleMouseDown(ev: MouseEvent) {
      const target = ev.target as HTMLElement
      // Clear selection when clicking outside the popup
      if (!target.closest('.selection-actions') && !target.closest('.analysis-result')) {
        if (!target.closest('.textLayer')) {
          setSelection(null)
        }
      }
    }
    
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown)
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)

  // Check if document is still uploading (has local_ prefix)
  const isUploading = documentId?.startsWith('local_') ?? false

  async function handleExplain() {
    if (!selection?.text) return
    if (!documentId || isUploading) {
      setAnalysisResult('Please wait for the document to finish uploading before using AI analysis.')
      return
    }
    setAnalyzing(true)
    setAnalysisResult(null)
    try {
      const prompt = `Explain the following selection from the document in simple terms, and include key points:\n\n"${selection.text}"`
      const res = await analyzeSelection(documentId, prompt)
      setAnalysisResult(res.answer)
    } catch (err: any) {
      console.error('Analysis failed', err)
      setAnalysisResult('Failed to analyze the selection. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleSummarize() {
    if (!selection?.text) return
    if (!documentId || isUploading) {
      setAnalysisResult('Please wait for the document to finish uploading before using AI analysis.')
      return
    }
    setAnalyzing(true)
    setAnalysisResult(null)
    try {
      const prompt = `Provide a brief summary of the following text from the document:\n\n"${selection.text}"`
      const res = await analyzeSelection(documentId, prompt)
      setAnalysisResult(res.answer)
    } catch (err: any) {
      console.error('Summary failed', err)
      setAnalysisResult('Failed to summarize. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  function handleCloseAnalysis() {
    setAnalysisResult(null)
    setSelection(null)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', overflow: 'auto', height: '100%', background: '#e5e5e5' }}>
      {!fileUrl && (
        <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>
          <p style={{ fontSize: 18 }}>No PDF selected</p>
          <p>Use "Choose File" in the left sidebar to open a PDF.</p>
        </div>
      )}
      {fileUrl && !fallback && (
        <div ref={containerRef} className="pdfViewer" style={{ margin: '0 auto', position: 'relative', minHeight: '80vh', padding: '16px 0' }} />
      )}
      {fallback && fileUrl && (
        <div style={{ width: '100%', height: '100%' }}>
          <iframe 
            src={fileUrl} 
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="PDF Document"
          />
        </div>
      )}
      {loading && (
        <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '16px 24px', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100 }}>
          Loading PDF…
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', left: 12, top: 12, background: '#fee2e2', color: '#b91c1c', padding: '8px 12px', borderRadius: 6, boxShadow: '0 1px 6px rgba(0,0,0,0.1)', zIndex: 50 }}>{error}</div>
      )}
      {selection && !analysisResult && (
        <div style={{ position: 'absolute', left: selection.x, top: selection.y, zIndex: 100 }}>
          <SelectionActions
            x={0}
            y={0}
            onExplain={handleExplain}
            onSummarize={handleSummarize}
            onClose={() => setSelection(null)}
            loading={analyzing}
          />
        </div>
      )}
      {analysisResult && (
        <>
          <div 
            onClick={handleCloseAnalysis}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} 
          />
          <div 
            className="analysis-result"
            style={{ 
              position: 'fixed', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              background: '#fff', 
              padding: 24, 
              borderRadius: 12, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', 
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              zIndex: 1000 
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 18 }}>AI Analysis</h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#333' }}>{analysisResult}</div>
            <button 
              onClick={handleCloseAnalysis}
              style={{ marginTop: 16, background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  )
}