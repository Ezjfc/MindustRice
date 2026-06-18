/**
 * extMindustryIcon is a temporary helper to import icons in an external Mindustry repository. This
 *                  will be deprecated once migration to Gnim v2 is complete when static files can
 *                  be imported directly.
 */

import { $ } from "gnim-hooks"

// Future impl example:
// import iconMap from "../../resources/Mindustry/core/assets-raw/icons/map.png"

/**
 * The absolute path to the resources folder.
 */
const RESOURCES_PATH = `${import.meta.pkgDataDir}/resources`

/**
 * getExtMindustryIcon returns the absolute path to a Mindustry icon.
 */
export default function getExtMindustryIcon(iconName: $<string>) : $<string> {
  return $(iconName).as(n => `${RESOURCES_PATH}/Mindustry/core/assets-raw/icons/${n}.png`)
}
