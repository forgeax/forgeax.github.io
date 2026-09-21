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
const IRRADIANCE_SAMPLE_DELTA: f32 = 0.025f;

@group(0) @binding(0) 
var<uniform> faceUniforms: CubemapFaceUniforms;
@group(1) @binding(0) 
var envCube: texture_cube<f32>;
@group(1) @binding(1) 
var envSamplerS: sampler;

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
                    let _e58 = irradiance;
                    let _e59 = theta;
                    let _e62 = theta;
                    irradiance = (_e58 + ((sampleColor * cos(_e59)) * sin(_e62)));
                    let _e67 = nrSamples;
                    nrSamples = (_e67 + 1f);
                    let _e70 = theta;
                    theta = (_e70 + IRRADIANCE_SAMPLE_DELTA);
                }
            }
            let _e73 = phi;
            phi = (_e73 + IRRADIANCE_SAMPLE_DELTA);
        }
    }
    let _e77 = irradiance;
    let _e79 = nrSamples;
    irradiance = ((PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX * _e77) / vec3(max(_e79, 1f)));
    let _e84 = irradiance;
    return vec4<f32>(_e84, 1f);
}
