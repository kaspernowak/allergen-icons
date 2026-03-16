import { access } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { importCollection } from './import-collection.mjs'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const upstreamSvgDirCandidates = [
  resolve(rootDir, '../erudus-icons/src/svg'),
  resolve(rootDir, '../../erudus-icons/src/svg'),
]

async function resolveUpstreamSvgDir() {
  for (const candidate of upstreamSvgDirCandidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(
    `Erudus SVG source directory not found. Checked: ${upstreamSvgDirCandidates.join(', ')}`,
  )
}

async function main() {
  const upstreamSvgDir = await resolveUpstreamSvgDir()

  await importCollection({
    collectionId: 'erudus',
    label: 'Erudus',
    description: 'Erudus allergen and dietary SVG icons.',
    license: 'MIT',
    sourceDir: upstreamSvgDir,
    sourceUrl: 'https://github.com/Erudus/erudus-icons',
  })
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
