import { supabase, DEMO_MODE } from '../config/supabase.js'
import { DEMO_USERS, initDemoState } from '../config/demoData.js'
import { getDS, setDS, saveDS, getGroups } from './db.js'

// Carga o inicializa el estado demo desde localStorage
export function initDemo() {
  const saved = localStorage.getItem('kharis_v3')
  setDS(saved ? JSON.parse(saved) : initDemoState())
}

export async function login(email, password) {
  if (DEMO_MODE) {
    const u = DEMO_USERS[email.toLowerCase()]
    if (!u) throw new Error('Usuario no encontrado')
    if (u.password !== password) throw new Error('Contraseña incorrecta')
    const DS = getDS()
    const group = DS.groups.find(g => g.id === u.group_id)
    return { ...u, group }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  const { data: profile } = await supabase
    .from('users').select('*, groups(*)').eq('id', data.user.id).single()
  return { ...profile, group: profile.groups }
}

export async function register(name, email, password) {
  if (DEMO_MODE) {
    if (DEMO_USERS[email]) throw new Error('El correo ya está registrado')
    DEMO_USERS[email] = { email, name, role: 'user', group_id: null, password }
    const DS = getDS()
    DS.users.push({ email, name, role: 'user', group_id: null })
    saveDS()
    return
  }

  const { data, error } = await supabase.auth.signUp({
    email, password, options: { data: { name } }
  })
  if (error) throw error
  // Upsert por si el trigger ya creó el perfil sin nombre
  await supabase.from('users').upsert(
    { id: data.user.id, name, email, role: 'user' },
    { onConflict: 'id' }
  )
}

export async function logout() {
  if (!DEMO_MODE && supabase) await supabase.auth.signOut()
}