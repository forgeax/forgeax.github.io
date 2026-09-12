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

struct ShadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    index: u32,
    isSpot: u32,
    shadowCasterPadB: u32,
    shadowCasterPadC: u32,
    spotLightViewProj: mat4x4<f32>,
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
    specularColor: vec3<f32>,
    normalScale: f32,
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
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(7) 
var<uniform> shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ShadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
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
@group(2) @binding(1) 
var<uniform> palette: array<mat4x4<f32>, 255>;

fn standardUsesBaseColorTexture() -> bool {
    return true;
}

fn standardUsesMetallicRoughnessTexture() -> bool {
    return true;
}

fn standardUsesNormalTexture() -> bool {
    return true;
}

fn standardUsesSpecularColorTexture() -> bool {
    return true;
}

fn standardUsesEmissiveTexture() -> bool {
    return true;
}

fn standardUsesOcclusionTexture() -> bool {
    return true;
}

fn standardUsesTransmissionTexture() -> bool {
    return true;
}

fn standardUsesThicknessTexture() -> bool {
    return true;
}

fn standardUsesClearcoatTexture() -> bool {
    return true;
}

fn standardUsesClearcoatRoughnessTexture() -> bool {
    return true;
}

fn standardUsesClearcoatNormalTexture() -> bool {
    return true;
}

fn standardUsesAnisotropyTexture() -> bool {
    return true;
}

fn standardUsesSheenColorTexture() -> bool {
    return true;
}

fn standardUsesSheenRoughnessTexture() -> bool {
    return true;
}

fn standardUsesIridescenceTexture() -> bool {
    return true;
}

fn standardUsesIridescenceThicknessTexture() -> bool {
    return true;
}

fn standardUsesSpecularTexture() -> bool {
    return true;
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
    let _e6 = paletteBase;
    let _e11 = palette[(_e6 + in_4.skinIndex.x)];
    let _e16 = paletteBase;
    let _e21 = palette[(_e16 + in_4.skinIndex.y)];
    let _e27 = paletteBase;
    let _e32 = palette[(_e27 + in_4.skinIndex.z)];
    let _e38 = paletteBase;
    let _e43 = palette[(_e38 + in_4.skinIndex.w)];
    let skinMatrix = ((((_e11 * in_4.skinWeight.x) + (_e21 * in_4.skinWeight.y)) + (_e32 * in_4.skinWeight.z)) + (_e43 * in_4.skinWeight.w));
    let worldPos = (skinMatrix * vec4<f32>(in_4.position, 1f));
    let worldNormal = normalize((skinMatrix * vec4<f32>(in_4.normal, 0f)).xyz);
    let worldTangent = normalize((skinMatrix * vec4<f32>(in_4.tangent.xyz, 0f)).xyz);
    let _e67 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.isSpot;
    if (_e67 == 1u) {
        let _e74 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj;
        out.clip = (_e74 * worldPos);
    } else {
        let _e79 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.index;
        let _e80 = _cascadeLightViewProj(_e79);
        out.clip = (_e80 * worldPos);
    }
    out.positionOS = in_4.position;
    out.positionWS = worldPos.xyz;
    out.normalWS = worldNormal;
    out.tangentWS = vec4<f32>(worldTangent, in_4.tangent.w);
    out.surfaceUv = in_4.uv;
    out.uv1_ = in_4.uv1_;
    out.uv2_ = in_4.uv2_;
    out.uv3_ = in_4.uv3_;
    out.uv4_ = in_4.uv4_;
    out.uv5_ = in_4.uv5_;
    out.uv6And7_ = vec4<f32>(in_4.uv6_, in_4.uv7_);
    let _e107 = out;
    return _e107;
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
    let scaled = (_e33 * transform.zw);
    let c = cos(metadata.y);
    let s = sin(metadata.y);
    return (vec2<f32>(((scaled.x * c) - (scaled.y * s)), ((scaled.x * s) + (scaled.y * c))) + transform.xy);
}

fn surfaceNormal(input_1: SurfaceInput, encoded: vec4<f32>, normalScale: f32) -> vec3<f32> {
    let tangentXY = (((encoded.xy * 2f) - vec2(1f)) * normalScale);
    let tangentZ = sqrt(max((1f - dot(tangentXY, tangentXY)), 0f));
    let geometric = normalize(input_1.geometricNormalWS);
    let tangent = normalize((input_1.tangentWS.xyz - (geometric * dot(geometric, input_1.tangentWS.xyz))));
    let bitangent = (normalize(cross(geometric, tangent)) * input_1.tangentWS.w);
    return normalize((((tangent * tangentXY.x) + (bitangent * tangentXY.y)) + (geometric * tangentZ)));
}

fn surfaceChannel(value: vec4<f32>, channel: u32) -> f32 {
    switch channel {
        case 0u: {
            return value.x;
        }
        case 1u: {
            return value.y;
        }
        case 2u: {
            return value.z;
        }
        default: {
            return value.w;
        }
    }
}

fn evaluate_standard_surface(input_2: SurfaceInput, materialValue: MaterialParameters) -> SurfaceData {
    var baseSample: vec4<f32> = vec4(1f);
    var metallicRoughnessSample: vec4<f32> = vec4(1f);
    var normal: vec3<f32>;
    var emissiveSample: vec4<f32> = vec4(1f);
    var occlusionSample: vec4<f32> = vec4(1f);

    let _e2 = standardUsesBaseColorTexture();
    if _e2 {
        let _e7 = surfaceUv(input_2, materialValue.baseColorTextureCoordinatesTransform, materialValue.baseColorTextureCoordinatesMetadata);
        let _e13 = textureSample(baseColorTexture, baseColorTexture_sampler, (_e7 * materialValue.baseColorTextureCoordinatesMetadata.zw));
        baseSample = _e13;
    }
    let _e15 = standardUsesMetallicRoughnessTexture();
    if _e15 {
        let _e18 = surfaceUv(input_2, materialValue.metallicRoughnessTextureCoordinatesTransform, materialValue.metallicRoughnessTextureCoordinatesMetadata);
        let _e24 = textureSample(metallicRoughnessTexture, metallicRoughnessTexture_sampler, (_e18 * materialValue.metallicRoughnessTextureCoordinatesMetadata.zw));
        metallicRoughnessSample = _e24;
    }
    normal = normalize(input_2.geometricNormalWS);
    let _e29 = standardUsesNormalTexture();
    if _e29 {
        let _e32 = surfaceUv(input_2, materialValue.normalTextureCoordinatesTransform, materialValue.normalTextureCoordinatesMetadata);
        let normalSample = textureSample(normalTexture, normalTexture_sampler, (_e32 * materialValue.normalTextureCoordinatesMetadata.zw));
        let _e40 = surfaceNormal(input_2, normalSample, materialValue.normalScale);
        normal = _e40;
    }
    let _e41 = standardUsesEmissiveTexture();
    if _e41 {
        let _e44 = surfaceUv(input_2, materialValue.emissiveTextureCoordinatesTransform, materialValue.emissiveTextureCoordinatesMetadata);
        let _e50 = textureSample(emissiveTexture, emissiveTexture_sampler, (_e44 * materialValue.emissiveTextureCoordinatesMetadata.zw));
        emissiveSample = _e50;
    }
    let _e52 = standardUsesOcclusionTexture();
    if _e52 {
        let _e55 = surfaceUv(input_2, materialValue.occlusionTextureCoordinatesTransform, materialValue.occlusionTextureCoordinatesMetadata);
        let _e61 = textureSample(occlusionTexture, occlusionTexture_sampler, (_e55 * materialValue.occlusionTextureCoordinatesMetadata.zw));
        occlusionSample = _e61;
    }
    let vertexColor = input_2.vertexColor;
    let _e66 = baseSample;
    let baseColor = ((materialValue.baseColor.xyz * _e66.xyz) * vertexColor.xyz);
    let _e72 = metallicRoughnessSample;
    let _e75 = surfaceChannel(_e72, u32(materialValue.metallicChannel));
    let metallic = clamp((materialValue.metallic * _e75), 0f, 1f);
    let _e81 = metallicRoughnessSample;
    let _e84 = surfaceChannel(_e81, u32(materialValue.roughnessChannel));
    let roughness = clamp((materialValue.roughness * _e84), 0.04f, 1f);
    let _e92 = emissiveSample;
    let emissive = ((materialValue.emissive * materialValue.emissiveIntensity) * _e92.xyz);
    let _e96 = occlusionSample.x;
    let occlusion = clamp((1f + ((_e96 - 1f) * materialValue.occlusionStrength)), 0f, 1f);
    let _e106 = normal;
    let _e110 = baseSample.w;
    return SurfaceData(baseColor, _e106, metallic, roughness, emissive, occlusion, clamp(((materialValue.baseColor.w * _e110) * vertexColor.w), 0f, 1f), clamp(materialValue.alphaCutoff, 0f, 1f));
}

fn evaluate_surface(input_3: SurfaceInput) -> SurfaceData {
    let _e1 = material;
    let _e3 = evaluate_standard_surface(input_3, _e1);
    return _e3;
}

fn evaluateShadowSurface(in_5: VsOut, frontFacing_2: bool) -> SurfaceData {
    let _e3 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let viewDirectionWS = normalize((_e3 - in_5.positionWS));
    let input_4 = SurfaceInput(in_5.positionOS, in_5.positionWS, in_5.normalWS, in_5.tangentWS, viewDirectionWS, in_5.surfaceUv, in_5.uv1_, in_5.uv2_, in_5.uv3_, in_5.uv4_, in_5.uv5_, in_5.uv6And7_.xy, in_5.uv6And7_.zw, vec4(1f), frontFacing_2);
    let _e25 = evaluate_surface(input_4);
    return _e25;
}

fn alphaTestShadowSurface(surface: SurfaceData) {
    var local: bool;

    if (surface.alphaClipThreshold > 0f) {
        local = (surface.opacity <= surface.alphaClipThreshold);
    } else {
        local = false;
    }
    let _e10 = local;
    if _e10 {
        discard;
    } else {
        return;
    }
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
