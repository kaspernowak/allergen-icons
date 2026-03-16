import type { SVGAttributes } from 'vue'

export type IconSize = number | string

export interface AllergenIconProps extends Partial<SVGAttributes> {
  size?: IconSize
  color?: string
  secondaryColor?: string
  title?: string
}
