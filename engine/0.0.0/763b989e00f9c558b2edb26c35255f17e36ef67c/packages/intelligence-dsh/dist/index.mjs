import { DeepSeekHarness } from '../../../vendor/@deepseek-ai/dsh-sdk-client/lib/index.js';
import { IntelligenceError } from '../../intelligence/dist/index.mjs';
import { err, ok } from '../../types/dist/index.mjs';

// src/index.ts
function closeActivity(activity) {
  if (activity.closeTask !== void 0) return activity.closeTask;
  activity.closeTask = (async () => {
    try {
      await activity.harness.close();
    } catch {
      try {
        await activity.harness.close();
      } catch {
        return;
      }
    }
  })();
  return activity.closeTask;
}
function textDelta(notification) {
  if (notification.method !== "session.event") return void 0;
  const event = notification.params.event;
  if (typeof event !== "object" || event === null || Array.isArray(event)) return void 0;
  if (Reflect.get(event, "type") !== "assistant/chunk") return void 0;
  const data = Reflect.get(event, "data");
  if (typeof data !== "object" || data === null || Array.isArray(data)) return void 0;
  const chunk = Reflect.get(data, "chunk");
  if (typeof chunk !== "object" || chunk === null || Array.isArray(chunk)) return void 0;
  if (Reflect.get(chunk, "type") !== "text-delta") return void 0;
  const text = Reflect.get(chunk, "text");
  return typeof text === "string" ? text : void 0;
}
function defaultHarness(options) {
  const launch = {
    command: options.launch.command,
    ...options.launch.args === void 0 ? {} : { args: [...options.launch.args] },
    ...options.launch.env === void 0 ? {} : { env: { ...options.launch.env } },
    ...options.launch.cwd === void 0 ? {} : { cwd: options.launch.cwd },
    ...options.launch.requestTimeoutMs === void 0 ? {} : { requestTimeoutMs: options.launch.requestTimeoutMs },
    ...options.launch.shutdownTimeoutMs === void 0 ? {} : { shutdownTimeoutMs: options.launch.shutdownTimeoutMs },
    ...options.launch.disposeEofGraceMs === void 0 ? {} : { disposeEofGraceMs: options.launch.disposeEofGraceMs },
    ...options.launch.disposeGraceMs === void 0 ? {} : { disposeGraceMs: options.launch.disposeGraceMs }
  };
  return new DeepSeekHarness({
    launch,
    ...options.cwd === void 0 ? {} : { cwd: options.cwd },
    ...options.provider === void 0 ? {} : { provider: options.provider },
    ...options.model === void 0 ? {} : { model: options.model },
    ...options.maxTokens === void 0 ? {} : { maxTokens: options.maxTokens }
  });
}
function createDshIntelligenceProvider(options) {
  const activities = /* @__PURE__ */ new Map();
  const createHarness = options.createHarness ?? defaultHarness;
  let closed = false;
  const provider = {
    id: "deepseek-harness",
    start(submission, sink) {
      if (closed) {
        return err(new IntelligenceError({ code: "intelligence-closed", detail: {} }));
      }
      let harness;
      try {
        harness = createHarness({
          launch: options.launch,
          ...options.cwd === void 0 ? {} : { cwd: options.cwd },
          ...options.provider === void 0 ? {} : { provider: options.provider },
          ...options.model === void 0 ? {} : { model: options.model },
          ...options.maxTokens === void 0 ? {} : { maxTokens: options.maxTokens }
        });
      } catch (cause) {
        return err(
          new IntelligenceError({
            code: "intelligence-provider-failed",
            detail: { providerId: provider.id, cause }
          })
        );
      }
      const activity = {
        harness,
        sink,
        task: Promise.resolve(),
        cancelRequested: false
      };
      activities.set(submission.id, activity);
      activity.task = runActivity(submission, activity);
      return ok(void 0);
    },
    cancel(id) {
      const activity = activities.get(id);
      if (activity === void 0) {
        return err(
          new IntelligenceError({
            code: "intelligence-activity-not-found",
            detail: { activityId: id }
          })
        );
      }
      activity.cancelRequested = true;
      void closeActivity(activity);
      return ok(void 0);
    },
    async close() {
      if (closed) return;
      closed = true;
      const current = [...activities.values()];
      for (const activity of current) {
        activity.cancelRequested = true;
      }
      const closeTasks = current.map(closeActivity);
      await Promise.allSettled(current.map((activity) => activity.task));
      await Promise.allSettled(closeTasks);
      activities.clear();
    }
  };
  async function runActivity(submission, activity) {
    try {
      const result = await activity.harness.run(submission.input, {
        sessionId: submission.session.id,
        onNotification(notification) {
          if (activity.cancelRequested) return;
          const delta = textDelta(notification);
          if (delta !== void 0) activity.sink.text(delta);
        }
      });
      await closeActivity(activity);
      if (activity.cancelRequested) activity.sink.cancelled();
      else activity.sink.complete(result.finalResponse);
    } catch (cause) {
      await closeActivity(activity);
      if (activity.cancelRequested) activity.sink.cancelled();
      else activity.sink.fail(cause);
    } finally {
      activities.delete(submission.id);
    }
  }
  return provider;
}

export { createDshIntelligenceProvider, textDelta as extractDshTextDelta };
