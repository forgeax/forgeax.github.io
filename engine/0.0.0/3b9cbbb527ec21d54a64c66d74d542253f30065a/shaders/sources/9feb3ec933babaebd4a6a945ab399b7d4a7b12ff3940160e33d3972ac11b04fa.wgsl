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
var gbuffer_normal: texture_2d<u32>;
@group(0) @binding(5) 
var hdr_depth: texture_depth_2d;
@group(0) @binding(6) 
var ssao_depth_sampler: sampler;
@group(0) @binding(7) 
var ssaoRaw: texture_2d<f32>;
@group(0) @binding(8) 
var ssaoSampler: sampler;

fn decodeStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(packed: u32) -> vec4<f32> {
    var normal: vec3<f32>;

    let oct = ((vec2<f32>(f32((packed & 4095u)), f32(((packed >> 12u) & 4095u))) * 0.0004884005f) - vec2(1f));
    normal = vec3<f32>(oct, ((1f - abs(oct.x)) - abs(oct.y)));
    let _e25 = normal.z;
    let fold = max(-(_e25), 0f);
    let _e29 = normal;
    let _e34 = normal;
    let _e42 = normal.z;
    normal = vec3<f32>((_e29.xy + select(vec2(fold), vec2(-(fold)), (_e34.xy >= vec2(0f)))), _e42);
    let _e44 = normal;
    return vec4<f32>(normalize(_e44), (f32((packed >> 24u)) / 255f));
}

fn loadStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(source: texture_2d<u32>, pixel: vec2<i32>) -> vec4<f32> {
    let _e3 = textureLoad(source, pixel, 0i);
    let _e5 = decodeStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(_e3.x);
    return _e5;
}

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

fn ssaoNormal(uv: vec2<f32>) -> vec3<f32> {
    let _e1 = textureDimensions(gbuffer_normal);
    let size = vec2<i32>(_e1);
    let pixel_1 = clamp(vec2<i32>((uv * vec2<f32>(size))), vec2(0i), (size - vec2(1i)));
    let _e14 = loadStandardNormalRoughnessX_naga_oil_mod_XMZXXEZ3FMF4F64DCOI5DUZ3COVTGMZLSX(gbuffer_normal, pixel_1);
    return _e14.xyz;
}

fn ssaoViewZ(uv_1: vec2<f32>, depth: f32) -> f32 {
    let _e2 = ssao_uniform.inverseProjection;
    let p = (_e2 * vec4<f32>(((uv_1 * vec2<f32>(2f, -2f)) + vec2<f32>(-1f, 1f)), depth, 1f));
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
    let _e35 = ssaoNormal(in.uv);
    let _e38 = ssao_uniform.view;
    let viewNormal = normalize((_e38 * vec4<f32>(_e35, 0f)).xyz);
    let _e46 = textureDimensions(gbuffer_normal, 0i);
    let screenDim = vec2<f32>(_e46);
    let noiseUV = ((in.uv * screenDim) / vec2(8f));
    let _e56 = textureSampleLevel(ssao_noise_texture, ssao_noise_sampler, noiseUV, 0f);
    let randomVec = normalize(_e56.xyz);
    let tangent = normalize((randomVec - (viewNormal * dot(randomVec, viewNormal))));
    let bitangent = cross(viewNormal, tangent);
    let TBN = mat3x3<f32>(tangent, bitangent, viewNormal);
    let radius = ssao_uniform.intensityPad.y;
    let bias = ssao_uniform.intensityPad.z;
    let _e76 = ssao_uniform.intensityPad.w;
    let sampleCount = u32(clamp(_e76, 16f, 64f));
    loop {
        let _e82 = i;
        if (_e82 < sampleCount) {
        } else {
            break;
        }
        {
            let _e84 = i;
            let _e90 = ssao_kernel[((_e84 * 64u) / sampleCount)];
            let sampleTangent = _e90.xyz;
            sampleView = (TBN * sampleTangent);
            let _e94 = sampleView;
            sampleView = (viewPos + (_e94 * radius));
            let _e99 = ssao_uniform.projection;
            let _e100 = sampleView;
            offset = (_e99 * vec4<f32>(_e100, 1f));
            let _e106 = offset.w;
            if (_e106 <= 0f) {
                continue;
            }
            let _e109 = offset;
            let _e111 = offset.w;
            offset = (_e109 / vec4(_e111));
            let _e114 = offset;
            let sampleUv = ((_e114.xy * vec2<f32>(0.5f, -0.5f)) + vec2(0.5f));
            if !(any((sampleUv < vec2(0f)))) {
                local = any((sampleUv > vec2(1f)));
            } else {
                local = true;
            }
            let _e135 = local;
            if _e135 {
                continue;
            }
            let sampleDepth = textureSampleLevel(hdr_depth, ssao_depth_sampler, sampleUv, 0i);
            let _e142 = ssao_uniform.inverseProjection;
            let _e143 = offset;
            sampledViewPosH = (_e142 * vec4<f32>(_e143.xy, sampleDepth, 1f));
            let _e149 = sampledViewPosH;
            let _e151 = sampledViewPosH.w;
            sampledViewPosH = (_e149 / vec4(_e151));
            let sampledViewZ = sampledViewPosH.z;
            let rangeCheck = smoothstep(0f, 1f, (radius / max(abs((viewPos.z - sampledViewZ)), 0.0001f)));
            let _e166 = sampleView.z;
            let sampleContrib = select(0f, 1f, (sampledViewZ >= (_e166 + bias)));
            let _e173 = occlusion;
            occlusion = (_e173 + (sampleContrib * rangeCheck));
        }
        continuing {
            let _e176 = i;
            i = (_e176 + 1u);
        }
    }
    let _e179 = occlusion;
    occlusion = (1f - (_e179 / f32(sampleCount)));
    let _e184 = occlusion;
    return _e184;
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
    let _e14 = ssaoNormal(in_1.uv);
    let _e16 = textureDimensions(ssaoRaw);
    let texel = (vec2(1f) / vec2<f32>(_e16));
    loop {
        let _e22 = y;
        if (_e22 <= 2i) {
        } else {
            break;
        }
        {
            x = -2i;
            loop {
                let _e27 = x;
                if (_e27 <= 2i) {
                } else {
                    break;
                }
                {
                    let _e31 = x;
                    let _e33 = y;
                    let uv_2 = (in_1.uv + (vec2<f32>(f32(_e31), f32(_e33)) * texel));
                    if !(any((uv_2 < vec2(0f)))) {
                        local_1 = any((uv_2 > vec2(1f)));
                    } else {
                        local_1 = true;
                    }
                    let _e50 = local_1;
                    if _e50 {
                        continue;
                    }
                    let d = textureSampleLevel(hdr_depth, ssao_depth_sampler, uv_2, 0i);
                    if (d >= 0.999999f) {
                        continue;
                    }
                    let _e57 = ssaoNormal(uv_2);
                    let _e58 = ssaoViewZ(uv_2, d);
                    let dz = abs((_e58 - _e12));
                    let _e61 = x;
                    let _e62 = x;
                    let _e64 = y;
                    let _e65 = y;
                    let _e77 = ssao_uniform.intensityPad.y;
                    let w = ((exp((-(f32(((_e61 * _e62) + (_e64 * _e65)))) / 4f)) * exp((-(dz) / max(0.01f, (_e77 * 0.1f))))) * pow(max(dot(_e57, _e14), 0f), 8f));
                    let _e92 = total;
                    let _e96 = textureSampleLevel(ssaoRaw, ssao_depth_sampler, uv_2, 0f);
                    total = (_e92 + (_e96.x * w));
                    let _e101 = weight;
                    weight = (_e101 + w);
                }
                continuing {
                    let _e104 = x;
                    x = (_e104 + 1i);
                }
            }
        }
        continuing {
            let _e107 = y;
            y = (_e107 + 1i);
        }
    }
    let _e109 = total;
    let _e110 = weight;
    return (_e109 / max(_e110, 0.00001f));
}
