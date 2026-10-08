struct SceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX {
    motionUv: vec2<f32>,
    viewDepth: f32,
    reactive: f32,
    validDepth: bool,
    motionValid: bool,
}

struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct MotionBlurParams {
    shutterAngle: f32,
    maxRadiusPixels: f32,
    sampleCount: u32,
    reset: u32,
    targetFps: f32,
    exposureScale: f32,
    frameDeltaSeconds: f32,
    flags: u32,
}

struct MotionBlurTemporalSample {
    motionUv: vec2<f32>,
    viewDepth: f32,
    reactive: f32,
    validDepth: bool,
    motionValid: bool,
}

struct MotionBlurDirectionCandidates {
    primary: vec2<f32>,
    secondary: vec2<f32>,
    primaryLength: f32,
    secondaryLength: f32,
}

const EDGE_FILL_FACTOR: f32 = 0.99f;
const RASTER_CANDIDATE_DIRECTION_COUNT: u32 = 8u;
const RASTER_CANDIDATE_SHELL_COUNT: u32 = 4u;
const RASTER_CANDIDATE_COUNT: u32 = 32u;

@group(1) @binding(0) 
var currentColor: texture_2d<f32>;
@group(1) @binding(1) 
var linearSampler: sampler;
@group(1) @binding(2) 
var<uniform> params: MotionBlurParams;
@group(1) @binding(3) 
var sceneTemporal: texture_2d<f32>;

fn unpackSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(packed: vec4<f32>) -> SceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX {
    let invalidDepth = (packed.z < 0f);
    let validDepth = !(invalidDepth);
    let viewDepth = select(0f, (exp2(packed.z) - 1f), validDepth);
    let motionUv = packed.xy;
    let motionInvalid = (packed.w >= 2f);
    let reactive = clamp((packed.w - select(0f, 2f, motionInvalid)), 0f, 1f);
    return SceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(motionUv, viewDepth, reactive, validDepth, !(motionInvalid));
}

fn fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    var x: f32 = -1f;
    var y: f32 = -1f;
    var out: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

    if (vertex_index == 1u) {
        x = 3f;
    }
    if (vertex_index == 2u) {
        y = 3f;
    }
    let _e10 = x;
    let u = ((_e10 + 1f) * 0.5f);
    let _e15 = y;
    let v = (1f - ((_e15 + 1f) * 0.5f));
    let _e24 = x;
    let _e25 = y;
    out.position = vec4<f32>(_e24, _e25, 0f, 1f);
    out.uv = vec2<f32>(u, v);
    let _e31 = out;
    return _e31;
}

fn rasterCandidateOffset(index_1: u32, supportPixels: f32) -> vec2<f32> {
    let directionIndex = (index_1 % RASTER_CANDIDATE_DIRECTION_COUNT);
    let shell = ((index_1 / RASTER_CANDIDATE_DIRECTION_COUNT) + 1u);
    let angle = (f32(directionIndex) * 0.7853982f);
    let radius_1 = ((max(1f, supportPixels) * f32(shell)) / 4f);
    return (vec2<f32>(cos(angle), sin(angle)) * radius_1);
}

fn depthReject(center: f32, sample: f32) -> bool {
    return (sample > (center + max(0.01f, (center * 0.01f))));
}

fn pixelInBounds(pixel: vec2<i32>, dimensions: vec2<i32>) -> bool {
    var local_26: bool;
    var local_27: bool;
    var local_28: bool;

    if (pixel.x >= 0i) {
        local_26 = (pixel.y >= 0i);
    } else {
        local_26 = false;
    }
    let _e10 = local_26;
    if _e10 {
        local_27 = (pixel.x < dimensions.x);
    } else {
        local_27 = false;
    }
    let _e18 = local_27;
    if _e18 {
        local_28 = (pixel.y < dimensions.y);
    } else {
        local_28 = false;
    }
    let _e25 = local_28;
    return _e25;
}

fn symmetricOffset(index_2: u32, count: u32, motion: vec2<f32>) -> vec2<f32> {
    let denominator = max(f32(count), 1f);
    return (motion * (((2f * (f32(index_2) + 0.5f)) / denominator) - 1f));
}

fn isFinite(value: f32) -> bool {
    var local_29: bool;

    if (value == value) {
        local_29 = (abs(value) < 3.402823e38f);
    } else {
        local_29 = false;
    }
    let _e8 = local_29;
    return _e8;
}

fn distinctDirection(a: vec2<f32>, b: vec2<f32>) -> bool {
    var local_30: bool;

    let aLength = length(a);
    let bLength = length(b);
    if !((aLength <= 0.00001f)) {
        local_30 = (bLength <= 0.00001f);
    } else {
        local_30 = true;
    }
    let _e12 = local_30;
    if _e12 {
        return false;
    }
    return (abs(dot((a / vec2(aLength)), (b / vec2(bLength)))) < 0.94f);
}

fn sourceVelocitySegmentCovers(receiverPixel: vec2<i32>, sourcePixel: vec2<i32>, motionPixels: vec2<f32>, radius: f32) -> bool {
    var local_31: bool;
    var local_32: bool;

    let delta = vec2<f32>((receiverPixel - sourcePixel));
    let motionLength = length(motionPixels);
    if !((motionLength <= 0.00001f)) {
        local_31 = (radius <= 0.00001f);
    } else {
        local_31 = true;
    }
    let _e15 = local_31;
    if _e15 {
        return false;
    }
    let direction = (motionPixels / vec2(motionLength));
    let along = dot(delta, direction);
    let perpendicular = abs(((delta.x * direction.y) - (delta.y * direction.x)));
    if (abs(along) <= (radius + 0.75f)) {
        local_32 = (perpendicular <= 0.75f);
    } else {
        local_32 = false;
    }
    let _e37 = local_32;
    return _e37;
}

fn temporalAt(pixel_1: vec2<i32>, colorDimensions: vec2<i32>, temporalDimensions: vec2<i32>) -> MotionBlurTemporalSample {
    let colorUv = ((vec2<f32>(pixel_1) + vec2(0.5f)) / vec2<f32>(colorDimensions));
    let temporalPixel = vec2<i32>(floor((colorUv * vec2<f32>(temporalDimensions))));
    let samplePixel = clamp(temporalPixel, vec2(0i), (temporalDimensions - vec2(1i)));
    let _e21 = textureLoad(sceneTemporal, samplePixel, 0i);
    let _e22 = unpackSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(_e21);
    return MotionBlurTemporalSample(_e22.motionUv, _e22.viewDepth, _e22.reactive, _e22.validDepth, _e22.motionValid);
}

fn selectNeighbourMotion(center_1: MotionBlurTemporalSample, pixel_2: vec2<i32>, colorDimensions_1: vec2<i32>, temporalDimensions_1: vec2<i32>, shutter: f32, exposureScale: f32, maxRadiusPixels: f32) -> MotionBlurDirectionCandidates {
    var selected: vec2<f32>;
    var selectedLength: f32;
    var secondary: vec2<f32> = vec2(0f);
    var secondaryLength: f32 = 0f;
    var index_3: u32 = 0u;
    var local_33: bool;
    var local_34: bool;
    var local_35: bool;
    var local_36: bool;

    selected = ((center_1.motionUv * vec2<f32>(colorDimensions_1)) * exposureScale);
    let _e11 = selected;
    selectedLength = length(_e11);
    loop {
        let _e15 = index_3;
        if (_e15 < RASTER_CANDIDATE_COUNT) {
        } else {
            break;
        }
        {
            let _e18 = index_3;
            let _e20 = rasterCandidateOffset(_e18, maxRadiusPixels);
            let candidatePixel = (pixel_2 + vec2<i32>(round(_e20)));
            let _e25 = pixelInBounds(candidatePixel, colorDimensions_1);
            if !(_e25) {
                continue;
            }
            let _e28 = temporalAt(candidatePixel, colorDimensions_1, temporalDimensions_1);
            if !(!(_e28.validDepth)) {
                local_33 = !(_e28.motionValid);
            } else {
                local_33 = true;
            }
            let _e37 = local_33;
            if !(_e37) {
                let _e41 = depthReject(center_1.viewDepth, _e28.viewDepth);
                local_34 = _e41;
            } else {
                local_34 = true;
            }
            let _e45 = local_34;
            if _e45 {
                continue;
            }
            let candidateMotion = ((_e28.motionUv * vec2<f32>(colorDimensions_1)) * exposureScale);
            let candidateLength = min(((length(candidateMotion) * shutter) * 0.5f), maxRadiusPixels);
            let _e56 = sourceVelocitySegmentCovers(pixel_2, candidatePixel, candidateMotion, candidateLength);
            if !(_e56) {
                continue;
            }
            let _e58 = selectedLength;
            let selectedRadius = min(((_e58 * shutter) * 0.5f), maxRadiusPixels);
            if (candidateLength > selectedRadius) {
                let _e64 = selectedLength;
                if (_e64 > 0.00001f) {
                    let _e67 = selected;
                    let _e68 = distinctDirection(_e67, candidateMotion);
                    local_35 = _e68;
                } else {
                    local_35 = false;
                }
                let _e72 = local_35;
                if _e72 {
                    let _e73 = selected;
                    secondary = _e73;
                    let _e75 = selectedLength;
                    secondaryLength = _e75;
                }
                selected = candidateMotion;
                selectedLength = length(candidateMotion);
            } else {
                let _e78 = secondaryLength;
                if (candidateLength > min(((_e78 * shutter) * 0.5f), maxRadiusPixels)) {
                    let _e84 = selected;
                    let _e85 = distinctDirection(_e84, candidateMotion);
                    local_36 = _e85;
                } else {
                    local_36 = false;
                }
                let _e89 = local_36;
                if _e89 {
                    secondary = candidateMotion;
                    secondaryLength = length(candidateMotion);
                }
            }
        }
        continuing {
            let _e91 = index_3;
            index_3 = (_e91 + 1u);
        }
    }
    let _e94 = selected;
    let _e95 = secondary;
    let _e96 = selectedLength;
    let _e97 = secondaryLength;
    return MotionBlurDirectionCandidates(_e94, _e95, _e96, _e97);
}

@vertex 
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertexIndex);
    return _e1;
}

@fragment 
fn fs_main(in: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    var local: bool;
    var local_1: bool;
    var local_2: bool;
    var local_3: bool;
    var local_4: bool;
    var local_5: bool;
    var local_6: bool;
    var local_7: bool;
    var local_8: bool;
    var local_9: bool;
    var local_10: bool;
    var local_11: bool;
    var local_12: bool;
    var local_13: bool;
    var local_14: bool;
    var local_15: bool;
    var local_16: bool;
    var accum: vec4<f32> = vec4(0f);
    var weight: f32 = 0f;
    var index: u32 = 0u;
    var local_17: bool;
    var local_18: bool;
    var local_19: bool;
    var local_20: bool;
    var local_21: bool;
    var local_22: bool;
    var local_23: bool;
    var local_24: bool;
    var local_25: bool;

    let _e4 = textureDimensions(currentColor);
    let colorDimensions_2 = vec2<i32>(_e4);
    let _e7 = textureDimensions(sceneTemporal);
    let temporalDimensions_2 = vec2<i32>(_e7);
    let pixel_3 = clamp(vec2<i32>(floor((in.uv * vec2<f32>(colorDimensions_2)))), vec2(0i), (colorDimensions_2 - vec2(1i)));
    let _e21 = temporalAt(pixel_3, colorDimensions_2, temporalDimensions_2);
    let _e24 = params.shutterAngle;
    let shutter_1 = clamp((_e24 / 360f), 0f, 1f);
    let invalidDepth_1 = !(_e21.validDepth);
    let invalidMotion = !(_e21.motionValid);
    let _e36 = params.frameDeltaSeconds;
    let _e37 = isFinite(_e36);
    if !(!(_e37)) {
        let _e42 = params.frameDeltaSeconds;
        local = (_e42 <= 0f);
    } else {
        local = true;
    }
    let _e48 = local;
    if !(_e48) {
        let _e52 = params.frameDeltaSeconds;
        local_1 = (_e52 > 0.1f);
    } else {
        local_1 = true;
    }
    let _e58 = local_1;
    if !(_e58) {
        let _e62 = params.exposureScale;
        let _e63 = isFinite(_e62);
        local_2 = !(_e63);
    } else {
        local_2 = true;
    }
    let _e68 = local_2;
    if !(_e68) {
        let _e72 = params.exposureScale;
        local_3 = (_e72 <= 0f);
    } else {
        local_3 = true;
    }
    let _e78 = local_3;
    if !(_e78) {
        let _e82 = params.targetFps;
        let _e83 = isFinite(_e82);
        local_4 = !(_e83);
    } else {
        local_4 = true;
    }
    let _e88 = local_4;
    if !(_e88) {
        let _e92 = params.targetFps;
        local_5 = (_e92 < 0f);
    } else {
        local_5 = true;
    }
    let _e98 = local_5;
    if !(_e98) {
        let _e102 = params.targetFps;
        local_6 = (_e102 > 240f);
    } else {
        local_6 = true;
    }
    let _e108 = local_6;
    if !(_e108) {
        let _e112 = params.targetFps;
        let _e115 = params.targetFps;
        local_7 = (_e112 != floor(_e115));
    } else {
        local_7 = true;
    }
    let invalidInterval = local_7;
    let _e124 = params.reset;
    let reset = (_e124 != 0u);
    if !(invalidDepth_1) {
        local_8 = invalidMotion;
    } else {
        local_8 = true;
    }
    let _e131 = local_8;
    if !(_e131) {
        local_9 = reset;
    } else {
        local_9 = true;
    }
    let _e136 = local_9;
    if !(_e136) {
        local_10 = invalidInterval;
    } else {
        local_10 = true;
    }
    let _e141 = local_10;
    if !(_e141) {
        let _e145 = params.sampleCount;
        local_11 = (_e145 < 4u);
    } else {
        local_11 = true;
    }
    let _e151 = local_11;
    if !(_e151) {
        local_12 = (shutter_1 <= 0f);
    } else {
        local_12 = true;
    }
    let _e158 = local_12;
    if !(_e158) {
        let _e162 = params.maxRadiusPixels;
        local_13 = (_e162 <= 0f);
    } else {
        local_13 = true;
    }
    let _e168 = local_13;
    if _e168 {
        let _e171 = textureLoad(currentColor, pixel_3, 0i);
        return _e171;
    }
    let _e174 = params.exposureScale;
    let _e177 = params.maxRadiusPixels;
    let _e178 = selectNeighbourMotion(_e21, pixel_3, colorDimensions_2, temporalDimensions_2, shutter_1, _e174, _e177);
    let _e185 = params.maxRadiusPixels;
    let radius_2 = min(((_e178.primaryLength * shutter_1) * 0.5f), _e185);
    let _e193 = params.maxRadiusPixels;
    let secondaryRadius = min(((_e178.secondaryLength * shutter_1) * 0.5f), _e193);
    if (secondaryRadius > 0.00001f) {
        let _e199 = distinctDirection(_e178.primary, _e178.secondary);
        local_14 = _e199;
    } else {
        local_14 = false;
    }
    let hasSecondary = local_14;
    let motion_1 = normalize(select(vec2(0f), _e178.primary, (radius_2 > 0.00001f)));
    if (radius_2 <= 0.00001f) {
        local_15 = !(hasSecondary);
    } else {
        local_15 = false;
    }
    let _e217 = local_15;
    if _e217 {
        let _e220 = textureLoad(currentColor, pixel_3, 0i);
        return _e220;
    }
    let centerColor = textureLoad(currentColor, pixel_3, 0i);
    if _e21.motionValid {
        local_16 = (length(_e21.motionUv) > 0.00001f);
    } else {
        local_16 = false;
    }
    let centerMoving = local_16;
    let dimensions_1 = vec2<f32>(colorDimensions_2);
    let _e236 = params.sampleCount;
    let count_1 = min(_e236, 16u);
    let supportCount = max((count_1 - 1u), 1u);
    let primaryCount = select(supportCount, max((supportCount / 2u), 1u), hasSecondary);
    let secondaryCount = max((supportCount - primaryCount), 1u);
    loop {
        let _e252 = index;
        if (_e252 < 16u) {
        } else {
            break;
        }
        {
            let _e255 = index;
            if (_e255 >= supportCount) {
                break;
            }
            if hasSecondary {
                let _e257 = index;
                local_17 = (_e257 >= primaryCount);
            } else {
                local_17 = false;
            }
            let secondDirection = local_17;
            let selectedCount = select(primaryCount, secondaryCount, secondDirection);
            let _e264 = index;
            let _e265 = index;
            let selectedIndex = select(_e264, (_e265 - primaryCount), secondDirection);
            let selectedMotion = select(motion_1, normalize(select(vec2(0f), _e178.secondary, (secondaryRadius > 0.00001f))), secondDirection);
            let selectedRadius_1 = select(radius_2, secondaryRadius, secondDirection);
            let _e278 = symmetricOffset(selectedIndex, selectedCount, (selectedMotion * selectedRadius_1));
            let offset = (_e278 / dimensions_1);
            let sampleUv = (in.uv + offset);
            if !((sampleUv.x < 0f)) {
                local_18 = (sampleUv.y < 0f);
            } else {
                local_18 = true;
            }
            let _e292 = local_18;
            if !(_e292) {
                local_19 = (sampleUv.x >= 1f);
            } else {
                local_19 = true;
            }
            let _e300 = local_19;
            if !(_e300) {
                local_20 = (sampleUv.y >= 1f);
            } else {
                local_20 = true;
            }
            let _e308 = local_20;
            if _e308 {
                continue;
            }
            let samplePixel_1 = vec2<i32>(floor((sampleUv * dimensions_1)));
            let _e312 = pixelInBounds(samplePixel_1, colorDimensions_2);
            if !(_e312) {
                continue;
            }
            let _e314 = temporalAt(samplePixel_1, colorDimensions_2, temporalDimensions_2);
            if _e314.validDepth {
                local_21 = _e314.motionValid;
            } else {
                local_21 = false;
            }
            let _e320 = local_21;
            if _e320 {
                let _e323 = depthReject(_e21.viewDepth, _e314.viewDepth);
                local_22 = !(_e323);
            } else {
                local_22 = false;
            }
            let _e328 = local_22;
            if _e328 {
                let _e334 = params.exposureScale;
                let _e341 = params.exposureScale;
                let _e349 = params.maxRadiusPixels;
                let _e351 = sourceVelocitySegmentCovers(pixel_3, samplePixel_1, ((_e314.motionUv * vec2<f32>(colorDimensions_2)) * _e334), min(((length(((_e314.motionUv * vec2<f32>(colorDimensions_2)) * _e341)) * shutter_1) * 0.5f), _e349));
                local_23 = _e351;
            } else {
                local_23 = false;
            }
            let _e355 = local_23;
            if _e355 {
                let sampleColor = textureSampleLevel(currentColor, linearSampler, sampleUv, 0f);
                let _e361 = accum;
                accum = (_e361 + sampleColor);
                let _e364 = weight;
                weight = (_e364 + 1f);
            }
        }
        continuing {
            let _e367 = index;
            index = (_e367 + 1u);
        }
    }
    let _e371 = weight;
    let uncovered = max((f32(supportCount) - _e371), 0f);
    let _e377 = accum;
    let _e379 = weight;
    let _e384 = weight;
    let acceptedColor = select(vec3(0f), (_e377.xyz / vec3(max(_e379, 1f))), (_e384 > 0f));
    let missingForeground = (1f - clamp(centerColor.w, 0f, 1f));
    let edgeCoverage = select(missingForeground, 1f, centerMoving);
    let edgeFill = ((acceptedColor * edgeCoverage) * EDGE_FILL_FACTOR);
    let _e400 = weight;
    let movingFallback = select(centerColor.xyz, edgeFill, (_e400 > 0f));
    let uncoveredColor = select(vec3(0f), movingFallback, centerMoving);
    let _e408 = accum.w;
    let _e409 = weight;
    let _e413 = weight;
    let acceptedAlpha = select(0f, (_e408 / max(_e409, 1f)), (_e413 > 0f));
    let _e418 = weight;
    let acceptedCoverage = (_e418 + (missingForeground * uncovered));
    let reconstructedAlpha = ((acceptedAlpha * acceptedCoverage) / max(f32(count_1), 1f));
    let outputAlpha = clamp(max(centerColor.w, reconstructedAlpha), 0f, 1f);
    if !(centerMoving) {
        let _e432 = weight;
        local_24 = (_e432 > 0f);
    } else {
        local_24 = false;
    }
    let _e438 = local_24;
    if _e438 {
        local_25 = (max(max(abs(centerColor.x), abs(centerColor.y)), abs(centerColor.z)) < 0.0001f);
    } else {
        local_25 = false;
    }
    let emptyReceiver = local_25;
    let sourceScale = select(1f, 0.00999999f, emptyReceiver);
    let _e456 = accum;
    let sourceContribution = (_e456.xyz * sourceScale);
    let trailScale = select(1f, 0.00999999f, emptyReceiver);
    let trailContribution = ((uncoveredColor * uncovered) * trailScale);
    return vec4<f32>((((sourceContribution + centerColor.xyz) + trailContribution) / vec3(max(f32(count_1), 1f))), outputAlpha);
}
