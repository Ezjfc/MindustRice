/**
 * app initialises the MindustRice Lock.
 */

import { createBinding, For, This } from "ags"
import app from "ags/gtk4/app"
import style from "./style.scss"
import GObject, { register } from "gnim/gobject"
import GnimApp, { Abstractions } from "../libmindustrice/GnimApp"
import { LockscreenPreviewWindow } from "./Lockscreen"

@register()
class LockscreenPreview extends GnimApp implements Abstractions {
  style(): string {
    return style
  }

  buildUI(passthrus: object): GObject.Object {
    return (
      <LockscreenPreviewWindow app={this} {...passthrus} />
    )
  }
}

if (import.meta.lock.previewMode) {
  const app = new LockscreenPreview()
  app.start()
} else {
}

//
// app.start({
//   instanceName: "MindustRice",
//   css: style,
//   // It's usually best to go with the default Adwaita theme
//   // and built off of it, instead of allowing the system theme
//   // to potentially mess something up when it is changed.
//   // Note: `* { all:unset }` in css is not recommended.
//   gtkTheme: "Adwaita",
//   main() {
//     const monitors = createBinding(app, "monitors")
//
//     return (
//       <For each={monitors}>
//         {(monitor) => (
//           <This this={app}>
//             <Bar gdkmonitor={monitor} />
//           </This>
//         )}
//       </For>
//     )
//   },
// })
