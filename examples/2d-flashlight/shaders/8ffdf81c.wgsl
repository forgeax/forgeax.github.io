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
        return vec4<f32>(_e10, 1f);
    }
    let _e57 = sampleLuma((uv_2 + (vec2<f32>(-1f, 1f) * inverseScreenSize)));
    let _e63 = sampleLuma((uv_2 + (vec2<f32>(1f, -1f) * inverseScreenSize)));
    let _e69 = sampleLuma((uv_2 + (vec2<f32>(-1f, -1f) * inverseScreenSize)));
    let _e75 = sampleLuma((uv_2 + (vec2<f32>(1f, 1f) * inverseScreenSize)));
    let lumaDownUp = (_e17 + _e23);
    let lumaLeftRight = (_e29 + _e35);
    let lumaLeftCorners = (_e57 + _e69);
    let lumaDownCorners = (_e57 + _e75);
    let lumaRightCorners = (_e75 + _e63);
    let lumaUpCorners = (_e63 + _e69);
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
        let _e131 = stepLength;
        stepLength = -(_e131);
        lumaLocalAverage = (0.5f * (luma1_ + _e11));
    } else {
        lumaLocalAverage = (0.5f * (luma2_ + _e11));
    }
    currentUv = uv_2;
    if isHorizontal {
        let _e142 = currentUv.y;
        let _e143 = stepLength;
        currentUv.y = (_e142 + (_e143 * 0.5f));
    } else {
        let _e148 = currentUv.x;
        let _e149 = stepLength;
        currentUv.x = (_e148 + (_e149 * 0.5f));
    }
    let _e153 = stepLength;
    let _e156 = stepLength;
    let offsetStep = select(vec2<f32>(_e153, 0f), vec2<f32>(0f, _e156), isHorizontal);
    let edgeStep = select(vec2<f32>(0f, inverseScreenSize.y), vec2<f32>(inverseScreenSize.x, 0f), isHorizontal);
    let _e167 = currentUv;
    uv1_ = (_e167 - edgeStep);
    let _e170 = currentUv;
    uv2_ = (_e170 + edgeStep);
    let _e173 = uv1_;
    let _e174 = sampleLuma(_e173);
    let _e175 = lumaLocalAverage;
    lumaEnd1_ = (_e174 - _e175);
    let _e178 = uv2_;
    let _e179 = sampleLuma(_e178);
    let _e180 = lumaLocalAverage;
    lumaEnd2_ = (_e179 - _e180);
    let _e183 = lumaEnd1_;
    reached1_ = (abs(_e183) >= gradientScaled);
    let _e187 = lumaEnd2_;
    reached2_ = (abs(_e187) >= gradientScaled);
    let _e191 = reached1_;
    if _e191 {
        let _e192 = reached2_;
        local = _e192;
    } else {
        local = false;
    }
    let _e196 = local;
    reachedBoth = _e196;
    let _e198 = reached1_;
    if !(_e198) {
        let _e200 = uv1_;
        uv1_ = (_e200 - edgeStep);
    }
    let _e202 = reached2_;
    if !(_e202) {
        let _e204 = uv2_;
        uv2_ = (_e204 + edgeStep);
    }
    let _e206 = reachedBoth;
    if !(_e206) {
        loop {
            let _e209 = i;
            if !((_e209 >= ITERATIONS)) {
                let _e213 = reachedBoth;
                local_1 = _e213;
            } else {
                local_1 = true;
            }
            let _e217 = local_1;
            if _e217 {
                break;
            }
            let _e218 = i;
            let _e219 = qualityStep(_e218);
            let _e220 = reached1_;
            if !(_e220) {
                let _e222 = uv1_;
                let _e223 = sampleLuma(_e222);
                let _e224 = lumaLocalAverage;
                lumaEnd1_ = (_e223 - _e224);
                let _e226 = lumaEnd1_;
                reached1_ = (abs(_e226) >= gradientScaled);
            }
            let _e229 = reached2_;
            if !(_e229) {
                let _e231 = uv2_;
                let _e232 = sampleLuma(_e231);
                let _e233 = lumaLocalAverage;
                lumaEnd2_ = (_e232 - _e233);
                let _e235 = lumaEnd2_;
                reached2_ = (abs(_e235) >= gradientScaled);
            }
            let _e238 = reached1_;
            if _e238 {
                let _e239 = reached2_;
                local_2 = _e239;
            } else {
                local_2 = false;
            }
            let _e243 = local_2;
            reachedBoth = _e243;
            let _e244 = reached1_;
            if !(_e244) {
                let _e246 = uv1_;
                uv1_ = (_e246 - (edgeStep * _e219));
            }
            let _e249 = reached2_;
            if !(_e249) {
                let _e251 = uv2_;
                uv2_ = (_e251 + (edgeStep * _e219));
            }
            let _e254 = i;
            i = (_e254 + 1i);
        }
    }
    let _e259 = uv1_.y;
    let _e263 = uv1_.x;
    let distance1_ = select((uv_2.y - _e259), (uv_2.x - _e263), isHorizontal);
    let _e267 = uv2_.y;
    let _e271 = uv2_.x;
    let distance2_ = select((_e267 - uv_2.y), (_e271 - uv_2.x), isHorizontal);
    let isDirection1_ = (distance1_ < distance2_);
    let distanceFinal = min(distance1_, distance2_);
    let edgeThickness = (distance1_ + distance2_);
    let pixelOffsetRaw = ((-(distanceFinal) / edgeThickness) + 0.5f);
    let _e282 = lumaLocalAverage;
    let isLumaCenterSmaller = (_e11 < _e282);
    let _e284 = lumaEnd1_;
    let correctVariation1_ = ((_e284 < 0f) != isLumaCenterSmaller);
    let _e288 = lumaEnd2_;
    let correctVariation2_ = ((_e288 < 0f) != isLumaCenterSmaller);
    let correctVariation = select(correctVariation2_, correctVariation1_, isDirection1_);
    let finalOffset = select(0f, pixelOffsetRaw, correctVariation);
    let lumaAverage = (0.083333336f * (((2f * (lumaDownUp + lumaLeftRight)) + lumaLeftCorners) + lumaRightCorners));
    let subPixelOffset1_ = clamp((abs((lumaAverage - _e11)) / lumaRange), 0f, 1f);
    let subPixelOffset2_ = ((((-2f * subPixelOffset1_) + 3f) * subPixelOffset1_) * subPixelOffset1_);
    let subPixelOffsetFinal = ((subPixelOffset2_ * subPixelOffset2_) * SUBPIXEL_QUALITY);
    let pixelOffset = max(finalOffset, subPixelOffsetFinal);
    finalUv = uv_2;
    if isHorizontal {
        let _e320 = finalUv.y;
        let _e321 = stepLength;
        finalUv.y = (_e320 + (pixelOffset * _e321));
    } else {
        let _e325 = finalUv.x;
        let _e326 = stepLength;
        finalUv.x = (_e325 + (pixelOffset * _e326));
    }
    let _e329 = finalUv;
    let _e330 = sampleColor(_e329);
    return vec4<f32>(_e330, 1f);
}
