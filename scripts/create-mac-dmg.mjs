import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const releaseDir = join(root, 'release')
const appDir = join(releaseDir, 'mac-arm64')
const appName = readdirSync(appDir).find((name) => name.endsWith('.app'))

if (!appName) {
  throw new Error(`No .app bundle found in ${appDir}`)
}

const metadata = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const dmgPath = join(releaseDir, `HTML Fast Creator-${metadata.version}-mac-arm64.dmg`)
const stagingDir = mkdtempSync(join(tmpdir(), 'html-fast-creator-dmg-'))

try {
  cpSync(join(appDir, appName), join(stagingDir, appName), { recursive: true })
  symlinkSync('/Applications', join(stagingDir, 'Applications'))
  execFileSync('hdiutil', [
    'create',
    '-volname',
    'HTML Fast Creator',
    '-srcfolder',
    stagingDir,
    '-ov',
    '-format',
    'UDZO',
    dmgPath
  ], { stdio: 'inherit' })
} finally {
  rmSync(stagingDir, { recursive: true, force: true })
}
