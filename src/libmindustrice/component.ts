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
 * condAccessorAs checks if the given value is an accessor. For an accessor, it will pass the given
 *                callback to `.as()` and return the transformed accessor. Otherwise, it will
 *                simply run the callback and return the transformed value.
 */
export function condAccessorAs<T, U>(
  toHandle: T|Accessor<T>,
  callback: (handled: T) => U,
) : U|Accessor<U> {
  if (toHandle instanceof Accessor) {
    return toHandle.as(callback)
  } else {
    return callback(toHandle)
  }
}

/**
 * condAccessorAs checks if the given value is an accessor. For an accessor, it will call `.peek()`
 *                and return the result. Otherwise, it will simply return the given value.
 */
export function condAccessorPeek<T>(toHandle: T|Accessor<T>) : T {
  if (toHandle instanceof Accessor) {
    return toHandle.peek()
  } else {
    return toHandle
  }
}
