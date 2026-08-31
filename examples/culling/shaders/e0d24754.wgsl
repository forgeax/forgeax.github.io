struct FullscreenOutput {
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

fn rgbToYCoCg(rgb: vec3<f32>) -> vec3<f32> {
    return vec3<f32>(dot(rgb, vec3<f32>(0.25f, 0.5f, 0.25f)), dot(rgb, vec3<f32>(0.5f, 0f, -0.5f)), dot(rgb, vec3<f32>(-0.25f, 0.5f, -0.25f)));
}

fn yCoCgToRgb(value: vec3<f32>) -> vec3<f32> {
    return vec3<f32>(((value.x + value.y) - value.z), (value.x + value.z), ((value.x - value.y) - value.z));
}

fn luminance(rgb_1: vec3<f32>) -> f32 {
    return dot(rgb_1, vec3<f32>(0.2126f, 0.7152f, 0.0722f));
}

fn closestCurrentTemporal(pixel: vec2<i32>, dimensions: vec2<i32>) -> vec4<f32> {
    let clamped = clamp(pixel, vec2(0i), (dimensions - vec2(1i)));
    let _e10 = textureLoad(currentTemporal, clamped, 0i);
    return _e10;
}

fn neighborhoodSquareMean(uv: vec2<f32>, texel: vec2<f32>) -> vec3<f32> {
    let _e9 = textureSampleLevel(currentColor, currentSampler, (uv + vec2<f32>(0f, texel.y)), 0f);
    let north = _e9.xyz;
    let _e18 = textureSampleLevel(currentColor, currentSampler, (uv - vec2<f32>(0f, texel.y)), 0f);
    let south = _e18.xyz;
    let _e27 = textureSampleLevel(currentColor, currentSampler, (uv + vec2<f32>(texel.x, 0f)), 0f);
    let east = _e27.xyz;
    let _e36 = textureSampleLevel(currentColor, currentSampler, (uv - vec2<f32>(texel.x, 0f)), 0f);
    let west = _e36.xyz;
    return ((((north + south) + east) + west) * 0.25f);
}

fn fs_taa_resolve(in_1: FullscreenOutput) -> TaaResolveOutput {
    var local: bool;
    var local_1: bool;
    var local_2: bool;
    var local_3: bool;
    var local_4: bool;

    let _e2 = textureDimensions(currentColor, 0i);
    let dimensions_1 = vec2<i32>(_e2);
    let texel_1 = (vec2(1f) / vec2<f32>(dimensions_1));
    let _e12 = params.currentJitterUv;
    let current = textureSampleLevel(currentColor, currentSampler, (in_1.uv + _e12), 0f);
    let pixel_1 = vec2<i32>((in_1.uv * vec2<f32>(dimensions_1)));
    let _e22 = closestCurrentTemporal(pixel_1, dimensions_1);
    let historyUv = (in_1.uv - _e22.xy);
    if all((historyUv >= vec2(0f))) {
        local = all((historyUv <= vec2(1f)));
    } else {
        local = false;
    }
    let historyInBounds = local;
    let history = textureSampleLevel(historyColor, historySampler, historyUv, 0f);
    let previousTemporal = textureSampleLevel(historyTemporal, temporalSampler, historyUv, 0f);
    let depthDelta = abs((previousTemporal.z - _e22.z));
    let depthThreshold = (0.0025f + (_e22.z * 0.01f));
    let _e57 = params.historyValid;
    if !((_e57 == 0u)) {
        local_1 = !(historyInBounds);
    } else {
        local_1 = true;
    }
    let _e65 = local_1;
    if !(_e65) {
        local_2 = (_e22.z < 0f);
    } else {
        local_2 = true;
    }
    let _e73 = local_2;
    if !(_e73) {
        local_3 = (previousTemporal.z < 0f);
    } else {
        local_3 = true;
    }
    let _e81 = local_3;
    if !(_e81) {
        local_4 = (depthDelta > depthThreshold);
    } else {
        local_4 = true;
    }
    let rejected = local_4;
    let _e89 = neighborhoodSquareMean(in_1.uv, texel_1);
    let _e91 = luminance(current.xyz);
    let _e92 = luminance(_e89);
    let neighborhoodDelta = abs((_e91 - _e92));
    let clipPadding = vec3(0.5f);
    let _e102 = rgbToYCoCg(min(current.xyz, ((_e89 - vec3(neighborhoodDelta)) - clipPadding)));
    let _e108 = rgbToYCoCg(max(current.xyz, ((_e89 + vec3(neighborhoodDelta)) + clipPadding)));
    let _e110 = rgbToYCoCg(history.xyz);
    let _e112 = yCoCgToRgb(clamp(_e110, _e102, _e108));
    let reactiveFactor = (1f - clamp(_e22.w, 0f, 1f));
    let velocityFactor = (1f - clamp((length(_e22.xy) * 64f), 0f, 1f));
    let depthFactor = (1f - clamp((depthDelta / depthThreshold), 0f, 1f));
    let _e135 = luminance(current.xyz);
    let _e137 = luminance(history.xyz);
    let unbiasedLumaDelta = clamp(abs((_e135 - _e137)), 0f, 1f);
    let lumaFactor = ((1f - unbiasedLumaDelta) * (1f - unbiasedLumaDelta));
    let fixedPresetWeight = mix(0.88f, 0.97f, lumaFactor);
    let _e153 = params.temporalFrameIndex;
    let progressiveWeight = select(fixedPresetWeight, 0f, (_e153 < 8u));
    let historyWeight = (((progressiveWeight * reactiveFactor) * velocityFactor) * depthFactor);
    let resolved = select(mix(current.xyz, _e112, historyWeight), current.xyz, rejected);
    return TaaResolveOutput(vec4<f32>(resolved, current.w), _e22);
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
