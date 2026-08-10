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
const THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX: u32 = 16u;
const THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX: array<vec2<f32>, 256> = array<vec2<f32>, 256>(vec2<f32>(0.14709473f, 0.8520508f), vec2<f32>(0.16552734f, 0.78759766f), vec2<f32>(0.24438477f, 0.6386719f), vec2<f32>(0.3708496f, 0.51953125f), vec2<f32>(0.49682617f, 0.41552734f), vec2<f32>(0.6020508f, 0.32641602f), vec2<f32>(0.68408203f, 0.25390625f), vec2<f32>(0.74609375f, 0.19750977f), vec2<f32>(0.79052734f, 0.15429688f), vec2<f32>(0.8222656f, 0.12164307f), vec2<f32>(0.8432617f, 0.09698486f), vec2<f32>(0.8564453f, 0.078430176f), vec2<f32>(0.86328125f, 0.06439209f), vec2<f32>(0.86572266f, 0.053710938f), vec2<f32>(0.8642578f, 0.045440674f), vec2<f32>(0.8598633f, 0.039031982f), vec2<f32>(0.38867188f, 0.6113281f), vec2<f32>(0.3930664f, 0.60058594f), vec2<f32>(0.41235352f, 0.54589844f), vec2<f32>(0.45654297f, 0.4482422f), vec2<f32>(0.52783203f, 0.35253906f), vec2<f32>(0.6074219f, 0.27392578f), vec2<f32>(0.67871094f, 0.21142578f), vec2<f32>(0.73339844f, 0.16259766f), vec2<f32>(0.7709961f, 0.12536621f), vec2<f32>(0.79345703f, 0.09729004f), vec2<f32>(0.80322266f, 0.07623291f), vec2<f32>(0.80371094f, 0.06036377f), vec2<f32>(0.7963867f, 0.048431396f), vec2<f32>(0.78564453f, 0.039367676f), vec2<f32>(0.77197266f, 0.032409668f), vec2<f32>(0.7548828f, 0.026977539f), vec2<f32>(0.5722656f, 0.42749023f), vec2<f32>(0.57373047f, 0.42407227f), vec2<f32>(0.57958984f, 0.40356445f), vec2<f32>(0.5917969f, 0.3544922f), vec2<f32>(0.61621094f, 0.28808594f), vec2<f32>(0.65527344f, 0.22485352f), vec2<f32>(0.69873047f, 0.17260742f), vec2<f32>(0.73535156f, 0.13183594f), vec2<f32>(0.75927734f, 0.10089111f), vec2<f32>(0.77001953f, 0.07745361f), vec2<f32>(0.77197266f, 0.059936523f), vec2<f32>(0.7661133f, 0.046844482f), vec2<f32>(0.7519531f, 0.036987305f), vec2<f32>(0.7324219f, 0.029541016f), vec2<f32>(0.70947266f, 0.023834229f), vec2<f32>(0.68359375f, 0.019439697f), vec2<f32>(0.7089844f, 0.29101563f), vec2<f32>(0.7089844f, 0.28979492f), vec2<f32>(0.70996094f, 0.28125f), vec2<f32>(0.70996094f, 0.25854492f), vec2<f32>(0.7114258f, 0.22045898f), vec2<f32>(0.71972656f, 0.17687988f), vec2<f32>(0.734375f, 0.13708496f), vec2<f32>(0.7480469f, 0.10479736f), vec2<f32>(0.7558594f, 0.07989502f), vec2<f32>(0.7597656f, 0.06100464f), vec2<f32>(0.75341797f, 0.046844482f), vec2<f32>(0.73876953f, 0.036224365f), vec2<f32>(0.71777344f, 0.028259277f), vec2<f32>(0.69189453f, 0.022262573f), vec2<f32>(0.6611328f, 0.017700195f), vec2<f32>(0.62841797f, 0.014198303f), vec2<f32>(0.80810547f, 0.19177246f), vec2<f32>(0.8076172f, 0.19128418f), vec2<f32>(0.80615234f, 0.18798828f), vec2<f32>(0.8017578f, 0.17810059f), vec2<f32>(0.79296875f, 0.1586914f), vec2<f32>(0.7836914f, 0.13220215f), vec2<f32>(0.7753906f, 0.1048584f), vec2<f32>(0.7685547f, 0.08111572f), vec2<f32>(0.76464844f, 0.0619812f), vec2<f32>(0.7553711f, 0.04727173f), vec2<f32>(0.7402344f, 0.03616333f), vec2<f32>(0.71875f, 0.027755737f), vec2<f32>(0.69091797f, 0.021484375f), vec2<f32>(0.6582031f, 0.016738892f), vec2<f32>(0.6220703f, 0.013160706f), vec2<f32>(0.5839844f, 0.010414124f), vec2<f32>(0.87841797f, 0.1217041f), vec2<f32>(0.8779297f, 0.1217041f), vec2<f32>(0.875f, 0.12060547f), vec2<f32>(0.8691406f, 0.11694336f), vec2<f32>(0.8569336f, 0.10803223f), vec2<f32>(0.8378906f, 0.09375f), vec2<f32>(0.8149414f, 0.0769043f), vec2<f32>(0.79589844f, 0.060699463f), vec2<f32>(0.7763672f, 0.046875f), vec2<f32>(0.75634766f, 0.03591919f), vec2<f32>(0.7324219f, 0.027450562f), vec2<f32>(0.703125f, 0.021026611f), vec2<f32>(0.6689453f, 0.016174316f), vec2<f32>(0.6303711f, 0.012512207f), vec2<f32>(0.58935547f, 0.009742737f), vec2<f32>(0.5463867f, 0.007633209f), vec2<f32>(0.92626953f, 0.073791504f), vec2<f32>(0.92578125f, 0.073913574f), vec2<f32>(0.92285156f, 0.073913574f), vec2<f32>(0.9169922f, 0.07312012f), vec2<f32>(0.9038086f, 0.06982422f), vec2<f32>(0.88134766f, 0.06311035f), vec2<f32>(0.8510742f, 0.05380249f), vec2<f32>(0.82128906f, 0.043701172f), vec2<f32>(0.7910156f, 0.03439331f), vec2<f32>(0.76123047f, 0.026611328f), vec2<f32>(0.72802734f, 0.020446777f), vec2<f32>(0.69189453f, 0.015655518f), vec2<f32>(0.6508789f, 0.012008667f), vec2<f32>(0.6074219f, 0.009254456f), vec2<f32>(0.56103516f, 0.007156372f), vec2<f32>(0.51416016f, 0.0055656433f), vec2<f32>(0.95751953f, 0.04232788f), vec2<f32>(0.95703125f, 0.04244995f), vec2<f32>(0.95458984f, 0.042816162f), vec2<f32>(0.94921875f, 0.043182373f), vec2<f32>(0.9370117f, 0.042663574f), vec2<f32>(0.91308594f, 0.040252686f), vec2<f32>(0.88183594f, 0.03579712f), vec2<f32>(0.84472656f, 0.030136108f), vec2<f32>(0.80615234f, 0.024337769f), vec2<f32>(0.76708984f, 0.01914978f), vec2<f32>(0.7265625f, 0.014854431f), vec2<f32>(0.6826172f, 0.011421204f), vec2<f32>(0.63623047f, 0.008773804f), vec2<f32>(0.58691406f, 0.00674057f), vec2<f32>(0.5366211f, 0.0051994324f), vec2<f32>(0.48608398f, 0.004020691f), vec2<f32>(0.97753906f, 0.022628784f), vec2<f32>(0.9770508f, 0.022750854f), vec2<f32>(0.97509766f, 0.02319336f), vec2<f32>(0.96972656f, 0.023910522f), vec2<f32>(0.95947266f, 0.024490356f), vec2<f32>(0.93603516f, 0.024124146f), vec2<f32>(0.90527344f, 0.022521973f), vec2<f32>(0.8652344f, 0.019760132f), vec2<f32>(0.82177734f, 0.01651001f), vec2<f32>(0.77441406f, 0.013290405f), vec2<f32>(0.7265625f, 0.0104599f), vec2<f32>(0.67626953f, 0.008132935f), vec2<f32>(0.62402344f, 0.0062789917f), vec2<f32>(0.5698242f, 0.004825592f), vec2<f32>(0.5151367f, 0.0037136078f), vec2<f32>(0.46142578f, 0.0028629303f), vec2<f32>(0.98876953f, 0.011070251f), vec2<f32>(0.98876953f, 0.011161804f), vec2<f32>(0.9868164f, 0.011512756f), vec2<f32>(0.98291016f, 0.012214661f), vec2<f32>(0.97314453f, 0.012992859f), vec2<f32>(0.953125f, 0.013519287f), vec2<f32>(0.92285156f, 0.013282776f), vec2<f32>(0.8823242f, 0.012260437f), vec2<f32>(0.83496094f, 0.010658264f), vec2<f32>(0.7832031f, 0.008850098f), vec2<f32>(0.7285156f, 0.0071144104f), vec2<f32>(0.671875f, 0.005607605f), vec2<f32>(0.61376953f, 0.004360199f), vec2<f32>(0.5546875f, 0.0033721924f), vec2<f32>(0.4963379f, 0.0025997162f), vec2<f32>(0.43945313f, 0.0020046234f), vec2<f32>(0.9951172f, 0.004798889f), vec2<f32>(0.9951172f, 0.004863739f), vec2<f32>(0.99365234f, 0.0050964355f), vec2<f32>(0.9902344f, 0.0056037903f), vec2<f32>(0.9814453f, 0.0063323975f), vec2<f32>(0.96435547f, 0.0069770813f), vec2<f32>(0.93603516f, 0.007297516f), vec2<f32>(0.8964844f, 0.0071258545f), vec2<f32>(0.8466797f, 0.0064926147f), vec2<f32>(0.7915039f, 0.005596161f), vec2<f32>(0.7314453f, 0.004627228f), vec2<f32>(0.6689453f, 0.0037174225f), vec2<f32>(0.60546875f, 0.0029296875f), vec2<f32>(0.5415039f, 0.002281189f), vec2<f32>(0.47924805f, 0.0017662048f), vec2<f32>(0.41967773f, 0.0013656616f), vec2<f32>(0.9980469f, 0.0017604828f), vec2<f32>(0.9980469f, 0.0017938614f), vec2<f32>(0.99658203f, 0.0019292831f), vec2<f32>(0.9941406f, 0.0022392273f), vec2<f32>(0.9863281f, 0.002729416f), vec2<f32>(0.9716797f, 0.003250122f), vec2<f32>(0.9458008f, 0.0036697388f), vec2<f32>(0.90771484f, 0.003818512f), vec2<f32>(0.85839844f, 0.0036811829f), vec2<f32>(0.7993164f, 0.003320694f), vec2<f32>(0.73535156f, 0.0028438568f), vec2<f32>(0.66748047f, 0.0023441315f), vec2<f32>(0.5986328f, 0.0018796921f), vec2<f32>(0.53027344f, 0.0014829636f), vec2<f32>(0.46411133f, 0.0011587143f), vec2<f32>(0.4020996f, 0.0008993149f), vec2<f32>(0.9995117f, 0.00050115585f), vec2<f32>(0.9995117f, 0.00051546097f), vec2<f32>(0.9980469f, 0.0005836487f), vec2<f32>(0.99658203f, 0.0007505417f), vec2<f32>(0.9892578f, 0.0010147095f), vec2<f32>(0.9760742f, 0.0013465881f), vec2<f32>(0.9526367f, 0.0016527176f), vec2<f32>(0.9160156f, 0.0018558502f), vec2<f32>(0.8671875f, 0.0019054413f), vec2<f32>(0.8076172f, 0.0018167496f), vec2<f32>(0.7392578f, 0.0016212463f), vec2<f32>(0.6669922f, 0.0013799667f), vec2<f32>(0.5932617f, 0.0011358261f), vec2<f32>(0.52001953f, 0.0009121895f), vec2<f32>(0.45043945f, 0.00072193146f), vec2<f32>(0.38598633f, 0.00056505203f), vec2<f32>(1f, 0.00009316206f), vec2<f32>(1f, 0.00009787083f), vec2<f32>(0.99902344f, 0.00012540817f), vec2<f32>(0.9970703f, 0.00019216537f), vec2<f32>(0.99072266f, 0.000310421f), vec2<f32>(0.9790039f, 0.00046992302f), vec2<f32>(0.95751953f, 0.000647068f), vec2<f32>(0.92333984f, 0.0007915497f), vec2<f32>(0.8754883f, 0.00087690353f), vec2<f32>(0.8149414f, 0.0008869171f), vec2<f32>(0.7441406f, 0.0008325577f), vec2<f32>(0.66748047f, 0.00073862076f), vec2<f32>(0.5883789f, 0.000626564f), vec2<f32>(0.51123047f, 0.0005168915f), vec2<f32>(0.43823242f, 0.00041651726f), vec2<f32>(0.37109375f, 0.0003311634f), vec2<f32>(1f, 0.0000072717667f), vec2<f32>(1f, 0.000008165836f), vec2<f32>(0.99902344f, 0.000016987324f), vec2<f32>(0.9975586f, 0.000037908554f), vec2<f32>(0.9921875f, 0.00007593632f), vec2<f32>(0.9814453f, 0.00013744831f), vec2<f32>(0.9614258f, 0.00020754337f), vec2<f32>(0.9291992f, 0.00028014183f), vec2<f32>(0.8828125f, 0.00033450127f), vec2<f32>(0.82177734f, 0.00036263466f), vec2<f32>(0.74902344f, 0.00036215782f), vec2<f32>(0.66845703f, 0.00033807755f), vec2<f32>(0.5854492f, 0.00029969215f), vec2<f32>(0.50390625f, 0.00025582314f), vec2<f32>(0.42700195f, 0.0002117157f), vec2<f32>(0.35766602f, 0.000172019f), vec2<f32>(1f, 0f), vec2<f32>(1f, 0.000000059604645f), vec2<f32>(0.9995117f, 0.0000012516975f), vec2<f32>(0.9975586f, 0.0000053048134f), vec2<f32>(0.99316406f, 0.000015079975f), vec2<f32>(0.98291016f, 0.000028550625f), vec2<f32>(0.96435547f, 0.000047445297f), vec2<f32>(0.93408203f, 0.00006842613f), vec2<f32>(0.88916016f, 0.00008893013f), vec2<f32>(0.828125f, 0.000104248524f), vec2<f32>(0.75390625f, 0.00011217594f), vec2<f32>(0.67041016f, 0.00011241436f), vec2<f32>(0.5830078f, 0.00010627508f), vec2<f32>(0.4970703f, 0.00009584427f), vec2<f32>(0.4169922f, 0.00008332729f), vec2<f32>(0.34521484f, 0.000070512295f));
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

fn _sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(roughness_2: f32, dotNV: f32) -> vec2<f32> {
    let uv_3 = clamp(vec2<f32>(roughness_2, dotNV), vec2(0f), vec2(1f));
    let samplePosition = ((uv_3 * 16f) - vec2(0.5f));
    let base = vec2<i32>(floor(samplePosition));
    let weight = fract(samplePosition);
    let lo = clamp(base, vec2(0i), vec2(15i));
    let hi = clamp((base + vec2(1i)), vec2(0i), vec2(15i));
    let rowLo = mix(THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX[((u32(lo.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) + u32(lo.x))], THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX[((u32(lo.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) + u32(hi.x))], weight.x);
    let rowHi = mix(THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX[((u32(hi.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) + u32(lo.x))], THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX[((u32(hi.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) + u32(hi.x))], weight.x);
    return mix(rowLo, rowHi, weight.y);
}

fn _threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(roughness_3: f32, nDotV_1: f32, nDotL_1: f32, F0_2: vec3<f32>) -> vec3<f32> {
    let _e2 = _sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(roughness_3, nDotV_1);
    let _e4 = _sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(roughness_3, nDotL_1);
    let fssEssV = ((F0_2 * _e2.x) + vec3(_e2.y));
    let fssEssL = ((F0_2 * _e4.x) + vec3(_e4.y));
    let emsV = ((1f - _e2.x) - _e2.y);
    let emsL = ((1f - _e4.x) - _e4.y);
    let favg = (F0_2 + ((vec3(1f) - F0_2) * 0.047619f));
    let energyLoss = (emsV * emsL);
    let fms = (((fssEssV * fssEssL) * favg) / ((vec3(1f) - ((energyLoss * favg) * favg)) + vec3(0.000001f)));
    return (fms * energyLoss);
}

fn evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_2: vec3<f32>, viewDir: vec3<f32>, baseColor: vec3<f32>, metallic: f32, alphaSq: f32, F0_3: vec3<f32>) -> vec3<f32> {
    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let l_1 = normalize(-(_e2));
    let h = normalize((viewDir + l_1));
    let nDotL_3 = max(dot(normal_2, l_1), 0f);
    let nDotV_2 = max(dot(normal_2, viewDir), 0.00001f);
    let nDotH_1 = max(dot(normal_2, h), 0f);
    let vDotH_1 = max(dot(viewDir, h), 0f);
    let fresnel = exp2((((-5.55473f * vDotH_1) - 6.98316f) * vDotH_1));
    let f_1 = ((F0_3 * (vec3(1f) - vec3(fresnel))) + vec3(fresnel));
    let roughness_4 = sqrt(max(alphaSq, 0f));
    let _e39 = _threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(roughness_4, nDotV_2, nDotL_3, F0_3);
    let _e40 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_1, alphaSq);
    let _e41 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_2, nDotL_3, alphaSq);
    let specular = (((_e40 * _e41) * f_1) + _e39);
    let diffuse = (((1f - metallic) * baseColor) / vec3(3.1415927f));
    let _e56 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightColor;
    return (((diffuse + specular) * _e56) * nDotL_3);
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
    let uv_4 = ((tileUv * inv_1) + _e21);
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
                    let offsetUv = clamp((uv_4 + (vec2<f32>(f32(_e131), f32(_e133)) * texel_1)), tileLo, tileHi);
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

fn evalDirectionalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_4: vec3<f32>, viewDir_1: vec3<f32>, baseColor_1: vec3<f32>, metallic_1: f32, alphaSq_1: f32, F0_4: vec3<f32>, worldPos_1: vec3<f32>, viewZ: f32) -> vec3<f32> {
    var shadow: f32;
    var local_5: bool;

    let _e6 = evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_4, viewDir_1, baseColor_1, metallic_1, alphaSq_1, F0_4);
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

fn sample_shadow_2dX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMap: texture_depth_2d, shadowSampler: sampler_comparison, uv_2: vec2<f32>, texel: vec2<f32>, depthRef: f32, normalBias: f32, depthBias: f32, nDotL_2: f32) -> f32 {
    var blocked_1: f32 = 0f;
    var i_3: u32 = 0u;

    let bias_1 = max((normalBias * (1f - nDotL_2)), (depthBias / 1000f));
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
            let offsetUv_1 = (uv_2 + (vec2<f32>(f32(off.x), f32(off.y)) * texel));
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

fn evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos: vec3<f32>, colorTimesIntensity: vec3<f32>, invRangeSquared: f32, worldPos_2: vec3<f32>, normal_5: vec3<f32>, viewDir_2: vec3<f32>, baseColor_2: vec3<f32>, metallic_2: f32, alphaSq_2: f32, F0_5: vec3<f32>) -> vec3<f32> {
    let toLight = (lightPos - worldPos_2);
    let dSquared = max(dot(toLight, toLight), 0.0001f);
    let l_3 = (toLight / vec3(sqrt(dSquared)));
    let h_1 = normalize((viewDir_2 + l_3));
    let nDotL_4 = max(dot(normal_5, l_3), 0f);
    let nDotV_3 = max(dot(normal_5, viewDir_2), 0.00001f);
    let nDotH_2 = max(dot(normal_5, h_1), 0f);
    let vDotH_2 = max(dot(viewDir_2, h_1), 0f);
    let _e26 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH_2, F0_5);
    let _e28 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_2, alphaSq_2);
    let _e29 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_3, nDotL_4, alphaSq_2);
    let specular_1 = ((_e28 * _e29) * _e26);
    let kd = ((vec3(1f) - _e26) * (1f - metallic_2));
    let diffuse_1 = ((kd * baseColor_2) / vec3(3.1415927f));
    let factor = max(min((1f - ((dSquared * invRangeSquared) * (dSquared * invRangeSquared))), 1f), 0f);
    let attenuation = ((factor * factor) / dSquared);
    return ((((diffuse_1 + specular_1) * colorTimesIntensity) * nDotL_4) * attenuation);
}

fn evalPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_1: vec3<f32>, colorTimesIntensity_1: vec3<f32>, invRangeSquared_1: f32, worldPos_3: vec3<f32>, normal_6: vec3<f32>, viewDir_3: vec3<f32>, baseColor_3: vec3<f32>, metallic_3: f32, alphaSq_3: f32, F0_6: vec3<f32>) -> vec3<f32> {
    let _e10 = evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_1, colorTimesIntensity_1, invRangeSquared_1, worldPos_3, normal_6, viewDir_3, baseColor_3, metallic_3, alphaSq_3, F0_6);
    return _e10;
}

fn evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_2: vec3<f32>, lightDir: vec3<f32>, colorTimesIntensity_2: vec3<f32>, cosInner: f32, cosOuter: f32, invRangeSquared_2: f32, worldPos_4: vec3<f32>, normal_7: vec3<f32>, viewDir_4: vec3<f32>, baseColor_4: vec3<f32>, metallic_4: f32, alphaSq_4: f32, F0_7: vec3<f32>) -> vec3<f32> {
    let _e10 = evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_2, colorTimesIntensity_2, invRangeSquared_2, worldPos_4, normal_7, viewDir_4, baseColor_4, metallic_4, alphaSq_4, F0_7);
    let toLight_1 = (lightPos_2 - worldPos_4);
    let l_4 = normalize(toLight_1);
    let cone = smoothstep(cosOuter, cosInner, dot(l_4, -(lightDir)));
    return (_e10 * cone);
}

fn evalSpotShadowedX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_3: vec3<f32>, lightDir_1: vec3<f32>, colorTimesIntensity_3: vec3<f32>, cosInner_1: f32, cosOuter_1: f32, invRangeSquared_3: f32, worldPos_5: vec3<f32>, normal_8: vec3<f32>, viewDir_5: vec3<f32>, baseColor_5: vec3<f32>, metallic_5: f32, alphaSq_5: f32, F0_8: vec3<f32>, lightViewProj: mat4x4<f32>, shadowAtlasTile: i32, depthBias_1: f32, normalBias_1: f32) -> vec3<f32> {
    var local_6: bool;
    var local_7: bool;
    var local_8: bool;
    var local_9: bool;

    let _e13 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_3, lightDir_1, colorTimesIntensity_3, cosInner_1, cosOuter_1, invRangeSquared_3, worldPos_5, normal_8, viewDir_5, baseColor_5, metallic_5, alphaSq_5, F0_8);
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
    let nDotL_5 = max(dot(normal_8, normalize((lightPos_3 - worldPos_5))), 0f);
    let _e103 = sample_shadow_2dX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(spotShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, atlasUv, texel_2, depthRef_1, normalBias_1, depthBias_1, nDotL_5);
    return (_e13 * _e103);
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
    var local_10: bool;

    let _e2 = material.alphaCutoff;
    if (_e2 > 0f) {
        let _e8 = material.alphaCutoff;
        local_10 = (alpha_1 <= _e8);
    } else {
        local_10 = false;
    }
    let _e13 = local_10;
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
    var i: u32 = 0u;
    var i_1: u32 = 0u;

    let _e3 = material.baseColorCoordinates;
    let _e5 = transformedMaterialUv(_e3, in_1);
    let _e9 = material.baseColorCoordinates.metadata;
    let _e13 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, _e5, _e9.zw);
    let _e17 = material.baseColor.w;
    alphaTest((_e17 * _e13.w));
    let _e20 = materialAlpha(_e13);
    let _e23 = material.baseColor;
    let albedo = (_e23.xyz * _e13.xyz);
    let _e29 = material.metallicRoughnessCoordinates;
    let _e30 = transformedMaterialUv(_e29, in_1);
    let _e34 = material.metallicRoughnessCoordinates.metadata;
    let _e38 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(metallicRoughnessTexture, metallicRoughnessSampler, _e30, _e34.zw);
    let _e41 = material.metallic;
    let _e44 = material.metallicChannel;
    let _e46 = pick_channel(_e38, u32(_e44));
    let metallic_6 = (_e41 * _e46);
    let _e50 = material.roughnessChannel;
    let _e52 = pick_channel(_e38, u32(_e50));
    let _e55 = material.roughness;
    a = max(_e55, 0.04f);
    let _e59 = a;
    a = (_e59 * _e52);
    let _e61 = a;
    let _e62 = a;
    a = (_e61 * _e62);
    let _e66 = material.normalCoordinates;
    let _e67 = transformedMaterialUv(_e66, in_1);
    let _e71 = material.normalCoordinates.metadata;
    let _e75 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(normalTexture, normalSampler, _e67, _e71.zw);
    let normSampleRg = _e75.xy;
    let _e77 = decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(normSampleRg);
    let _e80 = material.normalScale;
    let _e81 = scaleTangentSpaceNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(_e77, _e80);
    let _e84 = applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(in_1.worldNormal, in_1.worldTangent, _e81);
    let _e87 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let v = normalize((_e87 - in_1.worldPos));
    let _e93 = material.specularTintCoordinates;
    let _e94 = transformedMaterialUv(_e93, in_1);
    let _e97 = material.specularTint;
    let _e101 = material.specularTintCoordinates.metadata;
    let _e105 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(specularTintTexture, specularTintSampler, _e94, _e101.zw);
    let specularTint = (_e97 * _e105.xyz);
    let f0_1 = mix((vec3(0.04f) * specularTint), albedo, metallic_6);
    let _e114 = material.clearcoatRoughness;
    let coatRoughness = max(_e114, 0.04f);
    let coatAlpha = (coatRoughness * coatRoughness);
    let _e123 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(max(dot(_e84, v), 0f), vec3(0.04f));
    let _e126 = material.clearcoat;
    let coatF = (_e123 * _e126);
    let _e133 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(max(dot(_e84, v), 0f), f0_1);
    let kD = ((vec3(1f) - _e133) * (1f - metallic_6));
    let _e140 = material.roughness;
    let iblRoughness = (max(_e140, 0.04f) * _e52);
    let _e146 = skylight.rotation;
    let _e149 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e84, _e146, irradianceMap_1, irradianceSampler_1);
    let _e152 = skylight.rotation;
    let _e157 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e84, v, iblRoughness, f0_1, _e152, prefilterMap_1, prefilterSampler_1, brdfLut_1, brdfLutSampler_1);
    let _e162 = skylight.rotation;
    let _e167 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e84, v, coatRoughness, vec3(0.04f), _e162, prefilterMap_1, prefilterSampler_1, brdfLut_1, brdfLutSampler_1);
    let _e170 = material.occlusionCoordinates;
    let _e171 = transformedMaterialUv(_e170, in_1);
    let _e175 = material.occlusionCoordinates.metadata;
    let _e179 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(occlusionTexture, occlusionSampler, _e171, _e175.zw);
    let _e183 = material.occlusionStrength;
    let ao = mix(1f, _e179.x, _e183);
    let _e188 = skylight.colorR;
    let _e191 = skylight.colorG;
    let _e194 = skylight.colorB;
    let skyColor = vec3<f32>(_e188, _e191, _e194);
    let _e205 = material.clearcoat;
    let _e211 = skylight.intensity;
    ambient = ((((((((kD * _e149) * albedo) + _e157) * (vec3(1f) - coatF)) + (_e167 * _e205)) * skyColor) * _e211) * ao);
    let _e215 = ambient;
    color = _e215;
    let _e217 = color;
    let _e218 = a;
    let _e221 = evalDirectionalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e84, v, albedo, metallic_6, _e218, f0_1, in_1.worldPos, in_1.viewZ);
    color = (_e217 + _e221);
    let _e223 = color;
    let _e226 = material.clearcoat;
    let _e234 = evalDirectionalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e84, v, vec3(0f), 1f, coatAlpha, vec3(0.04f), in_1.worldPos, in_1.viewZ);
    color = (_e223 + (_e226 * _e234));
    let pointCount = pointLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.count;
    loop {
        let _e241 = i;
        if (_e241 < pointCount) {
        } else {
            break;
        }
        {
            let _e245 = i;
            let p = pointLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.slots[_e245];
            let _e248 = color;
            let _e253 = a;
            let _e254 = evalPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(p.position, p.colorTimesIntensity, p.invRangeSquared, in_1.worldPos, _e84, v, albedo, metallic_6, _e253, f0_1);
            color = (_e248 + _e254);
            let _e256 = color;
            let _e259 = material.clearcoat;
            let _e269 = evalPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(p.position, p.colorTimesIntensity, p.invRangeSquared, in_1.worldPos, _e84, v, vec3(0f), 1f, coatAlpha, vec3(0.04f));
            color = (_e256 + (_e259 * _e269));
        }
        continuing {
            let _e272 = i;
            i = (_e272 + 1u);
        }
    }
    let spotCount = spotLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.count;
    loop {
        let _e279 = i_1;
        if (_e279 < spotCount) {
        } else {
            break;
        }
        {
            let _e283 = i_1;
            let s_1 = spotLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.slots[_e283];
            if (s_1.shadowAtlasTile >= 0i) {
                let _e289 = color;
                let _e297 = a;
                let _e302 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj[s_1.shadowAtlasTile];
                let _e306 = evalSpotShadowedX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(s_1.position, s_1.direction, s_1.colorTimesIntensity, s_1.cosInner, s_1.cosOuter, s_1.invRangeSquared, in_1.worldPos, _e84, v, albedo, metallic_6, _e297, f0_1, _e302, s_1.shadowAtlasTile, 0.005f, 0.05f);
                color = (_e289 + _e306);
                let _e308 = color;
                let _e311 = material.clearcoat;
                let _e327 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj[s_1.shadowAtlasTile];
                let _e332 = evalSpotShadowedX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(s_1.position, s_1.direction, s_1.colorTimesIntensity, s_1.cosInner, s_1.cosOuter, s_1.invRangeSquared, in_1.worldPos, _e84, v, vec3(0f), 1f, coatAlpha, vec3(0.04f), _e327, s_1.shadowAtlasTile, 0.005f, 0.05f);
                color = (_e308 + (_e311 * _e332));
            } else {
                let _e335 = color;
                let _e343 = a;
                let _e344 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(s_1.position, s_1.direction, s_1.colorTimesIntensity, s_1.cosInner, s_1.cosOuter, s_1.invRangeSquared, in_1.worldPos, _e84, v, albedo, metallic_6, _e343, f0_1);
                color = (_e335 + _e344);
                let _e346 = color;
                let _e349 = material.clearcoat;
                let _e362 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(s_1.position, s_1.direction, s_1.colorTimesIntensity, s_1.cosInner, s_1.cosOuter, s_1.invRangeSquared, in_1.worldPos, _e84, v, vec3(0f), 1f, coatAlpha, vec3(0.04f));
                color = (_e346 + (_e349 * _e362));
            }
        }
        continuing {
            let _e365 = i_1;
            i_1 = (_e365 + 1u);
        }
    }
    let _e370 = material.emissiveCoordinates;
    let _e371 = transformedMaterialUv(_e370, in_1);
    let _e375 = material.emissiveCoordinates.metadata;
    let _e379 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(emissiveTexture, emissiveSampler, _e371, _e375.zw);
    let emissiveSample = _e379.xyz;
    let _e381 = color;
    let _e384 = material.emissive;
    let _e387 = material.emissiveIntensity;
    color = (_e381 + ((_e384 * _e387) * emissiveSample));
    let _e391 = color;
    return vec4<f32>(_e391, _e20);
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
    let metallic_7 = (_e40 * _e45);
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
    out_1.albedo_metallic = vec4<f32>(albedo_1, metallic_7);
    out_1.emissive_ao = vec4<f32>(emissive, ao_1);
    let _e133 = out_1;
    return _e133;
}
