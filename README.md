# Task Manager — Backend

API REST construida con Express y TypeScript, desplegada como Firebase Cloud Function v2. Forma parte del challenge técnico fullstack de Atom.

## Comentarios sobre el desarrollo

Apliqué Clean Architecture desde el inicio para mantener el dominio completamente desacoplado de Express y Firebase. Esto hace que los casos de uso sean fáciles de testear en aislamiento y que un cambio de base de datos o framework no toque la lógica de negocio.

Separé `app.ts` de `index.ts` para que la app de Express pueda importarse en los tests sin que Firebase Admin intente conectarse a la nube. Sin esa separación los tests de integración con Supertest romperían al inicializar.

Para el manejo de errores en los casos de uso usé un patrón de unión discriminada (`TaskResult`). En lugar de lanzar excepciones, cada caso de uso retorna `{ status: 'ok' | 'not_found' | 'forbidden' }`. TypeScript obliga a manejar todos los estados en las rutas y el flujo queda explícito sin try/catch innecesarios.

Como consecuencia de la arquitectura limpia, el dominio trabaja con `Date` nativo y la conversión desde `Timestamp` de Firestore ocurre dentro del repositorio, en la capa de infraestructura.

Firebase resultó una buena elección para este tipo de aplicación: Firestore maneja la persistencia sin necesidad de configurar un servidor de base de datos, Cloud Functions v2 escala automáticamente y el deploy desde CI/CD con un solo comando simplifica bastante el proceso de entrega.

## Tecnologías

| Tecnología                  | Versión | Para qué se usa                              |
|-----------------------------|---------|----------------------------------------------|
| Node.js                     | 20      | Runtime                                      |
| TypeScript                  | 5.x     | Lenguaje principal, modo estricto            |
| Express                     | 4.x     | Manejo de rutas HTTP                         |
| Firebase Cloud Functions v2 | 7.x     | Hosting de la API en la nube                 |
| Firebase Admin / Firestore  | 13.x    | Base de datos NoSQL                          |
| jsonwebtoken                | 9.x     | Autenticación con JWT (7 días de expiración) |
| Jest + Supertest            | 29.x    | Tests unitarios e integración                |

## Estructura del proyecto

La API sigue **Clean Architecture**: las dependencias fluyen siempre hacia adentro, el dominio no conoce nada de Express ni de Firebase.

```
functions/src/
├── config/
│   ├── firebase.config.ts     # Inicialización del Admin SDK y converter tipado para Firestore
│   └── jwt.config.ts          # Funciones para firmar y verificar tokens
│
├── domain/                    # El corazón — sin imports externos
│   ├── models/
│   │   ├── task.model.ts      # Entidad Task, DTOs y tipos de resultado (TaskResult)
│   │   └── user.model.ts      # Entidad User y DTO de creación
│   └── repositories/
│       ├── task.repository.ts # Contrato que define qué puede hacer el repo de tareas
│       └── user.repository.ts # Contrato que define qué puede hacer el repo de usuarios
│
├── application/
│   └── use-cases/             # Cada caso de uso hace una sola cosa
│       ├── login-user.use-case.ts
│       ├── register-user.use-case.ts
│       ├── get-tasks.use-case.ts
│       ├── create-task.use-case.ts
│       ├── update-task.use-case.ts
│       └── delete-task.use-case.ts
│
├── infrastructure/
│   └── firestore/             # Implementación concreta de los repositorios con Firestore
│       ├── task.document.ts
│       ├── task.firestore.repository.ts
│       ├── user.document.ts
│       └── user.firestore.repository.ts
│
├── presentation/
│   ├── middlewares/
│   │   └── auth.middleware.ts # Valida el Bearer token antes de llegar a las rutas
│   └── routes/
│       ├── user.routes.ts     # GET /users?email=  y  POST /users
│       └── task.routes.ts     # CRUD completo de /tasks (requiere auth)
│
├── app.ts                     # Monta Express sin tocar Firebase — útil para tests
└── index.ts                   # Entry point que envuelve la app en una Cloud Function
```

## Por qué estas decisiones

**`app.ts` separado de `index.ts`** — al tener la app de Express en su propio archivo, los tests pueden importarla sin que Firebase Admin intente conectarse a la nube. Esto hace los tests más rápidos y sin dependencias externas.

**Entidades con `Date`, no `Timestamp`** — el dominio trabaja con tipos nativos de JavaScript. La conversión de `Firestore.Timestamp` a `Date` ocurre en la capa de infraestructura, así el resto del código no sabe nada de Firebase.

**`TaskResult` como unión discriminada** — en lugar de lanzar excepciones, los casos de uso devuelven `{ status: 'ok' | 'not_found' | 'forbidden' }`. Hace el flujo de errores explícito y fácil de manejar en las rutas.

**CORS restringido** — solo acepta peticiones desde `localhost:4200` y los dominios de Firebase Hosting. No se usa `origin: true` en producción.

## Endpoints

### Usuarios — sin autenticación

| Método | Ruta            | Descripción                                     |
|--------|-----------------|-------------------------------------------------|
| `GET`  | `/users?email=` | Busca un usuario por correo y devuelve su token |
| `POST` | `/users`        | Crea un nuevo usuario y devuelve su token       |

### Tareas — requieren Bearer token

| Método   | Ruta         | Descripción                                    |
|----------|--------------|------------------------------------------------|
| `GET`    | `/tasks`     | Lista todas las tareas del usuario autenticado |
| `POST`   | `/tasks`     | Crea una nueva tarea (`title` requerido)       |
| `PUT`    | `/tasks/:id` | Actualiza una tarea (solo el propietario)      |
| `DELETE` | `/tasks/:id` | Elimina una tarea (solo el propietario)        |

### Códigos de respuesta

| Código | Cuándo ocurre                       |
|--------|-------------------------------------|
| `200`  | Consulta o actualización exitosa    |
| `201`  | Recurso creado correctamente        |
| `204`  | Eliminación exitosa                 |
| `400`  | Datos faltantes o inválidos         |
| `401`  | Token ausente o inválido            |
| `403`  | El recurso pertenece a otro usuario |
| `404`  | Recurso no encontrado               |
| `409`  | El usuario ya existe                |

## Cómo correrlo localmente

```bash
cd functions
npm install
npm run serve
```

La API queda disponible en:
```
http://localhost:5001/task-manager-app-900fc/us-central1/api
```

> Necesitas tener Firebase CLI instalado: `npm install -g firebase-tools`

## Tests

```bash
cd functions
npm test                 # Corre todos los tests
npm run test:coverage    # Genera reporte de cobertura en /coverage
```

Los casos de uso se testean con repositorios mockeados, sin conexión a Firebase. Las rutas se testean con `supertest` montando la app completa.

## Build y deploy

```bash
cd functions
npm run build                        # Compila TypeScript a /lib
firebase deploy --only functions     # Deploy manual
```

El pipeline CI/CD en `.github/workflows/ci.yml` hace esto automáticamente en cada push a `main`.

## Variables de entorno

Crear un archivo `functions/.env` con:

```
JWT_SECRET=tu-secreto-aqui
```

En producción se configura desde Firebase Console → Functions → Configuration.
