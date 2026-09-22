function e(e,t){let n=e.ownerDocument,r=n.defaultView;if(!r)throw Error(`[preview-controls] panel has no browser window`);let i=n.createElement(`details`);i.className=`preview-controls-disclosure`,i.open=!new URLSearchParams(r.location.search).has(`parentOrigin`)&&r.innerWidth>=1e3;let a=n.createElement(`summary`);a.textContent=t;let o=n.createElement(`div`);o.className=`preview-controls-content`,o.append(...e.childNodes),i.append(a,o),e.dataset.previewControlsShell=`true`,Object.assign(e.style,{position:`absolute`,left:`auto`,right:`8px`,bottom:`auto`,top:`max(42px, var(--forgeax-viewport-metrics-inset, 42px))`,width:`min(320px, calc(100% - 16px))`,maxWidth:`calc(100% - 16px)`,maxHeight:`calc(100% - 56px)`,padding:`0`,overflow:`hidden`,borderRadius:`6px`,pointerEvents:`auto`,zIndex:`30`});let s=n.createElement(`style`);s.textContent=`
    [data-preview-controls-shell] .preview-controls-disclosure>summary{padding:10px 12px;cursor:pointer;font:600 12px/1.4 system-ui,sans-serif;color:#dcebe5}
    [data-preview-controls-shell]:has(>.preview-controls-disclosure:not([open])){width:max-content!important;min-width:156px}
    [data-preview-controls-shell] .preview-controls-content{padding:4px 12px 12px;max-height:calc(100dvh - 104px);overflow:auto;overscroll-behavior:contain;scrollbar-width:thin}
    [data-preview-controls-shell] .preview-controls-content h1{font-size:14px}
    [data-preview-controls-shell] .preview-controls-content button{min-height:28px;cursor:pointer}
    [data-preview-controls-shell] .preview-controls-content header{display:block}
    [data-preview-controls-shell] .audio-direction-workbench__grid{grid-template-columns:minmax(0,1fr)}
    [data-preview-controls-shell] .audio-direction-workbench__rule{display:none}
  `,e.append(s,i)}export{e as t};