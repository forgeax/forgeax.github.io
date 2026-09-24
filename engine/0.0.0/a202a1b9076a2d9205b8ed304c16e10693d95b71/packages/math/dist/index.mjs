var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/box2.ts
var box2_exports = {};
__export(box2_exports, {
  center: () => center,
  closestPoint: () => closestPoint,
  containsBox: () => containsBox,
  containsPoint: () => containsPoint,
  create: () => create,
  fromCenter: () => fromCenter,
  fromPoints: () => fromPoints,
  grow: () => grow,
  halfSize: () => halfSize,
  intersectsBox: () => intersectsBox,
  intersectsCircle: () => intersectsCircle,
  merge: () => merge,
  shrink: () => shrink
});
function create(minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY) {
  return Float32Array.of(minX, minY, maxX, maxY);
}
function fromCenter(out, center3, halfSize2) {
  const cx = center3[0];
  const cy = center3[1];
  const hx = Math.abs(halfSize2[0]);
  const hy = Math.abs(halfSize2[1]);
  out[0] = cx - hx;
  out[1] = cy - hy;
  out[2] = cx + hx;
  out[3] = cy + hy;
  return out;
}
function fromPoints(out, points) {
  out[0] = Number.POSITIVE_INFINITY;
  out[1] = Number.POSITIVE_INFINITY;
  out[2] = Number.NEGATIVE_INFINITY;
  out[3] = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const x = point[0];
    const y = point[1];
    if (x < out[0]) out[0] = x;
    if (y < out[1]) out[1] = y;
    if (x > out[2]) out[2] = x;
    if (y > out[3]) out[3] = y;
  }
  return out;
}
function center(out, box) {
  out[0] = (box[0] + box[2]) * 0.5;
  out[1] = (box[1] + box[3]) * 0.5;
  return out;
}
function halfSize(out, box) {
  out[0] = (box[2] - box[0]) * 0.5;
  out[1] = (box[3] - box[1]) * 0.5;
  return out;
}
function closestPoint(out, box, point) {
  const x = point[0];
  const y = point[1];
  const minX = box[0];
  const minY = box[1];
  const maxX = box[2];
  const maxY = box[3];
  out[0] = x < minX ? minX : x > maxX ? maxX : x;
  out[1] = y < minY ? minY : y > maxY ? maxY : y;
  return out;
}
function containsPoint(box, point) {
  const x = point[0];
  const y = point[1];
  return x >= box[0] && x <= box[2] && y >= box[1] && y <= box[3];
}
function containsBox(box, other) {
  return other[0] >= box[0] && other[1] >= box[1] && other[2] <= box[2] && other[3] <= box[3];
}
function intersectsBox(a, b) {
  return a[2] >= b[0] && a[0] <= b[2] && a[3] >= b[1] && a[1] <= b[3];
}
function intersectsCircle(box, circle) {
  const cx = circle[0];
  const cy = circle[1];
  const radius2 = circle[2];
  if (radius2 < 0) return false;
  const closestX = cx < box[0] ? box[0] : cx > box[2] ? box[2] : cx;
  const closestY = cy < box[1] ? box[1] : cy > box[3] ? box[3] : cy;
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= radius2 * radius2;
}
function merge(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  out[3] = Math.max(a[3], b[3]);
  return out;
}
function grow(out, box, amount) {
  const x = Math.abs(amount[0]);
  const y = Math.abs(amount[1]);
  out[0] = box[0] - x;
  out[1] = box[1] - y;
  out[2] = box[2] + x;
  out[3] = box[3] + y;
  return out;
}
function shrink(out, box, amount) {
  const x = Math.abs(amount[0]);
  const y = Math.abs(amount[1]);
  out[0] = box[0] + x;
  out[1] = box[1] + y;
  out[2] = box[2] - x;
  out[3] = box[3] - y;
  return out;
}

// src/box3.ts
var box3_exports = {};
__export(box3_exports, {
  containsPoint: () => containsPoint2,
  create: () => create2,
  expandByPoint: () => expandByPoint,
  fromPoints: () => fromPoints2,
  fromPositions: () => fromPositions,
  intersectsBox: () => intersectsBox2,
  transformBox3: () => transformBox3
});
function create2(minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, minZ = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY, maxZ = Number.NEGATIVE_INFINITY) {
  return Float32Array.of(minX, minY, minZ, maxX, maxY, maxZ);
}
function expandByPoint(out, point) {
  const px = point[0];
  const py = point[1];
  const pz = point[2];
  if (px < out[0]) out[0] = px;
  if (py < out[1]) out[1] = py;
  if (pz < out[2]) out[2] = pz;
  if (px > out[3]) out[3] = px;
  if (py > out[4]) out[4] = py;
  if (pz > out[5]) out[5] = pz;
  return out;
}
function containsPoint2(box, point) {
  const px = point[0];
  const py = point[1];
  const pz = point[2];
  return px >= box[0] && px <= box[3] && py >= box[1] && py <= box[4] && pz >= box[2] && pz <= box[5];
}
function intersectsBox2(a, b) {
  return a[3] >= b[0] && a[0] <= b[3] && a[4] >= b[1] && a[1] <= b[4] && a[5] >= b[2] && a[2] <= b[5];
}
function fromPoints2(out, points) {
  out[0] = Number.POSITIVE_INFINITY;
  out[1] = Number.POSITIVE_INFINITY;
  out[2] = Number.POSITIVE_INFINITY;
  out[3] = Number.NEGATIVE_INFINITY;
  out[4] = Number.NEGATIVE_INFINITY;
  out[5] = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const px = p[0];
    const py = p[1];
    const pz = p[2];
    if (px < out[0]) out[0] = px;
    if (py < out[1]) out[1] = py;
    if (pz < out[2]) out[2] = pz;
    if (px > out[3]) out[3] = px;
    if (py > out[4]) out[4] = py;
    if (pz > out[5]) out[5] = pz;
  }
  return out;
}
function fromPositions(out, positions) {
  out[0] = Number.POSITIVE_INFINITY;
  out[1] = Number.POSITIVE_INFINITY;
  out[2] = Number.POSITIVE_INFINITY;
  out[3] = Number.NEGATIVE_INFINITY;
  out[4] = Number.NEGATIVE_INFINITY;
  out[5] = Number.NEGATIVE_INFINITY;
  if (positions.length < 3) return out;
  let minX = positions[0];
  let minY = positions[1];
  let minZ = positions[2];
  let maxX = minX;
  let maxY = minY;
  let maxZ = minZ;
  for (let i = 3; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
  }
  out[0] = minX;
  out[1] = minY;
  out[2] = minZ;
  out[3] = maxX;
  out[4] = maxY;
  out[5] = maxZ;
  return out;
}
function transformBox3(out, box, m) {
  const bx = box[0];
  const by = box[1];
  const bz = box[2];
  const bX = box[3];
  const bY = box[4];
  const bZ = box[5];
  const m00 = m[0];
  const m01 = m[1];
  const m02 = m[2];
  const m03 = m[3];
  const m10 = m[4];
  const m11 = m[5];
  const m12 = m[6];
  const m13 = m[7];
  const m20 = m[8];
  const m21 = m[9];
  const m22 = m[10];
  const m23 = m[11];
  const m30 = m[12];
  const m31 = m[13];
  const m32 = m[14];
  const m33 = m[15];
  let x = m00 * bx + m10 * by + m20 * bz + m30;
  let y = m01 * bx + m11 * by + m21 * bz + m31;
  let z = m02 * bx + m12 * by + m22 * bz + m32;
  let w = m03 * bx + m13 * by + m23 * bz + m33;
  if (w !== 0) {
    const iw = 1 / w;
    x *= iw;
    y *= iw;
    z *= iw;
  }
  let minX = x, maxX = x, minY = y, maxY = y, minZ = z, maxZ = z;
  x = m00 * bX + m10 * by + m20 * bz + m30;
  y = m01 * bX + m11 * by + m21 * bz + m31;
  z = m02 * bX + m12 * by + m22 * bz + m32;
  w = m03 * bX + m13 * by + m23 * bz + m33;
  if (w !== 0) {
    const iw = 1 / w;
    x *= iw;
    y *= iw;
    z *= iw;
  }
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
  if (z < minZ) minZ = z;
  if (z > maxZ) maxZ = z;
  x = m00 * bx + m10 * bY + m20 * bz + m30;
  y = m01 * bx + m11 * bY + m21 * bz + m31;
  z = m02 * bx + m12 * bY + m22 * bz + m32;
  w = m03 * bx + m13 * bY + m23 * bz + m33;
  if (w !== 0) {
    const iw = 1 / w;
    x *= iw;
    y *= iw;
    z *= iw;
  }
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
  if (z < minZ) minZ = z;
  if (z > maxZ) maxZ = z;
  x = m00 * bX + m10 * bY + m20 * bz + m30;
  y = m01 * bX + m11 * bY + m21 * bz + m31;
  z = m02 * bX + m12 * bY + m22 * bz + m32;
  w = m03 * bX + m13 * bY + m23 * bz + m33;
  if (w !== 0) {
    const iw = 1 / w;
    x *= iw;
    y *= iw;
    z *= iw;
  }
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
  if (z < minZ) minZ = z;
  if (z > maxZ) maxZ = z;
  x = m00 * bx + m10 * by + m20 * bZ + m30;
  y = m01 * bx + m11 * by + m21 * bZ + m31;
  z = m02 * bx + m12 * by + m22 * bZ + m32;
  w = m03 * bx + m13 * by + m23 * bZ + m33;
  if (w !== 0) {
    const iw = 1 / w;
    x *= iw;
    y *= iw;
    z *= iw;
  }
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
  if (z < minZ) minZ = z;
  if (z > maxZ) maxZ = z;
  x = m00 * bX + m10 * by + m20 * bZ + m30;
  y = m01 * bX + m11 * by + m21 * bZ + m31;
  z = m02 * bX + m12 * by + m22 * bZ + m32;
  w = m03 * bX + m13 * by + m23 * bZ + m33;
  if (w !== 0) {
    const iw = 1 / w;
    x *= iw;
    y *= iw;
    z *= iw;
  }
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
  if (z < minZ) minZ = z;
  if (z > maxZ) maxZ = z;
  x = m00 * bx + m10 * bY + m20 * bZ + m30;
  y = m01 * bx + m11 * bY + m21 * bZ + m31;
  z = m02 * bx + m12 * bY + m22 * bZ + m32;
  w = m03 * bx + m13 * bY + m23 * bZ + m33;
  if (w !== 0) {
    const iw = 1 / w;
    x *= iw;
    y *= iw;
    z *= iw;
  }
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
  if (z < minZ) minZ = z;
  if (z > maxZ) maxZ = z;
  x = m00 * bX + m10 * bY + m20 * bZ + m30;
  y = m01 * bX + m11 * bY + m21 * bZ + m31;
  z = m02 * bX + m12 * bY + m22 * bZ + m32;
  w = m03 * bX + m13 * bY + m23 * bZ + m33;
  if (w !== 0) {
    const iw = 1 / w;
    x *= iw;
    y *= iw;
    z *= iw;
  }
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
  if (z < minZ) minZ = z;
  if (z > maxZ) maxZ = z;
  out[0] = minX;
  out[1] = minY;
  out[2] = minZ;
  out[3] = maxX;
  out[4] = maxY;
  out[5] = maxZ;
  return out;
}

// src/circle2.ts
var circle2_exports = {};
__export(circle2_exports, {
  center: () => center2,
  closestPoint: () => closestPoint2,
  containsPoint: () => containsPoint3,
  create: () => create3,
  fromPoints: () => fromPoints3,
  intersectsBox: () => intersectsBox3,
  intersectsCircle: () => intersectsCircle2,
  merge: () => merge2,
  radius: () => radius,
  toBox: () => toBox
});
function create3(cx = 0, cy = 0, radius2 = 0) {
  return Float32Array.of(cx, cy, radius2 < 0 ? 0 : radius2);
}
function fromPoints3(out, points) {
  if (points.length === 0) {
    out[0] = 0;
    out[1] = 0;
    out[2] = -1;
    return out;
  }
  const bounds = create();
  fromPoints(bounds, points);
  const cx = (bounds[0] + bounds[2]) * 0.5;
  const cy = (bounds[1] + bounds[3]) * 0.5;
  let radiusSq = 0;
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const dx = point[0] - cx;
    const dy = point[1] - cy;
    const distanceSq2 = dx * dx + dy * dy;
    if (distanceSq2 > radiusSq) radiusSq = distanceSq2;
  }
  out[0] = cx;
  out[1] = cy;
  out[2] = Math.sqrt(radiusSq);
  return out;
}
function toBox(out, circle) {
  const cx = circle[0];
  const cy = circle[1];
  const radius2 = circle[2];
  out[0] = cx - radius2;
  out[1] = cy - radius2;
  out[2] = cx + radius2;
  out[3] = cy + radius2;
  return out;
}
function center2(out, circle) {
  out[0] = circle[0];
  out[1] = circle[1];
  return out;
}
function radius(circle) {
  return circle[2];
}
function closestPoint2(out, circle, point) {
  const dx = point[0] - circle[0];
  const dy = point[1] - circle[1];
  const distanceSq2 = dx * dx + dy * dy;
  const r = circle[2];
  if (r < 0) {
    out[0] = circle[0];
    out[1] = circle[1];
    return out;
  }
  if (distanceSq2 <= r * r || distanceSq2 < 1e-12) {
    out[0] = point[0];
    out[1] = point[1];
    return out;
  }
  const scale6 = r / Math.sqrt(distanceSq2);
  out[0] = circle[0] + dx * scale6;
  out[1] = circle[1] + dy * scale6;
  return out;
}
function containsPoint3(circle, point) {
  const dx = point[0] - circle[0];
  const dy = point[1] - circle[1];
  const r = circle[2];
  return r >= 0 && dx * dx + dy * dy <= r * r;
}
function intersectsCircle2(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const radius2 = a[2] + b[2];
  return a[2] >= 0 && b[2] >= 0 && dx * dx + dy * dy <= radius2 * radius2;
}
function intersectsBox3(circle, box) {
  return intersectsCircle(box, circle);
}
function merge2(out, a, b) {
  const ax = a[0];
  const ay = a[1];
  const ar = a[2];
  const bx = b[0];
  const by = b[1];
  const br = b[2];
  const dx = bx - ax;
  const dy = by - ay;
  const distance4 = Math.sqrt(dx * dx + dy * dy);
  if (ar >= distance4 + br) return createInto(out, ax, ay, ar);
  if (br >= distance4 + ar) return createInto(out, bx, by, br);
  if (distance4 < 1e-12) return createInto(out, ax, ay, Math.max(ar, br));
  const nextRadius = (distance4 + ar + br) * 0.5;
  const shift = (nextRadius - ar) / distance4;
  return createInto(out, ax + dx * shift, ay + dy * shift, nextRadius);
}
function createInto(out, cx, cy, r) {
  out[0] = cx;
  out[1] = cy;
  out[2] = r;
  return out;
}

// src/color.ts
var color_exports = {};
__export(color_exports, {
  clone: () => clone,
  create: () => create4,
  fromCss: () => fromCss,
  fromHex: () => fromHex,
  linearToSrgb: () => linearToSrgb,
  srgbToLinear: () => srgbToLinear,
  toHex: () => toHex
});
function create4(r = 0, g = 0, b = 0, a = 1) {
  return Float32Array.of(r, g, b, a);
}
function clone(c) {
  return Float32Array.of(c[0], c[1], c[2], c[3]);
}
function srgbChannelToLinear(v) {
  if (Number.isNaN(v)) return Number.NaN;
  if (v <= 0) return v;
  if (v <= 0.04045) return v / 12.92;
  return ((v + 0.055) / 1.055) ** 2.4;
}
function linearChannelToSrgb(v) {
  if (Number.isNaN(v)) return Number.NaN;
  if (v <= 0) return v;
  if (v <= 31308e-7) return v * 12.92;
  return 1.055 * v ** (1 / 2.4) - 0.055;
}
function srgbToLinear(out, c) {
  out[0] = srgbChannelToLinear(c[0]);
  out[1] = srgbChannelToLinear(c[1]);
  out[2] = srgbChannelToLinear(c[2]);
  out[3] = c[3];
  return out;
}
function linearToSrgb(out, c) {
  out[0] = linearChannelToSrgb(c[0]);
  out[1] = linearChannelToSrgb(c[1]);
  out[2] = linearChannelToSrgb(c[2]);
  out[3] = c[3];
  return out;
}
var HEX_PATTERN = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/;
function fromHex(out, hex) {
  const match = typeof hex === "string" ? HEX_PATTERN.exec(hex) : null;
  if (match === null) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
  }
  out[0] = srgbChannelToLinear(Number.parseInt(match[1], 16) / 255);
  out[1] = srgbChannelToLinear(Number.parseInt(match[2], 16) / 255);
  out[2] = srgbChannelToLinear(Number.parseInt(match[3], 16) / 255);
  out[3] = match[4] !== void 0 ? Number.parseInt(match[4], 16) / 255 : 1;
  return out;
}
var CSS_HEX_PATTERN = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
var CSS_RGB_PATTERN = /^rgba?\(([^()]*)\)$/i;
var CSS_HSL_PATTERN = /^hsla?\(([^()]*)\)$/i;
var CSS_DECIMAL_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
var CSS_NAMED_COLORS = {
  black: "#000000",
  blue: "#0000ff",
  cyan: "#00ffff",
  fuchsia: "#ff00ff",
  gray: "#808080",
  green: "#008000",
  grey: "#808080",
  lime: "#00ff00",
  magenta: "#ff00ff",
  maroon: "#800000",
  navy: "#000080",
  olive: "#808000",
  orange: "#ffa500",
  purple: "#800080",
  red: "#ff0000",
  silver: "#c0c0c0",
  teal: "#008080",
  transparent: "#00000000",
  white: "#ffffff",
  yellow: "#ffff00"
};
function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}
function parseCssChannel(token) {
  const trimmed = token.trim();
  if (trimmed.endsWith("%")) {
    const raw = trimmed.slice(0, -1).trim();
    if (!CSS_DECIMAL_PATTERN.test(raw)) return void 0;
    const value2 = Number(raw);
    return Number.isFinite(value2) ? clamp01(value2 / 100) : void 0;
  }
  if (!CSS_DECIMAL_PATTERN.test(trimmed)) return void 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? clamp01(value / 255) : void 0;
}
function parseCssAlpha(token) {
  const trimmed = token.trim();
  if (trimmed.endsWith("%")) {
    const raw = trimmed.slice(0, -1).trim();
    if (!CSS_DECIMAL_PATTERN.test(raw)) return void 0;
    const value2 = Number(raw);
    return Number.isFinite(value2) ? clamp01(value2 / 100) : void 0;
  }
  if (!CSS_DECIMAL_PATTERN.test(trimmed)) return void 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? clamp01(value) : void 0;
}
function parseCssHue(token) {
  const match = /^([+-]?(?:\d+\.?\d*|\.\d+))(deg|grad|rad|turn)?$/i.exec(token.trim());
  if (match === null) return void 0;
  const raw = Number(match[1]);
  if (!Number.isFinite(raw)) return void 0;
  const unit = (match[2] ?? "deg").toLowerCase();
  const degrees = unit === "grad" ? raw * 0.9 : unit === "rad" ? raw * 180 / Math.PI : unit === "turn" ? raw * 360 : raw;
  return (degrees % 360 + 360) % 360;
}
function parseCssPercentage(token) {
  const trimmed = token.trim();
  if (!trimmed.endsWith("%")) return void 0;
  const raw = trimmed.slice(0, -1).trim();
  if (!CSS_DECIMAL_PATTERN.test(raw)) return void 0;
  const value = Number(raw);
  return Number.isFinite(value) ? clamp01(value / 100) : void 0;
}
function splitCssColorArgs(body) {
  const source = body.trim();
  if (source.length === 0) return void 0;
  if (source.includes(",")) {
    if (source.includes("/")) return void 0;
    const parts = source.split(",").map((part) => part.trim());
    if (parts.length !== 3 && parts.length !== 4) return void 0;
    if (parts.some((part) => part.length === 0)) return void 0;
    return {
      channels: [parts[0], parts[1], parts[2]],
      ...parts.length === 4 ? { alpha: parts[3] } : {}
    };
  }
  const tokens = source.replaceAll("/", " / ").split(/\s+/);
  const slash = tokens.indexOf("/");
  if (slash === -1) {
    if (tokens.length !== 3) return void 0;
    return { channels: [tokens[0], tokens[1], tokens[2]] };
  }
  if (slash !== 3 || tokens.length !== 5 || tokens[4] === void 0) return void 0;
  return {
    channels: [tokens[0], tokens[1], tokens[2]],
    alpha: tokens[4]
  };
}
function hslToSrgb(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const h = hue / 60;
  const x = chroma * (1 - Math.abs(h % 2 - 1));
  const [r1, g1, b1] = h < 1 ? [chroma, x, 0] : h < 2 ? [x, chroma, 0] : h < 3 ? [0, chroma, x] : h < 4 ? [0, x, chroma] : h < 5 ? [x, 0, chroma] : [chroma, 0, x];
  const m = lightness - chroma / 2;
  return [r1 + m, g1 + m, b1 + m];
}
function cssFallback(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
function fromCss(out, css) {
  if (typeof css !== "string") return cssFallback(out);
  const source = css.trim().toLowerCase();
  const named = CSS_NAMED_COLORS[source];
  if (named !== void 0) return fromHex(out, named);
  const fullHex = CSS_HEX_PATTERN.exec(source);
  if (fullHex !== null) {
    const digits = fullHex[1];
    if (digits.length === 3 || digits.length === 4) {
      const expanded = [...digits].map((channel) => `${channel}${channel}`).join("");
      return fromHex(out, `#${expanded}`);
    }
    return fromHex(out, source);
  }
  const rgb = CSS_RGB_PATTERN.exec(source);
  if (rgb !== null) {
    const args = splitCssColorArgs(rgb[1]);
    if (args === void 0) return cssFallback(out);
    const r = parseCssChannel(args.channels[0]);
    const g = parseCssChannel(args.channels[1]);
    const b = parseCssChannel(args.channels[2]);
    const alpha = args.alpha === void 0 ? 1 : parseCssAlpha(args.alpha);
    if (r === void 0 || g === void 0 || b === void 0 || alpha === void 0)
      return cssFallback(out);
    out[0] = srgbChannelToLinear(r);
    out[1] = srgbChannelToLinear(g);
    out[2] = srgbChannelToLinear(b);
    out[3] = alpha;
    return out;
  }
  const hsl = CSS_HSL_PATTERN.exec(source);
  if (hsl !== null) {
    const args = splitCssColorArgs(hsl[1]);
    if (args === void 0) return cssFallback(out);
    const hue = parseCssHue(args.channels[0]);
    const saturation = parseCssPercentage(args.channels[1]);
    const lightness = parseCssPercentage(args.channels[2]);
    const alpha = args.alpha === void 0 ? 1 : parseCssAlpha(args.alpha);
    if (hue === void 0 || saturation === void 0 || lightness === void 0 || alpha === void 0)
      return cssFallback(out);
    const [r, g, b] = hslToSrgb(hue, saturation, lightness);
    out[0] = srgbChannelToLinear(r);
    out[1] = srgbChannelToLinear(g);
    out[2] = srgbChannelToLinear(b);
    out[3] = alpha;
    return out;
  }
  return cssFallback(out);
}
function toHexByte(v, encodeLinear = true) {
  if (Number.isNaN(v)) return "00";
  const clamped = Math.max(0, Math.min(1, encodeLinear ? linearChannelToSrgb(v) : v));
  const byte = Math.round(clamped * 255);
  return byte.toString(16).padStart(2, "0");
}
function toHex(c) {
  const r = toHexByte(c[0]);
  const g = toHexByte(c[1]);
  const b = toHexByte(c[2]);
  const aValue = c[3];
  if (aValue >= 1 || Number.isNaN(aValue)) {
    return `#${r}${g}${b}`;
  }
  const a = toHexByte(aValue, false);
  return `#${r}${g}${b}${a}`;
}

// src/easing.ts
var easing_exports = {};
__export(easing_exports, {
  cubicInOut: () => cubicInOut,
  elasticInOut: () => elasticInOut,
  smootherstep: () => smootherstep,
  smoothstep: () => smoothstep
});

// src/_internal/scalar.ts
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function lengthSq4(a) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  const w = a[3];
  return x * x + y * y + z * z + w * w;
}
function normalize4(out, a, epsilon) {
  const lenSq = lengthSq4(a);
  if (lenSq < epsilon) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return;
  }
  const inv = 1 / Math.sqrt(lenSq);
  out[0] = a[0] * inv;
  out[1] = a[1] * inv;
  out[2] = a[2] * inv;
  out[3] = a[3] * inv;
}
function smoothDecayFactor(decayRate, dt) {
  return 1 - Math.exp(-decayRate * dt);
}
function catmullRomScalar(a, b, c, d, t) {
  const c0 = b;
  const c1 = 0.5 * (c - a);
  const c2 = a - 2.5 * b + 2 * c - 0.5 * d;
  const c3 = -0.5 * a + 1.5 * b - 1.5 * c + 0.5 * d;
  const t2 = t * t;
  const t3 = t2 * t;
  return c0 + c1 * t + c2 * t2 + c3 * t3;
}
function clamp(v, min4, max4) {
  if (v < min4) return min4;
  if (v > max4) return max4;
  return v;
}

// src/easing.ts
function cubicInOut(t) {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}
function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}
function smootherstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}
function elasticInOut(t) {
  const x = clamp(t, 0, 1);
  if (x === 0 || x === 1) return x;
  const c5 = 2 * Math.PI / 4.5;
  return x < 0.5 ? -(2 ** (20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2 : 2 ** (-20 * x + 10) * Math.sin((20 * x - 11.125) * c5) / 2 + 1;
}

// src/euler.ts
var euler_exports = {};
__export(euler_exports, {
  clone: () => clone3,
  create: () => create6,
  fromQuat: () => fromQuat,
  fromRotationMatrix: () => fromRotationMatrix2,
  set: () => set,
  toQuat: () => toQuat
});

// src/quat.ts
var quat_exports = {};
__export(quat_exports, {
  clone: () => clone2,
  conjugate: () => conjugate,
  create: () => create5,
  dot: () => dot,
  eulerY: () => eulerY,
  forward: () => forward,
  fromAxisAngle: () => fromAxisAngle,
  fromEuler: () => fromEuler,
  fromLookAt: () => fromLookAt,
  fromRotationMatrix: () => fromRotationMatrix,
  fromUnitVectors: () => fromUnitVectors,
  identity: () => identity,
  invert: () => invert,
  length: () => length,
  lengthSq: () => lengthSq,
  multiply: () => multiply,
  nlerp: () => nlerp,
  normalize: () => normalize,
  right: () => right,
  rotateAxis: () => rotateAxis,
  slerp: () => slerp,
  transformVec3: () => transformVec3,
  up: () => up
});

// src/_internal/epsilon.ts
var EPS_NORMALIZE = 1e-12;
var EPS_DET = 1e-8;
var EPS_QUAT_PARALLEL = 1e-6;
var EPS_SLERP_DOT_LIMIT = 1e-6;

// src/quat.ts
var UNIT_X = [1, 0, 0];
var UNIT_Y = [0, 1, 0];
var UNIT_NEG_Z = [0, 0, -1];
function create5() {
  return new Float32Array(4);
}
function clone2(a) {
  return Float32Array.of(a[0], a[1], a[2], a[3]);
}
function identity(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
function fromAxisAngle(out, axis, angleRadians) {
  const ax = axis[0];
  const ay = axis[1];
  const az = axis[2];
  const lenSq = ax * ax + ay * ay + az * az;
  if (lenSq < EPS_NORMALIZE) {
    return identity(out);
  }
  const inv = 1 / Math.sqrt(lenSq);
  const half = angleRadians / 2;
  const s = Math.sin(half);
  out[0] = ax * inv * s;
  out[1] = ay * inv * s;
  out[2] = az * inv * s;
  out[3] = Math.cos(half);
  return out;
}
function fromEuler(out, x, y, z, order) {
  const c1 = Math.cos(x / 2);
  const c2 = Math.cos(y / 2);
  const c3 = Math.cos(z / 2);
  const s1 = Math.sin(x / 2);
  const s2 = Math.sin(y / 2);
  const s3 = Math.sin(z / 2);
  switch (order) {
    case "XYZ":
      out[0] = s1 * c2 * c3 + c1 * s2 * s3;
      out[1] = c1 * s2 * c3 - s1 * c2 * s3;
      out[2] = c1 * c2 * s3 + s1 * s2 * c3;
      out[3] = c1 * c2 * c3 - s1 * s2 * s3;
      break;
    case "YXZ":
      out[0] = s1 * c2 * c3 + c1 * s2 * s3;
      out[1] = c1 * s2 * c3 - s1 * c2 * s3;
      out[2] = c1 * c2 * s3 - s1 * s2 * c3;
      out[3] = c1 * c2 * c3 + s1 * s2 * s3;
      break;
    case "ZXY":
      out[0] = s1 * c2 * c3 - c1 * s2 * s3;
      out[1] = c1 * s2 * c3 + s1 * c2 * s3;
      out[2] = c1 * c2 * s3 + s1 * s2 * c3;
      out[3] = c1 * c2 * c3 - s1 * s2 * s3;
      break;
    case "ZYX":
      out[0] = s1 * c2 * c3 - c1 * s2 * s3;
      out[1] = c1 * s2 * c3 + s1 * c2 * s3;
      out[2] = c1 * c2 * s3 - s1 * s2 * c3;
      out[3] = c1 * c2 * c3 + s1 * s2 * s3;
      break;
    case "YZX":
      out[0] = s1 * c2 * c3 + c1 * s2 * s3;
      out[1] = c1 * s2 * c3 + s1 * c2 * s3;
      out[2] = c1 * c2 * s3 - s1 * s2 * c3;
      out[3] = c1 * c2 * c3 - s1 * s2 * s3;
      break;
    case "XZY":
      out[0] = s1 * c2 * c3 - c1 * s2 * s3;
      out[1] = c1 * s2 * c3 - s1 * c2 * s3;
      out[2] = c1 * c2 * s3 + s1 * s2 * c3;
      out[3] = c1 * c2 * c3 + s1 * s2 * s3;
      break;
    default:
      out[0] = s1 * c2 * c3 + c1 * s2 * s3;
      out[1] = c1 * s2 * c3 - s1 * c2 * s3;
      out[2] = c1 * c2 * s3 + s1 * s2 * c3;
      out[3] = c1 * c2 * c3 - s1 * s2 * s3;
      break;
  }
  return out;
}
function fromRotationMatrix(out, m) {
  const m00 = m[0];
  const m01 = m[1];
  const m02 = m[2];
  const m10 = m[3];
  const m11 = m[4];
  const m12 = m[5];
  const m20 = m[6];
  const m21 = m[7];
  const m22 = m[8];
  const trace = m00 + m11 + m22;
  if (trace > 0) {
    const s = 0.5 / Math.sqrt(trace + 1);
    out[0] = (m12 - m21) * s;
    out[1] = (m20 - m02) * s;
    out[2] = (m01 - m10) * s;
    out[3] = 0.25 / s;
  } else if (m00 > m11 && m00 > m22) {
    const s = 2 * Math.sqrt(1 + m00 - m11 - m22);
    out[0] = 0.25 * s;
    out[1] = (m10 + m01) / s;
    out[2] = (m20 + m02) / s;
    out[3] = (m12 - m21) / s;
  } else if (m11 > m22) {
    const s = 2 * Math.sqrt(1 + m11 - m00 - m22);
    out[0] = (m10 + m01) / s;
    out[1] = 0.25 * s;
    out[2] = (m21 + m12) / s;
    out[3] = (m20 - m02) / s;
  } else {
    const s = 2 * Math.sqrt(1 + m22 - m00 - m11);
    out[0] = (m20 + m02) / s;
    out[1] = (m21 + m12) / s;
    out[2] = 0.25 * s;
    out[3] = (m01 - m10) / s;
  }
  return out;
}
function fromLookAt(out, eye, target, up2) {
  const ex = eye[0];
  const ey = eye[1];
  const ez = eye[2];
  let fx = ex - target[0];
  let fy = ey - target[1];
  let fz = ez - target[2];
  const fLenSq = fx * fx + fy * fy + fz * fz;
  if (fLenSq < EPS_NORMALIZE) {
    return identity(out);
  }
  const fInv = 1 / Math.sqrt(fLenSq);
  fx *= fInv;
  fy *= fInv;
  fz *= fInv;
  const upx = up2[0];
  const upy = up2[1];
  const upz = up2[2];
  let rx = upy * fz - upz * fy;
  let ry = upz * fx - upx * fz;
  let rz = upx * fy - upy * fx;
  let rLenSq = rx * rx + ry * ry + rz * rz;
  if (rLenSq < EPS_NORMALIZE) {
    rx = -fy;
    ry = fx;
    rz = 0;
    rLenSq = rx * rx + ry * ry + rz * rz;
    if (rLenSq < EPS_NORMALIZE) {
      rx = 0;
      ry = -fz;
      rz = fy;
      rLenSq = rx * rx + ry * ry + rz * rz;
    }
  }
  const rInv = 1 / Math.sqrt(rLenSq);
  rx *= rInv;
  ry *= rInv;
  rz *= rInv;
  const ux = fy * rz - fz * ry;
  const uy = fz * rx - fx * rz;
  const uz = fx * ry - fy * rx;
  const m3 = new Float32Array(9);
  m3[0] = rx;
  m3[1] = ry;
  m3[2] = rz;
  m3[3] = ux;
  m3[4] = uy;
  m3[5] = uz;
  m3[6] = fx;
  m3[7] = fy;
  m3[8] = fz;
  return fromRotationMatrix(out, m3);
}
function fromUnitVectors(out, v, w) {
  const vx = v[0];
  const vy = v[1];
  const vz = v[2];
  const wx = w[0];
  const wy = w[1];
  const wz = w[2];
  const d = vx * wx + vy * wy + vz * wz;
  if (d > 1 - EPS_QUAT_PARALLEL) {
    return identity(out);
  }
  if (d < -1 + EPS_QUAT_PARALLEL) {
    let ax;
    let ay;
    let az;
    if (Math.abs(vy) < 1 - EPS_QUAT_PARALLEL) {
      ax = -vz;
      ay = 0;
      az = vx;
    } else {
      ax = 0;
      ay = vz;
      az = -vy;
    }
    const axLen = Math.sqrt(ax * ax + ay * ay + az * az);
    if (axLen < EPS_NORMALIZE) {
      return identity(out);
    }
    const axInv = 1 / axLen;
    out[0] = ax * axInv;
    out[1] = ay * axInv;
    out[2] = az * axInv;
    out[3] = 0;
    return out;
  }
  const cx = vy * wz - vz * wy;
  const cy = vz * wx - vx * wz;
  const cz = vx * wy - vy * wx;
  const sw = 1 + d;
  const len = Math.sqrt(cx * cx + cy * cy + cz * cz + sw * sw);
  const inv = 1 / len;
  out[0] = cx * inv;
  out[1] = cy * inv;
  out[2] = cz * inv;
  out[3] = sw * inv;
  return out;
}
function multiply(out, a, b) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const aw = a[3];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];
  const bw = b[3];
  out[0] = aw * bx + ax * bw + ay * bz - az * by;
  out[1] = aw * by - ax * bz + ay * bw + az * bx;
  out[2] = aw * bz + ax * by - ay * bx + az * bw;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
function rotateAxis(out, q, axis, angleRadians) {
  const qx = q[0];
  const qy = q[1];
  const qz = q[2];
  const qw = q[3];
  const ax = axis[0];
  const ay = axis[1];
  const az = axis[2];
  const axisLen = Math.sqrt(ax * ax + ay * ay + az * az);
  let dx = 0;
  let dy = 0;
  let dz = 0;
  let dw = 1;
  if (axisLen >= EPS_NORMALIZE) {
    const half = angleRadians * 0.5;
    const s = Math.sin(half) / axisLen;
    dx = ax * s;
    dy = ay * s;
    dz = az * s;
    dw = Math.cos(half);
  }
  let rx = dw * qx + dx * qw + dy * qz - dz * qy;
  let ry = dw * qy - dx * qz + dy * qw + dz * qx;
  let rz = dw * qz + dx * qy - dy * qx + dz * qw;
  let rw = dw * qw - dx * qx - dy * qy - dz * qz;
  const len = Math.sqrt(rx * rx + ry * ry + rz * rz + rw * rw);
  if (len >= EPS_NORMALIZE) {
    const inv = 1 / len;
    rx *= inv;
    ry *= inv;
    rz *= inv;
    rw *= inv;
  }
  out[0] = rx;
  out[1] = ry;
  out[2] = rz;
  out[3] = rw;
  return out;
}
function slerp(out, a, b, t) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const aw = a[3];
  let bx = b[0];
  let by = b[1];
  let bz = b[2];
  let bw = b[3];
  let cosTheta = ax * bx + ay * by + az * bz + aw * bw;
  if (cosTheta < 0) {
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
    cosTheta = -cosTheta;
  }
  if (cosTheta > 1 - EPS_SLERP_DOT_LIMIT) {
    return nlerp(out, a, b, t);
  }
  const theta = Math.acos(cosTheta);
  const sinTheta = Math.sin(theta);
  const wa = Math.sin((1 - t) * theta) / sinTheta;
  const wb = Math.sin(t * theta) / sinTheta;
  out[0] = wa * ax + wb * bx;
  out[1] = wa * ay + wb * by;
  out[2] = wa * az + wb * bz;
  out[3] = wa * aw + wb * bw;
  return out;
}
function nlerp(out, a, b, t) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const aw = a[3];
  let bx = b[0];
  let by = b[1];
  let bz = b[2];
  let bw = b[3];
  const cosTheta = ax * bx + ay * by + az * bz + aw * bw;
  if (cosTheta < 0) {
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  out[0] = ax + t * (bx - ax);
  out[1] = ay + t * (by - ay);
  out[2] = az + t * (bz - az);
  out[3] = aw + t * (bw - aw);
  const lenSq = out[0] * out[0] + out[1] * out[1] + out[2] * out[2] + out[3] * out[3];
  if (lenSq < EPS_NORMALIZE) {
    return identity(out);
  }
  const inv = 1 / Math.sqrt(lenSq);
  out[0] = out[0] * inv;
  out[1] = out[1] * inv;
  out[2] = out[2] * inv;
  out[3] = out[3] * inv;
  return out;
}
function invert(out, a) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const aw = a[3];
  const lenSq = ax * ax + ay * ay + az * az + aw * aw;
  if (lenSq < EPS_NORMALIZE) {
    return identity(out);
  }
  const inv = 1 / lenSq;
  out[0] = -ax * inv;
  out[1] = -ay * inv;
  out[2] = -az * inv;
  out[3] = aw * inv;
  return out;
}
function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
function length(a) {
  return Math.sqrt(lengthSq(a));
}
function lengthSq(a) {
  return lengthSq4(a);
}
function transformVec3(out, q, v) {
  const qx = q[0];
  const qy = q[1];
  const qz = q[2];
  const qw = q[3];
  const vx = v[0];
  const vy = v[1];
  const vz = v[2];
  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);
  out[0] = vx + qw * tx + (qy * tz - qz * ty);
  out[1] = vy + qw * ty + (qz * tx - qx * tz);
  out[2] = vz + qw * tz + (qx * ty - qy * tx);
  return out;
}
function normalize(out, a) {
  normalize4(out, a, EPS_NORMALIZE);
  return out;
}
function eulerY(theta) {
  const out = create5();
  return fromEuler(out, 0, theta, 0, "YXZ");
}
function right(out, q) {
  return transformVec3(out, q, UNIT_X);
}
function up(out, q) {
  return transformVec3(out, q, UNIT_Y);
}
function forward(out, q) {
  return transformVec3(out, q, UNIT_NEG_Z);
}

// src/euler.ts
function create6() {
  return { x: 0, y: 0, z: 0, order: "XYZ" };
}
function clone3(a) {
  return { x: a.x, y: a.y, z: a.z, order: a.order };
}
function set(out, x, y, z, order) {
  out.x = x;
  out.y = y;
  out.z = z;
  out.order = order;
  return out;
}
function toQuat(out, e) {
  return fromEuler(out, e.x, e.y, e.z, e.order);
}
function fromQuat(out, q, order) {
  const x = q[0];
  const y = q[1];
  const z = q[2];
  const w = q[3];
  const xx = x * x;
  const xy = x * y;
  const xz = x * z;
  const yy = y * y;
  const yz = y * z;
  const zz = z * z;
  const wx = w * x;
  const wy = w * y;
  const wz = w * z;
  const m = new Float32Array(9);
  m[0] = 1 - 2 * (yy + zz);
  m[1] = 2 * (xy + wz);
  m[2] = 2 * (xz - wy);
  m[3] = 2 * (xy - wz);
  m[4] = 1 - 2 * (xx + zz);
  m[5] = 2 * (yz + wx);
  m[6] = 2 * (xz + wy);
  m[7] = 2 * (yz - wx);
  m[8] = 1 - 2 * (xx + yy);
  return fromRotationMatrix2(out, m, order);
}
function fromRotationMatrix2(out, m, order) {
  const _11 = m[0];
  const _21 = m[1];
  const _31 = m[2];
  const _12 = m[3];
  const _22 = m[4];
  const _32 = m[5];
  const _13 = m[6];
  const _23 = m[7];
  const _33 = m[8];
  out.order = order;
  switch (order) {
    case "XYZ":
      out.y = Math.asin(clamp11(_13));
      if (Math.abs(_13) < 1 - 1e-7) {
        out.x = Math.atan2(-_23, _33);
        out.z = Math.atan2(-_12, _11);
      } else {
        out.x = Math.atan2(_32, _22);
        out.z = 0;
      }
      break;
    case "YXZ":
      out.x = Math.asin(-clamp11(_23));
      if (Math.abs(_23) < 1 - 1e-7) {
        out.y = Math.atan2(_13, _33);
        out.z = Math.atan2(_21, _22);
      } else {
        out.y = Math.atan2(-_31, _11);
        out.z = 0;
      }
      break;
    case "ZXY":
      out.x = Math.asin(clamp11(_32));
      if (Math.abs(_32) < 1 - 1e-7) {
        out.y = Math.atan2(-_31, _33);
        out.z = Math.atan2(-_12, _22);
      } else {
        out.y = 0;
        out.z = Math.atan2(_21, _11);
      }
      break;
    case "ZYX":
      out.y = Math.asin(-clamp11(_31));
      if (Math.abs(_31) < 1 - 1e-7) {
        out.x = Math.atan2(_32, _33);
        out.z = Math.atan2(_21, _11);
      } else {
        out.x = 0;
        out.z = Math.atan2(-_12, _22);
      }
      break;
    case "YZX":
      out.z = Math.asin(clamp11(_21));
      if (Math.abs(_21) < 1 - 1e-7) {
        out.x = Math.atan2(-_23, _22);
        out.y = Math.atan2(-_31, _11);
      } else {
        out.x = 0;
        out.y = Math.atan2(_13, _33);
      }
      break;
    case "XZY":
      out.z = Math.asin(-clamp11(_12));
      if (Math.abs(_12) < 1 - 1e-7) {
        out.x = Math.atan2(_32, _22);
        out.y = Math.atan2(_13, _11);
      } else {
        out.x = Math.atan2(-_23, _33);
        out.y = 0;
      }
      break;
    default:
      out.y = Math.asin(clamp11(_13));
      if (Math.abs(_13) < 1 - 1e-7) {
        out.x = Math.atan2(-_23, _33);
        out.z = Math.atan2(-_12, _11);
      } else {
        out.x = Math.atan2(_32, _22);
        out.z = 0;
      }
      out.order = "XYZ";
      break;
  }
  return out;
}
function clamp11(v) {
  if (v < -1) return -1;
  if (v > 1) return 1;
  return v;
}

// src/f32-to-f16-bytes.ts
var f32_to_f16_bytes_exports = {};
__export(f32_to_f16_bytes_exports, {
  f32ToF16Bytes: () => f32ToF16Bytes
});
function f32ToF16Bytes(src) {
  const f32 = new Float32Array(src.buffer, src.byteOffset, src.byteLength / 4);
  const out = new Uint8Array(f32.length * 2);
  const view = new DataView(out.buffer);
  const scratch = new ArrayBuffer(4);
  const scratchF = new Float32Array(scratch);
  const scratchU = new Uint32Array(scratch);
  for (let i = 0; i < f32.length; i++) {
    scratchF[0] = f32[i] ?? 0;
    const bits = scratchU[0] ?? 0;
    const sign = bits >>> 31 & 1;
    const exp = bits >>> 23 & 255;
    let mant = bits & 8388607;
    let half;
    if (exp === 255) {
      half = sign << 15 | 31744 | (mant ? 512 : 0);
    } else if (exp === 0) {
      half = sign << 15;
    } else {
      const e = exp - 127 + 15;
      if (e >= 31) {
        half = sign << 15 | 31744;
      } else if (e <= 0) {
        if (e < -10) {
          half = sign << 15;
        } else {
          mant = (mant | 8388608) >> 1 - e;
          if (mant & 4096) mant += 8192;
          half = sign << 15 | mant >> 13;
        }
      } else {
        if (mant & 4096) {
          mant += 8192;
          if (mant & 8388608) {
            mant = 0;
            half = sign << 15 | e + 1 << 10;
          } else {
            half = sign << 15 | e << 10 | mant >> 13;
          }
        } else {
          half = sign << 15 | e << 10 | mant >> 13;
        }
      }
    }
    view.setUint16(i * 2, half & 65535, true);
  }
  return out;
}

// src/frustum.ts
var frustum_exports = {};
__export(frustum_exports, {
  create: () => create7,
  fromViewProjection: () => fromViewProjection,
  intersectsBox: () => intersectsBox4,
  intersectsSphere: () => intersectsSphere
});
function create7() {
  return new Float32Array(24);
}
function fromViewProjection(out, vp) {
  const m0 = vp[0];
  const m1 = vp[1];
  const m2 = vp[2];
  const m3 = vp[3];
  const m4 = vp[4];
  const m5 = vp[5];
  const m6 = vp[6];
  const m7 = vp[7];
  const m8 = vp[8];
  const m9 = vp[9];
  const m10 = vp[10];
  const m11 = vp[11];
  const m12 = vp[12];
  const m13 = vp[13];
  const m14 = vp[14];
  const m15 = vp[15];
  let nx = m3 + m0, ny = m7 + m4, nz = m11 + m8, d = m15 + m12;
  let len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (len > 0) {
    const il = 1 / len;
    nx *= il;
    ny *= il;
    nz *= il;
    d *= il;
  }
  out[0] = nx;
  out[1] = ny;
  out[2] = nz;
  out[3] = d;
  nx = m3 - m0;
  ny = m7 - m4;
  nz = m11 - m8;
  d = m15 - m12;
  len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (len > 0) {
    const il = 1 / len;
    nx *= il;
    ny *= il;
    nz *= il;
    d *= il;
  }
  out[4] = nx;
  out[5] = ny;
  out[6] = nz;
  out[7] = d;
  nx = m3 + m1;
  ny = m7 + m5;
  nz = m11 + m9;
  d = m15 + m13;
  len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (len > 0) {
    const il = 1 / len;
    nx *= il;
    ny *= il;
    nz *= il;
    d *= il;
  }
  out[8] = nx;
  out[9] = ny;
  out[10] = nz;
  out[11] = d;
  nx = m3 - m1;
  ny = m7 - m5;
  nz = m11 - m9;
  d = m15 - m13;
  len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (len > 0) {
    const il = 1 / len;
    nx *= il;
    ny *= il;
    nz *= il;
    d *= il;
  }
  out[12] = nx;
  out[13] = ny;
  out[14] = nz;
  out[15] = d;
  nx = m3 + m2;
  ny = m7 + m6;
  nz = m11 + m10;
  d = m15 + m14;
  len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (len > 0) {
    const il = 1 / len;
    nx *= il;
    ny *= il;
    nz *= il;
    d *= il;
  }
  out[16] = nx;
  out[17] = ny;
  out[18] = nz;
  out[19] = d;
  nx = m3 - m2;
  ny = m7 - m6;
  nz = m11 - m10;
  d = m15 - m14;
  len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (len > 0) {
    const il = 1 / len;
    nx *= il;
    ny *= il;
    nz *= il;
    d *= il;
  }
  out[20] = nx;
  out[21] = ny;
  out[22] = nz;
  out[23] = d;
  return out;
}
function intersectsBox4(f, box) {
  const bx = box[0];
  const by = box[1];
  const bz = box[2];
  const bX = box[3];
  const bY = box[4];
  const bZ = box[5];
  for (let i = 0; i < 6; i++) {
    const off = i * 4;
    const nx = f[off];
    const ny = f[off + 1];
    const nz = f[off + 2];
    const d = f[off + 3];
    const px = nx >= 0 ? bX : bx;
    const py = ny >= 0 ? bY : by;
    const pz = nz >= 0 ? bZ : bz;
    if (nx * px + ny * py + nz * pz + d < 0) {
      return false;
    }
  }
  return true;
}
function intersectsSphere(f, center3, radius2) {
  const cx = center3[0];
  const cy = center3[1];
  const cz = center3[2];
  for (let i = 0; i < 6; i++) {
    const off = i * 4;
    const nx = f[off];
    const ny = f[off + 1];
    const nz = f[off + 2];
    const sd = f[off + 3];
    const dist = nx * cx + ny * cy + nz * cz + sd;
    if (dist < -radius2) {
      return false;
    }
  }
  return true;
}

// src/mat3.ts
var mat3_exports = {};
__export(mat3_exports, {
  clone: () => clone4,
  create: () => create8,
  equals: () => equals,
  fromMat4: () => fromMat4,
  identity: () => identity2,
  invert: () => invert2,
  multiply: () => multiply2,
  normalMatrix: () => normalMatrix,
  scale: () => scale,
  transpose: () => transpose
});
function create8() {
  return new Float32Array(9);
}
function clone4(a) {
  return Float32Array.of(
    a[0],
    a[1],
    a[2],
    a[3],
    a[4],
    a[5],
    a[6],
    a[7],
    a[8]
  );
}
function identity2(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
function equals(a, b, epsilon = 1e-6) {
  for (let i = 0; i < 9; i++) {
    const av = a[i];
    const bv = b[i];
    if (Number.isNaN(av) || Number.isNaN(bv)) return false;
    if (Math.abs(av - bv) > epsilon) return false;
  }
  return true;
}
function multiply2(out, a, b) {
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a10 = a[3];
  const a11 = a[4];
  const a12 = a[5];
  const a20 = a[6];
  const a21 = a[7];
  const a22 = a[8];
  const b00 = b[0];
  const b01 = b[1];
  const b02 = b[2];
  const b10 = b[3];
  const b11 = b[4];
  const b12 = b[5];
  const b20 = b[6];
  const b21 = b[7];
  const b22 = b[8];
  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a00 * b10 + a10 * b11 + a20 * b12;
  out[4] = a01 * b10 + a11 * b11 + a21 * b12;
  out[5] = a02 * b10 + a12 * b11 + a22 * b12;
  out[6] = a00 * b20 + a10 * b21 + a20 * b22;
  out[7] = a01 * b20 + a11 * b21 + a21 * b22;
  out[8] = a02 * b20 + a12 * b21 + a22 * b22;
  return out;
}
function transpose(out, a) {
  const a01 = a[1];
  const a02 = a[2];
  const a12 = a[5];
  const a10 = a[3];
  const a20 = a[6];
  const a21 = a[7];
  out[0] = a[0];
  out[1] = a10;
  out[2] = a20;
  out[3] = a01;
  out[4] = a[4];
  out[5] = a21;
  out[6] = a02;
  out[7] = a12;
  out[8] = a[8];
  return out;
}
function invert2(out, a) {
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a10 = a[3];
  const a11 = a[4];
  const a12 = a[5];
  const a20 = a[6];
  const a21 = a[7];
  const a22 = a[8];
  const b01 = a22 * a11 - a12 * a21;
  const b11 = -a22 * a10 + a12 * a20;
  const b21 = a21 * a10 - a11 * a20;
  const det = a00 * b01 + a01 * b11 + a02 * b21;
  if (Math.abs(det) < EPS_DET) {
    return identity2(out);
  }
  const invDet = 1 / det;
  out[0] = b01 * invDet;
  out[1] = (-a22 * a01 + a02 * a21) * invDet;
  out[2] = (a12 * a01 - a02 * a11) * invDet;
  out[3] = b11 * invDet;
  out[4] = (a22 * a00 - a02 * a20) * invDet;
  out[5] = (-a12 * a00 + a02 * a10) * invDet;
  out[6] = b21 * invDet;
  out[7] = (-a21 * a00 + a01 * a20) * invDet;
  out[8] = (a11 * a00 - a01 * a10) * invDet;
  return out;
}
function scale(out, a, v) {
  const x = v[0];
  const y = v[1];
  const z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * y;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * z;
  out[7] = a[7] * z;
  out[8] = a[8] * z;
  return out;
}
function fromMat4(out, m) {
  out[0] = m[0];
  out[1] = m[1];
  out[2] = m[2];
  out[3] = m[4];
  out[4] = m[5];
  out[5] = m[6];
  out[6] = m[8];
  out[7] = m[9];
  out[8] = m[10];
  return out;
}
function normalMatrix(out, m) {
  const m00 = m[0];
  const m01 = m[1];
  const m02 = m[2];
  const m10 = m[4];
  const m11 = m[5];
  const m12 = m[6];
  const m20 = m[8];
  const m21 = m[9];
  const m22 = m[10];
  const b01 = m22 * m11 - m12 * m21;
  const b11 = -m22 * m10 + m12 * m20;
  const b21 = m21 * m10 - m11 * m20;
  const det = m00 * b01 + m01 * b11 + m02 * b21;
  if (Math.abs(det) < EPS_DET) {
    return identity2(out);
  }
  const invDet = 1 / det;
  out[0] = b01 * invDet;
  out[3] = (-m22 * m01 + m02 * m21) * invDet;
  out[6] = (m12 * m01 - m02 * m11) * invDet;
  out[1] = b11 * invDet;
  out[4] = (m22 * m00 - m02 * m20) * invDet;
  out[7] = (-m12 * m00 + m02 * m10) * invDet;
  out[2] = b21 * invDet;
  out[5] = (-m21 * m00 + m01 * m20) * invDet;
  out[8] = (m11 * m00 - m01 * m10) * invDet;
  return out;
}

// src/mat4.ts
var mat4_exports = {};
__export(mat4_exports, {
  clone: () => clone6,
  compose: () => compose,
  computeViewProj: () => computeViewProj,
  create: () => create10,
  decompose: () => decompose,
  equals: () => equals3,
  fromQuat: () => fromQuat2,
  fromRotation: () => fromRotation,
  fromScaling: () => fromScaling,
  fromTranslation: () => fromTranslation,
  getForward: () => getForward,
  getRight: () => getRight,
  getTranslation: () => getTranslation,
  getUp: () => getUp,
  identity: () => identity3,
  invert: () => invert3,
  lookAt: () => lookAt,
  multiply: () => multiply3,
  orthographic: () => orthographic,
  orthographicNO: () => orthographicNO,
  orthographicReverseZ: () => orthographicReverseZ,
  perspective: () => perspective,
  perspectiveNO: () => perspectiveNO,
  perspectiveReverseZ: () => perspectiveReverseZ,
  projectPoint: () => projectPoint,
  rotate: () => rotate,
  scale: () => scale3,
  transformDirection: () => transformDirection,
  transformPoint: () => transformPoint,
  transformVec3: () => transformVec32,
  translate: () => translate,
  transpose: () => transpose2,
  unproject: () => unproject
});

// src/vec3.ts
var vec3_exports = {};
__export(vec3_exports, {
  add: () => add,
  catmullRom: () => catmullRom,
  clone: () => clone5,
  copy: () => copy,
  create: () => create9,
  cross: () => cross,
  distance: () => distance,
  distanceSq: () => distanceSq,
  dot: () => dot2,
  equals: () => equals2,
  length: () => length2,
  lengthSq: () => lengthSq2,
  lerp: () => lerp2,
  max: () => max,
  min: () => min,
  negate: () => negate,
  normalize: () => normalize2,
  scale: () => scale2,
  set: () => set2,
  smoothDamp: () => smoothDamp,
  sub: () => sub
});
function create9(x = 0, y = 0, z = 0) {
  return Float32Array.of(x, y, z);
}
function clone5(a) {
  return Float32Array.of(a[0], a[1], a[2]);
}
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
function set2(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function equals2(a, b, epsilon = 1e-6) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];
  if (Number.isNaN(ax) || Number.isNaN(ay) || Number.isNaN(az) || Number.isNaN(bx) || Number.isNaN(by) || Number.isNaN(bz)) {
    return false;
  }
  return Math.abs(ax - bx) <= epsilon && Math.abs(ay - by) <= epsilon && Math.abs(az - bz) <= epsilon;
}
function add(out, a, b) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];
  out[0] = ax + bx;
  out[1] = ay + by;
  out[2] = az + bz;
  return out;
}
function sub(out, a, b) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];
  out[0] = ax - bx;
  out[1] = ay - by;
  out[2] = az - bz;
  return out;
}
function scale2(out, a, s) {
  out[0] = a[0] * s;
  out[1] = a[1] * s;
  out[2] = a[2] * s;
  return out;
}
function negate(out, a) {
  out[0] = 0 - a[0];
  out[1] = 0 - a[1];
  out[2] = 0 - a[2];
  return out;
}
function dot2(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(out, a, b) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
function lengthSq2(a) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  return x * x + y * y + z * z;
}
function length2(a) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
function distance(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
function distanceSq(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}
function normalize2(out, a) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  const lenSq = x * x + y * y + z * z;
  if (lenSq < EPS_NORMALIZE) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
  }
  const inv = 1 / Math.sqrt(lenSq);
  out[0] = x * inv;
  out[1] = y * inv;
  out[2] = z * inv;
  return out;
}
function lerp2(out, a, b, t) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];
  out[0] = lerp(ax, bx, t);
  out[1] = lerp(ay, by, t);
  out[2] = lerp(az, bz, t);
  return out;
}
function smoothDamp(out, current, target, decayRate, dt) {
  return lerp2(out, current, target, smoothDecayFactor(decayRate, dt));
}
function catmullRom(out, p0, p1, p2, p3, t) {
  const x = catmullRomScalar(p0[0], p1[0], p2[0], p3[0], t);
  const y = catmullRomScalar(p0[1], p1[1], p2[1], p3[1], t);
  const z = catmullRomScalar(p0[2], p1[2], p2[2], p3[2], t);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}
function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}

// src/mat4.ts
function create10() {
  return new Float32Array(16);
}
function clone6(a) {
  const r = new Float32Array(16);
  for (let i = 0; i < 16; i++) r[i] = a[i];
  return r;
}
function identity3(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function equals3(a, b, epsilon = 1e-6) {
  for (let i = 0; i < 16; i++) {
    const av = a[i];
    const bv = b[i];
    if (Number.isNaN(av) || Number.isNaN(bv)) return false;
    if (Math.abs(av - bv) > epsilon) return false;
  }
  return true;
}
function multiply3(out, a, b) {
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  const a30 = a[12];
  const a31 = a[13];
  const a32 = a[14];
  const a33 = a[15];
  const b00 = b[0];
  const b01 = b[1];
  const b02 = b[2];
  const b03 = b[3];
  const b10 = b[4];
  const b11 = b[5];
  const b12 = b[6];
  const b13 = b[7];
  const b20 = b[8];
  const b21 = b[9];
  const b22 = b[10];
  const b23 = b[11];
  const b30 = b[12];
  const b31 = b[13];
  const b32 = b[14];
  const b33 = b[15];
  out[0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
  out[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
  out[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
  out[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
  out[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;
  return out;
}
function transpose2(out, a) {
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a12 = a[6];
  const a13 = a[7];
  const a23 = a[11];
  const a10 = a[4];
  const a20 = a[8];
  const a30 = a[12];
  const a21 = a[9];
  const a31 = a[13];
  const a32 = a[14];
  out[0] = a[0];
  out[1] = a10;
  out[2] = a20;
  out[3] = a30;
  out[4] = a01;
  out[5] = a[5];
  out[6] = a21;
  out[7] = a31;
  out[8] = a02;
  out[9] = a12;
  out[10] = a[10];
  out[11] = a32;
  out[12] = a03;
  out[13] = a13;
  out[14] = a23;
  out[15] = a[15];
  return out;
}
function invert3(out, a) {
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  const a30 = a[12];
  const a31 = a[13];
  const a32 = a[14];
  const a33 = a[15];
  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;
  const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (Math.abs(det) < EPS_DET) {
    return identity3(out);
  }
  const invDet = 1 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * invDet;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * invDet;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * invDet;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * invDet;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * invDet;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * invDet;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * invDet;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * invDet;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
  return out;
}
function scale3(out, a, v) {
  const x = v[0];
  const y = v[1];
  const z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function translate(out, a, v) {
  const x = v[0];
  const y = v[1];
  const z = v[2];
  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    return out;
  }
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  out[0] = a00;
  out[1] = a01;
  out[2] = a02;
  out[3] = a03;
  out[4] = a10;
  out[5] = a11;
  out[6] = a12;
  out[7] = a13;
  out[8] = a20;
  out[9] = a21;
  out[10] = a22;
  out[11] = a23;
  out[12] = a00 * x + a10 * y + a20 * z + a[12];
  out[13] = a01 * x + a11 * y + a21 * z + a[13];
  out[14] = a02 * x + a12 * y + a22 * z + a[14];
  out[15] = a03 * x + a13 * y + a23 * z + a[15];
  return out;
}
function rotate(out, a, axis, rad) {
  let x = axis[0];
  let y = axis[1];
  let z = axis[2];
  const lenSq = x * x + y * y + z * z;
  if (lenSq < EPS_NORMALIZE) {
    if (out !== a) {
      for (let i = 0; i < 16; i++) out[i] = a[i];
    }
    return out;
  }
  const invLen = 1 / Math.sqrt(lenSq);
  x *= invLen;
  y *= invLen;
  z *= invLen;
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const t = 1 - c;
  const r00 = x * x * t + c;
  const r01 = y * x * t + z * s;
  const r02 = z * x * t - y * s;
  const r10 = x * y * t - z * s;
  const r11 = y * y * t + c;
  const r12 = z * y * t + x * s;
  const r20 = x * z * t + y * s;
  const r21 = y * z * t - x * s;
  const r22 = z * z * t + c;
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  out[0] = a00 * r00 + a10 * r01 + a20 * r02;
  out[1] = a01 * r00 + a11 * r01 + a21 * r02;
  out[2] = a02 * r00 + a12 * r01 + a22 * r02;
  out[3] = a03 * r00 + a13 * r01 + a23 * r02;
  out[4] = a00 * r10 + a10 * r11 + a20 * r12;
  out[5] = a01 * r10 + a11 * r11 + a21 * r12;
  out[6] = a02 * r10 + a12 * r11 + a22 * r12;
  out[7] = a03 * r10 + a13 * r11 + a23 * r12;
  out[8] = a00 * r20 + a10 * r21 + a20 * r22;
  out[9] = a01 * r20 + a11 * r21 + a21 * r22;
  out[10] = a02 * r20 + a12 * r21 + a22 * r22;
  out[11] = a03 * r20 + a13 * r21 + a23 * r22;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function lookAt(out, eye, target, up2) {
  const ex = eye[0];
  const ey = eye[1];
  const ez = eye[2];
  const tx = target[0];
  const ty = target[1];
  const tz = target[2];
  const upx = up2[0];
  const upy = up2[1];
  const upz = up2[2];
  let fx = ex - tx;
  let fy = ey - ty;
  let fz = ez - tz;
  const fLenSq = fx * fx + fy * fy + fz * fz;
  if (fLenSq < EPS_NORMALIZE) {
    return identity3(out);
  }
  const fInv = 1 / Math.sqrt(fLenSq);
  fx *= fInv;
  fy *= fInv;
  fz *= fInv;
  let rx = upy * fz - upz * fy;
  let ry = upz * fx - upx * fz;
  let rz = upx * fy - upy * fx;
  let rLenSq = rx * rx + ry * ry + rz * rz;
  if (rLenSq < EPS_NORMALIZE) {
    rx = 0 * fz - 1 * fy;
    ry = 1 * fx - 0 * fz;
    rz = 0 * fy - 0 * fx;
    rLenSq = rx * rx + ry * ry + rz * rz;
    if (rLenSq < EPS_NORMALIZE) {
      rx = 0 * fz - 0 * fy;
      ry = 0 * fx - 1 * fz;
      rz = 1 * fy - 0 * fx;
      rLenSq = rx * rx + ry * ry + rz * rz;
    }
  }
  const rInv = 1 / Math.sqrt(rLenSq);
  rx *= rInv;
  ry *= rInv;
  rz *= rInv;
  const ux = fy * rz - fz * ry;
  const uy = fz * rx - fx * rz;
  const uz = fx * ry - fy * rx;
  out[0] = rx;
  out[1] = ux;
  out[2] = fx;
  out[3] = 0;
  out[4] = ry;
  out[5] = uy;
  out[6] = fy;
  out[7] = 0;
  out[8] = rz;
  out[9] = uz;
  out[10] = fz;
  out[11] = 0;
  out[12] = -(rx * ex + ry * ey + rz * ez);
  out[13] = -(ux * ex + uy * ey + uz * ez);
  out[14] = -(fx * ex + fy * ey + fz * ez);
  out[15] = 1;
  return out;
}
function compose(out, t, r, s) {
  const x = r[0];
  const y = r[1];
  const z = r[2];
  const w = r[3];
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const xy = x * y2;
  const xz = x * z2;
  const yy = y * y2;
  const yz = y * z2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;
  const sx = s[0];
  const sy = s[1];
  const sz = s[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = t[0];
  out[13] = t[1];
  out[14] = t[2];
  out[15] = 1;
  return out;
}
function decompose(out_t, out_r, out_s, m) {
  out_t[0] = m[12];
  out_t[1] = m[13];
  out_t[2] = m[14];
  const sx = Math.hypot(m[0], m[1], m[2]);
  const sy = Math.hypot(m[4], m[5], m[6]);
  const sz = Math.hypot(m[8], m[9], m[10]);
  const det = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[1] * (m[4] * m[10] - m[6] * m[8]) + m[2] * (m[4] * m[9] - m[5] * m[8]);
  const sxFinal = det < 0 ? -sx : sx;
  out_s[0] = sxFinal;
  out_s[1] = sy;
  out_s[2] = sz;
  const invSx = sxFinal === 0 ? 0 : 1 / sxFinal;
  const invSy = sy === 0 ? 0 : 1 / sy;
  const invSz = sz === 0 ? 0 : 1 / sz;
  const r00 = m[0] * invSx;
  const r01 = m[1] * invSx;
  const r02 = m[2] * invSx;
  const r10 = m[4] * invSy;
  const r11 = m[5] * invSy;
  const r12 = m[6] * invSy;
  const r20 = m[8] * invSz;
  const r21 = m[9] * invSz;
  const r22 = m[10] * invSz;
  const trace = r00 + r11 + r22;
  if (trace > 0) {
    const s = 0.5 / Math.sqrt(trace + 1);
    out_r[0] = (r12 - r21) * s;
    out_r[1] = (r20 - r02) * s;
    out_r[2] = (r01 - r10) * s;
    out_r[3] = 0.25 / s;
  } else if (r00 > r11 && r00 > r22) {
    const s = 2 * Math.sqrt(1 + r00 - r11 - r22);
    out_r[0] = 0.25 * s;
    out_r[1] = (r10 + r01) / s;
    out_r[2] = (r20 + r02) / s;
    out_r[3] = (r12 - r21) / s;
  } else if (r11 > r22) {
    const s = 2 * Math.sqrt(1 + r11 - r00 - r22);
    out_r[0] = (r10 + r01) / s;
    out_r[1] = 0.25 * s;
    out_r[2] = (r21 + r12) / s;
    out_r[3] = (r20 - r02) / s;
  } else {
    const s = 2 * Math.sqrt(1 + r22 - r00 - r11);
    out_r[0] = (r20 + r02) / s;
    out_r[1] = (r21 + r12) / s;
    out_r[2] = 0.25 * s;
    out_r[3] = (r01 - r10) / s;
  }
}
function fromQuat2(out, q) {
  const x = q[0];
  const y = q[1];
  const z = q[2];
  const w = q[3];
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const xy = x * y2;
  const xz = x * z2;
  const yy = y * y2;
  const yz = y * z2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromRotation(out, axis, rad) {
  let x = axis[0];
  let y = axis[1];
  let z = axis[2];
  const lenSq = x * x + y * y + z * z;
  if (lenSq < EPS_NORMALIZE) {
    return identity3(out);
  }
  const invLen = 1 / Math.sqrt(lenSq);
  x *= invLen;
  y *= invLen;
  z *= invLen;
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const t = 1 - c;
  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function perspective(out, fovYRadians, aspect, near, far) {
  const f = 1 / Math.tan(fovYRadians / 2);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far === Number.POSITIVE_INFINITY) {
    out[10] = -1;
    out[14] = -near;
  } else {
    const nf = 1 / (near - far);
    out[10] = far * nf;
    out[14] = far * near * nf;
  }
  return out;
}
function perspectiveNO(out, fovYRadians, aspect, near, far) {
  const f = 1 / Math.tan(fovYRadians / 2);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far === Number.POSITIVE_INFINITY) {
    out[10] = -1;
    out[14] = -2 * near;
  } else {
    const nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  }
  return out;
}
function perspectiveReverseZ(out, fovYRadians, aspect, near, far) {
  const f = 1 / Math.tan(fovYRadians / 2);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far === Number.POSITIVE_INFINITY) {
    out[10] = 0;
    out[14] = near;
  } else {
    const fn = 1 / (far - near);
    out[10] = near * fn;
    out[14] = near * far * fn;
  }
  return out;
}
function orthographic(out, left, right2, top, bottom, near, far) {
  const lr = 1 / (left - right2);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = nf;
  out[11] = 0;
  out[12] = (left + right2) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = near * nf;
  out[15] = 1;
  return out;
}
function orthographicNO(out, left, right2, top, bottom, near, far) {
  const lr = 1 / (left - right2);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right2) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (near + far) * nf;
  out[15] = 1;
  return out;
}
function orthographicReverseZ(out, left, right2, top, bottom, near, far) {
  const lr = 1 / (left - right2);
  const bt = 1 / (bottom - top);
  const fn = 1 / (far - near);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = fn;
  out[11] = 0;
  out[12] = (left + right2) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = far * fn;
  out[15] = 1;
  return out;
}
function transformVec32(out, m, v) {
  const x = v[0];
  const y = v[1];
  const z = v[2];
  const m00 = m[0];
  const m01 = m[1];
  const m02 = m[2];
  const m03 = m[3];
  const m10 = m[4];
  const m11 = m[5];
  const m12 = m[6];
  const m13 = m[7];
  const m20 = m[8];
  const m21 = m[9];
  const m22 = m[10];
  const m23 = m[11];
  const m30 = m[12];
  const m31 = m[13];
  const m32 = m[14];
  const m33 = m[15];
  const w = m03 * x + m13 * y + m23 * z + m33;
  if (w === 0) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
  }
  const invW = 1 / w;
  out[0] = (m00 * x + m10 * y + m20 * z + m30) * invW;
  out[1] = (m01 * x + m11 * y + m21 * z + m31) * invW;
  out[2] = (m02 * x + m12 * y + m22 * z + m32) * invW;
  return out;
}
var transformPoint = transformVec32;
function transformDirection(out, m, v) {
  const x = v[0];
  const y = v[1];
  const z = v[2];
  const m00 = m[0];
  const m01 = m[1];
  const m02 = m[2];
  const m10 = m[4];
  const m11 = m[5];
  const m12 = m[6];
  const m20 = m[8];
  const m21 = m[9];
  const m22 = m[10];
  out[0] = m00 * x + m10 * y + m20 * z;
  out[1] = m01 * x + m11 * y + m21 * z;
  out[2] = m02 * x + m12 * y + m22 * z;
  return normalize2(out, out);
}
function getTranslation(out, m) {
  out[0] = m[12];
  out[1] = m[13];
  out[2] = m[14];
  return out;
}
function getForward(out, m) {
  out[0] = -m[8];
  out[1] = -m[9];
  out[2] = -m[10];
  return normalize2(out, out);
}
function getUp(out, m) {
  out[0] = m[4];
  out[1] = m[5];
  out[2] = m[6];
  return normalize2(out, out);
}
function getRight(out, m) {
  out[0] = m[0];
  out[1] = m[1];
  out[2] = m[2];
  return normalize2(out, out);
}
function unproject(out, ndcPoint, invVP) {
  return transformVec32(out, invVP, ndcPoint);
}
function projectPoint(out, worldPos, viewProj) {
  return transformVec32(out, viewProj, worldPos);
}
function computeViewProj(out, eye, target, up2, fovYRadians, aspect, near, far) {
  const view = lookAt(create10(), eye, target, up2);
  const proj = perspective(create10(), fovYRadians, aspect, near, far);
  return multiply3(out, proj, view);
}

// src/noise.ts
var noise_exports = {};
__export(noise_exports, {
  perlin1d: () => perlin1d
});
var PERM = new Uint8Array([
  151,
  160,
  137,
  91,
  90,
  15,
  131,
  13,
  201,
  95,
  96,
  53,
  194,
  233,
  7,
  225,
  140,
  36,
  103,
  30,
  69,
  142,
  8,
  99,
  37,
  240,
  21,
  10,
  23,
  190,
  6,
  148,
  247,
  120,
  234,
  75,
  0,
  26,
  197,
  62,
  94,
  252,
  219,
  203,
  117,
  35,
  11,
  32,
  57,
  177,
  33,
  88,
  237,
  149,
  56,
  87,
  174,
  20,
  125,
  136,
  171,
  168,
  68,
  175,
  74,
  165,
  71,
  134,
  139,
  48,
  27,
  166,
  77,
  146,
  158,
  231,
  83,
  111,
  229,
  122,
  60,
  211,
  133,
  230,
  220,
  105,
  92,
  41,
  55,
  46,
  245,
  40,
  244,
  102,
  143,
  54,
  65,
  25,
  63,
  161,
  1,
  216,
  80,
  73,
  209,
  76,
  132,
  187,
  208,
  89,
  18,
  169,
  200,
  196,
  135,
  130,
  116,
  188,
  159,
  86,
  164,
  100,
  109,
  198,
  173,
  186,
  3,
  64,
  52,
  217,
  226,
  250,
  124,
  123,
  5,
  202,
  38,
  147,
  118,
  126,
  255,
  82,
  85,
  212,
  207,
  206,
  59,
  227,
  47,
  16,
  58,
  17,
  182,
  189,
  28,
  42,
  223,
  183,
  170,
  213,
  119,
  248,
  152,
  2,
  44,
  154,
  163,
  70,
  221,
  153,
  101,
  155,
  167,
  43,
  172,
  9,
  129,
  22,
  39,
  253,
  19,
  98,
  108,
  110,
  79,
  113,
  224,
  232,
  178,
  185,
  112,
  104,
  218,
  246,
  97,
  228,
  251,
  34,
  242,
  193,
  238,
  210,
  144,
  12,
  191,
  179,
  162,
  241,
  81,
  51,
  145,
  235,
  249,
  14,
  239,
  107,
  49,
  192,
  214,
  31,
  181,
  199,
  106,
  157,
  184,
  84,
  204,
  176,
  115,
  121,
  50,
  45,
  127,
  4,
  150,
  254,
  138,
  236,
  205,
  93,
  222,
  114,
  67,
  29,
  24,
  72,
  243,
  141,
  128,
  195,
  78,
  66,
  215,
  61,
  156,
  180
]);
function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function dotGrad(hash, xf) {
  return hash & 1 ? xf : -xf;
}
function perlin1d(x) {
  const xFloor = Math.floor(x);
  const xi0 = xFloor & 255;
  const xi1 = xFloor + 1 & 255;
  const xf0 = x - xFloor;
  const xf1 = xf0 - 1;
  const t = fade(xf0);
  const h0 = PERM[xi0] ?? 0;
  const h1 = PERM[xi1] ?? 0;
  const a = dotGrad(h0, xf0);
  const b = dotGrad(h1, xf1);
  return a + t * (b - a);
}

// src/ray.ts
var ray_exports = {};
__export(ray_exports, {
  create: () => create11,
  getDirection: () => getDirection,
  getOrigin: () => getOrigin,
  rayAabbIntersects: () => rayAabbIntersects,
  rayTriangleIntersects: () => rayTriangleIntersects,
  screenToRay: () => screenToRay,
  setDirection: () => setDirection,
  setOrigin: () => setOrigin,
  worldToScreen: () => worldToScreen
});
function create11(out, origin, direction) {
  const r = out ?? new Float32Array(6);
  if (origin) {
    r[0] = origin[0];
    r[1] = origin[1];
    r[2] = origin[2];
  } else {
    r[0] = 0;
    r[1] = 0;
    r[2] = 0;
  }
  if (direction) {
    const dx = direction[0];
    const dy = direction[1];
    const dz = direction[2];
    const lenSq = dx * dx + dy * dy + dz * dz;
    if (lenSq < 1e-12) {
      r[3] = 0;
      r[4] = 0;
      r[5] = 0;
    } else {
      const inv = 1 / Math.sqrt(lenSq);
      r[3] = dx * inv;
      r[4] = dy * inv;
      r[5] = dz * inv;
    }
  } else {
    r[3] = 0;
    r[4] = 0;
    r[5] = -1;
  }
  return r;
}
function getOrigin(out, r) {
  out[0] = r[0];
  out[1] = r[1];
  out[2] = r[2];
  return out;
}
function getDirection(out, r) {
  out[0] = r[3];
  out[1] = r[4];
  out[2] = r[5];
  return out;
}
function setOrigin(r, o) {
  r[0] = o[0];
  r[1] = o[1];
  r[2] = o[2];
  return r;
}
function setDirection(r, d) {
  const dx = d[0];
  const dy = d[1];
  const dz = d[2];
  const lenSq = dx * dx + dy * dy + dz * dz;
  if (lenSq < 1e-12) {
    r[3] = 0;
    r[4] = 0;
    r[5] = 0;
  } else {
    const inv = 1 / Math.sqrt(lenSq);
    r[3] = dx * inv;
    r[4] = dy * inv;
    r[5] = dz * inv;
  }
  return r;
}
function rayAabbIntersects(r, aabb) {
  const ox = r[0];
  const oy = r[1];
  const oz = r[2];
  const dx = r[3];
  const dy = r[4];
  const dz = r[5];
  const minX = aabb[0];
  const minY = aabb[1];
  const minZ = aabb[2];
  const maxX = aabb[3];
  const maxY = aabb[4];
  const maxZ = aabb[5];
  const invX = 1 / dx;
  const invY = 1 / dy;
  const invZ = 1 / dz;
  let t1x = (minX - ox) * invX;
  let t2x = (maxX - ox) * invX;
  if (invX < 0) {
    const tmp = t1x;
    t1x = t2x;
    t2x = tmp;
  }
  let tnear = Number.isNaN(t1x) ? -Infinity : t1x;
  let tfar = Number.isNaN(t2x) ? Infinity : t2x;
  let t1y = (minY - oy) * invY;
  let t2y = (maxY - oy) * invY;
  if (invY < 0) {
    const tmp = t1y;
    t1y = t2y;
    t2y = tmp;
  }
  if (!Number.isNaN(t1y) && t1y > tnear) tnear = t1y;
  if (!Number.isNaN(t2y) && t2y < tfar) tfar = t2y;
  if (tnear > tfar) return { hit: false, tmin: 0 };
  let t1z = (minZ - oz) * invZ;
  let t2z = (maxZ - oz) * invZ;
  if (invZ < 0) {
    const tmp = t1z;
    t1z = t2z;
    t2z = tmp;
  }
  if (!Number.isNaN(t1z) && t1z > tnear) tnear = t1z;
  if (!Number.isNaN(t2z) && t2z < tfar) tfar = t2z;
  if (tfar >= 0 && tfar >= tnear) {
    return { hit: true, tmin: tnear > 0 ? tnear : 0 };
  }
  return { hit: false, tmin: 0 };
}
var _nearNdC = new Float32Array(3);
var _farNdC = new Float32Array(3);
var _nearWorld = new Float32Array(3);
var _farWorld = new Float32Array(3);
var _tmpInvVP = new Float32Array(16);
function screenToRay(out, screenX, screenY, vpWidth, vpHeight, view, proj, _kind) {
  if (!Number.isFinite(screenX) || !Number.isFinite(screenY) || !Number.isFinite(vpWidth) || !Number.isFinite(vpHeight) || vpWidth <= 0 || vpHeight <= 0) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -1;
    return out;
  }
  const sx = screenX < 0 ? 0 : screenX > vpWidth ? vpWidth : screenX;
  const sy = screenY < 0 ? 0 : screenY > vpHeight ? vpHeight : screenY;
  const ndcX = 2 * sx / vpWidth - 1;
  const ndcY = 1 - 2 * sy / vpHeight;
  multiply3(_tmpInvVP, proj, view);
  invert3(_tmpInvVP, _tmpInvVP);
  _nearNdC[0] = ndcX;
  _nearNdC[1] = ndcY;
  _nearNdC[2] = 0;
  _farNdC[0] = ndcX;
  _farNdC[1] = ndcY;
  _farNdC[2] = 1;
  unproject(_nearWorld, _nearNdC, _tmpInvVP);
  unproject(_farWorld, _farNdC, _tmpInvVP);
  out[0] = _nearWorld[0];
  out[1] = _nearWorld[1];
  out[2] = _nearWorld[2];
  const dx = _farWorld[0] - _nearWorld[0];
  const dy = _farWorld[1] - _nearWorld[1];
  const dz = _farWorld[2] - _nearWorld[2];
  const lenSq = dx * dx + dy * dy + dz * dz;
  if (lenSq < 1e-12) {
    out[3] = 0;
    out[4] = 0;
    out[5] = -1;
  } else {
    const inv = 1 / Math.sqrt(lenSq);
    out[3] = dx * inv;
    out[4] = dy * inv;
    out[5] = dz * inv;
  }
  return out;
}
function worldToScreen(out, worldPos, viewProj, canvasW, canvasH) {
  if (!(canvasW > 0) || !(canvasH > 0)) {
    return { onScreen: false, behind: false };
  }
  const x = worldPos[0];
  const y = worldPos[1];
  const z = worldPos[2];
  const clipX = viewProj[0] * x + viewProj[4] * y + viewProj[8] * z + viewProj[12];
  const clipY = viewProj[1] * x + viewProj[5] * y + viewProj[9] * z + viewProj[13];
  const clipZ = viewProj[2] * x + viewProj[6] * y + viewProj[10] * z + viewProj[14];
  const clipW = viewProj[3] * x + viewProj[7] * y + viewProj[11] * z + viewProj[15];
  if (clipW < 0) {
    return { onScreen: false, behind: true };
  }
  const invW = 1 / clipW;
  const ndcX = clipX * invW;
  const ndcY = clipY * invW;
  const ndcZ = clipZ * invW;
  out[0] = (ndcX * 0.5 + 0.5) * canvasW;
  out[1] = (1 - (ndcY * 0.5 + 0.5)) * canvasH;
  const onScreen = ndcX >= -1 && ndcX <= 1 && ndcY >= -1 && ndcY <= 1 && ndcZ >= 0 && ndcZ <= 1;
  return { onScreen, behind: false };
}
var RAY_TRI_EPSILON = 1e-8;
function rayTriangleIntersects(r, a, b, c) {
  if (Number.isNaN(r[0]) || Number.isNaN(r[1]) || Number.isNaN(r[2]) || Number.isNaN(r[3]) || Number.isNaN(r[4]) || Number.isNaN(r[5]) || Number.isNaN(a[0]) || Number.isNaN(a[1]) || Number.isNaN(a[2]) || Number.isNaN(b[0]) || Number.isNaN(b[1]) || Number.isNaN(b[2]) || Number.isNaN(c[0]) || Number.isNaN(c[1]) || Number.isNaN(c[2])) {
    return { hit: false, t: 0, u: 0, v: 0 };
  }
  const ox = r[0];
  const oy = r[1];
  const oz = r[2];
  const dx = r[3];
  const dy = r[4];
  const dz = r[5];
  const e1x = b[0] - a[0];
  const e1y = b[1] - a[1];
  const e1z = b[2] - a[2];
  const e2x = c[0] - a[0];
  const e2y = c[1] - a[1];
  const e2z = c[2] - a[2];
  const px = dy * e2z - dz * e2y;
  const py = dz * e2x - dx * e2z;
  const pz = dx * e2y - dy * e2x;
  const det = e1x * px + e1y * py + e1z * pz;
  if (Math.abs(det) < RAY_TRI_EPSILON) {
    return { hit: false, t: 0, u: 0, v: 0 };
  }
  const invDet = 1 / det;
  const tx = ox - a[0];
  const ty = oy - a[1];
  const tz = oz - a[2];
  const u = (tx * px + ty * py + tz * pz) * invDet;
  if (u < 0 || u > 1) {
    return { hit: false, t: 0, u, v: 0 };
  }
  const qx = ty * e1z - tz * e1y;
  const qy = tz * e1x - tx * e1z;
  const qz = tx * e1y - ty * e1x;
  const v = (dx * qx + dy * qy + dz * qz) * invDet;
  if (v < 0 || u + v > 1) {
    return { hit: false, t: 0, u, v };
  }
  const t = (e2x * qx + e2y * qy + e2z * qz) * invDet;
  if (t <= 0) {
    return { hit: false, t, u, v };
  }
  return { hit: true, t, u, v };
}

// src/ray2.ts
var ray2_exports = {};
__export(ray2_exports, {
  aabbCastIntersects: () => aabbCastIntersects,
  circleCastIntersects: () => circleCastIntersects,
  create: () => create12,
  getDirection: () => getDirection2,
  getMaxDistance: () => getMaxDistance,
  getOrigin: () => getOrigin2,
  rayAabbIntersects: () => rayAabbIntersects2,
  rayCircleIntersects: () => rayCircleIntersects,
  setDirection: () => setDirection2,
  setMaxDistance: () => setMaxDistance,
  setOrigin: () => setOrigin2
});
function create12(out, origin, direction, maxDistance = Number.POSITIVE_INFINITY) {
  const ray = out ?? new Float32Array(5);
  ray[0] = origin ? origin[0] : 0;
  ray[1] = origin ? origin[1] : 0;
  const dx = direction ? direction[0] : 0;
  const dy = direction ? direction[1] : 1;
  const lengthSq6 = dx * dx + dy * dy;
  if (lengthSq6 < 1e-12) {
    ray[2] = 0;
    ray[3] = 0;
  } else {
    const invLength = 1 / Math.sqrt(lengthSq6);
    ray[2] = dx * invLength;
    ray[3] = dy * invLength;
  }
  ray[4] = maxDistance < 0 ? 0 : maxDistance;
  return ray;
}
function getOrigin2(out, ray) {
  out[0] = ray[0];
  out[1] = ray[1];
  return out;
}
function getDirection2(out, ray) {
  out[0] = ray[2];
  out[1] = ray[3];
  return out;
}
function getMaxDistance(ray) {
  return ray[4];
}
function setOrigin2(ray, origin) {
  ray[0] = origin[0];
  ray[1] = origin[1];
  return ray;
}
function setDirection2(ray, direction) {
  const dx = direction[0];
  const dy = direction[1];
  const lengthSq6 = dx * dx + dy * dy;
  if (lengthSq6 < 1e-12) {
    ray[2] = 0;
    ray[3] = 0;
  } else {
    const invLength = 1 / Math.sqrt(lengthSq6);
    ray[2] = dx * invLength;
    ray[3] = dy * invLength;
  }
  return ray;
}
function setMaxDistance(ray, maxDistance) {
  ray[4] = maxDistance < 0 ? 0 : maxDistance;
  return ray;
}
function rayAabbIntersects2(ray, box) {
  return rayAabbValues(ray, box[0], box[1], box[2], box[3]);
}
function rayCircleIntersects(ray, circle) {
  return rayCircleValues(ray, circle[0], circle[1], circle[2]);
}
function aabbCastIntersects(ray, moving, target) {
  return rayAabbValues(
    ray,
    target[0] - moving[2],
    target[1] - moving[3],
    target[2] - moving[0],
    target[3] - moving[1]
  );
}
function circleCastIntersects(ray, moving, target) {
  return rayCircleValues(
    ray,
    target[0] - moving[0],
    target[1] - moving[1],
    target[2] + moving[2]
  );
}
function rayAabbValues(ray, minX, minY, maxX, maxY) {
  const ox = ray[0];
  const oy = ray[1];
  const dx = ray[2];
  const dy = ray[3];
  let near = 0;
  let far = ray[4];
  if (minX > maxX || minY > maxY || far < 0) return miss();
  if (Math.abs(dx) < 1e-12) {
    if (ox < minX || ox > maxX) return miss();
  } else {
    let a = (minX - ox) / dx;
    let b = (maxX - ox) / dx;
    if (a > b) [a, b] = [b, a];
    if (a > near) near = a;
    if (b < far) far = b;
  }
  if (Math.abs(dy) < 1e-12) {
    if (oy < minY || oy > maxY) return miss();
  } else {
    let a = (minY - oy) / dy;
    let b = (maxY - oy) / dy;
    if (a > b) [a, b] = [b, a];
    if (a > near) near = a;
    if (b < far) far = b;
  }
  return near <= far && far >= 0 ? { hit: true, t: near } : miss();
}
function rayCircleValues(ray, cx, cy, radius2) {
  const ox = ray[0] - cx;
  const oy = ray[1] - cy;
  const dx = ray[2];
  const dy = ray[3];
  const maxDistance = ray[4];
  if (radius2 < 0 || maxDistance < 0) return miss();
  const directionLengthSq = dx * dx + dy * dy;
  const radiusSq = radius2 * radius2;
  const originDistanceSq = ox * ox + oy * oy;
  if (originDistanceSq <= radiusSq) return maxDistance >= 0 ? { hit: true, t: 0 } : miss();
  if (directionLengthSq < 1e-12) return miss();
  const projected = ox * dx + oy * dy;
  const constant = originDistanceSq - radiusSq;
  const discriminant = projected * projected - directionLengthSq * constant;
  if (discriminant < 0) return miss();
  const entry = (-projected - Math.sqrt(discriminant)) / directionLengthSq;
  const t = entry < 0 ? 0 : entry;
  return t <= maxDistance ? { hit: true, t } : miss();
}
function miss() {
  return { hit: false, t: 0 };
}

// src/sphere.ts
var sphere_exports = {};
__export(sphere_exports, {
  containsPoint: () => containsPoint4,
  create: () => create13,
  expandByPoint: () => expandByPoint2,
  fromPoints: () => fromPoints4,
  intersectsBox: () => intersectsBox5
});
function create13(cx = 0, cy = 0, cz = 0, radius2 = 0) {
  return Float32Array.of(cx, cy, cz, radius2);
}
function expandByPoint2(out, point) {
  const r = out[3];
  const px = point[0];
  const py = point[1];
  const pz = point[2];
  if (r < 0) {
    out[0] = px;
    out[1] = py;
    out[2] = pz;
    out[3] = 0;
    return out;
  }
  const dx = px - out[0];
  const dy = py - out[1];
  const dz = pz - out[2];
  const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (d > r) out[3] = d;
  return out;
}
function containsPoint4(s, point) {
  const r = s[3];
  if (r < 0) return false;
  const dx = point[0] - s[0];
  const dy = point[1] - s[1];
  const dz = point[2] - s[2];
  return dx * dx + dy * dy + dz * dz <= r * r;
}
function intersectsBox5(s, b) {
  const r = s[3];
  if (r < 0) return false;
  const cx = s[0];
  const cy = s[1];
  const cz = s[2];
  const minX = b[0];
  const minY = b[1];
  const minZ = b[2];
  const maxX = b[3];
  const maxY = b[4];
  const maxZ = b[5];
  const qx = cx < minX ? minX : cx > maxX ? maxX : cx;
  const qy = cy < minY ? minY : cy > maxY ? maxY : cy;
  const qz = cz < minZ ? minZ : cz > maxZ ? maxZ : cz;
  const dx = cx - qx;
  const dy = cy - qy;
  const dz = cz - qz;
  return dx * dx + dy * dy + dz * dz <= r * r;
}
function fromPoints4(out, points) {
  if (points.length === 0) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = -1;
    return out;
  }
  const aabb = create2();
  for (let i = 0; i < points.length; i++) {
    expandByPoint(aabb, points[i]);
  }
  const cx = (aabb[0] + aabb[3]) * 0.5;
  const cy = (aabb[1] + aabb[4]) * 0.5;
  const cz = (aabb[2] + aabb[5]) * 0.5;
  let rSq = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const dx = p[0] - cx;
    const dy = p[1] - cy;
    const dz = p[2] - cz;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 > rSq) rSq = d2;
  }
  out[0] = cx;
  out[1] = cy;
  out[2] = cz;
  out[3] = Math.sqrt(rSq);
  return out;
}

// src/vec2.ts
var vec2_exports = {};
__export(vec2_exports, {
  add: () => add2,
  catmullRom: () => catmullRom2,
  clone: () => clone7,
  copy: () => copy2,
  create: () => create14,
  distance: () => distance2,
  dot: () => dot3,
  equals: () => equals4,
  length: () => length3,
  lengthSq: () => lengthSq3,
  lerp: () => lerp3,
  max: () => max2,
  min: () => min2,
  negate: () => negate2,
  normalize: () => normalize3,
  perp: () => perp,
  scale: () => scale4,
  set: () => set3,
  smoothDamp: () => smoothDamp2,
  sub: () => sub2
});
function create14(x = 0, y = 0) {
  return Float32Array.of(x, y);
}
function clone7(a) {
  return Float32Array.of(a[0], a[1]);
}
function copy2(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
function set3(out, x, y) {
  out[0] = x;
  out[1] = y;
  return out;
}
function equals4(a, b, epsilon = 1e-6) {
  const ax = a[0];
  const ay = a[1];
  const bx = b[0];
  const by = b[1];
  if (Number.isNaN(ax) || Number.isNaN(ay) || Number.isNaN(bx) || Number.isNaN(by)) return false;
  return Math.abs(ax - bx) <= epsilon && Math.abs(ay - by) <= epsilon;
}
function add2(out, a, b) {
  const ax = a[0];
  const ay = a[1];
  const bx = b[0];
  const by = b[1];
  out[0] = ax + bx;
  out[1] = ay + by;
  return out;
}
function sub2(out, a, b) {
  const ax = a[0];
  const ay = a[1];
  const bx = b[0];
  const by = b[1];
  out[0] = ax - bx;
  out[1] = ay - by;
  return out;
}
function scale4(out, a, s) {
  out[0] = a[0] * s;
  out[1] = a[1] * s;
  return out;
}
function negate2(out, a) {
  out[0] = 0 - a[0];
  out[1] = 0 - a[1];
  return out;
}
function dot3(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
function lengthSq3(a) {
  const x = a[0];
  const y = a[1];
  return x * x + y * y;
}
function length3(a) {
  const x = a[0];
  const y = a[1];
  return Math.sqrt(x * x + y * y);
}
function distance2(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}
function normalize3(out, a) {
  const x = a[0];
  const y = a[1];
  const lenSq = x * x + y * y;
  if (lenSq < EPS_NORMALIZE) {
    out[0] = 0;
    out[1] = 0;
    return out;
  }
  const inv = 1 / Math.sqrt(lenSq);
  out[0] = x * inv;
  out[1] = y * inv;
  return out;
}
function lerp3(out, a, b, t) {
  const ax = a[0];
  const ay = a[1];
  const bx = b[0];
  const by = b[1];
  out[0] = lerp(ax, bx, t);
  out[1] = lerp(ay, by, t);
  return out;
}
function smoothDamp2(out, current, target, decayRate, dt) {
  return lerp3(out, current, target, smoothDecayFactor(decayRate, dt));
}
function catmullRom2(out, p0, p1, p2, p3, t) {
  const x = catmullRomScalar(p0[0], p1[0], p2[0], p3[0], t);
  const y = catmullRomScalar(p0[1], p1[1], p2[1], p3[1], t);
  out[0] = x;
  out[1] = y;
  return out;
}
function min2(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  return out;
}
function max2(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  return out;
}
function perp(out, a) {
  const x = a[0];
  const y = a[1];
  out[0] = 0 - y;
  out[1] = x;
  return out;
}

// src/vec4.ts
var vec4_exports = {};
__export(vec4_exports, {
  add: () => add3,
  clone: () => clone8,
  copy: () => copy3,
  create: () => create15,
  distance: () => distance3,
  dot: () => dot4,
  equals: () => equals5,
  length: () => length4,
  lengthSq: () => lengthSq5,
  lerp: () => lerp4,
  max: () => max3,
  min: () => min3,
  negate: () => negate3,
  normalize: () => normalize5,
  scale: () => scale5,
  set: () => set4,
  smoothDamp: () => smoothDamp3,
  sub: () => sub3
});
function create15(x = 0, y = 0, z = 0, w = 0) {
  return Float32Array.of(x, y, z, w);
}
function clone8(a) {
  return Float32Array.of(a[0], a[1], a[2], a[3]);
}
function copy3(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
function set4(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function equals5(a, b, epsilon = 1e-6) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const aw = a[3];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];
  const bw = b[3];
  if (Number.isNaN(ax) || Number.isNaN(ay) || Number.isNaN(az) || Number.isNaN(aw) || Number.isNaN(bx) || Number.isNaN(by) || Number.isNaN(bz) || Number.isNaN(bw)) {
    return false;
  }
  return Math.abs(ax - bx) <= epsilon && Math.abs(ay - by) <= epsilon && Math.abs(az - bz) <= epsilon && Math.abs(aw - bw) <= epsilon;
}
function add3(out, a, b) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const aw = a[3];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];
  const bw = b[3];
  out[0] = ax + bx;
  out[1] = ay + by;
  out[2] = az + bz;
  out[3] = aw + bw;
  return out;
}
function sub3(out, a, b) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const aw = a[3];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];
  const bw = b[3];
  out[0] = ax - bx;
  out[1] = ay - by;
  out[2] = az - bz;
  out[3] = aw - bw;
  return out;
}
function scale5(out, a, s) {
  out[0] = a[0] * s;
  out[1] = a[1] * s;
  out[2] = a[2] * s;
  out[3] = a[3] * s;
  return out;
}
function negate3(out, a) {
  out[0] = 0 - a[0];
  out[1] = 0 - a[1];
  out[2] = 0 - a[2];
  out[3] = 0 - a[3];
  return out;
}
function dot4(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
function lengthSq5(a) {
  return lengthSq4(a);
}
function length4(a) {
  return Math.sqrt(lengthSq4(a));
}
function distance3(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  const dw = a[3] - b[3];
  return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
}
function normalize5(out, a) {
  normalize4(out, a, EPS_NORMALIZE);
  return out;
}
function lerp4(out, a, b, t) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const aw = a[3];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];
  const bw = b[3];
  out[0] = lerp(ax, bx, t);
  out[1] = lerp(ay, by, t);
  out[2] = lerp(az, bz, t);
  out[3] = lerp(aw, bw, t);
  return out;
}
function smoothDamp3(out, current, target, decayRate, dt) {
  return lerp4(out, current, target, smoothDecayFactor(decayRate, dt));
}
function min3(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  out[3] = Math.min(a[3], b[3]);
  return out;
}
function max3(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  out[3] = Math.max(a[3], b[3]);
  return out;
}

export { box2_exports as box2, box3_exports as box3, circle2_exports as circle2, color_exports as color, easing_exports as easing, euler_exports as euler, frustum_exports as frustum, f32_to_f16_bytes_exports as halfFloat, mat3_exports as mat3, mat4_exports as mat4, noise_exports as noise, quat_exports as quat, ray_exports as ray, ray2_exports as ray2, sphere_exports as sphere, vec2_exports as vec2, vec3_exports as vec3, vec4_exports as vec4 };
