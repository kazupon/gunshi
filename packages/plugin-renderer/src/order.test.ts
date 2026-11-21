import { describe, expect, test, vi } from 'vite-plus/test'
import { compareNames } from './order.ts'

describe('compareNames', () => {
  test('orders plain names by their code units, as the collation of English does', () => {
    expect(['lint', 'dev-server', 'build', 'dev', 'b2', 'b10'].sort(compareNames)).toEqual([
      'b10',
      'b2',
      'build',
      'dev',
      'dev-server',
      'lint'
    ])
  })

  test('orders the other names by the collation of English', () => {
    expect(
      ['deploy', 'Build', 'apply', 'b_c', 'b-c', 'db:migrate', 'db0'].sort(compareNames)
    ).toEqual(['apply', 'b_c', 'b-c', 'Build', 'db:migrate', 'db0', 'deploy'])
  })

  test('does not follow the default locale of the process', () => {
    const localeCompare = vi.spyOn(String.prototype, 'localeCompare')
    try {
      expect(['deploy', 'Chat', 'check'].sort(compareNames)).toEqual(['Chat', 'check', 'deploy'])
      expect(localeCompare).not.toHaveBeenCalled()
    } finally {
      localeCompare.mockRestore()
    }
  })
})

describe('the collator', () => {
  test('is made for English when a name that is not plain is compared first, not on load', async () => {
    vi.resetModules()
    const collator = vi.spyOn(Intl, 'Collator')
    try {
      const order = await import('./order.ts')
      expect(collator).not.toHaveBeenCalled()

      expect(['lint', 'build', 'dev'].sort(order.compareNames)).toEqual(['build', 'dev', 'lint'])
      expect(collator).not.toHaveBeenCalled()

      expect(['lint', 'Build'].sort(order.compareNames)).toEqual(['Build', 'lint'])
      expect(['b-c', 'b_c'].sort(order.compareNames)).toEqual(['b_c', 'b-c'])
      expect(collator).toHaveBeenCalledTimes(1)
      expect(collator).toHaveBeenCalledWith('en')
    } finally {
      collator.mockRestore()
    }
  })
})
