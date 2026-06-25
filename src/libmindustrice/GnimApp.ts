/**
 * @see GnimApp
 **/

import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import { createRoot } from "gnim"
import { programInvocationName, programArgs } from "system"
import GObject, { register } from "gnim/gobject"

/**
 * Abstractions of GnimApp.
 *
 * This exists because it seems that Gnim does not support registering abstract classes, nor
 * extending classes that are not registered.
 */
export interface Abstractions {
  /**
   * style returns the SCSS content to be loaded.
   */
  style() : string
  /**
   * buildUI builds the application window.
   */
  buildUI(passthrus: object) : GObject.Object
}

// NOTE: maybe I can remove the export on GnimApp and make my own register() for extra safety.

/**
 * GnimApp is a template class for Gnim applications.
 *
 * Use {@link register} on the child class.
 */
@register()
export default class GnimApp extends Gtk.Application {
  declare window?: Gtk.Window

  /**
   * start runs the Gnim application.
   */
  start() : void {
    this.runAsync([programInvocationName, ...programArgs])
  }

  /**
   * style returns the SCSS content to be loaded.
   * @see Abstractions
   */
  style() : string {
    throw new Error("child class shall implement Abstractions")
  }

  /**
   * style returns the SCSS content to be loaded.
   * @see Abstractions
   */
  buildUI(passthrus: object) : GObject.Object {
    throw new Error("child class shall implement Abstractions")
  }

  /**
   * vfunc_activate manages the Gnim root scope.
   */
  vfunc_activate() : void {
    loadStyle(this.style())

    createRoot((unload) => {
      this.connect("shutdown", unload)

      this.buildUI({ $: (self: Gtk.ApplicationWindow) => {
        this.window = self
        self.present()
      }})
      return this.window
    })
  }
}

/**
 * loadStyle loads the given SCSS content to the Gnim runtime.
 */
function loadStyle(css: string) {
  const provider = new Gtk.CssProvider()
  provider.load_from_string(css)
  Gtk.StyleContext.add_provider_for_display(
    Gdk.Display.get_default()!,
    provider,
    Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
  )
}

