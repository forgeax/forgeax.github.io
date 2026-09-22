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

struct Input {
    @location(0) p: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) tangent: vec4<f32>,
    @location(4) center: vec3<f32>,
    @location(5) right: vec3<f32>,
    @location(6) up: vec3<f32>,
    @location(7) forward: vec3<f32>,
    @location(8) color: vec4<f32>,
    @location(9) render_controls: vec2<f32>,
}

struct Out {
    @builtin(position) position: vec4<f32>,
    @location(0) local: vec3<f32>,
    @location(1) color: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

@vertex 
fn vs_main(i: Input) -> Out {
    var o: Out;

    let _e5 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    o.position = (_e5 * vec4<f32>((((i.center + (i.right * i.p.x)) + (i.up * i.p.y)) + (i.forward * i.p.z)), 1f));
    o.local = i.p;
    o.color = i.color;
    let _e29 = o;
    return _e29;
}

@fragment 
fn fs_main(i_1: Out) -> @location(0) vec4<f32> {
    let radius = length(i_1.local.xz);
    let core = exp(((-(radius) * radius) * 1600f));
    let edge = (exp(((-(radius) * radius) * 65f)) * (1f - smoothstep(0.19f, 0.28f, radius)));
    let alpha = (edge * i_1.color.w);
    let rgb = mix(vec3<f32>(0.25f, 1.25f, 0.16f), vec3<f32>(2.1f, 2.5f, 1f), core);
    return vec4<f32>((rgb * alpha), alpha);
}
