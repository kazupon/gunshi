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

  test('throws when the Markdown response is not OK', async () => {
    const writeText = vi.fn<Clipboard['writeText']>().mockResolvedValue(undefined)
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('Not found', {
        status: 404,
        statusText: 'Not Found'
      })
    )

    await expect(
      copyMarkdownPage('/guide/essentials/missing.md', {
        clipboard: { writeText },
        fetcher
      })
    ).rejects.toThrow('Failed to fetch Markdown page: 404 Not Found')

    expect(writeText).not.toHaveBeenCalled()
  })

  test('throws a timeout error when the Markdown request is aborted', async () => {
    vi.useFakeTimers()

    const writeText = vi.fn<Clipboard['writeText']>().mockResolvedValue(undefined)
    const fetcher = vi.fn<typeof fetch>((_input, init) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener(
          'abort',
          () => {
            reject(new DOMException('Aborted', 'AbortError'))
          },
          { once: true }
        )
      })
    })

    try {
      const copy = copyMarkdownPage('/guide/essentials/getting-started.md', {
        clipboard: { writeText },
        fetcher,
        timeoutMs: 50
      })
      const assertion = expect(copy).rejects.toThrow('Timed out fetching Markdown page after 50ms')

      await vi.advanceTimersByTimeAsync(50)

      await assertion
      expect(writeText).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  test('clears the timeout when fetching Markdown fails', async () => {
    const error = new Error('Network unavailable')
    const writeText = vi.fn<Clipboard['writeText']>().mockResolvedValue(undefined)
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(error)

    try {
      await expect(
        copyMarkdownPage('/guide/essentials/getting-started.md', {
          clipboard: { writeText },
          fetcher
        })
      ).rejects.toThrow(error)

      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1)
      expect(writeText).not.toHaveBeenCalled()
    } finally {
      clearTimeoutSpy.mockRestore()
    }
  })
})
