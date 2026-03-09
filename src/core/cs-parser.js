// Unity C# file parser using regex

/**
 * Parse a C# file content and extract namespace and class information
 * @param {string} content - C# file content
 * @returns {{ namespace: string|null, classes: Array<{name: string, kind: string, baseClass: string|null, interfaces: string[], publicMethods: string[]}> }}
 */
export function parseCsFile(content) {
  // Extract namespace
  const namespaceMatch = content.match(/namespace\s+([\w.]+)/)
  const namespace = namespaceMatch ? namespaceMatch[1] : null

  // Find all class/struct/interface declarations
  const typeRegex = /(public|internal|private|protected)?\s*(abstract\s+|sealed\s+|static\s+|partial\s+)*(class|struct|interface)\s+(\w+)(?:\s*:\s*([\w.<>,\s]+))?/g
  
  const classes = []
  let match

  while ((match = typeRegex.exec(content)) !== null) {
    const kind = match[3] // class, struct, or interface
    const name = match[4]
    const inheritancePart = match[5] ? match[5].trim() : null

    let baseClass = null
    let interfaces = []

    if (inheritancePart) {
      // Split by comma and trim
      const parts = inheritancePart.split(',').map(p => p.trim()).filter(p => p)
      if (parts.length > 0) {
        baseClass = parts[0]
        interfaces = parts.slice(1)
      }
    }

    // Extract class body (approximate)
    const classStartIndex = match.index + match[0].length
    const classBody = extractClassBody(content, classStartIndex)

    // Find public methods in class body
    const publicMethods = extractPublicMethods(classBody, name)

    classes.push({
      name,
      kind,
      baseClass,
      interfaces,
      publicMethods
    })
  }

  return { namespace, classes }
}

/**
 * Extract class body content (approximate)
 * @param {string} content - Full file content
 * @param {number} startIndex - Start index after class declaration
 * @returns {string}
 */
function extractClassBody(content, startIndex) {
  let braceCount = 0
  let started = false
  let endIndex = startIndex

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i]
    
    if (char === '{') {
      braceCount++
      started = true
    } else if (char === '}') {
      braceCount--
      if (started && braceCount === 0) {
        endIndex = i
        break
      }
    }
    
    endIndex = i
  }

  return content.substring(startIndex, endIndex + 1)
}

/**
 * Extract public method names from class body
 * @param {string} classBody - Class body content
 * @param {string} className - Class name to exclude constructor
 * @returns {string[]}
 */
function extractPublicMethods(classBody, className) {
  const methodRegex = /public\s+(?:virtual\s+|override\s+|static\s+|async\s+)*[\w<>\[\],\s]+\s+(\w+)\s*\(/g
  const methods = new Set()
  let match

  while ((match = methodRegex.exec(classBody)) !== null) {
    const methodName = match[1]
    // Skip constructor
    if (methodName !== className) {
      methods.add(methodName)
    }
  }

  return Array.from(methods)
}
