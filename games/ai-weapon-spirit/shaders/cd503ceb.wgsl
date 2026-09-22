struct PointsLinesView {
    worldViewProj: mat4x4<f32>,
    model: mat4x4<f32>,
    physicalViewport: vec2<f32>,
    style: vec4<f32>,
}

struct PointsLinesMaterial {
    baseColor: vec4<f32>,
    alphaCutoff: f32,
    _materialPadding: vec3<f32>,
    baseColorTextureCoordinatesTransform: vec4<f32>,
    baseColorTextureCoordinatesMetadata: vec4<f32>,
}

struct PointsLinesVertex {
    @location(0) position: vec3<f32>,
    @location(1) otherPosition: vec3<f32>,
    @location(2) corner: vec2<f32>,
}

struct PointsLinesFragment {
    @builtin(position) position: vec4<f32>,
    @location(0) @interpolate(flat) shape: f32,
    @location(1) @interpolate(linear) sampleCenter: vec2<f32>,
}

@group(0) @binding(10) 
var<uniform> pointsLinesView: PointsLinesView;
@group(1) @binding(0) 
var<uniform> material: PointsLinesMaterial;
@group(1) @binding(1) 
var baseColorSampler: sampler;
@group(1) @binding(2) 
var baseColorTexture: texture_2d<f32>;

fn clipPixelDelta(clip: vec4<f32>, pixels: vec2<f32>) -> vec2<f32> {
    let _e2 = pointsLinesView.physicalViewport;
    let viewport = max(_e2, vec2<f32>(1f, 1f));
    let ndcPerPixel = vec2<f32>((2f / viewport.x), (-2f / viewport.y));
    return ((pixels * ndcPerPixel) * clip.w);
}

fn expandPoint(position: vec3<f32>, corner: vec2<f32>, sizePx: f32) -> vec4<f32> {
    let _e2 = pointsLinesView.worldViewProj;
    let _e5 = pointsLinesView.model;
    let clip_1 = ((_e2 * _e5) * vec4<f32>(position, 1f));
    let _e16 = clipPixelDelta(clip_1, (corner * (sizePx * 0.5f)));
    return vec4<f32>((clip_1.xy + _e16), clip_1.z, clip_1.w);
}

fn expandLine(start: vec3<f32>, end: vec3<f32>, corner_1: vec2<f32>, widthPx: f32) -> vec4<f32> {
    let _e2 = pointsLinesView.worldViewProj;
    let _e5 = pointsLinesView.model;
    let startClip = ((_e2 * _e5) * vec4<f32>(start, 1f));
    let _e13 = pointsLinesView.worldViewProj;
    let _e16 = pointsLinesView.model;
    let endClip = ((_e13 * _e16) * vec4<f32>(end, 1f));
    let startNdc = (startClip.xy / vec2(max(startClip.w, 0.000001f)));
    let endNdc = (endClip.xy / vec2(max(endClip.w, 0.000001f)));
    let tangent = (endNdc - startNdc);
    let safeTangent = select(vec2<f32>(1f, 0f), tangent, (dot(tangent, tangent) > 0.0000001f));
    let axis = normalize(safeTangent);
    let normal = vec2<f32>(-(axis.y), axis.x);
    let endpoint = select(startClip, endClip, (corner_1.x > 0f));
    let _e58 = clipPixelDelta(endpoint, ((normal * corner_1.y) * (widthPx * 0.5f)));
    return vec4<f32>((endpoint.xy + _e58), endpoint.z, endpoint.w);
}

fn circleCoverage(sampleCenter: vec2<f32>) -> bool {
    return (dot(sampleCenter, sampleCenter) <= 1f);
}

@vertex 
fn vs_main(input: PointsLinesVertex) -> PointsLinesFragment {
    var local: bool;
    var output: PointsLinesFragment;

    let _e3 = pointsLinesView.style.y;
    let isLine = (_e3 > 0.5f);
    let _e9 = pointsLinesView.style.z;
    if (_e9 > 0.5f) {
        local = !(isLine);
    } else {
        local = false;
    }
    let isCircle = local;
    let _e25 = pointsLinesView.style.x;
    let _e26 = expandPoint(input.position, input.corner, _e25);
    let _e33 = pointsLinesView.style.x;
    let _e34 = expandLine(input.position, input.otherPosition, input.corner, _e33);
    output.position = select(_e26, _e34, isLine);
    output.shape = select(0f, 1f, isCircle);
    output.sampleCenter = select(input.corner, vec2<f32>(0f, 0f), isLine);
    let _e46 = output;
    return _e46;
}

@fragment 
fn fs_main(input_1: PointsLinesFragment) -> @location(0) vec4<f32> {
    var local_1: bool;
    var local_2: bool;

    if (input_1.shape > 0.5f) {
        let _e5 = circleCoverage(input_1.sampleCenter);
        local_1 = !(_e5);
    } else {
        local_1 = false;
    }
    let _e10 = local_1;
    if _e10 {
        discard;
    }
    let _e13 = material.baseColorTextureCoordinatesMetadata;
    let uv = _e13.xy;
    let textureColor = textureSample(baseColorTexture, baseColorSampler, uv);
    let _e20 = material.baseColor;
    let color = (_e20 * textureColor);
    let _e24 = material.alphaCutoff;
    if (_e24 > 0f) {
        let _e30 = material.alphaCutoff;
        local_2 = (color.w < _e30);
    } else {
        local_2 = false;
    }
    let _e35 = local_2;
    if _e35 {
        discard;
    }
    return color;
}
