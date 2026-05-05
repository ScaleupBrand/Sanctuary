'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type TherapistActionState = {
  error?: string
  success?: string
}

export type BibliotecaResourcePayload = {
  id: string
  nombre: string
  tipo: string | null
  categoria: string | null
  duracion: number | null
  archivo_url: string | null
  contenido: string | null
  activa: boolean | null
}

export type BibliotecaActionState = TherapistActionState & {
  resource?: BibliotecaResourcePayload
  id?: string
  activa?: boolean
}

const herramientaTipos = ['audio', 'practica', 'checklist', 'protocolo', 'video'] as const
const herramientaCategorias = ['respiracion', 'enraizamiento', 'movimiento', 'meditacion', 'regulacion', 'emergencia'] as const
const bibliotecaCategorias = ['respiracion', 'enraizamiento', 'movimiento'] as const

async function requireTherapist() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { supabase, userId: null, error: 'Necesitás iniciar sesión.' }

  const { data: profile } = await supabase
    .from('users')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (profile?.rol !== 'terapeuta' && profile?.rol !== 'admin') {
    return { supabase, userId: null, error: 'No tenés permisos para esta acción.' }
  }

  return { supabase, userId: user.id, error: null }
}

export async function saveSupervisionNote(
  _previousState: TherapistActionState,
  formData: FormData
): Promise<TherapistActionState> {
  const contenido = String(formData.get('contenido') ?? '').trim()

  if (!contenido) return { error: 'Escribí una nota antes de guardar.' }
  if (contenido.length > 3000) return { error: 'La nota es demasiado larga.' }

  const { supabase, userId, error: authError } = await requireTherapist()
  if (authError || !userId) return { error: authError ?? 'No se pudo validar tu sesión.' }

  const { error } = await supabase.from('notas_supervision').insert({
    terapeuta_id: userId,
    contenido,
  })

  if (error) {
    console.error('Error saving supervision note:', error)
    return { error: 'No se pudo guardar la nota.' }
  }

  revalidatePath('/terapeuta/dashboard')
  return { success: 'Nota guardada.' }
}

export async function createHerramienta(
  _previousState: TherapistActionState,
  formData: FormData
): Promise<TherapistActionState> {
  const nombre = String(formData.get('nombre') ?? '').trim()
  const tipo = String(formData.get('tipo') ?? 'audio')
  const categoria = String(formData.get('categoria') ?? 'regulacion')
  const duracionValue = String(formData.get('duracion') ?? '').trim()
  const faseValue = String(formData.get('fase_metodo') ?? '').trim()
  const archivoUrl = String(formData.get('archivo_url') ?? '').trim()
  const contenido = String(formData.get('contenido') ?? '').trim()

  if (!nombre) return { error: 'Poné un nombre para la herramienta.' }
  if (!herramientaTipos.includes(tipo as (typeof herramientaTipos)[number])) {
    return { error: 'Elegí un tipo de herramienta válido.' }
  }
  if (!herramientaCategorias.includes(categoria as (typeof herramientaCategorias)[number])) {
    return { error: 'Elegí una sección válida.' }
  }

  const duracion = duracionValue ? Number(duracionValue) : null
  const faseMetodo = faseValue ? Number(faseValue) : null

  if (duracion !== null && (!Number.isInteger(duracion) || duracion < 1 || duracion > 180)) {
    return { error: 'La duración debe estar entre 1 y 180 minutos.' }
  }

  if (faseMetodo !== null && (!Number.isInteger(faseMetodo) || faseMetodo < 1 || faseMetodo > 4)) {
    return { error: 'La fase debe estar entre 1 y 4.' }
  }

  const { supabase, error: authError } = await requireTherapist()
  if (authError) return { error: authError }

  const { error } = await supabase.from('herramientas').insert({
    nombre,
    tipo,
    categoria,
    duracion,
    fase_metodo: faseMetodo,
    archivo_url: archivoUrl || null,
    contenido: contenido || null,
    activa: true,
  })

  if (error) {
    console.error('Error creating herramienta:', error)
    return { error: 'No se pudo crear la herramienta.' }
  }

  revalidatePath('/terapeuta/dashboard')
  return { success: 'Herramienta creada.' }
}

export async function toggleHerramienta(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const activa = String(formData.get('activa') ?? '') === 'true'

  if (!id) return

  const { supabase, error: authError } = await requireTherapist()
  if (authError) return

  const { error } = await supabase
    .from('herramientas')
    .update({ activa: !activa })
    .eq('id', id)

  if (error) {
    console.error('Error toggling herramienta:', error)
    return
  }

  revalidatePath('/terapeuta/dashboard')
  revalidatePath('/terapeuta/biblioteca')
  revalidatePath('/regulacion')
}

function isValidVideoUrl(value: string) {
  try {
    const url = new URL(value)
    const hostname = url.hostname.replace(/^www\./, '')

    return hostname === 'youtube.com'
      || hostname === 'youtu.be'
      || hostname === 'vimeo.com'
      || hostname.endsWith('.vimeo.com')
  } catch {
    return false
  }
}

function getStoragePathFromPublicUrl(publicUrl: string | null) {
  if (!publicUrl) return null

  const marker = '/storage/v1/object/public/recursos/'
  const [, path] = publicUrl.split(marker)

  return path ? decodeURIComponent(path) : null
}

export async function createBibliotecaResource(formData: FormData): Promise<BibliotecaActionState> {
  const nombre = String(formData.get('nombre') ?? '').trim()
  const categoria = String(formData.get('categoria') ?? 'respiracion')
  const tipo = String(formData.get('tipo') ?? 'practica')
  const duracionValue = String(formData.get('duracion') ?? '').trim()
  const contenido = String(formData.get('contenido') ?? '').trim()
  const videoUrl = String(formData.get('video_url') ?? '').trim()
  const archivo = formData.get('archivo')

  if (!nombre) return { error: 'Poné un nombre para el recurso.' }
  if (!bibliotecaCategorias.includes(categoria as (typeof bibliotecaCategorias)[number])) {
    return { error: 'Elegí una categoría válida.' }
  }
  if (tipo !== 'audio' && tipo !== 'practica' && tipo !== 'video') {
    return { error: 'Elegí Audio, Guía de texto o Link de video.' }
  }

  const duracion = duracionValue ? Number(duracionValue) : null
  if (duracion !== null && (!Number.isInteger(duracion) || duracion < 1 || duracion > 180)) {
    return { error: 'La duración debe estar entre 1 y 180 minutos.' }
  }

  const { supabase, userId, error: authError } = await requireTherapist()
  if (authError || !userId) return { error: authError ?? 'No se pudo validar tu sesión.' }

  let archivoUrl: string | null = null

  if (tipo === 'audio') {
    if (!(archivo instanceof File) || archivo.size === 0) {
      return { error: 'Subí un archivo de audio para este recurso.' }
    }

    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/m4a']
    const extension = archivo.name.split('.').pop()?.toLowerCase()

    if (!allowedAudioTypes.includes(archivo.type) && extension !== 'mp3' && extension !== 'm4a') {
      return { error: 'Subí un archivo mp3 o m4a.' }
    }

    const safeExtension = archivo.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'audio'
    const filePath = `${userId}/${crypto.randomUUID()}.${safeExtension}`

    const { error: uploadError } = await supabase.storage
      .from('recursos')
      .upload(filePath, archivo, {
        contentType: archivo.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading resource file:', uploadError)
      return { error: 'No se pudo subir el archivo. Revisá que exista el bucket recursos.' }
    }

    const { data: publicUrl } = supabase.storage.from('recursos').getPublicUrl(filePath)
    archivoUrl = publicUrl.publicUrl
  }

  if (tipo === 'practica' && !contenido) {
    return { error: 'Escribí los pasos de la guía de texto.' }
  }

  if (tipo === 'video') {
    if (!videoUrl) return { error: 'Pegá un link de YouTube o Vimeo.' }
    if (!isValidVideoUrl(videoUrl)) return { error: 'El link debe ser de YouTube o Vimeo.' }

    archivoUrl = videoUrl
  }

  const { data: resource, error } = await supabase
    .from('herramientas')
    .insert({
      nombre,
      tipo,
      categoria,
      duracion,
      fase_metodo: 2,
      archivo_url: archivoUrl,
      contenido: contenido || null,
      activa: true,
    })
    .select('id, nombre, tipo, categoria, duracion, archivo_url, contenido, activa')
    .single()

  if (error) {
    console.error('Error creating biblioteca resource:', error)
    return { error: 'No se pudo crear el recurso.' }
  }

  revalidatePath('/terapeuta/biblioteca')
  revalidatePath('/terapeuta/dashboard')
  revalidatePath('/regulacion')
  return { success: 'Recurso creado.', resource: resource as BibliotecaResourcePayload }
}

export async function setBibliotecaResourceActive(id: string, activa: boolean): Promise<BibliotecaActionState> {
  if (!id) return { error: 'No se encontró el recurso.' }

  const { supabase, error: authError } = await requireTherapist()
  if (authError) return { error: authError }

  const { data, error } = await supabase
    .from('herramientas')
    .update({ activa })
    .eq('id', id)
    .select('id, activa')
    .single()

  if (error) {
    console.error('Error setting resource active state:', error)
    return { error: 'No se pudo actualizar el estado.' }
  }

  revalidatePath('/terapeuta/biblioteca')
  revalidatePath('/regulacion')
  return { success: activa ? 'Recurso activado.' : 'Recurso pausado.', id: data.id, activa: Boolean(data.activa) }
}

export async function deleteBibliotecaResource(id: string): Promise<BibliotecaActionState> {
  if (!id) return { error: 'No se encontró el recurso.' }

  const { supabase, error: authError } = await requireTherapist()
  if (authError) return { error: authError }

  const { data: resource } = await supabase
    .from('herramientas')
    .select('id, archivo_url, tipo')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('herramientas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting biblioteca resource:', error)
    return { error: 'No se pudo eliminar el recurso.' }
  }

  if (resource?.tipo === 'audio') {
    const storagePath = getStoragePathFromPublicUrl(resource.archivo_url)
    if (storagePath) {
      const { error: storageError } = await supabase.storage.from('recursos').remove([storagePath])
      if (storageError) console.error('Error deleting resource file:', storageError)
    }
  }

  revalidatePath('/terapeuta/biblioteca')
  revalidatePath('/terapeuta/dashboard')
  revalidatePath('/regulacion')
  return { success: 'Recurso eliminado.', id }
}
