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

struct FireballUniforms {
    baseColor: vec4<f32>,
    progress: f32,
    turbulence: f32,
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
var<uniform> u: FireballUniforms;

fn hash13_(p: vec3<f32>) -> f32 {
    let q = fract((p * 0.1031f));
    let r = (q + vec3(dot(q, (q.yzx + vec3(33.33f)))));
    return fract(((r.x + r.y) * r.z));
}

fn noise3_(p_1: vec3<f32>) -> f32 {
    let i_1 = floor(p_1);
    let f = fract(p_1);
    let u_1 = ((f * f) * (vec3(3f) - (2f * f)));
    let _e15 = hash13_((i_1 + vec3<f32>(0f, 0f, 0f)));
    let _e21 = hash13_((i_1 + vec3<f32>(1f, 0f, 0f)));
    let n00_ = mix(_e15, _e21, u_1.x);
    let _e29 = hash13_((i_1 + vec3<f32>(0f, 1f, 0f)));
    let _e35 = hash13_((i_1 + vec3<f32>(1f, 1f, 0f)));
    let n10_ = mix(_e29, _e35, u_1.x);
    let _e43 = hash13_((i_1 + vec3<f32>(0f, 0f, 1f)));
    let _e49 = hash13_((i_1 + vec3<f32>(1f, 0f, 1f)));
    let n01_ = mix(_e43, _e49, u_1.x);
    let _e57 = hash13_((i_1 + vec3<f32>(0f, 1f, 1f)));
    let _e63 = hash13_((i_1 + vec3<f32>(1f, 1f, 1f)));
    let n11_ = mix(_e57, _e63, u_1.x);
    return mix(mix(n00_, n10_, u_1.y), mix(n01_, n11_, u_1.y), u_1.z);
}

fn fbm(p_2: vec3<f32>) -> f32 {
    var v: f32 = 0f;
    var amp: f32 = 0.5f;
    var freq: f32 = 1f;
    var i: u32 = 0u;

    loop {
        let _e5 = i;
        if (_e5 < 3u) {
        } else {
            break;
        }
        {
            let _e12 = v;
            let _e13 = amp;
            let _e14 = freq;
            let _e16 = noise3_((p_2 * _e14));
            v = (_e12 + (_e13 * _e16));
            let _e19 = freq;
            freq = (_e19 * 2f);
            let _e22 = amp;
            amp = (_e22 * 0.5f);
        }
        continuing {
            let _e25 = i;
            i = (_e25 + 1u);
        }
    }
    let _e28 = v;
    return _e28;
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
    let t = u.progress;
    let r_1 = (length(in_1.localPos) * 2f);
    let grow = mix(0.05f, 1f, smoothstep(0f, 0.45f, t));
    let edge = (1f - smoothstep((grow * 0.8f), grow, r_1));
    let coreHeat = (pow((1f - r_1), 1.6f) * (1f - smoothstep(0.4f, 1f, t)));
    let _e32 = u.turbulence;
    let _e44 = fbm((((in_1.localPos * _e32) * 4f) + vec3<f32>((t * 3f), (t * 1.5f), (t * 2f))));
    let intensity = ((((coreHeat * 1.8f) + 0.4f) * (0.6f + (0.8f * _e44))) * edge);
    let _e57 = u.baseColor;
    let warm = (_e57.xyz * 0.7f);
    let _e63 = u.baseColor;
    let bright = ((_e63.xyz * 1.4f) + vec3<f32>(0.05f, 0.05f, 0f));
    let col = mix(warm, bright, smoothstep(0.4f, 1.4f, (coreHeat * 1.5f)));
    let fade = (1f - smoothstep(0.55f, 1f, t));
    let amp_1 = ((intensity * fade) * 1.4f);
    return vec4<f32>((col * amp_1), amp_1);
}
