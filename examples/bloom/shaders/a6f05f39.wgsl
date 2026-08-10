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

struct MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    worldFromLocal: mat4x4<f32>,
    normalMatrix: mat3x3<f32>,
}

struct InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    localFromInstance: mat4x4<f32>,
    region: vec4<f32>,
}

struct Material {
    colorTint: vec4<f32>,
    region: vec4<f32>,
    pivotAndSize: vec4<f32>,
    slicesAndMode: vec4<f32>,
    textureScalePadding: vec4<f32>,
    baseColorUvScale: vec2<f32>,
    metallicRoughnessUvScale: vec2<f32>,
    normalUvScale: vec2<f32>,
    emissiveUvScale: vec2<f32>,
    occlusionUvScale: vec2<f32>,
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

fn sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture: texture_2d<f32>, textureSampler: sampler, uv: vec2<f32>, uvScale: vec2<f32>) -> vec4<f32> {
    let _e5 = textureSample(texture, textureSampler, (uv * uvScale));
    return _e5;
}

fn sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture_1: texture_2d<f32>, textureSampler_1: sampler, uv_1: vec2<f32>, uvScale_1: vec2<f32>) -> vec4<f32> {
    let _e4 = sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture_1, textureSampler_1, uv_1, uvScale_1);
    return _e4;
}

fn materialTextureFilteringWitness() {
    let baseWitness = textureSample(baseColorTexture, baseColorSampler, vec2(0f));
    return;
}

fn linear_to_srgb(linear: f32) -> f32 {
    let c = clamp(linear, 0f, 1f);
    return select((c * 12.92f), ((pow(c, 0.41666666f) * 1.055f) - 0.055f), (c > 0.0031308f));
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32, @builtin(vertex_index) vertex_index: u32) -> VsOut {
    var pos_local: vec3<f32>;
    var uv_atlas: vec2<f32>;
    var u_uv_arr: array<f32, 4>;
    var v_uv_arr: array<f32, 4>;
    var out: VsOut;

    let _e2 = material.pivotAndSize;
    let pivot = _e2.xy;
    let _e6 = material.slicesAndMode;
    let useSlices = any((_e6 != vec4(0f)));
    if useSlices {
        let _e13 = material.slicesAndMode;
        let abs_slices = abs(_e13);
        let _e18 = material.slicesAndMode.w;
        let is_tile = (_e18 < 0f);
        let i = (vertex_index % 4u);
        let j = (vertex_index / 4u);
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
        let uv_eff = vec2<f32>(in.uv.x, (1f - in.uv.y));
        pos_local = vec3<f32>((uv_eff - pivot), 0f);
        let region_src = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].region;
        uv_atlas = ((uv_eff * region_src.zw) + region_src.xy);
    }
    let _e138 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e142 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].localFromInstance;
    let _e144 = pos_local;
    let world = ((_e138 * _e142) * vec4<f32>(_e144, 1f));
    let _e152 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e152 * world);
    let _e155 = uv_atlas;
    out.uv_atlas = _e155;
    let _e156 = out;
    return _e156;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    let _e4 = material.baseColorUvScale;
    let _e7 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_1.uv_atlas, _e4);
    let _e10 = material.colorTint;
    let rgba = clamp((_e7 * _e10), vec4(0f), vec4(1f));
    let premult = vec4<f32>((rgba.xyz * rgba.w), rgba.w);
    let _e23 = linear_to_srgb(premult.x);
    let _e25 = linear_to_srgb(premult.y);
    let _e27 = linear_to_srgb(premult.z);
    return vec4<f32>(_e23, _e25, _e27, premult.w);
}

@fragment 
fn fs_main_hdr(in_2: VsOut) -> @location(0) vec4<f32> {
    let _e4 = material.baseColorUvScale;
    let _e7 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_2.uv_atlas, _e4);
    let _e10 = material.colorTint;
    let rgba_1 = clamp((_e7 * _e10), vec4(0f), vec4(1f));
    return vec4<f32>((rgba_1.xyz * rgba_1.w), rgba_1.w);
}
