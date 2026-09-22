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

struct GBufferOutputX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX {
    @location(0) normal_roughness: vec4<f32>,
    @location(3) @interpolate(flat) albedo_metallic: u32,
    @location(1) f0_occlusion: vec4<f32>,
    @location(2) emissive_opacity: vec4<f32>,
    @location(4) @interpolate(flat) lighting_context: u32,
}

struct MaterialParameters {
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
    specular: f32,
    specularColor: vec3<f32>,
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
    emissiveTextureCoordinatesTransform: vec4<f32>,
    emissiveTextureCoordinatesMetadata: vec4<f32>,
    occlusionTextureCoordinatesTransform: vec4<f32>,
    occlusionTextureCoordinatesMetadata: vec4<f32>,
    transmissionTextureCoordinatesTransform: vec4<f32>,
    transmissionTextureCoordinatesMetadata: vec4<f32>,
    thicknessTextureCoordinatesTransform: vec4<f32>,
    thicknessTextureCoordinatesMetadata: vec4<f32>,
    anisotropyStrength: f32,
    anisotropyRotation: f32,
    iridescence: f32,
    iridescenceIor: f32,
    iridescenceThicknessMinimum: f32,
    iridescenceThicknessMaximum: f32,
    sheenColor: vec3<f32>,
    sheenRoughness: f32,
    clearcoat: f32,
    clearcoatRoughness: f32,
    clearcoatNormalScale: f32,
    _gpuDrivenPadding: array<vec4<f32>, 6>,
}

struct SurfaceInput {
    positionOS: vec3<f32>,
    positionWS: vec3<f32>,
    geometricNormalWS: vec3<f32>,
    tangentWS: vec4<f32>,
    viewDirectionWS: vec3<f32>,
    uv0_: vec2<f32>,
    uv1_: vec2<f32>,
    uv2_: vec2<f32>,
    uv3_: vec2<f32>,
    uv4_: vec2<f32>,
    uv5_: vec2<f32>,
    uv6_: vec2<f32>,
    uv7_: vec2<f32>,
    vertexColor: vec4<f32>,
    frontFacing: bool,
}

struct SurfaceData {
    baseColor: vec3<f32>,
    normalWS: vec3<f32>,
    metallic: f32,
    roughness: f32,
    emissive: vec3<f32>,
    occlusion: f32,
    opacity: f32,
    alphaClipThreshold: f32,
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
}

struct VsOut {
    @builtin(position) @invariant clip: vec4<f32>,
    @location(4) @interpolate(flat) transmissionBasis0_: vec4<f32>,
    @location(0) worldPos: vec3<f32>,
    @location(1) worldNormal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) worldTangent: vec4<f32>,
    @location(5) uv1_: vec2<f32>,
    @location(8) uv2_: vec2<f32>,
    @location(9) uv3_: vec2<f32>,
    @location(10) uv4_: vec2<f32>,
    @location(11) uv5_: vec2<f32>,
    @location(12) uv6And7_: vec4<f32>,
    @location(6) ndc: vec4<f32>,
    @location(7) viewZ: f32,
    @location(13) @interpolate(flat) transmissionBasis1_: vec4<f32>,
    @location(15) @interpolate(flat) materialAddress: vec3<u32>,
}

struct StandardPbrOutput {
    @location(0) color: vec4<f32>,
}

struct TemporalVsOut {
    @builtin(position) @invariant clip: vec4<f32>,
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
}

const PROBE_INV_PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX: f32 = 0.31830987f;
const THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX: u32 = 16u;
const THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX: array<vec2<f32>, 256> = array<vec2<f32>, 256>(vec2<f32>(0.14709473f, 0.8520508f), vec2<f32>(0.16552734f, 0.78759766f), vec2<f32>(0.24438477f, 0.6386719f), vec2<f32>(0.3708496f, 0.51953125f), vec2<f32>(0.49682617f, 0.41552734f), vec2<f32>(0.6020508f, 0.32641602f), vec2<f32>(0.68408203f, 0.25390625f), vec2<f32>(0.74609375f, 0.19750977f), vec2<f32>(0.79052734f, 0.15429688f), vec2<f32>(0.8222656f, 0.12164307f), vec2<f32>(0.8432617f, 0.09698486f), vec2<f32>(0.8564453f, 0.078430176f), vec2<f32>(0.86328125f, 0.06439209f), vec2<f32>(0.86572266f, 0.053710938f), vec2<f32>(0.8642578f, 0.045440674f), vec2<f32>(0.8598633f, 0.039031982f), vec2<f32>(0.38867188f, 0.6113281f), vec2<f32>(0.3930664f, 0.60058594f), vec2<f32>(0.41235352f, 0.54589844f), vec2<f32>(0.45654297f, 0.4482422f), vec2<f32>(0.52783203f, 0.35253906f), vec2<f32>(0.6074219f, 0.27392578f), vec2<f32>(0.67871094f, 0.21142578f), vec2<f32>(0.73339844f, 0.16259766f), vec2<f32>(0.7709961f, 0.12536621f), vec2<f32>(0.79345703f, 0.09729004f), vec2<f32>(0.80322266f, 0.07623291f), vec2<f32>(0.80371094f, 0.06036377f), vec2<f32>(0.7963867f, 0.048431396f), vec2<f32>(0.78564453f, 0.039367676f), vec2<f32>(0.77197266f, 0.032409668f), vec2<f32>(0.7548828f, 0.026977539f), vec2<f32>(0.5722656f, 0.42749023f), vec2<f32>(0.57373047f, 0.42407227f), vec2<f32>(0.57958984f, 0.40356445f), vec2<f32>(0.5917969f, 0.3544922f), vec2<f32>(0.61621094f, 0.28808594f), vec2<f32>(0.65527344f, 0.22485352f), vec2<f32>(0.69873047f, 0.17260742f), vec2<f32>(0.73535156f, 0.13183594f), vec2<f32>(0.75927734f, 0.10089111f), vec2<f32>(0.77001953f, 0.07745361f), vec2<f32>(0.77197266f, 0.059936523f), vec2<f32>(0.7661133f, 0.046844482f), vec2<f32>(0.7519531f, 0.036987305f), vec2<f32>(0.7324219f, 0.029541016f), vec2<f32>(0.70947266f, 0.023834229f), vec2<f32>(0.68359375f, 0.019439697f), vec2<f32>(0.7089844f, 0.29101563f), vec2<f32>(0.7089844f, 0.28979492f), vec2<f32>(0.70996094f, 0.28125f), vec2<f32>(0.70996094f, 0.25854492f), vec2<f32>(0.7114258f, 0.22045898f), vec2<f32>(0.71972656f, 0.17687988f), vec2<f32>(0.734375f, 0.13708496f), vec2<f32>(0.7480469f, 0.10479736f), vec2<f32>(0.7558594f, 0.07989502f), vec2<f32>(0.7597656f, 0.06100464f), vec2<f32>(0.75341797f, 0.046844482f), vec2<f32>(0.73876953f, 0.036224365f), vec2<f32>(0.71777344f, 0.028259277f), vec2<f32>(0.69189453f, 0.022262573f), vec2<f32>(0.6611328f, 0.017700195f), vec2<f32>(0.62841797f, 0.014198303f), vec2<f32>(0.80810547f, 0.19177246f), vec2<f32>(0.8076172f, 0.19128418f), vec2<f32>(0.80615234f, 0.18798828f), vec2<f32>(0.8017578f, 0.17810059f), vec2<f32>(0.79296875f, 0.1586914f), vec2<f32>(0.7836914f, 0.13220215f), vec2<f32>(0.7753906f, 0.1048584f), vec2<f32>(0.7685547f, 0.08111572f), vec2<f32>(0.76464844f, 0.0619812f), vec2<f32>(0.7553711f, 0.04727173f), vec2<f32>(0.7402344f, 0.03616333f), vec2<f32>(0.71875f, 0.027755737f), vec2<f32>(0.69091797f, 0.021484375f), vec2<f32>(0.6582031f, 0.016738892f), vec2<f32>(0.6220703f, 0.013160706f), vec2<f32>(0.5839844f, 0.010414124f), vec2<f32>(0.87841797f, 0.1217041f), vec2<f32>(0.8779297f, 0.1217041f), vec2<f32>(0.875f, 0.12060547f), vec2<f32>(0.8691406f, 0.11694336f), vec2<f32>(0.8569336f, 0.10803223f), vec2<f32>(0.8378906f, 0.09375f), vec2<f32>(0.8149414f, 0.0769043f), vec2<f32>(0.79589844f, 0.060699463f), vec2<f32>(0.7763672f, 0.046875f), vec2<f32>(0.75634766f, 0.03591919f), vec2<f32>(0.7324219f, 0.027450562f), vec2<f32>(0.703125f, 0.021026611f), vec2<f32>(0.6689453f, 0.016174316f), vec2<f32>(0.6303711f, 0.012512207f), vec2<f32>(0.58935547f, 0.009742737f), vec2<f32>(0.5463867f, 0.007633209f), vec2<f32>(0.92626953f, 0.073791504f), vec2<f32>(0.92578125f, 0.073913574f), vec2<f32>(0.92285156f, 0.073913574f), vec2<f32>(0.9169922f, 0.07312012f), vec2<f32>(0.9038086f, 0.06982422f), vec2<f32>(0.88134766f, 0.06311035f), vec2<f32>(0.8510742f, 0.05380249f), vec2<f32>(0.82128906f, 0.043701172f), vec2<f32>(0.7910156f, 0.03439331f), vec2<f32>(0.76123047f, 0.026611328f), vec2<f32>(0.72802734f, 0.020446777f), vec2<f32>(0.69189453f, 0.015655518f), vec2<f32>(0.6508789f, 0.012008667f), vec2<f32>(0.6074219f, 0.009254456f), vec2<f32>(0.56103516f, 0.007156372f), vec2<f32>(0.51416016f, 0.0055656433f), vec2<f32>(0.95751953f, 0.04232788f), vec2<f32>(0.95703125f, 0.04244995f), vec2<f32>(0.95458984f, 0.042816162f), vec2<f32>(0.94921875f, 0.043182373f), vec2<f32>(0.9370117f, 0.042663574f), vec2<f32>(0.91308594f, 0.040252686f), vec2<f32>(0.88183594f, 0.03579712f), vec2<f32>(0.84472656f, 0.030136108f), vec2<f32>(0.80615234f, 0.024337769f), vec2<f32>(0.76708984f, 0.01914978f), vec2<f32>(0.7265625f, 0.014854431f), vec2<f32>(0.6826172f, 0.011421204f), vec2<f32>(0.63623047f, 0.008773804f), vec2<f32>(0.58691406f, 0.00674057f), vec2<f32>(0.5366211f, 0.0051994324f), vec2<f32>(0.48608398f, 0.004020691f), vec2<f32>(0.97753906f, 0.022628784f), vec2<f32>(0.9770508f, 0.022750854f), vec2<f32>(0.97509766f, 0.02319336f), vec2<f32>(0.96972656f, 0.023910522f), vec2<f32>(0.95947266f, 0.024490356f), vec2<f32>(0.93603516f, 0.024124146f), vec2<f32>(0.90527344f, 0.022521973f), vec2<f32>(0.8652344f, 0.019760132f), vec2<f32>(0.82177734f, 0.01651001f), vec2<f32>(0.77441406f, 0.013290405f), vec2<f32>(0.7265625f, 0.0104599f), vec2<f32>(0.67626953f, 0.008132935f), vec2<f32>(0.62402344f, 0.0062789917f), vec2<f32>(0.5698242f, 0.004825592f), vec2<f32>(0.5151367f, 0.0037136078f), vec2<f32>(0.46142578f, 0.0028629303f), vec2<f32>(0.98876953f, 0.011070251f), vec2<f32>(0.98876953f, 0.011161804f), vec2<f32>(0.9868164f, 0.011512756f), vec2<f32>(0.98291016f, 0.012214661f), vec2<f32>(0.97314453f, 0.012992859f), vec2<f32>(0.953125f, 0.013519287f), vec2<f32>(0.92285156f, 0.013282776f), vec2<f32>(0.8823242f, 0.012260437f), vec2<f32>(0.83496094f, 0.010658264f), vec2<f32>(0.7832031f, 0.008850098f), vec2<f32>(0.7285156f, 0.0071144104f), vec2<f32>(0.671875f, 0.005607605f), vec2<f32>(0.61376953f, 0.004360199f), vec2<f32>(0.5546875f, 0.0033721924f), vec2<f32>(0.4963379f, 0.0025997162f), vec2<f32>(0.43945313f, 0.0020046234f), vec2<f32>(0.9951172f, 0.004798889f), vec2<f32>(0.9951172f, 0.004863739f), vec2<f32>(0.99365234f, 0.0050964355f), vec2<f32>(0.9902344f, 0.0056037903f), vec2<f32>(0.9814453f, 0.0063323975f), vec2<f32>(0.96435547f, 0.0069770813f), vec2<f32>(0.93603516f, 0.007297516f), vec2<f32>(0.8964844f, 0.0071258545f), vec2<f32>(0.8466797f, 0.0064926147f), vec2<f32>(0.7915039f, 0.005596161f), vec2<f32>(0.7314453f, 0.004627228f), vec2<f32>(0.6689453f, 0.0037174225f), vec2<f32>(0.60546875f, 0.0029296875f), vec2<f32>(0.5415039f, 0.002281189f), vec2<f32>(0.47924805f, 0.0017662048f), vec2<f32>(0.41967773f, 0.0013656616f), vec2<f32>(0.9980469f, 0.0017604828f), vec2<f32>(0.9980469f, 0.0017938614f), vec2<f32>(0.99658203f, 0.0019292831f), vec2<f32>(0.9941406f, 0.0022392273f), vec2<f32>(0.9863281f, 0.002729416f), vec2<f32>(0.9716797f, 0.003250122f), vec2<f32>(0.9458008f, 0.0036697388f), vec2<f32>(0.90771484f, 0.003818512f), vec2<f32>(0.85839844f, 0.0036811829f), vec2<f32>(0.7993164f, 0.003320694f), vec2<f32>(0.73535156f, 0.0028438568f), vec2<f32>(0.66748047f, 0.0023441315f), vec2<f32>(0.5986328f, 0.0018796921f), vec2<f32>(0.53027344f, 0.0014829636f), vec2<f32>(0.46411133f, 0.0011587143f), vec2<f32>(0.4020996f, 0.0008993149f), vec2<f32>(0.9995117f, 0.00050115585f), vec2<f32>(0.9995117f, 0.00051546097f), vec2<f32>(0.9980469f, 0.0005836487f), vec2<f32>(0.99658203f, 0.0007505417f), vec2<f32>(0.9892578f, 0.0010147095f), vec2<f32>(0.9760742f, 0.0013465881f), vec2<f32>(0.9526367f, 0.0016527176f), vec2<f32>(0.9160156f, 0.0018558502f), vec2<f32>(0.8671875f, 0.0019054413f), vec2<f32>(0.8076172f, 0.0018167496f), vec2<f32>(0.7392578f, 0.0016212463f), vec2<f32>(0.6669922f, 0.0013799667f), vec2<f32>(0.5932617f, 0.0011358261f), vec2<f32>(0.52001953f, 0.0009121895f), vec2<f32>(0.45043945f, 0.00072193146f), vec2<f32>(0.38598633f, 0.00056505203f), vec2<f32>(1f, 0.00009316206f), vec2<f32>(1f, 0.00009787083f), vec2<f32>(0.99902344f, 0.00012540817f), vec2<f32>(0.9970703f, 0.00019216537f), vec2<f32>(0.99072266f, 0.000310421f), vec2<f32>(0.9790039f, 0.00046992302f), vec2<f32>(0.95751953f, 0.000647068f), vec2<f32>(0.92333984f, 0.0007915497f), vec2<f32>(0.8754883f, 0.00087690353f), vec2<f32>(0.8149414f, 0.0008869171f), vec2<f32>(0.7441406f, 0.0008325577f), vec2<f32>(0.66748047f, 0.00073862076f), vec2<f32>(0.5883789f, 0.000626564f), vec2<f32>(0.51123047f, 0.0005168915f), vec2<f32>(0.43823242f, 0.00041651726f), vec2<f32>(0.37109375f, 0.0003311634f), vec2<f32>(1f, 0.0000072717667f), vec2<f32>(1f, 0.000008165836f), vec2<f32>(0.99902344f, 0.000016987324f), vec2<f32>(0.9975586f, 0.000037908554f), vec2<f32>(0.9921875f, 0.00007593632f), vec2<f32>(0.9814453f, 0.00013744831f), vec2<f32>(0.9614258f, 0.00020754337f), vec2<f32>(0.9291992f, 0.00028014183f), vec2<f32>(0.8828125f, 0.00033450127f), vec2<f32>(0.82177734f, 0.00036263466f), vec2<f32>(0.74902344f, 0.00036215782f), vec2<f32>(0.66845703f, 0.00033807755f), vec2<f32>(0.5854492f, 0.00029969215f), vec2<f32>(0.50390625f, 0.00025582314f), vec2<f32>(0.42700195f, 0.0002117157f), vec2<f32>(0.35766602f, 0.000172019f), vec2<f32>(1f, 0f), vec2<f32>(1f, 0.000000059604645f), vec2<f32>(0.9995117f, 0.0000012516975f), vec2<f32>(0.9975586f, 0.0000053048134f), vec2<f32>(0.99316406f, 0.000015079975f), vec2<f32>(0.98291016f, 0.000028550625f), vec2<f32>(0.96435547f, 0.000047445297f), vec2<f32>(0.93408203f, 0.00006842613f), vec2<f32>(0.88916016f, 0.00008893013f), vec2<f32>(0.828125f, 0.000104248524f), vec2<f32>(0.75390625f, 0.00011217594f), vec2<f32>(0.67041016f, 0.00011241436f), vec2<f32>(0.5830078f, 0.00010627508f), vec2<f32>(0.4970703f, 0.00009584427f), vec2<f32>(0.4169922f, 0.00008332729f), vec2<f32>(0.34521484f, 0.000070512295f));
const PCSS_MEDIUM_RAW_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX: u32 = 8u;
const PCSS_DISK_OFFSETSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX: array<vec2<f32>, 32> = array<vec2<f32>, 32>(vec2<f32>(-0.326f, -0.945f), vec2<f32>(0.236f, -0.873f), vec2<f32>(0.891f, -0.404f), vec2<f32>(-0.761f, -0.581f), vec2<f32>(0.612f, 0.146f), vec2<f32>(-0.148f, 0.514f), vec2<f32>(-0.527f, -0.109f), vec2<f32>(0.074f, 0.911f), vec2<f32>(-0.944f, 0.238f), vec2<f32>(0.444f, -0.736f), vec2<f32>(0.707f, 0.641f), vec2<f32>(-0.184f, -0.342f), vec2<f32>(0.318f, 0.382f), vec2<f32>(-0.638f, 0.526f), vec2<f32>(0.955f, -0.083f), vec2<f32>(-0.401f, 0.816f), vec2<f32>(-0.083f, -0.632f), vec2<f32>(0.539f, -0.262f), vec2<f32>(-0.735f, -0.168f), vec2<f32>(0.162f, 0.719f), vec2<f32>(-0.841f, 0.003f), vec2<f32>(0.791f, 0.332f), vec2<f32>(-0.291f, -0.791f), vec2<f32>(0.021f, -0.224f), vec2<f32>(0.386f, 0.799f), vec2<f32>(-0.558f, 0.134f), vec2<f32>(0.638f, -0.555f), vec2<f32>(-0.189f, 0.957f), vec2<f32>(-0.977f, -0.117f), vec2<f32>(0.271f, 0.589f), vec2<f32>(0.819f, -0.719f), vec2<f32>(-0.472f, -0.409f));
const PCSS_HIGH_RAW_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX: u32 = 16u;
const PCSS_MEDIUM_COMPARE_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX: u32 = 16u;
const PCSS_HIGH_COMPARE_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX: u32 = 32u;

@id(64000) override standardTextureMask: u32 = 4294967295u;

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(3) 
var shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_depth_2d;
@group(0) @binding(4) 
var shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: sampler_comparison;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(3) @binding(0) 
var<storage> instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(1) @binding(0) 
var<uniform> _uniformMaterial: MaterialParameters;
var<private> material: MaterialParameters;
@group(1) @binding(1) 
var baseColorTexture_sampler: sampler;
@group(1) @binding(2) 
var baseColorTexture_1: texture_2d<f32>;
@group(1) @binding(3) 
var metallicRoughnessTexture_sampler: sampler;
@group(1) @binding(4) 
var metallicRoughnessTexture: texture_2d<f32>;
@group(1) @binding(5) 
var normalTexture_sampler: sampler;
@group(1) @binding(6) 
var normalTexture: texture_2d<f32>;
@group(1) @binding(7) 
var emissiveTexture_sampler: sampler;
@group(1) @binding(8) 
var emissiveTexture: texture_2d<f32>;
@group(1) @binding(9) 
var occlusionTexture_sampler: sampler;
@group(1) @binding(10) 
var occlusionTexture: texture_2d<f32>;
@group(1) @binding(11) 
var transmissionSampler: sampler;
@group(1) @binding(12) 
var transmissionTexture: texture_2d<f32>;
@group(1) @binding(13) 
var thicknessSampler: sampler;
@group(1) @binding(14) 
var thicknessTexture: texture_2d<f32>;
@group(1) @binding(21) 
var transmissionBackdropSampler: sampler;
@group(1) @binding(22) 
var transmissionBackdropTexture: texture_2d<f32>;
@group(1) @binding(15) 
var irradianceMap_2: texture_cube<f32>;
@group(1) @binding(16) 
var irradianceSampler_2: sampler;
@group(1) @binding(17) 
var prefilterMap_2: texture_cube<f32>;
@group(1) @binding(18) 
var prefilterSampler_2: sampler;
@group(1) @binding(19) 
var brdfLut_4: texture_2d<f32>;
@group(1) @binding(20) 
var<uniform> skylight: SkylightUniformsX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX;
@group(1) @binding(47) 
var skylightPrefilterMap_1: texture_cube<f32>;
@group(1) @binding(46) 
var<storage> sceneMaterials: array<MaterialParameters>;
@group(3) @binding(2) 
var<storage> visibleItems: array<vec4<u32>>;
@group(2) @binding(1) 
var<storage> palette: array<mat4x4<f32>>;
@group(2) @binding(2) 
var<storage> previousPalette: array<mat4x4<f32>>;

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
    let reflection_1 = reflect(-(view_2), normal_3);
    projected = reflection_1;
    if boxProjection {
        let _e46 = box_projectX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(worldPosition_1, reflection_1, boxCenter_1, boxExtents_1);
        projected = _e46;
    }
    let _e47 = projected;
    let _e49 = inverseRotateEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(_e47, rotation_3);
    let mip_1 = (roughness_3 * 4f);
    let _e53 = textureSampleLevel(probeMap, probeSampler, _e49, mip_1);
    let prefilteredColor_1 = _e53.xyz;
    let _e55 = projectSpecularRadianceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(prefilteredColor_1, normal_3, view_2, roughness_3, F0_3, brdfLut_2, brdfLutSampler_2);
    let local_24 = (_e55 * probeIntensity);
    let _e58 = sky;
    return mix(_e58, local_24, weight);
}

fn probe_sh9X_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX(shPreblend: array<vec4<f32>, 9>, normal_4: vec3<f32>) -> vec3<f32> {
    var result: vec3<f32> = vec3(0f);
    var band: u32 = 0u;

    let x_2 = normal_4.x;
    let y_2 = normal_4.y;
    let z = normal_4.z;
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

fn evaluateProbeDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX(shPreblend_1: array<vec4<f32>, 9>, localBlendFraction: f32, normal_5: vec3<f32>, e_sky: vec3<f32>, k_d: vec3<f32>, albedo: vec3<f32>, metallic: f32) -> vec3<f32> {
    let _e2 = probe_sh9X_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX(shPreblend_1, normal_5);
    let local_25 = (max(_e2, vec3(0f)) * PROBE_INV_PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX);
    let skyResidualFraction = (1f - localBlendFraction);
    return ((((local_25 + (skyResidualFraction * e_sky)) * k_d) * albedo) * (1f - metallic));
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

fn f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH: f32, f0_1: vec3<f32>) -> vec3<f32> {
    let fresnel = exp2((((-5.55473f * vDotH) - 6.98316f) * vDotH));
    return ((f0_1 * (vec3(1f) - vec3(fresnel))) + vec3(fresnel));
}

fn sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_4: f32, dotNV: f32) -> vec2<f32> {
    let uv_3 = clamp(vec2<f32>(roughness_4, dotNV), vec2(0f), vec2(1f));
    let samplePosition = ((uv_3 * 16f) - vec2(0.5f));
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
    let nDotL_2 = max(dot(normal_6, l_3), 0f);
    let nDotV_2 = max(dot(normal_6, viewDir), 0.00001f);
    let nDotH_1 = max(dot(normal_6, h), 0f);
    let vDotH_1 = max(dot(viewDir, h), 0f);
    let _e26 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH_1, F0_5);
    let roughness_8 = sqrt(max(alphaSq, 0f));
    let _e31 = threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_8, nDotV_2, nDotL_2, F0_5);
    let _e32 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_1, alphaSq);
    let _e33 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_2, nDotL_2, alphaSq);
    let specular_1 = (((_e32 * _e33) * _e26) + _e31);
    let diffuse_1 = (((1f - metallic_1) * baseColor) / vec3(3.1415927f));
    let _e48 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightColor;
    return (((diffuse_1 + specular_1) * _e48) * nDotL_2);
}

fn evaluateStandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(worldPosition_3: vec3<f32>, normal_7: vec3<f32>, direction_2: vec3<f32>, albedo_1: vec3<f32>, metallic_2: f32, roughness_6: f32, f0_2: vec3<f32>, sky_1: SkylightUniformsX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX, irradianceMap_1: texture_cube<f32>, irradianceSampler_1: sampler, prefilterMap_1: texture_cube<f32>, prefilterSampler_1: sampler, brdfLut_3: texture_2d<f32>, skylightPrefilterMap: texture_cube<f32>, sh: array<vec4<f32>, 9>, localBlend: f32) -> StandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX {
    var irradiance: vec3<f32>;
    var specular: vec3<f32>;
    var diffuse: vec3<f32>;

    if (sky_1.intensity < 0f) {
        let _e8 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_7, sky_1.diffuseRotation, irradianceMap_1, irradianceSampler_1);
        irradiance = _e8;
        let _e42 = sampleReflectionProbeSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_7, direction_2, roughness_6, f0_2, worldPosition_3, vec3<f32>(sky_1.colorR, sky_1.colorG, sky_1.colorB), sky_1.rotation.xyz, vec4<f32>(0f, 0f, 0f, 1f), prefilterMap_1, prefilterSampler_1, brdfLut_3, irradianceSampler_1, skylightPrefilterMap, sky_1.diffuseRotation, sky_1.diffuseScale.xyz, max((-(sky_1.intensity) - 1f), 0f), (sky_1.rotation.w > 0.5f));
        specular = _e42;
    } else {
        let _e45 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_7, sky_1.rotation, irradianceMap_1, irradianceSampler_1);
        irradiance = _e45;
        let _e47 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_7, direction_2, roughness_6, f0_2, sky_1.rotation, prefilterMap_1, prefilterSampler_1, brdfLut_3, irradianceSampler_1);
        specular = _e47;
    }
    let tint = vec3<f32>(sky_1.colorR, sky_1.colorG, sky_1.colorB);
    let diffuseScale = select((tint * sky_1.intensity), sky_1.diffuseScale.xyz, (sky_1.intensity < 0f));
    let _e63 = fresnelSchlickRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(max(dot(normal_7, direction_2), 0f), f0_2, roughness_6);
    let kD = ((vec3(1f) - _e63) * (1f - metallic_2));
    let _e72 = irradiance;
    diffuse = (((kD * _e72) * albedo_1) * diffuseScale);
    if (localBlend > 0f) {
        let _e80 = irradiance;
        let _e90 = evaluateProbeDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX(sh, localBlend, normal_7, (_e80 * diffuseScale), (kD / max(vec3((1f - metallic_2)), vec3(0.0001f))), albedo_1, metallic_2);
        diffuse = _e90;
    }
    let _e91 = diffuse;
    let _e92 = specular;
    let _e94 = decodeSpecularEnvironmentScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(tint, sky_1.intensity);
    let _e98 = projectSpecularRadianceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(vec3(1f), normal_7, direction_2, roughness_6, f0_2, brdfLut_3, irradianceSampler_1);
    return StandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(_e91, (_e92 * _e94), _e98);
}

fn evaluateStandardDirectX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(worldPosition_4: vec3<f32>, ndc: vec3<f32>, viewZ: f32, normal_8: vec3<f32>, direction_3: vec3<f32>, albedo_2: vec3<f32>, metallic_3: f32, alpha: f32, f0_3: vec3<f32>, shadow: f32) -> vec3<f32> {
    var direct: vec3<f32>;

    let _e6 = evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_8, direction_3, albedo_2, metallic_3, alpha, f0_3);
    let _e11 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowOrigin;
    let _e15 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowRight;
    let _e19 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowUp;
    let _e23 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowProjection;
    let _e25 = cloud_apply_direct_solarX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX((shadow * _e6), worldPosition_4, _e11.xyz, _e15.xyz, _e19.xyz, _e23);
    direct = _e25;
    let _e27 = direct;
    return _e27;
}

fn sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture: texture_2d<f32>, textureSampler: sampler, uv_1: vec2<f32>, uvScale: vec2<f32>) -> vec4<f32> {
    let _e5 = textureSample(texture, textureSampler, (uv_1 * uvScale));
    return _e5;
}

fn sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture_1: texture_2d<f32>, textureSampler_1: sampler, uv_2: vec2<f32>, uvScale_1: vec2<f32>) -> vec4<f32> {
    let _e4 = sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture_1, textureSampler_1, uv_2, uvScale_1);
    return _e4;
}

fn sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip: vec4<f32>, temporalProjection: vec4<f32>) -> f32 {
    let ndcDepth = (clip.z / max(abs(clip.w), 0.000001f));
    let orthographicViewZ = -((temporalProjection.x + (ndcDepth * (temporalProjection.y - temporalProjection.x))));
    return select(-(clip.w), orthographicViewZ, (temporalProjection.z >= 0.5f));
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

fn _directionalReceiverDepthBiasX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_4: u32, normal_9: vec3<f32>, l: vec3<f32>, radius: f32) -> f32 {
    var local_3: bool;

    let nDotL_3 = dot(normal_9, l);
    let depthSpan = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_4].z;
    if (nDotL_3 > 0.01f) {
        local_3 = (depthSpan > 0f);
    } else {
        local_3 = false;
    }
    let _e16 = local_3;
    if !(_e16) {
        let _e20 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
        return _e20;
    }
    let _e21 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_4);
    let right = normalize(vec3<f32>(_e21[0].x, _e21[1].x, _e21[2].x));
    let up = normalize(vec3<f32>(_e21[0].y, _e21[1].y, _e21[2].y));
    let slope = ((abs(dot(normal_9, right)) + abs(dot(normal_9, up))) / nDotL_3);
    let _e49 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_4].y;
    let footprint = ((_e49 * radius) * slope);
    let _e54 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
    let _e57 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.normalBias;
    return (_e54 + (max(0f, (footprint - (_e57 / nDotL_3))) / depthSpan));
}

fn _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(index: u32, angle: f32, radius_1: f32) -> vec2<f32> {
    let point = PCSS_DISK_OFFSETSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX[index];
    let cs = cos(angle);
    let sn = sin(angle);
    return (vec2<f32>(((point.x * cs) - (point.y * sn)), ((point.x * sn) + (point.y * cs))) * radius_1);
}

fn _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize: vec2<u32>, tileOrigin_1: vec2<u32>, tileSize_1: vec2<u32>, baseTexel: vec2<i32>, offset: vec2<f32>) -> vec2<f32> {
    let _e10 = shadow_clamp_texel_to_tileX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX((baseTexel + vec2<i32>(round(offset))), vec2<i32>(tileOrigin_1), vec2<i32>(tileSize_1), 1i);
    return ((vec2<f32>(_e10) + vec2(0.5f)) / vec2<f32>(shadowMapSize));
}

fn _samplePcssForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos: vec3<f32>, layer_5: u32, count_4: u32, normal_10: vec3<f32>, l_1: vec3<f32>, profile: u32) -> f32 {
    var local_4: bool;
    var local_5: bool;
    var local_6: bool;
    var local_7: bool;
    var local_8: bool;
    var local_9: bool;
    var local_10: bool;
    var blockerDepth: f32 = 0f;
    var blockerCount: u32 = 0u;
    var i_1: u32 = 0u;
    var local_11: bool;
    var i_2: u32 = 0u;
    var local_12: bool;
    var local_13: bool;
    var local_14: bool;
    var local_15: bool;
    var litSum: f32 = 0f;
    var i_3: u32 = 0u;
    var i_4: u32 = 0u;

    let _e3 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_5);
    let lightClip = (_e3 * vec4<f32>(worldPos, 1f));
    if !((lightClip.w > 0f)) {
        local_4 = (lightClip.w < 0f);
    } else {
        local_4 = true;
    }
    let _e18 = local_4;
    if !(_e18) {
        return 1f;
    }
    let projCoords = (lightClip.xyz / vec3(lightClip.w));
    let tileUv = vec2<f32>(((projCoords.x * 0.5f) + 0.5f), ((-(projCoords.y) * 0.5f) + 0.5f));
    if (tileUv.x >= 0f) {
        local_5 = (tileUv.x <= 1f);
    } else {
        local_5 = false;
    }
    let _e46 = local_5;
    if _e46 {
        local_6 = (tileUv.y >= 0f);
    } else {
        local_6 = false;
    }
    let _e53 = local_6;
    if _e53 {
        local_7 = (tileUv.y <= 1f);
    } else {
        local_7 = false;
    }
    let _e60 = local_7;
    if _e60 {
        local_8 = (projCoords.z >= 0f);
    } else {
        local_8 = false;
    }
    let _e67 = local_8;
    if _e67 {
        local_9 = (projCoords.z <= 1f);
    } else {
        local_9 = false;
    }
    let _e74 = local_9;
    if !(_e74) {
        return 1f;
    }
    let nDotL_4 = dot(normal_10, l_1);
    if (nDotL_4 >= -1f) {
        local_10 = (nDotL_4 <= 1f);
    } else {
        local_10 = false;
    }
    let _e87 = local_10;
    if !(_e87) {
        return 1f;
    }
    let shadowMapSize_1 = textureDimensions(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 0i);
    let _e94 = _atlasTileGridX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_4);
    let tileSize_2 = (shadowMapSize_1 / _e94);
    let tileOrigin_2 = (vec2<u32>((layer_5 % _e94.x), (layer_5 / _e94.x)) * tileSize_2);
    let baseTexel_1 = (vec2<i32>(tileOrigin_2) + vec2<i32>(floor((tileUv * vec2<f32>(tileSize_2)))));
    let _e108 = _pcssDiskRotationX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(baseTexel_1, layer_5);
    let rawRadius = select(2f, 3f, (profile == 5u));
    let _e118 = _directionalReceiverDepthBiasX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_5, normal_10, l_1, (rawRadius + 1f));
    let biasedDepth = (projCoords.z - _e118);
    if (profile == 4u) {
        loop {
            let _e123 = i_1;
            if (_e123 < PCSS_MEDIUM_RAW_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) {
            } else {
                break;
            }
            {
                let _e126 = i_1;
                let _e127 = _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e126, _e108, rawRadius);
                let _e128 = _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize_1, tileOrigin_2, tileSize_2, baseTexel_1, _e127);
                let rawTexel = vec2<i32>(((_e128 * vec2<f32>(shadowMapSize_1)) - vec2(0.5f)));
                let _e136 = shadow_load_raw_depthX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, rawTexel);
                if (_e136 >= 0f) {
                    local_11 = (_e136 < biasedDepth);
                } else {
                    local_11 = false;
                }
                let _e143 = local_11;
                if _e143 {
                    let _e145 = blockerDepth;
                    blockerDepth = (_e145 + _e136);
                    let _e148 = blockerCount;
                    blockerCount = (_e148 + 1u);
                }
            }
            continuing {
                let _e151 = i_1;
                i_1 = (_e151 + 1u);
            }
        }
    } else {
        loop {
            let _e155 = i_2;
            if (_e155 < PCSS_HIGH_RAW_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) {
            } else {
                break;
            }
            {
                let _e158 = i_2;
                let _e159 = _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e158, _e108, rawRadius);
                let _e160 = _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize_1, tileOrigin_2, tileSize_2, baseTexel_1, _e159);
                let rawTexel_1 = vec2<i32>(((_e160 * vec2<f32>(shadowMapSize_1)) - vec2(0.5f)));
                let _e168 = shadow_load_raw_depthX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, rawTexel_1);
                if (_e168 >= 0f) {
                    local_12 = (_e168 < biasedDepth);
                } else {
                    local_12 = false;
                }
                let _e175 = local_12;
                if _e175 {
                    let _e176 = blockerDepth;
                    blockerDepth = (_e176 + _e168);
                    let _e178 = blockerCount;
                    blockerCount = (_e178 + 1u);
                }
            }
            continuing {
                let _e181 = i_2;
                i_2 = (_e181 + 1u);
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
    let _e196 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_5].z;
    let lightDepthWorldSpan = max(_e196, 0f);
    let _e203 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_5].y;
    let worldUnitsPerTexel = max(_e203, 0f);
    if (lightDepthWorldSpan > 0f) {
        local_13 = (worldUnitsPerTexel > 0f);
    } else {
        local_13 = false;
    }
    let _e213 = local_13;
    if _e213 {
        let _e217 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.y;
        local_14 = (_e217 >= 0f);
    } else {
        local_14 = false;
    }
    let _e223 = local_14;
    if _e223 {
        let _e227 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.z;
        local_15 = (_e227 >= 0f);
    } else {
        local_15 = false;
    }
    let _e233 = local_15;
    if !(_e233) {
        return 1f;
    }
    let worldDistance = (max(0f, (biasedDepth - averageBlockerDepth)) * lightDepthWorldSpan);
    let _e243 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.y;
    let _e250 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.z;
    let penumbraTexels = clamp(((worldDistance * tan(_e243)) / worldUnitsPerTexel), 0f, _e250);
    let compareRadius = max(0.5f, penumbraTexels);
    let _e258 = _directionalReceiverDepthBiasX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_5, normal_10, l_1, (compareRadius + 1.5f));
    let compareDepth = (projCoords.z - _e258);
    if (profile == 4u) {
        loop {
            let _e263 = i_3;
            if (_e263 < PCSS_MEDIUM_COMPARE_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) {
            } else {
                break;
            }
            {
                let _e266 = i_3;
                let _e267 = _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e266, _e108, compareRadius);
                let _e268 = _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize_1, tileOrigin_2, tileSize_2, baseTexel_1, _e267);
                let _e270 = litSum;
                let _e273 = shadow_sample_compareX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, _e268, compareDepth);
                litSum = (_e270 + _e273);
            }
            continuing {
                let _e275 = i_3;
                i_3 = (_e275 + 1u);
            }
        }
        let _e278 = litSum;
        return (_e278 / 16f);
    }
    loop {
        let _e282 = i_4;
        if (_e282 < PCSS_HIGH_COMPARE_TAPSX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX) {
        } else {
            break;
        }
        {
            let _e285 = i_4;
            let _e286 = _pcssDiskPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e285, _e108, compareRadius);
            let _e287 = _pcssProjectedSampleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(shadowMapSize_1, tileOrigin_2, tileSize_2, baseTexel_1, _e286);
            let _e288 = litSum;
            let _e291 = shadow_sample_compareX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, _e287, compareDepth);
            litSum = (_e288 + _e291);
        }
        continuing {
            let _e293 = i_4;
            i_4 = (_e293 + 1u);
        }
    }
    let _e296 = litSum;
    return (_e296 / 32f);
}

fn _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_1: vec3<f32>, layer_6: u32, count_5: u32, normal_11: vec3<f32>, l_2: vec3<f32>) -> f32 {
    var local_16: bool;
    var local_17: bool;
    var local_18: bool;
    var local_19: bool;
    var blocked: f32 = 0f;
    var local_20: bool;
    var x: i32 = -1i;
    var y: i32;
    var x_1: i32 = -2i;
    var y_1: i32;

    let _e4 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_6);
    let lightClip_1 = (_e4 * vec4<f32>(worldPos_1, 1f));
    let projCoords_1 = (lightClip_1.xyz / vec3(lightClip_1.w));
    let _e14 = _atlasTileScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_5);
    let _e15 = _atlasTileOriginX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_6, count_5);
    let tileUv_1 = vec2<f32>(((projCoords_1.x * 0.5f) + 0.5f), ((-(projCoords_1.y) * 0.5f) + 0.5f));
    let uv_4 = ((tileUv_1 * _e14) + _e15);
    let currentDepth = projCoords_1.z;
    if (tileUv_1.x >= 0f) {
        local_16 = (tileUv_1.x <= 1f);
    } else {
        local_16 = false;
    }
    let _e40 = local_16;
    if _e40 {
        local_17 = (tileUv_1.y >= 0f);
    } else {
        local_17 = false;
    }
    let _e47 = local_17;
    if _e47 {
        local_18 = (tileUv_1.y <= 1f);
    } else {
        local_18 = false;
    }
    let _e54 = local_18;
    if _e54 {
        local_19 = (currentDepth <= 1f);
    } else {
        local_19 = false;
    }
    let _e60 = local_19;
    if !(_e60) {
        return 1f;
    }
    let _e65 = textureDimensions(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 0i);
    let texelDims = vec2<f32>(_e65);
    let texel_3 = vec2<f32>((1f / texelDims.x), (1f / texelDims.y));
    let tileLo = (_e15 + texel_3);
    let tileHi = ((_e15 + _e14) - texel_3);
    let _e80 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.x;
    let filterProfile = clamp(u32(round(_e80)), 1u, 5u);
    if (filterProfile >= 4u) {
        let _e90 = _samplePcssForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_1, layer_6, count_5, normal_11, l_2, filterProfile);
        return _e90;
    }
    let kernel = select(select(3u, 5u, (filterProfile == 3u)), 1u, (filterProfile == 1u));
    let _e105 = _directionalReceiverDepthBiasX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_6, normal_11, l_2, f32(((kernel / 2u) + 1u)));
    let adjustedDepth = (currentDepth - _e105);
    if (kernel == 1u) {
        let lit = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, clamp(uv_4, tileLo, tileHi), adjustedDepth);
        return lit;
    }
    if (kernel == 3u) {
        if all((uv_4 >= (tileLo + texel_3))) {
            local_20 = all((uv_4 <= (tileHi - texel_3)));
        } else {
            local_20 = false;
        }
        let interior = local_20;
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
            let _e202 = x;
            if (_e202 <= 1i) {
            } else {
                break;
            }
            {
                y = -1i;
                loop {
                    let _e207 = y;
                    if (_e207 <= 1i) {
                    } else {
                        break;
                    }
                    {
                        let _e210 = x;
                        let _e212 = y;
                        let offsetUv = clamp((uv_4 + (vec2<f32>(f32(_e210), f32(_e212)) * texel_3)), tileLo, tileHi);
                        let lit_1 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv, adjustedDepth);
                        let _e222 = blocked;
                        blocked = (_e222 + (1f - lit_1));
                    }
                    continuing {
                        let _e227 = y;
                        y = (_e227 + 1i);
                    }
                }
            }
            continuing {
                let _e230 = x;
                x = (_e230 + 1i);
            }
        }
        let _e232 = blocked;
        return (1f - (_e232 / 9f));
    }
    loop {
        let _e238 = x_1;
        if (_e238 <= 2i) {
        } else {
            break;
        }
        {
            y_1 = -2i;
            loop {
                let _e243 = y_1;
                if (_e243 <= 2i) {
                } else {
                    break;
                }
                {
                    let _e246 = x_1;
                    let _e248 = y_1;
                    let offsetUv_1 = clamp((uv_4 + (vec2<f32>(f32(_e246), f32(_e248)) * texel_3)), tileLo, tileHi);
                    let lit_2 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv_1, adjustedDepth);
                    let _e257 = blocked;
                    blocked = (_e257 + (1f - lit_2));
                }
                continuing {
                    let _e262 = y_1;
                    y_1 = (_e262 + 1i);
                }
            }
        }
        continuing {
            let _e265 = x_1;
            x_1 = (_e265 + 1i);
        }
    }
    let _e267 = blocked;
    return (1f - (_e267 / 25f));
}

fn evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_12: vec3<f32>, worldPos_2: vec3<f32>, viewZ_1: f32) -> f32 {
    var shadow_1: f32;
    var local_21: bool;

    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeCount;
    if (_e2 < 1f) {
        return 1f;
    }
    let _e8 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let l_4 = normalize(-(_e8));
    let _e13 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeCount;
    let count_6 = u32(max(_e13, 1f));
    let viewDepth_1 = -(viewZ_1);
    let _e25 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[(count_6 - 1u)].x;
    if (viewDepth_1 > _e25) {
        return 1f;
    }
    let _e28 = _pickCascadeLayerX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(viewDepth_1, count_6);
    let _e33 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.normalBias;
    let receiverPosition = (worldPos_2 + (normal_12 * _e33));
    let _e36 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(receiverPosition, _e28, count_6, normal_12, l_4);
    shadow_1 = _e36;
    let _e40 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
    if (_e40 > 0f) {
        local_21 = ((_e28 + 1u) < count_6);
    } else {
        local_21 = false;
    }
    let _e49 = local_21;
    if _e49 {
        let spCurr = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[_e28].x;
        let _e57 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
        let blendWidth = (spCurr * _e57);
        if (blendWidth > 0f) {
            let dist = (spCurr - viewDepth_1);
            let t_1 = clamp((1f - (dist / blendWidth)), 0f, 1f);
            if (t_1 > 0f) {
                let _e72 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(receiverPosition, (_e28 + 1u), count_6, normal_12, l_4);
                shadow_1 = mix(_e36, _e72, t_1);
            }
        }
    }
    let _e74 = shadow_1;
    return _e74;
}

fn encodeStandardGBufferX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(normal_13: vec3<f32>, roughness_7: f32, albedo_3: vec3<f32>, metallic_4: f32, f0_4: vec3<f32>, occlusion: f32, emissive: vec3<f32>, opacity: f32, reflection: u32, probeRow_1: u32) -> GBufferOutputX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX {
    return GBufferOutputX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(vec4<f32>(((normalize(normal_13) * 0.5f) + vec3(0.5f)), roughness_7), pack4x8unorm(vec4<f32>(albedo_3, metallic_4)), vec4<f32>(f0_4, occlusion), vec4<f32>(emissive, opacity), ((reflection << 24u) | probeRow_1));
}

fn sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_1: vec4<f32>) -> vec2<f32> {
    let safeW = select(0.000001f, clip_1.w, (abs(clip_1.w) >= 0.000001f));
    let ndc_1 = (clip_1.xy / vec2(safeW));
    return vec2<f32>(((ndc_1.x * 0.5f) + 0.5f), (0.5f - (ndc_1.y * 0.5f)));
}

fn sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_2: vec4<f32>, temporalProjection_1: vec4<f32>) -> f32 {
    let _e2 = sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_2, temporalProjection_1);
    return log2((1f + max(-(_e2), 0f)));
}

fn packSceneTemporalV1WithValidityX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip: vec4<f32>, previousClip: vec4<f32>, temporalProjection_2: vec4<f32>, reactive: f32, motionValid: bool) -> vec4<f32> {
    let _e1 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip);
    let _e3 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(previousClip);
    let _e6 = sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip, temporalProjection_2);
    return vec4<f32>((_e1 - _e3), _e6, (clamp(reactive, 0f, 1f) + select(0f, 2f, !(motionValid))));
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
    let angle_1 = metadata.y;
    let c = cos(angle_1);
    let s = sin(angle_1);
    return (vec2<f32>(((scaled.x * c) - (scaled.y * s)), ((scaled.x * s) + (scaled.y * c))) + transform.xy);
}

fn resolvePbrTemporalReactiveX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(reactive_1: f32, baseColorAlpha: f32, sampledAlpha: f32) -> f32 {
    let coverage_1 = clamp((baseColorAlpha * sampledAlpha), 0f, 1f);
    let coverageReactive = (1f - coverage_1);
    return max(clamp(reactive_1, 0f, 1f), coverageReactive);
}

fn projectPbrSceneTemporalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(baseColorAlpha_1: f32, alphaCutoff: f32, baseColorTextureEnabled: bool, baseColorTexture: texture_2d<f32>, baseColorSampler: sampler, transform_1: vec4<f32>, metadata_1: vec4<f32>, currentClip_1: vec4<f32>, previousClip_1: vec4<f32>, temporalProjection_3: vec4<f32>, reactive_2: f32, motionValid_1: bool, uv0_1: vec2<f32>, uv1_1: vec2<f32>, uv2_1: vec2<f32>, uv3_1: vec2<f32>, uv4_1: vec2<f32>, uv5_1: vec2<f32>, uv6_1: vec2<f32>, uv7_1: vec2<f32>) -> vec4<f32> {
    var baseSample: vec4<f32> = vec4(1f);
    var local_22: bool;

    if baseColorTextureEnabled {
        let _e13 = transformedPbrTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(transform_1, metadata_1, uv0_1, uv1_1, uv2_1, uv3_1, uv4_1, uv5_1, uv6_1, uv7_1);
        let _e17 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, _e13, metadata_1.zw);
        baseSample = _e17;
    }
    if (alphaCutoff > 0f) {
        let _e24 = baseSample.w;
        local_22 = ((baseColorAlpha_1 * _e24) <= alphaCutoff);
    } else {
        local_22 = false;
    }
    let _e30 = local_22;
    if _e30 {
        discard;
    }
    let _e32 = baseSample.w;
    let _e34 = resolvePbrTemporalReactiveX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(reactive_2, baseColorAlpha_1, _e32);
    let _e39 = packSceneTemporalV1WithValidityX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip_1, previousClip_1, temporalProjection_3, _e34, motionValid_1);
    return _e39;
}

fn materialTextureFilteringWitness() {
    let baseWitness = textureSample(baseColorTexture_1, baseColorTexture_sampler, vec2(0f));
    let metallicRoughnessWitness = textureSample(metallicRoughnessTexture, metallicRoughnessTexture_sampler, vec2(0f));
    let normalWitness = textureSample(normalTexture, normalTexture_sampler, vec2(0f));
    let emissiveWitness = textureSample(emissiveTexture, emissiveTexture_sampler, vec2(0f));
    let occlusionWitness = textureSample(occlusionTexture, occlusionTexture_sampler, vec2(0f));
    let transmissionWitness = textureSample(transmissionTexture, transmissionSampler, vec2(0f));
    let thicknessWitness = textureSample(thicknessTexture, thicknessSampler, vec2(0f));
    return;
}

fn vs_main_impl(in_6: VsIn, meshIndex: u32, instanceIndex: u32, paletteBase: u32, materialIndex_1: u32, materialAddress: vec3<u32>) -> VsOut {
    var out_1: VsOut;

    let _e7 = palette[(paletteBase + in_6.skinIndex.x)];
    let _e16 = palette[(paletteBase + in_6.skinIndex.y)];
    let _e26 = palette[(paletteBase + in_6.skinIndex.z)];
    let _e36 = palette[(paletteBase + in_6.skinIndex.w)];
    let skinMatrix = ((((_e7 * in_6.skinWeight.x) + (_e16 * in_6.skinWeight.y)) + (_e26 * in_6.skinWeight.z)) + (_e36 * in_6.skinWeight.w));
    let skinnedLocal = (skinMatrix * vec4<f32>(in_6.pos, 1f));
    let m0_ = skinMatrix[0].xyz;
    let m1_ = skinMatrix[1].xyz;
    let m2_ = skinMatrix[2].xyz;
    let skinNormal3x3_ = mat3x3<f32>(m0_, m1_, m2_);
    let phony = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[meshIndex].worldFromLocal;
    let phony_1 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[instanceIndex].localFromInstance;
    let _e66 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out_1.clip = (_e66 * skinnedLocal);
    out_1.worldPos = skinnedLocal.xyz;
    out_1.worldNormal = normalize((skinNormal3x3_ * in_6.normal));
    let worldTangentXyz = normalize((skinNormal3x3_ * in_6.tangent.xyz));
    out_1.worldTangent = vec4<f32>(worldTangentXyz, in_6.tangent.w);
    out_1.uv = in_6.uv;
    out_1.uv1_ = in_6.uv1_;
    out_1.uv2_ = in_6.uv2_;
    out_1.uv3_ = in_6.uv3_;
    out_1.uv4_ = in_6.uv4_;
    out_1.uv5_ = in_6.uv5_;
    out_1.uv6And7_ = vec4<f32>(in_6.uv6_, in_6.uv7_);
    out_1.transmissionBasis0_ = vec4<f32>(skinMatrix[0].xyz, skinMatrix[1].x);
    out_1.transmissionBasis1_ = vec4<f32>(skinMatrix[1].y, skinMatrix[1].z, skinMatrix[2].x, skinMatrix[2].y);
    out_1.materialAddress = materialAddress;
    let clipPos = out_1.clip;
    out_1.ndc = vec4<f32>((clipPos.xy / vec2(clipPos.w)), (clipPos.z / clipPos.w), skinMatrix[2].z);
    let _e132 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e133 = sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clipPos, _e132);
    out_1.viewZ = _e133;
    let _e134 = out_1;
    return _e134;
}

fn standardViewZ(in_7: VsOut) -> f32 {
    return in_7.viewZ;
}

fn selectedMaterial(index_1: u32) -> MaterialParameters {
    let _e3 = sceneMaterials[index_1];
    return _e3;
}

fn transformedMaterialUv(transform_2: vec4<f32>, metadata_2: vec4<f32>, in_8: VsOut) -> vec2<f32> {
    var source_1: vec2<f32>;

    source_1 = in_8.uv;
    if (metadata_2.x >= 1f) {
        source_1 = in_8.uv1_;
    }
    if (metadata_2.x >= 2f) {
        source_1 = in_8.uv2_;
    }
    if (metadata_2.x >= 3f) {
        source_1 = in_8.uv3_;
    }
    if (metadata_2.x >= 4f) {
        source_1 = in_8.uv4_;
    }
    if (metadata_2.x >= 5f) {
        source_1 = in_8.uv5_;
    }
    if (metadata_2.x >= 6f) {
        source_1 = in_8.uv6And7_.xy;
    }
    if (metadata_2.x >= 7f) {
        source_1 = in_8.uv6And7_.zw;
    }
    let _e35 = source_1;
    let scaled_1 = (_e35 * transform_2.zw);
    let angle_2 = metadata_2.y;
    let c_1 = cos(angle_2);
    let s_1 = sin(angle_2);
    return (vec2<f32>(((scaled_1.x * c_1) - (scaled_1.y * s_1)), ((scaled_1.x * s_1) + (scaled_1.y * c_1))) + transform_2.xy);
}

fn materialVertexColor(in_9: VsOut) -> vec4<f32> {
    return vec4(1f);
}

fn standardSkinVariantIdentity() -> f32 {
    var identity: f32 = 0f;

    let _e2 = identity;
    identity = (_e2 + 1f);
    let _e5 = identity;
    identity = (_e5 + 32f);
    let _e8 = identity;
    identity = (_e8 + 64f);
    let _e11 = identity;
    return _e11;
}

fn standardUsesBaseColorTexture() -> bool {
    return ((standardTextureMask & 1u) != 0u);
}

fn surfaceUv(input: SurfaceInput, transform_3: vec4<f32>, metadata_3: vec4<f32>) -> vec2<f32> {
    var source_2: vec2<f32>;

    source_2 = input.uv0_;
    if (metadata_3.x >= 1f) {
        source_2 = input.uv1_;
    }
    if (metadata_3.x >= 2f) {
        source_2 = input.uv2_;
    }
    if (metadata_3.x >= 3f) {
        source_2 = input.uv3_;
    }
    if (metadata_3.x >= 4f) {
        source_2 = input.uv4_;
    }
    if (metadata_3.x >= 5f) {
        source_2 = input.uv5_;
    }
    if (metadata_3.x >= 6f) {
        source_2 = input.uv6_;
    }
    if (metadata_3.x >= 7f) {
        source_2 = input.uv7_;
    }
    let _e33 = source_2;
    let scaled_2 = (_e33 * transform_3.zw);
    let c_2 = cos(metadata_3.y);
    let s_2 = sin(metadata_3.y);
    return (vec2<f32>(((scaled_2.x * c_2) - (scaled_2.y * s_2)), ((scaled_2.x * s_2) + (scaled_2.y * c_2))) + transform_3.xy);
}

fn standardUsesMetallicRoughnessTexture() -> bool {
    return ((standardTextureMask & 2u) != 0u);
}

fn standardUsesNormalTexture() -> bool {
    return ((standardTextureMask & 4u) != 0u);
}

fn surfaceNormal(input_1: SurfaceInput, encoded: vec4<f32>, normalScale: f32) -> vec3<f32> {
    let tangentXY = (((encoded.xy * 2f) - vec2(1f)) * normalScale);
    let tangentZ = sqrt(max((1f - dot(tangentXY, tangentXY)), 0f));
    let geometric = normalize(input_1.geometricNormalWS);
    let tangent = normalize((input_1.tangentWS.xyz - (geometric * dot(geometric, input_1.tangentWS.xyz))));
    let bitangent = (normalize(cross(geometric, tangent)) * input_1.tangentWS.w);
    return normalize((((tangent * tangentXY.x) + (bitangent * tangentXY.y)) + (geometric * tangentZ)));
}

fn standardUsesEmissiveTexture() -> bool {
    return ((standardTextureMask & 16u) != 0u);
}

fn standardUsesOcclusionTexture() -> bool {
    return ((standardTextureMask & 32u) != 0u);
}

fn surfaceChannel(value: vec4<f32>, channel: u32) -> f32 {
    switch channel {
        case 0u: {
            return value.x;
        }
        case 1u: {
            return value.y;
        }
        case 2u: {
            return value.z;
        }
        default: {
            return value.w;
        }
    }
}

fn evaluate_standard_surface(input_2: SurfaceInput, materialValue: MaterialParameters) -> SurfaceData {
    var baseSample_1: vec4<f32> = vec4(1f);
    var metallicRoughnessSample: vec4<f32> = vec4(1f);
    var normal_14: vec3<f32>;
    var emissiveSample: vec4<f32> = vec4(1f);
    var occlusionSample: vec4<f32> = vec4(1f);

    let _e2 = standardUsesBaseColorTexture();
    if _e2 {
        let _e7 = surfaceUv(input_2, materialValue.baseColorTextureCoordinatesTransform, materialValue.baseColorTextureCoordinatesMetadata);
        let _e13 = textureSample(baseColorTexture_1, baseColorTexture_sampler, (_e7 * materialValue.baseColorTextureCoordinatesMetadata.zw));
        baseSample_1 = _e13;
    }
    let _e15 = standardUsesMetallicRoughnessTexture();
    if _e15 {
        let _e18 = surfaceUv(input_2, materialValue.metallicRoughnessTextureCoordinatesTransform, materialValue.metallicRoughnessTextureCoordinatesMetadata);
        let _e24 = textureSample(metallicRoughnessTexture, metallicRoughnessTexture_sampler, (_e18 * materialValue.metallicRoughnessTextureCoordinatesMetadata.zw));
        metallicRoughnessSample = _e24;
    }
    normal_14 = normalize(input_2.geometricNormalWS);
    let _e29 = standardUsesNormalTexture();
    if _e29 {
        let _e32 = surfaceUv(input_2, materialValue.normalTextureCoordinatesTransform, materialValue.normalTextureCoordinatesMetadata);
        let normalSample = textureSample(normalTexture, normalTexture_sampler, (_e32 * materialValue.normalTextureCoordinatesMetadata.zw));
        let _e40 = surfaceNormal(input_2, normalSample, materialValue.normalScale);
        normal_14 = _e40;
    }
    let _e41 = standardUsesEmissiveTexture();
    if _e41 {
        let _e44 = surfaceUv(input_2, materialValue.emissiveTextureCoordinatesTransform, materialValue.emissiveTextureCoordinatesMetadata);
        let _e50 = textureSample(emissiveTexture, emissiveTexture_sampler, (_e44 * materialValue.emissiveTextureCoordinatesMetadata.zw));
        emissiveSample = _e50;
    }
    let _e52 = standardUsesOcclusionTexture();
    if _e52 {
        let _e55 = surfaceUv(input_2, materialValue.occlusionTextureCoordinatesTransform, materialValue.occlusionTextureCoordinatesMetadata);
        let _e61 = textureSample(occlusionTexture, occlusionTexture_sampler, (_e55 * materialValue.occlusionTextureCoordinatesMetadata.zw));
        occlusionSample = _e61;
    }
    let vertexColor = input_2.vertexColor;
    let _e66 = baseSample_1;
    let baseColor_1 = ((materialValue.baseColor.xyz * _e66.xyz) * vertexColor.xyz);
    let _e72 = metallicRoughnessSample;
    let _e75 = surfaceChannel(_e72, u32(materialValue.metallicChannel));
    let metallic_5 = clamp((materialValue.metallic * _e75), 0f, 1f);
    let _e81 = metallicRoughnessSample;
    let _e84 = surfaceChannel(_e81, u32(materialValue.roughnessChannel));
    let roughness_9 = clamp((materialValue.roughness * _e84), 0.04f, 1f);
    let _e92 = emissiveSample;
    let emissive_1 = ((materialValue.emissive * materialValue.emissiveIntensity) * _e92.xyz);
    let _e96 = occlusionSample.x;
    let occlusion_1 = clamp((1f + ((_e96 - 1f) * materialValue.occlusionStrength)), 0f, 1f);
    let _e106 = normal_14;
    let _e110 = baseSample_1.w;
    return SurfaceData(baseColor_1, _e106, metallic_5, roughness_9, emissive_1, occlusion_1, clamp(((materialValue.baseColor.w * _e110) * vertexColor.w), 0f, 1f), clamp(materialValue.alphaCutoff, 0f, 1f));
}

fn evaluate_surface(input_3: SurfaceInput) -> SurfaceData {
    let _e1 = material;
    let _e3 = evaluate_standard_surface(input_3, _e1);
    return _e3;
}

fn evaluateStandardSurface(in_10: VsOut, frontFacing_2: bool) -> SurfaceData {
    let _e3 = selectedMaterial(in_10.materialAddress.x);
    material = _e3;
    let _e7 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let viewDirectionWS = normalize((_e7 - in_10.worldPos));
    let positionOS = in_10.worldPos;
    let _e25 = materialVertexColor(in_10);
    let input_4 = SurfaceInput(positionOS, in_10.worldPos, in_10.worldNormal, in_10.worldTangent, viewDirectionWS, in_10.uv, in_10.uv1_, in_10.uv2_, in_10.uv3_, in_10.uv4_, in_10.uv5_, in_10.uv6And7_.xy, in_10.uv6And7_.zw, _e25, frontFacing_2);
    let _e28 = evaluate_surface(input_4);
    return _e28;
}

fn finiteScalar(value_1: f32, fallback: f32) -> f32 {
    let bounded = clamp(value_1, -65504f, 65504f);
    return select(fallback, bounded, (value_1 == value_1));
}

fn finiteColor(value_2: vec3<f32>, fallback_1: vec3<f32>) -> vec3<f32> {
    let _e4 = finiteScalar(value_2.x, fallback_1.x);
    let _e7 = finiteScalar(value_2.y, fallback_1.y);
    let _e10 = finiteScalar(value_2.z, fallback_1.z);
    return vec3<f32>(_e4, _e7, _e10);
}

fn alphaTestSurface(surface: SurfaceData) {
    var local_23: bool;

    if (surface.alphaClipThreshold > 0f) {
        local_23 = (surface.opacity <= surface.alphaClipThreshold);
    } else {
        local_23 = false;
    }
    let _e10 = local_23;
    if _e10 {
        discard;
    } else {
        return;
    }
}

fn standardSurfaceF0_(in_11: VsOut, surface_1: SurfaceData) -> vec3<f32> {
    var specularColor: vec3<f32>;
    var specularWeight: f32;

    let albedo_4 = surface_1.baseColor;
    let _e4 = finiteScalar(surface_1.metallic, 0f);
    let metallic_6 = clamp(_e4, 0f, 1f);
    let _e10 = material.specularColor;
    specularColor = _e10;
    let _e14 = material.specular;
    let _e16 = finiteScalar(_e14, 1f);
    specularWeight = clamp(_e16, 0f, 1f);
    let _e23 = material.ior;
    let _e25 = finiteScalar(_e23, 1.5f);
    let safeIor = max(_e25, 1f);
    let dielectricF0_ = pow(((safeIor - 1f) / (safeIor + 1f)), 2f);
    let _e36 = specularColor;
    let _e38 = specularWeight;
    return mix(((vec3(dielectricF0_) * _e36) * _e38), albedo_4, metallic_6);
}

fn standardSsrCoverage() -> f32 {
    var coverage: f32 = 1f;

    let _e2 = coverage;
    return _e2;
}

fn standardUsesTransmissionTexture() -> bool {
    return ((standardTextureMask & 64u) != 0u);
}

fn standardUsesThicknessTexture() -> bool {
    return ((standardTextureMask & 128u) != 0u);
}

fn temporalVertexAlpha(in_12: TemporalVsOut) -> f32 {
    return 1f;
}

fn standardUsesSpecularColorTexture() -> bool {
    return ((standardTextureMask & 8u) != 0u);
}

fn standardUsesClearcoatTexture() -> bool {
    return ((standardTextureMask & 256u) != 0u);
}

fn standardUsesClearcoatRoughnessTexture() -> bool {
    return ((standardTextureMask & 512u) != 0u);
}

fn standardUsesClearcoatNormalTexture() -> bool {
    return ((standardTextureMask & 1024u) != 0u);
}

fn standardUsesAnisotropyTexture() -> bool {
    return ((standardTextureMask & 2048u) != 0u);
}

fn standardUsesSheenColorTexture() -> bool {
    return ((standardTextureMask & 4096u) != 0u);
}

fn standardUsesSheenRoughnessTexture() -> bool {
    return ((standardTextureMask & 8192u) != 0u);
}

fn standardUsesIridescenceTexture() -> bool {
    return ((standardTextureMask & 16384u) != 0u);
}

fn standardUsesIridescenceThicknessTexture() -> bool {
    return ((standardTextureMask & 32768u) != 0u);
}

fn standardUsesSpecularTexture() -> bool {
    return ((standardTextureMask & 65536u) != 0u);
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    let _e9 = vs_main_impl(in, 0u, idx, 0u, 4294967295u, vec3<u32>(4294967295u, 0u, 0u));
    return _e9;
}

@vertex 
fn vs_scene_index(in_1: VsIn, @builtin(instance_index) idx_1: u32) -> VsOut {
    var materialIndex: u32;

    let visible = visibleItems[idx_1];
    materialIndex = visible.y;
    let _e11 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[visible.x].temporal.w;
    materialIndex = u32(_e11);
    let _e15 = materialIndex;
    let _e16 = materialIndex;
    let _e22 = vs_main_impl(in_1, visible.x, 0u, visible.y, _e15, vec3<u32>(_e16, visible.z, visible.w));
    return _e22;
}

@fragment 
fn fs_main(in_2: VsOut, @builtin(front_facing) frontFacing: bool) -> StandardPbrOutput {
    var f0_: vec3<f32>;
    var physicalNormal: vec3<f32>;
    var diffuseAlbedo: vec3<f32>;
    var transmissionSample: f32 = 1f;
    var thicknessSample: f32 = 1f;
    var coatF: vec3<f32> = vec3(0f);
    var probeShPreblend: array<vec4<f32>, 9>;
    var probeLocalBlendFraction: f32 = 0f;
    var ambient: vec3<f32>;
    var reflectionFallback: vec3<f32>;
    var color: vec3<f32>;
    var local: bool;
    var transmittedBackdrop: vec3<f32>;
    var local_1: bool;
    var local_2: bool;
    var output: StandardPbrOutput;

    let _e3 = standardSkinVariantIdentity();
    let _e6 = evaluateStandardSurface(in_2, frontFacing);
    alphaTestSurface(_e6);
    let alpha_1 = _e6.opacity;
    let albedo_5 = _e6.baseColor;
    let _e11 = finiteScalar(_e6.metallic, 0f);
    let metallic_7 = clamp(_e11, 0f, 1f);
    let _e17 = finiteScalar(_e6.roughness, 0.5f);
    let iblRoughness = clamp(_e17, 0.04f, 1f);
    let a_2 = (iblRoughness * iblRoughness);
    let n = normalize(_e6.normalWS);
    let _e26 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let v = normalize((_e26 - in_2.worldPos));
    let _e32 = material.ior;
    let _e34 = finiteScalar(_e32, 1.5f);
    let safeIor_1 = max(_e34, 1f);
    let dielectricF0_1 = pow(((safeIor_1 - 1f) / (safeIor_1 + 1f)), 2f);
    let _e44 = standardSurfaceF0_(in_2, _e6);
    f0_ = _e44;
    physicalNormal = n;
    diffuseAlbedo = albedo_5;
    let _e48 = standardUsesTransmissionTexture();
    if _e48 {
        let _e51 = material.transmissionTextureCoordinatesTransform;
        let _e54 = material.transmissionTextureCoordinatesMetadata;
        let _e55 = transformedMaterialUv(_e51, _e54, in_2);
        let _e58 = material.transmissionTextureCoordinatesMetadata;
        let _e62 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(transmissionTexture, transmissionSampler, _e55, _e58.zw);
        transmissionSample = _e62.x;
    }
    let _e65 = standardUsesThicknessTexture();
    if _e65 {
        let _e68 = material.thicknessTextureCoordinatesTransform;
        let _e71 = material.thicknessTextureCoordinatesMetadata;
        let _e72 = transformedMaterialUv(_e68, _e71, in_2);
        let _e75 = material.thicknessTextureCoordinatesMetadata;
        let _e79 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(thicknessTexture, thicknessSampler, _e72, _e75.zw);
        thicknessSample = _e79.y;
    }
    let _e84 = material.transmission;
    let _e86 = finiteScalar(_e84, 0f);
    let _e87 = transmissionSample;
    let _e89 = finiteScalar(_e87, 1f);
    let transmissionFactor = clamp((_e86 * _e89), 0f, 1f);
    let _e96 = finiteScalar(dot(n, v), 0f);
    let refractionFromInside = (_e96 < 0f);
    let refractionNormal = select(n, -(n), refractionFromInside);
    let refractionEta = select((1f / safeIor_1), safeIor_1, refractionFromInside);
    let incident = -(v);
    let refracted = refract(incident, refractionNormal, refractionEta);
    let refractedLengthSquared = dot(refracted, refracted);
    let viewCos = clamp(abs(_e96), 0f, 1f);
    let _e112 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(viewCos, vec3(dielectricF0_1));
    let fresnel_1 = clamp(_e112.x, 0f, 1f);
    let transmittedEnergy = select(0f, ((transmissionFactor * (1f - metallic_7)) * (1f - fresnel_1)), (refractedLengthSquared > 0.000001f));
    diffuseAlbedo = (albedo_5 * (1f - transmittedEnergy));
    let _e131 = physicalNormal;
    let _e132 = diffuseAlbedo;
    let _e133 = f0_;
    let _e135 = skylight;
    let _e138 = probeShPreblend;
    let _e139 = probeLocalBlendFraction;
    let _e146 = evaluateStandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(in_2.worldPos, _e131, v, _e132, metallic_7, iblRoughness, _e133, _e135, irradianceMap_2, irradianceSampler_2, prefilterMap_2, prefilterSampler_2, brdfLut_4, skylightPrefilterMap_1, _e138, _e139);
    let ao = _e6.occlusion;
    let _e150 = skylight.colorR;
    let _e153 = skylight.colorG;
    let _e156 = skylight.colorB;
    let _e160 = skylight.intensity;
    let _e161 = decodeSpecularEnvironmentScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(vec3<f32>(_e150, _e153, _e156), _e160);
    let _e168 = coatF;
    ambient = (((_e146.diffuse + _e146.specular) * (vec3(1f) - _e168)) * ao);
    let _e176 = coatF;
    reflectionFallback = ((_e146.specular * (vec3(1f) - _e176)) * ao);
    let _e181 = ambient;
    color = _e181;
    let screenUv = ((in_2.ndc.xy * vec2<f32>(0.5f, -0.5f)) + vec2(0.5f));
    let localToWorld0_ = in_2.transmissionBasis0_.xyz;
    let localToWorld1_ = vec3<f32>(in_2.transmissionBasis0_.w, in_2.transmissionBasis1_.x, in_2.transmissionBasis1_.y);
    let localToWorld2_ = vec3<f32>(in_2.transmissionBasis1_.z, in_2.transmissionBasis1_.w, in_2.ndc.w);
    let inverseCofactor0_ = cross(localToWorld1_, localToWorld2_);
    let inverseCofactor1_ = cross(localToWorld2_, localToWorld0_);
    let inverseCofactor2_ = cross(localToWorld0_, localToWorld1_);
    let localToWorldDet = dot(localToWorld0_, inverseCofactor0_);
    let safeLocalToWorldDet = select(1f, localToWorldDet, (abs(localToWorldDet) >= 0.000001f));
    let worldToLocal0_ = (vec3<f32>(inverseCofactor0_.x, inverseCofactor1_.x, inverseCofactor2_.x) / vec3(safeLocalToWorldDet));
    let worldToLocal1_ = (vec3<f32>(inverseCofactor0_.y, inverseCofactor1_.y, inverseCofactor2_.y) / vec3(safeLocalToWorldDet));
    let worldToLocal2_ = (vec3<f32>(inverseCofactor0_.z, inverseCofactor1_.z, inverseCofactor2_.z) / vec3(safeLocalToWorldDet));
    let refractedLocal = normalize((((worldToLocal0_ * refracted.x) + (worldToLocal1_ * refracted.y)) + (worldToLocal2_ * refracted.z)));
    let worldRefractedDirection = (((localToWorld0_ * refractedLocal.x) + (localToWorld1_ * refractedLocal.y)) + (localToWorld2_ * refractedLocal.z));
    let _e254 = material.thickness;
    let _e256 = finiteScalar(_e254, 0f);
    let _e259 = thicknessSample;
    let _e261 = finiteScalar(_e259, 1f);
    let worldThickness = max(((_e256 * length(worldRefractedDirection)) * _e261), 0f);
    let refractedUv = (screenUv + (((refracted.xy - incident.xy) * worldThickness) * 0.25f));
    if all((refractedUv >= vec2(0.02f))) {
        local = all((refractedUv <= vec2((1f - 0.02f))));
    } else {
        local = false;
    }
    let insideGuardBand = local;
    let backdropMipCount = textureNumLevels(transmissionBackdropTexture);
    let backdropMaxLod = max((f32(backdropMipCount) - 1f), 0f);
    let backdropLod = clamp(((iblRoughness * iblRoughness) * backdropMaxLod), 0f, backdropMaxLod);
    let _e303 = textureSampleLevel(transmissionBackdropTexture, transmissionBackdropSampler, clamp(screenUv, vec2(0f), vec2(1f)), backdropLod);
    let unrefractedBackdrop = _e303.xyz;
    transmittedBackdrop = unrefractedBackdrop;
    if (refractedLengthSquared > 0.000001f) {
        local_1 = insideGuardBand;
    } else {
        local_1 = false;
    }
    let _e311 = local_1;
    if _e311 {
        let _e319 = textureSampleLevel(transmissionBackdropTexture, transmissionBackdropSampler, clamp(refractedUv, vec2(0f), vec2(1f)), backdropLod);
        transmittedBackdrop = _e319.xyz;
    }
    let _e323 = material.attenuationColor;
    let _e326 = finiteColor(_e323, vec3(1f));
    let safeAttenuationColor = clamp(_e326, vec3(0f), vec3(1f));
    let _e334 = material.attenuationDistance;
    let _e336 = finiteScalar(_e334, 0f);
    let safeAttenuationDistance = max(_e336, 0f);
    let attenuationExponent = (worldThickness / max(safeAttenuationDistance, 0.000001f));
    if (safeAttenuationDistance > 0.000001f) {
        local_2 = (worldThickness > 0f);
    } else {
        local_2 = false;
    }
    let _e353 = local_2;
    let beerAttenuation = select(vec3(1f), pow(safeAttenuationColor, vec3(attenuationExponent)), _e353);
    let _e355 = color;
    let _e356 = transmittedBackdrop;
    let _e359 = finiteColor(_e356, vec3(0f));
    color = (_e355 + ((_e359 * transmittedEnergy) * beerAttenuation));
    let _e363 = color;
    color = (_e363 + _e6.emissive);
    let _e366 = physicalNormal;
    let _e368 = standardViewZ(in_2);
    let _e369 = evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e366, in_2.worldPos, _e368);
    let _e370 = color;
    let _e374 = standardViewZ(in_2);
    let _e375 = physicalNormal;
    let _e376 = diffuseAlbedo;
    let _e377 = f0_;
    let _e378 = evaluateStandardDirectX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(in_2.worldPos, in_2.ndc.xyz, _e374, _e375, v, _e376, metallic_7, a_2, _e377, _e369);
    color = (_e370 + _e378);
    let _e382 = color;
    output.color = vec4<f32>(_e382, alpha_1);
    let _e384 = output;
    return _e384;
}

@fragment 
fn fs_gbuffer(in_3: VsOut, @builtin(front_facing) frontFacing_1: bool) -> GBufferOutputX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX {
    var probeRow: u32 = 0u;

    let _e3 = evaluateStandardSurface(in_3, frontFacing_1);
    alphaTestSurface(_e3);
    let _e14 = standardSurfaceF0_(in_3, _e3);
    let _e22 = skylight.diffuseScale.w;
    let _e24 = probeRow;
    let _e25 = encodeStandardGBufferX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(_e3.normalWS, clamp(_e3.roughness, 0.04f, 1f), _e3.baseColor, clamp(_e3.metallic, 0f, 1f), _e14, _e3.occlusion, _e3.emissive, _e3.opacity, u32(_e22), _e24);
    return _e25;
}

@vertex 
fn vs_temporal(in_4: VsIn, @builtin(instance_index) idx_2: u32) -> TemporalVsOut {
    var out: TemporalVsOut;

    let _e7 = palette[(0u + in_4.skinIndex.x)];
    let _e16 = palette[(0u + in_4.skinIndex.y)];
    let _e26 = palette[(0u + in_4.skinIndex.z)];
    let _e36 = palette[(0u + in_4.skinIndex.w)];
    let currentSkin = ((((_e7 * in_4.skinWeight.x) + (_e16 * in_4.skinWeight.y)) + (_e26 * in_4.skinWeight.z)) + (_e36 * in_4.skinWeight.w));
    let _e46 = previousPalette[(0u + in_4.skinIndex.x)];
    let _e55 = previousPalette[(0u + in_4.skinIndex.y)];
    let _e65 = previousPalette[(0u + in_4.skinIndex.z)];
    let _e75 = previousPalette[(0u + in_4.skinIndex.w)];
    let previousSkin = ((((_e46 * in_4.skinWeight.x) + (_e55 * in_4.skinWeight.y)) + (_e65 * in_4.skinWeight.z)) + (_e75 * in_4.skinWeight.w));
    let currentWorld = (currentSkin * vec4<f32>(in_4.pos, 1f));
    let previousWorld = (previousSkin * vec4<f32>(in_4.pos, 1f));
    let _e92 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalCurrentViewProj;
    out.currentClip = (_e92 * currentWorld);
    let _e97 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e97 * currentWorld);
    let _e102 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalPreviousViewProj;
    out.previousClip = (_e102 * previousWorld);
    out.uv = in_4.uv;
    out.uv1_ = in_4.uv1_;
    out.uv2_ = in_4.uv2_;
    out.uv3_ = in_4.uv3_;
    out.uv4_ = in_4.uv4_;
    out.uv5_ = in_4.uv5_;
    out.uv6_ = in_4.uv6_;
    out.uv7_ = in_4.uv7_;
    let _e120 = out;
    return _e120;
}

@fragment 
fn fs_temporal(in_5: TemporalVsOut) -> @location(0) vec4<f32> {
    let reactive_3 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].temporal.x;
    let _e9 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].temporal.y;
    let motionValid_2 = (_e9 >= 0.5f);
    let _e15 = material.baseColor.w;
    let _e17 = temporalVertexAlpha(in_5);
    let _e21 = material.alphaCutoff;
    let _e22 = standardUsesBaseColorTexture();
    let _e25 = material.baseColorTextureCoordinatesTransform;
    let _e28 = material.baseColorTextureCoordinatesMetadata;
    let _e33 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e44 = projectPbrSceneTemporalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX((_e15 * _e17), _e21, _e22, baseColorTexture_1, baseColorTexture_sampler, _e25, _e28, in_5.currentClip, in_5.previousClip, _e33, reactive_3, motionValid_2, in_5.uv, in_5.uv1_, in_5.uv2_, in_5.uv3_, in_5.uv4_, in_5.uv5_, in_5.uv6_, in_5.uv7_);
    return _e44;
}
