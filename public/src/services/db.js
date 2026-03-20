import { supabase, DEMO_MODE } from '../config/supabase.js'

// Estado demo en memoria (cargado desde localStorage)
let DS = null

export function getDS() {
  return DS
}

export function setDS(data) {
  DS = data
}

export function saveDS() {
  localStorage.setItem('kharis_v3', JSON.stringify(DS))
}

// ── Operaciones genéricas ──────────────────────────────────────
export async function get(col) {
  if (DEMO_MODE) return [...(DS[col] || [])]
  const { data } = await supabase.from(col).select('*').order('created_at', { ascending: false })
  return data || []
}

export async function ins(col, obj) {
  if (DEMO_MODE) {
    const item = { id: col[0] + Date.now(), ...obj, created_at: Date.now() }
    DS[col].unshift(item)
    saveDS()
    return item
  }
  const { data } = await supabase.from(col).insert(obj).select().single()
  return data
}

export async function del(col, id) {
  if (DEMO_MODE) {
    DS[col] = DS[col].filter(x => x.id !== id)
    saveDS()
    return
  }
  await supabase.from(col).delete().eq('id', id)
}

export async function upsertReport(obj, match) {
  if (DEMO_MODE) {
    const idx = DS.reports.findIndex(x =>
      x.email === match.email && x.year === match.year && x.month === match.month
    )
    if (idx >= 0) {
      DS.reports[idx] = { ...DS.reports[idx], ...obj }
    } else {
      DS.reports.unshift({ id: 'r' + Date.now(), ...obj, created_at: Date.now() })
    }
    saveDS()
    return
  }
  await supabase.from('reports').upsert({ ...obj, ...match })
}

// ── Usuarios y grupos (queries con joins) ──────────────────────
export async function getUsers() {
  if (DEMO_MODE) return DS.users
  const { data } = await supabase.from('users').select('*, groups(name)')
  return data || []
}

export async function getGroups() {
  if (DEMO_MODE) return DS.groups
  const { data } = await supabase.from('groups').select('*')
  return data || []
}

export async function setUserGroup(email, groupId) {
  if (DEMO_MODE) {
    const u = DS.users.find(x => x.email === email)
    if (u) { u.group_id = groupId; saveDS() }
    return
  }
  await supabase.from('users').update({ group_id: groupId }).eq('email', email)
}

export async function setUserRole(email, role) {
  if (DEMO_MODE) {
    const u = DS.users.find(x => x.email === email)
    if (u) { u.role = role; saveDS() }
    return
  }
  await supabase.from('users').update({ role }).eq('email', email)
}
