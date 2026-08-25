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
    pcfKernelSize: f32,
    spotLightViewProj: array<mat4x4<f32>, 4>,
    temporalCurrentViewProj: mat4x4<f32>,
    temporalPreviousViewProj: mat4x4<f32>,
    temporalProjection: vec4<f32>,
}

struct FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct AtmosphereBackgroundParams {
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

@group(0) @binding(0) 
var sky: texture_cube<f32>;
@group(0) @binding(1) 
var skySampler: sampler;
@group(0) @binding(2) 
var<uniform> view: ViewX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;
@group(0) @binding(3) 
var<uniform> atmosphere: AtmosphereBackgroundParams;

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

fn atmosphere_sun_disc_radiance(viewDirection: vec3<f32>, sunDirection: vec3<f32>, sunColor: vec3<f32>, sunIlluminance: f32, angularRadius: f32) -> vec3<f32> {
    let alignment = dot(normalize(viewDirection), normalize(sunDirection));
    let edge = smoothstep(cos(max((angularRadius * 1.5f), 0.000001f)), cos(max(angularRadius, 0.000001f)), alignment);
    let solidAngle = (6.2831855f * (1f - cos(max(angularRadius, 0.000001f))));
    return (((max(sunColor, vec3(0f)) * max(sunIlluminance, 0f)) * edge) / vec3(solidAngle));
}

fn atmosphere_background_direction(uv: vec2<f32>) -> vec3<f32> {
    let ndc = vec4<f32>(((uv.x * 2f) - 1f), (1f - (uv.y * 2f)), 1f, 1f);
    let _e16 = view.inverseViewProj;
    let world = (_e16 * ndc);
    let _e24 = view.cameraPos;
    return normalize(((world.xyz / vec3(world.w)) - _e24));
}

@vertex 
fn atmosphere_background_vs(@builtin(vertex_index) vertexIndex: u32) -> FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX {
    var output: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX;

    let _e1 = fullscreen_triangleX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX(vertexIndex);
    output = _e1;
    output.position.z = 1f;
    let _e6 = output;
    return _e6;
}

@fragment 
fn atmosphere_background_fs(input: FullscreenOutputX_naga_oil_mod_XMZXXEZ3FMF4F65TJMV3TUOTDN5WW233OX) -> @location(0) vec4<f32> {
    var radiance: vec3<f32>;
    var local: bool;

    let _e2 = atmosphere_background_direction(input.uv);
    let cubeDirection = vec3<f32>(_e2.x, -(_e2.y), _e2.z);
    let _e10 = textureSample(sky, skySampler, cubeDirection);
    radiance = _e10.xyz;
    let _e15 = atmosphere.sunDiscEnabled;
    if (_e15 > 0.5f) {
        let _e21 = atmosphere.sunDirection.y;
        local = (_e21 > 0f);
    } else {
        local = false;
    }
    let _e27 = local;
    if _e27 {
        let _e28 = radiance;
        let _e31 = atmosphere.sunDirection;
        let _e34 = atmosphere.sunColor;
        let _e37 = atmosphere.sunIlluminance;
        let _e40 = atmosphere.sunAngularRadius;
        let _e41 = atmosphere_sun_disc_radiance(_e2, _e31, _e34, _e37, _e40);
        radiance = (_e28 + _e41);
    }
    let _e43 = radiance;
    return vec4<f32>(_e43, 1f);
}
