struct ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    worldViewProj: mat4x4<f32>,
    lightDir: vec3<f32>,
    lightColor: vec3<f32>,
    cameraPos: vec3<f32>,
    lightViewProj_A: mat4x4<f32>,
    inverseViewProj: mat4x4<f32>,
    lightViewProj_B: mat4x4<f32>,
    lightViewProj_C: mat4x4<f32>,
    lightViewProj_D: mat4x4<f32>,
    splitPlanes: array<vec4<f32>, 4>,
    cascadeCount: f32,
    cascadeBlend: f32,
    depthBias: f32,
    normalBias: f32,
    directionalShadowFilter: vec4<f32>,
    spotLightViewProj: array<mat4x4<f32>, 4>,
    temporalCurrentViewProj: mat4x4<f32>,
    temporalPreviousViewProj: mat4x4<f32>,
    temporalProjection: vec4<f32>,
    temporalPreviousCameraPos: vec4<f32>,
    ssrParams: vec4<f32>,
    cloudShadowOrigin: vec4<f32>,
    cloudShadowRight: vec4<f32>,
    cloudShadowUp: vec4<f32>,
    cloudShadowProjection: vec4<f32>,
    clippingPlanes: array<vec4<f32>, 6>,
    clippingControl: vec4<f32>,
}

struct PointsLinesView {
    worldViewProj: mat4x4<f32>,
    model: mat4x4<f32>,
    physicalViewport: vec2<f32>,
    style: vec4<f32>,
}

struct PointsLinesMaterial {
    baseColor: vec4<f32>,
    alphaCutoff: f32,
    alphaHash: f32,
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
    @location(2) clippingPositionWS: vec3<f32>,
    @builtin(position) position: vec4<f32>,
    @location(0) @interpolate(flat) shape: f32,
    @location(1) @interpolate(linear) sampleCenter: vec2<f32>,
}

@group(0) @binding(0) 
var<uniform> viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(10) 
var<uniform> pointsLinesView: PointsLinesView;
@group(1) @binding(0) 
var<uniform> material: PointsLinesMaterial;
@group(1) @binding(1) 
var baseColorSampler: sampler;
@group(1) @binding(2) 
var baseColorTexture: texture_2d<f32>;

fn clippedByPlanesX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS: vec3<f32>, planes: array<vec4<f32>, 6>, control: vec4<f32>) -> bool {
    var allOutside: bool;
    var anyOutside: bool = false;
    var index: u32 = 0u;
    var local_4: bool;
    var local_5: bool;

    let count = min(u32(max(control.x, 0f)), 6u);
    allOutside = (count > 0u);
    loop {
        let _e13 = index;
        if (_e13 < count) {
        } else {
            break;
        }
        {
            let _e17 = index;
            let _e21 = index;
            let outside = ((dot(planes[_e17].xyz, positionWS) + planes[_e21].w) < 0f);
            let _e28 = anyOutside;
            if !(_e28) {
                local_4 = outside;
            } else {
                local_4 = true;
            }
            let _e33 = local_4;
            anyOutside = _e33;
            let _e34 = allOutside;
            if _e34 {
                local_5 = outside;
            } else {
                local_5 = false;
            }
            let _e38 = local_5;
            allOutside = _e38;
        }
        continuing {
            let _e40 = index;
            index = (_e40 + 1u);
        }
    }
    let _e42 = anyOutside;
    let _e43 = allOutside;
    return select(_e42, _e43, (control.y > 0.5f));
}

fn applyLocalClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS_1: vec3<f32>, shadow: bool, planes_1: array<vec4<f32>, 6>, control_1: vec4<f32>) {
    var local_6: bool;
    var local_7: bool;

    if !(!(shadow)) {
        local_6 = (control_1.z > 0.5f);
    } else {
        local_6 = true;
    }
    let _e10 = local_6;
    if _e10 {
        let _e13 = clippedByPlanesX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS_1, planes_1, control_1);
        local_7 = _e13;
    } else {
        local_7 = false;
    }
    let _e17 = local_7;
    if _e17 {
        discard;
    } else {
        return;
    }
}

fn applyViewClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS_2: vec3<f32>, shadow_1: bool) {
    let _e2 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.clippingPlanes;
    let _e5 = viewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX.clippingControl;
    applyLocalClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(positionWS_2, shadow_1, _e2, _e5);
    return;
}

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
    var local_1: bool;

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
    if isLine {
        local_1 = (input.corner.x > 0f);
    } else {
        local_1 = false;
    }
    let _e45 = local_1;
    let clippingPosition = select(input.position, input.otherPosition, _e45);
    let _e50 = pointsLinesView.model;
    output.clippingPositionWS = (_e50 * vec4<f32>(clippingPosition, 1f)).xyz;
    output.shape = select(0f, 1f, isCircle);
    output.sampleCenter = select(input.corner, vec2<f32>(0f, 0f), isLine);
    let _e65 = output;
    return _e65;
}

@fragment 
fn fs_main(input_1: PointsLinesFragment) -> @location(0) vec4<f32> {
    var local_2: bool;
    var local_3: bool;

    applyViewClippingX_naga_oil_mod_XMZXXEZ3FMF4F6Y3MNFYHA2LOM45DU4DMMFXGK4YX(input_1.clippingPositionWS, false);
    if (input_1.shape > 0.5f) {
        let _e7 = circleCoverage(input_1.sampleCenter);
        local_2 = !(_e7);
    } else {
        local_2 = false;
    }
    let _e12 = local_2;
    if _e12 {
        discard;
    }
    let _e15 = material.baseColorTextureCoordinatesMetadata;
    let uv = _e15.xy;
    let textureColor = textureSample(baseColorTexture, baseColorSampler, uv);
    let _e22 = material.baseColor;
    let color = (_e22 * textureColor);
    let _e26 = material.alphaCutoff;
    if (_e26 > 0f) {
        let _e32 = material.alphaCutoff;
        local_3 = (color.w < _e32);
    } else {
        local_3 = false;
    }
    let _e37 = local_3;
    if _e37 {
        discard;
    }
    return color;
}
