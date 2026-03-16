import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'svgson'
import { optimize } from 'svgo'

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = resolve(packageDir, 'src')
const srcIconsDir = resolve(srcDir, 'icons')
const srcSvgDir = resolve(srcDir, 'svg')
const srcCollectionsDir = resolve(srcDir, 'collections')
const sourceCollectionsDir = resolve(packageDir, 'sources/collections')

const CORE_PACKAGE_NAME = '@kaspernowak/allergen-icons'
const DEFAULT_COLLECTION_ID = 'react-allergens'
const DEFAULT_COLLECTION_LABEL = 'React Allergens'
const DEFAULT_COLLECTION_DESCRIPTION =
  'The default allergen icon set adapted from dsanchez07/react-allergens.'
const PRIMARY_TOKEN = '__ALLERGEN_ICONS_PRIMARY__'
const SECONDARY_TOKEN = '__ALLERGEN_ICONS_SECONDARY__'
const WHITE_VALUES = new Set([
  '#fff',
  '#ffffff',
  '#fefefe',
  'white',
  'rgb(255,255,255)',
  'rgb(255 255 255)',
])

function toPascalCase(value) {
  return value
    .replace(/\.svg$/i, '')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function toCamelCase(value) {
  const pascalCase = toPascalCase(value)
  return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1)
}

function toTitleCase(value) {
  return value
    .replace(/\.svg$/i, '')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(part => {
      if (/^[a-z]+\d+$/i.test(part) || /^[a-z]{1,3}\d{1,3}$/i.test(part)) {
        return part.toUpperCase()
      }

      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' ')
}

function isProbablyColor(value) {
  return (
    value.startsWith('#') ||
    value.startsWith('rgb(') ||
    value.startsWith('rgba(') ||
    value.startsWith('hsl(') ||
    /^[a-zA-Z]+$/.test(value)
  )
}

function normalizePaint(value, palette) {
  const normalized = value.trim().toLowerCase()

  if (
    normalized === 'none' ||
    normalized === 'currentcolor' ||
    normalized.startsWith('url(')
  ) {
    return value
  }

  if (WHITE_VALUES.has(normalized)) {
    palette.secondaryColor ??= value
    return SECONDARY_TOKEN
  }

  if (isProbablyColor(normalized)) {
    palette.primaryColor ??= value
    return PRIMARY_TOKEN
  }

  return value
}

function mapAttrs(attrs, palette) {
  if (!attrs) {
    return undefined
  }

  const next = {}

  for (const [key, value] of Object.entries(attrs)) {
    if (
      key === 'width' ||
      key === 'height' ||
      key === 'xmlns' ||
      key === 'xmlns:xlink' ||
      key === 'version' ||
      key === 'x' ||
      key === 'y' ||
      key === 'xml:space'
    ) {
      continue
    }

    if (
      key === 'fill' ||
      key === 'stroke' ||
      key === 'stop-color' ||
      key === 'color'
    ) {
      next[key] = normalizePaint(value, palette)
      continue
    }

    next[key] = value
  }

  return Object.keys(next).length > 0 ? next : undefined
}

function toTree(node, palette) {
  if (node.type !== 'element') {
    return null
  }

  if (!node.name || node.name === 'svg') {
    return null
  }

  const children = (node.children ?? [])
    .map(child => toTree(child, palette))
    .filter(Boolean)

  return {
    tag: node.name,
    attrs: mapAttrs(node.attributes, palette),
    children: children.length > 0 ? children : undefined,
  }
}

async function ensureDir(pathname) {
  await mkdir(pathname, { recursive: true })
}

async function resetDir(pathname) {
  await rm(pathname, { recursive: true, force: true })
  await ensureDir(pathname)
}

async function clearGeneratedCollectionDirs() {
  for (const directory of [srcIconsDir, srcSvgDir, srcCollectionsDir]) {
    await ensureDir(directory)

    const entries = await readdir(directory, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }

      await rm(resolve(directory, entry.name), { recursive: true, force: true })
    }
  }
}

async function getSourceCollections() {
  await ensureDir(sourceCollectionsDir)

  const entries = await readdir(sourceCollectionsDir, { withFileTypes: true })
  const directories = entries.filter(entry => entry.isDirectory())
  const collections = []
  const seenIds = new Set([DEFAULT_COLLECTION_ID])

  for (const entry of directories) {
    const collectionDir = resolve(sourceCollectionsDir, entry.name)
    const metadataPath = resolve(collectionDir, 'collection.json')
    const svgDir = resolve(collectionDir, 'svg')
    const metadata = JSON.parse(await readFile(metadataPath, 'utf8'))

    if (!metadata.id || !metadata.label) {
      throw new Error(
        `Collection metadata at ${metadataPath} must define both "id" and "label".`,
      )
    }

    if (seenIds.has(metadata.id)) {
      throw new Error(`Duplicate collection id "${metadata.id}" detected.`)
    }

    seenIds.add(metadata.id)

    collections.push({
      ...metadata,
      svgDir,
    })
  }

  return collections.sort((left, right) => left.id.localeCompare(right.id))
}

function toIconModuleSource(relativeTypesImport, iconData) {
  return `import type { AllergenIconData } from '${relativeTypesImport}'\n\nconst ${iconData.componentName} = ${JSON.stringify(iconData, null, 2)} as const satisfies AllergenIconData\n\nexport default ${iconData.componentName}\n`
}

function toIconNamesModuleSource(variableName, typeName, iconNames) {
  return `export const ${variableName} = ${JSON.stringify(iconNames, null, 2)} as const\n\nexport type ${typeName} = (typeof ${variableName})[number]\n`
}

function toCollectionManifestSource(collection, manifestVariableName, collectionVariableName, manifestEntries) {
  return `import type { AllergenIconCollection, AllergenIconManifestEntry } from '../../types'\n\nexport const ${collectionVariableName} = ${JSON.stringify(
    {
      id: collection.id,
      label: collection.label,
      description: collection.description,
      license: collection.license,
      sourceUrl: collection.sourceUrl,
      iconCount: manifestEntries.length,
      importPath: `${CORE_PACKAGE_NAME}/collections/${collection.id}`,
    },
    null,
    2,
  )} as const satisfies AllergenIconCollection\n\nexport const ${manifestVariableName} = ${JSON.stringify(manifestEntries, null, 2)} as const satisfies readonly AllergenIconManifestEntry[]\n`
}

function toNestedCollectionIndexSource({
  collectionId,
  iconNamesVariableName,
  iconNameTypeName,
  manifestVariableName,
  collectionVariableName,
  componentNames,
}) {
  return [
    `export type { ${iconNameTypeName} } from './icon-names'`,
    `export { ${iconNamesVariableName} } from './icon-names'`,
    `export { ${collectionVariableName}, ${manifestVariableName} } from './manifest'`,
    ...componentNames.map(
      componentName =>
        `export { default as ${componentName} } from '../../icons/${collectionId}/${componentName}'`,
    ),
    '',
  ].join('\n')
}

async function generateDefaultCollectionAlias() {
  const defaultCollectionDir = resolve(srcCollectionsDir, DEFAULT_COLLECTION_ID)
  const componentNames = (await readdir(srcIconsDir, { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.endsWith('.ts') && entry.name !== 'index.ts')
    .map(entry => entry.name.replace(/\.ts$/, ''))
    .sort((left, right) => left.localeCompare(right))

  await resetDir(defaultCollectionDir)

  await writeFile(
    resolve(defaultCollectionDir, 'icon-names.ts'),
    [
      "export type { AllergenIconName as ReactAllergensIconName } from '../../icon-names'",
      "export { allergenIconNames as reactAllergensIconNames } from '../../icon-names'",
      '',
    ].join('\n'),
  )

  await writeFile(
    resolve(defaultCollectionDir, 'manifest.ts'),
    [
      "import type { AllergenIconCollection } from '../../types'",
      "import { allergenIcons } from '../../manifest'",
      '',
      `export const reactAllergensCollection = ${JSON.stringify(
        {
          id: DEFAULT_COLLECTION_ID,
          label: DEFAULT_COLLECTION_LABEL,
          description: DEFAULT_COLLECTION_DESCRIPTION,
          license: 'MIT',
          sourceUrl: 'https://github.com/dsanchez07/react-allergens',
          iconCount: componentNames.length,
          importPath: `${CORE_PACKAGE_NAME}/collections/${DEFAULT_COLLECTION_ID}`,
        },
        null,
        2,
      )} as const satisfies AllergenIconCollection`,
      '',
      'export const reactAllergensIcons = allergenIcons',
      '',
    ].join('\n'),
  )

  await writeFile(
    resolve(defaultCollectionDir, 'index.ts'),
    [
      "export type { ReactAllergensIconName } from './icon-names'",
      "export { reactAllergensIconNames } from './icon-names'",
      "export { reactAllergensCollection, reactAllergensIcons } from './manifest'",
      ...componentNames.map(
        componentName =>
          `export { default as ${componentName} } from '../../icons/${componentName}'`,
      ),
      '',
    ].join('\n'),
  )

  return {
    id: DEFAULT_COLLECTION_ID,
    collectionVariableName: 'reactAllergensCollection',
    namespaceExportName: 'reactAllergens',
  }
}

async function generateSourceCollection(collection) {
  const iconFiles = (await readdir(collection.svgDir))
    .filter(fileName => fileName.endsWith('.svg'))
    .sort((left, right) => left.localeCompare(right))

  const iconsOutputDir = resolve(srcIconsDir, collection.id)
  const svgOutputDir = resolve(srcSvgDir, collection.id)
  const collectionOutputDir = resolve(srcCollectionsDir, collection.id)

  await resetDir(iconsOutputDir)
  await resetDir(svgOutputDir)
  await resetDir(collectionOutputDir)

  const manifestEntries = []
  const componentNames = []

  for (const fileName of iconFiles) {
    const raw = await readFile(resolve(collection.svgDir, fileName), 'utf8')
    const optimized = optimize(raw, {
      multipass: true,
      plugins: [
        'preset-default',
        'sortAttrs',
        'removeDimensions',
        {
          name: 'prefixIds',
          params: {
            prefix: `${collection.id}-${fileName.replace(/\.svg$/i, '')}-`,
          },
        },
      ],
    })

    if (!('data' in optimized)) {
      throw new Error(`SVGO failed for ${collection.id}/${fileName}`)
    }

    const palette = {
      primaryColor: undefined,
      secondaryColor: undefined,
    }

    const ast = await parse(optimized.data)
    const viewBox = ast.attributes.viewBox ?? '0 0 216 216'
    const componentName = `${toPascalCase(fileName)}Icon`
    const name = fileName.replace(/\.svg$/i, '')
    const iconData = {
      name,
      collectionId: collection.id,
      collectionLabel: collection.label,
      componentName,
      title: toTitleCase(name),
      fileName,
      importPath: `${CORE_PACKAGE_NAME}/icons/${collection.id}/${componentName}`,
      svgPath: `${CORE_PACKAGE_NAME}/svg/${collection.id}/${fileName}`,
      viewBox,
      defaultPrimaryColor: '#000000',
      defaultSecondaryColor: '#ffffff',
      nodes: [],
    }

    iconData.nodes = (ast.children ?? [])
      .map(child => toTree(child, palette))
      .filter(Boolean)

    iconData.defaultPrimaryColor = palette.primaryColor ?? '#000000'
    iconData.defaultSecondaryColor =
      palette.secondaryColor ?? iconData.defaultPrimaryColor

    componentNames.push(componentName)
    manifestEntries.push({
      name: iconData.name,
      collectionId: iconData.collectionId,
      collectionLabel: iconData.collectionLabel,
      componentName: iconData.componentName,
      title: iconData.title,
      fileName: iconData.fileName,
      importPath: iconData.importPath,
      svgPath: iconData.svgPath,
      viewBox: iconData.viewBox,
      defaultPrimaryColor: iconData.defaultPrimaryColor,
      defaultSecondaryColor: iconData.defaultSecondaryColor,
    })

    await writeFile(
      resolve(iconsOutputDir, `${componentName}.ts`),
      toIconModuleSource('../../types', iconData),
    )
    await writeFile(resolve(svgOutputDir, fileName), optimized.data)
  }

  const collectionCamelName = toCamelCase(collection.id)
  const collectionPascalName = toPascalCase(collection.id)
  const iconNamesVariableName = `${collectionCamelName}IconNames`
  const iconNameTypeName = `${collectionPascalName}IconName`
  const manifestVariableName = `${collectionCamelName}Icons`
  const collectionVariableName = `${collectionCamelName}Collection`

  await writeFile(
    resolve(collectionOutputDir, 'icon-names.ts'),
    toIconNamesModuleSource(
      iconNamesVariableName,
      iconNameTypeName,
      manifestEntries.map(icon => icon.name),
    ),
  )

  await writeFile(
    resolve(collectionOutputDir, 'manifest.ts'),
    toCollectionManifestSource(
      collection,
      manifestVariableName,
      collectionVariableName,
      manifestEntries,
    ),
  )

  await writeFile(
    resolve(collectionOutputDir, 'index.ts'),
    toNestedCollectionIndexSource({
      collectionId: collection.id,
      iconNamesVariableName,
      iconNameTypeName,
      manifestVariableName,
      collectionVariableName,
      componentNames,
    }),
  )

  return {
    id: collection.id,
    collectionVariableName,
    namespaceExportName: collectionCamelName,
  }
}

async function writeCollectionsIndex(collectionRefs) {
  await ensureDir(srcCollectionsDir)

  await writeFile(
    resolve(srcCollectionsDir, 'index.ts'),
    [
      "import type { AllergenIconCollection } from '../types'",
      ...collectionRefs.map(
        collectionRef =>
          `import { ${collectionRef.collectionVariableName} } from './${collectionRef.id}/manifest'`,
      ),
      '',
      `export const allergenIconCollections = [${collectionRefs
        .map(collectionRef => collectionRef.collectionVariableName)
        .join(', ')}] as const satisfies readonly AllergenIconCollection[]`,
      '',
      ...collectionRefs.map(
        collectionRef =>
          `export { ${collectionRef.collectionVariableName} } from './${collectionRef.id}/manifest'`,
      ),
      ...collectionRefs.map(
        collectionRef =>
          `export * as ${collectionRef.namespaceExportName} from './${collectionRef.id}'`,
      ),
      '',
    ].join('\n'),
  )
}

export async function generateCollections() {
  await clearGeneratedCollectionDirs()

  const collectionRefs = [await generateDefaultCollectionAlias()]
  const sourceCollections = await getSourceCollections()

  for (const collection of sourceCollections) {
    collectionRefs.push(await generateSourceCollection(collection))
  }

  await writeCollectionsIndex(collectionRefs)

  console.log(
    `Generated ${sourceCollections.length} collection(s) plus the default compatibility collection.`,
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateCollections().catch(error => {
    console.error(error)
    process.exit(1)
  })
}
