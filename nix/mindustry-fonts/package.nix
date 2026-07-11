{
  stdenvNoCC,
  fontforge,
  util-linux,
  writeText,
  python314,
  python314Packages,

  mindustry,
}: let
  fontforgeScript = writeText "fontforge.py" (builtins.readFile ./fontforge.py);
in stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "mindustryFonts";
  version = mindustry.version;
  src = mindustry.src;

  nativeBuildInputs = [
    python314
    python314Packages.fontforge
    util-linux # "rename" command.
  ];
  LOC = "./core/assets/fonts";
  buildPhase = ''
    runHook preBuild

    outTtf="$out/share/fonts/truetype"
    mkdir -p $outTtf

    python3 ${fontforgeScript} $LOC
    rename "" ${finalAttrs.pname}_ $LOC/*
    install -Dm444 $LOC/*.ttf -t $outTtf

    runHook postBuild
  '';
})
