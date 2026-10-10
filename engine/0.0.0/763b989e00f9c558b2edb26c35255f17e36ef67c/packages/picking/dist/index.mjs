import { vec2, box3, ray, vec3, mat4 } from '../../math/dist/index.mjs';
import { MeshFilter, MeshRenderer, mapDisplayToScene, Instances, Camera, cameraProjectionFromF32, mapSceneToDisplay } from '../../render/dist/index.mjs';
import { resolveAssetHandle } from '../../assets-runtime/dist/index.mjs';
import { Transform, GlobalTransform, ChildOf } from '../../scene/dist/index.mjs';
import { toShared, err, ok } from '../../types/dist/index.mjs';
import { Entity } from '../../ecs/dist/index.mjs';
import { Tilemap, TileLayer } from '../../render/dist/authoring.mjs';

// src/display-picking.ts

// src/pick-errors.ts
var PickError = class extends Error {
  code = "camera-component-missing";
  expected;
  hint;
  detail;
  constructor(cameraEntity) {
    const expected = "cameraEntity holds a Camera component";
    const hint = `cameraEntity ${cameraEntity} has no Camera component; spawn or attach one before picking, e.g. world.set(cameraEntity, Camera, { fov: Math.PI / 4, aspect, near, far })`;
    super(`pick: cameraEntity ${cameraEntity} has no Camera component`);
    this.name = "PickError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { cameraEntity };
  }
};

// src/pick-core.ts
function readWorldMatrix(world, entity) {
  const result = world.get(entity, GlobalTransform);
  return result.ok ? new Float32Array(result.value.world) : void 0;
}
function computeScreenRayFromMatrices(screenX, screenY, viewportWidth, viewportHeight, viewMatrix, projectionMatrix, projectionKind) {
  if (!Number.isFinite(screenX) || !Number.isFinite(screenY) || !Number.isFinite(viewportWidth) || !Number.isFinite(viewportHeight) || viewportWidth <= 0 || viewportHeight <= 0 || viewMatrix.length !== 16 || projectionMatrix.length !== 16 || !Array.from(viewMatrix).every((value) => Number.isFinite(value)) || !Array.from(projectionMatrix).every((value) => Number.isFinite(value))) {
    return void 0;
  }
  const view = mat4.create();
  const proj = mat4.create();
  view.set(viewMatrix);
  proj.set(projectionMatrix);
  const r = ray.create();
  ray.screenToRay(r, screenX, screenY, viewportWidth, viewportHeight, view, proj, projectionKind);
  return { ray: r, view, proj, projectionKind };
}
function computeScreenRay(world, cameraEntity, screenX, screenY, viewportWidth, viewportHeight) {
  if (!Number.isFinite(viewportWidth) || !Number.isFinite(viewportHeight) || viewportWidth <= 0 || viewportHeight <= 0) {
    return void 0;
  }
  const camRes = world.get(cameraEntity, Camera);
  if (!camRes.ok) {
    throw new PickError(cameraEntity);
  }
  const cam = camRes.value;
  const camWorld = readWorldMatrix(world, cameraEntity);
  if (camWorld === void 0) {
    return void 0;
  }
  const view = mat4.create();
  mat4.invert(view, camWorld);
  const projectionKind = cameraProjectionFromF32(cam.projection);
  const proj = mat4.create();
  if (projectionKind === "orthographic") {
    mat4.orthographic(proj, cam.left, cam.right, cam.top, cam.bottom, cam.near, cam.far);
  } else {
    mat4.perspective(proj, cam.fov, cam.aspect, cam.near, cam.far);
  }
  const r = ray.create();
  ray.screenToRay(r, screenX, screenY, viewportWidth, viewportHeight, view, proj, projectionKind);
  return { ray: r, view, proj, projectionKind };
}

// src/pick.ts
function pick(world, cameraEntity, screenX, screenY, viewportWidth, viewportHeight) {
  const screenRay = computeScreenRay(
    world,
    cameraEntity,
    screenX,
    screenY,
    viewportWidth,
    viewportHeight
  );
  if (screenRay === void 0) return void 0;
  return pickWithScreenRay(world, screenRay);
}
function pickWithScreenRay(world, screenRay) {
  const r = screenRay.ray;
  const query = world.query({ read: [Transform, GlobalTransform, MeshFilter, MeshRenderer] }).unwrap();
  const worldAabb = box3.create();
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestEntity;
  for (const row of query) {
    const assetHandleRaw = Math.round(row.get(MeshFilter).assetHandle);
    if (assetHandleRaw === 0) continue;
    const meshRes = resolveAssetHandle(world, toShared(assetHandleRaw));
    if (!meshRes.ok) continue;
    const localAabb = meshRes.value.aabb;
    if (localAabb === void 0) continue;
    if (localAabb[0] > localAabb[3]) continue;
    const entity = row.entity;
    const entityWorld = readWorldMatrix(world, entity);
    if (entityWorld === void 0) continue;
    box3.transformBox3(
      worldAabb,
      localAabb,
      entityWorld
    );
    const result = ray.rayAabbIntersects(r, worldAabb);
    if (result.hit && result.tmin < bestDistance) {
      bestDistance = result.tmin;
      bestEntity = entity;
    }
  }
  if (bestEntity === void 0) return void 0;
  const origin = vec3.create();
  const dir = vec3.create();
  ray.getOrigin(origin, r);
  ray.getDirection(dir, r);
  const point = vec3.create(
    origin[0] + dir[0] * bestDistance,
    origin[1] + dir[1] * bestDistance,
    origin[2] + dir[2] * bestDistance
  );
  return { entity: bestEntity, point, distance: bestDistance };
}
var _scratchVec2 = vec2.create();
function pointToRayDist(px, py, pz, ox, oy, oz, dx, dy, dz) {
  const ex = px - ox;
  const ey = py - oy;
  const ez = pz - oz;
  const cx = ey * dz - ez * dy;
  const cy = ez * dx - ex * dz;
  const cz = ex * dy - ey * dx;
  return Math.sqrt(cx * cx + cy * cy + cz * cz);
}
function rayHitsWorldAabb(r, localAabb, worldMat) {
  if (localAabb[0] > localAabb[3]) return true;
  const corners = [
    [localAabb[0], localAabb[1], localAabb[2]],
    [localAabb[3], localAabb[1], localAabb[2]],
    [localAabb[0], localAabb[4], localAabb[2]],
    [localAabb[3], localAabb[4], localAabb[2]],
    [localAabb[0], localAabb[1], localAabb[5]],
    [localAabb[3], localAabb[1], localAabb[5]],
    [localAabb[0], localAabb[4], localAabb[5]],
    [localAabb[3], localAabb[4], localAabb[5]]
  ];
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  const tmpP = vec3.create();
  for (const c of corners) {
    mat4.transformPoint(tmpP, worldMat, c);
    const cx = tmpP[0];
    const cy = tmpP[1];
    const cz = tmpP[2];
    if (cx < minX) minX = cx;
    if (cy < minY) minY = cy;
    if (cz < minZ) minZ = cz;
    if (cx > maxX) maxX = cx;
    if (cy > maxY) maxY = cy;
    if (cz > maxZ) maxZ = cz;
  }
  const worldAabb = new Float32Array(6);
  worldAabb[0] = minX;
  worldAabb[1] = minY;
  worldAabb[2] = minZ;
  worldAabb[3] = maxX;
  worldAabb[4] = maxY;
  worldAabb[5] = maxZ;
  const aabbResult = ray.rayAabbIntersects(
    r,
    worldAabb
  );
  return aabbResult.hit;
}
function narrowPosition(positionAttr) {
  if (positionAttr instanceof Float32Array) {
    return positionAttr;
  }
  if (positionAttr instanceof ArrayBuffer) {
    return new Float32Array(positionAttr);
  }
  return void 0;
}
function collectVertexHits(world, cameraEntity, screenX, screenY, viewportWidth, viewportHeight, entity, screenRayOverride) {
  const screenRay = screenRayOverride ?? (void 0 );
  if (screenRay === void 0) {
    return [];
  }
  const { ray: r, view, proj } = screenRay;
  const viewProj = mat4.create();
  mat4.multiply(viewProj, proj, view);
  const rOx = r[0];
  const rOy = r[1];
  const rOz = r[2];
  const rDx = r[3];
  const rDy = r[4];
  const rDz = r[5];
  const mfRes = world.get(entity, MeshFilter);
  if (!mfRes.ok) {
    return [];
  }
  const meshRes = resolveAssetHandle(
    world,
    toShared(mfRes.value.assetHandle)
  );
  if (!meshRes.ok) {
    return [];
  }
  const mesh = meshRes.value;
  const positions = narrowPosition(mesh.attributes.position);
  if (positions === void 0 || positions.length < 3) {
    return [];
  }
  const entityWorld = readWorldMatrix(world, entity);
  if (entityWorld === void 0) {
    return [];
  }
  const attrs = mesh.attributes;
  const deformed = attrs !== void 0 && attrs.skinIndex !== void 0 && attrs.skinWeight !== void 0;
  const entityWMLike = entityWorld;
  if (mesh.aabb !== void 0 && !rayHitsWorldAabb(r, mesh.aabb, entityWMLike)) {
    return [];
  }
  const candidates = [];
  const seen = /* @__PURE__ */ new Set();
  const indices = mesh.indices;
  const submeshes = mesh.submeshes;
  const maxVertexIndex = Math.floor(positions.length / 3) - 1;
  const emitTriangleVertices = (i0, i1, i2) => {
    const ax = positions[i0 * 3 + 0];
    const ay = positions[i0 * 3 + 1];
    const az = positions[i0 * 3 + 2];
    const bx = positions[i1 * 3 + 0];
    const by = positions[i1 * 3 + 1];
    const bz = positions[i1 * 3 + 2];
    const cx = positions[i2 * 3 + 0];
    const cy = positions[i2 * 3 + 1];
    const cz = positions[i2 * 3 + 2];
    const worldA = vec3.create();
    const worldB = vec3.create();
    const worldC = vec3.create();
    mat4.transformPoint(worldA, entityWMLike, [ax, ay, az]);
    mat4.transformPoint(worldB, entityWMLike, [bx, by, bz]);
    mat4.transformPoint(worldC, entityWMLike, [cx, cy, cz]);
    const triResult = ray.rayTriangleIntersects(r, worldA, worldB, worldC);
    if (!triResult.hit) return;
    for (const [vi, lx, ly, lz] of [
      [i0, ax, ay, az],
      [i1, bx, by, bz],
      [i2, cx, cy, cz]
    ]) {
      if (Number.isNaN(lx) || Number.isNaN(ly) || Number.isNaN(lz)) continue;
      if (!Number.isFinite(lx) || !Number.isFinite(ly) || !Number.isFinite(lz)) continue;
      const worldVec = vi === i0 ? worldA : vi === i1 ? worldB : worldC;
      const wx = worldVec[0];
      const wy = worldVec[1];
      const wz = worldVec[2];
      const screenRes = ray.worldToScreen(
        _scratchVec2,
        [wx, wy, wz],
        viewProj,
        viewportWidth,
        viewportHeight
      );
      if (screenRes.behind) continue;
      if (seen.has(vi)) continue;
      seen.add(vi);
      const sx = _scratchVec2[0];
      const sy = _scratchVec2[1];
      const sdx = sx - screenX;
      const sdy = sy - screenY;
      const screenDist = Math.sqrt(sdx * sdx + sdy * sdy);
      const worldDist = pointToRayDist(wx, wy, wz, rOx, rOy, rOz, rDx, rDy, rDz);
      candidates.push({
        entity,
        vertexIndex: vi,
        worldPos: [wx, wy, wz],
        screenDist,
        worldDist,
        deformed
      });
    }
  };
  for (const submesh of submeshes) {
    if (submesh.topology !== "triangle-list") continue;
    const idxOffset = submesh.indexOffset;
    const idxCount = submesh.indexCount;
    if (indices !== void 0 && indices.length > 0 && idxCount > 0) {
      const triCount = Math.floor(idxCount / 3);
      for (let ti = 0; ti < triCount; ti++) {
        const i0 = indices[idxOffset + ti * 3 + 0];
        const i1 = indices[idxOffset + ti * 3 + 1];
        const i2 = indices[idxOffset + ti * 3 + 2];
        if (i0 > maxVertexIndex || i1 > maxVertexIndex || i2 > maxVertexIndex) continue;
        emitTriangleVertices(i0, i1, i2);
      }
    } else {
      const submeshVertexCount = submesh.vertexCount;
      const triCount = Math.floor(submeshVertexCount / 3);
      for (let ti = 0; ti < triCount; ti++) {
        const i0 = ti * 3;
        const i1 = ti * 3 + 1;
        const i2 = ti * 3 + 2;
        if (i0 > maxVertexIndex || i1 > maxVertexIndex || i2 > maxVertexIndex) continue;
        emitTriangleVertices(i0, i1, i2);
      }
    }
  }
  return candidates;
}
function pickVertexOnEntity(world, cameraEntity, screenX, screenY, viewportWidth, viewportHeight, entity, options) {
  return pickVertexOnEntityWithScreenRay(
    world,
    computeScreenRay(world, cameraEntity, screenX, screenY, viewportWidth, viewportHeight),
    screenX,
    screenY,
    viewportWidth,
    viewportHeight,
    entity,
    options
  );
}
function pickVertexOnEntityWithScreenRay(world, screenRay, screenX, screenY, viewportWidth, viewportHeight, entity, options) {
  if (screenRay === void 0) return options === void 0 ? void 0 : [];
  const candidates = collectVertexHits(
    world,
    void 0,
    screenX,
    screenY,
    viewportWidth,
    viewportHeight,
    entity,
    screenRay
  );
  candidates.sort((a, b) => a.screenDist - b.screenDist);
  const limit = options?.limit;
  if (limit !== void 0) {
    return candidates.slice(0, limit);
  }
  return candidates[0];
}
function pickVertex(world, cameraEntity, screenX, screenY, viewportWidth, viewportHeight, options) {
  const screenRay = computeScreenRay(
    world,
    cameraEntity,
    screenX,
    screenY,
    viewportWidth,
    viewportHeight
  );
  return pickVertexFromScreenRay(
    world,
    screenRay,
    screenX,
    screenY,
    viewportWidth,
    viewportHeight,
    options
  );
}
function pickVertexWithScreenRay(world, screenRay, screenX, screenY, viewportWidth, viewportHeight, options) {
  return pickVertexFromScreenRay(
    world,
    screenRay,
    screenX,
    screenY,
    viewportWidth,
    viewportHeight,
    options
  );
}
function pickVertexFromScreenRay(world, screenRay, screenX, screenY, viewportWidth, viewportHeight, options) {
  if (screenRay === void 0) {
    if (options) return [];
    return void 0;
  }
  const r = screenRay.ray;
  const query = world.query({ read: [Transform, GlobalTransform, MeshFilter, MeshRenderer] }).unwrap();
  const allCandidates = [];
  for (const row of query) {
    const assetHandleRaw = Math.round(row.get(MeshFilter).assetHandle);
    if (assetHandleRaw === 0) continue;
    const meshRes = resolveAssetHandle(world, toShared(assetHandleRaw));
    if (!meshRes.ok) continue;
    const entity = row.entity;
    const entityWorld = readWorldMatrix(world, entity);
    if (entityWorld === void 0) continue;
    const mesh = meshRes.value;
    if (mesh.aabb !== void 0 && !rayHitsWorldAabb(r, mesh.aabb, entityWorld)) {
      continue;
    }
    const entityHits = collectVertexHits(
      world,
      void 0,
      screenX,
      screenY,
      viewportWidth,
      viewportHeight,
      entity,
      screenRay
    );
    for (const h of entityHits) {
      allCandidates.push(h);
    }
  }
  allCandidates.sort((a, b) => a.screenDist - b.screenDist);
  const limit = options?.limit;
  if (limit !== void 0) {
    return allCandidates.slice(0, limit);
  }
  return allCandidates[0];
}

// src/display-picking.ts
function displayToScenePixel(out, mapping, displayX, displayY) {
  if (mapping === void 0) return false;
  return mapDisplayToScene(out, mapping, displayX, displayY);
}
function submittedExtent(mapping, viewportWidth, viewportHeight) {
  if (mapping === void 0) return void 0;
  if (!Number.isFinite(mapping.width) || !Number.isFinite(mapping.height) || mapping.width <= 0 || mapping.height <= 0 || !Number.isFinite(viewportWidth) || !Number.isFinite(viewportHeight) || viewportWidth !== mapping.width || viewportHeight !== mapping.height) {
    return void 0;
  }
  return { width: mapping.width, height: mapping.height };
}
function computeDisplayScreenRay(world, cameraEntity, displayX, displayY, mapping, viewportWidth, viewportHeight) {
  const extent = submittedExtent(mapping, viewportWidth, viewportHeight);
  if (extent === void 0 || !Number.isFinite(displayX) || !Number.isFinite(displayY) || displayX < 0 || displayX > extent.width || displayY < 0 || displayY > extent.height) {
    return void 0;
  }
  const scene = { x: 0, y: 0 };
  if (!displayToScenePixel(scene, mapping, displayX, displayY)) return void 0;
  return computeSceneScreenRay(scene.x, scene.y, mapping);
}
function computeSceneScreenRay(sceneX, sceneY, mapping) {
  if (mapping === void 0 || mapping.camera === void 0) return void 0;
  const camera = mapping.camera;
  const submitted = mapping;
  return computeScreenRayFromMatrices(
    sceneX,
    sceneY,
    submitted.width,
    submitted.height,
    camera.viewMatrix,
    camera.projectionMatrix,
    camera.projection
  );
}
function pickDisplay(world, displayX, displayY, mapping, viewportWidth, viewportHeight) {
  const extent = submittedExtent(mapping, viewportWidth, viewportHeight);
  if (extent === void 0 || !Number.isFinite(displayX) || !Number.isFinite(displayY) || displayX < 0 || displayX > extent.width || displayY < 0 || displayY > extent.height) {
    return void 0;
  }
  const scene = { x: 0, y: 0 };
  if (!displayToScenePixel(scene, mapping, displayX, displayY)) return void 0;
  const screenRay = computeSceneScreenRay(scene.x, scene.y, mapping);
  if (screenRay === void 0) return void 0;
  return pickWithScreenRay(world, screenRay);
}
function remapVertexHits(hits, displayX, displayY, mapping, screenRay, viewportWidth, viewportHeight, radius) {
  const viewProj = mat4.create();
  mat4.multiply(viewProj, screenRay.proj, screenRay.view);
  const scenePoint = vec2.create();
  const displayPoint = { x: 0, y: 0 };
  const remapped = [];
  for (const hit of hits) {
    const projected = ray.worldToScreen(
      scenePoint,
      hit.worldPos,
      viewProj,
      viewportWidth,
      viewportHeight
    );
    if (projected.behind) continue;
    if (mapping === void 0 || !mapSceneToDisplay(displayPoint, mapping, scenePoint[0], scenePoint[1]))
      continue;
    const dx = displayPoint.x - displayX;
    const dy = displayPoint.y - displayY;
    const screenDist = Math.hypot(dx, dy);
    if (radius !== void 0 && (!Number.isFinite(radius) || screenDist > radius)) continue;
    remapped.push({ ...hit, screenDist });
  }
  remapped.sort((left, right) => left.screenDist - right.screenDist);
  return remapped;
}
function displayVertexQuery(displayX, displayY, mapping, viewportWidth, viewportHeight) {
  const extent = submittedExtent(mapping, viewportWidth, viewportHeight);
  if (extent === void 0 || !Number.isFinite(displayX) || !Number.isFinite(displayY) || displayX < 0 || displayX > extent.width || displayY < 0 || displayY > extent.height) {
    return void 0;
  }
  const scene = { x: 0, y: 0 };
  if (!displayToScenePixel(scene, mapping, displayX, displayY)) return void 0;
  return scene;
}
function pickVertexDisplay(world, _cameraEntity, displayX, displayY, mapping, viewportWidth, viewportHeight, options) {
  const scene = displayVertexQuery(displayX, displayY, mapping, viewportWidth, viewportHeight);
  if (scene === void 0) return options === void 0 ? void 0 : [];
  const screenRay = computeSceneScreenRay(scene.x, scene.y, mapping);
  if (screenRay === void 0) return options === void 0 ? void 0 : [];
  const extent = mapping === void 0 ? void 0 : { width: mapping.width, height: mapping.height };
  if (extent === void 0) return options === void 0 ? void 0 : [];
  const hitResult = pickVertexWithScreenRay(
    world,
    screenRay,
    scene.x,
    scene.y,
    extent.width,
    extent.height,
    {
      limit: Number.MAX_SAFE_INTEGER
    }
  );
  const hits = Array.isArray(hitResult) ? hitResult : [];
  const remapped = remapVertexHits(
    hits,
    displayX,
    displayY,
    mapping,
    screenRay,
    extent.width,
    extent.height,
    options?.radius
  );
  return options === void 0 ? remapped[0] : options.limit === void 0 ? remapped : remapped.slice(0, options.limit);
}
function pickVertexOnEntityDisplay(world, _cameraEntity, displayX, displayY, mapping, viewportWidth, viewportHeight, entity, options) {
  const scene = displayVertexQuery(displayX, displayY, mapping, viewportWidth, viewportHeight);
  if (scene === void 0) return options === void 0 ? void 0 : [];
  const screenRay = computeSceneScreenRay(scene.x, scene.y, mapping);
  if (screenRay === void 0) return options === void 0 ? void 0 : [];
  const extent = mapping === void 0 ? void 0 : { width: mapping.width, height: mapping.height };
  if (extent === void 0) return options === void 0 ? void 0 : [];
  const hitResult = pickVertexOnEntityWithScreenRay(
    world,
    screenRay,
    scene.x,
    scene.y,
    extent.width,
    extent.height,
    entity,
    { limit: Number.MAX_SAFE_INTEGER }
  );
  const hits = Array.isArray(hitResult) ? hitResult : [];
  const remapped = remapVertexHits(
    hits,
    displayX,
    displayY,
    mapping,
    screenRay,
    extent.width,
    extent.height,
    options?.radius
  );
  return options === void 0 ? remapped[0] : options.limit === void 0 ? remapped : remapped.slice(0, options.limit);
}
function pickTile(world, tilemapEntity, worldX, worldY) {
  const entityResult = world.get(tilemapEntity, Entity);
  if (!entityResult.ok) {
    return err({ code: "tilemap-not-found", tilemapEntity });
  }
  const tilemapResult = world.get(tilemapEntity, Tilemap);
  if (!tilemapResult.ok) {
    return err({ code: "tilemap-component-missing", tilemapEntity });
  }
  const tilemap = tilemapResult.value;
  const cols = tilemap.cols;
  const rows = tilemap.rows;
  const tileSizeX = tilemap.tileSize[0] ?? 1;
  const tileSizeY = tilemap.tileSize[1] ?? 1;
  let localX = worldX;
  let localY = worldY;
  const transformResult = world.get(tilemapEntity, GlobalTransform);
  if (transformResult.ok) {
    const w = transformResult.value.world;
    if (w !== void 0 && w.length >= 16) {
      const local = mat4.transformPoint(vec3.create(), mat4.invert(mat4.create(), w), [
        worldX,
        worldY,
        0
      ]);
      localX = local[0] ?? 0;
      localY = local[1] ?? 0;
    }
  }
  if (tileSizeX <= 0 || tileSizeY <= 0) return ok(null);
  if (localX < 0 || localY < 0) return ok(null);
  const cellX = Math.floor(localX / tileSizeX);
  const cellY = Math.floor(localY / tileSizeY);
  if (cellX < 0 || cellY < 0 || cellX >= cols || cellY >= rows) return ok(null);
  const layers = [];
  const layerQuery = world.query({ read: [TileLayer, ChildOf] }).unwrap();
  for (const row of layerQuery) {
    const layerEntity = row.entity;
    const parent = row.get(ChildOf).parent;
    if (parent !== tilemapEntity) continue;
    const layerData = world.get(layerEntity, TileLayer);
    if (!layerData.ok) continue;
    layers.push({
      entity: layerEntity,
      tiles: layerData.value.tiles,
      layerOrder: row.get(TileLayer).layerOrder
    });
  }
  layers.sort((a, b) => b.layerOrder - a.layerOrder);
  const cellIndex = cellY * cols + cellX;
  for (const layer of layers) {
    if (cellIndex >= layer.tiles.length) continue;
    const tileId = layer.tiles[cellIndex] ?? 0;
    if (tileId !== 0) {
      return ok({
        layerEntity: layer.entity,
        cellX,
        cellY,
        tileId
      });
    }
  }
  return ok(null);
}
function narrowPosition2(position) {
  if (position instanceof Float32Array) return position;
  if (position instanceof ArrayBuffer) return new Float32Array(position);
  return void 0;
}
function worldAabbHit(screenRay, aabb, worldMatrix) {
  if (aabb === void 0 || aabb[0] > aabb[3]) return true;
  const corners = [
    [aabb[0], aabb[1], aabb[2]],
    [aabb[3], aabb[1], aabb[2]],
    [aabb[0], aabb[4], aabb[2]],
    [aabb[3], aabb[4], aabb[2]],
    [aabb[0], aabb[1], aabb[5]],
    [aabb[3], aabb[1], aabb[5]],
    [aabb[0], aabb[4], aabb[5]],
    [aabb[3], aabb[4], aabb[5]]
  ];
  const world = vec3.create();
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (const corner of corners) {
    mat4.transformPoint(world, worldMatrix, corner);
    minX = Math.min(minX, world[0]);
    minY = Math.min(minY, world[1]);
    minZ = Math.min(minZ, world[2]);
    maxX = Math.max(maxX, world[0]);
    maxY = Math.max(maxY, world[1]);
    maxZ = Math.max(maxZ, world[2]);
  }
  return ray.rayAabbIntersects(screenRay, [minX, minY, minZ, maxX, maxY, maxZ]).hit;
}
function pointOnRay(screenRay, point) {
  const dx = point[0] - screenRay[0];
  const dy = point[1] - screenRay[1];
  const dz = point[2] - screenRay[2];
  return dx * screenRay[3] + dy * screenRay[4] + dz * screenRay[5];
}
function pickTriangle(world, cameraEntity, screenX, screenY, viewportWidth, viewportHeight, options = {}) {
  const screen = computeScreenRay(
    world,
    cameraEntity,
    screenX,
    screenY,
    viewportWidth,
    viewportHeight
  );
  if (screen === void 0) return { status: "miss", precision: "triangle" };
  const origin = screen.ray;
  const query = world.query({
    read: [Transform, GlobalTransform, MeshFilter, MeshRenderer],
    optional: [Instances]
  }).unwrap();
  let best;
  let unsupportedReason;
  const unsupportedEntities = [];
  for (const row of query) {
    const rawHandle = Math.round(row.get(MeshFilter).assetHandle);
    if (rawHandle === 0) continue;
    const resolved = resolveAssetHandle(world, toShared(rawHandle));
    if (!resolved.ok) continue;
    const mesh = resolved.value;
    const entity = row.entity;
    const entityWorldMatrix = readWorldMatrix(world, entity);
    if (entityWorldMatrix === void 0) continue;
    const instancesData = row.get(Instances);
    let instanceTransforms;
    let instanceCount = 1;
    if (instancesData !== void 0) {
      instanceTransforms = instancesData.transforms;
      if (instanceTransforms.length % 16 !== 0 || !instanceTransforms.every(Number.isFinite)) {
        unsupportedReason ??= "instance-transforms-unavailable";
        unsupportedEntities.push(entity);
        continue;
      }
      instanceCount = instanceTransforms.length / 16;
    }
    const positions = narrowPosition2(mesh.attributes.position);
    const skinned = mesh.attributes.skinIndex !== void 0 && mesh.attributes.skinWeight !== void 0;
    if (skinned) {
      let intersects = false;
      for (let instanceIndex = 0; instanceIndex < instanceCount; instanceIndex += 1) {
        const drawWorld = instanceTransforms === void 0 ? entityWorldMatrix : mat4.multiply(
          mat4.create(),
          entityWorldMatrix,
          instanceTransforms.subarray(instanceIndex * 16, instanceIndex * 16 + 16)
        );
        if (worldAabbHit(origin, mesh.aabb, drawWorld)) {
          intersects = true;
          break;
        }
      }
      if (!intersects) continue;
      unsupportedReason ??= "skinned-pose-unavailable";
      unsupportedEntities.push(entity);
      continue;
    }
    if (positions === void 0 || positions.length < 3) {
      let intersects = false;
      for (let instanceIndex = 0; instanceIndex < instanceCount; instanceIndex += 1) {
        const drawWorld = instanceTransforms === void 0 ? entityWorldMatrix : mat4.multiply(
          mat4.create(),
          entityWorldMatrix,
          instanceTransforms.subarray(instanceIndex * 16, instanceIndex * 16 + 16)
        );
        if (worldAabbHit(origin, mesh.aabb, drawWorld)) {
          intersects = true;
          break;
        }
      }
      if (!intersects) continue;
      unsupportedReason ??= "cpu-geometry-unavailable";
      unsupportedEntities.push(entity);
      continue;
    }
    for (let instanceIndex = 0; instanceIndex < instanceCount; instanceIndex += 1) {
      const drawWorld = instanceTransforms === void 0 ? entityWorldMatrix : mat4.multiply(
        mat4.create(),
        entityWorldMatrix,
        instanceTransforms.subarray(instanceIndex * 16, instanceIndex * 16 + 16)
      );
      if (!worldAabbHit(origin, mesh.aabb, drawWorld)) continue;
      const worldA = vec3.create();
      const worldB = vec3.create();
      const worldC = vec3.create();
      const worldPoint = vec3.create();
      let triangleIndex = 0;
      const indices = mesh.indices;
      const maxVertex = Math.floor(positions.length / 3) - 1;
      const test = (i0, i1, i2, index) => {
        if (i0 < 0 || i1 < 0 || i2 < 0 || i0 > maxVertex || i1 > maxVertex || i2 > maxVertex)
          return;
        const a = [
          positions[i0 * 3],
          positions[i0 * 3 + 1],
          positions[i0 * 3 + 2]
        ];
        const b = [
          positions[i1 * 3],
          positions[i1 * 3 + 1],
          positions[i1 * 3 + 2]
        ];
        const c = [
          positions[i2 * 3],
          positions[i2 * 3 + 1],
          positions[i2 * 3 + 2]
        ];
        mat4.transformPoint(worldA, drawWorld, a);
        mat4.transformPoint(worldB, drawWorld, b);
        mat4.transformPoint(worldC, drawWorld, c);
        const hit = ray.rayTriangleIntersects(origin, worldA, worldB, worldC);
        if (!hit.hit) return;
        worldPoint[0] = origin[0] + origin[3] * hit.t;
        worldPoint[1] = origin[1] + origin[4] * hit.t;
        worldPoint[2] = origin[2] + origin[5] * hit.t;
        const distance = pointOnRay(origin, worldPoint);
        if (!Number.isFinite(distance) || distance < 0 || best !== void 0 && distance >= best.distance)
          return;
        const assetGuid = options.assetGuidOf?.(mesh);
        best = {
          entity,
          triangleIndex: index,
          point: [worldPoint[0], worldPoint[1], worldPoint[2]],
          distance,
          barycentric: [1 - hit.u - hit.v, hit.u, hit.v],
          ...assetGuid === void 0 ? {} : { assetGuid },
          ...instanceTransforms === void 0 ? {} : { instanceIndex },
          precision: "triangle"
        };
      };
      for (const submesh of mesh.submeshes) {
        if (submesh.topology !== "triangle-list" && submesh.topology !== "triangle-strip") continue;
        const strip = submesh.topology === "triangle-strip";
        if (indices !== void 0 && indices.length > 0 && submesh.indexCount > 0) {
          const count = strip ? Math.max(0, submesh.indexCount - 2) : Math.floor(submesh.indexCount / 3);
          for (let localTriangle = 0; localTriangle < count; localTriangle += 1) {
            if (strip) {
              const base = submesh.indexOffset + localTriangle;
              const i0 = indices[base];
              const i1 = indices[base + 1];
              const i2 = indices[base + 2];
              if ((localTriangle & 1) === 0) test(i0, i1, i2, triangleIndex);
              else test(i2, i1, i0, triangleIndex);
            } else {
              const base = submesh.indexOffset + localTriangle * 3;
              test(
                indices[base],
                indices[base + 1],
                indices[base + 2],
                triangleIndex
              );
            }
            triangleIndex += 1;
          }
        } else {
          const count = strip ? Math.max(0, submesh.vertexCount - 2) : Math.floor(submesh.vertexCount / 3);
          for (let localTriangle = 0; localTriangle < count; localTriangle += 1) {
            if (strip) {
              const i0 = localTriangle;
              const i1 = localTriangle + 1;
              const i2 = localTriangle + 2;
              if ((localTriangle & 1) === 0) test(i0, i1, i2, triangleIndex);
              else test(i2, i1, i0, triangleIndex);
            } else {
              const base = localTriangle * 3;
              test(base, base + 1, base + 2, triangleIndex);
            }
            triangleIndex += 1;
          }
        }
      }
    }
  }
  if (unsupportedReason !== void 0) {
    return {
      status: "unavailable",
      precision: "unavailable",
      reason: unsupportedReason,
      entities: unsupportedEntities
    };
  }
  return best === void 0 ? { status: "miss", precision: "triangle" } : { status: "hit", hit: best };
}

// src/viewport-to-world.ts
function viewportToWorld(world, cameraEntity, screenX, screenY, viewportWidth, viewportHeight) {
  return computeScreenRay(world, cameraEntity, screenX, screenY, viewportWidth, viewportHeight)?.ray;
}

export { PickError, computeDisplayScreenRay, displayToScenePixel, pick, pickDisplay, pickTile, pickTriangle, pickVertex, pickVertexDisplay, pickVertexOnEntity, pickVertexOnEntityDisplay, viewportToWorld };
