flake: { config, lib, ... }: let
  inherit (lib) mkEnableOption mkIf;
  cfg = config.programs.mindustrice;
in {
  options.programs.mindustrice = {
    enable = mkEnableOption "MindustRice, the Mindustry RICE of Linux";
    # statusBar.enable = mkEnableOption "status bar component of MindustRice";
  };

  font.packages = mkIf cfg.enable (with flake.packages; [
    mindustry-fonts animdustry-fonts
  ]);
  system.environmentPackages = mkIf cfg.enable (with flake.packages; [
    default
  ]);
  systemd.user.services.mindustrice = let
    target = "graphical-session.target";
  in mkIf cfg.enable {
    unitConfig = {
      Description = "The Mindustry Race Inspired Cosmetic Enhancement of Linux, based on AGS/Astal.";
      Documentatoin = "https://github.com/Ezjfc/MindustRice";
      PartOf = target;
      After = target;
      Requisite = target;
    };
    serviceConfig = {
      ExecStart = "${flake.packages.default}/bin/mindustrice";
      ExecReload="kill -SIGUSR2 $MAINPID";
      Restart = "on-failure";
    };
    wantedBy = [ target ];
  };
}
