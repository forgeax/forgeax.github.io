import { defineSystem, FixedTime, componentDefinition, Disabled, FixedUpdate } from '../../ecs/dist/index.mjs';
import { createStateProjection } from '../../ecs/dist/projection/index.mjs';
import { vec3, quat, mat4 } from '../../math/dist/index.mjs';
import { CollidingEntities, DerivedPhysicsError, cloneDerivedPhysicsInput, validateMassProperties, DERIVED_PHYSICS_LIMITS, estimateDerivedPhysicsInputBytes, preserveCenterOfMassVelocity, PhysicsError, PHYSICS_ERROR_HINTS, CharacterController, rigidBodyTypeFromF32, RigidBody, Collider, colliderShapeFromF32, RIGID_BODY_TYPE_STATIC, registerPhysicsComponents, PhysicsSet } from '../../physics/dist/index.mjs';
import { ChildOf } from '../../scene/dist/index.mjs';
import { err, ok, PhysicsError as PhysicsError$1 } from '../../types/dist/index.mjs';

// src/rapier-physics-world-3d.ts
function samePhysicsValue(left, right) {
  if (Object.is(left, right)) return true;
  if (left === void 0 || right === void 0 || left === null || right === null || typeof left !== "object" || typeof right !== "object")
    return false;
  const a = left;
  const b = right;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => samePhysicsValue(a[key], b[key]));
}
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
function validateConstraintInput(input) {
  const finiteVector = (value) => value.length === 3 && value.every(Number.isFinite);
  if (typeof input.id !== "string" || input.id.trim().length === 0 || !Number.isInteger(input.revision) || input.revision < 0 || !Number.isInteger(input.bodyA) || !Number.isInteger(input.bodyB) || input.bodyA === input.bodyB || !finiteVector(input.anchorA) || !finiteVector(input.anchorB)) {
    return err(
      new DerivedPhysicsError(
        "derived-constraint-invalid",
        "constraint identity, revision, endpoint bodies, and anchors are valid",
        "supply two distinct live bodies and finite local anchors",
        { constraintId: input.id }
      )
    );
  }
  if (input.kind === "spring") {
    if (!Number.isFinite(input.restLength) || input.restLength < 0 || !Number.isFinite(input.stiffness) || input.stiffness < 0 || !Number.isFinite(input.damping) || input.damping < 0) {
      return err(
        new DerivedPhysicsError(
          "derived-constraint-invalid",
          "spring rest length, stiffness, and damping are finite and non-negative",
          "repair spring tuning before native creation",
          { constraintId: input.id }
        )
      );
    }
  } else if (!finiteVector(input.axis) || Math.hypot(input.axis[0], input.axis[1], input.axis[2]) < 1e-6 || input.limits !== void 0 && (!Number.isFinite(input.limits[0]) || !Number.isFinite(input.limits[1]) || input.limits[0] > input.limits[1])) {
    return err(
      new DerivedPhysicsError(
        "derived-constraint-invalid",
        "hinge axis is non-zero and optional limits are ordered finite values",
        "normalize the hinge axis and set minLimit <= maxLimit",
        { constraintId: input.id }
      )
    );
  }
  return ok(input);
}
var RapierPhysicsWorld3D = class {
  /** Rapier 3D World instance owning all bodies, colliders, and pipeline. */
  raw;
  rapierModule;
  /** Entity (raw number) -> PhysicsEntityRecord mapping. */
  entityMap = /* @__PURE__ */ new Map();
  /** Pending teleports: entity -> target position, applied on next sync. */
  pendingTeleports = /* @__PURE__ */ new Map();
  /** Event queue for collision events. */
  eventQueue;
  /**
   * Active overlap set per entity, maintained by draining the event queue each
   * step. `started` events add the pair both ways; `stopped` events remove it.
   * Read out into each entity's `CollidingEntities` component by
   * `writebackCollidingEntities`. Covers both solid contacts and sensor
   * intersections (Rapier emits CollisionEvent for both).
   */
  collisionPairs = /* @__PURE__ */ new Map();
  pendingCollisionEvents = [];
  collisionEventHistory = [];
  /** One backend owns every derived shape; these maps are not a second world. */
  derivedBodies = /* @__PURE__ */ new Map();
  derivedCandidates = /* @__PURE__ */ new Map();
  pendingDerivedCandidates = /* @__PURE__ */ new Set();
  retiredDerivedBodies = [];
  derivedColliderToShape = /* @__PURE__ */ new Map();
  derivedConstraints = /* @__PURE__ */ new Map();
  derivedBodySources = /* @__PURE__ */ new Map();
  derivedPublications = /* @__PURE__ */ new Map();
  derivedFailures = /* @__PURE__ */ new Map();
  derivedContacts = [];
  derivedPoisonedEntities = /* @__PURE__ */ new Set();
  physicsOwner = {};
  candidateSequence = 0;
  derivedCandidateBytes = 0;
  backendGeneration = 1;
  fixedStep = 0;
  derivedPublicationPending = false;
  worldIdentity;
  activeDerivedAdmission;
  currentGravity;
  /**
   * Lazily-built Rapier KinematicCharacterController per character entity
   * (plan-strategy D-1/D-3). `moveAndSlide` creates one on first call; the
   * `Collider.onRemove` hook (registerPhysicsSystems) clears it on despawn.
   * Public so AC-11 despawn tests can assert `kccCache.size === 0`.
   */
  // biome-ignore lint/suspicious/noExplicitAny: Rapier KinematicCharacterController from dynamic module
  kccCache = /* @__PURE__ */ new Map();
  kccOffsets = /* @__PURE__ */ new Map();
  /**
   * ECS World + components wired in by `registerPhysicsSystems`, so
   * `moveAndSlide` can read CharacterController tuning and write Transform +
   * grounded back. Undefined until systems are registered — the input-validation
   * error paths (body / collider) fire before these are read, so direct
   * `pw.moveAndSlide()` calls in error tests need no World.
   */
  moveContext;
  /** Persistent ECS query + projection cursor for incremental backend sync. */
  syncState;
  disposed = false;
  constructor(rapier) {
    this.rapierModule = rapier;
    this.raw = new rapier.World({ x: 0, y: -9.81, z: 0 });
    this.eventQueue = new rapier.EventQueue(true);
    this.currentGravity = { x: 0, y: -9.81, z: 0 };
  }
  // ─── PhysicsWorld interface ────────────────────────────────────────────
  setGravity(gravity) {
    this.assertActive("setGravity");
    const x = gravity[0] ?? 0;
    const y = gravity[1] ?? 0;
    const z = gravity[2] ?? 0;
    this.raw.gravity = { x, y, z };
    this.currentGravity = { x, y, z };
  }
  getGravity() {
    const { x, y, z } = this.currentGravity;
    return vec3.create(x, y, z);
  }
  raycast(origin, direction, maxDist, filterMask) {
    this.assertActive("raycast");
    if (this.recoveryBlocked()) {
      throw new DerivedPhysicsError(
        "derived-recovery-invalid",
        "raycasts observe a complete healthy physics state",
        "rebuild the PhysicsWorld before querying after an unrecoverable admission",
        {}
      );
    }
    const RAPIER = this.rapierModule;
    const RayCtor = RAPIER.Ray;
    const ray = new RayCtor(
      { x: origin[0] ?? 0, y: origin[1] ?? 0, z: origin[2] ?? 0 },
      { x: direction[0] ?? 0, y: direction[1] ?? 0, z: direction[2] ?? 0 }
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
      point: vec3.create(point.x, point.y, point.z),
      normal: vec3.create(hit.normal.x, hit.normal.y, hit.normal.z),
      timeOfImpact: hit.timeOfImpact
    };
  }
  teleport(entity, position) {
    this.assertActive("teleport");
    this.pendingTeleports.set(entity, {
      x: position[0] ?? 0,
      y: position[1] ?? 0,
      z: position[2] ?? 0
    });
  }
  step(deltaTime) {
    this.assertActive("step");
    if (!Number.isFinite(deltaTime) || deltaTime <= 0 || deltaTime > PHYSICS_DT_MAX) return;
    try {
      this.raw.timestep = deltaTime;
      this.processDerivedCandidates();
      if (this.derivedPoisonedEntities.size > 0) return;
      this.raw.step(this.eventQueue);
      this.fixedStep = this.syncState?.world.getResource(FixedTime).tick ?? this.fixedStep + 1;
      this.drainRapierCollisionEvents();
      this.derivedPublicationPending = true;
      if (this.syncState === void 0) this.finalizeDerivedFixedStep();
    } catch (cause) {
      const error = new DerivedPhysicsError(
        "derived-backend-failed",
        "native fixed-step execution and publication complete together",
        "rebuild the World and PhysicsWorld from the last committed snapshot",
        { reason: cause instanceof Error ? cause.message : String(cause) }
      );
      for (const entity of this.entityMap.keys()) this.derivedPoisonedEntities.add(entity);
      this.derivedPublicationPending = false;
      this.derivedPublications.clear();
      for (const record of this.derivedCandidates.values()) {
        this.rememberDerivedFailure(record, error, "rebuild-required");
      }
      throw error;
    }
  }
  /** Publish only after the fixed-step ECS writeback/contact boundary. */
  finalizeDerivedFixedStep() {
    if (!this.derivedPublicationPending) return;
    this.derivedPublicationPending = false;
    if (this.derivedPoisonedEntities.size > 0) return;
    this.publishDerivedCandidates();
    this.retireDerivedBodies();
  }
  /**
   * Drain the Rapier event queue into `collisionPairs`. Each event names two
   * collider handles + a `started` flag; we resolve each collider to its owning
   * entity (collider.parent() -> body.userData) and add/remove the symmetric
   * pair. This is what populates `CollidingEntities` for sensor pickup + contact
   * queries (the queue is otherwise drained-on-overflow and never observed).
   */
  drainRapierCollisionEvents() {
    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      const a = this.colliderHandleToEntity(handle1);
      const b = this.colliderHandleToEntity(handle2);
      if (a === void 0 || b === void 0) return;
      const shapeA = this.derivedColliderToShape.get(handle1);
      const shapeB = this.derivedColliderToShape.get(handle2);
      this.recordContactObservation(
        {
          phase: started ? "started" : "stopped",
          fixedStep: this.fixedStep,
          entityA: a,
          entityB: b,
          ...shapeA === void 0 ? {} : { shapeA: shapeA.id },
          ...shapeB === void 0 ? {} : { shapeB: shapeB.id }
        },
        handle1,
        handle2
      );
      const changed = started ? this.addPair(a, b) : this.removePair(a, b);
      if (!changed) return;
      this.pushCollisionEvent({
        type: started ? "started" : "stopped",
        entityA: a,
        entityB: b,
        fixedStep: this.fixedStep,
        ...shapeA === void 0 ? {} : { shapeA: shapeA.id },
        ...shapeB === void 0 ? {} : { shapeB: shapeB.id }
      });
    });
  }
  recordContactObservation(observation, handleA, handleB) {
    let point;
    let normal;
    let geometricPoint;
    let geometricNormal;
    try {
      const colliderA = this.raw.getCollider(handleA);
      const colliderB = this.raw.getCollider(handleB);
      if (colliderA !== null && colliderB !== null) {
        this.raw.contactPair(
          colliderA,
          colliderB,
          (manifold, flipped) => {
            if (manifold.numSolverContacts() === 0 && geometricPoint === void 0 && manifold.numContacts() > 0) {
              const first = flipped ? colliderB : colliderA;
              const second = flipped ? colliderA : colliderB;
              const types = this.rapierModule.ShapeType;
              for (const [collider, local] of [
                [first, manifold.localContactPoint1(0)],
                [second, manifold.localContactPoint2(0)]
              ]) {
                if (local == null || ![types.Ball, types.Cuboid, types.Capsule].includes(collider.shapeType()))
                  continue;
                const rotation = collider.rotation();
                const rotated = quat.transformVec3(
                  vec3.create(),
                  [rotation.x, rotation.y, rotation.z, rotation.w],
                  [local.x, local.y, local.z]
                );
                const position = collider.translation();
                geometricPoint = [
                  rotated[0] + position.x,
                  rotated[1] + position.y,
                  rotated[2] + position.z
                ];
                const n = manifold.normal();
                const direction = flipped ? -1 : 1;
                geometricNormal = [n.x * direction, n.y * direction, n.z * direction];
                break;
              }
            }
            if (manifold.numSolverContacts?.() > 0) {
              const contact = manifold.solverContactPoint(0);
              const n = manifold.normal();
              if (contact !== null && contact !== void 0) {
                point = [contact.x, contact.y, contact.z];
              }
              if (n !== null && n !== void 0) {
                const direction = flipped ? -1 : 1;
                normal = [n.x * direction, n.y * direction, n.z * direction];
              }
            }
          }
        );
      }
    } catch {
    }
    if (point === void 0 && geometricPoint !== void 0) {
      point = geometricPoint;
      normal = geometricNormal;
    }
    this.derivedContacts.push({
      ...observation,
      ...point === void 0 ? {} : { point },
      ...normal === void 0 ? {} : { normal }
    });
    if (this.derivedContacts.length > 256)
      this.derivedContacts.splice(0, this.derivedContacts.length - 256);
  }
  /** Resolve a Rapier collider handle to its owning ECS entity, or undefined. */
  colliderHandleToEntity(colliderHandle) {
    const collider = this.raw.getCollider(colliderHandle);
    if (collider === null || collider === void 0) return void 0;
    const body = collider.parent();
    if (body === null || body === void 0) return void 0;
    return body.userData;
  }
  addPair(a, b) {
    let setA = this.collisionPairs.get(a);
    if (!setA) {
      setA = /* @__PURE__ */ new Set();
      this.collisionPairs.set(a, setA);
    }
    if (setA.has(b)) return false;
    setA.add(b);
    let setB = this.collisionPairs.get(b);
    if (!setB) {
      setB = /* @__PURE__ */ new Set();
      this.collisionPairs.set(b, setB);
    }
    setB.add(a);
    return true;
  }
  removePair(a, b) {
    const removedA = this.collisionPairs.get(a)?.delete(b) ?? false;
    const removedB = this.collisionPairs.get(b)?.delete(a) ?? false;
    return removedA || removedB;
  }
  pushCollisionEvent(event) {
    const ordered = event.entityA <= event.entityB ? event : {
      type: event.type,
      entityA: event.entityB,
      entityB: event.entityA,
      ...event.fixedStep === void 0 ? {} : { fixedStep: event.fixedStep },
      ...event.shapeB === void 0 ? {} : { shapeA: event.shapeB },
      ...event.shapeA === void 0 ? {} : { shapeB: event.shapeA }
    };
    this.pendingCollisionEvents.push(ordered);
    this.collisionEventHistory.push(ordered);
  }
  /**
   * Write the current overlap set into each entity's `CollidingEntities`
   * component (entities that carry it). Called by the PhysicsCollisionSync
   * system after writeback. Entities with no current overlaps get an empty set,
   * so a Core that the player has left clears correctly. Only entities that own
   * a CollidingEntities component are written (others are skipped).
   */
  writebackCollidingEntities(world, collidingComponent) {
    for (const [entity, others] of this.collisionPairs) {
      const handle = entity;
      if (!world.get(handle, collidingComponent).ok) continue;
      world.set(handle, collidingComponent, { entities: [...others] });
    }
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
  /** Detached fixed-step contact facts; no Rapier manifolds or handles escape. */
  getContactObservations() {
    if (this.recoveryBlocked()) return [];
    return this.derivedContacts.map((contact) => ({
      ...contact,
      ...contact.point === void 0 ? {} : { point: [...contact.point] },
      ...contact.normal === void 0 ? {} : { normal: [...contact.normal] }
    }));
  }
  /** Prepare disabled native Voxels for one entity without changing queries. */
  prepareDerivedShapeCandidate(input) {
    this.assertActive("prepareDerivedShapeCandidate");
    if (input.worldIdentity !== void 0 && input.worldIdentity !== this.worldIdentity) {
      return err(
        new DerivedPhysicsError(
          "derived-world-mismatch",
          "candidate belongs to the ECS World bound to this PhysicsWorld",
          "submit the candidate to the PhysicsWorld that owns its entity",
          { entity: input.entity }
        )
      );
    }
    if (!this.entityMap.has(input.entity)) {
      return err(
        new DerivedPhysicsError(
          "derived-body-not-found",
          "candidate entity has a committed body in this PhysicsWorld",
          "wait for physics reconciliation before preparing derived shapes",
          { entity: input.entity }
        )
      );
    }
    if (this.derivedPoisonedEntities.has(input.entity)) {
      return err(
        new DerivedPhysicsError(
          "derived-recovery-invalid",
          "the entity has a recoverable committed native PhysicsWorld state",
          "rebuild the PhysicsWorld from the last portable snapshot before retrying",
          { entity: input.entity }
        )
      );
    }
    const active = this.derivedBodies.get(input.entity);
    if (active !== void 0 && input.revision <= active.revision) {
      return err(
        new DerivedPhysicsError(
          "derived-candidate-stale",
          "candidate revision is newer than the committed derived shape revision",
          "read the latest publication and advance the consumer revision",
          { entity: input.entity, actual: input.revision, expected: `>${active.revision}` }
        )
      );
    }
    for (const pendingId of this.pendingDerivedCandidates) {
      const pending = this.derivedCandidates.get(pendingId);
      if (pending?.input.entity === input.entity) {
        return err(
          new DerivedPhysicsError(
            "derived-candidate-pending",
            "one body has at most one queued derived-shape candidate",
            "cancel or let the current candidate publish before preparing another",
            { entity: input.entity, candidateId: pendingId }
          )
        );
      }
    }
    const copied = cloneDerivedPhysicsInput(input);
    if (!copied.ok) return copied;
    const mass = validateMassProperties(copied.value.massProperties);
    if (!mass.ok) return mass;
    const body = this.bodyForEntity(input.entity);
    if (body === void 0) {
      return err(
        new DerivedPhysicsError(
          "derived-body-not-found",
          "candidate entity resolves to a live native body",
          "wait for the next ECS physics sync",
          { entity: input.entity }
        )
      );
    }
    if (this.derivedCandidates.size >= DERIVED_PHYSICS_LIMITS.maxCandidates) {
      return err(
        new DerivedPhysicsError(
          "derived-candidate-budget-exceeded",
          `this PhysicsWorld keeps at most ${DERIVED_PHYSICS_LIMITS.maxCandidates} candidates`,
          "cancel or publish an existing candidate before preparing another",
          { entity: input.entity, actual: this.derivedCandidates.size }
        )
      );
    }
    const candidateInput = Object.freeze({
      ...copied.value,
      ...mass.value === void 0 ? {} : { massProperties: mass.value }
    });
    const privateInput = cloneDerivedPhysicsInput(candidateInput);
    if (!privateInput.ok) return privateInput;
    const publicInput = cloneDerivedPhysicsInput(privateInput.value);
    if (!publicInput.ok) return publicInput;
    const nativeColliders = [];
    try {
      for (const shape of privateInput.value.shapes) {
        const collider = this.createDerivedCollider(body, shape);
        nativeColliders.push({ handle: collider.handle });
      }
    } catch (cause) {
      for (const collider of nativeColliders) this.removeNativeCollider(collider.handle);
      return err(
        new DerivedPhysicsError(
          "derived-backend-failed",
          "Rapier can create every candidate voxel collider while it remains disabled",
          "reduce the candidate or rebuild the PhysicsWorld after a native failure",
          { entity: input.entity, reason: cause instanceof Error ? cause.message : String(cause) }
        )
      );
    }
    const candidateBytes = estimateDerivedPhysicsInputBytes(privateInput.value);
    if (this.derivedCandidateBytes + candidateBytes > DERIVED_PHYSICS_LIMITS.maxCandidateBytes) {
      for (const collider of nativeColliders) this.removeNativeCollider(collider.handle);
      return err(
        new DerivedPhysicsError(
          "derived-candidate-budget-exceeded",
          `staged candidate bytes remain within ${DERIVED_PHYSICS_LIMITS.maxCandidateBytes}`,
          "cancel or retire an in-flight candidate before retrying",
          { entity: input.entity, actual: this.derivedCandidateBytes + candidateBytes }
        )
      );
    }
    const candidateId = `derived:${this.backendGeneration}:${input.entity}:${++this.candidateSequence}:${input.revision}`;
    const token = Object.freeze({
      candidateId,
      generation: this.backendGeneration,
      owner: this.physicsOwner,
      input: publicInput.value,
      state: "ready"
    });
    this.derivedCandidates.set(candidateId, {
      token,
      nativeColliders,
      input: privateInput.value,
      bytes: candidateBytes,
      state: "ready"
    });
    this.derivedCandidateBytes += candidateBytes;
    return ok(token);
  }
  /** Queue a prepared candidate for the next call to `step()`. */
  admitDerivedShapeCandidate(candidate, commitGeometry) {
    const admitted = this.admitDerivedShapeCandidateInternal(candidate);
    if (admitted.ok && commitGeometry !== void 0) {
      const record = this.derivedCandidates.get(candidate.candidateId);
      if (record !== void 0) record.commitGeometry = commitGeometry;
    }
    return admitted;
  }
  admitDerivedShapeCandidates(candidates, commitGeometry) {
    this.assertActive("admitDerivedShapeCandidates");
    const records = [];
    const sources = /* @__PURE__ */ new Map();
    const constraints = /* @__PURE__ */ new Set();
    const invalid = (reason) => new DerivedPhysicsError(
      "derived-candidate-invalid",
      "one bounded admission contains distinct prepared bodies and constraint updates",
      "prepare one candidate per body and submit the complete replacement together",
      { reason }
    );
    if (candidates.length === 0 || candidates.length > DERIVED_PHYSICS_LIMITS.maxCandidates)
      return err(invalid("invalid batch size"));
    for (const candidate of candidates) {
      const record = this.derivedCandidates.get(candidate.candidateId);
      if (record === void 0 || candidate.owner !== this.physicsOwner || candidate.generation !== this.backendGeneration || record.state !== "ready")
        return err(invalid("batch member is not a current prepared candidate"));
      if (sources.has(record.input.entity)) return err(invalid("duplicate body"));
      for (const constraint of record.input.constraints ?? []) {
        if (constraints.has(constraint.id)) return err(invalid("duplicate constraint update"));
        constraints.add(constraint.id);
      }
      records.push(record);
      sources.set(record.input.entity, {
        sourceKey: record.input.sourceKey,
        revision: record.input.revision
      });
    }
    for (const candidate of candidates) {
      const checked = this.admitDerivedShapeCandidateInternal(candidate, sources, true);
      if (!checked.ok) {
        for (const record of records) {
          if (this.derivedCandidates.has(record.token.candidateId))
            this.rejectPreparedCandidate(record, checked.error);
        }
        return checked;
      }
    }
    const batch = Object.freeze({
      records: Object.freeze(records),
      ...commitGeometry === void 0 ? {} : { commitGeometry }
    });
    for (const record of records) record.batch = batch;
    const queued = [];
    for (const candidate of candidates) {
      const admitted = this.admitDerivedShapeCandidateInternal(candidate, sources);
      if (!admitted.ok) {
        const first = records[0];
        if (first !== void 0) this.rejectPreparedCandidate(first, admitted.error);
        return admitted;
      }
      queued.push(admitted.value);
    }
    return ok(Object.freeze(queued));
  }
  getDerivedAdmission(entity) {
    const active = this.activeDerivedAdmission;
    const record = entity === void 0 ? active : active?.batch?.records.find((item) => item.input.entity === entity) ?? (active?.input.entity === entity ? active : void 0);
    if (record === void 0) return void 0;
    return {
      entity: record.input.entity,
      revision: record.input.revision,
      fixedStep: this.syncState?.world.getResource(FixedTime).tick ?? this.fixedStep + 1
    };
  }
  admitDerivedShapeCandidateInternal(candidate, sourceOverrides, validateOnly = false) {
    this.assertActive("admitDerivedShapeCandidate");
    const record = this.derivedCandidates.get(candidate.candidateId);
    if (record === void 0 || candidate.owner !== this.physicsOwner || record.token.owner !== candidate.owner || candidate.generation !== this.backendGeneration) {
      return err(
        new DerivedPhysicsError(
          "derived-candidate-not-found",
          "candidate belongs to the current PhysicsWorld generation",
          "discard stale candidate credentials and prepare from committed input again",
          { candidateId: candidate.candidateId }
        )
      );
    }
    if (this.derivedPoisonedEntities.has(record?.input.entity ?? -1)) {
      return err(
        new DerivedPhysicsError(
          "derived-recovery-invalid",
          "the candidate entity is stopped after an unrecoverable native admission failure",
          "rebuild the PhysicsWorld from its portable snapshot before retrying",
          { entity: record?.input.entity, candidateId: candidate.candidateId }
        )
      );
    }
    if (record.state === "cancelled" || record.state === "invalidated") {
      return err(
        new DerivedPhysicsError(
          "derived-candidate-cancelled",
          "candidate has not been cancelled or invalidated",
          "prepare a new candidate from the latest committed revision",
          { candidateId: candidate.candidateId }
        )
      );
    }
    if (record.state !== "ready") {
      return err(
        new DerivedPhysicsError(
          "derived-candidate-pending",
          "a prepared candidate is admitted at most once",
          "retain the returned queued receipt and wait for fixed-step publication",
          { candidateId: candidate.candidateId }
        )
      );
    }
    const pendingSources = this.pendingDerivedSources();
    if (sourceOverrides !== void 0) {
      for (const [entity, source] of sourceOverrides) pendingSources.set(entity, source);
    }
    pendingSources.set(record.input.entity, {
      sourceKey: record.input.sourceKey,
      revision: record.input.revision
    });
    const admissionError = this.validateDerivedAdmission(record.input, pendingSources);
    if (admissionError !== void 0) {
      this.rejectPreparedCandidate(record, admissionError);
      return err(admissionError);
    }
    const active = this.derivedBodies.get(record.input.entity);
    if (active !== void 0 && record.input.revision <= active.revision) {
      const stale = new DerivedPhysicsError(
        "derived-candidate-stale",
        "candidate revision is newer than the committed shape revision",
        "advance the consumer revision before admission",
        { entity: record.input.entity, candidateId: candidate.candidateId }
      );
      this.rejectPreparedCandidate(record, stale);
      return err(stale);
    }
    const newestPendingRevision = this.newestPendingRevision(record.input.entity);
    if (newestPendingRevision !== void 0 && record.input.revision <= newestPendingRevision) {
      const stale = new DerivedPhysicsError(
        "derived-candidate-stale",
        "candidate revision advances every already queued revision for the body",
        "admit only the newest body revision at a fixed-step boundary",
        {
          entity: record.input.entity,
          candidateId: candidate.candidateId,
          expected: `>${newestPendingRevision}`,
          actual: record.input.revision
        }
      );
      this.rejectPreparedCandidate(record, stale);
      return err(stale);
    }
    if (validateOnly) return ok(record.token);
    record.state = "queued";
    this.pendingDerivedCandidates.add(candidate.candidateId);
    const queued = Object.freeze({ ...record.token, state: "queued" });
    record.token = queued;
    let changed = true;
    while (changed) {
      changed = false;
      const projectedSources = new Map(sourceOverrides ?? []);
      for (const [entity, source] of this.pendingDerivedSources()) {
        const current = projectedSources.get(entity);
        if (current === void 0 || source.revision > current.revision)
          projectedSources.set(entity, source);
      }
      for (const queuedId of [...this.pendingDerivedCandidates]) {
        const queuedRecord = this.derivedCandidates.get(queuedId);
        if (queuedRecord?.state !== "queued") continue;
        const projected = projectedSources.get(queuedRecord.input.entity);
        const staleRevision = projected !== void 0 && queuedRecord.input.revision < projected.revision;
        const dependencyError = staleRevision ? new DerivedPhysicsError(
          "derived-candidate-stale",
          "queued candidates publish only the final revision submitted for an entity",
          "discard the older queued candidate and submit one complete revision",
          {
            entity: queuedRecord.input.entity,
            candidateId: queuedRecord.token.candidateId,
            expected: `>=${projected.revision}`,
            actual: queuedRecord.input.revision
          }
        ) : this.validateDerivedAdmission(queuedRecord.input, projectedSources);
        if (dependencyError === void 0) continue;
        this.rejectPreparedCandidate(queuedRecord, dependencyError);
        changed = true;
        if (queuedId === candidate.candidateId) return err(dependencyError);
      }
    }
    return ok(queued);
  }
  /** Cancel candidate-native resources; the committed state remains untouched. */
  cancelDerivedShapeCandidate(candidate) {
    this.assertActive("cancelDerivedShapeCandidate");
    const record = this.derivedCandidates.get(candidate.candidateId);
    if (record === void 0 || candidate.owner !== this.physicsOwner) {
      return err(
        new DerivedPhysicsError(
          "derived-candidate-not-found",
          "candidate belongs to the current PhysicsWorld",
          "ignore already-retired credentials and prepare again when needed",
          { candidateId: candidate.candidateId }
        )
      );
    }
    if (record.state === "published") {
      return err(
        new DerivedPhysicsError(
          "derived-candidate-cancelled",
          "a published candidate remains the committed result until replaced",
          "submit a newer candidate instead of cancelling committed state",
          { candidateId: candidate.candidateId }
        )
      );
    }
    for (const member of record.batch?.records ?? [record]) {
      this.pendingDerivedCandidates.delete(member.token.candidateId);
      for (const collider of member.nativeColliders) this.removeNativeCollider(collider.handle);
      member.state = "cancelled";
      this.releaseDerivedCandidate(member.token.candidateId);
    }
    return ok(void 0);
  }
  /** Reject all in-flight derived work while preserving the last publication. */
  invalidateDerivedShapeCandidates(reason = "consumer-invalidated") {
    const committedCandidateIds = new Set(
      [...this.derivedBodies.values()].map((body) => body.candidateId)
    );
    for (const [id, record] of this.derivedCandidates) {
      if (record.state === "published" || committedCandidateIds.has(id)) continue;
      record.state = "invalidated";
      for (const collider of record.nativeColliders) this.removeNativeCollider(collider.handle);
      this.releaseDerivedCandidate(id);
    }
    this.pendingDerivedCandidates.clear();
  }
  getDerivedPublication(entity) {
    this.assertActive("getDerivedPublication");
    if (this.recoveryBlocked()) return void 0;
    const publication = this.derivedPublications.get(entity);
    return publication === void 0 ? void 0 : { ...publication, shapeIds: [...publication.shapeIds] };
  }
  getDerivedFailure(entity) {
    const failure = this.derivedFailures.get(entity);
    return failure === void 0 ? void 0 : { ...failure };
  }
  getDerivedBodyType(entity) {
    this.assertActive("getDerivedBodyType");
    if (this.recoveryBlocked()) return void 0;
    const body = this.bodyForEntity(entity);
    if (body === void 0) return void 0;
    return rapierBodyTypeToString(this.rapierModule, body.bodyType());
  }
  getDerivedBodyMass(entity) {
    this.assertActive("getDerivedBodyMass");
    if (this.recoveryBlocked()) return void 0;
    const body = this.bodyForEntity(entity);
    return body === void 0 ? void 0 : body.mass();
  }
  getDerivedMotion(entity) {
    this.assertActive("getDerivedMotion");
    if (this.recoveryBlocked() || !this.derivedBodies.has(entity)) return void 0;
    const body = this.bodyForEntity(entity);
    if (body === void 0) return void 0;
    const com = body.worldCom();
    const linear = body.linvel();
    const angular = body.angvel();
    const rotation = body.rotation();
    return Object.freeze({
      centerOfMass: [com.x, com.y, com.z],
      linearVelocity: [linear.x, linear.y, linear.z],
      angularVelocity: [angular.x, angular.y, angular.z],
      rotation: [rotation.x, rotation.y, rotation.z, rotation.w]
    });
  }
  applyDerivedImpulse(input) {
    this.assertActive("applyDerivedImpulse");
    const refuse = (code, expected) => err(
      new DerivedPhysicsError(
        code,
        expected,
        "read the committed dynamic body and submit a finite impulse outside pending admission",
        { entity: input.entity }
      )
    );
    if (this.recoveryBlocked())
      return refuse("derived-recovery-invalid", "PhysicsWorld is healthy");
    const record = this.derivedBodies.get(input.entity);
    const body = this.bodyForEntity(input.entity);
    if (record === void 0 || body === void 0)
      return refuse("derived-body-not-found", "a committed derived body exists");
    if (record.sourceKey !== input.sourceKey || record.revision !== input.revision)
      return refuse(
        "derived-candidate-stale",
        "impulse identity matches the committed body revision"
      );
    if (this.derivedPublicationPending || [...this.pendingDerivedCandidates].some(
      (id) => this.derivedCandidates.get(id)?.input.entity === input.entity
    ))
      return refuse("derived-candidate-pending", "the body has no unpublished native mutation");
    if (rapierBodyTypeToString(this.rapierModule, body.bodyType()) !== "dynamic" || ![input.impulse, input.point].every(
      (vector) => Array.isArray(vector) && vector.length === 3 && vector.every((value) => Number.isFinite(value) && Number.isFinite(Math.fround(value)))
    ))
      return refuse(
        "derived-candidate-invalid",
        "a dynamic body receives finite Float32 world vectors"
      );
    try {
      body.applyImpulseAtPoint(
        { x: input.impulse[0], y: input.impulse[1], z: input.impulse[2] },
        { x: input.point[0], y: input.point[1], z: input.point[2] },
        true
      );
      const linear = body.linvel(), angular = body.angvel();
      if (![linear.x, linear.y, linear.z, angular.x, angular.y, angular.z].every(Number.isFinite))
        throw new Error("native impulse produced non-finite motion");
      return ok(void 0);
    } catch (cause) {
      this.derivedPoisonedEntities.add(input.entity);
      return err(
        new DerivedPhysicsError(
          "derived-backend-failed",
          "native impulse completes with finite motion",
          "rebuild the World from a previously committed snapshot",
          { entity: input.entity, reason: cause instanceof Error ? cause.message : String(cause) }
        )
      );
    }
  }
  getDerivedRecoveryState() {
    return this.recoveryBlocked() ? "rebuild-required" : "ready";
  }
  getDerivedShapes(entity) {
    this.assertActive("getDerivedShapes");
    if (this.recoveryBlocked()) return [];
    const body = this.derivedBodies.get(entity);
    if (body === void 0) return [];
    return body.shapes.map((shape) => ({
      id: shape.input.id,
      revision: shape.input.revision,
      entity,
      voxelSize: [...shape.input.voxelSize],
      origin: [...shape.input.origin],
      rotation: [...shape.input.rotation],
      generation: body.generation
    }));
  }
  captureDerivedPhysicsState() {
    this.assertActive("captureDerivedPhysicsState");
    return Object.freeze({
      generation: this.backendGeneration,
      fixedStep: this.fixedStep,
      bodies: Object.freeze(
        [...this.derivedBodies.values()].map((body) => ({
          entity: body.entity,
          revision: body.revision,
          sourceKey: body.sourceKey,
          ...body.bodyType === void 0 ? {} : { bodyType: body.bodyType },
          ...body.velocityPolicy === void 0 ? {} : { velocityPolicy: body.velocityPolicy },
          shapes: Object.freeze(
            body.shapes.map((shape) => ({
              ...shape.input,
              cells: new Int32Array(shape.input.cells),
              voxelSize: [...shape.input.voxelSize],
              origin: [...shape.input.origin],
              rotation: [...shape.input.rotation]
            }))
          ),
          seams: Object.freeze(
            body.seams.map((seam) => ({ ...seam, offset: [...seam.offset] }))
          ),
          ...body.massProperties === void 0 ? {} : { massProperties: body.massProperties },
          ...(() => {
            const motion = this.getDerivedMotion(body.entity);
            return motion === void 0 ? {} : { motion };
          })(),
          constraints: Object.freeze(this.constraintsForBody(body.entity))
        }))
      )
    });
  }
  restoreDerivedPhysicsState(snapshot) {
    this.assertActive("restoreDerivedPhysicsState");
    const snapshotSources = /* @__PURE__ */ new Map();
    for (const body of snapshot.bodies) {
      if (snapshotSources.has(body.entity)) {
        return err(
          new DerivedPhysicsError(
            "derived-candidate-invalid",
            "a portable snapshot contains one committed body row per entity",
            "capture the snapshot from one PhysicsWorld without duplicate entities",
            { entity: body.entity }
          )
        );
      }
      snapshotSources.set(body.entity, {
        sourceKey: body.sourceKey,
        revision: body.revision
      });
    }
    const preparedCandidates = [];
    const restoredConstraintIds = /* @__PURE__ */ new Set();
    for (const body of snapshot.bodies) {
      const prepared = this.prepareDerivedShapeCandidate({
        entity: body.entity,
        revision: body.revision,
        sourceKey: body.sourceKey,
        shapes: body.shapes,
        ...body.seams === void 0 || body.seams.length === 0 ? {} : { seams: body.seams },
        ...body.bodyType === void 0 ? {} : { bodyType: body.bodyType },
        ...body.velocityPolicy === void 0 ? {} : { velocityPolicy: body.velocityPolicy },
        ...body.motion === void 0 ? {} : { motion: body.motion },
        ...body.massProperties === void 0 ? {} : { massProperties: body.massProperties },
        constraints: body.constraints.filter((constraint) => {
          if (restoredConstraintIds.has(constraint.id)) return false;
          restoredConstraintIds.add(constraint.id);
          return true;
        })
      });
      if (!prepared.ok) {
        for (const candidate of preparedCandidates) this.cancelDerivedShapeCandidate(candidate);
        return prepared;
      }
      preparedCandidates.push(prepared.value);
    }
    if (preparedCandidates.length === 0) return ok([]);
    return this.admitDerivedShapeCandidates(preparedCandidates);
  }
  createDerivedConstraint(input) {
    return this.installDerivedConstraint(input, false);
  }
  updateDerivedConstraint(input) {
    return this.installDerivedConstraint(input, true);
  }
  removeDerivedConstraint(id) {
    this.assertActive("removeDerivedConstraint");
    const existing = this.derivedConstraints.get(id);
    if (existing === void 0) {
      return err(
        new DerivedPhysicsError(
          "derived-constraint-not-found",
          "constraint identity is currently committed",
          "ignore repeated cleanup or reconcile the owning constraint set",
          { constraintId: id }
        )
      );
    }
    this.removeNativeConstraint(existing.handle);
    this.derivedConstraints.delete(id);
    return ok(void 0);
  }
  createDerivedCollider(body, shape) {
    const RAPIER = this.rapierModule;
    const desc = RAPIER.ColliderDesc.voxels(
      shape.cells instanceof Int32Array ? new Int32Array(shape.cells) : new Int32Array(shape.cells.flat()),
      { x: shape.voxelSize[0], y: shape.voxelSize[1], z: shape.voxelSize[2] }
    ).setTranslation(shape.origin?.[0] ?? 0, shape.origin?.[1] ?? 0, shape.origin?.[2] ?? 0).setRotation({
      x: shape.rotation?.[0] ?? 0,
      y: shape.rotation?.[1] ?? 0,
      z: shape.rotation?.[2] ?? 0,
      w: shape.rotation?.[3] ?? 1
    }).setFriction(shape.friction ?? 0.5).setRestitution(shape.restitution ?? 0).setDensity(0).setCollisionGroups(shape.collisionGroups ?? 4294967295).setSolverGroups(shape.solverGroups ?? 4294967295).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS).setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL).setEnabled(false);
    if (shape.isSensor === true) desc.setSensor(true);
    const collider = this.raw.createCollider(desc, body);
    this.derivedColliderToShape.set(collider.handle, { entity: body.userData, id: shape.id });
    return collider;
  }
  removeNativeCollider(handle) {
    this.derivedColliderToShape.delete(handle);
    try {
      const collider = this.raw.getCollider(handle);
      if (collider !== null && collider !== void 0) {
        this.raw.removeCollider(collider, false);
      }
    } catch {
    }
  }
  createNativeConstraint(input) {
    let native;
    try {
      const RAPIER = this.rapierModule;
      const bodyA = this.bodyForEntity(input.bodyA);
      const bodyB = this.bodyForEntity(input.bodyB);
      if (bodyA === void 0 || bodyB === void 0) {
        return err(
          new DerivedPhysicsError(
            "derived-body-not-found",
            "both constraint endpoints have committed bodies in this PhysicsWorld",
            "reconcile both entities before creating the constraint",
            { constraintId: input.id }
          )
        );
      }
      const anchorA = { x: input.anchorA[0], y: input.anchorA[1], z: input.anchorA[2] };
      const anchorB = { x: input.anchorB[0], y: input.anchorB[1], z: input.anchorB[2] };
      const jointData = input.kind === "spring" ? RAPIER.JointData.spring(
        input.restLength,
        input.stiffness,
        input.damping,
        anchorA,
        anchorB
      ) : RAPIER.JointData.revolute(anchorA, anchorB, {
        x: input.axis[0],
        y: input.axis[1],
        z: input.axis[2]
      });
      native = this.raw.createImpulseJoint(jointData, bodyA, bodyB, true);
      if (input.kind === "hinge" && input.limits !== void 0)
        native.setLimits(input.limits[0], input.limits[1]);
      return ok({ handle: native.handle });
    } catch (cause) {
      if (native !== void 0) this.removeNativeConstraint(native.handle);
      return err(
        new DerivedPhysicsError(
          "derived-backend-failed",
          "the selected Rapier joint can be created for both endpoint bodies",
          "repair endpoint state or use a supported spring/hinge input",
          {
            constraintId: input.id,
            reason: cause instanceof Error ? cause.message : String(cause)
          }
        )
      );
    }
  }
  rememberDerivedFailure(record, error, recovery) {
    record.state = "failed";
    this.pendingDerivedCandidates.delete(record.token.candidateId);
    this.derivedFailures.set(
      record.input.entity,
      Object.freeze({
        candidateId: record.token.candidateId,
        entity: record.input.entity,
        revision: record.input.revision,
        fixedStep: this.fixedStep,
        error,
        recovery
      })
    );
    this.releaseDerivedCandidate(record.token.candidateId);
  }
  rejectPreparedCandidate(record, error) {
    for (const member of record.batch?.records ?? [record]) {
      if (!this.derivedCandidates.has(member.token.candidateId)) continue;
      for (const collider of member.nativeColliders) this.removeNativeCollider(collider.handle);
      this.rememberDerivedFailure(member, error, "old-state-retained");
    }
  }
  processDerivedCandidates() {
    if (this.pendingDerivedCandidates.size === 0) return;
    const pendingRecords = [...this.pendingDerivedCandidates].map((id) => this.derivedCandidates.get(id)).filter((record) => record?.state === "queued");
    const pendingByEntity = /* @__PURE__ */ new Map();
    for (const record of pendingRecords) {
      const current = pendingByEntity.get(record.input.entity);
      if (current === void 0 || record.input.revision > current.input.revision) {
        pendingByEntity.set(record.input.entity, record);
      }
    }
    const ordered = [];
    const visiting = /* @__PURE__ */ new Set();
    const visited = /* @__PURE__ */ new Set();
    const visit = (record) => {
      const group = record.batch?.records ?? [record];
      const key = group[0]?.token.candidateId ?? record.token.candidateId;
      if (visited.has(key)) return;
      if (visiting.has(key)) {
        this.rejectPreparedCandidate(
          record,
          new DerivedPhysicsError(
            "derived-constraint-invalid",
            "cyclic endpoint updates share one batch",
            "submit mutually dependent body replacements together",
            { candidateId: key }
          )
        );
        return;
      }
      visiting.add(key);
      for (const member of group) {
        for (const constraint of member.input.constraints ?? []) {
          for (const [entity, dependency] of [
            [constraint.bodyA, constraint.bodyASource],
            [constraint.bodyB, constraint.bodyBSource]
          ]) {
            const target = pendingByEntity.get(entity);
            if (target !== void 0 && !group.includes(target) && target.input.sourceKey === dependency.sourceKey && target.input.revision === dependency.revision)
              visit(target);
          }
        }
      }
      visiting.delete(key);
      visited.add(key);
      ordered.push(group);
    };
    for (const record of pendingRecords) visit(record);
    for (const group of ordered) {
      if (this.derivedPoisonedEntities.size > 0) break;
      const first = group[0];
      if (first === void 0) continue;
      if (group.some(
        (record) => record.state !== "queued" || !this.pendingDerivedCandidates.has(record.token.candidateId)
      ))
        continue;
      const sources = this.pendingDerivedSources();
      let rejected;
      for (const record of group) {
        const projected = sources.get(record.input.entity);
        if (projected !== void 0 && record.input.revision < projected.revision) {
          rejected = new DerivedPhysicsError(
            "derived-candidate-stale",
            "fixed-step admission publishes the final queued body revisions",
            "discard the older group and prepare a complete replacement",
            { entity: record.input.entity }
          );
        } else if (this.derivedPoisonedEntities.has(record.input.entity)) {
          rejected = new DerivedPhysicsError(
            "derived-recovery-invalid",
            "every batch body has recoverable native state",
            "rebuild the PhysicsWorld before retrying",
            { entity: record.input.entity }
          );
        } else if (this.bodyForEntity(record.input.entity) === void 0) {
          rejected = new DerivedPhysicsError(
            "derived-body-not-found",
            "every batch body remains live through admission",
            "reconcile entities and prepare again",
            { entity: record.input.entity }
          );
        } else rejected = this.validateDerivedAdmission(record.input, sources);
        if (rejected !== void 0) break;
      }
      if (rejected !== void 0) {
        this.rejectPreparedCandidate(first, rejected);
        continue;
      }
      const undos = [];
      for (const record of group) {
        const id = record.token.candidateId;
        const old = this.derivedBodies.get(record.input.entity);
        const body = this.bodyForEntity(record.input.entity);
        const oldBodyType = body.bodyType();
        const oldBodyEnabled = body.isEnabled();
        const oldVelocity = body.linvel();
        const oldAngularVelocity = body.angvel();
        const oldTranslation = body.translation();
        const oldRotation = body.rotation();
        const oldCom = body.worldCom();
        const oldMass = body.mass();
        const oldAutomaticAdditionalMass = this.entityMap.get(record.input.entity)?.automaticAdditionalMass ?? 0;
        const oldAutomaticRecordMass = this.entityMap.get(
          record.input.entity
        )?.automaticAdditionalMass;
        const oldSource = this.derivedBodySources.get(record.input.entity);
        const oldPublication = this.derivedPublications.get(record.input.entity);
        const oldDensities = this.bodyColliders(body).map((collider) => ({
          collider,
          density: typeof collider.density === "function" ? collider.density() : void 0,
          enabled: typeof collider.isEnabled === "function" ? collider.isEnabled() : true
        }));
        const oldConstraints = new Map(this.derivedConstraints);
        const stagedConstraints = /* @__PURE__ */ new Map();
        let geometryCommitUncertain = false;
        const rollback = () => {
          for (const staged of stagedConstraints.values())
            this.removeNativeConstraint(staged.handle);
          for (const current of this.derivedConstraints.values())
            this.removeNativeConstraint(current.handle);
          this.derivedConstraints.clear();
          if (old !== void 0) {
            for (const shape of old.shapes) {
              const collider = this.raw.getCollider(shape.colliderHandle);
              if (collider !== null && collider !== void 0) collider.setEnabled(true);
            }
            const retiredIndex = this.retiredDerivedBodies.indexOf(old);
            if (retiredIndex >= 0) this.retiredDerivedBodies.splice(retiredIndex, 1);
            this.derivedBodies.set(record.input.entity, old);
            this.derivedBodySources.set(record.input.entity, {
              sourceKey: old.sourceKey,
              revision: old.revision
            });
          }
          for (const native of record.nativeColliders) {
            const collider = this.raw.getCollider(native.handle);
            if (collider !== null && collider !== void 0) collider.setEnabled(false);
          }
          for (const native of record.nativeColliders) this.removeNativeCollider(native.handle);
          for (const { collider, density, enabled } of oldDensities) {
            if (this.raw.getCollider(collider.handle) === null) continue;
            if (density !== void 0 && typeof collider.setDensity === "function")
              collider.setDensity(density);
            if (typeof collider.setEnabled === "function") collider.setEnabled(enabled);
          }
          let restored = true;
          try {
            body.setBodyType(oldBodyType, true);
            this.restoreCommittedMass(body, old, oldAutomaticAdditionalMass);
            body.setTranslation(oldTranslation, true);
            body.setRotation(oldRotation, true);
            body.setLinvel(oldVelocity, true);
            body.setAngvel(oldAngularVelocity, true);
            body.setEnabled(oldBodyEnabled);
          } catch {
            restored = false;
          }
          if (restored && !this.restoreNativeConstraints(oldConstraints)) restored = false;
          if (restored) {
            const currentMass = body.mass();
            const currentCom = body.worldCom();
            const currentVelocity = body.linvel();
            const currentAngularVelocity = body.angvel();
            const currentRotation = body.rotation();
            restored = Number.isFinite(currentMass) && Math.abs(currentMass - oldMass) <= 1e-6 * Math.max(1, Math.abs(oldMass)) && Math.abs(currentCom.x - oldCom.x) <= 1e-6 && Math.abs(currentCom.y - oldCom.y) <= 1e-6 && Math.abs(currentCom.z - oldCom.z) <= 1e-6 && Math.abs(currentVelocity.x - oldVelocity.x) <= 1e-6 && Math.abs(currentVelocity.y - oldVelocity.y) <= 1e-6 && Math.abs(currentVelocity.z - oldVelocity.z) <= 1e-6 && Math.abs(currentAngularVelocity.x - oldAngularVelocity.x) <= 1e-6 && Math.abs(currentAngularVelocity.y - oldAngularVelocity.y) <= 1e-6 && Math.abs(currentAngularVelocity.z - oldAngularVelocity.z) <= 1e-6 && Math.abs(
              currentRotation.x * oldRotation.x + currentRotation.y * oldRotation.y + currentRotation.z * oldRotation.z + currentRotation.w * oldRotation.w
            ) >= 1 - 1e-6 && body.bodyType() === oldBodyType && body.isEnabled() === oldBodyEnabled;
          }
          if (old === void 0) this.derivedBodies.delete(record.input.entity);
          else this.derivedBodies.set(record.input.entity, old);
          if (oldSource === void 0) this.derivedBodySources.delete(record.input.entity);
          else this.derivedBodySources.set(record.input.entity, oldSource);
          if (oldPublication === void 0) this.derivedPublications.delete(record.input.entity);
          else this.derivedPublications.set(record.input.entity, oldPublication);
          const entityRecord = this.entityMap.get(record.input.entity);
          if (entityRecord !== void 0 && oldAutomaticRecordMass !== void 0)
            entityRecord.automaticAdditionalMass = oldAutomaticRecordMass;
          return restored;
        };
        const restore = (undo) => {
          try {
            return undo();
          } catch {
            return false;
          }
        };
        try {
          for (const constraint of record.input.constraints ?? []) {
            const created = this.createNativeConstraint(constraint);
            if (!created.ok) throw created.error;
            stagedConstraints.set(constraint.id, {
              input: { ...constraint },
              handle: created.value.handle
            });
          }
          if (record.input.bodyType !== void 0) {
            const RAPIER = this.rapierModule;
            const bodyType = record.input.bodyType === "static" ? RAPIER.RigidBodyType.Fixed : record.input.bodyType === "kinematic" ? RAPIER.RigidBodyType.KinematicPositionBased : RAPIER.RigidBodyType.Dynamic;
            body.setBodyType(bodyType, true);
          }
          for (const native of record.nativeColliders) {
            const collider = this.raw.getCollider(native.handle);
            if (collider === null || collider === void 0)
              throw new Error("candidate collider disappeared");
            collider.setEnabled(true);
          }
          const nativeById = new Map(
            record.input.shapes.map((shape, index) => [
              shape.id,
              record.nativeColliders[index]?.handle
            ])
          );
          for (const seam of record.input.seams ?? []) {
            const firstHandle = nativeById.get(seam.shapeA);
            const secondHandle = nativeById.get(seam.shapeB);
            const first2 = firstHandle === void 0 ? void 0 : this.raw.getCollider(firstHandle);
            const second = secondHandle === void 0 ? void 0 : this.raw.getCollider(secondHandle);
            if (first2 === void 0 || second === void 0 || first2 === null || second === null) {
              throw new Error(`derived seam references missing shape ${seam.shapeA}`);
            }
            first2.combineVoxelStates(second, seam.offset[0], seam.offset[1], seam.offset[2]);
          }
          if (record.input.motion?.rotation !== void 0) {
            const [x, y, z, w] = record.input.motion.rotation;
            body.setRotation({ x, y, z, w }, true);
          }
          this.applyDerivedMass(
            body,
            record.input.massProperties,
            oldCom,
            record.input.velocityPolicy ?? "preserve",
            this.entityMap.get(record.input.entity)?.additionalMass ?? 0,
            record.input.entity,
            record.input.shapes,
            record.nativeColliders
          );
          if (record.input.motion !== void 0) {
            const currentCom = body.worldCom();
            const targetCom = record.input.motion.centerOfMass;
            const translation = body.translation();
            body.setTranslation(
              {
                x: translation.x + targetCom[0] - currentCom.x,
                y: translation.y + targetCom[1] - currentCom.y,
                z: translation.z + targetCom[2] - currentCom.z
              },
              true
            );
            body.setLinvel(
              {
                x: record.input.motion.linearVelocity[0],
                y: record.input.motion.linearVelocity[1],
                z: record.input.motion.linearVelocity[2]
              },
              true
            );
            body.setAngvel(
              {
                x: record.input.motion.angularVelocity[0],
                y: record.input.motion.angularVelocity[1],
                z: record.input.motion.angularVelocity[2]
              },
              true
            );
          }
          const committedSources = new Map(this.derivedBodySources);
          committedSources.set(record.input.entity, {
            sourceKey: record.input.sourceKey,
            revision: record.input.revision
          });
          const replacementConstraintIds = new Set(
            (record.input.constraints ?? []).map((constraint) => constraint.id)
          );
          for (const [constraintId, current] of [...this.derivedConstraints]) {
            if (replacementConstraintIds.has(constraintId) || this.constraintDependenciesMatch(current.input, committedSources))
              continue;
            this.removeNativeConstraint(current.handle);
            this.derivedConstraints.delete(constraintId);
          }
          if (old !== void 0) {
            for (const shape of old.shapes) {
              const collider = this.raw.getCollider(shape.colliderHandle);
              if (collider !== null && collider !== void 0) collider.setEnabled(false);
            }
            this.retiredDerivedBodies.push(old);
          }
          for (const constraint of record.input.constraints ?? []) {
            const previous = this.derivedConstraints.get(constraint.id);
            if (previous !== void 0) this.removeNativeConstraint(previous.handle);
            const staged = stagedConstraints.get(constraint.id);
            if (staged !== void 0) this.derivedConstraints.set(constraint.id, staged);
          }
          const shapes = record.input.shapes.map(
            (shape, index) => ({
              input: shape,
              colliderHandle: record.nativeColliders[index]?.handle
            })
          );
          const committed = {
            entity: record.input.entity,
            sourceKey: record.input.sourceKey,
            generation: this.backendGeneration,
            revision: record.input.revision,
            bodyType: record.input.bodyType,
            velocityPolicy: record.input.velocityPolicy,
            candidateId: record.token.candidateId,
            shapes,
            seams: [...record.input.seams ?? []],
            massProperties: record.input.massProperties,
            constraints: [...record.input.constraints ?? []]
          };
          const commitGeometry = record === group[group.length - 1] ? record.batch?.commitGeometry ?? record.commitGeometry : void 0;
          if (commitGeometry !== void 0) {
            this.activeDerivedAdmission = record;
            try {
              geometryCommitUncertain = true;
              const geometry = commitGeometry();
              geometryCommitUncertain = false;
              if (!geometry.ok) throw geometry.error;
            } finally {
              this.activeDerivedAdmission = void 0;
            }
            delete record.commitGeometry;
          }
          this.derivedBodies.set(record.input.entity, committed);
          const entityRecord = this.entityMap.get(record.input.entity);
          if (entityRecord !== void 0) {
            entityRecord.automaticAdditionalMass = record.input.massProperties?.mode === "explicit" ? 0 : entityRecord.additionalMass;
          }
          this.derivedBodySources.set(record.input.entity, {
            sourceKey: record.input.sourceKey,
            revision: record.input.revision
          });
          this.derivedFailures.delete(record.input.entity);
          record.state = "queued";
          this.pendingDerivedCandidates.delete(id);
          undos.push(rollback);
        } catch (cause) {
          let restored = restore(rollback);
          for (const undo of undos.reverse()) {
            if (!restore(undo)) restored = false;
          }
          const error = cause instanceof DerivedPhysicsError ? cause : new DerivedPhysicsError(
            "derived-backend-failed",
            "derived admission either commits completely or preserves the prior body state",
            "inspect the failure receipt and rebuild the PhysicsWorld if recovery is required",
            {
              entity: record.input.entity,
              candidateId: record.token.candidateId,
              reason: cause instanceof Error ? cause.message : String(cause)
            }
          );
          if (geometryCommitUncertain) restored = false;
          for (const member of group) {
            if (!restored) {
              this.derivedPoisonedEntities.add(member.input.entity);
              this.derivedBodies.delete(member.input.entity);
              this.derivedPublications.delete(member.input.entity);
            }
            this.rememberDerivedFailure(
              member,
              error,
              restored ? "old-state-retained" : "rebuild-required"
            );
          }
          break;
        }
      }
    }
  }
  publishDerivedCandidates() {
    for (const body of this.derivedBodies.values()) {
      const candidate = this.derivedCandidates.get(body.candidateId);
      if (candidate?.state !== "queued") continue;
      this.derivedPublications.set(
        body.entity,
        Object.freeze({
          candidateId: body.candidateId,
          entity: body.entity,
          revision: body.revision,
          fixedStep: this.fixedStep,
          shapeIds: Object.freeze(body.shapes.map((shape) => shape.input.id)),
          generation: body.generation
        })
      );
      candidate.state = "published";
      delete candidate.batch;
    }
  }
  retireDerivedBodies() {
    for (const body of this.retiredDerivedBodies.splice(0)) {
      for (const shape of body.shapes) this.removeNativeCollider(shape.colliderHandle);
      this.releaseDerivedCandidate(body.candidateId);
    }
  }
  applyDerivedMass(body, properties, previousWorldCom, velocityPolicy, authoredAdditionalMass, entity, candidateShapes, candidateColliders) {
    const oldVelocity = body.linvel();
    const oldAngularVelocity = body.angvel();
    if (properties?.mode === "explicit") {
      this.rememberAuthoredDensity(entity, body);
      for (const collider of this.bodyColliders(body)) {
        if (typeof collider.setDensity === "function") collider.setDensity(0);
      }
      const frame = properties.principalInertiaLocalFrame ?? [0, 0, 0, 1];
      body.setAdditionalMassProperties(
        properties.mass,
        {
          x: properties.centerOfMass[0],
          y: properties.centerOfMass[1],
          z: properties.centerOfMass[2]
        },
        {
          x: properties.principalInertia[0],
          y: properties.principalInertia[1],
          z: properties.principalInertia[2]
        },
        { x: frame[0], y: frame[1], z: frame[2], w: frame[3] },
        true
      );
      body.recomputeMassPropertiesFromColliders();
    } else {
      this.restoreAutomaticDensities(
        entity,
        body,
        properties?.mode === "automatic" ? properties.density : void 0,
        candidateShapes,
        candidateColliders
      );
      this.restoreAutomaticMass(body, authoredAdditionalMass);
    }
    if (velocityPolicy === "reset") {
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }
    const nextWorldCom = body.worldCom();
    const next = preserveCenterOfMassVelocity(
      [oldVelocity.x, oldVelocity.y, oldVelocity.z],
      [oldAngularVelocity.x, oldAngularVelocity.y, oldAngularVelocity.z],
      [previousWorldCom.x, previousWorldCom.y, previousWorldCom.z],
      [nextWorldCom.x, nextWorldCom.y, nextWorldCom.z]
    );
    body.setLinvel({ x: next[0], y: next[1], z: next[2] }, true);
    body.setAngvel(oldAngularVelocity, true);
  }
  /** Restore the complete committed mass policy after a failed admission. */
  restoreCommittedMass(body, previous, automaticAdditionalMass) {
    if (previous?.massProperties?.mode === "explicit") {
      const frame = previous.massProperties.principalInertiaLocalFrame ?? [0, 0, 0, 1];
      body.setAdditionalMassProperties(
        previous.massProperties.mass,
        {
          x: previous.massProperties.centerOfMass[0],
          y: previous.massProperties.centerOfMass[1],
          z: previous.massProperties.centerOfMass[2]
        },
        {
          x: previous.massProperties.principalInertia[0],
          y: previous.massProperties.principalInertia[1],
          z: previous.massProperties.principalInertia[2]
        },
        { x: frame[0], y: frame[1], z: frame[2], w: frame[3] },
        true
      );
      body.recomputeMassPropertiesFromColliders();
      return;
    }
    this.restoreAutomaticMass(body, automaticAdditionalMass);
  }
  /**
   * Rapier keeps `setAdditionalMassProperties` as native state even after a
   * collider recompute. Clear that override explicitly before recomputing so
   * automatic candidates and rollback really return to the authored policy.
   */
  restoreAutomaticMass(body, additionalMass) {
    body.setAdditionalMass(Math.max(0, additionalMass), true);
    body.recomputeMassPropertiesFromColliders();
  }
  rememberAuthoredDensity(entity, body) {
    const record = this.entityMap.get(entity);
    if (record === void 0 || record.authoredDensity !== void 0) return;
    const authored = this.bodyColliders(body).find(
      (collider) => !this.derivedColliderToShape.has(collider.handle)
    );
    const density = authored !== void 0 && typeof authored.density === "function" ? authored.density() : void 0;
    if (density !== void 0 && Number.isFinite(density) && density >= 0)
      record.authoredDensity = density;
  }
  restoreAutomaticDensities(entity, body, overrideDensity, candidateShapes, candidateColliders) {
    const record = this.entityMap.get(entity);
    const candidateDensityByHandle = /* @__PURE__ */ new Map();
    for (const [index, collider] of candidateColliders.entries()) {
      const shape = candidateShapes[index];
      if (shape !== void 0) candidateDensityByHandle.set(collider.handle, shape.density ?? 1);
    }
    const authoredDensity = record?.authoredDensity ?? 1;
    for (const collider of this.bodyColliders(body)) {
      const candidateDensity = candidateDensityByHandle.get(collider.handle);
      const density = candidateDensity !== void 0 ? overrideDensity ?? candidateDensity : this.derivedColliderToShape.has(collider.handle) ? 0 : overrideDensity ?? authoredDensity;
      if (typeof collider.setDensity === "function") collider.setDensity(density);
    }
  }
  restoreNativeConstraints(previous) {
    for (const [constraintId, record] of previous) {
      const recreated = this.createNativeConstraint(record.input);
      if (!recreated.ok) {
        for (const current of this.derivedConstraints.values())
          this.removeNativeConstraint(current.handle);
        this.derivedConstraints.clear();
        return false;
      }
      this.derivedConstraints.set(constraintId, {
        input: { ...record.input },
        handle: recreated.value.handle
      });
    }
    return true;
  }
  bodyColliders(body) {
    const result = [];
    for (let index = 0; index < body.numColliders(); index += 1) {
      const collider = body.collider(index);
      if (collider !== null && collider !== void 0) result.push(collider);
    }
    return result;
  }
  releaseDerivedCandidate(candidateId) {
    const record = this.derivedCandidates.get(candidateId);
    if (record === void 0) return;
    this.derivedCandidateBytes = Math.max(0, this.derivedCandidateBytes - record.bytes);
    this.derivedCandidates.delete(candidateId);
  }
  sourceForEntity(entity) {
    return this.derivedBodySources.get(entity) ?? {
      sourceKey: `entity:${entity}`,
      revision: 0
    };
  }
  /**
   * Project the final source revision of every queued body. Constraint
   * dependencies are checked against this projection, not against whichever
   * queued candidate happens to be processed first.
   */
  pendingDerivedSources() {
    const sources = /* @__PURE__ */ new Map();
    for (const candidateId of this.pendingDerivedCandidates) {
      const record = this.derivedCandidates.get(candidateId);
      if (record === void 0 || record.state !== "queued") continue;
      const current = sources.get(record.input.entity);
      if (current === void 0 || record.input.revision > current.revision) {
        sources.set(record.input.entity, {
          sourceKey: record.input.sourceKey,
          revision: record.input.revision
        });
      }
    }
    return sources;
  }
  newestPendingRevision(entity) {
    return this.pendingDerivedSources().get(entity)?.revision;
  }
  recoveryBlocked() {
    return this.derivedPoisonedEntities.size > 0 || this.syncState?.world.execution.health === "poisoned";
  }
  validateConstraintDependencies(input, candidate, sourceOverrides) {
    const endpoints = [
      [input.bodyA, input.bodyASource],
      [input.bodyB, input.bodyBSource]
    ];
    for (const [entity, dependency] of endpoints) {
      if (this.derivedPoisonedEntities.has(entity)) {
        return new DerivedPhysicsError(
          "derived-recovery-invalid",
          "constraint endpoints belong to a healthy PhysicsWorld state",
          "rebuild the PhysicsWorld before recreating constraints",
          { constraintId: input.id, entity }
        );
      }
      if (!this.entityMap.has(entity)) {
        return new DerivedPhysicsError(
          "derived-body-not-found",
          "both constraint endpoint entities have committed bodies",
          "reconcile both endpoint entities before creating or migrating a constraint",
          { constraintId: input.id, entity }
        );
      }
      const expected = candidate !== void 0 && entity === candidate.entity ? { sourceKey: candidate.sourceKey, revision: candidate.revision } : sourceOverrides?.get(entity) ?? this.sourceForEntity(entity);
      if (dependency.sourceKey !== expected.sourceKey || dependency.revision !== expected.revision) {
        return new DerivedPhysicsError(
          "derived-constraint-stale",
          "constraint endpoint sourceKey and revision match the committed endpoint",
          "refresh both endpoint dependencies and retry the complete candidate",
          {
            constraintId: input.id,
            entity,
            expected: `${expected.sourceKey}@${expected.revision}`,
            actual: `${dependency.sourceKey}@${dependency.revision}`
          }
        );
      }
    }
    return void 0;
  }
  constraintDependenciesMatch(input, sourceOverrides) {
    for (const [entity, dependency] of [
      [input.bodyA, input.bodyASource],
      [input.bodyB, input.bodyBSource]
    ]) {
      if (!this.entityMap.has(entity)) return false;
      const expected = sourceOverrides.get(entity) ?? this.sourceForEntity(entity);
      if (dependency.sourceKey !== expected.sourceKey || dependency.revision !== expected.revision)
        return false;
    }
    return true;
  }
  validateDerivedAdmission(input, sourceOverrides) {
    if (input.bodyType !== void 0 && input.bodyType !== "static" && input.bodyType !== "dynamic" && input.bodyType !== "kinematic") {
      return new DerivedPhysicsError(
        "derived-candidate-invalid",
        "candidate bodyType is one of static, dynamic, or kinematic",
        "repair the motion type before admission",
        { entity: input.entity, actual: input.bodyType }
      );
    }
    const seen = /* @__PURE__ */ new Set();
    for (const constraint of input.constraints ?? []) {
      const validation = validateConstraintInput(constraint);
      if (!validation.ok) return validation.error;
      if (seen.has(constraint.id)) {
        return new DerivedPhysicsError(
          "derived-constraint-invalid",
          "candidate contains one constraint update per identity",
          "merge duplicate updates before admission",
          { entity: input.entity, constraintId: constraint.id }
        );
      }
      seen.add(constraint.id);
      const dependencyError = this.validateConstraintDependencies(
        constraint,
        input,
        sourceOverrides
      );
      if (dependencyError !== void 0) return dependencyError;
      const existing = this.derivedConstraints.get(constraint.id);
      if (existing !== void 0 && constraint.revision <= existing.input.revision) {
        return new DerivedPhysicsError(
          "derived-constraint-stale",
          "migrated constraint revision advances the committed revision",
          "submit both endpoint dependencies and a newer constraint revision",
          {
            entity: input.entity,
            constraintId: constraint.id,
            expected: `>${existing.input.revision}`,
            actual: constraint.revision
          }
        );
      }
    }
    return void 0;
  }
  constraintsForBody(entity) {
    return [...this.derivedConstraints.values()].filter(
      (constraint) => constraint.input.bodyA === entity || constraint.input.bodyB === entity
    ).map((constraint) => ({ ...constraint.input }));
  }
  installDerivedConstraint(input, updating) {
    this.assertActive(updating ? "updateDerivedConstraint" : "createDerivedConstraint");
    const validation = validateConstraintInput(input);
    if (!validation.ok) return validation;
    const dependencyError = this.validateConstraintDependencies(
      input,
      void 0,
      this.pendingDerivedSources()
    );
    if (dependencyError !== void 0) return err(dependencyError);
    const existing = this.derivedConstraints.get(input.id);
    if (existing !== void 0 && !updating) {
      return err(
        new DerivedPhysicsError(
          "derived-constraint-stale",
          "constraint identity is not already committed when creating it",
          "call updateDerivedConstraint with a newer revision",
          { constraintId: input.id }
        )
      );
    }
    if (existing !== void 0 && input.revision <= existing.input.revision) {
      return err(
        new DerivedPhysicsError(
          "derived-constraint-stale",
          "constraint revision advances monotonically",
          "submit a newer constraint revision",
          {
            constraintId: input.id,
            actual: input.revision,
            expected: `>${existing.input.revision}`
          }
        )
      );
    }
    const native = this.createNativeConstraint(input);
    if (!native.ok) return native;
    if (existing !== void 0) this.removeNativeConstraint(existing.handle);
    this.derivedConstraints.set(input.id, { input: { ...input }, handle: native.value.handle });
    return ok({ id: input.id, revision: input.revision });
  }
  removeNativeConstraint(handle) {
    try {
      const joint = this.raw.getImpulseJoint(handle);
      if (joint !== null && joint !== void 0)
        this.raw.removeImpulseJoint(joint, true);
    } catch {
    }
  }
  getPendingTeleports() {
    return [...this.pendingTeleports].map(([entity, target]) => [entity, { ...target }]);
  }
  getKinematicControllerStates() {
    return [...this.kccOffsets].sort(([first], [second]) => first - second).map(([entity, offset]) => ({ entity, offset }));
  }
  dispose() {
    if (this.disposed) return;
    this.assertActive("dispose");
    this.invalidateDerivedShapeCandidates("physics-dispose");
    this.derivedCandidates.clear();
    this.pendingDerivedCandidates.clear();
    this.derivedBodies.clear();
    this.derivedBodySources.clear();
    this.derivedPublications.clear();
    this.derivedFailures.clear();
    this.derivedConstraints.clear();
    this.derivedContacts.length = 0;
    this.derivedPublicationPending = false;
    this.derivedPoisonedEntities.clear();
    this.derivedColliderToShape.clear();
    this.retiredDerivedBodies.length = 0;
    this.derivedCandidateBytes = 0;
    this.backendGeneration += 1;
    this.syncState = void 0;
    this.moveContext = void 0;
    if (typeof this.raw.free === "function") this.raw.free();
    if (typeof this.eventQueue.free === "function") this.eventQueue.free();
    this.entityMap.clear();
    this.pendingTeleports.clear();
    this.collisionPairs.clear();
    this.pendingCollisionEvents.length = 0;
    this.collisionEventHistory.length = 0;
    this.kccCache.clear();
    this.kccOffsets.clear();
    this.disposed = true;
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
   * `registerPhysicsSystems` (plan-strategy D-1/D-7).
   */
  setMoveContext(world, transform, characterController) {
    this.assertActive("setMoveContext");
    this.moveContext = { world, transform, characterController };
    this.worldIdentity = world;
  }
  /** Release the persistent ECS readers owned by one system registration. */
  clearEcsContext(world) {
    if (this.syncState?.world === world) this.syncState = void 0;
    if (this.moveContext?.world === world) this.moveContext = void 0;
    if (this.worldIdentity === world) this.worldIdentity = void 0;
  }
  moveAndSlide(entity, desiredDelta) {
    this.assertActive("moveAndSlide");
    return this.computeMove(entity, desiredDelta);
  }
  assertActive(operation) {
    if (this.activeDerivedAdmission !== void 0) {
      throw new DerivedPhysicsError(
        "derived-candidate-pending",
        "physics queries and mutations observe only complete fixed-step states",
        "finish the paired geometry commit before querying or mutating physics",
        { entity: this.activeDerivedAdmission.input.entity, reason: operation }
      );
    }
    if (this.disposed) {
      throw new Error(`RapierPhysicsWorld3D.${operation} cannot run on a disposed instance`);
    }
  }
  /**
   * Shared moveAndSlide core (plan-strategy D-1/D-2/D-4/D-6/D-7).
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
    const delta = { x: desiredDelta[0] ?? 0, y: desiredDelta[1] ?? 0, z: desiredDelta[2] ?? 0 };
    ctrl.computeColliderMovement(
      collider,
      delta,
      RAPIER.QueryFilterFlags.EXCLUDE_SENSORS,
      void 0,
      // biome-ignore lint/suspicious/noExplicitAny: Rapier Collider in filter predicate
      (other) => other.handle !== collider.handle
    );
    const movement = ctrl.computedMovement();
    const grounded = ctrl.computedGrounded();
    const t = body.translation();
    const next = { x: t.x + movement.x, y: t.y + movement.y, z: t.z + movement.z };
    body.setNextKinematicTranslation(next);
    body.setTranslation(next, true);
    this.raw.propagateModifiedBodyPositionsToColliders();
    const ctx = this.moveContext;
    if (ctx) {
      ctx.world.set(entity, ctx.transform, {
        pos: [next.x, next.y, next.z]
      });
      ctx.world.set(entity, ctx.characterController, { grounded });
    }
    return vec3.create(movement.x, movement.y, movement.z);
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
   * Lazily build a Rapier KinematicCharacterController for `entity` (cached).
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
  /** Remove backend rows whose Collider disappeared from the World query. */
  pruneMissingEntities(active) {
    for (const entity of this.entityMap.keys()) {
      if (!active.has(entity)) this.removeEntity(entity);
    }
  }
  bodyForEntity(entity) {
    const record = this.entityMap.get(entity);
    if (!record) return void 0;
    return this.raw.bodies.get(record.bodyHandle) ?? void 0;
  }
  isCommittedFixedBody(entity) {
    return this.bodyForEntity(entity)?.bodyType() === this.rapierModule.RigidBodyType.Fixed;
  }
  reconcileTransformlessCompatibility(entity, staticByEcs) {
    if (!staticByEcs || !this.isCommittedFixedBody(entity)) {
      this.removeEntity(entity);
      return;
    }
    this.removeKccController(entity);
  }
  reconcilePhysicsDelta(state, entity, delta) {
    const row = state.queries.map((query) => query.at(entity)).find((entry) => entry !== void 0);
    if (row === void 0) {
      this.removeEntity(entity);
      return;
    }
    if (!row.has(state.transformComponent)) {
      if (delta.colliderChanged || delta.rigidBodyChanged) {
        this.removeEntity(entity);
        return;
      }
      this.reconcileTransformlessCompatibility(entity, physicsRowIsStatic(row));
      return;
    }
    const descriptor = readPhysicsSyncDescriptor(
      row,
      state.transformComponent,
      state.globalTransformComponent
    );
    if (descriptor === void 0) {
      this.removeEntity(entity);
      return;
    }
    if (this.hasBody(entity) && (delta.colliderChanged || delta.rigidBodyChanged)) {
      if (this.derivedBodies.has(entity)) {
        this.syncDerivedCompatibleEcsMutation(entity, descriptor);
      } else {
        this.removeEntity(entity);
      }
    }
    if (!this.hasBody(entity)) {
      this.ensureBody(entity, descriptor.transform, descriptor.rigidBody, descriptor.collider);
      return;
    }
    if (delta.characterControllerChanged) {
      const cachedOffset = this.kccOffsets.get(entity);
      const hadCachedReceipt = this.kccCache.has(entity);
      const finalOffset = descriptor.characterControllerOffset;
      if (!descriptor.hasCharacterController) {
        this.removeKccController(entity);
      } else if (hadCachedReceipt && (finalOffset === void 0 || !Object.is(cachedOffset, finalOffset))) {
        this.removeKccController(entity);
        if (finalOffset !== void 0) this.ensureKcc(entity, finalOffset);
      }
    }
    if (!delta.transformChanged && !(delta.characterControllerStructureChanged && !descriptor.hasCharacterController)) {
      return;
    }
    const bodyType = rigidBodyTypeFromF32(descriptor.rigidBody.type);
    if (bodyType === "static") {
      this.syncAuthoredPose(entity, descriptor.transform, descriptor.collider, "static");
    } else if (bodyType === "kinematic" && !descriptor.hasCharacterController) {
      this.syncAuthoredPose(entity, descriptor.transform, descriptor.collider, "kinematic");
    }
  }
  syncDerivedCompatibleEcsMutation(entity, descriptor) {
    const body = this.bodyForEntity(entity);
    if (body === void 0) return;
    const bodyType = rigidBodyTypeFromF32(descriptor.rigidBody.type);
    const RAPIER = this.rapierModule;
    for (const collider of this.bodyColliders(body)) {
      if (!this.derivedColliderToShape.has(collider.handle)) {
        this.raw.removeCollider(collider, true);
      }
    }
    const committed = this.derivedBodies.get(entity);
    const record = this.entityMap.get(entity);
    if (record !== void 0) record.authoredDensity = descriptor.collider?.density;
    if (descriptor.collider !== void 0) {
      this.createAuthoredCollider(body, descriptor.transform, {
        ...descriptor.collider,
        density: committed?.massProperties?.mode === "explicit" ? 0 : descriptor.collider.density
      });
    }
    if (bodyType === "static") {
      body.setBodyType(RAPIER.RigidBodyType.Fixed, true);
      this.syncAuthoredPose(entity, descriptor.transform, descriptor.collider, "static");
    } else if (bodyType === "kinematic") {
      body.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
      this.syncAuthoredPose(entity, descriptor.transform, descriptor.collider, "kinematic");
    } else {
      body.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
      if (record !== void 0) record.additionalMass = Math.max(0, descriptor.rigidBody.mass);
      if (committed?.massProperties?.mode !== "explicit") {
        this.restoreAutomaticMass(body, record?.additionalMass ?? 0);
        if (record !== void 0) record.automaticAdditionalMass = record.additionalMass;
      }
      body.setGravityScale(descriptor.rigidBody.gravityScale, true);
      body.setLinearDamping(descriptor.rigidBody.linearDamping);
      body.setAngularDamping(descriptor.rigidBody.angularDamping);
    }
    body.enableCcd(Boolean(descriptor.rigidBody.ccdEnabled));
    if (committed?.massProperties?.mode === "explicit") {
      this.restoreCommittedMass(body, committed, 0);
    }
  }
  /** @internal ECS system bridge; consumers should register PhysicsSyncBackend. */
  _syncFromEcs(world, transformComponent, globalTransformComponent = world.components.resolve("GlobalTransform")) {
    this.assertActive("syncFromEcs");
    this.worldIdentity = world;
    if (globalTransformComponent === void 0) return;
    let state = this.syncState;
    if (state === void 0 || state.world !== world || state.transformComponent !== transformComponent || state.globalTransformComponent !== globalTransformComponent) {
      const queryResult = world.query({
        read: [Collider],
        optional: [
          transformComponent,
          globalTransformComponent,
          RigidBody,
          CharacterController,
          ChildOf
        ]
      });
      if (!queryResult.ok) return;
      const bodyQuery = world.query({
        read: [RigidBody],
        without: [Collider],
        optional: [transformComponent, globalTransformComponent, CharacterController, ChildOf]
      });
      if (!bodyQuery.ok) throw bodyQuery.error;
      state = {
        world,
        transformComponent,
        globalTransformComponent,
        queries: [queryResult.value, bodyQuery.value],
        projection: createStateProjection(
          world,
          [
            transformComponent,
            globalTransformComponent,
            Collider,
            RigidBody,
            CharacterController,
            ChildOf,
            Disabled
          ],
          [Collider, RigidBody]
        ),
        accepted: /* @__PURE__ */ new Map()
      };
      this.syncState = state;
    }
    const batch = state.projection.read();
    const updates = [];
    for (const index of batch.indices) {
      const entity = state.projection.entity(index);
      const previous = state.accepted.get(index);
      if (previous !== void 0 && previous.entity !== entity) this.removeEntity(previous.entity);
      if (entity === void 0) {
        updates.push({ index, descriptor: void 0 });
        continue;
      }
      let row;
      for (const query of state.queries) {
        row = query.at(entity);
        if (row !== void 0) break;
      }
      if (row === void 0) {
        this.removeEntity(entity);
        updates.push({ index, descriptor: void 0 });
        continue;
      }
      const descriptor = readPhysicsSyncDescriptor(
        row,
        transformComponent,
        globalTransformComponent
      );
      const prior = previous?.entity === entity ? previous : void 0;
      const delta = {
        transformChanged: !samePhysicsValue(prior?.transform, descriptor?.transform),
        colliderChanged: descriptor === void 0 ? state.projection.changed(entity, Collider) : !samePhysicsValue(prior?.collider, descriptor.collider),
        rigidBodyChanged: descriptor === void 0 ? state.projection.changed(entity, RigidBody) : !samePhysicsValue(prior?.rigidBody, descriptor.rigidBody),
        characterControllerChanged: prior?.characterControllerOffset !== descriptor?.characterControllerOffset || prior?.hasCharacterController !== descriptor?.hasCharacterController,
        characterControllerStructureChanged: prior?.hasCharacterController !== descriptor?.hasCharacterController
      };
      this.reconcilePhysicsDelta(state, entity, delta);
      updates.push({ index, descriptor: descriptor ?? (this.hasBody(entity) ? prior : void 0) });
    }
    batch.accept();
    for (const { index, descriptor } of updates) {
      if (descriptor === void 0) state.accepted.delete(index);
      else state.accepted.set(index, descriptor);
    }
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
  // ─── ECS→Rapier bridge (D-2) ──────────────────────────────────────────
  /**
   * Ensure a Rapier body and collider exist for an ECS entity (idempotent).
   *
   * When `entityMap` already contains the entity this returns immediately.
   * Otherwise creates a Rapier RigidBody (dynamic / fixed / kinematic) +
   * Collider (cuboid / ball / capsule) from the ECS component data, sets
   * `body.userData = entity`, and registers the pairing via `registerBody`.
   *
   * @param entity      Raw ECS entity number (stored in Rapier body.userData).
   * @param transform   ECS Transform fields: { posX, posY, posZ, ... }.
   * @param rigidBody   ECS RigidBody fields: { type (enum num), mass, ... }.
   * @param collider    ECS Collider fields: { shape (enum num), radius, ... }.
   *
   * Plan-strategy D-2 + D-3: enum→Rapier desc mapping consumes
   * rigidBodyTypeFromF32 / colliderShapeFromF32 helpers; closed switch with
   * no default — TypeScript enforces exhaustiveness on the string-union arms.
   */
  ensureBody(entity, transform, rigidBody, collider) {
    this.assertActive("ensureBody");
    if (this.entityMap.has(entity)) return;
    const RAPIER = this.rapierModule;
    const rbType = rigidBodyTypeFromF32(rigidBody.type);
    let body;
    switch (rbType) {
      case "dynamic": {
        const desc = RAPIER.RigidBodyDesc.dynamic().setTranslation(transform.position.x, transform.position.y, transform.position.z).setRotation(transform.rotation).setLinearDamping(rigidBody.linearDamping).setAngularDamping(rigidBody.angularDamping).setGravityScale(rigidBody.gravityScale);
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
        const desc = RAPIER.RigidBodyDesc.fixed().setTranslation(transform.position.x, transform.position.y, transform.position.z).setRotation(transform.rotation);
        body = this.raw.createRigidBody(desc);
        break;
      }
      case "kinematic": {
        const desc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(transform.position.x, transform.position.y, transform.position.z).setRotation(transform.rotation);
        if (rigidBody.ccdEnabled) {
          desc.setCcdEnabled(true);
        }
        body = this.raw.createRigidBody(desc);
        break;
      }
    }
    body.userData = entity;
    this.registerBody(
      entity,
      body.handle,
      rbType === "dynamic" ? Math.max(0, rigidBody.mass) : 0,
      collider?.density
    );
    if (collider === void 0) {
      const record = this.entityMap.get(entity);
      this.restoreAutomaticMass(body, record?.additionalMass ?? 0);
      if (record !== void 0) record.automaticAdditionalMass = record.additionalMass;
      return;
    }
    this.createAuthoredCollider(body, transform, collider);
  }
  createAuthoredCollider(body, transform, collider) {
    const RAPIER = this.rapierModule;
    const scaleX = Math.abs(transform.scale.x);
    const scaleY = Math.abs(transform.scale.y);
    const scaleZ = Math.abs(transform.scale.z);
    const activeEvents = RAPIER.ActiveEvents.COLLISION_EVENTS;
    const activeCollisionTypes = RAPIER.ActiveCollisionTypes.ALL;
    const cShape = colliderShapeFromF32(collider.shape);
    switch (cShape) {
      case "cuboid": {
        const desc = RAPIER.ColliderDesc.cuboid(
          collider.halfExtents[0] * scaleX,
          collider.halfExtents[1] * scaleY,
          collider.halfExtents[2] * scaleZ
        ).setFriction(collider.friction).setRestitution(collider.restitution).setDensity(collider.density).setCollisionGroups(collider.collisionGroups).setSolverGroups(collider.solverGroups).setActiveEvents(activeEvents).setActiveCollisionTypes(activeCollisionTypes);
        if (collider.isSensor) desc.setSensor(true);
        this.raw.createCollider(desc, body);
        break;
      }
      case "sphere": {
        const desc = RAPIER.ColliderDesc.ball(
          collider.radius * Math.max(scaleX, scaleY, scaleZ)
        ).setFriction(collider.friction).setRestitution(collider.restitution).setDensity(collider.density).setCollisionGroups(collider.collisionGroups).setSolverGroups(collider.solverGroups).setActiveEvents(activeEvents).setActiveCollisionTypes(activeCollisionTypes);
        if (collider.isSensor) desc.setSensor(true);
        this.raw.createCollider(desc, body);
        break;
      }
      case "capsule": {
        const desc = RAPIER.ColliderDesc.capsule(
          collider.halfHeight * scaleY,
          collider.radius * Math.max(scaleX, scaleZ)
        ).setFriction(collider.friction).setRestitution(collider.restitution).setDensity(collider.density).setCollisionGroups(collider.collisionGroups).setSolverGroups(collider.solverGroups).setActiveEvents(activeEvents).setActiveCollisionTypes(activeCollisionTypes);
        if (collider.isSensor) desc.setSensor(true);
        this.raw.createCollider(desc, body);
        break;
      }
    }
  }
  /**
   * Synchronize a static or kinematic body's Rapier pose and collider shape from
   * the resolved Transform pose. Dynamic bodies own their pose after creation.
   */
  syncAuthoredPose(entity, transform, collider, bodyType) {
    this.assertActive("syncAuthoredPose");
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
    if (collider === void 0) return;
    const rapierCollider = this.bodyColliders(body).find(
      (shape) => !this.derivedColliderToShape.has(shape.handle)
    );
    if (!rapierCollider) return;
    const scaleX = Math.abs(transform.scale.x);
    const scaleY = Math.abs(transform.scale.y);
    const scaleZ = Math.abs(transform.scale.z);
    switch (colliderShapeFromF32(collider.shape)) {
      case "cuboid":
        rapierCollider.setHalfExtents({
          x: collider.halfExtents[0] * scaleX,
          y: collider.halfExtents[1] * scaleY,
          z: collider.halfExtents[2] * scaleZ
        });
        break;
      case "sphere":
        rapierCollider.setRadius(collider.radius * Math.max(scaleX, scaleY, scaleZ));
        break;
      case "capsule":
        rapierCollider.setHalfHeight(collider.halfHeight * scaleY);
        rapierCollider.setRadius(collider.radius * Math.max(scaleX, scaleZ));
        break;
    }
  }
  // ─── ECS integration helpers ───────────────────────────────────────────
  /**
   * Register an ECS entity with its Rapier body handle.
   */
  registerBody(entity, bodyHandle, additionalMass = 0, authoredDensity) {
    this.entityMap.set(entity, {
      bodyHandle,
      additionalMass: Math.max(0, additionalMass),
      // `ensureBody` registers before its authored collider is attached.
      // Rapier recomputes the body from that collider and clears the
      // descriptor-only additional mass, so the native baseline is zero.
      // A later automatic derived admission records the actual additional
      // contribution after it has been applied. Keeping this separate from
      // `additionalMass` lets rollback restore native state rather than an
      // authored value that Rapier has not applied yet.
      automaticAdditionalMass: 0,
      authoredDensity: authoredDensity !== void 0 && Number.isFinite(authoredDensity) && authoredDensity >= 0 ? authoredDensity : void 0
    });
    if (!this.derivedBodySources.has(entity)) {
      this.derivedBodySources.set(entity, { sourceKey: `entity:${entity}`, revision: 0 });
    }
  }
  /**
   * Apply all pending teleports to their respective bodies.
   */
  applyPendingTeleports() {
    for (const [entity, target] of this.pendingTeleports) {
      const record = this.entityMap.get(entity);
      if (!record) continue;
      const body = this.raw.bodies.get(record.bodyHandle);
      if (!body) continue;
      body.setTranslation({ x: target.x, y: target.y, z: target.z }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, false);
      body.setAngvel({ x: 0, y: 0, z: 0 }, false);
    }
    this.pendingTeleports.clear();
  }
  /**
   * Set a kinematic body's next position from ECS transform.
   */
  setKinematicPosition(entity, pos) {
    const record = this.entityMap.get(entity);
    if (!record) return;
    const body = this.raw.bodies.get(record.bodyHandle);
    if (!body) return;
    body.setNextKinematicTranslation({ x: pos.x, y: pos.y, z: pos.z });
  }
  /**
   * Write Rapier dynamic body poses back.
   */
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
        pos: { x: translation.x, y: translation.y, z: translation.z },
        rotation: { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w }
      });
    }
    return results;
  }
  /**
   * Remove a Rapier body and its colliders when the ECS entity is despawned.
   */
  removeEntity(entity) {
    const record = this.entityMap.get(entity);
    if (!record) return;
    for (const candidate of this.derivedCandidates.values()) {
      if (candidate.input.entity !== entity || candidate.batch === void 0 || candidate.state !== "ready" && candidate.state !== "queued")
        continue;
      this.rejectPreparedCandidate(
        candidate,
        new DerivedPhysicsError(
          "derived-body-not-found",
          "all grouped bodies remain live until admission",
          "prepare a new complete group after entity reconciliation",
          { entity }
        )
      );
    }
    const derived = this.derivedBodies.get(entity);
    if (derived !== void 0) {
      for (const shape of derived.shapes) this.removeNativeCollider(shape.colliderHandle);
      this.derivedBodies.delete(entity);
      this.derivedPublications.delete(entity);
    }
    this.derivedFailures.delete(entity);
    this.derivedPoisonedEntities.delete(entity);
    for (const [id, constraint] of this.derivedConstraints) {
      if (constraint.input.bodyA === entity || constraint.input.bodyB === entity) {
        this.removeNativeConstraint(constraint.handle);
        this.derivedConstraints.delete(id);
      }
    }
    for (const [id, candidate] of this.derivedCandidates) {
      if (candidate.input.entity !== entity) continue;
      for (const collider of candidate.nativeColliders) this.removeNativeCollider(collider.handle);
      this.pendingDerivedCandidates.delete(id);
      this.releaseDerivedCandidate(id);
    }
    const ownPairs = [...this.collisionPairs.get(entity) ?? []];
    for (const other of ownPairs) {
      if (this.removePair(entity, other)) {
        this.pushCollisionEvent({ type: "stopped", entityA: entity, entityB: other });
      }
    }
    this.removeKccController(entity);
    this.raw.removeRigidBody({ handle: record.bodyHandle });
    this.entityMap.delete(entity);
    this.derivedBodySources.delete(entity);
    const own = this.collisionPairs.get(entity);
    if (own) {
      for (const other of own) this.collisionPairs.get(other)?.delete(entity);
      this.collisionPairs.delete(entity);
    }
  }
};
function createRapier3DPhysicsWorld(rapier) {
  return new RapierPhysicsWorld3D(rapier);
}
function hasReadableWorldPose(world) {
  return world !== void 0 && world.length >= 16;
}
var PHYSICS_DT_MAX = 0.1;
var poseScratchPosition = vec3.create();
var poseScratchRotation = quat.create();
var poseScratchScale = vec3.create();
var poseScratchWorld = new Float32Array(16);
function physicsRowIsStatic(row) {
  if (!row.has(RigidBody)) return true;
  const rigidBody = row.get(RigidBody);
  return rigidBody !== void 0 && rigidBodyTypeFromF32(rigidBody.type) === "static";
}
function readPhysicsSyncDescriptor(row, transformComponent, globalTransformComponent) {
  const transformData = row.get(transformComponent);
  const globalTransformData = row.get(globalTransformComponent);
  const colliderData = row.has(Collider) ? row.get(Collider) : void 0;
  if (transformData === void 0 || colliderData === void 0 && !row.has(RigidBody))
    return void 0;
  const useWorldPose = row.has(ChildOf) && hasReadableWorldPose(globalTransformData?.world);
  if (useWorldPose) {
    poseScratchWorld.set(globalTransformData.world);
    mat4.decompose(poseScratchPosition, poseScratchRotation, poseScratchScale, poseScratchWorld);
  } else {
    poseScratchPosition[0] = transformData.pos[0] ?? 0;
    poseScratchPosition[1] = transformData.pos[1] ?? 0;
    poseScratchPosition[2] = transformData.pos[2] ?? 0;
    poseScratchRotation[0] = transformData.quat[0] ?? 0;
    poseScratchRotation[1] = transformData.quat[1] ?? 0;
    poseScratchRotation[2] = transformData.quat[2] ?? 0;
    poseScratchRotation[3] = transformData.quat[3] ?? 1;
    poseScratchScale[0] = transformData.scale[0] ?? 1;
    poseScratchScale[1] = transformData.scale[1] ?? 1;
    poseScratchScale[2] = transformData.scale[2] ?? 1;
  }
  const rigidBodyData = row.has(RigidBody) ? row.get(RigidBody) : void 0;
  const characterControllerData = row.has(CharacterController) ? row.get(CharacterController) : void 0;
  return {
    entity: row.entity,
    transform: {
      position: {
        x: poseScratchPosition[0] ?? 0,
        y: poseScratchPosition[1] ?? 0,
        z: poseScratchPosition[2] ?? 0
      },
      rotation: {
        x: poseScratchRotation[0] ?? 0,
        y: poseScratchRotation[1] ?? 0,
        z: poseScratchRotation[2] ?? 0,
        w: poseScratchRotation[3] ?? 1
      },
      scale: {
        x: poseScratchScale[0] ?? 1,
        y: poseScratchScale[1] ?? 1,
        z: poseScratchScale[2] ?? 1
      }
    },
    rigidBody: rigidBodyData === void 0 ? {
      type: RIGID_BODY_TYPE_STATIC,
      mass: 0,
      linearDamping: 0,
      angularDamping: 0,
      gravityScale: 1,
      ccdEnabled: 0
    } : {
      type: rigidBodyData.type,
      mass: rigidBodyData.mass,
      linearDamping: rigidBodyData.linearDamping,
      angularDamping: rigidBodyData.angularDamping,
      gravityScale: rigidBodyData.gravityScale,
      ccdEnabled: Number(rigidBodyData.ccdEnabled)
    },
    collider: colliderData === void 0 ? void 0 : {
      shape: colliderData.shape,
      halfExtents: [
        colliderData.halfExtents[0] ?? 0,
        colliderData.halfExtents[1] ?? 0,
        colliderData.halfExtents[2] ?? 0
      ],
      radius: colliderData.radius,
      halfHeight: colliderData.halfHeight,
      friction: colliderData.friction,
      restitution: colliderData.restitution,
      density: colliderData.density,
      isSensor: Number(colliderData.isSensor),
      collisionGroups: colliderData.collisionGroups,
      solverGroups: colliderData.solverGroups
    },
    hasCharacterController: row.has(CharacterController),
    characterControllerOffset: characterControllerData?.offset
  };
}
var PHYSICS_SYNC_BACKEND = "physicsSyncBackend";
var PHYSICS_STEP_SIMULATION = "physicsStepSimulation";
var PHYSICS_WRITEBACK = "physicsWriteback";
var PHYSICS_COLLISION_SYNC = "physicsCollisionSync";
function resolveTransform(world) {
  return world.components.resolve("Transform");
}
var PhysicsSyncBackend = defineSystem({
  name: PHYSICS_SYNC_BACKEND,
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
    pw._syncFromEcs(world, transformComponent, globalTransformComponent);
  }
});
var PhysicsStepSimulation = defineSystem({
  name: PHYSICS_STEP_SIMULATION,
  queries: [],
  after: [PHYSICS_SYNC_BACKEND],
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
var PhysicsWriteback = defineSystem({
  name: PHYSICS_WRITEBACK,
  queries: [],
  after: [PHYSICS_STEP_SIMULATION],
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
      world.set(entity, transformComponent, {
        pos: [r.pos.x, r.pos.y, r.pos.z],
        quat: [r.rotation.x, r.rotation.y, r.rotation.z, r.rotation.w]
      });
    }
  }
});
var PhysicsCollisionSync = defineSystem({
  name: PHYSICS_COLLISION_SYNC,
  queries: [],
  after: [PHYSICS_WRITEBACK],
  fn: (world) => {
    let pw;
    try {
      pw = world.getResource("PhysicsWorld");
    } catch {
      return;
    }
    pw.writebackCollidingEntities(world, CollidingEntities);
    pw.finalizeDerivedFixedStep();
  }
});
function registerPhysicsSystems(world) {
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
    PhysicsSyncBackend,
    PhysicsStepSimulation,
    PhysicsWriteback,
    PhysicsCollisionSync
  ]).unwrap();
  return () => {
    world.removeSystem(FixedUpdate, PHYSICS_COLLISION_SYNC);
    world.removeSystem(FixedUpdate, PHYSICS_WRITEBACK);
    world.removeSystem(FixedUpdate, PHYSICS_STEP_SIMULATION);
    world.removeSystem(FixedUpdate, PHYSICS_SYNC_BACKEND);
    try {
      world.getResource("PhysicsWorld").clearEcsContext(world);
    } catch {
    }
    releaseComponents();
  };
}
var rapierInstance = null;
var loadingPromise = null;
async function loadRapier3D() {
  if (rapierInstance !== null) return rapierInstance;
  if (loadingPromise !== null) return loadingPromise;
  loadingPromise = _doLoad();
  return loadingPromise;
}
async function _doLoad() {
  try {
    const RAPIER = await import('../../../vendor/@dimforge/rapier3d-compat/dist/rapier.mjs');
    await RAPIER.default.init();
    rapierInstance = RAPIER.default;
    loadingPromise = null;
    return RAPIER.default;
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    loadingPromise = null;
    return new PhysicsError$1({
      code: "wasm-load-failed",
      expected: "successful dynamic import and init of @dimforge/rapier3d-compat",
      hint: `dynamic import or init() failed: ${reason}. Check network, file path, and that @dimforge/rapier3d-compat is installed.`,
      detail: { code: "wasm-load-failed", reason }
    });
  }
}

export { RapierPhysicsWorld3D, createRapier3DPhysicsWorld, loadRapier3D, registerPhysicsSystems };
