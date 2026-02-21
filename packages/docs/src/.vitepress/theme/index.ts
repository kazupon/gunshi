import 'virtual:group-icons.css'
import Theme from 'vitepress/theme'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { defineAsyncComponent, h } from 'vue'
// @ts-expect-error -- FIXME: missing types
import HomeSponsors from './components/HomeSponsors.vue'
import './custom.css'

export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      'home-features-after': () => h(HomeSponsors)
      // NOTE: Uncomment below to show a release banner
      // @ts-expect-error -- FIXME: missing types
      // 'layout-top': () => h(defineAsyncComponent(() => import('./components/GunshiBanner.vue')))
    })
  },
  enhanceApp({ _app, _router, _siteData }) {
    // TODO: extending is here
  }
}
