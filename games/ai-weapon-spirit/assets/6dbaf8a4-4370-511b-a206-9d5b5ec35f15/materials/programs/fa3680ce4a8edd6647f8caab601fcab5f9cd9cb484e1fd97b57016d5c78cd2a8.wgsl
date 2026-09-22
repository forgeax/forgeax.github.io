struct SegmentInput {
    @location(0) start: vec3<f32>,
    @location(1) endpoint: vec3<f32>,
    @location(2) color: vec4<f32>,
    @location(3) properties: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) energy: f32,
    @location(1) flow: f32,
    @location(2) circumference_t: f32,
    @location(3) opacity: f32,
    @location(4) side: f32,
    @location(5) is_impact: f32,
    @location(6) is_inner: f32,
}

@vertex 
fn vs_main(input: SegmentInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(0f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, 1f));
    let corner = corners[vertex_index];
    let delta = (input.endpoint.xy - input.start.xy);
    let normal = normalize((vec2<f32>(-(delta.y), delta.x) + vec2<f32>(0.000001f, 0f)));
    let point = mix(input.start, input.endpoint, corner.x);
    let is_impact = step(1.5f, input.color.y);
    let is_inner = step(1.5f, input.color.z);
    output.position = vec4<f32>((point.xy + (((normal * corner.y) * input.properties.x) * max(0.12f, input.color.x))), point.z, 1f);
    output.energy = input.color.x;
    output.flow = (input.color.y - (is_impact * 2f));
    output.circumference_t = (input.color.z - (is_inner * 2f));
    output.opacity = input.color.w;
    output.side = corner.y;
    output.is_impact = is_impact;
    output.is_inner = is_inner;
    let _e87 = output;
    return _e87;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let edge = clamp(abs(input_1.side), 0f, 1f);
    let halo = pow((1f - edge), 0.88f);
    let core = pow((1f - edge), 9f);
    let rune_phase = fract(((input_1.circumference_t * 12f) + (input_1.flow * 0.24f)));
    let rune = mix(0.18f, 1f, step(0.34f, rune_phase));
    let hotspot = pow((0.5f + (0.5f * cos(((input_1.circumference_t * 37.699112f) + (input_1.flow * 2.4f))))), 18f);
    let inner_alpha = mix(1f, 1.22f, input_1.is_inner);
    let alpha = clamp((((input_1.opacity * inner_alpha) * rune) * max(core, (halo * 0.38f))), 0f, 1f);
    let cold = mix(vec3<f32>(0.018f, 0.16f, 0.9f), vec3<f32>(0.1f, 0.82f, 1f), halo);
    let impact_outer = (input_1.is_impact * (1f - input_1.is_inner));
    let impact_inner = (input_1.is_impact * input_1.is_inner);
    let caster_inner = ((1f - input_1.is_impact) * input_1.is_inner);
    let radiance = (((((cold * ((0.72f + (input_1.energy * 0.48f)) + (impact_outer * 0.46f))) + ((vec3<f32>(0.9f, 0.99f, 1f) * core) * (1.35f + (hotspot * 0.95f)))) + ((vec3<f32>(0.94f, 0.99f, 1f) * core) * ((caster_inner * 0.78f) + (impact_inner * 0.95f)))) + (((vec3<f32>(1f, 0.48f, 0.06f) * input_1.flow) * core) * (0.42f + (impact_inner * 0.92f)))) + (((vec3<f32>(0.05f, 0.72f, 1f) * halo) * impact_outer) * 0.72f));
    return vec4<f32>((radiance * alpha), alpha);
}
