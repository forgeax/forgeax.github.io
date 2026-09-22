struct SegmentInput {
    @location(0) start: vec3<f32>,
    @location(1) endpoint: vec3<f32>,
    @location(2) color: vec4<f32>,
    @location(3) properties: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) caustic_phase: f32,
    @location(1) flow_t: f32,
    @location(2) opacity: f32,
    @location(3) side: f32,
}

@vertex 
fn vs_main(input: SegmentInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(0f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, 1f));
    let corner = corners[vertex_index];
    let delta = (input.endpoint.xy - input.start.xy);
    let normal = normalize((vec2<f32>(-(delta.y), delta.x) + vec2<f32>(0.000001f, 0f)));
    let point = mix(input.start, input.endpoint, corner.x);
    let sheet_width = (input.properties.x * max(0.18f, input.color.x));
    output.position = vec4<f32>((point.xy + ((normal * corner.y) * sheet_width)), point.z, 1f);
    output.caustic_phase = input.color.y;
    output.flow_t = (dot(point.xy, vec2<f32>(0.73f, 0.47f)) * 1.35f);
    output.opacity = input.color.w;
    output.side = corner.y;
    let _e73 = output;
    return _e73;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let edge = clamp(abs(input_1.side), 0f, 1f);
    let body = (1f - smoothstep(0.72f, 1f, edge));
    let interior = (1f - smoothstep(0.1f, 0.88f, edge));
    let upper_rim = (smoothstep(0.48f, 0.9f, input_1.side) * (1f - smoothstep(0.9f, 1f, input_1.side)));
    let lower_edge = (smoothstep(0.72f, 0.97f, -(input_1.side)) * (1f - smoothstep(0.97f, 1f, -(input_1.side))));
    let flowing = (0.5f + (0.5f * sin(((input_1.flow_t * 12.566371f) + (input_1.caustic_phase * 6.2831855f)))));
    let counter_flow = (0.5f + (0.5f * sin(((input_1.flow_t * 18.849556f) - (input_1.caustic_phase * 6.2831855f)))));
    let caustic = smoothstep(0.76f, 0.98f, ((flowing * 0.76f) + (counter_flow * 0.24f)));
    let deep_water = vec3<f32>(0.004f, 0.075f, 0.24f);
    let clear_blue = vec3<f32>(0.012f, 0.3f, 0.59f);
    let shallow_cyan = vec3<f32>(0.055f, 0.54f, 0.73f);
    let reflected_sky = vec3<f32>(0.4f, 0.76f, 0.86f);
    let depth_color = mix(deep_water, clear_blue, ((interior * 0.68f) + (body * 0.16f)));
    let water_color = mix(depth_color, shallow_cyan, ((upper_rim * 0.36f) + (lower_edge * 0.08f)));
    let radiance = mix(water_color, reflected_sky, ((upper_rim * 0.16f) + ((caustic * interior) * 0.055f)));
    let alpha_profile = (((((body * 0.4f) + (interior * 0.2f)) + (upper_rim * 0.085f)) + (lower_edge * 0.022f)) + ((caustic * interior) * 0.018f));
    let alpha = clamp((input_1.opacity * alpha_profile), 0f, 0.76f);
    return vec4<f32>((radiance * alpha), alpha);
}
