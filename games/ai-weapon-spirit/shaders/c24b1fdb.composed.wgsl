struct ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    worldViewProj: mat4x4<f32>,
    lightDir: vec3<f32>,
    lightColor: vec3<f32>,
    cameraPos: vec3<f32>,
    lightViewProj_A: mat4x4<f32>,
    inverseViewProj: mat4x4<f32>,
    lightViewProj_B: mat4x4<f32>,
    lightViewProj_C: mat4x4<f32>,
    lightViewProj_D: mat4x4<f32>,
    splitPlanes: array<vec4<f32>, 4>,
    cascadeCount: f32,
    cascadeBlend: f32,
    depthBias: f32,
    normalBias: f32,
    directionalShadowFilter: vec4<f32>,
    spotLightViewProj: array<mat4x4<f32>, 4>,
    temporalCurrentViewProj: mat4x4<f32>,
    temporalPreviousViewProj: mat4x4<f32>,
    temporalProjection: vec4<f32>,
    temporalPreviousCameraPos: vec4<f32>,
    ssrParams: vec4<f32>,
    cloudShadowOrigin: vec4<f32>,
    cloudShadowRight: vec4<f32>,
    cloudShadowUp: vec4<f32>,
    cloudShadowProjection: vec4<f32>,
}

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

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

fn water_hairpin_center(t: f32, phase: f32) -> vec3<f32> {
    let lobe = pow(max(0f, sin((t * 3.1415927f))), 0.78f);
    let branch = sin((t * 6.2831855f));
    let fold = (sin(((t * 12.566371f) - (phase * 6.2831855f))) * lobe);
    let outward_lift = (smoothstep(0.04f, 0.22f, t) * (1f - smoothstep(0.4f, 0.5f, t)));
    let return_sag = (smoothstep(0.5f, 0.76f, t) * (1f - smoothstep(0.88f, 1f, t)));
    return vec3<f32>(((-0.62f + (lobe * 1.54f)) + (fold * 0.12f)), (((((0.38f + (lobe * 0.23f)) + (branch * 0.09f)) + (outward_lift * 0.14f)) - (return_sag * 0.18f)) + (fold * 0.055f)), ((branch * (0.36f + (lobe * 0.18f))) + (fold * 0.09f)));
}

fn water_hairpin_width(t_1: f32, phase_1: f32) -> f32 {
    let lobe_1 = pow(max(0f, sin((t_1 * 3.1415927f))), 0.62f);
    let return_branch = smoothstep(0.52f, 0.92f, t_1);
    let pressure = (0.94f + ((sin(((t_1 * 6.2831855f) - (phase_1 * 6.2831855f))) * 0.1f) * lobe_1));
    return ((mix(0.075f, 0.23f, lobe_1) * mix(1f, 0.78f, return_branch)) * pressure);
}

@vertex 
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    let radial = length(input.geometry_position.xz);
    let side = clamp(((radial - 0.42f) / 0.08f), -1f, 1f);
    let raw_angle = atan2(input.geometry_position.z, input.geometry_position.x);
    let angle = select(raw_angle, (raw_angle + 6.2831855f), (raw_angle < 0f));
    let t_2 = (angle / 6.2831855f);
    let flow_phase = input.particle_color.x;
    let shape_phase = input.particle_color.z;
    let _e30 = water_hairpin_center(fract((t_2 + 0.995f)), shape_phase);
    let _e34 = water_hairpin_center(fract((t_2 + 0.005f)), shape_phase);
    let tangent = normalize(((_e34 - _e30) + vec3<f32>(0.000001f, 0f, 0f)));
    let across = normalize((vec3<f32>(-(tangent.z), 0f, tangent.x) + vec3<f32>(0.000001f, 0f, 0f)));
    let shell_normal = normalize(cross(across, tangent));
    let _e55 = water_hairpin_center(t_2, shape_phase);
    let _e57 = water_hairpin_width(t_2, shape_phase);
    let local_position = ((_e55 + ((across * side) * _e57)) + ((shell_normal * input.geometry_position.y) * 0.1f));
    let _e70 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    output.position = (_e70 * vec4<f32>((((input.center + (input.right * local_position.x)) + (input.up * local_position.y)) + (input.forward * local_position.z)), 1f));
    output.flow_vector = vec2<f32>(cos(angle), sin(angle));
    output.band_side = side;
    output.shell_height = (input.geometry_position.y * 2f);
    output.phase = flow_phase;
    output.opacity = input.particle_color.y;
    output.surface_up = input.geometry_normal.y;
    let _e104 = output;
    return _e104;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    var local: bool;

    if !((input_1.surface_up < -0.5f)) {
        local = (input_1.opacity <= 0.001f);
    } else {
        local = true;
    }
    let _e11 = local;
    if _e11 {
        discard;
    }
    let top_surface = smoothstep(0.45f, 0.85f, input_1.surface_up);
    let side_depth = (1f - top_surface);
    let across_1 = clamp(abs(input_1.band_side), 0f, 1f);
    let core = (1f - smoothstep(0.42f, 0.96f, across_1));
    let thin_edge = (smoothstep(0.68f, 0.96f, across_1) * (1f - smoothstep(0.96f, 1f, across_1)));
    let flow_angle = atan2(input_1.flow_vector.y, input_1.flow_vector.x);
    let primary = (0.5f + (0.5f * sin(((flow_angle * 3f) - (input_1.phase * 18.849556f)))));
    let secondary = (0.5f + (0.5f * sin((((flow_angle * 5f) + (input_1.band_side * 2.4f)) - (input_1.phase * 25.132742f)))));
    let caustic_field = ((primary * 0.64f) + (secondary * 0.36f));
    let travelling_light = smoothstep(0.34f, 0.82f, caustic_field);
    let caustic = smoothstep(0.7f, 0.94f, caustic_field);
    let shell_light = (0.82f + (0.18f * abs(input_1.shell_height)));
    let deep_water = vec3<f32>(0.004f, 0.055f, 0.2f);
    let clear_blue = vec3<f32>(0.012f, 0.3f, 0.58f);
    let shallow_cyan = vec3<f32>(0.07f, 0.57f, 0.74f);
    let water_color = mix(deep_water, clear_blue, ((core * 0.76f) + (shell_light * 0.08f)));
    let moving_highlight = clamp((((thin_edge * 0.46f) + ((travelling_light * core) * 0.24f)) + ((caustic * core) * 0.26f)), 0f, 0.68f);
    let surface_radiance = mix(water_color, shallow_cyan, moving_highlight);
    let side_radiance = (deep_water * ((0.46f + (side_depth * 0.1f)) + (across_1 * 0.08f)));
    let radiance = mix(side_radiance, surface_radiance, top_surface);
    let surface_alpha = ((((0.48f + (core * 0.22f)) + (thin_edge * 0.1f)) + ((travelling_light * core) * 0.045f)) + ((caustic * core) * 0.045f));
    let alpha_profile = mix((0.34f + (across_1 * 0.08f)), surface_alpha, top_surface);
    let alpha = clamp((input_1.opacity * alpha_profile), 0f, 0.84f);
    return vec4<f32>((radiance * alpha), alpha);
}
