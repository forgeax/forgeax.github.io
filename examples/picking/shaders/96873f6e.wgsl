struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) local: vec2<f32>,
}

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) size: vec2<f32>,
    @location(2) color: vec4<f32>,
}

@vertex 
fn vs_main(input: VertexInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(-1f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(-1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(-1f, 1f));
    let corner = corners[vertex_index];
    output.position = vec4<f32>((input.position.xy + (corner * input.size)), input.position.z, 1f);
    output.color = input.color;
    output.local = corner;
    let _e36 = output;
    return _e36;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let edge = (1f - smoothstep(0.55f, 1f, length(input_1.local)));
    let alpha = (input_1.color.w * edge);
    return vec4<f32>((input_1.color.xyz * alpha), alpha);
}
