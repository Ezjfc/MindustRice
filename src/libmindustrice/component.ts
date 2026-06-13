/**
 * components are used in MindustRice widgets. They can be used in separate Gnim-based applications
 *            as well.
 *
 * This file contains helper symbols for other modules in components.
 * @see ../lab
 */

import { Accessor } from "gnim"

type Appearence = object

export function appearenceToCss(appearence?: Appearence): string
export function appearenceToCss(appearence?: Accessor<Appearence>): Accessor<string>

/**
 * appearenceToCss converts appearence parameters of a component to CSS variable codes.
 */
export function appearenceToCss(appearence?: Appearence|Accessor<Appearence>) : string|Accessor<string> {
  if (appearence instanceof Accessor) {
    return appearence.as(a => appearenceToCss(a))
  }

  const convertCase = (k: string) => k.replace(/([A-Z])/g, '-$1').toLowerCase()
  return Object.entries(appearence || {}).map(([k, v]) => `--${convertCase(k)}: ${v};`).join(" ")
}
