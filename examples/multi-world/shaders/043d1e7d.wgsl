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
}

struct SsrTraceHit {
    hit: f32,
    uv: vec2<f32>,
    thickness: f32,
    reactivity: f32,
}

struct SsrDepthCandidate {
    valid: bool,
    pixel: vec2<u32>,
    uv: vec2<f32>,
    depth: f32,
    fraction: f32,
}

struct SsrHitSample {
    color: vec4<f32>,
    reactivity: f32,
}

const SSR_TRACE_MAX_COARSE_STEPS: u32 = 48u;
const SSR_TRACE_MAX_REFINE_STEPS: u32 = 5u;

@group(0) @binding(0) 
var sceneDepth: texture_depth_2d;
@group(0) @binding(1) 
var sceneNormal: texture_2d<f32>;
@group(0) @binding(2) 
var sceneColor: texture_2d<f32>;
@group(0) @binding(3) 
var hizPyramid: texture_2d<f32>;
@group(0) @binding(4) 
var traceOutput: texture_storage_2d<rgba16float,write>;
@group(0) @binding(5) 
var<uniform> view: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(6) 
var reflectionFallback: texture_2d<f32>;
@group(0) @binding(7) 
var sceneTemporal: texture_2d<f32>;
@group(0) @binding(8) 
var hitReactivityOutput: texture_storage_2d<r32float,write>;

fn isFinite(value: f32) -> bool {
    var local_12: bool;

    if (value == value) {
        local_12 = (abs(value) < 3.402823e38f);
    } else {
        local_12 = false;
    }
    let _e8 = local_12;
    return _e8;
}

fn finiteConfidence(value_1: f32) -> f32 {
    let _e4 = isFinite(value_1);
    return select(0f, clamp(value_1, 0f, 1f), _e4);
}

fn traceConfidence(hit: f32, thickness: f32, facing: f32, edge: f32, roughness: f32, temporal: f32) -> f32 {
    var local_13: bool;
    var local_14: bool;
    var local_15: bool;
    var local_16: bool;
    var local_17: bool;

    let factors = vec3<f32>(hit, thickness, facing);
    let spatial = vec3<f32>(edge, roughness, temporal);
    let _e9 = isFinite(factors.x);
    if !(!(_e9)) {
        let _e13 = isFinite(factors.y);
        local_13 = !(_e13);
    } else {
        local_13 = true;
    }
    let _e18 = local_13;
    if !(_e18) {
        let _e21 = isFinite(factors.z);
        local_14 = !(_e21);
    } else {
        local_14 = true;
    }
    let _e26 = local_14;
    if !(_e26) {
        let _e29 = isFinite(spatial.x);
        local_15 = !(_e29);
    } else {
        local_15 = true;
    }
    let _e34 = local_15;
    if !(_e34) {
        let _e37 = isFinite(spatial.y);
        local_16 = !(_e37);
    } else {
        local_16 = true;
    }
    let _e42 = local_16;
    if !(_e42) {
        let _e45 = isFinite(spatial.z);
        local_17 = !(_e45);
    } else {
        local_17 = true;
    }
    let _e50 = local_17;
    if _e50 {
        return 0f;
    }
    let _e53 = finiteConfidence(factors.x);
    let _e55 = finiteConfidence(factors.y);
    let _e58 = finiteConfidence(factors.z);
    let _e61 = finiteConfidence(spatial.x);
    let _e64 = finiteConfidence(spatial.y);
    let _e67 = finiteConfidence(spatial.z);
    return (((((_e53 * _e55) * _e58) * _e61) * _e64) * _e67);
}

fn traceEdge(uv: vec2<f32>) -> f32 {
    let distanceToEdge = min(min(uv.x, (1f - uv.x)), min(uv.y, (1f - uv.y)));
    return clamp((distanceToEdge * 8f), 0f, 1f);
}

fn reconstructWorldPosition(uv_1: vec2<f32>, depth: f32) -> vec3<f32> {
    var local_18: bool;

    let clip = vec4<f32>(((uv_1.x * 2f) - 1f), (1f - (uv_1.y * 2f)), depth, 1f);
    let _e16 = view.inverseViewProj;
    let world = (_e16 * clip);
    let _e19 = isFinite(world.w);
    if !(!(_e19)) {
        local_18 = (abs(world.w) <= 0.00001f);
    } else {
        local_18 = true;
    }
    let _e29 = local_18;
    if _e29 {
        return vec3(0f);
    }
    return (world.xyz / vec3(world.w));
}

fn projectWorldPosition(worldPosition: vec3<f32>) -> vec2<f32> {
    var local_19: bool;

    let _e2 = view.worldViewProj;
    let clip_1 = (_e2 * vec4<f32>(worldPosition, 1f));
    let _e8 = isFinite(clip_1.w);
    if !(!(_e8)) {
        local_19 = (clip_1.w <= 0.00001f);
    } else {
        local_19 = true;
    }
    let _e17 = local_19;
    if _e17 {
        return vec2(-1f);
    }
    let ndc = (clip_1.xy / vec2(clip_1.w));
    return vec2<f32>(((ndc.x * 0.5f) + 0.5f), (0.5f - (ndc.y * 0.5f)));
}

fn projectWorldViewDistance(worldPosition_1: vec3<f32>) -> f32 {
    var local_20: bool;

    let _e2 = view.worldViewProj;
    let clip_2 = (_e2 * vec4<f32>(worldPosition_1, 1f));
    let _e8 = isFinite(clip_2.w);
    if !(!(_e8)) {
        local_20 = (clip_2.w <= 0.00001f);
    } else {
        local_20 = true;
    }
    let _e17 = local_20;
    if _e17 {
        return 0f;
    }
    let _e23 = view.temporalProjection.x;
    let _e30 = view.temporalProjection.y;
    let _e34 = view.temporalProjection.x;
    let _e41 = view.temporalProjection.z;
    return select(clip_2.w, (_e23 + ((clip_2.z / clip_2.w) * (_e30 - _e34))), (_e41 > 0.5f));
}

fn maxSsrHiZMip(fullSize: vec2<u32>) -> u32 {
    let extent = max(fullSize.x, fullSize.y);
    if (extent <= 1u) {
        return 0u;
    }
    return u32(floor(log2(f32(extent))));
}

fn ssrHiZCoordinate(uv_2: vec2<f32>, destinationSize: vec2<u32>) -> vec2<u32> {
    let destinationLast = (destinationSize - vec2(1u));
    let destinationCoordinate = min(vec2<u32>(clamp((uv_2 * vec2<f32>(destinationSize)), vec2(0f), vec2<f32>(destinationLast))), destinationLast);
    return destinationCoordinate;
}

fn ssrHiZCoverageStart(index: u32, sourceSize: u32, destinationSize_1: u32) -> u32 {
    return ((index * sourceSize) / destinationSize_1);
}

fn ssrHiZCoverageEnd(index_1: u32, sourceSize_1: u32, destinationSize_2: u32) -> u32 {
    return min((((((index_1 + 1u) * sourceSize_1) + destinationSize_2) - 1u) / destinationSize_2), sourceSize_1);
}

fn sampleSsrHiZ(uv_3: vec2<f32>, mip: u32) -> f32 {
    var local_21: bool;
    var local_22: bool;

    if (mip == 0u) {
        let size = textureDimensions(sceneDepth, 0i);
        let pixel_7 = clamp(vec2<i32>((uv_3 * vec2<f32>(size))), vec2(0i), (vec2<i32>(size) - vec2(1i)));
        let depth_2 = textureLoad(sceneDepth, pixel_7, 0i);
        if !((depth_2 <= 0f)) {
            local_21 = (depth_2 >= 1f);
        } else {
            local_21 = true;
        }
        let _e28 = local_21;
        if _e28 {
            return 3.402823e38f;
        }
        let centerUv = ((vec2<f32>(pixel_7) + vec2(0.5f)) / vec2<f32>(size));
        let _e36 = reconstructWorldPosition(centerUv, depth_2);
        let _e37 = projectWorldViewDistance(_e36);
        return _e37;
    }
    let _e41 = textureNumLevels(hizPyramid);
    let physicalMip = min((mip - 1u), (_e41 - 1u));
    let size_1 = textureDimensions(hizPyramid, physicalMip);
    let _e47 = ssrHiZCoordinate(uv_3, size_1);
    let _e51 = textureLoad(hizPyramid, vec2<i32>(_e47), i32(physicalMip));
    let depth_3 = _e51.x;
    let _e53 = isFinite(depth_3);
    if _e53 {
        local_22 = (depth_3 > 0f);
    } else {
        local_22 = false;
    }
    let _e59 = local_22;
    return select(3.402823e38f, depth_3, _e59);
}

fn ssrInvalidDepthCandidate() -> SsrDepthCandidate {
    return SsrDepthCandidate(false, vec2(0u), vec2(0f), 1f, 0f);
}

fn ssrRayFraction(uv_4: vec2<f32>, startUv: vec2<f32>, deltaUv: vec2<f32>, fallback: f32, endFraction: f32) -> f32 {
    var local_23: bool;
    var local_24: bool;

    if (abs(deltaUv.x) >= abs(deltaUv.y)) {
        local_23 = (abs(deltaUv.x) > 0.00000001f);
    } else {
        local_23 = false;
    }
    let useX = local_23;
    if !(useX) {
        local_24 = (abs(deltaUv.y) > 0.00000001f);
    } else {
        local_24 = false;
    }
    let useY = local_24;
    let xFraction = select(fallback, ((uv_4.x - startUv.x) / deltaUv.x), useX);
    let yFraction = select(fallback, ((uv_4.y - startUv.y) / deltaUv.y), useY);
    let fraction = select(xFraction, yFraction, useY);
    let _e39 = isFinite(fraction);
    return clamp(select(fallback, fraction, _e39), 0f, endFraction);
}

fn ssrRescueCandidateInRay(origin: vec3<f32>, direction: vec3<f32>, rayLength: f32, surface: vec3<f32>, normal: vec3<f32>, fullSize_1: vec2<u32>, pixel: vec2<u32>) -> bool {
    var local_25: bool;
    var local_26: bool;
    var local_27: bool;
    var local_28: bool;
    var local_29: bool;

    let denominator = dot(direction, normal);
    let planeDistance = (dot((surface - origin), normal) / denominator);
    let _e8 = isFinite(denominator);
    if !(!(_e8)) {
        local_25 = (abs(denominator) <= 0.00001f);
    } else {
        local_25 = true;
    }
    let _e17 = local_25;
    if !(_e17) {
        let _e19 = isFinite(planeDistance);
        local_26 = !(_e19);
    } else {
        local_26 = true;
    }
    let _e24 = local_26;
    if !(_e24) {
        local_27 = (planeDistance <= 0f);
    } else {
        local_27 = true;
    }
    let _e31 = local_27;
    if !(_e31) {
        local_28 = (planeDistance > rayLength);
    } else {
        local_28 = true;
    }
    let _e38 = local_28;
    if _e38 {
        return false;
    }
    let _e42 = projectWorldPosition((origin + (direction * planeDistance)));
    if !(any((_e42 < vec2(0f)))) {
        local_29 = any((_e42 >= vec2(1f)));
    } else {
        local_29 = true;
    }
    let _e55 = local_29;
    if _e55 {
        return false;
    }
    let projectedPixel = min(vec2<u32>((_e42 * vec2<f32>(fullSize_1))), (fullSize_1 - vec2(1u)));
    return all((projectedPixel == pixel));
}

fn locateSsrHiZCandidate(uv_5: vec2<f32>, coarseMip: u32, fullSize_2: vec2<u32>, startUv_1: vec2<f32>, deltaUv_1: vec2<f32>, fallbackFraction: f32, endFraction_1: f32) -> SsrDepthCandidate {
    var local_30: bool;
    var coordinate: vec2<u32>;
    var local_31: bool;
    var parentSize: vec2<u32>;
    var descend: u32;
    var childCoordinate: vec2<u32>;
    var childDepth: f32;
    var childFound: bool;
    var childY: u32;
    var childX: u32;
    var local_32: bool;
    var local_33: bool;
    var candidatePixel: vec2<u32>;
    var candidateRawDepth: f32 = 3.402823e38f;
    var sourceY: u32;
    var sourceX: u32;
    var local_34: bool;
    var local_35: bool;
    var local_36: bool;
    var local_37: bool;
    var local_38: bool;

    if !((coarseMip == 0u)) {
        let _e6 = textureNumLevels(hizPyramid);
        local_30 = (_e6 == 0u);
    } else {
        local_30 = true;
    }
    let _e12 = local_30;
    if _e12 {
        let _e13 = ssrInvalidDepthCandidate();
        return _e13;
    }
    let physicalMip_1 = (coarseMip - 1u);
    let size_2 = textureDimensions(hizPyramid, i32(physicalMip_1));
    let _e20 = ssrHiZCoordinate(uv_5, size_2);
    coordinate = _e20;
    let _e23 = coordinate;
    let _e26 = textureLoad(hizPyramid, vec2<i32>(_e23), i32(physicalMip_1));
    let depth_4 = _e26.x;
    let _e28 = isFinite(depth_4);
    if !(!(_e28)) {
        local_31 = (depth_4 <= 0f);
    } else {
        local_31 = true;
    }
    let _e36 = local_31;
    if _e36 {
        let _e37 = ssrInvalidDepthCandidate();
        return _e37;
    }
    parentSize = size_2;
    descend = coarseMip;
    loop {
        let _e40 = descend;
        if (_e40 > 1u) {
        } else {
            break;
        }
        {
            let _e43 = descend;
            let nextPhysicalMip = (_e43 - 2u);
            let nextSize = textureDimensions(hizPyramid, i32(nextPhysicalMip));
            let _e50 = coordinate.x;
            let _e53 = parentSize.x;
            let _e54 = ssrHiZCoverageStart(_e50, nextSize.x, _e53);
            let _e56 = coordinate.y;
            let _e59 = parentSize.y;
            let _e60 = ssrHiZCoverageStart(_e56, nextSize.y, _e59);
            let childStart = vec2<u32>(_e54, _e60);
            let _e63 = coordinate.x;
            let _e66 = parentSize.x;
            let _e67 = ssrHiZCoverageEnd(_e63, nextSize.x, _e66);
            let _e69 = coordinate.y;
            let _e72 = parentSize.y;
            let _e73 = ssrHiZCoverageEnd(_e69, nextSize.y, _e72);
            let childEnd = vec2<u32>(_e67, _e73);
            childCoordinate = vec2(0u);
            childDepth = 3.402823e38f;
            childFound = false;
            childY = childStart.y;
            loop {
                let _e84 = childY;
                if (_e84 < childEnd.y) {
                } else {
                    break;
                }
                {
                    childX = childStart.x;
                    loop {
                        let _e89 = childX;
                        if (_e89 < childEnd.x) {
                        } else {
                            break;
                        }
                        {
                            let _e92 = childX;
                            let _e93 = childY;
                            let candidate_1 = min(vec2<u32>(_e92, _e93), (nextSize - vec2(1u)));
                            let _e102 = textureLoad(hizPyramid, vec2<i32>(candidate_1), i32(nextPhysicalMip));
                            let candidateDepth = _e102.x;
                            let _e104 = isFinite(candidateDepth);
                            if _e104 {
                                local_32 = (candidateDepth > 0f);
                            } else {
                                local_32 = false;
                            }
                            let _e110 = local_32;
                            if _e110 {
                                let _e111 = childDepth;
                                local_33 = (candidateDepth < _e111);
                            } else {
                                local_33 = false;
                            }
                            let _e116 = local_33;
                            if _e116 {
                                childCoordinate = candidate_1;
                                childDepth = candidateDepth;
                                childFound = true;
                            }
                        }
                        continuing {
                            let _e118 = childX;
                            childX = (_e118 + 1u);
                        }
                    }
                }
                continuing {
                    let _e121 = childY;
                    childY = (_e121 + 1u);
                }
            }
            let _e124 = childFound;
            if !(_e124) {
                let _e126 = ssrInvalidDepthCandidate();
                return _e126;
            }
            let _e127 = childCoordinate;
            coordinate = _e127;
            parentSize = nextSize;
        }
        continuing {
            let _e128 = descend;
            descend = (_e128 - 1u);
        }
    }
    let hizSize = textureDimensions(hizPyramid, 0i);
    let _e136 = coordinate.x;
    let _e139 = ssrHiZCoverageStart(_e136, fullSize_2.x, hizSize.x);
    let _e141 = coordinate.y;
    let _e144 = ssrHiZCoverageStart(_e141, fullSize_2.y, hizSize.y);
    let sourceStart = vec2<u32>(_e139, _e144);
    let _e147 = coordinate.x;
    let _e150 = ssrHiZCoverageEnd(_e147, fullSize_2.x, hizSize.x);
    let _e152 = coordinate.y;
    let _e155 = ssrHiZCoverageEnd(_e152, fullSize_2.y, hizSize.y);
    let sourceEnd = vec2<u32>(_e150, _e155);
    candidatePixel = sourceStart;
    sourceY = sourceStart.y;
    loop {
        let _e160 = sourceY;
        if (_e160 < sourceEnd.y) {
        } else {
            break;
        }
        {
            sourceX = sourceStart.x;
            loop {
                let _e165 = sourceX;
                if (_e165 < sourceEnd.x) {
                } else {
                    break;
                }
                {
                    let _e168 = sourceX;
                    let _e169 = sourceY;
                    let sourcePixel = min(vec2<u32>(_e168, _e169), (fullSize_2 - vec2(1u)));
                    let sourceDepth = textureLoad(sceneDepth, vec2<i32>(sourcePixel), 0i);
                    let _e179 = isFinite(sourceDepth);
                    if _e179 {
                        local_34 = (sourceDepth > 0f);
                    } else {
                        local_34 = false;
                    }
                    let _e185 = local_34;
                    if _e185 {
                        local_35 = (sourceDepth < 1f);
                    } else {
                        local_35 = false;
                    }
                    let _e191 = local_35;
                    if _e191 {
                        let _e193 = candidateRawDepth;
                        local_36 = (sourceDepth < _e193);
                    } else {
                        local_36 = false;
                    }
                    let _e198 = local_36;
                    if _e198 {
                        candidatePixel = sourcePixel;
                        candidateRawDepth = sourceDepth;
                    }
                }
                continuing {
                    let _e199 = sourceX;
                    sourceX = (_e199 + 1u);
                }
            }
        }
        continuing {
            let _e202 = sourceY;
            sourceY = (_e202 + 1u);
        }
    }
    let _e205 = candidateRawDepth;
    let _e206 = isFinite(_e205);
    if !(!(_e206)) {
        let _e209 = candidateRawDepth;
        local_37 = (_e209 <= 0f);
    } else {
        local_37 = true;
    }
    let _e215 = local_37;
    if !(_e215) {
        let _e217 = candidateRawDepth;
        local_38 = (_e217 >= 1f);
    } else {
        local_38 = true;
    }
    let _e223 = local_38;
    if _e223 {
        let _e224 = ssrInvalidDepthCandidate();
        return _e224;
    }
    let _e225 = candidatePixel;
    let candidateDepth_1 = textureLoad(sceneDepth, vec2<i32>(_e225), 0i);
    let _e230 = candidatePixel;
    let candidateCenterUv = ((vec2<f32>(_e230) + vec2(0.5f)) / vec2<f32>(fullSize_2));
    let _e237 = candidatePixel;
    let _e242 = ssrRayFraction(candidateCenterUv, startUv_1, deltaUv_1, fallbackFraction, endFraction_1);
    return SsrDepthCandidate(true, _e237, candidateCenterUv, candidateDepth_1, _e242);
}

fn locateSsrLocalCandidate(uv_6: vec2<f32>, pixel_1: vec2<u32>, fullSize_3: vec2<u32>, startUv_2: vec2<f32>, deltaUv_2: vec2<f32>, fallbackFraction_1: f32, endFraction_2: f32) -> SsrDepthCandidate {
    var local_39: bool;
    var bestOffset: i32 = 9i;
    var bestDepth: f32 = 3.402823e38f;
    var bestPixel: vec2<u32>;
    var offset: i32 = -8i;
    var local_40: bool;
    var local_41: bool;
    var local_42: bool;
    var local_43: bool;
    var local_44: bool;

    let span = max((abs(deltaUv_2.x) * f32(fullSize_3.x)), (abs(deltaUv_2.y) * f32(fullSize_3.y)));
    let _e16 = isFinite(span);
    if !(!(_e16)) {
        local_39 = (span <= 0.00001f);
    } else {
        local_39 = true;
    }
    let _e24 = local_39;
    if _e24 {
        let _e25 = ssrInvalidDepthCandidate();
        return _e25;
    }
    bestPixel = pixel_1;
    loop {
        let _e29 = offset;
        if (_e29 <= 8i) {
        } else {
            break;
        }
        {
            let _e33 = offset;
            let sampleUv_1 = (uv_6 + (deltaUv_2 * (f32(_e33) / span)));
            if !(any((sampleUv_1 < vec2(0f)))) {
                local_40 = any((sampleUv_1 >= vec2(1f)));
            } else {
                local_40 = true;
            }
            let _e50 = local_40;
            if _e50 {
                continue;
            }
            let samplePixel_1 = min(vec2<u32>((sampleUv_1 * vec2<f32>(fullSize_3))), (fullSize_3 - vec2(1u)));
            let sampleDepth_1 = textureLoad(sceneDepth, vec2<i32>(samplePixel_1), 0i);
            let _e62 = offset;
            let distanceFromCenter = abs(_e62);
            if (sampleDepth_1 > 0f) {
                local_41 = (sampleDepth_1 < 1f);
            } else {
                local_41 = false;
            }
            let _e71 = local_41;
            if _e71 {
                let _e73 = bestOffset;
                if !((distanceFromCenter < _e73)) {
                    let _e76 = bestOffset;
                    if (distanceFromCenter == _e76) {
                        let _e79 = bestDepth;
                        local_44 = (sampleDepth_1 < _e79);
                    } else {
                        local_44 = false;
                    }
                    let _e84 = local_44;
                    local_43 = _e84;
                } else {
                    local_43 = true;
                }
                let _e88 = local_43;
                local_42 = _e88;
            } else {
                local_42 = false;
            }
            let _e92 = local_42;
            if _e92 {
                bestOffset = distanceFromCenter;
                bestDepth = sampleDepth_1;
                bestPixel = samplePixel_1;
            }
        }
        continuing {
            let _e93 = offset;
            offset = (_e93 + 1i);
        }
    }
    let _e96 = bestOffset;
    if (_e96 > 8i) {
        let _e99 = ssrInvalidDepthCandidate();
        return _e99;
    }
    let _e100 = bestPixel;
    let candidateUv = ((vec2<f32>(_e100) + vec2(0.5f)) / vec2<f32>(fullSize_3));
    let _e107 = bestPixel;
    let _e108 = bestDepth;
    let _e112 = ssrRayFraction(candidateUv, startUv_2, deltaUv_2, fallbackFraction_1, endFraction_2);
    return SsrDepthCandidate(true, _e107, candidateUv, _e108, _e112);
}

fn ssrSourceReactivity(pixel_2: vec2<i32>) -> f32 {
    var local_45: bool;
    var local_46: bool;
    var local_47: bool;

    let temporal_1 = textureLoad(sceneTemporal, pixel_2, 0i);
    let speed = length(temporal_1.xy);
    let _e6 = isFinite(speed);
    if !(!(_e6)) {
        let _e10 = isFinite(temporal_1.z);
        local_45 = !(_e10);
    } else {
        local_45 = true;
    }
    let _e15 = local_45;
    if !(_e15) {
        local_46 = (temporal_1.z < 0f);
    } else {
        local_46 = true;
    }
    let _e23 = local_46;
    if !(_e23) {
        let _e26 = isFinite(temporal_1.w);
        local_47 = !(_e26);
    } else {
        local_47 = true;
    }
    let _e31 = local_47;
    if _e31 {
        return 1f;
    }
    return clamp(max((speed * 64f), temporal_1.w), 0f, 1f);
}

fn ssrShadingNormalVaries(pixel_3: vec2<u32>, normal_1: vec3<f32>) -> bool {
    var axis: u32 = 0u;
    var sign_: i32;
    var offset_1: vec2<i32>;
    var local_48: bool;
    var local_49: bool;
    var local_50: bool;

    let _e3 = textureDimensions(sceneDepth, 0i);
    let size_3 = vec2<i32>(_e3);
    loop {
        let _e6 = axis;
        if (_e6 < 2u) {
        } else {
            break;
        }
        {
            sign_ = -1i;
            loop {
                let _e11 = sign_;
                if (_e11 <= 1i) {
                } else {
                    break;
                }
                {
                    offset_1 = vec2(0i);
                    let _e17 = axis;
                    let _e19 = sign_;
                    offset_1[_e17] = _e19;
                    let _e22 = offset_1;
                    let tap = (vec2<i32>(pixel_3) + _e22);
                    if !(any((tap < vec2(0i)))) {
                        local_48 = any((tap >= size_3));
                    } else {
                        local_48 = true;
                    }
                    let _e34 = local_48;
                    if _e34 {
                        continue;
                    }
                    let _e37 = textureLoad(sceneDepth, tap, 0i);
                    if !((_e37 >= 1f)) {
                        let _e43 = textureLoad(reflectionFallback, tap, 0i);
                        local_49 = (_e43.w <= 0.5f);
                    } else {
                        local_49 = true;
                    }
                    let _e50 = local_49;
                    if _e50 {
                        continue;
                    }
                    let _e53 = textureLoad(sceneNormal, tap, 0i);
                    let neighbor = ((_e53.xyz * 2f) - vec3(1f));
                    let delta = (neighbor - normal_1);
                    let agreement = (dot(neighbor, normal_1) * inverseSqrt(max((dot(neighbor, neighbor) * dot(normal_1, normal_1)), 0.00000001f)));
                    if (agreement > 0.9f) {
                        local_50 = (dot(delta, delta) > 0.000001f);
                    } else {
                        local_50 = false;
                    }
                    let _e78 = local_50;
                    if _e78 {
                        return true;
                    }
                }
                continuing {
                    let _e80 = sign_;
                    sign_ = (_e80 + 2i);
                }
            }
        }
        continuing {
            let _e84 = axis;
            axis = (_e84 + 1u);
        }
    }
    return false;
}

fn ssrGeometricNormal(pixel_4: vec2<u32>, normal_2: vec3<f32>) -> vec3<f32> {
    var derivatives: array<vec3<f32>, 2>;
    var axis_1: u32 = 0u;
    var shortest: f32;
    var sign_1: i32;
    var offset_2: vec2<i32>;
    var local_51: bool;
    var local_52: bool;

    let size_4 = textureDimensions(sceneDepth, 0i);
    let _e14 = textureLoad(sceneDepth, vec2<i32>(pixel_4), 0i);
    let _e15 = reconstructWorldPosition(((vec2<f32>(pixel_4) + vec2(0.5f)) / vec2<f32>(size_4)), _e14);
    loop {
        let _e17 = axis_1;
        if (_e17 < 2u) {
        } else {
            break;
        }
        {
            shortest = 3.402823e38f;
            sign_1 = -1i;
            loop {
                let _e24 = sign_1;
                if (_e24 <= 1i) {
                } else {
                    break;
                }
                {
                    offset_2 = vec2(0i);
                    let _e30 = axis_1;
                    let _e32 = sign_1;
                    offset_2[_e30] = _e32;
                    let _e34 = offset_2;
                    let tap_1 = (vec2<i32>(pixel_4) + _e34);
                    if !(any((tap_1 < vec2(0i)))) {
                        local_51 = any((tap_1 >= vec2<i32>(size_4)));
                    } else {
                        local_51 = true;
                    }
                    let _e47 = local_51;
                    if _e47 {
                        continue;
                    }
                    let depth_5 = textureLoad(sceneDepth, tap_1, 0i);
                    let _e53 = textureLoad(sceneNormal, tap_1, 0i);
                    let tapNormal = ((_e53.xyz * 2f) - vec3(1f));
                    if !((depth_5 >= 1f)) {
                        local_52 = (dot(normal_2, tapNormal) < 0.9f);
                    } else {
                        local_52 = true;
                    }
                    let _e70 = local_52;
                    if _e70 {
                        continue;
                    }
                    let _e77 = reconstructWorldPosition(((vec2<f32>(tap_1) + vec2(0.5f)) / vec2<f32>(size_4)), depth_5);
                    let _e79 = sign_1;
                    let delta_1 = ((_e77 - _e15) * f32(_e79));
                    let distance_ = dot(delta_1, delta_1);
                    let _e83 = shortest;
                    if (distance_ < _e83) {
                        shortest = distance_;
                        let _e86 = axis_1;
                        derivatives[_e86] = delta_1;
                    }
                }
                continuing {
                    let _e88 = sign_1;
                    sign_1 = (_e88 + 2i);
                }
            }
        }
        continuing {
            let _e92 = axis_1;
            axis_1 = (_e92 + 1u);
        }
    }
    let _e95 = derivatives[0];
    let _e97 = derivatives[1];
    let product = cross(_e95, _e97);
    let lengthSquared = dot(product, product);
    if (lengthSquared <= 0.0000000000000001f) {
        return normal_2;
    }
    let geometric_1 = (product * inverseSqrt(lengthSquared));
    return select(-(geometric_1), geometric_1, (dot(geometric_1, normal_2) >= 0f));
}

fn ssrRefineHit(origin_1: vec3<f32>, direction_1: vec3<f32>, maxDistance: f32, thickness_1: f32, fullSize_4: vec2<u32>, pixel_5: vec2<u32>, depth_1: f32, normal_3: vec3<f32>, result: SsrTraceHit, geometric: bool) -> SsrTraceHit {
    var planeNormal: vec3<f32>;
    var local_53: bool;
    var local_54: bool;
    var local_55: bool;
    var local_56: bool;
    var local_57: bool;
    var validationNormal: vec3<f32>;
    var local_58: bool;

    let centerUv_1 = ((vec2<f32>(pixel_5) + vec2(0.5f)) / vec2<f32>(fullSize_4));
    let _e9 = reconstructWorldPosition(centerUv_1, depth_1);
    planeNormal = normal_3;
    if geometric {
        let _e13 = ssrGeometricNormal(pixel_5, normal_3);
        planeNormal = _e13;
    }
    let _e17 = planeNormal;
    let _e19 = planeNormal;
    let planeDistance_1 = (dot((_e9 - origin_1), _e17) / dot(direction_1, _e19));
    let _e22 = isFinite(planeDistance_1);
    if !(!(_e22)) {
        local_53 = (planeDistance_1 <= 0f);
    } else {
        local_53 = true;
    }
    let _e30 = local_53;
    if !(_e30) {
        local_54 = (planeDistance_1 > maxDistance);
    } else {
        local_54 = true;
    }
    let _e37 = local_54;
    if _e37 {
        return result;
    }
    let intersection = (origin_1 + (direction_1 * planeDistance_1));
    let _e41 = projectWorldPosition(intersection);
    if !(any((_e41 < vec2(0f)))) {
        local_55 = any((_e41 >= vec2(1f)));
    } else {
        local_55 = true;
    }
    let _e54 = local_55;
    if _e54 {
        return result;
    }
    let hitPixel = min(vec2<u32>((_e41 * vec2<f32>(fullSize_4))), (fullSize_4 - vec2(1u)));
    let hitDepth = textureLoad(sceneDepth, vec2<i32>(hitPixel), 0i);
    let _e69 = textureLoad(sceneNormal, vec2<i32>(hitPixel), 0i);
    let hitNormal = ((_e69.xyz * 2f) - vec3(1f));
    if !((hitDepth >= 1f)) {
        local_56 = (dot(hitNormal, -(direction_1)) <= 0f);
    } else {
        local_56 = true;
    }
    let _e86 = local_56;
    if !(_e86) {
        let _e91 = textureLoad(reflectionFallback, vec2<i32>(hitPixel), 0i);
        local_57 = (_e91.w <= 0.5f);
    } else {
        local_57 = true;
    }
    let _e98 = local_57;
    if _e98 {
        return result;
    }
    let hitCenterUv = ((vec2<f32>(hitPixel) + vec2(0.5f)) / vec2<f32>(fullSize_4));
    let _e105 = reconstructWorldPosition(hitCenterUv, hitDepth);
    let _e113 = reconstructWorldPosition((hitCenterUv + vec2<f32>((1f / f32(fullSize_4.x)), 0f)), hitDepth);
    let radius = max(thickness_1, (distance(_e105, _e113) * 3f));
    validationNormal = hitNormal;
    if geometric {
        let _e120 = ssrGeometricNormal(hitPixel, hitNormal);
        validationNormal = _e120;
    }
    let _e122 = validationNormal;
    let separation = abs(dot((_e105 - intersection), normalize(_e122)));
    let _e126 = isFinite(separation);
    if !(!(_e126)) {
        local_58 = (separation > radius);
    } else {
        local_58 = true;
    }
    let _e133 = local_58;
    if _e133 {
        return result;
    }
    return SsrTraceHit(1f, _e41, clamp((1f - (separation / radius)), 0f, 1f), result.reactivity);
}

fn traceScreenRay(origin_2: vec3<f32>, direction_2: vec3<f32>, maxDistance_1: f32, thickness_2: f32, fullSize_5: vec2<u32>, hizDepth: f32, hizMaxMip: u32) -> SsrTraceHit {
    var result_1: SsrTraceHit = SsrTraceHit(0f, vec2(0f), 0f, 0f);
    var local_59: bool;
    var local_60: bool;
    var local_61: bool;
    var local_62: bool;
    var local_63: bool;
    var local_64: bool;
    var rayLength_1: f32;
    var endFraction_3: f32 = 1f;
    var lower: f32 = 0f;
    var upper: f32 = 0f;
    var found: bool = false;
    var rescued: bool = false;
    var rescuedUv: vec2<f32> = vec2(0f);
    var rescuedThickness: f32 = 0f;
    var step_: u32 = 1u;
    var local_65: bool;
    var samplePixel: vec2<u32>;
    var sampleUv: vec2<f32>;
    var sampleDepth: f32;
    var sampleFraction: f32;
    var candidate: SsrDepthCandidate;
    var local_66: bool;
    var local_67: bool;
    var local_68: bool;
    var local_69: bool;
    var local_70: bool;
    var local_71: bool;
    var local_72: bool;
    var refine: u32 = 0u;
    var local_73: bool;
    var local_74: bool;
    var local_75: bool;
    var local_76: bool;
    var local_77: bool;
    var local_78: bool;
    var local_79: bool;
    var local_80: bool;
    var local_81: bool;

    let _e8 = isFinite(maxDistance_1);
    if !(!(_e8)) {
        local_59 = (maxDistance_1 <= 0f);
    } else {
        local_59 = true;
    }
    let _e16 = local_59;
    if !(_e16) {
        let _e19 = isFinite(thickness_2);
        local_60 = !(_e19);
    } else {
        local_60 = true;
    }
    let _e24 = local_60;
    if !(_e24) {
        local_61 = (thickness_2 <= 0f);
    } else {
        local_61 = true;
    }
    let _e31 = local_61;
    if !(_e31) {
        local_62 = (maxDistance_1 < thickness_2);
    } else {
        local_62 = true;
    }
    let _e37 = local_62;
    if !(_e37) {
        let _e40 = isFinite(hizDepth);
        local_63 = !(_e40);
    } else {
        local_63 = true;
    }
    let _e45 = local_63;
    if !(_e45) {
        local_64 = (hizDepth <= 0f);
    } else {
        local_64 = true;
    }
    let _e52 = local_64;
    if _e52 {
        let _e54 = result_1;
        return _e54;
    }
    let _e56 = projectWorldViewDistance(origin_2);
    let _e61 = view.worldViewProj[0][3];
    let _e66 = view.worldViewProj[1][3];
    let _e72 = view.worldViewProj[2][3];
    let depthDirection = dot(vec3<f32>(_e61, _e66, _e72), direction_2);
    rayLength_1 = maxDistance_1;
    if (depthDirection < -0.00001f) {
        let _e78 = rayLength_1;
        let _e82 = view.temporalProjection.x;
        rayLength_1 = min(_e78, ((_e56 - (_e82 * 1.01f)) / -(depthDirection)));
    }
    let _e89 = rayLength_1;
    if (_e89 <= 0f) {
        let _e92 = result_1;
        return _e92;
    }
    let _e93 = rayLength_1;
    let end = (origin_2 + (direction_2 * _e93));
    let _e96 = projectWorldViewDistance(end);
    let _e97 = projectWorldPosition(origin_2);
    let _e98 = projectWorldPosition(end);
    let deltaUv_3 = (_e98 - _e97);
    if (deltaUv_3.x > 0.000001f) {
        let _e104 = endFraction_3;
        endFraction_3 = min(_e104, ((1f - _e97.x) / deltaUv_3.x));
    }
    if (deltaUv_3.x < -0.000001f) {
        let _e114 = endFraction_3;
        endFraction_3 = min(_e114, (-(_e97.x) / deltaUv_3.x));
    }
    if (deltaUv_3.y > 0.000001f) {
        let _e123 = endFraction_3;
        endFraction_3 = min(_e123, ((1f - _e97.y) / deltaUv_3.y));
    }
    if (deltaUv_3.y < -0.000001f) {
        let _e133 = endFraction_3;
        endFraction_3 = min(_e133, (-(_e97.y) / deltaUv_3.y));
    }
    let _e140 = endFraction_3;
    let span_1 = abs(((deltaUv_3 * _e140) * vec2<f32>(fullSize_5)));
    let count = min(SSR_TRACE_MAX_COARSE_STEPS, max(1u, u32(ceil(max(span_1.x, span_1.y)))));
    let coarseMip_1 = min(hizMaxMip, u32(floor(log2(max(1f, (max(span_1.x, span_1.y) / f32(count)))))));
    let inverseStart = (1f / max(_e56, 0.00001f));
    let inverseEnd = (1f / max(_e96, 0.00001f));
    loop {
        let _e175 = step_;
        if (_e175 <= SSR_TRACE_MAX_COARSE_STEPS) {
        } else {
            break;
        }
        {
            let _e178 = step_;
            if (_e178 > count) {
                break;
            }
            let _e180 = step_;
            let _e184 = endFraction_3;
            let fraction_1 = ((f32(_e180) / f32(count)) * _e184);
            let uv_8 = (_e97 + (deltaUv_3 * fraction_1));
            let pixel_8 = min(vec2<u32>((clamp(uv_8, vec2(0f), vec2(1f)) * vec2<f32>(fullSize_5))), (fullSize_5 - vec2(1u)));
            let rayDepth = (1f / mix(inverseStart, inverseEnd, fraction_1));
            let moving = (abs(deltaUv_3) > vec2(0.00000001f));
            let exitUv = ((vec2<f32>(pixel_8) + select(vec2(0f), vec2(1f), (deltaUv_3 > vec2(0f)))) / vec2<f32>(fullSize_5));
            let _e219 = endFraction_3;
            let exitFractions = select(vec2(_e219), ((exitUv - _e97) / select(vec2(1f), deltaUv_3, moving)), moving);
            let pixelSpan = max((abs(deltaUv_3.x) * f32(fullSize_5.x)), (abs(deltaUv_3.y) * f32(fullSize_5.y)));
            let _e238 = endFraction_3;
            let exitFraction = max(fraction_1, (min(_e238, min(exitFractions.x, exitFractions.y)) - (0.0001f / max(pixelSpan, 1f))));
            let exitDepth = (1f / mix(inverseStart, inverseEnd, exitFraction));
            let intervalDepth = max(rayDepth, exitDepth);
            if (coarseMip_1 > 0u) {
                let _e255 = sampleSsrHiZ(uv_8, coarseMip_1);
                local_65 = (_e255 > (intervalDepth + thickness_2));
            } else {
                local_65 = false;
            }
            let _e261 = local_65;
            if _e261 {
                continue;
            }
            samplePixel = pixel_8;
            sampleUv = uv_8;
            let _e267 = textureLoad(sceneDepth, vec2<i32>(pixel_8), 0i);
            sampleDepth = _e267;
            sampleFraction = fraction_1;
            let _e270 = ssrInvalidDepthCandidate();
            candidate = _e270;
            let _e272 = sampleDepth;
            if !((_e272 <= 0f)) {
                let _e276 = sampleDepth;
                local_66 = (_e276 >= 1f);
            } else {
                local_66 = true;
            }
            let _e282 = local_66;
            if _e282 {
                let _e283 = endFraction_3;
                let _e284 = locateSsrHiZCandidate(uv_8, coarseMip_1, fullSize_5, _e97, deltaUv_3, fraction_1, _e283);
                candidate = _e284;
                let projectedStepPixels = (max(span_1.x, span_1.y) / f32(max(count, 1u)));
                let _e293 = candidate.valid;
                if !(_e293) {
                    local_67 = (coarseMip_1 == 0u);
                } else {
                    local_67 = false;
                }
                let _e300 = local_67;
                if _e300 {
                    local_68 = (projectedStepPixels > 2f);
                } else {
                    local_68 = false;
                }
                let _e306 = local_68;
                if _e306 {
                    let _e307 = endFraction_3;
                    let _e308 = locateSsrLocalCandidate(uv_8, pixel_8, fullSize_5, _e97, deltaUv_3, fraction_1, _e307);
                    candidate = _e308;
                }
                let _e310 = candidate.valid;
                if _e310 {
                    let _e312 = candidate.pixel;
                    samplePixel = _e312;
                    let _e314 = candidate.uv;
                    sampleUv = _e314;
                    let _e316 = candidate.depth;
                    sampleDepth = _e316;
                    let _e318 = candidate.fraction;
                    sampleFraction = _e318;
                }
            }
            let _e319 = sampleDepth;
            if !((_e319 >= 1f)) {
                let _e323 = samplePixel;
                let _e327 = textureLoad(reflectionFallback, vec2<i32>(_e323), 0i);
                local_69 = (_e327.w <= 0.5f);
            } else {
                local_69 = true;
            }
            let _e334 = local_69;
            if _e334 {
                continue;
            }
            let _e335 = sampleFraction;
            let sampleRayDepth = (1f / mix(inverseStart, inverseEnd, _e335));
            let _e339 = sampleUv;
            let _e340 = sampleDepth;
            let _e341 = reconstructWorldPosition(_e339, _e340);
            let _e343 = projectWorldViewDistance(_e341);
            if ((intervalDepth + thickness_2) < _e343) {
                continue;
            }
            let _e347 = result_1.reactivity;
            let _e348 = samplePixel;
            let _e350 = ssrSourceReactivity(vec2<i32>(_e348));
            result_1.reactivity = max(_e347, _e350);
            let _e352 = samplePixel;
            let _e356 = textureLoad(sceneNormal, vec2<i32>(_e352), 0i);
            let normal_4 = ((_e356.xyz * 2f) - vec3(1f));
            if (dot(normal_4, -(direction_2)) <= 0f) {
                continue;
            }
            let _e368 = candidate.valid;
            if _e368 {
                let _e369 = rayLength_1;
                let _e370 = samplePixel;
                let _e371 = ssrRescueCandidateInRay(origin_2, direction_2, _e369, _e341, normal_4, fullSize_5, _e370);
                local_70 = !(_e371);
            } else {
                local_70 = false;
            }
            let _e376 = local_70;
            if _e376 {
                continue;
            }
            let _e377 = projectWorldViewDistance(_e341);
            if (sampleRayDepth < _e377) {
                let _e380 = candidate.valid;
                if !(_e380) {
                    let _e382 = rayLength_1;
                    let _e383 = samplePixel;
                    let _e384 = ssrRescueCandidateInRay(origin_2, direction_2, _e382, _e341, normal_4, fullSize_5, _e383);
                    local_71 = !(_e384);
                } else {
                    local_71 = false;
                }
                let _e389 = local_71;
                if _e389 {
                    continue;
                }
            }
            let _e390 = sampleUv;
            let _e398 = sampleDepth;
            let _e399 = reconstructWorldPosition((_e390 + vec2<f32>((1f / f32(fullSize_5.x)), 0f)), _e398);
            let radius_1 = max(thickness_2, (distance(_e341, _e399) * 3f));
            let separation_1 = length(cross((_e341 - origin_2), direction_2));
            let _e407 = isFinite(separation_1);
            if !(!(_e407)) {
                local_72 = (separation_1 > radius_1);
            } else {
                local_72 = true;
            }
            let _e414 = local_72;
            if _e414 {
                continue;
            }
            let _e416 = candidate.valid;
            if _e416 {
                rescued = true;
                let _e419 = sampleUv;
                rescuedUv = _e419;
                rescuedThickness = clamp((1f - (separation_1 / radius_1)), 0f, 1f);
            }
            let _e428 = step_;
            let _e434 = endFraction_3;
            let _e436 = sampleFraction;
            let bracketLower = min(((f32((_e428 - 1u)) / f32(count)) * _e434), _e436);
            let _e438 = sampleFraction;
            let bracketUpper = max(exitFraction, _e438);
            let _e440 = sampleFraction;
            let _e441 = projectWorldViewDistance(_e341);
            lower = select(_e440, bracketLower, (sampleRayDepth >= _e441));
            let _e445 = sampleFraction;
            let _e446 = projectWorldViewDistance(_e341);
            upper = select(bracketUpper, _e445, (sampleRayDepth >= _e446));
            found = true;
            break;
        }
        continuing {
            let _e453 = step_;
            step_ = (_e453 + 1u);
        }
    }
    let _e455 = found;
    if !(_e455) {
        let _e457 = result_1;
        return _e457;
    }
    loop {
        let _e459 = refine;
        if (_e459 < SSR_TRACE_MAX_REFINE_STEPS) {
        } else {
            break;
        }
        {
            let _e462 = lower;
            let _e463 = upper;
            let middle = ((_e462 + _e463) * 0.5f);
            let uv_9 = (_e97 + (deltaUv_3 * middle));
            let pixel_9 = min(vec2<u32>((clamp(uv_9, vec2(0f), vec2(1f)) * vec2<f32>(fullSize_5))), (fullSize_5 - vec2(1u)));
            let _e482 = sampleSsrHiZ(uv_9, 0u);
            let rayDepth_1 = (1f / mix(inverseStart, inverseEnd, middle));
            let _e489 = textureLoad(sceneNormal, vec2<i32>(pixel_9), 0i);
            let normal_5 = ((_e489.xyz * 2f) - vec3(1f));
            let _e499 = textureLoad(reflectionFallback, vec2<i32>(pixel_9), 0i);
            let covered = (_e499.w > 0.5f);
            if (rayDepth_1 >= _e482) {
                local_73 = covered;
            } else {
                local_73 = false;
            }
            let _e507 = local_73;
            if _e507 {
                local_74 = (dot(normal_5, -(direction_2)) > 0f);
            } else {
                local_74 = false;
            }
            let _e515 = local_74;
            if _e515 {
                upper = middle;
            } else {
                lower = middle;
            }
        }
        continuing {
            let _e517 = refine;
            refine = (_e517 + 1u);
        }
    }
    let _e519 = upper;
    let uv_10 = (_e97 + (deltaUv_3 * _e519));
    let pixel_10 = min(vec2<u32>((clamp(uv_10, vec2(0f), vec2(1f)) * vec2<f32>(fullSize_5))), (fullSize_5 - vec2(1u)));
    let depth_6 = textureLoad(sceneDepth, vec2<i32>(pixel_10), 0i);
    let _e541 = textureLoad(sceneNormal, vec2<i32>(pixel_10), 0i);
    let normal_6 = ((_e541.xyz * 2f) - vec3(1f));
    let _e551 = textureLoad(reflectionFallback, vec2<i32>(pixel_10), 0i);
    let covered_1 = (_e551.w > 0.5f);
    let _e555 = rescued;
    if _e555 {
        if !((depth_6 >= 1f)) {
            local_76 = (dot(normal_6, -(direction_2)) <= 0f);
        } else {
            local_76 = true;
        }
        let _e566 = local_76;
        if !(_e566) {
            local_77 = !(covered_1);
        } else {
            local_77 = true;
        }
        let _e572 = local_77;
        local_75 = _e572;
    } else {
        local_75 = false;
    }
    let _e576 = local_75;
    if _e576 {
        let _e577 = rescuedUv;
        let _e578 = rescuedThickness;
        let _e580 = result_1.reactivity;
        return SsrTraceHit(1f, _e577, _e578, _e580);
    }
    if !((depth_6 >= 1f)) {
        local_78 = (dot(normal_6, -(direction_2)) <= 0f);
    } else {
        local_78 = true;
    }
    let _e593 = local_78;
    if !(_e593) {
        local_79 = !(covered_1);
    } else {
        local_79 = true;
    }
    let _e599 = local_79;
    if _e599 {
        let _e600 = result_1;
        return _e600;
    }
    let _e601 = result_1;
    let _e603 = ssrRefineHit(origin_2, direction_2, maxDistance_1, thickness_2, fullSize_5, pixel_10, depth_6, normal_6, _e601, false);
    if !((_e603.hit > 0f)) {
        let _e608 = ssrShadingNormalVaries(pixel_10, normal_6);
        local_80 = !(_e608);
    } else {
        local_80 = true;
    }
    let _e613 = local_80;
    if _e613 {
        if (_e603.hit <= 0f) {
            let _e617 = rescued;
            local_81 = _e617;
        } else {
            local_81 = false;
        }
        let _e621 = local_81;
        if _e621 {
            let _e622 = rescuedUv;
            let _e623 = rescuedThickness;
            let _e625 = result_1.reactivity;
            return SsrTraceHit(1f, _e622, _e623, _e625);
        }
        return _e603;
    }
    let _e628 = rescued;
    if _e628 {
        let _e629 = rescuedUv;
        let _e630 = rescuedThickness;
        let _e632 = result_1.reactivity;
        return SsrTraceHit(1f, _e629, _e630, _e632);
    }
    let _e635 = result_1;
    let _e637 = ssrRefineHit(origin_2, direction_2, maxDistance_1, thickness_2, fullSize_5, pixel_10, depth_6, normal_6, _e635, true);
    return _e637;
}

fn ssrHitTapAdmitted(pixel_6: vec2<i32>, rayDirection: vec3<f32>) -> bool {
    var local_82: bool;

    let _e3 = textureLoad(sceneNormal, pixel_6, 0i);
    let normal_7 = ((_e3.xyz * 2f) - vec3(1f));
    let _e12 = textureLoad(reflectionFallback, pixel_6, 0i);
    if (_e12.w > 0.5f) {
        local_82 = (dot(normal_7, -(rayDirection)) > 0f);
    } else {
        local_82 = false;
    }
    let _e24 = local_82;
    return _e24;
}

fn sampleSsrHitSample(uv_7: vec2<f32>, rayDirection_1: vec3<f32>) -> SsrHitSample {
    var sum: vec4<f32> = vec4(0f);
    var reactivity: f32 = 0f;
    var y: i32 = 0i;
    var x: i32;

    let _e5 = textureDimensions(sceneColor, 0i);
    let size_5 = vec2<i32>(_e5);
    let position = ((uv_7 * vec2<f32>(size_5)) - vec2(0.5f));
    let first = vec2<i32>(floor(position));
    let fraction_2 = fract(position);
    let last = (size_5 - vec2(1i));
    loop {
        let _e20 = y;
        if (_e20 < 2i) {
        } else {
            break;
        }
        {
            x = 0i;
            loop {
                let _e25 = x;
                if (_e25 < 2i) {
                } else {
                    break;
                }
                {
                    let _e28 = x;
                    let _e29 = y;
                    let pixel_11 = clamp((first + vec2<i32>(_e28, _e29)), vec2(0i), last);
                    let _e36 = ssrHitTapAdmitted(pixel_11, rayDirection_1);
                    if !(_e36) {
                        continue;
                    }
                    let _e42 = x;
                    let _e50 = y;
                    let weight = (select((1f - fraction_2.x), fraction_2.x, (_e42 == 1i)) * select((1f - fraction_2.y), fraction_2.y, (_e50 == 1i)));
                    let _e57 = textureLoad(sceneColor, pixel_11, 0i);
                    let color = _e57.xyz;
                    let _e60 = sum;
                    sum = (_e60 + vec4<f32>((color * weight), weight));
                    if (weight > 0f) {
                        let _e67 = reactivity;
                        let _e68 = ssrSourceReactivity(pixel_11);
                        reactivity = max(_e67, _e68);
                    }
                }
                continuing {
                    let _e71 = x;
                    x = (_e71 + 1i);
                }
            }
        }
        continuing {
            let _e74 = y;
            y = (_e74 + 1i);
        }
    }
    let _e76 = sum;
    let _e79 = sum.w;
    let _e85 = sum.w;
    let _e87 = reactivity;
    return SsrHitSample(vec4<f32>((_e76.xyz / vec3(max(_e79, 0.000001f))), _e85), _e87);
}

@compute @workgroup_size(8, 8, 1) 
fn ssr_trace(@builtin(global_invocation_id) globalId: vec3<u32>) {
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

    let fullSize_6 = textureDimensions(sceneColor, 0i);
    let traceSize = max((fullSize_6 / vec2(2u)), vec2(1u));
    if !((globalId.x >= traceSize.x)) {
        local = (globalId.y >= traceSize.y);
    } else {
        local = true;
    }
    let _e20 = local;
    if _e20 {
        return;
    }
    textureStore(hitReactivityOutput, vec2<i32>(globalId.xy), vec4(0f));
    let fullPixel = min((globalId.xy * vec2(2u)), (fullSize_6 - vec2(1u)));
    let _e35 = textureNumLevels(hizPyramid);
    let physicalMaxMip = (_e35 - 1u);
    let _e38 = maxSsrHiZMip(fullSize_6);
    let hizMaxMip_1 = min(_e38, (physicalMaxMip + 1u));
    let hizSize_1 = textureDimensions(hizPyramid, physicalMaxMip);
    let hizPixel = min(globalId.xy, (hizSize_1 - vec2(1u)));
    let depth_7 = textureLoad(sceneDepth, vec2<i32>(fullPixel), 0i);
    let normalData = textureLoad(sceneNormal, vec2<i32>(fullPixel), 0i);
    let normalUnnormalized = ((normalData.xyz * 2f) - vec3(1f));
    let normalLength = length(normalUnnormalized);
    let _e64 = isFinite(depth_7);
    if !(!(_e64)) {
        local_1 = (depth_7 >= 1f);
    } else {
        local_1 = true;
    }
    let _e72 = local_1;
    if !(_e72) {
        let _e74 = isFinite(normalLength);
        local_2 = !(_e74);
    } else {
        local_2 = true;
    }
    let _e79 = local_2;
    if !(_e79) {
        local_3 = (normalLength <= 0.00001f);
    } else {
        local_3 = true;
    }
    let _e86 = local_3;
    if !(_e86) {
        let _e91 = textureLoad(reflectionFallback, vec2<i32>(fullPixel), 0i);
        local_4 = (_e91.w <= 0.5f);
    } else {
        local_4 = true;
    }
    let _e98 = local_4;
    if !(_e98) {
        let _e103 = view.ssrParams.w;
        let _e104 = isFinite(_e103);
        local_5 = !(_e104);
    } else {
        local_5 = true;
    }
    let _e109 = local_5;
    if !(_e109) {
        let _e114 = view.ssrParams.w;
        local_6 = (_e114 <= 0.5f);
    } else {
        local_6 = true;
    }
    let _e120 = local_6;
    if !(_e120) {
        let _e123 = isFinite(normalData.w);
        local_7 = !(_e123);
    } else {
        local_7 = true;
    }
    let _e128 = local_7;
    if !(_e128) {
        let _e134 = view.ssrParams.z;
        local_8 = (normalData.w >= _e134);
    } else {
        local_8 = true;
    }
    let _e139 = local_8;
    if _e139 {
        textureStore(traceOutput, vec2<i32>(globalId.xy), vec4(0f));
        return;
    }
    let _e151 = isFinite(normalLength);
    if _e151 {
        local_9 = (normalLength > 0.00001f);
    } else {
        local_9 = false;
    }
    let _e157 = local_9;
    let normal_8 = select(vec3<f32>(0f, 0f, 1f), (normalUnnormalized / vec3(normalLength)), _e157);
    let _e162 = textureLoad(hizPyramid, vec2<i32>(hizPixel), i32(physicalMaxMip));
    let hizDepth_1 = _e162.x;
    let uv_11 = ((vec2<f32>(fullPixel) + vec2(0.5f)) / vec2<f32>(fullSize_6));
    let _e173 = view.ssrParams.w;
    let _e174 = isFinite(_e173);
    if _e174 {
        let _e178 = view.ssrParams.w;
        local_10 = (_e178 > 0.5f);
    } else {
        local_10 = false;
    }
    let _e184 = local_10;
    let enabled = select(0f, 1f, _e184);
    let _e191 = view.ssrParams.x;
    let maxDistance_2 = (enabled * _e191);
    let _e196 = view.ssrParams.y;
    let thickness_3 = (enabled * _e196);
    let _e201 = view.ssrParams.z;
    let roughnessLimit = (enabled * clamp(_e201, 0f, 1f));
    let _e206 = reconstructWorldPosition(uv_11, depth_7);
    let _e209 = view.cameraPos;
    let viewDirectionRaw = (_e209 - _e206);
    let viewDirectionLength = length(viewDirectionRaw);
    let _e218 = isFinite(viewDirectionLength);
    if _e218 {
        local_11 = (viewDirectionLength > 0.00001f);
    } else {
        local_11 = false;
    }
    let _e224 = local_11;
    let viewDirection = select(vec3<f32>(0f, 0f, 1f), (viewDirectionRaw / vec3(viewDirectionLength)), _e224);
    let facing_1 = clamp((dot(normal_8, viewDirection) * 8f), 0f, 1f);
    let reflectionDirection = normalize(reflect(-(viewDirection), normal_8));
    let _e235 = traceScreenRay(_e206, reflectionDirection, maxDistance_2, thickness_3, fullSize_6, hizDepth_1, hizMaxMip_1);
    let _e237 = traceEdge(_e235.uv);
    textureStore(hitReactivityOutput, vec2<i32>(globalId.xy), vec4(_e235.reactivity));
    let _e258 = finiteConfidence(select(0f, (1f - smoothstep((roughnessLimit * 0.8f), max(roughnessLimit, 0.00001f), clamp(normalData.w, 0f, 1f))), (roughnessLimit > 0f)));
    let _e262 = traceConfidence(_e235.hit, _e235.thickness, facing_1, _e237, _e258, 1f);
    if (_e262 <= 0f) {
        textureStore(traceOutput, vec2<i32>(globalId.xy), vec4(0f));
        return;
    }
    let _e271 = sampleSsrHitSample(_e235.uv, reflectionDirection);
    let hitColor = _e271.color;
    let _e274 = isFinite(hitColor.x);
    let _e276 = isFinite(hitColor.y);
    let _e278 = isFinite(hitColor.z);
    if !(all(vec3<bool>(_e274, _e276, _e278))) {
        textureStore(traceOutput, vec2<i32>(globalId.xy), vec4(0f));
        return;
    }
    textureStore(traceOutput, vec2<i32>(globalId.xy), vec4<f32>(hitColor.xyz, (_e262 * hitColor.w)));
    textureStore(hitReactivityOutput, vec2<i32>(globalId.xy), vec4(max(_e235.reactivity, _e271.reactivity)));
    return;
}
