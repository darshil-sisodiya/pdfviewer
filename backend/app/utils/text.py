def chunk_text(text: str, max_chars: int = 1200, overlap: int = 100):
    """Robust chunking for long text to prevent excessive memory usage.
    - Skips empty/whitespace-only content
    - Ensures forward progress even with large overlap
    - Caps chunk count to a sane limit
    """
    if not text:
        return []
    s = text.strip()
    if not s:
        return []
    # Sanity on params
    if max_chars <= 0:
        max_chars = 1000
    if overlap < 0:
        overlap = 0

    chunks = []
    i = 0
    n = len(s)
    # Cap to avoid runaway chunk counts for pathological inputs
    max_chunks = (n // max(1, max_chars - overlap)) + 2
    produced = 0

    while i < n and produced < max_chunks:
        end = min(i + max_chars, n)
        chunk = s[i:end]
        if chunk:
            chunks.append(chunk)
            produced += 1
        # advance with overlap
        step = max(1, max_chars - overlap)
        i += step

    return chunks