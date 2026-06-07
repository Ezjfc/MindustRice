/**
 * Welcome to Alpha's hangar in MindustRice. This is a Gnim application to facilitate easy
 * customisation and preview for widget components.
 **/

import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import { register } from "gnim/gobject"
import { createRoot } from "gnim"
import { programInvocationName, programArgs } from "system"

import style from "style.scss"
import { ProgressBarPreview } from "./progress_bar"

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
          title="Alpha's Hangar"
          defaultWidth={300}
          defaultHeight={150}
          $={(self) => (this.window = self).present()}
        >
        <box orientation={Gtk.Orientation.VERTICAL}>
          <ProgressBarPreview a/>
          <ProgressBarPreview a={false}/>
        </box>
        </Gtk.ApplicationWindow>
      )
    })
  }
}

export const app = new MyApp()
app.runAsync([programInvocationName, ...programArgs])

