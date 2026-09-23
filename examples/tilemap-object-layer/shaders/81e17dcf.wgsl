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

struct DepthOfFieldParams {
    optics: vec4<f32>,
    image: vec4<f32>,
    camera: vec4<f32>,
    reserved: vec4<f32>,
}

struct DepthSample {
    depth: f32,
    coverage: f32,
}

@group(1) @binding(0) 
var currentColor: texture_2d<f32>;
@group(1) @binding(1) 
var linearSampler: sampler;
@group(1) @binding(2) 
var<uniform> params: DepthOfFieldParams;
@group(1) @binding(3) 
var sceneDepth: texture_depth_multisampled_2d;
@group(1) @binding(4) 
var depthSampler: sampler;
@group(1) @binding(5) 
var extra0_: texture_2d<f32>;
@group(1) @binding(6) 
var extra1_: texture_2d<f32>;
@group(1) @binding(7) 
var extra2_: texture_2d<f32>;
@group(1) @binding(8) 
var extra3_: texture_2d<f32>;
@group(1) @binding(9) 
var extra4_: texture_2d<f32>;

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

fn validNumber(value: f32) -> bool {
    var local_16: bool;

    if (value == value) {
        local_16 = (abs(value) < 3.402823e38f);
    } else {
        local_16 = false;
    }
    let _e8 = local_16;
    return _e8;
}

fn linearDepth(raw: f32) -> f32 {
    var local_17: bool;
    var local_18: bool;
    var local_19: bool;
    var local_20: bool;
    var local_21: bool;
    var local_22: bool;
    var local_23: bool;
    var local_24: bool;

    let _e1 = validNumber(raw);
    if !(!(_e1)) {
        local_17 = (raw <= 0f);
    } else {
        local_17 = true;
    }
    let _e9 = local_17;
    if !(_e9) {
        local_18 = (raw >= 1f);
    } else {
        local_18 = true;
    }
    let _e16 = local_18;
    if _e16 {
        return 0f;
    }
    let near = params.camera.x;
    let far = params.camera.y;
    let _e26 = validNumber(near);
    if !(!(_e26)) {
        let _e29 = validNumber(far);
        local_19 = !(_e29);
    } else {
        local_19 = true;
    }
    let _e34 = local_19;
    if !(_e34) {
        local_20 = (near <= 0f);
    } else {
        local_20 = true;
    }
    let _e41 = local_20;
    if !(_e41) {
        local_21 = (far <= near);
    } else {
        local_21 = true;
    }
    let _e47 = local_21;
    if _e47 {
        return 0f;
    }
    let depthRatio = (near / far);
    let _e50 = validNumber(depthRatio);
    if !(!(_e50)) {
        local_22 = (depthRatio <= 0f);
    } else {
        local_22 = true;
    }
    let _e58 = local_22;
    if _e58 {
        return 0f;
    }
    let denominator = ((1f - raw) + (raw * depthRatio));
    let _e64 = validNumber(denominator);
    if !(!(_e64)) {
        local_23 = (denominator <= 0f);
    } else {
        local_23 = true;
    }
    let _e72 = local_23;
    if _e72 {
        return 0f;
    }
    let distance_ = (near / denominator);
    let _e75 = validNumber(distance_);
    if _e75 {
        local_24 = (distance_ > 0f);
    } else {
        local_24 = false;
    }
    let _e81 = local_24;
    return select(0f, distance_, _e81);
}

fn depthAndCoverageAt(uv: vec2<f32>) -> DepthSample {
    var local_25: bool;
    var local_26: bool;
    var nearest: f32 = 1f;
    var sampleIndex: u32 = 0u;
    var local_27: bool;
    var local_28: bool;
    var nearestSamples: u32 = 0u;
    var sampleIndex_1: u32 = 0u;
    var local_29: bool;
    var local_30: bool;
    var local_31: bool;
    var local_32: bool;
    var local_33: bool;

    let _e5 = params.camera.z;
    if (_e5 > 0.5f) {
        let _e12 = textureSampleLevel(extra0_, linearSampler, uv, 0f);
        let _e13 = unpackSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(_e12);
        if _e13.validDepth {
            let _e16 = validNumber(_e13.viewDepth);
            local_25 = _e16;
        } else {
            local_25 = false;
        }
        let _e20 = local_25;
        if _e20 {
            local_26 = (_e13.viewDepth > 0f);
        } else {
            local_26 = false;
        }
        let valid = local_26;
        return DepthSample(select(0f, _e13.viewDepth, valid), select(0f, 1f, valid));
    }
    let _e36 = textureDimensions(sceneDepth);
    let size = vec2<i32>(_e36);
    let pixel = clamp(vec2<i32>((uv * vec2<f32>(size))), vec2(0i), (size - vec2(1i)));
    loop {
        let _e48 = sampleIndex;
        if (_e48 < 4u) {
        } else {
            break;
        }
        {
            let _e52 = sampleIndex;
            let raw_1 = textureLoad(sceneDepth, pixel, _e52);
            let _e54 = validNumber(raw_1);
            if _e54 {
                local_27 = (raw_1 > 0f);
            } else {
                local_27 = false;
            }
            let _e60 = local_27;
            if _e60 {
                local_28 = (raw_1 < 1f);
            } else {
                local_28 = false;
            }
            let _e66 = local_28;
            if _e66 {
                let _e68 = nearest;
                nearest = min(_e68, raw_1);
            }
        }
        continuing {
            let _e70 = sampleIndex;
            sampleIndex = (_e70 + 1u);
        }
    }
    let _e73 = nearest;
    let _e74 = linearDepth(_e73);
    let layerTolerance = max(0.02f, (_e74 * 0.04f));
    loop {
        let _e80 = sampleIndex_1;
        if (_e80 < 4u) {
        } else {
            break;
        }
        {
            let _e84 = sampleIndex_1;
            let raw_2 = textureLoad(sceneDepth, pixel, _e84);
            let _e86 = validNumber(raw_2);
            if _e86 {
                local_29 = (raw_2 > 0f);
            } else {
                local_29 = false;
            }
            let _e92 = local_29;
            if _e92 {
                local_30 = (raw_2 < 1f);
            } else {
                local_30 = false;
            }
            let _e98 = local_30;
            if _e98 {
                let _e99 = linearDepth(raw_2);
                if (_e99 > 0f) {
                    local_31 = (abs((_e99 - _e74)) <= layerTolerance);
                } else {
                    local_31 = false;
                }
                let _e108 = local_31;
                if _e108 {
                    let _e110 = nearestSamples;
                    nearestSamples = (_e110 + 1u);
                }
            }
        }
        continuing {
            let _e113 = sampleIndex_1;
            sampleIndex_1 = (_e113 + 1u);
        }
    }
    let _e116 = nearestSamples;
    if (_e116 > 0u) {
        local_32 = (_e74 > 0f);
    } else {
        local_32 = false;
    }
    let _e124 = local_32;
    if _e124 {
        let _e125 = validNumber(_e74);
        local_33 = _e125;
    } else {
        local_33 = false;
    }
    let valid_1 = local_33;
    let _e132 = nearestSamples;
    return DepthSample(select(0f, _e74, valid_1), select(0f, (f32(_e132) / 4f), valid_1));
}

fn depthAt(uv_1: vec2<f32>) -> f32 {
    let _e1 = depthAndCoverageAt(uv_1);
    return _e1.depth;
}

fn selectedCoc(coc: f32) -> bool {
    let _e3 = params.image.z;
    if (_e3 < 0.5f) {
        return (abs(coc) > 0.001f);
    }
    let _e13 = params.image.z;
    if (_e13 < 1.5f) {
        return (coc < -0.001f);
    }
    return (coc > 0.001f);
}

fn selectedCocForSide(coc_1: f32, nearSide: bool) -> bool {
    return select((coc_1 > 0.001f), (coc_1 < -0.001f), nearSide);
}

fn tapLimit() -> f32 {
    let _e3 = params.image.w;
    if (_e3 < 0.5f) {
        return 16f;
    }
    let _e10 = params.image.w;
    if (_e10 < 1.5f) {
        return 32f;
    }
    return 64f;
}

fn diskOffset(index_1: u32, count: f32) -> vec2<f32> {
    let i = f32(index_1);
    let angle = (i * 2.3999631f);
    let radius = sqrt(((i + 0.5f) / max(count, 1f)));
    return (vec2<f32>(cos(angle), sin(angle)) * radius);
}

fn sourceDiskOffset(index_2: u32, count_1: f32) -> vec2<f32> {
    let localCount = max(1f, floor((count_1 * 0.25f)));
    if (f32(index_2) < localCount) {
        let _e9 = diskOffset(index_2, localCount);
        let _e13 = params.image.y;
        return (_e9 * min(_e13, 3f));
    }
    let _e22 = diskOffset((index_2 - u32(localCount)), max((count_1 - localCount), 1f));
    let _e26 = params.image.y;
    return (_e22 * _e26);
}

fn signedCoc(depth: f32) -> f32 {
    var local_34: bool;
    var local_35: bool;
    var local_36: bool;
    var local_37: bool;
    var local_38: bool;

    if !((depth <= 0f)) {
        let _e4 = validNumber(depth);
        local_34 = !(_e4);
    } else {
        local_34 = true;
    }
    let _e9 = local_34;
    if _e9 {
        return 0f;
    }
    let focus = params.optics.x;
    let outputHeight = params.image.x;
    let cocCoefficient = params.reserved.x;
    if !((cocCoefficient <= 0f)) {
        let _e26 = validNumber(cocCoefficient);
        local_35 = !(_e26);
    } else {
        local_35 = true;
    }
    let _e31 = local_35;
    if !(_e31) {
        let _e33 = validNumber(outputHeight);
        local_36 = !(_e33);
    } else {
        local_36 = true;
    }
    let _e38 = local_36;
    if !(_e38) {
        local_37 = (outputHeight <= 0f);
    } else {
        local_37 = true;
    }
    let _e45 = local_37;
    if _e45 {
        return 0f;
    }
    let focusOverDepth = (focus / depth);
    let _e48 = validNumber(focusOverDepth);
    if !(_e48) {
        return 0f;
    }
    let depthFactor = (1f - focusOverDepth);
    let radius_1 = (cocCoefficient * depthFactor);
    let _e54 = validNumber(depthFactor);
    if !(!(_e54)) {
        let _e57 = validNumber(radius_1);
        local_38 = !(_e57);
    } else {
        local_38 = true;
    }
    let _e62 = local_38;
    if _e62 {
        return 0f;
    }
    let _e67 = params.image.y;
    let _e72 = params.image.y;
    return clamp(radius_1, -(_e67), _e72);
}

fn cocAt(uv_2: vec2<f32>) -> f32 {
    let encoded = textureSampleLevel(extra0_, linearSampler, uv_2, 0f);
    let _e7 = validNumber(encoded.x);
    return select(0f, encoded.x, _e7);
}

fn cocAtExtra1_(uv_3: vec2<f32>) -> f32 {
    let encoded_1 = textureSampleLevel(extra1_, linearSampler, uv_3, 0f);
    let _e7 = validNumber(encoded_1.x);
    return select(0f, encoded_1.x, _e7);
}

fn cocCoverageAt(uv_4: vec2<f32>) -> f32 {
    let encoded_2 = textureSampleLevel(extra0_, linearSampler, uv_4, 0f);
    let _e10 = validNumber(encoded_2.w);
    return select(0f, clamp(encoded_2.w, 0f, 1f), _e10);
}

fn cocCoverageAtExtra1_(uv_5: vec2<f32>) -> f32 {
    let encoded_3 = textureSampleLevel(extra1_, linearSampler, uv_5, 0f);
    let _e10 = validNumber(encoded_3.w);
    return select(0f, clamp(encoded_3.w, 0f, 1f), _e10);
}

fn internalToOutputScale() -> f32 {
    let _e1 = textureDimensions(extra1_);
    let _e7 = params.image.x;
    return (f32(_e1.y) / max(_e7, 1f));
}

fn circleKernelMean(sourceRadius: f32, domainRadius: f32) -> f32 {
    let sampleRadius = max(domainRadius, 0.00001f);
    let kernelRadius = max((sourceRadius + 1f), 0.00001f);
    if (kernelRadius <= sampleRadius) {
        return max(((kernelRadius * kernelRadius) / ((3f * sampleRadius) * sampleRadius)), 0.00001f);
    }
    return max((1f - ((2f * sampleRadius) / (3f * kernelRadius))), 0.00001f);
}

fn sourceKernelMean(sourceRadius_1: f32, tapCount: f32) -> f32 {
    let _e3 = params.image.y;
    let domainRadius_1 = max(_e3, 0.00001f);
    let localCount_1 = max(1f, floor((tapCount * 0.25f)));
    let outerCount = max((tapCount - localCount_1), 1f);
    let _e18 = circleKernelMean(sourceRadius_1, min(domainRadius_1, 3f));
    let _e19 = circleKernelMean(sourceRadius_1, domainRadius_1);
    return max((((localCount_1 * _e18) + (outerCount * _e19)) / max(tapCount, 1f)), 0.00001f);
}

fn prefilter(in_11: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, nearSide_1: bool) -> vec4<f32> {
    var color_2: vec3<f32> = vec3(0f);
    var weight_1: f32 = 0f;
    var coverage: f32 = 0f;
    var index_3: u32 = 0u;
    var local_39: bool;

    let _e4 = textureDimensions(currentColor);
    let sourceSize = vec2<f32>(_e4);
    let texel = (vec2(1f) / sourceSize);
    loop {
        let _e10 = index_3;
        if (_e10 < 4u) {
        } else {
            break;
        }
        {
            let _e13 = index_3;
            let _e17 = index_3;
            let offset = (vec2<f32>(f32((_e13 & 1u)), f32((_e17 >> 1u))) - vec2(0.5f));
            let uv_7 = clamp((in_11.uv + (offset * texel)), vec2(0f), vec2(1f));
            let _e34 = cocAt(uv_7);
            let _e35 = cocCoverageAt(uv_7);
            let _e37 = selectedCocForSide(_e34, nearSide_1);
            if _e37 {
                local_39 = (_e35 > 0f);
            } else {
                local_39 = false;
            }
            let valid_2 = local_39;
            let sampleWeight = select(0f, _e35, valid_2);
            let _e47 = color_2;
            let _e51 = textureSampleLevel(currentColor, linearSampler, uv_7, 0f);
            color_2 = (_e47 + (_e51.xyz * sampleWeight));
            let _e56 = weight_1;
            weight_1 = (_e56 + sampleWeight);
            let _e59 = coverage;
            coverage = (_e59 + select(0f, (0.25f * _e35), valid_2));
        }
        continuing {
            let _e65 = index_3;
            index_3 = (_e65 + 1u);
        }
    }
    let _e68 = weight_1;
    let positiveWeight = max(_e68, 0.00001f);
    let _e75 = textureSampleLevel(currentColor, linearSampler, in_11.uv, 0f);
    let fallbackColor = _e75.xyz;
    let _e77 = color_2;
    let _e80 = weight_1;
    let resolvedColor = select(fallbackColor, (_e77 / vec3(positiveWeight)), (_e80 > 0f));
    let _e84 = coverage;
    return vec4<f32>(resolvedColor, _e84);
}

fn prefilterMetadata(in_12: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, nearSide_2: bool) -> vec4<f32> {
    var maxRadius: f32 = 0f;
    var minDepth: f32 = 3.402823e38f;
    var maxDepth: f32 = 0f;
    var coverage_1: f32 = 0f;
    var index_4: u32 = 0u;
    var local_40: bool;
    var local_41: bool;

    let _e4 = textureDimensions(currentColor);
    let sourceSize_1 = vec2<f32>(_e4);
    let texel_1 = (vec2(1f) / sourceSize_1);
    loop {
        let _e10 = index_4;
        if (_e10 < 4u) {
        } else {
            break;
        }
        {
            let _e13 = index_4;
            let _e17 = index_4;
            let offset_1 = (vec2<f32>(f32((_e13 & 1u)), f32((_e17 >> 1u))) - vec2(0.5f));
            let uv_8 = clamp((in_12.uv + (offset_1 * texel_1)), vec2(0f), vec2(1f));
            let _e34 = cocAtExtra1_(uv_8);
            let _e35 = cocCoverageAtExtra1_(uv_8);
            let _e37 = selectedCocForSide(_e34, nearSide_2);
            if _e37 {
                local_40 = (_e35 > 0f);
            } else {
                local_40 = false;
            }
            let _e43 = local_40;
            if _e43 {
                let _e44 = depthAndCoverageAt(uv_8);
                let _e46 = maxRadius;
                maxRadius = max(_e46, abs(_e34));
                if (_e44.depth > 0f) {
                    local_41 = (_e44.coverage > 0f);
                } else {
                    local_41 = false;
                }
                let _e58 = local_41;
                if _e58 {
                    let _e60 = minDepth;
                    minDepth = min(_e60, _e44.depth);
                    let _e64 = maxDepth;
                    maxDepth = max(_e64, _e44.depth);
                    let _e68 = coverage_1;
                    coverage_1 = (_e68 + ((0.25f * _e35) * _e44.coverage));
                }
            }
        }
        continuing {
            let _e74 = index_4;
            index_4 = (_e74 + 1u);
        }
    }
    let _e77 = minDepth;
    let _e78 = coverage_1;
    let safeMinDepth = select(0f, _e77, (_e78 > 0f));
    let _e83 = maxRadius;
    let _e84 = maxDepth;
    let _e85 = coverage_1;
    return vec4<f32>(_e83, safeMinDepth, _e84, _e85);
}

fn depthReject(center: f32, sample: f32) -> bool {
    var local_42: bool;

    if !((center <= 0f)) {
        local_42 = (sample <= 0f);
    } else {
        local_42 = true;
    }
    let _e10 = local_42;
    if _e10 {
        return true;
    }
    return (abs((center - sample)) > max(0.02f, (center * 0.04f)));
}

fn nearDepthAccept(center_1: f32, sample_1: f32) -> bool {
    var local_43: bool;

    if !((center_1 <= 0f)) {
        local_43 = (sample_1 <= 0f);
    } else {
        local_43 = true;
    }
    let _e10 = local_43;
    if _e10 {
        return false;
    }
    return (sample_1 <= (center_1 + max(0.02f, (center_1 * 0.04f))));
}

fn gather(in_13: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX, nearSide_3: bool) -> vec4<f32> {
    var color_3: vec3<f32> = vec3(0f);
    var weight_2: f32 = 0f;
    var coverage_2: f32 = 0f;
    var coverageCapacity_1: f32 = 0f;
    var index_5: u32 = 0u;
    var local_44: bool;
    var local_45: bool;
    var depthMatch: bool;
    var local_46: bool;
    var local_47: bool;

    let _e4 = textureDimensions(extra1_);
    let sourceSize_2 = vec2<f32>(_e4);
    let _e6 = internalToOutputScale();
    let _e9 = depthAt(in_13.uv);
    loop {
        let _e11 = index_5;
        if (_e11 < 64u) {
        } else {
            break;
        }
        {
            let _e14 = index_5;
            let _e16 = tapLimit();
            if (f32(_e14) >= _e16) {
                break;
            }
            let _e18 = index_5;
            let _e19 = tapLimit();
            let _e20 = sourceDiskOffset(_e18, _e19);
            let offset_2 = ((_e20 * _e6) / sourceSize_2);
            let uv_9 = clamp((in_13.uv + offset_2), vec2(0f), vec2(1f));
            let _e30 = cocAtExtra1_(uv_9);
            let _e31 = cocCoverageAtExtra1_(uv_9);
            let metadata = textureSampleLevel(extra2_, linearSampler, uv_9, 0f);
            let sourceRadius_2 = max(abs(_e30), metadata.x);
            let distancePixels = (length(((uv_9 - in_13.uv) * sourceSize_2)) / max(_e6, 0.00001f));
            let supportWeight = clamp((((sourceRadius_2 + 1f) - distancePixels) / max((sourceRadius_2 + 1f), 1f)), 0f, 1f);
            let sourceCoverageFactor = smoothstep(2f, 3f, sourceRadius_2);
            let sideMatch = select((_e30 > 0.001f), (_e30 < -0.001f), nearSide_3);
            let _e66 = depthAt(uv_9);
            if !((metadata.w <= 0f)) {
                if (_e66 >= (metadata.y - max(0.02f, (_e66 * 0.04f)))) {
                    local_45 = (_e66 <= (metadata.z + max(0.02f, (_e66 * 0.04f))));
                } else {
                    local_45 = false;
                }
                let _e88 = local_45;
                local_44 = _e88;
            } else {
                local_44 = true;
            }
            let metadataDepth = local_44;
            depthMatch = false;
            if nearSide_3 {
                let _e95 = nearDepthAccept(_e9, _e66);
                depthMatch = _e95;
            } else {
                let _e96 = depthReject(_e9, _e66);
                depthMatch = !(_e96);
            }
            let sourceCapacity = select(0f, _e31, (_e31 > 0f));
            let _e103 = coverageCapacity_1;
            coverageCapacity_1 = (_e103 + sourceCapacity);
            if sideMatch {
                local_46 = metadataDepth;
            } else {
                local_46 = false;
            }
            let _e108 = local_46;
            if _e108 {
                let _e109 = depthMatch;
                local_47 = _e109;
            } else {
                local_47 = false;
            }
            let accepted = local_47;
            let _e114 = tapLimit();
            let _e115 = sourceKernelMean(sourceRadius_2, _e114);
            let normalizedSupport = (supportWeight / _e115);
            let sample_2 = textureSampleLevel(currentColor, linearSampler, uv_9, 0f);
            let sampleAreaWeight = (_e31 * sample_2.w);
            let rawSampleWeight = select(0f, ((supportWeight * sourceCoverageFactor) * sampleAreaWeight), accepted);
            let coverageWeight = select(0f, ((normalizedSupport * sourceCoverageFactor) * sampleAreaWeight), accepted);
            let _e132 = color_3;
            color_3 = (_e132 + (sample_2.xyz * rawSampleWeight));
            let _e137 = weight_2;
            weight_2 = (_e137 + rawSampleWeight);
            let _e140 = coverage_2;
            coverage_2 = (_e140 + coverageWeight);
        }
        continuing {
            let _e142 = index_5;
            index_5 = (_e142 + 1u);
        }
    }
    let _e145 = weight_2;
    let positiveWeight_1 = max(_e145, 0.00001f);
    let _e148 = coverage_2;
    let _e149 = coverageCapacity_1;
    let alpha = clamp((_e148 / max(_e149, 0.00001f)), 0f, 1f);
    let _e160 = textureSampleLevel(currentColor, linearSampler, in_13.uv, 0f);
    let fallbackColor_1 = _e160.xyz;
    let _e162 = color_3;
    let _e165 = weight_2;
    let resolvedColor_1 = select(fallbackColor_1, (_e162 / vec3(positiveWeight_1)), (_e165 > 0f));
    return vec4<f32>(resolvedColor_1, alpha);
}

fn smallTapLimit() -> f32 {
    let _e3 = params.image.w;
    if (_e3 < 0.5f) {
        return 8f;
    }
    let _e10 = params.image.w;
    if (_e10 < 1.5f) {
        return 16f;
    }
    return 24f;
}

fn smallBlur(uv_6: vec2<f32>, nearSide_4: bool, radiusPixels: f32) -> vec4<f32> {
    var color_4: vec3<f32>;
    var weight_3: f32 = 1f;
    var index_6: u32 = 0u;
    var depthMatch_1: bool;
    var local_48: bool;
    var local_49: bool;

    let _e3 = textureDimensions(extra1_);
    let sourceSize_3 = vec2<f32>(_e3);
    let _e5 = internalToOutputScale();
    let _e6 = smallTapLimit();
    let _e8 = depthAt(uv_6);
    let _e12 = textureSampleLevel(currentColor, linearSampler, uv_6, 0f);
    color_4 = _e12.xyz;
    loop {
        let _e16 = index_6;
        if (_e16 < 24u) {
        } else {
            break;
        }
        {
            let _e19 = index_6;
            if (f32(_e19) >= _e6) {
                break;
            }
            let _e22 = index_6;
            let _e23 = diskOffset(_e22, _e6);
            let sampleUv = clamp((uv_6 + (((_e23 * radiusPixels) * _e5) / sourceSize_3)), vec2(0f), vec2(1f));
            let _e34 = cocAtExtra1_(sampleUv);
            let _e35 = cocCoverageAtExtra1_(sampleUv);
            let smallSourceFactor = (1f - smoothstep(2f, 3f, abs(_e34)));
            let signedMatch = select((_e34 > 0.001f), (_e34 < -0.001f), nearSide_4);
            let distancePixels_1 = (length(((sampleUv - uv_6) * sourceSize_3)) / max(_e5, 0.00001f));
            let supports = (distancePixels_1 <= (abs(_e34) + 0.5f));
            let _e58 = depthAt(sampleUv);
            depthMatch_1 = false;
            if nearSide_4 {
                let _e61 = nearDepthAccept(_e8, _e58);
                depthMatch_1 = _e61;
            } else {
                let _e62 = depthReject(_e8, _e58);
                depthMatch_1 = !(_e62);
            }
            if signedMatch {
                local_48 = supports;
            } else {
                local_48 = false;
            }
            let _e67 = local_48;
            if _e67 {
                let _e68 = depthMatch_1;
                local_49 = _e68;
            } else {
                local_49 = false;
            }
            let accepted_1 = local_49;
            let sampleWeight_1 = select(0f, (_e35 * smallSourceFactor), accepted_1);
            let _e76 = color_4;
            let _e80 = textureSampleLevel(currentColor, linearSampler, sampleUv, 0f);
            color_4 = (_e76 + (_e80.xyz * sampleWeight_1));
            let _e85 = weight_3;
            weight_3 = (_e85 + sampleWeight_1);
        }
        continuing {
            let _e87 = index_6;
            index_6 = (_e87 + 1u);
        }
    }
    let _e90 = weight_3;
    let _e93 = weight_3;
    let confidence = clamp(((_e90 - 1f) / max(_e93, 1f)), 0f, 1f);
    let _e100 = color_4;
    let _e101 = weight_3;
    return vec4<f32>((_e100 / vec3(max(_e101, 1f))), confidence);
}

@vertex 
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertexIndex);
    return _e1;
}

@fragment 
fn fs_coc(in: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    let _e2 = depthAndCoverageAt(in.uv);
    let _e4 = signedCoc(_e2.depth);
    return vec4<f32>(_e4, abs(_e4), _e2.coverage, _e2.coverage);
}

@fragment 
fn fs_prefilter(in_1: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    let _e3 = params.image.z;
    let _e7 = prefilter(in_1, (_e3 < 1.5f));
    return _e7;
}

@fragment 
fn fs_prefilter_near(in_2: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    let _e2 = prefilter(in_2, true);
    return _e2;
}

@fragment 
fn fs_prefilter_far(in_3: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    let _e2 = prefilter(in_3, false);
    return _e2;
}

@fragment 
fn fs_prefilter_metadata(in_4: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    let _e3 = params.image.z;
    let _e7 = prefilterMetadata(in_4, (_e3 < 1.5f));
    return _e7;
}

@fragment 
fn fs_prefilter_metadata_near(in_5: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    let _e2 = prefilterMetadata(in_5, true);
    return _e2;
}

@fragment 
fn fs_prefilter_metadata_far(in_6: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    let _e2 = prefilterMetadata(in_6, false);
    return _e2;
}

@fragment 
fn fs_gather_near(in_7: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    let _e2 = gather(in_7, true);
    return _e2;
}

@fragment 
fn fs_gather_far(in_8: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    let _e2 = gather(in_8, false);
    return _e2;
}

@fragment 
fn fs_background(in_9: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    var color: vec3<f32> = vec3(0f);
    var weight: f32 = 0f;
    var nearCoverage: f32 = 0f;
    var coverageCapacity: f32 = 0f;
    var index: u32 = 0u;
    var local: bool;
    var local_1: bool;
    var local_2: bool;
    var local_3: bool;
    var local_4: bool;
    var local_5: bool;

    let _e4 = textureDimensions(extra1_);
    let sourceSize_4 = vec2<f32>(_e4);
    let _e6 = internalToOutputScale();
    let _e9 = depthAt(in_9.uv);
    loop {
        let _e11 = index;
        if (_e11 < 64u) {
        } else {
            break;
        }
        {
            let _e14 = index;
            let _e16 = tapLimit();
            if (f32(_e14) >= _e16) {
                break;
            }
            let _e19 = index;
            let _e20 = tapLimit();
            let _e21 = sourceDiskOffset(_e19, _e20);
            let uv_10 = clamp((in_9.uv + ((_e21 * _e6) / sourceSize_4)), vec2(0f), vec2(1f));
            let _e30 = cocAtExtra1_(uv_10);
            let _e31 = cocCoverageAtExtra1_(uv_10);
            let sourceRadius_3 = abs(_e30);
            let distancePixels_2 = (length(((uv_10 - in_9.uv) * sourceSize_4)) / max(_e6, 0.00001f));
            let supportWeight_1 = clamp((((sourceRadius_3 + 1f) - distancePixels_2) / max((sourceRadius_3 + 1f), 1f)), 0f, 1f);
            let nearSourceFactor = smoothstep(0.5f, 2f, sourceRadius_3);
            let sourceCapacity_1 = select(0f, _e31, (_e31 > 0f));
            let _e59 = coverageCapacity;
            coverageCapacity = (_e59 + sourceCapacity_1);
            let _e61 = tapLimit();
            let _e62 = sourceKernelMean(sourceRadius_3, _e61);
            let normalizedSupport_1 = (supportWeight_1 / _e62);
            let sourceSupport = ((normalizedSupport_1 * nearSourceFactor) * _e31);
            if (_e30 < -0.001f) {
                local = (sourceSupport > 0f);
            } else {
                local = false;
            }
            let nearSource = local;
            let _e75 = nearCoverage;
            nearCoverage = (_e75 + select(0f, sourceSupport, nearSource));
            let _e79 = depthAt(uv_10);
            let depthTolerance = max(0.02f, (_e9 * 0.04f));
            if (_e9 > 0f) {
                local_1 = (_e79 > 0f);
            } else {
                local_1 = false;
            }
            let _e91 = local_1;
            if _e91 {
                local_2 = (_e79 >= (_e9 - depthTolerance));
            } else {
                local_2 = false;
            }
            let depthMatch_2 = local_2;
            let sample_3 = textureSampleLevel(currentColor, linearSampler, uv_10, 0f);
            let behindCenter = (_e79 > (_e9 + depthTolerance));
            if !((_e30 >= -0.001f)) {
                local_3 = behindCenter;
            } else {
                local_3 = true;
            }
            let backgroundCandidate = local_3;
            if backgroundCandidate {
                local_4 = depthMatch_2;
            } else {
                local_4 = false;
            }
            let _e116 = local_4;
            let w = select(0f, (_e31 * sample_3.w), _e116);
            let _e120 = color;
            color = (_e120 + (sample_3.xyz * w));
            let _e125 = weight;
            weight = (_e125 + w);
        }
        continuing {
            let _e127 = index;
            index = (_e127 + 1u);
        }
    }
    let _e130 = weight;
    let positiveWeight_2 = max(_e130, 0.00001f);
    let _e133 = weight;
    if (_e133 > 0f) {
        let _e136 = coverageCapacity;
        local_5 = (_e136 > 0f);
    } else {
        local_5 = false;
    }
    let hasBackground = local_5;
    let _e143 = nearCoverage;
    let _e144 = coverageCapacity;
    let confidence_1 = select(0f, clamp((_e143 / max(_e144, 0.00001f)), 0f, 1f), hasBackground);
    let _e153 = color;
    return vec4<f32>((_e153 / vec3(positiveWeight_2)), confidence_1);
}

@fragment 
fn fs_composite(in_10: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    var color_1: vec3<f32>;
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

    let original = textureSampleLevel(currentColor, linearSampler, in_10.uv, 0f);
    let _e7 = cocAtExtra1_(in_10.uv);
    let nearBlur = textureSampleLevel(extra2_, linearSampler, in_10.uv, 0f);
    let farBlur = textureSampleLevel(extra3_, linearSampler, in_10.uv, 0f);
    let background = textureSampleLevel(extra4_, linearSampler, in_10.uv, 0f);
    let absoluteCoc = abs(_e7);
    let largeFactor = smoothstep(2f, 3f, absoluteCoc);
    let smallFactor = (smoothstep(0.5f, 2f, absoluteCoc) * (1f - smoothstep(2f, 3f, absoluteCoc)));
    color_1 = original.xyz;
    let focalDestination = (absoluteCoc < 0.5f);
    if (_e7 < -0.001f) {
        let _e45 = params.image.z;
        local_6 = (_e45 < 1.5f);
    } else {
        local_6 = false;
    }
    let _e51 = local_6;
    if !(_e51) {
        if (_e7 > 0.001f) {
            let _e58 = params.image.z;
            if !((_e58 < 0.5f)) {
                let _e65 = params.image.z;
                local_9 = (_e65 >= 1.5f);
            } else {
                local_9 = true;
            }
            let _e71 = local_9;
            local_8 = _e71;
        } else {
            local_8 = false;
        }
        let _e75 = local_8;
        local_7 = _e75;
    } else {
        local_7 = true;
    }
    let smallSideEnabled = local_7;
    if smallSideEnabled {
        local_10 = (smallFactor > 0f);
    } else {
        local_10 = false;
    }
    let hasSmallDestination = local_10;
    let _e89 = params.image.z;
    if (_e89 < 1.5f) {
        let nearCoverage_1 = clamp(background.w, 0f, 1f);
        let _e96 = color_1;
        let nearBase = mix(_e96, background.xyz, nearCoverage_1);
        if hasSmallDestination {
            local_11 = (_e7 < -0.001f);
        } else {
            local_11 = false;
        }
        let _e104 = local_11;
        if _e104 {
            let _e109 = smallBlur(in_10.uv, true, min(absoluteCoc, 3f));
            color_1 = mix(nearBase, _e109.xyz, smallFactor);
        } else {
            color_1 = nearBase;
        }
        let nearWeight = clamp(nearBlur.w, 0f, 1f);
        if focalDestination {
            if !((nearWeight > 0f)) {
                local_13 = (nearCoverage_1 > 0f);
            } else {
                local_13 = true;
            }
            let _e124 = local_13;
            local_12 = _e124;
        } else {
            local_12 = false;
        }
        let _e128 = local_12;
        if _e128 {
            let _e132 = smallBlur(in_10.uv, true, 2f);
            let _e133 = color_1;
            color_1 = mix(_e133, _e132.xyz, _e132.w);
        }
        let _e137 = color_1;
        color_1 = mix(_e137, nearBlur.xyz, nearWeight);
    }
    let _e143 = params.image.z;
    if !((_e143 < 0.5f)) {
        let _e150 = params.image.z;
        local_14 = (_e150 >= 1.5f);
    } else {
        local_14 = true;
    }
    let _e156 = local_14;
    if _e156 {
        let farWeight = clamp((farBlur.w * largeFactor), 0f, 1f);
        let _e162 = color_1;
        color_1 = mix(_e162, farBlur.xyz, farWeight);
    }
    if hasSmallDestination {
        local_15 = (_e7 > 0.001f);
    } else {
        local_15 = false;
    }
    let _e170 = local_15;
    if _e170 {
        let _e176 = smallBlur(in_10.uv, (_e7 < -0.001f), min(absoluteCoc, 3f));
        let _e177 = color_1;
        color_1 = mix(_e177, _e176.xyz, smallFactor);
    }
    let _e180 = color_1;
    return vec4<f32>(_e180, original.w);
}
