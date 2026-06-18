/**
 * @see PixelImageDA
 */

import giCairo from "cairo";
import Gdk from "gi://Gdk?version=4.0";
import Gtk from "gi://Gtk?version=4.0";
import { Accessor, With } from "gnim";
import { $ } from "gnim-hooks";
import GObject from "gnim/gobject";
import { PostInitHookParameters } from "./component";


/**
 * Parameters of a pixel image (drawing area) component.
 */
interface Parameters extends PostInitHookParameters<Gtk.DrawingArea> {
  /**
   * file is the file path to the PNG pixel image to render.
   *
   * Texture is NOT cached upon loading. Changing scale will cause the file to be read again.
   * Please ensure the file always exists.
   */
  file: $<string>
  /**
   * scale controls the rendering size of the pixel image.
   * @default 1.0
   */
  scale?: $<number>
}

/**
 * PixelImageDA prototypes {@link PixelImage} with GTK Drawing Area.
 *
 * This component is retained for easiesr testing and traceability. The implementation follows
 * - https://www.reddit.com/r/GTK/comments/i3eupl/help_with_rendering_pixel_buffer_data/
 * - https://stackoverflow.com/questions/36439504/cairo-image-blurred-when-scaled/36463685#36463685
 *
 * @deprecated Please use {@link PixelImage}, which is based on GTK Snapshot instead of Drawing
 */
export default function PixelImageDA(params: Parameters) : GObject.Object {
  const { file, scale, $: postInitHook } = params

  if (file instanceof Accessor) {
    return (
      <With value={file}>
      {f => {
        params.file = f
        return <PixelImageDA {...params} />
      }}
      </With>
    )
  }

  const texture = Gdk.Texture.new_from_filename(file)
  const [width, height] = scaleDA(texture, scale ?? 1.0)
  const onDraw: Gtk.DrawingAreaDrawFunc = (_area, cr, w, h) => {
    const surface = giCairo.ImageSurface.createFromPNG(file)
    const imageWidth = surface.getWidth()
    const imageHeight = surface.getHeight()
    const pattern = new giCairo.SurfacePattern(surface)
    pattern.setFilter(giCairo.Filter.NEAREST)

    cr.scale(w / imageWidth, h / imageHeight)
    cr.setSource(pattern)
    cr.paint()
  }

  return (
    <Gtk.DrawingArea
      $={(self) => {
        self.set_draw_func(onDraw)
        if (postInitHook) postInitHook(self)
      }}
      widthRequest={width}
      heightRequest={height}
    />
  )

}

/**
 * scaleDA returns the dimension for the drawing area.
 */
function scaleDA(texture: Gdk.Texture, scale: $<number>) : $<number>[] {
  const width = texture.get_width()
  const height = texture.get_height()

  return [
    $(scale).as(s => s * width),
    $(scale).as(s => s * height),
  ]
}
