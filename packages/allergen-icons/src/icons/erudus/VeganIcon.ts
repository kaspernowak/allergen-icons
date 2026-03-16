import type { AllergenIconData } from '../../types'

const VeganIcon = {
  "name": "vegan",
  "collectionId": "erudus",
  "collectionLabel": "Erudus",
  "componentName": "VeganIcon",
  "title": "Vegan",
  "fileName": "vegan.svg",
  "importPath": "@kaspernowak/allergen-icons/icons/erudus/VeganIcon",
  "svgPath": "@kaspernowak/allergen-icons/svg/erudus/vegan.svg",
  "viewBox": "0 0 64 64",
  "defaultPrimaryColor": "#000000",
  "defaultSecondaryColor": "#000000",
  "nodes": [
    {
      "tag": "path",
      "attrs": {
        "d": "M48.5 10.2s-5.2.2-6.5 3.5c-1.3 3.2 3 9.4 1.4 10.5-.4.3-2.5.3-2.9.6s-.6.6-.7 1l-.5 1.4-7.4 19.1c-.5 1.4-1 2.9-1.3 4.7-.2-.9-.4-1.7-.7-2.5-.2-.8-.5-1.5-.8-2.2l-7.9-20.6c-.2-.4-.4-1.4-.8-1.7-.4-.2-.9-1-1.4-1h-5.1l13.6 35h5.7s10.2-22.8 12.4-30.8c.2-.6-1.2-2.5-.6-3 8.8-8 3.5-14 3.5-14"
      }
    }
  ]
} as const satisfies AllergenIconData

export default VeganIcon
