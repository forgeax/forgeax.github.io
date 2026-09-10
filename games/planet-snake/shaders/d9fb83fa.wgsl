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

struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

const FOG_EXP_LIMITX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX: f32 = 80f;
const FOG_Q_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX: f32 = 0.000001f;

@group(0) @binding(0) 
var<uniform> view: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(1) @binding(0) 
var gbufferAlbedo: texture_2d<f32>;
@group(1) @binding(1) 
var gbufferSampler: sampler;
@group(1) @binding(2) 
var<uniform> deferredParams: vec4<f32>;
@group(1) @binding(3) 
var sceneDepth: texture_depth_2d;
@group(1) @binding(4) 
var depthSampler: sampler;
@group(1) @binding(5) 
var gbufferNormal: texture_2d<f32>;
@group(1) @binding(6) 
var gbufferEmissive: texture_2d<f32>;

fn fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index_1: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    var x: f32 = -1f;
    var y: f32 = -1f;
    var out: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

    if (vertex_index_1 == 1u) {
        x = 3f;
    }
    if (vertex_index_1 == 2u) {
        y = 3f;
    }
    let _e10 = x;
    let u = ((_e10 + 1f) * 0.5f);
    let _e15 = y;
    let v = (1f - ((_e15 + 1f) * 0.5f));
    let _e24 = x;
    let _e25 = y;
    out.position = vec4<f32>(_e24, _e25, 0f, 1f);
    out.uv = vec2<f32>(u, v);
    let _e31 = out;
    return _e31;
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

fn reconstructWorldPosition(uv: vec2<f32>, depth: f32) -> vec3<f32> {
    let clip = vec4<f32>(((uv * 2f) - vec2(1f)), depth, 1f);
    let _e11 = view.inverseViewProj;
    let worldH = (_e11 * clip);
    return (worldH.xyz / vec3(worldH.w));
}

fn fogDeferredRadiance(color_1: vec4<f32>, worldPos: vec3<f32>) -> vec4<f32> {
    var origin: vec3<f32>;
    var direction: vec3<f32>;
    var rayDistance: f32;

    let _e2 = view.cameraPos;
    origin = _e2;
    let _e5 = origin;
    direction = normalize((worldPos - _e5));
    let _e9 = origin;
    rayDistance = length((worldPos - _e9));
    let _e16 = view.temporalProjection.z;
    if (_e16 >= 0.5f) {
        let _e21 = view.inverseViewProj;
        let nearH = (_e21 * vec4<f32>(0f, 0f, 0f, 1f));
        let _e30 = view.inverseViewProj;
        let farH = (_e30 * vec4<f32>(0f, 0f, 1f, 1f));
        let nearPoint = (nearH.xyz / vec3(nearH.w));
        let farPoint = (farH.xyz / vec3(farH.w));
        direction = normalize((farPoint - nearPoint));
        let _e47 = direction;
        let _e50 = view.cameraPos;
        let _e52 = direction;
        origin = (worldPos - (_e47 * dot((worldPos - _e50), _e52)));
        let _e56 = origin;
        let _e58 = direction;
        rayDistance = max(dot((worldPos - _e56), _e58), 0f);
    }
    let _e64 = view.fog;
    let _e65 = origin;
    let _e66 = direction;
    let _e67 = rayDistance;
    let _e70 = apply_fogX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(_e64, FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(_e65, _e66, _e67), color_1);
    return _e70;
}

@vertex 
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index);
    return _e1;
}

@fragment 
fn fs_lighting(in: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    let depth_1 = textureSampleLevel(sceneDepth, depthSampler, in.uv, 0i);
    if (depth_1 >= 0.999999f) {
        discard;
    }
    let material = textureSampleLevel(gbufferAlbedo, gbufferSampler, in.uv, 0f);
    let normalSample = textureSampleLevel(gbufferNormal, gbufferSampler, in.uv, 0f);
    let emissiveSample = textureSampleLevel(gbufferEmissive, gbufferSampler, in.uv, 0f);
    let normal = normalize(((normalSample.xyz * 2f) - vec3(1f)));
    let _e32 = view.lightDir;
    let light = max(dot(normal, normalize(-(_e32))), 0f);
    let _e41 = view.lightColor;
    let direct = (((material.xyz * _e41) * light) * clamp(emissiveSample.w, 0f, 1f));
    let radiance = vec4<f32>((direct + emissiveSample.xyz), material.w);
    let _e54 = reconstructWorldPosition(in.uv, depth_1);
    let _e55 = fogDeferredRadiance(radiance, _e54);
    return _e55;
}
