import { defineComponent, Update, Time } from '../../ecs/dist/index.mjs';

// src/index.ts
var NPC_COGNITIVE_LOD_SPOTLIGHT = 0;
var NPC_COGNITIVE_LOD_AMBIENT = 1;
var NPC_COGNITIVE_LOD_OFFSTAGE = 2;
var NpcBrain = defineComponent("NpcBrain", {
  soulId: "string",
  affordanceRef: { type: "string", default: "" },
  enabled: { type: "bool", default: true },
  lod: { type: "u32", default: NPC_COGNITIVE_LOD_SPOTLIGHT }
});
function createNpcClientAdapter(client, options) {
  let active = /* @__PURE__ */ new Map();
  return {
    sync(bindings, world) {
      const next = /* @__PURE__ */ new Map();
      for (const binding of bindings) {
        if (!binding.enabled || !binding.soulId) continue;
        next.set(binding.soulId, binding);
        client.declareAffordances(binding.soulId, [
          ...options.affordances(binding.affordanceRef, binding)
        ]);
        client.setLod(binding.soulId, lodName(binding.lod), options.sample(binding, world));
      }
      active = next;
    },
    tick(dt, world) {
      client.tick(dt, (npcId) => {
        const binding = active.get(npcId);
        return binding ? options.sample(binding, world) : void 0;
      });
    }
  };
}
function lodName(lod) {
  if (lod === NPC_COGNITIVE_LOD_AMBIENT) return "ambient";
  if (lod === NPC_COGNITIVE_LOD_OFFSTAGE) return "offstage";
  return "spotlight";
}
function npcPlugin(options) {
  return {
    name: "npc",
    inject: ["world"],
    apply(ctx) {
      const world = ctx.world;
      let previous = "";
      const systemName = options.systemName ?? "npc-brain-sync";
      ctx.effect(() => {
        world.addSystem(Update, {
          name: systemName,
          queries: [{ with: [NpcBrain] }],
          fn: (_world, queryResults) => {
            const bindings = [];
            for (const row of queryResults[0]) {
              const entity = row.entity;
              const value = world.get(entity, NpcBrain);
              if (!value.ok) continue;
              bindings.push({
                entity,
                soulId: value.value.soulId,
                affordanceRef: value.value.affordanceRef,
                enabled: value.value.enabled,
                lod: value.value.lod
              });
            }
            const signature = JSON.stringify(bindings);
            if (signature !== previous) {
              previous = signature;
              void options.adapter.sync(bindings, world);
            }
            void options.adapter.tick(world.getResource(Time).delta, world);
          }
        }).unwrap();
        return async () => {
          world.removeSystem(Update, systemName);
          await options.adapter.dispose?.();
        };
      }, "npc/brain-sync");
    }
  };
}

export { NPC_COGNITIVE_LOD_AMBIENT, NPC_COGNITIVE_LOD_OFFSTAGE, NPC_COGNITIVE_LOD_SPOTLIGHT, NpcBrain, createNpcClientAdapter, npcPlugin };
