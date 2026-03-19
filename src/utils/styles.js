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
  `
  document.head.appendChild(style)
}
