{
  description = ''
    The Mindustry Race Inspired Cosmetic Enhancement of Linux, based on AGS/Astal.
    https://github.com/Ezjfc/MindustRice | Apache-2 License

    This flake contains external resources to bundle in the appliaction or load
    at runtime.
  '';

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    mindustry = { url = "github:anuken/mindustry?ref=v151.1"; flake = false; };
    animdustry = { url = "github:anuken/animdustry"; flake = false; };
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    mindustry,
    animdustry,
  }: flake-utils.lib.eachDefaultSystem(system: let
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    packages.mindustry = mindustry;
    packages.animdustry = animdustry;
    packages.mindustry-fonts = with pkgs; stdenvNoCC.mkDerivation (finalAttrs: {
      pname = "mindustryFonts";
      version = "151.1";
      src = mindustry;

      nativeBuildInputs = [
        fontforge
        util-linux # "rename" command.
      ];
      LOC = "./core/assets/fonts";
      buildPhase = ''
        runHook preBuild

        dewoff $LOC/*.woff
        mv ./*.ttf $LOC
        rename "" ${finalAttrs.pname}_ $LOC/*
        install -Dm444 $LOC/*.ttf -t $out/share/fonts/truetype

        runHook postBuild
      '';
    });
    packages.animdustry-fonts = with pkgs; stdenvNoCC.mkDerivation (finalAttrs: {
      pname = "animdustryFonts";
      version = "1.2-unstable-2024-07-30";
      src = animdustry;

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
    });
  });
}
