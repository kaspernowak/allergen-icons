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

## Per-icon default colors in Vue

If you want `CeleryIcon` to always render in `#4cad3b`, `GlutenIcon` in `#ee7440`, and so on without repeating `color` everywhere, the best place to do that is in your app with a small wrapper component.

That keeps this package flexible and `currentColor`-friendly by default, while still letting your Vue app define a single canonical palette for the default `react-allergens` set.

### Example wrapper component

```vue
<script setup lang="ts">
import { computed, type Component } from 'vue'
import {
  CeleryIcon,
  CrustaceanIcon,
  EggIcon,
  FishIcon,
  GlutenIcon,
  LupinIcon,
  MilkIcon,
  MolluscIcon,
  MustardIcon,
  NutsIcon,
  PeanutIcon,
  SesameIcon,
  SoyaIcon,
  SulphiteIcon,
  type AllergenIconProps,
} from '@kaspernowak/allergen-icons-vue'

const iconComponents = {
  celery: CeleryIcon,
  crustacean: CrustaceanIcon,
  egg: EggIcon,
  fish: FishIcon,
  gluten: GlutenIcon,
  lupin: LupinIcon,
  milk: MilkIcon,
  mollusc: MolluscIcon,
  mustard: MustardIcon,
  nuts: NutsIcon,
  peanut: PeanutIcon,
  sesame: SesameIcon,
  soya: SoyaIcon,
  sulphite: SulphiteIcon,
} as const

const defaultColors = {
  celery: '#4cad3b',
  crustacean: '#00a1db',
  egg: '#f39339',
  fish: '#403b8a',
  gluten: '#ee7440',
  lupin: '#f6d24e',
  milk: '#804330',
  mollusc: '#03b2c7',
  mustard: '#c69838',
  nuts: '#cf4d51',
  peanut: '#c57b4f',
  sesame: '#a89a7b',
  soya: '#009a4c',
  sulphite: '#8d2f51',
} as const

type ReactAllergenIconName = keyof typeof iconComponents

const props = defineProps<{
  name: ReactAllergenIconName
  color?: string
  secondaryColor?: string
  size?: AllergenIconProps['size']
  title?: string
}>()

const resolvedIcon = computed<Component>(() => iconComponents[props.name])
const resolvedColor = computed(() => props.color ?? defaultColors[props.name])
</script>

<template>
  <component
    :is="resolvedIcon"
    :color="resolvedColor"
    :secondary-color="secondaryColor"
    :size="size"
    :title="title"
    v-bind="$attrs"
  />
</template>
```

### Usage

```vue
<script setup lang="ts">
import AllergenBadgeIcon from './components/AllergenBadgeIcon.vue'
</script>

<template>
  <div class="flex items-center gap-2">
    <AllergenBadgeIcon name="celery" class="size-5" aria-label="Contains celery" />
    <AllergenBadgeIcon name="gluten" class="size-5" aria-label="Contains gluten" />
    <AllergenBadgeIcon name="peanut" class="size-5" aria-label="Contains peanuts" />

    <AllergenBadgeIcon
      name="peanut"
      class="size-5"
      color="#7c3aed"
      aria-label="Peanut override"
    />
  </div>
</template>
```

Leave `secondaryColor` unset if you want to preserve each icon's built-in contrast color. Pass it only when you want a custom detail color too.

### Where Tailwind fits

Tailwind is optional here. The per-icon default decision lives most naturally in Vue, because it depends on which component you render.

If you already keep your design tokens in Tailwind, you can still use that setup by storing your allergen colors as CSS variables and referencing those variables in the `defaultColors` map.

### Tailwind 4 tokens

```css
@import "tailwindcss";

@theme {
  --color-allergen-celery: #4cad3b;
  --color-allergen-gluten: #ee7440;
  --color-allergen-peanut: #c57b4f;
}
```

```ts
const defaultColors = {
  celery: 'var(--color-allergen-celery)',
  gluten: 'var(--color-allergen-gluten)',
  peanut: 'var(--color-allergen-peanut)',
} as const
```

### Tailwind 3 tokens

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        allergen: {
          celery: '#4cad3b',
          gluten: '#ee7440',
          peanut: '#c57b4f',
        },
      },
    },
  },
} satisfies Config
```

```css
@layer base {
  :root {
    --allergen-color-celery: theme('colors.allergen.celery');
    --allergen-color-gluten: theme('colors.allergen.gluten');
    --allergen-color-peanut: theme('colors.allergen.peanut');
  }
}
```

```ts
const defaultColors = {
  celery: 'var(--allergen-color-celery)',
  gluten: 'var(--allergen-color-gluten)',
  peanut: 'var(--allergen-color-peanut)',
} as const
```

For most Vue apps, plain hex values or CSS variables in your wrapper component are the simplest option. Tailwind only needs to be involved if it is already your source of truth for color tokens.

## Tree shaking

Only the icons you import are included in the bundle.

```ts
import { MilkIcon } from '@kaspernowak/allergen-icons-vue'
import FishIcon from '@kaspernowak/allergen-icons-vue/icons/FishIcon'
import { FishIcon as ErudusFishIcon } from '@kaspernowak/allergen-icons-vue/collections/erudus'
```
