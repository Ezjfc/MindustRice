/**
 * components are used in MindustRice widgets. They can be used in separate Gnim-based applications
 *            as well.
 *
 * This file contains helper code for other components.
 * @see ../lab
 */

import { $ } from "gnim-hooks"

/**
 * Appearence refers to an object that holds CSS appearence parameters for component.
 */
type Appearence = object

/**
 * appearenceToCss converts appearence parameters of a component to CSS variable codes alongside
 *                 prefixing them.
 */
export function appearenceToCss(prefix: string, appearence: $<Appearence>) : $<string> {
  const convertCase = (k: string) => k.replace(/([A-Z])/g, '-$1').toLowerCase()
  const outputCss = (a: Appearence) => Object.entries(a) .map(([k, v]) => `--${prefix}-${convertCase(k)}: ${v};`)
    .join(" ")
  return $(appearence).as(outputCss)
}
