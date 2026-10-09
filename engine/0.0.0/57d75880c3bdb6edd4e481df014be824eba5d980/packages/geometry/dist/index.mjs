import { decodeMeshBinHeader, MESH_BIN_HEADER_V4_BYTES, MESH_BIN_VERSION } from '../../pack/dist/index.mjs';
import { box3, circle2, box2 } from '../../math/dist/index.mjs';
import { err, ok, AssetError, ASSET_ERROR_HINTS } from '../../types/dist/index.mjs';

// src/assets/mesh-binary.ts
var EPSILON = 1e-8;
function tangentInputError(field, value, reason) {
  return new AssetError({
    code: "asset-parse-failed",
    expected: `valid tangent topology: ${reason}`,
    hint: ASSET_ERROR_HINTS["asset-parse-failed"],
    detail: { field, value, reason }
  });
}
function preflightTangentInput(positions, normals, uvs, indices) {
  if (positions.length % 3 !== 0) {
    return err(
      tangentInputError(
        "positions",
        positions.length,
        "positions.length must be divisible by the position stride of 3"
      )
    );
  }
  const vertexCount = positions.length / 3;
  if (normals.length !== vertexCount * 3) {
    return err(
      tangentInputError(
        "normals",
        normals.length,
        `normals.length must equal vertexCount * 3 (${vertexCount * 3})`
      )
    );
  }
  if (uvs.length !== vertexCount * 2) {
    return err(
      tangentInputError(
        "uvs",
        uvs.length,
        `uvs.length must equal vertexCount * 2 (${vertexCount * 2})`
      )
    );
  }
  if (indices === void 0) {
    if (vertexCount % 3 !== 0) {
      return err(
        tangentInputError(
          "positions",
          vertexCount,
          "non-indexed vertexCount must be divisible by the triangle size of 3"
        )
      );
    }
    return ok(vertexCount);
  }
  if (indices.length % 3 !== 0) {
    return err(
      tangentInputError(
        "indices",
        indices.length,
        "indices.length must be divisible by the triangle size of 3"
      )
    );
  }
  for (let indexPosition = 0; indexPosition < indices.length; indexPosition++) {
    const index = indices[indexPosition];
    if (index === void 0 || !Number.isInteger(index) || index < 0 || index >= vertexCount) {
      return err(
        tangentInputError(
          "indices",
          index ?? -1,
          `indices[${indexPosition}] must be an integer in [0, ${vertexCount})`
        )
      );
    }
  }
  return ok(vertexCount);
}
function computeTangentVec4(positions, normals, uvs, indices) {
  const preflight = preflightTangentInput(positions, normals, uvs, indices);
  if (!preflight.ok) return preflight;
  const vertexCount = preflight.value;
  const accumT = new Float32Array(vertexCount * 3);
  const accumSign = new Float32Array(vertexCount);
  let validTriangleCount = 0;
  const triangleCount = indices !== void 0 ? indices.length / 3 : vertexCount / 3;
  for (let tri = 0; tri < triangleCount; tri++) {
    const i0 = indices !== void 0 ? indices[tri * 3] ?? 0 : tri * 3;
    const i1 = indices !== void 0 ? indices[tri * 3 + 1] ?? 0 : tri * 3 + 1;
    const i2 = indices !== void 0 ? indices[tri * 3 + 2] ?? 0 : tri * 3 + 2;
    const p0x = positions[i0 * 3] ?? 0;
    const p0y = positions[i0 * 3 + 1] ?? 0;
    const p0z = positions[i0 * 3 + 2] ?? 0;
    const p1x = positions[i1 * 3] ?? 0;
    const p1y = positions[i1 * 3 + 1] ?? 0;
    const p1z = positions[i1 * 3 + 2] ?? 0;
    const p2x = positions[i2 * 3] ?? 0;
    const p2y = positions[i2 * 3 + 1] ?? 0;
    const p2z = positions[i2 * 3 + 2] ?? 0;
    const u0 = uvs[i0 * 2] ?? 0;
    const v0 = uvs[i0 * 2 + 1] ?? 0;
    const u1 = uvs[i1 * 2] ?? 0;
    const v1 = uvs[i1 * 2 + 1] ?? 0;
    const u2 = uvs[i2 * 2] ?? 0;
    const v2 = uvs[i2 * 2 + 1] ?? 0;
    const dP1x = p1x - p0x;
    const dP1y = p1y - p0y;
    const dP1z = p1z - p0z;
    const dP2x = p2x - p0x;
    const dP2y = p2y - p0y;
    const dP2z = p2z - p0z;
    const dU1 = u1 - u0;
    const dV1 = v1 - v0;
    const dU2 = u2 - u0;
    const dV2 = v2 - v0;
    const det = dU1 * dV2 - dU2 * dV1;
    if (Math.abs(det) < EPSILON) {
      continue;
    }
    const invDet = 1 / det;
    const tx = invDet * (dV2 * dP1x - dV1 * dP2x);
    const ty = invDet * (dV2 * dP1y - dV1 * dP2y);
    const tz = invDet * (dV2 * dP1z - dV1 * dP2z);
    const cx = dP1y * dP2z - dP1z * dP2y;
    const cy = dP1z * dP2x - dP1x * dP2z;
    const cz = dP1x * dP2y - dP1y * dP2x;
    const faceArea = 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);
    if (faceArea < EPSILON) continue;
    validTriangleCount += 1;
    const signDet = det >= 0 ? 1 : -1;
    const signedWeight = faceArea * signDet;
    for (const vi of [i0, i1, i2]) {
      accumT[vi * 3] = (accumT[vi * 3] ?? 0) + tx * faceArea;
      accumT[vi * 3 + 1] = (accumT[vi * 3 + 1] ?? 0) + ty * faceArea;
      accumT[vi * 3 + 2] = (accumT[vi * 3 + 2] ?? 0) + tz * faceArea;
      accumSign[vi] = (accumSign[vi] ?? 0) + signedWeight;
    }
  }
  if (validTriangleCount === 0) {
    return err(
      tangentInputError(
        "tangent",
        0,
        "material-tangent-required: no triangle has a valid UV-derived tangent"
      )
    );
  }
  const out = new Float32Array(vertexCount * 4);
  for (let v = 0; v < vertexCount; v++) {
    let tx = accumT[v * 3] ?? 0;
    let ty = accumT[v * 3 + 1] ?? 0;
    let tz = accumT[v * 3 + 2] ?? 0;
    const nx = normals[v * 3] ?? 0;
    const ny = normals[v * 3 + 1] ?? 0;
    const nz = normals[v * 3 + 2] ?? 0;
    const tLen = Math.sqrt(tx * tx + ty * ty + tz * tz);
    if (tLen < EPSILON) {
      const ax = Math.abs(nx);
      const ay = Math.abs(ny);
      const az = Math.abs(nz);
      let rx = 1;
      let ry = 0;
      let rz = 0;
      if (ax > ay && ax > az) {
        rx = 0;
        ry = 1;
      } else if (ay > ax && ay > az) {
        rx = 0;
        rz = 1;
      }
      tx = ny * rz - nz * ry;
      ty = nz * rx - nx * rz;
      tz = nx * ry - ny * rx;
      const fallbackLength = Math.sqrt(tx * tx + ty * ty + tz * tz);
      if (fallbackLength < EPSILON) {
        return err(
          tangentInputError(
            "tangent",
            v,
            "material-tangent-required: supplied normal cannot define a tangent frame"
          )
        );
      }
      tx /= fallbackLength;
      ty /= fallbackLength;
      tz /= fallbackLength;
    } else {
      tx /= tLen;
      ty /= tLen;
      tz /= tLen;
    }
    const dotTN = tx * nx + ty * ny + tz * nz;
    let gx = tx - dotTN * nx;
    let gy = ty - dotTN * ny;
    let gz = tz - dotTN * nz;
    const gLen = Math.sqrt(gx * gx + gy * gy + gz * gz);
    if (gLen < EPSILON) {
      const ax = Math.abs(nx);
      const ay = Math.abs(ny);
      const az = Math.abs(nz);
      let rx = 1;
      let ry = 0;
      let rz = 0;
      if (ax > ay && ax > az) {
        rx = 0;
        ry = 1;
      } else if (ay > ax && ay > az) {
        rx = 0;
        rz = 1;
      }
      gx = ny * rz - nz * ry;
      gy = nz * rx - nx * rz;
      gz = nx * ry - ny * rx;
      const fallbackLength = Math.sqrt(gx * gx + gy * gy + gz * gz);
      if (fallbackLength < EPSILON) {
        return err(
          tangentInputError(
            "tangent",
            v,
            "material-tangent-required: supplied normal cannot define a tangent frame"
          )
        );
      }
      gx /= fallbackLength;
      gy /= fallbackLength;
      gz /= fallbackLength;
    } else {
      gx /= gLen;
      gy /= gLen;
      gz /= gLen;
    }
    const accSign = accumSign[v] ?? 0;
    const w = accSign >= 0 ? 1 : -1;
    out[v * 4] = gx;
    out[v * 4 + 1] = gy;
    out[v * 4 + 2] = gz;
    out[v * 4 + 3] = w;
  }
  return ok(out);
}
var ATTRIBUTE_FORMAT_MAP = {
  position: "float32x3",
  normal: "float32x3",
  uv: "float32x2",
  tangent: "float32x4",
  skinIndex: "uint16x4",
  skinWeight: "float32x4",
  uv1: "float32x2",
  uv2: "float32x2",
  uv3: "float32x2",
  uv4: "float32x2",
  uv5: "float32x2",
  uv6: "float32x2",
  uv7: "float32x2",
  color: "float32x4"
};
var ATTRIBUTE_BYTE_STRIDE = {
  position: 12,
  normal: 12,
  uv: 8,
  tangent: 16,
  skinIndex: 8,
  skinWeight: 16,
  uv1: 8,
  uv2: 8,
  uv3: 8,
  uv4: 8,
  uv5: 8,
  uv6: 8,
  uv7: 8,
  color: 16
};
var isAttributeKey = (key) => key in ATTRIBUTE_FORMAT_MAP;
var CANONICAL_KEYS = Object.keys(ATTRIBUTE_FORMAT_MAP).filter(isAttributeKey);
var UV_KEYS = CANONICAL_KEYS.filter(
  (key) => key === "uv" || key.startsWith("uv")
);
var EMPTY_FLOAT32 = new Float32Array(0);
var EMPTY_UINT16 = new Uint16Array(0);
var DEFAULT_VERTEX_ATTRIBUTE_MAP = Object.freeze({
  position: EMPTY_FLOAT32,
  normal: EMPTY_FLOAT32,
  uv: EMPTY_FLOAT32,
  tangent: EMPTY_FLOAT32
});
var SKIN_VERTEX_ATTRIBUTE_MAP = Object.freeze({
  ...DEFAULT_VERTEX_ATTRIBUTE_MAP,
  skinIndex: EMPTY_UINT16,
  skinWeight: EMPTY_FLOAT32
});
function emitAliasEntries(entries, toIndex, currentStride) {
  const lastUv = entries.filter((entry) => UV_KEYS.includes(entry.key)).at(-1);
  const aliasOffset = lastUv?.offset ?? currentStride;
  for (let k = 0; k < toIndex && k < UV_KEYS.length; k++) {
    const uvKey = UV_KEYS[k];
    if (entries.some((entry) => entry.key === uvKey)) continue;
    entries.push({
      key: uvKey,
      shaderLocation: CANONICAL_KEYS.indexOf(uvKey),
      offset: aliasOffset,
      format: ATTRIBUTE_FORMAT_MAP[uvKey]
    });
  }
  return lastUv === void 0 ? currentStride + ATTRIBUTE_BYTE_STRIDE.uv : currentStride;
}
function buildMeshAttributeMapForUvSets(uvSetCount) {
  const map = { ...DEFAULT_VERTEX_ATTRIBUTE_MAP };
  for (let set = 1; set < uvSetCount && set < UV_KEYS.length; set++) {
    map[UV_KEYS[set]] = new Float32Array(0);
  }
  return map;
}
function deriveVertexBufferLayout(map, opts) {
  const shaderUvSetCount = opts?.shaderUvSetCount ?? 0;
  const entries = [];
  let offset = 0;
  for (const key of CANONICAL_KEYS) {
    if (map[key] === void 0) continue;
    entries.push({
      key,
      shaderLocation: CANONICAL_KEYS.indexOf(key),
      offset,
      format: ATTRIBUTE_FORMAT_MAP[key]
    });
    offset += ATTRIBUTE_BYTE_STRIDE[key];
  }
  const present = entries.length;
  if (shaderUvSetCount > 0) {
    offset = emitAliasEntries(entries, shaderUvSetCount, offset);
  }
  if (present === 0 && shaderUvSetCount === 0) return [];
  entries.sort((a, b) => a.shaderLocation - b.shaderLocation);
  return [
    {
      arrayStride: offset,
      attributes: entries.map(({ shaderLocation, offset: entryOffset, format }) => ({
        shaderLocation,
        offset: entryOffset,
        format
      }))
    }
  ];
}
function deriveVertexBufferLayoutFromProjection(projection, opts) {
  const entries = projection.attributes.map(({ key, shaderLocation, offset, format }) => ({
    key,
    shaderLocation,
    offset,
    format
  }));
  let arrayStride = projection.arrayStride;
  const shaderUvSetCount = opts?.shaderUvSetCount ?? 0;
  if (shaderUvSetCount > 0) {
    arrayStride = emitAliasEntries(entries, shaderUvSetCount, arrayStride);
  }
  entries.sort((a, b) => a.shaderLocation - b.shaderLocation);
  return projection.attributes.length === 0 ? [] : [
    {
      arrayStride,
      attributes: entries.map(({ shaderLocation, offset, format }) => ({
        shaderLocation,
        offset,
        format
      }))
    }
  ];
}
function deriveVertexCount(vertices, projection) {
  const stride = projection.arrayStride;
  const byteLength = vertices.byteLength;
  if (!Number.isSafeInteger(stride) || stride <= 0 || !Number.isSafeInteger(byteLength) || byteLength < 0 || byteLength % stride !== 0) {
    return void 0;
  }
  const count = byteLength / stride;
  return Number.isSafeInteger(count) ? count : void 0;
}
function bytesForFormat(format) {
  if (format === "uint16x4" || format === "float32x2") return 8;
  if (format === "float32x3") return 12;
  return 16;
}
function storageOf(value) {
  if (value instanceof ArrayBuffer) return "array-buffer";
  if (value instanceof Float32Array) return "float32";
  if (value instanceof Uint16Array) return "uint16";
  return "other";
}
function elementView(value, format) {
  if (value instanceof Float32Array || value instanceof Uint16Array) return value;
  if (value instanceof ArrayBuffer) {
    return format === "uint16x4" ? new Uint16Array(value) : new Float32Array(value);
  }
  return void 0;
}
function fnv1a(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `vlp-v1-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
var layoutsByMask = /* @__PURE__ */ new Map();
function deriveVertexLayoutProjection(map) {
  let mask = 0;
  for (let index = 0; index < CANONICAL_KEYS.length; index += 1) {
    const key = CANONICAL_KEYS[index];
    if (key !== void 0 && map[key] !== void 0) mask |= 1 << index;
  }
  return layoutFromMask(mask);
}
function layoutFromMask(mask) {
  const cached = layoutsByMask.get(mask);
  if (cached !== void 0) return cached;
  const attributes = [];
  let offset = 0;
  for (let index = 0; index < CANONICAL_KEYS.length; index += 1) {
    const key = CANONICAL_KEYS[index];
    if (key === void 0 || (mask & 1 << index) === 0) continue;
    const format = ATTRIBUTE_FORMAT_MAP[key];
    const byteLength = bytesForFormat(format);
    attributes.push(Object.freeze({ key, shaderLocation: index, offset, format, byteLength }));
    offset += byteLength;
  }
  const digestInput = [
    "1",
    String(mask),
    String(offset),
    ...attributes.map(
      (entry) => `${entry.key},${entry.shaderLocation},${entry.offset},${entry.format}`
    )
  ].join("|");
  const projection = Object.freeze({
    schemaVersion: 1,
    attributes: Object.freeze(attributes),
    mask,
    arrayStride: offset,
    digest: fnv1a(digestInput)
  });
  layoutsByMask.set(mask, projection);
  return projection;
}
var VertexAttributePackError = class extends AssetError {
  constructor(detail) {
    super({
      code: "asset-invalid-value",
      expected: "canonical vertex attributes with matching storage and cardinality",
      hint: ASSET_ERROR_HINTS["asset-invalid-value"],
      detail
    });
  }
};
function deriveVertexLayoutProjectionFromMask(mask) {
  const knownMask = (1 << CANONICAL_KEYS.length) - 1;
  const unsignedMask = Number.isInteger(mask) && mask >= 0 ? mask >>> 0 : 4294967295;
  const unknownMask = unsignedMask & ~knownMask;
  if (mask === 0) {
    return err({
      code: "vertex-layout-mask-invalid",
      expected: "a non-empty canonical vertex attribute mask",
      hint: "re-cook the mesh-bin payload from MeshAsset.attributes",
      detail: { mask, knownMask, unknownMask, reason: "empty" }
    });
  }
  if (!Number.isInteger(mask) || mask < 0 || unknownMask !== 0) {
    return err({
      code: "vertex-layout-mask-invalid",
      expected: `a mask using only canonical bits 0..${CANONICAL_KEYS.length - 1}`,
      hint: "re-cook the mesh-bin payload from MeshAsset.attributes",
      detail: { mask, knownMask, unknownMask, reason: "unknown-bits" }
    });
  }
  return ok(layoutFromMask(unsignedMask));
}
function packInterleavedVertexAttributes(map, vertexCount) {
  const invalid3 = (detail) => err(new VertexAttributePackError(detail));
  if (!Number.isInteger(vertexCount) || vertexCount < 0) {
    return invalid3({ field: "vertexCount", reason: "vertex-count-invalid", actual: vertexCount });
  }
  const projection = deriveVertexLayoutProjection(map);
  if (projection.attributes.length === 0) {
    return invalid3({ field: "attributes", reason: "attributes-empty", actualCount: 0 });
  }
  const output = new ArrayBuffer(projection.arrayStride * vertexCount);
  const outputFloats = new Float32Array(output);
  const outputU16 = new Uint16Array(output);
  for (const entry of projection.attributes) {
    const sourceValue = map[entry.key];
    if (sourceValue === void 0) continue;
    const uint16 = entry.format === "uint16x4";
    const components = entry.byteLength / (uint16 ? 2 : 4);
    const bytesPerComponent = uint16 ? 2 : 4;
    if (sourceValue instanceof ArrayBuffer && sourceValue.byteLength % bytesPerComponent !== 0) {
      return invalid3({
        field: entry.key,
        reason: "attribute-cardinality-mismatch",
        vertexCount,
        componentsPerVertex: components,
        expectedLength: vertexCount * components,
        actualLength: sourceValue.byteLength / bytesPerComponent
      });
    }
    const source = elementView(sourceValue, entry.format);
    if (source === void 0 || (uint16 ? storageOf(sourceValue) !== "uint16" && storageOf(sourceValue) !== "array-buffer" : storageOf(sourceValue) !== "float32" && storageOf(sourceValue) !== "array-buffer")) {
      return invalid3({
        field: entry.key,
        reason: "attribute-storage-invalid",
        expectedStorage: uint16 ? "uint16" : "float32",
        actualStorage: storageOf(sourceValue)
      });
    }
    const expectedLength = vertexCount * components;
    if (source.length !== expectedLength) {
      return invalid3({
        field: entry.key,
        reason: "attribute-cardinality-mismatch",
        vertexCount,
        componentsPerVertex: components,
        expectedLength,
        actualLength: source.length
      });
    }
    if (entry.key === "color") {
      for (let elementIndex = 0; elementIndex < source.length; elementIndex += 1) {
        const component = source[elementIndex];
        if (!Number.isFinite(component)) {
          return invalid3({
            field: "color",
            reason: "attribute-non-finite",
            elementIndex,
            actual: Number.isNaN(component) ? "nan" : component === Number.POSITIVE_INFINITY ? "positive-infinity" : "negative-infinity"
          });
        }
      }
    }
    for (let vertex = 0; vertex < vertexCount; vertex += 1) {
      for (let component = 0; component < components; component += 1) {
        const sourceIndex = vertex * components + component;
        const byteOffset = vertex * projection.arrayStride + entry.offset + component * (uint16 ? 2 : 4);
        if (uint16) outputU16[byteOffset / 2] = Number(source[sourceIndex] ?? 0);
        else outputFloats[byteOffset / 4] = Number(source[sourceIndex] ?? 0);
      }
    }
  }
  return ok(Object.freeze({ projection, vertices: outputFloats }));
}

// src/box.ts
var FACTORY_FLOATS_PER_VERTEX = 8;
var PROCEDURAL_FLOATS_PER_VERTEX = 12;
function interleavedInputError(field, value, reason) {
  return new AssetError({
    code: "asset-parse-failed",
    expected: `valid interleaved triangle topology: ${reason}`,
    hint: ASSET_ERROR_HINTS["asset-parse-failed"],
    detail: { field, value, reason }
  });
}
function buildAttributes(vertices, vertexCount) {
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const tangents = new Float32Array(vertexCount * 4);
  for (let i = 0; i < vertexCount; i++) {
    const base = i * PROCEDURAL_FLOATS_PER_VERTEX;
    positions[i * 3 + 0] = vertices[base + 0];
    positions[i * 3 + 1] = vertices[base + 1];
    positions[i * 3 + 2] = vertices[base + 2];
    normals[i * 3 + 0] = vertices[base + 3];
    normals[i * 3 + 1] = vertices[base + 4];
    normals[i * 3 + 2] = vertices[base + 5];
    uvs[i * 2 + 0] = vertices[base + 6];
    uvs[i * 2 + 1] = vertices[base + 7];
    tangents[i * 4 + 0] = vertices[base + 8];
    tangents[i * 4 + 1] = vertices[base + 9];
    tangents[i * 4 + 2] = vertices[base + 10];
    tangents[i * 4 + 3] = vertices[base + 11];
  }
  const attrs = {
    position: positions,
    normal: normals,
    uv: uvs,
    tangent: tangents
  };
  deriveVertexBufferLayout(attrs);
  return attrs;
}
function meshFromInterleaved(vertices, indices) {
  if (vertices.length % FACTORY_FLOATS_PER_VERTEX !== 0) {
    return err(
      interleavedInputError(
        "vertices",
        vertices.length,
        `vertices.length must be divisible by the interleaved stride of ${FACTORY_FLOATS_PER_VERTEX}`
      )
    );
  }
  const vertexCount = vertices.length / FACTORY_FLOATS_PER_VERTEX;
  if (indices.length % 3 !== 0) {
    return err(
      interleavedInputError(
        "indices",
        indices.length,
        "indices.length must be divisible by the triangle size of 3"
      )
    );
  }
  for (let indexPosition = 0; indexPosition < indices.length; indexPosition++) {
    const index = indices[indexPosition];
    if (index === void 0 || !Number.isInteger(index) || index < 0 || index >= vertexCount) {
      return err(
        interleavedInputError(
          "indices",
          index ?? -1,
          `indices[${indexPosition}] must be an integer in [0, ${vertexCount})`
        )
      );
    }
  }
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  for (let i = 0; i < vertexCount; i++) {
    const base = i * FACTORY_FLOATS_PER_VERTEX;
    positions[i * 3 + 0] = vertices[base + 0];
    positions[i * 3 + 1] = vertices[base + 1];
    positions[i * 3 + 2] = vertices[base + 2];
    normals[i * 3 + 0] = vertices[base + 3];
    normals[i * 3 + 1] = vertices[base + 4];
    normals[i * 3 + 2] = vertices[base + 5];
    uvs[i * 2 + 0] = vertices[base + 6];
    uvs[i * 2 + 1] = vertices[base + 7];
  }
  const tangentResult = computeTangentVec4(positions, normals, uvs, indices);
  if (!tangentResult.ok) return tangentResult;
  const tangents = tangentResult.value;
  const expanded = new Float32Array(vertexCount * PROCEDURAL_FLOATS_PER_VERTEX);
  for (let i = 0; i < vertexCount; i++) {
    const dst = i * PROCEDURAL_FLOATS_PER_VERTEX;
    const src = i * FACTORY_FLOATS_PER_VERTEX;
    expanded[dst + 0] = vertices[src + 0];
    expanded[dst + 1] = vertices[src + 1];
    expanded[dst + 2] = vertices[src + 2];
    expanded[dst + 3] = vertices[src + 3];
    expanded[dst + 4] = vertices[src + 4];
    expanded[dst + 5] = vertices[src + 5];
    expanded[dst + 6] = vertices[src + 6];
    expanded[dst + 7] = vertices[src + 7];
    expanded[dst + 8] = tangents[i * 4];
    expanded[dst + 9] = tangents[i * 4 + 1];
    expanded[dst + 10] = tangents[i * 4 + 2];
    expanded[dst + 11] = tangents[i * 4 + 3];
  }
  return ok({
    kind: "mesh",
    vertices: expanded,
    indices,
    attributes: buildAttributes(expanded, vertexCount),
    submeshes: [
      {
        indexOffset: 0,
        indexCount: indices.length,
        vertexCount,
        topology: "triangle-list",
        materialSlot: 0
      }
    ],
    materialSlots: [{ slotName: "Default" }],
    // Procedural meshes carry their own local-space AABB: after feat-20260614
    // (D-15) `allocSharedRef` stores the payload verbatim -- there is no
    // `withMeshAabb` pass like the old `register`/`catalog` path -- so the cull
    // + pick path can only read an AABB the POD already holds.
    aabb: box3.fromPositions(box3.create(), positions)
  });
}
function degenerate(detail) {
  return new AssetError({
    code: "asset-parse-failed",
    expected: `all dimensions > 0; segments >= 1 (${detail})`,
    hint: ASSET_ERROR_HINTS["asset-parse-failed"]
  });
}
function createBoxGeometry(width, height, depth, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
  if (width <= 0 || height <= 0 || depth <= 0) {
    return err(degenerate(`width=${width}, height=${height}, depth=${depth}`));
  }
  const ws = widthSegments | 0;
  const hs = heightSegments | 0;
  const ds = depthSegments | 0;
  if (ws < 1 || hs < 1 || ds < 1) {
    return err(degenerate(`widthSegments=${ws}, heightSegments=${hs}, depthSegments=${ds}`));
  }
  const hw = width / 2;
  const hh = height / 2;
  const hd = depth / 2;
  const faces = [
    // +X face
    {
      uAxis: 2,
      vAxis: 1,
      wAxis: 0,
      uSign: -1,
      vSign: 1,
      wSign: 1,
      uSegs: ds,
      vSegs: hs,
      uSize: depth,
      vSize: height,
      wSize: width
    },
    // -X face
    {
      uAxis: 2,
      vAxis: 1,
      wAxis: 0,
      uSign: 1,
      vSign: 1,
      wSign: -1,
      uSegs: ds,
      vSegs: hs,
      uSize: depth,
      vSize: height,
      wSize: width
    },
    // +Y face
    {
      uAxis: 0,
      vAxis: 2,
      wAxis: 1,
      uSign: 1,
      vSign: 1,
      wSign: 1,
      uSegs: ws,
      vSegs: ds,
      uSize: width,
      vSize: depth,
      wSize: height
    },
    // -Y face
    {
      uAxis: 0,
      vAxis: 2,
      wAxis: 1,
      uSign: 1,
      vSign: -1,
      wSign: -1,
      uSegs: ws,
      vSegs: ds,
      uSize: width,
      vSize: depth,
      wSize: height
    },
    // +Z face
    {
      uAxis: 0,
      vAxis: 1,
      wAxis: 2,
      uSign: 1,
      vSign: 1,
      wSign: 1,
      uSegs: ws,
      vSegs: hs,
      uSize: width,
      vSize: height,
      wSize: depth
    },
    // -Z face
    {
      uAxis: 0,
      vAxis: 1,
      wAxis: 2,
      uSign: -1,
      vSign: 1,
      wSign: -1,
      uSegs: ws,
      vSegs: hs,
      uSize: width,
      vSize: height,
      wSize: depth
    }
  ];
  let vertexCount = 0;
  let indexCount = 0;
  for (const f of faces) {
    vertexCount += (f.uSegs + 1) * (f.vSegs + 1);
    indexCount += f.uSegs * f.vSegs * 6;
  }
  const vertices = new Float32Array(vertexCount * FACTORY_FLOATS_PER_VERTEX);
  const indices = new Uint32Array(indexCount);
  let vIdx = 0;
  let iIdx = 0;
  const halves = [hw, hh, hd];
  for (const f of faces) {
    const vStart = vIdx;
    const halfU = halves[f.uAxis];
    const halfV = halves[f.vAxis];
    const halfW = halves[f.wAxis];
    for (let j = 0; j <= f.vSegs; j++) {
      for (let i = 0; i <= f.uSegs; i++) {
        const uCoord = (i / f.uSegs * f.uSize - f.uSize / 2) * f.uSign;
        const vCoord = (j / f.vSegs * f.vSize - f.vSize / 2) * f.vSign;
        const pos = [0, 0, 0];
        pos[f.uAxis] = uCoord / f.uSize * halfU * 2;
        pos[f.vAxis] = vCoord / f.vSize * halfV * 2;
        pos[f.wAxis] = halfW * f.wSign;
        const normal = [0, 0, 0];
        normal[f.wAxis] = f.wSign;
        const base = vIdx * FACTORY_FLOATS_PER_VERTEX;
        vertices[base + 0] = pos[0];
        vertices[base + 1] = pos[1];
        vertices[base + 2] = pos[2];
        vertices[base + 3] = normal[0];
        vertices[base + 4] = normal[1];
        vertices[base + 5] = normal[2];
        vertices[base + 6] = i / f.uSegs;
        vertices[base + 7] = j / f.vSegs;
        vIdx++;
      }
    }
    const isCyclic = (f.vAxis - f.uAxis + 3) % 3 === 1 && (f.wAxis - f.vAxis + 3) % 3 === 1;
    const levi = isCyclic ? 1 : -1;
    const ccwOutward = levi * f.uSign * f.vSign * f.wSign > 0;
    for (let j = 0; j < f.vSegs; j++) {
      for (let i = 0; i < f.uSegs; i++) {
        const a = vStart + j * (f.uSegs + 1) + i;
        const b = vStart + j * (f.uSegs + 1) + i + 1;
        const c = vStart + (j + 1) * (f.uSegs + 1) + i;
        const d = vStart + (j + 1) * (f.uSegs + 1) + i + 1;
        if (ccwOutward) {
          indices[iIdx++] = a;
          indices[iIdx++] = b;
          indices[iIdx++] = d;
          indices[iIdx++] = a;
          indices[iIdx++] = d;
          indices[iIdx++] = c;
        } else {
          indices[iIdx++] = a;
          indices[iIdx++] = d;
          indices[iIdx++] = b;
          indices[iIdx++] = a;
          indices[iIdx++] = c;
          indices[iIdx++] = d;
        }
      }
    }
  }
  return meshFromInterleaved(vertices, indices);
}

// src/assets/mesh-binary.ts
function parseGuid(value) {
  const compact = value.replaceAll("-", "");
  if (!/^[0-9a-f]{32}$/i.test(compact)) return void 0;
  const bytes = new Uint8Array(16);
  for (let index = 0; index < bytes.length; index += 1) {
    const pair = compact.slice(index * 2, index * 2 + 2);
    const parsed = Number.parseInt(pair, 16);
    if (!Number.isInteger(parsed)) return void 0;
    bytes[index] = parsed;
  }
  return bytes;
}
function floatArray(value) {
  if (value instanceof Float32Array) return value;
  if (Array.isArray(value)) return new Float32Array(value);
  return void 0;
}
function indexArray(value) {
  if (value instanceof Uint16Array || value instanceof Uint32Array) {
    return value.length === 0 ? void 0 : value;
  }
  if (!Array.isArray(value)) return void 0;
  if (value.length === 0) return void 0;
  return value.some((entry) => entry > 65535) ? new Uint32Array(value) : new Uint16Array(value);
}
function integerArray(value) {
  if (value instanceof Uint16Array) return value;
  if (Array.isArray(value)) return new Uint16Array(value);
  return void 0;
}
function morphTargets(value) {
  if (value === void 0) return void 0;
  if (!Array.isArray(value) || value.length === 0 || value.length > 8) return void 0;
  const targets = [];
  for (const raw of value) {
    if (raw === null || typeof raw !== "object") return void 0;
    const target = {};
    for (const [key, stream] of Object.entries(raw)) {
      if (key !== "position" && key !== "normal" && key !== "tangent") return void 0;
      const typed = floatArray(stream);
      if (typed === void 0) return void 0;
      if (key === "position") target.position = typed;
      else if (key === "normal") target.normal = typed;
      else target.tangent = typed;
    }
    if (Object.keys(target).length === 0) return void 0;
    targets.push(target);
  }
  return targets;
}
function unpackMeshBinary(bytes) {
  const headerResult = decodeMeshBinHeader(bytes);
  if (!headerResult.ok) return void 0;
  const header = headerResult.value;
  const projectionResult = deriveVertexLayoutProjectionFromMask(header.mask);
  if (!projectionResult.ok) return void 0;
  const projection = projectionResult.value;
  if (projection.schemaVersion !== header.projectionVersion || projection.arrayStride !== header.stride || projection.digest !== header.digest) {
    return void 0;
  }
  const payloadBytes = header.vertexBytes + header.indexBytes + header.jsonBytes;
  if (MESH_BIN_HEADER_V4_BYTES + payloadBytes !== bytes.byteLength) return void 0;
  let offset = MESH_BIN_HEADER_V4_BYTES;
  const vertexBytes = bytes.subarray(offset, offset + header.vertexBytes);
  const vertices = new Float32Array(vertexBytes.byteLength / 4);
  new Uint8Array(vertices.buffer).set(vertexBytes);
  offset += header.vertexBytes;
  let indices;
  if (header.indexCount > 0) {
    const indexBytes = bytes.subarray(offset, offset + header.indexBytes);
    if (header.indexWidth === 2) {
      indices = new Uint16Array(header.indexCount);
      new Uint8Array(indices.buffer).set(indexBytes);
    } else if (header.indexWidth === 4) {
      indices = new Uint32Array(header.indexCount);
      new Uint8Array(indices.buffer).set(indexBytes);
    } else {
      return void 0;
    }
    offset += header.indexBytes;
  }
  let metadata;
  try {
    metadata = JSON.parse(
      new TextDecoder().decode(bytes.subarray(offset, offset + header.jsonBytes))
    );
  } catch {
    return void 0;
  }
  if (metadata.submeshes === void 0 || metadata.submeshes.length === 0 || metadata.materialSlots === void 0) {
    return void 0;
  }
  const attributes = {};
  const view = new DataView(vertices.buffer);
  for (const entry of projection.attributes) {
    const components = entry.byteLength / (entry.format === "uint16x4" ? 2 : 4);
    const target = entry.format === "uint16x4" ? new Uint16Array(header.vertexCount * components) : new Float32Array(header.vertexCount * components);
    for (let vertex = 0; vertex < header.vertexCount; vertex += 1) {
      for (let component = 0; component < components; component += 1) {
        const sourceOffset = vertex * header.stride + entry.offset + component * (entry.format === "uint16x4" ? 2 : 4);
        if (sourceOffset + (entry.format === "uint16x4" ? 2 : 4) > vertices.byteLength) {
          return void 0;
        }
        if (target instanceof Uint16Array) {
          target[vertex * components + component] = view.getUint16(sourceOffset, true);
        } else {
          const value = view.getFloat32(sourceOffset, true);
          if (!Number.isFinite(value)) return void 0;
          target[vertex * components + component] = value;
        }
      }
    }
    attributes[entry.key] = target;
  }
  const decodedMorphTargets = morphTargets(metadata.morphTargets);
  const morphWeightValues = metadata.morphWeights === void 0 ? void 0 : new Float32Array(metadata.morphWeights);
  if (decodedMorphTargets !== void 0 && morphWeightValues !== void 0 && decodedMorphTargets.length !== morphWeightValues.length) {
    return void 0;
  }
  return {
    version: MESH_BIN_VERSION,
    vertices,
    attributes,
    projection,
    ...indices === void 0 ? {} : { indices },
    submeshes: metadata.submeshes,
    materialSlots: metadata.materialSlots,
    ...metadata.aabb === void 0 ? {} : { aabb: new Float32Array(metadata.aabb) },
    // MeshAsset.vertices remains a Float32Array, so translate the wire stride
    // (bytes) back to the legacy float-count input expected by meshFromParts.
    floatsPerVertex: header.stride / Float32Array.BYTES_PER_ELEMENT,
    uvSetCount: 1,
    ...decodedMorphTargets === void 0 ? {} : { morphTargets: decodedMorphTargets },
    ...morphWeightValues === void 0 ? {} : { morphWeights: morphWeightValues }
  };
}
function materialSlotsFor(raw, submeshes, refs) {
  if (raw === void 0)
    return submeshes.map((_submesh, index) => ({ slotName: `LegacySlot_${index}` }));
  return raw.map((slot, index) => {
    const reference = slot.defaultMaterialRef === void 0 ? slot.defaultMaterial : refs[slot.defaultMaterialRef];
    const defaultMaterial = reference === void 0 ? void 0 : parseGuid(reference);
    return {
      slotName: typeof slot.slotName === "string" && slot.slotName.trim().length > 0 ? slot.slotName : `LegacySlot_${index}`,
      ...typeof slot.sourceKey === "string" ? { sourceKey: slot.sourceKey } : {},
      ...defaultMaterial === void 0 ? {} : { defaultMaterial }
    };
  });
}
function submeshesFor(raw, vertexCount, indexCount) {
  const values = raw === void 0 || raw.length === 0 ? [{ indexOffset: 0, indexCount, vertexCount, topology: "triangle-list" }] : raw;
  return values.map((value, index) => ({
    indexOffset: typeof value.indexOffset === "number" ? value.indexOffset : 0,
    indexCount: typeof value.indexCount === "number" ? value.indexCount : indexCount,
    vertexCount: typeof value.vertexCount === "number" ? value.vertexCount : vertexCount,
    topology: value.topology === "line-list" || value.topology === "line-strip" || value.topology === "point-list" || value.topology === "triangle-strip" ? value.topology : "triangle-list",
    materialSlot: typeof value.materialSlot === "number" ? value.materialSlot : index
  }));
}
function deriveAabb(vertices, stride) {
  if (stride < 3 || vertices.length < 3 || vertices.length % stride !== 0) return void 0;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  for (let offset = 0; offset < vertices.length; offset += stride) {
    const x = vertices[offset];
    const y = vertices[offset + 1];
    const z = vertices[offset + 2];
    if (x === void 0 || y === void 0 || z === void 0) return void 0;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }
  return Float32Array.of(minX, minY, minZ, maxX, maxY, maxZ);
}
function meshFromParts(parts, refs) {
  const vertices = floatArray(parts.vertices);
  if (vertices === void 0 || vertices.length === 0) return void 0;
  const indices = indexArray(parts.indices);
  const sourceAttributes = parts.attributes !== null && typeof parts.attributes === "object" ? parts.attributes : {};
  const attributes = {};
  for (const key of [
    "position",
    "normal",
    "uv",
    "tangent",
    "uv1",
    "uv2",
    "uv3",
    "uv4",
    "uv5",
    "uv6",
    "uv7",
    "color"
  ]) {
    const value = floatArray(sourceAttributes[key]);
    if (value !== void 0) attributes[key] = value;
  }
  const skinIndex = integerArray(sourceAttributes.skinIndex);
  const skinWeight = floatArray(sourceAttributes.skinWeight);
  if (skinIndex !== void 0) attributes.skinIndex = skinIndex;
  if (skinWeight !== void 0) attributes.skinWeight = skinWeight;
  const stride = parts.floatsPerVertex ?? 0;
  const vertexCount = stride > 0 ? vertices.length / stride : vertices.length;
  const submeshes = submeshesFor(parts.submeshes, vertexCount, indices?.length ?? 0);
  const materialSlots = materialSlotsFor(parts.materialSlots, submeshes, refs);
  const aabb = floatArray(parts.aabb) ?? deriveAabb(vertices, stride);
  if (aabb === void 0) return void 0;
  const morph = morphTargets(parts.morphTargets);
  const weights = floatArray(parts.morphWeights);
  if (morph !== void 0 && weights !== void 0 && morph.length !== weights.length)
    return void 0;
  const uvSetCount = parts.uvSetCount ?? 1;
  if (stride > 0 && uvSetCount > 1) {
    const hasSkin = stride === 18 + (uvSetCount - 1) * 2;
    const firstOffset = hasSkin ? 18 : PROCEDURAL_FLOATS_PER_VERTEX;
    const extraUvKeys = ["uv1", "uv2", "uv3", "uv4", "uv5", "uv6", "uv7"];
    for (let set = 1; set < uvSetCount; set += 1) {
      const key = extraUvKeys[set - 1];
      if (key === void 0) return void 0;
      const values = new Float32Array(vertexCount * 2);
      const sourceOffset = firstOffset + (set - 1) * 2;
      for (let vertex = 0; vertex < vertexCount; vertex += 1) {
        const source = vertex * stride + sourceOffset;
        values[vertex * 2] = vertices[source] ?? 0;
        values[vertex * 2 + 1] = vertices[source + 1] ?? 0;
      }
      attributes[key] = values;
    }
  }
  return {
    kind: "mesh",
    vertices,
    ...indices === void 0 ? {} : { indices },
    attributes,
    aabb,
    submeshes,
    materialSlots,
    ...morph === void 0 ? {} : { morphTargets: morph },
    ...weights === void 0 ? {} : { morphWeights: weights }
  };
}
function decodeMeshBinary(bytes, refs) {
  const decoded = unpackMeshBinary(bytes);
  if (decoded === void 0) return void 0;
  return meshFromParts(
    {
      vertices: decoded.vertices,
      ...decoded.attributes === void 0 ? {} : { attributes: decoded.attributes },
      ...decoded.indices === void 0 ? {} : { indices: decoded.indices },
      ...decoded.aabb === void 0 ? {} : { aabb: decoded.aabb },
      ...decoded.submeshes === void 0 ? {} : { submeshes: decoded.submeshes },
      ...decoded.materialSlots === void 0 ? {} : { materialSlots: decoded.materialSlots },
      ...decoded.morphTargets === void 0 ? {} : { morphTargets: decoded.morphTargets },
      ...decoded.morphWeights === void 0 ? {} : { morphWeights: decoded.morphWeights },
      ...decoded.skinIndex === void 0 && decoded.skinWeight === void 0 ? {} : {
        attributes: {
          ...decoded.skinIndex === void 0 ? {} : { skinIndex: decoded.skinIndex },
          ...decoded.skinWeight === void 0 ? {} : { skinWeight: decoded.skinWeight }
        }
      },
      floatsPerVertex: decoded.floatsPerVertex,
      uvSetCount: decoded.uvSetCount
    },
    refs
  );
}
function normalizeMeshPayload(payload, refs) {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return void 0;
  const source = payload;
  if (source.kind !== "mesh") return void 0;
  const sourceAttributes = source.attributes !== null && typeof source.attributes === "object" ? source.attributes : void 0;
  const projection = sourceAttributes === void 0 ? void 0 : deriveVertexLayoutProjection(sourceAttributes);
  const floatsPerVertex = projection === void 0 || projection.attributes.length === 0 ? PROCEDURAL_FLOATS_PER_VERTEX : projection.arrayStride / Float32Array.BYTES_PER_ELEMENT;
  return meshFromParts(
    {
      vertices: source.vertices,
      ...source.indices === void 0 ? {} : { indices: source.indices },
      ...source.attributes === void 0 ? {} : { attributes: source.attributes },
      ...source.aabb === void 0 ? {} : { aabb: source.aabb },
      submeshes: Array.isArray(source.submeshes) ? source.submeshes : [],
      ...Array.isArray(source.materialSlots) ? { materialSlots: source.materialSlots } : {},
      ...source.morphTargets === void 0 ? {} : { morphTargets: source.morphTargets },
      ...source.morphWeights === void 0 ? {} : { morphWeights: source.morphWeights },
      floatsPerVertex
    },
    refs
  );
}
function createCylinderGeometry(radiusTop, radiusBottom, height, radialSegments = 16, heightSegments = 1) {
  if (radiusTop < 0 || radiusBottom < 0 || height <= 0) {
    return err(
      degenerate(`radiusTop=${radiusTop}, radiusBottom=${radiusBottom}, height=${height}`)
    );
  }
  if (radiusTop === 0 && radiusBottom === 0) {
    return err(degenerate(`radiusTop=0 and radiusBottom=0; at least one must be > 0`));
  }
  const rs = radialSegments | 0;
  const hs = heightSegments | 0;
  if (rs < 3) return err(degenerate(`radialSegments=${rs}; minimum 3`));
  if (hs < 1) return err(degenerate(`heightSegments=${hs}; minimum 1`));
  const halfHeight = height / 2;
  const sideVertexCount = (rs + 1) * (hs + 1);
  const topCap = radiusTop > 0;
  const bottomCap = radiusBottom > 0;
  const topCount = topCap ? rs + 2 : 0;
  const bottomCount = bottomCap ? rs + 2 : 0;
  const vertexCount = sideVertexCount + topCount + bottomCount;
  const sideIndexCount = rs * hs * 6;
  const topIdxCount = topCap ? rs * 3 : 0;
  const bottomIdxCount = bottomCap ? rs * 3 : 0;
  const indexCount = sideIndexCount + topIdxCount + bottomIdxCount;
  const vertices = new Float32Array(vertexCount * FACTORY_FLOATS_PER_VERTEX);
  const indices = new Uint32Array(indexCount);
  let vIdx = 0;
  const slope = (radiusBottom - radiusTop) / height;
  for (let iy = 0; iy <= hs; iy++) {
    const v = iy / hs;
    const y = halfHeight - v * height;
    const radius = v * (radiusBottom - radiusTop) + radiusTop;
    for (let ix = 0; ix <= rs; ix++) {
      const u = ix / rs;
      const theta = u * Math.PI * 2;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);
      const x = radius * sinT;
      const z = radius * cosT;
      const nx = sinT;
      const ny = slope;
      const nz = cosT;
      const nlen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      const base = vIdx * FACTORY_FLOATS_PER_VERTEX;
      vertices[base + 0] = x;
      vertices[base + 1] = y;
      vertices[base + 2] = z;
      vertices[base + 3] = nx / nlen;
      vertices[base + 4] = ny / nlen;
      vertices[base + 5] = nz / nlen;
      vertices[base + 6] = u;
      vertices[base + 7] = v;
      vIdx++;
    }
  }
  let iIdx = 0;
  for (let iy = 0; iy < hs; iy++) {
    for (let ix = 0; ix < rs; ix++) {
      const a = (rs + 1) * iy + ix;
      const b = (rs + 1) * (iy + 1) + ix;
      const c = (rs + 1) * (iy + 1) + ix + 1;
      const d = (rs + 1) * iy + ix + 1;
      indices[iIdx++] = a;
      indices[iIdx++] = b;
      indices[iIdx++] = d;
      indices[iIdx++] = b;
      indices[iIdx++] = c;
      indices[iIdx++] = d;
    }
  }
  if (topCap) {
    const centerIdx = vIdx;
    const cBase = vIdx * FACTORY_FLOATS_PER_VERTEX;
    vertices[cBase + 0] = 0;
    vertices[cBase + 1] = halfHeight;
    vertices[cBase + 2] = 0;
    vertices[cBase + 3] = 0;
    vertices[cBase + 4] = 1;
    vertices[cBase + 5] = 0;
    vertices[cBase + 6] = 0.5;
    vertices[cBase + 7] = 0.5;
    vIdx++;
    const ringStart = vIdx;
    for (let ix = 0; ix <= rs; ix++) {
      const u = ix / rs;
      const theta = u * Math.PI * 2;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);
      const base = vIdx * FACTORY_FLOATS_PER_VERTEX;
      vertices[base + 0] = radiusTop * sinT;
      vertices[base + 1] = halfHeight;
      vertices[base + 2] = radiusTop * cosT;
      vertices[base + 3] = 0;
      vertices[base + 4] = 1;
      vertices[base + 5] = 0;
      vertices[base + 6] = sinT * 0.5 + 0.5;
      vertices[base + 7] = cosT * 0.5 + 0.5;
      vIdx++;
    }
    for (let ix = 0; ix < rs; ix++) {
      indices[iIdx++] = centerIdx;
      indices[iIdx++] = ringStart + ix;
      indices[iIdx++] = ringStart + ix + 1;
    }
  }
  if (bottomCap) {
    const centerIdx = vIdx;
    const cBase = vIdx * FACTORY_FLOATS_PER_VERTEX;
    vertices[cBase + 0] = 0;
    vertices[cBase + 1] = -halfHeight;
    vertices[cBase + 2] = 0;
    vertices[cBase + 3] = 0;
    vertices[cBase + 4] = -1;
    vertices[cBase + 5] = 0;
    vertices[cBase + 6] = 0.5;
    vertices[cBase + 7] = 0.5;
    vIdx++;
    const ringStart = vIdx;
    for (let ix = 0; ix <= rs; ix++) {
      const u = ix / rs;
      const theta = u * Math.PI * 2;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);
      const base = vIdx * FACTORY_FLOATS_PER_VERTEX;
      vertices[base + 0] = radiusBottom * sinT;
      vertices[base + 1] = -halfHeight;
      vertices[base + 2] = radiusBottom * cosT;
      vertices[base + 3] = 0;
      vertices[base + 4] = -1;
      vertices[base + 5] = 0;
      vertices[base + 6] = sinT * 0.5 + 0.5;
      vertices[base + 7] = cosT * 0.5 + 0.5;
      vIdx++;
    }
    for (let ix = 0; ix < rs; ix++) {
      indices[iIdx++] = centerIdx;
      indices[iIdx++] = ringStart + ix + 1;
      indices[iIdx++] = ringStart + ix;
    }
  }
  return meshFromInterleaved(vertices, indices);
}
function createPlaneGeometry(width, height, widthSegments = 1, heightSegments = 1) {
  if (width <= 0 || height <= 0) {
    return err(degenerate(`width=${width}, height=${height}`));
  }
  const ws = widthSegments | 0;
  const hs = heightSegments | 0;
  if (ws < 1 || hs < 1) {
    return err(degenerate(`widthSegments=${ws}, heightSegments=${hs}`));
  }
  const halfW = width / 2;
  const halfH = height / 2;
  const gridX1 = ws + 1;
  const gridY1 = hs + 1;
  const segW = width / ws;
  const segH = height / hs;
  const vertexCount = gridX1 * gridY1;
  const indexCount = ws * hs * 6;
  const vertices = new Float32Array(vertexCount * FACTORY_FLOATS_PER_VERTEX);
  const indices = new Uint32Array(indexCount);
  let vIdx = 0;
  for (let iy = 0; iy < gridY1; iy++) {
    const y = iy * segH - halfH;
    for (let ix = 0; ix < gridX1; ix++) {
      const x = ix * segW - halfW;
      const base = vIdx * FACTORY_FLOATS_PER_VERTEX;
      vertices[base + 0] = x;
      vertices[base + 1] = -y;
      vertices[base + 2] = 0;
      vertices[base + 3] = 0;
      vertices[base + 4] = 0;
      vertices[base + 5] = 1;
      vertices[base + 6] = ix / ws;
      vertices[base + 7] = iy / hs;
      vIdx++;
    }
  }
  let iIdx = 0;
  for (let iy = 0; iy < hs; iy++) {
    for (let ix = 0; ix < ws; ix++) {
      const a = ix + gridX1 * iy;
      const b = ix + gridX1 * (iy + 1);
      const c = ix + 1 + gridX1 * (iy + 1);
      const d = ix + 1 + gridX1 * iy;
      indices[iIdx++] = a;
      indices[iIdx++] = b;
      indices[iIdx++] = d;
      indices[iIdx++] = b;
      indices[iIdx++] = c;
      indices[iIdx++] = d;
    }
  }
  return meshFromInterleaved(vertices, indices);
}
function createSphereGeometry(radius, widthSegments = 16, heightSegments = 12) {
  if (radius <= 0) return err(degenerate(`radius=${radius}`));
  const ws = widthSegments | 0;
  const hs = heightSegments | 0;
  if (ws < 3) return err(degenerate(`widthSegments=${ws}; minimum 3`));
  if (hs < 2) return err(degenerate(`heightSegments=${hs}; minimum 2`));
  const vertexCount = (ws + 1) * (hs + 1);
  const indexCount = ws * hs * 6;
  const vertices = new Float32Array(vertexCount * FACTORY_FLOATS_PER_VERTEX);
  const indices = new Uint32Array(indexCount);
  let vIdx = 0;
  for (let iy = 0; iy <= hs; iy++) {
    const v = iy / hs;
    const phi = v * Math.PI;
    for (let ix = 0; ix <= ws; ix++) {
      const u = ix / ws;
      const theta = u * Math.PI * 2;
      const x = -radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(theta) * Math.sin(phi);
      const nx = x / radius;
      const ny = y / radius;
      const nz = z / radius;
      const base = vIdx * FACTORY_FLOATS_PER_VERTEX;
      vertices[base + 0] = x;
      vertices[base + 1] = y;
      vertices[base + 2] = z;
      vertices[base + 3] = nx;
      vertices[base + 4] = ny;
      vertices[base + 5] = nz;
      vertices[base + 6] = u;
      vertices[base + 7] = v;
      vIdx++;
    }
  }
  let iIdx = 0;
  const stride = ws + 1;
  for (let iy = 0; iy < hs; iy++) {
    for (let ix = 0; ix < ws; ix++) {
      const a = iy * stride + ix + 1;
      const b = iy * stride + ix;
      const c = (iy + 1) * stride + ix;
      const d = (iy + 1) * stride + ix + 1;
      if (iy !== 0) {
        indices[iIdx++] = a;
        indices[iIdx++] = b;
        indices[iIdx++] = d;
      }
      if (iy !== hs - 1) {
        indices[iIdx++] = b;
        indices[iIdx++] = c;
        indices[iIdx++] = d;
      }
    }
  }
  const trimmed = indices.slice(0, iIdx);
  return meshFromInterleaved(vertices, trimmed);
}

// src/assets/primitive-mesh.ts
var PROCEDURAL_MESH_KINDS = {
  "procedural-cube": "cube",
  "procedural-triangle": "triangle",
  "procedural-quad": "quad",
  "procedural-sphere": "sphere",
  "procedural-cylinder": "cylinder",
  "procedural-nine-slice-quad": "nine-slice-quad"
};
function createPrimitiveMesh(kind) {
  switch (kind) {
    case "cube":
      return createBoxGeometry(1, 1, 1);
    case "triangle":
      return meshFromInterleaved(
        new Float32Array([
          0,
          0.7,
          0,
          0,
          0,
          1,
          0.5,
          1,
          -0.7,
          -0.6,
          0,
          0,
          0,
          1,
          0,
          0,
          0.7,
          -0.6,
          0,
          0,
          0,
          1,
          1,
          0
        ]),
        new Uint16Array([0, 1, 2])
      );
    case "quad":
      return createPlaneGeometry(1, 1);
    case "sphere":
      return createSphereGeometry(1, 16, 12);
    case "cylinder":
      return createCylinderGeometry(0.5, 0.5, 1, 16, 1);
    case "nine-slice-quad":
      return createPlaneGeometry(1, 1, 3, 3);
  }
}
function createProceduralMesh(payload) {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return void 0;
  const geometry = payload.geometry;
  if (typeof geometry !== "string") return void 0;
  const kind = PROCEDURAL_MESH_KINDS[geometry];
  if (kind === void 0) return void 0;
  return createPrimitiveMesh(kind);
}

// src/assets/mesh-decoder.ts
var meshAssetKind = {
  kind: "mesh"
};
function proceduralMesh(payload) {
  const result = createProceduralMesh(payload);
  if (result === void 0) return void 0;
  if (result.ok) return result;
  return err({
    code: "asset-package-invalid",
    expected: result.error.expected,
    hint: "recook the authored procedural mesh descriptor",
    detail: { guid: "", reason: "procedural mesh creation failed" }
  });
}
var meshAssetDecoder = {
  async decode({ envelope, artifacts }) {
    const payload = envelope.payload;
    const procedural = proceduralMesh(payload);
    if (procedural !== void 0) {
      if (!procedural.ok) {
        return err({
          code: "asset-package-invalid",
          expected: procedural.error.expected,
          hint: procedural.error.hint,
          detail: { guid: envelope.guid, reason: "procedural mesh creation failed" }
        });
      }
      return procedural;
    }
    const body = envelope.artifacts.body;
    if (body !== void 0) {
      const bytes = await artifacts.read(body);
      if (!bytes.ok) return err(bytes.error);
      const decoded = decodeMeshBinary(bytes.value, envelope.refs);
      if (decoded === void 0) {
        return err({
          code: "asset-package-invalid",
          expected: "a valid mesh-binary/4 body artifact with a local-space AABB",
          hint: "recook the mesh binary and publish its validated geometry payload",
          detail: { guid: envelope.guid, reason: "mesh binary decode failed" }
        });
      }
      return ok(decoded);
    }
    const normalized = normalizeMeshPayload(payload, envelope.refs);
    if (normalized !== void 0) return ok(normalized);
    if (payload.kind !== "mesh" || !(payload.vertices instanceof Float32Array) || payload.vertices.length === 0 || payload.aabb === void 0) {
      return err({
        code: "asset-package-invalid",
        expected: "a mesh payload with vertices and a local-space AABB",
        hint: "recook the mesh binary and publish its validated geometry payload",
        detail: { guid: envelope.guid, reason: "mesh payload failed geometry validation" }
      });
    }
    return ok(payload);
  }
};
var meshAssetContribution = {
  kind: meshAssetKind,
  decoder: meshAssetDecoder,
  consumer: "Geometry"
};
function createCapsuleGeometry(radius, length, capSegments = 4, radialSegments = 8) {
  if (radius <= 0) return err(degenerate(`radius=${radius}`));
  if (length < 0) return err(degenerate(`length=${length}`));
  const cs = capSegments | 0;
  const rs = radialSegments | 0;
  if (cs < 1) return err(degenerate(`capSegments=${cs}; minimum 1`));
  if (rs < 3) return err(degenerate(`radialSegments=${rs}; minimum 3`));
  const halfLength = length / 2;
  const latRows = 2 * (cs + 1);
  const vertexCount = latRows * (rs + 1);
  const indexCount = (latRows - 1) * rs * 6;
  const vertices = new Float32Array(vertexCount * FACTORY_FLOATS_PER_VERTEX);
  const indices = new Uint32Array(indexCount);
  let vIdx = 0;
  for (let row = 0; row < latRows; row++) {
    const topHemi = row <= cs;
    let ringR;
    let y;
    let centerY;
    if (topHemi) {
      const t = row / cs;
      const a = t * (Math.PI / 2);
      ringR = radius * Math.sin(a);
      centerY = halfLength;
      y = centerY + radius * Math.cos(a);
    } else {
      const t = (row - (cs + 1)) / cs;
      const a = t * (Math.PI / 2);
      ringR = radius * Math.cos(a);
      centerY = -halfLength;
      y = centerY - radius * Math.sin(a);
    }
    const v = row / (latRows - 1);
    for (let ix = 0; ix <= rs; ix++) {
      const u = ix / rs;
      const theta = u * Math.PI * 2;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);
      const x = ringR * sinT;
      const z = ringR * cosT;
      const nx = x;
      const ny = y - centerY;
      const nz = z;
      const nlen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      const base = vIdx * FACTORY_FLOATS_PER_VERTEX;
      vertices[base + 0] = x;
      vertices[base + 1] = y;
      vertices[base + 2] = z;
      vertices[base + 3] = nx / nlen;
      vertices[base + 4] = ny / nlen;
      vertices[base + 5] = nz / nlen;
      vertices[base + 6] = u;
      vertices[base + 7] = v;
      vIdx++;
    }
  }
  let iIdx = 0;
  const stride = rs + 1;
  for (let row = 0; row < latRows - 1; row++) {
    for (let ix = 0; ix < rs; ix++) {
      const a = row * stride + ix + 1;
      const b = row * stride + ix;
      const c = (row + 1) * stride + ix;
      const d = (row + 1) * stride + ix + 1;
      const northPoleRow = row === 0;
      const southPoleRow = row === latRows - 2;
      if (!northPoleRow) {
        indices[iIdx++] = a;
        indices[iIdx++] = b;
        indices[iIdx++] = d;
      }
      if (!southPoleRow) {
        indices[iIdx++] = b;
        indices[iIdx++] = c;
        indices[iIdx++] = d;
      }
    }
  }
  const trimmed = indices.slice(0, iIdx);
  return meshFromInterleaved(vertices, trimmed);
}
function createConeGeometry(radius, height, radialSegments = 16, heightSegments = 1) {
  if (radius <= 0) return err(degenerate(`radius=${radius}`));
  if (height <= 0) return err(degenerate(`height=${height}`));
  return createCylinderGeometry(0, radius, height, radialSegments, heightSegments);
}
var DEFAULT_RESOLUTION = 32;
function invalid(detail) {
  return err(degenerate(detail));
}
function resolution(value) {
  const resolved = value ?? DEFAULT_RESOLUTION;
  const integer = resolved | 0;
  return integer >= 3 && integer === resolved ? integer : void 0;
}
function finitePoint(point) {
  return Number.isFinite(point[0]) && Number.isFinite(point[1]);
}
function maskRadius(shape) {
  switch (shape.kind) {
    case "circle":
    case "circular-sector":
    case "circular-segment":
      return shape.radius;
    case "ellipse":
    case "annulus":
    case "capsule":
    case "rhombus":
    case "rectangle":
    case "regular-polygon":
    case "triangle":
    case "segment":
    case "polyline":
      return void 0;
  }
}
function validateMeshOptions(shape, options) {
  const uv = options?.uv;
  if (uv === void 0) return ok(void 0);
  const radius = maskRadius(shape);
  return radius !== void 0 && radius > 0 && Number.isFinite(uv.angle) ? ok({ kind: "circular-mask", radius, angle: uv.angle }) : invalid(`circular-mask UV requires a circular shape and finite angle`);
}
function area(points) {
  let value = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (!a || !b) continue;
    value += a[0] * b[1] - b[0] * a[1];
  }
  return value / 2;
}
function centroid(points) {
  let x = 0;
  let y = 0;
  for (const point of points) {
    x += point[0];
    y += point[1];
  }
  const count = Math.max(1, points.length);
  return [x / count, y / count];
}
function counterClockwise(points) {
  return area(points) < 0 ? [...points].reverse() : [...points];
}
function circleBoundary(radius, count, start = -Math.PI / 2) {
  return Array.from({ length: count }, (_, i) => {
    const angle = start + i / count * Math.PI * 2;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius];
  });
}
function arcBoundary(radius, angle, count, start) {
  return Array.from({ length: count + 1 }, (_, i) => {
    const t = i / count;
    const current = start + angle * t;
    return [Math.cos(current) * radius, Math.sin(current) * radius];
  });
}
function ellipseBoundary(halfWidth, halfHeight, count) {
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + i / count * Math.PI * 2;
    return [Math.cos(angle) * halfWidth, Math.sin(angle) * halfHeight];
  });
}
function capsuleBoundary(radius, halfLength, count) {
  const points = [];
  for (let i = 0; i <= count; i++) {
    const angle = i / count * Math.PI;
    points.push([Math.cos(angle) * radius, halfLength + Math.sin(angle) * radius]);
  }
  for (let i = 0; i <= count; i++) {
    const angle = Math.PI + i / count * Math.PI;
    points.push([Math.cos(angle) * radius, -halfLength + Math.sin(angle) * radius]);
  }
  points.pop();
  points.shift();
  return points;
}
function buildMesh(points, indices, topology, uvProjection) {
  const positions = new Float32Array(points.length * 3);
  const normals = new Float32Array(points.length * 3);
  const uvs = new Float32Array(points.length * 2);
  const tangents = new Float32Array(points.length * 4);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point[0]);
    minY = Math.min(minY, point[1]);
    maxX = Math.max(maxX, point[0]);
    maxY = Math.max(maxY, point[1]);
  }
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  const vertices = new Float32Array(points.length * PROCEDURAL_FLOATS_PER_VERTEX);
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (!point) continue;
    const [x, y] = point;
    const positionOffset = i * 3;
    const uvOffset = i * 2;
    const tangentOffset = i * 4;
    const vertexOffset = i * PROCEDURAL_FLOATS_PER_VERTEX;
    positions[positionOffset] = x;
    positions[positionOffset + 1] = y;
    normals[positionOffset + 2] = 1;
    const cos = uvProjection === void 0 ? 1 : Math.cos(uvProjection.angle);
    const sin = uvProjection === void 0 ? 0 : Math.sin(uvProjection.angle);
    const projectedX = x * cos - y * sin;
    const projectedY = x * sin + y * cos;
    const u = uvProjection === void 0 ? (x - minX) / width : 0.5 + projectedX / (2 * uvProjection.radius);
    const v = uvProjection === void 0 ? (maxY - y) / height : 0.5 - projectedY / (2 * uvProjection.radius);
    uvs[uvOffset] = u;
    uvs[uvOffset + 1] = v;
    tangents[tangentOffset] = 1;
    tangents[tangentOffset + 3] = 1;
    vertices[vertexOffset] = x;
    vertices[vertexOffset + 1] = y;
    vertices[vertexOffset + 5] = 1;
    vertices[vertexOffset + 6] = u;
    vertices[vertexOffset + 7] = v;
    vertices[vertexOffset + 8] = 1;
    vertices[vertexOffset + 11] = 1;
  }
  return {
    kind: "mesh",
    vertices,
    indices: new Uint32Array(indices),
    attributes: { position: positions, normal: normals, uv: uvs, tangent: tangents },
    submeshes: [
      {
        indexOffset: 0,
        indexCount: indices.length,
        vertexCount: points.length,
        topology,
        materialSlot: 0
      }
    ],
    materialSlots: [{ slotName: "Default" }],
    aabb: box3.fromPositions(box3.create(), positions)
  };
}
function fill(points, uvProjection) {
  const boundary = counterClockwise(points);
  const center = centroid(boundary);
  const vertices = [center, ...boundary];
  const indices = [];
  for (let i = 0; i < boundary.length; i++) {
    const next = (i + 1) % boundary.length;
    indices.push(0, i + 1, next + 1);
  }
  return buildMesh(vertices, indices, "triangle-list", uvProjection);
}
function ring(outer, inner) {
  const outside = counterClockwise(outer);
  const inside = counterClockwise(inner);
  const count = Math.min(outside.length, inside.length);
  const vertices = [...outside.slice(0, count), ...inside.slice(0, count)];
  const indices = [];
  for (let i = 0; i < count; i++) {
    const next = (i + 1) % count;
    indices.push(i, next, count + i, next, count + next, count + i);
  }
  return buildMesh(vertices, indices, "triangle-list");
}
function segment(points) {
  const indices = [];
  for (let i = 0; i + 1 < points.length; i += 1) indices.push(i, i + 1);
  return buildMesh(points, indices, "line-list");
}
function shapeBoundary(shape, count) {
  switch (shape.kind) {
    case "circle":
      return circleBoundary(shape.radius, count);
    case "circular-sector":
      return [
        ...arcBoundary(shape.radius, shape.angle, count, -Math.PI / 2 - shape.angle / 2),
        [0, 0]
      ];
    case "circular-segment":
      return arcBoundary(shape.radius, shape.angle, count, -Math.PI / 2 - shape.angle / 2);
    case "ellipse":
      return ellipseBoundary(shape.halfWidth, shape.halfHeight, count);
    case "capsule":
      return capsuleBoundary(shape.radius, shape.halfLength, Math.max(2, Math.floor(count / 2)));
    case "rhombus":
      return [
        [0, shape.halfHeight],
        [shape.halfWidth, 0],
        [0, -shape.halfHeight],
        [-shape.halfWidth, 0]
      ];
    case "rectangle":
      return [
        [-shape.width / 2, -shape.height / 2],
        [shape.width / 2, -shape.height / 2],
        [shape.width / 2, shape.height / 2],
        [-shape.width / 2, shape.height / 2]
      ];
    case "regular-polygon":
      return Array.from({ length: shape.sides }, (_, i) => {
        const angle = -Math.PI / 2 + i / shape.sides * Math.PI * 2;
        return [Math.cos(angle) * shape.radius, Math.sin(angle) * shape.radius];
      });
    case "triangle":
      return [...shape.vertices];
    case "annulus":
    case "segment":
    case "polyline":
      return void 0;
  }
}
function scaleAround(points, factor) {
  const center = centroid(points);
  return points.map(([x, y]) => [
    center[0] + (x - center[0]) * factor,
    center[1] + (y - center[1]) * factor
  ]);
}
function withResolution(value, valid, detail) {
  const count = resolution(value);
  return valid && count !== void 0 ? ok(count) : invalid(detail);
}
function validateCommon(shape) {
  switch (shape.kind) {
    case "circle":
      return withResolution(
        shape.resolution,
        shape.radius > 0 && Number.isFinite(shape.radius),
        `circle radius=${shape.radius}, resolution=${shape.resolution}`
      );
    case "circular-sector":
    case "circular-segment":
      return withResolution(
        shape.resolution,
        shape.radius > 0 && shape.angle > 0 && shape.angle <= Math.PI * 2 && Number.isFinite(shape.radius) && Number.isFinite(shape.angle),
        `${shape.kind} radius=${shape.radius}, angle=${shape.angle}, resolution=${shape.resolution}`
      );
    case "ellipse":
      return withResolution(
        shape.resolution,
        shape.halfWidth > 0 && shape.halfHeight > 0 && Number.isFinite(shape.halfWidth) && Number.isFinite(shape.halfHeight),
        `ellipse halfWidth=${shape.halfWidth}, halfHeight=${shape.halfHeight}, resolution=${shape.resolution}`
      );
    case "annulus":
      return withResolution(
        shape.resolution,
        shape.innerRadius >= 0 && shape.outerRadius > shape.innerRadius && Number.isFinite(shape.innerRadius) && Number.isFinite(shape.outerRadius),
        `annulus innerRadius=${shape.innerRadius}, outerRadius=${shape.outerRadius}, resolution=${shape.resolution}`
      );
    case "capsule":
      return withResolution(
        shape.resolution,
        shape.radius > 0 && shape.halfLength >= 0 && Number.isFinite(shape.radius) && Number.isFinite(shape.halfLength),
        `capsule radius=${shape.radius}, halfLength=${shape.halfLength}, resolution=${shape.resolution}`
      );
    case "rhombus":
      return shape.halfWidth > 0 && shape.halfHeight > 0 && Number.isFinite(shape.halfWidth) && Number.isFinite(shape.halfHeight) ? ok(0) : invalid(`rhombus halfWidth=${shape.halfWidth}, halfHeight=${shape.halfHeight}`);
    case "rectangle":
      return shape.width > 0 && shape.height > 0 && Number.isFinite(shape.width) && Number.isFinite(shape.height) ? ok(0) : invalid(`rectangle width=${shape.width}, height=${shape.height}`);
    case "regular-polygon":
      return shape.radius > 0 && Number.isFinite(shape.radius) && Number.isInteger(shape.sides) && shape.sides >= 3 ? ok(0) : invalid(`regular-polygon radius=${shape.radius}, sides=${shape.sides}`);
    case "triangle":
      return shape.vertices.every(finitePoint) && Math.abs(area(shape.vertices)) > 1e-7 ? ok(0) : invalid("triangle vertices must be finite and non-collinear");
    case "segment":
      return shape.vertices.every(finitePoint) && (shape.vertices[0][0] !== shape.vertices[1][0] || shape.vertices[0][1] !== shape.vertices[1][1]) ? ok(0) : invalid("segment endpoints must be finite and distinct");
    case "polyline":
      return shape.vertices.length >= 2 && shape.vertices.every(finitePoint) ? ok(0) : invalid("polyline needs at least two finite vertices");
  }
}
function create2dGeometry(shape, options) {
  const checked = validateCommon(shape);
  if (!checked.ok) return checked;
  const meshOptions = validateMeshOptions(shape, options);
  if (!meshOptions.ok) return meshOptions;
  if (shape.kind === "segment" || shape.kind === "polyline") return ok(segment(shape.vertices));
  if (shape.kind === "annulus") {
    const outer = circleBoundary(shape.outerRadius, checked.value);
    const inner = circleBoundary(shape.innerRadius, checked.value);
    return ok(ring(outer, inner));
  }
  const points = shapeBoundary(shape, checked.value);
  if (!points) return invalid(`unsupported 2d shape kind=${shape.kind}`);
  return ok(fill(points, meshOptions.value));
}
function boundsPoints(shape, count) {
  if (shape.kind === "annulus") return circleBoundary(shape.outerRadius, count);
  if (shape.kind === "segment" || shape.kind === "polyline") return [...shape.vertices];
  return shapeBoundary(shape, count);
}
function compute2dBounds(shape, pose = {}) {
  const checked = validateCommon(shape);
  if (!checked.ok) return checked;
  const translation = pose.translation ?? [0, 0];
  const rotation = pose.rotation ?? 0;
  if (!finitePoint(translation) || !Number.isFinite(rotation)) {
    return invalid("2d bounds pose must contain finite translation and rotation");
  }
  const points = boundsPoints(shape, checked.value);
  if (points === void 0 || points.length === 0)
    return invalid(`unsupported 2d bounds kind=${shape.kind}`);
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const transformed = points.map(
    ([x, y]) => [translation[0] + x * cos - y * sin, translation[1] + x * sin + y * cos]
  );
  let radius = 0;
  for (const [x, y] of points) radius = Math.max(radius, Math.hypot(x, y));
  return ok({
    aabb: box2.fromPoints(box2.create(), transformed),
    circle: circle2.create(translation[0], translation[1], radius)
  });
}
function create2dRingGeometry(shape, thickness, resolutionOverride) {
  if (!(thickness > 0) || !Number.isFinite(thickness))
    return invalid(`ring thickness=${thickness}`);
  const checked = validateCommon(shape);
  if (!checked.ok) return checked;
  if (shape.kind === "segment" || shape.kind === "polyline" || shape.kind === "annulus") {
    return invalid(`rings require a closed non-annulus shape, got ${shape.kind}`);
  }
  const count = resolutionOverride === void 0 ? checked.value : resolution(resolutionOverride);
  if (count === void 0) return invalid(`ring resolution=${resolutionOverride}`);
  const outer = shapeBoundary(shape, count);
  if (!outer) return invalid(`unsupported ring shape kind=${shape.kind}`);
  const extent = Math.max(...outer.map(([x, y]) => Math.hypot(x, y)));
  const factor = (extent - thickness) / extent;
  if (!(factor > 1e-5))
    return invalid(`ring thickness=${thickness} exceeds shape extent=${extent}`);
  return ok(ring(outer, scaleAround(outer, factor)));
}
var WELD_EPSILON = 1e-4;
var DEFAULT_THRESHOLD_DEGREES = 1;
function parseFailure(field, value, reason) {
  return new AssetError({
    code: "asset-parse-failed",
    expected: `a valid triangle-list MeshAsset: ${reason}`,
    hint: ASSET_ERROR_HINTS["asset-parse-failed"],
    detail: { field, value, reason }
  });
}
function f32Bits(value) {
  const buffer = new ArrayBuffer(4);
  new Float32Array(buffer)[0] = value;
  return new Uint32Array(buffer)[0];
}
function normalizedValue(value) {
  return value === 0 ? 0 : value;
}
function exactKey(value) {
  return value.map((component) => f32Bits(normalizedValue(component)).toString(16).padStart(8, "0")).join(":");
}
function weldComponent(value) {
  const scaled = normalizedValue(value) / WELD_EPSILON;
  return String(Math.round(scaled));
}
function weldKey(value) {
  return value.map(weldComponent).join(":");
}
function endpoint(position) {
  const value = [
    normalizedValue(position[0]),
    normalizedValue(position[1]),
    normalizedValue(position[2])
  ];
  return { value, exactKey: exactKey(value), weldKey: weldKey(value) };
}
function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}
function compareEndpoint(left, right) {
  return compareText(left.exactKey, right.exactKey);
}
function compareWireEdge(left, right) {
  return compareEndpoint(left.a, right.a) || compareEndpoint(left.b, right.b);
}
function compareSurfaceEdge(left, right) {
  return compareText(left.aWeldKey, right.aWeldKey) || compareText(left.bWeldKey, right.bWeldKey);
}
function readPosition(raw) {
  return raw instanceof Float32Array ? raw : new Float32Array(raw);
}
function validatePosition(source) {
  if (source === null || typeof source !== "object" || source.kind !== "mesh") {
    return err(parseFailure("kind", source?.kind, "kind must be mesh"));
  }
  const attributes = source.attributes;
  const raw = attributes?.position;
  if (raw === void 0) {
    return err(parseFailure("attributes.position", void 0, "position is required"));
  }
  if (raw instanceof ArrayBuffer) {
    if (raw.byteLength % 4 !== 0) {
      return err(
        parseFailure(
          "attributes.position",
          raw.byteLength,
          "ArrayBuffer byte length must align to f32"
        )
      );
    }
  } else if (!(raw instanceof Float32Array)) {
    return err(
      parseFailure(
        "attributes.position",
        raw === null ? null : typeof raw,
        "position storage must be Float32Array or ArrayBuffer"
      )
    );
  }
  const position = readPosition(raw);
  if (position.length % 3 !== 0) {
    return err(
      parseFailure(
        "attributes.position",
        position.length,
        "position length must be divisible by 3"
      )
    );
  }
  for (let index = 0; index < position.length; index += 1) {
    const value = position[index];
    if (!Number.isFinite(value)) {
      return err(parseFailure("attributes.position", value, `position[${index}] must be finite`));
    }
  }
  return ok(position);
}
function validateThreshold(threshold) {
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 180) {
    return err(
      parseFailure("thresholdAngleDegrees", threshold, "threshold must be finite and in [0, 180]")
    );
  }
  return ok(threshold);
}
function validateSubmeshShape(source, positionCount) {
  if (!Array.isArray(source.submeshes) || source.submeshes.length === 0) {
    return err(parseFailure("submeshes", source.submeshes, "at least one submesh is required"));
  }
  const indexed = source.indices !== void 0;
  if (!indexed && source.submeshes.length !== 1) {
    return err(
      parseFailure("submeshes", source.submeshes.length, "non-indexed meshes require one submesh")
    );
  }
  if (!indexed && positionCount % 3 !== 0) {
    return err(
      parseFailure(
        "attributes.position",
        positionCount,
        "non-indexed positions require triangle cardinality"
      )
    );
  }
  for (let index = 0; index < source.submeshes.length; index += 1) {
    const submesh = source.submeshes[index];
    if (submesh === void 0 || submesh === null || submesh.topology !== "triangle-list") {
      return err(
        parseFailure(
          `submeshes[${index}].topology`,
          submesh?.topology,
          "topology must be triangle-list"
        )
      );
    }
    if (!Number.isInteger(submesh.indexOffset) || submesh.indexOffset < 0) {
      return err(
        parseFailure(
          `submeshes[${index}].indexOffset`,
          submesh.indexOffset,
          "index offset must be a non-negative integer"
        )
      );
    }
    if (!Number.isInteger(submesh.indexCount) || submesh.indexCount < 0) {
      return err(
        parseFailure(
          `submeshes[${index}].indexCount`,
          submesh.indexCount,
          "index count must be a non-negative integer"
        )
      );
    }
    if (!Number.isInteger(submesh.vertexCount) || submesh.vertexCount < 0 || submesh.vertexCount > positionCount) {
      return err(
        parseFailure(
          `submeshes[${index}].vertexCount`,
          submesh.vertexCount,
          "vertex count must be an integer within position count"
        )
      );
    }
    if (submesh.indexCount % 3 !== 0) {
      return err(
        parseFailure(
          `submeshes[${index}].indexCount`,
          submesh.indexCount,
          "index count must be divisible by 3"
        )
      );
    }
    if (!indexed && submesh.indexOffset !== 0) {
      return err(
        parseFailure(
          `submeshes[${index}].indexOffset`,
          submesh.indexOffset,
          "non-indexed submesh index offset must be zero"
        )
      );
    }
    if (!indexed && submesh.indexCount !== 0) {
      return err(
        parseFailure(
          `submeshes[${index}].indexCount`,
          submesh.indexCount,
          "non-indexed submesh index count must be zero"
        )
      );
    }
    if (!indexed && submesh.vertexCount !== positionCount) {
      return err(
        parseFailure(
          `submeshes[${index}].vertexCount`,
          submesh.vertexCount,
          "non-indexed submesh must span all positions"
        )
      );
    }
  }
  return ok(void 0);
}
function validateIndices(source, positionCount) {
  const indices = source.indices;
  if (indices === void 0) return ok(void 0);
  if (!(indices instanceof Uint16Array) && !(indices instanceof Uint32Array)) {
    return err(
      parseFailure("indices", indices, "indices storage must be Uint16Array or Uint32Array")
    );
  }
  for (let index = 0; index < source.submeshes.length; index += 1) {
    const submesh = source.submeshes[index];
    if (submesh === void 0) continue;
    if (submesh.indexOffset + submesh.indexCount > indices.length) {
      return err(
        parseFailure(`submeshes[${index}]`, submesh, "submesh index range exceeds indices length")
      );
    }
    for (let offset = submesh.indexOffset; offset < submesh.indexOffset + submesh.indexCount; offset += 1) {
      const value = indices[offset];
      if (!Number.isInteger(value) || value < 0 || value >= positionCount) {
        return err(
          parseFailure(`indices[${offset}]`, value, "index must address a position vertex")
        );
      }
    }
  }
  return ok(void 0);
}
function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function triangleNormal(a, b, c) {
  const normal = cross(subtract(b, a), subtract(c, a));
  const length = Math.hypot(normal[0], normal[1], normal[2]);
  if (!Number.isFinite(length) || length === 0) return void 0;
  return [normal[0] / length, normal[1] / length, normal[2] / length];
}
function positionAt(position, index) {
  const base = index * 3;
  return [position[base], position[base + 1], position[base + 2]];
}
function makeTriangle(position, indices) {
  const a = endpoint(positionAt(position, indices[0]));
  const b = endpoint(positionAt(position, indices[1]));
  const c = endpoint(positionAt(position, indices[2]));
  const normal = triangleNormal(a.value, b.value, c.value);
  return normal === void 0 ? void 0 : { a, b, c, normal };
}
function collectTriangles(source, position) {
  const triangles = [];
  for (const submesh of source.submeshes) {
    if (source.indices === void 0) {
      for (let offset = 0; offset < submesh.vertexCount; offset += 3) {
        const triangle = makeTriangle(position, [offset, offset + 1, offset + 2]);
        if (triangle !== void 0) triangles.push(triangle);
      }
      continue;
    }
    for (let offset = submesh.indexOffset; offset < submesh.indexOffset + submesh.indexCount; offset += 3) {
      const a = source.indices[offset];
      const b = source.indices[offset + 1];
      const c = source.indices[offset + 2];
      const triangle = makeTriangle(position, [a, b, c]);
      if (triangle !== void 0) triangles.push(triangle);
    }
  }
  return triangles;
}
function prepare(source, threshold) {
  const positionResult = validatePosition(source);
  if (!positionResult.ok) return positionResult;
  if (threshold !== void 0) {
    const thresholdResult = validateThreshold(threshold);
    if (!thresholdResult.ok) return thresholdResult;
  }
  const submeshResult = validateSubmeshShape(source, positionResult.value.length / 3);
  if (!submeshResult.ok) return submeshResult;
  const indexResult = validateIndices(source, positionResult.value.length / 3);
  if (!indexResult.ok) return indexResult;
  return ok({ triangles: collectTriangles(source, positionResult.value) });
}
function addWireEdge(edges, left, right) {
  if (left.exactKey === right.exactKey) return;
  const [a, b] = compareEndpoint(left, right) < 0 ? [left, right] : [right, left];
  const key = `${a.exactKey}|${b.exactKey}`;
  if (!edges.has(key)) edges.set(key, { a, b });
}
function collectWireEdges(triangles) {
  const edges = /* @__PURE__ */ new Map();
  for (const triangle of triangles) {
    addWireEdge(edges, triangle.a, triangle.b);
    addWireEdge(edges, triangle.b, triangle.c);
    addWireEdge(edges, triangle.c, triangle.a);
  }
  return Array.from(edges.values()).sort(compareWireEdge);
}
function updateRepresentative(current, candidate) {
  return compareEndpoint(candidate, current) < 0 ? candidate : current;
}
function addSurfaceEdge(edges, left, right, normal) {
  if (left.weldKey === right.weldKey) return;
  const leftFirst = compareText(left.weldKey, right.weldKey) < 0;
  const a = leftFirst ? left : right;
  const b = leftFirst ? right : left;
  const key = `${a.weldKey}|${b.weldKey}`;
  const current = edges.get(key);
  if (current === void 0) {
    edges.set(key, {
      aWeldKey: a.weldKey,
      bWeldKey: b.weldKey,
      a,
      b,
      normals: [normal]
    });
    return;
  }
  current.a = updateRepresentative(current.a, a);
  current.b = updateRepresentative(current.b, b);
  current.normals.push(normal);
}
function collectSurfaceEdges(triangles) {
  const edges = /* @__PURE__ */ new Map();
  for (const triangle of triangles) {
    addSurfaceEdge(edges, triangle.a, triangle.b, triangle.normal);
    addSurfaceEdge(edges, triangle.b, triangle.c, triangle.normal);
    addSurfaceEdge(edges, triangle.c, triangle.a, triangle.normal);
  }
  return Array.from(edges.values()).sort(compareSurfaceEdge);
}
function keepSurfaceEdge(edge, thresholdDegrees) {
  if (edge.normals.length !== 2) return true;
  const first = edge.normals[0];
  const second = edge.normals[1];
  if (first === void 0 || second === void 0) return true;
  const dot = Math.min(
    1,
    Math.max(-1, first[0] * second[0] + first[1] * second[1] + first[2] * second[2])
  );
  return dot <= Math.cos(thresholdDegrees * Math.PI / 180);
}
function lineMesh(edges) {
  const positions = new Float32Array(edges.length * 6);
  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
    const edge = edges[edgeIndex];
    positions.set(edge.a.value, edgeIndex * 6);
    positions.set(edge.b.value, edgeIndex * 6 + 3);
  }
  const vertexCount = positions.length / 3;
  const attributes = {
    position: positions,
    normal: new Float32Array(vertexCount * 3),
    uv: new Float32Array(vertexCount * 2),
    tangent: new Float32Array(vertexCount * 4)
  };
  const packed = packInterleavedVertexAttributes(attributes, vertexCount);
  if (!packed.ok) return err(packed.error);
  return ok({
    kind: "mesh",
    vertices: packed.value.vertices,
    attributes,
    submeshes: [
      {
        indexOffset: 0,
        indexCount: 0,
        vertexCount,
        topology: "line-list",
        materialSlot: 0
      }
    ],
    materialSlots: [{ slotName: "Default" }],
    aabb: box3.fromPositions(box3.create(), positions)
  });
}
function createWireframeGeometry(source) {
  const prepared = prepare(source);
  if (!prepared.ok) return prepared;
  return lineMesh(collectWireEdges(prepared.value.triangles));
}
function createEdgesGeometry(source, thresholdAngleDegrees = DEFAULT_THRESHOLD_DEGREES) {
  const prepared = prepare(source, thresholdAngleDegrees);
  if (!prepared.ok) return prepared;
  const edges = collectSurfaceEdges(prepared.value.triangles).filter(
    (edge) => keepSurfaceEdge(edge, thresholdAngleDegrees)
  );
  return lineMesh(edges.map(({ a, b }) => ({ a, b })));
}
var ATTRIBUTE_KEYS = [
  "position",
  "normal",
  "uv",
  "tangent",
  "skinIndex",
  "skinWeight",
  "uv1",
  "uv2",
  "uv3",
  "uv4",
  "uv5",
  "uv6",
  "uv7",
  "color"
];
var ATTRIBUTE_COMPONENTS = {
  position: 3,
  normal: 3,
  uv: 2,
  tangent: 4,
  skinIndex: 4,
  skinWeight: 4,
  uv1: 2,
  uv2: 2,
  uv3: 2,
  uv4: 2,
  uv5: 2,
  uv6: 2,
  uv7: 2,
  color: 4
};
var TOPOLOGIES = [
  "point-list",
  "line-list",
  "line-strip",
  "triangle-list",
  "triangle-strip"
];
function failure(field, value, reason) {
  return err(
    new AssetError({
      code: "asset-invalid-value",
      expected: `valid MeshBuilder ${field}: ${reason}`,
      hint: ASSET_ERROR_HINTS["asset-invalid-value"],
      detail: { field, value, reason }
    })
  );
}
function sourceView(key, value) {
  if (key === "skinIndex") {
    if (value instanceof Uint16Array) return value;
    if (value instanceof ArrayBuffer && value.byteLength % Uint16Array.BYTES_PER_ELEMENT === 0) {
      return new Uint16Array(value);
    }
    return void 0;
  }
  if (value instanceof Float32Array) return value;
  if (value instanceof ArrayBuffer && value.byteLength % Float32Array.BYTES_PER_ELEMENT === 0) {
    return new Float32Array(value);
  }
  return void 0;
}
function cloneAttribute(key, value) {
  const view = sourceView(key, value);
  if (view === void 0) return void 0;
  return view.slice();
}
function attributeKeys(attributes) {
  return ATTRIBUTE_KEYS.filter((key) => attributes[key] !== void 0);
}
function appendArray(target, source) {
  if (target instanceof Uint16Array && source instanceof Uint16Array) {
    const output = new Uint16Array(target.length + source.length);
    output.set(target, 0);
    output.set(source, target.length);
    return output;
  }
  if (target instanceof Float32Array && source instanceof Float32Array) {
    const output = new Float32Array(target.length + source.length);
    output.set(target, 0);
    output.set(source, target.length);
    return output;
  }
  return target;
}
function copySlots(slots) {
  return (slots ?? [{ slotName: "Default" }]).map((slot) => ({
    slotName: slot.slotName,
    ...slot.sourceKey === void 0 ? {} : { sourceKey: slot.sourceKey },
    ...slot.defaultMaterial === void 0 ? {} : { defaultMaterial: slot.defaultMaterial }
  }));
}
function validateAttributeBatch(attributes) {
  const keys = attributeKeys(attributes);
  if (keys.length === 0)
    return failure("attributes", [], "at least one canonical attribute is required");
  const position = attributes.position;
  if (position === void 0)
    return failure("attributes.position", void 0, "position is required");
  const positionView = sourceView("position", position);
  if (positionView === void 0) {
    return failure(
      "attributes.position",
      typeof position,
      "position must use Float32Array or ArrayBuffer"
    );
  }
  if (positionView.length === 0 || positionView.length % 3 !== 0) {
    return failure(
      "attributes.position",
      positionView.length,
      "position cardinality must be a non-zero multiple of 3"
    );
  }
  const vertexCount = positionView.length / 3;
  for (const key of keys) {
    const value = attributes[key];
    if (value === void 0) continue;
    const view = sourceView(key, value);
    if (view === void 0) {
      return failure(
        key,
        typeof value,
        key === "skinIndex" ? "storage must be Uint16Array" : "storage must be Float32Array"
      );
    }
    const expectedLength = vertexCount * ATTRIBUTE_COMPONENTS[key];
    if (view.length !== expectedLength) {
      return failure(key, view.length, `cardinality must be ${expectedLength}`);
    }
    for (let elementIndex = 0; elementIndex < view.length; elementIndex += 1) {
      const valueAt = view[elementIndex];
      if (valueAt === void 0 || !Number.isFinite(valueAt)) {
        return failure(key, valueAt, `${key}[${elementIndex}] must be finite`);
      }
      if (key === "skinIndex" && (!Number.isInteger(valueAt) || valueAt < 0 || valueAt > 65535)) {
        return failure(key, valueAt, `${key}[${elementIndex}] must be an integer in [0, 65535]`);
      }
    }
  }
  return ok({ keys, vertexCount });
}
function validateSlots(slots) {
  if (slots.length === 0)
    return failure("materialSlots", slots.length, "at least one material slot is required");
  const names = /* @__PURE__ */ new Set();
  for (let index = 0; index < slots.length; index += 1) {
    const slot = slots[index];
    const name = slot?.slotName.trim() ?? "";
    if (name.length === 0 || names.has(name)) {
      return failure(`materialSlots[${index}].slotName`, name, "must be non-empty and unique");
    }
    names.add(name);
  }
  return ok(void 0);
}
function completedSubmeshes(requested, vertexCount, indexCount, materialSlotCount) {
  const source = requested.length === 0 ? [
    {
      indexOffset: 0,
      indexCount,
      vertexCount,
      topology: "triangle-list",
      materialSlot: 0
    }
  ] : requested;
  const output = [];
  for (let index = 0; index < source.length; index += 1) {
    const candidate = source[index];
    if (candidate === void 0)
      return failure(`submeshes[${index}]`, void 0, "entry is required");
    const indexOffset = candidate.indexOffset ?? 0;
    const submeshIndexCount = candidate.indexCount ?? (indexCount > 0 ? indexCount : 0);
    const submeshVertexCount = candidate.vertexCount ?? vertexCount;
    const topology = candidate.topology ?? "triangle-list";
    const materialSlot = candidate.materialSlot ?? index;
    if (!TOPOLOGIES.includes(topology)) {
      return failure(
        `submeshes[${index}].topology`,
        topology,
        "must be a WebGPU primitive topology"
      );
    }
    if (!Number.isInteger(indexOffset) || indexOffset < 0 || !Number.isInteger(submeshIndexCount) || submeshIndexCount < 0 || !Number.isInteger(submeshVertexCount) || submeshVertexCount < 0 || submeshVertexCount > vertexCount || !Number.isInteger(materialSlot) || materialSlot < 0 || materialSlot >= materialSlotCount) {
      return failure(
        `submeshes[${index}]`,
        JSON.stringify(candidate),
        "range and material slot are invalid"
      );
    }
    if (indexCount === 0 && (indexOffset !== 0 || submeshIndexCount !== 0)) {
      return failure(
        `submeshes[${index}]`,
        JSON.stringify(candidate),
        "non-indexed meshes use indexOffset=0 and indexCount=0"
      );
    }
    if (indexCount > 0 && indexOffset + submeshIndexCount > indexCount) {
      return failure(
        `submeshes[${index}]`,
        JSON.stringify(candidate),
        "index range exceeds the accumulated index buffer"
      );
    }
    if (indexCount === 0 && (topology === "line-strip" || topology === "triangle-strip")) {
      return failure(
        `submeshes[${index}].topology`,
        topology,
        "strip topology requires an index buffer"
      );
    }
    output.push({
      indexOffset,
      indexCount: submeshIndexCount,
      vertexCount: submeshVertexCount,
      topology,
      materialSlot
    });
  }
  return ok(Object.freeze(output));
}
function createMeshBuilder(options = {}) {
  const attributes = {};
  const indices = [];
  const submeshes = [];
  const materialSlots = copySlots(options.materialSlots);
  const appendVertices = (batch) => {
    const checked = validateAttributeBatch(batch);
    if (!checked.ok) return checked;
    const incomingKeys = checked.value.keys;
    const existingKeys = ATTRIBUTE_KEYS.filter((key) => attributes[key] !== void 0);
    if (existingKeys.length > 0 && existingKeys.join("|") !== incomingKeys.join("|")) {
      return failure(
        "attributes",
        incomingKeys.join(","),
        "every appended batch must carry the same canonical keys"
      );
    }
    for (const key of incomingKeys) {
      const value = batch[key];
      if (value === void 0) continue;
      const cloned = cloneAttribute(key, value);
      if (cloned === void 0) return failure(key, typeof value, "storage could not be cloned");
      const previous = attributes[key];
      attributes[key] = previous === void 0 ? cloned : appendArray(previous, cloned);
    }
    return ok(void 0);
  };
  const appendIndices = (batch) => {
    for (let index = 0; index < batch.length; index += 1) {
      const value = Number(batch[index]);
      if (!Number.isInteger(value) || value < 0 || value > 4294967295) {
        return failure("indices", value, `indices[${index}] must be an integer in [0, 2^32-1]`);
      }
      indices.push(value);
    }
    return ok(void 0);
  };
  const addSubmesh = (submesh) => {
    if (submesh === null || typeof submesh !== "object") {
      return failure("submeshes", submesh, "entry must be an object");
    }
    submeshes.push({ ...submesh });
    return ok(void 0);
  };
  const build = () => {
    const source = attributes;
    const checked = validateAttributeBatch(source);
    if (!checked.ok) return checked;
    const slotCheck = validateSlots(materialSlots);
    if (!slotCheck.ok) return slotCheck;
    const vertexCount = checked.value.vertexCount;
    const position = source.position;
    if (position === void 0)
      return failure("attributes.position", void 0, "position is required");
    const positionView = sourceView("position", position);
    if (!(positionView instanceof Float32Array)) {
      return failure("attributes.position", typeof position, "position storage is invalid");
    }
    let maxIndex = 0;
    for (const value of indices) maxIndex = Math.max(maxIndex, value);
    const indexArray2 = indices.length === 0 ? void 0 : maxIndex <= 65535 ? new Uint16Array(indices) : new Uint32Array(indices);
    if (indexArray2 !== void 0) {
      for (let index = 0; index < indexArray2.length; index += 1) {
        const value = indexArray2[index];
        if (value === void 0 || value >= vertexCount) {
          return failure(
            "indices",
            value ?? -1,
            `indices[${index}] must be less than vertexCount (${vertexCount})`
          );
        }
      }
    }
    const packed = packInterleavedVertexAttributes(source, vertexCount);
    if (!packed.ok) return packed;
    const ranges = completedSubmeshes(
      submeshes,
      vertexCount,
      indexArray2?.length ?? 0,
      materialSlots.length
    );
    if (!ranges.ok) return ranges;
    const aabb = box3.fromPositions(box3.create(), positionView);
    const copiedAttributes = {};
    for (const key of checked.value.keys) {
      const value = source[key];
      if (value === void 0) continue;
      const cloned = cloneAttribute(key, value);
      if (cloned === void 0) return failure(key, typeof value, "storage could not be cloned");
      if (key === "skinIndex") {
        if (!(cloned instanceof Uint16Array)) {
          return failure(key, typeof value, "skinIndex storage must be Uint16Array");
        }
        copiedAttributes.skinIndex = cloned;
      } else {
        if (!(cloned instanceof Float32Array)) {
          return failure(key, typeof value, `${key} storage must be Float32Array`);
        }
        copiedAttributes[key] = cloned;
      }
    }
    const mesh = {
      kind: "mesh",
      vertices: packed.value.vertices.slice(),
      ...indexArray2 === void 0 ? {} : { indices: indexArray2.slice() },
      attributes: copiedAttributes,
      aabb: Float32Array.from(aabb),
      submeshes: ranges.value,
      materialSlots: Object.freeze(materialSlots.map((slot) => ({ ...slot })))
    };
    return ok(Object.freeze(mesh));
  };
  if (options.attributes !== void 0) {
    const result = appendVertices(options.attributes);
    if (!result.ok) {
      const constructionError = result.error;
      return {
        appendVertices,
        appendIndices,
        addSubmesh,
        build: () => err(constructionError)
      };
    }
  }
  if (options.indices !== void 0) {
    const result = appendIndices(options.indices);
    if (!result.ok) {
      const constructionError = result.error;
      return {
        appendVertices,
        appendIndices,
        addSubmesh,
        build: () => err(constructionError)
      };
    }
  }
  for (const submesh of options.submeshes ?? []) submeshes.push({ ...submesh });
  return { appendVertices, appendIndices, addSubmesh, build };
}
function invalid2(field, detail) {
  return err(
    new AssetError({
      code: "asset-parse-failed",
      expected: `valid procedural geometry input for ${field}`,
      hint: ASSET_ERROR_HINTS["asset-parse-failed"],
      detail: { field, value: detail, reason: detail }
    })
  );
}
function finitePoint2(point) {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}
function cross2(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
function signedArea(points) {
  let value = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    value += a.x * b.y - b.x * a.y;
  }
  return value / 2;
}
function onSegment(a, b, p) {
  return Math.min(a.x, b.x) <= p.x + 1e-8 && p.x <= Math.max(a.x, b.x) + 1e-8 && Math.min(a.y, b.y) <= p.y + 1e-8 && p.y <= Math.max(a.y, b.y) + 1e-8;
}
function edgesCross(a, b, c, d) {
  const ab = cross2(a, b, c);
  const abD = cross2(a, b, d);
  const cdA = cross2(c, d, a);
  const cdB = cross2(c, d, b);
  if (Math.abs(ab) < 1e-8 && onSegment(a, b, c)) return true;
  if (Math.abs(abD) < 1e-8 && onSegment(a, b, d)) return true;
  if (Math.abs(cdA) < 1e-8 && onSegment(c, d, a)) return true;
  if (Math.abs(cdB) < 1e-8 && onSegment(c, d, b)) return true;
  return ab > 0 !== abD > 0 && cdA > 0 !== cdB > 0;
}
function selfIntersects(points) {
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    for (let j = i + 1; j < points.length; j++) {
      if (j === i || (j + 1) % points.length === i || (i + 1) % points.length === j) continue;
      const c = points[j];
      const d = points[(j + 1) % points.length];
      if (edgesCross(a, b, c, d)) return true;
    }
  }
  return false;
}
function insideTriangle(a, b, c, point) {
  return cross2(a, b, point) >= -1e-8 && cross2(b, c, point) >= -1e-8 && cross2(c, a, point) >= -1e-8;
}
function triangulate(points) {
  const order = points.map((_, index) => index);
  if (signedArea(points) < 0) order.reverse();
  const triangles = [];
  let guard = 0;
  while (order.length > 3 && guard++ < points.length * points.length) {
    let clipped = false;
    for (let i = 0; i < order.length; i++) {
      const previous = order[(i + order.length - 1) % order.length];
      const current = order[i];
      const next = order[(i + 1) % order.length];
      if (cross2(
        points[previous],
        points[current],
        points[next]
      ) <= 1e-8)
        continue;
      let contains = false;
      for (const candidate of order) {
        if (candidate !== previous && candidate !== current && candidate !== next && insideTriangle(
          points[previous],
          points[current],
          points[next],
          points[candidate]
        )) {
          contains = true;
          break;
        }
      }
      if (contains) continue;
      triangles.push(previous, current, next);
      order.splice(i, 1);
      clipped = true;
      break;
    }
    if (!clipped) return void 0;
  }
  if (order.length !== 3) return void 0;
  triangles.push(order[0], order[1], order[2]);
  return triangles;
}
function pushVertex(vertices, position, normal, uv) {
  const index = vertices.length / FACTORY_FLOATS_PER_VERTEX;
  vertices.push(
    position[0],
    position[1],
    position[2],
    normal[0],
    normal[1],
    normal[2],
    uv[0],
    uv[1]
  );
  return index;
}
function pushTriangle(vertices, indices, a, b, c) {
  indices.push(
    pushVertex(vertices, a.p, a.n, a.uv),
    pushVertex(vertices, b.p, b.n, b.uv),
    pushVertex(vertices, c.p, c.n, c.uv)
  );
}
function createExtrusionGeometry(contour, depth) {
  if (!Number.isFinite(depth) || depth <= 0) return invalid2("depth", "must be positive and finite");
  const points = contour.length > 1 && contour[0]?.x === contour[contour.length - 1]?.x && contour[0]?.y === contour[contour.length - 1]?.y ? contour.slice(0, -1) : [...contour];
  if (points.length < 3 || points.some((point) => !finitePoint2(point)))
    return invalid2("contour", "needs at least three finite points");
  const area2 = signedArea(points);
  if (Math.abs(area2) < 1e-8) return invalid2("contour", "area must be non-zero");
  if (selfIntersects(points)) return invalid2("contour", "must not self-intersect");
  const capTriangles = triangulate(points);
  if (capTriangles === void 0) return invalid2("contour", "could not be triangulated");
  const vertices = [];
  const indices = [];
  const half = depth / 2;
  for (let i = 0; i < capTriangles.length; i += 3) {
    const a = points[capTriangles[i]];
    const b = points[capTriangles[i + 1]];
    const c = points[capTriangles[i + 2]];
    pushTriangle(
      vertices,
      indices,
      { p: [a.x, a.y, half], n: [0, 0, 1], uv: [a.x, a.y] },
      { p: [b.x, b.y, half], n: [0, 0, 1], uv: [b.x, b.y] },
      { p: [c.x, c.y, half], n: [0, 0, 1], uv: [c.x, c.y] }
    );
    pushTriangle(
      vertices,
      indices,
      { p: [c.x, c.y, -half], n: [0, 0, -1], uv: [c.x, c.y] },
      { p: [b.x, b.y, -half], n: [0, 0, -1], uv: [b.x, b.y] },
      { p: [a.x, a.y, -half], n: [0, 0, -1], uv: [a.x, a.y] }
    );
  }
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    perimeter += Math.hypot(b.x - a.x, b.y - a.y);
  }
  let distance = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const edge = Math.hypot(b.x - a.x, b.y - a.y);
    const u0 = perimeter === 0 ? 0 : distance / perimeter;
    const u1 = perimeter === 0 ? 1 : (distance + edge) / perimeter;
    const nx = b.y - a.y;
    const ny = -(b.x - a.x);
    const length = Math.hypot(nx, ny) || 1;
    const normal = area2 >= 0 ? [nx / length, ny / length, 0] : [-nx / length, -ny / length, 0];
    if (area2 >= 0) {
      pushTriangle(
        vertices,
        indices,
        { p: [a.x, a.y, -half], n: normal, uv: [u0, 0] },
        { p: [b.x, b.y, -half], n: normal, uv: [u1, 0] },
        { p: [b.x, b.y, half], n: normal, uv: [u1, 1] }
      );
      pushTriangle(
        vertices,
        indices,
        { p: [a.x, a.y, -half], n: normal, uv: [u0, 0] },
        { p: [b.x, b.y, half], n: normal, uv: [u1, 1] },
        { p: [a.x, a.y, half], n: normal, uv: [u0, 1] }
      );
    } else {
      pushTriangle(
        vertices,
        indices,
        { p: [a.x, a.y, -half], n: normal, uv: [u0, 0] },
        { p: [b.x, b.y, half], n: normal, uv: [u1, 1] },
        { p: [b.x, b.y, -half], n: normal, uv: [u1, 0] }
      );
      pushTriangle(
        vertices,
        indices,
        { p: [a.x, a.y, -half], n: normal, uv: [u0, 0] },
        { p: [a.x, a.y, half], n: normal, uv: [u0, 1] },
        { p: [b.x, b.y, half], n: normal, uv: [u1, 1] }
      );
    }
    distance += edge;
  }
  return meshFromInterleaved(new Float32Array(vertices), new Uint32Array(indices));
}
function createSweepGeometry(path, radius, radialSegments = 12) {
  if (!Number.isFinite(radius) || radius <= 0)
    return invalid2("radius", "must be positive and finite");
  const segments = radialSegments | 0;
  if (path.length < 2 || path.some((point) => point.length !== 3 || point.some((value) => !Number.isFinite(value))))
    return invalid2("path", "needs at least two finite 3D points");
  if (segments < 3) return invalid2("radialSegments", "must be at least 3");
  const first = path[0];
  const last = path[path.length - 1];
  const closed = path.length > 3 && Math.hypot(first[0] - last[0], first[1] - last[1], first[2] - last[2]) <= 1e-8;
  for (let left = 0; left < path.length; left++) {
    const a = path[left];
    for (let right = left + 1; right < path.length; right++) {
      const b = path[right];
      if (closed && left === 0 && right === path.length - 1) continue;
      if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) <= 1e-8) {
        return invalid2("path", "must not contain repeated points");
      }
    }
  }
  const lengths = [0];
  for (let i = 1; i < path.length; i++) {
    const previous = path[i - 1];
    const current = path[i];
    lengths.push(
      lengths[i - 1] + Math.hypot(current[0] - previous[0], current[1] - previous[1], current[2] - previous[2])
    );
  }
  const total = lengths[lengths.length - 1];
  if (!(total > 0)) return invalid2("path", "must contain distinct points");
  const vertices = [];
  const indices = [];
  for (let row = 0; row < path.length; row++) {
    const point = path[row];
    const previous = path[Math.max(0, row - 1)];
    const next = path[Math.min(path.length - 1, row + 1)];
    let tx = next[0] - previous[0];
    let ty = next[1] - previous[1];
    let tz = next[2] - previous[2];
    const tangentLength = Math.hypot(tx, ty, tz) || 1;
    tx /= tangentLength;
    ty /= tangentLength;
    tz /= tangentLength;
    const reference = Math.abs(ty) < 0.95 ? [0, 1, 0] : [1, 0, 0];
    let nx = ty * reference[2] - tz * reference[1];
    let ny = tz * reference[0] - tx * reference[2];
    let nz = tx * reference[1] - ty * reference[0];
    const nLength = Math.hypot(nx, ny, nz) || 1;
    nx /= nLength;
    ny /= nLength;
    nz /= nLength;
    const bx = ty * nz - tz * ny;
    const by = tz * nx - tx * nz;
    const bz = tx * ny - ty * nx;
    for (let column = 0; column <= segments; column++) {
      const angle = column / segments * Math.PI * 2;
      const radialX = Math.cos(angle) * nx + Math.sin(angle) * bx;
      const radialY = Math.cos(angle) * ny + Math.sin(angle) * by;
      const radialZ = Math.cos(angle) * nz + Math.sin(angle) * bz;
      pushVertex(
        vertices,
        [point[0] + radialX * radius, point[1] + radialY * radius, point[2] + radialZ * radius],
        [radialX, radialY, radialZ],
        [column / segments, lengths[row] / total]
      );
    }
  }
  const stride = segments + 1;
  const position = (index) => [
    vertices[index * 8],
    vertices[index * 8 + 1],
    vertices[index * 8 + 2]
  ];
  for (let row = 0; row < path.length - 1; row++) {
    for (let column = 0; column < segments; column++) {
      const a = row * stride + column;
      const b = a + 1;
      const c = (row + 1) * stride + column + 1;
      const d = (row + 1) * stride + column;
      const p = position(a);
      const q = position(b);
      const r = position(c);
      const ab = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
      const ac = [r[0] - p[0], r[1] - p[1], r[2] - p[2]];
      const normal = [
        ab[1] * ac[2] - ab[2] * ac[1],
        ab[2] * ac[0] - ab[0] * ac[2],
        ab[0] * ac[1] - ab[1] * ac[0]
      ];
      const center = path[row];
      const outward = [p[0] - center[0], p[1] - center[1], p[2] - center[2]];
      const dot = normal[0] * outward[0] + normal[1] * outward[1] + normal[2] * outward[2];
      if (dot > 0) indices.push(a, b, c, a, c, d);
      else indices.push(a, c, b, a, d, c);
    }
  }
  return meshFromInterleaved(new Float32Array(vertices), new Uint32Array(indices));
}
function createRevolutionGeometry(profile, radialSegments = 24) {
  const segments = radialSegments | 0;
  if (profile.length < 2 || profile.some((point) => !finitePoint2(point) || point.x < 0))
    return invalid2("profile", "needs at least two finite points with non-negative radius");
  if (segments < 3) return invalid2("radialSegments", "must be at least 3");
  const first = profile[0];
  if (first === void 0 || !profile.some((point) => point.y !== first.y))
    return invalid2("profile", "must span a non-zero height");
  for (let left = 0; left < profile.length; left++) {
    const a = profile[left];
    for (let right = left + 1; right < profile.length; right++) {
      const b = profile[right];
      if (Math.hypot(a.x - b.x, a.y - b.y) <= 1e-8) {
        return invalid2("profile", "must not contain repeated points");
      }
    }
  }
  const vertices = [];
  const indices = [];
  for (let row = 0; row < profile.length; row++) {
    const point = profile[row];
    const previous = profile[Math.max(0, row - 1)];
    const next = profile[Math.min(profile.length - 1, row + 1)];
    const dr = next.x - previous.x;
    const dy = next.y - previous.y;
    const normalLength = Math.hypot(dy, dr) || 1;
    for (let column = 0; column <= segments; column++) {
      const u = column / segments;
      const angle = u * Math.PI * 2;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      pushVertex(
        vertices,
        [point.x * c, point.y, point.x * s],
        [c * dy / normalLength, -dr / normalLength, s * dy / normalLength],
        [u, row / (profile.length - 1)]
      );
    }
  }
  const stride = segments + 1;
  for (let row = 0; row < profile.length - 1; row++) {
    for (let column = 0; column < segments; column++) {
      const a = row * stride + column;
      const b = a + 1;
      const c = (row + 1) * stride + column + 1;
      const d = (row + 1) * stride + column;
      indices.push(a, d, b, b, d, c);
    }
  }
  return meshFromInterleaved(new Float32Array(vertices), new Uint32Array(indices));
}
var PATCHES = new Uint16Array([
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  3,
  16,
  17,
  18,
  7,
  19,
  20,
  21,
  11,
  22,
  23,
  24,
  15,
  25,
  26,
  27,
  18,
  28,
  29,
  30,
  21,
  31,
  32,
  33,
  24,
  34,
  35,
  36,
  27,
  37,
  38,
  39,
  30,
  40,
  41,
  0,
  33,
  42,
  43,
  4,
  36,
  44,
  45,
  8,
  39,
  46,
  47,
  12,
  12,
  13,
  14,
  15,
  48,
  49,
  50,
  51,
  52,
  53,
  54,
  55,
  56,
  57,
  58,
  59,
  15,
  25,
  26,
  27,
  51,
  60,
  61,
  62,
  55,
  63,
  64,
  65,
  59,
  66,
  67,
  68,
  27,
  37,
  38,
  39,
  62,
  69,
  70,
  71,
  65,
  72,
  73,
  74,
  68,
  75,
  76,
  77,
  39,
  46,
  47,
  12,
  71,
  78,
  79,
  48,
  74,
  80,
  81,
  52,
  77,
  82,
  83,
  56,
  56,
  57,
  58,
  59,
  84,
  85,
  86,
  87,
  88,
  89,
  90,
  91,
  92,
  93,
  94,
  95,
  59,
  66,
  67,
  68,
  87,
  96,
  97,
  98,
  91,
  99,
  100,
  101,
  95,
  102,
  103,
  104,
  68,
  75,
  76,
  77,
  98,
  105,
  106,
  107,
  101,
  108,
  109,
  110,
  104,
  111,
  112,
  113,
  77,
  82,
  83,
  56,
  107,
  114,
  115,
  84,
  110,
  116,
  117,
  88,
  113,
  118,
  119,
  92,
  120,
  121,
  122,
  123,
  124,
  125,
  126,
  127,
  128,
  129,
  130,
  131,
  132,
  133,
  134,
  135,
  123,
  136,
  137,
  120,
  127,
  138,
  139,
  124,
  131,
  140,
  141,
  128,
  135,
  142,
  143,
  132,
  132,
  133,
  134,
  135,
  144,
  145,
  146,
  147,
  148,
  149,
  150,
  151,
  68,
  152,
  153,
  154,
  135,
  142,
  143,
  132,
  147,
  155,
  156,
  144,
  151,
  157,
  158,
  148,
  154,
  159,
  160,
  68,
  161,
  162,
  163,
  164,
  165,
  166,
  167,
  168,
  169,
  170,
  171,
  172,
  173,
  174,
  175,
  176,
  164,
  177,
  178,
  161,
  168,
  179,
  180,
  165,
  172,
  181,
  182,
  169,
  176,
  183,
  184,
  173,
  173,
  174,
  175,
  176,
  185,
  186,
  187,
  188,
  189,
  190,
  191,
  192,
  193,
  194,
  195,
  196,
  176,
  183,
  184,
  173,
  188,
  197,
  198,
  185,
  192,
  199,
  200,
  189,
  196,
  201,
  202,
  193,
  203,
  203,
  203,
  203,
  204,
  205,
  206,
  207,
  208,
  208,
  208,
  208,
  209,
  210,
  211,
  212,
  203,
  203,
  203,
  203,
  207,
  213,
  214,
  215,
  208,
  208,
  208,
  208,
  212,
  216,
  217,
  218,
  203,
  203,
  203,
  203,
  215,
  219,
  220,
  221,
  208,
  208,
  208,
  208,
  218,
  222,
  223,
  224,
  203,
  203,
  203,
  203,
  221,
  225,
  226,
  204,
  208,
  208,
  208,
  208,
  224,
  227,
  228,
  209,
  209,
  210,
  211,
  212,
  229,
  230,
  231,
  232,
  233,
  234,
  235,
  236,
  237,
  238,
  239,
  240,
  212,
  216,
  217,
  218,
  232,
  241,
  242,
  243,
  236,
  244,
  245,
  246,
  240,
  247,
  248,
  249,
  218,
  222,
  223,
  224,
  243,
  250,
  251,
  252,
  246,
  253,
  254,
  255,
  249,
  256,
  257,
  258,
  224,
  227,
  228,
  209,
  252,
  259,
  260,
  229,
  255,
  261,
  262,
  233,
  258,
  263,
  264,
  237,
  265,
  265,
  265,
  265,
  266,
  267,
  268,
  269,
  270,
  271,
  272,
  273,
  92,
  119,
  118,
  113,
  265,
  265,
  265,
  265,
  269,
  274,
  275,
  276,
  273,
  277,
  278,
  279,
  113,
  112,
  111,
  104,
  265,
  265,
  265,
  265,
  276,
  280,
  281,
  282,
  279,
  283,
  284,
  285,
  104,
  103,
  102,
  95,
  265,
  265,
  265,
  265,
  282,
  286,
  287,
  266,
  285,
  288,
  289,
  270,
  95,
  94,
  93,
  92
]);
var CONTROL_POINTS = new Float32Array([
  1.4,
  0,
  2.4,
  1.4,
  -0.784,
  2.4,
  0.784,
  -1.4,
  2.4,
  0,
  -1.4,
  2.4,
  1.3375,
  0,
  2.53125,
  1.3375,
  -0.749,
  2.53125,
  0.749,
  -1.3375,
  2.53125,
  0,
  -1.3375,
  2.53125,
  1.4375,
  0,
  2.53125,
  1.4375,
  -0.805,
  2.53125,
  0.805,
  -1.4375,
  2.53125,
  0,
  -1.4375,
  2.53125,
  1.5,
  0,
  2.4,
  1.5,
  -0.84,
  2.4,
  0.84,
  -1.5,
  2.4,
  0,
  -1.5,
  2.4,
  -0.784,
  -1.4,
  2.4,
  -1.4,
  -0.784,
  2.4,
  -1.4,
  0,
  2.4,
  -0.749,
  -1.3375,
  2.53125,
  -1.3375,
  -0.749,
  2.53125,
  -1.3375,
  0,
  2.53125,
  -0.805,
  -1.4375,
  2.53125,
  -1.4375,
  -0.805,
  2.53125,
  -1.4375,
  0,
  2.53125,
  -0.84,
  -1.5,
  2.4,
  -1.5,
  -0.84,
  2.4,
  -1.5,
  0,
  2.4,
  -1.4,
  0.784,
  2.4,
  -0.784,
  1.4,
  2.4,
  0,
  1.4,
  2.4,
  -1.3375,
  0.749,
  2.53125,
  -0.749,
  1.3375,
  2.53125,
  0,
  1.3375,
  2.53125,
  -1.4375,
  0.805,
  2.53125,
  -0.805,
  1.4375,
  2.53125,
  0,
  1.4375,
  2.53125,
  -1.5,
  0.84,
  2.4,
  -0.84,
  1.5,
  2.4,
  0,
  1.5,
  2.4,
  0.784,
  1.4,
  2.4,
  1.4,
  0.784,
  2.4,
  0.749,
  1.3375,
  2.53125,
  1.3375,
  0.749,
  2.53125,
  0.805,
  1.4375,
  2.53125,
  1.4375,
  0.805,
  2.53125,
  0.84,
  1.5,
  2.4,
  1.5,
  0.84,
  2.4,
  1.75,
  0,
  1.875,
  1.75,
  -0.98,
  1.875,
  0.98,
  -1.75,
  1.875,
  0,
  -1.75,
  1.875,
  2,
  0,
  1.35,
  2,
  -1.12,
  1.35,
  1.12,
  -2,
  1.35,
  0,
  -2,
  1.35,
  2,
  0,
  0.9,
  2,
  -1.12,
  0.9,
  1.12,
  -2,
  0.9,
  0,
  -2,
  0.9,
  -0.98,
  -1.75,
  1.875,
  -1.75,
  -0.98,
  1.875,
  -1.75,
  0,
  1.875,
  -1.12,
  -2,
  1.35,
  -2,
  -1.12,
  1.35,
  -2,
  0,
  1.35,
  -1.12,
  -2,
  0.9,
  -2,
  -1.12,
  0.9,
  -2,
  0,
  0.9,
  -1.75,
  0.98,
  1.875,
  -0.98,
  1.75,
  1.875,
  0,
  1.75,
  1.875,
  -2,
  1.12,
  1.35,
  -1.12,
  2,
  1.35,
  0,
  2,
  1.35,
  -2,
  1.12,
  0.9,
  -1.12,
  2,
  0.9,
  0,
  2,
  0.9,
  0.98,
  1.75,
  1.875,
  1.75,
  0.98,
  1.875,
  1.12,
  2,
  1.35,
  2,
  1.12,
  1.35,
  1.12,
  2,
  0.9,
  2,
  1.12,
  0.9,
  2,
  0,
  0.45,
  2,
  -1.12,
  0.45,
  1.12,
  -2,
  0.45,
  0,
  -2,
  0.45,
  1.5,
  0,
  0.225,
  1.5,
  -0.84,
  0.225,
  0.84,
  -1.5,
  0.225,
  0,
  -1.5,
  0.225,
  1.5,
  0,
  0.15,
  1.5,
  -0.84,
  0.15,
  0.84,
  -1.5,
  0.15,
  0,
  -1.5,
  0.15,
  -1.12,
  -2,
  0.45,
  -2,
  -1.12,
  0.45,
  -2,
  0,
  0.45,
  -0.84,
  -1.5,
  0.225,
  -1.5,
  -0.84,
  0.225,
  -1.5,
  0,
  0.225,
  -0.84,
  -1.5,
  0.15,
  -1.5,
  -0.84,
  0.15,
  -1.5,
  0,
  0.15,
  -2,
  1.12,
  0.45,
  -1.12,
  2,
  0.45,
  0,
  2,
  0.45,
  -1.5,
  0.84,
  0.225,
  -0.84,
  1.5,
  0.225,
  0,
  1.5,
  0.225,
  -1.5,
  0.84,
  0.15,
  -0.84,
  1.5,
  0.15,
  0,
  1.5,
  0.15,
  1.12,
  2,
  0.45,
  2,
  1.12,
  0.45,
  0.84,
  1.5,
  0.225,
  1.5,
  0.84,
  0.225,
  0.84,
  1.5,
  0.15,
  1.5,
  0.84,
  0.15,
  -1.6,
  0,
  2.025,
  -1.6,
  -0.3,
  2.025,
  -1.5,
  -0.3,
  2.25,
  -1.5,
  0,
  2.25,
  -2.3,
  0,
  2.025,
  -2.3,
  -0.3,
  2.025,
  -2.5,
  -0.3,
  2.25,
  -2.5,
  0,
  2.25,
  -2.7,
  0,
  2.025,
  -2.7,
  -0.3,
  2.025,
  -3,
  -0.3,
  2.25,
  -3,
  0,
  2.25,
  -2.7,
  0,
  1.8,
  -2.7,
  -0.3,
  1.8,
  -3,
  -0.3,
  1.8,
  -3,
  0,
  1.8,
  -1.5,
  0.3,
  2.25,
  -1.6,
  0.3,
  2.025,
  -2.5,
  0.3,
  2.25,
  -2.3,
  0.3,
  2.025,
  -3,
  0.3,
  2.25,
  -2.7,
  0.3,
  2.025,
  -3,
  0.3,
  1.8,
  -2.7,
  0.3,
  1.8,
  -2.7,
  0,
  1.575,
  -2.7,
  -0.3,
  1.575,
  -3,
  -0.3,
  1.35,
  -3,
  0,
  1.35,
  -2.5,
  0,
  1.125,
  -2.5,
  -0.3,
  1.125,
  -2.65,
  -0.3,
  0.9375,
  -2.65,
  0,
  0.9375,
  -2,
  -0.3,
  0.9,
  -1.9,
  -0.3,
  0.6,
  -1.9,
  0,
  0.6,
  -3,
  0.3,
  1.35,
  -2.7,
  0.3,
  1.575,
  -2.65,
  0.3,
  0.9375,
  -2.5,
  0.3,
  1.125,
  -1.9,
  0.3,
  0.6,
  -2,
  0.3,
  0.9,
  1.7,
  0,
  1.425,
  1.7,
  -0.66,
  1.425,
  1.7,
  -0.66,
  0.6,
  1.7,
  0,
  0.6,
  2.6,
  0,
  1.425,
  2.6,
  -0.66,
  1.425,
  3.1,
  -0.66,
  0.825,
  3.1,
  0,
  0.825,
  2.3,
  0,
  2.1,
  2.3,
  -0.25,
  2.1,
  2.4,
  -0.25,
  2.025,
  2.4,
  0,
  2.025,
  2.7,
  0,
  2.4,
  2.7,
  -0.25,
  2.4,
  3.3,
  -0.25,
  2.4,
  3.3,
  0,
  2.4,
  1.7,
  0.66,
  0.6,
  1.7,
  0.66,
  1.425,
  3.1,
  0.66,
  0.825,
  2.6,
  0.66,
  1.425,
  2.4,
  0.25,
  2.025,
  2.3,
  0.25,
  2.1,
  3.3,
  0.25,
  2.4,
  2.7,
  0.25,
  2.4,
  2.8,
  0,
  2.475,
  2.8,
  -0.25,
  2.475,
  3.525,
  -0.25,
  2.49375,
  3.525,
  0,
  2.49375,
  2.9,
  0,
  2.475,
  2.9,
  -0.15,
  2.475,
  3.45,
  -0.15,
  2.5125,
  3.45,
  0,
  2.5125,
  2.8,
  0,
  2.4,
  2.8,
  -0.15,
  2.4,
  3.2,
  -0.15,
  2.4,
  3.2,
  0,
  2.4,
  3.525,
  0.25,
  2.49375,
  2.8,
  0.25,
  2.475,
  3.45,
  0.15,
  2.5125,
  2.9,
  0.15,
  2.475,
  3.2,
  0.15,
  2.4,
  2.8,
  0.15,
  2.4,
  0,
  0,
  3.15,
  0.8,
  0,
  3.15,
  0.8,
  -0.45,
  3.15,
  0.45,
  -0.8,
  3.15,
  0,
  -0.8,
  3.15,
  0,
  0,
  2.85,
  0.2,
  0,
  2.7,
  0.2,
  -0.112,
  2.7,
  0.112,
  -0.2,
  2.7,
  0,
  -0.2,
  2.7,
  -0.45,
  -0.8,
  3.15,
  -0.8,
  -0.45,
  3.15,
  -0.8,
  0,
  3.15,
  -0.112,
  -0.2,
  2.7,
  -0.2,
  -0.112,
  2.7,
  -0.2,
  0,
  2.7,
  -0.8,
  0.45,
  3.15,
  -0.45,
  0.8,
  3.15,
  0,
  0.8,
  3.15,
  -0.2,
  0.112,
  2.7,
  -0.112,
  0.2,
  2.7,
  0,
  0.2,
  2.7,
  0.45,
  0.8,
  3.15,
  0.8,
  0.45,
  3.15,
  0.112,
  0.2,
  2.7,
  0.2,
  0.112,
  2.7,
  0.4,
  0,
  2.55,
  0.4,
  -0.224,
  2.55,
  0.224,
  -0.4,
  2.55,
  0,
  -0.4,
  2.55,
  1.3,
  0,
  2.55,
  1.3,
  -0.728,
  2.55,
  0.728,
  -1.3,
  2.55,
  0,
  -1.3,
  2.55,
  1.3,
  0,
  2.4,
  1.3,
  -0.728,
  2.4,
  0.728,
  -1.3,
  2.4,
  0,
  -1.3,
  2.4,
  -0.224,
  -0.4,
  2.55,
  -0.4,
  -0.224,
  2.55,
  -0.4,
  0,
  2.55,
  -0.728,
  -1.3,
  2.55,
  -1.3,
  -0.728,
  2.55,
  -1.3,
  0,
  2.55,
  -0.728,
  -1.3,
  2.4,
  -1.3,
  -0.728,
  2.4,
  -1.3,
  0,
  2.4,
  -0.4,
  0.224,
  2.55,
  -0.224,
  0.4,
  2.55,
  0,
  0.4,
  2.55,
  -1.3,
  0.728,
  2.55,
  -0.728,
  1.3,
  2.55,
  0,
  1.3,
  2.55,
  -1.3,
  0.728,
  2.4,
  -0.728,
  1.3,
  2.4,
  0,
  1.3,
  2.4,
  0.224,
  0.4,
  2.55,
  0.4,
  0.224,
  2.55,
  0.728,
  1.3,
  2.55,
  1.3,
  0.728,
  2.55,
  0.728,
  1.3,
  2.4,
  1.3,
  0.728,
  2.4,
  0,
  0,
  0,
  1.425,
  0,
  0,
  1.425,
  0.798,
  0,
  0.798,
  1.425,
  0,
  0,
  1.425,
  0,
  1.5,
  0,
  0.075,
  1.5,
  0.84,
  0.075,
  0.84,
  1.5,
  0.075,
  0,
  1.5,
  0.075,
  -0.798,
  1.425,
  0,
  -1.425,
  0.798,
  0,
  -1.425,
  0,
  0,
  -0.84,
  1.5,
  0.075,
  -1.5,
  0.84,
  0.075,
  -1.5,
  0,
  0.075,
  -1.425,
  -0.798,
  0,
  -0.798,
  -1.425,
  0,
  0,
  -1.425,
  0,
  -1.5,
  -0.84,
  0.075,
  -0.84,
  -1.5,
  0.075,
  0,
  -1.5,
  0.075,
  0.798,
  -1.425,
  0,
  1.425,
  -0.798,
  0,
  0.84,
  -1.5,
  0.075,
  1.5,
  -0.84,
  0.075
]);
function basis(value) {
  const inverse = 1 - value;
  return [
    inverse * inverse * inverse,
    3 * value * inverse * inverse,
    3 * value * value * inverse,
    value * value * value
  ];
}
function derivativeBasis(value) {
  const inverse = 1 - value;
  return [
    -3 * inverse * inverse,
    3 * inverse * inverse - 6 * value * inverse,
    6 * value * inverse - 3 * value * value,
    3 * value * value
  ];
}
function evaluatePatch(surface, s, t, fitLid, blinn) {
  const sb = basis(s);
  const tb = basis(t);
  const dsb = derivativeBasis(s);
  const dtb = derivativeBasis(t);
  const point = [0, 0, 0];
  const ds = [0, 0, 0];
  const dt = [0, 0, 0];
  for (let row = 0; row < 4; row++) {
    for (let column = 0; column < 4; column++) {
      const control = PATCHES[surface * 16 + row * 4 + column] ?? 0;
      const source = control * 3;
      for (let axis = 0; axis < 3; axis++) {
        const lidScale = fitLid && surface >= 20 && surface < 28 && axis !== 2 ? 1.077 : 1;
        let value = (CONTROL_POINTS[source + axis] ?? 0) * lidScale;
        if (!blinn && axis === 2) value *= 1.3;
        const pointWeight = value * (sb[row] ?? 0) * (tb[column] ?? 0);
        const dsWeight = value * (dsb[row] ?? 0) * (tb[column] ?? 0);
        const dtWeight = value * (sb[row] ?? 0) * (dtb[column] ?? 0);
        point[axis] = (point[axis] ?? 0) + pointWeight;
        ds[axis] = (ds[axis] ?? 0) + dsWeight;
        dt[axis] = (dt[axis] ?? 0) + dtWeight;
      }
    }
  }
  return { point, ds, dt };
}
function cross3(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function normalize(value) {
  const length = Math.hypot(value[0], value[1], value[2]);
  return length > 0 ? [value[0] / length, value[1] / length, value[2] / length] : [0, 1, 0];
}
function createTeapotGeometry(size = 0.8, segments = 18, bottom = true, lid = true, body = true, fitLid = true, blinn = true) {
  if (!Number.isFinite(size) || size <= 0 || !Number.isFinite(segments) || segments < 2) {
    return err(
      new AssetError({
        code: "asset-parse-failed",
        expected: "finite positive size and segments >= 2",
        hint: ASSET_ERROR_HINTS["asset-parse-failed"],
        detail: { field: "parameters", value: size, reason: `segments=${segments}` }
      })
    );
  }
  const steps = Math.max(2, Math.floor(segments));
  const maxHeight = 3.15 * (blinn ? 1 : 1.3);
  const maxHeight2 = maxHeight / 2;
  const trueSize = size / maxHeight2;
  const firstSurface = body ? 0 : 20;
  const lastSurface = bottom ? 32 : 28;
  const activeSurfaces = [];
  for (let surface = firstSurface; surface < lastSurface; surface++) {
    if (lid || surface < 20 || surface >= 28) activeSurfaces.push(surface);
  }
  const vertices = new Float32Array(
    activeSurfaces.length * (steps + 1) * (steps + 1) * FACTORY_FLOATS_PER_VERTEX
  );
  const indices = [];
  const stride = steps + 1;
  let vertex = 0;
  const positions = [];
  for (const surface of activeSurfaces) {
    const surfaceStart = vertex;
    for (let sStep = 0; sStep <= steps; sStep++) {
      const s = sStep / steps;
      for (let tStep = 0; tStep <= steps; tStep++) {
        const t = tStep / steps;
        const evaluated = evaluatePatch(surface, s, t, fitLid, blinn);
        const normalRaw = cross3(evaluated.dt, evaluated.ds);
        const normal = evaluated.point[0] === 0 && evaluated.point[1] === 0 ? [0, evaluated.point[2] > maxHeight2 ? 1 : -1, 0] : normalize([normalRaw[0], normalRaw[2], -normalRaw[1]]);
        const position = [
          Math.fround(trueSize * evaluated.point[0]),
          Math.fround(trueSize * (evaluated.point[2] - maxHeight2)),
          Math.fround(-trueSize * evaluated.point[1])
        ];
        const base = vertex * FACTORY_FLOATS_PER_VERTEX;
        vertices[base] = position[0];
        vertices[base + 1] = position[1];
        vertices[base + 2] = position[2];
        vertices[base + 3] = normal[0];
        vertices[base + 4] = normal[1];
        vertices[base + 5] = normal[2];
        vertices[base + 6] = 1 - t;
        vertices[base + 7] = 1 - s;
        positions.push(position);
        vertex++;
      }
    }
    for (let sStep = 0; sStep < steps; sStep++) {
      for (let tStep = 0; tStep < steps; tStep++) {
        const v1 = surfaceStart + sStep * stride + tStep;
        const v2 = v1 + 1;
        const v3 = v2 + stride;
        const v4 = v1 + stride;
        const same = (a, b) => positions[a]?.[0] === positions[b]?.[0] && positions[a]?.[1] === positions[b]?.[1] && positions[a]?.[2] === positions[b]?.[2];
        if (!same(v1, v2) && !same(v1, v3) && !same(v2, v3)) indices.push(v1, v2, v3);
        if (!same(v1, v3) && !same(v1, v4) && !same(v3, v4)) indices.push(v1, v3, v4);
      }
    }
  }
  const mesh = meshFromInterleaved(vertices, new Uint32Array(indices));
  if (!mesh.ok) return mesh;
  return ok({
    ...mesh.value,
    provenance: {
      source: "three.js",
      commit: "ad005397bbd15b0a9fcd5159c782eba56e1cba2a",
      path: "examples/jsm/geometries/TeapotGeometry.js",
      license: "MIT"
    }
  });
}
function createTorusGeometry(radius, tube, radialSegments = 8, tubularSegments = 24) {
  if (radius <= 0) return err(degenerate(`radius=${radius}`));
  if (tube <= 0) return err(degenerate(`tube=${tube}`));
  const rs = radialSegments | 0;
  const ts = tubularSegments | 0;
  if (rs < 3) return err(degenerate(`radialSegments=${rs}; minimum 3`));
  if (ts < 3) return err(degenerate(`tubularSegments=${ts}; minimum 3`));
  const vertexCount = (rs + 1) * (ts + 1);
  const indexCount = rs * ts * 6;
  const vertices = new Float32Array(vertexCount * FACTORY_FLOATS_PER_VERTEX);
  const indices = new Uint32Array(indexCount);
  let vIdx = 0;
  for (let j = 0; j <= rs; j++) {
    const v = j / rs * Math.PI * 2;
    const cosV = Math.cos(v);
    const sinV = Math.sin(v);
    for (let i = 0; i <= ts; i++) {
      const u = i / ts * Math.PI * 2;
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);
      const x = (radius + tube * cosV) * cosU;
      const y = (radius + tube * cosV) * sinU;
      const z = tube * sinV;
      const centerX = radius * cosU;
      const centerY = radius * sinU;
      const nx = x - centerX;
      const ny = y - centerY;
      const nz = z;
      const nlen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      const base = vIdx * FACTORY_FLOATS_PER_VERTEX;
      vertices[base + 0] = x;
      vertices[base + 1] = y;
      vertices[base + 2] = z;
      vertices[base + 3] = nx / nlen;
      vertices[base + 4] = ny / nlen;
      vertices[base + 5] = nz / nlen;
      vertices[base + 6] = i / ts;
      vertices[base + 7] = j / rs;
      vIdx++;
    }
  }
  let iIdx = 0;
  for (let j = 1; j <= rs; j++) {
    for (let i = 1; i <= ts; i++) {
      const a = (ts + 1) * j + i - 1;
      const b = (ts + 1) * (j - 1) + i - 1;
      const c = (ts + 1) * (j - 1) + i;
      const d = (ts + 1) * j + i;
      indices[iIdx++] = a;
      indices[iIdx++] = b;
      indices[iIdx++] = d;
      indices[iIdx++] = b;
      indices[iIdx++] = c;
      indices[iIdx++] = d;
    }
  }
  return meshFromInterleaved(vertices, indices);
}

export { DEFAULT_VERTEX_ATTRIBUTE_MAP, PROCEDURAL_FLOATS_PER_VERTEX, SKIN_VERTEX_ATTRIBUTE_MAP, VertexAttributePackError, buildMeshAttributeMapForUvSets, compute2dBounds, computeTangentVec4, create2dGeometry, create2dRingGeometry, createBoxGeometry, createCapsuleGeometry, createConeGeometry, createCylinderGeometry, createEdgesGeometry, createExtrusionGeometry, createMeshBuilder, createPlaneGeometry, createPrimitiveMesh, createProceduralMesh, createRevolutionGeometry, createSphereGeometry, createSweepGeometry, createTeapotGeometry, createTorusGeometry, createWireframeGeometry, decodeMeshBinary, deriveVertexBufferLayout, deriveVertexBufferLayoutFromProjection, deriveVertexCount, deriveVertexLayoutProjection, deriveVertexLayoutProjectionFromMask, meshAssetContribution, meshAssetDecoder, meshAssetKind, meshFromInterleaved, normalizeMeshPayload, packInterleavedVertexAttributes };
