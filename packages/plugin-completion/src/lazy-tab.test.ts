import { cli, define } from 'gunshi'
import { expect, test, vi } from 'vite-plus/test'
import completion from './index.ts'

// count the loads of `@bomb.sh/tab`, and give the module itself
const tab = vi.hoisted(() => ({ loads: 0 }))
vi.mock('@bomb.sh/tab', async importOriginal => {
  tab.loads++
  return await importOriginal()
})

const command = define({ name: 'hello', run: () => {} })

test('`@bomb.sh/tab` is loaded when a completion is requested, not when the plugin is loaded', async () => {
  await cli([], command, { name: 'tool', plugins: [completion()] })
  await cli(['--help'], command, { name: 'tool', usageSilent: true, plugins: [completion()] })
  expect(tab.loads).toBe(0)

  const log = vi.spyOn(console, 'log').mockImplementation(() => {})
  await cli(['complete', '--', ''], command, { name: 'tool', plugins: [completion()] })
  log.mockRestore()
  expect(tab.loads).toBe(1)
})
