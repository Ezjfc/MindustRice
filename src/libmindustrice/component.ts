/**
 * components are used in MindustRice widgets. They can be used in separate Gnim-based applications
 *            as well.
 *
 * This file contains helper code for other modules in components.
 * @see ../lab
 */

import { Accessor, createEffect } from "gnim"

/**
 * Appearence refers to an object that holds CSS appearence parameters for component.
 */
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

/**
 * trackOrCallOnce checks if the given object to handle is an accessor. For an accessor, it returns
 *                 another callback an effect that tracks value updates and pass it to the given
 *                 callback. Otherwise, it will curry the given callback.
 */
export function trackOrCallOnce<T>(toHandle: Accessor<T>|T, callback: (handled: T) => void) {
  if (toHandle instanceof Accessor) {
    return () => {
      createEffect(() => {
        callback(toHandle())
      })
    }
  }

  () => callback(toHandle)
}
