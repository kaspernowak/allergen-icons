import type { AllergenIconData } from '../../types'

const VegetarianIcon = {
  "name": "vegetarian",
  "collectionId": "erudus",
  "collectionLabel": "Erudus",
  "componentName": "VegetarianIcon",
  "title": "Vegetarian",
  "fileName": "vegetarian.svg",
  "importPath": "@kaspernowak/allergen-icons/icons/erudus/VegetarianIcon",
  "svgPath": "@kaspernowak/allergen-icons/svg/erudus/vegetarian.svg",
  "viewBox": "0 0 64 64",
  "defaultPrimaryColor": "#000000",
  "defaultSecondaryColor": "#000000",
  "nodes": [
    {
      "tag": "path",
      "attrs": {
        "d": "M14.5 22.5h5.4c.6 0 1 .1 1.4.4s.6.6.8 1.1l8.4 21.4c.3.7.5 1.5.8 2.3s.5 1.7.7 2.6c.4-1.9.9-3.5 1.4-4.9L41.9 24c.1-.4.4-.7.8-1s.9-.5 1.4-.5h5.4L35 57.5h-6z"
      }
    }
  ]
} as const satisfies AllergenIconData

export default VegetarianIcon
