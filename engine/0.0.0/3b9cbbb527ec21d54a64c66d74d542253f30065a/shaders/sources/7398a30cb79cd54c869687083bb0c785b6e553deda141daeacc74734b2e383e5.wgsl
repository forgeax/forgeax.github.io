struct CloudLayerParameters {
    seed: u32,
    baseHeight: f32,
    thickness: f32,
    scale: f32,
    coverage: f32,
    density: f32,
    wind: vec3<f32>,
    timeSeconds: f32,
}

const CLOUD_VERTICAL_CELLS: f32 = 1f;
const CLOUD_VERTICAL_NOISE_CELLS: f32 = 2f;

@group(0) @binding(16) 
var cloudShadowMap: texture_2d<f32>;
@group(0) @binding(17) 
var cloudShadowSampler: sampler;

fn cloud_hash3_(cell: vec3<i32>, seed: u32) -> f32 {
    var h: u32;

    h = (bitcast<u32>(cell.x) * 73244475u);
    let _e6 = h;
    h = ((_e6 ^ (bitcast<u32>(cell.y) * 295559667u)) * 73244475u);
    let _e14 = h;
    h = ((_e14 ^ (bitcast<u32>(cell.z) * 214175u)) * 73244475u);
    let _e23 = h;
    h = (_e23 ^ seed);
    let _e25 = h;
    let _e26 = h;
    h = ((_e25 ^ (_e26 >> 16u)) * 73244475u);
    let _e32 = h;
    let _e33 = h;
    h = ((_e32 ^ (_e33 >> 13u)) * 668265261u);
    let _e39 = h;
    let _e40 = h;
    return (f32((_e39 ^ (_e40 >> 16u))) / 4294967300f);
}

fn cloud_wrap_cell(value: i32, period: i32) -> i32 {
    let wrapped = (value % period);
    return select(wrapped, (wrapped + period), (wrapped < 0i));
}

fn cloud_hash3_periodic(cell_1: vec3<i32>, seed_1: u32, periodX: i32, periodY: i32, periodZ: i32) -> f32 {
    let _e3 = cloud_wrap_cell(cell_1.x, periodX);
    let _e6 = cloud_wrap_cell(cell_1.y, periodY);
    let _e9 = cloud_wrap_cell(cell_1.z, periodZ);
    let _e12 = cloud_hash3_(vec3<i32>(_e3, _e6, _e9), seed_1);
    return _e12;
}

fn cloud_value_noise(position: vec3<f32>, seed_2: u32, periodX_1: i32, periodY_1: i32, periodZ_1: i32) -> f32 {
    let cell_2 = vec3<i32>(floor(position));
    let fraction = fract(position);
    let smoothFraction = ((fraction * fraction) * (vec3(3f) - (2f * fraction)));
    let _e20 = cloud_hash3_periodic((cell_2 + vec3<i32>(0i, 0i, 0i)), seed_2, periodX_1, periodY_1, periodZ_1);
    let _e26 = cloud_hash3_periodic((cell_2 + vec3<i32>(1i, 0i, 0i)), seed_2, periodX_1, periodY_1, periodZ_1);
    let _e32 = cloud_hash3_periodic((cell_2 + vec3<i32>(0i, 1i, 0i)), seed_2, periodX_1, periodY_1, periodZ_1);
    let _e38 = cloud_hash3_periodic((cell_2 + vec3<i32>(1i, 1i, 0i)), seed_2, periodX_1, periodY_1, periodZ_1);
    let _e44 = cloud_hash3_periodic((cell_2 + vec3<i32>(0i, 0i, 1i)), seed_2, periodX_1, periodY_1, periodZ_1);
    let _e50 = cloud_hash3_periodic((cell_2 + vec3<i32>(1i, 0i, 1i)), seed_2, periodX_1, periodY_1, periodZ_1);
    let _e56 = cloud_hash3_periodic((cell_2 + vec3<i32>(0i, 1i, 1i)), seed_2, periodX_1, periodY_1, periodZ_1);
    let _e62 = cloud_hash3_periodic((cell_2 + vec3<i32>(1i, 1i, 1i)), seed_2, periodX_1, periodY_1, periodZ_1);
    let x00_ = mix(_e20, _e26, smoothFraction.x);
    let x10_ = mix(_e32, _e38, smoothFraction.x);
    let x01_ = mix(_e44, _e50, smoothFraction.x);
    let x11_ = mix(_e56, _e62, smoothFraction.x);
    return mix(mix(x00_, x10_, smoothFraction.y), mix(x01_, x11_, smoothFraction.y), smoothFraction.z);
}

fn cloud_cellular_noise(position_1: vec3<f32>, seed_3: u32, periodXZ: i32, periodY_2: i32) -> f32 {
    var nearest: f32 = 1000000000f;
    var dz: i32 = -1i;
    var dy: i32;
    var dx: i32;

    let cell_3 = vec3<i32>(floor(position_1));
    let fraction_1 = fract(position_1);
    loop {
        dy = -1i;
        loop {
            dx = -1i;
            loop {
                let _e11 = dx;
                let _e12 = dy;
                let _e13 = dz;
                let _e21 = cloud_hash3_periodic((cell_3 + vec3<i32>(_e11, _e12, _e13)), (seed_3 ^ 2654435769u), periodXZ, periodY_2, periodXZ);
                let _e22 = dx;
                let _e30 = dy;
                let _e38 = dz;
                let point = vec3<f32>(((f32(_e22) + fract((_e21 * 17f))) - fraction_1.x), ((f32(_e30) + fract((_e21 * 31f))) - fraction_1.y), ((f32(_e38) + fract((_e21 * 47f))) - fraction_1.z));
                let _e48 = nearest;
                nearest = min(_e48, dot(point, point));
                let _e51 = dx;
                if (_e51 >= 1i) {
                    break;
                }
                let _e54 = dx;
                dx = (_e54 + 1i);
            }
            let _e57 = dy;
            if (_e57 >= 1i) {
                break;
            }
            let _e60 = dy;
            dy = (_e60 + 1i);
        }
        let _e63 = dz;
        if (_e63 >= 1i) {
            break;
        }
        let _e66 = dz;
        dz = (_e66 + 1i);
    }
    let _e69 = nearest;
    return (1f - clamp((sqrt(_e69) * 1.25f), 0f, 1f));
}

fn cloud_weather_field(position_2: vec3<f32>, seed_4: u32) -> f32 {
    let _e15 = cloud_value_noise(vec3<f32>((position_2.x * 2f), 0.37f, (position_2.z * 2f)), (seed_4 + 17041u), 2i, 1i, 2i);
    return smoothstep(0.34f, 0.66f, _e15);
}

fn cloud_formation_field(position_3: vec3<f32>, seed_5: u32) -> vec3<f32> {
    var noise: f32 = 0f;
    var weight: f32 = 0f;
    var amplitude: f32 = 0.5f;
    var frequency: f32 = 1f;
    var octave: u32 = 0u;

    let _e23 = cloud_value_noise(vec3<f32>((position_3.x * 2f), ((position_3.y * CLOUD_VERTICAL_NOISE_CELLS) + 3f), (position_3.z * 2f)), (seed_5 + 41023u), 2i, 2i, 2i);
    let macroWarpX = (_e23 - 0.5f);
    let _e45 = cloud_value_noise(vec3<f32>(((position_3.x * 2f) + 5f), ((position_3.y * CLOUD_VERTICAL_NOISE_CELLS) - 7f), (position_3.z * 2f)), (seed_5 + 41023u), 2i, 2i, 2i);
    let macroWarpZ = (_e45 - 0.5f);
    let bodyX = (position_3.x + (macroWarpX * 0.3f));
    let bodyZ = (position_3.z + (macroWarpZ * 0.3f));
    loop {
        let _e57 = octave;
        if (_e57 < 4u) {
        } else {
            break;
        }
        {
            let _e61 = frequency;
            let tilePeriod = (4f * _e61);
            let _e65 = noise;
            let _e68 = frequency;
            let _e74 = octave;
            let _e79 = frequency;
            let _e84 = cloud_value_noise(vec3<f32>((bodyX * tilePeriod), ((position_3.y * _e68) * CLOUD_VERTICAL_NOISE_CELLS), (bodyZ * tilePeriod)), (seed_5 + (_e74 * 1013u)), i32(tilePeriod), i32((_e79 * CLOUD_VERTICAL_NOISE_CELLS)), i32(tilePeriod));
            let _e86 = amplitude;
            noise = (_e65 + (_e84 * _e86));
            let _e90 = weight;
            let _e91 = amplitude;
            weight = (_e90 + _e91);
            let _e93 = amplitude;
            amplitude = (_e93 * 0.4f);
            let _e96 = frequency;
            frequency = (_e96 * 2f);
        }
        continuing {
            let _e99 = octave;
            octave = (_e99 + 1u);
        }
    }
    let _e102 = noise;
    let _e103 = weight;
    let broad = (_e102 / max(0.0001f, _e103));
    let _e119 = cloud_cellular_noise(vec3<f32>((bodyX * 4f), (position_3.y * CLOUD_VERTICAL_NOISE_CELLS), (bodyZ * 4f)), (seed_5 + 5011u), 4i, 2i);
    let base = clamp((((broad * 0.85f) + (_e119 * 0.15f)) + 0.15f), 0f, 1f);
    let _e130 = cloud_weather_field(position_3, seed_5);
    let detailPosition = (position_3 * 3f);
    let _e150 = cloud_value_noise(vec3<f32>((detailPosition.x * 2f), ((detailPosition.y * 2f) + 11f), (detailPosition.z * 2f)), (seed_5 + 29011u), 2i, 2i, 2i);
    let warpX = (_e150 - 0.5f);
    let _e172 = cloud_value_noise(vec3<f32>(((detailPosition.x * 2f) + 7f), ((detailPosition.y * 2f) - 5f), (detailPosition.z * 2f)), (seed_5 + 29011u), 2i, 2i, 2i);
    let warpZ = (_e172 - 0.5f);
    let _e195 = cloud_cellular_noise(vec3<f32>(((detailPosition.x + (warpX * 0.22f)) * 12f), (detailPosition.y * 3f), ((detailPosition.z + (warpZ * 0.22f)) * 12f)), (seed_5 + 7919u), 12i, 3i);
    return vec3<f32>(_e130, base, _e195);
}

fn cloud_height_profile(height: f32, body: f32, weather: f32) -> f32 {
    let lowerEdge = (0.05f + ((1f - body) * 0.1f));
    let crownEdge = min(0.96f, ((0.6f + (body * 0.3f)) + (weather * 0.08f)));
    let lower = smoothstep(lowerEdge, min(1f, (lowerEdge + 0.12f)), height);
    let upper = (1f - smoothstep(crownEdge, min(1f, (crownEdge + 0.14f)), height));
    return (lower * upper);
}

fn cloud_compose_density(height_1: f32, formation: vec3<f32>, coverage: f32) -> f32 {
    let threshold = (1f - (coverage * (0.45f + (formation.x * 0.55f))));
    let covered = smoothstep(0f, 0.4f, ((formation.y - threshold) / max(0.001f, (1f - threshold))));
    let _e23 = cloud_height_profile(height_1, formation.y, formation.x);
    let shaped = (covered * _e23);
    let erosion = ((1f - formation.z) * 0.18f);
    return clamp(((shaped - erosion) / (1f - erosion)), 0f, 1f);
}

fn cloud_density(params: CloudLayerParameters, worldPosition: vec3<f32>) -> f32 {
    var local: bool;
    var local_1: bool;
    var local_2: bool;

    let h_1 = ((worldPosition.y - params.baseHeight) / max(0.0001f, params.thickness));
    if !((h_1 <= 0f)) {
        local = (h_1 >= 1f);
    } else {
        local = true;
    }
    let _e17 = local;
    if !(_e17) {
        local_1 = (params.density <= 0f);
    } else {
        local_1 = true;
    }
    let _e25 = local_1;
    if !(_e25) {
        local_2 = (params.coverage <= 0f);
    } else {
        local_2 = true;
    }
    let _e33 = local_2;
    if _e33 {
        return 0f;
    }
    let advected = (worldPosition + (params.wind * params.timeSeconds));
    let advectedHeight = (h_1 + (((advected.y - worldPosition.y) * params.scale) / 1f));
    let p = vec3<f32>((advected.x * params.scale), (fract(advectedHeight) * CLOUD_VERTICAL_CELLS), (advected.z * params.scale));
    let _e58 = cloud_formation_field(p, params.seed);
    let _e60 = cloud_compose_density(h_1, _e58, params.coverage);
    return (_e60 * params.density);
}

fn cloud_optical_transmittance(opticalDepth: f32) -> f32 {
    return exp(-(max(0f, opticalDepth)));
}

fn cloud_direct_solar_factor(worldPosition_1: vec3<f32>, shadowOrigin: vec3<f32>, shadowRight: vec3<f32>, shadowUp: vec3<f32>, shadowProjection: vec4<f32>) -> f32 {
    var local_3: bool;
    var local_4: bool;
    var local_5: bool;
    var local_6: bool;
    var local_7: bool;
    var local_8: bool;
    var local_9: bool;
    var local_10: bool;

    if (worldPosition_1.x == worldPosition_1.x) {
        local_3 = (worldPosition_1.y == worldPosition_1.y);
    } else {
        local_3 = false;
    }
    let _e10 = local_3;
    if _e10 {
        local_4 = (worldPosition_1.z == worldPosition_1.z);
    } else {
        local_4 = false;
    }
    let _e17 = local_4;
    if _e17 {
        local_5 = all((abs(worldPosition_1) < vec3(3.402823e38f)));
    } else {
        local_5 = false;
    }
    let validReceiver = local_5;
    let offset = (worldPosition_1 - shadowOrigin);
    let uv = ((vec2<f32>(dot(offset, shadowRight), dot(offset, shadowUp)) / vec2(max(shadowProjection.x, 0.000001f))) + vec2(0.5f));
    if all((uv >= vec2(0f))) {
        local_6 = all((uv <= vec2(1f)));
    } else {
        local_6 = false;
    }
    let inRange = local_6;
    if (shadowProjection.y > 0.5f) {
        local_7 = (shadowProjection.z < 0.5f);
    } else {
        local_7 = false;
    }
    let _e64 = local_7;
    if _e64 {
        local_8 = (shadowProjection.x > 0f);
    } else {
        local_8 = false;
    }
    let available = local_8;
    let _e80 = textureSampleLevel(cloudShadowMap, cloudShadowSampler, clamp(uv, vec2(0f), vec2(1f)), 0f);
    let sampled = _e80.x;
    if validReceiver {
        local_9 = inRange;
    } else {
        local_9 = false;
    }
    let _e88 = local_9;
    if _e88 {
        local_10 = available;
    } else {
        local_10 = false;
    }
    let _e92 = local_10;
    return select(1f, clamp(sampled, 0f, 1f), _e92);
}

fn cloud_apply_direct_solar(radiance: vec3<f32>, worldPosition_2: vec3<f32>, shadowOrigin_1: vec3<f32>, shadowRight_1: vec3<f32>, shadowUp_1: vec3<f32>, shadowProjection_1: vec4<f32>) -> vec3<f32> {
    let _e5 = cloud_direct_solar_factor(worldPosition_2, shadowOrigin_1, shadowRight_1, shadowUp_1, shadowProjection_1);
    return (radiance * _e5);
}

