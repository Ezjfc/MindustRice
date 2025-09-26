{
  description = ''
    The Mindustry Race Inspired Cosmetic Enhancement of Linux, based on AGS/Astal.

    https://github.com/Ezjfc/MindustRice | Apache-2 License
  '';

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    # Non-flake inputs:
    mindustry = { url = "github:anuken/mindustry?ref=v151.1"; flake = false; };
    animdustry = { url = "github:anuken/animdustry"; flake = false; };
    astalconfig = {
      url = "github:maxverbeek/astalconfig?rev=20a5bf251c0df136945778199c87bebafcce7c59";
      flake = false;
    };
  };

  outputs = {
    self,
    nixpkgs,
    ags,
    # Non-flake inputs:
    mindustry,
    animdustry,
    astalconfig,
  }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
    pname = "MindustRice";

    mindustry-fonts = with pkgs; stdenvNoCC.mkDerivation (finalAttrs: {
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
    animdustry-fonts = with pkgs; stdenvNoCC.mkDerivation (finalAttrs: {
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

    entry = "app.ts";
    astalPackages = with ags.packages.${system}; [
      io
      astal4

      tray
      apps
      mpris
      hyprland
      wireplumber
      powerprofiles
      network
      battery
    ];
    extraPackages =
      astalPackages
      ++ [
        pkgs.libadwaita
        pkgs.libsoup_3 # TODO: insecure software
        pkgs.procps
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

        buildInputs = extraPackages ++ [
          pkgs.gjs
        ];

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
      default = let
        mkSelfCallCmd = name: cmd: pkgs.writeShellScriptBin name ''
          echo -e "\e[0;30m" # They only show when you highlight because why not.
          cat $0 >&2
          echo -e "\e[0m"

          ${cmd}
        '';
      in pkgs.mkShell {
        buildInputs = [
          (ags.packages.${system}.default.override {
            inherit extraPackages;
          })
          # Note: GJS is not NodeJS and AGS is not React!
          # NodeJS was added for development purposes.
          pkgs.nodejs_24
          pkgs.typescript

          pkgs.entr
          pkgs.screen
          (mkSelfCallCmd "ags-watch" ''
            [ "$#" != "1" ] && echo "Enter the path to watch" && exit 1
            screen bash -c "find $1 | entr -r ags run $1"
          '')

          pkgs.fontconfig
          (mkSelfCallCmd "reload-fonts" ''
            DIR="/home/$(whoami)/.local/share"
            LOC="$DIR/fonts"
            [ -e "$LOC" ] && mv $LOC $DIR/fonts.old
            mkdir -p $LOC

            ln -fs ${mindustry-fonts}/share/fonts/truetype $LOC/${mindustry-fonts.pname}
            ln -fs ${animdustry-fonts}/share/fonts/truetype $LOC/${animdustry-fonts.pname}
            fc-cache

            fc-pattern fontello
            fc-pattern Pixellari
          '')

          (mkSelfCallCmd "relink-resources" ''
            [ -e "./resources" ] && mv ./resources ./resources.old
            mkdir -p ./resources

            ln -fs ${mindustry} ./resources/Mindustry
            ln -fs ${astalconfig} ./resources/astalconfig

            ls ./resources
          '')
        ];
      };
    };
  };
}
