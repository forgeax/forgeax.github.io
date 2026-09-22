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

fn expand(t: f32) -> f32 {
    let values = array<f32, 115>(0f, 0.00565851f, 0.022184059f, 0.04890168f, 0.085136384f, 0.13021323f, 0.18345724f, 0.24419342f, 0.31174678f, 0.38544238f, 0.4646053f, 0.54856056f, 0.6366331f, 0.72814786f, 0.82243013f, 0.9188049f, 1.0165969f, 1.1151316f, 1.2137336f, 1.3117281f, 1.4084402f, 1.503195f, 1.5953176f, 1.6841325f, 1.7689651f, 1.8491404f, 1.9239835f, 1.9928193f, 2.0549731f, 2.1097693f, 2.156534f, 2.1945908f, 2.2232661f, 2.241884f, 2.24977f, 2.247576f, 2.2379718f, 2.221483f, 2.1985595f, 2.1696513f, 2.1352081f, 2.0956805f, 2.0515177f, 2.0031703f, 1.951088f, 1.8957208f, 1.8375187f, 1.7769319f, 1.7144101f, 1.6504034f, 1.5853616f, 1.5197349f, 1.4539732f, 1.3885262f, 1.3238444f, 1.2603779f, 1.198576f, 1.138889f, 1.0817667f, 1.0276597f, 0.97701716f, 0.93028986f, 0.8879272f, 0.85037935f, 0.8180959f, 0.7915275f, 0.7711239f, 0.75733495f, 0.7506108f, 0.7697368f, 0.80263144f, 0.8355263f, 0.8684209f, 0.90131575f, 0.9342106f, 0.9671052f, 1f, 1.0328947f, 1.0657896f, 1.0986842f, 1.105263f, 1.0065784f, 0.9078947f, 0.8092102f, 0.71052635f, 0.6118419f, 0.5131581f, 0.41447365f, 0.31578916f, 0.21710533f, 0.11842084f, 0.019737005f, 0.03508779f, 0.07894728f, 0.12280708f, 0.16666657f, 0.21052636f, 0.25438616f, 0.29824567f, 0.34210545f, 0.38596496f, 0.42982474f, 0.47368425f, 0.48245597f, 0.43859652f, 0.39473674f, 0.350877f, 0.3070175f, 0.26315773f, 0.21929827f, 0.17543852f, 0.13157904f, 0.08771926f, 0.04385951f, 0.000000029802322f);
    let x_1 = (clamp(((t - 0f) / 1f), 0f, 1f) * 114f);
    let a = u32(floor(x_1));
    return mix(values[a], values[min((a + 1u), 114u)], fract(x_1));
}

fn flatten(t_1: f32) -> f32 {
    let values_1 = array<f32, 53>(0f, 0.024193887f, 0.090408705f, 0.18909422f, 0.3107001f, 0.44567618f, 0.58447206f, 0.7175376f, 0.8353225f, 0.92827636f, 0.98684925f, 1.0082649f, 1.0246624f, 1.0415521f, 1.0588889f, 1.0766271f, 1.0947216f, 1.1131266f, 1.131797f, 1.150687f, 1.1697514f, 1.1889448f, 1.2082217f, 1.2275366f, 1.2468442f, 1.2660989f, 1.2852554f, 1.3042682f, 1.3230919f, 1.3416811f, 1.3599904f, 1.3779742f, 1.395587f, 1.4127836f, 1.4295187f, 1.4457464f, 1.4614216f, 1.4764988f, 1.4909327f, 1.5046774f, 1.517688f, 1.5299189f, 1.5413244f, 1.5518594f, 1.5614785f, 1.5701358f, 1.5777864f, 1.5843847f, 1.589885f, 1.5942423f, 1.5974107f, 1.599345f, 1.6f);
    let x_2 = (clamp(((t_1 - 0f) / 0.9920555f), 0f, 1f) * 52f);
    let a_1 = u32(floor(x_2));
    return mix(values_1[a_1], values_1[min((a_1 + 1u), 52u)], fract(x_2));
}

fn ue_appearance(seed: u32, id: u32, t_2: f32, p_1: ptr<function, Particle>) {
    let _e1 = expand(t_2);
    let _e7 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.ueSurface.z;
    let s = ((0.5f * _e1) * _e7);
    let _e11 = flatten(t_2);
    (*p_1).size_rotation = vec4<f32>(s, (s * _e11), 0f, s);
    let _e18 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.ueColor;
    (*p_1).color = _e18;
    return;
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

fn dm_random(seed_1: u32, id_1: u32, key: u32) -> f32 {
    let _e13 = dm_hash(((seed_1 ^ ((id_1 + 1u) * 747796405u)) ^ ((key + 1u) * 2891336453u)));
    return (f32(_e13) / 4294967300f);
}

fn energy(t_3: f32) -> f32 {
    let values_2 = array<f32, 77>(3f, 3.0068452f, 3.0070682f, 3.000968f, 2.9888442f, 2.9709961f, 2.9477232f, 2.9193246f, 2.8861003f, 2.8483493f, 2.806371f, 2.760465f, 2.7109303f, 2.6580667f, 2.6021736f, 2.5435498f, 2.4824955f, 2.4193096f, 2.3542917f, 2.2877412f, 2.2199569f, 2.1512394f, 2.0818872f, 2.0121996f, 1.9424767f, 1.8730174f, 1.804121f, 1.7360872f, 1.6692153f, 1.603805f, 1.540155f, 1.4785656f, 1.4193351f, 1.3627636f, 1.3091508f, 1.2587951f, 1.2119967f, 1.169055f, 1.130269f, 1.0959381f, 1.0663623f, 1.0418403f, 1.0226717f, 1.0091559f, 1.0015924f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f);
    let x_3 = (clamp(((t_3 - 0f) / 0.85f), 0f, 1f) * 76f);
    let a_2 = u32(floor(x_3));
    return mix(values_2[a_2], values_2[min((a_2 + 1u), 76u)], fract(x_3));
}

fn dm_streams(uv: vec2<f32>, p_2: Particle, seed_2: u32) -> DmStreams {
    var o_1: DmStreams;

    let id_2 = p_2.id;
    let t_6 = clamp((p_2.age / p_2.lifetime), 0f, 1f);
    o_1.uv0_ = vec4<f32>(uv, 0f, 0f);
    let _e15 = energy(t_6);
    o_1.uv1_ = vec4<f32>(-1f, _e15, 89.98863f, 0f);
    o_1.rotationXY = vec2(0f);
    let _e23 = o_1;
    return _e23;
}

fn dm_rotate(v_2: vec3<f32>, deg: vec3<f32>) -> vec3<f32> {
    let a_3 = (deg * 0.017453292f);
    let c = cos(a_3);
    let s_1 = sin(a_3);
    let z_1 = vec3<f32>(((c.z * v_2.x) - (s_1.z * v_2.y)), ((s_1.z * v_2.x) + (c.z * v_2.y)), v_2.z);
    let x_4 = vec3<f32>(z_1.x, ((c.x * z_1.y) - (s_1.x * z_1.z)), ((s_1.x * z_1.y) + (c.x * z_1.z)));
    return vec3<f32>(((c.y * x_4.x) + (s_1.y * x_4.z)), x_4.y, ((-(s_1.y) * x_4.x) + (c.y * x_4.z)));
}

fn source_vertex(i_1: MaterialInput) -> vec3<f32> {
    let ue_n0_ = (i_1.uv0_.xy * vec2<f32>(1f, 1f));
    let ue_n3_ = vec2<f32>(3f, 1f);
    let ue_n4_ = (ue_n0_ * ue_n3_);
    let ue_n7_ = vec2<f32>(0f, 0f);
    let ue_n8_ = (ue_n4_ + ue_n7_);
    let ue_n11_ = vec2<f32>(0.2f, 0.35f);
    let ue_n12_ = (ue_n8_ + (ue_n11_ * i_1.time));
    let _e24 = textureSampleLevel(texAX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texA_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, ue_n12_, 0f);
    let ue_n13_ = _e24.x;
    let ue_n14_ = i_1.normal.xzy;
    let ue_n15_ = (vec3(ue_n13_) * ue_n14_);
    let ue_n18_ = (ue_n15_ * vec3(65f));
    return (i_1.worldPosition + (ue_n18_.xzy * 0.01f));
}

fn source_material(i_2: MaterialInput) -> vec4<f32> {
    let ue_n19_ = (i_2.uv0_.xy * vec2<f32>(1f, 1f));
    let ue_n21_ = (ue_n19_ * vec2(0.5f));
    let ue_n23_ = (ue_n21_ + vec2(-0.1f));
    let ue_n24_ = ue_n23_.y;
    let ue_n25_ = clamp(ue_n24_, 0f, 1f);
    let ue_n26_ = ue_n19_.y;
    let ue_n27_ = (ue_n26_ * 1.5f);
    let ue_n28_ = clamp(ue_n27_, 0f, 1f);
    let ue_n29_ = (i_2.uv0_.xy * vec2<f32>(1f, 1f));
    let ue_n30_ = ue_n29_.x;
    let ue_n31_ = ue_n29_.y;
    let ue_n33_ = (ue_n31_ * 0f);
    let ue_n34_ = (ue_n30_ + ue_n33_);
    let ue_n36_ = (ue_n34_ * 3f);
    let ue_n38_ = (ue_n36_ + 0f);
    let ue_n39_ = i_2.time;
    let ue_n41_ = (ue_n39_ * 0f);
    let ue_n42_ = (ue_n38_ + ue_n41_);
    let ue_n44_ = (ue_n31_ * 1f);
    let ue_n46_ = (ue_n44_ + 0f);
    let ue_n47_ = i_2.time;
    let ue_n49_ = (ue_n47_ * 0.2f);
    let ue_n50_ = (ue_n46_ + ue_n49_);
    let ue_n51_ = vec2<f32>(ue_n42_, ue_n50_);
    let _e54 = textureSampleLevel(texBX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texB_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, ue_n51_, 0f);
    let ue_n52_ = _e54.x;
    let ue_n53_ = (ue_n28_ * ue_n52_);
    let ue_n55_ = pow(max(ue_n53_, 0f), 1f);
    let ue_n56_ = (ue_n25_ + ue_n55_);
    let ue_n57_ = i_2.color.xyz;
    let ue_n58_ = (vec3(ue_n56_) * ue_n57_.xyz);
    let ue_n59_ = (i_2.uv0_.xy * vec2<f32>(1f, 1f));
    let ue_n62_ = vec2<f32>(6f, 1f);
    let ue_n63_ = (ue_n59_ * ue_n62_);
    let ue_n66_ = vec2<f32>(0f, 0f);
    let ue_n67_ = (ue_n63_ + ue_n66_);
    let ue_n70_ = vec2<f32>(0f, 0.3f);
    let ue_n71_ = (ue_n67_ + (ue_n70_ * i_2.time));
    let _e90 = textureSampleLevel(texCX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texC_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, ue_n71_, 0f);
    let ue_n72_ = _e90.x;
    let ue_n73_ = i_2.custom1_.y;
    let ue_n74_ = (ue_n72_ * ue_n73_);
    let ue_n76_ = pow(max(ue_n74_, 0f), 8f);
    let ue_n77_ = (ue_n76_ * ue_n73_);
    let ue_n78_ = (ue_n58_ + vec3(ue_n77_));
    let ue_n80_ = i_2.custom1_.x;
    let alpha_1 = smoothstep((ue_n80_ - (0.02f * (1f - ue_n80_))), ((ue_n80_ - (0.02f * (1f - ue_n80_))) + max(0.02f, 0.00001f)), ue_n56_);
    if (alpha_1 < 0.333333f) {
        discard;
    }
    let light = (0.25f + (0.75f * abs(dot(normalize(i_2.normal), vec3<f32>(0.42399913f, 0.84799826f, 0.31799936f)))));
    return vec4<f32>(ue_n78_, 1f);
}

fn dm_noise(p_3: vec3<f32>) -> f32 {
    var zvals: array<f32, 2>;
    var z: i32 = 0i;
    var yvals: array<f32, 2>;
    var y: i32;
    var xvals: array<f32, 2>;
    var x: i32;

    let i_3 = vec3<i32>(floor(p_3));
    let q = fract(p_3);
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

fn growth(t_4: f32) -> f32 {
    let values_3 = array<f32, 107>(0f, 0.005818562f, 0.02251859f, 0.04896659f, 0.0840291f, 0.1265726f, 0.17546363f, 0.2295687f, 0.28775433f, 0.348887f, 0.41183323f, 0.47545955f, 0.5386325f, 0.60021853f, 0.6590844f, 0.71409625f, 0.76412076f, 0.80802435f, 0.84467375f, 0.87293535f, 0.8916757f, 0.8997612f, 0.9006289f, 0.90141505f, 0.90220124f, 0.9029874f, 0.90377355f, 0.90455973f, 0.9053459f, 0.90613204f, 0.9069182f, 0.9077044f, 0.90849054f, 0.9092767f, 0.9100629f, 0.91084903f, 0.9116352f, 0.9124214f, 0.91320753f, 0.9139937f, 0.91477984f, 0.915566f, 0.9163522f, 0.91713834f, 0.9179245f, 0.9187107f, 0.91949683f, 0.920283f, 0.9210692f, 0.92185533f, 0.9226415f, 0.9234277f, 0.9242138f, 0.925f, 0.9257862f, 0.9265723f, 0.9273585f, 0.9281447f, 0.9289308f, 0.929717f, 0.9305032f, 0.9312893f, 0.9320755f, 0.9328617f, 0.9336478f, 0.934434f, 0.9352201f, 0.9360063f, 0.9367925f, 0.9375786f, 0.9383648f, 0.939151f, 0.9399371f, 0.9407233f, 0.9415095f, 0.9422956f, 0.9430818f, 0.943868f, 0.9446541f, 0.9454403f, 0.9462265f, 0.9470126f, 0.9477988f, 0.948585f, 0.9493711f, 0.949748f, 0.94121325f, 0.9214319f, 0.89160013f, 0.8529146f, 0.80657196f, 0.7537682f, 0.69569993f, 0.6335641f, 0.5685564f, 0.5018741f, 0.43471277f, 0.36826938f, 0.30374068f, 0.24232244f, 0.18521178f, 0.13360435f, 0.088697135f, 0.051686943f, 0.023769617f, 0.006141782f, 0f);
    let x_5 = (clamp(((t_4 - 0f) / 1f), 0f, 1f) * 106f);
    let a_4 = u32(floor(x_5));
    return mix(values_3[a_4], values_3[min((a_4 + 1u), 106u)], fract(x_5));
}

fn fade(t_5: f32) -> f32 {
    let values_4 = array<f32, 91>(1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 0.99772805f, 0.9910837f, 0.9803241f, 0.96570647f, 0.94748807f, 0.9259259f, 0.9012775f, 0.87379974f, 0.84375006f, 0.81138545f, 0.7769632f, 0.7407407f, 0.70297486f, 0.66392314f, 0.6238425f, 0.5829904f, 0.5416237f, 0.5f, 0.4583761f, 0.4170096f, 0.37615734f, 0.33607686f, 0.29702497f, 0.25925928f, 0.22303653f, 0.18861455f, 0.15624994f, 0.1262002f, 0.0987224f, 0.07407403f, 0.05251193f, 0.034293473f, 0.01967585f, 0.008916378f, 0.0022719502f, 0f);
    let x_6 = (clamp(((t_5 - 0f) / 1f), 0f, 1f) * 90f);
    let a_5 = u32(floor(x_6));
    return mix(values_4[a_5], values_4[min((a_5 + 1u), 90u)], fract(x_6));
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
    let _e216 = dm_rotate((mv.position.xyz * meshSize), angles);
    let forward = vec3<f32>(0f, 0f, 1f);
    let _e228 = dm_rotate((mv.normal.xyz / max(abs(meshSize), vec3(0.00001f))), angles);
    let _e231 = right;
    let _e234 = up;
    let normal = normalize((((_e231 * _e228.x) + (_e234 * _e228.y)) + (forward * _e228.z)));
    let _e242 = center;
    let _e243 = right;
    let _e246 = up;
    let _e256 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.settings.w;
    world = (_e242 + ((((_e243 * _e216.x) + (_e246 * _e216.y)) + (forward * _e216.z)) * _e256));
    let _e263 = streams.uv0_;
    input.uv0_ = _e263;
    let _e266 = streams.uv1_;
    input.custom1_ = _e266;
    let _e269 = p.color;
    input.color = (_e269 * mv.color);
    input.normal = normal;
    let _e274 = world;
    input.worldPosition = _e274;
    let _e278 = frame.eye;
    let _e280 = world;
    input.viewDirection = (_e278.xyz - _e280);
    let _e286 = frame.settings.x;
    input.time = _e286;
    input.delta = 0.008333334f;
    let _e289 = input;
    let _e290 = source_vertex(_e289);
    let _e292 = p.age;
    let _e293 = magic_placeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e290, _e292);
    let _e296 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    world = (_e293 + _e296.xyz);
    let _e303 = frame.vp;
    let _e304 = world;
    o.position = (_e303 * vec4<f32>(_e304, 1f));
    let _e310 = streams.uv0_;
    o.uv = _e310;
    let _e313 = streams.uv1_;
    o.custom = _e313;
    let _e316 = p.color;
    o.color = (_e316 * mv.color);
    let _e320 = world;
    o.world = _e320;
    let _e324 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisX;
    let _e328 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisY;
    let _e332 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisZ;
    o.normal = normalize((mat3x3<f32>(_e324.xyz, _e328.xyz, _e332.xyz) * normal));
    let _e337 = o;
    return _e337;
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
