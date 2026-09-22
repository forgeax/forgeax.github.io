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
const PROJECTOR_FLAGX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX: u32 = 1073741824u;
const KIND_POINTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: u32 = 0u;
const KIND_SPOTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: u32 = 1u;
const PROJECTOR_FLAGX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: i32 = 1073741824i;
const TILE_MASKX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: i32 = 1073741823i;
const KIND_RECT_AREAX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: u32 = 2u;

@group(0) @binding(16) 
var cloudShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX: texture_2d<f32>;
@group(0) @binding(17) 
var cloudShadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX: sampler;
@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(3) 
var shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_depth_2d;
@group(0) @binding(4) 
var shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: sampler_comparison;
@group(0) @binding(9) 
var spotModifierSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: sampler;
@group(0) @binding(11) 
var iesProfileTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_2d_array<f32>;
@group(0) @binding(12) 
var cookieTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_2d_array<f32>;
@group(0) @binding(15) 
var<uniform> cookieMatricesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<mat4x4<f32>, 32>;
@group(0) @binding(8) 
var spotShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_depth_2d;
@group(0) @binding(13) 
var ltcLambertTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_2d<f32>;
@group(0) @binding(14) 
var ltcGgxTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_2d<f32>;
@group(2) @binding(6) 
var<uniform> cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: ClusterUniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX;
@group(2) @binding(4) 
var<storage> cluster_gridX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: array<u32>;
@group(2) @binding(5) 
var<storage> light_index_listX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: array<u32>;
@group(2) @binding(3) 
var<storage> light_dataX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: array<DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX, 256>;
@group(1) @binding(0) 
var normalRoughness: texture_2d<f32>;
@group(1) @binding(1) 
var albedoMetallic: texture_2d<u32>;
@group(1) @binding(2) 
var f0Occlusion: texture_2d<f32>;
@group(1) @binding(3) 
var emissiveOpacity: texture_2d<f32>;
@group(1) @binding(4) 
var lightingContext: texture_2d<u32>;
@group(1) @binding(5) 
var sceneDepth: texture_depth_2d;
@group(1) @binding(6) 
var screenOcclusion: texture_2d<f32>;
@group(1) @binding(7) 
var linearSampler: sampler;
@group(1) @binding(8) 
var<uniform> params: vec4<f32>;
@group(1) @binding(9) 
var irradianceMap_2: texture_cube<f32>;
@group(1) @binding(10) 
var prefilterMap_2: texture_cube<f32>;
@group(1) @binding(11) 
var brdfLut_4: texture_2d<f32>;
@group(1) @binding(12) 
var skylightPrefilterMap_1: texture_cube<f32>;
@group(1) @binding(13) 
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
    let local_31 = (_e55 * probeIntensity);
    let _e58 = sky;
    return mix(_e58, local_31, weight);
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
    let local_32 = (max(_e2, vec3(0f)) * PROBE_INV_PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX);
    let skyResidualFraction = (1f - localBlendFraction);
    return ((((local_32 + (skyResidualFraction * e_sky)) * k_d) * albedo) * (1f - metallic));
}

fn cloud_direct_solar_factorX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX(worldPosition_2: vec3<f32>, shadowOrigin: vec3<f32>, shadowRight: vec3<f32>, shadowUp: vec3<f32>, shadowProjection: vec4<f32>) -> f32 {
    var local: bool;
    var local_1: bool;
    var local_2: bool;
    var local_3: bool;
    var local_4: bool;
    var local_5: bool;
    var local_6: bool;
    var local_7: bool;

    if (worldPosition_2.x == worldPosition_2.x) {
        local = (worldPosition_2.y == worldPosition_2.y);
    } else {
        local = false;
    }
    let _e10 = local;
    if _e10 {
        local_1 = (worldPosition_2.z == worldPosition_2.z);
    } else {
        local_1 = false;
    }
    let _e17 = local_1;
    if _e17 {
        local_2 = all((abs(worldPosition_2) < vec3(3.402823e38f)));
    } else {
        local_2 = false;
    }
    let validReceiver = local_2;
    let offset = (worldPosition_2 - shadowOrigin);
    let uv_1 = ((vec2<f32>(dot(offset, shadowRight), dot(offset, shadowUp)) / vec2(max(shadowProjection.x, 0.000001f))) + vec2(0.5f));
    if all((uv_1 >= vec2(0f))) {
        local_3 = all((uv_1 <= vec2(1f)));
    } else {
        local_3 = false;
    }
    let inRange = local_3;
    if (shadowProjection.y > 0.5f) {
        local_4 = (shadowProjection.z < 0.5f);
    } else {
        local_4 = false;
    }
    let _e64 = local_4;
    if _e64 {
        local_5 = (shadowProjection.x > 0f);
    } else {
        local_5 = false;
    }
    let available = local_5;
    let _e80 = textureSampleLevel(cloudShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX, cloudShadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX, clamp(uv_1, vec2(0f), vec2(1f)), 0f);
    let sampled = _e80.x;
    if validReceiver {
        local_6 = inRange;
    } else {
        local_6 = false;
    }
    let _e88 = local_6;
    if _e88 {
        local_7 = available;
    } else {
        local_7 = false;
    }
    let _e92 = local_7;
    return select(1f, clamp(sampled, 0f, 1f), _e92);
}

fn cloud_apply_direct_solarX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX(radiance_1: vec3<f32>, worldPosition_3: vec3<f32>, shadowOrigin_1: vec3<f32>, shadowRight_1: vec3<f32>, shadowUp_1: vec3<f32>, shadowProjection_1: vec4<f32>) -> vec3<f32> {
    let _e5 = cloud_direct_solar_factorX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX(worldPosition_3, shadowOrigin_1, shadowRight_1, shadowUp_1, shadowProjection_1);
    return (radiance_1 * _e5);
}

fn d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH: f32, a: f32) -> f32 {
    let a2_ = (a * a);
    let f_1 = ((((nDotH * a2_) - nDotH) * nDotH) + 1f);
    return (a2_ / ((3.1415927f * f_1) * f_1));
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
    let l_2 = normalize(-(_e2));
    let halfVector = (viewDir + l_2);
    let halfVectorLengthSquared = max(dot(halfVector, halfVector), 0.00000001f);
    let h = (halfVector * inverseSqrt(halfVectorLengthSquared));
    let nDotL_3 = max(dot(normal_6, l_2), 0f);
    let nDotV_2 = max(dot(normal_6, viewDir), 0.00001f);
    let nDotH_1 = max(dot(normal_6, h), 0f);
    let vDotH_1 = max(dot(viewDir, h), 0f);
    let _e26 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH_1, F0_5);
    let roughness_8 = sqrt(max(alphaSq, 0f));
    let _e31 = threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_8, nDotV_2, nDotL_3, F0_5);
    let _e32 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_1, alphaSq);
    let _e33 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_2, nDotL_3, alphaSq);
    let specular_1 = (((_e32 * _e33) * _e26) + _e31);
    let diffuse_1 = (((1f - metallic_1) * baseColor) / vec3(3.1415927f));
    let _e48 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightColor;
    return (((diffuse_1 + specular_1) * _e48) * nDotL_3);
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

fn spotModifierProductX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX(brdf: f32, range: f32, cone: f32, ies: f32, cookie: f32, shadow: f32) -> f32 {
    return (((((brdf * range) * cone) * ies) * cookie) * shadow);
}

fn sample_shadow_2d_kernelX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMap: texture_depth_2d, shadowSampler: sampler_comparison, uv: vec2<f32>, texel: vec2<f32>, depthRef: f32, normalBias: f32, depthBias: f32, nDotL_2: f32, kernelSize: f32) -> f32 {
    var blocked: f32 = 0f;
    var samples: f32 = 0f;
    var y: i32 = -2i;
    var x: i32;
    var local_8: bool;

    let bias = max((normalBias * (1f - nDotL_2)), (depthBias / 1000f));
    let adjustedDepth = (depthRef - bias);
    let halfWidth_4 = clamp(((i32(round(kernelSize)) - 1i) / 2i), 0i, 2i);
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
                    if (abs(_e32) <= halfWidth_4) {
                        let _e35 = y;
                        local_8 = (abs(_e35) <= halfWidth_4);
                    } else {
                        local_8 = false;
                    }
                    let _e41 = local_8;
                    if _e41 {
                        let _e44 = x;
                        let _e46 = y;
                        let offsetUv = (uv + (vec2<f32>(f32(_e44), f32(_e46)) * texel));
                        let lit = textureSampleCompareLevel(shadowMap, shadowSampler, offsetUv, adjustedDepth);
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

fn evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_1: vec3<f32>, colorTimesIntensity: vec3<f32>, invRangeSquared_2: f32, worldPos_2: vec3<f32>, normal_7: vec3<f32>, viewDir_1: vec3<f32>, baseColor_1: vec3<f32>, metallic_2: f32, alphaSq_1: f32, F0_6: vec3<f32>) -> vec3<f32> {
    let toLight_1 = (lightPos_1 - worldPos_2);
    let dSquared_3 = max(dot(toLight_1, toLight_1), 0.0001f);
    let l_3 = (toLight_1 / vec3(sqrt(dSquared_3)));
    let h_1 = normalize((viewDir_1 + l_3));
    let nDotL_4 = max(dot(normal_7, l_3), 0f);
    let nDotV_3 = max(dot(normal_7, viewDir_1), 0.00001f);
    let nDotH_2 = max(dot(normal_7, h_1), 0f);
    let vDotH_2 = max(dot(viewDir_1, h_1), 0f);
    let _e26 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH_2, F0_6);
    let roughness_9 = sqrt(max(alphaSq_1, 0f));
    let _e31 = threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_9, nDotV_3, nDotL_4, F0_6);
    let _e32 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_2, alphaSq_1);
    let _e33 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_3, nDotL_4, alphaSq_1);
    let specular_2 = (((_e32 * _e33) * _e26) + _e31);
    let diffuse_2 = (((1f - metallic_2) * baseColor_1) / vec3(3.1415927f));
    let _e46 = evalDistanceAttenuationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(dSquared_3, invRangeSquared_2);
    return ((((diffuse_2 + specular_2) * colorTimesIntensity) * nDotL_4) * _e46);
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
    let l_4 = (toLight_3 / vec3(sqrt(dSquared_5)));
    let cone_2 = smoothstep(cosOuter_1, cosInner_1, dot(l_4, -(lightDir_1)));
    let _e18 = evalPointFlatX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_4, colorTimesIntensity_3, invRangeSquared_6, worldPos_5, baseColor_4);
    return (_e18 * cone_2);
}

fn evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_5: vec3<f32>, lightDir_2: vec3<f32>, colorTimesIntensity_4: vec3<f32>, cosInner_2: f32, cosOuter_2: f32, invRangeSquared_7: f32, worldPos_6: vec3<f32>, normal_9: vec3<f32>, viewDir_3: vec3<f32>, baseColor_5: vec3<f32>, metallic_4: f32, alphaSq_3: f32, F0_8: vec3<f32>) -> vec3<f32> {
    let _e10 = evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_5, colorTimesIntensity_4, invRangeSquared_7, worldPos_6, normal_9, viewDir_3, baseColor_5, metallic_4, alphaSq_3, F0_8);
    let toLight_4 = (lightPos_5 - worldPos_6);
    let l_5 = normalize(toLight_4);
    let cone_3 = smoothstep(cosOuter_2, cosInner_2, dot(l_5, -(lightDir_2)));
    let _e24 = spotModifierProductX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX(1f, 1f, cone_3, 1f, 1f, 1f);
    return (_e10 * _e24);
}

fn evalSpotShadowedX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_6: vec3<f32>, lightDir_3: vec3<f32>, colorTimesIntensity_5: vec3<f32>, cosInner_3: f32, cosOuter_3: f32, invRangeSquared_8: f32, worldPos_7: vec3<f32>, normal_10: vec3<f32>, viewDir_4: vec3<f32>, baseColor_6: vec3<f32>, metallic_5: f32, alphaSq_4: f32, F0_9: vec3<f32>, lightViewProj_1: mat4x4<f32>, shadowAtlasTile: i32, depthBias_1: f32, normalBias_1: f32, pcfKernelSize: f32, shadowIntensity: f32) -> vec3<f32> {
    var local_9: bool;
    var local_10: bool;
    var local_11: bool;
    var local_12: bool;

    let _e13 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_6, lightDir_3, colorTimesIntensity_5, cosInner_3, cosOuter_3, invRangeSquared_8, worldPos_7, normal_10, viewDir_4, baseColor_6, metallic_5, alphaSq_4, F0_9);
    let splane = (lightViewProj_1 * vec4<f32>(worldPos_7, 1f));
    let invW_1 = select((1f / splane.w), 0f, (abs(splane.w) < 0.000001f));
    let _e27 = projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(lightViewProj_1, worldPos_7);
    let depthRef_1 = (splane.z * invW_1);
    if (_e27.x >= 0f) {
        local_9 = (_e27.x <= 1f);
    } else {
        local_9 = false;
    }
    let _e39 = local_9;
    if _e39 {
        local_10 = (_e27.y >= 0f);
    } else {
        local_10 = false;
    }
    let _e46 = local_10;
    if _e46 {
        local_11 = (_e27.y <= 1f);
    } else {
        local_11 = false;
    }
    let _e53 = local_11;
    if _e53 {
        local_12 = (depthRef_1 <= 1f);
    } else {
        local_12 = false;
    }
    let _e59 = local_12;
    if !(_e59) {
        return _e13;
    }
    let col = f32((shadowAtlasTile % 2i));
    let row = f32((shadowAtlasTile / 2i));
    let tileOrigin = (vec2<f32>(col, row) * 0.5f);
    let atlasUv = ((_e27 * 0.5f) + tileOrigin);
    let _e76 = textureDimensions(spotShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 0i);
    let atlasDims = vec2<f32>(_e76);
    let texel_1 = (vec2<f32>(1f, 1f) / atlasDims);
    let nDotL_5 = max(dot(normal_10, normalize((lightPos_6 - worldPos_7))), 0f);
    let _e92 = sample_shadow_2d_kernelX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(spotShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, atlasUv, texel_1, depthRef_1, normalBias_1, depthBias_1, nDotL_5, pcfKernelSize);
    return (_e13 * mix(1f, _e92, clamp(shadowIntensity, 0f, 1f)));
}

fn spotModifierFactorsX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX(lightPos_7: vec3<f32>, lightDir_4: vec3<f32>, cosOuter_4: f32, worldPos_8: vec3<f32>, rollDeg: f32, metadata: vec4<u32>) -> vec4<f32> {
    var ies_1: f32 = 1f;
    var cookie_1: vec3<f32> = vec3(1f);
    var referenceUp: vec3<f32> = vec3<f32>(0f, 1f, 0f);
    var local_13: bool;
    var local_14: bool;
    var local_15: bool;
    var local_16: bool;
    var local_17: bool;

    let toSurface = (worldPos_8 - lightPos_7);
    let distanceToSurface = length(toSurface);
    if (distanceToSurface <= 0.000001f) {
        let _e12 = ies_1;
        let _e13 = cookie_1;
        return vec4<f32>(_e12, _e13);
    }
    let outgoing = (toSurface / vec3(distanceToSurface));
    let forward = normalize(lightDir_4);
    if (abs(forward.y) > 0.999f) {
        referenceUp = vec3<f32>(0f, 0f, 1f);
    }
    let _e28 = referenceUp;
    let right = normalize(cross(forward, _e28));
    let up = normalize(cross(right, forward));
    let localX = dot(outgoing, right);
    let localY = dot(outgoing, up);
    let depth = dot(outgoing, forward);
    let roll = (rollDeg * 0.017453292f);
    let rolledX = ((localX * cos(roll)) - (localY * sin(roll)));
    let rolledY = ((localX * sin(roll)) + (localY * cos(roll)));
    if (metadata.z != 4294967295u) {
        let azimuth = ((atan2(rolledY, rolledX) + 6.2831855f) % 6.2831855f);
        let elevation = (acos(clamp(depth, -1f, 1f)) / 3.1415927f);
        let iesUv = vec2<f32>((azimuth / 6.2831855f), elevation);
        let _e71 = textureSampleLevel(iesProfileTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, spotModifierSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, iesUv, metadata.z, 0f);
        ies_1 = max(_e71.x, 0f);
    }
    if (metadata.w != 4294967295u) {
        if !((metadata.y == 4294967295u)) {
            local_14 = ((metadata.y & PROJECTOR_FLAGX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX) == 0u);
        } else {
            local_14 = true;
        }
        let _e90 = local_14;
        local_13 = _e90;
    } else {
        local_13 = false;
    }
    let _e94 = local_13;
    if _e94 {
        if (depth <= 0f) {
            cookie_1 = vec3(0f);
        } else {
            let sinOuter = sqrt(max((1f - (cosOuter_4 * cosOuter_4)), 0f));
            let tanOuter = (sinOuter / max(cosOuter_4, 0.0001f));
            let _e112 = cookieMatricesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[metadata.w];
            let matrixPlane = (_e112 * vec4<f32>((rolledX / depth), (rolledY / depth), 0f, 1f));
            let cookieUv = (vec2(0.5f) + ((matrixPlane.xy / vec2(tanOuter)) * 0.5f));
            if !((cookieUv.x < 0f)) {
                local_15 = (cookieUv.x > 1f);
            } else {
                local_15 = true;
            }
            let _e137 = local_15;
            if !(_e137) {
                local_16 = (cookieUv.y < 0f);
            } else {
                local_16 = true;
            }
            let _e145 = local_16;
            if !(_e145) {
                local_17 = (cookieUv.y > 1f);
            } else {
                local_17 = true;
            }
            let _e153 = local_17;
            if _e153 {
                cookie_1 = vec3(0f);
            } else {
                let cookieSample = textureSampleLevel(cookieTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, spotModifierSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, cookieUv, metadata.w, 0f);
                cookie_1 = max((cookieSample.xyz * cookieSample.w), vec3(0f));
            }
        }
    }
    let _e167 = ies_1;
    let _e168 = cookie_1;
    return vec4<f32>(_e167, _e168);
}

fn sampleStandardSpotProjectorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPXA4TPNJSWG5DPOIX(lightViewProj_2: mat4x4<f32>, world_pos: vec3<f32>, metadata_1: vec4<u32>) -> vec3<f32> {
    var local_18: bool;
    var local_19: bool;
    var local_20: bool;

    let _e2 = projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(lightViewProj_2, world_pos);
    if (_e2.x >= 0f) {
        local_18 = (_e2.x <= 1f);
    } else {
        local_18 = false;
    }
    let _e12 = local_18;
    if _e12 {
        local_19 = (_e2.y >= 0f);
    } else {
        local_19 = false;
    }
    let _e19 = local_19;
    if _e19 {
        local_20 = (_e2.y <= 1f);
    } else {
        local_20 = false;
    }
    let _e26 = local_20;
    if !(_e26) {
        return vec3(1f);
    }
    if (metadata_1.w == 4294967295u) {
        return vec3(1f);
    }
    let _e40 = textureSampleLevel(cookieTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, spotModifierSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, _e2, metadata_1.w, 0f);
    return _e40.xyz;
}

fn ltcUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(n: vec3<f32>, v: vec3<f32>, roughness_6: f32) -> vec2<f32> {
    let nDotV_4 = clamp(dot(n, v), 0f, 1f);
    return ((vec2<f32>(clamp(roughness_6, 0f, 1f), sqrt((1f - nDotV_4))) * 0.984375f) + vec2(0.0078125f));
}

fn ltcEdgeVectorFormFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(v1_: vec3<f32>, v2_: vec3<f32>) -> vec3<f32> {
    let x_5 = clamp(dot(v1_, v2_), -1f, 1f);
    let y_5 = abs(x_5);
    let a_2 = (0.8543985f + ((0.4965155f + (0.0145206f * y_5)) * y_5));
    let b = (3.417594f + ((4.1616726f + y_5) * y_5));
    let rational = (a_2 / b);
    let thetaOverSinTheta = select(((0.5f * inverseSqrt(max((1f - (x_5 * x_5)), 0.0000001f))) - rational), rational, (x_5 > 0f));
    return (cross(v1_, v2_) * thetaOverSinTheta);
}

fn ltcClippedSphereFormFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(f: vec3<f32>) -> f32 {
    let magnitude = length(f);
    return max((((magnitude * magnitude) + f.z) / (magnitude + 1f)), 0f);
}

fn ltcEvaluateX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(n_1: vec3<f32>, v_1: vec3<f32>, worldPos_9: vec3<f32>, mInv: mat3x3<f32>, lightPos_8: vec3<f32>, axisX: vec3<f32>, axisY: vec3<f32>, halfWidth: f32, halfHeight: f32) -> f32 {
    var tangent: vec3<f32> = vec3<f32>(1f, 0f, 0f);

    let halfX = (axisX * halfWidth);
    let halfY = (axisY * halfHeight);
    let rect0_ = ((lightPos_8 - halfX) - halfY);
    let rect1_ = ((lightPos_8 + halfX) - halfY);
    let rect2_ = ((lightPos_8 + halfX) + halfY);
    let rect3_ = ((lightPos_8 - halfX) + halfY);
    let lightNormal = cross((rect1_ - rect0_), (rect3_ - rect0_));
    if (dot(lightNormal, (worldPos_9 - rect0_)) <= 0f) {
        return 0f;
    }
    let tangentCandidate = (v_1 - (n_1 * dot(v_1, n_1)));
    let tangentLengthSquared = dot(tangentCandidate, tangentCandidate);
    if (tangentLengthSquared > 0.0000001f) {
        tangent = (tangentCandidate * inverseSqrt(tangentLengthSquared));
    } else {
        let fallback = select(vec3<f32>(0f, 1f, 0f), vec3<f32>(1f, 0f, 0f), (abs(n_1.x) < 0.9f));
        tangent = normalize(cross(fallback, n_1));
    }
    let _e53 = tangent;
    let bitangent = -(cross(n_1, _e53));
    let _e57 = tangent;
    let transform = (mInv * transpose(mat3x3<f32>(_e57, bitangent, n_1)));
    let c0_ = normalize((transform * (rect0_ - worldPos_9)));
    let c1_ = normalize((transform * (rect1_ - worldPos_9)));
    let c2_ = normalize((transform * (rect2_ - worldPos_9)));
    let c3_ = normalize((transform * (rect3_ - worldPos_9)));
    let _e73 = ltcEdgeVectorFormFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(c0_, c1_);
    let _e74 = ltcEdgeVectorFormFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(c1_, c2_);
    let _e76 = ltcEdgeVectorFormFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(c2_, c3_);
    let _e78 = ltcEdgeVectorFormFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(c3_, c0_);
    let vectorFormFactor = (((_e73 + _e74) + _e76) + _e78);
    let _e80 = ltcClippedSphereFormFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(vectorFormFactor);
    return _e80;
}

fn rectAreaRangeFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(lightPos_9: vec3<f32>, worldPos_10: vec3<f32>, invRangeSquared_9: f32) -> f32 {
    let toLight_5 = (lightPos_9 - worldPos_10);
    let distanceSquared = dot(toLight_5, toLight_5);
    let rangeTerm = (distanceSquared * invRangeSquared_9);
    let factor_1 = clamp((1f - (rangeTerm * rangeTerm)), 0f, 1f);
    return (factor_1 * factor_1);
}

fn evalRectAreaLtcDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(lightPos_10: vec3<f32>, lightColor: vec3<f32>, axisX_1: vec3<f32>, axisY_1: vec3<f32>, halfWidth_1: f32, halfHeight_1: f32, invRangeSquared_10: f32, worldPos_11: vec3<f32>, n_2: vec3<f32>, v_2: vec3<f32>, baseColor_7: vec3<f32>, metallic_6: f32, alphaSq_5: f32, F0_10: vec3<f32>) -> vec3<f32> {
    let identity = mat3x3<f32>(vec3<f32>(1f, 0f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 0f, 1f));
    let _e21 = ltcEvaluateX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(n_2, v_2, worldPos_11, identity, lightPos_10, axisX_1, axisY_1, halfWidth_1, halfHeight_1);
    let diffuse_3 = (baseColor_7 * (1f - metallic_6));
    let _e31 = rectAreaRangeFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(lightPos_10, worldPos_11, invRangeSquared_10);
    return (((lightColor * diffuse_3) * _e21) * _e31);
}

fn evalRectAreaLtcStandardX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(lightPos_11: vec3<f32>, lightColor_1: vec3<f32>, axisX_2: vec3<f32>, axisY_2: vec3<f32>, halfWidth_2: f32, halfHeight_2: f32, invRangeSquared_11: f32, worldPos_12: vec3<f32>, n_3: vec3<f32>, v_3: vec3<f32>, baseColor_8: vec3<f32>, metallic_7: f32, alphaSq_6: f32, F0_11: vec3<f32>) -> vec3<f32> {
    let _e6 = ltcUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(n_3, v_3, sqrt(max(alphaSq_6, 0f)));
    let matrixSample = textureSampleLevel(ltcLambertTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, spotModifierSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, _e6, 0f);
    let fresnelSample = textureSampleLevel(ltcGgxTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, spotModifierSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, _e6, 0f);
    let mInv_1 = mat3x3<f32>(vec3<f32>(matrixSample.x, 0f, matrixSample.y), vec3<f32>(0f, 1f, 0f), vec3<f32>(matrixSample.z, 0f, matrixSample.w));
    let fresnel_1 = ((F0_11 * fresnelSample.x) + ((vec3(1f) - F0_11) * fresnelSample.y));
    let _e43 = ltcEvaluateX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(n_3, v_3, worldPos_12, mInv_1, lightPos_11, axisX_2, axisY_2, halfWidth_2, halfHeight_2);
    let _e48 = evalRectAreaLtcDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(lightPos_11, lightColor_1, axisX_2, axisY_2, halfWidth_2, halfHeight_2, invRangeSquared_11, worldPos_12, n_3, v_3, baseColor_8, metallic_7, alphaSq_6, F0_11);
    let _e51 = rectAreaRangeFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(lightPos_11, worldPos_12, invRangeSquared_11);
    return (_e48 + (((lightColor_1 * fresnel_1) * _e43) * _e51));
}

fn evalRectAreaLtcGgxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(lightPos_12: vec3<f32>, lightColor_2: vec3<f32>, axisX_3: vec3<f32>, axisY_3: vec3<f32>, halfWidth_3: f32, halfHeight_3: f32, invRangeSquared_12: f32, worldPos_13: vec3<f32>, n_4: vec3<f32>, v_4: vec3<f32>, baseColor_9: vec3<f32>, metallic_8: f32, alphaSq_7: f32, F0_12: vec3<f32>) -> vec3<f32> {
    let _e14 = evalRectAreaLtcStandardX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(lightPos_12, lightColor_2, axisX_3, axisY_3, halfWidth_3, halfHeight_3, invRangeSquared_12, worldPos_13, n_4, v_4, baseColor_9, metallic_8, alphaSq_7, F0_12);
    return _e14;
}

fn view_z_to_z_sliceX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(view_z: f32, grid_z: u32, near: f32, far: f32, log_far_over_near: f32) -> u32 {
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

fn ndc_position_to_clusterX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(ndc: vec3<f32>, view_z_1: f32, grid_x: u32, grid_y: u32, grid_z_1: u32, near_1: f32, far_1: f32, log_far: f32) -> vec3<u32> {
    let cx = clamp(u32(floor((((ndc.x * 0.5f) + 0.5f) * f32(grid_x)))), 0u, (grid_x - 1u));
    let cy = clamp(u32(floor((((ndc.y * 0.5f) + 0.5f) * f32(grid_y)))), 0u, (grid_y - 1u));
    let _e34 = view_z_to_z_sliceX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(view_z_1, grid_z_1, near_1, far_1, log_far);
    return vec3<u32>(cx, cy, _e34);
}

fn evaluate_cluster_lightX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(light: DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX, world_pos_1: vec3<f32>, normal_11: vec3<f32>, view_dir: vec3<f32>, base_color: vec3<f32>, metallic_9: f32, alpha_sq: f32, f0_1: vec3<f32>, flat_2d: bool, receive_shadows: bool) -> vec3<f32> {
    var projector_selected: bool = false;
    var tile: i32;
    var local_21: bool;
    var local_22: bool;

    let kind = light.metadata.x;
    if (kind == KIND_POINTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) {
        if flat_2d {
            let _e15 = evalPointFlatX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.colorTimesIntensity.xyz, light.position.w, world_pos_1, base_color);
            return _e15;
        }
        let _e27 = evalPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.colorTimesIntensity.xyz, light.position.w, world_pos_1, normal_11, view_dir, base_color, metallic_9, alpha_sq, f0_1);
        return _e27;
    }
    if (kind == KIND_SPOTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) {
        if flat_2d {
            let _e42 = evalSpotFlatX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.direction.xyz, light.colorTimesIntensity.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos_1, base_color);
            return _e42;
        }
        let _e52 = spotModifierFactorsX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX(light.position.xyz, light.direction.xyz, light.direction.w, world_pos_1, light.auxiliary.w, light.metadata);
        let modifier = (vec3(_e52.x) * _e52.yzw);
        let encoded_tile = bitcast<i32>(light.metadata.y);
        tile = encoded_tile;
        if (encoded_tile >= 0i) {
            local_21 = ((encoded_tile & PROJECTOR_FLAGX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) != 0i);
        } else {
            local_21 = false;
        }
        let _e70 = local_21;
        if _e70 {
            projector_selected = true;
            tile = (encoded_tile & TILE_MASKX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX);
        }
        let _e75 = tile;
        if (_e75 >= 0i) {
            let _e78 = tile;
            local_22 = (_e78 < 4i);
        } else {
            local_22 = false;
        }
        let _e84 = local_22;
        if _e84 {
            let _e99 = tile;
            let _e101 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj[_e99];
            let _e102 = tile;
            let _e110 = evalSpotShadowedX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.direction.xyz, light.colorTimesIntensity.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos_1, normal_11, view_dir, base_color, metallic_9, alpha_sq, f0_1, _e101, _e102, 0.005f, 0.05f, 3f, select(0f, 1f, receive_shadows));
            let _e116 = tile;
            let _e118 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj[_e116];
            let _e120 = sampleStandardSpotProjectorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPXA4TPNJSWG5DPOIX(_e118, world_pos_1, light.metadata);
            let _e121 = projector_selected;
            return ((_e110 * modifier) * select(vec3(1f), _e120, _e121));
        }
        let _e136 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.direction.xyz, light.colorTimesIntensity.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos_1, normal_11, view_dir, base_color, metallic_9, alpha_sq, f0_1);
        return (_e136 * modifier);
    }
    if (kind == KIND_RECT_AREAX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) {
        let _e154 = evalRectAreaLtcGgxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(light.position.xyz, light.colorTimesIntensity.xyz, light.auxiliary.xyz, light.direction.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos_1, normal_11, view_dir, base_color, metallic_9, alpha_sq, f0_1);
        return _e154;
    }
    return vec3(0f);
}

fn evaluateStandardClusterLightsX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(ndc_1: vec3<f32>, view_z_2: f32, world_pos_2: vec3<f32>, normal_12: vec3<f32>, view_dir_1: vec3<f32>, base_color_1: vec3<f32>, metallic_10: f32, alpha_sq_1: f32, f0_2: vec3<f32>, flat_2d_1: bool, receive_shadows_1: bool) -> vec3<f32> {
    var total_radiance: vec3<f32> = vec3(0f);
    var i: u32 = 0u;

    let gx = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX.grid.x;
    let gy = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX.grid.y;
    let gz = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX.grid.z;
    let near_2 = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX.near_far_log.x;
    let far_2 = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX.near_far_log.y;
    let log_far_1 = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX.near_far_log.z;
    let _e29 = ndc_position_to_clusterX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(ndc_1, view_z_2, gx, gy, gz, near_2, far_2, log_far_1);
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
            let _e70 = evaluate_cluster_lightX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(light_1, world_pos_2, normal_12, view_dir_1, base_color_1, metallic_10, alpha_sq_1, f0_2, flat_2d_1, receive_shadows_1);
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

fn evaluateStandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(worldPosition_4: vec3<f32>, normal_13: vec3<f32>, direction_2: vec3<f32>, albedo_1: vec3<f32>, metallic_11: f32, roughness_7: f32, f0_3: vec3<f32>, sky_1: SkylightUniformsX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX, irradianceMap_1: texture_cube<f32>, irradianceSampler_1: sampler, prefilterMap_1: texture_cube<f32>, prefilterSampler_1: sampler, brdfLut_3: texture_2d<f32>, skylightPrefilterMap: texture_cube<f32>, sh: array<vec4<f32>, 9>, localBlend: f32) -> StandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX {
    var irradiance: vec3<f32>;
    var specular: vec3<f32>;
    var diffuse: vec3<f32>;

    if (sky_1.intensity < 0f) {
        let _e8 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_13, sky_1.diffuseRotation, irradianceMap_1, irradianceSampler_1);
        irradiance = _e8;
        let _e42 = sampleReflectionProbeSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_13, direction_2, roughness_7, f0_3, worldPosition_4, vec3<f32>(sky_1.colorR, sky_1.colorG, sky_1.colorB), sky_1.rotation.xyz, vec4<f32>(0f, 0f, 0f, 1f), prefilterMap_1, prefilterSampler_1, brdfLut_3, irradianceSampler_1, skylightPrefilterMap, sky_1.diffuseRotation, sky_1.diffuseScale.xyz, max((-(sky_1.intensity) - 1f), 0f), (sky_1.rotation.w > 0.5f));
        specular = _e42;
    } else {
        let _e45 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_13, sky_1.rotation, irradianceMap_1, irradianceSampler_1);
        irradiance = _e45;
        let _e47 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_13, direction_2, roughness_7, f0_3, sky_1.rotation, prefilterMap_1, prefilterSampler_1, brdfLut_3, irradianceSampler_1);
        specular = _e47;
    }
    let tint = vec3<f32>(sky_1.colorR, sky_1.colorG, sky_1.colorB);
    let diffuseScale = select((tint * sky_1.intensity), sky_1.diffuseScale.xyz, (sky_1.intensity < 0f));
    let _e63 = fresnelSchlickRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(max(dot(normal_13, direction_2), 0f), f0_3, roughness_7);
    let kD = ((vec3(1f) - _e63) * (1f - metallic_11));
    let _e72 = irradiance;
    diffuse = (((kD * _e72) * albedo_1) * diffuseScale);
    if (localBlend > 0f) {
        let _e80 = irradiance;
        let _e90 = evaluateProbeDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX(sh, localBlend, normal_13, (_e80 * diffuseScale), (kD / max(vec3((1f - metallic_11)), vec3(0.0001f))), albedo_1, metallic_11);
        diffuse = _e90;
    }
    let _e91 = diffuse;
    let _e92 = specular;
    let _e94 = decodeSpecularEnvironmentScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(tint, sky_1.intensity);
    let _e98 = projectSpecularRadianceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(vec3(1f), normal_13, direction_2, roughness_7, f0_3, brdfLut_3, irradianceSampler_1);
    return StandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(_e91, (_e92 * _e94), _e98);
}

fn evaluateStandardDirectX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(worldPosition_5: vec3<f32>, ndc_2: vec3<f32>, viewZ: f32, normal_14: vec3<f32>, direction_3: vec3<f32>, albedo_2: vec3<f32>, metallic_12: f32, alpha: f32, f0_4: vec3<f32>, shadow_1: f32) -> vec3<f32> {
    var direct: vec3<f32>;

    let _e6 = evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_14, direction_3, albedo_2, metallic_12, alpha, f0_4);
    let _e11 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowOrigin;
    let _e15 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowRight;
    let _e19 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowUp;
    let _e23 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowProjection;
    let _e25 = cloud_apply_direct_solarX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX((shadow_1 * _e6), worldPosition_5, _e11.xyz, _e15.xyz, _e19.xyz, _e23);
    direct = _e25;
    let _e27 = direct;
    let _e32 = evaluateStandardClusterLightsX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(ndc_2, viewZ, worldPosition_5, normal_14, direction_3, albedo_2, metallic_12, alpha, f0_4, false, true);
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
    let v_5 = (1f - ((_e15 + 1f) * 0.5f));
    let _e24 = x_1;
    let _e25 = y_1;
    out.position = vec4<f32>(_e24, _e25, 0f, 1f);
    out.uv = vec2<f32>(u, v_5);
    let _e31 = out;
    return _e31;
}

fn sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip: vec4<f32>, temporalProjection: vec4<f32>) -> f32 {
    let ndcDepth = (clip.z / max(abs(clip.w), 0.000001f));
    let orthographicViewZ = -((temporalProjection.x + (ndcDepth * (temporalProjection.y - temporalProjection.x))));
    return select(-(clip.w), orthographicViewZ, (temporalProjection.z >= 0.5f));
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

fn _atlasTileGridX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_1: u32) -> vec2<u32> {
    let columns = select(2u, 1u, (count_1 <= 1u));
    let rows = (((count_1 + columns) - 1u) / columns);
    return vec2<u32>(columns, rows);
}

fn _atlasTileScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_2: u32) -> vec2<f32> {
    let _e3 = _atlasTileGridX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_2);
    return (vec2(1f) / vec2<f32>(_e3));
}

fn _atlasTileOriginX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_2: u32, count_3: u32) -> vec2<f32> {
    let _e1 = _atlasTileGridX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_3);
    let tile_1 = vec2<u32>((layer_2 % _e1.x), (layer_2 / _e1.x));
    return (vec2<f32>(tile_1) / vec2<f32>(_e1));
}

fn _directionalReceiverDepthBiasX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_3: u32, normal_15: vec3<f32>, l: vec3<f32>, radius: f32) -> f32 {
    var local_23: bool;

    let nDotL_6 = dot(normal_15, l);
    let depthSpan = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_3].z;
    if (nDotL_6 > 0.01f) {
        local_23 = (depthSpan > 0f);
    } else {
        local_23 = false;
    }
    let _e16 = local_23;
    if !(_e16) {
        let _e20 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
        return _e20;
    }
    let _e21 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_3);
    let right_1 = normalize(vec3<f32>(_e21[0].x, _e21[1].x, _e21[2].x));
    let up_1 = normalize(vec3<f32>(_e21[0].y, _e21[1].y, _e21[2].y));
    let slope = ((abs(dot(normal_15, right_1)) + abs(dot(normal_15, up_1))) / nDotL_6);
    let _e49 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_3].y;
    let footprint = ((_e49 * radius) * slope);
    let _e54 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
    let _e57 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.normalBias;
    return (_e54 + (max(0f, (footprint - (_e57 / nDotL_6))) / depthSpan));
}

fn _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_14: vec3<f32>, layer_4: u32, count_4: u32, normal_16: vec3<f32>, l_1: vec3<f32>) -> f32 {
    var local_24: bool;
    var local_25: bool;
    var local_26: bool;
    var local_27: bool;
    var blocked_1: f32 = 0f;
    var local_28: bool;
    var x_2: i32 = -1i;
    var y_2: i32;
    var x_3: i32 = -2i;
    var y_3: i32;

    let _e4 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_4);
    let lightClip = (_e4 * vec4<f32>(worldPos_14, 1f));
    let projCoords = (lightClip.xyz / vec3(lightClip.w));
    let _e14 = _atlasTileScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_4);
    let _e15 = _atlasTileOriginX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_4, count_4);
    let tileUv = vec2<f32>(((projCoords.x * 0.5f) + 0.5f), ((-(projCoords.y) * 0.5f) + 0.5f));
    let uv_3 = ((tileUv * _e14) + _e15);
    let currentDepth = projCoords.z;
    if (tileUv.x >= 0f) {
        local_24 = (tileUv.x <= 1f);
    } else {
        local_24 = false;
    }
    let _e40 = local_24;
    if _e40 {
        local_25 = (tileUv.y >= 0f);
    } else {
        local_25 = false;
    }
    let _e47 = local_25;
    if _e47 {
        local_26 = (tileUv.y <= 1f);
    } else {
        local_26 = false;
    }
    let _e54 = local_26;
    if _e54 {
        local_27 = (currentDepth <= 1f);
    } else {
        local_27 = false;
    }
    let _e60 = local_27;
    if !(_e60) {
        return 1f;
    }
    let _e65 = textureDimensions(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 0i);
    let texelDims = vec2<f32>(_e65);
    let texel_2 = vec2<f32>((1f / texelDims.x), (1f / texelDims.y));
    let tileLo = (_e15 + texel_2);
    let tileHi = ((_e15 + _e14) - texel_2);
    let _e80 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.x;
    let filterProfile = clamp(u32(round(_e80)), 1u, 5u);
    let kernel = select(select(3u, 5u, (filterProfile == 3u)), 1u, (filterProfile == 1u));
    let _e102 = _directionalReceiverDepthBiasX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_4, normal_16, l_1, f32(((kernel / 2u) + 1u)));
    let adjustedDepth_1 = (currentDepth - _e102);
    if (kernel == 1u) {
        let lit_1 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, clamp(uv_3, tileLo, tileHi), adjustedDepth_1);
        return lit_1;
    }
    if (kernel == 3u) {
        if all((uv_3 >= (tileLo + texel_2))) {
            local_28 = all((uv_3 <= (tileHi - texel_2)));
        } else {
            local_28 = false;
        }
        let interior = local_28;
        if interior {
            let pcfFraction = fract(((uv_3 / texel_2) - vec2(0.5f)));
            let loWeight = (vec2(2f) - pcfFraction);
            let hiWeight = (vec2(1f) + pcfFraction);
            let loOffset = ((vec2(-1f) - pcfFraction) + (vec2(1f) / loWeight));
            let hiOffset = ((vec2(1f) - pcfFraction) + (pcfFraction / hiWeight));
            let litLoLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_3 + (vec2<f32>(loOffset.x, loOffset.y) * texel_2)), adjustedDepth_1);
            let litHiLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_3 + (vec2<f32>(hiOffset.x, loOffset.y) * texel_2)), adjustedDepth_1);
            let litLoHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_3 + (vec2<f32>(loOffset.x, hiOffset.y) * texel_2)), adjustedDepth_1);
            let litHiHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_3 + (vec2<f32>(hiOffset.x, hiOffset.y) * texel_2)), adjustedDepth_1);
            return ((((((litLoLo * loWeight.x) * loWeight.y) + ((litHiLo * hiWeight.x) * loWeight.y)) + ((litLoHi * loWeight.x) * hiWeight.y)) + ((litHiHi * hiWeight.x) * hiWeight.y)) / 9f);
        }
        loop {
            let _e199 = x_2;
            if (_e199 <= 1i) {
            } else {
                break;
            }
            {
                y_2 = -1i;
                loop {
                    let _e204 = y_2;
                    if (_e204 <= 1i) {
                    } else {
                        break;
                    }
                    {
                        let _e207 = x_2;
                        let _e209 = y_2;
                        let offsetUv_1 = clamp((uv_3 + (vec2<f32>(f32(_e207), f32(_e209)) * texel_2)), tileLo, tileHi);
                        let lit_2 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv_1, adjustedDepth_1);
                        let _e219 = blocked_1;
                        blocked_1 = (_e219 + (1f - lit_2));
                    }
                    continuing {
                        let _e224 = y_2;
                        y_2 = (_e224 + 1i);
                    }
                }
            }
            continuing {
                let _e227 = x_2;
                x_2 = (_e227 + 1i);
            }
        }
        let _e229 = blocked_1;
        return (1f - (_e229 / 9f));
    }
    loop {
        let _e235 = x_3;
        if (_e235 <= 2i) {
        } else {
            break;
        }
        {
            y_3 = -2i;
            loop {
                let _e240 = y_3;
                if (_e240 <= 2i) {
                } else {
                    break;
                }
                {
                    let _e243 = x_3;
                    let _e245 = y_3;
                    let offsetUv_2 = clamp((uv_3 + (vec2<f32>(f32(_e243), f32(_e245)) * texel_2)), tileLo, tileHi);
                    let lit_3 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv_2, adjustedDepth_1);
                    let _e254 = blocked_1;
                    blocked_1 = (_e254 + (1f - lit_3));
                }
                continuing {
                    let _e259 = y_3;
                    y_3 = (_e259 + 1i);
                }
            }
        }
        continuing {
            let _e262 = x_3;
            x_3 = (_e262 + 1i);
        }
    }
    let _e264 = blocked_1;
    return (1f - (_e264 / 25f));
}

fn evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_17: vec3<f32>, worldPos_15: vec3<f32>, viewZ_1: f32) -> f32 {
    var shadow_2: f32;
    var local_29: bool;

    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeCount;
    if (_e2 < 1f) {
        return 1f;
    }
    let _e8 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let l_6 = normalize(-(_e8));
    let _e13 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeCount;
    let count_5 = u32(max(_e13, 1f));
    let viewDepth_1 = -(viewZ_1);
    let _e25 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[(count_5 - 1u)].x;
    if (viewDepth_1 > _e25) {
        return 1f;
    }
    let _e28 = _pickCascadeLayerX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(viewDepth_1, count_5);
    let _e33 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.normalBias;
    let receiverPosition = (worldPos_15 + (normal_17 * _e33));
    let _e36 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(receiverPosition, _e28, count_5, normal_17, l_6);
    shadow_2 = _e36;
    let _e40 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
    if (_e40 > 0f) {
        local_29 = ((_e28 + 1u) < count_5);
    } else {
        local_29 = false;
    }
    let _e49 = local_29;
    if _e49 {
        let spCurr = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[_e28].x;
        let _e57 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
        let blendWidth = (spCurr * _e57);
        if (blendWidth > 0f) {
            let dist = (spCurr - viewDepth_1);
            let t_1 = clamp((1f - (dist / blendWidth)), 0f, 1f);
            if (t_1 > 0f) {
                let _e72 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(receiverPosition, (_e28 + 1u), count_5, normal_17, l_6);
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
    var local_30: bool;
    var band_1: u32 = 0u;
    var screenAo: f32 = 1f;

    let pixel = vec2<i32>(in_2.position.xy);
    let depth_1 = textureLoad(sceneDepth, pixel, 0i);
    if (depth_1 >= 1f) {
        discard;
    }
    let _e14 = textureLoad(lightingContext, pixel, 0i);
    let context = _e14.x;
    let _e21 = skylight.diffuseScale.w;
    if ((context >> 24u) != u32(_e21)) {
        discard;
    }
    let _e27 = textureDimensions(sceneDepth);
    let uv_4 = (in_2.position.xy / vec2<f32>(_e27));
    let ndc_3 = vec3<f32>(((uv_4 * vec2<f32>(2f, -2f)) + vec2<f32>(-1f, 1f)), depth_1);
    let _e41 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.inverseViewProj;
    let homogeneous = (_e41 * vec4<f32>(ndc_3, 1f));
    let position = (homogeneous.xyz / vec3(homogeneous.w));
    let normalSample = textureLoad(normalRoughness, pixel, 0i);
    let normal_18 = normalize(((normalSample.xyz * 2f) - vec3(1f)));
    let roughness_10 = normalSample.w;
    let _e62 = textureLoad(albedoMetallic, pixel, 0i);
    let albedo_3 = unpack4x8unorm(_e62.x);
    let response = textureLoad(f0Occlusion, pixel, 0i);
    let emission = textureLoad(emissiveOpacity, pixel, 0i);
    let _e73 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let direction_5 = normalize((_e73 - position));
    let probeRow = (context & 16777215u);
    let base_1 = (probeRow * 16u);
    if (probeRow > 0u) {
        local_30 = ((base_1 + 9u) < arrayLength((&probeBlendRecords)));
    } else {
        local_30 = false;
    }
    let _e90 = local_30;
    if _e90 {
        let header = probeBlendRecords[base_1];
        if ((u32(header.x) + 1u) == probeRow) {
            localBlend_1 = header.z;
            loop {
                let _e102 = band_1;
                if (_e102 < 9u) {
                } else {
                    break;
                }
                {
                    let _e106 = band_1;
                    let _e111 = band_1;
                    let _e114 = probeBlendRecords[((base_1 + 1u) + _e111)];
                    sh_1[_e106] = _e114;
                }
                continuing {
                    let _e115 = band_1;
                    band_1 = (_e115 + 1u);
                }
            }
        }
    }
    let _e122 = skylight;
    let _e123 = sh_1;
    let _e124 = localBlend_1;
    let _e131 = evaluateStandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(position, normal_18, direction_5, albedo_3.xyz, albedo_3.w, roughness_10, response.xyz, _e122, irradianceMap_2, linearSampler, prefilterMap_2, linearSampler, brdfLut_4, skylightPrefilterMap_1, _e123, _e124);
    let _e134 = params.x;
    if (_e134 > 0f) {
        let _e140 = textureSampleLevel(screenOcclusion, linearSampler, uv_4, 0f);
        let _e147 = params.x;
        screenAo = pow(clamp(_e140.x, 0f, 1f), _e147);
    }
    let _e151 = screenAo;
    let ao = (response.w * _e151);
    let _e155 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    let _e161 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e162 = sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX((_e155 * vec4<f32>(position, 1f)), _e161);
    let _e163 = evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_18, position, _e162);
    let _e168 = evaluateStandardDirectX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(position, ndc_3, _e162, normal_18, direction_5, albedo_3.xyz, albedo_3.w, (roughness_10 * roughness_10), response.xyz, _e163);
    return DeferredOutput(vec4<f32>(((((_e131.diffuse + _e131.specular) * ao) + _e168) + emission.xyz), emission.w), vec4<f32>((_e131.specular * ao), 1f), vec4<f32>((_e131.response * response.w), response.w));
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
