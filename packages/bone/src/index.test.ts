import { define } from '@gunshi/definition'
import global from '@gunshi/plugin-global'
import renderer from '@gunshi/plugin-renderer'
import { describe, expect, test, vi } from 'vitest'
import { Args, cli, GunshiParams, RemovedIndex } from './index.ts'

type GlobalsCommandContext = Awaited<ReturnType<ReturnType<typeof global>['extension']['factory']>>

// TODO(kazupon): more useful type inference for exntensions
const entry = define<
  GunshiParams<{ args: Args; extensions: { 'g:globals': RemovedIndex<GlobalsCommandContext> } }>
>({
  name: 'entry',
  args: {
    say: {
      type: 'string',
      description: 'say something',
      default: 'hello!'
    }
  },
  run: ctx => {
    if (ctx.values.say === 'version?') {
      ctx.extensions['g:globals'].showVersion()
      return
    }
    return `You said: ${ctx.values.say}`
  }
})

const meta = {
  name: 'app-bone',
  description: 'app-bone is a @gunshi/bone example',
  version: '1.0.0'
}

describe('@gunshi/bone', async () => {
  test('conbination with @gunshi/definition', async () => {
    const result = await cli(['--say', '`hello world`'], entry, { ...meta })
    expect(result).toEqual('You said: `hello world`')
  })

  test('conbination with gunshi plugins', async () => {
    const logs: string[] = []
    vi.spyOn(console, 'log').mockImplementation((msg: string) => logs.push(msg))

    await cli(['-h'], entry, {
      ...meta,
      plugins: [global(), renderer()]
    })
    expect(logs.join('\n')).toMatchSnapshot()
  })

  test('conbination with gunshi plugins and extension', async () => {
    const logs: string[] = []
    vi.spyOn(console, 'log').mockImplementation((msg: string) => logs.push(msg))

    await cli(['--say', 'version?'], entry, {
      ...meta,
      plugins: [global(), renderer()]
    })
    expect(logs.join('\n')).toMatchSnapshot()
  })
})
