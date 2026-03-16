import type { AllergenIconData } from '../../types'

const EggsIcon = {
  "name": "eggs",
  "collectionId": "erudus",
  "collectionLabel": "Erudus",
  "componentName": "EggsIcon",
  "title": "Eggs",
  "fileName": "eggs.svg",
  "importPath": "@kaspernowak/allergen-icons/icons/erudus/EggsIcon",
  "svgPath": "@kaspernowak/allergen-icons/svg/erudus/eggs.svg",
  "viewBox": "0 0 64 64",
  "defaultPrimaryColor": "#000000",
  "defaultSecondaryColor": "#000000",
  "nodes": [
    {
      "tag": "path",
      "attrs": {
        "d": "M49.7 35.7c0 11.8-7.9 21.4-17.7 21.4s-17.7-9.6-17.7-21.4S22.2 6.9 32 6.9c3.7 0 7.1 2.4 9.9 6 .1.1-1.3 1.7-1.3 1.7l.3 1.2-1.2-.2-.2.4-1.1-.1.3 1.2-.4.4.3.9-.8-.1-1 1.7s.5-.2 1-.6c.2-.1.6-.5.6-.5l1.1.4-.4-1 .4-.3.1-1.1.9.3.3-.2 1.2.3-.1-1.2s1.5-1.2 1.5-1.1c3.9 5.9 6.3 14.1 6.3 20.7"
      }
    }
  ]
} as const satisfies AllergenIconData

export default EggsIcon
