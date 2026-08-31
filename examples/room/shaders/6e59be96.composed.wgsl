struct FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    origin: vec3<f32>,
    direction: vec3<f32>,
    distance: f32,
}

struct FogViewParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    color: vec3<f32>,
    density: f32,
    heightFalloff: f32,
    maxOpacity: f32,
}

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
    temporalCurrentViewProj: mat4x4<f32>,
    temporalPreviousViewProj: mat4x4<f32>,
    temporalProjection: vec4<f32>,
    fog: FogViewParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX,
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
    previousWorldFromLocal: mat4x4<f32>,
    temporal: vec4<f32>,
}

struct InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    localFromInstance: mat4x4<f32>,
    previousLocalFromInstance: mat4x4<f32>,
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
    @location(4) @interpolate(flat) skinIndex: vec4<u32>,
    @location(5) skinWeight: vec4<f32>,
    @location(6) uv1_: vec2<f32>,
    @location(7) uv2_: vec2<f32>,
    @location(8) uv3_: vec2<f32>,
    @location(9) uv4_: vec2<f32>,
    @location(10) uv5_: vec2<f32>,
    @location(11) uv6_: vec2<f32>,
    @location(12) uv7_: vec2<f32>,
    @location(13) color: vec4<f32>,
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
    @location(14) color: vec4<f32>,
    @location(7) viewZ: f32,
}

struct TemporalVsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) uv: vec2<f32>,
    @location(1) uv1_: vec2<f32>,
    @location(2) uv2_: vec2<f32>,
    @location(3) uv3_: vec2<f32>,
    @location(4) uv4_: vec2<f32>,
    @location(5) uv5_: vec2<f32>,
    @location(6) uv6_: vec2<f32>,
    @location(7) uv7_: vec2<f32>,
    @location(8) currentClip: vec4<f32>,
    @location(9) previousClip: vec4<f32>,
    @location(14) color: vec4<f32>,
}

const FOG_EXP_LIMITX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX: f32 = 80f;
const FOG_Q_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX: f32 = 0.000001f;
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
var baseColorSampler_1: sampler;
@group(1) @binding(2) 
var baseColorTexture_1: texture_2d<f32>;
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
@group(1) @binding(9) 
var emissiveSampler: sampler;
@group(1) @binding(10) 
var emissiveTexture: texture_2d<f32>;
@group(1) @binding(11) 
var occlusionSampler: sampler;
@group(1) @binding(12) 
var occlusionTexture: texture_2d<f32>;
@group(1) @binding(13) 
var transmissionSampler: sampler;
@group(1) @binding(14) 
var transmissionTexture: texture_2d<f32>;
@group(1) @binding(15) 
var thicknessSampler: sampler;
@group(1) @binding(16) 
var thicknessTexture: texture_2d<f32>;
@group(1) @binding(17) 
var irradianceMap_1: texture_cube<f32>;
@group(1) @binding(18) 
var irradianceSampler_1: sampler;
@group(1) @binding(19) 
var prefilterMap_1: texture_cube<f32>;
@group(1) @binding(20) 
var prefilterSampler_1: sampler;
@group(1) @binding(21) 
var brdfLut_1: texture_2d<f32>;
@group(1) @binding(22) 
var brdfLutSampler_1: sampler;
@group(1) @binding(23) 
var<uniform> skylight: SkylightUniforms;
@group(2) @binding(1) 
var<storage> palette: array<mat4x4<f32>>;
@group(2) @binding(2) 
var<storage> previousPalette: array<mat4x4<f32>>;

fn sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture: texture_2d<f32>, textureSampler: sampler, uv: vec2<f32>, uvScale: vec2<f32>) -> vec4<f32> {
    let _e5 = textureSample(texture, textureSampler, (uv * uvScale));
    return _e5;
}

fn sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture_1: texture_2d<f32>, textureSampler_1: sampler, uv_1: vec2<f32>, uvScale_1: vec2<f32>) -> vec4<f32> {
    let _e4 = sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture_1, textureSampler_1, uv_1, uvScale_1);
    return _e4;
}

fn fogOpticalDepthX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(params: FogViewParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, ray: FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> f32 {
    var tau: f32;

    let rho0_ = (params.density * exp(clamp((-(params.heightFalloff) * ray.origin.y), -80f, FOG_EXP_LIMITX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX)));
    let q = (params.heightFalloff * ray.direction.y);
    tau = (rho0_ * ray.distance);
    if (abs(q) >= FOG_Q_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX) {
        let exponent = clamp((-(q) * ray.distance), -80f, FOG_EXP_LIMITX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX);
        tau = ((rho0_ * (1f - exp(exponent))) / q);
    }
    let _e34 = tau;
    return max(_e34, 0f);
}

fn apply_fogX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(params_1: FogViewParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, ray_1: FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, color_1: vec4<f32>) -> vec4<f32> {
    let _e2 = fogOpticalDepthX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(params_1, ray_1);
    let transmittance = exp(-(_e2));
    let opacity = (params_1.maxOpacity * (1f - transmittance));
    let mixed = mix(color_1.xyz, params_1.color, opacity);
    return vec4<f32>(mixed, color_1.w);
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
    let q_1 = normalize(rotation);
    let t = (2f * cross(q_1.xyz, direction));
    return ((direction - (q_1.w * t)) + cross(q_1.xyz, t));
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

fn d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH: f32, a_1: f32) -> f32 {
    let a2_ = (a_1 * a_1);
    let f = ((((nDotH * a2_) - nDotH) * nDotH) + 1f);
    return (a2_ / ((3.1415927f * f) * f));
}

fn v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV: f32, nDotL: f32, a_2: f32) -> f32 {
    let a2_1 = (a_2 * a_2);
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

fn _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos: vec3<f32>, layer_3: u32, count_4: u32, normal_3: vec3<f32>, l: vec3<f32>) -> f32 {
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

    let _e4 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_3);
    let lightClip = (_e4 * vec4<f32>(worldPos, 1f));
    let projCoords = (lightClip.xyz / vec3(lightClip.w));
    let _e14 = _atlasTileScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_4);
    let _e15 = _atlasTileOriginX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_3, count_4);
    let tileUv = vec2<f32>(((projCoords.x * 0.5f) + 0.5f), ((-(projCoords.y) * 0.5f) + 0.5f));
    let uv_4 = ((tileUv * _e14) + _e15);
    let currentDepth = projCoords.z;
    let _e33 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.normalBias;
    let _e42 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
    let bias = max((_e33 * (1f - dot(normal_3, l))), _e42);
    let adjustedDepth = (currentDepth - bias);
    if (tileUv.x >= 0f) {
        local_1 = (tileUv.x <= 1f);
    } else {
        local_1 = false;
    }
    let _e54 = local_1;
    if _e54 {
        local_2 = (tileUv.y >= 0f);
    } else {
        local_2 = false;
    }
    let _e61 = local_2;
    if _e61 {
        local_3 = (tileUv.y <= 1f);
    } else {
        local_3 = false;
    }
    let _e68 = local_3;
    if _e68 {
        local_4 = (currentDepth <= 1f);
    } else {
        local_4 = false;
    }
    let _e74 = local_4;
    if !(_e74) {
        return 1f;
    }
    let _e79 = textureDimensions(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 0i);
    let texelDims = vec2<f32>(_e79);
    let texel_1 = vec2<f32>((1f / texelDims.x), (1f / texelDims.y));
    let tileLo = (_e15 + texel_1);
    let tileHi = ((_e15 + _e14) - texel_1);
    let _e93 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.pcfKernelSize;
    let requestedKernel = clamp(u32(round(_e93)), 1u, 5u);
    let kernel = select(select(5u, 3u, (requestedKernel <= 4u)), 1u, (requestedKernel == 1u));
    if (kernel == 1u) {
        let lit = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, clamp(uv_4, tileLo, tileHi), adjustedDepth);
        return lit;
    }
    if (kernel == 3u) {
        if all((uv_4 >= (tileLo + texel_1))) {
            local_5 = all((uv_4 <= (tileHi - texel_1)));
        } else {
            local_5 = false;
        }
        let interior = local_5;
        if interior {
            let pcfFraction = fract(((uv_4 / texel_1) - vec2(0.5f)));
            let loWeight = (vec2(2f) - pcfFraction);
            let hiWeight = (vec2(1f) + pcfFraction);
            let loOffset = ((vec2(-1f) - pcfFraction) + (vec2(1f) / loWeight));
            let hiOffset = ((vec2(1f) - pcfFraction) + (pcfFraction / hiWeight));
            let litLoLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_4 + (vec2<f32>(loOffset.x, loOffset.y) * texel_1)), adjustedDepth);
            let litHiLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_4 + (vec2<f32>(hiOffset.x, loOffset.y) * texel_1)), adjustedDepth);
            let litLoHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_4 + (vec2<f32>(loOffset.x, hiOffset.y) * texel_1)), adjustedDepth);
            let litHiHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_4 + (vec2<f32>(hiOffset.x, hiOffset.y) * texel_1)), adjustedDepth);
            return ((((((litLoLo * loWeight.x) * loWeight.y) + ((litHiLo * hiWeight.x) * loWeight.y)) + ((litLoHi * loWeight.x) * hiWeight.y)) + ((litHiHi * hiWeight.x) * hiWeight.y)) / 9f);
        }
        loop {
            let _e203 = x;
            if (_e203 <= 1i) {
            } else {
                break;
            }
            {
                y = -1i;
                loop {
                    let _e208 = y;
                    if (_e208 <= 1i) {
                    } else {
                        break;
                    }
                    {
                        let _e211 = x;
                        let _e213 = y;
                        let offsetUv = clamp((uv_4 + (vec2<f32>(f32(_e211), f32(_e213)) * texel_1)), tileLo, tileHi);
                        let lit_1 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv, adjustedDepth);
                        let _e223 = blocked;
                        blocked = (_e223 + (1f - lit_1));
                    }
                    continuing {
                        let _e228 = y;
                        y = (_e228 + 1i);
                    }
                }
            }
            continuing {
                let _e231 = x;
                x = (_e231 + 1i);
            }
        }
        let _e233 = blocked;
        return (1f - (_e233 / 9f));
    }
    loop {
        let _e239 = x_1;
        if (_e239 <= 2i) {
        } else {
            break;
        }
        {
            y_1 = -2i;
            loop {
                let _e244 = y_1;
                if (_e244 <= 2i) {
                } else {
                    break;
                }
                {
                    let _e247 = x_1;
                    let _e249 = y_1;
                    let offsetUv_1 = clamp((uv_4 + (vec2<f32>(f32(_e247), f32(_e249)) * texel_1)), tileLo, tileHi);
                    let lit_2 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv_1, adjustedDepth);
                    let _e258 = blocked;
                    blocked = (_e258 + (1f - lit_2));
                }
                continuing {
                    let _e263 = y_1;
                    y_1 = (_e263 + 1i);
                }
            }
        }
        continuing {
            let _e266 = x_1;
            x_1 = (_e266 + 1i);
        }
    }
    let _e268 = blocked;
    return (1f - (_e268 / 25f));
}

fn evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_4: vec3<f32>, worldPos_1: vec3<f32>, viewZ: f32) -> f32 {
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
    let _e31 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_1, _e28, count_5, normal_4, l_2);
    shadow = _e31;
    let _e35 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
    if (_e35 > 0f) {
        local_6 = ((_e28 + 1u) < count_5);
    } else {
        local_6 = false;
    }
    let _e44 = local_6;
    if _e44 {
        let spCurr = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[_e28].x;
        let _e52 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
        let blendWidth = (spCurr * _e52);
        if (blendWidth > 0f) {
            let dist = (spCurr - viewDepth_1);
            let t_1 = clamp((1f - (dist / blendWidth)), 0f, 1f);
            if (t_1 > 0f) {
                let _e67 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_1, (_e28 + 1u), count_5, normal_4, l_2);
                shadow = mix(_e31, _e67, t_1);
            }
        }
    }
    let _e69 = shadow;
    return _e69;
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
            let offsetUv_2 = (uv_2 + (vec2<f32>(f32(off.x), f32(off.y)) * texel));
            let lit_3 = textureSampleCompareLevel(shadowMap, shadowSampler, offsetUv_2, adjustedDepth_1);
            let _e33 = blocked_1;
            blocked_1 = (_e33 + (1f - lit_3));
        }
        continuing {
            let _e38 = i_3;
            i_3 = (_e38 + 1u);
        }
    }
    let _e40 = blocked_1;
    return (1f - (_e40 / 9f));
}

fn evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos: vec3<f32>, colorTimesIntensity: vec3<f32>, invRangeSquared: f32, worldPos_2: vec3<f32>, normal_5: vec3<f32>, viewDir_1: vec3<f32>, baseColor_1: vec3<f32>, metallic_1: f32, alphaSq_1: f32, F0_4: vec3<f32>) -> vec3<f32> {
    let toLight = (lightPos - worldPos_2);
    let dSquared = max(dot(toLight, toLight), 0.0001f);
    let l_3 = (toLight / vec3(sqrt(dSquared)));
    let h_1 = normalize((viewDir_1 + l_3));
    let nDotL_4 = max(dot(normal_5, l_3), 0f);
    let nDotV_3 = max(dot(normal_5, viewDir_1), 0.00001f);
    let nDotH_2 = max(dot(normal_5, h_1), 0f);
    let vDotH_2 = max(dot(viewDir_1, h_1), 0f);
    let _e26 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH_2, F0_4);
    let _e28 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_2, alphaSq_1);
    let _e29 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_3, nDotL_4, alphaSq_1);
    let specular_1 = ((_e28 * _e29) * _e26);
    let kd = ((vec3(1f) - _e26) * (1f - metallic_1));
    let diffuse_1 = ((kd * baseColor_1) / vec3(3.1415927f));
    let factor = max(min((1f - ((dSquared * invRangeSquared) * (dSquared * invRangeSquared))), 1f), 0f);
    let attenuation = ((factor * factor) / dSquared);
    return ((((diffuse_1 + specular_1) * colorTimesIntensity) * nDotL_4) * attenuation);
}

fn evalPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_1: vec3<f32>, colorTimesIntensity_1: vec3<f32>, invRangeSquared_1: f32, worldPos_3: vec3<f32>, normal_6: vec3<f32>, viewDir_2: vec3<f32>, baseColor_2: vec3<f32>, metallic_2: f32, alphaSq_2: f32, F0_5: vec3<f32>) -> vec3<f32> {
    let _e10 = evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_1, colorTimesIntensity_1, invRangeSquared_1, worldPos_3, normal_6, viewDir_2, baseColor_2, metallic_2, alphaSq_2, F0_5);
    return _e10;
}

fn evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_2: vec3<f32>, lightDir: vec3<f32>, colorTimesIntensity_2: vec3<f32>, cosInner: f32, cosOuter: f32, invRangeSquared_2: f32, worldPos_4: vec3<f32>, normal_7: vec3<f32>, viewDir_3: vec3<f32>, baseColor_3: vec3<f32>, metallic_3: f32, alphaSq_3: f32, F0_6: vec3<f32>) -> vec3<f32> {
    let _e10 = evalPunctualBodyX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_2, colorTimesIntensity_2, invRangeSquared_2, worldPos_4, normal_7, viewDir_3, baseColor_3, metallic_3, alphaSq_3, F0_6);
    let toLight_1 = (lightPos_2 - worldPos_4);
    let l_4 = normalize(toLight_1);
    let cone = smoothstep(cosOuter, cosInner, dot(l_4, -(lightDir)));
    return (_e10 * cone);
}

fn sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip: vec4<f32>) -> vec2<f32> {
    let safeW = select(0.000001f, clip.w, (abs(clip.w) >= 0.000001f));
    let ndc = (clip.xy / vec2(safeW));
    return vec2<f32>(((ndc.x * 0.5f) + 0.5f), (0.5f - (ndc.y * 0.5f)));
}

fn sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_1: vec4<f32>, temporalProjection: vec4<f32>) -> f32 {
    let perspectiveDepth = max(clip_1.w, 0f);
    let ndcDepth = (clip_1.z / max(abs(clip_1.w), 0.000001f));
    let orthographicDepth = (temporalProjection.x + (ndcDepth * (temporalProjection.y - temporalProjection.x)));
    let viewDepth_2 = select(perspectiveDepth, max(orthographicDepth, 0f), (temporalProjection.z >= 0.5f));
    return log2((1f + viewDepth_2));
}

fn packSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip: vec4<f32>, previousClip: vec4<f32>, temporalProjection_1: vec4<f32>, reactive: f32) -> vec4<f32> {
    let _e1 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip);
    let _e3 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(previousClip);
    let _e6 = sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip, temporalProjection_1);
    return vec4<f32>((_e1 - _e3), _e6, clamp(reactive, 0f, 1f));
}

fn transformedPbrTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(transform: vec4<f32>, metadata: vec4<f32>, uv0_: vec2<f32>, uv1_: vec2<f32>, uv2_: vec2<f32>, uv3_: vec2<f32>, uv4_: vec2<f32>, uv5_: vec2<f32>, uv6_: vec2<f32>, uv7_: vec2<f32>) -> vec2<f32> {
    var source: vec2<f32>;

    source = uv0_;
    if (metadata.x >= 1f) {
        source = uv1_;
    }
    if (metadata.x >= 2f) {
        source = uv2_;
    }
    if (metadata.x >= 3f) {
        source = uv3_;
    }
    if (metadata.x >= 4f) {
        source = uv4_;
    }
    if (metadata.x >= 5f) {
        source = uv5_;
    }
    if (metadata.x >= 6f) {
        source = uv6_;
    }
    if (metadata.x >= 7f) {
        source = uv7_;
    }
    let _e32 = source;
    let scaled = (_e32 * transform.zw);
    let angle = metadata.y;
    let c = cos(angle);
    let s = sin(angle);
    return (vec2<f32>(((scaled.x * c) - (scaled.y * s)), ((scaled.x * s) + (scaled.y * c))) + transform.xy);
}

fn resolvePbrTemporalReactiveX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(reactive_1: f32, baseColorAlpha: f32, sampledAlpha: f32) -> f32 {
    let coverage = clamp((baseColorAlpha * sampledAlpha), 0f, 1f);
    let coverageReactive = (1f - coverage);
    return max(clamp(reactive_1, 0f, 1f), coverageReactive);
}

fn projectPbrSceneTemporalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(baseColorAlpha_1: f32, alphaCutoff: f32, baseColorTexture: texture_2d<f32>, baseColorSampler: sampler, transform_1: vec4<f32>, metadata_1: vec4<f32>, currentClip_1: vec4<f32>, previousClip_1: vec4<f32>, temporalProjection_2: vec4<f32>, reactive_2: f32, uv0_1: vec2<f32>, uv1_1: vec2<f32>, uv2_1: vec2<f32>, uv3_1: vec2<f32>, uv4_1: vec2<f32>, uv5_1: vec2<f32>, uv6_1: vec2<f32>, uv7_1: vec2<f32>) -> vec4<f32> {
    var local_7: bool;

    let _e10 = transformedPbrTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(transform_1, metadata_1, uv0_1, uv1_1, uv2_1, uv3_1, uv4_1, uv5_1, uv6_1, uv7_1);
    let _e14 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, _e10, metadata_1.zw);
    if (alphaCutoff > 0f) {
        local_7 = ((baseColorAlpha_1 * _e14.w) <= alphaCutoff);
    } else {
        local_7 = false;
    }
    let _e25 = local_7;
    if _e25 {
        discard;
    }
    let _e28 = resolvePbrTemporalReactiveX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(reactive_2, baseColorAlpha_1, _e14.w);
    let _e32 = packSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip_1, previousClip_1, temporalProjection_2, _e28);
    return _e32;
}

fn materialTextureFilteringWitness() {
    let baseWitness = textureSample(baseColorTexture_1, baseColorSampler_1, vec2(0f));
    let metallicRoughnessWitness = textureSample(metallicRoughnessTexture, metallicRoughnessSampler, vec2(0f));
    let normalWitness = textureSample(normalTexture, normalSampler, vec2(0f));
    let specularTintWitness = textureSample(specularTintTexture, specularTintSampler, vec2(0f));
    let emissiveWitness = textureSample(emissiveTexture, emissiveSampler, vec2(0f));
    let occlusionWitness = textureSample(occlusionTexture, occlusionSampler, vec2(0f));
    let transmissionWitness = textureSample(transmissionTexture, transmissionSampler, vec2(0f));
    let thicknessWitness = textureSample(thicknessTexture, thicknessSampler, vec2(0f));
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

fn applySceneFog(viewParams: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, color_2: vec3<f32>, alpha: f32, worldPos_5: vec3<f32>) -> vec4<f32> {
    var origin: vec3<f32>;
    var direction_1: vec3<f32>;
    var rayDistance: f32;

    origin = viewParams.cameraPos;
    let _e4 = origin;
    direction_1 = normalize((worldPos_5 - _e4));
    let _e8 = origin;
    rayDistance = length((worldPos_5 - _e8));
    if (viewParams.temporalProjection.z >= 0.5f) {
        let nearH = (viewParams.inverseViewProj * vec4<f32>(0f, 0f, 0f, 1f));
        let farH = (viewParams.inverseViewProj * vec4<f32>(0f, 0f, 1f, 1f));
        let nearPoint = (nearH.xyz / vec3(nearH.w));
        let farPoint = (farH.xyz / vec3(farH.w));
        direction_1 = normalize((farPoint - nearPoint));
        let _e40 = direction_1;
        let _e43 = direction_1;
        origin = (worldPos_5 - (_e40 * dot((worldPos_5 - viewParams.cameraPos), _e43)));
        let _e47 = origin;
        let _e49 = direction_1;
        rayDistance = max(dot((worldPos_5 - _e47), _e49), 0f);
    }
    let _e56 = origin;
    let _e57 = direction_1;
    let _e58 = rayDistance;
    let _e61 = apply_fogX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(viewParams.fog, FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(_e56, _e57, _e58), vec4<f32>(color_2, alpha));
    return _e61;
}

fn transformedMaterialUv(transform_2: vec4<f32>, metadata_2: vec4<f32>, in_4: VsOut) -> vec2<f32> {
    var source_1: vec2<f32>;

    source_1 = in_4.uv;
    if (metadata_2.x >= 1f) {
        source_1 = in_4.uv1_;
    }
    if (metadata_2.x >= 2f) {
        source_1 = in_4.uv2_;
    }
    if (metadata_2.x >= 3f) {
        source_1 = in_4.uv3_;
    }
    if (metadata_2.x >= 4f) {
        source_1 = in_4.uv4_;
    }
    if (metadata_2.x >= 5f) {
        source_1 = in_4.uv5_;
    }
    if (metadata_2.x >= 6f) {
        source_1 = in_4.uv6_;
    }
    if (metadata_2.x >= 7f) {
        source_1 = in_4.uv7_;
    }
    let _e33 = source_1;
    let scaled_1 = (_e33 * transform_2.zw);
    let angle_1 = metadata_2.y;
    let c_1 = cos(angle_1);
    let s_1 = sin(angle_1);
    return (vec2<f32>(((scaled_1.x * c_1) - (scaled_1.y * s_1)), ((scaled_1.x * s_1) + (scaled_1.y * c_1))) + transform_2.xy);
}

fn materialVertexColor(in_5: VsOut) -> vec4<f32> {
    return in_5.color;
}

fn temporalVertexAlpha(in_6: TemporalVsOut) -> f32 {
    return in_6.color.w;
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    var out: VsOut;

    let _e5 = palette[in.skinIndex.x];
    let _e13 = palette[in.skinIndex.y];
    let _e22 = palette[in.skinIndex.z];
    let _e31 = palette[in.skinIndex.w];
    let skinMatrix = ((((_e5 * in.skinWeight.x) + (_e13 * in.skinWeight.y)) + (_e22 * in.skinWeight.z)) + (_e31 * in.skinWeight.w));
    let skinnedLocal = (skinMatrix * vec4<f32>(in.pos, 1f));
    let m0_ = skinMatrix[0].xyz;
    let m1_ = skinMatrix[1].xyz;
    let m2_ = skinMatrix[2].xyz;
    let skinNormal3x3_ = mat3x3<f32>(m0_, m1_, m2_);
    let phony = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let phony_1 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].localFromInstance;
    let _e59 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e59 * skinnedLocal);
    out.worldPos = skinnedLocal.xyz;
    out.worldNormal = normalize((skinNormal3x3_ * in.normal));
    let worldTangentXyz = normalize((skinNormal3x3_ * in.tangent.xyz));
    out.worldTangent = vec4<f32>(worldTangentXyz, in.tangent.w);
    out.uv = in.uv;
    out.uv1_ = in.uv1_;
    out.uv2_ = in.uv2_;
    out.uv3_ = in.uv3_;
    out.uv4_ = in.uv4_;
    out.uv5_ = in.uv5_;
    out.uv6_ = in.uv6_;
    out.uv7_ = in.uv7_;
    out.color = in.color;
    out.instanceIdx = idx;
    let _e98 = out.clip.w;
    out.viewZ = -(_e98);
    let _e100 = out;
    return _e100;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    var local: bool;
    var a: f32;
    var ambient: vec3<f32>;
    var color: vec3<f32>;
    var i: u32 = 0u;
    var i_1: u32 = 0u;

    let _e3 = material.baseColorTextureCoordinatesTransform;
    let _e6 = material.baseColorTextureCoordinatesMetadata;
    let _e8 = transformedMaterialUv(_e3, _e6, in_1);
    let _e11 = material.baseColorTextureCoordinatesMetadata;
    let _e15 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture_1, baseColorSampler_1, _e8, _e11.zw);
    let _e16 = materialVertexColor(in_1);
    let _e20 = material.baseColor.w;
    let alpha_1 = ((_e20 * _e15.w) * _e16.w);
    let _e27 = material.alphaCutoff;
    if (_e27 > 0f) {
        let _e32 = material.alphaCutoff;
        local = (alpha_1 <= _e32);
    } else {
        local = false;
    }
    let _e37 = local;
    if _e37 {
        discard;
    }
    let _e40 = material.baseColor;
    let albedo = ((_e40.xyz * _e15.xyz) * _e16.xyz);
    let _e48 = material.metallicRoughnessTextureCoordinatesTransform;
    let _e51 = material.metallicRoughnessTextureCoordinatesMetadata;
    let _e52 = transformedMaterialUv(_e48, _e51, in_1);
    let _e55 = material.metallicRoughnessTextureCoordinatesMetadata;
    let _e59 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(metallicRoughnessTexture, metallicRoughnessSampler, _e52, _e55.zw);
    let _e62 = material.metallic;
    let _e65 = material.metallicChannel;
    let _e67 = pick_channel(_e59, u32(_e65));
    let metallic_4 = (_e62 * _e67);
    let _e71 = material.roughnessChannel;
    let _e73 = pick_channel(_e59, u32(_e71));
    let _e76 = material.roughness;
    a = max(_e76, 0.04f);
    let _e80 = a;
    a = (_e80 * _e73);
    let _e82 = a;
    let _e83 = a;
    a = (_e82 * _e83);
    let _e87 = material.normalTextureCoordinatesTransform;
    let _e90 = material.normalTextureCoordinatesMetadata;
    let _e91 = transformedMaterialUv(_e87, _e90, in_1);
    let _e94 = material.normalTextureCoordinatesMetadata;
    let _e98 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(normalTexture, normalSampler, _e91, _e94.zw);
    let normSampleRg = _e98.xy;
    let _e100 = decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(normSampleRg);
    let _e103 = material.normalScale;
    let _e104 = scaleTangentSpaceNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(_e100, _e103);
    let _e107 = applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(in_1.worldNormal, in_1.worldTangent, _e104);
    let _e110 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let v = normalize((_e110 - in_1.worldPos));
    let _e116 = material.specularTint;
    let _e119 = material.specularTintTextureCoordinatesTransform;
    let _e122 = material.specularTintTextureCoordinatesMetadata;
    let _e123 = transformedMaterialUv(_e119, _e122, in_1);
    let _e126 = material.specularTintTextureCoordinatesMetadata;
    let _e130 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(specularTintTexture, specularTintSampler, _e123, _e126.zw);
    let specularTint = (_e116 * _e130.xyz);
    let f0_1 = mix((vec3(0.04f) * specularTint), albedo, metallic_4);
    let _e139 = material.clearcoatRoughness;
    let coatRoughness = max(_e139, 0.04f);
    let coatAlpha = (coatRoughness * coatRoughness);
    let _e148 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(max(dot(_e107, v), 0f), vec3(0.04f));
    let _e151 = material.clearcoat;
    let coatF = (_e148 * _e151);
    let _e158 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(max(dot(_e107, v), 0f), f0_1);
    let kD = ((vec3(1f) - _e158) * (1f - metallic_4));
    let _e165 = material.roughness;
    let iblRoughness = (max(_e165, 0.04f) * _e73);
    let _e171 = skylight.rotation;
    let _e174 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e107, _e171, irradianceMap_1, irradianceSampler_1);
    let _e177 = skylight.rotation;
    let _e182 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e107, v, iblRoughness, f0_1, _e177, prefilterMap_1, prefilterSampler_1, brdfLut_1, brdfLutSampler_1);
    let _e185 = skylight.colorR;
    let _e188 = skylight.colorG;
    let _e191 = skylight.colorB;
    let skyColor = vec3<f32>(_e185, _e188, _e191);
    ambient = ((((kD * _e174) * albedo) + _e182) * (vec3(1f) - coatF));
    let _e203 = material.clearcoat;
    if (_e203 != 0f) {
        let _e210 = skylight.rotation;
        let _e215 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e107, v, coatRoughness, vec3(0.04f), _e210, prefilterMap_1, prefilterSampler_1, brdfLut_1, brdfLutSampler_1);
        let _e216 = ambient;
        let _e219 = material.clearcoat;
        ambient = (_e216 + (_e215 * _e219));
    }
    let _e222 = ambient;
    let _e226 = skylight.intensity;
    ambient = ((_e222 * skyColor) * _e226);
    let _e228 = ambient;
    color = _e228;
    let _e232 = evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e107, in_1.worldPos, in_1.viewZ);
    let _e233 = a;
    let _e234 = evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e107, v, albedo, metallic_4, _e233, f0_1);
    let _e235 = color;
    color = (_e235 + (_e232 * _e234));
    let _e240 = material.clearcoat;
    if (_e240 != 0f) {
        let _e248 = evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e107, v, vec3(0f), 1f, coatAlpha, vec3(0.04f));
        let _e249 = color;
        let _e252 = material.clearcoat;
        color = (_e249 + ((_e232 * _e252) * _e248));
    }
    let pointCount = pointLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.count;
    loop {
        let _e260 = i;
        if (_e260 < pointCount) {
        } else {
            break;
        }
        {
            let _e264 = i;
            let p = pointLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.slots[_e264];
            let _e267 = color;
            let _e272 = a;
            let _e273 = evalPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(p.position, p.colorTimesIntensity, p.invRangeSquared, in_1.worldPos, _e107, v, albedo, metallic_4, _e272, f0_1);
            color = (_e267 + _e273);
            let _e277 = material.clearcoat;
            if (_e277 != 0f) {
                let _e280 = color;
                let _e283 = material.clearcoat;
                let _e293 = evalPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(p.position, p.colorTimesIntensity, p.invRangeSquared, in_1.worldPos, _e107, v, vec3(0f), 1f, coatAlpha, vec3(0.04f));
                color = (_e280 + (_e283 * _e293));
            }
        }
        continuing {
            let _e296 = i;
            i = (_e296 + 1u);
        }
    }
    let spotCount = spotLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.count;
    loop {
        let _e303 = i_1;
        if (_e303 < spotCount) {
        } else {
            break;
        }
        {
            let _e307 = i_1;
            let s_2 = spotLightsBufferX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.slots[_e307];
            let _e310 = color;
            let _e318 = a;
            let _e319 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(s_2.position, s_2.direction, s_2.colorTimesIntensity, s_2.cosInner, s_2.cosOuter, s_2.invRangeSquared, in_1.worldPos, _e107, v, albedo, metallic_4, _e318, f0_1);
            color = (_e310 + _e319);
            let _e323 = material.clearcoat;
            if (_e323 != 0f) {
                let _e326 = color;
                let _e329 = material.clearcoat;
                let _e342 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(s_2.position, s_2.direction, s_2.colorTimesIntensity, s_2.cosInner, s_2.cosOuter, s_2.invRangeSquared, in_1.worldPos, _e107, v, vec3(0f), 1f, coatAlpha, vec3(0.04f));
                color = (_e326 + (_e329 * _e342));
            }
        }
        continuing {
            let _e345 = i_1;
            i_1 = (_e345 + 1u);
        }
    }
    let _e349 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
    let _e350 = color;
    let _e352 = applySceneFog(_e349, _e350, alpha_1, in_1.worldPos);
    return _e352;
}

@vertex 
fn vs_temporal(in_2: VsIn, @builtin(instance_index) idx_1: u32) -> TemporalVsOut {
    var out_1: TemporalVsOut;

    let _e5 = palette[in_2.skinIndex.x];
    let _e13 = palette[in_2.skinIndex.y];
    let _e22 = palette[in_2.skinIndex.z];
    let _e31 = palette[in_2.skinIndex.w];
    let currentSkin = ((((_e5 * in_2.skinWeight.x) + (_e13 * in_2.skinWeight.y)) + (_e22 * in_2.skinWeight.z)) + (_e31 * in_2.skinWeight.w));
    let _e40 = previousPalette[in_2.skinIndex.x];
    let _e48 = previousPalette[in_2.skinIndex.y];
    let _e57 = previousPalette[in_2.skinIndex.z];
    let _e66 = previousPalette[in_2.skinIndex.w];
    let previousSkin = ((((_e40 * in_2.skinWeight.x) + (_e48 * in_2.skinWeight.y)) + (_e57 * in_2.skinWeight.z)) + (_e66 * in_2.skinWeight.w));
    let currentWorld = (currentSkin * vec4<f32>(in_2.pos, 1f));
    let previousWorld = (previousSkin * vec4<f32>(in_2.pos, 1f));
    let _e83 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalCurrentViewProj;
    out_1.currentClip = (_e83 * currentWorld);
    let _e87 = out_1.currentClip;
    out_1.clip = _e87;
    let _e91 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalPreviousViewProj;
    out_1.previousClip = (_e91 * previousWorld);
    out_1.uv = in_2.uv;
    out_1.uv1_ = in_2.uv1_;
    out_1.uv2_ = in_2.uv2_;
    out_1.uv3_ = in_2.uv3_;
    out_1.uv4_ = in_2.uv4_;
    out_1.uv5_ = in_2.uv5_;
    out_1.uv6_ = in_2.uv6_;
    out_1.uv7_ = in_2.uv7_;
    out_1.color = in_2.color;
    let _e111 = out_1;
    return _e111;
}

@fragment 
fn fs_temporal(in_3: TemporalVsOut) -> @location(0) vec4<f32> {
    let reactive_3 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].temporal.x;
    let _e8 = material.baseColor.w;
    let _e10 = temporalVertexAlpha(in_3);
    let _e14 = material.alphaCutoff;
    let _e17 = material.baseColorTextureCoordinatesTransform;
    let _e20 = material.baseColorTextureCoordinatesMetadata;
    let _e25 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e36 = projectPbrSceneTemporalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX((_e8 * _e10), _e14, baseColorTexture_1, baseColorSampler_1, _e17, _e20, in_3.currentClip, in_3.previousClip, _e25, reactive_3, in_3.uv, in_3.uv1_, in_3.uv2_, in_3.uv3_, in_3.uv4_, in_3.uv5_, in_3.uv6_, in_3.uv7_);
    return _e36;
}
