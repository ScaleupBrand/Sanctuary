import { RegulationPracticePage } from '@/components/regulacion/RegulationPracticePage'

export const dynamic = 'force-dynamic'

export default async function EnraizamientoPage({
  searchParams,
}: {
  searchParams: Promise<{ h?: string }>
}) {
  const params = await searchParams

  return <RegulationPracticePage category="enraizamiento" herramientaId={params.h} />
}
