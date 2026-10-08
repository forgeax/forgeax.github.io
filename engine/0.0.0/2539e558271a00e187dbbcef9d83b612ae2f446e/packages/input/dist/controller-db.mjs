// src/controller-db.ts
var CONTROLLER_PLATFORMS = ["Windows", "Mac OS X", "Linux", "Android", "iOS"];
function parseMappingToken(source) {
  let half;
  let body = source;
  if (body.startsWith("+") || body.startsWith("-")) {
    half = body[0];
    body = body.slice(1);
  }
  const prefix = body[0];
  if (prefix === "b") {
    const index = Number.parseInt(body.slice(1), 10);
    return Number.isNaN(index) ? void 0 : { kind: "button", index };
  }
  if (prefix === "a") {
    const index = Number.parseInt(body.slice(1), 10);
    if (Number.isNaN(index)) return void 0;
    return half ? { kind: "axis", index, half } : { kind: "axis", index };
  }
  if (prefix === "h") {
    const dot = body.indexOf(".");
    if (dot < 0) return void 0;
    const index = Number.parseInt(body.slice(1, dot), 10);
    const mask = Number.parseInt(body.slice(dot + 1), 10);
    return Number.isNaN(index) || Number.isNaN(mask) ? void 0 : { kind: "hat", index, mask };
  }
  return void 0;
}
function parseControllerDb(txt) {
  const db = {};
  for (const rawLine of txt.split("\n")) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) continue;
    const fields = line.split(",");
    const guid = fields[0];
    if (!guid || guid.length !== 32) continue;
    let platform;
    const tokens = {};
    for (let i = 2; i < fields.length; i++) {
      const field = fields[i];
      if (!field) continue;
      const colon = field.indexOf(":");
      if (colon < 0) continue;
      const key = field.slice(0, colon);
      const source = field.slice(colon + 1);
      if (key === "platform") {
        platform = source;
        continue;
      }
      const token = parseMappingToken(source);
      if (token) tokens[key] = token;
    }
    const entry = { platform, tokens };
    const bucket = db[guid];
    if (bucket) {
      bucket.push(entry);
    } else {
      db[guid] = [entry];
    }
  }
  return db;
}
function le16Hex(value) {
  const lo = value & 255;
  const hi = value >> 8 & 255;
  return lo.toString(16).padStart(2, "0") + hi.toString(16).padStart(2, "0");
}
function buildGuidFromVidPid(vid, pid, bus = 3) {
  return le16Hex(bus) + // bytes 0-1: bus type
  "0000" + // bytes 2-3: CRC = 0
  le16Hex(vid) + // bytes 4-5: VID (LE)
  "0000" + // bytes 6-7: fill
  le16Hex(pid) + // bytes 8-9: PID (LE)
  "000000000000";
}
var CHROME_VENDOR_RE = /Vendor:\s*([0-9a-f]{1,4})/i;
var CHROME_PRODUCT_RE = /Product:\s*([0-9a-f]{1,4})/i;
function extractGuidFromGamepadId(id) {
  if (id.toLowerCase().includes("xinput")) return void 0;
  const vendorMatch = id.match(CHROME_VENDOR_RE);
  const productMatch = id.match(CHROME_PRODUCT_RE);
  if (vendorMatch?.[1] && productMatch?.[1]) {
    const vid = Number.parseInt(vendorMatch[1], 16);
    const pid = Number.parseInt(productMatch[1], 16);
    if (!Number.isNaN(vid) && !Number.isNaN(pid)) return buildGuidFromVidPid(vid, pid);
  }
  const parts = id.split("-");
  if (parts.length >= 3 && parts[0] && parts[1]) {
    const vidHex = parts[0];
    const pidHex = parts[1];
    if (/^[0-9a-f]{1,4}$/i.test(vidHex) && /^[0-9a-f]{1,4}$/i.test(pidHex)) {
      const vid = Number.parseInt(vidHex, 16);
      const pid = Number.parseInt(pidHex, 16);
      if (!Number.isNaN(vid) && !Number.isNaN(pid)) return buildGuidFromVidPid(vid, pid);
    }
  }
  return void 0;
}
function platformFromUserAgent(ua) {
  if (/iPhone|iPad|iPod/.test(ua)) return CONTROLLER_PLATFORMS[4];
  if (/Android/.test(ua)) return CONTROLLER_PLATFORMS[3];
  if (/Windows/.test(ua)) return CONTROLLER_PLATFORMS[0];
  if (/Mac OS X|Macintosh/.test(ua)) return CONTROLLER_PLATFORMS[1];
  if (/Linux/.test(ua)) return CONTROLLER_PLATFORMS[2];
  return void 0;
}
function selectBestMappingEntry(db, guid, platform) {
  const entries = db[guid];
  if (!entries || entries.length === 0) return void 0;
  if (platform) {
    const match = entries.find((e) => e.platform === platform);
    if (match) return match;
  }
  return entries[0];
}

export { buildGuidFromVidPid, extractGuidFromGamepadId, parseControllerDb, platformFromUserAgent, selectBestMappingEntry };
