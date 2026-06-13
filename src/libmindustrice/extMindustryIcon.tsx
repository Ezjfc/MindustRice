/**
 * extMindustryIcon is a temporary helper to import icons in an external Mindustry repository. This
 *                  will be deprecated once migration to Gnim v2 is complete when static files can
 *                  be imported directly.
 */

// Future impl example:
// import iconMap from "../../resources/Mindustry/core/assets-raw/icons/map.png"
//
const RESOURCES_PATH = `${import.meta.pkgDataDir}/resources`

export default function getExtMindustryIcon(iconName: string) : string {
  return `${RESOURCES_PATH}/Mindustry/core/assets-raw/icons/${iconName}.png`
}
