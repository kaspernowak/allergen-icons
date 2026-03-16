import type { AllergenIconCollection } from '../../types'
import { allergenIcons } from '../../manifest'

export const reactAllergensCollection = {
  "id": "react-allergens",
  "label": "React Allergens",
  "description": "The default allergen icon set adapted from dsanchez07/react-allergens.",
  "license": "MIT",
  "sourceUrl": "https://github.com/dsanchez07/react-allergens",
  "iconCount": 14,
  "importPath": "@kaspernowak/allergen-icons/collections/react-allergens"
} as const satisfies AllergenIconCollection

export const reactAllergensIcons = allergenIcons
