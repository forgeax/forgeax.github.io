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

fn sampleColor(uv: vec2<f32>) -> vec4<f32> {
    let _e4 = textureSampleLevel(screenTexture, samp, uv, 0f);
    return _e4;
}

fn sampleLuma(uv_1: vec2<f32>) -> f32 {
    let _e1 = sampleColor(uv_1);
    let _e3 = rgb2luma(_e1.xyz);
    return _e3;
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
    let centerColor = _e10.xyz;
    let _e12 = rgb2luma(centerColor);
    let _e18 = sampleLuma((uv_2 + (vec2<f32>(0f, 1f) * inverseScreenSize)));
    let _e24 = sampleLuma((uv_2 + (vec2<f32>(0f, -1f) * inverseScreenSize)));
    let _e30 = sampleLuma((uv_2 + (vec2<f32>(-1f, 0f) * inverseScreenSize)));
    let _e36 = sampleLuma((uv_2 + (vec2<f32>(1f, 0f) * inverseScreenSize)));
    let lumaMin = min(_e12, min(min(_e18, _e24), min(_e30, _e36)));
    let lumaMax = max(_e12, max(max(_e18, _e24), max(_e30, _e36)));
    let lumaRange = (lumaMax - lumaMin);
    if (lumaRange < max(EDGE_THRESHOLD_MIN, (lumaMax * EDGE_THRESHOLD_MAX))) {
        let _e53 = ditherUnorm8X_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(centerColor, in.position.xy);
        let _e56 = params.ditherEnabled;
        return vec4<f32>(select(centerColor, _e53, (_e56 > 0.5f)), _e10.w);
    }
    let _e67 = sampleLuma((uv_2 + (vec2<f32>(-1f, 1f) * inverseScreenSize)));
    let _e73 = sampleLuma((uv_2 + (vec2<f32>(1f, -1f) * inverseScreenSize)));
    let _e79 = sampleLuma((uv_2 + (vec2<f32>(-1f, -1f) * inverseScreenSize)));
    let _e85 = sampleLuma((uv_2 + (vec2<f32>(1f, 1f) * inverseScreenSize)));
    let lumaDownUp = (_e18 + _e24);
    let lumaLeftRight = (_e30 + _e36);
    let lumaLeftCorners = (_e67 + _e79);
    let lumaDownCorners = (_e67 + _e85);
    let lumaRightCorners = (_e85 + _e73);
    let lumaUpCorners = (_e73 + _e79);
    let edgeHorizontal = ((abs(((-2f * _e30) + lumaLeftCorners)) + (abs(((-2f * _e12) + lumaDownUp)) * 2f)) + abs(((-2f * _e36) + lumaRightCorners)));
    let edgeVertical = ((abs(((-2f * _e24) + lumaUpCorners)) + (abs(((-2f * _e12) + lumaLeftRight)) * 2f)) + abs(((-2f * _e18) + lumaDownCorners)));
    let isHorizontal = (edgeHorizontal >= edgeVertical);
    let luma1_ = select(_e30, _e18, isHorizontal);
    let luma2_ = select(_e36, _e24, isHorizontal);
    let gradient1_ = (luma1_ - _e12);
    let gradient2_ = (luma2_ - _e12);
    let is1Steepest = (abs(gradient1_) >= abs(gradient2_));
    let gradientScaled = (0.25f * max(abs(gradient1_), abs(gradient2_)));
    stepLength = select(inverseScreenSize.x, inverseScreenSize.y, isHorizontal);
    if is1Steepest {
        let _e141 = stepLength;
        stepLength = -(_e141);
        lumaLocalAverage = (0.5f * (luma1_ + _e12));
    } else {
        lumaLocalAverage = (0.5f * (luma2_ + _e12));
    }
    currentUv = uv_2;
    if isHorizontal {
        let _e152 = currentUv.y;
        let _e153 = stepLength;
        currentUv.y = (_e152 + (_e153 * 0.5f));
    } else {
        let _e158 = currentUv.x;
        let _e159 = stepLength;
        currentUv.x = (_e158 + (_e159 * 0.5f));
    }
    let _e163 = stepLength;
    let _e166 = stepLength;
    let offsetStep = select(vec2<f32>(_e163, 0f), vec2<f32>(0f, _e166), isHorizontal);
    let edgeStep = select(vec2<f32>(0f, inverseScreenSize.y), vec2<f32>(inverseScreenSize.x, 0f), isHorizontal);
    let _e177 = currentUv;
    uv1_ = (_e177 - edgeStep);
    let _e180 = currentUv;
    uv2_ = (_e180 + edgeStep);
    let _e183 = uv1_;
    let _e184 = sampleLuma(_e183);
    let _e185 = lumaLocalAverage;
    lumaEnd1_ = (_e184 - _e185);
    let _e188 = uv2_;
    let _e189 = sampleLuma(_e188);
    let _e190 = lumaLocalAverage;
    lumaEnd2_ = (_e189 - _e190);
    let _e193 = lumaEnd1_;
    reached1_ = (abs(_e193) >= gradientScaled);
    let _e197 = lumaEnd2_;
    reached2_ = (abs(_e197) >= gradientScaled);
    let _e201 = reached1_;
    if _e201 {
        let _e202 = reached2_;
        local = _e202;
    } else {
        local = false;
    }
    let _e206 = local;
    reachedBoth = _e206;
    let _e208 = reached1_;
    if !(_e208) {
        let _e210 = uv1_;
        uv1_ = (_e210 - edgeStep);
    }
    let _e212 = reached2_;
    if !(_e212) {
        let _e214 = uv2_;
        uv2_ = (_e214 + edgeStep);
    }
    let _e216 = reachedBoth;
    if !(_e216) {
        loop {
            let _e219 = i;
            if !((_e219 >= ITERATIONS)) {
                let _e223 = reachedBoth;
                local_1 = _e223;
            } else {
                local_1 = true;
            }
            let _e227 = local_1;
            if _e227 {
                break;
            }
            let _e228 = i;
            let _e229 = qualityStep(_e228);
            let _e230 = reached1_;
            if !(_e230) {
                let _e232 = uv1_;
                let _e233 = sampleLuma(_e232);
                let _e234 = lumaLocalAverage;
                lumaEnd1_ = (_e233 - _e234);
                let _e236 = lumaEnd1_;
                reached1_ = (abs(_e236) >= gradientScaled);
            }
            let _e239 = reached2_;
            if !(_e239) {
                let _e241 = uv2_;
                let _e242 = sampleLuma(_e241);
                let _e243 = lumaLocalAverage;
                lumaEnd2_ = (_e242 - _e243);
                let _e245 = lumaEnd2_;
                reached2_ = (abs(_e245) >= gradientScaled);
            }
            let _e248 = reached1_;
            if _e248 {
                let _e249 = reached2_;
                local_2 = _e249;
            } else {
                local_2 = false;
            }
            let _e253 = local_2;
            reachedBoth = _e253;
            let _e254 = reached1_;
            if !(_e254) {
                let _e256 = uv1_;
                uv1_ = (_e256 - (edgeStep * _e229));
            }
            let _e259 = reached2_;
            if !(_e259) {
                let _e261 = uv2_;
                uv2_ = (_e261 + (edgeStep * _e229));
            }
            let _e264 = i;
            i = (_e264 + 1i);
        }
    }
    let _e269 = uv1_.y;
    let _e273 = uv1_.x;
    let distance1_ = select((uv_2.y - _e269), (uv_2.x - _e273), isHorizontal);
    let _e277 = uv2_.y;
    let _e281 = uv2_.x;
    let distance2_ = select((_e277 - uv_2.y), (_e281 - uv_2.x), isHorizontal);
    let isDirection1_ = (distance1_ < distance2_);
    let distanceFinal = min(distance1_, distance2_);
    let edgeThickness = (distance1_ + distance2_);
    let pixelOffsetRaw = ((-(distanceFinal) / edgeThickness) + 0.5f);
    let _e292 = lumaLocalAverage;
    let isLumaCenterSmaller = (_e12 < _e292);
    let _e294 = lumaEnd1_;
    let correctVariation1_ = ((_e294 < 0f) != isLumaCenterSmaller);
    let _e298 = lumaEnd2_;
    let correctVariation2_ = ((_e298 < 0f) != isLumaCenterSmaller);
    let correctVariation = select(correctVariation2_, correctVariation1_, isDirection1_);
    let finalOffset = select(0f, pixelOffsetRaw, correctVariation);
    let lumaAverage = (0.083333336f * (((2f * (lumaDownUp + lumaLeftRight)) + lumaLeftCorners) + lumaRightCorners));
    let subPixelOffset1_ = clamp((abs((lumaAverage - _e12)) / lumaRange), 0f, 1f);
    let subPixelOffset2_ = ((((-2f * subPixelOffset1_) + 3f) * subPixelOffset1_) * subPixelOffset1_);
    let subPixelOffsetFinal = ((subPixelOffset2_ * subPixelOffset2_) * SUBPIXEL_QUALITY);
    let pixelOffset = max(finalOffset, subPixelOffsetFinal);
    finalUv = uv_2;
    if isHorizontal {
        let _e330 = finalUv.y;
        let _e331 = stepLength;
        finalUv.y = (_e330 + (pixelOffset * _e331));
    } else {
        let _e335 = finalUv.x;
        let _e336 = stepLength;
        finalUv.x = (_e335 + (pixelOffset * _e336));
    }
    let _e339 = finalUv;
    let _e340 = sampleColor(_e339);
    let finalColor = _e340.xyz;
    let _e344 = ditherUnorm8X_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(finalColor, in.position.xy);
    let _e347 = params.ditherEnabled;
    return vec4<f32>(select(finalColor, _e344, (_e347 > 0.5f)), _e340.w);
}
