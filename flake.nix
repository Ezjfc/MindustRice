{
  description = "My Awesome Desktop Shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    ags,
  }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
    pname = "MindustRice";

    mindustry-fonts = with pkgs; stdenvNoCC.mkDerivation {
      name = "mindustry-fonts-151.1";
      src = fetchFromGitHub {
        owner = "Anuken";
        repo = "Mindustry";
        tag = "v151.1";
        hash = "sha256-/WBO66Ii/1IuL3VaQNCTrcK43VWS8FVLYPxxtJMYKus=";
      };
      installPhase = let
        fonts-count = "4";
      in ''
        runHook preInstall

        LOC="core/assets/fonts"
        [ "$(ls $LOC -1 | wc -l)" != "${fonts-count}" ] && echo "assertion error: number of font files is not ${fonts-count}" && exit 1
        mkdir -p $out/share/fonts
        cp -r $LOC $out/share/fonts/opentype/

        runHook postInstall
      '';
    };

    entry = "app.ts";
    astalPackages = with ags.packages.${system}; [
      io
      astal4 # or astal3 for gtk3
      # notifd tray wireplumber

      tray
      apps
      mpris
      wireplumber
      powerprofiles
      network
      battery
    ];
    extraPackages =
      astalPackages
      ++ [
        pkgs.libadwaita
        pkgs.libsoup_3
        mindustry-fonts
        pkgs.nerd-fonts.symbols-only
      ];
  in {
    packages.${system} = {
      inherit mindustry-fonts;

      default = pkgs.stdenv.mkDerivation {
        name = pname;
        src = ./.;

        nativeBuildInputs = with pkgs; [
          wrapGAppsHook
          gobject-introspection
          ags.packages.${system}.default
        ];

        buildInputs = extraPackages ++ [pkgs.gjs];

        installPhase = ''
          runHook preInstall

          mkdir -p $out/bin
          mkdir -p $out/share
          cp -r * $out/share
          ags bundle ${entry} $out/bin/${pname} -d "SRC='$out/share'"

          runHook postInstall
        '';
      };
    };

    devShells.${system} = {
      default = pkgs.mkShell {
        buildInputs = [
          (ags.packages.${system}.default.override {
            inherit extraPackages;
          })
          pkgs.nodejs_24
          pkgs.typescript

          pkgs.entr
          (let
            cmd = "find $1 | entr -r ags run $1";
          in pkgs.writeShellScriptBin "ags-watch" ''
            #!/usr/bin/env bash
            [ "$#" != "1" ] && echo "Enter the path to watch" && exit 1
            echo "${cmd}"
            ${cmd}
          '')

          pkgs.fontconfig
          pkgs.less
          (let
            cmd = "fc-query ${mindustry-fonts}/share/fonts/opentype/* | less";
          in pkgs.writeShellScriptBin "mindustry-fonts-info" ''
            #!/usr/bin/env bash
            echo "${cmd}"
            ${cmd}
          '')
        ];
      };
    };
  };
}
