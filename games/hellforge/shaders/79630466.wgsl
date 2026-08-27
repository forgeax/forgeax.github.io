struct CubemapVsIn {
    @location(0) pos: vec3<f32>,
}

struct CubemapVsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) worldPos: vec3<f32>,
}

struct CubemapFaceUniforms {
    viewProj: mat4x4<f32>,
}

const INV_ATANX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX: vec2<f32> = vec2<f32>(0.1591f, 0.3183f);

@group(0) @binding(0) 
var<uniform> faceUniforms: CubemapFaceUniforms;
@group(1) @binding(0) 
var equirectTexture: texture_2d<f32>;
@group(1) @binding(1) 
var equirectSamplerS: sampler;

fn sampleSphericalMapX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(v: vec3<f32>) -> vec2<f32> {
    let uv = vec2<f32>(atan2(v.z, v.x), asin(v.y));
    return ((uv * INV_ATANX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX) + vec2(0.5f));
}

@vertex 
fn cubemap_vs(in0_: CubemapVsIn) -> CubemapVsOut {
    var out: CubemapVsOut;

    let _e5 = faceUniforms.viewProj;
    out.clip = (_e5 * vec4<f32>(in0_.pos, 1f));
    out.worldPos = in0_.pos;
    let _e12 = out;
    return _e12;
}

@fragment 
fn equirectToCube_fs(in0_1: CubemapVsOut) -> @location(0) vec4<f32> {
    let dir = normalize(in0_1.worldPos);
    let _e3 = sampleSphericalMapX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(dir);
    let color = textureSample(equirectTexture, equirectSamplerS, _e3);
    return vec4<f32>(color.xyz, 1f);
}
