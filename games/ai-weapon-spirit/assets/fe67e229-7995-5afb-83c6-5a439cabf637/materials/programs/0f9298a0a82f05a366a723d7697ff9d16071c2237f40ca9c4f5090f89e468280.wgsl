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
var<private> frame: Frame;
@group(0) @binding(0) 
var scene_depth: texture_depth_2d;

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

fn nature_scene_eye_depth(pixel: vec2<f32>) -> f32 {
    let _e1 = textureDimensions(scene_depth);
    let dims = vec2<f32>(_e1);
    let z_2 = textureLoad(scene_depth, vec2<i32>(pixel), 0i);
    let ndc = vec2<f32>((((pixel.x / dims.x) * 2f) - 1f), (1f - ((pixel.y / dims.y) * 2f)));
    let _e25 = frame.invvp;
    let h = (_e25 * vec4<f32>(ndc, z_2, 1f));
    let _e35 = frame.eye;
    let _e40 = frame.forward;
    return dot(((h.xyz / vec3(h.w)) - _e35.xyz), _e40.xyz);
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

fn curve_0_(t: f32) -> f32 {
    if (t <= 0f) {
        return 0f;
    }
    if (t < 1f) {
        let u = ((t - 0f) / 1f);
        return (((((((((2f * u) * u) * u) - ((3f * u) * u)) + 1f) * 0f) + (((((u * u) * u) - ((2f * u) * u)) + u) * 0.4172144f)) + (((((-2f * u) * u) * u) + ((3f * u) * u)) * 1f)) + ((((u * u) * u) - (u * u)) * 1f));
    }
    return 1f;
}

fn curve_1_(t_1: f32) -> f32 {
    if (t_1 <= 0f) {
        return 0f;
    }
    if (t_1 < 1f) {
        let u_1 = ((t_1 - 0f) / 1f);
        return (((((((((2f * u_1) * u_1) * u_1) - ((3f * u_1) * u_1)) + 1f) * 0f) + (((((u_1 * u_1) * u_1) - ((2f * u_1) * u_1)) + u_1) * 0.4172144f)) + (((((-2f * u_1) * u_1) * u_1) + ((3f * u_1) * u_1)) * 1f)) + ((((u_1 * u_1) * u_1) - (u_1 * u_1)) * 1f));
    }
    return 1f;
}

fn curve_2_(t_2: f32) -> f32 {
    if (t_2 <= 0f) {
        return 0f;
    }
    if (t_2 < 1f) {
        let u_2 = ((t_2 - 0f) / 1f);
        return (((((((((2f * u_2) * u_2) * u_2) - ((3f * u_2) * u_2)) + 1f) * 0f) + (((((u_2 * u_2) * u_2) - ((2f * u_2) * u_2)) + u_2) * 0.4172144f)) + (((((-2f * u_2) * u_2) * u_2) + ((3f * u_2) * u_2)) * 1f)) + ((((u_2 * u_2) * u_2) - (u_2 * u_2)) * 1f));
    }
    return 1f;
}

fn gradient_3_(t_3: f32) -> vec4<f32> {
    var rgb_2: vec3<f32> = vec3<f32>(0f, 0f, 0f);
    var alpha_1: f32 = 0f;

    if (t_3 <= 0f) {
        rgb_2 = vec3<f32>(1f, 1f, 1f);
    } else {
        if (t_3 <= 1f) {
            rgb_2 = mix(vec3<f32>(1f, 1f, 1f), vec3<f32>(0f, 0f, 0f), ((t_3 - 0f) / 1f));
        }
    }
    if (t_3 <= 0f) {
        alpha_1 = 1f;
    } else {
        if (t_3 <= 0.7911803f) {
            alpha_1 = mix(1f, 1f, ((t_3 - 0f) / 0.7911803f));
        } else {
            if (t_3 <= 1f) {
                alpha_1 = mix(1f, 0f, ((t_3 - 0.7911803f) / 0.20881972f));
            }
        }
    }
    let _e47 = rgb_2;
    let _e48 = alpha_1;
    return vec4<f32>(_e47, _e48);
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

fn dm_appearance(seed_1: u32, id_1: u32, t_4: f32, particle: ptr<function, Particle>) {
    let _e4 = curve_0_(t_4);
    (*particle).size_rotation.x = max(0f, (2f * (_e4 * 2f)));
    let _e13 = curve_1_(t_4);
    (*particle).size_rotation.y = max(0f, (2f * (_e13 * 2f)));
    let _e22 = curve_2_(t_4);
    (*particle).size_rotation.w = max(0f, (2f * (_e22 * 2f)));
    let _e35 = gradient_3_(t_4);
    (*particle).color = (vec4<f32>(0.3726415f, 1f, 0.47355035f, 1f) * _e35);
    let _e42 = dm_random(seed_1, id_1, 26u);
    (*particle).velocity.w = floor((fract((0f + (mix(0f, 0.9999f, _e42) * 1f))) * 4f));
    return;
}

fn stream_curve_0_(t_5: f32) -> f32 {
    if (t_5 <= 0f) {
        return -0.028085947f;
    }
    if (t_5 < 1f) {
        let u_3 = ((t_5 - 0f) / 1f);
        return (((((((((2f * u_3) * u_3) * u_3) - ((3f * u_3) * u_3)) + 1f) * -0.028085947f) + (((((u_3 * u_3) * u_3) - ((2f * u_3) * u_3)) + u_3) * 0f)) + (((((-2f * u_3) * u_3) * u_3) + ((3f * u_3) * u_3)) * 0.7640457f)) + ((((u_3 * u_3) * u_3) - (u_3 * u_3)) * 0f));
    }
    return 0.7640457f;
}

fn dm_streams(uv: vec2<f32>, p_1: Particle, seed_2: u32) -> DmStreams {
    var o_1: DmStreams;

    let id_3 = p_1.id;
    let t_6 = clamp((p_1.age / p_1.lifetime), 0f, 1f);
    let _e8 = stream_curve_0_(t_6);
    let custom1_ = vec4<f32>(0f, (_e8 * 2f), 0f, 0f);
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
    let z_3 = vec3<f32>(((c.z * v_2.x) - (s.z * v_2.y)), ((s.z * v_2.x) + (c.z * v_2.y)), v_2.z);
    let x_2 = vec3<f32>(z_3.x, ((c.x * z_3.y) - (s.x * z_3.z)), ((s.x * z_3.y) + (c.x * z_3.z)));
    return vec3<f32>(((c.y * x_2.x) + (s.y * x_2.z)), x_2.y, ((-(s.y) * x_2.x) + (c.y * x_2.z)));
}

fn source_vertex(input_2: MaterialInput) -> vec3<f32> {
    let n1_ = input_2.worldPosition;
    let n2_ = input_2.custom1_;
    let n3_ = n2_.z;
    let n4_ = input_2.uv0_;
    let n5_ = vec4<f32>(0f, 0f, 0f, 0f);
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
    let n1_1 = vec4<f32>(0f, 0f, 0f, 0f);
    let n2_1 = input_3.uv0_;
    let n3_1 = vec4<f32>(0f, 0f, 0f, 0f);
    let n4_1 = input_3.time;
    let n5_1 = (n3_1 * vec4(n4_1));
    let n6_1 = ((n2_1.xy * vec2<f32>(1f, 1f)) + n5_1.xy);
    let n103_ = textureSample(texAX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texA_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n6_1 * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).x, (1f - ((n6_1 * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).y)));
    let n8_1 = (n1_1 * n103_);
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
    let n28_1 = vec4<f32>(0f, 0f, 0f, 0f);
    let n29_1 = (n103_ * n28_1);
    let n30_1 = clamp(n29_1, vec4(0f), vec4(1f));
    let n31_ = n30_1.x;
    let n32_ = n30_1.y;
    let n33_ = (n31_ + n32_);
    let n34_1 = n30_1.z;
    let n35_ = n30_1.w;
    let n36_ = (n34_1 + n35_);
    let n37_ = (n33_ + n36_);
    let n38_ = clamp(n37_, 0f, 1f);
    let n39_ = vec4(n38_);
    let n44_ = (n39_ * vec4(0f));
    let n45_ = (n25_1 + n44_);
    let n46_ = vec4<f32>(0f, 0f, 0f, 0f);
    let n47_ = input_3.time;
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
    let n71_ = (n23_1 * n70_);
    let n72_ = vec4<f32>(0f, 0f, 0f, 0f);
    let n73_ = (n72_ * n103_);
    let n74_ = n73_.x;
    let n75_ = n73_.y;
    let n76_ = n73_.z;
    let n77_ = n73_.w;
    let n78_ = vec4<f32>(n74_, n75_, n76_, n77_);
    let n82_ = mix(vec3(dot(n78_.xyz, vec3<f32>(0.2126729f, 0.7151522f, 0.072175f))), n78_.xyz, 0f);
    let n84_ = (n71_ + n82_);
    let n85_ = input_3.color;
    let n86_ = (vec4<f32>(n84_, 0f) * n85_);
    let n87_ = input_3.uv0_;
    let n88_ = n87_.z;
    let n89_ = (n88_ + 1f);
    let n91_ = (n86_ * vec4(n89_));
    let n92_ = input_3.frontFace;
    let n93_ = select(n91_, n91_, n92_);
    let n94_ = input_3.uv0_;
    let n95_ = n94_.w;
    let n96_ = (n95_ + -1f);
    let n97_ = vec4<f32>(-0.25f, 1f, 0f, 0f);
    let n98_ = (n97_.xy.x + (((n96_ - 0f) * (n97_.xy.y - n97_.xy.x)) / 1f));
    let n99_ = n97_.x;
    let n100_ = (n99_ * -1f);
    let n101_ = (n98_ + n100_);
    let n104_ = vec4<f32>(1f, 0f, 0f, 0f);
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
    let n121_ = input_3.sceneEyeDepth;
    let n122_ = input_3.eyeDepth;
    let n123_ = (n121_ - n122_);
    let n125_ = max(0f, 1f);
    let n126_ = (n123_ / n125_);
    let n128_ = clamp(n126_, 0f, 1f);
    let n133_ = textureSample(texBX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texB_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n49_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).x, (1f - ((n49_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).y)));
    let n134_ = vec4<f32>(0f, 0f, 0f, 1f);
    let n135_ = (n133_ * n134_);
    let n136_ = n135_.x;
    let n137_ = n135_.y;
    let n138_ = (n136_ + n137_);
    let n139_ = n135_.z;
    let n140_ = n135_.w;
    let n141_ = (n139_ + n140_);
    let n142_ = (n138_ + n141_);
    let n143_ = clamp(n142_, 0f, 1f);
    let n144_ = vec4(n143_);
    let n145_ = (vec4(1f) * n144_);
    let n147_ = (vec4(n128_) * n145_);
    let n148_ = (n119_ * n147_);
    let n149_ = input_3.color;
    let n150_ = n149_.w;
    let n153_ = (n148_ * vec4(n150_));
    return vec4<f32>(n93_.xyz, n153_.x);
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

fn stream_dm_hash(value_1: u32) -> u32 {
    var v_4: u32;

    v_4 = value_1;
    let _e2 = v_4;
    let _e3 = v_4;
    v_4 = ((_e2 ^ (_e3 >> 16u)) * 2246822519u);
    let _e9 = v_4;
    let _e10 = v_4;
    v_4 = ((_e9 ^ (_e10 >> 13u)) * 3266489917u);
    let _e16 = v_4;
    let _e17 = v_4;
    return (_e16 ^ (_e17 >> 16u));
}

fn stream_dm_random(seed_3: u32, id_2: u32, key_1: u32) -> f32 {
    let _e13 = stream_dm_hash(((seed_3 ^ ((id_2 + 1u) * 747796405u)) ^ ((key_1 + 1u) * 2891336453u)));
    return (f32(_e13) / 4294967300f);
}

fn stream_dm_rotate(v_5: vec3<f32>, deg_1: vec3<f32>) -> vec3<f32> {
    let a_1 = (deg_1 * 0.017453292f);
    let c_1 = cos(a_1);
    let s_1 = sin(a_1);
    let z_4 = vec3<f32>(((c_1.z * v_5.x) - (s_1.z * v_5.y)), ((s_1.z * v_5.x) + (c_1.z * v_5.y)), v_5.z);
    let x_3 = vec3<f32>(z_4.x, ((c_1.x * z_4.y) - (s_1.x * z_4.z)), ((s_1.x * z_4.y) + (c_1.x * z_4.z)));
    return vec3<f32>(((c_1.y * x_3.x) + (s_1.y * x_3.z)), x_3.y, ((-(s_1.y) * x_3.x) + (c_1.y * x_3.z)));
}

fn stream_dm_noise(p_3: vec3<f32>) -> f32 {
    var zvals_1: array<f32, 2>;
    var z_1: i32 = 0i;
    var yvals_1: array<f32, 2>;
    var y_1: i32;
    var xvals_1: array<f32, 2>;
    var x_1: i32;

    let i_2 = vec3<i32>(floor(p_3));
    let q_1 = fract(p_3);
    let w_1 = (((q_1 * q_1) * q_1) * ((q_1 * ((q_1 * 6f) - vec3(15f))) + vec3(10f)));
    loop {
        let _e18 = z_1;
        if (_e18 < 2i) {
        } else {
            break;
        }
        {
            y_1 = 0i;
            loop {
                let _e23 = y_1;
                if (_e23 < 2i) {
                } else {
                    break;
                }
                {
                    x_1 = 0i;
                    loop {
                        let _e28 = x_1;
                        if (_e28 < 2i) {
                        } else {
                            break;
                        }
                        {
                            let _e31 = x_1;
                            let _e32 = y_1;
                            let _e33 = z_1;
                            let n_1 = (i_2 + vec3<i32>(_e31, _e32, _e33));
                            let _e50 = stream_dm_hash((((bitcast<u32>(n_1.x) * 1597334677u) ^ (bitcast<u32>(n_1.y) * 3812015801u)) ^ (bitcast<u32>(n_1.z) * 2798796415u)));
                            let g_1 = normalize(((vec3<f32>(f32((_e50 & 255u)), f32(((_e50 >> 8u) & 255u)), f32(((_e50 >> 16u) & 255u))) / vec3(127.5f)) - vec3(1f)));
                            let _e73 = x_1;
                            let _e75 = x_1;
                            let _e77 = y_1;
                            let _e79 = z_1;
                            xvals_1[_e73] = dot(g_1, (q_1 - vec3<f32>(f32(_e75), f32(_e77), f32(_e79))));
                        }
                        continuing {
                            let _e85 = x_1;
                            x_1 = (_e85 + 1i);
                        }
                    }
                    let _e88 = y_1;
                    let _e91 = xvals_1[0];
                    let _e93 = xvals_1[1];
                    yvals_1[_e88] = mix(_e91, _e93, w_1.x);
                }
                continuing {
                    let _e97 = y_1;
                    y_1 = (_e97 + 1i);
                }
            }
            let _e100 = z_1;
            let _e103 = yvals_1[0];
            let _e105 = yvals_1[1];
            zvals_1[_e100] = mix(_e103, _e105, w_1.y);
        }
        continuing {
            let _e109 = z_1;
            z_1 = (_e109 + 1i);
        }
    }
    let _e112 = zvals_1[0];
    let _e114 = zvals_1[1];
    return (mix(_e112, _e114, w_1.z) * 1.7f);
}

@vertex 
fn vs_main(native: NativeInput, @builtin(vertex_index) vertex: u32) -> Varying {
    var p: Particle;
    var hidden: Varying;
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
    p.size_rotation = native.particle_size;
    p.velocity = native.particle_velocity;
    p.alive = 1u;
    let _e19 = p.age;
    if (_e19 < 0f) {
        hidden.position = vec4<f32>(2f, 2f, 2f, 1f);
        let _e29 = hidden;
        return _e29;
    }
    let _e32 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.seed;
    let _e34 = p.id;
    let _e36 = p.age;
    let _e38 = p.lifetime;
    dm_appearance(_e32, _e34, clamp((_e36 / _e38), 0f, 1f), (&p));
    let origin = vec4<f32>(native.center, 1f);
    let _e53 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    let _e56 = magic_local_axisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(((origin.xyz / vec3(origin.w)) - _e53.xyz));
    p.position = vec4<f32>(_e56, 1f);
    let corners = array<vec2<f32>, 6>(vec2<f32>(-0.5f, -0.5f), vec2<f32>(0.5f, -0.5f), vec2<f32>(0.5f, 0.5f), vec2<f32>(-0.5f, -0.5f), vec2<f32>(0.5f, 0.5f), vec2<f32>(-0.5f, 0.5f));
    let c_2 = corners[(vertex % 6u)];
    let _e83 = p.position;
    let _e87 = frame.motion;
    let _e92 = frame.settings.x;
    center = (_e83.xyz + (_e87.xyz * _e92));
    let _e97 = p.size_rotation;
    size = _e97.xy;
    let _e102 = frame.right;
    let _e104 = magic_local_axisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e102.xyz);
    right = _e104;
    let _e108 = frame.up;
    let _e110 = magic_local_axisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e108.xyz);
    up = _e110;
    let _e115 = frame.layer.x;
    let columns = u32(_e115);
    let _e120 = frame.layer.y;
    let rows = u32(_e120);
    let _e124 = p.velocity.w;
    let tile = min(u32(max(_e124, 0f)), ((columns * rows) - 1u));
    let cell = vec2<f32>(f32((tile % columns)), f32(((rows - 1u) - (tile / columns))));
    let _e146 = frame.extra.x;
    let _e149 = p.id;
    let _e151 = dm_random(bitcast<u32>(_e146), _e149, 210u);
    let _e161 = frame.extra.x;
    let _e164 = p.id;
    let _e166 = dm_random(bitcast<u32>(_e161), _e164, 211u);
    let uvCorner = vec2<f32>(select(c_2.x, -(c_2.x), (_e151 < 0f)), select(c_2.y, -(c_2.y), (_e166 < 0f)));
    let _e177 = frame.layer;
    let _e180 = p;
    let _e184 = frame.extra.x;
    let _e186 = dm_streams((((uvCorner + vec2(0.5f)) + cell) / _e177.xy), _e180, bitcast<u32>(_e184));
    let _e189 = frame.layer;
    let _e192 = size;
    let plane = vec3<f32>(((c_2 + _e189.zw) * _e192), 0f);
    let _e199 = p.size_rotation.z;
    let _e204 = dm_rotate(plane, (vec3<f32>(_e186.rotationXY, -(_e199)) * 57.29578f));
    let _e205 = right;
    let _e206 = up;
    let normal = normalize(cross(_e205, _e206));
    let _e209 = center;
    let _e210 = right;
    let _e213 = up;
    let _e223 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.settings.w;
    world = (_e209 + ((((_e210 * _e204.x) + (_e213 * _e204.y)) + (normal * _e204.z)) * _e223));
    input.uv0_ = _e186.uv0_;
    input.custom1_ = _e186.uv1_;
    let _e234 = p.color;
    input.color = _e234;
    input.normal = normal;
    let _e237 = world;
    input.worldPosition = _e237;
    let _e241 = frame.eye;
    let _e243 = world;
    input.viewDirection = (_e241.xyz - _e243);
    let _e249 = frame.settings.x;
    input.time = _e249;
    input.delta = 0.008333334f;
    let _e252 = input;
    let _e253 = source_vertex(_e252);
    let _e255 = p.age;
    let _e256 = magic_placeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e253, _e255);
    let _e259 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    world = (_e256 + _e259.xyz);
    let _e266 = frame.vp;
    let _e267 = world;
    o.position = (_e266 * vec4<f32>(_e267, 1f));
    o.uv = _e186.uv0_;
    o.custom = _e186.uv1_;
    let _e277 = p.color;
    o.color = _e277;
    let _e279 = world;
    o.world = _e279;
    let _e283 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisX;
    let _e287 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisY;
    let _e291 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisZ;
    o.normal = normalize((mat3x3<f32>(_e283.xyz, _e287.xyz, _e291.xyz) * normal));
    let _e296 = o;
    return _e296;
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
    let _e41 = nature_scene_eye_depth(i.position.xy);
    input_1.sceneEyeDepth = _e41;
    input_1.frontFace = front;
    let _e44 = input_1;
    let _e45 = source_material(_e44);
    alpha = clamp(_e45.w, 0f, 1f);
    rgb = max(_e45.xyz, vec3(0f));
    let _e57 = rgb.x;
    let _e59 = rgb.y;
    let _e62 = rgb.z;
    let peak_1 = max(max(_e57, _e59), _e62);
    let eclipse = (mix(vec3<f32>(0.32f, 0.045f, 0.82f), vec3<f32>(0.88f, 0.78f, 1f), smoothstep(0.6f, 4f, peak_1)) * peak_1);
    let _e80 = frame.design.z;
    if (_e80 > 0.5f) {
        let _e83 = rgb;
        let _e87 = frame.design.y;
        let _e88 = enchantmentParticleColor(_e83, _e87);
        rgb = _e88;
    } else {
        let _e89 = rgb;
        let _e93 = frame.design.x;
        rgb = mix(_e89, eclipse, _e93);
    }
    let _e95 = alpha;
    let _e99 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint.w;
    alpha = (_e95 * _e99);
    let _e101 = rgb;
    let _e104 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint;
    let _e107 = alpha;
    let _e109 = alpha;
    return vec4<f32>(((_e101 * _e104.xyz) * _e107), _e109);
}
