struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) right: vec2<f32>,
    @location(2) up: vec2<f32>,
    @location(3) particle_color: vec4<f32>,
    @location(4) base_color: vec4<f32>,
    @location(5) emissive_intensity: vec4<f32>,
    @location(6) surface: vec4<f32>,
    @location(7) advanced: vec4<f32>,
    @location(8) texture_sheet: vec4<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) local: vec2<f32>,
    @location(1) flame_payload: vec4<f32>,
}

fn gas_hash(p: vec3<f32>) -> f32 {
    var q: vec3<f32>;

    q = fract((p * 0.1031f));
    let _e5 = q;
    let _e6 = q;
    let _e7 = q;
    q = (_e5 + vec3(dot(_e6, (_e7.yzx + vec3(33.33f)))));
    let _e16 = q.x;
    let _e18 = q.y;
    let _e21 = q.z;
    return fract(((_e16 + _e18) * _e21));
}

fn gas_noise(p_1: vec3<f32>) -> f32 {
    let i = floor(p_1);
    let f = fract(p_1);
    let w = ((f * f) * (vec3(3f) - (2f * f)));
    let _e10 = gas_hash(i);
    let _e16 = gas_hash((i + vec3<f32>(1f, 0f, 0f)));
    let _e24 = gas_hash((i + vec3<f32>(0f, 1f, 0f)));
    let _e30 = gas_hash((i + vec3<f32>(1f, 1f, 0f)));
    let _e40 = gas_hash((i + vec3<f32>(0f, 0f, 1f)));
    let _e46 = gas_hash((i + vec3<f32>(1f, 0f, 1f)));
    let _e54 = gas_hash((i + vec3<f32>(0f, 1f, 1f)));
    let _e60 = gas_hash((i + vec3<f32>(1f, 1f, 1f)));
    return mix(mix(mix(_e10, _e16, w.x), mix(_e24, _e30, w.x), w.y), mix(mix(_e40, _e46, w.x), mix(_e54, _e60, w.x), w.y), w.z);
}

fn gas_field(p_2: vec3<f32>, time: f32, seed: f32) -> vec2<f32> {
    let h = p_2.y;
    let anchored = smoothstep(0.04f, 0.36f, h);
    let lean = (anchored * ((0.13f * sin((((h * 4.3f) - (time * 1.7f)) + seed))) + ((h * 0.12f) * sin(((h * 9f) - (time * 2.6f))))));
    let centered = vec3<f32>((p_2.x - lean), (h * 3.1f), p_2.z);
    let roll = ((sin((((h * 10.4f) - (time * 3f)) + seed)) * anchored) * 0.95f);
    let advected = vec3<f32>(((centered.x * cos(roll)) - ((centered.y * sin(roll)) * 0.32f)), (((centered.y * cos(roll)) + (centered.x * sin(roll))) - (time * 1.55f)), (centered.z + (0.17f * sin((((h * 7f) - (time * 1.8f)) + seed)))));
    let _e81 = gas_noise(((advected * vec3<f32>(2.3f, 1.6f, 2.3f)) + vec3(seed)));
    let _e92 = gas_noise(((advected.zxy * 5.1f) + vec3<f32>(3.7f, (-(time) * 0.75f), 1.3f)));
    let _e103 = gas_noise(((advected.yzx * 10.3f) + vec3<f32>((-(time) * 1.2f), 7.1f, 4.8f)));
    let turbulence = (((_e81 * 0.62f) + (_e92 * 0.27f)) + (_e103 * 0.11f));
    let radius = (0.62f * pow(max(0f, (1f - h)), 0.62f));
    let radial = length(vec2<f32>(centered.x, (centered.z * 1.18f)));
    let erosion = ((turbulence - 0.48f) * mix(0.13f, 0.82f, anchored));
    let density = ((smoothstep(-0.055f, 0.16f, ((radius - radial) + erosion)) * smoothstep(0.004f, 0.045f, h)) * (1f - smoothstep(0.86f, 0.99f, h)));
    let heat_1 = clamp((((0.96f - (h * 0.8f)) - (radial * 0.29f)) + ((_e81 - 0.5f) * 0.18f)), 0f, 1f);
    return vec2<f32>(density, heat_1);
}

fn gas_radiance(heat: f32, tier: u32) -> vec3<f32> {
    var edge: vec3<f32> = vec3<f32>(0.36f, 0.009f, 0.001f);
    var body: vec3<f32> = vec3<f32>(1.9f, 0.26f, 0.006f);
    var hot: vec3<f32> = vec3<f32>(3.2f, 1.9f, 0.62f);

    if (tier == 1u) {
        edge = vec3<f32>(0.15f, 0.002f, 0.32f);
        body = vec3<f32>(1.05f, 0.05f, 1.8f);
        hot = vec3<f32>(2.8f, 1.1f, 3.1f);
    } else {
        if (tier == 2u) {
            edge = vec3<f32>(0.002f, 0.04f, 0.3f);
            body = vec3<f32>(0.018f, 0.48f, 1.9f);
            hot = vec3<f32>(0.92f, 2.25f, 3.4f);
        } else {
            if (tier == 3u) {
                edge = vec3<f32>(0.005f, 0.001f, 0.012f);
                body = vec3<f32>(0.038f, 0.005f, 0.09f);
                hot = vec3<f32>(0.31f, 0.07f, 0.75f);
            }
        }
    }
    let _e57 = edge;
    let _e58 = body;
    let redBody = mix(_e57, _e58, smoothstep(0.18f, 0.64f, heat));
    let _e64 = hot;
    return mix(redBody, _e64, smoothstep(0.66f, 0.98f, heat));
}

@vertex 
fn vs_main(input: VertexInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(-1f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(-1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(-1f, 1f));
    let local = corners[vertex_index];
    let corner = (local + (input.advanced.xy * 2f));
    output.position = vec4<f32>(((input.position.xy + (input.right * corner.x)) + (input.up * corner.y)), input.position.z, 1f);
    output.local = local;
    output.flame_payload = input.particle_color;
    let _e46 = output;
    return _e46;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    var radiance: vec3<f32> = vec3(0f);
    var transmittance: f32 = 1f;
    var sampleIndex: u32 = 0u;

    let h_1 = ((input_1.local.y * 0.5f) + 0.5f);
    let tier_1 = u32(min(3f, floor((input_1.flame_payload.y / 2f))));
    let seed_1 = (input_1.flame_payload.z * 17.3f);
    let _e27 = gas_hash(vec3<f32>((input_1.local * 181f), seed_1));
    loop {
        let _e29 = sampleIndex;
        if (_e29 < 20u) {
        } else {
            break;
        }
        {
            let _e32 = sampleIndex;
            let z = (-1f + ((f32(_e32) + _e27) * 0.1f));
            let _e44 = gas_field(vec3<f32>(input_1.local.x, h_1, z), input_1.flame_payload.x, seed_1);
            let absorbed = (1f - exp(((-(_e44.x) * 4.6f) * 0.1f)));
            let soot = vec3<f32>(0.045f, 0.026f, 0.018f);
            let _e59 = gas_radiance(_e44.y, tier_1);
            let emission = (_e59 * (0.38f + ((0.95f * _e44.y) * _e44.y)));
            let _e70 = radiance;
            let _e71 = transmittance;
            radiance = (_e70 + ((_e71 * absorbed) * (emission + (soot * (1f - _e44.y)))));
            let _e80 = transmittance;
            transmittance = (_e80 * (1f - absorbed));
        }
        continuing {
            let _e84 = sampleIndex;
            sampleIndex = (_e84 + 1u);
        }
    }
    let _e87 = transmittance;
    let opacity = ((1f - _e87) * input_1.flame_payload.w);
    if (opacity < 0.003f) {
        discard;
    }
    let _e95 = radiance;
    return vec4<f32>((_e95 * input_1.flame_payload.w), opacity);
}
