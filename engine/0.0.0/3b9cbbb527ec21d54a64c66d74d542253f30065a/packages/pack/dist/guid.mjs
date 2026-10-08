import { sha1 } from '../../../vendor/@noble/hashes/legacy.js';
import { uuidv7obj } from '../../../vendor/uuidv7/dist/index.js';

// src/guid.ts

// src/errors.ts
var PackError = class extends Error {
  code;
  expected;
  hint;
  detail;
  cause;
  constructor(args) {
    super(`[PackError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "PackError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
    if (args.cause !== void 0) this.cause = args.cause;
  }
};

// src/guid.ts
function brand(bytes) {
  return bytes;
}
var HEX_BYTE = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToDashForm(bytes) {
  const h = HEX_BYTE;
  return `${h[bytes[0]]}${h[bytes[1]]}${h[bytes[2]]}${h[bytes[3]]}-${h[bytes[4]]}${h[bytes[5]]}-${h[bytes[6]]}${h[bytes[7]]}-${h[bytes[8]]}${h[bytes[9]]}-${h[bytes[10]]}${h[bytes[11]]}${h[bytes[12]]}${h[bytes[13]]}${h[bytes[14]]}${h[bytes[15]]}`;
}
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var PACK_SOURCE_KEY_RE = /^[a-z0-9][a-z0-9._-]*(\/[a-z0-9][a-z0-9._-]*)*$/;
function isValidPackSourceKey(value) {
  return typeof value === "string" && PACK_SOURCE_KEY_RE.test(value);
}
function isValidAssetGuidString(value) {
  return typeof value === "string" && UUID_RE.test(value);
}
function dashFormToBytes(dashForm) {
  const hex = dashForm.replace(/-/g, "");
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
function randomUuidBytes() {
  const uuid = uuidv7obj();
  const bytes = new Uint8Array(16);
  bytes.set(uuid.bytes);
  return bytes;
}
function packageId(value) {
  return value;
}
var PackageId = {
  parse(dashForm) {
    const parsed = AssetGuid.parse(dashForm);
    return parsed.ok ? { ok: true, value: packageId(parsed.value) } : parsed;
  },
  format(value) {
    return bytesToDashForm(value);
  },
  random() {
    return packageId(randomUuidBytes());
  }
};
function derivedGuid(namespace, sourceKey) {
  if (!(namespace instanceof Uint8Array) || namespace.byteLength !== 16) {
    throw new TypeError("AssetGuid.derive requires a 16-byte PackageId");
  }
  if (!isValidPackSourceKey(sourceKey)) {
    const error = new TypeError(
      `AssetGuid.derive received invalid sourceKey ${JSON.stringify(sourceKey)}`
    );
    Object.defineProperty(error, "code", { value: "pack-source-key-invalid" });
    throw error;
  }
  const name = new TextEncoder().encode(sourceKey);
  const input = new Uint8Array(namespace.byteLength + name.byteLength);
  input.set(namespace, 0);
  input.set(name, namespace.byteLength);
  const digest = sha1(input);
  const result = digest.slice(0, 16);
  result[6] = (result[6] ?? 0) & 15 | 80;
  result[8] = (result[8] ?? 0) & 63 | 128;
  return brand(result);
}
var AssetGuid = {
  /**
   * Parse a 36-char RFC 4122 dash-form UUID string into an AssetGuid.
   * Returns Ok(AssetGuid) on success or Err(PackError) with code 'pack-guid-malformed' on failure.
   * Never throws for expected failures (requirements §4.2 / §14 / charter proposition 4).
   */
  parse(dashForm) {
    if (!isValidAssetGuidString(dashForm)) {
      return {
        ok: false,
        error: new PackError({
          code: "pack-guid-malformed",
          expected: "36-char RFC 4122 dash-form UUID",
          hint: "use AssetGuid.random() or a UUIDv7 generator; all GUID fields must be 36-char RFC 4122 dash-form",
          detail: {
            raw: dashForm,
            reason: "expected 36-char RFC 4122 dash-form UUID"
          }
        })
      };
    }
    return { ok: true, value: brand(dashFormToBytes(dashForm)) };
  },
  /**
   * Format an AssetGuid as a 36-char RFC 4122 lowercase dash-form string.
   */
  format(guid) {
    return bytesToDashForm(guid);
  },
  /**
   * Test byte-by-byte equality between two AssetGuids.
   */
  equals(a, b) {
    for (let i = 0; i < 16; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  },
  /**
   * Mint a new time-ordered UUIDv7 as an AssetGuid.
   * Works in both Node.js and browser environments.
   */
  random() {
    return brand(randomUuidBytes());
  },
  /** Derive the stable UUIDv5 projection for one Pack subject and sourceKey. */
  derive(namespace, sourceKey) {
    return derivedGuid(namespace, sourceKey);
  }
};

export { AssetGuid, PACK_SOURCE_KEY_RE, PackageId, isValidAssetGuidString, isValidPackSourceKey };
