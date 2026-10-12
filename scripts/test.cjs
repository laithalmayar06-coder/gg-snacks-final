// npm pretest builds first because seo.cjs verifies generated production artifacts.
// Only local top-level suites run here; load tests and Supabase SQL require separate execution.
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const root = path.resolve(__dirname, '..')
const tests = fs.readdirSync(path.join(root, 'tests'), { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.cjs'))
  .map(entry => entry.name).sort()
if (!tests.length) throw new Error('No project tests found')
const failed = []
for (const test of tests) {
  console.log('\nRunning ' + test)
  const result = spawnSync(process.execPath, [path.join(root, 'tests', test)], { cwd: root, stdio: 'inherit' })
  if (result.error || result.status !== 0) {
    failed.push(test)
    if (result.error) console.error(result.error.message)
  }
}
console.log('\n' + (tests.length - failed.length) + '/' + tests.length + ' test scripts passed.')
if (failed.length) { console.error('Failed: ' + failed.join(', ')); process.exitCode = 1 }
