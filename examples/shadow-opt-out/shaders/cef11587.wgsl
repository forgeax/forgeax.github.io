struct FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    origin: vec3<f32>,
    direction: vec3<f32>,
    distance: f32,
}

struct FogViewParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    color: vec3<f32>,
    density: f32,
    heightFalloff: f32,
    maxOpacity: f32,
}

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
    pcfKernelSize: f32,
    spotLightViewProj: array<mat4x4<f32>, 4>,
    temporalCurrentViewProj: mat4x4<f32>,
    temporalPreviousViewProj: mat4x4<f32>,
    temporalProjection: vec4<f32>,
    fog: FogViewParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX,
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

const FOG_EXP_LIMITX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX: f32 = 80f;
const FOG_Q_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX: f32 = 0.000001f;

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(3) @binding(0) 
var<storage> instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
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

fn fogOpticalDepthX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(params: FogViewParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, ray: FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> f32 {
    var tau: f32;

    let rho0_ = (params.density * exp(clamp((-(params.heightFalloff) * ray.origin.y), -80f, FOG_EXP_LIMITX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX)));
    let q = (params.heightFalloff * ray.direction.y);
    tau = (rho0_ * ray.distance);
    if (abs(q) >= FOG_Q_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX) {
        let exponent = clamp((-(q) * ray.distance), -80f, FOG_EXP_LIMITX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX);
        tau = ((rho0_ * (1f - exp(exponent))) / q);
    }
    let _e34 = tau;
    return max(_e34, 0f);
}

fn apply_fogX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(params_1: FogViewParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, ray_1: FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, color: vec4<f32>) -> vec4<f32> {
    let _e2 = fogOpticalDepthX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(params_1, ray_1);
    let transmittance = exp(-(_e2));
    let opacity = (params_1.maxOpacity * (1f - transmittance));
    let mixed = mix(color.xyz, params_1.color, opacity);
    return vec4<f32>(mixed, color.w);
}

fn sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip: vec4<f32>) -> vec2<f32> {
    let safeW = select(0.000001f, clip.w, (abs(clip.w) >= 0.000001f));
    let ndc = (clip.xy / vec2(safeW));
    return vec2<f32>(((ndc.x * 0.5f) + 0.5f), (0.5f - (ndc.y * 0.5f)));
}

fn sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_1: vec4<f32>, temporalProjection: vec4<f32>) -> f32 {
    let perspectiveDepth = max(clip_1.w, 0f);
    let ndcDepth = (clip_1.z / max(abs(clip_1.w), 0.000001f));
    let orthographicDepth = (temporalProjection.x + (ndcDepth * (temporalProjection.y - temporalProjection.x)));
    let viewDepth = select(perspectiveDepth, max(orthographicDepth, 0f), (temporalProjection.z >= 0.5f));
    return log2((1f + viewDepth));
}

fn packSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip: vec4<f32>, previousClip: vec4<f32>, temporalProjection_1: vec4<f32>, reactive: f32) -> vec4<f32> {
    let _e1 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip);
    let _e3 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(previousClip);
    let _e6 = sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip, temporalProjection_1);
    return vec4<f32>((_e1 - _e3), _e6, clamp(reactive, 0f, 1f));
}

fn materialTextureFilteringWitness() {
    let baseWitness = textureSample(baseColorTexture, baseColorSampler, vec2(0f));
    return;
}

fn resolveSpriteVertex(in_5: VsIn, idx_2: u32, vertex_index_2: u32) -> SpriteVertex {
    var pos_local: vec3<f32>;
    var uv_atlas: vec2<f32>;
    var u_uv_arr: array<f32, 4>;
    var v_uv_arr: array<f32, 4>;
    var region_src: vec4<f32>;
    var out_2: SpriteVertex;

    let _e2 = material.pivotAndSize;
    let pivot = _e2.xy;
    let _e6 = material.slicesAndMode;
    let useSlices = any((_e6 != vec4(0f)));
    if useSlices {
        let _e13 = material.slicesAndMode;
        let abs_slices = abs(_e13);
        let _e18 = material.slicesAndMode.w;
        let is_tile = (_e18 < 0f);
        let i = (vertex_index_2 % 4u);
        let j = (vertex_index_2 / 4u);
        let u_pos_arr = array<f32, 4>(0f, abs_slices.x, (1f - abs_slices.z), 1f);
        let v_pos_arr = array<f32, 4>(0f, abs_slices.y, (1f - abs_slices.w), 1f);
        let u_pos = u_pos_arr[i];
        let v_pos_top = v_pos_arr[j];
        let v_pos_eff = (1f - v_pos_top);
        pos_local = vec3<f32>((u_pos - pivot.x), (v_pos_eff - pivot.y), 0f);
        u_uv_arr = array<f32, 4>(0f, abs_slices.x, (1f - abs_slices.z), 1f);
        v_uv_arr = array<f32, 4>(0f, abs_slices.y, (1f - abs_slices.w), 1f);
        if is_tile {
            let mid_u = ((1f - abs_slices.x) - abs_slices.z);
            let mid_v = ((1f - abs_slices.y) - abs_slices.w);
            u_uv_arr[2] = (abs_slices.x + (2f * mid_u));
            let _e84 = u_uv_arr[2];
            u_uv_arr[3] = (_e84 + abs_slices.z);
            v_uv_arr[2] = (abs_slices.y + (2f * mid_v));
            let _e94 = v_uv_arr[2];
            v_uv_arr[3] = (_e94 + abs_slices.w);
        }
        let uv_u = u_uv_arr[i];
        let uv_v_top = v_uv_arr[j];
        let uv_v_eff = (1f - uv_v_top);
        let _e106 = material.region;
        let _e111 = material.region;
        uv_atlas = ((vec2<f32>(uv_u, uv_v_eff) * _e106.zw) + _e111.xy);
    } else {
        let uv_eff = vec2<f32>(in_5.uv.x, (1f - in_5.uv.y));
        pos_local = vec3<f32>((uv_eff - pivot), 0f);
        let _e128 = material.region;
        region_src = _e128;
        let _e130 = region_src;
        let _e133 = region_src;
        uv_atlas = ((uv_eff * _e130.zw) + _e133.xy);
    }
    let _e138 = pos_local;
    out_2.posLocal = _e138;
    let _e140 = uv_atlas;
    out_2.uvAtlas = _e140;
    let _e141 = out_2;
    return _e141;
}

fn applySceneFog(viewParams: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, color_1: vec3<f32>, alpha: f32, worldPos: vec3<f32>) -> vec4<f32> {
    var origin: vec3<f32>;
    var direction: vec3<f32>;
    var rayDistance: f32;

    origin = viewParams.cameraPos;
    let _e4 = origin;
    direction = normalize((worldPos - _e4));
    let _e8 = origin;
    rayDistance = length((worldPos - _e8));
    if (viewParams.temporalProjection.z >= 0.5f) {
        let nearH = (viewParams.inverseViewProj * vec4<f32>(0f, 0f, 0f, 1f));
        let farH = (viewParams.inverseViewProj * vec4<f32>(0f, 0f, 1f, 1f));
        let nearPoint = (nearH.xyz / vec3(nearH.w));
        let farPoint = (farH.xyz / vec3(farH.w));
        direction = normalize((farPoint - nearPoint));
        let _e40 = direction;
        let _e43 = direction;
        origin = (worldPos - (_e40 * dot((worldPos - viewParams.cameraPos), _e43)));
        let _e47 = origin;
        let _e49 = direction;
        rayDistance = max(dot((worldPos - _e47), _e49), 0f);
    }
    let _e56 = origin;
    let _e57 = direction;
    let _e58 = rayDistance;
    let _e61 = apply_fogX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(viewParams.fog, FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(_e56, _e57, _e58), vec4<f32>(color_1, alpha));
    return _e61;
}

fn linear_to_srgb(linear: f32) -> f32 {
    let c = clamp(linear, 0f, 1f);
    return select((c * 12.92f), ((pow(c, 0.41666666f) * 1.055f) - 0.055f), (c > 0.0031308f));
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32, @builtin(vertex_index) vertex_index: u32) -> VsOut {
    var out: VsOut;

    let _e3 = resolveSpriteVertex(in, idx, vertex_index);
    let _e7 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e11 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].localFromInstance;
    let world = ((_e7 * _e11) * vec4<f32>(_e3.posLocal, 1f));
    let _e21 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e21 * world);
    out.uv_atlas = _e3.uvAtlas;
    out.worldPos = world.xyz;
    let _e27 = out;
    return _e27;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    let _e4 = material.baseColorTextureCoordinatesMetadata;
    let _e8 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_1.uv_atlas, _e4.zw);
    let _e11 = material.colorTint;
    let rgba = clamp((_e8 * _e11), vec4(0f), vec4(1f));
    let _e19 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
    let _e23 = applySceneFog(_e19, rgba.xyz, rgba.w, in_1.worldPos);
    let premult = vec4<f32>((_e23.xyz * _e23.w), _e23.w);
    let _e30 = linear_to_srgb(premult.x);
    let _e32 = linear_to_srgb(premult.y);
    let _e34 = linear_to_srgb(premult.z);
    return vec4<f32>(_e30, _e32, _e34, premult.w);
}

@fragment 
fn fs_main_hdr(in_2: VsOut) -> @location(0) vec4<f32> {
    let _e4 = material.baseColorTextureCoordinatesMetadata;
    let _e8 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_2.uv_atlas, _e4.zw);
    let _e11 = material.colorTint;
    let rgba_1 = clamp((_e8 * _e11), vec4(0f), vec4(1f));
    let _e19 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
    let _e23 = applySceneFog(_e19, rgba_1.xyz, rgba_1.w, in_2.worldPos);
    return vec4<f32>((_e23.xyz * _e23.w), _e23.w);
}

@vertex 
fn vs_temporal(in_3: VsIn, @builtin(instance_index) idx_1: u32, @builtin(vertex_index) vertex_index_1: u32) -> TemporalVsOut {
    var previousWorld: vec4<f32>;
    var out_1: TemporalVsOut;

    let _e3 = resolveSpriteVertex(in_3, idx_1, vertex_index_1);
    let _e7 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e11 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx_1].localFromInstance;
    let currentWorld = ((_e7 * _e11) * vec4<f32>(_e3.posLocal, 1f));
    previousWorld = currentWorld;
    let _e21 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].previousWorldFromLocal;
    let _e25 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx_1].previousLocalFromInstance;
    previousWorld = ((_e21 * _e25) * vec4<f32>(_e3.posLocal, 1f));
    let _e35 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalCurrentViewProj;
    out_1.currentClip = (_e35 * currentWorld);
    let _e39 = out_1.currentClip;
    out_1.clip = _e39;
    let _e43 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalPreviousViewProj;
    let _e44 = previousWorld;
    out_1.previousClip = (_e43 * _e44);
    out_1.uvAtlas = _e3.uvAtlas;
    let _e48 = out_1;
    return _e48;
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
