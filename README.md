# Xixaro

Plataforma B2B de comercio agricola directo que conecta productores del campo mexicano con compradores comerciales (restaurantes, supermercados, distribuidoras y exportadoras), eliminando intermediarios en la cadena de suministro.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React 19 | Framework de interfaz de usuario |
| Vite 8 | Bundler y servidor de desarrollo |
| Firebase Auth | Registro y login con email/contrasena |
| Cloud Firestore | Base de datos para productos, usuarios y resenas |
| Firebase Realtime Database | Chat en tiempo real, notificaciones y alertas |
| Leaflet + React Leaflet | Mapa interactivo en el marketplace |
| Lucide React | Iconos SVG |

## Estructura de carpetas

```
src/
├── components/          # Componentes reutilizables
│   ├── Icons.jsx        # Iconos SVG personalizados de la marca
│   ├── Navbar.jsx       # Barra de navegacion (sticky)
│   ├── Navbar.css
│   ├── ProductCard.jsx  # Tarjeta de producto (marketplace y perfil)
│   ├── ProductCard.css
│   ├── ProductMap.jsx   # Mapa Leaflet con marcadores de productos
│   ├── ProductMap.css
│   └── StarRating.jsx   # Componente de estrellas 1-5
│
├── contexts/
│   └── AuthContext.jsx   # Estado global de autenticacion (usuario actual, rol, datos)
│
├── hooks/
│   └── useToast.js       # Hook para notificaciones toast
│
├── pages/
│   ├── Home.jsx / .css          # Landing page con hero SVG de campo mexicano
│   ├── Login.jsx                # Inicio de sesion + recuperar contrasena
│   ├── Register.jsx             # Registro con seleccion de rol
│   ├── Auth.css                 # Estilos compartidos de login/registro
│   ├── Dashboard.jsx / .css     # Panel del vendedor (publicar, editar, eliminar)
│   ├── Marketplace.jsx / .css   # Listado en tiempo real + mapa + filtro por distancia
│   ├── Profile.jsx / .css       # Perfil de usuario con productos, resenas, alertas
│   ├── Chat.jsx / .css          # Chat directo entre usuarios
│   ├── ChatList.jsx / .css      # Lista de conversaciones
│   ├── Alerts.jsx / .css        # Notificaciones de nuevos productos
│   └── NotFound.jsx / .css      # Pagina 404
│
├── firebase.js           # Configuracion e inicializacion de Firebase
├── App.jsx               # Router principal y rutas protegidas
├── main.jsx              # Punto de entrada de React
└── index.css             # Variables CSS globales y estilos base

public/
├── favicon.svg           # Icono de la pestana
└── _redirects            # Configuracion de Netlify para SPA
```

## Instalacion

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd xixaro

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
cp .env.example .env
# Llenar con las credenciales reales de Firebase

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Build para produccion
npm run build
```

## Variables de entorno

Crear un archivo `.env` en la raiz del proyecto con estas variables:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> **NOTA:** Actualmente las credenciales de Firebase estan hardcodeadas en `src/firebase.js`. Para produccion, migrar a variables de entorno usando `import.meta.env.VITE_*`.

## Funcionalidades implementadas

### Autenticacion
- Registro con email/contrasena y seleccion de rol (Productor o Comprador Comercial)
- Login con manejo de errores en espanol
- Recuperacion de contrasena con `sendPasswordResetEmail`
- Rutas protegidas por rol

### Panel del Productor (Dashboard)
- Publicar productos con: nombre, descripcion, categoria, precio por tonelada, cantidad, unidad, foto
- Editar productos existentes (formulario se llena con datos actuales)
- Eliminar productos con confirmacion
- Compresion automatica de fotos a max 400KB usando Canvas
- Geolocalizacion del producto con `navigator.geolocation`
- Precio promedio en tiempo real de productos similares en la plataforma
- Equivalencias automaticas de precio: por tonelada, por kg, por libra

### Marketplace
- Listado en tiempo real con `onSnapshot` de Firestore
- Busqueda por nombre, descripcion o vendedor
- Ordenamiento por precio y por cercania
- Toggle vista lista / vista mapa (Leaflet con OpenStreetMap)
- Filtro "Cerca de mi" con radio seleccionable: 5km, 10km, 25km
- Contactar vendedor desde la tarjeta del producto

### Chat
- Chat directo entre compradores y vendedores via Firebase Realtime Database
- Mensajes en tiempo real con timestamps
- Lista de conversaciones con ultimo mensaje
- Badge de mensajes no leidos en el navbar (usa `runTransaction` para incremento atomico)
- Al abrir una conversacion, se marca como leida

### Resenas
- Compradores y vendedores pueden dejar resenas mutuamente
- Puntuacion de 1 a 5 estrellas con comentario
- Promedio de calificacion visible en el perfil
- Tiempo real con `onSnapshot`

### Alertas de nuevos productos
- Compradores eligen categorias de interes (verduras, chiles, frutas, granos, otros)
- Al publicar un producto, se notifica a compradores suscritos a esa categoria
- Badge de alertas no leidas en el navbar
- Pagina de alertas con listado y marca automatica de lectura

### Geolocalizacion
- Vendedor agrega ubicacion al producto desde el navegador
- Mapa interactivo con marcadores y popups informativos
- Filtro por distancia usando formula Haversine
- Ubicacion aproximada del vendedor en su perfil (reverse geocoding con Nominatim)

### Otros
- Pagina 404 con boton de regreso
- Diseno responsive mobile-first
- Paleta de colores: verde tierra (#2D5016), naranja cosecha (#E8621A), dorado (#D4A843)
- Tipografia: Playfair Display (titulos) + DM Sans (cuerpo)
- Iconos SVG personalizados de la marca

## Funcionalidades pendientes

- [ ] Migrar credenciales de Firebase a variables de entorno (`.env`)
- [ ] Integracion con API de Conecta (procesador de pagos mexicano)
- [ ] Verificacion de identidad de productores
- [ ] Sistema de pedidos formales con cantidades, fechas de entrega y seguimiento
- [ ] Facturacion electronica (CFDI)
- [ ] Notificaciones push con Firebase Cloud Messaging
- [ ] Panel de administrador para moderar productos y usuarios
- [ ] Subida de fotos a Firebase Storage (actualmente se usa base64 en Firestore)
- [ ] Optimizacion de bundle (code splitting por rutas)
- [ ] Tests unitarios y de integracion
- [ ] PWA (Progressive Web App) para uso offline
- [ ] API REST para integraciones de terceros

## Arquitectura de base de datos

### Firestore (Cloud Firestore)

```
users/{userId}
├── name: string
├── email: string
├── role: "vendedor" | "comprador"
├── createdAt: string (ISO)
└── photoURL: string

products/{productId}
├── name: string
├── description: string
├── category: string
├── price: number (precio por tonelada en MXN)
├── quantity: number
├── unit: string
├── imageUrl: string (base64)
├── sellerId: string
├── sellerName: string
├── lat: number (opcional)
├── lng: number (opcional)
└── createdAt: string (ISO)

reviews/{reviewId}
├── targetId: string (usuario resenado)
├── authorId: string
├── authorName: string
├── rating: number (1-5)
├── comment: string
└── createdAt: string (ISO)
```

### Realtime Database

```
chats/{chatId}/messages/{messageId}
├── text: string
├── senderId: string
├── senderName: string
└── timestamp: ServerTimestamp

userChats/{userId}/{chatId}
├── lastMessage: string
├── timestamp: ServerTimestamp
├── otherUserId: string
├── otherUserName: string
└── unread: number

alerts/{userId}/categories
├── verduras: boolean
├── chiles: boolean
├── frutas: boolean
├── granos: boolean
└── otros: boolean

notifications/{userId}/{notificationId}
├── type: "new_product"
├── productName: string
├── category: string
├── sellerName: string
├── sellerId: string
├── timestamp: number
└── read: boolean
```

### Reglas de seguridad

Las reglas estan en:
- `firestore.rules` — Reglas de Firestore
- `database.rules.json` — Reglas de Realtime Database
- `storage.rules` — Reglas de Storage (no activo actualmente)

Desplegar reglas: `firebase deploy --only firestore:rules,database`

## Notas para el equipo de desarrollo

1. **Las fotos se guardan como base64 en Firestore**, no en Storage. Esto tiene un limite de ~1MB por documento. Para produccion, migrar a Firebase Storage.

2. **Las credenciales de Firebase estan en `src/firebase.js`**. Para produccion, moverlas a `.env` y usar `import.meta.env.VITE_*`.

3. **El chatId se forma con los UIDs ordenados**: `[uid1, uid2].sort().join("_")`. Esto garantiza que la misma conversacion siempre tenga el mismo ID sin importar quien la inicie.

4. **El campo `unread` en Realtime Database usa `runTransaction`** para incrementos atomicos. La regla de lectura del campo `unread` es publica (`auth != null`) para que el sender pueda leer el conteo actual del receiver.

5. **Los precios se guardan como precio por tonelada**. Las equivalencias (kg, libra) se calculan al mostrar, no al guardar.

6. **La geolocalizacion requiere HTTPS** para funcionar. En `localhost` funciona, pero en HTTP puro el navegador la bloquea.

7. **El reverse geocoding usa Nominatim** (API gratuita de OpenStreetMap). Tiene limite de 1 request por segundo. No agregar llamadas masivas.

8. **El deploy a Netlify** necesita:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - El archivo `public/_redirects` ya maneja el SPA routing

9. **El deploy de reglas de Firebase** necesita:
   - `npm install -g firebase-tools`
   - `firebase login`
   - `firebase deploy --only firestore:rules,database`
