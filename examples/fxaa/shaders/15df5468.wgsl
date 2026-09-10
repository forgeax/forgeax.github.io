struct FogViewParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    color: vec3<f32>,
    density: f32,
    heightFalloff: f32,
    maxOpacity: f32,
}

struct FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    origin: vec3<f32>,
    direction: vec3<f32>,
    distance: f32,
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

struct BeamInput {
    @location(0) start: vec3<f32>,
    @location(1) endpoint: vec3<f32>,
    @location(2) color: vec4<f32>,
    @location(3) properties: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) clip_position: vec3<f32>,
}

const FOG_EXP_LIMITX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX: f32 = 80f;
const FOG_Q_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX: f32 = 0.000001f;

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

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

fn apply_fogX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(params_1: FogViewParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, ray_1: FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, color: vec4<f32>) -> vec4<f32> {
    let _e2 = fogOpticalDepthX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(params_1, ray_1);
    let transmittance = exp(-(_e2));
    let opacity = (params_1.maxOpacity * (1f - transmittance));
    let mixed = mix(color.xyz, params_1.color, opacity);
    return vec4<f32>(mixed, color.w);
}

fn fogWorldPointX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(ndc: vec3<f32>) -> vec3<f32> {
    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.inverseViewProj;
    let homogeneous = (_e2 * vec4<f32>(ndc, 1f));
    let divisor = select(1f, homogeneous.w, (abs(homogeneous.w) > 0.000001f));
    return (homogeneous.xyz / vec3(divisor));
}

fn fogRayFromNdcX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(ndc_1: vec3<f32>) -> FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fogWorldPointX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(ndc_1);
    let _e5 = fogWorldPointX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vec3<f32>(ndc_1.xy, 0f));
    let _e9 = fogWorldPointX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vec3<f32>(ndc_1.xy, 1f));
    let _e13 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection.z;
    let perspective = (_e13 < 0.5f);
    let _e18 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let perspectiveVector = (_e1 - _e18);
    let orthographicVector = (_e9 - _e5);
    let direction = normalize(select(orthographicVector, perspectiveVector, perspective));
    let _e25 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let origin = select(_e5, _e25, perspective);
    let rayDistance = select(max(dot((_e1 - _e5), direction), 0f), length(perspectiveVector), perspective);
    return FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(origin, direction, rayDistance);
}

@vertex 
fn vs_main(input: BeamInput, @builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(0f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, 1f));
    let corner = corners[vertexIndex];
    let delta = (input.endpoint.xy - input.start.xy);
    let normal = normalize((vec2<f32>(-(delta.y), delta.x) + vec2<f32>(0.000001f, 0f)));
    let point = mix(input.start, input.endpoint, corner.x);
    let clipPosition = vec3<f32>((point.xy + ((normal * corner.y) * input.properties.x)), point.z);
    output.position = vec4<f32>(clipPosition, 1f);
    output.color = input.color;
    output.clip_position = clipPosition;
    let _e56 = output;
    return _e56;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let base = vec4<f32>(0.7f, 0.2f, 1f, 1f);
    let alpha = (base.w * input_1.color.w);
    let _e12 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.fog;
    let _e14 = fogRayFromNdcX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(input_1.clip_position);
    let _e20 = apply_fogX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(_e12, _e14, vec4<f32>((base.xyz * input_1.color.xyz), alpha));
    return vec4<f32>((_e20.xyz * _e20.w), _e20.w);
}
