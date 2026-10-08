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

const PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX: f32 = 3.1415927f;
const IRRADIANCE_SAMPLE_DELTA: f32 = 0.05f;

@group(0) @binding(0) 
var<uniform> faceUniforms: CubemapFaceUniforms;
@group(1) @binding(0) 
var envCube: texture_cube<f32>;
@group(1) @binding(1) 
var envSamplerS: sampler;

fn irradianceFiniteScalar(value: f32) -> bool {
    var local_2: bool;

    if (value == value) {
        local_2 = (abs(value) <= 65504f);
    } else {
        local_2 = false;
    }
    let _e8 = local_2;
    return _e8;
}

fn irradianceFiniteVec3_(value_1: vec3<f32>) -> bool {
    var local_3: bool;
    var local_4: bool;

    let _e2 = irradianceFiniteScalar(value_1.x);
    if _e2 {
        let _e4 = irradianceFiniteScalar(value_1.y);
        local_3 = _e4;
    } else {
        local_3 = false;
    }
    let _e8 = local_3;
    if _e8 {
        let _e10 = irradianceFiniteScalar(value_1.z);
        local_4 = _e10;
    } else {
        local_4 = false;
    }
    let _e14 = local_4;
    return _e14;
}

fn irradianceSanitizeScalar(value_2: f32) -> f32 {
    let bounded = clamp(value_2, 0f, 65504f);
    let _e4 = irradianceFiniteScalar(value_2);
    return select(0f, bounded, _e4);
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
fn irradianceConvolve_fs(in0_1: CubemapVsOut) -> @location(0) vec4<f32> {
    var irradiance: vec3<f32> = vec3(0f);
    var nrSamples: f32 = 0f;
    var phi: f32 = 0f;
    var theta: f32;
    var local: bool;
    var local_1: bool;

    let N = normalize(in0_1.worldPos);
    let up0_ = select(vec3<f32>(0f, 1f, 0f), vec3<f32>(1f, 0f, 0f), (abs(N.y) > 0.999f));
    let right = normalize(cross(up0_, N));
    let up = normalize(cross(N, right));
    loop {
        let _e23 = phi;
        if (_e23 < 6.2831855f) {
        } else {
            break;
        }
        {
            theta = 0f;
            loop {
                let _e28 = theta;
                if (_e28 < 1.5707964f) {
                } else {
                    break;
                }
                {
                    let _e31 = theta;
                    let _e33 = phi;
                    let _e36 = theta;
                    let _e38 = phi;
                    let _e41 = theta;
                    let tangentSample = vec3<f32>((sin(_e31) * cos(_e33)), (sin(_e36) * sin(_e38)), cos(_e41));
                    let sampleVec = (((tangentSample.x * right) + (tangentSample.y * up)) + (tangentSample.z * N));
                    let _e55 = textureSampleLevel(envCube, envSamplerS, sampleVec, 0f);
                    let sampleColor = _e55.xyz;
                    let _e57 = theta;
                    let _e59 = theta;
                    let sampleWeight = (cos(_e57) * sin(_e59));
                    let _e62 = irradianceFiniteVec3_(sampleVec);
                    if _e62 {
                        let _e63 = irradianceFiniteVec3_(sampleColor);
                        local = _e63;
                    } else {
                        local = false;
                    }
                    let _e67 = local;
                    if _e67 {
                        let _e68 = irradianceFiniteScalar(sampleWeight);
                        local_1 = _e68;
                    } else {
                        local_1 = false;
                    }
                    let _e72 = local_1;
                    if _e72 {
                        let _e74 = irradiance;
                        irradiance = (_e74 + (sampleColor * sampleWeight));
                        let _e78 = nrSamples;
                        nrSamples = (_e78 + 1f);
                    }
                    let _e81 = theta;
                    theta = (_e81 + IRRADIANCE_SAMPLE_DELTA);
                }
            }
            let _e84 = phi;
            phi = (_e84 + IRRADIANCE_SAMPLE_DELTA);
        }
    }
    let _e88 = irradiance;
    let _e90 = nrSamples;
    irradiance = ((PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX * _e88) / vec3(max(_e90, 1f)));
    let _e96 = irradiance.x;
    let _e97 = irradianceSanitizeScalar(_e96);
    let _e99 = irradiance.y;
    let _e100 = irradianceSanitizeScalar(_e99);
    let _e102 = irradiance.z;
    let _e103 = irradianceSanitizeScalar(_e102);
    return vec4<f32>(_e97, _e100, _e103, 1f);
}
