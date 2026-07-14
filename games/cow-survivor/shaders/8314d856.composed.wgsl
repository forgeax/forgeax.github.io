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
    pcfKernelSize: f32,
    spotLightViewProj: array<mat4x4<f32>, 4>,
}

struct MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    worldFromLocal: mat4x4<f32>,
    normalMatrix: mat3x3<f32>,
}

struct TorchUniforms {
    baseColor: vec4<f32>,
    time: f32,
    intensity: f32,
}

struct VsIn {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
}

struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) localPos: vec3<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(1) @binding(0) 
var<uniform> u: TorchUniforms;

fn hash13_(p: vec3<f32>) -> f32 {
    let q = fract((p * 0.1031f));
    let r = (q + vec3(dot(q, (q.yzx + vec3(33.33f)))));
    return fract(((r.x + r.y) * r.z));
}

fn noise3_(p_1: vec3<f32>) -> f32 {
    let i = floor(p_1);
    let f = fract(p_1);
    let u_1 = ((f * f) * (vec3(3f) - (2f * f)));
    let _e15 = hash13_((i + vec3<f32>(0f, 0f, 0f)));
    let _e21 = hash13_((i + vec3<f32>(1f, 0f, 0f)));
    let n00_ = mix(_e15, _e21, u_1.x);
    let _e29 = hash13_((i + vec3<f32>(0f, 1f, 0f)));
    let _e35 = hash13_((i + vec3<f32>(1f, 1f, 0f)));
    let n10_ = mix(_e29, _e35, u_1.x);
    let _e43 = hash13_((i + vec3<f32>(0f, 0f, 1f)));
    let _e49 = hash13_((i + vec3<f32>(1f, 0f, 1f)));
    let n01_ = mix(_e43, _e49, u_1.x);
    let _e57 = hash13_((i + vec3<f32>(0f, 1f, 1f)));
    let _e63 = hash13_((i + vec3<f32>(1f, 1f, 1f)));
    let n11_ = mix(_e57, _e63, u_1.x);
    return mix(mix(n00_, n10_, u_1.y), mix(n01_, n11_, u_1.y), u_1.z);
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    var out: VsOut;

    let _e5 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].worldFromLocal;
    let world = (_e5 * vec4<f32>(in.pos, 1f));
    let _e14 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e14 * world);
    out.localPos = in.pos;
    let _e18 = out;
    return _e18;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    let t = u.time;
    let h = clamp((in_1.localPos.y + 0.5f), 0f, 1f);
    let lat = (length(vec2<f32>(in_1.localPos.x, in_1.localPos.z)) * 2f);
    let latMask = exp((-(lat) * 2.2f));
    let _e37 = noise3_(vec3<f32>((in_1.localPos.x * 5f), ((h * 4f) - (t * 2.5f)), (in_1.localPos.z * 5f)));
    let flick = (0.7f + (0.3f * _e37));
    let heat = pow((1f - h), 1.4f);
    let mask = clamp(((heat * (0.85f + (0.4f * _e37))) - 0.05f), 0f, 1f);
    let _e58 = u.baseColor;
    let coolTip = (_e58.xyz * 0.5f);
    let _e64 = u.baseColor;
    let hot = (_e64.xyz * 1.4f);
    let col = mix(coolTip, hot, heat);
    let _e75 = u.intensity;
    let amp = ((((mask * latMask) * flick) * 0.9f) * _e75);
    return vec4<f32>((col * amp), amp);
}
