struct MaterialParameters {
    iResolution: vec2<f32>,
    iTime: f32,
}

struct VsIn {
    @location(0) pos: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
}

struct VsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

@group(1) @binding(0) 
var<uniform> material: MaterialParameters;

fn smin(a: f32, b: f32, k: f32) -> f32 {
    let h_1 = (max((k - abs((a - b))), 0f) / k);
    return (min(a, b) - (((h_1 * h_1) * k) * 0.25f));
}

fn sdSphere(p: vec3<f32>, r: f32) -> f32 {
    return (length(p) - r);
}

fn sdEllipsoid(p_1: vec3<f32>, r_1: vec3<f32>) -> f32 {
    let k0_ = length((p_1 / r_1));
    let k1_ = length((p_1 / (r_1 * r_1)));
    return ((k0_ * (k0_ - 1f)) / k1_);
}

fn rot2_(p_2: vec2<f32>, a_1: f32) -> vec2<f32> {
    let c = cos(a_1);
    let s = sin(a_1);
    return vec2<f32>(((p_2.x * c) - (p_2.y * s)), ((p_2.x * s) + (p_2.y * c)));
}

fn sdCapsule(p_3: vec3<f32>, a_2: vec3<f32>, b_1: vec3<f32>, r_2: f32) -> f32 {
    let pa = (p_3 - a_2);
    let ba = (b_1 - a_2);
    let h_2 = clamp((dot(pa, ba) / dot(ba, ba)), 0f, 1f);
    return (length((pa - (ba * h_2))) - r_2);
}

fn hash21_(p_4: vec2<f32>) -> f32 {
    var p3_: vec3<f32>;

    p3_ = fract((vec3<f32>(p_4.x, p_4.y, p_4.x) * 0.1031f));
    let _e9 = p3_;
    let _e10 = p3_;
    let _e12 = p3_.y;
    let _e14 = p3_.z;
    let _e16 = p3_.x;
    p3_ = (_e9 + vec3(dot(_e10, (vec3<f32>(_e12, _e14, _e16) + vec3(33.33f)))));
    let _e25 = p3_.x;
    let _e27 = p3_.y;
    let _e30 = p3_.z;
    return fract(((_e25 + _e27) * _e30));
}

fn vnoise(p_5: vec2<f32>) -> f32 {
    let i_3 = floor(p_5);
    let f = fract(p_5);
    let u = ((f * f) * (vec2(3f) - (2f * f)));
    let _e10 = hash21_(i_3);
    let _e15 = hash21_((i_3 + vec2<f32>(1f, 0f)));
    let _e20 = hash21_((i_3 + vec2<f32>(0f, 1f)));
    let _e25 = hash21_((i_3 + vec2<f32>(1f, 1f)));
    return mix(mix(_e10, _e15, u.x), mix(_e20, _e25, u.x), u.y);
}

fn groundHeight(xz: vec2<f32>) -> f32 {
    return (-0.04f * (sin((xz.x * 1.7f)) + sin((xz.y * 1.7f))));
}

fn mushroomField(pos: vec3<f32>, t: f32) -> vec2<f32> {
    let cell = round((pos.xz / vec2(1.6f)));
    let _e6 = hash21_(cell);
    if (_e6 < 0.55f) {
        return vec2<f32>(100000f, 7f);
    }
    let _e15 = hash21_((cell + vec2(5.1f)));
    let _e19 = hash21_((cell + vec2(9.7f)));
    let jitter = ((vec2<f32>(_e15, _e19) - vec2(0.5f)) * 0.6f);
    let center = ((cell * 1.6f) + jitter);
    if (length(center) < 1.3f) {
        return vec2<f32>(100000f, 7f);
    }
    let _e34 = groundHeight(center);
    let _e38 = hash21_((cell + vec2(19f)));
    let scale = (0.6f + (0.6f * _e38));
    let sway = ((0.04f * scale) * sin(((t * 1.5f) + (_e6 * 6.28f))));
    let lp = vec3<f32>(((pos.x - center.x) - sway), (pos.y - _e34), (pos.z - center.y));
    let _e72 = sdCapsule(lp, vec3(0f), vec3<f32>(0f, (0.22f * scale), 0f), (0.04f * scale));
    let _e84 = sdEllipsoid((lp - vec3<f32>(0f, (0.24f * scale), 0f)), (vec3<f32>(0.15f, 0.1f, 0.15f) * scale));
    if (_e84 < _e72) {
        return vec2<f32>(_e84, 6f);
    }
    return vec2<f32>(_e72, 7f);
}

fn bubbleField(pos_1: vec3<f32>, t_1: f32) -> f32 {
    let cell_1 = round((pos_1.xz / vec2(2.7f)));
    let _e9 = hash21_((cell_1 + vec2(41f)));
    if (_e9 < 0.6f) {
        return 100000f;
    }
    let _e16 = hash21_((cell_1 + vec2(2.2f)));
    let _e20 = hash21_((cell_1 + vec2(8.8f)));
    let jitter_1 = ((vec2<f32>(_e16, _e20) - vec2(0.5f)) * 1.4f);
    let center_1 = ((cell_1 * 2.7f) + jitter_1);
    let _e32 = hash21_((cell_1 + vec2(13f)));
    let baseY = (1.2f + (1.4f * _e32));
    let bobY = (baseY + (0.35f * sin(((t_1 * 0.7f) + (_e9 * 6.28f)))));
    let _e50 = hash21_((cell_1 + vec2(27f)));
    let r_3 = (0.12f + (0.16f * _e50));
    let lp_1 = vec3<f32>((pos_1.x - center_1.x), (pos_1.y - bobY), (pos_1.z - center_1.y));
    let _e64 = sdSphere(lp_1, r_3);
    return _e64;
}

fn mapScene(pos_2: vec3<f32>, t_2: f32) -> vec2<f32> {
    var q: vec3<f32>;
    var d: f32;
    var mat: f32 = 1f;
    var h: vec3<f32>;

    let bounce = fract((t_2 * 0.75f));
    let arc = ((4f * bounce) * (1f - bounce));
    let hopH = (0.75f * arc);
    let landing = (1f - smoothstep(0f, 0.3f, arc));
    let apex = smoothstep(0.75f, 1f, arc);
    let sx = ((1f + (0.28f * landing)) - (0.1f * apex));
    let sy = ((1f - (0.26f * landing)) + (0.12f * apex));
    let cen = vec3<f32>(0f, ((0.5f + hopH) - (0.12f * landing)), 0f);
    q = (pos_2 - cen);
    let turn = (0.5f * sin((t_2 * 1.3f)));
    let _e50 = q;
    let _e58 = sdEllipsoid(_e50, vec3<f32>((0.5f * sx), (0.46f * sy), (0.5f * sx)));
    d = _e58;
    let _e61 = q.y;
    let _e65 = q.x;
    let _e69 = q.x;
    let belly = ((_e61 - 0.05f) - ((1.5f * _e65) * _e69));
    let _e72 = d;
    d = (_e72 + ((0.003f * sin((belly * 40f))) * (1f - smoothstep(0f, 0.2f, abs(belly)))));
    let _e86 = q;
    h = (_e86 - vec3<f32>(0f, (0.34f * sy), 0f));
    let _e94 = h;
    let _e96 = rot2_(_e94.xz, turn);
    let _e98 = h.y;
    h = vec3<f32>(_e96, _e98).xzy;
    let _e102 = h.x;
    let _e105 = h.y;
    let _e107 = h.z;
    let hq = vec3<f32>(abs(_e102), _e105, _e107);
    let _e109 = h;
    let _e111 = sdSphere(_e109, 0.3f);
    let _e112 = d;
    let _e114 = smin(_e112, _e111, 0.16f);
    d = _e114;
    let earWag = (0.06f * sin((t_2 * 6f)));
    let _e130 = sdEllipsoid((hq - vec3<f32>(0.17f, (0.26f + earWag), -0.02f)), vec3<f32>(0.08f, 0.15f, 0.07f));
    let _e131 = d;
    let _e133 = smin(_e131, _e130, 0.06f);
    d = _e133;
    let _e135 = q.x;
    let _e140 = q.y;
    let _e145 = q.z;
    let _e153 = sdEllipsoid(vec3<f32>((abs(_e135) - 0.2f), (_e140 + (0.4f * sy)), (_e145 - 0.06f)), vec3<f32>(0.13f, 0.1f, 0.17f));
    let _e154 = d;
    let _e156 = smin(_e154, _e153, 0.09f);
    d = _e156;
    let blink = pow((0.5f + (0.5f * sin((t_2 * 2.7f)))), 24f);
    let _e175 = sdSphere((hq - vec3<f32>(0.12f, 0.06f, 0.24f)), (0.072f - (0.05f * blink)));
    let _e176 = d;
    if (_e175 < _e176) {
        d = _e175;
        mat = 3f;
    }
    let _e186 = sdSphere((hq - vec3<f32>(0.13f, 0.05f, 0.275f)), 0.038f);
    let _e187 = d;
    if (_e186 < _e187) {
        d = _e186;
        mat = 4f;
    }
    let _e192 = groundHeight(pos_2.xz);
    let dGround = (pos_2.y - _e192);
    let _e194 = d;
    if (dGround < _e194) {
        d = dGround;
        mat = 2f;
    }
    let _e197 = mushroomField(pos_2, t_2);
    let _e199 = d;
    if (_e197.x < _e199) {
        d = _e197.x;
        mat = _e197.y;
    }
    let _e203 = bubbleField(pos_2, t_2);
    let _e204 = d;
    if (_e203 < _e204) {
        d = _e203;
        mat = 5f;
    }
    let _e207 = d;
    let _e208 = mat;
    return vec2<f32>(_e207, _e208);
}

fn calcNormal(pos_3: vec3<f32>, t_3: f32) -> vec3<f32> {
    let e = vec2<f32>(0.0008f, -0.0008f);
    let _e8 = mapScene((pos_3 + e.xyy), t_3);
    let _e14 = mapScene((pos_3 + e.yyx), t_3);
    let _e21 = mapScene((pos_3 + e.yxy), t_3);
    let _e28 = mapScene((pos_3 + e.xxx), t_3);
    return normalize(((((e.xyy * _e8.x) + (e.yyx * _e14.x)) + (e.yxy * _e21.x)) + (e.xxx * _e28.x)));
}

fn softShadow(ro: vec3<f32>, rd: vec3<f32>, t_4: f32) -> f32 {
    var res: f32 = 1f;
    var dist: f32 = 0.05f;
    var i: i32 = 0i;
    var local: bool;

    loop {
        let _e4 = i;
        if (_e4 < 40i) {
        } else {
            break;
        }
        {
            let _e10 = dist;
            let _e14 = mapScene((ro + (rd * _e10)), t_4);
            let h_3 = _e14.x;
            let _e17 = res;
            let _e20 = dist;
            res = min(_e17, ((12f * h_3) / _e20));
            let _e23 = dist;
            dist = (_e23 + clamp(h_3, 0.02f, 0.25f));
            let _e28 = res;
            if !((_e28 < 0.004f)) {
                let _e32 = dist;
                local = (_e32 > 8f);
            } else {
                local = true;
            }
            let _e38 = local;
            if _e38 {
                break;
            }
        }
        continuing {
            let _e39 = i;
            i = (_e39 + 1i);
        }
    }
    let _e42 = res;
    return clamp(_e42, 0f, 1f);
}

fn calcAO(pos_4: vec3<f32>, nor: vec3<f32>, t_5: f32) -> f32 {
    var occ: f32 = 0f;
    var sca: f32 = 1f;
    var i_1: i32 = 0i;

    loop {
        let _e4 = i_1;
        if (_e4 < 5i) {
        } else {
            break;
        }
        {
            let _e7 = i_1;
            let hr = (0.01f + ((0.12f * f32(_e7)) / 4f));
            let _e20 = mapScene((pos_4 + (nor * hr)), t_5);
            let d_1 = _e20.x;
            let _e24 = occ;
            let _e26 = sca;
            occ = (_e24 + ((hr - d_1) * _e26));
            let _e29 = sca;
            sca = (_e29 * 0.95f);
        }
        continuing {
            let _e32 = i_1;
            i_1 = (_e32 + 1i);
        }
    }
    let _e35 = occ;
    return clamp((1f - (1.5f * _e35)), 0f, 1f);
}

fn matColor(mat_1: f32, pos_5: vec3<f32>) -> vec3<f32> {
    var capCol: vec3<f32>;
    var g: vec3<f32>;

    if (mat_1 > 6.5f) {
        return vec3<f32>(0.92f, 0.88f, 0.78f);
    }
    if (mat_1 > 5.5f) {
        let cell_2 = round((pos_5.xz / vec2(1.6f)));
        let _e18 = hash21_((cell_2 + vec2(3f)));
        let red = vec3<f32>(0.85f, 0.18f, 0.16f);
        let orange = vec3<f32>(0.92f, 0.52f, 0.12f);
        capCol = mix(red, orange, _e18);
        let _e32 = vnoise((pos_5.xz * 26f));
        let _e33 = capCol;
        capCol = mix(_e33, vec3<f32>(0.96f, 0.94f, 0.88f), smoothstep(0.72f, 0.8f, _e32));
        let _e42 = capCol;
        return _e42;
    }
    if (mat_1 > 4.5f) {
        let cell_3 = round((pos_5.xz / vec2(2.7f)));
        let _e53 = hash21_((cell_3 + vec2(41f)));
        return mix(vec3<f32>(0.75f, 0.85f, 1f), vec3<f32>(0.95f, 0.8f, 0.95f), _e53);
    }
    if (mat_1 > 3.5f) {
        return vec3<f32>(0.02f, 0.02f, 0.03f);
    }
    if (mat_1 > 2.5f) {
        return vec3<f32>(0.95f, 0.96f, 0.98f);
    }
    if (mat_1 > 1.5f) {
        let c_1 = (0.5f + (0.5f * sign((sin((pos_5.x * 3.1416f)) * sin((pos_5.z * 3.1416f))))));
        g = mix(vec3<f32>(0.1f, 0.22f, 0.09f), vec3<f32>(0.14f, 0.3f, 0.12f), c_1);
        let _e101 = g;
        let _e105 = vnoise((pos_5.xz * 5f));
        g = (_e101 + vec3(((_e105 - 0.5f) * 0.04f)));
        let _e112 = g;
        return _e112;
    }
    return vec3<f32>(0.95f, 0.55f, 0.62f);
}

fn render(ro_1: vec3<f32>, rd_1: vec3<f32>, t_6: f32) -> vec3<f32> {
    var col_1: vec3<f32>;
    var cl: f32;
    var dist_1: f32 = 0.4f;
    var hitMat: f32 = -1f;
    var hitPos: vec3<f32> = vec3(0f);
    var i_2: i32 = 0i;
    var lin: vec3<f32> = vec3(0f);

    col_1 = (vec3<f32>(0.55f, 0.78f, 0.92f) - vec3((max(rd_1.y, 0f) * 0.35f)));
    let _e18 = col_1;
    col_1 = mix(_e18, vec3<f32>(0.85f, 0.9f, 0.95f), exp((-9f * max(rd_1.y, 0f))));
    if (rd_1.y > 0.02f) {
        let cp = (((rd_1.xz / vec2(rd_1.y)) * 1.6f) + vec2<f32>((t_6 * 0.05f), 0f));
        let _e45 = vnoise(cp);
        cl = (0.55f * _e45);
        let _e49 = cl;
        let _e55 = vnoise(((cp * 2.1f) + vec2(7f)));
        cl = (_e49 + (0.3f * _e55));
        let _e59 = cl;
        let _e65 = vnoise(((cp * 4.3f) + vec2(19f)));
        cl = (_e59 + (0.15f * _e65));
        let _e69 = cl;
        let cover = (smoothstep(0.55f, 0.85f, _e69) * smoothstep(0.02f, 0.18f, rd_1.y));
        let _e78 = col_1;
        col_1 = mix(_e78, vec3<f32>(1f, 1f, 1f), (cover * 0.85f));
    }
    let sunDirSky = vec3<f32>(0.5970223f, 0.696526f, 0.39801487f);
    let _e90 = col_1;
    col_1 = (_e90 + ((vec3<f32>(1f, 0.85f, 0.6f) * pow(max(dot(rd_1, sunDirSky), 0f), 64f)) * 0.6f));
    loop {
        let _e105 = i_2;
        if (_e105 < 180i) {
        } else {
            break;
        }
        {
            let _e110 = dist_1;
            let p_6 = (ro_1 + (rd_1 * _e110));
            let _e113 = mapScene(p_6, t_6);
            let _e115 = dist_1;
            if (_e113.x < (0.0008f * _e115)) {
                hitMat = _e113.y;
                hitPos = p_6;
                break;
            }
            let _e122 = dist_1;
            dist_1 = (_e122 + _e113.x);
            let _e125 = dist_1;
            if (_e125 > 30f) {
                break;
            }
        }
        continuing {
            let _e128 = i_2;
            i_2 = (_e128 + 1i);
        }
    }
    let _e131 = hitMat;
    if (_e131 > -0.5f) {
        let _e134 = hitPos;
        let _e135 = calcNormal(_e134, t_6);
        let _e136 = hitMat;
        let _e137 = hitPos;
        let _e138 = matColor(_e136, _e137);
        let sunDir = vec3<f32>(0.5970223f, 0.696526f, 0.39801487f);
        let sunDif = clamp(dot(_e135, sunDir), 0f, 1f);
        let _e147 = hitPos;
        let _e151 = softShadow((_e147 + (_e135 * 0.01f)), sunDir, t_6);
        let skyDif = clamp((0.5f + (0.5f * _e135.y)), 0f, 1f);
        let bounce_1 = clamp((0.3f - (0.7f * _e135.y)), 0f, 1f);
        let _e168 = hitPos;
        let _e169 = calcAO(_e168, _e135, t_6);
        let hal = normalize((sunDir - rd_1));
        let spe = ((pow(clamp(dot(_e135, hal), 0f, 1f), 32f) * sunDif) * _e151);
        let _e181 = lin;
        lin = (_e181 + ((sunDif * vec3<f32>(2f, 1.75f, 1.35f)) * _e151));
        let _e189 = lin;
        lin = (_e189 + ((skyDif * vec3<f32>(0.3f, 0.4f, 0.55f)) * _e169));
        let _e197 = lin;
        lin = (_e197 + ((bounce_1 * vec3<f32>(0.2f, 0.25f, 0.12f)) * _e169));
        let _e205 = lin;
        col_1 = (_e138 * _e205);
        let _e207 = col_1;
        col_1 = (_e207 + (spe * vec3<f32>(1f, 0.95f, 0.85f)));
        let fre = pow(clamp((1f + dot(_e135, rd_1)), 0f, 1f), 3f);
        let _e222 = col_1;
        col_1 = (_e222 + (((fre * 0.15f) * vec3<f32>(0.9f, 0.95f, 1f)) * _e169));
        let _e232 = col_1;
        let _e237 = dist_1;
        let _e240 = dist_1;
        col_1 = mix(_e232, vec3<f32>(0.72f, 0.83f, 0.92f), (1f - exp(((-0.00025f * _e237) * _e240))));
    }
    let _e246 = col_1;
    return _e246;
}

@vertex 
fn vs_main(in: VsIn) -> VsOut {
    var out: VsOut;

    out.clip = vec4<f32>((in.pos.xy * 2f), 0f, 1f);
    out.uv = in.uv;
    let _e12 = out;
    return _e12;
}

@fragment 
fn fs_main(in_1: VsOut) -> @location(0) vec4<f32> {
    var col: vec3<f32>;

    let _e10 = material.iResolution;
    let fragCoord = (vec2<f32>(in_1.uv.x, (1f - in_1.uv.y)) * _e10);
    let _e16 = material.iResolution;
    let _e21 = material.iResolution.y;
    let p_7 = (((2f * fragCoord) - _e16) / vec2(_e21));
    let t_7 = material.iTime;
    let an = (0.5f * sin((t_7 * 0.25f)));
    let ta = vec3<f32>(0f, 0.55f, 0f);
    let ro_2 = (ta + vec3<f32>((2.6f * sin(an)), 0.5f, (2.6f * cos(an))));
    let cw = normalize((ta - ro_2));
    let cu = normalize(cross(cw, vec3<f32>(0f, 1f, 0f)));
    let cv = cross(cu, cw);
    let rd_2 = normalize((((p_7.x * cu) + (p_7.y * cv)) + (1.8f * cw)));
    let _e63 = render(ro_2, rd_2, t_7);
    col = _e63;
    let _e65 = col;
    let _e66 = col;
    col = (_e65 / (vec3(1f) + _e66));
    let _e71 = col;
    col = pow(_e71, vec3(0.4545f));
    let _e75 = col;
    let luma = dot(_e75, vec3<f32>(0.299f, 0.587f, 0.114f));
    let _e82 = col;
    col = mix(vec3(luma), _e82, 1.25f);
    let _e85 = col;
    col = clamp((((_e85 - vec3(0.5f)) * 1.08f) + vec3(0.5f)), vec3(0f), vec3(1f));
    let _e101 = material.iResolution;
    let q_1 = (fragCoord / _e101);
    let _e103 = col;
    col = (_e103 * (0.5f + (0.5f * pow(((((16f * q_1.x) * q_1.y) * (1f - q_1.x)) * (1f - q_1.y)), 0.2f))));
    let _e124 = col;
    return vec4<f32>(_e124, 1f);
}
