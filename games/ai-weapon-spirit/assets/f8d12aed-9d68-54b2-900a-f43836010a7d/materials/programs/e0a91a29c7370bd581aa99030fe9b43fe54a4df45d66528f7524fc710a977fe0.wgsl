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

struct MaterialParametersX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX {
    baseColor: vec4<f32>,
    emissive: vec3<f32>,
    emissiveIntensity: f32,
    metallic: f32,
    roughness: f32,
    clearcoat: f32,
    clearcoatRoughness: f32,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) emissive_intensity: vec4<f32>,
    @location(4) surface: vec4<f32>,
    @location(5) center: vec3<f32>,
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

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(1) @binding(0) 
var<uniform> materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX: MaterialParametersX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX;

fn mesh_world_normalX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5G2ZLTNBPXG4DBMNSQX(right: vec3<f32>, up: vec3<f32>, forward: vec3<f32>, normal: vec3<f32>) -> vec3<f32> {
    let x = cross(up, forward);
    let y = cross(forward, right);
    let z = cross(right, up);
    let sign_ = select(-1f, 1f, (dot(right, x) >= 0f));
    let value = (sign_ * (((x * normal.x) + (y * normal.y)) + (z * normal.z)));
    let magnitude = length(value);
    if (magnitude > 0.000001f) {
        return (value / vec3(magnitude));
    }
    return vec3<f32>(0f, 1f, 0f);
}

@vertex 
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    var particleColor: vec4<f32>;

    let offset = (((input.right * input.geometry_position.x) + (input.up * input.geometry_position.y)) + (input.forward * input.geometry_position.z));
    output.center = input.center;
    let _e21 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    output.position = (_e21 * vec4<f32>((input.center + offset), 1f));
    particleColor = input.particle_color;
    let _e30 = particleColor.z;
    if (_e30 >= 1.5f) {
        let _e34 = particleColor.z;
        let tier = u32(min(3f, floor((_e34 / 2f))));
        if (tier == 1u) {
            let _e44 = particleColor.w;
            particleColor = vec4<f32>(0.8f, 0.1f, 1f, _e44);
        } else {
            if (tier == 2u) {
                let _e52 = particleColor.w;
                particleColor = vec4<f32>(0.06f, 0.58f, 1f, _e52);
            } else {
                if (tier == 3u) {
                    let _e60 = particleColor.w;
                    particleColor = vec4<f32>(0.055f, 0.012f, 0.12f, _e60);
                }
            }
        }
    }
    let _e66 = particleColor;
    let _e69 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.baseColor;
    output.color = (_e66 * _e69);
    let _e76 = mesh_world_normalX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5G2ZLTNBPXG4DBMNSQX(input.right, input.up, input.forward, input.geometry_normal);
    output.normal = _e76;
    output.uv = input.geometry_uv;
    let _e82 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.emissive;
    let _e85 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.emissiveIntensity;
    output.emissive_intensity = vec4<f32>(_e82, _e85);
    let _e90 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.metallic;
    let _e93 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.roughness;
    let _e96 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.clearcoat;
    let _e99 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.clearcoatRoughness;
    output.surface = vec4<f32>(_e90, _e93, _e96, _e99);
    let _e101 = output;
    return _e101;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let normal_1 = normalize(input_1.normal);
    let key = vec3<f32>(0.36079463f, 0.82181f, 0.44097123f);
    let side = (0.42f + (0.58f * abs(dot(normal_1, key))));
    let facet = (0.72f + (0.28f * step(0.5f, input_1.uv.y)));
    let emissive = (input_1.emissive_intensity.xyz * input_1.emissive_intensity.w);
    let alpha = clamp(input_1.color.w, 0f, 1f);
    let rgb = (((input_1.color.xyz * side) * facet) + (emissive * (0.08f + (side * 0.12f))));
    return vec4<f32>((rgb * alpha), alpha);
}
