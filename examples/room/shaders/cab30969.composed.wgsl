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
    clippingPlanes: array<vec4<f32>, 6>,
    clippingControl: vec4<f32>,
}

struct ShadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    index: u32,
    isSpot: u32,
    shadowCasterPadB: u32,
    shadowCasterPadC: u32,
    spotLightViewProj: mat4x4<f32>,
}

struct MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    worldFromLocal: mat4x4<f32>,
    normalMatrix: mat3x3<f32>,
    previousWorldFromLocal: mat4x4<f32>,
    temporal: vec4<f32>,
}

struct MaterialParameters {
    baseColor: vec4<f32>,
    metallic: f32,
    roughness: f32,
    metallicChannel: f32,
    roughnessChannel: f32,
    aoChannel: f32,
    extraChannel: f32,
    emissive: vec3<f32>,
    emissiveIntensity: f32,
    occlusionStrength: f32,
    alphaCutoff: f32,
    specular: f32,
    alphaHash: f32,
    specularColor: vec3<f32>,
    normalScale: vec2<f32>,
    bumpScale: f32,
    transmission: f32,
    ior: f32,
    thickness: f32,
    attenuationColor: vec3<f32>,
    attenuationDistance: f32,
    baseColorTextureCoordinatesTransform: vec4<f32>,
    baseColorTextureCoordinatesMetadata: vec4<f32>,
    metallicRoughnessTextureCoordinatesTransform: vec4<f32>,
    metallicRoughnessTextureCoordinatesMetadata: vec4<f32>,
    normalTextureCoordinatesTransform: vec4<f32>,
    normalTextureCoordinatesMetadata: vec4<f32>,
    emissiveTextureCoordinatesTransform: vec4<f32>,
    emissiveTextureCoordinatesMetadata: vec4<f32>,
    occlusionTextureCoordinatesTransform: vec4<f32>,
    occlusionTextureCoordinatesMetadata: vec4<f32>,
    transmissionTextureCoordinatesTransform: vec4<f32>,
    transmissionTextureCoordinatesMetadata: vec4<f32>,
    thicknessTextureCoordinatesTransform: vec4<f32>,
    thicknessTextureCoordinatesMetadata: vec4<f32>,
    bumpTextureCoordinatesTransform: vec4<f32>,
    bumpTextureCoordinatesMetadata: vec4<f32>,
    anisotropyStrength: f32,
    anisotropyRotation: f32,
    iridescence: f32,
    iridescenceIor: f32,
    iridescenceThicknessMinimum: f32,
    iridescenceThicknessMaximum: f32,
    sheenColor: vec3<f32>,
    sheenRoughness: f32,
    clearcoat: f32,
    clearcoatRoughness: f32,
    clearcoatNormalScale: f32,
    alphaChannel: f32,
    metallicTextureCoordinatesTransform: vec4<f32>,
    metallicTextureCoordinatesMetadata: vec4<f32>,
    roughnessTextureCoordinatesTransform: vec4<f32>,
    roughnessTextureCoordinatesMetadata: vec4<f32>,
    alphaTextureCoordinatesTransform: vec4<f32>,
    alphaTextureCoordinatesMetadata: vec4<f32>,
}

struct SurfaceInput {
    positionOS: vec3<f32>,
    positionWS: vec3<f32>,
    geometricNormalWS: vec3<f32>,
    tangentWS: vec4<f32>,
    viewDirectionWS: vec3<f32>,
    uv0_: vec2<f32>,
    uv1_: vec2<f32>,
    uv2_: vec2<f32>,
    uv3_: vec2<f32>,
    uv4_: vec2<f32>,
    uv5_: vec2<f32>,
    uv6_: vec2<f32>,
    uv7_: vec2<f32>,
    vertexColor: vec4<f32>,
    frontFacing: bool,
}

struct SurfaceData {
    baseColor: vec3<f32>,
    normalWS: vec3<f32>,
    metallic: f32,
    roughness: f32,
    emissive: vec3<f32>,
    occlusion: f32,
    opacity: f32,
    alphaClipThreshold: f32,
}

struct VsInput {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) tangent: vec4<f32>,
    @location(13) color: vec4<f32>,
    @location(6) uv1_: vec2<f32>,
    @location(7) uv2_: vec2<f32>,
    @location(8) uv3_: vec2<f32>,
    @location(9) uv4_: vec2<f32>,
    @location(10) uv5_: vec2<f32>,
    @location(11) uv6_: vec2<f32>,
    @location(12) uv7_: vec2<f32>,
    @location(4) @interpolate(flat) skinIndex: vec4<u32>,
    @location(5) skinWeight: vec4<f32>,
}

struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) positionOS: vec3<f32>,
    @location(1) positionWS: vec3<f32>,
    @location(2) normalWS: vec3<f32>,
    @location(3) tangentWS: vec4<f32>,
    @location(4) surfaceUv: vec2<f32>,
    @location(5) uv1_: vec2<f32>,
    @location(6) uv2_: vec2<f32>,
    @location(7) uv3_: vec2<f32>,
    @location(8) uv4_: vec2<f32>,
    @location(9) uv5_: vec2<f32>,
    @location(10) uv6And7_: vec4<f32>,
    @location(12) color: vec4<f32>,
}

@id(64000) override standardTextureMask: u32 = 2097151u;

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(7) 
var<uniform> shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ShadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(1) @binding(0) 
var<uniform> material: MaterialParameters;
@group(1) @binding(1) 
var baseColorTexture_sampler: sampler;
@group(1) @binding(2) 
var baseColorTexture: texture_2d<f32>;
@group(1) @binding(3) 
var metallicRoughnessTexture_sampler: sampler;
@group(1) @binding(4) 
var metallicRoughnessTexture: texture_2d<f32>;
@group(1) @binding(5) 
var normalTexture_sampler: sampler;
@group(1) @binding(6) 
var normalTexture: texture_2d<f32>;
@group(1) @binding(7) 
var emissiveTexture_sampler: sampler;
@group(1) @binding(8) 
var emissiveTexture: texture_2d<f32>;
@group(1) @binding(9) 
var occlusionTexture_sampler: sampler;
@group(1) @binding(10) 
var occlusionTexture: texture_2d<f32>;
@group(1) @binding(11) 
var transmissionTexture_sampler: sampler;
@group(1) @binding(12) 
var transmissionTexture: texture_2d<f32>;
@group(1) @binding(13) 
var thicknessTexture_sampler: sampler;
@group(1) @binding(14) 
var thicknessTexture: texture_2d<f32>;
@group(1) @binding(17) 
var metallicTexture_sampler: sampler;
@group(1) @binding(18) 
var metallicTexture: texture_2d<f32>;
@group(1) @binding(19) 
var roughnessTexture_sampler: sampler;
@group(1) @binding(20) 
var roughnessTexture: texture_2d<f32>;
@group(1) @binding(21) 
var alphaTexture_sampler: sampler;
@group(1) @binding(22) 
var alphaTexture: texture_2d<f32>;
@group(2) @binding(1) 
var<storage> palette: array<mat4x4<f32>>;

fn clippedByPlanesX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS: vec3<f32>, planes: array<vec4<f32>, 6>, control: vec4<f32>) -> bool {
    var allOutside: bool;
    var anyOutside: bool = false;
    var index: u32 = 0u;
    var local: bool;
    var local_1: bool;

    let count = min(u32(max(control.x, 0f)), 6u);
    allOutside = (count > 0u);
    loop {
        let _e13 = index;
        if (_e13 < count) {
        } else {
            break;
        }
        {
            let _e17 = index;
            let _e21 = index;
            let outside = ((dot(planes[_e17].xyz, positionWS) + planes[_e21].w) < 0f);
            let _e28 = anyOutside;
            if !(_e28) {
                local = outside;
            } else {
                local = true;
            }
            let _e33 = local;
            anyOutside = _e33;
            let _e34 = allOutside;
            if _e34 {
                local_1 = outside;
            } else {
                local_1 = false;
            }
            let _e38 = local_1;
            allOutside = _e38;
        }
        continuing {
            let _e40 = index;
            index = (_e40 + 1u);
        }
    }
    let _e42 = anyOutside;
    let _e43 = allOutside;
    return select(_e42, _e43, (control.y > 0.5f));
}

fn applyLocalClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS_1: vec3<f32>, shadow: bool, planes_1: array<vec4<f32>, 6>, control_1: vec4<f32>) {
    var local_2: bool;
    var local_3: bool;

    if !(!(shadow)) {
        local_2 = (control_1.z > 0.5f);
    } else {
        local_2 = true;
    }
    let _e10 = local_2;
    if _e10 {
        let _e13 = clippedByPlanesX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS_1, planes_1, control_1);
        local_3 = _e13;
    } else {
        local_3 = false;
    }
    let _e17 = local_3;
    if _e17 {
        discard;
    } else {
        return;
    }
}

fn applyViewClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS_2: vec3<f32>, shadow_1: bool) {
    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.clippingPlanes;
    let _e5 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.clippingControl;
    applyLocalClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS_2, shadow_1, _e2, _e5);
    return;
}

fn decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(rg: vec2<f32>) -> vec3<f32> {
    let xy = ((rg * 2f) - vec2(1f));
    let z = sqrt(saturate((1f - dot(xy, xy))));
    return vec3<f32>(xy, z);
}

fn scaleTangentSpaceNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(tn: vec3<f32>, scale: vec2<f32>) -> vec3<f32> {
    let scaled = vec3<f32>((tn.xy * scale), tn.z);
    if (dot(scaled, scaled) < 0.00000000000000000001f) {
        return vec3<f32>(0f, 0f, 1f);
    }
    return scaled;
}

fn perturbBumpNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(positionWS_3: vec3<f32>, normalWS: vec3<f32>, heightGradient: vec2<f32>, faceDirection: f32) -> vec3<f32> {
    let dx = dpdx(positionWS_3);
    let dy = dpdy(positionWS_3);
    let sx = (dx * inverseSqrt(max(dot(dx, dx), 0.00000000000000000001f)));
    let sy = (dy * inverseSqrt(max(dot(dy, dy), 0.00000000000000000001f)));
    let r1_ = cross(sy, normalWS);
    let r2_ = cross(normalWS, sx);
    let determinant_ = (dot(sx, r1_) * faceDirection);
    let gradient = (sign(determinant_) * ((heightGradient.x * r1_) + (heightGradient.y * r2_)));
    let perturbed = ((abs(determinant_) * normalWS) - gradient);
    if (dot(perturbed, perturbed) < 0.00000000000000000001f) {
        return normalWS;
    }
    return normalize(perturbed);
}

fn applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(worldNormal: vec3<f32>, worldTangent: vec4<f32>, tn_1: vec3<f32>) -> vec3<f32> {
    let n0_ = normalize(worldNormal);
    let t0_ = normalize((worldTangent.xyz - (dot(worldTangent.xyz, n0_) * n0_)));
    let b0_ = (cross(n0_, t0_) * worldTangent.w);
    return normalize((((t0_ * tn_1.x) + (b0_ * tn_1.y)) + (n0_ * tn_1.z)));
}

fn alphaHash2DX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(value: vec2<f32>) -> f32 {
    return fract(((10000f * sin(((17f * value.x) + (0.1f * value.y)))) * (0.1f + abs(sin(((13f * value.y) + value.x))))));
}

fn alphaHash3DX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(value_1: vec3<f32>) -> f32 {
    let _e2 = alphaHash2DX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(value_1.xy);
    let _e5 = alphaHash2DX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(vec2<f32>(_e2, value_1.z));
    return _e5;
}

fn alphaHashThresholdX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(position: vec3<f32>, derivative: f32) -> f32 {
    var threshold: f32;

    let scale_1 = (1f / max((0.05f * derivative), 0.000001f));
    let level = log2(scale_1);
    let _e13 = alphaHash3DX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(floor((exp2(floor(level)) * position)));
    let _e18 = alphaHash3DX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(floor((exp2(ceil(level)) * position)));
    let noise = vec2<f32>(_e13, _e18);
    let t = fract(level);
    let x = mix(noise.x, noise.y, t);
    let a = min(t, (1f - t));
    threshold = x;
    if (a > 0f) {
        if (x < a) {
            threshold = ((x * x) / ((2f * a) * (1f - a)));
        } else {
            if (x < (1f - a)) {
                threshold = ((x - (0.5f * a)) / (1f - a));
            } else {
                threshold = (1f - (((1f - x) * (1f - x)) / ((2f * a) * (1f - a))));
            }
        }
    }
    let _e60 = threshold;
    return clamp(_e60, 0.000001f, 1f);
}

fn applyAlphaHashX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(alpha: f32, position_1: vec3<f32>, enabled: f32) {
    let _e1 = dpdx(position_1);
    let _e3 = dpdy(position_1);
    let derivative_1 = max(length(_e1), length(_e3));
    if (enabled > 0.5f) {
        let _e9 = alphaHashThresholdX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(position_1, derivative_1);
        if (alpha < _e9) {
            discard;
        } else {
            return;
        }
    } else {
        return;
    }
}

fn _cascadeLightViewProj(layer: u32) -> mat4x4<f32> {
    switch layer {
        case 0u: {
            let _e3 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_A;
            return _e3;
        }
        case 1u: {
            let _e6 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_B;
            return _e6;
        }
        case 2u: {
            let _e9 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_C;
            return _e9;
        }
        default: {
            let _e12 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_D;
            return _e12;
        }
    }
}

fn shadowVertex(in_4: VsInput, idx_2: u32) -> VsOut {
    var meshIndex: u32 = 0u;
    var instanceIndex: u32;
    var materialIndex: u32 = 0u;
    var paletteBase: u32 = 0u;
    var out: VsOut;

    instanceIndex = idx_2;
    let _e5 = meshIndex;
    let _e9 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[_e5].temporal.w;
    materialIndex = u32(_e9);
    let _e15 = paletteBase;
    let _e20 = palette[(_e15 + in_4.skinIndex.x)];
    let _e25 = paletteBase;
    let _e30 = palette[(_e25 + in_4.skinIndex.y)];
    let _e36 = paletteBase;
    let _e41 = palette[(_e36 + in_4.skinIndex.z)];
    let _e47 = paletteBase;
    let _e52 = palette[(_e47 + in_4.skinIndex.w)];
    let skinMatrix = ((((_e20 * in_4.skinWeight.x) + (_e30 * in_4.skinWeight.y)) + (_e41 * in_4.skinWeight.z)) + (_e52 * in_4.skinWeight.w));
    let worldPos = (skinMatrix * vec4<f32>(in_4.position, 1f));
    let worldNormal_1 = normalize((skinMatrix * vec4<f32>(in_4.normal, 0f)).xyz);
    let worldTangent_1 = normalize((skinMatrix * vec4<f32>(in_4.tangent.xyz, 0f)).xyz);
    let _e76 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.isSpot;
    if (_e76 == 1u) {
        let _e83 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj;
        out.clip = (_e83 * worldPos);
    } else {
        let _e88 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.index;
        let _e89 = _cascadeLightViewProj(_e88);
        out.clip = (_e89 * worldPos);
    }
    out.positionOS = in_4.position;
    out.positionWS = worldPos.xyz;
    out.normalWS = worldNormal_1;
    out.tangentWS = vec4<f32>(worldTangent_1, in_4.tangent.w);
    out.surfaceUv = in_4.uv;
    out.uv1_ = in_4.uv1_;
    out.uv2_ = in_4.uv2_;
    out.uv3_ = in_4.uv3_;
    out.uv4_ = in_4.uv4_;
    out.uv5_ = in_4.uv5_;
    out.uv6And7_ = vec4<f32>(in_4.uv6_, in_4.uv7_);
    out.color = in_4.color;
    let _e118 = out;
    return _e118;
}

fn standardUsesBaseColorTexture() -> bool {
    return ((standardTextureMask & 1u) != 0u);
}

fn surfaceUv(input: SurfaceInput, transform: vec4<f32>, metadata: vec4<f32>) -> vec2<f32> {
    var source: vec2<f32>;

    source = input.uv0_;
    if (metadata.x >= 1f) {
        source = input.uv1_;
    }
    if (metadata.x >= 2f) {
        source = input.uv2_;
    }
    if (metadata.x >= 3f) {
        source = input.uv3_;
    }
    if (metadata.x >= 4f) {
        source = input.uv4_;
    }
    if (metadata.x >= 5f) {
        source = input.uv5_;
    }
    if (metadata.x >= 6f) {
        source = input.uv6_;
    }
    if (metadata.x >= 7f) {
        source = input.uv7_;
    }
    let _e33 = source;
    let scaled_1 = (_e33 * transform.zw);
    let c = cos(metadata.y);
    let s = sin(metadata.y);
    return (vec2<f32>(((scaled_1.x * c) - (scaled_1.y * s)), ((scaled_1.x * s) + (scaled_1.y * c))) + transform.xy);
}

fn standardUsesMetallicRoughnessTexture() -> bool {
    return ((standardTextureMask & 2u) != 0u);
}

fn standardUsesMetallicTexture() -> bool {
    return ((standardTextureMask & 262144u) != 0u);
}

fn standardReusesMetallicTextureFromBaseColorTexture() -> bool {
    return (((standardTextureMask >> 21u) & 3u) == 1u);
}

fn standardReusesMetallicTextureFromMetallicRoughnessTexture() -> bool {
    return (((standardTextureMask >> 21u) & 3u) == 2u);
}

fn standardUsesRoughnessTexture() -> bool {
    return ((standardTextureMask & 524288u) != 0u);
}

fn standardReusesRoughnessTextureFromBaseColorTexture() -> bool {
    return (((standardTextureMask >> 23u) & 3u) == 1u);
}

fn standardReusesRoughnessTextureFromMetallicRoughnessTexture() -> bool {
    return (((standardTextureMask >> 23u) & 3u) == 2u);
}

fn standardReusesRoughnessTextureFromMetallicTexture() -> bool {
    return (((standardTextureMask >> 23u) & 3u) == 3u);
}

fn standardUsesAlphaTexture() -> bool {
    return ((standardTextureMask & 1048576u) != 0u);
}

fn standardReusesAlphaTextureFromBaseColorTexture() -> bool {
    return (((standardTextureMask >> 25u) & 7u) == 1u);
}

fn standardReusesAlphaTextureFromMetallicRoughnessTexture() -> bool {
    return (((standardTextureMask >> 25u) & 7u) == 2u);
}

fn standardReusesAlphaTextureFromMetallicTexture() -> bool {
    return (((standardTextureMask >> 25u) & 7u) == 3u);
}

fn standardReusesAlphaTextureFromRoughnessTexture() -> bool {
    return (((standardTextureMask >> 25u) & 7u) == 4u);
}

fn surfaceChannel(value_2: vec4<f32>, channel: u32) -> f32 {
    switch channel {
        case 0u: {
            return value_2.x;
        }
        case 1u: {
            return value_2.y;
        }
        case 2u: {
            return value_2.z;
        }
        default: {
            return value_2.w;
        }
    }
}

fn standardUsesNormalTexture() -> bool {
    return ((standardTextureMask & 4u) != 0u);
}

fn standardUsesBumpTexture() -> bool {
    return ((standardTextureMask & 256u) != 0u);
}

fn standardUsesEmissiveTexture() -> bool {
    return ((standardTextureMask & 16u) != 0u);
}

fn standardUsesOcclusionTexture() -> bool {
    return ((standardTextureMask & 32u) != 0u);
}

fn evaluate_standard_surface(input_1: SurfaceInput, materialValue: MaterialParameters) -> SurfaceData {
    var baseSample: vec4<f32> = vec4(1f);
    var metallicRoughnessSample: vec4<f32> = vec4(1f);
    var metallicSample: vec4<f32>;
    var roughnessSample: vec4<f32>;
    var alpha_1: f32 = 1f;
    var alphaSample: vec4<f32> = vec4(1f);
    var normal: vec3<f32>;
    var usesNormal: bool = false;
    var local_4: bool;
    var emissiveSample: vec4<f32> = vec4(1f);
    var occlusionSample: vec4<f32> = vec4(1f);

    let _e3 = standardUsesBaseColorTexture();
    if _e3 {
        let _e8 = surfaceUv(input_1, materialValue.baseColorTextureCoordinatesTransform, materialValue.baseColorTextureCoordinatesMetadata);
        let _e14 = textureSample(baseColorTexture, baseColorTexture_sampler, (_e8 * materialValue.baseColorTextureCoordinatesMetadata.zw));
        baseSample = _e14;
    }
    let _e16 = standardUsesMetallicRoughnessTexture();
    if _e16 {
        let _e19 = surfaceUv(input_1, materialValue.metallicRoughnessTextureCoordinatesTransform, materialValue.metallicRoughnessTextureCoordinatesMetadata);
        let _e25 = textureSample(metallicRoughnessTexture, metallicRoughnessTexture_sampler, (_e19 * materialValue.metallicRoughnessTextureCoordinatesMetadata.zw));
        metallicRoughnessSample = _e25;
    }
    let _e27 = metallicRoughnessSample;
    metallicSample = _e27;
    let _e29 = metallicRoughnessSample;
    roughnessSample = _e29;
    let _e31 = standardUsesMetallicTexture();
    if _e31 {
        let _e32 = standardReusesMetallicTextureFromBaseColorTexture();
        if _e32 {
            let _e33 = baseSample;
            metallicSample = _e33;
        } else {
            let _e34 = standardReusesMetallicTextureFromMetallicRoughnessTexture();
            if _e34 {
                let _e35 = metallicRoughnessSample;
                metallicSample = _e35;
            } else {
                let _e38 = surfaceUv(input_1, materialValue.metallicTextureCoordinatesTransform, materialValue.metallicTextureCoordinatesMetadata);
                let _e44 = textureSample(metallicTexture, metallicTexture_sampler, (_e38 * materialValue.metallicTextureCoordinatesMetadata.zw));
                metallicSample = _e44;
            }
        }
    }
    let _e45 = standardUsesRoughnessTexture();
    if _e45 {
        let _e46 = standardReusesRoughnessTextureFromBaseColorTexture();
        if _e46 {
            let _e47 = baseSample;
            roughnessSample = _e47;
        } else {
            let _e48 = standardReusesRoughnessTextureFromMetallicRoughnessTexture();
            if _e48 {
                let _e49 = metallicRoughnessSample;
                roughnessSample = _e49;
            } else {
                let _e50 = standardReusesRoughnessTextureFromMetallicTexture();
                if _e50 {
                    let _e51 = metallicSample;
                    roughnessSample = _e51;
                } else {
                    let _e54 = surfaceUv(input_1, materialValue.roughnessTextureCoordinatesTransform, materialValue.roughnessTextureCoordinatesMetadata);
                    let _e60 = textureSample(roughnessTexture, roughnessTexture_sampler, (_e54 * materialValue.roughnessTextureCoordinatesMetadata.zw));
                    roughnessSample = _e60;
                }
            }
        }
    }
    let _e61 = standardUsesAlphaTexture();
    if _e61 {
        let _e62 = standardReusesAlphaTextureFromBaseColorTexture();
        if _e62 {
            let _e63 = baseSample;
            alphaSample = _e63;
        } else {
            let _e65 = standardReusesAlphaTextureFromMetallicRoughnessTexture();
            if _e65 {
                let _e66 = metallicRoughnessSample;
                alphaSample = _e66;
            } else {
                let _e67 = standardReusesAlphaTextureFromMetallicTexture();
                if _e67 {
                    let _e68 = metallicSample;
                    alphaSample = _e68;
                } else {
                    let _e69 = standardReusesAlphaTextureFromRoughnessTexture();
                    if _e69 {
                        let _e70 = roughnessSample;
                        alphaSample = _e70;
                    } else {
                        let _e73 = surfaceUv(input_1, materialValue.alphaTextureCoordinatesTransform, materialValue.alphaTextureCoordinatesMetadata);
                        let _e79 = textureSample(alphaTexture, alphaTexture_sampler, (_e73 * materialValue.alphaTextureCoordinatesMetadata.zw));
                        alphaSample = _e79;
                    }
                }
            }
        }
        let _e80 = alphaSample;
        let _e83 = surfaceChannel(_e80, u32(materialValue.alphaChannel));
        alpha_1 = _e83;
    }
    let faceDirection_1 = select(-1f, 1f, input_1.frontFacing);
    normal = (normalize(input_1.geometricNormalWS) * faceDirection_1);
    let _e93 = standardUsesNormalTexture();
    if _e93 {
        let _e96 = surfaceUv(input_1, materialValue.normalTextureCoordinatesTransform, materialValue.normalTextureCoordinatesMetadata);
        let normalSample = textureSample(normalTexture, normalTexture_sampler, (_e96 * materialValue.normalTextureCoordinatesMetadata.zw));
        let _e106 = decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(normalSample.xy);
        let _e108 = scaleTangentSpaceNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(_e106, materialValue.normalScale);
        let _e109 = applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(input_1.geometricNormalWS, input_1.tangentWS, _e108);
        normal = (_e109 * faceDirection_1);
        usesNormal = true;
    }
    let _e113 = usesNormal;
    if !(_e113) {
        let _e115 = standardUsesBumpTexture();
        local_4 = _e115;
    } else {
        local_4 = false;
    }
    let _e119 = local_4;
    if _e119 {
        let _e122 = surfaceUv(input_1, materialValue.bumpTextureCoordinatesTransform, materialValue.bumpTextureCoordinatesMetadata);
        let uv = (_e122 * materialValue.bumpTextureCoordinatesMetadata.zw);
        let dx_1 = dpdx(uv);
        let dy_1 = dpdy(uv);
        let _e130 = textureSampleGrad(normalTexture, normalTexture_sampler, uv, dx_1, dy_1);
        let height = _e130.x;
        let _e135 = textureSampleGrad(normalTexture, normalTexture_sampler, (uv + dx_1), dx_1, dy_1);
        let heightX = _e135.x;
        let _e140 = textureSampleGrad(normalTexture, normalTexture_sampler, (uv + dy_1), dx_1, dy_1);
        let heightY = _e140.x;
        let _e143 = normal;
        let _e149 = perturbBumpNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(input_1.positionWS, _e143, (materialValue.bumpScale * vec2<f32>((heightX - height), (heightY - height))), faceDirection_1);
        normal = _e149;
    }
    let _e150 = standardUsesEmissiveTexture();
    if _e150 {
        let _e153 = surfaceUv(input_1, materialValue.emissiveTextureCoordinatesTransform, materialValue.emissiveTextureCoordinatesMetadata);
        let _e159 = textureSample(emissiveTexture, emissiveTexture_sampler, (_e153 * materialValue.emissiveTextureCoordinatesMetadata.zw));
        emissiveSample = _e159;
    }
    let _e161 = standardUsesOcclusionTexture();
    if _e161 {
        let _e164 = surfaceUv(input_1, materialValue.occlusionTextureCoordinatesTransform, materialValue.occlusionTextureCoordinatesMetadata);
        let _e170 = textureSample(occlusionTexture, occlusionTexture_sampler, (_e164 * materialValue.occlusionTextureCoordinatesMetadata.zw));
        occlusionSample = _e170;
    }
    let vertexColor = input_1.vertexColor;
    let _e175 = baseSample;
    let baseColor = ((materialValue.baseColor.xyz * _e175.xyz) * vertexColor.xyz);
    let _e181 = metallicSample;
    let _e184 = surfaceChannel(_e181, u32(materialValue.metallicChannel));
    let metallic = clamp((materialValue.metallic * _e184), 0f, 1f);
    let _e190 = roughnessSample;
    let _e193 = surfaceChannel(_e190, u32(materialValue.roughnessChannel));
    let roughness = clamp((materialValue.roughness * _e193), 0.04f, 1f);
    let _e201 = emissiveSample;
    let emissive = ((materialValue.emissive * materialValue.emissiveIntensity) * _e201.xyz);
    let _e205 = occlusionSample.x;
    let occlusion = clamp((1f + ((_e205 - 1f) * materialValue.occlusionStrength)), 0f, 1f);
    let _e218 = baseSample.w;
    let _e222 = alpha_1;
    applyAlphaHashX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX((((materialValue.baseColor.w * _e218) * vertexColor.w) * _e222), input_1.positionOS, materialValue.alphaHash);
    let _e226 = normal;
    let _e230 = baseSample.w;
    let _e234 = alpha_1;
    return SurfaceData(baseColor, _e226, metallic, roughness, emissive, occlusion, clamp((((materialValue.baseColor.w * _e230) * vertexColor.w) * _e234), 0f, 1f), clamp(materialValue.alphaCutoff, 0f, 1f));
}

fn evaluate_surface(input_2: SurfaceInput) -> SurfaceData {
    let _e1 = material;
    let _e3 = evaluate_standard_surface(input_2, _e1);
    return _e3;
}

fn evaluateShadowSurface(in_5: VsOut, frontFacing_2: bool) -> SurfaceData {
    applyViewClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(in_5.positionWS, true);
    let _e5 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let viewDirectionWS = normalize((_e5 - in_5.positionWS));
    let input_3 = SurfaceInput(in_5.positionOS, in_5.positionWS, in_5.normalWS, in_5.tangentWS, viewDirectionWS, in_5.surfaceUv, in_5.uv1_, in_5.uv2_, in_5.uv3_, in_5.uv4_, in_5.uv5_, in_5.uv6And7_.xy, in_5.uv6And7_.zw, in_5.color, frontFacing_2);
    let _e26 = evaluate_surface(input_3);
    return _e26;
}

fn alphaTestShadowSurface(surface: SurfaceData) {
    var local_5: bool;

    if (surface.alphaClipThreshold > 0f) {
        local_5 = (surface.opacity <= surface.alphaClipThreshold);
    } else {
        local_5 = false;
    }
    let _e10 = local_5;
    if _e10 {
        discard;
    } else {
        return;
    }
}

fn standardUsesSpecularColorTexture() -> bool {
    return ((standardTextureMask & 8u) != 0u);
}

fn standardUsesTransmissionTexture() -> bool {
    return ((standardTextureMask & 64u) != 0u);
}

fn standardUsesThicknessTexture() -> bool {
    return ((standardTextureMask & 128u) != 0u);
}

fn standardUsesClearcoatTexture() -> bool {
    return ((standardTextureMask & 512u) != 0u);
}

fn standardUsesClearcoatRoughnessTexture() -> bool {
    return ((standardTextureMask & 1024u) != 0u);
}

fn standardUsesClearcoatNormalTexture() -> bool {
    return ((standardTextureMask & 2048u) != 0u);
}

fn standardUsesAnisotropyTexture() -> bool {
    return ((standardTextureMask & 4096u) != 0u);
}

fn standardUsesSheenColorTexture() -> bool {
    return ((standardTextureMask & 8192u) != 0u);
}

fn standardUsesSheenRoughnessTexture() -> bool {
    return ((standardTextureMask & 16384u) != 0u);
}

fn standardUsesIridescenceTexture() -> bool {
    return ((standardTextureMask & 32768u) != 0u);
}

fn standardUsesIridescenceThicknessTexture() -> bool {
    return ((standardTextureMask & 65536u) != 0u);
}

fn standardUsesSpecularTexture() -> bool {
    return ((standardTextureMask & 131072u) != 0u);
}

@vertex 
fn vs_main(in: VsInput, @builtin(instance_index) idx: u32) -> VsOut {
    let _e2 = shadowVertex(in, idx);
    return _e2;
}

@vertex 
fn vs_scene_index(in_1: VsInput, @builtin(instance_index) idx_1: u32) -> VsOut {
    let _e2 = shadowVertex(in_1, idx_1);
    return _e2;
}

@fragment 
fn fs_shadow(in_2: VsOut, @builtin(front_facing) frontFacing: bool) {
    let _e2 = evaluateShadowSurface(in_2, frontFacing);
    alphaTestShadowSurface(_e2);
    return;
}

@fragment 
fn fs_main(in_3: VsOut, @builtin(front_facing) frontFacing_1: bool) {
    let _e2 = evaluateShadowSurface(in_3, frontFacing_1);
    alphaTestShadowSurface(_e2);
    return;
}
