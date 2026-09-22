import{r as e}from"./behavior-runtime-BGjteNvd.js";var t=e.theme;function n(e,n=0){let r=t.ornaments[e],[,,i,a]=r.viewBox.split(` `).map(Number),o=r.paths.map(e=>`<path d="${e.d}" fill="${e.fill===`none`?`none`:t.colors.carvingInk}" fill-rule="evenodd"/>`).join(``),s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r.viewBox}" stroke="${t.colors.jadeCarving}" stroke-width="1.5" fill="none"><g transform="rotate(${n} ${i/2} ${a/2})">${o}</g></svg>`;return`url("data:image/svg+xml,${encodeURIComponent(s).replace(/'/g,`%27`)}")`}var r=[`--ui-motif-disc:${n(`disc`)}`,`--ui-motif-seal:${n(`seal`)}`,...[`nw`,`ne`,`se`,`sw`].map((e,t)=>`--ui-motif-corner-${e}:${n(`corner`,t*90)}`)].join(`;`)+`;`,i=e.theme,a=e=>e.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`),o=[...Object.entries(i.colors).map(([e,t])=>`--ui-${a(e)}:${t}`),...Object.entries(i.fonts).map(([e,t])=>`--ui-font-${e}:${t}`),...Object.entries(i.space).map(([e,t])=>`--ui-space-${e}:${t}px`),...Object.entries(i.shape).map(([e,t])=>`--ui-${e}:${t}px`),...Object.entries(i.motion).map(([e,t])=>`--ui-${a(e)}:${t}ms`),`--ui-rainbow:linear-gradient(120deg,${i.rainbow.join(`,`)})`,`--ui-line:color-mix(in srgb,var(--ui-bronze) 40%,transparent)`,`--ui-panel:color-mix(in srgb,var(--ui-surface) 94%,transparent)`].join(`;`)+`;`+r,s=String.raw`
@media (pointer:coarse), (max-width:700px) {
  .spirit-gym-hud{--mobile-left:max(10px,env(safe-area-inset-left));--mobile-right:max(10px,env(safe-area-inset-right));--mobile-top:max(10px,env(safe-area-inset-top));--mobile-bottom:max(8px,env(safe-area-inset-bottom))}
  .spirit-gym-hud__status{position:absolute;left:var(--mobile-left);top:var(--mobile-top);width:176px;height:140px;background:none;border:0;padding:0}
  .spirit-gym-hud__identity{position:static;width:100%;height:32px;padding:3px 8px;background:linear-gradient(90deg,var(--ui-panel),transparent);border-left:1px solid var(--ui-bronze)}
  .spirit-gym-hud__name{display:none}
  .spirit-gym-hud__cultivation b{font-size:14px}
  .spirit-gym-hud__cultivation>span{font-size:10px}
  .spirit-gym-hud__xp-track{margin-top:3px}
  .spirit-gym-hud__resource-orb,.spirit-gym-hud__resource-orb--qi{position:absolute;left:9px;right:auto;top:57px;bottom:auto;width:58px;height:58px;border-width:2px}
  .spirit-gym-hud__resource-orb--qi{left:auto;right:12px}
  .spirit-gym-hud__resource-orb::before{inset:-7px}
  .spirit-gym-hud__resource-orb small{font-size:10px;bottom:calc(100% + 8px);letter-spacing:.06em}
  .spirit-gym-hud__resource-orb strong{font-size:10px;top:calc(100% + 8px);padding-inline:3px}
  .spirit-gym-hud__orb-rune{font-size:18px}
  .spirit-gym-hud__round{left:auto;right:var(--mobile-right);top:calc(var(--mobile-top) + 52px);bottom:auto;transform:none;width:100px;min-width:0;padding:4px 6px;border:0;border-radius:var(--ui-corner);background:color-mix(in srgb,var(--ui-surface) 75%,transparent)}
  .spirit-gym-hud__round strong{font-size:11px;letter-spacing:0}
  .spirit-gym-hud__round span{font-size:20px;line-height:1.1}
  .spirit-gym-hud__score{top:calc(var(--mobile-top) + 146px);left:var(--mobile-left);right:var(--mobile-right);bottom:auto;width:auto;display:flex;gap:14px;padding:3px 6px;font-size:10px;background:color-mix(in srgb,var(--ui-surface) 50%,transparent);border:0;border-radius:4px}
  .spirit-gym-hud__score span{gap:5px}
  .spirit-gym-hud__score b{font-size:12px}
  .spirit-gym-hud__score span:last-child{display:none}
  .spirit-gym-hud__loadout{bottom:calc(var(--mobile-bottom) + 54px);width:calc(100% - var(--mobile-left) - var(--mobile-right));max-width:380px;padding:0;border:0;background:none}
  .spirit-gym-hud__loadout-head,.spirit-gym-hud__loadout::after{display:none}
  .spirit-gym-hud__slot-row{gap:3px}
  .spirit-gym-hud__slot{height:54px;min-height:46px;padding:3px 1px;gap:2px;border-radius:5px;background:color-mix(in srgb,var(--ui-surface) 86%,transparent)}
  .spirit-gym-hud__slot-name{font-size:10px}
  .spirit-gym-hud__weapon-vitals{--weapon-vitals-size:26px}.spirit-gym-hud__weapon-health{inset:5px}
  .spirit-gym-hud__input-hint,.spirit-gym-hud__dash{display:none}
  .spirit-gym-hud__touch{display:block}
  .spirit-gym-hud__joystick{left:calc(var(--mobile-left) + 4px);top:auto;bottom:calc(var(--mobile-bottom) + 130px);width:96px;height:96px;background:color-mix(in srgb,var(--ui-surface) 40%,transparent);border:2px solid var(--ui-bronze)}
  .spirit-gym-hud__joystick::after{width:32px;height:32px}
  .spirit-gym-hud__touch-action{width:64px;height:64px;font-size:13px;border:2px solid var(--ui-bronze);background:color-mix(in srgb,var(--ui-surface) 60%,transparent)}
  .spirit-gym-hud__touch-jump{right:var(--mobile-right);bottom:calc(var(--mobile-bottom) + 164px)}
  .spirit-gym-hud__touch-dash{right:calc(var(--mobile-right) + 74px);bottom:calc(var(--mobile-bottom) + 124px)}
  [data-game-menu-open=true] .spirit-gym-hud{visibility:hidden}
  #expedition-primary-actions{left:max(10px,env(safe-area-inset-left));right:max(10px,env(safe-area-inset-right));bottom:max(8px,env(safe-area-inset-bottom));width:auto;max-width:480px;margin:0 auto;gap:4px}
  #expedition-primary-actions button{min-width:46px;min-height:46px;height:46px;padding:5px 7px;font-size:12px;touch-action:manipulation}
}
@media (pointer:coarse) and (orientation:landscape) and (min-width:700px) {
  .spirit-gym-hud__round{left:50%;right:auto;top:var(--mobile-top);transform:translateX(-50%);width:112px}
  .spirit-gym-hud__score{top:calc(var(--mobile-top) + 146px);right:auto;width:180px;gap:8px;font-size:9px}
  .spirit-gym-hud__loadout{max-width:304px}
  .spirit-gym-hud__joystick{bottom:calc(var(--mobile-bottom) + 8px)}
  .spirit-gym-hud__touch-jump{bottom:calc(var(--mobile-bottom) + 74px)}
  .spirit-gym-hud__touch-dash{bottom:calc(var(--mobile-bottom) + 4px)}
  #expedition-primary-actions{max-width:304px}
}
`,c=String.raw`
@media (pointer:coarse), (max-width:700px) {
  .spirit-menu{font-size:14px}
  .spirit-menu__launcher{top:max(10px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));min-width:88px;min-height:46px;padding:0 10px;font-size:13px}
  .spirit-menu__launcher kbd{display:none}
  .spirit-menu__dialog{inset:max(4px,env(safe-area-inset-top)) max(0px,env(safe-area-inset-right)) calc(max(8px,env(safe-area-inset-bottom)) + 52px) max(0px,env(safe-area-inset-left));grid-template-rows:52px 48px minmax(0,1fr)}
  .spirit-menu__header{padding:2px 10px;gap:8px}
  .spirit-menu__header h1{font-size:18px}
  .spirit-menu__header small,.spirit-menu__paused,.spirit-menu__seal{display:none}
  .spirit-menu button{min-height:46px;touch-action:manipulation}
  .spirit-menu__return{min-height:46px;font-size:13px;padding:6px 12px}
  .spirit-menu__nav{padding:0 4px;gap:0;overflow-x:auto}
  .spirit-menu__nav button{min-width:46px;min-height:46px;flex:1;padding:4px 6px;font-size:13px;white-space:nowrap;letter-spacing:0}
  .spirit-menu__journey{padding:16px;overscroll-behavior:contain}
  .spirit-menu .spirit-audio-settings__body,.spirit-menu .forgeax-presentation-settings__panel{padding:16px}
  .spirit-menu .forgeax-presentation-settings fieldset{grid-template-columns:90px minmax(50px,1fr) 48px;gap:12px 6px}
  .spirit-menu input[type=range],.spirit-menu select{min-height:46px}
}
`;export{o as i,c as n,i as r,s as t};