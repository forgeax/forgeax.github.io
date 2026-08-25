struct FullscreenOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

const EXPOSURE: f32 = 1.15f;
const VIGNETTE_STRENGTH: f32 = 0.55f;
const VIGNETTE_INNER: f32 = 0.45f;
const VIGNETTE_OUTER: f32 = 1.05f;
const CA_AMOUNT: f32 = 0.0014f;

@group(1) @binding(0) 
var screenTexture: texture_2d<f32>;
@group(1) @binding(1) 
var screenSampler: sampler;

fn aces(x_1: vec3<f32>) -> vec3<f32> {
    return clamp(((x_1 * ((2.51f * x_1) + vec3(0.03f))) / ((x_1 * ((2.43f * x_1) + vec3(0.59f))) + vec3(0.14f))), vec3(0f), vec3(1f));
}

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
    let center = vec2<f32>(0.5f, 0.5f);
    let toCenter = (in.uv - center);
    let dist = length(toCenter);
    let _e10 = textureSample(screenTexture, screenSampler, in.uv);
    let hdr = _e10.xyz;
    let _e14 = aces((hdr * EXPOSURE));
    let mask = smoothstep(VIGNETTE_INNER, VIGNETTE_OUTER, dist);
    let darken = (1f - (VIGNETTE_STRENGTH * mask));
    return vec4<f32>((_e14 * darken), 1f);
}
