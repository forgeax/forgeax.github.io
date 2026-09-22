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
    output.axial_t = 0f;
    output.chain_mask = step(0.02f, input.properties.x);
    let _e68 = output;
    return _e68;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    var color: vec3<f32>;

    let across = abs(input_1.side);
    let crest = exp(((-(across) * across) * 18f));
    let halo = (1f - smoothstep(0f, 1f, across));
    let alpha = (input_1.color.w * ((crest * 0.82f) + (halo * 0.18f)));
    let rgb = mix((input_1.color.xyz * 0.42f), vec3<f32>(1.55f, 0.62f, 0.15f), crest);
    let brightness = (max(max(rgb.x, rgb.y), rgb.z) * 0.8f);
    let shade = ((floor((clamp(brightness, 0f, 1.5f) * 3f)) / 3f) + 0.22f);
    color = (vec3<f32>(0.039546236f, 0.61049557f, 0.7991027f) * shade);
    let grid = (input_1.position.xy / vec2(9f));
    let cell = (fract(vec2<f32>((grid.x + (grid.y * 0.22f)), grid.y)) - vec2(0.5f));
    let radius = mix(0.12f, 0.32f, (1f - clamp(brightness, 0f, 1f)));
    let dots = (1f - smoothstep((radius - 0.035f), (radius + 0.035f), length(cell)));
    let line1_ = (1f - smoothstep(0.06f, 0.15f, abs((fract((grid.x + grid.y)) - 0.5f))));
    let line2_ = (1f - smoothstep(0.06f, 0.15f, abs((fract((grid.x - grid.y)) - 0.5f))));
    let hatch = max(line1_, (line2_ * (1f - smoothstep(0.3f, 0.8f, brightness))));
    let _e116 = color;
    color = mix(_e116, vec3<f32>(0.006f, 0.004f, 0.015f), (max((dots * 0.8f), (hatch * 0.28f)) * 0.9f));
    let _e129 = color;
    return vec4<f32>((_e129 * alpha), alpha);
}
