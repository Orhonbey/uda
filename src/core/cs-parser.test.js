// Tests for C# parser

import { describe, it } from 'node:test'
import assert from 'node:assert'
import { parseCsFile } from './cs-parser.js'

describe('parseCsFile', () => {
  it('extracts class name and base class', { timeout: 30_000 }, () => {
    const content = `
using UnityEngine;

namespace Game.Characters
{
    public class Player : MonoBehaviour
    {
        public void TakeDamage(int amount) { }
        private void Update() { }
    }
}
`
    const result = parseCsFile(content)
    
    assert.strictEqual(result.namespace, 'Game.Characters')
    assert.strictEqual(result.classes.length, 1)
    assert.strictEqual(result.classes[0].name, 'Player')
    assert.strictEqual(result.classes[0].kind, 'class')
    assert.strictEqual(result.classes[0].baseClass, 'MonoBehaviour')
    assert.deepStrictEqual(result.classes[0].interfaces, [])
    assert.deepStrictEqual(result.classes[0].publicMethods, ['TakeDamage'])
  })

  it('handles multiple classes in one file', { timeout: 30_000 }, () => {
    const content = `
using UnityEngine;

namespace Game.Data
{
    public class Foo : ScriptableObject
    {
        public void FooMethod() { }
    }

    public class Bar : MonoBehaviour
    {
        public void BarMethod() { }
    }
}
`
    const result = parseCsFile(content)
    
    assert.strictEqual(result.classes.length, 2)
    assert.strictEqual(result.classes[0].name, 'Foo')
    assert.strictEqual(result.classes[0].baseClass, 'ScriptableObject')
    assert.strictEqual(result.classes[1].name, 'Bar')
    assert.strictEqual(result.classes[1].baseClass, 'MonoBehaviour')
  })

  it('handles file without namespace', { timeout: 30_000 }, () => {
    const content = `
using UnityEngine;

public class SimpleClass : MonoBehaviour
{
    public void DoSomething() { }
}
`
    const result = parseCsFile(content)
    
    assert.strictEqual(result.namespace, null)
    assert.strictEqual(result.classes.length, 1)
    assert.strictEqual(result.classes[0].name, 'SimpleClass')
  })

  it('detects struct declarations', { timeout: 30_000 }, () => {
    const content = `
namespace Game.Data
{
    public struct DamageInfo
    {
        public int Amount;
        public string Type;
        
        public void Apply() { }
    }
}
`
    const result = parseCsFile(content)
    
    assert.strictEqual(result.classes.length, 1)
    assert.strictEqual(result.classes[0].name, 'DamageInfo')
    assert.strictEqual(result.classes[0].kind, 'struct')
  })

  it('returns empty for non-class files', { timeout: 30_000 }, () => {
    const content = `
// This is just a comment
// No classes here
/* Multi-line comment
   Still no classes */
`
    const result = parseCsFile(content)
    
    assert.strictEqual(result.namespace, null)
    assert.strictEqual(result.classes.length, 0)
  })
})
