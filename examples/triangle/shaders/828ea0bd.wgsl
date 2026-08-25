struct ViewX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJ3GSZLXX {
    worldViewProj: mat4x4<f32>,
    lightDir: vec3<f32>,
    lightColor: vec3<f32>,
    cameraPos: vec3<f32>,
}

struct MeshX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJ3GSZLXX {
    worldFromLocal: mat4x4<f32>,
}

struct Material {
    baseColor: vec3<f32>,
    metallic: f32,
    roughness: f32,
}

struct VsIn {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
}

struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) worldPos: vec3<f32>,
    @location(1) worldNormal: vec3<f32>,
    @location(2) @interpolate(flat) instanceIdx: u32,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJ3GSZLXX: ViewX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJ3GSZLXX;
@group(2) @binding(0) 
var<storage> meshesX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJ3GSZLXX: array<MeshX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJ3GSZLXX>;
@group(1) @binding(0) 
var<uniform> material: Material;

fn d_ggxX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJRHEZDGX(nDotH: f32, a: f32) -> f32 {
    let a2_ = (a * a);
    let f = ((((nDotH * a2_) - nDotH) * nDotH) + 1f);
    return (a2_ / ((3.1415927f * f) * f));
}

fn v_smithX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJRHEZDGX(nDotV: f32, nDotL: f32, a_1: f32) -> f32 {
    let a2_1 = (a_1 * a_1);
    let gv = (nDotL * sqrt((((nDotV * nDotV) * (1f - a2_1)) + a2_1)));
    let gl = (nDotV * sqrt((((nDotL * nDotL) * (1f - a2_1)) + a2_1)));
    return (0.5f / max((gv + gl), 0.00001f));
}

fn f_schlickX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJRHEZDGX(vDotH: f32, f0_: vec3<f32>) -> vec3<f32> {
    return (f0_ + ((vec3(1f) - f0_) * pow((1f - vDotH), 5f)));
}

@vertex 
fn vs_main(in: VsIn, @builtin(instance_index) idx: u32) -> VsOut {
    var out: VsOut;

    let _e5 = meshesX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJ3GSZLXX[idx].worldFromLocal;
    let world = (_e5 * vec4<f32>(in.pos, 1f));
    let _e14 = viewX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJ3GSZLXX.worldViewProj;
    out.clip = (_e14 * world);
    out.worldPos = world.xyz;
    let _e22 = meshesX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJ3GSZLXX[idx].worldFromLocal;
    out.worldNormal = normalize((_e22 * vec4<f32>(in.normal, 0f)).xyz);
    out.instanceIdx = idx;
    let _e30 = out;
    return _e30;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    let n = normalize(in_1.worldNormal);
    let _e5 = viewX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJ3GSZLXX.cameraPos;
    let v = normalize((_e5 - in_1.worldPos));
    let _e11 = viewX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJ3GSZLXX.lightDir;
    let l = normalize(-(_e11));
    let h = normalize((v + l));
    let nDotL_1 = max(dot(n, l), 0f);
    let nDotV_1 = max(dot(n, v), 0.00001f);
    let nDotH_1 = max(dot(n, h), 0f);
    let vDotH_1 = max(dot(v, h), 0f);
    let _e30 = material.roughness;
    let _e33 = material.roughness;
    let a_2 = (_e30 * _e33);
    let _e39 = material.baseColor;
    let _e42 = material.metallic;
    let f0_1 = mix(vec3(0.04f), _e39, _e42);
    let _e44 = f_schlickX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJRHEZDGX(vDotH_1, f0_1);
    let _e45 = d_ggxX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJRHEZDGX(nDotH_1, a_2);
    let _e46 = v_smithX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJRHEZDGX(nDotV_1, nDotL_1, a_2);
    let specular = ((_e45 * _e46) * _e44);
    let _e54 = material.metallic;
    let kd = ((vec3(1f) - _e44) * (1f - _e54));
    let _e60 = material.baseColor;
    let diffuse = ((kd * _e60) / vec3(3.1415927f));
    let _e68 = viewX_naga_oil_mod_XNBSWY3DPL52HE2LBNZTWYZJ2HJ3GSZLXX.lightColor;
    let color = (((diffuse + specular) * _e68) * nDotL_1);
    return vec4<f32>(color, 1f);
}
