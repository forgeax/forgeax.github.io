import { err, ok, parseConservativeAnimatedBounds, ImportError, IMPORT_ERROR_HINTS, readConservativeAnimatedBounds, reconcileMeshMaterialSlotTopology, resolveMeshMaterialSlotDefaultGuid } from '../../types/dist/index.mjs';
import { deriveConservativeAnimatedBounds } from '../../animation/dist/animated-bounds.mjs';
import { deriveAnimationTargetId } from '../../animation/dist/target-id.mjs';
import { packMeshBinV4 } from '../../import/dist/mesh-bin.mjs';
import { box3 } from '../../math/dist/index.mjs';
import { AssetGuid } from '../../pack/dist/guid.mjs';
import { deriveDefaultLodScreenCoverages, reconcileMeshLodMeta } from '../../import/dist/browser.mjs';

// src/errors.ts
var fbxErrorPolicy = {
  "fbx-mesh-type-unsupported": {
    expected: "all meshes in the file are polygon (triangles/quads), not NURBS or patch surfaces",
    hint: "NURBS and patch surfaces are not supported; convert to polygon mesh in a DCC tool before import"
  },
  "fbx-animation-target-invalid": {
    expected: "an acyclic hierarchy where every animation channel uniquely matches one named Scene node and stable target ID",
    hint: "name every node, keep the hierarchy acyclic, and export unique full animation target paths"
  },
  "fbx-lod-display-mode-unsupported": {
    expected: "FbxLODGroup display mode to preserve one selectable level per view",
    hint: "change the FbxLODGroup display mode to eLODGroup or remove the forced display mode before import"
  }
};
var FBX_ERROR_HINTS = Object.fromEntries(
  Object.entries(fbxErrorPolicy).map(([code, policy]) => [code, policy.hint])
);
function fbxErr(code, detail) {
  return {
    code,
    expected: fbxErrorPolicy[code].expected,
    hint: fbxErrorPolicy[code].hint,
    detail
  };
}

// src/parse-scene.ts
function buildFbxNodePaths(nodes) {
  const parents = /* @__PURE__ */ new Map();
  for (let index = 0; index < nodes.length; index++) {
    for (const child of nodes[index]?.children ?? []) parents.set(child, index);
  }
  return nodes.map((_, index) => {
    const reversed = [];
    const visited = /* @__PURE__ */ new Set();
    let current = index;
    while (current !== void 0) {
      if (visited.has(current)) {
        return { ok: false, reason: "hierarchy-cycle", nodeIndex: current };
      }
      visited.add(current);
      const name = nodes[current]?.name;
      if (name === void 0 || name.length === 0) {
        return { ok: false, reason: "name-missing", nodeIndex: current };
      }
      if (name.includes("/")) {
        return { ok: false, reason: "path-invalid", nodeIndex: current };
      }
      reversed.push(name);
      current = parents.get(current);
    }
    return { ok: true, value: reversed.reverse() };
  });
}
function parseScene(rawNodes) {
  const nodes = rawNodes.nodes ?? [];
  const entities = nodes.map((n) => ({
    name: n.name,
    transform: {
      translation: n.transform.translation,
      rotation: n.transform.rotation,
      scale: n.transform.scale
    },
    meshIndex: n.meshIndex >= 0 ? n.meshIndex : null,
    children: n.children
  }));
  return {
    entities,
    rootEntityIndex: 0
  };
}

// src/animated-bounds.ts
function deriveFbxAnimatedBounds(skeleton, doc, clips) {
  if (skeleton.bounds !== void 0) return skeleton;
  const rawNodes = doc.nodes ?? [];
  const paths = buildFbxNodePaths(rawNodes).map(
    (path) => path.ok ? path.value.join("/") : void 0
  );
  const parents = /* @__PURE__ */ new Map();
  for (let index = 0; index < rawNodes.length; index++)
    for (const child of rawNodes[index]?.children ?? []) parents.set(child, index);
  const nodes = rawNodes.map((node, index) => ({
    ...node.transform,
    parent: parents.get(index) ?? null
  }));
  const targetIds = paths.map(
    (path) => path === void 0 ? void 0 : deriveAnimationTargetId(path.split("/"))
  );
  const channels = clips.flatMap(
    (clip) => clip.channels.flatMap(
      (channel) => channel.property === "weights" ? [] : [
        {
          node: targetIds.indexOf(channel.targetId),
          property: channel.property,
          values: channel.sampler.output,
          interpolation: channel.sampler.interpolation
        }
      ]
    )
  );
  const meshes = [];
  for (const skin of doc.skins ?? []) {
    const rawMesh = doc.meshes?.find((mesh) => mesh.sourceIndex === skin.meshSourceIndex);
    if (rawMesh === void 0) return skeleton;
    const jointMap = skin.jointPaths.map((path) => skeleton.jointPaths.indexOf(path));
    if (jointMap.some((joint) => joint < 0)) return skeleton;
    const joints = skin.influences.flatMap(
      (influence) => [0, 1, 2, 3].map((lane) => jointMap[influence.jointIndices[lane] ?? 0] ?? -1)
    );
    const weights = skin.influences.flatMap(
      (influence) => [0, 1, 2, 3].map((lane) => influence.jointWeights[lane] ?? 0)
    );
    let maxMorphWeight = Math.max(0, ...(rawMesh.morphWeights ?? []).map(Math.abs));
    for (const clip of clips)
      for (const channel of clip.channels)
        if (channel.property === "weights")
          for (const weight of channel.sampler.output)
            maxMorphWeight = Math.max(maxMorphWeight, Math.abs(weight));
    const morphExtent = Float32Array.from(
      rawMesh.vertices.map(
        (_, index) => (rawMesh.morphTargets ?? []).reduce(
          (sum, target) => sum + Math.abs(target.position?.[index] ?? 0) * maxMorphWeight,
          0
        )
      )
    );
    let found = false;
    for (let index = 0; index < rawNodes.length; index++)
      if (rawNodes[index]?.meshIndex === skin.meshSourceIndex) {
        meshes.push({ node: index, positions: rawMesh.vertices, joints, weights, morphExtent });
        found = true;
      }
    if (!found) return skeleton;
  }
  const jointNodes = skeleton.jointPaths.map((path) => {
    const matches = rawNodes.flatMap(
      (node, index) => paths[index] === path || !path.includes("/") && node.name === path ? [index] : []
    );
    return matches.length === 1 ? matches[0] ?? -1 : -1;
  });
  if (jointNodes.some((node) => node < 0)) return skeleton;
  const bounds = deriveConservativeAnimatedBounds({
    nodes,
    channels,
    jointNodes,
    inverseBindMatrices: skeleton.inverseBindMatrices,
    meshes
  });
  return bounds === void 0 ? skeleton : { ...skeleton, bounds };
}

// src/lod/parse-lod-group.ts
function parseFbxLodGroup(input) {
  if (input.displayMode === "eShow" || input.displayMode === "eHide") {
    return err(fbxErr("fbx-lod-display-mode-unsupported", { displayMode: input.displayMode }));
  }
  const children = input.children ?? [];
  const forcedDisplay = children.find(
    (child) => child.display === "show" || child.display === "hide"
  )?.display;
  if (forcedDisplay !== void 0) {
    return err(
      fbxErr("fbx-lod-display-mode-unsupported", {
        displayMode: forcedDisplay === "show" ? "eShow" : "eHide"
      })
    );
  }
  const childMeshIndices = [];
  for (const child of children) {
    if (!Number.isInteger(child.meshIndex) || child.meshIndex < 0) {
      return err(fbxErr("fbx-lod-display-mode-unsupported", { displayMode: "eShow" }));
    }
    childMeshIndices.push(child.meshIndex);
  }
  if (childMeshIndices.length === 0) {
    return err(fbxErr("fbx-lod-display-mode-unsupported", { displayMode: "eShow" }));
  }
  const value = { childMeshIndices };
  const nativeDistances = children.flatMap(
    (child) => typeof child.distance === "number" && Number.isFinite(child.distance) ? [child.distance] : []
  );
  const nativeDisplays = children.flatMap(
    (child) => typeof child.display === "string" ? [child.display] : []
  );
  return ok({
    ...value,
    ...typeof input.threshold === "number" && Number.isFinite(input.threshold) ? { nativeThreshold: input.threshold } : {},
    ...typeof input.mode === "string" ? { nativeMode: input.mode } : {},
    ...nativeDistances.length === children.length ? { nativeDistances } : {},
    ...nativeDisplays.length === children.length ? { nativeDisplays } : {},
    ...typeof input.relative === "boolean" ? { relativeDistances: input.relative } : {},
    ...typeof input.displayMode === "string" ? { displayMode: input.displayMode } : {}
  });
}
var DEFAULT_FPS = 30;
function sampleStrided(keyTimes, keyValues, stride, t, out, rotation) {
  const n = keyTimes.length;
  if (n === 0) {
    for (let c = 0; c < stride; c++) out[c] = rotation && c === 3 ? 1 : 0;
    return;
  }
  const first = keyTimes[0];
  const lastIdx = n - 1;
  const last = keyTimes[lastIdx];
  if (t <= first) {
    for (let c = 0; c < stride; c++) out[c] = keyValues[c] ?? 0;
    return;
  }
  if (t >= last) {
    for (let c = 0; c < stride; c++) out[c] = keyValues[lastIdx * stride + c] ?? 0;
    return;
  }
  let i = 1;
  while (i < n && keyTimes[i] < t) i++;
  const t0 = keyTimes[i - 1];
  const t1 = keyTimes[i];
  const frac = t1 > t0 ? (t - t0) / (t1 - t0) : 0;
  const b0 = (i - 1) * stride;
  const b1 = i * stride;
  for (let c = 0; c < stride; c++) {
    const v0 = keyValues[b0 + c] ?? 0;
    const v1 = keyValues[b1 + c] ?? 0;
    out[c] = v0 + (v1 - v0) * frac;
  }
}
function buildSampler(ch, duration, fps) {
  const frameInterval = 1 / fps;
  const frameCount = Math.floor(duration * fps) + 1;
  const input = new Float32Array(frameCount);
  for (let f = 0; f < frameCount; f++) {
    input[f] = f * frameInterval;
  }
  const stride = ch.property === "rotation" ? 4 : ch.property === "weights" ? ch.weightCount ?? 0 : 3;
  if (ch.property === "weights" && (!Number.isInteger(stride) || stride < 1 || stride > 8)) {
    throw new Error("fbx-morph-invalid: weight channel count must be an integer in [1, 8]");
  }
  const output = new Float32Array(frameCount * stride);
  const keyTimes = ch.keyTimes ?? [];
  const keyValues = ch.keyValues ?? [];
  if (keyTimes.length > 0 && keyValues.length !== keyTimes.length * stride) {
    throw new Error("fbx-morph-invalid: animation key value width does not match key times");
  }
  const tmp = new Array(stride);
  for (let f = 0; f < frameCount; f++) {
    const t = input[f];
    sampleStrided(keyTimes, keyValues, stride, t, tmp, ch.property === "rotation");
    const base = f * stride;
    if (ch.property === "rotation") {
      const len = Math.hypot(tmp[0] ?? 0, tmp[1] ?? 0, tmp[2] ?? 0, tmp[3] ?? 0);
      const inv = len > 0 ? 1 / len : 0;
      output[base + 0] = (tmp[0] ?? 0) * inv;
      output[base + 1] = (tmp[1] ?? 0) * inv;
      output[base + 2] = (tmp[2] ?? 0) * inv;
      output[base + 3] = len > 0 ? (tmp[3] ?? 0) * inv : 1;
    } else {
      for (let c = 0; c < stride; c++) output[base + c] = tmp[c] ?? 0;
    }
  }
  return { input, output, interpolation: "LINEAR" };
}
function buildChannel(ch, duration, fps) {
  return {
    targetId: deriveAnimationTargetId(ch.targetNode.split("/")),
    property: ch.property,
    sampler: buildSampler(ch, duration, fps)
  };
}
function resolveAnimationTargetIds(nodes, clips) {
  const nodesByPath = /* @__PURE__ */ new Map();
  const nodePaths = buildFbxNodePaths(nodes);
  const cycle = nodePaths.find((path) => !path.ok && path.reason === "hierarchy-cycle");
  if (cycle && !cycle.ok) {
    return err(
      fbxErr("fbx-animation-target-invalid", {
        reason: "hierarchy-cycle",
        nodeIndex: cycle.nodeIndex
      })
    );
  }
  const hasAmbiguousName = nodePaths.some((path) => !path.ok);
  for (let index = 0; index < nodePaths.length; index++) {
    const result = nodePaths[index];
    if (result === void 0 || !result.ok) continue;
    const path = result.value.join("/");
    const matches = nodesByPath.get(path) ?? [];
    matches.push(index);
    nodesByPath.set(path, matches);
  }
  const pathById = /* @__PURE__ */ new Map();
  for (let clipIndex = 0; clipIndex < clips.length; clipIndex++) {
    const clip = clips[clipIndex];
    if (clip === void 0) continue;
    for (let channelIndex = 0; channelIndex < clip.channels.length; channelIndex++) {
      const channel = clip.channels[channelIndex];
      if (channel === void 0) continue;
      const segments = channel.targetNode.split("/");
      if (segments.some((segment) => segment.length === 0)) {
        return err(
          fbxErr("fbx-animation-target-invalid", {
            reason: "path-invalid",
            clipIndex,
            channelIndex,
            targetNode: channel.targetNode
          })
        );
      }
      const matches = nodesByPath.get(channel.targetNode);
      if (matches === void 0) {
        return err(
          fbxErr("fbx-animation-target-invalid", {
            reason: hasAmbiguousName ? "name-missing" : "path-not-found",
            clipIndex,
            channelIndex,
            targetNode: channel.targetNode
          })
        );
      }
      if (matches.length !== 1) {
        return err(
          fbxErr("fbx-animation-target-invalid", {
            reason: "path-duplicate",
            clipIndex,
            channelIndex,
            targetNode: channel.targetNode
          })
        );
      }
      const id = deriveAnimationTargetId(segments);
      const previous = pathById.get(id);
      if (previous !== void 0 && previous !== channel.targetNode) {
        return err(
          fbxErr("fbx-animation-target-invalid", {
            reason: "id-collision",
            clipIndex,
            channelIndex,
            targetNode: channel.targetNode
          })
        );
      }
      pathById.set(id, channel.targetNode);
    }
  }
  return ok(void 0);
}
function parseAnimationClips(doc, fps = DEFAULT_FPS) {
  const clips = doc.clips;
  if (!clips || clips.length === 0) return [];
  return clips.map((clip) => {
    return {
      ...clip.name !== void 0 && { name: clip.name },
      duration: clip.duration,
      channels: clip.channels.map((ch) => buildChannel(ch, clip.duration, fps))
    };
  });
}

// src/parse-material.ts
function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}
function phongRoughness(shininess, maxGloss = 100) {
  return clamp(1 - Math.sqrt(shininess / maxGloss), 0, 1);
}
function parseMaterial(raw, sourceIndex) {
  switch (raw.kind) {
    case "stingray-pbs": {
      const sp = raw.stingrayProps ?? {};
      return {
        ...raw.name !== void 0 && { name: raw.name },
        baseColorFactor: [
          sp.baseColor?.[0] ?? 0.5,
          sp.baseColor?.[1] ?? 0.5,
          sp.baseColor?.[2] ?? 0.5,
          1
        ],
        metallicFactor: sp.metallic ?? 0,
        roughnessFactor: sp.roughness ?? 0.5
      };
    }
    case "phong": {
      const d = raw.diffuse ?? raw.baseColor ?? [0.5, 0.5, 0.5];
      const gloss = raw.shininess ?? 100;
      return {
        ...raw.name !== void 0 && { name: raw.name },
        baseColorFactor: [d[0] ?? 0.5, d[1] ?? 0.5, d[2] ?? 0.5, 1],
        metallicFactor: 0,
        roughnessFactor: phongRoughness(gloss)
      };
    }
    case "lambert": {
      const d = raw.diffuse ?? raw.baseColor ?? [0.5, 0.5, 0.5];
      return {
        ...raw.name !== void 0 && { name: raw.name },
        baseColorFactor: [d[0] ?? 0.5, d[1] ?? 0.5, d[2] ?? 0.5, 1],
        metallicFactor: 0,
        roughnessFactor: 0.5
        // lambert has no specular → default roughness
      };
    }
    default: {
      return {
        baseColorFactor: [0.5, 0.5, 0.5, 1],
        metallicFactor: 0,
        roughnessFactor: 0.5
      };
    }
  }
}

// src/parse-mesh.ts
var MORPH_MAX_TARGETS = 8;
var MORPH_MAX_ATTRIBUTES = 8;
var TEXCOORD_PREFIX = "TEXCOORD_";
function isCornerMapped(attrLen, components, posCount, idxCount) {
  const elems = attrLen / components;
  return idxCount > 0 && elems === idxCount && elems !== posCount;
}
function parseMesh(raw, sourceIndex) {
  const rawIndices = raw.indices && raw.indices.length > 0 ? raw.indices : void 0;
  const posCount = raw.vertices.length / 3;
  const idxCount = rawIndices?.length ?? 0;
  const normal = raw.attributes.NORMAL;
  const rawMorphTargets = raw.morphTargets ?? [];
  const morphAttributeCount = rawMorphTargets.reduce(
    (count, target) => count + (target.position ? 1 : 0) + (target.normal ? 1 : 0) + (target.tangent ? 1 : 0),
    0
  );
  if (rawMorphTargets.length > MORPH_MAX_TARGETS || morphAttributeCount > MORPH_MAX_ATTRIBUTES) {
    throw new Error("fbx-morph-invalid: morph target or attribute limit exceeded");
  }
  if (rawMorphTargets.some(
    (target) => target.position === void 0 && target.normal === void 0 && target.tangent === void 0
  )) {
    throw new Error("fbx-morph-invalid: every target must contain POSITION, NORMAL, or TANGENT");
  }
  const morphTargets = rawMorphTargets.map((target) => {
    const out = {};
    for (const [key, values, components] of [
      ["position", target.position, 3],
      ["normal", target.normal, 3],
      ["tangent", target.tangent, 4]
    ]) {
      if (values === void 0) continue;
      if (values.length !== posCount * components) {
        throw new Error(`fbx-morph-invalid: ${key} length does not match vertex count`);
      }
      out[key] = new Float32Array(values);
    }
    return out;
  });
  if (raw.morphWeights !== void 0 && raw.morphWeights.length !== morphTargets.length) {
    throw new Error("fbx-morph-invalid: default weight count does not match target count");
  }
  const normalCorner = normal !== void 0 && isCornerMapped(normal.length, 3, posCount, idxCount);
  const uvCornerMap = /* @__PURE__ */ new Map();
  for (const key of Object.keys(raw.attributes)) {
    if (key.startsWith(TEXCOORD_PREFIX)) {
      const arr = raw.attributes[key];
      if (arr !== void 0 && isCornerMapped(arr.length, 2, posCount, idxCount)) {
        uvCornerMap.set(key, true);
      }
    }
  }
  const hasAnyCorner = normalCorner || uvCornerMap.size > 0;
  if (rawIndices !== void 0 && hasAnyCorner) {
    const expandedPos = new Float32Array(idxCount * 3);
    const expandedNormal = normal !== void 0 ? new Float32Array(idxCount * 3) : void 0;
    const expandedUvs = /* @__PURE__ */ new Map();
    for (const key of Object.keys(raw.attributes)) {
      if (key.startsWith(TEXCOORD_PREFIX)) {
        expandedUvs.set(key, new Float32Array(idxCount * 2));
      }
    }
    const expandedMorphTargets = morphTargets.map((target) => {
      const expanded = {};
      for (const [key, values, components] of [
        ["position", target.position, 3],
        ["normal", target.normal, 3],
        ["tangent", target.tangent, 4]
      ]) {
        if (values === void 0) continue;
        const output = new Float32Array(idxCount * components);
        for (let corner = 0; corner < idxCount; corner++) {
          const vi = rawIndices[corner] ?? 0;
          for (let component = 0; component < components; component++) {
            output[corner * components + component] = values[vi * components + component] ?? 0;
          }
        }
        expanded[key] = output;
      }
      return expanded;
    });
    for (let corner = 0; corner < idxCount; corner++) {
      const vi = rawIndices[corner] ?? 0;
      expandedPos[corner * 3 + 0] = raw.vertices[vi * 3 + 0] ?? 0;
      expandedPos[corner * 3 + 1] = raw.vertices[vi * 3 + 1] ?? 0;
      expandedPos[corner * 3 + 2] = raw.vertices[vi * 3 + 2] ?? 0;
      if (normal !== void 0 && expandedNormal !== void 0) {
        const src = normalCorner ? corner : vi;
        expandedNormal[corner * 3 + 0] = normal[src * 3 + 0] ?? 0;
        expandedNormal[corner * 3 + 1] = normal[src * 3 + 1] ?? 0;
        expandedNormal[corner * 3 + 2] = normal[src * 3 + 2] ?? 0;
      }
      for (const [key, expanded] of expandedUvs) {
        const srcArr = raw.attributes[key];
        if (srcArr !== void 0) {
          const src = uvCornerMap.get(key) ? corner : vi;
          expanded[corner * 2 + 0] = srcArr[src * 2 + 0] ?? 0;
          expanded[corner * 2 + 1] = srcArr[src * 2 + 1] ?? 0;
        }
      }
    }
    const identity = new Uint32Array(idxCount);
    for (let i = 0; i < idxCount; i++) identity[i] = i;
    const expandedAttrs = {};
    if (expandedNormal !== void 0) expandedAttrs.NORMAL = expandedNormal;
    for (const [key, val] of expandedUvs) {
      expandedAttrs[key] = val;
    }
    return {
      ...raw.name !== void 0 ? { name: raw.name } : {},
      vertices: expandedPos,
      indices: identity,
      attributes: expandedAttrs,
      submeshes: [
        {
          topology: "triangle-list",
          indexOffset: 0,
          indexCount: idxCount,
          vertexCount: idxCount,
          materialIndex: raw.materialIndex >= 0 ? raw.materialIndex : null
        }
      ],
      sourceIndex,
      ...expandedMorphTargets.length === 0 ? {} : { morphTargets: expandedMorphTargets },
      ...raw.morphWeights === void 0 ? {} : { morphWeights: new Float32Array(raw.morphWeights) }
    };
  }
  const vertices = new Float32Array(raw.vertices);
  const indices = rawIndices ? new Uint16Array(rawIndices) : void 0;
  const attributes = {};
  for (const [key, arr] of Object.entries(raw.attributes)) {
    attributes[key] = new Float32Array(arr);
  }
  const indexCount = indices?.length ?? 0;
  const submeshes = [
    {
      topology: "triangle-list",
      indexOffset: 0,
      indexCount,
      vertexCount: vertices.length / 3,
      materialIndex: raw.materialIndex >= 0 ? raw.materialIndex : null
    }
  ];
  return {
    ...raw.name !== void 0 ? { name: raw.name } : {},
    vertices,
    ...indices ? { indices } : {},
    attributes,
    submeshes,
    sourceIndex,
    ...morphTargets.length === 0 ? {} : { morphTargets },
    ...raw.morphWeights === void 0 ? {} : { morphWeights: new Float32Array(raw.morphWeights) }
  };
}
function parseSkeleton(doc) {
  const skeletons = doc.skeletons;
  if (!skeletons || skeletons.length === 0) {
    return { jointCount: 0, inverseBindMatrices: new Float32Array(0), jointPaths: [] };
  }
  const skel = skeletons[0];
  if (!skel) {
    return { jointCount: 0, inverseBindMatrices: new Float32Array(0), jointPaths: [] };
  }
  const bounds = parseConservativeAnimatedBounds(skel.bounds);
  return {
    jointCount: skel.jointCount,
    inverseBindMatrices: new Float32Array(skel.inverseBindMatrices),
    jointPaths: [...skel.jointPaths],
    ...bounds === void 0 ? {} : { bounds }
  };
}

// src/parse-skin.ts
function bridgeSkeletonGuid(_jointPaths) {
  return "fbx-skeleton-000000000000";
}
function toInfluence(raw) {
  const ji = new Uint16Array(4);
  const jw = new Float32Array(4);
  for (let i = 0; i < 4; i++) {
    ji[i] = raw.jointIndices[i] ?? 0;
    jw[i] = raw.jointWeights[i] ?? 0;
  }
  return { jointIndices: ji, jointWeights: jw };
}
function parseSkin(doc) {
  const skins = doc.skins;
  if (!skins || skins.length === 0) {
    return { skeletonGuid: "", jointPaths: [], vertexCount: 0, influences: [] };
  }
  const skin = skins[0];
  if (!skin) {
    return { skeletonGuid: "", jointPaths: [], vertexCount: 0, influences: [] };
  }
  return {
    skeletonGuid: bridgeSkeletonGuid(skin.jointPaths),
    jointPaths: [...skin.jointPaths],
    vertexCount: skin.vertexCount,
    influences: skin.influences.map(toInfluence)
  };
}

// src/parse-texture.ts
function parseTextures(raw) {
  const textures = raw.textures ?? [];
  return textures.map((t) => ({
    name: t.name ?? t.filePath,
    filePath: t.filePath,
    sourceIndex: t.sourceIndex
  }));
}
function projectFbxLodMeta(input) {
  const defaults = deriveDefaultLodScreenCoverages(input.levels.length + 1);
  const next = input.levels.map((level, index) => ({
    sourceKey: level.sourceKey,
    meshGuid: level.guid,
    ...level.screenCoverage === void 0 ? { screenCoverage: defaults[index] ?? 0 } : { screenCoverage: level.screenCoverage }
  }));
  const previous = (input.previous ?? []).map((level) => ({
    sourceKey: level.sourceKey,
    meshGuid: level.guid,
    ...level.screenCoverage === void 0 ? {} : { screenCoverage: level.screenCoverage }
  }));
  const reconciled = reconcileMeshLodMeta(previous, next);
  if (!reconciled.ok) return err({ code: reconciled.error.code, reason: reconciled.error.reason });
  return ok({
    lods: reconciled.value.lods.map((level) => ({
      sourceKey: level.sourceKey,
      guid: level.meshGuid,
      screenCoverage: level.screenCoverage
    }))
  });
}

// src/to-asset-pack.ts
function makeGuidResolver(subAssets) {
  const byKey = /* @__PURE__ */ new Map();
  for (const sub of subAssets) byKey.set(`${sub.kind}:${sub.sourceIndex}`, sub.guid);
  return (kind, sourceIndex) => byKey.get(`${kind}:${sourceIndex}`);
}
function buildMeshAsset(pod, guid, influences, materialContext = {}) {
  const vc = pod.vertices.length / 3;
  const n = pod.attributes.NORMAL;
  let uvSetCount = 1;
  for (const key of Object.keys(pod.attributes)) {
    if (key.startsWith("TEXCOORD_")) {
      const n2 = Number(key.slice("TEXCOORD_".length));
      if (Number.isFinite(n2) && n2 >= 0 && n2 <= 7) {
        uvSetCount = Math.max(uvSetCount, n2 + 1);
      }
    }
  }
  const u = pod.attributes.TEXCOORD_0;
  const skinned = influences !== void 0 && influences.length === vc && vc > 0;
  const BASE_FLOATS = skinned ? 18 : 12;
  const UV1_OFFSET = skinned ? 18 : 12;
  const FLOATS_PER_VERT = BASE_FLOATS + (uvSetCount - 1) * 2;
  const ib = new Float32Array(vc * FLOATS_PER_VERT);
  const ibU16 = skinned ? new Uint16Array(ib.buffer) : void 0;
  const skinIndexAttr = skinned ? new Uint16Array(vc * 4) : void 0;
  const skinWeightAttr = skinned ? new Float32Array(vc * 4) : void 0;
  for (let i = 0; i < vc; i++) {
    const d = i * FLOATS_PER_VERT;
    const p = i * 3;
    const t = i * 2;
    ib[d + 0] = pod.vertices[p + 0] ?? 0;
    ib[d + 1] = pod.vertices[p + 1] ?? 0;
    ib[d + 2] = pod.vertices[p + 2] ?? 0;
    ib[d + 3] = n?.[p + 0] ?? 0;
    ib[d + 4] = n?.[p + 1] ?? 0;
    ib[d + 5] = n?.[p + 2] ?? 0;
    ib[d + 6] = u?.[t + 0] ?? 0;
    ib[d + 7] = u?.[t + 1] ?? 0;
    ib[d + 8] = 1;
    ib[d + 9] = 0;
    ib[d + 10] = 0;
    ib[d + 11] = 1;
    if (skinned && ibU16 && skinIndexAttr && skinWeightAttr) {
      const inf = influences[i];
      const u16Base = (d + 12) * 2;
      const sd = i * 4;
      for (let k = 0; k < 4; k++) {
        const ji = inf?.jointIndices[k] ?? 0;
        const jw = inf?.jointWeights[k] ?? 0;
        ibU16[u16Base + k] = ji;
        ib[d + 14 + k] = jw;
        skinIndexAttr[sd + k] = ji;
        skinWeightAttr[sd + k] = jw;
      }
    }
    for (let k = 1; k < uvSetCount; k++) {
      const srcKey = `TEXCOORD_${k}`;
      const srcArr = pod.attributes[srcKey];
      const interleavedOffset = UV1_OFFSET + (k - 1) * 2;
      if (srcArr !== void 0) {
        ib[d + interleavedOffset + 0] = srcArr[t + 0] ?? 0;
        ib[d + interleavedOffset + 1] = srcArr[t + 1] ?? 0;
      }
    }
  }
  const extraUvAttrs = {};
  for (let k = 1; k < uvSetCount; k++) {
    const srcKey = `TEXCOORD_${k}`;
    const srcArr = pod.attributes[srcKey];
    if (srcArr !== void 0) {
      const cat = new Float32Array(vc * 2);
      for (let i = 0; i < vc; i++) {
        const t2 = i * 2;
        cat[t2 + 0] = srcArr[t2 + 0] ?? 0;
        cat[t2 + 1] = srcArr[t2 + 1] ?? 0;
      }
      extraUvAttrs[`uv${k}`] = cat;
    }
  }
  const attributes = {
    position: pod.vertices,
    normal: n ?? new Float32Array(vc * 3).fill(0),
    uv: u ?? new Float32Array(vc * 2).fill(0),
    tangent: new Float32Array(vc * 4).fill(0).map((_, i) => i % 4 === 0 || i % 4 === 3 ? 1 : 0),
    ...skinIndexAttr ? { skinIndex: skinIndexAttr } : {},
    ...skinWeightAttr ? { skinWeight: skinWeightAttr } : {},
    ...extraUvAttrs
  };
  const materialSlots = [];
  const slotByMaterial = /* @__PURE__ */ new Map();
  const usedNames = /* @__PURE__ */ new Set();
  const uniqueName = (raw) => {
    const base = raw.trim() || "Material";
    let candidate = base;
    let suffix = 2;
    while (usedNames.has(candidate)) candidate = `${base}_${suffix++}`;
    usedNames.add(candidate);
    return candidate;
  };
  const materialSlotFor = (materialIndex) => {
    const existing = slotByMaterial.get(materialIndex);
    if (existing !== void 0) return existing;
    const guidString = materialIndex === null ? void 0 : materialContext.guidByIndex?.get(materialIndex);
    const parsed = guidString === void 0 ? void 0 : AssetGuid.parse(guidString);
    const slotIndex = materialSlots.length;
    materialSlots.push({
      slotName: uniqueName(
        materialIndex === null ? "Default" : materialContext.nameByIndex?.get(materialIndex) ?? `Material_${materialIndex}`
      ),
      sourceKey: materialIndex === null ? "fbx:default" : materialContext.sourceKeyByIndex?.get(materialIndex) ?? `fbx:material:${materialIndex}`,
      ...parsed?.ok ? { defaultMaterial: parsed.value } : {}
    });
    slotByMaterial.set(materialIndex, slotIndex);
    return slotIndex;
  };
  const currentMesh = {
    kind: "mesh",
    vertices: ib,
    ...pod.indices ? { indices: pod.indices } : {},
    aabb: box3.fromPositions(box3.create(), pod.vertices),
    attributes,
    ...pod.morphTargets === void 0 ? {} : {
      morphTargets: pod.morphTargets.map((target) => ({
        ...target.position === void 0 ? {} : { position: new Float32Array(target.position) },
        ...target.normal === void 0 ? {} : { normal: new Float32Array(target.normal) },
        ...target.tangent === void 0 ? {} : { tangent: new Float32Array(target.tangent) }
      }))
    },
    ...pod.morphWeights === void 0 ? {} : { morphWeights: new Float32Array(pod.morphWeights) },
    submeshes: pod.submeshes.map((sm) => ({
      indexOffset: sm.indexOffset,
      indexCount: sm.indexCount,
      vertexCount: vc,
      topology: sm.topology,
      materialSlot: materialSlotFor(sm.materialIndex)
    })),
    materialSlots,
    ...materialContext.lods === void 0 ? {} : { lods: materialContext.lods }
  };
  const reconciled = reconcileMeshMaterialSlotTopology(
    currentMesh.materialSlots.map((slot) => ({
      slotName: slot.slotName,
      ...slot.sourceKey === void 0 ? {} : { sourceKey: slot.sourceKey },
      ...slot.defaultMaterial === void 0 ? {} : { defaultMaterialGuid: AssetGuid.format(slot.defaultMaterial) }
    })),
    materialContext.previousMaterialSlots
  );
  if (!reconciled.ok) {
    throw new ImportError({
      code: "mesh-material-slot-topology-change",
      expected: `unambiguous material slot identity for mesh ${guid}`,
      hint: IMPORT_ERROR_HINTS["mesh-material-slot-topology-change"],
      detail: {
        meshGuid: guid,
        ...materialContext.meshSourceKey === void 0 ? {} : { meshSourceKey: materialContext.meshSourceKey },
        previousIndices: reconciled.error.previousIndices,
        nextIndices: reconciled.error.nextIndices
      }
    });
  }
  const mesh = {
    ...currentMesh,
    submeshes: currentMesh.submeshes.map((submesh) => ({
      ...submesh,
      materialSlot: reconciled.currentToStableSlot[submesh.materialSlot]
    })),
    materialSlots: reconciled.slots.map((slot, stableIndex) => {
      const active = reconciled.currentToStableSlot.includes(stableIndex);
      const effectiveDefault = resolveMeshMaterialSlotDefaultGuid(
        slot,
        active ? materialContext.materialSlotDefaultOverrides?.[slot.sourceKey ?? slot.slotName] : void 0
      );
      const parsed = effectiveDefault === void 0 ? void 0 : AssetGuid.parse(effectiveDefault);
      return {
        slotName: slot.slotName,
        ...slot.sourceKey === void 0 ? {} : { sourceKey: slot.sourceKey },
        ...active && parsed?.ok ? { defaultMaterial: parsed.value } : {}
      };
    })
  };
  const wireAttributes = { ...mesh.attributes };
  for (let k = 1; k < uvSetCount; k++) {
    if (wireAttributes[`uv${k}`] === void 0) {
      wireAttributes[`uv${k}`] = new Float32Array(vc * 2);
    }
  }
  const wireMesh = { ...mesh, attributes: wireAttributes };
  const refs = [];
  const seenRefs = /* @__PURE__ */ new Set();
  for (let slotIndex = 0; slotIndex < mesh.materialSlots.length; slotIndex++) {
    const defaultMaterial = mesh.materialSlots[slotIndex]?.defaultMaterial;
    const materialGuid = defaultMaterial === void 0 ? void 0 : AssetGuid.format(defaultMaterial);
    if (materialGuid !== void 0 && !seenRefs.has(materialGuid.toLowerCase())) {
      seenRefs.add(materialGuid.toLowerCase());
      refs.push({
        guid: materialGuid,
        sourceField: { fieldName: "materialSlots", arrayIndex: slotIndex }
      });
    }
  }
  for (const [lodIndex, level] of (mesh.lods ?? []).entries()) {
    const lodGuid = AssetGuid.format(level.mesh);
    if (!seenRefs.has(lodGuid.toLowerCase())) {
      seenRefs.add(lodGuid.toLowerCase());
      refs.push({ guid: lodGuid, sourceField: { fieldName: "lods", arrayIndex: lodIndex } });
    }
  }
  return {
    guid,
    kind: "mesh",
    ...pod.name !== void 0 ? { name: pod.name } : {},
    payload: mesh,
    refs,
    artifacts: {
      body: {
        mediaType: "application/x-forgeax-mesh",
        assetCodec: { name: "mesh-binary", version: "4" },
        bytes: (() => {
          const packed = packMeshBinV4(
            wireMesh,
            materialContext.meshSourceKey ?? "fbx://mesh",
            refs.map((ref) => ref.guid)
          );
          if (!packed.ok) {
            throw new ImportError({
              code: "import-internal-error",
              expected: "mesh-bin v4 producer to accept the canonical FBX mesh projection",
              hint: "re-cook the FBX source with its Meta sidecar after fixing the mesh payload",
              detail: { reason: `${packed.error.code}: ${packed.error.actual}` }
            });
          }
          return packed.value;
        })()
      }
    }
  };
}
function buildMaterialAsset(pod, guid, skinned = false, standardMaterialGuid) {
  const values = {
    baseColor: pod.baseColorFactor,
    metallic: pod.metallicFactor,
    roughness: pod.roughnessFactor
  };
  const mat = standardMaterialGuid === void 0 ? {
    kind: "material",
    colorSpace: "linear",
    passes: [
      {
        name: "Forward",
        program: {
          module: skinned ? "forgeax::pbr-skin" : "forgeax::default-standard-pbr"
        },
        renderState: { tags: { LightMode: "Forward" }, queue: 2e3 }
      }
    ],
    values
  } : {
    kind: "material",
    parent: standardMaterialGuid,
    values
  };
  return {
    guid,
    kind: "material",
    ...pod.name !== void 0 ? { name: pod.name } : {},
    payload: mat,
    refs: standardMaterialGuid === void 0 ? [] : [{ guid: standardMaterialGuid, sourceField: { fieldName: "parent" } }],
    artifacts: {}
  };
}
function buildSceneAsset(pod, guid, ctx) {
  const parentOf = /* @__PURE__ */ new Map();
  for (let i = 0; i < pod.entities.length; i++) {
    const e = pod.entities[i];
    if (!e) continue;
    for (const childIdx of e.children ?? []) parentOf.set(childIdx, i);
  }
  const targetIdByEntity = /* @__PURE__ */ new Map();
  const nodePaths = buildFbxNodePaths(pod.entities);
  for (let index = 0; index < nodePaths.length; index++) {
    const path = nodePaths[index];
    if (path === void 0 || !path.ok) continue;
    const targetId = deriveAnimationTargetId(path.value);
    if (ctx.animationTargetIds.has(targetId)) targetIdByEntity.set(index, targetId);
  }
  const legacyEntities = pod.entities.map((e, idx) => {
    const components = {
      Transform: {
        pos: [e.transform.translation[0], e.transform.translation[1], e.transform.translation[2]],
        // Quaternion component order [x, y, z, w] (E6).
        quat: [
          e.transform.rotation[0],
          e.transform.rotation[1],
          e.transform.rotation[2],
          e.transform.rotation[3]
        ],
        scale: [e.transform.scale[0], e.transform.scale[1], e.transform.scale[2]]
      }
    };
    if (e.name) components.Name = { value: e.name };
    const targetId = targetIdByEntity.get(idx);
    if (targetId !== void 0) components.AnimationTargetId = { value: targetId };
    const parent = parentOf.get(idx);
    if (parent !== void 0) components.ChildOf = { parent };
    if (e.meshIndex !== null) {
      const meshHandle = ctx.meshHandleByIndex.get(e.meshIndex);
      if (meshHandle !== void 0) components.MeshFilter = { assetHandle: meshHandle };
      components.MeshRenderer = { materials: [] };
      const morph = ctx.morphWeightsByMeshIndex.get(e.meshIndex);
      if (morph !== void 0 && morph.targetCount > 0) {
        const weights = morph.weights ?? new Float32Array(morph.targetCount);
        if (weights.length !== morph.targetCount) {
          throw new Error("fbxScene: MorphWeights length does not match morph targets");
        }
        components.MorphWeights = { weights: Array.from(weights) };
      }
      if (ctx.skinnedMeshIndex === e.meshIndex && ctx.skeletonHandle !== void 0) {
        components.Skin = { skeleton: ctx.skeletonHandle };
      }
    }
    return { index: idx, components };
  });
  const entities = {};
  for (const entity of legacyEntities) {
    const components = { ...entity.components };
    const childOf = components.ChildOf;
    if (childOf !== void 0 && typeof childOf.parent === "number") {
      components.ChildOf = { ...childOf, parent: `node-${childOf.parent}` };
    }
    entities[`node-${entity.index}`] = { components };
  }
  const scene = {
    kind: "scene",
    entities,
    ...ctx.skinGuids.length > 0 ? { skinGuids: ctx.skinGuids } : {}
  };
  return {
    guid,
    kind: "scene",
    ...pod.name !== void 0 ? { name: pod.name } : {},
    payload: scene,
    refs: ctx.refs.map((guid2) => ({ guid: guid2 })),
    artifacts: {}
  };
}
function buildTextureNote(_pod, _guid) {
  return {
    guid: _guid,
    kind: "texture",
    ..._pod.name !== void 0 ? { name: _pod.name } : {},
    payload: {},
    refs: [],
    artifacts: {}
  };
}
function toAssetPack(params) {
  const assets = [];
  const guidOf = makeGuidResolver(params.subAssets);
  const materialGuidByIndex = /* @__PURE__ */ new Map();
  const materialNameByIndex = /* @__PURE__ */ new Map();
  const materialSourceKeyByIndex = /* @__PURE__ */ new Map();
  for (let materialIndex = 0; materialIndex < params.materials.length; materialIndex++) {
    const materialGuid = guidOf("material", materialIndex);
    if (materialGuid !== void 0) materialGuidByIndex.set(materialIndex, materialGuid);
    const materialSourceKey = params.subAssets.find(
      (entry) => entry.kind === "material" && entry.sourceIndex === materialIndex
    )?.sourceKey;
    if (materialSourceKey !== void 0) {
      materialSourceKeyByIndex.set(materialIndex, materialSourceKey);
    }
    const materialName = params.materials[materialIndex]?.name;
    if (materialName !== void 0) materialNameByIndex.set(materialIndex, materialName);
  }
  const hasSkin = params.skin.vertexCount > 0;
  const skinnedMeshSourceIndex = hasSkin ? params.meshes[0]?.sourceIndex ?? null : null;
  const skinnedMaterialIndices = /* @__PURE__ */ new Set();
  if (skinnedMeshSourceIndex !== null) {
    const skinnedMesh = params.meshes.find((mesh) => mesh.sourceIndex === skinnedMeshSourceIndex);
    for (const submesh of skinnedMesh?.submeshes ?? []) {
      if (submesh.materialIndex !== null) skinnedMaterialIndices.add(submesh.materialIndex);
    }
  }
  const lodsByRootMesh = /* @__PURE__ */ new Map();
  for (const group of params.lodGroups ?? []) {
    const [rootMeshIndex, ...lowerMeshIndices] = group.childMeshIndices;
    if (rootMeshIndex === void 0 || lowerMeshIndices.length === 0) continue;
    const rootDeclaration = params.subAssets.find(
      (entry) => entry.kind === "mesh" && entry.sourceIndex === rootMeshIndex
    );
    if (rootDeclaration?.sourceKey === void 0) continue;
    const levels = lowerMeshIndices.flatMap((sourceIndex) => {
      const declaration = params.subAssets.find(
        (entry) => entry.kind === "mesh" && entry.sourceIndex === sourceIndex
      );
      if (declaration?.guid === void 0 || declaration.sourceKey === void 0) return [];
      return [{ sourceKey: declaration.sourceKey, guid: declaration.guid }];
    });
    if (levels.length !== lowerMeshIndices.length) continue;
    const previousRaw = params.sourceOverrides?.[rootDeclaration.sourceKey]?.lods;
    const previous = Array.isArray(previousRaw) ? previousRaw.flatMap((entry) => {
      if (entry === null || typeof entry !== "object") return [];
      const value = entry;
      return typeof value.sourceKey === "string" && typeof value.meshGuid === "string" ? [
        {
          sourceKey: value.sourceKey,
          guid: value.meshGuid,
          ...typeof value.screenCoverage === "number" ? { screenCoverage: value.screenCoverage } : {}
        }
      ] : [];
    }) : void 0;
    const projected = projectFbxLodMeta({
      rootSourceKey: rootDeclaration.sourceKey,
      levels,
      ...previous === void 0 ? {} : { previous }
    });
    if (!projected.ok) {
      throw new ImportError({
        code: "mesh-lod-contract-invalid",
        expected: "FBX LODGroup child meshes to form a valid decreasing coverage sequence",
        hint: IMPORT_ERROR_HINTS["mesh-lod-contract-invalid"],
        detail: { reason: projected.error.reason }
      });
    }
    const parsed = projected.value.lods.flatMap((level) => {
      const guid = AssetGuid.parse(level.guid);
      return guid.ok && Number.isFinite(level.screenCoverage) ? [{ mesh: guid.value, screenCoverage: level.screenCoverage }] : [];
    });
    lodsByRootMesh.set(rootMeshIndex, parsed);
  }
  for (const mesh of params.meshes) {
    const meshDeclaration = params.subAssets.find(
      (entry) => entry.kind === "mesh" && entry.sourceIndex === mesh.sourceIndex
    );
    const guid = meshDeclaration?.guid;
    if (guid === void 0) continue;
    const previousRaw = meshDeclaration?.sourceKey === void 0 ? void 0 : params.sourceOverrides?.[meshDeclaration.sourceKey]?.materialSlots;
    const previousMaterialSlots = Array.isArray(previousRaw) ? previousRaw.filter(
      (slot) => slot !== null && typeof slot === "object" && !Array.isArray(slot) && typeof slot.slotName === "string"
    ) : void 0;
    const authoredRaw = meshDeclaration?.sourceKey === void 0 ? void 0 : params.sourceOverrides?.[meshDeclaration.sourceKey]?.materialSlotDefaultOverrides;
    const materialSlotDefaultOverrides = authoredRaw !== null && typeof authoredRaw === "object" && !Array.isArray(authoredRaw) ? Object.fromEntries(
      Object.entries(authoredRaw).filter(
        (entry) => typeof entry[1] === "string" || entry[1] === null
      )
    ) : void 0;
    const inf = mesh.sourceIndex === skinnedMeshSourceIndex ? params.skin.influences : void 0;
    const meshLods = lodsByRootMesh.get(mesh.sourceIndex);
    assets.push(
      buildMeshAsset(mesh, guid, inf, {
        guidByIndex: materialGuidByIndex,
        nameByIndex: materialNameByIndex,
        sourceKeyByIndex: materialSourceKeyByIndex,
        ...previousMaterialSlots === void 0 ? {} : { previousMaterialSlots },
        ...materialSlotDefaultOverrides === void 0 ? {} : { materialSlotDefaultOverrides },
        ...meshDeclaration?.sourceKey === void 0 ? {} : { meshSourceKey: meshDeclaration.sourceKey },
        ...meshLods === void 0 ? {} : { lods: meshLods }
      })
    );
  }
  for (let i = 0; i < params.materials.length; i++) {
    const mat = params.materials[i];
    if (!mat) continue;
    const guid = guidOf("material", i);
    const materialIsSkinned = skinnedMaterialIndices.has(i);
    if (guid !== void 0) {
      assets.push(buildMaterialAsset(mat, guid, materialIsSkinned, params.standardMaterialGuid));
    }
  }
  for (const tex of params.textures) {
    const guid = guidOf("texture", tex.sourceIndex);
    if (guid !== void 0) assets.push(buildTextureNote(tex, guid));
  }
  const declaredByKind = (kind) => params.subAssets.filter((s) => s.kind === kind).slice().sort((a, b) => a.sourceIndex - b.sourceIndex).map((s) => s.guid);
  const meshGuids = declaredByKind("mesh");
  const skeletonGuids = declaredByKind("skeleton");
  const skinGuids = declaredByKind("skin");
  const sceneRefs = [...meshGuids, ...skeletonGuids, ...skinGuids];
  const meshHandleByIndex = /* @__PURE__ */ new Map();
  params.subAssets.filter((s) => s.kind === "mesh").forEach((s) => {
    const idx = meshGuids.indexOf(s.guid);
    if (idx >= 0) meshHandleByIndex.set(s.sourceIndex, idx);
  });
  const skeletonRefBase = meshGuids.length;
  const skeletonHandle = skeletonGuids.length > 0 ? skeletonRefBase : void 0;
  const skinnedMeshIndex = params.skin.vertexCount > 0 ? params.meshes[0]?.sourceIndex ?? null : null;
  const skeletonGuid = guidOf("skeleton", 0);
  if (params.skeleton.jointCount > 0 && skeletonGuid !== void 0) {
    const bounds = params.skeleton.bounds;
    assets.push({
      guid: skeletonGuid,
      kind: "skeleton",
      payload: {
        kind: "skeleton",
        inverseBindMatrices: params.skeleton.inverseBindMatrices,
        jointCount: params.skeleton.jointCount,
        ...bounds === void 0 ? {} : { bounds }
      },
      refs: [],
      artifacts: {}
    });
  }
  const skinGuid = guidOf("skin", 0);
  if (params.skin.vertexCount > 0 && skinGuid !== void 0) {
    assets.push({
      guid: skinGuid,
      kind: "skin",
      payload: {
        kind: "skin",
        skeletonGuid: skeletonGuid ?? "",
        jointPaths: params.skin.jointPaths
      },
      refs: skeletonGuid !== void 0 ? [{ guid: skeletonGuid, sourceField: { fieldName: "skeleton" } }] : [],
      artifacts: {}
    });
  }
  for (let i = 0; i < params.animationClips.length; i++) {
    const clip = params.animationClips[i];
    if (!clip) continue;
    const guid = guidOf("animation-clip", i);
    if (guid === void 0) continue;
    assets.push({
      guid,
      kind: "animation-clip",
      payload: {
        kind: "animation-clip",
        name: clip.name ?? `Clip${i}`,
        duration: clip.duration,
        channels: clip.channels.map((ch) => ({
          targetId: ch.targetId,
          property: ch.property,
          sampler: {
            input: Array.from(ch.sampler.input),
            output: Array.from(ch.sampler.output),
            interpolation: ch.sampler.interpolation
          }
        }))
      },
      refs: [],
      artifacts: {}
    });
  }
  const sceneGuid = guidOf("scene", 0);
  const animationTargetIds = new Set(
    params.animationClips.flatMap((clip) => clip.channels.map((channel) => channel.targetId))
  );
  const morphWeightsByMeshIndex = /* @__PURE__ */ new Map();
  for (const mesh of params.meshes) {
    const targetCount = mesh.morphTargets?.length ?? 0;
    if (targetCount > 0) {
      morphWeightsByMeshIndex.set(mesh.sourceIndex, {
        targetCount,
        ...mesh.morphWeights === void 0 ? {} : { weights: new Float32Array(mesh.morphWeights) }
      });
    }
  }
  if (sceneGuid !== void 0) {
    assets.push(
      buildSceneAsset(params.scene, sceneGuid, {
        meshHandleByIndex,
        skinnedMeshIndex,
        skeletonHandle,
        refs: sceneRefs,
        skinGuids,
        animationTargetIds,
        morphWeightsByMeshIndex
      })
    );
  }
  if (assets.length === 1) {
    const only = assets[0];
    if (only && "name" in only) {
      const { name: _dropped, ...rest } = only;
      assets[0] = rest;
    }
  }
  return assets;
}

// src/fbx-importer.ts
function sourceKeyForFbxOutput(output) {
  const kind = output.kind.trim();
  if (kind.length === 0) return void 0;
  const name = output.name?.trim();
  return name === void 0 || name.length === 0 ? `fbx:${kind}` : `fbx:${kind}:${name}`;
}
function deriveFbxSourceKeys(outputs) {
  const keys = outputs.map(sourceKeyForFbxOutput);
  if (keys.some((key) => key === void 0)) return { ok: false, code: "missing-source-key" };
  const seen = /* @__PURE__ */ new Set();
  for (const [index, key] of keys.entries()) {
    if (key === void 0) continue;
    if (seen.has(key)) {
      return {
        ok: false,
        code: outputs[index]?.name === void 0 ? "ambiguous-source-key" : "duplicate-source-key"
      };
    }
    seen.add(key);
  }
  return { ok: true, keys };
}
function applyFbxImportSettingsBounds(skeleton, importSettings) {
  const bounds = readConservativeAnimatedBounds(importSettings, 0);
  return bounds === void 0 ? skeleton : { ...skeleton, bounds };
}
var fbxImporter = {
  key: "fbx",
  async import(ctx) {
    const read = await ctx.readSource();
    if (!read.ok) {
      const wrapper = new Error(`fbx-source-unreadable: ${ctx.source}`);
      wrapper.cause = read.error;
      throw wrapper;
    }
    await initFbxWasm();
    const jsonStr = parseFbx(read.value);
    const doc = JSON.parse(jsonStr);
    const maybeError = doc;
    if (maybeError.error?.code === "fbx-mesh-type-unsupported") {
      const e = fbxErr("fbx-mesh-type-unsupported", {
        meshType: maybeError.error.meshType,
        meshName: maybeError.error.meshName
      });
      const wrapper = new Error(`${e.code}: ${e.expected}`);
      wrapper.cause = e;
      throw wrapper;
    }
    const rawMeshes = doc.meshes ?? [];
    const meshes = rawMeshes.map((raw, i) => parseMesh(raw, i));
    const scene = parseScene(doc);
    const rawLodGroups = doc.lodGroups ?? [];
    const lodGroups = [];
    for (const rawGroup of rawLodGroups) {
      const parsed = parseFbxLodGroup(rawGroup);
      if (!parsed.ok) {
        const wrapper = new Error(`${parsed.error.code}: ${parsed.error.expected}`);
        wrapper.cause = parsed.error;
        throw wrapper;
      }
      lodGroups.push(parsed.value);
    }
    const texturesModule = doc;
    const textures = parseTextures({ textures: texturesModule.textures });
    const materialDocs = doc.materials ?? [];
    const materials = materialDocs.length > 0 ? materialDocs.map((raw, i) => parseMaterial(raw)) : [parseMaterial({ kind: "fallback" })];
    const authoredSkeleton = applyFbxImportSettingsBounds(parseSkeleton(doc), ctx.importSettings);
    const skin = parseSkin(doc);
    const animationTargets = resolveAnimationTargetIds(
      doc.nodes ?? [],
      doc.clips ?? []
    );
    if (!animationTargets.ok) {
      const wrapper = new Error(
        `${animationTargets.error.code}: ${animationTargets.error.expected}`
      );
      wrapper.cause = animationTargets.error;
      throw wrapper;
    }
    const animationClips = parseAnimationClips(doc);
    const skeleton = deriveFbxAnimatedBounds(
      authoredSkeleton,
      doc,
      animationClips
    );
    const standardMaterialGuid = typeof ctx.importSettings?.standardMaterialGuid === "string" ? ctx.importSettings.standardMaterialGuid : void 0;
    return {
      ok: true,
      value: {
        assets: toAssetPack({
          meshes,
          scene,
          materials,
          textures,
          skeleton,
          skin,
          animationClips,
          subAssets: ctx.subAssets,
          ...standardMaterialGuid === void 0 ? {} : { standardMaterialGuid },
          ...ctx.sourceOverrides === void 0 ? {} : { sourceOverrides: ctx.sourceOverrides },
          ...lodGroups.length === 0 ? {} : { lodGroups }
        }),
        sourceDependencies: []
      }
    };
  }
};

// src/resolve-texture-path.ts
function normalizeSourceRelativePath(raw) {
  const value = raw.replaceAll("\\", "/");
  if (value.startsWith("/") || /^[A-Za-z]:\//.test(value) || value.startsWith("//"))
    return void 0;
  const parts = [];
  for (const part of value.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (parts.at(-1) !== void 0 && parts.at(-1) !== "..") parts.pop();
      else parts.push("..");
    } else {
      parts.push(part);
    }
  }
  return parts.join("/");
}
function requestSegments(raw) {
  const value = raw.replaceAll("\\", "/").replace(/^[A-Za-z]:\//, "").replace(/^\/+/, "");
  return value.split("/").filter((part) => part !== "" && part !== ".");
}
function uniqueMatches(paths, predicate) {
  return [...new Set(paths.filter(predicate))];
}
function longestSuffixLength(request, candidate) {
  let count = 0;
  while (count < request.length && count < candidate.length && request[request.length - 1 - count]?.toLowerCase() === candidate[candidate.length - 1 - count]?.toLowerCase()) {
    count++;
  }
  return count;
}
function resolveFbxTexturePath(sourcePath, request, candidates) {
  const candidatePaths = candidates.flatMap((candidate) => {
    const normalized = normalizeSourceRelativePath(candidate.relativePath);
    return normalized === void 0 || normalized.length === 0 ? [] : [normalized];
  });
  const requestedPath = request.declaredRelativePath ?? request.declaredFilename ?? request.declaredAbsolutePath ?? "";
  const choose = (matches, strategy) => {
    const unique = [...new Set(matches)];
    if (unique.length === 1) {
      const relativePath = unique[0];
      if (relativePath === void 0) return void 0;
      return {
        ok: true,
        relativePath,
        readUri: relativePath,
        strategy
      };
    }
    if (unique.length > 1) {
      return {
        ok: false,
        code: "fbx-external-texture-ambiguous",
        requestedPath,
        candidates: unique
      };
    }
    return void 0;
  };
  const relativeRequest = request.declaredRelativePath ?? request.declaredFilename;
  if (relativeRequest !== void 0 && !/^(?:[A-Za-z]:[\\/]|[\\/])/.test(relativeRequest)) {
    const normalizedRequest = normalizeSourceRelativePath(relativeRequest);
    if (normalizedRequest !== void 0) {
      const scopeExact = choose(
        uniqueMatches(candidatePaths, (path) => path === normalizedRequest),
        "exact"
      );
      if (scopeExact !== void 0) return scopeExact;
      const scopeFolded = choose(
        uniqueMatches(
          candidatePaths,
          (path) => path.toLowerCase() === normalizedRequest.toLowerCase()
        ),
        "case-folded"
      );
      if (scopeFolded !== void 0) return scopeFolded;
    }
  }
  const requestedSegments = requestSegments(requestedPath);
  if (requestedSegments.length > 0) {
    const scored = candidatePaths.map((path) => ({
      path,
      score: longestSuffixLength(requestedSegments, path.split("/"))
    }));
    const bestScore = Math.max(0, ...scored.map((entry) => entry.score));
    if (bestScore > 0) {
      const best = scored.filter((entry) => entry.score === bestScore).map((entry) => entry.path);
      const strategy = bestScore === 1 ? "basename" : "suffix";
      const suffix = choose(best, strategy);
      if (suffix !== void 0) return suffix;
    }
  }
  return {
    ok: false,
    code: "fbx-external-texture-missing",
    requestedPath,
    candidates: candidatePaths
  };
}

// src/index.ts
var wasmModule = null;
var initPromise = null;
async function _loadWasm(overrideUrl) {
  const glueId = "../pkg/fbx-wasm.mjs";
  const createModule = (await import(
    /* @vite-ignore */
    glueId
  )).default;
  const wasmAssetUrl = overrideUrl ? new URL(overrideUrl, import.meta.url) : new URL("../pkg/fbx-wasm.wasm", import.meta.url);
  const opts = {
    locateFile: () => wasmAssetUrl.href
  };
  try {
    return await createModule(opts);
  } catch (cause) {
    throw new Error(
      `@forgeax/engine-fbx: failed to load WASM from ${wasmAssetUrl.href}. pkg/fbx-wasm.wasm may be missing. Self-help: (1) fetch a prebuilt artifact via \`pnpm -F @forgeax/engine-fbx fetch-wasm\`, or (2) compile locally with emcc via \`pnpm -F @forgeax/engine-fbx build:wasm\`.`,
      { cause }
    );
  }
}
async function initFbxWasm(wasmUrl) {
  if (wasmModule) return;
  if (!initPromise) {
    initPromise = _loadWasm(wasmUrl).catch((e) => {
      initPromise = null;
      throw e;
    });
  }
  wasmModule = await initPromise;
}
function parseFbx(fbxBytes) {
  if (!wasmModule) {
    throw new Error("@forgeax/engine-fbx: WASM not initialized. Call initFbxWasm() first.");
  }
  const mod = wasmModule;
  const size = fbxBytes.byteLength;
  const ptr = mod._malloc(size);
  if (!ptr) throw new Error("fbx-wasm: malloc failed for input buffer");
  try {
    mod.HEAPU8.set(fbxBytes, ptr);
    mod._parseFbxWasm(ptr, size);
  } finally {
    mod._free(ptr);
  }
  const resultPtr = mod._getResultPtr();
  const resultLen = mod._getResultLen();
  if (!resultPtr || !resultLen) {
    mod._freeResult();
    throw new Error("fbx-wasm: parseFbxWasm returned empty result");
  }
  const bytes = mod.HEAPU8.slice(resultPtr, resultPtr + resultLen);
  mod._freeResult();
  const json = new TextDecoder().decode(bytes);
  const firstChars = json.substring(0, 30);
  if (firstChars.includes('"error"')) {
    const parsed = JSON.parse(json);
    if (parsed.error) {
      throw new Error(`fbx-wasm: ${parsed.error.message || "parse failed"}`);
    }
  }
  return json;
}
function parseFbxToObject(fbxBytes) {
  return JSON.parse(parseFbx(fbxBytes));
}
function isFbxWasmReady() {
  return wasmModule !== null;
}

export { FBX_ERROR_HINTS, applyFbxImportSettingsBounds, deriveFbxSourceKeys, fbxErr, fbxImporter, initFbxWasm, isFbxWasmReady, parseAnimationClips, parseFbx, parseFbxLodGroup, parseFbxToObject, parseMaterial, parseMesh, parseScene, parseSkeleton, parseSkin, parseTextures, projectFbxLodMeta, resolveFbxTexturePath, sourceKeyForFbxOutput, toAssetPack };
