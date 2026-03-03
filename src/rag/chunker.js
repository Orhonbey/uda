// src/rag/chunker.js

export function chunkMarkdown(text, options = {}) {
  const {
    source = 'unknown',
    engine = null,
    tags = [],
    type = 'knowledge',
    maxChunkSize = 512,
  } = options;

  const baseMetadata = { source, engine, tags, type, date: new Date().toISOString().split('T')[0] };
  const chunks = [];
  const lines = text.split('\n');

  let currentChunk = { heading: '', lines: [], type: 'text' };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block detection
    if (line.startsWith('```')) {
      // Flush current text chunk
      if (currentChunk.lines.length > 0) {
        chunks.push(buildChunk(currentChunk, baseMetadata, maxChunkSize));
        currentChunk = { heading: currentChunk.heading, lines: [], type: 'text' };
      }

      // Collect code block
      const codeLines = [line];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) codeLines.push(lines[i]); // closing ```

      chunks.push({
        content: codeLines.join('\n'),
        type: 'code',
        metadata: { ...baseMetadata },
      });
      continue;
    }

    // Heading detection
    if (line.match(/^#{1,6}\s/)) {
      // Flush previous chunk
      if (currentChunk.lines.length > 0) {
        chunks.push(buildChunk(currentChunk, baseMetadata, maxChunkSize));
      }
      currentChunk = { heading: line, lines: [line], type: 'text' };
      continue;
    }

    currentChunk.lines.push(line);
  }

  // Flush last chunk
  if (currentChunk.lines.length > 0) {
    chunks.push(buildChunk(currentChunk, baseMetadata, maxChunkSize));
  }

  return chunks;
}

function buildChunk(chunk, baseMetadata, maxChunkSize) {
  const content = chunk.lines.join('\n').trim();

  // If within size limit, return as-is
  if (content.length <= maxChunkSize) {
    return {
      content,
      type: chunk.type,
      metadata: { ...baseMetadata },
    };
  }

  // Split oversized chunks by paragraph
  // For simplicity, return single chunk trimmed (full split in future)
  return {
    content: content.slice(0, maxChunkSize),
    type: chunk.type,
    metadata: { ...baseMetadata },
  };
}
