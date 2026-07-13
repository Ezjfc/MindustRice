{
  writeScriptBin,
  writeText,
}: let
  configScript = writeText "lsps.lua" (builtins.readFile ./lsps.lua);
in writeScriptBin "nvim-conf.sh" ''
  nvim -c ":source ${configScript}" $@
''
