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

const SSR_HIZ_FORMAT: u32 = 1u;
const SSR_HIZ_EMPTY_DEPTH: f32 = 3.402823e38f;

@group(0) @binding(0) 
var sourceDepth: texture_depth_2d;
@group(0) @binding(1) 
var hizOutput: texture_storage_2d<r32float,write>;
@group(0) @binding(2) 
var<uniform> view: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

fn isFinite(value: f32) -> bool {
    var local_2: bool;

    if (value == value) {
        local_2 = (abs(value) < 3.402823e38f);
    } else {
        local_2 = false;
    }
    let _e8 = local_2;
    return _e8;
}

fn linearizeSsrDepth(value_1: f32) -> f32 {
    var local_3: bool;
    var local_4: bool;
    var local_5: bool;
    var local_6: bool;
    var local_7: bool;
    var local_8: bool;

    let _e1 = isFinite(value_1);
    if !(!(_e1)) {
        local_3 = (value_1 <= 0f);
    } else {
        local_3 = true;
    }
    let _e9 = local_3;
    if !(_e9) {
        local_4 = (value_1 >= 1f);
    } else {
        local_4 = true;
    }
    let _e16 = local_4;
    if _e16 {
        return SSR_HIZ_EMPTY_DEPTH;
    }
    let near = view.temporalProjection.x;
    let far = view.temporalProjection.y;
    let _e26 = isFinite(near);
    if !(!(_e26)) {
        let _e29 = isFinite(far);
        local_5 = !(_e29);
    } else {
        local_5 = true;
    }
    let _e34 = local_5;
    if !(_e34) {
        local_6 = (near <= 0f);
    } else {
        local_6 = true;
    }
    let _e41 = local_6;
    if !(_e41) {
        local_7 = (far <= near);
    } else {
        local_7 = true;
    }
    let _e47 = local_7;
    if _e47 {
        return SSR_HIZ_EMPTY_DEPTH;
    }
    let _e52 = view.temporalProjection.z;
    let orthographic = (_e52 > 0.5f);
    let distance_ = select(((near * far) / max((far - (value_1 * (far - near))), 0.00001f)), (near + (value_1 * (far - near))), orthographic);
    let _e66 = isFinite(distance_);
    if _e66 {
        local_8 = (distance_ > 0f);
    } else {
        local_8 = false;
    }
    let _e73 = local_8;
    return select(SSR_HIZ_EMPTY_DEPTH, distance_, _e73);
}

@compute @workgroup_size(8, 8, 1) 
fn ssr_hiz_seed(@builtin(global_invocation_id) globalId: vec3<u32>) {
    var nearestDepth: f32 = 1f;
    var y: u32;
    var x: u32;
    var local: bool;
    var local_1: bool;

    let sourceSize = textureDimensions(sourceDepth, 0i);
    let outputSize = textureDimensions(hizOutput);
    if any((globalId.xy >= outputSize)) {
        return;
    }
    let first = ((globalId.xy * sourceSize) / outputSize);
    let end = min((((((globalId.xy + vec2(1u)) * sourceSize) + outputSize) - vec2(1u)) / outputSize), sourceSize);
    y = first.y;
    loop {
        let _e26 = y;
        if (_e26 < end.y) {
        } else {
            break;
        }
        {
            x = first.x;
            loop {
                let _e31 = x;
                if (_e31 < end.x) {
                } else {
                    break;
                }
                {
                    let _e34 = x;
                    let _e35 = y;
                    let sample = textureLoad(sourceDepth, vec2<i32>(vec2<u32>(_e34, _e35)), 0i);
                    let _e41 = isFinite(sample);
                    if _e41 {
                        local = (sample > 0f);
                    } else {
                        local = false;
                    }
                    let _e47 = local;
                    if _e47 {
                        local_1 = (sample < 1f);
                    } else {
                        local_1 = false;
                    }
                    let _e53 = local_1;
                    if _e53 {
                        let _e55 = nearestDepth;
                        nearestDepth = min(_e55, sample);
                    }
                }
                continuing {
                    let _e58 = x;
                    x = (_e58 + 1u);
                }
            }
        }
        continuing {
            let _e61 = y;
            y = (_e61 + 1u);
        }
    }
    let _e63 = nearestDepth;
    let _e64 = linearizeSsrDepth(_e63);
    textureStore(hizOutput, vec2<i32>(globalId.xy), vec4<f32>(_e64, 0f, 0f, 1f));
    return;
}
