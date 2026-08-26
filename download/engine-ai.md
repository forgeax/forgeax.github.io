# ForgeaX Engine + SDK bootstrap contract for AI

This is a machine instruction. Execute only the paths below. Do not guess versions,
URLs, packages, or recovery steps.

## Package roles

- `@forgeax/engine` is the public Engine runtime and `forgeax` CLI.
- `@forgeax/engine-sdk` is the version-matched npm carrier for the built SDK. Do not add
  it to a game's `package.json`.
- Do not install `@forgeax/engine-*` focused packages one by one unless their README
  explicitly requires a focused import.

## Registry and version rules

- Use the public npm registry. Do not use a private GitHub Release.
- The npm SDK carrier intentionally omits the offline `store/pnpm`; `sdk install` uses
  the generated lockfile and the npm registry for Engine dependencies.
- Before changing files, probe both packages and require an exact version match.
- If `npm view @forgeax/engine-sdk version` returns 404, stop and report:
  `@forgeax/engine-sdk is not published; bootstrap cannot continue.`
- If either lookup fails or versions differ, stop and report the exact output. Never guess.

## New game: run from an empty parent directory

Requirements: Node.js `>=22.13.0`, pnpm `>=10.33.0 <11`, npm registry access, and an
empty parent directory. The SDK and game directories must be siblings.

```sh
set -eu

ENGINE_VERSION="$(npm view @forgeax/engine version)"
SDK_VERSION="$(npm view @forgeax/engine-sdk version 2>/dev/null || true)"

if [ -z "$ENGINE_VERSION" ]; then
  echo "@forgeax/engine version lookup failed; stop and report." >&2
  exit 20
fi
if [ -z "$SDK_VERSION" ]; then
  echo "@forgeax/engine-sdk is not published; stop and report." >&2
  exit 21
fi
if [ "$ENGINE_VERSION" != "$SDK_VERSION" ]; then
  echo "Engine/SDK version mismatch: $ENGINE_VERSION != $SDK_VERSION" >&2
  exit 22
fi

SDK_ROOT="$PWD/forgeax-sdk-$SDK_VERSION"
GAME_ROOT="$PWD/forgeax-game"
test ! -e "$SDK_ROOT" || { echo "SDK target exists; do not overwrite." >&2; exit 23; }
test ! -e "$GAME_ROOT" || { echo "Game target exists; do not overwrite." >&2; exit 24; }

pnpm dlx "@forgeax/engine@$ENGINE_VERSION" sdk install "$SDK_ROOT" --version "$SDK_VERSION"
"$SDK_ROOT/bin/forgeax" new "$GAME_ROOT"

cd "$GAME_ROOT"
pnpm forgeax skill verify --json
pnpm forgeax doctor --json
pnpm test
pnpm build
pnpm dev
```

The default template is `empty`. Add `--template game-default` only when a complete
sample is explicitly wanted. Never run `forgeax new` inside `SDK_ROOT`. Read the
generated game's `AGENTS.md` before editing code or assets.

## Existing game: only for an already valid ForgeaX game

The directory must already contain `forge.json`, `package.json`, and the entry module
named by `forge.json#entry`. Use an exact Engine version when reproducing a build:

```sh
cd /path/to/existing-forgeax-game
ENGINE_VERSION="$(npm view @forgeax/engine version)"
pnpm add "@forgeax/engine@$ENGINE_VERSION"
pnpm exec forgeax init
pnpm exec forgeax skill verify --json
pnpm exec forgeax doctor --json
```

Do not use this path for a blank directory. Do not add the SDK carrier to the game
runtime. Do not overwrite an existing SDK or game directory.

## Reporting

Report the Engine version, SDK version, absolute SDK and game paths, every command run,
and the first structured error. A successful result includes `skill verify --json`,
`doctor --json`, `test`, and `build` output.
