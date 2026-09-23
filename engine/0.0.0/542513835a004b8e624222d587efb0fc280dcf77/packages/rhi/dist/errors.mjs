import { err, ok } from '../../types/dist/index.mjs';
export { err, ok } from '../../types/dist/index.mjs';

// src/errors.ts
var RhiError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`[RhiError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "RhiError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
  }
};
function validateDrawArgs(worldCount, owner) {
  if (worldCount === 0) {
    return err(
      new RhiError({
        code: "render-system-empty-worlds",
        expected: "worlds array has at least one world",
        hint: "pass at least one world: draw([world], { cameraOwner: 0, resourceOwner: 0 })"
      })
    );
  }
  const { cameraOwner, resourceOwner } = owner;
  const outOfRange = (index) => !Number.isInteger(index) || index < 0 || index >= worldCount;
  if (outOfRange(cameraOwner)) {
    return err(
      new RhiError({
        code: "render-system-owner-out-of-range",
        expected: "cameraOwner is an index into worlds (0 <= cameraOwner < worlds.length)",
        hint: "cameraOwner must be in 0..worlds.length-1; the cameraOwner world supplies the surfaced cameras",
        detail: { role: "camera", owner: cameraOwner, worldCount }
      })
    );
  }
  if (outOfRange(resourceOwner)) {
    return err(
      new RhiError({
        code: "render-system-owner-out-of-range",
        expected: "resourceOwner is an index into worlds (0 <= resourceOwner < worlds.length)",
        hint: "resourceOwner must be in 0..worlds.length-1; the resourceOwner world supplies skylight/skybox/postProcess",
        detail: { role: "resource", owner: resourceOwner, worldCount }
      })
    );
  }
  return ok(void 0);
}

export { RhiError, validateDrawArgs };
