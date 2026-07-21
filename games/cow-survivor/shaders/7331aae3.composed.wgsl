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

struct ShockwaveUniforms {
    baseColor: vec4<f32>,
    progress: f32,
    sharpness: f32,
}

struct VsIn {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
}

struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) localXz: vec2<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(1) @binding(0) 
var<uniform> u: ShockwaveUniforms;

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    var out: VsOut;

    let _e5 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].worldFromLocal;
    let world = (_e5 * vec4<f32>(in.pos, 1f));
    let _e14 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e14 * world);
    out.localXz = vec2<f32>(in.pos.x, in.pos.z);
    let _e22 = out;
    return _e22;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    let r = (length(in_1.localXz) * 2f);
    let lead = u.progress;
    let _e10 = u.sharpness;
    let bandHalf = clamp((1f / max((_e10 * 2f), 2f)), 0.025f, 0.25f);
    let dist = abs((r - lead));
    let ringMask = (1f - smoothstep(0f, bandHalf, dist));
    let fade = (1f - smoothstep(0.7f, 1f, lead));
    let inside = step(r, lead);
    let _e34 = u.baseColor;
    let warm = _e34.xyz;
    let coolShift = vec3<f32>(0.6f, 0.85f, 1f);
    let rgb = mix(mix(warm, coolShift, 0.4f), warm, inside);
    let glow = ((ringMask * fade) * 5.5f);
    return vec4<f32>((rgb * glow), glow);
}
