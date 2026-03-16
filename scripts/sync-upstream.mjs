import { access, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const upstreamDirCandidates = [
  resolve(rootDir, '../react-allergens'),
  resolve(rootDir, '../../react-allergens'),
]
const coreSrcDir = resolve(rootDir, 'packages/allergen-icons/src')
const coreIconsDir = resolve(coreSrcDir, 'icons')
const coreSvgDir = resolve(coreSrcDir, 'svg')
const collectionsGenerateModulePath = resolve(
  rootDir,
  'packages/allergen-icons/scripts/generate-collections.mjs',
)
const vueGenerateModulePath = resolve(rootDir, 'packages/allergen-icons-vue/scripts/generate.mjs')

const CORE_PACKAGE_NAME = '@kaspernowak/allergen-icons'
const VIEW_BOX = '0 0 216 216'
const PRIMARY_TOKEN = '__ALLERGEN_ICONS_PRIMARY__'
const SECONDARY_TOKEN = '__ALLERGEN_ICONS_SECONDARY__'
const STANDARD_BADGE_PATH =
  'M215.84 107.75c0 59.59-48.16 108.11-108.09 108.11C48.17 215.86 0 167.34 0 107.75 0 47.81 48.17 0 107.75 0c59.93 0 108.09 47.81 108.09 107.75z'

function camelToKebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function pascalToKebabCase(value) {
  return value
    .replace(/Icon$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function extractWrapperMarkup(source) {
  const wrapperStart = source.indexOf('<SvgWrapper')

  if (wrapperStart === -1) {
    throw new Error('Could not find <SvgWrapper> in upstream component source.')
  }

  const wrapperOpenEnd = source.indexOf('>', wrapperStart)
  const wrapperClose = source.indexOf('</SvgWrapper>', wrapperOpenEnd)

  if (wrapperOpenEnd === -1 || wrapperClose === -1) {
    throw new Error('Could not locate SvgWrapper boundaries in upstream component source.')
  }

  return source.slice(wrapperOpenEnd + 1, wrapperClose)
}

function extractDefaultColor(source, propName) {
  const patterns = [
    new RegExp(`${propName}\\s*:\\s*'([^']+)'`),
    new RegExp(`${propName}\\s*:\\s*\"([^\"]+)\"`),
  ]

  for (const pattern of patterns) {
    const match = source.match(pattern)

    if (match) {
      return match[1]
    }
  }

  throw new Error(`Could not find default prop ${propName}.`)
}

function normalizeExpressionValue(attributeName, expression) {
  if (expression === 'outerColor') {
    return { [camelToKebabCase(attributeName)]: PRIMARY_TOKEN }
  }

  if (expression === 'innerColor') {
    return { [camelToKebabCase(attributeName)]: SECONDARY_TOKEN }
  }

  if (/^-?\d+(?:\.\d+)?$/.test(expression)) {
    return { [camelToKebabCase(attributeName)]: expression }
  }

  throw new Error(`Unsupported JSX expression: ${attributeName}={${expression}}`)
}

function resolveStyleValue(value) {
  const trimmed = value.trim()

  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1)
  }

  if (trimmed === 'outerColor') {
    return PRIMARY_TOKEN
  }

  if (trimmed === 'innerColor') {
    return SECONDARY_TOKEN
  }

  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return trimmed
  }

  throw new Error(`Unsupported style value: ${trimmed}`)
}

function parseStyleObject(styleBody) {
  const attributes = {}
  const propertyPattern = /([A-Za-z_]\w*)\s*:\s*([^,}]+)/g

  for (const match of styleBody.matchAll(propertyPattern)) {
    const [, propertyName, propertyValue] = match
    attributes[camelToKebabCase(propertyName)] = resolveStyleValue(propertyValue)
  }

  return attributes
}

function extractStyleReferences(source) {
  const references = {}
  const styleDeclarationPattern = /const\s+([A-Za-z_]\w*)\s*=\s*\{([\s\S]*?)\};/g

  for (const match of source.matchAll(styleDeclarationPattern)) {
    const [, styleName, styleBody] = match
    references[styleName] = parseStyleObject(styleBody)
  }

  return references
}

function extractStyleAttributes(rawAttributes, styleReferences) {
  const attributes = {}
  const styleObjectMatch = rawAttributes.match(/style\s*=\s*\{\{([\s\S]*?)\}\}/)

  if (styleObjectMatch) {
    Object.assign(attributes, parseStyleObject(styleObjectMatch[1]))
  }

  const styleReferenceMatch = rawAttributes.match(/style\s*=\s*\{\s*([A-Za-z_]\w*)\s*\}/)

  if (styleReferenceMatch) {
    const styleName = styleReferenceMatch[1]
    const styleReference = styleReferences[styleName]

    if (!styleReference) {
      throw new Error(`Could not resolve style reference "${styleName}".`)
    }

    Object.assign(attributes, styleReference)
  }

  return {
    attrs: attributes,
    rawAttributes: rawAttributes
      .replace(/style\s*=\s*\{\{[\s\S]*?\}\}/g, ' ')
      .replace(/style\s*=\s*\{\s*[A-Za-z_]\w*\s*\}/g, ' '),
  }
}

function parseAttributes(rawAttributes, styleReferences) {
  const { attrs: extractedStyleAttributes, rawAttributes: normalizedAttributes } =
    extractStyleAttributes(rawAttributes, styleReferences)
  const attributes = { ...extractedStyleAttributes }
  const attributePattern = /([:@A-Za-z_][-:\w.]*)\s*=\s*(\{[^}]+\}|"[^"]*"|'[^']*')/g

  for (const match of normalizedAttributes.matchAll(attributePattern)) {
    const [, attributeName, rawValue] = match

    if (rawValue.startsWith('{')) {
      const expression = rawValue.slice(1, -1).trim()
      Object.assign(attributes, normalizeExpressionValue(attributeName, expression))
      continue
    }

    const normalizedName = camelToKebabCase(attributeName)
    attributes[normalizedName] = rawValue.slice(1, -1)
  }

  return Object.keys(attributes).length > 0 ? attributes : undefined
}

function parseNodes(markup, styleReferences) {
  const nodes = []
  const elementPattern = /<([A-Za-z][\w]*)\s+([\s\S]*?)\/>/g

  for (const match of markup.matchAll(elementPattern)) {
    const [, tag, rawAttributes] = match

    nodes.push({
      tag,
      attrs: parseAttributes(rawAttributes, styleReferences),
    })
  }

  if (nodes.length === 0) {
    throw new Error('No SVG child elements were extracted from the upstream component.')
  }

  return nodes
}

function normalizeNodes(nodes) {
  if (nodes.length === 0) {
    return nodes
  }

  const [firstNode, ...restNodes] = nodes

  if (firstNode.tag !== 'path') {
    return nodes
  }

  return [
    {
      ...firstNode,
      attrs: {
        ...(firstNode.attrs ?? {}),
        fill: PRIMARY_TOKEN,
        d: STANDARD_BADGE_PATH,
      },
    },
    ...restNodes,
  ]
}

function materializeToken(value, primaryColor, secondaryColor) {
  if (value === PRIMARY_TOKEN) {
    return primaryColor
  }

  if (value === SECONDARY_TOKEN) {
    return secondaryColor
  }

  return value
}

function serializeNode(node, primaryColor, secondaryColor, indent = '  ') {
  const attrs = Object.entries(node.attrs ?? {})
    .map(([name, value]) => ` ${name}="${escapeXml(materializeToken(value, primaryColor, secondaryColor))}"`)
    .join('')

  if (!node.children?.length) {
    return `${indent}<${node.tag}${attrs} />`
  }

  const children = node.children
    .map(child => serializeNode(child, primaryColor, secondaryColor, `${indent}  `))
    .join('\n')

  return `${indent}<${node.tag}${attrs}>\n${children}\n${indent}</${node.tag}>`
}

function toGeneratedModule(name, iconData) {
  return `import type { AllergenIconData } from '../types'\n\nconst ${name} = ${JSON.stringify(iconData, null, 2)} as const satisfies AllergenIconData\n\nexport default ${name}\n`
}

function toManifestModule(entries) {
  return `import type { AllergenIconManifestEntry } from './types'\n\nexport const allergenIcons = ${JSON.stringify(entries, null, 2)} as const satisfies readonly AllergenIconManifestEntry[]\n`
}

function toIconNamesModule(iconNames) {
  return `export const allergenIconNames = ${JSON.stringify(iconNames, null, 2)} as const\n\nexport type AllergenIconName = (typeof allergenIconNames)[number]\n`
}

function toCoreIndexModule() {
  return [
    "export type * from './types'",
    "export { allergenIconCollections } from './collections'",
    "export { allergenIconNames } from './icon-names'",
    "export { allergenIcons } from './manifest'",
    '',
  ].join('\n')
}

async function ensureCleanDir(pathname) {
  await rm(pathname, { recursive: true, force: true })
  await mkdir(pathname, { recursive: true })
}

async function assertUpstreamCheckout() {
  for (const upstreamDir of upstreamDirCandidates) {
    const upstreamComponentsDir = resolve(upstreamDir, 'src/lib/components')

    try {
      await access(upstreamComponentsDir)
      return upstreamComponentsDir
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(
    `Upstream checkout not found. Checked: ${upstreamDirCandidates
      .map(candidate => resolve(candidate, 'src/lib/components'))
      .join(', ')}`,
  )
}

async function createCoreAssets(upstreamComponentsDir) {
  const files = (await readdir(upstreamComponentsDir))
    .filter(fileName => fileName.endsWith('Icon.js') && fileName !== 'SvgWrapper.js')
    .sort((left, right) => left.localeCompare(right))

  if (files.length === 0) {
    throw new Error(`No upstream icon components found in ${upstreamComponentsDir}.`)
  }

  await ensureCleanDir(coreIconsDir)
  await ensureCleanDir(coreSvgDir)

  const manifestEntries = []

  for (const fileName of files) {
    const componentName = fileName.replace(/\.js$/, '')
    const source = await readFile(resolve(upstreamComponentsDir, fileName), 'utf8')
    const markup = extractWrapperMarkup(source)
    const styleReferences = extractStyleReferences(source)
    const nodes = normalizeNodes(parseNodes(markup, styleReferences))
    const defaultPrimaryColor = extractDefaultColor(source, 'outerColor')
    const defaultSecondaryColor = extractDefaultColor(source, 'innerColor')
    const iconFileName = `${pascalToKebabCase(componentName)}.svg`
    const name = iconFileName.replace(/\.svg$/, '')

    const iconData = {
      name,
      componentName,
      title: componentName.replace(/Icon$/, ''),
      fileName: iconFileName,
      importPath: `${CORE_PACKAGE_NAME}/icons/${componentName}`,
      svgPath: `${CORE_PACKAGE_NAME}/svg/${iconFileName}`,
      viewBox: VIEW_BOX,
      defaultPrimaryColor,
      defaultSecondaryColor,
      nodes,
    }

    manifestEntries.push({
      name: iconData.name,
      componentName: iconData.componentName,
      title: iconData.title,
      fileName: iconData.fileName,
      importPath: iconData.importPath,
      svgPath: iconData.svgPath,
      viewBox: iconData.viewBox,
      defaultPrimaryColor: iconData.defaultPrimaryColor,
      defaultSecondaryColor: iconData.defaultSecondaryColor,
    })

    const svgSource = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX}">`,
      ...iconData.nodes.map(node => serializeNode(node, defaultPrimaryColor, defaultSecondaryColor)),
      '</svg>',
      '',
    ].join('\n')

    await writeFile(resolve(coreIconsDir, `${componentName}.ts`), toGeneratedModule(componentName, iconData))
    await writeFile(resolve(coreSvgDir, iconFileName), svgSource)
  }

  const iconNames = manifestEntries.map(icon => icon.name)

  await writeFile(resolve(coreSrcDir, 'manifest.ts'), toManifestModule(manifestEntries))
  await writeFile(resolve(coreSrcDir, 'icon-names.ts'), toIconNamesModule(iconNames))
  await writeFile(resolve(coreSrcDir, 'index.ts'), toCoreIndexModule())
}

async function main() {
  const upstreamComponentsDir = await assertUpstreamCheckout()
  await createCoreAssets(upstreamComponentsDir)

  const collectionsGeneratorModule = await import(pathToFileURL(collectionsGenerateModulePath).href)
  const vueGeneratorModule = await import(pathToFileURL(vueGenerateModulePath).href)
  await collectionsGeneratorModule.generateCollections()
  await vueGeneratorModule.generateVueBindings()

  console.log('Synchronized upstream react-allergens assets into allergen-icons packages.')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
