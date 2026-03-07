// src/commands/clean.js — Remove UDA from current project
import { access, readdir, rm, unlink } from 'fs/promises'
import { createInterface } from 'readline'
import { join } from 'path'

const CLEAN_TARGETS = {
  dirs: ['.uda', '.claude/commands/uda'],
  files: ['CLAUDE.md', '.cursorrules', 'AGENTS.md'],
  agentGlob: '.claude/agents',
  agentPrefix: 'uda-',
}

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

export async function handleClean(options = {}) {
  const targets = {
    dirs: [],
    files: [],
  }

  // Check if .uda exists
  const hasUda = await exists('.uda')
  if (!hasUda) {
    console.error('Hata: Bu dizinde UDA kurulu degil.')
    process.exitCode = 1
    return
  }

  // Collect directories
  for (const dir of CLEAN_TARGETS.dirs) {
    if (await exists(dir)) {
      targets.dirs.push(dir)
    }
  }

  // Collect files
  for (const file of CLEAN_TARGETS.files) {
    if (await exists(file)) {
      targets.files.push(file)
    }
  }

  // Collect agent files (only uda-*.md)
  if (await exists(CLEAN_TARGETS.agentGlob)) {
    try {
      const agentFiles = await readdir(CLEAN_TARGETS.agentGlob)
      for (const f of agentFiles) {
        if (f.startsWith(CLEAN_TARGETS.agentPrefix) && f.endsWith('.md')) {
          targets.files.push(join(CLEAN_TARGETS.agentGlob, f))
        }
      }
    } catch {
      // Ignore errors reading agents dir
    }
  }

  // Show what will be deleted
  console.log('UDA Clean — Silinecek dosyalar:')
  console.log()

  if (targets.dirs.length > 0) {
    console.log('  Dizinler:')
    for (const d of targets.dirs) {
      console.log(`    ${d}/`)
    }
    console.log()
  }

  if (targets.files.length > 0) {
    console.log('  Dosyalar:')
    for (const f of targets.files) {
      console.log(`    ${f}`)
    }
    console.log()
  }

  if (targets.dirs.length === 0 && targets.files.length === 0) {
    console.log('  Silinecek dosya bulunamadi.')
    return
  }

  // Ask for confirmation unless --force
  if (!options.force) {
    const answer = await ask('Bu islem geri alinamaz. Devam? (y/N): ')
    if (answer.toLowerCase() !== 'y') {
      console.log('Islem iptal edildi.')
      return
    }
    console.log()
  }

  // Delete files first
  let deletedFiles = 0
  for (const f of targets.files) {
    try {
      await unlink(f)
      deletedFiles++
    } catch {
      // Ignore errors
    }
  }

  // Delete directories (in reverse order, nested first)
  let deletedDirs = 0
  const sortedDirs = [...targets.dirs].sort((a, b) => b.length - a.length)
  for (const d of sortedDirs) {
    try {
      await rm(d, { recursive: true, force: true })
      deletedDirs++
    } catch {
      // Ignore errors
    }
  }

  console.log(`${deletedDirs} dizin, ${deletedFiles} dosya silindi.`)
  console.log('UDA projeden kaldirildi.')
}
