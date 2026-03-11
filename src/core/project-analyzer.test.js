// src/core/project-analyzer.test.js
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { analyzeProject, walkDir, generateProjectDocs } from './project-analyzer.js'
import { udaPaths } from './constants.js'

describe('project-analyzer', { timeout: 30_000 }, () => {
  let testDir

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-analyzer-'))
  })

  after(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  describe('analyzeProject', () => {
    it('detects Unity project structure', async () => {
      // Create mock Unity project structure
      const projectSettingsDir = join(testDir, 'ProjectSettings')
      const assetsDir = join(testDir, 'Assets')
      const scriptsDir = join(assetsDir, 'Scripts')
      const scenesDir = join(assetsDir, 'Scenes')
      const prefabsDir = join(assetsDir, 'Prefabs')

      await mkdir(projectSettingsDir, { recursive: true })
      await mkdir(scriptsDir, { recursive: true })
      await mkdir(scenesDir, { recursive: true })
      await mkdir(prefabsDir, { recursive: true })

      // Create ProjectVersion.txt
      await writeFile(
        join(projectSettingsDir, 'ProjectVersion.txt'),
        'm_EditorVersion: 2022.3.1f1\nm_EditorVersionWithRevision: 2022.3.1f1 (1234567890ab)'
      )

      // Create scene files
      await writeFile(join(scenesDir, 'MainScene.unity'), '')
      await writeFile(join(scenesDir, 'MenuScene.unity'), '')

      const result = await analyzeProject(testDir, 'unity')

      assert.strictEqual(result.engine, 'unity')
      assert.strictEqual(result.engineVersion, '2022.3.1f1')
      assert.strictEqual(result.scenes.length, 2)
      assert.ok(result.scenes.includes('MainScene.unity'))
      assert.ok(result.scenes.includes('MenuScene.unity'))
      assert.strictEqual(result.directories.length, 3)
      assert.ok(result.directories.includes('Scripts'))
      assert.ok(result.directories.includes('Scenes'))
      assert.ok(result.directories.includes('Prefabs'))
    })

    it('counts C# files in Unity project', async () => {
      // Add C# files to existing test structure
      const scriptsDir = join(testDir, 'Assets', 'Scripts')
      await writeFile(join(scriptsDir, 'PlayerController.cs'), 'public class PlayerController {}')
      await writeFile(join(scriptsDir, 'GameManager.cs'), 'public class GameManager {}')

      const result = await analyzeProject(testDir, 'unity')

      assert.strictEqual(result.scriptCount, 2)
    })

    it('returns empty result for unknown engine', async () => {
      const emptyDir = await mkdtemp(join(tmpdir(), 'uda-empty-'))
      
      try {
        const result = await analyzeProject(emptyDir, null)

        assert.strictEqual(result.engine, null)
        assert.strictEqual(result.engineVersion, null)
        assert.strictEqual(result.scriptCount, 0)
        assert.deepStrictEqual(result.scenes, [])
        assert.deepStrictEqual(result.directories, [])
        assert.deepStrictEqual(result.assemblies, [])
      } finally {
        await rm(emptyDir, { recursive: true, force: true })
      }
    })

    it('detects Three.js project structure', async () => {
      const threejsDir = await mkdtemp(join(tmpdir(), 'uda-threejs-'))

      try {
        // Create package.json with three dependency
        await writeFile(
          join(threejsDir, 'package.json'),
          JSON.stringify({
            name: 'my-threejs-game',
            dependencies: { three: '^0.162.0' }
          })
        )

        const srcDir = join(threejsDir, 'src')
        await mkdir(srcDir, { recursive: true })

        await writeFile(join(srcDir, 'main.js'), 'import * as THREE from "three"')
        await writeFile(join(srcDir, 'scene.js'), 'export function createScene() {}')
        await writeFile(join(threejsDir, 'index.html'), '<!DOCTYPE html>')
        await writeFile(join(srcDir, 'shader.glsl'), 'void main() {}')

        const result = await analyzeProject(threejsDir, 'threejs')

        assert.strictEqual(result.engine, 'threejs')
        assert.strictEqual(result.engineVersion, '^0.162.0')
        assert.strictEqual(result.scriptCount, 4)
        assert.ok(result.scenes.includes('index.html'))
        assert.ok(result.directories.includes('src'))
        assert.deepStrictEqual(result.assemblies, [])
      } finally {
        await rm(threejsDir, { recursive: true, force: true })
      }
    })

    it('returns empty result for threejs project without three dependency', async () => {
      const noThreeDir = await mkdtemp(join(tmpdir(), 'uda-nothree-'))

      try {
        await writeFile(
          join(noThreeDir, 'package.json'),
          JSON.stringify({ name: 'not-threejs', dependencies: { express: '4.0.0' } })
        )

        const result = await analyzeProject(noThreeDir, 'threejs')

        assert.strictEqual(result.engine, 'threejs')
        assert.strictEqual(result.engineVersion, null)
        assert.strictEqual(result.scriptCount, 0)
        assert.deepStrictEqual(result.scenes, [])
      } finally {
        await rm(noThreeDir, { recursive: true, force: true })
      }
    })

    it('detects Godot project structure', async () => {
      const godotDir = await mkdtemp(join(tmpdir(), 'uda-godot-'))

      try {
        // Create mock Godot project structure
        await writeFile(
          join(godotDir, 'project.godot'),
          '[application]\nconfig/name="TestProject"\n[rendering]\nconfig/features=PackedStringArray("4.2", "Forward Plus")\n'
        )

        const srcDir = join(godotDir, 'src')
        const scenesDir = join(godotDir, 'scenes')
        await mkdir(srcDir, { recursive: true })
        await mkdir(scenesDir, { recursive: true })

        // Create GDScript files
        await writeFile(join(srcDir, 'player.gd'), 'extends CharacterBody2D')
        await writeFile(join(srcDir, 'enemy.gd'), 'extends CharacterBody2D')
        await writeFile(join(srcDir, 'utils.gd'), 'class_name Utils')

        // Create scene files
        await writeFile(join(scenesDir, 'main.tscn'), '[gd_scene]')
        await writeFile(join(scenesDir, 'player.tscn'), '[gd_scene]')

        const result = await analyzeProject(godotDir, 'godot')

        assert.strictEqual(result.engine, 'godot')
        assert.strictEqual(result.engineVersion, '4.2')
        assert.strictEqual(result.scriptCount, 3)
        assert.strictEqual(result.scenes.length, 2)
        assert.ok(result.scenes.includes('main.tscn'))
        assert.ok(result.scenes.includes('player.tscn'))
        assert.ok(result.directories.includes('src'))
        assert.ok(result.directories.includes('scenes'))
      } finally {
        await rm(godotDir, { recursive: true, force: true })
      }
    })
  })

  describe('walkDir', () => {
    it('walks directory recursively', async () => {
      const walkTestDir = await mkdtemp(join(tmpdir(), 'uda-walk-'))
      
      try {
        const files = []
        const subDir = join(walkTestDir, 'subdir')
        await mkdir(subDir, { recursive: true })
        await writeFile(join(walkTestDir, 'file1.txt'), 'content')
        await writeFile(join(subDir, 'file2.txt'), 'content')

        await walkDir(walkTestDir, async (fullPath, fileName) => {
          files.push(fileName)
        })

        assert.strictEqual(files.length, 2)
        assert.ok(files.includes('file1.txt'))
        assert.ok(files.includes('file2.txt'))
      } finally {
        await rm(walkTestDir, { recursive: true, force: true })
      }
    })

    it('skips specified directories', async () => {
      const skipDir = await mkdtemp(join(tmpdir(), 'uda-skip-'))
      
      try {
        const files = []
        const nodeModules = join(skipDir, 'node_modules')
        await mkdir(nodeModules, { recursive: true })
        await writeFile(join(nodeModules, 'package.js'), 'module')
        await writeFile(join(skipDir, 'index.js'), 'main')

        await walkDir(skipDir, async (fullPath, fileName) => {
          files.push(fileName)
        })

        assert.strictEqual(files.length, 1)
        assert.ok(files.includes('index.js'))
        assert.ok(!files.includes('package.js'))
      } finally {
        await rm(skipDir, { recursive: true, force: true })
      }
    })
  })

  describe('generateProjectDocs', () => {
    it('generates structure.md for Unity project', async () => {
      const docsDir = await mkdtemp(join(tmpdir(), 'uda-docs-'))

      try {
        // Create minimal Unity structure
        const projectSettingsDir = join(docsDir, 'ProjectSettings')
        const assetsDir = join(docsDir, 'Assets')
        await mkdir(projectSettingsDir, { recursive: true })
        await mkdir(assetsDir, { recursive: true })

        await writeFile(
          join(projectSettingsDir, 'ProjectVersion.txt'),
          'm_EditorVersion: 2021.3.45f1'
        )

        const paths = udaPaths(docsDir)

        const result = await generateProjectDocs(docsDir, 'unity', paths)

        assert.strictEqual(result.engine, 'unity')
        assert.strictEqual(result.engineVersion, '2021.3.45f1')
      } finally {
        await rm(docsDir, { recursive: true, force: true })
      }
    })
  })
})
