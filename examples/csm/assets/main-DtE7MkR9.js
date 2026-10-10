import{packages as e}from"/engine/0.0.0/763b989e00f9c558b2edb26c35255f17e36ef67c/sdk.min.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var t={schemaVersion:`runtime-asset-binding-v1`,gameId:`learn-render-5-3-3-csm`,scopeId:`learn-render-5-3-3-csm`,generation:1,status:`ready`,catalogUrl:`/__pack/scopes/learn-render-5-3-3-csm/1/catalog.json`,importUrlBase:`/__pack/scopes/learn-render-5-3-3-csm/1/import`,packageUrlBase:``},n=`/pack-index.json`,r=`forgeax: Vite Pack runtime binding is required in development; pass runtimeBinding to pluginPack()`,i=t;function a(){return!1}function o(){return typeof document>`u`?n:new URL(`pack-index.json`,document.baseURI).href}function s(e=i){if(a())throw Error(r)}function c(e,t,n={}){if(n.isDevelopment??a()){if(t===void 0)throw Error(r);e.configureRuntimeBinding(t);return}let i=n.packIndexUrl??o();e.configurePackIndex(i),t!==void 0&&e.configureRuntimeBinding(t,{retainCatalog:!0})}function l(){return{shaderManifestUrl:void 0,shaderIndexUrl:`/engine/0.0.0/763b989e00f9c558b2edb26c35255f17e36ef67c/shaders/index.json`,shaderEngineSha:`763b989e00f9c558b2edb26c35255f17e36ef67c`,shaderRequirementsUrl:`/examples/csm/shaders/requirements.json`,shaderManifestDeltaUrl:`/examples/csm/shaders/manifest.json`,importTransport:void 0,build:`aedf5734adee814a73b91382cbdb8b89edc27749`}}var{buildFrameModel:u,decodeTape:d,openReplay:f,replayDeviceRequest:p}=e[`@forgeax/engine-rhi-debug`],{createShaderModule:m,rhi:h}=e[`@forgeax/engine-rhi-webgpu`];async function g(e){let t=d(e);if(!t.ok)throw Error(`browser replay tape decode failed: ${t.error.code}`);let n=t.value,r=u(n).works.at(-1);if(r===void 0)throw Error(`browser replay tape has no workIndex entries`);let i=await h.requestAdapter();if(!i.ok)throw Error(`browser replay adapter request failed: ${i.error.code}`);let a=await i.value.requestDevice(p(n,i.value.features,i.value.limits));if(!a.ok)throw Error(`browser replay device request failed: ${a.error.code}`);let o=await f(n,{device:a.value,createShaderModule:m});if(!o.ok)throw Error(`browser replay session open failed: ${o.error.code}`);try{let e=await o.value.inspectWork(r.workIndex,[`pixels`]);if(!e.ok)throw Error(`browser replay inspectWork(${r.workIndex}) failed: ${e.error.code}`);let t=e.value.attachment;if(t?.kind!==`texture`||t.width===void 0||t.height===void 0)throw Error(`browser replay work attachment readback is unavailable`);return{pixels:t.bytes,width:t.width,height:t.height,workIndex:e.value.workIndex}}finally{await o.value.dispose()}}var{Time:_,Update:v}=e[`@forgeax/engine-ecs`],{createApp:y,inputPlugin:b}=e[`@forgeax/engine-app`],{World:ee}=e[`@forgeax/engine-ecs`],{INPUT_BACKEND_KEY:te,INPUT_SNAPSHOT_RESOURCE_KEY:x}=e[`@forgeax/engine-input`],{quat:S,vec3:C}=e[`@forgeax/engine-math`],{Camera:w,SpotLight:T}=e[`@forgeax/engine-render`],{createRenderer:ne,EngineEnvironmentError:re}=e[`@forgeax/engine-runtime`],{Transform:E}=e[`@forgeax/engine-scene`],ie=2.5,D=89*Math.PI/180,ae=.002;Math.PI/4;function oe(e,t,n,r,i){let a=(i!==void 0&&i>0?i:ie)*e,o=0,s=0,c=0;return r.w&&(o+=t.x*a,s+=t.y*a,c+=t.z*a),r.s&&(o-=t.x*a,s-=t.y*a,c-=t.z*a),r.a&&(o-=n.x*a,c-=n.z*a),r.d&&(o+=n.x*a,c+=n.z*a),r.q&&(s-=a),r.e&&(s+=a),{x:o,y:s,z:c}}var O=[0,0,-1],se=[1,0,0];function ce(e,t){let n=-Math.PI/2,r=0,i=!t.preserveInitialOrientation,a=S.create(),o=C.create(),s=C.create(),c=e=>{i||=(S.transformVec3(o,e,O),r=Math.asin(Math.max(-1,Math.min(1,o[1]??0))),n=-Math.atan2(-(o[0]??0),-(o[2]??-1))-Math.PI/2,!0)},l=(e,i)=>{n+=i.mouse.movementDelta.x*ae,r-=i.mouse.movementDelta.y*ae,r>D&&(r=D),r<-D&&(r=-D),S.fromEuler(a,r,-(n+Math.PI/2),0,`YXZ`),S.transformVec3(o,a,O),S.transformVec3(s,a,se);let c={x:o[0]??0,y:o[1]??0,z:o[2]??0};return{forward:c,displacement:oe(e,c,{x:s[0]??0,y:s[1]??0,z:s[2]??0},{w:i.keyboard.down(`w`),s:i.keyboard.down(`s`),a:i.keyboard.down(`a`),d:i.keyboard.down(`d`),q:i.keyboard.down(`q`),e:i.keyboard.down(`e`)},t.moveSpeed)}};t.flashlight?e.addSystem(v,{name:t.name,after:[`input-frame-start-scan`],queries:[{write:[E],with:[w]},{write:[E,T]}],fn:(e,t)=>{let n=e.getResource(x);if(n===void 0)return;for(let e of t[0]){c(e.mut(E).quat);break}let r=e.getResource(_).delta,{forward:i,displacement:o}=l(r,n),s=0,u=0,d=3;for(let e of t[0]){let t=e.mut(E);s=(t.pos[0]??0)+o.x,u=(t.pos[1]??0)+o.y,d=(t.pos[2]??0)+o.z,t.pos.set([s,u,d]),t.quat.set([a[0]??0,a[1]??0,a[2]??0,a[3]??1])}for(let e of t[1])e.mut(E).pos.set([s,u,d]),e.mut(T).direction.set([i.x,i.y,i.z])}}):e.addSystem(v,{name:t.name,after:[`input-frame-start-scan`],queries:[{write:[E],with:[w]}],fn:(e,t)=>{let n=e.getResource(x);if(n===void 0)return;for(let e of t[0]){c(e.mut(E).quat);break}let r=e.getResource(_).delta,{displacement:i}=l(r,n);for(let e of t[0]){let t=e.mut(E);t.pos.set([(t.pos[0]??0)+i.x,(t.pos[1]??0)+i.y,(t.pos[2]??0)+i.z]),t.quat.set([a[0]??0,a[1]??0,a[2]??0,a[3]??1])}}})}var le={hash:`e182d5c9`,wgsl:`struct FullscreenOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

struct PostProcessParams {
    tintMode: f32,
    fakeDepth: f32,
    _pad: vec2<f32>,
    splits: vec4<f32>,
}

const TINT_STRENGTH: f32 = 0.45f;
const CAMERA_NEAR: f32 = 0.1f;
const CAMERA_FAR: f32 = 50f;

@group(1) @binding(0) 
var sceneTexture: texture_2d<f32>;
@group(1) @binding(1) 
var sceneSampler: sampler;
@group(1) @binding(2) 
var<uniform> p: PostProcessParams;
@group(1) @binding(3) 
var depthTex: texture_depth_2d;
@group(1) @binding(4) 
var depthSampler: sampler;

fn cascadeColor(band_1: i32) -> vec3<f32> {
    if (band_1 == 0i) {
        return vec3<f32>(0.2f, 0.85f, 0.3f);
    }
    if (band_1 == 1i) {
        return vec3<f32>(0.95f, 0.85f, 0.2f);
    }
    if (band_1 == 2i) {
        return vec3<f32>(0.95f, 0.55f, 0.15f);
    }
    return vec3<f32>(0.9f, 0.25f, 0.2f);
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

@fragment 
fn fs_main(in: FullscreenOutput) -> @location(0) vec4<f32> {
    var viewDepth: f32;
    var band: i32 = 3i;
    var amount: f32 = TINT_STRENGTH;
    var local: bool;

    let _e6 = textureSample(sceneTexture, sceneSampler, in.uv);
    let scene = _e6.xyz;
    let _e10 = p.tintMode;
    if (_e10 < -0.5f) {
        return vec4<f32>(scene, 1f);
    }
    let _e17 = p.fakeDepth;
    if (_e17 > 0.5f) {
        viewDepth = CAMERA_FAR;
    } else {
        let ndcDepth = textureSample(depthTex, depthSampler, in.uv);
        viewDepth = (5f / (CAMERA_FAR - (ndcDepth * 49.9f)));
    }
    let splitA = p.splits.x;
    let splitB = p.splits.y;
    let splitC = p.splits.z;
    let _e44 = viewDepth;
    if (_e44 <= splitA) {
        band = 0i;
    } else {
        let _e48 = viewDepth;
        if (_e48 <= splitB) {
            band = 1i;
        } else {
            let _e51 = viewDepth;
            if (_e51 <= splitC) {
                band = 2i;
            } else {
                band = 3i;
            }
        }
    }
    let _e57 = p.tintMode;
    let single = i32(round(_e57));
    let _e60 = band;
    let _e61 = cascadeColor(_e60);
    if (single >= 1i) {
        local = (single <= 4i);
    } else {
        local = false;
    }
    let _e69 = local;
    if _e69 {
        let _e70 = band;
        if (_e70 != (single - 1i)) {
            amount = 0.0675f;
        }
    }
    let _e76 = amount;
    let outColor = mix(scene, _e61, _e76);
    return vec4<f32>(outColor, 1f);
}
`},{createFullscreenRenderFeature:ue}=e[`@forgeax/engine-app`],{PostProcessParams:k}=e[`@forgeax/engine-render`],A=`learn-render-5-3-3-csm::overlay`,j=32,de=.1,M=50,fe=4,pe=.75,me={off:-1,all:0,c1:1,c2:2,c3:3,c4:4};function N(e){return e===`0`?`off`:e===`1`?`c1`:e===`2`?`c2`:e===`3`?`c3`:e===`4`?`c4`:null}function P(e=M){let t=fe,n=de,r=e,i=pe,a=r/n,o=new Float32Array(t);for(let e=1;e<=t;e++){let s=e/t,c=n*a**s,l=n+s*(r-n);o[e-1]=i*c+(1-i)*l}return o}function F(e,t){let n=new ArrayBuffer(j),r=new Float32Array(n);return r[0]=me[e],r[1]=0,r[2]=0,r[3]=0,r.set(t,4),new Uint8Array(n)}var he=ue({identity:A,source:le.wgsl,reads:[{key:`sceneColor`},{key:`depth`,sampleType:`depth`}],params:{byteSize:j,defaultValue:F(`all`,P())}}),I=null,L=null,R=P(),z=`all`;function ge(e,t=M){return R=P(t),z=`all`,L=e.spawn({component:k,data:{shader:A,data:F(`all`,R)}}).unwrap(),I=e,R}function B(e){return I===null||L===null?!1:(R=P(e),I.set(L,k,{data:F(z,R)}),!0)}function V(e){return I===null||L===null?!1:(z=e,I.set(L,k,{data:F(e,R)}),!0)}var{createApp:_e}=e[`@forgeax/engine-app`],{AssetGuid:ve}=e[`@forgeax/engine-pack/guid`],{AssetRegistry:ye,HANDLE_CUBE:be}=e[`@forgeax/engine-assets-runtime`],{Transform:H}=e[`@forgeax/engine-scene`],{Camera:U,DirectionalLight:W,DirectionalShadowFilterValue:G,MeshFilter:K,MeshRenderer:q}=e[`@forgeax/engine-render`],{perspective:xe}=e[`@forgeax/engine-render`],{Materials:Se}=e[`@forgeax/engine-render`],{createPlaneGeometry:Ce}=e[`@forgeax/engine-geometry`],{unwrapHandle:J}=e[`@forgeax/engine-types`],we={near:18,far:50,seam:50,motion:32,alpha:26,transparent:38,fallback:50};function Te(e){return we[e]}Object.freeze([`off`,`pcf3`,`pcf5`,`pcss-medium`,`pcss-high`,`near-far`,`seam`,`motion-alpha-transparent-fallback`]);function Ee(e,t){let n=(n,r,i,a,o)=>{let s=t?.profile===r&&t.scene===i?t.directionalShadow:void 0,c=s===void 0?`not-run`:s.requested===r&&(r===`off`||s.effective===r)&&s.graphGeneration>0&&s.deviceGeneration>=0?`pass`:`fail`;return{id:n,binding:{...e,profile:r,scene:i},expected:a,sceneFact:o,observed:s===void 0?`not-run`:JSON.stringify(s),verdict:c,confidence:s===void 0?`low`:s.graphGeneration>0&&s.deviceGeneration>=0?`high`:`medium`}};return Object.freeze([n(`off`,`off`,`near`,`no shadow pass; scene remains observable`,`castShadow=false; Directional shadow topology must be off`),n(`pcf3`,`pcf3`,`near`,`fixed PCF3; near blocker remains visible`,`near shadowDistance=18; PCF3 author fact`),n(`pcf5`,`pcf5`,`far`,`fixed PCF5; far blocker remains visible`,`far shadowDistance=50; PCF5 author fact`),n(`pcss-medium`,`pcssMedium`,`near`,`bounded medium PCSS penumbra`,`near; medium radius and penumbra limit`),n(`pcss-high`,`pcssHigh`,`far`,`bounded high PCSS penumbra`,`far; high radius and penumbra limit`),n(`near-far`,`pcssMedium`,`far`,`continuous near/far cascade coverage`,`far scene covers 50m shadowDistance`),n(`seam`,`pcssMedium`,`seam`,`continuous cascade seam blend`,`seam cascadeBlend=0.45`),n(`motion-alpha-transparent-fallback`,`pcssHigh`,`motion`,`motion, alpha, transparent, and fallback share one control and inspection entry`,`motion uses a distinct author control; alpha/transparent/fallback use the same inspection entry`)])}var De={pcf3:G.pcf3,pcf5:G.pcf5,pcssMedium:G.pcssMedium,pcssHigh:G.pcssHigh};function Y(e,t,n){if(n===`off`){e.set(t,W,{castShadow:!1});return}e.set(t,W,{castShadow:!0,...ze,shadowFilter:De[n]})}function X(e,t,n){let r=Te(n);switch(n){case`near`:return e.set(t,W,{shadowDistance:r,cascadeBlend:.2}),r;case`far`:return e.set(t,W,{shadowDistance:r,cascadeBlend:.2}),r;case`seam`:return e.set(t,W,{shadowDistance:r,cascadeBlend:.45}),r;case`motion`:return e.set(t,W,{shadowDistance:r,cascadeBlend:.3}),r;case`alpha`:return e.set(t,W,{shadowDistance:r,cascadeBlend:.25}),r;case`transparent`:return e.set(t,W,{shadowDistance:r,cascadeBlend:.15}),r;case`fallback`:return e.set(t,W,{castShadow:!1}),r}}function Oe(e,t,n){switch(n){case`force-csm-fixed-radius`:e.set(t,W,{shadowAngularRadius:1e-4});return;case`force-csm-remove-tile-clamp`:e.set(t,W,{mapSize:1});return;case`force-csm-capable-backend-pcf`:e.set(t,W,{shadowFilter:G.pcf3});return;case`force-csm-pcf5-pretends-pcss`:e.set(t,W,{shadowFilter:G.pcssMedium});return;case`force-csm-shadow-off-build-pass`:Y(e,t,`off`);return;case`force-csm-clear-blocker-raw`:e.set(t,W,{shadowDistance:.2});return;default:return}}var ke=`019e3969-1d48-7c3b-ac24-6d68f457065f`,Ae=`019e3969-1d47-760f-982e-7bad1ffd969c`,Z=50,je=-.5,Me=Math.sin(-Math.PI/4),Ne=Math.cos(-Math.PI/4),Pe=6,Fe=1.5,Ie=Math.PI/4,Le=.1,Re=50,ze={cascadeCount:4,splitLambda:.75,cascadeBlend:.2,mapSize:2048,shadowDistance:50},Be=[{pos:[-2,.5,-1],scale:[1,1,1],tex:`wood`},{pos:[2,1,-4],scale:[1,2,1],tex:`metal`},{pos:[-3,.75,-8],scale:[1.5,1.5,1.5],tex:[1,.3,.3]},{pos:[3,.5,-12],scale:[1,1,1],tex:`wood`},{pos:[-1,1.5,-16],scale:[1,3,1],tex:[.3,1,.3]},{pos:[4,1,-22],scale:[2,2,2],tex:`metal`},{pos:[-4,.75,-28],scale:[1.5,1.5,1.5],tex:[.3,.3,1]},{pos:[1,1,-33],scale:[1,2,1],tex:`wood`},{pos:[-2,1.5,-38],scale:[2,3,2],tex:`metal`},{pos:[3,1,-40],scale:[1.5,2,1.5],tex:[1,1,.3]}],Ve=document.querySelector(`#app`);if(Ve===null)throw Error(`[learn-render 5.3.3 csm] missing <canvas id='app'> in index.html`);He(Ve).catch(e=>{Q(`csm.bootstrap.unhandled-rejection`,e)});function Q(e,t){$(e);let n=t instanceof Error?t.message:String(t),r=globalThis;r.__forgeaxBootstrapFailure={stage:e,detail:n},console.error(`[learn-render 5.3.3 csm] bootstrap failed at ${e}: ${n}`)}function $(e){let t=globalThis,n=performance.now(),r=t.__forgeaxBootstrapStage;t.__forgeaxBootstrapStage={name:e,startedAt:n,previousElapsedMs:r===void 0?0:n-r.startedAt}}async function He(e){$(`csm.createApp`);let t=await _e(e,{features:[he],...i===void 0?{}:{assetRuntimeBinding:i}},{...l(),importTransport:s(i)});if($(`csm.createApp.complete`),!t.ok){Q(`csm.createApp.failed`,t.error);return}let n=t.value,r=n.renderer,a=n.world;n.onError(e=>{console.error(`[learn-render 5.3.3 csm] app.onError:`,e.code,e.hint);let t=globalThis.__learnRenderErrors;t!==void 0&&t.push({code:e.code,hint:e.hint})});let o=n.assets;if(o===void 0){Q(`csm.assets.owner-unavailable`,`App asset owner is unavailable`);return}c(o,i),$(`csm.assets.loadByGuid`),$(`csm.assets.wood.loadByGuid`);let u=await qe(o,ke);$(`csm.assets.wood.loadByGuid.complete`),$(`csm.assets.metal.loadByGuid`);let d=await qe(o,Ae);if($(`csm.assets.metal.loadByGuid.complete`),$(`csm.assets.loadByGuid.complete`),u===null||d===null){Q(`csm.assets.loadByGuid.failed`,`texture load returned no asset`);return}let f=a.allocSharedRef(`MaterialAsset`,{kind:`material`,passes:[{name:`Forward`,program:{module:`forgeax::default-standard-pbr`,fragmentEntry:`fs_main`},renderState:{tags:{LightMode:`Forward`},passKind:`forward`}},{name:`ShadowCaster`,program:{module:`forgeax::default-shadow-caster`},renderState:{tags:{LightMode:`ShadowCaster`},passKind:`shadow-caster`}}],values:{baseColorTexture:J(a.allocSharedRef(`TextureAsset`,u))}}),p=J(a.allocSharedRef(`TextureAsset`,u)),m=J(a.allocSharedRef(`TextureAsset`,d)),h=Ce(Z,Z);if(!h.ok){console.error(`[learn-render 5.3.3 csm] createPlaneGeometry failed:`,h.error);return}let g=a.allocSharedRef(`MeshAsset`,h.value);a.spawn({component:H,data:{pos:[0,je,0],quat:[Me,0,0,Ne]}},{component:K,data:{assetHandle:g}},{component:q,data:{materials:[f]}}).unwrap();for(let e of Be){let t=a.allocSharedRef(`MaterialAsset`,Je(e.tex,p,m));a.spawn({component:H,data:{pos:e.pos,quat:[0,0,0,1],scale:e.scale}},{component:K,data:{assetHandle:be}},{component:q,data:{materials:[t]}}).unwrap()}let _=a.spawn({component:W,data:{direction:[.3,-.9,-.3],color:[1,1,1],intensity:1,castShadow:!0,shadowFilter:G.pcf3,...ze}}).unwrap(),v=!0,y=Ue(new URLSearchParams(window.location.search))??`pcf3`,b=We(new URLSearchParams(window.location.search))??`near`,ee=new URLSearchParams(window.location.search).get(`mvd-falsify`);v=y!==`off`,Y(a,_,y);let te=X(a,_,b);Oe(a,_,ee);let x=a.spawn({component:H,data:{pos:[0,Fe,Pe]}},{component:U,data:xe({fov:Ie,aspect:e.width/e.height,near:Le,far:Re})}).unwrap();ce(n.world,{name:`learn-render-5.3.3-csm-first-person`,overrideBackend:void 0}),$(`csm.app.start`);let S=n.start();if($(`csm.app.start.complete`),!S.ok){Q(`csm.app.start.failed`,S.error);return}let C=ge(a,te);console.warn(`[learn-render 5.3.3 csm] PSSM splits (demo recompute) = ${Array.from(C).map(e=>e.toFixed(2)).join(`, `)}`);let w=N(new URLSearchParams(window.location.search).get(`csm-highlight`)??``);w!==null&&(V(w),console.warn(`[learn-render 5.3.3 csm] query cascade overlay -> ${w}`)),window.addEventListener(`keydown`,e=>{let t=N(e.key);if(t!==null){e.preventDefault(),V(t),console.warn(`[learn-render 5.3.3 csm] cascade overlay -> ${t}`);return}if(e.key===` `||e.key===`Space`){e.preventDefault(),v?(Y(a,_,`off`),v=!1,console.warn(`[learn-render 5.3.3 csm] shadow disabled via Space toggle`)):(Y(a,_,y),X(a,_,b),v=!0,console.warn(`[learn-render 5.3.3 csm] shadow enabled via Space toggle`));return}let n={p:`pcssMedium`,o:`off`,3:`pcf3`,5:`pcf5`,m:`pcssMedium`,h:`pcssHigh`}[e.key.toLowerCase()];if(n!==void 0){y=n,Y(a,_,n),X(a,_,b),v=n!==`off`,console.warn(`[learn-render 5.3.3 csm] MVD profile -> ${n}`);return}let r={n:`near`,f:`far`,s:`seam`,v:`motion`,a:`alpha`,t:`transparent`,b:`fallback`}[e.key.toLowerCase()];r!==void 0&&(b=r,X(a,_,r),console.warn(`[learn-render 5.3.3 csm] MVD scene -> ${r}`))}),window.addEventListener(`resize`,()=>{let t=devicePixelRatio;e.width=window.innerWidth*t,e.height=window.innerHeight*t,a.set(x,U,{aspect:window.innerWidth/window.innerHeight})}),console.warn(`[learn-render 5.3.3 csm] backend=${r.inspect().capabilities.backendKind}`);let T=r.attach(a);if(!T.ok){Q(`csm.renderer.attach.failed`,T.error);return}Ke(e,n,a,T.value,_),$(`csm.capture-hooks.complete`),Ge(n,()=>y,()=>b,e=>{y=e,Y(a,_,e),B(X(a,_,b)),v=e!==`off`},e=>{b=e,B(X(a,_,e))})}function Ue(e){let t=e.get(`mvd-profile`);return t===`off`||t===`pcf3`||t===`pcf5`||t===`pcssMedium`||t===`pcssHigh`?t:null}function We(e){let t=e.get(`mvd-scene`);return t===`near`||t===`far`||t===`seam`||t===`motion`||t===`alpha`||t===`transparent`||t===`fallback`?t:null}function Ge(e,t,n,r,i){let a=window;a.__setCsmMvdProfile=r,a.__setCsmMvdScene=i,a.__inspectCsmMvd=()=>{let r=e.renderer.inspect(),i={profile:t(),scene:n(),backend:r.capabilities.backendKind,deviceGeneration:r.frame.deviceGeneration,graphGeneration:r.directionalShadow.graphGeneration};return{binding:i,expectations:Ee(i,{profile:t(),scene:n(),directionalShadow:r.directionalShadow}),directionalShadow:r.directionalShadow}}}function Ke(e,t,n,r,i){let a=window,o=t.renderer,s=()=>{n.update(1/60).unwrap();let e=o.draw({leases:[r],camera:{lease:r},environment:{lease:r}});if(!e.ok)throw e.error};a.__prepareCsmCapture=async()=>{n.set(i,W,{direction:[.300001,-.9,-.3]}),s(),n.set(i,W,{direction:[.3,-.9,-.3]})},a.__captureCsm=async()=>{let t=await createImageBitmap(e),n=new OffscreenCanvas(e.width,e.height).getContext(`2d`);if(n===null)throw Error(`[learn-render 5.3.3 csm] capture context missing`);return n.drawImage(t,0,0),t.close(),new Uint8Array(n.getImageData(0,0,e.width,e.height).data)},a.__replayCsmCapture=g}async function qe(e,t){let n=ve.parse(t);if(!n.ok)return console.error(`[learn-render 5.3.3 csm] GUID parse failed:`,t),null;let r=await e.loadByGuid(n.value);if(!r.ok){let e=globalThis.__learnRenderErrors;return e!==void 0&&e.push({code:r.error.code,hint:r.error.hint}),console.error(`[learn-render 5.3.3 csm] loadByGuid failed:`,r.error.code),null}return r.value}function Je(e,t,n){if(e===`wood`||e===`metal`)return{kind:`material`,passes:[{name:`Forward`,program:{module:`forgeax::default-standard-pbr`,fragmentEntry:`fs_main`},renderState:{tags:{LightMode:`Forward`},passKind:`forward`}},{name:`ShadowCaster`,program:{module:`forgeax::default-shadow-caster`},renderState:{tags:{LightMode:`ShadowCaster`},passKind:`shadow-caster`}}],values:{baseColorTexture:e===`wood`?t:n}};let[r,i,a]=e;return Se.standard({baseColor:[r,i,a,1]})}