#define_import_path ai_weapon_spirit_vfx::water_medium_ribbon

struct SegmentInput {
  @location(0) start: vec3<f32>,
  @location(1) endpoint: vec3<f32>,
  // Water channels: width scale, caustic phase, flow coordinate, opacity.
  @location(2) color: vec4<f32>,
  @location(3) properties: vec2<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) caustic_phase: f32,
  @location(1) flow_t: f32,
  @location(2) opacity: f32,
  @location(3) side: f32,
}

@vertex
fn vs_main(input: SegmentInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(0.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, -1.0), vec2<f32>(1.0, 1.0), vec2<f32>(0.0, 1.0)
  );
  let corner = corners[vertex_index];
  let delta = input.endpoint.xy - input.start.xy;
  let normal = normalize(vec2<f32>(-delta.y, delta.x) + vec2<f32>(0.000001, 0.0));
  // Keep every segment on its authored endpoints. Tangential overdraw made
  // alpha-blended joints brighter than the film and exposed a radial comb.
  let point = mix(input.start, input.endpoint, corner.x);
  let sheet_width = input.properties.x * max(0.18, input.color.r);
  var output: VertexOutput;
  output.position = vec4<f32>(point.xy + normal * corner.y * sheet_width, point.z, 1.0);
  output.caustic_phase = input.color.g;
  // SegmentInput exposes only the start particle's color. Sampling the moving
  // caustic from the interpolated clip-space point keeps it continuous across
  // native Ribbon quads instead of quantising one brightness per node.
  output.flow_t = dot(point.xy, vec2<f32>(0.73, 0.47)) * 1.35;
  output.opacity = input.color.a;
  output.side = corner.y;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let edge = clamp(abs(input.side), 0.0, 1.0);
  let body = 1.0 - smoothstep(0.72, 1.0, edge);
  let interior = 1.0 - smoothstep(0.10, 0.88, edge);
  let upper_rim = smoothstep(0.48, 0.90, input.side) * (1.0 - smoothstep(0.90, 1.0, input.side));
  let lower_edge = smoothstep(0.72, 0.97, -input.side) * (1.0 - smoothstep(0.97, 1.0, -input.side));
  let flowing = 0.5 + 0.5 * sin(input.flow_t * 12.566371 + input.caustic_phase * 6.2831853);
  let counter_flow = 0.5 + 0.5 * sin(input.flow_t * 18.849556 - input.caustic_phase * 6.2831853);
  let caustic = smoothstep(0.76, 0.98, flowing * 0.76 + counter_flow * 0.24);

  let deep_water = vec3<f32>(0.004, 0.075, 0.24);
  let clear_blue = vec3<f32>(0.012, 0.30, 0.59);
  let shallow_cyan = vec3<f32>(0.055, 0.54, 0.73);
  let reflected_sky = vec3<f32>(0.40, 0.76, 0.86);
  let depth_color = mix(deep_water, clear_blue, interior * 0.68 + body * 0.16);
  let water_color = mix(depth_color, shallow_cyan, upper_rim * 0.36 + lower_edge * 0.08);
  let radiance = mix(water_color, reflected_sky, upper_rim * 0.16 + caustic * interior * 0.055);
  let alpha_profile = body * 0.40 + interior * 0.20 + upper_rim * 0.085 + lower_edge * 0.022
    + caustic * interior * 0.018;
  // Equal endpoint positions seal adjacent native Ribbon quads. Per-quad fades
  // or tangential overlap would expose the strip as a chain of separate cards.
  let alpha = clamp(input.opacity * alpha_profile, 0.0, 0.76);
  return vec4<f32>(radiance * alpha, alpha);
}
