import type { AllergenIconCollection } from '../types'
import { reactAllergensCollection } from './react-allergens/manifest'
import { erudusCollection } from './erudus/manifest'

export const allergenIconCollections = [reactAllergensCollection, erudusCollection] as const satisfies readonly AllergenIconCollection[]

export { reactAllergensCollection } from './react-allergens/manifest'
export { erudusCollection } from './erudus/manifest'
export * as reactAllergens from './react-allergens'
export * as erudus from './erudus'
