struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct FxaaParams {
    ditherEnabled: f32,
    _pad0_: f32,
    _pad1_: f32,
    _pad2_: f32,
}

const EDGE_THRESHOLD_MIN: f32 = 0.0312f;
const EDGE_THRESHOLD_MAX: f32 = 0.125f;
const SUBPIXEL_QUALITY: f32 = 0.75f;
const ITERATIONS: i32 = 12i;

@group(0) @binding(0) 
var screenTexture: texture_2d<f32>;
@group(0) @binding(1) 
var samp: sampler;
@group(0) @binding(2) 
var<uniform> params: FxaaParams;

fn hash32X_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(value: u32) -> u32 {
    var hash: u32;

    hash = value;
    let _e2 = hash;
    let _e5 = hash;
    hash = ((_e2 ^ 61u) ^ (_e5 >> 16u));
    let _e9 = hash;
    let _e10 = hash;
    hash = (_e9 + (_e10 << 3u));
    let _e14 = hash;
    let _e15 = hash;
    hash = (_e14 ^ (_e15 >> 4u));
    let _e19 = hash;
    hash = (_e19 * 668265261u);
    let _e22 = hash;
    let _e23 = hash;
    hash = (_e22 ^ (_e23 >> 15u));
    let _e27 = hash;
    return _e27;
}

fn ditherNoiseX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(pixelPosition: vec2<f32>) -> f32 {
    let pixel = vec2<u32>(pixelPosition);
    let seed = (((pixel.x * 1973u) ^ (pixel.y * 9277u)) ^ 89173u);
    let _e11 = hash32X_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(seed);
    return (f32((_e11 & 1023u)) / 1023f);
}

fn ditherUnorm8X_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(value_1: vec3<f32>, pixelPosition_1: vec2<f32>) -> vec3<f32> {
    var shift: vec3<f32> = vec3<f32>(0.0009803922f, -0.0009803922f, 0.0009803922f);

    let _e4 = ditherNoiseX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(pixelPosition_1);
    let _e6 = shift;
    let _e9 = shift;
    shift = mix((2f * _e6), (-2f * _e9), _e4);
    let _e14 = shift;
    return clamp((value_1 + _e14), vec3(0f), vec3(1f));
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

fn rgb2luma(rgb: vec3<f32>) -> f32 {
    return sqrt(dot(rgb, vec3<f32>(0.299f, 0.587f, 0.114f)));
}

fn sampleColor(uv: vec2<f32>) -> vec3<f32> {
    let _e4 = textureSampleLevel(screenTexture, samp, uv, 0f);
    return _e4.xyz;
}

fn sampleLuma(uv_1: vec2<f32>) -> f32 {
    let _e4 = textureSampleLevel(screenTexture, samp, uv_1, 0f);
    let _e6 = rgb2luma(_e4.xyz);
    return _e6;
}

fn qualityStep(i_1: i32) -> f32 {
    if (i_1 < 5i) {
        return 1f;
    }
    if (i_1 == 5i) {
        return 1.5f;
    }
    if (i_1 < 10i) {
        return 2f;
    }
    if (i_1 == 10i) {
        return 4f;
    }
    return 8f;
}

@vertex 
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index);
    return _e1;
}

@fragment 
fn fs_main(in: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    var stepLength: f32;
    var lumaLocalAverage: f32 = 0f;
    var currentUv: vec2<f32>;
    var uv1_: vec2<f32>;
    var uv2_: vec2<f32>;
    var lumaEnd1_: f32;
    var lumaEnd2_: f32;
    var reached1_: bool;
    var reached2_: bool;
    var local: bool;
    var reachedBoth: bool;
    var i: i32 = 1i;
    var local_1: bool;
    var local_2: bool;
    var finalUv: vec2<f32>;

    let _e3 = textureDimensions(screenTexture);
    let dims = vec2<f32>(_e3);
    let inverseScreenSize = (vec2(1f) / dims);
    let uv_2 = in.uv;
    let _e10 = sampleColor(uv_2);
    let _e11 = rgb2luma(_e10);
    let _e17 = sampleLuma((uv_2 + (vec2<f32>(0f, 1f) * inverseScreenSize)));
    let _e23 = sampleLuma((uv_2 + (vec2<f32>(0f, -1f) * inverseScreenSize)));
    let _e29 = sampleLuma((uv_2 + (vec2<f32>(-1f, 0f) * inverseScreenSize)));
    let _e35 = sampleLuma((uv_2 + (vec2<f32>(1f, 0f) * inverseScreenSize)));
    let lumaMin = min(_e11, min(min(_e17, _e23), min(_e29, _e35)));
    let lumaMax = max(_e11, max(max(_e17, _e23), max(_e29, _e35)));
    let lumaRange = (lumaMax - lumaMin);
    if (lumaRange < max(EDGE_THRESHOLD_MIN, (lumaMax * EDGE_THRESHOLD_MAX))) {
        let _e52 = ditherUnorm8X_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(_e10, in.position.xy);
        let _e55 = params.ditherEnabled;
        return vec4<f32>(select(_e10, _e52, (_e55 > 0.5f)), 1f);
    }
    let _e66 = sampleLuma((uv_2 + (vec2<f32>(-1f, 1f) * inverseScreenSize)));
    let _e72 = sampleLuma((uv_2 + (vec2<f32>(1f, -1f) * inverseScreenSize)));
    let _e78 = sampleLuma((uv_2 + (vec2<f32>(-1f, -1f) * inverseScreenSize)));
    let _e84 = sampleLuma((uv_2 + (vec2<f32>(1f, 1f) * inverseScreenSize)));
    let lumaDownUp = (_e17 + _e23);
    let lumaLeftRight = (_e29 + _e35);
    let lumaLeftCorners = (_e66 + _e78);
    let lumaDownCorners = (_e66 + _e84);
    let lumaRightCorners = (_e84 + _e72);
    let lumaUpCorners = (_e72 + _e78);
    let edgeHorizontal = ((abs(((-2f * _e29) + lumaLeftCorners)) + (abs(((-2f * _e11) + lumaDownUp)) * 2f)) + abs(((-2f * _e35) + lumaRightCorners)));
    let edgeVertical = ((abs(((-2f * _e23) + lumaUpCorners)) + (abs(((-2f * _e11) + lumaLeftRight)) * 2f)) + abs(((-2f * _e17) + lumaDownCorners)));
    let isHorizontal = (edgeHorizontal >= edgeVertical);
    let luma1_ = select(_e29, _e17, isHorizontal);
    let luma2_ = select(_e35, _e23, isHorizontal);
    let gradient1_ = (luma1_ - _e11);
    let gradient2_ = (luma2_ - _e11);
    let is1Steepest = (abs(gradient1_) >= abs(gradient2_));
    let gradientScaled = (0.25f * max(abs(gradient1_), abs(gradient2_)));
    stepLength = select(inverseScreenSize.x, inverseScreenSize.y, isHorizontal);
    if is1Steepest {
        let _e140 = stepLength;
        stepLength = -(_e140);
        lumaLocalAverage = (0.5f * (luma1_ + _e11));
    } else {
        lumaLocalAverage = (0.5f * (luma2_ + _e11));
    }
    currentUv = uv_2;
    if isHorizontal {
        let _e151 = currentUv.y;
        let _e152 = stepLength;
        currentUv.y = (_e151 + (_e152 * 0.5f));
    } else {
        let _e157 = currentUv.x;
        let _e158 = stepLength;
        currentUv.x = (_e157 + (_e158 * 0.5f));
    }
    let _e162 = stepLength;
    let _e165 = stepLength;
    let offsetStep = select(vec2<f32>(_e162, 0f), vec2<f32>(0f, _e165), isHorizontal);
    let edgeStep = select(vec2<f32>(0f, inverseScreenSize.y), vec2<f32>(inverseScreenSize.x, 0f), isHorizontal);
    let _e176 = currentUv;
    uv1_ = (_e176 - edgeStep);
    let _e179 = currentUv;
    uv2_ = (_e179 + edgeStep);
    let _e182 = uv1_;
    let _e183 = sampleLuma(_e182);
    let _e184 = lumaLocalAverage;
    lumaEnd1_ = (_e183 - _e184);
    let _e187 = uv2_;
    let _e188 = sampleLuma(_e187);
    let _e189 = lumaLocalAverage;
    lumaEnd2_ = (_e188 - _e189);
    let _e192 = lumaEnd1_;
    reached1_ = (abs(_e192) >= gradientScaled);
    let _e196 = lumaEnd2_;
    reached2_ = (abs(_e196) >= gradientScaled);
    let _e200 = reached1_;
    if _e200 {
        let _e201 = reached2_;
        local = _e201;
    } else {
        local = false;
    }
    let _e205 = local;
    reachedBoth = _e205;
    let _e207 = reached1_;
    if !(_e207) {
        let _e209 = uv1_;
        uv1_ = (_e209 - edgeStep);
    }
    let _e211 = reached2_;
    if !(_e211) {
        let _e213 = uv2_;
        uv2_ = (_e213 + edgeStep);
    }
    let _e215 = reachedBoth;
    if !(_e215) {
        loop {
            let _e218 = i;
            if !((_e218 >= ITERATIONS)) {
                let _e222 = reachedBoth;
                local_1 = _e222;
            } else {
                local_1 = true;
            }
            let _e226 = local_1;
            if _e226 {
                break;
            }
            let _e227 = i;
            let _e228 = qualityStep(_e227);
            let _e229 = reached1_;
            if !(_e229) {
                let _e231 = uv1_;
                let _e232 = sampleLuma(_e231);
                let _e233 = lumaLocalAverage;
                lumaEnd1_ = (_e232 - _e233);
                let _e235 = lumaEnd1_;
                reached1_ = (abs(_e235) >= gradientScaled);
            }
            let _e238 = reached2_;
            if !(_e238) {
                let _e240 = uv2_;
                let _e241 = sampleLuma(_e240);
                let _e242 = lumaLocalAverage;
                lumaEnd2_ = (_e241 - _e242);
                let _e244 = lumaEnd2_;
                reached2_ = (abs(_e244) >= gradientScaled);
            }
            let _e247 = reached1_;
            if _e247 {
                let _e248 = reached2_;
                local_2 = _e248;
            } else {
                local_2 = false;
            }
            let _e252 = local_2;
            reachedBoth = _e252;
            let _e253 = reached1_;
            if !(_e253) {
                let _e255 = uv1_;
                uv1_ = (_e255 - (edgeStep * _e228));
            }
            let _e258 = reached2_;
            if !(_e258) {
                let _e260 = uv2_;
                uv2_ = (_e260 + (edgeStep * _e228));
            }
            let _e263 = i;
            i = (_e263 + 1i);
        }
    }
    let _e268 = uv1_.y;
    let _e272 = uv1_.x;
    let distance1_ = select((uv_2.y - _e268), (uv_2.x - _e272), isHorizontal);
    let _e276 = uv2_.y;
    let _e280 = uv2_.x;
    let distance2_ = select((_e276 - uv_2.y), (_e280 - uv_2.x), isHorizontal);
    let isDirection1_ = (distance1_ < distance2_);
    let distanceFinal = min(distance1_, distance2_);
    let edgeThickness = (distance1_ + distance2_);
    let pixelOffsetRaw = ((-(distanceFinal) / edgeThickness) + 0.5f);
    let _e291 = lumaLocalAverage;
    let isLumaCenterSmaller = (_e11 < _e291);
    let _e293 = lumaEnd1_;
    let correctVariation1_ = ((_e293 < 0f) != isLumaCenterSmaller);
    let _e297 = lumaEnd2_;
    let correctVariation2_ = ((_e297 < 0f) != isLumaCenterSmaller);
    let correctVariation = select(correctVariation2_, correctVariation1_, isDirection1_);
    let finalOffset = select(0f, pixelOffsetRaw, correctVariation);
    let lumaAverage = (0.083333336f * (((2f * (lumaDownUp + lumaLeftRight)) + lumaLeftCorners) + lumaRightCorners));
    let subPixelOffset1_ = clamp((abs((lumaAverage - _e11)) / lumaRange), 0f, 1f);
    let subPixelOffset2_ = ((((-2f * subPixelOffset1_) + 3f) * subPixelOffset1_) * subPixelOffset1_);
    let subPixelOffsetFinal = ((subPixelOffset2_ * subPixelOffset2_) * SUBPIXEL_QUALITY);
    let pixelOffset = max(finalOffset, subPixelOffsetFinal);
    finalUv = uv_2;
    if isHorizontal {
        let _e329 = finalUv.y;
        let _e330 = stepLength;
        finalUv.y = (_e329 + (pixelOffset * _e330));
    } else {
        let _e334 = finalUv.x;
        let _e335 = stepLength;
        finalUv.x = (_e334 + (pixelOffset * _e335));
    }
    let _e338 = finalUv;
    let _e339 = sampleColor(_e338);
    let _e342 = ditherUnorm8X_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(_e339, in.position.xy);
    let _e345 = params.ditherEnabled;
    return vec4<f32>(select(_e339, _e342, (_e345 > 0.5f)), 1f);
}
