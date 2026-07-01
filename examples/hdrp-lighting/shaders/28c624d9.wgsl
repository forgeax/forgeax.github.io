struct PointLightX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    position: vec3<f32>,
    invRangeSquared: f32,
    colorTimesIntensity: vec3<f32>,
    shadowAtlasLayer: i32,
}

struct SpotLightX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    position: vec3<f32>,
    invRangeSquared: f32,
    colorTimesIntensity: vec3<f32>,
    cosInner: f32,
    direction: vec3<f32>,
    cosOuter: f32,
    spotPad: vec3<f32>,
    shadowAtlasTile: i32,
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
}

struct PointLightsArrayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    count: u32,
    slots: array<PointLightX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 4>,
}

struct SpotLightsArrayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    count: u32,
    slots: array<SpotLightX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 4>,
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
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(1) 
var<uniform> pointLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: PointLightsArrayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(2) 
var<uniform> spotLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: SpotLightsArrayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
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
@group(1) @binding(3) 
var metallicRoughnessSampler: sampler;
@group(1) @binding(4) 
var metallicRoughnessTexture: texture_2d<f32>;
@group(1) @binding(5) 
var normalSampler: sampler;
@group(1) @binding(6) 
var normalTexture: texture_2d<f32>;

fn halfLambertSquared(nDotL: f32) -> f32 {
    let h = ((nDotL * 0.5f) + 0.5f);
    return (h * h);
}

fn linear_to_srgb(linear: f32) -> f32 {
    let c = clamp(linear, 0f, 1f);
    return select((c * 12.92f), ((pow(c, 0.41666666f) * 1.055f) - 0.055f), (c > 0.0031308f));
}

fn spriteLitNormal() -> vec3<f32> {
    return vec3<f32>(0f, 0f, 1f);
}

fn spriteLitWorldPos(uv_atlas_1: vec2<f32>) -> vec3<f32> {
    let _e3 = material.region;
    let _e8 = material.region;
    let uv_eff = ((uv_atlas_1 - _e3.xy) / _e8.zw);
    let _e13 = material.pivotAndSize;
    let pivot = _e13.xy;
    let _e17 = material.pivotAndSize;
    let size = _e17.zw;
    let pos_local_1 = vec3<f32>(((uv_eff - pivot) * size), 0f);
    let _e26 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let world4_ = (_e26 * vec4<f32>(pos_local_1, 1f));
    return world4_.xyz;
}

fn spriteLitDirectional(normal: vec3<f32>, albedo: vec3<f32>) -> vec3<f32> {
    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let l = normalize(-(_e2));
    let nDotL_1 = dot(normal, l);
    let _e10 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightColor;
    let _e12 = halfLambertSquared(nDotL_1);
    return ((albedo * _e10) * _e12);
}

fn spriteLitPoint(p: PointLightX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, worldPos: vec3<f32>, normal_1: vec3<f32>, albedo_1: vec3<f32>) -> vec3<f32> {
    let toLight = (p.position - worldPos);
    let dSquared = max(dot(toLight, toLight), 0.0001f);
    let l_1 = (toLight / vec3(sqrt(dSquared)));
    let nDotL_2 = dot(normal_1, l_1);
    let factor = (1f - ((dSquared * p.invRangeSquared) * (dSquared * p.invRangeSquared)));
    let attenuation = (max(min(factor, 1f), 0f) / dSquared);
    let _e27 = halfLambertSquared(nDotL_2);
    return (((albedo_1 * p.colorTimesIntensity) * _e27) * attenuation);
}

fn spriteLitSpot(s: SpotLightX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, worldPos_1: vec3<f32>, normal_2: vec3<f32>, albedo_2: vec3<f32>) -> vec3<f32> {
    let toLight_1 = (s.position - worldPos_1);
    let dSquared_1 = max(dot(toLight_1, toLight_1), 0.0001f);
    let l_2 = (toLight_1 / vec3(sqrt(dSquared_1)));
    let nDotL_3 = dot(normal_2, l_2);
    let factor_1 = (1f - ((dSquared_1 * s.invRangeSquared) * (dSquared_1 * s.invRangeSquared)));
    let attenuation_1 = (max(min(factor_1, 1f), 0f) / dSquared_1);
    let cone = smoothstep(s.cosOuter, s.cosInner, dot(l_2, -(s.direction)));
    let _e33 = halfLambertSquared(nDotL_3);
    return ((((albedo_2 * s.colorTimesIntensity) * _e33) * attenuation_1) * cone);
}

fn spriteLitShadeAccum(albedo_3: vec3<f32>, normal_3: vec3<f32>, worldPos_2: vec3<f32>) -> vec3<f32> {
    var lit: vec3<f32>;
    var i: u32 = 0u;
    var i_1: u32 = 0u;

    let _e3 = spriteLitDirectional(normal_3, albedo_3);
    lit = _e3;
    let pointCount = pointLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.count;
    loop {
        let _e9 = i;
        if (_e9 < pointCount) {
        } else {
            break;
        }
        {
            let _e13 = i;
            let p_1 = pointLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.slots[_e13];
            let _e16 = lit;
            let _e18 = spriteLitPoint(p_1, worldPos_2, normal_3, albedo_3);
            lit = (_e16 + _e18);
        }
        continuing {
            let _e20 = i;
            i = (_e20 + 1u);
        }
    }
    let spotCount = spotLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.count;
    loop {
        let _e27 = i_1;
        if (_e27 < spotCount) {
        } else {
            break;
        }
        {
            let _e31 = i_1;
            let s_1 = spotLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.slots[_e31];
            let _e34 = lit;
            let _e35 = spriteLitSpot(s_1, worldPos_2, normal_3, albedo_3);
            lit = (_e34 + _e35);
        }
        continuing {
            let _e37 = i_1;
            i_1 = (_e37 + 1u);
        }
    }
    let _e40 = lit;
    return _e40;
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32, @builtin(vertex_index) vertex_index: u32) -> VsOut {
    var pos_local: vec3<f32>;
    var uv_atlas: vec2<f32>;
    var u_uv_arr: array<f32, 4>;
    var v_uv_arr: array<f32, 4>;
    var out: VsOut;

    let _e2 = material.pivotAndSize;
    let pivot_1 = _e2.xy;
    let _e6 = material.pivotAndSize;
    let size_1 = _e6.zw;
    let _e10 = material.slicesAndMode;
    let useSlices = any((_e10 != vec4(0f)));
    if useSlices {
        let _e17 = material.slicesAndMode;
        let abs_slices = abs(_e17);
        let _e22 = material.slicesAndMode.w;
        let is_tile = (_e22 < 0f);
        let i_2 = (vertex_index % 4u);
        let j = (vertex_index / 4u);
        let u_pos_arr = array<f32, 4>(0f, abs_slices.x, (1f - abs_slices.z), 1f);
        let v_pos_arr = array<f32, 4>(0f, abs_slices.y, (1f - abs_slices.w), 1f);
        let u_pos = u_pos_arr[i_2];
        let v_pos_top = v_pos_arr[j];
        let v_pos_eff = (1f - v_pos_top);
        pos_local = vec3<f32>(((u_pos - pivot_1.x) * size_1.x), ((v_pos_eff - pivot_1.y) * size_1.y), 0f);
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
        let uv_u = u_uv_arr[i_2];
        let uv_v_top = v_uv_arr[j];
        let uv_v_eff = (1f - uv_v_top);
        let _e114 = material.region;
        let _e119 = material.region;
        uv_atlas = ((vec2<f32>(uv_u, uv_v_eff) * _e114.zw) + _e119.xy);
    } else {
        let uv_eff_1 = vec2<f32>(in.uv.x, (1f - in.uv.y));
        pos_local = vec3<f32>(((uv_eff_1 - pivot_1) * size_1), 0f);
        let _e137 = material.region;
        let _e142 = material.region;
        uv_atlas = ((uv_eff_1 * _e137.zw) + _e142.xy);
    }
    let _e148 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e153 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].localFromInstance;
    let _e155 = pos_local;
    let world = ((_e148 * _e153) * vec4<f32>(_e155, 1f));
    let _e163 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e163 * world);
    let _e166 = uv_atlas;
    out.uv_atlas = _e166;
    let _e167 = out;
    return _e167;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    let texel = textureSample(baseColorTexture, baseColorSampler, in_1.uv_atlas);
    let _e7 = material.colorTint;
    let albedo4_ = (texel * _e7);
    let _e9 = spriteLitNormal();
    let _e11 = spriteLitWorldPos(in_1.uv_atlas);
    let _e13 = spriteLitShadeAccum(albedo4_.xyz, _e9, _e11);
    let lit_rgba = clamp(vec4<f32>(_e13, albedo4_.w), vec4(0f), vec4(1f));
    let premult = vec4<f32>((lit_rgba.xyz * lit_rgba.w), lit_rgba.w);
    let _e27 = linear_to_srgb(premult.x);
    let _e29 = linear_to_srgb(premult.y);
    let _e31 = linear_to_srgb(premult.z);
    return vec4<f32>(_e27, _e29, _e31, premult.w);
}

@fragment 
fn fs_main_hdr(in_2: VsOut) -> @location(0) vec4<f32> {
    let texel_1 = textureSample(baseColorTexture, baseColorSampler, in_2.uv_atlas);
    let _e7 = material.colorTint;
    let albedo4_1 = (texel_1 * _e7);
    let _e9 = spriteLitNormal();
    let _e11 = spriteLitWorldPos(in_2.uv_atlas);
    let _e13 = spriteLitShadeAccum(albedo4_1.xyz, _e9, _e11);
    let alpha = clamp(albedo4_1.w, 0f, 1f);
    return vec4<f32>((_e13 * alpha), alpha);
}
