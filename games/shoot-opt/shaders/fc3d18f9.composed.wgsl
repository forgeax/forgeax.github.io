struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) local: vec2<f32>,
    @location(2) emissive_intensity: vec4<f32>,
    @location(3) surface: vec4<f32>,
    @location(4) sheet_uv: vec2<f32>,
    @location(5) sheet_frame: f32,
    @location(6) fade_distance: f32,
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
    let pixel = vec2<i32>(position.xy);
    let sceneDepth_1 = textureLoad(scene_depth, pixel, 0i);
    if (fadeDistance_1 <= 0f) {
        return select(alpha, 0f, (position.z > sceneDepth_1));
    }
    let _e15 = softParticleFactor(position.z, sceneDepth_1, fadeDistance_1);
    return (alpha * _e15);
}

@vertex 
fn vs_main(input: VertexInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(-1f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(-1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(-1f, 1f));
    let _e24 = billboardPivot(corners[vertex_index], input.advanced.xy);
    output.position = vec4<f32>(((input.position.xy + (input.right * _e24.x)) + (input.up * _e24.y)), input.position.z, 1f);
    output.color = (input.particle_color * input.base_color);
    output.local = _e24;
    output.emissive_intensity = input.emissive_intensity;
    output.surface = input.surface;
    let _e61 = textureSheetUv(corners[vertex_index], u32(input.advanced.z), u32(input.texture_sheet.x), u32(input.texture_sheet.y));
    output.sheet_uv = _e61;
    output.sheet_frame = input.advanced.z;
    output.fade_distance = input.texture_sheet.z;
    let _e68 = output;
    return _e68;
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
    let _e39 = softParticle(input_1.position, (input_1.color.w * edge), input_1.fade_distance);
    let sheetPulse = (0.82f + (0.18f * fract((((input_1.sheet_frame * 0.618f) + input_1.sheet_uv.x) + input_1.sheet_uv.y))));
    let rgb = (((input_1.color.xyz + (emissive * (0.35f + (core * 0.65f)))) + vec3(highlight)) * sheetPulse);
    return vec4<f32>((rgb * _e39), _e39);
}
