def chunk_text(text: str, max_chars: int = 1200, overlap: int = 100):
    chunks = []
    i = 0
    n = len(text)
    while i < n:
        end = min(i + max_chars, n)
        chunks.append(text[i:end])
        i = end - overlap
        if i < 0:
            i = 0
    return chunks