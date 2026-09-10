struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct TaaResolveParams {
    currentJitterUv: vec2<f32>,
    historyValid: u32,
    temporalFrameIndex: u32,
}

struct TaaResolveOutput {
    @location(0) color: vec4<f32>,
    @location(1) temporal: vec4<f32>,
}

@group(0) @binding(0) 
var currentColor: texture_2d<f32>;
@group(0) @binding(1) 
var currentTemporal: texture_2d<f32>;
@group(0) @binding(2) 
var historyColor: texture_2d<f32>;
@group(0) @binding(3) 
var historyTemporal: texture_2d<f32>;
@group(0) @binding(4) 
var historySampler: sampler;
@group(0) @binding(5) 
var<uniform> params: TaaResolveParams;

fn fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    var x_1: f32 = -1f;
    var y_1: f32 = -1f;
    var out: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

    if (vertex_index == 1u) {
        x_1 = 3f;
    }
    if (vertex_index == 2u) {
        y_1 = 3f;
    }
    let _e10 = x_1;
    let u = ((_e10 + 1f) * 0.5f);
    let _e15 = y_1;
    let v = (1f - ((_e15 + 1f) * 0.5f));
    let _e24 = x_1;
    let _e25 = y_1;
    out.position = vec4<f32>(_e24, _e25, 0f, 1f);
    out.uv = vec2<f32>(u, v);
    let _e31 = out;
    return _e31;
}

fn rgbToYCoCg(rgb: vec3<f32>) -> vec3<f32> {
    return vec3<f32>(dot(rgb, vec3<f32>(0.25f, 0.5f, 0.25f)), dot(rgb, vec3<f32>(0.5f, 0f, -0.5f)), dot(rgb, vec3<f32>(-0.25f, 0.5f, -0.25f)));
}

fn yCoCgToRgb(value: vec3<f32>) -> vec3<f32> {
    return vec3<f32>(((value.x + value.y) - value.z), (value.x + value.z), ((value.x - value.y) - value.z));
}

fn luminance(rgb_1: vec3<f32>) -> f32 {
    return dot(rgb_1, vec3<f32>(0.2126f, 0.7152f, 0.0722f));
}

fn jitterCorrectedCurrent(uv: vec2<f32>) -> vec4<f32> {
    let _e3 = params.currentJitterUv;
    let _e8 = textureSampleLevel(currentColor, historySampler, (uv + _e3), 0f);
    return _e8;
}

fn closestCurrentTemporal(pixel: vec2<i32>, dimensions: vec2<i32>) -> vec4<f32> {
    var closest: vec4<f32> = vec4<f32>(0f, 0f, -1f, 1f);
    var closestDepth: f32 = 100000000000000000000f;
    var y_2: i32 = -1i;
    var x_2: i32;
    var local_4: bool;

    loop {
        let _e7 = y_2;
        if (_e7 <= 1i) {
        } else {
            break;
        }
        {
            x_2 = -1i;
            loop {
                let _e12 = x_2;
                if (_e12 <= 1i) {
                } else {
                    break;
                }
                {
                    let _e16 = x_2;
                    let _e17 = y_2;
                    let samplePixel = clamp((pixel + vec2<i32>(_e16, _e17)), vec2(0i), (dimensions - vec2(1i)));
                    let candidate = textureLoad(currentTemporal, samplePixel, 0i);
                    if (candidate.z >= 0f) {
                        let _e35 = closestDepth;
                        local_4 = (candidate.z < _e35);
                    } else {
                        local_4 = false;
                    }
                    let _e40 = local_4;
                    if _e40 {
                        closest = candidate;
                        closestDepth = candidate.z;
                    }
                }
                continuing {
                    let _e43 = x_2;
                    x_2 = (_e43 + 1i);
                }
            }
        }
        continuing {
            let _e46 = y_2;
            y_2 = (_e46 + 1i);
        }
    }
    let _e49 = closest;
    return _e49;
}

@vertex 
fn vs_taa_resolve(@builtin(vertex_index) vertexIndex: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertexIndex);
    return _e1;
}

@fragment 
fn fs_taa_resolve(in: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> TaaResolveOutput {
    var output: TaaResolveOutput;
    var local: bool;
    var local_1: bool;
    var local_2: bool;
    var local_3: bool;
    var neighborhoodMin: vec3<f32> = vec3(100000000000000000000f);
    var neighborhoodMax: vec3<f32> = vec3(-100000000000000000000f);
    var neighborhoodMean: vec3<f32> = vec3(0f);
    var neighborhoodSquareMean: vec3<f32> = vec3(0f);
    var y: i32 = -1i;
    var x: i32;

    let _e8 = textureDimensions(currentColor);
    let dimensions_1 = vec2<i32>(_e8);
    let pixel_1 = clamp(vec2<i32>(in.position.xy), vec2(0i), (dimensions_1 - vec2(1i)));
    let _e21 = jitterCorrectedCurrent(in.uv);
    let _e22 = closestCurrentTemporal(pixel_1, dimensions_1);
    output.temporal = _e22;
    output.color = _e21;
    let historyUv = (in.uv - _e22.xy);
    if all((historyUv >= vec2(0f))) {
        local = all((historyUv < vec2(1f)));
    } else {
        local = false;
    }
    let historyInBounds = local;
    let _e43 = params.historyValid;
    if !((_e43 == 0u)) {
        local_1 = !(historyInBounds);
    } else {
        local_1 = true;
    }
    let _e51 = local_1;
    if !(_e51) {
        local_2 = (_e22.z < 0f);
    } else {
        local_2 = true;
    }
    let _e59 = local_2;
    if _e59 {
        let _e60 = output;
        return _e60;
    }
    let previousTemporal = textureSampleLevel(historyTemporal, historySampler, historyUv, 0f);
    let depthDelta = abs((previousTemporal.z - _e22.z));
    let depthThreshold = max(0.01f, (_e22.z * 0.01f));
    if !((previousTemporal.z < 0f)) {
        local_3 = (depthDelta > depthThreshold);
    } else {
        local_3 = true;
    }
    let _e82 = local_3;
    if _e82 {
        let _e83 = output;
        return _e83;
    }
    loop {
        let _e85 = y;
        if (_e85 <= 1i) {
        } else {
            break;
        }
        {
            x = -1i;
            loop {
                let _e90 = x;
                if (_e90 <= 1i) {
                } else {
                    break;
                }
                {
                    let _e94 = x;
                    let _e96 = y;
                    let sampleUv = (in.uv + (vec2<f32>(f32(_e94), f32(_e96)) / vec2<f32>(dimensions_1)));
                    let _e102 = jitterCorrectedCurrent(sampleUv);
                    let _e104 = rgbToYCoCg(_e102.xyz);
                    let _e106 = neighborhoodMin;
                    neighborhoodMin = min(_e106, _e104);
                    let _e109 = neighborhoodMax;
                    neighborhoodMax = max(_e109, _e104);
                    let _e112 = neighborhoodMean;
                    neighborhoodMean = (_e112 + _e104);
                    let _e115 = neighborhoodSquareMean;
                    neighborhoodSquareMean = (_e115 + (_e104 * _e104));
                }
                continuing {
                    let _e118 = x;
                    x = (_e118 + 1i);
                }
            }
        }
        continuing {
            let _e121 = y;
            y = (_e121 + 1i);
        }
    }
    let _e124 = neighborhoodMean;
    neighborhoodMean = (_e124 / vec3(9f));
    let _e128 = neighborhoodSquareMean;
    neighborhoodSquareMean = (_e128 / vec3(9f));
    let _e132 = neighborhoodSquareMean;
    let _e133 = neighborhoodMean;
    let _e134 = neighborhoodMean;
    let sigma = sqrt(max((_e132 - (_e133 * _e134)), vec3(0f)));
    let _e141 = neighborhoodMin;
    let _e142 = neighborhoodMean;
    let clipMin = max(_e141, (_e142 - (sigma * 1.25f)));
    let _e147 = neighborhoodMax;
    let _e148 = neighborhoodMean;
    let clipMax = min(_e147, (_e148 + (sigma * 1.25f)));
    let sampledHistory = textureSampleLevel(historyColor, historySampler, historyUv, 0f);
    let _e158 = rgbToYCoCg(sampledHistory.xyz);
    let _e160 = yCoCgToRgb(clamp(_e158, clipMin, clipMax));
    let velocityFactor = (1f - clamp((length(_e22.xy) * 64f), 0f, 1f));
    let reactiveFactor = (1f - clamp(_e22.w, 0f, 1f));
    let depthFactor = (1f - clamp((depthDelta / depthThreshold), 0f, 1f));
    let _e183 = luminance(_e21.xyz);
    let _e184 = luminance(_e160);
    let lumaDelta = abs((_e184 - _e183));
    let unbiasedLumaDelta = clamp((lumaDelta / max(max(_e183, _e184), 0.2f)), 0f, 1f);
    let lumaFactor = ((1f - unbiasedLumaDelta) * (1f - unbiasedLumaDelta));
    let fixedPresetWeight = mix(0.88f, 0.97f, lumaFactor);
    let _e204 = params.temporalFrameIndex;
    let _e208 = params.temporalFrameIndex;
    let startupWeight = (f32(_e204) / f32((_e208 + 1u)));
    let _e216 = params.temporalFrameIndex;
    let progressiveWeight = select(fixedPresetWeight, min(startupWeight, fixedPresetWeight), (_e216 < 8u));
    let rejectionFactor = min(reactiveFactor, min(velocityFactor, depthFactor));
    let historyWeight = (progressiveWeight * rejectionFactor);
    output.color = vec4<f32>(mix(_e21.xyz, _e160, historyWeight), _e21.w);
    let _e228 = output;
    return _e228;
}
