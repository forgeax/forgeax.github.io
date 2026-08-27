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
    temporalCurrentViewProj: mat4x4<f32>,
    temporalPreviousViewProj: mat4x4<f32>,
    temporalProjection: vec4<f32>,
}

struct MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    worldFromLocal: mat4x4<f32>,
    normalMatrix: mat3x3<f32>,
}

struct FrostImpactUniforms {
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
    @location(0) worldPos: vec3<f32>,
    @location(1) worldNrm: vec3<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<uniform> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 128>;
@group(1) @binding(0) 
var<uniform> u: FrostImpactUniforms;

fn hash3_(p: vec3<f32>) -> f32 {
    return fract((sin(dot(p, vec3<f32>(91.7f, 173.3f, 53.1f))) * 43758.547f));
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    var out: VsOut;

    let m = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].worldFromLocal;
    let world = (m * vec4<f32>(in.pos, 1f));
    let _e14 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e14 * world);
    out.worldPos = world.xyz;
    out.worldNrm = normalize((m * vec4<f32>(in.normal, 0f)).xyz);
    let _e25 = out;
    return _e25;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    let n = normalize(in_1.worldNrm);
    let _e5 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let v = normalize((_e5 - in_1.worldPos));
    let facing = clamp(dot(n, v), 0f, 1f);
    let _e17 = u.time;
    let ring = abs(sin(((facing * 12f) - (_e17 * 14f))));
    let _e27 = u.time;
    let _e32 = u.time;
    let _e39 = hash3_(floor(((n * 7f) + vec3<f32>((_e27 * 6f), 0f, (_e32 * 3f)))));
    let _e56 = u.intensity;
    let amp = ((((0.35f + ((0.7f * facing) * facing)) + ((0.2f * ring) * facing)) * (0.85f + (0.25f * _e39))) * _e56);
    let ampSafe = min(amp, 1.05f);
    let alpha = (clamp((facing * 1.8f), 0f, 1f) * clamp(ampSafe, 0f, 1f));
    let _e71 = u.baseColor;
    let rgb = (_e71.xyz * ampSafe);
    return vec4<f32>(rgb, alpha);
}
