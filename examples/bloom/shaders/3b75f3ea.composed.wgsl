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

struct MaterialTextureCoordinates {
    transform: vec4<f32>,
    metadata: vec4<f32>,
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
    alphaCutoff: f32,
    clearcoat: f32,
    clearcoatRoughness: f32,
    specularTint: vec3<f32>,
    baseColorCoordinates: MaterialTextureCoordinates,
    metallicRoughnessCoordinates: MaterialTextureCoordinates,
    normalCoordinates: MaterialTextureCoordinates,
    specularTintCoordinates: MaterialTextureCoordinates,
    emissiveCoordinates: MaterialTextureCoordinates,
    occlusionCoordinates: MaterialTextureCoordinates,
    normalScale: f32,
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
    @location(7) uv2_: vec2<f32>,
    @location(8) uv3_: vec2<f32>,
    @location(9) uv4_: vec2<f32>,
    @location(10) uv5_: vec2<f32>,
    @location(11) uv6_: vec2<f32>,
    @location(12) uv7_: vec2<f32>,
}

struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) worldPos: vec3<f32>,
    @location(1) worldNormal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) worldTangent: vec4<f32>,
    @location(4) @interpolate(flat) instanceIdx: u32,
    @location(5) uv1_: vec2<f32>,
    @location(8) uv2_: vec2<f32>,
    @location(9) uv3_: vec2<f32>,
    @location(10) uv4_: vec2<f32>,
    @location(11) uv5_: vec2<f32>,
    @location(12) uv6_: vec2<f32>,
    @location(13) uv7_: vec2<f32>,
    @location(6) ndc: vec3<f32>,
    @location(7) viewZ: f32,
}

struct GBufferOutput {
    @location(0) normal_roughness: vec4<f32>,
    @location(1) albedo_metallic: vec4<f32>,
    @location(2) emissive_ao: vec4<f32>,
}

const PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX: f32 = 3.1415927f;
const KIND_POINTX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX: u32 = 0u;
const THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX: u32 = 16u;
const THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX: array<vec2<f32>, 256> = array<vec2<f32>, 256>(vec2<f32>(0.14709473f, 0.8520508f), vec2<f32>(0.16552734f, 0.78759766f), vec2<f32>(0.24438477f, 0.6386719f), vec2<f32>(0.3708496f, 0.51953125f), vec2<f32>(0.49682617f, 0.41552734f), vec2<f32>(0.6020508f, 0.32641602f), vec2<f32>(0.68408203f, 0.25390625f), vec2<f32>(0.74609375f, 0.19750977f), vec2<f32>(0.79052734f, 0.15429688f), vec2<f32>(0.8222656f, 0.12164307f), vec2<f32>(0.8432617f, 0.09698486f), vec2<f32>(0.8564453f, 0.078430176f), vec2<f32>(0.86328125f, 0.06439209f), vec2<f32>(0.86572266f, 0.053710938f), vec2<f32>(0.8642578f, 0.045440674f), vec2<f32>(0.8598633f, 0.039031982f), vec2<f32>(0.38867188f, 0.6113281f), vec2<f32>(0.3930664f, 0.60058594f), vec2<f32>(0.41235352f, 0.54589844f), vec2<f32>(0.45654297f, 0.4482422f), vec2<f32>(0.52783203f, 0.35253906f), vec2<f32>(0.6074219f, 0.27392578f), vec2<f32>(0.67871094f, 0.21142578f), vec2<f32>(0.73339844f, 0.16259766f), vec2<f32>(0.7709961f, 0.12536621f), vec2<f32>(0.79345703f, 0.09729004f), vec2<f32>(0.80322266f, 0.07623291f), vec2<f32>(0.80371094f, 0.06036377f), vec2<f32>(0.7963867f, 0.048431396f), vec2<f32>(0.78564453f, 0.039367676f), vec2<f32>(0.77197266f, 0.032409668f), vec2<f32>(0.7548828f, 0.026977539f), vec2<f32>(0.5722656f, 0.42749023f), vec2<f32>(0.57373047f, 0.42407227f), vec2<f32>(0.57958984f, 0.40356445f), vec2<f32>(0.5917969f, 0.3544922f), vec2<f32>(0.61621094f, 0.28808594f), vec2<f32>(0.65527344f, 0.22485352f), vec2<f32>(0.69873047f, 0.17260742f), vec2<f32>(0.73535156f, 0.13183594f), vec2<f32>(0.75927734f, 0.10089111f), vec2<f32>(0.77001953f, 0.07745361f), vec2<f32>(0.77197266f, 0.059936523f), vec2<f32>(0.7661133f, 0.046844482f), vec2<f32>(0.7519531f, 0.036987305f), vec2<f32>(0.7324219f, 0.029541016f), vec2<f32>(0.70947266f, 0.023834229f), vec2<f32>(0.68359375f, 0.019439697f), vec2<f32>(0.7089844f, 0.29101563f), vec2<f32>(0.7089844f, 0.28979492f), vec2<f32>(0.70996094f, 0.28125f), vec2<f32>(0.70996094f, 0.25854492f), vec2<f32>(0.7114258f, 0.22045898f), vec2<f32>(0.71972656f, 0.17687988f), vec2<f32>(0.734375f, 0.13708496f), vec2<f32>(0.7480469f, 0.10479736f), vec2<f32>(0.7558594f, 0.07989502f), vec2<f32>(0.7597656f, 0.06100464f), vec2<f32>(0.75341797f, 0.046844482f), vec2<f32>(0.73876953f, 0.036224365f), vec2<f32>(0.71777344f, 0.028259277f), vec2<f32>(0.69189453f, 0.022262573f), vec2<f32>(0.6611328f, 0.017700195f), vec2<f32>(0.62841797f, 0.014198303f), vec2<f32>(0.80810547f, 0.19177246f), vec2<f32>(0.8076172f, 0.19128418f), vec2<f32>(0.80615234f, 0.18798828f), vec2<f32>(0.8017578f, 0.17810059f), vec2<f32>(0.79296875f, 0.1586914f), vec2<f32>(0.7836914f, 0.13220215f), vec2<f32>(0.7753906f, 0.1048584f), vec2<f32>(0.7685547f, 0.08111572f), vec2<f32>(0.76464844f, 0.0619812f), vec2<f32>(0.7553711f, 0.04727173f), vec2<f32>(0.7402344f, 0.03616333f), vec2<f32>(0.71875f, 0.027755737f), vec2<f32>(0.69091797f, 0.021484375f), vec2<f32>(0.6582031f, 0.016738892f), vec2<f32>(0.6220703f, 0.013160706f), vec2<f32>(0.5839844f, 0.010414124f), vec2<f32>(0.87841797f, 0.1217041f), vec2<f32>(0.8779297f, 0.1217041f), vec2<f32>(0.875f, 0.12060547f), vec2<f32>(0.8691406f, 0.11694336f), vec2<f32>(0.8569336f, 0.10803223f), vec2<f32>(0.8378906f, 0.09375f), vec2<f32>(0.8149414f, 0.0769043f), vec2<f32>(0.79589844f, 0.060699463f), vec2<f32>(0.7763672f, 0.046875f), vec2<f32>(0.75634766f, 0.03591919f), vec2<f32>(0.7324219f, 0.027450562f), vec2<f32>(0.703125f, 0.021026611f), vec2<f32>(0.6689453f, 0.016174316f), vec2<f32>(0.6303711f, 0.012512207f), vec2<f32>(0.58935547f, 0.009742737f), vec2<f32>(0.5463867f, 0.007633209f), vec2<f32>(0.92626953f, 0.073791504f), vec2<f32>(0.92578125f, 0.073913574f), vec2<f32>(0.92285156f, 0.073913574f), vec2<f32>(0.9169922f, 0.07312012f), vec2<f32>(0.9038086f, 0.06982422f), vec2<f32>(0.88134766f, 0.06311035f), vec2<f32>(0.8510742f, 0.05380249f), vec2<f32>(0.82128906f, 0.043701172f), vec2<f32>(0.7910156f, 0.03439331f), vec2<f32>(0.76123047f, 0.026611328f), vec2<f32>(0.72802734f, 0.020446777f), vec2<f32>(0.69189453f, 0.015655518f), vec2<f32>(0.6508789f, 0.012008667f), vec2<f32>(0.6074219f, 0.009254456f), vec2<f32>(0.56103516f, 0.007156372f), vec2<f32>(0.51416016f, 0.0055656433f), vec2<f32>(0.95751953f, 0.04232788f), vec2<f32>(0.95703125f, 0.04244995f), vec2<f32>(0.95458984f, 0.042816162f), vec2<f32>(0.94921875f, 0.043182373f), vec2<f32>(0.9370117f, 0.042663574f), vec2<f32>(0.91308594f, 0.040252686f), vec2<f32>(0.88183594f, 0.03579712f), vec2<f32>(0.84472656f, 0.030136108f), vec2<f32>(0.80615234f, 0.024337769f), vec2<f32>(0.76708984f, 0.01914978f), vec2<f32>(0.7265625f, 0.014854431f), vec2<f32>(0.6826172f, 0.011421204f), vec2<f32>(0.63623047f, 0.008773804f), vec2<f32>(0.58691406f, 0.00674057f), vec2<f32>(0.5366211f, 0.0051994324f), vec2<f32>(0.48608398f, 0.004020691f), vec2<f32>(0.97753906f, 0.022628784f), vec2<f32>(0.9770508f, 0.022750854f), vec2<f32>(0.97509766f, 0.02319336f), vec2<f32>(0.96972656f, 0.023910522f), vec2<f32>(0.95947266f, 0.024490356f), vec2<f32>(0.93603516f, 0.024124146f), vec2<f32>(0.90527344f, 0.022521973f), vec2<f32>(0.8652344f, 0.019760132f), vec2<f32>(0.82177734f, 0.01651001f), vec2<f32>(0.77441406f, 0.013290405f), vec2<f32>(0.7265625f, 0.0104599f), vec2<f32>(0.67626953f, 0.008132935f), vec2<f32>(0.62402344f, 0.0062789917f), vec2<f32>(0.5698242f, 0.004825592f), vec2<f32>(0.5151367f, 0.0037136078f), vec2<f32>(0.46142578f, 0.0028629303f), vec2<f32>(0.98876953f, 0.011070251f), vec2<f32>(0.98876953f, 0.011161804f), vec2<f32>(0.9868164f, 0.011512756f), vec2<f32>(0.98291016f, 0.012214661f), vec2<f32>(0.97314453f, 0.012992859f), vec2<f32>(0.953125f, 0.013519287f), vec2<f32>(0.92285156f, 0.013282776f), vec2<f32>(0.8823242f, 0.012260437f), vec2<f32>(0.83496094f, 0.010658264f), vec2<f32>(0.7832031f, 0.008850098f), vec2<f32>(0.7285156f, 0.0071144104f), vec2<f32>(0.671875f, 0.005607605f), vec2<f32>(0.61376953f, 0.004360199f), vec2<f32>(0.5546875f, 0.0033721924f), vec2<f32>(0.4963379f, 0.0025997162f), vec2<f32>(0.43945313f, 0.0020046234f), vec2<f32>(0.9951172f, 0.004798889f), vec2<f32>(0.9951172f, 0.004863739f), vec2<f32>(0.99365234f, 0.0050964355f), vec2<f32>(0.9902344f, 0.0056037903f), vec2<f32>(0.9814453f, 0.0063323975f), vec2<f32>(0.96435547f, 0.0069770813f), vec2<f32>(0.93603516f, 0.007297516f), vec2<f32>(0.8964844f, 0.0071258545f), vec2<f32>(0.8466797f, 0.0064926147f), vec2<f32>(0.7915039f, 0.005596161f), vec2<f32>(0.7314453f, 0.004627228f), vec2<f32>(0.6689453f, 0.0037174225f), vec2<f32>(0.60546875f, 0.0029296875f), vec2<f32>(0.5415039f, 0.002281189f), vec2<f32>(0.47924805f, 0.0017662048f), vec2<f32>(0.41967773f, 0.0013656616f), vec2<f32>(0.9980469f, 0.0017604828f), vec2<f32>(0.9980469f, 0.0017938614f), vec2<f32>(0.99658203f, 0.0019292831f), vec2<f32>(0.9941406f, 0.0022392273f), vec2<f32>(0.9863281f, 0.002729416f), vec2<f32>(0.9716797f, 0.003250122f), vec2<f32>(0.9458008f, 0.0036697388f), vec2<f32>(0.90771484f, 0.003818512f), vec2<f32>(0.85839844f, 0.0036811829f), vec2<f32>(0.7993164f, 0.003320694f), vec2<f32>(0.73535156f, 0.0028438568f), vec2<f32>(0.66748047f, 0.0023441315f), vec2<f32>(0.5986328f, 0.0018796921f), vec2<f32>(0.53027344f, 0.0014829636f), vec2<f32>(0.46411133f, 0.0011587143f), vec2<f32>(0.4020996f, 0.0008993149f), vec2<f32>(0.9995117f, 0.00050115585f), vec2<f32>(0.9995117f, 0.00051546097f), vec2<f32>(0.9980469f, 0.0005836487f), vec2<f32>(0.99658203f, 0.0007505417f), vec2<f32>(0.9892578f, 0.0010147095f), vec2<f32>(0.9760742f, 0.0013465881f), vec2<f32>(0.9526367f, 0.0016527176f), vec2<f32>(0.9160156f, 0.0018558502f), vec2<f32>(0.8671875f, 0.0019054413f), vec2<f32>(0.8076172f, 0.0018167496f), vec2<f32>(0.7392578f, 0.0016212463f), vec2<f32>(0.6669922f, 0.0013799667f), vec2<f32>(0.5932617f, 0.0011358261f), vec2<f32>(0.52001953f, 0.0009121895f), vec2<f32>(0.45043945f, 0.00072193146f), vec2<f32>(0.38598633f, 0.00056505203f), vec2<f32>(1f, 0.00009316206f), vec2<f32>(1f, 0.00009787083f), vec2<f32>(0.99902344f, 0.00012540817f), vec2<f32>(0.9970703f, 0.00019216537f), vec2<f32>(0.99072266f, 0.000310421f), vec2<f32>(0.9790039f, 0.00046992302f), vec2<f32>(0.95751953f, 0.000647068f), vec2<f32>(0.92333984f, 0.0007915497f), vec2<f32>(0.8754883f, 0.00087690353f), vec2<f32>(0.8149414f, 0.0008869171f), vec2<f32>(0.7441406f, 0.0008325577f), vec2<f32>(0.66748047f, 0.00073862076f), vec2<f32>(0.5883789f, 0.000626564f), vec2<f32>(0.51123047f, 0.0005168915f), vec2<f32>(0.43823242f, 0.00041651726f), vec2<f32>(0.37109375f, 0.0003311634f), vec2<f32>(1f, 0.0000072717667f), vec2<f32>(1f, 0.000008165836f), vec2<f32>(0.99902344f, 0.000016987324f), vec2<f32>(0.9975586f, 0.000037908554f), vec2<f32>(0.9921875f, 0.00007593632f), vec2<f32>(0.9814453f, 0.00013744831f), vec2<f32>(0.9614258f, 0.00020754337f), vec2<f32>(0.9291992f, 0.00028014183f), vec2<f32>(0.8828125f, 0.00033450127f), vec2<f32>(0.82177734f, 0.00036263466f), vec2<f32>(0.74902344f, 0.00036215782f), vec2<f32>(0.66845703f, 0.00033807755f), vec2<f32>(0.5854492f, 0.00029969215f), vec2<f32>(0.50390625f, 0.00025582314f), vec2<f32>(0.42700195f, 0.0002117157f), vec2<f32>(0.35766602f, 0.000172019f), vec2<f32>(1f, 0f), vec2<f32>(1f, 0.000000059604645f), vec2<f32>(0.9995117f, 0.0000012516975f), vec2<f32>(0.9975586f, 0.0000053048134f), vec2<f32>(0.99316406f, 0.000015079975f), vec2<f32>(0.98291016f, 0.000028550625f), vec2<f32>(0.96435547f, 0.000047445297f), vec2<f32>(0.93408203f, 0.00006842613f), vec2<f32>(0.88916016f, 0.00008893013f), vec2<f32>(0.828125f, 0.000104248524f), vec2<f32>(0.75390625f, 0.00011217594f), vec2<f32>(0.67041016f, 0.00011241436f), vec2<f32>(0.5830078f, 0.00010627508f), vec2<f32>(0.4970703f, 0.00009584427f), vec2<f32>(0.4169922f, 0.00008332729f), vec2<f32>(0.34521484f, 0.000070512295f));

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(3) @binding(0) 
var<storage> instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(2) @binding(6) 
var<uniform> cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX: ClusterUniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX;
@group(2) @binding(4) 
var<storage> cluster_gridX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX: array<u32>;
@group(2) @binding(5) 
var<storage> light_index_listX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX: array<u32>;
@group(2) @binding(3) 
var<storage> light_dataX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX: array<LightSlotX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX, 256>;
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

fn sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture: texture_2d<f32>, textureSampler: sampler, uv: vec2<f32>, uvScale: vec2<f32>) -> vec4<f32> {
    let _e5 = textureSample(texture, textureSampler, (uv * uvScale));
    return _e5;
}

fn sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture_1: texture_2d<f32>, textureSampler_1: sampler, uv_1: vec2<f32>, uvScale_1: vec2<f32>) -> vec4<f32> {
    let _e4 = sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture_1, textureSampler_1, uv_1, uvScale_1);
    return _e4;
}

fn decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(rg: vec2<f32>) -> vec3<f32> {
    let xy = ((rg * 2f) - vec2(1f));
    let z = sqrt(saturate((1f - dot(xy, xy))));
    return vec3<f32>(xy, z);
}

fn scaleTangentSpaceNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(tn: vec3<f32>, scale: f32) -> vec3<f32> {
    let xy_1 = (tn.xy * scale);
    let z_1 = sqrt(saturate((1f - dot(xy_1, xy_1))));
    return vec3<f32>(xy_1, z_1);
}

fn applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(worldNormal: vec3<f32>, worldTangent: vec4<f32>, tn_1: vec3<f32>) -> vec3<f32> {
    let n0_ = normalize(worldNormal);
    let t0_ = normalize((worldTangent.xyz - (dot(worldTangent.xyz, n0_) * n0_)));
    let b0_ = (cross(n0_, t0_) * worldTangent.w);
    return normalize((((t0_ * tn_1.x) + (b0_ * tn_1.y)) + (n0_ * tn_1.z)));
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
    let irradianceEOverPi = _e10.xyz;
    return (irradianceEOverPi / vec3(3.1415927f));
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

fn view_z_to_z_sliceX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(view_z: f32, grid_z: u32, near: f32, far: f32, log_far_over_near: f32) -> u32 {
    if (view_z >= -(near)) {
        return 0u;
    }
    let slice = floor(((log((-(view_z) / near)) / log_far_over_near) * f32(grid_z)));
    let u_slice = u32(slice);
    if (u_slice >= grid_z) {
        return (grid_z - 1u);
    }
    return u_slice;
}

fn ndc_position_to_clusterX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(ndc: vec3<f32>, view_z_1: f32, grid_x: u32, grid_y: u32, grid_z_1: u32, near_1: f32, far_1: f32, log_far: f32) -> vec3<u32> {
    let cx = clamp(u32(floor((((ndc.x * 0.5f) + 0.5f) * f32(grid_x)))), 0u, (grid_x - 1u));
    let cy = clamp(u32(floor((((ndc.y * 0.5f) + 0.5f) * f32(grid_y)))), 0u, (grid_y - 1u));
    let _e34 = view_z_to_z_sliceX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(view_z_1, grid_z_1, near_1, far_1, log_far);
    return vec3<u32>(cx, cy, _e34);
}

fn evaluate_point_lightX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(light: LightSlotX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX, world_pos: vec3<f32>, N: vec3<f32>, V: vec3<f32>, base_color: vec3<f32>, metallic: f32, roughness_2: f32) -> vec3<f32> {
    let L_vec = (light.position.xyz - world_pos);
    let dist_sq = dot(L_vec, L_vec);
    let L = normalize(L_vec);
    let H = normalize((V + L));
    let factor = max(min((1f - ((dist_sq * light.position.w) * (dist_sq * light.position.w))), 1f), 0f);
    let atten = ((factor * factor) / max(dist_sq, 0.0001f));
    let NdotL = max(dot(N, L), 0f);
    let NdotV_1 = max(dot(N, V), 0f);
    let NdotH = max(dot(N, H), 0f);
    let VdotH = max(dot(V, H), 0f);
    let F0_5 = mix(vec3(0.04f), base_color, metallic);
    let F = (F0_5 + ((vec3(1f) - F0_5) * pow((1f - VdotH), 5f)));
    let alpha_2 = (roughness_2 * roughness_2);
    let alpha2_ = (alpha_2 * alpha_2);
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
    let factor_1 = max(min((1f - ((dist_sq_1 * light_1.position.w) * (dist_sq_1 * light_1.position.w))), 1f), 0f);
    let atten_dist = ((factor_1 * factor_1) / max(dist_sq_1, 0.0001f));
    let spot_dir = light_1.direction.xyz;
    let cos_angle = dot(-(L_1), spot_dir);
    let spot_atten = smoothstep(light_1.direction.w, light_1.color.w, cos_angle);
    let atten_1 = (atten_dist * spot_atten);
    let NdotL_1 = max(dot(N_1, L_1), 0f);
    let NdotV_2 = max(dot(N_1, V_1), 0f);
    let NdotH_1 = max(dot(N_1, H_1), 0f);
    let VdotH_1 = max(dot(V_1, H_1), 0f);
    let F0_6 = mix(vec3(0.04f), base_color_1, metallic_1);
    let F_1 = (F0_6 + ((vec3(1f) - F0_6) * pow((1f - VdotH_1), 5f)));
    let alpha_3 = (roughness_3 * roughness_3);
    let alpha2_1 = (alpha_3 * alpha_3);
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

fn evaluate_cluster_lightsX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(ndc_1: vec3<f32>, view_z_2: f32, world_pos_2: vec3<f32>, N_2: vec3<f32>, V_2: vec3<f32>, base_color_2: vec3<f32>, metallic_2: f32, roughness_4: f32) -> vec3<f32> {
    var total_radiance: vec3<f32> = vec3(0f);
    var i: u32 = 0u;

    let gx = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX.grid.x;
    let gy = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX.grid.y;
    let gz = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX.grid.z;
    let near_2 = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX.near_far_log.x;
    let far_2 = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX.near_far_log.y;
    let log_far_1 = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX.near_far_log.z;
    let _e29 = ndc_position_to_clusterX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(ndc_1, view_z_2, gx, gy, gz, near_2, far_2, log_far_1);
    let cluster_linear = ((((_e29.z * gy) * gx) + (_e29.y * gx)) + _e29.x);
    let grid_offset = (cluster_linear * 2u);
    let list_offset = cluster_gridX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX[grid_offset];
    let list_count = cluster_gridX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX[(grid_offset + 1u)];
    loop {
        let _e49 = i;
        if (_e49 < list_count) {
        } else {
            break;
        }
        {
            let _e52 = i;
            let light_idx = light_index_listX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX[(list_offset + _e52)];
            let light_2 = light_dataX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX[light_idx];
            let kind = light_2.kind_and_pad.x;
            if (kind == KIND_POINTX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX) {
                let _e64 = total_radiance;
                let _e71 = evaluate_point_lightX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(light_2, world_pos_2, N_2, V_2, base_color_2, metallic_2, roughness_4);
                total_radiance = (_e64 + _e71);
            } else {
                let _e73 = total_radiance;
                let _e74 = evaluate_spot_lightX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(light_2, world_pos_2, N_2, V_2, base_color_2, metallic_2, roughness_4);
                total_radiance = (_e73 + _e74);
            }
        }
        continuing {
            let _e76 = i;
            i = (_e76 + 1u);
        }
    }
    let _e79 = total_radiance;
    return _e79;
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

fn _sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(roughness_5: f32, dotNV: f32) -> vec2<f32> {
    let uv_2 = clamp(vec2<f32>(roughness_5, dotNV), vec2(0f), vec2(1f));
    let samplePosition = ((uv_2 * 16f) - vec2(0.5f));
    let base = vec2<i32>(floor(samplePosition));
    let weight = fract(samplePosition);
    let lo = clamp(base, vec2(0i), vec2(15i));
    let hi = clamp((base + vec2(1i)), vec2(0i), vec2(15i));
    let rowLo = mix(THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX[((u32(lo.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) + u32(lo.x))], THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX[((u32(lo.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) + u32(hi.x))], weight.x);
    let rowHi = mix(THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX[((u32(hi.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) + u32(lo.x))], THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX[((u32(hi.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) + u32(hi.x))], weight.x);
    return mix(rowLo, rowHi, weight.y);
}

fn _threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(roughness_6: f32, nDotV_1: f32, nDotL_1: f32, F0_2: vec3<f32>) -> vec3<f32> {
    let _e2 = _sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(roughness_6, nDotV_1);
    let _e4 = _sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(roughness_6, nDotL_1);
    let fssEssV = ((F0_2 * _e2.x) + vec3(_e2.y));
    let fssEssL = ((F0_2 * _e4.x) + vec3(_e4.y));
    let emsV = ((1f - _e2.x) - _e2.y);
    let emsL = ((1f - _e4.x) - _e4.y);
    let favg = (F0_2 + ((vec3(1f) - F0_2) * 0.047619f));
    let energyLoss = (emsV * emsL);
    let fms = (((fssEssV * fssEssL) * favg) / ((vec3(1f) - ((energyLoss * favg) * favg)) + vec3(0.000001f)));
    return (fms * energyLoss);
}

fn evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_2: vec3<f32>, viewDir: vec3<f32>, baseColor: vec3<f32>, metallic_3: f32, alphaSq: f32, F0_3: vec3<f32>) -> vec3<f32> {
    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let l_1 = normalize(-(_e2));
    let h = normalize((viewDir + l_1));
    let nDotL_2 = max(dot(normal_2, l_1), 0f);
    let nDotV_2 = max(dot(normal_2, viewDir), 0.00001f);
    let nDotH_1 = max(dot(normal_2, h), 0f);
    let vDotH_1 = max(dot(viewDir, h), 0f);
    let fresnel = exp2((((-5.55473f * vDotH_1) - 6.98316f) * vDotH_1));
    let f_1 = ((F0_3 * (vec3(1f) - vec3(fresnel))) + vec3(fresnel));
    let roughness_7 = sqrt(max(alphaSq, 0f));
    let _e39 = _threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(roughness_7, nDotV_2, nDotL_2, F0_3);
    let _e40 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_1, alphaSq);
    let _e41 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_2, nDotL_2, alphaSq);
    let specular_2 = (((_e40 * _e41) * f_1) + _e39);
    let diffuse_2 = (((1f - metallic_3) * baseColor) / vec3(3.1415927f));
    let _e56 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightColor;
    return (((diffuse_2 + specular_2) * _e56) * nDotL_2);
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
    let uv_3 = ((tileUv * inv_1) + _e21);
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
                    let offsetUv = clamp((uv_3 + (vec2<f32>(f32(_e131), f32(_e133)) * texel)), tileLo, tileHi);
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

fn evalDirectionalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_4: vec3<f32>, viewDir_1: vec3<f32>, baseColor_1: vec3<f32>, metallic_4: f32, alphaSq_1: f32, F0_4: vec3<f32>, worldPos_1: vec3<f32>, viewZ: f32) -> vec3<f32> {
    var shadow: f32;
    var local_5: bool;

    let _e6 = evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_4, viewDir_1, baseColor_1, metallic_4, alphaSq_1, F0_4);
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

fn transformedMaterialUv(coordinates: MaterialTextureCoordinates, in_3: VsOut) -> vec2<f32> {
    var source: vec2<f32>;

    source = in_3.uv;
    if (coordinates.metadata.x >= 1f) {
        source = in_3.uv1_;
    }
    if (coordinates.metadata.x >= 2f) {
        source = in_3.uv2_;
    }
    if (coordinates.metadata.x >= 3f) {
        source = in_3.uv3_;
    }
    if (coordinates.metadata.x >= 4f) {
        source = in_3.uv4_;
    }
    if (coordinates.metadata.x >= 5f) {
        source = in_3.uv5_;
    }
    if (coordinates.metadata.x >= 6f) {
        source = in_3.uv6_;
    }
    if (coordinates.metadata.x >= 7f) {
        source = in_3.uv7_;
    }
    let _e39 = source;
    let scaled = (_e39 * coordinates.transform.zw);
    let angle = coordinates.metadata.y;
    let c = cos(angle);
    let s = sin(angle);
    return (vec2<f32>(((scaled.x * c) - (scaled.y * s)), ((scaled.x * s) + (scaled.y * c))) + coordinates.transform.xy);
}

fn materialAlpha(baseSample: vec4<f32>) -> f32 {
    let _e4 = material.baseColor.w;
    return (_e4 * baseSample.w);
}

fn blendLinearTransparent(source_1: vec3<f32>, destination: vec3<f32>, alpha: f32) -> vec3<f32> {
    return ((source_1 * alpha) + (destination * (1f - alpha)));
}

fn alphaTest(alpha_1: f32) {
    var local_6: bool;

    let _e2 = material.alphaCutoff;
    if (_e2 > 0f) {
        let _e8 = material.alphaCutoff;
        local_6 = (alpha_1 <= _e8);
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
    let a_4 = entityWorld[0].xyz;
    let b = entityWorld[1].xyz;
    let c_1 = entityWorld[2].xyz;
    let cof0_ = cross(b, c_1);
    let cof1_ = cross(c_1, a_4);
    let cof2_ = cross(a_4, b);
    let det = dot(a_4, cof0_);
    let entityNormal = select(in.normal, ((((cof0_ * in.normal.x) + (cof1_ * in.normal.y)) + (cof2_ * in.normal.z)) / vec3(det)), (abs(det) >= 0.000001f));
    out.worldNormal = normalize(entityNormal);
    let worldTangentXyz = normalize(((entityWorld * instanceLocal) * vec4<f32>(in.tangent.xyz, 0f)).xyz);
    out.worldTangent = vec4<f32>(worldTangentXyz, in.tangent.w);
    out.uv = in.uv;
    out.uv1_ = in.uv1_;
    out.uv2_ = in.uv2_;
    out.uv3_ = in.uv3_;
    out.uv4_ = in.uv4_;
    out.uv5_ = in.uv5_;
    out.uv6_ = in.uv6_;
    out.uv7_ = in.uv7_;
    out.instanceIdx = idx;
    let clipPos = out.clip;
    out.ndc = vec3<f32>((clipPos.xy / vec2(clipPos.w)), (clipPos.z / clipPos.w));
    out.viewZ = -(clipPos.w);
    let _e96 = out;
    return _e96;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    var a: f32;
    var ambient: vec3<f32>;
    var color: vec3<f32>;

    let _e2 = material.baseColorCoordinates;
    let _e4 = transformedMaterialUv(_e2, in_1);
    let _e8 = material.baseColorCoordinates.metadata;
    let _e12 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, _e4, _e8.zw);
    let _e16 = material.baseColor.w;
    alphaTest((_e16 * _e12.w));
    let _e19 = materialAlpha(_e12);
    let _e22 = material.baseColor;
    let albedo = (_e22.xyz * _e12.xyz);
    let _e28 = material.metallicRoughnessCoordinates;
    let _e29 = transformedMaterialUv(_e28, in_1);
    let _e33 = material.metallicRoughnessCoordinates.metadata;
    let _e37 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(metallicRoughnessTexture, metallicRoughnessSampler, _e29, _e33.zw);
    let _e40 = material.metallic;
    let _e43 = material.metallicChannel;
    let _e45 = pick_channel(_e37, u32(_e43));
    let metallic_5 = (_e40 * _e45);
    let _e49 = material.roughnessChannel;
    let _e51 = pick_channel(_e37, u32(_e49));
    let _e54 = material.roughness;
    a = max(_e54, 0.04f);
    let _e58 = a;
    a = (_e58 * _e51);
    let _e60 = a;
    let _e61 = a;
    a = (_e60 * _e61);
    let _e65 = material.normalCoordinates;
    let _e66 = transformedMaterialUv(_e65, in_1);
    let _e70 = material.normalCoordinates.metadata;
    let _e74 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(normalTexture, normalSampler, _e66, _e70.zw);
    let normSampleRg = _e74.xy;
    let _e76 = decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(normSampleRg);
    let _e79 = material.normalScale;
    let _e80 = scaleTangentSpaceNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(_e76, _e79);
    let _e83 = applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(in_1.worldNormal, in_1.worldTangent, _e80);
    let _e86 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let v = normalize((_e86 - in_1.worldPos));
    let _e92 = material.specularTintCoordinates;
    let _e93 = transformedMaterialUv(_e92, in_1);
    let _e96 = material.specularTint;
    let _e100 = material.specularTintCoordinates.metadata;
    let _e104 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(specularTintTexture, specularTintSampler, _e93, _e100.zw);
    let specularTint = (_e96 * _e104.xyz);
    let f0_1 = mix((vec3(0.04f) * specularTint), albedo, metallic_5);
    let _e113 = material.clearcoatRoughness;
    let coatRoughness = max(_e113, 0.04f);
    let coatAlpha = (coatRoughness * coatRoughness);
    let _e122 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(max(dot(_e83, v), 0f), vec3(0.04f));
    let _e125 = material.clearcoat;
    let coatF = (_e122 * _e125);
    let _e132 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(max(dot(_e83, v), 0f), f0_1);
    let kD_2 = ((vec3(1f) - _e132) * (1f - metallic_5));
    let _e139 = material.roughness;
    let iblRoughness = (max(_e139, 0.04f) * _e51);
    let _e145 = skylight.rotation;
    let _e148 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e83, _e145, irradianceMap_1, irradianceSampler_1);
    let _e151 = skylight.rotation;
    let _e156 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e83, v, iblRoughness, f0_1, _e151, prefilterMap_1, prefilterSampler_1, brdfLut_1, brdfLutSampler_1);
    let _e161 = skylight.rotation;
    let _e166 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e83, v, coatRoughness, vec3(0.04f), _e161, prefilterMap_1, prefilterSampler_1, brdfLut_1, brdfLutSampler_1);
    let _e169 = material.occlusionCoordinates;
    let _e170 = transformedMaterialUv(_e169, in_1);
    let _e174 = material.occlusionCoordinates.metadata;
    let _e178 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(occlusionTexture, occlusionSampler, _e170, _e174.zw);
    let _e182 = material.occlusionStrength;
    let ao = mix(1f, _e178.x, _e182);
    let _e187 = skylight.colorR;
    let _e190 = skylight.colorG;
    let _e193 = skylight.colorB;
    let skyColor = vec3<f32>(_e187, _e190, _e193);
    let _e204 = material.clearcoat;
    let _e210 = skylight.intensity;
    ambient = ((((((((kD_2 * _e148) * albedo) + _e156) * (vec3(1f) - coatF)) + (_e166 * _e204)) * skyColor) * _e210) * ao);
    let ssaoUv = ((in_1.ndc.xy * vec2<f32>(0.5f, -0.5f)) + vec2<f32>(0.5f, 0.5f));
    let _e226 = textureSample(ssaoBlurredTexture, ssaoBlurredSampler, ssaoUv);
    let ssaoFactor = _e226.x;
    let _e228 = get_ssao_intensityX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX();
    let _e229 = ambient;
    ambient = (_e229 * mix(1f, (ssaoFactor * ao), _e228));
    let _e234 = ambient;
    color = _e234;
    let _e236 = color;
    let _e237 = a;
    let _e240 = evalDirectionalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e83, v, albedo, metallic_5, _e237, f0_1, in_1.worldPos, in_1.viewZ);
    color = (_e236 + _e240);
    let _e242 = color;
    let _e245 = material.clearcoat;
    let _e253 = evalDirectionalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e83, v, vec3(0f), 1f, coatAlpha, vec3(0.04f), in_1.worldPos, in_1.viewZ);
    color = (_e242 + (_e245 * _e253));
    let _e256 = color;
    let _e260 = a;
    let _e261 = evaluate_cluster_lightsX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(in_1.ndc, in_1.viewZ, in_1.worldPos, _e83, v, albedo, metallic_5, _e260);
    color = (_e256 + _e261);
    let _e263 = color;
    let _e266 = material.clearcoat;
    let _e273 = evaluate_cluster_lightsX_naga_oil_mod_XMZXXEZ3FMF4F62DEOJYDUOTDNR2XG5DFOJPWM33SO5QXEZAX(in_1.ndc, in_1.viewZ, in_1.worldPos, _e83, v, vec3(0f), 1f, coatRoughness);
    color = (_e263 + (_e266 * _e273));
    let _e278 = material.emissiveCoordinates;
    let _e279 = transformedMaterialUv(_e278, in_1);
    let _e283 = material.emissiveCoordinates.metadata;
    let _e287 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(emissiveTexture, emissiveSampler, _e279, _e283.zw);
    let emissiveSample = _e287.xyz;
    let _e289 = color;
    let _e292 = material.emissive;
    let _e295 = material.emissiveIntensity;
    color = (_e289 + ((_e292 * _e295) * emissiveSample));
    let _e299 = color;
    return vec4<f32>(_e299, _e19);
}

@fragment 
fn fs_gbuffer(in_2: VsOut) -> GBufferOutput {
    var a_1: f32;
    var out_1: GBufferOutput;

    let _e2 = material.baseColorCoordinates;
    let _e4 = transformedMaterialUv(_e2, in_2);
    let _e8 = material.baseColorCoordinates.metadata;
    let _e12 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, _e4, _e8.zw);
    let _e16 = material.baseColor.w;
    alphaTest((_e16 * _e12.w));
    let _e19 = materialAlpha(_e12);
    let _e22 = material.baseColor;
    let albedo_1 = (_e22.xyz * _e12.xyz);
    let _e28 = material.metallicRoughnessCoordinates;
    let _e29 = transformedMaterialUv(_e28, in_2);
    let _e33 = material.metallicRoughnessCoordinates.metadata;
    let _e37 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(metallicRoughnessTexture, metallicRoughnessSampler, _e29, _e33.zw);
    let _e40 = material.metallic;
    let _e43 = material.metallicChannel;
    let _e45 = pick_channel(_e37, u32(_e43));
    let metallic_6 = (_e40 * _e45);
    let _e49 = material.roughnessChannel;
    let _e51 = pick_channel(_e37, u32(_e49));
    let _e54 = material.roughness;
    a_1 = max(_e54, 0.04f);
    let _e58 = a_1;
    a_1 = (_e58 * _e51);
    let _e62 = material.normalCoordinates;
    let _e63 = transformedMaterialUv(_e62, in_2);
    let _e67 = material.normalCoordinates.metadata;
    let _e71 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(normalTexture, normalSampler, _e63, _e67.zw);
    let normSampleRg_1 = _e71.xy;
    let _e73 = decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(normSampleRg_1);
    let _e76 = material.normalScale;
    let _e77 = scaleTangentSpaceNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(_e73, _e76);
    let _e80 = applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(in_2.worldNormal, in_2.worldTangent, _e77);
    let _e83 = material.emissiveCoordinates;
    let _e84 = transformedMaterialUv(_e83, in_2);
    let _e88 = material.emissiveCoordinates.metadata;
    let _e92 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(emissiveTexture, emissiveSampler, _e84, _e88.zw);
    let emissiveSample_1 = _e92.xyz;
    let _e96 = material.emissive;
    let _e99 = material.emissiveIntensity;
    let emissive = ((_e96 * _e99) * emissiveSample_1);
    let _e104 = material.occlusionCoordinates;
    let _e105 = transformedMaterialUv(_e104, in_2);
    let _e109 = material.occlusionCoordinates.metadata;
    let _e113 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(occlusionTexture, occlusionSampler, _e105, _e109.zw);
    let _e117 = material.occlusionStrength;
    let ao_1 = mix(1f, _e113.x, _e117);
    let _e127 = a_1;
    out_1.normal_roughness = vec4<f32>(((_e80 * 0.5f) + vec3(0.5f)), _e127);
    out_1.albedo_metallic = vec4<f32>(albedo_1, metallic_6);
    out_1.emissive_ao = vec4<f32>(emissive, ao_1);
    let _e133 = out_1;
    return _e133;
}
