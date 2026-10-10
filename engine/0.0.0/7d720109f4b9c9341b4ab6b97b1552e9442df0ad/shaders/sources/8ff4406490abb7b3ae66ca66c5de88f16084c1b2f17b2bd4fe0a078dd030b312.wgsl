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
    _temporalTail: array<vec4<f32>, 11>,
    cloudShadowOrigin: vec4<f32>,
    cloudShadowRight: vec4<f32>,
    cloudShadowUp: vec4<f32>,
    cloudShadowProjection: vec4<f32>,
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
    simulation: vec4<f32>,
}

struct VolumeSet {
    scene: VolumeParams,
    members: array<VolumeParams, 8>,
}

const EPSILON: f32 = 0.00001f;
const FOUR_PI: f32 = 12.566371f;
const VOLUME_LIGHT_PHASE_SCALE: f32 = 12.566371f;

@group(0) @binding(16) 
var cloudShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX: texture_2d<f32>;
@group(0) @binding(17) 
var cloudShadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX: sampler;
@group(0) @binding(0) 
var froxel: texture_2d_array<f32>;
@group(0) @binding(1) 
var scene_depth: texture_depth_2d;
@group(0) @binding(2) 
var resolved: texture_storage_2d<rgba16float,write>;
@group(0) @binding(3) 
var<uniform> volume_set: VolumeSet;
var<private> volume_params: VolumeParams;
var<private> volume_owner: u32;
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
@group(0) @binding(18) 
var density1_: texture_3d<f32>;
@group(0) @binding(19) 
var density2_: texture_3d<f32>;
@group(0) @binding(20) 
var density3_: texture_3d<f32>;
@group(0) @binding(21) 
var density4_: texture_3d<f32>;
@group(0) @binding(22) 
var density5_: texture_3d<f32>;
@group(0) @binding(23) 
var density6_: texture_3d<f32>;
@group(0) @binding(24) 
var density7_: texture_3d<f32>;

fn projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(lightViewProj: mat4x4<f32>, worldPos: vec3<f32>) -> vec2<f32> {
    let clip = (lightViewProj * vec4<f32>(worldPos, 1f));
    let invW = select((1f / clip.w), 0f, (abs(clip.w) < 0.000001f));
    return vec2<f32>((((clip.x * invW) * 0.5f) + 0.5f), (((clip.y * invW) * -0.5f) + 0.5f));
}

fn cloud_direct_solar_factorX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX(worldPosition: vec3<f32>, shadowOrigin: vec3<f32>, shadowRight: vec3<f32>, shadowUp: vec3<f32>, shadowProjection: vec4<f32>) -> f32 {
    var local_8: bool;
    var local_9: bool;
    var local_10: bool;
    var local_11: bool;
    var local_12: bool;
    var local_13: bool;
    var local_14: bool;
    var local_15: bool;

    if (worldPosition.x == worldPosition.x) {
        local_8 = (worldPosition.y == worldPosition.y);
    } else {
        local_8 = false;
    }
    let _e10 = local_8;
    if _e10 {
        local_9 = (worldPosition.z == worldPosition.z);
    } else {
        local_9 = false;
    }
    let _e17 = local_9;
    if _e17 {
        local_10 = all((abs(worldPosition) < vec3(3.402823e38f)));
    } else {
        local_10 = false;
    }
    let validReceiver = local_10;
    let offset = (worldPosition - shadowOrigin);
    let uv_1 = ((vec2<f32>(dot(offset, shadowRight), dot(offset, shadowUp)) / vec2(max(shadowProjection.x, 0.000001f))) + vec2(0.5f));
    if all((uv_1 >= vec2(0f))) {
        local_11 = all((uv_1 <= vec2(1f)));
    } else {
        local_11 = false;
    }
    let inRange = local_11;
    if (shadowProjection.y > 0.5f) {
        local_12 = (shadowProjection.z < 0.5f);
    } else {
        local_12 = false;
    }
    let _e64 = local_12;
    if _e64 {
        local_13 = (shadowProjection.x > 0f);
    } else {
        local_13 = false;
    }
    let available = local_13;
    let _e80 = textureSampleLevel(cloudShadowMapX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX, cloudShadowSamplerX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX, clamp(uv_1, vec2(0f), vec2(1f)), 0f);
    let sampled = _e80.x;
    if validReceiver {
        local_14 = inRange;
    } else {
        local_14 = false;
    }
    let _e88 = local_14;
    if _e88 {
        local_15 = available;
    } else {
        local_15 = false;
    }
    let _e92 = local_15;
    return select(1f, clamp(sampled, 0f, 1f), _e92);
}

fn cloud_apply_direct_solarX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX(radiance: vec3<f32>, worldPosition_1: vec3<f32>, shadowOrigin_1: vec3<f32>, shadowRight_1: vec3<f32>, shadowUp_1: vec3<f32>, shadowProjection_1: vec4<f32>) -> vec3<f32> {
    let _e5 = cloud_direct_solar_factorX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX(worldPosition_1, shadowOrigin_1, shadowRight_1, shadowUp_1, shadowProjection_1);
    return (radiance * _e5);
}

fn sample_density(coordinate: vec3<f32>) -> f32 {
    let _e1 = volume_owner;
    switch _e1 {
        case 1u: {
            let _e6 = textureSampleLevel(density1_, density_sampler, coordinate, 0f);
            return _e6.x;
        }
        case 2u: {
            let _e11 = textureSampleLevel(density2_, density_sampler, coordinate, 0f);
            return _e11.x;
        }
        case 3u: {
            let _e16 = textureSampleLevel(density3_, density_sampler, coordinate, 0f);
            return _e16.x;
        }
        case 4u: {
            let _e21 = textureSampleLevel(density4_, density_sampler, coordinate, 0f);
            return _e21.x;
        }
        case 5u: {
            let _e26 = textureSampleLevel(density5_, density_sampler, coordinate, 0f);
            return _e26.x;
        }
        case 6u: {
            let _e31 = textureSampleLevel(density6_, density_sampler, coordinate, 0f);
            return _e31.x;
        }
        case 7u: {
            let _e36 = textureSampleLevel(density7_, density_sampler, coordinate, 0f);
            return _e36.x;
        }
        default: {
            let _e41 = textureSampleLevel(density, density_sampler, coordinate, 0f);
            return _e41.x;
        }
    }
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

fn selected_cluster_light_slot(value: f32) -> i32 {
    var local_16: bool;

    let slot = i32(round(value));
    if (slot < 0i) {
        return -1i;
    }
    let index = u32(slot);
    let _e10 = cluster_uniform.grid.w;
    if !((index >= _e10)) {
        local_16 = (index >= 256u);
    } else {
        local_16 = true;
    }
    let _e18 = local_16;
    if _e18 {
        return -1i;
    }
    return slot;
}

fn spot_attenuation_at(world_position: vec3<f32>) -> f32 {
    var local_17: bool;

    let _e3 = volume_params.light_color.w;
    let _e4 = selected_cluster_light_slot(_e3);
    if (_e4 < 0i) {
        return 0f;
    }
    let light_2 = light_data[u32(_e4)];
    let _e12 = spotProjectorMatrix(light_2);
    let _e14 = projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(_e12, world_position);
    if !(any((_e14 < vec2(0f)))) {
        local_17 = any((_e14 > vec2(1f)));
    } else {
        local_17 = true;
    }
    let _e27 = local_17;
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
    var local_18: bool;
    var local_19: bool;
    var local_20: bool;
    var local_21: bool;

    let _e3 = volume_params.light_color.w;
    let _e4 = selected_cluster_light_slot(_e3);
    if (_e4 < 0i) {
        return vec3(0f);
    }
    let spot = light_data[u32(_e4)];
    let _e26 = evalVolumeSpot(spot.position.xyz, spot.direction.xyz, spot.colorTimesIntensity.xyz, spot.colorTimesIntensity.w, spot.direction.w, spot.position.w, world_position_2);
    if !((spot.metadata.y == 4294967295u)) {
        local_18 = ((spot.metadata.y & 1073741824u) == 0u);
    } else {
        local_18 = true;
    }
    let _e41 = local_18;
    if _e41 {
        return _e26;
    }
    let _e42 = spotProjectorMatrix(spot);
    let _e43 = projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(_e42, world_position_2);
    if (_e43.x >= 0f) {
        local_19 = (_e43.x <= 1f);
    } else {
        local_19 = false;
    }
    let _e53 = local_19;
    if _e53 {
        local_20 = (_e43.y >= 0f);
    } else {
        local_20 = false;
    }
    let _e60 = local_20;
    if _e60 {
        local_21 = (_e43.y <= 1f);
    } else {
        local_21 = false;
    }
    let _e67 = local_21;
    if !(_e67) {
        return _e26;
    }
    let _e72 = textureSampleLevel(projectorTexture, projectorSampler, _e43, 0f);
    return (_e26 * _e72.xyz);
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
    var radiance_1: vec3<f32> = vec3(0f);
    var local_22: bool;
    var local_23: bool;

    let _e5 = volume_params.optics.z;
    let mode = u32(round(_e5));
    if (mode == 0u) {
        let _e12 = volume_params.light_color;
        let _e16 = volume_view.cloudShadowOrigin;
        let _e20 = volume_view.cloudShadowRight;
        let _e24 = volume_view.cloudShadowUp;
        let _e28 = volume_view.cloudShadowProjection;
        let _e30 = cloud_apply_direct_solarX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MN52WIOR2NRQXSZLSX(_e12.xyz, world_position_3, _e16.xyz, _e20.xyz, _e24.xyz, _e28);
        return _e30;
    }
    if !((mode == 1u)) {
        local_22 = (mode == 3u);
    } else {
        local_22 = true;
    }
    let _e39 = local_22;
    if _e39 {
        let _e41 = radiance_1;
        let _e42 = volume_point_radiance(world_position_3);
        radiance_1 = (_e41 + _e42);
    }
    if !((mode == 2u)) {
        local_23 = (mode == 3u);
    } else {
        local_23 = true;
    }
    let _e52 = local_23;
    if _e52 {
        let _e53 = radiance_1;
        let _e54 = volume_spot_radiance(world_position_3);
        radiance_1 = (_e53 + _e54);
    }
    let _e56 = radiance_1;
    return _e56;
}

fn volume_light_radiance_pair(world_position_4: vec3<f32>, spot_visibility: f32) -> vec3<f32> {
    let _e1 = volume_point_radiance(world_position_4);
    let _e2 = volume_spot_radiance(world_position_4);
    let _e3 = volume_spot_shadow_intensity();
    return (_e1 + (_e2 * mix(1f, spot_visibility, _e3)));
}

fn isFinite(value_1: f32) -> bool {
    var local_24: bool;

    if (value_1 == value_1) {
        local_24 = (abs(value_1) < 3.402823e38f);
    } else {
        local_24 = false;
    }
    let _e8 = local_24;
    return _e8;
}

fn finiteVec3_(value_2: vec3<f32>) -> bool {
    var local_25: bool;
    var local_26: bool;

    let _e2 = isFinite(value_2.x);
    if _e2 {
        let _e4 = isFinite(value_2.y);
        local_25 = _e4;
    } else {
        local_25 = false;
    }
    let _e8 = local_25;
    if _e8 {
        let _e10 = isFinite(value_2.z);
        local_26 = _e10;
    } else {
        local_26 = false;
    }
    let _e14 = local_26;
    return _e14;
}

fn volume_sample_grain(position: vec3<f32>, scale: f32, time_scaled: vec3<f32>, time_scale: f32) -> f32 {
    let coordinate_1 = fract(((position + (time_scaled * time_scale)) * scale));
    let _e8 = sample_density(coordinate_1);
    return (_e8 + 0.5f);
}

fn volume_scattering_density(position_1: vec3<f32>, world_time_seconds: f32) -> f32 {
    var grain: f32;

    let _e3 = volume_params.bounds_max.w;
    if (_e3 > 0.5f) {
        let _e9 = volume_params.bounds_min;
        let _e14 = volume_params.bounds_max;
        let _e18 = volume_params.bounds_min;
        let coordinate_2 = ((position_1 - _e9.xyz) / max((_e14.xyz - _e18.xyz), vec3(0.00001f)));
        let _e30 = sample_density(clamp(coordinate_2, vec3(0f), vec3(1f)));
        return _e30;
    }
    let time_scaled_1 = vec3<f32>(world_time_seconds, 0f, (world_time_seconds * 0.3f));
    let _e38 = volume_sample_grain(position_1, 0.1f, time_scaled_1, 1f);
    grain = _e38;
    let _e40 = grain;
    let _e43 = volume_sample_grain(position_1, 0.05f, time_scaled_1, 1f);
    grain = (_e40 * _e43);
    let _e45 = grain;
    let _e48 = volume_sample_grain(position_1, 0.02f, time_scaled_1, 2f);
    grain = (_e45 * _e48);
    let _e50 = grain;
    return ((2f * _e50) - 1f);
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
    var boundaries: array<f32, 16>;
    var boundary_count: u32 = 2u;
    var owner: u32 = 0u;
    var i: u32 = 1u;
    var j: u32;
    var transmittance: f32 = 1f;
    var scattering: vec3<f32> = vec3(0f);
    var interval_index: u32 = 1u;
    var step_: u32;
    var nearest_light_squared: f32;
    var owner_1: u32;
    var local: bool;
    var local_1: bool;
    var local_2: bool;
    var local_3: bool;
    var substep: u32;
    var extinction: f32;
    var source: vec3<f32>;
    var emission: vec3<f32>;
    var owner_2: u32;
    var local_4: bool;
    var local_5: bool;
    var local_6: bool;
    var local_7: bool;

    let _e8 = volume_set.scene;
    volume_params = _e8;
    let _e13 = volume_params.bounds_min.w;
    let owner_count = clamp(u32(_e13), 1u, 8u);
    let output_size = textureDimensions(resolved);
    if any((id.xy >= output_size)) {
        return;
    }
    let uv_2 = ((vec2<f32>(id.xy) + vec2(0.5f)) / vec2<f32>(output_size));
    let _e32 = reconstruct_world(uv_2, 0f);
    let _e34 = reconstruct_world(uv_2, 1f);
    let ray_direction = normalize((_e34 - _e32));
    let _e37 = ray_box_interval(_e32, ray_direction);
    let ray_near = _e37.x;
    let _e43 = volume_params.optics.x;
    let ray_far = min(_e37.y, _e43);
    let depth_size = textureDimensions(scene_depth);
    let pixel = min(vec2<u32>((uv_2 * vec2<f32>(depth_size))), (max(depth_size, vec2(1u)) - vec2(1u)));
    let scene_depth_value = textureLoad(scene_depth, vec2<i32>(pixel), 0i);
    let _e61 = reconstruct_world(uv_2, scene_depth_value);
    let scene_distance = max(dot((_e61 - _e32), ray_direction), 0f);
    let clipped_far = min(ray_far, scene_distance);
    let _e68 = textureNumLayers(froxel);
    let owner_layers = (_e68 / owner_count);
    let visibility_depth = max((owner_layers * 4u), 1u);
    boundaries[0] = ray_near;
    boundaries[1] = ray_far;
    if (owner_count > 1u) {
        boundary_count = 0u;
        loop {
            let _e82 = owner;
            if (_e82 < owner_count) {
            } else {
                break;
            }
            {
                let _e86 = owner;
                let _e88 = volume_set.members[_e86];
                volume_params = _e88;
                let _e90 = ray_box_interval(_e32, ray_direction);
                let _e95 = volume_params.optics.x;
                let end = min(min(_e90.y, _e95), scene_distance);
                if (end > _e90.x) {
                    let _e100 = boundary_count;
                    boundaries[_e100] = _e90.x;
                    let _e103 = boundary_count;
                    boundaries[(_e103 + 1u)] = end;
                    let _e107 = boundary_count;
                    boundary_count = (_e107 + 2u);
                }
            }
            continuing {
                let _e110 = owner;
                owner = (_e110 + 1u);
            }
        }
        loop {
            let _e114 = i;
            let _e115 = boundary_count;
            if (_e114 < _e115) {
            } else {
                break;
            }
            {
                let _e117 = i;
                let value_3 = boundaries[_e117];
                let _e120 = i;
                j = _e120;
                loop {
                    let _e122 = j;
                    if (_e122 > 0u) {
                    } else {
                        break;
                    }
                    {
                        let _e125 = j;
                        let _e129 = boundaries[(_e125 - 1u)];
                        if (_e129 <= value_3) {
                            break;
                        }
                        let _e131 = j;
                        let _e133 = j;
                        let _e137 = boundaries[(_e133 - 1u)];
                        boundaries[_e131] = _e137;
                        let _e138 = j;
                        j = (_e138 - 1u);
                    }
                }
                let _e141 = j;
                boundaries[_e141] = value_3;
            }
            continuing {
                let _e143 = i;
                i = (_e143 + 1u);
            }
        }
    }
    loop {
        let _e147 = interval_index;
        let _e148 = boundary_count;
        if (_e147 < _e148) {
        } else {
            break;
        }
        {
            let _e150 = interval_index;
            let interval_start = boundaries[(_e150 - 1u)];
            let _e155 = interval_index;
            let interval_end = boundaries[_e155];
            if (interval_end <= interval_start) {
                continue;
            }
            let ray_step = ((interval_end - interval_start) / f32(96u));
            step_ = 0u;
            loop {
                let _e165 = step_;
                if (_e165 < 96u) {
                } else {
                    break;
                }
                {
                    let _e167 = step_;
                    let segment_start = (interval_start + (f32(_e167) * ray_step));
                    let segment_length = clamp((clipped_far - segment_start), 0f, ray_step);
                    if (segment_length > 0f) {
                        let midpoint = (_e32 + (ray_direction * (segment_start + (segment_length * 0.5f))));
                        nearest_light_squared = 1e20f;
                        owner_1 = 0u;
                        loop {
                            let _e185 = owner_1;
                            if (_e185 < owner_count) {
                            } else {
                                break;
                            }
                            {
                                let _e189 = owner_1;
                                let _e191 = volume_set.members[_e189];
                                volume_params = _e191;
                                let _e196 = volume_params.optics.z;
                                let light_mode = u32(round(_e196));
                                let _e202 = volume_params.emission.w;
                                let _e203 = selected_cluster_light_slot(_e202);
                                let _e207 = volume_params.light_color.w;
                                let _e208 = selected_cluster_light_slot(_e207);
                                if !((light_mode == 1u)) {
                                    local = (light_mode == 3u);
                                } else {
                                    local = true;
                                }
                                let _e217 = local;
                                if _e217 {
                                    local_1 = (_e203 >= 0i);
                                } else {
                                    local_1 = false;
                                }
                                let _e223 = local_1;
                                if _e223 {
                                    let _e228 = light_data[u32(_e203)].position;
                                    let offset_1 = (midpoint - _e228.xyz);
                                    let _e231 = nearest_light_squared;
                                    nearest_light_squared = min(_e231, dot(offset_1, offset_1));
                                }
                                if !((light_mode == 2u)) {
                                    local_2 = (light_mode == 3u);
                                } else {
                                    local_2 = true;
                                }
                                let _e242 = local_2;
                                if _e242 {
                                    local_3 = (_e208 >= 0i);
                                } else {
                                    local_3 = false;
                                }
                                let _e248 = local_3;
                                if _e248 {
                                    let _e253 = light_data[u32(_e208)].position;
                                    let offset_2 = (midpoint - _e253.xyz);
                                    let _e256 = nearest_light_squared;
                                    nearest_light_squared = min(_e256, dot(offset_2, offset_2));
                                }
                            }
                            continuing {
                                let _e259 = owner_1;
                                owner_1 = (_e259 + 1u);
                            }
                        }
                        let _e262 = nearest_light_squared;
                        let subdivisions = select(1u, 4u, (_e262 < ((16f * ray_step) * ray_step)));
                        let sample_length = (segment_length / f32(subdivisions));
                        substep = 0u;
                        loop {
                            let _e274 = substep;
                            if (_e274 < subdivisions) {
                            } else {
                                break;
                            }
                            {
                                let _e276 = substep;
                                let sample_t = (segment_start + ((f32(_e276) + 0.5f) * sample_length));
                                let world_position_5 = (_e32 + (ray_direction * sample_t));
                                extinction = 0f;
                                source = vec3(0f);
                                emission = vec3(0f);
                                owner_2 = 0u;
                                loop {
                                    let _e294 = owner_2;
                                    if (_e294 < owner_count) {
                                    } else {
                                        break;
                                    }
                                    {
                                        let _e296 = owner_2;
                                        volume_owner = _e296;
                                        let _e300 = owner_2;
                                        let _e302 = volume_set.members[_e300];
                                        volume_params = _e302;
                                        let _e306 = volume_params.bounds_min;
                                        if !(any((world_position_5 < _e306.xyz))) {
                                            let _e313 = volume_params.bounds_max;
                                            local_4 = any((world_position_5 > _e313.xyz));
                                        } else {
                                            local_4 = true;
                                        }
                                        let _e320 = local_4;
                                        if !(_e320) {
                                            let _e325 = volume_params.optics.x;
                                            local_5 = (sample_t > _e325);
                                        } else {
                                            local_5 = true;
                                        }
                                        let _e330 = local_5;
                                        if _e330 {
                                            continue;
                                        }
                                        let _e331 = ray_box_interval(_e32, ray_direction);
                                        let _e336 = volume_params.optics.x;
                                        let member_far = min(_e331.y, _e336);
                                        let member_step = (max((member_far - _e331.x), EPSILON) / f32(visibility_depth));
                                        let _e346 = volume_params.light_direction;
                                        let _e354 = volume_params.optics.y;
                                        let _e355 = hg(dot(-(normalize(_e346.xyz)), ray_direction), _e354);
                                        let _e358 = volume_params.extinction;
                                        let sigma_scale = max(dot(_e358.xyz, vec3(0.3333333f)), 0f);
                                        let _e368 = volume_params.simulation.x;
                                        let _e369 = volume_scattering_density(world_position_5, _e368);
                                        let density_value = max(_e369, 0f);
                                        let sample_position = clamp((((sample_t - _e331.x) / member_step) - 0.5f), 0f, f32((visibility_depth - 1u)));
                                        let lower_position = u32(floor(sample_position));
                                        let upper_position = min((lower_position + 1u), (visibility_depth - 1u));
                                        let interpolation = (sample_position - f32(lower_position));
                                        let _e391 = owner_2;
                                        let slice_group = ((_e391 * owner_layers) + (lower_position / 4u));
                                        let _e396 = owner_2;
                                        let upper_group = ((_e396 * owner_layers) + (upper_position / 4u));
                                        let lower_packed = textureSampleLevel(froxel, froxel_sampler, uv_2, i32(slice_group), 0f);
                                        let upper_packed = textureSampleLevel(froxel, froxel_sampler, uv_2, i32(upper_group), 0f);
                                        let lower_visibility = lower_packed[i32((lower_position % 4u))];
                                        let upper_visibility = upper_packed[i32((upper_position % 4u))];
                                        let shadow_visibility = clamp(mix(lower_visibility, upper_visibility, interpolation), 0f, 1f);
                                        let _e426 = volume_params.optics.z;
                                        let mode_1 = u32(round(_e426));
                                        let _e429 = volume_spot_shadow_intensity();
                                        if !((mode_1 == 2u)) {
                                            local_6 = (mode_1 == 3u);
                                        } else {
                                            local_6 = true;
                                        }
                                        let _e440 = local_6;
                                        let visibility = select(shadow_visibility, mix(1f, shadow_visibility, _e429), _e440);
                                        let _e442 = volume_light_radiance(world_position_5);
                                        let _e444 = volume_light_radiance_pair(world_position_5, visibility);
                                        let radiance_2 = select((_e442 * visibility), _e444, (mode_1 == 3u));
                                        let sigma = (sigma_scale * density_value);
                                        let _e449 = extinction;
                                        extinction = (_e449 + sigma);
                                        let _e451 = source;
                                        let _e454 = volume_params.albedo;
                                        source = (_e451 + ((((radiance_2 * _e454.xyz) * _e355) * VOLUME_LIGHT_PHASE_SCALE) * sigma));
                                        let _e462 = emission;
                                        let _e465 = volume_params.emission;
                                        emission = (_e462 + (_e465.xyz * density_value));
                                    }
                                    continuing {
                                        let _e469 = owner_2;
                                        owner_2 = (_e469 + 1u);
                                    }
                                }
                                let _e472 = extinction;
                                let local_transmittance = exp((-(_e472) * sample_length));
                                let _e476 = source;
                                let _e480 = extinction;
                                let _e485 = emission;
                                let local_scatter = (((_e476 * (1f - local_transmittance)) / vec3(max(_e480, EPSILON))) + (_e485 * sample_length));
                                let _e490 = scattering;
                                let _e491 = transmittance;
                                scattering = (_e490 + (_e491 * local_scatter));
                                let _e494 = transmittance;
                                transmittance = (_e494 * local_transmittance);
                            }
                            continuing {
                                let _e496 = substep;
                                substep = (_e496 + 1u);
                            }
                        }
                    }
                }
                continuing {
                    let _e499 = step_;
                    step_ = (_e499 + 1u);
                }
            }
        }
        continuing {
            let _e502 = interval_index;
            interval_index = (_e502 + 1u);
        }
    }
    let _e505 = transmittance;
    let _e506 = isFinite(_e505);
    if _e506 {
        let _e507 = scattering;
        let _e508 = finiteVec3_(_e507);
        local_7 = _e508;
    } else {
        local_7 = false;
    }
    let finite = local_7;
    let _e518 = scattering;
    let _e519 = transmittance;
    let result = select(vec4<f32>(0f, 0f, 0f, 1f), vec4<f32>(_e518, _e519), finite);
    textureStore(resolved, id.xy, result);
    let _e528 = volume_set.scene.optics.w;
    if (_e528 < 0.5f) {
        textureStore(history_seed, id.xy, result);
        textureStore(temporal_seed, id.xy, result);
        return;
    } else {
        return;
    }
}
