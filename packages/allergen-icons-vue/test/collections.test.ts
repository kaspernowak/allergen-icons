import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import * as collectionNamespaces from '../src/collections'
import { FishIcon } from '../src'
import {
  FishIcon as ErudusFishIcon,
  erudusCollection,
  erudusIconNames,
  erudusIcons,
} from '../src/collections/erudus'
import {
  FishIcon as ReactAllergensFishIcon,
  reactAllergensCollection,
} from '../src/collections/react-allergens'

describe('allergen-icons-vue collections', () => {
  it('exports collection namespaces without colliding component names', () => {
    expect(Object.keys(collectionNamespaces).sort()).toEqual(
      ['erudus', 'reactAllergens'].sort(),
    )
  })

  it('re-exports the default collection components through the compatibility collection', () => {
    expect(ReactAllergensFishIcon).toBe(FishIcon)
    expect(reactAllergensCollection.id).toBe('react-allergens')
  })

  it('re-exports Erudus metadata from the core package', () => {
    expect(erudusCollection.id).toBe('erudus')
    expect(erudusCollection.iconCount).toBe(erudusIcons.length)
    expect(erudusIconNames).toContain('fish')
  })

  it('mounts Erudus collection components', () => {
    const wrapper = mount(ErudusFishIcon)
    const svg = wrapper.find('svg')

    expect(svg.exists()).toBe(true)
    expect(svg.attributes('width')).toBe('1em')
    expect(svg.attributes('height')).toBe('1em')
    expect(svg.element.children.length).toBeGreaterThan(0)
  })

  it('supports monochrome collection icons with the same runtime API', () => {
    const wrapper = mount(ErudusFishIcon, {
      props: {
        color: '#334155',
        secondaryColor: '#ef4444',
      },
    })
    const svg = wrapper.find('svg')
    const paths = wrapper.findAll('path')

    expect(svg.attributes('fill')).toBe('#334155')
    expect(paths.length).toBeGreaterThan(0)
    expect(paths.every(path => path.attributes('fill') !== '#ef4444')).toBe(true)
    expect(paths.every(path => path.attributes('fill') == null)).toBe(true)
  })
})
