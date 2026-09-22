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
    @location(1) phase: vec4<f32>,
    @location(2) facet: f32,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

fn mesh_world_normalX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5G2ZLTNBPXG4DBMNSQX(right: vec3<f32>, up: vec3<f32>, forward: vec3<f32>, normal: vec3<f32>) -> vec3<f32> {
    let x = cross(up, forward);
    let y = cross(forward, right);
    let z = cross(right, up);
    let sign_ = select(-1f, 1f, (dot(right, x) >= 0f));
    let value = (sign_ * (((x * normal.x) + (y * normal.y)) + (z * normal.z)));
    let magnitude = length(value);
    if (magnitude > 0.000001f) {
        return (value / vec3(magnitude));
    }
    return vec3<f32>(0f, 1f, 0f);
}

@vertex 
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    let offset = (((input.right * input.geometry_position.x) + (input.up * input.geometry_position.y)) + (input.forward * input.geometry_position.z));
    let _e19 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    output.position = (_e19 * vec4<f32>((input.center + offset), 1f));
    let _e30 = mesh_world_normalX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5G2ZLTNBPXG4DBMNSQX(input.right, input.up, input.forward, input.geometry_normal);
    output.normal = _e30;
    output.phase = input.particle_color;
    output.facet = step(0.5f, input.geometry_uv.y);
    let _e38 = output;
    return _e38;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    var local: bool;

    let normal_1 = normalize(input_1.normal);
    let viewA = vec3<f32>(0.42056814f, 0.550744f, 0.72097397f);
    let viewB = vec3<f32>(-0.58023214f, 0.38015208f, 0.7202882f);
    let rim = max((1f - abs(dot(normal_1, viewA))), (1f - abs(dot(normal_1, viewB))));
    let violetRim = pow(clamp(rim, 0f, 1f), 5.2f);
    let cyanCusp = pow(clamp(rim, 0f, 1f), 13f);
    let facetShade = mix(0.54f, 0.82f, input_1.facet);
    let pulse = clamp(input_1.phase.x, 0f, 1f);
    let collapse = clamp(input_1.phase.y, 0f, 1f);
    let alpha = clamp(input_1.phase.w, 0f, 1f);
    if !((collapse >= 0.995f)) {
        local = (alpha <= 0.001f);
    } else {
        local = true;
    }
    let _e57 = local;
    if _e57 {
        discard;
    }
    let eventHorizon = (vec3<f32>(0.0015f, 0.002f, 0.008f) * facetShade);
    let violet = ((vec3<f32>(0.16f, 0.025f, 0.34f) * violetRim) * (0.72f + (pulse * 0.2f)));
    let cyan = ((vec3<f32>(0.018f, 0.3f, 0.43f) * cyanCusp) * (0.3f + (collapse * 0.42f)));
    let rgb = ((eventHorizon + violet) + cyan);
    return vec4<f32>((rgb * alpha), alpha);
}
