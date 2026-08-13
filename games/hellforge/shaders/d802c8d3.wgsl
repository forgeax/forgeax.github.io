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
}

struct MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    worldFromLocal: mat4x4<f32>,
    normalMatrix: mat3x3<f32>,
}

struct PortalUniforms {
    baseColor: vec4<f32>,
    time: f32,
    intensity: f32,
}

struct VsIn {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
}

struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(2) @binding(0) 
var<uniform> meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: array<MeshX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 128>;
@group(1) @binding(0) 
var<uniform> u: PortalUniforms;

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    var out: VsOut;

    let _e5 = meshesX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX[idx].worldFromLocal;
    let world = (_e5 * vec4<f32>(in.pos, 1f));
    let _e14 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    out.clip = (_e14 * world);
    out.uv = in.uv;
    let _e18 = out;
    return _e18;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    let c = (in_1.uv - vec2<f32>(0.5f, 0.5f));
    let r = (length(c) * 2f);
    if (r > 1f) {
        return vec4(0f);
    }
    let ang = atan2(c.y, c.x);
    let _e23 = u.time;
    let _e35 = u.time;
    let spiral = (sin((((ang * 3f) - (r * 9f)) + (_e23 * 2.6f))) + (0.5f * sin((((ang * 5f) + (r * 7f)) - (_e35 * 3.4f)))));
    let arm = clamp(((spiral * 0.5f) + 0.5f), 0f, 1f);
    let eye = clamp((1f - (r * 2.2f)), 0f, 1f);
    let rim = clamp((1f - r), 0f, 1f);
    let _e70 = u.intensity;
    let amp = (((eye * 0.85f) + ((arm * rim) * 0.55f)) * _e70);
    let _e74 = u.baseColor;
    let rgb = (_e74.xyz * amp);
    return vec4<f32>(rgb, amp);
}
