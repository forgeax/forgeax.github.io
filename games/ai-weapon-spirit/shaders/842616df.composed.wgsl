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

fn softParticle(position: vec4<f32>, alpha_1: f32, fadeDistance_1: f32) -> f32 {
    let pixel = vec2<i32>(position.xy);
    let sceneDepth_1 = textureLoad(scene_depth, pixel, 0i);
    if (fadeDistance_1 <= 0f) {
        return select(alpha_1, 0f, (position.z > sceneDepth_1));
    }
    let _e15 = softParticleFactor(position.z, sceneDepth_1, fadeDistance_1);
    return (alpha_1 * _e15);
}

@vertex 
fn vs_main(input: VertexInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var output: VertexOutput;

    let corners = array<vec2<f32>, 6>(vec2<f32>(-1f, -1f), vec2<f32>(1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(-1f, -1f), vec2<f32>(1f, 1f), vec2<f32>(-1f, 1f));
    let _e24 = billboardPivot(corners[vertex_index], input.advanced.xy);
    let clipPosition = vec3<f32>((input.position.xy + (((input.right * _e24.x) + (input.up * _e24.y)) * 1f)), input.position.z);
    output.position = vec4<f32>(clipPosition, 1f);
    output.clip_position = clipPosition;
    output.color = input.particle_color;
    output.tint = input.base_color;
    output.local = _e24;
    output.emissive_intensity = input.emissive_intensity;
    output.surface = input.surface;
    let _e65 = textureSheetUv(corners[vertex_index], u32(input.advanced.z), u32(input.texture_sheet.x), u32(input.texture_sheet.y));
    output.sheet_uv = _e65;
    output.sheet_frame = input.advanced.z;
    output.fade_distance = input.texture_sheet.z;
    let _e72 = output;
    return _e72;
}

@fragment 
fn fs_main(i: VertexOutput) -> @location(0) vec4<f32> {
    var rgb: vec3<f32>;
    var alpha: f32;

    let p = i.local;
    let r = length(p);
    let edge = (1f - smoothstep(0.82f, 1f, r));
    if (i.surface.x < 0.06f) {
        let rim = exp(-(pow(((r - 0.77f) / 0.075f), 2f)));
        let core = exp((-(dot((p - vec2<f32>(-0.07f, 0.02f)), (p - vec2<f32>(-0.07f, 0.02f)))) * 20f));
        let gleam = exp((-(dot((p - vec2<f32>(-0.28f, 0.36f)), (p - vec2<f32>(-0.28f, 0.36f)))) * 90f));
        rgb = (((vec3<f32>(0.12f, 0.68f, 0.21f) * (0.23f + (rim * 0.6f))) + (vec3<f32>(1.7f, 2.1f, 0.28f) * core)) + (vec3<f32>(0.8f, 1.4f, 0.7f) * gleam));
        alpha = (((((0.13f + (rim * 0.65f)) + (core * 0.85f)) + (gleam * 0.3f)) * edge) * i.color.w);
    } else {
        if (i.surface.x < 0.2f) {
            let spine = exp(((-(p.x) * p.x) * 15f));
            alpha = (((spine * (1f - smoothstep(0.2f, 1f, abs(p.y)))) * edge) * i.color.w);
            rgb = i.color.xyz;
        } else {
            let bend = (p.x - (0.12f * sin((p.y * 3f))));
            let width = (0.62f * pow(max(0f, (1f - (p.y * p.y))), 0.85f));
            let blade = (1f - smoothstep((width - 0.055f), width, abs(bend)));
            let vein = exp(((-(bend) * bend) * 1800f));
            let ribs = pow(max(0f, cos(((p.y * 24f) + (abs(bend) * 16f)))), 12f);
            alpha = ((blade * (1f - smoothstep(0.88f, 1f, abs(p.y)))) * i.color.w);
            rgb = ((i.color.xyz * (0.62f + (0.3f * smoothstep(-0.5f, 0.5f, bend)))) + (vec3<f32>(0.22f, 0.3f, 0.045f) * (vein + (ribs * 0.18f))));
        }
    }
    let _e181 = alpha;
    let _e183 = softParticle(i.position, _e181, i.fade_distance);
    alpha = _e183;
    let _e184 = rgb;
    let _e185 = alpha;
    let _e187 = alpha;
    return vec4<f32>((_e184 * _e185), _e187);
}
