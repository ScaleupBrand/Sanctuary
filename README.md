# Volver A Ti

Una aplicación diseñada para el acompañamiento y regulación emocional, enfocada en el bienestar personal.

## Características Principales

- **Onboarding Personalizado**: Flujo de bienvenida para configurar el perfil del usuario (nombre, avatar y horarios).
- **Registro de Estado de Ánimo**: Sistema de check-in diario para monitorear la energía y el estado emocional.
- **Panel de Control (Dashboard)**: Visualización de tendencias semanales y acceso rápido a herramientas de regulación.
- **Gestión de Crisis (Botón de Brote)**: Acceso inmediato a recursos de calma durante momentos difíciles.
- **Historial y Seguimiento**: Registro detallado de la evolución emocional del usuario.

## Tecnologías Utilizadas

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Lucide React.
- **Backend/Base de Datos**: Supabase (PostgreSQL, Auth, RLS).
- **Estilo**: Shadcn UI para componentes consistentes y accesibles.

## Configuración del Proyecto

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Variables de Entorno**:
   Crea un archivo `.env.local` con las siguientes claves:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```

3. **Ejecutar en Desarrollo**:
   ```bash
   npm run dev
   ```

4. **Base de Datos**:
   Las migraciones se encuentran en la carpeta `supabase/migrations`. Puedes aplicarlas usando el CLI de Supabase o directamente en el SQL Editor de tu proyecto.

## Despliegue

Recomendado usar [Vercel](https://vercel.com) para un despliegue optimizado con Next.js.
