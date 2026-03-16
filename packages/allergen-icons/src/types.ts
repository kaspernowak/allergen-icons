export interface AllergenIconNode {
  readonly tag: string
  readonly attrs?: Readonly<Record<string, string>>
  readonly children?: readonly AllergenIconNode[]
}

export interface AllergenIconData {
  readonly name: string
  readonly collectionId?: string
  readonly collectionLabel?: string
  readonly componentName: string
  readonly title: string
  readonly fileName: string
  readonly importPath: string
  readonly svgPath: string
  readonly viewBox: string
  readonly defaultPrimaryColor: string
  readonly defaultSecondaryColor: string
  readonly nodes: readonly AllergenIconNode[]
}

export interface AllergenIconManifestEntry extends Omit<AllergenIconData, 'nodes'> {}

export interface AllergenIconCollection {
  readonly id: string
  readonly label: string
  readonly description?: string
  readonly license?: string
  readonly sourceUrl?: string
  readonly iconCount: number
  readonly importPath: string
}
