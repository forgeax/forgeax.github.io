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

struct LightningUniforms {
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
    @location(1) uvOut: vec2<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(1) @binding(0) 
var<uniform> u: LightningUniforms;

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
    let _e27 = hash13_((i + vec3<f32>(0f, 1f, 0f)));
    let _e33 = hash13_((i + vec3<f32>(1f, 1f, 0f)));
    let _e39 = hash13_((i + vec3<f32>(0f, 0f, 1f)));
    let _e45 = hash13_((i + vec3<f32>(1f, 0f, 1f)));
    let _e51 = hash13_((i + vec3<f32>(0f, 1f, 1f)));
    let _e57 = hash13_((i + vec3<f32>(1f, 1f, 1f)));
    let nx00_ = mix(_e15, _e21, u_1.x);
    let nx10_ = mix(_e27, _e33, u_1.x);
    let nx01_ = mix(_e39, _e45, u_1.x);
    let nx11_ = mix(_e51, _e57, u_1.x);
    let nxy0_ = mix(nx00_, nx10_, u_1.y);
    let nxy1_ = mix(nx01_, nx11_, u_1.y);
    return mix(nxy0_, nxy1_, u_1.z);
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    var out: VsOut;

    let _e5 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].worldFromLocal;
    let world = (_e5 * vec4<f32>(in.pos, 1f));
    let _e14 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e14 * world);
    out.localPos = in.pos;
    out.uvOut = in.uv;
    let _e20 = out;
    return _e20;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    let t = u.time;
    let off = (vec2<f32>(in_1.localPos.x, in_1.localPos.y) * 2f);
    let coreDist = length(off);
    let _e23 = noise3_(vec3<f32>(((in_1.localPos.z * 4f) + (t * 6f)), (t * 5f), 0f));
    let strobe = (0.65f + (0.35f * sin(((t * 22f) + (_e23 * 6.28f)))));
    let core = ((exp((-(coreDist) * 9f)) * (0.55f + (0.6f * _e23))) * strobe);
    let halo = ((exp((-(coreDist) * 2.2f)) * 0.3f) * (0.4f + (0.6f * _e23)));
    let glow = (core + halo);
    let _e58 = u.baseColor;
    let _e64 = u.intensity;
    let rgb = (_e58.xyz * ((glow * 5f) * _e64));
    return vec4<f32>(rgb, glow);
}
