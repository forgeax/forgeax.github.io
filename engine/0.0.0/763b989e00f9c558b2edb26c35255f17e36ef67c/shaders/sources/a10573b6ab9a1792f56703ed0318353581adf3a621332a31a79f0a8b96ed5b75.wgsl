struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct BloomDownsampleParams {
    threshold: f32,
    softKnee: f32,
    destinationW: f32,
    destinationH: f32,
    level: f32,
    pad0_: f32,
    pad1_: f32,
    pad2_: f32,
}

const REC709_LUMA: vec3<f32> = vec3<f32>(0.2126f, 0.7152f, 0.0722f);

@group(0) @binding(0) 
var src: texture_2d<f32>;
@group(0) @binding(1) 
var samp: sampler;
@group(0) @binding(2) 
var<uniform> params: BloomDownsampleParams;

fn clampLinearHdrX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(color: vec3<f32>) -> vec3<f32> {
    return clamp(color, vec3(0f), vec3(65504f));
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

fn extractBloom(color_1: vec3<f32>) -> vec3<f32> {
    let c = max(color_1, vec3(0f));
    let luma = min(max(dot(c, REC709_LUMA), 0f), 65504f);
    let threshold = params.threshold;
    if (threshold == 0f) {
        return c;
    }
    let _e17 = params.softKnee;
    let knee = (threshold * _e17);
    if (knee == 0f) {
        return ((c * max((luma - threshold), 0f)) / vec3(max(luma, 0.000001f)));
    }
    let q = clamp((luma + (knee - threshold)), 0f, (2f * knee));
    let soft = ((q * q) / (4f * knee));
    let response = max((luma - threshold), soft);
    return ((c * response) / vec3(max(luma, 0.000001f)));
}

fn loadCoveredAverage(pixel: vec2<u32>) -> vec3<f32> {
    var sum: vec3<f32> = vec3(0f);
    var coverage: f32 = 0f;
    var y_1: i32;
    var x_1: i32;

    let _e3 = textureDimensions(src);
    let sourceSize = vec2<f32>(_e3);
    let _e7 = params.destinationW;
    let _e10 = params.destinationH;
    let destinationSize = vec2<f32>(_e7, _e10);
    let sourceMin = ((vec2<f32>(pixel) * sourceSize) / destinationSize);
    let sourceMax = ((vec2<f32>((pixel + vec2(1u))) * sourceSize) / destinationSize);
    let first = vec2<i32>(floor(sourceMin));
    let last = vec2<i32>(ceil(sourceMax));
    y_1 = first.y;
    loop {
        let _e28 = y_1;
        if (_e28 < last.y) {
        } else {
            break;
        }
        {
            x_1 = first.x;
            loop {
                let _e33 = x_1;
                if (_e33 < last.x) {
                } else {
                    break;
                }
                {
                    let _e36 = x_1;
                    let _e38 = y_1;
                    let texelMin = vec2<f32>(f32(_e36), f32(_e38));
                    let texelMax = (texelMin + vec2(1f));
                    let overlapMin = max(sourceMin, texelMin);
                    let overlapMax = min(sourceMax, texelMax);
                    let weight = (max((overlapMax.x - overlapMin.x), 0f) * max((overlapMax.y - overlapMin.y), 0f));
                    if (weight > 0f) {
                        let _e60 = sum;
                        let _e61 = x_1;
                        let _e62 = y_1;
                        let _e66 = textureLoad(src, vec2<i32>(_e61, _e62), 0i);
                        let _e68 = extractBloom(_e66.xyz);
                        sum = (_e60 + (_e68 * weight));
                        let _e72 = coverage;
                        coverage = (_e72 + weight);
                    }
                }
                continuing {
                    let _e74 = x_1;
                    x_1 = (_e74 + 1i);
                }
            }
        }
        continuing {
            let _e77 = y_1;
            y_1 = (_e77 + 1i);
        }
    }
    let _e80 = sum;
    let _e81 = coverage;
    let _e86 = clampLinearHdrX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX((_e80 / vec3(max(_e81, 0.000001f))));
    return _e86;
}

fn fixedDownsample(uv: vec2<f32>) -> vec3<f32> {
    var result_1: vec3<f32>;

    let _e1 = textureDimensions(src);
    let sourceTexel = (vec2(1f) / vec2<f32>(_e1));
    let _e10 = textureSampleLevel(src, samp, uv, 0f);
    result_1 = (_e10.xyz * 0.125f);
    let _e15 = result_1;
    let _e24 = textureSampleLevel(src, samp, (uv + (vec2<f32>(2f, 0f) * sourceTexel)), 0f);
    result_1 = (_e15 + (_e24.xyz * 0.0625f));
    let _e29 = result_1;
    let _e38 = textureSampleLevel(src, samp, (uv + (vec2<f32>(-2f, 0f) * sourceTexel)), 0f);
    result_1 = (_e29 + (_e38.xyz * 0.0625f));
    let _e43 = result_1;
    let _e52 = textureSampleLevel(src, samp, (uv + (vec2<f32>(0f, 2f) * sourceTexel)), 0f);
    result_1 = (_e43 + (_e52.xyz * 0.0625f));
    let _e57 = result_1;
    let _e66 = textureSampleLevel(src, samp, (uv + (vec2<f32>(0f, -2f) * sourceTexel)), 0f);
    result_1 = (_e57 + (_e66.xyz * 0.0625f));
    let _e71 = result_1;
    let _e80 = textureSampleLevel(src, samp, (uv + (vec2<f32>(2f, 2f) * sourceTexel)), 0f);
    result_1 = (_e71 + (_e80.xyz * 0.03125f));
    let _e85 = result_1;
    let _e94 = textureSampleLevel(src, samp, (uv + (vec2<f32>(-2f, 2f) * sourceTexel)), 0f);
    result_1 = (_e85 + (_e94.xyz * 0.03125f));
    let _e99 = result_1;
    let _e108 = textureSampleLevel(src, samp, (uv + (vec2<f32>(2f, -2f) * sourceTexel)), 0f);
    result_1 = (_e99 + (_e108.xyz * 0.03125f));
    let _e113 = result_1;
    let _e122 = textureSampleLevel(src, samp, (uv + (vec2<f32>(-2f, -2f) * sourceTexel)), 0f);
    result_1 = (_e113 + (_e122.xyz * 0.03125f));
    let _e127 = result_1;
    let _e136 = textureSampleLevel(src, samp, (uv + (vec2<f32>(1f, 1f) * sourceTexel)), 0f);
    result_1 = (_e127 + (_e136.xyz * 0.125f));
    let _e141 = result_1;
    let _e150 = textureSampleLevel(src, samp, (uv + (vec2<f32>(-1f, 1f) * sourceTexel)), 0f);
    result_1 = (_e141 + (_e150.xyz * 0.125f));
    let _e155 = result_1;
    let _e164 = textureSampleLevel(src, samp, (uv + (vec2<f32>(1f, -1f) * sourceTexel)), 0f);
    result_1 = (_e155 + (_e164.xyz * 0.125f));
    let _e169 = result_1;
    let _e178 = textureSampleLevel(src, samp, (uv + (vec2<f32>(-1f, -1f) * sourceTexel)), 0f);
    result_1 = (_e169 + (_e178.xyz * 0.125f));
    let _e183 = result_1;
    return _e183;
}

@vertex 
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index);
    return _e1;
}

@fragment 
fn fs_main(in: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    var result: vec3<f32>;

    let pixel_1 = vec2<u32>(in.position.xy);
    let _e6 = params.level;
    let isD0_ = (_e6 == 0f);
    if isD0_ {
        let _e9 = loadCoveredAverage(pixel_1);
        result = _e9;
    } else {
        let _e12 = fixedDownsample(in.uv);
        result = _e12;
    }
    let _e13 = result;
    let _e14 = clampLinearHdrX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(_e13);
    return vec4<f32>(_e14, 1f);
}
