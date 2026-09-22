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

fn gradient_0_(t: f32) -> vec4<f32> {
    var rgb_2: vec3<f32> = vec3<f32>(1f, 0.64613205f, 0.3150943f);
    var alpha_1: f32 = 1f;

    if (t <= 0.21281758f) {
        rgb_2 = vec3<f32>(0.34117648f, 1f, 0f);
    } else {
        if (t <= 0.36787975f) {
            rgb_2 = mix(vec3<f32>(0.34117648f, 1f, 0f), vec3<f32>(1f, 0.64613205f, 0.3150943f), ((t - 0.21281758f) / 0.15506218f));
        }
    }
    if (t <= 0.1702449f) {
        alpha_1 = 1f;
    } else {
        if (t <= 0.5804227f) {
            alpha_1 = mix(1f, 1f, ((t - 0.1702449f) / 0.41017777f));
        }
    }
    let _e40 = rgb_2;
    let _e41 = alpha_1;
    return vec4<f32>(_e40, _e41);
}

fn dm_appearance(seed: u32, id: u32, t_1: f32, particle: ptr<function, Particle>) {
    (*particle).size_rotation.x = 2.5f;
    (*particle).size_rotation.y = 2.5f;
    (*particle).size_rotation.w = 2.5f;
    let _e17 = gradient_0_(t_1);
    (*particle).color = (vec4<f32>(1f, 1f, 1f, 1f) * _e17);
    (*particle).velocity.w = 0f;
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

fn curve_0_(t_2: f32) -> f32 {
    if (t_2 <= 0f) {
        return 1f;
    }
    if (t_2 < 1f) {
        let u = ((t_2 - 0f) / 1f);
        return (((((((((2f * u) * u) * u) - ((3f * u) * u)) + 1f) * 1f) + (((((u * u) * u) - ((2f * u) * u)) + u) * -4.8309875f)) + (((((-2f * u) * u) * u) + ((3f * u) * u)) * -1f)) + ((((u * u) * u) - (u * u)) * -0.41851577f));
    }
    return -1f;
}

fn dm_streams(uv: vec2<f32>, p_1: Particle, seed_2: u32) -> DmStreams {
    var o_1: DmStreams;

    let id_2 = p_1.id;
    let t_3 = clamp((p_1.age / p_1.lifetime), 0f, 1f);
    let _e8 = curve_0_(t_3);
    let custom1_ = vec4<f32>(2f, 0f, 0f, (_e8 * 1f));
    let custom2_ = vec4(0f);
    o_1.uv0_ = vec4<f32>(uv.x, uv.y, custom1_.x, custom1_.y);
    o_1.uv1_ = vec4<f32>(custom1_.z, custom1_.w, 0f, 0f);
    o_1.rotationXY = vec2(0f);
    let _e34 = o_1;
    return _e34;
}

fn dm_rotate(v_2: vec3<f32>, deg: vec3<f32>) -> vec3<f32> {
    let a = (deg * 0.017453292f);
    let c = cos(a);
    let s = sin(a);
    let z_1 = vec3<f32>(((c.z * v_2.x) - (s.z * v_2.y)), ((s.z * v_2.x) + (c.z * v_2.y)), v_2.z);
    let x_1 = vec3<f32>(z_1.x, ((c.x * z_1.y) - (s.x * z_1.z)), ((s.x * z_1.y) + (c.x * z_1.z)));
    return vec3<f32>(((c.y * x_1.x) + (s.y * x_1.z)), x_1.y, ((-(s.y) * x_1.x) + (c.y * x_1.z)));
}

fn source_vertex(input_2: MaterialInput) -> vec3<f32> {
    let n1_ = input_2.worldPosition;
    let n2_ = input_2.custom1_;
    let n3_ = n2_.z;
    let n4_ = input_2.uv0_;
    let n5_ = vec4<f32>(0f, -1f, 0f, 0f);
    let n6_ = input_2.time;
    let n7_ = (n5_ * vec4(n6_));
    let n8_ = ((n4_.xy * vec2<f32>(1f, 1f)) + n7_.xy);
    let n11_ = textureSampleLevel(texAX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texA_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n8_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).x, (1f - ((n8_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).y)), 0f);
    let n12_ = vec4<f32>(1f, 0f, 0f, 0f);
    let n13_ = (n11_ * n12_);
    let n14_ = clamp(n13_, vec4(0f), vec4(1f));
    let n15_ = n14_.x;
    let n16_ = n14_.y;
    let n17_ = (n15_ + n16_);
    let n18_ = n14_.z;
    let n19_ = n14_.w;
    let n20_ = (n18_ + n19_);
    let n21_ = (n17_ + n20_);
    let n22_ = clamp(n21_, 0f, 1f);
    let n23_ = vec4(n22_);
    let n24_ = n23_.x;
    let n25_ = n23_.y;
    let n26_ = n23_.z;
    let n27_ = vec3<f32>(n24_, n25_, n26_);
    let n28_ = (vec3(n3_) * n27_);
    let n29_ = input_2.normal;
    let n30_ = (n28_ * n29_);
    let n34_ = (n1_ + n30_);
    return n34_;
}

fn source_material(input_3: MaterialInput) -> vec4<f32> {
    let n1_1 = vec4<f32>(1f, 0f, 0f, 0f);
    let n2_1 = input_3.uv0_;
    let n3_1 = vec4<f32>(0f, -1f, 0f, 0f);
    let n4_1 = input_3.time;
    let n5_1 = (n3_1 * vec4(n4_1));
    let n6_1 = ((n2_1.xy * vec2<f32>(1f, 1f)) + n5_1.xy);
    let n108_ = textureSample(texAX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texA_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n6_1 * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).x, (1f - ((n6_1 * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).y)));
    let n8_1 = (n1_1 * n108_);
    let n10_ = (1f - 1f);
    let n11_1 = mix(vec3(dot(n8_1.xyz, vec3<f32>(0.2126729f, 0.7151522f, 0.072175f))), n8_1.xyz, n10_);
    let n13_1 = n1_1.x;
    let n14_1 = n1_1.y;
    let n15_1 = (n13_1 + n14_1);
    let n16_1 = n1_1.z;
    let n17_1 = n1_1.w;
    let n18_1 = (n16_1 + n17_1);
    let n19_1 = (n15_1 + n18_1);
    let n20_1 = (n19_1 > 0f);
    let n23_1 = select(vec3(1f), n11_1, n20_1);
    let n25_1 = input_3.uv0_;
    let n26_1 = input_3.custom1_;
    let n27_1 = n26_1.x;
    let n28_1 = n26_1.y;
    let n29_1 = vec2<f32>(n27_1, n28_1);
    let n32_ = vec4<f32>(1f, 0f, 0f, 0f);
    let n33_ = (n108_ * n32_);
    let n34_1 = clamp(n33_, vec4(0f), vec4(1f));
    let n35_ = n34_1.x;
    let n36_ = n34_1.y;
    let n37_ = (n35_ + n36_);
    let n38_ = n34_1.z;
    let n39_ = n34_1.w;
    let n40_ = (n38_ + n39_);
    let n41_ = (n37_ + n40_);
    let n42_ = clamp(n41_, 0f, 1f);
    let n43_ = vec4(n42_);
    let n45_ = (n43_ * vec4(0f));
    let n49_ = (vec4<f32>(n29_1, 0f, 0f) + n45_);
    let n50_ = (n25_1 + n49_);
    let n51_ = vec4<f32>(0f, 0f, 0f, 0f);
    let n52_ = input_3.time;
    let n53_ = (n51_ * vec4(n52_));
    let n54_ = ((n50_.xy * vec2<f32>(1f, 1f)) + n53_.xy);
    let n57_ = textureSample(texBX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texB_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n54_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).x, (1f - ((n54_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).y)));
    let n59_ = vec4<f32>(1f, 1f, 1f, 0f);
    let n58_ = n57_.x;
    let n60_ = n59_.x;
    let n61_ = (n58_ * n60_);
    let n62_ = n57_.y;
    let n63_ = n59_.y;
    let n64_ = (n62_ * n63_);
    let n65_ = n57_.z;
    let n66_ = n59_.z;
    let n67_ = (n65_ * n66_);
    let n68_ = n57_.w;
    let n69_ = n59_.w;
    let n70_ = (n68_ * n69_);
    let n72_ = vec4<f32>(n61_, n64_, n67_, n70_);
    let n74_ = (1f - 1f);
    let n75_ = mix(vec3(dot(n72_.xyz, vec3<f32>(0.2126729f, 0.7151522f, 0.072175f))), n72_.xyz, n74_);
    let n76_ = (n23_1 * n75_);
    let n77_ = vec4<f32>(0f, 0f, 0f, 0f);
    let n78_ = (n77_ * n108_);
    let n79_ = n78_.x;
    let n80_ = n78_.y;
    let n81_ = n78_.z;
    let n82_ = n78_.w;
    let n83_ = vec4<f32>(n79_, n80_, n81_, n82_);
    let n87_ = mix(vec3(dot(n83_.xyz, vec3<f32>(0.2126729f, 0.7151522f, 0.072175f))), n83_.xyz, 0f);
    let n89_ = (n76_ + n87_);
    let n90_ = input_3.color;
    let n91_ = (vec4<f32>(n89_, 0f) * n90_);
    let n92_ = input_3.uv0_;
    let n93_ = n92_.z;
    let n94_ = (n93_ + 1f);
    let n96_ = (n91_ * vec4(n94_));
    let n97_ = input_3.frontFace;
    let n98_ = select(n96_, n96_, n97_);
    let n99_ = input_3.uv0_;
    let n100_ = n99_.w;
    let n101_ = (n100_ + -1f);
    let n102_ = vec4<f32>(-0.25f, 1f, 0f, 0f);
    let n103_ = (n102_.xy.x + (((n101_ - 0f) * (n102_.xy.y - n102_.xy.x)) / 1f));
    let n104_ = n102_.x;
    let n105_ = (n104_ * -1f);
    let n106_ = (n103_ + n105_);
    let n109_ = vec4<f32>(1f, 0f, 0f, 0f);
    let n110_ = (n108_ * n109_);
    let n111_ = clamp(n110_, vec4(0f), vec4(1f));
    let n112_ = n111_.x;
    let n113_ = n111_.y;
    let n114_ = (n112_ + n113_);
    let n115_ = n111_.z;
    let n116_ = n111_.w;
    let n117_ = (n115_ + n116_);
    let n118_ = (n114_ + n117_);
    let n119_ = clamp(n118_, 0f, 1f);
    let n121_ = vec4(n119_);
    let n122_ = smoothstep(vec4(n103_), vec4(n106_), n121_);
    let n124_ = clamp(n122_, vec4(0f), vec4(1f));
    let n125_ = input_3.time;
    let n126_ = vec4<f32>(0f, 0f, 0f, 0f);
    let n127_ = (vec4(n125_) * n126_);
    let n128_ = ((input_3.uv0_.xy * vec2<f32>(1f, 1f)) + n127_.xy);
    let n131_ = textureSample(texCX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texC_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n128_ * vec2<f32>(1f, 0.7f)) + vec2<f32>(0f, -0.69f)).x, (1f - ((n128_ * vec2<f32>(1f, 0.7f)) + vec2<f32>(0f, -0.69f)).y)));
    let n132_ = vec4<f32>(1f, 0f, 0f, 0f);
    let n133_ = (n131_ * n132_);
    let n134_ = n133_.x;
    let n135_ = n133_.y;
    let n136_ = (n134_ + n135_);
    let n137_ = n133_.z;
    let n138_ = n133_.w;
    let n139_ = (n137_ + n138_);
    let n140_ = (n136_ + n139_);
    let n141_ = clamp(n140_, 0f, 1f);
    let n143_ = vec4(n141_);
    let n146_ = textureSample(texBX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texB_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n54_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).x, (1f - ((n54_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).y)));
    let n147_ = vec4<f32>(0f, 0f, 0f, 1f);
    let n148_ = (n146_ * n147_);
    let n149_ = n148_.x;
    let n150_ = n148_.y;
    let n151_ = (n149_ + n150_);
    let n152_ = n148_.z;
    let n153_ = n148_.w;
    let n154_ = (n152_ + n153_);
    let n155_ = (n151_ + n154_);
    let n156_ = clamp(n155_, 0f, 1f);
    let n157_ = vec4(n156_);
    let n159_ = (n143_ * n157_);
    let n160_ = (n124_ * n159_);
    let n161_ = input_3.color;
    let n162_ = n161_.w;
    let n165_ = (n160_ * vec4(n162_));
    return vec4<f32>(n98_.xyz, n165_.x);
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

@vertex 
fn vs_main(native: NativeInput, @builtin(vertex_index) vertex: u32) -> Varying {
    var p: Particle;
    var hidden: Varying;
    var center: vec3<f32>;
    var size: vec2<f32>;
    var right: vec3<f32> = vec3<f32>(1f, 0f, 0f);
    var up: vec3<f32> = vec3<f32>(0f, 1f, 0f);
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
    dm_appearance(_e36, _e38, clamp((_e40 / _e42), 0f, 1f), (&p));
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
    let _e191 = size;
    let _e194 = p.size_rotation.w;
    let meshSize = vec3<f32>(_e191, _e194);
    let _e199 = p.size_rotation.z;
    let angles = (vec3<f32>(_e190.rotationXY, -(_e199)) * 57.29578f);
    let _e207 = dm_rotate((mv.position.xyz * meshSize), angles);
    let forward = vec3<f32>(0f, 0f, 1f);
    let _e219 = dm_rotate((mv.normal.xyz / max(abs(meshSize), vec3(0.00001f))), angles);
    let _e222 = right;
    let _e225 = up;
    let normal = normalize((((_e222 * _e219.x) + (_e225 * _e219.y)) + (forward * _e219.z)));
    let _e233 = center;
    let _e234 = right;
    let _e237 = up;
    let _e247 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.settings.w;
    world = (_e233 + ((((_e234 * _e207.x) + (_e237 * _e207.y)) + (forward * _e207.z)) * _e247));
    input.uv0_ = _e190.uv0_;
    input.custom1_ = _e190.uv1_;
    let _e258 = p.color;
    input.color = (_e258 * mv.color);
    input.normal = normal;
    let _e263 = world;
    input.worldPosition = _e263;
    let _e267 = frame.eye;
    let _e269 = world;
    input.viewDirection = (_e267.xyz - _e269);
    let _e275 = frame.settings.x;
    input.time = _e275;
    input.delta = 0.008333334f;
    let _e278 = input;
    let _e279 = source_vertex(_e278);
    let _e281 = p.age;
    let _e282 = magic_placeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e279, _e281);
    let _e285 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    world = (_e282 + _e285.xyz);
    let _e292 = frame.vp;
    let _e293 = world;
    o.position = (_e292 * vec4<f32>(_e293, 1f));
    o.uv = _e190.uv0_;
    o.custom = _e190.uv1_;
    let _e303 = p.color;
    o.color = (_e303 * mv.color);
    let _e307 = world;
    o.world = _e307;
    let _e311 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisX;
    let _e315 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisY;
    let _e319 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisZ;
    o.normal = normalize((mat3x3<f32>(_e311.xyz, _e315.xyz, _e319.xyz) * normal));
    let _e324 = o;
    return _e324;
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
    rgb = _e41.xyz;
    let _e50 = rgb.x;
    let _e52 = rgb.y;
    let _e55 = rgb.z;
    let peak_1 = max(max(_e50, _e52), _e55);
    let eclipse = (mix(vec3<f32>(0.32f, 0.045f, 0.82f), vec3<f32>(0.88f, 0.78f, 1f), smoothstep(0.6f, 4f, peak_1)) * peak_1);
    let _e73 = frame.design.z;
    if (_e73 > 0.5f) {
        let _e76 = rgb;
        let _e80 = frame.design.y;
        let _e81 = enchantmentParticleColor(_e76, _e80);
        rgb = _e81;
    } else {
        let _e82 = rgb;
        let _e86 = frame.design.x;
        rgb = mix(_e82, eclipse, _e86);
    }
    let _e88 = alpha;
    let _e92 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint.w;
    alpha = (_e88 * _e92);
    let _e94 = rgb;
    let _e97 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint;
    let _e100 = alpha;
    let _e102 = alpha;
    return vec4<f32>(((_e94 * _e97.xyz) * _e100), _e102);
}
