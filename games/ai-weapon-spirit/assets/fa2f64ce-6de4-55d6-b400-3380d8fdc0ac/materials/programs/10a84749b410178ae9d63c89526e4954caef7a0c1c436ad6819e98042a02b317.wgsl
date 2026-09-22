struct MaterialParametersX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX {
    vpA: vec4<f32>,
    vpB: vec4<f32>,
    vpC: vec4<f32>,
    vpD: vec4<f32>,
    invA: vec4<f32>,
    invB: vec4<f32>,
    invC: vec4<f32>,
    invD: vec4<f32>,
    right: vec4<f32>,
    up: vec4<f32>,
    eye: vec4<f32>,
    forward: vec4<f32>,
    settings: vec4<f32>,
    layer: vec4<f32>,
    extra: vec4<f32>,
    design: vec4<f32>,
    motion: vec4<f32>,
    anchor: vec4<f32>,
    basisX: vec4<f32>,
    basisY: vec4<f32>,
    basisZ: vec4<f32>,
    referenceMotion: vec4<f32>,
    tailVelocity: vec4<f32>,
    detailA: vec4<f32>,
    detailB: vec4<f32>,
    shapeA: vec4<f32>,
    shapeB: vec4<f32>,
    shapeC: vec4<f32>,
    shapeD: vec4<f32>,
    tint: vec4<f32>,
    seed: u32,
    texACoordinatesTransform: vec4<f32>,
    texACoordinatesMetadata: vec4<f32>,
    texBCoordinatesTransform: vec4<f32>,
    texBCoordinatesMetadata: vec4<f32>,
}

struct Frame {
    vp: mat4x4<f32>,
    invvp: mat4x4<f32>,
    right: vec4<f32>,
    up: vec4<f32>,
    eye: vec4<f32>,
    forward: vec4<f32>,
    settings: vec4<f32>,
    layer: vec4<f32>,
    extra: vec4<f32>,
    design: vec4<f32>,
    motion: vec4<f32>,
}

struct NativeInput {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) tangent: vec4<f32>,
    @location(4) center: vec3<f32>,
    @location(5) right: vec3<f32>,
    @location(6) up: vec3<f32>,
    @location(7) forward: vec3<f32>,
    @location(8) particle_color: vec4<f32>,
    @location(9) render_controls: vec2<f32>,
}

struct Particle {
    position: vec4<f32>,
    velocity: vec4<f32>,
    color: vec4<f32>,
    size_rotation: vec4<f32>,
    age: f32,
    lifetime: f32,
    alive: u32,
    id: u32,
}

struct MaterialInput {
    uv0_: vec4<f32>,
    custom1_: vec4<f32>,
    color: vec4<f32>,
    normal: vec3<f32>,
    worldPosition: vec3<f32>,
    time: f32,
    delta: f32,
    eyeDepth: f32,
    sceneEyeDepth: f32,
    frontFace: bool,
}

struct Varying {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) custom: vec4<f32>,
    @location(3) world: vec3<f32>,
    @location(4) normal: vec3<f32>,
}

struct DmStreams {
    uv0_: vec4<f32>,
    uv1_: vec4<f32>,
    rotationXY: vec2<f32>,
}

const DM_WORLD: mat4x4<f32> = mat4x4<f32>(vec4<f32>(1f, 0f, 0f, 0f), vec4<f32>(0f, 1f, 0f, 0f), vec4<f32>(0f, 0f, 1f, 0f), vec4<f32>(0f, 0f, 0f, 1f));
const DM_ROT: mat3x3<f32> = mat3x3<f32>(vec3<f32>(1f, 0f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 0f, 1f));
const DM_SIM_TO_WORLD: mat3x3<f32> = mat3x3<f32>(vec3<f32>(1f, 0f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 0f, 1f));

@group(1) @binding(0) 
var<uniform> materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX: MaterialParametersX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX;
@group(1) @binding(1) 
var texA_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX: sampler;
@group(1) @binding(2) 
var texAX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX: texture_2d<f32>;
@group(1) @binding(3) 
var texB_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX: sampler;
@group(1) @binding(4) 
var texBX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX: texture_2d<f32>;
var<private> frame: Frame;

fn magic_local_axisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(v: vec3<f32>) -> vec3<f32> {
    let _e3 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisX;
    let _e9 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisY;
    let _e15 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisZ;
    return vec3<f32>(dot(v, normalize(_e3.xyz)), dot(v, normalize(_e9.xyz)), dot(v, normalize(_e15.xyz)));
}

fn magic_basisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX() -> mat3x3<f32> {
    let _e2 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisX;
    let _e6 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisY;
    let _e10 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisZ;
    return mat3x3<f32>(_e2.xyz, _e6.xyz, _e10.xyz);
}

fn magic_placeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(point: vec3<f32>, age: f32) -> vec3<f32> {
    var local: vec3<f32>;

    local = point;
    let _e5 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.referenceMotion.w;
    if (_e5 > 0.5f) {
        let _e11 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.settings.x;
        let _e16 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.referenceMotion.z;
        let birth = max(0f, ((_e11 + _e16) - age));
        let _e24 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.referenceMotion.y;
        let angle = (birth * _e24);
        let _e26 = local;
        let _e30 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.referenceMotion.x;
        let _e38 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.referenceMotion.x;
        local = (_e26 - vec3<f32>((_e30 * (1f - cos(angle))), 0f, (_e38 * sin(angle))));
    }
    let _e44 = magic_basisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX();
    let _e45 = local;
    let _e49 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tailVelocity;
    let _e56 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.settings.x;
    return ((_e44 * _e45) - (_e49.xyz * min(max(0f, age), _e56)));
}

fn magic_frame() {
    let _e2 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.vpA;
    let _e5 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.vpB;
    let _e8 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.vpC;
    let _e11 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.vpD;
    let _e15 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.invA;
    let _e18 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.invB;
    let _e21 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.invC;
    let _e24 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.invD;
    let _e28 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.right;
    let _e31 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.up;
    let _e34 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.eye;
    let _e37 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.forward;
    let _e40 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.settings;
    let _e43 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.layer;
    let _e46 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.seed;
    let _e50 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.extra;
    let _e55 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.design;
    let _e58 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.motion;
    frame = Frame(mat4x4<f32>(_e2, _e5, _e8, _e11), mat4x4<f32>(_e15, _e18, _e21, _e24), _e28, _e31, _e34, _e37, _e40, _e43, vec4<f32>(bitcast<f32>(_e46), _e50.yzw), _e55, _e58);
    return;
}

fn enchantmentParticleColor(rgb_1: vec3<f32>, palette: f32) -> vec3<f32> {
    var body: vec3<f32> = vec3(1f);
    var core: vec3<f32> = vec3(1f);

    if (palette < 0.5f) {
        return rgb_1;
    }
    if (abs((palette - 0f)) < 0.5f) {
        body = vec3<f32>(1f, 0.055f, 0.008f);
        core = vec3<f32>(1f, 0.6f, 0.23f);
    }
    if (abs((palette - 1f)) < 0.5f) {
        body = vec3<f32>(0.32f, 1f, 0.015f);
        core = vec3<f32>(0.86f, 1f, 0.36f);
    }
    if (abs((palette - 2f)) < 0.5f) {
        body = vec3<f32>(0.33f, 0.035f, 1f);
        core = vec3<f32>(0.82f, 0.64f, 1f);
    }
    if (abs((palette - 3f)) < 0.5f) {
        body = vec3<f32>(0.012f, 0.35f, 1f);
        core = vec3<f32>(0.5f, 0.92f, 1f);
    }
    let peak = max(max(rgb_1.x, rgb_1.y), rgb_1.z);
    let _e65 = body;
    let _e66 = core;
    return (mix(_e65, _e66, smoothstep(0.6f, 4f, peak)) * peak);
}

fn dm_hash(value: u32) -> u32 {
    var v_1: u32;

    v_1 = value;
    let _e2 = v_1;
    let _e3 = v_1;
    v_1 = ((_e2 ^ (_e3 >> 16u)) * 2246822519u);
    let _e9 = v_1;
    let _e10 = v_1;
    v_1 = ((_e9 ^ (_e10 >> 13u)) * 3266489917u);
    let _e16 = v_1;
    let _e17 = v_1;
    return (_e16 ^ (_e17 >> 16u));
}

fn dm_random(seed: u32, id: u32, key: u32) -> f32 {
    let _e13 = dm_hash(((seed ^ ((id + 1u) * 747796405u)) ^ ((key + 1u) * 2891336453u)));
    return (f32(_e13) / 4294967300f);
}

fn curve_0_(t: f32) -> f32 {
    if (t <= 0f) {
        return 1f;
    }
    if (t < 0.127191f) {
        let u = ((t - 0f) / 0.127191f);
        return (((((((((2f * u) * u) * u) - ((3f * u) * u)) + 1f) * 1f) + (((((u * u) * u) - ((2f * u) * u)) + u) * 0f)) + (((((-2f * u) * u) * u) + ((3f * u) * u)) * 0.3235294f)) + ((((u * u) * u) - (u * u)) * 0.025443554f));
    }
    if (t < 1f) {
        let u_1 = ((t - 0.127191f) / 0.872809f);
        return (((((((((2f * u_1) * u_1) * u_1) - ((3f * u_1) * u_1)) + 1f) * 0.3235294f) + (((((u_1 * u_1) * u_1) - ((2f * u_1) * u_1)) + u_1) * 0.17459854f)) + (((((-2f * u_1) * u_1) * u_1) + ((3f * u_1) * u_1)) * 0f)) + ((((u_1 * u_1) * u_1) - (u_1 * u_1)) * 0f));
    }
    return 0f;
}

fn curve_1_(t_1: f32) -> f32 {
    if (t_1 <= 0.06939553f) {
        return 1f;
    }
    if (t_1 < 1f) {
        let u_2 = ((t_1 - 0.06939553f) / 0.93060446f);
        return (((((((((2f * u_2) * u_2) * u_2) - ((3f * u_2) * u_2)) + 1f) * 1f) + (((((u_2 * u_2) * u_2) - ((2f * u_2) * u_2)) + u_2) * -0.38416153f)) + (((((-2f * u_2) * u_2) * u_2) + ((3f * u_2) * u_2)) * 0.1823529f)) + ((((u_2 * u_2) * u_2) - (u_2 * u_2)) * -0.37032092f));
    }
    return 0.1823529f;
}

fn curve_2_(t_2: f32) -> f32 {
    if (t_2 <= 0f) {
        return 1f;
    }
    if (t_2 < 0.127191f) {
        let u_3 = ((t_2 - 0f) / 0.127191f);
        return (((((((((2f * u_3) * u_3) * u_3) - ((3f * u_3) * u_3)) + 1f) * 1f) + (((((u_3 * u_3) * u_3) - ((2f * u_3) * u_3)) + u_3) * 0f)) + (((((-2f * u_3) * u_3) * u_3) + ((3f * u_3) * u_3)) * 0.3235294f)) + ((((u_3 * u_3) * u_3) - (u_3 * u_3)) * 0.025443554f));
    }
    if (t_2 < 1f) {
        let u_4 = ((t_2 - 0.127191f) / 0.872809f);
        return (((((((((2f * u_4) * u_4) * u_4) - ((3f * u_4) * u_4)) + 1f) * 0.3235294f) + (((((u_4 * u_4) * u_4) - ((2f * u_4) * u_4)) + u_4) * 0.17459854f)) + (((((-2f * u_4) * u_4) * u_4) + ((3f * u_4) * u_4)) * 0f)) + ((((u_4 * u_4) * u_4) - (u_4 * u_4)) * 0f));
    }
    return 0f;
}

fn curve_3_(t_3: f32) -> f32 {
    if (t_3 <= 0.06939553f) {
        return 1f;
    }
    if (t_3 < 1f) {
        let u_5 = ((t_3 - 0.06939553f) / 0.93060446f);
        return (((((((((2f * u_5) * u_5) * u_5) - ((3f * u_5) * u_5)) + 1f) * 1f) + (((((u_5 * u_5) * u_5) - ((2f * u_5) * u_5)) + u_5) * -0.38416153f)) + (((((-2f * u_5) * u_5) * u_5) + ((3f * u_5) * u_5)) * 0.1823529f)) + ((((u_5 * u_5) * u_5) - (u_5 * u_5)) * -0.37032092f));
    }
    return 0.1823529f;
}

fn gradient_6_(t_4: f32) -> vec4<f32> {
    var rgb_2: vec3<f32> = vec3<f32>(1f, 1f, 1f);
    var alpha_1: f32 = 0f;

    if (t_4 <= 0f) {
        rgb_2 = vec3<f32>(1f, 1f, 1f);
    } else {
        if (t_4 <= 1f) {
            rgb_2 = mix(vec3<f32>(1f, 1f, 1f), vec3<f32>(1f, 1f, 1f), ((t_4 - 0f) / 1f));
        }
    }
    if (t_4 <= 0f) {
        alpha_1 = 1f;
    } else {
        if (t_4 <= 0.49542993f) {
            alpha_1 = mix(1f, 0f, ((t_4 - 0f) / 0.49542993f));
        }
    }
    let _e39 = rgb_2;
    let _e40 = alpha_1;
    return vec4<f32>(_e39, _e40);
}

fn dm_appearance(seed_1: u32, id_1: u32, t_5: f32, particle: ptr<function, Particle>) {
    let _e6 = dm_random(seed_1, id_1, 3u);
    let _e13 = curve_0_(t_5);
    let _e14 = curve_1_(t_5);
    let _e16 = dm_random(seed_1, id_1, 6u);
    (*particle).size_rotation.x = max(0f, ((mix(2f, 1f, _e6) * 1f) * (mix(_e13, _e14, _e16) * 0.9f)));
    let _e26 = dm_random(seed_1, id_1, 3u);
    let _e32 = curve_2_(t_5);
    let _e33 = curve_3_(t_5);
    let _e35 = dm_random(seed_1, id_1, 6u);
    (*particle).size_rotation.y = max(0f, ((mix(2f, 1f, _e26) * 1f) * (mix(_e32, _e33, _e35) * 0.9f)));
    let _e48 = gradient_6_(t_5);
    (*particle).color = (vec4<f32>(0.2f, 0f, 0.0102033615f, 1f) * _e48);
    let _e53 = dm_random(seed_1, id_1, 61u);
    (*particle).velocity.w = floor((fract((mix(0f, 0.9999f, _e53) + 0f)) * 4f));
    return;
}

fn dm_streams(uv: vec2<f32>, p_1: Particle, seed_2: u32) -> DmStreams {
    var o_1: DmStreams;

    let id_2 = p_1.id;
    let t_10 = clamp((p_1.age / p_1.lifetime), 0f, 1f);
    let custom1_ = vec4(0f);
    let custom2_ = vec4(0f);
    o_1.uv0_ = vec4<f32>(uv.x, uv.y, uv.x, uv.y);
    o_1.uv1_ = vec4<f32>(0f, 0f, 0f, 0f);
    o_1.rotationXY = vec2(0f);
    o_1.uv1_.z = t_10;
    let _e35 = dm_random(seed_2, id_2, 345u);
    o_1.uv1_.w = _e35;
    let _e36 = o_1;
    return _e36;
}

fn dm_rotate(v_2: vec3<f32>, deg: vec3<f32>) -> vec3<f32> {
    let a = (deg * 0.017453292f);
    let c = cos(a);
    let s = sin(a);
    let z_1 = vec3<f32>(((c.z * v_2.x) - (s.z * v_2.y)), ((s.z * v_2.x) + (c.z * v_2.y)), v_2.z);
    let x_1 = vec3<f32>(z_1.x, ((c.x * z_1.y) - (s.x * z_1.z)), ((s.x * z_1.y) + (c.x * z_1.z)));
    return vec3<f32>(((c.y * x_1.x) + (s.y * x_1.z)), x_1.y, ((-(s.y) * x_1.x) + (c.y * x_1.z)));
}

fn engravedBaseVertex(input_2: MaterialInput) -> vec3<f32> {
    return input_2.worldPosition;
}

fn source_vertex(input_3: MaterialInput) -> vec3<f32> {
    var clean: MaterialInput;

    clean = input_3;
    clean.custom1_.z = 0f;
    clean.custom1_.w = 0f;
    let _e8 = clean;
    let _e9 = engravedBaseVertex(_e8);
    return _e9;
}

fn engravedBaseMaterial(input_4: MaterialInput) -> vec4<f32> {
    let n1_ = vec4<f32>(0f, 0f, 0f, 0f);
    let n2_ = input_4.uv0_;
    let n3_ = vec4<f32>(0.2f, 0.2f, 0f, 0f);
    let n4_ = input_4.time;
    let n5_ = (n3_ * vec4(n4_));
    let n6_ = ((n2_.xy * vec2<f32>(1f, 1f)) + n5_.xy);
    let n103_ = textureSample(texAX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texA_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n6_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).x, (1f - ((n6_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).y)));
    let n8_ = (n1_ * n103_);
    let n10_ = (1f - 1f);
    let n11_ = mix(vec3(dot(n8_.xyz, vec3<f32>(0.2126729f, 0.7151522f, 0.072175f))), n8_.xyz, n10_);
    let n13_ = n1_.x;
    let n14_ = n1_.y;
    let n15_ = (n13_ + n14_);
    let n16_ = n1_.z;
    let n17_ = n1_.w;
    let n18_ = (n16_ + n17_);
    let n19_ = (n15_ + n18_);
    let n20_ = (n19_ > 0f);
    let n23_ = select(vec3(1f), n11_, n20_);
    let n25_ = input_4.uv0_;
    let n28_ = vec4<f32>(0f, 0f, 0f, 0f);
    let n29_ = (n103_ * n28_);
    let n30_ = clamp(n29_, vec4(0f), vec4(1f));
    let n31_ = n30_.x;
    let n32_ = n30_.y;
    let n33_ = (n31_ + n32_);
    let n34_ = n30_.z;
    let n35_ = n30_.w;
    let n36_ = (n34_ + n35_);
    let n37_ = (n33_ + n36_);
    let n38_ = clamp(n37_, 0f, 1f);
    let n39_ = vec4(n38_);
    let n44_ = (n39_ * vec4(0f));
    let n45_ = (n25_ + n44_);
    let n46_ = vec4<f32>(0f, 0f, 0f, 0f);
    let n47_ = input_4.time;
    let n48_ = (n46_ * vec4(n47_));
    let n49_ = ((n45_.xy * vec2<f32>(1f, 1f)) + n48_.xy);
    let n52_ = textureSample(texBX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texB_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n49_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).x, (1f - ((n49_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).y)));
    let n54_ = vec4<f32>(1f, 0f, 0f, 0f);
    let n53_ = n52_.x;
    let n55_ = n54_.x;
    let n56_ = (n53_ * n55_);
    let n57_ = n52_.y;
    let n58_ = n54_.y;
    let n59_ = (n57_ * n58_);
    let n60_ = n52_.z;
    let n61_ = n54_.z;
    let n62_ = (n60_ * n61_);
    let n63_ = n52_.w;
    let n64_ = n54_.w;
    let n65_ = (n63_ * n64_);
    let n67_ = vec4<f32>(n56_, n59_, n62_, n65_);
    let n69_ = (1f - 1f);
    let n70_ = mix(vec3(dot(n67_.xyz, vec3<f32>(0.2126729f, 0.7151522f, 0.072175f))), n67_.xyz, n69_);
    let n71_ = (n23_ * n70_);
    let n72_ = vec4<f32>(0f, 1f, 0f, 0f);
    let n73_ = (n72_ * n103_);
    let n74_ = n73_.x;
    let n75_ = n73_.y;
    let n76_ = n73_.z;
    let n77_ = n73_.w;
    let n78_ = vec4<f32>(n74_, n75_, n76_, n77_);
    let n82_ = mix(vec3(dot(n78_.xyz, vec3<f32>(0.2126729f, 0.7151522f, 0.072175f))), n78_.xyz, 0f);
    let n84_ = (n71_ + n82_);
    let n85_ = input_4.color;
    let n86_ = (vec4<f32>(n84_, 0f) * n85_);
    let n87_ = input_4.uv0_;
    let n88_ = n87_.z;
    let n89_ = (n88_ + 1f);
    let n91_ = (n86_ * vec4(n89_));
    let n92_ = input_4.frontFace;
    let n93_ = select(n91_, n91_, n92_);
    let n94_ = input_4.uv0_;
    let n95_ = n94_.w;
    let n96_ = (n95_ + -1f);
    let n97_ = vec4<f32>(-0.25f, 1f, 0f, 0f);
    let n98_ = (n97_.xy.x + (((n96_ - 0f) * (n97_.xy.y - n97_.xy.x)) / 1f));
    let n99_ = n97_.x;
    let n100_ = (n99_ * -1f);
    let n101_ = (n98_ + n100_);
    let n104_ = vec4<f32>(0f, 0f, 1f, 0f);
    let n105_ = (n103_ * n104_);
    let n106_ = clamp(n105_, vec4(0f), vec4(1f));
    let n107_ = n106_.x;
    let n108_ = n106_.y;
    let n109_ = (n107_ + n108_);
    let n110_ = n106_.z;
    let n111_ = n106_.w;
    let n112_ = (n110_ + n111_);
    let n113_ = (n109_ + n112_);
    let n114_ = clamp(n113_, 0f, 1f);
    let n116_ = vec4(n114_);
    let n117_ = smoothstep(vec4(n98_), vec4(n101_), n116_);
    let n119_ = clamp(n117_, vec4(0f), vec4(1f));
    let n124_ = textureSample(texBX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texB_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n49_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).x, (1f - ((n49_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).y)));
    let n125_ = vec4<f32>(0f, 0f, 0f, 1f);
    let n126_ = (n124_ * n125_);
    let n127_ = n126_.x;
    let n128_ = n126_.y;
    let n129_ = (n127_ + n128_);
    let n130_ = n126_.z;
    let n131_ = n126_.w;
    let n132_ = (n130_ + n131_);
    let n133_ = (n129_ + n132_);
    let n134_ = clamp(n133_, 0f, 1f);
    let n135_ = vec4(n134_);
    let n137_ = (vec4(1f) * n135_);
    let n138_ = (n119_ * n137_);
    let n139_ = input_4.color;
    let n140_ = n139_.w;
    let n143_ = (n138_ * vec4(n140_));
    return vec4<f32>(n93_.xyz, n143_.x);
}

fn engravedDots(uv_1: vec2<f32>, cells: f32, coverage: f32) -> f32 {
    let rotated = (vec2<f32>(((uv_1.x * 0.9063f) - (uv_1.y * 0.4226f)), ((uv_1.x * 0.4226f) + (uv_1.y * 0.9063f))) * cells);
    let _e18 = dpdx(rotated);
    let _e20 = dpdy(rotated);
    let footprint = max(length(_e18), length(_e20));
    let cell = (fract(rotated) - vec2(0.5f));
    let radius = sqrt((clamp(coverage, 0.01f, 0.95f) / 3.141593f));
    let _e35 = fwidth(length(cell));
    let aa = max(_e35, 0.035f);
    let dotMask = (1f - smoothstep((radius - aa), (radius + aa), length(cell)));
    return mix(dotMask, coverage, smoothstep(0.38f, 0.85f, footprint));
}

fn source_material(input_5: MaterialInput) -> vec4<f32> {
    var clean_1: MaterialInput;

    let age_1 = input_5.custom1_.z;
    let phase = input_5.custom1_.w;
    clean_1 = input_5;
    clean_1.custom1_.z = 0f;
    clean_1.custom1_.w = 0f;
    let _e12 = clean_1;
    let _e13 = engravedBaseMaterial(_e12);
    let uv_2 = fract((input_5.uv0_.xy * vec2<f32>(2f, 2f)));
    let density = mix(0.78f, 0.25f, smoothstep(0.18f, 0.95f, age_1));
    let _e28 = engravedDots(uv_2, 13f, density);
    let edge = (1f - smoothstep(0.15f, 0.7f, _e13.w));
    let amount = ((0.8f * smoothstep(0.18f, 0.88f, age_1)) * mix(0.4f, 1f, edge));
    return vec4<f32>(_e13.xyz, (_e13.w * mix(1f, _e28, amount)));
}

fn repair_motion(t_6: f32) -> vec3<f32> {
    let a_1 = (t_6 * 0.034906585f);
    return vec3<f32>((6.66f * (1f - cos(a_1))), 0f, (6.66f * sin(a_1)));
}

fn repair_velocity(t_7: f32) -> vec3<f32> {
    let a_2 = (t_7 * 0.034906585f);
    return (vec3<f32>((6.66f * sin(a_2)), 0f, (6.66f * cos(a_2))) * 0.034906585f);
}

fn dm_safe(v_3: vec3<f32>) -> vec3<f32> {
    return (v_3 / vec3(max(length(v_3), 0.000001f)));
}

fn dm_noise(p_2: vec3<f32>) -> f32 {
    var zvals: array<f32, 2>;
    var z: i32 = 0i;
    var yvals: array<f32, 2>;
    var y: i32;
    var xvals: array<f32, 2>;
    var x: i32;

    let i_1 = vec3<i32>(floor(p_2));
    let q = fract(p_2);
    let w = (((q * q) * q) * ((q * ((q * 6f) - vec3(15f))) + vec3(10f)));
    loop {
        let _e18 = z;
        if (_e18 < 2i) {
        } else {
            break;
        }
        {
            y = 0i;
            loop {
                let _e23 = y;
                if (_e23 < 2i) {
                } else {
                    break;
                }
                {
                    x = 0i;
                    loop {
                        let _e28 = x;
                        if (_e28 < 2i) {
                        } else {
                            break;
                        }
                        {
                            let _e31 = x;
                            let _e32 = y;
                            let _e33 = z;
                            let n = (i_1 + vec3<i32>(_e31, _e32, _e33));
                            let _e50 = dm_hash((((bitcast<u32>(n.x) * 1597334677u) ^ (bitcast<u32>(n.y) * 3812015801u)) ^ (bitcast<u32>(n.z) * 2798796415u)));
                            let g = normalize(((vec3<f32>(f32((_e50 & 255u)), f32(((_e50 >> 8u) & 255u)), f32(((_e50 >> 16u) & 255u))) / vec3(127.5f)) - vec3(1f)));
                            let _e73 = x;
                            let _e75 = x;
                            let _e77 = y;
                            let _e79 = z;
                            xvals[_e73] = dot(g, (q - vec3<f32>(f32(_e75), f32(_e77), f32(_e79))));
                        }
                        continuing {
                            let _e85 = x;
                            x = (_e85 + 1i);
                        }
                    }
                    let _e88 = y;
                    let _e91 = xvals[0];
                    let _e93 = xvals[1];
                    yvals[_e88] = mix(_e91, _e93, w.x);
                }
                continuing {
                    let _e97 = y;
                    y = (_e97 + 1i);
                }
            }
            let _e100 = z;
            let _e103 = yvals[0];
            let _e105 = yvals[1];
            zvals[_e100] = mix(_e103, _e105, w.y);
        }
        continuing {
            let _e109 = z;
            z = (_e109 + 1i);
        }
    }
    let _e112 = zvals[0];
    let _e114 = zvals[1];
    return (mix(_e112, _e114, w.z) * 1.7f);
}

fn curve_4_(t_8: f32) -> f32 {
    if (t_8 <= 0f) {
        return 1f;
    }
    if (t_8 < 0.127191f) {
        let u_6 = ((t_8 - 0f) / 0.127191f);
        return (((((((((2f * u_6) * u_6) * u_6) - ((3f * u_6) * u_6)) + 1f) * 1f) + (((((u_6 * u_6) * u_6) - ((2f * u_6) * u_6)) + u_6) * 0f)) + (((((-2f * u_6) * u_6) * u_6) + ((3f * u_6) * u_6)) * 0.3235294f)) + ((((u_6 * u_6) * u_6) - (u_6 * u_6)) * 0.025443554f));
    }
    if (t_8 < 1f) {
        let u_7 = ((t_8 - 0.127191f) / 0.872809f);
        return (((((((((2f * u_7) * u_7) * u_7) - ((3f * u_7) * u_7)) + 1f) * 0.3235294f) + (((((u_7 * u_7) * u_7) - ((2f * u_7) * u_7)) + u_7) * 0.17459854f)) + (((((-2f * u_7) * u_7) * u_7) + ((3f * u_7) * u_7)) * 0f)) + ((((u_7 * u_7) * u_7) - (u_7 * u_7)) * 0f));
    }
    return 0f;
}

fn curve_5_(t_9: f32) -> f32 {
    if (t_9 <= 0.06939553f) {
        return 1f;
    }
    if (t_9 < 1f) {
        let u_8 = ((t_9 - 0.06939553f) / 0.93060446f);
        return (((((((((2f * u_8) * u_8) * u_8) - ((3f * u_8) * u_8)) + 1f) * 1f) + (((((u_8 * u_8) * u_8) - ((2f * u_8) * u_8)) + u_8) * -0.38416153f)) + (((((-2f * u_8) * u_8) * u_8) + ((3f * u_8) * u_8)) * 0.1823529f)) + ((((u_8 * u_8) * u_8) - (u_8 * u_8)) * -0.37032092f));
    }
    return 0.1823529f;
}

@vertex 
fn vs_main(native: NativeInput, @builtin(vertex_index) vertex: u32) -> Varying {
    var p: Particle;
    var center: vec3<f32>;
    var size: vec2<f32>;
    var right: vec3<f32>;
    var up: vec3<f32>;
    var world: vec3<f32>;
    var input: MaterialInput;
    var o: Varying;

    magic_frame();
    p.id = u32(native.particle_color.x);
    p.age = native.particle_color.y;
    p.lifetime = native.particle_color.z;
    p.size_rotation.z = native.particle_color.w;
    p.alive = 1u;
    let _e20 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.seed;
    let _e22 = p.id;
    let _e24 = p.age;
    let _e26 = p.lifetime;
    dm_appearance(_e20, _e22, clamp((_e24 / _e26), 0f, 1f), (&p));
    let origin = vec4<f32>(native.center, 1f);
    let _e41 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    p.position = vec4<f32>(((origin.xyz / vec3(origin.w)) - _e41.xyz), 1f);
    let corners = array<vec2<f32>, 6>(vec2<f32>(-0.5f, -0.5f), vec2<f32>(0.5f, -0.5f), vec2<f32>(0.5f, 0.5f), vec2<f32>(-0.5f, -0.5f), vec2<f32>(0.5f, 0.5f), vec2<f32>(-0.5f, 0.5f));
    let c_1 = corners[(vertex % 6u)];
    let _e70 = p.position;
    let _e74 = frame.motion;
    let _e79 = frame.settings.x;
    center = (_e70.xyz + (_e74.xyz * _e79));
    let _e84 = p.size_rotation;
    size = _e84.xy;
    let _e89 = frame.right;
    let _e91 = magic_local_axisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e89.xyz);
    right = _e91;
    let _e95 = frame.up;
    let _e97 = magic_local_axisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e95.xyz);
    up = _e97;
    let _e102 = frame.layer.x;
    let columns = u32(_e102);
    let _e107 = frame.layer.y;
    let rows = u32(_e107);
    let _e111 = p.velocity.w;
    let tile = min(u32(max(_e111, 0f)), ((columns * rows) - 1u));
    let cell_1 = vec2<f32>(f32((tile % columns)), f32(((rows - 1u) - (tile / columns))));
    let _e133 = frame.extra.x;
    let _e136 = p.id;
    let _e138 = dm_random(bitcast<u32>(_e133), _e136, 210u);
    let _e148 = frame.extra.x;
    let _e151 = p.id;
    let _e153 = dm_random(bitcast<u32>(_e148), _e151, 211u);
    let uvCorner = vec2<f32>(select(c_1.x, -(c_1.x), (_e138 < 0f)), select(c_1.y, -(c_1.y), (_e153 < 0f)));
    let _e164 = frame.layer;
    let _e167 = p;
    let _e171 = frame.extra.x;
    let _e173 = dm_streams((((uvCorner + vec2(0.5f)) + cell_1) / _e164.xy), _e167, bitcast<u32>(_e171));
    let _e176 = frame.layer;
    let _e179 = size;
    let plane = vec3<f32>(((c_1 + _e176.zw) * _e179), 0f);
    let _e186 = p.size_rotation.z;
    let _e191 = dm_rotate(plane, (vec3<f32>(_e173.rotationXY, -(_e186)) * 57.29578f));
    let _e192 = right;
    let _e193 = up;
    let normal = normalize(cross(_e192, _e193));
    let _e196 = center;
    let _e197 = right;
    let _e200 = up;
    let _e210 = frame.settings.w;
    world = (_e196 + ((((_e197 * _e191.x) + (_e200 * _e191.y)) + (normal * _e191.z)) * _e210));
    input.uv0_ = _e173.uv0_;
    input.custom1_ = _e173.uv1_;
    let _e221 = p.color;
    input.color = _e221;
    input.normal = normal;
    let _e224 = world;
    input.worldPosition = _e224;
    let _e229 = frame.settings.x;
    input.time = _e229;
    input.delta = 0.008333334f;
    let _e232 = input;
    let _e233 = source_vertex(_e232);
    let _e235 = p.age;
    let _e236 = magic_placeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e233, _e235);
    let _e239 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    world = (_e236 + _e239.xyz);
    let _e246 = frame.vp;
    let _e247 = world;
    o.position = (_e246 * vec4<f32>(_e247, 1f));
    o.uv = _e173.uv0_;
    o.custom = _e173.uv1_;
    let _e257 = p.color;
    o.color = _e257;
    let _e259 = world;
    let _e262 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    o.world = (_e259 - _e262.xyz);
    o.normal = normal;
    let _e266 = o;
    return _e266;
}

@fragment 
fn fs_main(i: Varying, @builtin(front_facing) front: bool) -> @location(0) vec4<f32> {
    var input_1: MaterialInput;
    var alpha: f32;
    var rgb: vec3<f32>;

    magic_frame();
    input_1.uv0_ = i.uv;
    input_1.custom1_ = i.custom;
    input_1.color = i.color;
    input_1.normal = i.normal;
    input_1.worldPosition = i.world;
    let _e16 = frame.settings.x;
    input_1.time = _e16;
    input_1.delta = 0.008333334f;
    let _e23 = frame.eye;
    let _e28 = frame.forward;
    input_1.eyeDepth = dot((i.world - _e23.xyz), _e28.xyz);
    input_1.sceneEyeDepth = 10000f;
    input_1.frontFace = front;
    let _e35 = input_1;
    let _e36 = source_material(_e35);
    alpha = clamp(_e36.w, 0f, 1f);
    rgb = max(_e36.xyz, vec3(0f));
    let _e48 = rgb.x;
    let _e50 = rgb.y;
    let _e53 = rgb.z;
    let peak_1 = max(max(_e48, _e50), _e53);
    let eclipse = (mix(vec3<f32>(0.32f, 0.045f, 0.82f), vec3<f32>(0.88f, 0.78f, 1f), smoothstep(0.6f, 4f, peak_1)) * peak_1);
    let _e71 = frame.design.z;
    if (_e71 > 0.5f) {
        let _e74 = rgb;
        let _e78 = frame.design.y;
        let _e79 = enchantmentParticleColor(_e74, _e78);
        rgb = _e79;
    } else {
        let _e80 = rgb;
        let _e84 = frame.design.x;
        rgb = mix(_e80, eclipse, _e84);
    }
    let _e86 = alpha;
    let _e90 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint.w;
    alpha = (_e86 * _e90);
    let _e92 = rgb;
    let _e95 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint;
    let _e98 = alpha;
    let _e100 = alpha;
    return vec4<f32>(((_e92 * _e95.xyz) * _e98), _e100);
}
