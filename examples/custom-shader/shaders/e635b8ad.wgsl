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
}

struct VsOutX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX {
    @builtin(position) clip: vec4<f32>,
    @location(0) worldPos: vec3<f32>,
    @location(1) worldNormal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) worldTangent: vec4<f32>,
    @location(5) uvOne: vec2<f32>,
    @location(8) uvTwo: vec2<f32>,
    @location(9) uvThree: vec2<f32>,
    @location(10) uvFour: vec2<f32>,
    @location(11) uvFive: vec2<f32>,
    @location(12) uvSix: vec2<f32>,
    @location(13) uvSeven: vec2<f32>,
    @location(6) ndc: vec4<f32>,
    @location(7) viewZ: f32,
}

struct StandardSurfaceFactorsX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX {
    baseColor: vec4<f32>,
    metallic: f32,
    roughness: f32,
    emissive: vec3<f32>,
    emissiveIntensity: f32,
    clearcoat: f32,
    clearcoatRoughness: f32,
    lighting: bool,
    receiveShadows: bool,
}

struct MaterialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX {
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
    normalScale: f32,
    transmission: f32,
    ior: f32,
    thickness: f32,
    attenuationColor: vec3<f32>,
    attenuationDistance: f32,
    baseColorTextureCoordinatesTransform: vec4<f32>,
    baseColorTextureCoordinatesMetadata: vec4<f32>,
    metallicRoughnessTextureCoordinatesTransform: vec4<f32>,
    metallicRoughnessTextureCoordinatesMetadata: vec4<f32>,
    normalTextureCoordinatesTransform: vec4<f32>,
    normalTextureCoordinatesMetadata: vec4<f32>,
    specularTintTextureCoordinatesTransform: vec4<f32>,
    specularTintTextureCoordinatesMetadata: vec4<f32>,
    emissiveTextureCoordinatesTransform: vec4<f32>,
    emissiveTextureCoordinatesMetadata: vec4<f32>,
    occlusionTextureCoordinatesTransform: vec4<f32>,
    occlusionTextureCoordinatesMetadata: vec4<f32>,
    transmissionTextureCoordinatesTransform: vec4<f32>,
    transmissionTextureCoordinatesMetadata: vec4<f32>,
    thicknessTextureCoordinatesTransform: vec4<f32>,
    thicknessTextureCoordinatesMetadata: vec4<f32>,
}

struct StandardPbrOutputX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX {
    @location(0) color: vec4<f32>,
}

struct SkylightUniformsX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX {
    intensity: f32,
    colorR: f32,
    colorG: f32,
    colorB: f32,
    rotation: vec4<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) @interpolate(flat) render_controls: vec2<f32>,
    @location(4) world_position: vec3<f32>,
    @location(5) uv: vec2<f32>,
    @location(6) tangent: vec4<f32>,
}

struct VertexInput {
    @location(0) geometry_position: vec3<f32>,
    @location(1) geometry_normal: vec3<f32>,
    @location(2) geometry_uv: vec2<f32>,
    @location(3) geometry_tangent: vec4<f32>,
    @location(4) center: vec3<f32>,
    @location(5) right: vec3<f32>,
    @location(6) up: vec3<f32>,
    @location(7) forward: vec3<f32>,
    @location(8) particle_color: vec4<f32>,
    @location(9) render_controls: vec2<f32>,
}

const PROBE_INV_PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX: f32 = 0.31830987f;
const THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX: u32 = 16u;
const THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX: array<vec2<f32>, 256> = array<vec2<f32>, 256>(vec2<f32>(0.14709473f, 0.8520508f), vec2<f32>(0.16552734f, 0.78759766f), vec2<f32>(0.24438477f, 0.6386719f), vec2<f32>(0.3708496f, 0.51953125f), vec2<f32>(0.49682617f, 0.41552734f), vec2<f32>(0.6020508f, 0.32641602f), vec2<f32>(0.68408203f, 0.25390625f), vec2<f32>(0.74609375f, 0.19750977f), vec2<f32>(0.79052734f, 0.15429688f), vec2<f32>(0.8222656f, 0.12164307f), vec2<f32>(0.8432617f, 0.09698486f), vec2<f32>(0.8564453f, 0.078430176f), vec2<f32>(0.86328125f, 0.06439209f), vec2<f32>(0.86572266f, 0.053710938f), vec2<f32>(0.8642578f, 0.045440674f), vec2<f32>(0.8598633f, 0.039031982f), vec2<f32>(0.38867188f, 0.6113281f), vec2<f32>(0.3930664f, 0.60058594f), vec2<f32>(0.41235352f, 0.54589844f), vec2<f32>(0.45654297f, 0.4482422f), vec2<f32>(0.52783203f, 0.35253906f), vec2<f32>(0.6074219f, 0.27392578f), vec2<f32>(0.67871094f, 0.21142578f), vec2<f32>(0.73339844f, 0.16259766f), vec2<f32>(0.7709961f, 0.12536621f), vec2<f32>(0.79345703f, 0.09729004f), vec2<f32>(0.80322266f, 0.07623291f), vec2<f32>(0.80371094f, 0.06036377f), vec2<f32>(0.7963867f, 0.048431396f), vec2<f32>(0.78564453f, 0.039367676f), vec2<f32>(0.77197266f, 0.032409668f), vec2<f32>(0.7548828f, 0.026977539f), vec2<f32>(0.5722656f, 0.42749023f), vec2<f32>(0.57373047f, 0.42407227f), vec2<f32>(0.57958984f, 0.40356445f), vec2<f32>(0.5917969f, 0.3544922f), vec2<f32>(0.61621094f, 0.28808594f), vec2<f32>(0.65527344f, 0.22485352f), vec2<f32>(0.69873047f, 0.17260742f), vec2<f32>(0.73535156f, 0.13183594f), vec2<f32>(0.75927734f, 0.10089111f), vec2<f32>(0.77001953f, 0.07745361f), vec2<f32>(0.77197266f, 0.059936523f), vec2<f32>(0.7661133f, 0.046844482f), vec2<f32>(0.7519531f, 0.036987305f), vec2<f32>(0.7324219f, 0.029541016f), vec2<f32>(0.70947266f, 0.023834229f), vec2<f32>(0.68359375f, 0.019439697f), vec2<f32>(0.7089844f, 0.29101563f), vec2<f32>(0.7089844f, 0.28979492f), vec2<f32>(0.70996094f, 0.28125f), vec2<f32>(0.70996094f, 0.25854492f), vec2<f32>(0.7114258f, 0.22045898f), vec2<f32>(0.71972656f, 0.17687988f), vec2<f32>(0.734375f, 0.13708496f), vec2<f32>(0.7480469f, 0.10479736f), vec2<f32>(0.7558594f, 0.07989502f), vec2<f32>(0.7597656f, 0.06100464f), vec2<f32>(0.75341797f, 0.046844482f), vec2<f32>(0.73876953f, 0.036224365f), vec2<f32>(0.71777344f, 0.028259277f), vec2<f32>(0.69189453f, 0.022262573f), vec2<f32>(0.6611328f, 0.017700195f), vec2<f32>(0.62841797f, 0.014198303f), vec2<f32>(0.80810547f, 0.19177246f), vec2<f32>(0.8076172f, 0.19128418f), vec2<f32>(0.80615234f, 0.18798828f), vec2<f32>(0.8017578f, 0.17810059f), vec2<f32>(0.79296875f, 0.1586914f), vec2<f32>(0.7836914f, 0.13220215f), vec2<f32>(0.7753906f, 0.1048584f), vec2<f32>(0.7685547f, 0.08111572f), vec2<f32>(0.76464844f, 0.0619812f), vec2<f32>(0.7553711f, 0.04727173f), vec2<f32>(0.7402344f, 0.03616333f), vec2<f32>(0.71875f, 0.027755737f), vec2<f32>(0.69091797f, 0.021484375f), vec2<f32>(0.6582031f, 0.016738892f), vec2<f32>(0.6220703f, 0.013160706f), vec2<f32>(0.5839844f, 0.010414124f), vec2<f32>(0.87841797f, 0.1217041f), vec2<f32>(0.8779297f, 0.1217041f), vec2<f32>(0.875f, 0.12060547f), vec2<f32>(0.8691406f, 0.11694336f), vec2<f32>(0.8569336f, 0.10803223f), vec2<f32>(0.8378906f, 0.09375f), vec2<f32>(0.8149414f, 0.0769043f), vec2<f32>(0.79589844f, 0.060699463f), vec2<f32>(0.7763672f, 0.046875f), vec2<f32>(0.75634766f, 0.03591919f), vec2<f32>(0.7324219f, 0.027450562f), vec2<f32>(0.703125f, 0.021026611f), vec2<f32>(0.6689453f, 0.016174316f), vec2<f32>(0.6303711f, 0.012512207f), vec2<f32>(0.58935547f, 0.009742737f), vec2<f32>(0.5463867f, 0.007633209f), vec2<f32>(0.92626953f, 0.073791504f), vec2<f32>(0.92578125f, 0.073913574f), vec2<f32>(0.92285156f, 0.073913574f), vec2<f32>(0.9169922f, 0.07312012f), vec2<f32>(0.9038086f, 0.06982422f), vec2<f32>(0.88134766f, 0.06311035f), vec2<f32>(0.8510742f, 0.05380249f), vec2<f32>(0.82128906f, 0.043701172f), vec2<f32>(0.7910156f, 0.03439331f), vec2<f32>(0.76123047f, 0.026611328f), vec2<f32>(0.72802734f, 0.020446777f), vec2<f32>(0.69189453f, 0.015655518f), vec2<f32>(0.6508789f, 0.012008667f), vec2<f32>(0.6074219f, 0.009254456f), vec2<f32>(0.56103516f, 0.007156372f), vec2<f32>(0.51416016f, 0.0055656433f), vec2<f32>(0.95751953f, 0.04232788f), vec2<f32>(0.95703125f, 0.04244995f), vec2<f32>(0.95458984f, 0.042816162f), vec2<f32>(0.94921875f, 0.043182373f), vec2<f32>(0.9370117f, 0.042663574f), vec2<f32>(0.91308594f, 0.040252686f), vec2<f32>(0.88183594f, 0.03579712f), vec2<f32>(0.84472656f, 0.030136108f), vec2<f32>(0.80615234f, 0.024337769f), vec2<f32>(0.76708984f, 0.01914978f), vec2<f32>(0.7265625f, 0.014854431f), vec2<f32>(0.6826172f, 0.011421204f), vec2<f32>(0.63623047f, 0.008773804f), vec2<f32>(0.58691406f, 0.00674057f), vec2<f32>(0.5366211f, 0.0051994324f), vec2<f32>(0.48608398f, 0.004020691f), vec2<f32>(0.97753906f, 0.022628784f), vec2<f32>(0.9770508f, 0.022750854f), vec2<f32>(0.97509766f, 0.02319336f), vec2<f32>(0.96972656f, 0.023910522f), vec2<f32>(0.95947266f, 0.024490356f), vec2<f32>(0.93603516f, 0.024124146f), vec2<f32>(0.90527344f, 0.022521973f), vec2<f32>(0.8652344f, 0.019760132f), vec2<f32>(0.82177734f, 0.01651001f), vec2<f32>(0.77441406f, 0.013290405f), vec2<f32>(0.7265625f, 0.0104599f), vec2<f32>(0.67626953f, 0.008132935f), vec2<f32>(0.62402344f, 0.0062789917f), vec2<f32>(0.5698242f, 0.004825592f), vec2<f32>(0.5151367f, 0.0037136078f), vec2<f32>(0.46142578f, 0.0028629303f), vec2<f32>(0.98876953f, 0.011070251f), vec2<f32>(0.98876953f, 0.011161804f), vec2<f32>(0.9868164f, 0.011512756f), vec2<f32>(0.98291016f, 0.012214661f), vec2<f32>(0.97314453f, 0.012992859f), vec2<f32>(0.953125f, 0.013519287f), vec2<f32>(0.92285156f, 0.013282776f), vec2<f32>(0.8823242f, 0.012260437f), vec2<f32>(0.83496094f, 0.010658264f), vec2<f32>(0.7832031f, 0.008850098f), vec2<f32>(0.7285156f, 0.0071144104f), vec2<f32>(0.671875f, 0.005607605f), vec2<f32>(0.61376953f, 0.004360199f), vec2<f32>(0.5546875f, 0.0033721924f), vec2<f32>(0.4963379f, 0.0025997162f), vec2<f32>(0.43945313f, 0.0020046234f), vec2<f32>(0.9951172f, 0.004798889f), vec2<f32>(0.9951172f, 0.004863739f), vec2<f32>(0.99365234f, 0.0050964355f), vec2<f32>(0.9902344f, 0.0056037903f), vec2<f32>(0.9814453f, 0.0063323975f), vec2<f32>(0.96435547f, 0.0069770813f), vec2<f32>(0.93603516f, 0.007297516f), vec2<f32>(0.8964844f, 0.0071258545f), vec2<f32>(0.8466797f, 0.0064926147f), vec2<f32>(0.7915039f, 0.005596161f), vec2<f32>(0.7314453f, 0.004627228f), vec2<f32>(0.6689453f, 0.0037174225f), vec2<f32>(0.60546875f, 0.0029296875f), vec2<f32>(0.5415039f, 0.002281189f), vec2<f32>(0.47924805f, 0.0017662048f), vec2<f32>(0.41967773f, 0.0013656616f), vec2<f32>(0.9980469f, 0.0017604828f), vec2<f32>(0.9980469f, 0.0017938614f), vec2<f32>(0.99658203f, 0.0019292831f), vec2<f32>(0.9941406f, 0.0022392273f), vec2<f32>(0.9863281f, 0.002729416f), vec2<f32>(0.9716797f, 0.003250122f), vec2<f32>(0.9458008f, 0.0036697388f), vec2<f32>(0.90771484f, 0.003818512f), vec2<f32>(0.85839844f, 0.0036811829f), vec2<f32>(0.7993164f, 0.003320694f), vec2<f32>(0.73535156f, 0.0028438568f), vec2<f32>(0.66748047f, 0.0023441315f), vec2<f32>(0.5986328f, 0.0018796921f), vec2<f32>(0.53027344f, 0.0014829636f), vec2<f32>(0.46411133f, 0.0011587143f), vec2<f32>(0.4020996f, 0.0008993149f), vec2<f32>(0.9995117f, 0.00050115585f), vec2<f32>(0.9995117f, 0.00051546097f), vec2<f32>(0.9980469f, 0.0005836487f), vec2<f32>(0.99658203f, 0.0007505417f), vec2<f32>(0.9892578f, 0.0010147095f), vec2<f32>(0.9760742f, 0.0013465881f), vec2<f32>(0.9526367f, 0.0016527176f), vec2<f32>(0.9160156f, 0.0018558502f), vec2<f32>(0.8671875f, 0.0019054413f), vec2<f32>(0.8076172f, 0.0018167496f), vec2<f32>(0.7392578f, 0.0016212463f), vec2<f32>(0.6669922f, 0.0013799667f), vec2<f32>(0.5932617f, 0.0011358261f), vec2<f32>(0.52001953f, 0.0009121895f), vec2<f32>(0.45043945f, 0.00072193146f), vec2<f32>(0.38598633f, 0.00056505203f), vec2<f32>(1f, 0.00009316206f), vec2<f32>(1f, 0.00009787083f), vec2<f32>(0.99902344f, 0.00012540817f), vec2<f32>(0.9970703f, 0.00019216537f), vec2<f32>(0.99072266f, 0.000310421f), vec2<f32>(0.9790039f, 0.00046992302f), vec2<f32>(0.95751953f, 0.000647068f), vec2<f32>(0.92333984f, 0.0007915497f), vec2<f32>(0.8754883f, 0.00087690353f), vec2<f32>(0.8149414f, 0.0008869171f), vec2<f32>(0.7441406f, 0.0008325577f), vec2<f32>(0.66748047f, 0.00073862076f), vec2<f32>(0.5883789f, 0.000626564f), vec2<f32>(0.51123047f, 0.0005168915f), vec2<f32>(0.43823242f, 0.00041651726f), vec2<f32>(0.37109375f, 0.0003311634f), vec2<f32>(1f, 0.0000072717667f), vec2<f32>(1f, 0.000008165836f), vec2<f32>(0.99902344f, 0.000016987324f), vec2<f32>(0.9975586f, 0.000037908554f), vec2<f32>(0.9921875f, 0.00007593632f), vec2<f32>(0.9814453f, 0.00013744831f), vec2<f32>(0.9614258f, 0.00020754337f), vec2<f32>(0.9291992f, 0.00028014183f), vec2<f32>(0.8828125f, 0.00033450127f), vec2<f32>(0.82177734f, 0.00036263466f), vec2<f32>(0.74902344f, 0.00036215782f), vec2<f32>(0.66845703f, 0.00033807755f), vec2<f32>(0.5854492f, 0.00029969215f), vec2<f32>(0.50390625f, 0.00025582314f), vec2<f32>(0.42700195f, 0.0002117157f), vec2<f32>(0.35766602f, 0.000172019f), vec2<f32>(1f, 0f), vec2<f32>(1f, 0.000000059604645f), vec2<f32>(0.9995117f, 0.0000012516975f), vec2<f32>(0.9975586f, 0.0000053048134f), vec2<f32>(0.99316406f, 0.000015079975f), vec2<f32>(0.98291016f, 0.000028550625f), vec2<f32>(0.96435547f, 0.000047445297f), vec2<f32>(0.93408203f, 0.00006842613f), vec2<f32>(0.88916016f, 0.00008893013f), vec2<f32>(0.828125f, 0.000104248524f), vec2<f32>(0.75390625f, 0.00011217594f), vec2<f32>(0.67041016f, 0.00011241436f), vec2<f32>(0.5830078f, 0.00010627508f), vec2<f32>(0.4970703f, 0.00009584427f), vec2<f32>(0.4169922f, 0.00008332729f), vec2<f32>(0.34521484f, 0.000070512295f));
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
@group(1) @binding(0) 
var<uniform> materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: MaterialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX;
@group(1) @binding(2) 
var baseColorTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: texture_2d<f32>;
@group(1) @binding(1) 
var baseColorTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: sampler;
@group(1) @binding(4) 
var metallicRoughnessTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: texture_2d<f32>;
@group(1) @binding(3) 
var metallicRoughnessTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: sampler;
@group(1) @binding(6) 
var normalTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: texture_2d<f32>;
@group(1) @binding(5) 
var normalTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: sampler;
@group(1) @binding(8) 
var specularTintTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: texture_2d<f32>;
@group(1) @binding(7) 
var specularTintSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: sampler;
@group(1) @binding(10) 
var emissiveTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: texture_2d<f32>;
@group(1) @binding(9) 
var emissiveTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: sampler;
@group(1) @binding(12) 
var occlusionTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: texture_2d<f32>;
@group(1) @binding(11) 
var occlusionTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: sampler;
@group(1) @binding(14) 
var transmissionTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: texture_2d<f32>;
@group(1) @binding(13) 
var transmissionSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: sampler;
@group(1) @binding(16) 
var thicknessTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: texture_2d<f32>;
@group(1) @binding(15) 
var thicknessSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: sampler;
@group(1) @binding(23) 
var<uniform> skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: SkylightUniformsX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX;
@group(1) @binding(19) 
var prefilterMapX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: texture_cube<f32>;
@group(1) @binding(20) 
var prefilterSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: sampler;
@group(1) @binding(21) 
var brdfLutX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: texture_2d<f32>;
@group(1) @binding(22) 
var brdfLutSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: sampler;
@group(1) @binding(17) 
var irradianceMapX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: texture_cube<f32>;
@group(1) @binding(18) 
var irradianceSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX: sampler;

fn probe_sh9X_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX(shPreblend: array<vec4<f32>, 9>, normal: vec3<f32>) -> vec3<f32> {
    var result: vec3<f32> = vec3(0f);
    var band: u32 = 0u;

    let x_2 = normal.x;
    let y_2 = normal.y;
    let z = normal.z;
    let basis = array<f32, 9>(0.2820948f, (0.48860252f * y_2), (0.48860252f * z), (0.48860252f * x_2), ((1.0925485f * x_2) * y_2), ((1.0925485f * y_2) * z), (0.31539157f * (((3f * z) * z) - 1f)), ((1.0925485f * x_2) * z), (0.54627424f * ((x_2 * x_2) - (y_2 * y_2))));
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

fn evaluateProbeDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX(shPreblend_1: array<vec4<f32>, 9>, localBlendFraction: f32, normal_1: vec3<f32>, e_sky: vec3<f32>, k_d: vec3<f32>, albedo: vec3<f32>, metallic: f32) -> vec3<f32> {
    let _e2 = probe_sh9X_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX(shPreblend_1, normal_1);
    let local_19 = (max(_e2, vec3(0f)) * PROBE_INV_PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX);
    let skyResidualFraction = (1f - localBlendFraction);
    return ((((local_19 + (skyResidualFraction * e_sky)) * k_d) * albedo) * (1f - metallic));
}

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
    let z_1 = sqrt(saturate((1f - dot(xy, xy))));
    return vec3<f32>(xy, z_1);
}

fn scaleTangentSpaceNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(tn: vec3<f32>, scale: f32) -> vec3<f32> {
    let xy_1 = (tn.xy * scale);
    let z_2 = sqrt(saturate((1f - dot(xy_1, xy_1))));
    return vec3<f32>(xy_1, z_2);
}

fn applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(worldNormal: vec3<f32>, worldTangent: vec4<f32>, tn_1: vec3<f32>) -> vec3<f32> {
    let n0_ = normalize(worldNormal);
    let t0_ = normalize((worldTangent.xyz - (dot(worldTangent.xyz, n0_) * n0_)));
    let b0_ = (cross(n0_, t0_) * worldTangent.w);
    return normalize((((t0_ * tn_1.x) + (b0_ * tn_1.y)) + (n0_ * tn_1.z)));
}

fn f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH: f32, f0_: vec3<f32>) -> vec3<f32> {
    let fresnel = exp2((((-5.55473f * vDotH) - 6.98316f) * vDotH));
    return ((f0_ * (vec3(1f) - vec3(fresnel))) + vec3(fresnel));
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

fn sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_2: vec3<f32>, rotation_1: vec4<f32>, irradianceMap: texture_cube<f32>, irradianceSampler: sampler) -> vec3<f32> {
    let _e2 = inverseRotateEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(normal_2, rotation_1);
    let dir = vec3<f32>(_e2.x, -(_e2.y), _e2.z);
    let _e10 = textureSample(irradianceMap, irradianceSampler, dir);
    let irradianceEOverPi = _e10.xyz;
    return irradianceEOverPi;
}

fn projectSpecularRadianceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(radiance: vec3<f32>, normal_3: vec3<f32>, view: vec3<f32>, roughness_1: f32, F0_1: vec3<f32>, brdfLut: texture_2d<f32>, brdfLutSampler: sampler) -> vec3<f32> {
    let NdotV = max(dot(normal_3, view), 0.001f);
    let _e10 = textureSampleLevel(brdfLut, brdfLutSampler, vec2<f32>(NdotV, roughness_1), 0f);
    let envBRDF = _e10.xy;
    let _e13 = fresnelSchlickRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(NdotV, F0_1, roughness_1);
    return (radiance * ((_e13 * envBRDF.x) + vec3(envBRDF.y)));
}

fn sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_4: vec3<f32>, view_1: vec3<f32>, roughness_2: f32, F0_2: vec3<f32>, rotation_2: vec4<f32>, prefilterMap: texture_cube<f32>, prefilterSampler: sampler, brdfLut_1: texture_2d<f32>, brdfLutSampler_1: sampler) -> vec3<f32> {
    let NdotV_1 = max(dot(normal_4, view_1), 0.001f);
    let R = reflect(-(view_1), normal_4);
    let _e8 = inverseRotateEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(R, rotation_2);
    let Rflip = vec3<f32>(_e8.x, -(_e8.y), _e8.z);
    let mip = (roughness_2 * 4f);
    let _e19 = textureSampleLevel(prefilterMap, prefilterSampler, Rflip, mip);
    let prefilteredColor = _e19.xyz;
    let _e24 = projectSpecularRadianceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(prefilteredColor, normal_4, view_1, roughness_2, F0_2, brdfLut_1, brdfLutSampler_1);
    return _e24;
}

fn box_projectX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(worldPosition: vec3<f32>, direction_1: vec3<f32>, boxCenter: vec3<f32>, boxExtents: vec3<f32>) -> vec3<f32> {
    let safeExtents = max(boxExtents, vec3(0.0001f));
    let safeDirection = select(vec3(0.0001f), direction_1, (abs(direction_1) >= vec3(0.0001f)));
    let localPosition = (worldPosition - boxCenter);
    let edgeSign = select(vec3(-1f), vec3(1f), (direction_1 >= vec3(0f)));
    let edge = (edgeSign * safeExtents);
    let distances = ((edge - localPosition) / safeDirection);
    let travel = min(distances.x, min(distances.y, distances.z));
    return normalize((localPosition + (direction_1 * max(travel, 0f))));
}

fn sampleReflectionProbeSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_5: vec3<f32>, view_2: vec3<f32>, roughness_3: f32, F0_3: vec3<f32>, worldPosition_1: vec3<f32>, boxCenter_1: vec3<f32>, boxExtents_1: vec3<f32>, rotation_3: vec4<f32>, probeMap: texture_cube<f32>, probeSampler: sampler, brdfLut_2: texture_2d<f32>, brdfLutSampler_2: sampler) -> vec3<f32> {
    let NdotV_2 = max(dot(normal_5, view_2), 0.001f);
    let reflection = reflect(-(view_2), normal_5);
    let _e10 = box_projectX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(worldPosition_1, reflection, boxCenter_1, boxExtents_1);
    let _e12 = inverseRotateEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(_e10, rotation_3);
    let probeDirection = vec3<f32>(_e12.x, -(_e12.y), _e12.z);
    let mip_1 = (roughness_3 * 4f);
    let _e23 = textureSampleLevel(probeMap, probeSampler, probeDirection, mip_1);
    let prefilteredColor_1 = _e23.xyz;
    let _e28 = projectSpecularRadianceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(prefilteredColor_1, normal_5, view_2, roughness_3, F0_3, brdfLut_2, brdfLutSampler_2);
    return _e28;
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

fn shadow_sample_compareX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMap_1: texture_depth_2d, shadowSampler: sampler_comparison, uv_2: vec2<f32>, depthRef: f32) -> f32 {
    let _e4 = textureSampleCompareLevel(shadowMap_1, shadowSampler, uv_2, depthRef);
    return _e4;
}

fn shadow_biased_receiver_depthX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(receiverDepth: f32, normalBias: f32, depthBias: f32, nDotL: f32) -> f32 {
    return (receiverDepth - max((normalBias * (1f - nDotL)), depthBias));
}

fn d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH: f32, a: f32) -> f32 {
    let a2_ = (a * a);
    let f = ((((nDotH * a2_) - nDotH) * nDotH) + 1f);
    return (a2_ / ((3.1415927f * f) * f));
}

fn v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV: f32, nDotL_1: f32, a_1: f32) -> f32 {
    let a2_1 = (a_1 * a_1);
    let gv = (nDotL_1 * sqrt((((nDotV * nDotV) * (1f - a2_1)) + a2_1)));
    let gl = (nDotV * sqrt((((nDotL_1 * nDotL_1) * (1f - a2_1)) + a2_1)));
    return (0.5f / max((gv + gl), 0.00001f));
}

fn sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_4: f32, dotNV: f32) -> vec2<f32> {
    let uv_3 = clamp(vec2<f32>(roughness_4, dotNV), vec2(0f), vec2(1f));
    let samplePosition = ((uv_3 * 16f) - vec2(0.5f));
    let base = vec2<i32>(floor(samplePosition));
    let weight = fract(samplePosition);
    let lo = clamp(base, vec2(0i), vec2(15i));
    let hi = clamp((base + vec2(1i)), vec2(0i), vec2(15i));
    let rowLo = mix(THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(lo.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(lo.x))], THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(lo.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(hi.x))], weight.x);
    let rowHi = mix(THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(hi.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(lo.x))], THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(hi.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(hi.x))], weight.x);
    return mix(rowLo, rowHi, weight.y);
}

fn threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_5: f32, nDotV_1: f32, nDotL_2: f32, F0_4: vec3<f32>) -> vec3<f32> {
    let _e2 = sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_5, nDotV_1);
    let _e4 = sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_5, nDotL_2);
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
    let roughness_6 = sqrt(max(alphaSq, 0f));
    let _e31 = threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_6, nDotV_2, nDotL_3, F0_5);
    let _e32 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_1, alphaSq);
    let _e33 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_2, nDotL_3, alphaSq);
    let specular = (((_e32 * _e33) * _e26) + _e31);
    let diffuse = (((1f - metallic_1) * baseColor) / vec3(3.1415927f));
    let _e48 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightColor;
    return (((diffuse + specular) * _e48) * nDotL_3);
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

fn _pcssDiskRotationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(texel_2: vec2<i32>, layer_3: u32) -> f32 {
    let hash = (((u32(texel_2.x) * 1664525u) + (u32(texel_2.y) * 1013904223u)) + ((layer_3 + 1u) * 374761393u));
    return (f32((hash % 6283u)) * 0.001f);
}

fn _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(index: u32, angle: f32, radius: f32) -> vec2<f32> {
    let point = PCSS_DISK_OFFSETSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX[index];
    let cs = cos(angle);
    let sn = sin(angle);
    return (vec2<f32>(((point.x * cs) - (point.y * sn)), ((point.x * sn) + (point.y * cs))) * radius);
}

fn _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize: vec2<u32>, tileOrigin_1: vec2<u32>, tileSize_1: vec2<u32>, baseTexel: vec2<i32>, offset: vec2<f32>) -> vec2<f32> {
    let _e10 = shadow_clamp_texel_to_tileX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX((baseTexel + vec2<i32>(round(offset))), vec2<i32>(tileOrigin_1), vec2<i32>(tileSize_1), 1i);
    return ((vec2<f32>(_e10) + vec2(0.5f)) / vec2<f32>(shadowMapSize));
}

fn _samplePcssForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos: vec3<f32>, layer_4: u32, count_4: u32, normal_7: vec3<f32>, l: vec3<f32>, profile: u32) -> f32 {
    var local: bool;
    var local_1: bool;
    var local_2: bool;
    var local_3: bool;
    var local_4: bool;
    var local_5: bool;
    var local_6: bool;
    var blockerDepth: f32 = 0f;
    var blockerCount: u32 = 0u;
    var i_1: u32 = 0u;
    var local_7: bool;
    var i_2: u32 = 0u;
    var local_8: bool;
    var local_9: bool;
    var local_10: bool;
    var local_11: bool;
    var litSum: f32 = 0f;
    var i_3: u32 = 0u;
    var i_4: u32 = 0u;

    let _e3 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_4);
    let lightClip = (_e3 * vec4<f32>(worldPos, 1f));
    if !((lightClip.w > 0f)) {
        local = (lightClip.w < 0f);
    } else {
        local = true;
    }
    let _e18 = local;
    if !(_e18) {
        return 1f;
    }
    let projCoords = (lightClip.xyz / vec3(lightClip.w));
    let tileUv = vec2<f32>(((projCoords.x * 0.5f) + 0.5f), ((-(projCoords.y) * 0.5f) + 0.5f));
    if (tileUv.x >= 0f) {
        local_1 = (tileUv.x <= 1f);
    } else {
        local_1 = false;
    }
    let _e46 = local_1;
    if _e46 {
        local_2 = (tileUv.y >= 0f);
    } else {
        local_2 = false;
    }
    let _e53 = local_2;
    if _e53 {
        local_3 = (tileUv.y <= 1f);
    } else {
        local_3 = false;
    }
    let _e60 = local_3;
    if _e60 {
        local_4 = (projCoords.z >= 0f);
    } else {
        local_4 = false;
    }
    let _e67 = local_4;
    if _e67 {
        local_5 = (projCoords.z <= 1f);
    } else {
        local_5 = false;
    }
    let _e74 = local_5;
    if !(_e74) {
        return 1f;
    }
    let nDotL_4 = dot(normal_7, l);
    if (nDotL_4 >= -1f) {
        local_6 = (nDotL_4 <= 1f);
    } else {
        local_6 = false;
    }
    let _e87 = local_6;
    if !(_e87) {
        return 1f;
    }
    let shadowMapSize_1 = textureDimensions(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 0i);
    let _e94 = _atlasTileGridX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_4);
    let tileSize_2 = (shadowMapSize_1 / _e94);
    let tileOrigin_2 = (vec2<u32>((layer_4 % _e94.x), (layer_4 / _e94.x)) * tileSize_2);
    let baseTexel_1 = (vec2<i32>(tileOrigin_2) + vec2<i32>(floor((tileUv * vec2<f32>(tileSize_2)))));
    let _e108 = _pcssDiskRotationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(baseTexel_1, layer_4);
    let _e112 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.normalBias;
    let _e115 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
    let _e116 = shadow_biased_receiver_depthX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(projCoords.z, _e112, _e115, nDotL_4);
    let rawRadius = select(2f, 3f, (profile == 5u));
    if (profile == 4u) {
        loop {
            let _e126 = i_1;
            if (_e126 < PCSS_MEDIUM_RAW_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) {
            } else {
                break;
            }
            {
                let _e129 = i_1;
                let _e130 = _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e129, _e108, rawRadius);
                let _e131 = _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize_1, tileOrigin_2, tileSize_2, baseTexel_1, _e130);
                let rawTexel = vec2<i32>(((_e131 * vec2<f32>(shadowMapSize_1)) - vec2(0.5f)));
                let _e139 = shadow_load_raw_depthX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, rawTexel);
                if (_e139 >= 0f) {
                    local_7 = (_e139 < _e116);
                } else {
                    local_7 = false;
                }
                let _e146 = local_7;
                if _e146 {
                    let _e148 = blockerDepth;
                    blockerDepth = (_e148 + _e139);
                    let _e151 = blockerCount;
                    blockerCount = (_e151 + 1u);
                }
            }
            continuing {
                let _e154 = i_1;
                i_1 = (_e154 + 1u);
            }
        }
    } else {
        loop {
            let _e158 = i_2;
            if (_e158 < PCSS_HIGH_RAW_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) {
            } else {
                break;
            }
            {
                let _e161 = i_2;
                let _e162 = _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e161, _e108, rawRadius);
                let _e163 = _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize_1, tileOrigin_2, tileSize_2, baseTexel_1, _e162);
                let rawTexel_1 = vec2<i32>(((_e163 * vec2<f32>(shadowMapSize_1)) - vec2(0.5f)));
                let _e171 = shadow_load_raw_depthX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, rawTexel_1);
                if (_e171 >= 0f) {
                    local_8 = (_e171 < _e116);
                } else {
                    local_8 = false;
                }
                let _e178 = local_8;
                if _e178 {
                    let _e179 = blockerDepth;
                    blockerDepth = (_e179 + _e171);
                    let _e181 = blockerCount;
                    blockerCount = (_e181 + 1u);
                }
            }
            continuing {
                let _e184 = i_2;
                i_2 = (_e184 + 1u);
            }
        }
    }
    let _e187 = blockerCount;
    if (_e187 == 0u) {
        return 1f;
    }
    let _e191 = blockerDepth;
    let _e192 = blockerCount;
    let averageBlockerDepth = (_e191 / f32(_e192));
    let _e199 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_4].z;
    let lightDepthWorldSpan = max(_e199, 0f);
    let _e206 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_4].y;
    let worldUnitsPerTexel = max(_e206, 0f);
    if (lightDepthWorldSpan > 0f) {
        local_9 = (worldUnitsPerTexel > 0f);
    } else {
        local_9 = false;
    }
    let _e216 = local_9;
    if _e216 {
        let _e220 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.y;
        local_10 = (_e220 >= 0f);
    } else {
        local_10 = false;
    }
    let _e226 = local_10;
    if _e226 {
        let _e230 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.z;
        local_11 = (_e230 >= 0f);
    } else {
        local_11 = false;
    }
    let _e236 = local_11;
    if !(_e236) {
        return 1f;
    }
    let worldDistance = (max(0f, (_e116 - averageBlockerDepth)) * lightDepthWorldSpan);
    let _e246 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.y;
    let _e253 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.z;
    let penumbraTexels = clamp(((worldDistance * tan(_e246)) / worldUnitsPerTexel), 0f, _e253);
    let compareRadius = max(0.5f, penumbraTexels);
    if (profile == 4u) {
        loop {
            let _e261 = i_3;
            if (_e261 < PCSS_MEDIUM_COMPARE_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) {
            } else {
                break;
            }
            {
                let _e264 = i_3;
                let _e265 = _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e264, _e108, compareRadius);
                let _e266 = _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize_1, tileOrigin_2, tileSize_2, baseTexel_1, _e265);
                let _e268 = litSum;
                let _e271 = shadow_sample_compareX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, _e266, _e116);
                litSum = (_e268 + _e271);
            }
            continuing {
                let _e273 = i_3;
                i_3 = (_e273 + 1u);
            }
        }
        let _e276 = litSum;
        return (_e276 / 16f);
    }
    loop {
        let _e280 = i_4;
        if (_e280 < PCSS_HIGH_COMPARE_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) {
        } else {
            break;
        }
        {
            let _e283 = i_4;
            let _e284 = _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e283, _e108, compareRadius);
            let _e285 = _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize_1, tileOrigin_2, tileSize_2, baseTexel_1, _e284);
            let _e286 = litSum;
            let _e289 = shadow_sample_compareX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, _e285, _e116);
            litSum = (_e286 + _e289);
        }
        continuing {
            let _e291 = i_4;
            i_4 = (_e291 + 1u);
        }
    }
    let _e294 = litSum;
    return (_e294 / 32f);
}

fn _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_1: vec3<f32>, layer_5: u32, count_5: u32, normal_8: vec3<f32>, l_1: vec3<f32>, useNormalBias: bool) -> f32 {
    var local_12: bool;
    var local_13: bool;
    var local_14: bool;
    var local_15: bool;
    var blocked: f32 = 0f;
    var local_16: bool;
    var x: i32 = -1i;
    var y: i32;
    var x_1: i32 = -2i;
    var y_1: i32;

    let _e4 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_5);
    let lightClip_1 = (_e4 * vec4<f32>(worldPos_1, 1f));
    let projCoords_1 = (lightClip_1.xyz / vec3(lightClip_1.w));
    let _e14 = _atlasTileScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_5);
    let _e15 = _atlasTileOriginX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_5, count_5);
    let tileUv_1 = vec2<f32>(((projCoords_1.x * 0.5f) + 0.5f), ((-(projCoords_1.y) * 0.5f) + 0.5f));
    let uv_4 = ((tileUv_1 * _e14) + _e15);
    let currentDepth = projCoords_1.z;
    let _e33 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
    let _e36 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.normalBias;
    let _e46 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
    let bias = select(_e33, max((_e36 * (1f - dot(normal_8, l_1))), _e46), useNormalBias);
    let adjustedDepth = (currentDepth - bias);
    if (tileUv_1.x >= 0f) {
        local_12 = (tileUv_1.x <= 1f);
    } else {
        local_12 = false;
    }
    let _e59 = local_12;
    if _e59 {
        local_13 = (tileUv_1.y >= 0f);
    } else {
        local_13 = false;
    }
    let _e66 = local_13;
    if _e66 {
        local_14 = (tileUv_1.y <= 1f);
    } else {
        local_14 = false;
    }
    let _e73 = local_14;
    if _e73 {
        local_15 = (currentDepth <= 1f);
    } else {
        local_15 = false;
    }
    let _e79 = local_15;
    if !(_e79) {
        return 1f;
    }
    let _e84 = textureDimensions(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 0i);
    let texelDims = vec2<f32>(_e84);
    let texel_3 = vec2<f32>((1f / texelDims.x), (1f / texelDims.y));
    let tileLo = (_e15 + texel_3);
    let tileHi = ((_e15 + _e14) - texel_3);
    let _e99 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.x;
    let filterProfile = clamp(u32(round(_e99)), 1u, 5u);
    if (filterProfile >= 4u) {
        let _e107 = _samplePcssForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_1, layer_5, count_5, normal_8, l_1, filterProfile);
        return _e107;
    }
    let kernel = select(select(3u, 5u, (filterProfile == 3u)), 1u, (filterProfile == 1u));
    if (kernel == 1u) {
        let lit = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, clamp(uv_4, tileLo, tileHi), adjustedDepth);
        return lit;
    }
    if (kernel == 3u) {
        if all((uv_4 >= (tileLo + texel_3))) {
            local_16 = all((uv_4 <= (tileHi - texel_3)));
        } else {
            local_16 = false;
        }
        let interior = local_16;
        if interior {
            let pcfFraction = fract(((uv_4 / texel_3) - vec2(0.5f)));
            let loWeight = (vec2(2f) - pcfFraction);
            let hiWeight = (vec2(1f) + pcfFraction);
            let loOffset = ((vec2(-1f) - pcfFraction) + (vec2(1f) / loWeight));
            let hiOffset = ((vec2(1f) - pcfFraction) + (pcfFraction / hiWeight));
            let litLoLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_4 + (vec2<f32>(loOffset.x, loOffset.y) * texel_3)), adjustedDepth);
            let litHiLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_4 + (vec2<f32>(hiOffset.x, loOffset.y) * texel_3)), adjustedDepth);
            let litLoHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_4 + (vec2<f32>(loOffset.x, hiOffset.y) * texel_3)), adjustedDepth);
            let litHiHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_4 + (vec2<f32>(hiOffset.x, hiOffset.y) * texel_3)), adjustedDepth);
            return ((((((litLoLo * loWeight.x) * loWeight.y) + ((litHiLo * hiWeight.x) * loWeight.y)) + ((litLoHi * loWeight.x) * hiWeight.y)) + ((litHiHi * hiWeight.x) * hiWeight.y)) / 9f);
        }
        loop {
            let _e212 = x;
            if (_e212 <= 1i) {
            } else {
                break;
            }
            {
                y = -1i;
                loop {
                    let _e217 = y;
                    if (_e217 <= 1i) {
                    } else {
                        break;
                    }
                    {
                        let _e220 = x;
                        let _e222 = y;
                        let offsetUv = clamp((uv_4 + (vec2<f32>(f32(_e220), f32(_e222)) * texel_3)), tileLo, tileHi);
                        let lit_1 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv, adjustedDepth);
                        let _e232 = blocked;
                        blocked = (_e232 + (1f - lit_1));
                    }
                    continuing {
                        let _e237 = y;
                        y = (_e237 + 1i);
                    }
                }
            }
            continuing {
                let _e240 = x;
                x = (_e240 + 1i);
            }
        }
        let _e242 = blocked;
        return (1f - (_e242 / 9f));
    }
    loop {
        let _e248 = x_1;
        if (_e248 <= 2i) {
        } else {
            break;
        }
        {
            y_1 = -2i;
            loop {
                let _e253 = y_1;
                if (_e253 <= 2i) {
                } else {
                    break;
                }
                {
                    let _e256 = x_1;
                    let _e258 = y_1;
                    let offsetUv_1 = clamp((uv_4 + (vec2<f32>(f32(_e256), f32(_e258)) * texel_3)), tileLo, tileHi);
                    let lit_2 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv_1, adjustedDepth);
                    let _e267 = blocked;
                    blocked = (_e267 + (1f - lit_2));
                }
                continuing {
                    let _e272 = y_1;
                    y_1 = (_e272 + 1i);
                }
            }
        }
        continuing {
            let _e275 = x_1;
            x_1 = (_e275 + 1i);
        }
    }
    let _e277 = blocked;
    return (1f - (_e277 / 25f));
}

fn evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_9: vec3<f32>, worldPos_2: vec3<f32>, viewZ: f32) -> f32 {
    var shadow: f32;
    var local_17: bool;

    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeCount;
    if (_e2 < 1f) {
        return 1f;
    }
    let _e8 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let l_3 = normalize(-(_e8));
    let _e13 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeCount;
    let count_6 = u32(max(_e13, 1f));
    let viewDepth_1 = -(viewZ);
    let _e25 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[(count_6 - 1u)].x;
    if (viewDepth_1 > _e25) {
        return 1f;
    }
    let _e28 = _pickCascadeLayerX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(viewDepth_1, count_6);
    let _e32 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_2, _e28, count_6, normal_9, l_3, true);
    shadow = _e32;
    let _e36 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
    if (_e36 > 0f) {
        local_17 = ((_e28 + 1u) < count_6);
    } else {
        local_17 = false;
    }
    let _e45 = local_17;
    if _e45 {
        let spCurr = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[_e28].x;
        let _e53 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
        let blendWidth = (spCurr * _e53);
        if (blendWidth > 0f) {
            let dist = (spCurr - viewDepth_1);
            let t_1 = clamp((1f - (dist / blendWidth)), 0f, 1f);
            if (t_1 > 0f) {
                let _e69 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_2, (_e28 + 1u), count_6, normal_9, l_3, true);
                shadow = mix(_e32, _e69, t_1);
            }
        }
    }
    let _e71 = shadow;
    return _e71;
}

fn materialTextureFilteringWitnessX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX() {
    let baseWitness = textureSample(baseColorTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, baseColorTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, vec2(0f));
    let metallicRoughnessWitness = textureSample(metallicRoughnessTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, metallicRoughnessTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, vec2(0f));
    let normalWitness = textureSample(normalTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, normalTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, vec2(0f));
    let specularTintWitness = textureSample(specularTintTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, specularTintSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, vec2(0f));
    let emissiveWitness = textureSample(emissiveTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, emissiveTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, vec2(0f));
    let occlusionWitness = textureSample(occlusionTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, occlusionTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, vec2(0f));
    let transmissionWitness = textureSample(transmissionTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, transmissionSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, vec2(0f));
    let thicknessWitness = textureSample(thicknessTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, thicknessSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, vec2(0f));
    return;
}

fn transformedMaterialUvX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(transform: vec4<f32>, metadata: vec4<f32>, in: VsOutX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX) -> vec2<f32> {
    var source: vec2<f32>;

    source = in.uv;
    if (metadata.x >= 1f) {
        source = in.uvOne;
    }
    if (metadata.x >= 2f) {
        source = in.uvTwo;
    }
    if (metadata.x >= 3f) {
        source = in.uvThree;
    }
    if (metadata.x >= 4f) {
        source = in.uvFour;
    }
    if (metadata.x >= 5f) {
        source = in.uvFive;
    }
    if (metadata.x >= 6f) {
        source = in.uvSix;
    }
    if (metadata.x >= 7f) {
        source = in.uvSeven;
    }
    let _e33 = source;
    let scaled = (_e33 * transform.zw);
    let angle_1 = metadata.y;
    let c = cos(angle_1);
    let s = sin(angle_1);
    return (vec2<f32>(((scaled.x * c) - (scaled.y * s)), ((scaled.x * s) + (scaled.y * c))) + transform.xy);
}

fn materialVertexColorX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(in_1: VsOutX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX) -> vec4<f32> {
    return vec4(1f);
}

fn alphaTestX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(alpha: f32) {
    var local_18: bool;

    let _e2 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.alphaCutoff;
    if (_e2 > 0f) {
        let _e8 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.alphaCutoff;
        local_18 = (alpha <= _e8);
    } else {
        local_18 = false;
    }
    let _e13 = local_18;
    if _e13 {
        discard;
    } else {
        return;
    }
}

fn finiteScalarX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(value: f32, fallback: f32) -> f32 {
    let bounded = clamp(value, -65504f, 65504f);
    return select(fallback, bounded, (value == value));
}

fn pick_channelX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(rgba: vec4<f32>, channelIndex: u32) -> f32 {
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

fn evaluateStandardSurfaceX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(in_2: VsOutX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, factors: StandardSurfaceFactorsX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX) -> StandardPbrOutputX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX {
    var a_2: f32;
    var diffuseAlbedo: vec3<f32>;
    var irradiance: vec3<f32> = vec3(0f);
    var specularIbl: vec3<f32> = vec3(0f);
    var reflectionFallback: vec3<f32>;
    var ambient: vec3<f32>;
    var clearcoatIbl: vec3<f32> = vec3(0f);
    var color: vec3<f32>;
    var output_1: StandardPbrOutputX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX;

    let _e4 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.baseColorTextureCoordinatesTransform;
    let _e7 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.baseColorTextureCoordinatesMetadata;
    let _e9 = transformedMaterialUvX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(_e4, _e7, in_2);
    let _e12 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.baseColorTextureCoordinatesMetadata;
    let _e16 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, baseColorTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, _e9, _e12.zw);
    let _e17 = materialVertexColorX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(in_2);
    alphaTestX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(((factors.baseColor.w * _e16.w) * _e17.w));
    let alpha_1 = ((factors.baseColor.w * _e16.w) * _e17.w);
    let albedo_1 = ((factors.baseColor.xyz * _e16.xyz) * _e17.xyz);
    let _e39 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.metallicRoughnessTextureCoordinatesTransform;
    let _e42 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.metallicRoughnessTextureCoordinatesMetadata;
    let _e43 = transformedMaterialUvX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(_e39, _e42, in_2);
    let _e46 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.metallicRoughnessTextureCoordinatesMetadata;
    let _e50 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(metallicRoughnessTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, metallicRoughnessTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, _e43, _e46.zw);
    let _e53 = finiteScalarX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(factors.metallic, 0f);
    let _e56 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.metallicChannel;
    let _e58 = pick_channelX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(_e50, u32(_e56));
    let _e60 = finiteScalarX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(_e58, 1f);
    let metallic_2 = clamp((_e53 * _e60), 0f, 1f);
    let _e67 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.roughnessChannel;
    let _e69 = pick_channelX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(_e50, u32(_e67));
    let _e71 = finiteScalarX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(_e69, 1f);
    let roughnessTex = clamp(_e71, 0f, 1f);
    let _e77 = finiteScalarX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(factors.roughness, 0.5f);
    a_2 = max(_e77, 0.04f);
    let _e81 = a_2;
    a_2 = (_e81 * roughnessTex);
    let _e83 = a_2;
    let _e84 = a_2;
    a_2 = (_e83 * _e84);
    let _e88 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.normalTextureCoordinatesTransform;
    let _e91 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.normalTextureCoordinatesMetadata;
    let _e92 = transformedMaterialUvX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(_e88, _e91, in_2);
    let _e95 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.normalTextureCoordinatesMetadata;
    let _e99 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(normalTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, normalTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, _e92, _e95.zw);
    let normSampleRg = _e99.xy;
    let _e101 = decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(normSampleRg);
    let _e104 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.normalScale;
    let _e105 = scaleTangentSpaceNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(_e101, _e104);
    let _e108 = applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(in_2.worldNormal, in_2.worldTangent, _e105);
    let _e111 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let v = normalize((_e111 - in_2.worldPos));
    let _e117 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.specularTintTextureCoordinatesTransform;
    let _e120 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.specularTintTextureCoordinatesMetadata;
    let _e121 = transformedMaterialUvX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(_e117, _e120, in_2);
    let _e124 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.specularTint;
    let _e127 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.specularTintTextureCoordinatesMetadata;
    let _e131 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(specularTintTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, specularTintSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, _e121, _e127.zw);
    let specularTint = (_e124 * _e131.xyz);
    let _e136 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.ior;
    let _e138 = finiteScalarX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(_e136, 1.5f);
    let safeIor = max(_e138, 1f);
    let dielectricF0_ = pow(((safeIor - 1f) / (safeIor + 1f)), 2f);
    let f0_1 = mix((vec3(dielectricF0_) * specularTint), albedo_1, metallic_2);
    diffuseAlbedo = albedo_1;
    let coatRoughness = max(factors.clearcoatRoughness, 0.04f);
    let coatAlpha = (coatRoughness * coatRoughness);
    let _e161 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(max(dot(_e108, v), 0f), vec3(0.04f));
    let coatF = (_e161 * factors.clearcoat);
    let _e169 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(max(dot(_e108, v), 0f), f0_1);
    let kD = ((vec3(1f) - _e169) * (1f - metallic_2));
    let _e176 = finiteScalarX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(factors.roughness, 0.5f);
    let iblRoughness = clamp((max(_e176, 0.04f) * roughnessTex), 0.04f, 1f);
    let _e185 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.intensity;
    if (_e185 < 0f) {
        let _e191 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.colorR;
        let _e194 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.colorG;
        let _e197 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.colorB;
        let _e201 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.rotation;
        let _e212 = sampleReflectionProbeSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e108, v, iblRoughness, f0_1, in_2.worldPos, vec3<f32>(_e191, _e194, _e197), _e201.xyz, vec4<f32>(0f, 0f, 0f, 1f), prefilterMapX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, prefilterSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, brdfLutX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, brdfLutSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX);
        specularIbl = _e212;
    } else {
        let _e216 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.rotation;
        let _e219 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e108, _e216, irradianceMapX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, irradianceSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX);
        irradiance = _e219;
        let _e223 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.rotation;
        let _e228 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e108, v, iblRoughness, f0_1, _e223, prefilterMapX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, prefilterSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, brdfLutX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, brdfLutSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX);
        specularIbl = _e228;
    }
    let _e231 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.occlusionTextureCoordinatesTransform;
    let _e234 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.occlusionTextureCoordinatesMetadata;
    let _e235 = transformedMaterialUvX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(_e231, _e234, in_2);
    let _e238 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.occlusionTextureCoordinatesMetadata;
    let _e242 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(occlusionTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, occlusionTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, _e235, _e238.zw);
    let _e246 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.occlusionStrength;
    let ao = mix(1f, _e242.x, _e246);
    let _e251 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.colorR;
    let _e254 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.colorG;
    let _e257 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.colorB;
    let skyColor = vec3<f32>(_e251, _e254, _e257);
    let _e261 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.intensity;
    let skyFactor = (skyColor * _e261);
    let _e263 = specularIbl;
    reflectionFallback = (_e263 * (vec3(1f) - coatF));
    let _e269 = irradiance;
    let _e271 = diffuseAlbedo;
    let _e273 = specularIbl;
    ambient = ((((kD * _e269) * _e271) + _e273) * (vec3(1f) - coatF));
    if (factors.clearcoat != 0f) {
        let _e285 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.intensity;
        if (_e285 < 0f) {
            let _e293 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.colorR;
            let _e296 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.colorG;
            let _e299 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.colorB;
            let _e303 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.rotation;
            let _e314 = sampleReflectionProbeSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e108, v, coatRoughness, vec3(0.04f), in_2.worldPos, vec3<f32>(_e293, _e296, _e299), _e303.xyz, vec4<f32>(0f, 0f, 0f, 1f), prefilterMapX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, prefilterSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, brdfLutX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, brdfLutSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX);
            clearcoatIbl = _e314;
        } else {
            let _e320 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.rotation;
            let _e325 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e108, v, coatRoughness, vec3(0.04f), _e320, prefilterMapX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, prefilterSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, brdfLutX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, brdfLutSamplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX);
            clearcoatIbl = _e325;
        }
        let _e326 = clearcoatIbl;
        let clearcoatContribution = (_e326 * factors.clearcoat);
        let _e329 = ambient;
        ambient = (_e329 + clearcoatContribution);
        let _e331 = reflectionFallback;
        reflectionFallback = (_e331 + clearcoatContribution);
    }
    let _e335 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.intensity;
    if (_e335 < 0f) {
        let _e340 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.intensity;
        let environmentScale = (max((-(_e340) - 1f), 0f) * ao);
        let _e347 = ambient;
        ambient = (_e347 * environmentScale);
        let _e349 = reflectionFallback;
        reflectionFallback = (_e349 * environmentScale);
    } else {
        let _e353 = skylightX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.intensity;
        let environmentScale_1 = ((skyColor * _e353) * ao);
        let _e356 = ambient;
        ambient = (_e356 * environmentScale_1);
        let _e358 = reflectionFallback;
        reflectionFallback = (_e358 * environmentScale_1);
    }
    let _e360 = ambient;
    color = _e360;
    let _e364 = evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e108, in_2.worldPos, in_2.viewZ);
    let directionalShadow = select(1f, _e364, factors.receiveShadows);
    let _e368 = diffuseAlbedo;
    let _e369 = a_2;
    let _e370 = evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e108, v, _e368, metallic_2, _e369, f0_1);
    let _e371 = color;
    color = (_e371 + (directionalShadow * _e370));
    if (factors.clearcoat != 0f) {
        let _e382 = evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e108, v, vec3(0f), 1f, coatAlpha, vec3(0.04f));
        let _e383 = color;
        color = (_e383 + ((directionalShadow * factors.clearcoat) * _e382));
    }
    let _e390 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.emissiveTextureCoordinatesTransform;
    let _e393 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.emissiveTextureCoordinatesMetadata;
    let _e394 = transformedMaterialUvX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(_e390, _e393, in_2);
    let _e397 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.emissiveTextureCoordinatesMetadata;
    let _e401 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(emissiveTextureX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, emissiveTexture_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX, _e394, _e397.zw);
    let emissiveSample = _e401.xyz;
    let _e403 = color;
    color = (select(albedo_1, _e403, factors.lighting) + ((factors.emissive * factors.emissiveIntensity) * emissiveSample));
    let _e413 = color;
    output_1.color = vec4<f32>(_e413, alpha_1);
    let _e415 = output_1;
    return _e415;
}

fn sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip: vec4<f32>, temporalProjection: vec4<f32>) -> f32 {
    let ndcDepth = (clip.z / max(abs(clip.w), 0.000001f));
    let orthographicViewZ = -((temporalProjection.x + (ndcDepth * (temporalProjection.y - temporalProjection.x))));
    return select(-(clip.w), orthographicViewZ, (temporalProjection.z >= 0.5f));
}

fn materialInterfaceWitness() {
    materialTextureFilteringWitnessX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX();
    return;
}

fn safeNormalize(value_1: vec3<f32>, fallback_1: vec3<f32>) -> vec3<f32> {
    let magnitude = length(value_1);
    if (magnitude > 0.000001f) {
        return (value_1 / vec3(magnitude));
    }
    return fallback_1;
}

@vertex 
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    output.world_position = (((input.center + (input.right * input.geometry_position.x)) + (input.up * input.geometry_position.y)) + (input.forward * input.geometry_position.z));
    let _e22 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    let _e24 = output.world_position;
    output.position = (_e22 * vec4<f32>(_e24, 1f));
    output.color = input.particle_color;
    let normalBasisX = cross(input.up, input.forward);
    let normalBasisY = cross(input.forward, input.right);
    let normalBasisZ = cross(input.right, input.up);
    let handedness = select(-1f, 1f, (dot(input.right, normalBasisX) >= 0f));
    let _e63 = safeNormalize((handedness * (((normalBasisX * input.geometry_normal.x) + (normalBasisY * input.geometry_normal.y)) + (normalBasisZ * input.geometry_normal.z))), vec3<f32>(0f, 1f, 0f));
    output.normal = _e63;
    let tangent = (((input.right * input.geometry_tangent.x) + (input.up * input.geometry_tangent.y)) + (input.forward * input.geometry_tangent.z));
    let _e80 = output.normal;
    let _e82 = output.normal;
    let _e90 = safeNormalize((tangent - (_e80 * dot(_e82, tangent))), vec3<f32>(1f, 0f, 0f));
    output.tangent = vec4<f32>(_e90, (input.geometry_tangent.w * handedness));
    output.uv = input.geometry_uv;
    output.render_controls = input.render_controls;
    let _e99 = output;
    return _e99;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    var surface: VsOutX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX;

    let _e3 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    let clip_1 = (_e3 * vec4<f32>(input_1.world_position, 1f));
    surface.clip = clip_1;
    surface.worldPos = input_1.world_position;
    surface.worldNormal = input_1.normal;
    surface.worldTangent = input_1.tangent;
    surface.uv = input_1.uv;
    surface.uvOne = input_1.uv;
    surface.uvTwo = input_1.uv;
    surface.uvThree = input_1.uv;
    surface.uvFour = input_1.uv;
    surface.uvFive = input_1.uv;
    surface.uvSix = input_1.uv;
    surface.uvSeven = input_1.uv;
    surface.ndc = vec4<f32>((clip_1.xyz / vec3(clip_1.w)), 0f);
    let _e42 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e43 = sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_1, _e42);
    surface.viewZ = _e43;
    let _e44 = surface;
    let _e48 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.baseColor;
    let _e52 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.metallic;
    let _e55 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.roughness;
    let _e58 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.emissive;
    let _e61 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.emissiveIntensity;
    let _e64 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.clearcoat;
    let _e67 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX.clearcoatRoughness;
    let _e77 = evaluateStandardSurfaceX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX(_e44, StandardSurfaceFactorsX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU43UMFXGIYLSMRPXG5LSMZQWGZIX((input_1.color * _e48), _e52, _e55, _e58, _e61, _e64, _e67, (input_1.render_controls.x != 0f), (input_1.render_controls.y != 0f)));
    return _e77.color;
}
