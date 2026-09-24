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
    directionalShadowFilter: vec4<f32>,
    spotLightViewProj: array<mat4x4<f32>, 4>,
    temporalCurrentViewProj: mat4x4<f32>,
    temporalPreviousViewProj: mat4x4<f32>,
    temporalProjection: vec4<f32>,
    temporalPreviousCameraPos: vec4<f32>,
    ssrParams: vec4<f32>,
    cloudShadowOrigin: vec4<f32>,
    cloudShadowRight: vec4<f32>,
    cloudShadowUp: vec4<f32>,
    cloudShadowProjection: vec4<f32>,
}

struct ClusterUniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX {
    grid: vec4<u32>,
    near_far_log: vec4<f32>,
}

struct DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX {
    position: vec4<f32>,
    colorTimesIntensity: vec4<f32>,
    direction: vec4<f32>,
    auxiliary: vec4<f32>,
    metadata: vec4<u32>,
}

struct SkylightUniformsX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX {
    intensity: f32,
    colorR: f32,
    colorG: f32,
    colorB: f32,
    rotation: vec4<f32>,
    diffuseScale: vec4<f32>,
    diffuseRotation: vec4<f32>,
}

struct StandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX {
    diffuse: vec3<f32>,
    specular: vec3<f32>,
    response: vec3<f32>,
}

struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct DeferredOutput {
    @location(0) color: vec4<f32>,
    @location(1) reflectionFallback: vec4<f32>,
    @location(2) specularResponse: vec4<f32>,
}

const PROBE_INV_PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX: f32 = 0.31830987f;
const THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX: u32 = 16u;
const THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX: array<vec2<f32>, 256> = array<vec2<f32>, 256>(vec2<f32>(0.14709473f, 0.8520508f), vec2<f32>(0.16552734f, 0.78759766f), vec2<f32>(0.24438477f, 0.6386719f), vec2<f32>(0.3708496f, 0.51953125f), vec2<f32>(0.49682617f, 0.41552734f), vec2<f32>(0.6020508f, 0.32641602f), vec2<f32>(0.68408203f, 0.25390625f), vec2<f32>(0.74609375f, 0.19750977f), vec2<f32>(0.79052734f, 0.15429688f), vec2<f32>(0.8222656f, 0.12164307f), vec2<f32>(0.8432617f, 0.09698486f), vec2<f32>(0.8564453f, 0.078430176f), vec2<f32>(0.86328125f, 0.06439209f), vec2<f32>(0.86572266f, 0.053710938f), vec2<f32>(0.8642578f, 0.045440674f), vec2<f32>(0.8598633f, 0.039031982f), vec2<f32>(0.38867188f, 0.6113281f), vec2<f32>(0.3930664f, 0.60058594f), vec2<f32>(0.41235352f, 0.54589844f), vec2<f32>(0.45654297f, 0.4482422f), vec2<f32>(0.52783203f, 0.35253906f), vec2<f32>(0.6074219f, 0.27392578f), vec2<f32>(0.67871094f, 0.21142578f), vec2<f32>(0.73339844f, 0.16259766f), vec2<f32>(0.7709961f, 0.12536621f), vec2<f32>(0.79345703f, 0.09729004f), vec2<f32>(0.80322266f, 0.07623291f), vec2<f32>(0.80371094f, 0.06036377f), vec2<f32>(0.7963867f, 0.048431396f), vec2<f32>(0.78564453f, 0.039367676f), vec2<f32>(0.77197266f, 0.032409668f), vec2<f32>(0.7548828f, 0.026977539f), vec2<f32>(0.5722656f, 0.42749023f), vec2<f32>(0.57373047f, 0.42407227f), vec2<f32>(0.57958984f, 0.40356445f), vec2<f32>(0.5917969f, 0.3544922f), vec2<f32>(0.61621094f, 0.28808594f), vec2<f32>(0.65527344f, 0.22485352f), vec2<f32>(0.69873047f, 0.17260742f), vec2<f32>(0.73535156f, 0.13183594f), vec2<f32>(0.75927734f, 0.10089111f), vec2<f32>(0.77001953f, 0.07745361f), vec2<f32>(0.77197266f, 0.059936523f), vec2<f32>(0.7661133f, 0.046844482f), vec2<f32>(0.7519531f, 0.036987305f), vec2<f32>(0.7324219f, 0.029541016f), vec2<f32>(0.70947266f, 0.023834229f), vec2<f32>(0.68359375f, 0.019439697f), vec2<f32>(0.7089844f, 0.29101563f), vec2<f32>(0.7089844f, 0.28979492f), vec2<f32>(0.70996094f, 0.28125f), vec2<f32>(0.70996094f, 0.25854492f), vec2<f32>(0.7114258f, 0.22045898f), vec2<f32>(0.71972656f, 0.17687988f), vec2<f32>(0.734375f, 0.13708496f), vec2<f32>(0.7480469f, 0.10479736f), vec2<f32>(0.7558594f, 0.07989502f), vec2<f32>(0.7597656f, 0.06100464f), vec2<f32>(0.75341797f, 0.046844482f), vec2<f32>(0.73876953f, 0.036224365f), vec2<f32>(0.71777344f, 0.028259277f), vec2<f32>(0.69189453f, 0.022262573f), vec2<f32>(0.6611328f, 0.017700195f), vec2<f32>(0.62841797f, 0.014198303f), vec2<f32>(0.80810547f, 0.19177246f), vec2<f32>(0.8076172f, 0.19128418f), vec2<f32>(0.80615234f, 0.18798828f), vec2<f32>(0.8017578f, 0.17810059f), vec2<f32>(0.79296875f, 0.1586914f), vec2<f32>(0.7836914f, 0.13220215f), vec2<f32>(0.7753906f, 0.1048584f), vec2<f32>(0.7685547f, 0.08111572f), vec2<f32>(0.76464844f, 0.0619812f), vec2<f32>(0.7553711f, 0.04727173f), vec2<f32>(0.7402344f, 0.03616333f), vec2<f32>(0.71875f, 0.027755737f), vec2<f32>(0.69091797f, 0.021484375f), vec2<f32>(0.6582031f, 0.016738892f), vec2<f32>(0.6220703f, 0.013160706f), vec2<f32>(0.5839844f, 0.010414124f), vec2<f32>(0.87841797f, 0.1217041f), vec2<f32>(0.8779297f, 0.1217041f), vec2<f32>(0.875f, 0.12060547f), vec2<f32>(0.8691406f, 0.11694336f), vec2<f32>(0.8569336f, 0.10803223f), vec2<f32>(0.8378906f, 0.09375f), vec2<f32>(0.8149414f, 0.0769043f), vec2<f32>(0.79589844f, 0.060699463f), vec2<f32>(0.7763672f, 0.046875f), vec2<f32>(0.75634766f, 0.03591919f), vec2<f32>(0.7324219f, 0.027450562f), vec2<f32>(0.703125f, 0.021026611f), vec2<f32>(0.6689453f, 0.016174316f), vec2<f32>(0.6303711f, 0.012512207f), vec2<f32>(0.58935547f, 0.009742737f), vec2<f32>(0.5463867f, 0.007633209f), vec2<f32>(0.92626953f, 0.073791504f), vec2<f32>(0.92578125f, 0.073913574f), vec2<f32>(0.92285156f, 0.073913574f), vec2<f32>(0.9169922f, 0.07312012f), vec2<f32>(0.9038086f, 0.06982422f), vec2<f32>(0.88134766f, 0.06311035f), vec2<f32>(0.8510742f, 0.05380249f), vec2<f32>(0.82128906f, 0.043701172f), vec2<f32>(0.7910156f, 0.03439331f), vec2<f32>(0.76123047f, 0.026611328f), vec2<f32>(0.72802734f, 0.020446777f), vec2<f32>(0.69189453f, 0.015655518f), vec2<f32>(0.6508789f, 0.012008667f), vec2<f32>(0.6074219f, 0.009254456f), vec2<f32>(0.56103516f, 0.007156372f), vec2<f32>(0.51416016f, 0.0055656433f), vec2<f32>(0.95751953f, 0.04232788f), vec2<f32>(0.95703125f, 0.04244995f), vec2<f32>(0.95458984f, 0.042816162f), vec2<f32>(0.94921875f, 0.043182373f), vec2<f32>(0.9370117f, 0.042663574f), vec2<f32>(0.91308594f, 0.040252686f), vec2<f32>(0.88183594f, 0.03579712f), vec2<f32>(0.84472656f, 0.030136108f), vec2<f32>(0.80615234f, 0.024337769f), vec2<f32>(0.76708984f, 0.01914978f), vec2<f32>(0.7265625f, 0.014854431f), vec2<f32>(0.6826172f, 0.011421204f), vec2<f32>(0.63623047f, 0.008773804f), vec2<f32>(0.58691406f, 0.00674057f), vec2<f32>(0.5366211f, 0.0051994324f), vec2<f32>(0.48608398f, 0.004020691f), vec2<f32>(0.97753906f, 0.022628784f), vec2<f32>(0.9770508f, 0.022750854f), vec2<f32>(0.97509766f, 0.02319336f), vec2<f32>(0.96972656f, 0.023910522f), vec2<f32>(0.95947266f, 0.024490356f), vec2<f32>(0.93603516f, 0.024124146f), vec2<f32>(0.90527344f, 0.022521973f), vec2<f32>(0.8652344f, 0.019760132f), vec2<f32>(0.82177734f, 0.01651001f), vec2<f32>(0.77441406f, 0.013290405f), vec2<f32>(0.7265625f, 0.0104599f), vec2<f32>(0.67626953f, 0.008132935f), vec2<f32>(0.62402344f, 0.0062789917f), vec2<f32>(0.5698242f, 0.004825592f), vec2<f32>(0.5151367f, 0.0037136078f), vec2<f32>(0.46142578f, 0.0028629303f), vec2<f32>(0.98876953f, 0.011070251f), vec2<f32>(0.98876953f, 0.011161804f), vec2<f32>(0.9868164f, 0.011512756f), vec2<f32>(0.98291016f, 0.012214661f), vec2<f32>(0.97314453f, 0.012992859f), vec2<f32>(0.953125f, 0.013519287f), vec2<f32>(0.92285156f, 0.013282776f), vec2<f32>(0.8823242f, 0.012260437f), vec2<f32>(0.83496094f, 0.010658264f), vec2<f32>(0.7832031f, 0.008850098f), vec2<f32>(0.7285156f, 0.0071144104f), vec2<f32>(0.671875f, 0.005607605f), vec2<f32>(0.61376953f, 0.004360199f), vec2<f32>(0.5546875f, 0.0033721924f), vec2<f32>(0.4963379f, 0.0025997162f), vec2<f32>(0.43945313f, 0.0020046234f), vec2<f32>(0.9951172f, 0.004798889f), vec2<f32>(0.9951172f, 0.004863739f), vec2<f32>(0.99365234f, 0.0050964355f), vec2<f32>(0.9902344f, 0.0056037903f), vec2<f32>(0.9814453f, 0.0063323975f), vec2<f32>(0.96435547f, 0.0069770813f), vec2<f32>(0.93603516f, 0.007297516f), vec2<f32>(0.8964844f, 0.0071258545f), vec2<f32>(0.8466797f, 0.0064926147f), vec2<f32>(0.7915039f, 0.005596161f), vec2<f32>(0.7314453f, 0.004627228f), vec2<f32>(0.6689453f, 0.0037174225f), vec2<f32>(0.60546875f, 0.0029296875f), vec2<f32>(0.5415039f, 0.002281189f), vec2<f32>(0.47924805f, 0.0017662048f), vec2<f32>(0.41967773f, 0.0013656616f), vec2<f32>(0.9980469f, 0.0017604828f), vec2<f32>(0.9980469f, 0.0017938614f), vec2<f32>(0.99658203f, 0.0019292831f), vec2<f32>(0.9941406f, 0.0022392273f), vec2<f32>(0.9863281f, 0.002729416f), vec2<f32>(0.9716797f, 0.003250122f), vec2<f32>(0.9458008f, 0.0036697388f), vec2<f32>(0.90771484f, 0.003818512f), vec2<f32>(0.85839844f, 0.0036811829f), vec2<f32>(0.7993164f, 0.003320694f), vec2<f32>(0.73535156f, 0.0028438568f), vec2<f32>(0.66748047f, 0.0023441315f), vec2<f32>(0.5986328f, 0.0018796921f), vec2<f32>(0.53027344f, 0.0014829636f), vec2<f32>(0.46411133f, 0.0011587143f), vec2<f32>(0.4020996f, 0.0008993149f), vec2<f32>(0.9995117f, 0.00050115585f), vec2<f32>(0.9995117f, 0.00051546097f), vec2<f32>(0.9980469f, 0.0005836487f), vec2<f32>(0.99658203f, 0.0007505417f), vec2<f32>(0.9892578f, 0.0010147095f), vec2<f32>(0.9760742f, 0.0013465881f), vec2<f32>(0.9526367f, 0.0016527176f), vec2<f32>(0.9160156f, 0.0018558502f), vec2<f32>(0.8671875f, 0.0019054413f), vec2<f32>(0.8076172f, 0.0018167496f), vec2<f32>(0.7392578f, 0.0016212463f), vec2<f32>(0.6669922f, 0.0013799667f), vec2<f32>(0.5932617f, 0.0011358261f), vec2<f32>(0.52001953f, 0.0009121895f), vec2<f32>(0.45043945f, 0.00072193146f), vec2<f32>(0.38598633f, 0.00056505203f), vec2<f32>(1f, 0.00009316206f), vec2<f32>(1f, 0.00009787083f), vec2<f32>(0.99902344f, 0.00012540817f), vec2<f32>(0.9970703f, 0.00019216537f), vec2<f32>(0.99072266f, 0.000310421f), vec2<f32>(0.9790039f, 0.00046992302f), vec2<f32>(0.95751953f, 0.000647068f), vec2<f32>(0.92333984f, 0.0007915497f), vec2<f32>(0.8754883f, 0.00087690353f), vec2<f32>(0.8149414f, 0.0008869171f), vec2<f32>(0.7441406f, 0.0008325577f), vec2<f32>(0.66748047f, 0.00073862076f), vec2<f32>(0.5883789f, 0.000626564f), vec2<f32>(0.51123047f, 0.0005168915f), vec2<f32>(0.43823242f, 0.00041651726f), vec2<f32>(0.37109375f, 0.0003311634f), vec2<f32>(1f, 0.0000072717667f), vec2<f32>(1f, 0.000008165836f), vec2<f32>(0.99902344f, 0.000016987324f), vec2<f32>(0.9975586f, 0.000037908554f), vec2<f32>(0.9921875f, 0.00007593632f), vec2<f32>(0.9814453f, 0.00013744831f), vec2<f32>(0.9614258f, 0.00020754337f), vec2<f32>(0.9291992f, 0.00028014183f), vec2<f32>(0.8828125f, 0.00033450127f), vec2<f32>(0.82177734f, 0.00036263466f), vec2<f32>(0.74902344f, 0.00036215782f), vec2<f32>(0.66845703f, 0.00033807755f), vec2<f32>(0.5854492f, 0.00029969215f), vec2<f32>(0.50390625f, 0.00025582314f), vec2<f32>(0.42700195f, 0.0002117157f), vec2<f32>(0.35766602f, 0.000172019f), vec2<f32>(1f, 0f), vec2<f32>(1f, 0.000000059604645f), vec2<f32>(0.9995117f, 0.0000012516975f), vec2<f32>(0.9975586f, 0.0000053048134f), vec2<f32>(0.99316406f, 0.000015079975f), vec2<f32>(0.98291016f, 0.000028550625f), vec2<f32>(0.96435547f, 0.000047445297f), vec2<f32>(0.93408203f, 0.00006842613f), vec2<f32>(0.88916016f, 0.00008893013f), vec2<f32>(0.828125f, 0.000104248524f), vec2<f32>(0.75390625f, 0.00011217594f), vec2<f32>(0.67041016f, 0.00011241436f), vec2<f32>(0.5830078f, 0.00010627508f), vec2<f32>(0.4970703f, 0.00009584427f), vec2<f32>(0.4169922f, 0.00008332729f), vec2<f32>(0.34521484f, 0.000070512295f));
const KIND_POINTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: u32 = 0u;
const KIND_SPOTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: u32 = 1u;
const PROJECTOR_FLAGX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: i32 = 1073741824i;
const TILE_MASKX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: i32 = 1073741823i;
const KIND_RECT_AREAX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: u32 = 2u;
const PCSS_MEDIUM_RAW_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX: u32 = 8u;
const PCSS_DISK_OFFSETSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX: array<vec2<f32>, 32> = array<vec2<f32>, 32>(vec2<f32>(-0.326f, -0.945f), vec2<f32>(0.236f, -0.873f), vec2<f32>(0.891f, -0.404f), vec2<f32>(-0.761f, -0.581f), vec2<f32>(0.612f, 0.146f), vec2<f32>(-0.148f, 0.514f), vec2<f32>(-0.527f, -0.109f), vec2<f32>(0.074f, 0.911f), vec2<f32>(-0.944f, 0.238f), vec2<f32>(0.444f, -0.736f), vec2<f32>(0.707f, 0.641f), vec2<f32>(-0.184f, -0.342f), vec2<f32>(0.318f, 0.382f), vec2<f32>(-0.638f, 0.526f), vec2<f32>(0.955f, -0.083f), vec2<f32>(-0.401f, 0.816f), vec2<f32>(-0.083f, -0.632f), vec2<f32>(0.539f, -0.262f), vec2<f32>(-0.735f, -0.168f), vec2<f32>(0.162f, 0.719f), vec2<f32>(-0.841f, 0.003f), vec2<f32>(0.791f, 0.332f), vec2<f32>(-0.291f, -0.791f), vec2<f32>(0.021f, -0.224f), vec2<f32>(0.386f, 0.799f), vec2<f32>(-0.558f, 0.134f), vec2<f32>(0.638f, -0.555f), vec2<f32>(-0.189f, 0.957f), vec2<f32>(-0.977f, -0.117f), vec2<f32>(0.271f, 0.589f), vec2<f32>(0.819f, -0.719f), vec2<f32>(-0.472f, -0.409f));
const PCSS_HIGH_RAW_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX: u32 = 16u;
const PCSS_MEDIUM_COMPARE_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX: u32 = 16u;
const PCSS_HIGH_COMPARE_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX: u32 = 32u;

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(3) 
var shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_depth_2d;
@group(0) @binding(4) 
var shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: sampler_comparison;
@group(0) @binding(5) 
var shadowAtlasX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_depth_cube_array;
@group(0) @binding(8) 
var spotShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_depth_2d;
@group(0) @binding(6) 
var<uniform> shadowParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<vec4<f32>, 4>;
@group(2) @binding(6) 
var<uniform> cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: ClusterUniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX;
@group(2) @binding(4) 
var<storage> cluster_gridX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: array<u32>;
@group(2) @binding(5) 
var<storage> light_index_listX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: array<u32>;
@group(2) @binding(3) 
var<storage> light_dataX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: array<DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX, 256>;
@group(1) @binding(0) 
var normalRoughness: texture_2d<u32>;
@group(1) @binding(1) 
var albedoMetallic: texture_2d<u32>;
@group(1) @binding(2) 
var f0Occlusion: texture_2d<u32>;
@group(1) @binding(3) 
var lightingContext: texture_2d<u32>;
@group(1) @binding(4) 
var sceneDepth: texture_depth_2d;
@group(1) @binding(5) 
var screenOcclusion: texture_2d<f32>;
@group(1) @binding(6) 
var linearSampler: sampler;
@group(1) @binding(7) 
var<uniform> params: vec4<f32>;
@group(1) @binding(8) 
var irradianceMap_2: texture_cube<f32>;
@group(1) @binding(9) 
var prefilterMap_2: texture_cube<f32>;
@group(1) @binding(10) 
var brdfLut_4: texture_2d<f32>;
@group(1) @binding(11) 
var skylightPrefilterMap_1: texture_cube<f32>;
@group(1) @binding(12) 
var<uniform> skylight: SkylightUniformsX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX;
@group(3) @binding(0) 
var<storage> probeBlendRecords: array<vec4<f32>>;

fn inverseRotateEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(direction: vec3<f32>, rotation: vec4<f32>) -> vec3<f32> {
    let q = normalize(rotation);
    let t = (2f * cross(q.xyz, direction));
    return ((direction - (q.w * t)) + cross(q.xyz, t));
}

fn fresnelSchlickRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(cosTheta: f32, F0_: vec3<f32>, roughness: f32) -> vec3<f32> {
    let oneMinusRough = max(vec3((1f - roughness)), F0_);
    return (F0_ + ((oneMinusRough - F0_) * pow(clamp((1f - cosTheta), 0f, 1f), 5f)));
}

fn decodeSpecularEnvironmentScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(skyColor: vec3<f32>, intensity: f32) -> vec3<f32> {
    return select((skyColor * intensity), vec3(1f), (intensity < 0f));
}

fn sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal: vec3<f32>, rotation_1: vec4<f32>, irradianceMap: texture_cube<f32>, irradianceSampler: sampler) -> vec3<f32> {
    let _e2 = inverseRotateEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(normal, rotation_1);
    let dir = vec3<f32>(_e2.x, -(_e2.y), _e2.z);
    let _e10 = textureSample(irradianceMap, irradianceSampler, dir);
    let irradianceEOverPi = _e10.xyz;
    return irradianceEOverPi;
}

fn projectSpecularRadianceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(radiance: vec3<f32>, normal_1: vec3<f32>, view: vec3<f32>, roughness_1: f32, F0_1: vec3<f32>, brdfLut: texture_2d<f32>, brdfLutSampler: sampler) -> vec3<f32> {
    let NdotV = max(dot(normal_1, view), 0.001f);
    let _e10 = textureSampleLevel(brdfLut, brdfLutSampler, vec2<f32>(NdotV, roughness_1), 0f);
    let envBRDF = _e10.xy;
    let _e13 = fresnelSchlickRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(NdotV, F0_1, roughness_1);
    return (radiance * ((_e13 * envBRDF.x) + vec3(envBRDF.y)));
}

fn sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_2: vec3<f32>, view_1: vec3<f32>, roughness_2: f32, F0_2: vec3<f32>, rotation_2: vec4<f32>, prefilterMap: texture_cube<f32>, prefilterSampler: sampler, brdfLut_1: texture_2d<f32>, brdfLutSampler_1: sampler) -> vec3<f32> {
    let NdotV_1 = max(dot(normal_2, view_1), 0.001f);
    let R = reflect(-(view_1), normal_2);
    let _e8 = inverseRotateEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(R, rotation_2);
    let Rflip = vec3<f32>(_e8.x, -(_e8.y), _e8.z);
    let mip = (roughness_2 * 4f);
    let _e19 = textureSampleLevel(prefilterMap, prefilterSampler, Rflip, mip);
    let prefilteredColor = _e19.xyz;
    let _e24 = projectSpecularRadianceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(prefilteredColor, normal_2, view_1, roughness_2, F0_2, brdfLut_1, brdfLutSampler_1);
    return _e24;
}

fn box_projectX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(worldPosition: vec3<f32>, direction_1: vec3<f32>, boxCenter: vec3<f32>, boxExtents: vec3<f32>) -> vec3<f32> {
    let safeExtents = max(boxExtents, vec3(0.0001f));
    if any((abs((worldPosition - boxCenter)) >= safeExtents)) {
        return normalize(direction_1);
    }
    let safeDirection = select(select(vec3(-0.0001f), vec3(0.0001f), (direction_1 >= vec3(0f))), direction_1, (abs(direction_1) >= vec3(0.0001f)));
    let localPosition = (worldPosition - boxCenter);
    let edgeSign = select(vec3(-1f), vec3(1f), (direction_1 >= vec3(0f)));
    let edge = (edgeSign * safeExtents);
    let distances = ((edge - localPosition) / safeDirection);
    let travel = min(distances.x, min(distances.y, distances.z));
    return normalize((localPosition + (direction_1 * max(travel, 0f))));
}

fn sampleReflectionProbeSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_3: vec3<f32>, view_2: vec3<f32>, roughness_3: f32, F0_3: vec3<f32>, worldPosition_1: vec3<f32>, boxCenter_1: vec3<f32>, boxExtents_1: vec3<f32>, rotation_3: vec4<f32>, probeMap: texture_cube<f32>, probeSampler: sampler, brdfLut_2: texture_2d<f32>, brdfLutSampler_2: sampler, skylightMap: texture_cube<f32>, skylightRotation: vec4<f32>, skylightScale: vec3<f32>, probeIntensity: f32, boxProjection: bool) -> vec3<f32> {
    var sky: vec3<f32> = vec3(0f);
    var projected: vec3<f32>;

    let relative = (abs((worldPosition_1 - boxCenter_1)) / max(boxExtents_1, vec3(0.0001f)));
    let weight = smoothstep(0f, 0.1f, (1f - max(relative.x, max(relative.y, relative.z))));
    if (weight < 1f) {
        let _e32 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_3, view_2, roughness_3, F0_3, skylightRotation, skylightMap, probeSampler, brdfLut_2, brdfLutSampler_2);
        sky = (_e32 * skylightScale);
    }
    if (weight <= 0f) {
        let _e38 = sky;
        return _e38;
    }
    let NdotV_2 = max(dot(normal_3, view_2), 0.001f);
    let reflection = reflect(-(view_2), normal_3);
    projected = reflection;
    if boxProjection {
        let _e46 = box_projectX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(worldPosition_1, reflection, boxCenter_1, boxExtents_1);
        projected = _e46;
    }
    let _e47 = projected;
    let _e49 = inverseRotateEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(_e47, rotation_3);
    let mip_1 = (roughness_3 * 4f);
    let _e53 = textureSampleLevel(probeMap, probeSampler, _e49, mip_1);
    let prefilteredColor_1 = _e53.xyz;
    let _e55 = projectSpecularRadianceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(prefilteredColor_1, normal_3, view_2, roughness_3, F0_3, brdfLut_2, brdfLutSampler_2);
    let local_28 = (_e55 * probeIntensity);
    let _e58 = sky;
    return mix(_e58, local_28, weight);
}

fn probe_sh9X_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX(shPreblend: array<vec4<f32>, 9>, normal_4: vec3<f32>) -> vec3<f32> {
    var result: vec3<f32> = vec3(0f);
    var band: u32 = 0u;

    let x_4 = normal_4.x;
    let y_4 = normal_4.y;
    let z = normal_4.z;
    let basis = array<f32, 9>(0.2820948f, (0.48860252f * y_4), (0.48860252f * z), (0.48860252f * x_4), ((1.0925485f * x_4) * y_4), ((1.0925485f * y_4) * z), (0.31539157f * (((3f * z) * z) - 1f)), ((1.0925485f * x_4) * z), (0.54627424f * ((x_4 * x_4) - (y_4 * y_4))));
    loop {
        let _e37 = band;
        if (_e37 < 9u) {
        } else {
            break;
        }
        {
            let _e42 = result;
            let _e43 = band;
            let _e46 = band;
            result = (_e42 + (shPreblend[_e43].xyz * basis[_e46]));
        }
        continuing {
            let _e50 = band;
            band = (_e50 + 1u);
        }
    }
    let _e53 = result;
    return _e53;
}

fn evaluateProbeDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX(shPreblend_1: array<vec4<f32>, 9>, localBlendFraction: f32, normal_5: vec3<f32>, e_sky: vec3<f32>, k_d: vec3<f32>, albedo: vec3<f32>, metallic: f32) -> vec3<f32> {
    let _e2 = probe_sh9X_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX(shPreblend_1, normal_5);
    let local_29 = (max(_e2, vec3(0f)) * PROBE_INV_PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX);
    let skyResidualFraction = (1f - localBlendFraction);
    return ((((local_29 + (skyResidualFraction * e_sky)) * k_d) * albedo) * (1f - metallic));
}

fn cloud_apply_direct_solarX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX(radiance_1: vec3<f32>, worldPosition_2: vec3<f32>, shadowOrigin: vec3<f32>, shadowRight: vec3<f32>, shadowUp: vec3<f32>, shadowProjection: vec4<f32>) -> vec3<f32> {
    return radiance_1;
}

fn shadow_clamp_texel_to_tileX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(texel: vec2<i32>, tileOrigin: vec2<i32>, tileSize: vec2<i32>, inset: i32) -> vec2<i32> {
    let tileMin = (tileOrigin + vec2(inset));
    let tileMax = (tileOrigin + max(vec2(inset), (tileSize - vec2((1i + inset)))));
    return min(tileMax, max(tileMin, texel));
}

fn shadow_load_raw_depthX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMap: texture_depth_2d, texel_1: vec2<i32>) -> f32 {
    let _e3 = textureLoad(shadowMap, texel_1, 0i);
    return _e3;
}

fn shadow_sample_compareX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMap_1: texture_depth_2d, shadowSampler: sampler_comparison, uv: vec2<f32>, depthRef: f32) -> f32 {
    let _e4 = textureSampleCompareLevel(shadowMap_1, shadowSampler, uv, depthRef);
    return _e4;
}

fn d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH: f32, a: f32) -> f32 {
    let a2_ = (a * a);
    let f = ((((nDotH * a2_) - nDotH) * nDotH) + 1f);
    return (a2_ / ((3.1415927f * f) * f));
}

fn v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV: f32, nDotL: f32, a_1: f32) -> f32 {
    let a2_1 = (a_1 * a_1);
    let gv = (nDotL * sqrt((((nDotV * nDotV) * (1f - a2_1)) + a2_1)));
    let gl = (nDotV * sqrt((((nDotL * nDotL) * (1f - a2_1)) + a2_1)));
    return (0.5f / max((gv + gl), 0.00001f));
}

fn f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH: f32, f0_: vec3<f32>) -> vec3<f32> {
    let fresnel = exp2((((-5.55473f * vDotH) - 6.98316f) * vDotH));
    return ((f0_ * (vec3(1f) - vec3(fresnel))) + vec3(fresnel));
}

fn sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_4: f32, dotNV: f32) -> vec2<f32> {
    let uv_2 = clamp(vec2<f32>(roughness_4, dotNV), vec2(0f), vec2(1f));
    let samplePosition = ((uv_2 * 16f) - vec2(0.5f));
    let base = vec2<i32>(floor(samplePosition));
    let weight_1 = fract(samplePosition);
    let lo = clamp(base, vec2(0i), vec2(15i));
    let hi = clamp((base + vec2(1i)), vec2(0i), vec2(15i));
    let rowLo = mix(THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(lo.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(lo.x))], THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(lo.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(hi.x))], weight_1.x);
    let rowHi = mix(THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(hi.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(lo.x))], THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(hi.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(hi.x))], weight_1.x);
    return mix(rowLo, rowHi, weight_1.y);
}

fn threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_5: f32, nDotV_1: f32, nDotL_1: f32, F0_4: vec3<f32>) -> vec3<f32> {
    let _e2 = sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_5, nDotV_1);
    let _e4 = sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_5, nDotL_1);
    let fssEssV = ((F0_4 * _e2.x) + vec3(_e2.y));
    let fssEssL = ((F0_4 * _e4.x) + vec3(_e4.y));
    let emsV = ((1f - _e2.x) - _e2.y);
    let emsL = ((1f - _e4.x) - _e4.y);
    let favg = (F0_4 + ((vec3(1f) - F0_4) * 0.047619f));
    let energyLoss = (emsV * emsL);
    let fms = (((fssEssV * fssEssL) * favg) / ((vec3(1f) - ((energyLoss * favg) * favg)) + vec3(0.000001f)));
    return (fms * energyLoss);
}

fn evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_6: vec3<f32>, viewDir: vec3<f32>, baseColor: vec3<f32>, metallic_1: f32, alphaSq: f32, F0_5: vec3<f32>) -> vec3<f32> {
    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let l_3 = normalize(-(_e2));
    let halfVector = (viewDir + l_3);
    let halfVectorLengthSquared = max(dot(halfVector, halfVector), 0.00000001f);
    let h = (halfVector * inverseSqrt(halfVectorLengthSquared));
    let nDotL_5 = max(dot(normal_6, l_3), 0f);
    let nDotV_2 = max(dot(normal_6, viewDir), 0.00001f);
    let nDotH_1 = max(dot(normal_6, h), 0f);
    let vDotH_1 = max(dot(viewDir, h), 0f);
    let _e26 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH_1, F0_5);
    let roughness_7 = sqrt(max(alphaSq, 0f));
    let _e31 = threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_7, nDotV_2, nDotL_5, F0_5);
    let _e32 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_1, alphaSq);
    let _e33 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_2, nDotL_5, alphaSq);
    let specular_1 = (((_e32 * _e33) * _e26) + _e31);
    let diffuse_1 = (((1f - metallic_1) * baseColor) / vec3(3.1415927f));
    let _e48 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightColor;
    return (((diffuse_1 + specular_1) * _e48) * nDotL_5);
}

fn evalDistanceAttenuationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(dSquared: f32, invRangeSquared: f32) -> f32 {
    let safeDistance = max(dSquared, 0.0001f);
    let window = clamp((1f - ((safeDistance * invRangeSquared) * (safeDistance * invRangeSquared))), 0f, 1f);
    return ((window * window) / safeDistance);
}

fn evalSpotAttenuationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(lightPos: vec3<f32>, lightDir: vec3<f32>, worldPos: vec3<f32>, cosInner: f32, cosOuter: f32, invRangeSquared_1: f32) -> f32 {
    let toLight = (lightPos - worldPos);
    let dSquared_2 = dot(toLight, toLight);
    let _e5 = evalDistanceAttenuationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(dSquared_2, invRangeSquared_1);
    let direction_4 = normalize(select(vec3<f32>(0f, 0f, -1f), toLight, (dSquared_2 > 0.0001f)));
    let cone_1 = smoothstep(cosOuter, cosInner, dot(direction_4, -(normalize(lightDir))));
    return (_e5 * cone_1);
}

fn projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(lightViewProj: mat4x4<f32>, worldPos_1: vec3<f32>) -> vec2<f32> {
    let clip_1 = (lightViewProj * vec4<f32>(worldPos_1, 1f));
    let invW = select((1f / clip_1.w), 0f, (abs(clip_1.w) < 0.000001f));
    return vec2<f32>((((clip_1.x * invW) * 0.5f) + 0.5f), (((clip_1.y * invW) * -0.5f) + 0.5f));
}

fn sample_shadow_2d_kernelX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMap_2: texture_depth_2d, shadowSampler_1: sampler_comparison, uv_1: vec2<f32>, texel_2: vec2<f32>, depthRef_1: f32, normalBias: f32, depthBias: f32, nDotL_2: f32, kernelSize: f32) -> f32 {
    var blocked: f32 = 0f;
    var samples: f32 = 0f;
    var y: i32 = -2i;
    var x: i32;
    var local: bool;

    let bias = max((normalBias * (1f - nDotL_2)), (depthBias / 1000f));
    let adjustedDepth = (depthRef_1 - bias);
    let halfWidth_2 = clamp(((i32(round(kernelSize)) - 1i) / 2i), 0i, 2i);
    loop {
        let _e24 = y;
        if (_e24 <= 2i) {
        } else {
            break;
        }
        {
            x = -2i;
            loop {
                let _e29 = x;
                if (_e29 <= 2i) {
                } else {
                    break;
                }
                {
                    let _e32 = x;
                    if (abs(_e32) <= halfWidth_2) {
                        let _e35 = y;
                        local = (abs(_e35) <= halfWidth_2);
                    } else {
                        local = false;
                    }
                    let _e41 = local;
                    if _e41 {
                        let _e44 = x;
                        let _e46 = y;
                        let offsetUv = (uv_1 + (vec2<f32>(f32(_e44), f32(_e46)) * texel_2));
                        let lit = textureSampleCompareLevel(shadowMap_2, shadowSampler_1, offsetUv, adjustedDepth);
                        let _e55 = blocked;
                        blocked = (_e55 + (1f - lit));
                        let _e60 = samples;
                        samples = (_e60 + 1f);
                    }
                }
                continuing {
                    let _e63 = x;
                    x = (_e63 + 1i);
                }
            }
        }
        continuing {
            let _e66 = y;
            y = (_e66 + 1i);
        }
    }
    let _e69 = blocked;
    let _e70 = samples;
    return (1f - (_e69 / max(_e70, 1f)));
}

fn shadow_biased_receiver_depthX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(receiverDepth: f32, normalBias_1: f32, depthBias_1: f32, nDotL_3: f32) -> f32 {
    return (receiverDepth - max((normalBias_1 * (1f - nDotL_3)), depthBias_1));
}

fn sample_shadow_cube_hw2x2X_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowAtlas: texture_depth_cube_array, shadowSampler_2: sampler_comparison, lightLocal: vec3<f32>, layer: i32, depthRef_2: f32, normalBias_2: f32, depthBias_2: f32, nDotL_4: f32) -> f32 {
    let _e4 = shadow_biased_receiver_depthX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(depthRef_2, normalBias_2, depthBias_2, nDotL_4);
    let _e9 = textureSampleCompareLevel(shadowAtlas, shadowSampler_2, lightLocal, layer, _e4);
    return _e9;
}

fn spotModifierProductX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX(brdf: f32, range: f32, cone: f32, ies: f32, cookie: f32, shadow: f32) -> f32 {
    return (((((brdf * range) * cone) * ies) * cookie) * shadow);
}

fn evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_1: vec3<f32>, colorTimesIntensity: vec3<f32>, invRangeSquared_2: f32, worldPos_2: vec3<f32>, normal_7: vec3<f32>, viewDir_1: vec3<f32>, baseColor_1: vec3<f32>, metallic_2: f32, alphaSq_1: f32, F0_6: vec3<f32>) -> vec3<f32> {
    let toLight_1 = (lightPos_1 - worldPos_2);
    let dSquared_3 = max(dot(toLight_1, toLight_1), 0.0001f);
    let l_4 = (toLight_1 / vec3(sqrt(dSquared_3)));
    let h_1 = normalize((viewDir_1 + l_4));
    let nDotL_6 = max(dot(normal_7, l_4), 0f);
    let nDotV_3 = max(dot(normal_7, viewDir_1), 0.00001f);
    let nDotH_2 = max(dot(normal_7, h_1), 0f);
    let vDotH_2 = max(dot(viewDir_1, h_1), 0f);
    let _e26 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH_2, F0_6);
    let roughness_8 = sqrt(max(alphaSq_1, 0f));
    let _e31 = threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_8, nDotV_3, nDotL_6, F0_6);
    let _e32 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_2, alphaSq_1);
    let _e33 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_3, nDotL_6, alphaSq_1);
    let specular_2 = (((_e32 * _e33) * _e26) + _e31);
    let diffuse_2 = (((1f - metallic_2) * baseColor_1) / vec3(3.1415927f));
    let _e46 = evalDistanceAttenuationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(dSquared_3, invRangeSquared_2);
    return ((((diffuse_2 + specular_2) * colorTimesIntensity) * nDotL_6) * _e46);
}

fn evalPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_2: vec3<f32>, colorTimesIntensity_1: vec3<f32>, invRangeSquared_3: f32, worldPos_3: vec3<f32>, normal_8: vec3<f32>, viewDir_2: vec3<f32>, baseColor_2: vec3<f32>, metallic_3: f32, alphaSq_2: f32, F0_7: vec3<f32>) -> vec3<f32> {
    let _e10 = evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_2, colorTimesIntensity_1, invRangeSquared_3, worldPos_3, normal_8, viewDir_2, baseColor_2, metallic_3, alphaSq_2, F0_7);
    return _e10;
}

fn evalFlatRangeAttenuationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(dSquared_1: f32, invRangeSquared_4: f32) -> f32 {
    let factor = max(min((1f - ((dSquared_1 * invRangeSquared_4) * (dSquared_1 * invRangeSquared_4))), 1f), 0f);
    return ((factor * factor) / dSquared_1);
}

fn evalPointFlatX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_3: vec3<f32>, colorTimesIntensity_2: vec3<f32>, invRangeSquared_5: f32, worldPos_4: vec3<f32>, baseColor_3: vec3<f32>) -> vec3<f32> {
    let toLight_2 = (lightPos_3 - worldPos_4);
    let dSquared_4 = max(dot(toLight_2, toLight_2), 0.0001f);
    let _e10 = evalFlatRangeAttenuationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(dSquared_4, invRangeSquared_5);
    return ((baseColor_3 * colorTimesIntensity_2) * _e10);
}

fn evalSpotFlatX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_4: vec3<f32>, lightDir_1: vec3<f32>, colorTimesIntensity_3: vec3<f32>, cosInner_1: f32, cosOuter_1: f32, invRangeSquared_6: f32, worldPos_5: vec3<f32>, baseColor_4: vec3<f32>) -> vec3<f32> {
    let toLight_3 = (lightPos_4 - worldPos_5);
    let dSquared_5 = max(dot(toLight_3, toLight_3), 0.0001f);
    let l_5 = (toLight_3 / vec3(sqrt(dSquared_5)));
    let cone_2 = smoothstep(cosOuter_1, cosInner_1, dot(l_5, -(lightDir_1)));
    let _e18 = evalPointFlatX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_4, colorTimesIntensity_3, invRangeSquared_6, worldPos_5, baseColor_4);
    return (_e18 * cone_2);
}

fn evalPointShadowedX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_5: vec3<f32>, colorTimesIntensity_4: vec3<f32>, invRangeSquared_7: f32, worldPos_6: vec3<f32>, normal_9: vec3<f32>, viewDir_3: vec3<f32>, baseColor_5: vec3<f32>, metallic_4: f32, alphaSq_3: f32, F0_8: vec3<f32>, shadowAtlasLayer: i32, near: f32, far: f32, depthBias_3: f32, normalBias_3: f32) -> vec3<f32> {
    let _e10 = evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_5, colorTimesIntensity_4, invRangeSquared_7, worldPos_6, normal_9, viewDir_3, baseColor_5, metallic_4, alphaSq_3, F0_8);
    let toLight_4 = (lightPos_5 - worldPos_6);
    let lightLocal_1 = (worldPos_6 - lightPos_5);
    let absV = abs(vec3<f32>(toLight_4.x, toLight_4.y, toLight_4.z));
    let largestAxis = max(absV.x, max(absV.y, absV.z));
    let denom = max((largestAxis * (far - near)), 0.000001f);
    let depthRef_3 = clamp(((far * (largestAxis - near)) / denom), 0f, 1f);
    let nDotL_7 = max(dot(normal_9, normalize(toLight_4)), 0f);
    let _e44 = sample_shadow_cube_hw2x2X_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowAtlasX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, lightLocal_1, shadowAtlasLayer, depthRef_3, normalBias_3, depthBias_3, nDotL_7);
    return (_e10 * _e44);
}

fn evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_6: vec3<f32>, lightDir_2: vec3<f32>, colorTimesIntensity_5: vec3<f32>, cosInner_2: f32, cosOuter_2: f32, invRangeSquared_8: f32, worldPos_7: vec3<f32>, normal_10: vec3<f32>, viewDir_4: vec3<f32>, baseColor_6: vec3<f32>, metallic_5: f32, alphaSq_4: f32, F0_9: vec3<f32>) -> vec3<f32> {
    let _e10 = evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_6, colorTimesIntensity_5, invRangeSquared_8, worldPos_7, normal_10, viewDir_4, baseColor_6, metallic_5, alphaSq_4, F0_9);
    let toLight_5 = (lightPos_6 - worldPos_7);
    let l_6 = normalize(toLight_5);
    let cone_3 = smoothstep(cosOuter_2, cosInner_2, dot(l_6, -(lightDir_2)));
    let _e24 = spotModifierProductX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX(1f, 1f, cone_3, 1f, 1f, 1f);
    return (_e10 * _e24);
}

fn evalSpotShadowedX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_7: vec3<f32>, lightDir_3: vec3<f32>, colorTimesIntensity_6: vec3<f32>, cosInner_3: f32, cosOuter_3: f32, invRangeSquared_9: f32, worldPos_8: vec3<f32>, normal_11: vec3<f32>, viewDir_5: vec3<f32>, baseColor_7: vec3<f32>, metallic_6: f32, alphaSq_5: f32, F0_10: vec3<f32>, lightViewProj_1: mat4x4<f32>, shadowAtlasTile: i32, depthBias_4: f32, normalBias_4: f32, pcfKernelSize: f32, shadowIntensity: f32) -> vec3<f32> {
    var local_1: bool;
    var local_2: bool;
    var local_3: bool;
    var local_4: bool;

    let _e13 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_7, lightDir_3, colorTimesIntensity_6, cosInner_3, cosOuter_3, invRangeSquared_9, worldPos_8, normal_11, viewDir_5, baseColor_7, metallic_6, alphaSq_5, F0_10);
    let splane = (lightViewProj_1 * vec4<f32>(worldPos_8, 1f));
    let invW_1 = select((1f / splane.w), 0f, (abs(splane.w) < 0.000001f));
    let _e27 = projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(lightViewProj_1, worldPos_8);
    let depthRef_4 = (splane.z * invW_1);
    if (_e27.x >= 0f) {
        local_1 = (_e27.x <= 1f);
    } else {
        local_1 = false;
    }
    let _e39 = local_1;
    if _e39 {
        local_2 = (_e27.y >= 0f);
    } else {
        local_2 = false;
    }
    let _e46 = local_2;
    if _e46 {
        local_3 = (_e27.y <= 1f);
    } else {
        local_3 = false;
    }
    let _e53 = local_3;
    if _e53 {
        local_4 = (depthRef_4 <= 1f);
    } else {
        local_4 = false;
    }
    let _e59 = local_4;
    if !(_e59) {
        return _e13;
    }
    let col = f32((shadowAtlasTile % 2i));
    let row = f32((shadowAtlasTile / 2i));
    let tileOrigin_2 = (vec2<f32>(col, row) * 0.5f);
    let atlasUv = ((_e27 * 0.5f) + tileOrigin_2);
    let _e76 = textureDimensions(spotShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 0i);
    let atlasDims = vec2<f32>(_e76);
    let texel_4 = (vec2<f32>(1f, 1f) / atlasDims);
    let nDotL_8 = max(dot(normal_11, normalize((lightPos_7 - worldPos_8))), 0f);
    let _e92 = sample_shadow_2d_kernelX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(spotShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, atlasUv, texel_4, depthRef_4, normalBias_4, depthBias_4, nDotL_8, pcfKernelSize);
    return (_e13 * mix(1f, _e92, clamp(shadowIntensity, 0f, 1f)));
}

fn spotModifierFactorsX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX(lightPos_8: vec3<f32>, lightDir_4: vec3<f32>, cosOuter_4: f32, worldPos_9: vec3<f32>, rollDeg: f32, metadata: vec4<u32>) -> vec4<f32> {
    return vec4(1f);
}

fn evalRectAreaLtcStandardX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(lightPos_9: vec3<f32>, lightColor: vec3<f32>, axisX: vec3<f32>, axisY: vec3<f32>, halfWidth: f32, halfHeight: f32, invRangeSquared_10: f32, worldPos_10: vec3<f32>, n: vec3<f32>, v: vec3<f32>, baseColor_8: vec3<f32>, metallic_7: f32, alphaSq_6: f32, F0_11: vec3<f32>) -> vec3<f32> {
    return vec3(0f);
}

fn evalRectAreaLtcGgxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(lightPos_10: vec3<f32>, lightColor_1: vec3<f32>, axisX_1: vec3<f32>, axisY_1: vec3<f32>, halfWidth_1: f32, halfHeight_1: f32, invRangeSquared_11: f32, worldPos_11: vec3<f32>, n_1: vec3<f32>, v_1: vec3<f32>, baseColor_9: vec3<f32>, metallic_8: f32, alphaSq_7: f32, F0_12: vec3<f32>) -> vec3<f32> {
    let _e14 = evalRectAreaLtcStandardX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(lightPos_10, lightColor_1, axisX_1, axisY_1, halfWidth_1, halfHeight_1, invRangeSquared_11, worldPos_11, n_1, v_1, baseColor_9, metallic_8, alphaSq_7, F0_12);
    return _e14;
}

fn view_z_to_z_sliceX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(view_z: f32, grid_z: u32, near_1: f32, far_1: f32, log_far_over_near: f32) -> u32 {
    if (view_z >= -(near_1)) {
        return 0u;
    }
    let slice = floor(((log((-(view_z) / near_1)) / log_far_over_near) * f32(grid_z)));
    let u_slice = u32(slice);
    if (u_slice >= grid_z) {
        return (grid_z - 1u);
    }
    return u_slice;
}

fn ndc_position_to_clusterX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(ndc: vec3<f32>, view_z_1: f32, grid_x: u32, grid_y: u32, grid_z_1: u32, near_2: f32, far_2: f32, log_far: f32) -> vec3<u32> {
    let cx = clamp(u32(floor((((ndc.x * 0.5f) + 0.5f) * f32(grid_x)))), 0u, (grid_x - 1u));
    let cy = clamp(u32(floor((((ndc.y * 0.5f) + 0.5f) * f32(grid_y)))), 0u, (grid_y - 1u));
    let _e34 = view_z_to_z_sliceX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(view_z_1, grid_z_1, near_2, far_2, log_far);
    return vec3<u32>(cx, cy, _e34);
}

fn evaluate_cluster_lightX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(light: DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX, world_pos: vec3<f32>, normal_12: vec3<f32>, view_dir: vec3<f32>, base_color: vec3<f32>, metallic_9: f32, alpha_sq: f32, f0_1: vec3<f32>, flat_2d: bool, receive_shadows: bool) -> vec3<f32> {
    var local_5: bool;
    var projector_selected: bool = false;
    var tile: i32;
    var local_6: bool;
    var local_7: bool;

    let kind = light.metadata.x;
    if (kind == KIND_POINTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) {
        if flat_2d {
            let _e15 = evalPointFlatX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.colorTimesIntensity.xyz, light.position.w, world_pos, base_color);
            return _e15;
        }
        let layer_8 = bitcast<i32>(light.metadata.y);
        if receive_shadows {
            local_5 = (layer_8 >= 0i);
        } else {
            local_5 = false;
        }
        let _e25 = local_5;
        if _e25 {
            let shadow_3 = shadowParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[layer_8];
            let _e44 = evalPointShadowedX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.colorTimesIntensity.xyz, light.position.w, world_pos, normal_12, view_dir, base_color, metallic_9, alpha_sq, f0_1, layer_8, shadow_3.x, shadow_3.y, shadow_3.z, shadow_3.w);
            return _e44;
        }
        let _e51 = evalPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.colorTimesIntensity.xyz, light.position.w, world_pos, normal_12, view_dir, base_color, metallic_9, alpha_sq, f0_1);
        return _e51;
    }
    if (kind == KIND_SPOTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) {
        if flat_2d {
            let _e66 = evalSpotFlatX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.direction.xyz, light.colorTimesIntensity.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos, base_color);
            return _e66;
        }
        let _e76 = spotModifierFactorsX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX(light.position.xyz, light.direction.xyz, light.direction.w, world_pos, light.auxiliary.w, light.metadata);
        let modifier = (vec3(_e76.x) * _e76.yzw);
        let encoded_tile = bitcast<i32>(light.metadata.y);
        tile = encoded_tile;
        if (encoded_tile >= 0i) {
            local_6 = ((encoded_tile & PROJECTOR_FLAGX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) != 0i);
        } else {
            local_6 = false;
        }
        let _e94 = local_6;
        if _e94 {
            projector_selected = true;
            tile = (encoded_tile & TILE_MASKX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX);
        }
        let _e99 = tile;
        if (_e99 >= 0i) {
            let _e102 = tile;
            local_7 = (_e102 < 4i);
        } else {
            local_7 = false;
        }
        let _e108 = local_7;
        if _e108 {
            let _e123 = tile;
            let _e125 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj[_e123];
            let _e126 = tile;
            let _e133 = evalSpotShadowedX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.direction.xyz, light.colorTimesIntensity.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos, normal_12, view_dir, base_color, metallic_9, alpha_sq, f0_1, _e125, _e126, 0.005f, 0.05f, 3f, select(0f, 1f, receive_shadows));
            return (_e133 * modifier);
        }
        let _e147 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.direction.xyz, light.colorTimesIntensity.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos, normal_12, view_dir, base_color, metallic_9, alpha_sq, f0_1);
        return (_e147 * modifier);
    }
    if (kind == KIND_RECT_AREAX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) {
        let _e165 = evalRectAreaLtcGgxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(light.position.xyz, light.colorTimesIntensity.xyz, light.auxiliary.xyz, light.direction.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos, normal_12, view_dir, base_color, metallic_9, alpha_sq, f0_1);
        return _e165;
    }
    return vec3(0f);
}

fn evaluateStandardClusterLightsX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(ndc_1: vec3<f32>, view_z_2: f32, world_pos_1: vec3<f32>, normal_13: vec3<f32>, view_dir_1: vec3<f32>, base_color_1: vec3<f32>, metallic_10: f32, alpha_sq_1: f32, f0_2: vec3<f32>, flat_2d_1: bool, receive_shadows_1: bool) -> vec3<f32> {
    var total_radiance: vec3<f32> = vec3(0f);
    var i: u32 = 0u;

    let gx = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX.grid.x;
    let gy = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX.grid.y;
    let gz = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX.grid.z;
    let near_3 = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX.near_far_log.x;
    let far_3 = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX.near_far_log.y;
    let log_far_1 = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX.near_far_log.z;
    let _e29 = ndc_position_to_clusterX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(ndc_1, view_z_2, gx, gy, gz, near_3, far_3, log_far_1);
    let cluster_linear = ((((_e29.z * gy) * gx) + (_e29.y * gx)) + _e29.x);
    let grid_offset = (cluster_linear * 2u);
    let list_offset = cluster_gridX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX[grid_offset];
    let list_count = cluster_gridX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX[(grid_offset + 1u)];
    loop {
        let _e49 = i;
        if (_e49 < list_count) {
        } else {
            break;
        }
        {
            let _e53 = i;
            let _e56 = light_index_listX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX[(list_offset + _e53)];
            let light_1 = light_dataX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX[_e56];
            let _e60 = total_radiance;
            let _e70 = evaluate_cluster_lightX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(light_1, world_pos_1, normal_13, view_dir_1, base_color_1, metallic_10, alpha_sq_1, f0_2, flat_2d_1, receive_shadows_1);
            total_radiance = (_e60 + _e70);
        }
        continuing {
            let _e72 = i;
            i = (_e72 + 1u);
        }
    }
    let _e75 = total_radiance;
    return _e75;
}

fn evaluateStandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(worldPosition_3: vec3<f32>, normal_14: vec3<f32>, direction_2: vec3<f32>, albedo_1: vec3<f32>, metallic_11: f32, roughness_6: f32, f0_3: vec3<f32>, sky_1: SkylightUniformsX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX, irradianceMap_1: texture_cube<f32>, irradianceSampler_1: sampler, prefilterMap_1: texture_cube<f32>, prefilterSampler_1: sampler, brdfLut_3: texture_2d<f32>, skylightPrefilterMap: texture_cube<f32>, sh: array<vec4<f32>, 9>, localBlend: f32) -> StandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX {
    var irradiance: vec3<f32>;
    var specular: vec3<f32>;
    var diffuse: vec3<f32>;

    if (sky_1.intensity < 0f) {
        let _e8 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_14, sky_1.diffuseRotation, irradianceMap_1, irradianceSampler_1);
        irradiance = _e8;
        let _e42 = sampleReflectionProbeSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_14, direction_2, roughness_6, f0_3, worldPosition_3, vec3<f32>(sky_1.colorR, sky_1.colorG, sky_1.colorB), sky_1.rotation.xyz, vec4<f32>(0f, 0f, 0f, 1f), prefilterMap_1, prefilterSampler_1, brdfLut_3, irradianceSampler_1, skylightPrefilterMap, sky_1.diffuseRotation, sky_1.diffuseScale.xyz, max((-(sky_1.intensity) - 1f), 0f), (sky_1.rotation.w > 0.5f));
        specular = _e42;
    } else {
        let _e45 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_14, sky_1.rotation, irradianceMap_1, irradianceSampler_1);
        irradiance = _e45;
        let _e47 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_14, direction_2, roughness_6, f0_3, sky_1.rotation, prefilterMap_1, prefilterSampler_1, brdfLut_3, irradianceSampler_1);
        specular = _e47;
    }
    let tint = vec3<f32>(sky_1.colorR, sky_1.colorG, sky_1.colorB);
    let diffuseScale = select((tint * sky_1.intensity), sky_1.diffuseScale.xyz, (sky_1.intensity < 0f));
    let _e63 = fresnelSchlickRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(max(dot(normal_14, direction_2), 0f), f0_3, roughness_6);
    let kD = ((vec3(1f) - _e63) * (1f - metallic_11));
    let _e72 = irradiance;
    diffuse = (((kD * _e72) * albedo_1) * diffuseScale);
    if (localBlend > 0f) {
        let _e80 = irradiance;
        let _e90 = evaluateProbeDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX(sh, localBlend, normal_14, (_e80 * diffuseScale), (kD / max(vec3((1f - metallic_11)), vec3(0.0001f))), albedo_1, metallic_11);
        diffuse = _e90;
    }
    let _e91 = diffuse;
    let _e92 = specular;
    let _e94 = decodeSpecularEnvironmentScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(tint, sky_1.intensity);
    let _e98 = projectSpecularRadianceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(vec3(1f), normal_14, direction_2, roughness_6, f0_3, brdfLut_3, irradianceSampler_1);
    return StandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(_e91, (_e92 * _e94), _e98);
}

fn evaluateStandardDirectX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(worldPosition_4: vec3<f32>, ndc_2: vec3<f32>, viewZ: f32, normal_15: vec3<f32>, direction_3: vec3<f32>, albedo_2: vec3<f32>, metallic_12: f32, alpha: f32, f0_4: vec3<f32>, shadow_1: f32) -> vec3<f32> {
    var direct: vec3<f32>;

    let _e6 = evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_15, direction_3, albedo_2, metallic_12, alpha, f0_4);
    let _e11 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowOrigin;
    let _e15 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowRight;
    let _e19 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowUp;
    let _e23 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowProjection;
    let _e25 = cloud_apply_direct_solarX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX((shadow_1 * _e6), worldPosition_4, _e11.xyz, _e15.xyz, _e19.xyz, _e23);
    direct = _e25;
    let _e27 = direct;
    let _e32 = evaluateStandardClusterLightsX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(ndc_2, viewZ, worldPosition_4, normal_15, direction_3, albedo_2, metallic_12, alpha, f0_4, false, true);
    direct = (_e27 + _e32);
    let _e34 = direct;
    return _e34;
}

fn fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    var x_1: f32 = -1f;
    var y_1: f32 = -1f;
    var out: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

    if (vertex_index == 1u) {
        x_1 = 3f;
    }
    if (vertex_index == 2u) {
        y_1 = 3f;
    }
    let _e10 = x_1;
    let u = ((_e10 + 1f) * 0.5f);
    let _e15 = y_1;
    let v_2 = (1f - ((_e15 + 1f) * 0.5f));
    let _e24 = x_1;
    let _e25 = y_1;
    out.position = vec4<f32>(_e24, _e25, 0f, 1f);
    out.uv = vec2<f32>(u, v_2);
    let _e31 = out;
    return _e31;
}

fn decodeStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(packed: u32) -> vec4<f32> {
    var normal_16: vec3<f32>;

    let oct = ((vec2<f32>(f32((packed & 4095u)), f32(((packed >> 12u) & 4095u))) * 0.0004884005f) - vec2(1f));
    normal_16 = vec3<f32>(oct, ((1f - abs(oct.x)) - abs(oct.y)));
    let _e25 = normal_16.z;
    let fold = max(-(_e25), 0f);
    let _e29 = normal_16;
    let _e34 = normal_16;
    let _e42 = normal_16.z;
    normal_16 = vec3<f32>((_e29.xy + select(vec2(fold), vec2(-(fold)), (_e34.xy >= vec2(0f)))), _e42);
    let _e44 = normal_16;
    return vec4<f32>(normalize(_e44), (f32((packed >> 24u)) / 255f));
}

fn loadStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(source: texture_2d<u32>, pixel: vec2<i32>) -> vec4<f32> {
    let _e3 = textureLoad(source, pixel, 0i);
    let _e5 = decodeStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(_e3.x);
    return _e5;
}

fn decodeStandardReflectanceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(packed_1: u32) -> vec4<f32> {
    let value = unpack4x8unorm(packed_1);
    return vec4<f32>((value.xyz * value.xyz), value.w);
}

fn sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip: vec4<f32>, temporalProjection: vec4<f32>) -> f32 {
    let ndcDepth = (clip.z / max(abs(clip.w), 0.000001f));
    let orthographicViewZ = -((temporalProjection.x + (ndcDepth * (temporalProjection.y - temporalProjection.x))));
    return select(-(clip.w), orthographicViewZ, (temporalProjection.z >= 0.5f));
}

fn _pickCascadeLayerX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(viewDepth: f32, count: u32) -> u32 {
    var layer_1: u32;
    var i_1: u32 = 0u;

    layer_1 = (count - 1u);
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
                layer_1 = _e18;
                break;
            }
        }
        continuing {
            let _e19 = i_1;
            i_1 = (_e19 + 1u);
        }
    }
    let _e22 = layer_1;
    return _e22;
}

fn _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_2: u32) -> mat4x4<f32> {
    switch layer_2 {
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

fn _atlasTileGridX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_1: u32) -> vec2<u32> {
    let columns = select(2u, 1u, (count_1 <= 1u));
    let rows = (((count_1 + columns) - 1u) / columns);
    return vec2<u32>(columns, rows);
}

fn _atlasTileScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_2: u32) -> vec2<f32> {
    let _e3 = _atlasTileGridX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_2);
    return (vec2(1f) / vec2<f32>(_e3));
}

fn _atlasTileOriginX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_3: u32, count_3: u32) -> vec2<f32> {
    let _e1 = _atlasTileGridX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_3);
    let tile_1 = vec2<u32>((layer_3 % _e1.x), (layer_3 / _e1.x));
    return (vec2<f32>(tile_1) / vec2<f32>(_e1));
}

fn _pcssDiskRotationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(texel_3: vec2<i32>, layer_4: u32) -> f32 {
    let hash = (((u32(texel_3.x) * 1664525u) + (u32(texel_3.y) * 1013904223u)) + ((layer_4 + 1u) * 374761393u));
    return (f32((hash % 6283u)) * 0.001f);
}

fn _directionalReceiverDepthBiasX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_5: u32, normal_17: vec3<f32>, l: vec3<f32>, radius: f32) -> f32 {
    var local_8: bool;

    let nDotL_9 = dot(normal_17, l);
    let depthSpan = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_5].z;
    if (nDotL_9 > 0.01f) {
        local_8 = (depthSpan > 0f);
    } else {
        local_8 = false;
    }
    let _e16 = local_8;
    if !(_e16) {
        let _e20 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
        return _e20;
    }
    let _e21 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_5);
    let right = normalize(vec3<f32>(_e21[0].x, _e21[1].x, _e21[2].x));
    let up = normalize(vec3<f32>(_e21[0].y, _e21[1].y, _e21[2].y));
    let slope = ((abs(dot(normal_17, right)) + abs(dot(normal_17, up))) / nDotL_9);
    let _e49 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_5].y;
    let footprint = ((_e49 * radius) * slope);
    let _e54 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
    let _e57 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.normalBias;
    return (_e54 + (max(0f, (footprint - (_e57 / nDotL_9))) / depthSpan));
}

fn _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(index_1: u32, angle: f32, radius_1: f32) -> vec2<f32> {
    let point = PCSS_DISK_OFFSETSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX[index_1];
    let cs = cos(angle);
    let sn = sin(angle);
    return (vec2<f32>(((point.x * cs) - (point.y * sn)), ((point.x * sn) + (point.y * cs))) * radius_1);
}

fn _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize: vec2<u32>, tileOrigin_1: vec2<u32>, tileSize_1: vec2<u32>, baseTexel: vec2<i32>, offset: vec2<f32>) -> vec2<f32> {
    let _e10 = shadow_clamp_texel_to_tileX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX((baseTexel + vec2<i32>(round(offset))), vec2<i32>(tileOrigin_1), vec2<i32>(tileSize_1), 1i);
    return ((vec2<f32>(_e10) + vec2(0.5f)) / vec2<f32>(shadowMapSize));
}

fn _samplePcssForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_12: vec3<f32>, layer_6: u32, count_4: u32, normal_18: vec3<f32>, l_1: vec3<f32>, profile: u32) -> f32 {
    var local_9: bool;
    var local_10: bool;
    var local_11: bool;
    var local_12: bool;
    var local_13: bool;
    var local_14: bool;
    var local_15: bool;
    var blockerDepth: f32 = 0f;
    var blockerCount: u32 = 0u;
    var i_2: u32 = 0u;
    var local_16: bool;
    var i_3: u32 = 0u;
    var local_17: bool;
    var local_18: bool;
    var local_19: bool;
    var local_20: bool;
    var litSum: f32 = 0f;
    var i_4: u32 = 0u;
    var i_5: u32 = 0u;

    let _e3 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_6);
    let lightClip = (_e3 * vec4<f32>(worldPos_12, 1f));
    if !((lightClip.w > 0f)) {
        local_9 = (lightClip.w < 0f);
    } else {
        local_9 = true;
    }
    let _e18 = local_9;
    if !(_e18) {
        return 1f;
    }
    let projCoords = (lightClip.xyz / vec3(lightClip.w));
    let tileUv = vec2<f32>(((projCoords.x * 0.5f) + 0.5f), ((-(projCoords.y) * 0.5f) + 0.5f));
    if (tileUv.x >= 0f) {
        local_10 = (tileUv.x <= 1f);
    } else {
        local_10 = false;
    }
    let _e46 = local_10;
    if _e46 {
        local_11 = (tileUv.y >= 0f);
    } else {
        local_11 = false;
    }
    let _e53 = local_11;
    if _e53 {
        local_12 = (tileUv.y <= 1f);
    } else {
        local_12 = false;
    }
    let _e60 = local_12;
    if _e60 {
        local_13 = (projCoords.z >= 0f);
    } else {
        local_13 = false;
    }
    let _e67 = local_13;
    if _e67 {
        local_14 = (projCoords.z <= 1f);
    } else {
        local_14 = false;
    }
    let _e74 = local_14;
    if !(_e74) {
        return 1f;
    }
    let nDotL_10 = dot(normal_18, l_1);
    if (nDotL_10 >= -1f) {
        local_15 = (nDotL_10 <= 1f);
    } else {
        local_15 = false;
    }
    let _e87 = local_15;
    if !(_e87) {
        return 1f;
    }
    let shadowMapSize_1 = textureDimensions(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 0i);
    let _e94 = _atlasTileGridX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_4);
    let tileSize_2 = (shadowMapSize_1 / _e94);
    let tileOrigin_3 = (vec2<u32>((layer_6 % _e94.x), (layer_6 / _e94.x)) * tileSize_2);
    let baseTexel_1 = (vec2<i32>(tileOrigin_3) + vec2<i32>(floor((tileUv * vec2<f32>(tileSize_2)))));
    let _e108 = _pcssDiskRotationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(baseTexel_1, layer_6);
    let rawRadius = select(2f, 3f, (profile == 5u));
    let _e118 = _directionalReceiverDepthBiasX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_6, normal_18, l_1, (rawRadius + 1f));
    let biasedDepth = (projCoords.z - _e118);
    if (profile == 4u) {
        loop {
            let _e123 = i_2;
            if (_e123 < PCSS_MEDIUM_RAW_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) {
            } else {
                break;
            }
            {
                let _e126 = i_2;
                let _e127 = _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e126, _e108, rawRadius);
                let _e128 = _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize_1, tileOrigin_3, tileSize_2, baseTexel_1, _e127);
                let rawTexel = vec2<i32>(((_e128 * vec2<f32>(shadowMapSize_1)) - vec2(0.5f)));
                let _e136 = shadow_load_raw_depthX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, rawTexel);
                if (_e136 >= 0f) {
                    local_16 = (_e136 < biasedDepth);
                } else {
                    local_16 = false;
                }
                let _e143 = local_16;
                if _e143 {
                    let _e145 = blockerDepth;
                    blockerDepth = (_e145 + _e136);
                    let _e148 = blockerCount;
                    blockerCount = (_e148 + 1u);
                }
            }
            continuing {
                let _e151 = i_2;
                i_2 = (_e151 + 1u);
            }
        }
    } else {
        loop {
            let _e155 = i_3;
            if (_e155 < PCSS_HIGH_RAW_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) {
            } else {
                break;
            }
            {
                let _e158 = i_3;
                let _e159 = _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e158, _e108, rawRadius);
                let _e160 = _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize_1, tileOrigin_3, tileSize_2, baseTexel_1, _e159);
                let rawTexel_1 = vec2<i32>(((_e160 * vec2<f32>(shadowMapSize_1)) - vec2(0.5f)));
                let _e168 = shadow_load_raw_depthX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, rawTexel_1);
                if (_e168 >= 0f) {
                    local_17 = (_e168 < biasedDepth);
                } else {
                    local_17 = false;
                }
                let _e175 = local_17;
                if _e175 {
                    let _e176 = blockerDepth;
                    blockerDepth = (_e176 + _e168);
                    let _e178 = blockerCount;
                    blockerCount = (_e178 + 1u);
                }
            }
            continuing {
                let _e181 = i_3;
                i_3 = (_e181 + 1u);
            }
        }
    }
    let _e184 = blockerCount;
    if (_e184 == 0u) {
        return 1f;
    }
    let _e188 = blockerDepth;
    let _e189 = blockerCount;
    let averageBlockerDepth = (_e188 / f32(_e189));
    let _e196 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_6].z;
    let lightDepthWorldSpan = max(_e196, 0f);
    let _e203 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_6].y;
    let worldUnitsPerTexel = max(_e203, 0f);
    if (lightDepthWorldSpan > 0f) {
        local_18 = (worldUnitsPerTexel > 0f);
    } else {
        local_18 = false;
    }
    let _e213 = local_18;
    if _e213 {
        let _e217 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.y;
        local_19 = (_e217 >= 0f);
    } else {
        local_19 = false;
    }
    let _e223 = local_19;
    if _e223 {
        let _e227 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.z;
        local_20 = (_e227 >= 0f);
    } else {
        local_20 = false;
    }
    let _e233 = local_20;
    if !(_e233) {
        return 1f;
    }
    let worldDistance = (max(0f, (biasedDepth - averageBlockerDepth)) * lightDepthWorldSpan);
    let _e243 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.y;
    let _e250 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.z;
    let penumbraTexels = clamp(((worldDistance * tan(_e243)) / worldUnitsPerTexel), 0f, _e250);
    let compareRadius = max(0.5f, penumbraTexels);
    let _e258 = _directionalReceiverDepthBiasX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_6, normal_18, l_1, (compareRadius + 1.5f));
    let compareDepth = (projCoords.z - _e258);
    if (profile == 4u) {
        loop {
            let _e263 = i_4;
            if (_e263 < PCSS_MEDIUM_COMPARE_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) {
            } else {
                break;
            }
            {
                let _e266 = i_4;
                let _e267 = _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e266, _e108, compareRadius);
                let _e268 = _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize_1, tileOrigin_3, tileSize_2, baseTexel_1, _e267);
                let _e270 = litSum;
                let _e273 = shadow_sample_compareX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, _e268, compareDepth);
                litSum = (_e270 + _e273);
            }
            continuing {
                let _e275 = i_4;
                i_4 = (_e275 + 1u);
            }
        }
        let _e278 = litSum;
        return (_e278 / 16f);
    }
    loop {
        let _e282 = i_5;
        if (_e282 < PCSS_HIGH_COMPARE_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) {
        } else {
            break;
        }
        {
            let _e285 = i_5;
            let _e286 = _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e285, _e108, compareRadius);
            let _e287 = _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize_1, tileOrigin_3, tileSize_2, baseTexel_1, _e286);
            let _e288 = litSum;
            let _e291 = shadow_sample_compareX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, _e287, compareDepth);
            litSum = (_e288 + _e291);
        }
        continuing {
            let _e293 = i_5;
            i_5 = (_e293 + 1u);
        }
    }
    let _e296 = litSum;
    return (_e296 / 32f);
}

fn _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_13: vec3<f32>, layer_7: u32, count_5: u32, normal_19: vec3<f32>, l_2: vec3<f32>) -> f32 {
    var local_21: bool;
    var local_22: bool;
    var local_23: bool;
    var local_24: bool;
    var blocked_1: f32 = 0f;
    var local_25: bool;
    var x_2: i32 = -1i;
    var y_2: i32;
    var x_3: i32 = -2i;
    var y_3: i32;

    let _e4 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_7);
    let lightClip_1 = (_e4 * vec4<f32>(worldPos_13, 1f));
    let projCoords_1 = (lightClip_1.xyz / vec3(lightClip_1.w));
    let _e14 = _atlasTileScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_5);
    let _e15 = _atlasTileOriginX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_7, count_5);
    let tileUv_1 = vec2<f32>(((projCoords_1.x * 0.5f) + 0.5f), ((-(projCoords_1.y) * 0.5f) + 0.5f));
    let uv_3 = ((tileUv_1 * _e14) + _e15);
    let currentDepth = projCoords_1.z;
    if (tileUv_1.x >= 0f) {
        local_21 = (tileUv_1.x <= 1f);
    } else {
        local_21 = false;
    }
    let _e40 = local_21;
    if _e40 {
        local_22 = (tileUv_1.y >= 0f);
    } else {
        local_22 = false;
    }
    let _e47 = local_22;
    if _e47 {
        local_23 = (tileUv_1.y <= 1f);
    } else {
        local_23 = false;
    }
    let _e54 = local_23;
    if _e54 {
        local_24 = (currentDepth <= 1f);
    } else {
        local_24 = false;
    }
    let _e60 = local_24;
    if !(_e60) {
        return 1f;
    }
    let _e65 = textureDimensions(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 0i);
    let texelDims = vec2<f32>(_e65);
    let texel_5 = vec2<f32>((1f / texelDims.x), (1f / texelDims.y));
    let tileLo = (_e15 + texel_5);
    let tileHi = ((_e15 + _e14) - texel_5);
    let _e80 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.x;
    let filterProfile = clamp(u32(round(_e80)), 1u, 5u);
    if (filterProfile >= 4u) {
        let _e90 = _samplePcssForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_13, layer_7, count_5, normal_19, l_2, filterProfile);
        return _e90;
    }
    let kernel = select(select(3u, 5u, (filterProfile == 3u)), 1u, (filterProfile == 1u));
    let _e105 = _directionalReceiverDepthBiasX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_7, normal_19, l_2, f32(((kernel / 2u) + 1u)));
    let adjustedDepth_1 = (currentDepth - _e105);
    if (kernel == 1u) {
        let lit_1 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, clamp(uv_3, tileLo, tileHi), adjustedDepth_1);
        return lit_1;
    }
    if (kernel == 3u) {
        if all((uv_3 >= (tileLo + texel_5))) {
            local_25 = all((uv_3 <= (tileHi - texel_5)));
        } else {
            local_25 = false;
        }
        let interior = local_25;
        if interior {
            let pcfFraction = fract(((uv_3 / texel_5) - vec2(0.5f)));
            let loWeight = (vec2(2f) - pcfFraction);
            let hiWeight = (vec2(1f) + pcfFraction);
            let loOffset = ((vec2(-1f) - pcfFraction) + (vec2(1f) / loWeight));
            let hiOffset = ((vec2(1f) - pcfFraction) + (pcfFraction / hiWeight));
            let litLoLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_3 + (vec2<f32>(loOffset.x, loOffset.y) * texel_5)), adjustedDepth_1);
            let litHiLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_3 + (vec2<f32>(hiOffset.x, loOffset.y) * texel_5)), adjustedDepth_1);
            let litLoHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_3 + (vec2<f32>(loOffset.x, hiOffset.y) * texel_5)), adjustedDepth_1);
            let litHiHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_3 + (vec2<f32>(hiOffset.x, hiOffset.y) * texel_5)), adjustedDepth_1);
            return ((((((litLoLo * loWeight.x) * loWeight.y) + ((litHiLo * hiWeight.x) * loWeight.y)) + ((litLoHi * loWeight.x) * hiWeight.y)) + ((litHiHi * hiWeight.x) * hiWeight.y)) / 9f);
        }
        loop {
            let _e202 = x_2;
            if (_e202 <= 1i) {
            } else {
                break;
            }
            {
                y_2 = -1i;
                loop {
                    let _e207 = y_2;
                    if (_e207 <= 1i) {
                    } else {
                        break;
                    }
                    {
                        let _e210 = x_2;
                        let _e212 = y_2;
                        let offsetUv_1 = clamp((uv_3 + (vec2<f32>(f32(_e210), f32(_e212)) * texel_5)), tileLo, tileHi);
                        let lit_2 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv_1, adjustedDepth_1);
                        let _e222 = blocked_1;
                        blocked_1 = (_e222 + (1f - lit_2));
                    }
                    continuing {
                        let _e227 = y_2;
                        y_2 = (_e227 + 1i);
                    }
                }
            }
            continuing {
                let _e230 = x_2;
                x_2 = (_e230 + 1i);
            }
        }
        let _e232 = blocked_1;
        return (1f - (_e232 / 9f));
    }
    loop {
        let _e238 = x_3;
        if (_e238 <= 2i) {
        } else {
            break;
        }
        {
            y_3 = -2i;
            loop {
                let _e243 = y_3;
                if (_e243 <= 2i) {
                } else {
                    break;
                }
                {
                    let _e246 = x_3;
                    let _e248 = y_3;
                    let offsetUv_2 = clamp((uv_3 + (vec2<f32>(f32(_e246), f32(_e248)) * texel_5)), tileLo, tileHi);
                    let lit_3 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv_2, adjustedDepth_1);
                    let _e257 = blocked_1;
                    blocked_1 = (_e257 + (1f - lit_3));
                }
                continuing {
                    let _e262 = y_3;
                    y_3 = (_e262 + 1i);
                }
            }
        }
        continuing {
            let _e265 = x_3;
            x_3 = (_e265 + 1i);
        }
    }
    let _e267 = blocked_1;
    return (1f - (_e267 / 25f));
}

fn evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_20: vec3<f32>, worldPos_14: vec3<f32>, viewZ_1: f32) -> f32 {
    var shadow_2: f32;
    var local_26: bool;

    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeCount;
    if (_e2 < 1f) {
        return 1f;
    }
    let _e8 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let l_7 = normalize(-(_e8));
    let _e13 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeCount;
    let count_6 = u32(max(_e13, 1f));
    let viewDepth_1 = -(viewZ_1);
    let _e25 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[(count_6 - 1u)].x;
    if (viewDepth_1 > _e25) {
        return 1f;
    }
    let _e28 = _pickCascadeLayerX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(viewDepth_1, count_6);
    let _e33 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.normalBias;
    let receiverPosition = (worldPos_14 + (normal_20 * _e33));
    let _e36 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(receiverPosition, _e28, count_6, normal_20, l_7);
    shadow_2 = _e36;
    let _e40 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
    if (_e40 > 0f) {
        local_26 = ((_e28 + 1u) < count_6);
    } else {
        local_26 = false;
    }
    let _e49 = local_26;
    if _e49 {
        let spCurr = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[_e28].x;
        let _e57 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
        let blendWidth = (spCurr * _e57);
        if (blendWidth > 0f) {
            let dist = (spCurr - viewDepth_1);
            let t_1 = clamp((1f - (dist / blendWidth)), 0f, 1f);
            if (t_1 > 0f) {
                let _e72 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(receiverPosition, (_e28 + 1u), count_6, normal_20, l_7);
                shadow_2 = mix(_e36, _e72, t_1);
            }
        }
    }
    let _e74 = shadow_2;
    return _e74;
}

fn resolveStandardDeferred(in_2: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> DeferredOutput {
    var sh_1: array<vec4<f32>, 9>;
    var localBlend_1: f32 = 0f;
    var local_27: bool;
    var band_1: u32 = 0u;
    var screenAo: f32 = 1f;

    let pixel_1 = vec2<i32>(in_2.position.xy);
    let depth = textureLoad(sceneDepth, pixel_1, 0i);
    if (depth >= 1f) {
        discard;
    }
    let _e14 = textureLoad(lightingContext, pixel_1, 0i);
    let context = _e14.x;
    let _e21 = skylight.diffuseScale.w;
    if ((context >> 24u) != u32(_e21)) {
        discard;
    }
    let _e27 = textureDimensions(sceneDepth);
    let uv_4 = (in_2.position.xy / vec2<f32>(_e27));
    let ndc_3 = vec3<f32>(((uv_4 * vec2<f32>(2f, -2f)) + vec2<f32>(-1f, 1f)), depth);
    let _e41 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.inverseViewProj;
    let homogeneous = (_e41 * vec4<f32>(ndc_3, 1f));
    let position = (homogeneous.xyz / vec3(homogeneous.w));
    let _e50 = loadStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(normalRoughness, pixel_1);
    let normal_21 = _e50.xyz;
    let roughness_9 = _e50.w;
    let _e55 = textureLoad(albedoMetallic, pixel_1, 0i);
    let _e57 = decodeStandardReflectanceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(_e55.x);
    let _e60 = textureLoad(f0Occlusion, pixel_1, 0i);
    let _e62 = decodeStandardReflectanceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(_e60.x);
    let _e65 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let direction_5 = normalize((_e65 - position));
    let probeRow = (context & 16777215u);
    let base_1 = (probeRow * 16u);
    if (probeRow > 0u) {
        local_27 = ((base_1 + 9u) < arrayLength((&probeBlendRecords)));
    } else {
        local_27 = false;
    }
    let _e82 = local_27;
    if _e82 {
        let header = probeBlendRecords[base_1];
        if ((u32(header.x) + 1u) == probeRow) {
            localBlend_1 = header.z;
            loop {
                let _e94 = band_1;
                if (_e94 < 9u) {
                } else {
                    break;
                }
                {
                    let _e98 = band_1;
                    let _e103 = band_1;
                    let _e106 = probeBlendRecords[((base_1 + 1u) + _e103)];
                    sh_1[_e98] = _e106;
                }
                continuing {
                    let _e107 = band_1;
                    band_1 = (_e107 + 1u);
                }
            }
        }
    }
    let _e114 = skylight;
    let _e115 = sh_1;
    let _e116 = localBlend_1;
    let _e123 = evaluateStandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(position, normal_21, direction_5, _e57.xyz, _e57.w, roughness_9, _e62.xyz, _e114, irradianceMap_2, linearSampler, prefilterMap_2, linearSampler, brdfLut_4, skylightPrefilterMap_1, _e115, _e116);
    let _e126 = params.x;
    if (_e126 > 0f) {
        let _e132 = textureSampleLevel(screenOcclusion, linearSampler, uv_4, 0f);
        let _e139 = params.x;
        screenAo = pow(clamp(_e132.x, 0f, 1f), _e139);
    }
    let _e143 = screenAo;
    let ao = (_e62.w * _e143);
    let _e147 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    let _e153 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e154 = sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX((_e147 * vec4<f32>(position, 1f)), _e153);
    let _e155 = evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_21, position, _e154);
    let _e160 = evaluateStandardDirectX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(position, ndc_3, _e154, normal_21, direction_5, _e57.xyz, _e57.w, (roughness_9 * roughness_9), _e62.xyz, _e155);
    return DeferredOutput(vec4<f32>((((_e123.diffuse + _e123.specular) * ao) + _e160), 0f), vec4<f32>((_e123.specular * ao), 1f), vec4<f32>((_e123.response * _e62.w), _e62.w));
}

@vertex 
fn vs_standard_deferred(@builtin(vertex_index) index: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(index);
    return _e1;
}

@fragment 
fn fs_standard_deferred(in: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    let _e1 = resolveStandardDeferred(in);
    return _e1.color;
}

@fragment 
fn fs_standard_deferred_reflections(in_1: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> DeferredOutput {
    let _e1 = resolveStandardDeferred(in_1);
    return _e1;
}
