import { cp, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const srcSvgDir = resolve(packageDir, 'src/svg')
const distSvgDir = resolve(packageDir, 'dist/svg')

await mkdir(distSvgDir, { recursive: true })
await cp(srcSvgDir, distSvgDir, { recursive: true })
