# allergen-icons

A framework-neutral allergen icon workspace built from the upstream `dsanchez07/react-allergens` icon set, with a typed core package and generated Vue 3 bindings.

> This repository contains a framework-neutral extraction and Vue 3 adaptation of icons from [`dsanchez07/react-allergens`](https://github.com/dsanchez07/react-allergens), which is MIT-licensed. Original attribution is preserved in this workspace.

## Packages

| Package | Description |
| --- | --- |
| [`@kaspernowak/allergen-icons`](./packages/allergen-icons) | Core SVG assets, manifest metadata, icon names, and per-icon data modules |
| [`@kaspernowak/allergen-icons-vue`](./packages/allergen-icons-vue) | Vue 3 render-function components generated from the core icon data |

## Available icons

| Component | Allergen |
| --- | --- |
| `CeleryIcon` | Celery |
| `CrustaceanIcon` | Crustaceans |
| `EggIcon` | Eggs |
| `FishIcon` | Fish |
| `GlutenIcon` | Gluten |
| `LupinIcon` | Lupin |
| `MilkIcon` | Milk |
| `MolluscIcon` | Molluscs |
| `MustardIcon` | Mustard |
| `NutsIcon` | Tree nuts |
| `PeanutIcon` | Peanuts |
| `SesameIcon` | Sesame |
| `SoyaIcon` | Soy |
| `SulphiteIcon` | Sulphites |

## Quick start

```bash
pnpm add @kaspernowak/allergen-icons-vue vue
```

```vue
<script setup lang="ts">
import { FishIcon, MilkIcon, PeanutIcon } from '@kaspernowak/allergen-icons-vue'
</script>

<template>
  <div class="flex items-center gap-2 text-slate-700">
    <FishIcon class="size-5" aria-label="Contains fish" />
    <MilkIcon class="size-5 text-blue-700" aria-label="Contains milk" />
    <PeanutIcon class="size-5 text-amber-700" aria-label="Contains peanuts" />
  </div>
</template>
```

## Collections

The default root exports stay focused on the `react-allergens` set for backward compatibility.

Additional icon families are exposed as collection subpaths:

```ts
import { allergenIconCollections } from '@kaspernowak/allergen-icons'
import { erudusCollection, erudusIconNames } from '@kaspernowak/allergen-icons/collections/erudus'
import { FishIcon as ErudusFishIcon } from '@kaspernowak/allergen-icons-vue/collections/erudus'
```

Current collections:

- `react-allergens`: the default icon set
- `erudus`: the Erudus allergen and dietary icons

## Design goals

- ESM-first packages
- per-icon exports
- tree-shakable metadata and components
- `currentColor`-first styling
- primary + detail paint channels when the source artwork needs them
- accessible defaults
- generated framework bindings
- preserved upstream attribution

## Color model

The shared runtime API is designed to work across both duotone and monochrome collections.

- `color` is the primary paint channel and defaults to `currentColor`
- `secondaryColor` is the optional detail-channel override for icons that have interior artwork

For the default `react-allergens` collection, icons are typically duotone badges with a background shape and a contrasting inner glyph.

For collections like `erudus`, many icons are monochrome. Those icons simply consume the primary channel and ignore the detail channel.

## Development

```bash
pnpm install
pnpm run build
pnpm run test
pnpm run typecheck
```

### Upstream sync

Refreshing the icons from the upstream `react-allergens` checkout is an explicit maintenance step, not a build prerequisite:

```bash
pnpm run sync:upstream
pnpm run build
```

The normal `build`, `test`, `typecheck`, and CI/release workflows operate on the committed sources in this repository.

### Importing a new SVG collection

Additional icon sets live under `packages/allergen-icons/sources/collections/<collection-id>`.

Use the generic importer to seed a new collection from a local SVG directory:

```bash
pnpm run import:collection -- --id custom-icons --label "Custom Icons" --source ../custom-icons/svg
pnpm run verify
```

For the existing Erudus checkout next to the workspace:

```bash
pnpm run sync:erudus
pnpm run verify
```

Detailed maintainer guidance lives in [`MAINTAINERS.md`](./MAINTAINERS.md).

## Release flow

This workspace uses Changesets and a GitHub Actions release workflow.

1. Add a changeset with `pnpm changeset`.
2. Merge the PR to `main`.
3. The release workflow creates or updates a release PR.
4. Merging that release PR publishes the packages to npm when `NPM_TOKEN` is configured in GitHub Actions secrets.
