# 🎓 Gestor UNAD 740508 — Backend API

API REST con Node.js + Express + MongoDB Atlas para el Gestor de Tareas UNAD.

---

## 📋 Requisitos previos

- Node.js 18+ instalado
- Cuenta en [MongoDB Atlas](https://cloud.mongodb.com) (gratis)
- Cuenta en [Railway](https://railway.app) o [Render](https://render.com) (gratis)

---

## 1️⃣ Configurar MongoDB Atlas

1. Ve a [cloud.mongodb.com](https://cloud.mongodb.com) y crea una cuenta gratuita
2. Crea un **nuevo proyecto** → **Build a Database** → elige **M0 Free**
3. Elige región (la más cercana a Colombia: `us-east-1`)
4. En **Security > Database Access**: crea un usuario con contraseña
   - Usuario: `unad_admin`
   - Contraseña: (genera una segura, guárdala)
   - Role: `Atlas admin`
5. En **Security > Network Access**: haz clic en **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
6. En **Database > Connect** → **Drivers** → copia el connection string:
   ```
   mongodb+srv://unad_admin:<password>@cluster0.xxxxx.mongodb.net/unad_gestor
   ```
   Reemplaza `<password>` con tu contraseña real.

---

## 2️⃣ Configurar el proyecto localmente

```bash
# Clonar / copiar la carpeta backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env (copia el ejemplo)
cp .env.example .env
```

Edita el archivo `.env`:
```env
MONGODB_URI=mongodb+srv://unad_admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/unad_gestor
PORT=3001
API_SECRET=una_clave_secreta_larga_y_aleatoria_aqui
FRONTEND_URL=*
```

---

## 3️⃣ Cargar los datos iniciales (seed)

```bash
# Ejecuta UNA SOLA VEZ para crear los cursos y tareas iniciales
node seed.js
```

Deberías ver:
```
✅ Conectado a MongoDB Atlas
🗑  Colecciones limpiadas
📘 2 cursos insertados
📋 16 tareas insertadas
🎉 Seed completado exitosamente!
```

---

## 4️⃣ Probar localmente

```bash
npm run dev
# → Servidor en http://localhost:3001
```

Abre el navegador y ve a `http://localhost:3001` — debes ver:
```json
{"status":"ok","app":"Gestor UNAD 740508 API","db":"connected"}
```

---

## 5️⃣ Desplegar en Railway (recomendado)

### Opción A — Railway (más fácil)

1. Ve a [railway.app](https://railway.app) y crea cuenta con GitHub
2. Haz clic en **New Project** → **Deploy from GitHub repo**
3. Sube la carpeta `backend` a un repositorio de GitHub
4. Railway detecta automáticamente que es Node.js
5. En **Variables**, agrega:
   ```
   MONGODB_URI = mongodb+srv://...
   API_SECRET  = tu_clave_secreta
   FRONTEND_URL = *
   ```
6. Railway despliega automáticamente. Copia la URL pública:
   ```
   https://tu-app.up.railway.app
   ```

### Opción B — Render

1. Ve a [render.com](https://render.com) y crea cuenta
2. **New** → **Web Service** → conecta tu repo de GitHub
3. Configuración:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node
4. En **Environment Variables** agrega las mismas variables
5. Copia la URL pública:
   ```
   https://tu-app.onrender.com
   ```

---

## 6️⃣ Conectar el frontend

1. Abre el archivo `frontend/index.html` en tu navegador
2. Haz clic en el botón **⚙️ API** (arriba a la derecha)
3. Ingresa la URL de tu backend desplegado:
   ```
   https://tu-app.up.railway.app
   ```
4. Haz clic en **Guardar**
5. Los datos se cargarán automáticamente desde MongoDB ✅

> **Desarrollo local**: usa `http://localhost:3001`

---

## 📡 Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Health check |
| GET | `/api/courses` | Listar cursos |
| POST | `/api/courses` | Crear curso |
| DELETE | `/api/courses/:id` | Eliminar curso |
| GET | `/api/tasks` | Listar tareas (opcional: `?course=2281`) |
| POST | `/api/tasks` | Crear tarea |
| PUT | `/api/tasks/:id` | Actualizar tarea completa |
| PATCH | `/api/tasks/:id` | Actualizar campos específicos |
| DELETE | `/api/tasks/:id` | Eliminar tarea |
| GET | `/api/tasks/:id/progress` | Progreso de subtareas |
| PUT | `/api/tasks/:id/progress` | Guardar progreso de subtareas |
| GET | `/api/students` | Listar estudiantes (opcional: `?course=2281`) |
| POST | `/api/students/bulk` | Importar estudiantes desde Excel |
| DELETE | `/api/students/:id` | Eliminar estudiante |
| DELETE | `/api/students/course/:id` | Limpiar estudiantes de un curso |
| GET | `/api/entregas` | Estados de entrega (filtros: `?course=` `?taskId=`) |
| PUT | `/api/entregas` | Crear/actualizar estado de entrega |

---

## 🔐 Seguridad

El header `x-api-secret` protege todos los endpoints.  
El frontend lo envía automáticamente si lo configuras en `localStorage`:

```javascript
localStorage.setItem('unad-api-secret', 'tu_clave_secreta');
```

---

## 🗂 Estructura del proyecto

```
unad-app/
├── backend/
│   ├── server.js       ← Servidor Express + todas las rutas
│   ├── models.js       ← Modelos Mongoose (Course, Task, Student, Entrega)
│   ├── seed.js         ← Script para datos iniciales
│   ├── package.json
│   ├── .env.example    ← Plantilla de variables de entorno
│   └── .gitignore
└── frontend/
    └── index.html      ← App completa (HTML + CSS + JS)
```
