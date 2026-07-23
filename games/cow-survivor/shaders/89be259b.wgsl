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

struct IceUniforms {
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
    @location(1) localNormal: vec3<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<uniform> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 128>;
@group(1) @binding(0) 
var<uniform> u: IceUniforms;

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    var out: VsOut;

    let _e5 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].worldFromLocal;
    let world = (_e5 * vec4<f32>(in.pos, 1f));
    let _e14 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e14 * world);
    out.localPos = in.pos;
    out.localNormal = in.normal;
    let _e20 = out;
    return _e20;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    let t = u.time;
    let facing = max(0f, dot(normalize(in_1.localNormal), vec3<f32>(0f, 0.3f, 1f)));
    let stripeCoord = (((in_1.localPos.x * 6f) + (in_1.localPos.y * 4f)) + (t * 2f));
    let stripe = abs(sin((stripeCoord * 3.14f)));
    let stripeMask = smoothstep(0.6f, 0.95f, stripe);
    let edge = (length(in_1.localPos) * 1.6f);
    let halo = (smoothstep(0.6f, 1.2f, edge) * 0.6f);
    let _e43 = u.baseColor;
    let baseTint = (_e43.xyz * (0.55f + (facing * 0.55f)));
    let _e52 = u.baseColor;
    let lineTint = ((_e52.xyz * 1.4f) + vec3<f32>(0.05f, 0.1f, 0.1f));
    let col = mix(baseTint, lineTint, (stripeMask * 0.55f));
    let _e66 = u.baseColor;
    let haloTint = ((_e66.xyz * 0.85f) + vec3<f32>(0f, 0.05f, 0.1f));
    let outRgb = (col + (haloTint * halo));
    let _e83 = u.intensity;
    let amp = (((0.4f + (stripeMask * 0.3f)) * _e83) * 0.5f);
    let a = clamp(((0.55f + halo) + (stripeMask * 0.4f)), 0f, 1f);
    return vec4<f32>((outRgb * amp), a);
}
