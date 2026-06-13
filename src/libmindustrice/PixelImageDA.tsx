/**
 * PixelImageDA prototypes {@link PixelImage} with GTK Drawing Area.
 *
 * This file is retained for easiesr testing and traceability. The implementation follows
 * - https://www.reddit.com/r/GTK/comments/i3eupl/help_with_rendering_pixel_buffer_data/
 * - https://stackoverflow.com/questions/36439504/cairo-image-blurred-when-scaled/36463685#36463685
 */

import giCairo from "cairo";
import Gdk from "gi://Gdk?version=4.0";
import Gtk from "gi://Gtk?version=4.0";
import { Accessor, With } from "gnim";
import GObject from "gnim/gobject";


/**
 * Parameters holds parameters for a pixel image (drawing area) component.
 */
interface Parameters {
  /**
   * file is the file path to the PNG pixel image to render.
   */
  file: string|Accessor<string>
  /**
   * scale controls the rendering size of the pixel image.
   * @default 1.0
   */
  scale?: number|Accessor<number>
}

/**
 * PixelImageDA initialises the component.
 *
 * @deprecated Please use {@link PixelImage}, which is based on GTK Snapshot instead of Drawing
 *             Area.
 */
export default function PixelImageDA({ file, scale }: Parameters) : GObject.Object {
  if (file instanceof Accessor) {
    return <With value={file}>{f => PixelImageDA({ file: f, scale })}</With>
  }

  scale = scale || 1.0
  const texture = Gdk.Texture.new_from_filename(file)
  const [width, height] = scaleDA(texture, scale)

  return <Gtk.DrawingArea
    widthRequest={width}
    heightRequest={height}
    $={(self) => self.set_draw_func((area, cr, w, h) => {
      const surface = giCairo.ImageSurface.createFromPNG(file)
      const imageWidth = surface.getWidth()
      const imageHeight = surface.getHeight()
      const pattern = new giCairo.SurfacePattern(surface)
      pattern.setFilter(giCairo.Filter.NEAREST)

      cr.scale(w / imageWidth, h / imageHeight)
      cr.setSource(pattern)
      cr.paint()
    })}
  />
}

/**
 * scaleDA returns the dimension or accessors of dimension for the drawing area.
 */
function scaleDA(
  texture: Gdk.Texture,
  scale: number|Accessor<number>,
) : number[]|Accessor<number>[] {
  const width = texture.get_width()
  const height = texture.get_height()

  if (scale instanceof Accessor) {
    return [
      scale.as(s => s * width),
      scale.as(s => s * height),
    ]
  }

  return [width * scale, height * scale]
}
