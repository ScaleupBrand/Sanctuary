'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { WeeklyChartPoint } from '@/lib/actions/historial'

type ChartTooltipProps = {
  active?: boolean
  payload?: Array<{ payload?: WeeklyChartPoint }>
  label?: string | number
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  const point = payload[0]?.payload as WeeklyChartPoint | undefined

  return (
    <div className="rounded-lg border-[0.5px] border-outline-variant bg-surface-container-lowest px-4 py-3 shadow-[0_8px_24px_rgba(34,25,26,0.08)]">
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-outline">
        {point?.dateLabel ?? label}
      </p>
      {point?.registered ? (
        <div className="flex flex-col gap-1 text-[14px] leading-[20px] text-on-surface-variant">
          <span>Energía: {point.energia ?? '-'}/5</span>
          <span>Dolor: {point.dolor ?? '-'}/5</span>
        </div>
      ) : (
        <p className="text-[14px] leading-[20px] text-on-surface-variant">Sin registro ese día</p>
      )}
    </div>
  )
}

export function WeeklyHistoryChart({ data }: { data: WeeklyChartPoint[] }) {
  const hasRegistrations = data.some((point) => point.registered)

  return (
    <div className="rounded-xl border-[0.5px] border-outline-variant bg-surface-container-low p-4 md:p-6 shadow-[0_12px_32px_rgba(142,53,74,0.04)]">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-background">
            Últimos 7 días
          </h3>
          <p className="mt-1 text-[15px] leading-[22px] text-on-surface-variant">
            Energía y dolor registrados en tus check-ins.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary" />
            Energía
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-secondary" />
            Dolor
          </span>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="rgba(135,114,116,0.22)" vertical={false} />
            <XAxis
              dataKey="dayLabel"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              stroke="#877274"
              fontSize={12}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              stroke="#877274"
              fontSize={12}
              width={34}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(135,114,116,0.25)' }} />
            <Line
              type="monotone"
              dataKey="energia"
              name="Energía"
              stroke="#701e34"
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff8f7' }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="dolor"
              name="Dolor"
              stroke="#7a5642"
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff8f7' }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {!hasRegistrations && (
        <p className="mt-4 text-[15px] leading-[22px] text-on-surface-variant">
          Todavía no hay registros suficientes para dibujar la semana. Cuando aparezcan, los veremos aquí con calma.
        </p>
      )}
    </div>
  )
}
