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

struct ComposeVertex {
    @builtin(position) position: vec4<f32>,
}

struct SsrReceiverSample {
    radiance: vec4<f32>,
    coverage: f32,
}

@group(0) @binding(0) 
var radiance: texture_2d<f32>;
@group(0) @binding(1) 
var fallback: texture_2d<f32>;
@group(0) @binding(2) 
var response: texture_2d<f32>;
@group(0) @binding(3) 
var normalRoughness: texture_2d<f32>;
@group(0) @binding(4) 
var radianceSampler: sampler;
@group(0) @binding(5) 
var<uniform> view: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

fn ssrReceiverWeight(current: vec3<f32>, traced: vec3<f32>) -> f32 {
    let agreement = (dot(current, traced) * inverseSqrt(max((dot(current, current) * dot(traced, traced)), 0.00000001f)));
    return smoothstep(0.9f, 0.99f, agreement);
}

fn ssrReceiverSample(uv: vec2<f32>, normal: vec3<f32>) -> SsrReceiverSample {
    var sum: vec4<f32> = vec4(0f);
    var totalWeight: f32 = 0f;

    let _e4 = textureDimensions(radiance, 0i);
    let size = vec2<i32>(_e4);
    let coordinate = ((uv * vec2<f32>(size)) - vec2(0.5f));
    let first = vec2<i32>(floor(coordinate));
    let fraction = fract(coordinate);
    let pixel00_ = clamp((first + vec2<i32>(0i, 0i)), vec2(0i), (size - vec2(1i)));
    let _e29 = textureLoad(normalRoughness, (pixel00_ * 2i), 0i);
    let tracedNormal00_ = ((_e29.xyz * 2f) - vec3(1f));
    let _e50 = ssrReceiverWeight(normal, tracedNormal00_);
    let weight00_ = ((select((1f - fraction.x), fraction.x, false) * select((1f - fraction.y), fraction.y, false)) * _e50);
    let sample00_ = textureLoad(radiance, pixel00_, 0i);
    let _e56 = sum;
    sum = (_e56 + (sample00_ * weight00_));
    let _e60 = totalWeight;
    totalWeight = (_e60 + weight00_);
    let pixel10_ = clamp((first + vec2<i32>(1i, 0i)), vec2(0i), (size - vec2(1i)));
    let _e76 = textureLoad(normalRoughness, (pixel10_ * 2i), 0i);
    let tracedNormal10_ = ((_e76.xyz * 2f) - vec3(1f));
    let _e96 = ssrReceiverWeight(normal, tracedNormal10_);
    let weight10_ = ((select((1f - fraction.x), fraction.x, true) * select((1f - fraction.y), fraction.y, false)) * _e96);
    let sample10_ = textureLoad(radiance, pixel10_, 0i);
    let _e101 = sum;
    sum = (_e101 + (sample10_ * weight10_));
    let _e104 = totalWeight;
    totalWeight = (_e104 + weight10_);
    let pixel01_ = clamp((first + vec2<i32>(0i, 1i)), vec2(0i), (size - vec2(1i)));
    let _e120 = textureLoad(normalRoughness, (pixel01_ * 2i), 0i);
    let tracedNormal01_ = ((_e120.xyz * 2f) - vec3(1f));
    let _e140 = ssrReceiverWeight(normal, tracedNormal01_);
    let weight01_ = ((select((1f - fraction.x), fraction.x, false) * select((1f - fraction.y), fraction.y, true)) * _e140);
    let sample01_ = textureLoad(radiance, pixel01_, 0i);
    let _e145 = sum;
    sum = (_e145 + (sample01_ * weight01_));
    let _e148 = totalWeight;
    totalWeight = (_e148 + weight01_);
    let pixel11_ = clamp((first + vec2<i32>(1i, 1i)), vec2(0i), (size - vec2(1i)));
    let _e164 = textureLoad(normalRoughness, (pixel11_ * 2i), 0i);
    let tracedNormal11_ = ((_e164.xyz * 2f) - vec3(1f));
    let _e184 = ssrReceiverWeight(normal, tracedNormal11_);
    let weight11_ = ((select((1f - fraction.x), fraction.x, true) * select((1f - fraction.y), fraction.y, true)) * _e184);
    let sample11_ = textureLoad(radiance, pixel11_, 0i);
    let _e189 = sum;
    sum = (_e189 + (sample11_ * weight11_));
    let _e192 = totalWeight;
    totalWeight = (_e192 + weight11_);
    let _e194 = sum;
    let _e195 = totalWeight;
    let _e200 = totalWeight;
    return SsrReceiverSample((_e194 / vec4(max(_e195, 0.000001f))), _e200);
}

fn ssrReflectionLod(roughness: f32) -> f32 {
    let _e3 = textureNumLevels(radiance);
    return ((roughness * roughness) * f32((_e3 - 1u)));
}

fn sampleRoughSsr(uv_1: vec2<f32>, roughness_1: f32) -> vec4<f32> {
    let _e1 = ssrReflectionLod(roughness_1);
    let _e5 = textureSampleLevel(radiance, radianceSampler, uv_1, _e1);
    return _e5;
}

@vertex 
fn vs_ssr_compose(@builtin(vertex_index) index: u32) -> ComposeVertex {
    let x = select(-1f, 3f, (index == 1u));
    let y = select(-1f, 3f, (index == 2u));
    return ComposeVertex(vec4<f32>(x, y, 0f, 1f));
}

@fragment 
fn fs_ssr_compose(in: ComposeVertex) -> @location(0) vec4<f32> {
    var local: bool;
    var local_1: bool;
    var local_2: bool;
    var local_3: bool;
    var filtered: vec4<f32>;

    let pixel = vec2<i32>(in.position.xy);
    let _e11 = textureDimensions(fallback, 0i);
    let uv_2 = ((in.position.xy + vec2(0.5f)) / vec2<f32>(_e11));
    let receiver = textureLoad(normalRoughness, pixel, 0i);
    let environment = textureLoad(fallback, pixel, 0i);
    let _e23 = view.ssrParams.z;
    let roughnessLimit = clamp(_e23, 0f, 1f);
    let _e30 = view.ssrParams.w;
    if (_e30 > 0.5f) {
        let _e36 = view.ssrParams.w;
        local = (_e36 < 3.402823e38f);
    } else {
        local = false;
    }
    let _e42 = local;
    if !(!(_e42)) {
        if (receiver.w >= 0f) {
            local_2 = (receiver.w < roughnessLimit);
        } else {
            local_2 = false;
        }
        let _e53 = local_2;
        local_1 = !(_e53);
    } else {
        local_1 = true;
    }
    let _e58 = local_1;
    if !(_e58) {
        local_3 = (environment.w <= 0f);
    } else {
        local_3 = true;
    }
    let _e66 = local_3;
    if _e66 {
        return vec4(0f);
    }
    let _e75 = ssrReceiverSample(uv_2, ((receiver.xyz * 2f) - vec3(1f)));
    if (_e75.coverage <= 0.000001f) {
        return vec4(0f);
    }
    let base = _e75.radiance;
    let roughness_2 = clamp(receiver.w, 0.04f, 1f);
    let _e86 = ssrReflectionLod(roughness_2);
    filtered = base;
    if (_e86 < 1f) {
        let _e91 = textureNumLevels(radiance);
        if (_e91 > 1u) {
            let _e97 = textureSampleLevel(radiance, radianceSampler, uv_2, 1f);
            filtered = mix(base, _e97, _e86);
        }
    } else {
        let _e99 = sampleRoughSsr(uv_2, roughness_2);
        filtered = _e99;
    }
    let _e100 = filtered;
    let _e103 = filtered.w;
    let _e109 = filtered.w;
    let sample = vec4<f32>((_e100.xyz / vec3(max(_e103, 0.000001f))), _e109);
    let _e113 = textureLoad(response, pixel, 0i);
    let materialResponse = _e113.xyz;
    let receiverConfidence = (1f - smoothstep((roughnessLimit * 0.8f), roughnessLimit, receiver.w));
    let confidence = (clamp(min(receiverConfidence, sample.w), 0f, 1f) * environment.w);
    return vec4<f32>((confidence * ((sample.xyz * materialResponse) - environment.xyz)), 0f);
}
