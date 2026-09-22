struct SegmentInput {
    @location(0) start: vec3<f32>,
    @location(1) endpoint: vec3<f32>,
    @location(2) color: vec4<f32>,
    @location(3) properties: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) energy: f32,
    @location(1) rune_phase: f32,
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
    let energyWidth = (0.92f + (clamp(input.color.x, 0f, 1f) * 0.08f));
    let width = (input.properties.x * energyWidth);
    let overlap = (width * 0.16f);
    let point = mix(vec3<f32>((input.start.xy - (tangent * overlap)), input.start.z), vec3<f32>((input.endpoint.xy + (tangent * overlap)), input.endpoint.z), corner.x);
    output.position = vec4<f32>((point.xy + ((normal * corner.y) * width)), point.z, 1f);
    output.energy = input.color.x;
    output.rune_phase = input.color.y;
    output.circumference_t = clamp((input.color.z + (corner.x / 48f)), 0f, 1f);
    output.opacity = input.color.w;
    output.side = corner.y;
    let _e102 = output;
    return _e102;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let edge = clamp(abs(input_1.side), 0f, 1f);
    let broadBand = pow((1f - edge), 0.74f);
    let jadeLine = pow((1f - edge), 4.8f);
    let goldCore = pow((1f - edge), 14f);
    let cell = fract((input_1.circumference_t * 12f));
    let runeStem = (smoothstep(0.06f, 0.13f, cell) * (1f - smoothstep(0.34f, 0.48f, cell)));
    let runeCross = (smoothstep(0.55f, 0.62f, cell) * (1f - smoothstep(0.78f, 0.9f, cell)));
    let phaseGate = (0.72f + (0.28f * sin((input_1.rune_phase * 6.2831855f))));
    let rune = (clamp((runeStem + runeCross), 0f, 1f) * phaseGate);
    let green = ((vec3<f32>(0.025f, 0.38f, 0.1f) * broadBand) * (0.76f + (input_1.energy * 0.24f)));
    let jade = ((vec3<f32>(0.08f, 0.82f, 0.34f) * jadeLine) * (0.34f + (rune * 0.28f)));
    let gold = ((vec3<f32>(0.92f, 0.66f, 0.18f) * goldCore) * (0.16f + (rune * 0.3f)));
    let runeGlow = (((vec3<f32>(0.48f, 0.88f, 0.24f) * rune) * broadBand) * 0.2f);
    let alphaProfile = ((((broadBand * 0.46f) + (jadeLine * 0.2f)) + (goldCore * 0.08f)) + (rune * 0.07f));
    let alpha = clamp((input_1.opacity * alphaProfile), 0f, 0.76f);
    return vec4<f32>(((((green + jade) + gold) + runeGlow) * alpha), alpha);
}
