import { deriveVertexLayoutProjection } from '../../geometry/dist/index.mjs';
import { AssetGuid } from '../../pack/dist/guid.mjs';
import { MESH_BIN_HEADER_V4_BYTES, writeMeshBinHeader } from '../../pack/dist/mesh-bin-contract.mjs';
import { err, ok } from '../../types/dist/index.mjs';

// src/mesh-bin.ts
function failure(sourceKey, expected, actual) {
  return {
    code: "mesh-bin-payload-invalid",
    subject: "mesh-bin",
    sourceKey,
    expected,
    actual,
    recovery: "re-cook the source with its Meta sidecar through the build-time importer"
  };
}
function asAttributeMap(value) {
  return value ?? {};
}
function jsonValue(value) {
  if (value instanceof Float32Array || value instanceof Uint16Array) return Array.from(value);
  if (Array.isArray(value)) return value.map(jsonValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, jsonValue(nested)])
    );
  }
  return value;
}
function refsMeta(payload, refs) {
  const materialSlots = (payload.materialSlots ?? [{ slotName: "Default" }]).map(
    (slot, slotIndex) => {
      const defaultMaterial = slot.defaultMaterial;
      let defaultMaterialRef;
      if (defaultMaterial !== void 0) {
        const guid = AssetGuid.format(defaultMaterial);
        defaultMaterialRef = refs.findIndex((candidate) => candidate.toLowerCase() === guid);
        if (defaultMaterialRef < 0) {
          throw new Error(
            `material slot ${slotIndex} default material ${guid} is absent from refs`
          );
        }
      }
      return {
        slotName: slot.slotName,
        ...slot.sourceKey === void 0 ? {} : { sourceKey: slot.sourceKey },
        ...defaultMaterialRef === void 0 ? {} : { defaultMaterialRef }
      };
    }
  );
  if (payload.lods !== void 0 && payload.lods.length > 7) {
    throw new Error("MeshAsset LOD chain supports at most seven lower-detail levels");
  }
  let previousCoverage = 1;
  const seenLodGuids = /* @__PURE__ */ new Set();
  const lods = payload.lods?.map((lod, lodIndex) => {
    const guid = AssetGuid.format(lod.mesh).toLowerCase();
    const meshRef = refs.findIndex((candidate) => candidate.toLowerCase() === guid);
    if (meshRef < 0) {
      throw new Error(`LOD ${lodIndex} mesh ${guid} is absent from refs`);
    }
    if (seenLodGuids.has(guid)) {
      throw new Error(`LOD ${lodIndex} mesh ${guid} is duplicated`);
    }
    if (!Number.isFinite(lod.screenCoverage) || lod.screenCoverage <= 0 || lod.screenCoverage > 1 || lod.screenCoverage >= previousCoverage) {
      throw new Error(
        `LOD ${lodIndex} screenCoverage must be finite, in (0, 1], and strictly decreasing`
      );
    }
    seenLodGuids.add(guid);
    previousCoverage = lod.screenCoverage;
    return { meshRef, screenCoverage: lod.screenCoverage };
  });
  if (payload.lodHysteresis !== void 0 && (!Number.isFinite(payload.lodHysteresis) || payload.lodHysteresis < 0 || payload.lodHysteresis >= 1)) {
    throw new Error("lodHysteresis must be finite and in [0, 1)");
  }
  return {
    submeshes: payload.submeshes === void 0 || payload.submeshes.length === 0 ? [{ indexOffset: 0, indexCount: payload.indices?.length ?? 0, materialSlot: 0 }] : payload.submeshes,
    materialSlots,
    ...payload.aabb === void 0 ? {} : { aabb: jsonValue(payload.aabb) },
    ...payload.morphTargets === void 0 ? {} : { morphTargets: jsonValue(payload.morphTargets) },
    ...payload.morphWeights === void 0 ? {} : { morphWeights: jsonValue(payload.morphWeights) },
    ...lods === void 0 ? {} : { lods },
    ...payload.lodHysteresis === void 0 ? {} : { lodHysteresis: payload.lodHysteresis }
  };
}
function packMeshBinV4(payload, sourceKey, refs = []) {
  try {
    const vertices = payload.vertices;
    const indices = payload.indices;
    if (!(vertices instanceof Float32Array)) {
      return err(
        failure(sourceKey, "Float32Array interleaved vertices", "vertices is not Float32Array")
      );
    }
    if (indices !== void 0 && !(indices instanceof Uint16Array || indices instanceof Uint32Array)) {
      return err(
        failure(sourceKey, "Uint16Array or Uint32Array indices", "indices has an unsupported type")
      );
    }
    const attributes = asAttributeMap(payload.attributes);
    const projection = deriveVertexLayoutProjection(attributes);
    if (projection.attributes.length === 0 || projection.arrayStride === 0) {
      return err(
        failure(
          sourceKey,
          "a non-empty canonical geometry projection",
          "projection has no attributes"
        )
      );
    }
    const vertexCount = payload.vertexCount ?? vertices.byteLength / projection.arrayStride;
    if (!Number.isSafeInteger(vertexCount) || vertexCount < 0) {
      return err(
        failure(sourceKey, "a non-negative safe vertex cardinality", `vertexCount=${vertexCount}`)
      );
    }
    if (vertices.byteLength !== vertexCount * projection.arrayStride) {
      return err(
        failure(
          sourceKey,
          `vertices.byteLength=${vertexCount * projection.arrayStride}`,
          `vertices.byteLength=${vertices.byteLength}; stride=${projection.arrayStride}`
        )
      );
    }
    for (const attribute of projection.attributes) {
      const value = attributes[attribute.key];
      const components = attribute.byteLength / (attribute.format === "uint16x4" ? 2 : 4);
      if (value === void 0 || !(value instanceof Float32Array) && !(value instanceof Uint16Array) || value.length !== vertexCount * components) {
        return err(
          failure(
            sourceKey,
            `${attribute.key} cardinality=${vertexCount * components}`,
            `${attribute.key} cardinality=${value?.byteLength ?? "missing"}`
          )
        );
      }
    }
    const interleaved = new Uint8Array(vertexCount * projection.arrayStride);
    const interleavedView = new DataView(interleaved.buffer);
    for (const attribute of projection.attributes) {
      const value = attributes[attribute.key];
      if (value === void 0) continue;
      const components = attribute.byteLength / (attribute.format === "uint16x4" ? 2 : 4);
      for (let vertex = 0; vertex < vertexCount; vertex++) {
        for (let component = 0; component < components; component++) {
          const sourceIndex = vertex * components + component;
          const targetOffset = vertex * projection.arrayStride + attribute.offset + component * (attribute.format === "uint16x4" ? 2 : 4);
          if (attribute.format === "uint16x4") {
            interleavedView.setUint16(targetOffset, value[sourceIndex] ?? 0, true);
          } else {
            interleavedView.setFloat32(
              targetOffset,
              value[sourceIndex] ?? 0,
              true
            );
          }
        }
      }
    }
    const indexCount = indices?.length ?? 0;
    const indexWidth = indices === void 0 || indexCount === 0 ? 0 : indices.BYTES_PER_ELEMENT;
    const indexBytes = indexCount * indexWidth;
    if (!Number.isSafeInteger(indexBytes) || indexBytes > 4294967295) {
      return err(failure(sourceKey, "safe index payload byte length", `indexBytes=${indexBytes}`));
    }
    const meta = new TextEncoder().encode(JSON.stringify(refsMeta(payload, refs)));
    const header = {
      version: 4,
      projectionVersion: projection.schemaVersion,
      mask: projection.mask,
      digest: projection.digest,
      stride: projection.arrayStride,
      vertexCount,
      vertexBytes: interleaved.byteLength,
      indexCount,
      indexWidth,
      indexBytes,
      jsonBytes: meta.byteLength
    };
    const total = MESH_BIN_HEADER_V4_BYTES + interleaved.byteLength + indexBytes + meta.byteLength;
    if (!Number.isSafeInteger(total) || total > 4294967295) {
      return err(failure(sourceKey, "safe mesh binary byte length", `total=${total}`));
    }
    const out = new Uint8Array(total);
    writeMeshBinHeader(header, out);
    let offset = MESH_BIN_HEADER_V4_BYTES;
    out.set(interleaved, offset);
    offset += interleaved.byteLength;
    if (indices !== void 0 && indexBytes > 0) {
      out.set(new Uint8Array(indices.buffer, indices.byteOffset, indices.byteLength), offset);
      offset += indexBytes;
    }
    out.set(meta, offset);
    return ok(out);
  } catch (error) {
    return err(
      failure(
        sourceKey,
        "valid canonical mesh payload",
        error instanceof Error ? error.message : String(error)
      )
    );
  }
}

export { packMeshBinV4 };
