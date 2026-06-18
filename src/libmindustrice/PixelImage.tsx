/**
 * @see PixelImage
 */

import Gdk from "gi://Gdk?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import { createEffect, createMemo } from "gnim"
import { register } from "gnim/gobject"
import Graphene from "gi://Graphene?version=1.0"
import Gsk from "gi://Gsk?version=4.0"
import { $ } from "gnim-hooks"

/**
 * Parameters of a pixel image (drawing area) component, which includes a set of mutually exlusive
 * options representing the data to render.
 */
export type Parameters = ParametersOfFile|ParametersOfTexture

/**
 * BaseParameters of a pixel image component.
 */
export interface BaseParameters {
  /**
   * scale controls the rendering size of the pixel image.
   * @default 1.0
   */
  scale?: $<number>
}

/**
 * ParametersOfFile holds parameters for a pixel image component that renders from
 * a file.
 */
export interface ParametersOfFile extends BaseParameters {
  /**
   * file is the file path to the PNG pixel image to render.
   *
   * Texture is cached upon loading. Changing scale will use the cached texture.
   */
  file: $<string>
}

/**
 * ParametersOfFile holds parameters for a pixel image component that renders from
 *                  a {@link Gdk.Texture}.
 */
export interface ParametersOfTexture extends BaseParameters {
  /**
   * texture contains the data of the pixel image to render.
   */
  texture: $<Gdk.Texture>
}

/**
 * PixelImage is the class of the component. This class can be used with Gnim in the form of
 *            `<PixelImage />`. Please refer to {@link Parameters} to see what are required for the
 *            initialisation.
 *
 * Unlike {@link PixelImageDA}, PixelImage uses GTK Snapshot, which supports hardware acceleration,
 * instead of Drawing Area. PixelImage also accepts a {@link Gdk.Texture} rather than its its file
 * path to load from.
 */
@register({ GTypeName: "PixelImage" })
export default class PixelImage extends Gtk.Widget {
  /**
   * scale controls the rendering size of the pixel image.
   */
  private scale: number = 1.0
  /**
   * texture contains the data of the pixel image to render.
   */
  private texture: Gdk.Texture

  constructor(params: Parameters) {
    super()
    const file = (params as ParametersOfFile).file
    const texture = (params as ParametersOfTexture).texture
    const { scale } = params

    const getFile = $(file)
    const fileToTexture = () => Gdk.Texture.new_from_filename(getFile())
    const getTexture = file ? createMemo(fileToTexture) : $(texture)
    const getScale = $(scale)

    this.texture = getTexture.peek()
    this.scale = getScale.peek() || this.scale

    createEffect(() => {
      this.texture = getTexture()
      this.scale = getScale() || this.scale

      this.queue_resize()
    })
  }

  /**
   * vfunc_measure reports the instrinsic size for the widget.
   *
   * @returns [number, number, number, number] [minimum, natural, minimum_baseline, natural_baseline]
   */
  vfunc_measure(
    orientation: Gtk.Orientation,
    _for_size: number,
  ): [number, number, number, number] {
    let side
    if (orientation === Gtk.Orientation.HORIZONTAL) {
      side = this.texture.get_width()
    } else {
      side = this.texture.get_height()
    }

    const size = side * this.scale
    const px = Math.round(size)

    return [px, px, -1, -1]
  }

  /**
   * vfunc_snapshot renders a snapshot of the component.
   */
  vfunc_snapshot(snapshot: Gtk.Snapshot): void {
    const rect = new Graphene.Rect
    rect.init(0, 0, this.get_width(), this.get_height())
    snapshot.append_scaled_texture(this.texture, Gsk.ScalingFilter.NEAREST, rect)
  }
}
