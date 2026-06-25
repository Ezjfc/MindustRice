{
  description = ''
    The Mindustry Race Inspired Cosmetic Enhancement of Linux, based on AGS/Astal.
    https://github.com/Ezjfc/MindustRice | Apache-2 License

    Others flakes in this repository:
    - resources/flake.nix
  '';

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    nixche.url = "github:ezjfc/nixche";
    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    resources.url = "path:./resources";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    nixche,
    ags,
    resources,
  }: flake-utils.lib.eachDefaultSystem(system: let
    pkgs = nixpkgs.legacyPackages.${system}.extend nixche.overlays.neovim-with-lsps;
    pname = "MindustRice";
    entry = "src/status-bar/app.tsx";

    inherit (resources.packages.${system}) mindustry mindustry-fonts animdustry-fonts;
    relinkResources = ''
      mkdir -p resources
      rm -rf ./resources/Mindustry
      ln -fs ${mindustry} ./resources/Mindustry
    '';
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

      preBuild = relinkResources;

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
        # Note: GJS is not NodeJS and AGS is not React!
        # NodeJS was added for development purposes.
        pkgs.nodejs
        pkgs.esbuild
        (with pkgs; neovim.withLsps {
          ts_ls = typescript-language-server;
          cssls = vscode-css-languageserver;
          css_variables = css-variables-language-server;
          nil_ls = nil; # Nix LSP

          # To generate types, run `ags types -u -d <where tsconfig.json is>`
        })

        # whoever caused this please ban them from open source development
        (pkgs.writeShellScriptBin "vscode-css-language-server" ''
          vscode-css-languageserver $*
        '')

        pkgs.xdg-utils # xdg-open
        (writeCatScriptBin "doc" "xdg-open https://aylur.github.io/ags/guide/intrinsics.html")
      ]) ++ (let
        echoRoot = ''
          echo "${pname}: project root is set to $INIT_WD \
          (if this is incorrect, please alter the env INIT_WD)"
        '';
        commonDefs = ''
          --define "import.meta.pkgDataDir='$INIT_WD'"
        '';
        yazi = ''
          ${echoRoot}
          yazi "$INIT_WD/resources/Mindustry/core/assets-raw/"
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
          WHOAMI=$(whoami)
          [ "$WHOAMI" == "" ] && echo "Empty user" && exit 1
          LOC="/home/$WHOAMI/.local/share/fonts"
          mkdir -p $LOC

          rm -rf $LOC/${mindustry-fonts.pname}
          ln -fs ${mindustry-fonts}/share/fonts/truetype $LOC/${mindustry-fonts.pname}

          rm -rf $LOC/${animdustry-fonts.pname}
          ln -fs ${animdustry-fonts}/share/fonts/truetype $LOC/${animdustry-fonts.pname}
          fc-cache

          fc-pattern fontello
          fc-pattern Pixellari
        '')

        (writeCatScriptBin "relink-resources" ''
          ${relinkResources}
          find ./resources -maxdepth 1
        '')
      ]);

      shellHook = ''
        export INIT_WD="$(pwd)"
      '';
    };
  });
}
