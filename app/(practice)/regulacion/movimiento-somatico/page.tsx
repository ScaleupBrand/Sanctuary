import { RegulationPracticePage } from '@/components/regulacion/RegulationPracticePage'

export const dynamic = 'force-dynamic'

export default async function MovimientoSomaticoPage({
  searchParams,
}: {
  searchParams: Promise<{ h?: string }>
}) {
  const params = await searchParams

  return <RegulationPracticePage category="movimiento" herramientaId={params.h} />
}
