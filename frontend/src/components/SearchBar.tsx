type Props = { onSearch: (q: string) => void }

export default function SearchBar({ onSearch }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input placeholder="Search within document..." onKeyDown={e => {
        if (e.key === 'Enter') onSearch((e.target as HTMLInputElement).value)
      }} />
      <button onClick={() => {
        const inp = document.querySelector<HTMLInputElement>('input[placeholder="Search within document..."]')
        if (inp) onSearch(inp.value)
      }}>Search</button>
    </div>
  )
}