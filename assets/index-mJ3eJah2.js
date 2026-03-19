(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))e(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&e(s)}).observe(document,{childList:!0,subtree:!0});function n(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function e(r){if(r.ep)return;r.ep=!0;const i=n(r);fetch(r.href,i)}})();const ae="modulepreload",re=function(t){return"/Proyect2/"+t},R={},F=function(a,n,e){let r=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),o=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));r=Promise.allSettled(n.map(d=>{if(d=re(d),d in R)return;R[d]=!0;const c=d.endsWith(".css"),f=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${f}`))return;const p=document.createElement("link");if(p.rel=c?"stylesheet":ae,c||(p.as="script"),p.crossOrigin="",p.href=d,o&&p.setAttribute("nonce",o),document.head.appendChild(p),c)return new Promise((w,te)=>{p.addEventListener("load",w),p.addEventListener("error",()=>te(new Error(`Unable to preload CSS for ${d}`)))})}))}function i(s){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=s,window.dispatchEvent(o),!o.defaultPrevented)throw s}return r.then(s=>{for(const o of s||[])o.status==="rejected"&&i(o.reason);return a().catch(i)})};function ne(){const t=document.createElement("style");t.textContent=`
:root{
  --sky:#4a90d9;--sky2:#6aaee8;--sky3:#2672b8;
  --sky-bg:#e8f4fd;--sky-bg2:#cce4f7;
  --white:#ffffff;--off:#f5f9fe;--off2:#eaf3fc;
  --text:#1a2e42;--text2:#4a6580;--text3:#7a95aa;
  --border:rgba(74,144,217,.18);--border2:rgba(74,144,217,.32);
  --green:#2e9e6b;--green-bg:#e6f7f0;
  --amber:#c07820;--amber-bg:#fef3e2;
  --rose:#c0405a;--rose-bg:#fdedf0;
  --shadow-sm:0 2px 8px rgba(74,144,217,.10);
  --shadow:0 4px 20px rgba(74,144,217,.14);
  --shadow-lg:0 8px 32px rgba(74,144,217,.18);
  --r:14px;--r2:10px;
  --serif:'Lora',Georgia,serif;
  --sans:'Nunito',sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{min-height:100%;background:var(--off);color:var(--text);font-family:var(--sans);scroll-behavior:smooth}
::selection{background:var(--sky-bg2);color:var(--sky3)}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:var(--off)}
::-webkit-scrollbar-thumb{background:var(--sky-bg2);border-radius:3px}

/* AUTH */
#auth-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:linear-gradient(160deg,var(--sky-bg) 0%,var(--white) 60%)}
.auth-wrap{width:100%;max-width:420px}
.auth-hero{text-align:center;margin-bottom:1.8rem}
.auth-dove{display:inline-flex;align-items:center;justify-content:center;width:76px;height:76px;border-radius:50%;background:white;border:3px solid var(--sky-bg2);font-size:2.2rem;margin-bottom:.9rem;box-shadow:var(--shadow)}
.auth-hero h1{font-family:var(--serif);font-size:1.9rem;color:var(--sky3);font-weight:600}
.auth-hero .cong-name{font-size:.82rem;color:var(--text2);margin-top:.25rem;letter-spacing:.08em;text-transform:uppercase;font-weight:600}
.auth-card{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:1.8rem;box-shadow:var(--shadow)}
.tab-row{display:flex;background:var(--off);border-radius:var(--r2);padding:4px;margin-bottom:1.4rem;gap:4px}
.tab-btn{flex:1;padding:.5rem;border:none;background:transparent;color:var(--text2);border-radius:8px;cursor:pointer;font-family:var(--sans);font-size:.88rem;font-weight:500;transition:all .2s}
.tab-btn.active{background:var(--sky);color:white;font-weight:600}
.fg{margin-bottom:.9rem}
.fg label{display:block;font-size:.73rem;color:var(--text2);margin-bottom:.35rem;letter-spacing:.06em;text-transform:uppercase;font-weight:600}
.fg input,.fg select,.fg textarea{width:100%;padding:.68rem 1rem;background:var(--off);border:1.5px solid var(--border);border-radius:var(--r2);color:var(--text);font-family:var(--sans);font-size:.93rem;transition:border-color .2s,box-shadow .2s;outline:none}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:var(--sky);box-shadow:0 0 0 3px rgba(74,144,217,.12)}
.fg textarea{resize:vertical;min-height:80px}
.fg select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234a6580' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:2rem}
.btn-sky{width:100%;padding:.78rem;background:linear-gradient(135deg,var(--sky),var(--sky2));color:white;border:none;border-radius:var(--r2);font-family:var(--sans);font-size:.95rem;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 4px 12px rgba(74,144,217,.3)}
.btn-sky:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(74,144,217,.4)}
.btn-sky:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
.auth-err{background:var(--rose-bg);border:1px solid rgba(192,64,90,.25);border-radius:8px;padding:.6rem .9rem;color:var(--rose);font-size:.83rem;margin-top:.7rem;display:none}
.auth-hint{text-align:center;margin-top:.9rem;font-size:.73rem;color:var(--text3);line-height:1.6}

/* HEADER */
#app{display:flex;flex-direction:column;min-height:100vh}
header{position:sticky;top:0;z-index:200;background:rgba(255,255,255,.92);backdrop-filter:blur(16px);border-bottom:1.5px solid var(--border);box-shadow:var(--shadow-sm);display:flex;align-items:center;justify-content:space-between;padding:.75rem 1.5rem;gap:1rem}
.brand{display:flex;align-items:center;gap:.6rem;font-family:var(--serif);font-size:1.25rem;color:var(--sky3);font-weight:600}
.brand-icon{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--sky-bg),var(--sky-bg2));border:2px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
.brand-sub{font-size:.7rem;color:var(--text3);font-family:var(--sans);text-transform:uppercase;letter-spacing:.07em;font-weight:600;margin-top:-.1rem}
.hdr-right{display:flex;align-items:center;gap:.6rem}
.user-pill{background:var(--sky-bg);border:1.5px solid var(--border2);border-radius:20px;padding:.32rem .8rem;font-size:.78rem;display:flex;align-items:center;gap:.45rem;color:var(--text2);font-weight:500}
.role-pip{width:7px;height:7px;border-radius:50%;background:var(--green);flex-shrink:0}
.role-pip.admin{background:var(--sky)}
.btn-out{background:transparent;border:1.5px solid var(--border2);border-radius:8px;color:var(--text2);padding:.32rem .7rem;cursor:pointer;font-size:.78rem;font-family:var(--sans);font-weight:500;transition:all .2s}
.btn-out:hover{border-color:var(--rose);color:var(--rose);background:var(--rose-bg)}

/* NAV */
nav{display:flex;overflow-x:auto;scrollbar-width:none;gap:.2rem;padding:.55rem 1rem;background:var(--white);border-bottom:1.5px solid var(--border)}
nav::-webkit-scrollbar{display:none}
.nt{flex-shrink:0;display:flex;align-items:center;gap:.38rem;padding:.45rem .9rem;border:none;background:transparent;color:var(--text2);border-radius:8px;cursor:pointer;font-family:var(--sans);font-size:.82rem;font-weight:600;transition:all .2s;white-space:nowrap}
.nt:hover{background:var(--sky-bg);color:var(--sky3)}
.nt.active{background:var(--sky);color:white;box-shadow:0 2px 8px rgba(74,144,217,.3)}
.nt .ic{font-size:.92rem}
#install-bar{display:none;align-items:center;gap:1rem;padding:.65rem 1.5rem;flex-wrap:wrap;background:linear-gradient(90deg,var(--sky-bg),var(--white));border-bottom:1px solid var(--border);font-size:.84rem;color:var(--text2)}
#install-bar.show{display:flex}
#btn-install{padding:.38rem 1rem;background:var(--sky);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-family:var(--sans);font-size:.82rem}

/* MAIN */
main{flex:1;padding:1.4rem;max-width:1100px;width:100%;margin:0 auto}
.page{display:none}
.page.active{display:block;animation:fadeUp .28s ease}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* COMPONENTS */
.section-hd{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:1.2rem;flex-wrap:wrap;gap:.6rem}
.section-title{font-family:var(--serif);font-size:1.55rem;color:var(--sky3);font-weight:600}
.section-sub{font-size:.8rem;color:var(--text3);font-weight:500}
.card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--r);padding:1.3rem;margin-bottom:1rem;box-shadow:var(--shadow-sm)}
.card-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;gap:.5rem;flex-wrap:wrap}
.card-title{font-family:var(--serif);font-size:1.05rem;color:var(--sky3);font-weight:600}

/* BADGES */
.badge{display:inline-flex;align-items:center;padding:.2rem .62rem;border-radius:20px;font-size:.72rem;font-weight:700;letter-spacing:.03em}
.b-sky{background:var(--sky-bg);color:var(--sky3);border:1px solid var(--border2)}
.b-green{background:var(--green-bg);color:var(--green);border:1px solid rgba(46,158,107,.2)}
.b-amber{background:var(--amber-bg);color:var(--amber);border:1px solid rgba(192,120,32,.2)}
.b-rose{background:var(--rose-bg);color:var(--rose);border:1px solid rgba(192,64,90,.2)}
.b-gray{background:var(--off2);color:var(--text2);border:1px solid var(--border)}

/* BUTTONS */
.btn-sm{padding:.36rem .8rem;border-radius:8px;font-family:var(--sans);font-size:.79rem;font-weight:600;cursor:pointer;transition:all .2s;border:1.5px solid var(--border2);background:var(--white);color:var(--sky3)}
.btn-sm:hover{background:var(--sky-bg);border-color:var(--sky)}
.btn-sm.danger{color:var(--rose);border-color:rgba(192,64,90,.25)}
.btn-sm.danger:hover{background:var(--rose-bg);border-color:var(--rose)}
.btn-action{padding:.65rem 1.3rem;background:linear-gradient(135deg,var(--sky),var(--sky2));color:white;border:none;border-radius:var(--r2);font-family:var(--sans);font-size:.9rem;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 3px 10px rgba(74,144,217,.28)}
.btn-action:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(74,144,217,.38)}

/* GRID */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
@media(max-width:700px){.g2,.g3,.g4{grid-template-columns:1fr}}
@media(max-width:900px){.g3,.g4{grid-template-columns:1fr 1fr}}

/* STAT */
.stat{background:var(--white);border:1.5px solid var(--border);border-radius:var(--r);padding:1.1rem 1.2rem;display:flex;align-items:center;gap:.9rem;box-shadow:var(--shadow-sm);transition:box-shadow .2s}
.stat:hover{box-shadow:var(--shadow)}
.stat-icon{font-size:1.7rem;flex-shrink:0}
.stat-val{font-family:var(--serif);font-size:1.9rem;color:var(--sky3);line-height:1;font-weight:600}
.stat-lbl{font-size:.76rem;color:var(--text2);margin-top:.15rem;font-weight:600}

/* NOTIF */
.notif{display:none;align-items:center;gap:1rem;background:linear-gradient(135deg,var(--sky-bg),var(--white));border:1.5px solid var(--border2);border-left:4px solid var(--sky);border-radius:var(--r);padding:1rem 1.3rem;margin-bottom:1.3rem;box-shadow:var(--shadow-sm)}
.notif.show{display:flex}
.notif-ico{font-size:1.8rem;flex-shrink:0}
.notif h3{font-family:var(--serif);font-size:1rem;color:var(--sky3);margin-bottom:.18rem;font-weight:600}
.notif p{font-size:.83rem;color:var(--text2)}

/* MEETING */
.meeting-item{display:flex;gap:1rem;align-items:flex-start}
.meet-date{min-width:52px;background:var(--sky);border-radius:var(--r2);display:flex;flex-direction:column;align-items:center;padding:.5rem .4rem;flex-shrink:0;box-shadow:0 3px 10px rgba(74,144,217,.25)}
.meet-day{font-family:var(--serif);font-size:1.5rem;color:white;line-height:1;font-weight:600}
.meet-mon{font-size:.63rem;text-transform:uppercase;color:rgba(255,255,255,.8);letter-spacing:.06em;margin-top:.1rem}
.meet-body h4{font-weight:700;margin-bottom:.22rem;color:var(--text)}
.meet-body p{font-size:.83rem;color:var(--text2);line-height:1.5}
.meet-tags{display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.45rem}
.meet-type-tabs{display:flex;gap:.4rem;margin-bottom:1rem;flex-wrap:wrap}
.mtt{padding:.42rem 1rem;border:1.5px solid var(--border2);border-radius:8px;background:var(--white);color:var(--text2);font-size:.82rem;font-weight:700;cursor:pointer;transition:all .2s;font-family:var(--sans)}
.mtt.active{background:var(--sky);color:white;border-color:var(--sky)}

/* ANNOUNCEMENT */
.ann{border-left:4px solid var(--sky);padding:.85rem 1rem;background:var(--white);border-radius:0 var(--r2) var(--r2) 0;margin-bottom:.85rem;border:1px solid var(--border);border-left-width:4px;box-shadow:var(--shadow-sm)}
.ann.urgent{border-left-color:var(--rose);background:var(--rose-bg)}
.ann.info{border-left-color:var(--green)}
.ann h4{font-weight:700;margin-bottom:.18rem;color:var(--text);font-size:.93rem}
.ann p{font-size:.83rem;color:var(--text2);line-height:1.55}
.ann-meta{font-size:.71rem;color:var(--text3);margin-top:.4rem;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}

/* ASSIGNMENT */
.as-row{display:flex;align-items:center;justify-content:space-between;padding:.75rem 0;border-bottom:1px solid var(--border);gap:.5rem;flex-wrap:wrap}
.as-row:last-child{border:none}
.as-left{display:flex;align-items:center;gap:.7rem}
.avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.82rem;flex-shrink:0;font-family:var(--serif)}

/* MAP */
#map{height:420px;border-radius:var(--r2);border:1.5px solid var(--border);box-shadow:var(--shadow-sm)}
.map-ctrl{display:flex;gap:.45rem;flex-wrap:wrap;margin-bottom:.85rem}
.map-btn{padding:.42rem .85rem;background:var(--white);border:1.5px solid var(--border);border-radius:8px;color:var(--text2);cursor:pointer;font-family:var(--sans);font-size:.8rem;font-weight:600;transition:all .2s}
.map-btn:hover,.map-btn.active{background:var(--sky);border-color:var(--sky);color:white}
.map-leg{display:flex;gap:1.1rem;flex-wrap:wrap;margin-top:.65rem;font-size:.77rem;color:var(--text2);font-weight:600}
.leg-item{display:flex;align-items:center;gap:.38rem}
.leg-dot{width:9px;height:9px;border-radius:50%}

/* TABLE */
.tbl{width:100%;border-collapse:collapse;font-size:.86rem}
.tbl th{text-align:left;color:var(--text2);font-size:.71rem;text-transform:uppercase;letter-spacing:.07em;padding:.5rem .7rem;border-bottom:2px solid var(--border2);font-weight:700}
.tbl td{padding:.68rem .7rem;border-bottom:1px solid var(--border);color:var(--text)}
.tbl tr:hover td{background:var(--sky-bg)}

/* PROGRAMS */
.prog-card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--r);padding:1.2rem;margin-bottom:.9rem;box-shadow:var(--shadow-sm);display:flex;gap:1rem;align-items:flex-start;transition:box-shadow .2s}
.prog-card:hover{box-shadow:var(--shadow)}
.prog-icon{width:46px;height:46px;border-radius:var(--r2);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.4rem;background:var(--sky-bg);border:1.5px solid var(--border2)}
.prog-body h4{font-weight:700;color:var(--text);margin-bottom:.2rem}
.prog-body p{font-size:.83rem;color:var(--text2);line-height:1.5}
.prog-meta{font-size:.75rem;color:var(--text3);margin-top:.35rem;font-weight:600}

/* REPORTS */
.year-ring{display:flex;align-items:center;justify-content:center;flex-direction:column;width:110px;height:110px;border-radius:50%;flex-shrink:0;border:4px solid var(--sky);background:var(--sky-bg);box-shadow:0 0 20px rgba(74,144,217,.18)}
.year-ring .num{font-family:var(--serif);font-size:2.2rem;color:var(--sky3);line-height:1;font-weight:600}
.year-ring .lbl{font-size:.67rem;color:var(--text2);text-transform:uppercase;letter-spacing:.06em;font-weight:700}
.month-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.6rem}
@media(max-width:560px){.month-grid{grid-template-columns:repeat(3,1fr)}}
.month-cell{background:var(--off);border:1.5px solid var(--border);border-radius:var(--r2);padding:.68rem;text-align:center;transition:all .2s}
.month-cell.has-report{border-color:var(--sky);background:var(--sky-bg);cursor:pointer}
.month-cell.has-report:hover{box-shadow:var(--shadow-sm)}
.month-cell .mc-name{font-size:.74rem;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.28rem;font-weight:700}
.month-cell .mc-status{font-size:.88rem}

/* MISC */
.group-pill{display:inline-flex;align-items:center;gap:.35rem;background:var(--sky-bg);border:1px solid var(--border2);border-radius:20px;padding:.25rem .7rem;font-size:.78rem;color:var(--sky3);font-weight:600}
.toast{position:fixed;bottom:1.4rem;right:1.4rem;z-index:9999;background:var(--white);border:1.5px solid var(--sky);border-radius:var(--r);padding:.85rem 1.2rem;box-shadow:var(--shadow-lg);transform:translateY(120%);transition:transform .3s cubic-bezier(.4,0,.2,1);max-width:300px;pointer-events:none}
.toast.show{transform:translateY(0)}
.toast h4{font-size:.88rem;color:var(--sky3);margin-bottom:.12rem;font-weight:700}
.toast p{font-size:.78rem;color:var(--text2)}
.spin{display:inline-block;width:15px;height:15px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:rot .6s linear infinite;vertical-align:middle}
@keyframes rot{to{transform:rotate(360deg)}}
.empty{text-align:center;padding:2.2rem;color:var(--text3)}
.empty .emic{font-size:2.2rem;display:block;margin-bottom:.5rem}
.empty p{font-size:.86rem;font-weight:500}
@media(max-width:640px){main{padding:1rem}header{padding:.65rem 1rem}}
  `,document.head.appendChild(t)}const D=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],u=new Date;function T(t){const a=new Date(u);return a.setDate(u.getDate()+(t-u.getDay())),a.toISOString().split("T")[0]}function P(t){const a=new Date(u);return a.setDate(u.getDate()+(t-u.getDay())+7),a.toISOString().split("T")[0]}function B(){const t=new Date(u.getFullYear(),0,1),a=Math.ceil(((u-t)/864e5+t.getDay()+1)/7);return`${u.getFullYear()}-W${String(a).padStart(2,"0")}`}const y=u,_={"admin@cong.com":{email:"admin@cong.com",name:"Hermano Administrador",role:"admin",group_id:"g1",password:"admin123"},"usuario@cong.com":{email:"usuario@cong.com",name:"Pedro González",role:"user",group_id:"g2",password:"user123"}};function ie(){return{groups:[{id:"g1",name:"Grupo Norte",captain:"José Ramírez"},{id:"g2",name:"Grupo Sur",captain:"María López"},{id:"g3",name:"Grupo Centro",captain:"Ana Vargas"}],users:Object.values(_).map(t=>({email:t.email,name:t.name,role:t.role,group_id:t.group_id})),meetings:[{id:"m1",title:"Reunión Entre Semana",date:T(2),time:"19:00",type:"midweek",description:"Tesoros de la Biblia · Seamos mejores maestros · Nuestra vida cristiana",created_at:Date.now()},{id:"m2",title:"Reunión Fin de Semana",date:T(6),time:"10:00",type:"weekend",description:"Discurso público · Estudio de La Atalaya",created_at:Date.now()},{id:"m3",title:"Asamblea de Circuito",date:P(6),time:"09:00",type:"special",description:"Programa completo de dos días. Traiga almuerzo.",created_at:Date.now()}],announcements:[{id:"a1",title:"Asamblea de Circuito próxima",body:"Los días 22 y 23 se celebrará la asamblea. Regístrese puntualmente.",priority:"urgent",created_at:Date.now()-864e5},{id:"a2",title:"Limpieza del Salón",body:"Este sábado a las 8:00 AM se realizará limpieza general.",priority:"normal",created_at:Date.now()-1728e5},{id:"a3",title:"Nuevo horario de verano",body:"Las reuniones entre semana iniciarán a las 7:30 PM.",priority:"info",created_at:Date.now()-2592e5}],assignments:[{id:"as1",name:"Pedro González",email:"usuario@cong.com",role:"Discurso de 5 minutos",week:B(),created_at:Date.now()},{id:"as2",name:"Ana Vargas",email:"ana@cong.com",role:"Oración inicial",week:B(),created_at:Date.now()},{id:"as3",name:"Carlos Méndez",email:"carlos@cong.com",role:"Lector de La Atalaya",week:B(),created_at:Date.now()}],reports:[{id:"r1",email:"usuario@cong.com",year:u.getFullYear(),month:u.getMonth(),hours:12,revisits:8,studies:2,videos:5,notes:"Buen mes",created_at:Date.now()},{id:"r2",email:"usuario@cong.com",year:u.getFullYear(),month:Math.max(0,u.getMonth()-1),hours:10,revisits:6,studies:1,videos:3,notes:"",created_at:Date.now()-2592e6}],cleaning:[{id:"cl1",who:"Familia González",date:T(6),notes:"Salón principal y baños",created_at:Date.now()},{id:"cl2",who:"Hermano Vega y familia",date:P(6),notes:"Cocina, jardín y estacionamiento",created_at:Date.now()}],workprogram:[{id:"wp1",title:"Pintura de la fachada",date:P(6),who:"Grupo Norte",notes:"Se necesitan voluntarios. Llevar ropa de trabajo.",created_at:Date.now()}]}}let g=null;function $(){return g}function H(t){g=t}function k(){localStorage.setItem("kharis_v3",JSON.stringify(g))}async function h(t){return[...g[t]||[]]}async function E(t,a){{const n={id:t[0]+Date.now(),...a,created_at:Date.now()};return g[t].unshift(n),k(),n}}async function z(t,a){{g[t]=g[t].filter(n=>n.id!==a),k();return}}async function q(t,a){{const n=g.reports.findIndex(e=>e.email===a.email&&e.year===a.year&&e.month===a.month);n>=0?g.reports[n]={...g.reports[n],...t}:g.reports.unshift({id:"r"+Date.now(),...t,created_at:Date.now()}),k();return}}async function M(){return g.users}async function C(){return g.groups}async function Y(t,a){{const n=g.users.find(e=>e.email===t);n&&(n.group_id=a,k());return}}async function V(t,a){{const n=g.users.find(e=>e.email===t);n&&(n.role=a,k());return}}const oe=Object.freeze(Object.defineProperty({__proto__:null,del:z,get:h,getDS:$,getGroups:C,getUsers:M,ins:E,saveDS:k,setDS:H,setUserGroup:Y,setUserRole:V,upsertReport:q},Symbol.toStringTag,{value:"Module"}));function se(){const t=localStorage.getItem("kharis_v3");H(t?JSON.parse(t):ie())}async function de(t,a){{const n=_[t.toLowerCase()];if(!n)throw new Error("Usuario no encontrado");if(n.password!==a)throw new Error("Contraseña incorrecta");const r=$().groups.find(i=>i.id===n.group_id);return{...n,group:r}}}async function le(t,a,n){{if(_[a])throw new Error("El correo ya está registrado");_[a]={email:a,name:t,role:"user",group_id:null,password:n},$().users.push({email:a,name:t,role:"user",group_id:null}),k();return}}async function ce(){}function me(t){return{midweek:"Entre semana",weekend:"Fin de semana",special:"Especial / Asamblea"}[t]||t}function pe(t){return{midweek:"b-sky",weekend:"b-green",special:"b-amber"}[t]||"b-gray"}function m(t,a,n=!1){const e=document.getElementById("toast");document.getElementById("t-title").textContent=t,document.getElementById("t-msg").textContent=a,e.style.borderColor=n?"var(--rose)":"var(--sky)",e.classList.add("show"),setTimeout(()=>e.classList.remove("show"),3500)}function N(t){return new Date(t+"T00:00:00").toLocaleDateString("es",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}function ge(t){return new Date(t).toLocaleDateString("es",{day:"2-digit",month:"long",year:"numeric"})}function ue(){document.getElementById("auth-screen").innerHTML=`
    <div class="auth-wrap">
      <div class="auth-hero">
        <div class="auth-dove">🕊️</div>
        <h1>Kharis</h1>
        <div class="cong-name">Congregación Vista Grande</div>
      </div>
      <div class="auth-card">
        <div class="tab-row">
          <button class="tab-btn active" id="tab-login">Iniciar sesión</button>
          <button class="tab-btn" id="tab-reg">Registrarse</button>
        </div>
        <div id="form-login">
          <div class="fg"><label>Correo</label><input type="email" id="l-email" placeholder="tu@correo.com"/></div>
          <div class="fg"><label>Contraseña</label><input type="password" id="l-pass" placeholder="••••••••"/></div>
          <button class="btn-sky" id="btn-login">Iniciar sesión</button>
          <div class="auth-err" id="login-err"></div>
          <p class="auth-hint">Demo · admin@cong.com / admin123 &nbsp;|&nbsp; usuario@cong.com / user123</p>
        </div>
        <div id="form-reg" style="display:none">
          <div class="g2">
            <div class="fg"><label>Nombre completo</label><input type="text" id="r-name" placeholder="Pedro González"/></div>
            <div class="fg"><label>Correo</label><input type="email" id="r-email" placeholder="tu@correo.com"/></div>
          </div>
          <div class="fg"><label>Contraseña</label><input type="password" id="r-pass" placeholder="Mínimo 6 caracteres"/></div>
          <button class="btn-sky" id="btn-reg">Crear cuenta</button>
          <div class="auth-err" id="reg-err"></div>
        </div>
      </div>
    </div>`,document.getElementById("tab-login").addEventListener("click",()=>j("login")),document.getElementById("tab-reg").addEventListener("click",()=>j("register")),document.getElementById("btn-login").addEventListener("click",async()=>{const t=document.getElementById("l-email").value.trim().toLowerCase(),a=document.getElementById("l-pass").value,n=document.getElementById("btn-login"),e=document.getElementById("login-err");e.style.display="none",n.innerHTML='<span class="spin"></span>',n.disabled=!0;try{const r=await de(t,a);window.__onLogin(r)}catch(r){e.textContent=r.message,e.style.display="block"}n.textContent="Iniciar sesión",n.disabled=!1}),document.getElementById("btn-reg").addEventListener("click",async()=>{const t=document.getElementById("r-name").value.trim(),a=document.getElementById("r-email").value.trim().toLowerCase(),n=document.getElementById("r-pass").value,e=document.getElementById("btn-reg"),r=document.getElementById("reg-err");if(r.style.display="none",!t||!a||!n){r.textContent="Completa todos los campos",r.style.display="block";return}e.innerHTML='<span class="spin"></span>',e.disabled=!0;try{await le(t,a,n),m("¡Cuenta creada!","Ahora puedes iniciar sesión"),j("login")}catch(i){r.textContent=i.message,r.style.display="block"}e.textContent="Crear cuenta",e.disabled=!1})}function j(t){document.getElementById("form-login").style.display=t==="login"?"block":"none",document.getElementById("form-reg").style.display=t==="register"?"block":"none",document.getElementById("tab-login").classList.toggle("active",t==="login"),document.getElementById("tab-reg").classList.toggle("active",t==="register")}function A(t){var a,n;document.querySelectorAll(".page").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".nt").forEach(e=>e.classList.remove("active")),(a=document.getElementById("page-"+t))==null||a.classList.add("active"),(n=document.querySelector(`[data-page="${t}"]`))==null||n.classList.add("active")}function ve(t){const a=t.role==="admin";document.getElementById("app").innerHTML=`
    <div id="install-bar">
      <span>📲</span>
      <p><strong>Instala Kharis</strong> en tu dispositivo para acceso sin conexión</p>
      <button id="btn-install">Instalar</button>
      <button id="btn-close-install" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:1.1rem;margin-left:auto">✕</button>
    </div>

    <header>
      <div class="brand">
        <div class="brand-icon">🕊️</div>
        <div>
          <div>Kharis</div>
          <div class="brand-sub">Vista Grande</div>
        </div>
      </div>
      <div class="hdr-right">
        <div class="user-pill">
          <div class="role-pip ${a?"admin":""}"></div>
          <span>${t.name||t.email}</span>
          ${t.group?`<span style="color:var(--text3);font-size:.72rem"> · ${t.group.name||t.group}</span>`:""}
        </div>
        <button class="btn-out" id="btn-logout">Salir</button>
      </div>
    </header>

    <nav>
      <button class="nt active" data-page="dash"         ><span class="ic">🏠</span>Inicio</button>
      <button class="nt"        data-page="meetings"      ><span class="ic">📅</span>Reuniones</button>
      <button class="nt"        data-page="announcements" ><span class="ic">📢</span>Anuncios</button>
      <button class="nt"        data-page="assignments"   ><span class="ic">📋</span>Asignaciones</button>
      <button class="nt"        data-page="programs"      ><span class="ic">🗂️</span>Programas</button>
      <button class="nt"        data-page="map"           ><span class="ic">🗺️</span>Predicación</button>
      <button class="nt"        data-page="reports"       ><span class="ic">📊</span>Informes</button>
      ${a?'<button class="nt" data-page="admin"><span class="ic">⚙️</span>Admin</button>':""}
    </nav>

    <main id="main-content">
      <!-- Las páginas se inyectan aquí -->
    </main>`,document.querySelectorAll(".nt").forEach(n=>{n.addEventListener("click",()=>{const e=n.dataset.page;A(e),window.__loadPage(e)})}),document.getElementById("btn-logout").addEventListener("click",async()=>{await ce(),window.__showAuth()}),document.getElementById("btn-close-install").addEventListener("click",()=>{document.getElementById("install-bar").classList.remove("show")})}ne();se();let l=null,b=null,G=[],W=[],x="all";const be=[{id:1,name:"Sector A – Residencial",lat:9.938,lng:-84.089,status:"available",group:"Grupo Norte",notes:"Casas unifamiliares"},{id:2,name:"Sector B – Comercial",lat:9.93,lng:-84.079,status:"in-progress",group:"Grupo Sur",notes:"En trabajo actualmente"},{id:3,name:"Sector C – Norte",lat:9.945,lng:-84.084,status:"completed",group:"Grupo Norte",notes:"Completado el mes pasado"},{id:4,name:"Sector D – Este",lat:9.925,lng:-84.073,status:"available",group:"Grupo Centro",notes:"Urbanización reciente"},{id:5,name:"Sector E – Sur",lat:9.918,lng:-84.09,status:"in-progress",group:"Grupo Sur",notes:"En progreso"},{id:6,name:"Sector F – Centro",lat:9.933,lng:-84.084,status:"available",group:"Grupo Centro",notes:"Área densa"}];window.__showAuth=function(){l=null,document.getElementById("app").style.display="none",document.getElementById("auth-screen").style.display="flex",ue()};window.__onLogin=async function(t){l=t,document.getElementById("auth-screen").style.display="none",document.getElementById("app").style.display="flex",ve(t),await I("dash")};window.__loadPage=I;async function I(t){const a=document.getElementById("main-content");switch(t){case"dash":return fe(a);case"meetings":return J(a);case"announcements":return Z(a);case"assignments":return Q(a);case"programs":return ye(a);case"cleaning":return U(a);case"workprogram":return X(a);case"map":return he(a);case"reports":return ee(a);case"admin":return v(a)}}async function fe(t){const{renderDashboard:a}=await F(async()=>{const{renderDashboard:n}=await import("./Dashboard-DAccSqJG.js");return{renderDashboard:n}},[]);await a(t,l)}async function J(t){W=await h("meetings"),K(t)}function K(t){const a=(l==null?void 0:l.role)==="admin";let n=[...W].sort((e,r)=>e.date.localeCompare(r.date));x!=="all"&&(n=n.filter(e=>e.type===x)),t.innerHTML=`<div class="page active" id="page-meetings">
    <div class="section-hd"><h2 class="section-title">Reuniones</h2></div>
    <div class="meet-type-tabs">
      <button class="mtt ${x==="all"?"active":""}"     id="mf-all">Todas</button>
      <button class="mtt ${x==="midweek"?"active":""}" id="mf-mid">Entre Semana</button>
      <button class="mtt ${x==="weekend"?"active":""}" id="mf-wk">Fin de Semana</button>
      <button class="mtt ${x==="special"?"active":""}" id="mf-sp">Especiales</button>
    </div>
    <div id="meet-items">
      ${n.map(e=>{const r=new Date(e.date+"T00:00:00");return`<div class="card">
          <div class="meeting-item">
            <div class="meet-date"><div class="meet-day">${r.getDate()}</div><div class="meet-mon">${r.toLocaleDateString("es",{month:"short"}).toUpperCase()}</div></div>
            <div class="meet-body" style="flex:1">
              <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
                <h4>${e.title}</h4>
                ${a?`<button class="btn-sm danger" data-del-meet="${e.id}">Eliminar</button>`:""}
              </div>
              <p>${e.time} · ${N(e.date)}</p>
              <p style="margin-top:.3rem;white-space:pre-line;font-size:.81rem;color:var(--text2)">${e.description||""}</p>
              <div class="meet-tags"><span class="badge ${pe(e.type)}">${me(e.type)}</span></div>
            </div>
          </div>
        </div>`}).join("")||'<div class="empty"><span class="emic">📅</span><p>Sin reuniones en esta categoría</p></div>'}
    </div>
  </div>`,[["mf-all","all"],["mf-mid","midweek"],["mf-wk","weekend"],["mf-sp","special"]].forEach(([e,r])=>{var i;(i=document.getElementById(e))==null||i.addEventListener("click",()=>{x=r,K(t)})}),t.querySelectorAll("[data-del-meet]").forEach(e=>{e.addEventListener("click",async()=>{confirm("¿Eliminar esta reunión?")&&(await z("meetings",e.dataset.delMeet),m("Eliminado","Reunión eliminada"),await J(t))})})}async function Z(t){const a=await h("announcements"),n=(l==null?void 0:l.role)==="admin";t.innerHTML=`<div class="page active" id="page-announcements">
    <div class="section-hd"><h2 class="section-title">Anuncios</h2></div>
    ${a.map(e=>`
      <div class="ann ${e.priority!=="normal"?e.priority:""}">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
          <h4>${e.title}</h4>
          ${n?`<button class="btn-sm danger" data-del-ann="${e.id}">Eliminar</button>`:""}
        </div>
        <p>${e.body}</p>
        <div class="ann-meta">${ge(e.created_at)} <span class="badge ${e.priority==="urgent"?"b-rose":e.priority==="info"?"b-green":"b-sky"}">${e.priority}</span></div>
      </div>`).join("")||'<div class="empty"><span class="emic">📭</span><p>Sin anuncios</p></div>'}
  </div>`,t.querySelectorAll("[data-del-ann]").forEach(e=>{e.addEventListener("click",async()=>{confirm("¿Eliminar?")&&(await z("announcements",e.dataset.delAnn),m("Eliminado","Anuncio eliminado"),Z(t))})})}async function Q(t){const a=B(),e=(await h("assignments")).filter(o=>o.week===a),r=(l==null?void 0:l.role)==="admin",i=(l==null?void 0:l.email)||"",s=["#4a90d9","#2e9e6b","#c07820","#c0405a","#7a55c8"];t.innerHTML=`<div class="page active" id="page-assignments">
    <div class="section-hd">
      <h2 class="section-title">Asignaciones</h2>
      <span class="badge b-sky">Semana ${a}</span>
    </div>
    <div class="card">
      ${e.map((o,d)=>{const c=o.email===i,f=o.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2),p=s[d%s.length];return`<div class="as-row" style="${c?"background:var(--sky-bg);border-radius:10px;padding:.75rem .6rem;margin:0 -.6rem":""}">
          <div class="as-left">
            <div class="avatar" style="background:${p}1a;color:${p};border:2px solid ${p}44">${f}</div>
            <div>
              <div style="font-weight:700;color:${c?"var(--sky3)":"var(--text)"}">${o.name} ${c?'<span style="font-size:.71rem;color:var(--sky);font-weight:600">(Tú)</span>':""}</div>
              <div style="font-size:.8rem;color:var(--text2)">${o.role}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:.45rem">
            ${c?'<span class="badge b-sky">Tu asignación</span>':""}
            ${r?`<button class="btn-sm danger" data-del-as="${o.id}">✕</button>`:""}
          </div>
        </div>`}).join("")||'<div class="empty"><span class="emic">📋</span><p>Sin asignaciones esta semana</p></div>'}
    </div>
  </div>`,t.querySelectorAll("[data-del-as]").forEach(o=>{o.addEventListener("click",async()=>{await z("assignments",o.dataset.delAs),m("Eliminado","Asignación eliminada"),Q(t)})})}function ye(t){t.innerHTML=`<div class="page active" id="page-programs">
    <div class="section-hd"><h2 class="section-title">Programas</h2></div>
    <div class="g2">
      <div class="card" style="cursor:pointer;border-color:var(--border2)" id="go-cleaning">
        <div style="font-size:2rem;margin-bottom:.5rem">🧹</div>
        <div style="font-family:var(--serif);font-size:1.05rem;color:var(--sky3);font-weight:600;margin-bottom:.25rem">Limpieza</div>
        <p style="font-size:.82rem;color:var(--text2)">Programa de turnos de limpieza del Salón del Reino</p>
      </div>
      <div class="card" style="cursor:pointer;border-color:var(--border2)" id="go-work">
        <div style="font-size:2rem;margin-bottom:.5rem">🔧</div>
        <div style="font-family:var(--serif);font-size:1.05rem;color:var(--sky3);font-weight:600;margin-bottom:.25rem">Programa de trabajo</div>
        <p style="font-size:.82rem;color:var(--text2)">Mantenimiento y trabajos del Salón del Reino</p>
      </div>
    </div>
  </div>`,document.getElementById("go-cleaning").addEventListener("click",()=>{A("cleaning"),I("cleaning")}),document.getElementById("go-work").addEventListener("click",()=>{A("workprogram"),I("workprogram")})}async function U(t){const a=await h("cleaning"),n=(l==null?void 0:l.role)==="admin";t.innerHTML=`<div class="page active" id="page-cleaning">
    <div class="section-hd">
      <div style="display:flex;align-items:center;gap:.7rem">
        <button class="btn-sm" id="back-programs">← Programas</button>
        <h2 class="section-title">🧹 Limpieza</h2>
      </div>
    </div>
    ${a.map(e=>(e.date+"",`<div class="prog-card">
        <div class="prog-icon">🧹</div>
        <div class="prog-body" style="flex:1">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
            <h4>${e.who}</h4>
            ${n?`<button class="btn-sm danger" data-del-cl="${e.id}">Eliminar</button>`:""}
          </div>
          <p>${e.notes||""}</p>
          <div class="prog-meta">📅 ${N(e.date)}</div>
        </div>
      </div>`)).join("")||'<div class="empty"><span class="emic">🧹</span><p>Sin turnos programados</p></div>'}
  </div>`,document.getElementById("back-programs").addEventListener("click",()=>{A("programs"),I("programs")}),t.querySelectorAll("[data-del-cl]").forEach(e=>{e.addEventListener("click",async()=>{confirm("¿Eliminar?")&&(await z("cleaning",e.dataset.delCl),m("Eliminado","Turno eliminado"),U(t))})})}async function X(t){const a=await h("workprogram"),n=(l==null?void 0:l.role)==="admin";t.innerHTML=`<div class="page active" id="page-workprogram">
    <div class="section-hd">
      <div style="display:flex;align-items:center;gap:.7rem">
        <button class="btn-sm" id="back-programs2">← Programas</button>
        <h2 class="section-title">🔧 Programa de trabajo</h2>
      </div>
    </div>
    ${a.map(e=>`<div class="prog-card">
        <div class="prog-icon">🔧</div>
        <div class="prog-body" style="flex:1">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
            <h4>${e.title}</h4>
            ${n?`<button class="btn-sm danger" data-del-wk="${e.id}">Eliminar</button>`:""}
          </div>
          <p>${e.notes||""}</p>
          <div class="prog-meta">👷 ${e.who||"—"} &nbsp;·&nbsp; 📅 ${N(e.date)}</div>
        </div>
      </div>`).join("")||'<div class="empty"><span class="emic">🔧</span><p>Sin trabajos programados</p></div>'}
  </div>`,document.getElementById("back-programs2").addEventListener("click",()=>{A("programs"),I("programs")}),t.querySelectorAll("[data-del-wk]").forEach(e=>{e.addEventListener("click",async()=>{confirm("¿Eliminar?")&&(await z("workprogram",e.dataset.delWk),m("Eliminado","Trabajo eliminado"),X(t))})})}function he(t){t.innerHTML=`<div class="page active" id="page-map">
    <div class="section-hd"><h2 class="section-title">🗺️ Programa de Predicación</h2></div>
    <div class="card" style="padding:1rem">
      <div class="map-ctrl">
        <button class="map-btn active" data-filter="all">Todos</button>
        <button class="map-btn" data-filter="available">Disponibles</button>
        <button class="map-btn" data-filter="in-progress">En progreso</button>
        <button class="map-btn" data-filter="completed">Completados</button>
      </div>
      <div id="map"></div>
      <div class="map-leg">
        <div class="leg-item"><div class="leg-dot" style="background:#2e9e6b"></div>Disponible</div>
        <div class="leg-item"><div class="leg-dot" style="background:#c07820"></div>En progreso</div>
        <div class="leg-item"><div class="leg-dot" style="background:#4a90d9"></div>Completado</div>
      </div>
    </div>
  </div>`,setTimeout(()=>{if(b){b.invalidateSize();return}b=L.map("map").setView([9.93,-84.084],14),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:19}).addTo(b);const a={available:"#2e9e6b","in-progress":"#c07820",completed:"#4a90d9"};be.forEach(n=>{const e=L.divIcon({className:"",iconSize:[26,26],iconAnchor:[13,13],html:`<div style="width:26px;height:26px;border-radius:50%;background:${a[n.status]};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>`}),r=L.marker([n.lat,n.lng],{icon:e}).addTo(b).bindPopup(`<b>${n.name}</b><br>${n.group}<br><em>${n.notes}</em>`);G.push({marker:r,t:n})})},80),t.querySelectorAll("[data-filter]").forEach(a=>{a.addEventListener("click",()=>{t.querySelectorAll(".map-btn").forEach(e=>e.classList.remove("active")),a.classList.add("active");const n=a.dataset.filter;G.forEach(({marker:e,t:r})=>{n==="all"||r.status===n?!b.hasLayer(e)&&b.addLayer(e):b.hasLayer(e)&&b.removeLayer(e)})})})}async function ee(t){if((l==null?void 0:l.role)==="admin")return we(t);const n=await h("reports"),e=n.filter(s=>s.email===(l==null?void 0:l.email)&&s.year===y.getFullYear());t.innerHTML=`<div class="page active" id="page-reports">
    <div class="section-hd"><h2 class="section-title">Informes de Predicación</h2></div>
    <div class="card">
      <div class="card-hd">
        <span class="card-title">Mi informe mensual</span>
        <select id="report-month-sel" class="btn-sm">
          ${D.map((s,o)=>`<option value="${o}" ${o===y.getMonth()?"selected":""}>${s} ${y.getFullYear()}</option>`).join("")}
        </select>
      </div>
      <div class="g2" style="margin-bottom:.9rem">
        <div class="fg"><label>Horas</label><input type="number" id="rp-hours" min="0" placeholder="0"/></div>
        <div class="fg"><label>Revisitas</label><input type="number" id="rp-rv" min="0" placeholder="0"/></div>
        <div class="fg"><label>Estudios bíblicos</label><input type="number" id="rp-studies" min="0" placeholder="0"/></div>
        <div class="fg"><label>Videos</label><input type="number" id="rp-videos" min="0" placeholder="0"/></div>
      </div>
      <div class="fg"><label>Comentarios</label><textarea id="rp-notes" placeholder="Observaciones..."></textarea></div>
      <button class="btn-action" id="btn-save-report">Guardar informe</button>
    </div>
    <div class="card">
      <div class="card-hd">
        <span class="card-title">Mi historial ${y.getFullYear()}</span>
        <div class="year-ring"><div class="num">${e.length}</div><div class="lbl">informes</div></div>
      </div>
      <div class="month-grid">
        ${D.map((s,o)=>{const d=e.find(c=>c.month===o);return`<div class="month-cell ${d?"has-report":""}" title="${d?`Horas: ${d.hours}`:"Sin informe"}">
            <div class="mc-name">${s.slice(0,3)}</div>
            <div class="mc-status">${d?"✅":"○"}</div>
          </div>`}).join("")}
      </div>
    </div>
  </div>`;const r=document.getElementById("report-month-sel"),i=()=>{const s=parseInt(r.value),o=n.find(d=>d.email===(l==null?void 0:l.email)&&d.year===y.getFullYear()&&d.month===s);document.getElementById("rp-hours").value=(o==null?void 0:o.hours)||"",document.getElementById("rp-rv").value=(o==null?void 0:o.revisits)||"",document.getElementById("rp-studies").value=(o==null?void 0:o.studies)||"",document.getElementById("rp-videos").value=(o==null?void 0:o.videos)||"",document.getElementById("rp-notes").value=(o==null?void 0:o.notes)||""};i(),r.addEventListener("change",i),document.getElementById("btn-save-report").addEventListener("click",async()=>{const s=parseInt(r.value),o=parseInt(document.getElementById("rp-hours").value)||0,d=parseInt(document.getElementById("rp-rv").value)||0,c=parseInt(document.getElementById("rp-studies").value)||0,f=parseInt(document.getElementById("rp-videos").value)||0,p=document.getElementById("rp-notes").value.trim(),w=y.getFullYear();await q({email:l.email,year:w,month:s,hours:o,revisits:d,studies:c,videos:f,notes:p},{email:l.email,year:w,month:s}),m("Informe guardado",`${D[s]} ${w} · ${o} horas`),ee(t)})}async function we(t){const a=await h("reports"),n=await M(),e=await C(),r=y.getFullYear(),i=y.getMonth(),s=a.filter(d=>d.year===r),o=a.filter(d=>d.year===r&&d.month===i);t.innerHTML=`<div class="page active" id="page-reports">
    <div class="section-hd"><h2 class="section-title">Informes de Predicación</h2></div>
    <div class="card">
      <div class="card-hd">
        <span class="card-title">Informes de la congregación — ${D[i]} ${r}</span>
      </div>
      <div style="overflow-x:auto">
        <table class="tbl">
          <thead><tr><th>Publicador</th><th>Grupo</th><th>Horas</th><th>Revisitas</th><th>Estudios</th><th>Videos</th><th>Estado</th></tr></thead>
          <tbody>
            ${n.map(d=>{const c=o.find(p=>p.email===d.email),f=e.find(p=>p.id===d.group_id);return`<tr>
                <td><strong>${d.name||"—"}</strong></td>
                <td>${f?`<span class="group-pill">👨‍👩‍👧 ${f.name}</span>`:"—"}</td>
                <td>${c?c.hours:"—"}</td>
                <td>${c?c.revisits:"—"}</td>
                <td>${c?c.studies:"—"}</td>
                <td>${c?c.videos:"—"}</td>
                <td>${c?'<span class="badge b-green">✓ Enviado</span>':'<span class="badge b-rose">Pendiente</span>'}</td>
              </tr>`}).join("")}
          </tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-hd"><span class="card-title">Resumen anual ${r}</span></div>
      <div style="display:flex;align-items:center;gap:2rem;flex-wrap:wrap">
        <div class="year-ring"><div class="num">${s.length}</div><div class="lbl">informes</div></div>
        <div class="g3" style="flex:1">
          <div class="stat"><div class="stat-icon">⏱️</div><div><div class="stat-val">${s.reduce((d,c)=>d+(c.hours||0),0)}</div><div class="stat-lbl">Horas totales</div></div></div>
          <div class="stat"><div class="stat-icon">📖</div><div><div class="stat-val">${s.reduce((d,c)=>d+(c.studies||0),0)}</div><div class="stat-lbl">Estudios</div></div></div>
          <div class="stat"><div class="stat-icon">🔄</div><div><div class="stat-val">${s.reduce((d,c)=>d+(c.revisits||0),0)}</div><div class="stat-lbl">Revisitas</div></div></div>
        </div>
      </div>
    </div>
  </div>`}async function v(t){const a=await M(),n=await C();t.innerHTML=`<div class="page active" id="page-admin">
    <div class="section-hd"><h2 class="section-title">Panel de Administración</h2></div>
    <div class="g3" style="margin-bottom:1.3rem">
      <div class="stat"><div class="stat-icon">👥</div><div><div class="stat-val">${a.length}</div><div class="stat-lbl">Usuarios</div></div></div>
      <div class="stat"><div class="stat-icon">🛡️</div><div><div class="stat-val">${a.filter(e=>e.role==="admin").length}</div><div class="stat-lbl">Administradores</div></div></div>
      <div class="stat"><div class="stat-icon">👨‍👩‍👧</div><div><div class="stat-val">${n.length}</div><div class="stat-lbl">Grupos</div></div></div>
    </div>

    <!-- Grupos -->
    <div class="card">
      <div class="card-hd"><span class="card-title">👨‍👩‍👧 Gestión de Grupos</span></div>
      <div class="g2" style="margin-bottom:.9rem">
        <div class="fg"><label>Nombre</label><input type="text" id="grp-name" placeholder="Ej: Grupo Norte"/></div>
        <div class="fg"><label>Responsable</label><input type="text" id="grp-captain" placeholder="Nombre"/></div>
      </div>
      <button class="btn-action" id="btn-add-group" style="margin-bottom:1rem">Crear grupo</button>
      <div id="groups-list">
        ${n.map(e=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:.65rem 0;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:.5rem">
            <div><strong>${e.name}</strong><span style="color:var(--text3);font-size:.8rem;margin-left:.5rem">Cap. ${e.captain||"—"}</span></div>
            <div style="display:flex;gap:.4rem">
              <span class="badge b-gray">${a.filter(r=>r.group_id===e.id).length} miembros</span>
              <button class="btn-sm danger" data-del-grp="${e.id}">Eliminar</button>
            </div>
          </div>`).join("")||'<div class="empty"><span class="emic">👨‍👩‍👧</span><p>Sin grupos</p></div>'}
      </div>
    </div>

    <!-- Nueva Reunión -->
    <div class="card">
      <div class="card-hd"><span class="card-title">📅 Nueva Reunión</span></div>
      <div class="g2">
        <div class="fg"><label>Título</label><input type="text" id="m-title" placeholder="Ej: Reunión entre semana"/></div>
        <div class="fg"><label>Fecha</label><input type="date" id="m-date"/></div>
        <div class="fg"><label>Hora</label><input type="time" id="m-time" value="19:00"/></div>
        <div class="fg"><label>Tipo</label><select id="m-type"><option value="midweek">Entre semana</option><option value="weekend">Fin de semana</option><option value="special">Especial</option></select></div>
      </div>
      <div class="fg"><label>Programa</label><textarea id="m-desc" placeholder="Temas, discursos..."></textarea></div>
      <button class="btn-action" id="btn-add-meet">Guardar reunión</button>
    </div>

    <!-- Nuevo Anuncio -->
    <div class="card">
      <div class="card-hd"><span class="card-title">📢 Nuevo Anuncio</span></div>
      <div class="g2">
        <div class="fg"><label>Título</label><input type="text" id="an-title" placeholder="Título del anuncio"/></div>
        <div class="fg"><label>Prioridad</label><select id="an-pri"><option value="normal">Normal</option><option value="urgent">Urgente</option><option value="info">Informativo</option></select></div>
      </div>
      <div class="fg"><label>Contenido</label><textarea id="an-body" placeholder="Contenido del anuncio..."></textarea></div>
      <button class="btn-action" id="btn-add-ann">Publicar</button>
    </div>

    <!-- Nueva Asignación -->
    <div class="card">
      <div class="card-hd"><span class="card-title">📋 Nueva Asignación</span></div>
      <div class="g2">
        <div class="fg"><label>Nombre</label><input type="text" id="as-name" placeholder="Nombre completo"/></div>
        <div class="fg"><label>Correo</label><input type="email" id="as-email" placeholder="correo@ejemplo.com"/></div>
        <div class="fg"><label>Tarea</label><input type="text" id="as-role" placeholder="Ej: Discurso, Oración..."/></div>
        <div class="fg"><label>Semana</label><input type="week" id="as-week" value="${B()}"/></div>
      </div>
      <button class="btn-action" id="btn-add-as">Asignar</button>
    </div>

    <!-- Limpieza -->
    <div class="card">
      <div class="card-hd"><span class="card-title">🧹 Publicar Limpieza</span></div>
      <div class="g2">
        <div class="fg"><label>Responsable(s)</label><input type="text" id="cl-who" placeholder="Familia López..."/></div>
        <div class="fg"><label>Fecha</label><input type="date" id="cl-date"/></div>
      </div>
      <div class="fg"><label>Área</label><textarea id="cl-notes" placeholder="Salón, baños..." style="min-height:60px"></textarea></div>
      <button class="btn-action" id="btn-add-cl">Publicar turno</button>
    </div>

    <!-- Trabajo -->
    <div class="card">
      <div class="card-hd"><span class="card-title">🔧 Publicar Trabajo</span></div>
      <div class="g2">
        <div class="fg"><label>Trabajo</label><input type="text" id="wk-title" placeholder="Pintura, cambio de focos..."/></div>
        <div class="fg"><label>Fecha</label><input type="date" id="wk-date"/></div>
        <div class="fg"><label>Responsable(s)</label><input type="text" id="wk-who" placeholder="Grupo Norte..."/></div>
      </div>
      <div class="fg"><label>Detalle</label><textarea id="wk-notes" placeholder="Descripción..." style="min-height:60px"></textarea></div>
      <button class="btn-action" id="btn-add-wk">Publicar</button>
    </div>

    <!-- Usuarios -->
    <div class="card">
      <div class="card-hd"><span class="card-title">👥 Publicadores</span><button class="btn-sm" id="btn-refresh-users">↻ Actualizar</button></div>
      <div style="overflow-x:auto">
        <table class="tbl">
          <thead><tr><th>Nombre</th><th>Correo</th><th>Grupo</th><th>Rol</th><th>Acciones</th></tr></thead>
          <tbody>
            ${a.map(e=>{const r=n.find(i=>i.id===e.group_id);return`<tr>
                <td><strong>${e.name||"—"}</strong></td>
                <td style="color:var(--text2);font-size:.83rem">${e.email}</td>
                <td>${r?`<span class="group-pill">👨‍👩‍👧 ${r.name||r}</span>`:`<select class="btn-sm" data-set-grp="${e.email}" style="padding:.28rem .5rem">
                    <option value="">Sin grupo</option>
                    ${n.map(i=>`<option value="${i.id}" ${e.group_id===i.id?"selected":""}>${i.name}</option>`).join("")}
                  </select>`}
                </td>
                <td><span class="badge ${e.role==="admin"?"b-sky":"b-gray"}">${e.role==="admin"?"Admin":"Publicador"}</span></td>
                <td>${e.email!==(l==null?void 0:l.email)?`<button class="btn-sm" data-toggle-role="${e.email}" data-cur-role="${e.role}">${e.role==="admin"?"↓ Estándar":"↑ Admin"}</button>`:"—"}</td>
              </tr>`}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </div>`,document.getElementById("btn-add-group").addEventListener("click",async()=>{const e=document.getElementById("grp-name").value.trim(),r=document.getElementById("grp-captain").value.trim();if(!e){m("Error","Ingresa un nombre",!0);return}$().groups.push({id:"g"+Date.now(),name:e,captain:r}),require("./services/db.js").saveDS(),m("Grupo creado",e),document.getElementById("grp-name").value="",document.getElementById("grp-captain").value="",v(t)}),t.querySelectorAll("[data-del-grp]").forEach(e=>{e.addEventListener("click",async()=>{if(confirm("¿Eliminar este grupo?")){{$().groups=$().groups.filter(i=>i.id!==e.dataset.delGrp);const{saveDS:r}=await F(async()=>{const{saveDS:i}=await Promise.resolve().then(()=>oe);return{saveDS:i}},void 0);r()}m("Eliminado","Grupo eliminado"),v(t)}})}),document.getElementById("btn-add-meet").addEventListener("click",async()=>{const e=document.getElementById("m-title").value.trim(),r=document.getElementById("m-date").value,i=document.getElementById("m-time").value,s=document.getElementById("m-type").value,o=document.getElementById("m-desc").value.trim();if(!e||!r){m("Error","Completa título y fecha",!0);return}await E("meetings",{title:e,date:r,time:i,type:s,description:o}),m("Reunión guardada",`${e} · ${r}`),["m-title","m-desc"].forEach(d=>document.getElementById(d).value=""),v(t)}),document.getElementById("btn-add-ann").addEventListener("click",async()=>{const e=document.getElementById("an-title").value.trim(),r=document.getElementById("an-body").value.trim(),i=document.getElementById("an-pri").value;if(!e||!r){m("Error","Completa todos los campos",!0);return}await E("announcements",{title:e,body:r,priority:i}),m("Anuncio publicado",e),["an-title","an-body"].forEach(s=>document.getElementById(s).value=""),v(t)}),document.getElementById("btn-add-as").addEventListener("click",async()=>{const e=document.getElementById("as-name").value.trim(),r=document.getElementById("as-email").value.trim().toLowerCase(),i=document.getElementById("as-role").value.trim(),s=document.getElementById("as-week").value;if(!e||!i||!s){m("Error","Completa los campos requeridos",!0);return}await E("assignments",{name:e,email:r,role:i,week:s}),m("Asignación guardada",`${e} – ${i}`),["as-name","as-email","as-role"].forEach(o=>document.getElementById(o).value=""),v(t)}),document.getElementById("btn-add-cl").addEventListener("click",async()=>{const e=document.getElementById("cl-who").value.trim(),r=document.getElementById("cl-date").value,i=document.getElementById("cl-notes").value.trim();if(!e||!r){m("Error","Completa responsable y fecha",!0);return}await E("cleaning",{who:e,date:r,notes:i}),m("Turno publicado",e),["cl-who","cl-notes"].forEach(s=>document.getElementById(s).value=""),document.getElementById("cl-date").value="",v(t)}),document.getElementById("btn-add-wk").addEventListener("click",async()=>{const e=document.getElementById("wk-title").value.trim(),r=document.getElementById("wk-date").value,i=document.getElementById("wk-who").value.trim(),s=document.getElementById("wk-notes").value.trim();if(!e||!r){m("Error","Completa el trabajo y la fecha",!0);return}await E("workprogram",{title:e,date:r,who:i,notes:s}),m("Trabajo publicado",e),["wk-title","wk-who","wk-notes"].forEach(o=>document.getElementById(o).value=""),document.getElementById("wk-date").value="",v(t)}),document.getElementById("btn-refresh-users").addEventListener("click",()=>v(t)),t.querySelectorAll("[data-set-grp]").forEach(e=>{e.addEventListener("change",async()=>{await Y(e.dataset.setGrp,e.value),m("Grupo asignado","")})}),t.querySelectorAll("[data-toggle-role]").forEach(e=>{e.addEventListener("click",async()=>{const r=e.dataset.curRole==="admin"?"user":"admin";await V(e.dataset.toggleRole,r),m("Rol actualizado",`→ ${r}`),v(t)})})}let S;window.addEventListener("beforeinstallprompt",t=>{var a;t.preventDefault(),S=t,(a=document.getElementById("install-bar"))==null||a.classList.add("show")});var O;(O=document.getElementById("btn-install"))==null||O.addEventListener("click",async()=>{var t;S&&(S.prompt(),await S.userChoice,S=null),(t=document.getElementById("install-bar"))==null||t.classList.remove("show")});"serviceWorker"in navigator&&navigator.serviceWorker.register("/Proyect2/sw.js").catch(()=>{});window.__showAuth();export{y as N,$ as a,B as c,ge as f,h as g,me as t};
