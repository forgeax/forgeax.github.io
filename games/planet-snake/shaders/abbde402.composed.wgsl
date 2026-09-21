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

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) local: vec2<f32>,
    @location(2) emissive_intensity: vec4<f32>,
    @location(3) surface: vec4<f32>,
    @location(4) sheet_uv: vec2<f32>,
    @location(5) sheet_frame: f32,
    @location(6) fade_distance: f32,
    @location(7) clip_position: vec3<f32>,
}

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) right: vec2<f32>,
    @location(2) up: vec2<f32>,
    @location(3) particle_color: vec4<f32>,
    @location(4) base_color: vec4<f32>,
    @location(5) emissive_intensity: vec4<f32>,
    @location(6) surface: vec4<f32>,
    @location(7) advanced: vec4<f32>,
    @location(8) texture_sheet: vec4<f32>,
}

const FOG_EXP_LIMITX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX: f32 = 80f;
const FOG_Q_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX: f32 = 0.000001f;

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(1) 
var scene_depth: texture_depth_2d;

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

fn textureSheetFrame(age: f32, frameRate: f32, frameCount: u32) -> u32 {
    var local: bool;

    if !((frameCount == 0u)) {
        local = (frameRate <= 0f);
    } else {
        local = true;
    }
    let _e10 = local;
    if _e10 {
        return 0u;
    }
    return min((frameCount - 1u), u32(max(0f, floor((age * frameRate)))));
}

fn textureSheetUv(local_1: vec2<f32>, frame: u32, columns: u32, rows: u32) -> vec2<f32> {
    let safeColumns = max(columns, 1u);
    let safeRows = max(rows, 1u);
    let cell = vec2<u32>((frame % safeColumns), (frame / safeColumns));
    return ((((local_1 + vec2(1f)) * 0.5f) / vec2<f32>(f32(safeColumns), f32(safeRows))) + vec2<f32>((f32(cell.x) / f32(safeColumns)), (f32(cell.y) / f32(safeRows))));
}

fn billboardPivot(corner: vec2<f32>, pivot: vec2<f32>) -> vec2<f32> {
    return (corner + (pivot * 2f));
}

fn softParticleFactor(particleDepth: f32, sceneDepth: f32, fadeDistance: f32) -> f32 {
    if (fadeDistance <= 0f) {
        return 1f;
    }
    return clamp(((sceneDepth - particleDepth) / fadeDistance), 0f, 1f);
}

fn billboardSortingKey(depth: f32, mode: u32) -> f32 {
    return select(0f, depth, (mode == 2u));
}

fn softParticle(position: vec4<f32>, alpha: f32, fadeDistance_1: f32) -> f32 {
    let pixel = vec2<i32>(position.xy);
    let sceneDepth_1 = textureLoad(scene_depth, pixel, 0i);
    if (fadeDistance_1 <= 0f) {
        return select(alpha, 0f, (position.z > sceneDepth_1));
    }
    let _e15 = softParticleFactor(position.z, sceneDepth_1, fadeDistance_1);
    return (alpha * _e15);
}

fn fogWorldPoint(ndc: vec3<f32>) -> vec3<f32> {
    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.inverseViewProj;
    let homogeneous = (_e2 * vec4<f32>(ndc, 1f));
    let divisor = select(1f, homogeneous.w, (abs(homogeneous.w) > 0.000001f));
    return (homogeneous.xyz / vec3(divisor));
}

fn fogRayFromNdc(ndc_1: vec3<f32>) -> FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fogWorldPoint(ndc_1);
    let _e5 = fogWorldPoint(vec3<f32>(ndc_1.xy, 0f));
    let _e9 = fogWorldPoint(vec3<f32>(ndc_1.xy, 1f));
    let _e13 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.temporalProjection.z;
    let perspective = (_e13 < 0.5f);
    let _e18 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let perspectiveVector = (_e1 - _e18);
    let orthographicVector = (_e9 - _e5);
    let direction = normalize(select(orthographicVector, perspectiveVector, perspective));
    let _e25 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.cameraPos;
    let origin = select(_e5, _e25, perspective);
    let ray_distance = select(max(dot((_e1 - _e5), direction), 0f), length(perspectiveVector), perspective);
    return FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(origin, direction, ray_distance);
}

@vertex 
fn vs_main(input: VertexInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(-1f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(-1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(-1f, 1f));
    let _e24 = billboardPivot(corners[vertex_index], input.advanced.xy);
    let clipPosition = vec3<f32>(((input.position.xy + (input.right * _e24.x)) + (input.up * _e24.y)), input.position.z);
    output.position = vec4<f32>(clipPosition, 1f);
    output.clip_position = clipPosition;
    output.color = (input.particle_color * input.base_color);
    output.local = _e24;
    output.emissive_intensity = input.emissive_intensity;
    output.surface = input.surface;
    let _e63 = textureSheetUv(corners[vertex_index], u32(input.advanced.z), u32(input.texture_sheet.x), u32(input.texture_sheet.y));
    output.sheet_uv = _e63;
    output.sheet_frame = input.advanced.z;
    output.fade_distance = input.texture_sheet.z;
    let _e70 = output;
    return _e70;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let radius = length(input_1.local);
    let edge = (1f - smoothstep(0.45f, 1f, radius));
    let core = (1f - smoothstep(0f, 0.42f, radius));
    let roughness = clamp(input_1.surface.y, 0.04f, 1f);
    let clearcoat = clamp(input_1.surface.z, 0f, 1f);
    let highlight = ((core * clearcoat) * (1f - (roughness * 0.65f)));
    let emissive = (input_1.emissive_intensity.xyz * input_1.emissive_intensity.w);
    let _e39 = softParticle(input_1.position, (input_1.color.w * edge), input_1.fade_distance);
    let sheetPulse = (0.82f + (0.18f * fract((((input_1.sheet_frame * 0.618f) + input_1.sheet_uv.x) + input_1.sheet_uv.y))));
    let rgb = (((input_1.color.xyz + (emissive * (0.35f + (core * 0.65f)))) + vec3(highlight)) * sheetPulse);
    let _e67 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.fog;
    let _e69 = fogRayFromNdc(input_1.clip_position);
    let _e71 = apply_fogX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(_e67, _e69, vec4<f32>(rgb, _e39));
    return vec4<f32>((_e71.xyz * _e71.w), _e71.w);
}
