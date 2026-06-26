struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct TonemapParams {
    exposure: f32,
    whitePoint: f32,
    mode: u32,
    pad1_: f32,
}

const TONEMAP_LUMINANCE_EPSILON: f32 = 0.00001f;

@group(1) @binding(0) 
var hdr: texture_2d<f32>;
@group(1) @binding(1) 
var samp: sampler;
@group(1) @binding(2) 
var<uniform> params: TonemapParams;

fn fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index_1: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    var x: f32 = -1f;
    var y: f32 = -1f;
    var out: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

    if (vertex_index_1 == 1u) {
        x = 3f;
    }
    if (vertex_index_1 == 2u) {
        y = 3f;
    }
    let _e10 = x;
    let u = ((_e10 + 1f) * 0.5f);
    let _e15 = y;
    let v = (1f - ((_e15 + 1f) * 0.5f));
    let _e24 = x;
    let _e25 = y;
    out.position = vec4<f32>(_e24, _e25, 0f, 1f);
    out.uv = vec2<f32>(u, v);
    let _e31 = out;
    return _e31;
}

fn tonemapReinhardExtended(color: vec3<f32>) -> vec3<f32> {
    let luma = dot(color, vec3<f32>(0.2126f, 0.7152f, 0.0722f));
    let _e8 = params.whitePoint;
    let _e11 = params.whitePoint;
    let lw_sq = (_e8 * _e11);
    let luma_prime = ((luma * (1f + (luma / lw_sq))) / (1f + luma));
    let scale = (luma_prime / max(luma, TONEMAP_LUMINANCE_EPSILON));
    return (color * scale);
}

fn tonemapLinear(color_1: vec3<f32>) -> vec3<f32> {
    return color_1;
}

fn tonemapCineon(color_2: vec3<f32>) -> vec3<f32> {
    let x_1 = max(vec3(0f), (color_2 - vec3(0.004f)));
    return ((x_1 * ((6.2f * x_1) + vec3(0.5f))) / ((x_1 * ((6.2f * x_1) + vec3(1.7f))) + vec3(0.06f)));
}

fn tonemapAcesFilmic(color_3: vec3<f32>) -> vec3<f32> {
    return clamp(((color_3 * ((2.51f * color_3) + vec3(0.03f))) / ((color_3 * ((2.43f * color_3) + vec3(0.59f))) + vec3(0.14f))), vec3(0f), vec3(1f));
}

fn tonemapAgx(color_4: vec3<f32>) -> vec3<f32> {
    let agxMat = mat3x3<f32>(vec3<f32>(0.842479f, 0.0784336f, 0.0792237f), vec3<f32>(0.0423303f, 0.878468f, 0.0791661f), vec3<f32>(0.0423745f, 0.0784336f, 0.879142f));
    let agxMatInv = mat3x3<f32>(vec3<f32>(1.19687f, -0.0980208f, -0.0990297f), vec3<f32>(-0.0528968f, 1.1519f, -0.0989611f), vec3<f32>(-0.0529716f, -0.0980434f, 1.15107f));
    let compressed = (agxMat * color_4);
    let logC = clamp(log2(max(compressed, vec3(0.0000000001f))), vec3(-12.47393f), vec3(4.026069f));
    let normalized = ((logC - vec3(-12.47393f)) / vec3(16.499998f));
    let s = ((normalized * normalized) * (vec3(3f) - (2f * normalized)));
    return (agxMatInv * s);
}

fn tonemapNeutral(color_5: vec3<f32>) -> vec3<f32> {
    let x_2 = min(color_5, vec3(0.76f));
    let over = max((color_5 - vec3(0.76f)), vec3(0f));
    let compressed_1 = (x_2 + (over / (vec3(1f) + over)));
    let luma_1 = dot(compressed_1, vec3<f32>(0.2126f, 0.7152f, 0.0722f));
    return mix(compressed_1, vec3(luma_1), (0.15f * clamp((luma_1 - 0.76f), 0f, 1f)));
}

@vertex 
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index);
    return _e1;
}

@fragment 
fn fs_main(in: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    var mapped: vec3<f32>;

    let _e4 = textureSample(hdr, samp, in.uv);
    let sample = _e4.xyz;
    let _e8 = params.exposure;
    let exposed = (sample * _e8);
    let _e12 = params.mode;
    switch _e12 {
        case 2u: {
            let _e13 = tonemapLinear(exposed);
            mapped = _e13;
        }
        case 3u: {
            let _e15 = tonemapCineon(exposed);
            mapped = _e15;
        }
        case 4u: {
            let _e16 = tonemapAcesFilmic(exposed);
            mapped = _e16;
        }
        case 5u: {
            let _e17 = tonemapAgx(exposed);
            mapped = _e17;
        }
        case 6u: {
            let _e18 = tonemapNeutral(exposed);
            mapped = _e18;
        }
        default: {
            let _e19 = tonemapReinhardExtended(exposed);
            mapped = _e19;
        }
    }
    let _e20 = mapped;
    return vec4<f32>(_e20, 1f);
}
