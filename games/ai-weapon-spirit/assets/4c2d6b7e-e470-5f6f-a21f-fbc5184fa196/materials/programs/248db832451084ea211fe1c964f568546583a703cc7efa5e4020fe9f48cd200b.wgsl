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
    overlayColor: vec4<f32>,
    overlayShape: vec4<f32>,
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

struct ImpactDetail {
    a: vec4<f32>,
    b: vec4<f32>,
}

struct ImpactShape {
    a: vec4<f32>,
    b: vec4<f32>,
    c: vec4<f32>,
    d: vec4<f32>,
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
    custom2_: vec4<f32>,
    custom3_: vec4<f32>,
    color: vec4<f32>,
    normal: vec3<f32>,
    worldPosition: vec3<f32>,
    viewDirection: vec3<f32>,
    objectPosition: vec3<f32>,
    objectNormal: vec3<f32>,
    objectViewDirection: vec3<f32>,
    tangent: vec3<f32>,
    bitangent: vec3<f32>,
    screenUV: vec2<f32>,
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
    @location(6) custom2_: vec4<f32>,
    @location(7) custom3_: vec4<f32>,
    @location(8) tangent: vec3<f32>,
    @location(9) object: vec3<f32>,
    @location(10) objectNormal: vec3<f32>,
}

struct DmStreams {
    uv0_: vec4<f32>,
    uv1_: vec4<f32>,
    uv2_: vec4<f32>,
    uv3_: vec4<f32>,
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
    let h_1 = (_e25 * vec4<f32>(ndc, z_2, 1f));
    let _e35 = frame.eye;
    let _e40 = frame.forward;
    return dot(((h_1.xyz / vec3(h_1.w)) - _e35.xyz), _e40.xyz);
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

fn detailHue(rgb_2: vec3<f32>, turn: f32) -> vec3<f32> {
    var h: f32 = 0f;

    if (abs(turn) < 0.000001f) {
        return rgb_2;
    }
    let bounded = (rgb_2 / (vec3(1f) + rgb_2));
    let hi = max(bounded.x, max(bounded.y, bounded.z));
    let lo = min(bounded.x, min(bounded.y, bounded.z));
    let chroma = (hi - lo);
    if (chroma < 0.00001f) {
        return rgb_2;
    }
    if (hi == bounded.x) {
        h = ((bounded.y - bounded.z) / chroma);
    } else {
        if (hi == bounded.y) {
            h = (((bounded.z - bounded.x) / chroma) + 2f);
        } else {
            h = (((bounded.x - bounded.y) / chroma) + 4f);
        }
    }
    let _e44 = h;
    h = fract(((_e44 / 6f) + turn));
    let _e49 = h;
    let ramp = clamp((abs(((fract((vec3(_e49) + vec3<f32>(0f, 0.6666667f, 0.33333334f))) * 6f) - vec3(3f))) - vec3(1f)), vec3(0f), vec3(1f));
    let shifted = (vec3(lo) + (ramp * chroma));
    return (shifted / max(vec3(0.00001f), (vec3(1f) - shifted)));
}

fn shapeCorner(vertex_1: u32) -> vec2<f32> {
    let corners = array<vec2<f32>, 6>(vec2<f32>(0f, 0f), vec2<f32>(1f, 0f), vec2<f32>(1f, 1f), vec2<f32>(0f, 0f), vec2<f32>(1f, 1f), vec2<f32>(0f, 1f));
    let corner = corners[(vertex_1 % 6u)];
    let cell = (vertex_1 / 6u);
    return (((vec2<f32>(f32((cell % 12u)), f32((cell / 12u))) + corner) / vec2(12f)) - vec2(0.5f));
}

fn shapePlane(local_1: vec3<f32>, id: u32, depth: f32) -> vec3<f32> {
    let tilt = (((f32((id % 3u)) - 1f) * 0.55f) + 0.35f);
    let x_2 = vec3<f32>(0.96f, 0.18f, 0.12f);
    let y_2 = vec3<f32>(-0.18f, cos(tilt), sin(tilt));
    return (((x_2 * local_1.x) + (y_2 * local_1.y)) + ((normalize(cross(x_2, y_2)) * local_1.z) * depth));
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

fn dm_random(seed: u32, id_1: u32, key: u32) -> f32 {
    let _e13 = dm_hash(((seed ^ ((id_1 + 1u) * 747796405u)) ^ ((key + 1u) * 2891336453u)));
    return (f32(_e13) / 4294967300f);
}

fn boltPoint(k: u32, id_2: u32, seed_1: u32) -> vec2<f32> {
    let knots = array<f32, 7>(0f, 0.11f, 0.29f, 0.43f, 0.69f, 0.79f, 1f);
    let radii = array<f32, 7>(0.58f, 0.88f, 0.49f, 0.83f, 0.53f, 0.91f, 0.62f);
    let _e25 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.shapeA.y;
    let angle_1 = (((knots[k] - 0.5f) * 1.9f) * _e25);
    let _e32 = dm_random(seed_1, id_2, (340u + k));
    let radius = (radii[k] + ((_e32 - 0.5f) * 0.12f));
    return vec2<f32>((cos(angle_1) * radius), (sin(angle_1) * radius));
}

fn curve_0_(t: f32) -> f32 {
    if (t <= 0f) {
        return 0.177124f;
    }
    if (t < 0.1156856f) {
        let u = ((t - 0f) / 0.1156856f);
        return (((((((((2f * u) * u) * u) - ((3f * u) * u)) + 1f) * 0.177124f) + (((((u * u) * u) - ((2f * u) * u)) + u) * 0.81279695f)) + (((((-2f * u) * u) * u) + ((3f * u) * u)) * 0.6345692f)) + ((((u * u) * u) - (u * u)) * 0.107129745f));
    }
    if (t < 1f) {
        let u_1 = ((t - 0.1156856f) / 0.8843144f);
        return (((((((((2f * u_1) * u_1) * u_1) - ((3f * u_1) * u_1)) + 1f) * 0.6345692f) + (((((u_1 * u_1) * u_1) - ((2f * u_1) * u_1)) + u_1) * 0.81891245f)) + (((((-2f * u_1) * u_1) * u_1) + ((3f * u_1) * u_1)) * 1f)) + ((((u_1 * u_1) * u_1) - (u_1 * u_1)) * 0.12288893f));
    }
    return 1f;
}

fn curve_1_(t_1: f32) -> f32 {
    if (t_1 <= 0f) {
        return 0.177124f;
    }
    if (t_1 < 0.1156856f) {
        let u_2 = ((t_1 - 0f) / 0.1156856f);
        return (((((((((2f * u_2) * u_2) * u_2) - ((3f * u_2) * u_2)) + 1f) * 0.177124f) + (((((u_2 * u_2) * u_2) - ((2f * u_2) * u_2)) + u_2) * 0.81279695f)) + (((((-2f * u_2) * u_2) * u_2) + ((3f * u_2) * u_2)) * 0.6345692f)) + ((((u_2 * u_2) * u_2) - (u_2 * u_2)) * 0.107129745f));
    }
    if (t_1 < 1f) {
        let u_3 = ((t_1 - 0.1156856f) / 0.8843144f);
        return (((((((((2f * u_3) * u_3) * u_3) - ((3f * u_3) * u_3)) + 1f) * 0.6345692f) + (((((u_3 * u_3) * u_3) - ((2f * u_3) * u_3)) + u_3) * 0.81891245f)) + (((((-2f * u_3) * u_3) * u_3) + ((3f * u_3) * u_3)) * 1f)) + ((((u_3 * u_3) * u_3) - (u_3 * u_3)) * 0.12288893f));
    }
    return 1f;
}

fn curve_2_(t_2: f32) -> f32 {
    if (t_2 <= 0f) {
        return 0.177124f;
    }
    if (t_2 < 0.1156856f) {
        let u_4 = ((t_2 - 0f) / 0.1156856f);
        return (((((((((2f * u_4) * u_4) * u_4) - ((3f * u_4) * u_4)) + 1f) * 0.177124f) + (((((u_4 * u_4) * u_4) - ((2f * u_4) * u_4)) + u_4) * 0.81279695f)) + (((((-2f * u_4) * u_4) * u_4) + ((3f * u_4) * u_4)) * 0.6345692f)) + ((((u_4 * u_4) * u_4) - (u_4 * u_4)) * 0.107129745f));
    }
    if (t_2 < 1f) {
        let u_5 = ((t_2 - 0.1156856f) / 0.8843144f);
        return (((((((((2f * u_5) * u_5) * u_5) - ((3f * u_5) * u_5)) + 1f) * 0.6345692f) + (((((u_5 * u_5) * u_5) - ((2f * u_5) * u_5)) + u_5) * 0.81891245f)) + (((((-2f * u_5) * u_5) * u_5) + ((3f * u_5) * u_5)) * 1f)) + ((((u_5 * u_5) * u_5) - (u_5 * u_5)) * 0.12288893f));
    }
    return 1f;
}

fn gradient_3_(t_3: f32) -> vec4<f32> {
    var rgb_3: vec3<f32> = vec3<f32>(0.4433962f, 0.008424807f, 0f);
    var alpha_1: f32 = 1f;

    if (t_3 <= 0f) {
        rgb_3 = vec3<f32>(0.18867922f, 0.00978996f, 0.00978996f);
    } else {
        if (t_3 <= 0.29117265f) {
            rgb_3 = mix(vec3<f32>(0.18867922f, 0.00978996f, 0.00978996f), vec3<f32>(0.3773585f, 0f, 0.011199376f), ((t_3 - 0f) / 0.29117265f));
        } else {
            if (t_3 <= 0.52059203f) {
                rgb_3 = mix(vec3<f32>(0.3773585f, 0f, 0.011199376f), vec3<f32>(0.7924528f, 0.08505074f, 0.03364185f), ((t_3 - 0.29117265f) / 0.2294194f));
            } else {
                if (t_3 <= 0.9529412f) {
                    rgb_3 = mix(vec3<f32>(0.7924528f, 0.08505074f, 0.03364185f), vec3<f32>(0.4433962f, 0.008424807f, 0f), ((t_3 - 0.52059203f) / 0.43234912f));
                }
            }
        }
    }
    if (t_3 <= 0f) {
        alpha_1 = 1f;
    } else {
        if (t_3 <= 1f) {
            alpha_1 = mix(1f, 1f, ((t_3 - 0f) / 1f));
        }
    }
    let _e71 = rgb_3;
    let _e72 = alpha_1;
    return vec4<f32>(_e71, _e72);
}

fn gradient_4_(t_4: f32) -> vec4<f32> {
    var rgb_4: vec3<f32> = vec3<f32>(1f, 1f, 1f);
    var alpha_2: f32 = 0f;

    if (t_4 <= 0f) {
        rgb_4 = vec3<f32>(1f, 1f, 1f);
    } else {
        if (t_4 <= 1f) {
            rgb_4 = mix(vec3<f32>(1f, 1f, 1f), vec3<f32>(1f, 1f, 1f), ((t_4 - 0f) / 1f));
        }
    }
    if (t_4 <= 0f) {
        alpha_2 = 1f;
    } else {
        if (t_4 <= 1f) {
            alpha_2 = mix(1f, 0f, ((t_4 - 0f) / 1f));
        }
    }
    let _e39 = rgb_4;
    let _e40 = alpha_2;
    return vec4<f32>(_e39, _e40);
}

fn dm_appearance(seed_2: u32, id_3: u32, t_5: f32, particle: ptr<function, Particle>) {
    let _e6 = dm_random(seed_2, id_3, 3u);
    let _e13 = curve_0_(t_5);
    (*particle).size_rotation.x = max(0f, ((mix(1f, 2.5f, _e6) * 1f) * (_e13 * 1f)));
    let _e22 = dm_random(seed_2, id_3, 3u);
    let _e28 = curve_1_(t_5);
    (*particle).size_rotation.y = max(0f, ((mix(1f, 2.5f, _e22) * 1f) * (_e28 * 1f)));
    let _e37 = dm_random(seed_2, id_3, 3u);
    let _e43 = curve_2_(t_5);
    (*particle).size_rotation.w = max(0f, ((mix(1f, 2.5f, _e37) * 1f) * (_e43 * 1f)));
    let _e51 = dm_random(seed_2, id_3, 5u);
    let _e52 = gradient_3_(_e51);
    let _e53 = gradient_4_(t_5);
    (*particle).color = (_e52 * _e53);
    let _e58 = dm_random(seed_2, id_3, 26u);
    (*particle).velocity.w = floor((fract((0f + (mix(0f, 0.75f, _e58) * 1f))) * 4f));
    return;
}

fn stream_dm_hash(value_1: u32) -> u32 {
    var v_2: u32;

    v_2 = value_1;
    let _e2 = v_2;
    let _e3 = v_2;
    v_2 = ((_e2 ^ (_e3 >> 16u)) * 2246822519u);
    let _e9 = v_2;
    let _e10 = v_2;
    v_2 = ((_e9 ^ (_e10 >> 13u)) * 3266489917u);
    let _e16 = v_2;
    let _e17 = v_2;
    return (_e16 ^ (_e17 >> 16u));
}

fn stream_dm_random(seed_3: u32, id_4: u32, key_1: u32) -> f32 {
    let _e13 = stream_dm_hash(((seed_3 ^ ((id_4 + 1u) * 747796405u)) ^ ((key_1 + 1u) * 2891336453u)));
    return (f32(_e13) / 4294967300f);
}

fn dm_streams(uv: vec2<f32>, p_1: Particle, seed_4: u32) -> DmStreams {
    var o_1: DmStreams;

    let id_5 = p_1.id;
    let t_6 = clamp((p_1.age / p_1.lifetime), 0f, 1f);
    let _e10 = stream_dm_random(seed_4, id_5, 160u);
    let custom1_ = vec4<f32>(mix(1f, 4f, _e10), 0f, 0f, 0f);
    let custom2_ = vec4(0f);
    o_1.uv0_ = vec4<f32>(uv.x, uv.y, custom1_.x, custom1_.y);
    o_1.uv1_ = vec4<f32>(custom1_.z, custom1_.w, 0f, 0f);
    o_1.uv2_ = vec4<f32>(0f, 0f, 0f, 0f);
    o_1.uv3_ = vec4<f32>(0f, 0f, 0f, 0f);
    o_1.rotationXY = vec2(0f);
    let _e49 = o_1;
    return _e49;
}

fn dm_rotate(v_3: vec3<f32>, deg: vec3<f32>) -> vec3<f32> {
    let a = (deg * 0.017453292f);
    let c = cos(a);
    let s = sin(a);
    let z_3 = vec3<f32>(((c.z * v_3.x) - (s.z * v_3.y)), ((s.z * v_3.x) + (c.z * v_3.y)), v_3.z);
    let x_3 = vec3<f32>(z_3.x, ((c.x * z_3.y) - (s.x * z_3.z)), ((s.x * z_3.y) + (c.x * z_3.z)));
    return vec3<f32>(((c.y * x_3.x) + (s.y * x_3.z)), x_3.y, ((-(s.y) * x_3.x) + (c.y * x_3.z)));
}

fn source_vertex(input_2: MaterialInput) -> vec3<f32> {
    let n1_ = input_2.objectPosition;
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
    let n29_ = input_2.objectNormal;
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
    let n28_1 = vec4<f32>(1f, 0f, 0f, 0f);
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
    let n54_ = vec4<f32>(1f, 1f, 1f, 0f);
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
    let n69_ = (1f - 0f);
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
    let n104_ = vec4<f32>(0f, 0f, 0f, 1f);
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

fn dm_safe(v_4: vec3<f32>) -> vec3<f32> {
    return (v_4 / vec3(max(length(v_4), 0.000001f)));
}

fn dm_orbit(r: vec3<f32>, w: vec3<f32>, dt: f32) -> vec3<f32> {
    var local_2: bool;

    let speed = length(w);
    if !((speed < 0.000001f)) {
        local_2 = (dt <= 0f);
    } else {
        local_2 = true;
    }
    let _e11 = local_2;
    if _e11 {
        return vec3(0f);
    }
    let axis = (w / vec3(speed));
    let angle_2 = (speed * dt);
    let c_1 = cos(angle_2);
    let rotated = (((r * c_1) + (cross(axis, r) * sin(angle_2))) + ((axis * dot(axis, r)) * (1f - c_1)));
    return ((rotated - r) / vec3(dt));
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

fn stream_dm_rotate(v_5: vec3<f32>, deg_1: vec3<f32>) -> vec3<f32> {
    let a_1 = (deg_1 * 0.017453292f);
    let c_2 = cos(a_1);
    let s_1 = sin(a_1);
    let z_4 = vec3<f32>(((c_2.z * v_5.x) - (s_1.z * v_5.y)), ((s_1.z * v_5.x) + (c_2.z * v_5.y)), v_5.z);
    let x_4 = vec3<f32>(z_4.x, ((c_2.x * z_4.y) - (s_1.x * z_4.z)), ((s_1.x * z_4.y) + (c_2.x * z_4.z)));
    return vec3<f32>(((c_2.y * x_4.x) + (s_1.y * x_4.z)), x_4.y, ((-(s_1.y) * x_4.x) + (c_2.y * x_4.z)));
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
    let w_2 = (((q_1 * q_1) * q_1) * ((q_1 * ((q_1 * 6f) - vec3(15f))) + vec3(10f)));
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
                    yvals_1[_e88] = mix(_e91, _e93, w_2.x);
                }
                continuing {
                    let _e97 = y_1;
                    y_1 = (_e97 + 1i);
                }
            }
            let _e100 = z_1;
            let _e103 = yvals_1[0];
            let _e105 = yvals_1[1];
            zvals_1[_e100] = mix(_e103, _e105, w_2.y);
        }
        continuing {
            let _e109 = z_1;
            z_1 = (_e109 + 1i);
        }
    }
    let _e112 = zvals_1[0];
    let _e114 = zvals_1[1];
    return (mix(_e112, _e114, w_2.z) * 1.7f);
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
    let corners_1 = array<vec2<f32>, 6>(vec2<f32>(-0.5f, -0.5f), vec2<f32>(0.5f, -0.5f), vec2<f32>(0.5f, 0.5f), vec2<f32>(-0.5f, -0.5f), vec2<f32>(0.5f, 0.5f), vec2<f32>(-0.5f, 0.5f));
    let _e79 = shapeCorner(vertex);
    let _e81 = p.position;
    let _e85 = frame.motion;
    let _e90 = frame.settings.x;
    center = (_e81.xyz + (_e85.xyz * _e90));
    let _e95 = p.size_rotation;
    size = _e95.xy;
    let _e100 = frame.right;
    let _e102 = magic_local_axisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e100.xyz);
    right = _e102;
    let _e106 = frame.up;
    let _e108 = magic_local_axisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e106.xyz);
    up = _e108;
    let _e113 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.detailA.y;
    if (_e113 > 0f) {
        let _e117 = size.x;
        let _e121 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.detailA.w;
        let _e125 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.detailA.y;
        size.x = (_e117 * mix(1f, _e121, _e125));
    }
    let _e132 = frame.layer.x;
    let columns = u32(_e132);
    let _e137 = frame.layer.y;
    let rows = u32(_e137);
    let _e141 = p.velocity.w;
    let tile = min(u32(max(_e141, 0f)), ((columns * rows) - 1u));
    let cell_1 = vec2<f32>(f32((tile % columns)), f32(((rows - 1u) - (tile / columns))));
    let _e163 = frame.extra.x;
    let _e166 = p.id;
    let _e168 = dm_random(bitcast<u32>(_e163), _e166, 210u);
    let _e178 = frame.extra.x;
    let _e181 = p.id;
    let _e183 = dm_random(bitcast<u32>(_e178), _e181, 211u);
    let uvCorner = vec2<f32>(select(_e79.x, -(_e79.x), (_e168 < 0f)), select(_e79.y, -(_e79.y), (_e183 < 0f)));
    let _e194 = frame.layer;
    let _e197 = p;
    let _e201 = frame.extra.x;
    let _e203 = dm_streams((((uvCorner + vec2(0.5f)) + cell_1) / _e194.xy), _e197, bitcast<u32>(_e201));
    let _e206 = frame.layer;
    let _e209 = size;
    let plane = vec3<f32>(((_e79 + _e206.zw) * _e209), 0f);
    let _e217 = p.size_rotation.z;
    let _e222 = dm_rotate(plane, (vec3<f32>(-(_e203.rotationXY), -(_e217)) * 57.29578f));
    let _e223 = right;
    let _e224 = up;
    let normal = normalize(cross(_e223, _e224));
    let _e227 = center;
    let _e228 = right;
    let _e231 = up;
    let _e241 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.settings.w;
    world = (_e227 + ((((_e228 * _e222.x) + (_e231 * _e222.y)) + (normal * _e222.z)) * _e241));
    let _e248 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.shapeA.x;
    if (_e248 > 0f) {
        let q_2 = (_e79.y + 0.5f);
        let _e255 = p.age;
        let _e257 = p.lifetime;
        let age_1 = clamp((_e255 / _e257), 0f, 1f);
        let _e265 = frame.extra.x;
        let seed_5 = bitcast<u32>(_e265);
        let _e268 = p.id;
        let _e270 = dm_random(seed_5, _e268, 303u);
        let lengthGain = mix(0.72f, 1.05f, _e270);
        let _e277 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.shapeB.x;
        let width = (_e277 * (0.45f + (0.85f * sin((q_2 * 3.1415927f)))));
        let _e288 = size.y;
        let _e295 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.shapeA.w;
        let bend = ((((q_2 * q_2) * _e288) * 0.55f) * _e295);
        let _e299 = size.x;
        let _e306 = size.y;
        let _e313 = size.y;
        let _e318 = p.id;
        let blade = vec3<f32>((((_e79.x * _e299) * width) + bend), (((q_2 + 0.06f) * _e306) * lengthGain), (((sin((q_2 * 3.1415927f)) * _e313) * 0.36f) + (((f32((_e318 % 3u)) - 1f) * q_2) * 0.22f)));
        let _e331 = p.size_rotation.z;
        let angle_3 = (-(_e331) + ((age_1 - 0.25f) * 0.35f));
        let turned = vec3<f32>(((cos(angle_3) * blade.x) - (sin(angle_3) * blade.y)), ((sin(angle_3) * blade.x) + (cos(angle_3) * blade.y)), blade.z);
        let _e355 = p.id;
        let _e359 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.shapeA.z;
        let _e360 = shapePlane(turned, _e355, _e359);
        let _e361 = right;
        let _e364 = up;
        let facing = ((_e361 * turned.x) + (_e364 * turned.y));
        let _e368 = world;
        let _e369 = center;
        let _e373 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.shapeA.z;
        let _e380 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.settings.w;
        let _e386 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.shapeA.x;
        world = mix(_e368, (_e369 + (mix(facing, _e360, min(1f, _e373)) * _e380)), _e386);
    }
    let _e388 = right;
    let _e389 = right;
    let tangent = normalize((_e388 - (normal * dot(_e389, normal))));
    let objectNormal = vec3<f32>(0f, 0f, 1f);
    let _e400 = frame.eye;
    let _e404 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    let _e407 = magic_local_axisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX((_e400.xyz - _e404.xyz));
    let _e408 = world;
    let viewDir = (_e407 - _e408);
    let _e410 = right;
    let _e412 = up;
    let objectView = vec3<f32>(dot(viewDir, _e410), dot(viewDir, _e412), dot(viewDir, normal));
    input.uv0_ = _e203.uv0_;
    input.custom1_ = _e203.uv1_;
    input.custom2_ = _e203.uv2_;
    input.custom3_ = _e203.uv3_;
    let _e427 = p.color;
    input.color = _e427;
    input.normal = normal;
    let _e430 = world;
    input.worldPosition = _e430;
    input.viewDirection = viewDir;
    input.objectPosition = _e222;
    input.objectNormal = objectNormal;
    input.objectViewDirection = objectView;
    input.tangent = tangent;
    input.bitangent = cross(normal, tangent);
    let _e442 = frame.settings.x;
    input.time = _e442;
    input.delta = 0.008333334f;
    let _e445 = world;
    let _e446 = input;
    let _e447 = source_vertex(_e446);
    let _e449 = input.objectPosition;
    let _e453 = p.age;
    let _e454 = magic_placeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX((_e445 + (_e447 - _e449)), _e453);
    let _e457 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    world = (_e454 + _e457.xyz);
    let _e464 = frame.vp;
    let _e465 = world;
    o.position = (_e464 * vec4<f32>(_e465, 1f));
    o.uv = _e203.uv0_;
    o.custom = _e203.uv1_;
    o.custom2_ = _e203.uv2_;
    o.custom3_ = _e203.uv3_;
    let _e479 = p.color;
    o.color = _e479;
    let _e481 = world;
    o.world = _e481;
    let _e485 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisX;
    let _e489 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisY;
    let _e493 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisZ;
    o.normal = normalize((mat3x3<f32>(_e485.xyz, _e489.xyz, _e493.xyz) * normal));
    let _e501 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisX;
    let _e505 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisY;
    let _e509 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisZ;
    o.tangent = normalize((mat3x3<f32>(_e501.xyz, _e505.xyz, _e509.xyz) * tangent));
    o.object = _e222;
    o.objectNormal = objectNormal;
    let _e516 = o;
    return _e516;
}

@fragment 
fn fs_main(i: Varying, @builtin(front_facing) front: bool) -> @location(0) vec4<f32> {
    var input_1: MaterialInput;
    var alpha: f32;
    var rgb: vec3<f32>;

    magic_frame();
    input_1.uv0_ = i.uv;
    input_1.custom1_ = i.custom;
    input_1.custom2_ = i.custom2_;
    input_1.custom3_ = i.custom3_;
    input_1.color = i.color;
    input_1.normal = i.normal;
    input_1.worldPosition = i.world;
    let _e19 = frame.eye;
    input_1.viewDirection = (_e19.xyz - i.world);
    input_1.objectPosition = i.object;
    input_1.objectNormal = i.objectNormal;
    let _e29 = input_1.viewDirection;
    let _e33 = input_1.viewDirection;
    let _e39 = input_1.viewDirection;
    input_1.objectViewDirection = vec3<f32>(dot(_e29, i.tangent), dot(_e33, cross(i.normal, i.tangent)), dot(_e39, i.normal));
    input_1.tangent = i.tangent;
    input_1.bitangent = cross(i.normal, i.tangent);
    let _e53 = textureDimensions(scene_depth);
    input_1.screenUV = (i.position.xy / vec2<f32>(_e53));
    let _e60 = frame.settings.x;
    input_1.time = _e60;
    input_1.delta = 0.008333334f;
    let _e67 = frame.eye;
    let _e72 = frame.forward;
    input_1.eyeDepth = dot((i.world - _e67.xyz), _e72.xyz);
    let _e78 = nature_scene_eye_depth(i.position.xy);
    input_1.sceneEyeDepth = _e78;
    input_1.frontFace = front;
    let _e81 = input_1;
    let _e82 = source_material(_e81);
    alpha = clamp(_e82.w, 0f, 1f);
    rgb = _e82.xyz;
    let _e93 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.detailA.y;
    if (_e93 > 0f) {
        let _e96 = rgb;
        let _e100 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.detailA.x;
        let _e104 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.detailA.y;
        let _e106 = detailHue(_e96, (_e100 * _e104));
        rgb = _e106;
    }
    let _e108 = rgb.x;
    let _e110 = rgb.y;
    let _e113 = rgb.z;
    let peak_1 = max(max(_e108, _e110), _e113);
    let eclipse = (mix(vec3<f32>(0.32f, 0.045f, 0.82f), vec3<f32>(0.88f, 0.78f, 1f), smoothstep(0.6f, 4f, peak_1)) * peak_1);
    let _e131 = frame.design.z;
    if (_e131 > 0.5f) {
        let _e134 = rgb;
        let _e138 = frame.design.y;
        let _e139 = enchantmentParticleColor(_e134, _e138);
        rgb = _e139;
    } else {
        let _e140 = rgb;
        let _e144 = frame.design.x;
        rgb = mix(_e140, eclipse, _e144);
    }
    let _e146 = alpha;
    let _e150 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint.w;
    alpha = (_e146 * _e150);
    let _e152 = rgb;
    let _e155 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint;
    let _e158 = alpha;
    let _e160 = alpha;
    return vec4<f32>(((_e152 * _e155.xyz) * _e158), _e160);
}
