import { define } from 'gunshi'

// Define args separately
export const serverArgs = {
  port: { type: 'number', default: 3000 },
  host: { type: 'string', default: 'localhost' }
} as const

export const serverCommand = define<{ args: typeof serverArgs }>({
  name: 'server',
  args: serverArgs,
  run: ctx => {
    // ctx.values is typed based on ServerParams
    console.log(`Server: ${ctx.values.host}:${ctx.values.port}`)
  }
})
