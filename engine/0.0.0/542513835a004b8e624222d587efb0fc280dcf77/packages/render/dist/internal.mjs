export { PROBE_MAX_CONTRIBUTORS, SSR_HISTORY_FORMAT, SsrHistoryOwner, admitProbeContributors, blendLightProbes, createExtendedLightingState, createSsrHistoryOwner, estimateSsrSpatialMemory, projectExtendedLightingInspection, promoteExtendedLightingCandidate, recordExtendedLightingFailure, scaledProbeWeight, setOcclusionRuntimeTestHooks } from './chunk-LY3SXZND.mjs';
export { buildRectAreaWorldFrame, rectAreaFacesPoint } from './chunk-LP56LS4S.mjs';
import './chunk-X2KA6WHM.mjs';
export { TemporalFrameCoordinator } from './chunk-3ZFWHLG3.mjs';
import './chunk-4QQOKCLH.mjs';
import { EXTENDED_LIGHTING_TOPOLOGY } from './chunk-4IMMYRZV.mjs';
export { DeviceScope, EXTENDED_LIGHTING_REQUIRED_SAMPLED_TEXTURES, createLightResourceUnavailable, createVisibilityBudget, deriveExtendedLightingCapability, extendedLightingSampledTextureCapacityAvailable, validateGraphTargetCaptureReadback } from './chunk-4IMMYRZV.mjs';
export { resolveTilesetRuntime } from '../../assets-runtime/dist/index.mjs';
import '../../shader/dist/index.mjs';
import { ok, err } from '../../types/dist/index.mjs';

function deriveLtcResourcePlan(input) {
  const admitted = input.ltcAvailable;
  return {
    topology: EXTENDED_LIGHTING_TOPOLOGY,
    generation: input.scope.generation,
    rectAdmission: admitted ? "admitted" : "omitted",
    tableCount: admitted ? 2 : 0,
    uploadCount: admitted && input.residentGeneration !== input.scope.generation ? 2 : 0
  };
}
function stageFromError(cause) {
  if (typeof cause === "object" && cause !== null && "stage" in cause) {
    const stage = cause.stage;
    if (stage === "build" || stage === "encode" || stage === "finish" || stage === "submit") {
      return stage;
    }
  }
  return "submit";
}
function coordinatorInput(input) {
  const consumerIds = input.consumerIds?.includes("ssr") ? input.consumerIds : [...input.consumerIds ?? [], "ssr"];
  return { ...input, temporalDemand: true, consumerIds };
}
function resetCoordinator(coordinator, reason) {
  switch (reason) {
    case "first-enable":
    case "disable":
      return;
    case "resize":
      coordinator.reset("resize");
      return;
    case "camera-cut":
      coordinator.reset("cut");
      return;
    case "history-version":
      coordinator.reset("camera-switch");
      return;
    case "coverage-loss":
      coordinator.reset("detach");
      return;
    case "reflection-generation":
    case "device-recovery":
      coordinator.reset("device-generation");
      return;
  }
}
var SsrTemporalConsumer = class {
  constructor(coordinator, history) {
    this.coordinator = coordinator;
    this.history = history;
  }
  coordinator;
  history;
  begin(input) {
    const history = this.history.beginFrame();
    if (!history.ok) return history;
    const temporal = this.coordinator.begin(coordinatorInput(input));
    if (!temporal.ok) {
      this.history.abortFrame(history.value, "build");
      return temporal;
    }
    return ok({ temporal: temporal.value, history: history.value });
  }
  commit(candidate) {
    const committed = this.coordinator.commit(candidate.temporal);
    if (!committed.ok) {
      this.history.abortFrame(candidate.history, "submit");
      return committed;
    }
    const history = this.history.commitFrame(candidate.history);
    if (!history.ok) return history;
    return committed;
  }
  abort(candidate, stage) {
    this.history.abortFrame(candidate.history, stage);
    this.coordinator.abort(candidate.temporal, stage);
  }
  run(input, phases) {
    const started = this.begin(input);
    if (!started.ok) return started;
    const candidate = started.value;
    try {
      const built = phases.build();
      phases.encode(built);
      phases.finish();
      phases.submit();
    } catch (cause) {
      const stage = stageFromError(cause);
      this.abort(candidate, stage);
      return err({
        code: "ssr-temporal-stage-failed",
        expected: `SSR temporal ${stage} succeeds before commit`,
        hint: "inspect the owned stage failure and retry without promoting the candidate",
        detail: { stage, cause }
      });
    }
    return this.commit(candidate);
  }
  reset(reason) {
    this.history.reset(reason);
    resetCoordinator(this.coordinator, reason);
  }
  retireAfterFence(queue, onFailure) {
    this.history.retireAfterFence(queue, onFailure);
  }
  inspect() {
    const temporal = this.coordinator.inspect();
    return Object.freeze({
      sharedEpoch: temporal.epoch,
      consumerIds: temporal.consumerIds,
      coordinatorAttempt: temporal.attempt,
      history: this.history.inspect()
    });
  }
};
function createSsrTemporalConsumer(coordinator, history) {
  return new SsrTemporalConsumer(coordinator, history);
}

export { SsrTemporalConsumer, createSsrTemporalConsumer, deriveLtcResourcePlan };
