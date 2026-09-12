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
    @location(13) color: vec4<f32>,
}

struct VsOut {
    @builtin(position) @invariant clip: vec4<f32>,
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
    @location(14) color: vec4<f32>,
    @location(6) ndc: vec4<f32>,
    @location(15) @interpolate(flat) materialIndex: u32,
}

struct StandardPbrOutput {
    @location(0) color: vec4<f32>,
}

struct GBufferOutput {
    @location(0) normal_roughness: vec4<f32>,
    @location(1) albedo_metallic: vec4<f32>,
    @location(2) specular_response_ao: vec4<f32>,
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
    @location(14) color: vec4<f32>,
}

const PROBE_INV_PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX: f32 = 0.31830987f;
const THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX: u32 = 16u;
const THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX: array<vec2<f32>, 256> = array<vec2<f32>, 256>(vec2<f32>(0.14709473f, 0.8520508f), vec2<f32>(0.16552734f, 0.78759766f), vec2<f32>(0.24438477f, 0.6386719f), vec2<f32>(0.3708496f, 0.51953125f), vec2<f32>(0.49682617f, 0.41552734f), vec2<f32>(0.6020508f, 0.32641602f), vec2<f32>(0.68408203f, 0.25390625f), vec2<f32>(0.74609375f, 0.19750977f), vec2<f32>(0.79052734f, 0.15429688f), vec2<f32>(0.8222656f, 0.12164307f), vec2<f32>(0.8432617f, 0.09698486f), vec2<f32>(0.8564453f, 0.078430176f), vec2<f32>(0.86328125f, 0.06439209f), vec2<f32>(0.86572266f, 0.053710938f), vec2<f32>(0.8642578f, 0.045440674f), vec2<f32>(0.8598633f, 0.039031982f), vec2<f32>(0.38867188f, 0.6113281f), vec2<f32>(0.3930664f, 0.60058594f), vec2<f32>(0.41235352f, 0.54589844f), vec2<f32>(0.45654297f, 0.4482422f), vec2<f32>(0.52783203f, 0.35253906f), vec2<f32>(0.6074219f, 0.27392578f), vec2<f32>(0.67871094f, 0.21142578f), vec2<f32>(0.73339844f, 0.16259766f), vec2<f32>(0.7709961f, 0.12536621f), vec2<f32>(0.79345703f, 0.09729004f), vec2<f32>(0.80322266f, 0.07623291f), vec2<f32>(0.80371094f, 0.06036377f), vec2<f32>(0.7963867f, 0.048431396f), vec2<f32>(0.78564453f, 0.039367676f), vec2<f32>(0.77197266f, 0.032409668f), vec2<f32>(0.7548828f, 0.026977539f), vec2<f32>(0.5722656f, 0.42749023f), vec2<f32>(0.57373047f, 0.42407227f), vec2<f32>(0.57958984f, 0.40356445f), vec2<f32>(0.5917969f, 0.3544922f), vec2<f32>(0.61621094f, 0.28808594f), vec2<f32>(0.65527344f, 0.22485352f), vec2<f32>(0.69873047f, 0.17260742f), vec2<f32>(0.73535156f, 0.13183594f), vec2<f32>(0.75927734f, 0.10089111f), vec2<f32>(0.77001953f, 0.07745361f), vec2<f32>(0.77197266f, 0.059936523f), vec2<f32>(0.7661133f, 0.046844482f), vec2<f32>(0.7519531f, 0.036987305f), vec2<f32>(0.7324219f, 0.029541016f), vec2<f32>(0.70947266f, 0.023834229f), vec2<f32>(0.68359375f, 0.019439697f), vec2<f32>(0.7089844f, 0.29101563f), vec2<f32>(0.7089844f, 0.28979492f), vec2<f32>(0.70996094f, 0.28125f), vec2<f32>(0.70996094f, 0.25854492f), vec2<f32>(0.7114258f, 0.22045898f), vec2<f32>(0.71972656f, 0.17687988f), vec2<f32>(0.734375f, 0.13708496f), vec2<f32>(0.7480469f, 0.10479736f), vec2<f32>(0.7558594f, 0.07989502f), vec2<f32>(0.7597656f, 0.06100464f), vec2<f32>(0.75341797f, 0.046844482f), vec2<f32>(0.73876953f, 0.036224365f), vec2<f32>(0.71777344f, 0.028259277f), vec2<f32>(0.69189453f, 0.022262573f), vec2<f32>(0.6611328f, 0.017700195f), vec2<f32>(0.62841797f, 0.014198303f), vec2<f32>(0.80810547f, 0.19177246f), vec2<f32>(0.8076172f, 0.19128418f), vec2<f32>(0.80615234f, 0.18798828f), vec2<f32>(0.8017578f, 0.17810059f), vec2<f32>(0.79296875f, 0.1586914f), vec2<f32>(0.7836914f, 0.13220215f), vec2<f32>(0.7753906f, 0.1048584f), vec2<f32>(0.7685547f, 0.08111572f), vec2<f32>(0.76464844f, 0.0619812f), vec2<f32>(0.7553711f, 0.04727173f), vec2<f32>(0.7402344f, 0.03616333f), vec2<f32>(0.71875f, 0.027755737f), vec2<f32>(0.69091797f, 0.021484375f), vec2<f32>(0.6582031f, 0.016738892f), vec2<f32>(0.6220703f, 0.013160706f), vec2<f32>(0.5839844f, 0.010414124f), vec2<f32>(0.87841797f, 0.1217041f), vec2<f32>(0.8779297f, 0.1217041f), vec2<f32>(0.875f, 0.12060547f), vec2<f32>(0.8691406f, 0.11694336f), vec2<f32>(0.8569336f, 0.10803223f), vec2<f32>(0.8378906f, 0.09375f), vec2<f32>(0.8149414f, 0.0769043f), vec2<f32>(0.79589844f, 0.060699463f), vec2<f32>(0.7763672f, 0.046875f), vec2<f32>(0.75634766f, 0.03591919f), vec2<f32>(0.7324219f, 0.027450562f), vec2<f32>(0.703125f, 0.021026611f), vec2<f32>(0.6689453f, 0.016174316f), vec2<f32>(0.6303711f, 0.012512207f), vec2<f32>(0.58935547f, 0.009742737f), vec2<f32>(0.5463867f, 0.007633209f), vec2<f32>(0.92626953f, 0.073791504f), vec2<f32>(0.92578125f, 0.073913574f), vec2<f32>(0.92285156f, 0.073913574f), vec2<f32>(0.9169922f, 0.07312012f), vec2<f32>(0.9038086f, 0.06982422f), vec2<f32>(0.88134766f, 0.06311035f), vec2<f32>(0.8510742f, 0.05380249f), vec2<f32>(0.82128906f, 0.043701172f), vec2<f32>(0.7910156f, 0.03439331f), vec2<f32>(0.76123047f, 0.026611328f), vec2<f32>(0.72802734f, 0.020446777f), vec2<f32>(0.69189453f, 0.015655518f), vec2<f32>(0.6508789f, 0.012008667f), vec2<f32>(0.6074219f, 0.009254456f), vec2<f32>(0.56103516f, 0.007156372f), vec2<f32>(0.51416016f, 0.0055656433f), vec2<f32>(0.95751953f, 0.04232788f), vec2<f32>(0.95703125f, 0.04244995f), vec2<f32>(0.95458984f, 0.042816162f), vec2<f32>(0.94921875f, 0.043182373f), vec2<f32>(0.9370117f, 0.042663574f), vec2<f32>(0.91308594f, 0.040252686f), vec2<f32>(0.88183594f, 0.03579712f), vec2<f32>(0.84472656f, 0.030136108f), vec2<f32>(0.80615234f, 0.024337769f), vec2<f32>(0.76708984f, 0.01914978f), vec2<f32>(0.7265625f, 0.014854431f), vec2<f32>(0.6826172f, 0.011421204f), vec2<f32>(0.63623047f, 0.008773804f), vec2<f32>(0.58691406f, 0.00674057f), vec2<f32>(0.5366211f, 0.0051994324f), vec2<f32>(0.48608398f, 0.004020691f), vec2<f32>(0.97753906f, 0.022628784f), vec2<f32>(0.9770508f, 0.022750854f), vec2<f32>(0.97509766f, 0.02319336f), vec2<f32>(0.96972656f, 0.023910522f), vec2<f32>(0.95947266f, 0.024490356f), vec2<f32>(0.93603516f, 0.024124146f), vec2<f32>(0.90527344f, 0.022521973f), vec2<f32>(0.8652344f, 0.019760132f), vec2<f32>(0.82177734f, 0.01651001f), vec2<f32>(0.77441406f, 0.013290405f), vec2<f32>(0.7265625f, 0.0104599f), vec2<f32>(0.67626953f, 0.008132935f), vec2<f32>(0.62402344f, 0.0062789917f), vec2<f32>(0.5698242f, 0.004825592f), vec2<f32>(0.5151367f, 0.0037136078f), vec2<f32>(0.46142578f, 0.0028629303f), vec2<f32>(0.98876953f, 0.011070251f), vec2<f32>(0.98876953f, 0.011161804f), vec2<f32>(0.9868164f, 0.011512756f), vec2<f32>(0.98291016f, 0.012214661f), vec2<f32>(0.97314453f, 0.012992859f), vec2<f32>(0.953125f, 0.013519287f), vec2<f32>(0.92285156f, 0.013282776f), vec2<f32>(0.8823242f, 0.012260437f), vec2<f32>(0.83496094f, 0.010658264f), vec2<f32>(0.7832031f, 0.008850098f), vec2<f32>(0.7285156f, 0.0071144104f), vec2<f32>(0.671875f, 0.005607605f), vec2<f32>(0.61376953f, 0.004360199f), vec2<f32>(0.5546875f, 0.0033721924f), vec2<f32>(0.4963379f, 0.0025997162f), vec2<f32>(0.43945313f, 0.0020046234f), vec2<f32>(0.9951172f, 0.004798889f), vec2<f32>(0.9951172f, 0.004863739f), vec2<f32>(0.99365234f, 0.0050964355f), vec2<f32>(0.9902344f, 0.0056037903f), vec2<f32>(0.9814453f, 0.0063323975f), vec2<f32>(0.96435547f, 0.0069770813f), vec2<f32>(0.93603516f, 0.007297516f), vec2<f32>(0.8964844f, 0.0071258545f), vec2<f32>(0.8466797f, 0.0064926147f), vec2<f32>(0.7915039f, 0.005596161f), vec2<f32>(0.7314453f, 0.004627228f), vec2<f32>(0.6689453f, 0.0037174225f), vec2<f32>(0.60546875f, 0.0029296875f), vec2<f32>(0.5415039f, 0.002281189f), vec2<f32>(0.47924805f, 0.0017662048f), vec2<f32>(0.41967773f, 0.0013656616f), vec2<f32>(0.9980469f, 0.0017604828f), vec2<f32>(0.9980469f, 0.0017938614f), vec2<f32>(0.99658203f, 0.0019292831f), vec2<f32>(0.9941406f, 0.0022392273f), vec2<f32>(0.9863281f, 0.002729416f), vec2<f32>(0.9716797f, 0.003250122f), vec2<f32>(0.9458008f, 0.0036697388f), vec2<f32>(0.90771484f, 0.003818512f), vec2<f32>(0.85839844f, 0.0036811829f), vec2<f32>(0.7993164f, 0.003320694f), vec2<f32>(0.73535156f, 0.0028438568f), vec2<f32>(0.66748047f, 0.0023441315f), vec2<f32>(0.5986328f, 0.0018796921f), vec2<f32>(0.53027344f, 0.0014829636f), vec2<f32>(0.46411133f, 0.0011587143f), vec2<f32>(0.4020996f, 0.0008993149f), vec2<f32>(0.9995117f, 0.00050115585f), vec2<f32>(0.9995117f, 0.00051546097f), vec2<f32>(0.9980469f, 0.0005836487f), vec2<f32>(0.99658203f, 0.0007505417f), vec2<f32>(0.9892578f, 0.0010147095f), vec2<f32>(0.9760742f, 0.0013465881f), vec2<f32>(0.9526367f, 0.0016527176f), vec2<f32>(0.9160156f, 0.0018558502f), vec2<f32>(0.8671875f, 0.0019054413f), vec2<f32>(0.8076172f, 0.0018167496f), vec2<f32>(0.7392578f, 0.0016212463f), vec2<f32>(0.6669922f, 0.0013799667f), vec2<f32>(0.5932617f, 0.0011358261f), vec2<f32>(0.52001953f, 0.0009121895f), vec2<f32>(0.45043945f, 0.00072193146f), vec2<f32>(0.38598633f, 0.00056505203f), vec2<f32>(1f, 0.00009316206f), vec2<f32>(1f, 0.00009787083f), vec2<f32>(0.99902344f, 0.00012540817f), vec2<f32>(0.9970703f, 0.00019216537f), vec2<f32>(0.99072266f, 0.000310421f), vec2<f32>(0.9790039f, 0.00046992302f), vec2<f32>(0.95751953f, 0.000647068f), vec2<f32>(0.92333984f, 0.0007915497f), vec2<f32>(0.8754883f, 0.00087690353f), vec2<f32>(0.8149414f, 0.0008869171f), vec2<f32>(0.7441406f, 0.0008325577f), vec2<f32>(0.66748047f, 0.00073862076f), vec2<f32>(0.5883789f, 0.000626564f), vec2<f32>(0.51123047f, 0.0005168915f), vec2<f32>(0.43823242f, 0.00041651726f), vec2<f32>(0.37109375f, 0.0003311634f), vec2<f32>(1f, 0.0000072717667f), vec2<f32>(1f, 0.000008165836f), vec2<f32>(0.99902344f, 0.000016987324f), vec2<f32>(0.9975586f, 0.000037908554f), vec2<f32>(0.9921875f, 0.00007593632f), vec2<f32>(0.9814453f, 0.00013744831f), vec2<f32>(0.9614258f, 0.00020754337f), vec2<f32>(0.9291992f, 0.00028014183f), vec2<f32>(0.8828125f, 0.00033450127f), vec2<f32>(0.82177734f, 0.00036263466f), vec2<f32>(0.74902344f, 0.00036215782f), vec2<f32>(0.66845703f, 0.00033807755f), vec2<f32>(0.5854492f, 0.00029969215f), vec2<f32>(0.50390625f, 0.00025582314f), vec2<f32>(0.42700195f, 0.0002117157f), vec2<f32>(0.35766602f, 0.000172019f), vec2<f32>(1f, 0f), vec2<f32>(1f, 0.000000059604645f), vec2<f32>(0.9995117f, 0.0000012516975f), vec2<f32>(0.9975586f, 0.0000053048134f), vec2<f32>(0.99316406f, 0.000015079975f), vec2<f32>(0.98291016f, 0.000028550625f), vec2<f32>(0.96435547f, 0.000047445297f), vec2<f32>(0.93408203f, 0.00006842613f), vec2<f32>(0.88916016f, 0.00008893013f), vec2<f32>(0.828125f, 0.000104248524f), vec2<f32>(0.75390625f, 0.00011217594f), vec2<f32>(0.67041016f, 0.00011241436f), vec2<f32>(0.5830078f, 0.00010627508f), vec2<f32>(0.4970703f, 0.00009584427f), vec2<f32>(0.4169922f, 0.00008332729f), vec2<f32>(0.34521484f, 0.000070512295f));

@id(64000) override standardTextureMask: u32 = 4294967295u;

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(3) @binding(0) 
var<storage> instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<InstanceDataX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX>;
@group(0) @binding(3) 
var shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: texture_depth_2d;
@group(0) @binding(4) 
var shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: sampler_comparison;
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
@group(1) @binding(15) 
var irradianceMap_1: texture_cube<f32>;
@group(1) @binding(16) 
var irradianceSampler_1: sampler;
@group(1) @binding(17) 
var prefilterMap_1: texture_cube<f32>;
@group(1) @binding(18) 
var prefilterSampler_1: sampler;
@group(1) @binding(19) 
var brdfLut_3: texture_2d<f32>;
@group(1) @binding(20) 
var brdfLutSampler_3: sampler;
@group(1) @binding(21) 
var<uniform> skylight: SkylightUniforms;
@group(3) @binding(1) 
var<storage> probeBlendRecords: array<vec4<f32>>;
@group(1) @binding(46) 
var<storage> sceneMaterials: array<MaterialParameters>;
@group(3) @binding(2) 
var<storage> visibleItems: array<vec2<u32>>;

fn sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip: vec4<f32>, temporalProjection: vec4<f32>) -> f32 {
    let ndcDepth = (clip.z / max(abs(clip.w), 0.000001f));
    let orthographicViewZ = -((temporalProjection.x + (ndcDepth * (temporalProjection.y - temporalProjection.x))));
    return select(-(clip.w), orthographicViewZ, (temporalProjection.z >= 0.5f));
}

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
    let local_8 = (max(_e2, vec3(0f)) * PROBE_INV_PIX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX);
    let skyResidualFraction = (1f - localBlendFraction);
    return ((((local_8 + (skyResidualFraction * e_sky)) * k_d) * albedo) * (1f - metallic));
}

fn f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH: f32, f0_1: vec3<f32>) -> vec3<f32> {
    let fresnel = exp2((((-5.55473f * vDotH) - 6.98316f) * vDotH));
    return ((f0_1 * (vec3(1f) - vec3(fresnel))) + vec3(fresnel));
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

fn decodeSpecularEnvironmentScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(skyColor: vec3<f32>, intensity: f32) -> vec3<f32> {
    return select((skyColor * intensity), vec3(max((-(intensity) - 1f), 0f)), (intensity < 0f));
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

fn sampleThreeR184DfgLutX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_4: f32, dotNV: f32) -> vec2<f32> {
    let uv_2 = clamp(vec2<f32>(roughness_4, dotNV), vec2(0f), vec2(1f));
    let samplePosition = ((uv_2 * 16f) - vec2(0.5f));
    let base = vec2<i32>(floor(samplePosition));
    let weight = fract(samplePosition);
    let lo = clamp(base, vec2(0i), vec2(15i));
    let hi = clamp((base + vec2(1i)), vec2(0i), vec2(15i));
    let rowLo = mix(THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(lo.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(lo.x))], THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(lo.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(hi.x))], weight.x);
    let rowHi = mix(THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(hi.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(lo.x))], THREE_R184_DFG_LUTX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX[((u32(hi.y) * THREE_R184_DFG_LUT_SIZEX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX) + u32(hi.x))], weight.x);
    return mix(rowLo, rowHi, weight.y);
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
    let l_1 = normalize(-(_e2));
    let halfVector = (viewDir + l_1);
    let halfVectorLengthSquared = max(dot(halfVector, halfVector), 0.00000001f);
    let h = (halfVector * inverseSqrt(halfVectorLengthSquared));
    let nDotL_2 = max(dot(normal_6, l_1), 0f);
    let nDotV_2 = max(dot(normal_6, viewDir), 0.00001f);
    let nDotH_1 = max(dot(normal_6, h), 0f);
    let vDotH_1 = max(dot(viewDir, h), 0f);
    let _e26 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(vDotH_1, F0_5);
    let roughness_6 = sqrt(max(alphaSq, 0f));
    let _e31 = threeR184DirectMultiScatterX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(roughness_6, nDotV_2, nDotL_2, F0_5);
    let _e32 = d_ggxX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotH_1, alphaSq);
    let _e33 = v_smithX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(nDotV_2, nDotL_2, alphaSq);
    let specular = (((_e32 * _e33) * _e26) + _e31);
    let diffuse = (((1f - metallic_1) * baseColor) / vec3(3.1415927f));
    let _e48 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.lightColor;
    return (((diffuse + specular) * _e48) * nDotL_2);
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

fn _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos: vec3<f32>, layer_3: u32, count_4: u32, normal_7: vec3<f32>, l: vec3<f32>, useNormalBias: bool) -> f32 {
    var local: bool;
    var local_1: bool;
    var local_2: bool;
    var local_3: bool;
    var blocked: f32 = 0f;
    var local_4: bool;
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
    let uv_3 = ((tileUv * _e14) + _e15);
    let currentDepth = projCoords.z;
    let _e33 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
    let _e36 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.normalBias;
    let _e46 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.depthBias;
    let bias = select(_e33, max((_e36 * (1f - dot(normal_7, l))), _e46), useNormalBias);
    let adjustedDepth = (currentDepth - bias);
    if (tileUv.x >= 0f) {
        local = (tileUv.x <= 1f);
    } else {
        local = false;
    }
    let _e59 = local;
    if _e59 {
        local_1 = (tileUv.y >= 0f);
    } else {
        local_1 = false;
    }
    let _e66 = local_1;
    if _e66 {
        local_2 = (tileUv.y <= 1f);
    } else {
        local_2 = false;
    }
    let _e73 = local_2;
    if _e73 {
        local_3 = (currentDepth <= 1f);
    } else {
        local_3 = false;
    }
    let _e79 = local_3;
    if !(_e79) {
        return 1f;
    }
    let _e84 = textureDimensions(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 0i);
    let texelDims = vec2<f32>(_e84);
    let texel = vec2<f32>((1f / texelDims.x), (1f / texelDims.y));
    let tileLo = (_e15 + texel);
    let tileHi = ((_e15 + _e14) - texel);
    let _e99 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.directionalShadowFilter.x;
    let filterProfile = clamp(u32(round(_e99)), 1u, 5u);
    let kernel = select(select(3u, 5u, (filterProfile == 3u)), 1u, (filterProfile == 1u));
    if (kernel == 1u) {
        let lit = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, clamp(uv_3, tileLo, tileHi), adjustedDepth);
        return lit;
    }
    if (kernel == 3u) {
        if all((uv_3 >= (tileLo + texel))) {
            local_4 = all((uv_3 <= (tileHi - texel)));
        } else {
            local_4 = false;
        }
        let interior = local_4;
        if interior {
            let pcfFraction = fract(((uv_3 / texel) - vec2(0.5f)));
            let loWeight = (vec2(2f) - pcfFraction);
            let hiWeight = (vec2(1f) + pcfFraction);
            let loOffset = ((vec2(-1f) - pcfFraction) + (vec2(1f) / loWeight));
            let hiOffset = ((vec2(1f) - pcfFraction) + (pcfFraction / hiWeight));
            let litLoLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_3 + (vec2<f32>(loOffset.x, loOffset.y) * texel)), adjustedDepth);
            let litHiLo = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_3 + (vec2<f32>(hiOffset.x, loOffset.y) * texel)), adjustedDepth);
            let litLoHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_3 + (vec2<f32>(loOffset.x, hiOffset.y) * texel)), adjustedDepth);
            let litHiHi = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, (uv_3 + (vec2<f32>(hiOffset.x, hiOffset.y) * texel)), adjustedDepth);
            return ((((((litLoLo * loWeight.x) * loWeight.y) + ((litHiLo * hiWeight.x) * loWeight.y)) + ((litLoHi * loWeight.x) * hiWeight.y)) + ((litHiHi * hiWeight.x) * hiWeight.y)) / 9f);
        }
        loop {
            let _e209 = x;
            if (_e209 <= 1i) {
            } else {
                break;
            }
            {
                y = -1i;
                loop {
                    let _e214 = y;
                    if (_e214 <= 1i) {
                    } else {
                        break;
                    }
                    {
                        let _e217 = x;
                        let _e219 = y;
                        let offsetUv = clamp((uv_3 + (vec2<f32>(f32(_e217), f32(_e219)) * texel)), tileLo, tileHi);
                        let lit_1 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv, adjustedDepth);
                        let _e229 = blocked;
                        blocked = (_e229 + (1f - lit_1));
                    }
                    continuing {
                        let _e234 = y;
                        y = (_e234 + 1i);
                    }
                }
            }
            continuing {
                let _e237 = x;
                x = (_e237 + 1i);
            }
        }
        let _e239 = blocked;
        return (1f - (_e239 / 9f));
    }
    loop {
        let _e245 = x_1;
        if (_e245 <= 2i) {
        } else {
            break;
        }
        {
            y_1 = -2i;
            loop {
                let _e250 = y_1;
                if (_e250 <= 2i) {
                } else {
                    break;
                }
                {
                    let _e253 = x_1;
                    let _e255 = y_1;
                    let offsetUv_1 = clamp((uv_3 + (vec2<f32>(f32(_e253), f32(_e255)) * texel)), tileLo, tileHi);
                    let lit_2 = textureSampleCompareLevel(shadowMapX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, shadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, offsetUv_1, adjustedDepth);
                    let _e264 = blocked;
                    blocked = (_e264 + (1f - lit_2));
                }
                continuing {
                    let _e269 = y_1;
                    y_1 = (_e269 + 1i);
                }
            }
        }
        continuing {
            let _e272 = x_1;
            x_1 = (_e272 + 1i);
        }
    }
    let _e274 = blocked;
    return (1f - (_e274 / 25f));
}

fn evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(normal_8: vec3<f32>, worldPos_1: vec3<f32>, viewZ: f32) -> f32 {
    var shadow: f32;
    var local_5: bool;

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
    let _e32 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_1, _e28, count_5, normal_8, l_2, true);
    shadow = _e32;
    let _e36 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
    if (_e36 > 0f) {
        local_5 = ((_e28 + 1u) < count_5);
    } else {
        local_5 = false;
    }
    let _e45 = local_5;
    if _e45 {
        let spCurr = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.splitPlanes[_e28].x;
        let _e53 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cascadeBlend;
        let blendWidth = (spCurr * _e53);
        if (blendWidth > 0f) {
            let dist = (spCurr - viewDepth_1);
            let t_1 = clamp((1f - (dist / blendWidth)), 0f, 1f);
            if (t_1 > 0f) {
                let _e69 = _sampleShadowForCascadeX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(worldPos_1, (_e28 + 1u), count_5, normal_8, l_2, true);
                shadow = mix(_e32, _e69, t_1);
            }
        }
    }
    let _e71 = shadow;
    return _e71;
}

fn sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture: texture_2d<f32>, textureSampler: sampler, uv: vec2<f32>, uvScale: vec2<f32>) -> vec4<f32> {
    let _e5 = textureSample(texture, textureSampler, (uv * uvScale));
    return _e5;
}

fn sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture_1: texture_2d<f32>, textureSampler_1: sampler, uv_1: vec2<f32>, uvScale_1: vec2<f32>) -> vec4<f32> {
    let _e4 = sampleMaterialTextureLinearX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(texture_1, textureSampler_1, uv_1, uvScale_1);
    return _e4;
}

fn sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_1: vec4<f32>) -> vec2<f32> {
    let safeW = select(0.000001f, clip_1.w, (abs(clip_1.w) >= 0.000001f));
    let ndc = (clip_1.xy / vec2(safeW));
    return vec2<f32>(((ndc.x * 0.5f) + 0.5f), (0.5f - (ndc.y * 0.5f)));
}

fn sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_2: vec4<f32>, temporalProjection_1: vec4<f32>) -> f32 {
    let _e2 = sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(clip_2, temporalProjection_1);
    return log2((1f + max(-(_e2), 0f)));
}

fn packSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip: vec4<f32>, previousClip: vec4<f32>, temporalProjection_2: vec4<f32>, reactive_1: f32) -> vec4<f32> {
    let _e1 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip);
    let _e3 = sceneTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(previousClip);
    let _e6 = sceneTemporalViewDepthX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip, temporalProjection_2);
    return vec4<f32>((_e1 - _e3), _e6, clamp(reactive_1, 0f, 1f));
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

fn resolvePbrTemporalReactiveX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(reactive_2: f32, baseColorAlpha: f32, sampledAlpha: f32) -> f32 {
    let coverage_1 = clamp((baseColorAlpha * sampledAlpha), 0f, 1f);
    let coverageReactive = (1f - coverage_1);
    return max(clamp(reactive_2, 0f, 1f), coverageReactive);
}

fn projectPbrSceneTemporalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(baseColorAlpha_1: f32, alphaCutoff: f32, baseColorTextureEnabled: bool, baseColorTexture: texture_2d<f32>, baseColorSampler: sampler, transform_1: vec4<f32>, metadata_1: vec4<f32>, currentClip_1: vec4<f32>, previousClip_1: vec4<f32>, temporalProjection_3: vec4<f32>, reactive_3: f32, uv0_1: vec2<f32>, uv1_1: vec2<f32>, uv2_1: vec2<f32>, uv3_1: vec2<f32>, uv4_1: vec2<f32>, uv5_1: vec2<f32>, uv6_1: vec2<f32>, uv7_1: vec2<f32>) -> vec4<f32> {
    var baseSample: vec4<f32> = vec4(1f);
    var local_6: bool;

    if baseColorTextureEnabled {
        let _e13 = transformedPbrTemporalUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(transform_1, metadata_1, uv0_1, uv1_1, uv2_1, uv3_1, uv4_1, uv5_1, uv6_1, uv7_1);
        let _e17 = sampleMaterialTextureX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(baseColorTexture, baseColorSampler, _e13, metadata_1.zw);
        baseSample = _e17;
    }
    if (alphaCutoff > 0f) {
        let _e24 = baseSample.w;
        local_6 = ((baseColorAlpha_1 * _e24) <= alphaCutoff);
    } else {
        local_6 = false;
    }
    let _e30 = local_6;
    if _e30 {
        discard;
    }
    let _e32 = baseSample.w;
    let _e34 = resolvePbrTemporalReactiveX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX(reactive_3, baseColorAlpha_1, _e32);
    let _e38 = packSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(currentClip_1, previousClip_1, temporalProjection_3, _e34);
    return _e38;
}

fn standardUsesBaseColorTexture() -> bool {
    return ((standardTextureMask & 1u) != 0u);
}

fn standardUsesMetallicRoughnessTexture() -> bool {
    return ((standardTextureMask & 2u) != 0u);
}

fn standardUsesNormalTexture() -> bool {
    return ((standardTextureMask & 4u) != 0u);
}

fn standardUsesSpecularColorTexture() -> bool {
    return ((standardTextureMask & 8u) != 0u);
}

fn standardUsesEmissiveTexture() -> bool {
    return ((standardTextureMask & 16u) != 0u);
}

fn standardUsesOcclusionTexture() -> bool {
    return ((standardTextureMask & 32u) != 0u);
}

fn standardUsesTransmissionTexture() -> bool {
    return ((standardTextureMask & 64u) != 0u);
}

fn standardUsesThicknessTexture() -> bool {
    return ((standardTextureMask & 128u) != 0u);
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

fn materialTextureFilteringWitness() {
    let baseWitness = textureSample(baseColorTexture_1, baseColorTexture_sampler, vec2(0f));
    let metallicRoughnessWitness = textureSample(metallicRoughnessTexture, metallicRoughnessTexture_sampler, vec2(0f));
    let normalWitness = textureSample(normalTexture, normalTexture_sampler, vec2(0f));
    let emissiveWitness = textureSample(emissiveTexture, emissiveTexture_sampler, vec2(0f));
    let occlusionWitness = textureSample(occlusionTexture, occlusionTexture_sampler, vec2(0f));
    return;
}

fn vs_main_impl(in_6: VsIn, meshIndex: u32, instanceIndex: u32, materialIndex: u32) -> VsOut {
    var out_2: VsOut;

    let instanceLocal = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[instanceIndex].localFromInstance;
    let entityWorld = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[meshIndex].worldFromLocal;
    let localToWorld = (entityWorld * instanceLocal);
    let world = (localToWorld * vec4<f32>(in_6.pos, 1f));
    let _e20 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out_2.clip = (_e20 * world);
    let _e25 = out_2.clip;
    let _e28 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e29 = sceneViewZX_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(_e25, _e28);
    out_2.positionOSAndViewZ = vec4<f32>(in_6.pos, _e29);
    out_2.worldPos = world.xyz;
    let a_2 = entityWorld[0].xyz;
    let b = entityWorld[1].xyz;
    let c_1 = entityWorld[2].xyz;
    let cof0_ = cross(b, c_1);
    let cof1_ = cross(c_1, a_2);
    let cof2_ = cross(a_2, b);
    let det = dot(a_2, cof0_);
    let entityNormal = select(in_6.normal, ((((cof0_ * in_6.normal.x) + (cof1_ * in_6.normal.y)) + (cof2_ * in_6.normal.z)) / vec3(det)), (abs(det) >= 0.000001f));
    out_2.worldNormal = normalize(entityNormal);
    let worldTangentXyz = normalize(((entityWorld * instanceLocal) * vec4<f32>(in_6.tangent.xyz, 0f)).xyz);
    out_2.worldTangent = vec4<f32>(worldTangentXyz, in_6.tangent.w);
    out_2.uv = in_6.uv;
    out_2.uv1_ = in_6.uv1_;
    out_2.uv2_ = in_6.uv2_;
    out_2.uv3_ = in_6.uv3_;
    out_2.uv4_ = in_6.uv4_;
    out_2.uv5_ = in_6.uv5_;
    out_2.uv6And7_ = vec4<f32>(in_6.uv6_, in_6.uv7_);
    out_2.color = in_6.color;
    out_2.materialIndex = materialIndex;
    let clipPos = out_2.clip;
    out_2.ndc = vec4<f32>((clipPos.xy / vec2(clipPos.w)), (clipPos.z / clipPos.w), localToWorld[2].z);
    let _e108 = out_2;
    return _e108;
}

fn standardViewZ(in_7: VsOut) -> f32 {
    return in_7.positionOSAndViewZ.w;
}

fn selectedMaterial(index: u32) -> MaterialParameters {
    let _e3 = sceneMaterials[index];
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
    let angle_1 = metadata_2.y;
    let c_2 = cos(angle_1);
    let s_1 = sin(angle_1);
    return (vec2<f32>(((scaled_1.x * c_2) - (scaled_1.y * s_1)), ((scaled_1.x * s_1) + (scaled_1.y * c_2))) + transform_2.xy);
}

fn materialVertexColor(in_9: VsOut) -> vec4<f32> {
    return in_9.color;
}

fn standardVariantIdentity() -> f32 {
    var identity: f32 = 0f;

    let _e2 = identity;
    identity = (_e2 + 1f);
    let _e5 = identity;
    identity = (_e5 + 4f);
    let _e8 = identity;
    identity = (_e8 + 8f);
    let _e11 = identity;
    return _e11;
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
    let c_3 = cos(metadata_3.y);
    let s_2 = sin(metadata_3.y);
    return (vec2<f32>(((scaled_2.x * c_3) - (scaled_2.y * s_2)), ((scaled_2.x * s_2) + (scaled_2.y * c_3))) + transform_3.xy);
}

fn surfaceNormal(input_1: SurfaceInput, encoded: vec4<f32>, normalScale: f32) -> vec3<f32> {
    let tangentXY = (((encoded.xy * 2f) - vec2(1f)) * normalScale);
    let tangentZ = sqrt(max((1f - dot(tangentXY, tangentXY)), 0f));
    let geometric = normalize(input_1.geometricNormalWS);
    let tangent = normalize((input_1.tangentWS.xyz - (geometric * dot(geometric, input_1.tangentWS.xyz))));
    let bitangent = (normalize(cross(geometric, tangent)) * input_1.tangentWS.w);
    return normalize((((tangent * tangentXY.x) + (bitangent * tangentXY.y)) + (geometric * tangentZ)));
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
    var normal_9: vec3<f32>;
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
    normal_9 = normalize(input_2.geometricNormalWS);
    let _e29 = standardUsesNormalTexture();
    if _e29 {
        let _e32 = surfaceUv(input_2, materialValue.normalTextureCoordinatesTransform, materialValue.normalTextureCoordinatesMetadata);
        let normalSample = textureSample(normalTexture, normalTexture_sampler, (_e32 * materialValue.normalTextureCoordinatesMetadata.zw));
        let _e40 = surfaceNormal(input_2, normalSample, materialValue.normalScale);
        normal_9 = _e40;
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
    let metallic_3 = clamp((materialValue.metallic * _e75), 0f, 1f);
    let _e81 = metallicRoughnessSample;
    let _e84 = surfaceChannel(_e81, u32(materialValue.roughnessChannel));
    let roughness_7 = clamp((materialValue.roughness * _e84), 0.04f, 1f);
    let _e92 = emissiveSample;
    let emissive = ((materialValue.emissive * materialValue.emissiveIntensity) * _e92.xyz);
    let _e96 = occlusionSample.x;
    let occlusion = clamp((1f + ((_e96 - 1f) * materialValue.occlusionStrength)), 0f, 1f);
    let _e106 = normal_9;
    let _e110 = baseSample_1.w;
    return SurfaceData(baseColor_1, _e106, metallic_3, roughness_7, emissive, occlusion, clamp(((materialValue.baseColor.w * _e110) * vertexColor.w), 0f, 1f), clamp(materialValue.alphaCutoff, 0f, 1f));
}

fn evaluateStandardSurface(in_10: VsOut, frontFacing_2: bool) -> SurfaceData {
    let _e3 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let viewDirectionWS = normalize((_e3 - in_10.worldPos));
    let positionOS = in_10.positionOSAndViewZ.xyz;
    let _e22 = materialVertexColor(in_10);
    let input_4 = SurfaceInput(positionOS, in_10.worldPos, in_10.worldNormal, in_10.worldTangent, viewDirectionWS, in_10.uv, in_10.uv1_, in_10.uv2_, in_10.uv3_, in_10.uv4_, in_10.uv5_, in_10.uv6And7_.xy, in_10.uv6And7_.zw, _e22, frontFacing_2);
    let _e26 = selectedMaterial(in_10.materialIndex);
    let _e27 = evaluate_standard_surface(input_4, _e26);
    return _e27;
}

fn composeProbeDiffuse(shPreblend_2: array<vec4<f32>, 9>, localBlendFraction_1: f32, normal_10: vec3<f32>, skyIrradiance: vec3<f32>, kD: vec3<f32>, albedo_1: vec3<f32>, metallic_2: f32) -> vec3<f32> {
    let _e7 = evaluateProbeDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PXA4TPMJSQX(shPreblend_2, localBlendFraction_1, normal_10, skyIrradiance, kD, albedo_1, metallic_2);
    return _e7;
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

fn blendLinearTransparent(source_3: vec3<f32>, destination: vec3<f32>, alpha: f32) -> vec3<f32> {
    return ((source_3 * alpha) + (destination * (1f - alpha)));
}

fn alphaTestSurface(surface: SurfaceData) {
    var local_7: bool;

    if (surface.alphaClipThreshold > 0f) {
        local_7 = (surface.opacity <= surface.alphaClipThreshold);
    } else {
        local_7 = false;
    }
    let _e10 = local_7;
    if _e10 {
        discard;
    } else {
        return;
    }
}

fn standardSurfaceF0_(in_11: VsOut, surface_1: SurfaceData) -> vec3<f32> {
    var specularColor: vec3<f32>;
    var specularWeight: f32;

    let albedo_2 = surface_1.baseColor;
    let _e4 = finiteScalar(surface_1.metallic, 0f);
    let metallic_4 = clamp(_e4, 0f, 1f);
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
    return mix(((vec3(dielectricF0_) * _e36) * _e38), albedo_2, metallic_4);
}

fn standardSsrCoverage() -> f32 {
    var coverage: f32 = 1f;

    let _e2 = coverage;
    return _e2;
}

fn temporalVertexAlpha(in_12: TemporalVsOut) -> f32 {
    return in_12.color.w;
}

fn evaluate_surface(input_3: SurfaceInput) -> SurfaceData {
    let _e1 = material;
    let _e3 = evaluate_standard_surface(input_3, _e1);
    return _e3;
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    let _e4 = vs_main_impl(in, 0u, idx, 4294967295u);
    return _e4;
}

@vertex 
fn vs_scene_index(in_1: VsIn, @builtin(instance_index) idx_1: u32) -> VsOut {
    let visible = visibleItems[idx_1];
    let _e8 = vs_main_impl(in_1, visible.x, 0u, visible.y);
    return _e8;
}

@fragment 
fn fs_main(in_2: VsOut, @builtin(front_facing) frontFacing: bool) -> StandardPbrOutput {
    var f0_: vec3<f32>;
    var physicalNormal: vec3<f32>;
    var diffuseAlbedo: vec3<f32>;
    var coatRoughness: f32 = 0.04f;
    var coatAlpha: f32;
    var coatF: vec3<f32> = vec3(0f);
    var irradiance: vec3<f32> = vec3(0f);
    var specularIbl: vec3<f32> = vec3(0f);
    var reflectionFallback: vec3<f32>;
    var ambient: vec3<f32>;
    var color: vec3<f32>;
    var output: StandardPbrOutput;

    let _e3 = standardVariantIdentity();
    let _e6 = selectedMaterial(in_2.materialIndex);
    let _e8 = evaluateStandardSurface(in_2, frontFacing);
    alphaTestSurface(_e8);
    let alpha_1 = _e8.opacity;
    let albedo_3 = _e8.baseColor;
    let _e13 = finiteScalar(_e8.metallic, 0f);
    let metallic_5 = clamp(_e13, 0f, 1f);
    let _e19 = finiteScalar(_e8.roughness, 0.5f);
    let iblRoughness = clamp(_e19, 0.04f, 1f);
    let a_3 = (iblRoughness * iblRoughness);
    let n = normalize(_e8.normalWS);
    let _e28 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let v = normalize((_e28 - in_2.worldPos));
    let _e34 = finiteScalar(_e6.ior, 1.5f);
    let safeIor_1 = max(_e34, 1f);
    let dielectricF0_1 = pow(((safeIor_1 - 1f) / (safeIor_1 + 1f)), 2f);
    let _e44 = standardSurfaceF0_(in_2, _e8);
    f0_ = _e44;
    physicalNormal = n;
    diffuseAlbedo = albedo_3;
    let _e50 = physicalNormal;
    let _e54 = f0_;
    let _e55 = f_schlickX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUYTSMRTAX(max(dot(_e50, v), 0f), _e54);
    let kD_1 = ((vec3(1f) - _e55) * (1f - metallic_5));
    let _e61 = coatRoughness;
    let _e62 = coatRoughness;
    coatAlpha = (_e61 * _e62);
    let _e67 = skylight.intensity;
    if (_e67 < 0f) {
        let _e70 = physicalNormal;
        let _e71 = f0_;
        let _e75 = skylight.colorR;
        let _e78 = skylight.colorG;
        let _e81 = skylight.colorB;
        let _e85 = skylight.rotation;
        let _e96 = sampleReflectionProbeSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e70, v, iblRoughness, _e71, in_2.worldPos, vec3<f32>(_e75, _e78, _e81), _e85.xyz, vec4<f32>(0f, 0f, 0f, 1f), prefilterMap_1, prefilterSampler_1, brdfLut_3, brdfLutSampler_3);
        specularIbl = _e96;
    } else {
        let _e98 = physicalNormal;
        let _e101 = skylight.rotation;
        let _e104 = sampleIblDiffuseX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e98, _e101, irradianceMap_1, irradianceSampler_1);
        irradiance = _e104;
        let _e106 = physicalNormal;
        let _e107 = f0_;
        let _e110 = skylight.rotation;
        let _e115 = sampleIblSpecularX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(_e106, v, iblRoughness, _e107, _e110, prefilterMap_1, prefilterSampler_1, brdfLut_3, brdfLutSampler_3);
        specularIbl = _e115;
    }
    let ao = _e8.occlusion;
    let _e119 = skylight.colorR;
    let _e122 = skylight.colorG;
    let _e125 = skylight.colorB;
    let skyColor_1 = vec3<f32>(_e119, _e122, _e125);
    let _e129 = skylight.intensity;
    let skyFactor = (skyColor_1 * _e129);
    let _e133 = skylight.intensity;
    let _e134 = decodeSpecularEnvironmentScaleX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(skyColor_1, _e133);
    let _e135 = specularIbl;
    let _e139 = coatF;
    reflectionFallback = (_e135 * (vec3(1f) - _e139));
    let _e143 = irradiance;
    let _e145 = diffuseAlbedo;
    let _e147 = specularIbl;
    let _e151 = coatF;
    ambient = ((((kD_1 * _e143) * _e145) + _e147) * (vec3(1f) - _e151));
    let _e157 = probeBlendRecords[1];
    let _e160 = probeBlendRecords[2];
    let _e163 = probeBlendRecords[3];
    let _e166 = probeBlendRecords[4];
    let _e169 = probeBlendRecords[5];
    let _e172 = probeBlendRecords[6];
    let _e175 = probeBlendRecords[7];
    let _e178 = probeBlendRecords[8];
    let _e181 = probeBlendRecords[9];
    let probeShPreblend = array<vec4<f32>, 9>(_e157, _e160, _e163, _e166, _e169, _e172, _e175, _e178, _e181);
    let probeLocalBlendFraction = probeBlendRecords[0].z;
    let probeDiffuseK = (kD_1 / max(vec3((1f - metallic_5)), vec3(0.0001f)));
    let _e194 = physicalNormal;
    let _e195 = irradiance;
    let _e197 = diffuseAlbedo;
    let _e198 = composeProbeDiffuse(probeShPreblend, probeLocalBlendFraction, _e194, (_e195 * skyFactor), probeDiffuseK, _e197, metallic_5);
    let _e199 = specularIbl;
    let _e204 = coatF;
    ambient = ((_e198 + (_e199 * _e134)) * (vec3(1f) - _e204));
    let _e207 = ambient;
    ambient = (_e207 * ao);
    let _e209 = reflectionFallback;
    reflectionFallback = ((_e209 * _e134) * ao);
    let _e212 = ambient;
    color = _e212;
    let _e214 = physicalNormal;
    let _e216 = standardViewZ(in_2);
    let _e217 = evalDirectionalShadowFactorX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e214, in_2.worldPos, _e216);
    let _e218 = physicalNormal;
    let _e219 = diffuseAlbedo;
    let _e220 = f0_;
    let _e221 = evalDirectionalNoShadowX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWI2LSMVRXI2LPNZQWYX(_e218, v, _e219, metallic_5, a_3, _e220);
    let _e222 = color;
    color = (_e222 + (_e217 * _e221));
    let _e225 = color;
    color = (_e225 + _e8.emissive);
    let _e230 = color;
    output.color = vec4<f32>(_e230, alpha_1);
    let _e232 = output;
    return _e232;
}

@fragment 
fn fs_gbuffer(in_3: VsOut, @builtin(front_facing) frontFacing_1: bool) -> GBufferOutput {
    var out: GBufferOutput;

    let _e2 = evaluateStandardSurface(in_3, frontFacing_1);
    alphaTestSurface(_e2);
    let albedo_4 = _e2.baseColor;
    let metallic_6 = clamp(_e2.metallic, 0f, 1f);
    let roughness_8 = clamp(_e2.roughness, 0.04f, 1f);
    let n_1 = normalize(_e2.normalWS);
    out.normal_roughness = vec4<f32>(((n_1 * 0.5f) + vec3(0.5f)), roughness_8);
    out.albedo_metallic = vec4<f32>(albedo_4, metallic_6);
    let _e28 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let _e32 = standardSurfaceF0_(in_3, _e2);
    let _e35 = projectSpecularRadianceX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXGYLNOBWGS3THX(vec3(1f), n_1, normalize((_e28 - in_3.worldPos)), roughness_8, _e32, brdfLut_3, brdfLutSampler_3);
    let response = (_e35 * _e2.occlusion);
    out.specular_response_ao = vec4<f32>(response, _e2.occlusion);
    let _e41 = out;
    return _e41;
}

@vertex 
fn vs_temporal(in_4: VsIn, @builtin(instance_index) idx_2: u32) -> TemporalVsOut {
    var previousWorld: vec4<f32>;
    var out_1: TemporalVsOut;

    let _e3 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].worldFromLocal;
    let _e9 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx_2].localFromInstance;
    let currentWorld = ((_e3 * _e9) * vec4<f32>(in_4.pos, 1f));
    previousWorld = currentWorld;
    let _e19 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].previousWorldFromLocal;
    let _e23 = instancesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx_2].previousLocalFromInstance;
    previousWorld = ((_e19 * _e23) * vec4<f32>(in_4.pos, 1f));
    let _e33 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalCurrentViewProj;
    out_1.currentClip = (_e33 * currentWorld);
    let _e38 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out_1.clip = (_e38 * currentWorld);
    let _e43 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalPreviousViewProj;
    let _e44 = previousWorld;
    out_1.previousClip = (_e43 * _e44);
    out_1.uv = in_4.uv;
    out_1.uv1_ = in_4.uv1_;
    out_1.uv2_ = in_4.uv2_;
    out_1.uv3_ = in_4.uv3_;
    out_1.uv4_ = in_4.uv4_;
    out_1.uv5_ = in_4.uv5_;
    out_1.uv6_ = in_4.uv6_;
    out_1.uv7_ = in_4.uv7_;
    out_1.color = in_4.color;
    let _e64 = out_1;
    return _e64;
}

@fragment 
fn fs_temporal(in_5: TemporalVsOut) -> @location(0) vec4<f32> {
    var reactive: f32 = 0f;

    let _e5 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[0].temporal.x;
    reactive = _e5;
    let _e10 = material.baseColor.w;
    let _e12 = temporalVertexAlpha(in_5);
    let _e16 = material.alphaCutoff;
    let _e17 = standardUsesBaseColorTexture();
    let _e20 = material.baseColorTextureCoordinatesTransform;
    let _e23 = material.baseColorTextureCoordinatesMetadata;
    let _e28 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection;
    let _e29 = reactive;
    let _e40 = projectPbrSceneTemporalX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU5DFNVYG64TBNQX((_e10 * _e12), _e16, _e17, baseColorTexture_1, baseColorTexture_sampler, _e20, _e23, in_5.currentClip, in_5.previousClip, _e28, _e29, in_5.uv, in_5.uv1_, in_5.uv2_, in_5.uv3_, in_5.uv4_, in_5.uv5_, in_5.uv6_, in_5.uv7_);
    return _e40;
}
