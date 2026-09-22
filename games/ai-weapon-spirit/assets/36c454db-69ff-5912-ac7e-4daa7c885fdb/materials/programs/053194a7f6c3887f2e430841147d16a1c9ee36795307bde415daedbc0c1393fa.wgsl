struct CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) emissive_intensity: vec4<f32>,
    @location(3) surface: vec4<f32>,
    @location(4) local: vec3<f32>,
    @location(5) uv: vec2<f32>,
    @location(6) disp: f32,
    @location(7) tint: vec4<f32>,
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

const CINDER_SHELL_HOTX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX: vec3<f32> = vec3<f32>(1f, 0.89627f, 0.63076f);
const CINDER_SHELL_MIDX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX: vec3<f32> = vec3<f32>(1f, 0.43415f, 0.02732f);
const CINDER_SHELL_EDGEX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX: vec3<f32> = vec3<f32>(1f, 0.04667f, 0.00518f);

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(1) @binding(0) 
var<uniform> materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX: MaterialParametersX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX;

fn cinder_printX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(value: vec4<f32>, pixel: vec2<f32>, tint_1: vec4<f32>, print: vec4<f32>) -> vec4<f32> {
    var color: vec3<f32>;

    if (value.w <= 0.00001f) {
        discard;
    }
    let straight = max((value.xyz / vec3(value.w)), vec3(0f));
    let brightness = max(max(straight.x, straight.y), straight.z);
    let shade = mix(clamp(brightness, 0.2f, 1.6f), ((floor((clamp(brightness, 0f, 1.5f) * 3f)) / 3f) + 0.22f), print.z);
    color = mix(straight, (tint_1.xyz * shade), tint_1.w);
    let grid = (pixel / vec2(max(4f, print.w)));
    let cell = (fract(vec2<f32>((grid.x + (grid.y * 0.22f)), grid.y)) - vec2(0.5f));
    let radius = mix(0.12f, 0.32f, (1f - clamp(brightness, 0f, 1f)));
    let dots = (1f - smoothstep((radius - 0.035f), (radius + 0.035f), length(cell)));
    let line1_ = (1f - smoothstep(0.06f, 0.15f, abs((fract((grid.x + grid.y)) - 0.5f))));
    let line2_ = (1f - smoothstep(0.06f, 0.15f, abs((fract((grid.x - grid.y)) - 0.5f))));
    let hatch = max(line1_, (line2_ * (1f - smoothstep(0.3f, 0.8f, brightness))));
    let _e102 = color;
    color = mix(_e102, vec3<f32>(0.006f, 0.004f, 0.015f), (max((dots * print.x), (hatch * print.y)) * 0.9f));
    let _e115 = color;
    return vec4<f32>((_e115 * value.w), value.w);
}

fn cinder_mod289v3X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(x: vec3<f32>) -> vec3<f32> {
    return (x - (floor((x * 0.0034602077f)) * 289f));
}

fn cinder_mod289v4X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(x_1: vec4<f32>) -> vec4<f32> {
    return (x_1 - (floor((x_1 * 0.0034602077f)) * 289f));
}

fn cinder_permute289X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(x_2: vec4<f32>) -> vec4<f32> {
    let _e7 = cinder_mod289v4X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX((((x_2 * 34f) + vec4(1f)) * x_2));
    return _e7;
}

fn cinder_taylor_inv_sqrt4X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(r: vec4<f32>) -> vec4<f32> {
    return (vec4(1.7928429f) - (0.85373473f * r));
}

fn cinder_snoiseX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(v: vec3<f32>) -> f32 {
    var i: vec3<f32>;
    var p0_: vec3<f32>;
    var p1_: vec3<f32>;
    var p2_: vec3<f32>;
    var p3_: vec3<f32>;
    var m: vec4<f32>;

    let C = vec2<f32>(0.16666667f, 0.33333334f);
    let D = vec4<f32>(0f, 0.5f, 1f, 2f);
    i = floor((v + vec3(dot(v, C.yyy))));
    let _e15 = i;
    let _e17 = i;
    let x0_ = ((v - _e15) + vec3(dot(_e17, C.xxx)));
    let g = step(x0_.yzx, x0_.xyz);
    let l = (vec3(1f) - g);
    let i1_ = min(g.xyz, l.zxy);
    let i2_ = max(g.xyz, l.zxy);
    let x1_ = ((x0_ - i1_) + C.xxx);
    let x2_ = ((x0_ - i2_) + C.yyy);
    let x3_ = (x0_ - D.yyy);
    let _e42 = i;
    let _e43 = cinder_mod289v3X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(_e42);
    i = _e43;
    let _e45 = i.z;
    let _e53 = cinder_permute289X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX((vec4(_e45) + vec4<f32>(0f, i1_.z, i2_.z, 1f)));
    let _e55 = i.y;
    let _e64 = cinder_permute289X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(((_e53 + vec4(_e55)) + vec4<f32>(0f, i1_.y, i2_.y, 1f)));
    let _e66 = i.x;
    let _e75 = cinder_permute289X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(((_e64 + vec4(_e66)) + vec4<f32>(0f, i1_.x, i2_.x, 1f)));
    let ns = ((0.14285715f * D.wyz) - D.xzx);
    let j = (_e75 - (49f * floor(((_e75 * ns.z) * ns.z))));
    let x_3 = floor((j * ns.z));
    let y = floor((j - (7f * x_3)));
    let x_4 = ((x_3 * ns.x) + ns.yyyy);
    let y_1 = ((y * ns.x) + ns.yyyy);
    let h = ((vec4(1f) - abs(x_4)) - abs(y_1));
    let b0_ = vec4<f32>(x_4.xy, y_1.xy);
    let b1_ = vec4<f32>(x_4.zw, y_1.zw);
    let s0_ = ((floor(b0_) * 2f) + vec4(1f));
    let s1_ = ((floor(b1_) * 2f) + vec4(1f));
    let sh = -(step(h, vec4(0f)));
    let a0_ = (b0_.xzyw + (s0_.xzyw * sh.xxyy));
    let a1_ = (b1_.xzyw + (s1_.xzyw * sh.zzww));
    p0_ = vec3<f32>(a0_.xy, h.x);
    p1_ = vec3<f32>(a0_.zw, h.y);
    p2_ = vec3<f32>(a1_.xy, h.z);
    p3_ = vec3<f32>(a1_.zw, h.w);
    let _e158 = p0_;
    let _e159 = p0_;
    let _e161 = p1_;
    let _e162 = p1_;
    let _e164 = p2_;
    let _e165 = p2_;
    let _e167 = p3_;
    let _e168 = p3_;
    let _e171 = cinder_taylor_inv_sqrt4X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(vec4<f32>(dot(_e158, _e159), dot(_e161, _e162), dot(_e164, _e165), dot(_e167, _e168)));
    let _e172 = p0_;
    p0_ = (_e172 * _e171.x);
    let _e175 = p1_;
    p1_ = (_e175 * _e171.y);
    let _e178 = p2_;
    p2_ = (_e178 * _e171.z);
    let _e181 = p3_;
    p3_ = (_e181 * _e171.w);
    m = max((vec4(0.6f) - vec4<f32>(dot(x0_, x0_), dot(x1_, x1_), dot(x2_, x2_), dot(x3_, x3_))), vec4(0f));
    let _e196 = m;
    let _e197 = m;
    m = (_e196 * _e197);
    let _e199 = m;
    let _e200 = m;
    let _e202 = p0_;
    let _e204 = p1_;
    let _e206 = p2_;
    let _e208 = p3_;
    return (42f * dot((_e199 * _e200), vec4<f32>(dot(_e202, x0_), dot(_e204, x1_), dot(_e206, x2_), dot(_e208, x3_))));
}

fn cinder_fbm4X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(p: vec3<f32>) -> f32 {
    var v_1: f32 = 0f;
    var a: f32 = 0.5f;
    var q: vec3<f32>;
    var i_1: i32 = 0i;

    q = p;
    loop {
        let _e6 = i_1;
        if (_e6 < 4i) {
        } else {
            break;
        }
        {
            let _e11 = v_1;
            let _e12 = a;
            let _e13 = q;
            let _e14 = cinder_snoiseX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(_e13);
            v_1 = (_e11 + (_e12 * _e14));
            let _e17 = q;
            q = ((_e17 * 2.03f) + vec3<f32>(17.3f, 5.1f, 9.7f));
            let _e25 = a;
            a = (_e25 * 0.5f);
        }
        continuing {
            let _e28 = i_1;
            i_1 = (_e28 + 1i);
        }
    }
    let _e31 = v_1;
    return _e31;
}

fn cinder_ridgedX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(p_1: vec3<f32>) -> f32 {
    var v_2: f32 = 0f;
    var a_1: f32 = 0.5f;
    var q_1: vec3<f32>;
    var i_2: i32 = 0i;

    q_1 = p_1;
    loop {
        let _e6 = i_2;
        if (_e6 < 4i) {
        } else {
            break;
        }
        {
            let _e11 = v_2;
            let _e12 = a_1;
            let _e13 = q_1;
            let _e14 = cinder_snoiseX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(_e13);
            v_2 = (_e11 + (_e12 * (1f - abs(_e14))));
            let _e20 = q_1;
            q_1 = (_e20 * 2.06f);
            let _e23 = a_1;
            a_1 = (_e23 * 0.5f);
        }
        continuing {
            let _e26 = i_2;
            i_2 = (_e26 + 1i);
        }
    }
    let _e29 = v_2;
    return _e29;
}

fn cinder_hashX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(p_2: vec2<f32>) -> f32 {
    return fract((sin(dot(p_2, vec2<f32>(127.1f, 311.7f))) * 43758.547f));
}

fn cinder_rock_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_2: CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX) -> vec4<f32> {
    var rock: vec3<f32>;

    let normal_2 = normalize(input_2.normal);
    let viewDirection = vec3<f32>(0f, 0f, 1f);
    let seed = input_2.color.x;
    let heat = input_2.color.y;
    let charge = input_2.color.z;
    let visibility = input_2.color.w;
    let p_6 = (input_2.local * (3.4f + (seed * 0.7f)));
    let field = ((sin(((p_6.x * 2.3f) + sin((p_6.z * 1.7f)))) + sin(((p_6.y * 2.7f) + (p_6.x * 0.8f)))) + sin((((p_6.z * 3.1f) - (p_6.y * 1.2f)) + (seed * 9f))));
    let distance_ = (abs(field) / 3f);
    let width = (0.055f * (1f + (charge * 0.8f)));
    let fissure = (1f - smoothstep((width * 0.35f), width, distance_));
    let lip = (1f - smoothstep(width, (width * 2.5f), distance_));
    let core = (1f - smoothstep(0f, (width * 0.42f), distance_));
    let lightDirection = vec3<f32>(0.36034632f, 0.7412839f, 0.5662585f);
    let diffuse = (0.18f + (0.82f * max(dot(normal_2, lightDirection), 0f)));
    let _e93 = cinder_hashX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX((floor((normal_2.xy * 19f)) + vec2(seed)));
    let facet = (0.72f + (0.28f * _e93));
    rock = mix(vec3<f32>(0.21f, 0.16f, 0.12f), vec3<f32>(0.035f, 0.022f, 0.016f), (lip * 0.88f));
    let _e110 = rock;
    rock = (_e110 * (diffuse * facet));
    let flow = (0.68f + (0.32f * sin((((seed * 31f) + (charge * 9f)) + (p_6.y * 3f)))));
    let magma = (((mix(vec3<f32>(1f, 0.12f, 0.005f), vec3<f32>(4.2f, 2.4f, 0.62f), core) * fissure) * heat) * flow);
    let rim = ((pow((1f - abs(dot(normal_2, viewDirection))), 2.2f) * charge) * charge);
    let _e147 = rock;
    let rgb_1 = (((_e147 * (1f - (fissure * 0.9f))) + magma) + (vec3<f32>(1f, 0.12f, 0.01f) * rim));
    return vec4<f32>((rgb_1 * visibility), visibility);
}

fn cinder_fresnelX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(viewDir: vec3<f32>, normal: vec3<f32>, power: f32, scale: f32) -> f32 {
    let nv = normalize(viewDir);
    let nn = normalize(normal);
    return clamp((scale * pow((1f - abs(dot(nv, nn))), power)), 0f, 4f);
}

fn cinder_dissolveX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(n: f32, threshold: f32, edgeWidth: f32) -> vec2<f32> {
    let hard = step(threshold, n);
    let edge = clamp((smoothstep(threshold, (threshold + edgeWidth), n) - hard), 0f, 1f);
    return vec2<f32>(hard, edge);
}

fn cinder_gradient4X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(c0_: vec3<f32>, c1_: vec3<f32>, c2_: vec3<f32>, c3_: vec3<f32>, t: f32) -> vec3<f32> {
    let a_3 = mix(c0_, c1_, smoothstep(0f, 0.34f, t));
    let b = mix(a_3, c2_, smoothstep(0.3f, 0.68f, t));
    return mix(b, c3_, smoothstep(0.64f, 1f, t));
}

fn cinder_burst_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_3: CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX, cA: vec3<f32>, cB: vec3<f32>, cC: vec3<f32>, intensity: f32, fresnelScale: f32) -> vec4<f32> {
    var color_1: vec3<f32>;

    let _e8 = cinder_fresnelX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(vec3<f32>(0f, 0f, 1f), input_3.normal, 2.2f, fresnelScale);
    let heat_1 = clamp(((input_3.disp * 0.5f) + 0.5f), 0f, 1f);
    let _e24 = cinder_dissolveX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(heat_1, ((input_3.color.x * 1.15f) - 0.15f), 0.3f);
    let _e32 = cinder_gradient4X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(cA, cB, cC, (cC * 0.15f), (1f - heat_1));
    color_1 = (_e32 + ((_e24.y * cA) * 3f));
    let soft = clamp((((input_3.color.w * (1f - input_3.color.x)) * (0.55f + (_e8 * 0.8f))) * _e24.x), 0f, 1f);
    let _e57 = color_1;
    return vec4<f32>(((_e57 * intensity) * soft), soft);
}

fn cinder_burst_outer_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_4: CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX) -> vec4<f32> {
    let _e6 = cinder_burst_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_4, CINDER_SHELL_HOTX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX, CINDER_SHELL_MIDX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX, CINDER_SHELL_EDGEX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX, 1f, 1.1f);
    return _e6;
}

fn cinder_burst_inner_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_5: CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX) -> vec4<f32> {
    let _e6 = cinder_burst_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_5, CINDER_SHELL_HOTX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX, CINDER_SHELL_HOTX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX, CINDER_SHELL_MIDX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX, 2.2f, 1f);
    return _e6;
}

fn cinder_shell_shard_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_6: CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX) -> vec4<f32> {
    let normal_3 = normalize(input_6.normal);
    let viewDirection_1 = vec3<f32>(0f, 0f, 1f);
    let seed_1 = input_6.color.x;
    let heat_2 = input_6.color.y;
    let visibility_1 = input_6.color.w;
    let rim_1 = pow((1f - abs(dot(normal_3, viewDirection_1))), 1.35f);
    let soft_1 = ((visibility_1 * (0.22f + (rim_1 * 0.58f))) * mix(0.45f, 1f, heat_2));
    let color_2 = mix(vec3<f32>(1f, 0.24f, 0.025f), vec3<f32>(2.4f, 1.22f, 0.35f), seed_1);
    return vec4<f32>((color_2 * soft_1), soft_1);
}

fn cinder_noiseX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(p_3: vec2<f32>) -> f32 {
    let i_4 = floor(p_3);
    let f = fract(p_3);
    let u = ((f * f) * (vec2(3f) - (2f * f)));
    let _e10 = cinder_hashX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(i_4);
    let _e15 = cinder_hashX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX((i_4 + vec2<f32>(1f, 0f)));
    let _e22 = cinder_hashX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX((i_4 + vec2<f32>(0f, 1f)));
    let _e27 = cinder_hashX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX((i_4 + vec2<f32>(1f, 1f)));
    return mix(mix(_e10, _e15, u.x), mix(_e22, _e27, u.x), u.y);
}

fn cinder_core_shard_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_7: CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX) -> vec4<f32> {
    let normal_4 = normalize(input_7.normal);
    let seed_2 = input_7.color.x;
    let heat_3 = input_7.color.y;
    let visibility_2 = input_7.color.w;
    let light = (0.25f + (0.75f * max(dot(normal_4, vec3<f32>(0.3562906f, 0.81437856f, 0.45808792f)), 0f)));
    let _e27 = cinder_noiseX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(((input_7.uv * 5.5f) + vec2((seed_2 * 17f))));
    let coolingRock = ((vec3<f32>(0.055f, 0.026f, 0.012f) * light) * (0.78f + (_e27 * 0.44f)));
    let molten = mix(vec3<f32>(1f, 0.12f, 0.008f), vec3<f32>(3.2f, 1.45f, 0.32f), seed_2);
    let hotPatch = smoothstep(0.34f, 0.72f, (_e27 + (heat_3 * 0.42f)));
    let color_3 = mix(coolingRock, (molten * (0.6f + (light * 0.4f))), ((heat_3 * heat_3) * hotPatch));
    return vec4<f32>((color_3 * visibility_2), visibility_2);
}

fn cinder_fbm3X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(p_4: vec3<f32>) -> f32 {
    var v_3: f32 = 0f;
    var a_2: f32 = 0.5f;
    var q_2: vec3<f32>;
    var i_3: i32 = 0i;

    q_2 = p_4;
    loop {
        let _e6 = i_3;
        if (_e6 < 3i) {
        } else {
            break;
        }
        {
            let _e11 = v_3;
            let _e12 = a_2;
            let _e13 = q_2;
            let _e14 = cinder_snoiseX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(_e13);
            v_3 = (_e11 + (_e12 * _e14));
            let _e17 = q_2;
            q_2 = (_e17 * 2.02f);
            let _e20 = a_2;
            a_2 = (_e20 * 0.5f);
        }
        continuing {
            let _e23 = i_3;
            i_3 = (_e23 + 1i);
        }
    }
    let _e26 = v_3;
    return _e26;
}

fn cinder_scorch_mesh_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_8: CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX) -> vec4<f32> {
    var rgb: vec3<f32>;

    let c = input_8.local.xz;
    let life = input_8.color.x;
    let seed_3 = input_8.color.y;
    let age = input_8.color.z;
    let d = length(c);
    let _e15 = cinder_fbm3X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(vec3<f32>((c * 2.4f), (seed_3 * 13f)));
    let burn = smoothstep(1f, 0.15f, (d + (_e15 * 0.45f)));
    let drift = ((seed_3 * 9f) + (age * 0.35f));
    let _e30 = cinder_snoiseX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(vec3<f32>((c * 6f), drift));
    let embers = pow(max(_e30, 0f), 4f);
    let alpha = ((input_8.color.w * burn) * 0.85f);
    let colorA = vec3<f32>(0.00402f, 0.00273f, 0.00212f);
    let colorB = vec3<f32>(1f, 0.14413f, 0.00605f);
    rgb = mix(colorA, colorB, (embers * (1f - life)));
    let _e53 = rgb;
    rgb = (_e53 + (((embers * colorB) * 2.5f) * (1f - smoothstep(0f, 0.6f, life))));
    let _e64 = rgb;
    return vec4<f32>((_e64 * alpha), alpha);
}

fn cinder_lip_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_9: CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX) -> vec4<f32> {
    let normal_5 = normalize(input_9.normal);
    let visibility_3 = input_9.color.w;
    let lightDirection_1 = vec3<f32>(0.36034632f, 0.7412839f, 0.5662585f);
    let diffuse_1 = (0.16f + (0.84f * max(dot(normal_5, lightDirection_1), 0f)));
    let charred = vec3<f32>(0.00857f, 0.00651f, 0.00478f);
    let rgb_2 = (charred * diffuse_1);
    return vec4<f32>((rgb_2 * visibility_3), visibility_3);
}

fn cinder_fissure_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_10: CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX, glow: bool) -> vec4<f32> {
    let age_1 = input_10.color.x;
    let across = abs(((input_10.uv.y * 2f) - 1f));
    let front = smoothstep(0f, 0.58f, age_1);
    let open = (1f - smoothstep((front - 0.08f), front, input_10.uv.x));
    let fade = (1f - smoothstep(4f, 6.5f, age_1));
    let core_1 = (1f - smoothstep(0.1f, select(0.42f, 1f, glow), across));
    let pulse = (0.78f + (0.22f * sin(((age_1 * 6f) + (input_10.uv.x * 17f)))));
    let alpha_1 = (((open * fade) * core_1) * select(0.85f, 0.18f, glow));
    return vec4<f32>(((vec3<f32>(1f, 0.25f, 0.025f) * pulse) * alpha_1), alpha_1);
}

fn mesh_world_normalX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5G2ZLTNBPXG4DBMNSQX(right: vec3<f32>, up: vec3<f32>, forward: vec3<f32>, normal_1: vec3<f32>) -> vec3<f32> {
    let x_5 = cross(up, forward);
    let y_2 = cross(forward, right);
    let z = cross(right, up);
    let sign_ = select(-1f, 1f, (dot(right, x_5) >= 0f));
    let value_1 = (sign_ * (((x_5 * normal_1.x) + (y_2 * normal_1.y)) + (z * normal_1.z)));
    let magnitude = length(value_1);
    if (magnitude > 0.000001f) {
        return (value_1 / vec3(magnitude));
    }
    return vec3<f32>(0f, 1f, 0f);
}

fn project_cinder_mesh(input_11: VertexInput, shell: bool) -> CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX {
    var output: CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX;
    var p_5: vec3<f32>;
    var displacement: f32 = 0f;

    p_5 = input_11.geometry_position;
    if shell {
        let life_1 = input_11.particle_color.x;
        let _e7 = p_5;
        let np = (((normalize(_e7) * (1.6f + (life_1 * 1.4f))) + vec3((input_11.particle_color.y * 13f))) - vec3<f32>(0f, (life_1 * 0.6f), 0f));
        let _e26 = cinder_fbm4X_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(np);
        let _e31 = cinder_ridgedX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX((np * 1.3f));
        displacement = ((_e26 * 0.6f) + (_e31 * 0.4f));
        let _e36 = p_5;
        let _e37 = p_5;
        let _e39 = displacement;
        p_5 = (_e36 + (((normalize(_e37) * _e39) * input_11.particle_color.z) * (0.35f + (life_1 * 0.9f))));
    }
    let _e54 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    let _e58 = p_5.x;
    let _e62 = p_5.y;
    let _e67 = p_5.z;
    let _e72 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.metallic;
    let _e75 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.roughness;
    let _e78 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.clearcoat;
    let _e81 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.clearcoatRoughness;
    output.position = (_e54 * vec4<f32>((input_11.center + ((((input_11.right * _e58) + (input_11.up * _e62)) + (input_11.forward * _e67)) * vec4<f32>(_e72, _e75, _e78, _e81).y)), 1f));
    let _e94 = mesh_world_normalX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5G2ZLTNBPXG4DBMNSQX(input_11.right, input_11.up, input_11.forward, input_11.geometry_normal);
    output.normal = _e94;
    output.color = input_11.particle_color;
    let _e100 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.baseColor;
    output.tint = _e100;
    let _e104 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.emissive;
    let _e107 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.emissiveIntensity;
    output.emissive_intensity = vec4<f32>(_e104, _e107);
    let _e112 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.metallic;
    let _e115 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.roughness;
    let _e118 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.clearcoat;
    let _e121 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.clearcoatRoughness;
    output.surface = vec4<f32>(_e112, _e115, _e118, _e121);
    output.local = input_11.geometry_position;
    output.uv = input_11.geometry_uv;
    let _e128 = displacement;
    output.disp = _e128;
    let _e129 = output;
    return _e129;
}

@vertex 
fn vs_main(input: VertexInput) -> CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX {
    var local: bool;

    let _e2 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.metallic;
    let _e5 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.roughness;
    let _e8 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.clearcoat;
    let _e11 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.clearcoatRoughness;
    if !((vec4<f32>(_e2, _e5, _e8, _e11).x == 0.125f)) {
        let _e19 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.metallic;
        let _e22 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.roughness;
        let _e25 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.clearcoat;
        let _e28 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.clearcoatRoughness;
        local = (vec4<f32>(_e19, _e22, _e25, _e28).x == 0.25f);
    } else {
        local = true;
    }
    let _e36 = local;
    let _e38 = project_cinder_mesh(input, _e36);
    return _e38;
}

@fragment 
fn fs_main(input_1: CinderMeshOutX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX) -> @location(0) vec4<f32> {
    var shaded: vec4<f32>;
    var local_1: bool;
    var local_2: bool;
    var local_3: bool;
    var local_4: bool;
    var tint: vec4<f32>;

    switch i32(round((input_1.surface.x * 8f))) {
        case 0: {
            let _e7 = cinder_rock_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_1);
            shaded = _e7;
        }
        case 1: {
            let _e9 = cinder_burst_outer_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_1);
            shaded = _e9;
        }
        case 2: {
            let _e10 = cinder_burst_inner_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_1);
            shaded = _e10;
        }
        case 3: {
            let _e11 = cinder_core_shard_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_1);
            shaded = _e11;
        }
        case 4: {
            let _e12 = cinder_shell_shard_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_1);
            shaded = _e12;
        }
        case 5: {
            let _e13 = cinder_scorch_mesh_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_1);
            shaded = _e13;
        }
        case 6: {
            let _e14 = cinder_lip_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_1);
            shaded = _e14;
        }
        case 7: {
            let _e16 = cinder_fissure_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_1, false);
            shaded = _e16;
        }
        default: {
            let _e18 = cinder_fissure_shadeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(input_1, true);
            shaded = _e18;
        }
    }
    let _e20 = shaded.x;
    let _e22 = shaded.y;
    let _e25 = shaded.z;
    let _e28 = shaded.w;
    let peak = (max(max(_e20, _e22), _e25) / max(_e28, 0.000001f));
    let variant = i32(round((input_1.surface.x * 8f)));
    if !((variant == 0i)) {
        local_1 = (variant == 3i);
    } else {
        local_1 = true;
    }
    let _e46 = local_1;
    if !(_e46) {
        local_2 = (variant == 4i);
    } else {
        local_2 = true;
    }
    let _e53 = local_2;
    if !(_e53) {
        local_3 = (variant == 5i);
    } else {
        local_3 = true;
    }
    let _e60 = local_3;
    if !(_e60) {
        local_4 = (variant == 6i);
    } else {
        local_4 = true;
    }
    let stone = local_4;
    let mask = select(1f, smoothstep(0.025f, 0.18f, peak), stone);
    let _e73 = shaded;
    let _e81 = shaded.w;
    shaded = vec4<f32>((_e73.xyz * mix(1f, input_1.surface.z, mask)), _e81);
    tint = input_1.tint;
    if (variant == 3i) {
        let _e88 = tint.w;
        tint.w = (_e88 * smoothstep(0.08f, 0.55f, input_1.color.y));
    }
    let _e95 = shaded;
    let _e98 = tint;
    let _e100 = cinder_printX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPXMZTYHI5GG2LOMRSXEX3TOVZGMYLDMUX(_e95, input_1.position.xy, _e98, input_1.emissive_intensity);
    return _e100;
}
