struct SegmentInput {
    @location(0) start: vec3<f32>,
    @location(1) endpoint: vec3<f32>,
    @location(2) color: vec4<f32>,
    @location(3) properties: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) band_pulse: f32,
    @location(1) knot: f32,
    @location(2) circumference_t: f32,
    @location(3) opacity: f32,
    @location(4) side: f32,
}

@vertex 
fn vs_main(input: SegmentInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(0f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, 1f));
    let corner = corners[vertex_index];
    let delta = (input.endpoint.xy - input.start.xy);
    let tangent = normalize((delta + vec2<f32>(0.000001f, 0f)));
    let normal = normalize((vec2<f32>(-(delta.y), delta.x) + vec2<f32>(0.000001f, 0f)));
    let widthScale = max(0.62f, min(input.color.x, 1.92f));
    let overlap = ((input.properties.x * widthScale) * 0.14f);
    let point = mix(vec3<f32>((input.start.xy - (tangent * overlap)), input.start.z), vec3<f32>((input.endpoint.xy + (tangent * overlap)), input.endpoint.z), corner.x);
    output.position = vec4<f32>((point.xy + (((normal * corner.y) * input.properties.x) * widthScale)), point.z, 1f);
    output.band_pulse = input.color.x;
    output.knot = input.color.y;
    output.circumference_t = clamp((input.color.z + (corner.x * 0.015625f)), 0f, 1f);
    output.opacity = input.color.w;
    output.side = corner.y;
    let _e102 = output;
    return _e102;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let edge = clamp(abs(input_1.side), 0f, 1f);
    let broadBand = pow((1f - edge), 0.82f);
    let innerBand = pow((1f - edge), 3.8f);
    let thread = pow((1f - edge), 12f);
    let cell = fract(((input_1.circumference_t * 13f) + 0.17f));
    let sparseCell = (smoothstep(0.04f, 0.1f, cell) * (1f - smoothstep(0.18f, 0.3f, cell)));
    let knot = (clamp(input_1.knot, 0f, 1f) * sparseCell);
    let pulse = clamp(input_1.band_pulse, 0f, 1f);
    let burstEnergy = clamp((input_1.band_pulse - 1f), 0f, 0.92f);
    let violet = ((vec3<f32>(0.26f, 0.025f, 0.62f) * broadBand) * (0.72f + (pulse * 0.3f)));
    let magenta = ((vec3<f32>(0.54f, 0.045f, 0.78f) * innerBand) * 0.52f);
    let cyan = ((vec3<f32>(0.03f, 0.7f, 0.94f) * knot) * (0.52f + (thread * 0.36f)));
    let whiteKnot = (((vec3<f32>(0.72f, 0.9f, 1f) * knot) * thread) * 0.34f);
    let burstViolet = ((vec3<f32>(0.42f, 0.045f, 0.76f) * burstEnergy) * ((broadBand * 1.02f) + (innerBand * 1.1f)));
    let burstMagenta = (((vec3<f32>(0.74f, 0.09f, 0.56f) * burstEnergy) * innerBand) * 0.82f);
    let alphaProfile = (((broadBand * (0.34f + (burstEnergy * 0.3f))) + (innerBand * (0.21f + (burstEnergy * 0.18f)))) + (knot * 0.16f));
    let alpha = clamp((input_1.opacity * alphaProfile), 0f, 0.9f);
    return vec4<f32>(((((((violet + magenta) + cyan) + whiteKnot) + burstViolet) + burstMagenta) * alpha), alpha);
}
