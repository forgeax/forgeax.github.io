struct SegmentInput {
    @location(0) start: vec3<f32>,
    @location(1) endpoint: vec3<f32>,
    @location(2) color: vec4<f32>,
    @location(3) properties: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) sap_pulse: f32,
    @location(1) strand_class: f32,
    @location(2) strand_t: f32,
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
    let strandT = clamp((input.color.z + (corner.x / 39f)), 0f, 1f);
    let rootWeight = smoothstep(0.82f, 1f, input.color.y);
    let taper = mix((1f - (strandT * 0.54f)), (0.72f - (strandT * 0.3f)), rootWeight);
    let pulseWidth = (0.9f + (clamp(input.color.x, 0f, 1f) * 0.1f));
    let width = ((input.properties.x * max(0.22f, taper)) * pulseWidth);
    let overlap = (width * 0.18f);
    let point = mix(vec3<f32>((input.start.xy - (tangent * overlap)), input.start.z), vec3<f32>((input.endpoint.xy + (tangent * overlap)), input.endpoint.z), corner.x);
    output.position = vec4<f32>((point.xy + ((normal * corner.y) * width)), point.z, 1f);
    output.sap_pulse = input.color.x;
    output.strand_class = input.color.y;
    output.strand_t = strandT;
    output.opacity = input.color.w;
    output.side = corner.y;
    let _e119 = output;
    return _e119;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let edge = clamp(abs(input_1.side), 0f, 1f);
    let body = pow((1f - edge), 0.82f);
    let vein = pow((1f - edge), 7f);
    let pith = pow((1f - edge), 18f);
    let barkBreak = (0.78f + (0.22f * sin(((input_1.strand_t * 62.831852f) + (input_1.strand_class * 9f)))));
    let rootWeight_1 = smoothstep(0.82f, 1f, input_1.strand_class);
    let leashWeight = (1f - smoothstep(0.01f, 0.2f, input_1.strand_class));
    let leafGreen = mix(vec3<f32>(0.025f, 0.25f, 0.055f), vec3<f32>(0.035f, 0.48f, 0.12f), input_1.sap_pulse);
    let jadeEdge = ((vec3<f32>(0.1f, 0.72f, 0.29f) * body) * (0.48f + (barkBreak * 0.28f)));
    let warmSap = ((vec3<f32>(0.82f, 0.58f, 0.12f) * vein) * (0.14f + (input_1.sap_pulse * 0.2f)));
    let restraintGlint = ((vec3<f32>(0.7f, 0.93f, 0.42f) * pith) * (0.12f + (leashWeight * 0.12f)));
    let groundShade = mix(1f, 0.68f, rootWeight_1);
    let alphaProfile = (((body * 0.56f) + (vein * 0.18f)) + (pith * 0.08f));
    let alpha = clamp((input_1.opacity * alphaProfile), 0f, 0.78f);
    let rgb = ((((((leafGreen * body) * groundShade) + jadeEdge) + warmSap) + restraintGlint) * alpha);
    return vec4<f32>(rgb, alpha);
}
