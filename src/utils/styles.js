export function injectStyles() {
  const style = document.createElement('style')
  style.textContent = `
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
  --nav-h:56px;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{min-height:100%;background:var(--off);color:var(--text);font-family:var(--sans);scroll-behavior:smooth;-webkit-tap-highlight-color:transparent}
::selection{background:var(--sky-bg2);color:var(--sky3)}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:var(--off)}
::-webkit-scrollbar-thumb{background:var(--sky-bg2);border-radius:3px}

/* ── AUTH ── */
#auth-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.2rem;background:linear-gradient(160deg,var(--sky-bg) 0%,var(--white) 60%)}
.auth-wrap{width:100%;max-width:420px}
.auth-hero{text-align:center;margin-bottom:1.5rem}
.auth-dove{display:inline-flex;align-items:center;justify-content:center;width:68px;height:68px;border-radius:50%;background:white;border:3px solid var(--sky-bg2);font-size:2rem;margin-bottom:.75rem;box-shadow:var(--shadow)}
.auth-hero h1{font-family:var(--serif);font-size:1.75rem;color:var(--sky3);font-weight:600}
.auth-hero .cong-name{font-size:.8rem;color:var(--text2);margin-top:.2rem;letter-spacing:.07em;text-transform:uppercase;font-weight:600}
.auth-card{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:1.5rem;box-shadow:var(--shadow)}
.tab-row{display:flex;background:var(--off);border-radius:var(--r2);padding:4px;margin-bottom:1.2rem;gap:4px}
.tab-btn{flex:1;padding:.5rem;border:none;background:transparent;color:var(--text2);border-radius:8px;cursor:pointer;font-family:var(--sans);font-size:.88rem;font-weight:500;transition:all .2s}
.tab-btn.active{background:var(--sky);color:white;font-weight:600}
.fg{margin-bottom:.85rem}
.fg label{display:block;font-size:.72rem;color:var(--text2);margin-bottom:.32rem;letter-spacing:.06em;text-transform:uppercase;font-weight:600}
.fg input,.fg select,.fg textarea{width:100%;padding:.7rem 1rem;background:var(--off);border:1.5px solid var(--border);border-radius:var(--r2);color:var(--text);font-family:var(--sans);font-size:16px;transition:border-color .2s,box-shadow .2s;outline:none}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:var(--sky);box-shadow:0 0 0 3px rgba(74,144,217,.12)}
.fg textarea{resize:vertical;min-height:80px;font-size:15px}
.fg select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234a6580' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:2rem}
.btn-sky{width:100%;padding:.82rem;background:linear-gradient(135deg,var(--sky),var(--sky2));color:white;border:none;border-radius:var(--r2);font-family:var(--sans);font-size:1rem;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 4px 12px rgba(74,144,217,.3)}
.btn-sky:active{transform:scale(.98)}
.btn-sky:disabled{opacity:.5;cursor:not-allowed}
.auth-err{background:var(--rose-bg);border:1px solid rgba(192,64,90,.25);border-radius:8px;padding:.6rem .9rem;color:var(--rose);font-size:.83rem;margin-top:.7rem;display:none}
.auth-hint{text-align:center;margin-top:.85rem;font-size:.72rem;color:var(--text3);line-height:1.6}

/* ── APP SHELL ── */
#app{display:flex;flex-direction:column;min-height:100vh}

/* Header */
header{position:sticky;top:0;z-index:200;background:rgba(255,255,255,.95);backdrop-filter:blur(16px);border-bottom:1.5px solid var(--border);box-shadow:var(--shadow-sm);display:flex;align-items:center;justify-content:space-between;padding:.65rem 1rem;gap:.75rem}
.brand{display:flex;align-items:center;gap:.5rem;font-family:var(--serif);font-size:1.1rem;color:var(--sky3);font-weight:600;white-space:nowrap}
.brand-sub{font-size:.65rem;color:var(--text3);font-family:var(--sans);text-transform:uppercase;letter-spacing:.07em;font-weight:600;margin-top:-.1rem}
.hdr-right{display:flex;align-items:center;gap:.5rem;flex-shrink:0}
.user-pill{background:var(--sky-bg);border:1.5px solid var(--border2);border-radius:20px;padding:.28rem .7rem;font-size:.75rem;display:flex;align-items:center;gap:.4rem;color:var(--text2);font-weight:500;max-width:160px;overflow:hidden}
.user-pill span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.role-pip{width:6px;height:6px;border-radius:50%;background:var(--green);flex-shrink:0}
.role-pip.admin{background:var(--sky)}
.btn-out{background:transparent;border:1.5px solid var(--border2);border-radius:8px;color:var(--text2);padding:.28rem .6rem;cursor:pointer;font-size:.75rem;font-family:var(--sans);font-weight:600;transition:all .2s;white-space:nowrap}
.btn-out:active{background:var(--rose-bg);color:var(--rose)}
.btn-admin-gear{background:transparent;border:none;cursor:pointer;font-size:1.15rem;padding:.2rem .35rem;border-radius:8px;transition:transform .2s;line-height:1}
.btn-admin-gear:hover{transform:rotate(45deg)}

/* ── Top nav (desktop) ── */
#top-nav{display:flex;overflow-x:auto;scrollbar-width:none;gap:.15rem;padding:.5rem .75rem;background:var(--white);border-bottom:1.5px solid var(--border);-webkit-overflow-scrolling:touch}
#top-nav::-webkit-scrollbar{display:none}
.nt{flex-shrink:0;display:flex;align-items:center;gap:.32rem;padding:.42rem .8rem;border:none;background:transparent;color:var(--text2);border-radius:8px;cursor:pointer;font-family:var(--sans);font-size:.8rem;font-weight:600;transition:all .2s;white-space:nowrap;min-height:36px}
.nt:active{background:var(--sky-bg)}
.nt.active{background:var(--sky);color:white;box-shadow:0 2px 8px rgba(74,144,217,.3)}
.nt .ic{font-size:.88rem}

/* ── Bottom nav (móvil) ── */
#bottom-nav{
  display:none;position:fixed;bottom:0;left:0;right:0;z-index:300;
  background:rgba(255,255,255,.97);backdrop-filter:blur(20px);
  border-top:1.5px solid var(--border);
  padding-bottom:env(safe-area-inset-bottom,0);
  box-shadow:0 -4px 20px rgba(74,144,217,.10);
}
.bn{
  flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:.15rem;padding:.5rem .2rem;border:none;background:transparent;
  color:var(--text3);cursor:pointer;font-family:var(--sans);
  transition:color .15s;min-height:54px;-webkit-tap-highlight-color:transparent;
  position:relative;
}
.bn.active{color:var(--sky)}
.bn.active .bn-icon{transform:scale(1.12)}
.bn.active::after{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:24px;height:2.5px;background:var(--sky);border-radius:0 0 3px 3px}
.bn-icon{font-size:1.3rem;transition:transform .15s;line-height:1}
.bn-label{font-size:.58rem;font-weight:700;letter-spacing:.02em;white-space:nowrap}

@media(max-width:640px){
  #top-nav{display:none}
  #bottom-nav{display:flex}
  main{padding-bottom:calc(70px + env(safe-area-inset-bottom,0)) !important}
}

#install-bar{display:none;align-items:center;gap:.75rem;padding:.6rem 1rem;flex-wrap:wrap;background:linear-gradient(90deg,var(--sky-bg),var(--white));border-bottom:1px solid var(--border);font-size:.82rem;color:var(--text2)}
#install-bar.show{display:flex}
#btn-install{padding:.36rem .9rem;background:var(--sky);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-family:var(--sans);font-size:.8rem}

/* Main content */
main{flex:1;padding:1rem;max-width:1100px;width:100%;margin:0 auto}
.page{display:none}
.page.active{display:block;animation:fadeUp .25s ease}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

/* ── COMPONENTS ── */
.section-hd{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem}
.section-title{font-family:var(--serif);font-size:1.4rem;color:var(--sky3);font-weight:600}
.section-sub{font-size:.78rem;color:var(--text3);font-weight:500}

.card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--r);padding:1.1rem;margin-bottom:.9rem;box-shadow:var(--shadow-sm)}
.card-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:.9rem;gap:.5rem;flex-wrap:wrap}
.card-title{font-family:var(--serif);font-size:1rem;color:var(--sky3);font-weight:600}

/* Badges */
.badge{display:inline-flex;align-items:center;padding:.2rem .58rem;border-radius:20px;font-size:.7rem;font-weight:700;letter-spacing:.03em}
.b-sky{background:var(--sky-bg);color:var(--sky3);border:1px solid var(--border2)}
.b-green{background:var(--green-bg);color:var(--green);border:1px solid rgba(46,158,107,.2)}
.b-amber{background:var(--amber-bg);color:var(--amber);border:1px solid rgba(192,120,32,.2)}
.b-rose{background:var(--rose-bg);color:var(--rose);border:1px solid rgba(192,64,90,.2)}
.b-gray{background:var(--off2);color:var(--text2);border:1px solid var(--border)}

/* Buttons */
.btn-sm{padding:.38rem .8rem;border-radius:8px;font-family:var(--sans);font-size:.78rem;font-weight:600;cursor:pointer;transition:all .2s;border:1.5px solid var(--border2);background:var(--white);color:var(--sky3);min-height:34px}
.btn-sm:active{background:var(--sky-bg)}
.btn-sm.danger{color:var(--rose);border-color:rgba(192,64,90,.25)}
.btn-sm.danger:active{background:var(--rose-bg)}
.btn-action{padding:.7rem 1.3rem;background:linear-gradient(135deg,var(--sky),var(--sky2));color:white;border:none;border-radius:var(--r2);font-family:var(--sans);font-size:.9rem;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 3px 10px rgba(74,144,217,.28);min-height:42px}
.btn-action:active{transform:scale(.97)}

/* Grid — mobile first */
.g2{display:grid;grid-template-columns:1fr;gap:.85rem}
.g3{display:grid;grid-template-columns:1fr;gap:.85rem}
.g4{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
@media(min-width:600px){.g2{grid-template-columns:1fr 1fr}.g3{grid-template-columns:repeat(3,1fr)}}
@media(min-width:768px){.g4{grid-template-columns:repeat(4,1fr)}}

/* Stat cards */
.stat{background:var(--white);border:1.5px solid var(--border);border-radius:var(--r);padding:1rem;display:flex;align-items:center;gap:.8rem;box-shadow:var(--shadow-sm)}
.stat-icon{font-size:1.5rem;flex-shrink:0}
.stat-val{font-family:var(--serif);font-size:1.7rem;color:var(--sky3);line-height:1;font-weight:600}
.stat-lbl{font-size:.72rem;color:var(--text2);margin-top:.12rem;font-weight:600}

/* Notif banner */
.notif{display:none;align-items:center;gap:.85rem;background:linear-gradient(135deg,var(--sky-bg),var(--white));border:1.5px solid var(--border2);border-left:4px solid var(--sky);border-radius:var(--r);padding:.9rem 1.1rem;margin-bottom:1.1rem;box-shadow:var(--shadow-sm)}
.notif.show{display:flex}
.notif-ico{font-size:1.6rem;flex-shrink:0}
.notif h3{font-family:var(--serif);font-size:.95rem;color:var(--sky3);margin-bottom:.15rem;font-weight:600}
.notif p{font-size:.8rem;color:var(--text2)}

/* Meeting */
.meeting-item{display:flex;gap:.85rem;align-items:flex-start}
.meet-date{min-width:48px;background:var(--sky);border-radius:var(--r2);display:flex;flex-direction:column;align-items:center;padding:.45rem .35rem;flex-shrink:0;box-shadow:0 3px 10px rgba(74,144,217,.25)}
.meet-day{font-family:var(--serif);font-size:1.4rem;color:white;line-height:1;font-weight:600}
.meet-mon{font-size:.6rem;text-transform:uppercase;color:rgba(255,255,255,.85);letter-spacing:.06em;margin-top:.08rem}
.meet-body{flex:1;min-width:0}
.meet-body h4{font-weight:700;margin-bottom:.2rem;color:var(--text);font-size:.95rem}
.meet-body p{font-size:.82rem;color:var(--text2);line-height:1.45}
.meet-tags{display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.4rem}
.meet-type-tabs{display:flex;gap:.35rem;margin-bottom:.9rem;flex-wrap:wrap}
.mtt{padding:.4rem .85rem;border:1.5px solid var(--border2);border-radius:8px;background:var(--white);color:var(--text2);font-size:.8rem;font-weight:700;cursor:pointer;transition:all .2s;font-family:var(--sans);min-height:34px}
.mtt.active{background:var(--sky);color:white;border-color:var(--sky)}

/* Announcement */
.ann{border-left:4px solid var(--sky);padding:.8rem .95rem;background:var(--white);border-radius:0 var(--r2) var(--r2) 0;margin-bottom:.8rem;border:1px solid var(--border);border-left-width:4px;box-shadow:var(--shadow-sm)}
.ann.urgent{border-left-color:var(--rose);background:var(--rose-bg)}
.ann.info{border-left-color:var(--green)}
.ann h4{font-weight:700;margin-bottom:.15rem;color:var(--text);font-size:.92rem}
.ann p{font-size:.82rem;color:var(--text2);line-height:1.5}
.ann-meta{font-size:.7rem;color:var(--text3);margin-top:.38rem;display:flex;align-items:center;gap:.45rem;flex-wrap:wrap}

/* Assignment */
.as-row{display:flex;align-items:center;justify-content:space-between;padding:.7rem 0;border-bottom:1px solid var(--border);gap:.4rem;flex-wrap:wrap}
.as-row:last-child{border:none}
.as-left{display:flex;align-items:center;gap:.65rem;flex:1;min-width:0}
.avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;flex-shrink:0;font-family:var(--serif)}

/* Map */
#map{height:360px;border-radius:var(--r2);border:1.5px solid var(--border);box-shadow:var(--shadow-sm)}
@media(min-width:600px){#map{height:440px}}
.map-ctrl{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.8rem}
.map-btn{padding:.4rem .8rem;background:var(--white);border:1.5px solid var(--border);border-radius:8px;color:var(--text2);cursor:pointer;font-family:var(--sans);font-size:.78rem;font-weight:600;transition:all .2s;min-height:34px}
.map-btn.active{background:var(--sky);border-color:var(--sky);color:white}
.map-leg{display:flex;gap:.9rem;flex-wrap:wrap;margin-top:.6rem;font-size:.75rem;color:var(--text2);font-weight:600}
.leg-item{display:flex;align-items:center;gap:.35rem}
.leg-dot{width:8px;height:8px;border-radius:50%}

/* Table — scroll horizontal en móvil */
.tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:var(--r2)}
.tbl{width:100%;border-collapse:collapse;font-size:.84rem;min-width:480px}
.tbl th{text-align:left;color:var(--text2);font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;padding:.48rem .65rem;border-bottom:2px solid var(--border2);font-weight:700;white-space:nowrap}
.tbl td{padding:.62rem .65rem;border-bottom:1px solid var(--border);color:var(--text)}
.tbl tr:hover td{background:var(--sky-bg)}

/* Programs */
.prog-card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--r);padding:1rem;margin-bottom:.85rem;box-shadow:var(--shadow-sm);display:flex;gap:.85rem;align-items:flex-start}
.prog-icon{width:42px;height:42px;border-radius:var(--r2);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.3rem;background:var(--sky-bg);border:1.5px solid var(--border2)}
.prog-body{flex:1;min-width:0}
.prog-body h4{font-weight:700;color:var(--text);margin-bottom:.18rem;font-size:.93rem}
.prog-body p{font-size:.81rem;color:var(--text2);line-height:1.45}
.prog-meta{font-size:.73rem;color:var(--text3);margin-top:.3rem;font-weight:600}

/* Reports */
.year-ring{display:flex;align-items:center;justify-content:center;flex-direction:column;width:96px;height:96px;border-radius:50%;flex-shrink:0;border:4px solid var(--sky);background:var(--sky-bg);box-shadow:0 0 16px rgba(74,144,217,.18)}
.year-ring .num{font-family:var(--serif);font-size:2rem;color:var(--sky3);line-height:1;font-weight:600}
.year-ring .lbl{font-size:.62rem;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;font-weight:700}
.month-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.55rem}
@media(min-width:480px){.month-grid{grid-template-columns:repeat(4,1fr)}}
.month-cell{background:var(--off);border:1.5px solid var(--border);border-radius:var(--r2);padding:.62rem;text-align:center;transition:all .2s}
.month-cell.has-report{border-color:var(--sky);background:var(--sky-bg);cursor:pointer}
.month-cell .mc-name{font-size:.72rem;color:var(--text2);text-transform:uppercase;letter-spacing:.04em;margin-bottom:.25rem;font-weight:700}
.month-cell .mc-status{font-size:.85rem}

/* Misc */
.group-pill{display:inline-flex;align-items:center;gap:.3rem;background:var(--sky-bg);border:1px solid var(--border2);border-radius:20px;padding:.22rem .65rem;font-size:.76rem;color:var(--sky3);font-weight:600}
.toast{position:fixed;bottom:1.2rem;right:1rem;left:1rem;z-index:9999;background:var(--white);border:1.5px solid var(--sky);border-radius:var(--r);padding:.8rem 1.1rem;box-shadow:var(--shadow-lg);transform:translateY(calc(100% + 2rem));transition:transform .3s cubic-bezier(.4,0,.2,1);pointer-events:none}
@media(min-width:480px){.toast{left:auto;max-width:300px}}
.toast.show{transform:translateY(0)}
.toast h4{font-size:.87rem;color:var(--sky3);margin-bottom:.1rem;font-weight:700}
.toast p{font-size:.77rem;color:var(--text2)}
.spin{display:inline-block;width:15px;height:15px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:rot .6s linear infinite;vertical-align:middle}
@keyframes rot{to{transform:rotate(360deg)}}
.empty{text-align:center;padding:2rem;color:var(--text3)}
.empty .emic{font-size:2rem;display:block;margin-bottom:.45rem}
.empty p{font-size:.84rem;font-weight:500}

/* ── ACCORDION reuniones ── */
.meet-accordion{border:1.5px solid var(--border);border-radius:var(--r);margin-bottom:.75rem;overflow:hidden;background:var(--white);box-shadow:var(--shadow-sm)}
.meet-accordion-hd{display:flex;align-items:center;gap:.85rem;padding:.9rem 1rem;cursor:pointer;user-select:none;-webkit-user-select:none}
.meet-accordion-hd:active{background:var(--sky-bg)}
.meet-chevron{margin-left:auto;font-size:.8rem;color:var(--text3);transition:transform .2s;flex-shrink:0}
.meet-accordion.open .meet-chevron{transform:rotate(180deg)}
.meet-accordion-body{display:none;padding:0 1rem 1rem;border-top:1px solid var(--border)}
.meet-accordion.open .meet-accordion-body{display:block}
  `
  document.head.appendChild(style)
}