export function bundle({ target, minify }: { target: 'dev' | 'prod'; minify: boolean }) {
  console.log(`Building for ${target}...`)
  if (minify) {
    console.log('Minification enabled')
  }
}
