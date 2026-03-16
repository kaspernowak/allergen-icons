import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import { allergenIcons } from '../../allergen-icons/src/manifest'
import * as vueIcons from '../src'

describe('allergen-icons-vue', () => {
  it('exports one Vue component per core manifest entry', () => {
    const exportedComponentNames = Object.keys(vueIcons).filter(
      key => key.endsWith('Icon') && key !== 'createAllergenIcon',
    )

    expect(exportedComponentNames.sort()).toEqual(
      allergenIcons.map(icon => icon.componentName).sort(),
    )
  })

  it('renders accessible SVG markup', async () => {
    const app = createSSRApp({
      render() {
        return h(vueIcons.FishIcon, {
          title: 'Contains fish',
          class: 'size-5',
          color: 'currentColor',
        })
      },
    })

    const html = await renderToString(app)

    expect(html).toContain('<svg')
    expect(html).toContain('<title>Contains fish</title>')
    expect(html).toContain('class="size-5"')
    expect(html).not.toContain('aria-hidden="true"')
  })
})
