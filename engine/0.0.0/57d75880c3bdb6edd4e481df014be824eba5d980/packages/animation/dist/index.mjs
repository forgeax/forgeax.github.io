import {
  deriveAnimationTargetId,
  isAnimationTargetId
} from "./chunk-DMXAQUPI.mjs";

// src/animation-diagnostic.ts
var emittedKeysByWorld = /* @__PURE__ */ new WeakMap();
var listeners = /* @__PURE__ */ new Set();
function subscribeAnimationDiagnostics(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function isAnimationDevMode() {
  const proc = globalThis.process;
  if (proc?.env?.NODE_ENV === "production") return false;
  return Boolean(import.meta.env?.DEV) || proc !== void 0;
}
function emitAnimationDiagnostic(world, diagnostic) {
  if (!isAnimationDevMode()) return;
  let emitted = emittedKeysByWorld.get(world);
  if (emitted === void 0) {
    emitted = /* @__PURE__ */ new Set();
    emittedKeysByWorld.set(world, emitted);
  }
  const { player, clip, channel, targetId, reason } = diagnostic.detail;
  const emittedKey = `${player}|${clip}|${channel}|${targetId}|${reason}`;
  if (emitted.has(emittedKey)) return;
  emitted.add(emittedKey);
  const frozen = Object.freeze({
    ...diagnostic,
    detail: Object.freeze({ ...diagnostic.detail })
  });
  for (const listener of listeners) {
    try {
      listener(world, frozen);
    } catch {
    }
  }
  console.warn(frozen);
}
function _resetAnimationWarnsForTests(world) {
  emittedKeysByWorld.delete(world);
}

// src/animation-player.ts
import { defineComponent } from "../../ecs/dist/index.mjs";
var AnimationPlayer = defineComponent("AnimationPlayer", {
  // The render/animation owner re-resolves clip assets in the target World;
  // playback clocks and weights remain portable simulation state.
  clips: { type: "array<shared<AnimationClip>>" },
  times: { type: "array<f32>" },
  weights: { type: "array<f32>" },
  speeds: { type: "array<f32>" },
  // The graph evaluator owns this compiled runtime binding; portable playback
  // controls and derived slots remain available to the simulation record.
  graph: { type: "shared<AnimationGraph>" },
  nodeWeights: { type: "array<f32>" },
  nodeTimes: { type: "array<f32>" },
  nodeSpeeds: { type: "array<f32>" },
  paused: { type: "bool", default: false },
  looping: { type: "bool", default: true }
});

// src/animation-target.ts
import {
  defineComponent as defineComponent2,
  defineRelationship,
  Entity
} from "../../ecs/dist/index.mjs";
import { ChildOf, Name, Transform } from "../../scene/dist/index.mjs";
import { err, ok } from "../../types/dist/index.mjs";
var AnimationTargetId = defineComponent2("AnimationTargetId", {
  value: { type: "string" }
});
var { target: AnimationTargets, source: AnimatedBy } = defineRelationship({
  sourceName: "AnimatedBy",
  sourceField: "player",
  targetName: "AnimationTargets",
  targetField: "targets",
  exclusive: true,
  linkedSpawn: false,
  allowSelf: true
});
var BindAnimationTargetsError = class extends Error {
  constructor(code, expected, hint, detail) {
    super(`[BindAnimationTargetsError ${code}] expected: ${expected}; hint: ${hint}`);
    this.code = code;
    this.expected = expected;
    this.hint = hint;
    this.detail = detail;
  }
  code;
  expected;
  hint;
  detail;
  name = "BindAnimationTargetsError";
};
function bindError(code, expected, hint, detail) {
  return err(new BindAnimationTargetsError(code, expected, hint, detail));
}
function targetLineage(world, player, target) {
  const reversed = [];
  const visited = /* @__PURE__ */ new Set();
  let current = target;
  while (!visited.has(current)) {
    visited.add(current);
    reversed.push(current);
    if (current === player) return ok(reversed.reverse());
    const parent = world.get(current, ChildOf);
    if (!parent.ok || parent.value.parent === null) break;
    current = parent.value.parent;
  }
  return bindError(
    "animation-target-outside-player-root",
    "the target to be the player itself or one of its descendants",
    "parent the target below the animation player or bind it to the correct player",
    { player, target }
  );
}
function inspectTarget(world, player, target) {
  if (!world.get(target, Entity).ok || !world.get(target, Transform).ok) {
    return bindError(
      "animation-target-invalid",
      "a live target entity carrying Transform",
      "spawn or retain the Transform target before binding it",
      { player, target }
    );
  }
  const lineage = targetLineage(world, player, target);
  if (!lineage.ok) return lineage;
  const storedId = world.get(target, AnimationTargetId);
  let id;
  if (storedId.ok) {
    if (!isAnimationTargetId(storedId.value.value)) {
      return bindError(
        "animation-target-id-invalid",
        "a 32-character lowercase hexadecimal AnimationTargetId wire",
        "replace the stored value with deriveAnimationTargetId(path)",
        { target, value: storedId.value.value }
      );
    }
    id = storedId.value.value;
  } else {
    const path = [];
    for (const entity of lineage.value) {
      const name = world.get(entity, Name);
      if (!name.ok) {
        return bindError(
          "animation-target-name-missing",
          "a Name on every entity from the animation root through the target",
          "attach Name before deriving the target ID",
          { player, target, entity }
        );
      }
      path.push(name.value.value);
    }
    id = deriveAnimationTargetId(path);
  }
  const owner = world.get(target, AnimatedBy);
  if (owner.ok && owner.value.player !== null && owner.value.player !== player && world.get(owner.value.player, Entity).ok) {
    return bindError(
      "animation-target-player-conflict",
      "an unowned target, a stale owner, or the same animation player",
      "remove AnimatedBy or bind the target through its current live owner",
      {
        player,
        target,
        owner: owner.value.player
      }
    );
  }
  return ok({
    entity: target,
    id,
    needsId: !storedId.ok,
    owner: owner.ok ? owner.value.player : void 0
  });
}
function bindAnimationTargets(world, player, targets) {
  if (!world.get(player, Entity).ok || !world.get(player, AnimationPlayer).ok) {
    return bindError(
      "animation-target-player-invalid",
      "a live entity carrying AnimationPlayer",
      "spawn or retain the AnimationPlayer before binding targets",
      { player }
    );
  }
  const uniqueTargets = [...new Map(targets.map((target) => [target, target])).values()];
  const mirror = world.get(player, AnimationTargets);
  const candidates = [];
  const ids = /* @__PURE__ */ new Map();
  if (mirror.ok) {
    for (const targetRaw of mirror.value.targets) {
      const target = targetRaw;
      if (!world.get(target, Entity).ok) continue;
      const storedId = world.get(target, AnimationTargetId);
      if (!storedId.ok || !isAnimationTargetId(storedId.value.value)) continue;
      const matching = ids.get(storedId.value.value);
      if (matching) {
        if (!matching.includes(target)) matching.push(target);
      } else {
        ids.set(storedId.value.value, [target]);
      }
    }
  }
  for (const target of uniqueTargets) {
    const candidate = inspectTarget(world, player, target);
    if (!candidate.ok) return candidate;
    const matching = ids.get(candidate.value.id);
    const previous = matching?.find((entity) => entity !== target);
    if (previous !== void 0) {
      return bindError(
        "animation-target-id-duplicate",
        "one target entity per AnimationTargetId within a batch",
        "rename one target path or preserve distinct authored target IDs",
        {
          id: candidate.value.id,
          first: previous,
          second: target
        }
      );
    }
    if (matching) {
      if (!matching.includes(target)) matching.push(target);
    } else {
      ids.set(candidate.value.id, [target]);
    }
    candidates.push(candidate.value);
  }
  const existing = new Set(mirror.ok ? [...mirror.value.targets] : []);
  for (const candidate of candidates) {
    if (candidate.needsId) {
      const added = world.addComponent(candidate.entity, {
        component: AnimationTargetId,
        data: { value: candidate.id }
      });
      if (!added.ok) {
        return bindError(
          "animation-target-bind-failed",
          "the preflighted AnimationTargetId write to succeed",
          "inspect the ECS error before retrying the batch",
          { target: candidate.entity, cause: added.error.code }
        );
      }
    }
    if (candidate.owner !== player || !existing.has(candidate.entity)) {
      const added = world.addComponent(candidate.entity, {
        component: AnimatedBy,
        data: { player }
      });
      if (!added.ok) {
        return bindError(
          "animation-target-bind-failed",
          "the preflighted AnimatedBy write to succeed",
          "inspect the ECS error before retrying the batch",
          { target: candidate.entity, cause: added.error.code }
        );
      }
    }
  }
  return ok(void 0);
}

// src/assets/animation-decoder.ts
import {
  err as err2,
  ok as ok2
} from "../../types/dist/index.mjs";
var invalid = (guid, expected) => err2({
  code: "asset-package-invalid",
  expected,
  hint: "recook the animation asset and publish its complete payload",
  detail: { guid, reason: "animation owner validation failed" }
});
function refGuid(value, refs) {
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
    return refs[value];
  }
  return void 0;
}
function graphNode(value, refs) {
  if (value === null || typeof value !== "object") return void 0;
  const source = value;
  if (typeof source.weight !== "number" || !Number.isFinite(source.weight)) return void 0;
  if (source.type === "clip") {
    const clip = refGuid(source.clip, refs);
    return clip === void 0 ? void 0 : { type: "clip", clip, weight: source.weight };
  }
  if (source.type === "blend") {
    return Array.isArray(source.children) && source.children.every((child) => Number.isSafeInteger(child) && child >= 0) ? { type: "blend", children: source.children, weight: source.weight } : void 0;
  }
  if (source.type === "add") {
    return typeof source.base === "number" && Number.isSafeInteger(source.base) && source.base >= 0 && Array.isArray(source.additive) && source.additive.every((child) => Number.isSafeInteger(child) && child >= 0) ? {
      type: "add",
      base: source.base,
      additive: source.additive,
      weight: source.weight
    } : void 0;
  }
  return void 0;
}
var animationClipContribution = {
  kind: { kind: "animation-clip" },
  consumer: "AnimationPlayer",
  decoder: {
    async decode({ envelope }) {
      return envelope.payload.kind === "animation-clip" && Array.isArray(envelope.payload.channels) && Number.isFinite(envelope.payload.duration) && envelope.payload.duration >= 0 ? ok2(envelope.payload) : invalid(envelope.guid, "an animation clip with channels and non-negative duration");
    }
  }
};
var animationGraphContribution = {
  kind: { kind: "animation-graph" },
  consumer: "evaluateAnimationGraph",
  decoder: {
    async decode({ envelope }) {
      const payload = envelope.payload;
      if (payload === null || typeof payload !== "object") {
        return invalid(envelope.guid, "an animation graph with at least one node");
      }
      const source = payload;
      if (source.kind !== "animation-graph" || !Array.isArray(source.nodes) || source.nodes.length === 0 || !Number.isSafeInteger(source.root) || source.root < 0) {
        return invalid(envelope.guid, "an animation graph with at least one node");
      }
      const nodes = [];
      for (const value of source.nodes) {
        const node = graphNode(value, envelope.refs);
        if (node === void 0) {
          return invalid(envelope.guid, "an animation graph with resolvable node references");
        }
        nodes.push(node);
      }
      return ok2({ kind: "animation-graph", nodes, root: source.root });
    }
  }
};

// src/graph/define-animation-graph.ts
import { err as err3, ok as ok3 } from "../../types/dist/index.mjs";

// src/errors.ts
var AnimationGraphEmptyError = class extends Error {
  code = "animation-graph-empty";
  expected;
  hint;
  constructor() {
    super("AnimationGraph is empty: the builder produced zero nodes");
    this.name = "AnimationGraphEmptyError";
    this.expected = "an AnimationGraph declares at least one node";
    this.hint = "declare at least one clip/blend/add node inside defineAnimationGraph(...) and return its ref as the root";
  }
};
var AnimationGraphNodeOutOfRangeError = class extends Error {
  code = "animation-graph-node-out-of-range";
  expected;
  hint;
  detail;
  constructor(detail) {
    const { node, ref, nodeCount } = detail;
    super(
      `AnimationGraph node ${node} references out-of-range node ${ref} (graph has ${nodeCount} nodes)`
    );
    this.name = "AnimationGraphNodeOutOfRangeError";
    this.expected = "every node reference is a valid index in [0, nodeCount)";
    this.hint = `node ${node} references index ${ref}, but valid indices are 0..${nodeCount - 1}; reference only node refs returned by the builder in this graph`;
    this.detail = detail;
  }
};
var AnimationGraphNodeWeightInvalidError = class extends Error {
  code = "animation-graph-node-weight-invalid";
  expected;
  hint;
  detail;
  constructor(detail) {
    const { node, weight } = detail;
    super(`AnimationGraph node ${node} has an invalid static weight ${weight}`);
    this.name = "AnimationGraphNodeWeightInvalidError";
    this.expected = "every node static weight is a finite number >= 0";
    this.hint = `node ${node} has weight ${weight}; pass a finite non-negative static weight (Add layers may sum above 1, but a single node weight must be >= 0)`;
    this.detail = detail;
  }
};
var AnimationGraphCycleError = class extends Error {
  code = "animation-graph-cycle";
  expected;
  hint;
  detail;
  constructor(detail) {
    const { node } = detail;
    super(`AnimationGraph contains a cycle reachable from node ${node}`);
    this.name = "AnimationGraphCycleError";
    this.expected = "the AnimationGraph is a DAG (no node reaches itself)";
    this.hint = `node ${node} participates in a cycle; a graph must be acyclic -- remove the self/back reference so no node transitively references itself`;
    this.detail = detail;
  }
};

// src/graph/define-animation-graph.ts
function animationGraphNodeChildren(node) {
  switch (node.type) {
    case "clip":
      return [];
    case "blend":
      return node.children;
    case "add":
      return [node.base, ...node.additive];
  }
}
function makeBuilder(nodes) {
  return {
    clip(clip, weight = 1) {
      const index = nodes.length;
      nodes.push({ type: "clip", clip, weight });
      return index;
    },
    blend(children, weight = 1) {
      const index = nodes.length;
      nodes.push({ type: "blend", children: children.slice(), weight });
      return index;
    },
    add(base, additive, weight = 1) {
      const index = nodes.length;
      nodes.push({ type: "add", base, additive: additive.slice(), weight });
      return index;
    }
  };
}
function findInvalidWeight(nodes) {
  for (let i = 0; i < nodes.length; i++) {
    const weight = nodes[i]?.weight ?? Number.NaN;
    if (!Number.isFinite(weight) || weight < 0) {
      return new AnimationGraphNodeWeightInvalidError({ node: i, weight });
    }
  }
  return null;
}
function isRef(ref, nodeCount) {
  return Number.isInteger(ref) && ref >= 0 && ref < nodeCount;
}
function findOutOfRangeRef(nodes, root) {
  const nodeCount = nodes.length;
  if (!isRef(root, nodeCount)) {
    return new AnimationGraphNodeOutOfRangeError({ node: root, ref: root, nodeCount });
  }
  for (let i = 0; i < nodeCount; i++) {
    const node = nodes[i];
    if (node === void 0) continue;
    for (const ref of animationGraphNodeChildren(node)) {
      if (!isRef(ref, nodeCount)) {
        return new AnimationGraphNodeOutOfRangeError({ node: i, ref, nodeCount });
      }
    }
  }
  return null;
}
function findCycle(nodes) {
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Uint8Array(nodes.length);
  let cycleNode = -1;
  const visit = (i) => {
    color[i] = GRAY;
    const node = nodes[i];
    const children = node === void 0 ? [] : animationGraphNodeChildren(node);
    for (const child of children) {
      if (color[child] === GRAY) {
        cycleNode = child;
        return true;
      }
      if (color[child] === WHITE && visit(child)) return true;
    }
    color[i] = BLACK;
    return false;
  };
  for (let i = 0; i < nodes.length; i++) {
    if (color[i] === WHITE && visit(i)) {
      return new AnimationGraphCycleError({ node: cycleNode });
    }
  }
  return null;
}
function validateAnimationGraph(nodes, root) {
  if (nodes.length === 0) return new AnimationGraphEmptyError();
  return findInvalidWeight(nodes) ?? findOutOfRangeRef(nodes, root) ?? findCycle(nodes);
}
function defineAnimationGraph(build) {
  const nodes = [];
  const root = build(makeBuilder(nodes));
  const error = validateAnimationGraph(nodes, root);
  if (error) return err3(error);
  return ok3({ kind: "animation-graph", nodes, root });
}

// src/graph/describe-animation-graph.ts
function describeAnimationGraph(graph) {
  const nodes = graph.nodes.map((node, index) => ({
    index,
    type: node.type,
    weight: node.weight,
    children: animationGraphNodeChildren(node)
  }));
  return {
    nodes,
    root: graph.root,
    staticWeights: nodes.map((node) => node.weight)
  };
}

// src/graph/serialize-animation-graph.ts
function serializeAnimationGraph(graph, resolveClipGuid = (clip) => clip) {
  const refs = [];
  const guidToIndex = /* @__PURE__ */ new Map();
  const internRef = (guid) => {
    const existing = guidToIndex.get(guid);
    if (existing !== void 0) return existing;
    const index = refs.length;
    refs.push(guid);
    guidToIndex.set(guid, index);
    return index;
  };
  const nodes = [];
  for (const node of graph.nodes) {
    switch (node.type) {
      case "clip": {
        const guid = resolveClipGuid(node.clip);
        if (guid === void 0 || guid.length === 0) return void 0;
        nodes.push({ type: "clip", clip: internRef(guid), weight: node.weight });
        break;
      }
      case "blend":
        nodes.push({ type: "blend", children: [...node.children], weight: node.weight });
        break;
      case "add":
        nodes.push({
          type: "add",
          base: node.base,
          additive: [...node.additive],
          weight: node.weight
        });
        break;
    }
  }
  return { payload: { nodes, root: graph.root }, refs };
}

// src/systems/advance-animation-player.ts
import { Time, Update } from "../../ecs/dist/index.mjs";
import { defineSystem, defineSystemSet, ENTITY_NULL_RAW } from "../../ecs/dist/index.mjs";
import { createStateProjection } from "../../ecs/dist/projection/index.mjs";
import { MorphWeights, Transform as Transform2 } from "../../scene/dist/index.mjs";
import { toShared } from "../../types/dist/index.mjs";

// src/player-errors.ts
var AnimationPlayerSlotLengthMismatchError = class extends Error {
  code = "animation-player-slot-length-mismatch";
  expected;
  hint;
  detail;
  constructor(detail) {
    const { entity, clips, times, weights, speeds } = detail;
    const expected = "AnimationPlayer clips/times/weights/speeds columns share one length";
    const hint = `entity ${entity} AnimationPlayer columns are length-desynced (clips=${clips}, times=${times}, weights=${weights}, speeds=${speeds}); write all four parallel columns at the same length on every AnimationPlayer write -- a variable array<T> column does not tail-pad a short write`;
    super(
      `AnimationPlayer slot length mismatch on entity ${entity}: clips=${clips}, times=${times}, weights=${weights}, speeds=${speeds}`
    );
    this.name = "AnimationPlayerSlotLengthMismatchError";
    this.expected = expected;
    this.hint = hint;
    this.detail = detail;
  }
};

// src/systems/advance-animation-player.ts
var ADVANCE_ANIMATION_PLAYER_SYSTEM = "advanceAnimationPlayer";
var AnimationSet = defineSystemSet({ name: "animation" });
function _resetAnimationWarnsForTests2(world) {
  _resetAnimationWarnsForTests(world);
  targetMapCacheByWorld.delete(world);
}
function advanceAnimationPlayer(world, dt) {
  refreshTargetMaps(world);
  const query = world.query({ with: [AnimationPlayer] }).unwrap();
  const entities = [];
  for (const row of query) entities.push(row.entity);
  for (const entityRaw of entities) {
    advanceOnePlayer(world, entityRaw, dt);
  }
}
function advanceOnePlayer(world, entityRaw, dt) {
  const entity = entityRaw;
  const apRes = world.get(entity, AnimationPlayer);
  if (!apRes.ok) return;
  const ap = apRes.value;
  const count = ap.clips.length;
  if (ap.times.length !== count || ap.weights.length !== count || ap.speeds.length !== count) {
    throw new AnimationPlayerSlotLengthMismatchError({
      entity: entityRaw,
      clips: count,
      times: ap.times.length,
      weights: ap.weights.length,
      speeds: ap.speeds.length
    });
  }
  if (count === 0) return;
  const newTimes = new Float32Array(ap.times);
  const activeSlots = collectActiveSlotsAndAdvanceTimes(world, ap, newTimes, dt);
  world.set(entity, AnimationPlayer, { times: newTimes });
  if (activeSlots.length === 0) return;
  tickEntityTargets(world, entity, entityRaw, activeSlots);
}
function collectActiveSlotsAndAdvanceTimes(world, ap, newTimes, dt) {
  const paused = ap.paused;
  const looping = ap.looping;
  const count = ap.clips.length;
  const activeSlots = [];
  for (let i = 0; i < count; i++) {
    const clipHandleRaw = ap.clips[i] ?? 0;
    if (clipHandleRaw === 0) continue;
    const clipLookup = world.sharedRefs.resolve(
      toShared(clipHandleRaw)
    );
    if (!clipLookup.ok) throw clipLookup.error;
    const clip = clipLookup.value;
    const speed = ap.speeds[i] ?? 0;
    let newTime = paused ? ap.times[i] ?? 0 : (ap.times[i] ?? 0) + speed * dt;
    const duration = clip.duration;
    if (duration > 0) {
      if (looping) {
        newTime = newTime % duration;
        if (newTime < 0) newTime += duration;
      } else if (newTime > duration) {
        newTime = duration;
      } else if (newTime < 0) {
        newTime = 0;
      }
    }
    newTimes[i] = newTime;
    const wRaw = ap.weights[i] ?? 0;
    const w = wRaw > 0 ? wRaw : 0;
    if (w === 0) continue;
    activeSlots.push({ clip, clipHandleRaw, weight: w, time: newTime, slotIdx: i });
  }
  return activeSlots;
}
var targetMapCacheByWorld = /* @__PURE__ */ new WeakMap();
function refreshTargetMaps(world) {
  let cache = targetMapCacheByWorld.get(world);
  if (cache === void 0) {
    cache = {
      projection: createStateProjection(
        world,
        [AnimationTargets, AnimationTargetId, AnimatedBy, Transform2],
        [AnimationTargets, AnimationTargetId, AnimatedBy]
      ),
      bindings: /* @__PURE__ */ new Map(),
      players: /* @__PURE__ */ new Map()
    };
    targetMapCacheByWorld.set(world, cache);
  }
  const batch = cache.projection.read();
  for (const index of batch.indices) {
    const old = cache.bindings.get(index);
    const entity = cache.projection.entity(index);
    if (entity === void 0) {
      if (old?.player !== void 0) cache.players.delete(old.player);
      if (old !== void 0) cache.players.delete(old.entity);
      cache.bindings.delete(index);
      continue;
    }
    const bindingChanged = batch.membershipChanged || old?.entity !== entity || cache.projection.changed(entity, AnimatedBy) || cache.projection.changed(entity, AnimationTargetId);
    const by = bindingChanged ? world.get(entity, AnimatedBy) : void 0;
    const id = bindingChanged ? world.get(entity, AnimationTargetId) : void 0;
    const next = {
      entity,
      player: bindingChanged ? by?.ok ? by.value.player ?? void 0 : void 0 : old?.player,
      id: bindingChanged ? id?.ok ? id.value.value : void 0 : old?.id,
      transform: world.hasComponent(entity, Transform2)
    };
    if (old?.entity !== entity || old.player !== next.player || old.id !== next.id || old.transform !== next.transform) {
      if (old?.player !== void 0) cache.players.delete(old.player);
      if (next.player !== void 0) cache.players.delete(next.player);
    }
    if (batch.membershipChanged || cache.projection.changed(entity, AnimationTargets))
      cache.players.delete(entity);
    cache.bindings.set(index, next);
  }
  batch.accept();
}
function targetMapForPlayer(world, player) {
  const cache = targetMapCacheByWorld.get(world);
  const cached = cache?.players.get(player);
  if (cached !== void 0) return cached;
  const built = buildTargetMap(world, player);
  cache?.players.set(player, built);
  return built;
}
function buildTargetMap(world, player) {
  const targets = world.get(player, AnimationTargets);
  if (!targets.ok) {
    return {
      entities: /* @__PURE__ */ new Map(),
      missingTransforms: /* @__PURE__ */ new Map(),
      duplicateIds: /* @__PURE__ */ new Set(),
      hasStaleTarget: false,
      resolvedClips: /* @__PURE__ */ new WeakMap()
    };
  }
  const result = /* @__PURE__ */ new Map();
  const missingTransforms = /* @__PURE__ */ new Map();
  const seen = /* @__PURE__ */ new Set();
  const ambiguous = /* @__PURE__ */ new Set();
  let hasStaleTarget = false;
  for (const raw of targets.value.targets) {
    if (raw === ENTITY_NULL_RAW) continue;
    const target = raw;
    const id = world.get(target, AnimationTargetId);
    if (!id.ok) {
      hasStaleTarget = true;
      continue;
    }
    const targetId = id.value.value;
    if (ambiguous.has(targetId)) continue;
    if (seen.has(targetId)) {
      result.delete(targetId);
      missingTransforms.delete(targetId);
      ambiguous.add(targetId);
      continue;
    }
    seen.add(targetId);
    if (world.get(target, Transform2).ok) result.set(targetId, target);
    else missingTransforms.set(targetId, target);
  }
  return {
    entities: result,
    missingTransforms,
    duplicateIds: ambiguous,
    hasStaleTarget,
    resolvedClips: /* @__PURE__ */ new WeakMap()
  };
}
function tickEntityTargets(world, entity, entityRaw, activeSlots) {
  const targetMap = targetMapForPlayer(world, entity);
  const accumulators = /* @__PURE__ */ new Map();
  const morphAccumulators = /* @__PURE__ */ new Map();
  const slotCoverage = [];
  const wantsCoverage = activeSlots.length >= 2 && isAnimationDevMode();
  if (wantsCoverage) {
    for (let i = 0; i < activeSlots.length; i++) slotCoverage.push(/* @__PURE__ */ new Map());
  }
  for (let slotIdx = 0; slotIdx < activeSlots.length; slotIdx++) {
    const slot = activeSlots[slotIdx];
    const resolvedTargets = resolveClipTargets(world, entityRaw, slot, targetMap);
    for (let chIdx = 0; chIdx < slot.clip.channels.length; chIdx++) {
      const channel = slot.clip.channels[chIdx];
      const sampled = sampleChannel(channel.sampler, slot.time, channel.property);
      if (sampled === void 0) continue;
      const target = channel.property === "weights" ? resolveChannelTarget(
        world,
        entityRaw,
        slot.clipHandleRaw,
        chIdx,
        channel.targetId,
        channel.property,
        sampled.length,
        targetMap
      ) : resolvedTargets[chIdx];
      if (target === void 0) continue;
      const targetRaw = target;
      if (channel.property === "weights") {
        let weights = morphAccumulators.get(targetRaw);
        if (weights === void 0) {
          weights = { values: new Float32Array(sampled.length), sumW: 0 };
          morphAccumulators.set(targetRaw, weights);
        }
        if (weights.values.length !== sampled.length) continue;
        for (let i = 0; i < sampled.length; i++) {
          weights.values[i] = (weights.values[i] ?? 0) + slot.weight * (sampled[i] ?? 0);
        }
        weights.sumW += slot.weight;
        if (wantsCoverage) {
          const coverage = slotCoverage[slotIdx];
          if (coverage !== void 0) {
            recordSlotCoverage(coverage, channel.targetId, channel.property, chIdx);
          }
        }
        continue;
      }
      let acc = accumulators.get(targetRaw);
      if (acc === void 0) {
        acc = createAccumulator();
        accumulators.set(targetRaw, acc);
      }
      foldChannelIntoAccumulator(acc, channel.property, sampled, slot.weight);
      if (wantsCoverage) {
        recordSlotCoverage(slotCoverage[slotIdx], channel.targetId, channel.property, chIdx);
      }
    }
  }
  if (wantsCoverage) {
    emitMissingOnSomeSlotWarns(world, entityRaw, activeSlots, slotCoverage);
  }
  for (const [targetRaw, acc] of accumulators) {
    const target = targetRaw;
    const partial = finalizeAccumulator(acc);
    if (Object.keys(partial).length > 0) {
      world.set(target, Transform2, partial);
    }
  }
  for (const [targetRaw, acc] of morphAccumulators) {
    if (acc.sumW <= 0) continue;
    const target = targetRaw;
    const weights = world.get(target, MorphWeights);
    if (weights.ok && weights.value.weights.length === acc.values.length) {
      const next = new Float32Array(acc.values.length);
      for (let i = 0; i < next.length; i++) next[i] = (acc.values[i] ?? 0) / acc.sumW;
      world.set(target, MorphWeights, { weights: next });
    }
  }
}
function resolveClipTargets(world, player, slot, targetMap) {
  const cached = targetMap.resolvedClips.get(slot.clip);
  if (cached !== void 0) return cached;
  const targets = slot.clip.channels.map(
    (channel, channelIndex) => channel.property === "weights" ? void 0 : resolveChannelTarget(
      world,
      player,
      slot.clipHandleRaw,
      channelIndex,
      channel.targetId,
      channel.property,
      void 0,
      targetMap
    )
  );
  targetMap.resolvedClips.set(slot.clip, targets);
  return targets;
}
function resolveChannelTarget(world, player, clip, channel, targetId, property, expectedWeightCount, targetMap) {
  if (targetMap.duplicateIds.has(targetId)) {
    emitTargetDiagnostic(
      world,
      player,
      clip,
      channel,
      targetId,
      "animation-target-id-duplicate",
      "target-id-duplicate",
      "assign a unique AnimationTargetId to each target owned by this player"
    );
    return void 0;
  }
  const target = targetMap.entities.get(targetId);
  if (target === void 0) {
    const transformMissingTarget = targetMap.missingTransforms.get(targetId);
    if (transformMissingTarget !== void 0) {
      emitTargetDiagnostic(
        world,
        player,
        clip,
        channel,
        targetId,
        "animation-target-transform-missing",
        "transform-missing",
        "attach Transform to the bound animation target",
        transformMissingTarget
      );
      return void 0;
    }
    emitTargetDiagnostic(
      world,
      player,
      clip,
      channel,
      targetId,
      targetMap.hasStaleTarget ? "animation-target-owner-stale" : "animation-target-missing",
      targetMap.hasStaleTarget ? "target-stale" : "target-missing",
      targetMap.hasStaleTarget ? "remove the stale target relation or bind a live replacement" : "bind the matching AnimationTargetId to this player"
    );
    return void 0;
  }
  if (property === "weights") {
    const weights = world.get(target, MorphWeights);
    if (!weights.ok) {
      emitAnimationDiagnostic(world, {
        code: "animation-target-morph-weights-missing",
        hint: "attach MorphWeights to the morph target entity before playing a weights channel",
        detail: {
          player,
          clip,
          channel,
          targetId,
          reason: "morph-weights-missing",
          target,
          property,
          ...expectedWeightCount === void 0 ? {} : { expectedWeightCount }
        }
      });
      return void 0;
    }
    if (expectedWeightCount !== void 0 && weights.value.weights.length !== expectedWeightCount) {
      emitAnimationDiagnostic(world, {
        code: "animation-morph-weight-count-mismatch",
        hint: "make MorphWeights.length equal the animation channel output width",
        detail: {
          player,
          clip,
          channel,
          targetId,
          reason: "morph-weight-count-mismatch",
          target,
          property,
          expectedWeightCount,
          actualWeightCount: weights.value.weights.length
        }
      });
      return void 0;
    }
    return target;
  }
  if (!world.get(target, Transform2).ok) {
    emitTargetDiagnostic(
      world,
      player,
      clip,
      channel,
      targetId,
      "animation-target-transform-missing",
      "transform-missing",
      "attach Transform to the bound animation target",
      target
    );
    return void 0;
  }
  return target;
}
function recordSlotCoverage(cov, targetId, kind, chIdx) {
  let perTarget = cov.get(targetId);
  if (perTarget === void 0) {
    perTarget = /* @__PURE__ */ new Map();
    cov.set(targetId, perTarget);
  }
  if (!perTarget.has(kind)) perTarget.set(kind, chIdx);
}
function emitTargetDiagnostic(world, entityRaw, clipHandleRaw, chIdx, targetId, code, reason, hint, target) {
  emitAnimationDiagnostic(world, {
    code,
    hint,
    detail: {
      player: entityRaw,
      clip: clipHandleRaw,
      channel: chIdx,
      targetId,
      reason,
      ...target === void 0 ? {} : { target }
    }
  });
}
function emitMissingOnSomeSlotWarns(world, entityRaw, activeSlots, slotCoverage) {
  const union = /* @__PURE__ */ new Map();
  for (const cov of slotCoverage) {
    for (const [targetId, kindMap] of cov) {
      let set = union.get(targetId);
      if (set === void 0) {
        set = /* @__PURE__ */ new Set();
        union.set(targetId, set);
      }
      for (const kind of kindMap.keys()) set.add(kind);
    }
  }
  for (const [targetId, unionKinds] of union) {
    for (let slotIdx = 0; slotIdx < activeSlots.length; slotIdx++) {
      const cov = slotCoverage[slotIdx];
      const slotKinds = cov.get(targetId);
      for (const kind of unionKinds) {
        if (slotKinds?.has(kind)) continue;
        for (let coveringIdx = 0; coveringIdx < activeSlots.length; coveringIdx++) {
          if (coveringIdx === slotIdx) continue;
          const coveringCov = slotCoverage[coveringIdx];
          const coveringKinds = coveringCov.get(targetId);
          if (coveringKinds === void 0) continue;
          const chIdx = coveringKinds.get(kind);
          if (chIdx === void 0) continue;
          const coveringSlot = activeSlots[coveringIdx];
          emitAnimationDiagnostic(world, {
            code: "animation-channel-missing",
            hint: `author the missing ${kind} channel on the slot whose clip lacks it`,
            detail: {
              player: entityRaw,
              clip: coveringSlot.clipHandleRaw,
              channel: chIdx,
              targetId,
              reason: "channel-missing",
              property: kind
            }
          });
          break;
        }
      }
    }
  }
}
function foldChannelIntoAccumulator(acc, property, sampled, weight) {
  if (property === "weights") return;
  if (property === "translation" && sampled.length >= 3) {
    acc.posX += weight * (sampled[0] ?? 0);
    acc.posY += weight * (sampled[1] ?? 0);
    acc.posZ += weight * (sampled[2] ?? 0);
    acc.sumWPos += weight;
    acc.hasPos = true;
    return;
  }
  if (property === "rotation" && sampled.length >= 4) {
    const qx = sampled[0] ?? 0;
    const qy = sampled[1] ?? 0;
    const qz = sampled[2] ?? 0;
    const qw = sampled[3] ?? 1;
    if (!acc.hasQuat) {
      acc.refQX = qx;
      acc.refQY = qy;
      acc.refQZ = qz;
      acc.refQW = qw;
      acc.quatX = weight * qx;
      acc.quatY = weight * qy;
      acc.quatZ = weight * qz;
      acc.quatW = weight * qw;
      acc.hasQuat = true;
    } else {
      const dot = acc.refQX * qx + acc.refQY * qy + acc.refQZ * qz + acc.refQW * qw;
      const sign = dot < 0 ? -1 : 1;
      acc.quatX += weight * sign * qx;
      acc.quatY += weight * sign * qy;
      acc.quatZ += weight * sign * qz;
      acc.quatW += weight * sign * qw;
    }
    acc.sumWQuat += weight;
    return;
  }
  if (property === "scale" && sampled.length >= 3) {
    acc.scaleX += weight * (sampled[0] ?? 1);
    acc.scaleY += weight * (sampled[1] ?? 1);
    acc.scaleZ += weight * (sampled[2] ?? 1);
    acc.sumWScale += weight;
    acc.hasScale = true;
  }
}
function finalizeAccumulator(acc) {
  const partial = {};
  if (acc.hasPos && acc.sumWPos > 0) {
    partial.pos = [acc.posX / acc.sumWPos, acc.posY / acc.sumWPos, acc.posZ / acc.sumWPos];
  }
  if (acc.hasQuat && acc.sumWQuat > 0) {
    const qx = acc.quatX / acc.sumWQuat;
    const qy = acc.quatY / acc.sumWQuat;
    const qz = acc.quatZ / acc.sumWQuat;
    const qw = acc.quatW / acc.sumWQuat;
    const len = Math.sqrt(qx * qx + qy * qy + qz * qz + qw * qw);
    if (len > 0) {
      partial.quat = [qx / len, qy / len, qz / len, qw / len];
    }
  }
  if (acc.hasScale && acc.sumWScale > 0) {
    partial.scale = [
      acc.scaleX / acc.sumWScale,
      acc.scaleY / acc.sumWScale,
      acc.scaleZ / acc.sumWScale
    ];
  }
  return partial;
}
function createAccumulator() {
  return {
    posX: 0,
    posY: 0,
    posZ: 0,
    sumWPos: 0,
    hasPos: false,
    refQX: 0,
    refQY: 0,
    refQZ: 0,
    refQW: 1,
    quatX: 0,
    quatY: 0,
    quatZ: 0,
    quatW: 0,
    sumWQuat: 0,
    hasQuat: false,
    scaleX: 0,
    scaleY: 0,
    scaleZ: 0,
    sumWScale: 0,
    hasScale: false
  };
}
function sampleChannel(sampler, time, property) {
  const { input, output, interpolation } = sampler;
  if (input.length === 0) return void 0;
  const elementCount = output.length / input.length;
  if (time <= input[0]) {
    return sliceOutput(output, 0, elementCount);
  }
  const lastIdx = input.length - 1;
  if (time >= input[lastIdx]) {
    return sliceOutput(output, lastIdx, elementCount);
  }
  let lo = 0;
  let hi = input.length - 1;
  while (hi - lo > 1) {
    const mid = lo + hi >> 1;
    if (input[mid] <= time) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const prev = lo;
  const next = hi;
  if (interpolation === "STEP") {
    return sliceOutput(output, prev, elementCount);
  }
  const t0 = input[prev];
  const t1 = input[next];
  const alpha = (time - t0) / (t1 - t0);
  const prevValues = sliceOutput(output, prev, elementCount);
  const nextValues = sliceOutput(output, next, elementCount);
  if (property === "rotation") {
    const px = prevValues[0] ?? 0;
    const py = prevValues[1] ?? 0;
    const pz = prevValues[2] ?? 0;
    const pw = prevValues[3] ?? 1;
    let nx = nextValues[0] ?? 0;
    let ny = nextValues[1] ?? 0;
    let nz = nextValues[2] ?? 0;
    let nw = nextValues[3] ?? 1;
    let dot = px * nx + py * ny + pz * nz + pw * nw;
    if (dot < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
      nw = -nw;
      dot = -dot;
    }
    if (dot > 0.9995) {
      const lx = px + alpha * (nx - px);
      const ly = py + alpha * (ny - py);
      const lz = pz + alpha * (nz - pz);
      const lw = pw + alpha * (nw - pw);
      const len = Math.sqrt(lx * lx + ly * ly + lz * lz + lw * lw);
      return len > 0 ? [lx / len, ly / len, lz / len, lw / len] : [0, 0, 0, 1];
    }
    const theta = Math.acos(dot);
    const sinTheta = Math.sin(theta);
    const sa = Math.sin((1 - alpha) * theta) / sinTheta;
    const sb = Math.sin(alpha * theta) / sinTheta;
    return [px * sa + nx * sb, py * sa + ny * sb, pz * sa + nz * sb, pw * sa + nw * sb];
  }
  return prevValues.map((value, index) => value + alpha * ((nextValues[index] ?? value) - value));
}
function sliceOutput(output, index, elementCount) {
  const result = [];
  const base = index * elementCount;
  for (let i = 0; i < elementCount; i++) {
    result.push(output[base + i]);
  }
  return result;
}
var AdvanceAnimationPlayer = defineSystem({
  name: ADVANCE_ANIMATION_PLAYER_SYSTEM,
  queries: [],
  before: ["propagateTransforms"],
  fn: (world) => {
    advanceAnimationPlayer(world, world.getResource(Time).delta);
  }
});
function registerAdvanceAnimationPlayer(world) {
  world.addSystems(Update, AnimationSet, [AdvanceAnimationPlayer]).unwrap();
  return () => {
    world.removeSystem(Update, ADVANCE_ANIMATION_PLAYER_SYSTEM);
  };
}

// src/systems/evaluate-animation-graph.ts
import { resolveAssetHandle } from "../../assets-runtime/dist/index.mjs";
import { defineSystem as defineSystem2, Time as Time2, Update as Update2 } from "../../ecs/dist/index.mjs";

// src/resolve-animation-asset.ts
import { err as err4, ok as ok4 } from "../../types/dist/index.mjs";
var AnimationAssetError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`[AnimationAssetError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "AnimationAssetError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
  }
};
function resolveAnimationAsset(world, guid, expectedKind, lookup) {
  if (guid.length === 0) {
    return err4(
      new AnimationAssetError({
        code: "animation-asset-not-found",
        expected: `a durable ${expectedKind} GUID`,
        hint: "load the animation asset by GUID before evaluating the graph",
        detail: { guid, expectedKind, lookupCode: "guid-empty" }
      })
    );
  }
  let asset;
  try {
    asset = lookup(guid);
  } catch {
    return err4(
      new AnimationAssetError({
        code: "animation-asset-not-found",
        expected: `a loaded ${expectedKind} payload for GUID ${guid}`,
        hint: "repair the animation asset lookup provider and retry resolution",
        detail: { guid, expectedKind, lookupCode: "lookup-threw" }
      })
    );
  }
  if (asset !== void 0 && "code" in asset && asset.code === "stale") {
    return err4(
      new AnimationAssetError({
        code: "animation-asset-stale",
        expected: `a current ${expectedKind} payload for GUID ${guid}`,
        hint: "rebuild the stale asset projection before evaluating the graph",
        detail: { guid, expectedKind, lookupCode: "asset-stale" }
      })
    );
  }
  if (asset === void 0) {
    return err4(
      new AnimationAssetError({
        code: "animation-asset-not-found",
        expected: `a loaded ${expectedKind} payload for GUID ${guid}`,
        hint: "load or retain the referenced animation asset before evaluating the graph",
        detail: { guid, expectedKind, lookupCode: "asset-not-found" }
      })
    );
  }
  const payload = asset;
  if (payload.kind !== expectedKind) {
    return err4(
      new AnimationAssetError({
        code: "animation-asset-kind-mismatch",
        expected: `asset kind '${expectedKind}'`,
        hint: `replace GUID ${guid} with a loaded ${expectedKind} asset`,
        detail: {
          guid,
          expectedKind,
          actualKind: payload.kind,
          lookupCode: "asset-kind-mismatch"
        }
      })
    );
  }
  const target = expectedKind === "animation-clip" ? "AnimationClip" : "AnimationGraph";
  const handle = world.internSharedRef(target, payload);
  return ok4({ guid, asset: payload, handle });
}

// src/systems/evaluate-animation-graph.ts
var EVALUATE_ANIMATION_GRAPH_SYSTEM = "evaluateAnimationGraph";
function readAt(arr, i, dflt) {
  return i >= 0 && i < arr.length ? arr[i] ?? dflt : dflt;
}
function wrapTime(time, duration, looping) {
  if (duration <= 0) return time;
  if (looping) {
    let wrapped = time % duration;
    if (wrapped < 0) wrapped += duration;
    return wrapped;
  }
  if (time > duration) return duration;
  if (time < 0) return 0;
  return time;
}
function evaluateAnimationGraph(world, dt, lookup = () => void 0) {
  const query = world.query({ with: [AnimationPlayer] }).unwrap();
  const entities = [];
  for (const row of query) entities.push(row.entity);
  for (const entityRaw of entities) {
    evaluateOneEntity(world, entityRaw, dt, lookup);
  }
}
function evaluateOneEntity(world, entityRaw, dt, lookup) {
  const entity = entityRaw;
  const apRes = world.get(entity, AnimationPlayer);
  if (!apRes.ok) return;
  const ap = apRes.value;
  const graphRaw = ap.graph;
  if (graphRaw === 0) return;
  const graphLookup = resolveAssetHandle(
    world,
    graphRaw
  );
  if (!graphLookup.ok) throw graphLookup.error;
  const graph = graphLookup.value;
  const nodes = graph.nodes;
  if (nodes.length === 0) return;
  const clipNodeIndices = [];
  const clipHandles = [];
  const clipDurations = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node === void 0 || node.type !== "clip") continue;
    const clipLookup = resolveAnimationAsset(
      world,
      node.clip,
      "animation-clip",
      (guid) => {
        return lookup(guid);
      }
    );
    if (!clipLookup.ok) throw clipLookup.error;
    const handle = clipLookup.value.handle;
    clipNodeIndices.push(i);
    clipHandles.push(handle);
    clipDurations.push(clipLookup.value.asset.duration);
  }
  const effByNode = /* @__PURE__ */ new Map();
  const runtimeWeight = (n) => readAt(ap.nodeWeights, n, 1);
  const evalNode = (nodeIndex, incoming) => {
    const node = nodes[nodeIndex];
    if (node === void 0) return;
    const eff = incoming * runtimeWeight(nodeIndex) * node.weight;
    switch (node.type) {
      case "clip":
        effByNode.set(nodeIndex, (effByNode.get(nodeIndex) ?? 0) + eff);
        return;
      case "blend": {
        let total = 0;
        for (const child of node.children)
          total += runtimeWeight(child) * (nodes[child]?.weight ?? 0);
        if (total > 0) {
          for (const child of node.children) evalNode(child, eff / total);
        }
        return;
      }
      case "add":
        evalNode(node.base, eff);
        for (const layer of node.additive) evalNode(layer, eff);
        return;
    }
  };
  evalNode(graph.root, 1);
  const newNodeTimes = new Float32Array(nodes.length);
  for (let i = 0; i < nodes.length; i++) newNodeTimes[i] = readAt(ap.nodeTimes, i, 0);
  for (let k = 0; k < clipNodeIndices.length; k++) {
    const nodeIndex = clipNodeIndices[k];
    const duration = clipDurations[k];
    const current = readAt(ap.nodeTimes, nodeIndex, 0);
    const speed = readAt(ap.nodeSpeeds, nodeIndex, 0);
    const advanced = ap.paused ? current : current + speed * dt;
    newNodeTimes[nodeIndex] = wrapTime(advanced, duration, ap.looping);
  }
  const slotCount = clipNodeIndices.length;
  const times = new Float32Array(slotCount);
  const weights = new Float32Array(slotCount);
  const speeds = new Float32Array(slotCount);
  for (let k = 0; k < slotCount; k++) {
    const nodeIndex = clipNodeIndices[k];
    weights[k] = effByNode.get(nodeIndex) ?? 0;
    times[k] = newNodeTimes[nodeIndex] ?? 0;
    speeds[k] = 0;
  }
  world.set(entity, AnimationPlayer, {
    clips: clipHandles,
    times,
    weights,
    speeds,
    nodeTimes: newNodeTimes
  });
}
var EvaluateAnimationGraph = defineSystem2({
  name: EVALUATE_ANIMATION_GRAPH_SYSTEM,
  queries: [],
  before: [ADVANCE_ANIMATION_PLAYER_SYSTEM],
  fn: (world) => {
    evaluateAnimationGraph(world, world.getResource(Time2).delta);
  }
});
function registerEvaluateAnimationGraph(world, lookup = () => void 0) {
  world.addSystem(Update2, {
    name: EVALUATE_ANIMATION_GRAPH_SYSTEM,
    queries: [],
    before: [ADVANCE_ANIMATION_PLAYER_SYSTEM],
    fn: (world2) => {
      evaluateAnimationGraph(world2, world2.getResource(Time2).delta, lookup);
    }
  }).unwrap();
  return () => {
    world.removeSystem(Update2, EVALUATE_ANIMATION_GRAPH_SYSTEM);
  };
}

// src/plugin.ts
var ANIMATION_COMPONENTS = [
  AnimationPlayer,
  AnimatedBy,
  AnimationTargetId,
  AnimationTargets
];
function registerAnimationComponents(world) {
  const leases = ANIMATION_COMPONENTS.map(
    (component) => world.components.register(component).unwrap()
  );
  return () => {
    for (let index = leases.length - 1; index >= 0; index -= 1) leases[index]?.dispose();
  };
}
function animationPayloadsPlugin(lookup) {
  return {
    name: "animation-payloads",
    provide: "animationPayloads",
    apply(ctx) {
      ctx.provide("animationPayloads", lookup);
    }
  };
}
function animationRuntimePlugin() {
  return {
    name: "animation",
    inject: ["world", "animationPayloads"],
    apply(ctx) {
      ctx.effect(() => registerAnimationComponents(ctx.world), "animation/components");
      ctx.effect(
        () => registerEvaluateAnimationGraph(ctx.world, ctx.animationPayloads),
        "animation/evaluate-graph"
      );
      ctx.effect(() => registerAdvanceAnimationPlayer(ctx.world), "animation/advance-player");
    }
  };
}
function animationPlugin(lookup) {
  return {
    name: "animation",
    inject: ["world"],
    apply(ctx) {
      ctx.effect(() => registerAnimationComponents(ctx.world), "animation/components");
      ctx.effect(
        () => registerEvaluateAnimationGraph(ctx.world, lookup),
        "animation/evaluate-graph"
      );
      ctx.effect(() => registerAdvanceAnimationPlayer(ctx.world), "animation/advance-player");
    }
  };
}
export {
  ADVANCE_ANIMATION_PLAYER_SYSTEM,
  AdvanceAnimationPlayer,
  AnimatedBy,
  AnimationAssetError,
  AnimationPlayer,
  AnimationSet,
  AnimationTargetId,
  AnimationTargets,
  EvaluateAnimationGraph,
  _resetAnimationWarnsForTests2 as _resetAnimationWarnsForTests,
  advanceAnimationPlayer,
  animationClipContribution,
  animationGraphContribution,
  animationGraphNodeChildren,
  animationPayloadsPlugin,
  animationPlugin,
  animationRuntimePlugin,
  bindAnimationTargets,
  defineAnimationGraph,
  deriveAnimationTargetId,
  describeAnimationGraph,
  evaluateAnimationGraph,
  isAnimationTargetId,
  registerAdvanceAnimationPlayer,
  resolveAnimationAsset,
  serializeAnimationGraph,
  subscribeAnimationDiagnostics
};
