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

struct Input {
    @location(0) p: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) tangent: vec4<f32>,
    @location(4) center: vec3<f32>,
    @location(5) right: vec3<f32>,
    @location(6) up: vec3<f32>,
    @location(7) forward: vec3<f32>,
    @location(8) color: vec4<f32>,
    @location(9) render_controls: vec2<f32>,
}

struct Out {
    @builtin(position) position: vec4<f32>,
    @location(0) local: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) tint: vec4<f32>,
    @location(3) alpha: f32,
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
fn vs_main(i: Input) -> Out {
    var o: Out;

    let _e5 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    o.position = (_e5 * vec4<f32>((((i.center + (i.right * i.p.x)) + (i.up * i.p.y)) + (i.forward * i.p.z)), 1f));
    o.local = i.p;
    let _e32 = mesh_world_normalX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5G2ZLTNBPXG4DBMNSQX(i.right, i.up, i.forward, i.normal);
    o.normal = _e32;
    let _e36 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.baseColor;
    o.tint = _e36;
    o.alpha = i.color.w;
    let _e40 = o;
    return _e40;
}

@fragment 
fn fs_main(i_1: Out) -> @location(0) vec4<f32> {
    let n = normalize(i_1.normal);
    let light = max(0f, dot(n, vec3<f32>(0.3562906f, 0.81437856f, 0.45808792f)));
    let stepped = (0.32f + ((floor((light * 3f)) / 3f) * 0.68f));
    let grain = (0.88f + ((0.12f * sin(((i_1.local.x * 31f) + (i_1.local.z * 27f)))) * sin((i_1.local.y * 41f))));
    let moss = (vec3<f32>(0.015f, 0.03f, 0.003f) * smoothstep(0.35f, 0.9f, n.y));
    let alpha = (i_1.alpha * i_1.tint.w);
    return vec4<f32>(((((i_1.tint.xyz * stepped) * grain) + moss) * alpha), alpha);
}
