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

struct PointLightX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    position: vec3<f32>,
    invRangeSquared: f32,
    colorTimesIntensity: vec3<f32>,
    shadowAtlasLayer: i32,
}

struct PointLightsArrayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    count: u32,
    slots: array<PointLightX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 4>,
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
    baseColor: vec4<f32>,
    metallic: f32,
    roughness: f32,
    metallicChannel: f32,
    roughnessChannel: f32,
    aoChannel: f32,
    extraChannel: f32,
    emissive: vec3<f32>,
    emissiveIntensity: f32,
    occlusionStrength: f32,
}

struct SkylightUniforms {
    intensity: f32,
    colorR: f32,
    colorG: f32,
    colorB: f32,
}

struct VsIn {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) tangent: vec4<f32>,
}

struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) worldPos: vec3<f32>,
    @location(1) worldNormal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) worldTangent: vec4<f32>,
    @location(4) @interpolate(flat) instanceIdx: u32,
    @location(6) ndc: vec3<f32>,
    @location(7) viewZ: f32,
}

struct GBufferOutput {
    @location(0) normal_roughness: vec4<f32>,
    @location(1) albedo_metallic: vec4<f32>,
    @location(2) emissive_ao: vec4<f32>,
}

const PCF_OFFSETSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX: array<vec2<i32>, 9> = array<vec2<i32>, 9>(vec2<i32>(-1i, -1i), vec2<i32>(0i, -1i), vec2<i32>(1i, -1i), vec2<i32>(-1i, 0i), vec2<i32>(0i, 0i), vec2<i32>(1i, 0i), vec2<i32>(-1i, 1i), vec2<i32>(0i, 1i), vec2<i32>(1i, 1i));

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(1) 
var<storage> pointLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: PointLightsArrayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(2) 
var<storage> spotLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: SpotLightsArrayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(3) @binding(0) 
var<storage> instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(0) @binding(3) 
var shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_depth_2d;
@group(0) @binding(4) 
var shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: sampler_comparison;
@group(0) @binding(8) 
var spotShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_depth_2d;
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
@group(1) @binding(7) 
var irradianceMap_1: texture_cube<f32>;
@group(1) @binding(8) 
var irradianceSampler_1: sampler;
@group(1) @binding(9) 
var prefilterMap_1: texture_cube<f32>;
@group(1) @binding(10) 
var prefilterSampler_1: sampler;
@group(1) @binding(11) 
var brdfLut_1: texture_2d<f32>;
@group(1) @binding(12) 
var brdfLutSampler_1: sampler;
@group(1) @binding(13) 
var<uniform> skylight: SkylightUniforms;
@group(1) @binding(14) 
var emissiveSampler: sampler;
@group(1) @binding(15) 
var emissiveTexture: texture_2d<f32>;
@group(1) @binding(16) 
var occlusionSampler: sampler;
@group(1) @binding(17) 
var occlusionTexture: texture_2d<f32>;

fn decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(rg: vec2<f32>) -> vec3<f32> {
    let xy = ((rg * 2f) - vec2(1f));
    let z = sqrt(saturate((1f - dot(xy, xy))));
    return vec3<f32>(xy, z);
}

fn applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(worldNormal: vec3<f32>, worldTangent: vec4<f32>, tn: vec3<f32>) -> vec3<f32> {
    let n0_ = normalize(worldNormal);
    let t0_ = normalize((worldTangent.xyz - (dot(worldTangent.xyz, n0_) * n0_)));
    let b0_ = (cross(n0_, t0_) * worldTangent.w);
    return normalize((((t0_ * tn.x) + (b0_ * tn.y)) + (n0_ * tn.z)));
}

fn f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH: f32, f0_: vec3<f32>) -> vec3<f32> {
    return (f0_ + ((vec3(1f) - f0_) * pow((1f - vDotH), 5f)));
}

fn fresnelSchlickRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(cosTheta: f32, F0_: vec3<f32>, roughness: f32) -> vec3<f32> {
    let oneMinusRough = max(vec3((1f - roughness)), F0_);
    return (F0_ + ((oneMinusRough - F0_) * pow(clamp((1f - cosTheta), 0f, 1f), 5f)));
}

fn sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal: vec3<f32>, irradianceMap: texture_cube<f32>, irradianceSampler: sampler) -> vec3<f32> {
    let dir = vec3<f32>(normal.x, -(normal.y), normal.z);
    let _e8 = textureSample(irradianceMap, irradianceSampler, dir);
    return _e8.xyz;
}

fn sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_1: vec3<f32>, view: vec3<f32>, roughness_1: f32, F0_1: vec3<f32>, prefilterMap: texture_cube<f32>, prefilterSampler: sampler, brdfLut: texture_2d<f32>, brdfLutSampler: sampler) -> vec3<f32> {
    let NdotV = max(dot(normal_1, view), 0.001f);
    let R = reflect(-(view), normal_1);
    let Rflip = vec3<f32>(R.x, -(R.y), R.z);
    let mip = (roughness_1 * 4f);
    let _e17 = textureSampleLevel(prefilterMap, prefilterSampler, Rflip, mip);
    let prefilteredColor = _e17.xyz;
    let _e22 = textureSample(brdfLut, brdfLutSampler, vec2<f32>(NdotV, roughness_1));
    let envBRDF = _e22.xy;
    let _e25 = fresnelSchlickRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(NdotV, F0_1, roughness_1);
    return (prefilteredColor * ((_e25 * envBRDF.x) + vec3(envBRDF.y)));
}

fn d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH: f32, a_2: f32) -> f32 {
    let a2_ = (a_2 * a_2);
    let f = ((((nDotH * a2_) - nDotH) * nDotH) + 1f);
    return (a2_ / ((3.1415927f * f) * f));
}

fn v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV: f32, nDotL: f32, a_3: f32) -> f32 {
    let a2_1 = (a_3 * a_3);
    let gv = (nDotL * sqrt((((nDotV * nDotV) * (1f - a2_1)) + a2_1)));
    let gl = (nDotV * sqrt((((nDotL * nDotL) * (1f - a2_1)) + a2_1)));
    return (0.5f / max((gv + gl), 0.00001f));
}

fn _pickCascadeLayerX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(viewDepth: f32, count: u32) -> u32 {
    var layer: u32;
    var i_2: u32 = 0u;

    layer = (count - 1u);
    loop {
        let _e6 = i_2;
        if (_e6 < (count - 1u)) {
        } else {
            break;
        }
        {
            let _e12 = i_2;
            let sp = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[_e12].x;
            if (viewDepth < sp) {
                let _e18 = i_2;
                layer = _e18;
                break;
            }
        }
        continuing {
            let _e19 = i_2;
            i_2 = (_e19 + 1u);
        }
    }
    let _e22 = layer;
    return _e22;
}

fn _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_1: u32) -> mat4x4<f32> {
    switch layer_1 {
        case 0u: {
            let _e3 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_A;
            return _e3;
        }
        case 1u: {
            let _e6 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_B;
            return _e6;
        }
        case 2u: {
            let _e9 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_C;
            return _e9;
        }
        default: {
            let _e12 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_D;
            return _e12;
        }
    }
}

fn _atlasTileOriginX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_2: u32, count_1: u32) -> vec2<f32> {
    let tilesPerSide = select(2u, 1u, (count_1 <= 1u));
    let col = (layer_2 % tilesPerSide);
    let row = (layer_2 / tilesPerSide);
    let inv = (1f / f32(tilesPerSide));
    return vec2<f32>((f32(col) * inv), (f32(row) * inv));
}

fn _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos: vec3<f32>, layer_3: u32, count_2: u32, normal_2: vec3<f32>, l: vec3<f32>) -> f32 {
    var local: bool;
    var local_1: bool;
    var local_2: bool;
    var local_3: bool;
    var blocked: f32 = 0f;
    var x: i32 = -2i;
    var y: i32;
    var local_4: bool;

    let _e3 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_3);
    let lightClip = (_e3 * vec4<f32>(worldPos, 1f));
    let projCoords = (lightClip.xyz / vec3(lightClip.w));
    let tilesPerSide_1 = select(2u, 1u, (count_2 <= 1u));
    let inv_1 = (1f / f32(tilesPerSide_1));
    let _e21 = _atlasTileOriginX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_3, count_2);
    let tileUv = vec2<f32>(((projCoords.x * 0.5f) + 0.5f), ((-(projCoords.y) * 0.5f) + 0.5f));
    let uv_1 = ((tileUv * inv_1) + _e21);
    let currentDepth = projCoords.z;
    let _e39 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.normalBias;
    let _e48 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
    let bias = max((_e39 * (1f - dot(normal_2, l))), _e48);
    let adjustedDepth = (currentDepth - bias);
    if (tileUv.x >= 0f) {
        local = (tileUv.x <= 1f);
    } else {
        local = false;
    }
    let _e60 = local;
    if _e60 {
        local_1 = (tileUv.y >= 0f);
    } else {
        local_1 = false;
    }
    let _e67 = local_1;
    if _e67 {
        local_2 = (tileUv.y <= 1f);
    } else {
        local_2 = false;
    }
    let _e74 = local_2;
    if _e74 {
        local_3 = (currentDepth <= 1f);
    } else {
        local_3 = false;
    }
    let _e80 = local_3;
    if !(_e80) {
        return 1f;
    }
    let _e85 = textureDimensions(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 0i);
    let texelDims = vec2<f32>(_e85);
    let texel_1 = vec2<f32>((1f / texelDims.x), (1f / texelDims.y));
    let tileLo = (_e21 + texel_1);
    let tileHi = ((_e21 + vec2(inv_1)) - texel_1);
    let _e100 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.pcfKernelSize;
    let kernel = clamp(u32(round(_e100)), 1u, 5u);
    let half = ((kernel - 1u) / 2u);
    let halfI = i32(half);
    loop {
        let _e112 = x;
        if (_e112 <= 2i) {
        } else {
            break;
        }
        {
            y = -2i;
            loop {
                let _e117 = y;
                if (_e117 <= 2i) {
                } else {
                    break;
                }
                {
                    let _e120 = x;
                    if !((abs(_e120) > halfI)) {
                        let _e124 = y;
                        local_4 = (abs(_e124) > halfI);
                    } else {
                        local_4 = true;
                    }
                    let _e130 = local_4;
                    if _e130 {
                        continue;
                    }
                    let _e131 = x;
                    let _e133 = y;
                    let offsetUv = clamp((uv_1 + (vec2<f32>(f32(_e131), f32(_e133)) * texel_1)), tileLo, tileHi);
                    let lit = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv, adjustedDepth);
                    let _e143 = blocked;
                    blocked = (_e143 + (1f - lit));
                }
                continuing {
                    let _e148 = y;
                    y = (_e148 + 1i);
                }
            }
        }
        continuing {
            let _e151 = x;
            x = (_e151 + 1i);
        }
    }
    let tapCount = f32((((2u * half) + 1u) * ((2u * half) + 1u)));
    let _e163 = blocked;
    return (1f - (_e163 / tapCount));
}

fn evalDirectionalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_3: vec3<f32>, viewDir: vec3<f32>, baseColor: vec3<f32>, metallic: f32, alphaSq: f32, F0_2: vec3<f32>, worldPos_1: vec3<f32>, viewZ: f32) -> vec3<f32> {
    var shadow: f32;
    var local_5: bool;

    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let l_1 = normalize(-(_e2));
    let h = normalize((viewDir + l_1));
    let nDotL_2 = max(dot(normal_3, l_1), 0f);
    let nDotV_1 = max(dot(normal_3, viewDir), 0.00001f);
    let nDotH_1 = max(dot(normal_3, h), 0f);
    let vDotH_1 = max(dot(viewDir, h), 0f);
    let _e22 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH_1, F0_2);
    let _e24 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_1, alphaSq);
    let _e25 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_1, nDotL_2, alphaSq);
    let specular = ((_e24 * _e25) * _e22);
    let kd = ((vec3(1f) - _e22) * (1f - metallic));
    let diffuse = ((kd * baseColor) / vec3(3.1415927f));
    let _e42 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeCount;
    let count_3 = u32(max(_e42, 1f));
    let viewDepth_1 = -(viewZ);
    let _e48 = _pickCascadeLayerX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(viewDepth_1, count_3);
    let _e50 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_1, _e48, count_3, normal_3, l_1);
    shadow = _e50;
    let _e54 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
    if (_e54 > 0f) {
        local_5 = ((_e48 + 1u) < count_3);
    } else {
        local_5 = false;
    }
    let _e63 = local_5;
    if _e63 {
        let spCurr = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[_e48].x;
        let _e71 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
        let blendWidth = (spCurr * _e71);
        if (blendWidth > 0f) {
            let dist = (spCurr - viewDepth_1);
            let t = clamp((1f - (dist / blendWidth)), 0f, 1f);
            if (t > 0f) {
                let _e86 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_1, (_e48 + 1u), count_3, normal_3, l_1);
                shadow = mix(_e50, _e86, t);
            }
        }
    }
    let _e91 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightColor;
    let _e94 = shadow;
    return ((((diffuse + specular) * _e91) * nDotL_2) * _e94);
}

fn sample_shadow_2dX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMap: texture_depth_2d, shadowSampler: sampler_comparison, uv: vec2<f32>, texel: vec2<f32>, depthRef: f32, normalBias: f32, depthBias: f32, nDotL_1: f32) -> f32 {
    var blocked_1: f32 = 0f;
    var i_3: u32 = 0u;

    let bias_1 = max((normalBias * (1f - nDotL_1)), (depthBias / 1000f));
    let adjustedDepth_1 = (depthRef - bias_1);
    loop {
        let _e14 = i_3;
        if (_e14 < 9u) {
        } else {
            break;
        }
        {
            let _e18 = i_3;
            let off = PCF_OFFSETSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX[_e18];
            let offsetUv_1 = (uv + (vec2<f32>(f32(off.x), f32(off.y)) * texel));
            let lit_1 = textureSampleCompareLevel(shadowMap, shadowSampler, offsetUv_1, adjustedDepth_1);
            let _e33 = blocked_1;
            blocked_1 = (_e33 + (1f - lit_1));
        }
        continuing {
            let _e38 = i_3;
            i_3 = (_e38 + 1u);
        }
    }
    let _e40 = blocked_1;
    return (1f - (_e40 / 9f));
}

fn evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos: vec3<f32>, colorTimesIntensity: vec3<f32>, invRangeSquared: f32, worldPos_2: vec3<f32>, normal_4: vec3<f32>, viewDir_1: vec3<f32>, baseColor_1: vec3<f32>, metallic_1: f32, alphaSq_1: f32, F0_3: vec3<f32>) -> vec3<f32> {
    let toLight = (lightPos - worldPos_2);
    let dSquared = max(dot(toLight, toLight), 0.0001f);
    let l_2 = (toLight / vec3(sqrt(dSquared)));
    let h_1 = normalize((viewDir_1 + l_2));
    let nDotL_3 = max(dot(normal_4, l_2), 0f);
    let nDotV_2 = max(dot(normal_4, viewDir_1), 0.00001f);
    let nDotH_2 = max(dot(normal_4, h_1), 0f);
    let vDotH_2 = max(dot(viewDir_1, h_1), 0f);
    let _e26 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH_2, F0_3);
    let _e28 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_2, alphaSq_1);
    let _e29 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_2, nDotL_3, alphaSq_1);
    let specular_1 = ((_e28 * _e29) * _e26);
    let kd_1 = ((vec3(1f) - _e26) * (1f - metallic_1));
    let diffuse_1 = ((kd_1 * baseColor_1) / vec3(3.1415927f));
    let factor = (1f - ((dSquared * invRangeSquared) * (dSquared * invRangeSquared)));
    let attenuation = (max(min(factor, 1f), 0f) / dSquared);
    return ((((diffuse_1 + specular_1) * colorTimesIntensity) * nDotL_3) * attenuation);
}

fn evalPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_1: vec3<f32>, colorTimesIntensity_1: vec3<f32>, invRangeSquared_1: f32, worldPos_3: vec3<f32>, normal_5: vec3<f32>, viewDir_2: vec3<f32>, baseColor_2: vec3<f32>, metallic_2: f32, alphaSq_2: f32, F0_4: vec3<f32>) -> vec3<f32> {
    let _e10 = evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_1, colorTimesIntensity_1, invRangeSquared_1, worldPos_3, normal_5, viewDir_2, baseColor_2, metallic_2, alphaSq_2, F0_4);
    return _e10;
}

fn evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_2: vec3<f32>, lightDir: vec3<f32>, colorTimesIntensity_2: vec3<f32>, cosInner: f32, cosOuter: f32, invRangeSquared_2: f32, worldPos_4: vec3<f32>, normal_6: vec3<f32>, viewDir_3: vec3<f32>, baseColor_3: vec3<f32>, metallic_3: f32, alphaSq_3: f32, F0_5: vec3<f32>) -> vec3<f32> {
    let _e10 = evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_2, colorTimesIntensity_2, invRangeSquared_2, worldPos_4, normal_6, viewDir_3, baseColor_3, metallic_3, alphaSq_3, F0_5);
    let toLight_1 = (lightPos_2 - worldPos_4);
    let l_3 = normalize(toLight_1);
    let cone = smoothstep(cosOuter, cosInner, dot(l_3, -(lightDir)));
    return (_e10 * cone);
}

fn evalSpotShadowedX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_3: vec3<f32>, lightDir_1: vec3<f32>, colorTimesIntensity_3: vec3<f32>, cosInner_1: f32, cosOuter_1: f32, invRangeSquared_3: f32, worldPos_5: vec3<f32>, normal_7: vec3<f32>, viewDir_4: vec3<f32>, baseColor_4: vec3<f32>, metallic_4: f32, alphaSq_4: f32, F0_6: vec3<f32>, lightViewProj: mat4x4<f32>, shadowAtlasTile: i32, depthBias_1: f32, normalBias_1: f32) -> vec3<f32> {
    var local_6: bool;
    var local_7: bool;
    var local_8: bool;
    var local_9: bool;

    let _e13 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_3, lightDir_1, colorTimesIntensity_3, cosInner_1, cosOuter_1, invRangeSquared_3, worldPos_5, normal_7, viewDir_4, baseColor_4, metallic_4, alphaSq_4, F0_6);
    let splane = (lightViewProj * vec4<f32>(worldPos_5, 1f));
    let invW = select((1f / splane.w), 0f, (abs(splane.w) < 0.000001f));
    let ndcXY = (splane.xy * invW);
    let depthRef_1 = (splane.z * invW);
    let clipUv = vec2<f32>(((ndcXY.x * 0.5f) + 0.5f), ((ndcXY.y * -0.5f) + 0.5f));
    if (clipUv.x >= 0f) {
        local_6 = (clipUv.x <= 1f);
    } else {
        local_6 = false;
    }
    let _e51 = local_6;
    if _e51 {
        local_7 = (clipUv.y >= 0f);
    } else {
        local_7 = false;
    }
    let _e58 = local_7;
    if _e58 {
        local_8 = (clipUv.y <= 1f);
    } else {
        local_8 = false;
    }
    let _e65 = local_8;
    if _e65 {
        local_9 = (depthRef_1 <= 1f);
    } else {
        local_9 = false;
    }
    let _e71 = local_9;
    if !(_e71) {
        return _e13;
    }
    let col_1 = f32((shadowAtlasTile % 2i));
    let row_1 = f32((shadowAtlasTile / 2i));
    let tileOrigin = (vec2<f32>(col_1, row_1) * 0.5f);
    let atlasUv = ((clipUv * 0.5f) + tileOrigin);
    let _e88 = textureDimensions(spotShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 0i);
    let atlasDims = vec2<f32>(_e88);
    let texel_2 = (vec2<f32>(1f, 1f) / atlasDims);
    let nDotL_4 = max(dot(normal_7, normalize((lightPos_3 - worldPos_5))), 0f);
    let _e103 = sample_shadow_2dX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(spotShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, atlasUv, texel_2, depthRef_1, normalBias_1, depthBias_1, nDotL_4);
    return (_e13 * _e103);
}

fn pick_channel(rgba: vec4<f32>, channelIndex: u32) -> f32 {
    switch channelIndex {
        case 0u: {
            return rgba.x;
        }
        case 1u: {
            return rgba.y;
        }
        case 2u: {
            return rgba.z;
        }
        default: {
            return rgba.w;
        }
    }
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    var out: VsOut;

    let instanceLocal = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].localFromInstance;
    let entityWorld = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let world = ((entityWorld * instanceLocal) * vec4<f32>(in.pos, 1f));
    let _e19 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e19 * world);
    out.worldPos = world.xyz;
    let instMat3_ = mat3x3<f32>(instanceLocal[0].xyz, instanceLocal[1].xyz, instanceLocal[2].xyz);
    let _e34 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].normalMatrix;
    out.worldNormal = normalize((instMat3_ * (_e34 * in.normal)));
    let worldTangentXyz = normalize(((entityWorld * instanceLocal) * vec4<f32>(in.tangent.xyz, 0f)).xyz);
    out.worldTangent = vec4<f32>(worldTangentXyz, in.tangent.w);
    out.uv = in.uv;
    out.instanceIdx = idx;
    let clipPos = out.clip;
    out.ndc = vec3<f32>((clipPos.xy / vec2(clipPos.w)), (clipPos.z / clipPos.w));
    out.viewZ = -(clipPos.w);
    let _e68 = out;
    return _e68;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    var a: f32;
    var ambient: vec3<f32>;
    var color: vec3<f32>;
    var i: u32 = 0u;
    var i_1: u32 = 0u;

    let baseSample = textureSample(baseColorTexture, baseColorSampler, in_1.uv);
    let _e8 = material.baseColor;
    let albedo = (_e8.xyz * baseSample.xyz);
    let mrSample = textureSample(metallicRoughnessTexture, metallicRoughnessSampler, in_1.uv);
    let _e18 = material.metallic;
    let _e21 = material.metallicChannel;
    let _e23 = pick_channel(mrSample, u32(_e21));
    let metallic_5 = (_e18 * _e23);
    let _e27 = material.roughnessChannel;
    let _e29 = pick_channel(mrSample, u32(_e27));
    let _e32 = material.roughness;
    a = max(_e32, 0.04f);
    let _e36 = a;
    a = (_e36 * _e29);
    let _e38 = a;
    let _e39 = a;
    a = (_e38 * _e39);
    let _e44 = textureSample(normalTexture, normalSampler, in_1.uv);
    let normSampleRg = _e44.xy;
    let _e46 = decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(normSampleRg);
    let _e49 = applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(in_1.worldNormal, in_1.worldTangent, _e46);
    let _e52 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let v = normalize((_e52 - in_1.worldPos));
    let f0_1 = mix(vec3(0.04f), albedo, metallic_5);
    let _e64 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(max(dot(_e49, v), 0f), f0_1);
    let kD = ((vec3(1f) - _e64) * (1f - metallic_5));
    let _e71 = material.roughness;
    let iblRoughness = (max(_e71, 0.04f) * _e29);
    let _e77 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e49, irradianceMap_1, irradianceSampler_1);
    let _e82 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e49, v, iblRoughness, f0_1, prefilterMap_1, prefilterSampler_1, brdfLut_1, brdfLutSampler_1);
    let aoSample = textureSample(occlusionTexture, occlusionSampler, in_1.uv);
    let _e90 = material.occlusionStrength;
    let ao = mix(1f, aoSample.x, _e90);
    let _e95 = skylight.colorR;
    let _e98 = skylight.colorG;
    let _e101 = skylight.colorB;
    let skyColor = vec3<f32>(_e95, _e98, _e101);
    let _e109 = skylight.intensity;
    ambient = ((((((kD * _e77) * albedo) + _e82) * skyColor) * _e109) * ao);
    let _e113 = ambient;
    color = _e113;
    let _e115 = color;
    let _e116 = a;
    let _e119 = evalDirectionalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e49, v, albedo, metallic_5, _e116, f0_1, in_1.worldPos, in_1.viewZ);
    color = (_e115 + _e119);
    let pointCount = pointLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.count;
    loop {
        let _e125 = i;
        if (_e125 < pointCount) {
        } else {
            break;
        }
        {
            let _e129 = i;
            let p = pointLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.slots[_e129];
            let _e132 = color;
            let _e137 = a;
            let _e138 = evalPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(p.position, p.colorTimesIntensity, p.invRangeSquared, in_1.worldPos, _e49, v, albedo, metallic_5, _e137, f0_1);
            color = (_e132 + _e138);
        }
        continuing {
            let _e140 = i;
            i = (_e140 + 1u);
        }
    }
    let spotCount = spotLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.count;
    loop {
        let _e147 = i_1;
        if (_e147 < spotCount) {
        } else {
            break;
        }
        {
            let _e151 = i_1;
            let s = spotLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.slots[_e151];
            if (s.shadowAtlasTile >= 0i) {
                let _e157 = color;
                let _e165 = a;
                let _e170 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj[s.shadowAtlasTile];
                let _e174 = evalSpotShadowedX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(s.position, s.direction, s.colorTimesIntensity, s.cosInner, s.cosOuter, s.invRangeSquared, in_1.worldPos, _e49, v, albedo, metallic_5, _e165, f0_1, _e170, s.shadowAtlasTile, 0.005f, 0.05f);
                color = (_e157 + _e174);
            } else {
                let _e176 = color;
                let _e184 = a;
                let _e185 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(s.position, s.direction, s.colorTimesIntensity, s.cosInner, s.cosOuter, s.invRangeSquared, in_1.worldPos, _e49, v, albedo, metallic_5, _e184, f0_1);
                color = (_e176 + _e185);
            }
        }
        continuing {
            let _e187 = i_1;
            i_1 = (_e187 + 1u);
        }
    }
    let _e193 = textureSample(emissiveTexture, emissiveSampler, in_1.uv);
    let emissiveSample = _e193.xyz;
    let _e195 = color;
    let _e198 = material.emissive;
    let _e201 = material.emissiveIntensity;
    color = (_e195 + ((_e198 * _e201) * emissiveSample));
    let _e205 = color;
    let _e209 = material.baseColor.w;
    return vec4<f32>(_e205, (_e209 * baseSample.w));
}

@fragment 
fn fs_gbuffer(in_2: VsOut) -> GBufferOutput {
    var a_1: f32;
    var out_1: GBufferOutput;

    let baseSample_1 = textureSample(baseColorTexture, baseColorSampler, in_2.uv);
    let _e7 = material.baseColor;
    let albedo_1 = (_e7.xyz * baseSample_1.xyz);
    let mrSample_1 = textureSample(metallicRoughnessTexture, metallicRoughnessSampler, in_2.uv);
    let _e17 = material.metallic;
    let _e20 = material.metallicChannel;
    let _e22 = pick_channel(mrSample_1, u32(_e20));
    let metallic_6 = (_e17 * _e22);
    let _e26 = material.roughnessChannel;
    let _e28 = pick_channel(mrSample_1, u32(_e26));
    let _e31 = material.roughness;
    a_1 = max(_e31, 0.04f);
    let _e35 = a_1;
    a_1 = (_e35 * _e28);
    let _e40 = textureSample(normalTexture, normalSampler, in_2.uv);
    let normSampleRg_1 = _e40.xy;
    let _e42 = decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(normSampleRg_1);
    let _e45 = applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(in_2.worldNormal, in_2.worldTangent, _e42);
    let _e49 = textureSample(emissiveTexture, emissiveSampler, in_2.uv);
    let emissiveSample_1 = _e49.xyz;
    let _e53 = material.emissive;
    let _e56 = material.emissiveIntensity;
    let emissive = ((_e53 * _e56) * emissiveSample_1);
    let aoSample_1 = textureSample(occlusionTexture, occlusionSampler, in_2.uv);
    let _e66 = material.occlusionStrength;
    let ao_1 = mix(1f, aoSample_1.x, _e66);
    let _e76 = a_1;
    out_1.normal_roughness = vec4<f32>(((_e45 * 0.5f) + vec3(0.5f)), _e76);
    out_1.albedo_metallic = vec4<f32>(albedo_1, metallic_6);
    out_1.emissive_ao = vec4<f32>(emissive, ao_1);
    let _e82 = out_1;
    return _e82;
}
