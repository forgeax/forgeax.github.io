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
    @location(2) axial_t: f32,
    @location(3) chain_mask: f32,
}

@vertex 
fn vs_main(input: SegmentInput, @builtin(vertex_index) vertex_index: u32, @builtin(instance_index) instance_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(0f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, 1f));
    let corner = corners[vertex_index];
    let start = input.start.xy;
    let endpoint = input.endpoint.xy;
    let delta = (endpoint - start);
    let normal = normalize((vec2<f32>(-(delta.y), delta.x) + vec2<f32>(0.000001f, 0f)));
    let point = vec3<f32>(mix(start, endpoint, corner.x), mix(input.start.z, input.endpoint.z, corner.x));
    output.position = vec4<f32>((point.xy + ((normal * corner.y) * input.properties.x)), point.z, 1f);
    output.color = input.color;
    output.side = corner.y;
    output.axial_t = input.color.z;
    output.chain_mask = step(0.02f, input.properties.x);
    let _e69 = output;
    return _e69;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let edge = clamp(abs(input_1.side), 0f, 1f);
    let profile = (1f - edge);
    let halo = pow(profile, 0.72f);
    let sheath = pow(profile, 2.8f);
    let core = pow(profile, 38f);
    let opacity = clamp(input_1.color.w, 0f, 1f);
    let strand_energy = mix(1f, clamp(input_1.color.x, 0.36f, 1f), input_1.chain_mask);
    let alpha_profile = max((halo * 0.24f), max((sheath * 0.62f), (core * 0.98f)));
    let deep_blue = vec3<f32>(0.025f, 0.12f, 0.92f);
    let electric_cyan = vec3<f32>(0.08f, 0.68f, 1f);
    let hot_white = vec3<f32>(0.9f, 0.98f, 1f);
    let radiance = (((deep_blue * (0.88f + (halo * 1.14f))) + ((electric_cyan * sheath) * mix(1.08f, 1.42f, strand_energy))) + ((hot_white * core) * mix(1.4f, 3.6f, strand_energy)));
    let alpha = clamp(((opacity * alpha_profile) * strand_energy), 0f, 1f);
    return vec4<f32>((radiance * alpha), alpha);
}
