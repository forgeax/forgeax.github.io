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
    texCCoordinatesTransform: vec4<f32>,
    texCCoordinatesMetadata: vec4<f32>,
    texDCoordinatesTransform: vec4<f32>,
    texDCoordinatesMetadata: vec4<f32>,
    ueColor: vec4<f32>,
    ueSurface: vec4<f32>,
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
    @location(14) vertex_color: vec4<f32>,
    @location(15) uv1_: vec2<f32>,
    @location(10) particle_velocity: vec4<f32>,
    @location(11) particle_size: vec4<f32>,
}

struct MeshVertex {
    position: vec4<f32>,
    normal: vec4<f32>,
    uv: vec4<f32>,
    color: vec4<f32>,
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
    viewDirection: vec3<f32>,
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
@group(1) @binding(5) 
var texC_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX: sampler;
@group(1) @binding(6) 
var texCX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX: texture_2d<f32>;
@group(1) @binding(7) 
var texD_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX: sampler;
@group(1) @binding(8) 
var texDX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX: texture_2d<f32>;
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

fn ue_appearance(seed_1: u32, id_1: u32, t: f32, p_1: ptr<function, Particle>) {
    let _e3 = dm_random(seed_1, id_1, 2u);
    let _e10 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.ueSurface.z;
    let s = (mix(0.4f, 0.45f, _e3) * _e10);
    (*p_1).size_rotation = vec4<f32>(s, s, 0f, s);
    let _e19 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.ueColor;
    (*p_1).color = _e19;
    return;
}

fn growth(t_1: f32) -> f32 {
    let values = array<f32, 107>(0f, 0.005818562f, 0.02251859f, 0.04896659f, 0.0840291f, 0.1265726f, 0.17546363f, 0.2295687f, 0.28775433f, 0.348887f, 0.41183323f, 0.47545955f, 0.5386325f, 0.60021853f, 0.6590844f, 0.71409625f, 0.76412076f, 0.80802435f, 0.84467375f, 0.87293535f, 0.8916757f, 0.8997612f, 0.9006289f, 0.90141505f, 0.90220124f, 0.9029874f, 0.90377355f, 0.90455973f, 0.9053459f, 0.90613204f, 0.9069182f, 0.9077044f, 0.90849054f, 0.9092767f, 0.9100629f, 0.91084903f, 0.9116352f, 0.9124214f, 0.91320753f, 0.9139937f, 0.91477984f, 0.915566f, 0.9163522f, 0.91713834f, 0.9179245f, 0.9187107f, 0.91949683f, 0.920283f, 0.9210692f, 0.92185533f, 0.9226415f, 0.9234277f, 0.9242138f, 0.925f, 0.9257862f, 0.9265723f, 0.9273585f, 0.9281447f, 0.9289308f, 0.929717f, 0.9305032f, 0.9312893f, 0.9320755f, 0.9328617f, 0.9336478f, 0.934434f, 0.9352201f, 0.9360063f, 0.9367925f, 0.9375786f, 0.9383648f, 0.939151f, 0.9399371f, 0.9407233f, 0.9415095f, 0.9422956f, 0.9430818f, 0.943868f, 0.9446541f, 0.9454403f, 0.9462265f, 0.9470126f, 0.9477988f, 0.948585f, 0.9493711f, 0.949748f, 0.94121325f, 0.9214319f, 0.89160013f, 0.8529146f, 0.80657196f, 0.7537682f, 0.69569993f, 0.6335641f, 0.5685564f, 0.5018741f, 0.43471277f, 0.36826938f, 0.30374068f, 0.24232244f, 0.18521178f, 0.13360435f, 0.088697135f, 0.051686943f, 0.023769617f, 0.006141782f, 0f);
    let x_1 = (clamp(((t_1 - 0f) / 1f), 0f, 1f) * 106f);
    let a = u32(floor(x_1));
    return mix(values[a], values[min((a + 1u), 106u)], fract(x_1));
}

fn fade(t_2: f32) -> f32 {
    let values_1 = array<f32, 91>(1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 0.99772805f, 0.9910837f, 0.9803241f, 0.96570647f, 0.94748807f, 0.9259259f, 0.9012775f, 0.87379974f, 0.84375006f, 0.81138545f, 0.7769632f, 0.7407407f, 0.70297486f, 0.66392314f, 0.6238425f, 0.5829904f, 0.5416237f, 0.5f, 0.4583761f, 0.4170096f, 0.37615734f, 0.33607686f, 0.29702497f, 0.25925928f, 0.22303653f, 0.18861455f, 0.15624994f, 0.1262002f, 0.0987224f, 0.07407403f, 0.05251193f, 0.034293473f, 0.01967585f, 0.008916378f, 0.0022719502f, 0f);
    let x_2 = (clamp(((t_2 - 0f) / 1f), 0f, 1f) * 90f);
    let a_1 = u32(floor(x_2));
    return mix(values_1[a_1], values_1[min((a_1 + 1u), 90u)], fract(x_2));
}

fn dm_streams(uv: vec2<f32>, p_2: Particle, seed_2: u32) -> DmStreams {
    var o_1: DmStreams;

    let id_2 = p_2.id;
    let t_6 = clamp((p_2.age / p_2.lifetime), 0f, 1f);
    o_1.uv0_ = vec4<f32>(uv, 0f, 0f);
    let _e15 = growth(t_6);
    let _e16 = fade(t_6);
    o_1.uv1_ = vec4<f32>(_e15, 0f, 0f, _e16);
    o_1.rotationXY = vec2(0f);
    let _e23 = o_1;
    return _e23;
}

fn ue_mesh_rotate(v_2: vec3<f32>, p_3: Particle, seed_3: u32) -> vec3<f32> {
    let id_3 = p_3.id;
    let _e12 = dm_random(seed_3, id_3, 11u);
    let _e14 = dm_random(seed_3, id_3, 12u);
    let _e16 = dm_random(seed_3, id_3, 13u);
    let a_2 = (mix(vec3<f32>(0f, 0f, -1f), vec3<f32>(1f, 1f, 1f), vec3<f32>(_e12, _e14, _e16)) * 6.2831855f);
    let angle_1 = length(a_2);
    let axis = (a_2 / vec3(max(angle_1, 0.000001f)));
    let w = v_2.xzy;
    return (((w * cos(angle_1)) + (cross(axis, w) * sin(angle_1))) + ((axis * dot(axis, w)) * (1f - cos(angle_1)))).xzy;
}

fn source_vertex(i_1: MaterialInput) -> vec3<f32> {
    let ue_n0_ = (i_1.uv0_.zw * vec2<f32>(1f, 1f));
    let ue_n1_ = ue_n0_.y;
    let ue_n2_ = (1f - ue_n1_);
    let ue_n4_ = i_1.custom1_.x;
    let ue_n5_ = mix(5f, 1f, ue_n4_);
    let ue_n7_ = (ue_n5_ * 0.25f);
    let ue_n10_ = (((vec3<f32>(sin((((i_1.time * 0.5f) * 6.2831855f) + (i_1.worldPosition.x * 2f))), cos((((i_1.time * 0.5f) * 5.3f) + (i_1.worldPosition.z * 2f))), 0f) * ue_n7_) * ue_n7_) + vec3(0f));
    let ue_n11_ = (vec3(ue_n2_) * ue_n10_);
    return (i_1.worldPosition + (ue_n11_.xzy * 0.01f));
}

fn source_material(i_2: MaterialInput) -> vec4<f32> {
    let ue_n12_ = i_2.color.xyz;
    let ue_n13_ = vec3<f32>(7.9899f, 8f, 0.98167086f);
    let ue_n14_ = (i_2.uv0_.zw * vec2<f32>(1f, 1f));
    let ue_n15_ = i_2.color.w;
    let ue_n16_ = (ue_n14_ + (vec2<f32>(0f, -1.6f) * ue_n15_));
    let _e23 = textureSampleLevel(texAX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texA_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, ue_n16_, 0f);
    let ue_n17_ = _e23.x;
    let ue_n18_ = (0.25f + ue_n17_);
    let ue_n19_ = (ue_n13_ * vec3(ue_n18_));
    let ue_n20_ = mix(ue_n19_, vec3(1f), vec3(ue_n15_));
    let _e38 = textureSampleLevel(texBX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texB_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, i_2.uv0_.xy, 0f);
    let ue_n21_ = _e38.xyz;
    let ue_n22_ = (ue_n20_ * ue_n21_.xyz);
    let ue_n23_ = (ue_n12_.xyz * ue_n22_);
    let ue_n24_ = (i_2.uv0_.zw * vec2<f32>(1f, 0.9f));
    let ue_n26_ = i_2.custom1_.x;
    let ue_n27_ = mix(-0.8f, 0.92f, ue_n26_);
    let ue_n28_ = (ue_n24_ + vec2(ue_n27_));
    let _e60 = textureSampleLevel(texCX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texC_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, ue_n28_, 0f);
    let ue_n29_ = _e60.xyz;
    let _e67 = textureSampleLevel(texBX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texB_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, i_2.uv0_.xy, 0f);
    let ue_n30_ = _e67.x;
    let ue_n31_ = (ue_n30_ + 0.1f);
    let ue_n32_ = (ue_n29_.xyz * vec3(ue_n31_));
    let ue_n33_ = vec3<f32>(60f, 50.563866f, 3.6632645f);
    let ue_n34_ = (ue_n32_ * ue_n33_.xyz);
    let ue_n35_ = vec3<f32>(0.015299999f, 0.017711157f, 0.02f);
    let ue_n36_ = (ue_n23_ * ue_n35_.xyz);
    let ue_n37_ = (ue_n34_ + ue_n36_);
    let _e92 = textureSampleLevel(texBX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texB_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, i_2.uv0_.xy, 0f);
    let ue_n38_ = _e92.w;
    let ue_n39_ = (i_2.uv0_.zw * vec2<f32>(1f, 1f));
    let _e103 = textureSampleLevel(texDX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texD_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, ue_n39_, 0f);
    let ue_n40_ = _e103.x;
    let ue_n41_ = (ue_n40_ + ue_n26_);
    let ue_n42_ = mix(-8f, 1f, ue_n41_);
    let ue_n43_ = clamp(ue_n42_, 0f, 1f);
    let ue_n44_ = (ue_n38_ * ue_n43_);
    let ue_n45_ = (ue_n17_ - ue_n15_);
    let ue_n46_ = mix(0.25f, -2.5f, ue_n45_);
    let ue_n47_ = clamp(ue_n46_, 0f, 1f);
    let alpha_1 = (ue_n44_ * ue_n47_);
    if (alpha_1 < 0.333333f) {
        discard;
    }
    let light = (0.25f + (0.75f * abs(dot(normalize(i_2.normal), vec3<f32>(0.42399913f, 0.84799826f, 0.31799936f)))));
    return vec4<f32>(((ue_n23_ * light) + ue_n37_), 1f);
}

fn dm_rotate(v_3: vec3<f32>, deg: vec3<f32>) -> vec3<f32> {
    let a_3 = (deg * 0.017453292f);
    let c = cos(a_3);
    let s_1 = sin(a_3);
    let z_1 = vec3<f32>(((c.z * v_3.x) - (s_1.z * v_3.y)), ((s_1.z * v_3.x) + (c.z * v_3.y)), v_3.z);
    let x_3 = vec3<f32>(z_1.x, ((c.x * z_1.y) - (s_1.x * z_1.z)), ((s_1.x * z_1.y) + (c.x * z_1.z)));
    return vec3<f32>(((c.y * x_3.x) + (s_1.y * x_3.z)), x_3.y, ((-(s_1.y) * x_3.x) + (c.y * x_3.z)));
}

fn dm_noise(p_4: vec3<f32>) -> f32 {
    var zvals: array<f32, 2>;
    var z: i32 = 0i;
    var yvals: array<f32, 2>;
    var y: i32;
    var xvals: array<f32, 2>;
    var x: i32;

    let i_3 = vec3<i32>(floor(p_4));
    let q = fract(p_4);
    let w_1 = (((q * q) * q) * ((q * ((q * 6f) - vec3(15f))) + vec3(10f)));
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
                            let n = (i_3 + vec3<i32>(_e31, _e32, _e33));
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
                    yvals[_e88] = mix(_e91, _e93, w_1.x);
                }
                continuing {
                    let _e97 = y;
                    y = (_e97 + 1i);
                }
            }
            let _e100 = z;
            let _e103 = yvals[0];
            let _e105 = yvals[1];
            zvals[_e100] = mix(_e103, _e105, w_1.y);
        }
        continuing {
            let _e109 = z;
            z = (_e109 + 1i);
        }
    }
    let _e112 = zvals[0];
    let _e114 = zvals[1];
    return (mix(_e112, _e114, w_1.z) * 1.7f);
}

fn expand(t_3: f32) -> f32 {
    let values_2 = array<f32, 115>(0f, 0.00565851f, 0.022184059f, 0.04890168f, 0.085136384f, 0.13021323f, 0.18345724f, 0.24419342f, 0.31174678f, 0.38544238f, 0.4646053f, 0.54856056f, 0.6366331f, 0.72814786f, 0.82243013f, 0.9188049f, 1.0165969f, 1.1151316f, 1.2137336f, 1.3117281f, 1.4084402f, 1.503195f, 1.5953176f, 1.6841325f, 1.7689651f, 1.8491404f, 1.9239835f, 1.9928193f, 2.0549731f, 2.1097693f, 2.156534f, 2.1945908f, 2.2232661f, 2.241884f, 2.24977f, 2.247576f, 2.2379718f, 2.221483f, 2.1985595f, 2.1696513f, 2.1352081f, 2.0956805f, 2.0515177f, 2.0031703f, 1.951088f, 1.8957208f, 1.8375187f, 1.7769319f, 1.7144101f, 1.6504034f, 1.5853616f, 1.5197349f, 1.4539732f, 1.3885262f, 1.3238444f, 1.2603779f, 1.198576f, 1.138889f, 1.0817667f, 1.0276597f, 0.97701716f, 0.93028986f, 0.8879272f, 0.85037935f, 0.8180959f, 0.7915275f, 0.7711239f, 0.75733495f, 0.7506108f, 0.7697368f, 0.80263144f, 0.8355263f, 0.8684209f, 0.90131575f, 0.9342106f, 0.9671052f, 1f, 1.0328947f, 1.0657896f, 1.0986842f, 1.105263f, 1.0065784f, 0.9078947f, 0.8092102f, 0.71052635f, 0.6118419f, 0.5131581f, 0.41447365f, 0.31578916f, 0.21710533f, 0.11842084f, 0.019737005f, 0.03508779f, 0.07894728f, 0.12280708f, 0.16666657f, 0.21052636f, 0.25438616f, 0.29824567f, 0.34210545f, 0.38596496f, 0.42982474f, 0.47368425f, 0.48245597f, 0.43859652f, 0.39473674f, 0.350877f, 0.3070175f, 0.26315773f, 0.21929827f, 0.17543852f, 0.13157904f, 0.08771926f, 0.04385951f, 0.000000029802322f);
    let x_4 = (clamp(((t_3 - 0f) / 1f), 0f, 1f) * 114f);
    let a_4 = u32(floor(x_4));
    return mix(values_2[a_4], values_2[min((a_4 + 1u), 114u)], fract(x_4));
}

fn energy(t_4: f32) -> f32 {
    let values_3 = array<f32, 77>(3f, 3.0068452f, 3.0070682f, 3.000968f, 2.9888442f, 2.9709961f, 2.9477232f, 2.9193246f, 2.8861003f, 2.8483493f, 2.806371f, 2.760465f, 2.7109303f, 2.6580667f, 2.6021736f, 2.5435498f, 2.4824955f, 2.4193096f, 2.3542917f, 2.2877412f, 2.2199569f, 2.1512394f, 2.0818872f, 2.0121996f, 1.9424767f, 1.8730174f, 1.804121f, 1.7360872f, 1.6692153f, 1.603805f, 1.540155f, 1.4785656f, 1.4193351f, 1.3627636f, 1.3091508f, 1.2587951f, 1.2119967f, 1.169055f, 1.130269f, 1.0959381f, 1.0663623f, 1.0418403f, 1.0226717f, 1.0091559f, 1.0015924f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f);
    let x_5 = (clamp(((t_4 - 0f) / 0.85f), 0f, 1f) * 76f);
    let a_5 = u32(floor(x_5));
    return mix(values_3[a_5], values_3[min((a_5 + 1u), 76u)], fract(x_5));
}

fn flatten(t_5: f32) -> f32 {
    let values_4 = array<f32, 53>(0f, 0.024193887f, 0.090408705f, 0.18909422f, 0.3107001f, 0.44567618f, 0.58447206f, 0.7175376f, 0.8353225f, 0.92827636f, 0.98684925f, 1.0082649f, 1.0246624f, 1.0415521f, 1.0588889f, 1.0766271f, 1.0947216f, 1.1131266f, 1.131797f, 1.150687f, 1.1697514f, 1.1889448f, 1.2082217f, 1.2275366f, 1.2468442f, 1.2660989f, 1.2852554f, 1.3042682f, 1.3230919f, 1.3416811f, 1.3599904f, 1.3779742f, 1.395587f, 1.4127836f, 1.4295187f, 1.4457464f, 1.4614216f, 1.4764988f, 1.4909327f, 1.5046774f, 1.517688f, 1.5299189f, 1.5413244f, 1.5518594f, 1.5614785f, 1.5701358f, 1.5777864f, 1.5843847f, 1.589885f, 1.5942423f, 1.5974107f, 1.599345f, 1.6f);
    let x_6 = (clamp(((t_5 - 0f) / 0.9920555f), 0f, 1f) * 52f);
    let a_6 = u32(floor(x_6));
    return mix(values_4[a_6], values_4[min((a_6 + 1u), 52u)], fract(x_6));
}

@vertex 
fn vs_main(native: NativeInput, @builtin(vertex_index) vertex: u32) -> Varying {
    var p: Particle;
    var hidden: Varying;
    var center: vec3<f32>;
    var size: vec2<f32>;
    var right: vec3<f32> = vec3<f32>(1f, 0f, 0f);
    var up: vec3<f32> = vec3<f32>(0f, 1f, 0f);
    var streams: DmStreams;
    var world: vec3<f32>;
    var input: MaterialInput;
    var o: Varying;

    magic_frame();
    p.id = u32(native.particle_color.x);
    p.age = native.particle_color.y;
    p.lifetime = native.particle_color.z;
    p.size_rotation = native.particle_size;
    p.velocity = native.particle_velocity;
    p.alive = 1u;
    let _e23 = p.age;
    if (_e23 < 0f) {
        hidden.position = vec4<f32>(2f, 2f, 2f, 1f);
        let _e33 = hidden;
        return _e33;
    }
    let _e36 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.seed;
    let _e38 = p.id;
    let _e40 = p.age;
    let _e42 = p.lifetime;
    ue_appearance(_e36, _e38, clamp((_e40 / _e42), 0f, 1f), (&p));
    let origin = vec4<f32>(native.center, 1f);
    let _e57 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    let _e60 = magic_local_axisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(((origin.xyz / vec3(origin.w)) - _e57.xyz));
    p.position = vec4<f32>(_e60, 1f);
    let mv = MeshVertex(vec4<f32>(native.position, 1f), vec4<f32>(native.normal, 0f), vec4<f32>(native.uv, native.uv1_), native.vertex_color);
    let corners = array<vec2<f32>, 6>(vec2<f32>(-0.5f, -0.5f), vec2<f32>(0.5f, -0.5f), vec2<f32>(0.5f, 0.5f), vec2<f32>(-0.5f, -0.5f), vec2<f32>(0.5f, 0.5f), vec2<f32>(-0.5f, 0.5f));
    let c_1 = (mv.uv.xy - vec2(0.5f));
    let _e99 = p.position;
    let _e103 = frame.motion;
    let _e108 = frame.settings.x;
    center = (_e99.xyz + (_e103.xyz * _e108));
    let _e113 = p.size_rotation;
    size = _e113.xy;
    let _e119 = frame.layer.x;
    let columns = u32(_e119);
    let _e124 = frame.layer.y;
    let rows = u32(_e124);
    let _e128 = p.velocity.w;
    let tile = min(u32(max(_e128, 0f)), ((columns * rows) - 1u));
    let cell = vec2<f32>(f32((tile % columns)), f32(((rows - 1u) - (tile / columns))));
    let _e150 = frame.extra.x;
    let _e153 = p.id;
    let _e155 = dm_random(bitcast<u32>(_e150), _e153, 210u);
    let _e165 = frame.extra.x;
    let _e168 = p.id;
    let _e170 = dm_random(bitcast<u32>(_e165), _e168, 211u);
    let uvCorner = vec2<f32>(select(c_1.x, -(c_1.x), (_e155 < 0f)), select(c_1.y, -(c_1.y), (_e170 < 0f)));
    let _e181 = frame.layer;
    let _e184 = p;
    let _e188 = frame.extra.x;
    let _e190 = dm_streams((((uvCorner + vec2(0.5f)) + cell) / _e181.xy), _e184, bitcast<u32>(_e188));
    streams = _e190;
    let _e194 = streams.uv0_;
    streams.uv0_ = vec4<f32>(_e194.xy, mv.uv.zw);
    let _e199 = size;
    let _e202 = p.size_rotation.w;
    let meshSize = vec3<f32>(_e199, _e202);
    let _e205 = streams.rotationXY;
    let _e208 = p.size_rotation.z;
    let angles = (vec3<f32>(_e205, -(_e208)) * 57.29578f);
    let _e216 = p;
    let _e220 = frame.extra.x;
    let _e222 = ue_mesh_rotate((mv.position.xyz * meshSize), _e216, bitcast<u32>(_e220));
    let forward = vec3<f32>(0f, 0f, 1f);
    let _e234 = p;
    let _e238 = frame.extra.x;
    let _e240 = ue_mesh_rotate((mv.normal.xyz / max(abs(meshSize), vec3(0.00001f))), _e234, bitcast<u32>(_e238));
    let _e243 = right;
    let _e246 = up;
    let normal = normalize((((_e243 * _e240.x) + (_e246 * _e240.y)) + (forward * _e240.z)));
    let _e254 = center;
    let _e255 = right;
    let _e258 = up;
    let _e268 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.settings.w;
    world = (_e254 + ((((_e255 * _e222.x) + (_e258 * _e222.y)) + (forward * _e222.z)) * _e268));
    let _e275 = streams.uv0_;
    input.uv0_ = _e275;
    let _e278 = streams.uv1_;
    input.custom1_ = _e278;
    let _e281 = p.color;
    input.color = (_e281 * mv.color);
    input.normal = normal;
    let _e286 = world;
    input.worldPosition = _e286;
    let _e290 = frame.eye;
    let _e292 = world;
    input.viewDirection = (_e290.xyz - _e292);
    let _e298 = frame.settings.x;
    input.time = _e298;
    input.delta = 0.008333334f;
    let _e301 = input;
    let _e302 = source_vertex(_e301);
    let _e304 = p.age;
    let _e305 = magic_placeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e302, _e304);
    let _e308 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    world = (_e305 + _e308.xyz);
    let _e315 = frame.vp;
    let _e316 = world;
    o.position = (_e315 * vec4<f32>(_e316, 1f));
    let _e322 = streams.uv0_;
    o.uv = _e322;
    let _e325 = streams.uv1_;
    o.custom = _e325;
    let _e328 = p.color;
    o.color = (_e328 * mv.color);
    let _e332 = world;
    o.world = _e332;
    let _e336 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisX;
    let _e340 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisY;
    let _e344 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisZ;
    o.normal = normalize((mat3x3<f32>(_e336.xyz, _e340.xyz, _e344.xyz) * normal));
    let _e349 = o;
    return _e349;
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
    let _e15 = frame.eye;
    input_1.viewDirection = (_e15.xyz - i.world);
    let _e23 = frame.settings.x;
    input_1.time = _e23;
    input_1.delta = 0.008333334f;
    let _e30 = frame.eye;
    let _e35 = frame.forward;
    input_1.eyeDepth = dot((i.world - _e30.xyz), _e35.xyz);
    input_1.frontFace = front;
    let _e40 = input_1;
    let _e41 = source_material(_e40);
    alpha = clamp(_e41.w, 0f, 1f);
    rgb = max(_e41.xyz, vec3(0f));
    let _e53 = rgb.x;
    let _e55 = rgb.y;
    let _e58 = rgb.z;
    let peak_1 = max(max(_e53, _e55), _e58);
    let eclipse = (mix(vec3<f32>(0.32f, 0.045f, 0.82f), vec3<f32>(0.88f, 0.78f, 1f), smoothstep(0.6f, 4f, peak_1)) * peak_1);
    let _e76 = frame.design.z;
    if (_e76 > 0.5f) {
        let _e79 = rgb;
        let _e83 = frame.design.y;
        let _e84 = enchantmentParticleColor(_e79, _e83);
        rgb = _e84;
    } else {
        let _e85 = rgb;
        let _e89 = frame.design.x;
        rgb = mix(_e85, eclipse, _e89);
    }
    let _e91 = alpha;
    let _e95 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint.w;
    alpha = (_e91 * _e95);
    let _e97 = rgb;
    let _e100 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint;
    let _e103 = alpha;
    let _e105 = alpha;
    return vec4<f32>(((_e97 * _e100.xyz) * _e103), _e105);
}
