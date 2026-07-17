{
  writeShellScript,
  writeText,
}: let
  configScript = writeText "lsps.lua" (builtins.readFile ./lsps.lua);
in writeShellScript "nvim-conf.sh" ''
  nvim -c ":source ${configScript}" $@
''
