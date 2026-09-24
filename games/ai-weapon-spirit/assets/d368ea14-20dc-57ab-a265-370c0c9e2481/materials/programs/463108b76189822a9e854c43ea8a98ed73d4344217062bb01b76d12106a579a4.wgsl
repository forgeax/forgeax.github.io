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

const DUST_SIZE: vec2<f32> = vec2<f32>(0.018f, 0.065f);
const DUST_INTENSITY: vec2<f32> = vec2<f32>(3.5f, 6.5f);
const DUST_FEATHER: vec2<f32> = vec2<f32>(0.65f, 0.95f);
const DUST_SPEED: vec2<f32> = vec2<f32>(3.8f, 6.4f);
const DUST_LIFE: vec2<f32> = vec2<f32>(0.38f, 0.62f);
const DUST_RADIUS: vec2<f32> = vec2<f32>(0.07f, 0.18f);

@group(1) @binding(0) 
var<uniform> materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX: MaterialParametersX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX;
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

fn dust_appearance(seed_1: u32, id_1: u32, t: f32, p_1: ptr<function, Particle>) {
    let _e3 = dm_random(seed_1, id_1, 3u);
    let size_1 = mix(0.018f, 0.065f, pow(_e3, 1.6f));
    let shrink = mix(1f, 0.25f, smoothstep(0.12f, 1f, t));
    (*p_1).size_rotation.x = (size_1 * shrink);
    let _e23 = dm_random(seed_1, id_1, 6u);
    (*p_1).size_rotation.y = ((size_1 * mix(0.75f, 1.15f, _e23)) * shrink);
    (*p_1).color = vec4<f32>(1f, 0f, 0f, (1f - smoothstep(0.18f, 1f, t)));
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

fn stream_dm_random(seed_2: u32, id_2: u32, key_1: u32) -> f32 {
    let _e13 = stream_dm_hash(((seed_2 ^ ((id_2 + 1u) * 747796405u)) ^ ((key_1 + 1u) * 2891336453u)));
    return (f32(_e13) / 4294967300f);
}

fn dm_streams(uv: vec2<f32>, p_2: Particle, seed_3: u32) -> DmStreams {
    var o_1: DmStreams;

    o_1.uv0_ = vec4<f32>(uv, 0f, 0f);
    let _e11 = stream_dm_random(seed_3, p_2.id, 160u);
    o_1.uv1_ = vec4<f32>(mix(3.5f, 6.5f, _e11), 0f, 0f, 0f);
    o_1.uv2_ = vec4(0f);
    o_1.uv3_ = vec4(0f);
    o_1.rotationXY = vec2(0f);
    let _e28 = o_1;
    return _e28;
}

fn dm_rotate(v_3: vec3<f32>, deg: vec3<f32>) -> vec3<f32> {
    let a = (deg * 0.017453292f);
    let c = cos(a);
    let s = sin(a);
    let z_3 = vec3<f32>(((c.z * v_3.x) - (s.z * v_3.y)), ((s.z * v_3.x) + (c.z * v_3.y)), v_3.z);
    let x_2 = vec3<f32>(z_3.x, ((c.x * z_3.y) - (s.x * z_3.z)), ((s.x * z_3.y) + (c.x * z_3.z)));
    return vec3<f32>(((c.y * x_2.x) + (s.y * x_2.z)), x_2.y, ((-(s.y) * x_2.x) + (c.y * x_2.z)));
}

fn source_vertex(i_1: MaterialInput) -> vec3<f32> {
    return i_1.worldPosition;
}

fn source_material(i_2: MaterialInput) -> vec4<f32> {
    let q = ((i_2.uv0_.xy - vec2(0.5f)) * 2f);
    let radius = length(q);
    let _e9 = fwidth(radius);
    let aa = max(_e9, 0.015f);
    let mask = (1f - smoothstep((0.65f - aa), (0.95f + aa), radius));
    let core_1 = mix(0.65f, 1f, (1f - smoothstep(0f, 0.65f, radius)));
    return vec4<f32>(((mix(i_2.color.xyz, vec3(max(max(i_2.color.x, i_2.color.y), i_2.color.z)), (0.55f * pow((1f - smoothstep(0f, 0.6f, radius)), 2f))) * i_2.custom1_.x) * core_1), (i_2.color.w * mask));
}

fn dm_noise(p_3: vec3<f32>) -> f32 {
    var zvals: array<f32, 2>;
    var z: i32 = 0i;
    var yvals: array<f32, 2>;
    var y: i32;
    var xvals: array<f32, 2>;
    var x: i32;

    let i_3 = vec3<i32>(floor(p_3));
    let q_1 = fract(p_3);
    let w = (((q_1 * q_1) * q_1) * ((q_1 * ((q_1 * 6f) - vec3(15f))) + vec3(10f)));
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
                            xvals[_e73] = dot(g, (q_1 - vec3<f32>(f32(_e75), f32(_e77), f32(_e79))));
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

fn stream_dm_rotate(v_4: vec3<f32>, deg_1: vec3<f32>) -> vec3<f32> {
    let a_1 = (deg_1 * 0.017453292f);
    let c_1 = cos(a_1);
    let s_1 = sin(a_1);
    let z_4 = vec3<f32>(((c_1.z * v_4.x) - (s_1.z * v_4.y)), ((s_1.z * v_4.x) + (c_1.z * v_4.y)), v_4.z);
    let x_3 = vec3<f32>(z_4.x, ((c_1.x * z_4.y) - (s_1.x * z_4.z)), ((s_1.x * z_4.y) + (c_1.x * z_4.z)));
    return vec3<f32>(((c_1.y * x_3.x) + (s_1.y * x_3.z)), x_3.y, ((-(s_1.y) * x_3.x) + (c_1.y * x_3.z)));
}

fn stream_dm_noise(p_4: vec3<f32>) -> f32 {
    var zvals_1: array<f32, 2>;
    var z_1: i32 = 0i;
    var yvals_1: array<f32, 2>;
    var y_1: i32;
    var xvals_1: array<f32, 2>;
    var x_1: i32;

    let i_4 = vec3<i32>(floor(p_4));
    let q_2 = fract(p_4);
    let w_1 = (((q_2 * q_2) * q_2) * ((q_2 * ((q_2 * 6f) - vec3(15f))) + vec3(10f)));
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
                            let n_1 = (i_4 + vec3<i32>(_e31, _e32, _e33));
                            let _e50 = stream_dm_hash((((bitcast<u32>(n_1.x) * 1597334677u) ^ (bitcast<u32>(n_1.y) * 3812015801u)) ^ (bitcast<u32>(n_1.z) * 2798796415u)));
                            let g_1 = normalize(((vec3<f32>(f32((_e50 & 255u)), f32(((_e50 >> 8u) & 255u)), f32(((_e50 >> 16u) & 255u))) / vec3(127.5f)) - vec3(1f)));
                            let _e73 = x_1;
                            let _e75 = x_1;
                            let _e77 = y_1;
                            let _e79 = z_1;
                            xvals_1[_e73] = dot(g_1, (q_2 - vec3<f32>(f32(_e75), f32(_e77), f32(_e79))));
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
    dust_appearance(_e32, _e34, clamp((_e36 / _e38), 0f, 1f), (&p));
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
    rgb = _e82.xyz;
    let _e91 = rgb.x;
    let _e93 = rgb.y;
    let _e96 = rgb.z;
    let peak_1 = max(max(_e91, _e93), _e96);
    let eclipse = (mix(vec3<f32>(0.32f, 0.045f, 0.82f), vec3<f32>(0.88f, 0.78f, 1f), smoothstep(0.6f, 4f, peak_1)) * peak_1);
    let _e114 = frame.design.z;
    if (_e114 > 0.5f) {
        let _e117 = rgb;
        let _e121 = frame.design.y;
        let _e122 = enchantmentParticleColor(_e117, _e121);
        rgb = _e122;
    } else {
        let _e123 = rgb;
        let _e127 = frame.design.x;
        rgb = mix(_e123, eclipse, _e127);
    }
    let _e129 = alpha;
    let _e133 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint.w;
    alpha = (_e129 * _e133);
    let _e135 = rgb;
    let _e138 = materialX_naga_oil_mod_XMZXXEZ3FMF4F63LBORSXE2LBNQ5DU4DBOJQW2ZLUMVZHGX.tint;
    let _e141 = alpha;
    let _e143 = alpha;
    return vec4<f32>(((_e135 * _e138.xyz) * _e141), _e143);
}
