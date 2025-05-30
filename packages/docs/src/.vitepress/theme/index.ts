import Theme from 'vitepress/theme'
import { h } from 'vue'
import HomeSponsors from './components/HomeSponsors.vue'
import './custom.css'
// eslint-disable-next-line import/no-unresolved
import 'virtual:group-icons.css'

export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      'home-features-after': () => h(HomeSponsors)
    })
  },
  enhanceApp({ _app, _router, _siteData }) {
    // TODO: extending is here
  }
}
