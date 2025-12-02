type Props = {
  x: number
  y: number
  onExplain: () => void
  onSummarize: () => void
  onClose: () => void
  loading?: boolean
}

export default function SelectionActions({ onExplain, onSummarize, onClose, loading }: Props) {
  return (
    <div 
      className="selection-actions"
      style={{ 
        background: '#1f2937', 
        color: '#fff', 
        padding: '8px 10px', 
        borderRadius: 8, 
        display: 'flex', 
        gap: 8, 
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        alignItems: 'center',
        whiteSpace: 'nowrap'
      }}
    >
      {loading ? (
        <span style={{ padding: '4px 8px', color: '#a5b4fc' }}>Analyzing...</span>
      ) : (
        <>
          <button 
            onClick={onExplain} 
            style={{ 
              background: '#4f46e5', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 6, 
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer'
            }}
          >
            ✨ Explain
          </button>
          <button 
            onClick={onSummarize} 
            style={{ 
              background: '#059669', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 6, 
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer'
            }}
          >
            📝 Summarize
          </button>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              color: '#9ca3af', 
              border: 'none', 
              borderRadius: 6, 
              padding: '6px 8px',
              fontSize: 16,
              lineHeight: 1,
              cursor: 'pointer'
            }}
            title="Close"
          >
            ✕
          </button>
        </>
      )}
    </div>
  )
}