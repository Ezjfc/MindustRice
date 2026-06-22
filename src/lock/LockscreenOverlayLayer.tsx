
import Gdk from "gi://Gdk?version=4.0"
import GObject from "gnim/gobject"

/**
 * Parameters of a lockscreen component.
 */
export interface Parameters {
  /**
   * gdkmonitor is the monitor to display the window.
   */
  gdkmonitor: Gdk.Monitor
}

/**
 * LockscreenLayer contains components on a lockscreen but is not wrapped in a Gnim root.
 */
export default function Lockscreen({ gdkmonitor }: Parameters) GObject.Object {
  let win: Astal.Window
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  onCleanup(() => {
    // Root components (windows) are not automatically destroyed.
    // When the monitor is disconnected from the system, this callback
    // is run from the parent <For> which allows us to destroy the window
    win.destroy()

    if (InhibitorCookie > 0) {
      app.uninhibit(InhibitorCookie)
    }
  })

  const errs = []
  const missFont = [
    "fontello",
    "Pixellari",
    // "Darktech LDR",
  ].some((family) => {
    const install = PangoCairo.font_map_get_default().get_family(family)
    return install === null
  })
  if (missFont) {
    const cmd = "nix develop -c reload-tmp-fonts"
    errs.push(["font error", cmd])
  }

  if (typeof import.meta.pkgDataDir === "undefined" || Array(
    "Mindustry",
  ).some((resource) => {
    const path = `${import.meta.pkgDataDir}/resources/${resource}`
    return !GLib.file_test(path, GLib.FileTest.EXISTS)
  })) {
    const cmd = "nix develop -c relink-resources"
    errs.push(["resources error", cmd])
  }
  const restartCmd = "mindustrice-watch"
  const copyField = (content) => (
    <box>
      <label label={`<span color="lime">${content}</span>`} useMarkup={true} />
      <button class="copyButton" onClicked={(self) => {
        self.get_clipboard().set(content)
      }} ><label label={`<span color="aqua">COPY</span>`} useMarkup={true} /></button>
    </box>
  )

  return (
    <window
      $={(self) => {
        win = self
        // Prevents stealing of window focus, works on my machine:
        timeout(100, () => self.keymode = Astal.Keymode.ON_DEMAND)
        // TODO: make optional
      }}
      visible
      namespace="MindustRice"
      name={`bar-${gdkmonitor.connector}`}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={LEFT | TOP | RIGHT}
      application={app}
      class={false ? "debugInspect" : ""} // TODO: debug mode toggle
    >
      {
        (errs.length !== 0)
          ? <centerbox class="FatalError">
              <box $type="start" orientation={Gtk.Orientation.VERTICAL}>
                <box><label label="MindustRice Status Bar cannot start:" /></box>
                {errs.map((line, index) => {
                  return (
                    <box>
                      <label label={`${index + 1}. ${line[0]}`} />
                      {line.length > 1 && <box>
                        <label label=", try  " />
                        {copyField(line[1])}
                        <label label="and restart MindustRice by  " useMarkup={true} />
                        {copyField("mindustrice-kill; mindustrice-watch")}
                      </box>}
                    </box>
                  )
                })}
                <box>
                  <label label="If you are installing MindustRice on NixOS, please use the NixOS module  " />
                  {copyField("inputs.mindustrice.nixosModules.default")}
                  <label label="instead of the package." />
                </box>
              </box>
              <menubutton $type="end">
                X
                <popover>
                  <button onClicked={() => app.quit()}>
                  {
                    "Click here to quit MindustRice\n" +
                    "REMINDER: Wayland will clear clipboard content copied from MindustRice once it quits\n" +
                    "unless you have external tools like wl-clip-persist"
                  }
                  </button>
                </popover>
              </menubutton>
            </centerbox>
          : <centerbox>
              <box $type="start" class="module">
                <AudioOutput />
                <Clock />
                <Workspaces />
              </box>
              <box $type="end" class="module">
                <Tray />
                <IdleInhibitor />
                <PowerProfile />
                <Wireless />
                <Bluetooth />
                <Processor />
                <Memory />
                <Battery />
              </box>
            </centerbox>
      }
    </window>
  )
              // <box $type="center" class="module">
              //   <Focus />
              // </box>
}
