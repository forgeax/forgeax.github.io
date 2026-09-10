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
    baseColor: vec4<f32>,
    alphaCutoff: f32,
    baseColorTextureCoordinatesTransform: vec4<f32>,
    baseColorTextureCoordinatesMetadata: vec4<f32>,
}

struct VsIn {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) tangent: vec4<f32>,
    @location(13) color: vec4<f32>,
}

struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) uv: vec2<f32>,
    @location(1) worldPos: vec3<f32>,
    @location(14) color: vec4<f32>,
}

struct TemporalVsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) uv: vec2<f32>,
    @location(1) @interpolate(linear) currentClip: vec4<f32>,
    @location(2) @interpolate(linear) previousClip: vec4<f32>,
    @location(14) color: vec4<f32>,
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

fn sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(clip: vec4<f32>) -> vec2<f32> {
    let safeW = select(0.000001f, clip.w, (abs(clip.w) >= 0.000001f));
    let ndc = (clip.xy / vec2(safeW));
    return vec2<f32>(((ndc.x * 0.5f) + 0.5f), (0.5f - (ndc.y * 0.5f)));
}

fn sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(clip_1: vec4<f32>) -> f32 {
    let perspectiveDepth = max(clip_1.w, 0f);
    let ndcDepth = (clip_1.z / max(abs(clip_1.w), 0.000001f));
    let _e13 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection.x;
    let _e17 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection.y;
    let _e21 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection.x;
    let orthographicDepth = (_e13 + (ndcDepth * (_e17 - _e21)));
    let _e30 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection.z;
    let viewDepth = select(perspectiveDepth, max(orthographicDepth, 0f), (_e30 >= 0.5f));
    return log2((1f + viewDepth));
}

fn packSceneTemporalX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(currentClip: vec4<f32>, previousClip: vec4<f32>, reactive_1: f32) -> vec4<f32> {
    let _e1 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(currentClip);
    let _e3 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(previousClip);
    let _e5 = sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(currentClip);
    return vec4<f32>((_e1 - _e3), _e5, clamp(reactive_1, 0f, 1f));
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

fn materialTextureFilteringWitness() {
    let baseWitness = textureSample(baseColorTexture, baseColorSampler, vec2(0f));
    return;
}

fn materialVertexColor(in_4: VsOut) -> vec4<f32> {
    return in_4.color;
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

fn temporalVertexColor(in_5: TemporalVsOut) -> vec4<f32> {
    return in_5.color;
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    var out: VsOut;

    let _e3 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e9 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].localFromInstance;
    let world = ((_e3 * _e9) * vec4<f32>(in.pos, 1f));
    let _e19 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e19 * world);
    out.uv = in.uv;
    out.worldPos = world.xyz;
    out.color = in.color;
    let _e27 = out;
    return _e27;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    var local: bool;

    let _e4 = material.baseColorTextureCoordinatesMetadata;
    let _e8 = sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_1.uv, _e4.zw);
    let _e9 = materialVertexColor(in_1);
    let _e13 = material.baseColor.w;
    let alpha_1 = ((_e13 * _e8.w) * _e9.w);
    let _e20 = material.alphaCutoff;
    if (_e20 > 0f) {
        let _e25 = material.alphaCutoff;
        local = (alpha_1 < _e25);
    } else {
        local = false;
    }
    let _e30 = local;
    if _e30 {
        discard;
    }
    let _e32 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
    let _e35 = material.baseColor;
    let _e42 = applySceneFog(_e32, ((_e35.xyz * _e8.xyz) * _e9.xyz), alpha_1, in_1.worldPos);
    return _e42;
}

@vertex 
fn vs_temporal(in_2: VsIn, @builtin(instance_index) idx_1: u32) -> TemporalVsOut {
    var previousWorld: vec4<f32>;
    var out_1: TemporalVsOut;

    let _e3 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e9 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx_1].localFromInstance;
    let currentWorld = ((_e3 * _e9) * vec4<f32>(in_2.pos, 1f));
    previousWorld = currentWorld;
    let _e19 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].previousWorldFromLocal;
    let _e23 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx_1].previousLocalFromInstance;
    previousWorld = ((_e19 * _e23) * vec4<f32>(in_2.pos, 1f));
    let _e33 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalCurrentViewProj;
    out_1.currentClip = (_e33 * currentWorld);
    let _e37 = out_1.currentClip;
    out_1.clip = _e37;
    let _e41 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalPreviousViewProj;
    let _e42 = previousWorld;
    out_1.previousClip = (_e41 * _e42);
    out_1.uv = in_2.uv;
    out_1.color = in_2.color;
    let _e48 = out_1;
    return _e48;
}

@fragment 
fn fs_temporal(in_3: TemporalVsOut) -> @location(0) vec4<f32> {
    var local_1: bool;
    var reactive: f32 = 1f;

    let _e5 = material.baseColorTextureCoordinatesMetadata;
    let _e9 = sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_3.uv, _e5.zw);
    let _e10 = temporalVertexColor(in_3);
    let _e14 = material.baseColor.w;
    let alpha_2 = ((_e14 * _e9.w) * _e10.w);
    let _e21 = material.alphaCutoff;
    if (_e21 > 0f) {
        let _e26 = material.alphaCutoff;
        local_1 = (alpha_2 < _e26);
    } else {
        local_1 = false;
    }
    let _e31 = local_1;
    if _e31 {
        discard;
    }
    let _e36 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].temporal.x;
    reactive = _e36;
    let _e40 = reactive;
    let _e41 = packSceneTemporalX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(in_3.currentClip, in_3.previousClip, _e40);
    return _e41;
}
