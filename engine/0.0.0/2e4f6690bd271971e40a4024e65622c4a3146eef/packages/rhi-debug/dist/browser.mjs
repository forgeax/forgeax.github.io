import { err, ok } from '../../types/dist/index.mjs';

// src/browser.ts
function browserCaptureProvider(attachment) {
  return attachment;
}
async function captureAndUpload(provider, options = {}) {
  const captureOptions = mergeCaptureOptions(options.capture, options.signal);
  const captured = await provider.captureFrame(captureOptions);
  if (!captured.ok) return captured;
  return uploadTape(captured.value, options);
}
async function uploadTape(tape, options = {}) {
  const endpoint = options.endpoint ?? "/__forgeax-debug/tape";
  const runId = options.runId ?? createRunId();
  const url = `${endpoint}?runId=${encodeURIComponent(runId)}`;
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/x-forgeax-rhitape" },
      body: copyBytes(tape.bytes),
      ...options.signal === void 0 ? {} : { signal: options.signal }
    });
  } catch {
    return err({
      code: "browser-capture-transport-unavailable",
      expected: "the configured RHI tape endpoint to accept a browser upload",
      hint: "start the Vite RHI-debug transport or provide a reachable endpoint",
      detail: { endpoint }
    });
  }
  if (!response.ok) {
    return err({
      code: "browser-capture-upload-failed",
      expected: "the RHI tape endpoint to accept the validated artifact",
      hint: "inspect the endpoint response and retry one capture",
      detail: { endpoint, status: response.status }
    });
  }
  let value;
  try {
    value = await response.json();
  } catch (cause) {
    return err({
      code: "browser-capture-response-invalid",
      expected: "the RHI tape endpoint to return a JSON artifact reference",
      hint: "check the dev transport response body before retrying",
      detail: { endpoint, cause: String(cause) }
    });
  }
  if (!isArtifactRef(value)) {
    return err({
      code: "browser-capture-response-invalid",
      expected: "the RHI tape endpoint to return a rhi-tape artifact reference",
      hint: "check the endpoint contract and capture again",
      detail: { endpoint, cause: "response is not a rhi-tape artifact reference" }
    });
  }
  return ok(value);
}
function mergeCaptureOptions(capture, signal) {
  if (capture === void 0 && signal === void 0) return void 0;
  return { ...capture, ...signal === void 0 ? {} : { signal } };
}
function createRunId() {
  const randomUUID = globalThis.crypto?.randomUUID;
  return randomUUID === void 0 ? `rhi-capture-${Date.now().toString(36)}` : `rhi-capture-${randomUUID()}`;
}
function copyBytes(bytes) {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}
function isArtifactRef(value) {
  if (value === null || typeof value !== "object") return false;
  const candidate = value;
  return candidate.kind === "rhi-tape" && typeof candidate.digest === "string" && (candidate.path === void 0 || typeof candidate.path === "string");
}

export { browserCaptureProvider, captureAndUpload, uploadTape };
