/**
 * components are used in MindustRice widgets. They can be used in separate Gnim-based applications
 *            as well.
 *
 * This file contains helper code for other components.
 * @see ../lab
 */

import { $ } from "gnim-hooks"

/**
 * PostInitHook is a callback run AFTER the initialisation of the component alongside passing an
 *              element to for further tuning. This element is up to the component but is usually
 *              its first (outermost) element.
 *
 * This hook should be present in the parameters of most components unless it must be taken away
 * for a very strict encapsulation.
 */

/**
 * PostInitHookParameters acts as an extendable parameters set that contains only the post init
 *                        hook.
 *
 * This should be extended by the parameters of most components unless it must be taken away for a
 * very strict encapsulation.
 */
export interface PostInitHookParameters<T> {
 /**
  * $ is short for postInitHook. It is a callback run AFTER the initialisation of the component
  *  alongside passing an element to for further tuning. This element is up to the component but
  *  is *sometimes* its first (outermost) element.
  *
  * The intended initialisation of the component CANNOT be skiiped.
  */
  $?: (self: T) => void
}

/**
 * Appearence refers to an object that holds CSS appearence parameters for component.
 */
type Appearence = object

/**
 * appearenceToCss converts appearence parameters of a component to CSS variable codes alongside
 *                 prefixing them. Fields having the value `undefined` will be ignored.
 */
export function appearenceToCss(prefix: string, appearence: $<Appearence>) : $<string> {
  const convertCase = (k: string) => k.replace(/([A-Z])/g, '-$1').toLowerCase()
  const outputCss = (a: Appearence) => Object.entries(a)
    .filter(([_k, v]) => v !== undefined)
    .map(([k, v]) => `--${prefix}-${convertCase(k)}: ${v};`)
    .join(" ")
  return $(appearence).as(outputCss)
}
