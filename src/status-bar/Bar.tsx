/// Note: for most undocumented and incomprehensible ways of structuring GJS
/// components, they usually exist to fulfil aesthetic needs or as hacks to
/// workaround CSS difficulties. For example, those Gtk.AspectFrame.

import app from "ags/gtk4/app"
import GLib from "gi://GLib"
import Astal from "gi://Astal?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import PangoCairo from "gi://PangoCairo"
import AstalBattery from "gi://AstalBattery"
import AstalPowerProfiles from "gi://AstalPowerProfiles"
import AstalWp from "gi://AstalWp"
import AstalNetwork from "gi://AstalNetwork"
import AstalHyprland from "gi://AstalHyprland"
import AstalTray from "gi://AstalTray"
import AstalMpris from "gi://AstalMpris"
import AstalApps from "gi://AstalApps"
import {
  For,
  With,
  createBinding,
  createComputed,
  createState,
  onCleanup,
} from "ags"
import { createPoll, timeout, interval } from "ags/time"
import { execAsync } from "ags/process"
import restrictUnpack from "./assert"

const GDK_CURSOR = Gdk.Cursor.new_from_name("pointer", null)

function tooltip(...lines) {
  return (self) => self.set_tooltip_markup(`<span background="black">${lines.join("\n")}</span>`)
}

function ohno(tooltipDisplayer, image, reason) {
  const timedSwap = (callback, prev, next) => {
    if (prev === next) {
      return
    }
    callback(next)
    timeout(5000, () => callback(prev))
  }

  timedSwap((f) => image.set_from_file(f), image.file, "../../resources/Mindustry/core/assets/sprites/error.png")
  timedSwap((t) => tooltip(t)(tooltipDisplayer), tooltipDisplayer.tooltipMarkup, reason)
}

// TODO: add typehints, String | Accessible
function BlockIcon({ block, pixelSize = 24, ...unexpected }) {
  restrictUnpack(unexpected)

  const toFile = (b) => "../../resources/Mindustry/core/assets-raw/sprites/blocks/" + b + ".png"
  return (
    <image file={typeof block !== "string" ? block(toFile) : toFile(block)} pixelSize={pixelSize} />
  )
}

/// BlockOverlay returns a complex components tree alongside the block icon,
/// which serves one main purpose: all effects stay in the block icon and do
/// not affect the margin or padding area.
///
/// Example effects:
/// - The aspect frame can have a CSS `filter` property.
/// - The box can render textures and animations.
function BlockOverlay({
  block,
  frameClass = "",
  boxClass = "",
  frameCss = "",
  boxCss = "",
  pixelSize = 24,
  extraOverlays= [],
  ...unexpected
}) {
  restrictUnpack(unexpected)

  return (
    <Gtk.AspectFrame class={frameClass} css={frameCss}>
      <overlay
        $={(self) => {
          extraOverlays.forEach((overlay) => self.add_overlay(overlay))
        }}
        overflow={Gtk.Overflow.HIDDEN}
      >
        <BlockIcon block={block} pixelSize={pixelSize} />
        <box
          $type="overlay"
          heightRequest={pixelSize}
          widthRequest={pixelSize}
          class={boxClass}
          css={boxCss}
        />
      </overlay>
    </Gtk.AspectFrame>
  )
}

function Mpris() {
  const mpris = AstalMpris.get_default()
  const apps = new AstalApps.Apps()
  const players = createBinding(mpris, "players")

  return (
    <menubutton>
      <box>
        <For each={players}>
          {(player) => {
            const [app] = apps.exact_query(player.entry)
            return <image visible={!!app.iconName} iconName={app?.iconName} />
          }}
        </For>
      </box>
      <popover>
        <box spacing={4} orientation={Gtk.Orientation.VERTICAL}>
          <For each={players}>
            {(player) => (
              <box spacing={4} widthRequest={200}>
                <box overflow={Gtk.Overflow.HIDDEN} css="border-radius: 8px;">
                  <image
                    pixelSize={64}
                    file={createBinding(player, "coverArt")}
                  />
                </box>
                <box
                  valign={Gtk.Align.CENTER}
                  orientation={Gtk.Orientation.VERTICAL}
                >
                  <label xalign={0} label={createBinding(player, "title")} />
                  <label xalign={0} label={createBinding(player, "artist")} />
                </box>
                <box hexpand halign={Gtk.Align.END}>
                  <button
                    onClicked={() => player.previous()}
                    visible={createBinding(player, "canGoPrevious")}
                  >
                    <image iconName="media-seek-backward-symbolic" />
                  </button>
                  <button
                    onClicked={() => player.play_pause()}
                    visible={createBinding(player, "canControl")}
                  >
                    <box>
                      <image
                        iconName="media-playback-start-symbolic"
                        visible={createBinding(
                          player,
                          "playbackStatus",
                        )((s) => s === AstalMpris.PlaybackStatus.PLAYING)}
                      />
                      <image
                        iconName="media-playback-pause-symbolic"
                        visible={createBinding(
                          player,
                          "playbackStatus",
                        )((s) => s !== AstalMpris.PlaybackStatus.PLAYING)}
                      />
                    </box>
                  </button>
                  <button
                    onClicked={() => player.next()}
                    visible={createBinding(player, "canGoNext")}
                  >
                    <image iconName="media-seek-forward-symbolic" />
                  </button>
                </box>
              </box>
            )}
          </For>
        </box>
      </popover>
    </menubutton>
  )
}

function Workspaces() {
  const hyprland = AstalHyprland.get_default()

  const workspaces = createBinding(
    hyprland,
    "workspaces",
  )((w) => w.sort((a, b) => a.id > b.id))
  const focusChanges = createBinding(
    hyprland,
    "focused-workspace",
  )

  return (
    <box class="Workspaces">
      <For each={workspaces}>
        {(w) => (
          <button class={focusChanges((f) => f.id === w.id ? "focused" : "")}>
            <label label={String(w.id)} />
          </button>
        )}
      </For>
    </box>
  )
}

function Focus() {
  const hyprland = AstalHyprland.get_default()

  const clients = createBinding(
    hyprland,
    "clients",
  )
  const focusChanges = createBinding(
    hyprland,
    "focused-client",
  )
  const focused = createComputed(
    [clients, focusChanges],
    (c?, f?) => String(f !== null ? f.title : ""),
  )

  return (
    <box class="Focus">
      <label label={focused} />
    </box>
  )
}

function Tray() {
  const tray = AstalTray.get_default()
  const items = createBinding(tray, "items")

  const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
    btn.menuModel = item.menuModel
    btn.insert_action_group("dbusmenu", item.actionGroup)
    item.connect("notify::action-group", () => {
      btn.insert_action_group("dbusmenu", item.actionGroup)
    })
  }

  return (
    <box>
      <For each={items}>
        {(item) => (
          <menubutton $={(self) => init(self, item)}>
            <image gicon={createBinding(item, "gicon")} />
          </menubutton>
        )}
      </For>
    </box>
  )
}

function Wireless() {
  const network = AstalNetwork.get_default()
  const wifi = createBinding(network, "wifi")

  const sorted = (arr: Array<AstalNetwork.AccessPoint>) => {
    return arr.filter((ap) => !!ap.ssid).sort((a, b) => b.strength - a.strength)
  }

  async function connect(ap: AstalNetwork.AccessPoint) {
    // connecting to ap is not yet supported
    // https://github.com/Aylur/astal/pull/13
    try {
      await execAsync(`nmcli d wifi connect ${ap.bssid}`)
    } catch (error) {
      // you can implement a popup asking for password here
      console.error(error)
    }
  }

  return (
    <box visible={wifi(Boolean)} class="Wireless blockButton">
      <With value={wifi}>
        {(wifi) => {
          const enabled = createBinding(
            wifi,
            "enabled",
          )
          const internet = createBinding(
            wifi,
            "internet",
          )
          const radarClasses = createComputed(
            [wifi, internet],
            (w?, i?) => {
              if (w === false) {
                return "blockDisabled"
              }

              if (i === AstalNetwork.Internet.ASTAL_NETWORK_INTERNET_DISCONNECTED) {
                return "spin"
              }

              return ""
            },
          )

          return wifi && (
            <menubutton $={tooltip("Wireless Network")} cursor={GDK_CURSOR}>
              <overlay>
                <BlockIcon block="defense/radar-base" />
                <box
                  $type="overlay"
                  // Icon explanation:
                  // 1. transparent and still: disabled (flight mode).
                  // 2. transparent and spinning: disconnected (enabled).
                  // 3. opaque and spinning: connected.
                  class="radarTop spin"
                >
                  <BlockIcon block="defense/radar" />
                </box>
              </overlay>
              <popover>
                <box orientation={Gtk.Orientation.VERTICAL}>
                  <For each={createBinding(wifi, "accessPoints")(sorted)}>
                    {(ap: AstalNetwork.AccessPoint) => (
                      <button onClicked={() => connect(ap)}>
                        <box spacing={4}>
                          <image iconName={createBinding(ap, "iconName")} />
                          <label label={createBinding(ap, "ssid")} />
                          <image
                            iconName="object-select-symbolic"
                            visible={createBinding(
                              wifi,
                              "activeAccessPoint",
                            )((active) => active === ap)}
                          />
                        </box>
                      </button>
                    )}
                  </For>
                </box>
              </popover>
            </menubutton>
          )}
        }
      </With>
    </box>
  )
}

function AudioOutput() {
  const { defaultSpeaker: speaker } = AstalWp.get_default()!

  return (
    <menubutton>
      <image iconName={createBinding(speaker, "volumeIcon")} />
      <popover>
        <box>
          <slider
            widthRequest={260}
            onChangeValue={({ value }) => speaker.set_volume(value)}
            value={createBinding(speaker, "volume")}
          />
        </box>
      </popover>
    </menubutton>
  )
}

/// https://github.com/maxverbeek/astalconfig/blob/master/service/usage.ts
function Memory({ highUsage = 0.5 }) {
  const usage = createPoll({ msg: "", usage: NaN }, 10000, async () => {
    const err = { msg: "" }
    let details: string
    try {
      details = await execAsync(`free`)
    } catch (error) {
      console.log(error) // TODO
      return err
    }

    const lines = details.split("\n")
    if (lines.length < 2) {
      return err
    }
    const fields = lines[1].split(" ").map(parseFloat).filter((f) => !isNaN(f))
    return {
      total: fields[0],
      used: fields[1],
      free: fields[2],
    }
  })

  const giga = usage(({ used }) => {
    let giga =((used / 1000 / 1000).toFixed(1))
    if (isNaN(giga)) {
      giga = "--"
    }

    return `${giga} GB`
  })

  const safePercentage = ({ used, total }) => {
    const percentage = Math.floor(used / total * 100)
    if (isNaN(percentage)) {
      return 0
    }

    return percentage
  }
  const brightness = usage((usage) => {
    let brightness = safePercentage(usage, 0) * 0.5 + 100
    const css = `filter: brightness(${brightness}%);`
    return css
  })
  const opacity = usage((usage) => `opacity: ${safePercentage(usage)}%;`)
  const hot = usage(({ used, total }) => used / total > highUsage)

  return (
    <box $={tooltip("Memory Usage")} class="Memory">
      <With value={opacity}>
        {(opacity) => {
          return (
            <box>
              <overlay>
                <BlockOverlay
                  block="power/thorium-reactor"
                  frameCss={brightness}
                  boxClass="heat"
                  boxCss={opacity}
                />
                <box $type="overlay">
                  <HotParticles visible={hot} />
                </box>
              </overlay>
              <label label={giga} />
            </box>
          )
        }}
      </With>
    </box>
  )
}

function HotParticles({ visible, pixelSize = 24 , ...unexpected }) {
  restrictUnpack(unexpected)

  const dp = 4
  const rand = () => {
    const init = ((Math.random() - 0.5) * pixelSize)
    const final = init + (Math.random() - 0.5) * 0.3 * pixelSize
    return [init, final]
  }
  const properties = (name, x, y) => {
    return `
    --${name}X: ${x.toFixed(dp)}px;
    --${name}Y: ${y.toFixed(dp)}px;
    --${name}XOrigin: ${(pixelSize / 2 + x).toFixed(dp)}px;
    --${name}YOrigin: ${(pixelSize / 2 + y).toFixed(dp)}px;
    `
  }

  const genCss = () => {
    const [initX, finalX] = rand()
    const [initY, finalY] = rand()

    const keyframes = `
    .hotParticle {
      ${properties("init", initX, initY)}
      ${properties("final", finalX, finalY)}
    }
    `

    return keyframes
  }
  const css = createPoll("", 300, genCss)

  // Expand required for either the frame or the box:
  // The boxes are displayers of CSS rendered shapes only and have no actual
  // children.
  return (
    <With value={visible}>
      {(visible) => visible && (
        <Gtk.AspectFrame>
          <box class="hotParticle" css={css} vexpand hexpand />
        </Gtk.AspectFrame>
      )}
    </With>
  )
}

var InhibitorCookie = 0

/// IdleInhibitor is known as SleepInhibitor.
  // TODO: other inhibit flags since the current flag is largest (idle)
//// TODO: hypridle config popover support
//// TODO: change to switch block cooler?
function IdleInhibitor() {
  return (
    <box class="IdleInhibitor blockButton">
      <togglebutton
        $={tooltip("Idle/Sleep Inhibitor")}
        cursor={GDK_CURSOR}
        onToggled={(self) => {
          const willActive = self.active
          self.set_css_classes(!willActive ? ["blockDisabled"] : [""])
          if (willActive) {
            InhibitorCookie = app.inhibit(
              app.get_active_window(),
              Gtk.ApplicationInhibitFlags.IDLE,
              "activated idle inhibitor in status bar",
            )

            if (InhibitorCookie === 0) {
              self.active = false
              ohno(self, self.get_child(), "Request failed or the current platform does not support it")
            }
          } else if (InhibitorCookie > 0) {
            app.uninhibit(InhibitorCookie)
          }
        }}
        class="blockDisabled"
      >
        <BlockIcon block="power/illuminator" />
      </togglebutton>
    </box>
  )
}

function PowerProfile() { // TODO: responsive
  const battery = AstalBattery.get_default()
  const powerprofiles = AstalPowerProfiles.get_default()
  const hardcodedPerformance = "performance"
  const hardcodedPowerSaver = "power-saver"

  const active = createBinding(
    powerprofiles,
    "active-profile",
  )
  const icon = active((p) => p === hardcodedPerformance ? "defense/overdrive-dome" : "defense/overdrive-projector")

  return (
    <box class="PowerProfile blockButton" visible={createBinding(battery, "isPresent")}>
      <button
        $={tooltip("Cycle Power Profile")}
        cursor={GDK_CURSOR}
        onClicked={(self) => {
          // Animations:
          self.add_css_class("radiate")

          // Logics:
          const profiles = powerprofiles.get_profiles()
          const index = profiles.findIndex((p) => p.profile === powerprofiles.activeProfile)
          const nextProfile = (profiles[index + 1] || profiles[0]).profile
          powerprofiles.set_active_profile(nextProfile)
        }}
        class={active((p) => p === hardcodedPowerSaver ? "blockDisabled" : "radiate")}
      >
        <BlockOverlay block={icon} boxClass="radiation" />
      </button>
    </box>
  )
}

function Battery({ width = 175, ...unexpected }) {
  restrictUnpack(unexpected)

  const battery = AstalBattery.get_default()

  const percent = createBinding(
    battery,
    "percentage",
  )((p) => `Stored: ${Math.floor(p * 100)}<span foreground="#7F7F7F">%</span>`)
  const progressRatio = width / 100
  const progress = createBinding(
    battery,
    "percentage",
  )((p) => p * 100 * progressRatio)
  const charging = createBinding(
    battery,
    "state",
  )((s) => s === AstalBattery.State.CHARGING)

  return (
    <box class="Battery">
      <overlay $={tooltip("Battery")} widthRequest={width}>
        <revealer
          transitionType={Gtk.RevealerTransitionType.CROSSFADE}
          revealChild={charging}
          transitionDuration={1000}
        >
          <box class="stripes marquee" />
        </revealer>
        <box $type="overlay">
          <box class="fill" widthRequest={progress} />
        </box>
        <label $type="overlay" label={percent} useMarkup={true} />
      </overlay>
    </box>
  )
}

function Clock({ format = "%H\n%M", ...unexpected }) {
  restrictUnpack(unexpected)

  const time = createPoll("", 1000, () => {
    return GLib.DateTime.new_now_local().format(format)!
  })

  return (
    <menubutton class="Clock" overflow={Gtk.Overflow.HIDDEN}>
      <label label={time} />
      <popover>
        <Gtk.Calendar />
      </popover>
    </menubutton>
  )
}

export default function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
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

  let hasFonts = true
  Array(
    "fontello",
    "Pixellari",
    "Darktech LDR",
  ).forEach((family) => {
    let install = PangoCairo.font_map_get_default().get_family(family)
    if (install === null) {
      hasFonts = false
    }
  })

  return (
    <window
      $={(self) => (win = self)}
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
        !hasFonts
          ? <centerbox class="FatalError">
              <label $type="start" label="MindustRice Status Bar cannot start: font error." />
              <menubutton $type="end">
                X
                <popover>
                  <button onClicked={
                    () => app.quit()
                  }>Quit MindustRice</button>
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
                <Memory />
                <Wireless />
                <IdleInhibitor />
                <PowerProfile />
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
