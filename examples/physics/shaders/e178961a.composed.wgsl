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
}

struct MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    worldFromLocal: mat4x4<f32>,
    normalMatrix: mat3x3<f32>,
}

struct Material {
    tintColor: vec4<f32>,
    distanceRange: vec4<f32>,
}

struct VsIn {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) tangent: vec4<f32>,
}

struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<uniform> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 128>;
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

fn median(r: f32, g: f32, b: f32) -> f32 {
    return max(min(r, g), min(max(r, g), b));
}

fn screen_px_range(uv: vec2<f32>) -> f32 {
    let _e2 = material.distanceRange;
    let atlas_dims = _e2.yz;
    let _e7 = material.distanceRange.x;
    let unit_range = (vec2(_e7) / atlas_dims);
    let _e13 = fwidth(uv);
    let screen_tex_size = (vec2(1f) / _e13);
    return max((0.5f * dot(unit_range, screen_tex_size)), 1f);
}

fn linear_to_srgb(linear: f32) -> f32 {
    let c = clamp(linear, 0f, 1f);
    return select((c * 12.92f), ((pow(c, 0.41666666f) * 1.055f) - 0.055f), (c > 0.0031308f));
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    var out: VsOut;

    let model = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].worldFromLocal;
    let anchor = model[3].xyz;
    let _e9 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let forward = normalize((_e9 - anchor));
    let upRef = select(vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 0f, 1f), (abs(forward.y) > 0.999f));
    let right = normalize(cross(upRef, forward));
    let up = cross(forward, right);
    let world_pos = ((anchor + (right * in.pos.x)) + (up * in.pos.y));
    let _e41 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e41 * vec4<f32>(world_pos, 1f));
    out.uv = in.uv;
    let _e47 = out;
    return _e47;
}

@fragment 
fn fs_main_hdr(in_1: VsOut) -> @location(0) vec4<f32> {
    let _e4 = textureSample(baseColorTexture, baseColorSampler, in_1.uv);
    let msd = _e4.xyz;
    let _e9 = median(msd.x, msd.y, msd.z);
    let _e13 = screen_px_range(in_1.uv);
    let dist = ((_e9 - 0.5f) * _e13);
    let _e23 = material.tintColor.w;
    let alpha = (clamp((dist + 0.5f), 0f, 1f) * _e23);
    let _e27 = material.tintColor;
    return vec4<f32>((_e27.xyz * alpha), alpha);
}

@fragment 
fn fs_main(in_2: VsOut) -> @location(0) vec4<f32> {
    let _e4 = textureSample(baseColorTexture, baseColorSampler, in_2.uv);
    let msd_1 = _e4.xyz;
    let _e9 = median(msd_1.x, msd_1.y, msd_1.z);
    let _e13 = screen_px_range(in_2.uv);
    let dist_1 = ((_e9 - 0.5f) * _e13);
    let _e23 = material.tintColor.w;
    let alpha_1 = (clamp((dist_1 + 0.5f), 0f, 1f) * _e23);
    let _e27 = material.tintColor;
    let premult = (_e27.xyz * alpha_1);
    let _e31 = linear_to_srgb(premult.x);
    let _e33 = linear_to_srgb(premult.y);
    let _e35 = linear_to_srgb(premult.z);
    return vec4<f32>(_e31, _e33, _e35, alpha_1);
}
