struct ProbeBackground {
    right: vec4<f32>,
    up: vec4<f32>,
    backward: vec4<f32>,
    rotation: vec4<f32>,
    scale: vec4<f32>,
}

struct ProbeBackgroundVertex {
    @builtin(position) position: vec4<f32>,
    @location(0) direction: vec3<f32>,
}

@group(0) @binding(0) 
var backgroundCube: texture_cube<f32>;
@group(0) @binding(1) 
var backgroundSampler: sampler;
@group(0) @binding(2) 
var<uniform> background: ProbeBackground;

fn inverseRotateEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(direction: vec3<f32>, rotation: vec4<f32>) -> vec3<f32> {
    let q = normalize(rotation);
    let t = (2f * cross(q.xyz, direction));
    return ((direction - (q.w * t)) + cross(q.xyz, t));
}

@vertex 
fn probe_background_vs(@builtin(vertex_index) index: u32) -> ProbeBackgroundVertex {
    let x = select(-1f, 3f, (index == 1u));
    let y = select(-1f, 3f, (index == 2u));
    let _e16 = background.right;
    let _e21 = background.up;
    let _e27 = background.backward;
    return ProbeBackgroundVertex(vec4<f32>(x, y, 1f, 1f), (((_e16.xyz * x) + (_e21.xyz * y)) - _e27.xyz));
}

@fragment 
fn probe_background_fs(in: ProbeBackgroundVertex) -> @location(0) vec4<f32> {
    let _e5 = background.rotation;
    let _e6 = inverseRotateEnvironmentX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU2LCNRPXG2DBOJSWIX(normalize(in.direction), _e5);
    let sampleDirection = vec3<f32>(_e6.x, -(_e6.y), _e6.z);
    let _e15 = textureSampleLevel(backgroundCube, backgroundSampler, sampleDirection, 0f);
    let _e19 = background.scale;
    return vec4<f32>((_e15.xyz * _e19.xyz), 1f);
}
