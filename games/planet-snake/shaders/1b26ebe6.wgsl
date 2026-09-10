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
}

struct MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    worldFromLocal: mat4x4<f32>,
    normalMatrix: mat3x3<f32>,
    previousWorldFromLocal: mat4x4<f32>,
    temporal: vec4<f32>,
}

struct InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    localFromInstance: mat4x4<f32>,
    previousLocalFromInstance: mat4x4<f32>,
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

struct Material {
    colorTint: vec4<f32>,
    region: vec4<f32>,
    pivotAndSize: vec4<f32>,
    slicesAndMode: vec4<f32>,
    baseColorTextureCoordinatesTransform: vec4<f32>,
    baseColorTextureCoordinatesMetadata: vec4<f32>,
}

struct VsIn {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) tangent: vec4<f32>,
}

struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) uv_atlas: vec2<f32>,
    @location(1) worldPos: vec3<f32>,
    @location(2) ndc: vec3<f32>,
    @location(3) viewZ: f32,
}

struct SpriteVertex {
    posLocal: vec3<f32>,
    uvAtlas: vec2<f32>,
}

struct TemporalVsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) uvAtlas: vec2<f32>,
    @location(1) currentClip: vec4<f32>,
    @location(2) previousClip: vec4<f32>,
}

const THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX: u32 = 16u;
const THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX: array<vec2<f32>, 256> = array<vec2<f32>, 256>(vec2<f32>(0.14709473f, 0.8520508f), vec2<f32>(0.16552734f, 0.78759766f), vec2<f32>(0.24438477f, 0.6386719f), vec2<f32>(0.3708496f, 0.51953125f), vec2<f32>(0.49682617f, 0.41552734f), vec2<f32>(0.6020508f, 0.32641602f), vec2<f32>(0.68408203f, 0.25390625f), vec2<f32>(0.74609375f, 0.19750977f), vec2<f32>(0.79052734f, 0.15429688f), vec2<f32>(0.8222656f, 0.12164307f), vec2<f32>(0.8432617f, 0.09698486f), vec2<f32>(0.8564453f, 0.078430176f), vec2<f32>(0.86328125f, 0.06439209f), vec2<f32>(0.86572266f, 0.053710938f), vec2<f32>(0.8642578f, 0.045440674f), vec2<f32>(0.8598633f, 0.039031982f), vec2<f32>(0.38867188f, 0.6113281f), vec2<f32>(0.3930664f, 0.60058594f), vec2<f32>(0.41235352f, 0.54589844f), vec2<f32>(0.45654297f, 0.4482422f), vec2<f32>(0.52783203f, 0.35253906f), vec2<f32>(0.6074219f, 0.27392578f), vec2<f32>(0.67871094f, 0.21142578f), vec2<f32>(0.73339844f, 0.16259766f), vec2<f32>(0.7709961f, 0.12536621f), vec2<f32>(0.79345703f, 0.09729004f), vec2<f32>(0.80322266f, 0.07623291f), vec2<f32>(0.80371094f, 0.06036377f), vec2<f32>(0.7963867f, 0.048431396f), vec2<f32>(0.78564453f, 0.039367676f), vec2<f32>(0.77197266f, 0.032409668f), vec2<f32>(0.7548828f, 0.026977539f), vec2<f32>(0.5722656f, 0.42749023f), vec2<f32>(0.57373047f, 0.42407227f), vec2<f32>(0.57958984f, 0.40356445f), vec2<f32>(0.5917969f, 0.3544922f), vec2<f32>(0.61621094f, 0.28808594f), vec2<f32>(0.65527344f, 0.22485352f), vec2<f32>(0.69873047f, 0.17260742f), vec2<f32>(0.73535156f, 0.13183594f), vec2<f32>(0.75927734f, 0.10089111f), vec2<f32>(0.77001953f, 0.07745361f), vec2<f32>(0.77197266f, 0.059936523f), vec2<f32>(0.7661133f, 0.046844482f), vec2<f32>(0.7519531f, 0.036987305f), vec2<f32>(0.7324219f, 0.029541016f), vec2<f32>(0.70947266f, 0.023834229f), vec2<f32>(0.68359375f, 0.019439697f), vec2<f32>(0.7089844f, 0.29101563f), vec2<f32>(0.7089844f, 0.28979492f), vec2<f32>(0.70996094f, 0.28125f), vec2<f32>(0.70996094f, 0.25854492f), vec2<f32>(0.7114258f, 0.22045898f), vec2<f32>(0.71972656f, 0.17687988f), vec2<f32>(0.734375f, 0.13708496f), vec2<f32>(0.7480469f, 0.10479736f), vec2<f32>(0.7558594f, 0.07989502f), vec2<f32>(0.7597656f, 0.06100464f), vec2<f32>(0.75341797f, 0.046844482f), vec2<f32>(0.73876953f, 0.036224365f), vec2<f32>(0.71777344f, 0.028259277f), vec2<f32>(0.69189453f, 0.022262573f), vec2<f32>(0.6611328f, 0.017700195f), vec2<f32>(0.62841797f, 0.014198303f), vec2<f32>(0.80810547f, 0.19177246f), vec2<f32>(0.8076172f, 0.19128418f), vec2<f32>(0.80615234f, 0.18798828f), vec2<f32>(0.8017578f, 0.17810059f), vec2<f32>(0.79296875f, 0.1586914f), vec2<f32>(0.7836914f, 0.13220215f), vec2<f32>(0.7753906f, 0.1048584f), vec2<f32>(0.7685547f, 0.08111572f), vec2<f32>(0.76464844f, 0.0619812f), vec2<f32>(0.7553711f, 0.04727173f), vec2<f32>(0.7402344f, 0.03616333f), vec2<f32>(0.71875f, 0.027755737f), vec2<f32>(0.69091797f, 0.021484375f), vec2<f32>(0.6582031f, 0.016738892f), vec2<f32>(0.6220703f, 0.013160706f), vec2<f32>(0.5839844f, 0.010414124f), vec2<f32>(0.87841797f, 0.1217041f), vec2<f32>(0.8779297f, 0.1217041f), vec2<f32>(0.875f, 0.12060547f), vec2<f32>(0.8691406f, 0.11694336f), vec2<f32>(0.8569336f, 0.10803223f), vec2<f32>(0.8378906f, 0.09375f), vec2<f32>(0.8149414f, 0.0769043f), vec2<f32>(0.79589844f, 0.060699463f), vec2<f32>(0.7763672f, 0.046875f), vec2<f32>(0.75634766f, 0.03591919f), vec2<f32>(0.7324219f, 0.027450562f), vec2<f32>(0.703125f, 0.021026611f), vec2<f32>(0.6689453f, 0.016174316f), vec2<f32>(0.6303711f, 0.012512207f), vec2<f32>(0.58935547f, 0.009742737f), vec2<f32>(0.5463867f, 0.007633209f), vec2<f32>(0.92626953f, 0.073791504f), vec2<f32>(0.92578125f, 0.073913574f), vec2<f32>(0.92285156f, 0.073913574f), vec2<f32>(0.9169922f, 0.07312012f), vec2<f32>(0.9038086f, 0.06982422f), vec2<f32>(0.88134766f, 0.06311035f), vec2<f32>(0.8510742f, 0.05380249f), vec2<f32>(0.82128906f, 0.043701172f), vec2<f32>(0.7910156f, 0.03439331f), vec2<f32>(0.76123047f, 0.026611328f), vec2<f32>(0.72802734f, 0.020446777f), vec2<f32>(0.69189453f, 0.015655518f), vec2<f32>(0.6508789f, 0.012008667f), vec2<f32>(0.6074219f, 0.009254456f), vec2<f32>(0.56103516f, 0.007156372f), vec2<f32>(0.51416016f, 0.0055656433f), vec2<f32>(0.95751953f, 0.04232788f), vec2<f32>(0.95703125f, 0.04244995f), vec2<f32>(0.95458984f, 0.042816162f), vec2<f32>(0.94921875f, 0.043182373f), vec2<f32>(0.9370117f, 0.042663574f), vec2<f32>(0.91308594f, 0.040252686f), vec2<f32>(0.88183594f, 0.03579712f), vec2<f32>(0.84472656f, 0.030136108f), vec2<f32>(0.80615234f, 0.024337769f), vec2<f32>(0.76708984f, 0.01914978f), vec2<f32>(0.7265625f, 0.014854431f), vec2<f32>(0.6826172f, 0.011421204f), vec2<f32>(0.63623047f, 0.008773804f), vec2<f32>(0.58691406f, 0.00674057f), vec2<f32>(0.5366211f, 0.0051994324f), vec2<f32>(0.48608398f, 0.004020691f), vec2<f32>(0.97753906f, 0.022628784f), vec2<f32>(0.9770508f, 0.022750854f), vec2<f32>(0.97509766f, 0.02319336f), vec2<f32>(0.96972656f, 0.023910522f), vec2<f32>(0.95947266f, 0.024490356f), vec2<f32>(0.93603516f, 0.024124146f), vec2<f32>(0.90527344f, 0.022521973f), vec2<f32>(0.8652344f, 0.019760132f), vec2<f32>(0.82177734f, 0.01651001f), vec2<f32>(0.77441406f, 0.013290405f), vec2<f32>(0.7265625f, 0.0104599f), vec2<f32>(0.67626953f, 0.008132935f), vec2<f32>(0.62402344f, 0.0062789917f), vec2<f32>(0.5698242f, 0.004825592f), vec2<f32>(0.5151367f, 0.0037136078f), vec2<f32>(0.46142578f, 0.0028629303f), vec2<f32>(0.98876953f, 0.011070251f), vec2<f32>(0.98876953f, 0.011161804f), vec2<f32>(0.9868164f, 0.011512756f), vec2<f32>(0.98291016f, 0.012214661f), vec2<f32>(0.97314453f, 0.012992859f), vec2<f32>(0.953125f, 0.013519287f), vec2<f32>(0.92285156f, 0.013282776f), vec2<f32>(0.8823242f, 0.012260437f), vec2<f32>(0.83496094f, 0.010658264f), vec2<f32>(0.7832031f, 0.008850098f), vec2<f32>(0.7285156f, 0.0071144104f), vec2<f32>(0.671875f, 0.005607605f), vec2<f32>(0.61376953f, 0.004360199f), vec2<f32>(0.5546875f, 0.0033721924f), vec2<f32>(0.4963379f, 0.0025997162f), vec2<f32>(0.43945313f, 0.0020046234f), vec2<f32>(0.9951172f, 0.004798889f), vec2<f32>(0.9951172f, 0.004863739f), vec2<f32>(0.99365234f, 0.0050964355f), vec2<f32>(0.9902344f, 0.0056037903f), vec2<f32>(0.9814453f, 0.0063323975f), vec2<f32>(0.96435547f, 0.0069770813f), vec2<f32>(0.93603516f, 0.007297516f), vec2<f32>(0.8964844f, 0.0071258545f), vec2<f32>(0.8466797f, 0.0064926147f), vec2<f32>(0.7915039f, 0.005596161f), vec2<f32>(0.7314453f, 0.004627228f), vec2<f32>(0.6689453f, 0.0037174225f), vec2<f32>(0.60546875f, 0.0029296875f), vec2<f32>(0.5415039f, 0.002281189f), vec2<f32>(0.47924805f, 0.0017662048f), vec2<f32>(0.41967773f, 0.0013656616f), vec2<f32>(0.9980469f, 0.0017604828f), vec2<f32>(0.9980469f, 0.0017938614f), vec2<f32>(0.99658203f, 0.0019292831f), vec2<f32>(0.9941406f, 0.0022392273f), vec2<f32>(0.9863281f, 0.002729416f), vec2<f32>(0.9716797f, 0.003250122f), vec2<f32>(0.9458008f, 0.0036697388f), vec2<f32>(0.90771484f, 0.003818512f), vec2<f32>(0.85839844f, 0.0036811829f), vec2<f32>(0.7993164f, 0.003320694f), vec2<f32>(0.73535156f, 0.0028438568f), vec2<f32>(0.66748047f, 0.0023441315f), vec2<f32>(0.5986328f, 0.0018796921f), vec2<f32>(0.53027344f, 0.0014829636f), vec2<f32>(0.46411133f, 0.0011587143f), vec2<f32>(0.4020996f, 0.0008993149f), vec2<f32>(0.9995117f, 0.00050115585f), vec2<f32>(0.9995117f, 0.00051546097f), vec2<f32>(0.9980469f, 0.0005836487f), vec2<f32>(0.99658203f, 0.0007505417f), vec2<f32>(0.9892578f, 0.0010147095f), vec2<f32>(0.9760742f, 0.0013465881f), vec2<f32>(0.9526367f, 0.0016527176f), vec2<f32>(0.9160156f, 0.0018558502f), vec2<f32>(0.8671875f, 0.0019054413f), vec2<f32>(0.8076172f, 0.0018167496f), vec2<f32>(0.7392578f, 0.0016212463f), vec2<f32>(0.6669922f, 0.0013799667f), vec2<f32>(0.5932617f, 0.0011358261f), vec2<f32>(0.52001953f, 0.0009121895f), vec2<f32>(0.45043945f, 0.00072193146f), vec2<f32>(0.38598633f, 0.00056505203f), vec2<f32>(1f, 0.00009316206f), vec2<f32>(1f, 0.00009787083f), vec2<f32>(0.99902344f, 0.00012540817f), vec2<f32>(0.9970703f, 0.00019216537f), vec2<f32>(0.99072266f, 0.000310421f), vec2<f32>(0.9790039f, 0.00046992302f), vec2<f32>(0.95751953f, 0.000647068f), vec2<f32>(0.92333984f, 0.0007915497f), vec2<f32>(0.8754883f, 0.00087690353f), vec2<f32>(0.8149414f, 0.0008869171f), vec2<f32>(0.7441406f, 0.0008325577f), vec2<f32>(0.66748047f, 0.00073862076f), vec2<f32>(0.5883789f, 0.000626564f), vec2<f32>(0.51123047f, 0.0005168915f), vec2<f32>(0.43823242f, 0.00041651726f), vec2<f32>(0.37109375f, 0.0003311634f), vec2<f32>(1f, 0.0000072717667f), vec2<f32>(1f, 0.000008165836f), vec2<f32>(0.99902344f, 0.000016987324f), vec2<f32>(0.9975586f, 0.000037908554f), vec2<f32>(0.9921875f, 0.00007593632f), vec2<f32>(0.9814453f, 0.00013744831f), vec2<f32>(0.9614258f, 0.00020754337f), vec2<f32>(0.9291992f, 0.00028014183f), vec2<f32>(0.8828125f, 0.00033450127f), vec2<f32>(0.82177734f, 0.00036263466f), vec2<f32>(0.74902344f, 0.00036215782f), vec2<f32>(0.66845703f, 0.00033807755f), vec2<f32>(0.5854492f, 0.00029969215f), vec2<f32>(0.50390625f, 0.00025582314f), vec2<f32>(0.42700195f, 0.0002117157f), vec2<f32>(0.35766602f, 0.000172019f), vec2<f32>(1f, 0f), vec2<f32>(1f, 0.000000059604645f), vec2<f32>(0.9995117f, 0.0000012516975f), vec2<f32>(0.9975586f, 0.0000053048134f), vec2<f32>(0.99316406f, 0.000015079975f), vec2<f32>(0.98291016f, 0.000028550625f), vec2<f32>(0.96435547f, 0.000047445297f), vec2<f32>(0.93408203f, 0.00006842613f), vec2<f32>(0.88916016f, 0.00008893013f), vec2<f32>(0.828125f, 0.000104248524f), vec2<f32>(0.75390625f, 0.00011217594f), vec2<f32>(0.67041016f, 0.00011241436f), vec2<f32>(0.5830078f, 0.00010627508f), vec2<f32>(0.4970703f, 0.00009584427f), vec2<f32>(0.4169922f, 0.00008332729f), vec2<f32>(0.34521484f, 0.000070512295f));
const KIND_POINTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: u32 = 0u;
const KIND_SPOTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: u32 = 1u;
const PROJECTOR_FLAGX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: i32 = 1073741824i;
const TILE_MASKX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: i32 = 1073741823i;
const KIND_RECT_AREAX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: u32 = 2u;

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(3) @binding(0) 
var<storage> instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(0) @binding(4) 
var shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: sampler_comparison;
@group(0) @binding(8) 
var spotShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_depth_2d;
@group(2) @binding(6) 
var<uniform> cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: ClusterUniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX;
@group(2) @binding(4) 
var<storage> cluster_gridX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: array<u32>;
@group(2) @binding(5) 
var<storage> light_index_listX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: array<u32>;
@group(2) @binding(3) 
var<storage> light_dataX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: array<DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX, 256>;
@group(1) @binding(0) 
var<uniform> material: Material;
@group(1) @binding(1) 
var baseColorSampler: sampler;
@group(1) @binding(2) 
var baseColorTexture: texture_2d<f32>;

fn sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture: texture_2d<f32>, textureSampler: sampler, uv: vec2<f32>, uvScale: vec2<f32>) -> vec4<f32> {
    let _e5 = textureSample(texture, textureSampler, (uv * uvScale));
    return _e5;
}

fn sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture_1: texture_2d<f32>, textureSampler_1: sampler, uv_1: vec2<f32>, uvScale_1: vec2<f32>) -> vec4<f32> {
    let _e4 = sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture_1, textureSampler_1, uv_1, uvScale_1);
    return _e4;
}

fn sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip: vec4<f32>, temporalProjection: vec4<f32>) -> f32 {
    let ndcDepth = (clip.z / max(abs(clip.w), 0.000001f));
    let orthographicViewZ = -((temporalProjection.x + (ndcDepth * (temporalProjection.y - temporalProjection.x))));
    return select(-(clip.w), orthographicViewZ, (temporalProjection.z >= 0.5f));
}

fn sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_1: vec4<f32>) -> vec2<f32> {
    let safeW = select(0.000001f, clip_1.w, (abs(clip_1.w) >= 0.000001f));
    let ndc_3 = (clip_1.xy / vec2(safeW));
    return vec2<f32>(((ndc_3.x * 0.5f) + 0.5f), (0.5f - (ndc_3.y * 0.5f)));
}

fn sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_2: vec4<f32>, temporalProjection_1: vec4<f32>) -> f32 {
    let _e2 = sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_2, temporalProjection_1);
    return log2((1f + max(-(_e2), 0f)));
}

fn packSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip: vec4<f32>, previousClip: vec4<f32>, temporalProjection_2: vec4<f32>, reactive: f32) -> vec4<f32> {
    let _e1 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip);
    let _e3 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(previousClip);
    let _e6 = sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip, temporalProjection_2);
    return vec4<f32>((_e1 - _e3), _e6, clamp(reactive, 0f, 1f));
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
    let direction = normalize(select(vec3<f32>(0f, 0f, -1f), toLight, (dSquared_2 > 0.0001f)));
    let cone_1 = smoothstep(cosOuter, cosInner, dot(direction, -(normalize(lightDir))));
    return (_e5 * cone_1);
}

fn projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(lightViewProj: mat4x4<f32>, worldPos_1: vec3<f32>) -> vec2<f32> {
    let clip_3 = (lightViewProj * vec4<f32>(worldPos_1, 1f));
    let invW = select((1f / clip_3.w), 0f, (abs(clip_3.w) < 0.000001f));
    return vec2<f32>((((clip_3.x * invW) * 0.5f) + 0.5f), (((clip_3.y * invW) * -0.5f) + 0.5f));
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

fn sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness: f32, dotNV: f32) -> vec2<f32> {
    let uv_3 = clamp(vec2<f32>(roughness, dotNV), vec2(0f), vec2(1f));
    let samplePosition = ((uv_3 * 16f) - vec2(0.5f));
    let base = vec2<i32>(floor(samplePosition));
    let weight = fract(samplePosition);
    let lo = clamp(base, vec2(0i), vec2(15i));
    let hi = clamp((base + vec2(1i)), vec2(0i), vec2(15i));
    let rowLo = mix(THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(lo.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(lo.x))], THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(lo.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(hi.x))], weight.x);
    let rowHi = mix(THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(hi.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(lo.x))], THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(hi.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(hi.x))], weight.x);
    return mix(rowLo, rowHi, weight.y);
}

fn threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_1: f32, nDotV_1: f32, nDotL_1: f32, F0_: vec3<f32>) -> vec3<f32> {
    let _e2 = sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_1, nDotV_1);
    let _e4 = sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_1, nDotL_1);
    let fssEssV = ((F0_ * _e2.x) + vec3(_e2.y));
    let fssEssL = ((F0_ * _e4.x) + vec3(_e4.y));
    let emsV = ((1f - _e2.x) - _e2.y);
    let emsL = ((1f - _e4.x) - _e4.y);
    let favg = (F0_ + ((vec3(1f) - F0_) * 0.047619f));
    let energyLoss = (emsV * emsL);
    let fms = (((fssEssV * fssEssL) * favg) / ((vec3(1f) - ((energyLoss * favg) * favg)) + vec3(0.000001f)));
    return (fms * energyLoss);
}

fn spotModifierProductX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX(brdf: f32, range: f32, cone: f32, ies: f32, cookie: f32, shadow: f32) -> f32 {
    return (((((brdf * range) * cone) * ies) * cookie) * shadow);
}

fn sample_shadow_2d_kernelX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMap: texture_depth_2d, shadowSampler: sampler_comparison, uv_2: vec2<f32>, texel: vec2<f32>, depthRef: f32, normalBias: f32, depthBias: f32, nDotL_2: f32, kernelSize: f32) -> f32 {
    var blocked: f32 = 0f;
    var samples: f32 = 0f;
    var y: i32 = -2i;
    var x: i32;
    var local: bool;

    let bias = max((normalBias * (1f - nDotL_2)), (depthBias / 1000f));
    let adjustedDepth = (depthRef - bias);
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
                        let offsetUv = (uv_2 + (vec2<f32>(f32(_e44), f32(_e46)) * texel));
                        let lit_1 = textureSampleCompareLevel(shadowMap, shadowSampler, offsetUv, adjustedDepth);
                        let _e55 = blocked;
                        blocked = (_e55 + (1f - lit_1));
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

fn evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_1: vec3<f32>, colorTimesIntensity: vec3<f32>, invRangeSquared_2: f32, worldPos_2: vec3<f32>, normal: vec3<f32>, viewDir: vec3<f32>, baseColor: vec3<f32>, metallic: f32, alphaSq: f32, F0_1: vec3<f32>) -> vec3<f32> {
    let toLight_1 = (lightPos_1 - worldPos_2);
    let dSquared_3 = max(dot(toLight_1, toLight_1), 0.0001f);
    let l = (toLight_1 / vec3(sqrt(dSquared_3)));
    let h = normalize((viewDir + l));
    let nDotL_3 = max(dot(normal, l), 0f);
    let nDotV_2 = max(dot(normal, viewDir), 0.00001f);
    let nDotH_1 = max(dot(normal, h), 0f);
    let vDotH_1 = max(dot(viewDir, h), 0f);
    let _e26 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH_1, F0_1);
    let roughness_2 = sqrt(max(alphaSq, 0f));
    let _e31 = threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_2, nDotV_2, nDotL_3, F0_1);
    let _e32 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_1, alphaSq);
    let _e33 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_2, nDotL_3, alphaSq);
    let specular = (((_e32 * _e33) * _e26) + _e31);
    let diffuse = (((1f - metallic) * baseColor) / vec3(3.1415927f));
    let _e46 = evalDistanceAttenuationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(dSquared_3, invRangeSquared_2);
    return ((((diffuse + specular) * colorTimesIntensity) * nDotL_3) * _e46);
}

fn evalPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_2: vec3<f32>, colorTimesIntensity_1: vec3<f32>, invRangeSquared_3: f32, worldPos_3: vec3<f32>, normal_1: vec3<f32>, viewDir_1: vec3<f32>, baseColor_1: vec3<f32>, metallic_1: f32, alphaSq_1: f32, F0_2: vec3<f32>) -> vec3<f32> {
    let _e10 = evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_2, colorTimesIntensity_1, invRangeSquared_3, worldPos_3, normal_1, viewDir_1, baseColor_1, metallic_1, alphaSq_1, F0_2);
    return _e10;
}

fn evalFlatRangeAttenuationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(dSquared_1: f32, invRangeSquared_4: f32) -> f32 {
    let factor = max(min((1f - ((dSquared_1 * invRangeSquared_4) * (dSquared_1 * invRangeSquared_4))), 1f), 0f);
    return ((factor * factor) / dSquared_1);
}

fn evalPointFlatX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_3: vec3<f32>, colorTimesIntensity_2: vec3<f32>, invRangeSquared_5: f32, worldPos_4: vec3<f32>, baseColor_2: vec3<f32>) -> vec3<f32> {
    let toLight_2 = (lightPos_3 - worldPos_4);
    let dSquared_4 = max(dot(toLight_2, toLight_2), 0.0001f);
    let _e10 = evalFlatRangeAttenuationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(dSquared_4, invRangeSquared_5);
    return ((baseColor_2 * colorTimesIntensity_2) * _e10);
}

fn evalSpotFlatX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_4: vec3<f32>, lightDir_1: vec3<f32>, colorTimesIntensity_3: vec3<f32>, cosInner_1: f32, cosOuter_1: f32, invRangeSquared_6: f32, worldPos_5: vec3<f32>, baseColor_3: vec3<f32>) -> vec3<f32> {
    let toLight_3 = (lightPos_4 - worldPos_5);
    let dSquared_5 = max(dot(toLight_3, toLight_3), 0.0001f);
    let l_1 = (toLight_3 / vec3(sqrt(dSquared_5)));
    let cone_2 = smoothstep(cosOuter_1, cosInner_1, dot(l_1, -(lightDir_1)));
    let _e18 = evalPointFlatX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_4, colorTimesIntensity_3, invRangeSquared_6, worldPos_5, baseColor_3);
    return (_e18 * cone_2);
}

fn evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_5: vec3<f32>, lightDir_2: vec3<f32>, colorTimesIntensity_4: vec3<f32>, cosInner_2: f32, cosOuter_2: f32, invRangeSquared_7: f32, worldPos_6: vec3<f32>, normal_2: vec3<f32>, viewDir_2: vec3<f32>, baseColor_4: vec3<f32>, metallic_2: f32, alphaSq_2: f32, F0_3: vec3<f32>) -> vec3<f32> {
    let _e10 = evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_5, colorTimesIntensity_4, invRangeSquared_7, worldPos_6, normal_2, viewDir_2, baseColor_4, metallic_2, alphaSq_2, F0_3);
    let toLight_4 = (lightPos_5 - worldPos_6);
    let l_2 = normalize(toLight_4);
    let cone_3 = smoothstep(cosOuter_2, cosInner_2, dot(l_2, -(lightDir_2)));
    let _e24 = spotModifierProductX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX(1f, 1f, cone_3, 1f, 1f, 1f);
    return (_e10 * _e24);
}

fn evalSpotShadowedX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_6: vec3<f32>, lightDir_3: vec3<f32>, colorTimesIntensity_5: vec3<f32>, cosInner_3: f32, cosOuter_3: f32, invRangeSquared_8: f32, worldPos_7: vec3<f32>, normal_3: vec3<f32>, viewDir_3: vec3<f32>, baseColor_5: vec3<f32>, metallic_3: f32, alphaSq_3: f32, F0_4: vec3<f32>, lightViewProj_1: mat4x4<f32>, shadowAtlasTile: i32, depthBias_1: f32, normalBias_1: f32, pcfKernelSize: f32, shadowIntensity: f32) -> vec3<f32> {
    var local_1: bool;
    var local_2: bool;
    var local_3: bool;
    var local_4: bool;

    let _e13 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_6, lightDir_3, colorTimesIntensity_5, cosInner_3, cosOuter_3, invRangeSquared_8, worldPos_7, normal_3, viewDir_3, baseColor_5, metallic_3, alphaSq_3, F0_4);
    let splane = (lightViewProj_1 * vec4<f32>(worldPos_7, 1f));
    let invW_1 = select((1f / splane.w), 0f, (abs(splane.w) < 0.000001f));
    let _e27 = projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(lightViewProj_1, worldPos_7);
    let depthRef_1 = (splane.z * invW_1);
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
        local_4 = (depthRef_1 <= 1f);
    } else {
        local_4 = false;
    }
    let _e59 = local_4;
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
    let nDotL_4 = max(dot(normal_3, normalize((lightPos_6 - worldPos_7))), 0f);
    let _e92 = sample_shadow_2d_kernelX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(spotShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, atlasUv, texel_1, depthRef_1, normalBias_1, depthBias_1, nDotL_4, pcfKernelSize);
    return (_e13 * mix(1f, _e92, clamp(shadowIntensity, 0f, 1f)));
}

fn spotModifierFactorsX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX(lightPos_7: vec3<f32>, lightDir_4: vec3<f32>, cosOuter_4: f32, worldPos_8: vec3<f32>, rollDeg: f32, metadata: vec4<u32>) -> vec4<f32> {
    return vec4(1f);
}

fn evalRectAreaLtcStandardX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(lightPos_8: vec3<f32>, lightColor: vec3<f32>, axisX: vec3<f32>, axisY: vec3<f32>, halfWidth: f32, halfHeight: f32, invRangeSquared_9: f32, worldPos_9: vec3<f32>, n: vec3<f32>, v: vec3<f32>, baseColor_6: vec3<f32>, metallic_4: f32, alphaSq_4: f32, F0_5: vec3<f32>) -> vec3<f32> {
    return vec3(0f);
}

fn evalRectAreaLtcGgxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(lightPos_9: vec3<f32>, lightColor_1: vec3<f32>, axisX_1: vec3<f32>, axisY_1: vec3<f32>, halfWidth_1: f32, halfHeight_1: f32, invRangeSquared_10: f32, worldPos_10: vec3<f32>, n_1: vec3<f32>, v_1: vec3<f32>, baseColor_7: vec3<f32>, metallic_5: f32, alphaSq_5: f32, F0_6: vec3<f32>) -> vec3<f32> {
    let _e14 = evalRectAreaLtcStandardX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(lightPos_9, lightColor_1, axisX_1, axisY_1, halfWidth_1, halfHeight_1, invRangeSquared_10, worldPos_10, n_1, v_1, baseColor_7, metallic_5, alphaSq_5, F0_6);
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

fn evaluate_cluster_lightX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(light: DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX, world_pos: vec3<f32>, normal_4: vec3<f32>, view_dir: vec3<f32>, base_color: vec3<f32>, metallic_6: f32, alpha_sq: f32, f0_1: vec3<f32>, flat_2d: bool) -> vec3<f32> {
    var projector_selected: bool = false;
    var tile: i32;
    var local_5: bool;
    var local_6: bool;

    let kind = light.metadata.x;
    if (kind == KIND_POINTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) {
        if flat_2d {
            let _e15 = evalPointFlatX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.colorTimesIntensity.xyz, light.position.w, world_pos, base_color);
            return _e15;
        }
        let _e27 = evalPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.colorTimesIntensity.xyz, light.position.w, world_pos, normal_4, view_dir, base_color, metallic_6, alpha_sq, f0_1);
        return _e27;
    }
    if (kind == KIND_SPOTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) {
        if flat_2d {
            let _e42 = evalSpotFlatX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.direction.xyz, light.colorTimesIntensity.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos, base_color);
            return _e42;
        }
        let _e52 = spotModifierFactorsX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX(light.position.xyz, light.direction.xyz, light.direction.w, world_pos, light.auxiliary.w, light.metadata);
        let modifier = (vec3(_e52.x) * _e52.yzw);
        let encoded_tile = bitcast<i32>(light.metadata.y);
        tile = encoded_tile;
        if (encoded_tile >= 0i) {
            local_5 = ((encoded_tile & PROJECTOR_FLAGX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) != 0i);
        } else {
            local_5 = false;
        }
        let _e70 = local_5;
        if _e70 {
            projector_selected = true;
            tile = (encoded_tile & TILE_MASKX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX);
        }
        let _e75 = tile;
        if (_e75 >= 0i) {
            let _e78 = tile;
            local_6 = (_e78 < 4i);
        } else {
            local_6 = false;
        }
        let _e84 = local_6;
        if _e84 {
            let _e99 = tile;
            let _e101 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj[_e99];
            let _e102 = tile;
            let _e107 = evalSpotShadowedX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.direction.xyz, light.colorTimesIntensity.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos, normal_4, view_dir, base_color, metallic_6, alpha_sq, f0_1, _e101, _e102, 0.005f, 0.05f, 3f, 1f);
            return (_e107 * modifier);
        }
        let _e121 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.direction.xyz, light.colorTimesIntensity.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos, normal_4, view_dir, base_color, metallic_6, alpha_sq, f0_1);
        return (_e121 * modifier);
    }
    if (kind == KIND_RECT_AREAX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) {
        let _e139 = evalRectAreaLtcGgxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(light.position.xyz, light.colorTimesIntensity.xyz, light.auxiliary.xyz, light.direction.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos, normal_4, view_dir, base_color, metallic_6, alpha_sq, f0_1);
        return _e139;
    }
    return vec3(0f);
}

fn evaluateStandardClusterLightsX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(ndc_1: vec3<f32>, view_z_2: f32, world_pos_1: vec3<f32>, normal_5: vec3<f32>, view_dir_1: vec3<f32>, base_color_1: vec3<f32>, metallic_7: f32, alpha_sq_1: f32, f0_2: vec3<f32>, flat_2d_1: bool) -> vec3<f32> {
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
            let _e69 = evaluate_cluster_lightX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(light_1, world_pos_1, normal_5, view_dir_1, base_color_1, metallic_7, alpha_sq_1, f0_2, flat_2d_1);
            total_radiance = (_e60 + _e69);
        }
        continuing {
            let _e71 = i;
            i = (_e71 + 1u);
        }
    }
    let _e74 = total_radiance;
    return _e74;
}

fn materialTextureFilteringWitness() {
    let baseWitness = textureSample(baseColorTexture, baseColorSampler, vec2(0f));
    return;
}

fn resolveSpriteVertex(in_5: VsIn, vertex_index_2: u32) -> SpriteVertex {
    var pos_local: vec3<f32>;
    var uv_atlas: vec2<f32>;
    var u_uv_arr: array<f32, 4>;
    var v_uv_arr: array<f32, 4>;
    var out_2: SpriteVertex;

    let _e2 = material.pivotAndSize;
    let pivot = _e2.xy;
    let _e6 = material.pivotAndSize;
    let size = _e6.zw;
    let _e10 = material.slicesAndMode;
    let useSlices = any((_e10 != vec4(0f)));
    if useSlices {
        let _e17 = material.slicesAndMode;
        let abs_slices = abs(_e17);
        let _e22 = material.slicesAndMode.w;
        let is_tile = (_e22 < 0f);
        let i_1 = (vertex_index_2 % 4u);
        let j = (vertex_index_2 / 4u);
        let u_pos_arr = array<f32, 4>(0f, abs_slices.x, (1f - abs_slices.z), 1f);
        let v_pos_arr = array<f32, 4>(0f, abs_slices.y, (1f - abs_slices.w), 1f);
        let u_pos = u_pos_arr[i_1];
        let v_pos_top = v_pos_arr[j];
        let v_pos_eff = (1f - v_pos_top);
        pos_local = vec3<f32>(((u_pos - pivot.x) * size.x), ((v_pos_eff - pivot.y) * size.y), 0f);
        u_uv_arr = array<f32, 4>(0f, abs_slices.x, (1f - abs_slices.z), 1f);
        v_uv_arr = array<f32, 4>(0f, abs_slices.y, (1f - abs_slices.w), 1f);
        if is_tile {
            let mid_u = ((1f - abs_slices.x) - abs_slices.z);
            let mid_v = ((1f - abs_slices.y) - abs_slices.w);
            u_uv_arr[2] = (abs_slices.x + (2f * mid_u));
            let _e92 = u_uv_arr[2];
            u_uv_arr[3] = (_e92 + abs_slices.z);
            v_uv_arr[2] = (abs_slices.y + (2f * mid_v));
            let _e102 = v_uv_arr[2];
            v_uv_arr[3] = (_e102 + abs_slices.w);
        }
        let uv_u = u_uv_arr[i_1];
        let uv_v_top = v_uv_arr[j];
        let uv_v_eff = (1f - uv_v_top);
        let _e114 = material.region;
        let _e119 = material.region;
        uv_atlas = ((vec2<f32>(uv_u, uv_v_eff) * _e114.zw) + _e119.xy);
    } else {
        let uv_eff = vec2<f32>(in_5.uv.x, (1f - in_5.uv.y));
        pos_local = vec3<f32>(((uv_eff - pivot) * size), 0f);
        let _e137 = material.region;
        let _e142 = material.region;
        uv_atlas = ((uv_eff * _e137.zw) + _e142.xy);
    }
    let _e147 = pos_local;
    out_2.posLocal = _e147;
    let _e149 = uv_atlas;
    out_2.uvAtlas = _e149;
    let _e150 = out_2;
    return _e150;
}

fn linear_to_srgb(linear: f32) -> f32 {
    let c = clamp(linear, 0f, 1f);
    return select((c * 12.92f), ((pow(c, 0.41666666f) * 1.055f) - 0.055f), (c > 0.0031308f));
}

fn spriteLitDirectional(albedo: vec3<f32>) -> vec3<f32> {
    let _e3 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightColor;
    return (albedo * _e3);
}

fn spriteLitShadeAccum(albedo_1: vec3<f32>, worldPos_11: vec3<f32>, ndc_2: vec3<f32>, viewZ: f32) -> vec3<f32> {
    var lit: vec3<f32>;

    let _e1 = spriteLitDirectional(albedo_1);
    lit = _e1;
    let _e6 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let viewDir_4 = normalize((_e6 - worldPos_11));
    let _e9 = lit;
    let _e21 = evaluateStandardClusterLightsX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(ndc_2, viewZ, worldPos_11, vec3<f32>(0f, 0f, 1f), viewDir_4, albedo_1, 0f, 1f, vec3(0.04f), true);
    lit = (_e9 + _e21);
    let _e23 = lit;
    return _e23;
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32, @builtin(vertex_index) vertex_index: u32) -> VsOut {
    var out: VsOut;

    let _e2 = resolveSpriteVertex(in, vertex_index);
    let _e6 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e11 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].localFromInstance;
    let world = ((_e6 * _e11) * vec4<f32>(_e2.posLocal, 1f));
    let _e21 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e21 * world);
    out.uv_atlas = _e2.uvAtlas;
    out.worldPos = world.xyz;
    let clipPos = out.clip;
    out.ndc = (clipPos.xyz / vec3(clipPos.w));
    let _e37 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e38 = sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clipPos, _e37);
    out.viewZ = _e38;
    let _e39 = out;
    return _e39;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    let _e4 = material.baseColorTextureCoordinatesMetadata;
    let _e8 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_1.uv_atlas, _e4.zw);
    let _e11 = material.colorTint;
    let albedo4_ = (_e8 * _e11);
    let _e17 = spriteLitShadeAccum(albedo4_.xyz, in_1.worldPos, in_1.ndc, in_1.viewZ);
    let lit_rgba = clamp(vec4<f32>(_e17, albedo4_.w), vec4(0f), vec4(1f));
    let premult = vec4<f32>((lit_rgba.xyz * lit_rgba.w), lit_rgba.w);
    let _e31 = linear_to_srgb(premult.x);
    let _e33 = linear_to_srgb(premult.y);
    let _e35 = linear_to_srgb(premult.z);
    return vec4<f32>(_e31, _e33, _e35, premult.w);
}

@fragment 
fn fs_main_hdr(in_2: VsOut) -> @location(0) vec4<f32> {
    let _e4 = material.baseColorTextureCoordinatesMetadata;
    let _e8 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_2.uv_atlas, _e4.zw);
    let _e11 = material.colorTint;
    let albedo4_1 = (_e8 * _e11);
    let _e17 = spriteLitShadeAccum(albedo4_1.xyz, in_2.worldPos, in_2.ndc, in_2.viewZ);
    let alpha = clamp(albedo4_1.w, 0f, 1f);
    return vec4<f32>((_e17 * alpha), alpha);
}

@vertex 
fn vs_temporal(in_3: VsIn, @builtin(instance_index) idx_1: u32, @builtin(vertex_index) vertex_index_1: u32) -> TemporalVsOut {
    var previousWorld: vec4<f32>;
    var out_1: TemporalVsOut;

    let _e2 = resolveSpriteVertex(in_3, vertex_index_1);
    let _e6 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e11 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx_1].localFromInstance;
    let currentWorld = ((_e6 * _e11) * vec4<f32>(_e2.posLocal, 1f));
    previousWorld = currentWorld;
    let _e21 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].previousWorldFromLocal;
    let _e25 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx_1].previousLocalFromInstance;
    previousWorld = ((_e21 * _e25) * vec4<f32>(_e2.posLocal, 1f));
    let _e35 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalCurrentViewProj;
    out_1.currentClip = (_e35 * currentWorld);
    let _e39 = out_1.currentClip;
    out_1.clip = _e39;
    let _e43 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalPreviousViewProj;
    let _e44 = previousWorld;
    out_1.previousClip = (_e43 * _e44);
    out_1.uvAtlas = _e2.uvAtlas;
    let _e48 = out_1;
    return _e48;
}

@fragment 
fn fs_temporal(in_4: TemporalVsOut) -> @location(0) vec4<f32> {
    let _e4 = material.baseColorTextureCoordinatesMetadata;
    let _e8 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, in_4.uvAtlas, _e4.zw);
    let _e13 = material.colorTint.w;
    let alpha_1 = clamp((_e8.w * _e13), 0f, 1f);
    if (alpha_1 <= 0f) {
        discard;
    }
    let _e24 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e26 = packSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(in_4.currentClip, in_4.previousClip, _e24, 1f);
    return _e26;
}
