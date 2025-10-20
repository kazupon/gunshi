import Theme from 'vitepress/theme'
import { defineAsyncComponent, h } from 'vue'
import HomeSponsors from './components/HomeSponsors.vue'
import './custom.css'
// eslint-disable-next-line import/no-unresolved -- NOTE(kazupon): virtual module
import 'virtual:group-icons.css'

export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      'home-features-after': () => h(HomeSponsors),
      'layout-top': () => h(defineAsyncComponent(() => import('./components/GunshiBanner.vue')))
    })
  },
  enhanceApp({ _app, _router, _siteData }) {
    // TODO: extending is here
  }
}
