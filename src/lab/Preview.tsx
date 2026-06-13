/**
 * Preview is a wrapper to display a component for preview alongside allowing users to tweaks the
 *         settings for that component.
 */

import Gtk from "gi://Gtk?version=4.0";
import { Accessor, createEffect, createState, Setter } from "gnim";
import GObject from "gnim/gobject";
import { ENTRY_PADDING_PIXELS, getTextWidth } from "./utils";

/**
 * Parameters holds parameters for a preview component.
 */
export interface Parameters {
  /**
   * component decides what component is being previewed.
   */
  component: GObject.Object
  /**
   * defaultName holds the name for newly added component until the user changes it.
   */
  defaultName: string
}

/**
 * Preview initialises the component.
 */
export default function Preview({ component, defaultName }: Parameters) : GObject.Object {
  const [name, setName] = createState(defaultName)

  return (
    <box orientation={Gtk.Orientation.VERTICAL} class="Preview">
      <Toolbar
        name={name}
        setName={setName}
        generateName={name}
      />
      <box heightRequest={40}>
        {component}
      </box>
    </box>
  )
}

/**
 * Toolbar initialises the toolbar in a preview component.
 */
export function Toolbar({ name, setName, generateName }: {
  name: Accessor<string>,
  setName: Setter<string>,
  generateName: Accessor<string>,
}) : GObject.Object {
  const [placeholderShowing, setPlaceholderShowing] = createState(false)

  return (
    <box class="Toolbar" valign={Gtk.Align.START} >
      <entry
        $={(self) => createEffect(() => {
          self.widthRequest = getTextWidth(self, generateName()) + ENTRY_PADDING_PIXELS
        })}
        placeholderText={generateName}
        hexpand={placeholderShowing.as(s => !s)}

        text={name}
        onNotifyText={({ text }) => {
          setPlaceholderShowing(text == "")
        }}
      />
      <label label="(press Enter to use default name, Esc to cancel edit)" visible={placeholderShowing} />
    </box>
  )
}
