{
  description = ''
    The Mindustry Race Inspired Cosmetic Enhancement of Linux, based on AGS/Astal.
    https://github.com/Ezjfc/MindustRice | Apache-2 License
  '';

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/release-26.05";
    flake-utils.url = "github:numtide/flake-utils";
    nixche.url = "github:ezjfc/nixche";
    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    mindustry-src = { url = "github:anuken/mindustry?ref=v151.1"; flake = false; };
    animdustry-src = { url = "github:anuken/animdustry?rev=f408e632872929964a9b3f8888f1c7a18e6c1ead"; flake = false; };
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    nixche,
    ags,
    mindustry-src,
    animdustry-src,
  }: flake-utils.lib.eachDefaultSystem(system: let
    pkgs = nixpkgs.legacyPackages.${system}.extend nixche.overlays.neovim-with-lsps;
    pname = "MindustRice";
    entry = "src/status-bar/app.tsx";

    mindustry = pkgs.srcOnly {
      stdenv = pkgs.stdenvNoCC;
      pname = "mindustry";
      version = "151.1";
      src = mindustry-src;
    };
    animdustry = pkgs.srcOnly {
      stdenv = pkgs.stdenvNoCC;
      pname = "animdustry";
      version = "1.2-unstable-2024-07-30";
      src = animdustry-src;
    };
    mindustry-fonts = pkgs.callPackage ./nix/mindustry-fonts/package.nix { inherit mindustry; };
    animdustry-fonts = pkgs.callPackage ./nix/animdustry-fonts/package.nix { inherit animdustry; };

    nvim-conf = pkgs.callPackage ./nix/nvim-conf/package.nix {};
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
      ];
  in {
    nixosModules.default = import ./nix/nixos-module.nix self;

    packages.mindustry-fonts = mindustry-fonts;
    packages.animdustry-fonts = animdustry-fonts;
    packages.default = pkgs.stdenv.mkDerivation {
      name = pname;
      src = ./.;

      nativeBuildInputs = with pkgs; [
        wrapGAppsHook3
        gobject-introspection
        ags.packages.${system}.default
      ];

      buildInputs = extraPackages ++ [
        pkgs.gjs
      ];

      # preBuild = relinkResources;

      installPhase = ''
        runHook preInstall

        mkdir -p $out/bin
        mkdir -p $out/share
        cp -r * $out/share
        ags bundle ${entry} $out/bin/${pname} -d "SRC='$out/share'" -d "import.meta.pkgDataDir='$out/share'"

        runHook postInstall
      '';
    };

    devShells.default = let
      writeCatScriptBin = (pkgs.callPackage nixche.packages.${system}.write-cat-script {}).writeCatScriptBin;
    in pkgs.mkShell {
      packages = ([
        (ags.packages.${system}.default.override {
          inherit extraPackages;
        })
        pkgs.fontforge
        # Although AGS does not use the Node runtime at all, NPM is needed for deps management:
        pkgs.nodejs

        pkgs.typescript-language-server
        pkgs.vscode-css-languageserver
        pkgs.css-variables-language-server

        pkgs.xdg-utils # xdg-open
        (writeCatScriptBin "doc" "xdg-open https://aylur.github.io/ags/guide/intrinsics.html")
      ]) ++ (let
        echoRoot = ''
          echo "${pname}: project root is set to $INIT_WD \
          (if this is incorrect, please alter the env INIT_WD)"
          [ "$INIT_WD" == "" ] && "$INIT_WD must not be empty" && exit 1
        '';
        commonDefs = ''
          --define "import.meta.pkgDataDir='$INIT_WD'"
        '';
        yazi = ''
          ${echoRoot}
          yazi "$INIT_WD/resources/Mindustry/core/assets-raw/"
        '';

        relinkResources = ''
          ${echoRoot}
          mkdir -p $INIT_WD/resources
          rm $INIT_WD/resources/Mindustry
          ln -s ${mindustry-src} $INIT_WD/resources/Mindustry
        '';
        watch = ''
          ${echoRoot}

          COMPONENTS="status-bar"
          # https://stackoverflow.com/a/35894538
          for component in ''${COMPONENTS//,/ }; do
            screen -dmS "${pname}" bash -c \
              "find $INIT_WD/src | \
              entr -r ags run \"$INIT_WD/src/$component/app.tsx\"\
              --define \"import.meta.pkgDataDir='$INIT_WD'\"\
              --define \"import.meta.executableFree='${pkgs.procps}/bin/free'\"\
              --define \"import.meta.executableMpstat='${pkgs.sysstat}/bin/mpstat'\"\
              ; exit"
          done
        ''; # TODO: change to libtop
        lab = ''
          ${echoRoot}
          ags run "$INIT_WD/src/lab/app.tsx" \
            ${commonDefs}
        '';
        lock-preview = ''
          ${echoRoot}
          ags run "$INIT_WD/src/lock/app.tsx" \
            --define "import.meta.lock.previewMode=true" \
            ${commonDefs}
        '';
      in [
        pkgs.toybox # pkill
        pkgs.screen
        pkgs.entr
        (writeCatScriptBin "mr-yazi" yazi)
        (writeCatScriptBin "mr-watch" watch)
        (writeCatScriptBin "mr-watch-keep-waybar" watch)
        (writeCatScriptBin "mr-kill" ''
          ags quit --instance "${pname}"
          screen -XS "${pname}" quit
        '')
        (writeCatScriptBin "mr-lab" lab)
        (writeCatScriptBin "mr-lock-preview" lock-preview)

        pkgs.fontconfig
        (writeCatScriptBin "reload-tmp-fonts" ''
          ${echoRoot}
          WHOAMI=$(whoami)
          [ "$WHOAMI" == "" ] && echo "Empty user" && exit 1
          LOC="/home/$WHOAMI/.local/share/fonts"
          mkdir -p $LOC

          rm $LOC/${mindustry-fonts.pname}
          ln -s ${mindustry-fonts}/share/fonts/truetype $LOC/${mindustry-fonts.pname}

          rm $LOC/${animdustry-fonts.pname}
          ln -s ${animdustry-fonts}/share/fonts/truetype $LOC/${animdustry-fonts.pname}

          mkdir -p $INIT_WD/resources
          rm $INIT_WD/resources/mindustryFonts
          ln -s $LOC/${mindustry-fonts.pname} $INIT_WD/resources/mindustryFonts
          ln -s $LOC/${animdustry-fonts.pname} $INIT_WD/resources/animdustryFonts

          fc-cache

          fc-pattern Mindustry
          fc-pattern "Mindustry Icon"
          fc-pattern ProggyCleanTT
          fc-pattern "Darktech LDR"

          fc-pattern Prose
          fc-pattern Pixellari
        '')

        (writeCatScriptBin "relink-resources" ''
          ${relinkResources}
          find $INIT_WD/resources -maxdepth 1
        '')
      ]);

      shellHook = ''
        export INIT_WD="$(pwd)"
        alias nvim="${nvim-conf}"
      '';
    };
  });
}
