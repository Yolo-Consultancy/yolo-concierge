# YOLO — Architecture Backend (Node.js + Express + MongoDB)

Ce document décrit l'architecture proposée pour le backend de la plateforme **YOLO Le Concierge**.
Le frontend (TanStack Start + React) est déjà prêt à se brancher : il suffit de renseigner
`adminConfig.apiBaseUrl` dans `src/config/admin.ts` puis de remplacer les appels du store
local (`src/lib/admin/store.ts`) par les helpers de `src/lib/api/client.ts`.

---

## 1. Stack technique

| Couche            | Choix                                                       |
| ----------------- | ----------------------------------------------------------- |
| Runtime           | Node.js 20+                                                 |
| Framework HTTP    | Express 4                                                   |
| Base de données   | MongoDB 6 + Mongoose                                        |
| Auth              | JWT (access + refresh) + bcrypt                             |
| Validation        | Zod ou Joi                                                  |
| Upload fichiers   | Multer + Cloudinary (ou S3 / disque local en dev)           |
| Logs              | Pino + pino-http                                            |
| Tests             | Vitest / Jest + Supertest                                   |
| Sécurité          | helmet, cors, express-rate-limit, express-mongo-sanitize    |
| Process manager   | PM2 (prod) / nodemon (dev)                                  |
| Variables d'env   | dotenv                                                      |

---

## 2. Arborescence proposée

```
yolo-backend/
├── src/
│   ├── config/
│   │   ├── env.js              # chargement & validation des .env
│   │   ├── db.js               # connexion Mongoose
│   │   └── cloudinary.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.validators.js
│   │   ├── users/              # équipe YOLO
│   │   ├── clients/            # CRM clients finaux
│   │   ├── vehicles/
│   │   ├── drivers/            # chauffeurs
│   │   ├── bookings/           # réservations
│   │   ├── missions/
│   │   ├── settings/
│   │   ├── uploads/
│   │   └── stats/
│   ├── middlewares/
│   │   ├── auth.middleware.js  # vérifie JWT + rôle
│   │   ├── error.middleware.js
│   │   ├── validate.middleware.js
│   │   └── upload.middleware.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   └── pagination.js
│   ├── app.js                  # instance Express (middlewares + routes)
│   └── server.js               # bootstrap (connect DB puis listen)
├── tests/
├── uploads/                    # si stockage local
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 3. Variables d'environnement (`.env.example`)

```env
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017/yolo

JWT_ACCESS_SECRET=change-me
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=change-me-too
JWT_REFRESH_EXPIRES=7d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

ADMIN_BOOTSTRAP_EMAIL=admin@yolo.cd
ADMIN_BOOTSTRAP_PASSWORD=yolo2026
```

---

## 4. Modèles MongoDB (Mongoose)

Tous les modèles incluent `timestamps: true` (createdAt / updatedAt).

### 4.1 User (équipe interne)
```js
{
  name: String,
  email: { type: String, unique: true, lowercase: true, required: true },
  passwordHash: String,
  role: { type: String, enum: ["admin", "agent", "chauffeur"], default: "agent" },
  active: { type: Boolean, default: true },
  refreshTokenHash: String,
}
```

### 4.2 Client (CRM)
```js
{
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  notes: String,
  totalBookings: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
}
```

### 4.3 Vehicle
Reproduit le type `Vehicle` du frontend (`src/lib/vehicles.ts`).
```js
{
  slug: { type: String, unique: true },   // ex: "ferrari-488"
  name: String,
  brand: String,
  year: Number,
  category: String,                       // "Supercar", "SUV", ...
  location: String,
  pricePerDay: Number,
  image: String,                          // image principale
  gallery: [String],                      // 6+ URLs (angles + intérieur)
  specs: { hp: Number, seats: Number, transmission: String, fuel: String },
  description: String,
  conditions: { deposit: String, minAge: String, licenseYears: String, dailyKm: String },
  keyStats: { power: String, zeroTo100: String, topSpeed: String, fuel: String },
  performance: { hp: String, torque: String, zeroTo100: String, topSpeed: String },
  drivetrain: { fuel: String, transmission: String, gearbox: String },
  equipment: { seats: String, wheels: String, brakes: String, suspension: String, exterior: String, interior: String },
  active: { type: Boolean, default: true },
}
```

### 4.4 Driver (chauffeur)
```js
{
  firstName: String,
  lastName: String,
  phone: String,
  photo: String,
  pricePerDay: Number,
  availability: { type: String, enum: ["disponible", "occupe", "indisponible"] },
  active: { type: Boolean, default: true },
  experienceYears: Number,
  languages: String,
  city: String,
  notes: String,
}
```

### 4.5 Booking (réservation)
```js
{
  vehicle: { type: ObjectId, ref: "Vehicle", required: true },
  vehicleName: String,                    // dénormalisé (snapshot)
  client: { type: ObjectId, ref: "Client" },
  clientName: String,
  clientPhone: String,
  startDate: Date,
  endDate: Date,
  days: Number,
  pickupLocation: String,
  dropoffLocation: String,
  withChauffeur: { type: Boolean, default: false },
  driver: { type: ObjectId, ref: "Driver" },
  driverName: String,
  vehiclePriceSnapshot: Number,
  driverPriceSnapshot: Number,
  totalPrice: Number,
  status: { type: String, enum: ["en_attente", "confirmee", "payee", "terminee", "annulee"], default: "en_attente" },
  paymentStatus: { type: String, enum: ["non_paye", "acompte", "paye"], default: "non_paye" },
}
```

### 4.6 Mission
```js
{
  booking: { type: ObjectId, ref: "Booking" },
  assignee: { type: ObjectId, ref: "User" },
  assigneeName: String,
  type: { type: String, enum: ["livraison", "chauffeur", "recuperation"] },
  scheduledAt: Date,
  status: { type: String, enum: ["a_affecter", "en_cours", "terminee"], default: "a_affecter" },
  notes: String,
}
```

### 4.7 Settings (singleton)
Un seul document — patché par l'admin.
```js
{
  companyName, whatsappNumber, contactEmail, address,
  heroTitle, heroSubtitle, depositCurrency,
}
```

### 4.8 ContactMessage (formulaire contact)
```js
{ name, email, phone, subject, message, handled: Boolean }
```

---

## 5. API REST — endpoints

Préfixe : `/api/v1`. Toutes les routes admin requièrent un JWT valide ;
les routes mutantes requièrent `role in [admin, agent]`.

### Auth (`/auth`) — public
| Méthode | Route             | Description                              |
| ------- | ----------------- | ---------------------------------------- |
| POST    | `/login`          | email + password → access + refresh JWT  |
| POST    | `/refresh`        | refresh token → nouveau access token     |
| POST    | `/logout`         | invalide le refresh token                |
| GET     | `/me`             | profil utilisateur courant               |

### Vehicles (`/vehicles`)
| Méthode | Route             | Auth      |
| ------- | ----------------- | --------- |
| GET     | `/`               | public    |
| GET     | `/:id`            | public    |
| POST    | `/`               | admin     |
| PUT     | `/:id`            | admin     |
| DELETE  | `/:id`            | admin     |
| POST    | `/:id/images`     | admin (multipart, plusieurs fichiers) |
| DELETE  | `/:id/images`     | admin (body: { url })                  |
| PATCH   | `/:id/images/order` | admin (body: { gallery: [url, ...] }) |

### Drivers (`/drivers`)
CRUD complet + `PATCH /:id/toggle-active`.
`GET /` côté client renvoie uniquement `active = true`.

### Bookings (`/bookings`)
| Méthode | Route                    | Notes                                  |
| ------- | ------------------------ | -------------------------------------- |
| POST    | `/`                      | public (création depuis le site)       |
| GET     | `/`                      | admin (filtres: status, dateFrom, dateTo, q) |
| GET     | `/:id`                   | admin                                  |
| PATCH   | `/:id/status`            | admin                                  |
| PATCH   | `/:id/assign-driver`     | admin — recalcule `totalPrice`         |
| DELETE  | `/:id`                   | admin                                  |

### Clients, Users (équipe), Missions
CRUD standard. Pour `users`, le mot de passe est hashé côté serveur, jamais renvoyé.

### Settings (`/settings`)
- `GET /` public (le site lit le hero, le whatsapp, etc.)
- `PUT /` admin

### Uploads (`/uploads`)
- `POST /` admin (multipart) → `{ url }` (Cloudinary ou `/uploads/<file>`)

### Stats (`/stats`) — admin
- `GET /overview` → KPIs (réservations du mois, CA, taux d'occupation, top véhicules)
- `GET /revenue?from=&to=` → série temporelle pour graphique
- `GET /vehicles/usage` → nombre de jours loués par véhicule

### Contact (`/contact`)
- `POST /` public — enregistre + envoie un mail (optionnel)
- `GET /` admin — liste les messages

---

## 6. Règles métier importantes

1. **Prix total** = `vehiclePriceSnapshot * days + (withChauffeur ? driverPriceSnapshot * days : 0)`.
   À recalculer côté serveur à la création et à chaque `assign-driver`.
2. **Disponibilité chauffeur** : un chauffeur ne peut pas être affecté à deux bookings actifs
   (`en_attente`, `confirmee`, `payee`) dont les plages `[startDate, endDate]` se chevauchent.
   Bloquer côté backend (même logique que `isDriverAvailableForDates` du frontend).
3. **Disponibilité véhicule** : même règle que les chauffeurs.
4. **Snapshots** : conserver `vehicleName`, `vehiclePriceSnapshot`, `driverPriceSnapshot` au moment
   du booking → les futures modifications de tarif n'altèrent pas l'historique.
5. **Soft delete** : préférer `active: false` à la suppression réelle pour véhicules / chauffeurs / users.

---

## 7. Sécurité

- **JWT** : access token court (15 min) en header `Authorization: Bearer …`,
  refresh token long (7 j) en cookie httpOnly + `SameSite=Strict`.
- **Bcrypt** (cost 12) pour les mots de passe.
- **Middlewares** : `helmet()`, `cors({ origin: CORS_ORIGIN, credentials: true })`,
  `express.json({ limit: '1mb' })`, `mongoSanitize()`, `rateLimit` sur `/auth/login`.
- **RBAC** : middleware `requireRole('admin')` etc.
- **Validation** systématique des bodies / params / query avec Zod ou Joi.
- **Logs** : pino-http en JSON ; ne jamais logger un mot de passe ou un token.
- **CORS** : autoriser uniquement le domaine du front (preview + prod).

---

## 8. Format de réponse standardisé

Succès :
```json
{ "success": true, "data": { ... } }
```

Liste paginée :
```json
{ "success": true, "data": [...], "meta": { "page": 1, "limit": 20, "total": 134 } }
```

Erreur (via `ApiError` + middleware) :
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "…", "details": [...] } }
```

---

## 9. Bootstrap

1. `npm init -y`
2. `npm i express mongoose dotenv cors helmet morgan pino pino-http bcryptjs jsonwebtoken zod multer cloudinary express-rate-limit express-mongo-sanitize cookie-parser`
3. `npm i -D nodemon vitest supertest`
4. Scripts `package.json` :
   ```json
   {
     "scripts": {
       "dev": "nodemon src/server.js",
       "start": "node src/server.js",
       "test": "vitest run",
       "seed": "node scripts/seed.js"
     }
   }
   ```
5. Au premier démarrage, le script de seed crée :
   - l'admin par défaut (`ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD`)
   - le document `Settings` initial
   - les véhicules du seed frontend (`src/lib/vehicles.ts`) pour démarrer avec du contenu.

---

## 10. Branchement avec le frontend

Dans `src/config/admin.ts` :
```ts
apiBaseUrl: "https://api.yolo.cd/api/v1",
```

Puis remplacer le corps des fonctions de `src/lib/admin/store.ts` par des appels à
`api.get / api.post / api.put / api.del` (déjà prêts dans `src/lib/api/client.ts`).
La signature de chaque fonction (`listVehicles`, `upsertBooking`, etc.) ne change pas :
le reste de l'app continue de fonctionner sans modification.

Mapping suggéré :

| Fonction frontend            | Endpoint                              |
| ---------------------------- | ------------------------------------- |
| `listVehicles()`             | `GET    /vehicles`                    |
| `upsertVehicle(v)`           | `POST   /vehicles` / `PUT /vehicles/:id` |
| `deleteVehicle(id)`          | `DELETE /vehicles/:id`                |
| `listBookings()`             | `GET    /bookings`                    |
| `updateBookingStatus(id,s)`  | `PATCH  /bookings/:id/status`         |
| `assignBookingDriver(id,d)`  | `PATCH  /bookings/:id/assign-driver`  |
| `listDrivers()`              | `GET    /drivers`                     |
| `toggleDriverActive(id)`     | `PATCH  /drivers/:id/toggle-active`   |
| `listClients()` / CRUD       | `/clients`                            |
| `listUsers()` / CRUD         | `/users`                              |
| `listMissions()` / CRUD      | `/missions`                           |
| `getSettings()` / `saveSettings()` | `/settings`                     |

---

## 11. Roadmap suggérée

1. **Sprint 1** — Setup projet, auth JWT, modèle User, route `/auth/*`.
2. **Sprint 2** — Vehicles (CRUD + upload images) + Drivers.
3. **Sprint 3** — Bookings (création publique + admin) + règles de disponibilité.
4. **Sprint 4** — Missions, Clients, Settings, Contact.
5. **Sprint 5** — Stats / dashboard + tests + déploiement (Render / Railway / VPS + MongoDB Atlas).

Bon dev ! 🚀
