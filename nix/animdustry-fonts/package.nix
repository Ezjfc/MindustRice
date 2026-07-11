{
  stdenvNoCC,
  util-linux,

  animdustry,
}: stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "animdustryFonts";
  version = animdustry.version;
  src = animdustry.src;

  nativeBuildInputs = [
    util-linux # "rename" command.
  ];
  LOC = "./assets";
  buildPhase = ''
    runHook preBuild

    rename "" ${finalAttrs.pname}_ $LOC/*
    install -Dm444 $LOC/*.ttf -t $out/share/fonts/truetype

    runHook postBuild
  '';
})
