import { define } from 'gunshi'

export default define({
  name: 'manage',
  description: 'Manage resources',
  run: () => {
    console.log('Use a sub-command')
    console.log('Run "resource-manager --help" for available commands')
  }
})
