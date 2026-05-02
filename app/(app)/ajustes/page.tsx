import { getAjustesData } from '@/lib/actions/ajustes'
import AjustesClient from './AjustesClient'

export default async function AjustesPage() {
  const data = await getAjustesData()
  return <AjustesClient initialData={data} />
}
