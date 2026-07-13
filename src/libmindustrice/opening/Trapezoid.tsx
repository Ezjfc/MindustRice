/**
 * @see Trapezoid
 */

import Gtk from "gi://Gtk?version=4.0"
import GObject, { register } from "gnim/gobject"
import Gsk from "gi://Gsk?version=4.0"
import { $ } from "gnim-hooks"
import { PostInitHookParameters } from "../component"

/**
 * Parameters of a opening (start screen) trapezoid component.
 */
export interface Parameters extends PostInitHookParameters<Trapezoid> {
  /**
   * children is the tree of elements clipped to the trapezoid.
   */
  children?: GObject.Object
  side?: number
  tangent?: number
}

export default function Trapezoid({ children, $: postInitHook } = params) {
  return (
    <$Trapezoid>
      <Gtk.Box class="trapezoid-1" >
      {children}
      </Gtk.Box>
    </$Trapezoid>
  )
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
class $Trapezoid extends Gtk.Box {
  /**
   * TODO
   */
  private side: number = 1.0

  /**
   * tangent is the ratio.
   */
  private tangent: number = 0.25

  constructor() {
    super()

    // const { children, $: postInitHook } = params

    this.set_vexpand(true)
    this.set_hexpand(true)
    // const file = (params as ParametersOfFile).file
    // const texture = (params as ParametersOfTexture).texture
    // const { scale, $: postInitHook } = params
    //
    // const getFile = $(file)
    // const fileToTexture = () => Gdk.Texture.new_from_filename(getFile())
    // const getTexture = file ? createMemo(fileToTexture) : $(texture)
    // const getScale = $(scale)
    //
    // this.texture = getTexture.peek()
    // this.scale = getScale.peek() ?? this.scale
    //
    // createEffect(() => {
    //   this.texture = getTexture()
    //   this.scale = getScale() ?? this.scale
    //
    //   this.queue_resize()
    // })
    //
    // if (postInitHook) postInitHook(this)
  }

  /**
   * vfunc_snapshot renders a snapshot of the component.
   */
  vfunc_snapshot(snapshot: Gtk.Snapshot): void {
    const w = this.get_width()
    const h = this.get_height()
    const slant = Math.min(w * this.tangent, h)

    const b = new Gsk.PathBuilder()
    // TODO: currently not a right-angle trapezoid but at least it renders

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

    // Clip children elements to the shaped path:
    snapshot.push_fill(path, Gsk.FillRule.WINDING)

    // Draw children elements:
    super.vfunc_snapshot(snapshot)

    snapshot.pop()
  }
}
