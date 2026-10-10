// src/errors.ts
var uiErrorPolicy = {
  "invalid-environment": {
    expected: "a browser-like DOM environment",
    hint: "Call mountUi in a browser-like DOM environment."
  },
  "invalid-root": {
    expected: "an HTMLElement root owned by the caller",
    hint: "Provide an HTMLElement root owned by the caller."
  },
  "invalid-asset": {
    expected: "a UiAsset with non-empty guid, html, and css strings",
    hint: "Load a UiAsset with non-empty guid, html, and css strings."
  },
  "invalid-layer": {
    expected: "a non-negative integer layer",
    hint: "Layer must be a non-negative integer."
  },
  "invalid-preview-rect": {
    expected: "a finite preview rectangle with positive width and height",
    hint: "Provide finite x/y values and positive width/height."
  },
  "preview-invalid-transition": {
    expected: "a legal preview session state transition",
    hint: "Call the operation from its documented session state."
  },
  "preview-disposed": {
    expected: "a preview session that has not been disposed",
    hint: "Create a new preview session after disposal."
  },
  "preview-stale-completion": {
    expected: "the current preview generation",
    hint: "Ignore stale async work and await the current generation."
  },
  "preview-load-failed": {
    expected: "the preview GUID to load successfully",
    hint: "Repair the imported asset, then call retry()."
  },
  "preview-scenario-failed": {
    expected: "the scenario prepare hook to complete successfully",
    hint: "Fix the scenario prepare hook before retrying."
  },
  "preview-scenario-missing-part": {
    expected: "all parts declared by the scenario",
    hint: "Restore the required data-ui-part element before retrying."
  },
  "preview-scenario-timeout": {
    expected: "the scenario to report ready before its timeout",
    hint: "Make scenario.prepare resolve ready or increase scenarioTimeoutMs."
  },
  "capture-not-ready": {
    expected: "all capture readiness gates to be satisfied",
    hint: "Satisfy every reported readiness fact, then capture again."
  },
  "capture-failed": {
    expected: "the browser screenshot operation to succeed",
    hint: "Inspect the reported capture stage and retry in the same browser."
  }
};
function detailFor(code, message) {
  switch (code) {
    case "invalid-environment":
      return { message, environment: "browser-like DOM" };
    case "invalid-root":
      return { message, root: "HTMLElement" };
    case "invalid-layer":
      return { message, layer: -1 };
    case "invalid-preview-rect":
      return { message, rect: "preview rect" };
    case "preview-invalid-transition":
    case "preview-disposed":
    case "preview-stale-completion":
      return { message, state: "preview session" };
    case "preview-load-failed":
      return { message, guid: "preview GUID" };
    case "preview-scenario-failed":
      return { message, scenario: "preview scenario" };
    case "preview-scenario-missing-part":
      return { message, part: "required part" };
    case "preview-scenario-timeout":
      return { message, timeoutMs: 0 };
    case "capture-not-ready":
      return { message, unmet: [] };
    case "capture-failed":
      return { message, stage: "screenshot" };
    case "invalid-asset":
      return { message, asset: "UiAsset" };
  }
}
function uiError(code, detail) {
  const narrowedDetail = detailFor(code, detail);
  const policy = uiErrorPolicy[code];
  return {
    ok: false,
    error: {
      code,
      expected: policy.expected,
      hint: policy.hint,
      detail: narrowedDetail
    }
  };
}
function uiPreviewLoadFailed(message, guid, diagnostics) {
  const result = uiError("preview-load-failed", message);
  if (result.ok) return result;
  const baseError = result.error;
  return {
    ok: false,
    error: {
      ...baseError,
      detail: {
        message,
        guid,
        ...diagnostics === void 0 ? {} : { diagnostics }
      }
    }
  };
}

// src/loader.ts
function createUiLoader() {
  return {
    load(payload) {
      if (payload && typeof payload === "object" && "payload" in payload) {
        const input = payload;
        if (input.kind !== "ui" || !input.payload || typeof input.payload !== "object") {
          return uiError("invalid-asset", "Pack v2 input must contain a UI payload");
        }
        payload = input.payload;
      }
      if (!payload || typeof payload !== "object")
        return uiError("invalid-asset", "payload is not an object");
      const candidate = payload;
      if (typeof candidate.guid !== "string" || !candidate.guid || typeof candidate.html !== "string" || typeof candidate.css !== "string") {
        return uiError("invalid-asset", "guid, html, and css are required strings");
      }
      return {
        ok: true,
        value: { guid: candidate.guid, html: candidate.html, css: candidate.css }
      };
    }
  };
}

// src/mount.ts
function mountUi(asset, options) {
  if (typeof document === "undefined" || typeof AbortController === "undefined")
    return uiError("invalid-environment", "DOM APIs are unavailable");
  if (!(options.root instanceof HTMLElement))
    return uiError("invalid-root", "root is not an HTMLElement");
  if (!Number.isInteger(options.layer) || options.layer < 0)
    return uiError("invalid-layer", "layer must be non-negative");
  if (!asset?.guid || typeof asset.html !== "string" || typeof asset.css !== "string")
    return uiError("invalid-asset", "asset payload is malformed");
  const host = document.createElement("div");
  host.dataset.uiAsset = asset.guid;
  host.style.position = "absolute";
  host.style.inset = "0";
  host.style.zIndex = String(options.layer);
  host.style.pointerEvents = "none";
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = asset.css;
  shadow.append(style);
  const content = document.createElement("div");
  content.innerHTML = asset.html;
  content.style.pointerEvents = "auto";
  shadow.append(content);
  const controller = new AbortController();
  const onClick = (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-ui-action]") : null;
    const action = target?.dataset.uiAction;
    if (action) options.onAction?.(action, event);
  };
  shadow.addEventListener("click", onClick, { signal: controller.signal });
  options.root.append(host);
  let disposed = false;
  return {
    ok: true,
    value: {
      host,
      signal: controller.signal,
      dispose() {
        if (disposed) return;
        disposed = true;
        controller.abort();
        host.remove();
      }
    }
  };
}

// src/preview/session.ts
function error(code, message) {
  return uiError(code, message);
}
function loadFailureMessage(loadError) {
  if ("message" in loadError.detail) return loadError.detail.message;
  if (loadError instanceof Error) return loadError.message;
  return "preview asset failed to load";
}
function validRect(rect) {
  return Number.isFinite(rect.x ?? 0) && Number.isFinite(rect.y ?? 0) && Number.isFinite(rect.width) && Number.isFinite(rect.height) && rect.width > 0 && rect.height > 0;
}
function applyRect(instance, rect) {
  const style = instance.host.style;
  style.inset = "auto";
  style.left = `${rect.x ?? 0}px`;
  style.top = `${rect.y ?? 0}px`;
  style.width = `${rect.width}px`;
  style.height = `${rect.height}px`;
}
async function prepareScenario(scenario, instance, timeoutMs) {
  let timer;
  try {
    const pending = Promise.resolve(scenario.prepare({ instance, signal: instance.signal }));
    const timeout = new Promise((resolve) => {
      timer = setTimeout(
        () => resolve(
          error(
            "preview-scenario-timeout",
            `scenario did not become ready within ${timeoutMs}ms`
          )
        ),
        timeoutMs
      );
    });
    const result = await Promise.race([pending, timeout]);
    if (!result.ok) return result;
    for (const part of scenario.requiredParts) {
      if (!(part in result.value.parts) || !result.value.parts[part]) {
        return error(
          "preview-scenario-missing-part",
          `scenario did not provide required part: ${part}`
        );
      }
    }
    if (!result.value.ready)
      return error("preview-scenario-failed", "scenario did not report ready");
    return result;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return error("preview-scenario-failed", message);
  } finally {
    if (timer !== void 0) clearTimeout(timer);
  }
}
function createUiPreviewSession(options) {
  let state = "loading";
  let current = null;
  let generation = 0;
  const timeoutMs = options.scenarioTimeoutMs ?? 5e3;
  const unsubscribers = [];
  const run = async (token) => {
    if (token !== generation)
      return error("preview-stale-completion", "an older preview generation completed");
    if (typeof document === "undefined" || typeof AbortController === "undefined") {
      state = "failed";
      return error("invalid-environment", "DOM APIs are unavailable");
    }
    if (!(options.root instanceof HTMLElement)) {
      state = "failed";
      return error("invalid-root", "root is not an HTMLElement");
    }
    if (!validRect(options.rect)) {
      state = "failed";
      return error("invalid-preview-rect", "rect width and height must be positive finite numbers");
    }
    const loaded = await options.assets.loadByGuid(options.guid);
    if (token !== generation)
      return error("preview-stale-completion", "an older preview generation completed");
    if (!loaded.ok) {
      state = "failed";
      const message = loadFailureMessage(loaded.error);
      const diagnostics = "diagnostics" in loaded.error.detail ? loaded.error.detail.diagnostics : void 0;
      return uiPreviewLoadFailed(message, options.guid, diagnostics);
    }
    const mountOptions = options.onAction ? { root: options.root, layer: options.layer ?? 0, onAction: options.onAction } : { root: options.root, layer: options.layer ?? 0 };
    const mounted = mountUi(loaded.value, mountOptions);
    if (!mounted.ok) {
      state = "failed";
      return mounted;
    }
    const instance = mounted.value;
    applyRect(instance, options.rect);
    if (token !== generation) {
      instance.dispose();
      return error("preview-stale-completion", "an older preview generation completed");
    }
    if (options.scenario) {
      const prepared = await prepareScenario(options.scenario, instance, timeoutMs);
      if (token !== generation) {
        instance.dispose();
        return error("preview-stale-completion", "an older preview generation completed");
      }
      if (!prepared.ok) {
        instance.dispose();
        state = "failed";
        return prepared;
      }
    }
    current = instance;
    state = "mounted";
    return { ok: true, value: instance };
  };
  const session = {
    guid: options.guid,
    get state() {
      return state;
    },
    get instance() {
      return current;
    },
    async open() {
      if (state === "disposed") return error("preview-disposed", "preview session is disposed");
      if (state === "mounted" && current) return { ok: true, value: current };
      if (state !== "loading")
        return error("preview-invalid-transition", `open is not valid from ${state}`);
      const token = ++generation;
      return run(token);
    },
    async rebuild() {
      if (state === "disposed") return error("preview-disposed", "preview session is disposed");
      if (state !== "loading" && state !== "mounted" && state !== "failed" && state !== "rebuilding")
        return error("preview-invalid-transition", `rebuild is not valid from ${state}`);
      current?.dispose();
      current = null;
      options.assets.invalidate(options.guid);
      const token = ++generation;
      state = "rebuilding";
      return run(token);
    },
    async retry() {
      if (state === "disposed") return error("preview-disposed", "preview session is disposed");
      if (state !== "failed")
        return error("preview-invalid-transition", `retry is not valid from ${state}`);
      const token = ++generation;
      state = "loading";
      return run(token);
    },
    async handleAssetChanged(change) {
      if (state === "disposed") return error("preview-disposed", "preview session is disposed");
      const target = options.guid.toLowerCase();
      const matched = change.guids.some((guid) => guid.toLowerCase() === target);
      if (!matched) return { ok: true, value: current };
      const rebuilt = await session.rebuild();
      return rebuilt;
    },
    subscribeToAssetChanges(subscribe) {
      let active = true;
      const unsubscribe = subscribe(async (change) => {
        if (!active || state === "disposed") return { ok: true, value: current };
        return session.handleAssetChanged(change);
      });
      const stop = () => {
        if (!active) return;
        active = false;
        unsubscribe();
        const index = unsubscribers.indexOf(stop);
        if (index >= 0) unsubscribers.splice(index, 1);
      };
      unsubscribers.push(stop);
      return stop;
    },
    dispose() {
      if (state === "disposed") return { ok: true, value: void 0 };
      generation++;
      for (const unsubscribe of unsubscribers.splice(0)) unsubscribe();
      current?.dispose();
      current = null;
      state = "disposed";
      return { ok: true, value: void 0 };
    }
  };
  return session;
}

export { createUiLoader, createUiPreviewSession, mountUi };
