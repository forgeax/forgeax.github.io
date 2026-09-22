struct SegmentInput {
    @location(0) start: vec3<f32>,
    @location(1) endpoint: vec3<f32>,
    @location(2) color: vec4<f32>,
    @location(3) properties: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) energy: f32,
    @location(1) mode: f32,
    @location(2) axial_t: f32,
    @location(3) opacity: f32,
    @location(4) side: f32,
    @location(5) ray_beat: f32,
}

@vertex 
fn vs_main(input: SegmentInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(0f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, 1f));
    let corner = corners[vertex_index];
    let wheel = step(0.5f, input.color.y);
    let segment_t = mix(0.024390243f, 0.020833334f, wheel);
    let axial_t = clamp((input.color.z + (corner.x * segment_t)), 0f, 1f);
    let tail_width = mix(0.11f, 1f, pow((1f - axial_t), 0.72f));
    let ray_beat = pow(clamp((0.5f + (0.5f * cos((axial_t * 75.398224f)))), 0f, 1f), 7f);
    let wheel_width = (0.84f + (ray_beat * 0.24f));
    let width_profile = mix(tail_width, wheel_width, wheel);
    let delta = (input.endpoint.xy - input.start.xy);
    let normal = normalize((vec2<f32>(-(delta.y), delta.x) + vec2<f32>(0.000001f, 0f)));
    let point = mix(input.start, input.endpoint, corner.x);
    output.position = vec4<f32>((point.xy + (((normal * corner.y) * input.properties.x) * width_profile)), point.z, 1f);
    output.energy = input.color.x;
    output.mode = input.color.y;
    output.axial_t = axial_t;
    output.opacity = input.color.w;
    output.side = corner.y;
    output.ray_beat = ray_beat;
    let _e105 = output;
    return _e105;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let wheel_1 = step(0.5f, input_1.mode);
    let edge = clamp(abs(input_1.side), 0f, 1f);
    let profile = (1f - edge);
    let halo = pow(profile, 0.82f);
    let band = pow(profile, 2.7f);
    let narrow_band = pow(profile, 8.5f);
    let energy = clamp(input_1.energy, 0f, 1f);
    let deep_red = vec3<f32>(0.19f, 0.006f, 0.001f);
    let vermilion = vec3<f32>(0.78f, 0.045f, 0.003f);
    let orange_gold = vec3<f32>(1f, 0.31f, 0.012f);
    let warm_gold = vec3<f32>(1f, 0.66f, 0.12f);
    let tail_tip_fade = (1f - smoothstep(0.82f, 1f, input_1.axial_t));
    let tail_alpha_profile = max((halo * 0.17f), (band * 0.82f));
    let tail_alpha = (tail_alpha_profile * max(0.035f, tail_tip_fade));
    let tail_edge = mix(deep_red, vermilion, (energy * 0.74f));
    let tail_body = mix(vermilion, orange_gold, (0.58f + (energy * 0.34f)));
    let tail_radiance = (mix(tail_edge, tail_body, band) + (((warm_gold * narrow_band) * energy) * 0.18f));
    let wheel_alpha = (max((halo * 0.19f), (band * 0.88f)) * (0.86f + (input_1.ray_beat * 0.14f)));
    let wheel_edge = mix(deep_red, vermilion, (0.72f + (energy * 0.18f)));
    let wheel_body = mix(orange_gold, warm_gold, (0.22f + (input_1.ray_beat * 0.36f)));
    let wheel_radiance = (mix(wheel_edge, wheel_body, band) + (((warm_gold * narrow_band) * input_1.ray_beat) * (0.08f + (energy * 0.1f))));
    let alpha_profile = mix(tail_alpha, wheel_alpha, wheel_1);
    let radiance = mix(tail_radiance, wheel_radiance, wheel_1);
    let alpha = clamp(((input_1.opacity * alpha_profile) * mix(0.84f, 1f, energy)), 0f, 0.94f);
    if (alpha <= 0.001f) {
        discard;
    }
    return vec4<f32>((radiance * alpha), alpha);
}
