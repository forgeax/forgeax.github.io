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

fn linearToSrgbOetfX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(color: vec3<f32>) -> vec3<f32> {
    let safe = max(color, vec3(0f));
    let high = ((pow(safe, vec3(0.41666f)) * vec3(1.055f)) - vec3(0.055f));
    let low = (safe * vec3(12.92f));
    return select(high, low, (safe <= vec3(0.0031308f)));
}

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

fn tonemapReinhardExtended(color_1: vec3<f32>) -> vec3<f32> {
    let luma = dot(color_1, vec3<f32>(0.2126f, 0.7152f, 0.0722f));
    let _e8 = params.whitePoint;
    let _e11 = params.whitePoint;
    let lw_sq = (_e8 * _e11);
    let luma_prime = ((luma * (1f + (luma / lw_sq))) / (1f + luma));
    let scale = (luma_prime / max(luma, TONEMAP_LUMINANCE_EPSILON));
    return (color_1 * scale);
}

fn tonemapLinear(color_2: vec3<f32>) -> vec3<f32> {
    return clamp(color_2, vec3(0f), vec3(1f));
}

fn tonemapReinhard(color_3: vec3<f32>) -> vec3<f32> {
    return clamp((color_3 / (color_3 + vec3(1f))), vec3(0f), vec3(1f));
}

fn tonemapCineon(color_4: vec3<f32>) -> vec3<f32> {
    let x_2 = max((color_4 - vec3(0.004f)), vec3(0f));
    let a = (x_2 * ((6.2f * x_2) + vec3(0.5f)));
    let b = ((x_2 * ((6.2f * x_2) + vec3(1.7f))) + vec3(0.06f));
    return pow((a / b), vec3(2.2f));
}

fn acesInput(color_5: vec3<f32>) -> vec3<f32> {
    return vec3<f32>(dot(vec3<f32>(0.59719f, 0.35458f, 0.04823f), color_5), dot(vec3<f32>(0.076f, 0.90834f, 0.01566f), color_5), dot(vec3<f32>(0.0284f, 0.13383f, 0.83777f), color_5));
}

fn acesOutput(color_6: vec3<f32>) -> vec3<f32> {
    return vec3<f32>(dot(vec3<f32>(1.60475f, -0.53108f, -0.07367f), color_6), dot(vec3<f32>(-0.10208f, 1.10813f, -0.00605f), color_6), dot(vec3<f32>(-0.00327f, -0.07276f, 1.07602f), color_6));
}

fn tonemapAcesFilmic(color_7: vec3<f32>) -> vec3<f32> {
    let _e4 = acesInput((color_7 / vec3(0.6f)));
    let a_1 = ((_e4 * (_e4 + vec3(0.0245786f))) - vec3(0.000090537f));
    let b_1 = ((_e4 * ((_e4 + vec3(0.432951f)) * vec3(0.983729f))) + vec3(0.238081f));
    let _e23 = acesOutput((a_1 / b_1));
    return clamp(_e23, vec3(0f), vec3(1f));
}

fn rec2020FromSrgb(color_8: vec3<f32>) -> vec3<f32> {
    return vec3<f32>(dot(vec3<f32>(0.6274f, 0.3293f, 0.0433f), color_8), dot(vec3<f32>(0.0691f, 0.9195f, 0.0113f), color_8), dot(vec3<f32>(0.0164f, 0.088f, 0.8956f), color_8));
}

fn srgbFromRec2020_(color_9: vec3<f32>) -> vec3<f32> {
    return vec3<f32>(dot(vec3<f32>(1.6605f, -0.5876f, -0.0728f), color_9), dot(vec3<f32>(-0.1246f, 1.1329f, -0.0083f), color_9), dot(vec3<f32>(-0.0182f, -0.1006f, 1.1187f), color_9));
}

fn agxContrastApprox(x_1: vec3<f32>) -> vec3<f32> {
    let x2_ = (x_1 * x_1);
    let x4_ = (x2_ * x2_);
    return ((((((((15.5f * x4_) * x2_) - ((40.14f * x4_) * x_1)) + (31.96f * x4_)) - ((6.868f * x2_) * x_1)) + (0.4298f * x2_)) + (0.1191f * x_1)) - vec3(0.00232f));
}

fn agxInset(color_10: vec3<f32>) -> vec3<f32> {
    return vec3<f32>(dot(vec3<f32>(0.85662717f, 0.09512124f, 0.048251607f), color_10), dot(vec3<f32>(0.13731897f, 0.761242f, 0.10143904f), color_10), dot(vec3<f32>(0.11189821f, 0.076799415f, 0.81130236f), color_10));
}

fn agxOutset(color_11: vec3<f32>) -> vec3<f32> {
    return vec3<f32>(dot(vec3<f32>(1.1271006f, -0.11060664f, -0.016493939f), color_11), dot(vec3<f32>(-0.14132977f, 1.1578237f, -0.016493939f), color_11), dot(vec3<f32>(-0.14132977f, -0.11060664f, 1.2519364f), color_11));
}

fn tonemapAgx(color_12: vec3<f32>) -> vec3<f32> {
    let _e1 = rec2020FromSrgb(color_12);
    let _e2 = agxInset(_e1);
    let log_color = log2(max(_e2, vec3(0.0000000001f)));
    let normalized = clamp(((log_color - vec3(-12.47393f)) / vec3((4.026069f - -12.47393f))), vec3(0f), vec3(1f));
    let _e19 = agxContrastApprox(normalized);
    let _e20 = agxOutset(_e19);
    let encoded = pow(max(_e20, vec3(0f)), vec3(2.2f));
    let _e27 = srgbFromRec2020_(encoded);
    return clamp(_e27, vec3(0f), vec3(1f));
}

fn tonemapNeutral(color_13: vec3<f32>) -> vec3<f32> {
    var compressed: vec3<f32>;

    let x_3 = min(color_13.x, min(color_13.y, color_13.z));
    let offset = select(0.04f, (x_3 - ((6.25f * x_3) * x_3)), (x_3 < 0.08f));
    compressed = (color_13 - vec3(offset));
    let _e18 = compressed.x;
    let _e20 = compressed.y;
    let _e22 = compressed.z;
    let peak = max(_e18, max(_e20, _e22));
    if (peak < 0.76f) {
        let _e27 = compressed;
        return _e27;
    }
    let d = (1f - 0.76f);
    let new_peak = (1f - ((d * d) / ((peak + d) - 0.76f)));
    let _e36 = compressed;
    compressed = (_e36 * (new_peak / peak));
    let g = (1f - (1f / ((0.15f * (peak - new_peak)) + 1f)));
    let _e48 = compressed;
    return mix(_e48, vec3(new_peak), g);
}

@vertex 
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index);
    return _e1;
}

@fragment 
fn fs_main(in: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    var mapped: vec3<f32>;

    let source = textureSample(hdr, samp, in.uv);
    let sample = source.xyz;
    let _e8 = params.exposure;
    let exposed = (sample * _e8);
    let _e12 = params.mode;
    switch _e12 {
        case 1u: {
            let _e13 = tonemapReinhardExtended(exposed);
            mapped = _e13;
        }
        case 2u: {
            let _e15 = tonemapLinear(exposed);
            mapped = _e15;
        }
        case 3u: {
            let _e16 = tonemapCineon(exposed);
            mapped = _e16;
        }
        case 4u: {
            let _e17 = tonemapAcesFilmic(exposed);
            mapped = _e17;
        }
        case 5u: {
            let _e18 = tonemapAgx(exposed);
            mapped = _e18;
        }
        case 6u: {
            let _e19 = tonemapNeutral(exposed);
            mapped = _e19;
        }
        case 7u: {
            let _e20 = tonemapReinhard(exposed);
            mapped = _e20;
        }
        default: {
            mapped = sample;
        }
    }
    let _e21 = mapped;
    let _e22 = linearToSrgbOetfX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(_e21);
    return vec4<f32>(_e22, source.w);
}
