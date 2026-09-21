var e={sampleCount:161144,seed:20260810,bareMix:{lo:.25190558,hi:.49452854,loPercentile:55,hiPercentile:90},valleyShade:{lo:.20194142,hi:.40320529,loPercentile:10,hiPercentile:80}},t=[`iceCap`,`dry`,`highland`,`beach`,`grassland`],n={version:1,amplitude:4.05,byRegion:{grassland:{baseElevation:.22,roughness:.08,landformOps:[`flat`]},highland:{baseElevation:.54,roughness:.38,landformOps:[`peak`,`ridge`]},dry:{baseElevation:.3,roughness:.24,landformOps:[`dune`]},beach:{baseElevation:.07,roughness:.025,landformOps:[`flat`]},iceCap:{baseElevation:.24,roughness:.07,landformOps:[`dune`]}},provenance:{user_stated:["草原给 `flat`/低 roughness，高地给 `peak`+`ridge`，干旱区给 `dune`，海滩给 `flat`，冰盖给 `dune`+低振幅。"],defaulted:[`baseElevation、roughness 与 amplitude 是 Stage 2 首版保守手调值；terrain gate 负责量测验证。`,`区域噪声使用 WorldClaw field.py 的 (2, 5, 9) 三频与 0.5^k 权重。`]}},r=e=>{let t=Math.hypot(e[0],e[1],e[2])||1;return[e[0]/t,e[1]/t,e[2]/t]},i=[r([1,.2,.1]),r([-.65,.45,.25]),r([.1,-.55,-.8]),r([-.2,-.75,.45]),r([.55,.55,-.5]),r([-.8,-.15,-.5])];function a(e){let t=-1;for(let n=0;n<i.length;n++){let r=i[n],a=.09*Math.sin(e[0]*11+n*2.1)+.07*Math.sin(e[1]*17-e[2]*9+n);t=Math.max(t,e[0]*r[0]+e[1]*r[1]+e[2]*r[2]+a-(n%2?.69:.64))}return t}var o=e=>e-Math.floor(e);function s(e,t,n){let r=o(e*.1031),i=o(t*.1031),a=o(n*.1031),s=r*(i+33.33)+i*(a+33.33)+a*(r+33.33);return r+=s,i+=s,a+=s,o((r+i)*a)}function c(e,t,n){let r=Math.floor(e),i=Math.floor(t),a=Math.floor(n),o=e-r,c=t-i,l=n-a,u=o*o*(3-2*o),d=c*c*(3-2*c),f=l*l*(3-2*l),p=(e,t,n)=>s(r+e,i+t,a+n),m=p(0,0,0)+(p(1,0,0)-p(0,0,0))*u,h=p(0,1,0)+(p(1,1,0)-p(0,1,0))*u,g=p(0,0,1)+(p(1,0,1)-p(0,0,1))*u,_=p(0,1,1)+(p(1,1,1)-p(0,1,1))*u,v=m+(h-m)*d;return v+(g+(_-g)*d-v)*f}function l(e,t,n){let r=0,i=.5,a=e,o=t,s=n;for(let e=0;e<4;e++)r+=i*c(a,o,s),a*=2.03,o*=2.03,s*=2.03,i*=.5;return r}var u=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)},d={ice:{lo:.905,hi:.975,frequency:4.5,jitter:.1},dry:{lo:.52,hi:.66,frequency:3.2,offset:[11,3,7]},highland:{lo:.46,hi:.6,broadFrequency:1.65,detailFrequency:3.3,broadWeight:.72,offsetA:[23,17,31],offsetB:[5,29,13],coreLo:.02,coreHi:.14},beach:{lo:.02,hi:.05},land:{lo:0,hi:.02}};function f(e){let n=S(e),r=u(d.ice.lo,d.ice.hi,Math.abs(e[1])+(l(e[0]*d.ice.frequency,e[1]*d.ice.frequency,e[2]*d.ice.frequency)-.5)*d.ice.jitter),i=u(d.dry.lo,d.dry.hi,l(e[0]*d.dry.frequency+d.dry.offset[0],e[1]*d.dry.frequency+d.dry.offset[1],e[2]*d.dry.frequency+d.dry.offset[2])),a=d.highland.broadWeight*l(e[0]*d.highland.broadFrequency+d.highland.offsetA[0],e[1]*d.highland.broadFrequency+d.highland.offsetA[1],e[2]*d.highland.broadFrequency+d.highland.offsetA[2])+(1-d.highland.broadWeight)*l(e[0]*d.highland.detailFrequency+d.highland.offsetB[0],e[1]*d.highland.detailFrequency+d.highland.offsetB[1],e[2]*d.highland.detailFrequency+d.highland.offsetB[2]),o=u(d.highland.lo,d.highland.hi,a)*u(d.highland.coreLo,d.highland.coreHi,n),s=n>0?1-u(d.beach.lo,d.beach.hi,n):0,c=u(d.land.lo,d.land.hi,n)*(1-i)*(1-o)*(1-r)*(1-s),f={iceCap:r,dry:i,highland:o,beach:s,grassland:c},p=t.reduce((e,t)=>e+f[t],0);return p<=1e-9?{iceCap:0,dry:0,highland:0,beach:0,grassland:1}:{iceCap:r/p,dry:i/p,highland:o/p,beach:s/p,grassland:c/p}}var p=[2,5,9],m=.002,h=e=>[e*.1031,e*.11369,e*.13787];function g(e,t,n,r){let i=0,a=.5,o=[e[0]*t,e[1]*t,e[2]*t];for(let e=0;e<n;e++){let t=h(r+e*131);i+=a*c(o[0]+t[0],o[1]+t[1],o[2]+t[2]),o=[o[0]*2.03,o[1]*2.03,o[2]*2.03],a*=.5}return i}function _(e,t,n,r){let i=0,a=.5,o=[e[0]*t,e[1]*t,e[2]*t];for(let e=0;e<n;e++){let t=h(r+e*77);i+=a*(1-Math.abs(c(o[0]+t[0],o[1]+t[1],o[2]+t[2])*2-1)),o=[o[0]*2.11,o[1]*2.11,o[2]*2.11],a*=.5}return i}function v(e,t,n){switch(e){case`peak`:return Math.max(0,_(t,2.7,4,n))**2.2;case`dune`:return _(t,16.5,3,n)*.7;case`terrace`:{let e=g(t,3.9,4,n);return Math.floor(e*6)/6+e*6%1*.12/6}case`erosion`:return-Math.max(_(t,7.8,4,n+991)-.55,0)*1.8;case`ridge`:return _(t,5.1,4,n+313);case`flat`:return 0}}function y(e,t,n){let r=0;for(let i=0;i<p.length;i++)r+=t.roughness*.5**i*(g(e,p[i],4,7+n*17+i)-.5);let i=t.landformOps.length>0?t.landformOps:[`flat`],a=0;for(let t of i)a+=v(t,e,7+n*53);return a/=i.length,t.baseElevation+r+a*t.roughness*1.4}function b(e){let r=f(e),i=0;for(let a=0;a<t.length;a++){let o=t[a],s=r[o];s<=m||(i+=s*y(e,n.byRegion[o],a))}return i}function x(e){return u(0,.1,a(e))*b(e)*n.amplitude}function S(e){return a(e)+(l(e[0]*6,e[1]*6,e[2]*6)-.5)*.055+(l(e[0]*21,e[1]*21,e[2]*21)-.5)*.018}function C(e,t,n,r){let i=e/n*Math.PI*2,a=t/r*Math.PI,o=Math.sin(a);return[o*Math.cos(i),Math.cos(a),o*Math.sin(i)]}function w(e,t){let n=new Float32Array((e+1)*(t+1));for(let r=0;r<=t;r++)for(let i=0;i<=e;i++)n[r*(e+1)+i]=x(C(i,r,e,t));return{ws:e,hs:t,data:n}}function T(e,t){let{ws:n,hs:r,data:i}=e,a=Math.hypot(t[0],t[1],t[2])||1,o=Math.max(-1,Math.min(1,t[1]/a)),s=Math.acos(o)/Math.PI,c=Math.atan2(t[2]/a,t[0]/a)/(Math.PI*2);c<0&&(c+=1);let l=Math.min(n-1e-9,c*n),u=Math.max(0,Math.min(r-1e-9,s*r)),d=Math.floor(l),f=Math.floor(u),p=l-d,m=u-f,h=f*(n+1)+d,g=(f+1)*(n+1)+d,_=i[h],v=i[h+1],y=i[g],b=i[g+1];return p+m<=1?_+(v-_)*p+(y-_)*m:b+(y-b)*(1-p)+(v-b)*(1-m)}function E(e,t){let{ws:n,hs:r,data:i}=e,a=(n+1)*(r+1);if(a>65536)throw RangeError(`[planet-snake] surface lattice ${n}x${r} wants ${a} vertices; the uint16 index ceiling is 65536. Lower SURF_WS/SURF_HS in scatter-rules.ts, or split the terrain into submeshes. Do NOT switch to Uint32Array: the engine retypes it to uint16 on updateMesh.`);let o=new Float32Array(a*8),s=new Float32Array(a*3);for(let e=0;e<=r;e++)for(let a=0;a<=n;a++){let c=e*(n+1)+a,l=C(a,e,n,r),u=t+i[c];s[c*3]=l[0]*u,s[c*3+1]=l[1]*u,s[c*3+2]=l[2]*u,o[c*8+6]=a/n,o[c*8+7]=e/r}let c=new Uint16Array(n*r*6),l=0;for(let e=0;e<r;e++)for(let t=0;t<n;t++){let r=e*(n+1)+t,i=r+1,a=r+(n+1),o=a+1;c[l++]=r,c[l++]=i,c[l++]=a,c[l++]=i,c[l++]=o,c[l++]=a}let u=new Float32Array(a*3);for(let e=0;e<c.length;e+=3){let t=c[e]*3,n=c[e+1]*3,r=c[e+2]*3,i=s[n]-s[t],a=s[n+1]-s[t+1],o=s[n+2]-s[t+2],l=s[r]-s[t],d=s[r+1]-s[t+1],f=s[r+2]-s[t+2],p=a*f-o*d,m=o*l-i*f,h=i*d-a*l;for(let e of[t,n,r])u[e]+=p,u[e+1]+=m,u[e+2]+=h}for(let e=0;e<a;e++){let t=Math.hypot(u[e*3],u[e*3+1],u[e*3+2])||1;o[e*8]=s[e*3],o[e*8+1]=s[e*3+1],o[e*8+2]=s[e*3+2],o[e*8+3]=u[e*3]/t,o[e*8+4]=u[e*3+1]/t,o[e*8+5]=u[e*3+2]/t}return{verts:o,indices:c}}function D(){return`fn ps_landField(p: vec3<f32>) -> f32 {\n  var v = -1.0;\n${i.map((e,t)=>{let n=t%2?.69:.64;return`  v = max(v, dot(p, vec3<f32>(${e.map(e=>e.toFixed(6)).join(`, `)}))
    + 0.09 * sin(p.x * 11.0 + ${(t*2.1).toFixed(4)}) + 0.07 * sin(p.y * 17.0 - p.z * 9.0 + ${t}.0) - ${n});`}).join(`
`)}\n  return v;\n}`}var O={grass:[.129,.173,.031],dry:[.295,.205,.046],sand:[.52,.455,.295],ice:[.6,.63,.665],deep:[.008,.08,.122],shallow:[.042,.228,.238],foam:[.78,.9,.9]},k=e=>`vec3<f32>(${e.map(e=>e.toFixed(4)).join(`, `)})`,A=k(O.deep.map((e,t)=>Math.log(Math.max(e,1e-4)/Math.max(O.shallow[t],1e-4)))),j=globalThis.location!==void 0&&new URLSearchParams(globalThis.location.search).get(`hash`)===`int`;function M(e){return j?`
fn ${e}(g: vec3<f32>) -> f32 {
  // \`g\` is always an integer lattice corner, so the cast is exact and every
  // step below is u32 arithmetic -- bit-identical on every backend.
  let i = vec3<i32>(round(g));
  var h: u32 = bitcast<u32>(i.x) * 374761393u
    + bitcast<u32>(i.y) * 668265263u
    + bitcast<u32>(i.z) * 1274126177u;
  h = (h ^ (h >> 13u)) * 1274126177u;
  h = h ^ (h >> 16u);
  return f32(h >> 8u) * (1.0 / 16777216.0);
}
`:`
fn ${e}(g: vec3<f32>) -> f32 {
  var q = fract(g * 0.1031);
  q = q + dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
`}var N=`
${M(`ps_hash`)}

fn ps_vnoise(x: vec3<f32>) -> f32 {
  let i = floor(x);
  let f = fract(x);
  let u = f * f * (3.0 - 2.0 * f);
  let c000 = ps_hash(i + vec3<f32>(0.0, 0.0, 0.0));
  let c100 = ps_hash(i + vec3<f32>(1.0, 0.0, 0.0));
  let c010 = ps_hash(i + vec3<f32>(0.0, 1.0, 0.0));
  let c110 = ps_hash(i + vec3<f32>(1.0, 1.0, 0.0));
  let c001 = ps_hash(i + vec3<f32>(0.0, 0.0, 1.0));
  let c101 = ps_hash(i + vec3<f32>(1.0, 0.0, 1.0));
  let c011 = ps_hash(i + vec3<f32>(0.0, 1.0, 1.0));
  let c111 = ps_hash(i + vec3<f32>(1.0, 1.0, 1.0));
  let x00 = mix(c000, c100, u.x);
  let x10 = mix(c010, c110, u.x);
  let x01 = mix(c001, c101, u.x);
  let x11 = mix(c011, c111, u.x);
  return mix(mix(x00, x10, u.y), mix(x01, x11, u.y), u.z);
}

fn ps_fbm(x: vec3<f32>) -> f32 {
  var s = 0.0;
  var a = 0.5;
  var q = x;
  for (var i = 0; i < 4; i = i + 1) {
    s = s + a * ps_vnoise(q);
    q = q * 2.03;
    a = a * 0.5;
  }
  return s;
}

/** Ridged fbm — the sharp-crested variant, for mountain relief. */
fn ps_ridge(x: vec3<f32>) -> f32 {
  var s = 0.0;
  var a = 0.5;
  var q = x;
  for (var i = 0; i < 4; i = i + 1) {
    s = s + a * (1.0 - abs(ps_vnoise(q) * 2.0 - 1.0));
    q = q * 2.11;
    a = a * 0.5;
  }
  return s;
}
`,P=e=>e.toFixed(8),F=e=>`vec3<f32>(${e.map(P).join(`, `)})`;function I(e,t){switch(e){case`peak`:return`pow(max(ps_terrainRidge(p, 2.7, 4, ${t}), 0.0), 2.2)`;case`dune`:return`ps_terrainRidge(p, 16.5, 3, ${t}) * 0.7`;case`terrace`:return`ps_opTerrace(p, ${t})`;case`erosion`:return`-max(ps_terrainRidge(p, 7.8, 4, ${t+991}) - 0.55, 0.0) * 1.8`;case`ridge`:return`ps_terrainRidge(p, 5.1, 4, ${t+313})`;case`flat`:return`0.0`}}function L(){let e=t.map((e,t)=>{let r=n.byRegion[e],i=p.map((e,n)=>`${P(r.roughness*.5**n)} * (ps_terrainFbm(p, ${P(e)}, 4, ${7+t*17+n}) - 0.5)`).join(`
    + `),a=r.landformOps.length>0?r.landformOps:[`flat`];return`fn ps_regionTerrain_${e}(p: vec3<f32>) -> f32 {
  let noise = ${i};
  let geo = (${a.map(e=>I(e,7+t*53)).join(`
    + `)}) / ${P(a.length)};
  return ${P(r.baseElevation)} + noise
    + geo * ${P(r.roughness)} * 1.4;
}`}).join(`

`),r=t.map(e=>`  if (w.${e} > ${P(m)}) {\n    h += w.${e} * ps_regionTerrain_${e}(p);\n  }`).join(`
`);return`
/// Land field plus its coastline warp. Split out as a function so its GRADIENT
/// can be taken: every coastal feature below is expressed as a distance to the
/// waterline, and a distance needs a derivative.
fn ps_field(p: vec3<f32>) -> f32 {
  return ps_landField(p)
    + (ps_fbm(p * 6.0) - 0.5) * 0.055
    + (ps_fbm(p * 21.0) - 0.5) * 0.018;
}

/// Wave height. Two crossed ridged bands plus a finer isotropic layer — the
/// crossed bands are what break the sun glint into a long streak of separate
/// crests instead of one smooth blob, which is how the reference's glint reads
/// in the six frames where it is the largest bright shape in the picture.
fn ps_waves(p: vec3<f32>) -> f32 {
  // Wavelength matters more than amplitude. At 38 per radian a crest was 4.3
  // world units across and the waves rendered as broad white smears in the
  // DIFFUSE — fog patches, not water. At ~220 a crest is about 0.75 units, which
  // averages out at screen scale in the diffuse and survives only where the
  // specular geometry is satisfied. That is what a glint is.
  // 220 per radian puts a crest at roughly 0.75 world units, which at the play
  // camera lands near one crest per pixel and aliases into visible horizontal
  // banding — the water read as corduroy rather than as water. Halved, and the
  // 520 speckle octave dropped entirely: it was pure aliasing fuel and the glint
  // gets its break-up from the two crossed ridged bands.
  let a = ps_ridge(p * vec3<f32>(105.0, 112.0, 100.0));
  let b = ps_ridge(p * vec3<f32>(76.0, 70.0, 83.0) + vec3<f32>(5.0, 2.0, 8.0));
  return a * 0.6 + b * 0.4;
}

fn ps_seedOffset(seed: i32) -> vec3<f32> {
  let s = f32(seed);
  return vec3<f32>(s * 0.1031, s * 0.11369, s * 0.13787);
}

fn ps_terrainFbm(p: vec3<f32>, frequency: f32, octaves: i32, seed: i32) -> f32 {
  var s = 0.0;
  var a = 0.5;
  var q = p * frequency;
  for (var i = 0; i < octaves; i = i + 1) {
    s = s + a * ps_vnoise(q + ps_seedOffset(seed + i * 131));
    q = q * 2.03;
    a = a * 0.5;
  }
  return s;
}

fn ps_terrainRidge(p: vec3<f32>, frequency: f32, octaves: i32, seed: i32) -> f32 {
  var s = 0.0;
  var a = 0.5;
  var q = p * frequency;
  for (var i = 0; i < octaves; i = i + 1) {
    s = s + a * (1.0 - abs(ps_vnoise(q + ps_seedOffset(seed + i * 77)) * 2.0 - 1.0));
    q = q * 2.11;
    a = a * 0.5;
  }
  return s;
}

fn ps_opTerrace(p: vec3<f32>, seed: i32) -> f32 {
  let base = ps_terrainFbm(p, 3.9, 4, seed);
  return floor(base * 6.0) / 6.0 + fract(base * 6.0) * 0.12 / 6.0;
}

struct PsRegionWeights {
  iceCap: f32,
  dry: f32,
  highland: f32,
  beach: f32,
  grassland: f32,
};

fn ps_regionWeights(p: vec3<f32>) -> PsRegionWeights {
  let wf = ps_field(p);
  let iceCap = smoothstep(${P(d.ice.lo)}, ${P(d.ice.hi)},
    abs(p.y) + (ps_fbm(p * ${P(d.ice.frequency)}) - 0.5) * ${P(d.ice.jitter)});
  let dry = smoothstep(${P(d.dry.lo)}, ${P(d.dry.hi)},
    ps_fbm(p * ${P(d.dry.frequency)} + ${F(d.dry.offset)}));
  let tectonic = ${P(d.highland.broadWeight)}
      * ps_fbm(p * ${P(d.highland.broadFrequency)} + ${F(d.highland.offsetA)})
    + ${P(1-d.highland.broadWeight)}
      * ps_fbm(p * ${P(d.highland.detailFrequency)} + ${F(d.highland.offsetB)});
  let highland = smoothstep(${P(d.highland.lo)}, ${P(d.highland.hi)}, tectonic)
    * smoothstep(${P(d.highland.coreLo)}, ${P(d.highland.coreHi)}, wf);
  let beach = select(0.0, 1.0 - smoothstep(${P(d.beach.lo)}, ${P(d.beach.hi)}, wf), wf > 0.0);
  let grassland = smoothstep(${P(d.land.lo)}, ${P(d.land.hi)}, wf)
    * (1.0 - dry) * (1.0 - highland) * (1.0 - iceCap) * (1.0 - beach);
  let total = iceCap + dry + highland + beach + grassland;
  if (total <= 1e-9) {
    return PsRegionWeights(0.0, 0.0, 0.0, 0.0, 1.0);
  }
  return PsRegionWeights(iceCap / total, dry / total, highland / total, beach / total, grassland / total);
}

${e}

fn ps_relief(p: vec3<f32>) -> f32 {
  let w = ps_regionWeights(p);
  var h = 0.0;
${r}
  return h;
}
`}function R(){return`
struct PsSurface {
  albedo: vec3<f32>,
  rough: f32,
  nrm: vec3<f32>,
  /// Dielectric F0. The stock 0.04 is right for water and wrong for dirt: with
  /// the albedo probed to zero, the terrain still rendered a NEUTRAL grey 30-48
  /// in display space, which on land this dark is most of the blue and green
  /// excess measured against the reference. The reference's ground is matte and
  /// its water carries the largest specular in most frames, so this has to vary
  /// per pixel rather than per material.
  spec: f32,
};

/// meshN is the INTERPOLATED VERTEX NORMAL, and passing it in is load-bearing.
/// The sphere is displaced by the relief field and its normals recomputed from
/// the result, but the graft replaces the shader's normal outright — so building
/// the output normal from normalize(worldPos) instead threw all of that away and
/// the terrain shaded as a smooth ball with a displaced silhouette. The hills
/// were there; nothing was lighting them.
fn ps_surface(wp: vec3<f32>, meshN: vec3<f32>) -> PsSurface {
  let p = normalize(wp);

  // Tangent frame, built from the least-aligned axis so there is no pole
  // degeneracy. Used for both the coastline distance and the relief normal.
  let ax = select(vec3<f32>(1.0, 0.0, 0.0), vec3<f32>(0.0, 1.0, 0.0), abs(p.x) > 0.9);
  let t1 = normalize(cross(p, ax));
  let t2 = cross(p, t1);
  let e = 0.0035;

  // Coastal features are measured in ANGULAR DISTANCE to the waterline, not in
  // field value. The field is a smooth max of six dot products, so its gradient
  // is shallow in the interior of a continent — a beach defined as "field below
  // 0.055" was a narrow strip at steep coasts and a kilometre-wide cream river
  // running through the middle of the landmass wherever the field flattened out.
  // Dividing by |grad| converts the level set to a distance and the band becomes
  // the same width everywhere, which is what a beach actually is.
  //
  // The gradient is taken from the SMOOTH field only. Including the coastline
  // warp put its fbm-at-21 component into the denominator, so gmag swung
  // wildly from pixel to pixel and the shallow/deep blend broke into broad pale
  // streaks running across the ocean — they looked like fog banks and survived
  // two rounds of retuning the waves, which is not where they came from.
  let f = ps_field(p);
  let gf1 = ps_landField(normalize(p + t1 * e)) - ps_landField(normalize(p - t1 * e));
  let gf2 = ps_landField(normalize(p + t2 * e)) - ps_landField(normalize(p - t2 * e));
  let gmag = max(length(vec2<f32>(gf1, gf2)) / (2.0 * e), 0.05);
  let dist = f / gmag;                       // radians from the waterline, signed

  let grain = ps_fbm(p * 40.0);
  let blotch = ps_fbm(p * 4.5);

  // ── land ────────────────────────────────────────────────────────────────
  // Dry earth is carved out of the interior by a second, independent field, so
  // it reads as exposed ground rather than as a separate island.
  var land = ${k(O.grass)};
  // The window has to sit ON the field's median or one biome eats the planet.
  // ps_fbm's distribution here is mean 0.468, std 0.112 (sampled over 200k
  // points on the sphere), so smoothstep(0.50, 0.78) put the ramp entirely in
  // the upper tail: 73% of the surface came out PURE grass and 0.4% pure dry,
  // which is why every location looked the same colour. Centred and narrowed,
  // it gives 77% clearly grass / 9% clearly dry / the rest painterly
  // transition. Grass-dominant is not a preference, it is what the reference
  // measures: its DAYLIGHT frames are 67.6% green pixels at G/R 1.052, which
  // is about what a pure grass region renders as here — so the reference is
  // very largely one green biome with a browner minority, and the earlier
  // 50/50 split (dry mean 0.25) left us at 18.9% green.
  let dry = smoothstep(0.52, 0.66, ps_fbm(p * 3.2 + vec3<f32>(11.0, 3.0, 7.0)));
  land = mix(land, ${k(O.dry)}, dry);
  // Mountain flanks go bare, valleys stay green. The two windows below are
  // generated by tools/terrain-gate.ts from area-uniform land samples; their
  // percentile identities live beside the values in terrain-calibration.ts.
  let rel = ps_relief(p);
  land = mix(land, ${k(O.dry)} * 0.86,
    smoothstep(${P(e.bareMix.lo)}, ${P(e.bareMix.hi)}, rel) * 0.30);
  // Blotch and valley contrast both pulled in. These two multiply, so the swing
  // between a lit ridge and a shaded hollow ran 0.86*0.78 = 0.67 to
  // 1.16*1.18 = 1.37 — better than 2:1 within one biome, which is what reads as
  // near-black patches stamped on bright sand. Now 0.79 to 1.24.
  land = land * (0.90 + 0.20 * blotch) * (0.96 + 0.08 * grain);
  // Valleys sit in their own shade. This wider p10-p80 window preserves a long
  // transition while the bare-flank mix above only reaches the upper tail.
  land = land * (0.91 + 0.16
    * smoothstep(${P(e.valleyShade.lo)}, ${P(e.valleyShade.hi)}, rel));
  // A slow warm/cool drift on top of the value variation. The reference's land
  // is never one hue over any large area; without this the blotches only change
  // brightness and the terrain still reads as a single tinted sheet.
  // TRIED WIDER AND PUT BACK. The within-frame hue spread still trails the
  // reference (31 vs 45 deg), and this term looked like the lever — but at
  // 0.55/0.45 amplitude the measured spread moved 31.1 -> 32.0 while the green
  // fraction fell 66.3 -> 61.4% (drift pushes grass across the 65-deg line).
  // The real source of the reference's breadth is LIT-VS-SHADOW hue
  // divergence: its shadowed land reads up to +35 deg greener than its lit
  // land (median ~+24), ours +16. Closing that means retinting shadow ambient,
  // which the player has already called tiring once — left alone deliberately.
  let drift = ps_fbm(p * 2.1 + vec3<f32>(4.0, 9.0, 2.0)) - 0.5;
  land = land * vec3<f32>(1.0 + drift * 0.22, 1.0 + drift * 0.04, 1.0 - drift * 0.20);
  // Beach: a narrow band on the land side of the waterline.
  land = mix(${k(O.sand)}, land, smoothstep(0.0008, 0.010, dist));

  // ── water ───────────────────────────────────────────────────────────────
  // Depth from the same field. The reference's shelf hugs every coast because
  // its shallow band is depth-driven, not a separately placed ring.
  let depth = clamp(-dist / 0.055, 0.0, 1.0);   // shelf hugs the shore; open water is one deep tone
  // Beer-Lambert instead of a linear mix — the reference's water model. Its colour
  // "is the *shortfall* of the light that made it through — red first, then
  // green — so the tint follows the path length" (water.fragment.wgsl,
  // WATER_ABSORB). exp(ln(deep/shallow) * path) hits the SAME two fitted
  // endpoints, but the midtones travel the multiplicative path between them:
  // through saturated glacial teal, where the linear mix cut a grey chord.
  // depth*depth stays as the path proxy the shelf width was fitted with.
  var water = ${k(O.shallow)} * exp(${A} * (depth * depth));
  water = water * (0.90 + 0.16 * ps_fbm(p * 30.0));

  // ── shoreline ───────────────────────────────────────────────────────────
  let onLand = smoothstep(-0.0012, 0.0012, dist);
  var col = mix(water, land, onLand);
  // Foam sits ON the waterline, both sides, and is thinner than the sand band.
  // WIDTH VARIES ALONG THE COAST. At a fixed 0.0035 it was a constant-width
  // stroke with static lace inside it — a sticker outline, not surf. The band
  // now breathes between 0.0024 and 0.0046 on a slow field, so it thickens in
  // bays and thins on points the way real surf does.
  let foamHalfWidth = 0.0024 + 0.0022 * ps_vnoise(p * 7.0);
  let foam = (1.0 - smoothstep(0.0, foamHalfWidth, abs(dist))) * (0.55 + 0.45 * ps_vnoise(p * 90.0));
  // 0.5 -> 0.35: at half strength this line was the brightest continuous thing
  // in most frames, which is not what a coast should win.
  col = mix(col, ${k(O.foam)}, foam * 0.35);

  // ── ice ─────────────────────────────────────────────────────────────────
  // Caps at the poles and snow on the highest ground, both with a noisy edge.
  let capEdge = abs(p.y) + (blotch - 0.5) * 0.10;
  let cap = smoothstep(0.905, 0.975, capEdge);
  let ice = cap;   // polar caps only — snow on ridges read as white smears

  col = mix(col, ${k(O.ice)} * (0.94 + 0.10 * grain), ice);

  // ── normal ──────────────────────────────────────────────────────────────
  // Relief is shaded, not displaced. The gradient is taken in the tangent plane
  // by central differences; on a unit sphere any two vectors orthogonal to p
  // will do, and building them from the least-aligned axis avoids the pole
  // degeneracy that a fixed up-vector would have.
  // The LOW-FREQUENCY relief is real geometry now — the sphere is displaced by
  // ps_relief on the CPU and its normals recomputed — so perturbing by the same
  // field here would shade every hill twice. What is left for the shader is the
  // sub-vertex grain, which at a 0.64-unit vertex spacing the mesh cannot carry.
  let du = ps_fbm(normalize(p + t1 * e) * 26.0) - ps_fbm(normalize(p - t1 * e) * 26.0);
  let dv = ps_fbm(normalize(p + t2 * e) * 26.0) - ps_fbm(normalize(p - t2 * e) * 26.0);
  // Waves need their own, much smaller epsilon: sampled at the relief's step the
  // 38-per-radian bands alias into noise instead of resolving as crests.
  let we = 0.00028;
  let wu = ps_waves(normalize(p + t1 * we)) - ps_waves(normalize(p - t1 * we));
  let wv = ps_waves(normalize(p + t2 * we)) - ps_waves(normalize(p - t2 * we));
  let wgrad = (t1 * wu + t2 * wv) / (2.0 * we);
  // grad is the TANGENTIAL gradient of the relief, in height per radian —
  // dividing by 2e is what makes it a derivative rather than a raw difference.
  // The previous form folded an extra 0.0016 into the same expression and came
  // out at a normal tilt of about 1.5 degrees, which is why the terrain rendered
  // as one flat sheet no matter how the albedo was tuned. At a relief gradient
  // near 6 per radian, BUMP = 0.10 gives roughly a 30 degree tilt on a slope.
  let grad = (t1 * du + t2 * dv) / (2.0 * e);
  let BUMP = mix(0.010, 0.020, onLand);
  // Waves fade out at the shoreline, where the shelf is shallow and calm, and
  // die entirely on land.
  let waveAmp = (1.0 - onLand) * (1.0 - ice) * smoothstep(0.0, 0.02, -dist) * 0.00060;
  let geomN = normalize(meshN);
  let perturbedN = normalize(geomN - grad * BUMP - wgrad * waveAmp);
  // ON WATER, the specular is shown a normal PULLED BACK toward the geometric
  // one. The wave perturbation here is static — the forward pass has no clock —
  // so what it gives the sun lobe is not moving water, it is fixed dirty
  // texture: measured, the glare patch was near-neutral (saturation 0.11) and
  // marbled. The animated sparkle now lives in the post pass, so the forward
  // pass's whole job on water is ONE broad clean sheen. Land is untouched; its
  // bump is real relief.
  let bumped = normalize(mix(perturbedN, geomN, (1.0 - onLand) * 0.45));

  var out: PsSurface;
  out.albedo = col;
  // Ice overrides the water branch too: the polar caps sit mostly over OCEAN,
  // and with the gates keyed on onLand alone the cap kept water's gloss, F0 and
  // wave normals — a sheet of shiny water painted white. (codex 5.6 finding #3)
  // Water roughness 0.27 -> 0.60. At 0.27 the specular lobe is narrow enough
  // that, with F0 pushed as high as it is below, the sun's reflection clips: the
  // glint measured a solid (255,255,255) over 3.3% of the frame against the
  // reference's (199,206,197) peak, which is explicitly NOT clipped. A rougher
  // sheet spreads the same energy over a wider, softer patch — which is what the
  // reference's broad glare actually is.
  // 0.60 -> 0.46: with the water-patch geometry carrying the live sparkle,
  // the painted sheet's job is to CONTINUE the glare past the patch rim, and at
  // 0.60 the character gap between the two made the rim readable as a line.
  // The coherent-blob risk 0.60 was guarding against needed F0 0.17; at 0.030
  // a 0.46 lobe is a broad soft sheen, not a hole of white.
  // Water 0.46 -> 0.56. The glare was measured at display luminance 251 out of
  // 255 — clipped flat — over 2.04% of the sea. A knee on the ALBEDO was the
  // obvious-looking fix and is the wrong one: the clipped value is the
  // SPECULAR, so kneeing albedo only darkens the sea and leaves the highlight
  // blown. The lever that reaches it is the lobe width — broader spreads the
  // same energy over more pixels and lands the peak under clipping.
  out.rough = mix(mix(0.56, 0.60, ice), mix(0.88, 0.55, ice), onLand);
  // Water F0 is pushed well above the physical 0.02. The reference's sun glint
  // is the LARGEST BRIGHT SHAPE in six of ten frames, and with the tonemap
  // compressing highlights as hard as Reinhard does, a physical dielectric
  // simply cannot produce that on screen.
  // ...and F0 comes down with it, 0.17 -> 0.055 -> 0.030. The first pair was
  // fitted when the planet was radius 26; at 36 the lit water covers far more
  // screen and the same settings turned the glare into a white hole.
  //
  // 0.030 is the handover. THE SUN GLINT NOW LIVES IN THE POST PASS
  // (psWaveNormal + a GGX lobe in space.wgsl), because it needs a normal that
  // -- no backticks in this comment: it lives inside surfaceWgsl's template
  // literal, and one would close the string.
  // MOVES and no clock reaches this pass. What stays here is the broad soft
  // sheen the reference also has — the sharp moving sparkle is added on top from
  // outside. Raising this again re-creates the coherent blob the wave normal was
  // introduced to break up.
  out.spec = mix(mix(0.030, 0.025, ice), mix(0.004, 0.022, ice), onLand);
  out.nrm = bumped;
  return out;
}
`}function z(){return N}function B(){return`${N}\n${D()}\n${L()}\n${R()}`}export{D as a,f as c,a as i,B as l,E as n,T as o,M as r,z as s,w as t,S as u};