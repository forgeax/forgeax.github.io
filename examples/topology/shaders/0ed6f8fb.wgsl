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
    directionalShadowFilter: vec4<f32>,
    spotLightViewProj: array<mat4x4<f32>, 4>,
    temporalCurrentViewProj: mat4x4<f32>,
    temporalPreviousViewProj: mat4x4<f32>,
    temporalProjection: vec4<f32>,
    temporalPreviousCameraPos: vec4<f32>,
    ssrParams: vec4<f32>,
}

struct SsrTemporalParams {
    historyValid: u32,
    maxHistoryWeight: f32,
    depthThreshold: f32,
    normalThreshold: f32,
    currentJitterUv: vec2<f32>,
    previousJitterUv: vec2<f32>,
}

struct SsrCurrentSample {
    color: vec4<f32>,
    reactivity: f32,
}

struct NeighborhoodBounds {
    lower: vec3<f32>,
    upper: vec3<f32>,
}

struct SsrTemporalSample {
    color: vec4<f32>,
    normal: vec3<f32>,
    depth: f32,
}

@group(0) @binding(0) 
var currentTrace: texture_2d<f32>;
@group(0) @binding(1) 
var currentDepth: texture_depth_2d;
@group(0) @binding(2) 
var currentNormal: texture_2d<f32>;
@group(0) @binding(3) 
var previousHistory: texture_2d<f32>;
@group(0) @binding(4) 
var currentTemporal: texture_2d<f32>;
@group(0) @binding(5) 
var historyOutput: texture_storage_2d<rgba16float,write>;
@group(0) @binding(6) 
var<uniform> params: SsrTemporalParams;
@group(0) @binding(7) 
var resolvedOutput: texture_storage_2d<rgba16float,write>;
@group(0) @binding(8) 
var<uniform> view: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(9) 
var previousSurface: texture_2d<f32>;
@group(0) @binding(10) 
var surfaceOutput: texture_storage_2d<rgba8unorm,write>;
@group(0) @binding(11) 
var currentHitReactivity: texture_2d<f32>;

fn isFinite(value: f32) -> bool {
    var local_1: bool;

    if (value == value) {
        local_1 = (abs(value) < 3.402823e38f);
    } else {
        local_1 = false;
    }
    let _e8 = local_1;
    return _e8;
}

fn finiteUnit(value_1: f32) -> f32 {
    let _e4 = isFinite(value_1);
    return select(0f, clamp(value_1, 0f, 1f), _e4);
}

fn finitePositive(value_2: f32) -> f32 {
    var local_2: bool;

    let _e1 = isFinite(value_2);
    if _e1 {
        local_2 = (value_2 >= 0f);
    } else {
        local_2 = false;
    }
    let _e7 = local_2;
    return select(0f, value_2, _e7);
}

fn reprojectUv(uv: vec2<f32>, motion: vec2<f32>) -> vec2<f32> {
    return (uv - motion);
}

fn depthReject(current: f32, previous: f32) -> bool {
    var local_3: bool;
    var local_4: bool;
    var local_5: bool;

    let _e1 = isFinite(current);
    if !(!(_e1)) {
        let _e5 = isFinite(previous);
        local_3 = !(_e5);
    } else {
        local_3 = true;
    }
    let _e10 = local_3;
    if !(_e10) {
        local_4 = (current < 0f);
    } else {
        local_4 = true;
    }
    let _e17 = local_4;
    if !(_e17) {
        local_5 = (previous < 0f);
    } else {
        local_5 = true;
    }
    let _e24 = local_5;
    if _e24 {
        return true;
    }
    let _e28 = params.depthThreshold;
    let threshold = (max(_e28, 0.0001f) + (current * 0.01f));
    return (abs((current - previous)) > threshold);
}

fn normalReject(current_1: vec3<f32>, previous_1: vec3<f32>) -> bool {
    var local_6: bool;
    var local_7: bool;
    var local_8: bool;
    var local_9: bool;

    let currentLength = length(current_1);
    let previousLength = length(previous_1);
    let _e4 = isFinite(currentLength);
    if !(!(_e4)) {
        let _e7 = isFinite(previousLength);
        local_6 = !(_e7);
    } else {
        local_6 = true;
    }
    let _e12 = local_6;
    if !(_e12) {
        local_7 = (currentLength <= 0.0001f);
    } else {
        local_7 = true;
    }
    let _e19 = local_7;
    if !(_e19) {
        local_8 = (previousLength <= 0.0001f);
    } else {
        local_8 = true;
    }
    let _e26 = local_8;
    if _e26 {
        return true;
    }
    let agreement = dot((current_1 / vec3(currentLength)), (previous_1 / vec3(previousLength)));
    let _e33 = isFinite(agreement);
    if !(!(_e33)) {
        let _e38 = params.normalThreshold;
        local_9 = (agreement < clamp(_e38, -1f, 1f));
    } else {
        local_9 = true;
    }
    let _e46 = local_9;
    return _e46;
}

fn viewDistance(depth: f32) -> f32 {
    var local_10: bool;
    var local_11: bool;

    let near = view.temporalProjection.x;
    let far = view.temporalProjection.y;
    let _e16 = isFinite(depth);
    if _e16 {
        local_10 = (depth >= 0f);
    } else {
        local_10 = false;
    }
    let _e22 = local_10;
    if _e22 {
        local_11 = (depth < 1f);
    } else {
        local_11 = false;
    }
    let _e28 = local_11;
    return select(0f, ((near * far) / max((far - (depth * (far - near))), 0.00001f)), _e28);
}

fn ssrLatticeCoordinate(uv_1: vec2<f32>, fullSize: vec2<u32>) -> vec2<f32> {
    return (((uv_1 * vec2<f32>(fullSize)) - vec2(0.5f)) * 0.5f);
}

fn ssrHistoryTap(pixel: vec2<i32>, expectedDepth: f32, normal: vec3<f32>, footprintWeight: f32) -> vec4<f32> {
    var local_12: bool;

    let history_1 = textureLoad(previousHistory, pixel, 0i);
    let surface = textureLoad(previousSurface, pixel, 0i);
    let _e9 = depthReject(expectedDepth, history_1.w);
    if !(_e9) {
        let _e18 = normalReject(normal, ((surface.xyz * 2f) - vec3(1f)));
        local_12 = _e18;
    } else {
        local_12 = true;
    }
    let _e22 = local_12;
    if _e22 {
        return vec4(0f);
    }
    let _e26 = finiteUnit(surface.w);
    let weight = (footprintWeight * _e26);
    return vec4<f32>((history_1.xyz * weight), weight);
}

fn sampleSsrHistory(uv_2: vec2<f32>, fullSize_1: vec2<u32>, expectedDepth_1: f32, normal_1: vec3<f32>) -> vec4<f32> {
    var sum_1: vec4<f32> = vec4(0f);

    let _e4 = ssrLatticeCoordinate(uv_2, fullSize_1);
    let first = vec2<i32>(floor(_e4));
    let fraction = fract(_e4);
    let _e10 = textureDimensions(previousHistory, 0i);
    let last_1 = (vec2<i32>(_e10) - vec2(1i));
    let _e16 = sum_1;
    let _e33 = ssrHistoryTap(clamp((first + vec2<i32>(0i, 0i)), vec2(0i), last_1), expectedDepth_1, normal_1, ((1f - fraction.x) * (1f - fraction.y)));
    sum_1 = (_e16 + _e33);
    let _e35 = sum_1;
    let _e48 = ssrHistoryTap(clamp((first + vec2<i32>(1i, 0i)), vec2(0i), last_1), expectedDepth_1, normal_1, (fraction.x * (1f - fraction.y)));
    sum_1 = (_e35 + _e48);
    let _e50 = sum_1;
    let _e63 = ssrHistoryTap(clamp((first + vec2<i32>(0i, 1i)), vec2(0i), last_1), expectedDepth_1, normal_1, ((1f - fraction.x) * fraction.y));
    sum_1 = (_e50 + _e63);
    let _e65 = sum_1;
    let _e76 = ssrHistoryTap(clamp((first + vec2<i32>(1i, 1i)), vec2(0i), last_1), expectedDepth_1, normal_1, (fraction.x * fraction.y));
    sum_1 = (_e65 + _e76);
    let _e78 = sum_1;
    let _e81 = sum_1.w;
    let _e87 = sum_1.w;
    return vec4<f32>((_e78.xyz / vec3(max(_e81, 0.000001f))), _e87);
}

fn ssrCurrentTap(pixel_1: vec2<i32>, expectedDepth_2: f32, normal_2: vec3<f32>, footprintWeight_1: f32) -> SsrCurrentSample {
    var local_13: bool;
    var reactivity: f32 = 0f;

    let _e6 = textureLoad(currentNormal, (pixel_1 * 2i), 0i);
    let sourceNormal = ((_e6.xyz * 2f) - vec3(1f));
    let _e17 = textureLoad(currentDepth, (pixel_1 * 2i), 0i);
    let _e18 = viewDistance(_e17);
    let _e20 = depthReject(expectedDepth_2, _e18);
    if !(_e20) {
        let _e23 = normalReject(normal_2, sourceNormal);
        local_13 = _e23;
    } else {
        local_13 = true;
    }
    let _e27 = local_13;
    if _e27 {
        return SsrCurrentSample(vec4(0f), 0f);
    }
    let sample = textureLoad(currentTrace, pixel_1, 0i);
    let _e36 = finiteUnit(sample.w);
    let weight_1 = (footprintWeight_1 * _e36);
    if (footprintWeight_1 > 0f) {
        let _e43 = textureLoad(currentHitReactivity, pixel_1, 0i);
        let _e45 = finiteUnit(_e43.x);
        reactivity = _e45;
    }
    let _e50 = reactivity;
    return SsrCurrentSample(vec4<f32>((sample.xyz * weight_1), weight_1), _e50);
}

fn sampleCurrentSsr(uv_3: vec2<f32>, fullSize_2: vec2<u32>, expectedDepth_3: f32, normal_3: vec3<f32>) -> SsrCurrentSample {
    var sum_2: vec4<f32> = vec4(0f);
    var reactivity_1: f32 = 0f;

    let _e4 = ssrLatticeCoordinate(uv_3, fullSize_2);
    let first_1 = vec2<i32>(floor(_e4));
    let fraction_1 = fract(_e4);
    let _e10 = textureDimensions(currentTrace, 0i);
    let last_2 = (vec2<i32>(_e10) - vec2(1i));
    let _e31 = ssrCurrentTap(clamp((first_1 + vec2<i32>(0i, 0i)), vec2(0i), last_2), expectedDepth_3, normal_3, ((1f - fraction_1.x) * (1f - fraction_1.y)));
    let _e33 = sum_2;
    sum_2 = (_e33 + _e31.color);
    let _e37 = reactivity_1;
    reactivity_1 = max(_e37, _e31.reactivity);
    let _e52 = ssrCurrentTap(clamp((first_1 + vec2<i32>(1i, 0i)), vec2(0i), last_2), expectedDepth_3, normal_3, (fraction_1.x * (1f - fraction_1.y)));
    let _e53 = sum_2;
    sum_2 = (_e53 + _e52.color);
    let _e56 = reactivity_1;
    reactivity_1 = max(_e56, _e52.reactivity);
    let _e71 = ssrCurrentTap(clamp((first_1 + vec2<i32>(0i, 1i)), vec2(0i), last_2), expectedDepth_3, normal_3, ((1f - fraction_1.x) * fraction_1.y));
    let _e72 = sum_2;
    sum_2 = (_e72 + _e71.color);
    let _e75 = reactivity_1;
    reactivity_1 = max(_e75, _e71.reactivity);
    let _e88 = ssrCurrentTap(clamp((first_1 + vec2<i32>(1i, 1i)), vec2(0i), last_2), expectedDepth_3, normal_3, (fraction_1.x * fraction_1.y));
    let _e89 = sum_2;
    sum_2 = (_e89 + _e88.color);
    let _e92 = reactivity_1;
    reactivity_1 = max(_e92, _e88.reactivity);
    let _e95 = sum_2;
    let _e98 = sum_2.w;
    let _e104 = sum_2.w;
    let _e106 = reactivity_1;
    return SsrCurrentSample(vec4<f32>((_e95.xyz / vec3(max(_e98, 0.000001f))), _e104), _e106);
}

fn ssrNeighborhoodRow(pixel_2: vec2<i32>, last: vec2<i32>) -> NeighborhoodBounds {
    let _e11 = textureLoad(currentTrace, clamp((pixel_2 + vec2<i32>(-1i, 0i)), vec2(0i), last), 0i);
    let left = _e11.xyz;
    let _e18 = textureLoad(currentTrace, clamp(pixel_2, vec2(0i), last), 0i);
    let center = _e18.xyz;
    let _e29 = textureLoad(currentTrace, clamp((pixel_2 + vec2<i32>(1i, 0i)), vec2(0i), last), 0i);
    let right = _e29.xyz;
    return NeighborhoodBounds(min(min(left, center), right), max(max(left, center), right));
}

fn neighborhoodClamp(pixel_3: vec2<i32>, size: vec2<u32>) -> NeighborhoodBounds {
    let last_3 = (vec2<i32>(size) - vec2(1i));
    let _e10 = ssrNeighborhoodRow((pixel_3 + vec2<i32>(0i, -1i)), last_3);
    let _e11 = ssrNeighborhoodRow(pixel_3, last_3);
    let _e16 = ssrNeighborhoodRow((pixel_3 + vec2<i32>(0i, 1i)), last_3);
    return NeighborhoodBounds(min(min(_e10.lower, _e11.lower), _e16.lower), max(max(_e10.upper, _e11.upper), _e16.upper));
}

fn resolveSsrTemporal(current_2: vec4<f32>, history: vec4<f32>, historyConfidence: f32, lower: vec3<f32>, upper: vec3<f32>, historyInBounds: bool, depthCompatible: bool, normalCompatible: bool, temporal: vec4<f32>) -> vec4<f32> {
    var local_14: bool;
    var local_15: bool;
    var local_16: bool;
    var local_17: bool;

    let clampedHistory = select(history.xyz, clamp(history.xyz, lower, upper), (current_2.w > 0f));
    let _e13 = finiteUnit(temporal.w);
    let reactiveFactor = (1f - _e13);
    let _e20 = finiteUnit((length(temporal.xy) * 64f));
    let velocityFactor = (1f - _e20);
    let _e25 = params.maxHistoryWeight;
    let _e26 = finiteUnit(_e25);
    let _e29 = params.historyValid;
    if (_e29 != 0u) {
        local_14 = historyInBounds;
    } else {
        local_14 = false;
    }
    let _e36 = local_14;
    if _e36 {
        local_15 = depthCompatible;
    } else {
        local_15 = false;
    }
    let _e41 = local_15;
    if _e41 {
        local_16 = normalCompatible;
    } else {
        local_16 = false;
    }
    let _e46 = local_16;
    if _e46 {
        local_17 = (historyConfidence > 0.001f);
    } else {
        local_17 = false;
    }
    let accepted = local_17;
    let weight_2 = select(0f, ((min(_e26, 0.9f) * reactiveFactor) * velocityFactor), accepted);
    let _e63 = finiteUnit(current_2.w);
    let currentMass = ((1f - weight_2) * _e63);
    let _e65 = finiteUnit(historyConfidence);
    let historyMass = (weight_2 * _e65);
    let confidence = (currentMass + historyMass);
    let resolved = (((current_2.xyz * currentMass) + (clampedHistory * historyMass)) / vec3(max(confidence, 0.000001f)));
    return vec4<f32>(resolved, confidence);
}

fn resolveSsrAt(uv_4: vec2<f32>, fullSize_3: vec2<u32>) -> SsrTemporalSample {
    var local_18: bool;

    let _e3 = params.currentJitterUv;
    let currentUv = (uv_4 + _e3);
    let fullPixel = clamp(vec2<i32>((currentUv * vec2<f32>(fullSize_3))), vec2(0i), (vec2<i32>(fullSize_3) - vec2(1i)));
    let depthNdc = textureLoad(currentDepth, vec2<i32>(fullPixel), 0i);
    let _e20 = viewDistance(depthNdc);
    let temporal_1 = textureLoad(currentTemporal, fullPixel, 0i);
    let _e25 = reprojectUv(uv_4, temporal_1.xy);
    if all((_e25 >= vec2(0f))) {
        local_18 = all((_e25 <= vec2(1f)));
    } else {
        local_18 = false;
    }
    let historyInBounds_1 = local_18;
    let _e41 = textureLoad(currentNormal, vec2<i32>(fullPixel), 0i);
    let normal_4 = ((_e41.xyz * 2f) - vec3(1f));
    let sourceUv = ((vec2<f32>(fullPixel) + vec2(0.5f)) / vec2<f32>(fullSize_3));
    let _e56 = view.inverseViewProj;
    let worldH = (_e56 * vec4<f32>(((sourceUv.x * 2f) - 1f), (1f - (sourceUv.y * 2f)), depthNdc, 1f));
    let _e72 = view.temporalPreviousViewProj;
    let priorClip = (_e72 * vec4<f32>((worldH.xyz / vec3(worldH.w)), 1f));
    let _e80 = sampleCurrentSsr(currentUv, fullSize_3, _e20, normal_4);
    let _e82 = sampleSsrHistory(_e25, fullSize_3, priorClip.w, normal_4);
    let size_1 = textureDimensions(currentTrace, 0i);
    let _e86 = ssrLatticeCoordinate(currentUv, fullSize_3);
    let pixel_4 = clamp(vec2<i32>(floor((_e86 + vec2(0.5f)))), vec2(0i), (vec2<i32>(size_1) - vec2(1i)));
    let _e99 = neighborhoodClamp(pixel_4, size_1);
    let _e112 = resolveSsrTemporal(_e80.color, _e82, _e82.w, _e99.lower, _e99.upper, historyInBounds_1, (_e20 > 0f), true, vec4<f32>(temporal_1.xyz, max(temporal_1.w, _e80.reactivity)));
    let _e113 = finitePositive(_e20);
    return SsrTemporalSample(_e112, normal_4, _e113);
}

@compute @workgroup_size(8, 8, 1) 
fn ssr_reflection_mip(@builtin(global_invocation_id) id: vec3<u32>) {
    var local: bool;
    var sum: vec4<f32> = vec4(0f);
    var count: f32 = 0f;
    var y: i32;
    var x: i32;

    let size_2 = textureDimensions(resolvedOutput);
    if any((id.xy >= size_2)) {
        return;
    }
    let sourceSize = textureDimensions(currentTrace, 0i);
    if (sourceSize.x == (size_2.x * 2u)) {
        local = (sourceSize.y == (size_2.y * 2u));
    } else {
        local = false;
    }
    let _e24 = local;
    if _e24 {
        let source = (id.xy * vec2(2u));
        let topLeft = textureLoad(currentTrace, vec2<i32>(source), 0i);
        let topRight = textureLoad(currentTrace, vec2<i32>((source + vec2<u32>(1u, 0u))), 0i);
        let bottomLeft = textureLoad(currentTrace, vec2<i32>((source + vec2<u32>(0u, 1u))), 0i);
        let bottomRight = textureLoad(currentTrace, vec2<i32>((source + vec2<u32>(1u, 1u))), 0i);
        textureStore(resolvedOutput, vec2<i32>(id.xy), ((((topLeft + topRight) + bottomLeft) + bottomRight) * 0.25f));
        return;
    }
    let first_2 = vec2<i32>(((id.xy * sourceSize) / size_2));
    let end = vec2<i32>((((id.xy + vec2(1u)) * sourceSize) / size_2));
    y = first_2.y;
    loop {
        let _e78 = y;
        if (_e78 < end.y) {
        } else {
            break;
        }
        {
            x = first_2.x;
            loop {
                let _e83 = x;
                if (_e83 < end.x) {
                } else {
                    break;
                }
                {
                    let _e86 = x;
                    let _e87 = y;
                    let sample_1 = textureLoad(currentTrace, vec2<i32>(_e86, _e87), 0i);
                    let coverage = clamp(sample_1.w, 0f, 1f);
                    let _e97 = sum;
                    sum = (_e97 + vec4<f32>(sample_1.xyz, coverage));
                    let _e102 = count;
                    count = (_e102 + 1f);
                }
                continuing {
                    let _e106 = x;
                    x = (_e106 + 1i);
                }
            }
        }
        continuing {
            let _e109 = y;
            y = (_e109 + 1i);
        }
    }
    let _e113 = sum;
    let _e115 = count;
    let _e121 = sum.w;
    let _e122 = count;
    textureStore(resolvedOutput, vec2<i32>(id.xy), vec4<f32>((_e113.xyz / vec3(max(_e115, 1f))), (_e121 / max(_e122, 1f))));
    return;
}

@compute @workgroup_size(8, 8, 1) 
fn ssr_temporal(@builtin(global_invocation_id) globalId: vec3<u32>) {
    var presented: vec4<f32>;

    let size_3 = textureDimensions(currentTrace, 0i);
    if any((globalId.xy >= size_3)) {
        return;
    }
    let pixel_5 = vec2<i32>(globalId.xy);
    let fullSize_4 = textureDimensions(currentDepth, 0i);
    let uv_5 = ((vec2<f32>((globalId.xy * 2u)) + vec2(0.5f)) / vec2<f32>(fullSize_4));
    let _e21 = resolveSsrAt(uv_5, fullSize_4);
    textureStore(historyOutput, pixel_5, vec4<f32>(_e21.color.xyz, _e21.depth));
    textureStore(surfaceOutput, pixel_5, vec4<f32>(((_e21.normal * 0.5f) + vec3(0.5f)), _e21.color.w));
    presented = _e21.color;
    let _e41 = params.currentJitterUv;
    if any((_e41 != vec2(0f))) {
        let _e48 = params.currentJitterUv;
        let _e50 = resolveSsrAt((uv_5 - _e48), fullSize_4);
        presented = _e50.color;
    }
    let _e52 = presented;
    let _e55 = presented.w;
    let _e58 = presented.w;
    textureStore(resolvedOutput, pixel_5, vec4<f32>((_e52.xyz * _e55), _e58));
    return;
}
