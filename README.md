#  Congregación Vista Grande

## Estructura del proyecto
```
Pizarra/
├── index.html                     ← Entry point HTML
├── vite.config.js                 ← Configuración de Vite
├── package.json                   ← Dependencias
├── .github/
│   └── workflows/
│       └── deploy.yml             ← Auto-deploy a GitHub Pages
├── public/
│   ├── manifest.json              ← PWA config
│   └── sw.js                      ← Service Worker
└── src/
    ├── main.js                    ← Punto de entrada JS
    ├── config/
    │   ├── supabase.js            ← 🔑 PON TUS CREDENCIALES AQUÍ
    │   └── demoData.js            ← Datos de ejemplo
    ├── services/
    │   ├── auth.js                ← Login / Registro / Logout
    │   └── db.js                  ← Get / Insert / Delete / Upsert
    ├── pages/
    │   ├── Auth.js                ← Pantalla de login
    │   ├── Shell.js               ← Header + Nav
    │   └── Dashboard.js           ← Página de inicio
    └── utils/
        ├── helpers.js             ← Funciones utilitarias
        ├── router.js              ← Navegación entre páginas
        └── styles.js              ← Todo el CSS
```

---

## Pasos para poner en marcha

### 1. Instalar herramientas (una sola vez)
- Node.js → https://nodejs.org (versión LTS)
- Git     → https://git-scm.com

### 2. Copiar los archivos
Copia la carpeta `kharis-final` a donde quieras en tu computadora.

### 3. Abrir terminal en esa carpeta y ejecutar:
```bash
npm install
```

### 4. Configurar Supabase
Abre `src/config/supabase.js` y reemplaza:
```js
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co'
const SUPABASE_KEY = 'eyJhbGci...'
```

### 5. Probar en local (opcional)
```bash
npm run dev
```
Abre http://localhost:5173/kharis/

### 6. Subir a GitHub
1. Crea un repositorio en github.com llamado exactamente `kharis`
2. En tu terminal:
```bash
git init
git add .
git commit -m "primer commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/kharis.git
git push -u origin main
```

### 7. Activar GitHub Pages
En tu repositorio de GitHub:
- Settings → Pages → Source: **Deploy from a branch**
- Branch: **gh-pages** → Save

El primer deploy tarda ~2 minutos. Después de eso cada `git push` despliega automáticamente.

Tu app quedará en: `https://TU-USUARIO.github.io/kharis/`

### 8. Ejecutar el schema en Supabase
- supabase.com → tu proyecto → SQL Editor
- Pega el contenido de `schema.sql` y ejecuta

Crear el primer admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'tu@correo.com';
```

---

## Credenciales demo (sin Supabase)
| Correo | Contraseña | Rol |
|--------|-----------|-----|
| admin@cong.com | admin123 | Administrador |
| usuario@cong.com | user123 | Publicador |
