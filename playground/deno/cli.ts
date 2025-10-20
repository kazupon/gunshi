import { cli } from '@gunshi/gunshi'

function entry() {
  console.log('Hello, Gunshi with Deno!')
}

await cli(Deno.args, entry)
