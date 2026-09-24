import { ImportError, IMPORT_ERROR_HINTS } from '../../types/dist/index.mjs';

// src/audio-importer.ts
function sourceKeyForAudioOutput(kind = "audio") {
  const normalizedKind = kind.trim();
  return normalizedKind.length === 0 ? void 0 : `audio:${normalizedKind}`;
}
function audioMediaType(source) {
  const lower = source.toLowerCase();
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".ogg")) return "audio/ogg";
  if (lower.endsWith(".flac")) return "audio/flac";
  return "application/octet-stream";
}
function validateAudioOutputTopology(ctx) {
  if (ctx.subAssets.length === 1 && ctx.subAssets[0]?.kind === "audio") return void 0;
  const actual = ctx.subAssets.length === 0 ? "subAssets[] is empty" : ctx.subAssets.map((sub, index) => `subAssets[${index}]=${sub.kind}:${sub.guid}`).join(", ");
  return new ImportError({
    code: "source-validation-failed",
    expected: 'exactly one subAssets[] entry with kind "audio"',
    actual,
    hint: IMPORT_ERROR_HINTS["source-validation-failed"],
    detail: {
      diagnostics: [
        {
          code: "audio-subasset-topology",
          severity: "error",
          sourcePath: `${ctx.source}#subAssets`,
          sourceRange: { start: 0, end: 0, line: 1, column: 1 },
          rule: "audio-required-single-output",
          expected: 'exactly one subAssets[] entry with kind "audio"',
          actual,
          hint: "declare exactly one audio sub-asset and remove foreign or duplicate entries"
        }
      ]
    }
  });
}
async function importAudio(ctx) {
  const topologyError = validateAudioOutputTopology(ctx);
  if (topologyError !== void 0) return { ok: false, error: topologyError };
  const read = await ctx.readSource();
  if (!read.ok) {
    return {
      ok: false,
      error: new ImportError({
        code: "source-read-failed",
        expected: `readable source file at meta.source "${ctx.source}"`,
        hint: IMPORT_ERROR_HINTS["source-read-failed"],
        detail: {
          source: ctx.source,
          reason: read.error instanceof Error ? read.error.message : String(read.error)
        }
      })
    };
  }
  const out = [];
  for (const sub of ctx.subAssets) {
    if (sub.kind !== "audio") continue;
    const payload = {
      kind: "audio",
      mediaType: audioMediaType(ctx.source),
      source: ctx.source,
      bytes: read.value
    };
    out.push({
      guid: sub.guid,
      kind: "audio",
      payload,
      refs: [],
      artifacts: {
        source: {
          mediaType: audioMediaType(ctx.source),
          assetCodec: { name: "browser-audio" },
          bytes: read.value
        }
      }
    });
  }
  return { ok: true, value: { assets: out, sourceDependencies: [ctx.source] } };
}
var audioImporter = {
  key: "audio",
  import: importAudio
};

export { audioImporter, sourceKeyForAudioOutput };
