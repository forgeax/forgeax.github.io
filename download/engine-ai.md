# ForgeaX Engine + SDK: AI bootstrap contract

You are an AI coding agent. Execute this contract exactly. Do not guess versions,
URLs, packages, or recovery steps.

## Mandatory rules

1. Use the public npm registry. `@forgeax/engine` is the public runtime and `forgeax`
   CLI. `@forgeax/engine-sdk` is the matching SDK carrier, not a game runtime
   dependency; never add it to the game's `package.json`.
2. After SDK installation, read `$SDK_ROOT/AGENTS.md` in full before running `new` or
   changing anything. It is the SDK authority. After game creation, read
   `$GAME_ROOT/AGENTS.md` in full before editing code or assets. It is the game
   authority. Follow both files; do not replace them with this page.
   In the game, `forge.json` owns configuration, entry, and plugins; stable GUIDs own
   asset identity; `skills/` is the single skill source of truth.
3. `sdk-manifest.json` is the SDK archive authority. Do not hand-edit the SDK stage,
   manifest, offline store, generated `dist/`, `node_modules/`, or `.forgeax/` state.
4. The SDK root and every child of it are forbidden game targets. Use a sibling or
   another external absolute path. `forgeax new` must not overwrite an existing path.
5. Direct edit is the default. Do not start the ForgeaX closed loop unless the user
   explicitly authorizes it for the current task.
6. The user's machine must provide pnpm `>=11.7.0 <12`. Check `pnpm --version`
   before any bootstrap or project command; if it is unavailable or unsupported,
   stop and report the exact version instead of silently switching versions.
7. The CLI is the only product tool entry. Prefer `--json`; discover operations with
   `forgeax list`, `describe`, and `run` instead of guessing inputs.

## Resolve and require one exact release

Requirements: Node.js `>=22.13.0`, pnpm `>=11.7.0 <12`, npm registry access, and an
empty parent directory.

```sh
set -eu

PNPM_VERSION="$(pnpm --version 2>/dev/null || true)"
case "$PNPM_VERSION" in
  11.7.*|11.8.*|11.9.*|11.[1-9][0-9].*) ;;
  *)
    echo "pnpm >=11.7.0 <12 is required on the user's machine; found ${PNPM_VERSION:-unavailable}. Activate pnpm 11.7.0+ and retry." >&2
    exit 19
    ;;
esac

ENGINE_VERSION="$(npm view @forgeax/engine version 2>/dev/null || true)"
SDK_VERSION="$(npm view @forgeax/engine-sdk version 2>/dev/null || true)"

if [ -z "$ENGINE_VERSION" ]; then
  echo "@forgeax/engine is not resolvable from public npm; stop and report." >&2
  exit 20
fi
if [ -z "$SDK_VERSION" ]; then
  echo "@forgeax/engine-sdk is not published on public npm; stop and report." >&2
  exit 21
fi
if [ "$ENGINE_VERSION" != "$SDK_VERSION" ]; then
  echo "Engine/SDK version mismatch: $ENGINE_VERSION != $SDK_VERSION" >&2
  exit 22
fi

SDK_ROOT="$PWD/forgeax-sdk-$SDK_VERSION"
GAME_ROOT="$PWD/forgeax-game"
test ! -e "$SDK_ROOT" || { echo "SDK target exists; do not overwrite." >&2; exit 22; }
test ! -e "$GAME_ROOT" || { echo "Game target exists; do not overwrite." >&2; exit 23; }

pnpm dlx "@forgeax/engine@$ENGINE_VERSION" sdk install "$SDK_ROOT" --version "$SDK_VERSION"
cat "$SDK_ROOT/AGENTS.md"
(cd "$SDK_ROOT" && "$SDK_ROOT/bin/forgeax" init)
"$SDK_ROOT/bin/forgeax" new "$GAME_ROOT"
cat "$GAME_ROOT/AGENTS.md"

cd "$GAME_ROOT"
pnpm forgeax skill verify --json
pnpm forgeax doctor --json
pnpm test
pnpm build
pnpm dev
```

The npm carrier intentionally omits the offline `store/pnpm`; its lockfile installs
the matching Engine dependencies from npm. The SDK-root `forgeax init` is mandatory
after download: it checks the user's Node/pnpm/platform tuple and prepares native
dependencies before `new`. The default template is `empty` with `src/main.ts`; use
`--template game-default` only when a complete sample is explicitly requested.
`forgeax new` is transactional and installs the SDK `skills/` as ordinary files plus
rebuildable Agent discovery links. If `skill verify --json` is not OK, run
`skill install --json`, verify again, and stop on any remaining error.

## Existing ForgeaX game

If the target already contains `forge.json`, `package.json`, and its entry module, do
not run `new` or install the SDK carrier into the game. Read its `AGENTS.md`, then use:

```sh
ENGINE_VERSION="$(npm view @forgeax/engine version)"
pnpm add "@forgeax/engine@$ENGINE_VERSION"
pnpm exec forgeax init
pnpm forgeax skill verify --json
pnpm forgeax doctor --json
```

## Report

Report Engine, SDK, and actual user-machine pnpm versions, absolute SDK/game paths,
every command, structured verification output, and the first error. A successful new
game has the SDK and game `AGENTS.md` read, SDK-root `init`, `skill verify --json`,
`doctor --json`, tests, and build all passing.
