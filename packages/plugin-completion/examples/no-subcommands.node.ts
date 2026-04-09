import { cli, define } from 'gunshi'
import completion from '../src/index.ts'

const command = define({
  name: 'deploy',
  args: {
    environment: {
      type: 'string',
      short: 'e',
      description: 'Target environment'
    },
    config: {
      type: 'string',
      short: 'c',
      description: 'Config file path'
    }
  },
  run: ctx => {
    console.log(`Deploying to ${ctx.values.environment}`)
  }
})

await cli(process.argv.slice(2), command, {
  name: 'my-cli',
  version: '1.0.0',
  plugins: [
    completion({
      config: {
        entry: {
          args: {
            config: {
              handler: () => [
                { value: 'prod.json', description: 'Production config' },
                { value: 'dev.json', description: 'Development config' },
                { value: 'test.json', description: 'Test config' }
              ]
            }
          }
        }
      }
    })
  ]
})
