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
    @location(0) normal: vec3<f32>,
    @location(1) semantic: f32,
    @location(2) kind: f32,
    @location(3) opacity: f32,
    @location(4) facet: f32,
    @location(5) local_position: vec3<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

fn mesh_world_normalX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5G2ZLTNBPXG4DBMNSQX(right: vec3<f32>, up: vec3<f32>, forward: vec3<f32>, normal: vec3<f32>) -> vec3<f32> {
    let x = cross(up, forward);
    let y = cross(forward, right);
    let z = cross(right, up);
    let sign_ = select(-1f, 1f, (dot(right, x) >= 0f));
    let value_2 = (sign_ * (((x * normal.x) + (y * normal.y)) + (z * normal.z)));
    let magnitude = length(value_2);
    if (magnitude > 0.000001f) {
        return (value_2 / vec3(magnitude));
    }
    return vec3<f32>(0f, 1f, 0f);
}

fn rotate_around_forward(value: vec3<f32>, angle: f32) -> vec3<f32> {
    let sine = sin(angle);
    let cosine = cos(angle);
    return vec3<f32>(((value.x * cosine) - (value.y * sine)), ((value.x * sine) + (value.y * cosine)), value.z);
}

fn rotate_around_right(value_1: vec3<f32>, angle_1: f32) -> vec3<f32> {
    let sine_1 = sin(angle_1);
    let cosine_1 = cos(angle_1);
    return vec3<f32>(value_1.x, ((value_1.y * cosine_1) + (value_1.z * sine_1)), ((value_1.z * cosine_1) - (value_1.y * sine_1)));
}

@vertex 
fn vs_main(input: VertexInput) -> VertexOutput {
    var local_position: vec3<f32>;
    var local_normal: vec3<f32>;
    var output: VertexOutput;

    let semantic = clamp(input.geometry_uv.x, 0f, 1f);
    let left_wing = (step(0.125f, semantic) * (1f - step(0.5f, semantic)));
    let right_wing = (step(0.5f, semantic) * (1f - step(0.875f, semantic)));
    let wing = max(left_wing, right_wing);
    let wing_side = (right_wing - left_wing);
    let body = (1f - step(0.5f, input.particle_color.z));
    let flap = (((clamp(input.particle_color.x, 0f, 1f) * 2f) - 1f) * 0.58f);
    let wing_angle = (((wing_side * flap) * wing) * body);
    let _e43 = rotate_around_forward(input.geometry_position, wing_angle);
    local_position = _e43;
    let _e46 = rotate_around_forward(input.geometry_normal, wing_angle);
    local_normal = _e46;
    let dive_angle = ((clamp(input.particle_color.y, 0f, 1f) * 0.48f) * body);
    let _e56 = local_position;
    let _e57 = rotate_around_right(_e56, dive_angle);
    local_position = _e57;
    let _e58 = local_normal;
    let _e59 = rotate_around_right(_e58, dive_angle);
    local_normal = _e59;
    let _e62 = local_position.x;
    let _e66 = local_position.y;
    let _e71 = local_position.z;
    let offset = (((input.right * _e62) + (input.up * _e66)) + (input.forward * _e71));
    let _e78 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    output.position = (_e78 * vec4<f32>((input.center + offset), 1f));
    let _e88 = local_normal;
    let _e89 = mesh_world_normalX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5G2ZLTNBPXG4DBMNSQX(input.right, input.up, input.forward, _e88);
    output.normal = _e89;
    output.semantic = semantic;
    output.kind = input.particle_color.z;
    output.opacity = input.particle_color.w;
    output.facet = step(0.5f, input.geometry_uv.y);
    let _e103 = local_position;
    output.local_position = _e103;
    let _e104 = output;
    return _e104;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let normal_1 = normalize(input_1.normal);
    let key = vec3<f32>(0.34032348f, 0.8307896f, 0.4404186f);
    let view_proxy = vec3<f32>(0.11995204f, 0.41983214f, 0.89964026f);
    let key_light = clamp(((dot(normal_1, key) * 0.5f) + 0.5f), 0f, 1f);
    let rim = pow(clamp((1f - abs(dot(normal_1, view_proxy))), 0f, 1f), 9f);
    let narrow_rim = pow(clamp(rim, 0f, 1f), 2.4f);
    let facet_light = mix(0.72f, 1f, input_1.facet);
    let ember = step(0.5f, input_1.kind);
    let dark_red = vec3<f32>(0.2f, 0.008f, 0.002f);
    let vermilion = vec3<f32>(0.82f, 0.055f, 0.006f);
    let orange_gold = vec3<f32>(1f, 0.34f, 0.018f);
    let warm_gold = vec3<f32>(1f, 0.67f, 0.13f);
    let platinum = vec3<f32>(1f, 0.91f, 0.57f);
    let crest = step(0.875f, input_1.semantic);
    let wing_heat = (1f - (abs((input_1.semantic - 0.5f)) * 0.62f));
    let body_heat = clamp(((0.28f + (key_light * 0.58f)) + (wing_heat * 0.14f)), 0f, 1f);
    let body_shadow = mix(dark_red, vermilion, (body_heat * 0.78f));
    let body_lit = mix(body_shadow, orange_gold, (body_heat * facet_light));
    let body_gold = mix(body_lit, warm_gold, (crest * (0.38f + (key_light * 0.34f))));
    let body_radiance = mix(body_gold, platinum, (narrow_rim * (0.13f + (crest * 0.14f))));
    let ember_heat = clamp(((0.46f + (key_light * 0.34f)) + (input_1.facet * 0.12f)), 0f, 1f);
    let ember_base = mix(vermilion, orange_gold, ember_heat);
    let ember_radiance = mix(ember_base, warm_gold, (narrow_rim * 0.2f));
    let radiance = mix(body_radiance, ember_radiance, ember);
    let alpha = (clamp(input_1.opacity, 0f, 0.94f) * mix(1f, 0.86f, ember));
    if (alpha <= 0.001f) {
        discard;
    }
    return vec4<f32>((radiance * alpha), alpha);
}
