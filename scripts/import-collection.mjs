import { access, copyFile, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceCollectionsDir = resolve(rootDir, 'packages/allergen-icons/sources/collections')
const collectionsGenerateModulePath = resolve(
  rootDir,
  'packages/allergen-icons/scripts/generate-collections.mjs',
)
const vueGenerateModulePath = resolve(rootDir, 'packages/allergen-icons-vue/scripts/generate.mjs')

function printUsage() {
  console.log(
    'Usage: pnpm run import:collection -- --id <collection-id> --label <label> --source <svg-dir> [--description <text>] [--license <spdx>] [--source-url <url>]',
  )
}

function parseArgs(argv) {
  const options = {}

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }

    const value = argv[index + 1]

    if (!value) {
      throw new Error(`Missing value for ${arg}.`)
    }

    if (arg === '--id' || arg === '-i') {
      options.collectionId = value
      index += 1
      continue
    }

    if (arg === '--label' || arg === '-l') {
      options.label = value
      index += 1
      continue
    }

    if (arg === '--description' || arg === '-d') {
      options.description = value
      index += 1
      continue
    }

    if (arg === '--source' || arg === '-s') {
      options.sourceDir = value
      index += 1
      continue
    }

    if (arg === '--license') {
      options.license = value
      index += 1
      continue
    }

    if (arg === '--source-url') {
      options.sourceUrl = value
      index += 1
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

function isValidCollectionId(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

async function getSvgFileNames(sourceDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true })

  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.svg'))
    .map(entry => entry.name)
    .sort((left, right) => left.localeCompare(right))
}

export async function importCollection({
  collectionId,
  label,
  description,
  license,
  sourceDir,
  sourceUrl,
}) {
  if (!collectionId || !isValidCollectionId(collectionId)) {
    throw new Error('Collection ids must be kebab-case, for example "custom-icons".')
  }

  if (!label) {
    throw new Error('A collection label is required.')
  }

  if (!sourceDir) {
    throw new Error('A source directory is required.')
  }

  const resolvedSourceDir = resolve(rootDir, sourceDir)

  try {
    await access(resolvedSourceDir)
  } catch {
    throw new Error(`SVG source directory not found at ${resolvedSourceDir}.`)
  }

  const svgFileNames = await getSvgFileNames(resolvedSourceDir)

  if (svgFileNames.length === 0) {
    throw new Error(`No SVG files were found in ${resolvedSourceDir}.`)
  }

  const collectionDir = resolve(sourceCollectionsDir, collectionId)
  const targetSvgDir = resolve(collectionDir, 'svg')

  await rm(targetSvgDir, { recursive: true, force: true })
  await mkdir(targetSvgDir, { recursive: true })

  for (const fileName of svgFileNames) {
    await copyFile(resolve(resolvedSourceDir, fileName), resolve(targetSvgDir, fileName))
  }

  const metadata = {
    id: collectionId,
    label,
    ...(description ? { description } : {}),
    ...(license ? { license } : {}),
    ...(sourceUrl ? { sourceUrl } : {}),
  }

  await writeFile(resolve(collectionDir, 'collection.json'), `${JSON.stringify(metadata, null, 2)}\n`)

  const collectionsGeneratorModule = await import(
    pathToFileURL(collectionsGenerateModulePath).href
  )
  const vueGeneratorModule = await import(pathToFileURL(vueGenerateModulePath).href)

  await collectionsGeneratorModule.generateCollections()
  await vueGeneratorModule.generateVueBindings()

  console.log(
    `Imported ${svgFileNames.length} SVG icon(s) into ${collectionId} from ${resolvedSourceDir}.`,
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2))

  if (options.help) {
    printUsage()
    process.exit(0)
  }

  importCollection(options).catch(error => {
    console.error(error)
    printUsage()
    process.exit(1)
  })
}
