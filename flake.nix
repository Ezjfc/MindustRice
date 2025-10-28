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
        pkgs.procps
      ];
  in {
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

        (mkSelfCallCmd "ags-watch" ''
          echo "Project root is set to $INIT_WD (if this is incorrect, please alter the env INIT_WD)"
          AGS_RUN="ags run \"$INIT_WD/${entry}\" --define \"import.meta.pkgDataDir='$INIT_WD'\""
          ${pkgs.screen}/bin/screen -dmS ags-watch bash -c \
            "find $1 | ${pkgs.entr}/bin/entr -r $AGS_RUN; exit"
        '')
        (mkSelfCallCmd "ags-kill" ''
          ${pkgs.toybox}/bin/pkill entr
        '')

        pkgs.fontconfig
        (mkSelfCallCmd "reload-fonts" ''
          WHOAMI=$(whoami)
          [ "$WHOAMI" == "" ] && echo "Empty user" && exit 1
          LOC="/home/$WHOAMI/.local/share/fonts"
          rm -rf $LOC && mkdir -p $LOC

          ln -fs ${mindustry-fonts}/share/fonts/truetype $LOC/${mindustry-fonts.pname}
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
