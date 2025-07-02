import { describe, expect, test } from 'vitest'
import { defineI18n, withI18nResource } from './helpers.ts'

import type { Command } from '@gunshi/plugin'
import type { CommandResourceFetcher } from './types.ts'

describe('defineI18n', () => {
  test('pass through a command object with resource', () => {
    const resourceFn: CommandResourceFetcher = async () => ({
      description: 'Test',
      examples: 'Example usage'
    })
    const command = defineI18n({
      name: 'test',
      resource: resourceFn,
      run: async () => {}
    })

    expect(command.name).toBe('test')
    expect(command.run).toBeDefined()
    expect(command.resource).toBe(resourceFn)
  })

  test('pass through a command object', () => {
    const command: Command = {
      name: 'test',
      description: 'Test command',
      run: async () => {}
    }

    const i18nCommand = defineI18n(command)

    expect(i18nCommand).toBe(command)
    expect(i18nCommand.name).toBe('test')
    expect(i18nCommand.run).toBeDefined()
    expect(i18nCommand.resource).toBeUndefined()
  })
})

test('withI18nResource', () => {
  const command: Command = {
    name: 'test',
    description: 'Test command',
    args: {
      input: { type: 'string' }
    },
    run: async () => {}
  }
  const resourceFn: CommandResourceFetcher = async () => ({
    description: 'Test',
    examples: 'Example usage'
  })

  const i18nCommand = withI18nResource(command, resourceFn)

  expect(i18nCommand.name).toBe(command.name)
  expect(i18nCommand.description).toBe(command.description)
  expect(i18nCommand.args).toBe(command.args)
  expect(i18nCommand.run).toBe(command.run)
  expect(i18nCommand.resource).toBe(resourceFn)
})
