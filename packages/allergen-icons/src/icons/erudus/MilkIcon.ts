import type { AllergenIconData } from '../../types'

const MilkIcon = {
  "name": "milk",
  "collectionId": "erudus",
  "collectionLabel": "Erudus",
  "componentName": "MilkIcon",
  "title": "Milk",
  "fileName": "milk.svg",
  "importPath": "@kaspernowak/allergen-icons/icons/erudus/MilkIcon",
  "svgPath": "@kaspernowak/allergen-icons/svg/erudus/milk.svg",
  "viewBox": "0 0 64 64",
  "defaultPrimaryColor": "#000000",
  "defaultSecondaryColor": "#000000",
  "nodes": [
    {
      "tag": "path",
      "attrs": {
        "d": "M35.7 21.4c-.1-.2-2.4-5.1-4.7-8.1.5-.3.9-1 .9-1.7 0-1.1-.7-1.9-1.5-1.9H19.8c-.8 0-1.5.9-1.5 1.9 0 .8.3 1.4.9 1.7-2.3 3-4.6 7.9-4.7 8.1l-.1.3v27.5c0 2.8 2.4 5.1 5.3 5.1h10.9c2.9 0 5.3-2.3 5.3-5.1V21.7zm-10.8.6c-3.7 2.7-9 0-9 0s2.8-5.9 5.1-8.5h8.2c2.3 2.7 5.1 8.5 5.1 8.5s-5.7-2.7-9.4 0m11.5 15.1 1.3 16.8h10.6l1.3-16.8zm6.8 4.8c-1.6 1-5.4 0-5.4 0l-.4-3.9h11.2l-.3 3.9c.1 0-3.6-1-5.1 0"
      }
    }
  ]
} as const satisfies AllergenIconData

export default MilkIcon
