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

struct InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    localFromInstance: mat4x4<f32>,
    previousLocalFromInstance: mat4x4<f32>,
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
}

struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) positionOS: vec3<f32>,
    @location(1) positionWS: vec3<f32>,
    @location(2) normalWS: vec3<f32>,
    @location(3) tangentWS: vec4<f32>,
    @location(4) surfaceUv: vec2<f32>,
    @location(5) vertexColor: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(7) 
var<uniform> shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ShadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(3) @binding(0) 
var<storage> instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
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

fn surfaceUv(input: SurfaceInput, transform: vec4<f32>, metadata: vec4<f32>) -> vec2<f32> {
    let source = select(input.uv0_, input.uv1_, (metadata.x >= 1f));
    let scaled = (source * transform.zw);
    let c = cos(metadata.y);
    let s = sin(metadata.y);
    return (vec2<f32>(((scaled.x * c) - (scaled.y * s)), ((scaled.x * s) + (scaled.y * c))) + transform.xy);
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

fn surfaceNormal(input_1: SurfaceInput, encoded: vec4<f32>, normalScale: f32) -> vec3<f32> {
    let tangentXY = (((encoded.xy * 2f) - vec2(1f)) * normalScale);
    let tangentZ = sqrt(max((1f - dot(tangentXY, tangentXY)), 0f));
    let geometric = normalize(input_1.geometricNormalWS);
    let tangent = normalize((input_1.tangentWS.xyz - (geometric * dot(geometric, input_1.tangentWS.xyz))));
    let bitangent = (normalize(cross(geometric, tangent)) * input_1.tangentWS.w);
    return normalize((((tangent * tangentXY.x) + (bitangent * tangentXY.y)) + (geometric * tangentZ)));
}

fn evaluate_surface(input_2: SurfaceInput) -> SurfaceData {
    let _e2 = material.baseColorTextureCoordinatesTransform;
    let _e5 = material.baseColorTextureCoordinatesMetadata;
    let _e7 = surfaceUv(input_2, _e2, _e5);
    let _e12 = material.baseColorTextureCoordinatesMetadata;
    let baseSample = textureSample(baseColorTexture, baseColorTexture_sampler, (_e7 * _e12.zw));
    let _e18 = material.metallicRoughnessTextureCoordinatesTransform;
    let _e21 = material.metallicRoughnessTextureCoordinatesMetadata;
    let _e22 = surfaceUv(input_2, _e18, _e21);
    let _e27 = material.metallicRoughnessTextureCoordinatesMetadata;
    let metallicRoughnessSample = textureSample(metallicRoughnessTexture, metallicRoughnessTexture_sampler, (_e22 * _e27.zw));
    let _e33 = material.normalTextureCoordinatesTransform;
    let _e36 = material.normalTextureCoordinatesMetadata;
    let _e37 = surfaceUv(input_2, _e33, _e36);
    let _e42 = material.normalTextureCoordinatesMetadata;
    let normalSample = textureSample(normalTexture, normalTexture_sampler, (_e37 * _e42.zw));
    let _e48 = material.emissiveTextureCoordinatesTransform;
    let _e51 = material.emissiveTextureCoordinatesMetadata;
    let _e52 = surfaceUv(input_2, _e48, _e51);
    let _e57 = material.emissiveTextureCoordinatesMetadata;
    let emissiveSample = textureSample(emissiveTexture, emissiveTexture_sampler, (_e52 * _e57.zw));
    let _e63 = material.occlusionTextureCoordinatesTransform;
    let _e66 = material.occlusionTextureCoordinatesMetadata;
    let _e67 = surfaceUv(input_2, _e63, _e66);
    let _e72 = material.occlusionTextureCoordinatesMetadata;
    let occlusionSample = textureSample(occlusionTexture, occlusionTexture_sampler, (_e67 * _e72.zw));
    let vertexColor = input_2.vertexColor;
    let _e79 = material.baseColor;
    let baseColor = ((_e79.xyz * baseSample.xyz) * vertexColor.xyz);
    let _e87 = material.metallic;
    let _e90 = material.metallicChannel;
    let _e92 = surfaceChannel(metallicRoughnessSample, u32(_e90));
    let metallic = clamp((_e87 * _e92), 0f, 1f);
    let _e99 = material.roughness;
    let _e102 = material.roughnessChannel;
    let _e104 = surfaceChannel(metallicRoughnessSample, u32(_e102));
    let roughness = clamp((_e99 * _e104), 0.04f, 1f);
    let _e111 = material.emissive;
    let _e114 = material.emissiveIntensity;
    let emissive = ((_e111 * _e114) * emissiveSample.xyz);
    let _e123 = material.occlusionStrength;
    let occlusion = clamp((1f + ((occlusionSample.x - 1f) * _e123)), 0f, 1f);
    let _e132 = material.normalScale;
    let _e133 = surfaceNormal(input_2, normalSample, _e132);
    let _e137 = material.baseColor.w;
    let _e147 = material.alphaCutoff;
    return SurfaceData(baseColor, _e133, metallic, roughness, emissive, occlusion, clamp(((_e137 * baseSample.w) * vertexColor.w), 0f, 1f), clamp(_e147, 0f, 1f));
}

fn evaluateShadowSurface(in_3: VsOut, frontFacing_2: bool) -> SurfaceData {
    let _e3 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let viewDirectionWS = normalize((_e3 - in_3.positionWS));
    let _e16 = evaluate_surface(SurfaceInput(in_3.positionOS, in_3.positionWS, in_3.normalWS, in_3.tangentWS, viewDirectionWS, in_3.surfaceUv, in_3.surfaceUv, in_3.vertexColor, frontFacing_2));
    return _e16;
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
    var out: VsOut;
    var out_1: VsOut;

    let instanceLocal = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].localFromInstance;
    let _e8 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let worldMatrix = (_e8 * instanceLocal);
    let worldPos = (worldMatrix * vec4<f32>(in.position, 1f));
    let worldNormal = normalize((worldMatrix * vec4<f32>(in.normal, 0f)).xyz);
    let worldTangent = normalize((worldMatrix * vec4<f32>(in.tangent.xyz, 0f)).xyz);
    let _e30 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.isSpot;
    if (_e30 == 1u) {
        let _e37 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj;
        out.clip = (_e37 * worldPos);
        out.positionOS = in.position;
        out.positionWS = worldPos.xyz;
        out.normalWS = worldNormal;
        out.tangentWS = vec4<f32>(worldTangent, in.tangent.w);
        out.surfaceUv = in.uv;
        out.vertexColor = vec4(1f);
        let _e53 = out;
        return _e53;
    }
    let _e56 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.index;
    let _e57 = _cascadeLightViewProj(_e56);
    out_1.clip = (_e57 * worldPos);
    out_1.positionOS = in.position;
    out_1.positionWS = worldPos.xyz;
    out_1.normalWS = worldNormal;
    out_1.tangentWS = vec4<f32>(worldTangent, in.tangent.w);
    out_1.surfaceUv = in.uv;
    out_1.vertexColor = vec4(1f);
    let _e75 = out_1;
    return _e75;
}

@fragment 
fn fs_shadow(in_1: VsOut, @builtin(front_facing) frontFacing: bool) {
    let _e2 = evaluateShadowSurface(in_1, frontFacing);
    alphaTestShadowSurface(_e2);
    return;
}

@fragment 
fn fs_main(in_2: VsOut, @builtin(front_facing) frontFacing_1: bool) {
    let _e2 = evaluateShadowSurface(in_2, frontFacing_1);
    alphaTestShadowSurface(_e2);
    return;
}
