;(() => {
  const restore = (key, cls, def = false) => {
    const saved = localStorage.getItem(key)
    if (saved ? saved !== 'false' : def) {
      document.documentElement.classList.add(cls)
    }
  }

  // eslint-disable-next-line unicorn/prefer-global-this -- NOTE(kazupon): because vitepress setting
  window.__GUNSHI_BANNER_ID__ = 'v0.27-beta'
  // eslint-disable-next-line unicorn/prefer-global-this -- NOTE(kazupon): because vitepress setting
  restore(`gunshi-banner-dismissed-${window.__GUNSHI_BANNER_ID__}`, 'banner-dismissed')
})()
