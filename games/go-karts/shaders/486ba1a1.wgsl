struct SegmentInput {
    @location(0) start: vec3<f32>,
    @location(1) endpoint: vec3<f32>,
    @location(2) color: vec4<f32>,
    @location(3) properties: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) clip_position: vec3<f32>,
    @location(2) uv: vec2<f32>,
}

@vertex 
fn vs_main(input: SegmentInput, @builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(0f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, 1f));
    let corner = corners[vertexIndex];
    let delta = (input.endpoint.xy - input.start.xy);
    let normal = normalize((vec2<f32>(-(delta.y), delta.x) + vec2<f32>(0.000001f, 0f)));
    let tangent = normalize((delta + vec2<f32>(0.000001f, 0f)));
    let taper = max(0f, (1f - input.properties.y));
    let point = (mix(input.start, input.endpoint, corner.x) + vec3<f32>((tangent * (((corner.x * 2f) - 1f) * input.properties.x)), 0f));
    let clipPosition = vec3<f32>((point.xy + (((normal * corner.y) * input.properties.x) * taper)), point.z);
    output.position = vec4<f32>(clipPosition, 1f);
    output.color = input.color;
    output.clip_position = clipPosition;
    output.uv = corner;
    let _e81 = output;
    return _e81;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let edge = (1f - smoothstep(0.58f, 1f, abs(input_1.uv.y)));
    let alpha = (input_1.color.w * edge);
    return vec4<f32>((input_1.color.xyz * alpha), alpha);
}
