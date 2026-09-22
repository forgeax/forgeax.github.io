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

struct MaterialParametersX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX {
    eye: vec4<f32>,
    settings: vec4<f32>,
    rimColor: vec4<f32>,
    rimCore: vec4<f32>,
    rimMotion: vec4<f32>,
    rimLight: vec4<f32>,
    rimEnergy: vec4<f32>,
    rimCoverage: vec4<f32>,
    rimTexture: vec4<f32>,
    surfaceRange: vec4<f32>,
    surfaceCenter: vec4<f32>,
    tint: vec4<f32>,
}

struct VsIn {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
}

struct Out {
    @builtin(position) clip: vec4<f32>,
    @location(0) world: vec3<f32>,
    @location(1) local: vec3<f32>,
    @location(2) normal: vec3<f32>,
    @location(3) localNormal: vec3<f32>,
    @location(4) viewZ: f32,
}

struct Enchantment {
    color: vec4<f32>,
    core: vec4<f32>,
    motion: vec4<f32>,
    light: vec4<f32>,
    energy: vec4<f32>,
    coverage: vec4<f32>,
    texture: vec4<f32>,
}

const THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX: u32 = 16u;
const THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX: array<vec2<f32>, 256> = array<vec2<f32>, 256>(vec2<f32>(0.14709473f, 0.8520508f), vec2<f32>(0.16552734f, 0.78759766f), vec2<f32>(0.24438477f, 0.6386719f), vec2<f32>(0.3708496f, 0.51953125f), vec2<f32>(0.49682617f, 0.41552734f), vec2<f32>(0.6020508f, 0.32641602f), vec2<f32>(0.68408203f, 0.25390625f), vec2<f32>(0.74609375f, 0.19750977f), vec2<f32>(0.79052734f, 0.15429688f), vec2<f32>(0.8222656f, 0.12164307f), vec2<f32>(0.8432617f, 0.09698486f), vec2<f32>(0.8564453f, 0.078430176f), vec2<f32>(0.86328125f, 0.06439209f), vec2<f32>(0.86572266f, 0.053710938f), vec2<f32>(0.8642578f, 0.045440674f), vec2<f32>(0.8598633f, 0.039031982f), vec2<f32>(0.38867188f, 0.6113281f), vec2<f32>(0.3930664f, 0.60058594f), vec2<f32>(0.41235352f, 0.54589844f), vec2<f32>(0.45654297f, 0.4482422f), vec2<f32>(0.52783203f, 0.35253906f), vec2<f32>(0.6074219f, 0.27392578f), vec2<f32>(0.67871094f, 0.21142578f), vec2<f32>(0.73339844f, 0.16259766f), vec2<f32>(0.7709961f, 0.12536621f), vec2<f32>(0.79345703f, 0.09729004f), vec2<f32>(0.80322266f, 0.07623291f), vec2<f32>(0.80371094f, 0.06036377f), vec2<f32>(0.7963867f, 0.048431396f), vec2<f32>(0.78564453f, 0.039367676f), vec2<f32>(0.77197266f, 0.032409668f), vec2<f32>(0.7548828f, 0.026977539f), vec2<f32>(0.5722656f, 0.42749023f), vec2<f32>(0.57373047f, 0.42407227f), vec2<f32>(0.57958984f, 0.40356445f), vec2<f32>(0.5917969f, 0.3544922f), vec2<f32>(0.61621094f, 0.28808594f), vec2<f32>(0.65527344f, 0.22485352f), vec2<f32>(0.69873047f, 0.17260742f), vec2<f32>(0.73535156f, 0.13183594f), vec2<f32>(0.75927734f, 0.10089111f), vec2<f32>(0.77001953f, 0.07745361f), vec2<f32>(0.77197266f, 0.059936523f), vec2<f32>(0.7661133f, 0.046844482f), vec2<f32>(0.7519531f, 0.036987305f), vec2<f32>(0.7324219f, 0.029541016f), vec2<f32>(0.70947266f, 0.023834229f), vec2<f32>(0.68359375f, 0.019439697f), vec2<f32>(0.7089844f, 0.29101563f), vec2<f32>(0.7089844f, 0.28979492f), vec2<f32>(0.70996094f, 0.28125f), vec2<f32>(0.70996094f, 0.25854492f), vec2<f32>(0.7114258f, 0.22045898f), vec2<f32>(0.71972656f, 0.17687988f), vec2<f32>(0.734375f, 0.13708496f), vec2<f32>(0.7480469f, 0.10479736f), vec2<f32>(0.7558594f, 0.07989502f), vec2<f32>(0.7597656f, 0.06100464f), vec2<f32>(0.75341797f, 0.046844482f), vec2<f32>(0.73876953f, 0.036224365f), vec2<f32>(0.71777344f, 0.028259277f), vec2<f32>(0.69189453f, 0.022262573f), vec2<f32>(0.6611328f, 0.017700195f), vec2<f32>(0.62841797f, 0.014198303f), vec2<f32>(0.80810547f, 0.19177246f), vec2<f32>(0.8076172f, 0.19128418f), vec2<f32>(0.80615234f, 0.18798828f), vec2<f32>(0.8017578f, 0.17810059f), vec2<f32>(0.79296875f, 0.1586914f), vec2<f32>(0.7836914f, 0.13220215f), vec2<f32>(0.7753906f, 0.1048584f), vec2<f32>(0.7685547f, 0.08111572f), vec2<f32>(0.76464844f, 0.0619812f), vec2<f32>(0.7553711f, 0.04727173f), vec2<f32>(0.7402344f, 0.03616333f), vec2<f32>(0.71875f, 0.027755737f), vec2<f32>(0.69091797f, 0.021484375f), vec2<f32>(0.6582031f, 0.016738892f), vec2<f32>(0.6220703f, 0.013160706f), vec2<f32>(0.5839844f, 0.010414124f), vec2<f32>(0.87841797f, 0.1217041f), vec2<f32>(0.8779297f, 0.1217041f), vec2<f32>(0.875f, 0.12060547f), vec2<f32>(0.8691406f, 0.11694336f), vec2<f32>(0.8569336f, 0.10803223f), vec2<f32>(0.8378906f, 0.09375f), vec2<f32>(0.8149414f, 0.0769043f), vec2<f32>(0.79589844f, 0.060699463f), vec2<f32>(0.7763672f, 0.046875f), vec2<f32>(0.75634766f, 0.03591919f), vec2<f32>(0.7324219f, 0.027450562f), vec2<f32>(0.703125f, 0.021026611f), vec2<f32>(0.6689453f, 0.016174316f), vec2<f32>(0.6303711f, 0.012512207f), vec2<f32>(0.58935547f, 0.009742737f), vec2<f32>(0.5463867f, 0.007633209f), vec2<f32>(0.92626953f, 0.073791504f), vec2<f32>(0.92578125f, 0.073913574f), vec2<f32>(0.92285156f, 0.073913574f), vec2<f32>(0.9169922f, 0.07312012f), vec2<f32>(0.9038086f, 0.06982422f), vec2<f32>(0.88134766f, 0.06311035f), vec2<f32>(0.8510742f, 0.05380249f), vec2<f32>(0.82128906f, 0.043701172f), vec2<f32>(0.7910156f, 0.03439331f), vec2<f32>(0.76123047f, 0.026611328f), vec2<f32>(0.72802734f, 0.020446777f), vec2<f32>(0.69189453f, 0.015655518f), vec2<f32>(0.6508789f, 0.012008667f), vec2<f32>(0.6074219f, 0.009254456f), vec2<f32>(0.56103516f, 0.007156372f), vec2<f32>(0.51416016f, 0.0055656433f), vec2<f32>(0.95751953f, 0.04232788f), vec2<f32>(0.95703125f, 0.04244995f), vec2<f32>(0.95458984f, 0.042816162f), vec2<f32>(0.94921875f, 0.043182373f), vec2<f32>(0.9370117f, 0.042663574f), vec2<f32>(0.91308594f, 0.040252686f), vec2<f32>(0.88183594f, 0.03579712f), vec2<f32>(0.84472656f, 0.030136108f), vec2<f32>(0.80615234f, 0.024337769f), vec2<f32>(0.76708984f, 0.01914978f), vec2<f32>(0.7265625f, 0.014854431f), vec2<f32>(0.6826172f, 0.011421204f), vec2<f32>(0.63623047f, 0.008773804f), vec2<f32>(0.58691406f, 0.00674057f), vec2<f32>(0.5366211f, 0.0051994324f), vec2<f32>(0.48608398f, 0.004020691f), vec2<f32>(0.97753906f, 0.022628784f), vec2<f32>(0.9770508f, 0.022750854f), vec2<f32>(0.97509766f, 0.02319336f), vec2<f32>(0.96972656f, 0.023910522f), vec2<f32>(0.95947266f, 0.024490356f), vec2<f32>(0.93603516f, 0.024124146f), vec2<f32>(0.90527344f, 0.022521973f), vec2<f32>(0.8652344f, 0.019760132f), vec2<f32>(0.82177734f, 0.01651001f), vec2<f32>(0.77441406f, 0.013290405f), vec2<f32>(0.7265625f, 0.0104599f), vec2<f32>(0.67626953f, 0.008132935f), vec2<f32>(0.62402344f, 0.0062789917f), vec2<f32>(0.5698242f, 0.004825592f), vec2<f32>(0.5151367f, 0.0037136078f), vec2<f32>(0.46142578f, 0.0028629303f), vec2<f32>(0.98876953f, 0.011070251f), vec2<f32>(0.98876953f, 0.011161804f), vec2<f32>(0.9868164f, 0.011512756f), vec2<f32>(0.98291016f, 0.012214661f), vec2<f32>(0.97314453f, 0.012992859f), vec2<f32>(0.953125f, 0.013519287f), vec2<f32>(0.92285156f, 0.013282776f), vec2<f32>(0.8823242f, 0.012260437f), vec2<f32>(0.83496094f, 0.010658264f), vec2<f32>(0.7832031f, 0.008850098f), vec2<f32>(0.7285156f, 0.0071144104f), vec2<f32>(0.671875f, 0.005607605f), vec2<f32>(0.61376953f, 0.004360199f), vec2<f32>(0.5546875f, 0.0033721924f), vec2<f32>(0.4963379f, 0.0025997162f), vec2<f32>(0.43945313f, 0.0020046234f), vec2<f32>(0.9951172f, 0.004798889f), vec2<f32>(0.9951172f, 0.004863739f), vec2<f32>(0.99365234f, 0.0050964355f), vec2<f32>(0.9902344f, 0.0056037903f), vec2<f32>(0.9814453f, 0.0063323975f), vec2<f32>(0.96435547f, 0.0069770813f), vec2<f32>(0.93603516f, 0.007297516f), vec2<f32>(0.8964844f, 0.0071258545f), vec2<f32>(0.8466797f, 0.0064926147f), vec2<f32>(0.7915039f, 0.005596161f), vec2<f32>(0.7314453f, 0.004627228f), vec2<f32>(0.6689453f, 0.0037174225f), vec2<f32>(0.60546875f, 0.0029296875f), vec2<f32>(0.5415039f, 0.002281189f), vec2<f32>(0.47924805f, 0.0017662048f), vec2<f32>(0.41967773f, 0.0013656616f), vec2<f32>(0.9980469f, 0.0017604828f), vec2<f32>(0.9980469f, 0.0017938614f), vec2<f32>(0.99658203f, 0.0019292831f), vec2<f32>(0.9941406f, 0.0022392273f), vec2<f32>(0.9863281f, 0.002729416f), vec2<f32>(0.9716797f, 0.003250122f), vec2<f32>(0.9458008f, 0.0036697388f), vec2<f32>(0.90771484f, 0.003818512f), vec2<f32>(0.85839844f, 0.0036811829f), vec2<f32>(0.7993164f, 0.003320694f), vec2<f32>(0.73535156f, 0.0028438568f), vec2<f32>(0.66748047f, 0.0023441315f), vec2<f32>(0.5986328f, 0.0018796921f), vec2<f32>(0.53027344f, 0.0014829636f), vec2<f32>(0.46411133f, 0.0011587143f), vec2<f32>(0.4020996f, 0.0008993149f), vec2<f32>(0.9995117f, 0.00050115585f), vec2<f32>(0.9995117f, 0.00051546097f), vec2<f32>(0.9980469f, 0.0005836487f), vec2<f32>(0.99658203f, 0.0007505417f), vec2<f32>(0.9892578f, 0.0010147095f), vec2<f32>(0.9760742f, 0.0013465881f), vec2<f32>(0.9526367f, 0.0016527176f), vec2<f32>(0.9160156f, 0.0018558502f), vec2<f32>(0.8671875f, 0.0019054413f), vec2<f32>(0.8076172f, 0.0018167496f), vec2<f32>(0.7392578f, 0.0016212463f), vec2<f32>(0.6669922f, 0.0013799667f), vec2<f32>(0.5932617f, 0.0011358261f), vec2<f32>(0.52001953f, 0.0009121895f), vec2<f32>(0.45043945f, 0.00072193146f), vec2<f32>(0.38598633f, 0.00056505203f), vec2<f32>(1f, 0.00009316206f), vec2<f32>(1f, 0.00009787083f), vec2<f32>(0.99902344f, 0.00012540817f), vec2<f32>(0.9970703f, 0.00019216537f), vec2<f32>(0.99072266f, 0.000310421f), vec2<f32>(0.9790039f, 0.00046992302f), vec2<f32>(0.95751953f, 0.000647068f), vec2<f32>(0.92333984f, 0.0007915497f), vec2<f32>(0.8754883f, 0.00087690353f), vec2<f32>(0.8149414f, 0.0008869171f), vec2<f32>(0.7441406f, 0.0008325577f), vec2<f32>(0.66748047f, 0.00073862076f), vec2<f32>(0.5883789f, 0.000626564f), vec2<f32>(0.51123047f, 0.0005168915f), vec2<f32>(0.43823242f, 0.00041651726f), vec2<f32>(0.37109375f, 0.0003311634f), vec2<f32>(1f, 0.0000072717667f), vec2<f32>(1f, 0.000008165836f), vec2<f32>(0.99902344f, 0.000016987324f), vec2<f32>(0.9975586f, 0.000037908554f), vec2<f32>(0.9921875f, 0.00007593632f), vec2<f32>(0.9814453f, 0.00013744831f), vec2<f32>(0.9614258f, 0.00020754337f), vec2<f32>(0.9291992f, 0.00028014183f), vec2<f32>(0.8828125f, 0.00033450127f), vec2<f32>(0.82177734f, 0.00036263466f), vec2<f32>(0.74902344f, 0.00036215782f), vec2<f32>(0.66845703f, 0.00033807755f), vec2<f32>(0.5854492f, 0.00029969215f), vec2<f32>(0.50390625f, 0.00025582314f), vec2<f32>(0.42700195f, 0.0002117157f), vec2<f32>(0.35766602f, 0.000172019f), vec2<f32>(1f, 0f), vec2<f32>(1f, 0.000000059604645f), vec2<f32>(0.9995117f, 0.0000012516975f), vec2<f32>(0.9975586f, 0.0000053048134f), vec2<f32>(0.99316406f, 0.000015079975f), vec2<f32>(0.98291016f, 0.000028550625f), vec2<f32>(0.96435547f, 0.000047445297f), vec2<f32>(0.93408203f, 0.00006842613f), vec2<f32>(0.88916016f, 0.00008893013f), vec2<f32>(0.828125f, 0.000104248524f), vec2<f32>(0.75390625f, 0.00011217594f), vec2<f32>(0.67041016f, 0.00011241436f), vec2<f32>(0.5830078f, 0.00010627508f), vec2<f32>(0.4970703f, 0.00009584427f), vec2<f32>(0.4169922f, 0.00008332729f), vec2<f32>(0.34521484f, 0.000070512295f));

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(3) @binding(0) 
var<storage> instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(1) @binding(0) 
var<uniform> materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX: MaterialParametersX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX;
@group(0) @binding(3) 
var shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_depth_2d;
@group(0) @binding(4) 
var shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: sampler_comparison;
var<private> enchantment: Enchantment;

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
    let uv_1 = clamp(vec2<f32>(roughness, dotNV), vec2(0f), vec2(1f));
    let samplePosition = ((uv_1 * 16f) - vec2(0.5f));
    let base_1 = vec2<i32>(floor(samplePosition));
    let weight = fract(samplePosition);
    let lo = clamp(base_1, vec2(0i), vec2(15i));
    let hi = clamp((base_1 + vec2(1i)), vec2(0i), vec2(15i));
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
    let tile = vec2<u32>((layer_2 % _e1.x), (layer_2 / _e1.x));
    return (vec2<f32>(tile) / vec2<f32>(_e1));
}

fn _directionalReceiverDepthBiasX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_3: u32, normal: vec3<f32>, l: vec3<f32>, radius: f32) -> f32 {
    var local_3: bool;

    let nDotL_2 = dot(normal, l);
    let depthSpan = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_3].z;
    if (nDotL_2 > 0.01f) {
        local_3 = (depthSpan > 0f);
    } else {
        local_3 = false;
    }
    let _e16 = local_3;
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
    var local_4: bool;
    var local_5: bool;
    var local_6: bool;
    var local_7: bool;
    var blocked: f32 = 0f;
    var local_8: bool;
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
    let uv_2 = ((tileUv * _e14) + _e15);
    let currentDepth = projCoords.z;
    if (tileUv.x >= 0f) {
        local_4 = (tileUv.x <= 1f);
    } else {
        local_4 = false;
    }
    let _e40 = local_4;
    if _e40 {
        local_5 = (tileUv.y >= 0f);
    } else {
        local_5 = false;
    }
    let _e47 = local_5;
    if _e47 {
        local_6 = (tileUv.y <= 1f);
    } else {
        local_6 = false;
    }
    let _e54 = local_6;
    if _e54 {
        local_7 = (currentDepth <= 1f);
    } else {
        local_7 = false;
    }
    let _e60 = local_7;
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
        let lit = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, clamp(uv_2, tileLo, tileHi), adjustedDepth);
        return lit;
    }
    if (kernel == 3u) {
        if all((uv_2 >= (tileLo + texel))) {
            local_8 = all((uv_2 <= (tileHi - texel)));
        } else {
            local_8 = false;
        }
        let interior = local_8;
        if interior {
            let pcfFraction = fract(((uv_2 / texel) - vec2(0.5f)));
            let loWeight = (vec2(2f) - pcfFraction);
            let hiWeight = (vec2(1f) + pcfFraction);
            let loOffset = ((vec2(-1f) - pcfFraction) + (vec2(1f) / loWeight));
            let hiOffset = ((vec2(1f) - pcfFraction) + (pcfFraction / hiWeight));
            let litLoLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_2 + (vec2<f32>(loOffset.x, loOffset.y) * texel)), adjustedDepth);
            let litHiLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_2 + (vec2<f32>(hiOffset.x, loOffset.y) * texel)), adjustedDepth);
            let litLoHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_2 + (vec2<f32>(loOffset.x, hiOffset.y) * texel)), adjustedDepth);
            let litHiHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_2 + (vec2<f32>(hiOffset.x, hiOffset.y) * texel)), adjustedDepth);
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
                        let offsetUv = clamp((uv_2 + (vec2<f32>(f32(_e207), f32(_e209)) * texel)), tileLo, tileHi);
                        let lit_1 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv, adjustedDepth);
                        let _e219 = blocked;
                        blocked = (_e219 + (1f - lit_1));
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
                    let offsetUv_1 = clamp((uv_2 + (vec2<f32>(f32(_e243), f32(_e245)) * texel)), tileLo, tileHi);
                    let lit_2 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv_1, adjustedDepth);
                    let _e254 = blocked;
                    blocked = (_e254 + (1f - lit_2));
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
    var local_9: bool;

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
        local_9 = ((_e28 + 1u) < count_5);
    } else {
        local_9 = false;
    }
    let _e49 = local_9;
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

fn surfaceHash(p: vec3<f32>) -> f32 {
    return fract((sin(dot(p, vec3<f32>(127.1f, 311.7f, 74.7f))) * 43758.547f));
}

fn surfaceNoise(p_1: vec3<f32>) -> f32 {
    let i_2 = floor(p_1);
    let f_1 = fract(p_1);
    let u = ((f_1 * f_1) * (vec3(3f) - (2f * f_1)));
    let _e10 = surfaceHash(i_2);
    let _e16 = surfaceHash((i_2 + vec3<f32>(1f, 0f, 0f)));
    let _e24 = surfaceHash((i_2 + vec3<f32>(0f, 1f, 0f)));
    let _e30 = surfaceHash((i_2 + vec3<f32>(1f, 1f, 0f)));
    let _e40 = surfaceHash((i_2 + vec3<f32>(0f, 0f, 1f)));
    let _e46 = surfaceHash((i_2 + vec3<f32>(1f, 0f, 1f)));
    let _e54 = surfaceHash((i_2 + vec3<f32>(0f, 1f, 1f)));
    let _e60 = surfaceHash((i_2 + vec3<f32>(1f, 1f, 1f)));
    return mix(mix(mix(_e10, _e16, u.x), mix(_e24, _e30, u.x), u.y), mix(mix(_e40, _e46, u.x), mix(_e54, _e60, u.x), u.y), u.z);
}

fn surfaceField(p_2: vec3<f32>) -> f32 {
    let _e1 = surfaceNoise(p_2);
    let _e11 = surfaceNoise(((p_2 * 2.07f) + vec3<f32>(9.2f, 1.7f, 4.1f)));
    let _e22 = surfaceNoise(((p_2 * 4.13f) + vec3<f32>(2.3f, 7.1f, 3.4f)));
    return (((_e1 * 0.62f) + (_e11 * 0.28f)) + (_e22 * 0.1f));
}

fn surfaceDots(uv: vec2<f32>, cells: f32, coverage: f32, pixelSize: f32) -> f32 {
    let rotated = (vec2<f32>(((uv.x * 0.9063f) - (uv.y * 0.4226f)), ((uv.x * 0.4226f) + (uv.y * 0.9063f))) * cells);
    let radius_1 = sqrt((clamp(coverage, 0.01f, 0.95f) / 3.141593f));
    let footprint_1 = (pixelSize * cells);
    let aa = max((footprint_1 * 0.65f), 0.035f);
    let dots = (1f - smoothstep((radius_1 - aa), (radius_1 + aa), length((fract(rotated) - vec2(0.5f)))));
    return mix(dots, coverage, smoothstep(0.38f, 0.85f, footprint_1));
}

fn enchantedSurface(base: vec3<f32>, world: vec3<f32>, normal_3: vec3<f32>, viewDirection: vec3<f32>, patternNormal_1: vec3<f32>, height01_: f32, time: f32, pixelSize_1: f32, radiance: vec3<f32>, shadow_1: f32) -> vec3<f32> {
    var surface: vec3<f32>;
    var emission: vec3<f32> = vec3(0f);

    let n = normalize(normal_3);
    let viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX_1 = normalize(viewDirection);
    let grazing = (1f - clamp(dot(n, viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX_1), 0f, 1f));
    let _e14 = enchantment.light;
    let lit_3 = smoothstep(-0.45f, 0.8f, dot(n, _e14.xyz));
    let bottom = (1f - smoothstep(0.08f, 0.85f, height01_));
    let _e29 = enchantment.core.w;
    let _e36 = enchantment.motion.y;
    let _e45 = enchantment.motion.z;
    let power = clamp((mix(11f, 1.8f, _e29) / ((1f + ((3.2f * _e36) * bottom)) + ((1.8f * _e45) * lit_3))), 1.1f, 14f);
    let silhouette = smoothstep(0.14f, 0.45f, grazing);
    let soft = (pow(grazing, power) * silhouette);
    let edge = (pow(grazing, (power * 2.2f)) * silhouette);
    let drift = (0.5f + (0.5f * sin((((world.y * 13f) - (time * 1.8f)) + (sin((((world.x * 9f) + (world.z * 7f)) + (time * 0.65f))) * 1.4f)))));
    let _e97 = enchantment.motion.x;
    let flow = mix(1f, (0.65f + (0.35f * drift)), _e97);
    let _e109 = enchantment.motion.y;
    let lower = mix(1f, mix(1f, 0.5f, smoothstep(0.05f, 0.95f, height01_)), _e109);
    let _e120 = enchantment.coverage.x;
    let topEnvelope = mix(1f, (1f - smoothstep(0.32f, 0.76f, height01_)), _e120);
    let _e131 = enchantment.energy.x;
    let _e144 = surfaceField((((world * vec3<f32>(5.2f, 3.1f, 5.2f)) - vec3<f32>(0f, ((time * _e131) * 0.48f), 0f)) + vec3<f32>(3.8f, 7.1f, 1.6f)));
    let sideZone = (smoothstep(0.18f, 0.5f, height01_) * (1f - smoothstep(0.64f, 0.8f, height01_)));
    let _e160 = enchantment.coverage.y;
    let fragments = mix(1f, smoothstep(0.34f, 0.64f, _e144), (_e160 * sideZone));
    let coverage_1 = (topEnvelope * fragments);
    let lightPower = dot(radiance, vec3<f32>(0.2126f, 0.7152f, 0.0722f));
    let _e184 = enchantment.motion.z;
    let response = mix(1f, (0.1f + ((((2.4f * lit_3) * shadow_1) * lightPower) / (lightPower + 1f))), _e184);
    let _e196 = enchantment.motion.z;
    let lightTint = mix(vec3(1f), (radiance / vec3(max(lightPower, 0.001f))), (_e196 * 0.35f));
    let _e202 = enchantment.color;
    let _e209 = enchantment.core;
    let _e218 = enchantment.color.w;
    let glow = (((((((((_e202.xyz * soft) * 0.85f) + ((_e209.xyz * edge) * 1.25f)) * _e218) * flow) * lower) * coverage_1) * response) * lightTint);
    let speed = enchantment.energy.x;
    let t_1 = (time * speed);
    let q = ((world * vec3<f32>(7.2f, 2.5f, 7.2f)) - vec3<f32>(0f, (t_1 * 1.25f), 0f));
    let _e248 = surfaceField(((q * 0.65f) + vec3<f32>(1.7f, 5.3f, 2.1f)));
    let _e274 = enchantment.motion.x;
    let sway = ((vec3<f32>(sin((((world.y * 5f) - (t_1 * 1.7f)) + (_e248 * 4f))), 0f, cos((((world.y * 4f) - (t_1 * 1.3f)) + (_e248 * 3f)))) * _e274) * 0.8f);
    let _e286 = surfaceField(((q + sway) + vec3<f32>((_e248 * 1.25f), 0f, (_e248 * 0.6f))));
    let strength = enchantment.motion.w;
    let _e295 = enchantment.color;
    let substrateTint = mix(vec3(0.82f), _e295.xyz, 0.22f);
    let neutral = (dot(base, vec3<f32>(0.2126f, 0.7152f, 0.0722f)) * substrateTint);
    let _e309 = enchantment.light.w;
    let substrate = mix(base, neutral, _e309);
    surface = substrate;
    let _e315 = enchantment.energy.z;
    if (_e315 < 0.5f) {
        let veins = (1f - smoothstep(0.1f, 0.44f, abs(sin(((_e286 * 16f) + (_e248 * 2f))))));
        surface = (substrate * mix(1f, ((0.92f - (0.69f * veins)) - (0.18f * smoothstep(0.3f, 0.7f, _e286))), strength));
    } else {
        let _e346 = enchantment.energy.z;
        if (_e346 < 1.5f) {
            let flameField = ((_e286 - (height01_ * 0.22f)) + 0.1f);
            let tongue = smoothstep(0.3f, 0.59f, flameField);
            let heart = smoothstep(0.57f, 0.76f, flameField);
            let edgeFlame = (smoothstep(0.28f, 0.43f, flameField) * (1f - smoothstep(0.48f, 0.62f, flameField)));
            let pulse = (0.78f + (0.22f * sin((((t_1 * 3.8f) - (world.y * 8f)) + (_e248 * 4f)))));
            surface = (substrate * mix(1f, (0.22f + (0.58f * tongue)), strength));
            let _e392 = enchantment.color;
            let _e402 = enchantment.core;
            let _e413 = enchantment.energy.y;
            emission = (((((_e392.xyz * ((tongue * 0.42f) + (edgeFlame * 0.14f))) + ((_e402.xyz * heart) * 0.85f)) * pulse) * strength) * _e413);
        } else {
            let phase = ((((world.y * 15f) - (t_1 * 4.4f)) + (_e248 * 7f)) + (sin(((world.x * 8f) + (world.z * 5f))) * 1.2f));
            let ribbon = (1f - smoothstep(0.12f, 0.65f, abs(sin(phase))));
            let heart_1 = pow(ribbon, 4f);
            let pulse_1 = (0.72f + (0.28f * sin(((t_1 * 3f) + (world.y * 4f)))));
            surface = (substrate * mix(1f, (0.3f + (0.36f * _e286)), strength));
            let _e465 = enchantment.color;
            let _e472 = enchantment.core;
            let _e482 = enchantment.energy.y;
            emission = ((((((_e465.xyz * ribbon) * 0.46f) + ((_e472.xyz * heart_1) * 0.55f)) * strength) * _e482) * pulse_1);
        }
    }
    let weights0_ = pow(abs(patternNormal_1), vec3(6f));
    let weights = (weights0_ / vec3(((weights0_.x + weights0_.y) + weights0_.z)));
    let dotCoverage = mix(0.18f, 0.64f, smoothstep(0.3f, 0.7f, _e286));
    let _e507 = enchantment.texture.y;
    let _e509 = surfaceDots(world.yz, _e507, dotCoverage, pixelSize_1);
    let _e514 = enchantment.texture.y;
    let _e515 = surfaceDots(world.xz, _e514, dotCoverage, pixelSize_1);
    let _e520 = enchantment.texture.y;
    let _e521 = surfaceDots(world.xy, _e520, dotCoverage, pixelSize_1);
    let dots_1 = dot(vec3<f32>(_e509, _e515, _e521), weights);
    let midtone = (smoothstep(0.22f, 0.4f, _e286) * (1f - smoothstep(0.63f, 0.8f, _e286)));
    let face = (1f - smoothstep(0.55f, 0.88f, grazing));
    let _e541 = enchantment.texture.x;
    let ink = (((_e541 * strength) * midtone) * face);
    let _e545 = surface;
    surface = (_e545 * (1f - ((ink * (1f - dots_1)) * 0.48f)));
    let _e554 = emission;
    emission = (_e554 * (1f - ((ink * (1f - dots_1)) * 0.72f)));
    let phase_1 = ((_e286 * 29f) + (_e248 * 3f));
    let width = mix(0.06f, 0.24f, smoothstep(0.25f, 0.72f, _e248));
    let aa_1 = clamp((pixelSize_1 * 36f), 0.025f, 0.6f);
    let stroke = (1f - smoothstep(width, (width + aa_1), abs(sin(phase_1))));
    let _e593 = surfaceNoise(((world * 9f) - vec3<f32>(0f, (t_1 * 0.45f), 0f)));
    let broken = smoothstep(0.28f, 0.53f, _e593);
    let _e604 = enchantment.texture.z;
    let etch = (((((stroke * broken) * midtone) * face) * strength) * _e604);
    let _e606 = surface;
    surface = (_e606 * (1f - (etch * 0.35f)));
    let _e612 = emission;
    let _e615 = enchantment.color;
    let _e619 = enchantment.core;
    let _e629 = enchantment.energy.y;
    emission = (_e612 + (((mix(_e615.xyz, _e619.xyz, 0.2f) * etch) * 0.3f) * _e629));
    let surfaceEdgeEnvelope = mix(1f, topEnvelope, smoothstep(0.38f, 0.82f, grazing));
    let _e637 = surface;
    let _e638 = emission;
    return ((_e637 + (_e638 * surfaceEdgeEnvelope)) + glow);
}

@vertex 
fn vs_main(input: VsIn, @builtin(instance_index) idx: u32) -> Out {
    var o: Out;

    let _e3 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e8 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].localFromInstance;
    let model = (_e3 * _e8);
    let world_1 = (model * vec4<f32>(input.pos, 1f));
    let _e19 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    o.clip = (_e19 * world_1);
    o.world = world_1.xyz;
    o.local = input.pos;
    let a_2 = model[0].xyz;
    let b = model[1].xyz;
    let c = model[2].xyz;
    o.normal = ((((cross(b, c) * input.normal.x) + (cross(c, a_2) * input.normal.y)) + (cross(a_2, b) * input.normal.z)) * sign(dot(a_2, cross(b, c))));
    o.localNormal = input.normal;
    let _e55 = o.clip.w;
    o.viewZ = -(_e55);
    let _e57 = o;
    return _e57;
}

@fragment 
fn fs_main(i: Out) -> @location(0) vec4<f32> {
    var local: bool;
    var local_1: vec3<f32>;
    var local_2: bool;
    var patternNormal: vec3<f32>;

    let _e2 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.rimColor;
    let _e5 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.rimCore;
    let _e8 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.rimMotion;
    let _e11 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.rimLight;
    let _e14 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.rimEnergy;
    let _e17 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.rimCoverage;
    let _e20 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.rimTexture;
    enchantment = Enchantment(_e2, _e5, _e8, _e11, _e14, _e17, _e20);
    let _e25 = dpdy(i.world);
    let _e27 = dpdx(i.world);
    let face_1 = normalize(cross(_e25, _e27));
    let _e34 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.surfaceRange.w;
    if !((_e34 > 0.5f)) {
        let _e41 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.settings.w;
        local = (_e41 < 0.5f);
    } else {
        local = true;
    }
    let _e47 = local;
    let n_1 = normalize(select(face_1, i.normal, _e47));
    let _e53 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.settings.w;
    let attached = (_e53 > 0.5f);
    if attached {
        let _e60 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
        let _e66 = enchantment.light.w;
        enchantment.light = vec4<f32>(normalize(-(_e60)), _e66);
    }
    let _e71 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.surfaceCenter;
    let centered = (i.local - _e71.xyz);
    let _e77 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.surfaceRange.z;
    let axis = u32(_e77);
    local_1 = i.local;
    let _e82 = dpdy(i.local);
    let _e84 = dpdx(i.local);
    let geometricLocal = normalize(cross(_e82, _e84));
    let _e91 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.surfaceRange.w;
    if !((_e91 > 0.5f)) {
        local_2 = !(attached);
    } else {
        local_2 = true;
    }
    let _e99 = local_2;
    patternNormal = select(geometricLocal, i.localNormal, _e99);
    if attached {
        let _e113 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.surfaceCenter.w;
        local_1 = (select(select(centered, centered.yxz, (axis == 0u)), centered.xzy, (axis == 2u)) * _e113);
        let _e115 = patternNormal;
        let _e116 = patternNormal;
        let _e121 = patternNormal;
        patternNormal = select(select(_e115, _e116.yxz, (axis == 0u)), _e121.xzy, (axis == 2u));
    }
    let _e131 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.settings.z;
    let _e141 = local_1.y;
    let height = select(clamp(((i.local.y / (2f * _e131)) + 0.5f), 0f, 1f), clamp(((_e141 / 2.2f) + 0.5f), 0f, 1f), attached);
    let _e152 = evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(n_1, i.world, i.viewZ);
    let shadow_2 = select(1f, _e152, attached);
    let _e159 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightColor;
    let radiance_1 = select(vec3(1f), _e159, attached);
    let _e167 = enchantment.light;
    let light = (vec3(0.12f) + (((radiance_1 * 0.22f) * max(0f, dot(n_1, _e167.xyz))) * shadow_2));
    let _e175 = local_1;
    let _e176 = dpdx(_e175);
    let _e178 = local_1;
    let _e179 = dpdy(_e178);
    let pixelSize_2 = max(length(_e176), length(_e179));
    let _e187 = local_1;
    let _e190 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.eye;
    let _e194 = patternNormal;
    let _e199 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.settings.x;
    let _e200 = enchantedSurface((vec3<f32>(0.55f, 0.6f, 0.68f) * light), _e187, n_1, (_e190.xyz - i.world), normalize(_e194), height, _e199, pixelSize_2, radiance_1, shadow_2);
    let _e203 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint;
    return vec4<f32>((_e200 * _e203.xyz), 1f);
}
