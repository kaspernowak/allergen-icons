import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { allergenIcons } from '../../allergen-icons/src/manifest'
import * as allExports from '../src'
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
} from '../src'

const icons = {
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
}

const manifestByComponentName = new Map(
  allergenIcons.map(icon => [icon.componentName, icon]),
)

const typedIconEntries = Object.entries(icons) as Array<[keyof typeof icons, (typeof icons)[keyof typeof icons]]>

describe('allergen-icons-vue', () => {
  it('exports one Vue component per core manifest entry', () => {
    const exportedComponentNames = Object.keys(allExports).filter(
      key => key.endsWith('Icon') && key !== 'createAllergenIcon',
    )

    expect(exportedComponentNames.sort()).toEqual(
      allergenIcons.map(icon => icon.componentName).sort(),
    )
  })

  it('exports exactly 14 icon components', () => {
    const iconExports = Object.keys(allExports).filter(
      key => key.endsWith('Icon') && key !== 'createAllergenIcon',
    )

    expect(iconExports).toHaveLength(14)
  })

  for (const [name, Icon] of typedIconEntries) {
    it(`${name} mounts an SVG element`, () => {
      const wrapper = mount(Icon)
      const svg = wrapper.find('svg')
      const manifestEntry = manifestByComponentName.get(name)

      expect(svg.exists()).toBe(true)
      expect(svg.attributes('xmlns')).toBe('http://www.w3.org/2000/svg')
      expect(svg.attributes('viewBox') ?? svg.attributes('viewbox')).toBe(manifestEntry?.viewBox)
    })

    it(`${name} has the expected default sizing and accessibility attributes`, () => {
      const wrapper = mount(Icon)
      const svg = wrapper.find('svg')

      expect(svg.attributes('width')).toBe('1em')
      expect(svg.attributes('height')).toBe('1em')
      expect(svg.attributes('aria-hidden')).toBe('true')
      expect(svg.attributes('role')).toBe('img')
    })

    it(`${name} renders SVG child nodes`, () => {
      const wrapper = mount(Icon)
      const svg = wrapper.find('svg')

      expect(svg.element.children.length).toBeGreaterThan(0)
    })
  }

  it('supports numeric size props', () => {
    const wrapper = mount(MilkIcon, { props: { size: 32 } })
    const svg = wrapper.find('svg')

    expect(svg.attributes('width')).toBe('32px')
    expect(svg.attributes('height')).toBe('32px')
  })

  it('supports string size props', () => {
    const wrapper = mount(MilkIcon, { props: { size: '2rem' } })
    const svg = wrapper.find('svg')

    expect(svg.attributes('width')).toBe('2rem')
    expect(svg.attributes('height')).toBe('2rem')
  })

  it('maps the color prop onto primary fills', () => {
    const wrapper = mount(MilkIcon, { props: { color: 'red' } })
    const paths = wrapper.findAll('path')

    expect(paths[0]?.attributes('fill')).toBe('red')
  })

  it('maps the secondaryColor prop onto detail fills', () => {
    const wrapper = mount(MilkIcon, {
      props: { secondaryColor: 'blue' },
    })
    const paths = wrapper.findAll('path')

    expect(paths[1]?.attributes('fill')).toBe('blue')
  })

  it('maps the secondaryColor prop onto detail strokes', () => {
    const wrapper = mount(MustardIcon, {
      props: { secondaryColor: 'blue' },
    })
    const paths = wrapper.findAll('path')

    expect(paths.some(path => path.attributes('stroke') === 'blue')).toBe(true)
  })

  it('defaults the primary color to currentColor', () => {
    const wrapper = mount(MilkIcon)
    const paths = wrapper.findAll('path')
    const svg = wrapper.find('svg')

    expect(svg.attributes('fill')).toBe('currentColor')
    expect(paths[0]?.attributes('fill')).toBe('currentColor')
  })

  it('uses icon-specific default secondary colors', () => {
    const wrapper = mount(MilkIcon)
    const paths = wrapper.findAll('path')

    expect(paths[1]?.attributes('fill')).toBe('#fefefe')
  })

  it('renders a title and removes aria-hidden when title is provided', () => {
    const wrapper = mount(MilkIcon, {
      props: { title: 'Contains milk' },
    })
    const svg = wrapper.find('svg')

    expect(svg.find('title').text()).toBe('Contains milk')
    expect(svg.attributes('aria-hidden')).toBeUndefined()
  })

  it('removes aria-hidden when aria-label is provided', () => {
    const wrapper = mount(MilkIcon, {
      attrs: { 'aria-label': 'Contains milk' },
    })

    expect(wrapper.find('svg').attributes('aria-hidden')).toBeUndefined()
  })

  it('passes classes through to the svg element', () => {
    const wrapper = mount(MilkIcon, {
      attrs: { class: 'size-5 text-red-500' },
    })
    const svg = wrapper.find('svg')

    expect(svg.classes()).toContain('size-5')
    expect(svg.classes()).toContain('text-red-500')
  })

  it('passes arbitrary data attributes through to the svg element', () => {
    const wrapper = mount(MilkIcon, {
      attrs: { 'data-testid': 'milk-icon' },
    })

    expect(wrapper.find('svg').attributes('data-testid')).toBe('milk-icon')
  })

  it('allows the role attribute to be overridden', () => {
    const wrapper = mount(MilkIcon, {
      attrs: { role: 'presentation' },
    })

    expect(wrapper.find('svg').attributes('role')).toBe('presentation')
  })
})
