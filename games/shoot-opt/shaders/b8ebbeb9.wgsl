struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

const EDGE_THRESHOLD_MIN: f32 = 0.0312f;
const EDGE_THRESHOLD_MAX: f32 = 0.125f;
const SUBPIXEL_QUALITY: f32 = 0.75f;
const ITERATIONS: i32 = 12i;

@group(0) @binding(0) 
var screenTexture: texture_2d<f32>;
@group(0) @binding(1) 
var samp: sampler;

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
        let _e50 = linearToSrgbOetfX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(_e10);
        return vec4<f32>(_e50, 1f);
    }
    let _e58 = sampleLuma((uv_2 + (vec2<f32>(-1f, 1f) * inverseScreenSize)));
    let _e64 = sampleLuma((uv_2 + (vec2<f32>(1f, -1f) * inverseScreenSize)));
    let _e70 = sampleLuma((uv_2 + (vec2<f32>(-1f, -1f) * inverseScreenSize)));
    let _e76 = sampleLuma((uv_2 + (vec2<f32>(1f, 1f) * inverseScreenSize)));
    let lumaDownUp = (_e17 + _e23);
    let lumaLeftRight = (_e29 + _e35);
    let lumaLeftCorners = (_e58 + _e70);
    let lumaDownCorners = (_e58 + _e76);
    let lumaRightCorners = (_e76 + _e64);
    let lumaUpCorners = (_e64 + _e70);
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
        let _e132 = stepLength;
        stepLength = -(_e132);
        lumaLocalAverage = (0.5f * (luma1_ + _e11));
    } else {
        lumaLocalAverage = (0.5f * (luma2_ + _e11));
    }
    currentUv = uv_2;
    if isHorizontal {
        let _e143 = currentUv.y;
        let _e144 = stepLength;
        currentUv.y = (_e143 + (_e144 * 0.5f));
    } else {
        let _e149 = currentUv.x;
        let _e150 = stepLength;
        currentUv.x = (_e149 + (_e150 * 0.5f));
    }
    let _e154 = stepLength;
    let _e157 = stepLength;
    let offsetStep = select(vec2<f32>(_e154, 0f), vec2<f32>(0f, _e157), isHorizontal);
    let edgeStep = select(vec2<f32>(0f, inverseScreenSize.y), vec2<f32>(inverseScreenSize.x, 0f), isHorizontal);
    let _e168 = currentUv;
    uv1_ = (_e168 - edgeStep);
    let _e171 = currentUv;
    uv2_ = (_e171 + edgeStep);
    let _e174 = uv1_;
    let _e175 = sampleLuma(_e174);
    let _e176 = lumaLocalAverage;
    lumaEnd1_ = (_e175 - _e176);
    let _e179 = uv2_;
    let _e180 = sampleLuma(_e179);
    let _e181 = lumaLocalAverage;
    lumaEnd2_ = (_e180 - _e181);
    let _e184 = lumaEnd1_;
    reached1_ = (abs(_e184) >= gradientScaled);
    let _e188 = lumaEnd2_;
    reached2_ = (abs(_e188) >= gradientScaled);
    let _e192 = reached1_;
    if _e192 {
        let _e193 = reached2_;
        local = _e193;
    } else {
        local = false;
    }
    let _e197 = local;
    reachedBoth = _e197;
    let _e199 = reached1_;
    if !(_e199) {
        let _e201 = uv1_;
        uv1_ = (_e201 - edgeStep);
    }
    let _e203 = reached2_;
    if !(_e203) {
        let _e205 = uv2_;
        uv2_ = (_e205 + edgeStep);
    }
    let _e207 = reachedBoth;
    if !(_e207) {
        loop {
            let _e210 = i;
            if !((_e210 >= ITERATIONS)) {
                let _e214 = reachedBoth;
                local_1 = _e214;
            } else {
                local_1 = true;
            }
            let _e218 = local_1;
            if _e218 {
                break;
            }
            let _e219 = i;
            let _e220 = qualityStep(_e219);
            let _e221 = reached1_;
            if !(_e221) {
                let _e223 = uv1_;
                let _e224 = sampleLuma(_e223);
                let _e225 = lumaLocalAverage;
                lumaEnd1_ = (_e224 - _e225);
                let _e227 = lumaEnd1_;
                reached1_ = (abs(_e227) >= gradientScaled);
            }
            let _e230 = reached2_;
            if !(_e230) {
                let _e232 = uv2_;
                let _e233 = sampleLuma(_e232);
                let _e234 = lumaLocalAverage;
                lumaEnd2_ = (_e233 - _e234);
                let _e236 = lumaEnd2_;
                reached2_ = (abs(_e236) >= gradientScaled);
            }
            let _e239 = reached1_;
            if _e239 {
                let _e240 = reached2_;
                local_2 = _e240;
            } else {
                local_2 = false;
            }
            let _e244 = local_2;
            reachedBoth = _e244;
            let _e245 = reached1_;
            if !(_e245) {
                let _e247 = uv1_;
                uv1_ = (_e247 - (edgeStep * _e220));
            }
            let _e250 = reached2_;
            if !(_e250) {
                let _e252 = uv2_;
                uv2_ = (_e252 + (edgeStep * _e220));
            }
            let _e255 = i;
            i = (_e255 + 1i);
        }
    }
    let _e260 = uv1_.y;
    let _e264 = uv1_.x;
    let distance1_ = select((uv_2.y - _e260), (uv_2.x - _e264), isHorizontal);
    let _e268 = uv2_.y;
    let _e272 = uv2_.x;
    let distance2_ = select((_e268 - uv_2.y), (_e272 - uv_2.x), isHorizontal);
    let isDirection1_ = (distance1_ < distance2_);
    let distanceFinal = min(distance1_, distance2_);
    let edgeThickness = (distance1_ + distance2_);
    let pixelOffsetRaw = ((-(distanceFinal) / edgeThickness) + 0.5f);
    let _e283 = lumaLocalAverage;
    let isLumaCenterSmaller = (_e11 < _e283);
    let _e285 = lumaEnd1_;
    let correctVariation1_ = ((_e285 < 0f) != isLumaCenterSmaller);
    let _e289 = lumaEnd2_;
    let correctVariation2_ = ((_e289 < 0f) != isLumaCenterSmaller);
    let correctVariation = select(correctVariation2_, correctVariation1_, isDirection1_);
    let finalOffset = select(0f, pixelOffsetRaw, correctVariation);
    let lumaAverage = (0.083333336f * (((2f * (lumaDownUp + lumaLeftRight)) + lumaLeftCorners) + lumaRightCorners));
    let subPixelOffset1_ = clamp((abs((lumaAverage - _e11)) / lumaRange), 0f, 1f);
    let subPixelOffset2_ = ((((-2f * subPixelOffset1_) + 3f) * subPixelOffset1_) * subPixelOffset1_);
    let subPixelOffsetFinal = ((subPixelOffset2_ * subPixelOffset2_) * SUBPIXEL_QUALITY);
    let pixelOffset = max(finalOffset, subPixelOffsetFinal);
    finalUv = uv_2;
    if isHorizontal {
        let _e321 = finalUv.y;
        let _e322 = stepLength;
        finalUv.y = (_e321 + (pixelOffset * _e322));
    } else {
        let _e326 = finalUv.x;
        let _e327 = stepLength;
        finalUv.x = (_e326 + (pixelOffset * _e327));
    }
    let _e330 = finalUv;
    let _e331 = sampleColor(_e330);
    let _e332 = linearToSrgbOetfX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(_e331);
    return vec4<f32>(_e332, 1f);
}
