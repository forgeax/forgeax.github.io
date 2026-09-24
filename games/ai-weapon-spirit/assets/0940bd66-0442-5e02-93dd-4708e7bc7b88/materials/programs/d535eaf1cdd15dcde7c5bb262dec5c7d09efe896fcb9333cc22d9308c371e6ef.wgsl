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
        return 0.2909091f;
    }
    if (t < 0.2312082f) {
        let u = ((t - 0f) / 0.2312082f);
        return (((((((((2f * u) * u) * u) - ((3f * u) * u)) + 1f) * 0.2909091f) + (((((u * u) * u) - ((2f * u) * u)) + u) * 0.039675258f)) + (((((-2f * u) * u) * u) + ((3f * u) * u)) * 0.560774f)) + ((((u * u) * u) - (u * u)) * 0.44127032f));
    }
    if (t < 0.5119274f) {
        let u_1 = ((t - 0.2312082f) / 0.2807192f);
        return (((((((((2f * u_1) * u_1) * u_1) - ((3f * u_1) * u_1)) + 1f) * 0.560774f) + (((((u_1 * u_1) * u_1) - ((2f * u_1) * u_1)) + u_1) * 0.5357641f)) + (((((-2f * u_1) * u_1) * u_1) + ((3f * u_1) * u_1)) * 0.8984327f)) + ((((u_1 * u_1) * u_1) - (u_1 * u_1)) * 0.20428309f));
    }
    if (t < 1f) {
        let u_2 = ((t - 0.5119274f) / 0.4880726f);
        return (((((((((2f * u_2) * u_2) * u_2) - ((3f * u_2) * u_2)) + 1f) * 0.8984327f) + (((((u_2 * u_2) * u_2) - ((2f * u_2) * u_2)) + u_2) * 0.35517693f)) + (((((-2f * u_2) * u_2) * u_2) + ((3f * u_2) * u_2)) * 1f)) + ((((u_2 * u_2) * u_2) - (u_2 * u_2)) * -0.1252647f));
    }
    return 1f;
}

fn curve_1_(t_1: f32) -> f32 {
    if (t_1 <= 0f) {
        return 0.2363574f;
    }
    if (t_1 < 0.292153f) {
        let u_3 = ((t_1 - 0f) / 0.292153f);
        return (((((((((2f * u_3) * u_3) * u_3) - ((3f * u_3) * u_3)) + 1f) * 0.2363574f) + (((((u_3 * u_3) * u_3) - ((2f * u_3) * u_3)) + u_3) * 0f)) + (((((-2f * u_3) * u_3) * u_3) + ((3f * u_3) * u_3)) * 0.4541693f)) + ((((u_3 * u_3) * u_3) - (u_3 * u_3)) * 0.5332937f));
    }
    if (t_1 < 0.5347131f) {
        let u_4 = ((t_1 - 0.292153f) / 0.2425601f);
        return (((((((((2f * u_4) * u_4) * u_4) - ((3f * u_4) * u_4)) + 1f) * 0.4541693f) + (((((u_4 * u_4) * u_4) - ((2f * u_4) * u_4)) + u_4) * 0.44276726f)) + (((((-2f * u_4) * u_4) * u_4) + ((3f * u_4) * u_4)) * 0.8727217f)) + ((((u_4 * u_4) * u_4) - (u_4 * u_4)) * 0.17062752f));
    }
    if (t_1 < 1f) {
        let u_5 = ((t_1 - 0.5347131f) / 0.4652869f);
        return (((((((((2f * u_5) * u_5) * u_5) - ((3f * u_5) * u_5)) + 1f) * 0.8727217f) + (((((u_5 * u_5) * u_5) - ((2f * u_5) * u_5)) + u_5) * 0.3273034f)) + (((((-2f * u_5) * u_5) * u_5) + ((3f * u_5) * u_5)) * 1f)) + ((((u_5 * u_5) * u_5) - (u_5 * u_5)) * 0.0823985f));
    }
    return 1f;
}

fn curve_2_(t_2: f32) -> f32 {
    if (t_2 <= 0f) {
        return 0.2909091f;
    }
    if (t_2 < 0.2312082f) {
        let u_6 = ((t_2 - 0f) / 0.2312082f);
        return (((((((((2f * u_6) * u_6) * u_6) - ((3f * u_6) * u_6)) + 1f) * 0.2909091f) + (((((u_6 * u_6) * u_6) - ((2f * u_6) * u_6)) + u_6) * 0.039675258f)) + (((((-2f * u_6) * u_6) * u_6) + ((3f * u_6) * u_6)) * 0.560774f)) + ((((u_6 * u_6) * u_6) - (u_6 * u_6)) * 0.44127032f));
    }
    if (t_2 < 0.5119274f) {
        let u_7 = ((t_2 - 0.2312082f) / 0.2807192f);
        return (((((((((2f * u_7) * u_7) * u_7) - ((3f * u_7) * u_7)) + 1f) * 0.560774f) + (((((u_7 * u_7) * u_7) - ((2f * u_7) * u_7)) + u_7) * 0.5357641f)) + (((((-2f * u_7) * u_7) * u_7) + ((3f * u_7) * u_7)) * 0.8984327f)) + ((((u_7 * u_7) * u_7) - (u_7 * u_7)) * 0.20428309f));
    }
    if (t_2 < 1f) {
        let u_8 = ((t_2 - 0.5119274f) / 0.4880726f);
        return (((((((((2f * u_8) * u_8) * u_8) - ((3f * u_8) * u_8)) + 1f) * 0.8984327f) + (((((u_8 * u_8) * u_8) - ((2f * u_8) * u_8)) + u_8) * 0.35517693f)) + (((((-2f * u_8) * u_8) * u_8) + ((3f * u_8) * u_8)) * 1f)) + ((((u_8 * u_8) * u_8) - (u_8 * u_8)) * -0.1252647f));
    }
    return 1f;
}

fn curve_3_(t_3: f32) -> f32 {
    if (t_3 <= 0f) {
        return 0.2363574f;
    }
    if (t_3 < 0.292153f) {
        let u_9 = ((t_3 - 0f) / 0.292153f);
        return (((((((((2f * u_9) * u_9) * u_9) - ((3f * u_9) * u_9)) + 1f) * 0.2363574f) + (((((u_9 * u_9) * u_9) - ((2f * u_9) * u_9)) + u_9) * 0f)) + (((((-2f * u_9) * u_9) * u_9) + ((3f * u_9) * u_9)) * 0.4541693f)) + ((((u_9 * u_9) * u_9) - (u_9 * u_9)) * 0.5332937f));
    }
    if (t_3 < 0.5347131f) {
        let u_10 = ((t_3 - 0.292153f) / 0.2425601f);
        return (((((((((2f * u_10) * u_10) * u_10) - ((3f * u_10) * u_10)) + 1f) * 0.4541693f) + (((((u_10 * u_10) * u_10) - ((2f * u_10) * u_10)) + u_10) * 0.44276726f)) + (((((-2f * u_10) * u_10) * u_10) + ((3f * u_10) * u_10)) * 0.8727217f)) + ((((u_10 * u_10) * u_10) - (u_10 * u_10)) * 0.17062752f));
    }
    if (t_3 < 1f) {
        let u_11 = ((t_3 - 0.5347131f) / 0.4652869f);
        return (((((((((2f * u_11) * u_11) * u_11) - ((3f * u_11) * u_11)) + 1f) * 0.8727217f) + (((((u_11 * u_11) * u_11) - ((2f * u_11) * u_11)) + u_11) * 0.3273034f)) + (((((-2f * u_11) * u_11) * u_11) + ((3f * u_11) * u_11)) * 1f)) + ((((u_11 * u_11) * u_11) - (u_11 * u_11)) * 0.0823985f));
    }
    return 1f;
}

fn curve_4_(t_4: f32) -> f32 {
    if (t_4 <= 0f) {
        return 0.2909091f;
    }
    if (t_4 < 0.2312082f) {
        let u_12 = ((t_4 - 0f) / 0.2312082f);
        return (((((((((2f * u_12) * u_12) * u_12) - ((3f * u_12) * u_12)) + 1f) * 0.2909091f) + (((((u_12 * u_12) * u_12) - ((2f * u_12) * u_12)) + u_12) * 0.039675258f)) + (((((-2f * u_12) * u_12) * u_12) + ((3f * u_12) * u_12)) * 0.560774f)) + ((((u_12 * u_12) * u_12) - (u_12 * u_12)) * 0.44127032f));
    }
    if (t_4 < 0.5119274f) {
        let u_13 = ((t_4 - 0.2312082f) / 0.2807192f);
        return (((((((((2f * u_13) * u_13) * u_13) - ((3f * u_13) * u_13)) + 1f) * 0.560774f) + (((((u_13 * u_13) * u_13) - ((2f * u_13) * u_13)) + u_13) * 0.5357641f)) + (((((-2f * u_13) * u_13) * u_13) + ((3f * u_13) * u_13)) * 0.8984327f)) + ((((u_13 * u_13) * u_13) - (u_13 * u_13)) * 0.20428309f));
    }
    if (t_4 < 1f) {
        let u_14 = ((t_4 - 0.5119274f) / 0.4880726f);
        return (((((((((2f * u_14) * u_14) * u_14) - ((3f * u_14) * u_14)) + 1f) * 0.8984327f) + (((((u_14 * u_14) * u_14) - ((2f * u_14) * u_14)) + u_14) * 0.35517693f)) + (((((-2f * u_14) * u_14) * u_14) + ((3f * u_14) * u_14)) * 1f)) + ((((u_14 * u_14) * u_14) - (u_14 * u_14)) * -0.1252647f));
    }
    return 1f;
}

fn curve_5_(t_5: f32) -> f32 {
    if (t_5 <= 0f) {
        return 0.2363574f;
    }
    if (t_5 < 0.292153f) {
        let u_15 = ((t_5 - 0f) / 0.292153f);
        return (((((((((2f * u_15) * u_15) * u_15) - ((3f * u_15) * u_15)) + 1f) * 0.2363574f) + (((((u_15 * u_15) * u_15) - ((2f * u_15) * u_15)) + u_15) * 0f)) + (((((-2f * u_15) * u_15) * u_15) + ((3f * u_15) * u_15)) * 0.4541693f)) + ((((u_15 * u_15) * u_15) - (u_15 * u_15)) * 0.5332937f));
    }
    if (t_5 < 0.5347131f) {
        let u_16 = ((t_5 - 0.292153f) / 0.2425601f);
        return (((((((((2f * u_16) * u_16) * u_16) - ((3f * u_16) * u_16)) + 1f) * 0.4541693f) + (((((u_16 * u_16) * u_16) - ((2f * u_16) * u_16)) + u_16) * 0.44276726f)) + (((((-2f * u_16) * u_16) * u_16) + ((3f * u_16) * u_16)) * 0.8727217f)) + ((((u_16 * u_16) * u_16) - (u_16 * u_16)) * 0.17062752f));
    }
    if (t_5 < 1f) {
        let u_17 = ((t_5 - 0.5347131f) / 0.4652869f);
        return (((((((((2f * u_17) * u_17) * u_17) - ((3f * u_17) * u_17)) + 1f) * 0.8727217f) + (((((u_17 * u_17) * u_17) - ((2f * u_17) * u_17)) + u_17) * 0.3273034f)) + (((((-2f * u_17) * u_17) * u_17) + ((3f * u_17) * u_17)) * 1f)) + ((((u_17 * u_17) * u_17) - (u_17 * u_17)) * 0.0823985f));
    }
    return 1f;
}

fn gradient_6_(t_6: f32) -> vec4<f32> {
    var rgb_3: vec3<f32> = vec3<f32>(1f, 1f, 1f);
    var alpha_1: f32 = 0.7921569f;

    if (t_6 <= 0f) {
        rgb_3 = vec3<f32>(0.6823529f, 0.6029412f, 1f);
    } else {
        if (t_6 <= 1f) {
            rgb_3 = mix(vec3<f32>(0.6823529f, 0.6029412f, 1f), vec3<f32>(1f, 1f, 1f), ((t_6 - 0f) / 1f));
        }
    }
    if (t_6 <= 0f) {
        alpha_1 = 1f;
    } else {
        if (t_6 <= 1f) {
            alpha_1 = mix(1f, 0.7921569f, ((t_6 - 0f) / 1f));
        }
    }
    let _e39 = rgb_3;
    let _e40 = alpha_1;
    return vec4<f32>(_e39, _e40);
}

fn gradient_7_(t_7: f32) -> vec4<f32> {
    var rgb_4: vec3<f32> = vec3<f32>(0.1970085f, 0f, 0.8161765f);
    var alpha_2: f32 = 0f;

    if (t_7 <= 0f) {
        rgb_4 = vec3<f32>(0.5441177f, 0f, 0.3715009f);
    } else {
        if (t_7 <= 0.13823149f) {
            rgb_4 = mix(vec3<f32>(0.5441177f, 0f, 0.3715009f), vec3<f32>(1f, 0f, 0.6827583f), ((t_7 - 0f) / 0.13823149f));
        } else {
            if (t_7 <= 0.597055f) {
                rgb_4 = mix(vec3<f32>(1f, 0f, 0.6827583f), vec3<f32>(0.1970085f, 0f, 0.8161765f), ((t_7 - 0.13823149f) / 0.45882353f));
            }
        }
    }
    if (t_7 <= 0f) {
        alpha_2 = 0f;
    } else {
        if (t_7 <= 0.07058824f) {
            alpha_2 = mix(0f, 1f, ((t_7 - 0f) / 0.07058824f));
        } else {
            if (t_7 <= 0.13235676f) {
                alpha_2 = mix(1f, 1f, ((t_7 - 0.07058824f) / 0.06176852f));
            } else {
                if (t_7 <= 1f) {
                    alpha_2 = mix(1f, 0f, ((t_7 - 0.13235676f) / 0.86764324f));
                }
            }
        }
    }
    let _e73 = rgb_4;
    let _e74 = alpha_2;
    return vec4<f32>(_e73, _e74);
}

fn gradient_8_(t_8: f32) -> vec4<f32> {
    var rgb_5: vec3<f32> = vec3<f32>(0.2407199f, 0f, 0.7426471f);
    var alpha_3: f32 = 0f;

    if (t_8 <= 0f) {
        rgb_5 = vec3<f32>(0.6323529f, 0.1906358f, 0.4922219f);
    } else {
        if (t_8 <= 0.17941558f) {
            rgb_5 = mix(vec3<f32>(0.6323529f, 0.1906358f, 0.4922219f), vec3<f32>(1f, 0.1102941f, 0.5336714f), ((t_8 - 0f) / 0.17941558f));
        } else {
            if (t_8 <= 0.5411765f) {
                rgb_5 = mix(vec3<f32>(1f, 0.1102941f, 0.5336714f), vec3<f32>(0.2407199f, 0f, 0.7426471f), ((t_8 - 0.17941558f) / 0.36176088f));
            }
        }
    }
    if (t_8 <= 0f) {
        alpha_3 = 0f;
    } else {
        if (t_8 <= 0.07058824f) {
            alpha_3 = mix(0f, 1f, ((t_8 - 0f) / 0.07058824f));
        } else {
            if (t_8 <= 0.14706646f) {
                alpha_3 = mix(1f, 1f, ((t_8 - 0.07058824f) / 0.07647822f));
            } else {
                if (t_8 <= 1f) {
                    alpha_3 = mix(1f, 0f, ((t_8 - 0.14706646f) / 0.8529335f));
                }
            }
        }
    }
    let _e73 = rgb_5;
    let _e74 = alpha_3;
    return vec4<f32>(_e73, _e74);
}

fn dm_appearance(seed_1: u32, id_1: u32, t_9: f32, particle: ptr<function, Particle>) {
    let _e6 = dm_random(seed_1, id_1, 3u);
    let _e13 = curve_0_(t_9);
    let _e14 = curve_1_(t_9);
    let _e16 = dm_random(seed_1, id_1, 6u);
    (*particle).size_rotation.x = max(0f, ((mix(2f, 3.5f, _e6) * 1f) * (mix(_e13, _e14, _e16) * 1.2f)));
    let _e26 = dm_random(seed_1, id_1, 3u);
    let _e32 = curve_2_(t_9);
    let _e33 = curve_3_(t_9);
    let _e35 = dm_random(seed_1, id_1, 6u);
    (*particle).size_rotation.y = max(0f, ((mix(2f, 3.5f, _e26) * 1f) * (mix(_e32, _e33, _e35) * 1.2f)));
    let _e45 = dm_random(seed_1, id_1, 3u);
    let _e51 = curve_4_(t_9);
    let _e52 = curve_5_(t_9);
    let _e54 = dm_random(seed_1, id_1, 6u);
    (*particle).size_rotation.w = max(0f, ((mix(2f, 3.5f, _e45) * 1f) * (mix(_e51, _e52, _e54) * 1.2f)));
    let _e63 = dm_random(seed_1, id_1, 5u);
    let _e64 = gradient_6_(_e63);
    let _e65 = gradient_7_(t_9);
    let _e66 = gradient_8_(t_9);
    let _e68 = dm_random(seed_1, id_1, 7u);
    (*particle).color = (_e64 * mix(_e65, _e66, _e68));
    let _e74 = dm_random(seed_1, id_1, 26u);
    (*particle).velocity.w = floor((fract((0f + (mix(0f, 0.75f, _e74) * 1f))) * 4f));
    return;
}

fn dm_streams(uv: vec2<f32>, p_1: Particle, seed_2: u32) -> DmStreams {
    var o_1: DmStreams;

    let id_3 = p_1.id;
    let t_11 = clamp((p_1.age / p_1.lifetime), 0f, 1f);
    let custom1_ = vec4(0f);
    let custom2_ = vec4(0f);
    o_1.uv0_ = vec4<f32>(uv.x, uv.y, 0f, 0f);
    o_1.uv1_ = vec4<f32>(0f, 0f, 0f, 0f);
    o_1.uv2_ = vec4<f32>(0f, 0f, 0f, 0f);
    o_1.uv3_ = vec4<f32>(0f, 0f, 0f, 0f);
    o_1.rotationXY = vec2(0f);
    let _e41 = o_1;
    return _e41;
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
    let n1_ = input_2.objectPosition;
    let n2_ = input_2.custom1_;
    let n3_ = n2_.z;
    let n4_ = input_2.uv0_;
    let n5_ = vec4<f32>(0.1f, 0.1f, 0f, 0f);
    let n6_ = input_2.time;
    let n7_ = (n5_ * vec4(n6_));
    let n8_ = ((n4_.xy * vec2<f32>(1f, 1f)) + n7_.xy);
    let n11_ = textureSampleLevel(texBX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texB_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n8_ * vec2<f32>(2f, 2f)) + vec2<f32>(0f, 0f)).x, (1f - ((n8_ * vec2<f32>(2f, 2f)) + vec2<f32>(0f, 0f)).y)), 0f);
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
    let n1_1 = vec4<f32>(0.33333334f, 0f, 0.13618705f, 0f);
    let n2_1 = vec4<f32>(0.4056604f, 0f, 0.040244512f, 0f);
    let n4_1 = input_3.uv0_;
    let n5_1 = input_3.uv0_;
    let n6_1 = vec4<f32>(0.1f, 0.1f, 0f, 0f);
    let n7_1 = input_3.time;
    let n8_1 = (n6_1 * vec4(n7_1));
    let n9_ = ((n5_1.xy * vec2<f32>(1f, 1f)) + n8_1.xy);
    let n99_ = textureSample(texBX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texB_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n9_ * vec2<f32>(2f, 2f)) + vec2<f32>(0f, 0f)).x, (1f - ((n9_ * vec2<f32>(2f, 2f)) + vec2<f32>(0f, 0f)).y)));
    let n13_1 = vec4<f32>(0f, 0.4f, 0f, 0f);
    let n14_1 = (n99_ * n13_1);
    let n15_1 = clamp(n14_1, vec4(0f), vec4(1f));
    let n16_1 = n15_1.x;
    let n17_1 = n15_1.y;
    let n18_1 = (n16_1 + n17_1);
    let n19_1 = n15_1.z;
    let n20_1 = n15_1.w;
    let n21_1 = (n19_1 + n20_1);
    let n22_1 = (n18_1 + n21_1);
    let n23_1 = clamp(n22_1, 0f, 1f);
    let n24_1 = vec4(n23_1);
    let n29_1 = (n24_1 * vec4(0.2f));
    let n30_1 = (n4_1 + n29_1);
    let n31_ = vec4<f32>(0f, 0f, 0f, 0f);
    let n32_ = input_3.time;
    let n33_ = (n31_ * vec4(n32_));
    let n34_1 = ((n30_1.xy * vec2<f32>(1f, 1f)) + n33_.xy);
    let n37_ = textureSample(texAX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texA_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n34_1 * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).x, (1f - ((n34_1 * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).y)));
    let n39_ = vec4<f32>(0.33f, 0.33f, 0.33f, 0f);
    let n38_ = n37_.x;
    let n40_ = n39_.x;
    let n41_ = (n38_ * n40_);
    let n42_ = n37_.y;
    let n43_ = n39_.y;
    let n44_ = (n42_ * n43_);
    let n45_ = n37_.z;
    let n46_ = n39_.z;
    let n47_ = (n45_ * n46_);
    let n48_ = n37_.w;
    let n49_ = n39_.w;
    let n50_ = (n48_ * n49_);
    let n52_ = vec4<f32>(n41_, n44_, n47_, n50_);
    let n54_ = (1f - 1f);
    let n73_ = mix(vec3(dot(n52_.xyz, vec3<f32>(0.2126729f, 0.7151522f, 0.072175f))), n52_.xyz, n54_);
    let n59_ = (n73_ - vec3(0.773f));
    let n60_ = clamp(n59_, vec3(0f), vec3(1f));
    let n61_ = (1f - 0.773f);
    let n62_ = vec2<f32>(0f, n61_);
    let n63_ = (vec3(0f) + ((n60_ - vec3(n62_.x)) * vec3((1f / (n62_.y - n62_.x)))));
    let n65_ = (n63_ - vec3(0.5f));
    let n66_ = (n73_ * n65_);
    let n67_ = vec2<f32>(0f, n61_);
    let n68_ = (vec3(0f) + ((n66_ - vec3(n67_.x)) * vec3((1f / (n67_.y - n67_.x)))));
    let n69_ = mix(n1_1, n2_1, vec4<f32>(n68_, 0f));
    let n70_ = vec4<f32>(1f, 0.5707547f, 0.5707547f, 0f);
    let n71_ = mix(n2_1, n70_, vec4<f32>(n63_, 0f));
    let n74_ = mix(n69_, n71_, vec4<f32>(n73_, 0f));
    let n75_ = n74_.x;
    let n76_ = n74_.y;
    let n77_ = n74_.z;
    let n78_ = vec4<f32>(n73_, 0f).w;
    let n80_ = vec4<f32>(n75_, n76_, n77_, n78_);
    let n81_ = input_3.color;
    let n82_ = (n80_ * n81_);
    let n83_ = input_3.uv0_;
    let n84_ = n83_.z;
    let n85_ = (n84_ + 1f);
    let n87_ = (n82_ * vec4(n85_));
    let n88_ = input_3.frontFace;
    let n89_ = select(n87_, n87_, n88_);
    let n90_ = input_3.uv0_;
    let n91_ = n90_.w;
    let n92_ = (n91_ + -1f);
    let n93_ = vec4<f32>(-0.25f, 1f, 0f, 0f);
    let n94_ = (n93_.xy.x + (((n92_ - 0f) * (n93_.xy.y - n93_.xy.x)) / 1f));
    let n95_ = n93_.x;
    let n96_ = (n95_ * -1f);
    let n97_ = (n94_ + n96_);
    let n100_ = vec4<f32>(0f, 0f, 0f, 0f);
    let n101_ = (n99_ * n100_);
    let n102_ = clamp(n101_, vec4(0f), vec4(1f));
    let n103_ = n102_.x;
    let n104_ = n102_.y;
    let n105_ = (n103_ + n104_);
    let n106_ = n102_.z;
    let n107_ = n102_.w;
    let n108_ = (n106_ + n107_);
    let n109_ = (n105_ + n108_);
    let n110_ = clamp(n109_, 0f, 1f);
    let n112_ = vec4(n110_);
    let n113_ = smoothstep(vec4(n94_), vec4(n97_), n112_);
    let n115_ = clamp(n113_, vec4(0f), vec4(1f));
    let n120_ = textureSample(texAX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, texA_samplerX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX, vec2<f32>(((n34_1 * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).x, (1f - ((n34_1 * vec2<f32>(1f, 1f)) + vec2<f32>(0f, 0f)).y)));
    let n121_ = vec4<f32>(0f, 0f, 0f, 1f);
    let n122_ = (n120_ * n121_);
    let n123_ = n122_.x;
    let n124_ = n122_.y;
    let n125_ = (n123_ + n124_);
    let n126_ = n122_.z;
    let n127_ = n122_.w;
    let n128_ = (n126_ + n127_);
    let n129_ = (n125_ + n128_);
    let n130_ = clamp(n129_, 0f, 1f);
    let n131_ = vec4(n130_);
    let n133_ = (vec4(1f) * n131_);
    let n134_ = (n115_ * n133_);
    let n135_ = input_3.color;
    let n136_ = n135_.w;
    let n139_ = (n134_ * vec4(n136_));
    return vec4<f32>(n89_.xyz, n139_.x);
}

fn dm_safe(v_3: vec3<f32>) -> vec3<f32> {
    return (v_3 / vec3(max(length(v_3), 0.000001f)));
}

fn dm_orbit(r: vec3<f32>, w: vec3<f32>, dt: f32) -> vec3<f32> {
    var local_1: bool;

    let speed = length(w);
    if !((speed < 0.000001f)) {
        local_1 = (dt <= 0f);
    } else {
        local_1 = true;
    }
    let _e11 = local_1;
    if _e11 {
        return vec3(0f);
    }
    let axis = (w / vec3(speed));
    let angle_1 = (speed * dt);
    let c_1 = cos(angle_1);
    let rotated = (((r * c_1) + (cross(axis, r) * sin(angle_1))) + ((axis * dot(axis, r)) * (1f - c_1)));
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

fn curve_9_(t_10: f32) -> f32 {
    if (t_10 <= 0f) {
        return 1f;
    }
    if (t_10 < 0.02875004f) {
        let u_18 = ((t_10 - 0f) / 0.02875004f);
        return (((((((((2f * u_18) * u_18) * u_18) - ((3f * u_18) * u_18)) + 1f) * 1f) + (((((u_18 * u_18) * u_18) - ((2f * u_18) * u_18)) + u_18) * -0.4088526f)) + (((((-2f * u_18) * u_18) * u_18) + ((3f * u_18) * u_18)) * 0.1757559f)) + ((((u_18 * u_18) * u_18) - (u_18 * u_18)) * -0.01904957f));
    }
    if (t_10 < 1f) {
        let u_19 = ((t_10 - 0.02875004f) / 0.97124994f);
        return (((((((((2f * u_19) * u_19) * u_19) - ((3f * u_19) * u_19)) + 1f) * 0.1757559f) + (((((u_19 * u_19) * u_19) - ((2f * u_19) * u_19)) + u_19) * -0.64354324f)) + (((((-2f * u_19) * u_19) * u_19) + ((3f * u_19) * u_19)) * 0.03029823f)) + ((((u_19 * u_19) * u_19) - (u_19 * u_19)) * 0f));
    }
    return 0.03029823f;
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
    let c_2 = cos(a_1);
    let s_1 = sin(a_1);
    let z_4 = vec3<f32>(((c_2.z * v_5.x) - (s_1.z * v_5.y)), ((s_1.z * v_5.x) + (c_2.z * v_5.y)), v_5.z);
    let x_3 = vec3<f32>(z_4.x, ((c_2.x * z_4.y) - (s_1.x * z_4.z)), ((s_1.x * z_4.y) + (c_2.x * z_4.z)));
    return vec3<f32>(((c_2.y * x_3.x) + (s_1.y * x_3.z)), x_3.y, ((-(s_1.y) * x_3.x) + (c_2.y * x_3.z)));
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
    let corners = array<vec2<f32>, 6>(vec2<f32>(-0.5f, -0.5f), vec2<f32>(0.5f, -0.5f), vec2<f32>(0.5f, 0.5f), vec2<f32>(-0.5f, -0.5f), vec2<f32>(0.5f, 0.5f), vec2<f32>(-0.5f, 0.5f));
    let c_3 = corners[(vertex % 6u)];
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
    let uvCorner = vec2<f32>(select(c_3.x, -(c_3.x), (_e151 < 0f)), select(c_3.y, -(c_3.y), (_e166 < 0f)));
    let _e177 = frame.layer;
    let _e180 = p;
    let _e184 = frame.extra.x;
    let _e186 = dm_streams((((uvCorner + vec2(0.5f)) + cell) / _e177.xy), _e180, bitcast<u32>(_e184));
    let _e189 = frame.layer;
    let _e192 = size;
    let plane = vec3<f32>(((c_3 + _e189.zw) * _e192), 0f);
    let _e200 = p.size_rotation.z;
    let _e205 = dm_rotate(plane, (vec3<f32>(-(_e186.rotationXY), -(_e200)) * 57.29578f));
    let _e206 = right;
    let _e207 = up;
    let normal = normalize(cross(_e206, _e207));
    let _e210 = center;
    let _e211 = right;
    let _e214 = up;
    let _e224 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.settings.w;
    world = (_e210 + ((((_e211 * _e205.x) + (_e214 * _e205.y)) + (normal * _e205.z)) * _e224));
    let _e228 = right;
    let _e229 = right;
    let tangent = normalize((_e228 - (normal * dot(_e229, normal))));
    let objectNormal = vec3<f32>(0f, 0f, 1f);
    let _e240 = frame.eye;
    let _e244 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    let _e247 = magic_local_axisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX((_e240.xyz - _e244.xyz));
    let _e248 = world;
    let viewDir = (_e247 - _e248);
    let _e250 = right;
    let _e252 = up;
    let objectView = vec3<f32>(dot(viewDir, _e250), dot(viewDir, _e252), dot(viewDir, normal));
    input.uv0_ = _e186.uv0_;
    input.custom1_ = _e186.uv1_;
    input.custom2_ = _e186.uv2_;
    input.custom3_ = _e186.uv3_;
    let _e267 = p.color;
    input.color = _e267;
    input.normal = normal;
    let _e270 = world;
    input.worldPosition = _e270;
    input.viewDirection = viewDir;
    input.objectPosition = _e205;
    input.objectNormal = objectNormal;
    input.objectViewDirection = objectView;
    input.tangent = tangent;
    input.bitangent = cross(normal, tangent);
    let _e282 = frame.settings.x;
    input.time = _e282;
    input.delta = 0.008333334f;
    let _e285 = input;
    let _e286 = source_vertex(_e285);
    let _e288 = p.age;
    let _e289 = magic_placeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e286, _e288);
    let _e292 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    world = (_e289 + _e292.xyz);
    let _e299 = frame.vp;
    let _e300 = world;
    o.position = (_e299 * vec4<f32>(_e300, 1f));
    o.uv = _e186.uv0_;
    o.custom = _e186.uv1_;
    o.custom2_ = _e186.uv2_;
    o.custom3_ = _e186.uv3_;
    let _e314 = p.color;
    o.color = _e314;
    let _e316 = world;
    o.world = _e316;
    let _e320 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisX;
    let _e324 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisY;
    let _e328 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisZ;
    o.normal = normalize((mat3x3<f32>(_e320.xyz, _e324.xyz, _e328.xyz) * normal));
    let _e336 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisX;
    let _e340 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisY;
    let _e344 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.basisZ;
    o.tangent = normalize((mat3x3<f32>(_e336.xyz, _e340.xyz, _e344.xyz) * tangent));
    o.object = _e205;
    o.objectNormal = objectNormal;
    let _e351 = o;
    return _e351;
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
    rgb = max(_e82.xyz, vec3(0f));
    let _e96 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.detailA.y;
    if (_e96 > 0f) {
        let _e99 = rgb;
        let _e103 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.detailA.x;
        let _e107 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.detailA.y;
        let _e109 = detailHue(_e99, (_e103 * _e107));
        rgb = _e109;
    }
    let _e111 = rgb.x;
    let _e113 = rgb.y;
    let _e116 = rgb.z;
    let peak_1 = max(max(_e111, _e113), _e116);
    let eclipse = (mix(vec3<f32>(0.32f, 0.045f, 0.82f), vec3<f32>(0.88f, 0.78f, 1f), smoothstep(0.6f, 4f, peak_1)) * peak_1);
    let _e134 = frame.design.z;
    if (_e134 > 0.5f) {
        let _e137 = rgb;
        let _e141 = frame.design.y;
        let _e142 = enchantmentParticleColor(_e137, _e141);
        rgb = _e142;
    } else {
        let _e143 = rgb;
        let _e147 = frame.design.x;
        rgb = mix(_e143, eclipse, _e147);
    }
    let _e149 = alpha;
    let _e153 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint.w;
    alpha = (_e149 * _e153);
    let _e155 = rgb;
    let _e158 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint;
    let _e161 = alpha;
    let _e163 = alpha;
    return vec4<f32>(((_e155 * _e158.xyz) * _e161), _e163);
}
