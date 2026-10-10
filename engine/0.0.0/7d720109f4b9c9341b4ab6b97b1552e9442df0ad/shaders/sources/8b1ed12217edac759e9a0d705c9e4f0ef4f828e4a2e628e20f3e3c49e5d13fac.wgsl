struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct FogViewParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX {
    color: vec3<f32>,
    density: f32,
    heightFalloff: f32,
    maxOpacity: f32,
}

struct FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX {
    origin: vec3<f32>,
    direction: vec3<f32>,
    distance: f32,
}

struct AnalyticFogParams {
    inverseViewProjection: mat4x4<f32>,
    cameraPosition: vec4<f32>,
    colorDensity: vec4<f32>,
    heightOpacityNearOrthographic: vec4<f32>,
}

@group(1) @binding(0) 
var sceneColor: texture_2d<f32>;
@group(1) @binding(1) 
var sceneSampler: sampler;
@group(1) @binding(2) 
var<uniform> params_2: AnalyticFogParams;
@group(1) @binding(3) 
var sceneDepth: texture_depth_2d;

fn fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    var x: f32 = -1f;
    var y: f32 = -1f;
    var out: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

    if (vertex_index == 1u) {
        x = 3f;
    }
    if (vertex_index == 2u) {
        y = 3f;
    }
    let _e10 = x;
    let u = ((_e10 + 1f) * 0.5f);
    let _e15 = y;
    let v = (1f - ((_e15 + 1f) * 0.5f));
    let _e24 = x;
    let _e25 = y;
    out.position = vec4<f32>(_e24, _e25, 0f, 1f);
    out.uv = vec2<f32>(u, v);
    let _e31 = out;
    return _e31;
}

fn fogOpticalDepthX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(params: FogViewParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX, ray: FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX) -> f32 {
    var integral: f32;

    let rho = (params.density * exp(clamp((-(params.heightFalloff) * ray.origin.y), -60f, 60f)));
    let t = clamp(((params.heightFalloff * ray.direction.y) * ray.distance), -60f, 60f);
    integral = ((1f - (t * 0.5f)) + ((t * t) / 6f));
    if (abs(t) >= 0.001f) {
        integral = ((1f - exp(-(t))) / t);
    }
    let _e41 = integral;
    return clamp(((rho * ray.distance) * _e41), 0f, 80f);
}

fn apply_fogX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(params_1: FogViewParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX, ray_1: FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX, color: vec4<f32>) -> vec4<f32> {
    let _e3 = fogOpticalDepthX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(params_1, ray_1);
    let opacity = (params_1.maxOpacity * (1f - exp(-(_e3))));
    return vec4<f32>(mix(color.xyz, params_1.color, opacity), color.w);
}

fn worldPosition(uv: vec2<f32>, depth: f32) -> vec3<f32> {
    let _e3 = params_2.inverseViewProjection;
    let projected = (_e3 * vec4<f32>(((uv.x * 2f) - 1f), (1f - (uv.y * 2f)), depth, 1f));
    return (projected.xyz / vec3(projected.w));
}

@vertex 
fn vs_main(@builtin(vertex_index) index: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(index);
    return _e1;
}

@fragment 
fn fs_main(input: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    var local: bool;
    var origin: vec3<f32>;

    let color_1 = textureSampleLevel(sceneColor, sceneSampler, input.uv, 0f);
    let size = textureDimensions(sceneDepth);
    let pixel = clamp(vec2<i32>((input.uv * vec2<f32>(size))), vec2(0i), (vec2<i32>(size) - vec2(1i)));
    let depth_1 = textureLoad(sceneDepth, pixel, 0i);
    if !((depth_1 >= 1f)) {
        let _e28 = params_2.colorDensity.w;
        local = (_e28 <= 0f);
    } else {
        local = true;
    }
    let _e34 = local;
    if _e34 {
        return color_1;
    }
    let _e36 = worldPosition(input.uv, depth_1);
    let _e39 = params_2.cameraPosition;
    origin = _e39.xyz;
    let _e45 = params_2.heightOpacityNearOrthographic.w;
    if (_e45 > 0.5f) {
        let _e50 = worldPosition(input.uv, 0f);
        let _e53 = worldPosition(input.uv, 1f);
        let direction = normalize((_e53 - _e50));
        let _e59 = params_2.heightOpacityNearOrthographic.z;
        origin = (_e50 - (direction * _e59));
    }
    let _e62 = origin;
    let delta = (_e36 - _e62);
    let distance_ = length(delta);
    if (distance_ < 0.00001f) {
        return color_1;
    }
    let _e69 = params_2.colorDensity;
    let _e74 = params_2.colorDensity.w;
    let _e78 = params_2.heightOpacityNearOrthographic.x;
    let _e82 = params_2.heightOpacityNearOrthographic.y;
    let fog = FogViewParamsX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(_e69.xyz, _e74, _e78, _e82);
    let _e84 = origin;
    let _e88 = apply_fogX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(fog, FogRayX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTGN5TQX(_e84, (delta / vec3(distance_)), distance_), color_1);
    return _e88;
}
