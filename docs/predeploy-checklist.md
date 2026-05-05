# Checklist Predeploy · Sanctuary

Usá esta lista antes de conectar dominio y hacer deploy final.

## 1. Variables en Vercel

Obligatorias:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Recomendadas:

- `NEXT_PUBLIC_SITE_URL`: dominio final con `https://`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NEXT_PUBLIC_SUPPORT_WHATSAPP`: solo números, sin espacios
- `DEFAULT_THERAPIST_EMAIL`: email de Almudena o terapeuta principal

Validación local:

```bash
npm run predeploy
```

## 2. Supabase Auth

En Supabase → Authentication → URL Configuration:

- Site URL: dominio final, por ejemplo `https://tudominio.com`
- Redirect URLs:
  - `https://tudominio.com/login`
  - `https://tudominio.com/registro`
  - `https://tudominio.com/cambiar-password`
  - `http://localhost:3000/login`
  - `http://localhost:3000/registro`
  - `http://localhost:3000/cambiar-password`

## 3. Base de datos y Storage

En producción, correr todas las migraciones `001` a `016` en orden.

Confirmar buckets:

- `avatars`: público, para fotos de perfil.
- `recursos`: público, para audios de regulación.

La migration `016_production_readiness.sql` refuerza:

- Clientas inactivas conservan datos, pero no pueden seguir escribiendo registros.
- Herramientas activas no quedan visibles para usuarios anónimos por RLS de tabla.
- Buckets `avatars` y `recursos` existen en producción.

## 4. Flujos a probar con datos reales

Clienta nueva:

- Registro.
- Estado pendiente y pantalla bloqueada.
- Aprobación desde `/terapeuta/accesos`.
- Onboarding obligatorio.
- Inicio normal.

Clienta activa:

- Check-in diario.
- Registro de brote.
- Historial.
- Regulación.
- Preparar sesión.

Terapeuta/admin:

- Login.
- Accesos: aprobar, rechazar, generar enlace y revocar acceso.
- Clientas.
- Detalle de clienta.
- Agenda: crear/cancelar sesión.
- Biblioteca: crear recurso, activar/pausar, eliminar.

## 5. Revisión visual

- Desktop y móvil en panel de clienta.
- Desktop en panel terapeuta.
- Estados vacíos.
- Página 404.
- Página de error.
- Favicon/metadata en navegador.

## 6. V2, no bloquear deploy

- Panel admin de métricas.
- Mensajería.
- Comunidad.
- Recordatorios inteligentes.
- Analytics avanzados.
