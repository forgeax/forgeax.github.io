struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct BloomUpsampleParams {
    scatter: f32,
    pad0_: f32,
    pad1_: f32,
    pad2_: f32,
}

@group(0) @binding(0) 
var current: texture_2d<f32>;
@group(0) @binding(1) 
var coarse: texture_2d<f32>;
@group(0) @binding(2) 
var samp: sampler;
@group(0) @binding(3) 
var<uniform> params: BloomUpsampleParams;

fn clampLinearHdrX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(color: vec3<f32>) -> vec3<f32> {
    return clamp(color, vec3(0f), vec3(65504f));
}

fn fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index_1: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    var x: f32 = -1f;
    var y: f32 = -1f;
    var out: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

    if (vertex_index_1 == 1u) {
        x = 3f;
    }
    if (vertex_index_1 == 2u) {
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

fn tent(uv: vec2<f32>) -> vec3<f32> {
    let _e1 = textureDimensions(coarse);
    let coarseTexel = (vec2(1f) / vec2<f32>(_e1));
    let _e15 = textureSampleLevel(coarse, samp, (uv + (vec2<f32>(-1f, -1f) * coarseTexel)), 0f);
    let x0_ = _e15.xyz;
    let _e25 = textureSampleLevel(coarse, samp, (uv + (vec2<f32>(0f, -1f) * coarseTexel)), 0f);
    let x1_ = _e25.xyz;
    let _e35 = textureSampleLevel(coarse, samp, (uv + (vec2<f32>(1f, -1f) * coarseTexel)), 0f);
    let x2_ = _e35.xyz;
    let _e45 = textureSampleLevel(coarse, samp, (uv + (vec2<f32>(-1f, 0f) * coarseTexel)), 0f);
    let x3_ = _e45.xyz;
    let _e55 = textureSampleLevel(coarse, samp, (uv + (vec2<f32>(0f, 0f) * coarseTexel)), 0f);
    let x4_ = _e55.xyz;
    let _e65 = textureSampleLevel(coarse, samp, (uv + (vec2<f32>(1f, 0f) * coarseTexel)), 0f);
    let x5_ = _e65.xyz;
    let _e75 = textureSampleLevel(coarse, samp, (uv + (vec2<f32>(-1f, 1f) * coarseTexel)), 0f);
    let x6_ = _e75.xyz;
    let _e85 = textureSampleLevel(coarse, samp, (uv + (vec2<f32>(0f, 1f) * coarseTexel)), 0f);
    let x7_ = _e85.xyz;
    let _e95 = textureSampleLevel(coarse, samp, (uv + (vec2<f32>(1f, 1f) * coarseTexel)), 0f);
    let x8_ = _e95.xyz;
    return (((((((((x0_ + (2f * x1_)) + x2_) + (2f * x3_)) + (4f * x4_)) + (2f * x5_)) + x6_) + (2f * x7_)) + x8_) / vec3(16f));
}

@vertex 
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index);
    return _e1;
}

@fragment 
fn fs_main(in: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    let _e5 = textureSampleLevel(current, samp, in.uv, 0f);
    let currentColor = _e5.xyz;
    let _e8 = tent(in.uv);
    let _e11 = params.scatter;
    let scatter = clamp(_e11, 0f, 0.95f);
    let _e16 = clampLinearHdrX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(mix(currentColor, _e8, scatter));
    return vec4<f32>(_e16, 1f);
}
