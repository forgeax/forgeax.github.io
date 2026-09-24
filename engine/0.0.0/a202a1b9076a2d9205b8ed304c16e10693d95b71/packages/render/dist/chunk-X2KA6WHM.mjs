import { defineComponent } from '../../ecs/dist/index.mjs';

// src/components/glyph-text.ts
var GlyphText = defineComponent("GlyphText", {
  // The layout/render owner re-resolves the font asset on the target world;
  // authoring text and style remain portable simulation state.
  fontHandle: {
    type: "shared<FontAsset>",
    default: 0,
    simulationTransient: true
  },
  text: { type: "string", default: "" },
  fontSize: { type: "f32", default: 16 },
  // color carries an explicit layer-2 default [1,1,1,1] (opaque white); the
  // array layer-3 fallback is all-zero, so the default MUST be explicit (D-5).
  color: { type: "array<f32, 4>", default: new Float32Array([1, 1, 1, 1]) }
});
var SpriteAnimation = defineComponent("SpriteAnimation", {
  frameCount: { type: "u32" },
  frameDuration: { type: "f32" },
  currentFrame: { type: "u32", transient: true },
  accumDt: { type: "f32", transient: true },
  regions: { type: "array<f32>" },
  playbackMode: { type: "u32" }
});
var SpriteInstances = defineComponent("SpriteInstances", {
  transforms: { type: "array<f32>" },
  regions: { type: "array<f32>" }
});

// src/components/sprite-playback-mode.ts
var SPRITE_PLAYBACK_MODE_LOOP = 0;
var SPRITE_PLAYBACK_MODE_CLAMP = 1;
var SpritePlayback = Object.freeze({
  loop: SPRITE_PLAYBACK_MODE_LOOP,
  clamp: SPRITE_PLAYBACK_MODE_CLAMP
});
function spritePlaybackModeFromU32(value) {
  return value === SPRITE_PLAYBACK_MODE_CLAMP ? "clamp" : "loop";
}
var SpriteRegionOverride = defineComponent("SpriteRegionOverride", {
  region: { type: "array<f32, 4>" }
});
var TilemapSort = Object.freeze({
  layer: 0,
  perCell: 1
});
function decodeSortScope(raw) {
  return raw === 1 ? "per-cell" : "layer";
}
var TileLayer = defineComponent("TileLayer", {
  tiles: { type: "array<u32>" },
  layerOrder: { type: "i32", default: 0 },
  dirty: { type: "u8", default: 0 },
  sortScope: { type: "u8", default: 0 }
});
var Tilemap = defineComponent("Tilemap", {
  cols: { type: "u32", default: 0 },
  rows: { type: "u32", default: 0 },
  // tileSize carries an explicit layer-2 default [1,1] (unit cell); the array
  // layer-3 fallback is all-zero, so the default MUST be explicit (D-5).
  tileSize: { type: "array<f32, 2>", default: new Float32Array([1, 1]) },
  chunkSize: { type: "u32", default: 16 },
  tileset: { type: "string" }
});

// src/systems/active-camera.ts
var ACTIVE_CAMERA_KEY = "ActiveCamera";
function getActiveCamera(world) {
  if (!world.hasResource(ACTIVE_CAMERA_KEY)) return void 0;
  return world.getResource(ACTIVE_CAMERA_KEY);
}
function setActiveCamera(world, entity) {
  world.insertResource(ACTIVE_CAMERA_KEY, { entity });
}
function selectActiveCameraIndex(cameraEntities, activeEntity) {
  if (activeEntity === void 0) return -1;
  return cameraEntities.indexOf(activeEntity);
}

export { GlyphText, SpriteAnimation, SpriteInstances, SpritePlayback, SpriteRegionOverride, TileLayer, Tilemap, TilemapSort, decodeSortScope, getActiveCamera, selectActiveCameraIndex, setActiveCamera, spritePlaybackModeFromU32 };
