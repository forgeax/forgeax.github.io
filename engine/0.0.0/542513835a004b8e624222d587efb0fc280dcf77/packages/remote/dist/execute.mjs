// src/errors.ts
var RemoteError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`[RemoteError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "RemoteError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    if (args.detail !== void 0) {
      this.detail = args.detail;
    }
  }
  toJSON() {
    const json = {
      code: this.code,
      expected: this.expected,
      hint: this.hint,
      message: this.message
    };
    return this.detail === void 0 ? json : { ...json, detail: this.detail };
  }
};

// src/execute.ts
var AsyncFunction = Object.getPrototypeOf(async () => {
}).constructor;
var _import = async (specifier) => import(
  /* @vite-ignore */
  specifier
);
function compile(script) {
  const params = [
    "world",
    "renderer",
    "assets",
    "rhiCapture",
    "simulation",
    "profiler",
    "execution",
    "plugins",
    "_import"
  ];
  try {
    const expr = script.replace(/[\s;]+$/, "");
    return new AsyncFunction(...params, `return (${expr}
)`);
  } catch (e) {
    if (!(e instanceof SyntaxError)) throw e;
    return new AsyncFunction(...params, script);
  }
}
async function executeScript(script, ctx) {
  try {
    const fn = compile(script);
    const value = await fn(
      ctx.world,
      ctx.renderer,
      ctx.assets,
      ctx.rhiCapture,
      ctx.simulation,
      ctx.profiler,
      ctx.execution,
      ctx.plugins,
      ctx.importModule ?? _import
    );
    return { ok: true, value };
  } catch (e) {
    if (e instanceof RemoteError) {
      return { ok: false, error: e };
    }
    if (e instanceof SyntaxError) {
      const msg = e.message;
      return {
        ok: false,
        error: new RemoteError({
          code: "script-syntax-error",
          expected: "script body is valid JavaScript",
          hint: `check syntax near: ${msg}; fix and resubmit`
        })
      };
    }
    const rawMessage = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: new RemoteError({
        code: "script-runtime-error",
        expected: "script executes without throwing",
        hint: `inspect error; verify symbol availability; eval has full access to world/renderer/assets (errMessage: ${rawMessage})`
      })
    };
  }
}

export { executeScript };
