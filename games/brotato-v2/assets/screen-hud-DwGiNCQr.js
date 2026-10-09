import{p as e}from"./waves-BjZobv8V.js";import{s as t}from"./economy-voKleMxe.js";function n(e){return Math.max(0,Math.min(1,e))}function r(e){return e.phase===`itemfound`||e.phase===`bagging`?Math.max(1,e.clearedWave||e.wave):e.wave}var i={mount(i,a){i.className=`brotato-hud-layer`,i.innerHTML=`
      <div class="brotato-arena-hud">
        <div class="brotato-arena-hud-left">
          <div class="brotato-arena-bar brotato-arena-hp">
            <i data-slot="health"></i>
            <i class="residual" data-slot="residual"></i>
            <span data-slot="health-label"></span>
          </div>
          <div class="brotato-arena-bar brotato-arena-xp">
            <i data-slot="xp-progress"></i>
            <span data-slot="level"></span>
          </div>
          <div class="brotato-arena-currencies">
            <div class="brotato-arena-currency">
              <span class="brotato-arena-coin" aria-hidden="true"></span>
              <b data-slot="materials">0</b>
              <button type="button" class="brotato-test-grant-materials" data-action="test-grant-materials" data-amount="100" hidden title="一键获取材料">+100</button>
            </div>
            <div class="brotato-arena-currency">
              <span class="brotato-arena-sack" aria-hidden="true"></span>
              <b data-slot="missed">0</b>
            </div>
          </div>
        </div>
        <div class="brotato-arena-hud-center">
          <b data-slot="wave"></b>
          <strong data-slot="countdown"></strong>
        </div>
        <div class="brotato-arena-hud-right">
          <button class="brotato-hud-pause" aria-label="暂停" data-action="pause">II</button>
          <div class="brotato-arena-badges">
            <div class="brotato-arena-badge" data-slot="upgrade-badge" title="待选升级">
              <span class="brotato-arena-upgrade-icon" aria-hidden="true"></span>
              <b data-slot="upgrades">0</b>
            </div>
            <div class="brotato-arena-badge" data-slot="crate-badge" title="待处理道具">
              <span class="brotato-arena-crate-icon" aria-hidden="true"></span>
              <b data-slot="crates">0</b>
            </div>
          </div>
          <button class="brotato-test-debug-button" data-action="test-overlay">调试</button>
          <div class="brotato-test-hud-toggles" data-slot="test-collision-toggles" hidden>
            <label><input data-test-config="characterCollision" type="checkbox"> 角色碰撞</label>
            <label><input data-test-config="showColliders" type="checkbox"> 碰撞体</label>
          </div>
        </div>
      </div>
      <div class="brotato-test-performance" data-slot="test-performance">
        <span data-slot="test-enemies">怪物 --</span>
        <span data-slot="test-fps">FPS --</span>
      </div>
    `;let o=0,s=-1,c=!1,l=0,u=e=>{e.target.closest(`[data-action="pause"]`)!==null&&a.togglePause(),e.target.closest(`[data-action="test-overlay"]`)!==null&&a.toggleTestOverlay();let t=e.target.closest(`[data-action="test-grant-materials"]`);t!==null&&a.grantTestMaterials(Number(t.dataset.amount??100))},d=e=>{let t=e.target;!(t instanceof HTMLInputElement)||t.dataset.testConfig===void 0||a.updateTestConfig({[t.dataset.testConfig]:t.checked})};return i.addEventListener(`click`,u),i.addEventListener(`change`,d),{root:i,patch:({state:a,hud:u,test:d})=>{let f=a.phase===`bagging`,p=a.phase===`combat`||a.phase===`paused`||a.phase===`itemfound`||f;if(i.hidden=!p,!p){c=!1;return}let m=a.phase===`itemfound`||f,h=e(a.wave),g=i.querySelector(`[data-action="test-overlay"]`);g.hidden=!a.testMode;let _=i.querySelector(`[data-action="test-grant-materials"]`);_.hidden=!a.testMode;let v=i.querySelector(`[data-slot="test-collision-toggles"]`);v.hidden=!a.testMode;let y=v.querySelector(`[data-test-config="characterCollision"]`);y!==null&&(y.checked=d?.config.characterCollision!==!1);let b=v.querySelector(`[data-test-config="showColliders"]`);b!==null&&(b.checked=d?.config.showColliders===!0),i.querySelector(`[data-action="pause"]`).hidden=m;let x=i.querySelector(`[data-slot="test-performance"]`);x.hidden=!a.testMode;let S=u.presentedFps;i.querySelector(`[data-slot="test-enemies"]`).textContent=`怪物 ${u.liveEnemies}`,i.querySelector(`[data-slot="test-fps"]`).textContent=`FPS ${S===void 0?`--`:S.toFixed(0)}`;let C=Math.max(0,u.health),w=Math.max(1,u.maxHealth),T=r(a);(!c||T!==s)&&(o=C),c=!0,s=T;let E=o;C<E&&(l=performance.now()+300),o=C;let D=Math.max(1,t(a.level));i.querySelector(`[data-slot="wave"]`).textContent=`第${r(a)}波`;let O=i.querySelector(`[data-slot="countdown"]`),k=m||a.wave===20&&!a.testMode;O.hidden=k,O.textContent=k?``:a.testMode?`--`:`${Math.max(0,Math.ceil(h.durationSec-a.waveClock))}`,i.querySelector(`[data-slot="level"]`).textContent=`LV.${a.level}`,i.querySelector(`[data-slot="materials"]`).textContent=a.testMode&&a.infiniteMaterials?`∞`:String(Math.floor(a.materials));let A=a.bag;i.querySelector(`.brotato-arena-sack`).classList.toggle(`receiving`,f&&a.phaseClock>.65&&a.lastMissed>0),i.querySelector(`[data-slot="missed"]`).textContent=String(Math.max(0,Math.floor(A))),i.querySelector(`[data-slot="xp-progress"]`).style.width=`${n(a.xp/D)*100}%`;let j=i.querySelector(`[data-slot="health"]`);j.style.width=`${n(C/w)*100}%`,i.querySelector(`[data-slot="health-label"]`).textContent=`${Math.ceil(C)} / ${Math.ceil(w)}`,i.classList.toggle(`low-health`,C/w<.3),i.parentElement?.classList.toggle(`low-health`,C/w<.3);let M=i.querySelector(`[data-slot="residual"]`);M.style.width=`${n((C<E?E:C)/w)*100}%`,M.classList.toggle(`active`,performance.now()<l);let N=Math.max(0,Math.floor(a.pendingUpgrades)),P=Math.max(0,a.pendingCrateItems.length);i.querySelector(`[data-slot="upgrades"]`).textContent=String(N),i.querySelector(`[data-slot="crates"]`).textContent=String(P),i.querySelector(`[data-slot="upgrade-badge"]`).classList.toggle(`empty`,N<=0),i.querySelector(`[data-slot="crate-badge"]`).classList.toggle(`empty`,P<=0)},dispose:()=>{i.removeEventListener(`click`,u),i.removeEventListener(`change`,d),i.replaceChildren()}}}};export{i as t};