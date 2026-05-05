import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

function loadLocalEnvFile(filename) {
  const path = join(process.cwd(), filename)
  if (!existsSync(path)) return

  const content = readFileSync(path, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) continue

    const key = trimmed.slice(0, equalsIndex).trim()
    const rawValue = trimmed.slice(equalsIndex + 1).trim()
    const value = rawValue.replace(/^['"]|['"]$/g, '')

    if (key && !process.env[key]) process.env[key] = value
  }
}

loadLocalEnvFile('.env')
loadLocalEnvFile('.env.local')

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

const recommended = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SUPPORT_EMAIL',
  'NEXT_PUBLIC_SUPPORT_WHATSAPP',
  'DEFAULT_THERAPIST_EMAIL',
]

const missingRequired = required.filter((key) => !process.env[key])
const missingRecommended = recommended.filter((key) => !process.env[key])

if (missingRequired.length > 0) {
  console.error(`Faltan variables obligatorias: ${missingRequired.join(', ')}`)
  process.exit(1)
}

if (missingRecommended.length > 0) {
  console.warn(`Variables recomendadas sin configurar: ${missingRecommended.join(', ')}`)
}

console.log('Variables de entorno mínimas listas para deploy.')
