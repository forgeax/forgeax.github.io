struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct BloomCompositeParams {
    intensity: f32,
    pad0_: f32,
    pad1_: f32,
    pad2_: f32,
}

@group(0) @binding(0) 
var hdrColor: texture_2d<f32>;
@group(0) @binding(1) 
var bloomBlurV: texture_2d<f32>;
@group(0) @binding(2) 
var samp: sampler;
@group(0) @binding(3) 
var<uniform> params: BloomCompositeParams;

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

@vertex 
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index);
    return _e1;
}

@fragment 
fn fs_main(in: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    let _e5 = textureSampleLevel(hdrColor, samp, in.uv, 0f);
    let scene = _e5.xyz;
    let _e11 = textureSampleLevel(bloomBlurV, samp, in.uv, 0f);
    let bloom = _e11.xyz;
    let _e15 = params.intensity;
    let result = (scene + (_e15 * bloom));
    return vec4<f32>(result, 1f);
}
