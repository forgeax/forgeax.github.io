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
    circumsolarStrength: f32,
    circumsolarWidth: f32,
}

struct AtmosphereCubeVsIn {
    @location(0) faceVertex: vec3<f32>,
}

struct AtmosphereCubeVsOut {
    @builtin(position) clip: vec4<f32>,
    @location(0) direction: vec3<f32>,
}

const DAYLIGHT_RAYLEIGHX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJSGC6LMNFTWQ5AX: vec3<f32> = vec3<f32>(0.000005804543f, 0.00001356291f, 0.0000302659f);
const DAYLIGHT_MIEX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJSGC6LMNFTWQ5AX: vec3<f32> = vec3<f32>(183999200000000f, 277980200000000f, 407904800000000f);

@group(0) @binding(0) 
var<uniform> atmosphere: AtmosphereCubeParams;

fn daylight_air_massX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJSGC6LMNFTWQ5AX(elevation: f32) -> f32 {
    let mu = max(elevation, 0f);
    return (1f / sqrt(((mu * mu) + 0.0625f)));
}

fn daylight_sky_radianceX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJSGC6LMNFTWQ5AX(viewDirection: vec3<f32>, sunDirection: vec3<f32>, sunColor: vec3<f32>, sunIlluminance: f32, turbidity: f32, rayleigh: f32, mieCoefficient: f32, mieDirectionalG: f32, circumsolarStrength: f32, circumsolarWidth: f32) -> vec3<f32> {
    let view = normalize((vec3<f32>(viewDirection.x, max(viewDirection.y, 0f), viewDirection.z) + vec3<f32>(0f, 0.000001f, 0f)));
    let sun = normalize(sunDirection);
    let betaR = (DAYLIGHT_RAYLEIGHX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJSGC6LMNFTWQ5AX * max(rayleigh, 0f));
    let betaM = (DAYLIGHT_MIEX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJSGC6LMNFTWQ5AX * ((0.000000000000000000868f * clamp(turbidity, 1f, 20f)) * max(mieCoefficient, 0f)));
    let opticalDepth = ((betaR * 8400f) + (betaM * 1250f));
    let _e39 = daylight_air_massX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJSGC6LMNFTWQ5AX(view.y);
    let extinction = exp((-(opticalDepth) * _e39));
    let _e44 = daylight_air_massX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJSGC6LMNFTWQ5AX(sun.y);
    let solarTransmittance = exp((-(opticalDepth) * _e44));
    let cosine = clamp(dot(view, sun), -1f, 1f);
    let rayleighPhase = (0.75f * (1f + (cosine * cosine)));
    let width = max(circumsolarWidth, 0.25f);
    let widthExponent = max(0.25f, (1f + ((width - 1f) * 1.25f)));
    let g = pow(clamp(mieDirectionalG, 0f, 0.98f), widthExponent);
    let mieDenominator = max(((1f + (g * g)) - ((2f * g) * cosine)), 0.001f);
    let miePhase = ((1f - (g * g)) / pow(mieDenominator, 1.5f));
    let widthExpansion = max((width - 1f), 0f);
    let angularDistance = max((1f - cosine), 0f);
    let haloCenter = (0.012f + (0.012f * widthExpansion));
    let haloSpread = (0.012f + (0.012f * widthExpansion));
    let halo = exp(-(pow(((angularDistance - haloCenter) / haloSpread), 2f)));
    let widenedMiePhase = (miePhase + ((widthExpansion * halo) * 8f));
    let opticalResponse = ((solarTransmittance * (vec3(1f) - extinction)) / max((betaR + betaM), vec3(0.00000001f)));
    let rayleighResponse = pow(max(((opticalResponse * betaR) * rayleighPhase), vec3(0f)), vec3(1.5f));
    let mieResponse = (((opticalResponse * betaM) * widenedMiePhase) * clamp(circumsolarStrength, 0f, 4f));
    let daylight = ((max(sunColor, vec3(0f)) * max(sunIlluminance, 0f)) * (rayleighResponse + mieResponse));
    let night = mix(vec3<f32>(0.008f, 0.012f, 0.024f), vec3<f32>(0.0015f, 0.004f, 0.016f), pow(view.y, 0.35f));
    let daylightWeight = smoothstep(-0.12f, 0.02f, sun.y);
    return clamp(mix(night, daylight, daylightWeight), vec3(0f), vec3(65504f));
}

@vertex 
fn atmosphere_cubemap_vs(input: AtmosphereCubeVsIn) -> AtmosphereCubeVsOut {
    var output: AtmosphereCubeVsOut;

    let face = (u32(input.faceVertex.z) - 1u);
    let x = input.faceVertex.x;
    let y = input.faceVertex.y;
    output.clip = vec4<f32>(x, y, 0.5f, 1f);
    switch face {
        case 0u: {
            output.direction = vec3<f32>(1f, -(y), -(x));
        }
        case 1u: {
            output.direction = vec3<f32>(-1f, -(y), x);
        }
        case 2u: {
            output.direction = vec3<f32>(x, -1f, -(y));
        }
        case 3u: {
            output.direction = vec3<f32>(x, 1f, y);
        }
        case 4u: {
            output.direction = vec3<f32>(x, -(y), 1f);
        }
        default: {
            output.direction = vec3<f32>(-(x), -(y), -1f);
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
    let _e26 = atmosphere.circumsolarStrength;
    let _e29 = atmosphere.circumsolarWidth;
    let _e30 = daylight_sky_radianceX_naga_oil_mod_XMZXXEZ3FMF4F6ZLOOZUXE33ONVSW45B2HJSGC6LMNFTWQ5AX(normalize(input_1.direction), _e5, _e8, _e11, _e14, _e17, _e20, _e23, _e26, _e29);
    return vec4<f32>(_e30, 1f);
}
