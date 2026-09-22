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
    shadowColor: vec4<f32>,
    rimColor: vec4<f32>,
    rimStrength: f32,
    specularStrength: f32,
    emissionStrength: f32,
    sideShade: f32,
    surfaceRoughness: f32,
    surfaceMetallic: f32,
    pigmentStrength: f32,
    pigmentScale: f32,
    diffuseWrap: f32,
    diffuseStrength: f32,
    mistColor: vec4<f32>,
    mistDensity: f32,
    mistBaseHeight: f32,
    mistFalloff: f32,
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
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(3) @binding(0) 
var<storage> instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(1) @binding(0) 
var<uniform> material: MaterialParameters;

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
    let _e8 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[_e5].worldFromLocal;
    let _e10 = instanceIndex;
    let _e13 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[_e10].localFromInstance;
    let worldMatrix = (_e8 * _e13);
    let worldPos = (worldMatrix * vec4<f32>(in_4.position, 1f));
    let worldNormal = normalize((worldMatrix * vec4<f32>(in_4.normal, 0f)).xyz);
    let worldTangent = normalize((worldMatrix * vec4<f32>(in_4.tangent.xyz, 0f)).xyz);
    let _e35 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.isSpot;
    if (_e35 == 1u) {
        let _e42 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj;
        out.clip = (_e42 * worldPos);
    } else {
        let _e47 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.index;
        let _e48 = _cascadeLightViewProj(_e47);
        out.clip = (_e48 * worldPos);
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
    let _e75 = out;
    return _e75;
}

fn evaluate_surface(input: SurfaceInput) -> SurfaceData {
    return SurfaceData(vec3(1f), input.geometricNormalWS, 0f, 1f, vec3(0f), 1f, 1f, 0f);
}

fn evaluateShadowSurface(in_5: VsOut, frontFacing_2: bool) -> SurfaceData {
    let _e3 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let viewDirectionWS = normalize((_e3 - in_5.positionWS));
    let input_1 = SurfaceInput(in_5.positionOS, in_5.positionWS, in_5.normalWS, in_5.tangentWS, viewDirectionWS, in_5.surfaceUv, in_5.uv1_, in_5.uv2_, in_5.uv3_, in_5.uv4_, in_5.uv5_, in_5.uv6And7_.xy, in_5.uv6And7_.zw, vec4(1f), frontFacing_2);
    let _e25 = evaluate_surface(input_1);
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
