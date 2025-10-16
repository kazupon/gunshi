import { plugin } from 'gunshi'

export interface LoggerExtension {
  log: (msg: string) => void
  warn: (msg: string) => void
}

export function logger() {
  return plugin({
    id: 'logger',
    name: 'logger',
    extension: () => ({
      log: (msg: string) => console.log(msg),
      warn: (msg: string) => console.warn(msg)
    })
  })
}
