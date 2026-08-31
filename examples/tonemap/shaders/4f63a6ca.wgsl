struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct SceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX {
    motionUv: vec2<f32>,
    viewDepth: f32,
    reactive: f32,
    validDepth: bool,
}

struct MotionBlurParams {
    shutterAngle: f32,
    maxRadiusPixels: f32,
    sampleCount: u32,
    reset: u32,
}

@group(1) @binding(0) 
var currentColor: texture_2d<f32>;
@group(1) @binding(1) 
var linearSampler: sampler;
@group(1) @binding(2) 
var<uniform> params: MotionBlurParams;
@group(1) @binding(3) 
var sceneTemporal: texture_2d<f32>;

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

fn unpackSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(packed: vec4<f32>) -> SceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX {
    let invalidDepth = (packed.z < 0f);
    let validDepth = !(invalidDepth);
    let viewDepth = select(0f, (exp2(packed.z) - 1f), validDepth);
    let motionUv = packed.xy;
    let reactive = clamp(packed.w, 0f, 1f);
    return SceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(motionUv, viewDepth, reactive, validDepth);
}

fn depthReject(center: f32, sample: f32) -> bool {
    return (abs((center - sample)) > max(0.01f, (center * 0.01f)));
}

fn symmetricOffset(index_1: u32, count: u32, motion: vec2<f32>) -> vec2<f32> {
    let denominator = max(f32(count), 1f);
    let signedIndex = (f32(index_1) - ((denominator - 1f) * 0.5f));
    return (motion * (signedIndex / denominator));
}

@vertex 
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertexIndex);
    return _e1;
}

@fragment 
fn fs_main(in: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    var output: vec4<f32>;
    var local: bool;
    var local_1: bool;
    var local_2: bool;
    var accum: vec3<f32> = vec3(0f);
    var weight: f32 = 0f;
    var index: u32 = 0u;
    var local_3: bool;

    let current = textureSampleLevel(currentColor, linearSampler, in.uv, 0f);
    let packed_1 = textureSampleLevel(sceneTemporal, linearSampler, in.uv, 0f);
    let _e14 = unpackSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(packed_1);
    let _e16 = textureDimensions(currentColor);
    let dimensions = vec2<f32>(_e16);
    let pixelMotion = (_e14.motionUv * dimensions);
    let _e22 = params.shutterAngle;
    let shutter = clamp((_e22 / 360f), 0f, 1f);
    let _e32 = params.maxRadiusPixels;
    let radius = min((length(pixelMotion) * shutter), _e32);
    let motion_1 = normalize(select(vec2(0f), pixelMotion, (radius > 0.00001f)));
    let invalidDepth_1 = !(_e14.validDepth);
    let reactive_1 = clamp(_e14.reactive, 0f, 1f);
    let subpixel = (radius <= 0.00001f);
    let _e50 = params.reset;
    let reset = (_e50 != 0u);
    output = current;
    output.w = current.w;
    if !(invalidDepth_1) {
        local = subpixel;
    } else {
        local = true;
    }
    let _e60 = local;
    if !(_e60) {
        local_1 = reset;
    } else {
        local_1 = true;
    }
    let _e65 = local_1;
    if !(_e65) {
        let _e69 = params.sampleCount;
        local_2 = (_e69 < 4u);
    } else {
        local_2 = true;
    }
    let _e75 = local_2;
    if _e75 {
        let _e76 = output;
        return _e76;
    }
    let _e78 = textureDimensions(sceneTemporal);
    let temporalDimensions = vec2<i32>(_e78);
    loop {
        let _e81 = index;
        if (_e81 < 16u) {
        } else {
            break;
        }
        {
            let _e84 = index;
            let _e87 = params.sampleCount;
            if (_e84 >= _e87) {
                break;
            }
            let _e89 = index;
            let _e92 = params.sampleCount;
            let _e94 = symmetricOffset(_e89, _e92, (motion_1 * radius));
            let offset = (_e94 / dimensions);
            let sampleUv = clamp((in.uv + offset), vec2(0f), vec2(1f));
            let samplePixel = clamp(vec2<i32>((sampleUv * dimensions)), vec2(0i), (temporalDimensions - vec2(1i)));
            let _e113 = textureLoad(sceneTemporal, samplePixel, 0i);
            let _e114 = unpackSceneTemporalV1X_naga_oil_mod_XMZXXEZ3FMF4F643DMVXGKX3UMVWXA33SMFWAX(_e113);
            if _e114.validDepth {
                let _e118 = depthReject(_e14.viewDepth, _e114.viewDepth);
                local_3 = !(_e118);
            } else {
                local_3 = false;
            }
            let _e123 = local_3;
            if _e123 {
                let _e125 = accum;
                let _e129 = textureSampleLevel(currentColor, linearSampler, sampleUv, 0f);
                accum = (_e125 + _e129.xyz);
                let _e133 = weight;
                weight = (_e133 + 1f);
            }
        }
        continuing {
            let _e136 = index;
            index = (_e136 + 1u);
        }
    }
    let _e139 = accum;
    let _e140 = weight;
    let gathered = (_e139 / vec3(max(_e140, 1f)));
    let _e147 = weight;
    let blurWeight = ((1f - reactive_1) * select(0f, 1f, (_e147 > 0f)));
    output = vec4<f32>(mix(current.xyz, gathered, blurWeight), current.w);
    output.w = current.w;
    let _e160 = output;
    return _e160;
}
