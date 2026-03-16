# @kaspernowak/allergen-icons

Framework-neutral allergen icon assets extracted from the upstream `dsanchez07/react-allergens` package.

## What this package contains

- raw SVG assets under `@kaspernowak/allergen-icons/svg/*`
- normalized icon metadata via `@kaspernowak/allergen-icons/manifest`
- icon name unions via `@kaspernowak/allergen-icons`
- per-icon data modules via `@kaspernowak/allergen-icons/icons/*`
- collection metadata via `@kaspernowak/allergen-icons/collections`
- collection-specific modules via `@kaspernowak/allergen-icons/collections/*`

## Example

```ts
import { allergenIcons, allergenIconNames } from '@kaspernowak/allergen-icons'
import fishIcon from '@kaspernowak/allergen-icons/icons/FishIcon'
import { erudusCollection, erudusIconNames } from '@kaspernowak/allergen-icons/collections/erudus'
import erudusFishIcon from '@kaspernowak/allergen-icons/icons/erudus/FishIcon'
```

Each icon module includes the icon name, title, raw SVG path, default colors, and a typed render tree that can be used to generate bindings for other frameworks.

## Collections

The root package exports the default `react-allergens` set. Extra icon families are namespaced under collection subpaths so they can coexist without component-name collisions.

Available collection ids:

- `react-allergens`
- `erudus`

## Attribution

This package contains an adaptation of icons from `dsanchez07/react-allergens`, which is MIT-licensed upstream. Attribution notes are preserved in `NOTICE`.
