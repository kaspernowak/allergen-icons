import type { AllergenIconData } from '../../types'

const CircleVegetarianIcon = {
  "name": "circle-vegetarian",
  "collectionId": "erudus",
  "collectionLabel": "Erudus",
  "componentName": "CircleVegetarianIcon",
  "title": "Circle Vegetarian",
  "fileName": "circle-vegetarian.svg",
  "importPath": "@kaspernowak/allergen-icons/icons/erudus/CircleVegetarianIcon",
  "svgPath": "@kaspernowak/allergen-icons/svg/erudus/circle-vegetarian.svg",
  "viewBox": "0 0 64 64",
  "defaultPrimaryColor": "#000000",
  "defaultSecondaryColor": "#000000",
  "nodes": [
    {
      "tag": "path",
      "attrs": {
        "d": "M14.5 22.5h5.4c.6 0 1 .1 1.4.4s.6.6.8 1.1l8.4 21.4c.3.7.5 1.5.8 2.3s.5 1.7.7 2.6c.4-1.9.9-3.5 1.4-4.9L41.9 24c.1-.4.4-.7.8-1s.9-.5 1.4-.5h5.4L35 57.5h-6z"
      }
    },
    {
      "tag": "path",
      "attrs": {
        "d": "M32 3c16 0 29 13 29 29S48 61 32 61 3 48 3 32 16 3 32 3m0-3C14.3 0 0 14.3 0 32s14.3 32 32 32 32-14.3 32-32S49.7 0 32 0"
      }
    }
  ]
} as const satisfies AllergenIconData

export default CircleVegetarianIcon
