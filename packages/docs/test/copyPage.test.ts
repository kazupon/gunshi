import { describe, expect, test, vi } from 'vitest'
import {
  copyMarkdownPage,
  createChatGptUrl,
  createClaudeUrl,
  resolveMarkdownPath,
  resolvePublicMarkdownUrl
} from '../src/.vitepress/theme/copyPage'

describe('copy page helpers', () => {
  test.each([
    ['/', '/index.md'],
    ['/guide/introduction/what-is-gunshi', '/guide/introduction/what-is-gunshi.md'],
    ['/guide/introduction/what-is-gunshi.html', '/guide/introduction/what-is-gunshi.md'],
    ['/api/', '/api.md'],
    ['/release/v0.27?utm=docs', '/release/v0.27.md'],
    ['/showcase#projects', '/showcase.md']
  ])('resolves %s to the canonical Markdown path', (pathname, expected) => {
    expect(resolveMarkdownPath(pathname)).toBe(expected)
  })

  test('uses the public docs origin for AI prompt URLs', () => {
    const markdownUrl = resolvePublicMarkdownUrl('/guide/essentials/getting-started')

    expect(markdownUrl).toBe('https://gunshi.dev/guide/essentials/getting-started.md')
    expect(decodeURIComponent(createChatGptUrl(markdownUrl))).toContain(markdownUrl)
    expect(decodeURIComponent(createClaudeUrl(markdownUrl))).toContain(markdownUrl)
  })

  test('fetches the canonical Markdown response and copies it unchanged', async () => {
    const markdown = '# Getting Started\n\nUse Gunshi.'
    const writeText = vi.fn<Clipboard['writeText']>().mockResolvedValue(undefined)
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(markdown, {
        headers: { 'content-type': 'text/markdown' },
        status: 200
      })
    )

    await copyMarkdownPage('/guide/essentials/getting-started.md', {
      clipboard: { writeText },
      fetcher
    })

    expect(fetcher).toHaveBeenCalledWith(
      '/guide/essentials/getting-started.md',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    expect(writeText).toHaveBeenCalledWith(markdown)
  })
})
