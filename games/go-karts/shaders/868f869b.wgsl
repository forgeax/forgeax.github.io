struct AtmosphereIblParams {
    sunDirection: vec3<f32>,
    sunIlluminance: f32,
    sunColor: vec3<f32>,
    _sunColorPad: f32,
    turbidity: f32,
    rayleigh: f32,
    mieCoefficient: f32,
    mieDirectionalG: f32,
    sunAngularRadius: f32,
    sunDiscEnabled: f32,
    prefilterRoughness: f32,
    producerKind: f32,
}

struct AtmosphereIblVsIn {
    @location(0) faceVertex: vec3<f32>,
}

struct AtmosphereIblVsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) direction: vec3<f32>,
}

const PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX: f32 = 3.1415927f;

@group(0) @binding(0) 
var<uniform> atmosphere: AtmosphereIblParams;
@group(1) @binding(0) 
var sky: texture_cube<f32>;
@group(1) @binding(1) 
var skySampler: sampler;

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

fn hammersleyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(i: u32, N: u32) -> vec2<f32> {
    let _e5 = radicalInverseVdCX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(i);
    return vec2<f32>((f32(i) / f32(N)), _e5);
}

fn importanceSampleGGXX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(Xi: vec2<f32>, N_1: vec3<f32>, roughness: f32) -> vec3<f32> {
    let a = (roughness * roughness);
    let phi = (6.2831855f * Xi.x);
    let cosTheta = sqrt(max(((1f - Xi.y) / (1f + (((a * a) - 1f) * Xi.y))), 0f));
    let sinTheta = sqrt(max((1f - (cosTheta * cosTheta)), 0f));
    let Ht = vec3<f32>((cos(phi) * sinTheta), (sin(phi) * sinTheta), cosTheta);
    let up = select(vec3<f32>(1f, 0f, 0f), vec3<f32>(0f, 0f, 1f), (abs(N_1.z) < 0.999f));
    let tangent = normalize(cross(up, N_1));
    let bitangent = cross(N_1, tangent);
    return normalize((((tangent * Ht.x) + (bitangent * Ht.y)) + (N_1 * Ht.z)));
}

fn atmosphere_ibl_tangent_frame(normal: vec3<f32>) -> mat3x3<f32> {
    let up_1 = select(vec3<f32>(0f, 1f, 0f), vec3<f32>(1f, 0f, 0f), (abs(normal.y) > 0.999f));
    let tangent_1 = normalize(cross(up_1, normal));
    let bitangent_1 = normalize(cross(normal, tangent_1));
    return mat3x3<f32>(tangent_1, bitangent_1, normal);
}

@vertex 
fn atmosphere_ibl_vs(input: AtmosphereIblVsIn) -> AtmosphereIblVsOut {
    var output: AtmosphereIblVsOut;

    let face = (u32(input.faceVertex.z) - 1u);
    let x = input.faceVertex.x;
    let y = input.faceVertex.y;
    output.clip = vec4<f32>(x, y, 0.5f, 1f);
    switch face {
        case 0u: {
            output.direction = vec3<f32>(1f, -(y), -(x));
        }
        case 1u: {
            output.direction = vec3<f32>(-1f, -(y), x);
        }
        case 2u: {
            output.direction = vec3<f32>(x, -1f, -(y));
        }
        case 3u: {
            output.direction = vec3<f32>(x, 1f, y);
        }
        case 4u: {
            output.direction = vec3<f32>(x, -(y), 1f);
        }
        default: {
            output.direction = vec3<f32>(-(x), -(y), -1f);
        }
    }
    let _e40 = output;
    return _e40;
}

@fragment 
fn atmosphere_irradiance_fs(input_1: AtmosphereIblVsOut) -> @location(0) vec4<f32> {
    var irradiance: vec3<f32> = vec3(0f);
    var sampleCount: f32 = 0f;
    var phiIndex: u32 = 0u;
    var thetaIndex: u32;

    let normal_1 = normalize(input_1.direction);
    let _e6 = atmosphere_ibl_tangent_frame(normal_1);
    loop {
        let _e8 = phiIndex;
        if (_e8 < 16u) {
        } else {
            break;
        }
        {
            let _e12 = phiIndex;
            let phi_1 = ((6.2831855f * f32(_e12)) / 16f);
            thetaIndex = 0u;
            loop {
                let _e19 = thetaIndex;
                if (_e19 < 8u) {
                } else {
                    break;
                }
                {
                    let _e22 = thetaIndex;
                    let theta = ((1.5707964f * (f32(_e22) + 0.5f)) / 8f);
                    let tangentSample = vec3<f32>((sin(theta) * cos(phi_1)), (sin(theta) * sin(phi_1)), cos(theta));
                    let sampleDirection = (_e6 * tangentSample);
                    let weight = (cos(theta) * sin(theta));
                    let cubeSampleDirection = vec3<f32>(sampleDirection.x, -(sampleDirection.y), sampleDirection.z);
                    let _e48 = irradiance;
                    let _e52 = textureSampleLevel(sky, skySampler, cubeSampleDirection, 0f);
                    irradiance = (_e48 + (_e52.xyz * weight));
                    let _e57 = sampleCount;
                    sampleCount = (_e57 + 1f);
                    let _e60 = thetaIndex;
                    thetaIndex = (_e60 + 1u);
                }
            }
            let _e63 = phiIndex;
            phiIndex = (_e63 + 1u);
        }
    }
    let _e67 = irradiance;
    let _e69 = sampleCount;
    return vec4<f32>(((PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX * _e67) / vec3(max(_e69, 1f))), 1f);
}

@fragment 
fn atmosphere_prefilter_fs(input_2: AtmosphereIblVsOut) -> @location(0) vec4<f32> {
    var prefiltered: vec3<f32> = vec3(0f);
    var totalWeight: f32 = 0f;
    var index: u32 = 0u;

    let viewDirection = normalize(input_2.direction);
    let _e8 = atmosphere.prefilterRoughness;
    let roughness_1 = clamp(_e8, 0.04f, 1f);
    loop {
        let _e14 = index;
        if (_e14 < 64u) {
        } else {
            break;
        }
        {
            let _e16 = index;
            let _e17 = hammersleyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(_e16, 64u);
            let _e18 = importanceSampleGGXX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(_e17, viewDirection, roughness_1);
            let lightDirection = normalize((((2f * dot(viewDirection, _e18)) * _e18) - viewDirection));
            let normalLight = max(dot(viewDirection, lightDirection), 0f);
            if (normalLight > 0f) {
                let cubeLightDirection = vec3<f32>(lightDirection.x, -(lightDirection.y), lightDirection.z);
                let _e36 = prefiltered;
                let _e40 = textureSampleLevel(sky, skySampler, cubeLightDirection, 0f);
                prefiltered = (_e36 + (_e40.xyz * normalLight));
                let _e45 = totalWeight;
                totalWeight = (_e45 + normalLight);
            }
        }
        continuing {
            let _e47 = index;
            index = (_e47 + 1u);
        }
    }
    let _e50 = prefiltered;
    let _e51 = totalWeight;
    return vec4<f32>((_e50 / vec3(max(_e51, 0.001f))), 1f);
}
