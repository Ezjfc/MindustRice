/**
 * @see Lockscreen
 */

import app from "ags/gtk4/app";
import Astal from "gi://Astal?version=4.0";
import Gdk from "gi://Gdk?version=4.0";
import { onCleanup } from "gnim";
import Decoration from "./Decoration";
import { PostInitHookParameters } from "../libmindustrice/component";

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
 * NOTE: the window will be shown directly once intialised and void will be returned.
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
