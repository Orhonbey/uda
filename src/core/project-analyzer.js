// src/core/project-analyzer.js
import { readdir, readFile, stat, writeFile, mkdir } from 'fs/promises'
import { join, dirname, basename } from 'path'

const DEFAULT_SKIP_DIRS = ['node_modules', '.uda', '.git', 'Library', 'Temp', 'Logs', 'obj', '.godot']

export async function walkDir(dir, callback, skipDirs = DEFAULT_SKIP_DIRS) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!skipDirs.includes(entry.name)) {
          await walkDir(fullPath, callback, skipDirs)
        }
      } else if (entry.isFile()) {
        await callback(fullPath, entry.name)
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }
}

async function analyzeUnityProject(root) {
  const result = {
    engine: 'unity',
    engineVersion: null,
    scriptCount: 0,
    scenes: [],
    directories: [],
    assemblies: []
  }

  // Read engine version
  try {
    const versionPath = join(root, 'ProjectSettings', 'ProjectVersion.txt')
    const versionContent = await readFile(versionPath, 'utf8')
    const match = versionContent.match(/m_EditorVersion:\s*(.+)/)
    if (match) {
      result.engineVersion = match[1].trim()
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }

  // Analyze Assets directory
  const assetsPath = join(root, 'Assets')
  try {
    const entries = await readdir(assetsPath, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        result.directories.push(entry.name)
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }

  // Walk Assets to count scripts, find scenes and assemblies
  await walkDir(assetsPath, async (fullPath, fileName) => {
    if (fileName.endsWith('.cs')) {
      result.scriptCount++
    } else if (fileName.endsWith('.unity')) {
      result.scenes.push(fileName)
    } else if (fileName.endsWith('.asmdef')) {
      result.assemblies.push(fileName)
    }
  })

  return result
}

async function analyzeGodotProject(root) {
  const result = {
    engine: 'godot',
    engineVersion: null,
    scriptCount: 0,
    scenes: [],
    directories: [],
    assemblies: []
  }

  // Read engine version from project.godot
  try {
    const projectPath = join(root, 'project.godot')
    const projectContent = await readFile(projectPath, 'utf8')
    const match = projectContent.match(/config\/features=PackedStringArray\(([^)]+)\)/)
    if (match) {
      // Extract version from features array (usually first element)
      const features = match[1].split(',').map(f => f.trim().replace(/"/g, ''))
      const versionFeature = features.find(f => f.match(/^\d+\.\d+/))
      if (versionFeature) {
        result.engineVersion = versionFeature
      } else if (features.length > 0) {
        result.engineVersion = features[0]
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }

  // Walk root directory to count scripts and find scenes
  const godotSkipDirs = ['node_modules', '.uda', '.git', '.godot']
  await walkDir(root, async (fullPath, fileName) => {
    if (fileName.endsWith('.gd')) {
      result.scriptCount++
    } else if (fileName.endsWith('.tscn')) {
      result.scenes.push(fileName)
    }
  }, godotSkipDirs)

  // Get root-level directories
  try {
    const entries = await readdir(root, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory() && !godotSkipDirs.includes(entry.name)) {
        result.directories.push(entry.name)
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }

  return result
}

export async function analyzeProject(root, engine) {
  if (engine === 'unity') {
    return analyzeUnityProject(root)
  } else if (engine === 'godot') {
    return analyzeGodotProject(root)
  } else {
    return {
      engine: null,
      engineVersion: null,
      scriptCount: 0,
      scenes: [],
      directories: [],
      assemblies: []
    }
  }
}

export async function generateProjectDocs(root, engine, paths) {
  const analysis = await analyzeProject(root, engine)

  // Generate structure.md content
  const lines = [
    '# Project Structure',
    '',
    `**Engine:** ${analysis.engine || 'Unknown'}`,
    `**Version:** ${analysis.engineVersion || 'N/A'}`,
    '',
    '## Statistics',
    '',
    `- Scripts: ${analysis.scriptCount}`,
    `- Scenes: ${analysis.scenes.length}`,
    `- Directories: ${analysis.directories.length}`,
  ]

  if (analysis.engine === 'unity') {
    lines.push(`- Assemblies: ${analysis.assemblies.length}`)
  }

  lines.push(
    '',
    '## Directory Structure',
    ''
  )

  for (const dir of analysis.directories) {
    lines.push(`- ${dir}/`)
  }

  if (analysis.scenes.length > 0) {
    lines.push(
      '',
      '## Scenes',
      ''
    )
    for (const scene of analysis.scenes) {
      lines.push(`- ${scene}`)
    }
  }

  if (analysis.assemblies.length > 0) {
    lines.push(
      '',
      '## Assemblies',
      ''
    )
    for (const asm of analysis.assemblies) {
      lines.push(`- ${asm}`)
    }
  }

  // Ensure project directory exists and write file
  const projectDir = paths.knowledge.project
  await mkdir(projectDir, { recursive: true })
  const structurePath = join(projectDir, 'structure.md')
  await writeFile(structurePath, lines.join('\n'), 'utf8')

  return analysis
}
