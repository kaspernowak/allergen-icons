# @kaspernowak/allergen-icons-vue

Vue 3 allergen icon components generated from the `@kaspernowak/allergen-icons` core package.

## Installation

```bash
pnpm add @kaspernowak/allergen-icons-vue vue
```

## Usage

```vue
<script setup lang="ts">
import { FishIcon, MilkIcon, PeanutIcon } from '@kaspernowak/allergen-icons-vue'
import { FishIcon as ErudusFishIcon } from '@kaspernowak/allergen-icons-vue/collections/erudus'
</script>

<template>
  <div class="flex items-center gap-2 text-slate-700">
    <FishIcon class="size-5" aria-label="Contains fish" />
    <MilkIcon class="size-5 text-blue-700" aria-label="Contains milk" />
    <PeanutIcon class="size-5 text-amber-700" aria-label="Contains peanuts" />
    <ErudusFishIcon class="size-5 text-slate-500" aria-label="Erudus fish icon" />
  </div>
</template>
```

## Collections

The default exports are the default `react-allergens` icons. Additional families are available from collection subpaths:

```ts
import { FishIcon } from '@kaspernowak/allergen-icons-vue'
import { FishIcon as ErudusFishIcon } from '@kaspernowak/allergen-icons-vue/collections/erudus'
```

The `@kaspernowak/allergen-icons-vue/collections` entrypoint also exposes collection namespaces without export collisions:

```ts
import { erudus, reactAllergens } from '@kaspernowak/allergen-icons-vue/collections'
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `number \| string` | `'1em'` | Width and height of the icon |
| `color` | `string` | `'currentColor'` | Primary color |
| `secondaryColor` | `string` | icon-specific default | Optional detail color for duotone icons |
| `title` | `string` | `undefined` | Accessible title text |

All standard SVG attributes and event listeners are passed through to the underlying `svg` element.

## Accessibility

Icons default to `aria-hidden="true"` unless you provide `title` or `aria-label`.

## Styling

Icons use `currentColor` by default for their primary channel, so they inherit the text color from CSS:

```vue
<PeanutIcon class="size-6 text-amber-700" />
<MilkIcon color="#1d4ed8" :size="28" />
<MustardIcon color="#ca8a04" secondaryColor="#ffffff" />
```

The default `react-allergens` set is duotone in nature, so `secondaryColor` controls the inner symbol/details when you want to override them explicitly.

Monochrome collections such as many Erudus icons simply do not consume the detail channel. In those cases, `color` is the only paint channel that affects the rendered paths.

## Tree shaking

Only the icons you import are included in the bundle.

```ts
import { MilkIcon } from '@kaspernowak/allergen-icons-vue'
import FishIcon from '@kaspernowak/allergen-icons-vue/icons/FishIcon'
import { FishIcon as ErudusFishIcon } from '@kaspernowak/allergen-icons-vue/collections/erudus'
```
