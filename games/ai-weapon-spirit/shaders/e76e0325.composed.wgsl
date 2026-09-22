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

fn hash(p: vec2<f32>) -> f32 {
    return fract((sin(dot(p, vec2<f32>(127.1f, 311.7f))) * 43758.547f));
}

fn noise(p_1: vec2<f32>) -> f32 {
    let i_1 = floor(p_1);
    let f = fract(p_1);
    let u = ((f * f) * (vec2(3f) - (2f * f)));
    let _e10 = hash(i_1);
    let _e15 = hash((i_1 + vec2<f32>(1f, 0f)));
    let _e22 = hash((i_1 + vec2<f32>(0f, 1f)));
    let _e26 = hash((i_1 + vec2(1f)));
    return mix(mix(_e10, _e15, u.x), mix(_e22, _e26, u.x), u.y);
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

    let t = (i.sheet_frame / 60f);
    let seed = ((i.color.z * 13f) + (i.color.y * 7f));
    let p_2 = i.local;
    let _e21 = noise(((p_2 * 2.4f) + vec2<f32>(seed, (-(t) * 1.9f))));
    let _e31 = noise(((p_2 * 5.7f) + vec2<f32>(((_e21 * 0.6f) + seed), (t * -3.1f))));
    let edge = (1f - smoothstep(0.64f, 1f, max(abs(p_2.x), abs(p_2.y))));
    if (i.surface.x < 0.06f) {
        let height = clamp(((p_2.y * 0.5f) + 0.5f), 0f, 1f);
        let center = (((_e21 - 0.5f) * (0.16f + (height * 0.35f))) + ((sin((((p_2.y * 4f) - (t * 5f)) + seed)) * height) * 0.09f));
        let width = ((0.62f * (1f - (height * 0.83f))) + (_e31 * 0.12f));
        let flank = (1f - smoothstep((width * 0.65f), width, abs((p_2.x - center))));
        let vertical = (1f - smoothstep(0.55f, 0.96f, abs(p_2.y)));
        let fringe = smoothstep(0.2f, 0.6f, ((_e21 * 0.65f) + (_e31 * 0.35f)));
        let body = ((flank * vertical) * mix(fringe, 1f, (flank * 0.85f)));
        let heat = ((pow(flank, 2f) * (1f - (height * 0.8f))) * (0.75f + (_e31 * 0.25f)));
        rgb = (mix(vec3<f32>(0.9f, 0.055f, 0.006f), vec3<f32>(2.9f, 1.38f, 0.27f), heat) * i.color.xyz);
        alpha = ((body * edge) * i.color.w);
    } else {
        let body_1 = (1f - smoothstep(0.3f, 0.98f, length((p_2 + (vec2<f32>((_e21 - 0.5f), (_e31 - 0.5f)) * 0.23f)))));
        let density = (body_1 * ((0.3f + (_e21 * 0.48f)) + (_e31 * 0.22f)));
        alpha = ((density * edge) * i.color.w);
        rgb = (i.color.xyz * (0.75f + (_e31 * 0.25f)));
    }
    let _e175 = alpha;
    let _e177 = softParticle(i.position, _e175, i.fade_distance);
    alpha = _e177;
    let _e178 = rgb;
    let _e179 = alpha;
    let _e181 = alpha;
    return vec4<f32>((_e178 * _e179), _e181);
}
