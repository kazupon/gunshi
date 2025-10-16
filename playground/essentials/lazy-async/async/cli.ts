import { cli, define, lazy } from 'gunshi'

import type { CommandRunner, GunshiParams } from 'gunshi'

// Mock implementations that simulate async file operations
// These work without requiring actual files on disk
async function readFile(path: string): Promise<string> {
  // Simulate async file read with a small delay
  await new Promise(resolve => setTimeout(resolve, 100))
  return `Sample data from ${path}`
}

async function transform(data: string): Promise<string> {
  // Simulate async data transformation
  await new Promise(resolve => setTimeout(resolve, 150))
  return data.toUpperCase() + '\n[TRANSFORMED]'
}

async function writeFile(path: string, data: string): Promise<void> {
  // Simulate async file write
  await new Promise(resolve => setTimeout(resolve, 100))
  console.log(`  Written to ${path}: "${data}"`)
}

// Alternative: Use real Node.js file operations
// import { readFile as fsReadFile, writeFile as fsWriteFile } from 'node:fs/promises'
//
// async function readFile(path: string): Promise<string> {
//   return await fsReadFile(path, 'utf-8')
// }
//
// async function transform(data: string): Promise<string> {
//   // Your actual transformation logic here
//   return data.toUpperCase()
// }
//
// async function writeFile(path: string, data: string): Promise<void> {
//   await fsWriteFile(path, data, 'utf-8')
// }

const processDataDefinition = define({
  name: 'process',
  description: 'Process data asynchronously',
  args: {
    input: {
      type: 'string',
      short: 'i',
      description: 'Input file path',
      required: true
    },
    output: {
      type: 'string',
      short: 'o',
      description: 'Output file path',
      required: true
    }
  }
})

const processDataLoader = async (): Promise<
  CommandRunner<GunshiParams<{ args: typeof processDataDefinition.args }>>
> => {
  // Return an async runner function
  return async ctx => {
    // TypeScript knows ctx.values has 'input' (string) and 'output' (string)
    const { input, output } = ctx.values

    console.log(`Processing ${input}...`)

    // Simulate async operations
    const data = await readFile(input)
    const processed = await transform(data)
    await writeFile(output, processed)

    console.log(`Successfully processed to ${output}`)
  }
}

const lazyProcess = lazy(processDataLoader, processDataDefinition)

// The CLI handles async execution automatically
const subCommands = {
  [lazyProcess.commandName]: lazyProcess
}

await cli(
  process.argv.slice(2),
  {
    description: 'Data processing CLI',
    run: () => console.log('Use process command to transform data')
  },
  {
    name: 'data-cli',
    version: '1.0.0',
    subCommands
  }
)
