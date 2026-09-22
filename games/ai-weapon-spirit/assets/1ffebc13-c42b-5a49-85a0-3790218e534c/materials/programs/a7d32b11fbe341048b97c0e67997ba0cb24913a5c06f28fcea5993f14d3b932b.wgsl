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
    @location(0) radial_direction: vec2<f32>,
    @location(1) radial_meters: f32,
    @location(2) front_radius_meters: f32,
    @location(3) expansion_age: f32,
    @location(4) phase: f32,
    @location(5) condensation: f32,
    @location(6) opacity: f32,
    @location(7) surface_up: f32,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

@vertex 
fn vs_main(input: VertexInput) -> VertexOutput {
    var local: vec3<f32>;
    var output: VertexOutput;

    let source_radius = max(length(input.geometry_position.xz), 0.000001f);
    let radial_direction = (input.geometry_position.xz / vec2(source_radius));
    let band_t = clamp(input.geometry_uv.y, 0f, 1f);
    let angle = atan2(radial_direction.y, radial_direction.x);
    let authored_phase = (input.particle_color.y * 6.2831855f);
    let local_duration = ((0.96f + (sin(((angle * 3f) + authored_phase)) * 0.12f)) + (sin(((angle * 7f) - (authored_phase * 0.61f))) * 0.055f));
    let expansion_life = clamp((input.particle_color.x / local_duration), 0f, 1f);
    let expansion = (1f - (((1f - expansion_life) * (1f - expansion_life)) * (1f - expansion_life)));
    let front_scale = mix(0.09565217f, 1f, expansion);
    let settled = smoothstep(0.48f, 1f, expansion);
    let broad_undulation = (sin(((angle * 5f) + (authored_phase * 0.37f))) * 0.018f);
    let fine_undulation = (sin(((angle * 11f) - (authored_phase * 0.73f))) * 0.006f);
    let center_radius = ((0.5f * front_scale) + ((broad_undulation + fine_undulation) * settled));
    let half_width = input.particle_color.z;
    let leading_outer_radius = (center_radius + half_width);
    let deformed_radius = mix(0.013043478f, leading_outer_radius, band_t);
    local = vec3<f32>((radial_direction.x * deformed_radius), (input.geometry_position.y * 0.006f), (radial_direction.y * deformed_radius));
    let _e99 = local.x;
    let _e103 = local.y;
    let _e108 = local.z;
    let offset = (((input.right * _e99) + (input.up * _e103)) + (input.forward * _e108));
    let _e115 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    output.position = (_e115 * vec4<f32>((input.center + offset), 1f));
    output.radial_direction = radial_direction;
    output.radial_meters = (deformed_radius * 4.6f);
    output.front_radius_meters = (center_radius * 4.6f);
    output.expansion_age = input.particle_color.x;
    output.phase = input.particle_color.y;
    let age_seconds = (input.particle_color.x * 0.36f);
    output.condensation = (smoothstep(0.015f, 0.1f, age_seconds) * (1f - smoothstep(0.42f, 0.92f, age_seconds)));
    output.opacity = input.particle_color.w;
    output.surface_up = input.geometry_normal.y;
    let _e154 = output;
    return _e154;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    var local_1: bool;

    if !((input_1.surface_up < 0.5f)) {
        local_1 = (input_1.opacity <= 0.001f);
    } else {
        local_1 = true;
    }
    let _e11 = local_1;
    if _e11 {
        discard;
    }
    let radial_direction_1 = normalize((input_1.radial_direction + vec2<f32>(0.000001f, 0f)));
    let angle_1 = atan2(radial_direction_1.y, radial_direction_1.x);
    let authored_phase_1 = (input_1.phase * 6.2831855f);
    let radial_meters = max(0f, input_1.radial_meters);
    let distance_behind_front = (input_1.front_radius_meters - radial_meters);
    let leading_edge = (1f - smoothstep(0.065f, 0.11f, abs(distance_behind_front)));
    let interior_region = (smoothstep(0.07f, 0.2f, distance_behind_front) * smoothstep(0.06f, 0.2f, radial_meters));
    let plane = (radial_direction_1 * radial_meters);
    let broad_mottle = (0.5f + (0.5f * sin((((plane.x * 2.7f) + (plane.y * 1.9f)) + (sin(((plane.y * 2.3f) + authored_phase_1)) * 0.72f)))));
    let cross_mottle = (0.5f + (0.5f * sin((((plane.x * -1.6f) + (plane.y * 3.1f)) - (authored_phase_1 * 0.63f)))));
    let deposition_field = ((broad_mottle * 0.64f) + (cross_mottle * 0.36f));
    let deposited_frost = smoothstep(0.2f, 0.78f, deposition_field);
    let deposit_clusters = smoothstep(0.64f, 0.9f, deposition_field);
    let primary_vein_field = (0.5f + (0.5f * sin((((angle_1 * 13f) + (radial_meters * 1.75f)) + (sin(((angle_1 * 3f) - authored_phase_1)) * 0.62f)))));
    let branch_vein_field = (0.5f + (0.5f * sin((((angle_1 * 19f) - (radial_meters * 2.4f)) - (authored_phase_1 * 0.47f)))));
    let ice_veins = ((smoothstep(0.9f, 0.985f, max(primary_vein_field, (branch_vein_field * 0.97f))) * smoothstep(0.3f, 0.82f, broad_mottle)) * interior_region);
    let travelling_cold = (0.5f + (0.5f * sin((((angle_1 * 7f) - (input_1.expansion_age * 5.4f)) - authored_phase_1))));
    let condensation_flow = ((input_1.condensation * smoothstep(0.28f, 0.92f, travelling_cold)) * interior_region);
    let crystal_accretion = smoothstep(0.3f, 0.92f, (0.5f + (0.5f * sin(((angle_1 * 9f) + (authored_phase_1 * 0.41f))))));
    let crystalline_edge = (leading_edge * mix(0.64f, 1f, crystal_accretion));
    let deep_ice = vec3<f32>(0.075f, 0.29f, 0.43f);
    let milk_blue = vec3<f32>(0.34f, 0.69f, 0.79f);
    let hoarfrost = vec3<f32>(0.72f, 0.9f, 0.94f);
    let membrane_color = mix(deep_ice, milk_blue, ((deposited_frost * 0.68f) + (ice_veins * 0.24f)));
    let condensed_color = mix(membrane_color, hoarfrost, ((condensation_flow * 0.34f) + (ice_veins * 0.3f)));
    let frost_color = mix(condensed_color, hoarfrost, (crystalline_edge * 0.64f));
    let membrane_alpha = (interior_region * ((0.018f + (deposited_frost * 0.076f)) + (deposit_clusters * 0.022f)));
    let vein_alpha = (ice_veins * 0.112f);
    let condensation_alpha = (condensation_flow * 0.045f);
    let edge_alpha = (crystalline_edge * 0.3f);
    let alpha = clamp((input_1.opacity * (((membrane_alpha + vein_alpha) + condensation_alpha) + edge_alpha)), 0f, 0.46f);
    return vec4<f32>((frost_color * alpha), alpha);
}
