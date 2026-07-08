<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import {
  copyMarkdownPage,
  createChatGptUrl,
  createClaudeUrl,
  resolveMarkdownPath,
  resolvePublicMarkdownUrl
} from '../copyPage'

const route = useRoute()
const isOpen = ref(false)
const copied = ref(false)
const copyFailed = ref(false)
const root = ref<HTMLElement>()
const disclosureId = 'copy-page-disclosure'

const markdownPath = computed(() => resolveMarkdownPath(route.path))
const publicMarkdownUrl = computed(() => resolvePublicMarkdownUrl(route.path))
const chatGptUrl = computed(() => createChatGptUrl(publicMarkdownUrl.value))
const claudeUrl = computed(() => createClaudeUrl(publicMarkdownUrl.value))

let resetTimer: ReturnType<typeof setTimeout> | undefined

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function scheduleStatusReset() {
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    copied.value = false
    copyFailed.value = false
  }, 2000)
}

async function copyPage() {
  try {
    await copyMarkdownPage(markdownPath.value)
    copied.value = true
    copyFailed.value = false
    close()
  } catch {
    copied.value = false
    copyFailed.value = true
  } finally {
    scheduleStatusReset()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

function onDocumentPointerdown(event: PointerEvent) {
  const target = event.target

  if (target instanceof Node && !root.value?.contains(target)) {
    close()
  }
}

watch(
  () => route.path,
  () => {
    close()
    copied.value = false
    copyFailed.value = false
  }
)

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerdown)
})

onBeforeUnmount(() => {
  clearTimeout(resetTimer)
  document.removeEventListener('pointerdown', onDocumentPointerdown)
})
</script>

<template>
  <div ref="root" class="copy-page-action" @keydown="onKeydown">
    <button
      class="copy-page-button"
      type="button"
      :aria-expanded="isOpen"
      :aria-controls="disclosureId"
      @click="toggle"
    >
      <svg class="copy-page-trigger-icon" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M5.5 2.5h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"
        />
        <path d="M2.5 9.5v-7h7" />
      </svg>
      Copy page
      <span class="copy-page-chevron" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </span>
    </button>

    <div v-if="isOpen" :id="disclosureId" class="copy-page-disclosure">
      <button class="copy-page-item" type="button" @click="copyPage">
        <svg class="copy-page-item-icon" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M6.2 9.8a3 3 0 0 1 0-4.2l2.6-2.7a3 3 0 0 1 4.3 4.3l-1.1 1.1" />
          <path d="M9.8 6.2a3 3 0 0 1 0 4.2l-2.6 2.7a3 3 0 0 1-4.3-4.3L4 7.7" />
        </svg>
        <span>Copy Markdown page</span>
      </button>
      <a class="copy-page-item" :href="markdownPath" target="_blank" rel="noreferrer"  @click="close">
        <svg class="copy-page-item-icon solid" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M1.5 4A1.5 1.5 0 0 1 3 2.5h10A1.5 1.5 0 0 1 14.5 4v8A1.5 1.5 0 0 1 13 13.5H3A1.5 1.5 0 0 1 1.5 12V4Zm2 6.5h1.7V7.7l1.3 1.8 1.3-1.8v2.8h1.7v-5h-1.7L6.5 7.4 5.2 5.5H3.5v5Zm7-1.5H9.3l2 2 2-2H12V5.5h-1.5V9Z" />
        </svg>
        <span>View as Markdown</span>
        <svg class="copy-page-external" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M6 4h6v6" />
          <path d="m5 11 7-7" />
        </svg>
      </a>
      <a class="copy-page-item" :href="chatGptUrl" target="_blank" rel="noreferrer"  @click="close">
        <svg class="copy-page-item-icon logo" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M20.3 9.2a5.2 5.2 0 0 0-6.9-6.6A5.2 5.2 0 0 0 4.8 6a5.2 5.2 0 0 0-1.1 8.8 5.2 5.2 0 0 0 6.9 6.6 5.2 5.2 0 0 0 8.6-3.4 5.2 5.2 0 0 0 1.1-8.8Zm-8.9 10.5a3.8 3.8 0 0 1-4.2-1.1l.2-.1 4.9-2.8a.9.9 0 0 0 .4-.8V8.1l2.1 1.2v5.6a3.8 3.8 0 0 1-3.4 4.8Zm-6.5-6.1a3.8 3.8 0 0 1 1.2-4l.2.1 4.9 2.8a.9.9 0 0 0 .9 0l5.9-3.4v2.5l-4.8 2.8a3.8 3.8 0 0 1-8.3-.8Zm1.2-6.1a3.8 3.8 0 0 1 5.4-3.8v5.9L9.4 8.4 6.1 6.5Zm7.2 6.6-2.2-1.3v-2.6l2.2-1.3 2.2 1.3v2.6l-2.2 1.3Zm3.2-7.7-4.9-2.8h.1a3.8 3.8 0 0 1 5.2 2.4l-.2.1-4.9 2.8 2.1 1.2 2.6-1.5Zm2.5 3.9a3.8 3.8 0 0 1-1.2 4l-.2-.1-4.9-2.8v2.4l3.3 1.9a3.8 3.8 0 0 1 3-5.4Z"
          />
        </svg>
        <span>Open in ChatGPT</span>
        <svg class="copy-page-external" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M6 4h6v6" />
          <path d="m5 11 7-7" />
        </svg>
      </a>
      <a class="copy-page-item" :href="claudeUrl" target="_blank" rel="noreferrer"  @click="close">
        <svg class="copy-page-item-icon logo anthropic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M16.8 4h-3.2l5.7 16h3.2L16.8 4Z" />
          <path d="M7.2 4 1.5 20h3.3l1.1-3.3h6.3l1.1 3.3h3.3L10.8 4H7.2Zm-.4 10 2.2-6.5 2.2 6.5H6.8Z" />
        </svg>
        <span>Open in Claude</span>
        <svg class="copy-page-external" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M6 4h6v6" />
          <path d="m5 11 7-7" />
        </svg>
      </a>
    </div>

    <span v-if="copied" class="copy-page-status" aria-live="polite">Copied</span>
    <span v-else-if="copyFailed" class="copy-page-status error" aria-live="polite">
      Copy failed
    </span>
  </div>
</template>
