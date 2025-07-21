/**
 * Reproduction code for decorator pattern limitation
 *
 * This demonstrates how the current decorator pattern doesn't allow
 * a plugin to completely control rendering behavior.
 *
 * Even though completion plugin tries to disable header rendering,
 * other plugins can override this behavior.
 */

import { cli, define, plugin } from '../packages/gunshi/src/index.ts'

// Simulated completion plugin that tries to disable header
const completionPlugin = plugin({
  id: 'completion',
  name: 'completion',

  setup(ctx) {
    console.log('[Completion Plugin] add "complete" command')
    ctx.addCommand('complete', {
      name: 'complete',
      description: 'Completion command that disables header rendering',
      run: async () => {
        console.log('[Completion Plugin] Running completion command')
      }
    })

    console.log('[Completion Plugin] Decorating header renderer to return empty string')

    // Try to disable header rendering
    ctx.decorateHeaderRenderer(async (_baseRenderer, _cmdCtx) => {
      console.log('[Completion Plugin] Returning empty header')
      return ''
    })
  }
})

// Another plugin that adds custom header
const customHeaderPlugin = plugin({
  id: 'custom-header',
  name: 'custom header',

  setup(ctx) {
    console.log('[Custom Header Plugin] Decorating header renderer')

    // This decorator will be called FIRST (last registered, first executed)
    ctx.decorateHeaderRenderer(async (baseRenderer, cmdCtx) => {
      console.log('[Custom Header Plugin] Adding custom header')

      // Get the base result (which would be empty from completion plugin)
      const baseResult = await baseRenderer(cmdCtx)

      // But we add our own header anyway
      return `=== CUSTOM HEADER ===\n${cmdCtx.name || 'Command'}: ${cmdCtx.description || 'No description'}\n`
    })
  }
})

// Plugin that always shows header regardless of other plugins
const forceHeaderPlugin = plugin({
  id: 'force-header',
  name: 'force header',

  setup(ctx) {
    console.log('[Force Header Plugin] Decorating header renderer')

    // This completely ignores the base renderer
    ctx.decorateHeaderRenderer(async (_baseRenderer, cmdCtx) => {
      console.log('[Force Header Plugin] Forcing header display')
      return `!!! FORCED HEADER !!!\nCommand: ${cmdCtx.name}\n`
    })
  }
})

// Test command
const testCommand = define({
  name: 'test',
  description: 'Test command to demonstrate the issue',

  run: async ctx => {
    console.log('\n[Command] Executing test command')
    console.log('[Command] Header should have been disabled by completion plugin')
    console.log('[Command] But other plugins can override this behavior\n')
  }
})

// Main execution
console.log('=== Decorator Pattern Limitation Demo ===\n')

console.log('1. Running with only completion plugin (header should be disabled):')
console.log('---')
await cli(['complete'], testCommand, {
  name: 'demo',
  plugins: [completionPlugin]
})

console.log('\n\n2. Running with completion + custom header plugin:')
console.log('---')
await cli(['complete'], testCommand, {
  name: 'demo',
  plugins: [
    completionPlugin, // Registered first, executes second
    customHeaderPlugin // Registered second, executes first
  ]
})

console.log('\n\n3. Running with all plugins (force header plugin completely ignores others):')
console.log('---')
await cli(['complete'], testCommand, {
  name: 'demo',
  plugins: [
    completionPlugin, // Wants to disable header
    customHeaderPlugin, // Adds custom header
    forceHeaderPlugin // Completely overrides everything
  ]
})

console.log('\n\n=== Summary ===')
console.log('The current decorator pattern has limitations:')
console.log('1. Plugins cannot guarantee their rendering decisions will be respected')
console.log('2. Later plugins can always override earlier plugins')
console.log('3. There is no way to "lock" or "finalize" rendering behavior')
console.log('4. Completion plugin cannot reliably disable header rendering')
