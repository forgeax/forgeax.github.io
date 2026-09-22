import{s as e}from"./dist-CHd_NZJQ.js";import{C as t,a as n,zr as r}from"./chunk-DS7WWPFM-BDMKhb16.js";import{o as i}from"./dist-D1HDioW-.js";import{r as a}from"./dist-CowGC11g.js";import{t as o}from"./authoring-CiKtXdHo.js";import{J as s}from"./object-definition-registry-D4kFDhNZ.js";import{t as c}from"./runtime-world-scope-sgVgikyV.js";import{a as l,n as u,o as d}from"./water-surface-bindings-CpxsaK4P.js";var f=`weapon-spirit.title-state`,p=class{values=new Float32Array(52);bytes=new Uint8Array(this.values.buffer);view=i.create();projection=i.create();viewProjection=i.create();inverse=i.create();relativeWorld=i.create();setStyle(e){this.bytes.set(e)}update(e,t,n,r){let a=this.values;a[0]=e.near,a[1]=e.far,a[11]=d+l,a[48]=-s,a[49]=n&&e.projection===0?r===`performance`?.18:.3:0,a[50]=r===`performance`?6:12,a[51]=r===`performance`?12:r===`balanced`?20:28,a[49]!==0&&(this.relativeWorld.set(t),this.relativeWorld[12]=0,this.relativeWorld[14]=0,i.invert(this.view,this.relativeWorld),i.perspective(this.projection,e.fov,e.aspect,e.near,e.far),i.multiply(this.viewProjection,this.projection,this.view),i.invert(this.inverse,this.viewProjection),a.set(this.viewProjection,12),a.set(this.inverse,28),a[44]=0,a[45]=t[13],a[46]=0,a[47]=0)}},m=`02642f73-b2b1-569f-9231-38bdf7a112cf`,h=`ai-weapon-spirit::shared-readability-depth-edge`,g=`forgeax::standard`;function _(e){if(e instanceof Error)return e.message;if(e&&typeof e==`object`){let t=e;if(typeof t.hint==`string`)return t.hint;if(typeof t.code==`string`)return t.code}return String(e)}function v(e){if(!e||typeof e!=`object`)throw Error(`[presentation-pipeline] loaded asset is not an object`);let t=e;if(t.kind!==`render-pipeline`)throw Error(`[presentation-pipeline] expected render-pipeline, received ${String(t.kind)}`);if(t.pipelineId!==g)throw Error(`[presentation-pipeline] expected ${g}, received ${String(t.pipelineId)}`);let n=t.config?.postEffects;if(!Array.isArray(n)||n.length!==1||n[0]!==`ai-weapon-spirit::shared-readability-depth-edge`)throw Error(`[presentation-pipeline] authored postEffects contract drifted`)}async function y(e){let t=[];if(e.resources.paramsEntity!==void 0){let n=e.world.despawn(e.resources.paramsEntity);n.ok?e.resources.paramsEntity=void 0:t.push(n.error)}if(e.resources.featureLease)try{let n=await e.resources.featureLease.release();n.ok?e.resources.featureLease=void 0:t.push(n.error)}catch(e){t.push(e)}if(t.length>0)throw AggregateError(t,`[presentation-pipeline] failed to dispose ${e.label}`)}async function b(e){let n=r.parse(m);if(!n.ok)throw n.error;let i=await e.assets.loadByGuid(n.value);if(!i.ok)throw Error(`[presentation-pipeline] failed to load authored pipeline: ${_(i.error)}`);v(i.value);let a={};try{let n=await e.renderFeatureHost.installFeature(o({identity:h,source:e.shaderSource,reads:[{key:`sceneColor`},{key:`depth`,sampleType:`depth`}],params:{byteSize:e.params.byteLength,defaultValue:e.params}}));if(!n.ok)throw Error(`[presentation-pipeline] feature install failed: ${_(n.error)}`);a.featureLease=n.value;let r=e.world.spawn({component:t,data:{shader:h,data:e.params}});if(!r.ok)throw Error(`[presentation-pipeline] params entity spawn failed: ${_(r.error)}`);a.paramsEntity=r.value}catch(t){try{await y({world:e.world,resources:a,label:`failed acquisition`})}catch(e){throw AggregateError([t,e],`[presentation-pipeline] acquisition rollback failed`)}throw t}let s=a.paramsEntity,c=new Uint8Array(e.params),l=!1;return{paramsEntity:s,get disposed(){return l},setParams(n){if(l)throw Error(`[presentation-pipeline] cannot update a disposed lease`);if(n.byteLength!==c.byteLength)throw Error(`[presentation-pipeline] params byte size differs from the installed shader`);let r=!1;for(let e=0;e<n.byteLength;e++)if(n[e]!==c[e]){r=!0;break}if(!r)return;let i=e.world.set(s,t,{shader:h,data:n});if(!i.ok)throw Error(`[presentation-pipeline] params update failed: ${_(i.error)}`);c.set(n)},async dispose(){l||=(await y({world:e.world,resources:a,label:`presentation pipeline lease`}),!0)}}}var x={hash:`c53d8d2d`,wgsl:`struct FullscreenOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct ReadabilityParams {
    depth: vec4<f32>,
    edge: vec4<f32>,
    caseStyle: vec4<f32>,
    viewProjection: mat4x4<f32>,
    inverseViewProjection: mat4x4<f32>,
    eye: vec4<f32>,
    water: vec4<f32>,
}

@group(1) @binding(0) 
var sceneTexture: texture_2d<f32>;
@group(1) @binding(1) 
var sceneSampler: sampler;
@group(1) @binding(2) 
var<uniform> p: ReadabilityParams;
@group(1) @binding(3) 
var depthTexture: texture_depth_2d;
@group(1) @binding(4) 
var depthSampler: sampler;

fn linearDepth(ndcDepth: f32) -> f32 {
    let nearPlane = p.depth.x;
    let farPlane = p.depth.y;
    return ((nearPlane * farPlane) / max(0.00001f, (farPlane - (ndcDepth * (farPlane - nearPlane)))));
}

fn sceneDepth(pixel: vec2<i32>) -> f32 {
    let _e3 = textureLoad(depthTexture, pixel, 0i);
    return _e3;
}

fn sampleLinearDepth(pixel_1: vec2<i32>, dimensions: vec2<i32>) -> f32 {
    let safePixel = clamp(pixel_1, vec2(0i), (dimensions - vec2(1i)));
    let _e8 = sceneDepth(safePixel);
    let _e9 = linearDepth(_e8);
    return _e9;
}

fn inkResolutionScale(dimensions_1: vec2<i32>) -> f32 {
    return clamp((f32(min(dimensions_1.x, dimensions_1.y)) / 900f), 0.625f, 2f);
}

fn inkHash(cell: vec2<f32>) -> f32 {
    var q: vec3<f32>;

    q = fract((vec3<f32>(cell.x, cell.y, cell.x) * 0.1031f));
    let _e9 = q;
    let _e10 = q;
    let _e11 = q;
    q = (_e9 + vec3(dot(_e10, (_e11.yzx + vec3(33.33f)))));
    let _e20 = q.x;
    let _e22 = q.y;
    let _e25 = q.z;
    return fract(((_e20 + _e22) * _e25));
}

fn inkGrain(point: vec2<f32>) -> f32 {
    let cell_1 = floor(point);
    let fraction = fract(point);
    let weight = ((fraction * fraction) * (vec2(3f) - (2f * fraction)));
    let _e10 = inkHash(cell_1);
    let _e15 = inkHash((cell_1 + vec2<f32>(1f, 0f)));
    let _e22 = inkHash((cell_1 + vec2<f32>(0f, 1f)));
    let _e26 = inkHash((cell_1 + vec2(1f)));
    return mix(mix(_e10, _e15, weight.x), mix(_e22, _e26, weight.x), weight.y);
}

fn surfaceDepthSlope(pixel_2: vec2<i32>, dimensions_2: vec2<i32>, center: f32) -> vec2<f32> {
    var slope: vec2<f32>;

    let reciprocal = (1f / center);
    let _e9 = sampleLinearDepth((pixel_2 - vec2<i32>(1i, 0i)), dimensions_2);
    let _e17 = sampleLinearDepth((pixel_2 - vec2<i32>(0i, 1i)), dimensions_2);
    let backward = vec2<f32>((reciprocal - (1f / _e9)), (reciprocal - (1f / _e17)));
    let _e26 = sampleLinearDepth((pixel_2 + vec2<i32>(1i, 0i)), dimensions_2);
    let _e34 = sampleLinearDepth((pixel_2 + vec2<i32>(0i, 1i)), dimensions_2);
    let forward = vec2<f32>(((1f / _e26) - reciprocal), ((1f / _e34) - reciprocal));
    slope = select(forward, backward, (abs(backward) < abs(forward)));
    let _e44 = slope;
    slope = select(_e44, forward, (pixel_2 == vec2(0i)));
    let _e49 = slope;
    slope = select(_e49, backward, (pixel_2 == (dimensions_2 - vec2(1i))));
    let _e55 = slope;
    return clamp(_e55, vec2((-(reciprocal) * 0.05f)), vec2((reciprocal * 0.05f)));
}

fn discontinuity(pixel_3: vec2<i32>, offset: vec2<i32>, dimensions_3: vec2<i32>, center_1: f32, slope_1: vec2<f32>) -> f32 {
    let samplePixel = clamp((pixel_3 + offset), vec2(0i), (dimensions_3 - vec2(1i)));
    let _e10 = sampleLinearDepth(samplePixel, dimensions_3);
    let _e14 = p.depth.y;
    let predicted = (1f / max((1f / _e14), ((1f / center_1) + dot(slope_1, vec2<f32>((samplePixel - pixel_3))))));
    return max(0f, min((_e10 - center_1), (_e10 - predicted)));
}

fn crossDiscontinuity(pixel_4: vec2<i32>, radius: i32, dimensions_4: vec2<i32>, center_2: f32, slope_2: vec2<f32>) -> f32 {
    let _e8 = discontinuity(pixel_4, vec2<i32>(-(radius), 0i), dimensions_4, center_2, slope_2);
    let _e11 = discontinuity(pixel_4, vec2<i32>(radius, 0i), dimensions_4, center_2, slope_2);
    let _e15 = discontinuity(pixel_4, vec2<i32>(0i, -(radius)), dimensions_4, center_2, slope_2);
    let _e18 = discontinuity(pixel_4, vec2<i32>(0i, radius), dimensions_4, center_2, slope_2);
    return max(max(_e8, _e11), max(_e15, _e18));
}

fn worldAt(uv: vec2<f32>, depth: f32) -> vec3<f32> {
    let _e3 = p.inverseViewProjection;
    let world = (_e3 * vec4<f32>(((uv.x * 2f) - 1f), (1f - (uv.y * 2f)), depth, 1f));
    return (world.xyz / vec3(world.w));
}

fn waterReflection(scene_1: vec3<f32>, uv_1: vec2<f32>, rawDepth: f32, dimensions_5: vec2<i32>, surfaceNormal: vec3<f32>) -> vec3<f32> {
    var local_1: bool;
    var previousDistance: f32 = 0.035f;
    var i: u32 = 0u;
    var local_2: bool;
    var local_3: bool;
    var local_4: bool;
    var low: f32;
    var high: f32;
    var hitUV: vec2<f32>;
    var hitDepth: f32;
    var hitDistance: f32;
    var refine: u32;
    var local_5: bool;
    var local_6: bool;

    let _e5 = p.water.y;
    if (_e5 <= 0f) {
        return scene_1;
    }
    let _e11 = worldAt(uv_1, rawDepth);
    let _e16 = p.water.x;
    let _e22 = p.caseStyle.w;
    if !((abs((_e11.y - _e16)) > _e22)) {
        let _e28 = p.eye.y;
        local_1 = (_e28 <= _e11.y);
    } else {
        local_1 = true;
    }
    let _e34 = local_1;
    if _e34 {
        return scene_1;
    }
    let _e37 = p.eye;
    let incident = normalize((_e11 - _e37.xyz));
    let normal = (surfaceNormal * select(-1f, 1f, (surfaceNormal.y >= 0f)));
    if (normal.y < 0.75f) {
        return scene_1;
    }
    let direction = reflect(incident, normal);
    let start = (_e11 + vec3<f32>(0f, 0.025f, 0f));
    let _e61 = p.water.w;
    let count = u32(_e61);
    loop {
        let _e64 = i;
        if (_e64 < 28u) {
        } else {
            break;
        }
        {
            let _e67 = i;
            if (_e67 >= count) {
                break;
            }
            let _e69 = i;
            let fraction_1 = (f32((_e69 + 1u)) / f32(count));
            let _e78 = p.water.z;
            let distance_ = (0.035f + ((_e78 * fraction_1) * fraction_1));
            let point_1 = (start + (direction * distance_));
            let _e87 = p.viewProjection;
            let clip = (_e87 * vec4<f32>(point_1, 1f));
            if (clip.w <= 0f) {
                break;
            }
            let projected = vec2<f32>((((clip.x / clip.w) * 0.5f) + 0.5f), (0.5f - ((clip.y / clip.w) * 0.5f)));
            if !(any((projected <= vec2(0.003f)))) {
                local_2 = any((projected >= vec2(0.997f)));
            } else {
                local_2 = true;
            }
            let _e121 = local_2;
            if _e121 {
                break;
            }
            let pixel_5 = clamp(vec2<i32>((projected * vec2<f32>(dimensions_5))), vec2(0i), (dimensions_5 - vec2(1i)));
            let _e132 = sceneDepth(pixel_5);
            let sampleUV = ((vec2<f32>(pixel_5) + vec2(0.5f)) / vec2<f32>(dimensions_5));
            let _e139 = worldAt(sampleUV, _e132);
            if (_e132 < 0.999999f) {
                let _e146 = p.water.x;
                let _e150 = p.caseStyle.w;
                local_3 = (_e139.y > (_e146 + _e150));
            } else {
                local_3 = false;
            }
            let _e156 = local_3;
            if _e156 {
                let _e158 = linearDepth(_e132);
                local_4 = (clip.w >= _e158);
            } else {
                local_4 = false;
            }
            let _e163 = local_4;
            if _e163 {
                let _e165 = previousDistance;
                low = _e165;
                high = distance_;
                hitUV = projected;
                hitDepth = _e132;
                hitDistance = clip.w;
                refine = 0u;
                loop {
                    let _e174 = refine;
                    if (_e174 < 5u) {
                    } else {
                        break;
                    }
                    {
                        let _e177 = low;
                        let _e178 = high;
                        let mid = ((_e177 + _e178) * 0.5f);
                        let _e184 = p.viewProjection;
                        let midClip = (_e184 * vec4<f32>((start + (direction * mid)), 1f));
                        let midUV = vec2<f32>((((midClip.x / midClip.w) * 0.5f) + 0.5f), (0.5f - ((midClip.y / midClip.w) * 0.5f)));
                        let midPixel = clamp(vec2<i32>((midUV * vec2<f32>(dimensions_5))), vec2(0i), (dimensions_5 - vec2(1i)));
                        let _e214 = sceneDepth(midPixel);
                        let _e216 = linearDepth(_e214);
                        if (midClip.w >= _e216) {
                            high = mid;
                            hitUV = midUV;
                            hitDepth = _e214;
                            hitDistance = midClip.w;
                        } else {
                            low = mid;
                        }
                    }
                    continuing {
                        let _e219 = refine;
                        refine = (_e219 + 1u);
                    }
                }
                let _e222 = hitDistance;
                let _e223 = hitDepth;
                let _e224 = linearDepth(_e223);
                let separation = (_e222 - _e224);
                let _e226 = hitUV;
                let _e227 = hitDepth;
                let _e228 = worldAt(_e226, _e227);
                if (separation >= 0f) {
                    local_5 = (separation < 0.35f);
                } else {
                    local_5 = false;
                }
                let _e236 = local_5;
                if _e236 {
                    let _e241 = p.water.x;
                    let _e245 = p.caseStyle.w;
                    local_6 = (_e228.y > (_e241 + _e245));
                } else {
                    local_6 = false;
                }
                let _e251 = local_6;
                if _e251 {
                    let _e253 = hitUV.x;
                    let _e255 = hitUV.x;
                    let _e260 = hitUV.y;
                    let _e262 = hitUV.y;
                    let edge = min(min(_e253, (1f - _e255)), min(_e260, (1f - _e262)));
                    let _e273 = p.water.z;
                    let _e279 = p.water.z;
                    let _e280 = high;
                    let confidence = (smoothstep(0.015f, 0.08f, edge) * (1f - smoothstep((_e273 * 0.7f), _e279, _e280)));
                    let fresnel = (0.55f + (0.45f * pow((1f - clamp(dot(-(incident), normal), 0f, 1f)), 5f)));
                    let _e298 = hitUV;
                    let _e302 = textureSampleLevel(sceneTexture, sceneSampler, _e298, 0f);
                    let reflected = _e302.xyz;
                    let _e312 = p.water.y;
                    return mix(scene_1, ((reflected * 0.88f) + (scene_1 * 0.12f)), ((_e312 * confidence) * fresnel));
                }
                return scene_1;
            }
            previousDistance = distance_;
        }
        continuing {
            let _e316 = i;
            i = (_e316 + 1u);
        }
    }
    return scene_1;
}

@vertex 
fn vs_main(@builtin(vertex_index) index: u32) -> FullscreenOutput {
    var x: f32 = -1f;
    var y: f32 = -1f;
    var out: FullscreenOutput;

    if (index == 1u) {
        x = 3f;
    }
    if (index == 2u) {
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
    var scene: vec3<f32>;
    var local: bool;

    let _e4 = textureSample(sceneTexture, sceneSampler, in.uv);
    scene = _e4.xyz;
    let dimensionsU = textureDimensions(depthTexture);
    let dimensions_6 = vec2<i32>(dimensionsU);
    let centerPixel = clamp(vec2<i32>((in.uv * vec2<f32>(dimensionsU))), vec2(0i), (dimensions_6 - vec2(1i)));
    let _e20 = sceneDepth(centerPixel);
    let _e22 = worldAt(in.uv, _e20);
    let _e23 = dpdx(_e22);
    let _e24 = dpdy(_e22);
    let surfaceNormal_1 = normalize(cross(_e23, _e24));
    let _e32 = p.caseStyle.x;
    if (in.uv.x < _e32) {
        let _e34 = scene;
        return vec4<f32>(_e34, 1f);
    }
    if (_e20 >= 0.999999f) {
        let _e39 = scene;
        return vec4<f32>(_e39, 1f);
    }
    let _e42 = scene;
    let _e44 = waterReflection(_e42, in.uv, _e20, dimensions_6, surfaceNormal_1);
    scene = _e44;
    let _e48 = p.caseStyle.y;
    if !((_e48 < 0.5f)) {
        let _e55 = p.edge.w;
        local = (_e55 <= 0f);
    } else {
        local = true;
    }
    let _e61 = local;
    if _e61 {
        let _e62 = scene;
        return vec4<f32>(_e62, 1f);
    }
    let _e65 = inkResolutionScale(dimensions_6);
    let _e66 = linearDepth(_e20);
    let distanceFade = smoothstep(24f, 70f, _e66);
    let _e73 = p.caseStyle.y;
    let radius_1 = max(1i, i32(round(((_e73 * _e65) * mix(1f, 0.48f, distanceFade)))));
    let coreRadius = max(1i, i32(round((f32(radius_1) * 0.76f))));
    let _e90 = surfaceDepthSlope(centerPixel, dimensions_6, _e66);
    let diagonal = max(1i, i32(round((f32(radius_1) * 0.707107f))));
    let _e99 = discontinuity(centerPixel, vec2<i32>(diagonal, diagonal), dimensions_6, _e66, _e90);
    let _e102 = discontinuity(centerPixel, vec2<i32>(diagonal, -(diagonal)), dimensions_6, _e66, _e90);
    let _e105 = discontinuity(centerPixel, vec2<i32>(-(diagonal), diagonal), dimensions_6, _e66, _e90);
    let _e109 = discontinuity(centerPixel, vec2<i32>(-(diagonal), -(diagonal)), dimensions_6, _e66, _e90);
    let _e110 = crossDiscontinuity(centerPixel, radius_1, dimensions_6, _e66, _e90);
    let outerGap = max(_e110, max(max(_e99, _e102), max(_e105, _e109)));
    let _e118 = p.depth.z;
    let _e122 = p.depth.w;
    let threshold = (_e118 + (_e66 * _e122));
    let _e128 = p.caseStyle.z;
    let responseEnd = (threshold * max(1.05f, _e128));
    let outer = smoothstep(threshold, responseEnd, outerGap);
    if (outer <= 0f) {
        let _e135 = scene;
        return vec4<f32>(_e135, 1f);
    }
    let _e138 = crossDiscontinuity(centerPixel, coreRadius, dimensions_6, _e66, _e90);
    let core = smoothstep(threshold, responseEnd, _e138);
    let paper = (vec2<f32>(centerPixel) / vec2(_e65));
    let _e146 = inkGrain((paper / vec2(18f)));
    let _e159 = inkGrain((vec2<f32>((paper.x + (paper.y * 0.24f)), (paper.y * 1.8f)) / vec2(3f)));
    let rim = (outer * mix(0.6f, 0.78f, _e159));
    let density = mix(0.92f, 1f, _e146);
    let _e172 = p.edge.w;
    let coverage = (((max(core, rim) * density) * _e172) * mix(1f, 0.3f, distanceFade));
    let _e180 = p.edge;
    let ink = (_e180.xyz * mix(0.88f, 1.06f, _e146));
    let _e186 = scene;
    let outlined = mix(_e186, ink, coverage);
    return vec4<f32>(outlined, 1f);
}
`},S=`ai-weapon-spirit:presentation-settings:v1`,C=`forgeax:presentation-settings-change`;function w(e){let t=[e.removeKeydown,e.removeMessage,e.disposePanel,e.disposePipeline,e.restoreDataset],n=new Uint8Array(t.length),r=!1;return async()=>{if(r)return;let e=[];for(let r=0;r<t.length;r+=1)if(n[r]!==1)try{await t[r](),n[r]=1}catch(t){t instanceof AggregateError?e.push(...t.errors):e.push(t)}if(e.length>0)throw AggregateError(e,`[presentation-settings] failed to dispose presentation settings`);r=!0}}var T=Object.freeze({outlineEnabled:!0,outlineRadius:4,outlineColor:`#162A2E`,outlineStrength:.75,waterReflectionsEnabled:!0,qualityPreset:`quality`,pcgDetail:1,particleDensity:1}),E=Object.freeze({performance:{pcgDetail:.55,particleDensity:.5},balanced:{pcgDetail:.8,particleDensity:.75},quality:{pcgDetail:1,particleDensity:1}});function D(e,t){return M(t===`custom`?{...e,qualityPreset:t}:{...e,qualityPreset:t,...E[t]})}var O=new Set,k;function A(e,t,n,r){let i=typeof e==`number`?e:Number(e);return Number.isFinite(i)?Math.max(n,Math.min(r,i)):t}function j(e){return typeof e==`string`&&/^#[0-9a-f]{6}$/i.test(e)?e.toUpperCase():T.outlineColor}function M(e){let t=e&&typeof e==`object`?e:{},n=t.qualityPreset;return Object.freeze({outlineEnabled:typeof t.outlineEnabled==`boolean`?t.outlineEnabled:T.outlineEnabled,outlineRadius:Math.round(A(t.outlineRadius,T.outlineRadius,0,6)),outlineColor:j(t.outlineColor),waterReflectionsEnabled:typeof t.waterReflectionsEnabled==`boolean`?t.waterReflectionsEnabled:T.waterReflectionsEnabled,outlineStrength:A(t.outlineStrength,T.outlineStrength,0,1),qualityPreset:n===`performance`||n===`balanced`||n===`quality`||n===`custom`?n:T.qualityPreset,pcgDetail:A(t.pcgDetail,T.pcgDetail,.25,2),particleDensity:A(t.particleDensity,T.particleDensity,0,2)})}function N(){if(k)return k;let e=typeof matchMedia==`function`&&matchMedia(`(pointer:coarse)`).matches,t=P(null,e);if(typeof localStorage>`u`)return k=t,k;try{k=P(JSON.parse(localStorage.getItem(`ai-weapon-spirit:presentation-settings:v1`)??`null`),e)}catch{k=t}return k}function P(e,t){let n=t?D(T,`performance`):T;return M(e&&typeof e==`object`?{...n,...e}:n)}function F(e){k=M(e);try{localStorage.setItem(S,JSON.stringify(k))}catch{}for(let e of O)e(k);window.dispatchEvent(new CustomEvent(C,{detail:k}))}function I(e){return[Number.parseInt(e.slice(1,3),16)/255,Number.parseInt(e.slice(3,5),16)/255,Number.parseInt(e.slice(5,7),16)/255]}function L(e){return e.hasResource(`ActiveCamera`)?e.getResource(`ActiveCamera`).entity:void 0}function R(e){let t=L(e),r;for(let i of e.query({read:[n]}).unwrap()){let e=i.get(n),a={near:Number(e.near),far:Number(e.far),depthMultisampled:Number(e.antialias)===2};if(r??=a,i.entity===t)return a}return r??{near:.1,far:180,depthMultisampled:!1}}function z(e,t=x.wgsl){if(!e)return t;let n=t.replace(/\btexture_depth_2d\b/,`texture_depth_multisampled_2d`);if(n===t)throw Error(`[presentation-settings] depth texture declaration is missing`);let r=/fn sceneDepth\([^}]*\}/;if(!r.test(n))throw Error(`[presentation-settings] sceneDepth helper is missing`);return n=n.replace(r,`fn sceneDepth(pixel: vec2<i32>) -> f32 {
    let samples = textureNumSamples(depthTexture);
    var sum = 0.0;
    for (var i = 0u; i < samples; i += 1u) { sum += textureLoad(depthTexture, pixel, i32(i)); }
    return sum / f32(samples);
  }`),n}function B(e,t,n){let r=I(e.outlineColor),i=new Float32Array(52);return i.set([t,n,.035,.003],0),i.set([r[0],r[1],r[2],e.outlineStrength],4),i.set([0,e.outlineEnabled?e.outlineRadius:0,2,0],8),new Uint8Array(i.buffer)}function V(e,t){let n=document.documentElement;n.dataset.forgeaxPresentationSettings=`shared-v1`,n.dataset.forgeaxPresentationPanel=t?`open`:`closed`,n.dataset.forgeaxPresentationShortcut=`F8`,n.dataset.forgeaxPresentationOutlineRadius=String(e.outlineRadius),n.dataset.forgeaxPresentationOutlineColor=e.outlineColor.slice(1).toLowerCase(),n.dataset.forgeaxPresentationOutlineStrength=String(Math.round(e.outlineStrength*100)),n.dataset.forgeaxPresentationQuality=e.qualityPreset,n.dataset.forgeaxPresentationPcgDetail=String(Math.round(e.pcgDetail*100)),n.dataset.forgeaxPresentationParticleDensity=String(Math.round(e.particleDensity*100)),n.dataset.forgeaxPresentationWaterReflections=e.waterReflectionsEnabled?`screen-space`:`off`}function H(e,t,n,r){let i=document.createElement(`aside`);i.className=`forgeax-presentation-settings`,i.hidden=!0,i.setAttribute(`aria-label`,`画面设置`),i.innerHTML=`
    <style>
      .forgeax-presentation-settings{position:absolute;inset:0;z-index:80;pointer-events:none;color:#edf5ef;font:12px/1.45 Inter,"PingFang SC","Microsoft YaHei",sans-serif}
      .forgeax-presentation-settings[hidden]{display:none}.forgeax-presentation-settings *{box-sizing:border-box}
      .forgeax-presentation-settings__panel{pointer-events:auto;position:absolute;right:16px;top:calc(16px + var(--forgeax-viewport-metrics-inset,0px));width:min(350px,calc(100% - 32px));max-height:calc(100% - 32px - var(--forgeax-viewport-metrics-inset,0px));overflow:auto;padding:14px;border:1px solid rgba(190,225,205,.3);border-radius:10px;background:rgba(8,18,16,.96);box-shadow:0 18px 48px rgba(0,0,0,.42)}
      .forgeax-presentation-settings header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.forgeax-presentation-settings h2{margin:0;font-size:15px}.forgeax-presentation-settings header p{margin:3px 0 0;color:#98aaa3;font-size:10px}
      .forgeax-presentation-settings button,.forgeax-presentation-settings select,.forgeax-presentation-settings input{font:inherit}.forgeax-presentation-settings button{border:1px solid rgba(190,225,205,.25);border-radius:5px;background:#1b2925;color:#edf5ef;cursor:pointer}.forgeax-presentation-settings__close{width:30px;height:30px}
      .forgeax-presentation-settings fieldset{display:grid;grid-template-columns:106px minmax(0,1fr) 48px;align-items:center;gap:8px 9px;margin:12px 0 0;padding:11px;border:1px solid rgba(190,225,205,.16);border-radius:8px}.forgeax-presentation-settings legend{padding:0 5px;color:#bde1cd;font-weight:700}.forgeax-presentation-settings output{text-align:right;color:#a9bbb4;font-variant-numeric:tabular-nums}.forgeax-presentation-settings input[type=range]{width:100%;accent-color:#bfe5c8}.forgeax-presentation-settings input[type=color]{width:100%;height:25px;padding:0;border:1px solid #8aa99b;border-radius:4px;background:transparent}.forgeax-presentation-settings select{min-width:0;height:28px;border:1px solid rgba(190,225,205,.25);border-radius:5px;background:#17231f;color:#edf5ef}.forgeax-presentation-settings__check{justify-self:start;width:16px;height:16px;accent-color:#8cd7ad}.forgeax-presentation-settings__foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:11px;color:#81958d;font-size:10px}.forgeax-presentation-settings__reset{padding:6px 9px}
    </style>
    <section class="forgeax-presentation-settings__panel">
      <header><div><h2>画面 <small>F8</small></h2><p>水墨勾边随分辨率调整，保留清楚厚实的轮廓。</p></div><button class="forgeax-presentation-settings__close" type="button" aria-label="关闭">×</button></header>
      <fieldset>
        <legend>轮廓可读性</legend>
        <label for="shared-outline-enabled">启用轮廓</label><input class="forgeax-presentation-settings__check" id="shared-outline-enabled" data-setting="outlineEnabled" type="checkbox"><output></output>
        <label for="shared-outline-radius">基准粗细</label><input id="shared-outline-radius" data-setting="outlineRadius" type="range" min="0" max="6" step="1" title="以此为基准，小分辨率适当收细，高分辨率加粗"><output data-output="outlineRadius"></output>
        <label for="shared-outline-color">轮廓颜色</label><input id="shared-outline-color" data-setting="outlineColor" type="color"><output data-output="outlineColor"></output>
        <label for="shared-outline-strength">边缘强度</label><input id="shared-outline-strength" data-setting="outlineStrength" type="range" min="0" max="100" step="1"><output data-output="outlineStrength"></output>
      </fieldset>
      <fieldset>
        <legend>场景与特效</legend>
        <label for="shared-quality-preset">质量预设</label><select id="shared-quality-preset" data-setting="qualityPreset"><option value="performance">性能</option><option value="balanced">平衡</option><option value="quality">高质量</option><option value="custom">自定义</option></select><output></output>
        <label for="shared-water-reflections">水面倒影</label><input class="forgeax-presentation-settings__check" id="shared-water-reflections" data-setting="waterReflectionsEnabled" type="checkbox"><output></output>
        <label for="shared-pcg-detail">场景细节</label><input id="shared-pcg-detail" data-setting="pcgDetail" type="range" min="25" max="200" step="5"><output data-output="pcgDetail"></output>
        <label for="shared-particle-density">粒子密度</label><input id="shared-particle-density" data-setting="particleDensity" type="range" min="0" max="200" step="5"><output data-output="particleDensity"></output>
      </fieldset>
      <div class="forgeax-presentation-settings__foot"><span>设置即时生效，自动保存。</span><button class="forgeax-presentation-settings__reset" type="button" style="flex:none;white-space:nowrap">恢复默认</button></div>
    </section>
  `;let a=e=>i.querySelector(`[data-setting="${e}"]`),o=e=>i.querySelector(`[data-output="${e}"]`),s=t,c=()=>{a(`outlineEnabled`).checked=s.outlineEnabled,a(`waterReflectionsEnabled`).checked=s.waterReflectionsEnabled,a(`outlineRadius`).value=String(s.outlineRadius),a(`outlineColor`).value=s.outlineColor.toLowerCase(),a(`outlineStrength`).value=String(Math.round(s.outlineStrength*100)),a(`qualityPreset`).value=s.qualityPreset,a(`pcgDetail`).value=String(Math.round(s.pcgDetail*100)),a(`particleDensity`).value=String(Math.round(s.particleDensity*100)),o(`outlineRadius`).value=`${s.outlineRadius}px`,o(`outlineColor`).value=s.outlineColor,o(`outlineStrength`).value=`${Math.round(s.outlineStrength*100)}%`,o(`pcgDetail`).value=`${Math.round(s.pcgDetail*100)}%`,o(`particleDensity`).value=`${Math.round(s.particleDensity*100)}%`},l=e=>{s=M({...s,...e}),c(),n(s)},u=e=>{let t=e.target,r=t.dataset.setting;if(r)if(r===`outlineEnabled`)l({outlineEnabled:t.checked});else if(r===`waterReflectionsEnabled`)l({waterReflectionsEnabled:t.checked});else if(r===`outlineRadius`)l({outlineRadius:Number(t.value)});else if(r===`outlineColor`)l({outlineColor:t.value});else if(r===`outlineStrength`)l({outlineStrength:Number(t.value)/100});else if(r===`qualityPreset`){let e=t.value;s=D(s,e),c(),n(s)}else r===`pcgDetail`?l({pcgDetail:Number(t.value)/100,qualityPreset:`custom`}):r===`particleDensity`&&l({particleDensity:Number(t.value)/100,qualityPreset:`custom`})},d=e=>{i.hidden=!e,V(s,e)},f=()=>{r?r.toggle(`presentation`):d(i.hidden===!0)},p=i.querySelector(`.forgeax-presentation-settings__close`),m=i.querySelector(`.forgeax-presentation-settings__reset`);i.addEventListener(`input`,u),i.addEventListener(`change`,u);let h=()=>{r?r.close():d(!1)},g=()=>l(T);p.addEventListener(`click`,h),m.addEventListener(`click`,g),c(),V(s,!1),e.appendChild(i);let _=r?e.querySelector(`:scope > [data-forgeax-viewport-metrics]`):null;if(_){let e=document.createElement(`section`);e.className=`spirit-menu__diagnostics`;let t=document.createElement(`h3`);t.textContent=`运行诊断`,e.append(t,_),i.querySelector(`.forgeax-presentation-settings__panel`).append(e)}let v=r?.register(`presentation`,{element:i,onVisibility:e=>V(s,e)}),y=!1;return{root:i,toggle:f,dispose:()=>{y||=(_?.isConnected&&e.append(_),v?.(),i.removeEventListener(`input`,u),i.removeEventListener(`change`,u),p.removeEventListener(`click`,h),m.removeEventListener(`click`,g),i.remove(),!0)}}}async function U(t,r,i){if(!r)return;if(!(r.renderer??r.app?.renderer))throw Error(`[presentation-settings] ForgeAX Renderer is required`);if(!r.renderFeatureHost)throw Error(`[presentation-settings] ForgeAX RenderFeatureHost is required`);let o=r.assets??r.assetRegistry;if(!o)throw Error(`[presentation-settings] ForgeAX AssetRegistry is required`);if(!r.uiRoot)throw Error(`[presentation-settings] ctx.uiRoot is required`);if(!r.registerCleanup)throw Error(`[presentation-settings] ctx.registerCleanup is required`);let s=N(),l=R(t),d=B(s,l.near,l.far),f=await b({assets:o,renderFeatureHost:r.renderFeatureHost,world:t,shaderSource:z(l.depthMultisampled),params:d}),m=new p;m.setStyle(d);let h=new c(t),g=s,_,v,y,x=document.documentElement.dataset,S=[`forgeaxPresentationSettings`,`forgeaxPresentationPanel`,`forgeaxPresentationShortcut`,`forgeaxPresentationOutlineRadius`,`forgeaxPresentationOutlineColor`,`forgeaxPresentationOutlineStrength`,`forgeaxPresentationQuality`,`forgeaxPresentationPcgDetail`,`forgeaxPresentationParticleDensity`,`forgeaxPresentationDepthSampling`,`forgeaxPresentationWaterReflections`],C=new Map(S.map(e=>[e,x[e]])),T=w({removeKeydown:()=>{v&&window.removeEventListener(`keydown`,v)},removeMessage:()=>{y&&window.removeEventListener(`message`,y)},disposePanel:()=>_?.dispose(),disposePipeline:async()=>{h.dispose(),await f.dispose()},restoreDataset:()=>{for(let e of S){let t=C.get(e);t===void 0?delete x[e]:x[e]=t}}});try{h.addSystem(e,{name:`ai-weapon-spirit-water-reflection-camera`,after:[`propagateTransforms`],queries:[{read:[n,a]}],fn:(e,[r])=>{let i=L(t),o;for(let e of r)if(o===void 0&&(o=e.entity),e.entity===i){o=e.entity;break}o!==void 0&&(m.update(t.get(o,n).unwrap(),t.get(o,a).unwrap().world,g.waterReflectionsEnabled&&!(t.hasResource(`weapon-spirit.title-state`)&&t.getResource(`weapon-spirit.title-state`).active)&&u(t),g.qualityPreset),f.setParams(m.bytes))}}),_=H(r.uiRoot,s,e=>{let n=R(t);g=e,m.setStyle(B(e,n.near,n.far)),f.setParams(m.bytes),F(e),V(e,_?.root.hidden===!1)},i),document.documentElement.dataset.forgeaxPresentationDepthSampling=l.depthMultisampled?`multisampled`:`single-sample`,v=e=>{if(!(i||e.repeat)){if(e.code!==`F8`){e.code===`Escape`&&_?.root.hidden===!1&&_.toggle();return}e.preventDefault(),_?.toggle()}},y=e=>{let t=new URLSearchParams(window.location.search).get(`parentOrigin`)||window.location.origin;e.origin!==t||e.data?.source!==`forgeax-presentation-settings`||e.data.type===`toggle`&&_?.toggle()},window.addEventListener(`keydown`,v),window.addEventListener(`message`,y),F(s),V(s,!1),r.registerCleanup(T)}catch(e){try{await T()}catch(t){throw AggregateError([e,t],`[presentation-settings] installation rollback failed`)}throw e}}export{h as n,f as r,U as t};