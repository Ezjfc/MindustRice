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
import { createPoll, timeout } from "ags/time"
import { execAsync } from "ags/process"
import restrictUnpack from "./assert"

const RESOURCES_PATH = `${import.meta.pkgDataDir}/resources`;
const UNIT_GRAY = "foreground=\"#7F7F7F\""
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

  timedSwap((f) => image.set_from_file(f), image.file, `${RESOURCES_PATH}/Mindustry/core/assets/sprites/error.png`)
  timedSwap((t) => tooltip(t)(tooltipDisplayer), tooltipDisplayer.tooltipMarkup, reason)
}

// TODO: add typehints, String | Accessible
function BlockIcon({ block, pixelSize = 24, ...unexpected }) {
  restrictUnpack(unexpected)

  const toFile = (b) => `${RESOURCES_PATH}/Mindustry/core/assets-raw/sprites/blocks/${b}.png`
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
                <BlockIcon block="drills/water-extractor" />
                <box
                  $type="overlay"
                  // Icon explanation:
                  // 1. transparent and still: disabled (flight mode).
                  // 2. transparent and spinning: disconnected (enabled).
                  // 3. opaque and spinning: connected.
                  class="rotator spin"
                >
                  <BlockIcon block="drills/water-extractor-rotator" />
                </box>
                <box $type="overlay">
                  <BlockIcon block="drills/water-extractor-top" />
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

function Processor({ pollInterval = 10000, highUsage = 0.5 }) {
  return (
    <box $={tooltip("Processor Usage")} class="Processor">
      <overlay>
        <BlockOverlay
          block="production/vent-condenser-bottom"
          frameCss=""
          boxClass=""
          boxCss=""
        />
        <box $type="overlay">
          <BlockIcon block="production/vent-condenser-rotator" />
        </box>
        <box $type="overlay">
          <BlockIcon block="production/vent-condenser" />
        </box>
      </overlay>
      <label label={"-- %"} />
    </box>
  )
}

function Memory({ pollInterval = 10000, highUsage = 0.5 }) {
  const usage = createPoll({ err: "not ready" }, pollInterval, async () => {
    let details: string
    try {
      details = await execAsync(`free`)
    } catch (error) {
      console.error(error)
      return { err: error }
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
      <label label={giga} useMarkup={true} />
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
  let radarTop = Gtk.Box

  return (
    <box class="IdleInhibitor blockButton">
      <togglebutton
        $={tooltip("Idle/Sleep Inhibitor")}
        cursor={GDK_CURSOR}
        onToggled={(self) => {
          const willActive = self.active
          self.set_css_classes(willActive ? [] : ["blockDisabled"])
          radarTop.set_css_classes(willActive ? ["radarTop", "spin"] : ["radarTop"])

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
        <overlay>
          <BlockIcon block="defense/radar-base" />
          <box $={(self) => radarTop = self} $type="overlay" class="radarTop">
            <BlockIcon block="defense/radar" />
          </box>
        </overlay>
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
  const cssClass = active((p) => p === hardcodedPowerSaver ? "blockDisabled" : "radiate")

  return (
    <box class="PowerProfile blockButton" visible={createBinding(battery, "isPresent")}>
      <box
        $={(self) => tooltip("Cycle Power Profile\nHold shift or use right click to cycle backwards")}
        cursor={GDK_CURSOR}
        class={cssClass}
      >
        <BlockOverlay block={icon} boxClass="radiation" />
        <Gtk.GestureClick
          // $={(self) => gesture = self}
          button={0}
          onPressed={(self) => {
            const profiles = powerprofiles.get_profiles()
            const index = profiles.findIndex((p) => p.profile === powerprofiles.activeProfile)
            const has_right_click = self.get_current_button() == Gdk.BUTTON_SECONDARY
            // https://discourse.gnome.org/t/gtk-4-and-gtkgestureclick-and-shift-ctrl/12998/6
            const mask = Gdk.ModifierType.SHIFT_MASK
            const has_shift = self.get_current_event_state() & mask == mask

            const nextProfile = !has_right_click && !has_shift
              ? (profiles[index + 1] || profiles[0]).profile
              : (profiles[index - 1] || profiles[profiles.length - 1]).profile
            powerprofiles.set_active_profile(nextProfile)
          }}
        />
      </box>
    </box>
  )
}

function Battery({ width = 175, ...unexpected }) {
  restrictUnpack(unexpected)

  const battery = AstalBattery.get_default()

  const percent = createBinding(
    battery,
    "percentage",
  )((p) => `Stored: ${Math.floor(p * 100)}%`)
  const progressRatio = width / 100
  const progress = createBinding(
    battery,
    "percentage",
  )((p) => p * 100 * progressRatio)
  const charging = createBinding(
    battery,
    "state",
  )((s) => s === AstalBattery.State.CHARGING)

      // <BlockIcon block="power/power-node-large" />
  return (
    <box class="Battery" spacing={4}>
      <box class="progressBar">
        <overlay $={tooltip("Battery")} widthRequest={width}>
          <revealer // TODO: try CSS transition
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

  let errs = [];
  const missFont = Array(
    "fontello",
    "Pixellari",
    // "Darktech LDR",
  ).some((family) => {
    let install = PangoCairo.font_map_get_default().get_family(family)
    return install === null;
  })
  if (missFont) {
    const cmd = "nix develop -c reload-fonts"
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
                        <label label={`try  <span color="lime">${line[1]}</span>`} useMarkup={true} />
                        <button class="copy" onClicked={(self) => {
                          self.get_clipboard().set(line[1])
                        }} ><label label={`<span color="aqua">COPY</span>`} useMarkup={true} /></button>
                        <label label="and restart MindustRice" />
                      </box>}
                    </box>
                  )
                })}
              </box>
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
                <IdleInhibitor />
                <PowerProfile />

                <Wireless />
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
