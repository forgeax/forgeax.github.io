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

struct MoveClickUniforms {
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
    @location(0) localXZ: vec2<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<uniform> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 128>;
@group(1) @binding(0) 
var<uniform> u: MoveClickUniforms;

fn softBox(p: vec2<f32>, halfSize: vec2<f32>, softness: f32) -> f32 {
    let d = (abs(p) - halfSize);
    let outside = length(max(d, vec2(0f)));
    let inside = min(max(d.x, d.y), 0f);
    return (1f - smoothstep(0f, softness, (outside + inside)));
}

fn hash21_(p_1: vec2<f32>) -> f32 {
    return fract((sin(dot(p_1, vec2<f32>(127.1f, 311.7f))) * 43758.547f));
}

fn chevronPointingRight(p_2: vec2<f32>) -> f32 {
    let pu = vec2<f32>(((p_2.x * 0.78f) + (p_2.y * 0.625f)), ((-(p_2.x) * 0.625f) + (p_2.y * 0.78f)));
    let pl = vec2<f32>(((p_2.x * 0.78f) - (p_2.y * 0.625f)), ((p_2.x * 0.625f) + (p_2.y * 0.78f)));
    let _e38 = softBox((pu - vec2<f32>((-(0.13f) * 0.5f), 0f)), vec2<f32>((0.13f * 0.5f), 0.028f), 0.018f);
    let _e48 = softBox((pl - vec2<f32>((-(0.13f) * 0.5f), 0f)), vec2<f32>((0.13f * 0.5f), 0.028f), 0.018f);
    let _e56 = softBox((p_2 + vec2<f32>(0.01f, 0f)), vec2<f32>(0.028f, 0.022f), 0.018f);
    let _e64 = softBox((p_2 + vec2<f32>(-0.02f, 0f)), vec2<f32>(0.04f, 0.008f), 0.018f);
    let spine = (_e64 * 0.65f);
    return max(max(max(_e38, _e48), _e56), spine);
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    var out: VsOut;

    let _e5 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].worldFromLocal;
    let world = (_e5 * vec4<f32>(in.pos, 1f));
    let _e14 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e14 * world);
    out.localXZ = in.pos.xz;
    let _e19 = out;
    return _e19;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    var rgb: vec3<f32>;

    let p_3 = in_1.localXZ;
    let r = length(p_3);
    if (r > 0.48f) {
        return vec4(0f);
    }
    let _e12 = chevronPointingRight(vec2<f32>((p_3.x + 0.21f), p_3.y));
    let _e18 = chevronPointingRight(vec2<f32>((-(p_3.x) + 0.21f), p_3.y));
    let _e24 = chevronPointingRight(vec2<f32>((p_3.y + 0.21f), -(p_3.x)));
    let _e30 = chevronPointingRight(vec2<f32>((-(p_3.y) + 0.21f), p_3.x));
    let mask = max(max(_e12, _e18), max(_e24, _e30));
    if (mask < 0.02f) {
        return vec4(0f);
    }
    let cell = floor((p_3 * 28f));
    let _e41 = hash21_(cell);
    let _e44 = u.time;
    let emberFlow = (0.55f + (0.45f * sin((((_e44 * 5.5f) + (_e41 * 6.28f)) + (r * 10f)))));
    let hot = (smoothstep(0.35f, 0.95f, mask) * emberFlow);
    let cool = (mask * (1f - (hot * 0.35f)));
    let cDeep = vec3<f32>(0.35f, 0.04f, 0.01f);
    let cLava = vec3<f32>(0.95f, 0.22f, 0.04f);
    let cGold = vec3<f32>(1f, 0.72f, 0.22f);
    let _e81 = u.baseColor;
    let tint = _e81.xyz;
    rgb = mix(cDeep, (cLava * tint), cool);
    let _e86 = rgb;
    rgb = mix(_e86, cGold, (hot * 0.55f));
    let _e92 = u.time;
    let pulse = (0.88f + (0.12f * sin((_e92 * 3.6f))));
    let _e103 = u.intensity;
    let amp = min(((mask * pulse) * _e103), 0.88f);
    let _e107 = rgb;
    return vec4<f32>((_e107 * (0.55f + (amp * 0.7f))), (amp * 0.8f));
}
