;(() => {
  const restore = (key, cls, def = false) => {
    const saved = localStorage.getItem(key)
    if (saved ? saved !== 'false' : def) {
      document.documentElement.classList.add(cls)
    }
  }

  window.__GUNSHI_BANNER_ID__ = 'v0.27-beta'
  restore(`gunshi-banner-dismissed-${window.__GUNSHI_BANNER_ID__}`, 'banner-dismissed')
})()
