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
    let z_1 = textureLoad(scene_depth, vec2<i32>(pixel), 0i);
    let ndc = vec2<f32>((((pixel.x / dims.x) * 2f) - 1f), (1f - ((pixel.y / dims.y) * 2f)));
    let _e25 = frame.invvp;
    let h = (_e25 * vec4<f32>(ndc, z_1, 1f));
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
        return 1f;
    }
    if (t < 0.156962f) {
        let u = ((t - 0f) / 0.156962f);
        return (((((((((2f * u) * u) * u) - ((3f * u) * u)) + 1f) * 1f) + (((((u * u) * u) - ((2f * u) * u)) + u) * -0.45365852f)) + (((((-2f * u) * u) * u) + ((3f * u) * u)) * 0.84390247f)) + ((((u * u) * u) - (u * u)) * -0.013747217f));
    }
    if (t < 1f) {
        let u_1 = ((t - 0.156962f) / 0.843038f);
        return (((((((((2f * u_1) * u_1) * u_1) - ((3f * u_1) * u_1)) + 1f) * 0.84390247f) + (((((u_1 * u_1) * u_1) - ((2f * u_1) * u_1)) + u_1) * -0.07383587f)) + (((((-2f * u_1) * u_1) * u_1) + ((3f * u_1) * u_1)) * 0.8390236f)) + ((((u_1 * u_1) * u_1) - (u_1 * u_1)) * -0.004878879f));
    }
    return 0.8390236f;
}

fn curve_1_(t_1: f32) -> f32 {
    if (t_1 <= 0f) {
        return 0.8292675f;
    }
    if (t_1 < 0.08105874f) {
        let u_2 = ((t_1 - 0f) / 0.08105874f);
        return (((((((((2f * u_2) * u_2) * u_2) - ((3f * u_2) * u_2)) + 1f) * 0.8292675f) + (((((u_2 * u_2) * u_2) - ((2f * u_2) * u_2)) + u_2) * 0.17073248f)) + (((((-2f * u_2) * u_2) * u_2) + ((3f * u_2) * u_2)) * 1f)) + ((((u_2 * u_2) * u_2) - (u_2 * u_2)) * 0.005496735f));
    }
    if (t_1 < 0.22496185f) {
        let u_3 = ((t_1 - 0.08105874f) / 0.1439031f);
        return (((((((((2f * u_3) * u_3) * u_3) - ((3f * u_3) * u_3)) + 1f) * 1f) + (((((u_3 * u_3) * u_3) - ((2f * u_3) * u_3)) + u_3) * 0.009758322f)) + (((((-2f * u_3) * u_3) * u_3) + ((3f * u_3) * u_3)) * 0.8372114f)) + ((((u_3 * u_3) * u_3) - (u_3 * u_3)) * -0.013498668f));
    }
    if (t_1 < 1f) {
        let u_4 = ((t_1 - 0.22496185f) / 0.7750381f);
        return (((((((((2f * u_4) * u_4) * u_4) - ((3f * u_4) * u_4)) + 1f) * 0.8372114f) + (((((u_4 * u_4) * u_4) - ((2f * u_4) * u_4)) + u_4) * -0.07270157f)) + (((((-2f * u_4) * u_4) * u_4) + ((3f * u_4) * u_4)) * 0.8243904f)) + ((((u_4 * u_4) * u_4) - (u_4 * u_4)) * -0.01282096f));
    }
    return 0.8243904f;
}

fn curve_2_(t_2: f32) -> f32 {
    if (t_2 <= 0f) {
        return 1f;
    }
    if (t_2 < 0.156962f) {
        let u_5 = ((t_2 - 0f) / 0.156962f);
        return (((((((((2f * u_5) * u_5) * u_5) - ((3f * u_5) * u_5)) + 1f) * 1f) + (((((u_5 * u_5) * u_5) - ((2f * u_5) * u_5)) + u_5) * -0.45365852f)) + (((((-2f * u_5) * u_5) * u_5) + ((3f * u_5) * u_5)) * 0.84390247f)) + ((((u_5 * u_5) * u_5) - (u_5 * u_5)) * -0.013747217f));
    }
    if (t_2 < 1f) {
        let u_6 = ((t_2 - 0.156962f) / 0.843038f);
        return (((((((((2f * u_6) * u_6) * u_6) - ((3f * u_6) * u_6)) + 1f) * 0.84390247f) + (((((u_6 * u_6) * u_6) - ((2f * u_6) * u_6)) + u_6) * -0.07383587f)) + (((((-2f * u_6) * u_6) * u_6) + ((3f * u_6) * u_6)) * 0.8390236f)) + ((((u_6 * u_6) * u_6) - (u_6 * u_6)) * -0.004878879f));
    }
    return 0.8390236f;
}

fn gradient_3_(t_3: f32) -> vec4<f32> {
    var rgb_2: vec3<f32> = vec3<f32>(1f, 1f, 1f);
    var alpha_1: f32 = 0f;

    if (t_3 <= 0f) {
        rgb_2 = vec3<f32>(1f, 1f, 1f);
    } else {
        if (t_3 <= 1f) {
            rgb_2 = mix(vec3<f32>(1f, 1f, 1f), vec3<f32>(1f, 1f, 1f), ((t_3 - 0f) / 1f));
        }
    }
    if (t_3 <= 0f) {
        alpha_1 = 0f;
    } else {
        if (t_3 <= 0.15294118f) {
            alpha_1 = mix(0f, 1f, ((t_3 - 0f) / 0.15294118f));
        } else {
            if (t_3 <= 0.5647059f) {
                alpha_1 = mix(1f, 1f, ((t_3 - 0.15294118f) / 0.4117647f));
            } else {
                if (t_3 <= 0.9735256f) {
                    alpha_1 = mix(1f, 0f, ((t_3 - 0.5647059f) / 0.4088197f));
                }
            }
        }
    }
    let _e57 = rgb_2;
    let _e58 = alpha_1;
    return vec4<f32>(_e57, _e58);
}

fn dm_appearance(seed: u32, id: u32, t_4: f32, particle: ptr<function, Particle>) {
    let _e4 = curve_0_(t_4);
    (*particle).size_rotation.x = max(0f, (11f * (_e4 * 1.2f)));
    let _e13 = curve_1_(t_4);
    (*particle).size_rotation.y = max(0f, (11f * (_e13 * 1.2f)));
    let _e22 = curve_2_(t_4);
    (*particle).size_rotation.w = max(0f, (11f * (_e22 * 1.2f)));
    let _e35 = gradient_3_(t_4);
    (*particle).color = (vec4<f32>(1f, 0.73876166f, 0.4575472f, 0.77254903f) * _e35);
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

fn dm_streams(uv: vec2<f32>, p_1: Particle, seed_2: u32) -> DmStreams {
    var o_1: DmStreams;

    let id_2 = p_1.id;
    let t_5 = clamp((p_1.age / p_1.lifetime), 0f, 1f);
    let _e10 = dm_random(seed_2, id_2, 162u);
    let custom1_ = vec4<f32>(0f, 0f, mix(0f, 0f, _e10), 0f);
    let custom2_ = vec4(0f);
    o_1.uv0_ = vec4<f32>(uv.x, uv.y, custom1_.x, custom1_.y);
    o_1.uv1_ = vec4<f32>(custom1_.z, custom1_.w, 0f, 0f);
    let _e36 = dm_random(seed_2, id_2, 201u);
    let _e41 = dm_random(seed_2, id_2, 202u);
    o_1.rotationXY = vec2<f32>(mix(0f, 0f, _e36), mix(3.1415925f, 0f, _e41));
    let _e46 = o_1;
    return _e46;
}

fn dm_rotate(v_2: vec3<f32>, deg: vec3<f32>) -> vec3<f32> {
    let a = (deg * 0.017453292f);
    let c = cos(a);
    let s = sin(a);
    let z_2 = vec3<f32>(((c.z * v_2.x) - (s.z * v_2.y)), ((s.z * v_2.x) + (c.z * v_2.y)), v_2.z);
    let x_1 = vec3<f32>(z_2.x, ((c.x * z_2.y) - (s.x * z_2.z)), ((s.x * z_2.y) + (c.x * z_2.z)));
    return vec3<f32>(((c.y * x_1.x) + (s.y * x_1.z)), x_1.y, ((-(s.y) * x_1.x) + (c.y * x_1.z)));
}

fn source_vertex(input_2: MaterialInput) -> vec3<f32> {
    let n1_ = input_2.worldPosition;
    let n2_ = input_2.custom1_;
    let n3_ = n2_.z;
    let n4_ = input_2.uv0_;
    let n5_ = vec4<f32>(0.2f, 0f, 0f, 0f);
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
    let n1_1 = vec4<f32>(1f, 1f, 1f, 0f);
    let n2_1 = input_3.uv0_;
    let n3_1 = vec4<f32>(0.2f, 0f, 0f, 0f);
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
    let n32_ = vec4<f32>(0f, 0f, 0f, 1f);
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
    let n45_ = (n43_ * vec4(2f));
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
    let n77_ = vec4<f32>(0f, 0f, 0f, 1f);
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
    let n109_ = vec4<f32>(0f, 0f, 0f, 1f);
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
    let n126_ = input_3.sceneEyeDepth;
    let n127_ = input_3.eyeDepth;
    let n128_ = (n126_ - n127_);
    let n130_ = max(0f, 0.1f);
    let n131_ = (n128_ / n130_);
    let n133_ = clamp(n131_, 0f, 1f);
    let n138_ = textureSample(texBX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texB_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n54_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).x, (1f - ((n54_ * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).y)));
    let n139_ = vec4<f32>(0f, 0f, 0f, 1f);
    let n140_ = (n138_ * n139_);
    let n141_ = n140_.x;
    let n142_ = n140_.y;
    let n143_ = (n141_ + n142_);
    let n144_ = n140_.z;
    let n145_ = n140_.w;
    let n146_ = (n144_ + n145_);
    let n147_ = (n143_ + n146_);
    let n148_ = clamp(n147_, 0f, 1f);
    let n149_ = vec4(n148_);
    let n150_ = (vec4(1f) * n149_);
    let n152_ = (vec4(n133_) * n150_);
    let n153_ = (n124_ * n152_);
    let n154_ = input_3.color;
    let n155_ = n154_.w;
    let n158_ = (n153_ * vec4(n155_));
    return vec4<f32>(n98_.xyz, n158_.x);
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
