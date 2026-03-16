import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const coreSrcDir = resolve(packageDir, '../allergen-icons/src')
const coreIconsDir = resolve(coreSrcDir, 'icons')
const coreCollectionsDir = resolve(coreSrcDir, 'collections')
const vueSrcDir = resolve(packageDir, 'src')
const vueIconsDir = resolve(vueSrcDir, 'icons')
const vueCollectionsDir = resolve(vueSrcDir, 'collections')
const vueCollectionsIndexPath = resolve(vueCollectionsDir, 'index.ts')
const vueIndexPath = resolve(vueSrcDir, 'index.ts')
const defaultCollectionId = 'react-allergens'
const corePackageName = '@kaspernowak/allergen-icons'

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

function toRootWrapperSource(componentName) {
  return `import iconData from '${corePackageName}/icons/${componentName}'\nimport { createAllergenIcon } from '../createAllergenIcon'\n\nconst ${componentName} = createAllergenIcon(iconData)\n\nexport default ${componentName}\n`
}

function toCollectionWrapperSource(collectionId, componentName) {
  return `import iconData from '${corePackageName}/icons/${collectionId}/${componentName}'\nimport { createAllergenIcon } from '../../createAllergenIcon'\n\nconst ${componentName} = createAllergenIcon(iconData)\n\nexport default ${componentName}\n`
}

function getCollectionBindingNames(collectionId) {
  if (collectionId === defaultCollectionId) {
    return {
      namespaceExportName: 'reactAllergens',
      collectionVariableName: 'reactAllergensCollection',
      manifestVariableName: 'reactAllergensIcons',
      iconNamesVariableName: 'reactAllergensIconNames',
      iconNameTypeName: 'ReactAllergensIconName',
    }
  }

  const collectionCamelName = toCamelCase(collectionId)
  const collectionPascalName = toPascalCase(collectionId)

  return {
    namespaceExportName: collectionCamelName,
    collectionVariableName: `${collectionCamelName}Collection`,
    manifestVariableName: `${collectionCamelName}Icons`,
    iconNamesVariableName: `${collectionCamelName}IconNames`,
    iconNameTypeName: `${collectionPascalName}IconName`,
  }
}

async function getRootComponentNames() {
  return (await readdir(coreIconsDir, { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.endsWith('.ts') && entry.name !== 'index.ts')
    .map(entry => entry.name.replace(/\.ts$/, ''))
    .sort((left, right) => left.localeCompare(right))
}

async function getCollectionIds() {
  return (await readdir(coreCollectionsDir, { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort((left, right) => left.localeCompare(right))
}

async function getCollectionComponentNames(collectionId, rootComponentNames) {
  if (collectionId === defaultCollectionId) {
    return rootComponentNames
  }

  return (await readdir(resolve(coreIconsDir, collectionId), { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.endsWith('.ts'))
    .map(entry => entry.name.replace(/\.ts$/, ''))
    .sort((left, right) => left.localeCompare(right))
}

async function generateRootBindings() {
  const componentNames = await getRootComponentNames()

  for (const componentName of componentNames) {
    await writeFile(
      resolve(vueIconsDir, `${componentName}.ts`),
      toRootWrapperSource(componentName),
    )
  }

  await writeFile(
    vueIndexPath,
    [
      "export type * from './types'",
      "export { createAllergenIcon } from './createAllergenIcon'",
      ...componentNames.map(
        componentName =>
          `export { default as ${componentName} } from './icons/${componentName}'`,
      ),
      '',
    ].join('\n'),
  )

  return componentNames
}

async function generateCollectionBindings(rootComponentNames) {
  const collectionIds = await getCollectionIds()
  const collectionRefs = []

  for (const collectionId of collectionIds) {
    const componentNames = await getCollectionComponentNames(
      collectionId,
      rootComponentNames,
    )
    const collectionOutputDir = resolve(vueCollectionsDir, collectionId)
    const {
      namespaceExportName,
      collectionVariableName,
      manifestVariableName,
      iconNamesVariableName,
      iconNameTypeName,
    } = getCollectionBindingNames(collectionId)

    await mkdir(collectionOutputDir, { recursive: true })

    if (collectionId !== defaultCollectionId) {
      const collectionIconsDir = resolve(vueIconsDir, collectionId)
      await mkdir(collectionIconsDir, { recursive: true })

      for (const componentName of componentNames) {
        await writeFile(
          resolve(collectionIconsDir, `${componentName}.ts`),
          toCollectionWrapperSource(collectionId, componentName),
        )
      }
    }

    await writeFile(
      resolve(collectionOutputDir, 'index.ts'),
      [
        `export type { ${iconNameTypeName} } from '${corePackageName}/collections/${collectionId}'`,
        `export { ${iconNamesVariableName}, ${collectionVariableName}, ${manifestVariableName} } from '${corePackageName}/collections/${collectionId}'`,
        ...componentNames.map(componentName => {
          if (collectionId === defaultCollectionId) {
            return `export { default as ${componentName} } from '../../icons/${componentName}'`
          }

          return `export { default as ${componentName} } from '../../icons/${collectionId}/${componentName}'`
        }),
        '',
      ].join('\n'),
    )

    collectionRefs.push({
      id: collectionId,
      namespaceExportName,
    })
  }

  await writeFile(
    vueCollectionsIndexPath,
    [
      ...collectionRefs.map(
        collectionRef =>
          `export * as ${collectionRef.namespaceExportName} from './${collectionRef.id}'`,
      ),
      '',
    ].join('\n'),
  )
}

export async function generateVueBindings() {
  await rm(vueIconsDir, { recursive: true, force: true })
  await rm(vueCollectionsDir, { recursive: true, force: true })
  await mkdir(vueIconsDir, { recursive: true })
  await mkdir(vueCollectionsDir, { recursive: true })

  const rootComponentNames = await generateRootBindings()
  await generateCollectionBindings(rootComponentNames)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateVueBindings().catch(error => {
    console.error(error)
    process.exit(1)
  })
}
