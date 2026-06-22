/**
 * Welcome to Alpha's lab of MindustRice components. This is a Gnim application to facilitate easy
 * customisation and preview for widget components located in {@link ../libmindustrice}.
 **/

import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import { register } from "gnim/gobject"
import { createRoot } from "gnim"
import { programInvocationName, programArgs } from "system"

import style from "style.scss"
import ProgressBarPreview from "./ProgresBarPreview"
import Ribbon from "./Ribbon"
import Preview from "./Preview"
import OPBackground from "../libmindustrice/opening/OPBackground"

export const BUTTON_PIXEL_SCALE = 2.0

function loadCss(css: string) {
  const provider = new Gtk.CssProvider()
  provider.load_from_string(css)
  Gtk.StyleContext.add_provider_for_display(
    Gdk.Display.get_default()!,
    provider,
    Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
  )
}

@register()
class MyApp extends Gtk.Application {
  declare window?: Gtk.Window

  vfunc_activate(): void {
    if (this.window) {
      return this.window.present()
    }

    loadCss(style)

    createRoot((unload) => {
      this.connect("shutdown", unload)

      return (
        <Gtk.ApplicationWindow
          application={this}
          title="Alpha's Components Lab"
          defaultWidth={300}
          defaultHeight={150}
          $={(self) => (this.window = self).present()}
          opacity={50}
        >
          <Gtk.Box orientation={Gtk.Orientation.VERTICAL}>
            <Ribbon />
            <ProgressBarPreview />
            <Preview
              component={<OPBackground />}
              defaultName="Opening Background"
              defaultHeight={281.25} // 16:9
            />
          </Gtk.Box>
        </Gtk.ApplicationWindow>
      )
            // <ProgressBarPreview defaultAppearence={{
            //   fill: "#FF341C",
            //   fillShade: "#C12817",
            // }} />
            // <ProgressBarPreview />
            // <ProgressBarPreview defaultAppearence={{
            //   fill: "#596AB8",
            //   fillShade: "#435195",
            // }} />
    })
  }
}

export const app = new MyApp()
app.runAsync([programInvocationName, ...programArgs])

