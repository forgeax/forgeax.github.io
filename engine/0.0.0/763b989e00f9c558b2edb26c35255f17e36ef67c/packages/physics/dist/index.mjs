import { defineComponent, defineSystemSet } from '../../ecs/dist/index.mjs';
import { err, ok, PhysicsError } from '../../types/dist/index.mjs';
export { PHYSICS_ERROR_HINTS, PhysicsError } from '../../types/dist/index.mjs';

// src/collision-event.ts
var CollisionEvent = "__CollisionEvent__";
var RIGID_BODY_TYPE_STATIC = 0;
var RIGID_BODY_TYPE_DYNAMIC = 1;
var RIGID_BODY_TYPE_KINEMATIC = 2;
var RigidBodyTypeValue = {
  static: RIGID_BODY_TYPE_STATIC,
  dynamic: RIGID_BODY_TYPE_DYNAMIC,
  kinematic: RIGID_BODY_TYPE_KINEMATIC
};
function rigidBodyTypeFromF32(n) {
  if (n === RIGID_BODY_TYPE_DYNAMIC) return "dynamic";
  if (n === RIGID_BODY_TYPE_KINEMATIC) return "kinematic";
  return "static";
}
var COLLIDER_SHAPE_CUBOID = 0;
var COLLIDER_SHAPE_SPHERE = 1;
var COLLIDER_SHAPE_CAPSULE = 2;
var ColliderShapeValue = {
  cuboid: COLLIDER_SHAPE_CUBOID,
  sphere: COLLIDER_SHAPE_SPHERE,
  capsule: COLLIDER_SHAPE_CAPSULE
};
function colliderShapeFromF32(n) {
  if (n === COLLIDER_SHAPE_SPHERE) return "sphere";
  if (n === COLLIDER_SHAPE_CAPSULE) return "capsule";
  return "cuboid";
}
var RigidBody = defineComponent("RigidBody", {
  type: { type: "enum", default: RIGID_BODY_TYPE_DYNAMIC, labels: RigidBodyTypeValue },
  mass: { type: "f32", default: 1 },
  linearDamping: { type: "f32", default: 0 },
  angularDamping: { type: "f32", default: 0 },
  gravityScale: { type: "f32", default: 1 },
  ccdEnabled: { type: "bool", default: false }
});
var Collider = defineComponent("Collider", {
  shape: { type: "enum", default: COLLIDER_SHAPE_CUBOID, labels: ColliderShapeValue },
  // feat-20260709 M4: cuboid half-extents collapsed from 3 per-axis scalar
  // columns into one inline array<f32,3> column. Explicit layer-2 default
  // (the array layer-3 fallback is all-zero, which would give a degenerate
  // zero-size box). radius/halfHeight stay scalar (OOS-1: independent
  // sphere/capsule params, not part of the cuboid vec).
  halfExtents: { type: "array<f32, 3>", default: new Float32Array([0.5, 0.5, 0.5]) },
  radius: { type: "f32", default: 0.5 },
  halfHeight: { type: "f32", default: 0.5 },
  friction: { type: "f32", default: 0.5 },
  restitution: { type: "f32", default: 0 },
  density: { type: "f32", default: 1 },
  isSensor: { type: "bool", default: false },
  collisionGroups: { type: "u32", default: 131071 },
  solverGroups: { type: "u32", default: 4294967295 }
});
var CharacterController = defineComponent("CharacterController", {
  offset: { type: "f32", default: 0.01 },
  maxSlopeClimbDeg: { type: "f32", default: 45 },
  minSlopeSlideDeg: { type: "f32", default: 30 },
  autoStepMaxHeight: { type: "f32", default: 0.3 },
  autoStepMinWidth: { type: "f32", default: 0.2 },
  snapToGroundDist: { type: "f32", default: 0.2 },
  grounded: { type: "bool", default: false, transient: true }
});
var CollidingEntities = defineComponent(
  "CollidingEntities",
  {
    entities: { type: "array<entity>" }
  },
  { transient: true }
);
var PHYSICS_COMPONENTS = [
  CharacterController,
  Collider,
  CollidingEntities,
  RigidBody
];
function registerPhysicsComponents(world) {
  const leases = PHYSICS_COMPONENTS.map(
    (component) => world.components.register(component).unwrap()
  );
  return () => {
    for (let index = leases.length - 1; index >= 0; index -= 1) leases[index]?.dispose();
  };
}
var DERIVED_PHYSICS_LIMITS = Object.freeze({
  maxCandidates: 32,
  maxShapesPerCandidate: 64,
  maxConstraintsPerCandidate: 64,
  maxCellsPerCandidate: 262144,
  maxCandidateBytes: 8 * 1024 * 1024
});
var DerivedPhysicsError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(code, expected, hint, detail = {}) {
    super(`${code}: ${expected}`);
    this.name = "DerivedPhysicsError";
    this.code = code;
    this.expected = expected;
    this.hint = hint;
    this.detail = Object.freeze({ code, ...detail });
  }
};
var ID_RE = /\S/;
function finite(value) {
  return Number.isFinite(value);
}
function vectorFinite(vector, length) {
  return vector.length === length && vector.every(finite);
}
function rotateVectorByQuaternion(vector, rotation) {
  const [x, y, z] = vector;
  const [qx, qy, qz, qw] = rotation;
  const tx = 2 * (qy * z - qz * y);
  const ty = 2 * (qz * x - qx * z);
  const tz = 2 * (qx * y - qy * x);
  return [
    x + qw * tx + qy * tz - qz * ty,
    y + qw * ty + qz * tx - qx * tz,
    z + qw * tz + qx * ty - qy * tx
  ];
}
function normalizedQuaternion(rotation) {
  if (!vectorFinite(rotation, 4)) return void 0;
  const length = Math.hypot(rotation[0], rotation[1], rotation[2], rotation[3]);
  if (!finite(length) || length < 1e-6) return void 0;
  return [rotation[0] / length, rotation[1] / length, rotation[2] / length, rotation[3] / length];
}
function copyCells(cells) {
  if (cells instanceof Int32Array) return new Int32Array(cells);
  const result = new Int32Array(cells.length * 3);
  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index];
    if (cell === void 0 || cell.length !== 3 || cell.some((value) => !Number.isInteger(value))) {
      return void 0;
    }
    result[index * 3] = cell[0] ?? 0;
    result[index * 3 + 1] = cell[1] ?? 0;
    result[index * 3 + 2] = cell[2] ?? 0;
  }
  return result;
}
function normalizeVoxelShapeInput(input) {
  if (typeof input.id !== "string" || !ID_RE.test(input.id)) {
    return err(
      new DerivedPhysicsError(
        "derived-shape-invalid",
        "voxel shape id is a non-empty stable string",
        "provide a stable shape identity from the consumer state",
        { shapeId: input.id }
      )
    );
  }
  if (!Number.isInteger(input.revision) || input.revision < 0) {
    return err(
      new DerivedPhysicsError(
        "derived-shape-invalid",
        "voxel shape revision is a non-negative integer",
        "increment the shape revision when its cells or transform changes",
        { shapeId: input.id, actual: input.revision }
      )
    );
  }
  const cells = copyCells(input.cells);
  if (cells === void 0 || cells.length === 0 || cells.length % 3 !== 0) {
    return err(
      new DerivedPhysicsError(
        "derived-shape-invalid",
        "voxel cells contain at least one complete integer x/y/z triple",
        "supply a non-empty Int32Array or cell tuple list",
        { shapeId: input.id, actual: cells?.length }
      )
    );
  }
  const voxelSize = input.voxelSize;
  if (!vectorFinite(voxelSize, 3) || voxelSize.some((value) => value <= 0)) {
    return err(
      new DerivedPhysicsError(
        "derived-shape-invalid",
        "voxelSize contains finite positive components",
        "choose a finite positive voxel size for every axis",
        { shapeId: input.id, actual: voxelSize }
      )
    );
  }
  for (const value of cells) {
    if (!Number.isInteger(value)) {
      return err(
        new DerivedPhysicsError(
          "derived-shape-invalid",
          "voxel coordinates are integers",
          "quantize cells before submitting a physics candidate",
          { shapeId: input.id, actual: value }
        )
      );
    }
  }
  const origin = input.origin ?? [0, 0, 0];
  if (!vectorFinite(origin, 3)) {
    return err(
      new DerivedPhysicsError(
        "derived-shape-invalid",
        "voxel origin contains finite coordinates",
        "supply a finite local origin",
        { shapeId: input.id, actual: origin }
      )
    );
  }
  const rotation = normalizedQuaternion(input.rotation ?? [0, 0, 0, 1]);
  if (rotation === void 0) {
    return err(
      new DerivedPhysicsError(
        "derived-shape-invalid",
        "voxel rotation is a finite non-degenerate quaternion",
        "normalize the local voxel orientation before submitting it",
        { shapeId: input.id, actual: input.rotation }
      )
    );
  }
  for (const [name, value] of [
    ["friction", input.friction],
    ["restitution", input.restitution],
    ["density", input.density]
  ]) {
    if (value !== void 0 && (!finite(value) || value < 0)) {
      return err(
        new DerivedPhysicsError(
          "derived-shape-invalid",
          `${name} is finite and non-negative`,
          `repair the ${name} input before native preparation`,
          { shapeId: input.id, actual: value }
        )
      );
    }
  }
  return ok(
    Object.freeze({
      ...input,
      cells,
      voxelSize: [voxelSize[0], voxelSize[1], voxelSize[2]],
      origin: [origin[0], origin[1], origin[2]],
      rotation
    })
  );
}
function validateMassProperties(properties) {
  if (properties === void 0 || properties.mode === "automatic") {
    if (properties?.density !== void 0 && (!finite(properties.density) || properties.density <= 0)) {
      return err(
        new DerivedPhysicsError(
          "derived-mass-invalid",
          "automatic density is finite and positive",
          "omit density to use backend density or provide a positive density",
          { actual: properties.density }
        )
      );
    }
    return ok(properties);
  }
  if (!finite(properties.mass) || properties.mass <= 0 || !vectorFinite(properties.centerOfMass, 3) || !vectorFinite(properties.principalInertia, 3) || properties.principalInertia.some((value) => !finite(value) || value <= 0)) {
    return err(
      new DerivedPhysicsError(
        "derived-mass-invalid",
        "explicit mass, center of mass, and principal inertia are finite and non-degenerate",
        "provide positive mass/inertia and a finite center of mass",
        { actual: properties }
      )
    );
  }
  const frame = normalizedQuaternion(properties.principalInertiaLocalFrame ?? [0, 0, 0, 1]);
  if (frame === void 0) {
    return err(
      new DerivedPhysicsError(
        "derived-mass-invalid",
        "principal inertia local frame is a finite non-degenerate quaternion",
        "normalize the inertia frame before submitting it",
        { actual: properties.principalInertiaLocalFrame }
      )
    );
  }
  return ok(
    Object.freeze({
      ...properties,
      centerOfMass: [...properties.centerOfMass],
      principalInertia: [...properties.principalInertia],
      principalInertiaLocalFrame: frame
    })
  );
}
function preserveCenterOfMassVelocity(linearVelocity, angularVelocity, previousWorldCom, nextWorldCom) {
  const dx = nextWorldCom[0] - previousWorldCom[0];
  const dy = nextWorldCom[1] - previousWorldCom[1];
  const dz = nextWorldCom[2] - previousWorldCom[2];
  return [
    linearVelocity[0] + angularVelocity[1] * dz - angularVelocity[2] * dy,
    linearVelocity[1] + angularVelocity[2] * dx - angularVelocity[0] * dz,
    linearVelocity[2] + angularVelocity[0] * dy - angularVelocity[1] * dx
  ];
}
function cloneDerivedPhysicsInput(input) {
  if (!Number.isInteger(input.entity) || input.entity < 0) {
    return err(
      new DerivedPhysicsError(
        "derived-candidate-invalid",
        "candidate entity is a non-negative ECS entity value",
        "submit a live entity from the same World",
        { entity: input.entity }
      )
    );
  }
  if (!Number.isInteger(input.revision) || input.revision < 0) {
    return err(
      new DerivedPhysicsError(
        "derived-candidate-invalid",
        "candidate revision is a non-negative integer",
        "advance the consumer topology revision monotonically",
        { entity: input.entity, actual: input.revision }
      )
    );
  }
  if (typeof input.sourceKey !== "string" || !ID_RE.test(input.sourceKey)) {
    return err(
      new DerivedPhysicsError(
        "derived-candidate-invalid",
        "candidate sourceKey is a non-empty stable producer identity",
        "carry the producer sourceKey with every derived body revision",
        { entity: input.entity, actual: input.sourceKey }
      )
    );
  }
  if (input.shapes.length > DERIVED_PHYSICS_LIMITS.maxShapesPerCandidate) {
    return err(
      new DerivedPhysicsError(
        "derived-candidate-budget-exceeded",
        `one candidate contains at most ${DERIVED_PHYSICS_LIMITS.maxShapesPerCandidate} derived shapes`,
        "split the consumer operation at a body boundary and retry",
        { entity: input.entity, actual: input.shapes.length }
      )
    );
  }
  const seen = /* @__PURE__ */ new Set();
  const shapes = [];
  for (const shape of input.shapes) {
    if (seen.has(shape.id)) {
      return err(
        new DerivedPhysicsError(
          "derived-shape-duplicate",
          "one candidate has one identity per derived shape",
          "merge or rename duplicate shape inputs before preparation",
          { entity: input.entity, shapeId: shape.id }
        )
      );
    }
    seen.add(shape.id);
    const normalized = normalizeVoxelShapeInput(shape);
    if (!normalized.ok) return normalized;
    shapes.push(normalized.value);
  }
  const motionRotation = input.motion?.rotation === void 0 ? void 0 : normalizedQuaternion(input.motion.rotation);
  if (input.motion?.rotation !== void 0 && motionRotation === void 0)
    return err(
      new DerivedPhysicsError(
        "derived-candidate-invalid",
        "optional motion rotation is a finite non-degenerate world-space quaternion",
        "supply a valid xyzw body orientation or omit it to preserve the native orientation",
        { entity: input.entity, actual: input.motion.rotation }
      )
    );
  const mass = validateMassProperties(input.massProperties);
  if (!mass.ok) return mass;
  if (input.motion !== void 0 && (!vectorFinite(input.motion.centerOfMass, 3) || !vectorFinite(input.motion.linearVelocity, 3) || !vectorFinite(input.motion.angularVelocity, 3))) {
    return err(
      new DerivedPhysicsError(
        "derived-candidate-invalid",
        "optional movement state contains finite world-space COM and velocity vectors",
        "capture or provide three finite components for centerOfMass, linearVelocity, and angularVelocity",
        { entity: input.entity, actual: input.motion }
      )
    );
  }
  const constraints = input.constraints ?? [];
  if (constraints.length > DERIVED_PHYSICS_LIMITS.maxConstraintsPerCandidate) {
    return err(
      new DerivedPhysicsError(
        "derived-candidate-budget-exceeded",
        `one candidate contains at most ${DERIVED_PHYSICS_LIMITS.maxConstraintsPerCandidate} constraint updates`,
        "submit a bounded constraint set for this body",
        { entity: input.entity, actual: constraints.length }
      )
    );
  }
  const seams = input.seams ?? [];
  const shapeById = new Map(shapes.map((shape) => [shape.id, shape]));
  for (const seam of seams) {
    const a = shapeById.get(seam.shapeA);
    const b = shapeById.get(seam.shapeB);
    const aRotation = a?.rotation ?? [0, 0, 0, 1];
    const bRotation = b?.rotation ?? [0, 0, 0, 1];
    const aOrigin = a?.origin ?? [0, 0, 0];
    const bOrigin = b?.origin ?? [0, 0, 0];
    const quaternionDot = aRotation.reduce(
      (sum, value, index) => sum + value * (bRotation[index] ?? 0),
      0
    );
    const localOriginDelta = [
      (bOrigin[0] ?? 0) - (aOrigin[0] ?? 0),
      (bOrigin[1] ?? 0) - (aOrigin[1] ?? 0),
      (bOrigin[2] ?? 0) - (aOrigin[2] ?? 0)
    ];
    const sharedGridDelta = rotateVectorByQuaternion(localOriginDelta, [
      -aRotation[0],
      -aRotation[1],
      -aRotation[2],
      aRotation[3]
    ]);
    const alignedOrigins = a !== void 0 && b !== void 0 && seam.offset.every(
      (value, index) => Math.abs((sharedGridDelta[index] ?? 0) / (a?.voxelSize[index] ?? 1) - value) <= 1e-5
    );
    if (a === void 0 || b === void 0 || a.id === b.id || !vectorFinite(seam.offset, 3) || seam.offset.some((value) => !Number.isInteger(value)) || a.voxelSize.some((value, index) => Math.abs(value - (b.voxelSize[index] ?? 0)) > 1e-6) || Math.abs(Math.abs(quaternionDot) - 1) > 1e-5 || !alignedOrigins) {
      return err(
        new DerivedPhysicsError(
          "derived-seam-invalid",
          "a voxel seam joins same-grid shapes with integer offset in the shared rotated grid frame",
          "rotate the local origin delta into the shared grid frame and use an integer grid offset",
          { entity: input.entity, shapeId: seam.shapeA }
        )
      );
    }
  }
  const seenConstraints = /* @__PURE__ */ new Set();
  for (const constraint of constraints) {
    if (seenConstraints.has(constraint.id)) {
      return err(
        new DerivedPhysicsError(
          "derived-constraint-invalid",
          "one candidate contains one update per constraint identity",
          "merge duplicate constraint updates before preparation",
          { entity: input.entity, constraintId: constraint.id }
        )
      );
    }
    seenConstraints.add(constraint.id);
    for (const dependency of [constraint.bodyASource, constraint.bodyBSource]) {
      if (typeof dependency.sourceKey !== "string" || !ID_RE.test(dependency.sourceKey) || !Number.isInteger(dependency.revision) || dependency.revision < 0) {
        return err(
          new DerivedPhysicsError(
            "derived-constraint-invalid",
            "constraint endpoint sourceKey and revision are stable and non-negative",
            "refresh both endpoint dependencies before preparing the constraint",
            { entity: input.entity, constraintId: constraint.id }
          )
        );
      }
    }
  }
  const cellCount = shapes.reduce((sum, shape) => sum + shape.cells.length / 3, 0);
  if (cellCount > DERIVED_PHYSICS_LIMITS.maxCellsPerCandidate) {
    return err(
      new DerivedPhysicsError(
        "derived-candidate-budget-exceeded",
        `one candidate contains at most ${DERIVED_PHYSICS_LIMITS.maxCellsPerCandidate} cells`,
        "reduce the voxel input or split it at a body boundary",
        { entity: input.entity, actual: cellCount }
      )
    );
  }
  if (estimateDerivedPhysicsInputBytes({ ...input, shapes, constraints, seams }) > DERIVED_PHYSICS_LIMITS.maxCandidateBytes) {
    return err(
      new DerivedPhysicsError(
        "derived-candidate-budget-exceeded",
        `one candidate stages at most ${DERIVED_PHYSICS_LIMITS.maxCandidateBytes} bytes`,
        "reduce cells and constraint metadata before preparing the candidate",
        { entity: input.entity }
      )
    );
  }
  return ok(
    Object.freeze({
      ...input,
      shapes: Object.freeze(shapes),
      seams: Object.freeze(
        seams.map((seam) => ({ ...seam, offset: [...seam.offset] }))
      ),
      ...mass.value === void 0 ? {} : { massProperties: mass.value },
      ...input.motion === void 0 ? {} : {
        motion: Object.freeze({
          centerOfMass: [...input.motion.centerOfMass],
          linearVelocity: [...input.motion.linearVelocity],
          angularVelocity: [...input.motion.angularVelocity],
          ...motionRotation === void 0 ? {} : { rotation: motionRotation }
        })
      },
      constraints: Object.freeze([...constraints]),
      velocityPolicy: input.velocityPolicy ?? "preserve"
    })
  );
}
function estimateDerivedPhysicsInputBytes(input) {
  const shapeBytes = input.shapes.reduce(
    (sum, shape) => sum + (shape.cells instanceof Int32Array ? shape.cells.length / 3 : shape.cells.length) * 32 + 128,
    0
  );
  const seamBytes = (input.seams?.length ?? 0) * 64;
  const constraintBytes = (input.constraints?.length ?? 0) * 192;
  return shapeBytes + seamBytes + constraintBytes + 256;
}

// src/load-rapier-backend.mjs
function loadRapier3DBackend() {
  return import('../../physics-rapier3d/dist/index.mjs');
}
function loadRapier2DBackend() {
  return import('../../physics-rapier2d/dist/index.mjs');
}

// src/plugin-factory.ts
function physicsComponentsPlugin() {
  return {
    name: "physics-components",
    inject: ["world"],
    apply(ctx) {
      ctx.effect(() => registerPhysicsComponents(ctx.world), "physics/components");
    }
  };
}
function normalizeWasmLoadFailure(backend, cause) {
  if (cause instanceof PhysicsError && cause.code === "wasm-load-failed") return cause;
  const reason = cause instanceof Error ? cause.message : String(cause);
  return new PhysicsError({
    code: "wasm-load-failed",
    expected: `successful import and WASM initialization for ${backend}`,
    hint: `Rapier backend activation failed: ${reason}`,
    detail: { code: "wasm-load-failed", reason }
  });
}
function physicsPlugin(backend) {
  return {
    name: "physics",
    inject: ["world"],
    provide: "physics",
    async apply(ctx) {
      const world = ctx.world;
      let physics;
      let registerSystems;
      if (backend === "rapier-3d") {
        let module;
        let rapier;
        try {
          module = await loadRapier3DBackend();
          rapier = await module.loadRapier3D();
        } catch (cause) {
          throw normalizeWasmLoadFailure(backend, cause);
        }
        if (rapier instanceof PhysicsError) throw normalizeWasmLoadFailure(backend, rapier);
        const { createRapier3DPhysicsWorld, registerPhysicsSystems } = module;
        physics = createRapier3DPhysicsWorld(rapier);
        registerSystems = () => registerPhysicsSystems(world);
      } else {
        let module;
        let rapier;
        try {
          module = await loadRapier2DBackend();
          rapier = await module.loadRapier2D();
        } catch (cause) {
          throw normalizeWasmLoadFailure(backend, cause);
        }
        if (rapier instanceof PhysicsError) throw normalizeWasmLoadFailure(backend, rapier);
        const { createRapier2DPhysicsWorld, registerPhysicsSystems2D } = module;
        physics = createRapier2DPhysicsWorld(rapier);
        registerSystems = () => registerPhysicsSystems2D(world);
      }
      ctx.effect(() => registerPhysicsComponents(world), "physics/components");
      ctx.effect(() => {
        world.insertResource("PhysicsWorld", physics);
        return () => {
          world.removeResource("PhysicsWorld");
          physics.dispose();
        };
      }, "physics/resource");
      ctx.effect(() => {
        const unregister = registerSystems();
        return () => unregister();
      }, "physics/systems");
      ctx.provide("physics", physics);
    }
  };
}
var PhysicsSet = defineSystemSet({ name: "physics" });

export { COLLIDER_SHAPE_CAPSULE, COLLIDER_SHAPE_CUBOID, COLLIDER_SHAPE_SPHERE, CharacterController, Collider, ColliderShapeValue, CollidingEntities, CollisionEvent, DERIVED_PHYSICS_LIMITS, DerivedPhysicsError, PhysicsSet, RIGID_BODY_TYPE_DYNAMIC, RIGID_BODY_TYPE_KINEMATIC, RIGID_BODY_TYPE_STATIC, RigidBody, RigidBodyTypeValue, cloneDerivedPhysicsInput, colliderShapeFromF32, estimateDerivedPhysicsInputBytes, normalizeVoxelShapeInput, physicsComponentsPlugin, physicsPlugin, preserveCenterOfMassVelocity, registerPhysicsComponents, rigidBodyTypeFromF32, validateMassProperties };
