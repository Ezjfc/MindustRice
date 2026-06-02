/**
 * components are used in MindustRice widgets. They can be used in separate Gnim-based applications
 *            as well.
 *
 * This module contains helper symbols for other modules in components.
 * @see ../hangar
 */

import { Accessor } from "gnim";

type Appearence = object

export function appearence_to_css(appearence?: Appearence): string
export function appearence_to_css(appearence?: Accessor<Appearence>): Accessor<string>

export function appearence_to_css(appearence?: Appearence|Accessor<Appearence>) : string|Accessor<string> {
  if (appearence instanceof Accessor) {
    return appearence.as(a => appearence_to_css(a))
  }

  const convertCase = (k: string) => k.replace(/([A-Z])/g, '-$1').toLowerCase()
  return Object.entries(appearence || {}).map(([k, v]) => `--${convertCase(k)}: ${v};`).join(" ")

}
