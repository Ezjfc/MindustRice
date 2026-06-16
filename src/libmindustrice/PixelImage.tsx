/**
 * @see PixelImage
 */

import Gdk from "gi://Gdk?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import { Accessor } from "gnim"
import { trackOrCallOnce } from "./component"

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
  scale?: number|Accessor<number>
}

/**
 * ParametersOfFile holds parameters for a pixel image (drawing area) component that renders from
 * a file.
 */
export interface ParametersOfFile extends BaseParameters {
  /**
   * file is the file path to the PNG pixel image to render.
   */
  file: string|Accessor<string>
}

/**
 * ParametersOfFile holds parameters for a pixel image (drawing area) component that renders from
 * a {@link Gdk.Texture}.
 */
export interface ParametersOfTexture extends BaseParameters {
  /**
   * texture contains the data of the pixel image to render.
   */
  texture: Gdk.Texture|Accessor<Gdk.Texture>
}

/**
 * PixelImage is the class of the component. This class can be used with Gnim in the form of
 *            `<PixelImage />`. Please refer to {@link Parameters} to see what are required for the
 *            initialisation.
 */
@register({ GTypeName: "PixelImage" })
class PixelImage extends Gtk.Widget {
  private declare texture: Gdk.Texture
  private scale: number = 1.0

  constructor(params: Parameters) {
    super()
    const file = (params as ParametersOfFile).file
    const texture = (params as ParametersOfTexture).texture
    const { scale } = params

    if (texture) {
      trackOrCallOnce(texture, (t) => this.texture = t)
    }
    if (file) {
      trackOrCallOnce(file, (f) => this.texture = Gdk.Texture.new_from_filename(f))
    }
    if (scale) {
      trackOrCallOnce(scale, (s) => this.scale = s)
    }
  }
}
