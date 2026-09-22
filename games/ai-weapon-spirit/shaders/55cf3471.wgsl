struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct SsaoUniform {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    inverseProjection: mat4x4<f32>,
    intensityPad: vec4<f32>,
}

struct SsaoVsOut {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

@group(0) @binding(0) 
var<uniform> ssao_uniform: SsaoUniform;
@group(0) @binding(1) 
var<uniform> ssao_kernel: array<vec4<f32>, 64>;
@group(0) @binding(2) 
var ssao_noise_texture: texture_2d<f32>;
@group(0) @binding(3) 
var ssao_noise_sampler: sampler;
@group(0) @binding(4) 
var gbuffer_normal: texture_2d<f32>;
@group(0) @binding(5) 
var hdr_depth: texture_depth_2d;
@group(0) @binding(6) 
var ssao_depth_sampler: sampler;
@group(0) @binding(7) 
var ssaoRaw: texture_2d<f32>;
@group(0) @binding(8) 
var ssaoSampler: sampler;

fn fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index_1: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    var x_1: f32 = -1f;
    var y_1: f32 = -1f;
    var out_1: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

    if (vertex_index_1 == 1u) {
        x_1 = 3f;
    }
    if (vertex_index_1 == 2u) {
        y_1 = 3f;
    }
    let _e10 = x_1;
    let u = ((_e10 + 1f) * 0.5f);
    let _e15 = y_1;
    let v = (1f - ((_e15 + 1f) * 0.5f));
    let _e24 = x_1;
    let _e25 = y_1;
    out_1.position = vec4<f32>(_e24, _e25, 0f, 1f);
    out_1.uv = vec2<f32>(u, v);
    let _e31 = out_1;
    return _e31;
}

fn ssaoViewZ(uv: vec2<f32>, depth: f32) -> f32 {
    let _e2 = ssao_uniform.inverseProjection;
    let p = (_e2 * vec4<f32>(((uv * vec2<f32>(2f, -2f)) + vec2<f32>(-1f, 1f)), depth, 1f));
    return (p.z / p.w);
}

@vertex 
fn vs_ssao(@builtin(vertex_index) vertex_index: u32) -> SsaoVsOut {
    var out: SsaoVsOut;

    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertex_index);
    out.position = _e1.position;
    out.uv = _e1.uv;
    let _e7 = out;
    return _e7;
}

@fragment 
fn fs_ssao_calc(in: SsaoVsOut) -> @location(0) f32 {
    var viewPosH: vec4<f32>;
    var occlusion: f32 = 0f;
    var i: u32 = 0u;
    var sampleView: vec3<f32>;
    var offset: vec4<f32>;
    var local: bool;
    var sampledViewPosH: vec4<f32>;

    let depth_1 = textureSampleLevel(hdr_depth, ssao_depth_sampler, in.uv, 0i);
    if (depth_1 >= 0.999999f) {
        return 1f;
    }
    let ndc = vec4<f32>(((in.uv * vec2<f32>(2f, -2f)) + vec2<f32>(-1f, 1f)), depth_1, 1f);
    let _e24 = ssao_uniform.inverseProjection;
    viewPosH = (_e24 * ndc);
    let _e27 = viewPosH;
    let _e29 = viewPosH.w;
    viewPosH = (_e27 / vec4(_e29));
    let _e32 = viewPosH;
    let viewPos = _e32.xyz;
    let _e38 = textureSampleLevel(gbuffer_normal, ssao_depth_sampler, in.uv, 0f);
    let packedNormal = _e38.xyz;
    let worldNormal = normalize(((packedNormal * 2f) - vec3(1f)));
    let _e48 = ssao_uniform.view;
    let viewNormal = normalize((_e48 * vec4<f32>(worldNormal, 0f)).xyz);
    let _e56 = textureDimensions(gbuffer_normal, 0i);
    let screenDim = vec2<f32>(_e56);
    let noiseUV = ((in.uv * screenDim) / vec2(8f));
    let _e66 = textureSampleLevel(ssao_noise_texture, ssao_noise_sampler, noiseUV, 0f);
    let randomVec = normalize(_e66.xyz);
    let tangent = normalize((randomVec - (viewNormal * dot(randomVec, viewNormal))));
    let bitangent = cross(viewNormal, tangent);
    let TBN = mat3x3<f32>(tangent, bitangent, viewNormal);
    let radius = ssao_uniform.intensityPad.y;
    let bias = ssao_uniform.intensityPad.z;
    let _e86 = ssao_uniform.intensityPad.w;
    let sampleCount = u32(clamp(_e86, 16f, 64f));
    loop {
        let _e92 = i;
        if (_e92 < sampleCount) {
        } else {
            break;
        }
        {
            let _e94 = i;
            let _e100 = ssao_kernel[((_e94 * 64u) / sampleCount)];
            let sampleTangent = _e100.xyz;
            sampleView = (TBN * sampleTangent);
            let _e104 = sampleView;
            sampleView = (viewPos + (_e104 * radius));
            let _e109 = ssao_uniform.projection;
            let _e110 = sampleView;
            offset = (_e109 * vec4<f32>(_e110, 1f));
            let _e116 = offset.w;
            if (_e116 <= 0f) {
                continue;
            }
            let _e119 = offset;
            let _e121 = offset.w;
            offset = (_e119 / vec4(_e121));
            let _e124 = offset;
            let sampleUv = ((_e124.xy * vec2<f32>(0.5f, -0.5f)) + vec2(0.5f));
            if !(any((sampleUv < vec2(0f)))) {
                local = any((sampleUv > vec2(1f)));
            } else {
                local = true;
            }
            let _e145 = local;
            if _e145 {
                continue;
            }
            let sampleDepth = textureSampleLevel(hdr_depth, ssao_depth_sampler, sampleUv, 0i);
            let _e152 = ssao_uniform.inverseProjection;
            let _e153 = offset;
            sampledViewPosH = (_e152 * vec4<f32>(_e153.xy, sampleDepth, 1f));
            let _e159 = sampledViewPosH;
            let _e161 = sampledViewPosH.w;
            sampledViewPosH = (_e159 / vec4(_e161));
            let sampledViewZ = sampledViewPosH.z;
            let rangeCheck = smoothstep(0f, 1f, (radius / max(abs((viewPos.z - sampledViewZ)), 0.0001f)));
            let _e176 = sampleView.z;
            let sampleContrib = select(0f, 1f, (sampledViewZ >= (_e176 + bias)));
            let _e183 = occlusion;
            occlusion = (_e183 + (sampleContrib * rangeCheck));
        }
        continuing {
            let _e186 = i;
            i = (_e186 + 1u);
        }
    }
    let _e189 = occlusion;
    occlusion = (1f - (_e189 / f32(sampleCount)));
    let _e194 = occlusion;
    return _e194;
}

@fragment 
fn fs_ssao_blur(in_1: SsaoVsOut) -> @location(0) f32 {
    var total: f32 = 0f;
    var weight: f32 = 0f;
    var y: i32 = -2i;
    var x: i32;
    var local_1: bool;

    let depth_2 = textureSampleLevel(hdr_depth, ssao_depth_sampler, in_1.uv, 0i);
    if (depth_2 >= 0.999999f) {
        return 1f;
    }
    let _e12 = ssaoViewZ(in_1.uv, depth_2);
    let _e17 = textureSampleLevel(gbuffer_normal, ssao_depth_sampler, in_1.uv, 0f);
    let normal = normalize(((_e17.xyz * 2f) - vec3(1f)));
    let _e26 = textureDimensions(ssaoRaw);
    let texel = (vec2(1f) / vec2<f32>(_e26));
    loop {
        let _e32 = y;
        if (_e32 <= 2i) {
        } else {
            break;
        }
        {
            x = -2i;
            loop {
                let _e37 = x;
                if (_e37 <= 2i) {
                } else {
                    break;
                }
                {
                    let _e41 = x;
                    let _e43 = y;
                    let uv_1 = (in_1.uv + (vec2<f32>(f32(_e41), f32(_e43)) * texel));
                    if !(any((uv_1 < vec2(0f)))) {
                        local_1 = any((uv_1 > vec2(1f)));
                    } else {
                        local_1 = true;
                    }
                    let _e60 = local_1;
                    if _e60 {
                        continue;
                    }
                    let d = textureSampleLevel(hdr_depth, ssao_depth_sampler, uv_1, 0i);
                    if (d >= 0.999999f) {
                        continue;
                    }
                    let _e70 = textureSampleLevel(gbuffer_normal, ssao_depth_sampler, uv_1, 0f);
                    let n = normalize(((_e70.xyz * 2f) - vec3(1f)));
                    let _e78 = ssaoViewZ(uv_1, d);
                    let dz = abs((_e78 - _e12));
                    let _e81 = x;
                    let _e82 = x;
                    let _e84 = y;
                    let _e85 = y;
                    let _e97 = ssao_uniform.intensityPad.y;
                    let w = ((exp((-(f32(((_e81 * _e82) + (_e84 * _e85)))) / 4f)) * exp((-(dz) / max(0.01f, (_e97 * 0.1f))))) * pow(max(dot(n, normal), 0f), 8f));
                    let _e112 = total;
                    let _e116 = textureSampleLevel(ssaoRaw, ssao_depth_sampler, uv_1, 0f);
                    total = (_e112 + (_e116.x * w));
                    let _e121 = weight;
                    weight = (_e121 + w);
                }
                continuing {
                    let _e124 = x;
                    x = (_e124 + 1i);
                }
            }
        }
        continuing {
            let _e127 = y;
            y = (_e127 + 1i);
        }
    }
    let _e129 = total;
    let _e130 = weight;
    return (_e129 / max(_e130, 0.00001f));
}
