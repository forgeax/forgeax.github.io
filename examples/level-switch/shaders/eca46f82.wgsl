struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) local: vec2<f32>,
    @location(2) emissive_intensity: vec4<f32>,
    @location(3) surface: vec4<f32>,
}

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) size: vec2<f32>,
    @location(2) particle_color: vec4<f32>,
    @location(3) base_color: vec4<f32>,
    @location(4) emissive_intensity: vec4<f32>,
    @location(5) surface: vec4<f32>,
}

@vertex 
fn vs_main(input: VertexInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(-1f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(-1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(-1f, 1f));
    let corner = corners[vertex_index];
    output.position = vec4<f32>((input.position.xy + (corner * input.size)), input.position.z, 1f);
    output.color = (input.particle_color * input.base_color);
    output.local = corner;
    output.emissive_intensity = input.emissive_intensity;
    output.surface = input.surface;
    let _e42 = output;
    return _e42;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let radius = length(input_1.local);
    let edge = (1f - smoothstep(0.45f, 1f, radius));
    let core = (1f - smoothstep(0f, 0.42f, radius));
    let roughness = clamp(input_1.surface.y, 0.04f, 1f);
    let clearcoat = clamp(input_1.surface.z, 0f, 1f);
    let highlight = ((core * clearcoat) * (1f - (roughness * 0.65f)));
    let emissive = (input_1.emissive_intensity.xyz * input_1.emissive_intensity.w);
    let alpha = (input_1.color.w * edge);
    let rgb = ((input_1.color.xyz + (emissive * (0.35f + (core * 0.65f)))) + vec3(highlight));
    return vec4<f32>((rgb * alpha), alpha);
}
