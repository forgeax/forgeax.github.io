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

struct MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    worldFromLocal: mat4x4<f32>,
    normalMatrix: mat3x3<f32>,
}

struct InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    localFromInstance: mat4x4<f32>,
}

struct Material {
    colorTint: vec4<f32>,
    region: vec4<f32>,
    pivotAndSize: vec4<f32>,
    slicesAndMode: vec4<f32>,
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
    @builtin(position) clip: vec4<f32>,
    @location(0) uv_atlas: vec2<f32>,
    @location(1) worldPos: vec3<f32>,
    @location(2) ndc: vec3<f32>,
    @location(3) viewZ: f32,
}

struct SpriteVertex {
    posLocal: vec3<f32>,
    uvAtlas: vec2<f32>,
}

struct TemporalVsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) uvAtlas: vec2<f32>,
    @location(1) currentClip: vec4<f32>,
    @location(2) previousClip: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<uniform> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 128>;
@group(3) @binding(0) 
var<uniform> instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 128>;
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

fn sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture_1: texture_2d<f32>, textureSampler_1: sampler, uv_1: vec2<f32>, uvScale_1: vec2<f32>) -> vec4<f32> {
    let _e4 = sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture_1, textureSampler_1, uv_1, uvScale_1);
    return _e4;
}

fn sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip: vec4<f32>, temporalProjection: vec4<f32>) -> f32 {
    let ndcDepth = (clip.z / max(abs(clip.w), 0.000001f));
    let orthographicViewZ = -((temporalProjection.x + (ndcDepth * (temporalProjection.y - temporalProjection.x))));
    return select(-(clip.w), orthographicViewZ, (temporalProjection.z >= 0.5f));
}

fn sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_1: vec4<f32>) -> vec2<f32> {
    let safeW = select(0.000001f, clip_1.w, (abs(clip_1.w) >= 0.000001f));
    let ndc_1 = (clip_1.xy / vec2(safeW));
    return vec2<f32>(((ndc_1.x * 0.5f) + 0.5f), (0.5f - (ndc_1.y * 0.5f)));
}

fn sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_2: vec4<f32>, temporalProjection_1: vec4<f32>) -> f32 {
    let _e2 = sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_2, temporalProjection_1);
    return log2((1f + max(-(_e2), 0f)));
}

fn packSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip: vec4<f32>, previousClip: vec4<f32>, temporalProjection_2: vec4<f32>, reactive: f32) -> vec4<f32> {
    let _e1 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip);
    let _e3 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(previousClip);
    let _e6 = sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip, temporalProjection_2);
    return vec4<f32>((_e1 - _e3), _e6, clamp(reactive, 0f, 1f));
}

fn materialTextureFilteringWitness() {
    let baseWitness = textureSample(baseColorTexture, baseColorSampler, vec2(0f));
    return;
}

fn resolveSpriteVertex(in_5: VsIn, vertex_index_2: u32) -> SpriteVertex {
    var pos_local: vec3<f32>;
    var uv_atlas: vec2<f32>;
    var u_uv_arr: array<f32, 4>;
    var v_uv_arr: array<f32, 4>;
    var out_2: SpriteVertex;

    let _e2 = material.pivotAndSize;
    let pivot = _e2.xy;
    let _e6 = material.pivotAndSize;
    let size = _e6.zw;
    let _e10 = material.slicesAndMode;
    let useSlices = any((_e10 != vec4(0f)));
    if useSlices {
        let _e17 = material.slicesAndMode;
        let abs_slices = abs(_e17);
        let _e22 = material.slicesAndMode.w;
        let is_tile = (_e22 < 0f);
        let i = (vertex_index_2 % 4u);
        let j = (vertex_index_2 / 4u);
        let u_pos_arr = array<f32, 4>(0f, abs_slices.x, (1f - abs_slices.z), 1f);
        let v_pos_arr = array<f32, 4>(0f, abs_slices.y, (1f - abs_slices.w), 1f);
        let u_pos = u_pos_arr[i];
        let v_pos_top = v_pos_arr[j];
        let v_pos_eff = (1f - v_pos_top);
        pos_local = vec3<f32>(((u_pos - pivot.x) * size.x), ((v_pos_eff - pivot.y) * size.y), 0f);
        u_uv_arr = array<f32, 4>(0f, abs_slices.x, (1f - abs_slices.z), 1f);
        v_uv_arr = array<f32, 4>(0f, abs_slices.y, (1f - abs_slices.w), 1f);
        if is_tile {
            let mid_u = ((1f - abs_slices.x) - abs_slices.z);
            let mid_v = ((1f - abs_slices.y) - abs_slices.w);
            u_uv_arr[2] = (abs_slices.x + (2f * mid_u));
            let _e92 = u_uv_arr[2];
            u_uv_arr[3] = (_e92 + abs_slices.z);
            v_uv_arr[2] = (abs_slices.y + (2f * mid_v));
            let _e102 = v_uv_arr[2];
            v_uv_arr[3] = (_e102 + abs_slices.w);
        }
        let uv_u = u_uv_arr[i];
        let uv_v_top = v_uv_arr[j];
        let uv_v_eff = (1f - uv_v_top);
        let _e114 = material.region;
        let _e119 = material.region;
        uv_atlas = ((vec2<f32>(uv_u, uv_v_eff) * _e114.zw) + _e119.xy);
    } else {
        let uv_eff = vec2<f32>(in_5.uv.x, (1f - in_5.uv.y));
        pos_local = vec3<f32>(((uv_eff - pivot) * size), 0f);
        let _e137 = material.region;
        let _e142 = material.region;
        uv_atlas = ((uv_eff * _e137.zw) + _e142.xy);
    }
    let _e147 = pos_local;
    out_2.posLocal = _e147;
    let _e149 = uv_atlas;
    out_2.uvAtlas = _e149;
    let _e150 = out_2;
    return _e150;
}

fn linear_to_srgb(linear: f32) -> f32 {
    let c = clamp(linear, 0f, 1f);
    return select((c * 12.92f), ((pow(c, 0.41666666f) * 1.055f) - 0.055f), (c > 0.0031308f));
}

fn spriteLitDirectional(albedo: vec3<f32>) -> vec3<f32> {
    let _e3 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightColor;
    return (albedo * _e3);
}

fn spriteLitShadeAccum(albedo_1: vec3<f32>, worldPos: vec3<f32>, ndc: vec3<f32>, viewZ: f32) -> vec3<f32> {
    var lit: vec3<f32>;

    let _e1 = spriteLitDirectional(albedo_1);
    lit = _e1;
    let _e3 = lit;
    return _e3;
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32, @builtin(vertex_index) vertex_index: u32) -> VsOut {
    var out: VsOut;

    let _e2 = resolveSpriteVertex(in, vertex_index);
    let _e6 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e11 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].localFromInstance;
    let world = ((_e6 * _e11) * vec4<f32>(_e2.posLocal, 1f));
    let _e21 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e21 * world);
    out.uv_atlas = _e2.uvAtlas;
    out.worldPos = world.xyz;
    let clipPos = out.clip;
    out.ndc = (clipPos.xyz / vec3(clipPos.w));
    let _e37 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e38 = sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clipPos, _e37);
    out.viewZ = _e38;
    let _e39 = out;
    return _e39;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    let _e4 = material.baseColorTextureCoordinatesMetadata;
    let _e8 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_1.uv_atlas, _e4.zw);
    let _e11 = material.colorTint;
    let albedo4_ = (_e8 * _e11);
    let _e17 = spriteLitShadeAccum(albedo4_.xyz, in_1.worldPos, in_1.ndc, in_1.viewZ);
    let lit_rgba = clamp(vec4<f32>(_e17, albedo4_.w), vec4(0f), vec4(1f));
    let premult = vec4<f32>((lit_rgba.xyz * lit_rgba.w), lit_rgba.w);
    let _e31 = linear_to_srgb(premult.x);
    let _e33 = linear_to_srgb(premult.y);
    let _e35 = linear_to_srgb(premult.z);
    return vec4<f32>(_e31, _e33, _e35, premult.w);
}

@fragment 
fn fs_main_hdr(in_2: VsOut) -> @location(0) vec4<f32> {
    let _e4 = material.baseColorTextureCoordinatesMetadata;
    let _e8 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_2.uv_atlas, _e4.zw);
    let _e11 = material.colorTint;
    let albedo4_1 = (_e8 * _e11);
    let _e17 = spriteLitShadeAccum(albedo4_1.xyz, in_2.worldPos, in_2.ndc, in_2.viewZ);
    let alpha = clamp(albedo4_1.w, 0f, 1f);
    return vec4<f32>((_e17 * alpha), alpha);
}

@vertex 
fn vs_temporal(in_3: VsIn, @builtin(instance_index) idx_1: u32, @builtin(vertex_index) vertex_index_1: u32) -> TemporalVsOut {
    var previousWorld: vec4<f32>;
    var out_1: TemporalVsOut;

    let _e2 = resolveSpriteVertex(in_3, vertex_index_1);
    let _e6 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e11 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx_1].localFromInstance;
    let currentWorld = ((_e6 * _e11) * vec4<f32>(_e2.posLocal, 1f));
    previousWorld = currentWorld;
    let _e22 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalCurrentViewProj;
    out_1.currentClip = (_e22 * currentWorld);
    let _e26 = out_1.currentClip;
    out_1.clip = _e26;
    let _e30 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalPreviousViewProj;
    let _e31 = previousWorld;
    out_1.previousClip = (_e30 * _e31);
    out_1.uvAtlas = _e2.uvAtlas;
    let _e35 = out_1;
    return _e35;
}

@fragment 
fn fs_temporal(in_4: TemporalVsOut) -> @location(0) vec4<f32> {
    let _e4 = material.baseColorTextureCoordinatesMetadata;
    let _e8 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_4.uvAtlas, _e4.zw);
    let _e13 = material.colorTint.w;
    let alpha_1 = clamp((_e8.w * _e13), 0f, 1f);
    if (alpha_1 <= 0f) {
        discard;
    }
    let _e24 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e26 = packSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(in_4.currentClip, in_4.previousClip, _e24, 1f);
    return _e26;
}
