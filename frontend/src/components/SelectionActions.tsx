type Props = {
  x: number
  y: number
  onExplain: () => void
  onClose: () => void
}

export default function SelectionActions({ x, y, onExplain, onClose }: Props) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, background: '#111', color: '#fff', padding: '6px 8px', borderRadius: 6, display: 'flex', gap: 8, zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
      <button onClick={onExplain} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px' }}>Explain</button>
      <button onClick={onClose} style={{ background: 'transparent', color: '#fff', border: '1px solid #555', borderRadius: 4, padding: '4px 8px' }}>Close</button>
    </div>
  )
}