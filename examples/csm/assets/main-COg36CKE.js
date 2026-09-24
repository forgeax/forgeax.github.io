import{createApp as e,createFullscreenRenderFeature as t}from"/engine/0.0.0/a202a1b9076a2d9205b8ed304c16e10693d95b71/packages/app/dist/index.mjs";import{AssetGuid as n}from"/engine/0.0.0/a202a1b9076a2d9205b8ed304c16e10693d95b71/packages/pack/dist/guid.mjs";import{HANDLE_CUBE as r}from"/engine/0.0.0/a202a1b9076a2d9205b8ed304c16e10693d95b71/packages/assets-runtime/dist/index.mjs";import{Transform as i}from"/engine/0.0.0/a202a1b9076a2d9205b8ed304c16e10693d95b71/packages/scene/dist/index.mjs";import{Camera as a,DirectionalLight as o,DirectionalShadowFilterValue as s,Materials as c,MeshFilter as l,MeshRenderer as u,PostProcessParams as d,SpotLight as f,perspective as ee}from"/engine/0.0.0/a202a1b9076a2d9205b8ed304c16e10693d95b71/packages/render/dist/index.mjs";import{createPlaneGeometry as te}from"/engine/0.0.0/a202a1b9076a2d9205b8ed304c16e10693d95b71/packages/geometry/dist/index.mjs";import{unwrapHandle as p}from"/engine/0.0.0/a202a1b9076a2d9205b8ed304c16e10693d95b71/packages/types/dist/index.mjs";import{buildFrameModel as m,decodeTape as h,openReplay as g,replayDeviceRequest as _}from"/engine/0.0.0/a202a1b9076a2d9205b8ed304c16e10693d95b71/packages/rhi-debug/dist/index.mjs";import{createShaderModule as v,rhi as y}from"/engine/0.0.0/a202a1b9076a2d9205b8ed304c16e10693d95b71/packages/rhi-webgpu/dist/index.mjs";import{Time as b,Update as x}from"/engine/0.0.0/a202a1b9076a2d9205b8ed304c16e10693d95b71/packages/ecs/dist/index.mjs";import{INPUT_SNAPSHOT_RESOURCE_KEY as S}from"/engine/0.0.0/a202a1b9076a2d9205b8ed304c16e10693d95b71/packages/input/dist/index.mjs";import{quat as C,vec3 as w}from"/engine/0.0.0/a202a1b9076a2d9205b8ed304c16e10693d95b71/packages/math/dist/index.mjs";import"/engine/0.0.0/a202a1b9076a2d9205b8ed304c16e10693d95b71/packages/runtime/dist/index.mjs";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var T={schemaVersion:`runtime-asset-binding-v1`,gameId:`learn-render-5-3-3-csm`,scopeId:`learn-render-5-3-3-csm`,generation:1,status:`ready`,catalogUrl:`/__pack/scopes/learn-render-5-3-3-csm/1/catalog.json`,importUrlBase:`/__pack/scopes/learn-render-5-3-3-csm/1/import`,packageUrlBase:``},E=`/pack-index.json`,D=`forgeax: Vite Pack runtime binding is required in development; pass runtimeBinding to pluginPack()`,O=T;function k(){return!1}function A(){return typeof document>`u`?E:new URL(`pack-index.json`,document.baseURI).href}function ne(e=O){if(k())throw Error(D)}function re(e,t,n={}){if(n.isDevelopment??k()){if(t===void 0)throw Error(D);e.configureRuntimeBinding(t);return}t!==void 0&&e.configureRuntimeBinding(t),e.configurePackIndex(n.packIndexUrl??A())}function ie(){return{shaderManifestUrl:void 0,shaderIndexUrl:`/engine/0.0.0/a202a1b9076a2d9205b8ed304c16e10693d95b71/shaders/index.json`,shaderRequirementsUrl:`/examples/csm/shaders/requirements.json`,shaderManifestDeltaUrl:`/examples/csm/shaders/manifest.json`,importTransport:void 0,build:`d4217edc985f97517a2931bc9e875cb0d9a91f3b`}}async function j(e){let t=h(e);if(!t.ok)throw Error(`browser replay tape decode failed: ${t.error.code}`);let n=t.value,r=m(n).works.at(-1);if(r===void 0)throw Error(`browser replay tape has no workIndex entries`);let i=await y.requestAdapter();if(!i.ok)throw Error(`browser replay adapter request failed: ${i.error.code}`);let a=await i.value.requestDevice(_(n,i.value.features,i.value.limits));if(!a.ok)throw Error(`browser replay device request failed: ${a.error.code}`);let o=await g(n,{device:a.value,createShaderModule:v});if(!o.ok)throw Error(`browser replay session open failed: ${o.error.code}`);try{let e=await o.value.inspectWork(r.workIndex,[`pixels`]);if(!e.ok)throw Error(`browser replay inspectWork(${r.workIndex}) failed: ${e.error.code}`);let t=e.value.attachment;if(t?.kind!==`texture`||t.width===void 0||t.height===void 0)throw Error(`browser replay work attachment readback is unavailable`);return{pixels:t.bytes,width:t.width,height:t.height,workIndex:e.value.workIndex}}finally{await o.value.dispose()}}var M=2.5,N=89*Math.PI/180,ae=.002;Math.PI/4;function oe(e,t,n,r,i){let a=(i!==void 0&&i>0?i:M)*e,o=0,s=0,c=0;return r.w&&(o+=t.x*a,s+=t.y*a,c+=t.z*a),r.s&&(o-=t.x*a,s-=t.y*a,c-=t.z*a),r.a&&(o-=n.x*a,c-=n.z*a),r.d&&(o+=n.x*a,c+=n.z*a),r.q&&(s-=a),r.e&&(s+=a),{x:o,y:s,z:c}}var se=[0,0,-1],ce=[1,0,0];function le(e,t){let n=-Math.PI/2,r=0,o=C.create(),s=w.create(),c=w.create(),l=(e,i)=>{n+=i.mouse.movementDelta.x*ae,r-=i.mouse.movementDelta.y*ae,r>N&&(r=N),r<-N&&(r=-N),C.fromEuler(o,r,-(n+Math.PI/2),0,`YXZ`),C.transformVec3(s,o,se),C.transformVec3(c,o,ce);let a={x:s[0]??0,y:s[1]??0,z:s[2]??0};return{forward:a,displacement:oe(e,a,{x:c[0]??0,y:c[1]??0,z:c[2]??0},{w:i.keyboard.down(`w`),s:i.keyboard.down(`s`),a:i.keyboard.down(`a`),d:i.keyboard.down(`d`),q:i.keyboard.down(`q`),e:i.keyboard.down(`e`)},t.moveSpeed)}};t.flashlight?e.addSystem(x,{name:t.name,after:[`input-frame-start-scan`],queries:[{write:[i],with:[a]},{write:[i,f]}],fn:(e,t)=>{let n=e.getResource(S);if(n===void 0)return;let r=e.getResource(b).delta,{forward:a,displacement:s}=l(r,n),c=0,u=0,d=3;for(let e of t[0]){let t=e.mut(i);c=(t.pos[0]??0)+s.x,u=(t.pos[1]??0)+s.y,d=(t.pos[2]??0)+s.z,t.pos.set([c,u,d]),t.quat.set([o[0]??0,o[1]??0,o[2]??0,o[3]??1])}for(let e of t[1])e.mut(i).pos.set([c,u,d]),e.mut(f).direction.set([a.x,a.y,a.z])}}):e.addSystem(x,{name:t.name,after:[`input-frame-start-scan`],queries:[{write:[i],with:[a]}],fn:(e,t)=>{let n=e.getResource(S);if(n===void 0)return;let r=e.getResource(b).delta,{displacement:a}=l(r,n);for(let e of t[0]){let t=e.mut(i);t.pos.set([(t.pos[0]??0)+a.x,(t.pos[1]??0)+a.y,(t.pos[2]??0)+a.z]),t.quat.set([o[0]??0,o[1]??0,o[2]??0,o[3]??1])}}})}var ue={hash:`e182d5c9`,wgsl:`struct FullscreenOutput {
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
`},P=`learn-render-5-3-3-csm::overlay`,F=32,de=.1,I=50,fe=4,pe=.75,me={off:-1,all:0,c1:1,c2:2,c3:3,c4:4};function L(e){return e===`0`?`off`:e===`1`?`c1`:e===`2`?`c2`:e===`3`?`c3`:e===`4`?`c4`:null}function R(e=I){let t=fe,n=de,r=e,i=pe,a=r/n,o=new Float32Array(t);for(let e=1;e<=t;e++){let s=e/t,c=n*a**s,l=n+s*(r-n);o[e-1]=i*c+(1-i)*l}return o}function z(e,t){let n=new ArrayBuffer(F),r=new Float32Array(n);return r[0]=me[e],r[1]=0,r[2]=0,r[3]=0,r.set(t,4),new Uint8Array(n)}var he=t({identity:P,source:ue.wgsl,reads:[{key:`sceneColor`},{key:`depth`,sampleType:`depth`}],params:{byteSize:F,defaultValue:z(`all`,R())}}),B=null,V=null,H=R(),U=`all`;function ge(e,t=I){return H=R(t),U=`all`,V=e.spawn({component:d,data:{shader:P,data:z(`all`,H)}}).unwrap(),B=e,H}function W(e){return B===null||V===null?!1:(H=R(e),B.set(V,d,{data:z(U,H)}),!0)}function G(e){return B===null||V===null?!1:(U=e,B.set(V,d,{data:z(e,H)}),!0)}var _e={near:18,far:50,seam:50,motion:32,alpha:26,transparent:38,fallback:50};function ve(e){return _e[e]}Object.freeze([`off`,`pcf3`,`pcf5`,`pcss-medium`,`pcss-high`,`near-far`,`seam`,`motion-alpha-transparent-fallback`]);function ye(e,t){let n=(n,r,i,a,o)=>{let s=t?.profile===r&&t.scene===i?t.directionalShadow:void 0,c=s===void 0?`not-run`:s.requested===r&&(r===`off`||s.effective===r)&&s.graphGeneration>0&&s.deviceGeneration>=0?`pass`:`fail`;return{id:n,binding:{...e,profile:r,scene:i},expected:a,sceneFact:o,observed:s===void 0?`not-run`:JSON.stringify(s),verdict:c,confidence:s===void 0?`low`:s.graphGeneration>0&&s.deviceGeneration>=0?`high`:`medium`}};return Object.freeze([n(`off`,`off`,`near`,`no shadow pass; scene remains observable`,`castShadow=false; Directional shadow topology must be off`),n(`pcf3`,`pcf3`,`near`,`fixed PCF3; near blocker remains visible`,`near shadowDistance=18; PCF3 author fact`),n(`pcf5`,`pcf5`,`far`,`fixed PCF5; far blocker remains visible`,`far shadowDistance=50; PCF5 author fact`),n(`pcss-medium`,`pcssMedium`,`near`,`bounded medium PCSS penumbra`,`near; medium radius and penumbra limit`),n(`pcss-high`,`pcssHigh`,`far`,`bounded high PCSS penumbra`,`far; high radius and penumbra limit`),n(`near-far`,`pcssMedium`,`far`,`continuous near/far cascade coverage`,`far scene covers 50m shadowDistance`),n(`seam`,`pcssMedium`,`seam`,`continuous cascade seam blend`,`seam cascadeBlend=0.45`),n(`motion-alpha-transparent-fallback`,`pcssHigh`,`motion`,`motion, alpha, transparent, and fallback share one control and inspection entry`,`motion uses a distinct author control; alpha/transparent/fallback use the same inspection entry`)])}var be={pcf3:s.pcf3,pcf5:s.pcf5,pcssMedium:s.pcssMedium,pcssHigh:s.pcssHigh};function K(e,t,n){if(n===`off`){e.set(t,o,{castShadow:!1});return}e.set(t,o,{castShadow:!0,...Y,shadowFilter:be[n]})}function q(e,t,n){let r=ve(n);switch(n){case`near`:return e.set(t,o,{shadowDistance:r,cascadeBlend:.2}),r;case`far`:return e.set(t,o,{shadowDistance:r,cascadeBlend:.2}),r;case`seam`:return e.set(t,o,{shadowDistance:r,cascadeBlend:.45}),r;case`motion`:return e.set(t,o,{shadowDistance:r,cascadeBlend:.3}),r;case`alpha`:return e.set(t,o,{shadowDistance:r,cascadeBlend:.25}),r;case`transparent`:return e.set(t,o,{shadowDistance:r,cascadeBlend:.15}),r;case`fallback`:return e.set(t,o,{castShadow:!1}),r}}function xe(e,t,n){switch(n){case`force-csm-fixed-radius`:e.set(t,o,{shadowAngularRadius:1e-4});return;case`force-csm-remove-tile-clamp`:e.set(t,o,{mapSize:1});return;case`force-csm-capable-backend-pcf`:e.set(t,o,{shadowFilter:s.pcf3});return;case`force-csm-pcf5-pretends-pcss`:e.set(t,o,{shadowFilter:s.pcssMedium});return;case`force-csm-shadow-off-build-pass`:K(e,t,`off`);return;case`force-csm-clear-blocker-raw`:e.set(t,o,{shadowDistance:.2});return;default:return}}var Se=`019e3969-1d48-7c3b-ac24-6d68f457065f`,Ce=`019e3969-1d47-760f-982e-7bad1ffd969c`,J=50,we=-.5,Te=Math.sin(-Math.PI/4),Ee=Math.cos(-Math.PI/4),De=6,Oe=1.5,ke=Math.PI/4,Ae=.1,je=50,Y={cascadeCount:4,splitLambda:.75,cascadeBlend:.2,mapSize:2048,shadowDistance:50},Me=[{pos:[-2,.5,-1],scale:[1,1,1],tex:`wood`},{pos:[2,1,-4],scale:[1,2,1],tex:`metal`},{pos:[-3,.75,-8],scale:[1.5,1.5,1.5],tex:[1,.3,.3]},{pos:[3,.5,-12],scale:[1,1,1],tex:`wood`},{pos:[-1,1.5,-16],scale:[1,3,1],tex:[.3,1,.3]},{pos:[4,1,-22],scale:[2,2,2],tex:`metal`},{pos:[-4,.75,-28],scale:[1.5,1.5,1.5],tex:[.3,.3,1]},{pos:[1,1,-33],scale:[1,2,1],tex:`wood`},{pos:[-2,1.5,-38],scale:[2,3,2],tex:`metal`},{pos:[3,1,-40],scale:[1.5,2,1.5],tex:[1,1,.3]}],X=document.querySelector(`#app`);if(X===null)throw Error(`[learn-render 5.3.3 csm] missing <canvas id='app'> in index.html`);Ne(X).catch(e=>{Z(`csm.bootstrap.unhandled-rejection`,e)});function Z(e,t){Q(e);let n=t instanceof Error?t.message:String(t),r=globalThis;r.__forgeaxBootstrapFailure={stage:e,detail:n},console.error(`[learn-render 5.3.3 csm] bootstrap failed at ${e}: ${n}`)}function Q(e){let t=globalThis,n=performance.now(),r=t.__forgeaxBootstrapStage;t.__forgeaxBootstrapStage={name:e,startedAt:n,previousElapsedMs:r===void 0?0:n-r.startedAt}}async function Ne(t){Q(`csm.createApp`);let n=await e(t,{features:[he],...O===void 0?{}:{assetRuntimeBinding:O}},{...ie(),importTransport:ne(O)});if(Q(`csm.createApp.complete`),!n.ok){Z(`csm.createApp.failed`,n.error);return}let c=n.value,d=c.renderer,f=c.world;c.onError(e=>{console.error(`[learn-render 5.3.3 csm] app.onError:`,e.code,e.hint);let t=globalThis.__learnRenderErrors;t!==void 0&&t.push({code:e.code,hint:e.hint})});let m=c.assets;if(m===void 0){Z(`csm.assets.owner-unavailable`,`App asset owner is unavailable`);return}re(m,O),Q(`csm.assets.loadByGuid`),Q(`csm.assets.wood.loadByGuid`);let h=await $(m,Se);Q(`csm.assets.wood.loadByGuid.complete`),Q(`csm.assets.metal.loadByGuid`);let g=await $(m,Ce);if(Q(`csm.assets.metal.loadByGuid.complete`),Q(`csm.assets.loadByGuid.complete`),h===null||g===null){Z(`csm.assets.loadByGuid.failed`,`texture load returned no asset`);return}let _=f.allocSharedRef(`MaterialAsset`,{kind:`material`,passes:[{name:`Forward`,program:{module:`forgeax::default-standard-pbr`,fragmentEntry:`fs_main`},renderState:{tags:{LightMode:`Forward`},passKind:`forward`}},{name:`ShadowCaster`,program:{module:`forgeax::default-shadow-caster`},renderState:{tags:{LightMode:`ShadowCaster`},passKind:`shadow-caster`}}],values:{baseColorTexture:p(f.allocSharedRef(`TextureAsset`,h))}}),v=p(f.allocSharedRef(`TextureAsset`,h)),y=p(f.allocSharedRef(`TextureAsset`,g)),b=te(J,J);if(!b.ok){console.error(`[learn-render 5.3.3 csm] createPlaneGeometry failed:`,b.error);return}let x=f.allocSharedRef(`MeshAsset`,b.value);f.spawn({component:i,data:{pos:[0,we,0],quat:[Te,0,0,Ee]}},{component:l,data:{assetHandle:x}},{component:u,data:{materials:[_]}}).unwrap();for(let e of Me){let t=f.allocSharedRef(`MaterialAsset`,Re(e.tex,v,y));f.spawn({component:i,data:{pos:e.pos,quat:[0,0,0,1],scale:e.scale}},{component:l,data:{assetHandle:r}},{component:u,data:{materials:[t]}}).unwrap()}let S=f.spawn({component:o,data:{direction:[.3,-.9,-.3],color:[1,1,1],intensity:1,castShadow:!0,shadowFilter:s.pcf3,...Y}}).unwrap(),C=!0,w=Pe(new URLSearchParams(window.location.search))??`pcf3`,T=Fe(new URLSearchParams(window.location.search))??`near`,E=new URLSearchParams(window.location.search).get(`mvd-falsify`);C=w!==`off`,K(f,S,w);let D=q(f,S,T);xe(f,S,E);let k=f.spawn({component:i,data:{pos:[0,Oe,De]}},{component:a,data:ee({fov:ke,aspect:t.width/t.height,near:Ae,far:je})}).unwrap();le(c.world,{name:`learn-render-5.3.3-csm-first-person`,overrideBackend:void 0}),Q(`csm.app.start`);let A=c.start();if(Q(`csm.app.start.complete`),!A.ok){Z(`csm.app.start.failed`,A.error);return}let j=ge(f,D);console.warn(`[learn-render 5.3.3 csm] PSSM splits (demo recompute) = ${Array.from(j).map(e=>e.toFixed(2)).join(`, `)}`);let M=L(new URLSearchParams(window.location.search).get(`csm-highlight`)??``);M!==null&&(G(M),console.warn(`[learn-render 5.3.3 csm] query cascade overlay -> ${M}`)),window.addEventListener(`keydown`,e=>{let t=L(e.key);if(t!==null){e.preventDefault(),G(t),console.warn(`[learn-render 5.3.3 csm] cascade overlay -> ${t}`);return}if(e.key===` `||e.key===`Space`){e.preventDefault(),C?(K(f,S,`off`),C=!1,console.warn(`[learn-render 5.3.3 csm] shadow disabled via Space toggle`)):(K(f,S,w),q(f,S,T),C=!0,console.warn(`[learn-render 5.3.3 csm] shadow enabled via Space toggle`));return}let n={p:`pcssMedium`,o:`off`,3:`pcf3`,5:`pcf5`,m:`pcssMedium`,h:`pcssHigh`}[e.key.toLowerCase()];if(n!==void 0){w=n,K(f,S,n),q(f,S,T),C=n!==`off`,console.warn(`[learn-render 5.3.3 csm] MVD profile -> ${n}`);return}let r={n:`near`,f:`far`,s:`seam`,v:`motion`,a:`alpha`,t:`transparent`,b:`fallback`}[e.key.toLowerCase()];r!==void 0&&(T=r,q(f,S,r),console.warn(`[learn-render 5.3.3 csm] MVD scene -> ${r}`))}),window.addEventListener(`resize`,()=>{let e=devicePixelRatio;t.width=window.innerWidth*e,t.height=window.innerHeight*e,f.set(k,a,{aspect:window.innerWidth/window.innerHeight})}),console.warn(`[learn-render 5.3.3 csm] backend=${d.inspect().capabilities.backendKind}`);let N=d.attach(f);if(!N.ok){Z(`csm.renderer.attach.failed`,N.error);return}Le(t,c,f,N.value,S),Q(`csm.capture-hooks.complete`),Ie(c,()=>w,()=>T,e=>{w=e,K(f,S,e),W(q(f,S,T)),C=e!==`off`},e=>{T=e,W(q(f,S,e))})}function Pe(e){let t=e.get(`mvd-profile`);return t===`off`||t===`pcf3`||t===`pcf5`||t===`pcssMedium`||t===`pcssHigh`?t:null}function Fe(e){let t=e.get(`mvd-scene`);return t===`near`||t===`far`||t===`seam`||t===`motion`||t===`alpha`||t===`transparent`||t===`fallback`?t:null}function Ie(e,t,n,r,i){let a=window;a.__setCsmMvdProfile=r,a.__setCsmMvdScene=i,a.__inspectCsmMvd=()=>{let r=e.renderer.inspect(),i={profile:t(),scene:n(),backend:r.capabilities.backendKind,deviceGeneration:r.frame.deviceGeneration,graphGeneration:r.directionalShadow.graphGeneration};return{binding:i,expectations:ye(i,{profile:t(),scene:n(),directionalShadow:r.directionalShadow}),directionalShadow:r.directionalShadow}}}function Le(e,t,n,r,i){let a=window,s=t.renderer,c=()=>{n.update(1/60).unwrap();let e=s.draw({leases:[r],camera:{lease:r},environment:{lease:r}});if(!e.ok)throw e.error};a.__prepareCsmCapture=async()=>{n.set(i,o,{direction:[.300001,-.9,-.3]}),c(),n.set(i,o,{direction:[.3,-.9,-.3]})},a.__captureCsm=async()=>{let t=await createImageBitmap(e),n=new OffscreenCanvas(e.width,e.height).getContext(`2d`);if(n===null)throw Error(`[learn-render 5.3.3 csm] capture context missing`);return n.drawImage(t,0,0),t.close(),new Uint8Array(n.getImageData(0,0,e.width,e.height).data)},a.__replayCsmCapture=j}async function $(e,t){let r=n.parse(t);if(!r.ok)return console.error(`[learn-render 5.3.3 csm] GUID parse failed:`,t),null;let i=await e.loadByGuid(r.value);if(!i.ok){let e=globalThis.__learnRenderErrors;return e!==void 0&&e.push({code:i.error.code,hint:i.error.hint}),console.error(`[learn-render 5.3.3 csm] loadByGuid failed:`,i.error.code),null}return i.value}function Re(e,t,n){if(e===`wood`||e===`metal`)return{kind:`material`,passes:[{name:`Forward`,program:{module:`forgeax::default-standard-pbr`,fragmentEntry:`fs_main`},renderState:{tags:{LightMode:`Forward`},passKind:`forward`}},{name:`ShadowCaster`,program:{module:`forgeax::default-shadow-caster`},renderState:{tags:{LightMode:`ShadowCaster`},passKind:`shadow-caster`}}],values:{baseColorTexture:e===`wood`?t:n}};let[r,i,a]=e;return c.standard({baseColor:[r,i,a,1]})}