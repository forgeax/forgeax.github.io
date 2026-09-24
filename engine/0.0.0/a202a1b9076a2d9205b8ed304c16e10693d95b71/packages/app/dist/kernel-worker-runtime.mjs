// src/execution/kernel-worker-runtime.ts
var scope = globalThis;
var loadedKernels = /* @__PURE__ */ new Map();
async function loadKernel(moduleUrl) {
  const module = await import(
    /* @vite-ignore */
    moduleUrl
  );
  const candidate = module.default ?? module;
  if (typeof candidate.run !== "function") {
    throw new TypeError("SharedKernel module default export has no run function.");
  }
  return candidate;
}
function spanFromBinding(binding) {
  return {
    entities: binding.entities,
    length: binding.length,
    get(component) {
      const fields = binding.read[component.name];
      if (fields === void 0)
        throw new Error(`Kernel read access is not declared for ${component.name}.`);
      return fields;
    },
    mut(component) {
      const fields = binding.write[component.name];
      if (fields === void 0)
        throw new Error(`Kernel write access is not declared for ${component.name}.`);
      return fields;
    }
  };
}
scope.onmessage = (event) => {
  const job = event.data;
  if (job.kind === "kernel-init") {
    Atomics.add(job.ready, 0, 1);
    Atomics.notify(job.ready, 0);
    return;
  }
  if (job.kind === "kernel-preload") {
    void loadKernel(job.moduleUrl).then((kernel) => {
      loadedKernels.set(job.moduleUrl, kernel);
      Atomics.store(job.status, job.jobIndex, 1);
    }).catch(() => {
      Atomics.store(job.status, job.jobIndex, -1);
    }).finally(() => {
      Atomics.add(job.control, 0, 1);
      Atomics.notify(job.control, 0);
    });
    return;
  }
  if (job.kind !== "kernel-job") return;
  try {
    const kernel = loadedKernels.get(job.moduleUrl);
    if (kernel === void 0) {
      throw new Error(`SharedKernel module was not preloaded: ${job.moduleUrl}`);
    }
    const returned = kernel.run([spanFromBinding(job.binding)]);
    if (returned instanceof Promise) throw new TypeError("SharedKernel run must be synchronous.");
    Atomics.store(job.status, job.jobIndex, 1);
  } catch {
    Atomics.store(job.status, job.jobIndex, -1);
  } finally {
    Atomics.add(job.control, 0, 1);
    Atomics.notify(job.control, 0);
  }
};
