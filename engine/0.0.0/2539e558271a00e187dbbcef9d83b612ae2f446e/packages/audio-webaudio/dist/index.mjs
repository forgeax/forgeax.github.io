import { AudioError, AUDIO_ERROR_HINTS, createAudioIntentBackend } from '../../audio/dist/index.mjs';
export { AUDIO_ENGINE_RESOURCE_KEY } from '../../audio/dist/index.mjs';
import { mat4, vec3 } from '../../math/dist/index.mjs';
import { AssetError, err, ok, AudioError as AudioError$1 } from '../../types/dist/index.mjs';

// src/index.ts
function syncListenerFromWorldMatrix(listener, worldMatrix) {
  const m = worldMatrix;
  const position = mat4.getTranslation(vec3.create(), m);
  listener.positionX.value = position[0];
  listener.positionY.value = position[1];
  listener.positionZ.value = position[2];
  const forward = mat4.getForward(vec3.create(), m);
  listener.forwardX.value = forward[0];
  listener.forwardY.value = forward[1];
  listener.forwardZ.value = forward[2];
  const up = mat4.getUp(vec3.create(), m);
  listener.upX.value = up[0];
  listener.upY.value = up[1];
  listener.upZ.value = up[2];
}
function audioListenerSyncSystem(ctx, worldMatrix) {
  syncListenerFromWorldMatrix(ctx.listener, worldMatrix);
}
async function decodeAudioClipBytes(guid, bytes, mediaType) {
  if (mediaType.length <= "audio/".length || bytes.byteLength === 0) {
    return err(
      new AudioError({
        code: "decode-failed",
        expected: `non-empty audio mediaType and source bytes for GUID ${guid}`,
        hint: "verify the audio artifact mediaType and recook the source bytes",
        detail: {
          code: "decode-failed",
          reason: "audio mediaType or source bytes are empty"
        }
      })
    );
  }
  try {
    return ok({ kind: "audio", sourceKey: guid, mediaType, bytes: bytes.slice() });
  } catch (e) {
    return err(
      new AudioError({
        code: "decode-failed",
        expected: `decodable audio artifact bytes for GUID ${guid}`,
        hint: "verify the audio artifact mediaType and browser-supported codec",
        detail: {
          code: "decode-failed",
          reason: e instanceof Error ? e.message : "audio artifact decode failed"
        }
      })
    );
  }
}

// src/audio-loader.ts
var audioLoader = {
  kind: "audio",
  loadPack(input) {
    if (input.kind !== "audio") {
      return Promise.resolve({
        ok: false,
        error: new AssetError({
          code: "asset-parse-failed",
          expected: "Pack v2 loader input with kind 'audio'",
          hint: "pass the asset-local audio envelope to the audio loader",
          detail: { sourcePath: input.guid }
        })
      });
    }
    const source = input.artifacts.source;
    const payloadMediaType = typeof input.payload.mediaType === "string" ? input.payload.mediaType : void 0;
    if (source === void 0 || !source.descriptor.mediaType.startsWith("audio/") || payloadMediaType !== source.descriptor.mediaType) {
      return Promise.resolve({
        ok: false,
        error: {
          code: "asset-artifact-media-unsupported",
          expected: "an asset-local source artifact with an audio/* mediaType",
          hint: "declare the audio source artifact with a supported mediaType and re-cook",
          detail: {
            guid: input.guid,
            artifactKey: "source",
            observed: payloadMediaType ?? source?.descriptor.mediaType ?? "missing",
            expected: "payload.mediaType matching the audio/* source artifact"
          }
        }
      });
    }
    return decodeAudioClipBytes(input.guid, source.bytes, payloadMediaType);
  },
  async load() {
    return {
      ok: false,
      error: new AssetError({
        code: "asset-parse-failed",
        expected: "Pack v2 audio input with an asset-local source artifact",
        hint: "re-cook the audio source into the Pack v2 asset envelope",
        detail: { sourcePath: "audio-loader-input" }
      })
    };
  }
};
var GESTURE_EVENTS = ["click", "keydown", "touchstart"];
var GAIN_TRANSITION_SECONDS = 0.01;
var WebAudioEngine = class {
  ctx;
  closed = false;
  masterGain;
  sfxGain;
  musicGain;
  sources = /* @__PURE__ */ new Map();
  gestureListening = false;
  resumeInFlight;
  gestureResumeHandler;
  lastError = null;
  // Per-bus previous-volume cache for mute/unmute restore (D-5).
  busVolumes = /* @__PURE__ */ new Map([
    ["sfx", 1],
    ["music", 1]
  ]);
  busMuted = /* @__PURE__ */ new Map([
    ["sfx", false],
    ["music", false]
  ]);
  constructor() {
    this.gestureResumeHandler = () => {
      void this.tryResume();
    };
  }
  /**
   * Returns the Web Audio AudioListener for spatialization (D-2).
   * Triggers lazy ensureContext() on first access.
   * Returns undefined if the context could not be created or is closed.
   */
  get listener() {
    return this.ensureContext().listener;
  }
  setListenerPose(pose) {
    const listener = this.ensureContext().listener;
    listener.positionX.value = pose.positionX;
    listener.positionY.value = pose.positionY;
    listener.positionZ.value = pose.positionZ;
    listener.forwardX.value = pose.forwardX;
    listener.forwardY.value = pose.forwardY;
    listener.forwardZ.value = pose.forwardZ;
    listener.upX.value = pose.upX;
    listener.upY.value = pose.upY;
    listener.upZ.value = pose.upZ;
  }
  // -----------------------------------------------------------------------
  // ensureContext -- lazy AudioContext + bus topology creation
  // -----------------------------------------------------------------------
  ensureContext() {
    if (this.ctx) {
      this.registerGestureListener(this.ctx);
      return this.ctx;
    }
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
    const sfx = ctx.createGain();
    sfx.gain.value = 1;
    sfx.connect(master);
    const music = ctx.createGain();
    music.gain.value = 1;
    music.connect(master);
    this.ctx = ctx;
    this.masterGain = master;
    this.sfxGain = sfx;
    this.musicGain = music;
    this.registerGestureListener(ctx);
    return ctx;
  }
  // -----------------------------------------------------------------------
  // Gesture listener -- D-3 bounded resume retry on user gesture
  // -----------------------------------------------------------------------
  registerGestureListener(ctx) {
    if (ctx.state !== "suspended") {
      return;
    }
    if (this.gestureListening) {
      return;
    }
    this.gestureListening = true;
    for (const event of GESTURE_EVENTS) {
      document.addEventListener(event, this.gestureResumeHandler, { once: true });
    }
  }
  removeGestureListener() {
    if (!this.gestureListening) {
      return;
    }
    this.gestureListening = false;
    for (const event of GESTURE_EVENTS) {
      document.removeEventListener(event, this.gestureResumeHandler);
    }
  }
  async tryResume() {
    const ctx = this.ctx;
    if (!ctx || this.closed || ctx.state !== "suspended") return;
    if (this.resumeInFlight !== void 0) return this.resumeInFlight;
    const attempt = (async () => {
      try {
        await ctx.resume();
      } catch {
      } finally {
        if (!this.closed && this.ctx === ctx) {
          if (ctx.state === "running") {
            this.lastError = null;
            this.removeGestureListener();
          } else if (ctx.state === "suspended") {
            this.recordResumeFailure();
            this.rearmGestureListener(ctx);
          } else {
            this.removeGestureListener();
          }
        }
        this.resumeInFlight = void 0;
      }
    })();
    this.resumeInFlight = attempt;
    return attempt;
  }
  recordResumeFailure() {
    this.lastError = new AudioError({
      code: "context-suspended",
      expected: "AudioContext.resume() to make the existing context running",
      hint: AUDIO_ERROR_HINTS["context-suspended"],
      detail: { code: "context-suspended" }
    });
  }
  recordDecodeFailure(sourceKey, cause) {
    this.lastError = new AudioError({
      code: "decode-failed",
      expected: `browser-decodable audio bytes for sourceKey ${sourceKey}`,
      hint: AUDIO_ERROR_HINTS["decode-failed"],
      detail: {
        code: "decode-failed",
        reason: cause instanceof Error ? cause.message : String(cause)
      }
    });
  }
  rearmGestureListener(ctx) {
    this.removeGestureListener();
    this.registerGestureListener(ctx);
  }
  // -----------------------------------------------------------------------
  // AudioBackend implementation
  // -----------------------------------------------------------------------
  decode(bytes) {
    return this.ensureContext().decodeAudioData(bytes.slice().buffer);
  }
  play(entityId, clip, opts) {
    if ("kind" in clip) {
      void this.decode(clip.bytes).then(
        (buffer) => {
          if (this.lastError?.code === "decode-failed") {
            this.lastError = null;
          }
          this.play(entityId, buffer, opts);
        },
        (cause) => this.recordDecodeFailure(clip.sourceKey, cause)
      );
      return;
    }
    const clipBuffer = clip;
    if (this.sources.has(entityId)) {
      this.stop(entityId);
    }
    const ctx = this.ensureContext();
    const sourceGain = ctx.createGain();
    sourceGain.gain.value = opts.volume;
    let panner;
    if (opts.spatialBlend > 0) {
      panner = ctx.createPanner();
      panner.panningModel = "equalpower";
    }
    const busGain = this.busGainFor(opts.bus);
    if (!busGain) return;
    if (panner) {
      sourceGain.connect(panner);
      panner.connect(busGain);
    } else {
      sourceGain.connect(busGain);
    }
    const node = ctx.createBufferSource();
    node.buffer = clipBuffer;
    node.loop = opts.loop;
    node.connect(sourceGain);
    node.start();
    this.sources.set(entityId, { node, sourceGain, panner, bus: opts.bus });
    if (!opts.loop) {
      node.onended = () => {
        const current = this.sources.get(entityId);
        if (current?.node === node) {
          this.stop(entityId);
        }
      };
    }
  }
  stop(entityId) {
    const source = this.sources.get(entityId);
    if (!source) return;
    try {
      source.node.stop();
    } catch {
    }
    source.node.disconnect();
    source.sourceGain.disconnect();
    source.panner?.disconnect();
    this.sources.delete(entityId);
  }
  setVolume(entityId, volume) {
    const source = this.sources.get(entityId);
    if (!source) return;
    this.scheduleGainTransition(source.sourceGain, volume);
  }
  setBusVolume(busName, volume) {
    const gain = this.busGainFor(busName);
    if (!gain) return;
    if (!this.scheduleGainTransition(gain, volume)) return;
    this.busVolumes.set(busName, volume);
    if (this.busMuted.get(busName)) {
      this.busMuted.set(busName, false);
    }
  }
  setBusMute(busName, muted) {
    const gain = this.busGainFor(busName);
    if (!gain) return;
    const target = muted ? 0 : this.busVolumes.get(busName) ?? 1;
    if (!this.scheduleGainTransition(gain, target)) return;
    this.busMuted.set(busName, muted);
  }
  getState() {
    if (this.closed) {
      return { contextState: "closed", activeSourceCount: 0, lastError: null };
    }
    const contextState = this.ctx?.state === "closed" ? "closed" : this.ctx?.state === "running" ? "running" : "suspended";
    return {
      contextState,
      activeSourceCount: this.sources.size,
      lastError: this.lastError
    };
  }
  getActiveSourceCount() {
    return this.sources.size;
  }
  destroy() {
    if (this.closed) return;
    this.closed = true;
    for (const entityId of this.sources.keys()) {
      this.stop(entityId);
    }
    if (this.sfxGain) {
      this.sfxGain.disconnect();
      this.sfxGain = void 0;
    }
    if (this.musicGain) {
      this.musicGain.disconnect();
      this.musicGain = void 0;
    }
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = void 0;
    }
    this.removeGestureListener();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = void 0;
    }
  }
  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------
  scheduleGainTransition(gain, target) {
    if (!this.ctx || !Number.isFinite(target) || target < 0) return false;
    const now = this.ctx.currentTime;
    const param = gain.gain;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(target, now + GAIN_TRANSITION_SECONDS);
    return true;
  }
  busGainFor(busName) {
    switch (busName) {
      case "sfx":
        return this.sfxGain;
      case "music":
        return this.musicGain;
    }
  }
};

// src/host-audio-consumer.ts
function decodeError(sourceKey, cause) {
  return new AudioError$1({
    code: "decode-failed",
    expected: `browser-decodable audio bytes for sourceKey ${sourceKey}`,
    hint: "verify the audio media type and source bytes",
    detail: {
      code: "decode-failed",
      reason: cause instanceof Error ? cause.message : String(cause)
    }
  });
}
function sameBytes(left, right) {
  if (left.byteLength !== right.byteLength) return false;
  for (let index = 0; index < left.byteLength; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}
function createHostAudioConsumer(engine = new WebAudioEngine()) {
  const sources = /* @__PURE__ */ new Map();
  const sourceBytes = /* @__PURE__ */ new Map();
  const activeSources = /* @__PURE__ */ new Map();
  const entityEpoch = /* @__PURE__ */ new Map();
  const bus = {
    sfx: { volume: 1, muted: false },
    music: { volume: 1, muted: false }
  };
  const cleanup = [];
  let lastError = null;
  let disposed = false;
  const nextEpoch = (entityId) => {
    const epoch = (entityEpoch.get(entityId) ?? 0) + 1;
    entityEpoch.set(entityId, epoch);
    return epoch;
  };
  const consumer = {
    engine,
    consume(intent) {
      if (disposed && intent.kind !== "destroy") return;
      if (intent.kind === "play") {
        const epoch = nextEpoch(intent.entityId);
        if (intent.bytes !== void 0) {
          const incomingBytes = intent.bytes.slice();
          const publishedBytes = sourceBytes.get(intent.sourceKey);
          if (publishedBytes === void 0 || !sameBytes(publishedBytes, incomingBytes)) {
            sourceBytes.set(intent.sourceKey, incomingBytes);
            sources.delete(intent.sourceKey);
          }
        }
        const bytes = sourceBytes.get(intent.sourceKey);
        activeSources.set(intent.entityId, {
          entityId: intent.entityId,
          sourceKey: intent.sourceKey,
          ...bytes === void 0 ? {} : { bytes: bytes.slice() },
          options: intent.options
        });
        let decoded = sources.get(intent.sourceKey);
        if (decoded === void 0 && bytes !== void 0) {
          const entry = {
            promise: engine.decode(bytes)
          };
          decoded = entry;
          sources.set(intent.sourceKey, entry);
          void entry.promise.then(
            () => {
              if (sources.get(intent.sourceKey) === entry && lastError?.code === "decode-failed") {
                lastError = null;
              }
            },
            (cause) => {
              if (sources.get(intent.sourceKey) !== entry) return;
              sources.delete(intent.sourceKey);
              lastError = decodeError(intent.sourceKey, cause);
            }
          );
        }
        if (decoded === void 0) {
          lastError = decodeError(intent.sourceKey, new Error("sourceKey was not published"));
          return;
        }
        const currentDecode = decoded;
        void currentDecode.promise.then((buffer) => {
          if (!disposed && sources.get(intent.sourceKey) === currentDecode && entityEpoch.get(intent.entityId) === epoch) {
            engine.play(intent.entityId, buffer, intent.options);
          }
        }).catch(() => {
        });
      } else if (intent.kind === "stop") {
        nextEpoch(intent.entityId);
        if (activeSources.delete(intent.entityId)) {
          cleanup.push(intent.entityId);
          engine.stop(intent.entityId);
        }
      } else if (intent.kind === "set-volume") {
        engine.setVolume(intent.entityId, intent.volume);
      } else if (intent.kind === "set-bus-volume") {
        bus[intent.bus].volume = intent.volume;
        bus[intent.bus].muted = false;
        engine.setBusVolume(intent.bus, intent.volume);
      } else if (intent.kind === "set-bus-mute") {
        bus[intent.bus].muted = intent.muted;
        engine.setBusMute(intent.bus, intent.muted);
      } else if (intent.kind === "set-listener-pose") {
        engine.setListenerPose(intent.pose);
      } else {
        consumer.dispose();
      }
    },
    state() {
      return { ...engine.getState(), lastError };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      activeSources.clear();
      entityEpoch.clear();
      sources.clear();
      sourceBytes.clear();
      cleanup.length = 0;
      engine.destroy();
    }
  };
  return consumer;
}
function createWebAudioBackend() {
  const consumer = createHostAudioConsumer();
  const backend = createAudioIntentBackend({
    emit: (intent) => consumer.consume(intent),
    state: () => consumer.state()
  });
  return backend;
}

// src/plugin.ts
function webAudioPlugin() {
  return {
    name: "web-audio",
    provide: "audio",
    apply(ctx) {
      const backend = createWebAudioBackend();
      ctx.effect(() => () => backend.destroy(), "audio/destroy-webaudio");
      ctx.provide("audio", backend);
    }
  };
}

export { WebAudioEngine, audioListenerSyncSystem, audioLoader, createHostAudioConsumer, createWebAudioBackend, syncListenerFromWorldMatrix, webAudioPlugin };
