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

struct ShadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    index: u32,
    isSpot: u32,
    shadowCasterPadB: u32,
    shadowCasterPadC: u32,
    spotLightViewProj: mat4x4<f32>,
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

struct CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) emissive_intensity: vec4<f32>,
    @location(3) surface: vec4<f32>,
    @location(4) local: vec3<f32>,
    @location(5) uv: vec2<f32>,
    @location(6) disp: f32,
    @location(7) tint: vec4<f32>,
}

struct Material {
    baseColor: vec4<f32>,
    shadowColor: vec4<f32>,
    rimColor: vec4<f32>,
    rimStrength: f32,
    specularStrength: f32,
    emissionStrength: f32,
    sideShade: f32,
    surfaceRoughness: f32,
    surfaceMetallic: f32,
    pigmentStrength: f32,
    pigmentScale: f32,
    cinderPrint: vec4<f32>,
    cinderSurface: vec4<f32>,
    vineGrowthShape: vec4<f32>,
}

struct Input {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
}

struct Surface {
    @builtin(position) clip: vec4<f32>,
    @location(0) world: vec3<f32>,
    @location(1) local: vec3<f32>,
    @location(2) normal: vec3<f32>,
    @location(3) viewZ: f32,
    @location(4) @interpolate(flat) variation: f32,
}

struct VineInput {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) path: vec2<f32>,
}

const THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX: u32 = 16u;
const THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX: array<vec2<f32>, 256> = array<vec2<f32>, 256>(vec2<f32>(0.14709473f, 0.8520508f), vec2<f32>(0.16552734f, 0.78759766f), vec2<f32>(0.24438477f, 0.6386719f), vec2<f32>(0.3708496f, 0.51953125f), vec2<f32>(0.49682617f, 0.41552734f), vec2<f32>(0.6020508f, 0.32641602f), vec2<f32>(0.68408203f, 0.25390625f), vec2<f32>(0.74609375f, 0.19750977f), vec2<f32>(0.79052734f, 0.15429688f), vec2<f32>(0.8222656f, 0.12164307f), vec2<f32>(0.8432617f, 0.09698486f), vec2<f32>(0.8564453f, 0.078430176f), vec2<f32>(0.86328125f, 0.06439209f), vec2<f32>(0.86572266f, 0.053710938f), vec2<f32>(0.8642578f, 0.045440674f), vec2<f32>(0.8598633f, 0.039031982f), vec2<f32>(0.38867188f, 0.6113281f), vec2<f32>(0.3930664f, 0.60058594f), vec2<f32>(0.41235352f, 0.54589844f), vec2<f32>(0.45654297f, 0.4482422f), vec2<f32>(0.52783203f, 0.35253906f), vec2<f32>(0.6074219f, 0.27392578f), vec2<f32>(0.67871094f, 0.21142578f), vec2<f32>(0.73339844f, 0.16259766f), vec2<f32>(0.7709961f, 0.12536621f), vec2<f32>(0.79345703f, 0.09729004f), vec2<f32>(0.80322266f, 0.07623291f), vec2<f32>(0.80371094f, 0.06036377f), vec2<f32>(0.7963867f, 0.048431396f), vec2<f32>(0.78564453f, 0.039367676f), vec2<f32>(0.77197266f, 0.032409668f), vec2<f32>(0.7548828f, 0.026977539f), vec2<f32>(0.5722656f, 0.42749023f), vec2<f32>(0.57373047f, 0.42407227f), vec2<f32>(0.57958984f, 0.40356445f), vec2<f32>(0.5917969f, 0.3544922f), vec2<f32>(0.61621094f, 0.28808594f), vec2<f32>(0.65527344f, 0.22485352f), vec2<f32>(0.69873047f, 0.17260742f), vec2<f32>(0.73535156f, 0.13183594f), vec2<f32>(0.75927734f, 0.10089111f), vec2<f32>(0.77001953f, 0.07745361f), vec2<f32>(0.77197266f, 0.059936523f), vec2<f32>(0.7661133f, 0.046844482f), vec2<f32>(0.7519531f, 0.036987305f), vec2<f32>(0.7324219f, 0.029541016f), vec2<f32>(0.70947266f, 0.023834229f), vec2<f32>(0.68359375f, 0.019439697f), vec2<f32>(0.7089844f, 0.29101563f), vec2<f32>(0.7089844f, 0.28979492f), vec2<f32>(0.70996094f, 0.28125f), vec2<f32>(0.70996094f, 0.25854492f), vec2<f32>(0.7114258f, 0.22045898f), vec2<f32>(0.71972656f, 0.17687988f), vec2<f32>(0.734375f, 0.13708496f), vec2<f32>(0.7480469f, 0.10479736f), vec2<f32>(0.7558594f, 0.07989502f), vec2<f32>(0.7597656f, 0.06100464f), vec2<f32>(0.75341797f, 0.046844482f), vec2<f32>(0.73876953f, 0.036224365f), vec2<f32>(0.71777344f, 0.028259277f), vec2<f32>(0.69189453f, 0.022262573f), vec2<f32>(0.6611328f, 0.017700195f), vec2<f32>(0.62841797f, 0.014198303f), vec2<f32>(0.80810547f, 0.19177246f), vec2<f32>(0.8076172f, 0.19128418f), vec2<f32>(0.80615234f, 0.18798828f), vec2<f32>(0.8017578f, 0.17810059f), vec2<f32>(0.79296875f, 0.1586914f), vec2<f32>(0.7836914f, 0.13220215f), vec2<f32>(0.7753906f, 0.1048584f), vec2<f32>(0.7685547f, 0.08111572f), vec2<f32>(0.76464844f, 0.0619812f), vec2<f32>(0.7553711f, 0.04727173f), vec2<f32>(0.7402344f, 0.03616333f), vec2<f32>(0.71875f, 0.027755737f), vec2<f32>(0.69091797f, 0.021484375f), vec2<f32>(0.6582031f, 0.016738892f), vec2<f32>(0.6220703f, 0.013160706f), vec2<f32>(0.5839844f, 0.010414124f), vec2<f32>(0.87841797f, 0.1217041f), vec2<f32>(0.8779297f, 0.1217041f), vec2<f32>(0.875f, 0.12060547f), vec2<f32>(0.8691406f, 0.11694336f), vec2<f32>(0.8569336f, 0.10803223f), vec2<f32>(0.8378906f, 0.09375f), vec2<f32>(0.8149414f, 0.0769043f), vec2<f32>(0.79589844f, 0.060699463f), vec2<f32>(0.7763672f, 0.046875f), vec2<f32>(0.75634766f, 0.03591919f), vec2<f32>(0.7324219f, 0.027450562f), vec2<f32>(0.703125f, 0.021026611f), vec2<f32>(0.6689453f, 0.016174316f), vec2<f32>(0.6303711f, 0.012512207f), vec2<f32>(0.58935547f, 0.009742737f), vec2<f32>(0.5463867f, 0.007633209f), vec2<f32>(0.92626953f, 0.073791504f), vec2<f32>(0.92578125f, 0.073913574f), vec2<f32>(0.92285156f, 0.073913574f), vec2<f32>(0.9169922f, 0.07312012f), vec2<f32>(0.9038086f, 0.06982422f), vec2<f32>(0.88134766f, 0.06311035f), vec2<f32>(0.8510742f, 0.05380249f), vec2<f32>(0.82128906f, 0.043701172f), vec2<f32>(0.7910156f, 0.03439331f), vec2<f32>(0.76123047f, 0.026611328f), vec2<f32>(0.72802734f, 0.020446777f), vec2<f32>(0.69189453f, 0.015655518f), vec2<f32>(0.6508789f, 0.012008667f), vec2<f32>(0.6074219f, 0.009254456f), vec2<f32>(0.56103516f, 0.007156372f), vec2<f32>(0.51416016f, 0.0055656433f), vec2<f32>(0.95751953f, 0.04232788f), vec2<f32>(0.95703125f, 0.04244995f), vec2<f32>(0.95458984f, 0.042816162f), vec2<f32>(0.94921875f, 0.043182373f), vec2<f32>(0.9370117f, 0.042663574f), vec2<f32>(0.91308594f, 0.040252686f), vec2<f32>(0.88183594f, 0.03579712f), vec2<f32>(0.84472656f, 0.030136108f), vec2<f32>(0.80615234f, 0.024337769f), vec2<f32>(0.76708984f, 0.01914978f), vec2<f32>(0.7265625f, 0.014854431f), vec2<f32>(0.6826172f, 0.011421204f), vec2<f32>(0.63623047f, 0.008773804f), vec2<f32>(0.58691406f, 0.00674057f), vec2<f32>(0.5366211f, 0.0051994324f), vec2<f32>(0.48608398f, 0.004020691f), vec2<f32>(0.97753906f, 0.022628784f), vec2<f32>(0.9770508f, 0.022750854f), vec2<f32>(0.97509766f, 0.02319336f), vec2<f32>(0.96972656f, 0.023910522f), vec2<f32>(0.95947266f, 0.024490356f), vec2<f32>(0.93603516f, 0.024124146f), vec2<f32>(0.90527344f, 0.022521973f), vec2<f32>(0.8652344f, 0.019760132f), vec2<f32>(0.82177734f, 0.01651001f), vec2<f32>(0.77441406f, 0.013290405f), vec2<f32>(0.7265625f, 0.0104599f), vec2<f32>(0.67626953f, 0.008132935f), vec2<f32>(0.62402344f, 0.0062789917f), vec2<f32>(0.5698242f, 0.004825592f), vec2<f32>(0.5151367f, 0.0037136078f), vec2<f32>(0.46142578f, 0.0028629303f), vec2<f32>(0.98876953f, 0.011070251f), vec2<f32>(0.98876953f, 0.011161804f), vec2<f32>(0.9868164f, 0.011512756f), vec2<f32>(0.98291016f, 0.012214661f), vec2<f32>(0.97314453f, 0.012992859f), vec2<f32>(0.953125f, 0.013519287f), vec2<f32>(0.92285156f, 0.013282776f), vec2<f32>(0.8823242f, 0.012260437f), vec2<f32>(0.83496094f, 0.010658264f), vec2<f32>(0.7832031f, 0.008850098f), vec2<f32>(0.7285156f, 0.0071144104f), vec2<f32>(0.671875f, 0.005607605f), vec2<f32>(0.61376953f, 0.004360199f), vec2<f32>(0.5546875f, 0.0033721924f), vec2<f32>(0.4963379f, 0.0025997162f), vec2<f32>(0.43945313f, 0.0020046234f), vec2<f32>(0.9951172f, 0.004798889f), vec2<f32>(0.9951172f, 0.004863739f), vec2<f32>(0.99365234f, 0.0050964355f), vec2<f32>(0.9902344f, 0.0056037903f), vec2<f32>(0.9814453f, 0.0063323975f), vec2<f32>(0.96435547f, 0.0069770813f), vec2<f32>(0.93603516f, 0.007297516f), vec2<f32>(0.8964844f, 0.0071258545f), vec2<f32>(0.8466797f, 0.0064926147f), vec2<f32>(0.7915039f, 0.005596161f), vec2<f32>(0.7314453f, 0.004627228f), vec2<f32>(0.6689453f, 0.0037174225f), vec2<f32>(0.60546875f, 0.0029296875f), vec2<f32>(0.5415039f, 0.002281189f), vec2<f32>(0.47924805f, 0.0017662048f), vec2<f32>(0.41967773f, 0.0013656616f), vec2<f32>(0.9980469f, 0.0017604828f), vec2<f32>(0.9980469f, 0.0017938614f), vec2<f32>(0.99658203f, 0.0019292831f), vec2<f32>(0.9941406f, 0.0022392273f), vec2<f32>(0.9863281f, 0.002729416f), vec2<f32>(0.9716797f, 0.003250122f), vec2<f32>(0.9458008f, 0.0036697388f), vec2<f32>(0.90771484f, 0.003818512f), vec2<f32>(0.85839844f, 0.0036811829f), vec2<f32>(0.7993164f, 0.003320694f), vec2<f32>(0.73535156f, 0.0028438568f), vec2<f32>(0.66748047f, 0.0023441315f), vec2<f32>(0.5986328f, 0.0018796921f), vec2<f32>(0.53027344f, 0.0014829636f), vec2<f32>(0.46411133f, 0.0011587143f), vec2<f32>(0.4020996f, 0.0008993149f), vec2<f32>(0.9995117f, 0.00050115585f), vec2<f32>(0.9995117f, 0.00051546097f), vec2<f32>(0.9980469f, 0.0005836487f), vec2<f32>(0.99658203f, 0.0007505417f), vec2<f32>(0.9892578f, 0.0010147095f), vec2<f32>(0.9760742f, 0.0013465881f), vec2<f32>(0.9526367f, 0.0016527176f), vec2<f32>(0.9160156f, 0.0018558502f), vec2<f32>(0.8671875f, 0.0019054413f), vec2<f32>(0.8076172f, 0.0018167496f), vec2<f32>(0.7392578f, 0.0016212463f), vec2<f32>(0.6669922f, 0.0013799667f), vec2<f32>(0.5932617f, 0.0011358261f), vec2<f32>(0.52001953f, 0.0009121895f), vec2<f32>(0.45043945f, 0.00072193146f), vec2<f32>(0.38598633f, 0.00056505203f), vec2<f32>(1f, 0.00009316206f), vec2<f32>(1f, 0.00009787083f), vec2<f32>(0.99902344f, 0.00012540817f), vec2<f32>(0.9970703f, 0.00019216537f), vec2<f32>(0.99072266f, 0.000310421f), vec2<f32>(0.9790039f, 0.00046992302f), vec2<f32>(0.95751953f, 0.000647068f), vec2<f32>(0.92333984f, 0.0007915497f), vec2<f32>(0.8754883f, 0.00087690353f), vec2<f32>(0.8149414f, 0.0008869171f), vec2<f32>(0.7441406f, 0.0008325577f), vec2<f32>(0.66748047f, 0.00073862076f), vec2<f32>(0.5883789f, 0.000626564f), vec2<f32>(0.51123047f, 0.0005168915f), vec2<f32>(0.43823242f, 0.00041651726f), vec2<f32>(0.37109375f, 0.0003311634f), vec2<f32>(1f, 0.0000072717667f), vec2<f32>(1f, 0.000008165836f), vec2<f32>(0.99902344f, 0.000016987324f), vec2<f32>(0.9975586f, 0.000037908554f), vec2<f32>(0.9921875f, 0.00007593632f), vec2<f32>(0.9814453f, 0.00013744831f), vec2<f32>(0.9614258f, 0.00020754337f), vec2<f32>(0.9291992f, 0.00028014183f), vec2<f32>(0.8828125f, 0.00033450127f), vec2<f32>(0.82177734f, 0.00036263466f), vec2<f32>(0.74902344f, 0.00036215782f), vec2<f32>(0.66845703f, 0.00033807755f), vec2<f32>(0.5854492f, 0.00029969215f), vec2<f32>(0.50390625f, 0.00025582314f), vec2<f32>(0.42700195f, 0.0002117157f), vec2<f32>(0.35766602f, 0.000172019f), vec2<f32>(1f, 0f), vec2<f32>(1f, 0.000000059604645f), vec2<f32>(0.9995117f, 0.0000012516975f), vec2<f32>(0.9975586f, 0.0000053048134f), vec2<f32>(0.99316406f, 0.000015079975f), vec2<f32>(0.98291016f, 0.000028550625f), vec2<f32>(0.96435547f, 0.000047445297f), vec2<f32>(0.93408203f, 0.00006842613f), vec2<f32>(0.88916016f, 0.00008893013f), vec2<f32>(0.828125f, 0.000104248524f), vec2<f32>(0.75390625f, 0.00011217594f), vec2<f32>(0.67041016f, 0.00011241436f), vec2<f32>(0.5830078f, 0.00010627508f), vec2<f32>(0.4970703f, 0.00009584427f), vec2<f32>(0.4169922f, 0.00008332729f), vec2<f32>(0.34521484f, 0.000070512295f));

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(7) 
var<uniform> shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ShadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(3) @binding(0) 
var<storage> instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(0) @binding(3) 
var shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_depth_2d;
@group(0) @binding(4) 
var shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: sampler_comparison;
@group(1) @binding(0) 
var<uniform> material: Material;

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
    let fresnel_1 = exp2((((-5.55473f * vDotH) - 6.98316f) * vDotH));
    return ((f0_ * (vec3(1f) - vec3(fresnel_1))) + vec3(fresnel_1));
}

fn sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness: f32, dotNV: f32) -> vec2<f32> {
    let uv = clamp(vec2<f32>(roughness, dotNV), vec2(0f), vec2(1f));
    let samplePosition = ((uv * 16f) - vec2(0.5f));
    let base_2 = vec2<i32>(floor(samplePosition));
    let weight = fract(samplePosition);
    let lo = clamp(base_2, vec2(0i), vec2(15i));
    let hi = clamp((base_2 + vec2(1i)), vec2(0i), vec2(15i));
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

fn _pickCascadeLayerX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(viewDepth: f32, count: u32) -> u32 {
    var layer: u32;
    var i: u32 = 0u;

    layer = (count - 1u);
    loop {
        let _e6 = i;
        if (_e6 < (count - 1u)) {
        } else {
            break;
        }
        {
            let _e12 = i;
            let sp = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[_e12].x;
            if (viewDepth < sp) {
                let _e18 = i;
                layer = _e18;
                break;
            }
        }
        continuing {
            let _e19 = i;
            i = (_e19 + 1u);
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
    let tile = vec2<u32>((layer_2 % _e1.x), (layer_2 / _e1.x));
    return (vec2<f32>(tile) / vec2<f32>(_e1));
}

fn _directionalReceiverDepthBiasX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_3: u32, normal: vec3<f32>, l: vec3<f32>, radius: f32) -> f32 {
    var local: bool;

    let nDotL_2 = dot(normal, l);
    let depthSpan = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_3].z;
    if (nDotL_2 > 0.01f) {
        local = (depthSpan > 0f);
    } else {
        local = false;
    }
    let _e16 = local;
    if !(_e16) {
        let _e20 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
        return _e20;
    }
    let _e21 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_3);
    let right = normalize(vec3<f32>(_e21[0].x, _e21[1].x, _e21[2].x));
    let up = normalize(vec3<f32>(_e21[0].y, _e21[1].y, _e21[2].y));
    let slope = ((abs(dot(normal, right)) + abs(dot(normal, up))) / nDotL_2);
    let _e49 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_3].y;
    let footprint = ((_e49 * radius) * slope);
    let _e54 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
    let _e57 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.normalBias;
    return (_e54 + (max(0f, (footprint - (_e57 / nDotL_2))) / depthSpan));
}

fn _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos: vec3<f32>, layer_4: u32, count_4: u32, normal_1: vec3<f32>, l_1: vec3<f32>) -> f32 {
    var local_1: bool;
    var local_2: bool;
    var local_3: bool;
    var local_4: bool;
    var blocked: f32 = 0f;
    var local_5: bool;
    var x: i32 = -1i;
    var y: i32;
    var x_1: i32 = -2i;
    var y_1: i32;

    let _e4 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_4);
    let lightClip = (_e4 * vec4<f32>(worldPos, 1f));
    let projCoords = (lightClip.xyz / vec3(lightClip.w));
    let _e14 = _atlasTileScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_4);
    let _e15 = _atlasTileOriginX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_4, count_4);
    let tileUv = vec2<f32>(((projCoords.x * 0.5f) + 0.5f), ((-(projCoords.y) * 0.5f) + 0.5f));
    let uv_1 = ((tileUv * _e14) + _e15);
    let currentDepth = projCoords.z;
    if (tileUv.x >= 0f) {
        local_1 = (tileUv.x <= 1f);
    } else {
        local_1 = false;
    }
    let _e40 = local_1;
    if _e40 {
        local_2 = (tileUv.y >= 0f);
    } else {
        local_2 = false;
    }
    let _e47 = local_2;
    if _e47 {
        local_3 = (tileUv.y <= 1f);
    } else {
        local_3 = false;
    }
    let _e54 = local_3;
    if _e54 {
        local_4 = (currentDepth <= 1f);
    } else {
        local_4 = false;
    }
    let _e60 = local_4;
    if !(_e60) {
        return 1f;
    }
    let _e65 = textureDimensions(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 0i);
    let texelDims = vec2<f32>(_e65);
    let texel = vec2<f32>((1f / texelDims.x), (1f / texelDims.y));
    let tileLo = (_e15 + texel);
    let tileHi = ((_e15 + _e14) - texel);
    let _e80 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.x;
    let filterProfile = clamp(u32(round(_e80)), 1u, 5u);
    let kernel = select(select(3u, 5u, (filterProfile == 3u)), 1u, (filterProfile == 1u));
    let _e102 = _directionalReceiverDepthBiasX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_4, normal_1, l_1, f32(((kernel / 2u) + 1u)));
    let adjustedDepth = (currentDepth - _e102);
    if (kernel == 1u) {
        let lit_1 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, clamp(uv_1, tileLo, tileHi), adjustedDepth);
        return lit_1;
    }
    if (kernel == 3u) {
        if all((uv_1 >= (tileLo + texel))) {
            local_5 = all((uv_1 <= (tileHi - texel)));
        } else {
            local_5 = false;
        }
        let interior = local_5;
        if interior {
            let pcfFraction = fract(((uv_1 / texel) - vec2(0.5f)));
            let loWeight = (vec2(2f) - pcfFraction);
            let hiWeight = (vec2(1f) + pcfFraction);
            let loOffset = ((vec2(-1f) - pcfFraction) + (vec2(1f) / loWeight));
            let hiOffset = ((vec2(1f) - pcfFraction) + (pcfFraction / hiWeight));
            let litLoLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_1 + (vec2<f32>(loOffset.x, loOffset.y) * texel)), adjustedDepth);
            let litHiLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_1 + (vec2<f32>(hiOffset.x, loOffset.y) * texel)), adjustedDepth);
            let litLoHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_1 + (vec2<f32>(loOffset.x, hiOffset.y) * texel)), adjustedDepth);
            let litHiHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_1 + (vec2<f32>(hiOffset.x, hiOffset.y) * texel)), adjustedDepth);
            return ((((((litLoLo * loWeight.x) * loWeight.y) + ((litHiLo * hiWeight.x) * loWeight.y)) + ((litLoHi * loWeight.x) * hiWeight.y)) + ((litHiHi * hiWeight.x) * hiWeight.y)) / 9f);
        }
        loop {
            let _e199 = x;
            if (_e199 <= 1i) {
            } else {
                break;
            }
            {
                y = -1i;
                loop {
                    let _e204 = y;
                    if (_e204 <= 1i) {
                    } else {
                        break;
                    }
                    {
                        let _e207 = x;
                        let _e209 = y;
                        let offsetUv = clamp((uv_1 + (vec2<f32>(f32(_e207), f32(_e209)) * texel)), tileLo, tileHi);
                        let lit_2 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv, adjustedDepth);
                        let _e219 = blocked;
                        blocked = (_e219 + (1f - lit_2));
                    }
                    continuing {
                        let _e224 = y;
                        y = (_e224 + 1i);
                    }
                }
            }
            continuing {
                let _e227 = x;
                x = (_e227 + 1i);
            }
        }
        let _e229 = blocked;
        return (1f - (_e229 / 9f));
    }
    loop {
        let _e235 = x_1;
        if (_e235 <= 2i) {
        } else {
            break;
        }
        {
            y_1 = -2i;
            loop {
                let _e240 = y_1;
                if (_e240 <= 2i) {
                } else {
                    break;
                }
                {
                    let _e243 = x_1;
                    let _e245 = y_1;
                    let offsetUv_1 = clamp((uv_1 + (vec2<f32>(f32(_e243), f32(_e245)) * texel)), tileLo, tileHi);
                    let lit_3 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv_1, adjustedDepth);
                    let _e254 = blocked;
                    blocked = (_e254 + (1f - lit_3));
                }
                continuing {
                    let _e259 = y_1;
                    y_1 = (_e259 + 1i);
                }
            }
        }
        continuing {
            let _e262 = x_1;
            x_1 = (_e262 + 1i);
        }
    }
    let _e264 = blocked;
    return (1f - (_e264 / 25f));
}

fn evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_2: vec3<f32>, worldPos_1: vec3<f32>, viewZ: f32) -> f32 {
    var shadow: f32;
    var local_6: bool;

    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeCount;
    if (_e2 < 1f) {
        return 1f;
    }
    let _e8 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let l_2 = normalize(-(_e8));
    let _e13 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeCount;
    let count_5 = u32(max(_e13, 1f));
    let viewDepth_1 = -(viewZ);
    let _e25 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[(count_5 - 1u)].x;
    if (viewDepth_1 > _e25) {
        return 1f;
    }
    let _e28 = _pickCascadeLayerX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(viewDepth_1, count_5);
    let _e33 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.normalBias;
    let receiverPosition = (worldPos_1 + (normal_2 * _e33));
    let _e36 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(receiverPosition, _e28, count_5, normal_2, l_2);
    shadow = _e36;
    let _e40 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
    if (_e40 > 0f) {
        local_6 = ((_e28 + 1u) < count_5);
    } else {
        local_6 = false;
    }
    let _e49 = local_6;
    if _e49 {
        let spCurr = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[_e28].x;
        let _e57 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
        let blendWidth = (spCurr * _e57);
        if (blendWidth > 0f) {
            let dist = (spCurr - viewDepth_1);
            let t = clamp((1f - (dist / blendWidth)), 0f, 1f);
            if (t > 0f) {
                let _e72 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(receiverPosition, (_e28 + 1u), count_5, normal_2, l_2);
                shadow = mix(_e36, _e72, t);
            }
        }
    }
    let _e74 = shadow;
    return _e74;
}

fn illustratedDiffuseX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJOQ5DU2LMNR2XG5DSMF2GKZC7NRUWO2DUNFXGOX(surface: vec3<f32>, shadowPigment: vec3<f32>, normal_3: vec3<f32>, visibility: f32, sideShade: f32, continuous: bool) -> vec3<f32> {
    var diffuse: f32;

    let _e3 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let nDotL_3 = dot(normal_3, normalize(-(_e3)));
    let up_1 = clamp(normal_3.y, 0f, 1f);
    diffuse = ((0.52f * smoothstep(0f, 0.14f, nDotL_3)) + (0.48f * smoothstep(0.6f, 0.78f, nDotL_3)));
    if continuous {
        diffuse = max(0f, nDotL_3);
    }
    let fill = (mix(shadowPigment, surface, 0.16f) * vec3<f32>(0.88f, 1.02f, 1.12f));
    let ambient = (fill * mix(0.82f, 1f, up_1));
    let _e41 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightColor;
    let _e43 = diffuse;
    let direct = ((surface * _e41) * ((0.54f * _e43) * visibility));
    let plane = mix(sideShade, 1f, (0.65f + (0.35f * up_1)));
    return ((ambient + direct) * plane);
}

fn paintedSpecularX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJOQ5DU4DBNFXHIZLSNR4V643VOJTGCY3FX(base: vec3<f32>, normal_4: vec3<f32>, light: vec3<f32>, camera: vec3<f32>, roughness_2: f32, metallic: f32, strength: f32, visibility_1: f32) -> vec3<f32> {
    let halfVector = normalize((light + camera));
    let smoothness = (1f - clamp(roughness_2, 0.04f, 1f));
    let lobe = pow(max(dot(normal_4, halfVector), 0f), mix(12f, 112f, smoothness));
    let reflection = (((((strength * smoothness) * smoothness) * lobe) * max(dot(normal_4, light), 0f)) * visibility_1);
    return (mix(vec3<f32>(0.88f, 0.86f, 0.81f), base, metallic) * reflection);
}

fn cinder_printX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(value: vec4<f32>, pixel: vec2<f32>, tint: vec4<f32>, print: vec4<f32>) -> vec4<f32> {
    var color: vec3<f32>;

    if (value.w <= 0.00001f) {
        discard;
    }
    let straight = max((value.xyz / vec3(value.w)), vec3(0f));
    let brightness = max(max(straight.x, straight.y), straight.z);
    let shade = mix(clamp(brightness, 0.2f, 1.6f), ((floor((clamp(brightness, 0f, 1.5f) * 3f)) / 3f) + 0.22f), print.z);
    color = mix(straight, (tint.xyz * shade), tint.w);
    let grid = (pixel / vec2(max(4f, print.w)));
    let cell = (fract(vec2<f32>((grid.x + (grid.y * 0.22f)), grid.y)) - vec2(0.5f));
    let radius_1 = mix(0.12f, 0.32f, (1f - clamp(brightness, 0f, 1f)));
    let dots = (1f - smoothstep((radius_1 - 0.035f), (radius_1 + 0.035f), length(cell)));
    let line1_ = (1f - smoothstep(0.06f, 0.15f, abs((fract((grid.x + grid.y)) - 0.5f))));
    let line2_ = (1f - smoothstep(0.06f, 0.15f, abs((fract((grid.x - grid.y)) - 0.5f))));
    let hatch = max(line1_, (line2_ * (1f - smoothstep(0.3f, 0.8f, brightness))));
    let _e102 = color;
    color = mix(_e102, vec3<f32>(0.006f, 0.004f, 0.015f), (max((dots * print.x), (hatch * print.y)) * 0.9f));
    let _e115 = color;
    return vec4<f32>((_e115 * value.w), value.w);
}

fn cinder_hashX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(p: vec2<f32>) -> f32 {
    return fract((sin(dot(p, vec2<f32>(127.1f, 311.7f))) * 43758.547f));
}

fn cinder_rock_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input: CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX) -> vec4<f32> {
    var rock: vec3<f32>;

    let normal_5 = normalize(input.normal);
    let viewDirection = vec3<f32>(0f, 0f, 1f);
    let seed = input.color.x;
    let heat = input.color.y;
    let charge = input.color.z;
    let visibility_2 = input.color.w;
    let p_2 = (input.local * (3.4f + (seed * 0.7f)));
    let field = ((sin(((p_2.x * 2.3f) + sin((p_2.z * 1.7f)))) + sin(((p_2.y * 2.7f) + (p_2.x * 0.8f)))) + sin((((p_2.z * 3.1f) - (p_2.y * 1.2f)) + (seed * 9f))));
    let distance_ = (abs(field) / 3f);
    let width = (0.055f * (1f + (charge * 0.8f)));
    let fissure = (1f - smoothstep((width * 0.35f), width, distance_));
    let lip = (1f - smoothstep(width, (width * 2.5f), distance_));
    let core = (1f - smoothstep(0f, (width * 0.42f), distance_));
    let lightDirection = vec3<f32>(0.36034632f, 0.7412839f, 0.5662585f);
    let diffuse_1 = (0.18f + (0.82f * max(dot(normal_5, lightDirection), 0f)));
    let _e93 = cinder_hashX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX((floor((normal_5.xy * 19f)) + vec2(seed)));
    let facet = (0.72f + (0.28f * _e93));
    rock = mix(vec3<f32>(0.21f, 0.16f, 0.12f), vec3<f32>(0.035f, 0.022f, 0.016f), (lip * 0.88f));
    let _e110 = rock;
    rock = (_e110 * (diffuse_1 * facet));
    let flow = (0.68f + (0.32f * sin((((seed * 31f) + (charge * 9f)) + (p_2.y * 3f)))));
    let magma = (((mix(vec3<f32>(1f, 0.12f, 0.005f), vec3<f32>(4.2f, 2.4f, 0.62f), core) * fissure) * heat) * flow);
    let rim = ((pow((1f - abs(dot(normal_5, viewDirection))), 2.2f) * charge) * charge);
    let _e147 = rock;
    let rgb = (((_e147 * (1f - (fissure * 0.9f))) + magma) + (vec3<f32>(1f, 0.12f, 0.01f) * rim));
    return vec4<f32>((rgb * visibility_2), visibility_2);
}

fn seedVineCentre(u: f32) -> vec3<f32> {
    let _e4 = material.vineGrowthShape.z;
    let angle = ((u * _e4) * 6.2831855f);
    let _e11 = material.vineGrowthShape.y;
    let radius_2 = (_e11 * (1f - (((0.45f * u) * u) * u)));
    let _e24 = material.vineGrowthShape.x;
    return vec3<f32>((cos(angle) * radius_2), (_e24 * u), (sin(angle) * radius_2));
}

fn seedVinePosition(v_3: VineInput, instance: mat4x4<f32>) -> vec4<f32> {
    var pos: vec3<f32>;

    if (v_3.path.y < 0.5f) {
        let _e9 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
        return ((_e9 * instance) * vec4<f32>(v_3.pos, 1f));
    }
    let growth = clamp(length(instance[1].xyz), 0.001f, 1f);
    let u_1 = v_3.path.x;
    pos = v_3.pos;
    if (u_1 >= growth) {
        let _e26 = seedVineCentre(growth);
        pos = _e26;
    } else {
        let _e31 = material.vineGrowthShape.w;
        if ((growth - u_1) < _e31) {
            let _e36 = material.vineGrowthShape.w;
            let tip = smoothstep(0f, _e36, (growth - u_1));
            let _e40 = seedVineCentre(u_1);
            pos = (_e40 + ((v_3.pos - _e40) * tip));
        }
    }
    let _e47 = pos.y;
    pos.y = (max(0f, _e47) / growth);
    let _e54 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e56 = pos;
    return ((_e54 * instance) * vec4<f32>(_e56, 1f));
}

fn face(s_7: Surface) -> vec3<f32> {
    let _e2 = dpdy(s_7.world);
    let _e4 = dpdx(s_7.world);
    let n_2 = normalize(cross(_e2, _e4));
    let _e10 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    return select(-(n_2), n_2, (dot(n_2, (_e10 - s_7.world)) > 0f));
}

fn lit(s_8: Surface, base_1: vec3<f32>, n: vec3<f32>) -> vec3<f32> {
    let _e4 = evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(n, s_8.world, s_8.viewZ);
    let _e7 = material.shadowColor;
    let _e11 = material.sideShade;
    let _e14 = illustratedDiffuseX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJOQ5DU2LMNR2XG5DSMF2GKZC7NRUWO2DUNFXGOX(base_1, _e7.xyz, n, _e4, _e11, false);
    let _e17 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let _e22 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let _e28 = material.surfaceRoughness;
    let _e31 = material.surfaceMetallic;
    let _e34 = material.specularStrength;
    let _e35 = paintedSpecularX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJOQ5DU4DBNFXHIZLSNR4V643VOJTGCY3FX(base_1, n, normalize(-(_e17)), normalize((_e22 - s_8.world)), _e28, _e31, _e34, _e4);
    return (_e14 + _e35);
}

fn fresnel(s_9: Surface, n_1: vec3<f32>) -> f32 {
    let _e4 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    return pow((1f - abs(dot(n_1, normalize((_e4 - s_9.world))))), 3f);
}

fn cracks(p_1: vec3<f32>) -> f32 {
    let vein = abs((sin((((p_1.x * 11f) + (p_1.y * 7f)) + sin((p_1.z * 9f)))) * sin(((p_1.z * 8f) - (p_1.y * 13f)))));
    return (1f - smoothstep(0.015f, 0.045f, vein));
}

@vertex 
fn vs_main(v: Input, @builtin(instance_index) idx: u32) -> Surface {
    var o: Surface;

    let _e3 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e8 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].localFromInstance;
    let m = (_e3 * _e8);
    let p_3 = (m * vec4<f32>(v.pos, 1f));
    let _e19 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    o.clip = (_e19 * p_3);
    o.world = p_3.xyz;
    o.local = v.pos;
    o.normal = normalize((m * vec4<f32>(v.normal, 0f)).xyz);
    let _e35 = o.clip.w;
    o.viewZ = -(_e35);
    o.variation = fract((f32(idx) * 0.618034f));
    let _e42 = o;
    return _e42;
}

@vertex 
fn vs_seed_vine(v_1: VineInput, @builtin(instance_index) idx_1: u32) -> Surface {
    var o_1: Surface;

    let _e3 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e8 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx_1].localFromInstance;
    let m_1 = (_e3 * _e8);
    let _e13 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx_1].localFromInstance;
    let _e15 = seedVinePosition(v_1, _e13);
    let _e20 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    o_1.clip = (_e20 * _e15);
    o_1.world = _e15.xyz;
    o_1.local = v_1.pos;
    o_1.normal = normalize((m_1 * vec4<f32>(v_1.normal, 0f)).xyz);
    let _e36 = o_1.clip.w;
    o_1.viewZ = -(_e36);
    o_1.variation = fract((f32(idx_1) * 0.618034f));
    let _e43 = o_1;
    return _e43;
}

@vertex 
fn vs_seed_vine_shadow(v_2: VineInput, @builtin(instance_index) idx_2: u32) -> @builtin(position) vec4<f32> {
    let _e4 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx_2].localFromInstance;
    let _e6 = seedVinePosition(v_2, _e4);
    let _e9 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.isSpot;
    if (_e9 == 1u) {
        let _e14 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj;
        return (_e14 * _e6);
    }
    let _e18 = shadowCasterCascadeX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.index;
    switch _e18 {
        case 0u: {
            let _e21 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_A;
            return (_e21 * _e6);
        }
        case 1u: {
            let _e25 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_B;
            return (_e25 * _e6);
        }
        case 2u: {
            let _e29 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_C;
            return (_e29 * _e6);
        }
        default: {
            let _e33 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightViewProj_D;
            return (_e33 * _e6);
        }
    }
}

@fragment 
fn fs_seed_vine_shadow() {
    return;
}

@fragment 
fn fs_fire(s: Surface) -> @location(0) vec4<f32> {
    let _e1 = face(s);
    let fold = sin((((s.local.x * 8f) + (s.local.z * 4f)) + sin((s.local.y * 7f))));
    let hot = smoothstep(-0.1f, 0.7f, fold);
    let _e23 = material.shadowColor;
    let _e27 = material.baseColor;
    let color_1 = mix(_e23.xyz, _e27.xyz, (0.3f + (hot * 0.7f)));
    let _e34 = lit(s, color_1, _e1);
    let _e37 = material.baseColor;
    let _e41 = material.rimColor;
    let _e52 = material.rimColor;
    let _e54 = fresnel(s, _e1);
    return vec4<f32>(((_e34 + (mix(_e37.xyz, _e41.xyz, hot) * (0.35f + (hot * 0.7f)))) + ((_e52.xyz * _e54) * 0.5f)), 1f);
}

@fragment 
fn fs_meteor(s_1: Surface) -> @location(0) vec4<f32> {
    var source: CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX;

    let _e1 = face(s_1);
    source.normal = _e1;
    source.local = s_1.local;
    let _e10 = material.cinderSurface.z;
    let _e14 = material.cinderSurface.w;
    source.color = vec4<f32>(0f, _e10, _e14, 1f);
    let _e18 = source;
    let _e19 = cinder_rock_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(_e18);
    let _e24 = material.cinderSurface.x;
    let _e32 = material.baseColor;
    let _e35 = material.cinderPrint;
    let _e36 = cinder_printX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(vec4<f32>((_e19.xyz * _e24), 1f), s_1.clip.xy, _e32, _e35);
    let _e41 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let edge = abs(dot(normalize(s_1.normal), normalize((_e41 - s_1.world))));
    let _e47 = fwidth(edge);
    let _e53 = material.cinderSurface.y;
    let _e64 = material.cinderSurface.y;
    let inside = select(1f, smoothstep(0.02f, (0.02f + (max(_e47, 0.005f) * max(_e53, 0.001f))), edge), (_e64 > 0f));
    let _e74 = lit(s_1, _e36.xyz, _e1);
    return vec4<f32>(mix(vec3<f32>(0.004f, 0.003f, 0.012f), _e74, inside), 1f);
}

@fragment 
fn fs_ice(s_2: Surface) -> @location(0) vec4<f32> {
    let _e1 = face(s_2);
    let _e2 = fresnel(s_2, _e1);
    let tip_1 = smoothstep(0.1f, 0.82f, s_2.local.z);
    let faceTone = clamp(((dot(_e1, vec3<f32>(-0.4866643f, 0.81110716f, 0.32444286f)) * 0.5f) + 0.5f), 0f, 1f);
    let _e23 = cracks((s_2.local * 1.7f));
    let seam = (_e23 * 0.08f);
    let _e28 = material.shadowColor;
    let _e32 = material.baseColor;
    let base_3 = mix(_e28.xyz, _e32.xyz, (0.25f + (faceTone * 0.7f)));
    let milk = ((tip_1 * 0.32f) + (s_2.variation * 0.16f));
    let _e47 = material.rimColor;
    let _e50 = lit(s_2, mix(base_3, _e47.xyz, milk), _e1);
    let _e53 = material.rimColor;
    let _e66 = material.baseColor.w;
    return vec4<f32>((_e50 + (_e53.xyz * (((_e2 * 0.32f) + seam) + (tip_1 * 0.12f)))), clamp(((_e66 + (_e2 * 0.18f)) + (tip_1 * 0.15f)), 0f, 0.92f));
}

@fragment 
fn fs_bark(s_3: Surface) -> @location(0) vec4<f32> {
    let _e1 = face(s_3);
    let grain = sin(((atan2(s_3.local.x, ((s_3.local.z * 0.12f) + 0.12f)) * 21f) + (sin((s_3.local.y * 5f)) * 0.7f)));
    let ridge = smoothstep(-0.35f, 0.4f, grain);
    let _e27 = material.shadowColor;
    let _e31 = material.baseColor;
    let bark = mix(_e27.xyz, _e31.xyz, ((0.35f + (ridge * 0.55f)) + (s_3.variation * 0.1f)));
    let _e70 = material.cinderSurface.w;
    let moss = (((smoothstep(0.55f, 0.95f, sin((((s_3.local.y * 3f) + (s_3.local.x * 7f)) + (s_3.local.z * 4f)))) * smoothstep(-0.1f, 0.7f, _e1.y)) * 0.65f) * _e70);
    let _e74 = material.rimColor;
    let _e77 = lit(s_3, mix(bark, _e74.xyz, moss), _e1);
    return vec4<f32>(_e77, 1f);
}

@fragment 
fn fs_leaf(s_4: Surface) -> @location(0) vec4<f32> {
    let _e1 = face(s_4);
    let vein_1 = (1f - smoothstep(0.008f, 0.025f, abs(s_4.local.x)));
    let _e12 = material.baseColor;
    let _e16 = material.rimColor;
    let leaf = mix(_e12.xyz, _e16.xyz, (((vein_1 * 0.25f) + (s_4.variation * 0.3f)) + (max(0f, _e1.y) * 0.15f)));
    let _e31 = lit(s_4, leaf, _e1);
    return vec4<f32>(_e31, 1f);
}

@fragment 
fn fs_stratum(s_5: Surface) -> @location(0) vec4<f32> {
    let _e1 = face(s_5);
    let strata = sin(((s_5.local.y * 40f) + (sin(((s_5.local.x * 5f) + (s_5.local.z * 3f))) * 0.45f)));
    let layer_5 = mix(select(0.68f, 0.92f, (strata > -0.35f)), 1f, max(0f, _e1.y));
    let fault = min(abs(((((s_5.local.x * 0.8f) + (s_5.local.z * 0.3f)) - 0.17f) + (floor((s_5.local.z * 4f)) * 0.025f))), abs((((s_5.local.z * 0.9f) - (s_5.local.x * 0.35f)) + 0.22f)));
    let fracture = (1f - smoothstep(0.002f, 0.012f, fault));
    let _e70 = material.baseColor;
    let _e74 = material.rimColor;
    let pigment = mix(_e70.xyz, _e74.xyz, ((s_5.variation * 0.4f) + (max(0f, _e1.y) * 0.22f)));
    let _e92 = lit(s_5, ((pigment * layer_5) * (1f - (fracture * 0.24f))), _e1);
    return vec4<f32>(_e92, 1f);
}

@fragment 
fn fs_blade(s_6: Surface) -> @location(0) vec4<f32> {
    let _e1 = face(s_6);
    let _e4 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let v_4 = normalize((_e4 - s_6.world));
    let _e10 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let highlight = pow(max(0f, dot(reflect(-(normalize(-(_e10))), _e1), v_4)), 64f);
    let bevel = (1f - smoothstep(0.001f, 0.008f, abs(s_6.local.y)));
    let _e30 = material.baseColor;
    let _e38 = lit(s_6, (_e30.xyz * (0.7f + (s_6.variation * 0.3f))), _e1);
    let _e41 = material.rimColor;
    return vec4<f32>(((_e38 + ((_e41.xyz * bevel) * 1.35f)) + ((vec3<f32>(1f, 0.94f, 0.72f) * highlight) * 1.2f)), 1f);
}
