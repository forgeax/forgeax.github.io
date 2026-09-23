import { defineSystem, FixedTime, componentDefinition, FixedUpdate } from '../../ecs/dist/index.mjs';
import { vec3, quat, mat4, vec2 } from '../../math/dist/index.mjs';
import { RigidBody, CharacterController, Collider, RIGID_BODY_TYPE_STATIC, rigidBodyTypeFromF32, CollidingEntities, PhysicsError, PHYSICS_ERROR_HINTS, colliderShapeFromF32, registerPhysicsComponents, PhysicsSet } from '../../physics/dist/index.mjs';
import { PhysicsError as PhysicsError$1 } from '../../types/dist/index.mjs';

// src/rapier-physics-world-2d.ts
var DEG_TO_RAD = Math.PI / 180;
function applyKccTuning(ctrl, cc) {
  ctrl.setMaxSlopeClimbAngle(cc.maxSlopeClimbDeg * DEG_TO_RAD);
  ctrl.setMinSlopeSlideAngle(cc.minSlopeSlideDeg * DEG_TO_RAD);
  ctrl.setSlideEnabled(true);
  if (cc.autoStepMaxHeight === 0) {
    ctrl.disableAutostep();
  } else {
    ctrl.enableAutostep(cc.autoStepMaxHeight, cc.autoStepMinWidth, false);
  }
  if (cc.snapToGroundDist === 0) {
    ctrl.disableSnapToGround();
  } else {
    ctrl.enableSnapToGround(cc.snapToGroundDist);
  }
}
function rapierBodyTypeToString(rapier, bodyType) {
  if (bodyType === rapier.RigidBodyType.Dynamic) return "dynamic";
  if (bodyType === rapier.RigidBodyType.Fixed) return "static";
  return "kinematic";
}
var RapierPhysicsWorld2D = class {
  raw;
  rapierModule;
  /** Entity (raw number) -> PhysicsEntityRecord mapping. */
  entityMap = /* @__PURE__ */ new Map();
  /** Pending teleports: entity -> target position and rotation. */
  pendingTeleports = /* @__PURE__ */ new Map();
  eventQueue;
  collisionPairs = /* @__PURE__ */ new Map();
  pendingCollisionEvents = [];
  collisionEventHistory = [];
  currentGravity;
  /**
   * Lazily-built Rapier KinematicCharacterController per character entity
   * (plan-strategy D-1/D-3, 2D variant). `moveAndSlide` creates one on first
   * call; the `Collider.onRemove` hook clears it on despawn. Public so AC-12
   * despawn tests can assert `kccCache.size === 0`.
   */
  // biome-ignore lint/suspicious/noExplicitAny: Rapier KinematicCharacterController from dynamic module
  kccCache = /* @__PURE__ */ new Map();
  kccOffsets = /* @__PURE__ */ new Map();
  /**
   * ECS World + components wired in by `registerPhysicsSystems2D`, so
   * `moveAndSlide` can read CharacterController tuning and write Transform +
   * grounded back. Undefined until systems are registered — the input-validation
   * error paths fire before these are read, so direct `pw.moveAndSlide()` calls
   * in error tests need no World.
   */
  moveContext;
  constructor(rapier) {
    this.rapierModule = rapier;
    this.raw = new rapier.World({ x: 0, y: -9.81 });
    this.eventQueue = new rapier.EventQueue(true);
    this.currentGravity = { x: 0, y: -9.81 };
  }
  // ─── PhysicsWorld2D interface ──────────────────────────────────────────
  setGravity(gravity) {
    const x = gravity[0] ?? 0;
    const y = gravity[1] ?? 0;
    this.raw.gravity = { x, y };
    this.currentGravity = { x, y };
  }
  getGravity() {
    const { x, y } = this.currentGravity;
    return vec2.create(x, y);
  }
  raycast(origin, direction, maxDist, filterMask) {
    const RAPIER = this.rapierModule;
    const RayCtor = RAPIER.Ray;
    const ray = new RayCtor(
      { x: origin[0] ?? 0, y: origin[1] ?? 0 },
      { x: direction[0] ?? 0, y: direction[1] ?? 0 }
    );
    const hit = this.raw.castRayAndGetNormal(
      ray,
      maxDist,
      true,
      void 0,
      filterMask
    );
    if (hit === null) return void 0;
    const point = ray.pointAt(hit.timeOfImpact);
    const colliderParentBody = hit.collider.parent();
    const entity = colliderParentBody !== null ? colliderParentBody.userData : 0;
    return {
      entity,
      point: vec2.create(point.x, point.y),
      normal: vec2.create(hit.normal.x, hit.normal.y),
      timeOfImpact: hit.timeOfImpact
    };
  }
  teleport(entity, position, rotation) {
    this.pendingTeleports.set(entity, {
      x: position[0] ?? 0,
      y: position[1] ?? 0,
      rotation
    });
  }
  step(deltaTime) {
    this.raw.step(this.eventQueue);
    this.drainRapierCollisionEvents();
  }
  drainRapierCollisionEvents() {
    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      const entityA = this.colliderHandleToEntity(handle1);
      const entityB = this.colliderHandleToEntity(handle2);
      if (entityA === void 0 || entityB === void 0) return;
      const changed = started ? this.addCollisionPair(entityA, entityB) : this.removeCollisionPair(entityA, entityB);
      if (!changed) return;
      this.pushCollisionEvent({
        type: started ? "started" : "stopped",
        entityA,
        entityB
      });
    });
  }
  colliderHandleToEntity(colliderHandle) {
    const collider = this.raw.getCollider(colliderHandle);
    const body = collider?.parent();
    return body?.userData;
  }
  addCollisionPair(entityA, entityB) {
    let first = this.collisionPairs.get(entityA);
    if (!first) {
      first = /* @__PURE__ */ new Set();
      this.collisionPairs.set(entityA, first);
    }
    if (first.has(entityB)) return false;
    first.add(entityB);
    let second = this.collisionPairs.get(entityB);
    if (!second) {
      second = /* @__PURE__ */ new Set();
      this.collisionPairs.set(entityB, second);
    }
    second.add(entityA);
    return true;
  }
  removeCollisionPair(entityA, entityB) {
    const first = this.collisionPairs.get(entityA);
    const second = this.collisionPairs.get(entityB);
    const firstChanged = first?.delete(entityB) === true;
    const secondChanged = second?.delete(entityA) === true;
    if (!first) this.collisionPairs.set(entityA, /* @__PURE__ */ new Set());
    if (!second) this.collisionPairs.set(entityB, /* @__PURE__ */ new Set());
    return firstChanged || secondChanged;
  }
  pushCollisionEvent(event) {
    this.pendingCollisionEvents.push(event);
    this.collisionEventHistory.push(event);
  }
  drainCollisionEvents() {
    return this.pendingCollisionEvents.splice(0);
  }
  getCollisionPairs() {
    return new Map([...this.collisionPairs].map(([entity, others]) => [entity, new Set(others)]));
  }
  getCollisionEventHistory() {
    return [...this.collisionEventHistory];
  }
  getPendingTeleports() {
    return [...this.pendingTeleports].map(([entity, target]) => [entity, { ...target }]);
  }
  getKinematicControllerStates() {
    return [...this.kccOffsets].sort(([first], [second]) => first - second).map(([entity, offset]) => ({ entity, offset }));
  }
  dispose() {
    if (typeof this.raw.free === "function") this.raw.free();
    if (typeof this.eventQueue.free === "function") this.eventQueue.free();
    this.kccCache.clear();
    this.kccOffsets.clear();
  }
  writebackCollidingEntities(world, component = CollidingEntities) {
    for (const [entity, others] of this.collisionPairs) {
      const handle = entity;
      if (world.get(handle, component).ok) {
        world.set(handle, component, { entities: [...others] });
      }
    }
  }
  getBodyCount() {
    return this.entityMap.size;
  }
  hasBody(entity) {
    return this.entityMap.has(entity);
  }
  /**
   * Wire the ECS World + Transform / CharacterController components needed by
   * `moveAndSlide` to read tuning and write back pose + grounded. Called once by
   * `registerPhysicsSystems2D` (plan-strategy D-1/D-7).
   */
  setMoveContext(world, transform, characterController) {
    this.moveContext = { world, transform, characterController };
  }
  moveAndSlide(entity, desiredDelta) {
    return this.computeMove(entity, desiredDelta);
  }
  /**
   * Shared moveAndSlide core (plan-strategy D-1/D-2/D-4/D-6/D-7), 2D variant.
   * Mirrors the 3D computeMove with Vec2 movement (x, y only — no z).
   *
   * The three Fail-Fast entry checks (body / collider / kinematic) throw
   * structured PhysicsError before the World is read, so error-path tests can
   * call this without registered systems.
   */
  computeMove(entity, desiredDelta) {
    const record = this.entityMap.get(entity);
    if (!record) {
      throw new PhysicsError({
        code: "body-not-found",
        expected: "a registered Rapier body for this entity",
        hint: PHYSICS_ERROR_HINTS["body-not-found"],
        detail: { code: "body-not-found", entity }
      });
    }
    const body = this.raw.bodies.get(record.bodyHandle);
    if (!body) {
      throw new PhysicsError({
        code: "body-not-found",
        expected: "a registered Rapier body for this entity",
        hint: PHYSICS_ERROR_HINTS["body-not-found"],
        detail: { code: "body-not-found", entity }
      });
    }
    if (body.numColliders() === 0) {
      throw new PhysicsError({
        code: "collider-not-found",
        expected: "a Collider attached to this entity body",
        hint: PHYSICS_ERROR_HINTS["collider-not-found"],
        detail: { code: "collider-not-found", entity }
      });
    }
    const RAPIER = this.rapierModule;
    if (body.bodyType() !== RAPIER.RigidBodyType.KinematicPositionBased) {
      throw new PhysicsError({
        code: "controller-requires-kinematic",
        expected: "RigidBody.type === 'kinematic'",
        hint: PHYSICS_ERROR_HINTS["controller-requires-kinematic"],
        detail: {
          code: "controller-requires-kinematic",
          entity,
          bodyType: rapierBodyTypeToString(RAPIER, body.bodyType())
        }
      });
    }
    const collider = body.collider(0);
    const cc = this.readCharacterController(entity);
    const ctrl = this.ensureKcc(entity, cc.offset);
    applyKccTuning(ctrl, cc);
    const delta = { x: desiredDelta[0] ?? 0, y: desiredDelta[1] ?? 0 };
    ctrl.computeColliderMovement(
      collider,
      delta,
      void 0,
      void 0,
      // biome-ignore lint/suspicious/noExplicitAny: Rapier Collider in filter predicate
      (other) => other.handle !== collider.handle
    );
    const movement = ctrl.computedMovement();
    const grounded = ctrl.computedGrounded();
    const t = body.translation();
    const next = { x: t.x + movement.x, y: t.y + movement.y };
    body.setNextKinematicTranslation(next);
    body.setTranslation(next, true);
    this.raw.propagateModifiedBodyPositionsToColliders();
    const ctx = this.moveContext;
    if (ctx) {
      ctx.world.set(entity, ctx.transform, {
        pos: [next.x, next.y, readTransformPosZ(ctx.world, entity, ctx.transform)]
      });
      ctx.world.set(entity, ctx.characterController, { grounded });
    }
    return vec2.create(movement.x, movement.y);
  }
  /**
   * Read CharacterController tuning fields for an entity from the ECS World,
   * falling back to schema defaults when the World is not wired (defensive;
   * the kinematic check upstream means a valid character always has the World).
   */
  readCharacterController(entity) {
    const ctx = this.moveContext;
    if (ctx) {
      const r = ctx.world.get(entity, ctx.characterController);
      if (r.ok) {
        const v = r.value;
        return {
          offset: v.offset,
          maxSlopeClimbDeg: v.maxSlopeClimbDeg,
          minSlopeSlideDeg: v.minSlopeSlideDeg,
          autoStepMaxHeight: v.autoStepMaxHeight,
          autoStepMinWidth: v.autoStepMinWidth,
          snapToGroundDist: v.snapToGroundDist
        };
      }
    }
    return componentDefinition(CharacterController).defaults;
  }
  /**
   * Lazily build a Rapier 2D KinematicCharacterController for `entity` (cached).
   */
  // biome-ignore lint/suspicious/noExplicitAny: Rapier KinematicCharacterController from dynamic module
  ensureKcc(entity, offset) {
    const cached = this.kccCache.get(entity);
    if (cached) return cached;
    const ctrl = this.raw.createCharacterController(offset);
    this.kccCache.set(entity, ctrl);
    this.kccOffsets.set(entity, offset);
    return ctrl;
  }
  /**
   * Remove an entity's cached KCC and unregister it from the Rapier world
   * (plan-strategy D-3). Idempotent — safe for entities that never moved.
   */
  removeKccController(entity) {
    const ctrl = this.kccCache.get(entity);
    this.kccOffsets.delete(entity);
    if (!ctrl) return;
    this.raw.removeCharacterController(ctrl);
    this.kccCache.delete(entity);
  }
  // ─── ECS->Rapier bridge (D-2, 2D variant) ────────────────────────────
  /**
   * Ensure a Rapier 2D body and collider exist for an ECS entity (idempotent).
   *
   * 2D variant of the M1 3D ensureBody: Vec2 {x,y} instead of Vec3 {x,y,z},
   * Rapier2D ColliderDesc.{cuboid(hx,hy), ball(radius), capsule(halfHeight,radius)},
   * scalar rotation from transform quat (extracted via atan2 for z-axis angle).
   *
   * Plan-strategy C-3 symmetry with M1, D-2 + D-5 2D adaptations.
   */
  ensureBody(entity, transform, rigidBody, collider) {
    if (this.entityMap.has(entity)) return;
    const RAPIER = this.rapierModule;
    const rbType = rigidBodyTypeFromF32(rigidBody.type);
    let body;
    switch (rbType) {
      case "dynamic": {
        const desc = RAPIER.RigidBodyDesc.dynamic().setTranslation(transform.position.x, transform.position.y).setRotation(transform.rotation).setLinearDamping(rigidBody.linearDamping).setAngularDamping(rigidBody.angularDamping).setGravityScale(rigidBody.gravityScale);
        if (rigidBody.mass > 0) {
          desc.setAdditionalMass(rigidBody.mass);
        }
        if (rigidBody.ccdEnabled) {
          desc.setCcdEnabled(true);
        }
        body = this.raw.createRigidBody(desc);
        break;
      }
      case "static": {
        const desc = RAPIER.RigidBodyDesc.fixed().setTranslation(transform.position.x, transform.position.y).setRotation(transform.rotation);
        body = this.raw.createRigidBody(desc);
        break;
      }
      case "kinematic": {
        const desc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(transform.position.x, transform.position.y).setRotation(transform.rotation);
        if (rigidBody.ccdEnabled) {
          desc.setCcdEnabled(true);
        }
        body = this.raw.createRigidBody(desc);
        break;
      }
    }
    body.userData = entity;
    this.registerBody(entity, body.handle);
    const scaleX = Math.abs(transform.scale.x);
    const scaleY = Math.abs(transform.scale.y);
    const cShape = colliderShapeFromF32(collider.shape);
    switch (cShape) {
      case "cuboid": {
        const desc = RAPIER.ColliderDesc.cuboid(
          collider.halfExtents[0] * scaleX,
          collider.halfExtents[1] * scaleY
        ).setFriction(collider.friction).setRestitution(collider.restitution).setDensity(collider.density).setCollisionGroups(collider.collisionGroups).setSolverGroups(collider.solverGroups);
        if (collider.isSensor) desc.setSensor(true);
        this.raw.createCollider(desc, body);
        break;
      }
      case "sphere": {
        const desc = RAPIER.ColliderDesc.ball(collider.radius * Math.max(scaleX, scaleY)).setFriction(collider.friction).setRestitution(collider.restitution).setDensity(collider.density).setCollisionGroups(collider.collisionGroups).setSolverGroups(collider.solverGroups);
        if (collider.isSensor) desc.setSensor(true);
        this.raw.createCollider(desc, body);
        break;
      }
      case "capsule": {
        const desc = RAPIER.ColliderDesc.capsule(
          collider.halfHeight * scaleY,
          collider.radius * scaleX
        ).setFriction(collider.friction).setRestitution(collider.restitution).setDensity(collider.density).setCollisionGroups(collider.collisionGroups).setSolverGroups(collider.solverGroups);
        if (collider.isSensor) desc.setSensor(true);
        this.raw.createCollider(desc, body);
        break;
      }
    }
  }
  /** Synchronize a static or kinematic Rapier body from its resolved 2D Transform pose. */
  syncAuthoredPose(entity, transform, collider, bodyType) {
    const record = this.entityMap.get(entity);
    if (!record) return;
    const body = this.raw.bodies.get(record.bodyHandle);
    if (!body) return;
    if (bodyType === "static") {
      body.setTranslation(transform.position, true);
      body.setRotation(transform.rotation, true);
    } else {
      body.setNextKinematicTranslation(transform.position);
      body.setNextKinematicRotation(transform.rotation);
    }
    const rapierCollider = body.collider(0);
    if (!rapierCollider) return;
    const scaleX = Math.abs(transform.scale.x);
    const scaleY = Math.abs(transform.scale.y);
    switch (colliderShapeFromF32(collider.shape)) {
      case "cuboid":
        rapierCollider.setHalfExtents({
          x: collider.halfExtents[0] * scaleX,
          y: collider.halfExtents[1] * scaleY
        });
        break;
      case "sphere":
        rapierCollider.setRadius(collider.radius * Math.max(scaleX, scaleY));
        break;
      case "capsule":
        rapierCollider.setHalfHeight(collider.halfHeight * scaleY);
        rapierCollider.setRadius(collider.radius * scaleX);
        break;
    }
  }
  // ─── ECS integration helpers ───────────────────────────────────────────
  registerBody(entity, bodyHandle) {
    this.entityMap.set(entity, { bodyHandle });
  }
  applyPendingTeleports() {
    for (const [entity, target] of this.pendingTeleports) {
      const record = this.entityMap.get(entity);
      if (!record) continue;
      const body = this.raw.bodies.get(record.bodyHandle);
      if (!body) continue;
      body.setTranslation({ x: target.x, y: target.y }, true);
      body.setLinvel({ x: 0, y: 0 }, false);
      body.setAngvel(0, false);
      if (target.rotation !== void 0) {
        body.setRotation(target.rotation, true);
      }
    }
    this.pendingTeleports.clear();
  }
  setKinematicPosition(entity, pos, rotation) {
    const record = this.entityMap.get(entity);
    if (!record) return;
    const body = this.raw.bodies.get(record.bodyHandle);
    if (!body) return;
    body.setNextKinematicTranslation({ x: pos.x, y: pos.y });
    if (rotation !== void 0) {
      body.setNextKinematicRotation(rotation);
    }
  }
  writebackDynamicBodies() {
    const results = [];
    for (const [entity, record] of this.entityMap) {
      const body = this.raw.bodies.get(record.bodyHandle);
      if (!body) continue;
      if (body.bodyType() !== this.rapierModule.RigidBodyType.Dynamic) continue;
      const translation = body.translation();
      const rotation = body.rotation();
      results.push({
        entity,
        pos: { x: translation.x, y: translation.y },
        rotation
      });
    }
    return results;
  }
  /** Remove backend rows whose Collider disappeared from the World query. */
  pruneMissingEntities(active) {
    for (const entity of this.entityMap.keys()) {
      if (!active.has(entity)) this.removeEntity(entity);
    }
  }
  removeEntity(entity) {
    const record = this.entityMap.get(entity);
    if (!record) return;
    const ownPairs = [...this.collisionPairs.get(entity) ?? []];
    for (const other of ownPairs) {
      if (this.removeCollisionPair(entity, other)) {
        this.pushCollisionEvent({ type: "stopped", entityA: entity, entityB: other });
      }
    }
    this.removeKccController(entity);
    this.raw.removeRigidBody({
      handle: record.bodyHandle
    });
    this.entityMap.delete(entity);
    this.collisionPairs.delete(entity);
  }
};
function createRapier2DPhysicsWorld(rapier) {
  return new RapierPhysicsWorld2D(rapier);
}
function readTransformPosZ(w, entity, transform) {
  const result = w.get(entity, transform);
  if (!result.ok) return 0;
  const pos = result.value.pos;
  return pos?.[2] ?? 0;
}
function hasResolvedWorldPose(world, base) {
  if (!world) return false;
  return world[base] !== 1 || world[base + 5] !== 1 || world[base + 10] !== 1 || world[base + 15] !== 1 || world[base + 1] !== 0 || world[base + 2] !== 0 || world[base + 4] !== 0 || world[base + 6] !== 0 || world[base + 8] !== 0 || world[base + 9] !== 0 || world[base + 12] !== 0 || world[base + 13] !== 0 || world[base + 14] !== 0;
}
var PHYSICS_DT_MAX = 0.1;
var poseScratchPosition2D = vec3.create();
var poseScratchRotation2D = quat.create();
var poseScratchScale2D = vec3.create();
var poseScratchWorld2D = new Float32Array(16);
var PHYSICS_SYNC_BACKEND_2D = "physicsSyncBackend2D";
var PHYSICS_STEP_SIMULATION_2D = "physicsStepSimulation2D";
var PHYSICS_WRITEBACK_2D = "physicsWriteback2D";
var PHYSICS_COLLISION_SYNC_2D = "physicsCollisionSync2D";
function resolveTransform(world) {
  return world.components.resolve("Transform");
}
var PhysicsSyncBackend2D = defineSystem({
  name: PHYSICS_SYNC_BACKEND_2D,
  queries: [],
  after: ["propagateTransformsFixed"],
  fn: (world) => {
    const transformComponent = resolveTransform(world);
    const globalTransformComponent = world.components.resolve("GlobalTransform");
    if (transformComponent === void 0 || globalTransformComponent === void 0) return;
    let pw;
    try {
      pw = world.getResource("PhysicsWorld");
    } catch {
      return;
    }
    pw.applyPendingTeleports();
    const queryResult = world.query({
      read: [Collider, transformComponent, globalTransformComponent],
      optional: [RigidBody, CharacterController]
    });
    if (!queryResult.ok) return;
    const activeEntities = /* @__PURE__ */ new Set();
    for (const queryRow of queryResult.value) {
      const rowView = queryRow;
      const colliderData = rowView.get(Collider);
      const transformData = rowView.get(transformComponent);
      const globalTransformData = rowView.get(globalTransformComponent);
      const rigidBodyData = rowView.has(RigidBody) ? rowView.get(RigidBody) : void 0;
      const hasCharacterController = rowView.has(CharacterController);
      const rbType = rigidBodyData === void 0 ? void 0 : new Float32Array([rigidBodyData.type]);
      const rbMass = rigidBodyData === void 0 ? void 0 : new Float32Array([rigidBodyData.mass]);
      const rbLinDamp = rigidBodyData === void 0 ? void 0 : new Float32Array([rigidBodyData.linearDamping]);
      const rbAngDamp = rigidBodyData === void 0 ? void 0 : new Float32Array([rigidBodyData.angularDamping]);
      const rbGravScale = rigidBodyData === void 0 ? void 0 : new Float32Array([rigidBodyData.gravityScale]);
      const rbCcd = rigidBodyData === void 0 ? void 0 : new Uint32Array([rigidBodyData.ccdEnabled]);
      const cShape = new Uint32Array([colliderData.shape]);
      const cHalfExtents = colliderData.halfExtents;
      const cRadius = new Float32Array([colliderData.radius]);
      const cHalfH = new Float32Array([colliderData.halfHeight]);
      const cFric = new Float32Array([colliderData.friction]);
      const cRest = new Float32Array([colliderData.restitution]);
      const cDens = new Float32Array([colliderData.density]);
      const cSensor = new Uint32Array([colliderData.isSensor]);
      const cCGroups = new Uint32Array([colliderData.collisionGroups]);
      const cSGroups = new Uint32Array([colliderData.solverGroups]);
      const tfPos = transformData.pos;
      const tfQuat = transformData.quat;
      const tfScale = transformData.scale;
      const tfWorld = globalTransformData.world;
      if (!cShape || !cHalfExtents || !cRadius || !cHalfH || !cFric || !cRest || !cDens || !cSensor || !cCGroups || !cSGroups || !tfPos || !tfQuat || !tfScale) {
        continue;
      }
      {
        const row = 0;
        const entity = rowView.entity;
        activeEntities.add(entity);
        const localBase = row * 3;
        const quatBase = row * 4;
        const worldBase = row * 16;
        const useWorldPose = hasResolvedWorldPose(tfWorld, worldBase);
        if (useWorldPose && tfWorld) {
          for (let lane = 0; lane < 16; lane++) {
            poseScratchWorld2D[lane] = tfWorld[worldBase + lane] ?? 0;
          }
          mat4.decompose(
            poseScratchPosition2D,
            poseScratchRotation2D,
            poseScratchScale2D,
            poseScratchWorld2D
          );
        } else {
          poseScratchPosition2D[0] = tfPos[localBase] ?? 0;
          poseScratchPosition2D[1] = tfPos[localBase + 1] ?? 0;
          poseScratchPosition2D[2] = tfPos[localBase + 2] ?? 0;
          poseScratchRotation2D[0] = tfQuat[quatBase] ?? 0;
          poseScratchRotation2D[1] = tfQuat[quatBase + 1] ?? 0;
          poseScratchRotation2D[2] = tfQuat[quatBase + 2] ?? 0;
          poseScratchRotation2D[3] = tfQuat[quatBase + 3] ?? 1;
          poseScratchScale2D[0] = tfScale[localBase] ?? 1;
          poseScratchScale2D[1] = tfScale[localBase + 1] ?? 1;
          poseScratchScale2D[2] = tfScale[localBase + 2] ?? 1;
        }
        const transform = {
          position: { x: poseScratchPosition2D[0] ?? 0, y: poseScratchPosition2D[1] ?? 0 },
          rotation: 2 * Math.atan2(poseScratchRotation2D[2] ?? 0, poseScratchRotation2D[3] ?? 1),
          scale: { x: poseScratchScale2D[0] ?? 1, y: poseScratchScale2D[1] ?? 1 }
        };
        const rigidBody = rbType ? {
          type: rbType[row],
          mass: rbMass?.[row] ?? 0,
          linearDamping: rbLinDamp?.[row] ?? 0,
          angularDamping: rbAngDamp?.[row] ?? 0,
          gravityScale: rbGravScale?.[row] ?? 1,
          ccdEnabled: rbCcd?.[row] ?? 0
        } : {
          type: RIGID_BODY_TYPE_STATIC,
          mass: 0,
          linearDamping: 0,
          angularDamping: 0,
          gravityScale: 1,
          ccdEnabled: 0
        };
        const collider = {
          shape: cShape[row],
          halfExtents: [
            cHalfExtents[row * 3],
            cHalfExtents[row * 3 + 1],
            cHalfExtents[row * 3 + 2]
          ],
          radius: cRadius[row],
          halfHeight: cHalfH[row],
          friction: cFric[row],
          restitution: cRest[row],
          density: cDens[row],
          isSensor: cSensor[row],
          collisionGroups: cCGroups[row],
          solverGroups: cSGroups[row]
        };
        pw.ensureBody(entity, transform, rigidBody, collider);
        const rbTypeVal = rigidBodyTypeFromF32(rigidBody.type);
        if (rbTypeVal === "static") {
          pw.syncAuthoredPose(entity, transform, collider, "static");
        } else if (rbTypeVal === "kinematic" && !hasCharacterController) {
          pw.syncAuthoredPose(entity, transform, collider, "kinematic");
        }
      }
    }
    pw.pruneMissingEntities(activeEntities);
  }
});
var PhysicsStepSimulation2D = defineSystem({
  name: PHYSICS_STEP_SIMULATION_2D,
  queries: [],
  after: [PHYSICS_SYNC_BACKEND_2D],
  fn: (world) => {
    let pw;
    try {
      pw = world.getResource("PhysicsWorld");
    } catch {
      return;
    }
    const dt = world.getResource(FixedTime).delta;
    if (dt <= 0 || dt > PHYSICS_DT_MAX) return;
    pw.step(dt);
  }
});
var PhysicsWriteback2D = defineSystem({
  name: PHYSICS_WRITEBACK_2D,
  queries: [],
  after: [PHYSICS_STEP_SIMULATION_2D],
  fn: (world) => {
    const transformComponent = resolveTransform(world);
    if (transformComponent === void 0) return;
    let pw;
    try {
      pw = world.getResource("PhysicsWorld");
    } catch {
      return;
    }
    const results = pw.writebackDynamicBodies();
    for (const r of results) {
      const entity = r.entity;
      const outQuat = quat.create();
      quat.fromAxisAngle(outQuat, [0, 0, 1], r.rotation);
      world.set(entity, transformComponent, {
        pos: [r.pos.x, r.pos.y, readTransformPosZ(world, entity, transformComponent)],
        // Component order [x, y, z, w] (E6). `?? 0/1` narrows the
        // noUncheckedIndexedAccess undefined out of the quat elements.
        quat: [outQuat[0] ?? 0, outQuat[1] ?? 0, outQuat[2] ?? 0, outQuat[3] ?? 1]
      });
    }
  }
});
var PhysicsCollisionSync2D = defineSystem({
  name: PHYSICS_COLLISION_SYNC_2D,
  queries: [],
  after: [PHYSICS_WRITEBACK_2D],
  fn: (world) => {
    let pw;
    try {
      pw = world.getResource("PhysicsWorld");
    } catch {
      return;
    }
    pw.writebackCollidingEntities(world);
  }
});
function registerPhysicsSystems2D(world) {
  const releaseComponents = registerPhysicsComponents(world);
  const transformComponent = resolveTransform(world);
  try {
    const pw = world.getResource("PhysicsWorld");
    if (transformComponent !== void 0) {
      pw.setMoveContext(world, transformComponent, CharacterController);
    }
  } catch {
  }
  world.addSystems(FixedUpdate, PhysicsSet, [
    PhysicsSyncBackend2D,
    PhysicsStepSimulation2D,
    PhysicsWriteback2D,
    PhysicsCollisionSync2D
  ]).unwrap();
  return () => {
    world.removeSystem(FixedUpdate, PHYSICS_COLLISION_SYNC_2D);
    world.removeSystem(FixedUpdate, PHYSICS_WRITEBACK_2D);
    world.removeSystem(FixedUpdate, PHYSICS_STEP_SIMULATION_2D);
    world.removeSystem(FixedUpdate, PHYSICS_SYNC_BACKEND_2D);
    releaseComponents();
  };
}
var rapierInstance = null;
var loadingPromise = null;
async function loadRapier2D() {
  if (rapierInstance !== null) return rapierInstance;
  if (loadingPromise !== null) return loadingPromise;
  loadingPromise = _doLoad();
  return loadingPromise;
}
async function _doLoad() {
  try {
    const RAPIER = await import('../../../vendor/@dimforge/rapier2d-compat/dist/rapier.mjs');
    await RAPIER.default.init();
    rapierInstance = RAPIER.default;
    loadingPromise = null;
    return RAPIER.default;
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    loadingPromise = null;
    return new PhysicsError$1({
      code: "wasm-load-failed",
      expected: "successful dynamic import and init of @dimforge/rapier2d-compat",
      hint: `dynamic import or init() failed: ${reason}. Check network, file path, and that @dimforge/rapier2d-compat is installed.`,
      detail: { code: "wasm-load-failed", reason }
    });
  }
}

export { PhysicsCollisionSync2D, PhysicsStepSimulation2D, PhysicsSyncBackend2D, PhysicsWriteback2D, RapierPhysicsWorld2D, createRapier2DPhysicsWorld, loadRapier2D, registerPhysicsSystems2D };
