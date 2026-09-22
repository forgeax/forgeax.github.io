import{_ as e,zr as t}from"./chunk-DS7WWPFM-BDMKhb16.js";import{s as n}from"./object-definition-registry-D4kFDhNZ.js";import{d as r,i,o as a}from"./player-visuals-De9n8bMq.js";import{n as o}from"./female-figure-C1kCMFUh.js";import{r as s}from"./game-asset-catalog-CGU3DZp1.js";import{a as c,n as l}from"./player-loadout-BnARX98Y.js";import{i as u,t as d}from"./shared-asset-lifecycle-Z4hnbIwO.js";import{X as f,Z as p,v as m,y as h}from"./attack-module-assets-B8BVvPrl.js";import{r as g}from"./behavior-runtime-BGjteNvd.js";import{i as _,t as v}from"./mobile-game-styles-BNdiXa3-.js";import{n as y,r as b}from"./health-display-BLwotFSt.js";var x=String.raw`
.spirit-gym-hud__resource-orb{
  --orb-color:var(--ui-health);--orb-light:var(--ui-health-light);--orb-deep:var(--ui-health-deep);--orb-flow:var(--ui-blood-flow);
  position:absolute;bottom:var(--hud-tray-bottom);left:calc(50% - var(--hud-tray-width)/2 - var(--hud-orb-size) - 20px);
  width:var(--hud-orb-size);height:var(--hud-orb-size);padding:0;margin:0;border:3px solid var(--ui-recessed);border-radius:50%;
  background:var(--ui-recessed);box-shadow:0 5px 18px #0009,0 0 0 1px var(--ui-bronze);pointer-events:none
}
.spirit-gym-hud__resource-orb--qi{
  --orb-color:var(--ui-qi);--orb-light:var(--ui-qi-light);--orb-deep:var(--ui-qi-deep);--orb-flow:var(--ui-qi-flow);
  left:auto;right:calc(50% - var(--hud-tray-width)/2 - var(--hud-orb-size) - 20px)
}
.spirit-gym-hud__resource-orb::before{content:"";position:absolute;inset:-10px;background:var(--ui-motif-disc) center/contain no-repeat;pointer-events:none;opacity:.86}
/* The glass stays still: narrow Fresnel rim, curved softbox reflection and a
   smaller opposing glint. Dark edge absorption gives the shell visible thickness. */
.spirit-gym-hud__resource-orb::after{
  content:"";position:absolute;inset:0;z-index:3;border-radius:50%;pointer-events:none;
  background:
    radial-gradient(ellipse 20% 8% at 32% 15%,#fffdf0d9 5%,#fffdf070 38%,#fffdf000 76%),
    radial-gradient(ellipse 7% 19% at 13% 32%,#e8fff578,transparent 78%),
    radial-gradient(ellipse 3% 10% at 87% 67%,#c7f8f69c,transparent 82%),
    radial-gradient(ellipse 25% 8% at 63% 88%,#b7e5d961,transparent 80%),
    radial-gradient(circle at 50% 50%,transparent 59%,#04171c66 72%,#dbf6e95c 77%,#05222bdd 81%);
  box-shadow:inset 0 1px 1px #f0fff6b3,inset 2px 0 3px #d3fff338,inset -2px -3px 4px #010d14b3
}
.spirit-gym-hud__orb-well{
  position:absolute;inset:0;overflow:hidden;isolation:isolate;border-radius:50%;
  background:radial-gradient(ellipse at 38% 28%,#405753,#15292e 48%,#061319 82%)
}
.spirit-gym-hud__orb-well::before{
  content:"";position:absolute;inset:8% 17% 47% 10%;z-index:3;pointer-events:none;
  border-radius:50%;border-top:1px solid #effff1a6;transform:rotate(-27deg);
  background:linear-gradient(180deg,#e5ffed26,transparent 62%)
}
.spirit-gym-hud__orb-well::after{
  content:"";position:absolute;inset:0;z-index:2;border-radius:50%;pointer-events:none;
  background:radial-gradient(ellipse at 40% 35%,transparent 35%,#03101538 61%,#010c16b3 94%),
    linear-gradient(125deg,#e5f3d31a,transparent 38%,#03131a33 72%,transparent);
  box-shadow:inset 0 -5px 9px #03101699
}
.spirit-gym-hud__orb-liquid{
  position:absolute;inset:0;width:100%;height:100%;overflow:hidden;isolation:isolate;
  transform:translateY(calc((1 - var(--resource-ratio,1)) * 100%));transform-origin:bottom;
  transition:transform var(--ui-feedback) ease-out;
  background:radial-gradient(ellipse at 42% 28%,var(--orb-color) 16%,var(--orb-deep) 82%);
  box-shadow:inset 0 3px 6px color-mix(in srgb,var(--orb-light) 48%,transparent)
}
/* Meniscus stays on the resource plane. Movement cannot draw liquid above the
   authoritative clip, including at zero; the far edge is softer than the near lip. */
.spirit-gym-hud__orb-liquid::before{
  content:"";position:absolute;z-index:2;left:-20%;top:-3%;width:140%;height:10%;border-radius:50%;
  background:radial-gradient(ellipse at 50% 0%,var(--orb-deep),var(--orb-color) 55%,var(--orb-light) 74%,transparent 81%);
  box-shadow:0 1px 1px color-mix(in srgb,var(--orb-light) 55%,transparent);
  animation:spirit-orb-meniscus var(--ui-liquid-wave) ease-in-out infinite alternate
}
.spirit-gym-hud__orb-current{
  position:absolute;inset:-30%;border-radius:42%;pointer-events:none;
  background:
    radial-gradient(ellipse 33% 17% at 39% 43%,transparent 52%,color-mix(in srgb,var(--orb-light) 34%,transparent) 58%,transparent 65%),
    radial-gradient(ellipse 30% 13% at 36% 42%,transparent 37%,color-mix(in srgb,var(--orb-light) 70%,transparent) 58%,transparent 83%),
    radial-gradient(ellipse 23% 36% at 67% 60%,transparent 32%,color-mix(in srgb,var(--orb-color) 80%,transparent) 63%,transparent 82%),
    radial-gradient(ellipse 24% 18% at 38% 69%,color-mix(in srgb,var(--orb-light) 65%,transparent),transparent 76%);
  opacity:.74;animation:spirit-orb-current var(--orb-flow) linear infinite
}
.spirit-gym-hud__orb-current--rear{
  background:
    radial-gradient(ellipse 35% 20% at 62% 46%,transparent 30%,var(--orb-deep) 58%,transparent 83%),
    radial-gradient(ellipse 29% 15% at 42% 63%,transparent 32%,color-mix(in srgb,var(--orb-light) 78%,transparent) 61%,transparent 85%);
  opacity:.56;animation-duration:calc(var(--orb-flow) * 1.37);animation-direction:reverse;animation-delay:-5s
}
.spirit-gym-hud__resource-orb--qi .spirit-gym-hud__orb-current{opacity:.9}
.spirit-gym-hud__resource-orb--qi .spirit-gym-hud__orb-current--rear{opacity:.68}
.spirit-gym-hud__orb-rune{position:absolute;inset:0;z-index:2;display:grid;place-items:center;font:25px var(--ui-font-title);color:#fff8;text-shadow:0 1px 3px #031019,0 0 7px #04181aaa;pointer-events:none}
.spirit-gym-hud__resource-orb strong{position:absolute;top:calc(100% + 12px);left:50%;transform:translateX(-50%);white-space:nowrap;font:12px/1.3 var(--ui-font-number);color:var(--ui-text);padding:1px 7px;background:linear-gradient(90deg,transparent,var(--ui-panel),transparent)}
.spirit-gym-hud__resource-orb small{position:absolute;bottom:calc(100% + 13px);left:50%;transform:translateX(-50%);white-space:nowrap;font:11px var(--ui-font-title);letter-spacing:.15em;color:var(--ui-text)}
.spirit-gym-hud__resource-orb.is-low strong{color:var(--orb-light)}
@keyframes spirit-orb-current{
  0%{transform:translate(-2%,1%) rotate(0deg)}
  33%{transform:translate(3%,-2%) rotate(120deg)}
  66%{transform:translate(-1%,3%) rotate(240deg)}
  100%{transform:translate(-2%,1%) rotate(360deg)}
}
@keyframes spirit-orb-meniscus{from{transform:translateX(-3%) rotate(-1.5deg)}to{transform:translateX(3%) rotate(1.5deg)}}
[data-game-menu-open=true] .spirit-gym-hud__orb-current,
[data-game-menu-open=true] .spirit-gym-hud__orb-liquid::before{animation-play-state:paused}
@media(prefers-reduced-motion:reduce){
  .spirit-gym-hud__orb-current,.spirit-gym-hud__orb-liquid::before{animation:none}
  .spirit-gym-hud__orb-current--rear{transform:rotate(125deg)}
  .spirit-gym-hud__orb-liquid{transition:none}
}
`,S=String.raw`
.spirit-gym-hud__weapon-vitals{
  --qi-angle:0deg;--weapon-vitals-size:30px;--ring-color:var(--weapon-accent,var(--ui-bronze));
  position:relative;display:grid;place-items:center;isolation:isolate;
  flex:none;width:var(--weapon-vitals-size);height:var(--weapon-vitals-size);aspect-ratio:1;
  border-radius:50%;font-style:normal;
  background:radial-gradient(circle at 38% 26%,color-mix(in srgb,var(--ring-color) 18%,var(--ui-recessed)),var(--ui-recessed) 72%);
  box-shadow:0 1px 3px #0008,inset 0 1px .5px #effffb50,inset 0 -1px 1px #000b;
}
.spirit-gym-hud__weapon-vitals[hidden]{display:none}
/* Two masks intersect: a true circular channel and the current resource arc.
   The highlight is cut by the same arc, including when the resource is empty. */
.spirit-gym-hud__weapon-vitals::before,.spirit-gym-hud__weapon-health::before{
  content:"";position:absolute;inset:1px;border-radius:50%;pointer-events:none;
  background:linear-gradient(140deg,color-mix(in srgb,var(--ring-color) 55%,#fffdf2) 5%,var(--ring-color) 40%,color-mix(in srgb,var(--ring-color) 58%,#132f35) 72%,var(--ring-color));
  mask-image:conic-gradient(#000 var(--ring-angle,var(--qi-angle)),transparent 0),radial-gradient(farthest-side,transparent calc(100% - 2.5px),#000 calc(100% - 2px));
  mask-composite:intersect;
}
.spirit-gym-hud__weapon-vitals::after{
  content:"";position:absolute;inset:4px;border-radius:50%;pointer-events:none;
  box-shadow:0 0 0 .5px #020f17c0,inset 0 1px 1px #0008;
}
.spirit-gym-hud__weapon-health{
  --health-angle:0deg;--ring-angle:var(--health-angle);--ring-color:var(--ui-health-light);
  position:absolute;inset:6px;display:grid;place-items:center;border-radius:50%;font-style:normal;
  background:var(--ui-recessed);box-shadow:0 0 0 .5px #d7e7dc22,inset 0 1px 2px #000b;
}
.spirit-gym-hud__weapon-health::before{
  inset:0;mask-image:conic-gradient(#000 var(--health-angle),transparent 0),radial-gradient(farthest-side,transparent calc(100% - 2px),#000 calc(100% - 1.5px));
}
.spirit-gym-hud__weapon-health::after{
  content:"";position:absolute;inset:3px;border-radius:50%;pointer-events:none;
  background:radial-gradient(ellipse at 35% 12%,#dff6ed30,transparent 55%);
  box-shadow:inset 0 .5px .5px #dff6ed30,inset 0 -1px 1px #0009;
}
.spirit-gym-hud__weapon-phase{position:relative;z-index:1;font:500 9px/1 var(--ui-font-title);color:var(--ui-text);text-shadow:0 1px 2px #000}
.spirit-gym-hud__slot[data-element=metal]{--weapon-accent:#d6bf86}
.spirit-gym-hud__slot[data-element=wood]{--weapon-accent:#9bbe8a}
.spirit-gym-hud__slot[data-element=water]{--weapon-accent:#88b8c6}
.spirit-gym-hud__slot[data-element=fire]{--weapon-accent:#d69273}
.spirit-gym-hud__slot[data-element=earth]{--weapon-accent:#c0a37f}
.spirit-gym-hud__slot[data-resource-phase=disabled-docked]{opacity:.55}
.spirit-gym-hud__slot[data-automatic=true][data-resource-phase=docked-charging] .spirit-gym-hud__weapon-vitals::before{animation:weapon-qi-breathe 2.4s ease-in-out infinite}
@keyframes weapon-qi-breathe{0%,100%{opacity:.76}50%{opacity:1}}
[data-game-menu-open=true] .spirit-gym-hud__weapon-vitals::before{animation-play-state:paused}
@media(prefers-reduced-motion:reduce){.spirit-gym-hud__slot[data-automatic=true][data-resource-phase=docked-charging] .spirit-gym-hud__weapon-vitals::before{animation:none}}
`,C=String.raw`
.spirit-gym-hud{${_}--ink:var(--ui-text);--muted:var(--ui-muted);--gold:var(--ui-bronze);--jade:var(--ui-jade);--line:var(--ui-line);position:absolute;inset:0;width:100%;height:100%;min-width:0;overflow:clip;pointer-events:none!important;z-index:50;color:var(--ink);font:12px/1.5 var(--ui-font-body);font-variant-numeric:tabular-nums;text-shadow:0 1px 4px #0008}
.spirit-gym-hud *{box-sizing:border-box}.spirit-gym-hud__panel{background:color-mix(in srgb,var(--ui-surface) 85%,transparent);border:1px solid var(--line);border-radius:3px;box-shadow:0 4px 20px #0002}
.spirit-gym-hud{--hud-tray-width:392px;--hud-orb-size:90px;--hud-tray-bottom:max(86px,calc(env(safe-area-inset-bottom) + 76px))}
.spirit-gym-hud__status{position:static}
.spirit-gym-hud__identity{position:absolute;top:max(20px,env(safe-area-inset-top));left:max(22px,env(safe-area-inset-left));width:200px;padding:10px 14px;background:linear-gradient(100deg,var(--ui-panel),transparent);border:0;border-left:2px solid var(--ui-bronze);border-radius:0;box-shadow:none}
.spirit-gym-hud__name{color:var(--ui-muted);font-size:9px;letter-spacing:.2em;margin-bottom:4px}.spirit-gym-hud__cultivation{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.spirit-gym-hud__cultivation b{font:500 18px/1.4 var(--ui-font-title);letter-spacing:.06em}.spirit-gym-hud__cultivation>span{color:var(--muted);font-size:10px}.spirit-gym-hud__xp-track{height:2px;background:var(--ui-line);margin-top:7px}.spirit-gym-hud__xp-track i{display:block;height:100%;background:var(--ui-jade);transform-origin:left;transform:scaleX(0)}
${x}
.spirit-gym-hud__round{position:absolute;top:max(22px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);min-width:134px;padding:10px 22px 14px;text-align:center;background:linear-gradient(color-mix(in srgb,var(--ui-surface) 75%,transparent),transparent);border-width:0 0 1px;border-radius:0}.spirit-gym-hud__round strong{display:block;font-weight:500;font-size:11px;color:var(--ui-text);letter-spacing:.2em}.spirit-gym-hud__round span{display:block;margin-top:2px;font:30px/1.2 var(--ui-font-number);letter-spacing:.08em}
.spirit-gym-hud__score{position:absolute;top:94px;right:18px;display:grid;grid-template-columns:1fr 1fr;gap:10px 22px;padding:13px 18px;width:165px;font-size:10px;color:var(--muted)}.spirit-gym-hud__score span{display:flex;gap:8px;justify-content:space-between;align-items:baseline}.spirit-gym-hud__score b{color:var(--ink);font-size:15px;font-weight:500}.spirit-gym-hud__score span:last-child{grid-column:1/-1;font-size:10px}.spirit-gym-hud__score span:last-child b{font-size:12px}
.spirit-gym-hud__loadout{position:absolute;bottom:var(--hud-tray-bottom);left:50%;transform:translateX(-50%);width:var(--hud-tray-width);padding:10px 12px;background:linear-gradient(0deg,var(--ui-panel),color-mix(in srgb,var(--ui-recessed) 80%,transparent));border:1px solid var(--ui-line);border-radius:2px;box-shadow:0 5px 22px #0006}.spirit-gym-hud__loadout-head{display:flex;justify-content:space-between;align-items:center;color:var(--ui-jade);font-size:10px;letter-spacing:.2em;margin:0 3px 7px}.spirit-gym-hud__loadout-head b{font-weight:400}.spirit-gym-hud__loadout-head span{color:var(--muted);letter-spacing:0}.spirit-gym-hud__slot-group-label,.spirit-gym-hud__gear-group,.spirit-gym-hud__reset{display:none}.spirit-gym-hud__slot-row{display:grid;grid-template-columns:repeat(var(--hud-slot-count),minmax(0,1fr));gap:6px}.spirit-gym-hud__slot{position:relative;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:62px;padding:5px 3px;border:1px solid var(--ui-line);background:color-mix(in srgb,var(--ui-recessed) 80%,transparent);color:var(--ui-muted);border-radius:2px;pointer-events:auto}.spirit-gym-hud__slot.is-filled{border-color:color-mix(in srgb,var(--weapon-accent,var(--ui-bronze)) 60%,transparent)}.spirit-gym-hud__slot-name{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;text-align:center}.spirit-gym-hud__slot-copy{max-width:100%}.spirit-gym-hud__slot-meta{display:none}.spirit-gym-hud__slot:not(.is-filled) .spirit-gym-hud__weapon-vitals{opacity:.25}
${S}
.spirit-gym-hud__dash{position:absolute;left:24px;bottom:55px;padding:6px 12px;border-width:0 0 0 2px;font-size:12px;color:var(--muted)}.spirit-gym-hud__dash[data-ready=true]{border-color:var(--jade);color:var(--ink)}.spirit-gym-hud__input-hint{position:absolute;left:24px;bottom:24px;padding:0;border:0;background:none;box-shadow:none;font-size:10px;color:var(--ui-muted)}
.spirit-gym-hud__touch{display:none}.spirit-gym-hud__joystick,.spirit-gym-hud__touch-action{position:absolute;display:grid;place-items:center;border:1px solid var(--ui-bronze);border-radius:50%;background:#18221d77;color:#eee9db}.spirit-gym-hud__joystick{left:calc(var(--touch-origin-x,18%) - 42px);top:calc(var(--touch-origin-y,78%) - 42px);width:84px;height:84px}.spirit-gym-hud__joystick::after{content:"";width:28px;height:28px;border:1px solid var(--ui-bronze);border-radius:50%;background:color-mix(in srgb,var(--ui-jade) 25%,transparent);transform:translate(var(--touch-stick-x,0px),var(--touch-stick-y,0px))}.spirit-gym-hud__touch-jump{right:6%;bottom:14%;width:62px;height:62px}.spirit-gym-hud__touch-dash{right:24%;bottom:8%;width:52px;height:52px}.spirit-gym-hud__touch-action.is-active{background:color-mix(in srgb,var(--ui-jade) 45%,transparent)}
[data-game-menu-open=true]>.spirit-gym-hud{visibility:hidden}
/* HUD groups shrink together, preserving the gap between the spheres and the tray. */
.spirit-gym-hud__loadout::after{content:"";position:absolute;inset:4px;background:var(--ui-motif-corner-nw) left top/20px 20px no-repeat,var(--ui-motif-corner-se) right bottom/20px 20px no-repeat;opacity:.55;pointer-events:none}
.spirit-gym-hud__round::after{content:"";position:absolute;width:5px;height:5px;bottom:-3px;left:calc(50% - 3px);border:1px solid var(--ui-bronze-light);background:var(--ui-recessed);transform:rotate(45deg);pointer-events:none}
@media(max-width:1100px){.spirit-gym-hud{--hud-tray-width:354px;--hud-orb-size:78px}.spirit-gym-hud__score{width:146px;padding:8px 12px;gap:8px 12px}.spirit-gym-hud__input-hint{max-width:180px;font-size:9px}}
@media(max-height:500px){.spirit-gym-hud{--hud-tray-width:314px;--hud-orb-size:64px;--hud-tray-bottom:84px}.spirit-gym-hud__identity{top:8px;left:12px;width:176px;padding:6px 10px}.spirit-gym-hud__name{display:none}.spirit-gym-hud__cultivation b{font-size:15px}.spirit-gym-hud__round{top:10px;padding:4px 16px;min-width:110px}.spirit-gym-hud__round span{font-size:23px}.spirit-gym-hud__score{top:62px;right:12px;width:130px;padding:7px 10px}.spirit-gym-hud__score span:last-child{display:none}.spirit-gym-hud__loadout{padding:6px 8px}.spirit-gym-hud__slot{height:50px;padding:4px 3px;gap:2px}.spirit-gym-hud__weapon-vitals{--weapon-vitals-size:22px}.spirit-gym-hud__weapon-health{inset:4px}.spirit-gym-hud__loadout-head{margin-bottom:4px}.spirit-gym-hud__input-hint{display:none}.spirit-gym-hud__dash{bottom:18px;left:12px}.spirit-gym-hud__resource-orb strong{font-size:10px;top:calc(100% + 10px)}.spirit-gym-hud__resource-orb small{font-size:10px}}

.spirit-gym-hud__slot{font-family:var(--ui-font-body);cursor:pointer}
.spirit-gym-hud__slot[data-automatic=true]{border-color:transparent}
.spirit-gym-hud__slot:not(.is-filled)>.weapon-activation-frame{display:none}
.spirit-gym-hud__slot:focus-visible{outline:var(--ui-focus) solid var(--ui-jade);outline-offset:2px}
.spirit-gym-hud__slot[data-automatic=false]{filter:saturate(.55)}
.spirit-gym-hud__slot:disabled{cursor:default;opacity:.4}
`,w=`M2 2H98V98H2Z`,T=`<span class="weapon-activation-frame" aria-hidden="true">
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
    <path class="weapon-activation-frame__track" d="${w}" vector-effect="non-scaling-stroke"/>
    <path class="weapon-activation-frame__glow" d="${w}" pathLength="100" vector-effect="non-scaling-stroke"/>
    <path class="weapon-activation-frame__spark" d="${w}" pathLength="100" vector-effect="non-scaling-stroke"/>
  </svg>
</span>`;function E(e,t,n){let r=String(t);e.dataset.automatic!==r&&(e.dataset.automatic=r),e.getAttribute(`aria-pressed`)!==r&&e.setAttribute(`aria-pressed`,r),e.setAttribute(`aria-label`,D(n,t))}function D(e,t){return`${e} · 自动攻击${t?`已开启，点击停止`:`已停止，点击开启`}`}var O=String.raw`
.weapon-activation-frame{--frame-metal:var(--ui-bronze);position:absolute;inset:0;z-index:2;display:block;pointer-events:none;color:var(--frame-metal)}
.weapon-activation-frame svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;fill:none;stroke:currentColor;stroke-linejoin:round}
.weapon-activation-frame__track{stroke-width:1;opacity:.65}
.weapon-activation-frame__glow,.weapon-activation-frame__spark{display:none;stroke-linecap:round}
.weapon-activation-frame__glow{stroke:var(--ui-jade);stroke-width:2;stroke-dasharray:12 38;opacity:.45}
.weapon-activation-frame__spark{stroke:var(--ui-text);stroke-width:1.2;stroke-dasharray:5 45}
[data-automatic=true]>.weapon-activation-frame{--frame-metal:var(--ui-jade);filter:drop-shadow(0 0 2px color-mix(in srgb,var(--ui-jade) 25%,transparent))}
[data-automatic=true]>.weapon-activation-frame .weapon-activation-frame__glow,[data-automatic=true]>.weapon-activation-frame .weapon-activation-frame__spark{display:block;animation:weapon-frame-orbit 2.4s linear infinite}
[data-automatic=true]>.weapon-activation-frame .weapon-activation-frame__track{opacity:.9}
@keyframes weapon-frame-orbit{from{stroke-dashoffset:0}to{stroke-dashoffset:-100}}
@media(prefers-reduced-motion:reduce){[data-automatic=true]>.weapon-activation-frame .weapon-activation-frame__glow,[data-automatic=true]>.weapon-activation-frame .weapon-activation-frame__spark{animation:none;stroke-dasharray:none}.weapon-activation-frame__glow{opacity:.2}}
`;function k(e){return`${Math.floor(Math.max(0,e)/60).toString().padStart(2,`0`)}:${Math.floor(Math.max(0,e)%60).toString().padStart(2,`0`)}`}function A(e){switch(e){case`docked-charging`:return`充`;case`departing`:return`出`;case`hunting-leg`:return`猎`;case`returning`:return`归`;case`disabled-docked`:return`损`;default:return`·`}}function j(e){return`data-hud-zone="${e.id}" data-hud-anchor="${e.anchor}" data-hud-fields="${e.data.join(` `)}"`}function M(e){let t=g.copy,n=j(e);switch(e.id){case`status`:return`<div class="spirit-gym-hud__status" ${n}>
        <div class="spirit-gym-hud__identity spirit-gym-hud__panel">
          <div class="spirit-gym-hud__name" title="${g.title}">此间修行 <span data-water-state hidden></span></div>
          <div class="spirit-gym-hud__cultivation"><b data-level></b><span data-cultivation></span></div><div class="spirit-gym-hud__xp-track"><i data-xp-fill></i></div>
        </div>
        <div class="spirit-gym-hud__resource-orb spirit-gym-hud__resource-orb--health" data-player-health-orb role="meter" aria-label="${t.health}">
          <div class="spirit-gym-hud__orb-well" aria-hidden="true"><div class="spirit-gym-hud__orb-liquid" data-hp-liquid><span class="spirit-gym-hud__orb-current"></span><span class="spirit-gym-hud__orb-current spirit-gym-hud__orb-current--rear"></span></div></div>
          <span class="spirit-gym-hud__orb-rune" aria-hidden="true">命</span>
          <strong data-hp-text></strong><small>${t.health}</small>
        </div>
        <div class="spirit-gym-hud__resource-orb spirit-gym-hud__resource-orb--qi" data-player-qi-orb role="meter" aria-label="${t.qi}">
          <div class="spirit-gym-hud__orb-well" aria-hidden="true"><div class="spirit-gym-hud__orb-liquid" data-qi-liquid><span class="spirit-gym-hud__orb-current"></span><span class="spirit-gym-hud__orb-current spirit-gym-hud__orb-current--rear"></span></div></div>
          <span class="spirit-gym-hud__orb-rune" aria-hidden="true">灵</span>
          <strong data-qi-text></strong><small>${t.qi}</small>
        </div>
      </div>`;case`round`:return`<div class="spirit-gym-hud__round spirit-gym-hud__panel" ${n}><strong data-wave></strong><span data-time></span></div>`;case`score`:return`<div class="spirit-gym-hud__score spirit-gym-hud__panel" ${n}>
        <span>${t.spiritStones}<b data-stones></b></span><span>${t.kills}<b data-kills></b></span><span>${t.enemies}<b data-enemies></b></span><span>${t.loot}<b data-loot></b></span>
      </div>`;case`loadout`:return`<div class="spirit-gym-hud__loadout spirit-gym-hud__panel" ${n}>
        <div class="spirit-gym-hud__loadout-main">
          <div class="spirit-gym-hud__loadout-head"><b>御器</b><span data-loadout-summary></span></div>
          <div class="spirit-gym-hud__slot-group"><span class="spirit-gym-hud__slot-group-label">飞剑</span><div class="spirit-gym-hud__slot-row" style="--hud-slot-count:${g.loadout.weapon.count}" data-weapon-slots></div></div>
          <div class="spirit-gym-hud__slot-group spirit-gym-hud__gear-group"><span class="spirit-gym-hud__slot-group-label">防具</span><div class="spirit-gym-hud__slot-row" style="--hud-slot-count:${g.loadout.gear.count}" data-gear-slots></div></div>
        </div>
        <button class="spirit-gym-hud__reset" type="button" title="${t.reset}" aria-label="${t.reset}">↻</button>
      </div>`;case`dash`:return`<div class="spirit-gym-hud__dash spirit-gym-hud__panel" data-dash ${n}></div>`;case`input-hint`:return`<div class="spirit-gym-hud__input-hint spirit-gym-hud__panel" data-input-hint ${n}>${t.keyboardHint}</div>`;case`shop`:return``;case`touch`:return`<div class="spirit-gym-hud__touch" aria-hidden="true" ${n}>
        <span class="spirit-gym-hud__joystick" data-touch-joystick></span>
        <span class="spirit-gym-hud__touch-action spirit-gym-hud__touch-dash" data-touch-dash>${t.touchDash}</span>
        <span class="spirit-gym-hud__touch-action spirit-gym-hud__touch-jump" data-touch-jump>${t.touchJump}</span>
      </div>`}throw Error(`[spirit-gym-hud] unsupported authored zone`)}function N(){return g.zones.map(M).join(`
`)}function P(e){if(e.mount===document.body)throw Error(`[spirit-gym-hud] ctx.uiRoot mount is required`);let t=document.createElement(`div`);t.className=`spirit-gym-hud`,t.innerHTML=`
    <style>${C}${O}${v}</style>
    ${N()}
  `,e.mount.appendChild(t);let r=e=>t.querySelector(e),i=r(`[data-hp-text]`),a=r(`[data-hp-liquid]`),o=r(`[data-qi-text]`),s=r(`[data-qi-liquid]`),u=r(`[data-player-health-orb]`),d=r(`[data-player-qi-orb]`),f=r(`[data-wave]`),m=r(`[data-time]`),_=r(`[data-stones]`),x=r(`[data-kills]`),S=r(`[data-enemies]`),w=r(`[data-level]`),D=r(`[data-cultivation]`),j=r(`[data-loot]`),M=r(`[data-loadout-summary]`),P=r(`[data-dash]`),F=r(`[data-input-hint]`),I=r(`[data-touch-joystick]`),L=r(`[data-touch-jump]`),R=r(`[data-touch-dash]`),z=[],B=[];if(g.loadout.weapon.count!==6||g.loadout.gear.count!==6)throw Error(`[spirit-gym-hud] authored slot capacities drifted from the playable loadout`);for(let t=0;t<g.loadout.weapon.count;t+=1){let n=document.createElement(`button`);n.type=`button`,n.dataset.autoAttackSlot=String(t),n.addEventListener(`click`,r=>{e.onToggleAutomaticAttack?.(t),r.detail>0&&n.blur()}),n.className=`spirit-gym-hud__slot is-weapon`,n.innerHTML=`<span class="spirit-gym-hud__weapon-vitals"><i class="spirit-gym-hud__weapon-health"><b class="spirit-gym-hud__weapon-phase"></b></i></span><span class="spirit-gym-hud__slot-copy"><span class="spirit-gym-hud__slot-name"></span><span class="spirit-gym-hud__slot-meta"></span></span>${T}`,z.push(n),r(`[data-weapon-slots]`).appendChild(n)}for(let e=0;e<g.loadout.gear.count;e+=1){let e=document.createElement(`span`);e.className=`spirit-gym-hud__slot`,e.innerHTML=`<span class="spirit-gym-hud__slot-name"></span><span class="spirit-gym-hud__slot-meta"></span>`,B.push(e),r(`[data-gear-slots]`).appendChild(e)}return r(`.spirit-gym-hud__reset`).addEventListener(`click`,()=>e.menu?e.menu.open(`journey`):e.onReset()),{update(v){let C=v.run;t.dataset.playerX=v.playerX.toFixed(4),t.dataset.playerY=v.playerY.toFixed(4),t.dataset.playerZ=v.playerZ.toFixed(4),t.dataset.grounded=v.grounded.toString();let T=r(`[data-water-state]`);T.hidden=!v.inWater;let O=v.waterSlowResistance??0;T.textContent=O>0?`${g.copy.inWater} · ${g.copy.clearWater} ${Math.round(O*100)}%`:g.copy.inWater,T.title=`水中移动速度 ×${Math.round(p(O)*100)}%`,t.dataset.attacking=v.attacking.toString(),t.dataset.phase=C.phase,t.dataset.activeEquipmentAttacks=v.activeEquipmentAttacks.toString(),t.dataset.gpuReturningSwordInstances=v.gpuReturningSwordInstances.toString(),t.dataset.gpuReturningSwordRenderEntities=v.gpuReturningSwordRenderEntities.toString(),t.dataset.combatFixedTicks=v.combatFixedTicks.toString(),t.dataset.combatDamageEvents=v.combatDamageEvents.toString(),t.dataset.combatActiveStatuses=v.combatActiveStatuses.toString(),t.dataset.combatBroadphaseCandidates=v.combatBroadphaseCandidates.toString(),t.dataset.combatNarrowphaseTests=v.combatNarrowphaseTests.toString(),t.dataset.combatDroppedEquipmentInstances=v.combatDroppedEquipmentInstances.toString(),t.dataset.equipmentMountVisuals=v.equipmentMountVisuals.toString(),t.dataset.flyingSwordsReady=v.flyingSwordsReady.toString(),t.dataset.flyingSwordsAttacking=v.flyingSwordsAttacking.toString(),t.dataset.cultivationLevel=v.cultivationLevel.toString(),t.dataset.cultivation=v.cultivation.toFixed(3),t.dataset.activePickups=v.activePickups.toString(),t.dataset.gpuPickupInstances=v.gpuPickupInstances.toString();let N=Math.max(0,Math.min(1,v.health/Math.max(1,v.maxHealth))),F=Math.max(0,Math.min(1,v.qi/Math.max(1,v.maxQi)));t.dataset.playerHealth=v.health.toFixed(3),t.dataset.playerMaxHealth=v.maxHealth.toFixed(3),t.dataset.playerQi=v.qi.toFixed(3),t.dataset.playerMaxQi=v.maxQi.toFixed(3);let I=b(v.health,v.maxHealth);i.textContent=`${I.current} / ${I.maximum}`,a.style.setProperty(`--resource-ratio`,String(N)),o.textContent=`${Math.ceil(Math.max(0,v.qi))} / ${v.maxQi}`,s.style.setProperty(`--resource-ratio`,String(F)),u.setAttribute(`aria-valuemin`,`0`),u.setAttribute(`aria-valuemax`,String(I.maximum)),u.setAttribute(`aria-valuenow`,String(I.current)),d.setAttribute(`aria-valuemin`,`0`),d.setAttribute(`aria-valuemax`,String(v.maxQi)),d.setAttribute(`aria-valuenow`,String(Math.max(0,v.qi))),u.classList.toggle(`is-low`,N<=.25),d.classList.toggle(`is-low`,F<=.2),f.textContent=C.phase===`combat`?`第 ${C.wave} 波`:`第 ${C.wave} 波结算`,m.textContent=C.phase===`combat`?k(C.waveRemaining):`休整`,_.textContent=v.spiritStones.toString(),x.textContent=v.kills.toString(),S.textContent=v.enemies.toString();let L=h(v.cultivationLevel);w.textContent=`${L.displayName}`,w.title=`境界第 ${L.stageIndex+1} 阶段`,D.textContent=`${Math.floor(v.cultivation)} / ${v.nextCultivation}`,j.textContent=`${v.remnants} / ${v.items}`,r(`[data-xp-fill]`).style.transform=`scaleX(${Math.min(1,v.cultivation/Math.max(1,v.nextCultivation))})`,e.menu?.updateRun(v),M.textContent=`${C.loadout.weaponDefinitionIds.filter(Boolean).length} / 6`;let V=v.dodgeKind===`blink`?`缩地`:`翻滚`;P.textContent=`${V} · ${v.dashReady?`就绪`:`调息`}`,R.textContent=V,P.dataset.ready=v.dashReady.toString();let H=new Map(v.weaponResources.map(e=>[e.slot,e]));for(let t=0;t<z.length;t+=1){let r=z[t],i=C.loadout.weaponDefinitionIds[t],a=i?n[i]:void 0,o=C.weaponMastery.find(e=>e.equipmentId===i),s=H.get(t),c=a?.family===`elemental-spell`?a:void 0;r.classList.toggle(`is-filled`,i!==null),r.classList.remove(`is-gear`),r.dataset.definitionId=i??``,r.dataset.element=a?.element??``,r.dataset.resourcePhase=s?.resourcePhase??``;let l=`${g.loadout.weapon.shortLabel}${t+1}`;r.querySelector(`.spirit-gym-hud__slot-name`).textContent=i?a?.name??i:`${l} · 空`,r.querySelector(`.spirit-gym-hud__slot-meta`).textContent=i?c?`每次 ${c.tiers[0].qiCost} 灵力`:s?`命 ${y(s.health,s.maxHealth,`/`)} · 灵 ${Math.ceil(s.qi)}/${Math.ceil(s.maxQi)}`:`器命 / 灵力同步中`:`待装配`;let u=r.querySelector(`.spirit-gym-hud__weapon-vitals`),d=r.querySelector(`.spirit-gym-hud__weapon-health`),f=r.querySelector(`.spirit-gym-hud__weapon-phase`),p=s?Math.max(0,Math.min(1,s.health/Math.max(1,s.maxHealth))):0,m=s?Math.max(0,Math.min(1,s.qi/Math.max(1,s.maxQi))):0;u.style.setProperty(`--qi-angle`,`${(m*360).toFixed(2)}deg`),d.style.setProperty(`--health-angle`,`${(p*360).toFixed(2)}deg`);let h=!!a&&(e.readAutomaticAttack?.(t)??!0);E(r,h,a?.name??`空武器位`),a||r.setAttribute(`aria-label`,`空武器位`),r.disabled=!a,f.textContent=a?h?c?`术`:A(s?.resourcePhase??``):`歇`:``,u.hidden=!!c||!i,u.setAttribute(`aria-hidden`,u.hidden?`true`:`false`),r.title=i?`${a?.name??i} · ${c?`每次消耗本人 ${c.tiers[0].qiCost} 灵力 · ${h?`自动施法`:`已停用`}`:s?`器命 ${y(s.health,s.maxHealth,`/`)} · 灵力 ${s.qi.toFixed(1)}/${s.maxQi.toFixed(1)} · 出鞘门槛 ${s.minimumLaunchQi.toFixed(1)} · ${s.bodyCount} 剑体${s.disabledBodyCount>0?` · ${s.disabledBodyCount} 失能`:``} · ${A(s.resourcePhase)}`:`资源尚未同步`} · 精通 ${o?.level??1}级 · 击杀 ${o?.kills??0} · 经验 ${o?.experience??0}/${o?.nextExperience??0}`:`${g.loadout.weapon.emptyTitle} ${t+1} · 空`}for(let e=0;e<B.length;e+=1){let t=B[e],n=C.loadout.gearIds[e],r=C.loadout.gearLevels[e]??0;t.classList.toggle(`is-filled`,n!==null),t.classList.toggle(`is-gear`,n!==null),t.dataset.definitionId=n??``,t.dataset.level=String(r);let i=`${g.loadout.gear.shortLabel}${e+1}`;t.querySelector(`.spirit-gym-hud__slot-name`).textContent=n?l[n].name:`${i} · 空`,t.querySelector(`.spirit-gym-hud__slot-meta`).textContent=n?`Lv.${r} · ${c(n,r)}`:`未装备`,t.title=n?`${l[n].name} · Lv.${r}/${l[n].maxLevel} · ${c(n,r)}`:`${g.loadout.gear.emptyTitle} ${e+1} · 空`}},handleInput(e){t.dataset.inputDevice!==e.activeDevice&&(t.dataset.inputDevice=e.activeDevice);let n=e.activeDevice===`gamepad`?g.copy.gamepadHint:e.activeDevice===`touch`?g.copy.touchHint:g.copy.keyboardHint;F.textContent!==n&&(F.textContent=n),(e.activeDevice===`touch`||e.touch.moveActive)&&(t.style.setProperty(`--touch-origin-x`,`${e.touch.moveOriginX*100}%`),t.style.setProperty(`--touch-origin-y`,`${e.touch.moveOriginY*100}%`),t.style.setProperty(`--touch-stick-x`,`${e.touch.moveX*30}px`),t.style.setProperty(`--touch-stick-y`,`${e.touch.moveY*30}px`)),I.classList.toggle(`is-active`,e.touch.moveActive),L.classList.toggle(`is-active`,e.touch.jumpActive),R.classList.toggle(`is-active`,e.touch.dashActive)},dispose(){t.remove()}}}var F=r,I=new Set([`encounter`,`ability-observed`,`defeat`,`negotiation`,`capture`,`field-study`,`captive-study`,`source-verified`,`spirit-commentary`,`mutation-sighted`,`mutation-triggered`,`mutation-captive-study`,`mutation-resonance`,`mutation-archetype`]),L=new Set([`mutation-sighted`,`mutation-triggered`,`mutation-captive-study`,`mutation-resonance`,`mutation-archetype`]),R=24,z=16,B=4096,V=new Set([`combat-runtime`,`field-observation`,`capture-system`,`research-bench`,`spirit-dialogue`,`verified-source`]),H=Object.freeze({encounter:[`field-observation`],"ability-observed":[`combat-runtime`,`field-observation`],defeat:[`combat-runtime`],negotiation:[`spirit-dialogue`],capture:[`capture-system`],"field-study":[`field-observation`,`research-bench`],"captive-study":[`research-bench`],"source-verified":[`verified-source`],"spirit-commentary":[`spirit-dialogue`],"mutation-sighted":[`field-observation`],"mutation-triggered":[`combat-runtime`],"mutation-captive-study":[`research-bench`],"mutation-resonance":[`spirit-dialogue`],"mutation-archetype":[`research-bench`,`verified-source`]}),U=new Set(a),W=new Set([`metal`,`wood`,`water`,`fire`,`earth`]);function G(e){if(!e.id||!e.name||!Array.isArray(e.requiredEvidenceGroups)||!Array.isArray(e.unlockedFields))throw Error(`invalid codex knowledge tier`);for(let t of e.requiredEvidenceGroups)if(t.length===0||!t.every(e=>I.has(e)))throw Error(`codex tier ${e.id} has invalid evidence group`);if(!e.unlockedFields.every(e=>typeof e==`string`&&e.length>0))throw Error(`codex tier ${e.id} has invalid unlocked field`);for(let t of e.requiredEvidenceGroups)Object.freeze(t);return Object.freeze(e.requiredEvidenceGroups),Object.freeze(e.unlockedFields),Object.freeze(e)}function K(e){if(!e.id||!e.entryId||!e.name||!e.provisionalName||!e.taxonomy||!e.wikiDocumentId||!U.has(e.enemyTemplateId)||!W.has(e.primaryElement)||e.abilityIds.length===0||!e.abilityIds.every(e=>typeof e==`string`&&e.length>0)||!e.mutationIds.every(e=>Object.hasOwn(f,e)))throw Error(`invalid codex species ${String(e.id)}`);return Object.freeze(e.abilityIds),Object.freeze(e.mutationIds),Object.freeze(e)}var q=Object.freeze(s.knowledgeTiers.map(e=>G(e))),J=Object.freeze(s.mutationStages.map(e=>G(e))),Y=Object.freeze(s.species.map(e=>K(e)));if(new Set(Y.map(e=>e.id)).size!==Y.length||new Set(Y.map(e=>e.enemyTemplateId)).size!==Y.length)throw Error(`codex species ids and enemyTemplateIds must be unique`);var X=Object.freeze(Object.fromEntries(Y.map(e=>[e.id,e]))),Z=Object.freeze(Object.fromEntries(Y.map(e=>[e.enemyTemplateId,e])));function Q(e,t){e.push(t),e.length>R&&e.splice(0,e.length-R)}function ee(e,t,n){e.has(t)||(e.add(t),e.size>n&&e.delete(e.values().next().value))}function $(e,t){let n=e[0];for(let r of e){if(!r.requiredEvidenceGroups.every(e=>e.some(e=>t.has(e))))break;n=r}return n}function te(e){return JSON.stringify([e.kind,e.source,e.occurredAt,e.speciesId??null,e.mutationId??null,e.subjectInstanceId??null,e.abilityId??null,e.note??null])}function ne(e){if(!e.eventId)throw Error(`codex evidence eventId must be non-empty`);if(!I.has(e.kind))throw Error(`unknown codex evidence kind ${String(e.kind)}`);if(!V.has(e.source))throw Error(`unknown codex evidence source ${String(e.source)}`);if(!H[e.kind].includes(e.source))throw Error(`codex evidence source ${e.source} cannot produce ${e.kind}`);if(!Number.isFinite(e.occurredAt)||e.occurredAt<0)throw Error(`codex evidence occurredAt must be finite and non-negative`);if(e.subjectInstanceId!==void 0&&e.subjectInstanceId.length===0)throw Error(`codex evidence subjectInstanceId must be non-empty`);if(e.note!==void 0&&e.note.length===0)throw Error(`codex evidence note must be non-empty`);let t=e.speciesId?X[e.speciesId]:void 0;if(e.speciesId&&!t)throw Error(`unknown codex species ${String(e.speciesId)}`);if(e.mutationId&&!f[e.mutationId])throw Error(`unknown codex mutation ${String(e.mutationId)}`);if(!t&&!e.mutationId)throw Error(`codex evidence requires a speciesId or mutationId`);if(L.has(e.kind)&&!e.mutationId)throw Error(`codex evidence ${e.kind} requires mutationId`);if(!L.has(e.kind)&&!t)throw Error(`codex evidence ${e.kind} requires speciesId`);if(e.kind===`ability-observed`){if(!e.abilityId||!t?.abilityIds.includes(e.abilityId))throw Error(`ability ${String(e.abilityId)} is not authored for ${String(e.speciesId)}`)}else if(e.abilityId!==void 0)throw Error(`codex evidence ${e.kind} cannot carry abilityId`);if(t&&e.mutationId&&!t.mutationIds.includes(e.mutationId))throw Error(`mutation ${e.mutationId} is not authored for ${t.id}`)}var re=class{speciesKnowledge=new Map;mutationKnowledge=new Map;eventFingerprints=new Map;eventOrder=[];revision=0;evidenceCount=0;constructor(){for(let e of Y)this.speciesKnowledge.set(e.id,{evidenceKinds:new Set,recentEvidenceIds:[],observedAbilityIds:new Set,knownMutationIds:new Set,defeatCount:0,negotiationCount:0,captureCount:0});for(let e of Object.keys(f))this.mutationKnowledge.set(e,{evidenceKinds:new Set,recentEvidenceIds:[],knownHostSpeciesIds:new Set,subjectInstanceIds:new Set})}record(e){ne(e);let t=te(e),n=this.eventFingerprints.get(e.eventId);if(n!==void 0){if(n!==t)throw Error(`codex evidence eventId ${e.eventId} has conflicting content`);return!1}if(this.eventFingerprints.set(e.eventId,t),this.eventOrder.push(e.eventId),this.eventOrder.length>B&&this.eventFingerprints.delete(this.eventOrder.shift()),e.speciesId){let t=this.speciesKnowledge.get(e.speciesId);t.evidenceKinds.add(e.kind),Q(t.recentEvidenceIds,e.eventId),e.abilityId&&t.observedAbilityIds.add(e.abilityId),e.mutationId&&t.knownMutationIds.add(e.mutationId),e.kind===`defeat`&&(t.defeatCount+=1),e.kind===`negotiation`&&(t.negotiationCount+=1),e.kind===`capture`&&(t.captureCount+=1)}if(e.mutationId){let t=this.mutationKnowledge.get(e.mutationId);t.evidenceKinds.add(e.kind),Q(t.recentEvidenceIds,e.eventId),e.speciesId&&t.knownHostSpeciesIds.add(e.speciesId),e.subjectInstanceId&&ee(t.subjectInstanceIds,e.subjectInstanceId,z)}return this.evidenceCount+=1,this.revision+=1,!0}snapshot(){return{schemaVersion:`1.0.0`,revision:this.revision,evidenceCount:this.evidenceCount,species:Y.map(e=>{let t=this.speciesKnowledge.get(e.id),n=$(q,t.evidenceKinds),r=n.unlockedFields.includes(`formalName`);return{speciesId:e.id,displayName:n.id===`unknown`?`未识别物种`:r?e.name:e.provisionalName,...r?{formalName:e.name}:{},tier:n.id,tierName:n.name,evidenceKinds:[...t.evidenceKinds],recentEvidenceIds:[...t.recentEvidenceIds],unlockedFields:[...n.unlockedFields],observedAbilityIds:[...t.observedAbilityIds],knownMutationIds:[...t.knownMutationIds],defeatCount:t.defeatCount,negotiationCount:t.negotiationCount,captureCount:t.captureCount}}),mutations:Object.keys(f).map(e=>{let t=this.mutationKnowledge.get(e),n=$(J,t.evidenceKinds),r=n.unlockedFields.includes(`formalName`);return{mutationId:e,displayName:n.id===`unknown`?`未识别变异`:r?f[e].name:`异常构造`,...r?{formalName:f[e].name}:{},stage:n.id,stageName:n.name,evidenceKinds:[...t.evidenceKinds],recentEvidenceIds:[...t.recentEvidenceIds],unlockedFields:[...n.unlockedFields],knownHostSpeciesIds:[...t.knownHostSpeciesIds],subjectInstanceIds:[...t.subjectInstanceIds]}})}}},ie=new Map(o.parts.flatMap(e=>{let t=e.material===`robe`?`robe`:e.material===`trim`||e.material===`ornament`?`accent`:void 0;return t?[[i(e.id),t]]:[]}));function ae(e){let t=e.slice(e.lastIndexOf(`Player_`));return t.startsWith(`Player_FinalRealm_`)?`aura`:ie.get(t)}async function oe(n,r){let i=[...new Set(m.flatMap(e=>Object.values(e.paletteGuids)))],a=await Promise.all(i.map(async e=>{let n=t.parse(e);if(!n.ok)throw Error(`[player-realm] invalid material GUID ${e}`);let i=await r.loadByGuid(n.value);if(!i.ok)throw Error(`[player-realm] material ${e} failed: ${JSON.stringify(i.error)}`);if(i.value.kind!==`material`)throw Error(`[player-realm] ${e} is not a material`);return i.value})),o=[];try{for(let e of a)o.push(d(n,`MaterialAsset`,e,`player realm`))}catch(e){throw u(o,`player realm allocation rollback`),e}let s=new Map(i.map((e,t)=>[e,o[t].handle]));return{apply(t,r){let i=m[h(r+1).realmIndex],a=new Map;for(let r of t){let t=ae(r.name);if(!t)continue;let o=[s.get(i.paletteGuids[t])];n.set(r.entity,e,{materials:o}).unwrap(),a.set(r.entity,o)}return a},dispose(){u(o,`player realm palette`)}}}export{re as a,P as c,Z as i,T as l,q as n,J as o,Y as r,F as s,oe as t,O as u};