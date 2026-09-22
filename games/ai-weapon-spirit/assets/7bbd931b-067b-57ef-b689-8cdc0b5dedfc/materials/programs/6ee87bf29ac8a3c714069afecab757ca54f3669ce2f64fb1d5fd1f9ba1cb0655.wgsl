struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) local: vec2<f32>,
    @location(2) emissive_intensity: vec4<f32>,
    @location(3) surface: vec4<f32>,
    @location(4) sheet_uv: vec2<f32>,
    @location(5) sheet_frame: f32,
    @location(6) fade_distance: f32,
    @location(7) clip_position: vec3<f32>,
    @location(8) tint: vec4<f32>,
    @location(9) variation: f32,
}

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

@group(0) @binding(0) 
var scene_depth: texture_depth_2d;

fn textureSheetFrame(age: f32, frameRate: f32, frameCount: u32) -> u32 {
    var local: bool;

    if !((frameCount == 0u)) {
        local = (frameRate <= 0f);
    } else {
        local = true;
    }
    let _e10 = local;
    if _e10 {
        return 0u;
    }
    return min((frameCount - 1u), u32(max(0f, floor((age * frameRate)))));
}

fn textureSheetUv(local_1: vec2<f32>, frame: u32, columns: u32, rows: u32) -> vec2<f32> {
    let safeColumns = max(columns, 1u);
    let safeRows = max(rows, 1u);
    let cell = vec2<u32>((frame % safeColumns), (frame / safeColumns));
    return ((((local_1 + vec2(1f)) * 0.5f) / vec2<f32>(f32(safeColumns), f32(safeRows))) + vec2<f32>((f32(cell.x) / f32(safeColumns)), (f32(cell.y) / f32(safeRows))));
}

fn billboardPivot(corner: vec2<f32>, pivot: vec2<f32>) -> vec2<f32> {
    return (corner + (pivot * 2f));
}

fn softParticleFactor(particleDepth: f32, sceneDepth: f32, fadeDistance: f32) -> f32 {
    if (fadeDistance <= 0f) {
        return 1f;
    }
    return clamp(((sceneDepth - particleDepth) / fadeDistance), 0f, 1f);
}

fn billboardSortingKey(depth: f32, mode: u32) -> f32 {
    return select(0f, depth, (mode == 2u));
}

fn softParticle(position: vec4<f32>, alpha: f32, fadeDistance_1: f32) -> f32 {
    let pixel_1 = vec2<i32>(position.xy);
    let sceneDepth_1 = textureLoad(scene_depth, pixel_1, 0i);
    if (fadeDistance_1 <= 0f) {
        return select(alpha, 0f, (position.z > sceneDepth_1));
    }
    let _e15 = softParticleFactor(position.z, sceneDepth_1, fadeDistance_1);
    return (alpha * _e15);
}

fn cinder_print(value: vec4<f32>, pixel: vec2<f32>, tint: vec4<f32>, print: vec4<f32>) -> vec4<f32> {
    var color: vec3<f32>;

    if (value.w <= 0.00001f) {
        discard;
    }
    let straight = max((value.xyz / vec3(value.w)), vec3(0f));
    let brightness = max(max(straight.x, straight.y), straight.z);
    let shade = mix(clamp(brightness, 0.2f, 1.6f), ((floor((clamp(brightness, 0f, 1.5f) * 3f)) / 3f) + 0.22f), print.z);
    color = mix(straight, (tint.xyz * shade), tint.w);
    let grid = (pixel / vec2(max(4f, print.w)));
    let cell_1 = (fract(vec2<f32>((grid.x + (grid.y * 0.22f)), grid.y)) - vec2(0.5f));
    let radius = mix(0.12f, 0.32f, (1f - clamp(brightness, 0f, 1f)));
    let dots = (1f - smoothstep((radius - 0.035f), (radius + 0.035f), length(cell_1)));
    let line1_ = (1f - smoothstep(0.06f, 0.15f, abs((fract((grid.x + grid.y)) - 0.5f))));
    let line2_ = (1f - smoothstep(0.06f, 0.15f, abs((fract((grid.x - grid.y)) - 0.5f))));
    let hatch = max(line1_, (line2_ * (1f - smoothstep(0.3f, 0.8f, brightness))));
    let _e102 = color;
    color = mix(_e102, vec3<f32>(0.006f, 0.004f, 0.015f), (max((dots * print.x), (hatch * print.y)) * 0.9f));
    let _e115 = color;
    return vec4<f32>((_e115 * value.w), value.w);
}

fn cinder_hash(p: vec2<f32>) -> f32 {
    return fract((sin(dot(p, vec2<f32>(127.1f, 311.7f))) * 43758.547f));
}

fn cinder_noise(p_1: vec2<f32>) -> f32 {
    let i = floor(p_1);
    let f = fract(p_1);
    let u = ((f * f) * (vec2(3f) - (2f * f)));
    let _e10 = cinder_hash(i);
    let _e15 = cinder_hash((i + vec2<f32>(1f, 0f)));
    let _e22 = cinder_hash((i + vec2<f32>(0f, 1f)));
    let _e27 = cinder_hash((i + vec2<f32>(1f, 1f)));
    return mix(mix(_e10, _e15, u.x), mix(_e22, _e27, u.x), u.y);
}

fn cinder_fire_shade(input_2: VertexOutput) -> vec4<f32> {
    let softness = (1f - clamp(input_2.emissive_intensity.z, 0f, 1f));
    let time = (input_2.sheet_frame / 60f);
    let phase = vec2<f32>(sin(input_2.variation), cos(input_2.variation));
    let seed = (softness * ((input_2.color.y * 5.73f) + (input_2.color.z * 13.4f)));
    let taper = (1f - ((softness * 0.55f) * smoothstep(-0.6f, 1f, input_2.local.y)));
    let p_2 = vec2<f32>((input_2.local.x / taper), (input_2.local.y * mix(0.72f, 0.96f, softness)));
    let rise = max(0f, input_2.local.y);
    let _e60 = cinder_noise((((p_2 * 2.15f) + (phase * 3.1f)) + vec2<f32>(seed, (-(time) * 0.9f))));
    let _e71 = cinder_noise((((p_2 * 5.7f) - (phase * 4.3f)) + vec2<f32>(seed, (-(time) * 1.7f))));
    let _e87 = cinder_noise(((vec2<f32>((p_2.x * 9.3f), (p_2.y * 4.1f)) + (phase * 6.2f)) + vec2<f32>(seed, (-(time) * 2.2f))));
    let tongue = ((_e60 - 0.5f) * (0.18f + (rise * 0.24f)));
    let warped = length(vec2<f32>((p_2.x + ((_e71 - 0.5f) * 0.28f)), (p_2.y - tongue)));
    let tornEdge = ((0.78f + (_e60 * 0.18f)) + (_e87 * 0.08f));
    let body = (1f - smoothstep((tornEdge - mix(0.24f, 0.075f, input_2.emissive_intensity.z)), tornEdge, warped));
    let core = (1f - smoothstep(0.08f, (0.42f + (_e71 * 0.08f)), (warped + ((_e87 - 0.5f) * 0.1f))));
    let fringe = (body * (1f - core));
    let temperature = clamp(((core * 1.15f) + (_e60 * 0.28f)), 0f, 1f);
    let hot = mix(vec3<f32>(1f, 0.055f, 0.004f), vec3<f32>(1f, 0.82f, 0.32f), temperature);
    let soot = (vec3<f32>(0.055f, 0.018f, 0.009f) * fringe);
    let breakup = smoothstep(0.18f, 0.58f, (_e87 + (body * 0.45f)));
    let edgeFade = (1f - smoothstep(0.7f, 1f, max(abs(input_2.local.x), abs(input_2.local.y))));
    let _e189 = softParticle(input_2.position, ((((input_2.color.w * body) * breakup) * edgeFade) * (0.42f + (core * 0.58f))), input_2.fade_distance);
    let rgb = ((((hot * (0.7f + (temperature * 2.4f))) * input_2.color.xyz) + soot) * _e189);
    return vec4<f32>(rgb, _e189);
}

fn cinder_smoke_shade(input_3: VertexOutput) -> vec4<f32> {
    let time_1 = (input_3.sheet_frame / 60f);
    let phase_1 = vec2<f32>(sin(input_3.variation), cos(input_3.variation));
    let p_3 = input_3.local;
    let _e22 = cinder_noise((((p_3 * 1.8f) + (phase_1 * 5f)) + vec2<f32>((time_1 * 0.08f), (-(time_1) * 0.18f))));
    let _e36 = cinder_noise((((p_3 * 4.6f) - (phase_1 * 7f)) + vec2<f32>((-(time_1) * 0.13f), (-(time_1) * 0.31f))));
    let _e50 = cinder_noise((((p_3.yx * 8.2f) + (phase_1 * 9f)) + vec2<f32>((time_1 * 0.16f), (-(time_1) * 0.23f))));
    let warped_1 = length((p_3 + (vec2<f32>((_e22 - 0.5f), (_e36 - 0.5f)) * 0.34f)));
    let silhouette = (1f - smoothstep((0.48f + (_e22 * 0.18f)), 1.04f, warped_1));
    let edge_1 = (1f - smoothstep(0.72f, 1f, max(abs(p_3.x), abs(p_3.y))));
    let density = ((silhouette * (0.32f + (0.68f * smoothstep(0.18f, 0.76f, (((_e22 * 0.52f) + (_e36 * 0.31f)) + (_e50 * 0.17f)))))) * edge_1);
    let _e102 = softParticle(input_3.position, ((input_3.color.w * density) * 0.86f), input_3.fade_distance);
    let volumeLight = ((0.72f + (_e36 * 0.3f)) + (((p_3.y * 0.5f) + 0.5f) * 0.14f));
    let ash = (input_3.color.xyz * volumeLight);
    return vec4<f32>((ash * _e102), _e102);
}

fn cinder_speed_shade(input_4: VertexOutput) -> vec4<f32> {
    let p_4 = input_4.local;
    let olive = max(0f, (1f - dot(p_4, p_4)));
    let body_1 = pow(olive, 0.42f);
    let alpha_1 = (input_4.color.w * body_1);
    let hot_1 = mix(input_4.color.xyz, vec3<f32>(2.4f, 1.35f, 0.38f), pow(olive, 2f));
    return vec4<f32>((hot_1 * alpha_1), alpha_1);
}

fn cinder_ember_shade(input_5: VertexOutput, edge: f32) -> vec4<f32> {
    let radius_1 = length(input_5.local);
    let body_2 = (max(0f, ((exp(((-(radius_1) * radius_1) * 3.2f)) - 0.040762205f) / 0.9592378f)) * (1f - smoothstep((1f - edge), 1f, radius_1)));
    let core_1 = exp(((-(radius_1) * radius_1) * 28f));
    let alpha_2 = (input_5.color.w * body_2);
    let color_1 = (input_5.color.xyz * (0.78f + (core_1 * 2.1f)));
    return vec4<f32>((color_1 * alpha_2), alpha_2);
}

@vertex 
fn vs_main(input: VertexInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(-1f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(-1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(-1f, 1f));
    let _e24 = billboardPivot(corners[vertex_index], input.advanced.xy);
    let particleSize = input.surface.y;
    let clipPosition = vec3<f32>((input.position.xy + (((input.right * _e24.x) + (input.up * _e24.y)) * particleSize)), input.position.z);
    output.position = vec4<f32>(clipPosition, 1f);
    output.clip_position = clipPosition;
    output.color = input.particle_color;
    output.tint = input.base_color;
    output.variation = atan2(input.right.y, input.right.x);
    output.local = _e24;
    output.emissive_intensity = input.emissive_intensity;
    output.surface = input.surface;
    let _e72 = textureSheetUv(corners[vertex_index], u32(input.advanced.z), u32(input.texture_sheet.x), u32(input.texture_sheet.y));
    output.sheet_uv = _e72;
    output.sheet_frame = input.advanced.z;
    output.fade_distance = input.texture_sheet.z;
    let _e79 = output;
    return _e79;
}

@fragment 
fn fs_main(input_1: VertexOutput) -> @location(0) vec4<f32> {
    var shaded: vec4<f32>;

    let _e3 = fwidth(length(input_1.local));
    let emberEdge = max(_e3, 0.025f);
    let localFootprint = fwidth(input_1.local);
    switch i32(round((input_1.surface.x * 8f))) {
        case 0: {
            let _e14 = cinder_fire_shade(input_1);
            shaded = _e14;
        }
        case 1: {
            let _e16 = cinder_smoke_shade(input_1);
            shaded = _e16;
        }
        case 2: {
            let _e17 = cinder_speed_shade(input_1);
            shaded = _e17;
        }
        default: {
            let _e18 = cinder_ember_shade(input_1, emberEdge);
            shaded = _e18;
        }
    }
    let smoke = (i32(round((input_1.surface.x * 8f))) == 1i);
    let _e27 = shaded;
    let _e33 = shaded.w;
    let _e35 = shaded;
    shaded = select(vec4<f32>((_e27.xyz * input_1.surface.z), _e33), (_e35 * input_1.surface.z), smoke);
    let ember = (i32(round((input_1.surface.x * 8f))) == 3i);
    let radiusPixels = (1f / max(length(localFootprint), 0.001f));
    let detail = select(1f, smoothstep(2f, 7f, radiusPixels), ember);
    let print_1 = vec4<f32>((input_1.emissive_intensity.xyz * detail), input_1.emissive_intensity.w);
    let _e64 = shaded;
    let _e68 = cinder_print(_e64, input_1.position.xy, input_1.tint, print_1);
    let mask = (_e68.w / max(input_1.color.w, 0.0001f));
    let _e75 = fwidth(mask);
    let inside = select(1f, smoothstep(0.035f, (0.035f + (max(_e75, 0.005f) * max((input_1.surface.w * detail), 0.001f))), mask), ((input_1.surface.w * detail) > 0f));
    return vec4<f32>(mix((vec3<f32>(0.004f, 0.003f, 0.012f) * _e68.w), _e68.xyz, inside), _e68.w);
}
