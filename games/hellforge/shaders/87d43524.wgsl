struct FullscreenOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct AtmosphereParams {
    vignette: f32,
    haze: f32,
    atmoTemp: f32,
    _pad: f32,
}

const VIGNETTE_INNER: f32 = 0.32f;
const VIGNETTE_OUTER: f32 = 1.05f;

@group(1) @binding(0) 
var screenTexture: texture_2d<f32>;
@group(1) @binding(1) 
var screenSampler: sampler;
@group(1) @binding(2) 
var<uniform> params: AtmosphereParams;

@vertex 
fn vs_main(@builtin(vertex_index) i: u32) -> FullscreenOutput {
    var x: f32 = -1f;
    var y: f32 = -1f;
    var out: FullscreenOutput;

    if (i == 1u) {
        x = 3f;
    }
    if (i == 2u) {
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

@fragment 
fn fs_main(in: FullscreenOutput) -> @location(0) vec4<f32> {
    var color: vec3<f32>;

    let _e4 = textureSample(screenTexture, screenSampler, in.uv);
    let hdr = _e4.xyz;
    let center = vec2<f32>(0.5f, 0.42f);
    let dist = length(((in.uv - center) * vec2<f32>(1.15f, 1f)));
    let vigMask = smoothstep(VIGNETTE_INNER, VIGNETTE_OUTER, dist);
    let _e21 = params.vignette;
    let vigStrength = clamp(_e21, 0f, 0.8f);
    color = (hdr * (1f - (vigStrength * vigMask)));
    let _e32 = params.haze;
    let hazeStr = clamp(_e32, 0f, 1f);
    let _e38 = params.atmoTemp;
    let t = clamp(_e38, -1f, 1f);
    let hazeColor = vec3<f32>((0.055f + (0.04f * t)), 0.018f, (0.01f - (0.006f * t)));
    let vault = smoothstep(0f, 0.28f, (1f - in.uv.y));
    let horizon = (smoothstep(0.35f, 0.72f, in.uv.y) * (1f - smoothstep(0.78f, 1f, in.uv.y)));
    let hazeW = (hazeStr * clamp(((0.55f * vault) + (0.85f * horizon)), 0f, 1f));
    let _e81 = color;
    color = mix(_e81, hazeColor, hazeW);
    let _e83 = color;
    return vec4<f32>(_e83, 1f);
}
