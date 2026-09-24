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
    cloudShadowOrigin: vec4<f32>,
    cloudShadowRight: vec4<f32>,
    cloudShadowUp: vec4<f32>,
    cloudShadowProjection: vec4<f32>,
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
var normalRoughness: texture_2d<u32>;
@group(0) @binding(4) 
var radianceSampler: sampler;
@group(0) @binding(5) 
var<uniform> view: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

fn decodeStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(packed: u32) -> vec4<f32> {
    var normal: vec3<f32>;

    let oct = ((vec2<f32>(f32((packed & 4095u)), f32(((packed >> 12u) & 4095u))) * 0.0004884005f) - vec2(1f));
    normal = vec3<f32>(oct, ((1f - abs(oct.x)) - abs(oct.y)));
    let _e25 = normal.z;
    let fold = max(-(_e25), 0f);
    let _e29 = normal;
    let _e34 = normal;
    let _e42 = normal.z;
    normal = vec3<f32>((_e29.xy + select(vec2(fold), vec2(-(fold)), (_e34.xy >= vec2(0f)))), _e42);
    let _e44 = normal;
    return vec4<f32>(normalize(_e44), (f32((packed >> 24u)) / 255f));
}

fn loadStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(source: texture_2d<u32>, pixel: vec2<i32>) -> vec4<f32> {
    let _e3 = textureLoad(source, pixel, 0i);
    let _e5 = decodeStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(_e3.x);
    return _e5;
}

fn ssrReceiverWeight(current: vec3<f32>, traced: vec3<f32>) -> f32 {
    let agreement = (dot(current, traced) * inverseSqrt(max((dot(current, current) * dot(traced, traced)), 0.00000001f)));
    return smoothstep(0.9f, 0.99f, agreement);
}

fn ssrReceiverSample(uv: vec2<f32>, normal_1: vec3<f32>) -> SsrReceiverSample {
    var sum: vec4<f32> = vec4(0f);
    var totalWeight: f32 = 0f;

    let _e4 = textureDimensions(radiance, 0i);
    let size = vec2<i32>(_e4);
    let coordinate = ((uv * vec2<f32>(size)) - vec2(0.5f));
    let first = vec2<i32>(floor(coordinate));
    let fraction = fract(coordinate);
    let pixel00_ = clamp((first + vec2<i32>(0i, 0i)), vec2(0i), (size - vec2(1i)));
    let _e28 = loadStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(normalRoughness, (pixel00_ * 2i));
    let tracedNormal00_ = _e28.xyz;
    let _e44 = ssrReceiverWeight(normal_1, tracedNormal00_);
    let weight00_ = ((select((1f - fraction.x), fraction.x, false) * select((1f - fraction.y), fraction.y, false)) * _e44);
    let sample00_ = textureLoad(radiance, pixel00_, 0i);
    let _e50 = sum;
    sum = (_e50 + (sample00_ * weight00_));
    let _e54 = totalWeight;
    totalWeight = (_e54 + weight00_);
    let pixel10_ = clamp((first + vec2<i32>(1i, 0i)), vec2(0i), (size - vec2(1i)));
    let _e69 = loadStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(normalRoughness, (pixel10_ * 2i));
    let tracedNormal10_ = _e69.xyz;
    let _e84 = ssrReceiverWeight(normal_1, tracedNormal10_);
    let weight10_ = ((select((1f - fraction.x), fraction.x, true) * select((1f - fraction.y), fraction.y, false)) * _e84);
    let sample10_ = textureLoad(radiance, pixel10_, 0i);
    let _e89 = sum;
    sum = (_e89 + (sample10_ * weight10_));
    let _e92 = totalWeight;
    totalWeight = (_e92 + weight10_);
    let pixel01_ = clamp((first + vec2<i32>(0i, 1i)), vec2(0i), (size - vec2(1i)));
    let _e107 = loadStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(normalRoughness, (pixel01_ * 2i));
    let tracedNormal01_ = _e107.xyz;
    let _e122 = ssrReceiverWeight(normal_1, tracedNormal01_);
    let weight01_ = ((select((1f - fraction.x), fraction.x, false) * select((1f - fraction.y), fraction.y, true)) * _e122);
    let sample01_ = textureLoad(radiance, pixel01_, 0i);
    let _e127 = sum;
    sum = (_e127 + (sample01_ * weight01_));
    let _e130 = totalWeight;
    totalWeight = (_e130 + weight01_);
    let pixel11_ = clamp((first + vec2<i32>(1i, 1i)), vec2(0i), (size - vec2(1i)));
    let _e145 = loadStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(normalRoughness, (pixel11_ * 2i));
    let tracedNormal11_ = _e145.xyz;
    let _e160 = ssrReceiverWeight(normal_1, tracedNormal11_);
    let weight11_ = ((select((1f - fraction.x), fraction.x, true) * select((1f - fraction.y), fraction.y, true)) * _e160);
    let sample11_ = textureLoad(radiance, pixel11_, 0i);
    let _e165 = sum;
    sum = (_e165 + (sample11_ * weight11_));
    let _e168 = totalWeight;
    totalWeight = (_e168 + weight11_);
    let _e170 = sum;
    let _e171 = totalWeight;
    let _e176 = totalWeight;
    return SsrReceiverSample((_e170 / vec4(max(_e171, 0.000001f))), _e176);
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

    let pixel_1 = vec2<i32>(in.position.xy);
    let _e11 = textureDimensions(fallback, 0i);
    let uv_2 = ((in.position.xy + vec2(0.5f)) / vec2<f32>(_e11));
    let _e15 = loadStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(normalRoughness, pixel_1);
    let environment = textureLoad(fallback, pixel_1, 0i);
    let _e22 = view.ssrParams.z;
    let roughnessLimit = clamp(_e22, 0f, 1f);
    let _e29 = view.ssrParams.w;
    if (_e29 > 0.5f) {
        let _e35 = view.ssrParams.w;
        local = (_e35 < 3.402823e38f);
    } else {
        local = false;
    }
    let _e41 = local;
    if !(!(_e41)) {
        if (_e15.w >= 0f) {
            local_2 = (_e15.w < roughnessLimit);
        } else {
            local_2 = false;
        }
        let _e52 = local_2;
        local_1 = !(_e52);
    } else {
        local_1 = true;
    }
    let _e57 = local_1;
    if !(_e57) {
        local_3 = (environment.w <= 0f);
    } else {
        local_3 = true;
    }
    let _e65 = local_3;
    if _e65 {
        return vec4(0f);
    }
    let _e69 = ssrReceiverSample(uv_2, _e15.xyz);
    if (_e69.coverage <= 0.000001f) {
        return vec4(0f);
    }
    let base = _e69.radiance;
    let roughness_2 = clamp(_e15.w, 0.04f, 1f);
    let _e80 = ssrReflectionLod(roughness_2);
    filtered = base;
    if (_e80 < 1f) {
        let _e85 = textureNumLevels(radiance);
        if (_e85 > 1u) {
            let _e91 = textureSampleLevel(radiance, radianceSampler, uv_2, 1f);
            filtered = mix(base, _e91, _e80);
        }
    } else {
        let _e93 = sampleRoughSsr(uv_2, roughness_2);
        filtered = _e93;
    }
    let _e94 = filtered;
    let _e97 = filtered.w;
    let _e103 = filtered.w;
    let sample = vec4<f32>((_e94.xyz / vec3(max(_e97, 0.000001f))), _e103);
    let _e107 = textureLoad(response, pixel_1, 0i);
    let materialResponse = _e107.xyz;
    let receiverConfidence = (1f - smoothstep((roughnessLimit * 0.8f), roughnessLimit, _e15.w));
    let confidence = (clamp(min(receiverConfidence, sample.w), 0f, 1f) * environment.w);
    return vec4<f32>((confidence * ((sample.xyz * materialResponse) - environment.xyz)), 0f);
}
