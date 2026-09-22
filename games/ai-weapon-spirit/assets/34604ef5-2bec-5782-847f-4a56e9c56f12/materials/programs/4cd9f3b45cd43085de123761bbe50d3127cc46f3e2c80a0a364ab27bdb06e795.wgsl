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
    @location(0) local: vec2<f32>,
    @location(1) color: vec4<f32>,
    @location(2) base: vec4<f32>,
    @location(3) veins: vec4<f32>,
    @location(4) kind: f32,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(1) @binding(0) 
var<uniform> materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX: MaterialParametersX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX;

fn hash(p: vec2<f32>) -> f32 {
    return fract((sin(dot(p, vec2<f32>(127.1f, 311.7f))) * 43758.547f));
}

fn noise(p_1: vec2<f32>) -> f32 {
    let i_2 = floor(p_1);
    let f = fract(p_1);
    let u = ((f * f) * (vec2(3f) - (2f * f)));
    let _e10 = hash(i_2);
    let _e15 = hash((i_2 + vec2<f32>(1f, 0f)));
    let _e22 = hash((i_2 + vec2<f32>(0f, 1f)));
    let _e26 = hash((i_2 + vec2(1f)));
    return mix(mix(_e10, _e15, u.x), mix(_e22, _e26, u.x), u.y);
}

@vertex 
fn vs_main(i: Input) -> Out {
    var o: Out;

    let _e5 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.worldViewProj;
    o.position = (_e5 * vec4<f32>((((i.center + (i.right * i.p.x)) + (i.up * i.p.y)) + (i.forward * i.p.z)), 1f));
    o.local = i.p.xz;
    o.color = i.color;
    let _e33 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.baseColor;
    o.base = _e33;
    let _e37 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.emissive;
    let _e40 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.emissiveIntensity;
    o.veins = vec4<f32>(_e37, _e40);
    let _e45 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.metallic;
    let _e48 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.roughness;
    let _e51 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.clearcoat;
    let _e54 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.clearcoatRoughness;
    o.kind = (vec4<f32>(_e45, _e48, _e51, _e54).x * 8f);
    let _e59 = o;
    return _e59;
}

@fragment 
fn fs_main(i_1: Out) -> @location(0) vec4<f32> {
    var alpha: f32;
    var color: vec3<f32>;
    var veins: f32 = 0f;

    let p_2 = i_1.local;
    let age = i_1.color.x;
    let seed = (i_1.color.y * 31f);
    let _e13 = noise(((p_2 * 6f) + vec2(seed)));
    let _e18 = noise(((p_2 * 22f) + vec2(seed)));
    let radius = length(p_2);
    let angle = atan2(p_2.y, p_2.x);
    let edge = (1f - smoothstep((0.56f + (_e13 * 0.18f)), (0.87f + (_e13 * 0.12f)), radius));
    let reveal = smoothstep(0f, 0.15f, age);
    let erosion = smoothstep(((i_1.color.z * 0.62f) - 0.06f), ((i_1.color.z * 0.62f) + 0.22f), ((_e18 * 0.45f) + (_e13 * 0.55f)));
    alpha = ((((edge * reveal) * erosion) * i_1.color.w) * i_1.base.w);
    color = (i_1.base.xyz * (0.75f + (_e18 * 0.35f)));
    if (i_1.kind < 0.5f) {
        let _e81 = noise(((p_2 * 4f) + vec2(seed)));
        let crack = abs(sin(((angle * 7f) + (_e81 * 2f))));
        veins = (((1f - smoothstep(0.025f, 0.085f, crack)) * smoothstep(0.13f, 0.32f, radius)) * (1f - smoothstep(0.55f, 0.9f, radius)));
        let _e103 = color;
        let _e106 = veins;
        color = (_e103 + ((i_1.veins.xyz * _e106) * (1f - smoothstep(0.1f, 1.3f, age))));
    } else {
        if (i_1.kind < 1.5f) {
            let radial = abs(sin((((angle * 9f) + seed) + (radius * 5f))));
            let branches = abs(sin((((radius * 48f) + (angle * 3f)) + (_e13 * 3f))));
            veins = max((1f - smoothstep(0.04f, 0.13f, radial)), ((1f - smoothstep(0.04f, 0.14f, branches)) * (1f - smoothstep(0.15f, 0.45f, radial))));
            let _e153 = alpha;
            let _e154 = veins;
            alpha = (_e153 * (0.25f + (_e154 * 0.7f)));
            let _e160 = color;
            let _e163 = veins;
            color = mix(_e160, i_1.veins.xyz, (_e163 * 0.75f));
        } else {
            if (i_1.kind < 2.5f) {
                let cracks = (1f - smoothstep(0.04f, 0.12f, abs(sin((((angle * 6f) + seed) + (_e13 * 0.7f))))));
                let _e183 = color;
                color = (mix((_e183 * 0.45f), i_1.veins.xyz, (_e18 * 0.7f)) * (1f - (cracks * 0.6f)));
                let _e196 = alpha;
                alpha = (_e196 * (0.5f + (_e13 * 0.5f)));
            } else {
                if (i_1.kind < 3.5f) {
                    let perimeter = (((0.78f + (0.045f * sin(((angle * 3f) + seed)))) + (0.04f * cos(((angle * 5f) - seed)))) + (_e13 * 0.07f));
                    let growth = smoothstep(0f, 0.14f, age);
                    let boundary = (perimeter * growth);
                    if (i_1.color.z >= 0f) {
                        let cover = (1f - smoothstep((boundary - 0.07f), (boundary + 0.025f), radius));
                        let rim = exp(-(pow(((radius - boundary) / 0.025f), 2f)));
                        alpha = (max((cover * i_1.base.w), (rim * 0.8f)) * i_1.color.w);
                        color = ((i_1.base.xyz * ((0.72f + (_e13 * 0.4f)) + (_e18 * 0.25f))) + ((i_1.veins.xyz * rim) * (0.55f + (0.25f * sin(((angle * 4f) - (age * 6f)))))));
                    } else {
                        let cover_1 = (1f - smoothstep((boundary - 0.13f), (boundary + 0.045f), radius));
                        let rim_1 = exp(-(pow(((radius - boundary) / 0.065f), 2f)));
                        let halo = exp(-(pow(((radius - boundary) / 0.15f), 2f)));
                        let hue = (0.5f + (0.5f * sin((((angle * 2f) + (_e13 * 3f)) - (age * 5.5f)))));
                        let living = mix(vec3<f32>(0.06f, 0.3f, 0.025f), vec3<f32>(0.36f, 0.46f, 0.055f), hue);
                        let edgeLight = mix(i_1.veins.xyz, vec3<f32>(1.35f, 1.05f, 0.22f), hue);
                        let dissolve = (1f - smoothstep(0.72f, 1f, -(i_1.color.z)));
                        let stroke = smoothstep(0.24f, 0.8f, (0.5f + (0.5f * sin(((((angle * 3f) + (seed * 0.65f)) - (age * 1.8f)) + (_e13 * 1.4f))))));
                        let innerOpen = smoothstep(0.16f, 0.68f, (radius / max(boundary, 0.001f)));
                        alpha = (((((cover_1 * (0.1f + (0.16f * innerOpen))) + (rim_1 * (0.1f + (0.28f * stroke)))) + (halo * 0.1f)) * i_1.color.w) * growth);
                        color = ((living * (0.56f + (_e18 * 0.28f))) + ((edgeLight * ((rim_1 * (0.12f + (0.9f * stroke))) + (halo * (0.035f + (0.15f * stroke))))) * dissolve));
                    }
                } else {
                    if (i_1.kind < 4.5f) {
                        let stripe = (1f - smoothstep(0.018f, 0.055f, abs((p_2.x + (sin(((p_2.y * 6f) + seed)) * 0.025f)))));
                        let flank = (1f - smoothstep(0.008f, 0.025f, abs((abs(p_2.x) - 0.19f))));
                        let _e427 = alpha;
                        alpha = (_e427 * max(stripe, (flank * 0.35f)));
                        let _e432 = color;
                        color = mix(_e432, i_1.veins.xyz, (stripe * 0.3f));
                    } else {
                        let branch = abs(sin((((angle * 5f) + seed) + (floor((radius * 12f)) * 0.21f))));
                        veins = ((1f - smoothstep(0.025f, 0.09f, branch)) * (1f - smoothstep(0.4f, 0.88f, radius)));
                        let _e460 = alpha;
                        let _e461 = veins;
                        alpha = (_e460 * (0.12f + (_e461 * 0.8f)));
                        let _e467 = color;
                        let _e470 = veins;
                        color = (_e467 + ((i_1.veins.xyz * _e470) * exp((-(age) * 8f))));
                    }
                }
            }
        }
    }
    let _e478 = color;
    let _e479 = alpha;
    let _e481 = alpha;
    return vec4<f32>((_e478 * _e479), _e481);
}
