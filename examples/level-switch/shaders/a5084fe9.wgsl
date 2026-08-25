struct PreethamPerezCoefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX {
    a: f32,
    b: f32,
    c: f32,
    d: f32,
    e: f32,
}

struct AtmosphereCubeParams {
    sunDirection: vec3<f32>,
    sunIlluminance: f32,
    sunColor: vec3<f32>,
    _sunColorPad: f32,
    turbidity: f32,
    rayleigh: f32,
    mieCoefficient: f32,
    mieDirectionalG: f32,
    sunAngularRadius: f32,
    sunDiscEnabled: f32,
    _tailPad: vec2<f32>,
}

struct AtmosphereCubeVsIn {
    @location(0) faceVertex: vec3<f32>,
}

struct AtmosphereCubeVsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) direction: vec3<f32>,
}

const PREETHAM_YXY_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX: f32 = 0.00001f;
const PREETHAM_PIX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX: f32 = 3.1415927f;

@group(0) @binding(0) 
var<uniform> atmosphere: AtmosphereCubeParams;

fn preetham_zenith_yxyX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(sunTheta: f32, turbidity: f32) -> vec3<f32> {
    let theta2_ = (sunTheta * sunTheta);
    let theta3_ = (theta2_ * sunTheta);
    let turbidity2_ = (turbidity * turbidity);
    let chi = ((0.44444445f - (turbidity / 120f)) * (PREETHAM_PIX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX - (2f * sunTheta)));
    let Y = (((((4.0453f * turbidity) - 4.971f) * tan(chi)) - (0.2155f * turbidity)) + 2.4192f);
    let x = ((((((0.00165f * theta3_) - (0.00374f * theta2_)) + (0.00208f * sunTheta)) * turbidity2_) + (((((-0.02902f * theta3_) + (0.06377f * theta2_)) - (0.03202f * sunTheta)) + 0.00394f) * turbidity)) + ((((0.11693f * theta3_) - (0.21196f * theta2_)) + (0.06052f * sunTheta)) + 0.25885f));
    let y = ((((((0.00275f * theta3_) - (0.0061f * theta2_)) + (0.00316f * sunTheta)) * turbidity2_) + (((((-0.04214f * theta3_) + (0.0897f * theta2_)) - (0.04153f * sunTheta)) + 0.00515f) * turbidity)) + ((((0.15346f * theta3_) - (0.26756f * theta2_)) + (0.06669f * sunTheta)) + 0.26688f));
    return vec3<f32>(max(Y, 0f), clamp(x, 0f, 1f), clamp(y, PREETHAM_YXY_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX, 1f));
}

fn preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(fit: vec2<f32>, turbidity_1: f32) -> f32 {
    return ((fit.x * turbidity_1) + fit.y);
}

fn preetham_y_coefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(turbidity_2: f32) -> PreethamPerezCoefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX {
    let _e4 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(0.1787f, -1.463f), turbidity_2);
    let _e8 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(-0.3554f, 0.4275f), turbidity_2);
    let _e12 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(-0.0227f, 5.3251f), turbidity_2);
    let _e16 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(0.1206f, -2.5771f), turbidity_2);
    let _e20 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(-0.067f, 0.3703f), turbidity_2);
    return PreethamPerezCoefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(_e4, _e8, _e12, _e16, _e20);
}

fn preetham_perezX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(theta: f32, gamma: f32, coefficients: PreethamPerezCoefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX) -> f32 {
    let safeCosTheta = max(cos(theta), 0.01f);
    let cosGamma = cos(max(gamma, 0f));
    let horizon = (1f + (coefficients.a * exp((coefficients.b / safeCosTheta))));
    let circumsolar = ((1f + (coefficients.c * exp((coefficients.d * max(gamma, 0f))))) + ((coefficients.e * cosGamma) * cosGamma));
    return max((horizon * circumsolar), PREETHAM_YXY_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX);
}

fn preetham_relative_perezX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(theta_1: f32, gamma_1: f32, sunTheta_1: f32, coefficients_1: PreethamPerezCoefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX) -> f32 {
    let _e3 = preetham_perezX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(theta_1, gamma_1, coefficients_1);
    let _e6 = preetham_perezX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(0f, sunTheta_1, coefficients_1);
    return (_e3 / max(_e6, PREETHAM_YXY_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX));
}

fn preetham_x_coefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(turbidity_3: f32) -> PreethamPerezCoefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX {
    let _e4 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(-0.0193f, -0.2592f), turbidity_3);
    let _e8 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(-0.0665f, 0.0008f), turbidity_3);
    let _e12 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(-0.0004f, 0.2125f), turbidity_3);
    let _e16 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(-0.0641f, -0.8989f), turbidity_3);
    let _e20 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(-0.0033f, 0.0452f), turbidity_3);
    return PreethamPerezCoefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(_e4, _e8, _e12, _e16, _e20);
}

fn preetham_small_y_coefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(turbidity_4: f32) -> PreethamPerezCoefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX {
    let _e4 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(-0.0167f, -0.2608f), turbidity_4);
    let _e8 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(-0.095f, 0.0092f), turbidity_4);
    let _e12 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(-0.0079f, 0.2102f), turbidity_4);
    let _e16 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(-0.0441f, -1.6537f), turbidity_4);
    let _e20 = preetham_fitX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(vec2<f32>(-0.0109f, 0.0529f), turbidity_4);
    return PreethamPerezCoefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(_e4, _e8, _e12, _e16, _e20);
}

fn preetham_finite_guardX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(value: vec3<f32>) -> vec3<f32> {
    return clamp(value, vec3(0f), vec3(65504f));
}

fn preetham_yxy_to_linear_srgbX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(yxy: vec3<f32>) -> vec3<f32> {
    let Y_1 = max(yxy.x, 0f);
    let x_1 = clamp(yxy.y, 0f, 1f);
    let y_1 = clamp(yxy.z, PREETHAM_YXY_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX, 1f);
    let X = ((Y_1 * x_1) / y_1);
    let Z = ((Y_1 * max(((1f - x_1) - y_1), 0f)) / y_1);
    let linear = vec3<f32>((((3.2406f * X) - (1.5372f * Y_1)) - (0.4986f * Z)), (((-0.9689f * X) + (1.8758f * Y_1)) + (0.0415f * Z)), (((0.0557f * X) - (0.204f * Y_1)) + (1.057f * Z)));
    let _e49 = preetham_finite_guardX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(max(linear, vec3(0f)));
    return _e49;
}

fn preetham_sky_radianceX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(viewDirection: vec3<f32>, sunDirection: vec3<f32>, sunColor: vec3<f32>, sunIlluminance: f32, turbidity_5: f32, rayleigh: f32, mieCoefficient: f32, mieDirectionalG: f32) -> vec3<f32> {
    let horizonClampedView = vec3<f32>(viewDirection.x, max(viewDirection.y, 0f), viewDirection.z);
    let view = (horizonClampedView / vec3(max(length(horizonClampedView), PREETHAM_YXY_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX)));
    let sun = (sunDirection / vec3(max(length(sunDirection), PREETHAM_YXY_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX)));
    let theta_2 = acos(clamp(view.y, 0f, 1f));
    let sunTheta_2 = acos(clamp(sun.y, 0f, 1f));
    let sunAlignment = clamp(dot(view, sun), -1f, 1f);
    let gamma_2 = acos(sunAlignment);
    let safeTurbidity = clamp(turbidity_5, 1f, 20f);
    let _e37 = preetham_zenith_yxyX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(sunTheta_2, safeTurbidity);
    let _e38 = preetham_y_coefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(safeTurbidity);
    let _e39 = preetham_relative_perezX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(theta_2, gamma_2, sunTheta_2, _e38);
    let _e40 = preetham_x_coefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(safeTurbidity);
    let _e41 = preetham_relative_perezX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(theta_2, gamma_2, sunTheta_2, _e40);
    let _e42 = preetham_small_y_coefficientsX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(safeTurbidity);
    let _e43 = preetham_relative_perezX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(theta_2, gamma_2, sunTheta_2, _e42);
    let forward = pow(max(sunAlignment, 0f), mix(2f, 32f, clamp(mieDirectionalG, 0f, 0.999f)));
    let mediumGain = (max(rayleigh, 0f) + ((max(mieCoefficient, 0f) * 40f) * (0.25f + forward)));
    let luminance = ((((_e37.x * _e39) * max(sunIlluminance, 0f)) * 0.01f) * mediumGain);
    let yxy_1 = vec3<f32>(max(luminance, 0f), clamp((_e37.y * _e41), 0f, 1f), clamp((_e37.z * _e43), PREETHAM_YXY_EPSILONX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX, 1f));
    let tintStrength = (0.08f + (0.32f * pow(max(sunAlignment, 0f), 4f)));
    let skyTint = mix(vec3(1f), max(sunColor, vec3(0f)), tintStrength);
    let _e103 = preetham_yxy_to_linear_srgbX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(yxy_1);
    let daylight = (_e103 * skyTint);
    let daylightWeight = smoothstep(-0.12f, 0.02f, sun.y);
    let nightHorizon = vec3<f32>(0.008f, 0.012f, 0.024f);
    let nightZenith = vec3<f32>(0.0015f, 0.004f, 0.016f);
    let night = mix(nightHorizon, nightZenith, pow(clamp(view.y, 0f, 1f), 0.35f));
    let _e125 = preetham_finite_guardX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(mix(night, daylight, daylightWeight));
    return _e125;
}

@vertex 
fn atmosphere_cubemap_vs(input: AtmosphereCubeVsIn) -> AtmosphereCubeVsOut {
    var output: AtmosphereCubeVsOut;

    let face = (u32(input.faceVertex.z) - 1u);
    let x_2 = input.faceVertex.x;
    let y_2 = input.faceVertex.y;
    output.clip = vec4<f32>(x_2, y_2, 0.5f, 1f);
    switch face {
        case 0u: {
            output.direction = vec3<f32>(1f, -(y_2), -(x_2));
        }
        case 1u: {
            output.direction = vec3<f32>(-1f, -(y_2), x_2);
        }
        case 2u: {
            output.direction = vec3<f32>(x_2, -1f, -(y_2));
        }
        case 3u: {
            output.direction = vec3<f32>(x_2, 1f, y_2);
        }
        case 4u: {
            output.direction = vec3<f32>(x_2, -(y_2), 1f);
        }
        default: {
            output.direction = vec3<f32>(-(x_2), -(y_2), -1f);
        }
    }
    let _e40 = output;
    return _e40;
}

@fragment 
fn atmosphere_cubemap_fs(input_1: AtmosphereCubeVsOut) -> @location(0) vec4<f32> {
    let _e5 = atmosphere.sunDirection;
    let _e8 = atmosphere.sunColor;
    let _e11 = atmosphere.sunIlluminance;
    let _e14 = atmosphere.turbidity;
    let _e17 = atmosphere.rayleigh;
    let _e20 = atmosphere.mieCoefficient;
    let _e23 = atmosphere.mieDirectionalG;
    let _e24 = preetham_sky_radianceX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJYHEZLFORUGC3IX(normalize(input_1.direction), _e5, _e8, _e11, _e14, _e17, _e20, _e23);
    return vec4<f32>(_e24, 1f);
}
