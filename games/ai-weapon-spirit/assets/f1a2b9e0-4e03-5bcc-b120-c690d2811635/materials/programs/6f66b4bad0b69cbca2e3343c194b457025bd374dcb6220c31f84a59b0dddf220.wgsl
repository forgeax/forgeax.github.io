struct SegmentInput {
    @location(0) start: vec3<f32>,
    @location(1) endpoint: vec3<f32>,
    @location(2) color: vec4<f32>,
    @location(3) properties: vec2<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) energy: f32,
    @location(1) axial_t: f32,
    @location(2) opacity: f32,
    @location(3) side: f32,
    @location(4) is_coil: f32,
}

@vertex 
fn vs_main(input: SegmentInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(0f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, -1f), vec2<f32>(1f, 1f), vec2<f32>(0f, 1f));
    let corner = corners[vertex_index];
    let delta = (input.endpoint.xy - input.start.xy);
    let normal = normalize((vec2<f32>(-(delta.y), delta.x) + vec2<f32>(0.000001f, 0f)));
    let point = mix(input.start, input.endpoint, corner.x);
    let is_coil = step(1.5f, input.color.x);
    let decoded_width = mix(input.color.x, (input.color.x - 2f), is_coil);
    let width_scale = max(0.04f, decoded_width);
    output.position = vec4<f32>((point.xy + (((normal * corner.y) * input.properties.x) * width_scale)), point.z, 1f);
    output.energy = input.color.y;
    output.axial_t = input.color.z;
    output.opacity = input.color.w;
    output.side = corner.y;
    output.is_coil = is_coil;
    let _e78 = output;
    return _e78;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    var main_radiance: vec3<f32>;
    var coil_radiance: vec3<f32>;

    let edge = clamp(abs(input_1.side), 0f, 1f);
    let halo = pow((1f - edge), 0.78f);
    let sheath = pow((1f - edge), 3.2f);
    let core = pow((1f - edge), 18f);
    let mouth = (1f - smoothstep(0f, 0.11f, input_1.axial_t));
    let tip = smoothstep(0.78f, 1f, input_1.axial_t);
    let flow = clamp(input_1.energy, 0f, 1f);
    let travelling_crest = pow(flow, 7f);
    let alpha_profile = max(core, max((sheath * 0.76f), (halo * 0.3f)));
    let main_alpha = clamp((input_1.opacity * alpha_profile), 0f, 1f);
    let cold = mix(vec3<f32>(0.018f, 0.09f, 0.72f), vec3<f32>(0.06f, 0.72f, 1f), sheath);
    main_radiance = (cold * ((0.64f + (halo * 0.74f)) + (tip * 0.18f)));
    let _e63 = main_radiance;
    main_radiance = (_e63 + ((vec3<f32>(0.88f, 0.98f, 1f) * core) * (0.94f + (mouth * 0.44f))));
    let _e75 = main_radiance;
    main_radiance = (_e75 + (((vec3<f32>(0.12f, 0.82f, 1f) * travelling_crest) * sheath) * 1.24f));
    let _e85 = main_radiance;
    main_radiance = (_e85 + (((vec3<f32>(0.94f, 0.99f, 1f) * travelling_crest) * core) * 0.86f));
    let coil_halo = pow((1f - edge), 0.82f);
    let coil_body = pow((1f - edge), 3.4f);
    let coil_core = pow((1f - edge), 15f);
    let coil_alpha_profile = max(coil_core, max((coil_body * 0.78f), (coil_halo * 0.22f)));
    let coil_alpha = clamp((input_1.opacity * coil_alpha_profile), 0f, 1f);
    coil_radiance = ((vec3<f32>(1f, 0.12f, 0.008f) * coil_halo) * 0.92f);
    let _e126 = coil_radiance;
    coil_radiance = (_e126 + ((vec3<f32>(1f, 0.52f, 0.035f) * coil_body) * 1.78f));
    let _e135 = coil_radiance;
    coil_radiance = (_e135 + ((vec3<f32>(1f, 0.93f, 0.52f) * coil_core) * (1.36f + (travelling_crest * 1.34f))));
    let alpha = mix(main_alpha, coil_alpha, input_1.is_coil);
    let _e149 = main_radiance;
    let _e150 = coil_radiance;
    let radiance = mix(_e149, _e150, input_1.is_coil);
    return vec4<f32>((radiance * alpha), alpha);
}
