# 🍽️ De Cuadros V3 — Guía Completa

## 📁 PASO 1: Guardar tus Archivos (Backup)

Tienes **DOS versiones** de la app. Ambas están seguras en tu Mac:

```
/Users/robertoortega/Documents/pk/
├── decuadros-app/        ← V2 (la que abres directo en el navegador)
│   ├── index.html
│   ├── styles.css
│   ├── app1.js, app2.js, app3.js
│   ├── games.js
│   └── img/              ← Tus 12 imágenes AI
│
└── decuadros-v3/         ← V3 (la versión pro con base de datos)
    ├── prisma/            ← Base de datos
    ├── src/               ← Todo el código TypeScript/React
    ├── docker-compose.yml ← Configuración de servidores
    └── package.json       ← Dependencias
```

### Para hacer backup de TODO:

```bash
# Copiar ambas carpetas a un USB, disco duro, o carpeta de respaldo
cp -r ~/Documents/pk/decuadros-app ~/Desktop/BACKUP_decuadros-app
cp -r ~/Documents/pk/decuadros-v3 ~/Desktop/BACKUP_decuadros-v3
```

### Para subir a GitHub (recomendado):

```bash
# V2
cd ~/Documents/pk/decuadros-app
git init && git add . && git commit -m "De Cuadros V2"

# V3
cd ~/Documents/pk/decuadros-v3
git init && git add . && git commit -m "De Cuadros V3"
```

Luego crea repos en github.com y sube con `git remote add origin <url> && git push`.

---

## 🖥️ PASO 2: Instalar lo Necesario para V3

### 2.1 — Node.js (ya lo tienes ✅)
Si puedes correr `npm` en terminal, ya está instalado.

### 2.2 — Docker Desktop (NECESARIO para la base de datos)

1. Ve a **https://www.docker.com/products/docker-desktop/**
2. Descarga **Docker Desktop for Mac**
3. Instala el .dmg (arrastra a Applications)
4. Abre Docker Desktop desde Applications
5. Espera a que el icono de la ballena 🐳 aparezca en la barra superior
6. Verifica que funciona:

```bash
docker --version
# Debería mostrar: Docker version 27.x.x
```

---

## 🚀 PASO 3: Arrancar De Cuadros V3

Abre Terminal y ejecuta estos comandos **uno por uno**:

```bash
# 1. Ir a la carpeta del proyecto
cd ~/Documents/pk/decuadros-v3

# 2. Instalar dependencias (solo la primera vez)
npm install

# 3. Encender la base de datos (Docker debe estar abierto)
docker compose up -d

# 4. Crear las tablas en la base de datos (solo la primera vez)
npm run db:push

# 5. Cargar los datos iniciales (menú, logros, misiones, etc.)
npm run db:seed

# 6. Arrancar la aplicación
npm run dev
```

### 7. Abrir en el navegador:
👉 **http://localhost:3000**

### Login de prueba:
- Email: `demo@decuadros.es`
- Contraseña: `demo123`

---

## 🔧 Comandos Útiles del Día a Día

| Comando | Qué hace |
|---|---|
| `npm run dev` | Arranca la app (localhost:3000) |
| `docker compose up -d` | Enciende la base de datos |
| `docker compose down` | Apaga la base de datos |
| `npm run db:studio` | Abre editor visual de la base de datos |
| `npm run db:seed` | Recarga los datos de ejemplo |
| `npm run db:reset` | Borra TODO y recarga desde cero |
| `npm run build` | Compila para producción |

---

## ❓ Problemas Comunes

### "Error: Can't reach database server"
→ Docker no está encendido. Abre Docker Desktop y ejecuta `docker compose up -d`

### "Port 3000 already in use"
→ Otro proyecto está usando el puerto. Ciérralo o usa: `npm run dev -- -p 3001`

### "Module not found"
→ Ejecuta `npm install` de nuevo

### Quiero ver los datos de la base de datos
→ Ejecuta `npm run db:studio` y se abrirá un editor visual en tu navegador

---

## 📱 Qué Hay en la V3

| Pantalla | URL |
|---|---|
| Home (público) | http://localhost:3000 |
| Carta (público) | http://localhost:3000/menu |
| Login | http://localhost:3000/login |
| Registro | http://localhost:3000/register |
| Admin Dashboard | http://localhost:3000/admin |

---

## 🔐 Archivos Importantes (NO borrar)

| Archivo | Para qué sirve |
|---|---|
| `.env` | Contraseñas y claves secretas |
| `prisma/schema.prisma` | Estructura de la base de datos |
| `prisma/seed.ts` | Datos iniciales (menú, logros, etc.) |
| `src/lib/gamification.ts` | Motor de XP, niveles, mascotas |
| `src/lib/auth.ts` | Sistema de login |
| `docker-compose.yml` | Configuración de la base de datos |
