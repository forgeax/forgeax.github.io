struct SegmentInput {
    @location(0) start: vec3<f32>,
    @location(1) endpoint: vec3<f32>,
    @location(2) color: vec4<f32>,
    @location(3) properties: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) side: f32,
}

@vertex 
fn vs_main(input: SegmentInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(0f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, 1f));
    let corner = corners[vertex_index];
    let delta = (input.endpoint.xy - input.start.xy);
    let normal = normalize((vec2<f32>(-(delta.y), delta.x) + vec2<f32>(0.000001f, 0f)));
    let point = mix(input.start, input.endpoint, corner.x);
    output.position = vec4<f32>((point.xy + (((normal * corner.y) * input.properties.x) * 2.5f)), point.z, 1f);
    output.color = input.color;
    output.side = corner.y;
    let _e58 = output;
    return _e58;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let radius = abs(input_1.side);
    let edge = (1f - smoothstep(0.72f, 1f, radius));
    let halo = (exp(((-(radius) * radius) * 5f)) * edge);
    let core = exp(((-(radius) * radius) * 100f));
    let opacity = clamp(input_1.color.w, 0f, 1f);
    let hotCore = mix(vec3(1f), input_1.color.xyz, 0.35f);
    let radiance = ((input_1.color.xyz * ((halo * 2.4f) + (core * 6f))) + ((hotCore * core) * 3f));
    return vec4<f32>((radiance * opacity), (halo * opacity));
}
