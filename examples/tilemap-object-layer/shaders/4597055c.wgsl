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

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) emissive_intensity: vec4<f32>,
    @location(3) surface: vec4<f32>,
    @location(4) clip_position: vec3<f32>,
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
    @location(9) base_color: vec4<f32>,
    @location(10) emissive_intensity: vec4<f32>,
    @location(11) surface: vec4<f32>,
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
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    let offset = (((input.right * input.geometry_position.x) + (input.up * input.geometry_position.y)) + (input.forward * input.geometry_position.z));
    let clipPosition = (input.center + offset);
    output.position = vec4<f32>(clipPosition, 1f);
    output.clip_position = clipPosition;
    output.color = (input.particle_color * input.base_color);
    output.normal = normalize((((input.right * input.geometry_normal.x) + (input.up * input.geometry_normal.y)) + (input.forward * input.geometry_normal.z)));
    output.emissive_intensity = input.emissive_intensity;
    output.surface = input.surface;
    let _e46 = output;
    return _e46;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let normal = normalize(input_1.normal);
    let light_direction = vec3<f32>(0.36589587f, 0.73179173f, 0.57497925f);
    let view_direction = vec3<f32>(0f, 0f, 1f);
    let half_direction = normalize((light_direction + view_direction));
    let diffuse = (0.2f + (0.8f * max(dot(normal, light_direction), 0f)));
    let metallic = clamp(input_1.surface.x, 0f, 1f);
    let roughness = clamp(input_1.surface.y, 0.04f, 1f);
    let clearcoat = clamp(input_1.surface.z, 0f, 1f);
    let clearcoat_roughness = clamp(input_1.surface.w, 0.04f, 1f);
    let specular_power = mix(96f, 4f, roughness);
    let coat_power = mix(192f, 8f, clearcoat_roughness);
    let specular = pow(max(dot(normal, half_direction), 0f), specular_power);
    let coat = (clearcoat * pow(max(dot(normal, half_direction), 0f), coat_power));
    let dielectric = vec3(0.04f);
    let specular_color = mix(dielectric, input_1.color.xyz, metallic);
    let lit = ((input_1.color.xyz * diffuse) * (1f - (metallic * 0.55f)));
    let emissive = (input_1.emissive_intensity.xyz * input_1.emissive_intensity.w);
    let _e75 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.fog;
    let _e77 = fogRayFromNdcX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(input_1.clip_position);
    let _e86 = apply_fogX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(_e75, _e77, vec4<f32>((((lit + (specular_color * specular)) + vec3(coat)) + emissive), input_1.color.w));
    return vec4<f32>((_e86.xyz * _e86.w), _e86.w);
}
