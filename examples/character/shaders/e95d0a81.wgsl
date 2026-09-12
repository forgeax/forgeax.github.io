struct VolumeTemporalView {
    _prefix: array<vec4<f32>, 6>,
    cameraPos: vec4<f32>,
    _lightViewProjA: mat4x4<f32>,
    inverseViewProj: mat4x4<f32>,
    _middle: array<vec4<f32>, 34>,
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

@group(0) @binding(0) 
var current: texture_2d<f32>;
@group(0) @binding(1) 
var accepted: texture_2d<f32>;
@group(0) @binding(2) 
var pending: texture_storage_2d<rgba16float,write>;
@group(0) @binding(3) 
var<uniform> volume_params: VolumeParams;
@group(0) @binding(4) 
var<uniform> volume_view: VolumeTemporalView;

fn bilinear(uv: vec2<f32>, size: vec2<u32>) -> vec4<f32> {
    let p = ((uv * vec2<f32>(size)) - vec2(0.5f));
    let base = vec2<i32>(floor(p));
    let f = fract(p);
    let max_coord = (vec2<i32>(size) - vec2(1i));
    let c00_ = textureLoad(accepted, clamp(base, vec2(0i), max_coord), 0i);
    let c10_ = textureLoad(accepted, clamp((base + vec2<i32>(1i, 0i)), vec2(0i), max_coord), 0i);
    let c01_ = textureLoad(accepted, clamp((base + vec2<i32>(0i, 1i)), vec2(0i), max_coord), 0i);
    let c11_ = textureLoad(accepted, clamp((base + vec2(1i)), vec2(0i), max_coord), 0i);
    return mix(mix(c00_, c10_, f.x), mix(c01_, c11_, f.x), f.y);
}

fn reproject_uv(uv_1: vec2<f32>) -> vec2<f32> {
    let current_ndc = vec4<f32>(((uv_1.x * 2f) - 1f), (1f - (uv_1.y * 2f)), 0.5f, 1f);
    let _e16 = volume_view.inverseViewProj;
    let world_h = (_e16 * current_ndc);
    let world = (world_h.xyz / vec3(max(abs(world_h.w), 0.00001f)));
    let _e27 = volume_view.temporalPreviousViewProj;
    let previous_clip = (_e27 * vec4<f32>(world, 1f));
    if (previous_clip.w <= 0.00001f) {
        return vec2(-1f);
    }
    let previous_ndc = (previous_clip.xyz / vec3(previous_clip.w));
    return vec2<f32>(((previous_ndc.x * 0.5f) + 0.5f), (1f - ((previous_ndc.y * 0.5f) + 0.5f)));
}

@compute @workgroup_size(8, 8, 1) 
fn volume_temporal(@builtin(global_invocation_id) id: vec3<u32>) {
    var lower: vec4<f32>;
    var upper: vec4<f32>;
    var oy: i32 = -1i;
    var ox: i32;
    var output: vec4<f32>;
    var local: bool;
    var local_1: bool;

    let size_1 = textureDimensions(current);
    if any((id.xy >= size_1)) {
        return;
    }
    let uv_2 = ((vec2<f32>(id.xy) + vec2(0.5f)) / vec2<f32>(size_1));
    let center = textureLoad(current, vec2<i32>(id.xy), 0i);
    lower = center;
    upper = center;
    loop {
        let _e22 = oy;
        if (_e22 <= 1i) {
        } else {
            break;
        }
        {
            ox = -1i;
            loop {
                let _e27 = ox;
                if (_e27 <= 1i) {
                } else {
                    break;
                }
                {
                    let _e32 = ox;
                    let _e33 = oy;
                    let coord = clamp((vec2<i32>(id.xy) + vec2<i32>(_e32, _e33)), vec2(0i), (vec2<i32>(size_1) - vec2(1i)));
                    let neighbor = textureLoad(current, coord, 0i);
                    let _e46 = lower;
                    lower = min(_e46, neighbor);
                    let _e48 = upper;
                    upper = max(_e48, neighbor);
                }
                continuing {
                    let _e50 = ox;
                    ox = (_e50 + 1i);
                }
            }
        }
        continuing {
            let _e53 = oy;
            oy = (_e53 + 1i);
        }
    }
    output = center;
    let _e60 = volume_params.optics.w;
    if (_e60 >= 0.5f) {
        let _e66 = volume_view.temporalPreviousCameraPos.w;
        local = (_e66 >= 0.5f);
    } else {
        local = false;
    }
    let historyValid = local;
    if historyValid {
        let _e73 = reproject_uv(uv_2);
        if all((_e73 >= vec2(0f))) {
            local_1 = all((_e73 <= vec2(1f)));
        } else {
            local_1 = false;
        }
        let _e85 = local_1;
        if _e85 {
            let _e86 = bilinear(_e73, size_1);
            let _e87 = lower;
            let _e88 = upper;
            let clamped = clamp(_e86, _e87, _e88);
            output = mix(center, clamped, 0.875f);
        }
    }
    let _e93 = output;
    textureStore(pending, id.xy, _e93);
    return;
}
