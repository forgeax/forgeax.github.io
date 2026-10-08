import { ok, err } from '../../types/dist/index.mjs';
export { AUDIO_ERROR_HINTS, AudioError } from '../../types/dist/index.mjs';
import { defineComponent, Update } from '../../ecs/dist/index.mjs';
import { PROPAGATE_TRANSFORMS_SYSTEM, GlobalTransform } from '../../scene/dist/index.mjs';

// src/index.ts
var audioContribution = {
  kind: { kind: "audio" },
  consumer: "AudioBackend",
  decoder: {
    async decode({ envelope, artifacts }) {
      const payload = envelope.payload;
      if (payload !== null && typeof payload === "object") {
        const source = payload;
        let bytes = source.bytes instanceof Uint8Array ? source.bytes : Array.isArray(source.bytes) ? Uint8Array.from(source.bytes) : void 0;
        const body = envelope.artifacts.body ?? envelope.artifacts.source;
        if (body !== void 0) {
          const bodyBytes = await artifacts.read(body);
          if (!bodyBytes.ok) return bodyBytes;
          bytes = bodyBytes.value;
        }
        if (source.kind === "audio" && typeof source.mediaType === "string" && source.mediaType.startsWith("audio/") && bytes !== void 0 && bytes.byteLength > 0) {
          return ok({
            kind: "audio",
            sourceKey: typeof source.sourceKey === "string" && source.sourceKey.length > 0 ? source.sourceKey : envelope.guid,
            mediaType: source.mediaType,
            bytes
          });
        }
      }
      return err({
        code: "asset-package-invalid",
        expected: "an audio payload with non-empty source bytes and audio mediaType",
        hint: "recook the audio source with a browser-supported media type",
        detail: { guid: envelope.guid, reason: "audio owner validation failed" }
      });
    }
  }
};

// src/audio-backend.ts
var AUDIO_ENGINE_RESOURCE_KEY = "AudioEngine";

// src/audio-intent.ts
function sameBytes(left, right) {
  if (left.byteLength !== right.byteLength) return false;
  for (let index = 0; index < left.byteLength; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}
var DISCONNECTED_AUDIO_STATE = {
  contextState: "suspended",
  activeSourceCount: 0,
  lastError: null
};
function createAudioIntentBackend(options) {
  const publishedSources = /* @__PURE__ */ new Map();
  let destroyed = false;
  const emit = (intent) => {
    if (!destroyed || intent.kind === "destroy") options.emit(intent);
  };
  const backend = {
    play(entityId, clip, playOptions) {
      const publishedBytes = publishedSources.get(clip.sourceKey);
      const publishBytes = publishedBytes === void 0 || !sameBytes(publishedBytes, clip.bytes);
      if (publishBytes) publishedSources.set(clip.sourceKey, clip.bytes.slice());
      emit({
        kind: "play",
        entityId,
        sourceKey: clip.sourceKey,
        ...publishBytes ? { bytes: clip.bytes } : {},
        options: playOptions
      });
    },
    stop: (entityId) => emit({ kind: "stop", entityId }),
    setVolume: (entityId, volume) => emit({ kind: "set-volume", entityId, volume }),
    setBusVolume: (bus, volume) => {
      const intent = { kind: "set-bus-volume", bus, volume };
      emit(intent);
    },
    setBusMute: (bus, muted) => {
      const intent = { kind: "set-bus-mute", bus, muted };
      emit(intent);
    },
    setListenerPose: (pose) => {
      const intent = { kind: "set-listener-pose", pose };
      emit(intent);
    },
    getState: () => options.state?.() ?? DISCONNECTED_AUDIO_STATE,
    getActiveSourceCount: () => (options.state?.() ?? DISCONNECTED_AUDIO_STATE).activeSourceCount,
    destroy() {
      if (destroyed) return;
      const intent = { kind: "destroy" };
      emit(intent);
      destroyed = true;
      publishedSources.clear();
    }
  };
  return backend;
}
function audioIntentErrorState(error) {
  return { contextState: "suspended", activeSourceCount: 0, lastError: error };
}
var AudioSource = defineComponent("AudioSource", {
  clip: { type: "shared<AudioClipAsset>" },
  playing: { type: "bool", default: false },
  loop: { type: "bool", default: false },
  volume: { type: "f32", default: 1 },
  spatialBlend: { type: "f32", default: 0 },
  bus: { type: "string", default: "sfx" }
});
var AudioListener = defineComponent("AudioListener", {});

// src/audio-tick-system.ts
function listenerPoseFromWorldMatrix(world) {
  const forwardLength = Math.hypot(world[8] ?? 0, world[9] ?? 0, world[10] ?? 0) || 1;
  const upLength = Math.hypot(world[4] ?? 0, world[5] ?? 0, world[6] ?? 0) || 1;
  return {
    positionX: world[12] ?? 0,
    positionY: world[13] ?? 0,
    positionZ: world[14] ?? 0,
    forwardX: -(world[8] ?? 0) / forwardLength,
    forwardY: -(world[9] ?? 0) / forwardLength,
    forwardZ: -(world[10] ?? 0) / forwardLength,
    upX: (world[4] ?? 0) / upLength,
    upY: (world[5] ?? 0) / upLength,
    upZ: (world[6] ?? 0) / upLength
  };
}
function detectEdge(previous, current) {
  if (!previous && current) return "play-start";
  if (previous && !current) return "play-stop";
  return "none";
}
function detectRemovedEntities(previous, current) {
  const currentSet = new Set(current);
  return previous.filter((entity) => !currentSet.has(entity));
}
var states = /* @__PURE__ */ new WeakMap();
function stateFor(backend) {
  const existing = states.get(backend);
  if (existing !== void 0) return existing;
  const created = {
    playing: /* @__PURE__ */ new Map(),
    previousEntities: /* @__PURE__ */ new Set(),
    volumes: /* @__PURE__ */ new Map()
  };
  states.set(backend, created);
  return created;
}
function createClipResolver(world) {
  return (clipHandle) => {
    const resolved = world.sharedRefs.resolve(
      clipHandle
    );
    return resolved.ok && resolved.value.kind === "audio" ? resolved.value : void 0;
  };
}
function audioTickSystem(world, backend) {
  const state = stateFor(backend);
  const resolveClip = createClipResolver(world);
  const currentEntities = [];
  const query = world.query({ read: [AudioSource] });
  if (!query.ok) return;
  for (const queryRow of query.value) {
    const entity = queryRow.entity;
    const source = queryRow.get(AudioSource);
    const playing = source.playing === true;
    const previous = state.playing.get(entity) ?? false;
    const edge = detectEdge(previous, playing);
    if (edge === "play-start") {
      const clip = resolveClip(source.clip);
      if (clip === void 0) {
        state.playing.set(entity, false);
      } else {
        const options = {
          loop: source.loop === true,
          volume: typeof source.volume === "number" ? source.volume : 1,
          spatialBlend: typeof source.spatialBlend === "number" ? source.spatialBlend : 0,
          bus: typeof source.bus === "string" ? source.bus : "sfx"
        };
        backend.play(entity, clip, options);
        state.playing.set(entity, true);
        state.volumes.set(entity, options.volume);
      }
    } else {
      state.playing.set(entity, playing);
      if (edge === "play-stop") {
        backend.stop(entity);
      } else if (playing && typeof source.volume === "number" && state.volumes.get(entity) !== source.volume) {
        backend.setVolume(entity, source.volume);
        state.volumes.set(entity, source.volume);
      }
    }
    currentEntities.push(entity);
  }
  for (const entity of detectRemovedEntities([...state.previousEntities], currentEntities)) {
    if (state.playing.get(entity) === true) {
      backend.stop(entity);
    }
    state.playing.delete(entity);
    state.volumes.delete(entity);
  }
  state.previousEntities.clear();
  for (const entity of currentEntities) state.previousEntities.add(entity);
}
var AUDIO_TICK_SYSTEM_NAME = "audio-tick";
var AUDIO_COMPONENTS = [AudioSource, AudioListener];
function registerAudioComponents(world) {
  const leases = AUDIO_COMPONENTS.map((component) => world.components.register(component).unwrap());
  return () => {
    for (let index = leases.length - 1; index >= 0; index -= 1) leases[index]?.dispose();
  };
}
function audioPlugin() {
  return {
    name: "audio",
    inject: ["world", "audio"],
    apply(ctx) {
      const world = ctx.world;
      const backend = ctx.audio;
      if (backend === void 0) throw new Error("Cordis activated audio without its provider");
      ctx.effect(() => registerAudioComponents(world), "audio/components");
      ctx.effect(() => {
        world.insertResource(AUDIO_ENGINE_RESOURCE_KEY, backend);
        return () => {
          world.removeResource(AUDIO_ENGINE_RESOURCE_KEY);
        };
      }, "audio/resource");
      ctx.effect(() => {
        world.addSystem(Update, {
          name: AUDIO_TICK_SYSTEM_NAME,
          queries: [],
          fn: () => audioTickSystem(world, backend)
        }).unwrap();
        return () => world.removeSystem(Update, AUDIO_TICK_SYSTEM_NAME);
      }, "audio/tick");
      ctx.effect(() => {
        world.addSystem(Update, {
          name: "audio-listener-sync",
          after: [PROPAGATE_TRANSFORMS_SYSTEM],
          queries: [],
          fn: () => {
            const listeners = world.query({ read: [GlobalTransform], with: [AudioListener] });
            if (!listeners.ok) return;
            for (const row of listeners.value) {
              const transform = row.get(GlobalTransform);
              const pose = listenerPoseFromWorldMatrix(transform.world);
              backend.setListenerPose(pose);
              break;
            }
          }
        }).unwrap();
        return () => world.removeSystem(Update, "audio-listener-sync");
      }, "audio/listener-sync");
    }
  };
}

// src/plugin-service.ts
function audioBackendPlugin(backend) {
  return {
    name: "audio-backend",
    provide: "audio",
    apply(ctx) {
      ctx.provide("audio", backend);
    }
  };
}

export { AUDIO_ENGINE_RESOURCE_KEY, AUDIO_TICK_SYSTEM_NAME, AudioListener, AudioSource, audioBackendPlugin, audioContribution, audioIntentErrorState, audioPlugin, audioTickSystem, createAudioIntentBackend, createClipResolver, detectEdge, detectRemovedEntities, listenerPoseFromWorldMatrix };
