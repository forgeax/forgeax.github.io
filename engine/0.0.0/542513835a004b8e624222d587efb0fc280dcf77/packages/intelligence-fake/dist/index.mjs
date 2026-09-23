import { IntelligenceError } from '../../intelligence/dist/index.mjs';
import { err, ok } from '../../types/dist/index.mjs';

// src/index.ts
function createFakeIntelligenceProvider(options = {}) {
  const providerId = options.id ?? "forgeax.fake";
  const activities = /* @__PURE__ */ new Map();
  let closed = false;
  const provider = {
    id: providerId,
    start(submission, sink) {
      if (closed) {
        return err(new IntelligenceError({ code: "intelligence-closed", detail: {} }));
      }
      const script = options.script?.(submission) ?? {
        deltas: [`${submission.input}:`, "ok"],
        output: `${submission.input}:ok`
      };
      activities.set(submission.id, { id: submission.id, sink, script, index: 0 });
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
      activities.delete(id);
      activity.sink.cancelled();
      return ok(void 0);
    },
    advance() {
      for (const [id, activity] of activities) {
        const delta = activity.script.deltas[activity.index];
        if (delta !== void 0) {
          activity.index += 1;
          activity.sink.text(delta);
          continue;
        }
        activities.delete(id);
        if (activity.script.failure !== void 0) {
          activity.sink.fail(activity.script.failure);
        } else {
          activity.sink.complete(activity.script.output ?? activity.script.deltas.join(""));
        }
      }
    },
    async close() {
      if (closed) return;
      closed = true;
      for (const activity of activities.values()) activity.sink.cancelled();
      activities.clear();
    },
    get activeCount() {
      return activities.size;
    },
    get closed() {
      return closed;
    }
  };
  return provider;
}

export { createFakeIntelligenceProvider };
