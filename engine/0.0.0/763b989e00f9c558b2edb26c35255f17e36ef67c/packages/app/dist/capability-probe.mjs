// src/execution/capability-probe.ts
postMessage({
  workerAnimationFrame: typeof requestAnimationFrame === "function",
  workerWebGpu: typeof navigator === "object" && navigator.gpu !== void 0,
  atomicsWait: typeof Atomics === "object" && typeof Atomics.wait === "function"
});
