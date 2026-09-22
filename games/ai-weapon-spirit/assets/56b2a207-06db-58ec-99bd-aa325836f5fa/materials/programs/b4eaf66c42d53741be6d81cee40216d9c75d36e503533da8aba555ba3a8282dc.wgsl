struct SegmentInput {
    @location(0) start: vec3<f32>,
    @location(1) endpoint: vec3<f32>,
    @location(2) color: vec4<f32>,
    @location(3) properties: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) heat: f32,
    @location(1) circumference_t: f32,
    @location(2) opacity: f32,
    @location(3) side: f32,
    @location(4) tier: f32,
}

@vertex 
fn vs_main(input: SegmentInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(0f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, 1f));
    let corner = corners[vertex_index];
    let delta = (input.endpoint.xy - input.start.xy);
    let normal = normalize((vec2<f32>(-(delta.y), delta.x) + vec2<f32>(0.000001f, 0f)));
    let point = mix(input.start, input.endpoint, corner.x);
    output.position = vec4<f32>((point.xy + (((normal * corner.y) * input.properties.x) * max(0.08f, (input.color.x - (floor((input.color.x / 2f)) * 2f))))), point.z, 1f);
    output.heat = input.color.y;
    output.circumference_t = input.color.z;
    output.opacity = input.color.w;
    output.side = corner.y;
    output.tier = min(3f, floor((input.color.x / 2f)));
    let _e84 = output;
    return _e84;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    var ember: vec3<f32>;
    var edgeColor: vec3<f32> = vec3<f32>(1f, 0.63f, 0.1f);
    var coreColor: vec3<f32> = vec3<f32>(1f, 0.86f, 0.38f);

    let edge = clamp(abs(input_1.side), 0f, 1f);
    let halo = pow((1f - edge), 1.35f);
    let crest = pow((1f - edge), 6.8f);
    let uneven_heat = clamp((input_1.heat + (sin((input_1.circumference_t * 37.699112f)) * 0.06f)), 0f, 1f);
    let fracture_field = ((sin(((input_1.circumference_t * 18.849556f) + 0.43f)) * 0.58f) + (sin(((input_1.circumference_t * 43.982296f) + 1.21f)) * 0.42f));
    let hot_arc = smoothstep(-0.02f, 0.32f, fracture_field);
    let arc_integrity = mix(0.018f, 1f, hot_arc);
    let alpha = clamp((input_1.opacity * max((crest * arc_integrity), (halo * 0.055f))), 0f, 0.92f);
    let tier = u32(input_1.tier);
    ember = mix(vec3<f32>(0.64f, 0.018f, 0.003f), vec3<f32>(1f, 0.28f, 0.01f), uneven_heat);
    if (tier == 1u) {
        ember = mix(vec3<f32>(0.22f, 0.006f, 0.42f), vec3<f32>(0.82f, 0.08f, 1f), uneven_heat);
        edgeColor = vec3<f32>(0.94f, 0.3f, 1f);
        coreColor = vec3<f32>(1f, 0.78f, 1f);
    } else {
        if (tier == 2u) {
            ember = mix(vec3<f32>(0.004f, 0.1f, 0.52f), vec3<f32>(0.04f, 0.58f, 1f), uneven_heat);
            edgeColor = vec3<f32>(0.2f, 0.74f, 1f);
            coreColor = vec3<f32>(0.8f, 0.98f, 1f);
        } else {
            if (tier == 3u) {
                ember = mix(vec3<f32>(0.004f, 0.002f, 0.012f), vec3<f32>(0.055f, 0.01f, 0.14f), uneven_heat);
                edgeColor = vec3<f32>(0.2f, 0.07f, 0.52f);
                coreColor = vec3<f32>(0.46f, 0.22f, 0.92f);
            }
        }
    }
    let _e135 = ember;
    let _e141 = edgeColor;
    let _e150 = coreColor;
    let radiance = (((_e135 * (0.78f + (halo * 0.52f))) + (((_e141 * crest) * hot_arc) * (0.7f + (uneven_heat * 0.42f)))) + (((_e150 * pow(crest, 2f)) * hot_arc) * 0.16f));
    return vec4<f32>((radiance * alpha), alpha);
}
