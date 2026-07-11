"""
This script serves 2 purposes (in arg #1 dir):
1. patches the name of font.woff and icon.ttf
2. converts font.woff to font.ttf
"""

from pathlib import Path
import sys
import fontforge

dir = Path(sys.argv[1])
fonts = {
    "font.woff": "Mindustry",
    "icon.ttf": "Mindustry Icon",
}

for item_name, new_name in fonts.items():
    item = dir / Path(item_name)
    font = fontforge.open(str(item))

    font.fontname = new_name
    font.familyname = new_name
    font.fullname = new_name

    font.generate(str(item.with_suffix(".ttf")))
    font.close()
