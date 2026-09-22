#define_import_path ai_weapon_spirit_vfx::cinder_billboard
// The analytic fog producer was removed from this shader. Billboard
// soft-particle depth is therefore the sole group-0 resource again, matching
// the prepared group-0-resource layout and its binding resolver.
@group(0) @binding(0) var scene_depth: texture_depth_2d;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) local: vec2<f32>,
  @location(2) emissive_intensity: vec4<f32>,
  @location(3) surface: vec4<f32>,
  @location(4) sheet_uv: vec2<f32>,
  @location(5) sheet_frame: f32,
  @location(6) fade_distance: f32,
  @location(7) clip_position: vec3<f32>,
  @location(8) tint: vec4<f32>,
  @location(9) variation: f32,
};

fn textureSheetFrame(age: f32, frameRate: f32, frameCount: u32) -> u32 {
  if (frameCount == 0u || frameRate <= 0.0) { return 0u; }
  return min(frameCount - 1u, u32(max(0.0, floor(age * frameRate))));
}

fn textureSheetUv(local: vec2<f32>, frame: u32, columns: u32, rows: u32) -> vec2<f32> {
  let safeColumns = max(columns, 1u);
  let safeRows = max(rows, 1u);
  let cell = vec2<u32>(frame % safeColumns, frame / safeColumns);
  return (local + vec2<f32>(1.0)) * 0.5 / vec2<f32>(f32(safeColumns), f32(safeRows)) +
    vec2<f32>(f32(cell.x) / f32(safeColumns), f32(cell.y) / f32(safeRows));
}

fn billboardPivot(corner: vec2<f32>, pivot: vec2<f32>) -> vec2<f32> {
  return corner + pivot * 2.0;
}

fn softParticleFactor(particleDepth: f32, sceneDepth: f32, fadeDistance: f32) -> f32 {
  if (fadeDistance <= 0.0) { return 1.0; }
  return clamp((sceneDepth - particleDepth) / fadeDistance, 0.0, 1.0);
}

fn billboardSortingKey(depth: f32, mode: u32) -> f32 {
  return select(0.0, depth, mode == 2u);
}

fn softParticle(position: vec4<f32>, alpha: f32, fadeDistance: f32) -> f32 {
  let pixel = vec2<i32>(position.xy);
  let sceneDepth = textureLoad(scene_depth, pixel, 0);
  if (fadeDistance <= 0.0) {
    return select(alpha, 0.0, position.z > sceneDepth);
  }
  return alpha * softParticleFactor(position.z, sceneDepth, fadeDistance);
}

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) right: vec2<f32>,
  @location(2) up: vec2<f32>,
  @location(3) particle_color: vec4<f32>,
  @location(4) base_color: vec4<f32>,
  @location(5) emissive_intensity: vec4<f32>,
  @location(6) surface: vec4<f32>,
  @location(7) advanced: vec4<f32>,
  @location(8) texture_sheet: vec4<f32>,
};

@vertex
fn vs_main(input: VertexInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0),
    vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, 1.0), vec2<f32>(-1.0, 1.0)
  );
  let corner = billboardPivot(corners[vertex_index], input.advanced.xy);
  var output: VertexOutput;
  // Saved comic configuration: decorative sparks/embers have 2.4x size.
  // Scale only the projected quad, preserving the native particle trajectory.
  let particleSize = input.surface.y;
  let clipPosition = vec3<f32>(
    input.position.xy + (input.right * corner.x + input.up * corner.y) * particleSize,
    input.position.z,
  );
  output.position = vec4<f32>(clipPosition, 1.0);
  output.clip_position = clipPosition;
  output.color = input.particle_color;
  output.tint = input.base_color;
  // The native roll gives each puff a smooth individual material phase. It
  // does not depend on screen position, so translating the camera cannot swim it.
  output.variation = atan2(input.right.y, input.right.x);
  output.local = corner;
  output.emissive_intensity = input.emissive_intensity;
  output.surface = input.surface;
  output.sheet_uv = textureSheetUv(
    corners[vertex_index],
    u32(input.advanced.z),
    u32(input.texture_sheet.x),
    u32(input.texture_sheet.y),
  );
  output.sheet_frame = input.advanced.z;
  output.fade_distance = input.texture_sheet.z;
  return output;
}



// Saved comic printing: color is authored in linear space. Alpha stays premultiplied.
fn cinder_print(value: vec4<f32>, pixel: vec2<f32>, tint: vec4<f32>, print: vec4<f32>) -> vec4<f32> {
  if (value.a <= 0.00001) { discard; }
  let straight = max(value.rgb / value.a, vec3<f32>(0.0));
  let brightness = max(max(straight.r, straight.g), straight.b);
  let shade = mix(clamp(brightness, 0.2, 1.6), floor(clamp(brightness, 0.0, 1.5) * 3.0) / 3.0 + 0.22, print.z);
  var color = mix(straight, tint.rgb * shade, tint.a);
  let grid = pixel / max(4.0, print.w);
  let cell = fract(vec2<f32>(grid.x + grid.y * 0.22, grid.y)) - vec2<f32>(0.5);
  let radius = mix(0.12, 0.32, 1.0 - clamp(brightness, 0.0, 1.0));
  let dots = 1.0 - smoothstep(radius - 0.035, radius + 0.035, length(cell));
  let line1 = 1.0 - smoothstep(0.06, 0.15, abs(fract(grid.x + grid.y) - 0.5));
  let line2 = 1.0 - smoothstep(0.06, 0.15, abs(fract(grid.x - grid.y) - 0.5));
  let hatch = max(line1, line2 * (1.0 - smoothstep(0.3, 0.8, brightness)));
  color = mix(color, vec3<f32>(0.006, 0.004, 0.015), max(dots * print.x, hatch * print.y) * 0.9);
  return vec4<f32>(color * value.a, value.a);
}

fn cinder_hash(p: vec2<f32>) -> f32 {
  return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453);
}

fn cinder_noise(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(cinder_hash(i), cinder_hash(i + vec2<f32>(1.0, 0.0)), u.x),
    mix(cinder_hash(i + vec2<f32>(0.0, 1.0)), cinder_hash(i + vec2<f32>(1.0, 1.0)), u.x),
    u.y
  );
}


fn cinder_fire_shade(input: VertexOutput) -> vec4<f32> {
  let softness = 1.0 - clamp(input.emissive_intensity.z, 0.0, 1.0);
  // Smooth elemental flame recipes taper inside the billboard and vary their
  // folds with the authored temperature. Fully printed Cinder keeps its shape.
  let time = input.sheet_frame / 60.0;
  let phase = vec2<f32>(sin(input.variation), cos(input.variation));
  let seed = softness * (input.color.g * 5.73 + input.color.b * 13.4);
  let taper = 1.0 - softness * 0.55 * smoothstep(-0.6, 1.0, input.local.y);
  let p = vec2<f32>(input.local.x / taper, input.local.y * mix(0.72, 0.96, softness));
  let rise = max(0.0, input.local.y);
  let n0 = cinder_noise(p * 2.15 + phase * 3.1 + vec2<f32>(seed, -time * .9));
  let n1 = cinder_noise(p * 5.7 - phase * 4.3 + vec2<f32>(seed, -time * 1.7));
  let n2 = cinder_noise(vec2<f32>(p.x * 9.3, p.y * 4.1) + phase * 6.2 + vec2<f32>(seed, -time * 2.2));
  let tongue = (n0 - 0.5) * (0.18 + rise * 0.24);
  let warped = length(vec2<f32>(p.x + (n1 - 0.5) * 0.28, p.y - tongue));
  let tornEdge = 0.78 + n0 * 0.18 + n2 * 0.08;
  let body = 1.0 - smoothstep(tornEdge - mix(0.24, 0.075, input.emissive_intensity.z), tornEdge, warped);
  let core = 1.0 - smoothstep(0.08, 0.42 + n1 * 0.08, warped + (n2 - 0.5) * 0.1);
  let fringe = body * (1.0 - core);
  let temperature = clamp(core * 1.15 + n0 * 0.28, 0.0, 1.0);
  let hot = mix(vec3<f32>(1.0, 0.055, 0.004), vec3<f32>(1.0, 0.82, 0.32), temperature);
  let soot = vec3<f32>(0.055, 0.018, 0.009) * fringe;
  let breakup = smoothstep(0.18, 0.58, n2 + body * 0.45);
  // The stretched flame field can reach beyond its quad at the tips. Fade
  // within every edge so large meteor tongues never expose rectangular cards.
  let edgeFade = 1.0 - smoothstep(0.7, 1.0, max(abs(input.local.x), abs(input.local.y)));
  let alpha = softParticle(
    input.position,
    input.color.a * body * breakup * edgeFade * (0.42 + core * 0.58),
    input.fade_distance
  );
  let rgb = (hot * (0.7 + temperature * 2.4) * input.color.rgb + soot) * alpha;
  return vec4<f32>(rgb, alpha);
}

fn cinder_smoke_shade(input: VertexOutput) -> vec4<f32> {
  let time = input.sheet_frame / 60.0;
  let phase = vec2<f32>(sin(input.variation), cos(input.variation));
  let p = input.local;
  let n0 = cinder_noise(p * 1.8 + phase * 5.0 + vec2<f32>(time*.08,-time*.18));
  let n1 = cinder_noise(p * 4.6 - phase * 7.0 + vec2<f32>(-time*.13,-time*.31));
  let n2 = cinder_noise(p.yx * 8.2 + phase * 9.0 + vec2<f32>(time*.16,-time*.23));
  let warped = length(p + vec2<f32>(n0 - 0.5, n1 - 0.5) * 0.34);
  let silhouette = 1.0 - smoothstep(0.48 + n0 * 0.18, 1.04, warped);
  let edge = 1.0 - smoothstep(.72, 1.0, max(abs(p.x),abs(p.y)));
  let density = silhouette * (.32 + .68 * smoothstep(.18,.76,n0*.52+n1*.31+n2*.17)) * edge;
  let alpha = softParticle(input.position, input.color.a * density * .86, input.fade_distance);
  let volumeLight = .72 + n1*.3 + (p.y*.5+.5)*.14;
  let ash = input.color.rgb * volumeLight;
  return vec4<f32>(ash * alpha, alpha);
}

fn cinder_speed_shade(input: VertexOutput) -> vec4<f32> {
  let p = input.local;
  let olive = max(0.0, 1.0 - dot(p, p));
  let body = pow(olive, 0.42);
  let alpha = input.color.a * body;
  let hot = mix(input.color.rgb, vec3<f32>(2.4, 1.35, 0.38), pow(olive, 2.0));
  return vec4<f32>(hot * alpha, alpha);
}

fn cinder_ember_shade(input: VertexOutput, edge: f32) -> vec4<f32> {
  let radius = length(input.local);
  let body = max(0.0,(exp(-radius*radius*3.2)-exp(-3.2))/(1.0-exp(-3.2))) * (1.0-smoothstep(1.0-edge,1.0,radius));
  let core = exp(-radius*radius*28.0);
  let alpha = input.color.a * body;
  let color = input.color.rgb * (0.78 + core * 2.1);
  return vec4<f32>(color * alpha, alpha);
}


// Variant order follows FRAGMENT_KINDS.billboard in the material toolbox.
@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  // Derivatives are evaluated before the per-material branch (WebGPU uniform
  // control flow), then passed to the spark antialiasing function as values.
  let emberEdge = max(fwidth(length(input.local)), .025);
  let localFootprint = fwidth(input.local);
  var shaded: vec4<f32>;
  switch i32(round(input.surface.x * 8.0)) {
    case 0: { shaded = cinder_fire_shade(input); }
    case 1: { shaded = cinder_smoke_shade(input); }
    case 2: { shaded = cinder_speed_shade(input); }
    default: { shaded = cinder_ember_shade(input, emberEdge); }
  }
  // lab-model.look: comic glow=0.8; smoke=1.74*0.48. Palette remapping
  // preserves the peak before per-role tint, so only this radiance affects paint.
  let smoke = i32(round(input.surface.x * 8.0)) == 1;
  shaded = select(vec4<f32>(shaded.rgb * input.surface.z, shaded.a), shaded * input.surface.z, smoke);
  let ember = i32(round(input.surface.x * 8.0)) == 3;
  // Subpixel fire sparks cannot carry a 9 px print cell or a 3 px black rim.
  // Retain print on larger flakes while fading it smoothly on small hot grains.
  let radiusPixels = 1.0 / max(length(localFootprint), .001);
  let detail = select(1.0, smoothstep(2.0,7.0,radiusPixels), ember);
  let print = vec4<f32>(input.emissive_intensity.xyz * detail, input.emissive_intensity.w);
  let painted = cinder_print(shaded, input.position.xy, input.tint, print);
  // lab_particle_ink for the saved original contour, using its alpha silhouette.
  let mask = painted.a / max(input.color.a, 0.0001);
  let inside = select(1.0, smoothstep(0.035, 0.035 + max(fwidth(mask), 0.005) * max(input.surface.w * detail, .001), mask), input.surface.w * detail > 0.0);
  return vec4<f32>(mix(vec3<f32>(0.004, 0.003, 0.012) * painted.a, painted.rgb, inside), painted.a);
}
