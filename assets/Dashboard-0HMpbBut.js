import{g as t,a as r,N as a,c as b,t as f,f as $}from"./index-DYjI_oTA.js";import"https://esm.sh/@supabase/supabase-js@2";async function k(l,v){l.innerHTML='<div class="page active" id="page-dash"><p style="color:var(--text3);font-size:.85rem">Cargando...</p></div>';const[o,c,m,p]=await Promise.all([t("meetings"),t("announcements"),t("assignments"),t("reports")]),g=r().users,h=r().groups,u=a.toISOString().split("T")[0],e=[...o].sort((s,i)=>s.date.localeCompare(i.date)).find(s=>s.date>=u),d=e?new Date(e.date+"T00:00:00"):null,n=m.find(s=>s.email===v.email&&s.week===b()),y=p.filter(s=>s.year===a.getFullYear());l.innerHTML=`<div class="page active" id="page-dash">

    <!-- Texto del año – solo en dashboard -->
    <div style="background:linear-gradient(135deg,var(--sky-bg),var(--white));border:1.5px solid var(--border2);border-left:5px solid var(--sky);border-radius:var(--r);padding:1.1rem 1.4rem;margin-bottom:1.3rem;box-shadow:var(--shadow-sm)">
      <div style="font-size:.68rem;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:.3rem">✦ Texto del año 2026</div>
      <p style="font-family:var(--serif);font-size:1.02rem;color:var(--sky3);font-style:italic;line-height:1.5">«Felices los que reconocen sus necesidades espirituales»</p>
      <div style="font-size:.75rem;color:var(--text3);margin-top:.3rem;font-weight:600">— Mateo 5:3</div>
    </div>

    ${n?`
    <div class="notif show">
      <div class="notif-ico">🔔</div>
      <div><h3>Asignación: ${n.role}</h3><p>Esta semana (${n.week}) tienes una participación activa</p></div>
    </div>`:""}

    <div class="section-hd">
      <h2 class="section-title">Panel de inicio</h2>
      <span class="section-sub">${a.toLocaleDateString("es",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</span>
    </div>

    <div class="g4" style="margin-bottom:1.3rem">
      <div class="stat"><div class="stat-icon">👥</div><div><div class="stat-val">${g.length}</div><div class="stat-lbl">Publicadores</div></div></div>
      <div class="stat"><div class="stat-icon">👨‍👩‍👧</div><div><div class="stat-val">${h.length}</div><div class="stat-lbl">Grupos</div></div></div>
      <div class="stat"><div class="stat-icon">📅</div><div><div class="stat-val">${o.filter(s=>{const i=new Date(s.date);return i.getFullYear()===a.getFullYear()&&i.getMonth()===a.getMonth()}).length}</div><div class="stat-lbl">Reuniones este mes</div></div></div>
      <div class="stat"><div class="stat-icon">📊</div><div><div class="stat-val">${y.length}</div><div class="stat-lbl">Informes este año</div></div></div>
    </div>

    <div class="g2">
      <div class="card">
        <div class="card-hd"><span class="card-title">Próxima reunión</span><span class="badge b-green">Esta semana</span></div>
        ${e&&d?`
        <div class="meeting-item">
          <div class="meet-date"><div class="meet-day">${d.getDate()}</div><div class="meet-mon">${d.toLocaleDateString("es",{month:"short"}).toUpperCase()}</div></div>
          <div class="meet-body"><h4>${e.title}</h4><p>${e.time} · ${f(e.type)}</p></div>
        </div>`:'<div class="empty"><span class="emic">📅</span><p>Sin reuniones próximas</p></div>'}
      </div>
      <div class="card">
        <div class="card-hd"><span class="card-title">Anuncios recientes</span></div>
        ${c.slice(0,2).map(s=>`
          <div class="ann ${s.priority!=="normal"?s.priority:""}">
            <h4>${s.title}</h4>
            <p>${s.body}</p>
            <div class="ann-meta">${$(s.created_at)}</div>
          </div>`).join("")||'<div class="empty"><span class="emic">📭</span><p>Sin anuncios</p></div>'}
      </div>
    </div>
  </div>`}export{k as renderDashboard};
