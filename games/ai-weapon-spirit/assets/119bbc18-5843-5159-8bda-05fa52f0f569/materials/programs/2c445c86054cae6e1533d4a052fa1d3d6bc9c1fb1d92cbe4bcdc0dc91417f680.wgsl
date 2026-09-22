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
    @location(2) axial_age: f32,
    @location(3) valid: f32,
    @location(4) segment_noise: f32,
    @location(5) segment_u: f32,
}

const FIRE_WAKE_NODE_STEP: f32 = 0.03125f;

fn fire_wake_hash(value: f32) -> f32 {
    return fract((sin(((value * 12.9898f) + 78.233f)) * 43758.547f));
}

fn fire_wake_width(axial_age: f32) -> f32 {
    let age = clamp(axial_age, 0f, 1f);
    let headward = (1f - age);
    let stream = (0.22f + (0.78f * pow(headward, 0.68f)));
    let head_bulge = (1f + (0.54f * (1f - smoothstep(0f, 0.22f, age))));
    let shoulder = (1f + (0.2f * (1f - smoothstep(0.16f, 0.48f, age))));
    let belly = (1f + (0.26f * pow(sin((age * 3.1415927f)), 2f)));
    let terminal_taper = mix(1f, 0.035f, smoothstep(0.58f, 0.92f, age));
    let flame_lobes = (0.9f + (0.1f * sin(((age * 18.849556f) + ((age * age) * 11f)))));
    return (((((stream * head_bulge) * shoulder) * belly) * terminal_taper) * flame_lobes);
}

fn fire_wake_segment_gate(axial_age_1: f32, segment_noise: f32) -> f32 {
    let breakup_zone = smoothstep(0.66f, 0.9f, axial_age_1);
    let threshold = mix(0.22f, 0.66f, breakup_zone);
    let fragment = smoothstep(threshold, min(0.98f, (threshold + 0.16f)), segment_noise);
    return mix(1f, fragment, breakup_zone);
}

@vertex 
fn vs_main(input: SegmentInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var local: bool;
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(0f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, 1f));
    let corner = corners[vertex_index];
    let delta = (input.endpoint.xy - input.start.xy);
    let segment_length = length((input.endpoint - input.start));
    let normal = normalize((vec2<f32>(-(delta.y), delta.x) + vec2<f32>(0.000001f, 0f)));
    let encoded_tier = floor((input.color.z / 2f));
    let start_age = clamp((input.color.z - (encoded_tier * 2f)), 0f, 1f);
    let end_age = min(1f, (start_age + FIRE_WAKE_NODE_STEP));
    let axial_age_2 = mix(start_age, end_age, corner.x);
    let _e59 = fire_wake_width(start_age);
    let _e60 = fire_wake_width(end_age);
    let width_scale = mix(_e59, _e60, corner.x);
    if (segment_length > 0.00001f) {
        local = (segment_length < 0.35f);
    } else {
        local = false;
    }
    let spatially_continuous = local;
    let valid = select(0f, 1f, spatially_continuous);
    let point = mix(input.start, input.endpoint, corner.x);
    output.position = select(vec4<f32>(2f, 2f, 0f, 1f), vec4<f32>((point.xy + (((normal * input.properties.x) * corner.y) * width_scale)), point.z, 1f), (valid > 0.5f));
    output.color = input.color;
    output.side = corner.y;
    output.axial_age = axial_age_2;
    output.valid = valid;
    let _e111 = fire_wake_hash(floor(((start_age * 32f) + 0.5f)));
    output.segment_noise = _e111;
    output.segment_u = corner.x;
    let _e114 = output;
    return _e114;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    var outer: vec3<f32>;
    var middle: vec3<f32>;
    var hot: vec3<f32>;

    let edge = clamp(abs(input_1.side), 0f, 1f);
    let profile = (1f - edge);
    let halo = pow(profile, 0.58f);
    let body = pow(profile, 1.65f);
    let core = pow(profile, 12f);
    let axial_fade = (1f - smoothstep(0.82f, 0.98f, input_1.axial_age));
    let _e22 = fire_wake_segment_gate(input_1.axial_age, input_1.segment_noise);
    let breakup_zone_1 = smoothstep(0.66f, 0.9f, input_1.axial_age);
    let terminal_energy = mix(1f, 0.14f, breakup_zone_1);
    let fragment_shape = (smoothstep(0.08f, 0.26f, input_1.segment_u) * (1f - smoothstep(0.62f, 0.94f, input_1.segment_u)));
    let fragment_length = mix(1f, fragment_shape, breakup_zone_1);
    let edge_variation = (0.72f + (0.28f * sin((((input_1.axial_age * 47f) + (input_1.side * 5.3f)) + (input_1.segment_noise * 6.2831855f)))));
    let fringe_integrity = (1f - (((breakup_zone_1 * smoothstep(0.48f, 1f, edge)) * (1f - edge_variation)) * 0.82f));
    let alpha_profile = max((core * 0.48f), max(body, (halo * 0.36f)));
    let alpha = clamp((((((((input_1.valid * input_1.color.w) * axial_fade) * _e22) * terminal_energy) * fragment_length) * fringe_integrity) * alpha_profile), 0f, 0.94f);
    let axial_heat = (1f - smoothstep(0.12f, 0.94f, input_1.axial_age));
    let heat = clamp(((axial_heat * 0.58f) + (input_1.color.y * 0.25f)), 0f, 1f);
    let tier = u32(min(3f, floor((input_1.color.z / 2f))));
    outer = mix(vec3<f32>(0.16f, 0.001f, 0.001f), vec3<f32>(0.72f, 0.018f, 0.001f), heat);
    middle = mix(vec3<f32>(0.55f, 0.01f, 0.001f), vec3<f32>(1f, 0.2f, 0.004f), heat);
    hot = mix(vec3<f32>(0.94f, 0.09f, 0.002f), vec3<f32>(1f, 0.54f, 0.07f), heat);
    if (tier == 1u) {
        outer = mix(vec3<f32>(0.09f, 0.002f, 0.18f), vec3<f32>(0.34f, 0.008f, 0.58f), heat);
        middle = mix(vec3<f32>(0.42f, 0.012f, 0.72f), vec3<f32>(0.86f, 0.1f, 1f), heat);
        hot = mix(vec3<f32>(0.92f, 0.24f, 1f), vec3<f32>(1f, 0.7f, 1f), heat);
    } else {
        if (tier == 2u) {
            outer = mix(vec3<f32>(0.001f, 0.018f, 0.2f), vec3<f32>(0.01f, 0.16f, 0.72f), heat);
            middle = mix(vec3<f32>(0.015f, 0.24f, 0.86f), vec3<f32>(0.05f, 0.68f, 1f), heat);
            hot = mix(vec3<f32>(0.18f, 0.72f, 1f), vec3<f32>(0.82f, 0.98f, 1f), heat);
        } else {
            if (tier == 3u) {
                outer = mix(vec3<f32>(0.002f, 0.001f, 0.006f), vec3<f32>(0.015f, 0.004f, 0.035f), heat);
                middle = mix(vec3<f32>(0.018f, 0.003f, 0.045f), vec3<f32>(0.08f, 0.018f, 0.18f), heat);
                hot = mix(vec3<f32>(0.14f, 0.04f, 0.34f), vec3<f32>(0.32f, 0.18f, 0.78f), heat);
            }
        }
    }
    let _e230 = outer;
    let _e231 = middle;
    let body_color = mix(_e230, _e231, body);
    let _e233 = hot;
    let radiance = (mix(body_color, _e233, ((core * heat) * 0.4f)) * (0.78f + (halo * 0.22f)));
    return vec4<f32>((radiance * alpha), alpha);
}
