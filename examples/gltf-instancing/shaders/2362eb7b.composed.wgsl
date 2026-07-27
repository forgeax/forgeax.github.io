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
}

struct ClusterUniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX {
    grid: vec4<u32>,
    near_far_log: vec4<f32>,
}

struct LightSlotX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX {
    position: vec4<f32>,
    color: vec4<f32>,
    direction: vec4<f32>,
    kind_and_pad: vec4<u32>,
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
    uvSet: f32,
    alphaCutoff: f32,
    clearcoat: f32,
    clearcoatRoughness: f32,
    specularTint: vec3<f32>,
    baseColorUvScale: vec2<f32>,
    metallicRoughnessUvScale: vec2<f32>,
    normalUvScale: vec2<f32>,
    specularTintUvScale: vec2<f32>,
    emissiveUvScale: vec2<f32>,
    occlusionUvScale: vec2<f32>,
}

struct SkylightUniforms {
    intensity: f32,
    colorR: f32,
    colorG: f32,
    colorB: f32,
    rotation: vec4<f32>,
}

struct VsIn {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) tangent: vec4<f32>,
    @location(6) uv1_: vec2<f32>,
}

struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) worldPos: vec3<f32>,
    @location(1) worldNormal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) worldTangent: vec4<f32>,
    @location(4) @interpolate(flat) instanceIdx: u32,
    @location(5) uv1_: vec2<f32>,
    @location(6) ndc: vec3<f32>,
    @location(7) viewZ: f32,
}

struct GBufferOutput {
    @location(0) normal_roughness: vec4<f32>,
    @location(1) albedo_metallic: vec4<f32>,
    @location(2) emissive_ao: vec4<f32>,
}

const KIND_POINTX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX: u32 = 0u;

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<uniform> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 128>;
@group(3) @binding(0) 
var<uniform> instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 128>;
@group(2) @binding(6) 
var<uniform> cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX: ClusterUniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX;
@group(2) @binding(3) 
var<uniform> light_data_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX: array<LightSlotX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX, 128>;
@group(0) @binding(3) 
var shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_depth_2d;
@group(0) @binding(4) 
var shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: sampler_comparison;
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
var specularTintSampler: sampler;
@group(1) @binding(8) 
var specularTintTexture: texture_2d<f32>;
@group(1) @binding(17) 
var emissiveTexture: texture_2d<f32>;
@group(1) @binding(19) 
var occlusionTexture: texture_2d<f32>;
@group(1) @binding(16) 
var emissiveSampler: sampler;
@group(1) @binding(18) 
var occlusionSampler: sampler;
@group(1) @binding(9) 
var irradianceMap_1: texture_cube<f32>;
@group(1) @binding(10) 
var irradianceSampler_1: sampler;
@group(1) @binding(11) 
var prefilterMap_1: texture_cube<f32>;
@group(1) @binding(12) 
var prefilterSampler_1: sampler;
@group(1) @binding(13) 
var brdfLut_1: texture_2d<f32>;
@group(1) @binding(14) 
var brdfLutSampler_1: sampler;
@group(1) @binding(15) 
var<uniform> skylight: SkylightUniforms;
@group(2) @binding(7) 
var ssaoBlurredTexture: texture_2d<f32>;
@group(2) @binding(8) 
var ssaoBlurredSampler: sampler;

fn sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture: texture_2d<f32>, textureSampler: sampler, uv: vec2<f32>, uvScale: vec2<f32>) -> vec4<f32> {
    let _e5 = textureSample(texture, textureSampler, (uv * uvScale));
    return _e5;
}

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

fn inverseRotateEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(direction: vec3<f32>, rotation: vec4<f32>) -> vec3<f32> {
    let q = normalize(rotation);
    let t = (2f * cross(q.xyz, direction));
    return ((direction - (q.w * t)) + cross(q.xyz, t));
}

fn fresnelSchlickRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(cosTheta: f32, F0_: vec3<f32>, roughness: f32) -> vec3<f32> {
    let oneMinusRough = max(vec3((1f - roughness)), F0_);
    return (F0_ + ((oneMinusRough - F0_) * pow(clamp((1f - cosTheta), 0f, 1f), 5f)));
}

fn sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal: vec3<f32>, rotation_1: vec4<f32>, irradianceMap: texture_cube<f32>, irradianceSampler: sampler) -> vec3<f32> {
    let _e2 = inverseRotateEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(normal, rotation_1);
    let dir = vec3<f32>(_e2.x, -(_e2.y), _e2.z);
    let _e10 = textureSample(irradianceMap, irradianceSampler, dir);
    return _e10.xyz;
}

fn sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_1: vec3<f32>, view: vec3<f32>, roughness_1: f32, F0_1: vec3<f32>, rotation_2: vec4<f32>, prefilterMap: texture_cube<f32>, prefilterSampler: sampler, brdfLut: texture_2d<f32>, brdfLutSampler: sampler) -> vec3<f32> {
    let NdotV = max(dot(normal_1, view), 0.001f);
    let R = reflect(-(view), normal_1);
    let _e8 = inverseRotateEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(R, rotation_2);
    let Rflip = vec3<f32>(_e8.x, -(_e8.y), _e8.z);
    let mip = (roughness_1 * 4f);
    let _e19 = textureSampleLevel(prefilterMap, prefilterSampler, Rflip, mip);
    let prefilteredColor = _e19.xyz;
    let _e24 = textureSample(brdfLut, brdfLutSampler, vec2<f32>(NdotV, roughness_1));
    let envBRDF = _e24.xy;
    let _e27 = fresnelSchlickRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(NdotV, F0_1, roughness_1);
    return (prefilteredColor * ((_e27 * envBRDF.x) + vec3(envBRDF.y)));
}

fn get_ssao_intensityX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX() -> f32 {
    let _e3 = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX.near_far_log.w;
    return _e3;
}

fn evaluate_point_lightX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(light: LightSlotX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX, world_pos: vec3<f32>, N: vec3<f32>, V: vec3<f32>, base_color: vec3<f32>, metallic: f32, roughness_2: f32) -> vec3<f32> {
    let L_vec = (light.position.xyz - world_pos);
    let dist_sq = dot(L_vec, L_vec);
    let L = normalize(L_vec);
    let H = normalize((V + L));
    let factor = (1f - ((dist_sq * light.position.w) * (dist_sq * light.position.w)));
    let atten = (max(min(factor, 1f), 0f) / max(dist_sq, 0.0001f));
    let NdotL = max(dot(N, L), 0f);
    let NdotV_1 = max(dot(N, V), 0f);
    let NdotH = max(dot(N, H), 0f);
    let VdotH = max(dot(V, H), 0f);
    let F0_4 = mix(vec3(0.04f), base_color, metallic);
    let F = (F0_4 + ((vec3(1f) - F0_4) * pow((1f - VdotH), 5f)));
    let alpha_1 = (roughness_2 * roughness_2);
    let alpha2_ = (alpha_1 * alpha_1);
    let denom = (((NdotH * NdotH) * (alpha2_ - 1f)) + 1f);
    let D = (alpha2_ / ((3.1415927f * denom) * denom));
    let k = (((roughness_2 + 1f) * (roughness_2 + 1f)) / 8f);
    let G1V = (NdotV_1 / ((NdotV_1 * (1f - k)) + k));
    let G1L = (NdotL / ((NdotL * (1f - k)) + k));
    let G = (G1V * G1L);
    let specular = (((F * D) * G) / vec3(max(((4f * NdotV_1) * NdotL), 0.001f)));
    let kD = ((vec3(1f) - F) * (1f - metallic));
    let diffuse = ((kD * base_color) / vec3(3.1415927f));
    let lit = ((((diffuse + specular) * NdotL) * light.color.xyz) * atten);
    return lit;
}

fn evaluate_spot_lightX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(light_1: LightSlotX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX, world_pos_1: vec3<f32>, N_1: vec3<f32>, V_1: vec3<f32>, base_color_1: vec3<f32>, metallic_1: f32, roughness_3: f32) -> vec3<f32> {
    let L_vec_1 = (light_1.position.xyz - world_pos_1);
    let dist_sq_1 = dot(L_vec_1, L_vec_1);
    let L_1 = normalize(L_vec_1);
    let H_1 = normalize((V_1 + L_1));
    let atten_dist_factor = (1f - ((dist_sq_1 * light_1.position.w) * (dist_sq_1 * light_1.position.w)));
    let atten_dist = (max(min(atten_dist_factor, 1f), 0f) / max(dist_sq_1, 0.0001f));
    let spot_dir = normalize(light_1.direction.xyz);
    let cos_angle = dot(-(L_1), spot_dir);
    let spot_atten = smoothstep(light_1.direction.w, light_1.color.w, cos_angle);
    let atten_1 = (atten_dist * spot_atten);
    let NdotL_1 = max(dot(N_1, L_1), 0f);
    let NdotV_2 = max(dot(N_1, V_1), 0f);
    let NdotH_1 = max(dot(N_1, H_1), 0f);
    let VdotH_1 = max(dot(V_1, H_1), 0f);
    let F0_5 = mix(vec3(0.04f), base_color_1, metallic_1);
    let F_1 = (F0_5 + ((vec3(1f) - F0_5) * pow((1f - VdotH_1), 5f)));
    let alpha_2 = (roughness_3 * roughness_3);
    let alpha2_1 = (alpha_2 * alpha_2);
    let denom_1 = (((NdotH_1 * NdotH_1) * (alpha2_1 - 1f)) + 1f);
    let D_1 = (alpha2_1 / ((3.1415927f * denom_1) * denom_1));
    let k_1 = (((roughness_3 + 1f) * (roughness_3 + 1f)) / 8f);
    let G1V_1 = (NdotV_2 / ((NdotV_2 * (1f - k_1)) + k_1));
    let G1L_1 = (NdotL_1 / ((NdotL_1 * (1f - k_1)) + k_1));
    let G_1 = (G1V_1 * G1L_1);
    let specular_1 = (((F_1 * D_1) * G_1) / vec3(max(((4f * NdotV_2) * NdotL_1), 0.001f)));
    let kD_1 = ((vec3(1f) - F_1) * (1f - metallic_1));
    let diffuse_1 = ((kD_1 * base_color_1) / vec3(3.1415927f));
    return ((((diffuse_1 + specular_1) * NdotL_1) * light_1.color.xyz) * atten_1);
}

fn evaluate_cluster_lightsX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(ndc: vec3<f32>, view_z: f32, world_pos_2: vec3<f32>, N_2: vec3<f32>, V_2: vec3<f32>, base_color_2: vec3<f32>, metallic_2: f32, roughness_4: f32) -> vec3<f32> {
    var total_radiance: vec3<f32> = vec3(0f);
    var i: u32 = 0u;

    let gx = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX.grid.x;
    let gy = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX.grid.y;
    let gz = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX.grid.z;
    let near = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX.near_far_log.x;
    let far = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX.near_far_log.y;
    let log_far = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX.near_far_log.z;
    let _e30 = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX.grid.w;
    let light_count = min(_e30, 128u);
    loop {
        let _e34 = i;
        if (_e34 < 128u) {
        } else {
            break;
        }
        {
            let _e37 = i;
            if (_e37 >= light_count) {
                break;
            }
            let _e40 = i;
            let light_2 = light_data_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX[_e40];
            let kind = light_2.kind_and_pad.x;
            if (kind == KIND_POINTX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX) {
                let _e48 = total_radiance;
                let _e55 = evaluate_point_lightX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(light_2, world_pos_2, N_2, V_2, base_color_2, metallic_2, roughness_4);
                total_radiance = (_e48 + _e55);
            } else {
                let _e57 = total_radiance;
                let _e58 = evaluate_spot_lightX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(light_2, world_pos_2, N_2, V_2, base_color_2, metallic_2, roughness_4);
                total_radiance = (_e57 + _e58);
            }
        }
        continuing {
            let _e60 = i;
            i = (_e60 + 1u);
        }
    }
    let _e63 = total_radiance;
    return _e63;
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

fn evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_2: vec3<f32>, viewDir: vec3<f32>, baseColor: vec3<f32>, metallic_3: f32, alphaSq: f32, F0_2: vec3<f32>) -> vec3<f32> {
    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let l_1 = normalize(-(_e2));
    let h = normalize((viewDir + l_1));
    let nDotL_1 = max(dot(normal_2, l_1), 0f);
    let nDotV_1 = max(dot(normal_2, viewDir), 0.00001f);
    let nDotH_1 = max(dot(normal_2, h), 0f);
    let vDotH_1 = max(dot(viewDir, h), 0f);
    let _e22 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH_1, F0_2);
    let _e24 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_1, alphaSq);
    let _e25 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_1, nDotL_1, alphaSq);
    let specular_2 = ((_e24 * _e25) * _e22);
    let kd = ((vec3(1f) - _e22) * (1f - metallic_3));
    let diffuse_2 = ((kd * baseColor) / vec3(3.1415927f));
    let _e43 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightColor;
    return (((diffuse_2 + specular_2) * _e43) * nDotL_1);
}

fn _pickCascadeLayerX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(viewDepth: f32, count: u32) -> u32 {
    var layer: u32;
    var i_1: u32 = 0u;

    layer = (count - 1u);
    loop {
        let _e6 = i_1;
        if (_e6 < (count - 1u)) {
        } else {
            break;
        }
        {
            let _e12 = i_1;
            let sp = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[_e12].x;
            if (viewDepth < sp) {
                let _e18 = i_1;
                layer = _e18;
                break;
            }
        }
        continuing {
            let _e19 = i_1;
            i_1 = (_e19 + 1u);
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

fn _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos: vec3<f32>, layer_3: u32, count_2: u32, normal_3: vec3<f32>, l: vec3<f32>) -> f32 {
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
    let bias = max((_e39 * (1f - dot(normal_3, l))), _e48);
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
    let texel = vec2<f32>((1f / texelDims.x), (1f / texelDims.y));
    let tileLo = (_e21 + texel);
    let tileHi = ((_e21 + vec2(inv_1)) - texel);
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
                    let offsetUv = clamp((uv_1 + (vec2<f32>(f32(_e131), f32(_e133)) * texel)), tileLo, tileHi);
                    let lit_1 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv, adjustedDepth);
                    let _e143 = blocked;
                    blocked = (_e143 + (1f - lit_1));
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

fn evalDirectionalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_4: vec3<f32>, viewDir_1: vec3<f32>, baseColor_1: vec3<f32>, metallic_4: f32, alphaSq_1: f32, F0_3: vec3<f32>, worldPos_1: vec3<f32>, viewZ: f32) -> vec3<f32> {
    var shadow: f32;
    var local_5: bool;

    let _e6 = evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_4, viewDir_1, baseColor_1, metallic_4, alphaSq_1, F0_3);
    let _e9 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let l_2 = normalize(-(_e9));
    let _e14 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeCount;
    let count_3 = u32(max(_e14, 1f));
    let viewDepth_1 = -(viewZ);
    let _e20 = _pickCascadeLayerX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(viewDepth_1, count_3);
    let _e22 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_1, _e20, count_3, normal_4, l_2);
    shadow = _e22;
    let _e26 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
    if (_e26 > 0f) {
        local_5 = ((_e20 + 1u) < count_3);
    } else {
        local_5 = false;
    }
    let _e35 = local_5;
    if _e35 {
        let spCurr = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[_e20].x;
        let _e43 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
        let blendWidth = (spCurr * _e43);
        if (blendWidth > 0f) {
            let dist = (spCurr - viewDepth_1);
            let t_1 = clamp((1f - (dist / blendWidth)), 0f, 1f);
            if (t_1 > 0f) {
                let _e58 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_1, (_e20 + 1u), count_3, normal_4, l_2);
                shadow = mix(_e22, _e58, t_1);
            }
        }
    }
    let _e60 = shadow;
    return (_e6 * _e60);
}

fn materialTextureFilteringWitness() {
    let baseWitness = textureSample(baseColorTexture, baseColorSampler, vec2(0f));
    let metallicRoughnessWitness = textureSample(metallicRoughnessTexture, metallicRoughnessSampler, vec2(0f));
    let normalWitness = textureSample(normalTexture, normalSampler, vec2(0f));
    let specularTintWitness = textureSample(specularTintTexture, specularTintSampler, vec2(0f));
    let emissiveWitness = textureSample(emissiveTexture, emissiveSampler, vec2(0f));
    let occlusionWitness = textureSample(occlusionTexture, occlusionSampler, vec2(0f));
    return;
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

fn selectUv(in_3: VsOut) -> vec2<f32> {
    let _e5 = material.uvSet;
    return select(in_3.uv, in_3.uv1_, (_e5 >= 0.5f));
}

fn alphaTest(alpha: f32) {
    var local_6: bool;

    let _e2 = material.alphaCutoff;
    if (_e2 > 0f) {
        let _e8 = material.alphaCutoff;
        local_6 = (alpha < _e8);
    } else {
        local_6 = false;
    }
    let _e13 = local_6;
    if _e13 {
        discard;
    } else {
        return;
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
    out.uv1_ = in.uv1_;
    out.instanceIdx = idx;
    let clipPos = out.clip;
    out.ndc = vec3<f32>((clipPos.xy / vec2(clipPos.w)), (clipPos.z / clipPos.w));
    out.viewZ = -(clipPos.w);
    let _e70 = out;
    return _e70;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    var a: f32;
    var ambient: vec3<f32>;
    var color: vec3<f32>;

    let _e1 = selectUv(in_1);
    let _e4 = material.baseColorUvScale;
    let _e7 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, _e1, _e4);
    let _e11 = material.baseColor.w;
    alphaTest((_e11 * _e7.w));
    let _e16 = material.baseColor;
    let albedo = (_e16.xyz * _e7.xyz);
    let _e22 = material.metallicRoughnessUvScale;
    let _e25 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(metallicRoughnessTexture, metallicRoughnessSampler, _e1, _e22);
    let _e28 = material.metallic;
    let _e31 = material.metallicChannel;
    let _e33 = pick_channel(_e25, u32(_e31));
    let metallic_5 = (_e28 * _e33);
    let _e37 = material.roughnessChannel;
    let _e39 = pick_channel(_e25, u32(_e37));
    let _e42 = material.roughness;
    a = max(_e42, 0.04f);
    let _e46 = a;
    a = (_e46 * _e39);
    let _e48 = a;
    let _e49 = a;
    a = (_e48 * _e49);
    let _e53 = material.normalUvScale;
    let _e56 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(normalTexture, normalSampler, _e1, _e53);
    let normSampleRg = _e56.xy;
    let _e58 = decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(normSampleRg);
    let _e61 = applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(in_1.worldNormal, in_1.worldTangent, _e58);
    let _e64 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let v = normalize((_e64 - in_1.worldPos));
    let _e70 = material.specularTint;
    let _e73 = material.specularTintUvScale;
    let _e76 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(specularTintTexture, specularTintSampler, _e1, _e73);
    let specularTint = (_e70 * _e76.xyz);
    let f0_1 = mix((vec3(0.04f) * specularTint), albedo, metallic_5);
    let _e85 = material.clearcoatRoughness;
    let coatRoughness = max(_e85, 0.04f);
    let coatAlpha = (coatRoughness * coatRoughness);
    let _e94 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(max(dot(_e61, v), 0f), vec3(0.04f));
    let _e97 = material.clearcoat;
    let coatF = (_e94 * _e97);
    let _e104 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(max(dot(_e61, v), 0f), f0_1);
    let kD_2 = ((vec3(1f) - _e104) * (1f - metallic_5));
    let _e111 = material.roughness;
    let iblRoughness = (max(_e111, 0.04f) * _e39);
    let _e117 = skylight.rotation;
    let _e120 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e61, _e117, irradianceMap_1, irradianceSampler_1);
    let _e123 = skylight.rotation;
    let _e128 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e61, v, iblRoughness, f0_1, _e123, prefilterMap_1, prefilterSampler_1, brdfLut_1, brdfLutSampler_1);
    let _e133 = skylight.rotation;
    let _e138 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e61, v, coatRoughness, vec3(0.04f), _e133, prefilterMap_1, prefilterSampler_1, brdfLut_1, brdfLutSampler_1);
    let _e141 = material.occlusionUvScale;
    let _e144 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(occlusionTexture, occlusionSampler, _e1, _e141);
    let _e148 = material.occlusionStrength;
    let ao = mix(1f, _e144.x, _e148);
    let _e153 = skylight.colorR;
    let _e156 = skylight.colorG;
    let _e159 = skylight.colorB;
    let skyColor = vec3<f32>(_e153, _e156, _e159);
    let _e170 = material.clearcoat;
    let _e176 = skylight.intensity;
    ambient = ((((((((kD_2 * _e120) * albedo) + _e128) * (vec3(1f) - coatF)) + (_e138 * _e170)) * skyColor) * _e176) * ao);
    let ssaoUv = ((in_1.ndc.xy * vec2<f32>(0.5f, -0.5f)) + vec2<f32>(0.5f, 0.5f));
    let _e192 = textureSample(ssaoBlurredTexture, ssaoBlurredSampler, ssaoUv);
    let ssaoFactor = _e192.x;
    let _e194 = get_ssao_intensityX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX();
    let _e195 = ambient;
    ambient = (_e195 * mix(1f, (ssaoFactor * ao), _e194));
    let _e200 = ambient;
    color = _e200;
    let _e202 = color;
    let _e203 = a;
    let _e206 = evalDirectionalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e61, v, albedo, metallic_5, _e203, f0_1, in_1.worldPos, in_1.viewZ);
    color = (_e202 + _e206);
    let _e208 = color;
    let _e211 = material.clearcoat;
    let _e219 = evalDirectionalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e61, v, vec3(0f), 1f, coatAlpha, vec3(0.04f), in_1.worldPos, in_1.viewZ);
    color = (_e208 + (_e211 * _e219));
    let _e222 = color;
    let _e226 = a;
    let _e227 = evaluate_cluster_lightsX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(in_1.ndc, in_1.viewZ, in_1.worldPos, _e61, v, albedo, metallic_5, _e226);
    color = (_e222 + _e227);
    let _e229 = color;
    let _e232 = material.clearcoat;
    let _e239 = evaluate_cluster_lightsX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(in_1.ndc, in_1.viewZ, in_1.worldPos, _e61, v, vec3(0f), 1f, coatRoughness);
    color = (_e229 + (_e232 * _e239));
    let _e244 = material.emissiveUvScale;
    let _e247 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(emissiveTexture, emissiveSampler, _e1, _e244);
    let emissiveSample = _e247.xyz;
    let _e249 = color;
    let _e252 = material.emissive;
    let _e255 = material.emissiveIntensity;
    color = (_e249 + ((_e252 * _e255) * emissiveSample));
    let _e259 = color;
    let _e263 = material.baseColor.w;
    return vec4<f32>(_e259, (_e263 * _e7.w));
}

@fragment 
fn fs_gbuffer(in_2: VsOut) -> GBufferOutput {
    var a_1: f32;
    var out_1: GBufferOutput;

    let _e1 = selectUv(in_2);
    let _e4 = material.baseColorUvScale;
    let _e7 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, _e1, _e4);
    let _e11 = material.baseColor.w;
    alphaTest((_e11 * _e7.w));
    let _e16 = material.baseColor;
    let albedo_1 = (_e16.xyz * _e7.xyz);
    let _e22 = material.metallicRoughnessUvScale;
    let _e25 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(metallicRoughnessTexture, metallicRoughnessSampler, _e1, _e22);
    let _e28 = material.metallic;
    let _e31 = material.metallicChannel;
    let _e33 = pick_channel(_e25, u32(_e31));
    let metallic_6 = (_e28 * _e33);
    let _e37 = material.roughnessChannel;
    let _e39 = pick_channel(_e25, u32(_e37));
    let _e42 = material.roughness;
    a_1 = max(_e42, 0.04f);
    let _e46 = a_1;
    a_1 = (_e46 * _e39);
    let _e50 = material.normalUvScale;
    let _e53 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(normalTexture, normalSampler, _e1, _e50);
    let normSampleRg_1 = _e53.xy;
    let _e55 = decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(normSampleRg_1);
    let _e58 = applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(in_2.worldNormal, in_2.worldTangent, _e55);
    let _e61 = material.emissiveUvScale;
    let _e64 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(emissiveTexture, emissiveSampler, _e1, _e61);
    let emissiveSample_1 = _e64.xyz;
    let _e68 = material.emissive;
    let _e71 = material.emissiveIntensity;
    let emissive = ((_e68 * _e71) * emissiveSample_1);
    let _e76 = material.occlusionUvScale;
    let _e79 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(occlusionTexture, occlusionSampler, _e1, _e76);
    let _e83 = material.occlusionStrength;
    let ao_1 = mix(1f, _e79.x, _e83);
    let _e93 = a_1;
    out_1.normal_roughness = vec4<f32>(((_e58 * 0.5f) + vec3(0.5f)), _e93);
    out_1.albedo_metallic = vec4<f32>(albedo_1, metallic_6);
    out_1.emissive_ao = vec4<f32>(emissive, ao_1);
    let _e99 = out_1;
    return _e99;
}
