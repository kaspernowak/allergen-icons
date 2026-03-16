import { computed, defineComponent, h } from 'vue'
import type { PropType, SetupContext, VNode } from 'vue'
import type { AllergenIconData, AllergenIconNode } from '@kaspernowak/allergen-icons'
import type { AllergenIconProps, IconSize } from './types'

type ResolvedAllergenIconProps = Required<
  Pick<AllergenIconProps, 'size' | 'color' | 'secondaryColor'>
> &
  Pick<AllergenIconProps, 'title'>

function normalizeSize(size: IconSize | undefined) {
  if (size == null) {
    return '1em'
  }

  return typeof size === 'number' ? `${size}px` : size
}

function resolvePaintToken(value: string, color: string, secondaryColor: string) {
  if (value === '__ALLERGEN_ICONS_PRIMARY__') {
    return color
  }

  if (value === '__ALLERGEN_ICONS_SECONDARY__') {
    return secondaryColor
  }

  return value
}

function renderNode(
  node: AllergenIconNode,
  color: string,
  secondaryColor: string,
  key: string,
): VNode {
  const attrEntries = Object.entries(node.attrs ?? {}) as Array<[string, string]>
  const attrs = Object.fromEntries(
    attrEntries.map(([attrName, attrValue]) => [
      attrName,
      resolvePaintToken(attrValue, color, secondaryColor),
    ]),
  )
  const children = (node.children ?? []).map((child: AllergenIconNode, index: number) =>
    renderNode(child, color, secondaryColor, `${key}-${index}`),
  )

  return h(
    node.tag,
    {
      key,
      ...attrs,
    },
    children,
  )
}

export function createAllergenIcon(iconData: AllergenIconData) {
  return defineComponent({
    name: iconData.componentName,
    inheritAttrs: false,
    props: {
      size: {
        type: [Number, String] as PropType<IconSize>,
        default: '1em',
      },
      color: {
        type: String,
        default: 'currentColor',
      },
      secondaryColor: {
        type: String,
        default: iconData.defaultSecondaryColor,
      },
      title: {
        type: String,
        default: undefined,
      },
    },
    setup(props: Readonly<ResolvedAllergenIconProps>, { attrs }: SetupContext) {
      const resolvedSize = computed(() => normalizeSize(props.size))
      const computedAriaHidden = computed(() => {
        const explicitAriaHidden = attrs['aria-hidden']

        if (explicitAriaHidden != null) {
          return String(explicitAriaHidden)
        }

        return props.title || attrs['aria-label'] != null ? undefined : 'true'
      })
      const computedRole = computed(() =>
        typeof attrs.role === 'string' ? attrs.role : 'img',
      )

      return () =>
        h(
          'svg',
          {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: iconData.viewBox,
            width: resolvedSize.value,
            height: resolvedSize.value,
            fill: props.color,
            role: computedRole.value,
            'aria-hidden': computedAriaHidden.value,
            ...attrs,
          },
          [
            props.title ? h('title', props.title) : null,
            ...iconData.nodes.map((node: AllergenIconNode, index: number) =>
              renderNode(node, props.color, props.secondaryColor, `${iconData.componentName}-${index}`),
            ),
          ],
        )
    },
  })
}
