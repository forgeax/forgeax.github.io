struct SegmentInput {
    @location(0) start: vec3<f32>,
    @location(1) endpoint: vec3<f32>,
    @location(2) color: vec4<f32>,
    @location(3) properties: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) current: f32,
    @location(1) circumference_t: f32,
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
    output.position = vec4<f32>((point.xy + ((((normal * corner.y) * input.properties.x) * max(0.12f, input.color.x)) * 1.28f)), point.z, 1f);
    output.current = input.color.y;
    output.circumference_t = input.color.z;
    output.opacity = input.color.w;
    output.side = corner.y;
    let _e70 = output;
    return _e70;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let edge = clamp(abs(input_1.side), 0f, 1f);
    let halo = pow((1f - edge), 0.58f);
    let sheath = pow((1f - edge), 3.5f);
    let core = pow((1f - edge), 26f);
    let current = clamp(input_1.current, 0f, 1f);
    let travellingCrest = (pow(current, 3f) * (0.74f + (0.26f * sin((input_1.circumference_t * 37.699112f)))));
    let alphaProfile = max((core * 0.6f), max((sheath * 0.68f), (halo * (0.3f + (travellingCrest * 0.08f)))));
    let alpha = clamp((input_1.opacity * alphaProfile), 0f, 0.72f);
    let fieldBlue = mix(vec3<f32>(0.008f, 0.16f, 0.9f), vec3<f32>(0.022f, 0.56f, 1f), current);
    let radiance = ((((fieldBlue * halo) * (1f + (travellingCrest * 0.24f))) + ((vec3<f32>(0.03f, 0.69f, 1f) * sheath) * (0.58f + (travellingCrest * 0.22f)))) + ((vec3<f32>(0.68f, 0.89f, 1f) * core) * (0.34f + (travellingCrest * 0.14f))));
    return vec4<f32>((radiance * alpha), alpha);
}
