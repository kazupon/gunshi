// Preloaded with --import: records the modules that a run loads, with their bytes, and the uses
// of the ICU services (the Intl constructors and the locale-sensitive methods), and writes them as
// JSON to the file that STARTUP_BENCH_INSPECT names when the process exits.
import { writeFileSync } from 'node:fs'
import { registerHooks } from 'node:module'

const loads = []
registerHooks({
  load(url, context, nextLoad) {
    const result = nextLoad(url, context)
    const { source } = result
    const bytes =
      source == null
        ? 0
        : typeof source === 'string'
          ? Buffer.byteLength(source)
          : source.byteLength
    loads.push({ url, bytes })
    return result
  }
})

const icu = {}
const count = name => {
  icu[name] = (icu[name] ?? 0) + 1
}
for (const name of [
  'Collator',
  'DateTimeFormat',
  'DisplayNames',
  'ListFormat',
  'NumberFormat',
  'PluralRules',
  'RelativeTimeFormat',
  'Segmenter'
]) {
  const Original = Intl[name]
  if (typeof Original !== 'function') continue
  Intl[name] = new Proxy(Original, {
    construct(target, args, newTarget) {
      count(`Intl.${name}`)
      return Reflect.construct(target, args, newTarget)
    },
    apply(target, thisArg, args) {
      count(`Intl.${name}`)
      return Reflect.apply(target, thisArg, args)
    }
  })
}
for (const [owner, label, name] of [
  [String.prototype, 'String', 'localeCompare'],
  [Number.prototype, 'Number', 'toLocaleString'],
  [Date.prototype, 'Date', 'toLocaleString'],
  [Date.prototype, 'Date', 'toLocaleDateString'],
  [Date.prototype, 'Date', 'toLocaleTimeString']
]) {
  const original = owner[name]
  owner[name] = function (...args) {
    count(`${label}#${name}`)
    return original.apply(this, args)
  }
}

process.on('exit', () => {
  if (process.env.STARTUP_BENCH_INSPECT) {
    writeFileSync(process.env.STARTUP_BENCH_INSPECT, JSON.stringify({ loads, icu }))
  }
})
