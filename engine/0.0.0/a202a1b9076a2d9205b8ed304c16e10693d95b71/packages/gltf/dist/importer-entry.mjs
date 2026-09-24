import { MeshoptDecoder } from '../../../vendor/meshoptimizer/index.module.js';
import { deriveDefaultLodScreenCoverages } from '../../import/dist/browser.mjs';
import { packMeshBinV4 } from '../../import/dist/mesh-bin.mjs';
import { AssetGuid } from '../../pack/dist/guid.mjs';
import { ImportError, readConservativeAnimatedBounds, toShared, err, ok, reconcileMeshMaterialSlotTopology, IMPORT_ERROR_HINTS, resolveMeshMaterialSlotDefaultGuid, createMaterialError, standardMaterialParameters, STANDARD_MATERIAL_PARAM_SCHEMA, STANDARD_PHYSICAL_PARAMETER_NAMES, STANDARD_TRANSMISSION_PARAMETER_NAMES, STANDARD_LAYER_PARAMETER_GROUPS, parseConservativeAnimatedBounds } from '../../types/dist/index.mjs';
import { deriveConservativeAnimatedBounds } from '../../animation/dist/animated-bounds.mjs';
import { computeTangentVec4, packInterleavedVertexAttributes } from '../../geometry/dist/index.mjs';
import { box3, mat4, vec3, quat } from '../../math/dist/index.mjs';
import { deriveAnimationTargetId } from '../../animation/dist/target-id.mjs';

// src/importer-entry.ts

// src/node-path.ts
function buildNodeParentMap(nodes) {
  const parents = /* @__PURE__ */ new Map();
  for (let index = 0; index < nodes.length; index++) {
    for (const child of nodes[index]?.children ?? []) parents.set(child, index);
  }
  return parents;
}
function resolveNamedNodePath(nodes, parents, nodeIndex) {
  const reversed = [];
  const visited = /* @__PURE__ */ new Set();
  let current = nodeIndex;
  while (current !== void 0) {
    if (visited.has(current)) {
      return { ok: false, reason: "hierarchy-cycle", nodeIndex: current };
    }
    visited.add(current);
    const name = nodes[current]?.name;
    if (name === void 0 || name.length === 0) {
      return { ok: false, reason: "name-missing", nodeIndex: current };
    }
    reversed.push(name);
    current = parents.get(current);
  }
  return { ok: true, value: reversed.reverse() };
}

// src/animated-bounds.ts
function deriveGltfAnimatedBounds(doc) {
  const parents = buildNodeParentMap(doc.nodes);
  const paths = doc.nodes.map((_, index) => {
    const path = resolveNamedNodePath(doc.nodes, parents, index);
    return path.ok ? path.value.join("/") : void 0;
  });
  const nodes = doc.nodes.map((node, index) => ({
    ...node.transform,
    parent: parents.get(index) ?? null
  }));
  const channels = doc.animationClips.flatMap(
    (clip) => clip.channels.flatMap(
      (channel) => channel.property === "weights" ? [] : [
        {
          node: channel.targetNodeIndex,
          property: channel.property,
          values: channel.sampler.output,
          interpolation: channel.sampler.interpolation
        }
      ]
    )
  );
  const primitiveStarts = [];
  let offset = 0;
  for (const count of doc.meshPrimitiveCount?.values() ?? doc.meshes.map(() => 1)) {
    primitiveStarts.push(offset);
    offset += count;
  }
  const skeletons = doc.skeletons.map((skeleton, skinIndex) => {
    if (skeleton.bounds !== void 0) return skeleton;
    const meshes = [];
    for (let index = 0; index < doc.nodes.length; index++) {
      const node = doc.nodes[index];
      if (node === void 0) return skeleton;
      if (node.skinIndex !== skinIndex || node.meshIndex === null) continue;
      const start = primitiveStarts[node.meshIndex];
      if (start === void 0) return skeleton;
      for (const mesh of doc.meshes.slice(
        start,
        start + (doc.meshPrimitiveCount?.get(node.meshIndex) ?? 1)
      )) {
        if (mesh.joints0 === void 0 || mesh.weights0 === void 0) return skeleton;
        let maxMorphWeight = Math.max(
          0,
          ...Array.from(node.morphWeights ?? mesh.morphWeights ?? [], Math.abs)
        );
        for (const clip of doc.animationClips)
          for (const channel of clip.channels)
            if (channel.targetNodeIndex === index && channel.property === "weights")
              for (const weight of channel.sampler.output)
                maxMorphWeight = Math.max(maxMorphWeight, Math.abs(weight));
        const morphExtent = Float32Array.from(
          mesh.positions,
          (_, component) => (mesh.morphTargets ?? []).reduce(
            (sum, target) => sum + Math.abs(target.position?.[component] ?? 0) * maxMorphWeight,
            0
          )
        );
        meshes.push({
          node: index,
          positions: mesh.positions,
          joints: mesh.joints0,
          weights: mesh.weights0,
          morphExtent
        });
      }
    }
    const jointNodes = skeleton.jointPaths.map((path) => paths.indexOf(path));
    if (jointNodes.some(
      (node, index) => node < 0 || paths.lastIndexOf(skeleton.jointPaths[index]) !== node
    ))
      return skeleton;
    const bounds = deriveConservativeAnimatedBounds({
      nodes,
      channels,
      jointNodes,
      inverseBindMatrices: skeleton.inverseBindMatrices,
      meshes
    });
    return bounds === void 0 ? skeleton : { ...skeleton, bounds };
  });
  return { ...doc, skeletons };
}
var GLTF_MESHOPT_MODES = ["ATTRIBUTES", "TRIANGLES", "INDICES"];
var GLTF_MESHOPT_FILTERS = ["NONE", "OCTAHEDRAL", "QUATERNION", "EXPONENTIAL"];
var gltfErrorPolicy = {
  "gltf-malformed-header": {
    expected: "GLB 12-byte header (magic 0x46546C67 + version=2 + length) plus mandatory JSON chunk",
    hint: "verify .glb is not truncated; rerun: forgeax asset import <path> --root <project> --json"
  },
  "gltf-version-unsupported": {
    expected: 'asset.version === "2.0"',
    hint: 'asset.version must be "2.0"; v1 or v3 not supported'
  },
  "gltf-buffer-out-of-bounds": {
    expected: "accessor byte range within bufferView.byteLength",
    hint: "rebuild .gltf with valid bufferViews; check accessor index; ensure accessor.byteOffset + EFFECTIVE_STRIDE * (count - 1) + element_size <= bufferView.byteLength"
  },
  "gltf-extension-unsupported": {
    expected: "extension listed in the supported allowlist (see EXTENSION_ALLOWLIST in @forgeax/engine-gltf)",
    hint: "remove the unsupported required extension or use a supported glTF extension; extensionsUsed-only entries remain diagnostic"
  },
  "gltf-lod-invalid": {
    expected: "MSFT_lod ids to reference unique existing node indices with valid coverage",
    hint: "repair the MSFT_lod node relation or remove it from extensionsRequired before re-importing"
  },
  "gltf-material-transmission-invalid": {
    expected: "KHR transmission, IOR, and volume values are finite and within their glTF ranges",
    hint: "repair the named glTF material extension value and re-import the source"
  },
  "gltf-material-physical-invalid": {
    expected: "KHR clearcoat, anisotropy, sheen, iridescence, and specular values are finite and within their glTF ranges",
    hint: "repair the named physical material extension value and re-import the source"
  },
  "gltf-accessor-type-mismatch": {
    expected: "dense fixed-stride accessor with supported componentType",
    hint: "sparse: see feat-future-gltf-sparse-accessor; morph: see feat-future-gltf-morph; interleaved: see feat-future-gltf-mesh-multi-section"
  },
  "gltf-texture-load-failed": {
    expected: "externalLoader resolved the URI into an ArrayBuffer without throwing",
    hint: "check sidecar meta.json + textures/ directory + vite-plugin-pack /__pack/lookup route"
  },
  "gltf-meta-missing": {
    expected: "sidecar <source>.meta.json (importer: 'gltf') present in same directory",
    hint: "run: forgeax asset import <path> --root <project> --json"
  },
  "gltf-instancing-count-mismatch": {
    expected: "all instance attribute accessors share the same count",
    hint: "EXT_mesh_gpu_instancing requires TRANSLATION/ROTATION/SCALE accessors to share count; see https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/EXT_mesh_gpu_instancing/README.md#extending-nodes-with-instance-attributes"
  },
  "gltf-image-mime-unsupported": {
    expected: "image/mimeType is image/jpeg or image/png",
    hint: "convert to JPG/PNG via external tool; only image/jpeg and image/png are supported"
  },
  "gltf-skin-joint-count-exceeded": {
    expected: "skin.joints.length <= MAX_JOINTS (256)",
    hint: "reduce joint count below MAX_JOINTS (256) or see OOS-skin-max-joints"
  },
  "gltf-animation-cubicspline-unsupported": {
    expected: "animation sampler interpolation is LINEAR or STEP",
    hint: "see OOS-skin-cubicspline; convert CUBICSPLINE to LINEAR/STEP in DCC tool"
  },
  "gltf-morph-unsupported": {
    expected: "animation channel target path is one of translation, rotation, scale, or weights",
    hint: "animation target path must be translation, rotation, scale, or weights"
  },
  "gltf-skin-joint-name-missing": {
    expected: "every joint node has a non-empty name and belongs to an acyclic hierarchy",
    hint: "ensure every joint node has a non-empty name and the node hierarchy is acyclic"
  },
  "gltf-image-extract-failed": {
    expected: "image bytes extractable from bufferView / data-URI / external URI without corruption",
    hint: "verify the bufferView byte range / data: URI base64 / external URI sibling file is intact next to the .gltf source; rerun: forgeax asset import <path> --root <project> --json"
  },
  "gltf-skin-attr-asymmetric": {
    expected: "mesh primitive declares JOINTS_0 and WEIGHTS_0 symmetrically (both present or both absent)",
    hint: "glTF spec requires JOINTS_0 and WEIGHTS_0 to appear together for each skinned primitive; add the missing attribute or remove the present one in the DCC tool"
  },
  "gltf-animation-target-invalid": {
    expected: "every animation channel resolves to one uniquely named scene node and stable target ID",
    hint: "name every node in the animated hierarchy and ensure each animated full path is unique"
  },
  "gltf-meshopt-decoder-required": {
    expected: "a required or compressed-only EXT_meshopt_compression bufferView has a ready decoder capability",
    hint: "provide the build-only EXT_meshopt_compression decoder or author a valid core fallback bufferView"
  },
  "gltf-meshopt-decode-failed": {
    expected: "the EXT_meshopt_compression declaration and decoder output are structurally valid",
    hint: "the meshopt decoder accepts the declared compressed range and produces the declared byte count"
  },
  "gltf-morph-invalid": {
    expected: "morph target and default-weight arrays are dense, bounded, and match the base vertex count",
    hint: "re-export dense morph targets with at most eight targets/attributes and matching vertex/default-weight lengths"
  },
  "gltf-color-accessor-unsupported": {
    expected: "COLOR_0 dense accessor uses VEC3/VEC4 FLOAT or normalized UBYTE/USHORT",
    hint: "re-export COLOR_0 with a supported type/component/normalized combination; morph and sparse COLOR_0 remain deferred"
  },
  "gltf-color-accessor-malformed": {
    expected: "COLOR_0 accessor is non-empty, finite, in range, and fully addressable",
    hint: "repair the COLOR_0 accessor count, reference, range, or buffer bounds, then re-import the glTF source"
  },
  "gltf-mesh-bridge-invalid": {
    expected: "a non-empty merged mesh with consistent morph and COLOR_0 cardinality",
    hint: "repair the source primitive and re-import; inspect detail.reason and its typed facts"
  }
};
Object.fromEntries(
  Object.entries(gltfErrorPolicy).map(([code, policy]) => [code, policy.hint])
);
function gltfErr(code, detail) {
  return {
    code,
    expected: gltfErrorPolicy[code].expected,
    hint: gltfErrorPolicy[code].hint,
    detail
  };
}

// src/bridge.ts
function meshIrToMeshAsset(prims, materials = {}) {
  if (prims.length === 0) {
    return err(
      gltfErr("gltf-mesh-bridge-invalid", {
        reason: "empty-input",
        primitiveCount: 0
      })
    );
  }
  let totalVertexCount = 0;
  let totalIndexCount = 0;
  let hasAnySkin = false;
  const hasAnyColor = prims.some((p) => p.colors0 !== void 0);
  let hasAnyIndices = false;
  let widestUvIndex = 0;
  const morphTargetCount = prims[0]?.morphTargets?.length ?? 0;
  for (const p of prims) {
    const primVc = p.positions.length / 3;
    totalVertexCount += primVc;
    if (p.indices !== void 0) {
      totalIndexCount += p.indices.length;
      hasAnyIndices = true;
    } else {
      totalIndexCount += primVc;
    }
    if (p.joints0 !== void 0 && p.weights0 !== void 0) hasAnySkin = true;
    if ((p.morphTargets?.length ?? 0) !== morphTargetCount) {
      return err(
        gltfErr("gltf-mesh-bridge-invalid", {
          meshIndex: p.meshIndex,
          primitiveIndex: prims.indexOf(p),
          reason: "morph-count-mismatch",
          expectedTargetCount: morphTargetCount,
          actualTargetCount: p.morphTargets?.length ?? 0
        })
      );
    }
    for (let k = 7; k >= 1; k--) {
      const key = `texcoord${k}`;
      if (p[key] !== void 0) {
        widestUvIndex = Math.max(widestUvIndex, k);
        break;
      }
    }
  }
  const uvKeys = Array.from({ length: widestUvIndex }, (_, index) => `uv${index + 1}`);
  const positionsCat = new Float32Array(totalVertexCount * 3);
  const normalsCat = new Float32Array(totalVertexCount * 3);
  const uvsCat = new Float32Array(totalVertexCount * 2);
  const tangentsCat = new Float32Array(totalVertexCount * 4);
  const colorsCat = hasAnyColor ? new Float32Array(totalVertexCount * 4) : void 0;
  const morphTargets = Array.from({ length: morphTargetCount }, (_, targetIndex) => {
    const source = prims[0]?.morphTargets?.[targetIndex];
    return {
      ...source?.position === void 0 ? {} : { position: new Float32Array(totalVertexCount * 3) },
      ...source?.normal === void 0 ? {} : { normal: new Float32Array(totalVertexCount * 3) },
      ...source?.tangent === void 0 ? {} : { tangent: new Float32Array(totalVertexCount * 4) }
    };
  });
  const uvCats = uvKeys.map(() => new Float32Array(totalVertexCount * 2));
  const skinIndicesCat = hasAnySkin ? new Uint16Array(totalVertexCount * 4) : void 0;
  const skinWeightsCat = hasAnySkin ? new Float32Array(totalVertexCount * 4) : void 0;
  const useUint32 = totalVertexCount > 65535;
  const indices = !hasAnyIndices ? void 0 : useUint32 ? new Uint32Array(totalIndexCount) : new Uint16Array(totalIndexCount);
  const submeshes = [];
  const materialSlots = [];
  const slotByMaterial = /* @__PURE__ */ new Map();
  const usedNames = /* @__PURE__ */ new Set();
  const uniqueSlotName = (base) => {
    let candidate = base.trim() || "Material";
    let suffix = 2;
    while (usedNames.has(candidate)) candidate = `${base}_${suffix++}`;
    usedNames.add(candidate);
    return candidate;
  };
  const slotFor = (materialIndex) => {
    const existing = slotByMaterial.get(materialIndex);
    if (existing !== void 0) return existing;
    const slotIndex = materialSlots.length;
    const guid = materialIndex === null ? void 0 : materials.guidByIndex?.get(materialIndex);
    const parsed = guid === void 0 ? void 0 : AssetGuid.parse(guid);
    materialSlots.push({
      slotName: uniqueSlotName(
        materialIndex === null ? "Default" : materials.nameByIndex?.get(materialIndex) ?? `Material_${materialIndex}`
      ),
      sourceKey: materialIndex === null ? "gltf:default" : materials.sourceKeyByIndex?.get(materialIndex) ?? `gltf:material:${materialIndex}`,
      ...parsed?.ok ? { defaultMaterial: parsed.value } : {}
    });
    slotByMaterial.set(materialIndex, slotIndex);
    return slotIndex;
  };
  let vertexCursor = 0;
  let indexCursor = 0;
  for (const mesh of prims) {
    const materialSlot = slotFor(mesh.materialIndex);
    const primVertexCount = mesh.positions.length / 3;
    const primIndexCount = mesh.indices === void 0 ? 0 : mesh.indices.length;
    let generatedTangents;
    if (mesh.tangents === void 0 && mesh.normals !== void 0 && mesh.texcoord0 !== void 0) {
      const generated = computeTangentVec4(
        mesh.positions,
        mesh.normals,
        mesh.texcoord0,
        mesh.indices
      );
      if (generated.ok) generatedTangents = generated.value;
    }
    if (mesh.colors0 !== void 0 && mesh.colors0.length !== primVertexCount * 4) {
      return err(
        gltfErr("gltf-mesh-bridge-invalid", {
          meshIndex: mesh.meshIndex,
          primitiveIndex: prims.indexOf(mesh),
          reason: "color-cardinality",
          semantic: "COLOR_0",
          vertexCount: primVertexCount,
          expectedLength: primVertexCount * 4,
          actualLength: mesh.colors0.length
        })
      );
    }
    for (let i = 0; i < primVertexCount; i++) {
      const p = i * 3;
      positionsCat[(vertexCursor + i) * 3 + 0] = mesh.positions[p + 0];
      positionsCat[(vertexCursor + i) * 3 + 1] = mesh.positions[p + 1];
      positionsCat[(vertexCursor + i) * 3 + 2] = mesh.positions[p + 2];
      if (mesh.normals !== void 0) {
        const n = i * 3;
        normalsCat[(vertexCursor + i) * 3 + 0] = mesh.normals[n + 0];
        normalsCat[(vertexCursor + i) * 3 + 1] = mesh.normals[n + 1];
        normalsCat[(vertexCursor + i) * 3 + 2] = mesh.normals[n + 2];
      } else {
        normalsCat[(vertexCursor + i) * 3 + 1] = 1;
      }
      if (mesh.texcoord0 !== void 0) {
        const t = i * 2;
        uvsCat[(vertexCursor + i) * 2 + 0] = mesh.texcoord0[t + 0];
        uvsCat[(vertexCursor + i) * 2 + 1] = mesh.texcoord0[t + 1];
      }
      const sourceTangents = mesh.tangents ?? generatedTangents;
      if (sourceTangents !== void 0) {
        const g = i * 4;
        tangentsCat[(vertexCursor + i) * 4 + 0] = sourceTangents[g + 0];
        tangentsCat[(vertexCursor + i) * 4 + 1] = sourceTangents[g + 1];
        tangentsCat[(vertexCursor + i) * 4 + 2] = sourceTangents[g + 2];
        tangentsCat[(vertexCursor + i) * 4 + 3] = sourceTangents[g + 3];
      } else {
        tangentsCat[(vertexCursor + i) * 4 + 0] = 1;
        tangentsCat[(vertexCursor + i) * 4 + 3] = 1;
      }
      if (colorsCat !== void 0) {
        const colorDst = (vertexCursor + i) * 4;
        const colorSrc = i * 4;
        if (mesh.colors0 === void 0) {
          colorsCat[colorDst + 0] = 1;
          colorsCat[colorDst + 1] = 1;
          colorsCat[colorDst + 2] = 1;
          colorsCat[colorDst + 3] = 1;
        } else {
          colorsCat[colorDst + 0] = mesh.colors0[colorSrc + 0];
          colorsCat[colorDst + 1] = mesh.colors0[colorSrc + 1];
          colorsCat[colorDst + 2] = mesh.colors0[colorSrc + 2];
          colorsCat[colorDst + 3] = mesh.colors0[colorSrc + 3];
        }
      }
      for (let targetIndex = 0; targetIndex < morphTargetCount; targetIndex++) {
        const source = mesh.morphTargets?.[targetIndex];
        const target = morphTargets[targetIndex];
        const vertex = vertexCursor + i;
        if (source?.position !== void 0 && target.position !== void 0) {
          target.position.set(source.position.subarray(i * 3, i * 3 + 3), vertex * 3);
        }
        if (source?.normal !== void 0 && target.normal !== void 0) {
          target.normal.set(source.normal.subarray(i * 3, i * 3 + 3), vertex * 3);
        }
        if (source?.tangent !== void 0 && target.tangent !== void 0) {
          target.tangent.set(source.tangent.subarray(i * 4, i * 4 + 4), vertex * 4);
        }
      }
      if (hasAnySkin && skinIndicesCat !== void 0 && skinWeightsCat !== void 0) {
        const skinDst = (vertexCursor + i) * 4;
        if (mesh.joints0 !== void 0 && mesh.weights0 !== void 0) {
          const j = i * 4;
          const j0 = mesh.joints0[j + 0];
          const j1 = mesh.joints0[j + 1];
          const j2 = mesh.joints0[j + 2];
          const j3 = mesh.joints0[j + 3];
          skinIndicesCat[skinDst + 0] = j0;
          skinIndicesCat[skinDst + 1] = j1;
          skinIndicesCat[skinDst + 2] = j2;
          skinIndicesCat[skinDst + 3] = j3;
          const w0 = mesh.weights0[j + 0];
          const w1 = mesh.weights0[j + 1];
          const w2 = mesh.weights0[j + 2];
          const w3 = mesh.weights0[j + 3];
          skinWeightsCat[skinDst + 0] = w0;
          skinWeightsCat[skinDst + 1] = w1;
          skinWeightsCat[skinDst + 2] = w2;
          skinWeightsCat[skinDst + 3] = w3;
        }
      }
      for (let k = 1; k <= uvKeys.length; k++) {
        const uvKey = `texcoord${k}`;
        const catIdx = k - 1;
        const cat = uvCats[catIdx];
        const catDst = (vertexCursor + i) * 2;
        const srcArr = mesh[uvKey];
        if (srcArr !== void 0) {
          const t = i * 2;
          cat[catDst + 0] = srcArr[t + 0];
          cat[catDst + 1] = srcArr[t + 1];
        }
      }
    }
    if (indices !== void 0) {
      if (mesh.indices !== void 0) {
        for (let i = 0; i < primIndexCount; i++) {
          const src = mesh.indices[i];
          indices[indexCursor + i] = src + vertexCursor;
        }
        submeshes.push({
          indexOffset: indexCursor,
          indexCount: primIndexCount,
          vertexCount: primVertexCount,
          topology: "triangle-list",
          materialSlot
        });
        indexCursor += primIndexCount;
      } else {
        for (let i = 0; i < primVertexCount; i++) {
          indices[indexCursor + i] = vertexCursor + i;
        }
        submeshes.push({
          indexOffset: indexCursor,
          indexCount: primVertexCount,
          vertexCount: primVertexCount,
          topology: "triangle-list",
          materialSlot
        });
        indexCursor += primVertexCount;
      }
    } else {
      submeshes.push({
        indexOffset: 0,
        indexCount: 0,
        vertexCount: primVertexCount,
        topology: "triangle-list",
        materialSlot
      });
    }
    vertexCursor += primVertexCount;
  }
  const attributes = {
    position: positionsCat,
    normal: normalsCat,
    uv: uvsCat,
    tangent: tangentsCat,
    ...colorsCat === void 0 ? {} : { color: colorsCat },
    ...skinIndicesCat === void 0 ? {} : { skinIndex: skinIndicesCat },
    ...skinWeightsCat === void 0 ? {} : { skinWeight: skinWeightsCat },
    ...Object.fromEntries(uvCats.map((cat, idx) => [`uv${idx + 1}`, cat]))
  };
  const packed = packInterleavedVertexAttributes(attributes, totalVertexCount);
  if (!packed.ok) {
    return err(
      gltfErr("gltf-mesh-bridge-invalid", {
        meshIndex: prims[0]?.meshIndex ?? -1,
        reason: "layout-invalid",
        cause: packed.error.detail
      })
    );
  }
  return ok({
    kind: "mesh",
    vertices: packed.value.vertices,
    ...indices === void 0 ? {} : { indices },
    submeshes,
    materialSlots,
    aabb: box3.fromPositions(box3.create(), positionsCat),
    attributes,
    ...morphTargetCount === 0 ? {} : { morphTargets },
    ...prims[0]?.morphWeights === void 0 ? {} : { morphWeights: new Float32Array(prims[0].morphWeights) }
  });
}
function lightDirection(currentWorld) {
  const direction = mat4.getForward(vec3.create(), currentWorld);
  return [direction[0] ?? 0, direction[1] ?? 0, direction[2] ?? -1];
}
function lightComponent(light, direction) {
  const range = light.range ?? Number.POSITIVE_INFINITY;
  if (light.type === "directional") {
    return { direction, color: light.color, intensity: light.intensity };
  }
  if (light.type === "point") {
    return { color: light.color, intensity: light.intensity, range };
  }
  return {
    direction,
    color: light.color,
    intensity: light.intensity,
    range,
    innerConeDeg: (light.spot?.innerConeAngle ?? 0) * 180 / Math.PI,
    outerConeDeg: (light.spot?.outerConeAngle ?? Math.PI / 4) * 180 / Math.PI,
    castShadow: false
  };
}
function composeMat4(out, tx, ty, tz, qx, qy, qz, qw, sx, sy, sz) {
  const t = vec3.create(tx, ty, tz);
  const r = quat.create();
  r[0] = qx;
  r[1] = qy;
  r[2] = qz;
  r[3] = qw;
  const s = vec3.create(sx, sy, sz);
  mat4.compose(out, t, r, s);
}
function gltfDocToSceneAsset(doc, ctx) {
  const sceneIr = doc.scenes[doc.defaultSceneIndex];
  const resultNodes = [];
  if (sceneIr === void 0) return { kind: "scene", entities: {} };
  const importedLights = doc.lights ?? doc.extensions?.KHR_lights_punctual?.lights ?? [];
  const animationTargetIds = /* @__PURE__ */ new Map();
  for (const clip of doc.animationClips) {
    for (const channel of clip.channels) {
      animationTargetIds.set(channel.targetNodeIndex, channel.targetId);
    }
  }
  const parentWorld = mat4.create();
  mat4.identity(parentWorld);
  const currentWorld = mat4.create();
  const localMat = mat4.create();
  const pushLocalTransform = (transform) => ({
    pos: [
      transform.translation[0] ?? 0,
      transform.translation[1] ?? 0,
      transform.translation[2] ?? 0
    ],
    // Quaternion component order [x, y, z, w] (glTF-aligned; E6).
    quat: [
      transform.rotation[0] ?? 0,
      transform.rotation[1] ?? 0,
      transform.rotation[2] ?? 0,
      transform.rotation[3] ?? 1
    ],
    scale: [transform.scale[0] ?? 1, transform.scale[1] ?? 1, transform.scale[2] ?? 1]
  });
  const visit = (gltfNodeIdx, parentLocalIdx) => {
    const ir = doc.nodes[gltfNodeIdx];
    if (ir === void 0) return;
    composeMat4(
      localMat,
      ir.transform.translation[0] ?? 0,
      ir.transform.translation[1] ?? 0,
      ir.transform.translation[2] ?? 0,
      ir.transform.rotation[0] ?? 0,
      ir.transform.rotation[1] ?? 0,
      ir.transform.rotation[2] ?? 0,
      ir.transform.rotation[3] ?? 1,
      ir.transform.scale[0] ?? 1,
      ir.transform.scale[1] ?? 1,
      ir.transform.scale[2] ?? 1
    );
    if (parentLocalIdx === null) {
      for (let i = 0; i < 16; i++) {
        currentWorld[i] = localMat[i] ?? 0;
      }
    } else {
      mat4.multiply(currentWorld, parentWorld, localMat);
    }
    const isCamera = ir.camera !== null;
    const hasMesh = ir.meshIndex !== null;
    const components = {
      Transform: pushLocalTransform(ir.transform)
    };
    const importedLight = importedLights[ir.lightIndex ?? -1];
    if (importedLight !== void 0) {
      const componentName = importedLight.type === "directional" ? "DirectionalLight" : importedLight.type === "point" ? "PointLight" : "SpotLight";
      components[componentName] = lightComponent(
        importedLight,
        lightDirection(currentWorld)
      );
    }
    if (ir.name !== void 0 && ir.name !== "") {
      components.Name = { value: ir.name };
    }
    const animationTargetId = animationTargetIds.get(gltfNodeIdx);
    if (animationTargetId !== void 0) {
      components.AnimationTargetId = { value: animationTargetId };
    }
    if (hasMesh) {
      const meshHandle = ctx.meshHandles.get(ir.meshIndex);
      if (meshHandle !== void 0) {
        components.MeshFilter = { assetHandle: meshHandle };
      }
      const meshMorph = doc.meshes.find((mesh) => mesh.meshIndex === ir.meshIndex);
      const morphCount = meshMorph?.morphTargets?.length ?? 0;
      if (morphCount > 0) {
        const weights = ir.morphWeights ?? meshMorph?.morphWeights ?? new Float32Array(morphCount);
        if (weights.length !== morphCount) {
          throw new Error("gltfDocToSceneAsset: MorphWeights length does not match morph targets");
        }
        components.MorphWeights = { weights: new Float32Array(weights) };
      }
      if (ir.skinIndex !== null && ctx.skeletonGuidBySkinIndex !== void 0) {
        const skeletonGuid = ctx.skeletonGuidBySkinIndex.get(ir.skinIndex);
        if (skeletonGuid !== void 0) {
          components.Skin = { skeleton: skeletonGuid };
        }
      }
      components.MeshRenderer = { materials: [] };
    }
    if (ir.instancing !== void 0) {
      components.Instances = { transforms: ir.instancing.transforms };
    }
    if (isCamera) {
      components.Camera = {
        fov: 0.7853981633974483,
        aspect: 1.7777777777777777,
        near: 0.1,
        far: 100
      };
    }
    const localIdx = resultNodes.length;
    const node = {
      localId: localIdx,
      components,
      localIdx
    };
    if (parentLocalIdx !== null) {
      node.components.ChildOf = { parent: parentLocalIdx };
    }
    resultNodes.push(node);
    const savedParent = mat4.clone(parentWorld);
    for (let i = 0; i < 16; i++) parentWorld[i] = currentWorld[i] ?? 0;
    for (const childIdx of ir.children) {
      visit(childIdx, localIdx);
    }
    for (let i = 0; i < 16; i++) parentWorld[i] = savedParent[i] ?? 0;
  };
  for (const rootIdx of sceneIr.nodes) visit(rootIdx, null);
  const keyByLocalId = /* @__PURE__ */ new Map();
  for (const node of resultNodes) keyByLocalId.set(node.localIdx, `node-${node.localIdx}`);
  const entities = {};
  for (const node of resultNodes) {
    const components = { ...node.components };
    const childOf = components.ChildOf;
    if (childOf !== void 0 && typeof childOf.parent === "number") {
      const parentKey = keyByLocalId.get(childOf.parent);
      if (parentKey === void 0)
        throw new Error(`gltfDocToSceneAsset: missing parent node ${childOf.parent}`);
      components.ChildOf = { ...childOf, parent: parentKey };
    }
    entities[`node-${node.localIdx}`] = { components };
  }
  const lightFacts = importedLights.map((light) => ({
    kind: light.type,
    intensity: light.intensity,
    ...light.range === void 0 ? {} : { range: light.range },
    ...light.spot === void 0 ? {} : { spot: light.spot }
  }));
  return {
    kind: "scene",
    entities,
    ...lightFacts.length === 0 ? {} : { lights: lightFacts }
  };
}
function textureInfo(info) {
  return info === void 0 ? void 0 : typeof info === "number" ? { texture: info } : info;
}
function textureValue(info, slot, ctx) {
  const binding = textureInfo(info);
  if (binding === void 0 || ctx?.textureHandles === void 0) return void 0;
  const textureHandle = ctx.textureHandles.get(binding.texture);
  if (textureHandle === void 0) return void 0;
  const samplerHandle = binding.sampler === void 0 ? void 0 : ctx.samplerHandles?.get(binding.sampler);
  const coordinates = binding.texCoord === void 0 && binding.transform === void 0 ? void 0 : {
    ...binding.texCoord === void 0 ? {} : { set: binding.texCoord },
    ...binding.transform === void 0 ? {} : { transform: binding.transform }
  };
  const value = {
    texture: textureHandle,
    ...samplerHandle === void 0 ? {} : { sampler: samplerHandle },
    ...coordinates === void 0 ? {} : { coordinates }
  };
  if (slot === "occlusionTexture") {
    const occlusion = info;
    if (typeof occlusion === "object" && occlusion?.strength !== void 0) {
      return { ...value, occlusionStrength: occlusion.strength };
    }
  }
  return value;
}
function standardRootParameterNames(mat) {
  const names = new Set(
    STANDARD_MATERIAL_PARAM_SCHEMA.filter(
      (entry) => !STANDARD_PHYSICAL_PARAMETER_NAMES.has(entry.name) && !STANDARD_TRANSMISSION_PARAMETER_NAMES.has(entry.name)
    ).map((entry) => entry.name)
  );
  names.add("ior");
  const addLayer = (layer) => {
    for (const name of STANDARD_LAYER_PARAMETER_GROUPS[layer]) names.add(name);
  };
  const addTexture = (name, info) => {
    if (info !== void 0) names.add(name);
  };
  const clearcoat = mat.clearcoatFactor !== void 0 || mat.clearcoatRoughnessFactor !== void 0 || mat.clearcoatNormalTexture !== void 0 || mat.clearcoatTexture !== void 0 || mat.clearcoatRoughnessTexture !== void 0;
  const anisotropy = mat.anisotropyStrength !== void 0 || mat.anisotropyRotation !== void 0 || mat.anisotropyTexture !== void 0;
  const sheen = mat.sheenColorFactor !== void 0 || mat.sheenRoughnessFactor !== void 0 || mat.sheenColorTexture !== void 0 || mat.sheenRoughnessTexture !== void 0;
  const iridescence = mat.iridescenceFactor !== void 0 || mat.iridescenceIor !== void 0 || mat.iridescenceThicknessMinimum !== void 0 || mat.iridescenceThicknessMaximum !== void 0 || mat.iridescenceTexture !== void 0 || mat.iridescenceThicknessTexture !== void 0;
  if (clearcoat) addLayer("clearcoat");
  if (anisotropy) addLayer("anisotropy");
  if (sheen) addLayer("sheen");
  if (iridescence) addLayer("iridescence");
  if (clearcoat && mat.clearcoatNormalTexture !== void 0) names.add("clearcoatNormalScale");
  addTexture("clearcoatTexture", mat.clearcoatTexture);
  addTexture("clearcoatRoughnessTexture", mat.clearcoatRoughnessTexture);
  addTexture("clearcoatNormalTexture", mat.clearcoatNormalTexture);
  addTexture("anisotropyTexture", mat.anisotropyTexture);
  addTexture("sheenColorTexture", mat.sheenColorTexture);
  addTexture("sheenRoughnessTexture", mat.sheenRoughnessTexture);
  addTexture("iridescenceTexture", mat.iridescenceTexture);
  addTexture("iridescenceThicknessTexture", mat.iridescenceThicknessTexture);
  addTexture("specularTexture", mat.specularTexture);
  addTexture("specularColorTexture", mat.specularColorTexture);
  const transmission = mat.transmissionFactor !== void 0 || mat.transmissionTexture !== void 0 || mat.ior !== void 0 || mat.thicknessFactor !== void 0 || mat.thicknessTexture !== void 0 || mat.attenuationColor !== void 0 || mat.attenuationDistance !== void 0;
  if (transmission) {
    for (const name of STANDARD_TRANSMISSION_PARAMETER_NAMES) names.add(name);
  }
  return {
    names,
    extended: clearcoat || anisotropy || sheen || iridescence || transmission || mat.specularTexture !== void 0 || mat.specularColorTexture !== void 0
  };
}
function validateMaterialUvSets(mat, primitive, availableSets) {
  const available = new Set(availableSets);
  const slots = [
    ["baseColorTexture", mat.baseColorTexture],
    ["metallicRoughnessTexture", mat.metallicRoughnessTexture],
    ["normalTexture", mat.normalTexture],
    ["occlusionTexture", mat.occlusionTexture],
    ["emissiveTexture", mat.emissiveTexture],
    ["transmissionTexture", mat.transmissionTexture],
    ["thicknessTexture", mat.thicknessTexture],
    ["clearcoatTexture", mat.clearcoatTexture],
    ["clearcoatRoughnessTexture", mat.clearcoatRoughnessTexture],
    ["clearcoatNormalTexture", mat.clearcoatNormalTexture],
    ["anisotropyTexture", mat.anisotropyTexture],
    ["sheenColorTexture", mat.sheenColorTexture],
    ["sheenRoughnessTexture", mat.sheenRoughnessTexture],
    ["iridescenceTexture", mat.iridescenceTexture],
    ["iridescenceThicknessTexture", mat.iridescenceThicknessTexture],
    ["specularTexture", mat.specularTexture],
    ["specularColorTexture", mat.specularColorTexture]
  ];
  for (const [slot, rawBinding] of slots) {
    const binding = textureInfo(rawBinding);
    if (binding === void 0) continue;
    const requestedSet = binding.texCoord ?? 0;
    if (!available.has(requestedSet)) {
      return err(
        createMaterialError("gltf-material-uv-set-missing", {
          material: mat.name ?? "<unnamed>",
          primitive,
          slot,
          requestedSet,
          availableSets
        })
      );
    }
  }
  return ok(void 0);
}
function validateMaterialTangentInputs(mat, mesh, layer = "clearcoat") {
  const anisotropyDeclared = mat.anisotropyStrength !== void 0 || mat.anisotropyRotation !== void 0 || mat.anisotropyTexture !== void 0;
  const tangentSlot = anisotropyDeclared ? { layer: "anisotropy", info: mat.anisotropyTexture } : mat.clearcoatNormalTexture !== void 0 ? { layer: "clearcoat", info: mat.clearcoatNormalTexture } : void 0;
  if (tangentSlot === void 0) return ok(void 0);
  const selected = textureInfo(tangentSlot.info);
  const uvSet = selected?.texCoord ?? 0;
  const uv = mesh[`texcoord${uvSet === 0 ? "0" : uvSet}`];
  const attributes = ["NORMAL", `TEXCOORD_${uvSet}`, "TANGENT"];
  const fail = (reason) => err(
    createMaterialError("material-tangent-required", {
      code: "material-tangent-required",
      material: mat.name ?? "<unnamed>",
      mesh: mesh.name ?? "<unnamed>",
      layer: tangentSlot.layer ?? layer,
      uv: `TEXCOORD_${uvSet}`,
      attributes,
      reason
    })
  );
  if (mesh.tangents !== void 0) {
    if (mesh.tangents.length !== mesh.positions.length / 3 * 4 || mesh.tangents.some((value) => !Number.isFinite(value))) {
      return fail("imported TANGENT must be finite vec4 per vertex");
    }
    return ok(void 0);
  }
  if (mesh.normals === void 0) return fail("NORMAL is required to generate tangent");
  if (!(uv instanceof Float32Array))
    return fail("the selected UV set is required to generate tangent");
  const generated = computeTangentVec4(mesh.positions, mesh.normals, uv, mesh.indices);
  if (!generated.ok) {
    const detail = generated.error.detail;
    const reason = detail !== void 0 && "reason" in detail ? String(detail.reason) : "tangent producer rejected topology";
    return fail(reason);
  }
  return ok(void 0);
}
function toMaterialAsset(mat, ctx) {
  const rootContract = standardRootParameterNames(mat);
  const values = {
    baseColor: mat.baseColorFactor,
    metallic: mat.metallicFactor,
    roughness: mat.roughnessFactor
  };
  if (mat.emissiveFactor !== void 0) {
    values.emissive = mat.emissiveFactor;
    values.emissiveIntensity = 1;
  }
  const textureSlots = [
    ["baseColorTexture", mat.baseColorTexture],
    ["metallicRoughnessTexture", mat.metallicRoughnessTexture],
    ["normalTexture", mat.normalTexture],
    ["occlusionTexture", mat.occlusionTexture],
    ["emissiveTexture", mat.emissiveTexture],
    ["transmissionTexture", mat.transmissionTexture],
    ["thicknessTexture", mat.thicknessTexture],
    ["clearcoatTexture", mat.clearcoatTexture],
    ["clearcoatRoughnessTexture", mat.clearcoatRoughnessTexture],
    ["clearcoatNormalTexture", mat.clearcoatNormalTexture],
    ["anisotropyTexture", mat.anisotropyTexture],
    ["sheenColorTexture", mat.sheenColorTexture],
    ["sheenRoughnessTexture", mat.sheenRoughnessTexture],
    ["iridescenceTexture", mat.iridescenceTexture],
    ["iridescenceThicknessTexture", mat.iridescenceThicknessTexture],
    ["specularTexture", mat.specularTexture],
    ["specularColorTexture", mat.specularColorTexture]
  ];
  for (const [slot, info] of textureSlots) {
    const value = textureValue(info, slot, ctx);
    if (value !== void 0) values[slot] = value;
  }
  if (mat.occlusionTexture !== void 0 && values.occlusionStrength === void 0) {
    values.occlusionStrength = 1;
  }
  if (rootContract.extended && rootContract.names.has("transmission")) {
    values.transmission = mat.transmissionFactor ?? 0;
    values.ior = mat.ior ?? 1.5;
    values.thickness = mat.thicknessFactor ?? 0;
    values.attenuationColor = mat.attenuationColor ?? [1, 1, 1];
    if (mat.attenuationDistance !== void 0) values.attenuationDistance = mat.attenuationDistance;
  }
  if (rootContract.names.has("clearcoat")) {
    values.clearcoat = mat.clearcoatFactor ?? 0;
    values.clearcoatRoughness = mat.clearcoatRoughnessFactor ?? 0;
  }
  const normal = textureInfo(mat.normalTexture);
  if (normal?.scale !== void 0) values.normalScale = normal.scale;
  const clearcoatNormal = textureInfo(mat.clearcoatNormalTexture);
  if (clearcoatNormal?.scale !== void 0) values.clearcoatNormalScale = clearcoatNormal.scale;
  if (rootContract.names.has("anisotropyStrength")) {
    values.anisotropyStrength = mat.anisotropyStrength ?? 0;
    values.anisotropyRotation = mat.anisotropyRotation ?? 0;
  }
  if (rootContract.names.has("sheenColor")) {
    values.sheenColor = mat.sheenColorFactor ?? [0, 0, 0];
    values.sheenRoughness = mat.sheenRoughnessFactor ?? 0;
  }
  if (rootContract.names.has("iridescence")) {
    values.iridescence = mat.iridescenceFactor ?? 0;
    values.iridescenceIor = mat.iridescenceIor ?? 1.3;
    values.iridescenceThicknessMinimum = mat.iridescenceThicknessMinimum ?? 100;
    values.iridescenceThicknessMaximum = mat.iridescenceThicknessMaximum ?? 400;
  }
  if (mat.specularFactor !== void 0) values.specular = mat.specularFactor;
  if (mat.specularColorFactor !== void 0) values.specularColor = mat.specularColorFactor;
  const module = ctx?.skinned === true ? "forgeax::pbr-skin" : "forgeax::default-standard-pbr";
  const isMask = mat.alphaMode === "MASK";
  const alphaCutoff = isMask ? mat.alphaCutoff ?? 0.5 : void 0;
  if (alphaCutoff !== void 0) values.alphaCutoff = alphaCutoff;
  const isBlend = mat.alphaMode === "BLEND";
  const straightAlphaBlend = {
    color: {
      srcFactor: "src-alpha",
      dstFactor: "one-minus-src-alpha",
      operation: "add"
    },
    alpha: {
      srcFactor: "one",
      dstFactor: "one-minus-src-alpha",
      operation: "add"
    }
  };
  const pass = {
    name: "Forward",
    program: { module },
    renderState: {
      tags: { LightMode: "Forward" },
      queue: isBlend ? 3e3 : isMask ? 2450 : 2e3,
      ...isBlend || isMask || mat.doubleSided === true ? {
        ...isBlend ? { blend: straightAlphaBlend, depthWriteEnabled: false } : {},
        ...mat.doubleSided === true ? { cullMode: "none" } : {}
      } : {}
    }
  };
  const child = !rootContract.extended && ctx?.standardRootGuid !== void 0;
  return {
    kind: "material",
    ...child ? { parent: ctx.standardRootGuid } : {
      colorSpace: "linear",
      passes: [pass],
      parameters: standardMaterialParameters(rootContract.names)
    },
    values
  };
}

// src/data-uri.ts
var DATA_URI_BASE64_RE = /^data:[^;,]*(?:;[^,;]+)*;base64,(.*)$/;
var Base64DecodeError = class extends Error {
  constructor(cause) {
    super(
      `base64 payload decode failed: ${cause instanceof Error ? cause.message : String(cause)}`
    );
    this.name = "Base64DecodeError";
  }
};
function dataUriBase64Payload(uri) {
  const match = DATA_URI_BASE64_RE.exec(uri);
  return match === null ? void 0 : match[1] ?? "";
}
function decodeBase64(b64) {
  let binary;
  try {
    binary = atob(b64);
  } catch (cause) {
    throw new Base64DecodeError(cause);
  }
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

// src/parse-gltf-header.ts
function parseGltfHeader(json, filePath) {
  if (json === null || typeof json !== "object" || !("asset" in json)) {
    return err(
      gltfErr("gltf-malformed-header", {
        filePath,
        byteOffset: 0
      })
    );
  }
  const asset = json.asset;
  if (!asset || typeof asset !== "object" || typeof asset.version !== "string") {
    return err(
      gltfErr("gltf-malformed-header", {
        filePath,
        byteOffset: 0
      })
    );
  }
  if (asset.version !== "2.0") {
    return err(
      gltfErr("gltf-version-unsupported", {
        filePath,
        actualVersion: asset.version
      })
    );
  }
  return ok(json);
}

// src/parse-glb-chunks.ts
var GLB_HEADER_SIZE = 12;
var GLB_MAGIC = 1179937895;
var CHUNK_HEADER_SIZE = 8;
var CHUNK_TYPE_JSON = 1313821514;
var CHUNK_TYPE_BIN = 5130562;
function parseGlbChunks(buffer, filePath) {
  if (buffer.byteLength < GLB_HEADER_SIZE) {
    return err(
      gltfErr("gltf-malformed-header", {
        filePath,
        byteOffset: 0
      })
    );
  }
  const view = new DataView(buffer);
  const magic = view.getUint32(0, true);
  if (magic !== GLB_MAGIC) {
    return err(
      gltfErr("gltf-malformed-header", {
        filePath,
        byteOffset: 0,
        magic
      })
    );
  }
  const version = view.getUint32(4, true);
  if (version !== 2) {
    return err(
      gltfErr("gltf-version-unsupported", {
        filePath,
        actualVersion: String(version)
      })
    );
  }
  const declaredLength = view.getUint32(8, true);
  if (declaredLength !== buffer.byteLength) {
    return err(
      gltfErr("gltf-malformed-header", {
        filePath,
        byteOffset: 8
      })
    );
  }
  let offset = GLB_HEADER_SIZE;
  if (offset + CHUNK_HEADER_SIZE > buffer.byteLength) {
    return err(
      gltfErr("gltf-malformed-header", {
        filePath,
        byteOffset: offset
      })
    );
  }
  const jsonChunkLength = view.getUint32(offset, true);
  const jsonChunkType = view.getUint32(offset + 4, true);
  if (jsonChunkType !== CHUNK_TYPE_JSON) {
    return err(
      gltfErr("gltf-malformed-header", {
        filePath,
        byteOffset: offset + 4
      })
    );
  }
  if (offset + CHUNK_HEADER_SIZE + jsonChunkLength > buffer.byteLength) {
    return err(
      gltfErr("gltf-malformed-header", {
        filePath,
        byteOffset: offset
      })
    );
  }
  const jsonChunk = new Uint8Array(buffer, offset + CHUNK_HEADER_SIZE, jsonChunkLength);
  offset += CHUNK_HEADER_SIZE + jsonChunkLength;
  let binChunk;
  if (offset < buffer.byteLength) {
    if (offset + CHUNK_HEADER_SIZE > buffer.byteLength) {
      return err(
        gltfErr("gltf-malformed-header", {
          filePath,
          byteOffset: offset
        })
      );
    }
    const binChunkLength = view.getUint32(offset, true);
    const binChunkType = view.getUint32(offset + 4, true);
    if (binChunkType !== CHUNK_TYPE_BIN) {
      return err(
        gltfErr("gltf-malformed-header", {
          filePath,
          byteOffset: offset + 4
        })
      );
    }
    if (offset + CHUNK_HEADER_SIZE + binChunkLength > buffer.byteLength) {
      return err(
        gltfErr("gltf-malformed-header", {
          filePath,
          byteOffset: offset
        })
      );
    }
    binChunk = new Uint8Array(buffer, offset + CHUNK_HEADER_SIZE, binChunkLength);
  }
  return ok({
    version,
    length: declaredLength,
    jsonChunk,
    ...binChunk === void 0 ? {} : { binChunk }
  });
}

// src/extract-image-bytes.ts
var DATA_URI_MIME_RE = /^data:([^;,]+)(?:;[^,;]+)*;base64,/;
function describeImportError(err2) {
  return err2.message;
}
function classifyMime(declaredMime, bytes) {
  if (declaredMime === "image/png" || declaredMime === "image/jpeg") return declaredMime;
  if (bytes.length >= 8 && bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
    return "image/jpeg";
  }
  return void 0;
}
async function extractImageBytes(sourceBytes, sourcePath, ctx) {
  const isGlb = sourcePath.toLowerCase().endsWith(".glb");
  let json;
  let glbBin;
  if (isGlb) {
    const ab = sourceBytes.buffer.slice(
      sourceBytes.byteOffset,
      sourceBytes.byteOffset + sourceBytes.byteLength
    );
    const chunks = parseGlbChunks(ab, sourcePath);
    if (!chunks.ok) {
      return {
        extracted: /* @__PURE__ */ new Map(),
        failures: [
          {
            imageIndex: -1,
            source: "bufferView",
            reason: `GLB chunk parse failed: ${chunks.error.code}`
          }
        ]
      };
    }
    try {
      json = JSON.parse(new TextDecoder().decode(chunks.value.jsonChunk));
    } catch (e) {
      return {
        extracted: /* @__PURE__ */ new Map(),
        failures: [
          {
            imageIndex: -1,
            source: "bufferView",
            reason: `GLB JSON parse failed: ${e instanceof Error ? e.message : String(e)}`
          }
        ]
      };
    }
    glbBin = chunks.value.binChunk;
  } else {
    try {
      json = JSON.parse(new TextDecoder().decode(sourceBytes));
    } catch (e) {
      return {
        extracted: /* @__PURE__ */ new Map(),
        failures: [
          {
            imageIndex: -1,
            source: "bufferView",
            reason: `gltf JSON parse failed: ${e instanceof Error ? e.message : String(e)}`
          }
        ]
      };
    }
  }
  const images = json.images ?? [];
  const bufferViews = json.bufferViews ?? [];
  const buffersJson = json.buffers ?? [];
  const extracted = /* @__PURE__ */ new Map();
  const failures = [];
  const buffersCache = /* @__PURE__ */ new Map();
  async function getBuffer(bufferIndex) {
    const cached = buffersCache.get(bufferIndex);
    if (cached !== void 0) {
      if (cached instanceof Uint8Array) return cached;
      const e = cached.error;
      return { error: typeof e === "string" ? e : e.message };
    }
    const bufJson = buffersJson[bufferIndex];
    if (bufJson === void 0) {
      const reason = `buffer index ${bufferIndex} out of range (have ${buffersJson.length})`;
      buffersCache.set(bufferIndex, { error: reason });
      return { error: reason };
    }
    if (bufJson.uri === void 0) {
      if (glbBin === void 0) {
        const reason = `buffer ${bufferIndex} has no uri and no GLB BIN chunk available`;
        buffersCache.set(bufferIndex, { error: reason });
        return { error: reason };
      }
      buffersCache.set(bufferIndex, glbBin);
      return glbBin;
    }
    const dataPayload = dataUriBase64Payload(bufJson.uri);
    if (dataPayload !== void 0) {
      try {
        const bytes = decodeBase64(dataPayload);
        buffersCache.set(bufferIndex, bytes);
        return bytes;
      } catch (e) {
        const reason = `buffer ${bufferIndex} data URI base64 decode failed: ${e instanceof Error ? e.message : String(e)}`;
        buffersCache.set(bufferIndex, { error: reason });
        return { error: reason };
      }
    }
    const sib = await ctx.readSibling(bufJson.uri);
    if (!sib.ok) {
      const reason = `external buffer "${bufJson.uri}" read failed: ${describeImportError(sib.error)}`;
      buffersCache.set(bufferIndex, { error: reason });
      return { error: reason };
    }
    buffersCache.set(bufferIndex, sib.value);
    return sib.value;
  }
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (img === void 0) continue;
    if (img.bufferView !== void 0) {
      const bv = bufferViews[img.bufferView];
      if (bv === void 0) {
        failures.push({
          imageIndex: i,
          source: "bufferView",
          reason: `bufferView index ${img.bufferView} out of range`
        });
        continue;
      }
      const buf = await getBuffer(bv.buffer);
      if (!(buf instanceof Uint8Array)) {
        failures.push({ imageIndex: i, source: "bufferView", reason: buf.error });
        continue;
      }
      const off = bv.byteOffset ?? 0;
      const len = bv.byteLength;
      if (off + len > buf.byteLength) {
        failures.push({
          imageIndex: i,
          source: "bufferView",
          reason: `bufferView ${img.bufferView} byte range [${off}..${off + len}) exceeds buffer ${bv.buffer} length ${buf.byteLength}`
        });
        continue;
      }
      const bytes = buf.subarray(off, off + len);
      const mime = classifyMime(img.mimeType, bytes);
      if (mime === void 0) {
        failures.push({
          imageIndex: i,
          source: "bufferView",
          reason: `unsupported / unrecognised mime (declared "${img.mimeType ?? "<absent>"}", magic byte sniff failed)`
        });
        continue;
      }
      extracted.set(i, { bytes: new Uint8Array(bytes), mimeType: mime, source: "bufferView" });
      continue;
    }
    if (img.uri !== void 0) {
      const dataPayload = dataUriBase64Payload(img.uri);
      if (dataPayload !== void 0) {
        let bytes;
        try {
          bytes = decodeBase64(dataPayload);
        } catch (e) {
          failures.push({
            imageIndex: i,
            source: "data-uri",
            reason: `base64 decode failed: ${e instanceof Error ? e.message : String(e)}`
          });
          continue;
        }
        const mimeMatch = DATA_URI_MIME_RE.exec(img.uri);
        const declaredMime = mimeMatch?.[1] ?? img.mimeType;
        const mime2 = classifyMime(declaredMime, bytes);
        if (mime2 === void 0) {
          failures.push({
            imageIndex: i,
            source: "data-uri",
            reason: `data: URI mime "${declaredMime ?? "<absent>"}" not png/jpeg`
          });
          continue;
        }
        extracted.set(i, { bytes, mimeType: mime2, source: "data-uri" });
        continue;
      }
      const sib = await ctx.readSibling(img.uri);
      if (!sib.ok) {
        failures.push({
          imageIndex: i,
          source: "external-uri",
          reason: `external URI "${img.uri}" read failed: ${describeImportError(sib.error)}`
        });
        continue;
      }
      const mime = classifyMime(img.mimeType, sib.value);
      if (mime === void 0) {
        failures.push({
          imageIndex: i,
          source: "external-uri",
          reason: `external URI "${img.uri}" mime not png/jpeg (declared "${img.mimeType ?? "<absent>"}", magic byte sniff failed)`
        });
        continue;
      }
      extracted.set(i, {
        bytes: new Uint8Array(sib.value),
        mimeType: mime,
        source: "external-uri"
      });
      continue;
    }
    failures.push({
      imageIndex: i,
      source: "bufferView",
      reason: "image row has neither bufferView nor uri"
    });
  }
  return { extracted, failures };
}

// src/image-color-space.ts
function deriveTextureColorSpace(input) {
  const result = /* @__PURE__ */ new Map();
  const textures = input.textures ?? [];
  function imageOfTexture(binding) {
    if (binding === void 0) return void 0;
    const textureIndex = typeof binding === "number" ? binding : binding.texture;
    const tex = textures[textureIndex];
    if (tex === void 0) return void 0;
    return tex.source;
  }
  function record(imageIndex, colorSpace) {
    if (imageIndex === void 0) return;
    const prior = result.get(imageIndex);
    if (prior === void 0) {
      result.set(imageIndex, colorSpace);
      return;
    }
    if (prior === "srgb" || colorSpace === "srgb") {
      result.set(imageIndex, "srgb");
    }
  }
  for (const mat of input.materials) {
    record(imageOfTexture(mat.baseColorTexture), "srgb");
    record(imageOfTexture(mat.emissiveTexture), "srgb");
    record(imageOfTexture(mat.sheenColorTexture), "srgb");
    record(imageOfTexture(mat.specularColorTexture), "srgb");
    record(imageOfTexture(mat.metallicRoughnessTexture), "linear");
    record(imageOfTexture(mat.normalTexture), "linear");
    record(imageOfTexture(mat.occlusionTexture), "linear");
    record(imageOfTexture(mat.transmissionTexture), "linear");
    record(imageOfTexture(mat.thicknessTexture), "linear");
    record(imageOfTexture(mat.clearcoatTexture), "linear");
    record(imageOfTexture(mat.clearcoatRoughnessTexture), "linear");
    record(imageOfTexture(mat.clearcoatNormalTexture), "linear");
    record(imageOfTexture(mat.anisotropyTexture), "linear");
    record(imageOfTexture(mat.sheenRoughnessTexture), "linear");
    record(imageOfTexture(mat.iridescenceTexture), "linear");
    record(imageOfTexture(mat.iridescenceThicknessTexture), "linear");
    record(imageOfTexture(mat.specularTexture), "linear");
  }
  for (let i = 0; i < input.imageCount; i++) {
    if (!result.has(i)) {
      result.set(i, "linear");
    }
  }
  return result;
}

// src/accessor/decode-accessor.ts
var COMPONENT_TYPE = {
  I8: 5120,
  U8: 5121,
  I16: 5122,
  U16: 5123,
  U32: 5125,
  F32: 5126
};
var TYPE_COMPONENT_COUNT = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
};
var COMPONENT_BYTE_SIZE = {
  [COMPONENT_TYPE.I8]: 1,
  [COMPONENT_TYPE.U8]: 1,
  [COMPONENT_TYPE.I16]: 2,
  [COMPONENT_TYPE.U16]: 2,
  [COMPONENT_TYPE.U32]: 4,
  [COMPONENT_TYPE.F32]: 4
};
function decodeF32Accessor(accessorIndex, accessor, allowedTypes, bufferViews, buffers) {
  if (accessor.componentType !== COMPONENT_TYPE.F32 || !allowedTypes.includes(accessor.type)) {
    return err(
      gltfErr("gltf-accessor-type-mismatch", { accessorIndex, reason: "unknownComponentType" })
    );
  }
  const bufferViewIndex = accessor.bufferView;
  if (bufferViewIndex === void 0) {
    return err(
      gltfErr("gltf-buffer-out-of-bounds", {
        accessor: accessorIndex,
        byteOffset: 0,
        byteLength: 0,
        bufferIndex: 0
      })
    );
  }
  const bufferView = bufferViews[bufferViewIndex];
  if (bufferView === void 0) {
    return err(
      gltfErr("gltf-buffer-out-of-bounds", {
        accessor: accessorIndex,
        byteOffset: 0,
        byteLength: 0,
        bufferIndex: bufferViewIndex
      })
    );
  }
  const buffer = buffers[bufferView.buffer];
  if (buffer === void 0) {
    return err(
      gltfErr("gltf-buffer-out-of-bounds", {
        accessor: accessorIndex,
        byteOffset: bufferView.byteOffset ?? 0,
        byteLength: bufferView.byteLength,
        bufferIndex: bufferView.buffer
      })
    );
  }
  const decoded = decodeAccessor({
    accessor: { ...accessor, bufferView: bufferViewIndex },
    bufferView,
    buffer,
    accessorIndex,
    role: "attribute"
  });
  if (!decoded.ok) return decoded;
  if (decoded.value.kind !== "f32") {
    return err(
      gltfErr("gltf-accessor-type-mismatch", { accessorIndex, reason: "unknownComponentType" })
    );
  }
  return ok(decoded.value.data);
}
function decodeAccessor(input, flags = {}) {
  const { accessorIndex, accessor, bufferView, buffer, role } = input;
  if (flags.morph === true) {
    return err(
      gltfErr("gltf-accessor-type-mismatch", {
        accessorIndex,
        reason: "morph"
      })
    );
  }
  if ("sparse" in accessor && accessor.sparse !== void 0) {
    return err(
      gltfErr("gltf-accessor-type-mismatch", {
        accessorIndex,
        reason: "sparse"
      })
    );
  }
  const componentByteSize = COMPONENT_BYTE_SIZE[accessor.componentType];
  const componentCount = TYPE_COMPONENT_COUNT[accessor.type];
  if (componentByteSize === void 0 || componentCount === void 0) {
    return err(
      gltfErr("gltf-accessor-type-mismatch", {
        accessorIndex,
        reason: "unknownComponentType"
      })
    );
  }
  const elementSize = componentByteSize * componentCount;
  const byteStride = bufferView.byteStride;
  if (byteStride !== void 0 && byteStride !== elementSize) {
    return err(
      gltfErr("gltf-accessor-type-mismatch", {
        accessorIndex,
        reason: "interleaved"
      })
    );
  }
  const accessorByteOffset = accessor.byteOffset ?? 0;
  const bufferViewByteOffset = bufferView.byteOffset ?? 0;
  const totalByteLength = elementSize * accessor.count;
  if (accessorByteOffset + totalByteLength > bufferView.byteLength) {
    return err(
      gltfErr("gltf-buffer-out-of-bounds", {
        accessor: accessorIndex,
        byteOffset: bufferViewByteOffset + accessorByteOffset,
        byteLength: totalByteLength,
        bufferIndex: bufferView.buffer
      })
    );
  }
  const absoluteOffset = bufferViewByteOffset + accessorByteOffset;
  if (absoluteOffset + totalByteLength > buffer.byteLength) {
    return err(
      gltfErr("gltf-buffer-out-of-bounds", {
        accessor: accessorIndex,
        byteOffset: absoluteOffset,
        byteLength: totalByteLength,
        bufferIndex: bufferView.buffer
      })
    );
  }
  if (role === "indices" && accessor.componentType === COMPONENT_TYPE.U8) {
    const widened = new Uint16Array(accessor.count);
    for (let i = 0; i < accessor.count; i++) {
      widened[i] = buffer[absoluteOffset + i] ?? 0;
    }
    return ok({ kind: "u16", data: widened });
  }
  if (role === "joints" && accessor.componentType === COMPONENT_TYPE.U8) {
    const totalValues = accessor.count * componentCount;
    const widened = new Uint16Array(totalValues);
    for (let i = 0; i < totalValues; i++) {
      widened[i] = buffer[absoluteOffset + i] ?? 0;
    }
    return ok({ kind: "u16", data: widened });
  }
  if (accessor.componentType === COMPONENT_TYPE.F32) {
    const out = new Float32Array(accessor.count * componentCount);
    const src = new Float32Array(buffer.buffer, buffer.byteOffset + absoluteOffset, out.length);
    out.set(src);
    return ok({ kind: "f32", data: out });
  }
  if (accessor.componentType === COMPONENT_TYPE.U16) {
    const out = new Uint16Array(accessor.count * componentCount);
    const src = new Uint16Array(buffer.buffer, buffer.byteOffset + absoluteOffset, out.length);
    out.set(src);
    return ok({ kind: "u16", data: out });
  }
  if (accessor.componentType === COMPONENT_TYPE.U32) {
    const out = new Uint32Array(accessor.count * componentCount);
    const src = new Uint32Array(buffer.buffer, buffer.byteOffset + absoluteOffset, out.length);
    out.set(src);
    return ok({ kind: "u32", data: out });
  }
  if (accessor.componentType === COMPONENT_TYPE.I16) {
    const out = new Float32Array(accessor.count * componentCount);
    const src = new Int16Array(buffer.buffer, buffer.byteOffset + absoluteOffset, out.length);
    for (let index = 0; index < src.length; index++) {
      const value = src[index] ?? 0;
      out[index] = accessor.normalized === true ? Math.max(-1, value / 32767) : value;
    }
    return ok({ kind: "f32", data: out });
  }
  return err(
    gltfErr("gltf-accessor-type-mismatch", {
      accessorIndex,
      reason: "unknownComponentType"
    })
  );
}

// src/accessor/decode-color.ts
var FLOAT = 5126;
var UNSIGNED_BYTE = 5121;
var UNSIGNED_SHORT = 5123;
function unsupported(input, reason) {
  return err(
    gltfErr("gltf-color-accessor-unsupported", {
      semantic: input.semantic,
      accessorIndex: input.accessorIndex,
      reason,
      expectedType: "VEC3 or VEC4",
      expectedComponent: "FLOAT or normalized UNSIGNED_BYTE/UNSIGNED_SHORT",
      ...reason === "normalized" ? { expectedNormalized: true } : {}
    })
  );
}
function malformed(input, reason) {
  return err(
    gltfErr("gltf-color-accessor-malformed", {
      semantic: input.semantic,
      accessorIndex: input.accessorIndex,
      reason,
      ...reason === "count" ? { expectedCount: "matches POSITION vertex count and is greater than zero" } : {},
      ...reason === "range" || reason === "finite" ? { expectedRange: "[0,1] finite linear values" } : {}
    })
  );
}
function decodeColorAccessor(input, flags = {}) {
  const { accessor, bufferView, buffer } = input;
  if (flags.morph === true) return unsupported(input, "morph");
  if (accessor.sparse !== void 0) return unsupported(input, "sparse");
  if (accessor.type !== "VEC3" && accessor.type !== "VEC4") return unsupported(input, "type");
  if (!Number.isSafeInteger(accessor.count) || accessor.count <= 0)
    return malformed(input, "count");
  let componentByteSize;
  if (accessor.componentType === FLOAT) componentByteSize = 4;
  else if (accessor.componentType === UNSIGNED_BYTE) componentByteSize = 1;
  else if (accessor.componentType === UNSIGNED_SHORT) componentByteSize = 2;
  else return unsupported(input, "component");
  if (accessor.componentType === FLOAT) {
    if (accessor.normalized !== void 0) return unsupported(input, "normalized");
  } else if (accessor.normalized !== true) {
    return unsupported(input, "normalized");
  }
  const componentCount = accessor.type === "VEC3" ? 3 : 4;
  const elementByteLength = componentByteSize * componentCount;
  const byteStride = bufferView.byteStride ?? elementByteLength;
  if (!Number.isSafeInteger(byteStride) || byteStride < elementByteLength || byteStride % componentByteSize !== 0) {
    return malformed(input, "bounds");
  }
  if (input.bufferIndex !== void 0 && bufferView.buffer !== input.bufferIndex) {
    return malformed(input, "reference");
  }
  const accessorByteOffset = accessor.byteOffset ?? 0;
  const viewByteOffset = bufferView.byteOffset ?? 0;
  const lastElementEnd = accessorByteOffset + byteStride * (accessor.count - 1) + elementByteLength;
  if (!Number.isSafeInteger(accessorByteOffset) || accessorByteOffset < 0 || lastElementEnd > bufferView.byteLength) {
    return malformed(input, "bounds");
  }
  const absoluteLastElementEnd = viewByteOffset + lastElementEnd;
  if (!Number.isSafeInteger(viewByteOffset) || viewByteOffset < 0 || absoluteLastElementEnd > buffer.byteLength) {
    return malformed(input, "bounds");
  }
  const output = new Float32Array(accessor.count * 4);
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const base = viewByteOffset + accessorByteOffset;
  for (let vertex = 0; vertex < accessor.count; vertex++) {
    const sourceOffset = base + vertex * byteStride;
    for (let component = 0; component < componentCount; component++) {
      const byteOffset = sourceOffset + component * componentByteSize;
      let value;
      if (accessor.componentType === FLOAT) value = view.getFloat32(byteOffset, true);
      else if (accessor.componentType === UNSIGNED_BYTE) value = view.getUint8(byteOffset) / 255;
      else value = view.getUint16(byteOffset, true) / 65535;
      if (!Number.isFinite(value)) return malformed(input, "finite");
      if (value < 0 || value > 1) return malformed(input, "range");
      output[vertex * 4 + component] = value;
    }
    if (componentCount === 3) output[vertex * 4 + 3] = 1;
  }
  return ok(output);
}

// src/check-extensions.ts
var EXTENSION_ALLOWLIST = [
  "EXT_mesh_gpu_instancing",
  "EXT_meshopt_compression",
  "KHR_lights_punctual",
  "KHR_texture_transform",
  "KHR_materials_transmission",
  "KHR_materials_ior",
  "KHR_materials_volume",
  "KHR_materials_clearcoat",
  "KHR_materials_anisotropy",
  "KHR_materials_sheen",
  "KHR_materials_iridescence",
  "KHR_materials_specular"
];
var SUPPORTED_EXTENSIONS = [
  ...EXTENSION_ALLOWLIST,
  "MSFT_lod",
  "MSFT_screencoverage"
];
function checkExtensions(json) {
  const required = json.extensionsRequired ?? [];
  for (const ext of required) {
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return err(
        gltfErr("gltf-extension-unsupported", {
          extension: ext,
          source: "extensionsRequired"
        })
      );
    }
  }
  const used = json.extensionsUsed ?? [];
  const unsupportedUsed = [];
  for (const ext of used) {
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      unsupportedUsed.push(ext);
    }
  }
  return ok({ unsupportedUsed });
}

// src/lod/parse-lod.ts
function parseGltfLodExtension(json) {
  const doc = json;
  const nodes = doc.nodes ?? [];
  const rawCoverage = doc.extensions?.MSFT_screencoverage?.scales;
  const groups = [];
  for (let rootNode = 0; rootNode < nodes.length; rootNode += 1) {
    if (nodes[rootNode]?.extensions?.MSFT_lod === void 0) continue;
    const idsRaw = nodes[rootNode]?.extensions?.MSFT_lod?.ids;
    if (!Array.isArray(idsRaw)) {
      return err(gltfErr("gltf-lod-invalid", { rootNode, ids: [], reason: "not-integer" }));
    }
    const ids = idsRaw.filter((value) => typeof value === "number");
    if (ids.length !== idsRaw.length || ids.some((id) => !Number.isInteger(id) || id < 0 || id >= nodes.length)) {
      return err(gltfErr("gltf-lod-invalid", { rootNode, ids, reason: "missing-node" }));
    }
    if (new Set(ids).size !== ids.length || ids.includes(rootNode)) {
      return err(gltfErr("gltf-lod-invalid", { rootNode, ids, reason: "duplicate-node" }));
    }
    const hasMesh = (node) => {
      if (typeof node?.mesh !== "number" || !Number.isInteger(node.mesh) || node.mesh < 0) {
        return false;
      }
      const mesh = doc.meshes?.[node.mesh];
      return mesh !== void 0 && Array.isArray(mesh.primitives) && mesh.primitives.length > 0;
    };
    if (!hasMesh(nodes[rootNode]) || ids.some((id) => !hasMesh(nodes[id]))) {
      return err(gltfErr("gltf-lod-invalid", { rootNode, ids, reason: "missing-node" }));
    }
    const nodeCoverage = nodes[rootNode]?.extras?.MSFT_screencoverage;
    const coverage = normalizeScreenCoverages(
      nodeCoverage === void 0 ? rawCoverage : nodeCoverage,
      ids.length,
      nodeCoverage !== void 0
    );
    if (coverage === "invalid") {
      return err(gltfErr("gltf-lod-invalid", { rootNode, ids, reason: "coverage" }));
    }
    groups.push({
      rootNode,
      lodNodeIds: ids,
      screenCoverages: coverage ?? []
    });
  }
  const first = groups[0];
  if (first === void 0) {
    if (doc.extensionsRequired?.some((extension) => extension === "MSFT_lod")) {
      return err(gltfErr("gltf-lod-invalid", { rootNode: 0, ids: [], reason: "missing-node" }));
    }
    return ok({ rootNode: 0, lodNodeIds: [], screenCoverages: [], groups: [] });
  }
  return ok({
    rootNode: first.rootNode,
    lodNodeIds: first.lodNodeIds,
    screenCoverages: first.screenCoverages,
    groups
  });
}
function normalizeScreenCoverages(raw, lodCount, officialNodeForm) {
  if (raw === void 0) return void 0;
  if (!Array.isArray(raw)) return "invalid";
  if (raw.some(
    (value) => typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > 1
  )) {
    return "invalid";
  }
  const expectedLengths = officialNodeForm ? [lodCount + 1] : [lodCount, lodCount + 1];
  if (!expectedLengths.includes(raw.length)) return "invalid";
  const values = raw.slice(0, lodCount);
  for (let index = 1; index < values.length; index += 1) {
    if (values[index] >= values[index - 1]) return "invalid";
  }
  return values;
}

// src/material/parse-material.ts
function tuple2(values) {
  if (values === void 0 || values.length < 2) return void 0;
  return [values[0] ?? 0, values[1] ?? 0];
}
function tuple3(values) {
  if (values === void 0 || values.length < 3) return void 0;
  return [values[0] ?? 0, values[1] ?? 0, values[2] ?? 0];
}
function parseTextureInfo(info, textures) {
  const transformJson = info.extensions?.KHR_texture_transform;
  const offset = tuple2(transformJson?.offset);
  const scale = tuple2(transformJson?.scale);
  const transform = offset === void 0 && transformJson?.rotation === void 0 && scale === void 0 ? void 0 : {
    ...offset === void 0 ? {} : { offset },
    ...transformJson?.rotation === void 0 ? {} : { rotation: transformJson.rotation },
    ...scale === void 0 ? {} : { scale }
  };
  const sampler = textures[info.index]?.sampler;
  return {
    texture: info.index,
    ...sampler === void 0 ? {} : { sampler },
    ...info.texCoord === void 0 && transformJson?.texCoord === void 0 ? {} : { texCoord: transformJson?.texCoord ?? info.texCoord },
    ...transform === void 0 ? {} : { transform }
  };
}
function finiteOrUndefined(value) {
  return value !== void 0 && Number.isFinite(value) ? value : void 0;
}
function parseMaterial(matJson, textures) {
  const pbr = matJson.pbrMetallicRoughness;
  const baseColor = pbr?.baseColorFactor ?? [1, 1, 1, 1];
  const baseColor4 = [
    baseColor[0] ?? 1,
    baseColor[1] ?? 1,
    baseColor[2] ?? 1,
    baseColor[3] ?? 1
  ];
  const alphaMode = matJson.alphaMode === "MASK" || matJson.alphaMode === "BLEND" ? matJson.alphaMode : void 0;
  const alphaCutoff = alphaMode === "MASK" ? matJson.alphaCutoff ?? 0.5 : void 0;
  const emissiveFactor = tuple3(matJson.emissiveFactor);
  const transmission = matJson.extensions?.KHR_materials_transmission;
  const ior = matJson.extensions?.KHR_materials_ior;
  const volume = matJson.extensions?.KHR_materials_volume;
  const clearcoat = matJson.extensions?.KHR_materials_clearcoat;
  const anisotropy = matJson.extensions?.KHR_materials_anisotropy;
  const sheen = matJson.extensions?.KHR_materials_sheen;
  const iridescence = matJson.extensions?.KHR_materials_iridescence;
  const specular = matJson.extensions?.KHR_materials_specular;
  const attenuationColor = tuple3(volume?.attenuationColor);
  const invalid = (extension, field, reason, actual) => err(
    gltfErr("gltf-material-transmission-invalid", {
      extension,
      field,
      reason,
      ...actual === void 0 ? {} : { actual }
    })
  );
  const physicalInvalid = (extension, field, reason, actual) => err(
    gltfErr("gltf-material-physical-invalid", {
      extension,
      field,
      reason,
      ...actual === void 0 ? {} : { actual }
    })
  );
  if (transmission?.transmissionFactor !== void 0 && (typeof transmission.transmissionFactor !== "number" || !Number.isFinite(transmission.transmissionFactor))) {
    return invalid(
      "KHR_materials_transmission",
      "transmissionFactor",
      "non-finite",
      transmission.transmissionFactor
    );
  }
  if (transmission?.transmissionFactor !== void 0 && (transmission.transmissionFactor < 0 || transmission.transmissionFactor > 1)) {
    return invalid(
      "KHR_materials_transmission",
      "transmissionFactor",
      "range",
      transmission.transmissionFactor
    );
  }
  if (ior?.ior !== void 0 && (typeof ior.ior !== "number" || !Number.isFinite(ior.ior))) {
    return invalid("KHR_materials_ior", "ior", "non-finite", ior.ior);
  }
  if (ior?.ior !== void 0 && ior.ior < 1) {
    return invalid("KHR_materials_ior", "ior", "range", ior.ior);
  }
  if (volume?.thicknessFactor !== void 0 && !Number.isFinite(volume.thicknessFactor)) {
    return invalid("KHR_materials_volume", "thicknessFactor", "non-finite", volume.thicknessFactor);
  }
  if (volume?.thicknessFactor !== void 0 && volume.thicknessFactor < 0) {
    return invalid("KHR_materials_volume", "thicknessFactor", "range", volume.thicknessFactor);
  }
  if (volume?.attenuationColor !== void 0 && (attenuationColor === void 0 || attenuationColor.some((value) => !Number.isFinite(value) || value < 0 || value > 1))) {
    return invalid("KHR_materials_volume", "attenuationColor", "range", volume.attenuationColor);
  }
  if (volume?.attenuationDistance !== void 0 && !Number.isFinite(volume.attenuationDistance) && volume.attenuationDistance !== Number.POSITIVE_INFINITY) {
    return invalid(
      "KHR_materials_volume",
      "attenuationDistance",
      "non-finite",
      volume.attenuationDistance
    );
  }
  if (volume?.attenuationDistance !== void 0 && Number.isFinite(volume.attenuationDistance) && volume.attenuationDistance <= 0) {
    return invalid(
      "KHR_materials_volume",
      "attenuationDistance",
      "range",
      volume.attenuationDistance
    );
  }
  if (alphaMode === "BLEND" && (transmission?.transmissionFactor ?? 0) > 0) {
    return invalid("KHR_materials_transmission", "alphaMode", "blend", alphaMode);
  }
  if (clearcoat?.clearcoatFactor !== void 0 && (typeof clearcoat.clearcoatFactor !== "number" || !Number.isFinite(clearcoat.clearcoatFactor))) {
    return physicalInvalid(
      "KHR_materials_clearcoat",
      "clearcoatFactor",
      "non-finite",
      clearcoat.clearcoatFactor
    );
  }
  if (clearcoat?.clearcoatFactor !== void 0 && (clearcoat.clearcoatFactor < 0 || clearcoat.clearcoatFactor > 1)) {
    return physicalInvalid(
      "KHR_materials_clearcoat",
      "clearcoatFactor",
      "range",
      clearcoat.clearcoatFactor
    );
  }
  if (clearcoat?.clearcoatRoughnessFactor !== void 0 && (typeof clearcoat.clearcoatRoughnessFactor !== "number" || !Number.isFinite(clearcoat.clearcoatRoughnessFactor))) {
    return physicalInvalid(
      "KHR_materials_clearcoat",
      "clearcoatRoughnessFactor",
      "non-finite",
      clearcoat.clearcoatRoughnessFactor
    );
  }
  if (clearcoat?.clearcoatRoughnessFactor !== void 0 && (clearcoat.clearcoatRoughnessFactor < 0 || clearcoat.clearcoatRoughnessFactor > 1)) {
    return physicalInvalid(
      "KHR_materials_clearcoat",
      "clearcoatRoughnessFactor",
      "range",
      clearcoat.clearcoatRoughnessFactor
    );
  }
  if (clearcoat?.clearcoatNormalTexture?.scale !== void 0 && (typeof clearcoat.clearcoatNormalTexture.scale !== "number" || !Number.isFinite(clearcoat.clearcoatNormalTexture.scale) || clearcoat.clearcoatNormalTexture.scale < 0)) {
    return physicalInvalid(
      "KHR_materials_clearcoat",
      "clearcoatNormalTexture.scale",
      "range",
      clearcoat.clearcoatNormalTexture.scale
    );
  }
  const validateUnit = (extension, field, value) => {
    if (value === void 0) return void 0;
    if (typeof value !== "number" || !Number.isFinite(value))
      return physicalInvalid(extension, field, "non-finite", value);
    if (value < 0 || value > 1) return physicalInvalid(extension, field, "range", value);
    return void 0;
  };
  const validateFinite = (extension, field, value, minimum) => {
    if (value === void 0) return void 0;
    if (typeof value !== "number" || !Number.isFinite(value))
      return physicalInvalid(extension, field, "non-finite", value);
    if (minimum !== void 0 && value < minimum)
      return physicalInvalid(extension, field, "range", value);
    return void 0;
  };
  const validateColor = (extension, field, value) => {
    if (value === void 0) return void 0;
    if (value.length < 3 || value.slice(0, 3).some((channel) => typeof channel !== "number" || !Number.isFinite(channel))) {
      return physicalInvalid(extension, field, "type", value);
    }
    if (value.slice(0, 3).some((channel) => channel < 0 || channel > 1)) {
      return physicalInvalid(extension, field, "range", value);
    }
    return void 0;
  };
  const physicalChecks = [
    validateUnit("KHR_materials_anisotropy", "anisotropyStrength", anisotropy?.anisotropyStrength),
    validateFinite(
      "KHR_materials_anisotropy",
      "anisotropyRotation",
      anisotropy?.anisotropyRotation
    ),
    validateUnit("KHR_materials_sheen", "sheenRoughnessFactor", sheen?.sheenRoughnessFactor),
    validateColor("KHR_materials_sheen", "sheenColorFactor", sheen?.sheenColorFactor),
    validateUnit("KHR_materials_iridescence", "iridescenceFactor", iridescence?.iridescenceFactor),
    validateFinite("KHR_materials_iridescence", "iridescenceIor", iridescence?.iridescenceIor, 1),
    validateFinite(
      "KHR_materials_iridescence",
      "iridescenceThicknessMinimum",
      iridescence?.iridescenceThicknessMinimum,
      0
    ),
    validateFinite(
      "KHR_materials_iridescence",
      "iridescenceThicknessMaximum",
      iridescence?.iridescenceThicknessMaximum,
      0
    ),
    validateUnit("KHR_materials_specular", "specularFactor", specular?.specularFactor),
    validateColor("KHR_materials_specular", "specularColorFactor", specular?.specularColorFactor)
  ];
  for (const check of physicalChecks) if (check !== void 0) return check;
  return ok({
    ...matJson.name === void 0 ? {} : { name: matJson.name },
    baseColorFactor: baseColor4,
    ...emissiveFactor === void 0 ? {} : { emissiveFactor },
    metallicFactor: pbr?.metallicFactor ?? 1,
    roughnessFactor: pbr?.roughnessFactor ?? 1,
    ...pbr?.baseColorTexture === void 0 ? {} : { baseColorTexture: parseTextureInfo(pbr.baseColorTexture, textures) },
    ...pbr?.metallicRoughnessTexture === void 0 ? {} : { metallicRoughnessTexture: parseTextureInfo(pbr.metallicRoughnessTexture, textures) },
    ...matJson.normalTexture === void 0 ? {} : {
      normalTexture: {
        ...parseTextureInfo(matJson.normalTexture, textures),
        ...matJson.normalTexture.scale === void 0 ? {} : { scale: matJson.normalTexture.scale }
      }
    },
    ...matJson.occlusionTexture === void 0 ? {} : {
      occlusionTexture: {
        ...parseTextureInfo(matJson.occlusionTexture, textures),
        ...matJson.occlusionTexture.strength === void 0 ? {} : { strength: matJson.occlusionTexture.strength }
      }
    },
    ...matJson.emissiveTexture === void 0 ? {} : { emissiveTexture: parseTextureInfo(matJson.emissiveTexture, textures) },
    ...transmission === void 0 ? {} : {
      transmissionFactor: transmission.transmissionFactor ?? 0,
      transmissionChannel: 0,
      ...transmission.transmissionTexture === void 0 ? {} : {
        transmissionTexture: parseTextureInfo(transmission.transmissionTexture, textures)
      }
    },
    ...ior === void 0 ? {} : { ior: ior.ior ?? 1.5 },
    ...volume === void 0 ? {} : {
      thicknessFactor: volume.thicknessFactor ?? 0,
      thicknessChannel: 1,
      ...volume.thicknessTexture === void 0 ? {} : { thicknessTexture: parseTextureInfo(volume.thicknessTexture, textures) },
      ...attenuationColor === void 0 ? {} : { attenuationColor },
      ...finiteOrUndefined(volume.attenuationDistance) === void 0 ? {} : { attenuationDistance: volume.attenuationDistance }
    },
    ...clearcoat === void 0 ? {} : {
      clearcoatFactor: clearcoat.clearcoatFactor ?? 0,
      clearcoatChannel: 0,
      clearcoatRoughnessFactor: clearcoat.clearcoatRoughnessFactor ?? 0,
      clearcoatRoughnessChannel: 1,
      clearcoatNormalChannel: [0, 1],
      ...clearcoat.clearcoatTexture === void 0 ? {} : { clearcoatTexture: parseTextureInfo(clearcoat.clearcoatTexture, textures) },
      ...clearcoat.clearcoatRoughnessTexture === void 0 ? {} : {
        clearcoatRoughnessTexture: parseTextureInfo(
          clearcoat.clearcoatRoughnessTexture,
          textures
        )
      },
      ...clearcoat.clearcoatNormalTexture === void 0 ? {} : {
        clearcoatNormalTexture: {
          ...parseTextureInfo(clearcoat.clearcoatNormalTexture, textures),
          ...clearcoat.clearcoatNormalTexture.scale === void 0 ? {} : { scale: clearcoat.clearcoatNormalTexture.scale }
        }
      }
    },
    ...anisotropy === void 0 ? {} : {
      anisotropyStrength: anisotropy.anisotropyStrength ?? 0,
      anisotropyRotation: anisotropy.anisotropyRotation ?? 0,
      anisotropyChannel: [0, 1, 2],
      ...anisotropy.anisotropyTexture === void 0 ? {} : { anisotropyTexture: parseTextureInfo(anisotropy.anisotropyTexture, textures) }
    },
    ...sheen === void 0 ? {} : {
      sheenColorFactor: tuple3(sheen.sheenColorFactor) ?? [0, 0, 0],
      sheenColorChannel: [0, 1, 2],
      sheenRoughnessFactor: sheen.sheenRoughnessFactor ?? 0,
      sheenRoughnessChannel: 3,
      ...sheen.sheenColorTexture === void 0 ? {} : { sheenColorTexture: parseTextureInfo(sheen.sheenColorTexture, textures) },
      ...sheen.sheenRoughnessTexture === void 0 ? {} : { sheenRoughnessTexture: parseTextureInfo(sheen.sheenRoughnessTexture, textures) }
    },
    ...iridescence === void 0 ? {} : {
      iridescenceFactor: iridescence.iridescenceFactor ?? 0,
      iridescenceIor: iridescence.iridescenceIor ?? 1.3,
      iridescenceThicknessMinimum: iridescence.iridescenceThicknessMinimum ?? 100,
      iridescenceThicknessMaximum: iridescence.iridescenceThicknessMaximum ?? 400,
      iridescenceChannel: 0,
      iridescenceThicknessChannel: 1,
      ...iridescence.iridescenceTexture === void 0 ? {} : { iridescenceTexture: parseTextureInfo(iridescence.iridescenceTexture, textures) },
      ...iridescence.iridescenceThicknessTexture === void 0 ? {} : {
        iridescenceThicknessTexture: parseTextureInfo(
          iridescence.iridescenceThicknessTexture,
          textures
        )
      }
    },
    ...specular === void 0 ? {} : {
      specularFactor: specular.specularFactor ?? 1,
      specularChannel: 3,
      specularColorFactor: tuple3(specular.specularColorFactor) ?? [1, 1, 1],
      specularColorChannel: [0, 1, 2],
      ...specular.specularTexture === void 0 ? {} : { specularTexture: parseTextureInfo(specular.specularTexture, textures) },
      ...specular.specularColorTexture === void 0 ? {} : {
        specularColorTexture: parseTextureInfo(specular.specularColorTexture, textures)
      }
    },
    ...alphaMode === void 0 ? {} : { alphaMode },
    ...alphaCutoff === void 0 ? {} : { alphaCutoff },
    ...matJson.doubleSided === true ? { doubleSided: true } : {},
    ...pbr?.baseColorTexture?.texCoord === void 0 || pbr.baseColorTexture.texCoord === 0 ? {} : { baseColorTexCoord: pbr.baseColorTexture.texCoord }
  });
}

// src/meshopt-decode.ts
function viewBytes(view, buffers) {
  const buffer = buffers[view.buffer];
  const offset = view.byteOffset ?? 0;
  if (buffer === void 0 || view.byteLength <= 0 || offset < 0 || offset + view.byteLength > buffer.length) {
    return void 0;
  }
  return buffer.subarray(offset, offset + view.byteLength);
}
function validMode(mode) {
  return GLTF_MESHOPT_MODES.some((candidate) => candidate === mode);
}
function validFilter(filter) {
  return GLTF_MESHOPT_FILTERS.some((candidate) => candidate === filter);
}
function filterAllowed(mode, filter) {
  return mode === "ATTRIBUTES" || filter === "NONE";
}
async function projectMeshoptBufferViews(inputViews, inputBuffers, extensionsRequired, capability) {
  const buffers = [...inputBuffers];
  const bufferViews = inputViews.map((view) => ({ ...view }));
  let decodedCount = 0;
  for (let index = 0; index < bufferViews.length; index++) {
    const view = bufferViews[index];
    if (view === void 0) continue;
    const extension = view.extensions?.EXT_meshopt_compression;
    if (extension === void 0) continue;
    const filter = extension.filter ?? "NONE";
    if (!validMode(extension.mode) || !validFilter(filter) || !filterAllowed(extension.mode, filter) || !Number.isInteger(extension.byteStride) || extension.byteStride <= 0 || !Number.isInteger(extension.count) || extension.count <= 0 || !Number.isInteger(extension.byteLength) || extension.byteLength <= 0) {
      return err(
        gltfErr("gltf-meshopt-decode-failed", {
          bufferView: index,
          actual: "invalid mode/filter/stride/count/byteLength",
          mode: validMode(extension.mode) ? extension.mode : "ATTRIBUTES",
          filter: validFilter(filter) ? filter : "NONE"
        })
      );
    }
    const fallback = viewBytes(view, buffers);
    const required = extensionsRequired.includes("EXT_meshopt_compression");
    if (capability === void 0 && !required && fallback !== void 0) continue;
    if (capability === void 0) {
      return err(
        gltfErr("gltf-meshopt-decoder-required", {
          bufferView: index,
          actual: required ? "required" : "compressed-only",
          hasCoreFallback: fallback !== void 0
        })
      );
    }
    const compressedBuffer = buffers[extension.buffer];
    const compressedOffset = extension.byteOffset ?? 0;
    if (compressedBuffer === void 0 || !Number.isInteger(compressedOffset) || compressedOffset < 0 || compressedOffset + extension.byteLength > compressedBuffer.length) {
      return err(
        gltfErr("gltf-meshopt-decode-failed", {
          bufferView: index,
          actual: "compressed range out of bounds",
          mode: extension.mode,
          filter
        })
      );
    }
    let decoded;
    try {
      decoded = await capability.decode({
        source: compressedBuffer.subarray(
          compressedOffset,
          compressedOffset + extension.byteLength
        ),
        count: extension.count,
        stride: extension.byteStride,
        mode: extension.mode,
        filter
      });
    } catch (cause) {
      return err(
        gltfErr("gltf-meshopt-decode-failed", {
          bufferView: index,
          actual: `decoder rejected compressed range: ${cause instanceof Error ? cause.message : String(cause)}`,
          mode: extension.mode,
          filter
        })
      );
    }
    const expectedLength = extension.count * extension.byteStride;
    if (!(decoded instanceof Uint8Array) || decoded.byteLength !== expectedLength) {
      return err(
        gltfErr("gltf-meshopt-decode-failed", {
          bufferView: index,
          actual: `decoded byteLength=${decoded?.byteLength ?? "invalid"}, expected=${expectedLength}`,
          mode: extension.mode,
          filter
        })
      );
    }
    const decodedBufferIndex = buffers.length;
    buffers.push(decoded);
    const { extensions: _extensions, ...plainView } = view;
    bufferViews[index] = {
      ...plainView,
      buffer: decodedBufferIndex,
      byteOffset: 0,
      byteLength: expectedLength
    };
    decodedCount++;
  }
  return ok({ bufferViews, buffers, decodedCount });
}
var ANIMATION_ACCESSOR_TYPES = ["SCALAR", "VEC2", "VEC3", "VEC4"];
function parseAnimation(animationsJson, nodesJson, accessors, bufferViews, buffers) {
  if (animationsJson === void 0 || animationsJson.length === 0) {
    return ok([]);
  }
  const clips = [];
  const parentOf = buildNodeParentMap(nodesJson);
  const nodeByPath = /* @__PURE__ */ new Map();
  const pathById = /* @__PURE__ */ new Map();
  for (let animIdx = 0; animIdx < animationsJson.length; animIdx++) {
    const anim = animationsJson[animIdx];
    if (anim === void 0) continue;
    const decodedSamplers = [];
    for (let sampIdx = 0; sampIdx < anim.samplers.length; sampIdx++) {
      const sampler = anim.samplers[sampIdx];
      if (sampler === void 0) continue;
      const interpolation = sampler.interpolation ?? "LINEAR";
      if (interpolation === "CUBICSPLINE") {
        return err(
          gltfErr("gltf-animation-cubicspline-unsupported", {
            animationIndex: animIdx,
            samplerIndex: sampIdx
          })
        );
      }
      if (interpolation !== "LINEAR" && interpolation !== "STEP") {
        return err(
          gltfErr("gltf-animation-cubicspline-unsupported", {
            animationIndex: animIdx,
            samplerIndex: sampIdx
          })
        );
      }
      const inputAcc = accessors[sampler.input];
      if (inputAcc === void 0) {
        return err(
          gltfErr("gltf-buffer-out-of-bounds", {
            accessor: sampler.input,
            byteOffset: 0,
            byteLength: 0,
            bufferIndex: 0
          })
        );
      }
      const inputResult = decodeF32Accessor(
        sampler.input,
        inputAcc,
        ANIMATION_ACCESSOR_TYPES,
        bufferViews,
        buffers
      );
      if (!inputResult.ok) return err(inputResult.error);
      const outputAcc = accessors[sampler.output];
      if (outputAcc === void 0) {
        return err(
          gltfErr("gltf-buffer-out-of-bounds", {
            accessor: sampler.output,
            byteOffset: 0,
            byteLength: 0,
            bufferIndex: 0
          })
        );
      }
      const outputResult = decodeF32Accessor(
        sampler.output,
        outputAcc,
        ANIMATION_ACCESSOR_TYPES,
        bufferViews,
        buffers
      );
      if (!outputResult.ok) return err(outputResult.error);
      decodedSamplers.push({
        input: inputResult.value,
        output: outputResult.value,
        interpolation
      });
    }
    const channels = [];
    for (let chIdx = 0; chIdx < anim.channels.length; chIdx++) {
      const ch = anim.channels[chIdx];
      if (ch === void 0) continue;
      const samplerRecord = decodedSamplers[ch.sampler];
      if (samplerRecord === void 0) {
        return err(
          gltfErr("gltf-buffer-out-of-bounds", {
            accessor: ch.sampler,
            byteOffset: 0,
            byteLength: 0,
            bufferIndex: 0
          })
        );
      }
      const targetNodeIdx = ch.target.node;
      const path = targetNodeIdx === void 0 ? { ok: false, reason: "name-missing", nodeIndex: -1 } : resolveNamedNodePath(nodesJson, parentOf, targetNodeIdx);
      if (!path.ok) {
        return err(
          gltfErr("gltf-animation-target-invalid", {
            reason: path.reason,
            animationIndex: animIdx,
            channelIndex: chIdx,
            nodeIndex: path.nodeIndex
          })
        );
      }
      if (ch.target.path !== "weights" && ch.target.path !== "translation" && ch.target.path !== "rotation" && ch.target.path !== "scale") {
        return err(
          gltfErr("gltf-morph-unsupported", {
            animationIndex: animIdx,
            channelIndex: chIdx,
            nodeIndex: ch.target.node ?? -1
          })
        );
      }
      const pathKey = JSON.stringify(path.value);
      const previousNode = nodeByPath.get(pathKey);
      if (previousNode !== void 0 && previousNode !== targetNodeIdx) {
        return err(
          gltfErr("gltf-animation-target-invalid", {
            reason: "path-duplicate",
            animationIndex: animIdx,
            channelIndex: chIdx,
            nodeIndex: targetNodeIdx
          })
        );
      }
      nodeByPath.set(pathKey, targetNodeIdx);
      const targetId = deriveAnimationTargetId(path.value);
      const previousPath = pathById.get(targetId);
      if (previousPath !== void 0 && previousPath !== pathKey) {
        return err(
          gltfErr("gltf-animation-target-invalid", {
            reason: "id-collision",
            animationIndex: animIdx,
            channelIndex: chIdx,
            nodeIndex: targetNodeIdx
          })
        );
      }
      pathById.set(targetId, pathKey);
      channels.push({
        targetId,
        targetNodeIndex: targetNodeIdx,
        property: ch.target.path,
        sampler: samplerRecord
      });
    }
    let duration = 0;
    for (const ch of channels) {
      const input = ch.sampler.input;
      if (input.length > 0) {
        const last = input[input.length - 1];
        if (last !== void 0 && last > duration) {
          duration = last;
        }
      }
    }
    const name = anim.name?.trim();
    clips.push({
      ...name === void 0 || name.length === 0 ? {} : { name },
      duration,
      channels
    });
  }
  return ok(clips);
}
var MAX_JOINTS = 256;
var SKIN_ACCESSOR_TYPES = ["MAT4"];
function identityMat4() {
  const m = new Float32Array(16);
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
}
function resolveJointPath(nodeIndex, nodes, parentOf, skinIndex, jointPathIndex) {
  const path = resolveNamedNodePath(nodes, parentOf, nodeIndex);
  if (!path.ok) {
    return err(
      gltfErr("gltf-skin-joint-name-missing", {
        reason: path.reason,
        skinIndex,
        jointPathIndex,
        nodeIndex: path.nodeIndex
      })
    );
  }
  return ok(path.value);
}
function parseSkin(skinsJson, nodesJson, accessors, bufferViews, buffers) {
  if (skinsJson === void 0 || skinsJson.length === 0) {
    return ok([]);
  }
  const records = [];
  const parentOf = buildNodeParentMap(nodesJson);
  for (let skinIdx = 0; skinIdx < skinsJson.length; skinIdx++) {
    const skin = skinsJson[skinIdx];
    if (skin === void 0) continue;
    const joints = skin.joints;
    if (joints.length > MAX_JOINTS) {
      return err(
        gltfErr("gltf-skin-joint-count-exceeded", {
          skinIndex: skinIdx,
          jointCount: joints.length,
          maxJoints: MAX_JOINTS
        })
      );
    }
    let ibm;
    if (skin.inverseBindMatrices !== void 0) {
      const ibmAccIdx = skin.inverseBindMatrices;
      const ibmAcc = accessors[ibmAccIdx];
      if (ibmAcc === void 0) {
        return err(
          gltfErr("gltf-buffer-out-of-bounds", {
            accessor: ibmAccIdx,
            byteOffset: 0,
            byteLength: 0,
            bufferIndex: 0
          })
        );
      }
      const ibmResult = decodeF32Accessor(
        ibmAccIdx,
        ibmAcc,
        SKIN_ACCESSOR_TYPES,
        bufferViews,
        buffers
      );
      if (!ibmResult.ok) return err(ibmResult.error);
      ibm = ibmResult.value;
    } else {
      ibm = new Float32Array(joints.length * 16);
      for (let j = 0; j < joints.length; j++) {
        ibm.set(identityMat4(), j * 16);
      }
    }
    const jointPaths = [];
    for (let j = 0; j < joints.length; j++) {
      const jointNodeIndex = joints[j];
      if (jointNodeIndex === void 0) continue;
      const pathResult = resolveJointPath(jointNodeIndex, nodesJson, parentOf, skinIdx, j);
      if (!pathResult.ok) return err(pathResult.error);
      jointPaths.push(pathResult.value.join("/"));
    }
    const bounds = parseConservativeAnimatedBounds(
      skin.extras?.forgeax?.conservativeAnimatedBounds
    );
    records.push({
      jointCount: joints.length,
      inverseBindMatrices: ibm,
      jointPaths,
      ...bounds === void 0 ? {} : { bounds }
    });
  }
  return ok(records);
}
var IDENTITY = {
  translation: [0, 0, 0],
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1]
};
function tuple32(arr, fallback) {
  if (arr === void 0 || arr.length < 3) return fallback;
  return [arr[0] ?? fallback[0], arr[1] ?? fallback[1], arr[2] ?? fallback[2]];
}
function tuple4(arr, fallback) {
  if (arr === void 0 || arr.length < 4) return fallback;
  return [
    arr[0] ?? fallback[0],
    arr[1] ?? fallback[1],
    arr[2] ?? fallback[2],
    arr[3] ?? fallback[3]
  ];
}
function decomposeNodeTransform(node, nodeIndex, diagnostics) {
  const hasMatrix = node.matrix !== void 0 && node.matrix.length === 16;
  const hasTrs = node.translation !== void 0 || node.rotation !== void 0 || node.scale !== void 0;
  if (hasMatrix) {
    if (hasTrs) {
      console.error(`[warn] node[${nodeIndex}] has both matrix and TRS, matrix takes precedence`);
      diagnostics.matrixTrsCoexistNodes.push(nodeIndex);
    }
    const out_t = vec3.create();
    const out_r = quat.create();
    const out_s = vec3.create(1, 1, 1);
    const m = node.matrix;
    mat4.decompose(out_t, out_r, out_s, m);
    return {
      translation: [out_t[0] ?? 0, out_t[1] ?? 0, out_t[2] ?? 0],
      rotation: [out_r[0] ?? 0, out_r[1] ?? 0, out_r[2] ?? 0, out_r[3] ?? 1],
      scale: [out_s[0] ?? 1, out_s[1] ?? 1, out_s[2] ?? 1]
    };
  }
  if (!hasTrs) {
    return IDENTITY;
  }
  return {
    translation: tuple32(node.translation, IDENTITY.translation),
    rotation: tuple4(node.rotation, IDENTITY.rotation),
    scale: tuple32(node.scale, IDENTITY.scale)
  };
}

// src/parse-gltf.ts
function decodeNodeInstancing(nodeIndex, attributes, accessors, bufferViews, buffers) {
  const tIdx = attributes.TRANSLATION;
  const rIdx = attributes.ROTATION;
  const sIdx = attributes.SCALE;
  let count;
  const setOrCheck = (label, n2) => {
    if (count === void 0) {
      count = n2;
      return null;
    }
    if (n2 !== count) {
      return gltfErr("gltf-instancing-count-mismatch", {
        nodeIndex,
        accessor: label,
        expectedCount: count,
        actualCount: n2
      });
    }
    return null;
  };
  let tValues;
  if (tIdx !== void 0) {
    const acc = accessors[tIdx];
    if (acc === void 0) return err(unknownAccessor(tIdx));
    const e = setOrCheck("TRANSLATION", acc.count);
    if (e !== null) return err(e);
    const decoded = decodeAttributeAccessor(tIdx, acc, bufferViews, buffers);
    if (!decoded.ok) return err(decoded.error);
    tValues = decoded.value;
  }
  let rValues;
  if (rIdx !== void 0) {
    const acc = accessors[rIdx];
    if (acc === void 0) return err(unknownAccessor(rIdx));
    const e = setOrCheck("ROTATION", acc.count);
    if (e !== null) return err(e);
    const decoded = decodeAttributeAccessor(rIdx, acc, bufferViews, buffers);
    if (!decoded.ok) return err(decoded.error);
    rValues = decoded.value;
  }
  let sValues;
  if (sIdx !== void 0) {
    const acc = accessors[sIdx];
    if (acc === void 0) return err(unknownAccessor(sIdx));
    const e = setOrCheck("SCALE", acc.count);
    if (e !== null) return err(e);
    const decoded = decodeAttributeAccessor(sIdx, acc, bufferViews, buffers);
    if (!decoded.ok) return err(decoded.error);
    sValues = decoded.value;
  }
  const n = count ?? 0;
  const transforms = new Float32Array(n * 16);
  const tmp = mat4.create();
  const tv = vec3.create();
  const rv = quat.create();
  rv[3] = 1;
  const sv = vec3.create(1, 1, 1);
  for (let i = 0; i < n; i++) {
    if (tValues !== void 0) {
      tv[0] = tValues[i * 3] ?? 0;
      tv[1] = tValues[i * 3 + 1] ?? 0;
      tv[2] = tValues[i * 3 + 2] ?? 0;
    } else {
      tv[0] = 0;
      tv[1] = 0;
      tv[2] = 0;
    }
    if (rValues !== void 0) {
      rv[0] = rValues[i * 4] ?? 0;
      rv[1] = rValues[i * 4 + 1] ?? 0;
      rv[2] = rValues[i * 4 + 2] ?? 0;
      rv[3] = rValues[i * 4 + 3] ?? 1;
    } else {
      rv[0] = 0;
      rv[1] = 0;
      rv[2] = 0;
      rv[3] = 1;
    }
    if (sValues !== void 0) {
      sv[0] = sValues[i * 3] ?? 1;
      sv[1] = sValues[i * 3 + 1] ?? 1;
      sv[2] = sValues[i * 3 + 2] ?? 1;
    } else {
      sv[0] = 1;
      sv[1] = 1;
      sv[2] = 1;
    }
    mat4.compose(tmp, tv, rv, sv);
    for (let k = 0; k < 16; k++) {
      transforms[i * 16 + k] = tmp[k] ?? 0;
    }
  }
  return ok({ count: n, transforms });
}
function unknownAccessor(accessorIndex) {
  return gltfErr("gltf-accessor-type-mismatch", {
    accessorIndex,
    reason: "unknownComponentType"
  });
}
function decodeAttributeAccessor(accessorIndex, accessor, bufferViews, buffers) {
  const view = bufferViews[accessor.bufferView ?? -1];
  if (view === void 0) return err(unknownAccessor(accessorIndex));
  const buf = buffers[view.buffer];
  if (buf === void 0) return err(unknownAccessor(accessorIndex));
  const decoded = decodeAccessor({
    accessorIndex,
    accessor,
    bufferView: view,
    buffer: buf,
    role: "attribute"
  });
  if (!decoded.ok) return err(decoded.error);
  if (decoded.value.kind !== "f32") return err(unknownAccessor(accessorIndex));
  return ok(decoded.value.data);
}
async function resolveBuffer(buf, externalLoader, binChunk) {
  if (buf.uri === void 0) {
    if (binChunk === void 0) {
      throw new Error("parseGltf: buffer 0 has no uri and no GLB BIN chunk available");
    }
    return binChunk;
  }
  const dataPayload = dataUriBase64Payload(buf.uri);
  if (dataPayload !== void 0) {
    return decodeBase64(dataPayload);
  }
  const arrayBuffer = await externalLoader(buf.uri);
  return new Uint8Array(arrayBuffer);
}
function invalidBufferDataUriError(filePath, bufferIndex, cause) {
  return new ImportError({
    code: "source-validation-failed",
    expected: `glTF buffer ${bufferIndex} data URI to contain a valid base64 payload`,
    hint: IMPORT_ERROR_HINTS["source-validation-failed"],
    detail: {
      diagnostics: [
        {
          code: "gltf-buffer-data-uri-invalid",
          severity: "error",
          sourcePath: filePath,
          sourceRange: { start: 0, end: 0, line: 1, column: 1 },
          rule: "gltf-buffer-data-uri-base64",
          expected: "a valid base64 payload after ;base64,",
          actual: `buffer ${bufferIndex}: ${cause.message}`,
          hint: "repair the buffer data URI or provide a valid external .bin sibling"
        }
      ]
    }
  });
}
function parsePunctualLights(json, filePath) {
  const source = json.extensions?.KHR_lights_punctual?.lights ?? [];
  const lights = [];
  for (const light of source) {
    const type = light?.type;
    if (type !== "directional" && type !== "point" && type !== "spot") {
      return err(gltfErr("gltf-malformed-header", { filePath, byteOffset: 0 }));
    }
    const color = light.color ?? [1, 1, 1];
    if (color.length < 3 || color.slice(0, 3).some(
      (value) => typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1
    )) {
      return err(gltfErr("gltf-malformed-header", { filePath, byteOffset: 0 }));
    }
    const intensity = light.intensity ?? 1;
    if (typeof intensity !== "number" || !Number.isFinite(intensity) || intensity < 0) {
      return err(gltfErr("gltf-malformed-header", { filePath, byteOffset: 0 }));
    }
    const range = light.range;
    if (range !== void 0 && (typeof range !== "number" || !Number.isFinite(range) || range < 0)) {
      return err(gltfErr("gltf-malformed-header", { filePath, byteOffset: 0 }));
    }
    let spot;
    if (type === "spot") {
      const innerConeAngle = light.spot?.innerConeAngle ?? 0;
      const outerConeAngle = light.spot?.outerConeAngle ?? Math.PI / 4;
      if (!Number.isFinite(innerConeAngle) || !Number.isFinite(outerConeAngle) || innerConeAngle < 0 || innerConeAngle >= outerConeAngle || outerConeAngle > Math.PI / 2) {
        return err(gltfErr("gltf-malformed-header", { filePath, byteOffset: 0 }));
      }
      spot = { innerConeAngle, outerConeAngle };
    }
    lights.push({
      type,
      color: [color[0] ?? 1, color[1] ?? 1, color[2] ?? 1],
      intensity,
      ...range === void 0 || range === 0 ? {} : { range },
      ...spot === void 0 ? {} : { spot }
    });
  }
  return ok(lights);
}
async function parseGltfWithBin(json, ctx) {
  const headerResult = parseGltfHeader(json, ctx.filePath);
  if (!headerResult.ok) return err(headerResult.error);
  const extResult = checkExtensions(json);
  if (!extResult.ok) return err(extResult.error);
  const unsupportedExtensions = extResult.value.unsupportedUsed;
  const lodResult = parseGltfLodExtension(json);
  if (!lodResult.ok) return err(lodResult.error);
  const lightsResult = parsePunctualLights(json, ctx.filePath);
  if (!lightsResult.ok) return err(lightsResult.error);
  const meshesJson = json.meshes ?? [];
  const buffersJson = json.buffers ?? [];
  const buffers = [];
  for (let i = 0; i < buffersJson.length; i++) {
    const bufJson = buffersJson[i];
    if (bufJson === void 0) continue;
    try {
      const bytes = await resolveBuffer(bufJson, ctx.externalLoader, ctx.binChunk);
      buffers.push(bytes);
    } catch (e) {
      if (e instanceof Base64DecodeError) {
        return err(invalidBufferDataUriError(ctx.filePath, i, e));
      }
      return err(
        gltfErr("gltf-malformed-header", {
          filePath: ctx.filePath,
          byteOffset: 0
        })
      );
    }
  }
  const accessors = json.accessors ?? [];
  const rawBufferViews = json.bufferViews ?? [];
  const projected = await projectMeshoptBufferViews(
    rawBufferViews,
    buffers,
    json.extensionsRequired ?? [],
    ctx.meshopt
  );
  if (!projected.ok) return err(projected.error);
  const bufferViews = projected.value.bufferViews;
  buffers.splice(0, buffers.length, ...projected.value.buffers);
  const meshes = [];
  const meshPrimitiveCount = /* @__PURE__ */ new Map();
  for (let meshIndex = 0; meshIndex < meshesJson.length; meshIndex++) {
    const meshJson = meshesJson[meshIndex];
    if (meshJson === void 0) continue;
    meshPrimitiveCount.set(meshIndex, meshJson.primitives.length);
    for (const prim of meshJson.primitives) {
      if (prim === void 0) continue;
      const positionAccessorIndex = prim.attributes?.POSITION;
      if (positionAccessorIndex === void 0) {
        return err(
          gltfErr("gltf-accessor-type-mismatch", {
            accessorIndex: -1,
            reason: "unknownComponentType"
          })
        );
      }
      const positionAccessor = accessors[positionAccessorIndex];
      const positionBufferView = bufferViews[positionAccessor?.bufferView ?? -1];
      if (positionAccessor === void 0 || positionBufferView === void 0) {
        return err(
          gltfErr("gltf-buffer-out-of-bounds", {
            accessor: positionAccessorIndex,
            byteOffset: 0,
            byteLength: 0,
            bufferIndex: positionBufferView?.buffer ?? 0
          })
        );
      }
      const positionBuffer = buffers[positionBufferView.buffer];
      if (positionBuffer === void 0) {
        return err(
          gltfErr("gltf-buffer-out-of-bounds", {
            accessor: positionAccessorIndex,
            byteOffset: positionBufferView.byteOffset ?? 0,
            byteLength: positionBufferView.byteLength,
            bufferIndex: positionBufferView.buffer
          })
        );
      }
      const positionDecoded = decodeAccessor({
        accessorIndex: positionAccessorIndex,
        accessor: positionAccessor,
        bufferView: positionBufferView,
        buffer: positionBuffer,
        role: "attribute"
      });
      if (!positionDecoded.ok) return err(positionDecoded.error);
      if (positionDecoded.value.kind !== "f32") {
        return err(
          gltfErr("gltf-accessor-type-mismatch", {
            accessorIndex: positionAccessorIndex,
            reason: "unknownComponentType"
          })
        );
      }
      const positionsDecoded = positionDecoded.value.data;
      const positions = new Float32Array(positionsDecoded.length);
      positions.set(positionsDecoded);
      const attrs = prim.attributes ?? {};
      let colors0;
      const colorIdx = attrs.COLOR_0;
      if (colorIdx !== void 0) {
        const colorAccessor = accessors[colorIdx];
        const colorBufferView = bufferViews[colorAccessor?.bufferView ?? -1];
        if (colorAccessor === void 0 || colorBufferView === void 0) {
          return err(
            gltfErr("gltf-color-accessor-malformed", {
              semantic: "COLOR_0",
              accessorIndex: colorIdx,
              reason: "reference"
            })
          );
        }
        const colorBuffer = buffers[colorBufferView.buffer];
        if (colorBuffer === void 0) {
          return err(
            gltfErr("gltf-color-accessor-malformed", {
              semantic: "COLOR_0",
              accessorIndex: colorIdx,
              reason: "reference"
            })
          );
        }
        const decoded = decodeColorAccessor({
          accessorIndex: colorIdx,
          accessor: colorAccessor,
          bufferView: colorBufferView,
          buffer: colorBuffer,
          bufferIndex: colorBufferView.buffer,
          semantic: "COLOR_0"
        });
        if (!decoded.ok) return err(decoded.error);
        if (decoded.value.length !== positions.length / 3 * 4) {
          return err(
            gltfErr("gltf-color-accessor-malformed", {
              semantic: "COLOR_0",
              accessorIndex: colorIdx,
              reason: "count"
            })
          );
        }
        colors0 = decoded.value;
      }
      let normals;
      const normalIdx = attrs.NORMAL;
      if (normalIdx !== void 0) {
        const acc = accessors[normalIdx];
        if (acc !== void 0) {
          const decoded = decodeAttributeAccessor(normalIdx, acc, bufferViews, buffers);
          if (decoded.ok) {
            const src = decoded.value;
            const owned = new Float32Array(src.length);
            owned.set(src);
            normals = owned;
          }
        }
      }
      let texcoord0;
      const texIdx = attrs.TEXCOORD_0;
      if (texIdx !== void 0) {
        const acc = accessors[texIdx];
        if (acc !== void 0) {
          const decoded = decodeAttributeAccessor(texIdx, acc, bufferViews, buffers);
          if (decoded.ok) {
            const src = decoded.value;
            const owned = new Float32Array(src.length);
            owned.set(src);
            texcoord0 = owned;
          }
        }
      }
      let texcoord1;
      let texcoord2;
      let texcoord3;
      let texcoord4;
      let texcoord5;
      let texcoord6;
      let texcoord7;
      for (let k = 1; k <= 7; k++) {
        const tcIdx = attrs[`TEXCOORD_${k}`];
        if (tcIdx === void 0) continue;
        const acc = accessors[tcIdx];
        if (acc !== void 0) {
          const decoded = decodeAttributeAccessor(tcIdx, acc, bufferViews, buffers);
          if (decoded.ok) {
            const src = decoded.value;
            const owned = new Float32Array(src.length);
            owned.set(src);
            if (k === 1) texcoord1 = owned;
            else if (k === 2) texcoord2 = owned;
            else if (k === 3) texcoord3 = owned;
            else if (k === 4) texcoord4 = owned;
            else if (k === 5) texcoord5 = owned;
            else if (k === 6) texcoord6 = owned;
            else texcoord7 = owned;
          }
        }
      }
      let tangents;
      const tanIdx = attrs.TANGENT;
      if (tanIdx !== void 0) {
        const acc = accessors[tanIdx];
        if (acc !== void 0) {
          const decoded = decodeAttributeAccessor(tanIdx, acc, bufferViews, buffers);
          if (decoded.ok) {
            const src = decoded.value;
            const owned = new Float32Array(src.length);
            owned.set(src);
            tangents = owned;
          }
        }
      }
      const rawTargets = prim.targets ?? [];
      for (const target of rawTargets) {
        const colorTarget = target.COLOR_0;
        if (colorTarget !== void 0) {
          return err(
            gltfErr("gltf-color-accessor-unsupported", {
              semantic: "COLOR_0",
              accessorIndex: colorTarget,
              reason: "morph"
            })
          );
        }
      }
      const morphAttributeCount = rawTargets.reduce(
        (count, target) => count + (target.POSITION === void 0 ? 0 : 1) + (target.NORMAL === void 0 ? 0 : 1) + (target.TANGENT === void 0 ? 0 : 1),
        0
      );
      const morphError = (reason) => err(
        gltfErr("gltf-morph-invalid", {
          meshIndex,
          primitiveIndex: meshJson.primitives.indexOf(prim),
          reason,
          targetCount: rawTargets.length,
          attributeCount: morphAttributeCount,
          vertexCount: positions.length / 3
        })
      );
      if (rawTargets.length > 8) return morphError("target-count-exceeded");
      if (morphAttributeCount > 8) return morphError("attribute-count-exceeded");
      const morphTargets = [];
      for (const target of rawTargets) {
        const output = {};
        for (const [key, accessorIndex] of Object.entries(target)) {
          if (key !== "POSITION" && key !== "NORMAL" && key !== "TANGENT") continue;
          const targetAccessor = accessors[accessorIndex];
          if (targetAccessor === void 0) return morphError("attribute-length-mismatch");
          const decoded = decodeAttributeAccessor(
            accessorIndex,
            targetAccessor,
            bufferViews,
            buffers
          );
          if (!decoded.ok) {
            return morphError(
              decoded.error.code === "gltf-accessor-type-mismatch" ? "sparse-or-unsupported-accessor" : "attribute-length-mismatch"
            );
          }
          const expected = positions.length / 3 * (key === "TANGENT" ? 4 : 3);
          if (decoded.value.length !== expected) return morphError("attribute-length-mismatch");
          const owned = new Float32Array(decoded.value.length);
          owned.set(decoded.value);
          if (key === "POSITION") output.position = owned;
          else if (key === "NORMAL") output.normal = owned;
          else output.tangent = owned;
        }
        morphTargets.push(output);
      }
      const meshWeights = meshJson.weights;
      if (meshWeights !== void 0 && meshWeights.length !== rawTargets.length) {
        return morphError("weights-length-mismatch");
      }
      const jointsIdx = attrs.JOINTS_0;
      const weightsIdx = attrs.WEIGHTS_0;
      const hasJoints = jointsIdx !== void 0;
      const hasWeights = weightsIdx !== void 0;
      if (hasJoints !== hasWeights) {
        const primitiveIndex = meshJson.primitives.indexOf(prim);
        return err(
          gltfErr("gltf-skin-attr-asymmetric", {
            meshIndex,
            primitiveIndex,
            hasJoints,
            hasWeights
          })
        );
      }
      let joints0;
      let weights0;
      if (hasJoints && hasWeights) {
        const jointsAccessor = accessors[jointsIdx];
        const jointsBufferView = bufferViews[jointsAccessor?.bufferView ?? -1];
        if (jointsAccessor === void 0 || jointsBufferView === void 0) {
          return err(unknownAccessor(jointsIdx));
        }
        const jointsBuffer = buffers[jointsBufferView.buffer];
        if (jointsBuffer === void 0) return err(unknownAccessor(jointsIdx));
        const jointsDecoded = decodeAccessor({
          accessorIndex: jointsIdx,
          accessor: jointsAccessor,
          bufferView: jointsBufferView,
          buffer: jointsBuffer,
          role: "joints"
        });
        if (!jointsDecoded.ok) return err(jointsDecoded.error);
        if (jointsDecoded.value.kind !== "u16") {
          return err(
            gltfErr("gltf-accessor-type-mismatch", {
              accessorIndex: jointsIdx,
              reason: "unknownComponentType"
            })
          );
        }
        const src = jointsDecoded.value.data;
        const owned = new Uint16Array(src.length);
        owned.set(src);
        joints0 = owned;
        const weightsAccessor = accessors[weightsIdx];
        const weightsBufferView = bufferViews[weightsAccessor?.bufferView ?? -1];
        if (weightsAccessor === void 0 || weightsBufferView === void 0) {
          return err(unknownAccessor(weightsIdx));
        }
        const weightsBuffer = buffers[weightsBufferView.buffer];
        if (weightsBuffer === void 0) return err(unknownAccessor(weightsIdx));
        const weightsDecoded = decodeAccessor({
          accessorIndex: weightsIdx,
          accessor: weightsAccessor,
          bufferView: weightsBufferView,
          buffer: weightsBuffer,
          role: "attribute"
        });
        if (!weightsDecoded.ok) return err(weightsDecoded.error);
        if (weightsDecoded.value.kind !== "f32") {
          return err(
            gltfErr("gltf-accessor-type-mismatch", {
              accessorIndex: weightsIdx,
              reason: "unknownComponentType"
            })
          );
        }
        const wsrc = weightsDecoded.value.data;
        const wowned = new Float32Array(wsrc.length);
        wowned.set(wsrc);
        weights0 = wowned;
      }
      let indices;
      if (prim.indices !== void 0) {
        const indexAccessor = accessors[prim.indices];
        const indexBufferView = bufferViews[indexAccessor?.bufferView ?? -1];
        if (indexAccessor === void 0 || indexBufferView === void 0) {
          return err(
            gltfErr("gltf-buffer-out-of-bounds", {
              accessor: prim.indices,
              byteOffset: 0,
              byteLength: 0,
              bufferIndex: indexBufferView?.buffer ?? 0
            })
          );
        }
        const indexBuffer = buffers[indexBufferView.buffer];
        if (indexBuffer === void 0) {
          return err(
            gltfErr("gltf-buffer-out-of-bounds", {
              accessor: prim.indices,
              byteOffset: indexBufferView.byteOffset ?? 0,
              byteLength: indexBufferView.byteLength,
              bufferIndex: indexBufferView.buffer
            })
          );
        }
        const indexDecoded = decodeAccessor({
          accessorIndex: prim.indices,
          accessor: indexAccessor,
          bufferView: indexBufferView,
          buffer: indexBuffer,
          role: "indices"
        });
        if (!indexDecoded.ok) return err(indexDecoded.error);
        if (indexDecoded.value.kind === "u16") {
          const src = indexDecoded.value.data;
          const owned = new Uint16Array(src.length);
          owned.set(src);
          indices = owned;
        } else if (indexDecoded.value.kind === "u32") {
          const src = indexDecoded.value.data;
          const owned = new Uint32Array(src.length);
          owned.set(src);
          indices = owned;
        } else {
          return err(
            gltfErr("gltf-accessor-type-mismatch", {
              accessorIndex: prim.indices,
              reason: "unknownComponentType"
            })
          );
        }
      }
      const meshIr = {
        ...meshJson.name === void 0 ? {} : { name: meshJson.name },
        positions,
        ...normals === void 0 ? {} : { normals },
        ...texcoord0 === void 0 ? {} : { texcoord0 },
        ...texcoord1 === void 0 ? {} : { texcoord1 },
        ...texcoord2 === void 0 ? {} : { texcoord2 },
        ...texcoord3 === void 0 ? {} : { texcoord3 },
        ...texcoord4 === void 0 ? {} : { texcoord4 },
        ...texcoord5 === void 0 ? {} : { texcoord5 },
        ...texcoord6 === void 0 ? {} : { texcoord6 },
        ...texcoord7 === void 0 ? {} : { texcoord7 },
        ...tangents === void 0 ? {} : { tangents },
        ...colors0 === void 0 ? {} : { colors0 },
        ...joints0 === void 0 ? {} : { joints0 },
        ...weights0 === void 0 ? {} : { weights0 },
        ...morphTargets.length === 0 ? {} : { morphTargets },
        ...meshWeights === void 0 ? {} : { morphWeights: new Float32Array(meshWeights) },
        ...indices === void 0 ? {} : { indices },
        materialIndex: prim.material ?? null,
        meshIndex
      };
      meshes.push(meshIr);
    }
  }
  const texturesJson = json.textures ?? [];
  const textures = [];
  for (const texJson of texturesJson) {
    const texIr = {
      source: texJson.source ?? -1,
      ...texJson.sampler === void 0 ? {} : { sampler: texJson.sampler },
      ...texJson.name === void 0 ? {} : { name: texJson.name }
    };
    textures.push(texIr);
  }
  const imagesJson = json.images ?? [];
  const images = [];
  for (const imgJson of imagesJson) {
    const mimeType = imgJson.mimeType;
    if (mimeType !== void 0 && mimeType !== "image/jpeg" && mimeType !== "image/png") {
      return err(gltfErr("gltf-image-mime-unsupported", { mimeType }));
    }
    const imgIr = {
      ...imgJson.uri === void 0 ? {} : { uri: imgJson.uri },
      ...imgJson.mimeType === void 0 ? {} : { mimeType: imgJson.mimeType },
      ...imgJson.bufferView === void 0 ? {} : { bufferView: imgJson.bufferView },
      ...imgJson.name === void 0 ? {} : { name: imgJson.name }
    };
    images.push(imgIr);
  }
  for (const img of images) {
    if (img.uri !== void 0) {
      if (dataUriBase64Payload(img.uri) !== void 0) continue;
      try {
        await ctx.externalLoader(img.uri);
      } catch (_e) {
        return err(gltfErr("gltf-texture-load-failed", { uri: img.uri }));
      }
    }
  }
  const samplersJson = json.samplers ?? [];
  const samplers = [];
  for (const sampJson of samplersJson) {
    samplers.push({
      ...sampJson.magFilter === void 0 ? {} : { magFilter: sampJson.magFilter },
      ...sampJson.minFilter === void 0 ? {} : { minFilter: sampJson.minFilter },
      wrapS: sampJson.wrapS ?? 10497,
      // REPEAT (glTF default)
      wrapT: sampJson.wrapT ?? 10497,
      ...sampJson.name === void 0 ? {} : { name: sampJson.name }
    });
  }
  const materials = [];
  for (const material of json.materials ?? []) {
    const parsedMaterial = parseMaterial(material, textures);
    if (!parsedMaterial.ok) return err(parsedMaterial.error);
    materials.push(parsedMaterial.value);
  }
  const diagnostics = {
    nodeNames: [],
    unsupportedExtensions: [...unsupportedExtensions],
    matrixTrsCoexistNodes: []
  };
  const nodes = [];
  const nodesJson = json.nodes ?? [];
  for (let nodeIndex = 0; nodeIndex < nodesJson.length; nodeIndex++) {
    const nodeJson = nodesJson[nodeIndex];
    if (nodeJson === void 0) continue;
    const transform = decomposeNodeTransform(nodeJson, nodeIndex, diagnostics);
    if (nodeJson.name !== void 0) diagnostics.nodeNames.push(nodeJson.name);
    const instancingExt = nodeJson.extensions?.EXT_mesh_gpu_instancing;
    let instancing;
    if (instancingExt !== void 0) {
      const instancingResult = decodeNodeInstancing(
        nodeIndex,
        instancingExt.attributes ?? {},
        accessors,
        bufferViews,
        buffers
      );
      if (!instancingResult.ok) return err(instancingResult.error);
      instancing = instancingResult.value;
    }
    const nodeMorphWeights = nodeJson.weights === void 0 ? void 0 : new Float32Array(nodeJson.weights);
    nodes.push({
      ...nodeJson.name === void 0 ? {} : { name: nodeJson.name },
      transform,
      meshIndex: nodeJson.mesh ?? null,
      skinIndex: nodeJson.skin ?? null,
      children: nodeJson.children ?? [],
      camera: nodeJson.camera ?? null,
      lightIndex: nodeJson.extensions?.KHR_lights_punctual?.light ?? null,
      ...instancing === void 0 ? {} : { instancing },
      ...nodeMorphWeights === void 0 ? {} : { morphWeights: nodeMorphWeights }
    });
  }
  const scenesJson = json.scenes ?? [];
  const scenes = scenesJson.map((s) => ({
    ...s.name === void 0 ? {} : { name: s.name },
    nodes: s.nodes ?? []
  }));
  const defaultSceneIndex = json.scene ?? 0;
  const skinsJson = json.skins;
  const skinResult = parseSkin(skinsJson, nodesJson, accessors, bufferViews, buffers);
  if (!skinResult.ok) return err(skinResult.error);
  const skeletons = skinResult.value;
  const animationsJson = json.animations;
  const animResult = parseAnimation(animationsJson, nodesJson, accessors, bufferViews, buffers);
  if (!animResult.ok) return err(animResult.error);
  const animationClips = animResult.value;
  return ok({
    meshes,
    materials,
    nodes,
    scenes,
    skeletons,
    animationClips,
    textures: textures.length > 0 ? textures : void 0,
    images: images.length > 0 ? images : void 0,
    samplers: samplers.length > 0 ? samplers : void 0,
    defaultSceneIndex,
    diagnostics: {
      nodeNames: diagnostics.nodeNames,
      unsupportedExtensions: diagnostics.unsupportedExtensions,
      matrixTrsCoexistNodes: diagnostics.matrixTrsCoexistNodes
    },
    meshPrimitiveCount,
    lights: lightsResult.value,
    ...lodResult.value.lodNodeIds.length === 0 ? {} : { lod: lodResult.value }
  });
}
async function parseGltfForImporter(json, externalLoader, filePath, options = {}) {
  if (json === null || typeof json !== "object") {
    return err(
      gltfErr("gltf-malformed-header", {
        filePath,
        byteOffset: 0
      })
    );
  }
  return parseGltfWithBin(json, {
    externalLoader,
    filePath,
    ...options.meshopt === void 0 ? {} : { meshopt: options.meshopt }
  });
}
async function parseGlbForImporter(buffer, filePath, options = {}) {
  const chunksResult = parseGlbChunks(buffer, filePath);
  if (!chunksResult.ok) return err(chunksResult.error);
  let json;
  try {
    json = JSON.parse(new TextDecoder().decode(chunksResult.value.jsonChunk));
  } catch (_e) {
    return err(
      gltfErr("gltf-malformed-header", {
        filePath,
        byteOffset: 12
      })
    );
  }
  if (json === null || typeof json !== "object") {
    return err(
      gltfErr("gltf-malformed-header", {
        filePath,
        byteOffset: 12
      })
    );
  }
  const externalLoader = async (uri) => {
    throw new Error(`parseGlb: GLB containers must not reference external URIs (got ${uri})`);
  };
  return parseGltfWithBin(json, {
    externalLoader,
    ...chunksResult.value.binChunk === void 0 ? {} : { binChunk: chunksResult.value.binChunk },
    filePath,
    ...options.meshopt === void 0 ? {} : { meshopt: options.meshopt }
  });
}

// src/gltf-importer.ts
function isGlbBytes(source) {
  return source.toLowerCase().endsWith(".glb");
}
function parseFailureMessage(prefix, error) {
  const detail = error.detail === void 0 ? "" : ` detail=${JSON.stringify(error.detail)}`;
  return `${prefix}: ${error.code} ${error.expected}${detail}`;
}
function publishesCatalogProduct(input) {
  return input.importSettings.geometry !== "procedural";
}
function applyImportSettingsBounds(doc, importSettings) {
  let changed = false;
  const skeletons = doc.skeletons.map((record, sourceIndex) => {
    const bounds = readConservativeAnimatedBounds(importSettings, sourceIndex);
    if (bounds === void 0 || record.bounds !== void 0) return record;
    changed = true;
    return { ...record, bounds };
  });
  return changed ? { ...doc, skeletons } : doc;
}
function previousMaterialSlotTopology(ctx, meshSourceKey) {
  if (meshSourceKey === void 0) return void 0;
  const value = ctx.sourceOverrides?.[meshSourceKey]?.materialSlots;
  if (value === void 0) return void 0;
  if (!Array.isArray(value)) {
    throw new ImportError({
      code: "invalid-source-override-payload",
      expected: `${meshSourceKey}.materialSlots to be an array`,
      hint: IMPORT_ERROR_HINTS["invalid-source-override-payload"],
      detail: {
        sourceKey: meshSourceKey,
        declaredSourceKeys: ctx.subAssets.flatMap((entry) => entry.sourceKey ?? []),
        reason: "materialSlots is not an array"
      }
    });
  }
  const slots = [];
  for (const [index, raw] of value.entries()) {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      throw new ImportError({
        code: "invalid-source-override-payload",
        expected: `${meshSourceKey}.materialSlots[${index}] to be an object`,
        hint: IMPORT_ERROR_HINTS["invalid-source-override-payload"],
        detail: {
          sourceKey: meshSourceKey,
          declaredSourceKeys: ctx.subAssets.flatMap((entry) => entry.sourceKey ?? []),
          reason: `materialSlots[${index}] is not an object`
        }
      });
    }
    const slot = raw;
    if (typeof slot.slotName !== "string" || slot.slotName.trim().length === 0) {
      throw new ImportError({
        code: "invalid-source-override-payload",
        expected: `${meshSourceKey}.materialSlots[${index}].slotName to be non-empty`,
        hint: IMPORT_ERROR_HINTS["invalid-source-override-payload"],
        detail: {
          sourceKey: meshSourceKey,
          declaredSourceKeys: ctx.subAssets.flatMap((entry) => entry.sourceKey ?? []),
          reason: `materialSlots[${index}].slotName is invalid`
        }
      });
    }
    slots.push({
      slotName: slot.slotName,
      ...typeof slot.sourceKey === "string" ? { sourceKey: slot.sourceKey } : {},
      ...typeof slot.defaultMaterialGuid === "string" ? { defaultMaterialGuid: slot.defaultMaterialGuid } : {}
    });
  }
  return slots;
}
function stabilizeMeshMaterialSlots(mesh, ctx, meshGuid, meshSourceKey) {
  const current = mesh.materialSlots.map(
    (slot) => ({
      slotName: slot.slotName,
      ...slot.sourceKey === void 0 ? {} : { sourceKey: slot.sourceKey },
      ...slot.defaultMaterial === void 0 ? {} : { defaultMaterialGuid: AssetGuid.format(slot.defaultMaterial) }
    })
  );
  const reconciled = reconcileMeshMaterialSlotTopology(
    current,
    previousMaterialSlotTopology(ctx, meshSourceKey)
  );
  if (!reconciled.ok) {
    throw new ImportError({
      code: "mesh-material-slot-topology-change",
      expected: `unambiguous material slot identity for mesh ${meshGuid}`,
      hint: IMPORT_ERROR_HINTS["mesh-material-slot-topology-change"],
      detail: {
        meshGuid,
        ...meshSourceKey === void 0 ? {} : { meshSourceKey },
        previousIndices: reconciled.error.previousIndices,
        nextIndices: reconciled.error.nextIndices
      }
    });
  }
  const authoredDefaults = meshSourceKey === void 0 ? void 0 : ctx.sourceOverrides?.[meshSourceKey]?.materialSlotDefaultOverrides;
  if (authoredDefaults !== void 0 && (authoredDefaults === null || typeof authoredDefaults !== "object" || Array.isArray(authoredDefaults))) {
    throw new ImportError({
      code: "invalid-source-override-payload",
      expected: `${meshSourceKey}.materialSlotDefaultOverrides to be an object`,
      hint: IMPORT_ERROR_HINTS["invalid-source-override-payload"],
      detail: {
        sourceKey: meshSourceKey,
        declaredSourceKeys: [],
        reason: "materialSlotDefaultOverrides is invalid"
      }
    });
  }
  const authoredBySlot = authoredDefaults;
  const activeStableSlots = new Set(reconciled.currentToStableSlot);
  return {
    ...mesh,
    submeshes: mesh.submeshes.map((submesh) => ({
      ...submesh,
      materialSlot: reconciled.currentToStableSlot[submesh.materialSlot]
    })),
    materialSlots: reconciled.slots.map((slot, stableIndex) => {
      const active = activeStableSlots.has(stableIndex);
      const authored = authoredBySlot?.[slot.sourceKey ?? slot.slotName];
      const effectiveDefault = resolveMeshMaterialSlotDefaultGuid(
        slot,
        active && (typeof authored === "string" || authored === null) ? authored : void 0
      );
      const parsed = effectiveDefault === void 0 ? void 0 : AssetGuid.parse(effectiveDefault);
      return {
        slotName: slot.slotName,
        ...slot.sourceKey === void 0 ? {} : { sourceKey: slot.sourceKey },
        ...active && parsed?.ok ? { defaultMaterial: parsed.value } : {}
      };
    })
  };
}
async function parseDoc(source, bytes, ctx, meshopt) {
  const ab = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  );
  if (isGlbBytes(source)) {
    const res2 = await parseGlbForImporter(ab, source, meshopt === void 0 ? {} : { meshopt });
    if (!res2.ok) {
      if (res2.error instanceof ImportError) return { ok: false, error: res2.error };
      throw new Error(parseFailureMessage("parseGlb failed", res2.error));
    }
    return { ok: true, value: res2.value };
  }
  let json;
  try {
    json = JSON.parse(new TextDecoder().decode(bytes));
  } catch (e) {
    throw new Error(`gltf JSON parse failed: ${e instanceof Error ? e.message : String(e)}`);
  }
  const externalLoader = async (uri) => {
    const sib = await ctx.readSibling(uri);
    if (!sib.ok) {
      throw new Error(`gltfImporter: external buffer "${uri}" read failed: ${sib.error.code}`);
    }
    return sib.value.buffer.slice(
      sib.value.byteOffset,
      sib.value.byteOffset + sib.value.byteLength
    );
  };
  const res = await parseGltfForImporter(
    json,
    externalLoader,
    source,
    meshopt === void 0 ? {} : { meshopt }
  );
  if (!res.ok) {
    if (res.error instanceof ImportError) return { ok: false, error: res.error };
    throw new Error(parseFailureMessage("parseGltf failed", res.error));
  }
  return { ok: true, value: res.value };
}
function buildHandleMaps(subAssets, doc) {
  const meshHandles = /* @__PURE__ */ new Map();
  const materialHandles = /* @__PURE__ */ new Map();
  const textureHandles = /* @__PURE__ */ new Map();
  const samplerHandles = /* @__PURE__ */ new Map();
  const meshGuidByIndex = /* @__PURE__ */ new Map();
  const materialGuidByIndex = /* @__PURE__ */ new Map();
  const textureGuidByIndex = /* @__PURE__ */ new Map();
  const samplerGuidByIndex = /* @__PURE__ */ new Map();
  let meshCursor = 0;
  let materialCursor = 0;
  for (const sub of subAssets) {
    if (sub.kind === "mesh") {
      meshHandles.set(sub.sourceIndex, toShared(meshCursor));
      meshGuidByIndex.set(sub.sourceIndex, sub.guid);
      meshCursor += 1;
    } else if (sub.kind === "material") {
      materialHandles.set(sub.sourceIndex, toShared(materialCursor));
      materialGuidByIndex.set(sub.sourceIndex, sub.guid);
      materialCursor += 1;
    } else if (sub.kind === "texture") {
      textureGuidByIndex.set(sub.sourceIndex, sub.guid);
    } else if (sub.kind === "sampler") {
      samplerGuidByIndex.set(sub.sourceIndex, sub.guid);
    }
  }
  const meshCount = meshCursor;
  if (meshCount > 0) {
    for (const [k, v] of materialHandles) {
      const local = v;
      materialHandles.set(k, toShared(local + meshCount));
    }
  }
  const textures = doc.textures ?? [];
  for (let texIndex = 0; texIndex < textures.length; texIndex++) {
    const tex = textures[texIndex];
    if (tex === void 0) continue;
    if (textureGuidByIndex.has(tex.source)) {
      textureHandles.set(texIndex, toShared(tex.source));
    }
  }
  for (const [samplerIndex] of samplerGuidByIndex) {
    samplerHandles.set(samplerIndex, toShared(samplerIndex));
  }
  return {
    meshHandles,
    materialHandles,
    textureHandles,
    samplerHandles,
    meshGuidByIndex,
    materialGuidByIndex,
    textureGuidByIndex,
    samplerGuidByIndex
  };
}
function textureInfo2(info) {
  return info === void 0 ? void 0 : typeof info === "number" ? { texture: info } : info;
}
function materialRefsForPack(mat, doc, textureGuidByIndex, samplerGuidByIndex = /* @__PURE__ */ new Map()) {
  const refs = [];
  const textures = doc.textures ?? [];
  function pushRefsForSlot(info, fieldName) {
    const binding = textureInfo2(info);
    if (binding === void 0) return;
    const tex = textures[binding.texture];
    if (tex === void 0) return;
    const guid = textureGuidByIndex.get(tex.source);
    if (guid !== void 0) {
      refs.push({
        guid,
        sourceField: { componentName: "<material>", fieldName }
      });
    }
    if (binding.sampler !== void 0) {
      const samplerGuid = samplerGuidByIndex.get(binding.sampler);
      if (samplerGuid !== void 0) {
        refs.push({
          guid: samplerGuid,
          sourceField: { componentName: "<material>", fieldName: `${fieldName}.sampler` }
        });
      }
    }
  }
  pushRefsForSlot(mat.baseColorTexture, "baseColorTexture");
  pushRefsForSlot(mat.metallicRoughnessTexture, "metallicRoughnessTexture");
  pushRefsForSlot(mat.normalTexture, "normalTexture");
  pushRefsForSlot(mat.occlusionTexture, "occlusionTexture");
  pushRefsForSlot(mat.emissiveTexture, "emissiveTexture");
  pushRefsForSlot(mat.transmissionTexture, "transmissionTexture");
  pushRefsForSlot(mat.thicknessTexture, "thicknessTexture");
  pushRefsForSlot(mat.clearcoatTexture, "clearcoatTexture");
  pushRefsForSlot(mat.clearcoatRoughnessTexture, "clearcoatRoughnessTexture");
  pushRefsForSlot(mat.clearcoatNormalTexture, "clearcoatNormalTexture");
  pushRefsForSlot(mat.anisotropyTexture, "anisotropyTexture");
  pushRefsForSlot(mat.sheenColorTexture, "sheenColorTexture");
  pushRefsForSlot(mat.sheenRoughnessTexture, "sheenRoughnessTexture");
  pushRefsForSlot(mat.iridescenceTexture, "iridescenceTexture");
  pushRefsForSlot(mat.iridescenceThicknessTexture, "iridescenceThicknessTexture");
  pushRefsForSlot(mat.specularTexture, "specularTexture");
  pushRefsForSlot(mat.specularColorTexture, "specularColorTexture");
  return refs;
}
function availableUvSets(mesh) {
  const sets = [];
  for (let set = 0; set <= 7; set++) {
    const field = `texcoord${set}`;
    if (mesh[field] !== void 0) sets.push(set);
  }
  return sets;
}
function rewriteMaterialAssetRefs(matAsset, mat, doc, maps) {
  const values = { ...matAsset.values ?? {} };
  const textures = doc.textures ?? [];
  const slots = [
    ["baseColorTexture", mat.baseColorTexture],
    ["metallicRoughnessTexture", mat.metallicRoughnessTexture],
    ["normalTexture", mat.normalTexture],
    ["occlusionTexture", mat.occlusionTexture],
    ["emissiveTexture", mat.emissiveTexture],
    ["transmissionTexture", mat.transmissionTexture],
    ["thicknessTexture", mat.thicknessTexture],
    ["clearcoatTexture", mat.clearcoatTexture],
    ["clearcoatRoughnessTexture", mat.clearcoatRoughnessTexture],
    ["clearcoatNormalTexture", mat.clearcoatNormalTexture],
    ["anisotropyTexture", mat.anisotropyTexture],
    ["sheenColorTexture", mat.sheenColorTexture],
    ["sheenRoughnessTexture", mat.sheenRoughnessTexture],
    ["iridescenceTexture", mat.iridescenceTexture],
    ["iridescenceThicknessTexture", mat.iridescenceThicknessTexture],
    ["specularTexture", mat.specularTexture],
    ["specularColorTexture", mat.specularColorTexture]
  ];
  let cursor = 0;
  for (const [slot, rawBinding] of slots) {
    const binding = textureInfo2(rawBinding);
    if (binding === void 0) continue;
    const texture = textures[binding.texture];
    const textureGuid = texture === void 0 ? void 0 : maps.textureGuidByIndex.get(texture.source);
    const value = values[slot];
    if (textureGuid === void 0 || typeof value !== "object" || value === null) {
      delete values[slot];
      continue;
    }
    const textureValue2 = value;
    const textureRef = cursor;
    cursor++;
    const rewritten = binding.sampler !== void 0 && maps.samplerGuidByIndex.has(binding.sampler) ? {
      ...textureValue2,
      texture: textureRef,
      sampler: cursor
    } : { ...textureValue2, texture: textureRef };
    if (binding.sampler !== void 0 && maps.samplerGuidByIndex.has(binding.sampler)) cursor++;
    values[slot] = rewritten;
  }
  return { ...matAsset, values };
}
async function importGltf(ctx, meshopt) {
  const read = await ctx.readSource();
  if (!read.ok) {
    throw new Error(
      `gltfImporter: readSource failed: ${read.error instanceof Error ? read.error.message : String(read.error)}`
    );
  }
  const parsed = await parseDoc(ctx.source, read.value, ctx, meshopt);
  if (!parsed.ok) return parsed;
  const doc = deriveGltfAnimatedBounds(applyImportSettingsBounds(parsed.value, ctx.importSettings));
  const maps = buildHandleMaps(ctx.subAssets, doc);
  const imageColorSpaces = deriveTextureColorSpace({
    imageCount: (doc.images ?? []).length,
    textures: doc.textures,
    materials: doc.materials
  });
  const declaredImageIndices = /* @__PURE__ */ new Set();
  for (const sub of ctx.subAssets) {
    if (sub.kind === "texture") declaredImageIndices.add(sub.sourceIndex);
  }
  const extraction = declaredImageIndices.size > 0 ? await extractImageBytes(read.value, ctx.source, ctx) : {
    extracted: /* @__PURE__ */ new Map(),
    failures: []
  };
  const skeletonGuidBySourceIndex = /* @__PURE__ */ new Map();
  for (const sub of ctx.subAssets) {
    if (sub.kind === "skeleton") skeletonGuidBySourceIndex.set(sub.sourceIndex, sub.guid);
  }
  const skinGuidBySourceIndex = /* @__PURE__ */ new Map();
  for (const sub of ctx.subAssets) {
    if (sub.kind === "skin") skinGuidBySourceIndex.set(sub.sourceIndex, sub.guid);
  }
  const out = [];
  const isMultiAsset = ctx.subAssets.length > 1;
  for (const sub of ctx.subAssets) {
    if (sub.kind === "mesh") {
      const prims = doc.meshes.filter((m) => m.meshIndex === sub.sourceIndex);
      if (prims.length === 0) continue;
      const meshName = isMultiAsset ? prims[0]?.name : void 0;
      const materialNameByIndex = /* @__PURE__ */ new Map();
      const materialSourceKeyByIndex = /* @__PURE__ */ new Map();
      for (let materialIndex = 0; materialIndex < doc.materials.length; materialIndex++) {
        const name = doc.materials[materialIndex]?.name;
        if (typeof name === "string") materialNameByIndex.set(materialIndex, name);
      }
      for (const material of ctx.subAssets) {
        if (material.kind === "material" && material.sourceKey !== void 0) {
          materialSourceKeyByIndex.set(material.sourceIndex, material.sourceKey);
        }
      }
      const bridged = meshIrToMeshAsset(prims, {
        guidByIndex: maps.materialGuidByIndex,
        nameByIndex: materialNameByIndex,
        sourceKeyByIndex: materialSourceKeyByIndex
      });
      if (!bridged.ok) {
        return {
          ok: false,
          error: new ImportError({
            code: "import-internal-error",
            expected: "gltf mesh bridge to produce a canonical MeshAsset",
            actual: bridged.error.code,
            hint: "repair the source primitive and re-run the glTF importer",
            detail: {
              reason: `gltf mesh bridge rejected mesh ${sub.sourceIndex}; inspect the bridge error detail`
            }
          })
        };
      }
      const stabilizedMesh = stabilizeMeshMaterialSlots(
        bridged.value,
        ctx,
        sub.guid,
        sub.sourceKey
      );
      const lodGroup = doc.lod?.groups?.find(
        (group) => doc.nodes[group.rootNode]?.meshIndex === sub.sourceIndex
      ) ?? (doc.lod?.rootNode !== void 0 && doc.nodes[doc.lod.rootNode]?.meshIndex === sub.sourceIndex ? doc.lod : void 0);
      const rootMeshIndex = lodGroup === void 0 ? void 0 : sub.sourceIndex;
      if (lodGroup !== void 0) {
        const referencedMeshIndices = [
          sub.sourceIndex,
          ...lodGroup.lodNodeIds.map((nodeIndex) => doc.nodes[nodeIndex]?.meshIndex)
        ];
        const missingMeshIndex = referencedMeshIndices.find(
          (meshIndex) => !Number.isInteger(meshIndex) || meshIndex === null || meshIndex === void 0 || maps.meshGuidByIndex.get(meshIndex) === void 0
        );
        if (missingMeshIndex !== void 0) {
          return {
            ok: false,
            error: new ImportError({
              code: "import-internal-error",
              expected: "every MSFT_lod node to resolve a cooked mesh sub-asset",
              actual: String(missingMeshIndex),
              hint: "repair the referenced glTF mesh primitives and re-run the importer",
              detail: {
                reason: `MSFT_lod group for mesh ${sub.sourceIndex} references an unprojected mesh`
              }
            })
          };
        }
      }
      const authoredLods = sub.sourceKey === void 0 ? void 0 : ctx.sourceOverrides?.[sub.sourceKey]?.lods;
      const lodEntries = Array.isArray(authoredLods) ? authoredLods : [];
      const lodLevels = rootMeshIndex === sub.sourceIndex && lodGroup !== void 0 ? lodGroup.lodNodeIds.flatMap((nodeIndex, index) => {
        const meshIndex = doc.nodes[nodeIndex]?.meshIndex;
        const guid = meshIndex === void 0 || meshIndex === null ? void 0 : maps.meshGuidByIndex.get(meshIndex);
        if (guid === void 0) return [];
        const authored = lodEntries[index];
        const authoredCoverage = authored !== null && typeof authored === "object" ? authored.screenCoverage : void 0;
        const coverage = typeof authoredCoverage === "number" ? authoredCoverage : lodGroup.screenCoverages[index] ?? deriveDefaultLodScreenCoverages(lodGroup.lodNodeIds.length + 1)[index];
        const parsed2 = AssetGuid.parse(guid);
        return parsed2.ok && coverage !== void 0 ? [{ mesh: parsed2.value, screenCoverage: coverage, guid }] : [];
      }) : [];
      const meshPayload = lodLevels.length === 0 ? stabilizedMesh : {
        ...stabilizedMesh,
        lods: lodLevels.map(({ mesh, screenCoverage }) => ({ mesh, screenCoverage }))
      };
      const materialRefs = [];
      const seenMaterialGuids = /* @__PURE__ */ new Set();
      for (let slotIndex = 0; slotIndex < meshPayload.materialSlots.length; slotIndex++) {
        const defaultMaterial = meshPayload.materialSlots[slotIndex]?.defaultMaterial;
        const guid = defaultMaterial === void 0 ? void 0 : AssetGuid.format(defaultMaterial);
        if (guid !== void 0 && !seenMaterialGuids.has(guid.toLowerCase())) {
          seenMaterialGuids.add(guid.toLowerCase());
          materialRefs.push({
            guid,
            sourceField: { fieldName: "materialSlots", arrayIndex: slotIndex }
          });
        }
      }
      for (const [lodIndex, level] of lodLevels.entries()) {
        if (!seenMaterialGuids.has(level.guid.toLowerCase())) {
          seenMaterialGuids.add(level.guid.toLowerCase());
          materialRefs.push({
            guid: level.guid,
            sourceField: { fieldName: "lods", arrayIndex: lodIndex }
          });
        }
      }
      out.push({
        guid: sub.guid,
        kind: "mesh",
        ...meshName !== void 0 ? { name: meshName } : {},
        payload: meshPayload,
        refs: materialRefs,
        artifacts: {
          body: {
            mediaType: "application/x-forgeax-mesh",
            assetCodec: { name: "mesh-binary", version: "4" },
            bytes: (() => {
              const packed = packMeshBinV4(
                meshPayload,
                sub.sourceKey ?? ctx.source,
                materialRefs.map((ref) => ref.guid)
              );
              if (!packed.ok) {
                throw new ImportError({
                  code: "import-internal-error",
                  expected: "mesh-bin v4 producer to accept the canonical mesh projection",
                  hint: "re-cook the source with its Meta sidecar after fixing the mesh payload",
                  detail: { reason: `${packed.error.code}: ${packed.error.actual}` }
                });
              }
              return packed.value;
            })()
          }
        }
      });
    } else if (sub.kind === "material") {
      const mat = doc.materials[sub.sourceIndex];
      if (mat === void 0) continue;
      let skinned = false;
      for (const meshIr of doc.meshes) {
        if (meshIr.materialIndex !== sub.sourceIndex) continue;
        if (meshIr.joints0 !== void 0 && meshIr.weights0 !== void 0) {
          skinned = true;
          break;
        }
      }
      for (let primitiveIndex = 0; primitiveIndex < doc.meshes.length; primitiveIndex++) {
        const meshIr = doc.meshes[primitiveIndex];
        if (meshIr?.materialIndex !== sub.sourceIndex) continue;
        const uvResult = validateMaterialUvSets(
          mat,
          `primitive-${primitiveIndex}`,
          availableUvSets(meshIr)
        );
        if (!uvResult.ok) {
          throw Object.assign(new Error(uvResult.error.message), uvResult.error);
        }
        const tangentResult = validateMaterialTangentInputs(mat, meshIr);
        if (!tangentResult.ok) {
          throw Object.assign(new Error(tangentResult.error.message), tangentResult.error);
        }
      }
      const matAsset = toMaterialAsset(mat, {
        textureHandles: maps.textureHandles,
        samplerHandles: maps.samplerHandles,
        skinned,
        ...typeof ctx.importSettings.standardMaterialGuid === "string" ? { standardRootGuid: ctx.importSettings.standardMaterialGuid } : {}
      });
      const refs = materialRefsForPack(mat, doc, maps.textureGuidByIndex, maps.samplerGuidByIndex);
      const materialRefs = [...refs];
      if (matAsset.parent !== void 0) {
        materialRefs.push({
          guid: matAsset.parent,
          sourceField: { fieldName: "parent" }
        });
      }
      const rewrittenAsset = rewriteMaterialAssetRefs(matAsset, mat, doc, maps);
      const matName = isMultiAsset ? mat.name : void 0;
      out.push({
        guid: sub.guid,
        kind: "material",
        ...matName !== void 0 ? { name: matName } : {},
        payload: rewrittenAsset,
        refs: materialRefs,
        artifacts: {}
      });
    } else if (sub.kind === "texture") {
      const imageIndex = sub.sourceIndex;
      const extracted = extraction.extracted.get(imageIndex);
      if (extracted === void 0) {
        const failure = extraction.failures.find((f) => f.imageIndex === imageIndex);
        const detail = failure ?? {
          imageIndex,
          source: "bufferView",
          reason: "image row missing from extraction map (no images[] entry?)"
        };
        const error = gltfErr("gltf-image-extract-failed", detail);
        throw new Error(
          `gltfImporter: ${error.code} on image ${imageIndex} (${detail.source}): ${detail.reason}`
        );
      }
      const colorSpace = imageColorSpaces.get(imageIndex) ?? "linear";
      const decodeSettings = {
        ...ctx.importSettings,
        colorSpace,
        mipmap: ctx.importSettings.mipmap ?? true
      };
      const decoded = await ctx.decodeImage(extracted.bytes, extracted.mimeType, decodeSettings);
      if (!decoded.ok) {
        const reason = `decodeImage failed: ${decoded.error.code}`;
        const error = gltfErr("gltf-image-extract-failed", {
          imageIndex,
          source: extracted.source,
          reason
        });
        throw new Error(
          `gltfImporter: ${error.code} on image ${imageIndex} (${extracted.source}): ${reason}`
        );
      }
      const imageItem = (doc.images ?? [])[imageIndex];
      const texName = isMultiAsset ? imageItem?.name : void 0;
      out.push({
        guid: sub.guid,
        kind: "texture",
        ...texName !== void 0 ? { name: texName } : {},
        payload: decoded.value.texture,
        refs: [],
        artifacts: {
          body: {
            mediaType: decoded.value.mediaType ?? extracted.mimeType,
            assetCodec: decoded.value.assetCodec ?? { name: "rgba8", version: "1" },
            bytes: decoded.value.bytes
          }
        }
      });
    } else if (sub.kind === "sampler") {
      const sampler = doc.samplers?.[sub.sourceIndex];
      if (sampler === void 0) continue;
      const filter = (value) => {
        if (value === void 0) return void 0;
        return value === 9728 || value === 9984 || value === 9986 || value === 9988 ? "nearest" : "linear";
      };
      const mipmapFilter = (value) => {
        if (value === void 0) return void 0;
        return value === 9984 || value === 9985 ? "nearest" : "linear";
      };
      const addressMode = (value) => {
        if (value === 33071) return "clamp-to-edge";
        if (value === 33648) return "mirror-repeat";
        return "repeat";
      };
      const magFilter = filter(sampler.magFilter);
      const minFilter = filter(sampler.minFilter);
      const mipmap = mipmapFilter(sampler.minFilter);
      const payload = {
        kind: "sampler",
        ...magFilter === void 0 ? {} : { magFilter },
        ...minFilter === void 0 ? {} : { minFilter },
        ...mipmap === void 0 ? {} : { mipmapFilter: mipmap },
        addressModeU: addressMode(sampler.wrapS),
        addressModeV: addressMode(sampler.wrapT)
      };
      out.push({ guid: sub.guid, kind: "sampler", payload, refs: [], artifacts: {} });
    } else if (sub.kind === "scene") {
      let makeRef2 = function(guid, idx) {
        const prov = handleValueProvenance.get(idx);
        if (prov !== void 0) {
          return {
            guid,
            sourceField: {
              componentName: prov.componentName,
              fieldName: prov.fieldName,
              ...prov.arrayIndex !== void 0 ? { arrayIndex: prov.arrayIndex } : {}
            },
            sceneEntityKey: prov.sceneEntityKey
          };
        }
        return { guid };
      };
      const scene = gltfDocToSceneAsset(doc, {
        meshHandles: maps.meshHandles,
        skeletonGuidBySkinIndex: skeletonGuidBySourceIndex
      });
      const handleValueProvenance = /* @__PURE__ */ new Map();
      const skeletonGuidProvenance = /* @__PURE__ */ new Map();
      for (const [sceneEntityKey, entity] of Object.entries(scene.entities)) {
        const comps = entity.components;
        const mf = comps.MeshFilter;
        if (mf !== void 0 && typeof mf.assetHandle === "number") {
          handleValueProvenance.set(mf.assetHandle, {
            sceneEntityKey,
            componentName: "MeshFilter",
            fieldName: "assetHandle"
          });
        }
        const skin = comps.Skin;
        if (skin !== void 0 && typeof skin.skeleton === "string") {
          skeletonGuidProvenance.set(skin.skeleton, { sceneEntityKey });
        }
      }
      const meshGuidList = [...maps.meshGuidByIndex.values()];
      const refs = [];
      let cursor = 0;
      for (const guid of meshGuidList) {
        refs.push(makeRef2(guid, cursor));
        cursor++;
      }
      {
        const skeletonGuidList = [...skeletonGuidBySourceIndex.values()];
        for (const guid of skeletonGuidList) {
          const skProv = skeletonGuidProvenance.get(guid);
          refs.push(
            skProv !== void 0 ? {
              guid,
              sourceField: { componentName: "Skin", fieldName: "skeleton" },
              sceneEntityKey: skProv.sceneEntityKey
            } : { guid }
          );
          cursor++;
        }
      }
      {
        const skinGuidList2 = [...skinGuidBySourceIndex.values()];
        for (const guid of skinGuidList2) {
          refs.push({ guid });
          cursor++;
        }
      }
      const skinGuidList = [...skinGuidBySourceIndex.values()];
      const sceneWithSkinGuids = skinGuidList.length > 0 ? { ...scene, skinGuids: skinGuidList } : scene;
      const sceneName = isMultiAsset ? doc.scenes[sub.sourceIndex]?.name : void 0;
      out.push({
        guid: sub.guid,
        kind: "scene",
        ...sceneName !== void 0 ? { name: sceneName } : {},
        payload: sceneWithSkinGuids,
        refs,
        artifacts: {}
      });
    } else if (sub.kind === "skeleton") {
      const rec = doc.skeletons[sub.sourceIndex];
      if (rec === void 0) continue;
      const payload = {
        kind: "skeleton",
        inverseBindMatrices: rec.inverseBindMatrices,
        jointCount: rec.jointCount,
        ...rec.bounds === void 0 ? {} : { bounds: rec.bounds }
      };
      out.push({ guid: sub.guid, kind: "skeleton", payload, refs: [], artifacts: {} });
    } else if (sub.kind === "skin") {
      const rec = doc.skeletons[sub.sourceIndex];
      if (rec === void 0) continue;
      const skeletonGuid = skeletonGuidBySourceIndex.get(sub.sourceIndex);
      if (skeletonGuid === void 0) continue;
      const payload = {
        kind: "skin",
        skeletonGuid,
        jointPaths: rec.jointPaths
      };
      out.push({
        guid: sub.guid,
        kind: "skin",
        payload,
        refs: [{ guid: skeletonGuid, sourceField: { fieldName: "skeleton" } }],
        artifacts: {}
      });
    } else if (sub.kind === "animation-clip") {
      const rec = doc.animationClips[sub.sourceIndex];
      if (rec === void 0) continue;
      const payload = {
        kind: "animation-clip",
        duration: rec.duration,
        channels: rec.channels.map((ch) => ({
          targetId: ch.targetId,
          property: ch.property,
          sampler: {
            input: ch.sampler.input,
            output: ch.sampler.output,
            interpolation: ch.sampler.interpolation
          }
        }))
      };
      out.push({ guid: sub.guid, kind: "animation-clip", payload, refs: [], artifacts: {} });
    }
  }
  return { ok: true, value: { assets: out, sourceDependencies: [] } };
}
function createGltfImporter(meshopt) {
  return {
    key: "gltf",
    import: (ctx) => importGltf(ctx, meshopt),
    capabilities: { catalog: { publish: publishesCatalogProduct } }
  };
}

// src/importer-entry.ts
await MeshoptDecoder.ready;
var meshoptDecoder = {
  decode: ({ source, count, stride, mode, filter }) => {
    const target = new Uint8Array(count * stride);
    MeshoptDecoder.decodeGltfBuffer(target, count, stride, source, mode, filter);
    return target;
  }
};
var gltfImporter2 = createGltfImporter({
  decode: meshoptDecoder.decode
});

export { createGltfImporter, gltfImporter2 as gltfImporter, meshoptDecoder };
