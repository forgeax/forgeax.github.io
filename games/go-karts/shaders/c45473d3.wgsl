struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) emissive_intensity: vec4<f32>,
    @location(3) surface: vec4<f32>,
}

struct VertexInput {
    @location(0) geometry_position: vec3<f32>,
    @location(1) geometry_normal: vec3<f32>,
    @location(2) geometry_uv: vec2<f32>,
    @location(3) geometry_tangent: vec4<f32>,
    @location(4) center: vec3<f32>,
    @location(5) right: vec3<f32>,
    @location(6) up: vec3<f32>,
    @location(7) forward: vec3<f32>,
    @location(8) particle_color: vec4<f32>,
    @location(9) base_color: vec4<f32>,
    @location(10) emissive_intensity: vec4<f32>,
    @location(11) surface: vec4<f32>,
}

@vertex 
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    let offset = (((input.right * input.geometry_position.x) + (input.up * input.geometry_position.y)) + (input.forward * input.geometry_position.z));
    output.position = vec4<f32>((input.center + offset), 1f);
    output.color = (input.particle_color * input.base_color);
    output.normal = normalize((((input.right * input.geometry_normal.x) + (input.up * input.geometry_normal.y)) + (input.forward * input.geometry_normal.z)));
    output.emissive_intensity = input.emissive_intensity;
    output.surface = input.surface;
    let _e45 = output;
    return _e45;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    let normal = normalize(input_1.normal);
    let light_direction = vec3<f32>(0.36589587f, 0.73179173f, 0.57497925f);
    let view_direction = vec3<f32>(0f, 0f, 1f);
    let half_direction = normalize((light_direction + view_direction));
    let diffuse = (0.2f + (0.8f * max(dot(normal, light_direction), 0f)));
    let metallic = clamp(input_1.surface.x, 0f, 1f);
    let roughness = clamp(input_1.surface.y, 0.04f, 1f);
    let clearcoat = clamp(input_1.surface.z, 0f, 1f);
    let clearcoat_roughness = clamp(input_1.surface.w, 0.04f, 1f);
    let specular_power = mix(96f, 4f, roughness);
    let coat_power = mix(192f, 8f, clearcoat_roughness);
    let specular = pow(max(dot(normal, half_direction), 0f), specular_power);
    let coat = (clearcoat * pow(max(dot(normal, half_direction), 0f), coat_power));
    let dielectric = vec3(0.04f);
    let specular_color = mix(dielectric, input_1.color.xyz, metallic);
    let lit = ((input_1.color.xyz * diffuse) * (1f - (metallic * 0.55f)));
    let emissive = (input_1.emissive_intensity.xyz * input_1.emissive_intensity.w);
    return vec4<f32>((((lit + (specular_color * specular)) + vec3(coat)) + emissive), input_1.color.w);
}
