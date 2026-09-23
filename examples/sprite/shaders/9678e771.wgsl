struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct SsaoUniform {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    inverseProjection: mat4x4<f32>,
    intensityPad: vec4<f32>,
    algorithmPad: vec4<f32>,
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

fn gtaoSliceIntegral(n: f32, hNegative: f32, hPositive: f32) -> f32 {
    return (0.25f * ((((2f * cos(n)) + ((2f * (hNegative + hPositive)) * sin(n))) - cos(((2f * hNegative) - n))) - cos(((2f * hPositive) - n))));
}

fn aoViewPosition(uv_1: vec2<f32>, depth: f32) -> vec3<f32> {
    let _e2 = ssao_uniform.inverseProjection;
    let p = (_e2 * vec4<f32>(((uv_1 * vec2<f32>(2f, -2f)) + vec2<f32>(-1f, 1f)), depth, 1f));
    return (p.xyz / vec3(p.w));
}

fn gtaoVisibility(uv_2: vec2<f32>) -> f32 {
    var occlusion_1: f32 = 0f;
    var slice: u32 = 0u;
    var horizons: vec2<f32>;
    var step_: u32;
    var side: u32;
    var local_2: bool;
    var local_3: bool;
    var local_4: bool;

    let _e3 = textureDimensions(hdr_depth);
    let dimensions = vec2<i32>(_e3);
    let pixel_2 = clamp(vec2<i32>((uv_2 * vec2<f32>(dimensions))), vec2(0i), (dimensions - vec2(1i)));
    let centerUv = ((vec2<f32>(pixel_2) + vec2(0.5f)) / vec2<f32>(dimensions));
    let depth_2 = textureLoad(hdr_depth, pixel_2, 0i);
    if (depth_2 >= 0.999999f) {
        return 1f;
    }
    let _e27 = aoViewPosition(centerUv, depth_2);
    let _e30 = ssao_uniform.view;
    let _e31 = ssaoNormal(centerUv);
    let normal_1 = normalize((_e30 * vec4<f32>(_e31, 0f)).xyz);
    let _e41 = ssao_uniform.projection[3][3];
    let perspective = (abs(_e41) < 0.5f);
    let viewDir = select(vec3<f32>(0f, 0f, 1f), normalize(-(_e27)), perspective);
    let radius = ssao_uniform.intensityPad.y;
    let bias = ssao_uniform.intensityPad.z;
    let _e63 = ssao_uniform.intensityPad.w;
    let budget = u32(_e63);
    let slices = select(select(2u, 4u, (budget >= 32u)), 8u, (budget >= 64u));
    let noise = fract((52.982918f * fract(dot(vec2<f32>(pixel_2), vec2<f32>(0.06711056f, 0.00583715f)))));
    let basisX = normalize(cross(vec3<f32>(0f, 1f, 0f), viewDir));
    let basisY = cross(viewDir, basisX);
    loop {
        let _e91 = slice;
        if (_e91 < slices) {
        } else {
            break;
        }
        {
            let _e93 = slice;
            let angle = (((f32(_e93) + noise) * 3.1415927f) / f32(slices));
            let tangent = ((basisX * cos(angle)) + (basisY * sin(angle)));
            let axis = cross(tangent, viewDir);
            let direction = normalize((tangent - (viewDir * (tangent.z / max(viewDir.z, 0.00001f)))));
            let projected = (normal_1 - (axis * dot(normal_1, axis)));
            let projectedLength = length(projected);
            if (projectedLength < 0.00001f) {
                continue;
            }
            let n_1 = atan2(dot(projected, tangent), dot(projected, viewDir));
            let low = vec2<f32>(cos((n_1 + 1.5707964f)), cos((n_1 - 1.5707964f)));
            horizons = low;
            step_ = 0u;
            loop {
                let _e133 = step_;
                if (_e133 < 4u) {
                } else {
                    break;
                }
                {
                    let _e136 = step_;
                    let t = (((f32(_e136) + 0.5f) + (0.5f * noise)) / 4f);
                    side = 0u;
                    loop {
                        let _e147 = side;
                        if (_e147 < 2u) {
                        } else {
                            break;
                        }
                        {
                            let _e150 = side;
                            let sign_ = select(1f, -1f, (_e150 == 1u));
                            let probe = (_e27 + ((((sign_ * direction) * radius) * t) * t));
                            let _e163 = ssao_uniform.projection;
                            let clip = (_e163 * vec4<f32>(probe, 1f));
                            if (clip.w <= 0f) {
                                continue;
                            }
                            let sampleUv = (((clip.xy / vec2(clip.w)) * vec2<f32>(0.5f, -0.5f)) + vec2(0.5f));
                            if !(any((sampleUv < vec2(0f)))) {
                                local_2 = any((sampleUv >= vec2(1f)));
                            } else {
                                local_2 = true;
                            }
                            let _e193 = local_2;
                            if _e193 {
                                continue;
                            }
                            let samplePixel = vec2<i32>((sampleUv * vec2<f32>(dimensions)));
                            if all((samplePixel == pixel_2)) {
                                continue;
                            }
                            let sampleDepth = textureLoad(hdr_depth, samplePixel, 0i);
                            if (sampleDepth >= 0.999999f) {
                                continue;
                            }
                            let snappedUv = ((vec2<f32>(samplePixel) + vec2(0.5f)) / vec2<f32>(dimensions));
                            let _e210 = aoViewPosition(snappedUv, sampleDepth);
                            let delta = (_e210 - _e27);
                            let distance_ = length(delta);
                            if !((distance_ <= 0.00001f)) {
                                local_3 = (dot(delta, normal_1) <= bias);
                            } else {
                                local_3 = true;
                            }
                            let _e221 = local_3;
                            if !(_e221) {
                                local_4 = (distance_ >= radius);
                            } else {
                                local_4 = true;
                            }
                            let _e227 = local_4;
                            if _e227 {
                                continue;
                            }
                            let falloff = clamp((2f - ((2f * distance_) / radius)), 0f, 1f);
                            let cosine = dot((delta / vec3(distance_)), viewDir);
                            let _e239 = side;
                            let _e241 = side;
                            let _e243 = horizons[_e241];
                            let _e244 = side;
                            horizons[_e239] = max(_e243, mix(low[_e244], cosine, falloff));
                        }
                        continuing {
                            let _e249 = side;
                            side = (_e249 + 1u);
                        }
                    }
                }
                continuing {
                    let _e252 = step_;
                    step_ = (_e252 + 1u);
                }
            }
            let _e255 = horizons.y;
            let hNegative_1 = (n_1 + clamp((-(acos(clamp(_e255, -1f, 1f))) - n_1), -1.5707964f, 1.5707964f));
            let _e267 = horizons.x;
            let hPositive_1 = (n_1 + clamp((acos(clamp(_e267, -1f, 1f)) - n_1), -1.5707964f, 1.5707964f));
            let _e281 = gtaoSliceIntegral(n_1, (n_1 - 1.5707964f), (n_1 + 1.5707964f));
            let _e283 = occlusion_1;
            let _e284 = gtaoSliceIntegral(n_1, hNegative_1, hPositive_1);
            occlusion_1 = (_e283 + (projectedLength * max(0f, (_e281 - _e284))));
        }
        continuing {
            let _e291 = slice;
            slice = (_e291 + 1u);
        }
    }
    let _e293 = occlusion_1;
    return clamp((1f - (_e293 / f32(slices))), 0f, 1f);
}

fn ssaoViewZ(uv_3: vec2<f32>, depth_1: f32) -> f32 {
    let _e2 = ssao_uniform.inverseProjection;
    let p_1 = (_e2 * vec4<f32>(((uv_3 * vec2<f32>(2f, -2f)) + vec2<f32>(-1f, 1f)), depth_1, 1f));
    return (p_1.z / p_1.w);
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

    let _e5 = ssao_uniform.algorithmPad.x;
    if (_e5 > 0.5f) {
        let _e10 = gtaoVisibility(in.uv);
        return _e10;
    }
    let depth_3 = textureSampleLevel(hdr_depth, ssao_depth_sampler, in.uv, 0i);
    if (depth_3 >= 0.999999f) {
        return 1f;
    }
    let ndc = vec4<f32>(((in.uv * vec2<f32>(2f, -2f)) + vec2<f32>(-1f, 1f)), depth_3, 1f);
    let _e32 = ssao_uniform.inverseProjection;
    viewPosH = (_e32 * ndc);
    let _e35 = viewPosH;
    let _e37 = viewPosH.w;
    viewPosH = (_e35 / vec4(_e37));
    let _e40 = viewPosH;
    let viewPos = _e40.xyz;
    let _e43 = ssaoNormal(in.uv);
    let _e46 = ssao_uniform.view;
    let viewNormal = normalize((_e46 * vec4<f32>(_e43, 0f)).xyz);
    let _e54 = textureDimensions(gbuffer_normal, 0i);
    let screenDim = vec2<f32>(_e54);
    let noiseUV = ((in.uv * screenDim) / vec2(8f));
    let _e64 = textureSampleLevel(ssao_noise_texture, ssao_noise_sampler, noiseUV, 0f);
    let randomVec = normalize(_e64.xyz);
    let tangent_1 = normalize((randomVec - (viewNormal * dot(randomVec, viewNormal))));
    let bitangent = cross(viewNormal, tangent_1);
    let TBN = mat3x3<f32>(tangent_1, bitangent, viewNormal);
    let radius_1 = ssao_uniform.intensityPad.y;
    let bias_1 = ssao_uniform.intensityPad.z;
    let _e84 = ssao_uniform.intensityPad.w;
    let sampleCount = u32(clamp(_e84, 16f, 64f));
    loop {
        let _e90 = i;
        if (_e90 < sampleCount) {
        } else {
            break;
        }
        {
            let _e92 = i;
            let _e98 = ssao_kernel[((_e92 * 64u) / sampleCount)];
            let sampleTangent = _e98.xyz;
            sampleView = (TBN * sampleTangent);
            let _e102 = sampleView;
            sampleView = (viewPos + (_e102 * radius_1));
            let _e107 = ssao_uniform.projection;
            let _e108 = sampleView;
            offset = (_e107 * vec4<f32>(_e108, 1f));
            let _e114 = offset.w;
            if (_e114 <= 0f) {
                continue;
            }
            let _e117 = offset;
            let _e119 = offset.w;
            offset = (_e117 / vec4(_e119));
            let _e122 = offset;
            let sampleUv_1 = ((_e122.xy * vec2<f32>(0.5f, -0.5f)) + vec2(0.5f));
            if !(any((sampleUv_1 < vec2(0f)))) {
                local = any((sampleUv_1 > vec2(1f)));
            } else {
                local = true;
            }
            let _e143 = local;
            if _e143 {
                continue;
            }
            let sampleDepth_1 = textureSampleLevel(hdr_depth, ssao_depth_sampler, sampleUv_1, 0i);
            let _e150 = ssao_uniform.inverseProjection;
            let _e151 = offset;
            sampledViewPosH = (_e150 * vec4<f32>(_e151.xy, sampleDepth_1, 1f));
            let _e157 = sampledViewPosH;
            let _e159 = sampledViewPosH.w;
            sampledViewPosH = (_e157 / vec4(_e159));
            let sampledViewZ = sampledViewPosH.z;
            let rangeCheck = smoothstep(0f, 1f, (radius_1 / max(abs((viewPos.z - sampledViewZ)), 0.0001f)));
            let _e174 = sampleView.z;
            let sampleContrib = select(0f, 1f, (sampledViewZ >= (_e174 + bias_1)));
            let _e181 = occlusion;
            occlusion = (_e181 + (sampleContrib * rangeCheck));
        }
        continuing {
            let _e184 = i;
            i = (_e184 + 1u);
        }
    }
    let _e187 = occlusion;
    occlusion = (1f - (_e187 / f32(sampleCount)));
    let _e192 = occlusion;
    return _e192;
}

@fragment 
fn fs_ssao_blur(in_1: SsaoVsOut) -> @location(0) f32 {
    var total: f32 = 0f;
    var weight: f32 = 0f;
    var y: i32 = -2i;
    var x: i32;
    var local_1: bool;

    let depth_4 = textureSampleLevel(hdr_depth, ssao_depth_sampler, in_1.uv, 0i);
    if (depth_4 >= 0.999999f) {
        return 1f;
    }
    let _e12 = ssaoViewZ(in_1.uv, depth_4);
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
                    let uv_4 = (in_1.uv + (vec2<f32>(f32(_e31), f32(_e33)) * texel));
                    if !(any((uv_4 < vec2(0f)))) {
                        local_1 = any((uv_4 > vec2(1f)));
                    } else {
                        local_1 = true;
                    }
                    let _e50 = local_1;
                    if _e50 {
                        continue;
                    }
                    let d = textureSampleLevel(hdr_depth, ssao_depth_sampler, uv_4, 0i);
                    if (d >= 0.999999f) {
                        continue;
                    }
                    let _e57 = ssaoNormal(uv_4);
                    let _e58 = ssaoViewZ(uv_4, d);
                    let dz = abs((_e58 - _e12));
                    let _e61 = x;
                    let _e62 = x;
                    let _e64 = y;
                    let _e65 = y;
                    let _e77 = ssao_uniform.intensityPad.y;
                    let w = ((exp((-(f32(((_e61 * _e62) + (_e64 * _e65)))) / 4f)) * exp((-(dz) / max(0.01f, (_e77 * 0.1f))))) * pow(max(dot(_e57, _e14), 0f), 8f));
                    let _e92 = total;
                    let _e96 = textureSampleLevel(ssaoRaw, ssao_depth_sampler, uv_4, 0f);
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
