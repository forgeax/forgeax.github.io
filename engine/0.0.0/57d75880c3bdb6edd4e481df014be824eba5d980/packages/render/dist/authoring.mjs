export { GlyphText, SpriteAnimation, SpriteInstances, SpritePlayback, SpriteRegionOverride, TileLayer, Tilemap, TilemapSort, setActiveCamera, spritePlaybackModeFromU32 } from './chunk-X2KA6WHM.mjs';
export { SPRITE_PREMULTIPLIED_ALPHA_BLEND, TransparentSort } from './chunk-GNJVHYWM.mjs';
import { ok } from '../../types/dist/index.mjs';

function createFullscreenRenderFeature(options) {
  const resourceName = `fullscreen.${options.identity.replace(/[^a-z0-9.-]/gi, "-").toLowerCase()}`;
  return Object.freeze({
    identity: options.identity,
    requiredFullscreenPostProcesses: Object.freeze([
      Object.freeze({ identity: options.identity, source: options.source })
    ]),
    extract: (_context) => ok(void 0),
    plan: (_data, _context) => ok({
      resources: [
        {
          kind: "fullscreen-program",
          name: resourceName,
          source: options.source,
          ...options.reads === void 0 ? {} : { reads: options.reads },
          ...options.params === void 0 ? {} : { params: options.params }
        }
      ],
      passes: []
    })
  });
}

export { createFullscreenRenderFeature };
