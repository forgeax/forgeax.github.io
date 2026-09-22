struct SegmentInput {
    @location(0) start: vec3<f32>,
    @location(1) endpoint: vec3<f32>,
    @location(2) color: vec4<f32>,
    @location(3) properties: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) charge: f32,
    @location(1) axial_t: f32,
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
    let ground_flare = smoothstep(0.78f, 1f, input.color.z);
    output.position = vec4<f32>((point.xy + ((((normal * corner.y) * input.properties.x) * max(0.12f, input.color.x)) * (0.94f + (ground_flare * 0.34f)))), point.z, 1f);
    output.charge = input.color.y;
    output.axial_t = input.color.z;
    output.opacity = input.color.w;
    output.side = corner.y;
    let _e78 = output;
    return _e78;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    var radiance: vec3<f32>;

    let edge = clamp(abs(input_1.side), 0f, 1f);
    let halo = pow((1f - edge), 0.5f);
    let sheath = pow((1f - edge), 3.4f);
    let core = pow((1f - edge), 40f);
    let groundFlare = smoothstep(0.76f, 1f, input_1.axial_t);
    let travelling = clamp(input_1.charge, 0f, 1f);
    let alphaProfile = max((core * 0.92f), max((sheath * 0.84f), (halo * 0.46f)));
    let alpha = clamp((input_1.opacity * alphaProfile), 0f, 0.94f);
    radiance = ((vec3<f32>(0.012f, 0.16f, 0.98f) * halo) * (1.06f + (travelling * 0.2f)));
    let _e50 = radiance;
    radiance = (_e50 + ((vec3<f32>(0.022f, 0.67f, 1f) * sheath) * (0.64f + (travelling * 0.28f))));
    let _e62 = radiance;
    radiance = (_e62 + ((vec3<f32>(0.72f, 0.91f, 1f) * core) * (3.2f + (groundFlare * 0.6f))));
    let _e74 = radiance;
    return vec4<f32>((_e74 * alpha), alpha);
}
