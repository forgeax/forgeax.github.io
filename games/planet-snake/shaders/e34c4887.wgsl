struct FullscreenOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct SpaceParams {
    right: vec4<f32>,
    up: vec4<f32>,
    forward: vec4<f32>,
    sun: vec4<f32>,
    cam: vec4<f32>,
    shell: vec4<f32>,
    sheet: vec4<f32>,
    sheetFade: vec4<f32>,
    eclipseAnchor: vec4<f32>,
    dents: array<vec4<f32>, 8>,
    wake: array<vec4<f32>, 16>,
}

const H_R: f32 = 0.35f;
const H_M: f32 = 0.0525f;
const BETA_R: vec3<f32> = vec3<f32>(0.575f, 0.7036f, 0.7566f);
const BETA_M: f32 = 0.48f;
const MS_ISO: f32 = 0.035f;
const EXTINCTION: f32 = 0.38f;
const MIE_G: f32 = 0.76f;
const VIEW_STEPS: i32 = 16i;
const LIGHT_STEPS: i32 = 8i;

@group(1) @binding(2) 
var<uniform> params: SpaceParams;
@group(1) @binding(0) 
var sceneTexture: texture_2d<f32>;
@group(1) @binding(1) 
var sceneSampler: sampler;
@group(1) @binding(3) 
var depthTexture: texture_depth_2d;
@group(1) @binding(4) 
var depthSampler: sampler;

fn waterDent(n: vec3<f32>) -> vec2<f32> {
    var disp: f32 = 0f;
    var down: f32 = 0f;
    var i_1: i32 = 0i;
    var local_2: bool;

    let _e5 = params.sheetFade.x;
    let _e9 = params.sheetFade.y;
    let _e13 = params.sheet;
    let inPatch = smoothstep(_e5, _e9, dot(n, _e13.xyz));
    if (inPatch <= 0.002f) {
        return vec2<f32>(0f, 0f);
    }
    loop {
        let _e23 = i_1;
        if (_e23 < 4i) {
        } else {
            break;
        }
        {
            let _e28 = i_1;
            let a_1 = params.dents[(_e28 * 2i)];
            let _e35 = i_1;
            let b = params.dents[((_e35 * 2i) + 1i)];
            if !((b.z <= 0.002f)) {
                local_2 = (a_1.w <= 0.001f);
            } else {
                local_2 = true;
            }
            let _e52 = local_2;
            if _e52 {
                continue;
            }
            let _e62 = params.cam.w;
            let q_2 = ((acos(clamp(dot(n, a_1.xyz), -1f, 1f)) * _e62) / a_1.w);
            if (q_2 > 2.6f) {
                continue;
            }
            let hole = select(0f, ((1f - ((q_2 * q_2) * q_2)) * b.x), (q_2 < 1f));
            let rq = ((q_2 - 1.25f) / 0.5f);
            let rim = (exp((-(rq) * rq)) * b.y);
            let _e88 = disp;
            disp = (_e88 + ((rim - hole) * b.z));
            let _e94 = down;
            down = (_e94 + (hole * b.z));
        }
        continuing {
            let _e98 = i_1;
            i_1 = (_e98 + 1i);
        }
    }
    let _e101 = disp;
    let _e102 = down;
    return (vec2<f32>(_e101, _e102) * inPatch);
}

fn raySphere2_(o: vec3<f32>, d: vec3<f32>, r: f32) -> vec2<f32> {
    let b_1 = dot(o, d);
    let c = (dot(o, o) - (r * r));
    let disc = ((b_1 * b_1) - c);
    if (disc < 0f) {
        return vec2<f32>(1f, -1f);
    }
    let s_1 = sqrt(disc);
    return vec2<f32>((-(b_1) - s_1), (-(b_1) + s_1));
}

fn phaseRayleigh(mu: f32) -> f32 {
    let backlit = mix(0.08f, 1f, smoothstep(-0.2f, 0.35f, mu));
    return ((0.059683103f * (1f + (mu * mu))) * backlit);
}

fn phaseMie(mu_1: f32, g: f32) -> f32 {
    let g2_ = (g * g);
    let n_5 = ((1f - g2_) * (1f + (mu_1 * mu_1)));
    let dd = ((2f + g2_) * pow(max(((1f + g2_) - ((2f * g) * mu_1)), 0.0001f), 1.5f));
    return ((0.119366206f * n_5) / dd);
}

fn atmosphere(o_1: vec3<f32>, d_1: vec3<f32>, tStart: f32, tEnd: f32, sunDir: vec3<f32>, sunI: f32, rp: f32, ra: f32, msScale: f32) -> vec4<f32> {
    var odR: f32 = 0f;
    var odM: f32 = 0f;
    var acc: vec3<f32> = vec3(0f);
    var ms: vec3<f32> = vec3(0f);
    var i_2: i32 = 0i;
    var local_3: bool;
    var lR: f32;
    var lM: f32;
    var j: i32;

    if (tEnd <= tStart) {
        return vec4<f32>(0f, 0f, 0f, 1f);
    }
    let mu_2 = dot(d_1, sunDir);
    let _e14 = phaseRayleigh(mu_2);
    let _e16 = phaseMie(mu_2, MIE_G);
    let seg = ((tEnd - tStart) / 16f);
    loop {
        let _e21 = i_2;
        if (_e21 < VIEW_STEPS) {
        } else {
            break;
        }
        {
            let _e24 = i_2;
            let t_7 = (tStart + (seg * (f32(_e24) + 0.5f)));
            let p_6 = (o_1 + (d_1 * t_7));
            let h = max((length(p_6) - rp), 0f);
            let dR = (exp((-(h) / H_R)) * seg);
            let dM = (exp((-(h) / H_M)) * seg);
            let _e49 = odR;
            odR = (_e49 + dR);
            let _e52 = odM;
            odM = (_e52 + dM);
            let _e55 = raySphere2_(p_6, sunDir, ra);
            let _e56 = raySphere2_(p_6, sunDir, rp);
            if (_e56.y > 0f) {
                local_3 = (_e56.x > 0f);
            } else {
                local_3 = false;
            }
            let _e66 = local_3;
            if _e66 {
                continue;
            }
            let lseg = (max(_e55.y, 0f) / 8f);
            lR = 0f;
            lM = 0f;
            j = 0i;
            loop {
                let _e78 = j;
                if (_e78 < LIGHT_STEPS) {
                } else {
                    break;
                }
                {
                    let _e81 = j;
                    let lp = (p_6 + (sunDir * (lseg * (f32(_e81) + 0.5f))));
                    let lh = max((length(lp) - rp), 0f);
                    let _e92 = lR;
                    lR = (_e92 + (exp((-(lh) / H_R)) * lseg));
                    let _e99 = lM;
                    lM = (_e99 + (exp((-(lh) / H_M)) * lseg));
                }
                continuing {
                    let _e106 = j;
                    j = (_e106 + 1i);
                }
            }
            let _e110 = odR;
            let _e111 = lR;
            let _e118 = odM;
            let _e119 = lM;
            let tau = ((BETA_R * (_e110 + _e111)) + (vec3<f32>(0.528f, 0.528f, 0.528f) * (_e118 + _e119)));
            let att = exp(-(tau));
            let _e126 = acc;
            acc = (_e126 + (att * (((BETA_R * dR) * _e14) + ((vec3(0.48f) * dM) * _e16))));
            let _e138 = ms;
            ms = (_e138 + ((att * ((BETA_R * dR) + (vec3(0.48f) * dM))) * (MS_ISO * msScale)));
        }
        continuing {
            let _e151 = i_2;
            i_2 = (_e151 + 1i);
        }
    }
    let _e154 = acc;
    acc = clamp(_e154, vec3(0f), vec3(24f));
    let _e160 = ms;
    ms = clamp(_e160, vec3(0f), vec3(24f));
    let _e167 = odR;
    let _e171 = odM;
    let trans = exp(-(((BETA_R * _e167) + (vec3(0.48f) * _e171))));
    let softened = mix(vec3(1f), trans, EXTINCTION);
    let _e181 = acc;
    let _e182 = ms;
    return vec4<f32>(((_e181 + _e182) * sunI), dot(softened, vec3(0.3333f)));
}

fn ps_hash(g_1: vec3<f32>) -> f32 {
    return fract((sin(dot(g_1, vec3<f32>(12.9898f, 78.233f, 37.719f))) * 43758.547f));
}

fn ps_vnoise(x_1: vec3<f32>) -> f32 {
    let _e2 = ps_hash(floor(x_1));
    return _e2;
}

fn ps_fbm(x_2: vec3<f32>) -> f32 {
    let _e1 = ps_vnoise(x_2);
    return _e1;
}

fn ps_landField(p: vec3<f32>) -> f32 {
    return -1f;
}

fn wakeField(n_1: vec3<f32>, t: f32, spreadScale: f32, rp_1: f32, wave: f32) -> vec3<f32> {
    var acc_1: f32 = 0f;
    var accAge: f32 = 0f;
    var best: f32 = 9f;
    var i_3: i32 = 0i;
    var local_4: bool;
    var cov: f32;

    loop {
        let _e4 = i_3;
        if (_e4 < 15i) {
        } else {
            break;
        }
        {
            let _e9 = i_3;
            let a_2 = params.wake[_e9];
            let _e14 = i_3;
            let b_2 = params.wake[(_e14 + 1i)];
            if !((a_2.w > 1.5f)) {
                local_4 = (b_2.w > 1.5f);
            } else {
                local_4 = true;
            }
            let _e29 = local_4;
            if _e29 {
                continue;
            }
            let ad = normalize(a_2.xyz);
            let bd = normalize(b_2.xyz);
            let ab = (bd - ad);
            let den = max(dot(ab, ab), 0.00000001f);
            let u = clamp((dot((n_1 - ad), ab) / den), 0f, 1f);
            let q_3 = normalize((ad + (ab * u)));
            let d_2 = length((n_1 - q_3));
            let w = exp((-(d_2) * 40f));
            let _e55 = best;
            best = min(_e55, d_2);
            let _e58 = acc_1;
            acc_1 = (_e58 + w);
            let _e61 = accAge;
            accAge = (_e61 + (w * mix(a_2.w, b_2.w, u)));
        }
        continuing {
            let _e67 = i_3;
            i_3 = (_e67 + 1i);
        }
    }
    let _e70 = acc_1;
    if (_e70 < 0.00000000004f) {
        return vec3<f32>(0f, 1f, 9f);
    }
    let _e77 = accAge;
    let _e78 = acc_1;
    let bestAge = clamp((_e77 / _e78), 0f, 1f);
    let _e100 = ps_fbm(((n_1 * 26f) + vec3<f32>(0f, (t * 0.09f), 0f)));
    let scallop = (1f + (wave * ((0.08f * sin(((bestAge * 31f) + (t * 1.4f)))) + ((0.07f * (_e100 - 0.5f)) * 2f))));
    let spread = ((((0.62f + (0.22f * bestAge)) / rp_1) * spreadScale) * scallop);
    let _e123 = best;
    cov = (1f - smoothstep((spread * 0.15f), spread, _e123));
    let _e137 = ps_fbm(((n_1 * 9f) + vec3<f32>((t * 0.11f), (t * 0.05f), 0f)));
    let _e147 = ps_fbm(((n_1 * 16f) - vec3<f32>(0f, (t * 0.14f), (t * 0.08f))));
    let _e148 = cov;
    cov = (_e148 * clamp((0.45f + ((1.35f * _e137) * (0.5f + (0.7f * _e147)))), 0f, 1.3f));
    let _e162 = cov;
    cov = (_e162 * smoothstep(1f, 0.45f, bestAge));
    let _e167 = cov;
    let _e171 = best;
    return vec3<f32>(clamp(_e167, 0f, 1f), bestAge, (_e171 / max(spread, 0.00001f)));
}

fn landWakeField(wp: vec3<f32>, rp_2: f32) -> vec3<f32> {
    var acc_2: f32 = 0f;
    var accAge_1: f32 = 0f;
    var best_1: f32 = 9000000000f;
    var bestRadius: f32 = 0f;
    var i_4: i32 = 0i;
    var local_5: bool;

    let blendScale = (40f / rp_2);
    loop {
        let _e7 = i_4;
        if (_e7 < 15i) {
        } else {
            break;
        }
        {
            let _e12 = i_4;
            let a_3 = params.wake[_e12];
            let _e17 = i_4;
            let b_3 = params.wake[(_e17 + 1i)];
            if !((a_3.w > 1.5f)) {
                local_5 = (b_3.w > 1.5f);
            } else {
                local_5 = true;
            }
            let _e32 = local_5;
            if _e32 {
                continue;
            }
            let ab_1 = (b_3.xyz - a_3.xyz);
            let den_1 = max(dot(ab_1, ab_1), 0.00000001f);
            let u_1 = clamp((dot((wp - a_3.xyz), ab_1) / den_1), 0f, 1f);
            let q_4 = (a_3.xyz + (ab_1 * u_1));
            let d_3 = length((wp - q_4));
            let w_1 = exp((-(d_3) * blendScale));
            let _e56 = best_1;
            if (d_3 < _e56) {
                best_1 = d_3;
                bestRadius = length(q_4);
            }
            let _e61 = acc_2;
            acc_2 = (_e61 + w_1);
            let _e64 = accAge_1;
            accAge_1 = (_e64 + (w_1 * mix(a_3.w, b_3.w, u_1)));
        }
        continuing {
            let _e70 = i_4;
            i_4 = (_e70 + 1i);
        }
    }
    let _e73 = acc_2;
    if (_e73 < 0.00000000004f) {
        return vec3<f32>(9f, 1f, 9f);
    }
    let _e80 = accAge_1;
    let _e81 = acc_2;
    let bestAge_1 = clamp((_e80 / _e81), 0f, 1f);
    let spread_1 = (0.42f + (0.08f * bestAge_1));
    let _e91 = bestRadius;
    let radialGap = abs((length(wp) - _e91));
    let _e94 = best_1;
    return vec3<f32>(radialGap, bestAge_1, (_e94 / max(spread_1, 0.00001f)));
}

fn landTrail(wp_1: vec3<f32>, t_1: f32, rp_3: f32) -> f32 {
    var local_6: bool;

    let r_1 = length(wp_1);
    if !((r_1 < (rp_3 - 0.2f))) {
        local_6 = (r_1 > (rp_3 + 3.2f));
    } else {
        local_6 = true;
    }
    let _e13 = local_6;
    if _e13 {
        return 0f;
    }
    let n_6 = (wp_1 / vec3(max(r_1, 0.0001f)));
    let _e19 = ps_landField(n_6);
    let dry = smoothstep(-0.004f, 0.03f, _e19);
    if (dry <= 0.002f) {
        return 0f;
    }
    let _e26 = landWakeField(wp_1, rp_3);
    if (_e26.x > mix(0.24f, 0.32f, _e26.y)) {
        return 0f;
    }
    if (_e26.z > 1.15f) {
        return 0f;
    }
    let groove = (1f - smoothstep(0f, 0.62f, _e26.z));
    let berm = (smoothstep(0.42f, 0.74f, _e26.z) * (1f - smoothstep(0.86f, 1.12f, _e26.z)));
    let comb = (0.5f + (0.5f * sin((_e26.y * 620f))));
    let combFade = smoothstep(0.1f, 0.45f, _e26.y);
    let age = smoothstep(1f, 0.25f, _e26.y);
    return ((((groove * (0.34f + ((0.08f * comb) * combFade))) - (berm * (0.1f + ((0.06f * comb) * combFade)))) * dry) * age);
}

fn psWaveH(n_2: vec3<f32>, t_2: f32) -> f32 {
    let d1_ = vec3<f32>(0.31f, 0.12f, -0.94f);
    let d2_ = vec3<f32>(-0.77f, 0.35f, 0.53f);
    let d3_ = vec3<f32>(0.62f, -0.2f, 0.75f);
    let a_4 = sin(((dot(n_2, d1_) * 130f) - (t_2 * 1.9f)));
    let b_4 = sin(((dot(n_2, d2_) * 95f) - (t_2 * 1.45f)));
    let c_1 = sin(((dot(n_2, d3_) * 62f) - (t_2 * 1.05f)));
    let _e41 = ps_fbm(((n_2 * 22f) + (d1_ * (t_2 * 0.22f))));
    let detail = ((_e41 - 0.5f) * 2f);
    return ((((a_4 * 0.34f) + (b_4 * 0.3f)) + (c_1 * 0.22f)) + (detail * 0.22f));
}

fn psWaveNormal(n_3: vec3<f32>, t_3: f32) -> vec3<f32> {
    let ax = select(vec3<f32>(1f, 0f, 0f), vec3<f32>(0f, 1f, 0f), (abs(n_3.x) > 0.9f));
    let t1_1 = normalize(cross(n_3, ax));
    let t2_ = cross(n_3, t1_1);
    let _e22 = psWaveH(normalize((n_3 + (t1_1 * 0.0009f))), t_3);
    let _e26 = psWaveH(normalize((n_3 - (t1_1 * 0.0009f))), t_3);
    let hu = (_e22 - _e26);
    let _e31 = psWaveH(normalize((n_3 + (t2_ * 0.0009f))), t_3);
    let _e35 = psWaveH(normalize((n_3 - (t2_ * 0.0009f))), t_3);
    let hv = (_e31 - _e35);
    let g_2 = (((t1_1 * hu) + (t2_ * hv)) / vec3((2f * 0.0009f)));
    return normalize((n_3 - (g_2 * 0.0021f)));
}

fn glintOctave3_(p_1: vec3<f32>, cell: f32, env: f32, t_4: f32) -> f32 {
    let id = floor((p_1 / vec3(cell)));
    let _e5 = ps_hash(id);
    let _e11 = ps_hash((id + vec3<f32>(19f, 7f, 3f)));
    let _e17 = ps_hash((id + vec3<f32>(41f, 13f, 29f)));
    let r_2 = vec3<f32>(_e5, _e11, _e17);
    let _e24 = ps_hash((id + vec3<f32>(5f, 37f, 11f)));
    let _e30 = ps_hash((id + vec3<f32>(23f, 3f, 17f)));
    let _e36 = ps_hash((id + vec3<f32>(53f, 47f, 7f)));
    let r2_ = vec3<f32>(_e24, _e30, _e36);
    if (r2_.x > 0.55f) {
        return 0f;
    }
    let centre = (((id + vec3(0.5f)) + ((r_2 - vec3(0.5f)) * 0.72f)) * cell);
    let d_4 = (length((p_1 - centre)) / (cell * 0.19f));
    let disc_1 = clamp((1f - (d_4 * d_4)), 0f, 1f);
    if (disc_1 <= 0f) {
        return 0f;
    }
    let blink = smoothstep(0.35f, 0.85f, (0.5f + (0.5f * sin(((t_4 * (1.1f + (r2_.z * 3.1f))) + (r_2.z * 6.2831855f))))));
    let bright = (0.35f + ((0.65f * r2_.y) * r2_.y));
    return (((disc_1 * blink) * bright) * env);
}

fn waterGlints(wp_2: vec3<f32>, n_4: vec3<f32>, dir: vec3<f32>, sun: vec3<f32>, t_5: f32, dist: f32, foam: f32) -> f32 {
    var env_1: f32;
    var sum: f32 = 0f;
    var local_7: bool;
    var local_8: bool;

    let V = -(dir);
    let NdotV = clamp(dot(n_4, V), 0f, 1f);
    let NdotL = clamp(dot(n_4, sun), 0f, 1f);
    if (NdotL <= 0.02f) {
        return 0f;
    }
    let H = normalize((V + sun));
    env_1 = pow(clamp(dot(n_4, H), 0f, 1f), 28f);
    let _e25 = env_1;
    env_1 = max(_e25, (clamp(foam, 0f, 1f) * 0.6f));
    let graze = (0.35f + (0.65f * pow((1f - NdotV), 1.5f)));
    let _e41 = env_1;
    let gate = ((_e41 * graze) * smoothstep(0.02f, 0.3f, NdotL));
    if (gate <= 0.002f) {
        return 0f;
    }
    let p_7 = (wp_2 + (vec3<f32>(0.31f, 0.12f, -0.94f) * (t_5 * 0.14f)));
    let fpx = ((dist * 0.0006f) / max(NdotV, 0.06f));
    let farA = smoothstep((0.2f * 0.55f), (0.2f * 2.2f), fpx);
    let nearA = smoothstep(26f, 55f, (0.2f / max(fpx, 0.00001f)));
    if (farA < 1f) {
        local_7 = (nearA < 1f);
    } else {
        local_7 = false;
    }
    let _e85 = local_7;
    if _e85 {
        let _e87 = sum;
        let _e89 = glintOctave3_(p_7, 0.2f, 1f, t_5);
        sum = (_e87 + ((_e89 * (1f - farA)) * (1f - nearA)));
    }
    let farB = smoothstep((0.52f * 0.55f), (0.52f * 2.2f), fpx);
    let nearB = smoothstep(26f, 55f, (0.52f / max(fpx, 0.00001f)));
    if (farB < 1f) {
        local_8 = (nearB < 1f);
    } else {
        local_8 = false;
    }
    let _e116 = local_8;
    if _e116 {
        let _e117 = sum;
        let _e124 = glintOctave3_((p_7 + vec3<f32>(53.1f, 17.9f, 91.3f)), 0.52f, 1f, t_5);
        sum = (_e117 + (((_e124 * (1f - farB)) * (1f - nearB)) * 1.2f));
    }
    let _e134 = sum;
    return (_e134 * gate);
}

fn oceanShimmer(wp_3: vec3<f32>, dir_1: vec3<f32>, sun_1: vec3<f32>, t_6: f32, rp_4: f32, dist_1: f32) -> vec3<f32> {
    var local_9: bool;
    var spec: f32;

    let r_3 = length(wp_3);
    let _e3 = waterDent(normalize(wp_3));
    let dPaint = abs((((r_3 - rp_4) - 0.05f) + _e3.y));
    let _e17 = params.shell.w;
    let dSheet = abs(((((r_3 - rp_4) - 0.05f) - _e17) - _e3.x));
    let band = (1f - smoothstep(0.06f, 0.3f, min(dPaint, dSheet)));
    if (band <= 0.002f) {
        return vec3(0f);
    }
    let n_7 = (wp_3 / vec3(max(r_3, 0.0001f)));
    let _e36 = ps_landField(n_7);
    let wet = (1f - smoothstep(-0.03f, -0.004f, _e36));
    let _e47 = ps_fbm((n_7 * 14f));
    let heave = (0.001f * sin(((t_6 * 0.9f) + (_e47 * 6.2831855f))));
    let surfBand = (1f - smoothstep(0.0002f, 0.0034f, abs(((_e36 + 0.0014f) + heave))));
    let _e73 = ps_fbm(((n_7 * 55f) + vec3<f32>((t_6 * 0.1f), 0f, (-(t_6) * 0.07f))));
    let surf = ((surfBand * smoothstep(0.45f, 0.8f, _e73)) * band);
    if (wet <= 0.002f) {
        local_9 = (surf <= 0.002f);
    } else {
        local_9 = false;
    }
    let _e86 = local_9;
    if _e86 {
        return vec3(0f);
    }
    let d1_1 = vec3<f32>(0.31f, 0.12f, -0.94f);
    let d2_1 = vec3<f32>(-0.77f, 0.35f, 0.53f);
    let _e103 = ps_fbm(((n_7 * 11f) + (d1_1 * (t_6 * 0.16f))));
    let _e110 = ps_fbm(((n_7 * 19f) + (d2_1 * (t_6 * 0.11f))));
    let churn = ((_e103 * 0.62f) + (_e110 * 0.38f));
    let _e116 = psWaveNormal(n_7, t_6);
    let h_1 = normalize((sun_1 - dir_1));
    let ndh = clamp(dot(_e116, h_1), 0f, 1f);
    let ndl = clamp(dot(_e116, sun_1), 0f, 1f);
    let rough = clamp((0.105f + (dist_1 * 0.0018f)), 0.105f, 0.3f);
    let a2_ = (((rough * rough) * rough) * rough);
    let dd_1 = (((ndh * ndh) * (a2_ - 1f)) + 1f);
    let ggx = (a2_ / ((3.1415927f * dd_1) * dd_1));
    let fres = (0.02f + (0.98f * pow((1f - clamp(dot(_e116, -(dir_1)), 0f, 1f)), 5f)));
    spec = (((ggx * fres) * ndl) * 0.045f);
    let _e168 = spec;
    let _e169 = spec;
    let crest = ((_e168 / (1f + _e169)) * 0.5f);
    let refl = reflect(dir_1, _e116);
    let skyT = clamp((dot(refl, n_7) * 1.4f), 0f, 1f);
    let skyCol = mix(vec3<f32>(0.6f, 0.72f, 0.85f), vec3<f32>(0.26f, 0.42f, 0.68f), skyT);
    let skyRefl = ((skyCol * fres) * 0.34f);
    let _e200 = ps_fbm(((n_7 * 5f) + (d2_1 * (t_6 * 0.055f))));
    let swell = (((_e200 - 0.5f) * 1.4f) + 0.5f);
    let k = (band * wet);
    let _e210 = wakeField(n_7, t_6, 1f, rp_4, 1f);
    let foam_1 = (_e210.x * k);
    let _e221 = ps_fbm(((n_7 * 46f) + vec3<f32>(0f, (t_6 * 0.03f), 0f)));
    let _e233 = ps_fbm(((n_7 * 17f) + vec3<f32>((t_6 * 0.02f), 0f, 0f)));
    let comb_1 = ((((((smoothstep(0.4f, 0.62f, _e221) * smoothstep(0.35f, 0.7f, _e233)) * (1f - smoothstep(0.05f, 0.4f, _e210.x))) * smoothstep(0.1f, 0.55f, _e210.y)) * (1f - smoothstep(0.85f, 1f, _e210.y))) * (1f - smoothstep(1.2f, 1.6f, _e210.z))) * k);
    let _e266 = waterGlints(wp_3, n_7, dir_1, sun_1, t_6, dist_1, _e210.x);
    let g_3 = ((_e266 * 30f) * (0.6f + (0.8f * _e210.x)));
    let glint = ((g_3 / (1f + g_3)) * 0.58f);
    return ((k * ((((vec3<f32>(1f, 0.985f, 0.94f) * crest) + (vec3<f32>(1f, 0.99f, 0.95f) * glint)) + skyRefl) + ((vec3<f32>(0.3f, 0.52f, 0.6f) * clamp(swell, 0f, 1f)) * 0.1f))) + (vec3<f32>(0.97f, 0.985f, 1f) * (((foam_1 * 0.36f) + (comb_1 * 0.34f)) + (surf * 0.13f))));
}

fn hash3_(p_2: vec3<f32>) -> f32 {
    var q: vec3<f32>;

    q = fract(((p_2 * 0.3183099f) + vec3<f32>(0.1f, 0.2f, 0.3f)));
    let _e10 = q;
    let _e11 = q;
    let _e12 = q;
    q = (_e10 + vec3(dot(_e11, (_e12.yzx + vec3(19.19f)))));
    let _e21 = q.x;
    let _e23 = q.y;
    let _e26 = q.z;
    return fract(((_e21 + _e23) * _e26));
}

fn hash3v(p_3: vec3<f32>) -> vec3<f32> {
    let _e1 = hash3_(p_3);
    let _e5 = hash3_((p_3 + vec3(17.7f)));
    let _e9 = hash3_((p_3 + vec3(39.3f)));
    return vec3<f32>(_e1, _e5, _e9);
}

fn valueNoise(p_4: vec3<f32>) -> f32 {
    let i_6 = floor(p_4);
    let f = fract(p_4);
    let u_2 = ((f * f) * (vec3(3f) - (2f * f)));
    let _e15 = hash3_((i_6 + vec3<f32>(0f, 0f, 0f)));
    let _e21 = hash3_((i_6 + vec3<f32>(1f, 0f, 0f)));
    let _e27 = hash3_((i_6 + vec3<f32>(0f, 1f, 0f)));
    let _e33 = hash3_((i_6 + vec3<f32>(1f, 1f, 0f)));
    let _e39 = hash3_((i_6 + vec3<f32>(0f, 0f, 1f)));
    let _e45 = hash3_((i_6 + vec3<f32>(1f, 0f, 1f)));
    let _e51 = hash3_((i_6 + vec3<f32>(0f, 1f, 1f)));
    let _e57 = hash3_((i_6 + vec3<f32>(1f, 1f, 1f)));
    let nx00_ = mix(_e15, _e21, u_2.x);
    let nx10_ = mix(_e27, _e33, u_2.x);
    let nx01_ = mix(_e39, _e45, u_2.x);
    let nx11_ = mix(_e51, _e57, u_2.x);
    return mix(mix(nx00_, nx10_, u_2.y), mix(nx01_, nx11_, u_2.y), u_2.z);
}

fn fbm(p_5: vec3<f32>) -> f32 {
    var v: f32 = 0f;
    var a: f32 = 0.5f;
    var q_1: vec3<f32>;
    var i_5: i32 = 0i;

    q_1 = p_5;
    loop {
        let _e6 = i_5;
        if (_e6 < 5i) {
        } else {
            break;
        }
        {
            let _e11 = v;
            let _e12 = a;
            let _e13 = q_1;
            let _e14 = valueNoise(_e13);
            v = (_e11 + (_e12 * _e14));
            let _e17 = q_1;
            q_1 = (_e17 * 2.03f);
            let _e20 = a;
            a = (_e20 * 0.5f);
        }
        continuing {
            let _e23 = i_5;
            i_5 = (_e23 + 1i);
        }
    }
    let _e26 = v;
    return _e26;
}

fn starLayer(dir_2: vec3<f32>, scale: f32, power: f32, occupancy: f32, twinkle: f32) -> f32 {
    let p_8 = (dir_2 * scale);
    let cell_1 = floor(p_8);
    let local_10 = fract(p_8);
    let _e5 = hash3v(cell_1);
    if (_e5.x > occupancy) {
        return 0f;
    }
    let _e15 = hash3_((cell_1 + vec3(5.5f)));
    let centre_1 = vec3<f32>(_e5.y, _e5.z, _e15);
    let d_5 = length((local_10 - centre_1));
    let core = pow(clamp((1f - (d_5 * 1.6f)), 0f, 1f), power);
    let _e34 = params.forward.w;
    let phase = ((_e5.y * 6.2831855f) + (_e34 * 1.7f));
    let flicker = ((1f - twinkle) + (twinkle * (0.5f + (0.5f * sin(phase)))));
    return ((core * flicker) * (0.35f + (0.65f * _e5.z)));
}

fn sunDisc(dir_3: vec3<f32>, sunDir_1: vec3<f32>) -> vec3<f32> {
    let c_2 = clamp(dot(dir_3, sunDir_1), -1f, 1f);
    let disc_2 = smoothstep(0.99965f, 0.99992f, c_2);
    let tight = pow(max(c_2, 0f), 2600f);
    let mid = pow(max(c_2, 0f), 90f);
    let wide = pow(max(c_2, 0f), 10f);
    let warm = vec3<f32>(1f, 0.955f, 0.885f);
    let cool = vec3<f32>(0.72f, 0.82f, 1f);
    return ((warm * (((disc_2 * 26f) + (tight * 9f)) + (mid * 0.9f))) + ((mix(cool, warm, 0.55f) * wide) * 0.42f));
}

fn eclipseSky(col0_: vec3<f32>, dir_4: vec3<f32>, eclipse: f32) -> vec3<f32> {
    var bearingRaw: vec3<f32>;
    var skyUpRaw: vec3<f32>;
    var azimuthCos: f32 = 1f;
    var col: vec3<f32>;

    if (eclipse <= 0.0001f) {
        return col0_;
    }
    let _e7 = params.cam;
    let observerUp = normalize(_e7.xyz);
    let _e12 = params.sheet;
    let playerUp = normalize(_e12.xyz);
    let _e17 = params.sun;
    let sunDir_2 = normalize(_e17.xyz);
    bearingRaw = (sunDir_2 - (playerUp * dot(sunDir_2, playerUp)));
    let _e24 = bearingRaw;
    let _e25 = bearingRaw;
    if (dot(_e24, _e25) < 0.000001f) {
        let _e31 = params.forward;
        let _e35 = params.forward;
        bearingRaw = (_e31.xyz - (playerUp * dot(_e35.xyz, playerUp)));
    }
    let _e40 = bearingRaw;
    let bearing = normalize(_e40);
    let _e44 = params.eclipseAnchor;
    let anchor = normalize(_e44.xyz);
    skyUpRaw = (observerUp - (anchor * dot(observerUp, anchor)));
    let _e51 = skyUpRaw;
    let _e52 = skyUpRaw;
    if (dot(_e51, _e52) < 0.000001f) {
        let _e58 = params.up;
        skyUpRaw = _e58.xyz;
    }
    let _e60 = skyUpRaw;
    let skyUp = normalize(_e60);
    let skyRight = normalize(cross(skyUp, anchor));
    let denom = max(dot(dir_4, anchor), 0.05f);
    let uv = (vec2<f32>(dot(dir_4, skyRight), dot(dir_4, skyUp)) / vec2(denom));
    let sunTangentRaw = (bearing - (observerUp * dot(bearing, observerUp)));
    let rayTangentRaw = (dir_4 - (observerUp * dot(dir_4, observerUp)));
    let rayTangent = normalize(rayTangentRaw);
    if (dot(sunTangentRaw, sunTangentRaw) > 0.000001f) {
        azimuthCos = dot(rayTangent, normalize(sunTangentRaw));
    }
    let _e86 = azimuthCos;
    let towardSun = pow(clamp((0.5f + (0.5f * _e86)), 0f, 1f), 0.45f);
    let _e98 = params.cam;
    let impact = length(cross(_e98.xyz, dir_4));
    let _e105 = params.cam.w;
    let horizonBand = (0.32f + (0.68f * exp((-(max((impact - _e105), 0f)) * 0.16f))));
    let away = (1f - towardSun);
    let purpleCover = vec3<f32>(0.62f, 0.48f, 0.88f);
    col = (col0_ * mix(vec3(1f), purpleCover, (((eclipse * away) * horizonBand) * 0.62f)));
    let horizonGold = vec3<f32>(1f, 0.34f, 0.055f);
    let _e136 = col;
    col = (_e136 + (((horizonGold * eclipse) * horizonBand) * (0.105f + (0.255f * towardSun))));
    let totality = smoothstep(0.58f, 0.96f, eclipse);
    let _e151 = params.sheetFade.w;
    let sunUp = smoothstep(-0.105f, 0.035f, _e151);
    let ringRadius = mix(0.045f, 0.36f, smoothstep(0.05f, 0.78f, eclipse));
    let ringDist = abs((length(uv) - ringRadius));
    let discMask = (1f - smoothstep((ringRadius - 0.018f), (ringRadius + 0.012f), length(uv)));
    let ringLife = (1f - smoothstep(0.72f, 1f, eclipse));
    let ringCore = (exp((-(ringDist) * 105f)) * 2.6f);
    let ringGlow = (exp((-(ringDist) * 18f)) * 0.72f);
    let shadow = ((discMask * (1f - totality)) * sunUp);
    let _e193 = col;
    col = (_e193 * (1f - (shadow * 0.995f)));
    let gold = vec3<f32>(1f, 0.54f, 0.1f);
    let _e203 = col;
    col = (_e203 + ((((gold * (ringCore + ringGlow)) * ringLife) * smoothstep(0.02f, 0.16f, eclipse)) * sunUp));
    let coronaRadius = mix(0.16f, 0.3f, totality);
    let coronaDist = abs((length(uv) - coronaRadius));
    let _e224 = params.forward.w;
    let _e230 = hash3_(floor(((dir_4 * 310f) + vec3((_e224 * 0.35f)))));
    let edgeNoise = (0.76f + (0.42f * _e230));
    let corona = (((((exp((-(coronaDist) * 34f)) * 2.8f) + (exp((-(coronaDist) * 8f)) * 0.62f)) * totality) * edgeNoise) * sunUp);
    let backGlow = (((exp((-(length(uv)) * 3.4f)) * 0.22f) * totality) * sunUp);
    let _e260 = col;
    col = (_e260 + (gold * (corona + backGlow)));
    let _e264 = col;
    return _e264;
}

fn spaceBackground(dir_5: vec3<f32>) -> vec3<f32> {
    var col_1: vec3<f32> = vec3<f32>(0.0055f, 0.0068f, 0.0125f);
    var s: f32 = 0f;

    let band_1 = exp(-(pow((dot(dir_5, vec3<f32>(0.3549141f, 0.9126362f, -0.20280805f)) * 1.35f), 2f)));
    let _e24 = fbm(((dir_5 * 2.1f) + vec3<f32>(11.3f, 4.7f, 2.9f)));
    let _e32 = fbm(((dir_5 * 3.4f) + vec3<f32>(-7.1f, 22.5f, 8.3f)));
    let violet = vec3<f32>(0.42f, 0.3f, 0.72f);
    let teal = vec3<f32>(0.14f, 0.42f, 0.55f);
    let neb = (band_1 * ((pow(clamp(_e24, 0f, 1f), 1.4f) * 1.1f) + (pow(clamp(_e32, 0f, 1f), 1.8f) * 0.7f)));
    let _e58 = col_1;
    col_1 = (_e58 + ((neb * mix(violet, teal, clamp((_e32 * 1.4f), 0f, 1f))) * 0.95f));
    let _e76 = fbm(((dir_5 * 1.35f) + vec3<f32>(31.7f, 2.2f, -14.6f)));
    let wide_1 = pow(clamp(_e76, 0f, 1f), 1.6f);
    let _e82 = col_1;
    col_1 = (_e82 + (wide_1 * vec3<f32>(0.006f, 0.0125f, 0.016f)));
    let _e96 = fbm(((dir_5 * 5.2f) + vec3<f32>(3.3f, -9.1f, 14f)));
    let dust = pow(clamp(_e96, 0f, 1f), 2f);
    let _e102 = col_1;
    col_1 = (_e102 * mix(1f, 0.72f, (band_1 * dust)));
    let _e109 = s;
    let _e114 = starLayer(dir_5, 85f, 10f, 0.07f, 0.25f);
    s = (_e109 + (_e114 * 3.2f));
    let _e118 = s;
    let _e123 = starLayer(dir_5, 180f, 15f, 0.085f, 0.35f);
    s = (_e118 + (_e123 * 1.1f));
    let _e127 = s;
    let _e132 = starLayer(dir_5, 360f, 22f, 0.1f, 0.45f);
    s = (_e127 + (_e132 * 0.42f));
    let _e147 = hash3_(floor((dir_5 * 85f)));
    let starTint = mix(vec3<f32>(0.75f, 0.85f, 1f), vec3<f32>(1f, 0.92f, 0.78f), _e147);
    let _e149 = col_1;
    let _e150 = s;
    col_1 = (_e149 + (_e150 * starTint));
    let _e153 = col_1;
    return _e153;
}

fn eclipseGrade(col_2: vec3<f32>, pixel: vec2<f32>, eclipse_1: f32) -> vec3<f32> {
    var graded: vec3<f32>;

    if (eclipse_1 <= 0.0001f) {
        return col_2;
    }
    let displayLuma = clamp(dot(clamp(col_2, vec3(0f), vec3(1f)), vec3<f32>(0.2126f, 0.7152f, 0.0722f)), 0f, 1f);
    let highlight = pow(displayLuma, 0.45f);
    let multiplier = mix(1f, (0.4f + (0.22f * highlight)), eclipse_1);
    let purple = mix(vec3(1f), vec3<f32>(0.98f, 0.86f, 1.11f), (eclipse_1 * 0.62f));
    graded = ((col_2 * multiplier) * purple);
    let n_8 = (fract((sin(dot(floor(pixel), vec2<f32>(12.9898f, 78.233f))) * 43758.547f)) - 0.5f);
    let _e49 = graded;
    graded = (_e49 + vec3(((n_8 * eclipse_1) * 0.0028235293f)));
    let _e55 = graded;
    return max(_e55, vec3(0f));
}

@vertex 
fn vs_main(@builtin(vertex_index) i: u32) -> FullscreenOutput {
    var x: f32 = -1f;
    var y: f32 = -1f;
    var out: FullscreenOutput;

    if (i == 1u) {
        x = 3f;
    }
    if (i == 2u) {
        y = 3f;
    }
    let _e12 = x;
    let _e13 = y;
    out.position = vec4<f32>(_e12, _e13, 0f, 1f);
    let _e18 = x;
    let _e23 = y;
    out.uv = vec2<f32>(((_e18 + 1f) * 0.5f), (1f - ((_e23 + 1f) * 0.5f)));
    let _e31 = out;
    return _e31;
}

@fragment 
fn fs_main(in: FullscreenOutput) -> @location(0) vec4<f32> {
    var base: vec3<f32>;
    var sceneT: f32 = 1000000000f;
    var scuff: f32 = 0f;
    var local: bool;
    var t0_: f32;
    var t1_: f32;
    var local_1: bool;

    let _e6 = textureSample(sceneTexture, sceneSampler, in.uv);
    let scene = _e6.xyz;
    let ndcDepth = textureSample(depthTexture, depthSampler, in.uv);
    let ndc = vec2<f32>(((in.uv.x * 2f) - 1f), (1f - (in.uv.y * 2f)));
    let _e27 = params.forward;
    let _e31 = params.right;
    let _e37 = params.right.w;
    let _e42 = params.up.w;
    let _e48 = params.up;
    let _e54 = params.right.w;
    let dir_6 = normalize(((_e27.xyz + (_e31.xyz * ((ndc.x * _e37) * _e42))) + (_e48.xyz * (ndc.y * _e54))));
    let _e62 = params.sheetFade.z;
    let eclipse_2 = clamp(_e62, 0f, 1f);
    base = scene;
    if (ndcDepth >= 0.9999f) {
        let sunFade = (1f - smoothstep(0.02f, 0.94f, eclipse_2));
        let _e74 = spaceBackground(dir_6);
        let _e77 = params.sun;
        let _e80 = sunDisc(dir_6, normalize(_e77.xyz));
        base = (_e74 + (_e80 * sunFade));
        let _e83 = base;
        let _e84 = eclipseSky(_e83, dir_6, eclipse_2);
        base = _e84;
    } else {
        let near = params.shell.y;
        let far = params.shell.z;
        let viewZ = ((near * far) / (far - (ndcDepth * (far - near))));
        let _e100 = params.forward;
        sceneT = (viewZ / max(dot(dir_6, _e100.xyz), 0.001f));
    }
    let _e109 = params.cam;
    let camPos = _e109.xyz;
    let rp_5 = params.cam.w;
    let ra_1 = params.shell.x;
    let _e119 = sceneT;
    if (_e119 < 100000000f) {
        let _e122 = sceneT;
        let wp_4 = (camPos + (dir_6 * _e122));
        let _e125 = base;
        let _e128 = params.sun;
        let _e134 = params.forward.w;
        let _e135 = sceneT;
        let _e136 = oceanShimmer(wp_4, dir_6, normalize(_e128.xyz), _e134, rp_5, _e135);
        base = (_e125 + _e136);
        let _e141 = params.forward.w;
        let _e142 = landTrail(wp_4, _e141, rp_5);
        scuff = _e142;
    }
    let _e144 = raySphere2_(camPos, dir_6, ra_1);
    if !((_e144.y <= 0f)) {
        local = (_e144.y < _e144.x);
    } else {
        local = true;
    }
    let _e155 = local;
    if _e155 {
        let _e156 = base;
        let outCol = clamp(_e156, vec3(0f), vec3(4f));
        let _e164 = eclipseGrade(outCol, in.position.xy, eclipse_2);
        return vec4<f32>(_e164, 1f);
    }
    t0_ = max(_e144.x, 0f);
    t1_ = _e144.y;
    let _e173 = raySphere2_(camPos, dir_6, rp_5);
    if (_e173.y > 0f) {
        local_1 = (_e173.x > 0f);
    } else {
        local_1 = false;
    }
    let _e183 = local_1;
    if _e183 {
        let _e184 = t1_;
        t1_ = min(_e184, _e173.x);
    }
    let _e187 = t1_;
    let _e188 = sceneT;
    t1_ = min(_e187, _e188);
    let limbBlend = smoothstep((rp_5 - 1f), (rp_5 + 1f), length(cross(camPos, dir_6)));
    let msScale_1 = mix(0.22f, 1f, limbBlend);
    let _e200 = t0_;
    let _e201 = t1_;
    let _e204 = params.sun;
    let _e210 = params.sun.w;
    let _e211 = atmosphere(camPos, dir_6, _e200, _e201, normalize(_e204.xyz), _e210, rp_5, ra_1, msScale_1);
    let apr = mix(0.15f, 1f, limbBlend);
    let airDisplay = ((_e211.xyz / (vec3(1f) + _e211.xyz)) * 0.82f);
    let _e223 = base;
    let lit = ((_e223 * mix(1f, _e211.w, apr)) + (airDisplay * apr));
    let _e230 = scuff;
    let outCol_1 = clamp((lit * (1f - _e230)), vec3(0f), vec3(4f));
    let _e241 = eclipseGrade(outCol_1, in.position.xy, eclipse_2);
    return vec4<f32>(_e241, 1f);
}
