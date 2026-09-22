#define_import_path ai_weapon_spirit_vfx::water_medium_mesh
#import forgeax_view::common::{View, view}

struct VertexInput {
  @location(0) geometry_position: vec3<f32>,
  @location(1) geometry_normal: vec3<f32>,
  @location(2) geometry_uv: vec2<f32>,
  @location(3) geometry_tangent: vec4<f32>,
  @location(4) center: vec3<f32>,
  @location(5) right: vec3<f32>,
  @location(6) up: vec3<f32>,
  @location(7) forward: vec3<f32>,
  @location(8) particle_color: vec4<f32>,
  @location(9) render_controls: vec2<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) flow_vector: vec2<f32>,
  @location(1) band_side: f32,
  @location(2) shell_height: f32,
  @location(3) phase: f32,
  @location(4) opacity: f32,
  @location(5) surface_up: f32,
}

fn water_hairpin_center(t: f32, phase: f32) -> vec3<f32> {
  let lobe = pow(max(0.0, sin(t * 3.14159265)), 0.78);
  let branch = sin(t * 6.2831853);
  let fold = sin(t * 12.566371 - phase * 6.2831853) * lobe;
  let outward_lift = smoothstep(0.04, 0.22, t) * (1.0 - smoothstep(0.40, 0.50, t));
  let return_sag = smoothstep(0.50, 0.76, t) * (1.0 - smoothstep(0.88, 1.0, t));
  return vec3<f32>(
    -0.62 + lobe * 1.54 + fold * 0.12,
    0.38 + lobe * 0.23 + branch * 0.09 + outward_lift * 0.14 - return_sag * 0.18 + fold * 0.055,
    branch * (0.36 + lobe * 0.18) + fold * 0.09,
  );
}

fn water_hairpin_width(t: f32, phase: f32) -> f32 {
  let lobe = pow(max(0.0, sin(t * 3.14159265)), 0.62);
  let return_branch = smoothstep(0.52, 0.92, t);
  let pressure = 0.94 + sin(t * 6.2831853 - phase * 6.2831853) * 0.10 * lobe;
  return mix(0.075, 0.23, lobe) * mix(1.0, 0.78, return_branch) * pressure;
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  // rune-ring is a connected annulus. Recover stable angular and radial
  // coordinates from geometry rather than its deliberately per-face UVs.
  let radial = length(input.geometry_position.xz);
  let side = clamp((radial - 0.42) / 0.08, -1.0, 1.0);
  let raw_angle = atan2(input.geometry_position.z, input.geometry_position.x);
  let angle = select(raw_angle, raw_angle + 6.2831853, raw_angle < 0.0);
  let t = angle / 6.2831853;
  let flow_phase = input.particle_color.x;
  let shape_phase = input.particle_color.z;
  let previous = water_hairpin_center(fract(t + 0.995), shape_phase);
  let following = water_hairpin_center(fract(t + 0.005), shape_phase);
  let tangent = normalize(following - previous + vec3<f32>(0.000001, 0.0, 0.0));
  let across = normalize(vec3<f32>(-tangent.z, 0.0, tangent.x) + vec3<f32>(0.000001, 0.0, 0.0));
  let shell_normal = normalize(cross(across, tangent));
  let local_position = water_hairpin_center(t, shape_phase)
    + across * side * water_hairpin_width(t, shape_phase)
    + shell_normal * input.geometry_position.y * 0.10;
  var output: VertexOutput;
  output.position = view.worldViewProj * vec4<f32>(
    input.center
      + input.right * local_position.x
      + input.up * local_position.y
      + input.forward * local_position.z,
    1.0,
  );
  // A unit direction remains continuous across the atan2 seam.
  output.flow_vector = vec2<f32>(cos(angle), sin(angle));
  output.band_side = side;
  output.shell_height = input.geometry_position.y * 2.0;
  output.phase = flow_phase;
  output.opacity = input.particle_color.y;
  output.surface_up = input.geometry_normal.y;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  // Reject only the hidden underside. The two connected side walls remain as
  // a controlled dark depth band, giving the free surface thickness without
  // stacking a second bright translucent sheet into a plastic tube.
  if (input.surface_up < -0.5 || input.opacity <= 0.001) {
    discard;
  }
  let top_surface = smoothstep(0.45, 0.85, input.surface_up);
  let side_depth = 1.0 - top_surface;
  let across = clamp(abs(input.band_side), 0.0, 1.0);
  let core = 1.0 - smoothstep(0.42, 0.96, across);
  let thin_edge = smoothstep(0.68, 0.96, across) * (1.0 - smoothstep(0.96, 1.0, across));
  let flow_angle = atan2(input.flow_vector.y, input.flow_vector.x);
  // Both waves travel along arc length. Their integer phase winding keeps the
  // `fract` wrap seamless while their 3:4 transport rates avoid lockstep glow.
  let primary = 0.5 + 0.5 * sin(flow_angle * 3.0 - input.phase * 18.849556);
  let secondary = 0.5 + 0.5 * sin(flow_angle * 5.0 + input.band_side * 2.4 - input.phase * 25.132741);
  let caustic_field = primary * 0.64 + secondary * 0.36;
  let travelling_light = smoothstep(0.34, 0.82, caustic_field);
  let caustic = smoothstep(0.70, 0.94, caustic_field);
  let shell_light = 0.82 + 0.18 * abs(input.shell_height);
  let deep_water = vec3<f32>(0.004, 0.055, 0.20);
  let clear_blue = vec3<f32>(0.012, 0.30, 0.58);
  let shallow_cyan = vec3<f32>(0.07, 0.57, 0.74);
  let water_color = mix(deep_water, clear_blue, core * 0.76 + shell_light * 0.08);
  let moving_highlight = clamp(
    thin_edge * 0.46 + travelling_light * core * 0.24 + caustic * core * 0.26,
    0.0,
    0.68,
  );
  let surface_radiance = mix(water_color, shallow_cyan, moving_highlight);
  let side_radiance = deep_water * (0.46 + side_depth * 0.10 + across * 0.08);
  let radiance = mix(side_radiance, surface_radiance, top_surface);
  let surface_alpha = 0.48 + core * 0.22 + thin_edge * 0.10
    + travelling_light * core * 0.045 + caustic * core * 0.045;
  let alpha_profile = mix(0.34 + across * 0.08, surface_alpha, top_surface);
  let alpha = clamp(input.opacity * alpha_profile, 0.0, 0.84);
  return vec4<f32>(radiance * alpha, alpha);
}
