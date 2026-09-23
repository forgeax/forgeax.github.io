// src/assets/skin-decoder.ts
import {
  err,
  ok
} from "../../types/dist/index.mjs";
function floatArray(value) {
  if (value instanceof Float32Array) return value;
  if (Array.isArray(value) && value.every((item) => typeof item === "number")) {
    return Float32Array.from(value);
  }
  return void 0;
}
var skinContribution = {
  kind: { kind: "skin" },
  consumer: "resolveSkinJoints",
  decoder: {
    async decode({ envelope }) {
      const payload = envelope.payload;
      if (payload.kind === "skin" && payload.skeletonGuid.length > 0 && payload.jointPaths.length > 0) {
        return ok(payload);
      }
      return err({
        code: "asset-package-invalid",
        expected: "a skin payload with a skeleton GUID and joint paths",
        hint: "recook the skin binding and publish its skeleton reference",
        detail: { guid: envelope.guid, reason: "skin owner validation failed" }
      });
    }
  }
};
var skeletonContribution = {
  kind: { kind: "skeleton" },
  consumer: "resolveSkinJoints",
  decoder: {
    async decode({ envelope }) {
      const payload = envelope.payload;
      if (payload !== null && typeof payload === "object") {
        const source = payload;
        const inverseBindMatrices = floatArray(source.inverseBindMatrices);
        const bounds = floatArray(source.bounds);
        const jointCount = source.jointCount;
        if (source.kind === "skeleton" && inverseBindMatrices !== void 0 && Number.isSafeInteger(jointCount) && jointCount >= 0 && inverseBindMatrices.length === jointCount * 16 && (bounds === void 0 || bounds.length === 6)) {
          return ok({
            kind: "skeleton",
            inverseBindMatrices,
            jointCount,
            ...bounds === void 0 ? {} : { bounds }
          });
        }
      }
      return err({
        code: "asset-package-invalid",
        expected: "a skeleton payload with one inverse-bind matrix per joint",
        hint: "recook the skeleton and publish its complete joint data",
        detail: { guid: envelope.guid, reason: "skeleton owner validation failed" }
      });
    }
  }
};

// src/errors.ts
var SkinJointCountExceededError = class extends Error {
  code = "skin-joint-count-exceeded";
  expected;
  hint;
  detail;
  constructor(jointCount, max = 256) {
    const expected = `jointCount <= ${max}`;
    const hint = `skin has ${jointCount} joints (max ${max}); reduce joint count in the source glTF asset (OOS-skin-many-joints)`;
    super(`skin joint count ${jointCount} exceeds max ${max}`);
    this.name = "SkinJointCountExceededError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { jointCount, max };
  }
};
var SkinJointDespawnedError = class extends Error {
  code = "skin-joint-despawned";
  expected;
  hint;
  detail;
  constructor(meshEntity, jointIndex) {
    const expected = `Skin.joints[${jointIndex}] references a live entity`;
    const hint = `joint[${jointIndex}] of entity ${meshEntity} has been despawned; remove Skin component or re-spawn the joint entity (OOS-skin-joint-respawn)`;
    super(`skin joint[${jointIndex}] despawned for entity ${meshEntity}`);
    this.name = "SkinJointDespawnedError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { meshEntity, jointIndex };
  }
};
var SkinJointPathUnresolvedError = class extends Error {
  code = "skin-joint-path-unresolved";
  expected;
  hint;
  detail;
  constructor(skinEntity, path, failedAtIndex) {
    const leafName = path[failedAtIndex] ?? "<unknown>";
    const expected = `joint entity with Name="${leafName}" exists in the world`;
    const hint = `joint path "${path.join("/")}" for skin entity ${skinEntity} could not be resolved; verify glTF node names are preserved`;
    super(
      `joint path "${path.join("/")}" unresolved at index ${failedAtIndex} for entity ${skinEntity}`
    );
    this.name = "SkinJointPathUnresolvedError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { skinEntity, path, failedAtIndex };
  }
};
var SkinInstancesCoexistForbiddenError = class extends Error {
  code = "skin-instances-coexist-forbidden";
  expected;
  hint;
  detail;
  constructor(entity) {
    const expected = "Skin and Instances must not coexist on the same entity";
    const hint = `entity ${entity} has both Skin and Instances; split skinned meshes from instanced meshes into separate entities (OOS-skin-instances-coexist)`;
    super(`Skin + Instances coexistence forbidden on entity ${entity}`);
    this.name = "SkinInstancesCoexistForbiddenError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { entity };
  }
};
var SkeletonResolveFailedError = class extends Error {
  code = "skeleton-resolve-failed";
  expected;
  hint;
  detail;
  constructor(entity, skeletonHandle) {
    const expected = `Skin.skeleton handle ${skeletonHandle} resolves to a registered SkeletonAsset`;
    const hint = `entity ${entity} Skin.skeleton handle ${skeletonHandle} is not registered; check that the SkeletonAsset went through the gltf importer into pack-index AND that AssetRegistry.register was called for the handle before extractFrame runs`;
    super(`Skin skeleton resolve failed on entity ${entity}: handle ${skeletonHandle}`);
    this.name = "SkeletonResolveFailedError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { entity, skeletonHandle };
  }
};
var JointCountMismatchError = class extends Error {
  code = "joint-count-mismatch";
  expected;
  hint;
  detail;
  constructor(entity, expected, actual) {
    const expectedStr = `Skin.joints.length === SkeletonAsset.jointCount (=${expected})`;
    const hint = `entity ${entity}: Skin.joints.length=${actual} disagrees with SkeletonAsset.jointCount=${expected}; verify SkinAsset.joints[] and SkeletonAsset jointPaths[] come from the same glTF skin node`;
    super(
      `joint count mismatch on entity ${entity}: SkeletonAsset.jointCount=${expected}, Skin.joints.length=${actual}`
    );
    this.name = "JointCountMismatchError";
    this.expected = expectedStr;
    this.hint = hint;
    this.detail = { entity, expected, actual };
  }
};
var JointEntityDanglingError = class extends Error {
  code = "joint-entity-dangling";
  expected;
  hint;
  detail;
  constructor(entity, jointIndex) {
    const expected = `Skin.joints[${jointIndex}] references a live Entity with Transform`;
    const hint = `entity ${entity} Skin.joints[${jointIndex}] points at a despawned (or Transform-less) Entity; sync Skin.joints[] when joint entities are despawned, or re-import the scene through the gltf importer to refresh Entity references`;
    super(`joint entity dangling on entity ${entity} at jointIndex ${jointIndex}`);
    this.name = "JointEntityDanglingError";
    this.expected = expected;
    this.hint = hint;
    this.detail = { entity, jointIndex };
  }
};

// src/skin.ts
import { defineComponent } from "../../ecs/dist/index.mjs";
var Skin = defineComponent("Skin", {
  // The renderer owns the live skeleton asset/palette binding; joint entity
  // relationships remain the portable simulation-side pose contract.
  skeleton: { type: "shared<SkeletonAsset>" },
  joints: { type: "array<entity>" }
});

// src/plugin.ts
var SKINNING_COMPONENTS = [Skin];
function registerSkinningComponents(world) {
  const leases = SKINNING_COMPONENTS.map(
    (component) => world.components.register(component).unwrap()
  );
  return () => {
    for (let index = leases.length - 1; index >= 0; index -= 1) leases[index]?.dispose();
  };
}
function skinningPlugin() {
  return {
    name: "skinning",
    inject: ["world"],
    apply(ctx) {
      ctx.effect(() => registerSkinningComponents(ctx.world), "skinning/components");
    }
  };
}

// src/resolve-skin-joints.ts
function resolveSkinJoints(jointPaths, names, skinEntity) {
  const joints = [];
  for (const path of jointPaths) {
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) continue;
    const failedAtIndex = segments.length - 1;
    const entity = names.get(segments[failedAtIndex] ?? "");
    if (entity === void 0) {
      return {
        ok: false,
        error: new SkinJointPathUnresolvedError(skinEntity, segments, failedAtIndex)
      };
    }
    joints.push(entity);
  }
  return { ok: true, value: new Uint32Array(joints) };
}
export {
  JointCountMismatchError,
  JointEntityDanglingError,
  SkeletonResolveFailedError,
  Skin,
  SkinInstancesCoexistForbiddenError,
  SkinJointCountExceededError,
  SkinJointDespawnedError,
  SkinJointPathUnresolvedError,
  resolveSkinJoints,
  skeletonContribution,
  skinContribution,
  skinningPlugin
};
