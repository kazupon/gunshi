const PUBLIC_DOCS_ORIGIN = 'https://gunshi.dev'

export const chatGptPromptBaseUrl = 'https://chatgpt.com/?hints=search&prompt='
export const claudePromptBaseUrl = 'https://claude.ai/new?q='

export function resolveMarkdownPath(pathname: string): string {
  const path = pathname.split(/[?#]/u)[0]?.replace(/\/+$/u, '') || '/'
  const cleanPath = path.endsWith('.html') ? path.slice(0, -'.html'.length) : path

  if (cleanPath === '/') {
    return '/index.md'
  }

  return `${cleanPath}.md`
}

export function resolvePublicMarkdownUrl(pathname: string): string {
  return `${PUBLIC_DOCS_ORIGIN}${resolveMarkdownPath(pathname)}`
}

export function createAiPrompt(markdownUrl: string): string {
  return `Read from ${markdownUrl} so I can ask questions about this Gunshi documentation page.`
}

export function createChatGptUrl(markdownUrl: string): string {
  return `${chatGptPromptBaseUrl}${encodeURIComponent(createAiPrompt(markdownUrl))}`
}

export function createClaudeUrl(markdownUrl: string): string {
  return `${claudePromptBaseUrl}${encodeURIComponent(createAiPrompt(markdownUrl))}`
}

export async function copyMarkdownPage(
  markdownPath: string,
  {
    fetcher = fetch,
    clipboard = navigator.clipboard,
    timeoutMs = 10_000
  }: {
    fetcher?: typeof fetch
    clipboard?: Pick<Clipboard, 'writeText'>
    timeoutMs?: number
  } = {}
): Promise<void> {
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  try {
    const response = await fetcher(markdownPath, { signal: controller.signal })

    if (!response.ok) {
      throw new Error(`Failed to fetch Markdown page: ${response.status} ${response.statusText}`)
    }

    await clipboard.writeText(await response.text())
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Timed out fetching Markdown page after ${timeoutMs}ms`)
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}
