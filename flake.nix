{
  description = "@0xc/edge-oauth-sessions";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system}; in
      {
        devShells = {
          default = pkgs.mkShell {
            packages = with pkgs; [
                git
                nodejs_20
                yarn
                opentofu
								wrangler_1
            ];

            PROJECT_NAME = "edge-oauth-sessions";

            shellHook = ''
                echo $ Started devshell for $PROJECT_NAME
                echo
            '';
          };
        };
      }
    );
}
