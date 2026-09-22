#define_import_path ai_weapon_spirit_vfx::cinder_ribbon

struct SegmentInput {
  @location(0) start: vec3<f32>,
  @location(1) endpoint: vec3<f32>,
  @location(2) color: vec4<f32>,
  @location(3) properties: vec2<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) side: f32,
  @location(2) axial_t: f32,
  @location(3) chain_mask: f32,
}

@vertex
fn vs_main(
  input: SegmentInput,
  @builtin(vertex_index) vertex_index: u32,
  @builtin(instance_index) instance_index: u32,
) -> VertexOutput {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(0.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, -1.0), vec2<f32>(1.0, 1.0), vec2<f32>(0.0, 1.0)
  );
  let corner = corners[vertex_index];
  // The GPU path owns the kinks in world space; camera motion must never
  // invent a second path or move a pinned endpoint.
  let start = input.start.xy;
  let endpoint = input.endpoint.xy;
  let delta = endpoint - start;
  let normal = normalize(vec2<f32>(-delta.y, delta.x) + vec2<f32>(0.000001, 0.0));
  let point = vec3<f32>(
    mix(start, endpoint, corner.x),
    mix(input.start.z, input.endpoint.z, corner.x),
  );
  var output: VertexOutput;
  output.position = vec4<f32>(point.xy + normal * corner.y * input.properties.x, point.z, 1.0);
  output.color = input.color;
  output.side = corner.y;
  output.axial_t = 0.0;
  output.chain_mask = step(0.020, input.properties.x);
  return output;
}



// Original Cinder wave has a hot crest inside a softer halo. Preserve its
// thermal RGB until after this profile; tinting the simulation erased the crest.
// The 0.1.28 ribbon ABI has no material lanes. This is the saved comic recipe;
// the editor explicitly reports that ribbon tint/print are not live controls.
@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
 let across = abs(input.side);
 let crest = exp(-across * across * 18.0);
 let halo = 1.0 - smoothstep(0.0, 1.0, across);
 let alpha = input.color.a * (crest * 0.82 + halo * 0.18);
 let rgb = mix(input.color.rgb * 0.42, vec3<f32>(1.55, 0.62, 0.15), crest);
 let brightness = max(max(rgb.r, rgb.g), rgb.b) * 0.8;
 let shade = floor(clamp(brightness, 0.0, 1.5) * 3.0) / 3.0 + 0.22;
 var color = vec3<f32>(0.0395462353, 0.610495571, 0.799102738) * shade;
 let grid = input.position.xy / 9.0;
 let cell = fract(vec2<f32>(grid.x + grid.y * 0.22, grid.y)) - vec2<f32>(0.5);
 let radius = mix(0.12, 0.32, 1.0 - clamp(brightness, 0.0, 1.0));
 let dots = 1.0 - smoothstep(radius - 0.035, radius + 0.035, length(cell));
 let line1 = 1.0 - smoothstep(0.06, 0.15, abs(fract(grid.x + grid.y) - 0.5));
 let line2 = 1.0 - smoothstep(0.06, 0.15, abs(fract(grid.x - grid.y) - 0.5));
 let hatch = max(line1, line2 * (1.0 - smoothstep(0.3, 0.8, brightness)));
 color = mix(color, vec3<f32>(0.006, 0.004, 0.015), max(dots * 0.8, hatch * 0.28) * 0.9);
 return vec4<f32>(color * alpha, alpha);
}
