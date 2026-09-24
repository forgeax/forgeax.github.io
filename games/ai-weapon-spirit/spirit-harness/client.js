function R(e){throw new Error(`web boot: unknown index injection row ${JSON.stringify(e)}`)}async function m(e,t){for(let r of e)switch(r.kind){case"global":globalThis[r.name]=r.value;break;case"script":{let o=document.createElement("script");o.textContent=r.text,(r.placement==="head"?document.head:document.body).append(o);break}case"script-src":await t(r.src);break;case"script-preload":break;case"style":{let o=document.createElement("style");o.textContent=r.text,document.head.append(o);break}case"html":(r.placement==="head"?document.head:document.body).insertAdjacentHTML("beforeend",r.html);break;default:R(r)}}var D="vfs-image.tar.gz",N=1,Y="fixtures.json";function x(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)?e:void 0}function L(e){let t=x(e);if(t?.version!==1||!Array.isArray(t.fixtures))throw new Error(`preview fixture manifest must use version ${String(1)}`);let r=[],o=new Set;for(let n of t.fixtures){let i=x(n),a=i?.id,c=i?.label,d=i?.description,p=i?.overlays,l=Array.isArray(p)?p.filter(u=>typeof u=="string"&&u.length>0):[];if(typeof a!="string"||!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(a)||a==="none"||a==="webfs"||typeof c!="string"||c.length===0||typeof d!="string"||d.length===0||!Array.isArray(p)||p.length===0||l.length!==p.length)throw new Error("preview fixture manifest contains an invalid fixture entry");if(o.has(a))throw new Error(`preview fixture manifest repeats id "${a}"`);o.add(a),r.push({id:a,label:c,description:d,overlays:l})}let s=t.defaultFixture;if(s!==null&&(typeof s!="string"||!o.has(s)))throw new Error("preview fixture manifest defaultFixture does not name a fixture");return{version:1,defaultFixture:s,fixtures:r}}var f=class extends Error{dshRemoteStreamFailure;constructor(e,t){super(e.message,t),this.name="TunnelLogicalStreamError",this.dshRemoteStreamFailure=e.kind==="remote"?{kind:"remote",code:e.code,details:e.details}:{kind:"carrier"}}},_=class{frames=[];wake;failed=!1;failure;push(e){this.failed||(this.frames.push(e),this.wake?.(),this.wake=void 0)}fail(e){this.failed||(this.failed=!0,this.failure=e,this.frames.length=0,this.wake?.(),this.wake=void 0)}async next(){for(;this.frames.length===0;){if(this.failed)throw this.failure;await new Promise(e=>{this.wake=e})}return this.frames.shift()}},T=500,k=new TextEncoder,w=/\/\/# sourceMappingURL=([^\r\n]+)\s*$/,y=32*1024;function $(e){let t=k.encode(e),r="";for(let o=0;o<t.length;o+=y)r+=String.fromCharCode(...t.subarray(o,o+y));return btoa(r)}async function U(e,t,r){let o=w.exec(e);if(o?.[1]===void 0)return e;try{let s=await r(new URL(o[1],new URL(t,globalThis.location.origin)));if(!s.ok)return e.replace(w,"");let n=`data:application/json;charset=utf-8;base64,${$(await s.text())}`;return e.replace(w,`//# sourceMappingURL=${n}`)}catch{return e.replace(w,"")}}function A(e){if(e!=null){if(typeof e=="string")return k.encode(e).buffer;if(e instanceof Blob||e instanceof ReadableStream||e instanceof ArrayBuffer)return e;if(ArrayBuffer.isView(e))return e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength);throw new Error(`web-preview tunnel: unsupported request body ${Object.prototype.toString.call(e)}`)}}var F=new Set([101,204,205,304]),I=class{worker;nextId=1;unary=new Map;bodyStreams=new Map;logicalStreams=new Map;inFlight=new Map;releases=new Map;constructor(e){this.worker=e,e.addEventListener("message",t=>{this.receive(t.data)}),e.addEventListener("error",t=>{let r=new Error(`web-preview tunnel: worker failed: ${t.message}`);for(let s of this.inFlight.keys())this.warnRefusal(s,`worker failed: ${t.message}`);this.inFlight.clear();for(let s of this.unary.values())s.reject(r);this.unary.clear();for(let s of this.bodyStreams.values())s.error(r);this.bodyStreams.clear();let o=new f({kind:"carrier",message:`web-preview tunnel: worker failed: ${t.message}`},{cause:r});for(let{inbox:s}of this.logicalStreams.values())s.fail(o);this.logicalStreams.clear();for(let s of this.releases.values())s();this.releases.clear()})}init(e,t=[]){this.worker.postMessage({t:"init",image:e,overlays:t})}fetch=async(e,t)=>{let r=t?.signal;if(r?.aborted===!0)throw new DOMException("The operation was aborted.","AbortError");let o=this.nextId++,s=t?.body===void 0||t.body===null?void 0:A(t.body),n={t:"req",id:o,method:t?.method??"GET",url:new URL(e,globalThis.location.origin).toString(),headers:Object.fromEntries(new Headers(t?.headers).entries()),...s===void 0?{}:{body:s}},i=new Promise((c,d)=>{this.unary.set(o,{resolve:c,reject:d})});if(this.inFlight.set(o,`${n.method} ${n.url}`),s instanceof ReadableStream?this.worker.postMessage(n,[s]):this.worker.postMessage(n),r==null)return await i;let a=this.rejectOnAbort(o,r);try{let c=await Promise.race([i,a.rejected]);return this.bodyStreams.has(o)&&this.observeStreamAbort(o,r),c}finally{a.release()}};async*open(e,t,r,o){r.throwIfAborted();let s=this.nextId++,n=new _,i={inbox:n,pump:void 0},a=!1,c=!1,d=()=>{n.fail(r.reason)};r.addEventListener("abort",d,{once:!0}),this.logicalStreams.set(s,i),this.inFlight.set(s,`STREAM ${e}`);try{let p={t:"stream-open",id:s,endpoint:e,payload:t};try{this.worker.postMessage(p),a=!0}catch(l){throw new f({kind:"carrier",message:`web-preview tunnel: failed to open Remote stream ${e}`},{cause:l})}for(o!==void 0&&(i.pump=this.pumpUplink(s,o,r,n));;){let l=await n.next();if(r.throwIfAborted(),l.t==="stream-item"){yield l.value;continue}if(c=!0,l.t==="stream-error")throw new f(l.failure);return}}finally{r.removeEventListener("abort",d),this.logicalStreams.delete(s),this.inFlight.delete(s),i.pump?.stop(),a&&!c&&this.abortWorkerOperation(s),i.pump!==void 0&&await i.pump.done}}pumpUplink(e,t,r,o){let s=Promise.withResolvers(),n=t[Symbol.asyncIterator](),i={active:!0,released:!1},a=()=>{i.released||(i.released=!0,Promise.resolve(n.return?.()).catch(()=>{}))};return{done:this.forwardUplink(e,n,s.promise,()=>i.active&&!r.aborted).then(c=>{i.released||=c},c=>{o.fail(c)}).then(a),stop:()=>{i.active=!1,s.resolve({value:void 0,done:!0}),a()}}}async forwardUplink(e,t,r,o){for(;;){let s=await Promise.race([t.next(),r]);if(!o())return!1;if(s.done===!0)break;this.worker.postMessage({t:"stream-uplink-item",id:e,value:s.value})}return this.worker.postMessage({t:"stream-uplink-end",id:e}),!0}async bootPayload(){let e=await this.fetch("/__boot__");if(!e.ok)throw new Error(`web-preview tunnel: boot payload failed with HTTP ${String(e.status)}: ${await e.text()}`);return await e.json()}async loadBundle(e){let t=await this.fetch(e);if(!t.ok)throw new Error(`web-preview tunnel: bundle ${e} failed with HTTP ${String(t.status)}`);let r=await U(await t.text(),e,this.fetch),o=URL.createObjectURL(new Blob([r],{type:"text/javascript"}));try{await new Promise((s,n)=>{let i=document.createElement("script");i.src=o,i.addEventListener("load",()=>{i.remove(),s()},{once:!0}),i.addEventListener("error",()=>{i.remove(),n(new Error(`web-preview tunnel: bundle ${e} failed to execute`))},{once:!0}),document.head.append(i)})}finally{URL.revokeObjectURL(o)}}rejectOnAbort(e,t){let r=()=>{};return{rejected:new Promise((o,s)=>{let n=()=>{s(this.abortRequest(e))};if(t.aborted){n();return}t.addEventListener("abort",n,{once:!0}),r=()=>{t.removeEventListener("abort",n)}}),release:r}}abortRequest(e){this.unary.delete(e);let t=this.bodyStreams.get(e);this.bodyStreams.delete(e),this.inFlight.delete(e),this.releases.delete(e),this.abortWorkerOperation(e);let r=new DOMException("The operation was aborted.","AbortError");return t?.error(r),r}observeStreamAbort(e,t){let r=()=>{this.abortRequest(e)};t.addEventListener("abort",r,{once:!0}),this.releases.set(e,()=>{t.removeEventListener("abort",r)})}releaseSignal(e){let t=this.releases.get(e);this.releases.delete(e),t?.()}cancelStream(e){this.releaseSignal(e),this.bodyStreams.delete(e),this.inFlight.delete(e),this.abortWorkerOperation(e)}abortWorkerOperation(e){let t={t:"abort",id:e};try{this.worker.postMessage(t)}catch{}}warnRefusal(e,t){console.warn(`web-preview tunnel: request ${String(e)} ${this.inFlight.get(e)??"(unknown request)"} \u2192 ${t}`)}receive(e){switch(e.t){case"res":{let t=this.unary.get(e.id);if(t===void 0)return;e.status>=T&&this.warnRefusal(e.id,`HTTP ${String(e.status)}${e.message===void 0?"":`: ${e.message}`}`),this.unary.delete(e.id),this.inFlight.delete(e.id);let r=F.has(e.status)?null:e.body??e.message??null;t.resolve(new Response(r,{status:e.status,headers:e.headers}));return}case"res-head":{let t=this.unary.get(e.id);if(t===void 0)return;this.unary.delete(e.id);let r=new ReadableStream({start:o=>{this.bodyStreams.set(e.id,o)},cancel:()=>{this.cancelStream(e.id)}});t.resolve(new Response(r,{status:e.status,headers:e.headers}));return}case"res-chunk":this.bodyStreams.get(e.id)?.enqueue(new Uint8Array(e.chunk));return;case"res-end":{let t=this.bodyStreams.get(e.id);if(t===void 0)return;this.bodyStreams.delete(e.id),this.inFlight.delete(e.id),this.releaseSignal(e.id),t.close();return}case"res-err":{let t=new Error(`web-preview tunnel: ${e.message}`);this.warnRefusal(e.id,`res-err: ${e.message}`);let r=this.unary.get(e.id);if(this.inFlight.delete(e.id),r!==void 0){this.unary.delete(e.id),r.reject(t);return}let o=this.bodyStreams.get(e.id);if(o===void 0)return;this.bodyStreams.delete(e.id),this.releaseSignal(e.id),o.error(t);return}case"stream-item":case"stream-end":case"stream-error":{let t=this.logicalStreams.get(e.id);if(t===void 0)return;t.inbox.push(e),e.t!=="stream-item"&&t.pump?.stop();return}default:throw new Error(`web-preview tunnel: unknown frame ${JSON.stringify(e)}`)}}},b="none",M="webfs",O="preview-fixture",P=`
  [data-preview-source-chooser] {
    position: fixed;
    inset: 0;
    z-index: 1200;
    display: grid;
    place-items: center;
    overflow: auto;
    padding: 24px;
    box-sizing: border-box;
    color: #0f1115;
    background: #fff;
    font-size: 14px;
    line-height: 22px;
  }
  [data-preview-source-card] {
    width: min(600px, 100%);
    max-height: calc(100dvh - 48px);
    box-sizing: border-box;
    padding: 28px;
    overflow-y: auto;
    border: 1px solid transparent;
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 0 1px rgb(0 0 0 / 20%), 0 12px 32px rgb(0 0 0 / 8%);
  }
  [data-preview-source-card] h1 {
    margin: 0;
    font-size: 20px;
    line-height: 28px;
    font-weight: 500;
  }
  [data-preview-source-card] > p {
    margin: 8px 0 0;
    color: #61666b;
  }
  [data-preview-source-card] fieldset {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin: 24px 0 0;
    padding: 0;
    border: 0;
  }
  [data-preview-source-card] legend {
    margin: 0 0 8px;
    padding: 0 4px;
    color: #61666b;
    font-size: 13px;
    line-height: 20px;
    font-weight: 500;
  }
  [data-preview-source-option] {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-height: 56px;
    padding: 8px 12px 8px 8px;
    box-sizing: border-box;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    cursor: pointer;
    transition: background-color 120ms ease, border-color 120ms ease;
  }
  [data-preview-source-option]:hover:not(:has(input:disabled)),
  [data-preview-source-option]:has(input:checked) {
    background: rgb(38 49 72 / 6%);
  }
  [data-preview-source-option]:has(input:checked) {
    border-color: rgb(0 0 0 / 10%);
  }
  [data-preview-source-option]:has(input:disabled) {
    cursor: default;
    opacity: 0.4;
  }
  [data-preview-source-option] input {
    flex: none;
    width: 16px;
    height: 16px;
    margin: 4px 0 0;
    accent-color: #0f1115;
  }
  [data-preview-source-option] > span { flex: 1; min-width: 0; }
  [data-preview-source-option] strong {
    display: block;
    font-size: 14px;
    line-height: 24px;
    font-weight: 500;
  }
  [data-preview-source-option] strong + span {
    display: block;
    color: #81858c;
    font-size: 14px;
    line-height: 24px;
  }
  [data-preview-source-submit] {
    display: block;
    min-width: 120px;
    height: 36px;
    margin: 24px 0 0 auto;
    padding: 0 14px;
    border: 0;
    border-radius: 18px;
    color: #fff;
    background: #0f1115;
    font-size: 14px;
    line-height: 22px;
    cursor: pointer;
    transition: background-color 120ms ease;
  }
  [data-preview-source-submit]:hover:not(:disabled) {
    background: #43454a;
  }
  [data-preview-source-submit]:focus-visible {
    outline: 2px solid rgb(0 0 0 / 16%);
    outline-offset: 2px;
  }
  [data-preview-source-submit]:disabled { cursor: not-allowed; opacity: 0.5; }
  @media (prefers-color-scheme: dark) {
    [data-preview-source-chooser] {
      color: #f9fafb;
      background: #151517;
    }
    [data-preview-source-card] { border-color: rgb(255 255 255 / 6%); background: #2c2c2e; }
    [data-preview-source-card] > p, [data-preview-source-card] legend { color: #cfd3d6; }
    [data-preview-source-option] strong + span { color: #adb2b8; }
    [data-preview-source-option]:hover:not(:has(input:disabled)),
    [data-preview-source-option]:has(input:checked) { background: rgb(255 255 255 / 8%); }
    [data-preview-source-option]:has(input:checked) { border-color: rgb(255 255 255 / 12%); }
    [data-preview-source-option] input { accent-color: #f9fafb; }
    [data-preview-source-submit] { color: #0f1115; background: #f9fafb; }
    [data-preview-source-submit]:hover:not(:disabled) { background: #ebeef2; }
    [data-preview-source-submit]:focus-visible { outline-color: rgb(255 255 255 / 20%); }
  }
  @media (max-width: 560px) {
    [data-preview-source-card] { padding: 24px; }
    [data-preview-source-submit] { width: 100%; }
  }
  @media (prefers-reduced-motion: reduce) {
    [data-preview-source-option], [data-preview-source-submit] { transition: none; }
  }
`,j={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function S(e){return e.replace(/[&<>"']/g,t=>j[t]??t)}function B(e,t){return`<label data-preview-source-option>
    <input type="radio" name="preview-source" value="${e.id}"${e.id===t?" checked":""}${e.disabled===!0?" disabled":""}>
    <span>
      <strong>${S(e.label)}</strong>
      <span>${S(e.description)}</span>
    </span>
  </label>`}function z(e,t){return e.map(r=>({id:r.id,label:r.label,description:r.description,overlays:r.overlays.map(o=>new URL(o,t))}))}async function H(e){let t=new URL(location.href).searchParams.get(O);if(t===b)return[];let r=await fetch(e);if(!r.ok)throw new Error(`preview source chooser: fixture manifest returned ${String(r.status)}`);let o=L(await r.json()),s=[{id:b,label:"Empty environment",description:"Load only the base runtime to verify first launch and workspace creation.",overlays:[]},...z(o.fixtures,e),{id:M,label:"WebFS directory",description:"Requires directory access and will be available after the WebFS provider lands.",overlays:[],disabled:!0}];if(t!==null){let u=s.find(h=>h.id===t&&h.disabled!==!0);if(u===void 0)throw new Error(`preview source chooser: unknown or interactive source "${t}"`);return u.overlays}let n=document.getElementById("root");if(n===null)throw new Error("preview source chooser: missing #root");let i=o.defaultFixture??b,a=document.createElement("style");a.dataset.previewSourceStyle="",a.textContent=P,document.head.append(a);let c=document.createElement("main");c.dataset.previewSourceChooser="",c.innerHTML=`<form data-preview-source-card aria-labelledby="preview-source-title">
      <h1 id="preview-source-title">Choose Preview data</h1>
      <p>Data mounts before the Worker and application start. Refresh to choose again.</p>
      <fieldset>
        <legend>Filesystem source</legend>
        ${s.map(u=>B(u,i)).join("")}
      </fieldset>
      <button data-preview-source-submit type="submit">Start Preview</button>
    </form>`,n.prepend(c);let d=c.querySelector("[data-preview-source-card]");if(d===null)throw new Error("preview source chooser: form was not rendered");let p=await new Promise((u,h)=>{d.addEventListener("submit",E=>{E.preventDefault();let g=new FormData(d).get("preview-source");typeof g=="string"?u(g):h(new Error("preview source chooser: no source selected"))},{once:!0})}),l=s.find(u=>u.id===p&&u.disabled!==!0);if(l===void 0)throw new Error(`preview source chooser: unavailable source "${p}"`);return c.remove(),a.remove(),l.overlays}function v(){return globalThis.__DSH_BOOT_READY__??=Promise.withResolvers()}function W(){v().promise.catch(()=>{})}async function V(e={}){W();let t=new URL(e.image??"vfs-image.tar.gz",document.baseURI),r=new URL(e.fixtureManifest??"fixtures.json",t);try{return{overlays:await H(r)}}catch(o){throw v().reject(o),o}}async function G(e,t){let r=v();r.promise.catch(()=>{});try{let o=new I(e);o.init(new URL(t?.image??"vfs-image.tar.gz",document.baseURI).href,(t?.overlays??[]).map(n=>new URL(n,document.baseURI).href));let s=await o.bootPayload();return globalThis.__DSH_TRANSPORT__={fetch:(n,i)=>o.fetch(n,i),openStream:(n,i,a,c)=>o.open(n,i,a,c),loadBundle:n=>o.loadBundle(n),ownsHost:!0},globalThis.__DSH_FILE_UPLOAD__={fetch:(n,i)=>o.fetch(n,i)},await m(s.injections,n=>o.loadBundle(n)),r.resolve(),{worker:e,tunnel:o,loadBundle:n=>o.loadBundle(n)}}catch(o){throw r.reject(o),o}}export{D as IMAGE_FILE_NAME,Y as PREVIEW_FIXTURE_MANIFEST_FILE,N as PREVIEW_FIXTURE_MANIFEST_VERSION,I as WorkerTunnel,m as applyIndexInjections,V as chooseWorkerHostSource,G as connectWorkerHost,L as parsePreviewFixtureManifest};
