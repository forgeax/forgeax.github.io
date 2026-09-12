struct DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    position: vec4<f32>,
    colorTimesIntensity: vec4<f32>,
    direction: vec4<f32>,
    auxiliary: vec4<f32>,
    metadata: vec4<u32>,
}

struct VolumeView {
    _prefix: array<vec4<f32>, 6>,
    cameraPos: vec4<f32>,
    _lightViewProjA: mat4x4<f32>,
    inverseViewProj: mat4x4<f32>,
    _viewTail: array<vec4<f32>, 18>,
    spotLightViewProj: array<mat4x4<f32>, 4>,
}

struct ClusterUniform {
    grid: vec4<u32>,
    near_far_log: vec4<f32>,
}

struct VolumeParams {
    bounds_min: vec4<f32>,
    bounds_max: vec4<f32>,
    extinction: vec4<f32>,
    albedo: vec4<f32>,
    emission: vec4<f32>,
    light_direction: vec4<f32>,
    light_color: vec4<f32>,
    optics: vec4<f32>,
}

const EPSILON: f32 = 0.00001f;
const FOUR_PI: f32 = 12.566371f;
const VOLUME_LIGHT_PHASE_SCALE: f32 = 12.566371f;

@group(0) @binding(0) 
var froxel: texture_2d_array<f32>;
@group(0) @binding(1) 
var scene_depth: texture_depth_2d;
@group(0) @binding(2) 
var resolved: texture_storage_2d<rgba16float,write>;
@group(0) @binding(3) 
var<uniform> volume_params: VolumeParams;
@group(0) @binding(4) 
var<uniform> volume_view: VolumeView;
@group(0) @binding(5) 
var froxel_sampler: sampler;
@group(0) @binding(6) 
var density: texture_3d<f32>;
@group(0) @binding(7) 
var density_sampler: sampler;
@group(0) @binding(8) 
var history_seed: texture_storage_2d<rgba16float,write>;
@group(0) @binding(9) 
var temporal_seed: texture_storage_2d<rgba16float,write>;
@group(0) @binding(10) 
var<storage> light_data: array<DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 256>;
@group(0) @binding(11) 
var<uniform> cluster_uniform: ClusterUniform;
@group(0) @binding(12) 
var projectorTexture: texture_2d<f32>;
@group(0) @binding(13) 
var projectorSampler: sampler;

fn projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(lightViewProj: mat4x4<f32>, worldPos: vec3<f32>) -> vec2<f32> {
    let clip = (lightViewProj * vec4<f32>(worldPos, 1f));
    let invW = select((1f / clip.w), 0f, (abs(clip.w) < 0.000001f));
    return vec2<f32>((((clip.x * invW) * 0.5f) + 0.5f), (((clip.y * invW) * -0.5f) + 0.5f));
}

fn hash32_(value: u32) -> u32 {
    var hash: u32;

    hash = value;
    let _e2 = hash;
    let _e5 = hash;
    hash = ((_e2 ^ 61u) ^ (_e5 >> 16u));
    let _e9 = hash;
    let _e10 = hash;
    hash = (_e9 + (_e10 << 3u));
    let _e14 = hash;
    let _e15 = hash;
    hash = (_e14 ^ (_e15 >> 4u));
    let _e19 = hash;
    hash = (_e19 * 668265261u);
    let _e22 = hash;
    let _e23 = hash;
    hash = (_e22 ^ (_e23 >> 15u));
    let _e27 = hash;
    return _e27;
}

fn froxel_seed(id_1: vec3<u32>, salt: u32) -> u32 {
    let _e14 = hash32_(((((id_1.x * 73856093u) ^ (id_1.y * 19349663u)) ^ (id_1.z * 83492791u)) ^ salt));
    return _e14;
}

fn stratified32_(seed: u32, frame_index: u32, odd_stride: u32) -> f32 {
    let _e1 = hash32_(seed);
    let bin = ((_e1 + ((frame_index & 31u) * odd_stride)) & 31u);
    return ((f32(bin) + 0.5f) / 32f);
}

fn hg(cos_theta: f32, anisotropy: f32) -> f32 {
    let g = clamp(anisotropy, -0.999f, 0.999f);
    let denominator = max(((1f + (g * g)) - ((2f * g) * clamp(cos_theta, -1f, 1f))), EPSILON);
    return ((1f - (g * g)) / (FOUR_PI * pow(denominator, 1.5f)));
}

fn reconstruct_world(uv: vec2<f32>, depth: f32) -> vec3<f32> {
    let clip_1 = vec4<f32>(((uv.x * 2f) - 1f), (1f - (uv.y * 2f)), depth, 1f);
    let _e16 = volume_view.inverseViewProj;
    let world = (_e16 * clip_1);
    return (world.xyz / vec3(max(abs(world.w), EPSILON)));
}

fn ray_box_interval(origin: vec3<f32>, direction: vec3<f32>) -> vec2<f32> {
    let safe_direction = select(direction, vec3(0.00001f), (abs(direction) < vec3(0.00001f)));
    let reciprocal = (vec3(1f) / safe_direction);
    let _e14 = volume_params.bounds_min;
    let a = ((_e14.xyz - origin) * reciprocal);
    let _e20 = volume_params.bounds_max;
    let b = ((_e20.xyz - origin) * reciprocal);
    let near_distance = max(max(min(a.x, b.x), min(a.y, b.y)), min(a.z, b.z));
    let far_distance = min(min(max(a.x, b.x), max(a.y, b.y)), max(a.z, b.z));
    return vec2<f32>(max(near_distance, 0f), max(far_distance, near_distance));
}

fn evalSpotAttenuation(lightPos: vec3<f32>, lightDir: vec3<f32>, worldPos_1: vec3<f32>, cosInner: f32, cosOuter: f32, invRangeSquared: f32) -> f32 {
    let toLight = (lightPos - worldPos_1);
    let dSquared = dot(toLight, toLight);
    let safeDistance = max(dSquared, EPSILON);
    let window = clamp((1f - ((safeDistance * invRangeSquared) * (safeDistance * invRangeSquared))), 0f, 1f);
    let distance_ = ((window * window) / safeDistance);
    let direction_1 = normalize(select(vec3<f32>(0f, 0f, -1f), toLight, (dSquared > EPSILON)));
    return (distance_ * smoothstep(cosOuter, cosInner, dot(direction_1, -(normalize(lightDir)))));
}

fn shadowAtlasTile(light: DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> i32 {
    let encoded = light.metadata.y;
    if (encoded == 4294967295u) {
        return -1i;
    }
    let tile = (encoded & 1073741823u);
    if (tile >= 4u) {
        return -1i;
    }
    return i32(tile);
}

fn spotProjectorMatrix(light_1: DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> mat4x4<f32> {
    let _e1 = shadowAtlasTile(light_1);
    if (_e1 >= 0i) {
        let _e7 = volume_view.spotLightViewProj[_e1];
        return _e7;
    }
    let _e11 = volume_view.spotLightViewProj[0];
    return _e11;
}

fn selected_cluster_light_slot(value_1: f32) -> i32 {
    var local_2: bool;

    let slot = i32(round(value_1));
    if (slot < 0i) {
        return -1i;
    }
    let index = u32(slot);
    let _e10 = cluster_uniform.grid.w;
    if !((index >= _e10)) {
        local_2 = (index >= 256u);
    } else {
        local_2 = true;
    }
    let _e18 = local_2;
    if _e18 {
        return -1i;
    }
    return slot;
}

fn spot_attenuation_at(world_position: vec3<f32>) -> f32 {
    var local_3: bool;

    let _e3 = volume_params.light_color.w;
    let _e4 = selected_cluster_light_slot(_e3);
    if (_e4 < 0i) {
        return 0f;
    }
    let light_2 = light_data[u32(_e4)];
    let _e12 = spotProjectorMatrix(light_2);
    let _e14 = projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(_e12, world_position);
    if !(any((_e14 < vec2(0f)))) {
        local_3 = any((_e14 > vec2(1f)));
    } else {
        local_3 = true;
    }
    let _e27 = local_3;
    if _e27 {
        return 0f;
    }
    let _e39 = evalSpotAttenuation(light_2.position.xyz, light_2.direction.xyz, world_position, light_2.colorTimesIntensity.w, light_2.direction.w, light_2.position.w);
    return _e39;
}

fn evalVolumePoint(lightPos_1: vec3<f32>, colorTimesIntensity: vec3<f32>, invRangeSquared_1: f32, worldPos_2: vec3<f32>) -> vec3<f32> {
    let toLight_1 = (lightPos_1 - worldPos_2);
    let dSquared_1 = max(dot(toLight_1, toLight_1), EPSILON);
    let safeDistance_1 = max(dSquared_1, EPSILON);
    let window_1 = clamp((1f - ((safeDistance_1 * invRangeSquared_1) * (safeDistance_1 * invRangeSquared_1))), 0f, 1f);
    return (colorTimesIntensity * ((window_1 * window_1) / safeDistance_1));
}

fn evalVolumeSpot(lightPos_2: vec3<f32>, lightDir_1: vec3<f32>, colorTimesIntensity_1: vec3<f32>, cosInner_1: f32, cosOuter_1: f32, invRangeSquared_2: f32, worldPos_3: vec3<f32>) -> vec3<f32> {
    let _e6 = evalSpotAttenuation(lightPos_2, lightDir_1, worldPos_3, cosInner_1, cosOuter_1, invRangeSquared_2);
    return (colorTimesIntensity_1 * _e6);
}

fn volume_point_radiance(world_position_1: vec3<f32>) -> vec3<f32> {
    let _e3 = volume_params.emission.w;
    let _e4 = selected_cluster_light_slot(_e3);
    if (_e4 < 0i) {
        return vec3(0f);
    }
    let point = light_data[u32(_e4)];
    let _e20 = evalVolumePoint(point.position.xyz, point.colorTimesIntensity.xyz, point.position.w, world_position_1);
    return _e20;
}

fn volume_spot_radiance(world_position_2: vec3<f32>) -> vec3<f32> {
    var local_4: bool;
    var local_5: bool;
    var local_6: bool;

    let _e3 = volume_params.light_color.w;
    let _e4 = selected_cluster_light_slot(_e3);
    if (_e4 < 0i) {
        return vec3(0f);
    }
    let spot = light_data[u32(_e4)];
    let _e26 = evalVolumeSpot(spot.position.xyz, spot.direction.xyz, spot.colorTimesIntensity.xyz, spot.colorTimesIntensity.w, spot.direction.w, spot.position.w, world_position_2);
    let _e27 = spotProjectorMatrix(spot);
    let _e28 = projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(_e27, world_position_2);
    if (_e28.x >= 0f) {
        local_4 = (_e28.x <= 1f);
    } else {
        local_4 = false;
    }
    let _e38 = local_4;
    if _e38 {
        local_5 = (_e28.y >= 0f);
    } else {
        local_5 = false;
    }
    let _e45 = local_5;
    if _e45 {
        local_6 = (_e28.y <= 1f);
    } else {
        local_6 = false;
    }
    let _e52 = local_6;
    if !(_e52) {
        return _e26;
    }
    let _e57 = textureSampleLevel(projectorTexture, projectorSampler, _e28, 0f);
    return (_e26 * _e57.xyz);
}

fn volume_spot_shadow_intensity() -> f32 {
    let _e3 = volume_params.light_color.w;
    let _e4 = selected_cluster_light_slot(_e3);
    if (_e4 < 0i) {
        return 1f;
    }
    let _e13 = light_data[u32(_e4)].auxiliary.z;
    return clamp(_e13, 0f, 1f);
}

fn volume_light_radiance(world_position_3: vec3<f32>) -> vec3<f32> {
    var radiance: vec3<f32> = vec3(0f);
    var local_7: bool;
    var local_8: bool;

    let _e5 = volume_params.optics.z;
    let mode = u32(round(_e5));
    if (mode == 0u) {
        let _e12 = volume_params.light_color;
        return _e12.xyz;
    }
    if !((mode == 1u)) {
        local_7 = (mode == 3u);
    } else {
        local_7 = true;
    }
    let _e22 = local_7;
    if _e22 {
        let _e24 = radiance;
        let _e26 = volume_point_radiance(world_position_3);
        radiance = (_e24 + _e26);
    }
    if !((mode == 2u)) {
        local_8 = (mode == 3u);
    } else {
        local_8 = true;
    }
    let _e36 = local_8;
    if _e36 {
        let _e37 = radiance;
        let _e38 = volume_spot_radiance(world_position_3);
        radiance = (_e37 + _e38);
    }
    let _e40 = radiance;
    return _e40;
}

fn volume_light_radiance_pair(world_position_4: vec3<f32>, spot_visibility: f32) -> vec3<f32> {
    let _e1 = volume_point_radiance(world_position_4);
    let _e2 = volume_spot_radiance(world_position_4);
    let _e3 = volume_spot_shadow_intensity();
    return (_e1 + (_e2 * mix(1f, spot_visibility, _e3)));
}

fn isFinite(value_2: f32) -> bool {
    var local_9: bool;

    if (value_2 == value_2) {
        local_9 = (abs(value_2) < 3.402823e38f);
    } else {
        local_9 = false;
    }
    let _e8 = local_9;
    return _e8;
}

fn finiteVec3_(value_3: vec3<f32>) -> bool {
    var local_10: bool;
    var local_11: bool;

    let _e2 = isFinite(value_3.x);
    if _e2 {
        let _e4 = isFinite(value_3.y);
        local_10 = _e4;
    } else {
        local_10 = false;
    }
    let _e8 = local_10;
    if _e8 {
        let _e10 = isFinite(value_3.z);
        local_11 = _e10;
    } else {
        local_11 = false;
    }
    let _e14 = local_11;
    return _e14;
}

fn volume_sample_grain(position: vec3<f32>, scale: f32, time_scaled: vec3<f32>, time_scale: f32) -> f32 {
    let coordinate = fract(((position + (time_scaled * time_scale)) * scale));
    let _e11 = textureSampleLevel(density, density_sampler, coordinate, 0f);
    return (_e11.x + 0.5f);
}

fn volume_scattering_density(position_1: vec3<f32>, frame_index_1: u32) -> f32 {
    var grain: f32;

    let time = (f32(frame_index_1) / 60f);
    let time_scaled_1 = vec3<f32>(time, 0f, (time * 0.3f));
    let _e11 = volume_sample_grain(position_1, 0.1f, time_scaled_1, 1f);
    grain = _e11;
    let _e13 = grain;
    let _e16 = volume_sample_grain(position_1, 0.05f, time_scaled_1, 1f);
    grain = (_e13 * _e16);
    let _e18 = grain;
    let _e21 = volume_sample_grain(position_1, 0.02f, time_scaled_1, 2f);
    grain = (_e18 * _e21);
    let _e23 = grain;
    return ((2f * _e23) - 1f);
}

fn packed_visibility_at(previous: vec4<f32>, current: vec4<f32>, next: vec4<f32>, channel: i32) -> f32 {
    if (channel < 0i) {
        return previous.w;
    }
    if (channel > 3i) {
        return next.x;
    }
    return current[channel];
}

@compute @workgroup_size(8, 8, 1) 
fn volume_integrate(@builtin(global_invocation_id) id: vec3<u32>) {
    var transmittance: f32 = 1f;
    var scattering: vec3<f32> = vec3(0f);
    var step_: u32 = 0u;
    var local: bool;
    var local_1: bool;

    let volume_size = textureDimensions(resolved);
    let output_size = textureDimensions(resolved);
    if any((id.xy >= output_size)) {
        return;
    }
    let uv_1 = ((vec2<f32>(id.xy) + vec2(0.5f)) / vec2<f32>(output_size));
    let _e20 = reconstruct_world(uv_1, 0f);
    let _e22 = reconstruct_world(uv_1, 1f);
    let ray_direction = normalize((_e22 - _e20));
    let _e25 = ray_box_interval(_e20, ray_direction);
    let ray_near = _e25.x;
    let _e31 = volume_params.optics.x;
    let ray_far = min(_e25.y, _e31);
    let depth_size = textureDimensions(scene_depth);
    let pixel = min(vec2<u32>((uv_1 * vec2<f32>(depth_size))), (max(depth_size, vec2(1u)) - vec2(1u)));
    let scene_depth_value = textureLoad(scene_depth, vec2<i32>(pixel), 0i);
    let _e49 = reconstruct_world(uv_1, scene_depth_value);
    let scene_distance = max(dot((_e49 - _e20), ray_direction), 0f);
    let clipped_far = min(ray_far, scene_distance);
    let _e56 = textureNumLayers(froxel);
    let visibility_depth = max((_e56 * 4u), 1u);
    let full_step = (max((ray_far - ray_near), 0f) / f32(visibility_depth));
    let ray_step = (max((ray_far - ray_near), 0f) / f32(12u));
    let _e74 = volume_params.bounds_max;
    let _e78 = volume_params.bounds_min;
    let volume_extent = max((_e74.xyz - _e78.xyz), vec3(0.00001f));
    let _e86 = volume_params.light_direction;
    let _e94 = volume_params.optics.y;
    let _e95 = hg(dot(-(normalize(_e86.xyz)), ray_direction), _e94);
    let _e98 = volume_params.extinction;
    let sigma_scale = max(dot(_e98.xyz, vec3(0.3333333f)), 0f);
    let _e106 = textureDimensions(froxel);
    let raw_froxel_size = max(_e106.xy, vec2(1u));
    let raw_froxel_coord = min(vec2<u32>((uv_1 * vec2<f32>(raw_froxel_size))), (raw_froxel_size - vec2(1u)));
    let _e121 = volume_params.light_direction.w;
    let frame_index_2 = u32(max(_e121, 0f));
    loop {
        let _e126 = step_;
        if (_e126 < 12u) {
        } else {
            break;
        }
        {
            let _e128 = step_;
            let segment_start = (ray_near + (f32(_e128) * ray_step));
            let segment_length = clamp((clipped_far - segment_start), 0f, ray_step);
            if (segment_length > 0f) {
                let _e137 = step_;
                let _e140 = froxel_seed(vec3<u32>(raw_froxel_coord, _e137), 3266489917u);
                let _e142 = stratified32_(_e140, frame_index_2, 17u);
                let jittered_ray_t = (segment_start + (segment_length * _e142));
                let world_position_5 = (_e20 + (ray_direction * jittered_ray_t));
                let _e147 = volume_scattering_density(world_position_5, frame_index_2);
                let density_value = max(_e147, 0f);
                let sample_position = clamp((((jittered_ray_t - ray_near) / max(full_step, EPSILON)) - 0.5f), 0f, f32((visibility_depth - 1u)));
                let lower_position = u32(floor(sample_position));
                let upper_position = min((lower_position + 1u), (visibility_depth - 1u));
                let interpolation = (sample_position - f32(lower_position));
                let slice_group = (lower_position / 4u);
                let upper_group = (upper_position / 4u);
                let lower_packed = textureSampleLevel(froxel, froxel_sampler, uv_1, i32(slice_group), 0f);
                let upper_packed = textureSampleLevel(froxel, froxel_sampler, uv_1, i32(upper_group), 0f);
                let lower_visibility = lower_packed[i32((lower_position % 4u))];
                let upper_visibility = upper_packed[i32((upper_position % 4u))];
                let shadow_visibility = clamp(mix(lower_visibility, upper_visibility, interpolation), 0f, 1f);
                let _e199 = volume_params.optics.z;
                let mode_1 = u32(round(_e199));
                let _e202 = volume_spot_shadow_intensity();
                if !((mode_1 == 2u)) {
                    local = (mode_1 == 3u);
                } else {
                    local = true;
                }
                let _e213 = local;
                let visibility = select(shadow_visibility, mix(1f, shadow_visibility, _e202), _e213);
                let _e215 = volume_light_radiance(world_position_5);
                let _e217 = volume_light_radiance_pair(world_position_5, visibility);
                let radiance_1 = select((_e215 * visibility), _e217, (mode_1 == 3u));
                let local_transmittance = exp(((-(sigma_scale) * density_value) * segment_length));
                let _e227 = volume_params.albedo;
                let _e238 = volume_params.emission;
                let local_scatter = (((((radiance_1 * _e227.xyz) * _e95) * VOLUME_LIGHT_PHASE_SCALE) * (1f - local_transmittance)) + ((_e238.xyz * density_value) * segment_length));
                let _e245 = scattering;
                let _e246 = transmittance;
                scattering = (_e245 + (_e246 * local_scatter));
                let _e249 = transmittance;
                transmittance = (_e249 * local_transmittance);
            }
        }
        continuing {
            let _e251 = step_;
            step_ = (_e251 + 1u);
        }
    }
    let _e254 = transmittance;
    let _e255 = isFinite(_e254);
    if _e255 {
        let _e256 = scattering;
        let _e257 = finiteVec3_(_e256);
        local_1 = _e257;
    } else {
        local_1 = false;
    }
    let finite = local_1;
    let _e267 = scattering;
    let _e268 = transmittance;
    let result = select(vec4<f32>(0f, 0f, 0f, 1f), vec4<f32>(_e267, _e268), finite);
    textureStore(resolved, id.xy, result);
    let _e276 = volume_params.optics.w;
    if (_e276 < 0.5f) {
        textureStore(history_seed, id.xy, result);
        textureStore(temporal_seed, id.xy, result);
        return;
    } else {
        return;
    }
}
