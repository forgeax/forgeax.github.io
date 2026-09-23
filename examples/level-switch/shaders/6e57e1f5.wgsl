struct FullscreenOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct TaaResolveParams {
    currentJitterUv: vec2<f32>,
    historyValid: u32,
    temporalFrameIndex: u32,
    hasSecondaryReactivity: u32,
    hasCurrentCoverage: u32,
}

struct TaaResolveOutput {
    @location(0) color: vec4<f32>,
    @location(1) temporal: vec4<f32>,
    @location(2) stability: f32,
}

struct TaaCurrentTemporal {
    temporal: vec4<f32>,
    depthEdge: bool,
}

struct TaaBounds {
    minimum: vec3<f32>,
    maximum: vec3<f32>,
}

struct TaaClipDecision {
    history: vec3<f32>,
    state: f32,
}

const TAA_STABILITY_FRAMES: f32 = 8f;
const TAA_HISTORY_SETTLE_FRAMES: f32 = 128f;

@group(1) @binding(0) 
var currentColor: texture_2d<f32>;
@group(1) @binding(1) 
var currentSampler: sampler;
@group(1) @binding(2) 
var historyColor: texture_2d<f32>;
@group(1) @binding(3) 
var historySampler: sampler;
@group(1) @binding(4) 
var historyTemporal: texture_2d<f32>;
@group(1) @binding(5) 
var temporalSampler: sampler;
@group(1) @binding(6) 
var currentTemporal: texture_2d<f32>;
@group(1) @binding(7) 
var currentTemporalSampler: sampler;
@group(1) @binding(8) 
var<uniform> params: TaaResolveParams;
@group(1) @binding(9) 
var historyStability: texture_2d<f32>;
@group(1) @binding(10) 
var secondaryReactivity: texture_2d<f32>;
@group(1) @binding(11) 
var currentCoverage: texture_2d<f32>;

fn fullscreen_triangle(vertex_index: u32) -> FullscreenOutput {
    var x: f32 = -1f;
    var y: f32 = -1f;
    var out: FullscreenOutput;

    if (vertex_index == 1u) {
        x = 3f;
    }
    if (vertex_index == 2u) {
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

fn sampleSecondaryReactivity(uv: vec2<f32>) -> f32 {
    var reactive: f32 = 0f;
    var y_1: i32 = -3i;
    var x_1: i32;
    var local: bool;

    let _e4 = params.hasSecondaryReactivity;
    if (_e4 == 0u) {
        return 0f;
    }
    let _e9 = textureDimensions(secondaryReactivity);
    let size = vec2<i32>(_e9);
    let center = vec2<i32>((uv * vec2<f32>(size)));
    loop {
        let _e16 = y_1;
        if (_e16 <= 3i) {
        } else {
            break;
        }
        {
            x_1 = -3i;
            loop {
                let _e21 = x_1;
                if (_e21 <= 3i) {
                } else {
                    break;
                }
                {
                    let _e24 = x_1;
                    let _e25 = y_1;
                    let pixel_4 = clamp((center + vec2<i32>(_e24, _e25)), vec2(0i), (size - vec2(1i)));
                    let _e36 = textureLoad(secondaryReactivity, pixel_4, 0i);
                    let value_1 = _e36.x;
                    if !((value_1 != value_1)) {
                        local = (abs(value_1) > 3.402823e38f);
                    } else {
                        local = true;
                    }
                    let _e46 = local;
                    if _e46 {
                        return 1f;
                    }
                    let _e49 = reactive;
                    reactive = max(_e49, clamp(value_1, 0f, 1f));
                }
                continuing {
                    let _e55 = x_1;
                    x_1 = (_e55 + 1i);
                }
            }
        }
        continuing {
            let _e58 = y_1;
            y_1 = (_e58 + 1i);
        }
    }
    let _e60 = reactive;
    return _e60;
}

fn taaStableAge(previous: f32, accepted: bool, temporal: vec4<f32>, priorMotion: vec2<f32>) -> f32 {
    var local_1: bool;
    var local_2: bool;

    let stationary = (max(length(temporal.xy), length(priorMotion)) < 0.00001f);
    let count = min(floor(((clamp(previous, 0f, 1f) * 255f) + 0.5f)), TAA_HISTORY_SETTLE_FRAMES);
    if accepted {
        local_1 = (temporal.w == 0f);
    } else {
        local_1 = false;
    }
    let _e30 = local_1;
    if _e30 {
        local_2 = stationary;
    } else {
        local_2 = false;
    }
    let _e34 = local_2;
    return select(0f, min((count + 1f), TAA_HISTORY_SETTLE_FRAMES), _e34);
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

fn taaAccumulationWeight(frameIndex: u32, steadyWeight: f32) -> f32 {
    let samples = f32(frameIndex);
    return min(steadyWeight, (samples / (samples + 1f)));
}

fn blendTaaHistory(current: vec3<f32>, history: vec3<f32>, historyWeight: f32) -> vec3<f32> {
    let _e4 = luminance(current);
    let currentWeight = ((1f - historyWeight) / (1f + max(0f, _e4)));
    let _e11 = luminance(history);
    let previousWeight = (historyWeight / (1f + max(0f, _e11)));
    return (((current * currentWeight) + (history * previousWeight)) / vec3(max((currentWeight + previousWeight), 0.00001f)));
}

fn taaRoundingNoise(pixel: vec2<u32>, frame: u32) -> f32 {
    var bits: u32;

    bits = (((pixel.x * 2654435769u) + (pixel.y * 2246822507u)) + (frame * 3266489909u));
    let _e13 = bits;
    let _e14 = bits;
    bits = ((_e13 ^ (_e14 >> 16u)) * 2146121005u);
    let _e20 = bits;
    let _e21 = bits;
    bits = ((_e20 ^ (_e21 >> 15u)) * 2221713035u);
    let _e27 = bits;
    let _e28 = bits;
    bits = (_e27 ^ (_e28 >> 16u));
    let _e32 = bits;
    return (f32((_e32 >> 8u)) / 16777216f);
}

fn roundTaaHistory(color: vec3<f32>, noise: f32) -> vec3<f32> {
    let magnitude = min(abs(color), vec3(65504f));
    let exponent = ((bitcast<vec3<u32>>(magnitude) >> vec3(23u)) & vec3(255u));
    let step_ = bitcast<vec3<f32>>(((max(exponent, vec3(113u)) - vec3(10u)) << vec3(23u)));
    let scaled = (magnitude / step_);
    let integral = floor(scaled);
    let rounded = ((integral + select(vec3(0f), vec3(1f), (vec3(noise) < (scaled - integral)))) * step_);
    return select(rounded, -(rounded), (color < vec3(0f)));
}

fn closestCurrentTemporal(pixel_1: vec2<i32>, dimensions: vec2<i32>) -> TaaCurrentTemporal {
    var closest: vec4<f32>;
    var farthestDepth: f32;
    var hasBackground: bool;
    var y_2: i32 = -1i;
    var x_2: i32;
    var local_3: bool;
    var local_4: bool;
    var local_5: bool;
    var local_6: bool;
    var local_7: bool;

    let clamped = clamp(pixel_1, vec2(0i), (dimensions - vec2(1i)));
    let _e11 = textureLoad(currentTemporal, clamped, 0i);
    closest = _e11;
    let _e14 = closest.z;
    farthestDepth = _e14;
    let _e17 = closest.z;
    hasBackground = (_e17 < 0f);
    loop {
        let _e22 = y_2;
        if (_e22 <= 1i) {
        } else {
            break;
        }
        {
            x_2 = -1i;
            loop {
                let _e27 = x_2;
                if (_e27 <= 1i) {
                } else {
                    break;
                }
                {
                    let _e30 = x_2;
                    let _e31 = y_2;
                    let samplePixel = clamp((pixel_1 + vec2<i32>(_e30, _e31)), vec2(0i), (dimensions - vec2(1i)));
                    let candidate = textureLoad(currentTemporal, samplePixel, 0i);
                    let _e43 = hasBackground;
                    if !(_e43) {
                        local_3 = (candidate.z < 0f);
                    } else {
                        local_3 = true;
                    }
                    let _e51 = local_3;
                    hasBackground = _e51;
                    let _e52 = farthestDepth;
                    farthestDepth = max(_e52, candidate.z);
                    if (candidate.z >= 0f) {
                        let _e59 = closest.z;
                        if !((_e59 < 0f)) {
                            let _e65 = closest.z;
                            local_5 = (candidate.z < _e65);
                        } else {
                            local_5 = true;
                        }
                        let _e70 = local_5;
                        local_4 = _e70;
                    } else {
                        local_4 = false;
                    }
                    let _e74 = local_4;
                    if _e74 {
                        closest = candidate;
                    }
                }
                continuing {
                    let _e76 = x_2;
                    x_2 = (_e76 + 1i);
                }
            }
        }
        continuing {
            let _e79 = y_2;
            y_2 = (_e79 + 1i);
        }
    }
    let _e81 = closest;
    let _e83 = closest.z;
    if (_e83 >= 0f) {
        let _e86 = hasBackground;
        if !(_e86) {
            let _e88 = farthestDepth;
            let _e90 = closest.z;
            let _e93 = closest.z;
            local_7 = ((_e88 - _e90) > (0.0025f + (_e93 * 0.01f)));
        } else {
            local_7 = true;
        }
        let _e102 = local_7;
        local_6 = _e102;
    } else {
        local_6 = false;
    }
    let _e106 = local_6;
    return TaaCurrentTemporal(_e81, _e106);
}

fn taaBoundsSample(pixel_2: vec2<i32>, dimensions_1: vec2<i32>) -> vec3<f32> {
    let _e10 = textureLoad(currentColor, clamp(pixel_2, vec2(0i), (dimensions_1 - vec2(1i))), 0i);
    let _e12 = rgbToYCoCg(_e10.xyz);
    return _e12;
}

fn taaBoundsRow(pixel_3: vec2<i32>, dimensions_2: vec2<i32>, wide: bool) -> TaaBounds {
    var bounds: TaaBounds;

    let _e6 = taaBoundsSample((pixel_3 + vec2<i32>(-1i, 0i)), dimensions_2);
    let _e7 = taaBoundsSample(pixel_3, dimensions_2);
    let _e12 = taaBoundsSample((pixel_3 + vec2<i32>(1i, 0i)), dimensions_2);
    bounds = TaaBounds(min(min(_e6, _e7), _e12), max(max(_e6, _e7), _e12));
    if wide {
        let _e24 = taaBoundsSample((pixel_3 + vec2<i32>(-2i, 0i)), dimensions_2);
        let _e29 = taaBoundsSample((pixel_3 + vec2<i32>(2i, 0i)), dimensions_2);
        let _e32 = bounds.minimum;
        bounds.minimum = min(_e32, min(_e24, _e29));
        let _e37 = bounds.maximum;
        bounds.maximum = max(_e37, max(_e24, _e29));
    }
    let _e40 = bounds;
    return _e40;
}

fn taaNeighborhood(uv_1: vec2<f32>, current_1: vec3<f32>, settled: bool) -> TaaBounds {
    var bounds_1: TaaBounds;

    let _e1 = textureDimensions(currentColor);
    let dimensions_3 = vec2<i32>(_e1);
    let pixel_5 = vec2<i32>((uv_1 * vec2<f32>(dimensions_3)));
    let _e8 = rgbToYCoCg(current_1);
    let _e14 = taaBoundsRow((pixel_5 + vec2<i32>(0i, -1i)), dimensions_3, settled);
    let _e19 = taaBoundsRow((pixel_5 + vec2<i32>(0i, 1i)), dimensions_3, settled);
    bounds_1 = TaaBounds(min(min(_e14.minimum, _e19.minimum), _e8), max(max(_e14.maximum, _e19.maximum), _e8));
    if settled {
        let _e35 = taaBoundsRow((pixel_5 + vec2<i32>(0i, -2i)), dimensions_3, true);
        let _e41 = taaBoundsRow((pixel_5 + vec2<i32>(0i, 2i)), dimensions_3, true);
        let _e43 = taaBoundsRow(pixel_5, dimensions_3, true);
        let _e46 = bounds_1.minimum;
        bounds_1.minimum = min(_e46, min(min(_e35.minimum, _e41.minimum), _e43.minimum));
        let _e55 = bounds_1.maximum;
        bounds_1.maximum = max(_e55, max(max(_e35.maximum, _e41.maximum), _e43.maximum));
    } else {
        let _e66 = taaBoundsSample((pixel_5 + vec2<i32>(-1i, 0i)), dimensions_3);
        let _e71 = taaBoundsSample((pixel_5 + vec2<i32>(1i, 0i)), dimensions_3);
        let _e74 = bounds_1.minimum;
        bounds_1.minimum = min(_e74, min(_e66, _e71));
        let _e79 = bounds_1.maximum;
        bounds_1.maximum = max(_e79, max(_e66, _e71));
    }
    let _e82 = bounds_1;
    return _e82;
}

fn clipTaaHistory(neighbors: TaaBounds, history_1: vec3<f32>) -> vec3<f32> {
    let clipMin = neighbors.minimum;
    let clipMax = neighbors.maximum;
    let _e4 = rgbToYCoCg(history_1);
    let _e6 = yCoCgToRgb(clamp(_e4, clipMin, clipMax));
    return _e6;
}

fn resolveTaaClipping(clipped: vec3<f32>, history_2: vec3<f32>, previous_1: f32, age: f32) -> TaaClipDecision {
    var axis: u32 = 0u;
    var streak: u32 = 1u;
    var local_8: bool;

    if (age < TAA_HISTORY_SETTLE_FRAMES) {
        return TaaClipDecision(mix(clipped, history_2, smoothstep(TAA_STABILITY_FRAMES, 64f, age)), (age / 255f));
    }
    let delta = (clipped - history_2);
    let magnitude_1 = abs(delta);
    if (magnitude_1.y > magnitude_1.x) {
        axis = 1u;
    }
    let _e22 = axis;
    if (magnitude_1.z > magnitude_1[_e22]) {
        axis = 2u;
    }
    let scale = max(1f, max(abs(history_2.x), max(abs(history_2.y), abs(history_2.z))));
    let _e36 = axis;
    if (magnitude_1[_e36] <= (scale * 0.00001f)) {
        return TaaClipDecision(history_2, 0.5019608f);
    }
    let _e43 = axis;
    let _e46 = axis;
    let direction = ((_e43 * 2u) + select(0u, 1u, (delta[_e46] > 0f)));
    let code = u32(floor(((clamp(previous_1, 0f, 1f) * 255f) + 0.5f)));
    if (code >= 129u) {
        local_8 = (code <= 170u);
    } else {
        local_8 = false;
    }
    let _e71 = local_8;
    if _e71 {
        let prior = (code - 129u);
        if ((prior / 7u) == direction) {
            streak = ((prior % 7u) + 2u);
        }
    }
    let _e82 = streak;
    if (_e82 >= 8u) {
        return TaaClipDecision(clipped, 0.5019608f);
    }
    let _e91 = streak;
    return TaaClipDecision(history_2, (f32((((129u + (direction * 7u)) + _e91) - 1u)) / 255f));
}

fn fs_taa_resolve(in_1: FullscreenOutput) -> TaaResolveOutput {
    var local_9: bool;
    var local_10: bool;
    var local_11: bool;
    var local_12: bool;
    var local_13: bool;
    var local_14: bool;
    var local_15: bool;
    var local_16: bool;

    let _e2 = textureDimensions(currentColor, 0i);
    let dimensions_4 = vec2<i32>(_e2);
    let _e8 = params.currentJitterUv;
    let currentUv = (in_1.uv + _e8);
    let current_2 = textureSampleLevel(currentColor, currentSampler, currentUv, 0f);
    let pixel_6 = vec2<i32>((currentUv * vec2<f32>(dimensions_4)));
    let _e17 = closestCurrentTemporal(pixel_6, dimensions_4);
    let _e20 = textureDimensions(currentCoverage, 0i);
    let coverageDimensions = vec2<i32>(_e20);
    let coveragePixel = clamp(vec2<i32>(in_1.position.xy), vec2(0i), (coverageDimensions - vec2(1i)));
    let _e33 = params.hasCurrentCoverage;
    if !((_e33 == 0u)) {
        let _e39 = textureLoad(currentCoverage, coveragePixel, 0i);
        local_9 = (_e39.x >= 0.5f);
    } else {
        local_9 = true;
    }
    let currentCovered = local_9;
    let sceneTemporal = _e17.temporal;
    let _e50 = sampleSecondaryReactivity(currentUv);
    let temporal_1 = vec4<f32>(sceneTemporal.xyz, max(sceneTemporal.w, _e50));
    let historyUv = (in_1.uv - temporal_1.xy);
    if all((historyUv >= vec2(0f))) {
        local_10 = all((historyUv <= vec2(1f)));
    } else {
        local_10 = false;
    }
    let historyInBounds = local_10;
    let history_3 = textureSampleLevel(historyColor, historySampler, historyUv, 0f);
    let previousTemporal = textureSampleLevel(historyTemporal, temporalSampler, historyUv, 0f);
    let depthDelta = abs((previousTemporal.z - temporal_1.z));
    let depthThreshold = (0.0025f + (temporal_1.z * 0.01f));
    let _e87 = params.historyValid;
    if !((_e87 == 0u)) {
        local_11 = !(currentCovered);
    } else {
        local_11 = true;
    }
    let _e95 = local_11;
    if !(_e95) {
        local_12 = !(historyInBounds);
    } else {
        local_12 = true;
    }
    let _e101 = local_12;
    if !(_e101) {
        local_13 = (temporal_1.z < 0f);
    } else {
        local_13 = true;
    }
    let _e109 = local_13;
    if !(_e109) {
        if !((previousTemporal.z < 0f)) {
            local_15 = (depthDelta > depthThreshold);
        } else {
            local_15 = true;
        }
        let _e119 = local_15;
        if _e119 {
            local_16 = !(_e17.depthEdge);
        } else {
            local_16 = false;
        }
        let _e125 = local_16;
        local_14 = _e125;
    } else {
        local_14 = true;
    }
    let rejected = local_14;
    let historyPixel = clamp(vec2<i32>((historyUv * vec2<f32>(dimensions_4))), vec2(0i), (dimensions_4 - vec2(1i)));
    let _e141 = textureLoad(historyStability, historyPixel, 0i);
    let priorStability = _e141.x;
    let _e145 = taaStableAge(priorStability, !(rejected), temporal_1, previousTemporal.xy);
    let _e149 = taaNeighborhood(currentUv, current_2.xyz, (_e145 >= TAA_STABILITY_FRAMES));
    let _e151 = clipTaaHistory(_e149, history_3.xyz);
    let _e153 = resolveTaaClipping(_e151, history_3.xyz, priorStability, _e145);
    let clippedHistoryRgb = _e153.history;
    let reactiveFactor = (1f - clamp(temporal_1.w, 0f, 1f));
    let velocityFactor = (1f - clamp((length(temporal_1.xy) * 64f), 0f, 1f));
    let steadyWeight_1 = mix(0.95f, 0.99f, smoothstep(64f, TAA_HISTORY_SETTLE_FRAMES, _e145));
    let _e178 = params.temporalFrameIndex;
    let _e179 = taaAccumulationWeight(_e178, steadyWeight_1);
    let historyWeight_1 = ((_e179 * reactiveFactor) * velocityFactor);
    let _e183 = blendTaaHistory(current_2.xyz, clippedHistoryRgb, historyWeight_1);
    let resolved = select(_e183, current_2.xyz, rejected);
    let _e191 = params.temporalFrameIndex;
    let _e192 = taaRoundingNoise(vec2<u32>(in_1.position.xy), _e191);
    let _e193 = roundTaaHistory(resolved, _e192);
    return TaaResolveOutput(vec4<f32>(_e193, current_2.w), temporal_1, _e153.state);
}

@vertex 
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> FullscreenOutput {
    let _e1 = fullscreen_triangle(vertexIndex);
    return _e1;
}

@fragment 
fn fs_main(in: FullscreenOutput) -> TaaResolveOutput {
    let _e1 = fs_taa_resolve(in);
    return _e1;
}
