// Preloaded with --import: writes the CPU time of the process (user and system, in microseconds)
// to stderr when it exits, as `startup-bench-cpu <microseconds>`.
process.on('exit', () => {
  const { user, system } = process.cpuUsage()
  process.stderr.write(`startup-bench-cpu ${user + system}\n`)
})
