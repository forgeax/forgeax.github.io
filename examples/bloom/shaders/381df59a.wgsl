struct VolumeDepthView {
    _prefix: array<vec4<f32>, 6>,
    cameraPos: vec4<f32>,
    _lightViewProjA: mat4x4<f32>,
    inverseViewProj: mat4x4<f32>,
}

struct VolumeOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

@group(0) @binding(0) 
var resolved_volume: texture_2d<f32>;
@group(0) @binding(1) 
var volume_sampler: sampler;
@group(0) @binding(2) 
var scene_depth: texture_depth_2d;
@group(0) @binding(3) 
var<uniform> volume_view: VolumeDepthView;

fn composite_resolved_volume(sample: vec4<f32>) -> vec4<f32> {
    let transmittance = clamp(sample.w, 0f, 1f);
    return vec4<f32>(sample.xyz, (1f - transmittance));
}

fn linear_scene_depth(uv: vec2<f32>) -> f32 {
    let _e1 = textureDimensions(scene_depth);
    let dimensions = max(vec2<f32>(_e1), vec2(1f));
    let pixel = vec2<i32>(clamp((uv * dimensions), vec2(0f), (dimensions - vec2(1f))));
    let device_depth = textureLoad(scene_depth, pixel, 0i);
    let clip = vec4<f32>(((uv.x * 2f) - 1f), (1f - (uv.y * 2f)), device_depth, 1f);
    let _e32 = volume_view.inverseViewProj;
    let world = (_e32 * clip);
    let world_position = (world.xyz / vec3(max(abs(world.w), 0.00001f)));
    let _e43 = volume_view.cameraPos;
    return distance(world_position, _e43.xyz);
}

fn radiance_luma(sample_1: vec4<f32>) -> f32 {
    return max(dot(sample_1.xyz, vec3<f32>(0.2126f, 0.7152f, 0.0722f)), 0f);
}

fn radiance_luma_weight(center: vec4<f32>, neighbor: vec4<f32>) -> f32 {
    let _e1 = radiance_luma(center);
    let _e3 = radiance_luma(neighbor);
    let relative_luma = (abs((_e3 - _e1)) / max(max(_e3, _e1), 0.0001f));
    return exp((-(relative_luma) * 8f));
}

fn edge_aware_resolved_volume(uv_1: vec2<f32>) -> vec4<f32> {
    var accumulated: vec4<f32>;
    var total_weight: f32 = 4f;
    var index_1: u32 = 0u;

    let _e3 = textureDimensions(resolved_volume);
    let dimensions_1 = max(vec2<f32>(_e3), vec2(1f));
    let texel = (vec2(1f) / dimensions_1);
    let center_1 = textureSampleLevel(resolved_volume, volume_sampler, uv_1, 0f);
    let _e16 = linear_scene_depth(uv_1);
    accumulated = (center_1 * 4f);
    let offsets = array<vec2<f32>, 8>(vec2<f32>(texel.x, 0f), vec2<f32>(-(texel.x), 0f), vec2<f32>(0f, texel.y), vec2<f32>(0f, -(texel.y)), vec2<f32>(texel.x, texel.y), vec2<f32>(-(texel.x), texel.y), vec2<f32>(texel.x, -(texel.y)), vec2<f32>(-(texel.x), -(texel.y)));
    let spatial_weights = array<f32, 8>(2f, 2f, 2f, 2f, 1f, 1f, 1f, 1f);
    loop {
        let _e61 = index_1;
        if (_e61 < 8u) {
        } else {
            break;
        }
        {
            let _e64 = index_1;
            let neighbor_uv = clamp((uv_1 + offsets[_e64]), vec2(0f), vec2(1f));
            let neighbor_1 = textureSampleLevel(resolved_volume, volume_sampler, neighbor_uv, 0f);
            let _e76 = linear_scene_depth(neighbor_uv);
            let depth_weight = select(0f, exp((-(abs((_e76 - _e16))) * 0.08f)), (abs((_e76 - _e16)) <= max((_e16 * 0.08f), 0.25f)));
            let _e92 = index_1;
            let _e104 = radiance_luma_weight(center_1, neighbor_1);
            let edge_weight = (((spatial_weights[_e92] * depth_weight) * exp((-(abs((neighbor_1.w - center_1.w))) * 6f))) * _e104);
            let _e106 = accumulated;
            accumulated = (_e106 + (neighbor_1 * edge_weight));
            let _e110 = total_weight;
            total_weight = (_e110 + edge_weight);
        }
        continuing {
            let _e112 = index_1;
            index_1 = (_e112 + 1u);
        }
    }
    let _e115 = accumulated;
    let _e116 = total_weight;
    return (_e115 / vec4(max(_e116, 0.00001f)));
}

@vertex 
fn volume_vs(@builtin(vertex_index) index: u32) -> VolumeOutput {
    var positions: array<vec2<f32>, 3> = array<vec2<f32>, 3>(vec2<f32>(-1f, -1f), vec2<f32>(3f, -1f), vec2<f32>(-1f, 3f));
    var output: VolumeOutput;

    let _e11 = positions[index];
    output.position = vec4<f32>(_e11, 0f, 1f);
    let _e18 = positions[index].x;
    let _e25 = positions[index].y;
    output.uv = vec2<f32>(((_e18 * 0.5f) + 0.5f), (0.5f - (_e25 * 0.5f)));
    let _e31 = output;
    return _e31;
}

@fragment 
fn volume_fs(input: VolumeOutput) -> @location(0) vec4<f32> {
    let _e2 = edge_aware_resolved_volume(input.uv);
    let _e3 = composite_resolved_volume(_e2);
    return _e3;
}
