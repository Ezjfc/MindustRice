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
    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    resources = {
      url = ./resources;
      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-utils.follows = "flake-utils";
      };
    };
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ags,
    resources,
  }: flake-utils.lib.eachDefaultSystem(system: let
    pkgs = nixpkgs.legacyPackages.${system};
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
        wrapGAppsHook
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
      mkSelfCallCmd = name: cmd: pkgs.writeShellScriptBin name ''
        echo -e "\e[0;35m" # Dark purple.
        cat $0 >&2
        echo -e "\e[0m"

        ${cmd}
      '';
    in pkgs.mkShell {
      packages = [
        (ags.packages.${system}.default.override {
          inherit extraPackages;
        })
        # Note: GJS is not NodeJS and AGS is not React!
        # NodeJS was added for development purposes.
        pkgs.nodejs_24
        pkgs.typescript

        (mkSelfCallCmd "mindustrice-watch" ''
          echo "Project root is set to $INIT_WD (if this is incorrect, please alter the env INIT_WD)"
          ${pkgs.toybox}/bin/pkill waybar

          COMPONENTS="status-bar"
          # https://stackoverflow.com/a/35894538
          for component in ''${COMPONENTS//,/ }; do
            ${pkgs.screen}/bin/screen -dmS "MindustRice" bash -c \
              "find $INIT_WD/src | \
              ${pkgs.entr}/bin/entr -r ags run \"$INIT_WD/src/$component/app.tsx\"\
              --define \"import.meta.pkgDataDir='$INIT_WD'\"\
              --define \"import.meta.executableFree='${pkgs.procps}/bin/free'\"\
              --define \"import.meta.executableMpstat='${pkgs.sysstat}/bin/mpstat'\"\
              ; exit"
          done
        '')
        (mkSelfCallCmd "mindustrice-kill" ''
          ags quit --instance MindustRice
          ${pkgs.screen}/bin/screen -XS MindustRice quit
        '')

        pkgs.fontconfig
        (mkSelfCallCmd "reload-tmp-fonts" ''
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

        (mkSelfCallCmd "relink-resources" ''
          ${relinkResources}
          find ./resources -maxdepth 1
        '')
      ];

      shellHook = ''
        export INIT_WD="$(pwd)"
      '';
    };
  });
}
