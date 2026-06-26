/**
 * @see Lockscreen
 */

import Astal from "gi://Astal?version=4.0";
import Gdk from "gi://Gdk?version=4.0";
import { onCleanup } from "gnim";
import Decoration from "./Decoration";
import { PostInitHookParameters } from "../libmindustrice/component";
import GObject from "gnim/gobject";
import Gtk from "gi://Gtk?version=4.0";
import OPBackground from "../libmindustrice/opening/OPBackground";

/**
 * Parameters of a lockscreen component.
 */
export interface Parameters extends PostInitHookParameters<Astal.Window> {
  /**
   * gdkmonitor is the monitor to display the window.
   */
  monitor: Gdk.Monitor
}

/**
 * Lockscreen is a window to display on each monitor when the session is locked.
 *
 * NOTE: the window will be shown directly once intialised, the session will then be locked, and
 *       void will be returned.
 */
export default function Lockscreen({ monitor: gdkmonitor, $: postInitHook }: Parameters) : void {
  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

  let win: Astal.Window
  onCleanup(() => win.destroy())

  void (
    <Astal.Window
      $={(self) => {
        win = self
        if (postInitHook) postInitHook(self)
      }}
      visible
      namespace={"MidustRice"}
      name={`MindustRice_Lockscreen-${gdkmonitor.connector}`}
      gdkmonitor={gdkmonitor}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.EXCLUSIVE}
      application={app}
    >
      <Decoration />
    </Astal.Window>
  )
    // <Gtk.Overlay hexpand vexpand>
    // </Gtk.Overlay>
}

/**
 * LockscreenPreview is a window to display to preview the lockscreen.
 *
 * NOTE: this will not lock the session.
 */
export function LockscreenPreviewWindow({ app, ...passthrus }: ({
  app: Gtk.Application,
} & object)) : GObject.Object {
  return (
    <Gtk.ApplicationWindow
      application={app}
      title="MindustRice Lockscreen [PREVIEW]"
      fullscreened={true}
      defaultWidth={300}
      defaultHeight={150}
      opacity={50}
      {...passthrus}
    >
      <Decoration />
    </Gtk.ApplicationWindow>
  )
}
