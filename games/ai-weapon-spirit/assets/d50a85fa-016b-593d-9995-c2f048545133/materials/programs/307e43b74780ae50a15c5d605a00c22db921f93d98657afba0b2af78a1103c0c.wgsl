struct SegmentInput {
    @location(0) start: vec3<f32>,
    @location(1) endpoint: vec3<f32>,
    @location(2) color: vec4<f32>,
    @location(3) properties: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) heat: f32,
    @location(1) axial_t: f32,
    @location(2) opacity: f32,
    @location(3) side: f32,
    @location(4) segment_u: f32,
    @location(5) tier: f32,
}

@vertex 
fn vs_main(input: SegmentInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(0f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, 1f));
    let corner = corners[vertex_index];
    let delta = (input.endpoint.xy - input.start.xy);
    let normal = normalize((vec2<f32>(-(delta.y), delta.x) + vec2<f32>(0.000001f, 0f)));
    let geometricU = mix(-(0.055f), (1f + 0.055f), corner.x);
    let axialT = clamp((input.color.z + (input.color.y * geometricU)), 0f, 1f);
    let rootShoulder = (1f + ((1f - smoothstep(0.04f, 0.38f, axialT)) * 0.24f));
    let tipTaper = mix(1f, 0.26f, smoothstep(0.42f, 1f, axialT));
    let fractureWidth = ((rootShoulder * tipTaper) * (0.92f + (sin((axialT * 31.415926f)) * 0.08f)));
    let point = mix(input.start, input.endpoint, geometricU);
    output.position = vec4<f32>((point.xy + (((normal * corner.y) * input.properties.x) * fractureWidth)), point.z, 1f);
    output.heat = clamp((input.color.x - (floor((input.color.x / 2f)) * 2f)), 0f, 1f);
    output.tier = min(3f, floor((input.color.x / 2f)));
    output.axial_t = axialT;
    output.opacity = input.color.w;
    output.side = corner.y;
    output.segment_u = corner.x;
    let _e121 = output;
    return _e121;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    var charColor: vec3<f32>;
    var emberColor: vec3<f32>;
    var coreColor: vec3<f32>;

    let edge = clamp(abs(input_1.side), 0f, 1f);
    let scorch = pow((1f - edge), 0.62f);
    let ember = pow((1f - edge), 3.4f);
    let moltenCore = pow((1f - edge), 13f);
    let segmentFeather = (smoothstep(0f, 0.12f, input_1.segment_u) * (1f - smoothstep(0.88f, 1f, input_1.segment_u)));
    let radialGate = smoothstep(0.1f, 0.28f, input_1.axial_t);
    let hotAlpha = (input_1.heat * max((ember * 0.58f), (moltenCore * 0.78f)));
    let charAlpha = (scorch * mix(0.64f, 0.36f, input_1.heat));
    let alpha = clamp((((input_1.opacity * radialGate) * segmentFeather) * max(charAlpha, hotAlpha)), 0f, 0.88f);
    let tier = u32(input_1.tier);
    charColor = mix(vec3<f32>(0.045f, 0.003f, 0.002f), vec3<f32>(0.13f, 0.01f, 0.002f), input_1.heat);
    emberColor = mix(vec3<f32>(0.3f, 0.008f, 0.002f), vec3<f32>(0.82f, 0.1f, 0.003f), input_1.heat);
    coreColor = mix(vec3<f32>(0.58f, 0.02f, 0.002f), vec3<f32>(1f, 0.3f, 0.025f), input_1.heat);
    if (tier == 1u) {
        charColor = vec3<f32>(0.045f, 0.002f, 0.08f);
        emberColor = mix(vec3<f32>(0.18f, 0.005f, 0.34f), vec3<f32>(0.72f, 0.06f, 0.92f), input_1.heat);
        coreColor = mix(vec3<f32>(0.58f, 0.04f, 0.78f), vec3<f32>(1f, 0.34f, 1f), input_1.heat);
    } else {
        if (tier == 2u) {
            charColor = vec3<f32>(0.002f, 0.012f, 0.07f);
            emberColor = mix(vec3<f32>(0.005f, 0.08f, 0.42f), vec3<f32>(0.03f, 0.5f, 1f), input_1.heat);
            coreColor = mix(vec3<f32>(0.08f, 0.52f, 1f), vec3<f32>(0.72f, 0.96f, 1f), input_1.heat);
        } else {
            if (tier == 3u) {
                charColor = vec3<f32>(0.001f, 0.001f, 0.004f);
                emberColor = mix(vec3<f32>(0.012f, 0.003f, 0.028f), vec3<f32>(0.07f, 0.012f, 0.16f), input_1.heat);
                coreColor = mix(vec3<f32>(0.1f, 0.025f, 0.24f), vec3<f32>(0.34f, 0.15f, 0.76f), input_1.heat);
            }
        }
    }
    let _e166 = charColor;
    let _e167 = emberColor;
    let radiance = mix(_e166, _e167, clamp((ember * input_1.heat), 0f, 1f));
    let _e174 = coreColor;
    let layered = mix(radiance, _e174, clamp((moltenCore * input_1.heat), 0f, 1f));
    return vec4<f32>((layered * alpha), alpha);
}
