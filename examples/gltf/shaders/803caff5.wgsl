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

struct PrefilterUniforms {
    roughness: f32,
    faceSize: f32,
}

const PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX: f32 = 3.1415927f;
const PREFILTER_SAMPLE_COUNT: u32 = 1024u;

@group(0) @binding(0) 
var<uniform> faceUniforms: CubemapFaceUniforms;
@group(0) @binding(1) 
var<uniform> prefUniforms: PrefilterUniforms;
@group(1) @binding(0) 
var envCube: texture_cube<f32>;
@group(1) @binding(1) 
var envSamplerS: sampler;

fn radicalInverseVdCX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(bits: u32) -> f32 {
    var b: u32;

    b = bits;
    let _e2 = b;
    let _e5 = b;
    b = ((_e2 << 16u) | (_e5 >> 16u));
    let _e9 = b;
    let _e14 = b;
    b = (((_e9 & 1431655765u) << 1u) | ((_e14 & 2863311530u) >> 1u));
    let _e20 = b;
    let _e25 = b;
    b = (((_e20 & 858993459u) << 2u) | ((_e25 & 3435973836u) >> 2u));
    let _e31 = b;
    let _e36 = b;
    b = (((_e31 & 252645135u) << 4u) | ((_e36 & 4042322160u) >> 4u));
    let _e42 = b;
    let _e47 = b;
    b = (((_e42 & 16711935u) << 8u) | ((_e47 & 4278255360u) >> 8u));
    let _e53 = b;
    return (f32(_e53) * 0.00000000023283064f);
}

fn hammersleyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(i_1: u32, N: u32) -> vec2<f32> {
    let _e5 = radicalInverseVdCX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(i_1);
    return vec2<f32>((f32(i_1) / f32(N)), _e5);
}

fn iblDGGXX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(nDotH: f32, roughness: f32) -> f32 {
    let a = (roughness * roughness);
    let a2_ = (a * a);
    let f = ((((nDotH * a2_) - nDotH) * nDotH) + 1f);
    return (a2_ / max(((PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX * f) * f), 0.0000001f));
}

fn importanceSampleGGXX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(Xi: vec2<f32>, N_1: vec3<f32>, roughness_1: f32) -> vec3<f32> {
    let a_1 = (roughness_1 * roughness_1);
    let phi = (6.2831855f * Xi.x);
    let cosTheta = sqrt(max(((1f - Xi.y) / (1f + (((a_1 * a_1) - 1f) * Xi.y))), 0f));
    let sinTheta = sqrt(max((1f - (cosTheta * cosTheta)), 0f));
    let Ht = vec3<f32>((cos(phi) * sinTheta), (sin(phi) * sinTheta), cosTheta);
    let up = select(vec3<f32>(1f, 0f, 0f), vec3<f32>(0f, 0f, 1f), (abs(N_1.z) < 0.999f));
    let tangent = normalize(cross(up, N_1));
    let bitangent = cross(N_1, tangent);
    return normalize((((tangent * Ht.x) + (bitangent * Ht.y)) + (N_1 * Ht.z)));
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
fn prefilterEnv_fs(in0_1: CubemapVsOut) -> @location(0) vec4<f32> {
    var prefilteredColor: vec3<f32> = vec3(0f);
    var totalWeight: f32 = 0f;
    var i: u32 = 0u;

    let roughness_2 = prefUniforms.roughness;
    let V = normalize(in0_1.worldPos);
    loop {
        let _e10 = i;
        if (_e10 < PREFILTER_SAMPLE_COUNT) {
        } else {
            break;
        }
        {
            let _e13 = i;
            let _e15 = hammersleyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(_e13, PREFILTER_SAMPLE_COUNT);
            let _e16 = importanceSampleGGXX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(_e15, V, roughness_2);
            let L = normalize((((2f * dot(V, _e16)) * _e16) - V));
            let NdotL = max(dot(V, L), 0f);
            if (NdotL > 0f) {
                let _e31 = iblDGGXX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(max(dot(V, _e16), 0f), roughness_2);
                let NdotH0_ = max(dot(V, _e16), 0f);
                let HdotV = max(dot(_e16, V), 0f);
                let pdf = (((_e31 * NdotH0_) / (4f * HdotV)) + 0.0001f);
                let saTexel = (12.566371f / ((6f * 512f) * 512f));
                let saSample = (1f / ((1024f * pdf) + 0.0001f));
                let mipLevel = select((0.5f * log2((saSample / saTexel))), 0f, (roughness_2 == 0f));
                let _e65 = prefilteredColor;
                let _e68 = textureSampleLevel(envCube, envSamplerS, L, mipLevel);
                prefilteredColor = (_e65 + (_e68.xyz * NdotL));
                let _e73 = totalWeight;
                totalWeight = (_e73 + NdotL);
            }
        }
        continuing {
            let _e75 = i;
            i = (_e75 + 1u);
        }
    }
    let _e78 = prefilteredColor;
    let _e79 = totalWeight;
    prefilteredColor = (_e78 / vec3(max(_e79, 0.001f)));
    let _e84 = prefilteredColor;
    return vec4<f32>(_e84, 1f);
}
