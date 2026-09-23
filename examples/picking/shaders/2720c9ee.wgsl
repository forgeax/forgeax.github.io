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

struct MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    worldFromLocal: mat4x4<f32>,
    normalMatrix: mat3x3<f32>,
}

struct InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    localFromInstance: mat4x4<f32>,
}

struct ShadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    index: u32,
    isSpot: u32,
    shadowCasterPadB: u32,
    shadowCasterPadC: u32,
    spotLightViewProj: mat4x4<f32>,
}

struct Material {
    baseColor: vec4<f32>,
    alphaCutoff: f32,
    alphaHash: f32,
    baseColorTextureCoordinatesTransform: vec4<f32>,
    baseColorTextureCoordinatesMetadata: vec4<f32>,
}

struct VsIn {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) tangent: vec4<f32>,
}

struct VsOut {
    @location(3) positionOS: vec3<f32>,
    @builtin(position) @invariant clip: vec4<f32>,
    @location(0) uv: vec2<f32>,
    @location(1) worldPos: vec3<f32>,
}

struct TemporalVsOut {
    @location(3) positionOS: vec3<f32>,
    @location(4) clippingPositionWS: vec3<f32>,
    @builtin(position) @invariant clip: vec4<f32>,
    @location(0) uv: vec2<f32>,
    @location(1) currentClip: vec4<f32>,
    @location(2) previousClip: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<uniform> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 128>;
@group(3) @binding(0) 
var<uniform> instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 128>;
@group(0) @binding(7) 
var<uniform> shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ShadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(1) @binding(0) 
var<uniform> material: Material;
@group(1) @binding(1) 
var baseColorSampler: sampler;
@group(1) @binding(2) 
var baseColorTexture: texture_2d<f32>;

fn sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture: texture_2d<f32>, textureSampler: sampler, uv: vec2<f32>, uvScale: vec2<f32>) -> vec4<f32> {
    let _e5 = textureSample(texture, textureSampler, (uv * uvScale));
    return _e5;
}

fn projectShadowPositionX_naga_oil_mod_XMZXXEZ3FMF4F643IMFSG65Z2HJZXK4TGMFRWKX(worldPosition: vec4<f32>) -> vec4<f32> {
    let _e2 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.isSpot;
    if (_e2 == 1u) {
        let _e8 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj;
        return (_e8 * worldPosition);
    }
    let _e12 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.index;
    switch _e12 {
        case 0u: {
            let _e15 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_A;
            return (_e15 * worldPosition);
        }
        case 1u: {
            let _e19 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_B;
            return (_e19 * worldPosition);
        }
        case 2u: {
            let _e23 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_C;
            return (_e23 * worldPosition);
        }
        default: {
            let _e27 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_D;
            return (_e27 * worldPosition);
        }
    }
}

fn clippedByPlanesX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS: vec3<f32>, planes: array<vec4<f32>, 6>, control: vec4<f32>) -> bool {
    var allOutside: bool;
    var anyOutside: bool = false;
    var index: u32 = 0u;
    var local_3: bool;
    var local_4: bool;

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
                local_3 = outside;
            } else {
                local_3 = true;
            }
            let _e33 = local_3;
            anyOutside = _e33;
            let _e34 = allOutside;
            if _e34 {
                local_4 = outside;
            } else {
                local_4 = false;
            }
            let _e38 = local_4;
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
    var local_5: bool;
    var local_6: bool;

    if !(!(shadow)) {
        local_5 = (control_1.z > 0.5f);
    } else {
        local_5 = true;
    }
    let _e10 = local_5;
    if _e10 {
        let _e13 = clippedByPlanesX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS_1, planes_1, control_1);
        local_6 = _e13;
    } else {
        local_6 = false;
    }
    let _e17 = local_6;
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

    let scale = (1f / max((0.05f * derivative), 0.000001f));
    let level = log2(scale);
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

fn sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip: vec4<f32>) -> vec2<f32> {
    let safeW = select(0.000001f, clip.w, (abs(clip.w) >= 0.000001f));
    let ndc = (clip.xy / vec2(safeW));
    return vec2<f32>(((ndc.x * 0.5f) + 0.5f), (0.5f - (ndc.y * 0.5f)));
}

fn sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_1: vec4<f32>, temporalProjection: vec4<f32>) -> f32 {
    let ndcDepth = (clip_1.z / max(abs(clip_1.w), 0.000001f));
    let orthographicViewZ = -((temporalProjection.x + (ndcDepth * (temporalProjection.y - temporalProjection.x))));
    return select(-(clip_1.w), orthographicViewZ, (temporalProjection.z >= 0.5f));
}

fn sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_2: vec4<f32>, temporalProjection_1: vec4<f32>) -> f32 {
    let _e2 = sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_2, temporalProjection_1);
    return log2((1f + max(-(_e2), 0f)));
}

fn packSceneTemporalV1WithValidityX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip: vec4<f32>, previousClip: vec4<f32>, temporalProjection_2: vec4<f32>, reactive_1: f32, motionValid_1: bool) -> vec4<f32> {
    let _e1 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip);
    let _e3 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(previousClip);
    let _e6 = sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip, temporalProjection_2);
    return vec4<f32>((_e1 - _e3), _e6, (clamp(reactive_1, 0f, 1f) + select(0f, 2f, !(motionValid_1))));
}

fn materialTextureFilteringWitness() {
    let baseWitness = textureSample(baseColorTexture, baseColorSampler, vec2(0f));
    return;
}

fn unlitVertex(in_6: VsIn, idx_3: u32) -> VsOut {
    var out_2: VsOut;

    let _e3 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e9 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx_3].localFromInstance;
    let world = ((_e3 * _e9) * vec4<f32>(in_6.pos, 1f));
    out_2.positionOS = in_6.pos;
    let _e21 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out_2.clip = (_e21 * world);
    out_2.uv = in_6.uv;
    out_2.worldPos = world.xyz;
    let _e27 = out_2;
    return _e27;
}

fn materialVertexColor(in_7: VsOut) -> vec4<f32> {
    return vec4(1f);
}

fn temporalVertexColor(in_8: TemporalVsOut) -> vec4<f32> {
    return vec4(1f);
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    let _e2 = unlitVertex(in, idx);
    return _e2;
}

@vertex 
fn vs_shadow(in_1: VsIn, @builtin(instance_index) idx_1: u32) -> VsOut {
    var out: VsOut;

    let _e2 = unlitVertex(in_1, idx_1);
    out = _e2;
    let _e6 = out.worldPos;
    let _e9 = projectShadowPositionX_naga_oil_mod_XMZXXEZ3FMF4F643IMFSG65Z2HJZXK4TGMFRWKX(vec4<f32>(_e6, 1f));
    out.clip = _e9;
    let _e10 = out;
    return _e10;
}

@fragment 
fn fs_main(in_2: VsOut) -> @location(0) vec4<f32> {
    var local: bool;

    applyViewClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(in_2.worldPos, false);
    let _e6 = material.baseColorTextureCoordinatesMetadata;
    let _e10 = sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_2.uv, _e6.zw);
    let _e11 = materialVertexColor(in_2);
    let _e15 = material.baseColor.w;
    let alpha_1 = ((_e15 * _e10.w) * _e11.w);
    let _e23 = material.alphaHash;
    applyAlphaHashX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(alpha_1, in_2.positionOS, _e23);
    let _e26 = material.alphaCutoff;
    if (_e26 > 0f) {
        let _e31 = material.alphaCutoff;
        local = (alpha_1 < _e31);
    } else {
        local = false;
    }
    let _e36 = local;
    if _e36 {
        discard;
    }
    let _e39 = material.baseColor;
    return vec4<f32>(((_e39.xyz * _e10.xyz) * _e11.xyz), alpha_1);
}

@fragment 
fn fs_shadow(in_3: VsOut) {
    var local_1: bool;

    applyViewClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(in_3.worldPos, true);
    let _e6 = material.baseColorTextureCoordinatesMetadata;
    let _e10 = sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_3.uv, _e6.zw);
    let _e11 = materialVertexColor(in_3);
    let _e15 = material.baseColor.w;
    let alpha_2 = ((_e15 * _e10.w) * _e11.w);
    let _e23 = material.alphaHash;
    applyAlphaHashX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(alpha_2, in_3.positionOS, _e23);
    let _e26 = material.alphaCutoff;
    if (_e26 > 0f) {
        let _e31 = material.alphaCutoff;
        local_1 = (alpha_2 < _e31);
    } else {
        local_1 = false;
    }
    let _e36 = local_1;
    if _e36 {
        discard;
    } else {
        return;
    }
}

@vertex 
fn vs_temporal(in_4: VsIn, @builtin(instance_index) idx_2: u32) -> TemporalVsOut {
    var previousWorld: vec4<f32>;
    var out_1: TemporalVsOut;

    let _e3 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e9 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx_2].localFromInstance;
    let currentWorld = ((_e3 * _e9) * vec4<f32>(in_4.pos, 1f));
    previousWorld = currentWorld;
    out_1.positionOS = in_4.pos;
    out_1.clippingPositionWS = currentWorld.xyz;
    let _e24 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalCurrentViewProj;
    out_1.currentClip = (_e24 * currentWorld);
    let _e29 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out_1.clip = (_e29 * currentWorld);
    let _e34 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalPreviousViewProj;
    let _e35 = previousWorld;
    out_1.previousClip = (_e34 * _e35);
    out_1.uv = in_4.uv;
    let _e39 = out_1;
    return _e39;
}

@fragment 
fn fs_temporal(in_5: TemporalVsOut) -> @location(0) vec4<f32> {
    var local_2: bool;
    var reactive: f32 = 0f;
    var motionValid: bool = true;

    applyViewClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(in_5.clippingPositionWS, false);
    let _e8 = material.baseColorTextureCoordinatesMetadata;
    let _e12 = sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_5.uv, _e8.zw);
    let _e13 = temporalVertexColor(in_5);
    let _e17 = material.baseColor.w;
    let alpha_3 = ((_e17 * _e12.w) * _e13.w);
    let _e25 = material.alphaHash;
    applyAlphaHashX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(alpha_3, in_5.positionOS, _e25);
    let _e28 = material.alphaCutoff;
    if (_e28 > 0f) {
        let _e33 = material.alphaCutoff;
        local_2 = (alpha_3 < _e33);
    } else {
        local_2 = false;
    }
    let _e38 = local_2;
    if _e38 {
        discard;
    }
    let _e45 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e46 = reactive;
    let _e47 = motionValid;
    let _e48 = packSceneTemporalV1WithValidityX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(in_5.currentClip, in_5.previousClip, _e45, _e46, _e47);
    return _e48;
}
