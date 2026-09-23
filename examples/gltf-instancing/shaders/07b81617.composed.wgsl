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
    clippingPlanes: array<vec4<f32>, 6>,
    clippingControl: vec4<f32>,
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
    @location(0) scene_color: vec4<f32>,
    @location(1) @interpolate(flat) normal_roughness: u32,
    @location(2) @interpolate(flat) f0_occlusion: u32,
    @location(3) @interpolate(flat) albedo_metallic: u32,
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
    alphaHash: f32,
    specularColor: vec3<f32>,
    normalScale: vec2<f32>,
    bumpScale: f32,
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
    bumpTextureCoordinatesTransform: vec4<f32>,
    bumpTextureCoordinatesMetadata: vec4<f32>,
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
    alphaChannel: f32,
    metallicTextureCoordinatesTransform: vec4<f32>,
    metallicTextureCoordinatesMetadata: vec4<f32>,
    roughnessTextureCoordinatesTransform: vec4<f32>,
    roughnessTextureCoordinatesMetadata: vec4<f32>,
    alphaTextureCoordinatesTransform: vec4<f32>,
    alphaTextureCoordinatesMetadata: vec4<f32>,
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
    @location(7) positionOSAndViewZ: vec4<f32>,
    @location(5) uv1_: vec2<f32>,
    @location(8) uv2_: vec2<f32>,
    @location(9) uv3_: vec2<f32>,
    @location(10) uv4_: vec2<f32>,
    @location(11) uv5_: vec2<f32>,
    @location(12) uv6And7_: vec4<f32>,
    @location(6) ndc: vec4<f32>,
    @location(13) @interpolate(flat) transmissionBasis1_: vec4<f32>,
}

struct StandardPbrOutput {
    @location(0) color: vec4<f32>,
}

struct TemporalVsOut {
    @location(10) positionOS: vec3<f32>,
    @location(11) clippingPositionWS: vec3<f32>,
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
const PROJECTOR_FLAGX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX: u32 = 1073741824u;
const KIND_POINTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: u32 = 0u;
const KIND_SPOTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: u32 = 1u;
const PROJECTOR_FLAGX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: i32 = 1073741824i;
const TILE_MASKX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: i32 = 1073741823i;
const KIND_RECT_AREAX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX: u32 = 2u;

@id(64000) override standardTextureMask: u32 = 2097151u;

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
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(3) @binding(0) 
var<storage> instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(1) @binding(0) 
var<uniform> material: MaterialParameters;
@group(1) @binding(1) 
var baseColorTexture_sampler: sampler;
@group(1) @binding(2) 
var baseColorTexture_1: texture_2d<f32>;
@group(1) @binding(3) 
var metallicRoughnessTexture_sampler: sampler;
@group(1) @binding(4) 
var metallicRoughnessTexture: texture_2d<f32>;
@group(1) @binding(17) 
var metallicTexture_sampler: sampler;
@group(1) @binding(18) 
var metallicTexture: texture_2d<f32>;
@group(1) @binding(19) 
var roughnessTexture_sampler: sampler;
@group(1) @binding(20) 
var roughnessTexture: texture_2d<f32>;
@group(1) @binding(21) 
var alphaTexture_sampler: sampler;
@group(1) @binding(22) 
var alphaTexture_1: texture_2d<f32>;
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
@group(1) @binding(30) 
var transmissionBackdropTexture: texture_2d<f32>;
@group(1) @binding(23) 
var irradianceMap_2: texture_cube<f32>;
@group(1) @binding(24) 
var irradianceSampler_2: sampler;
@group(1) @binding(25) 
var prefilterMap_2: texture_cube<f32>;
@group(1) @binding(26) 
var prefilterSampler_2: sampler;
@group(1) @binding(27) 
var brdfLut_4: texture_2d<f32>;
@group(1) @binding(28) 
var<uniform> skylight: SkylightUniformsX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX;
@group(1) @binding(47) 
var skylightPrefilterMap_1: texture_cube<f32>;
@group(2) @binding(1) 
var<storage> palette: array<mat4x4<f32>>;
@group(2) @binding(2) 
var<storage> previousPalette: array<mat4x4<f32>>;
@group(2) @binding(7) 
var ssaoBlurredTexture: texture_2d<f32>;
@group(2) @binding(8) 
var ssaoBlurredSampler: sampler;

fn inverseRotateEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(direction: vec3<f32>, rotation: vec4<f32>) -> vec3<f32> {
    let q = normalize(rotation);
    let t = (2f * cross(q.xyz, direction));
    return ((direction - (q.w * t)) + cross(q.xyz, t));
}

fn fresnelSchlickRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(cosTheta: f32, F0_: vec3<f32>, roughness: f32) -> vec3<f32> {
    let oneMinusRough = max(vec3((1f - roughness)), F0_);
    let cosineComplement = clamp((1f - cosTheta), 0f, 1f);
    let squared = (cosineComplement * cosineComplement);
    return (F0_ + ((oneMinusRough - F0_) * ((squared * squared) * cosineComplement)));
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
    let local_40 = (_e55 * probeIntensity);
    let _e58 = sky;
    return mix(_e58, local_40, weight);
}

fn probe_sh9X_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX(shPreblend: array<vec4<f32>, 9>, normal_4: vec3<f32>) -> vec3<f32> {
    var result: vec3<f32> = vec3(0f);
    var band: u32 = 0u;

    let x_3 = normal_4.x;
    let y_3 = normal_4.y;
    let z = normal_4.z;
    let basis = array<f32, 9>(0.2820948f, (0.48860252f * y_3), (0.48860252f * z), (0.48860252f * x_3), ((1.0925485f * x_3) * y_3), ((1.0925485f * y_3) * z), (0.31539157f * (((3f * z) * z) - 1f)), ((1.0925485f * x_3) * z), (0.54627424f * ((x_3 * x_3) - (y_3 * y_3))));
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
    let local_41 = (max(_e2, vec3(0f)) * PROBE_INV_PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX);
    let skyResidualFraction = (1f - localBlendFraction);
    return ((((local_41 + (skyResidualFraction * e_sky)) * k_d) * albedo) * (1f - metallic));
}

fn cloud_direct_solar_factorX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX(worldPosition_2: vec3<f32>, shadowOrigin: vec3<f32>, shadowRight: vec3<f32>, shadowUp: vec3<f32>, shadowProjection: vec4<f32>) -> f32 {
    var local_3: bool;
    var local_4: bool;
    var local_5: bool;
    var local_6: bool;
    var local_7: bool;
    var local_8: bool;
    var local_9: bool;
    var local_10: bool;

    if (worldPosition_2.x == worldPosition_2.x) {
        local_3 = (worldPosition_2.y == worldPosition_2.y);
    } else {
        local_3 = false;
    }
    let _e10 = local_3;
    if _e10 {
        local_4 = (worldPosition_2.z == worldPosition_2.z);
    } else {
        local_4 = false;
    }
    let _e17 = local_4;
    if _e17 {
        local_5 = all((abs(worldPosition_2) < vec3(3.402823e38f)));
    } else {
        local_5 = false;
    }
    let validReceiver = local_5;
    let offset = (worldPosition_2 - shadowOrigin);
    let uv_3 = ((vec2<f32>(dot(offset, shadowRight), dot(offset, shadowUp)) / vec2(max(shadowProjection.x, 0.000001f))) + vec2(0.5f));
    if all((uv_3 >= vec2(0f))) {
        local_6 = all((uv_3 <= vec2(1f)));
    } else {
        local_6 = false;
    }
    let inRange = local_6;
    if (shadowProjection.y > 0.5f) {
        local_7 = (shadowProjection.z < 0.5f);
    } else {
        local_7 = false;
    }
    let _e64 = local_7;
    if _e64 {
        local_8 = (shadowProjection.x > 0f);
    } else {
        local_8 = false;
    }
    let available = local_8;
    let _e80 = textureSampleLevel(cloudShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX, cloudShadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX, clamp(uv_3, vec2(0f), vec2(1f)), 0f);
    let sampled = _e80.x;
    if validReceiver {
        local_9 = inRange;
    } else {
        local_9 = false;
    }
    let _e88 = local_9;
    if _e88 {
        local_10 = available;
    } else {
        local_10 = false;
    }
    let _e92 = local_10;
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

fn f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH: f32, f0_1: vec3<f32>) -> vec3<f32> {
    let fresnel = exp2((((-5.55473f * vDotH) - 6.98316f) * vDotH));
    return ((f0_1 * (vec3(1f) - vec3(fresnel))) + vec3(fresnel));
}

fn sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_4: f32, dotNV: f32) -> vec2<f32> {
    let uv_4 = clamp(vec2<f32>(roughness_4, dotNV), vec2(0f), vec2(1f));
    let samplePosition = ((uv_4 * 16f) - vec2(0.5f));
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
    let roughness_10 = sqrt(max(alphaSq, 0f));
    let _e31 = threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_10, nDotV_2, nDotL_3, F0_5);
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
    let clip_3 = (lightViewProj * vec4<f32>(worldPos_1, 1f));
    let invW = select((1f / clip_3.w), 0f, (abs(clip_3.w) < 0.000001f));
    return vec2<f32>((((clip_3.x * invW) * 0.5f) + 0.5f), (((clip_3.y * invW) * -0.5f) + 0.5f));
}

fn spotModifierProductX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX(brdf: f32, range: f32, cone: f32, ies: f32, cookie: f32, shadow: f32) -> f32 {
    return (((((brdf * range) * cone) * ies) * cookie) * shadow);
}

fn sample_shadow_2d_kernelX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMap: texture_depth_2d, shadowSampler: sampler_comparison, uv: vec2<f32>, texel: vec2<f32>, depthRef: f32, normalBias: f32, depthBias: f32, nDotL_2: f32, kernelSize: f32) -> f32 {
    var blocked: f32 = 0f;
    var samples: f32 = 0f;
    var y: i32 = -2i;
    var x: i32;
    var local_11: bool;

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
                        local_11 = (abs(_e35) <= halfWidth_4);
                    } else {
                        local_11 = false;
                    }
                    let _e41 = local_11;
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
    let roughness_11 = sqrt(max(alphaSq_1, 0f));
    let _e31 = threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_11, nDotV_3, nDotL_4, F0_6);
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
    var local_12: bool;
    var local_13: bool;
    var local_14: bool;
    var local_15: bool;

    let _e13 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(lightPos_6, lightDir_3, colorTimesIntensity_5, cosInner_3, cosOuter_3, invRangeSquared_8, worldPos_7, normal_10, viewDir_4, baseColor_6, metallic_5, alphaSq_4, F0_9);
    let splane = (lightViewProj_1 * vec4<f32>(worldPos_7, 1f));
    let invW_1 = select((1f / splane.w), 0f, (abs(splane.w) < 0.000001f));
    let _e27 = projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(lightViewProj_1, worldPos_7);
    let depthRef_1 = (splane.z * invW_1);
    if (_e27.x >= 0f) {
        local_12 = (_e27.x <= 1f);
    } else {
        local_12 = false;
    }
    let _e39 = local_12;
    if _e39 {
        local_13 = (_e27.y >= 0f);
    } else {
        local_13 = false;
    }
    let _e46 = local_13;
    if _e46 {
        local_14 = (_e27.y <= 1f);
    } else {
        local_14 = false;
    }
    let _e53 = local_14;
    if _e53 {
        local_15 = (depthRef_1 <= 1f);
    } else {
        local_15 = false;
    }
    let _e59 = local_15;
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
    var local_16: bool;
    var local_17: bool;
    var local_18: bool;
    var local_19: bool;
    var local_20: bool;

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
            local_17 = ((metadata.y & PROJECTOR_FLAGX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPW233ENFTGSZLSOMX) == 0u);
        } else {
            local_17 = true;
        }
        let _e90 = local_17;
        local_16 = _e90;
    } else {
        local_16 = false;
    }
    let _e94 = local_16;
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
                local_18 = (cookieUv.x > 1f);
            } else {
                local_18 = true;
            }
            let _e137 = local_18;
            if !(_e137) {
                local_19 = (cookieUv.y < 0f);
            } else {
                local_19 = true;
            }
            let _e145 = local_19;
            if !(_e145) {
                local_20 = (cookieUv.y > 1f);
            } else {
                local_20 = true;
            }
            let _e153 = local_20;
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
    var local_21: bool;
    var local_22: bool;
    var local_23: bool;

    let _e2 = projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(lightViewProj_2, world_pos);
    if (_e2.x >= 0f) {
        local_21 = (_e2.x <= 1f);
    } else {
        local_21 = false;
    }
    let _e12 = local_21;
    if _e12 {
        local_22 = (_e2.y >= 0f);
    } else {
        local_22 = false;
    }
    let _e19 = local_22;
    if _e19 {
        local_23 = (_e2.y <= 1f);
    } else {
        local_23 = false;
    }
    let _e26 = local_23;
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
    let x_4 = clamp(dot(v1_, v2_), -1f, 1f);
    let y_4 = abs(x_4);
    let a_2 = (0.8543985f + ((0.4965155f + (0.0145206f * y_4)) * y_4));
    let b = (3.417594f + ((4.1616726f + y_4) * y_4));
    let rational = (a_2 / b);
    let thetaOverSinTheta = select(((0.5f * inverseSqrt(max((1f - (x_4 * x_4)), 0.0000001f))) - rational), rational, (x_4 > 0f));
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
        let fallback_2 = select(vec3<f32>(0f, 1f, 0f), vec3<f32>(1f, 0f, 0f), (abs(n_1.x) < 0.9f));
        tangent = normalize(cross(fallback_2, n_1));
    }
    let _e53 = tangent;
    let bitangent = -(cross(n_1, _e53));
    let _e57 = tangent;
    let transform_4 = (mInv * transpose(mat3x3<f32>(_e57, bitangent, n_1)));
    let c0_ = normalize((transform_4 * (rect0_ - worldPos_9)));
    let c1_ = normalize((transform_4 * (rect1_ - worldPos_9)));
    let c2_ = normalize((transform_4 * (rect2_ - worldPos_9)));
    let c3_ = normalize((transform_4 * (rect3_ - worldPos_9)));
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
    let identity_1 = mat3x3<f32>(vec3<f32>(1f, 0f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 0f, 1f));
    let _e21 = ltcEvaluateX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(n_2, v_2, worldPos_11, identity_1, lightPos_10, axisX_1, axisY_1, halfWidth_1, halfHeight_1);
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

fn evaluate_cluster_lightX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(light: DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX, world_pos_1: vec3<f32>, normal_11: vec3<f32>, view_dir: vec3<f32>, base_color: vec3<f32>, metallic_9: f32, alpha_sq: f32, f0_2: vec3<f32>, flat_2d: bool, receive_shadows: bool) -> vec3<f32> {
    var projector_selected: bool = false;
    var tile: i32;
    var local_24: bool;
    var local_25: bool;

    let kind = light.metadata.x;
    if (kind == KIND_POINTX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) {
        if flat_2d {
            let _e15 = evalPointFlatX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.colorTimesIntensity.xyz, light.position.w, world_pos_1, base_color);
            return _e15;
        }
        let _e27 = evalPointX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.colorTimesIntensity.xyz, light.position.w, world_pos_1, normal_11, view_dir, base_color, metallic_9, alpha_sq, f0_2);
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
            local_24 = ((encoded_tile & PROJECTOR_FLAGX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) != 0i);
        } else {
            local_24 = false;
        }
        let _e70 = local_24;
        if _e70 {
            projector_selected = true;
            tile = (encoded_tile & TILE_MASKX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX);
        }
        let _e75 = tile;
        if (_e75 >= 0i) {
            let _e78 = tile;
            local_25 = (_e78 < 4i);
        } else {
            local_25 = false;
        }
        let _e84 = local_25;
        if _e84 {
            let _e99 = tile;
            let _e101 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj[_e99];
            let _e102 = tile;
            let _e110 = evalSpotShadowedX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.direction.xyz, light.colorTimesIntensity.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos_1, normal_11, view_dir, base_color, metallic_9, alpha_sq, f0_2, _e101, _e102, 0.005f, 0.05f, 3f, select(0f, 1f, receive_shadows));
            let _e116 = tile;
            let _e118 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.spotLightViewProj[_e116];
            let _e120 = sampleStandardSpotProjectorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXG4DPORPXA4TPNJSWG5DPOIX(_e118, world_pos_1, light.metadata);
            let _e121 = projector_selected;
            return ((_e110 * modifier) * select(vec3(1f), _e120, _e121));
        }
        let _e136 = evalSpotX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA5LOMN2HKYLMX(light.position.xyz, light.direction.xyz, light.colorTimesIntensity.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos_1, normal_11, view_dir, base_color, metallic_9, alpha_sq, f0_2);
        return (_e136 * modifier);
    }
    if (kind == KIND_RECT_AREAX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX) {
        let _e154 = evalRectAreaLtcGgxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXEZLDORPWC4TFMEX(light.position.xyz, light.colorTimesIntensity.xyz, light.auxiliary.xyz, light.direction.xyz, light.colorTimesIntensity.w, light.direction.w, light.position.w, world_pos_1, normal_11, view_dir, base_color, metallic_9, alpha_sq, f0_2);
        return _e154;
    }
    return vec3(0f);
}

fn evaluateStandardClusterLightsX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(ndc_1: vec3<f32>, view_z_2: f32, world_pos_2: vec3<f32>, normal_12: vec3<f32>, view_dir_1: vec3<f32>, base_color_1: vec3<f32>, metallic_10: f32, alpha_sq_1: f32, f0_3: vec3<f32>, flat_2d_1: bool, receive_shadows_1: bool) -> vec3<f32> {
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
            let _e70 = evaluate_cluster_lightX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(light_1, world_pos_2, normal_12, view_dir_1, base_color_1, metallic_10, alpha_sq_1, f0_3, flat_2d_1, receive_shadows_1);
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

fn evaluateStandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(worldPosition_4: vec3<f32>, normal_13: vec3<f32>, direction_2: vec3<f32>, albedo_1: vec3<f32>, metallic_11: f32, roughness_7: f32, f0_4: vec3<f32>, sky_1: SkylightUniformsX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX, irradianceMap_1: texture_cube<f32>, irradianceSampler_1: sampler, prefilterMap_1: texture_cube<f32>, prefilterSampler_1: sampler, brdfLut_3: texture_2d<f32>, skylightPrefilterMap: texture_cube<f32>, sh: array<vec4<f32>, 9>, localBlend: f32) -> StandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX {
    var irradiance: vec3<f32>;
    var specular: vec3<f32>;
    var diffuse: vec3<f32>;

    if (sky_1.intensity < 0f) {
        let _e8 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_13, sky_1.diffuseRotation, irradianceMap_1, irradianceSampler_1);
        irradiance = _e8;
        let _e42 = sampleReflectionProbeSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_13, direction_2, roughness_7, f0_4, worldPosition_4, vec3<f32>(sky_1.colorR, sky_1.colorG, sky_1.colorB), sky_1.rotation.xyz, vec4<f32>(0f, 0f, 0f, 1f), prefilterMap_1, prefilterSampler_1, brdfLut_3, irradianceSampler_1, skylightPrefilterMap, sky_1.diffuseRotation, sky_1.diffuseScale.xyz, max((-(sky_1.intensity) - 1f), 0f), (sky_1.rotation.w > 0.5f));
        specular = _e42;
    } else {
        let _e45 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_13, sky_1.rotation, irradianceMap_1, irradianceSampler_1);
        irradiance = _e45;
        let _e47 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(normal_13, direction_2, roughness_7, f0_4, sky_1.rotation, prefilterMap_1, prefilterSampler_1, brdfLut_3, irradianceSampler_1);
        specular = _e47;
    }
    let tint = vec3<f32>(sky_1.colorR, sky_1.colorG, sky_1.colorB);
    let diffuseScale = select((tint * sky_1.intensity), sky_1.diffuseScale.xyz, (sky_1.intensity < 0f));
    let _e63 = fresnelSchlickRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(max(dot(normal_13, direction_2), 0f), f0_4, roughness_7);
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
    let _e98 = projectSpecularRadianceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(vec3(1f), normal_13, direction_2, roughness_7, f0_4, brdfLut_3, irradianceSampler_1);
    return StandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(_e91, (_e92 * _e94), _e98);
}

fn evaluateStandardDirectX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(worldPosition_5: vec3<f32>, ndc_2: vec3<f32>, viewZ: f32, normal_14: vec3<f32>, direction_3: vec3<f32>, albedo_2: vec3<f32>, metallic_12: f32, alpha: f32, f0_5: vec3<f32>, shadow_1: f32) -> vec3<f32> {
    var direct: vec3<f32>;

    let _e6 = evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_14, direction_3, albedo_2, metallic_12, alpha, f0_5);
    let _e11 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowOrigin;
    let _e15 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowRight;
    let _e19 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowUp;
    let _e23 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cloudShadowProjection;
    let _e25 = cloud_apply_direct_solarX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX((shadow_1 * _e6), worldPosition_5, _e11.xyz, _e15.xyz, _e19.xyz, _e23);
    direct = _e25;
    let _e27 = direct;
    let _e32 = evaluateStandardClusterLightsX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(ndc_2, viewZ, worldPosition_5, normal_14, direction_3, albedo_2, metallic_12, alpha, f0_5, false, true);
    direct = (_e27 + _e32);
    let _e34 = direct;
    return _e34;
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

fn clippedByPlanesX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS: vec3<f32>, planes: array<vec4<f32>, 6>, control: vec4<f32>) -> bool {
    var allOutside: bool;
    var anyOutside: bool = false;
    var index: u32 = 0u;
    var local_26: bool;
    var local_27: bool;

    let count_5 = min(u32(max(control.x, 0f)), 6u);
    allOutside = (count_5 > 0u);
    loop {
        let _e13 = index;
        if (_e13 < count_5) {
        } else {
            break;
        }
        {
            let _e17 = index;
            let _e21 = index;
            let outside = ((dot(planes[_e17].xyz, positionWS) + planes[_e21].w) < 0f);
            let _e28 = anyOutside;
            if !(_e28) {
                local_26 = outside;
            } else {
                local_26 = true;
            }
            let _e33 = local_26;
            anyOutside = _e33;
            let _e34 = allOutside;
            if _e34 {
                local_27 = outside;
            } else {
                local_27 = false;
            }
            let _e38 = local_27;
            allOutside = _e38;
        }
        continuing {
            let _e40 = index;
            index = (_e40 + 1u);
        }
    }
    let _e42 = anyOutside;
    let _e43 = allOutside;
    return select(_e42, _e43, (control.y > 0.5f));
}

fn applyLocalClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS_1: vec3<f32>, shadow_2: bool, planes_1: array<vec4<f32>, 6>, control_1: vec4<f32>) {
    var local_28: bool;
    var local_29: bool;

    if !(!(shadow_2)) {
        local_28 = (control_1.z > 0.5f);
    } else {
        local_28 = true;
    }
    let _e10 = local_28;
    if _e10 {
        let _e13 = clippedByPlanesX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS_1, planes_1, control_1);
        local_29 = _e13;
    } else {
        local_29 = false;
    }
    let _e17 = local_29;
    if _e17 {
        discard;
    } else {
        return;
    }
}

fn applyViewClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS_2: vec3<f32>, shadow_3: bool) {
    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.clippingPlanes;
    let _e5 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.clippingControl;
    applyLocalClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS_2, shadow_3, _e2, _e5);
    return;
}

fn get_ssao_intensityX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX() -> f32 {
    let _e3 = cluster_uniformX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX.near_far_log.w;
    return _e3;
}

fn sampleStandardAmbientOcclusionX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(worldPosition_6: vec3<f32>, worldViewProjection: mat4x4<f32>, aoTexture: texture_2d<f32>, aoSampler: sampler) -> f32 {
    let _e0 = get_ssao_intensityX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX();
    if (_e0 <= 0f) {
        return 1f;
    }
    let clip_4 = (worldViewProjection * vec4<f32>(worldPosition_6, 1f));
    let uv_5 = (((clip_4.xy / vec2(clip_4.w)) * vec2<f32>(0.5f, -0.5f)) + vec2(0.5f));
    let _e23 = textureSampleLevel(aoTexture, aoSampler, uv_5, 0f);
    return pow(clamp(_e23.x, 0f, 1f), _e0);
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
    var local_30: bool;

    let nDotL_6 = dot(normal_15, l);
    let depthSpan = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[layer_3].z;
    if (nDotL_6 > 0.01f) {
        local_30 = (depthSpan > 0f);
    } else {
        local_30 = false;
    }
    let _e16 = local_30;
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
    var local_31: bool;
    var local_32: bool;
    var local_33: bool;
    var local_34: bool;
    var blocked_1: f32 = 0f;
    var local_35: bool;
    var x_1: i32 = -1i;
    var y_1: i32;
    var x_2: i32 = -2i;
    var y_2: i32;

    let _e4 = _cascadeLightViewProjX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_4);
    let lightClip = (_e4 * vec4<f32>(worldPos_14, 1f));
    let projCoords = (lightClip.xyz / vec3(lightClip.w));
    let _e14 = _atlasTileScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(count_4);
    let _e15 = _atlasTileOriginX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(layer_4, count_4);
    let tileUv = vec2<f32>(((projCoords.x * 0.5f) + 0.5f), ((-(projCoords.y) * 0.5f) + 0.5f));
    let uv_6 = ((tileUv * _e14) + _e15);
    let currentDepth = projCoords.z;
    if (tileUv.x >= 0f) {
        local_31 = (tileUv.x <= 1f);
    } else {
        local_31 = false;
    }
    let _e40 = local_31;
    if _e40 {
        local_32 = (tileUv.y >= 0f);
    } else {
        local_32 = false;
    }
    let _e47 = local_32;
    if _e47 {
        local_33 = (tileUv.y <= 1f);
    } else {
        local_33 = false;
    }
    let _e54 = local_33;
    if _e54 {
        local_34 = (currentDepth <= 1f);
    } else {
        local_34 = false;
    }
    let _e60 = local_34;
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
        let lit_1 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, clamp(uv_6, tileLo, tileHi), adjustedDepth_1);
        return lit_1;
    }
    if (kernel == 3u) {
        if all((uv_6 >= (tileLo + texel_2))) {
            local_35 = all((uv_6 <= (tileHi - texel_2)));
        } else {
            local_35 = false;
        }
        let interior = local_35;
        if interior {
            let pcfFraction = fract(((uv_6 / texel_2) - vec2(0.5f)));
            let loWeight = (vec2(2f) - pcfFraction);
            let hiWeight = (vec2(1f) + pcfFraction);
            let loOffset = ((vec2(-1f) - pcfFraction) + (vec2(1f) / loWeight));
            let hiOffset = ((vec2(1f) - pcfFraction) + (pcfFraction / hiWeight));
            let litLoLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_6 + (vec2<f32>(loOffset.x, loOffset.y) * texel_2)), adjustedDepth_1);
            let litHiLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_6 + (vec2<f32>(hiOffset.x, loOffset.y) * texel_2)), adjustedDepth_1);
            let litLoHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_6 + (vec2<f32>(loOffset.x, hiOffset.y) * texel_2)), adjustedDepth_1);
            let litHiHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_6 + (vec2<f32>(hiOffset.x, hiOffset.y) * texel_2)), adjustedDepth_1);
            return ((((((litLoLo * loWeight.x) * loWeight.y) + ((litHiLo * hiWeight.x) * loWeight.y)) + ((litLoHi * loWeight.x) * hiWeight.y)) + ((litHiHi * hiWeight.x) * hiWeight.y)) / 9f);
        }
        loop {
            let _e199 = x_1;
            if (_e199 <= 1i) {
            } else {
                break;
            }
            {
                y_1 = -1i;
                loop {
                    let _e204 = y_1;
                    if (_e204 <= 1i) {
                    } else {
                        break;
                    }
                    {
                        let _e207 = x_1;
                        let _e209 = y_1;
                        let offsetUv_1 = clamp((uv_6 + (vec2<f32>(f32(_e207), f32(_e209)) * texel_2)), tileLo, tileHi);
                        let lit_2 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv_1, adjustedDepth_1);
                        let _e219 = blocked_1;
                        blocked_1 = (_e219 + (1f - lit_2));
                    }
                    continuing {
                        let _e224 = y_1;
                        y_1 = (_e224 + 1i);
                    }
                }
            }
            continuing {
                let _e227 = x_1;
                x_1 = (_e227 + 1i);
            }
        }
        let _e229 = blocked_1;
        return (1f - (_e229 / 9f));
    }
    loop {
        let _e235 = x_2;
        if (_e235 <= 2i) {
        } else {
            break;
        }
        {
            y_2 = -2i;
            loop {
                let _e240 = y_2;
                if (_e240 <= 2i) {
                } else {
                    break;
                }
                {
                    let _e243 = x_2;
                    let _e245 = y_2;
                    let offsetUv_2 = clamp((uv_6 + (vec2<f32>(f32(_e243), f32(_e245)) * texel_2)), tileLo, tileHi);
                    let lit_3 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv_2, adjustedDepth_1);
                    let _e254 = blocked_1;
                    blocked_1 = (_e254 + (1f - lit_3));
                }
                continuing {
                    let _e259 = y_2;
                    y_2 = (_e259 + 1i);
                }
            }
        }
        continuing {
            let _e262 = x_2;
            x_2 = (_e262 + 1i);
        }
    }
    let _e264 = blocked_1;
    return (1f - (_e264 / 25f));
}

fn evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_17: vec3<f32>, worldPos_15: vec3<f32>, viewZ_1: f32) -> f32 {
    var shadow_4: f32;
    var local_36: bool;

    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeCount;
    if (_e2 < 1f) {
        return 1f;
    }
    let _e8 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightDir;
    let l_6 = normalize(-(_e8));
    let _e13 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeCount;
    let count_6 = u32(max(_e13, 1f));
    let viewDepth_1 = -(viewZ_1);
    let _e25 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[(count_6 - 1u)].x;
    if (viewDepth_1 > _e25) {
        return 1f;
    }
    let _e28 = _pickCascadeLayerX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(viewDepth_1, count_6);
    let _e33 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.normalBias;
    let receiverPosition = (worldPos_15 + (normal_17 * _e33));
    let _e36 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(receiverPosition, _e28, count_6, normal_17, l_6);
    shadow_4 = _e36;
    let _e40 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
    if (_e40 > 0f) {
        local_36 = ((_e28 + 1u) < count_6);
    } else {
        local_36 = false;
    }
    let _e49 = local_36;
    if _e49 {
        let spCurr = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[_e28].x;
        let _e57 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
        let blendWidth = (spCurr * _e57);
        if (blendWidth > 0f) {
            let dist = (spCurr - viewDepth_1);
            let t_1 = clamp((1f - (dist / blendWidth)), 0f, 1f);
            if (t_1 > 0f) {
                let _e72 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(receiverPosition, (_e28 + 1u), count_6, normal_17, l_6);
                shadow_4 = mix(_e36, _e72, t_1);
            }
        }
    }
    let _e74 = shadow_4;
    return _e74;
}

fn encodeStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(normal_18: vec3<f32>, roughness_8: f32) -> u32 {
    var oct: vec2<f32>;

    let n_5 = normalize(normal_18);
    oct = (n_5.xy / vec2(((abs(n_5.x) + abs(n_5.y)) + abs(n_5.z))));
    if (n_5.z < 0f) {
        let _e17 = oct;
        let _e27 = oct;
        oct = ((vec2(1f) - abs(_e17.yx)) * select(vec2(-1f), vec2(1f), (_e27 >= vec2(0f))));
    }
    let _e33 = oct;
    let uv_7 = vec2<u32>(round((clamp(((_e33 * 0.5f) + vec2(0.5f)), vec2(0f), vec2(1f)) * 4095f)));
    return ((uv_7.x | (uv_7.y << 12u)) | (u32(round((clamp(roughness_8, 0f, 1f) * 255f))) << 24u));
}

fn encodeStandardReflectanceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(rgb: vec3<f32>, alpha_1: f32) -> u32 {
    return pack4x8unorm(vec4<f32>(sqrt(clamp(rgb, vec3(0f), vec3(1f))), alpha_1));
}

fn encodeStandardGBufferX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(normal_19: vec3<f32>, roughness_9: f32, albedo_3: vec3<f32>, metallic_13: f32, f0_6: vec3<f32>, occlusion: f32, emissive: vec3<f32>, opacity: f32, reflection: u32, probeRow_1: u32) -> GBufferOutputX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX {
    let _e5 = encodeStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(normal_19, roughness_9);
    let _e8 = encodeStandardReflectanceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(f0_6, occlusion);
    let _e11 = encodeStandardReflectanceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(albedo_3, metallic_13);
    return GBufferOutputX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(vec4<f32>(emissive, opacity), _e5, _e8, _e11, ((reflection << 24u) | probeRow_1));
}

fn alphaHash2DX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(value: vec2<f32>) -> f32 {
    return fract(((10000f * sin(((17f * value.x) + (0.1f * value.y)))) * (0.1f + abs(sin(((13f * value.y) + value.x))))));
}

fn alphaHash3DX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(value_1: vec3<f32>) -> f32 {
    let _e2 = alphaHash2DX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(value_1.xy);
    let _e5 = alphaHash2DX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(vec2<f32>(_e2, value_1.z));
    return _e5;
}

fn alphaHashThresholdX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(position: vec3<f32>, derivative: f32) -> f32 {
    var threshold: f32;

    let scale_1 = (1f / max((0.05f * derivative), 0.000001f));
    let level = log2(scale_1);
    let _e13 = alphaHash3DX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(floor((exp2(floor(level)) * position)));
    let _e18 = alphaHash3DX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(floor((exp2(ceil(level)) * position)));
    let noise = vec2<f32>(_e13, _e18);
    let t_2 = fract(level);
    let x_5 = mix(noise.x, noise.y, t_2);
    let a_3 = min(t_2, (1f - t_2));
    threshold = x_5;
    if (a_3 > 0f) {
        if (x_5 < a_3) {
            threshold = ((x_5 * x_5) / ((2f * a_3) * (1f - a_3)));
        } else {
            if (x_5 < (1f - a_3)) {
                threshold = ((x_5 - (0.5f * a_3)) / (1f - a_3));
            } else {
                threshold = (1f - (((1f - x_5) * (1f - x_5)) / ((2f * a_3) * (1f - a_3))));
            }
        }
    }
    let _e60 = threshold;
    return clamp(_e60, 0.000001f, 1f);
}

fn applyAlphaHashX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(alpha_2: f32, position_1: vec3<f32>, enabled: f32) {
    let _e1 = dpdx(position_1);
    let _e3 = dpdy(position_1);
    let derivative_1 = max(length(_e1), length(_e3));
    if (enabled > 0.5f) {
        let _e9 = alphaHashThresholdX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(position_1, derivative_1);
        if (alpha_2 < _e9) {
            discard;
        } else {
            return;
        }
    } else {
        return;
    }
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

fn packSceneTemporalV1WithValidityX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip: vec4<f32>, previousClip: vec4<f32>, temporalProjection_2: vec4<f32>, reactive: f32, motionValid: bool) -> vec4<f32> {
    let _e1 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip);
    let _e3 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(previousClip);
    let _e6 = sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip, temporalProjection_2);
    return vec4<f32>((_e1 - _e3), _e6, (clamp(reactive, 0f, 1f) + select(0f, 2f, !(motionValid))));
}

fn transformedPbrTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(transform: vec4<f32>, metadata_2: vec4<f32>, uv0_: vec2<f32>, uv1_: vec2<f32>, uv2_: vec2<f32>, uv3_: vec2<f32>, uv4_: vec2<f32>, uv5_: vec2<f32>, uv6_: vec2<f32>, uv7_: vec2<f32>) -> vec2<f32> {
    var source: vec2<f32>;

    source = uv0_;
    if (metadata_2.x >= 1f) {
        source = uv1_;
    }
    if (metadata_2.x >= 2f) {
        source = uv2_;
    }
    if (metadata_2.x >= 3f) {
        source = uv3_;
    }
    if (metadata_2.x >= 4f) {
        source = uv4_;
    }
    if (metadata_2.x >= 5f) {
        source = uv5_;
    }
    if (metadata_2.x >= 6f) {
        source = uv6_;
    }
    if (metadata_2.x >= 7f) {
        source = uv7_;
    }
    let _e32 = source;
    let scaled = (_e32 * transform.zw);
    let angle = metadata_2.y;
    let c = cos(angle);
    let s = sin(angle);
    return (vec2<f32>(((scaled.x * c) - (scaled.y * s)), ((scaled.x * s) + (scaled.y * c))) + transform.xy);
}

fn resolvePbrTemporalReactiveX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(reactive_1: f32, baseColorAlpha: f32, sampledAlpha: f32) -> f32 {
    let coverage_1 = clamp((baseColorAlpha * sampledAlpha), 0f, 1f);
    let coverageReactive = (1f - coverage_1);
    return max(clamp(reactive_1, 0f, 1f), coverageReactive);
}

fn projectPbrSceneTemporalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(baseColorAlpha_1: f32, alphaCutoff: f32, alphaHash: f32, positionOS: vec3<f32>, baseColorTextureEnabled: bool, baseColorTexture: texture_2d<f32>, baseColorSampler: sampler, transform_1: vec4<f32>, metadata_3: vec4<f32>, alphaTextureEnabled: bool, alphaTexture: texture_2d<f32>, alphaSampler: sampler, alphaTransform: vec4<f32>, alphaMetadata: vec4<f32>, alphaChannel: f32, currentClip_1: vec4<f32>, previousClip_1: vec4<f32>, temporalProjection_3: vec4<f32>, reactive_2: f32, motionValid_1: bool, uv0_1: vec2<f32>, uv1_1: vec2<f32>, uv2_1: vec2<f32>, uv3_1: vec2<f32>, uv4_1: vec2<f32>, uv5_1: vec2<f32>, uv6_1: vec2<f32>, uv7_1: vec2<f32>) -> vec4<f32> {
    var baseSample: vec4<f32> = vec4(1f);
    var alphaSample: f32 = 1f;
    var local_37: bool;

    if baseColorTextureEnabled {
        let _e13 = transformedPbrTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(transform_1, metadata_3, uv0_1, uv1_1, uv2_1, uv3_1, uv4_1, uv5_1, uv6_1, uv7_1);
        let _e17 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, _e13, metadata_3.zw);
        baseSample = _e17;
    }
    if alphaTextureEnabled {
        let _e22 = transformedPbrTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(alphaTransform, alphaMetadata, uv0_1, uv1_1, uv2_1, uv3_1, uv4_1, uv5_1, uv6_1, uv7_1);
        let _e26 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(alphaTexture, alphaSampler, _e22, alphaMetadata.zw);
        switch u32(alphaChannel) {
            case 0u: {
                alphaSample = _e26.x;
            }
            case 1u: {
                alphaSample = _e26.y;
            }
            case 2u: {
                alphaSample = _e26.z;
            }
            default: {
                alphaSample = _e26.w;
            }
        }
    }
    let _e36 = baseSample.w;
    let _e38 = alphaSample;
    let coverage_2 = ((baseColorAlpha_1 * _e36) * _e38);
    applyAlphaHashX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX(coverage_2, positionOS, alphaHash);
    if (alphaCutoff > 0f) {
        local_37 = (coverage_2 <= alphaCutoff);
    } else {
        local_37 = false;
    }
    let _e49 = local_37;
    if _e49 {
        discard;
    }
    let _e52 = resolvePbrTemporalReactiveX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(reactive_2, coverage_2, 1f);
    let reactiveCoverage = select(_e52, reactive_2, (alphaHash > 0.5f));
    let _e60 = packSceneTemporalV1WithValidityX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip_1, previousClip_1, temporalProjection_3, reactiveCoverage, motionValid_1);
    return _e60;
}

fn decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(rg: vec2<f32>) -> vec3<f32> {
    let xy = ((rg * 2f) - vec2(1f));
    let z_1 = sqrt(saturate((1f - dot(xy, xy))));
    return vec3<f32>(xy, z_1);
}

fn scaleTangentSpaceNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(tn: vec3<f32>, scale: vec2<f32>) -> vec3<f32> {
    let scaled_1 = vec3<f32>((tn.xy * scale), tn.z);
    if (dot(scaled_1, scaled_1) < 0.00000000000000000001f) {
        return vec3<f32>(0f, 0f, 1f);
    }
    return scaled_1;
}

fn perturbBumpNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(positionWS_3: vec3<f32>, normalWS: vec3<f32>, heightGradient: vec2<f32>, faceDirection: f32) -> vec3<f32> {
    let dx = dpdx(positionWS_3);
    let dy = dpdy(positionWS_3);
    let sx = (dx * inverseSqrt(max(dot(dx, dx), 0.00000000000000000001f)));
    let sy = (dy * inverseSqrt(max(dot(dy, dy), 0.00000000000000000001f)));
    let r1_ = cross(sy, normalWS);
    let r2_ = cross(normalWS, sx);
    let determinant_ = (dot(sx, r1_) * faceDirection);
    let gradient = (sign(determinant_) * ((heightGradient.x * r1_) + (heightGradient.y * r2_)));
    let perturbed = ((abs(determinant_) * normalWS) - gradient);
    if (dot(perturbed, perturbed) < 0.00000000000000000001f) {
        return normalWS;
    }
    return normalize(perturbed);
}

fn applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(worldNormal: vec3<f32>, worldTangent: vec4<f32>, tn_1: vec3<f32>) -> vec3<f32> {
    let n0_ = normalize(worldNormal);
    let t0_ = normalize((worldTangent.xyz - (dot(worldTangent.xyz, n0_) * n0_)));
    let b0_ = (cross(n0_, t0_) * worldTangent.w);
    return normalize((((t0_ * tn_1.x) + (b0_ * tn_1.y)) + (n0_ * tn_1.z)));
}

fn materialTextureFilteringWitness() {
    let bumpWitness = textureSample(normalTexture, normalTexture_sampler, vec2(0f));
    let baseWitness = textureSample(baseColorTexture_1, baseColorTexture_sampler, vec2(0f));
    let metallicRoughnessWitness = textureSample(metallicRoughnessTexture, metallicRoughnessTexture_sampler, vec2(0f));
    let normalWitness = textureSample(normalTexture, normalTexture_sampler, vec2(0f));
    let emissiveWitness = textureSample(emissiveTexture, emissiveTexture_sampler, vec2(0f));
    let occlusionWitness = textureSample(occlusionTexture, occlusionTexture_sampler, vec2(0f));
    let transmissionWitness = textureSample(transmissionTexture, transmissionSampler, vec2(0f));
    let thicknessWitness = textureSample(thicknessTexture, thicknessSampler, vec2(0f));
    return;
}

fn vs_main_impl(in_5: VsIn, meshIndex: u32, instanceIndex: u32, paletteBase: u32, materialIndex: u32, materialAddress: vec3<u32>) -> VsOut {
    var out_1: VsOut;

    let _e7 = palette[(paletteBase + in_5.skinIndex.x)];
    let _e16 = palette[(paletteBase + in_5.skinIndex.y)];
    let _e26 = palette[(paletteBase + in_5.skinIndex.z)];
    let _e36 = palette[(paletteBase + in_5.skinIndex.w)];
    let skinMatrix = ((((_e7 * in_5.skinWeight.x) + (_e16 * in_5.skinWeight.y)) + (_e26 * in_5.skinWeight.z)) + (_e36 * in_5.skinWeight.w));
    let skinnedLocal = (skinMatrix * vec4<f32>(in_5.pos, 1f));
    let m0_ = skinMatrix[0].xyz;
    let m1_ = skinMatrix[1].xyz;
    let m2_ = skinMatrix[2].xyz;
    let skinNormal3x3_ = mat3x3<f32>(m0_, m1_, m2_);
    let phony = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[meshIndex].worldFromLocal;
    let phony_1 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[instanceIndex].localFromInstance;
    let _e66 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out_1.clip = (_e66 * skinnedLocal);
    let _e71 = out_1.clip;
    let _e74 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e75 = sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(_e71, _e74);
    out_1.positionOSAndViewZ = vec4<f32>(in_5.pos, _e75);
    out_1.worldPos = skinnedLocal.xyz;
    out_1.worldNormal = normalize((skinNormal3x3_ * in_5.normal));
    let worldTangentXyz = normalize((skinNormal3x3_ * in_5.tangent.xyz));
    out_1.worldTangent = vec4<f32>(worldTangentXyz, in_5.tangent.w);
    out_1.uv = in_5.uv;
    out_1.uv1_ = in_5.uv1_;
    out_1.uv2_ = in_5.uv2_;
    out_1.uv3_ = in_5.uv3_;
    out_1.uv4_ = in_5.uv4_;
    out_1.uv5_ = in_5.uv5_;
    out_1.uv6And7_ = vec4<f32>(in_5.uv6_, in_5.uv7_);
    out_1.transmissionBasis0_ = vec4<f32>(skinMatrix[0].xyz, skinMatrix[1].x);
    out_1.transmissionBasis1_ = vec4<f32>(skinMatrix[1].y, skinMatrix[1].z, skinMatrix[2].x, skinMatrix[2].y);
    let clipPos = out_1.clip;
    out_1.ndc = vec4<f32>((clipPos.xy / vec2(clipPos.w)), (clipPos.z / clipPos.w), skinMatrix[2].z);
    let _e136 = out_1;
    return _e136;
}

fn standardViewZ(in_6: VsOut) -> f32 {
    return in_6.positionOSAndViewZ.w;
}

fn transformedMaterialUv(transform_2: vec4<f32>, metadata_4: vec4<f32>, in_7: VsOut) -> vec2<f32> {
    var source_1: vec2<f32>;

    source_1 = in_7.uv;
    if (metadata_4.x >= 1f) {
        source_1 = in_7.uv1_;
    }
    if (metadata_4.x >= 2f) {
        source_1 = in_7.uv2_;
    }
    if (metadata_4.x >= 3f) {
        source_1 = in_7.uv3_;
    }
    if (metadata_4.x >= 4f) {
        source_1 = in_7.uv4_;
    }
    if (metadata_4.x >= 5f) {
        source_1 = in_7.uv5_;
    }
    if (metadata_4.x >= 6f) {
        source_1 = in_7.uv6And7_.xy;
    }
    if (metadata_4.x >= 7f) {
        source_1 = in_7.uv6And7_.zw;
    }
    let _e35 = source_1;
    let scaled_2 = (_e35 * transform_2.zw);
    let angle_1 = metadata_4.y;
    let c_1 = cos(angle_1);
    let s_1 = sin(angle_1);
    return (vec2<f32>(((scaled_2.x * c_1) - (scaled_2.y * s_1)), ((scaled_2.x * s_1) + (scaled_2.y * c_1))) + transform_2.xy);
}

fn materialVertexColor(in_8: VsOut) -> vec4<f32> {
    return vec4(1f);
}

fn standardSkinVariantIdentity() -> f32 {
    var identity: f32 = 0f;

    let _e2 = identity;
    identity = (_e2 + 1f);
    let _e5 = identity;
    identity = (_e5 + 2f);
    let _e8 = identity;
    identity = (_e8 + 16f);
    let _e11 = identity;
    identity = (_e11 + 32f);
    let _e14 = identity;
    return _e14;
}

fn standardUsesBaseColorTexture() -> bool {
    return ((standardTextureMask & 1u) != 0u);
}

fn surfaceUv(input: SurfaceInput, transform_3: vec4<f32>, metadata_5: vec4<f32>) -> vec2<f32> {
    var source_2: vec2<f32>;

    source_2 = input.uv0_;
    if (metadata_5.x >= 1f) {
        source_2 = input.uv1_;
    }
    if (metadata_5.x >= 2f) {
        source_2 = input.uv2_;
    }
    if (metadata_5.x >= 3f) {
        source_2 = input.uv3_;
    }
    if (metadata_5.x >= 4f) {
        source_2 = input.uv4_;
    }
    if (metadata_5.x >= 5f) {
        source_2 = input.uv5_;
    }
    if (metadata_5.x >= 6f) {
        source_2 = input.uv6_;
    }
    if (metadata_5.x >= 7f) {
        source_2 = input.uv7_;
    }
    let _e33 = source_2;
    let scaled_3 = (_e33 * transform_3.zw);
    let c_2 = cos(metadata_5.y);
    let s_2 = sin(metadata_5.y);
    return (vec2<f32>(((scaled_3.x * c_2) - (scaled_3.y * s_2)), ((scaled_3.x * s_2) + (scaled_3.y * c_2))) + transform_3.xy);
}

fn standardUsesMetallicRoughnessTexture() -> bool {
    return ((standardTextureMask & 2u) != 0u);
}

fn standardUsesMetallicTexture() -> bool {
    return ((standardTextureMask & 262144u) != 0u);
}

fn standardReusesMetallicTextureFromBaseColorTexture() -> bool {
    return (((standardTextureMask >> 21u) & 3u) == 1u);
}

fn standardReusesMetallicTextureFromMetallicRoughnessTexture() -> bool {
    return (((standardTextureMask >> 21u) & 3u) == 2u);
}

fn standardUsesRoughnessTexture() -> bool {
    return ((standardTextureMask & 524288u) != 0u);
}

fn standardReusesRoughnessTextureFromBaseColorTexture() -> bool {
    return (((standardTextureMask >> 23u) & 3u) == 1u);
}

fn standardReusesRoughnessTextureFromMetallicRoughnessTexture() -> bool {
    return (((standardTextureMask >> 23u) & 3u) == 2u);
}

fn standardReusesRoughnessTextureFromMetallicTexture() -> bool {
    return (((standardTextureMask >> 23u) & 3u) == 3u);
}

fn standardUsesAlphaTexture() -> bool {
    return ((standardTextureMask & 1048576u) != 0u);
}

fn standardReusesAlphaTextureFromBaseColorTexture() -> bool {
    return (((standardTextureMask >> 25u) & 7u) == 1u);
}

fn standardReusesAlphaTextureFromMetallicRoughnessTexture() -> bool {
    return (((standardTextureMask >> 25u) & 7u) == 2u);
}

fn standardReusesAlphaTextureFromMetallicTexture() -> bool {
    return (((standardTextureMask >> 25u) & 7u) == 3u);
}

fn standardReusesAlphaTextureFromRoughnessTexture() -> bool {
    return (((standardTextureMask >> 25u) & 7u) == 4u);
}

fn surfaceChannel(value_2: vec4<f32>, channel: u32) -> f32 {
    switch channel {
        case 0u: {
            return value_2.x;
        }
        case 1u: {
            return value_2.y;
        }
        case 2u: {
            return value_2.z;
        }
        default: {
            return value_2.w;
        }
    }
}

fn standardUsesNormalTexture() -> bool {
    return ((standardTextureMask & 4u) != 0u);
}

fn standardUsesBumpTexture() -> bool {
    return ((standardTextureMask & 256u) != 0u);
}

fn standardUsesEmissiveTexture() -> bool {
    return ((standardTextureMask & 16u) != 0u);
}

fn standardUsesOcclusionTexture() -> bool {
    return ((standardTextureMask & 32u) != 0u);
}

fn evaluate_standard_surface(input_1: SurfaceInput, materialValue: MaterialParameters) -> SurfaceData {
    var baseSample_1: vec4<f32> = vec4(1f);
    var metallicRoughnessSample: vec4<f32> = vec4(1f);
    var metallicSample: vec4<f32>;
    var roughnessSample: vec4<f32>;
    var alpha_3: f32 = 1f;
    var alphaSample_1: vec4<f32> = vec4(1f);
    var normal_20: vec3<f32>;
    var usesNormal: bool = false;
    var local_38: bool;
    var emissiveSample: vec4<f32> = vec4(1f);
    var occlusionSample: vec4<f32> = vec4(1f);

    let _e3 = standardUsesBaseColorTexture();
    if _e3 {
        let _e8 = surfaceUv(input_1, materialValue.baseColorTextureCoordinatesTransform, materialValue.baseColorTextureCoordinatesMetadata);
        let _e14 = textureSample(baseColorTexture_1, baseColorTexture_sampler, (_e8 * materialValue.baseColorTextureCoordinatesMetadata.zw));
        baseSample_1 = _e14;
    }
    let _e16 = standardUsesMetallicRoughnessTexture();
    if _e16 {
        let _e19 = surfaceUv(input_1, materialValue.metallicRoughnessTextureCoordinatesTransform, materialValue.metallicRoughnessTextureCoordinatesMetadata);
        let _e25 = textureSample(metallicRoughnessTexture, metallicRoughnessTexture_sampler, (_e19 * materialValue.metallicRoughnessTextureCoordinatesMetadata.zw));
        metallicRoughnessSample = _e25;
    }
    let _e27 = metallicRoughnessSample;
    metallicSample = _e27;
    let _e29 = metallicRoughnessSample;
    roughnessSample = _e29;
    let _e31 = standardUsesMetallicTexture();
    if _e31 {
        let _e32 = standardReusesMetallicTextureFromBaseColorTexture();
        if _e32 {
            let _e33 = baseSample_1;
            metallicSample = _e33;
        } else {
            let _e34 = standardReusesMetallicTextureFromMetallicRoughnessTexture();
            if _e34 {
                let _e35 = metallicRoughnessSample;
                metallicSample = _e35;
            } else {
                let _e38 = surfaceUv(input_1, materialValue.metallicTextureCoordinatesTransform, materialValue.metallicTextureCoordinatesMetadata);
                let _e44 = textureSample(metallicTexture, metallicTexture_sampler, (_e38 * materialValue.metallicTextureCoordinatesMetadata.zw));
                metallicSample = _e44;
            }
        }
    }
    let _e45 = standardUsesRoughnessTexture();
    if _e45 {
        let _e46 = standardReusesRoughnessTextureFromBaseColorTexture();
        if _e46 {
            let _e47 = baseSample_1;
            roughnessSample = _e47;
        } else {
            let _e48 = standardReusesRoughnessTextureFromMetallicRoughnessTexture();
            if _e48 {
                let _e49 = metallicRoughnessSample;
                roughnessSample = _e49;
            } else {
                let _e50 = standardReusesRoughnessTextureFromMetallicTexture();
                if _e50 {
                    let _e51 = metallicSample;
                    roughnessSample = _e51;
                } else {
                    let _e54 = surfaceUv(input_1, materialValue.roughnessTextureCoordinatesTransform, materialValue.roughnessTextureCoordinatesMetadata);
                    let _e60 = textureSample(roughnessTexture, roughnessTexture_sampler, (_e54 * materialValue.roughnessTextureCoordinatesMetadata.zw));
                    roughnessSample = _e60;
                }
            }
        }
    }
    let _e61 = standardUsesAlphaTexture();
    if _e61 {
        let _e62 = standardReusesAlphaTextureFromBaseColorTexture();
        if _e62 {
            let _e63 = baseSample_1;
            alphaSample_1 = _e63;
        } else {
            let _e65 = standardReusesAlphaTextureFromMetallicRoughnessTexture();
            if _e65 {
                let _e66 = metallicRoughnessSample;
                alphaSample_1 = _e66;
            } else {
                let _e67 = standardReusesAlphaTextureFromMetallicTexture();
                if _e67 {
                    let _e68 = metallicSample;
                    alphaSample_1 = _e68;
                } else {
                    let _e69 = standardReusesAlphaTextureFromRoughnessTexture();
                    if _e69 {
                        let _e70 = roughnessSample;
                        alphaSample_1 = _e70;
                    } else {
                        let _e73 = surfaceUv(input_1, materialValue.alphaTextureCoordinatesTransform, materialValue.alphaTextureCoordinatesMetadata);
                        let _e79 = textureSample(alphaTexture_1, alphaTexture_sampler, (_e73 * materialValue.alphaTextureCoordinatesMetadata.zw));
                        alphaSample_1 = _e79;
                    }
                }
            }
        }
        let _e80 = alphaSample_1;
        let _e83 = surfaceChannel(_e80, u32(materialValue.alphaChannel));
        alpha_3 = _e83;
    }
    let faceDirection_1 = select(-1f, 1f, input_1.frontFacing);
    normal_20 = (normalize(input_1.geometricNormalWS) * faceDirection_1);
    let _e93 = standardUsesNormalTexture();
    if _e93 {
        let _e96 = surfaceUv(input_1, materialValue.normalTextureCoordinatesTransform, materialValue.normalTextureCoordinatesMetadata);
        let normalSample = textureSample(normalTexture, normalTexture_sampler, (_e96 * materialValue.normalTextureCoordinatesMetadata.zw));
        let _e106 = decodeTangentSpaceNormalRgX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(normalSample.xy);
        let _e108 = scaleTangentSpaceNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(_e106, materialValue.normalScale);
        let _e109 = applyTBNX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(input_1.geometricNormalWS, input_1.tangentWS, _e108);
        normal_20 = (_e109 * faceDirection_1);
        usesNormal = true;
    }
    let _e113 = usesNormal;
    if !(_e113) {
        let _e115 = standardUsesBumpTexture();
        local_38 = _e115;
    } else {
        local_38 = false;
    }
    let _e119 = local_38;
    if _e119 {
        let _e122 = surfaceUv(input_1, materialValue.bumpTextureCoordinatesTransform, materialValue.bumpTextureCoordinatesMetadata);
        let uv_8 = (_e122 * materialValue.bumpTextureCoordinatesMetadata.zw);
        let dx_1 = dpdx(uv_8);
        let dy_1 = dpdy(uv_8);
        let _e130 = textureSampleGrad(normalTexture, normalTexture_sampler, uv_8, dx_1, dy_1);
        let height = _e130.x;
        let _e135 = textureSampleGrad(normalTexture, normalTexture_sampler, (uv_8 + dx_1), dx_1, dy_1);
        let heightX = _e135.x;
        let _e140 = textureSampleGrad(normalTexture, normalTexture_sampler, (uv_8 + dy_1), dx_1, dy_1);
        let heightY = _e140.x;
        let _e143 = normal_20;
        let _e149 = perturbBumpNormalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DCNYX(input_1.positionWS, _e143, (materialValue.bumpScale * vec2<f32>((heightX - height), (heightY - height))), faceDirection_1);
        normal_20 = _e149;
    }
    let _e150 = standardUsesEmissiveTexture();
    if _e150 {
        let _e153 = surfaceUv(input_1, materialValue.emissiveTextureCoordinatesTransform, materialValue.emissiveTextureCoordinatesMetadata);
        let _e159 = textureSample(emissiveTexture, emissiveTexture_sampler, (_e153 * materialValue.emissiveTextureCoordinatesMetadata.zw));
        emissiveSample = _e159;
    }
    let _e161 = standardUsesOcclusionTexture();
    if _e161 {
        let _e164 = surfaceUv(input_1, materialValue.occlusionTextureCoordinatesTransform, materialValue.occlusionTextureCoordinatesMetadata);
        let _e170 = textureSample(occlusionTexture, occlusionTexture_sampler, (_e164 * materialValue.occlusionTextureCoordinatesMetadata.zw));
        occlusionSample = _e170;
    }
    let vertexColor = input_1.vertexColor;
    let _e175 = baseSample_1;
    let baseColor_10 = ((materialValue.baseColor.xyz * _e175.xyz) * vertexColor.xyz);
    let _e181 = metallicSample;
    let _e184 = surfaceChannel(_e181, u32(materialValue.metallicChannel));
    let metallic_14 = clamp((materialValue.metallic * _e184), 0f, 1f);
    let _e190 = roughnessSample;
    let _e193 = surfaceChannel(_e190, u32(materialValue.roughnessChannel));
    let roughness_12 = clamp((materialValue.roughness * _e193), 0.04f, 1f);
    let _e201 = emissiveSample;
    let emissive_1 = ((materialValue.emissive * materialValue.emissiveIntensity) * _e201.xyz);
    let _e205 = occlusionSample.x;
    let occlusion_1 = clamp((1f + ((_e205 - 1f) * materialValue.occlusionStrength)), 0f, 1f);
    let _e218 = baseSample_1.w;
    let _e222 = alpha_3;
    applyAlphaHashX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DUYLMOBUGCX3IMFZWQX((((materialValue.baseColor.w * _e218) * vertexColor.w) * _e222), input_1.positionOS, materialValue.alphaHash);
    let _e226 = normal_20;
    let _e230 = baseSample_1.w;
    let _e234 = alpha_3;
    return SurfaceData(baseColor_10, _e226, metallic_14, roughness_12, emissive_1, occlusion_1, clamp((((materialValue.baseColor.w * _e230) * vertexColor.w) * _e234), 0f, 1f), clamp(materialValue.alphaCutoff, 0f, 1f));
}

fn evaluate_surface(input_2: SurfaceInput) -> SurfaceData {
    let _e1 = material;
    let _e3 = evaluate_standard_surface(input_2, _e1);
    return _e3;
}

fn evaluateStandardSurface(in_9: VsOut, frontFacing_2: bool) -> SurfaceData {
    applyViewClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(in_9.worldPos, false);
    let _e5 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let viewDirectionWS = normalize((_e5 - in_9.worldPos));
    let positionOS_1 = in_9.positionOSAndViewZ.xyz;
    let _e24 = materialVertexColor(in_9);
    let input_3 = SurfaceInput(positionOS_1, in_9.worldPos, in_9.worldNormal, in_9.worldTangent, viewDirectionWS, in_9.uv, in_9.uv1_, in_9.uv2_, in_9.uv3_, in_9.uv4_, in_9.uv5_, in_9.uv6And7_.xy, in_9.uv6And7_.zw, _e24, frontFacing_2);
    let _e27 = evaluate_surface(input_3);
    return _e27;
}

fn finiteScalar(value_3: f32, fallback: f32) -> f32 {
    let bounded = clamp(value_3, -65504f, 65504f);
    return select(fallback, bounded, (value_3 == value_3));
}

fn finiteColor(value_4: vec3<f32>, fallback_1: vec3<f32>) -> vec3<f32> {
    let _e4 = finiteScalar(value_4.x, fallback_1.x);
    let _e7 = finiteScalar(value_4.y, fallback_1.y);
    let _e10 = finiteScalar(value_4.z, fallback_1.z);
    return vec3<f32>(_e4, _e7, _e10);
}

fn alphaTestSurface(surface: SurfaceData) {
    var local_39: bool;

    if (surface.alphaClipThreshold > 0f) {
        local_39 = (surface.opacity <= surface.alphaClipThreshold);
    } else {
        local_39 = false;
    }
    let _e10 = local_39;
    if _e10 {
        discard;
    } else {
        return;
    }
}

fn standardSurfaceF0_(in_10: VsOut, surface_1: SurfaceData) -> vec3<f32> {
    var specularColor: vec3<f32>;
    var specularWeight: f32;

    let albedo_4 = surface_1.baseColor;
    let _e4 = finiteScalar(surface_1.metallic, 0f);
    let metallic_15 = clamp(_e4, 0f, 1f);
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
    return mix(((vec3(dielectricF0_) * _e36) * _e38), albedo_4, metallic_15);
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

fn temporalVertexAlpha(in_11: TemporalVsOut) -> f32 {
    return 1f;
}

fn standardUsesSpecularColorTexture() -> bool {
    return ((standardTextureMask & 8u) != 0u);
}

fn standardUsesClearcoatTexture() -> bool {
    return ((standardTextureMask & 512u) != 0u);
}

fn standardUsesClearcoatRoughnessTexture() -> bool {
    return ((standardTextureMask & 1024u) != 0u);
}

fn standardUsesClearcoatNormalTexture() -> bool {
    return ((standardTextureMask & 2048u) != 0u);
}

fn standardUsesAnisotropyTexture() -> bool {
    return ((standardTextureMask & 4096u) != 0u);
}

fn standardUsesSheenColorTexture() -> bool {
    return ((standardTextureMask & 8192u) != 0u);
}

fn standardUsesSheenRoughnessTexture() -> bool {
    return ((standardTextureMask & 16384u) != 0u);
}

fn standardUsesIridescenceTexture() -> bool {
    return ((standardTextureMask & 32768u) != 0u);
}

fn standardUsesIridescenceThicknessTexture() -> bool {
    return ((standardTextureMask & 65536u) != 0u);
}

fn standardUsesSpecularTexture() -> bool {
    return ((standardTextureMask & 131072u) != 0u);
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    let _e9 = vs_main_impl(in, 0u, idx, 0u, 4294967295u, vec3<u32>(4294967295u, 0u, 0u));
    return _e9;
}

@fragment 
fn fs_main(in_1: VsOut, @builtin(front_facing) frontFacing: bool) -> StandardPbrOutput {
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
    let _e6 = evaluateStandardSurface(in_1, frontFacing);
    alphaTestSurface(_e6);
    let alpha_4 = _e6.opacity;
    let albedo_5 = _e6.baseColor;
    let _e11 = finiteScalar(_e6.metallic, 0f);
    let metallic_16 = clamp(_e11, 0f, 1f);
    let _e17 = finiteScalar(_e6.roughness, 0.5f);
    let iblRoughness = clamp(_e17, 0.04f, 1f);
    let a_4 = (iblRoughness * iblRoughness);
    let n_6 = normalize(_e6.normalWS);
    let _e26 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let v_5 = normalize((_e26 - in_1.worldPos));
    let _e32 = material.ior;
    let _e34 = finiteScalar(_e32, 1.5f);
    let safeIor_1 = max(_e34, 1f);
    let dielectricF0_1 = pow(((safeIor_1 - 1f) / (safeIor_1 + 1f)), 2f);
    let _e44 = standardSurfaceF0_(in_1, _e6);
    f0_ = _e44;
    physicalNormal = n_6;
    diffuseAlbedo = albedo_5;
    let _e48 = standardUsesTransmissionTexture();
    if _e48 {
        let _e51 = material.transmissionTextureCoordinatesTransform;
        let _e54 = material.transmissionTextureCoordinatesMetadata;
        let _e55 = transformedMaterialUv(_e51, _e54, in_1);
        let _e58 = material.transmissionTextureCoordinatesMetadata;
        let _e62 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(transmissionTexture, transmissionSampler, _e55, _e58.zw);
        transmissionSample = _e62.x;
    }
    let _e65 = standardUsesThicknessTexture();
    if _e65 {
        let _e68 = material.thicknessTextureCoordinatesTransform;
        let _e71 = material.thicknessTextureCoordinatesMetadata;
        let _e72 = transformedMaterialUv(_e68, _e71, in_1);
        let _e75 = material.thicknessTextureCoordinatesMetadata;
        let _e79 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(thicknessTexture, thicknessSampler, _e72, _e75.zw);
        thicknessSample = _e79.y;
    }
    let _e84 = material.transmission;
    let _e86 = finiteScalar(_e84, 0f);
    let _e87 = transmissionSample;
    let _e89 = finiteScalar(_e87, 1f);
    let transmissionFactor = clamp((_e86 * _e89), 0f, 1f);
    let _e96 = finiteScalar(dot(n_6, v_5), 0f);
    let refractionFromInside = (_e96 < 0f);
    let refractionNormal = select(n_6, -(n_6), refractionFromInside);
    let refractionEta = select((1f / safeIor_1), safeIor_1, refractionFromInside);
    let incident = -(v_5);
    let refracted = refract(incident, refractionNormal, refractionEta);
    let refractedLengthSquared = dot(refracted, refracted);
    let viewCos = clamp(abs(_e96), 0f, 1f);
    let _e112 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(viewCos, vec3(dielectricF0_1));
    let fresnel_2 = clamp(_e112.x, 0f, 1f);
    let transmittedEnergy = select(0f, ((transmissionFactor * (1f - metallic_16)) * (1f - fresnel_2)), (refractedLengthSquared > 0.000001f));
    diffuseAlbedo = (albedo_5 * (1f - transmittedEnergy));
    let _e131 = physicalNormal;
    let _e132 = diffuseAlbedo;
    let _e133 = f0_;
    let _e135 = skylight;
    let _e138 = probeShPreblend;
    let _e139 = probeLocalBlendFraction;
    let _e146 = evaluateStandardEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(in_1.worldPos, _e131, v_5, _e132, metallic_16, iblRoughness, _e133, _e135, irradianceMap_2, irradianceSampler_2, prefilterMap_2, prefilterSampler_2, brdfLut_4, skylightPrefilterMap_1, _e138, _e139);
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
    let _e184 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    let _e187 = sampleStandardAmbientOcclusionX_naga_oil_mod_XMZXXEZ3FMF4F643UMFXGIYLSMQ5DUY3MOVZXIZLSX(in_1.worldPos, _e184, ssaoBlurredTexture, ssaoBlurredSampler);
    let _e188 = ambient;
    ambient = (_e188 * _e187);
    let _e190 = reflectionFallback;
    reflectionFallback = (_e190 * _e187);
    let _e192 = ambient;
    color = _e192;
    let screenUv = ((in_1.ndc.xy * vec2<f32>(0.5f, -0.5f)) + vec2(0.5f));
    let localToWorld0_ = in_1.transmissionBasis0_.xyz;
    let localToWorld1_ = vec3<f32>(in_1.transmissionBasis0_.w, in_1.transmissionBasis1_.x, in_1.transmissionBasis1_.y);
    let localToWorld2_ = vec3<f32>(in_1.transmissionBasis1_.z, in_1.transmissionBasis1_.w, in_1.ndc.w);
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
    let _e265 = material.thickness;
    let _e267 = finiteScalar(_e265, 0f);
    let _e270 = thicknessSample;
    let _e272 = finiteScalar(_e270, 1f);
    let worldThickness = max(((_e267 * length(worldRefractedDirection)) * _e272), 0f);
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
    let _e314 = textureSampleLevel(transmissionBackdropTexture, prefilterSampler_2, clamp(screenUv, vec2(0f), vec2(1f)), backdropLod);
    let unrefractedBackdrop = _e314.xyz;
    transmittedBackdrop = unrefractedBackdrop;
    if (refractedLengthSquared > 0.000001f) {
        local_1 = insideGuardBand;
    } else {
        local_1 = false;
    }
    let _e322 = local_1;
    if _e322 {
        let _e330 = textureSampleLevel(transmissionBackdropTexture, prefilterSampler_2, clamp(refractedUv, vec2(0f), vec2(1f)), backdropLod);
        transmittedBackdrop = _e330.xyz;
    }
    let _e334 = material.attenuationColor;
    let _e337 = finiteColor(_e334, vec3(1f));
    let safeAttenuationColor = clamp(_e337, vec3(0f), vec3(1f));
    let _e345 = material.attenuationDistance;
    let _e347 = finiteScalar(_e345, 0f);
    let safeAttenuationDistance = max(_e347, 0f);
    let attenuationExponent = (worldThickness / max(safeAttenuationDistance, 0.000001f));
    if (safeAttenuationDistance > 0.000001f) {
        local_2 = (worldThickness > 0f);
    } else {
        local_2 = false;
    }
    let _e364 = local_2;
    let beerAttenuation = select(vec3(1f), pow(safeAttenuationColor, vec3(attenuationExponent)), _e364);
    let _e366 = color;
    let _e367 = transmittedBackdrop;
    let _e370 = finiteColor(_e367, vec3(0f));
    color = (_e366 + ((_e370 * transmittedEnergy) * beerAttenuation));
    let _e374 = color;
    color = (_e374 + _e6.emissive);
    let _e377 = physicalNormal;
    let _e379 = standardViewZ(in_1);
    let _e380 = evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e377, in_1.worldPos, _e379);
    let _e381 = color;
    let _e385 = standardViewZ(in_1);
    let _e386 = physicalNormal;
    let _e387 = diffuseAlbedo;
    let _e388 = f0_;
    let _e389 = evaluateStandardDirectX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43UMFXGIYLSMRPWY2LHNB2GS3THX(in_1.worldPos, in_1.ndc.xyz, _e385, _e386, v_5, _e387, metallic_16, a_4, _e388, _e380);
    color = (_e381 + _e389);
    let _e393 = color;
    output.color = vec4<f32>(_e393, alpha_4);
    let _e395 = output;
    return _e395;
}

@fragment 
fn fs_gbuffer(in_2: VsOut, @builtin(front_facing) frontFacing_1: bool) -> GBufferOutputX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX {
    var probeRow: u32 = 0u;

    let _e3 = evaluateStandardSurface(in_2, frontFacing_1);
    alphaTestSurface(_e3);
    let _e14 = standardSurfaceF0_(in_2, _e3);
    let _e22 = skylight.diffuseScale.w;
    let _e24 = probeRow;
    let _e25 = encodeStandardGBufferX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(_e3.normalWS, clamp(_e3.roughness, 0.04f, 1f), _e3.baseColor, clamp(_e3.metallic, 0f, 1f), _e14, _e3.occlusion, _e3.emissive, _e3.opacity, u32(_e22), _e24);
    return _e25;
}

@vertex 
fn vs_temporal(in_3: VsIn, @builtin(instance_index) idx_1: u32) -> TemporalVsOut {
    var out: TemporalVsOut;

    let _e7 = palette[(0u + in_3.skinIndex.x)];
    let _e16 = palette[(0u + in_3.skinIndex.y)];
    let _e26 = palette[(0u + in_3.skinIndex.z)];
    let _e36 = palette[(0u + in_3.skinIndex.w)];
    let currentSkin = ((((_e7 * in_3.skinWeight.x) + (_e16 * in_3.skinWeight.y)) + (_e26 * in_3.skinWeight.z)) + (_e36 * in_3.skinWeight.w));
    let _e46 = previousPalette[(0u + in_3.skinIndex.x)];
    let _e55 = previousPalette[(0u + in_3.skinIndex.y)];
    let _e65 = previousPalette[(0u + in_3.skinIndex.z)];
    let _e75 = previousPalette[(0u + in_3.skinIndex.w)];
    let previousSkin = ((((_e46 * in_3.skinWeight.x) + (_e55 * in_3.skinWeight.y)) + (_e65 * in_3.skinWeight.z)) + (_e75 * in_3.skinWeight.w));
    let currentWorld = (currentSkin * vec4<f32>(in_3.pos, 1f));
    let previousWorld = (previousSkin * vec4<f32>(in_3.pos, 1f));
    out.positionOS = in_3.pos;
    out.clippingPositionWS = currentWorld.xyz;
    let _e96 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalCurrentViewProj;
    out.currentClip = (_e96 * currentWorld);
    let _e101 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e101 * currentWorld);
    let _e106 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalPreviousViewProj;
    out.previousClip = (_e106 * previousWorld);
    out.uv = in_3.uv;
    out.uv1_ = in_3.uv1_;
    out.uv2_ = in_3.uv2_;
    out.uv3_ = in_3.uv3_;
    out.uv4_ = in_3.uv4_;
    out.uv5_ = in_3.uv5_;
    out.uv6_ = in_3.uv6_;
    out.uv7_ = in_3.uv7_;
    let _e124 = out;
    return _e124;
}

@fragment 
fn fs_temporal(in_4: TemporalVsOut) -> @location(0) vec4<f32> {
    applyViewClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(in_4.clippingPositionWS, false);
    let reactive_3 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].temporal.x;
    let _e12 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].temporal.y;
    let motionValid_2 = (_e12 >= 0.5f);
    let _e18 = material.baseColor.w;
    let _e19 = temporalVertexAlpha(in_4);
    let _e23 = material.alphaCutoff;
    let _e26 = material.alphaHash;
    let _e28 = standardUsesBaseColorTexture();
    let _e31 = material.baseColorTextureCoordinatesTransform;
    let _e34 = material.baseColorTextureCoordinatesMetadata;
    let _e35 = standardUsesAlphaTexture();
    let _e38 = material.alphaTextureCoordinatesTransform;
    let _e41 = material.alphaTextureCoordinatesMetadata;
    let _e44 = material.alphaChannel;
    let _e49 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e62 = projectPbrSceneTemporalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX((_e18 * _e19), _e23, _e26, in_4.positionOS, _e28, baseColorTexture_1, baseColorTexture_sampler, _e31, _e34, _e35, alphaTexture_1, alphaTexture_sampler, _e38, _e41, _e44, in_4.currentClip, in_4.previousClip, _e49, reactive_3, motionValid_2, in_4.uv, in_4.uv1_, in_4.uv2_, in_4.uv3_, in_4.uv4_, in_4.uv5_, in_4.uv6_, in_4.uv7_);
    return vec4(1f);
}
