import { expect, test } from 'vitest'
import { createCommandContext } from '../../gunshi/src/context.ts'
import { renderHeader } from './header.ts'

import type { Args, Command, GunshiParams } from '@gunshi/plugin'

const NOOP = async () => {}

const command = {
  name: 'test',
  description: 'A test command',
  run: NOOP
} as Command<GunshiParams<{ args: Args }>>

test('basic', async () => {
  const ctx = await createCommandContext({
    args: {},
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: true,
    callMode: 'entry',
    command,
    cliOptions: {
      cwd: '/path/to/cmd1',
      description: 'this is command line',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  expect(await renderHeader(ctx)).toEqual('this is command line (cmd1 v0.0.0)')
})

test('no description', async () => {
  const ctx = await createCommandContext({
    args: {},
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: true,
    callMode: 'entry',
    command,
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  expect(await renderHeader(ctx)).toEqual('cmd1 (cmd1 v0.0.0)')
})

test('no name & no description', async () => {
  const ctx = await createCommandContext({
    args: {},
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: true,
    callMode: 'entry',
    command,
    cliOptions: { cwd: '/path/to/cmd1' }
  })

  expect(await renderHeader(ctx)).toEqual('')
})

test('no version', async () => {
  const ctx = await createCommandContext({
    args: {},
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: true,
    callMode: 'entry',
    command,
    cliOptions: {
      cwd: '/path/to/cmd1',
      name: 'cmd1',
      description: 'this is command line'
    }
  })

  expect(await renderHeader(ctx)).toEqual('this is command line (cmd1)')
})
