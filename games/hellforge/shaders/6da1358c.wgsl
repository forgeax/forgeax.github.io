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
    previousWorldFromLocal: mat4x4<f32>,
    temporal: vec4<f32>,
}

struct SpriteUniforms {
    baseColor: vec4<f32>,
    frame: f32,
    frames: f32,
    cols: f32,
    rows: f32,
    billboard: f32,
    distort: f32,
    time: f32,
    erosion: f32,
    blendFrames: f32,
}

struct VsIn {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
}

struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(1) @binding(0) 
var<uniform> u: SpriteUniforms;
@group(1) @binding(1) 
var sheetSampler: sampler;
@group(1) @binding(2) 
var sheet: texture_2d<f32>;
@group(1) @binding(3) 
var noiseSampler: sampler;
@group(1) @binding(4) 
var noiseTex: texture_2d<f32>;

fn cellUv(uv_1: vec2<f32>, frame: f32) -> vec2<f32> {
    let _e2 = u.frames;
    let total = max(_e2, 1f);
    let _e7 = u.cols;
    let cols = max(_e7, 1f);
    let _e12 = u.rows;
    let rows = max(_e12, 1f);
    let f = (floor(frame) - (floor((floor(frame) / total)) * total));
    let col = (f - (floor((f / cols)) * cols));
    let row = floor((f / cols));
    return ((uv_1 + vec2<f32>(col, row)) / vec2<f32>(cols, rows));
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    var world: vec4<f32>;
    var right: vec3<f32> = vec3<f32>(1f, 0f, 0f);
    var upRef: vec3<f32> = vec3<f32>(0f, 1f, 0f);
    var out: VsOut;

    let m = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].worldFromLocal;
    let _e11 = u.billboard;
    if (_e11 < 0.5f) {
        world = (m * vec4<f32>(in.pos, 1f));
    } else {
        let anchor = m[3].xyz;
        let scale = length(m[0].xyz);
        let _e27 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
        let toCam = (_e27 - anchor);
        let dist = length(toCam);
        if (dist < 0.0001f) {
            world = (m * vec4<f32>(in.pos, 1f));
        } else {
            let fwd = (toCam / vec3(dist));
            let _e40 = u.billboard;
            if (_e40 > 1.5f) {
                let fh = vec3<f32>(fwd.x, 0f, fwd.z);
                if (length(fh) > 0.0001f) {
                    right = normalize(cross(vec3<f32>(0f, 1f, 0f), normalize(fh)));
                }
                let _e58 = right;
                world = vec4<f32>((anchor + (((_e58 * in.pos.x) + (vec3<f32>(0f, 1f, 0f) * in.pos.y)) * scale)), 1f);
            } else {
                if (abs(fwd.y) > 0.999f) {
                    upRef = vec3<f32>(0f, 0f, 1f);
                }
                let _e83 = upRef;
                let right_1 = normalize(cross(_e83, fwd));
                let up = cross(fwd, right_1);
                world = vec4<f32>((anchor + (((right_1 * in.pos.x) + (up * in.pos.y)) * scale)), 1f);
            }
        }
    }
    let _e102 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    let _e103 = world;
    out.clip = (_e102 * _e103);
    out.uv = in.uv;
    let _e107 = out;
    return _e107;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    var uv: vec2<f32>;
    var tex: vec4<f32>;
    var local: bool;
    var a: f32;

    uv = in_1.uv;
    let _e5 = u.distort;
    if (_e5 > 0f) {
        let _e8 = uv;
        let _e11 = u.time;
        let _e21 = textureSample(noiseTex, noiseSampler, (_e8 + vec2<f32>(0f, (0f - (_e11 * 0.9f)))));
        let n1_ = _e21.x;
        let _e23 = uv;
        let _e28 = u.time;
        let _e38 = textureSample(noiseTex, noiseSampler, ((_e23 * 2f) + vec2<f32>(0.37f, (0f - (_e28 * 1.7f)))));
        let n2_ = _e38.x;
        let _e41 = uv.y;
        let verticalMask = (1f - _e41);
        let _e44 = uv;
        let _e52 = u.distort;
        uv = (_e44 + (((vec2<f32>(n1_, n2_) - vec2<f32>(0.5f, 0.5f)) * _e52) * verticalMask));
    }
    let _e58 = u.frame;
    let _e61 = u.frames;
    let frame0_ = clamp(_e58, 0f, max((_e61 - 1f), 0f));
    let _e68 = uv;
    let _e69 = cellUv(_e68, frame0_);
    let _e72 = textureSample(sheet, sheetSampler, _e69);
    tex = _e72;
    let _e76 = u.blendFrames;
    if (_e76 > 0.5f) {
        let _e81 = u.frames;
        local = (_e81 > 1f);
    } else {
        local = false;
    }
    let _e87 = local;
    if _e87 {
        let _e90 = u.frames;
        let total_1 = max(_e90, 1f);
        let f1_ = ((floor(frame0_) + 1f) - (floor(((floor(frame0_) + 1f) / total_1)) * total_1));
        let _e103 = uv;
        let _e104 = cellUv(_e103, f1_);
        let tex1_ = textureSample(sheet, sheetSampler, _e104);
        let _e108 = tex;
        tex = mix(_e108, tex1_, fract(frame0_));
    }
    let _e112 = tex.w;
    a = _e112;
    let _e116 = u.erosion;
    if (_e116 > 0f) {
        let _e119 = a;
        let _e122 = u.erosion;
        let _e126 = u.erosion;
        a = clamp(((_e119 - _e122) / max((1f - _e126), 0.001f)), 0f, 1f);
    }
    let _e135 = a;
    let _e139 = u.baseColor.w;
    a = (_e135 * _e139);
    let _e143 = u.baseColor;
    let _e145 = tex;
    let _e148 = a;
    let _e150 = a;
    return vec4<f32>(((_e143.xyz * _e145.xyz) * _e148), _e150);
}
