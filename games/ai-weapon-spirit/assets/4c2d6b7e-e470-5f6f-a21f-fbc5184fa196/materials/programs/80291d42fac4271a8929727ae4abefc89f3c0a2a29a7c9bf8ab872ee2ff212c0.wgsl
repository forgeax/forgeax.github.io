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
var<private> impactDetail: ImpactDetail;
var<private> impactShape: ImpactShape;

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
    let _e63 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.detailA;
    let _e66 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.detailB;
    impactDetail = ImpactDetail(_e63, _e66);
    let _e71 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.shapeA;
    let _e74 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.shapeB;
    let _e77 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.shapeC;
    let _e80 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.shapeD;
    impactShape = ImpactShape(_e71, _e74, _e77, _e80);
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
    let x_1 = vec3<f32>(0.96f, 0.18f, 0.12f);
    let y_1 = vec3<f32>(-0.18f, cos(tilt), sin(tilt));
    return (((x_1 * local_1.x) + (y_1 * local_1.y)) + ((normalize(cross(x_1, y_1)) * local_1.z) * depth));
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
    let _e25 = impactShape.a.y;
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

fn gradient_3_(t_2: f32) -> vec4<f32> {
    var rgb_3: vec3<f32> = vec3<f32>(0.4433962f, 0.008424807f, 0f);
    var alpha_1: f32 = 1f;

    if (t_2 <= 0f) {
        rgb_3 = vec3<f32>(0.18867922f, 0.00978996f, 0.00978996f);
    } else {
        if (t_2 <= 0.29117265f) {
            rgb_3 = mix(vec3<f32>(0.18867922f, 0.00978996f, 0.00978996f), vec3<f32>(0.3773585f, 0f, 0.011199376f), ((t_2 - 0f) / 0.29117265f));
        } else {
            if (t_2 <= 0.52059203f) {
                rgb_3 = mix(vec3<f32>(0.3773585f, 0f, 0.011199376f), vec3<f32>(0.7924528f, 0.08505074f, 0.03364185f), ((t_2 - 0.29117265f) / 0.2294194f));
            } else {
                if (t_2 <= 0.9529412f) {
                    rgb_3 = mix(vec3<f32>(0.7924528f, 0.08505074f, 0.03364185f), vec3<f32>(0.4433962f, 0.008424807f, 0f), ((t_2 - 0.52059203f) / 0.43234912f));
                }
            }
        }
    }
    if (t_2 <= 0f) {
        alpha_1 = 1f;
    } else {
        if (t_2 <= 1f) {
            alpha_1 = mix(1f, 1f, ((t_2 - 0f) / 1f));
        }
    }
    let _e71 = rgb_3;
    let _e72 = alpha_1;
    return vec4<f32>(_e71, _e72);
}

fn gradient_4_(t_3: f32) -> vec4<f32> {
    var rgb_4: vec3<f32> = vec3<f32>(1f, 1f, 1f);
    var alpha_2: f32 = 0f;

    if (t_3 <= 0f) {
        rgb_4 = vec3<f32>(1f, 1f, 1f);
    } else {
        if (t_3 <= 1f) {
            rgb_4 = mix(vec3<f32>(1f, 1f, 1f), vec3<f32>(1f, 1f, 1f), ((t_3 - 0f) / 1f));
        }
    }
    if (t_3 <= 0f) {
        alpha_2 = 1f;
    } else {
        if (t_3 <= 1f) {
            alpha_2 = mix(1f, 0f, ((t_3 - 0f) / 1f));
        }
    }
    let _e39 = rgb_4;
    let _e40 = alpha_2;
    return vec4<f32>(_e39, _e40);
}

fn dm_appearance(seed_2: u32, id_3: u32, t_4: f32, particle: ptr<function, Particle>) {
    let _e6 = dm_random(seed_2, id_3, 3u);
    let _e13 = curve_0_(t_4);
    (*particle).size_rotation.x = max(0f, ((mix(1f, 2.5f, _e6) * 1f) * (_e13 * 1f)));
    let _e22 = dm_random(seed_2, id_3, 3u);
    let _e28 = curve_1_(t_4);
    (*particle).size_rotation.y = max(0f, ((mix(1f, 2.5f, _e22) * 1f) * (_e28 * 1f)));
    let _e36 = dm_random(seed_2, id_3, 5u);
    let _e37 = gradient_3_(_e36);
    let _e38 = gradient_4_(t_4);
    (*particle).color = (_e37 * _e38);
    let _e43 = dm_random(seed_2, id_3, 26u);
    (*particle).velocity.w = floor((fract((0f + (mix(0f, 0.75f, _e43) * 1f))) * 4f));
    return;
}

fn dm_streams(uv: vec2<f32>, p_1: Particle, seed_3: u32) -> DmStreams {
    var o_1: DmStreams;

    let id_4 = p_1.id;
    let t_6 = clamp((p_1.age / p_1.lifetime), 0f, 1f);
    let _e10 = dm_random(seed_3, id_4, 160u);
    let custom1_ = vec4<f32>(mix(1f, 4f, _e10), 0f, 0f, 0f);
    let custom2_ = vec4(0f);
    o_1.uv0_ = vec4<f32>(uv.x, uv.y, custom1_.x, custom1_.y);
    o_1.uv1_ = vec4<f32>(custom1_.z, custom1_.w, 0f, 0f);
    o_1.rotationXY = vec2(0f);
    let _e37 = o_1;
    return _e37;
}

fn dm_rotate(v_2: vec3<f32>, deg: vec3<f32>) -> vec3<f32> {
    let a = (deg * 0.017453292f);
    let c = cos(a);
    let s = sin(a);
    let z_1 = vec3<f32>(((c.z * v_2.x) - (s.z * v_2.y)), ((s.z * v_2.x) + (c.z * v_2.y)), v_2.z);
    let x_2 = vec3<f32>(z_1.x, ((c.x * z_1.y) - (s.x * z_1.z)), ((s.x * z_1.y) + (c.x * z_1.z)));
    return vec3<f32>(((c.y * x_2.x) + (s.y * x_2.z)), x_2.y, ((-(s.y) * x_2.x) + (c.y * x_2.z)));
}

fn source_vertex(input_2: MaterialInput) -> vec3<f32> {
    return input_2.worldPosition;
}

fn source_material(input_3: MaterialInput) -> vec4<f32> {
    let n1_ = vec4<f32>(0f, 0f, 0f, 0f);
    let n2_ = input_3.uv0_;
    let n3_ = vec4<f32>(0f, 0f, 0f, 0f);
    let n4_ = input_3.time;
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
    let n25_ = input_3.uv0_;
    let n28_ = vec4<f32>(1f, 0f, 0f, 0f);
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
    let n71_ = (n23_ * n70_);
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

fn curve_2_(t_5: f32) -> f32 {
    if (t_5 <= 0f) {
        return 0.177124f;
    }
    if (t_5 < 0.1156856f) {
        let u_4 = ((t_5 - 0f) / 0.1156856f);
        return (((((((((2f * u_4) * u_4) * u_4) - ((3f * u_4) * u_4)) + 1f) * 0.177124f) + (((((u_4 * u_4) * u_4) - ((2f * u_4) * u_4)) + u_4) * 0.81279695f)) + (((((-2f * u_4) * u_4) * u_4) + ((3f * u_4) * u_4)) * 0.6345692f)) + ((((u_4 * u_4) * u_4) - (u_4 * u_4)) * 0.107129745f));
    }
    if (t_5 < 1f) {
        let u_5 = ((t_5 - 0.1156856f) / 0.8843144f);
        return (((((((((2f * u_5) * u_5) * u_5) - ((3f * u_5) * u_5)) + 1f) * 0.6345692f) + (((((u_5 * u_5) * u_5) - ((2f * u_5) * u_5)) + u_5) * 0.81891245f)) + (((((-2f * u_5) * u_5) * u_5) + ((3f * u_5) * u_5)) * 1f)) + ((((u_5 * u_5) * u_5) - (u_5 * u_5)) * 0.12288893f));
    }
    return 1f;
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
    let corners_1 = array<vec2<f32>, 6>(vec2<f32>(-0.5f, -0.5f), vec2<f32>(0.5f, -0.5f), vec2<f32>(0.5f, 0.5f), vec2<f32>(-0.5f, -0.5f), vec2<f32>(0.5f, 0.5f), vec2<f32>(-0.5f, 0.5f));
    let _e66 = shapeCorner(vertex);
    let _e68 = p.position;
    let _e72 = frame.motion;
    let _e77 = frame.settings.x;
    center = (_e68.xyz + (_e72.xyz * _e77));
    let _e82 = p.size_rotation;
    size = _e82.xy;
    let _e87 = frame.right;
    let _e89 = magic_local_axisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e87.xyz);
    right = _e89;
    let _e93 = frame.up;
    let _e95 = magic_local_axisX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e93.xyz);
    up = _e95;
    let _e100 = impactDetail.a.y;
    if (_e100 > 0f) {
        let _e104 = size.x;
        let _e108 = impactDetail.a.w;
        let _e112 = impactDetail.a.y;
        size.x = (_e104 * mix(1f, _e108, _e112));
    }
    let _e119 = frame.layer.x;
    let columns = u32(_e119);
    let _e124 = frame.layer.y;
    let rows = u32(_e124);
    let _e128 = p.velocity.w;
    let tile = min(u32(max(_e128, 0f)), ((columns * rows) - 1u));
    let cell_1 = vec2<f32>(f32((tile % columns)), f32(((rows - 1u) - (tile / columns))));
    let _e150 = frame.extra.x;
    let _e153 = p.id;
    let _e155 = dm_random(bitcast<u32>(_e150), _e153, 210u);
    let _e165 = frame.extra.x;
    let _e168 = p.id;
    let _e170 = dm_random(bitcast<u32>(_e165), _e168, 211u);
    let uvCorner = vec2<f32>(select(_e66.x, -(_e66.x), (_e155 < 0f)), select(_e66.y, -(_e66.y), (_e170 < 0f)));
    let _e181 = frame.layer;
    let _e184 = p;
    let _e188 = frame.extra.x;
    let _e190 = dm_streams((((uvCorner + vec2(0.5f)) + cell_1) / _e181.xy), _e184, bitcast<u32>(_e188));
    let _e193 = frame.layer;
    let _e196 = size;
    let plane = vec3<f32>(((_e66 + _e193.zw) * _e196), 0f);
    let _e203 = p.size_rotation.z;
    let _e208 = dm_rotate(plane, (vec3<f32>(_e190.rotationXY, -(_e203)) * 57.29578f));
    let _e209 = right;
    let _e210 = up;
    let normal = normalize(cross(_e209, _e210));
    let _e213 = center;
    let _e214 = right;
    let _e217 = up;
    let _e227 = frame.settings.w;
    world = (_e213 + ((((_e214 * _e208.x) + (_e217 * _e208.y)) + (normal * _e208.z)) * _e227));
    let _e234 = impactShape.a.x;
    if (_e234 > 0f) {
        let q_1 = (_e66.y + 0.5f);
        let _e241 = p.age;
        let _e243 = p.lifetime;
        let age_1 = clamp((_e241 / _e243), 0f, 1f);
        let _e251 = frame.extra.x;
        let seed_4 = bitcast<u32>(_e251);
        let _e254 = p.id;
        let _e256 = dm_random(seed_4, _e254, 303u);
        let lengthGain = mix(0.72f, 1.05f, _e256);
        let _e263 = impactShape.b.x;
        let width = (_e263 * (0.45f + (0.85f * sin((q_1 * 3.1415927f)))));
        let _e274 = size.y;
        let _e281 = impactShape.a.w;
        let bend = ((((q_1 * q_1) * _e274) * 0.55f) * _e281);
        let _e285 = size.x;
        let _e292 = size.y;
        let _e299 = size.y;
        let _e304 = p.id;
        let blade = vec3<f32>((((_e66.x * _e285) * width) + bend), (((q_1 + 0.06f) * _e292) * lengthGain), (((sin((q_1 * 3.1415927f)) * _e299) * 0.36f) + (((f32((_e304 % 3u)) - 1f) * q_1) * 0.22f)));
        let _e317 = p.size_rotation.z;
        let angle_2 = (-(_e317) + ((age_1 - 0.25f) * 0.35f));
        let turned = vec3<f32>(((cos(angle_2) * blade.x) - (sin(angle_2) * blade.y)), ((sin(angle_2) * blade.x) + (cos(angle_2) * blade.y)), blade.z);
        let _e341 = p.id;
        let _e345 = impactShape.a.z;
        let _e346 = shapePlane(turned, _e341, _e345);
        let _e347 = right;
        let _e350 = up;
        let facing = ((_e347 * turned.x) + (_e350 * turned.y));
        let _e354 = world;
        let _e355 = center;
        let _e359 = impactShape.a.z;
        let _e366 = frame.settings.w;
        let _e372 = impactShape.a.x;
        world = mix(_e354, (_e355 + (mix(facing, _e346, min(1f, _e359)) * _e366)), _e372);
    }
    input.uv0_ = _e190.uv0_;
    input.custom1_ = _e190.uv1_;
    let _e381 = p.color;
    input.color = _e381;
    input.normal = normal;
    let _e384 = world;
    input.worldPosition = _e384;
    let _e389 = frame.settings.x;
    input.time = _e389;
    input.delta = 0.008333334f;
    let _e392 = input;
    let _e393 = source_vertex(_e392);
    let _e395 = p.age;
    let _e396 = magic_placeX_naga_oil_mod_XMFUV653FMFYG63S7ONYGS4TJORPW2YLHNFRTUOTQNRQWGZLNMVXHIX(_e393, _e395);
    let _e399 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    world = (_e396 + _e399.xyz);
    let _e406 = frame.vp;
    let _e407 = world;
    o.position = (_e406 * vec4<f32>(_e407, 1f));
    o.uv = _e190.uv0_;
    o.custom = _e190.uv1_;
    let _e417 = p.color;
    o.color = _e417;
    let _e419 = world;
    let _e422 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.anchor;
    o.world = (_e419 - _e422.xyz);
    o.normal = normal;
    let _e426 = o;
    return _e426;
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
    let _e50 = impactDetail.a.y;
    if (_e50 > 0f) {
        let _e53 = rgb;
        let _e57 = impactDetail.a.x;
        let _e61 = impactDetail.a.y;
        let _e63 = detailHue(_e53, (_e57 * _e61));
        rgb = _e63;
    }
    let _e65 = rgb.x;
    let _e67 = rgb.y;
    let _e70 = rgb.z;
    let peak_1 = max(max(_e65, _e67), _e70);
    let eclipse = (mix(vec3<f32>(0.32f, 0.045f, 0.82f), vec3<f32>(0.88f, 0.78f, 1f), smoothstep(0.6f, 4f, peak_1)) * peak_1);
    let _e88 = frame.design.z;
    if (_e88 > 0.5f) {
        let _e91 = rgb;
        let _e95 = frame.design.y;
        let _e96 = enchantmentParticleColor(_e91, _e95);
        rgb = _e96;
    } else {
        let _e97 = rgb;
        let _e101 = frame.design.x;
        rgb = mix(_e97, eclipse, _e101);
    }
    let _e103 = alpha;
    let _e107 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint.w;
    alpha = (_e103 * _e107);
    let _e109 = rgb;
    let _e112 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint;
    let _e115 = alpha;
    let _e117 = alpha;
    return vec4<f32>(((_e109 * _e112.xyz) * _e115), _e117);
}
