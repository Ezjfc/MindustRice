/**
 * Welcome to Alpha's lab of MindustRice components. This is a Gnim application to facilitate easy
 * customisation and preview for widget components located in {@link ../libmindustrice}.
 **/

import Gtk from "gi://Gtk?version=4.0"
import GObject, { register } from "gnim/gobject"

import style from "style.scss"
import ProgressBarPreview from "./ProgresBarPreview"
import Ribbon from "./Ribbon"
import Preview from "./Preview"
import OPBackground from "../libmindustrice/opening/OPBackground"
import GnimApp, { Abstractions } from "../libmindustrice/GnimApp"

export const BUTTON_PIXEL_SCALE = 2.0

@register()
class Lab extends GnimApp implements Abstractions {
  declare window?: Gtk.Window

  style() : string {
    return style
  }

  buildUI(passthrus: object) : GObject.Object {
    return (
      <Gtk.ApplicationWindow
        application={this}
        title="Alpha's Components Lab"
        defaultWidth={300}
        defaultHeight={150}
        opacity={50}
        {...passthrus}
      >
        <Gtk.Box orientation={Gtk.Orientation.VERTICAL}>
          <Ribbon />
          <ProgressBarPreview defaultName="Health Bar" defaultAppearence={{
            fill: "#FF341C",
            fillShade: "#C12817",
          }} />
          <ProgressBarPreview defaultName="Power Bar" />
          <ProgressBarPreview defaultName="Water Bar" defaultAppearence={{
            fill: "#596AB8",
            fillShade: "#435195",
          }} />
          <Preview
            defaultName="Opening Background"
            defaultHeight={281.25} // 16:9
          >
            <OPBackground />
          </Preview>
        </Gtk.Box>
      </Gtk.ApplicationWindow>
    )
  }
}

export const app = new Lab()
app.start()

