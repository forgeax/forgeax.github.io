struct DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    position: vec4<f32>,
    colorTimesIntensity: vec4<f32>,
    direction: vec4<f32>,
    auxiliary: vec4<f32>,
    metadata: vec4<u32>,
}

struct View {
    worldViewProj: mat4x4<f32>,
    lightDir: vec3<f32>,
    lightColor: vec3<f32>,
    cameraPos: vec3<f32>,
    lightViewProj_A: mat4x4<f32>,
    inverseViewProj: mat4x4<f32>,
    lightViewProj_B: mat4x4<f32>,
    lightViewProj_C: mat4x4<f32>,
    lightViewProj_D: mat4x4<f32>,
    splitPlanes: array<vec4<f32>, 4>,
    cascadeCount: f32,
    cascadeBlend: f32,
    depthBias: f32,
    normalBias: f32,
    directionalShadowFilter: vec4<f32>,
    spotLightViewProj: array<mat4x4<f32>, 4>,
    temporalCurrentViewProj: mat4x4<f32>,
    temporalPreviousViewProj: mat4x4<f32>,
    temporalProjection: vec4<f32>,
    temporalPreviousCameraPos: vec4<f32>,
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

struct ClusterUniform {
    grid: vec4<u32>,
    near_far_log: vec4<f32>,
}

const DIRECT_LIGHT_METADATA_SENTINEL: u32 = 4294967295u;
const DIRECT_LIGHT_TILE_MASK: u32 = 1073741823u;

@group(0) @binding(3) 
var shadowMap_1: texture_depth_2d;
@group(0) @binding(4) 
var shadowSampler_1: sampler_comparison;
@group(0) @binding(5) 
var<uniform> volume_params: VolumeParams;
@group(0) @binding(6) 
var volume_froxel: texture_storage_2d_array<rgba8unorm,write>;
@group(0) @binding(7) 
var<storage> light_data: array<DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, 256>;
@group(0) @binding(8) 
var<uniform> cluster_uniform: ClusterUniform;
@group(0) @binding(0) 
var<uniform> view: View;

fn sample_shadow_2d_kernelX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMap: texture_depth_2d, shadowSampler: sampler_comparison, uv: vec2<f32>, texel: vec2<f32>, depthRef: f32, normalBias: f32, depthBias: f32, nDotL: f32, kernelSize: f32) -> f32 {
    var blocked: f32 = 0f;
    var samples: f32 = 0f;
    var y: i32 = -2i;
    var x: i32;
    var local_2: bool;

    let bias = max((normalBias * (1f - nDotL)), (depthBias / 1000f));
    let adjustedDepth = (depthRef - bias);
    let halfWidth = clamp(((i32(round(kernelSize)) - 1i) / 2i), 0i, 2i);
    loop {
        let _e24 = y;
        if (_e24 <= 2i) {
        } else {
            break;
        }
        {
            x = -2i;
            loop {
                let _e29 = x;
                if (_e29 <= 2i) {
                } else {
                    break;
                }
                {
                    let _e32 = x;
                    if (abs(_e32) <= halfWidth) {
                        let _e35 = y;
                        local_2 = (abs(_e35) <= halfWidth);
                    } else {
                        local_2 = false;
                    }
                    let _e41 = local_2;
                    if _e41 {
                        let _e44 = x;
                        let _e46 = y;
                        let offsetUv = (uv + (vec2<f32>(f32(_e44), f32(_e46)) * texel));
                        let lit = textureSampleCompareLevel(shadowMap, shadowSampler, offsetUv, adjustedDepth);
                        let _e55 = blocked;
                        blocked = (_e55 + (1f - lit));
                        let _e60 = samples;
                        samples = (_e60 + 1f);
                    }
                }
                continuing {
                    let _e63 = x;
                    x = (_e63 + 1i);
                }
            }
        }
        continuing {
            let _e66 = y;
            y = (_e66 + 1i);
        }
    }
    let _e69 = blocked;
    let _e70 = samples;
    return (1f - (_e69 / max(_e70, 1f)));
}

fn projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(lightViewProj: mat4x4<f32>, worldPos: vec3<f32>) -> vec2<f32> {
    let clip = (lightViewProj * vec4<f32>(worldPos, 1f));
    let invW = select((1f / clip.w), 0f, (abs(clip.w) < 0.000001f));
    return vec2<f32>((((clip.x * invW) * 0.5f) + 0.5f), (((clip.y * invW) * -0.5f) + 0.5f));
}

fn reconstruct_world(uv_1: vec2<f32>, depth: f32) -> vec3<f32> {
    let ndc = vec4<f32>(((uv_1.x * 2f) - 1f), (1f - (uv_1.y * 2f)), depth, 1f);
    let _e16 = view.inverseViewProj;
    let world = (_e16 * ndc);
    return (world.xyz / vec3(max(abs(world.w), 0.00001f)));
}

fn ray_box_interval(origin: vec3<f32>, direction: vec3<f32>, box_min: vec3<f32>, box_max: vec3<f32>) -> vec2<f32> {
    let safe_direction = select(direction, vec3(0.00001f), (abs(direction) < vec3(0.00001f)));
    let reciprocal = (vec3(1f) / safe_direction);
    let near_point = ((box_min - origin) * reciprocal);
    let far_point = ((box_max - origin) * reciprocal);
    let near_distance = max(max(min(near_point.x, far_point.x), min(near_point.y, far_point.y)), min(near_point.z, far_point.z));
    let far_distance = min(min(max(near_point.x, far_point.x), max(near_point.y, far_point.y)), max(near_point.z, far_point.z));
    return vec2<f32>(max(near_distance, 0f), max(far_distance, near_distance));
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

fn dither_unorm8_(value_1: f32, noise: f32) -> f32 {
    return clamp((value_1 + ((noise - 0.5f) / 255f)), 0f, 1f);
}

fn camera_view_depth(world_position: vec3<f32>) -> f32 {
    let _e2 = view.temporalCurrentViewProj;
    let clip_1 = (_e2 * vec4<f32>(world_position, 1f));
    let ndc_depth = (clip_1.z / max(abs(clip_1.w), 0.00001f));
    let _e16 = view.temporalProjection.x;
    let _e20 = view.temporalProjection.y;
    let _e24 = view.temporalProjection.x;
    let orthographic_depth = (_e16 + (ndc_depth * (_e20 - _e24)));
    let _e36 = view.temporalProjection.z;
    return select(max(clip_1.w, 0f), max(orthographic_depth, 0f), (_e36 >= 0.5f));
}

fn volume_cascade(world_position_1: vec3<f32>, view_depth: f32) -> f32 {
    var layer: u32;
    var index: u32 = 0u;
    var light_matrix: mat4x4<f32>;
    var local_3: bool;
    var local_4: bool;
    var local_5: bool;
    var local_6: bool;

    let _e3 = view.cascadeCount;
    if (_e3 < 1f) {
        return 1f;
    }
    let _e9 = view.cascadeCount;
    let count = u32(max(_e9, 1f));
    let _e20 = view.splitPlanes[(count - 1u)].x;
    if (view_depth > _e20) {
        return 1f;
    }
    layer = (count - 1u);
    loop {
        let _e27 = index;
        if (_e27 < (count - 1u)) {
        } else {
            break;
        }
        {
            let _e33 = index;
            let _e36 = view.splitPlanes[_e33].x;
            if (view_depth < _e36) {
                let _e38 = index;
                layer = _e38;
                break;
            }
        }
        continuing {
            let _e39 = index;
            index = (_e39 + 1u);
        }
    }
    let _e44 = view.lightViewProj_D;
    light_matrix = _e44;
    let _e46 = layer;
    switch _e46 {
        case 0u: {
            let _e49 = view.lightViewProj_A;
            light_matrix = _e49;
        }
        case 1u: {
            let _e52 = view.lightViewProj_B;
            light_matrix = _e52;
        }
        case 2u: {
            let _e55 = view.lightViewProj_C;
            light_matrix = _e55;
        }
        default: {
        }
    }
    let _e56 = light_matrix;
    let clip_2 = (_e56 * vec4<f32>(world_position_1, 1f));
    let projected = (clip_2.xyz / vec3(max(abs(clip_2.w), 0.00001f)));
    let columns = select(2u, 1u, (count <= 1u));
    let rows = (((count + columns) - 1u) / columns);
    let _e77 = layer;
    let _e79 = layer;
    let tile = vec2<u32>((_e77 % columns), (_e79 / columns));
    let tile_scale = (vec2(1f) / vec2<f32>(f32(columns), f32(rows)));
    let tile_uv = vec2<f32>(((projected.x * 0.5f) + 0.5f), ((-(projected.y) * 0.5f) + 0.5f));
    if (tile_uv.x >= 0f) {
        local_3 = (tile_uv.x <= 1f);
    } else {
        local_3 = false;
    }
    let _e109 = local_3;
    if _e109 {
        local_4 = (tile_uv.y >= 0f);
    } else {
        local_4 = false;
    }
    let _e116 = local_4;
    if _e116 {
        local_5 = (tile_uv.y <= 1f);
    } else {
        local_5 = false;
    }
    let _e123 = local_5;
    if _e123 {
        local_6 = (projected.z <= 1f);
    } else {
        local_6 = false;
    }
    let _e130 = local_6;
    if !(_e130) {
        return 1f;
    }
    let uv_2 = ((tile_uv * tile_scale) + (vec2<f32>(tile) * tile_scale));
    let _e138 = textureDimensions(shadowMap_1);
    let shadow_size = vec2<f32>(_e138);
    let _e143 = view.directionalShadowFilter.x;
    let filter_profile = clamp(u32(round(_e143)), 1u, 5u);
    let volume_kernel = select(select(select(3f, 5f, (filter_profile == 3u)), 1f, (filter_profile == 1u)), 3f, (filter_profile >= 4u));
    let _e168 = view.depthBias;
    let _e173 = sample_shadow_2d_kernelX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMap_1, shadowSampler_1, uv_2, (vec2(1f) / shadow_size), projected.z, 0f, _e168, 1f, volume_kernel);
    return _e173;
}

fn shadowAtlasTile(light: DirectLightSlotX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> i32 {
    let encoded = light.metadata.y;
    if (encoded == DIRECT_LIGHT_METADATA_SENTINEL) {
        return -1i;
    }
    let tile_1 = (encoded & DIRECT_LIGHT_TILE_MASK);
    if (tile_1 >= 4u) {
        return -1i;
    }
    return i32(tile_1);
}

fn selected_cluster_light_slot(value_2: f32) -> i32 {
    var local_7: bool;

    let slot = i32(round(value_2));
    if (slot < 0i) {
        return -1i;
    }
    let index_1 = u32(slot);
    let _e10 = cluster_uniform.grid.w;
    if !((index_1 >= _e10)) {
        local_7 = (index_1 >= 256u);
    } else {
        local_7 = true;
    }
    let _e18 = local_7;
    if _e18 {
        return -1i;
    }
    return slot;
}

fn spot_shadow_visibility_at(world_position_2: vec3<f32>) -> f32 {
    var local_8: bool;
    var local_9: bool;
    var local_10: bool;

    let _e3 = volume_params.light_color.w;
    let _e4 = selected_cluster_light_slot(_e3);
    if (_e4 < 0i) {
        return 0f;
    }
    let light_1 = light_data[u32(_e4)];
    let _e12 = shadowAtlasTile(light_1);
    if (_e12 < 0i) {
        return 1f;
    }
    let tile_2 = u32(_e12);
    let _e20 = view.spotLightViewProj[tile_2];
    let _e22 = projectSpotUvX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU3DJM5UHI2LOM5PWC5DUMVXHKYLUNFXW4X(_e20, world_position_2);
    let projectorRevision = volume_params.light_color.w;
    let _e30 = view.spotLightViewProj[tile_2];
    let clip_3 = (_e30 * vec4<f32>(world_position_2, 1f));
    if (clip_3.w <= 0.00001f) {
        return 1f;
    }
    let projected_1 = (clip_3.xyz / vec3(clip_3.w));
    let local_uv = vec2<f32>(((projected_1.x * 0.5f) + 0.5f), ((-(projected_1.y) * 0.5f) + 0.5f));
    if !(any((_e22 < vec2(0f)))) {
        local_8 = any((_e22 > vec2(1f)));
    } else {
        local_8 = true;
    }
    let _e66 = local_8;
    if _e66 {
        return 1f;
    }
    if !(any((local_uv < vec2(0f)))) {
        local_9 = any((local_uv > vec2(1f)));
    } else {
        local_9 = true;
    }
    let _e80 = local_9;
    if !(_e80) {
        local_10 = (projected_1.z > 1f);
    } else {
        local_10 = true;
    }
    let _e88 = local_10;
    if _e88 {
        return 1f;
    }
    let atlas_uv = ((local_uv * 0.5f) + (vec2<f32>(f32((tile_2 & 1u)), f32((tile_2 >> 1u))) * 0.5f));
    let _e103 = textureDimensions(shadowMap_1);
    let shadow_size_1 = vec2<f32>(_e103);
    let _e117 = sample_shadow_2d_kernelX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DU43IMFSG6527OBRWMX(shadowMap_1, shadowSampler_1, atlas_uv, (vec2(1f) / shadow_size_1), projected_1.z, light_1.auxiliary.y, light_1.auxiliary.x, 1f, 3f);
    return _e117;
}

fn shadow_visibility_at(ray_origin: vec3<f32>, ray_direction: vec3<f32>, slice: f32) -> f32 {
    var local_11: bool;
    var local_12: bool;

    let _e2 = volume_params.bounds_min;
    let _e6 = volume_params.bounds_max;
    let _e10 = ray_box_interval(ray_origin, ray_direction, _e2.xyz, _e6.xyz);
    let ray_near = _e10.x;
    let _e16 = volume_params.optics.x;
    let ray_limit = max(ray_near, min(_e10.y, _e16));
    let ray_t = mix(ray_near, ray_limit, slice);
    let world_position_3 = (ray_origin + (ray_direction * ray_t));
    let _e25 = volume_params.bounds_min;
    if all((world_position_3 >= _e25.xyz)) {
        let _e31 = volume_params.bounds_max;
        local_11 = all((world_position_3 <= _e31.xyz));
    } else {
        local_11 = false;
    }
    let _e38 = local_11;
    if _e38 {
        local_12 = (ray_limit > ray_near);
    } else {
        local_12 = false;
    }
    let in_bounds = local_12;
    let _e44 = camera_view_depth(world_position_3);
    let _e45 = volume_cascade(world_position_3, _e44);
    return select(0f, _e45, in_bounds);
}

@compute @workgroup_size(8, 8, 1) 
fn volume_inject(@builtin(global_invocation_id) id: vec3<u32>) {
    var local: bool;
    var visibility: vec4<f32> = vec4(0f);
    var channel: u32 = 0u;
    var local_1: bool;

    let volume_size = textureDimensions(volume_froxel);
    if !((id.x >= volume_size.x)) {
        local = (id.y >= volume_size.y);
    } else {
        local = true;
    }
    let _e16 = local;
    if _e16 {
        return;
    }
    let _e18 = textureDimensions(volume_froxel);
    let froxel_size = vec2<f32>(_e18.xy);
    let frame_phase = volume_params.light_direction.w;
    let frame_index_1 = u32(max(frame_phase, 0f));
    let _e29 = froxel_seed(id, 2654435761u);
    let _e31 = stratified32_(_e29, frame_index_1, 5u);
    let _e33 = froxel_seed(id, 2246822519u);
    let _e35 = stratified32_(_e33, frame_index_1, 11u);
    let xy_noise = (vec2<f32>(_e31, _e35) - vec2(0.5f));
    let depth_uv = clamp((((vec2<f32>(id.xy) + vec2(0.5f)) + (xy_noise * 0.75f)) / froxel_size), vec2(0f), vec2(1f));
    let _e55 = reconstruct_world(depth_uv, 0f);
    let _e57 = reconstruct_world(depth_uv, 1f);
    let ray_direction_1 = normalize((_e57 - _e55));
    let _e62 = volume_params.bounds_min;
    let _e66 = volume_params.bounds_max;
    let _e68 = ray_box_interval(_e55, ray_direction_1, _e62.xyz, _e66.xyz);
    let ray_near_1 = _e68.x;
    let _e74 = volume_params.optics.x;
    let ray_limit_1 = max(ray_near_1, min(_e68.y, _e74));
    let _e78 = textureNumLayers(volume_froxel);
    let logical_depth = max((_e78 * 4u), 1u);
    loop {
        let _e84 = channel;
        if (_e84 < 4u) {
        } else {
            break;
        }
        {
            let _e90 = channel;
            let logical_slice = ((id.z * 4u) + _e90);
            if (logical_slice >= logical_depth) {
                continue;
            }
            let slice_1 = clamp(((f32(logical_slice) + 0.5f) / f32(logical_depth)), 0f, 1f);
            let slice_world = (_e55 + (ray_direction_1 * mix(ray_near_1, ray_limit_1, slice_1)));
            let _e107 = volume_params.optics.z;
            let mode = u32(round(_e107));
            let _e111 = channel;
            let _e113 = shadow_visibility_at(_e55, ray_direction_1, slice_1);
            let _e114 = spot_shadow_visibility_at(slice_world);
            if !((mode == 2u)) {
                local_1 = (mode == 3u);
            } else {
                local_1 = true;
            }
            let _e123 = local_1;
            visibility[_e111] = select(_e113, _e114, _e123);
        }
        continuing {
            let _e125 = channel;
            channel = (_e125 + 1u);
        }
    }
    let _e129 = froxel_seed(id, 3812015801u);
    let _e131 = stratified32_(_e129, frame_index_1, 11u);
    let _e133 = visibility.x;
    let _e134 = dither_unorm8_(_e133, _e131);
    let _e136 = visibility.y;
    let _e137 = dither_unorm8_(_e136, _e131);
    let _e139 = visibility.z;
    let _e140 = dither_unorm8_(_e139, _e131);
    let _e142 = visibility.w;
    let _e143 = dither_unorm8_(_e142, _e131);
    visibility = vec4<f32>(_e134, _e137, _e140, _e143);
    let _e147 = visibility;
    textureStore(volume_froxel, id.xy, id.z, _e147);
    return;
}
