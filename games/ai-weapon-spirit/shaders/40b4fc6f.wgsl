// Resolution-aware ink contours in the existing ForgeAX fullscreen feature.
// The slider is a reference radius at a 900-pixel short edge. Texture dimensions
// own scaling, including native render scale, DPR and embedded previews.

struct FullscreenOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) uv : vec2<f32>,
};

struct ReadabilityParams {
  // near, far, absolute threshold in metres, depth-relative threshold
  depth : vec4<f32>,
  // display-space edge colour and maximum coverage
  edge : vec4<f32>,
  // split position, reference radius, response span, optical swell bound
  caseStyle : vec4<f32>,
  viewProjection : mat4x4<f32>,
  inverseViewProjection : mat4x4<f32>,
  // Camera and reconstructed positions share an XZ-relative world frame.
  // World Y stays absolute, so water/shore tests and ray metres are unchanged.
  eye : vec4<f32>,
  // optical plane height, strength, maximum ray metres, sample budget
  water : vec4<f32>,
};

@group(1) @binding(0) var sceneTexture : texture_2d<f32>;
@group(1) @binding(1) var sceneSampler : sampler;
@group(1) @binding(2) var<uniform> p : ReadabilityParams;
@group(1) @binding(3) var depthTexture : texture_depth_2d;
@group(1) @binding(4) var depthSampler : sampler;

@vertex
fn vs_main(@builtin(vertex_index) index : u32) -> FullscreenOutput {
  var x = -1.0;
  var y = -1.0;
  if (index == 1u) { x = 3.0; }
  if (index == 2u) { y = 3.0; }
  var out : FullscreenOutput;
  out.position = vec4<f32>(x, y, 0.0, 1.0);
  out.uv = vec2<f32>((x + 1.0) * 0.5, 1.0 - (y + 1.0) * 0.5);
  return out;
}

fn linearDepth(ndcDepth : f32) -> f32 {
  let nearPlane = p.depth.x;
  let farPlane = p.depth.y;
  return nearPlane * farPlane
    / max(0.00001, farPlane - ndcDepth * (farPlane - nearPlane));
}

fn sceneDepth(pixel : vec2<i32>) -> f32 {
  return textureLoad(depthTexture, pixel, 0);
}

fn sampleLinearDepth(pixel : vec2<i32>, dimensions : vec2<i32>) -> f32 {
  let safePixel = clamp(pixel, vec2<i32>(0), dimensions - vec2<i32>(1));
  let ndcDepth = sceneDepth(safePixel);
  return linearDepth(ndcDepth);
}

// A bounded, orientation-independent scale. The floor preserves a substantial
// stroke on small screens; the ceiling avoids covering small assets on 4K.
fn inkResolutionScale(dimensions : vec2<i32>) -> f32 {
  return clamp(f32(min(dimensions.x, dimensions.y)) / 900.0, 0.625, 2.0);
}

fn inkHash(cell : vec2<f32>) -> f32 {
  var q = fract(vec3<f32>(cell.x, cell.y, cell.x) * 0.1031);
  q += vec3<f32>(dot(q, q.yzx + vec3<f32>(33.33)));
  return fract((q.x + q.y) * q.z);
}

// Fixed paper coordinates, never a per-frame random value. Smooth interpolation
// keeps the dry-brush grain from flickering as an edge crosses the paper.
fn inkGrain(point : vec2<f32>) -> f32 {
  let cell = floor(point);
  let fraction = fract(point);
  let weight = fraction * fraction * (vec2<f32>(3.0) - 2.0 * fraction);
  return mix(
    mix(inkHash(cell), inkHash(cell + vec2<f32>(1.0, 0.0)), weight.x),
    mix(inkHash(cell + vec2<f32>(0.0, 1.0)), inkHash(cell + vec2<f32>(1.0)), weight.x),
    weight.y,
  );
}

fn surfaceDepthSlope(pixel : vec2<i32>, dimensions : vec2<i32>, center : f32) -> vec2<f32> {
  let reciprocal = 1.0 / center;
  let backward = vec2<f32>(
    reciprocal - 1.0 / sampleLinearDepth(pixel - vec2<i32>(1, 0), dimensions),
    reciprocal - 1.0 / sampleLinearDepth(pixel - vec2<i32>(0, 1), dimensions),
  );
  let forward = vec2<f32>(
    1.0 / sampleLinearDepth(pixel + vec2<i32>(1, 0), dimensions) - reciprocal,
    1.0 / sampleLinearDepth(pixel + vec2<i32>(0, 1), dimensions) - reciprocal,
  );
  // Inverse view depth is affine across a perspective-projected plane. Choose
  // the continuous side of each axis instead of differentiating across a ledge.
  var slope = select(forward, backward, abs(backward) < abs(forward));
  slope = select(slope, forward, pixel == vec2<i32>(0));
  slope = select(slope, backward, pixel == dimensions - vec2<i32>(1));
  return clamp(slope,
    vec2<f32>(-reciprocal * 0.05), vec2<f32>(reciprocal * 0.05));
}

fn discontinuity(pixel : vec2<i32>, offset : vec2<i32>, dimensions : vec2<i32>,
  center : f32, slope : vec2<f32>) -> f32 {
  let samplePixel = clamp(pixel + offset, vec2<i32>(0), dimensions - vec2<i32>(1));
  let measured = sampleLinearDepth(samplePixel, dimensions);
  let predicted = 1.0 / max(1.0 / p.depth.y,
    1.0 / center + dot(slope, vec2<f32>(samplePixel - pixel)));
  // Reject ordinary depth growth along the same ground plane and keep ink
  // strictly on the nearer surface. A wide sample must not turn a slope black.
  return max(0.0, min(measured - center, measured - predicted));
}

fn crossDiscontinuity(pixel : vec2<i32>, radius : i32, dimensions : vec2<i32>,
  center : f32, slope : vec2<f32>) -> f32 {
  let left = discontinuity(pixel, vec2<i32>(-radius, 0), dimensions, center, slope);
  let right = discontinuity(pixel, vec2<i32>(radius, 0), dimensions, center, slope);
  let up = discontinuity(pixel, vec2<i32>(0, -radius), dimensions, center, slope);
  let down = discontinuity(pixel, vec2<i32>(0, radius), dimensions, center, slope);
  return max(max(left, right), max(up, down));
}

fn worldAt(uv : vec2<f32>, depth : f32) -> vec3<f32> {
  let world = p.inverseViewProjection * vec4<f32>(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, depth, 1.0);
  return world.xyz / world.w;
}

// A water-only screen-space ray. Reads the renderer-owned scene snapshot;
// never samples our output, allocates history, or renders another camera.
fn waterReflection(scene : vec3<f32>, uv : vec2<f32>, rawDepth : f32,
  dimensions : vec2<i32>, surfaceNormal : vec3<f32>) -> vec3<f32> {
  if (p.water.y <= 0.0) { return scene; }
  let measured = worldAt(uv, rawDepth);
  // The native transparent surface writes its displaced optical depth. The
  // bound includes the Pack's maximum swell and MSAA reconstruction tolerance;
  // dry terrain starts above this band, while the real bed is below it.
  if (abs(measured.y - p.water.x) > p.caseStyle.w || p.eye.y <= measured.y) { return scene; }
  let origin = measured;
  let incident = normalize(origin - p.eye.xyz);
  let normal = surfaceNormal * select(-1.0, 1.0, surfaceNormal.y >= 0.0);
  if (normal.y < .75) { return scene; }
  let direction = reflect(incident, normal);
  let start = origin + vec3<f32>(0.0, .025, 0.0);
  var previousDistance = .035;
  let count = u32(p.water.w);
  for (var i = 0u; i < 40u; i += 1u) {
    if (i >= count) { break; }
    let fraction = f32(i + 1u) / f32(count);
    let distance = .035 + p.water.z * fraction * fraction;
    let point = start + direction * distance;
    let clip = p.viewProjection * vec4<f32>(point, 1.0);
    if (clip.w <= 0.0) { break; }
    let projected = vec2<f32>(clip.x / clip.w * .5 + .5, .5 - clip.y / clip.w * .5);
    if (any(projected <= vec2<f32>(.003)) || any(projected >= vec2<f32>(.997))) { break; }
    let pixel = clamp(vec2<i32>(projected * vec2<f32>(dimensions)), vec2<i32>(0), dimensions - vec2<i32>(1));
    let depth = sceneDepth(pixel);
    let sampleUV = (vec2<f32>(pixel) + .5) / vec2<f32>(dimensions);
    let sampleWorld = worldAt(sampleUV, depth);
    // A neighbouring wave is not the object being reflected. Continuing here
    // also avoids self-reflection when the origin lies in a trough.
    if (depth < .999999 && sampleWorld.y > p.water.x + p.caseStyle.w && clip.w >= linearDepth(depth)) {
      var low = previousDistance;
      var high = distance;
      var hitUV = projected;
      var hitDepth = depth;
      var hitDistance = clip.w;
      // Refine a crossing, then reject unrelated foreground silhouettes.
      for (var refine = 0u; refine < 5u; refine += 1u) {
        let mid = (low + high) * .5;
        let midClip = p.viewProjection * vec4<f32>(start + direction * mid, 1.0);
        let midUV = vec2<f32>(midClip.x / midClip.w * .5 + .5, .5 - midClip.y / midClip.w * .5);
        let midPixel = clamp(vec2<i32>(midUV * vec2<f32>(dimensions)), vec2<i32>(0), dimensions - vec2<i32>(1));
        let midDepth = sceneDepth(midPixel);
        if (midClip.w >= linearDepth(midDepth)) {
          high = mid; hitUV = midUV; hitDepth = midDepth; hitDistance = midClip.w;
        } else { low = mid; }
      }
      let separation = hitDistance - linearDepth(hitDepth);
      let hitWorld = worldAt(hitUV, hitDepth);
      if (separation >= 0.0 && separation < .35 && hitWorld.y > p.water.x + p.caseStyle.w) {
        let edge = min(min(hitUV.x, 1.0 - hitUV.x), min(hitUV.y, 1.0 - hitUV.y));
        let confidence = smoothstep(.015, .08, edge) * (1.0 - smoothstep(p.water.z * .7, p.water.z, high));
        let fresnel = .55 + .45 * pow(1.0 - clamp(dot(-incident, normal), 0.0, 1.0), 5.0);
        let reflected = textureSampleLevel(sceneTexture, sceneSampler, hitUV, 0.0).rgb;
        return mix(scene, reflected * .88 + scene * .12, p.water.y * confidence * fresnel);
      }
      // Only one refinement per ray: at most budget + 5 depth queries.
      return scene;
    }
    previousDistance = distance;
  }
  return scene;
}

@fragment
fn fs_main(in : FullscreenOutput) -> @location(0) vec4<f32> {
  var scene = textureSample(sceneTexture, sceneSampler, in.uv).rgb;
  let dimensionsU = textureDimensions(depthTexture);
  let dimensions = vec2<i32>(dimensionsU);
  let centerPixel = clamp(
    vec2<i32>(in.uv * vec2<f32>(dimensionsU)),
    vec2<i32>(0),
    dimensions - vec2<i32>(1),
  );
  let rawCenter = sceneDepth(centerPixel);
  let world = worldAt(in.uv, rawCenter);
  // Derivatives run uniformly before any branch. Reflect the actual moving
  // optical mesh rather than introducing an unrelated second wave pattern.
  let surfaceNormal = normalize(cross(dpdx(world), dpdy(world)));
  if (in.uv.x < p.caseStyle.x) {
    return vec4<f32>(scene, 1.0);
  }
  if (rawCenter >= 0.999999) {
    return vec4<f32>(scene, 1.0);
  }
  scene = waterReflection(scene, in.uv, rawCenter, dimensions, surfaceNormal);
  if (p.caseStyle.y < 0.5 || p.edge.a <= 0.0) { return vec4<f32>(scene, 1.0); }

  let scale = inkResolutionScale(dimensions);
  let center = linearDepth(rawCenter);
  let distanceFade = smoothstep(24.0, 70.0, center);
  let radius = max(1, i32(round(p.caseStyle.y * scale * mix(1.0, 0.48, distanceFade))));
  let coreRadius = max(1, i32(round(f32(radius) * 0.76)));
  let slope = surfaceDepthSlope(centerPixel, dimensions, center);
  let diagonal = max(1, i32(round(f32(radius) * 0.707107)));
  let diagonalA = discontinuity(centerPixel, vec2<i32>(diagonal, diagonal), dimensions, center, slope);
  let diagonalB = discontinuity(centerPixel, vec2<i32>(diagonal, -diagonal), dimensions, center, slope);
  let diagonalC = discontinuity(centerPixel, vec2<i32>(-diagonal, diagonal), dimensions, center, slope);
  let diagonalD = discontinuity(centerPixel, vec2<i32>(-diagonal, -diagonal), dimensions, center, slope);
  let outerGap = max(crossDiscontinuity(centerPixel, radius, dimensions, center, slope),
    max(max(diagonalA, diagonalB), max(diagonalC, diagonalD)));
  let threshold = p.depth.z + center * p.depth.w;
  let responseEnd = threshold * max(1.05, p.caseStyle.z);
  let outer = smoothstep(threshold, responseEnd, outerGap);
  if (outer <= 0.0) { return vec4<f32>(scene, 1.0); }

  // Eight outer taps keep diagonals substantial. Four inner taps retain a solid
  // ink core; only its outer rim is diluted. All ink stays on the near surface,
  // so silhouettes do not gain a floating background halo.
  let coreGap = crossDiscontinuity(centerPixel, coreRadius, dimensions, center, slope);
  let core = smoothstep(threshold, responseEnd, coreGap);
  let paper = vec2<f32>(centerPixel) / scale;
  let wetness = inkGrain(paper / 18.0);
  let fibres = inkGrain(vec2<f32>(paper.x + paper.y * 0.24, paper.y * 1.8) / 3.0);
  let rim = outer * mix(0.60, 0.78, fibres);
  let density = mix(0.92, 1.0, wetness);
  let coverage = max(core, rim) * density * p.edge.a * mix(1.0, 0.30, distanceFade);
  let ink = p.edge.rgb * mix(0.88, 1.06, wetness);
  let outlined = mix(scene, ink, coverage);
  return vec4<f32>(outlined, 1.0);
}
