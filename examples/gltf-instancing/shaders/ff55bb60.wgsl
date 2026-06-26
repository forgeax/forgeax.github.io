struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct BloomBlurParams {
    texelSizeX: f32,
    texelSizeY: f32,
    radius: f32,
    pad0_: f32,
}

@group(0) @binding(0) 
var src: texture_2d<f32>;
@group(0) @binding(1) 
var samp: sampler;
@group(0) @binding(2) 
var<uniform> params: BloomBlurParams;

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
    var result: vec3<f32>;

    let _e2 = params.texelSizeX;
    let _e5 = params.texelSizeY;
    let texelSize = vec2<f32>(_e2, _e5);
    let _e9 = params.radius;
    let r = clamp(_e9, 1f, 4f);
    let _e18 = textureSampleLevel(src, samp, in.uv, 0f);
    let center = _e18.xyz;
    result = (center * 0.227027f);
    let _e23 = result;
    let _e31 = textureSampleLevel(src, samp, (in.uv + (texelSize * 1f)), 0f);
    result = (_e23 + (_e31.xyz * 0.1945946f));
    let _e36 = result;
    let _e44 = textureSampleLevel(src, samp, (in.uv - (texelSize * 1f)), 0f);
    result = (_e36 + (_e44.xyz * 0.1945946f));
    if (r >= 2f) {
        let _e51 = result;
        let _e59 = textureSampleLevel(src, samp, (in.uv + (texelSize * 2f)), 0f);
        result = (_e51 + (_e59.xyz * 0.1216216f));
        let _e64 = result;
        let _e72 = textureSampleLevel(src, samp, (in.uv - (texelSize * 2f)), 0f);
        result = (_e64 + (_e72.xyz * 0.1216216f));
    } else {
        let _e77 = result;
        result = (_e77 + (center * 0.1216216f));
        let _e81 = result;
        result = (_e81 + (center * 0.1216216f));
    }
    if (r >= 3f) {
        let _e87 = result;
        let _e95 = textureSampleLevel(src, samp, (in.uv + (texelSize * 3f)), 0f);
        result = (_e87 + (_e95.xyz * 0.054054f));
        let _e100 = result;
        let _e108 = textureSampleLevel(src, samp, (in.uv - (texelSize * 3f)), 0f);
        result = (_e100 + (_e108.xyz * 0.054054f));
    } else {
        let _e113 = result;
        result = (_e113 + (center * 0.054054f));
        let _e117 = result;
        result = (_e117 + (center * 0.054054f));
    }
    if (r >= 4f) {
        let _e123 = result;
        let _e131 = textureSampleLevel(src, samp, (in.uv + (texelSize * 4f)), 0f);
        result = (_e123 + (_e131.xyz * 0.016216f));
        let _e136 = result;
        let _e144 = textureSampleLevel(src, samp, (in.uv - (texelSize * 4f)), 0f);
        result = (_e136 + (_e144.xyz * 0.016216f));
    } else {
        let _e149 = result;
        result = (_e149 + (center * 0.016216f));
        let _e153 = result;
        result = (_e153 + (center * 0.016216f));
    }
    let _e157 = result;
    return vec4<f32>(_e157, 1f);
}
