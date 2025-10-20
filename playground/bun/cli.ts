import { cli } from 'gunshi'

function entry() {
  console.log('Hello, Gunshi with Bun!')
}

await cli(Bun.argv.slice(2), entry)
