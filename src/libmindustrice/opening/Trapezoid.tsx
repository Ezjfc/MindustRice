/**
 * @see Trapezoid
 */

import Gtk from "gi://Gtk?version=4.0"
import GObject, { register } from "gnim/gobject"
import Gsk from "gi://Gsk?version=4.0"
import { $ } from "gnim-hooks"
import { PostInitHookParameters } from "../component"
import { createEffect } from "gnim"
import Graphene from "gi://Graphene?version=1.0"

/**
 * Parameters of a opening (start screen) trapezoid component.
 */
export interface Parameters extends PostInitHookParameters<Trapezoid> {
  /**
   * children is the tree of elements clipped to the trapezoid.
   *
   * NOTE: the value of this field is completely ignored. This field exists just for explictness.
   *
   * To add children, use the component with Gnim `<Trapezoid>{children}</Trapezoid>` or call its
   * relevant methods inherited from Gtk.Box.
   */
  children?: GObject.Object

  /**
   * hmirror controls whether or not the path will be shape will be mirror horizontally.
   * @default false
   */
  hmirror?: $<boolean>
  /**
   * vmirror controls whether or not the path will be shape will be mirror virtically.
   * @default false
   */
  vmirror?: $<boolean>
  /**
   * tangent is the ratio of height to bases difference (longer base - shorter base).
   * @default 1.0
   */
  tangent?: $<number>
}

/**
 * Trapezoid mimics a (right-angle) trapezoid in the opening (start screen) of the original game.
 *
 * This component is implemented as a class. However, it can still be used with Gnim in the form of
 * `<Trapezoid />`. Please refer to {@link Parameters} to see what are required for the
 * initialisation.
 *
 * This component extends the box element with a width as wide as the longer base of the
 * right-angle trapezoidal shape. Everything it contains will clip to the shape and any overflowing
 * content would not be visible.
 */
@register({ GTypeName: "$Trapezoid" })
export default class Trapezoid extends Gtk.Box {
  /**
   * hmirror controls whether or not the path will be shape will be mirror horizontally.
   */
  private hmirror: boolean = false
  /**
   * vmirror controls whether or not the path will be shape will be mirror virtically.
   */
  private vmirror: boolean = false

  /**
   * tangent is the ratio of height to bases difference (longer base - shorter base).
   */
  private tangent: number = 1.0

  constructor(params: Parameters) {
    super()
    this.set_vexpand(true)
    this.set_hexpand(true)

    const { hmirror, vmirror, tangent, $: postInitHook } = params
    const getHMirror = $(hmirror)
    const getVMirror = $(vmirror)
    const getTangent = $(tangent)

    createEffect(() => {
      this.hmirror = getHMirror() ?? this.hmirror
      this.vmirror = getVMirror() ?? this.vmirror
      this.tangent = getTangent() ?? this.tangent

      this.queue_resize()
    })

    if (postInitHook) postInitHook(this)
  }

  /**
   * vfunc_snapshot renders a snapshot of the component.
   */
  vfunc_snapshot(snapshot: Gtk.Snapshot): void {
    const w = this.get_width()
    const h = this.get_height()
    const slant = h * this.tangent

    const b = new Gsk.PathBuilder()
    // Steps of drawing:
    // 1. top-left
    // 2. top-right
    // 3. bottom-right
    // 4. bottom-left
    b.move_to(0, 0)
    b.line_to(w, 0)
    b.line_to(w - slant, h)
    b.line_to(0, h)
    b.close()
    const path = b.to_path()

    if (this.hmirror) {
      snapshot.translate(new Graphene.Point().init(w, 0))
      snapshot.scale(-1, 1)
    }
    if (this.vmirror) {
      snapshot.translate(new Graphene.Point().init(0, h))
      snapshot.scale(1, -1)
    }

    // Clip children elements to the shaped path:
    snapshot.push_fill(path, Gsk.FillRule.WINDING)

    // Draw children elements:
    super.vfunc_snapshot(snapshot)

    snapshot.pop()
  }
}
