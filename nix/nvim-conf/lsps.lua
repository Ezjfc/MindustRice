if vim.version().minor < 11 then
  vim.print("[MindustRice/nix/nvim-conf] you must upgrade Neovim to 11.0+ to use native language servers")
else
  vim.lsp.enable({
    "ts_ls",
    "cssls",
    "css_variables",
  })

  vim.lsp.config("cssls", {
    -- Nvim-Lspconfig defaults this cmd to "vscode-css-language-server":
    cmd = { "vscode-css-languageserver", "--stdio" },
  })
end

