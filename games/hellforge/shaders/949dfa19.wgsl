struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) worldPos: vec3<f32>,
}

const BRDF_LUT_SIZE: u32 = 256u;
const BRDF_LUT_SAMPLE_COUNT: u32 = 1024u;

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

fn iblGeometrySchlickGGXX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(NdotV: f32, roughness: f32) -> f32 {
    let k = ((roughness * roughness) / 2f);
    return (NdotV / max(((NdotV * (1f - k)) + k), 0.00001f));
}

fn iblGeometrySmithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(NdotV_1: f32, NdotL: f32, roughness_1: f32) -> f32 {
    let _e2 = iblGeometrySchlickGGXX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(NdotV_1, roughness_1);
    let _e4 = iblGeometrySchlickGGXX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(NdotL, roughness_1);
    return (_e2 * _e4);
}

fn importanceSampleGGXX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(Xi: vec2<f32>, N_1: vec3<f32>, roughness_2: f32) -> vec3<f32> {
    let a = (roughness_2 * roughness_2);
    let phi = (6.2831855f * Xi.x);
    let cosTheta = sqrt(max(((1f - Xi.y) / (1f + (((a * a) - 1f) * Xi.y))), 0f));
    let sinTheta = sqrt(max((1f - (cosTheta * cosTheta)), 0f));
    let Ht = vec3<f32>((cos(phi) * sinTheta), (sin(phi) * sinTheta), cosTheta);
    let up = select(vec3<f32>(1f, 0f, 0f), vec3<f32>(0f, 0f, 1f), (abs(N_1.z) < 0.999f));
    let tangent = normalize(cross(up, N_1));
    let bitangent = cross(N_1, tangent);
    return normalize((((tangent * Ht.x) + (bitangent * Ht.y)) + (N_1 * Ht.z)));
}

@vertex 
fn fullscreen_vs(@builtin(vertex_index) vi: u32) -> VsOut {
    var x: f32 = -1f;
    var y: f32 = -1f;
    var out: VsOut;

    if (vi == 1u) {
        x = 3f;
    }
    if (vi == 2u) {
        y = 3f;
    }
    let _e12 = x;
    let _e13 = y;
    out.clip = vec4<f32>(_e12, _e13, 0f, 1f);
    out.worldPos = vec3(0f);
    let _e20 = out;
    return _e20;
}

@fragment 
fn brdfLutBake_fs(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    var A: f32 = 0f;
    var B: f32 = 0f;
    var i: u32 = 0u;

    let NdotV_2 = clamp((pos.x / 255f), 0f, 1f);
    let roughness_3 = clamp((pos.y / 255f), 0f, 1f);
    let V = vec3<f32>(sqrt(clamp((1f - (NdotV_2 * NdotV_2)), 0f, 1f)), 0f, NdotV_2);
    let N_2 = vec3<f32>(0f, 0f, 1f);
    loop {
        let _e28 = i;
        if (_e28 < BRDF_LUT_SAMPLE_COUNT) {
        } else {
            break;
        }
        {
            let _e31 = i;
            let _e33 = hammersleyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(_e31, BRDF_LUT_SAMPLE_COUNT);
            let _e34 = importanceSampleGGXX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(_e33, N_2, roughness_3);
            let L = normalize((((2f * dot(V, _e34)) * _e34) - V));
            let NdotL_1 = max(L.z, 0f);
            if (NdotL_1 > 0f) {
                let NdotH = max(_e34.z, 0f);
                let VdotH = max(dot(V, _e34), 0f);
                let _e52 = iblGeometrySmithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(NdotV_2, NdotL_1, roughness_3);
                let GVis = ((_e52 * VdotH) / max((NdotH * NdotV_2), 0.00001f));
                let Fc = pow(max((1f - VdotH), 0f), 5f);
                let _e65 = A;
                A = (_e65 + ((1f - Fc) * GVis));
                let _e71 = B;
                B = (_e71 + (Fc * GVis));
            }
        }
        continuing {
            let _e74 = i;
            i = (_e74 + 1u);
        }
    }
    let _e77 = A;
    A = (_e77 / 1024f);
    let _e80 = B;
    B = (_e80 / 1024f);
    let _e83 = A;
    let _e84 = B;
    return vec4<f32>(_e83, _e84, 0f, 1f);
}
